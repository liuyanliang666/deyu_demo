import { createRoute, lazyRouteComponent, Outlet } from "@tanstack/react-router";
import { rootRoute } from "@/route";
import SetNewUserPasswordPage from "./SetNewUserPasswordPage";
// Auth routes
const authRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth",
  component: lazyRouteComponent(() => import("./layouts/AuthLayout")),
});

const loginRoute = createRoute({
  getParentRoute: () => authRoute,
  path: "/login",
  validateSearch: (search) => ({
    redirect: (search.redirect as string) ?? "/chat",
  }),
  component: ()=><Outlet />
});

const verificationLoginRoute = createRoute({
  getParentRoute: ()=>loginRoute,
  path: '/',
  component: lazyRouteComponent(() => import("./LoginPage")),
})

const phonePasswordLoginRoute = createRoute({
  getParentRoute: () => loginRoute,
  path: "/password",
  component: lazyRouteComponent(() => import("./PhonePasswordLoginPage")),
});

const setNewUserPasswordRoute = createRoute({
  getParentRoute: () => loginRoute,
  path: "/password/set",
  component: SetNewUserPasswordPage,
});

const authRouteTree = authRoute.addChildren([
  loginRoute,
  phonePasswordLoginRoute,
  setNewUserPasswordRoute,
  verificationLoginRoute
]);

export default authRouteTree;
