import { request } from "@/lib/request";
import z from "zod";

const RequestSchema = z.object({
  conversationId: z.string(),
  brief: z.string(),
});
type Request = z.infer<typeof RequestSchema>;

export function renameConversation(data: Request) {
  return request({
    url: "/conversation/rename",
    method: "POST",
    dataValidator: RequestSchema,
    data,
  });
}
