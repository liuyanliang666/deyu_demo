import { useState, useRef, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { env } from "@/env";
import type { ASRResponse } from "@/apis/requests/asr";
import { tokenStore } from "@/lib/request";
import Recorder from "recorder-core";

interface UseAsrRecognitionReturn {
  status: "idle" | "pending" | "recognizing";
  startRecognition: () => void;
  stopRecognition: () => void;
  error: string | null;
}

type RecognitionMode = "ws" | "speech" | null;

type SpeechRecognitionCtor = new () => {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: unknown) => void) | null;
  onerror: ((event: unknown) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}
export function useAsrRecognition({
  onMessage,
}: {
  onMessage: (recognizedText: string) => void;
}): UseAsrRecognitionReturn {
  const [status, setStatus] = useState<"idle" | "pending" | "recognizing">(
    "idle"
  );
  const onlineTextRef = useRef<string>("");
  const offlineTextRef = useRef<string>("");
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const recorderRef = useRef<ReturnType<typeof Recorder> | null>(null); // Recorder实例
  const speechRef = useRef<InstanceType<SpeechRecognitionCtor> | null>(null);
  const modeRef = useRef<RecognitionMode>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sampleBufRef = useRef<Int16Array>(new Int16Array());
  const clearText = () => {
    onlineTextRef.current = "";
    offlineTextRef.current = "";
  };
  // 清理资源
  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    if (recorderRef.current) {
      recorderRef.current.close();
      recorderRef.current = null;
    }

    if (speechRef.current) {
      try {
        speechRef.current.stop();
      } catch {
        // ignore
      }
      speechRef.current = null;
    }

    // 清空采样缓冲区
    sampleBufRef.current = new Int16Array();
    modeRef.current = null;
    clearText();
    setStatus("idle");
  }, []);

  // 处理录音数据（类似CLI的recProcess函数）
  const processAudioData = useCallback(
    (
      buffer: Float32Array[],
      _powerLevel: number,
      _bufferDuration: number,
      bufferSampleRate: number,
      _newBufferIdx: number,
      asyncEnd?: () => void
    ) => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        asyncEnd?.();
        return;
      }

      try {
        // 从buffer数组取最新的数据（类似CLI的data_48k = buffer[buffer.length-1]）
        const data_48k = buffer[buffer.length - 1];

        // 采样率转换：从bufferSampleRate（通常48k）到16000
        const array_48k = new Array(data_48k);
        const data_16k = Recorder.SampleData(
          array_48k,
          bufferSampleRate,
          16000
        ).data;

        // 累积数据到sampleBuf（类似CLI的sampleBuf累积）
        const newSampleBuf = Int16Array.from([
          ...sampleBufRef.current,
          ...data_16k,
        ]);
        sampleBufRef.current = newSampleBuf;

        // 分块发送：每次发送960个样本（960*2字节=1920字节，相当于120ms@16kHz）
        const chunk_size = 960;
        while (sampleBufRef.current.length >= chunk_size) {
          const sendBuf = sampleBufRef.current.slice(0, chunk_size);
          sampleBufRef.current = sampleBufRef.current.slice(chunk_size);

          // 直接发送Int16Array数据（类似CLI的wsconnecter.wsSend）
          wsRef.current?.send(sendBuf);
        }
      } catch (err) {
        console.error("处理录音数据失败:", err);
      }

      asyncEnd?.();
    },
    []
  );

  // 停止语音识别时发送尾包
  const sendLastPacket = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const lastPacket = new Uint8Array([255]); // 全为1的字节 (0xFF)
      wsRef.current.send(lastPacket);
    }
  }, []);

  // 停止语音识别
  const stopRecognition = useCallback(() => {
    if (status === "idle") return;
    try {
      if (modeRef.current === "speech") {
        speechRef.current?.stop();
        toast.info("正在停止语音输入...");
        cleanup();
        return;
      }

      sendLastPacket();

      // 停止Recorder录音
      if (recorderRef.current) {
        recorderRef.current.stop(
          () => {
            // 录音停止后的回调
            console.log("录音已停止");
          },
          (err: string) => {
            console.error("停止录音失败:", err);
          }
        );
      }

      toast.info("正在停止语音识别，请稍后...");
    } catch (err) {
      console.error("停止语音识别失败:", err);
      setError("停止语音识别失败");
    } finally {
      timeoutRef.current = setTimeout(() => cleanup(), 3000);
    }
  }, [cleanup, sendLastPacket, status]);

  const startSpeechRecognition = useCallback(() => {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) {
      setError("当前浏览器不支持语音识别");
      toast.error("当前浏览器不支持语音识别");
      cleanup();
      return;
    }

    const recognition = new Ctor();
    speechRef.current = recognition;
    modeRef.current = "speech";

    setStatus("recognizing");
    setError(null);
    clearText();

    let finalText = "";
    recognition.lang = "zh-CN";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: unknown) => {
      try {
        // Web Speech API 类型在 TS 里不稳定，这里做最小化解析
        const e = event as {
          resultIndex: number;
          results: ArrayLike<{
            isFinal: boolean;
            0: { transcript: string };
          }>;
        };
        let interim = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const res = e.results[i];
          const transcript = res[0]?.transcript ?? "";
          if (res.isFinal) {
            finalText += transcript;
          } else {
            interim += transcript;
          }
        }
        onMessage(`${finalText}${interim}`.trim());
      } catch (err) {
        console.error("解析 SpeechRecognition 结果失败:", err);
      }
    };

    recognition.onerror = (event: unknown) => {
      console.error("SpeechRecognition 错误:", event);
      setError("语音识别失败");
      toast.error("语音识别失败");
      cleanup();
    };

    recognition.onend = () => {
      cleanup();
    };

    try {
      recognition.start();
      toast.success("开始语音输入");
    } catch (err) {
      console.error("启动 SpeechRecognition 失败:", err);
      setError("启动语音识别失败");
      toast.error("启动语音识别失败");
      cleanup();
    }
  }, [cleanup, onMessage]);

  // 开始语音识别
  const startRecognition = useCallback(async () => {
    if (timeoutRef.current) return;
    if (status !== "idle") return;
    setStatus("pending");
    try {
      setError(null);
      clearText();

      // 创建Recorder录音机（类似CLI的配置）
      const recorder = Recorder({
        type: "pcm",
        bitRate: 16,
        sampleRate: 16000, // 目标采样率16kHz
        onProcess: processAudioData, // 使用新的PCM处理函数
      });
      recorderRef.current = recorder;
      modeRef.current = "ws";

      // 建立 WebSocket 连接
      const ws = new WebSocket(env.VITE_ASR_WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        // 发送初始化消息
        ws.send(
          JSON.stringify({
            Authorization: tokenStore.get(),
          })
        );

        // 发送首包 (FirstASR包，全0长度为1的字节数组)
        const firstPacket = new Uint8Array([0]);
        ws.send(firstPacket);

        // 开始录制（Recorder的start方法）
        recorder.open(
          () => {
            recorder.start();
            setStatus("recognizing");
            toast.success("开始语音识别");
          },
          (err: string) => {
            console.error("录音启动失败:", err);
            setError("录音启动失败");
            cleanup();
          }
        );
      };

      ws.onmessage = (event) => {
        try {
          const response: ASRResponse = JSON.parse(event.data);
          if (
            response.mode === "2pass-offline" ||
            response.mode === "offline"
          ) {
            offlineTextRef.current += response.text;
            onlineTextRef.current = "";
          } else {
            onlineTextRef.current += response.text;
          }
          onMessage(offlineTextRef.current + onlineTextRef.current);
        } catch (err) {
          console.error("解析 ASR 响应失败:", err);
          setError("解析识别结果失败");
        }
      };

      ws.onerror = (err) => {
        console.error("WebSocket 错误:", err);
        setError("语音识别连接失败");
        toast.error("语音识别连接失败，尝试使用浏览器语音识别...");
        ws.onerror = null;
        ws.onclose = null;
        cleanup();
        startSpeechRecognition();
      };

      ws.onclose = (event) => {
        console.log("WebSocket 连接关闭", event);
        if (modeRef.current === "ws") {
          cleanup();
        }
      };
    } catch (err) {
      console.error("启动语音识别失败:", err);
      if (err instanceof Error) {
        if (err.name === "NotAllowedError") {
          setError("麦克风权限被拒绝");
          toast.error("请允许麦克风权限");
        } else if (err.name === "NotFoundError") {
          setError("未找到麦克风设备");
          toast.error("未找到麦克风设备");
        } else {
          setError("启动语音识别失败");
          toast.error("启动语音识别失败");
        }
      } else {
        setError("未知错误");
        toast.error("启动语音识别失败");
      }
      cleanup();
      startSpeechRecognition();
    }
  }, [cleanup, processAudioData, startSpeechRecognition, status]);

  // 组件卸载时清理资源
  useEffect(() => cleanup, [cleanup]);

  return {
    status,
    startRecognition,
    stopRecognition,
    error,
  };
}
