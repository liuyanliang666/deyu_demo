import { createRoute, lazyRouteComponent } from "@tanstack/react-router";

import authenticatedRoute from "../../_authenticated/route";
import type { AvaliableModelName } from "@/store/initMessage";
const chatRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/chat",
  component: lazyRouteComponent(() => import("./layout")),
});

const chatIndexRoute = createRoute({
  getParentRoute: () => chatRoute,
  path: "/",
  validateSearch: (search: {model?: AvaliableModelName})=>{
    return search
  },
  component: lazyRouteComponent(() => import("./H5ChatPage")),
});

const conversationRoute = createRoute({
  getParentRoute: () => chatRoute,
  path: "/$conversationId",
  component: lazyRouteComponent(() => import("./H5ConversationPage")),
});

const h5ChatRouteTree = chatRoute.addChildren([
  chatIndexRoute,
  conversationRoute,
]);

export default h5ChatRouteTree;
