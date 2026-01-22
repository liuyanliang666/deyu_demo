import { createRoute, redirect } from "@tanstack/react-router";
import { rootRoute } from "@/route"; // 引用根路由
import AdminLayout from "./layout";
import AdminDashboard from "./pages/Dashboard";

// 1. 创建 Admin 根路由 (带布局)
export const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "admin",
  component: AdminLayout,
  // 简单的权限检查 (此处为示例，请根据实际 User 状态修改)
  beforeLoad: async () => {
    // 假设 context.auth 中有 role 字段，或者你暂时先允许通过
    // if (!context.auth.isAuthenticated) {
    //   throw redirect({ to: "/auth/login" });
    // }
  },
});

// 2. 创建子页面路由
const dashboardRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: "dashboard",
  component: AdminDashboard,
});

// 3. 其他占位路由 (防止点击菜单报错)
const studentsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: "students",
  component: () => <div className="p-4">学生管理模块开发中...</div>,
});

const alertsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: "alerts",
  component: () => <div className="p-4">预警干预模块开发中...</div>,
});

// 导出组合后的路由树
export const adminRouteTree = adminRoute.addChildren([
  dashboardRoute,
  studentsRoute,
  alertsRoute,
  // 默认跳转
  createRoute({
    getParentRoute: () => adminRoute,
    path: "/",
    component: () => { throw redirect({ to: "/admin/dashboard" }) }
  })
]);
