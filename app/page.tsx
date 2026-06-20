"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Wand2,
  Flame,
  Layout,
  Sparkles,
  Cpu,
  Settings as SettingsIcon,
  ArrowRight,
} from "lucide-react";
import { ParticleField } from "@/components/three/ParticleField";

const suites = [
  {
    id: "wand",
    title: "Wand Physics",
    subtitle: "Spatial Rigidbody Engine",
    icon: Wand2,
    color: "#0070F3",
    glow: "rgba(0,112,243,0.12)",
    bgSoft: "rgba(0, 112, 243, 0.06)",
    borderColor: "rgba(0, 112, 243, 0.2)",
    desc: "Deflect pins, emit sparks, and experience dual-wand lightsaber collisions — powered by Matter.js and MediaPipe.",
    href: "/camera?mode=wand",
    tag: "Matter.js · MediaPipe",
  },
  {
    id: "food",
    title: "Nutrition AI",
    subtitle: "Food Vision Analyzer",
    icon: Flame,
    color: "#0EA5E9",
    glow: "rgba(14,165,233,0.12)",
    bgSoft: "rgba(14, 165, 233, 0.06)",
    borderColor: "rgba(14, 165, 233, 0.2)",
    desc: "Scan any meal to instantly calculate calories, macronutrients, and get personalized dietary recommendations.",
    href: "/camera?mode=food",
    tag: "TensorFlow MobileNet",
  },
  {
    id: "room",
    title: "Room Makeover",
    subtitle: "Generative Interior AI",
    icon: Layout,
    color: "#6366F1",
    glow: "rgba(99,102,241,0.12)",
    bgSoft: "rgba(99, 102, 241, 0.06)",
    borderColor: "rgba(99, 102, 241, 0.2)",
    desc: "Repaint walls, add LED lighting overlays, and place virtual furniture — transform your room in real-time AR.",
    href: "/camera?mode=room",
    tag: "Spatial Geometry API",
  },
];

// Stagger variants
const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.3 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 28, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

const heroVariants = {
  hidden: { opacity: 0, y: 20 },
  show: (d: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: d, ease: "easeOut" as const },
  }),
};

