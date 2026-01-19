import type { AvaliableModelName } from "@/store/initMessage";
export type Card = {
  name: string;
  description: string;
  imgUrl: string;
  model: AvaliableModelName;
};
export const cardList: Card[] = [
  {
    name: "润心桥",
    description:
      "[班主任]的专属智慧伙伴，贴心翻译成长的密语，让心与心的对话自然发生。读懂班级里的每一个独特，让关怀如期而至。——您专注播种，我默默耕耘。",
    imgUrl: "/chats/agent-1.png",
    model: "deyu-bzr",
  },
  {
    name: "慧育港",
    description:
      "为[德育工作者]点亮前行的灯塔。这里有智能方案、资源推荐，让每一次德育活动都散发星光——让我们一起把教育做得更有温度。",
    imgUrl: "/chats/agent-2.png",
    model: "deyu-xkjs",
  },
  {
    name: "引航号",
    description:
      "陪伴[导师]走进学生的成长旅程。提供个性化成长档案和沟通建议，让每位导师都能成为学生愿意信赖的引路人——因为最好的教育，源于真诚的陪伴。",
    imgUrl: "/chats/agent-3.png",
    model: "deyu-qyds",
  },
  {
    name: "育智云",
    description:
      "助力[教师]打造知识与温暖交融的课堂。基于学情智能设计教学，让备课更轻松，课堂更生动——因为教育不仅是传授知识，更是点亮心灵。",
    imgUrl: "/chats/agent-4.png",
    model: "deyu-dygb",
  },
  {
    name: "解忧铺",
    description:
      "24小时在线的成长树洞。你的心事，永远有地方倾诉；你的烦恼，总会得到温柔回应——愿[孩子们]在这里找回前行的勇气和微光。",
    imgUrl: "/chats/agent-5.png",
    model: "deyu-xy",
  },
  {
    name: "暖心阁",
    description:
      "做[家长]的教育知心人。解读孩子成长密码，提供亲子沟通建议，让家庭教育不再迷茫——让我们陪着你，一起静待花开。",
    imgUrl: "/chats/agent-6.png",
    model: "deyu-jylf",
  },
];

export const modelMap = new Map<string, string>();

for (const i of cardList) {
  modelMap.set(i.model, i.name);
}
