//
"use client";

import { createConversation } from "@/apis/requests/conversation/create";
import { Actions, Action } from "@/components/ai-elements/actions";
import { Response } from "@/components/ai-elements/response";
import { useStreamCompletion } from "@/hooks/use-stream-completion";
import { useInitMessageStore } from "@/store/initMessage";
import { useNavigate, useParams, useSearch } from "@tanstack/react-router";
import {
  ChevronLeft,
  Copy,
  Mic,
  MoreHorizontal,
  Paperclip,
  Send,
  Smile,
  Sparkles,
  ThumbsDownIcon,
  ThumbsUpIcon,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { AGENTS } from "./constants/agents";

export default function ConversationPage() {
  const navigate = useNavigate();
  const { conversationId } = useParams({ strict: false });
  const { agentId: agentIdFromSearch } = useSearch({ strict: false }) as {
    agentId?: string;
  };

  // 如果 URL 参数能命中 AGENTS，说明这是“选了智能体但还没创建会话”的占位页
  const agentFromParam = useMemo(
    () => AGENTS.find((a) => a.id === conversationId),
    [conversationId],
  );
  const isAgentPlaceholder = !!agentFromParam;
  const selectedAgentId = agentFromParam?.id ?? agentIdFromSearch;
  const activeAgent = useMemo(
    () => AGENTS.find((a) => a.id === selectedAgentId) ?? AGENTS[0],
    [selectedAgentId],
  );

  // 占位页不传 conversationId 给 hook（否则会 404）
  const hookConversationId = isAgentPlaceholder ? undefined : conversationId;

  const { status, messages, sendMessage, handleFeedback } = useStreamCompletion(
    hookConversationId as string,
  );

  const {
    initMessage,
    hasProcessed,
    markAsProcessed,
    clearInitMessage,
    setInitMessage,
  } = useInitMessageStore();

  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const copyText = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("已复制");
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      textarea.style.top = "-9999px";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      toast.success("已复制");
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  }, [messages, status]);

  // “创建会话后自动发送”的首条消息
  useEffect(() => {
    if (!hookConversationId) return;
    if (initMessage && !hasProcessed) {
      markAsProcessed();
      const message = initMessage;
      clearInitMessage();
      sendMessage(message);
    }
  }, [
    hookConversationId,
    initMessage,
    hasProcessed,
    markAsProcessed,
    clearInitMessage,
    sendMessage,
  ]);

  const createConversationAndRedirect = useCallback(
    async (firstMessage: string) => {
      const abort = new AbortController();
      const conversation = await createConversation(abort);
      setInitMessage(firstMessage);
      await navigate({
        to: "/chat/$conversationId",
        params: { conversationId: conversation.conversationId },
        search: selectedAgentId ? { agentId: selectedAgentId } : undefined,
        replace: true,
      });
    },
    [navigate, selectedAgentId, setInitMessage],
  );

  const handleSend = useCallback(async () => {
    if (!input.trim() || status !== "ready") return;

    const content = input;
    setInput("");

    // 占位页：先创建会话，再自动发送首条消息
    if (isAgentPlaceholder) {
      try {
        await createConversationAndRedirect(content);
      } catch (e) {
        console.error("createConversation failed:", e);
        toast.error("创建对话失败，请稍后重试");
      }
      return;
    }

    sendMessage(content);
  }, [
    createConversationAndRedirect,
    input,
    isAgentPlaceholder,
    sendMessage,
    status,
  ]);

  const renderHeader = () => {
    const Icon = activeAgent.icon;

    return (
      <header className="bg-white/90 backdrop-blur border-b border-slate-100 px-4 lg:px-6 py-3 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate({ to: "/chat" })}
            className="w-9 h-9 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center justify-center transition-all border border-slate-200"
          >
            <ChevronLeft size={18} strokeWidth={2.5} />
          </button>

          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl bg-gradient-to-br ${activeAgent.gradient || "from-slate-400 to-slate-500"} flex items-center justify-center text-white shadow-md relative`}
            >
              <Icon size={20} strokeWidth={2} />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div>
              <h1 className="font-bold text-slate-900 text-base flex items-center gap-2">
                {activeAgent.name || "智能助手"}
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded bg-${activeAgent.theme || "slate"}-50 text-${activeAgent.theme || "slate"}-600 font-semibold border border-${activeAgent.theme || "slate"}-100`}
                >
                  v2.0
                </span>
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                {activeAgent.type === "content"
                  ? "Content Generator"
                  : "Empathetic Chat"}{" "}
                · 在线
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="p-2 text-slate-400 hover:text-blue-600 transition-colors hover:bg-blue-50 rounded-lg"
            title="清空"
          >
            <Sparkles size={18} />
          </button>
          <div className="h-4 w-px bg-slate-200 mx-1"></div>
          <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors hover:bg-slate-50 rounded-lg">
            <MoreHorizontal size={18} />
          </button>
        </div>
      </header>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-white font-sans relative">
      {renderHeader()}

      {/* 聊天区域 */}
      <div className="flex-1 overflow-y-auto bg-slate-50/50 relative scroll-smooth p-4 lg:p-8 pb-8">
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.02]"
          style={{
            backgroundImage: "radial-gradient(#475569 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        ></div>

        <div className="max-w-3xl mx-auto space-y-8">
          {/* 新开智能体占位页：欢迎语 */}
          {isAgentPlaceholder && messages.length === 0 && (
            <div className="flex justify-start">
              <div className="flex flex-col gap-1 max-w-[80%]">
                <span className="text-[10px] text-slate-400 font-medium pl-1">
                  {activeAgent.name}
                </span>
                <div className="p-4 rounded-2xl shadow-sm text-[15px] leading-relaxed bg-white text-slate-700 border border-slate-100 rounded-tl-sm">
                  你好！我是{activeAgent.name}。{activeAgent.desc}
                  请告诉我你需要什么帮助？
                  <div className="text-[10px] mt-2 opacity-50 flex items-center justify-end gap-1 text-slate-400">
                    <Sparkles size={8} /> 刚刚
                  </div>
                </div>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} group`}
            >
              <div
                className={`flex max-w-[90%] sm:max-w-[80%] gap-3 ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                <div className="flex flex-col gap-1 w-full">
                  <div
                    className={`p-4 rounded-2xl shadow-sm text-[15px] leading-relaxed relative ${
                      message.role === "user"
                        ? "bg-slate-900 text-white rounded-tr-sm shadow-slate-500/20"
                        : "bg-white text-slate-700 border border-slate-100 rounded-tl-sm shadow-slate-200/50"
                    }`}
                  >
                    <Response>{message.content}</Response>
                    {message.isStreaming && message.role === "assistant" && (
                      <div className="mt-2 flex items-center gap-1 text-slate-400">
                        <span className="sr-only">正在生成</span>
                        <span
                          className="h-1.5 w-1.5 rounded-full bg-current animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        />
                        <span
                          className="h-1.5 w-1.5 rounded-full bg-current animate-bounce"
                          style={{ animationDelay: "120ms" }}
                        />
                        <span
                          className="h-1.5 w-1.5 rounded-full bg-current animate-bounce"
                          style={{ animationDelay: "240ms" }}
                        />
                      </div>
                    )}
                  </div>

                  {!message.isStreaming && (
                    <Actions className="pl-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Action onClick={() => copyText(message.content)} tooltip="复制">
                        <Copy className="size-3" />
                      </Action>
                      {message.role === "assistant" && (
                        <>
                          <Action
                            onClick={() =>
                              handleFeedback({ messageId: message.id, action: 1 })
                            }
                            className={
                              message.feedback === 1
                                ? "text-slate-900 hover:text-slate-900"
                                : undefined
                            }
                            tooltip="赞"
                          >
                            <ThumbsUpIcon
                              className="size-3"
                              fill={
                                message.feedback === 1 ? "currentColor" : "none"
                              }
                            />
                          </Action>
                          <Action
                            onClick={() =>
                              handleFeedback({ messageId: message.id, action: 2 })
                            }
                            className={
                              message.feedback === 2
                                ? "text-slate-900 hover:text-slate-900"
                                : undefined
                            }
                            tooltip="踩"
                          >
                            <ThumbsDownIcon
                              className="size-3"
                              fill={
                                message.feedback === 2 ? "currentColor" : "none"
                              }
                            />
                          </Action>
                        </>
                      )}
                    </Actions>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 底部输入区 */}
      <div className="bg-white/90 backdrop-blur-xl border-t border-slate-100 p-4 lg:p-6 w-full z-30 shrink-0">
        <div className="max-w-3xl mx-auto">
          {/* 提示语（仅在占位页且无消息时显示） */}
          {isAgentPlaceholder && messages.length === 0 && activeAgent.prompts && (
            <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide mb-1 mask-image-fade">
              {activeAgent.prompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => setInput(prompt)}
                  className={`whitespace-nowrap text-xs font-medium px-4 py-2 rounded-xl border transition-all duration-200 shadow-sm hover:shadow-md active:scale-95 flex items-center gap-2 bg-white text-${activeAgent.theme}-600 border-${activeAgent.theme}-100 hover:bg-${activeAgent.theme}-50`}
                >
                  <Sparkles size={12} /> {prompt}
                </button>
              ))}
            </div>
          )}

          <div className="relative shadow-2xl shadow-slate-200/50 rounded-3xl group bg-white border border-slate-200 focus-within:border-blue-400 transition-colors overflow-hidden">
            <div className="absolute bottom-3 left-3 flex gap-1">
              <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full">
                <Paperclip size={18} />
              </button>
              <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full">
                <Mic size={18} />
              </button>
              <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full hidden sm:block">
                <Smile size={18} />
              </button>
            </div>

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={
                isAgentPlaceholder && activeAgent.id === "jieyoupu"
                  ? "这里是安全的树洞..."
                  : "请输入您的需求..."
              }
              className="w-full pl-4 pr-16 pb-14 pt-4 bg-transparent border-none focus:ring-0 outline-none resize-none max-h-32 min-h-[90px] text-slate-700 text-sm placeholder:text-slate-400"
              rows={1}
            />

            <div className="absolute right-2 bottom-2">
              <button
                onClick={handleSend}
                disabled={!input.trim() || status !== "ready"}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 font-medium text-sm ${
                  !input.trim() || status !== "ready"
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                    : "bg-slate-900 text-white shadow-lg hover:scale-105 active:scale-95"
                }`}
              >
                发送 <Send size={14} className={input.trim() ? "ml-0.5" : ""} />
              </button>
            </div>
          </div>

          <p className="text-center text-[10px] text-slate-400 mt-3 font-medium flex items-center justify-center gap-1">
            内容由 InnoSpark AI 生成，已通过德育价值对齐检测
          </p>
        </div>
      </div>
    </div>
  );
}