export default function HomePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-[3px] border-[#0070F3] border-t-transparent animate-spin" />
          <p className="text-slate-500 font-mono text-xs tracking-widest uppercase animate-pulse">
            Initialising...
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen bg-[#F8FAFC] text-[#0F172A] overflow-x-hidden">

      {/* ── Ambient blobs ── */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-[0.35] blur-[120px]"
          style={{ background: "radial-gradient(circle, #BAE6FD 0%, transparent 70%)" }}
        />
        <div
          className="absolute top-1/2 -right-60 w-[500px] h-[500px] rounded-full opacity-[0.25] blur-[100px]"
          style={{ background: "radial-gradient(circle, #C7D2FE 0%, transparent 70%)" }}
        />
        <div
          className="absolute -bottom-20 left-1/3 w-[400px] h-[400px] rounded-full opacity-[0.2] blur-[90px]"
          style={{ background: "radial-gradient(circle, #BFDBFE 0%, transparent 70%)" }}
        />
      </div>

      {/* ── Grid pattern ── */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#E2E8F0 1px, transparent 1px), linear-gradient(90deg, #E2E8F0 1px, transparent 1px)`,
          backgroundSize: "56px 56px",
          opacity: 0.35,
        }}
      />

      {/* ── Particles ── */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <ParticleField />
      </div>

      {/* ──────────────────── NAVBAR ──────────────────── */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-xl border-b border-slate-200/70 px-4 py-3 sm:px-6 lg:px-10"
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-gradient-to-br from-[#0070F3] to-[#0051B3] shadow-sm group-hover:shadow-[0_0_16px_rgba(0,112,243,0.4)] transition-shadow duration-300">
              <Cpu className="w-4.5 h-4.5 text-white" strokeWidth={2.2} />
            </div>
            <div className="leading-none">
              <p className="font-bold text-[15px] tracking-tight text-slate-900">
                Antos <span className="text-[#0070F3]">Intelligence</span>
              </p>
              <p className="text-[8.5px] text-slate-400 font-mono tracking-widest">AI VISION PLATFORM</p>
            </div>
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </div>
            <Link
              href="/dashboard"
              className="text-[13px] font-medium text-slate-600 hover:text-[#0070F3] px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-all duration-150"
            >
              Dashboard
            </Link>
            <Link
              href="/settings"
              className="p-2 rounded-lg text-slate-500 hover:text-[#0070F3] hover:bg-slate-100 transition-all duration-150"
            >
              <SettingsIcon className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </motion.header>

      {/* ──────────────────── HERO ──────────────────── */}
      <section className="relative z-10 pt-20 pb-14 px-4 sm:px-6 text-center">
        {/* Badge */}
        <motion.div
          custom={0}
          variants={heroVariants}
          initial="hidden"
          animate="show"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-blue-200 shadow-sm text-[11px] font-mono font-semibold text-[#0070F3] uppercase tracking-wider mb-7"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Multi-modal spatial engine
        </motion.div>

        {/* Headline */}
        <motion.h1
          custom={0.08}
          variants={heroVariants}
          initial="hidden"
          animate="show"
          className="text-4xl sm:text-5xl lg:text-[58px] font-black tracking-tight leading-[1.08] text-slate-900 max-w-3xl mx-auto font-display"
        >
          Choose Your{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage: "linear-gradient(135deg, #0070F3 0%, #0EA5E9 50%, #6366F1 100%)",
              backgroundSize: "200%",
              animation: "shimmer 4s linear infinite",
            }}
          >
            AI Mode
          </span>
        </motion.h1>

        {/* Sub */}
        <motion.p
          custom={0.18}
          variants={heroVariants}
          initial="hidden"
          animate="show"
          className="mt-5 text-slate-500 text-base sm:text-lg max-w-xl mx-auto leading-relaxed font-light"
        >
          Real-time camera AI — physics, nutrition, and interior design, all running live in your browser.
        </motion.p>
      </section>

      {/* ──────────────────── CARDS ──────────────────── */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 pb-28 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-3 gap-5"
        >
          {suites.map((suite) => {
            const Icon = suite.icon;
            return (
              <motion.div
                key={suite.id}
                variants={cardVariants}
                whileHover={{ y: -5, scale: 1.015 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="group relative bg-white border border-slate-200 rounded-2xl p-6 flex flex-col shadow-sm cursor-pointer overflow-hidden"
                style={{
                  boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
                }}
              >
                {/* Hover glow layer */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 rounded-2xl pointer-events-none"
                  style={{ background: `radial-gradient(ellipse at top left, ${suite.glow}, transparent 70%)` }}
                />

                {/* Top row */}
                <div className="flex items-start justify-between mb-5">
                  <motion.div
                    whileHover={{ rotate: [0, -8, 8, 0] }}
                    transition={{ duration: 0.4 }}
                    className="w-11 h-11 rounded-xl flex items-center justify-center border"
                    style={{
                      background: suite.bgSoft,
                      borderColor: suite.borderColor,
                      color: suite.color,
                    }}
                  >
                    <Icon className="w-5 h-5" />
                  </motion.div>

                  <span
                    className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border"
                    style={{ color: suite.color, borderColor: suite.borderColor, background: suite.bgSoft }}
                  >
                    Live
                  </span>
                </div>

                {/* Text */}
                <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">{suite.subtitle}</p>
                <h3
                  className="text-xl font-bold text-slate-900 group-hover:transition-colors duration-200"
                  style={{ color: undefined }}
                >
                  {suite.title}
                </h3>
                <p className="text-[13px] text-slate-500 font-light mt-2 leading-relaxed flex-1">{suite.desc}</p>

                {/* Footer */}
                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[9.5px] font-mono text-slate-400 uppercase tracking-wide">{suite.tag}</span>
                  <Link
                    href={suite.href}
                    className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg transition-all duration-200 text-white"
                    style={{ background: suite.color }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    Launch
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* ──────────────────── FOOTER ──────────────────── */}
      <footer className="relative z-10 bg-white/80 border-t border-slate-200/70 py-5 px-4 sm:px-6 lg:px-10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 text-[11px] text-slate-400 font-mono">
          <span>© {new Date().getFullYear()} Antos Intelligence — All rights reserved.</span>
          <div className="flex gap-5">
            <Link href="/history" className="hover:text-[#0070F3] transition-colors">History</Link>
            <Link href="/reports" className="hover:text-[#0070F3] transition-colors">Reports</Link>
            <Link href="/settings" className="hover:text-[#0070F3] transition-colors">Settings</Link>
          </div>
        </div>
      </footer>

      {/* ── Shimmer keyframe ── */}
      <style>{`
        @keyframes shimmer {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </main>
  );
}
