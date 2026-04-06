const DEFAULT_VERIFY_CODE_EXPIRE_SECONDS = 300;
const DEFAULT_VERIFY_CODE_APP_NAME = "deyu";

export function buildSendVerificationCodePayload(authId: string) {
  const appName =
    import.meta.env.VITE_VERIFY_CODE_APP_NAME || DEFAULT_VERIFY_CODE_APP_NAME;

  return {
    authType: "phone-verify" as const,
    authId,
    expire: DEFAULT_VERIFY_CODE_EXPIRE_SECONDS,
    cause: "passport" as const,
    app: {
      name: appName,
    },
  };
}
