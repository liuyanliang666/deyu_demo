import z from "zod";

export const AuthInfoSchema = z.object({
  authId: z.string(),
  authType: z.union([z.literal("phone"), z.literal("password")]),
});
export const CredentialsSchema = z.object({
  expire: z.number(),
  token: z.string(),
  userId: z.string(),
  "new": z.boolean().default(false),
});
export type UserCredentials = z.infer<typeof CredentialsSchema>;
