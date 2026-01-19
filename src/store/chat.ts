import { create } from "zustand";
import type { Request as CompletionRequest } from "@/apis/requests/conversation/completion";

export interface ChatState {
  // 深度思考状态
  isDeepThink: boolean;
  // 完成配置
  completionConfig: Pick<
    CompletionRequest,
    "model" | "botId" | "completionsOption"
  >;

  // Actions
  toggleDeepThink: () => void;
  setCompletionConfig: (
    config: Partial<
      Pick<CompletionRequest, "model" | "botId" | "completionsOption">
    >,
  ) => void;
}

const defaultConfig: Pick<
  CompletionRequest,
  "model" | "botId" | "completionsOption"
> = {
  model: "InnoSpark",
  botId: "default",
  completionsOption: {
    isRegen: false,
    withSuggest: false,
    isReplace: false,
    useDeepThink: false,
    stream: true,
  },
};

export const useChatStore = create<ChatState>((set, get) => ({
  isDeepThink: false,
  completionConfig: defaultConfig,

  toggleDeepThink: () => {
    const currentState = get();
    const newDeepThinkState = !currentState.isDeepThink;

    set({
      isDeepThink: newDeepThinkState,
      completionConfig: {
        ...currentState.completionConfig,
        model: newDeepThinkState ? "InnoSpark-R" : "InnoSpark",
        completionsOption: {
          ...currentState.completionConfig.completionsOption,
          useDeepThink: newDeepThinkState,
        },
      },
    });
  },

  setCompletionConfig: (config) => {
    set((state) => ({
      completionConfig: {
        ...state.completionConfig,
        ...config,
        completionsOption: {
          ...state.completionConfig.completionsOption,
          ...config.completionsOption,
        },
      },
    }));
  },
}));
