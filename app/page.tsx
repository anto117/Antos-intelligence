"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Wand2, Flame, Layout, Sparkles, Cpu, Settings as SettingsIcon,
  ArrowRight, Zap, Brain, Activity, Star,
} from "lucide-react";

const suites = [
  {
    id: "wand",
    title: "Wand Physics",
    subtitle: "Spatial Rigidbody Engine",
    icon: Wand2,
    color: "#0070F3",
    gradient: "from-blue-500 to-cyan-400",
    glow: "rgba(0,112,243,0.25)",
    bgSoft: "rgba(0, 112, 243, 0.06)",
    borderColor: "rgba(0, 112, 243, 0.2)",
    desc: "Deflect pins, emit sparks, and experience dual-wand lightsaber collisions — powered by Matter.js and MediaPipe.",
    href: "/camera?mode=wand",
    tag: "Matter.js · MediaPipe",
    stat: "60 FPS",
    statLabel: "Real-time",
  },
  {
    id: "food",
    title: "Nutrition AI",
    subtitle: "Food Vision Analyzer",
    icon: Flame,
    color: "#0EA5E9",
    gradient: "from-sky-500 to-blue-400",
    glow: "rgba(14,165,233,0.25)",
    bgSoft: "rgba(14, 165, 233, 0.06)",
    borderColor: "rgba(14, 165, 233, 0.2)",
    desc: "Scan any meal to instantly calculate calories, macronutrients, and get personalized dietary recommendations.",
    href: "/camera?mode=food",
    tag: "TensorFlow MobileNet",
    stat: "50+",
    statLabel: "Food classes",
  },
  {
    id: "room",
    title: "Room Makeover",
    subtitle: "Generative Interior AI",
    icon: Layout,
    color: "#6366F1",
    gradient: "from-indigo-500 to-purple-500",
    glow: "rgba(99,102,241,0.25)",
    bgSoft: "rgba(99, 102, 241, 0.06)",
    borderColor: "rgba(99, 102, 241, 0.2)",
    desc: "Repaint walls, add LED lighting overlays, and place virtual furniture — transform your room in real-time AR.",
    href: "/camera?mode=room",
    tag: "Spatial Geometry API",
    stat: "AR",
    statLabel: "Live overlay",
  },
];

