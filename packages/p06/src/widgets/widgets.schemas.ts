import { z } from "zod";

export const widgetNameSchema = z.string().trim().min(1).max(100);
export const widgetIdSchema = z.string().regex(/^w_\d+$/);

const first = (v: unknown) => (Array.isArray(v) ? v[0] : v);

const emptyToUndefined = (v: unknown) => {
  const x = first(v);
  return x === "" || x === null ? undefined : x;
};

export const limitSchema = z
  .preprocess(emptyToUndefined, z.coerce.number().int().min(0))
  .default(20);

export const offsetSchema = z
  .preprocess(emptyToUndefined, z.coerce.number().int().min(0))
  .default(0);

// --- per-endpoint ---
export const createWidgetBodySchema = z
  .object({ name: widgetNameSchema })
  .strict();

export const updateWidgetBodySchema = z
  .object({ name: widgetNameSchema })
  .strict();

export const widgetIdParamsSchema = z.object({ id: widgetIdSchema }).strict();

export const listWidgetsQuerySchema = z
  .object({
    limit: limitSchema,
    offset: offsetSchema,
  })
  .strict();
