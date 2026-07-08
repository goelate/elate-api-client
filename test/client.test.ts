import { afterEach, describe, expect, it, vi } from "vitest";
import { ElateClient, ElateApiError } from "../src";

function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "content-type": "application/json" },
    ...init,
  });
}

function createFetch(response: Response): typeof fetch {
  return vi.fn(async () => response) as unknown as typeof fetch;
}

function firstFetchCall(fetchImpl: typeof fetch): [string, RequestInit] {
  const mock = vi.mocked(fetchImpl);
  const call = mock.mock.calls[0];

  if (!call) {
    throw new Error("Expected fetch to be called");
  }

  return call as [string, RequestInit];
}

describe("ElateClient", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends auth headers and bracketed pagination query parameters", async () => {
    const fetchImpl = createFetch(
      jsonResponse({
        entity: "objectives",
        results: [],
        metadata: { page: 0, limit: 25 },
      }),
    );
    const client = new ElateClient({
      baseUrl: "https://api.goelate.com",
      apiKey: "test-key",
      fetch: fetchImpl,
      maxRetries: 0,
    });

    await client.objectives.list({
      start: "2026-01-01",
      end: "2026-03-31",
      page: 0,
      limit: 25,
    });

    const [url, init] = firstFetchCall(fetchImpl);
    const headers = init.headers as Headers;

    expect(url).toBe(
      "https://api.goelate.com/api/v1/objectives?start=2026-01-01&end=2026-03-31&page%5Bpage%5D=0&page%5Blimit%5D=25",
    );
    expect(init.method).toBe("GET");
    expect(headers.get("authorization")).toBe("Bearer test-key");
    expect(headers.get("accept")).toBe("application/json");
  });

  it("serializes JSON request bodies", async () => {
    const fetchImpl = createFetch(
      jsonResponse(
        { entity: "themes", results: { id: 1, name: "Growth" } },
        { status: 201 },
      ),
    );
    const client = new ElateClient({
      baseUrl: "https://api.goelate.com",
      apiKey: "test-key",
      fetch: fetchImpl,
      maxRetries: 0,
    });

    await client.themes.create({ theme: { name: "Growth" } });

    const [, init] = firstFetchCall(fetchImpl);
    const headers = init.headers as Headers;

    expect(init.method).toBe("POST");
    expect(headers.get("content-type")).toBe("application/json");
    expect(init.body).toBe(JSON.stringify({ theme: { name: "Growth" } }));
  });

  it("preserves caller-provided accept headers", async () => {
    const fetchImpl = createFetch(
      jsonResponse({ entity: "users", results: [] }),
    );
    const client = new ElateClient({
      baseUrl: "https://api.goelate.com",
      apiKey: "test-key",
      fetch: fetchImpl,
      headers: { Accept: "application/vnd.elate+json" },
      maxRetries: 0,
    });

    await client.users.list({ page: 0, limit: 25 });

    const [, init] = firstFetchCall(fetchImpl);
    const headers = init.headers as Headers;
    expect(headers.get("accept")).toBe("application/vnd.elate+json");
  });

  it("throws ElateApiError with parsed JSON body", async () => {
    const fetchImpl = createFetch(
      jsonResponse(
        { message: "Unauthorized" },
        { status: 401, statusText: "Unauthorized" },
      ),
    );
    const client = new ElateClient({
      baseUrl: "https://api.goelate.com",
      apiKey: "bad-key",
      fetch: fetchImpl,
    });

    await expect(
      client.users.list({ page: 0, limit: 25 }),
    ).rejects.toMatchObject({
      name: "ElateApiError",
      status: 401,
      body: { message: "Unauthorized" },
    });
  });

  it("preserves non-JSON error text", async () => {
    const fetchImpl = createFetch(
      new Response("Gateway timeout", {
        status: 504,
        statusText: "Gateway Timeout",
      }),
    );
    const client = new ElateClient({
      baseUrl: "https://api.goelate.com",
      apiKey: "test-key",
      fetch: fetchImpl,
      maxRetries: 0,
    });

    try {
      await client.metrics.list({
        start: "2026-01-01",
        end: "2026-03-31",
        page: 0,
        limit: 25,
      });
      throw new Error("Expected request to fail");
    } catch (error) {
      expect(error).toBeInstanceOf(ElateApiError);
      expect((error as ElateApiError).body).toBe("Gateway timeout");
      expect((error as ElateApiError).text).toBe("Gateway timeout");
    }
  });

  it("normalizes rejected fetch calls into ElateApiError", async () => {
    const cause = new TypeError("fetch failed");
    const fetchImpl = vi.fn(async () => {
      throw cause;
    }) as unknown as typeof fetch;
    const client = new ElateClient({
      baseUrl: "https://api.goelate.com",
      apiKey: "test-key",
      fetch: fetchImpl,
      maxRetries: 0,
    });

    await expect(
      client.users.list({ page: 0, limit: 25 }),
    ).rejects.toMatchObject({
      name: "ElateApiError",
      status: 0,
      statusText: "Network Error",
      body: "fetch failed",
      text: "fetch failed",
    });
  });

  it("passes an abort signal that rejects timed out requests", async () => {
    vi.useFakeTimers();
    const fetchImpl = vi.fn(
      (_url: RequestInfo | URL, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () =>
            reject(
              new DOMException("The operation was aborted.", "AbortError"),
            ),
          );
        }),
    ) as unknown as typeof fetch;
    const client = new ElateClient({
      baseUrl: "https://api.goelate.com",
      apiKey: "test-key",
      fetch: fetchImpl,
      timeoutMs: 50,
      maxRetries: 0,
    });
    try {
      const request = client.users.list({ page: 0, limit: 25 });
      const expectation = expect(request).rejects.toMatchObject({
        name: "ElateApiError",
        status: 0,
        statusText: "Timeout",
        text: "The operation was aborted.",
      });

      await vi.advanceTimersByTimeAsync(50);
      await expectation;
      expect(fetchImpl).toHaveBeenCalledOnce();
    } finally {
      vi.useRealTimers();
    }
  });

  it("does not attach an abort signal when timeout is disabled", async () => {
    const fetchImpl = vi.fn(
      async (_url: RequestInfo | URL, init?: RequestInit) => {
        expect(init?.signal).toBeUndefined();
        return jsonResponse({ entity: "users", results: [] });
      },
    ) as unknown as typeof fetch;
    const client = new ElateClient({
      baseUrl: "https://api.goelate.com",
      apiKey: "test-key",
      fetch: fetchImpl,
      timeoutMs: 0,
    });

    await expect(
      client.users.list({ page: 0, limit: 25 }),
    ).resolves.toMatchObject({ entity: "users" });
    expect(fetchImpl).toHaveBeenCalledOnce();
  });

  it("does not retry abort errors", async () => {
    const abortError = new DOMException(
      "The operation was aborted.",
      "AbortError",
    );
    const fetchImpl = vi.fn(async () => {
      throw abortError;
    }) as unknown as typeof fetch;
    const client = new ElateClient({
      baseUrl: "https://api.goelate.com",
      apiKey: "test-key",
      fetch: fetchImpl,
      maxRetries: 2,
      retryDelayMs: 0,
    });

    await expect(
      client.users.list({ page: 0, limit: 25 }),
    ).rejects.toMatchObject({
      name: "ElateApiError",
      status: 0,
      statusText: "Timeout",
      body: "The operation was aborted.",
      text: "The operation was aborted.",
    });
    expect(fetchImpl).toHaveBeenCalledOnce();
  });

  it("retries rejected fetch calls before succeeding", async () => {
    const fetchImpl = vi
      .fn()
      .mockRejectedValueOnce(new TypeError("socket hang up"))
      .mockResolvedValueOnce(
        jsonResponse({ entity: "users", results: [] }),
      ) as unknown as typeof fetch;
    const client = new ElateClient({
      baseUrl: "https://api.goelate.com",
      apiKey: "test-key",
      fetch: fetchImpl,
      maxRetries: 1,
      retryDelayMs: 0,
    });

    await expect(
      client.users.list({ page: 0, limit: 25 }),
    ).resolves.toMatchObject({ entity: "users" });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it("retries 5xx responses before succeeding", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse(
          { message: "unavailable" },
          { status: 503, statusText: "Service Unavailable" },
        ),
      )
      .mockResolvedValueOnce(
        jsonResponse({ entity: "users", results: [] }),
      ) as unknown as typeof fetch;
    const client = new ElateClient({
      baseUrl: "https://api.goelate.com",
      apiKey: "test-key",
      fetch: fetchImpl,
      maxRetries: 1,
      retryDelayMs: 0,
    });

    await expect(
      client.users.list({ page: 0, limit: 25 }),
    ).resolves.toMatchObject({ entity: "users" });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it("uses exponential backoff between retries", async () => {
    vi.useFakeTimers();
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse(
          { message: "unavailable" },
          { status: 503, statusText: "Service Unavailable" },
        ),
      )
      .mockResolvedValueOnce(
        jsonResponse(
          { message: "unavailable" },
          { status: 503, statusText: "Service Unavailable" },
        ),
      )
      .mockResolvedValueOnce(
        jsonResponse(
          { message: "unavailable" },
          { status: 503, statusText: "Service Unavailable" },
        ),
      )
      .mockResolvedValueOnce(
        jsonResponse({ entity: "users", results: [] }),
      ) as unknown as typeof fetch;
    const client = new ElateClient({
      baseUrl: "https://api.goelate.com",
      apiKey: "test-key",
      fetch: fetchImpl,
      maxRetries: 3,
      retryDelayMs: 100,
    });

    try {
      const request = client.users.list({ page: 0, limit: 25 });
      await vi.waitFor(() => expect(fetchImpl).toHaveBeenCalledTimes(1));

      await vi.advanceTimersByTimeAsync(100);
      expect(fetchImpl).toHaveBeenCalledTimes(2);

      await vi.advanceTimersByTimeAsync(100);
      expect(fetchImpl).toHaveBeenCalledTimes(2);

      await vi.advanceTimersByTimeAsync(100);
      expect(fetchImpl).toHaveBeenCalledTimes(3);

      await vi.advanceTimersByTimeAsync(300);
      expect(fetchImpl).toHaveBeenCalledTimes(3);

      await vi.advanceTimersByTimeAsync(100);
      expect(fetchImpl).toHaveBeenCalledTimes(4);
      await expect(request).resolves.toMatchObject({ entity: "users" });
    } finally {
      vi.useRealTimers();
    }
  });

  it("does not retry 5xx responses for non-idempotent requests", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse(
          { message: "unavailable" },
          { status: 503, statusText: "Service Unavailable" },
        ),
      )
      .mockResolvedValueOnce(
        jsonResponse({ entity: "themes", results: { id: 1 } }),
      ) as unknown as typeof fetch;
    const client = new ElateClient({
      baseUrl: "https://api.goelate.com",
      apiKey: "test-key",
      fetch: fetchImpl,
      maxRetries: 1,
      retryDelayMs: 0,
    });

    await expect(
      client.themes.create({ theme: { name: "Growth" } }),
    ).rejects.toMatchObject({
      name: "ElateApiError",
      status: 503,
      body: { message: "unavailable" },
    });
    expect(fetchImpl).toHaveBeenCalledOnce();
  });

  it("does not retry rejected fetch calls for non-idempotent requests", async () => {
    const cause = new TypeError("socket hang up");
    const fetchImpl = vi
      .fn()
      .mockRejectedValueOnce(cause)
      .mockResolvedValueOnce(
        jsonResponse({ entity: "themes", results: { id: 1 } }),
      ) as unknown as typeof fetch;
    const client = new ElateClient({
      baseUrl: "https://api.goelate.com",
      apiKey: "test-key",
      fetch: fetchImpl,
      maxRetries: 1,
      retryDelayMs: 0,
    });

    await expect(
      client.themes.create({ theme: { name: "Growth" } }),
    ).rejects.toMatchObject({
      name: "ElateApiError",
      status: 0,
      statusText: "Network Error",
      body: "socket hang up",
      text: "socket hang up",
    });
    expect(fetchImpl).toHaveBeenCalledOnce();
  });

  it("returns report PDF responses as ArrayBuffer", async () => {
    const bytes = new Uint8Array([37, 80, 68, 70]);
    const fetchImpl = createFetch(
      new Response(bytes, {
        status: 200,
        headers: { "content-type": "application/pdf" },
      }),
    );
    const client = new ElateClient({
      baseUrl: "https://api.goelate.com",
      apiKey: "test-key",
      fetch: fetchImpl,
    });

    const pdf = await client.reports.getPdf(123);

    expect(Array.from(new Uint8Array(pdf))).toEqual([37, 80, 68, 70]);
  });

  it("sends binary accept headers for PDF responses", async () => {
    const bytes = new Uint8Array([37, 80, 68, 70]);
    const fetchImpl = createFetch(
      new Response(bytes, {
        status: 200,
        headers: { "content-type": "application/pdf" },
      }),
    );
    const client = new ElateClient({
      baseUrl: "https://api.goelate.com",
      apiKey: "test-key",
      fetch: fetchImpl,
    });

    await client.reports.getPdf(123);

    const [, init] = firstFetchCall(fetchImpl);
    const headers = init.headers as Headers;
    expect(headers.get("accept")).toBe("*/*");
  });

  it("serializes include array query parameters", async () => {
    const fetchImpl = createFetch(
      jsonResponse({ entity: "saved_views", results: { id: 1 } }),
    );
    const client = new ElateClient({
      baseUrl: "https://api.goelate.com",
      apiKey: "test-key",
      fetch: fetchImpl,
    });

    await client.savedViews.get(1, { include: ["resource"] });

    const [url] = firstFetchCall(fetchImpl);
    expect(url).toBe(
      "https://api.goelate.com/api/v1/saved_views/1?include%5B%5D=resource",
    );
  });

  it("binds the global fetch fallback to globalThis", async () => {
    const fetchImpl = vi.fn(function (this: typeof globalThis) {
      expect(this).toBe(globalThis);
      return Promise.resolve(jsonResponse({ entity: "users", results: [] }));
    }) as unknown as typeof fetch;
    vi.stubGlobal("fetch", fetchImpl);
    const client = new ElateClient({
      baseUrl: "https://api.goelate.com",
      apiKey: "test-key",
    });

    await client.users.list({ page: 0, limit: 25 });

    expect(fetchImpl).toHaveBeenCalledOnce();
  });
});
