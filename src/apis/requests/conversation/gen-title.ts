import { request } from "@/lib/request";
import z from "zod";
import { MessageSchema } from "./completion";

const RequestSchema = z.object({
  messages: z.array(MessageSchema),
  conversationId: z.string(),
});
type Request = z.infer<typeof RequestSchema>;

export function genConversationTitle(data: Request) {
  return request({
    url: "/conversation/brief",
    method: "POST",
    dataValidator: RequestSchema,
    data,
  });
}
