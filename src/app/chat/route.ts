import { createRoute, lazyRouteComponent } from "@tanstack/react-router";

import authenticatedRoute from "../_authenticated/route";
import type { AvaliableModelName } from "@/store/initMessage";
const chatRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/chat",
  component: lazyRouteComponent(() => import("./layouts/ChatLayout")),
});

const chatIndexRoute = createRoute({
  getParentRoute: () => chatRoute,
  path: "/",
  component: lazyRouteComponent(() => import("./ChatPage")),
  validateSearch: (search: {model?: AvaliableModelName})=>{
    return search
  },
});

const conversationRoute = createRoute({
  getParentRoute: () => chatRoute,
  path: "/$conversationId",
  component: lazyRouteComponent(() => import("./ConversationPage")),
  validateSearch: (search: { agentId?: string }) => {
    return search;
  },
});

const chatRouteTree = chatRoute.addChildren([
  chatIndexRoute,
  conversationRoute,
]);

export default chatRouteTree;
