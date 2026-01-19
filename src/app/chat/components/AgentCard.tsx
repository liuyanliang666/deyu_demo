import { cn } from "@/lib/utils";
import "./agent-card.css";

// 处理文本中的 [] 符号，将其内容加粗
export const formatDescription = (text: string) => {
  const parts = text.split(/(\[.*?\])/g);
  return parts.map((part, index) => {
    if (part.startsWith('[') && part.endsWith(']')) {
      return <strong key={`bold-${index}-${part}`}>{part.slice(1, -1)}</strong>;
    }
    return <span key={`text-${index}-${part}`}>{part}</span>;
  });
};

export default function AgentCard({
  name,
  description,
  imgUrl,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  name: string;
  description: string;
  className?: string;
  imgUrl: string;
}) {
  return (
    <div
      {...props}
      className={cn(
        "@container bg-primary-foreground border-0 shadow-none outline-none overflow-hidden cursor-pointer",
        "transition-colors duration-300",
        "px-2 items-center",
        "agent-card rounded-2xl grid grid-cols-4",
        className,
      )}
    >
      <div className="col-span-1 p-1">
        {imgUrl && <img src={imgUrl} alt={name} />}
      </div>
      <div className="flex flex-col flex-1 col-span-3 self-center px-2">
        <h3 className="text-primary font-bold text-xl">{name}</h3>
        <p
          style={{
            lineHeight: "1.3",
            fontSize: "14px",
          }}
          className="@xs:line-clamp-4 whitespace-pre-wrap @3xs:line-clamp-3 @[12rem]:line-clamp-2 line-clamp-1 text-muted-foreground break-words"
        >
          {formatDescription(description)}
        </p>
      </div>
    </div>
  );
}
