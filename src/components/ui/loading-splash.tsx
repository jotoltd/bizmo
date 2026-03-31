"use client";

import { motion } from "framer-motion";

interface LoadingSplashProps {
  message?: string;
}

export function LoadingSplash({ message = "Loading..." }: LoadingSplashProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-void">
      {/* Background animated gradient */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -inset-[100%] opacity-30"
          animate={{
            background: [
              "radial-gradient(circle at 20% 80%, #00D4FF 0%, transparent 50%)",
              "radial-gradient(circle at 80% 20%, #7B61FF 0%, transparent 50%)",
              "radial-gradient(circle at 50% 50%, #00D4FF 0%, transparent 50%)",
              "radial-gradient(circle at 20% 80%, #00D4FF 0%, transparent 50%)",
            ],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Logo container */}
      <div className="relative flex flex-col items-center gap-8">
        {/* Logo animation */}
        <motion.div
          className="relative"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {/* Outer ring */}
          <motion.div
            className="absolute inset-0 -m-4 rounded-full border-2 border-electric/30"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.1, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Inner ring */}
          <motion.div
            className="absolute inset-0 -m-2 rounded-full border border-electric/50"
            animate={{
              scale: [1.1, 1, 1.1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Logo */}
          <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-electric to-purple-500 flex items-center justify-center shadow-2xl shadow-electric/20">
            <motion.span
              className="text-4xl font-bold text-white"
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              B
            </motion.span>
          </div>
        </motion.div>

        {/* Text */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold text-white mb-2">Bizno</h2>
          <p className="text-[var(--text-secondary)]">{message}</p>
        </motion.div>

        {/* Loading dots */}
        <motion.div
          className="flex gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-electric"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut",
              }}
            />
          ))}
        </motion.div>

        {/* Progress bar */}
        <motion.div
          className="w-48 h-1 rounded-full bg-white/10 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-electric to-purple-500"
            initial={{ width: "0%" }}
            animate={{
              width: ["0%", "100%", "0%"],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>
      </div>
    </div>
  );
}
