import {
  createRootRouteWithContext,
  Outlet,
  createRoute,
} from "@tanstack/react-router";
import authRouteTree from "./app/auth/route";
import chatRouteTree from "./app/chat/route";
import authenticatedRoute from "./app/_authenticated/route";
import { adminRouteTree } from "./app/admin/route";
import type { UserCredentials } from "./apis/requests/user/schema";

// 定义认证状态接口
interface AuthState {
  isAuthenticated: boolean;
  user: UserCredentials | null;
}

// 定义路由上下文接口
interface MyRouterContext {
  auth: AuthState;
}

export const rootRoute = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <>
      <Outlet />
    </>
  ),
});

// Root redirect
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => {
    window.location.href = "/chat";
    return null;
  },
});

export const routeTree = rootRoute.addChildren([
  indexRoute,
  authRouteTree,
  // 原有的聊天应用路由
  authenticatedRoute.addChildren([
    chatRouteTree,
  ]),
  // 新增的管理后台路由
  adminRouteTree, // <--- 注册在这里
]);