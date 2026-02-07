import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../src/app";

describe("requestId middleware", () => {
  it("returns x-request-id when not provided", async () => {
    const res = await request(app).get("/__no_route__");

    expect(res.headers["x-request-id"]).toBeDefined();
    expect(String(res.headers["x-request-id"]).trim().length).toBeGreaterThan(
      0,
    );
  });

  it("echoes back x-request-id when provided", async () => {
    const res = await request(app)
      .get("/__no_route__")
      .set("x-request-id", "test-id-123");

    expect(res.headers["x-request-id"]).toBe("test-id-123");
  });
});
