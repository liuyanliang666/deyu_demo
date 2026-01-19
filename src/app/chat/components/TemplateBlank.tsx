import type React from "react";
import { useEffect, useMemo, useState } from "react";

const TemplateBlank = ({
  templateArr,
  setValue,
  disabled,
  ...props
}: React.ComponentProps<"span"> & {
  templateArr: string[];
  disabled: boolean; // 来自父组件的可编辑标记（当前实现将其视为可编辑开关）
  setValue: (text: string) => unknown;
}) => {
  const isEditable = disabled; // 兼容父组件传值：父处传的是 contentEditable 条件

  const blanksCount = Math.max(templateArr.length - 1, 0);
  const [blankState, setBlankState] = useState<string[]>(() =>
    Array.from({ length: blanksCount }, () => ""),
  );

  // 为每个片段与分组生成稳定 key，避免直接使用数组索引作为 key
  const segmentKeys = useMemo(() => {
    // 以模板内容和长度作为稳定性因子
    const salt = `${templateArr.length}-${blanksCount}-${templateArr.join("|")}`;
    return templateArr.map((s) => `${s}__${salt}`);
  }, [templateArr, blanksCount]);
  const groupKeys = useMemo(
    () => segmentKeys.map((k) => `group__${k}`),
    [segmentKeys],
  );

  // 当模板长度变化时，重置/校正本地空白数量
  useEffect(() => {
    if (blanksCount !== blankState.length) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setBlankState((prev) => {
        const next = Array.from(
          { length: blanksCount },
          (_, i) => prev[i] ?? "",
        );
        return next;
      });
    }
  }, [blanksCount, blankState.length]);

  const composePrompt = (blanks: string[]) => {
    if (templateArr.length === 0) return "";
    let acc = templateArr[0] ?? "";
    for (let i = 1; i < templateArr.length; i += 1) {
      const fill = blanks[i - 1] ?? "";
      acc += fill + (templateArr[i] ?? "");
    }
    return acc;
  };

  const sanitizeText = (text: string) =>
    text
      .replace(/[\r\n\u2028\u2029]/g, " ") // 换行与分隔符替换为空格
      .replace(/\s{2,}/g, " ") // 折叠多空格
      .trim();

  const handleInputAt =
    (blankIndex: number) => (e: React.FormEvent<HTMLSpanElement>) => {
      if (!isEditable) return;
      const target = e.currentTarget as HTMLSpanElement;
      const newValue = sanitizeText(target.innerText);
      setBlankState((prev) => {
        const next = prev.slice();
        next[blankIndex] = newValue;
        // 计算并在微任务/下一拍调度回传，避免在渲染阶段更新父组件
        const prompt = composePrompt(next);
        if (typeof queueMicrotask === "function") {
          queueMicrotask(() => setValue(prompt));
        } else {
          setTimeout(() => setValue(prompt), 0);
        }
        return next;
      });
    };

  const handlePaste = (e: React.ClipboardEvent<HTMLSpanElement>) => {
    if (!isEditable) return;
    e.preventDefault();
    const raw = e.clipboardData.getData("text/plain");
    const text = sanitizeText(raw);
    document.execCommand("insertText", false, text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLSpanElement>) => {
    if (!isEditable) return;
    if (e.key === "Enter") {
      e.preventDefault(); // 禁止回车插入换行
    }
  };

  // 创建 n-1 个可编辑输入框，交替与模板片段渲染
  return (
    <span>
      {templateArr.map((segment, index) => {
        if (index === 0) {
          return <span key={segmentKeys[0]}>{segment}</span>;
        }
        const bIndex = index - 1;
        return (
          <span key={groupKeys[index]}>
            <span
              key={`blank__${segmentKeys[index]}`}
              {...props}
              contentEditable={isEditable}
              suppressContentEditableWarning
              onInput={handleInputAt(bIndex)}
              onPaste={handlePaste}
              onKeyDown={handleKeyDown}
            />
            <span key={segmentKeys[index]}>{segment}</span>
          </span>
        );
      })}
    </span>
  );
};

export default TemplateBlank;
