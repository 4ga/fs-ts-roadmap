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
      // if validate() overwrites req.body, name is already trimmed & validated
      const { name } = req.body as { name: string };
      const created = store.create(name);

      return res.status(201).json(created);
    },
  );

  // GET /widgets?limit=&offset=
  router.get(
    "/",
    validate({ query: listWidgetsQuerySchema }),
    (req: Request, res: Response) => {
      const { limit, offset } = req.query as any;
      const result = store.list({ limit, offset });
      if (result)
        return res
          .status(200)
          .json({ item: result.items, limit, offset, total: result.total });
      return res.status(501).json({ error: "Not Implemented" });
    },
  );

  // GET /widgets/:id
  router.get(
    "/:id",
    validate({ params: widgetIdParamsSchema }),
    (req: Request, res: Response) => {
      const { id } = req.params as { id: string };
      const { name } = req.body as { name: string };
      const updated = store.update(id, name);
      if (!updated) return res.status(404).json({ error: "Not Found" });
      return res.status(501).json({ error: "Not Implemented" });
    },
  );

  // PUT /widgets/:id
  router.put(
    "/:id",
    validate({ params: widgetIdParamsSchema, body: updateWidgetBodySchema }),
    (req: Request, res: Response) => {
      const { id } = req.params as { id: string };
      const { name } = req.body as { name: string };
      const updated = store.update(id, name);
      if (!updated) {
        return res.status(404).json({ error: "Not found" });
      } else if (updated) {
        return res.status(200).json(updated);
      }
      return res.status(501).json({ error: "Not Implemented" });
    },
  );

  // DELETE /widgets/:id
  router.delete(
    "/:id",
    validate({ params: widgetIdParamsSchema }),
    (req: Request, res: Response) => {
      const { id } = req.params as { id: string };
      const ok = store.remove(id);
      if (!ok) {
        return res.status(404).json({ error: "Not Found" });
      } else if (ok) {
        return res.status(204).end();
      }
      return res.status(501).json({ error: "Not Implemented" });
    },
  );
  return router;
}
