import express from "express";
import { requestId } from "./middleware/requestId";

const app = express();
app.use(express.json());
app.use(requestId());

export { app };
