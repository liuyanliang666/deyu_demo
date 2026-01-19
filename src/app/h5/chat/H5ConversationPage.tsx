"use client";
import UserPromptTextarea from "@/app/chat/components/UserPromptTextarea";
import { Actions } from "@/components/ai-elements/actions";
import { Action } from "@/components/ai-elements/actions";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent } from "@/components/ai-elements/message";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning";
import { Response } from "@/components/ai-elements/response";
import { useStreamCompletion } from "@/hooks/use-stream-completion";
import { toast } from "sonner";
import { useInitMessageStore } from "@/store/initMessage";
import { useParams } from "@tanstack/react-router";
import { Copy, LoaderCircle, ThumbsDownIcon, ThumbsUpIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import MessageEditor, {
  type MessageEditorRef,
} from "@/app/chat/components/MessageEditor";
import { useDebounceEffect } from "ahooks";
import {
  Branch,
  BranchMessages,
  BranchPrevious,
  BranchPage,
  BranchNext,
  BranchSelector,
} from "@/components/ai-elements/branch";

export default function ConversationPage() {
  const { conversationId } = useParams({ strict: false });
  const { initMessage, hasProcessed, markAsProcessed, clearInitMessage } =
    useInitMessageStore();
  const [hasInitMessageSubmitted, setHasInitMessageSubmitted] = useState(false);
  const [isReplace, setIsReplace] = useState(false);
  const inlinePromptTextareaRef = useRef<MessageEditorRef>(null);
  const previousMessageIdRef = useRef<string | null>(null);

  const {
    status,
    messages,
    sendMessage,
    lastAssistantMessageId,
    lastUserMessageId,
    abortRequest,
    handleFeedback,
    rollbackMessagesTo,
    selectBranchIdRef,
    fetchEarlier,
    lastAssistantMessageBranch,
    hasMoreEarlier,
    isFetchingEarlier,
  } = useStreamCompletion(conversationId as string);

  useEffect(() => {
    if (initMessage && !hasProcessed) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHasInitMessageSubmitted(true);
      markAsProcessed();
      const message = initMessage;
      clearInitMessage();
      sendMessage(message, void 0, () => {
        setHasInitMessageSubmitted(false);
      });
      // 发送消息后清除初始消息
    }
  }, [
    initMessage,
    hasProcessed,
    markAsProcessed,
    clearInitMessage,
    sendMessage,
  ]);
  // const handleRegenerate = () => {
  //   const lastUserMessage = messages.find(
  //     (message) => message.id === lastUserMessageId.current,
  //   );
  //   if (!lastUserMessage) return;
  //   const message = lastUserMessage.content;
  //   if (message && status === "ready") {
  //     rollbackMessagesTo(
  //       lastUserMessage.id,
  //       lastAssistantMessageBranch.length === 0,
  //     );
  //     setTimeout(() => {
  //       sendMessage(message, {
  //         completionsOption: { isRegen: true },
  //         replyId: lastUserMessage.id,
  //       });
  //     }, 0);
  //   }
  // };

  // const handleEditUserMessage = (message: string) => {
  //   // 将消息绑定到输入框中
  //   setIsReplace(true);
  //   // 使用 setTimeout 确保组件已经渲染
  //   setTimeout(() => {
  //     inlinePromptTextareaRef.current?.setTextContent(message);
  //     inlinePromptTextareaRef.current?.focus();
  //   }, 0);
  // };

  const cancelEditUserMessage = () => {
    inlinePromptTextareaRef.current?.blur();
    setIsReplace(false);
  };

  const handleSubmit = (message: string, onSuccess?: () => void) => {
    if (message.trim() && status === "ready") {
      if (isReplace) {
        inlinePromptTextareaRef.current?.blur();
        if (lastUserMessageId.current) {
          rollbackMessagesTo(lastUserMessageId.current);
        }
        setIsReplace(false);
      }
      setTimeout(() => {
        sendMessage(
          message,
          {
            completionsOption: {
              isReplace,
              selectedRegenId: lastAssistantMessageBranch.length
                ? (selectBranchIdRef.current ??
                  lastAssistantMessageBranch[
                    lastAssistantMessageBranch.length - 1
                  ].id)
                : undefined,
            },
          },
          onSuccess,
        );
      }, 0);
    }
  };

  const handleCopy = (message: string) => {
    toast.success("复制成功");
    navigator.clipboard.writeText(message);
  };

  // 顶部哨兵：当最上方消息触达到视图顶端时，加载更早消息
  const topSentinelRef = useRef<HTMLDivElement | null>(null);
  useDebounceEffect(
    () => {
      const el = topSentinelRef.current;
      if (!el) return;
      const observer = new IntersectionObserver(
        (entries) => {
          const first = entries[0];
          if (first.isIntersecting && hasMoreEarlier && !isFetchingEarlier) {
            document
              .querySelector("#list-container")
              ?.children[0]?.scrollTo(0, 32);
            fetchEarlier();
          }
        },
        { root: null, threshold: 0 },
      );
      observer.observe(el);
      return () => observer.disconnect();
    },
    [fetchEarlier, hasMoreEarlier, isFetchingEarlier],
    {
      wait: 800,
    },
  );
  useEffect(() => {
    const el = topSentinelRef.current;
    if (!el) return;
    if (messages.length) {
      const currentId = `mid-${messages[0].id}`;
      if (!previousMessageIdRef.current) {
        previousMessageIdRef.current = currentId;
      }
      const previousId = previousMessageIdRef.current;
      if (previousId === currentId) {
        return;
      }
      const previousNode = document.getElementById(previousId);
      if (!previousNode) {
        return;
      }
      const scrooler = document.querySelector("#list-container")?.children[0];
      scrooler?.scrollTo(0, previousNode?.offsetTop);
      previousMessageIdRef.current = currentId;
    }
  }, [messages]);
  return (
    <div className="max-w-[1000px] mx-auto p-6 py-0 relative size-full rounded-lg">
      <div className="flex flex-col h-full">
        <Conversation id="list-container" className="style__scoller-none">
          <ConversationContent className="relative">
            {!initMessage && !hasProcessed ? (
              isFetchingEarlier ? (
                <div className="absolute w-full justify-center flex py-4">
                  <LoaderCircle className="animate-spin duration-500 stroke-primary" />
                </div>
              ) : (
                <div ref={topSentinelRef} className="w-full p-1" />
              )
            ) : null}
            {messages.map((message) => (
              <Message
                id={`mid-${message.id}`}
                key={message.id}
                from={message.role}
              >
                {message.role === "user" ? (
                  message.id !== lastUserMessageId.current || !isReplace ? (
                    <div className="flex flex-col items-end">
                      <MessageContent>
                        <p>{message.content}</p>
                      </MessageContent>
                      {status === "ready" &&
                        lastUserMessageId.current === message.id && (
                          <Actions className="mt-2">
                            <Action
                              label="Copy"
                              onClick={() => handleCopy(message.content)}
                            >
                              <Copy className="size-4" />
                            </Action>
                            {/* <Action
                              label="Regenerate"
                              onClick={() =>
                                handleEditUserMessage(message.content)
                              }
                            >
                              <PencilLine className="size-4" />
                            </Action> */}
                          </Actions>
                        )}
                    </div>
                  ) : (
                    <MessageEditor
                      ref={inlinePromptTextareaRef}
                      onSubmit={handleSubmit}
                      onExit={cancelEditUserMessage}
                      disabled={status !== "ready"}
                    />
                  )
                ) : (
                  <div className="flex gap-3">
                    <div>
                      <div className="size-10 order-1 rounded-full overflow-hidden">
                        <img src="/logo.jpg" alt="张江高科·高科芯" />
                      </div>
                    </div>
                    <div className="flex flex-col bg-white style__shallow-shadow rounded-3xl">
                      <MessageContent>
                        <Branch
                          onBranchChange={(index) => {
                            selectBranchIdRef.current =
                              lastAssistantMessageBranch[index].id;
                          }}
                        >
                          <BranchMessages>
                            {(message.id === lastAssistantMessageId.current
                              ? lastAssistantMessageBranch.length
                                ? message.isStreaming
                                  ? [message]
                                  : lastAssistantMessageBranch
                                : [message]
                              : [message]
                            ).map((_message, _, messageArray) => {
                              const forRegenList = messageArray.length > 1;
                              // const regenerateable =
                              //   _message.id ===
                              //     lastAssistantMessageId.current ||
                              //   messageArray.length > 1;
                              return (
                                <div key={_message.id}>
                                  <div>
                                    {_message.think && (
                                      <Reasoning
                                        defaultOpen={!_message.isCompleteThink}
                                        className=""
                                        isStreaming={status === "streaming"}
                                      >
                                        <ReasoningTrigger
                                          isCompleted={_message.isCompleteThink}
                                        />
                                        <ReasoningContent className="text-[#80808f]">
                                          {_message.think}
                                        </ReasoningContent>
                                      </Reasoning>
                                    )}
                                    {!!_message.content && (
                                      <Response>{_message.content}</Response>
                                    )}
                                    {_message.isStreaming &&
                                      !_message.think &&
                                      !_message.content && (
                                        <LoaderCircle className="size-4 animate-spin" />
                                      )}
                                  </div>

                                  {!message.isStreaming && (
                                    <Actions className="mt-2">
                                      <Action
                                        label="Copy"
                                        onClick={() =>
                                          handleCopy(_message.content)
                                        }
                                      >
                                        <Copy className="size-4" />
                                      </Action>
                                      {/*                                       {regenerateable && (
                                        <Action
                                          label="Regenerate"
                                          onClick={handleRegenerate}
                                        >
                                          <RefreshCcw className="size-4" />
                                        </Action>
                                      )} */}
                                      {_message.feedback === 1 ? (
                                        <Action
                                          onClick={handleFeedback.bind(null, {
                                            action: 0,
                                            messageId: _message.id,
                                            forRegenList,
                                          })}
                                          label="Like"
                                        >
                                          <ThumbsUpIcon className="size-4 fill-primary" />
                                        </Action>
                                      ) : _message.feedback === 2 ? (
                                        <Action
                                          onClick={handleFeedback.bind(null, {
                                            action: 0,
                                            messageId: _message.id,
                                            forRegenList,
                                          })}
                                          label="DisLike"
                                        >
                                          <ThumbsDownIcon className="size-4 fill-primary" />
                                        </Action>
                                      ) : (
                                        <>
                                          <Action
                                            onClick={handleFeedback.bind(null, {
                                              action: 1,
                                              messageId: _message.id,
                                              forRegenList,
                                            })}
                                            label="Like"
                                          >
                                            <ThumbsUpIcon className="size-4" />
                                          </Action>
                                          <Action
                                            onClick={handleFeedback.bind(null, {
                                              action: 2,
                                              messageId: _message.id,
                                              forRegenList,
                                            })}
                                            label="Dislike"
                                          >
                                            <ThumbsDownIcon className="size-4" />
                                          </Action>
                                        </>
                                      )}
                                      {messageArray.length > 1 && (
                                        <BranchSelector from="assistant" className="p-0 self-center">
                                          <BranchPrevious />
                                          <BranchPage />
                                          <BranchNext />
                                        </BranchSelector>
                                      )}
                                    </Actions>
                                  )}
                                </div>
                              );
                            })}
                          </BranchMessages>
                        </Branch>
                      </MessageContent>
                    </div>
                  </div>
                )}
              </Message>
            ))}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
        <UserPromptTextarea
          className="mx-auto sticky bottom-4 cursor-text aspect-auto max-h-42 min-h-24"
          onSubmit={handleSubmit}
          onAbort={abortRequest}
          status={hasInitMessageSubmitted ? "submitted" : status}
        />
      </div>
    </div>
  );
}
