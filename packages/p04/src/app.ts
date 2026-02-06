import express from "express";
import { requestId } from "./middleware/requestId";
import { httpLogger } from "./middleware/httpLogger";
import { logger } from "./appLogger";
import { errorLogger } from "./middleware/errorLogger";

const app = express();
app.use(express.json());
app.use(requestId());
app.use(httpLogger(logger));

// routes

errorLogger(logger);

export { app };
