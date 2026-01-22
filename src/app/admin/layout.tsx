import { Outlet, Link } from "@tanstack/react-router";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Users,
  ShieldAlert,
  BookOpen,
  LogOut,
  Settings,
} from "lucide-react";
import { AdminLogo } from "@/components/icons/AdminLogo";

// 菜单配置
const items = [
  { title: "德育驾驶舱", url: "/admin/dashboard", icon: LayoutDashboard },
  { title: "预警干预", url: "/admin/alerts", icon: ShieldAlert },
  { title: "班级学生", url: "/admin/students", icon: Users },
  { title: "作业布置", url: "/admin/assignments", icon: BookOpen },
  { title: "系统设置", url: "/admin/settings", icon: Settings },
];

// 内部布局组件（必须单独拆分，以便使用 useSidebar hook）
function AdminLayoutContent() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <div className="flex min-h-screen w-full bg-[#f8f9fc]">
      {/* 侧边栏 */}
      <Sidebar variant="inset" collapsible="icon">
        <SidebarHeader className="h-16 flex items-center justify-center border-b px-4 group-data-[collapsible=icon]:px-2">
          {/* Logo 区域：根据折叠状态调整显示 */}
          <div className="flex w-full items-center justify-start overflow-hidden group-data-[collapsible=icon]:justify-center">
            <AdminLogo collapsed={isCollapsed} size={isCollapsed ? 28 : 32} />
          </div>
        </SidebarHeader>
        
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>管理中心</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <Link
                        to={item.url}
                        activeProps={{
                          className:
                            "bg-sidebar-accent text-sidebar-accent-foreground font-medium",
                        }}
                      >
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t p-4">
          <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors w-full group-data-[collapsible=icon]:justify-center">
            <LogOut size={16} />
            <span className="group-data-[collapsible=icon]:hidden">
              退出登录
            </span>
          </button>
        </SidebarFooter>
      </Sidebar>

      {/* 主内容区域 */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* 顶部导航条 */}
        <header className="flex h-14 items-center gap-4 border-b bg-white px-6 shadow-sm shrink-0">
          <SidebarTrigger />
          <div className="flex-1" />
          <div className="text-sm text-muted-foreground">
            <span className="text-foreground">老师</span>，欢迎回来
          </div>
        </header>

        {/* 页面内容滚动区 */}
        <div className="flex-1 overflow-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

// 默认导出的 Layout 组件（提供 Context 环境）
export default function AdminLayout() {
  return (
    <SidebarProvider>
      <AdminLayoutContent />
    </SidebarProvider>
  );
}
