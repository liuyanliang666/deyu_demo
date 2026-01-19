import { request } from "@/lib/request";
import z from "zod";
import { PageSchema } from "./schema";

const RequestSchema = z.object({
  page: PageSchema,
});
export const ConversationSchema = z.object({
  conversationId: z.string(),
  brief: z.string(),
  createTime: z.number(),
  updateTime: z.number(),
});
const ResponseSchema = z.object({
  conversations: z.array(ConversationSchema),
  cursor: z.string(),
  hasMore: z.boolean(),
});

export type Conversation = z.infer<typeof ConversationSchema>;

export function getConversationHistoryList(
  data: z.infer<typeof RequestSchema>,
) {
  return request({
    url: "/conversation/list",
    method: "POST",
    dataValidator: RequestSchema,
    data,
    responseValidator: ResponseSchema,
  });
}
