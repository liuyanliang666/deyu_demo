import type { Request as CompletionRequest } from "@/apis/requests/conversation/completion";
import {
  type BotStateSchema,
  getConversationDetail,
  type MessageItem,
} from "@/apis/requests/conversation/detail";
import { feedbackMessage } from "@/apis/requests/conversation/feedback";
import ClientQueryKeys from "@/apis/queryKeys";
import { BASE_URL, GlobalHeader, tokenStore } from "@/lib/request";
import { useChatStore } from "@/store/chat";
import { useInitMessageStore } from "@/store/initMessage";
import { useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import type { ChatStatus, DeepPartial } from "ai";
import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { genConversationTitle } from "@/apis/requests/conversation/gen-title";
import type z from "zod";
import { modelMap } from "@/app/chat/constants";

export interface StreamChunk {
  id: number;
  event: "meta" | "model" | "chat" | "end";
  data: Record<string, unknown>;
}
// 后端 SSE 单帧 payload
export interface SSEDataPayload {
  message: {
    content: string; // 实际是 JSON 字符串，如 "{\"text\":\"这里\"}"
    contentType: number;
  };
  conversationId: string;
  sectionId: string;
  replyId: string;
  isDeleted: boolean;
  status: number;
  inputContentType: number;
  messageIndex: number;
  botId: string;
}
export interface SSEMeta {
  messageId: string;
  conversationId: string;
  sectionId: string;
  messageIndex: number;
  conversationType: number;
  replyId: string;
}
export interface SSEModel {
  model: string;
  botId: string;
  botName: string;
}
// 如果 content 里是 {text: string}，可再定义一个解析后的结构
export interface TextContent {
  text?: string;
  think?: string;
}
export interface ChatMessage {
  id: string;
  think?: string;
  content: string;
  role: "user" | "assistant";
  timestamp: number;
  isStreaming?: boolean;
  isCompleteThink?: boolean;
  feedback?: number;
  replyId?: string;
  botState?: z.infer<typeof BotStateSchema>;
}
export type FeedbackProps = {
  messageId: string;
  action: 0 | 1 | 2;
  forRegenList?: boolean;
};
const MESSAGE_BATCH_SIZE = 30;

export function useStreamCompletion(conversationId: string) {
  const status = useRef<ChatStatus>("ready");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastUserMessageId = useRef<string | null>(null);
  const lastAssistantMessageId = useRef<string | null>(null);
  const [lastAssistantMessageBranch, setLastAssistantMessageBranch] = useState<
    ChatMessage[]
  >([]);
  const selectBranchIdRef = useRef<string | null>(null);
  const hasInitializedRef = useRef(false);
  // 使用 Zustand store 获取完成配置
  const completionConfig = useChatStore((state) => state.completionConfig);
  const initMessage = useInitMessageStore((state) => state.initMessage);
  const hasProcessed = useInitMessageStore((state) => state.hasProcessed);
  const model = useInitMessageStore((state) => state.model);
  const setModel = useInitMessageStore((s) => s.setModel);
  const queryClient = useQueryClient();
  // 当 conversationId 变化时，重置所有状态
  useEffect(() => {
    setMessages([]);
    lastUserMessageId.current = null;
    lastAssistantMessageId.current = null;
    status.current = "ready";
    hasInitializedRef.current = false;
    // 取消任何进行中的请求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    // 清除之前的查询缓存，确保新会话的数据是干净的
    queryClient.removeQueries({
      queryKey: [
        ClientQueryKeys.consversation.conversationDetail,
        conversationId,
      ],
    });
  }, [conversationId, queryClient]);

  const {
    hasNextPage: hasMoreEarlier,
    fetchNextPage: fetchEarlier,
    isFetchingNextPage: isFetchingEarlier,
    data: earlierMessagesData,
  } = useInfiniteQuery<
    {
      cursor: string;
      hasMore: boolean;
      messageList: MessageItem[] | null;
      regenList: MessageItem[] | null;
    },
    Error,
    {
      earlierMessages: ChatMessage[];
      regenList: ChatMessage[];
    },
    [string, string],
    string | null
  >({
    queryKey: [
      ClientQueryKeys.consversation.conversationDetail,
      conversationId,
    ],
    queryFn: ({ pageParam }) => {
      const _cursor = pageParam ?? undefined;
      return getConversationDetail({
        conversationId,
        page: {
          cursor: _cursor,
          size: MESSAGE_BATCH_SIZE,
        },
      });
    },
    staleTime: -1,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.cursor : null),
    initialPageParam: null,
    enabled: !!conversationId && !initMessage && !hasProcessed,
    select: (data) => {
      // 将更早的消息插入到现有消息的前面
      const earlierMessages = data.pages
        .flatMap((page) => page.messageList ?? [])
        .filter((message) => !!message.content)
        .map<ChatMessage>((message: MessageItem) => ({
          id: message.messageId,
          content: message.content,
          think: message.ext.think,
          role: message.userType,
          timestamp: message.createTime,
          isCompleteThink: message.ext.think !== "" && message.content !== "",
          feedback: message.feedback,
          replyId: message.replyId ?? undefined,
          botState: message.ext.botState,
        }))
        .reverse();

      // 返回包含 regenList 信息的对象，而不是直接调用 setState
      return {
        earlierMessages,
        regenList:
          data.pages[0].regenList
            ?.map<ChatMessage>((message: MessageItem) => ({
              id: message.messageId,
              content: message.ext.brief,
              think: message.ext.think,
              role: message.userType,
              timestamp: message.createTime,
              isCompleteThink:
                message.ext.think !== "" && message.content !== "",
              feedback: message.feedback,
              replyId: message.replyId ?? undefined,
              botState: message.ext.botState,
            }))
            .reverse() ?? [],
      };
    },
    refetchOnWindowFocus: false,
  });

  // 使用 useMemo 来稳定 earlierMessages 和 regenList 的引用
  const stableEarlierMessages = useMemo(() => {
    if (!earlierMessagesData) return { earlierMessages: [], regenList: [] };
    return {
      earlierMessages: earlierMessagesData.earlierMessages || [],
      regenList: earlierMessagesData.regenList || [],
    };
  }, [earlierMessagesData]);

  // 当获取到更早的消息时，更新消息状态
  useEffect(() => {
    if (stableEarlierMessages.earlierMessages.length > 0) {
      setMessages((prevMessages) => {
        // 检查是否已经包含这些消息，避免重复添加
        const existingIds = new Set(prevMessages.map((msg) => msg.id));
        const newMessages = stableEarlierMessages.earlierMessages.filter(
          (msg) => !existingIds.has(msg.id),
        );
        if (newMessages.length > 0) {
          if (!prevMessages.length) {
            for (let i = newMessages.length - 1; i >= 0; i--) {
              const el = newMessages[i];
              if (el.role === "user") {
                lastUserMessageId.current = el.id;
              } else if (el.role === "assistant") {
                lastAssistantMessageId.current = el.id;
              }
              if (lastAssistantMessageId.current && lastUserMessageId.current) {
                break;
              }
            }
            // 只在第一次加载时设置 regenList
            if (stableEarlierMessages.regenList.length > 0) {
              setLastAssistantMessageBranch(stableEarlierMessages.regenList);
            }
            const model = stableEarlierMessages.earlierMessages.find(
              (i) => i.botState?.model,
            )?.botState?.model;
            if (model) {
              // 将 store 更新推迟到微任务，避免在父组件渲染期间触发订阅组件更新
              Promise.resolve().then(() => {
                setModel(model, modelMap.get(model) ?? "");
              });
            }
          }
          return [...newMessages, ...prevMessages];
        }
        return prevMessages;
      });
    }
  }, [stableEarlierMessages, setModel]);

  const addMessage = useCallback(
    ({
      role,
      content = "",
      isStreaming = true,
      id = Math.random().toString(36).substring(2, 9),
    }: {
      role: "user" | "assistant";
      content?: string;
      isStreaming?: boolean;
      id?: string;
    }) => {
      const newMessage: ChatMessage = {
        id,
        content,
        role,
        timestamp: -1,
        isStreaming,
      };
      setMessages((prev) => [...prev, newMessage]);
      if (role === "user") {
        lastUserMessageId.current = newMessage.id;
      } else {
        lastAssistantMessageId.current = newMessage.id;
      }
      return newMessage.id;
    },
    [],
  );
  const rollbackMessagesTo = useCallback(
    (id: string, saveLastAssistantMessage?: boolean) => {
      setMessages((prevMessages) => {
        const index = prevMessages.findIndex((msg) => msg.id === id);
        if (saveLastAssistantMessage) {
          const lastAssistantMessage = prevMessages.find(
            (i) => i.id === lastAssistantMessageId.current,
          );
          if (lastAssistantMessage) {
            setLastAssistantMessageBranch((pre) =>
              pre.some((i) => i.id === lastAssistantMessage.id)
                ? pre
                : [...pre, lastAssistantMessage],
            );
          }
        }
        if (index !== -1) {
          return prevMessages.slice(0, index);
        }
        return prevMessages;
      });
    },
    [], // 移除 messages 依赖，使用函数式更新
  );
  const modifyMessage = useCallback(
    (
      id: string,
      message: Partial<ChatMessage>,
      callback?: (msg: ChatMessage) => void,
    ) => {
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id === id) {
            const newMsg = { ...msg, ...message };
            callback?.(newMsg);
            return newMsg;
          }
          return msg;
        }),
      );
    },
    [],
  );

  const accumulativeMessage = useCallback((id: string, opt: TextContent) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === id
          ? {
              ...msg,
              content: (msg.content ?? "") + (opt.text ?? ""),
              think: (msg.think ?? "") + (opt.think ?? ""),
            }
          : msg,
      ),
    );
  }, []);

  const abortRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      status.current = "ready";
      hasInitializedRef.current = false;
    }
  }, []);

  const sendMessage = useCallback(
    async (
      content: string,
      options?: DeepPartial<Omit<CompletionRequest, "messages">>,
      onSuccess?: () => void,
    ) => {
      if (status.current !== "ready" || !conversationId) return;

      // 取消之前的请求
      if (abortControllerRef.current) {
        console.log("取消之前的请求");
        abortControllerRef.current.abort();
      }

      // 创建新的AbortController
      const newAbortController = new AbortController();
      abortControllerRef.current = newAbortController;

      status.current = "submitted";
      let aiMessageId = "";
      const requestData: CompletionRequest = {
        model,
        botId: completionConfig.botId,
        conversationId,
        ...options,
        completionsOption: {
          ...completionConfig.completionsOption,
          ...options?.completionsOption,
        },
        messages: [
          {
            content,
            contentType: 0,
            attaches: [],
            references: [],
            role: "user",
          },
        ],
      };

      try {
        const token = tokenStore.get();
        const response = await fetch(`${BASE_URL}/v1/completions`, {
          method: "POST",
          headers: {
            Authorization: token || "",
            ...GlobalHeader.get(),
          },
          body: JSON.stringify(requestData),
          signal: newAbortController.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        let tempUserMessageId = addMessage({
          content,
          role: "user",
          isStreaming: false,
        });

        if (!response.body) {
          throw new Error("Empty Body!");
        }
        const reader = response.body.getReader();
        if (!reader) {
          throw new Error("无法读取响应流");
        }

        const decoder = new TextDecoder();
        let buffer = "";
        // let currentId = 0;
        let currentType: StreamChunk["event"] = "meta";
        status.current = "streaming";
        onSuccess?.();
        if (options?.completionsOption?.isReplace) {
          setLastAssistantMessageBranch([]);
        }
        if (options?.completionsOption?.selectedRegenId) {
          if (lastAssistantMessageId.current) {
            // 使用函数式更新获取最新的 lastAssistantMessageBranch
            setLastAssistantMessageBranch((currentBranch) => {
              const message = currentBranch.find(
                (i) => i.id === options?.completionsOption?.selectedRegenId,
              );
              if (message && lastAssistantMessageId.current) {
                modifyMessage(lastAssistantMessageId.current, message);
              }
              return [];
            });
          }
          selectBranchIdRef.current = null;
        }
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const rawLine of lines) {
            const line = rawLine.trimEnd();
            if (line.startsWith("id: ")) {
              // currentId = Number.parseInt(line.substring(4), 10);
              continue;
            }
            if (line.startsWith("event: ")) {
              currentType = line.substring(7).trim() as StreamChunk["event"];
              continue;
            }
            if (line.startsWith("data: ")) {
              const dataStr = line.substring(6).trim();
              if (dataStr.trim() === "{}") continue;

              try {
                const _data = JSON.parse(dataStr);
                if (currentType === "chat") {
                  const data = _data as SSEDataPayload;
                  const content = JSON.parse(
                    data.message.content,
                  ) as TextContent;
                  if (content.text) {
                    accumulativeMessage(aiMessageId, { text: content.text });
                  }
                  if (content.think) {
                    accumulativeMessage(aiMessageId, { think: content.think });
                  }
                } else if (currentType === "meta") {
                  const data = _data as SSEMeta;
                  console.log("meta:", data);
                  if (!aiMessageId) {
                    aiMessageId = addMessage({
                      id: data.messageId,
                      role: "assistant",
                      isStreaming: true,
                    });
                  }
                  if (data?.replyId !== tempUserMessageId) {
                    modifyMessage(tempUserMessageId, {
                      id: data.replyId,
                    });
                    tempUserMessageId = data.replyId;
                    lastUserMessageId.current = tempUserMessageId;
                  }
                } else if (currentType === "model") {
                  const data = _data as SSEModel;
                  console.log("model:", data);
                }
              } catch (e) {
                console.error("解析数据失败:", e, dataStr);
              }
            }
          }
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          console.log("请求被取消");
          return;
        }
        console.error("发送消息失败:", error);
        // 更新AI消息为错误状态
        modifyMessage(aiMessageId, {
          content: "抱歉，发生了错误，请重试。",
          isStreaming: false,
        });
      } finally {
        status.current = "ready";
        hasInitializedRef.current = false;
        abortControllerRef.current = null;
        // 完成流式输出
        modifyMessage(aiMessageId, { isStreaming: false }, (msg) => {
          if (options?.completionsOption?.isRegen) {
            setLastAssistantMessageBranch((pre) => {
              if (!pre.some((i) => i.id === aiMessageId)) {
                return [...pre, msg];
              }
              return pre;
            });
          }
        });
        const {
          initMessage: currentInitMessage,
          hasProcessed: currentHasProcessed,
        } = useInitMessageStore.getState();
        console.log(!currentInitMessage && currentHasProcessed);
        if (!currentInitMessage && currentHasProcessed) {
          await genConversationTitle({
            conversationId,
            messages: requestData.messages,
          });
          queryClient.invalidateQueries({
            queryKey: [ClientQueryKeys.consversation.conversationHistory],
          });
        }
      }
    },
    [
      conversationId,
      addMessage,
      modifyMessage,
      accumulativeMessage,
      completionConfig,
      queryClient,
      model,
    ],
  );
  const handleFeedback = useCallback((props: FeedbackProps) => {
    const { messageId, action } = props;
    feedbackMessage(props)
      .then(() => {
        if (!props.forRegenList)
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === messageId ? { ...msg, feedback: action } : msg,
            ),
          );
        else {
          setLastAssistantMessageBranch((pre) =>
            pre.map((msg) =>
              msg.id === messageId ? { ...msg, feedback: action } : msg,
            ),
          );
        }
        toast("反馈成功！");
      })
      .catch(() => {
        toast.error("反馈失败!");
      });
  }, []);
  return {
    status: status.current,
    messages,
    rollbackMessagesTo,
    lastAssistantMessageId,
    lastUserMessageId,
    lastAssistantMessageBranch,
    sendMessage,
    abortRequest,
    handleFeedback,
    fetchEarlier,
    hasMoreEarlier,
    isFetchingEarlier,
    selectBranchIdRef,
  };
}
