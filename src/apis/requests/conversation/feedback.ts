import { request } from "@/lib/request";
import z from "zod";

export const FeedbackSchema = z.object({
  content: z.union([z.null(), z.string()]).optional(),
  type: z.union([z.number(), z.null()]).optional(),
});
export type Feedback = z.infer<typeof FeedbackSchema>;

export const RequestSchema = z.object({
  action: z.number(), // 撤销-0/喜欢-1/不喜欢-2/删除消息-3
  feedback: z.union([FeedbackSchema, z.null()]).optional(),
  messageId: z.string(),
});
export type Request = z.infer<typeof RequestSchema>;

export function feedbackMessage(data: Request) {
  return request({
    method: "POST",
    url: "/feedback",
    data,
    dataValidator: RequestSchema,
  });
}
