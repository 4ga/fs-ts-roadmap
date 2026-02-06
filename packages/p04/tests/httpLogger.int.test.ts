import express from "express";
import request from "supertest";
import { describe, it, expect } from "vitest";
import { requestId } from "../src/middleware/requestId";
import { httpLogger } from "../src/middleware/httpLogger";
import { createLogger } from "../src/logger";

describe("httpLogger", () => {
  it("logs JSON with requestId and redacts sensitive headers", async () => {
    const lines: string[] = [];
    const testLogger = createLogger({
      write: (line) => lines.push(line),
      now: () => "2000-01-01T00:00:00.000Z",
    });

    const app = express();
    app.use(express.json());
    app.use(requestId());
    app.use(httpLogger(testLogger));
    app.get("/ok", (_req, res) => res.status(200).json({ ok: true }));

    const res = await request(app)
      .get("/ok")
      .set("x-request-id", "test-id-123")
      .set("authorization", "Bearer SECRET")
      .set("cookie", "sid=SECRET");

    expect(res.headers["x-request-id"]).toBe("test-id-123");
    expect(lines.length).toBe(1);

    const obj = JSON.parse(lines[0]!);

    expect(obj).toMatchObject({
      level: "info",
      msg: "http request",
      time: "2000-01-01T00:00:00.000Z",
      requestId: "test-id-123",
      method: "GET",
      path: "/ok",
      status: 200,
    });

    expect(typeof obj.durationMs).toBe("number");

    // redaction proves secrets aren't logged
    expect(obj.headers.authorization).toBe("[REDACTED]");
    expect(obj.headers.cookie).toBe("[REDACTED]");
  });
});
