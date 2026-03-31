"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  rotation: number;
  color: string;
  size: number;
}

const colors = ["#00D4FF", "#7B61FF", "#10B981", "#F59E0B", "#EF4444", "#EC4899"];

export function Confetti({ show, onComplete }: { show: boolean; onComplete?: () => void }) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    if (show) {
      const newPieces: ConfettiPiece[] = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * window.innerWidth,
        y: -20 - Math.random() * 100,
        rotation: Math.random() * 360,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 8 + Math.random() * 8,
      }));
      setPieces(newPieces);

      const timer = setTimeout(() => {
        setPieces([]);
        onComplete?.();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {pieces.map((piece) => (
        <motion.div
          key={piece.id}
          initial={{
            x: piece.x,
            y: piece.y,
            rotate: 0,
            opacity: 1,
          }}
          animate={{
            x: piece.x + (Math.random() - 0.5) * 200,
            y: window.innerHeight + 50,
            rotate: piece.rotation + 360,
            opacity: 0,
          }}
          transition={{
            duration: 2 + Math.random() * 1,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          className="fixed z-50 pointer-events-none"
          style={{
            width: piece.size,
            height: piece.size,
            backgroundColor: piece.color,
            borderRadius: Math.random() > 0.5 ? "50%" : "2px",
          }}
        />
      ))}
    </AnimatePresence>
  );
}

export function SuccessToast({ message, show, onComplete }: { message: string; show: boolean; onComplete?: () => void }) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onComplete?.();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="rounded-full bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-3 shadow-lg shadow-green-500/20 flex items-center gap-3">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="w-6 h-6 rounded-full bg-white flex items-center justify-center"
            >
              <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
            <span className="text-white font-semibold">{message}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
