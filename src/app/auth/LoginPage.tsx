import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Link, useSearch } from "@tanstack/react-router";
import { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { sendVerificationCode } from "@/apis/requests/user/code";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { mobileSchema } from "@/utils/schema";
import AuthButton from "./components/AuthButton";
import { AuthInput } from "./components/AuthInput";
import AuthWrapper from "./components/AuthWrapper";
import VerificationCodeTab from "./components/VerificationCodeTab";
import { AuthContext } from "./context";

const formSchema = z.object({
  phone: mobileSchema,
});

export default function LoginPage() {
  const search = useSearch({ from: "/auth/login" });
  const { phone, setPhone } = useContext(AuthContext);
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [isChecked, setIsChecked] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phone,
    },
  });

  const sendCodeMutation = useMutation({
    mutationFn: sendVerificationCode,
  });

  const handleSendCode = (data: z.infer<typeof formSchema>) => {
    if (!isChecked) {
      toast.info("请勾选使用协议与隐私协议");
      return;
    }

    sendCodeMutation.mutate(
      {
        authId: data.phone,
        authType: "phone",
      },
      {
        onError() {
          toast.error("验证码发送失败");
        },
        onSuccess() {
          setPhone(data.phone);
          setStep("code");
          toast.success("验证码已发送");
        },
      },
    );
  };

  if (step === "code") {
    return (
      <VerificationCodeTab
        onBack={() => {
          setStep("phone");
        }}
      />
    );
  }

  return (
    <AuthWrapper className="flex flex-col items-center h-auto aspect-[5/4] p-10">
      <h3 className="text-2xl font-bold w-full h-fit mb-8 text-center">
        验证码登录
      </h3>
      <form
        onSubmit={form.handleSubmit(handleSendCode)}
        className="w-full gap-4 flex flex-col"
      >
        <div className="space-y-2">
          <AuthInput phone {...form.register("phone")} />
          {form.formState.errors.phone?.message && (
            <p className="text-sm text-destructive px-2">
              {form.formState.errors.phone.message}
            </p>
          )}
        </div>

        <div
          className="justify-center flex items-center gap-2 pb-6"
          style={{ letterSpacing: "0.5px" }}
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
          <AuthButton disabled={sendCodeMutation.isPending} type="submit">
            {sendCodeMutation.isPending ? "发送中..." : "发送验证码"}
          </AuthButton>
          <AuthButton variant={"secondary"} asChild>
            <Link search={search} to="/auth/login/password">
              密码登录
            </Link>
          </AuthButton>
        </div>
      </form>
    </AuthWrapper>
  );
}
