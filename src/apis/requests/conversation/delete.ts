import { request } from "@/lib/request";
import z from "zod";

const RequestSchema = z.object({
  conversationId: z.string(),
});
type Request = z.infer<typeof RequestSchema>;

export function deleteConversation(data: Request) {
  return request({
    url: "/conversation/delete",
    method: "POST",
    dataValidator: RequestSchema,
    data,
  });
}
