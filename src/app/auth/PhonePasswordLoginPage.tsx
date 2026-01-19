"use client";
import AuthButton from "@/app/auth/components/AuthButton";
import { AuthInput } from "@/app/auth/components/AuthInput";
import { Checkbox } from "@/components/ui/checkbox";

import { Label } from "@/components/ui/label";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import z from "zod";
import { mobileSchema } from "@/utils/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import AuthWrapper from "@/app/auth/components/AuthWrapper";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { RequestVerify } from "@/apis/requests/user/verifiy";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { tokenStore } from "@/lib/request";
import { useIsMobile } from "@/hooks/use-mobile";

const formSchema = z.object({
  phone: mobileSchema,
  password: z
    .string()
    .min(6, "密码至少6位")
    .max(20, "密码最多20位")
    .regex(/^(?=.*[a-zA-Z])(?=.*\d)/, "密码必须包含字母和数字"),
});

export default function PhonePasswordLoginPage() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phone: "",
      password: "",
    },
  });
  const [isChecked, setIsChecked] = useState(false);
  const navigate = useNavigate();
  const search = useSearch({
    from: "/auth/login/password",
  });
  const phonePasswordLoginMutation = useMutation({
    mutationFn: RequestVerify,
  });

  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    if (!isChecked) {
      toast.info("请勾选使用协议与隐私协议");
      return;
    }
    phonePasswordLoginMutation.mutate(
      {
        authId: data.phone,
        verify: data.password,
        authType: "password",
      },
      {
        onSuccess(data) {
          toast.success("登录成功");
          tokenStore.set(data.token);
          const redirectUrl = search.redirect || "/chat";
          navigate({
            to: redirectUrl,
          });
        },
      },
    );
  };
  
  const isMobile = useIsMobile();
  return (
    <AuthWrapper>
      <div className="flex flex-col h-full items-center">
        {
          !isMobile && (
            <h3 className="text-2xl font-bold w-full h-fit mb-8 text-center">
              密码登录
            </h3>
          )
        }
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="w-full gap-4 flex-1 flex flex-col justify-center"
          >
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <AuthInput phone {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <AuthInput password {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div
              className="justify-center flex items-center gap-2 pb-6"
              style={{
                letterSpacing: "0.5px",
              }}
            >
              <Checkbox
                checked={isChecked}
                className="border-primary bg-white"
                onCheckedChange={(checked) =>
                  setIsChecked(checked === "indeterminate" ? false : checked)
                }
              />
              <Label className="gap-0.5">
                已阅读并同意
                <Link
                  to="."
                  className="text-black font-bold underline-offset-4 hover:underline"
                >
                  使用协议
                </Link>
                和
                <Link
                  to="."
                  className="text-black font-bold underline-offset-4 hover:underline"
                >
                  隐私协议
                </Link>
              </Label>
            </div>
            <div className="space-y-4">
              <AuthButton
                disabled={phonePasswordLoginMutation.isPending}
                type="submit"
              >
                下一步
              </AuthButton>
              <AuthButton variant={"secondary"} asChild>
                <Link
                  search={search}
                  to="/auth/login"
                >
                  验证码登录
                </Link>
              </AuthButton>
            </div>
          </form>
        </Form>
      </div>
    </AuthWrapper>
  );
}
