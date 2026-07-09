/** Internal constructor options for errors created from failed API responses. */
export interface ElateApiErrorOptions {
  /** HTTP response status code. */
  status: number;
  /** HTTP response status text from the server or runtime. */
  statusText: string;
  /** Response headers converted into a plain object for easier inspection. */
  headers: Record<string, string>;
  /** Parsed JSON error payload when available; otherwise the raw response text. */
  body: unknown;
  /** Raw response text captured before JSON parsing. */
  text: string;
}

/**
 * Error thrown for non-2xx responses from the Elate API.
 *
 * The original response body is preserved so callers can inspect validation
 * errors and other structured API payloads without losing HTTP context.
 */
export class ElateApiError extends Error {
  readonly status: number;
  readonly statusText: string;
  readonly headers: Record<string, string>;
  readonly body: unknown;
  readonly text: string;

  constructor(options: ElateApiErrorOptions) {
    super(
      `Elate API request failed with ${options.status} ${options.statusText}`.trim(),
    );
    this.name = "ElateApiError";
    this.status = options.status;
    this.statusText = options.statusText;
    this.headers = options.headers;
    this.body = options.body;
    this.text = options.text;
  }
}
