"use client";

import { ReactNode, ElementType, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function AnimatedList({
  children,
  className,
  delay = 100,
  initialDelay = 0,
  as: Component = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  initialDelay?: number;
  as?: ElementType;
}) {
  const MotionComponent = useMemo(() => {
    if (typeof Component === 'string') {
      return (motion as any)[Component] || (motion as any).create(Component);
    }
    return (motion as any).create(Component);
  }, [Component]);

  return (
    <MotionComponent
      initial="hidden"
      animate="show"
      variants={{
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: {
            staggerChildren: delay / 1000,
            delayChildren: initialDelay / 1000,
          },
        },
      }}
      className={className}
    >
      <AnimatePresence mode="popLayout">
        {children}
      </AnimatePresence>
    </MotionComponent>
  );
}

export function AnimatedListItem({ children, as: Component = "div", className }: { children: ReactNode, as?: ElementType, className?: string }) {
  const MotionComponent = useMemo(() => {
    if (typeof Component === 'string') {
      return (motion as any)[Component] || (motion as any).create(Component);
    }
    return (motion as any).create(Component);
  }, [Component]);

  const isTableElement = Component === "tr" || Component === "tbody";

  return (
    <MotionComponent
      variants={{
        hidden: { opacity: 0, y: isTableElement ? 0 : 20 },
        show: { 
          opacity: 1, 
          y: 0,
          transition: { 
            duration: 0.6, 
            ease: [0.215, 0.61, 0.355, 1] 
          } 
        },
        exit: { 
          opacity: 0, 
          x: -20, 
          transition: { duration: 0.3 } 
        }
      }}
      className={className}
      layout={isTableElement ? false : "position"}
    >
      {children}
    </MotionComponent>
  );
}
