"use client";

import { motion, type Easing } from "framer-motion";

interface CircleCustom {
  x: number[];
  y: number[];
  scale: number[];
  rotate?: number[];
  duration: number;
  ease?: Easing | Easing[];
}

const circleVariants = {
  animate: (custom: CircleCustom) => ({
    x: custom.x,
    y: custom.y,
    scale: custom.scale,
    rotate: custom.rotate || 0,
    transition: {
      duration: custom.duration,
      repeat: Infinity,
      ease: (custom.ease || "easeInOut") as Easing,
    },
  }),
};

const circles = [
  {
    className: "w-80 h-80 -top-40 -right-40 from-blue-400/20 to-purple-600/20",
    x: [0, 100, 0],
    y: [0, -100, 0],
    scale: [1, 1.2, 1],
    duration: 20,
    blur: "blur-3xl",
  },
  {
    className: "w-96 h-96 -bottom-40 -left-40 from-purple-400/20 to-pink-600/20",
    x: [0, -120, 0],
    y: [0, 80, 0],
    scale: [1, 0.8, 1],
    duration: 25,
    blur: "blur-3xl",
  },
  {
    className: "w-64 h-64 top-1/2 left-1/2 from-green-400/10 to-blue-600/10",
    x: [-50, 50, -50],
    y: [-30, 30, -30],
    scale: [0.8, 1.1, 0.8],
    duration: 18,
    blur: "blur-3xl",
  },
  {
    className: "w-48 h-48 top-20 right-1/4 from-yellow-400/15 to-orange-600/15",
    x: [0, 60, 0],
    y: [0, -40, 0],
    rotate: [0, 180, 360],
    duration: 30,
    blur: "blur-2xl",
  },
  {
    className: "w-56 h-56 bottom-1/4 right-1/3 from-indigo-400/10 to-cyan-600/10",
    x: [0, -80, 0],
    y: [0, 60, 0],
    scale: [1, 1.3, 1],
    duration: 22,
    blur: "blur-3xl",
  },
];

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {circles.map((c, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full bg-gradient-to-br ${c.className} ${c.blur}`}
          custom={c}
          variants={circleVariants}
          animate="animate"
        />
      ))}
    </div>
  );
}




