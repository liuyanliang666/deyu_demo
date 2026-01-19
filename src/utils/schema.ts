import z from "zod";

export const mobileSchema = z
  .string()
  .trim()
  .regex(/^1[3-9]\d{9}$/, "请输入有效的 11 位手机号");
