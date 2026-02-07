import express from "express";
import request from "supertest";
import { describe, it, expect } from "vitest";

import { requestId } from "../src/middleware/requestId";
import { notFound } from "../src/middleware/notFound";
import { errorHandler } from "../src/middleware/errorHandler";
import { HttpError } from "../src/errors/httpError";

function makeApp() {
  const app = express();
  app.use(requestId());

  app.get("/boom", () => {
    throw new Error("boom");
  });

  app.get("/unauth", () => {
    throw new HttpError(401);
  });

  app.use(notFound);
  app.use(errorHandler);
  return app;
}

describe("P05 global error handler", () => {
  it("Unknown route returns 404 + {error:'Not Found'} and includes x-request-id", async () => {
    const app = makeApp();
    const res = await request(app)
      .get("/does-not-exist")
      .set("x-request-id", "test-rid-123");

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "Not Found" });
    expect(res.headers["x-request-id"]).toBe("test-rid-123");

    // ensure no extra fields
    expect(Object.keys(res.body)).toEqual(["error"]);
  });

  it("Thrown Error('boom') returns 500 + {error:'Internal Server Error'} (no leaks)", async () => {
    const app = makeApp();
    const res = await request(app)
      .get("/boom")
      .set("x-request-id", "test-rid-123");

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Internal Server Error" });
    expect(res.headers["x-request-id"]).toBe("test-rid-123");
    expect(Object.keys(res.body)).toEqual(["error"]);

    // extra paranoia: ensure no stack/message fields
    expect((res.body as any).stack).toBeUndefined();
    expect((res.body as any).message).toBeUndefined();
  });

  it("HttpError(401) returns 401 + {error:'Unauthorized'}", async () => {
    const app = makeApp();
    const res = await request(app)
      .get("/unauth")
      .set("x-request-id", "test-rid-123");

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: "Unauthorized" });
    expect(res.headers["x-request-id"]).toBe("test-rid-123");
    expect(Object.keys(res.body)).toEqual(["error"]);
  });
});
