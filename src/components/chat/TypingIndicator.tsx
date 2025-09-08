'use client';

import { motion } from 'framer-motion';
import { TypingIndicator as TypingIndicatorType } from '@/types/chat';

interface TypingIndicatorProps {
  indicator: TypingIndicatorType;
}

export default function TypingIndicator({ indicator }: TypingIndicatorProps) {
  if (!indicator.isTyping) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex justify-start"
    >
      <div className="bg-gray-100 text-gray-600 rounded-2xl rounded-bl-md px-4 py-2 max-w-[80%]">
        <div className="flex items-center space-x-1">
          <span className="text-sm">AI is typing</span>
          <div className="flex space-x-1">
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                className="w-2 h-2 bg-gray-400 rounded-full"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: index * 0.2
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
