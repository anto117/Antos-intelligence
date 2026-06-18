"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

interface Stat {
  value: string;
  label: string;
  suffix?: string;
  color: string;
}

const stats: Stat[] = [
  { value: "97.3", suffix: "%", label: "Detection Accuracy", color: "#00E5FF" },
  { value: "120", suffix: "ms", label: "Analysis Speed", color: "#7C3AED" },
  { value: "50", suffix: "+", label: "Object Classes", color: "#22C55E" },
  { value: "5", suffix: " modes", label: "AI Analysis Modes", color: "#FF006E" },
];

function CounterStat({ stat, index }: { stat: Stat; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="flex flex-col items-center gap-2 p-6 glass rounded-2xl hover-card group"
    >
      <div
        className="text-4xl lg:text-5xl font-black font-display"
        style={{ color: stat.color, textShadow: `0 0 20px ${stat.color}80` }}
      >
        {inView ? stat.value : "0"}
        <span className="text-2xl lg:text-3xl">{stat.suffix}</span>
      </div>
      <div className="text-sm text-white/50 text-center font-medium">{stat.label}</div>
      <div
        className="w-8 h-0.5 rounded-full transition-all group-hover:w-16"
        style={{ background: stat.color }}
      />
    </motion.div>
  );
}

export function StatsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-16 relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Divider line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : {}}
          transition={{ duration: 1 }}
          className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-12"
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <CounterStat key={stat.label} stat={stat} index={i} />
          ))}
        </div>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : {}}
          transition={{ duration: 1, delay: 0.4 }}
          className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mt-12"
        />
      </div>
    </section>
  );
}
