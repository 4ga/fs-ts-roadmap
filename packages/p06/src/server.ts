import { loadConfig } from "./config";
import { app } from "./app";

const config = loadConfig();

app.listen(config.PORT, () =>
  console.log(`Server listening on port ${config.PORT}`),
);
