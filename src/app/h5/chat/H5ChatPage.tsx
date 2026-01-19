import { createConversation } from "@/apis/requests/conversation/create";
import UserPromptTextarea from "@/app/chat/components/UserPromptTextarea";
import { cardList, modelMap, type Card } from "@/app/chat/constants";
import Stack from "@/components/Stack";
import { useInitMessageStore } from "@/store/initMessage";
import { useNavigate, useSearch } from "@tanstack/react-router";
import type { ChatStatus } from "ai";
import { useEffect, useCallback, useRef, useState } from "react";
import "./agent-card.css";

const H5ChatPage = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<ChatStatus>("ready");
  const signal = useRef<AbortController | null>(null);
  const { setInitMessage, setModel } = useInitMessageStore();
  const { model } = useSearch({ from: "/_authenticated/chat/" });
  const [cards, setCards] = useState<Card[]>([
    ...cardList,
    {
      description: "高科芯 · 德育大模型",
      imgUrl: "/chats/bot.png",
      model: "deyu-default",
      name: "",
    },
  ]);
  useEffect(() => {
    setModel(
      model ?? "deyu-default",
      modelMap.get(model ?? "deyu-default") ?? ""
    );
    if (model)
      setCards((c) => {
        const initCards = [...c];
        const currentModel = model ?? "deyu-default";
        const targetIndex = initCards.findIndex(
          (card) => card.model === currentModel
        );

        // 如果找到了目标卡片且不在最后一个位置，则移动到最后一个位置
        if (targetIndex !== -1 && targetIndex !== initCards.length - 1) {
          const [targetCard] = initCards.splice(targetIndex, 1);
          initCards.push(targetCard);
        }

        return initCards;
      });
  }, [setModel, model]);
  const abortRequest = useCallback(() => {
    if (signal.current) {
      setStatus("ready");
      signal.current.abort();
      signal.current = null;
    }
  }, []);

  const handleSubmit = async (message: string, onSuccess?: () => void) => {
    if (message.trim() && status === "ready") {
      setStatus("submitted");
      try {
        signal.current = new AbortController();
        console.log("创建对话并发送消息:", message);
        const conversation = await createConversation(signal.current);
        console.log("对话创建成功:", conversation);

        // 将初始消息存储到状态库中
        setInitMessage(message);

        // 跳转到对话页面
        onSuccess?.();
        navigate({
          to: "/chat/$conversationId",
          params: { conversationId: conversation.conversationId },
        });
      } catch (error) {
        console.error("创建对话失败:", error);
      } finally {
        setStatus("ready");
        signal.current = null;
      }
    }
  };

  const sendToBack = (id: string) => {
    const newCards = [...cards];
    const index = newCards.findIndex((card) => card.name === id);
    const [card] = newCards.splice(index, 1);
    newCards.unshift(card);
    setCards(newCards);
    const newCardTop = newCards[newCards.length - 1];
    setModel(newCardTop.model, newCardTop.name);
  };
  return (
    <div className="flex flex-col justify-between h-full">
      <div className="h-1/5 flex justify-center items-center">
        <img
          src="/fake-auth-title-1.png"
          className="w-4/5"
          alt="张江高科德育大模型"
        />
      </div>
      <Stack
        className="flex justify-center -translate-x-2 items-center h-1/2"
        cards={cards}
        sendToBack={sendToBack}
      />
      <div className="mx-2 flex-1 flex flex-col justify-end">
        <UserPromptTextarea
          className="row-span-4 max-w-full align-middle h-fit cursor-text aspect-auto max-h-42 min-h-24"
          onSubmit={handleSubmit}
          onAbort={abortRequest}
          status={status}
        />
      </div>
    </div>
  );
};

export default H5ChatPage;
