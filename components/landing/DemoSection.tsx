"use client";

import { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Utensils, Home, Smile, ChevronRight, Zap } from "lucide-react";

const demos = [
  {
    id: "food",
    icon: <Utensils className="w-5 h-5" />,
    label: "Food Analysis",
    color: "#22C55E",
    emoji: "🍜",
    detected: "Pad Thai Noodles",
    confidence: 97.3,
    results: [
      { label: "Calories", value: "482 kcal", bar: 65, color: "#22C55E" },
      { label: "Protein", value: "28g", bar: 72, color: "#00E5FF" },
      { label: "Carbohydrates", value: "54g", bar: 80, color: "#F59E0B" },
      { label: "Fat", value: "12g", bar: 35, color: "#FF006E" },
      { label: "Fiber", value: "4g", bar: 40, color: "#7C3AED" },
    ],
    health: 8.2,
    tag: "Balanced Meal",
    tagColor: "#22C55E",
  },
  {
    id: "room",
    icon: <Home className="w-5 h-5" />,
    label: "Room Analysis",
    color: "#00E5FF",
    emoji: "🛋️",
    detected: "Living Room",
    confidence: 94.1,
    results: [
      { label: "Sofa", value: "Detected", bar: 95, color: "#00E5FF" },
      { label: "TV Unit", value: "Detected", bar: 90, color: "#7C3AED" },
      { label: "Coffee Table", value: "Detected", bar: 87, color: "#22C55E" },
      { label: "Wall Art", value: "Detected", bar: 78, color: "#F59E0B" },
      { label: "Lighting", value: "3 sources", bar: 60, color: "#FF006E" },
    ],
    health: 7.5,
    tag: "Modern Style",
    tagColor: "#00E5FF",
  },
  {
    id: "emotion",
    icon: <Smile className="w-5 h-5" />,
    label: "Emotion Analysis",
    color: "#7C3AED",
    emoji: "😊",
    detected: "Human Face",
    confidence: 99.2,
    results: [
      { label: "Happy", value: "82%", bar: 82, color: "#22C55E" },
      { label: "Neutral", value: "10%", bar: 10, color: "#00E5FF" },
      { label: "Focused", value: "6%", bar: 6, color: "#7C3AED" },
      { label: "Eye Contact", value: "91%", bar: 91, color: "#F59E0B" },
      { label: "Confidence", value: "85%", bar: 85, color: "#FF006E" },
    ],
    health: 9.1,
    tag: "Interview Ready",
    tagColor: "#7C3AED",
  },
];

