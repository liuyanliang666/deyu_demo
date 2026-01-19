"use client";
import AuthButton from "@/app/auth/components/AuthButton";
import { AuthInput } from "@/app/auth/components/AuthInput";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState, useCallback, useEffect } from "react";
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
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { sendVerificationCode } from "@/apis/requests/user/code";
import { RequestVerify } from "@/apis/requests/user/verifiy";
import { userInfoStore } from "@/store/user";
import AuthWrapper from "@/app/auth/components/AuthWrapper";

const formSchema = z.object({
  phone: mobileSchema,
  pin: z
    .string()
    .length(6, { message: "验证码必须为 6 位" })
    .refine((v) => /^\d{6}$/.test(v), {
      message: "验证码只能包含数字",
    }),
});
export default function H5LoginPage() {
  const search = useSearch({ from: "/auth/login" });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phone: "",
      pin: "",
    },
  });
  const [isChecked, setIsChecked] = useState(false);
  const [countDown, setCountDown] = useState<number>(0);
  const navigate = useNavigate();
  const userInfo = userInfoStore();

  // 倒计时逻辑
  useEffect(() => {
    if (countDown <= 0) return;
    const timeout = setTimeout(() => {
      setCountDown(countDown - 1);
    }, 1000);
    return () => clearTimeout(timeout);
  }, [countDown]);

  const sendCodeMutation = useMutation({
    mutationFn: sendVerificationCode,
  });

  const loginMutation = useMutation({
    mutationFn: RequestVerify,
  });

  // 发送验证码逻辑
  const handleSendCode = useCallback(() => {
    const phone = form.getValues().phone;
    if (!phone) {
      toast.error("请先输入手机号");
      return;
    }

    sendCodeMutation.mutate(
      {
        authId: phone,
        authType: "phone",
      },
      {
        onError() {
          toast.error("验证码发送失败");
        },
        onSuccess() {
          setCountDown(60);
          toast("验证码已发送");
        },
      }
    );
  }, [sendCodeMutation, form]);

  // 登录提交逻辑
  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    if (!isChecked) {
      toast("请勾选使用协议与隐私协议");
      return;
    }

    loginMutation.mutate(
      {
        verify: data.pin,
        authId: data.phone,
        authType: "phone",
      },
      {
        onError() {
          form.setError("pin", {
            message: "验证码错误",
          });
        },
        onSuccess(data) {
          toast.success("登录成功");
          userInfo.setCredentials(data);
          if (data.new) {
            // 提醒需要设置密码
            toast.success("请设置密码");
            navigate({
              to: "/auth/login/password/set",
              search: {
                redirect: "/chat",
              },
            });
            return;
          }
          // 默认跳转到 /chat
          navigate({
            to: "/chat",
          });
        },
      }
    );
  };
  return (
    <div className="mt-30 relative">
      <AuthWrapper className="bg-transparent">
        <div className="grid grid-rows-3 h-full items-center gap-y-10">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="row-span-1 w-full space-y-6"
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
                name="pin"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex">
                      <FormControl>
                        <AuthInput placeholder="验证码" {...field} />
                      </FormControl>
                      <AuthButton
                        className="text-base text-center px-4 ml-2 self-center w-28 [:disabled]:bg-primary disabled:opacity-80"
                        type="button"
                        disabled={countDown > 0 || sendCodeMutation.isPending}
                        onClick={handleSendCode}
                      >
                        {countDown > 0 ? `${countDown}s` : "发送验证码"}
                      </AuthButton>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div
                className="justify-center flex items-center gap-2"
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
                  我已阅读并同意
                  <Link
                    to="."
                    className="text-primary font-bold underline-offset-4 hover:underline"
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
              <AuthButton disabled={loginMutation.isPending} type="submit">
                {loginMutation.isPending ? "登录中..." : "登录"}
              </AuthButton>
              <AuthButton variant={"secondary"} asChild>
                <Link search={search} to="/auth/login/password">
                  密码登录
                </Link>
              </AuthButton>
            </form>
          </Form>
        </div>
      </AuthWrapper>
    </div>
  );
}
