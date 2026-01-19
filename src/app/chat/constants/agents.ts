//
import { type LucideIcon, MessageCircle, Users, BookOpen, Compass, Cloud, Home } from 'lucide-react';

// 定义 Agent 接口类型
export interface Agent {
  id: string;
  name: string;
  role: string;
  type: 'content' | 'chat';
  icon: LucideIcon;
  theme: string;
  gradient: string;
  bgStart?: string;
  desc: string;
  stats: {
    usage: string;
    rating: string;
  };
  tags: string[];
  prompts: string[];
}

export const AGENTS: Agent[] = [
  {
    id: 'runxinqiao',
    name: '润心桥',
    role: '班主任',
    type: 'content',
    icon: Users,
    theme: 'blue',
    gradient: 'from-blue-500 to-cyan-400',
    desc: '辅助班主任设计富有创意、可执行的个性化主题班会方案。',
    stats: { usage: '2.1k', rating: '4.9' },
    tags: ['班会设计', '创意策划'],
    prompts: [
      '为小学四年级设计一个关于“感恩父母”的主题班会方案，时长40分钟。',
      '针对班级近期出现的攀比现象，设计一个班会流程。'
    ]
  },
  {
    id: 'huiyugang',
    name: '慧育港',
    role: '德育老师',
    type: 'content',
    icon: BookOpen,
    theme: 'indigo',
    gradient: 'from-indigo-500 to-purple-400',
    bgStart: 'bg-indigo-50',
    desc: '协同设计并实施专业的社会情感能力培养方案与德育活动。',
    stats: { usage: '1.5k', rating: '4.8' },
    tags: ['SEL课程', '情感教育'],
    prompts: [
      '设计一个培养初中生同理心的团队协作活动。',
      '如何通过活动提升学生的抗挫折能力？'
    ]
  },
  {
    id: 'jieyoupu',
    name: '解忧铺',
    role: '学生',
    type: 'chat',
    icon: MessageCircle,
    theme: 'emerald',
    gradient: 'from-emerald-400 to-teal-500',
    bgStart: 'bg-emerald-50',
    desc: '提供24小时在线、绝对私密安全的陪伴“树洞”，疏导成长烦恼。',
    stats: { usage: '5.3k', rating: '5.0' },
    tags: ['心理疏导', '隐私保护'],
    prompts: [
      '我最近最好的朋友不理我了，我该怎么办？',
      '上课回答问题总感觉很紧张，怎么才能更自信一点？',
      '考试没考好，不敢告诉父母，心里很难受。'
    ]
  },
  {
    id: 'yinhanghao',
    name: '引航号',
    role: '全员导师',
    type: 'content',
    icon: Compass,
    theme: 'sky',
    gradient: 'from-sky-400 to-blue-500',
    bgStart: 'bg-sky-50',
    desc: '辅助导师精准理解学生问题，设计个性化的干预方案与沟通话术。',
    stats: { usage: '3.2k', rating: '4.9' },
    tags: ['个案辅导', '沟通话术'],
    prompts: [
      '我辅导的学生性格内向，最近对美术感兴趣，请设计个干预方案。',
      '如何与处于叛逆期的初二男生建立信任关系？'
    ]
  },
  {
    id: 'yuzhiyun',
    name: '育智云',
    role: '课程教师',
    type: 'content',
    icon: Cloud,
    theme: 'violet',
    gradient: 'from-violet-500 to-fuchsia-400',
    bgStart: 'bg-violet-50',
    desc: '辅助学科教师在日常教学中自然融入德育元素，实现“教书育人”。',
    stats: { usage: '1.8k', rating: '4.7' },
    tags: ['课程思政', '学科融合'],
    prompts: [
      '我是数学老师，下周讲“统计与概率”，如何融入诚信教育？',
      '在英语阅读课中如何潜移默化地加入爱国主义教育？'
    ]
  },
  {
    id: 'nuanxinge',
    name: '暖心阁',
    role: '家长',
    type: 'chat',
    icon: Home,
    theme: 'orange',
    gradient: 'from-orange-400 to-amber-400',
    bgStart: 'bg-orange-50',
    desc: '扮演智慧家庭教育专家，为家长提供科学的育儿建议。',
    stats: { usage: '4.1k', rating: '4.8' },
    tags: ['亲子沟通', '家庭教育'],
    prompts: [
      '孩子写作业拖拉磨蹭，怎么沟通都不听，怎么办？',
      '孩子沉迷手机游戏，如何引导？'
    ]
  }
];