export function DemoSection() {
  const [active, setActive] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  const demo = demos[active];

  return (
    <section id="demo" className="py-24 relative" ref={ref}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            className="inline-flex items-center gap-2 ai-badge mb-4"
          >
            <Zap className="w-3 h-3" />
            Live Demo
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="font-display text-4xl lg:text-5xl font-black text-white mb-4"
          >
            See <span className="gradient-text">RealityGPT</span> in Action
          </motion.h2>
        </div>

        {/* Demo tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2 }}
          className="flex justify-center mb-8"
        >
          <div className="flex gap-2 p-1.5 glass rounded-2xl">
            {demos.map((d, i) => (
              <button
                key={d.id}
                onClick={() => setActive(i)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  active === i
                    ? "text-[#050816] font-bold"
                    : "text-white/50 hover:text-white"
                }`}
                style={
                  active === i
                    ? { background: d.color, boxShadow: `0 0 20px ${d.color}50` }
                    : {}
                }
              >
                <span style={active === i ? { color: "#050816" } : { color: d.color }}>
                  {d.icon}
                </span>
                {d.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Demo display */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="grid lg:grid-cols-2 gap-8 items-center"
          >
            {/* Left: Mock camera view */}
            <div className="relative aspect-video glass rounded-2xl overflow-hidden group"
              style={{ border: `1px solid ${demo.color}30` }}>
              {/* Scan line */}
              <motion.div
                className="absolute left-0 right-0 h-0.5 z-20"
                style={{ background: `linear-gradient(90deg, transparent, ${demo.color}, transparent)` }}
                animate={{ y: ["0%", "25000%"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />

              {/* Mock content */}
              <div className="absolute inset-0 flex items-center justify-center"
                style={{ background: `radial-gradient(ellipse at center, ${demo.color}10, #050816)` }}>
                <div className="text-9xl">{demo.emoji}</div>
              </div>

              {/* Detection box */}
              <motion.div
                className="absolute inset-12 rounded-xl"
                style={{ border: `2px solid ${demo.color}80` }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="scan-bracket tl" style={{ borderColor: demo.color }} />
                <div className="scan-bracket tr" style={{ borderColor: demo.color }} />
                <div className="scan-bracket bl" style={{ borderColor: demo.color }} />
                <div className="scan-bracket br" style={{ borderColor: demo.color }} />
                <div
                  className="absolute -top-4 left-2 text-xs font-bold px-2 py-1 rounded"
                  style={{ background: demo.color, color: "#050816" }}
                >
                  {demo.detected.toUpperCase()} • {demo.confidence}%
                </div>
              </motion.div>

              {/* Corner info */}
              <div className="absolute top-3 left-3">
                <div className="flex items-center gap-1.5 text-xs font-mono"
                  style={{ color: demo.color }}>
                  <span className="w-2 h-2 rounded-full animate-pulse"
                    style={{ background: demo.color }} />
                  AI LIVE
                </div>
              </div>

              {/* Bottom bar */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#050816] via-[#050816]/80 to-transparent">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/50 font-mono">Analyzing frame...</span>
                  <span className="text-xs font-mono" style={{ color: demo.color }}>120ms</span>
                </div>
              </div>
            </div>

            {/* Right: Analysis results */}
            <div className="flex flex-col gap-4">
              {/* Header card */}
              <div className="glass p-4 rounded-2xl"
                style={{ border: `1px solid ${demo.color}20` }}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="text-xs text-white/40 font-mono uppercase mb-1">Detected</div>
                    <div className="text-xl font-bold text-white">{demo.detected}</div>
                  </div>
                  <div
                    className="px-3 py-1 rounded-full text-xs font-bold"
                    style={{ background: `${demo.tagColor}20`, color: demo.tagColor, border: `1px solid ${demo.tagColor}40` }}
                  >
                    {demo.tag}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-sm text-white/50">Confidence:</div>
                  <div className="flex-1 progress-bar">
                    <div className="progress-fill" style={{ width: `${demo.confidence}%`, background: `linear-gradient(90deg, ${demo.color}, ${demo.color}80)` }} />
                  </div>
                  <div className="text-sm font-bold" style={{ color: demo.color }}>{demo.confidence}%</div>
                </div>
              </div>

              {/* Data rows */}
              {demo.results.map((r, i) => (
                <motion.div
                  key={r.label}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-center gap-4 p-3 glass rounded-xl"
                >
                  <div className="w-24 text-xs text-white/50 flex-shrink-0">{r.label}</div>
                  <div className="flex-1 progress-bar">
                    <motion.div
                      className="progress-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${r.bar}%` }}
                      transition={{ duration: 0.8, delay: 0.2 + i * 0.1 }}
                      style={{ background: `linear-gradient(90deg, ${r.color}, ${r.color}80)` }}
                    />
                  </div>
                  <div className="w-16 text-right text-xs font-bold" style={{ color: r.color }}>{r.value}</div>
                </motion.div>
              ))}

              {/* Score */}
              <div className="glass p-4 rounded-2xl flex items-center justify-between"
                style={{ border: `1px solid ${demo.color}20` }}>
                <div>
                  <div className="text-xs text-white/40 font-mono uppercase mb-1">AI Score</div>
                  <div className="text-3xl font-black" style={{ color: demo.color }}>
                    {demo.health}<span className="text-lg text-white/30">/10</span>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-white/20" />
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
