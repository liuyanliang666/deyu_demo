"use client";

import ChatSidebar from "@/app/chat/components/ChatSidebar";
import {
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useGSAP } from "@gsap/react";
import { Outlet } from "@tanstack/react-router";
import gsap from "gsap";
import { useRef } from "react";
import Collapse from "../components/collapse";
import Layout from "@/app/h5/chat/layout";

const sidebarWidth = "380px";

export default function ChatLayout() {
  const isMobile = useIsMobile()
  if(isMobile) {
    return <Layout />
  }
  return (
    <div
      className="w-full h-full bg-white"
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
          <SidebarExpandTrigger />
          {/* <div id="sidebar-header" /> */}
          {/* </div> */}
          <Outlet />
        </main>
      </SidebarProvider>
    </div>
  );
}

function SidebarExpandTrigger() {
  const { state } = useSidebar();
  const isMobile = useIsMobile();
  const ref = useRef<HTMLButtonElement>(null);
  useGSAP(() => {
    if (!ref.current) return;
    if (state === "expanded" && !isMobile) {
      gsap.set(ref.current, {
        opacity: 0,
      });
    } else {
      gsap.to(ref.current, {
        duration: 0.6,
        opacity: 1,
        ease: "circ",
        delay: 0.2,
      });
    }
  }, [state, isMobile]);
  return (
    (state === "collapsed" || isMobile) && (
      <SidebarTrigger
        variant={"outline"}
        icon={<Collapse />}
        className="transition-none opacity-0 absolute z-50 size-10 left-4 top-4 rounded-full bg-white border-2"
        ref={ref}
        iconClassName="size-6"
      />
    )
  );
}
