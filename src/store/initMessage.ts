import { create } from "zustand";

export const avaliableModelName = [
  "deyu-default",
  "deyu-bzr",
  "deyu-xkjs",
  "deyu-qyds",
  "deyu-dygb",
  "deyu-xy",
  "deyu-jylf",
] as const;

export type AvaliableModelName = (typeof avaliableModelName)[number];

export interface InitMessageState {
  // 初始消息
  initMessage: string | null;
  // 是否已处理初始消息
  hasProcessed: boolean;
  model: AvaliableModelName;
  modelName: string;
  // Actions
  setInitMessage: (message: string) => void;
  clearInitMessage: () => void;
  markAsProcessed: () => void;
  reset: () => void;
  setModel: (model: AvaliableModelName, modelName: string) => void;
}

export const useInitMessageStore = create<InitMessageState>((set) => ({
  initMessage: null,
  hasProcessed: false,
  model: "deyu-default",
  modelName: "",

  setInitMessage: (message: string) => {
    set({
      initMessage: message,
      hasProcessed: false,
    });
  },

  clearInitMessage: () => {
    set({
      initMessage: null,
    });
  },

  markAsProcessed: () => {
    set({
      hasProcessed: true,
    });
  },

  reset: () => {
    set({
      initMessage: null,
      hasProcessed: false,
      model: "deyu-default",
    });
  },

  setModel: (model: AvaliableModelName, modelName: string) => {
    set({
      model,
      modelName,
    });
  },
}));
