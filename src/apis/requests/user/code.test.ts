import { describe, expect, it } from "vitest";
import { buildSendVerificationCodePayload } from "./code-payload";

describe("send verification code payload", () => {
  it("builds the BlueCloud request payload from a phone number", () => {
    const payload = buildSendVerificationCodePayload("13800138000");

    expect(payload).toEqual({
      authType: "phone-verify",
      authId: "13800138000",
      expire: 300,
      cause: "passport",
      app: {
        name: "deyu",
      },
    });
  });
});
