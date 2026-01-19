import z from "zod";
import { request } from "@/lib/request";
import { AuthInfoSchema, CredentialsSchema } from "./schema";

export const RequestSchema = AuthInfoSchema.extend({
  verify: z.string(),
});

export const RequestVerify = (data: z.infer<typeof RequestSchema>) => {
  return request({
    url: "/auth/login",
    method: "POST",
    data,
    dataValidator: RequestSchema,
    responseValidator: CredentialsSchema,
  });
};
