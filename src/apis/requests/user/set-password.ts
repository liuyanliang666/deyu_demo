import { request } from "@/lib/request";
import z from "zod";

export const setPasswordSchema = z.object({
  newPassword: z.string(),
});

export const setPassword = (data: z.infer<typeof setPasswordSchema>) =>
  request({
    url: "/auth/setPassword",
    method: "POST",
    data,
    dataValidator: setPasswordSchema,
  });
