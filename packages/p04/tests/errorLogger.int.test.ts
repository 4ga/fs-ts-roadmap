import express from "express";
import request from "supertest";
import { describe, it, expect } from "vitest";
import { requestId } from "../src/middleware/requestId";
import { errorLogger } from "../src/middleware/errorLogger";
import { createLogger } from "../src/logger";

describe("errorLogger", () => {
  it("logs error JSON including requestId and does not change response shape", async () => {
    const lines: string[] = [];
    const testLogger = createLogger({
      write: (line) => lines.push(line),
      now: () => "2000-01-01T00:00:00.000Z",
    });

    const app = express();
    app.use(requestId());
    app.get("/boom", () => {
      throw new Error("boom");
    });

    // error logging middleware (logs then passes through)
    app.use(errorLogger(testLogger));

    // final error handler (keeps standard error shape)
    app.use(
      (
        err: unknown,
        _req: express.Request,
        res: express.Response,
        _next: express.NextFunction,
      ) => {
        res.status(500).json({ error: "Internal Server Error" });
      },
    );

    const res = await request(app)
      .get("/boom")
      .set("x-request-id", "test-id-123");

    expect(res.headers["x-request-id"]).toBe("test-id-123");
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Internal Server Error" });

    expect(lines.length).toBe(1);
    const obj = JSON.parse(lines[0]!);

    expect(obj).toMatchObject({
      level: "error",
      msg: "request error",
      time: "2000-01-01T00:00:00.000Z",
      requestId: "test-id-123",
      method: "GET",
      path: "/boom",
      errName: "Error",
      errMessage: "boom",
    });
  });
});
