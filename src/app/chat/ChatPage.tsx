import { useNavigate } from "@tanstack/react-router";
import {
  Sparkles,
  Bell,
  Search,
  MessageCircle,
  BookOpen,
  Users,
  Calendar,
  TrendingUp,
  Activity,
  ArrowRight,
  Star,
  type LucideIcon, // 使用 type import 避免构建警告
} from "lucide-react";
// 引入 AGENTS 常量和 Agent 类型 (请确保 src/app/chat/constants/agents.ts 已创建)
import { AGENTS, type Agent } from "./constants/agents";

// --- 本地组件: StatCard (统计卡片) ---
interface StatCardProps {
  label: string;
  value: string;
  trend: string;
  icon: LucideIcon;
  color: string;
}

const StatCard = ({ label, value, trend, icon: Icon, color }: StatCardProps) => (
  <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 min-w-[200px] hover:shadow-md transition-shadow">
    <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
      <Icon size={20} />
    </div>
    <div>
      <p className="text-xs text-slate-400 font-medium uppercase">{label}</p>
      <div className="flex items-end gap-2">
        <h4 className="text-xl font-bold text-slate-800">{value}</h4>
        <span className="text-[10px] text-emerald-500 font-bold bg-emerald-50 px-1.5 py-0.5 rounded mb-1 flex items-center">
          <TrendingUp size={8} className="mr-0.5" /> {trend}
        </span>
      </div>
    </div>
  </div>
);

// --- 本地组件: AgentCard (智能体卡片) ---
interface AgentCardProps {
  agent: Agent; // 这里显式使用了 Agent 类型，解决了 implicit any 报错
  onClick: (agent: Agent) => void;
}

