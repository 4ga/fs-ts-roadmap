import type { RequestHandler } from "express";
import { z } from "zod";

type Schemas = {
  body?: z.ZodType;
  params?: z.ZodType;
  query?: z.ZodType;
};

export function validate(schemas: Schemas): RequestHandler {
  return (req, res, next) => {
    const validated: { body?: unknown; params?: unknown; query?: unknown } = {};

    if (schemas.body) {
      const result = schemas.body.safeParse(req.body);
      if (!result.success)
        return res.status(400).json({ error: "Bad Request" });
      validated.body = result.data;
    }

    if (schemas.params) {
      const result = schemas.params.safeParse(req.params);
      if (!result.success)
        return res.status(400).json({ error: "Bad Request" });
      validated.params = result.data;
    }

    if (schemas.query) {
      const result = schemas.query.safeParse(req.query);
      if (!result.success)
        return res.status(400).json({ error: "Bad Request" });
      validated.query = result.data;
    }

    req.validated = validated;

    next();
  };
}
