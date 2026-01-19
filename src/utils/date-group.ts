import type { Conversation } from "@/apis/requests/conversation/history";
import dayjs from "dayjs";

interface GroupedData {
  label: "今天" | "昨天" | "前天" | string; // 最后一个是yyyy-mm-dd格式
  list: Conversation[];
}

// 获取时间戳对应的标签（今天、昨天、前天或具体日期）
function getDateLabel(timestamp: number): "今天" | "昨天" | "前天" | string {
  const target = dayjs(timestamp * 1000); // 转换毫秒级时间戳为秒级
  const today = dayjs().startOf("day");

  if (target.isSame(today, "day")) {
    return "今天";
  }
  if (target.isSame(today.subtract(1, "day"), "day")) {
    return "昨天";
  }
  if (target.isSame(today.subtract(2, "day"), "day")) {
    return "前天";
  }
  return target.format("YYYY-MM-DD");
}

// 分组函数：根据updateTime对对话进行分组
function groupConversationsByDate(
  conversations: Conversation[],
): GroupedData[] {
  const groups: Record<string, GroupedData> = {};

  // 按updateTime降序排序（最新的在前）
  const sortedConversations = [...conversations].sort(
    (a, b) => b.updateTime - a.updateTime,
  );

  // 分组处理
  for (const conversation of sortedConversations) {
    const label = getDateLabel(conversation.updateTime);

    if (!groups[label]) {
      groups[label] = {
        label: label as "今天" | "昨天" | "前天" | string,
        list: [],
      };
    }

    groups[label].list.push(conversation);
  }

  // 转换为数组并按日期降序排列
  return Object.values(groups).sort((a, b) => {
    // 特殊标签排在前面
    const labelOrder: Record<string, number> = { 今天: 3, 昨天: 2, 前天: 1 };
    if (labelOrder[a.label] && labelOrder[b.label]) {
      return labelOrder[b.label] - labelOrder[a.label];
    }
    if (labelOrder[a.label]) return -1;
    if (labelOrder[b.label]) return 1;
    // 日期字符串直接比较
    return dayjs(b.label).isAfter(dayjs(a.label)) ? 1 : -1;
  });
}
export default groupConversationsByDate;
