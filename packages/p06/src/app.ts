import express from "express";
import { requestId } from "./middleware/requestId";
import { errorHandler } from "./middleware/errorHandler";
import { notFound } from "./middleware/notFound";
import { widgetsRouter } from "./widgets/widgets.router";

export type AppDeps = {
  idGen: { nextId: () => string };
  clock: { nowISO: () => string };
  logger: { info: (obj: any) => void; error: (obj: any) => void };
};

export function createApp(deps: AppDeps) {
  const app = express();

  app.use(express.json());
  app.use(requestId());

  // routes
  app.use("/widgets", widgetsRouter({ idGen: deps.idGen, clock: deps.clock }));

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
