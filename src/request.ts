import packageJson from "../package.json" with { type: "json" };
import { ElateApiError } from "./errors";

export type QueryValue = string | number | boolean | null | undefined;
export type QueryParams = Record<string, QueryValue | readonly QueryValue[]>;

/** Normalized request shape used by all resource classes. */
export interface ElateRequestOptions {
  method: "GET" | "POST" | "PATCH" | "DELETE";
  /** API path relative to the configured base URL, for example `/api/v1/users`. */
  path: string;
  /** Query parameters before URL encoding. Undefined and null values are omitted. */
  query?: QueryParams;
  /** JSON-serializable request body. */
  body?: unknown;
  /** Response parser override for non-JSON endpoints such as report PDFs. */
  responseType?: "json" | "arrayBuffer";
}

/** Configuration shared by the public client and the internal request client. */
export interface ElateRequestConfig {
  /** Origin for the Elate API, for example `https://evoke.goelate.com`. */
  baseUrl: string;
  /** API key sent as a bearer token. */
  apiKey: string;
  /** User agent string sent with every request. Defaults to `elate-api-client/<version>`. */
  userAgent?: string;
  /** Optional headers sent with every request. Authorization is always managed by the client. */
  headers?: HeadersInit;
  /** Optional fetch implementation for tests or custom runtimes. */
  fetch?: typeof fetch;
  /** Request timeout in milliseconds. Defaults to 30 seconds. */
  timeoutMs?: number;
  /** Number of retries for transient network and 5xx failures. Defaults to 2. */
  maxRetries?: number;
  /** Base retry delay in milliseconds. Defaults to 100ms. */
  retryDelayMs?: number;
}

export type ElateRequestExecutor = <T>(
  options: ElateRequestOptions,
) => Promise<T>;

/** Low-level HTTP client shared by every resource. */
export class ElateRequestClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly userAgent: string | undefined;
  private readonly headers: HeadersInit | undefined;
  private readonly fetchImpl: typeof fetch;
  private readonly timeoutMs: number;
  private readonly maxRetries: number;
  private readonly retryDelayMs: number;

  constructor(config: ElateRequestConfig) {
    this.baseUrl = config.baseUrl.replace(/\/+$/, "");
    this.apiKey = config.apiKey;
    this.userAgent =
      config.userAgent || `${packageJson.name}/${packageJson.version}`;
    this.headers = config.headers;
    this.timeoutMs = config.timeoutMs ?? 30_000;
    this.maxRetries = config.maxRetries ?? 2;
    this.retryDelayMs = config.retryDelayMs ?? 100;

    if (config.fetch) {
      this.fetchImpl = config.fetch;
    } else if (globalThis.fetch) {
      this.fetchImpl = globalThis.fetch.bind(globalThis);
    } else {
      throw new TypeError("A fetch implementation is required.");
    }
  }

  async request<T>(options: ElateRequestOptions): Promise<T> {
    // Omit `body` entirely when absent so exact optional typing matches fetch.
    const init: RequestInit = {
      method: options.method,
      headers: this.buildHeaders(options.body, options.responseType),
    };

    if (options.body !== undefined) {
      init.body = JSON.stringify(options.body);
    }

    const url = this.buildUrl(options.path, options.query);
    let response: Response;

    for (let attempt = 0; ; attempt += 1) {
      try {
        response = await this.fetchWithTimeout(url, init);
      } catch (error) {
        if (this.shouldRetryError(options.method, error, attempt)) {
          await this.waitBeforeRetry(attempt);
          continue;
        }

        throw this.createNetworkError(error);
      }

      if (
        response.ok ||
        !this.shouldRetryResponse(options.method, response, attempt)
      ) {
        break;
      }

      await this.drainResponse(response);
      await this.waitBeforeRetry(attempt);
    }

    if (!response.ok) {
      throw await this.createApiError(response);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    if (options.responseType === "arrayBuffer") {
      return (await response.arrayBuffer()) as T;
    }

    const text = await response.text();
    if (!text) return undefined as T;

    try {
      return JSON.parse(text) as T;
    } catch {
      throw new ElateApiError({
        status: response.status,
        statusText: "Invalid JSON Response",
        headers: Object.fromEntries(response.headers.entries()),
        body: text,
        text,
      });
    }
  }

  private async fetchWithTimeout(
    url: string,
    init: RequestInit,
  ): Promise<Response> {
    if (this.timeoutMs <= 0) {
      return await this.fetchImpl(url, init);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      return await this.fetchImpl(url, { ...init, signal: controller.signal });
    } finally {
      clearTimeout(timeout);
    }
  }

  private buildUrl(path: string, query: QueryParams | undefined): string {
    const url = new URL(path, `${this.baseUrl}/`);

    if (query) {
      for (const [key, value] of Object.entries(query)) {
        const values = Array.isArray(value) ? value : [value];

        for (const item of values) {
          if (item !== undefined && item !== null) {
            // Preserve API parameter names such as `page[page]` and `include[]`.
            url.searchParams.append(key, String(item));
          }
        }
      }
    }

    return url.toString();
  }

  private buildHeaders(
    body: unknown,
    responseType: ElateRequestOptions["responseType"],
  ): Headers {
    const headers = new Headers(this.headers);
    // Force managed auth headers after user-provided defaults are applied.
    headers.set("authorization", `Bearer ${this.apiKey}`);

    if (!headers.has("accept")) {
      headers.set(
        "accept",
        responseType === "arrayBuffer" ? "*/*" : "application/json",
      );
    }

    if (body !== undefined && !headers.has("content-type")) {
      headers.set("content-type", "application/json");
    }

    if (this.userAgent && !headers.has("user-agent")) {
      headers.set("user-agent", this.userAgent);
    }

    return headers;
  }

  private async createApiError(response: Response): Promise<ElateApiError> {
    const text = await response.text();
    let body: unknown = text;

    if (text) {
      try {
        // Keep structured validation errors available to SDK consumers.
        body = JSON.parse(text);
      } catch {
        body = text;
      }
    }

    return new ElateApiError({
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      body,
      text,
    });
  }

  private createNetworkError(error: unknown): ElateApiError {
    const message = error instanceof Error ? error.message : String(error);
    const statusText = this.isAbortError(error) ? "Timeout" : "Network Error";

    return new ElateApiError({
      status: 0,
      statusText,
      headers: {},
      body: message,
      text: message,
    });
  }

  private shouldRetryError(
    method: ElateRequestOptions["method"],
    error: unknown,
    attempt: number,
  ): boolean {
    return (
      method === "GET" && !this.isAbortError(error) && attempt < this.maxRetries
    );
  }

  private shouldRetryResponse(
    method: ElateRequestOptions["method"],
    response: Response,
    attempt: number,
  ): boolean {
    return (
      method === "GET" && response.status >= 500 && attempt < this.maxRetries
    );
  }

  private isAbortError(error: unknown): boolean {
    return (
      (error instanceof DOMException || error instanceof Error) &&
      (error as { name?: string }).name === "AbortError"
    );
  }

  private async drainResponse(response: Response): Promise<void> {
    try {
      // Consume the response body to allow socket reuse.
      // For successful responses, we'd normally read the body anyway.
      // For retryable 5xx responses, we must drain to release the connection.
      await response.arrayBuffer();
    } catch {
      // Ignore errors during drain (e.g., already-read body).
    }
  }

  private waitBeforeRetry(attempt: number): Promise<void> {
    const delay = this.retryDelayMs * 2 ** attempt;

    if (delay <= 0) {
      return Promise.resolve();
    }

    return new Promise((resolve) => setTimeout(resolve, delay));
  }
}
