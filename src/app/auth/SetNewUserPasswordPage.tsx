"use client";
import AuthButton from "@/app/auth/components/AuthButton";
import { AuthInput } from "@/app/auth/components/AuthInput";
import z from "zod";
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
import { setPassword } from "@/apis/requests/user/set-password";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useIsMobile } from "@/hooks/use-mobile";

const formSchema = z
  .object({
    password: z
      .string()
      .min(6, "密码至少6位")
      .max(20, "密码最多20位")
      .regex(/^(?=.*[a-zA-Z])(?=.*\d)/, "密码必须包含字母和数字"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "两次输入的密码不一致",
    path: ["confirmPassword"],
  });

export default function SetNewUserPasswordPage() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });
  const navigate = useNavigate();
  const search = useSearch({
    from: "/auth/login/password/set",
  });

  const setPasswordMutation = useMutation({
    mutationFn: setPassword,
  });

  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    setPasswordMutation.mutate(
      {
        newPassword: data.password,
      },
      {
        onSuccess() {
          toast.success("密码设置成功");
          // 获取 redirect 参数，如果没有则默认跳转到 /chat
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
            <h3 className="text-2xl font-bold w-full h-fit my-10 text-center">
              设置初始密码
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
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <AuthInput
                      password
                      {...field}
                      placeholder="请输入初始密码"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <AuthInput
                      password
                      {...field}
                      placeholder="请确认初始密码"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <AuthButton
              className="mt-10"
              disabled={setPasswordMutation.isPending}
              type="submit"
            >
              设置密码
            </AuthButton>
            <AuthButton
              variant="link"
              type="button"
              onClick={() => {
                navigate({
                  to: "/chat",
                });
              }}
            >
              暂不设置
            </AuthButton>
          </form>
        </Form>
      </div>
    </AuthWrapper>
  );
}
