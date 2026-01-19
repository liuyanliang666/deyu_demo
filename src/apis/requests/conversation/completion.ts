import z from "zod";

/**
 * 
 * {
  "messages": [ // 每次都给最后一条有效的用户消息, 且数组中只能有一个消息
    {
      "content": "", // 消息内容, json字符串, 存放在text中
      "contentType": 0, // 消息类型, 目前没用, 默认为0表示普通文本
      "attaches": [],   // 附件, 目前没用
      "references": [], // 参考, 目前没用
      "role": "" // 用户角色, system, assistant, user, tool, 如果以整数枚举出现, 则是从0到3
    }
  ],
  "completionsOption": { // 配置选项
    "isRegen": false, // 是否重新生成
    "selectedRegenId": "", // 可选字段, 在regen过后第一次正常对话的
    "withSuggest": false, // 是否生成建议, 暂时均为false
    "isReplace": false, // 是否替换
    "useDeepThink": false, // 是否深度思考, 暂时均为false
    "stream": false // 是否流式
  },
  "model": "", // 模型名称, 默认的用deyu-default
  "conversationId": "", // 对话id, 由conversation/create接口创建
  "replyId": "", // 可选字段, 用于在regen时指定对哪一个用户消息进行重新生成
  "botId": "" // 智能体id, 默认的为default
}
 */
export const MessageSchema = z.object({
  attaches: z.array(z.string()),
  content: z.string(),
  contentType: z.number(),
  references: z.array(z.string()),
  role: z.string(),
});
export type Message = z.infer<typeof MessageSchema>;

export const CompletionsOptionSchema = z.object({
  isRegen: z.boolean(),
  isReplace: z.boolean(),
  selectedRegenId: z.union([z.null(), z.string()]).optional(),
  stream: z.boolean(),
  useDeepThink: z.boolean(),
  withSuggest: z.boolean(),
});
export type CompletionsOption = z.infer<typeof CompletionsOptionSchema>;

export const RequestSchema = z.object({
  botId: z.literal("default"),
  completionsOption: CompletionsOptionSchema,
  conversationId: z.string(),
  messages: z.array(MessageSchema),
  model: z.string(),
  replyId: z.union([z.null(), z.string()]).optional(),
});
export type Request = z.infer<typeof RequestSchema>;
