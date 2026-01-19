import { formatDescription } from "@/app/chat/components/AgentCard";
import type { Card } from "@/app/chat/constants";
import { cn } from "@/lib/utils";
import { motion, useMotionValue } from "motion/react";

interface CardRotateProps {
  children: React.ReactNode;
  onSendToBack: () => void;
  sensitivity: number;
}

function CardRotate({ children, onSendToBack, sensitivity }: CardRotateProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  function handleDragEnd(_: never, info: { offset: { x: number; y: number } }) {
    if (
      Math.abs(info.offset.x) > sensitivity ||
      Math.abs(info.offset.y) > sensitivity
    ) {
      onSendToBack();
    } else {
      x.set(0);
      y.set(0);
    }
  }

  return (
    <motion.div
      className="absolute cursor-grab"
      style={{ translateX: x, translateY: y, willChange: 'transform' }}
      drag
      dragConstraints={{ top: 0, right: 0, bottom: 0, left: 0 }}
      dragElastic={0.3}
      whileTap={{ cursor: "grabbing", scale: 0.9 }}
      onDragEnd={handleDragEnd}
    >
      {children}
    </motion.div>
  );
}

interface StackProps {
  randomRotation?: boolean;
  sensitivity?: number;
  cardDimensions?: { width: number; height: number };
  sendToBackOnClick?: boolean;
  cards: Card[];
  sendToBack: (id: string) => void;
  animationConfig?: { stiffness: number; damping: number };
  className?: string;
}

export default function Stack({
  randomRotation = false,
  sensitivity = 200,
  cards = [],
  animationConfig = { stiffness: 180, damping: 26 },
  sendToBackOnClick = false,
  sendToBack,
  className,
}: StackProps) {
  return (
    <div
      className={cn(["relative", className])}
      style={{
        perspective: 600,
      }}
    >
      {cards.map((card, index) => {
        // eslint-disable-next-line react-hooks/purity
        const randomRotate = randomRotation ? Math.random() * 10 - 5 : 0;

        return (
          <CardRotate
            key={card.name}
            onSendToBack={() => sendToBack(card.name)}
            sensitivity={sensitivity}
          >
            <motion.div
              className="rounded-2xl overflow-hidden agent-card border-2 bg-white w-70 aspect-[2/3] p-4"
              onClick={() => sendToBackOnClick && sendToBack(card.name)}
              animate={{
                rotateZ: (cards.length - index - 1) * 3 + randomRotate,
                scale: 1 + index * 0.06 - cards.length * 0.06,
                transformOrigin: "90% 90%",
              }}
              initial={false}
              transition={{
                type: "spring",
                stiffness: animationConfig.stiffness,
                damping: animationConfig.damping,
              }}
            >
              <div className="flex flex-col items-center justify-center">
                <div className="text-2xl text-primary font-bold mb-4">
                  {card.name === '' ? "高科芯" : card.name}
                </div>
                <img
                  src={card.imgUrl}
                  alt={`card-${card.name}`}
                  className="object-cover pointer-events-none h-32"
                />
              </div>
              <p className="p-4 text-gray-600 text-center" style={{
                fontSize: 18
              }}>{formatDescription(card.description)}</p>
            </motion.div>
          </CardRotate>
        );
      })}
    </div>
  );
}
