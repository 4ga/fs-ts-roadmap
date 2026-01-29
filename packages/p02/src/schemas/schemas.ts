import { z } from "zod";

const createBodySchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  price: z.coerce.number().positive(),
});

const widgetSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const listQuerySchema = z.object({
  term: z.string().trim().min(1, "Term is required"),
});

export { createBodySchema, widgetSchema, listQuerySchema };
