import type { Request, Response, NextFunction } from "express";
import type { Logger } from "../logger";

export function errorLogger(logger: Logger) {
  return (err: unknown, req: Request, _res: Response, next: NextFunction) => {
    const e = err as { name?: string; message?: string };

    logger.error("request error", {
      requestId: req.requestId,
      method: req.method,
      path: req.originalUrl,
      errName: e?.name ?? "Error",
      errMessage: e?.message ?? "Unknown error",
    });

    next(err);
  };
}
