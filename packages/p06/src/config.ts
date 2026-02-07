import dotenv from "dotenv";
import { z, ZodError } from "zod";

/**
 * 1) Define allowed NODE_ENV values.
 * 2) PORT should end up as a number
 * 3) DATABASE_URL requiredd (non-empty)
 */
export const EnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  DATABASE_URL: z.string().min(1),
});

export type Config = z.infer<typeof EnvSchema>;

export function parseEnv(env: NodeJS.ProcessEnv): Config {
  const result = EnvSchema.safeParse(env);
  if (!result.success) throw result.error;
  return result.data;
}

export function loadConfig(): Config {
  const nodeEnv = process.env.NODE_ENV ?? "development";
  if (nodeEnv === "development") dotenv.config({ override: false });

  try {
    return parseEnv(process.env);
  } catch (err: unknown) {
    if (err instanceof ZodError) {
      console.error(z.prettifyError(err));
    } else {
      console.error(err);
    }
    throw new Error("Invalid environment variables");
  }
}
