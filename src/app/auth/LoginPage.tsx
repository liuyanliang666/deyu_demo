import React, { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Users,
  User,
  Home,
  Lock,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  type LucideIcon, // [修复点] 使用 type 关键字显式导入类型
} from "lucide-react";

// --- 本地组件: InputField (保持 Demo 样式) ---
interface InputFieldProps {
  label: string;
  icon: LucideIcon;
  type?: string;
  placeholder: string;
}

const InputField = ({ label, icon: Icon, type = "text", placeholder }: InputFieldProps) => (
  <div className="group">
    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
      {label}
    </label>
    <div className="relative transition-all duration-300 focus-within:transform focus-within:-translate-y-0.5">
      <div className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-blue-600 transition-colors">
        <Icon size={18} />
      </div>
      <input
        type={type}
        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
        placeholder={placeholder}
      />
    </div>
  </div>
);

// --- 本地组件: Button (保持 Demo 样式) ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'brand';
  fullWidth?: boolean;
  icon?: LucideIcon;
}

const Button = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  icon: Icon, 
  fullWidth = false, 
  ...props 
}: ButtonProps) => {
  const baseStyle = "relative overflow-hidden font-medium transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3.5 text-base rounded-2xl";
  
  const variants = {
    primary: "bg-slate-900 text-white hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-900/20 focus:ring-slate-900 border border-transparent",
    brand: "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-blue-500/30 hover:brightness-110 border-none focus:ring-blue-500",
  };

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`} 
      {...props}
    >
      {Icon && <Icon size={18} strokeWidth={2} />}
      <span className="relative z-10">{children}</span>
    </button>
  );
};

// --- 主页面组件 ---
export default function LoginPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'teacher' | 'student' | 'parent'>('teacher');

  const handleLogin = () => {
    // 这里可以添加实际的认证逻辑调用
    // auth.login(...)
    navigate({ to: "/chat" });
  };

  const tabs = [
    { id: 'teacher', label: '教师入口', icon: Users },
    { id: 'student', label: '学生入口', icon: User },
    { id: 'parent', label: '家长入口', icon: Home },
  ] as const;
  
  return (
    <div className="min-h-screen flex bg-slate-50 font-sans selection:bg-blue-100 selection:text-blue-900 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 pointer-events-none" 
           style={{backgroundImage: 'radial-gradient(circle at 1px 1px, #cbd5e1 1px, transparent 0)', backgroundSize: '40px 40px', opacity: 0.4}}>
      </div>

      {/* Left Side - Brand Visual */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative overflow-hidden flex-col justify-between p-16">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay animate-pulse-slow"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/95 via-slate-900/95 to-slate-900/95"></div>
        
        {/* Decorative Orbs */}
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] animate-float"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px] animate-float-delayed"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center shadow-2xl">
              <Sparkles className="text-blue-300 w-6 h-6" fill="currentColor" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">高科芯·德育</span>
          </div>
          
          <div className="space-y-6">
            <h1 className="text-6xl font-bold text-white leading-[1.1]">
              赋能新时代<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-300">智慧德育</span>
              <span className="font-light italic text-slate-400 text-5xl ml-4">新范式</span>
            </h1>
            <p className="text-slate-300 text-lg max-w-lg leading-relaxed border-l-2 border-blue-500/30 pl-6">
              基于华东师范大学 <strong>InnoSpark</strong> 启创教育大模型，为基础教育提供安全、专业、可控的德育智能化解决方案。
            </p>
          </div>
        </div>

        {/* Floating Testimonial Card */}
        <div className="relative z-10 mt-12">
           <div className="bg-white/10 backdrop-blur-lg border border-white/10 p-5 rounded-2xl max-w-md shadow-2xl transform translate-x-8 hover:translate-x-4 transition-transform duration-500">
              <div className="flex items-center gap-3 mb-3">
                 <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-400 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                    JD
                 </div>
                 <div>
                    <p className="text-white font-medium text-sm">张江高科实验小学</p>
                    <p className="text-blue-200 text-xs">德育示范校</p>
                 </div>
              </div>
              <p className="text-slate-200 text-sm italic">"解忧铺智能体上线后，学生的主动倾诉率提升了40%，真正实现了全天候的心理守护。"</p>
           </div>
        </div>

        <div className="relative z-10 flex gap-6 text-xs text-slate-400 font-medium uppercase tracking-widest">
          <span className="flex items-center gap-2 hover:text-blue-300 transition-colors cursor-default">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"></div>
            安全私密
          </span>
          <span className="flex items-center gap-2 hover:text-blue-300 transition-colors cursor-default">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)]"></div>
            专业对齐
          </span>
          <span className="flex items-center gap-2 hover:text-blue-300 transition-colors cursor-default">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.6)]"></div>
            情感陪伴
          </span>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative">
        <div className="w-full max-w-md">
          {/* Mobile Header */}
          <div className="lg:hidden mb-8 text-center">
             <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-4">
              <Sparkles className="text-white w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">高科芯·德育智能体</h2>
          </div>

          <div className="bg-white rounded-[2rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-slate-100 p-8 lg:p-10 relative overflow-hidden">
            {/* Decorative Top Border */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
            
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900">欢迎登录</h2>
              <p className="text-slate-500 text-sm mt-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                系统运行正常 · V2.1.0
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-50 rounded-xl mb-8 border border-slate-100">
              {tabs.map((tab) => {
                const TabIcon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex flex-col items-center justify-center py-3 px-2 text-xs font-medium rounded-lg transition-all duration-200 ${
                      activeTab === tab.id 
                        ? 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-100' 
                        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                    }`}
                  >
                    <TabIcon size={18} className="mb-1.5" />
                    {tab.label}
                  </button>
                )
              })}
            </div>

            <div className="space-y-5">
              <InputField label="账号 / 手机号" icon={User} placeholder="请输入您的学校账号" />
              <InputField label="密码" icon={Lock} type="password" placeholder="••••••••" />
              
              <div className="flex items-center justify-between text-xs mt-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative">
                     <input type="checkbox" className="peer sr-only" />
                     <div className="w-4 h-4 border-2 border-slate-300 rounded bg-white peer-checked:bg-blue-500 peer-checked:border-blue-500 transition-colors"></div>
                     <CheckCircle2 size={12} className="absolute top-0.5 left-0.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"/>
                  </div>
                  <span className="text-slate-500 group-hover:text-slate-700">记住我</span>
                </label>
                <a href="#" className="text-blue-600 font-medium hover:text-blue-700 hover:underline">忘记密码？</a>
              </div>

              <Button 
                variant="brand" 
                fullWidth 
                onClick={handleLogin} 
                className="mt-4 h-12 shadow-blue-500/25 shadow-lg"
              >
                进入系统 <ArrowRight size={18} />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-4 mt-8">
             <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/East_China_Normal_University_logo.svg/1200px-East_China_Normal_University_logo.svg.png" alt="ECNU" className="h-8 opacity-50 grayscale hover:grayscale-0 transition-all" />
             <div className="h-4 w-px bg-slate-300"></div>
             <span className="text-slate-400 text-xs font-medium">教育部教育信息化工程研究中心</span>
          </div>
        </div>
      </div>
    </div>
  );
};