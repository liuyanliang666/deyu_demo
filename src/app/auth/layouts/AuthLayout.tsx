import { useIsMobile } from "@/hooks/use-mobile";
import { Outlet } from "@tanstack/react-router";
import { useState } from "react";
import { AuthContext } from "../context";

function LayoutContent() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCode, setverificationCode] = useState("");
  const isMobile = useIsMobile();
  if (isMobile) {
    return (
      <div
        className="h-screen w-screen overflow-hidden flex flex-col pt-30 bg-cover bg-center bg-no-repeat items-center"
        style={{ backgroundImage: "url(/chats/h5-bg.png)" }}
      >
        <div className="flex items-center justify-center rounded-t-2xl relative">
          <div className="space-y-4 transform w-full flex flex-col items-center">
            <img
              src="/fake-auth-title-1.png"
              className="w-4/5"
              alt="张江高科德育大模型"
            />
          </div>
        </div>
        <Outlet />
      </div>
    );
  }
  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat bg-fixed relative grid grid-cols-2"
      style={{ backgroundImage: "url(/chats/bg.png)" }}
    >
      {/* 左侧品牌名 */}
      <div className="flex items-center justify-center">
        <div className="space-y-4 transform -translate-y-10 w-full flex flex-col items-center">
          <img
            src="/fake-auth-title-1.png"
            className="w-2/3"
            alt="张江高科德育大模型"
          />
          {/* <h1 className="text-5xl font-bold bg-gradient-to-r pb-2 from-[#594eff] via-[#8667f1] to-[#5a73fd] bg-clip-text text-transparent">
          </h1> */}
          <h2 className="text-[#5a5c72] text-4xl">
            以智育慧， “芯” 航程点亮孩子未来
          </h2>
        </div>
      </div>
      {/* 右侧内容区域 */}
      <div className="flex items-center">
        <AuthContext.Provider
          value={{
            phone,
            verificationCode,
            setPhone,
            setverificationCode,
            password,
            setPassword,
          }}
        >
          <Outlet />
        </AuthContext.Provider>
      </div>
    </div>
  );
}

export default function AuthLayout() {
  const [phone, setPhone] = useState("");
  const [verificationCode, setverificationCode] = useState("");
  const [password, setPassword] = useState("");
  return (
    <AuthContext.Provider
      value={{
        phone,
        verificationCode,
        password,
        setPhone,
        setverificationCode,
        setPassword,
      }}
    >
      <LayoutContent />
    </AuthContext.Provider>
  );
}
