import { z } from "zod";

export const PageSchema = z.object({
  cursor: z.string().optional(),
  size: z.number(),
});
