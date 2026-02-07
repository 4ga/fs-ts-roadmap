export const PUBLIC_ERROR_MESSAGES: Record<number, string> = {
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not Found",
  409: "Conflict",
  429: "Too Many Requests",
  500: "Internal Server Error",
};

export class HttpError extends Error {
  public readonly status: number;
  public readonly publicMessage: string;

  constructor(status: number) {
    super();
    this.name = "HttpError";
    this.status = status;

    if (PUBLIC_ERROR_MESSAGES[status]) {
      this.publicMessage = PUBLIC_ERROR_MESSAGES[status];
    } else {
      this.status = 500;
      this.publicMessage = PUBLIC_ERROR_MESSAGES[this.status];
    }
  }
}

export function isHttpError(err: unknown): err is HttpError {
  return err instanceof HttpError;
}
