"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Utensils,
  Home,
  Smile,
  Scan,
  Brain,
  Sparkles,
  TrendingUp,
  Palette,
  Eye,
  Mic,
  FileDown,
  Zap,
} from "lucide-react";

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  badge?: string;
  details: string[];
}

const features: Feature[] = [
  {
    icon: <Utensils className="w-6 h-6" />,
    title: "Food Intelligence",
    description: "Complete nutritional analysis from a single image. Detect calories, macros, health scores, and personalized diet recommendations.",
    color: "#22C55E",
    badge: "Most Popular",
    details: ["Calorie counting", "Macro breakdown", "Health score", "Diet recommendations"],
  },
  {
    icon: <Home className="w-6 h-6" />,
    title: "Interior AI",
    description: "Transform any room with AI-powered design analysis. Get furniture suggestions, space optimization, and style concept redesigns.",
    color: "#00E5FF",
    badge: "New",
    details: ["Room detection", "Style suggestions", "Space optimization", "Cost estimates"],
  },
  {
    icon: <Smile className="w-6 h-6" />,
    title: "Human Analysis",
    description: "Real-time emotion estimation and interview coaching. Score eye contact, confidence, and audience engagement.",
    color: "#7C3AED",
    badge: "Beta",
    details: ["Emotion detection", "Interview mode", "Presentation mode", "Confidence scoring"],
  },
  {
    icon: <Scan className="w-6 h-6" />,
    title: "Real-time Overlay",
    description: "Live bounding boxes, floating data cards, and tracking indicators that stay attached to moving objects.",
    color: "#FF006E",
    details: ["Bounding boxes", "Object tracking", "Confidence scores", "Label overlays"],
  },
  {
    icon: <Mic className="w-6 h-6" />,
    title: "Voice AI Assistant",
    description: 'Ask questions naturally: "What food is this?" or "How can I improve this room?" and get intelligent voice responses.',
    color: "#F59E0B",
    details: ["Voice input", "Voice output", "Natural language", "Context-aware"],
  },
  {
    icon: <FileDown className="w-6 h-6" />,
    title: "Report Generation",
    description: "Generate comprehensive PDF reports for food analyses, room designs, and emotional insights with shareable links.",
    color: "#00E5FF",
    details: ["PDF export", "Print-ready", "Shareable links", "Historical data"],
  },
  {
    icon: <Brain className="w-6 h-6" />,
    title: "Multi-Model AI",
    description: "YOLOv8 for object detection, MediaPipe for face landmarks, and Gemini AI for natural language insights — all working together.",
    color: "#7C3AED",
    details: ["YOLOv8", "MediaPipe", "Gemini Pro", "OpenCV"],
  },
  {
    icon: <TrendingUp className="w-6 h-6" />,
    title: "Analytics Dashboard",
    description: "Track your scan history, usage patterns, food trends, and emotional insights over time with rich charts.",
    color: "#22C55E",
    details: ["Usage charts", "Scan history", "Trends analysis", "Export data"],
  },
];

function FeatureCard({ feature, index }: { feature: Feature; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.08 }}
      className="group relative p-6 glass rounded-2xl hover-card cursor-pointer overflow-hidden"
    >
      {/* Background glow on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
        style={{
          background: `radial-gradient(ellipse at top left, ${feature.color}15 0%, transparent 60%)`,
        }}
      />

      {/* Badge */}
      {feature.badge && (
        <div
          className="absolute top-4 right-4 text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{
            background: `${feature.color}20`,
            color: feature.color,
            border: `1px solid ${feature.color}40`,
          }}
        >
          {feature.badge}
        </div>
      )}

      <div className="relative z-10">
        {/* Icon */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
          style={{
            background: `${feature.color}15`,
            color: feature.color,
            border: `1px solid ${feature.color}30`,
            boxShadow: `0 0 20px ${feature.color}20`,
          }}
        >
          {feature.icon}
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>

        {/* Description */}
        <p className="text-sm text-white/50 leading-relaxed mb-4">{feature.description}</p>

        {/* Details */}
        <div className="flex flex-wrap gap-2">
          {feature.details.map((d) => (
            <span
              key={d}
              className="text-xs px-2 py-1 rounded-lg"
              style={{
                background: `${feature.color}10`,
                color: `${feature.color}cc`,
                border: `1px solid ${feature.color}20`,
              }}
            >
              {d}
            </span>
          ))}
        </div>

        {/* Arrow */}
        <div
          className="mt-4 flex items-center gap-1 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-all group-hover:gap-2"
          style={{ color: feature.color }}
        >
          <span>Learn more</span>
          <Zap className="w-3 h-3" />
        </div>
      </div>
    </motion.div>
  );
}

export function FeaturesSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="features" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16" ref={ref}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            className="inline-flex items-center gap-2 ai-badge mb-4"
          >
            <Sparkles className="w-3 h-3" />
            Platform Capabilities
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="font-display text-4xl lg:text-5xl font-black text-white mb-4"
          >
            Everything You Need to{" "}
            <span className="gradient-text">Understand Reality</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2 }}
            className="text-white/50 text-lg max-w-2xl mx-auto"
          >
            Eight powerful AI modules working in harmony to give you unprecedented
            insight into the physical world around you.
          </motion.p>
        </div>

        {/* Feature grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
