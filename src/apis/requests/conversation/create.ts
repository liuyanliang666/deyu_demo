import { request } from "@/lib/request";
import z from "zod";

export const createConversation = (abort: AbortController) => {
  return request({
    url: "/conversation/create",
    method: "POST",
    responseValidator: z.object({
      conversationId: z.string(),
    }),
    signal: abort.signal,
  });
};
