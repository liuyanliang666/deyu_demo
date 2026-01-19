import { Button, type buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { VariantProps } from "class-variance-authority";

export default function AuthButton({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  return (
    <Button
      className={cn(
        "w-full rounded-full p-6 text-lg [:disabled]:bg-[#d4d5ff]",
        className,
      )}
      variant={variant}
      size={size}
      asChild={asChild}
      {...props}
    />
  );
}
