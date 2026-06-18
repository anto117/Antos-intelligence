"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Camera, Cpu, Sparkles, ArrowRight } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: <Camera className="w-6 h-6" />,
    title: "Point & Capture",
    description: "Open your webcam or drag-and-drop any image or video. No setup required — works instantly in your browser.",
    color: "#C8A96E",
    detail: "Supports webcam, image upload, and video files",
  },
  {
    number: "02",
    icon: <Cpu className="w-6 h-6" />,
    title: "AI Auto-Detection",
    description: "Antos Intelligence automatically classifies whether it sees Food, a Room, a Human Face, or other objects — no manual switching.",
    color: "#8B9BB4",
    detail: "YOLOv8 + MediaPipe + Gemini working in parallel",
  },
  {
    number: "03",
    icon: <Sparkles className="w-6 h-6" />,
    title: "Get Deep Insights",
    description: "Receive real-time overlays, floating data cards, nutritional breakdowns, design suggestions, or emotional analysis.",
    color: "#C23B53",
    detail: "120ms average response time",
  },
];

export function HowItWorksSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="how-it-works" className="py-24 relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#7C3AED] opacity-[0.04] blur-[120px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8" ref={ref}>
        {/* Header */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            className="inline-flex items-center gap-2 ai-badge mb-4"
          >
            <ArrowRight className="w-3 h-3" />
            How It Works
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="font-display text-4xl lg:text-5xl font-black text-white mb-4"
          >
            Three Steps to{" "}
            <span className="gradient-text">AI Intelligence</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.2 }}
            className="text-white/50 text-lg max-w-xl mx-auto"
          >
            From camera to insight in under 200 milliseconds.
          </motion.p>
        </div>

        {/* Steps */}
        <div className="grid lg:grid-cols-3 gap-8 relative">
          {/* Connecting line (desktop) */}
          <div className="hidden lg:block absolute top-12 left-[calc(16.66%+32px)] right-[calc(16.66%+32px)] h-px">
            <motion.div
              initial={{ scaleX: 0 }}
              animate={inView ? { scaleX: 1 } : {}}
              transition={{ duration: 1.5, delay: 0.5 }}
              className="w-full h-full bg-gradient-to-r from-[#C8A96E] via-[#8B9BB4] to-[#C23B53] origin-left"
              style={{ boxShadow: "0 0 10px rgba(200,169,110,0.25)" }}
            />
          </div>

          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 + i * 0.15 }}
              className="relative flex flex-col items-center text-center group"
            >
              {/* Step number circle */}
              <div className="relative mb-8">
                <div
                  className="w-24 h-24 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110"
                  style={{
                    background: `${step.color}15`,
                    border: `2px solid ${step.color}40`,
                    boxShadow: `0 0 40px ${step.color}20`,
                  }}
                >
                  <div style={{ color: step.color }}>{step.icon}</div>
                </div>

                {/* Number badge */}
                <div
                  className="absolute -top-3 -right-3 w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black"
                  style={{
                    background: step.color,
                    color: "#050816",
                    boxShadow: `0 0 15px ${step.color}60`,
                  }}
                >
                  {step.number}
                </div>
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed mb-4">{step.description}</p>

              {/* Detail pill */}
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
                style={{
                  background: `${step.color}10`,
                  color: `${step.color}cc`,
                  border: `1px solid ${step.color}20`,
                }}
              >
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: step.color }}
                />
                {step.detail}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8 }}
          className="text-center mt-16"
        >
          <a
            href="/camera"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-[#C8A96E]/[0.06] border border-[#C8A96E]/20 text-white font-semibold hover:bg-[#C8A96E]/10 hover:border-[#C8A96E]/35 transition-all hover:-translate-y-1"
          >
            Experience It Now
            <ArrowRight className="w-5 h-5 text-[#C8A96E]" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
