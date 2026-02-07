import type { NextFunction, Request, Response } from "express";
import { isHttpError, PUBLIC_ERROR_MESSAGES } from "../errors/httpError";
import { logger } from "../appLogger";

function getRequestId(req: Request, res: Response): string | undefined {
  if (typeof req.requestId === "string") return req.requestId;

  const headerRid = res.getHeader("x-request-id");
  if (typeof headerRid === "string") return headerRid;
  if (Array.isArray(headerRid) && typeof headerRid[0] === "string")
    return headerRid[0];

  return undefined;
}

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (res.headersSent) return next(err);

  const requestId = getRequestId(req, res);

  let status = 500;
  let publicMessage = PUBLIC_ERROR_MESSAGES[500];

  if (isHttpError(err)) {
    status = err.status;
    publicMessage = err.publicMessage;
  }

  // IMPORTANT: your Logger signature is (msg, meta)
  logger.error("request error", {
    requestId,
    status,
    method: req.method,
    path: req.path,
    err,
  });

  return res.status(status).json({ error: publicMessage });
}
