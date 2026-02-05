import { describe, expect, it } from "vitest";
import { loadConfig, parseEnv } from "../src/config";
import { ZodError } from "zod";

describe("parseEnv", () => {
  it("parses valid env", () => {
    const cfg = parseEnv({
      NODE_ENV: "development",
      PORT: "4000",
      DATABASE_URL: "postgres://user:pass@localhost:5432/db",
    });

    expect(cfg.NODE_ENV).toBe("development");
    expect(cfg.PORT).toBe(4000);
    expect(cfg.DATABASE_URL).toContain("postgres://");
  });

  it("defaults PORT to 3000 when missing", () => {
    const cfg = parseEnv({
      NODE_ENV: "development",
      DATABASE_URL: "postgres://user:pass@localhost:5432/db",
    });
    expect(cfg.PORT).toBe(3000);
  });

  it("defaults NODE_ENV to development when missing", () => {
    const cfg = parseEnv({
      PORT: "4000",
      DATABASE_URL: "postgres://user:pass@localhost:5432/db",
    });
    expect(cfg.NODE_ENV).toBe("development");
  });

  it("throws when DATABASE_URL is missing", () => {
    const env: NodeJS.ProcessEnv = {
      NODE_ENV: "development",
      PORT: "4000",
      DATABASE_URL: undefined,
    };

    try {
      parseEnv(env);
      throw new Error("Expected parseEnv to throw");
    } catch (err) {
      expect(err).toBeInstanceOf(ZodError);
      expect(String(err)).toMatch(/DATABASE_URL/);
    }
  });

  it("throws on invalid PORT", () => {
    expect(() =>
      parseEnv({
        NODE_ENV: "development",
        PORT: "99999",
        DATABASE_URL: "postgres://x",
      }),
    ).toThrow(ZodError);

    expect(() =>
      parseEnv({
        NODE_ENV: "development",
        PORT: "99999",
        DATABASE_URL: "postgres://x",
      }),
    ).toThrow(/PORT/);
  });
});

describe("loadConfig", () => {
  it("throws a stable error messsage on invalid env", () => {
    const originalEnv = process.env;

    try {
      process.env = {
        NODE_ENV: "test", // prevents dotenv.config
        PORT: "4000",
      } as NodeJS.ProcessEnv;

      expect(() => loadConfig()).toThrow(/Invalid environment variables/);
    } finally {
      process.env = originalEnv;
    }
  });
});
