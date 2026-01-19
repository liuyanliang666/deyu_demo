import { createRoute, redirect, Outlet } from "@tanstack/react-router";
import { rootRoute } from "@/route";
import { tokenStore } from "@/lib/request";

// 创建认证布局路由
export const authenticatedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "_authenticated",
  beforeLoad: ({ location }) => {
    // 实时检查用户认证状态
    const isAuthenticated = Boolean(tokenStore.get())

    if (!isAuthenticated) {
      // 如果未认证，重定向到登录页面，并保存当前路径用于登录后跳转
      throw redirect({
        to: "/auth/login",
        search: {
          redirect: location.href,
        },
      });
    }
  },
  component: () => <Outlet />,
});

export default authenticatedRoute;
