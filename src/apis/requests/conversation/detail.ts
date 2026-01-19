import { request } from "@/lib/request";
import z from "zod";
import { PageSchema } from "./schema";
import { avaliableModelName } from "@/store/initMessage";

export const RequestSchema = z.object({
  conversationId: z.string(),
  page: PageSchema,
});
// src/apis/requests/conversation/detail.ts:12
export const BotStateSchema = z.object({
  model: z.enum(avaliableModelName),
  bot_id: z.string(),
  bot_name: z.string(),
});

export const ExtSchema = z.object({
  botState: z.string().transform((i) => {
    if (i.length < 10) return;
    const target = JSON.parse(i);
    const res = BotStateSchema.safeParse(target);
    if (res.success) {
      return res.data;
    }
  }),
  brief: z.string(),
  suggest: z.string(),
  think: z.string(),
});
export type Ext = z.infer<typeof ExtSchema>;

export const MessageListSchema = z.object({
  content: z.string(),
  contentType: z.number(),
  conversationId: z.string(),
  createTime: z.number(),
  ext: ExtSchema,
  feedback: z.number(),
  index: z.number(),
  messageId: z.string(),
  messageType: z.number(),
  replyId: z.union([z.null(), z.string()]),
  sectionId: z.string(),
  status: z.number(),
  userType: z.number().transform((value) => {
    return value === 2 ? "user" : "assistant";
  }),
});
export type MessageItem = z.infer<typeof MessageListSchema>;

export const DataSchema = z.object({
  hasMore: z.boolean(),
  messageList: z.array(MessageListSchema).nullable(),
  regenList: z.array(MessageListSchema).nullable(),
  cursor: z.string(),
});

export function getConversationDetail(data: z.infer<typeof RequestSchema>) {
  return request({
    url: "/conversation/get",
    method: "POST",
    dataValidator: RequestSchema,
    data,
    responseValidator: DataSchema,
  });
}
