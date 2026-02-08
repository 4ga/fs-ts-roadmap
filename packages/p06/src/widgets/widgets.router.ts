import { Router, type Request, type Response } from "express";
import { validate } from "../middleware/validate";
import {
  createWidgetBodySchema,
  listWidgetsQuerySchema,
  widgetIdParamsSchema,
  updateWidgetBodySchema,
} from "./widgets.schemas";
import { createWidgetsStore } from "./widgets.store";

export type WidgetDeps = {
  idGen: { nextId: () => string };
  clock: { nowISO: () => string };
};

export function widgetsRouter(deps: WidgetDeps) {
  const router = Router();
  const store = createWidgetsStore({ idGen: deps.idGen, clock: deps.clock });

  // POST /widgets
  router.post(
    "/",
    validate({ body: createWidgetBodySchema }),
    (req: Request, res: Response) => {
      const { name } = req.validated.body as { name: string };
      const created = store.create(name);
      return res.status(201).json(created);
    },
  );

  // GET /widgets?limit=&offset=
  router.get(
    "/",
    validate({ query: listWidgetsQuerySchema }),
    (req: Request, res: Response) => {
      const { limit, offset } = req.validated.query as unknown as {
        limit: number;
        offset: number;
      };
      const { items, total } = store.list({ limit, offset });
      return res.status(200).json({ items, limit, offset, total });
    },
  );

  // GET /widgets/:id
  router.get(
    "/:id",
    validate({ params: widgetIdParamsSchema }),
    (req: Request, res: Response) => {
      const { id } = req.validated.params as { id: string };
      const found = store.get(id);
      if (!found) return res.status(404).json({ error: "Not Found" });
      return res.status(200).json(found);
    },
  );

  // PUT /widgets/:id
  router.put(
    "/:id",
    validate({ params: widgetIdParamsSchema, body: updateWidgetBodySchema }),
    (req: Request, res: Response) => {
      const { id } = req.validated.params as { id: string };
      const { name } = req.validated.body as { name: string };
      const updated = store.update(id, name);
      if (!updated) return res.status(404).json({ error: "Not found" });
      return res.status(200).json(updated);
    },
  );

  // DELETE /widgets/:id
  router.delete(
    "/:id",
    validate({ params: widgetIdParamsSchema }),
    (req: Request, res: Response) => {
      const { id } = req.validated.params as { id: string };
      const ok = store.remove(id);
      if (!ok) return res.status(404).json({ error: "Not Found" });
      return res.status(204).end();
    },
  );
  return router;
}