const AgentCard = ({ agent, onClick }: AgentCardProps) => {
  const Icon = agent.icon;
  return (
    <div
      onClick={() => onClick(agent)}
      className="group bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.08)] hover:border-blue-100 transition-all duration-300 cursor-pointer flex flex-col h-full relative overflow-hidden hover:-translate-y-1"
    >
      {/* 右上角装饰箭头 */}
      <div className="absolute top-0 right-0 p-2 opacity-30 group-hover:opacity-100 transition-opacity">
        <div className="bg-slate-50 rounded-bl-2xl p-2">
          <ArrowRight
            size={16}
            className="text-slate-400 group-hover:text-blue-500 -rotate-45 group-hover:rotate-0 transition-transform duration-300"
          />
        </div>
      </div>

      {/* 图标与评分 */}
      <div className="flex justify-between items-start mb-5">
        <div
          className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${agent.gradient} flex items-center justify-center text-white shadow-lg shadow-slate-200 group-hover:scale-110 transition-transform duration-300 ring-4 ring-white`}
        >
          <Icon size={26} strokeWidth={1.5} />
        </div>
        <div className="flex flex-col items-end gap-1 mt-1">
          <div className="flex items-center gap-1 text-xs font-medium text-slate-600 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
            <Star size={10} className="text-yellow-400 fill-yellow-400" />
            {agent.stats.rating}
          </div>
        </div>
      </div>

      {/* 文本内容 */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
            {agent.name}
          </h3>
          {/* 这里添加了一个演示用的红点动画，仅在解忧铺显示 */}
          {agent.id === "jieyoupu" && (
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" title="High Traffic"></span>
          )}
        </div>

        <span className="text-xs text-slate-400 flex items-center gap-1 mb-3">
          面向 {agent.role} · <Activity size={10} /> {agent.stats.usage} 次调用
        </span>

        <p className="text-sm text-slate-500 leading-relaxed mb-4 h-[40px] line-clamp-2">
          {agent.desc}
        </p>
      </div>

      {/* 标签 */}
      <div className="mt-auto flex flex-wrap gap-2">
        {agent.tags.map((tag: string) => (
          <span
            key={tag}
            className="text-[10px] bg-slate-50 text-slate-500 px-2 py-1 rounded-md border border-slate-100"
          >
            #{tag}
          </span>
        ))}
      </div>
    </div>
  );
};

// --- 主页面组件 (Dashboard) ---
export default function ChatPage() {
  const navigate = useNavigate();

  const handleSelectAgent = (agent: Agent) => {
    // 点击后跳转到具体的对话页面，例如 /chat/runxinqiao
    navigate({ to: `/chat/${agent.id}` });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans">
      {/* 顶部导航栏 */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-30 px-4 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-1.5 rounded-lg shadow-md">
            <Sparkles className="text-white w-4 h-4" />
          </div>
          <span className="font-bold text-lg text-slate-800 tracking-tight hidden sm:block">
            高科芯·德育
          </span>
        </div>

        {/* 搜索框 (仅做 UI 展示) */}
        <div className="hidden md:flex relative max-w-md w-full mx-8">
          <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="搜索智能体或历史对话记录..."
            className="w-full bg-slate-100 border-none rounded-full py-2 pl-10 pr-4 text-sm text-slate-600 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
          />
        </div>

        {/* 右侧用户区 */}
        <div className="flex items-center gap-4">
          <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-100">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block"></div>
          <div className="flex items-center gap-3 cursor-pointer group">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors">
                张老师
              </p>
              <p className="text-[10px] text-slate-400">七年级(2)班班主任</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 border-2 border-white shadow-sm flex items-center justify-center overflow-hidden">
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                alt="User"
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 第一行：统计数据 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="本周对话"
            value="128"
            trend="+12%"
            icon={MessageCircle}
            color="bg-blue-50 text-blue-600"
          />
          <StatCard
            label="方案生成"
            value="45"
            trend="+5%"
            icon={BookOpen}
            color="bg-purple-50 text-purple-600"
          />
          <StatCard
            label="学生关注"
            value="12"
            trend="+2"
            icon={Users}
            color="bg-orange-50 text-orange-600"
          />
          <StatCard
            label="德育学时"
            value="32h"
            trend="Lv.4"
            icon={Calendar}
            color="bg-emerald-50 text-emerald-600"
          />
        </div>

        {/* Hero Banner 区域 */}
        <div className="relative overflow-hidden bg-slate-900 rounded-2xl p-8 mb-10 shadow-xl shadow-slate-900/10 group">
          <div className="absolute top-0 right-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-luminosity group-hover:scale-105 transition-transform duration-[2s]"></div>

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 text-[10px] font-bold backdrop-blur-sm border border-blue-500/20 mb-3 uppercase tracking-wider">
                <Sparkles size={10} />
                AI Powered Education
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                下午好，准备开始今天的德育工作吗？
              </h2>
              <p className="text-slate-400 text-sm">
                InnoSpark 模型已更新至 v2.4，新增“家校沟通话术”优化功能。
              </p>
            </div>
            <button className="bg-white text-slate-900 hover:bg-blue-50 border-none text-sm px-6 py-2.5 rounded-xl font-medium shadow-lg shadow-black/20 transition-all">
              查看更新日志
            </button>
          </div>
        </div>

        {/* 筛选与网格标题 */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              智能体矩阵
            </h3>
            <div className="hidden sm:flex gap-1 p-1 bg-slate-100 rounded-lg">
              {["全部", "内容生成", "多轮对话"].map((f, i) => (
                <button
                  key={f}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                    i === 0
                      ? "bg-white text-slate-800 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded">
            共 {AGENTS.length} 个助手可用
          </span>
        </div>

        {/* 智能体列表渲染 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {AGENTS.map((agent: Agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              onClick={handleSelectAgent}
            />
          ))}
        </div>

        {/* 页脚 */}
        <div className="mt-12 border-t border-slate-200 pt-8 text-center pb-8">
           <p className="text-slate-300 text-xs">© 2024 高科芯 · 德育大模型驱动的智慧德育教育新范式</p>
        </div>
      </main>
    </div>
  );
}
