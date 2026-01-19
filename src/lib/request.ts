import type {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from "axios";
import axios from "axios";
import z from "zod";
import { toast } from "sonner";
import { env } from "@/env";

// 基础配置
export let BASE_URL = env.VITE_API_BASE_URL;
declare global {
  interface Window {
    setBase(base: string): void;
  }
}
window.setBase = (base: string) => {
  BASE_URL = base;
  httpClient = createAxiosInstance();
};
const DEFAULT_TIMEOUT = 120000;
export const TOKEN_KEY = "token";
export const tokenStore = {
  get: () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (import.meta.env.MODE === "test") {
      return "xh-polaris";
    }
    return token;
  },
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  remove: () => {
    localStorage.removeItem(TOKEN_KEY);
  },
};
export const GlobalHeader = {
  get: () => {
    const headers = {
      "Content-Type": "application/json",
      [env.VITE_BACKEND_ENV_HEAD]: env.VITE_BACKEND_ENV_VALUE,
    };
    return headers;
  },
};
// 通用响应数据格式
interface ApiResponse<T = unknown> {
  code: number | string;
  msg: string;
  data: T;
}

function sleep(time: number) {
  return new Promise((res) => {
    setTimeout(res, time);
  });
}

// 创建axios实例
function createAxiosInstance(): AxiosInstance {
  const instance = axios.create({
    baseURL: BASE_URL,
    timeout: DEFAULT_TIMEOUT,
    headers: GlobalHeader.get(),
  });

  // 请求拦截器 - 自动token装配
  instance.interceptors.request.use(
    async (config) => {
      const token = tokenStore.get();
      if (token) {
        config.headers.Authorization = token;
      }
      if (import.meta.env.DEV) {
        await sleep(1);
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    },
  );

  // 响应拦截器 - 全局错误拦截和数据格式验证
  instance.interceptors.response.use(
    (response: AxiosResponse<ApiResponse>) => {
      const { data: payload } = response;
      const compability = z
        .object({
          errcode: z.number(),
        })
        .safeParse(payload);
      if (compability.success) {
        payload.code = compability.data.errcode;
      }
      const BasePayloadValidator = z.object({
        code: z.number({ required_error: "响应数据缺少code" }),
        msg: z.string({ required_error: "响应数据缺少msg" }),
      });
      if (!BasePayloadValidator.safeParse(payload).success) {
        throw new Error(
          "响应数据格式错误，\n预期: {errcode/code: number, msg: string}",
        );
      }
      if(payload.code === 1) {
        // @ts-expect-error compatibility
        response.data.data.new = true;
        return response;
      }
      // 检查业务状态码
      if (payload.code !== 0 && payload.code !== 200) {
        // 特殊处理认证失败
        if (payload.code === 401|| payload.code === 1000) {
          tokenStore.remove();
          window.location.href = "/auth/login";
        }
        const errmsg = payload.msg || "请求失败";
        toast.error(errmsg);
        throw new Error(errmsg);
      }

      return response;
    },
    (error: AxiosError) => {
      // 网络错误处理
      let errorMessage = "网络请求失败";

      if (error.response) {
        const status = error.response.status;
        switch (status) {
          case 400:
            errorMessage = "请求参数错误";
            break;
          case 401:
            errorMessage = "未授权，请重新登录";
            tokenStore.remove();
            window.location.href = "/auth/login";
            break;
          case 403:
            errorMessage = "拒绝访问";
            break;
          case 404:
            errorMessage = "请求资源不存在";
            break;
          case 500:
            errorMessage = "服务器内部错误";
            break;
          default:
            errorMessage = `请求失败 (${status})`;
        }
      } else if (error.request) {
        errorMessage = "网络连接失败";
      }
      if (
        error.response?.data &&
        typeof error.response.data === "object" &&
        "msg" in error.response.data
      ) {
        errorMessage += `: ${error.response.data.msg}`;
      }
      toast.error(errorMessage);
      console.error(error);
      return Promise.reject(new Error(errorMessage));
    },
  );

  return instance;
}

// 创建axios客户端
let httpClient = createAxiosInstance();

// 基础请求方法
export async function request<T extends z.ZodSchema>(
  config: AxiosRequestConfig & {
    responseValidator?: T;
    dataValidator?: z.ZodSchema;
    paramsValidator?: z.ZodSchema;
  },
): Promise<z.infer<T>> {
  try {
    if (config.dataValidator) {
      const result = config.dataValidator.safeParse(config.data);
      if (!result.success) {
        throw new Error(
          `请求${config.url}的body数据格式错误:${result.error.message}`,
        );
      }
    }
    if (config.paramsValidator) {
      const result = config.paramsValidator.safeParse(config.params);
      if (!result.success) {
        throw new Error(
          `请求${config.url}的params数据格式错误:${result.error.message}`,
        );
      }
    }
    const response = await httpClient.request<ApiResponse<z.infer<T>>>(config);
    if (!config.responseValidator) {
      return response.data.data;
    }
    const result = config.responseValidator.safeParse(response.data.data);
    if (!result.success) {
      throw new Error(
        `请求${config.url}的响应数据格式错误:${result.error.message}`,
      );
    }
    return result.data;
  } catch (error) {
    console.error(error);
    toast.error(error instanceof Error ? error.message : "未知错误");
    throw error instanceof Error ? error : new Error("未知错误");
  }
}
