"use client";

import ChatSidebar from "@/app/chat/components/ChatSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

import { Outlet } from "@tanstack/react-router";

const sidebarWidth = "380px";

export default function Layout() {
  return (
    <div
      style={{ backgroundImage: "url(/chats/h5-bg.png)" }}
      className="w-full h-full bg-cover bg-center bg-no-repeat"
    >
      <SidebarProvider
        style={
          {
            "--sidebar-width": sidebarWidth,
            "--sidebar-width-mobile": sidebarWidth,
          } as React.CSSProperties
        }
      >
        <ChatSidebar />
        <main className=" w-full h-full bg-transparent">
          {/* <div className="z-50 safe-area-top min-h-10 flex items-center sticky top-0 w-full"> */}
          <SidebarTrigger className="absolute top-2 left-2 bg-white size-8 z-10" />
          {/* <div id="sidebar-header" /> */}
          {/* </div> */}
          <Outlet />
        </main>
      </SidebarProvider>
    </div>
  );
}
