"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Camera, Play, Sparkles, Brain, Eye, Zap } from "lucide-react";

const TYPING_TEXTS = [
  "Food & Nutrition",
  "Room Design",
  "Human Emotions",
  "Object Detection",
  "Scene Analysis",
];

function useTypingEffect(texts: string[], speed = 80, pause = 2000) {
  const [currentText, setCurrentText] = useState("");
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = texts[textIndex];

    const timeout = setTimeout(
      () => {
        if (!deleting) {
          if (charIndex < current.length) {
            setCurrentText(current.slice(0, charIndex + 1));
            setCharIndex((c) => c + 1);
          } else {
            setTimeout(() => setDeleting(true), pause);
          }
        } else {
          if (charIndex > 0) {
            setCurrentText(current.slice(0, charIndex - 1));
            setCharIndex((c) => c - 1);
          } else {
            setDeleting(false);
            setTextIndex((i) => (i + 1) % texts.length);
          }
        }
      },
      deleting ? speed / 2 : speed
    );

    return () => clearTimeout(timeout);
  }, [charIndex, deleting, textIndex, texts, speed, pause]);

  return currentText;
}

// Animated scanning camera visualization
function CameraVisualization() {
  const [scanProgress, setScanProgress] = useState(0);
  const [detectionPhase, setDetectionPhase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setScanProgress((p) => {
        if (p >= 100) {
          setDetectionPhase((d) => (d + 1) % 3);
          return 0;
        }
        return p + 1;
      });
    }, 30);
    return () => clearInterval(interval);
  }, []);

  const phases = ["Food Detection", "Nutrition Analysis", "Health Scoring"];
  const phaseColors = ["#00E5FF", "#22C55E", "#7C3AED"];

  return (
    <div className="relative w-full max-w-lg mx-auto aspect-square">
      {/* Outer glow rings */}
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="absolute inset-0 rounded-full border border-[#00E5FF]/20"
          style={{ margin: `${i * 20}px` }}
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.3, 0.1, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 0.5,
          }}
        />
      ))}

      {/* Main camera frame */}
      <div className="absolute inset-8 rounded-3xl glass neon-border-cyan overflow-hidden">
        {/* Scan line */}
        <motion.div
          className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#00E5FF] to-transparent z-20"
          animate={{ y: ["0%", "100%", "0%"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />

        {/* "Camera feed" mock */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#050816] to-[#0d0828]">
          {/* Food mock image area */}
          <div className="absolute inset-4 rounded-2xl overflow-hidden">
            <div className="w-full h-full bg-gradient-to-br from-orange-900/20 to-yellow-900/10 flex items-center justify-center">
              <div className="text-6xl">🍜</div>
            </div>
          </div>

          {/* Detection box */}
          <motion.div
            className="absolute inset-8 border-2 border-[#00E5FF]/60 rounded-xl"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {/* Corner brackets */}
            <div className="scan-bracket tl" />
            <div className="scan-bracket tr" />
            <div className="scan-bracket bl" />
            <div className="scan-bracket br" />

            {/* Label */}
            <div className="absolute -top-3 left-2 bg-[#00E5FF] text-[#050816] text-xs font-bold px-2 py-0.5 rounded">
              FOOD • 97.3%
            </div>
          </motion.div>

          {/* Info overlay at bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-[#050816] to-transparent">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-white/60 font-mono">{phases[detectionPhase]}</span>
              <span className="text-xs text-[#00E5FF] font-mono">{scanProgress}%</span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${scanProgress}%`,
                  background: `linear-gradient(90deg, ${phaseColors[detectionPhase]}, ${phaseColors[(detectionPhase + 1) % 3]})`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Floating data cards */}
      <motion.div
        className="absolute -right-4 top-16 glass neon-border-cyan px-3 py-2 rounded-xl"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, delay: 0 }}
      >
        <div className="text-xs text-white/50 font-mono">Calories</div>
        <div className="text-sm font-bold text-[#22C55E]">482 kcal</div>
      </motion.div>

      <motion.div
        className="absolute -left-6 top-1/3 glass neon-border-purple px-3 py-2 rounded-xl"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, delay: 1 }}
      >
        <div className="text-xs text-white/50 font-mono">Protein</div>
        <div className="text-sm font-bold text-[#7C3AED]">28g</div>
      </motion.div>

      <motion.div
        className="absolute -right-6 bottom-24 glass px-3 py-2 rounded-xl border border-[#22C55E]/30"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }}
      >
        <div className="text-xs text-white/50 font-mono">Health Score</div>
        <div className="text-sm font-bold text-[#22C55E]">8.4 / 10</div>
      </motion.div>

      {/* AI label at top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2">
        <motion.div
          className="ai-badge text-xs"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Zap className="w-3 h-3" />
          AI ACTIVE
        </motion.div>
      </div>
    </div>
  );
}

export function HeroSection() {
  const typedText = useTypingEffect(TYPING_TEXTS);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 600], [0, 150]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);

  return (
    <section className="relative min-h-screen flex items-center pt-20 pb-12 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-[#00E5FF] opacity-[0.06] blur-[100px] rounded-full" />
        <div className="absolute top-40 right-1/4 w-96 h-96 bg-[#7C3AED] opacity-[0.06] blur-[100px] rounded-full" />
        <div className="absolute bottom-20 left-1/3 w-60 h-60 bg-[#22C55E] opacity-[0.04] blur-[80px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left: Text content */}
          <motion.div style={{ y, opacity }} className="flex flex-col gap-6">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex"
            >
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white/70">
                <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
                <Brain className="w-4 h-4 text-[#00E5FF]" />
                Powered by Gemini AI + YOLOv8 + MediaPipe
              </div>
            </motion.div>

            {/* Headline */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
            >
              <h1 className="font-display text-5xl lg:text-7xl font-black leading-[1.05] tracking-tight">
                <span className="text-white">See Your World</span>
                <br />
                <span className="gradient-text">Through AI</span>
              </h1>
            </motion.div>

            {/* Typing effect */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex items-center gap-3"
            >
              <Eye className="w-5 h-5 text-[#00E5FF] flex-shrink-0" />
              <p className="text-xl text-white/70">
                Instantly analyze{" "}
                <span className="text-[#00E5FF] font-semibold font-mono">
                  {typedText}
                  <span className="animate-pulse">|</span>
                </span>
              </p>
            </motion.div>

            {/* Subtext */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-base text-white/50 leading-relaxed max-w-xl"
            >
              Point your webcam or upload an image. RealityGPT automatically detects what
              it sees and delivers deep, actionable intelligence — from calorie counts
              to room redesign concepts to emotion analysis.
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap gap-4"
            >
              <Link
                href="/camera"
                id="hero-launch-btn"
                className="flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#0070f3] text-[#050816] font-bold text-base transition-all hover:shadow-[0_0_40px_rgba(0,229,255,0.5)] hover:-translate-y-1 active:translate-y-0"
              >
                <Camera className="w-5 h-5" />
                Start Live Analysis
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#demo"
                className="flex items-center gap-2 px-7 py-3.5 rounded-xl border border-white/20 text-white/80 font-semibold text-base transition-all hover:bg-white/5 hover:border-white/30 hover:-translate-y-1"
              >
                <Play className="w-4 h-4" />
                Watch Demo
              </a>
            </motion.div>

            {/* Social proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex items-center gap-6 pt-2"
            >
              <div className="flex -space-x-2">
                {["🧑‍💻", "👩‍🔬", "🧑‍🎨", "👨‍💼"].map((e, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00E5FF]/30 to-[#7C3AED]/30 border-2 border-[#050816] flex items-center justify-center text-sm"
                  >
                    {e}
                  </div>
                ))}
              </div>
              <div className="text-sm text-white/50">
                <span className="text-white font-semibold">2,400+</span> developers already building
              </div>
            </motion.div>
          </motion.div>

          {/* Right: Camera visualization */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex justify-center lg:justify-end"
          >
            <CameraVisualization />
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="flex justify-center mt-16"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="flex flex-col items-center gap-2 text-white/30 text-xs font-mono"
          >
            <span>Scroll to explore</span>
            <div className="w-px h-8 bg-gradient-to-b from-white/30 to-transparent" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
