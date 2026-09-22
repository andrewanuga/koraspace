"use client";

import { motion } from "framer-motion";

export function OnboardingBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden select-none z-0">
      {/* Background Grid Mesh */}
      <div
        className="absolute inset-0 opacity-[0.4] dark:opacity-[0.25]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(148, 163, 184, 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(148, 163, 184, 0.08) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse 80% 60% at 50% 50%, #000 60%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 60% at 50% 50%, #000 60%, transparent 100%)",
        }}
      />

      {/* Primary Brand Pink Ambient Blob */}
      <motion.div
        animate={{
          x: [0, 45, -35, 0],
          y: [0, -40, 25, 0],
          scale: [1, 1.15, 0.95, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -left-24 -top-24 h-[550px] w-[550px] rounded-full blur-[130px] opacity-[0.14] dark:opacity-[0.24]"
        style={{
          background:
            "radial-gradient(circle, #ff0a8a 0%, #d9006c 45%, transparent 75%)",
        }}
      />

      {/* Electric Brand Blue Ambient Blob */}
      <motion.div
        animate={{
          x: [0, -50, 40, 0],
          y: [0, 45, -30, 0],
          scale: [1, 1.2, 0.9, 1],
        }}
        transition={{
          duration: 24,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
        className="absolute -bottom-32 -right-24 h-[580px] w-[580px] rounded-full blur-[140px] opacity-[0.12] dark:opacity-[0.22]"
        style={{
          background:
            "radial-gradient(circle, #3b82f6 0%, #1d4ed8 45%, transparent 75%)",
        }}
      />

      {/* Center Violet Synergy Blob */}
      <motion.div
        animate={{
          x: [0, 30, -30, 0],
          y: [0, -35, 30, 0],
          scale: [0.9, 1.1, 0.95, 0.9],
        }}
        transition={{
          duration: 28,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 4,
        }}
        className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 h-[460px] w-[460px] rounded-full blur-[150px] opacity-[0.08] dark:opacity-[0.16]"
        style={{
          background:
            "radial-gradient(circle, #a855f7 0%, #7c3aed 45%, transparent 75%)",
        }}
      />

      {/* Subtle Rotating Orbital Glow Ring (Brand Pink) */}
      <motion.div
        animate={{
          rotate: 360,
          scale: [1, 1.04, 1],
        }}
        transition={{
          rotate: { duration: 50, repeat: Infinity, ease: "linear" },
          scale: { duration: 12, repeat: Infinity, ease: "easeInOut" },
        }}
        className="absolute -top-32 left-1/4 h-[500px] w-[500px] rounded-full border border-[#ff0a8a]/[0.08] dark:border-[#ff0a8a]/[0.12]"
        style={{
          boxShadow: "0 0 80px rgba(255, 10, 138, 0.03)",
        }}
      />

      {/* Subtle Counter-Rotating Orbital Ring (Brand Blue) */}
      <motion.div
        animate={{
          rotate: -360,
          scale: [1, 1.06, 1],
        }}
        transition={{
          rotate: { duration: 60, repeat: Infinity, ease: "linear" },
          scale: { duration: 15, repeat: Infinity, ease: "easeInOut" },
        }}
        className="absolute -bottom-40 right-1/4 h-[600px] w-[600px] rounded-full border border-[#3b82f6]/[0.08] dark:border-[#3b82f6]/[0.12]"
        style={{
          boxShadow: "0 0 90px rgba(59, 130, 246, 0.03)",
        }}
      />
    </div>
  );
}
