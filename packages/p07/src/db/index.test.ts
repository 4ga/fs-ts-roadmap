import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createDb, migrate } from "./index";

let suiteCounter = 0;
function makeDbPath() {
  suiteCounter += 1;
  return path.join(os.tmpdir(), `p07-${process.pid}-${suiteCounter}.sqlite`);
}

describe("db migrations", () => {
  let dbPath: string;

  beforeEach(() => {
    dbPath = makeDbPath();
    // ensure clean
    try {
      fs.unlinkSync(dbPath);
    } catch {}
    try {
      fs.unlinkSync(dbPath + "-wal");
    } catch {}
    try {
      fs.unlinkSync(dbPath + "-shm");
    } catch {}
  });

  afterEach(() => {
    try {
      fs.unlinkSync(dbPath);
    } catch {}
    try {
      fs.unlinkSync(dbPath + "-wal");
    } catch {}
    try {
      fs.unlinkSync(dbPath + "-shm");
    } catch {}
  });

  it("migrate() is idempotent", () => {
    const db = createDb({ filename: dbPath });

    migrate(db);
    migrate(db); // should not throw

    const tables = db
      .prepare(
        "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name",
      )
      .all()
      .map((r: any) => r.name);

    expect(tables).toContain("widgets");
    expect(tables).toContain("schema_migrations");

    db.close();
  });

  it("restarting with same DB file persists data (optional)", () => {
    // first run
    let db = createDb({ filename: dbPath });
    migrate(db);

    db.prepare(
      "INSERT INTO widgets (id, name, created_at) VALUES (?, ?, ?)",
    ).run("w1", "Widget One", "2020-01-01T00:00:00.000Z");

    db.close();

    // “restart”
    db = createDb({ filename: dbPath });
    migrate(db);

    const row = db
      .prepare("SELECT id, name, created_at FROM widgets WHERE id = ?")
      .get("w1");

    expect(row).toEqual({
      id: "w1",
      name: "Widget One",
      created_at: "2020-01-01T00:00:00.000Z",
    });

    db.close();
  });
});
