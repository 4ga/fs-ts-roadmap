import crypto from "node:crypto";
import { Request, Response, NextFunction } from "express";

export function requestId() {
  return (req: Request, res: Response, next: NextFunction) => {
    const inbound = req.get("x-request-id")?.trim();
    const id = inbound && inbound.length > 0 ? inbound : crypto.randomUUID();

    req.requestId = id;
    res.setHeader("x-request-id", id);

    next();
  };
}
