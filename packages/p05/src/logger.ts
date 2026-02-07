export type WriteFn = (line: string) => void;
export type NowFn = () => string;

export interface Logger {
  info: (msg: string, meta?: Record<string, unknown>) => void;
  error: (msg: string, meta?: Record<string, unknown>) => void;
}

const SENSITIVE = new Set([
  "authorization",
  "cookie",
  "set-cookie",
  "password",
  "token",
  "accesstoken",
  "refreshtoken",
]);

function redact(input: unknown): unknown {
  if (input === null || input === undefined) return input;
  if (Array.isArray(input)) return input.map((el) => redact(el));
  if (typeof input === "object") {
    const obj = input as Record<string, unknown>;
    const out: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
      const k = key.toLowerCase();
      if (SENSITIVE.has(k)) {
        out[key] = "[REDACTED]";
      } else {
        out[key] = redact(value);
      }
    }
    return out;
  }

  return input;
}

export function createLogger(deps: { write: WriteFn; now: NowFn }): Logger {
  const { write, now } = deps;

  function log(
    level: "info" | "error",
    msg: string,
    meta?: Record<string, unknown>,
  ) {
    const safeMeta = (redact(meta ?? {}) ?? {}) as Record<string, unknown>;

    const payload: Record<string, unknown> = {
      level,
      msg,
      time: now(),
      ...safeMeta,
    };
    write(JSON.stringify(payload));
  }
  return {
    info: (msg, meta) => log("info", msg, meta),
    error: (msg, meta) => log("error", msg, meta),
  };
}
