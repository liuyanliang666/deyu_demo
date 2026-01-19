import {
  createRootRouteWithContext,
  Outlet,
  createRoute,
} from "@tanstack/react-router";
import authRouteTree from "./app/auth/route";
import chatRouteTree from "./app/chat/route";
import authenticatedRoute from "./app/_authenticated/route";
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
  authenticatedRoute.addChildren([
    chatRouteTree,
  ]),
]);