// ── Floating orbs background ─────────────────────────────────────────────────
function FloatingOrbs() {
  const orbs = [
    { size: 560, x: -15, y: -10, color: "#BAE6FD", delay: 0 },
    { size: 480, x: 70, y: 55, color: "#C7D2FE", delay: 2 },
    { size: 380, x: 30, y: 85, color: "#BFDBFE", delay: 4 },
  ];
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {orbs.map((o, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-[110px]"
          style={{
            width: o.size, height: o.size,
            left: `${o.x}%`, top: `${o.y}%`,
            background: `radial-gradient(circle, ${o.color} 0%, transparent 70%)`,
            opacity: 0.45,
          }}
          animate={{ x: [0, 30, -20, 0], y: [0, -25, 15, 0], scale: [1, 1.08, 0.95, 1] }}
          transition={{ duration: 14 + i * 3, delay: o.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

// ── Animated grid ─────────────────────────────────────────────────────────────
function AnimatedGrid() {
  return (
    <motion.div
      className="fixed inset-0 z-0 pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.3 }}
      transition={{ duration: 1.5 }}
      style={{
        backgroundImage: `linear-gradient(#CBD5E1 1px, transparent 1px), linear-gradient(90deg, #CBD5E1 1px, transparent 1px)`,
        backgroundSize: "52px 52px",
      }}
    />
  );
}

// ── Floating stat pill ────────────────────────────────────────────────────────
const STAT_PILLS = [
  { label: "99.2% uptime", icon: "🟢", delay: 0.5 },
  { label: "< 200ms latency", icon: "⚡", delay: 0.9 },
  { label: "Runs in browser", icon: "🌐", delay: 1.3 },
  { label: "No API key needed", icon: "🔒", delay: 1.7 },
];

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="w-10 h-10 rounded-full border-[3px] border-[#0070F3] border-t-transparent animate-spin" />
          <p className="text-slate-500 font-mono text-xs tracking-widest uppercase animate-pulse">Initialising...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen bg-[#F8FAFC] text-[#0F172A] overflow-x-hidden" ref={heroRef}>
      <FloatingOrbs />
      <AnimatedGrid />

      {/* ── NAVBAR ── */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-xl border-b border-slate-200/70 px-4 py-3 sm:px-6 lg:px-10"
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.5 }}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-gradient-to-br from-[#0070F3] to-[#6366F1] shadow-sm"
            >
              <Cpu className="w-4 h-4 text-white" strokeWidth={2.2} />
            </motion.div>
            <div className="leading-none">
              <p className="font-bold text-[15px] tracking-tight text-slate-900">
                Antos <span className="text-[#0070F3]">Intelligence</span>
              </p>
              <p className="text-[8.5px] text-slate-400 font-mono tracking-widest">AI VISION PLATFORM</p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="hidden sm:flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-full"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </motion.div>
            <Link href="/dashboard" className="text-[13px] font-medium text-slate-600 hover:text-[#0070F3] px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-all">Dashboard</Link>
            <Link href="/settings" className="p-2 rounded-lg text-slate-500 hover:text-[#0070F3] hover:bg-slate-100 transition-all">
              <SettingsIcon className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </motion.header>

      {/* ── HERO ── */}
      <section className="relative z-10 pt-20 pb-10 px-4 sm:px-6 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-blue-200 shadow-sm text-[11px] font-mono font-semibold text-[#0070F3] uppercase tracking-wider mb-7"
        >
          <motion.span animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 3, repeat: Infinity }}>
            <Sparkles className="w-3.5 h-3.5" />
          </motion.span>
          Multi-modal spatial engine
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="text-4xl sm:text-5xl lg:text-[62px] font-black tracking-tight leading-[1.06] text-slate-900 max-w-3xl mx-auto"
        >
          Choose Your{" "}
          <span
            className="bg-clip-text text-transparent inline-block"
            style={{
              backgroundImage: "linear-gradient(135deg, #0070F3 0%, #0EA5E9 40%, #6366F1 100%)",
              backgroundSize: "200%",
              animation: "shimmer 4s linear infinite",
            }}
          >
            AI Mode
          </span>
        </motion.h1>

        {/* Sub */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mt-5 text-slate-500 text-base sm:text-lg max-w-xl mx-auto leading-relaxed font-light"
        >
          Real-time camera AI — physics, nutrition, and interior design,{" "}
          <span className="text-slate-700 font-medium">all running live in your browser.</span>
        </motion.p>

        {/* Stat pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap justify-center gap-2 mt-7"
        >
          {STAT_PILLS.map((pill, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: pill.delay }}
              whileHover={{ scale: 1.06, y: -2 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-[11px] text-slate-600 font-medium cursor-default"
            >
              <span>{pill.icon}</span>
              {pill.label}
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── CARDS ── */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 pb-28 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.15, delayChildren: 0.55 } } }}
          className="grid grid-cols-1 md:grid-cols-3 gap-5"
        >
          {suites.map((suite) => {
            const Icon = suite.icon;
            const isHovered = hovered === suite.id;
            return (
              <motion.div
                key={suite.id}
                variants={{ hidden: { opacity: 0, y: 40, scale: 0.95 }, show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55, ease: "easeOut" } } }}
                whileHover={{ y: -8, scale: 1.02 }}
                onHoverStart={() => setHovered(suite.id)}
                onHoverEnd={() => setHovered(null)}
                transition={{ type: "spring", stiffness: 280, damping: 22 }}
                className="group relative bg-white border border-slate-200 rounded-2xl flex flex-col shadow-sm cursor-pointer overflow-hidden"
                style={{ boxShadow: isHovered ? `0 16px 48px ${suite.glow}, 0 2px 8px rgba(0,0,0,0.06)` : "0 2px 8px rgba(0,0,0,0.05)" }}
              >
                {/* Animated gradient top border */}
                <motion.div
                  className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${suite.gradient}`}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: isHovered ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                  style={{ transformOrigin: "left" }}
                />

                {/* Glow overlay */}
                <motion.div
                  className="absolute inset-0 rounded-2xl pointer-events-none"
                  animate={{ opacity: isHovered ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                  style={{ background: `radial-gradient(ellipse at 20% 20%, ${suite.glow}, transparent 60%)` }}
                />

                <div className="relative p-6 flex flex-col flex-1">
                  {/* Top row */}
                  <div className="flex items-start justify-between mb-5">
                    <motion.div
                      animate={{ rotate: isHovered ? [0, -10, 10, 0] : 0, scale: isHovered ? 1.1 : 1 }}
                      transition={{ duration: 0.4 }}
                      className="w-12 h-12 rounded-xl flex items-center justify-center border shadow-sm"
                      style={{ background: suite.bgSoft, borderColor: suite.borderColor, color: suite.color }}
                    >
                      <Icon className="w-5 h-5" />
                    </motion.div>

                    <div className="flex flex-col items-end gap-1.5">
                      <motion.span
                        animate={{ scale: [1, 1.08, 1] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                        className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border"
                        style={{ color: suite.color, borderColor: suite.borderColor, background: suite.bgSoft }}
                      >
                        Live
                      </motion.span>
                      <div className="text-right">
                        <div className="text-base font-black" style={{ color: suite.color }}>{suite.stat}</div>
                        <div className="text-[8px] text-slate-400 font-mono uppercase">{suite.statLabel}</div>
                      </div>
                    </div>
                  </div>

                  {/* Text */}
                  <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">{suite.subtitle}</p>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{suite.title}</h3>
                  <p className="text-[13px] text-slate-500 font-light leading-relaxed flex-1">{suite.desc}</p>

                  {/* Footer */}
                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wide">{suite.tag}</span>
                    <Link
                      href={suite.href}
                      className="inline-flex items-center gap-1 text-xs font-bold px-3.5 py-1.5 rounded-lg transition-all duration-200 text-white shadow-sm"
                      style={{ background: `linear-gradient(135deg, ${suite.color}, ${suite.color}cc)` }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      Launch
                      <motion.span animate={{ x: isHovered ? 3 : 0 }} transition={{ duration: 0.2 }}>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </motion.span>
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom feature strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.5 }}
          className="mt-10 grid grid-cols-3 gap-4"
        >
          {[
            { icon: Brain, label: "On-device AI", desc: "Runs in your browser, no server", color: "#0070F3" },
            { icon: Zap, label: "Instant results", desc: "< 200ms analysis per frame", color: "#0EA5E9" },
            { icon: Activity, label: "Real-time feed", desc: "60 FPS live camera processing", color: "#6366F1" },
          ].map((f, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -3, scale: 1.02 }}
              className="flex flex-col items-center text-center p-4 rounded-xl bg-white border border-slate-100 shadow-sm gap-2"
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${f.color}12`, color: f.color }}>
                <f.icon className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800">{f.label}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{f.desc}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
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
