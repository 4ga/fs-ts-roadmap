import { loadConfig } from "./config";
import { app } from "./app";

const config = loadConfig(); // fail fast occurs on startup, not on import

app.listen(config.PORT, () =>
  console.log(`Server listening on port ${config.PORT}`),
);
