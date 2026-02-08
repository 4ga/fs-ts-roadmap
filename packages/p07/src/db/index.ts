import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

export type Db = Database.Database;

export function createDb(opts: { filename: string }): Db {
  const db = new Database(opts.filename);

  // Keep behavior predictable
  db.pragma("foreign_keys = ON");
  db.pragma("busy_timeout = 5000");
  db.pragma("journal_mode = WAL");

  return db;
}

export function migrate(db: Db, opts?: { migrationsDir?: string }): void {
  const migrationsDir =
    opts?.migrationsDir ?? path.join(process.cwd(), "src", "db", "migrations");

  // 1) Ensure migrations bookkeeping exists (this is what makes migrate() safely repeatable)
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL
    );
  `);

  // 2) Collect and sort migrations
  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => /^\d+_.*\.sql$/.test(f))
    .sort(); // relies on 001_, 002_ naming

  const applied = new Set<string>(
    db
      .prepare("SELECT id FROM schema_migrations ORDER BY id")
      .all()
      .map((r: any) => r.id),
  );

  const insertApplied = db.prepare(
    "INSERT INTO schema_migrations (id, applied_at) VALUES (?, ?)",
  );

  // NOTE: no wall-clock time in tests unless injected/mocked.
  // So we accept applied_at as a deterministic string.
  const appliedAt = "migrated"; // deterministic marker

  const run = db.transaction(() => {
    for (const file of files) {
      if (applied.has(file)) continue;

      const fullPath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(fullPath, "utf8");

      db.exec(sql);
      insertApplied.run(file, appliedAt);
    }
  });

  run();
}
