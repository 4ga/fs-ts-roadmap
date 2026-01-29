import request from "supertest";
import { describe, it, expect } from "vitest";
import { app } from "../src/app";

describe("P02 validate() middleware", () => {
  it("POST /widgets valid body -> 200", async () => {
    const res = await request(app)
      .post("/widgets")
      .send({ name: "Hammer", price: 12.5 });

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.validated).toEqual({ name: "Hammer", price: 12.5 });
  });

  it("POST /widgets missing required -> 400 {error}", async () => {
    const res = await request(app).post("/widgets").send({
      price: 12.5,
    });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "Bad Request" });
  });

  it("GET /widgets/:id invalid param -> 400 {error}", async () => {
    const res = await request(app).get("/widgets/not-an-int");

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "Bad Request" });
  });

  it("GET /search missing/empty term -> 400 {error}", async () => {
    const res = await request(app).get("/search");

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "Bad Request" });
  });

  it("GET /search valid query -> 200", async () => {
    const res = await request(app).get("/search?term=hammer");

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.validated).toEqual({ term: "hammer" });
  });

  it("GET /widgets/:id valid param -> 200", async () => {
    const res = await request(app).get("/widgets/123");

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.validated).toEqual({ id: 123 }); // because z.coerce.number()
  });
});
