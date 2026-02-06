import type { Request, Response, NextFunction } from "express";
import type { Logger } from "../logger";

export function httpLogger(logger: Logger) {
  return (req: Request, res: Response, next: NextFunction) => {
    const start = process.hrtime.bigint();

    res.on("finish", () => {
      const durationMs = Math.round(
        Number(process.hrtime.bigint() - start) / 1_000_000,
      );

      logger.info("http request", {
        requestId: req.requestId,
        method: req.method,
        path: req.originalUrl,
        status: res.statusCode,
        durationMs,
        headers: {
          authorization: req.get("authorization"),
          cookie: req.get("cookie"),
        },
      });
    });
    next();
  };
}
