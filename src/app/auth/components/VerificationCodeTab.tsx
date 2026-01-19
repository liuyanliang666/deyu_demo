import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import AuthWrapper from "./AuthWrapper";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useCallback, useContext, useEffect, useState } from "react";
import { AuthContext } from "../context";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { RequestVerify } from "@/apis/requests/user/verifiy";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { sendVerificationCode } from "@/apis/requests/user/code";
import { tokenStore } from "@/lib/request";

const FormSchema = z.object({
  pin: z
    .string()
    .length(6, { message: "验证码必须为 6 位" })
    .refine((v) => /^\d{6}$/.test(v), {
      message: "验证码只能包含数字",
    }),
});

export default function VerificationCodeTab({
  onBack,
}: { onBack: () => void }) {
  const { phone } = useContext(AuthContext);
  const navigate = useNavigate();
  const search = useSearch({
    from: "/auth/login",
  });
  const [countDown, setCountDown] = useState<number>(60);
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      pin: "",
    },
  });
  useEffect(() => {
    if (countDown <= 0) return;
    const timeout = setTimeout(() => {
      setCountDown(countDown - 1);
    }, 1000);
    return () => clearTimeout(timeout);
  }, [countDown]);
  const loginMutation = useMutation({
    mutationFn: RequestVerify,
  });
  const sendCodeMutation = useMutation({
    mutationFn: sendVerificationCode,
  });
  const handleSendCode = useCallback(() => {
    sendCodeMutation.mutate(
      {
        authId: phone,
        authType: "phone",
      },
      {
        onError() {
          form.setError("pin", {
            message: "验证码发送失败",
          });
        },
        onSuccess() {
          setCountDown(60);
          toast("验证码已重新发送");
        },
      },
    );
  }, [sendCodeMutation, phone, form]);
  function onSubmit(data: z.infer<typeof FormSchema>) {
    loginMutation.mutate(
      {
        verify: data.pin,
        authId: phone,
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
          tokenStore.set(data.token);
          // 获取 redirect 参数，如果没有则默认跳转到 /chat
          const redirectUrl = search.redirect || "/chat";
          if (data.new) {
            // 提醒需要设置密码
            toast.success("请设置密码");
            navigate({
              to: "/auth/login/password/set",
              search: {
                redirect: redirectUrl,
              },
            });
            return;
          }
          navigate({
            to: redirectUrl,
          });
        },
      },
    );
  }

  return (
    <AuthWrapper className="aspect-[25/23] grid grid-rows-4">
      <div className="row-span-2 items-center justify-center flex flex-col gap-3">
        <h3 className="text-2xl font-semibold relative w-full text-center">
          <Button
            onClick={onBack}
            className="absolute left-0"
            variant={"ghost"}
            size={"icon"}
          >
            <ChevronLeft className="size-6" />
          </Button>
          输入6位验证码
        </h3>
        <h4 className="text-gray-400 text-sm">
          验证码已发送至
          <span className="font-bold text-foreground">{phone}</span>
        </h4>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="pin"
            render={({ field }) => (
              <FormItem className="justify-center">
                <FormControl>
                  <InputOTP
                    maxLength={6}
                    {...field}
                    onChange={async (v) => {
                      field.onChange(v);
                      if (form.getValues().pin.length === 6) {
                        const valid = await form.trigger("pin");
                        if (valid) form.handleSubmit(onSubmit)();
                      }
                    }}
                  >
                    <InputOTPGroup className="gap-2 [&>div]:rounded-full [&>div]:size-12 [&>div]:bg-[#f6f6f6] justify-between">
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </FormControl>
                <FormMessage className="text-center" />
              </FormItem>
            )}
          />
        </form>
      </Form>
      <Button
        disabled={countDown > 0}
        onClick={handleSendCode}
        className="self-end"
        variant={"link"}
      >
        重新发送{countDown > 0 ? `${countDown}s` : ""}
      </Button>
    </AuthWrapper>
  );
}
