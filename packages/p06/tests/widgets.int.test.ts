import request from "supertest";
import { describe, it, expect } from "vitest";
import { createApp } from "../src/app";

function makeApp() {
  const idGen = {
    i: 0,
    nextId() {
      this.i += 1;
      return `w_${this.i}`;
    },
  };

  const clock = {
    nowISO() {
      return "2020-01-01T00:00:00.000Z";
    },
  };

  const logger = {
    info: (_obj: any) => {},
    error: (_obj: any) => {},
  };

  return createApp({ idGen, clock, logger });
}

describe("P06 /widgets", () => {
  it("POST /widgets -> 201 returns {id,name,createdAt} and echoes x-request-id", async () => {
    const app = makeApp();

    const res = await request(app)
      .post("/widgets")
      .set("x-request-id", "req-create-1")
      .send({ name: "Alpha" });

    expect(res.status).toBe(201);
    expect(res.headers["x-request-id"]).toBe("req-create-1");

    expect(res.body).toEqual({
      id: "w_1",
      name: "Alpha",
      createdAt: "2020-01-01T00:00:00.000Z",
    });
  });

  it("GET /widgets -> defaults limit=20 offset=0 and returns items/limit/offset/total", async () => {
    const app = makeApp();

    await request(app).post("/widgets").send({ name: "A" });
    await request(app).post("/widgets").send({ name: "B" });

    const res = await request(app).get("/widgets");

    expect(res.status).toBe(200);
    expect(res.body.total).toBe(2);
    expect(res.body.limit).toBe(20);
    expect(res.body.offset).toBe(0);
    expect(res.body.items).toHaveLength(2);
    expect(res.body.items[0]).toMatchObject({ id: "w_1", name: "A" });
    expect(res.body.items[1]).toMatchObject({ id: "w_2", name: "B" });
  });

  it("GET /widgets?limit=&offset= paginates", async () => {
    const app = makeApp();

    await request(app).post("/widgets").send({ name: "A" });
    await request(app).post("/widgets").send({ name: "B" });
    await request(app).post("/widgets").send({ name: "C" });

    const res = await request(app).get("/widgets?limit=1&offset=1");

    expect(res.status).toBe(200);
    expect(res.body.total).toBe(3);
    expect(res.body.limit).toBe(1);
    expect(res.body.offset).toBe(1);
    expect(res.body.items).toEqual([
      { id: "w_2", name: "B", createdAt: "2020-01-01T00:00:00.000Z" },
    ]);
  });

  it("GET /widgets/:id -> 200, unknown valid id -> 404 {error: Not Found}", async () => {
    const app = makeApp();

    await request(app).post("/widgets").send({ name: "A" });

    const ok = await request(app).get("/widgets/w_1");
    expect(ok.status).toBe(200);
    expect(ok.body).toMatchObject({ id: "w_1", name: "A" });

    const missing = await request(app)
      .get("/widgets/w_999")
      .set("x-request-id", "req-missing-1");
    expect(missing.status).toBe(404);
    expect(missing.headers["x-request-id"]).toBe("req-missing-1");
    expect(missing.body).toEqual({ error: "Not Found" });
  });

  it("PUT /widgets/:id -> 200 updates name, unknown -> 404", async () => {
    const app = makeApp();

    await request(app).post("/widgets").send({ name: "Old" });

    const updated = await request(app)
      .put("/widgets/w_1")
      .send({ name: "New" });
    expect(updated.status).toBe(200);
    expect(updated.body).toEqual({
      id: "w_1",
      name: "New",
      createdAt: "2020-01-01T00:00:00.000Z",
    });

    const missing = await request(app)
      .put("/widgets/w_999")
      .send({ name: "X" });
    expect(missing.status).toBe(404);
    expect(missing.body).toEqual({ error: "Not Found" });
  });

  it("DELETE /widgets/:id -> 204, unknown -> 404", async () => {
    const app = makeApp();

    await request(app).post("/widgets").send({ name: "A" });

    const del = await request(app).delete("/widgets/w_1");
    expect(del.status).toBe(204);
    expect(del.text).toBe("");

    const missing = await request(app).delete("/widgets/w_999");
    expect(missing.status).toBe(404);
    expect(missing.body).toEqual({ error: "Not Found" });
  });

  it("Bad body/query/params -> 400 {error: Bad Request}", async () => {
    const app = makeApp();

    const badBody = await request(app).post("/widgets").send({});
    expect(badBody.status).toBe(400);
    expect(badBody.body).toEqual({ error: "Bad Request" });

    const badQuery = await request(app).get("/widgets?limit=-1&offset=0");
    expect(badQuery.status).toBe(400);
    expect(badQuery.body).toEqual({ error: "Bad Request" });

    // params validation: enforce w_<digits> so /widgets/nope is a 400 (not a 404)
    const badParam = await request(app).get("/widgets/nope");
    expect(badParam.status).toBe(400);
    expect(badParam.body).toEqual({ error: "Bad Request" });
  });
});
