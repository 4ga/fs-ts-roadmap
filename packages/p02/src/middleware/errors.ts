import { z } from "zod";

export class HttpError extends Error {
  statusCode: number;
  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;

    Object.setPrototypeOf(this, HttpError.prototype);
  }
}

const HttpErrorSchema = z.object({
  statusCode: z.number().int().min(400).max(599),
  message: z.string(),
});

export function isHttpError(err: unknown): err is HttpError {
  return HttpErrorSchema.safeParse(err).success;
}
