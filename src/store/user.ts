import type { UserCredentials } from "@/apis/requests/user/schema";
import { persist, createJSONStorage } from "zustand/middleware";
import { create } from "zustand";
import { TOKEN_KEY } from "@/lib/request";
interface User extends UserCredentials {
  setCredentials: (data: Pick<UserCredentials, "expire" | "token">) => void;
}
export const userInfoStore = create<User>()(
  persist(
    (set) => ({
      expire: -1,
      token: "",
      userId: "",
      "new": false,
      setCredentials: (data: Pick<UserCredentials, "expire" | "token">) => {
        localStorage.setItem(TOKEN_KEY, data.token);
        set(data);
      },
    }),
    {
      name: "user-store",
      partialize: (s) => ({ token: s.token, expire: s.expire }),
      storage: createJSONStorage(() => localStorage),

      onRehydrateStorage: () => (state) => {
        console.log("恢复", state);
        // state 就是刚刚恢复出来的值（可能为 undefined）
        if (!state) return;

        const now = Date.now();
        // expire 是秒级时间戳就 *1000
        const expired = state.expire > 0 && state.expire * 1000 <= now;

        if (expired) {
          // 过期：清掉 token 和 expire
          userInfoStore.setState({ token: "", expire: -1, userId: "" });
          localStorage.setItem(TOKEN_KEY, "");
        }
      },
    },
  ),
);
