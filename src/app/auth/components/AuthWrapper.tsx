import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

const AuthWrapper = ({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) => {
  const isMobile = useIsMobile();
  return (
    <div
      className={cn([
        "bg-white w-1/2 max-w-[500px] aspect-[5/6] rounded-4xl p-12 min-w-[400px]",
        isMobile && "bg-transparent",
        className,
      ])}
      {...props}
    >
      {children}
    </div>
  );
};

export default AuthWrapper;
