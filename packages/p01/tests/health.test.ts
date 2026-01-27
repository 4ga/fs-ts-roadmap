import request from "supertest";
import { describe, it, expect } from "vitest";
import { app } from "../src/app";

describe("P01: Healthcheck + error standard", () => {
  it("GET /health -> 200 {status: 'ok'}", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });

  it("GET /boom -> 500 {error} (no stack leaks)", async () => {
    const res = await request(app).get("/boom");

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Internal Server Error" });

    // No stack leaks to clients (basic check)
    expect("stack" in res.body).toBe(false);
  });

  it("Uknown route -> 404 {error}", async () => {
    const res = await request(app).get("/nope");

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "Not Found" });
  });
});
