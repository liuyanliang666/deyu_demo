import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ChevronDown, Eye, EyeClosed } from "lucide-react";
import type * as React from "react";
import { useState } from "react";

function AuthInput({
  className,
  phone,
  password,
  type,
  ...props
}: React.ComponentProps<"input"> & { phone?: boolean; password?: boolean }) {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div className="relative w-full">
      <Input
        type={password ? (showPassword ? "text" : "password") : type}
        placeholder={
          password ? "请输入密码" : phone ? "请输入手机号" : "请输入..."
        }
        className={cn(
          "h-12 rounded-full md:text-lg pl-4 border-gray-200 bg-[#f6f6f6] pr-4 placeholder:text-gray-400 focus:bg-white focus:border-gray-300 focus:ring-0",
          phone && "pl-24 border-0",
          className,
        )}
        {...props}
      />
      {phone && (
        <div className="absolute left-0 top-0 flex h-12 items-center">
          <Select defaultValue="+86">
            <SelectTrigger
              className="ml-4 border-0 bg-transparent shadow-none focus:ring-0 md:text-lg focus-visible:ring-0 "
              icon={<ChevronDown className="stroke-black" />}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="+86">+86</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      {password && (
        <div className="absolute right-0 top-0 flex h-12 items-center z-10">
          <Button
            variant="link"
            size="icon"
            type="button"
            onClick={() => {
              console.log(showPassword);
              setShowPassword(!showPassword);
            }}
          >
            {!showPassword ? <Eye /> : <EyeClosed />}
          </Button>
        </div>
      )}
    </div>
  );
}

export { AuthInput };
