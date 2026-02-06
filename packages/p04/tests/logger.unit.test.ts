import { describe, it, expect } from "vitest";
import { createLogger } from "../src/logger";

describe("createLogger", () => {
  it("writes single-line JSON", () => {
    const lines: string[] = [];
    const logger = createLogger({
      write: (line) => lines.push(line),
      now: () => "2000-01-01T00:00:00.000Z",
    });

    logger.info("hello");

    expect(lines.length).toBe(1);
    expect(() => JSON.parse(lines[0]!)).not.toThrow();

    const obj = JSON.parse(lines[0]!);
    expect(obj).toMatchObject({
      level: "info",
      msg: "hello",
      time: "2000-01-01T00:00:00.000Z",
    });

    // "single line" check (no newline chars)
    expect(lines[0]!.includes("\n")).toBe(false);
  });

  it("includes requestId when provided", () => {
    const lines: string[] = [];
    const logger = createLogger({
      write: (line) => lines.push(line),
      now: () => "2000-01-01T00:00:00.000Z",
    });

    logger.info("hi", { requestId: "abc-123" });

    const obj = JSON.parse(lines[0]!);
    expect(obj.requestId).toBe("abc-123");
  });

  it("redacts sensitive fields (including nested)", () => {
    const lines: string[] = [];
    const logger = createLogger({
      write: (line) => lines.push(line),
      now: () => "2000-01-01T00:00:00.000Z",
    });

    logger.info("test", {
      authorization: "Bearer SECRET",
      cookie: "sid=SECRET",
      password: "SECRET",
      token: "SECRET",
      nested: {
        accessToken: "SECRET",
        refreshToken: "SECRET",
        ok: "keep-me",
      },
    });

    const obj = JSON.parse(lines[0]!);

    expect(obj.authorization).toBe("[REDACTED]");
    expect(obj.cookie).toBe("[REDACTED]");
    expect(obj.password).toBe("[REDACTED]");
    expect(obj.token).toBe("[REDACTED]");

    expect(obj.nested.accessToken).toBe("[REDACTED]");
    expect(obj.nested.refreshToken).toBe("[REDACTED]");
    expect(obj.nested.ok).toBe("keep-me");
  });
});
