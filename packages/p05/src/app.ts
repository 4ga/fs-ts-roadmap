import express from "express";
import { requestId } from "./middleware/requestId";
import { errorHandler } from "./middleware/errorHandler";
import { notFound } from "./middleware/notFound";

const app = express();
app.use(express.json());
app.use(requestId());

// routes

app.use(notFound);
app.use(errorHandler);

export { app };
