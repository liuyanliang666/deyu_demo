import React from "react";

export const AdminLogo = ({
  className,
  size = 32,
  collapsed = false,
  ...props
}: React.ComponentProps<"svg"> & { size?: number; collapsed?: boolean }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* 图标部分 */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
        className="text-primary shrink-0"
      >
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="currentColor" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.6" />
          </linearGradient>
        </defs>

        {/* 外层：大脑/云端轮廓 - 象征智能平台 */}
        <path
          d="M50 12C35 12 22 20 18 32C14 44 20 56 28 62L50 88L72 62C80 56 86 44 82 32C78 20 65 12 50 12Z"
          stroke="url(#logoGradient)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
          // 如果你之前在 styles.css 添加了动画，保留这个 className；如果没有，可以去掉
          className="animate-pulse-slow" 
        />

        {/* 内核：爱心电路 - 象征德育与关怀 */}
        <path
          d="M50 35C50 35 42 30 38 35C34 40 38 48 50 55C62 48 66 40 62 35C58 30 50 35 50 35Z"
          fill="currentColor"
          className="opacity-90"
        />

        {/* 已删除：顶部的三个光点 */}
      </svg>

      {/* 文字部分 - 仅在非折叠状态下显示 */}
      {!collapsed && (
        <div className="flex flex-col overflow-hidden transition-all duration-300">
          <span className="font-bold text-lg leading-tight tracking-tight text-foreground">
            德育智脑
          </span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
            Admin Portal
          </span>
        </div>
      )}
    </div>
  );
};