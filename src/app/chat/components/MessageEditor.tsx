import {
  PromptInput,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useImperativeHandle, useRef, useState } from "react";

export type MessageEditorRef = {
  setTextContent: (textContent: string) => void;
  focus: () => void;
  blur: () => void;
};

export default function MessageEditor({
  onSubmit,
  disabled = false,
  onExit,
  ref,
  className,
}: {
  ref: React.RefObject<MessageEditorRef | null>;
  onSubmit: (value: string, onSuccess?: () => void) => void;
  disabled?: boolean;
  onExit: () => void;
  className?: string;
}) {
  const [value, setValue] = useState("");

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useImperativeHandle(ref, () => ({
    setTextContent: (textContent: string) => {
      setValue(textContent);
    },
    focus: () => {
      textareaRef.current?.focus();
    },
    blur: () => {
      textareaRef.current?.blur();
    },
  }));

  return (
    <PromptInput
      className={cn(
        "bg-transparent border-none outline-none shadow-none rounded-xl",
        className,
      )}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(value, () => {
          setValue("");
        });
      }}
    >
      <div className="inset-2 border-2 border-primary rounded-xl">
        <PromptInputTextarea
          ref={textareaRef}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
          }}
        />
      </div>
      <PromptInputToolbar className="mt-2 flex justify-end">
        <PromptInputTools>
          <Button variant={"outline"} disabled={disabled} onClick={onExit}>
            取消
          </Button>
          <Button disabled={disabled} type="submit">
            确认
          </Button>
        </PromptInputTools>
      </PromptInputToolbar>
    </PromptInput>
  );
}
