"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  delayOffset?: number;
}

export function SplitText({ text, className = "", delay = 30, delayOffset = 0 }: SplitTextProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const words = text.split(" ");

  return (
    <span className={`inline-block ${className}`}>
      {words.map((word, wordIndex) => (
        <span key={wordIndex} className="inline-block whitespace-pre">
          {word.split("").map((char, charIndex) => {
            const index =
              words.slice(0, wordIndex).join("").length + charIndex;
            return (
              <motion.span
                key={charIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={mounted ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{
                  duration: 0.5,
                  delay: (index * delay + delayOffset) / 1000,
                  ease: [0.4, 0, 0.2, 1],
                }}
                className="inline-block"
              >
                {char}
              </motion.span>
            );
          })}
          {wordIndex !== words.length - 1 && (
            <span className="inline-block">&nbsp;</span>
          )}
        </span>
      ))}
    </span>
  );
}
