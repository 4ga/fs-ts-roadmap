import "dotenv/config";
import { validate } from "./middleware/validate";
import {
  createBodySchema,
  widgetSchema,
  listQuerySchema,
} from "./schemas/schemas";

import express from "express";
import { HttpError, isHttpError } from "./middleware/errors";

const app = express();

app.use(express.json());

app.post("/widgets", validate({ body: createBodySchema }), (req, res) => {
  res.status(200).json({ "ok": true, "validated": req.validated?.body });
});

app.get("/widgets/:id", validate({ params: widgetSchema }), (req, res) => {
  res.status(200).json({ "ok": true, "validated": req.validated?.params });
});

app.get("/search", validate({ query: listQuerySchema }), (req, res) => {
  res.status(200).json({ "ok": true, "validated": req.validated?.query });
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

    const message = isHttpError(err) ? err.message : "Internal Server Error";
    res.status(statusCode).json({ error: message });
  },
);

export { app };
