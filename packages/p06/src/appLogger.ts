import { createLogger } from "./logger";

export const logger = createLogger({
  write: (line) => process.stdout.write(line + "\n"),
  now: () => new Date().toISOString(),
});
