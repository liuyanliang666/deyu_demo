import z from "zod";
import { ConversationSchema } from "./history";
import { request } from "@/lib/request";
import { PageSchema } from "./schema";

export const RequestSchema = z.object({
  key: z.string(),
  page: PageSchema,
});

export const ResponseSchema = z.object({
  conversations: z.array(ConversationSchema),
  hasMore: z.boolean(),
  cursor: z.string(),
});

export function queryHistory(data: z.infer<typeof RequestSchema>) {
  return request({
    url: "/conversation/search",
    method: "POST",
    data,
    dataValidator: RequestSchema,
    responseValidator: ResponseSchema,
  });
}
