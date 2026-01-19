interface DelayKeyMeta {
  key: string;
  delay?: number;
}
const delatTargetArr: DelayKeyMeta[] = [
  {
    key: "searchStart",
    delay: 800,
  },
  {
    key: "searchFind",
    delay: 800,
  },
  {
    key: "searchChoice",
    delay: 800,
  },
  {
    key: "searchCite",
    delay: 0,
  },
  {
    key: "event: model",
    delay: 800,
  },
];

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// 关键字按行延时计算

// 获取该行需要应用的延时（按匹配关键字的最大值计算）
function getDelayForLine(text: string): number {
  let maxDelay = 0;
  for (const { key, delay = 0 } of delatTargetArr) {
    if (text.includes(key)) {
      if (delay > maxDelay) maxDelay = delay;
    }
  }
  return maxDelay;
}

// 按 \n 分割文本并返回分割后的行
function splitByNewline(text: string): string[] {
  return text.split("\n");
}

// 把限速逻辑封装成"节流流"
export function throttledStream(
  rs: ReadableStream<Uint8Array>,
  interval: number,
): ReadableStream<Uint8Array> {
  return new ReadableStream({
    async start(ctrl) {
      const reader = rs.getReader();
      let last = performance.now();
      let buffer = ""; // 用于存储未完整分割的文本

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          // 处理剩余的缓冲区内容
          if (buffer) {
            const lines = splitByNewline(buffer);
            for (const line of lines) {
              // 限速
              if (interval > 0) {
                const now = performance.now();
                const elapsed = now - last;
                if (elapsed < interval) await sleep(interval - elapsed);
                last = now;
              }

              ctrl.enqueue(new TextEncoder().encode(`${line}\n`));

              // 按关键字应用对应延时（只对非空行检查）
              if (line.trim()) {
                const extraDelay = getDelayForLine(line);
                if (extraDelay > 0) {
                  await sleep(extraDelay);
                }
              }
            }
          }
          break;
        }

        // 将新的 chunk 添加到缓冲区
        const chunkText = new TextDecoder().decode(value);
        buffer += chunkText;

        // 按 \n 分割缓冲区内容
        const lines = splitByNewline(buffer);

        // 处理所有完整的行（除了最后一个，因为它可能不完整）
        for (let i = 0; i < lines.length - 1; i++) {
          const line = lines[i];

          // 限速
          if (interval > 0) {
            const now = performance.now();
            const elapsed = now - last;
            if (elapsed < interval) await sleep(interval - elapsed);
            last = now;
          }

          ctrl.enqueue(new TextEncoder().encode(`${line}\n`));

          // 按关键字应用对应延时（只对非空行检查）
          if (line.trim()) {
            const extraDelay = getDelayForLine(line);
            if (extraDelay > 0) {
              await sleep(extraDelay);
            }
          }
        }

        // 更新缓冲区，保留最后一个可能不完整的行
        const lastLine = lines[lines.length - 1];
        const lastNewlineIndex = buffer.lastIndexOf("\n");
        if (lastNewlineIndex !== -1) {
          buffer = lastLine;
        }
      }
      ctrl.close();
    },
  });
}
