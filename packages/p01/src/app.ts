import "dotenv/config";

import express from "express";
import { HttpError, isHttpError } from "./middleware/errors";

const app = express();
app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("/boom", (_req, _res, next) => {
  next(new HttpError(500, "Internal Server Error"));
});

// 404 handler
app.use((_req, _res, next) => {
  next(new HttpError(404, "Not Found"));
});

// error handler
app.use(
  (
    err: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    const statusCode = isHttpError(err) ? err.statusCode : 500;

    const message =
      err instanceof Error ? err.message : "Internal Server Error";
    res.status(statusCode).json({ error: message });
  },
);

export { app };
