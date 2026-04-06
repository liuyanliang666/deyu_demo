import type z from "zod";
import {
  type AuthInfoSchema,
  SendVerificationCodePayloadSchema,
} from "./schema";
import { request } from "@/lib/request";
import { env } from "@/env";
import { buildSendVerificationCodePayload } from "./code-payload";

const DEFAULT_VERIFY_CODE_BASE_URL = "https://synapse.aiecnu.net";
const VERIFY_CODE_DEV_PROXY_PREFIX = "/verify-api";

function getVerifyCodeRequestUrl() {
  if (import.meta.env.DEV) {
    return new URL(
      `${VERIFY_CODE_DEV_PROXY_PREFIX}/system/send_verify_code`,
      window.location.origin,
    ).toString();
  }

  return `${env.VITE_VERIFY_CODE_BASE_URL || DEFAULT_VERIFY_CODE_BASE_URL}/system/send_verify_code`;
}

export const sendVerificationCode = (data: z.infer<typeof AuthInfoSchema>) =>
  request({
    url: getVerifyCodeRequestUrl(),
    method: "POST",
    data: buildSendVerificationCodePayload(data.authId),
    dataValidator: SendVerificationCodePayloadSchema,
  });
