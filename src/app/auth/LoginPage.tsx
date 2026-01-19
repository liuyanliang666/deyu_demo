"use client";
import AuthButton from "@/app/auth/components/AuthButton";
import { AuthInput } from "@/app/auth/components/AuthInput";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Link, useSearch } from "@tanstack/react-router";
import { useCallback, useContext, useState } from "react";
import { AuthContext } from "@/app/auth/context";
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
import VerificationCodeTab from "@/app/auth/components/VerificationCodeTab";
import AuthWrapper from "@/app/auth/components/AuthWrapper";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { sendVerificationCode } from "@/apis/requests/user/code";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import H5LoginPage from "@/app/h5/auth/H5LoginPage";
// const iconSize = 26;

const formSchema = z.object({
  phone: mobileSchema,
});
function LoginPagePC() {
  const search = useSearch({
    from: "/auth/login",
  });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phone: "",
    },
  });
  const [isChecked, setIsChecked] = useState(false);
  const [isVerificationStage, setVerificationStage] = useState(false);
  const handleSwitchBack = useCallback(() => {
    setVerificationStage(false);
  }, []);
  const authContext = useContext(AuthContext);
  const sendCodeMutation = useMutation({
    mutationFn: sendVerificationCode,
  });
  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    if (!isChecked) {
      toast.info("请勾选使用协议与隐私协议");
      return;
    }
    authContext.setPhone(data.phone);
    sendCodeMutation.mutate(
      {
        authId: data.phone,
        authType: "phone",
      },
      {
        onSuccess() {
          setVerificationStage(true);
          toast("验证码已发送");
        },
      }
    );
  };
  return (
    <>
      {!isVerificationStage ? (
        <AuthWrapper>
          <div className="flex flex-col h-full items-center">
            <h3 className="text-2xl font-bold w-full h-fit my-10 text-center">
              验证登录
            </h3>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className={cn([
                  "w-full space-y-6 flex-1 flex flex-col justify-center",
                ])}
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
                <div
                  className="justify-center flex items-center gap-2 pb-6"
                  style={{
                    letterSpacing: "0.5px",
                  }}
                >
                  <Checkbox
                    checked={isChecked}
                    className="border-primary"
                    onCheckedChange={(checked) =>
                      setIsChecked(
                        checked === "indeterminate" ? false : checked
                      )
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
                <AuthButton disabled={sendCodeMutation.isPending} type="submit">
                  下一步
                </AuthButton>
                <AuthButton variant={"secondary"} asChild>
                  <Link
                    search={search}
                    to="/auth/login/password"
                  >
                    密码登录
                  </Link>
                </AuthButton>
              </form>
            </Form>
            {/* <div className="[&>button]:rounded-full flex justify-between px-4 items-end h-full">
              <Outline>
                <AppleCompany size={iconSize} />
              </Outline>
              <Outline>
                <WeChat size={iconSize} />
              </Outline>
              <Outline>
                <Sina size={iconSize} />
              </Outline>
            </div> */}
          </div>
        </AuthWrapper>
      ) : (
        <VerificationCodeTab onBack={handleSwitchBack} />
      )}
    </>
  );
}

export default function LoginPage(){
  const isMobile = useIsMobile();
  console.log(isMobile);
  if(isMobile) {
    return <H5LoginPage />;
  }
  return <LoginPagePC />;
}