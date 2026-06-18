"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Check, Zap, Building, Sparkles } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    id: "free",
    name: "Starter",
    price: "Free",
    period: "",
    description: "Perfect for exploring Antos Intelligence capabilities",
    icon: <Sparkles className="w-5 h-5" />,
    color: "#C8A96E",
    features: [
      "50 scans per month",
      "Food analysis",
      "Room detection",
      "Basic emotion analysis",
      "PDF report (5/month)",
      "Dashboard access",
    ],
    cta: "Get Started Free",
    href: "/auth",
    popular: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: "$19",
    period: "/month",
    description: "For professionals and power users",
    icon: <Zap className="w-5 h-5" />,
    color: "#8B9BB4",
    features: [
      "Unlimited scans",
      "All AI analysis modes",
      "Real-time voice assistant",
      "Advanced emotion metrics",
      "Unlimited PDF reports",
      "Priority processing",
      "API access",
      "Analytics dashboard",
    ],
    cta: "Start Pro Trial",
    href: "/auth?plan=pro",
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For teams, studios, and organisations",
    icon: <Building className="w-5 h-5" />,
    color: "#C23B53",
    features: [
      "Everything in Pro",
      "Custom AI model training",
      "White-label solution",
      "SLA guarantee",
      "Dedicated support",
      "Custom integrations",
      "On-premise deployment",
      "Team management",
    ],
    cta: "Contact Sales",
    href: "/contact",
    popular: false,
  },
];

export function PricingSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [annual, setAnnual] = useState(false);

  return (
    <section id="pricing" className="py-24 relative" ref={ref}>
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            className="inline-flex items-center gap-2 ai-badge mb-4"
          >
            Simple Pricing
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="font-display text-4xl lg:text-5xl font-black text-white mb-4"
          >
            Choose Your{" "}
            <span className="gradient-text">Intelligence Level</span>
          </motion.h2>

          {/* Annual toggle */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-3 mt-6"
          >
            <span className={`text-sm ${!annual ? "text-white" : "text-white/50"}`}>Monthly</span>
            <button
              onClick={() => setAnnual(!annual)}
              className={`w-12 h-6 rounded-full relative transition-colors ${annual ? "bg-[#C8A96E]" : "bg-white/20"}`}
              aria-label="Toggle annual billing"
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${annual ? "left-7" : "left-1"}`}
              />
            </button>
            <span className={`text-sm ${annual ? "text-white" : "text-white/50"}`}>
              Annual <span className="text-[#C8A96E] text-xs font-bold ml-1">Save 20%</span>
            </span>
          </motion.div>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 + i * 0.15 }}
              className={`relative p-8 rounded-3xl hover-card ${
                plan.popular
                  ? "border-2 scale-[1.02]"
                  : "glass"
              }`}
              style={
                plan.popular
                  ? {
                      background: "rgba(139,155,180,0.06)",
                      borderColor: plan.color,
                      boxShadow: `0 0 60px ${plan.color}18`,
                    }
                  : {}
              }
            >
              {/* Popular badge */}
              {plan.popular && (
                <div
                  className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-black"
                  style={{ background: plan.color, color: "#050816" }}
                >
                  ⚡ MOST POPULAR
                </div>
              )}

              {/* Icon + name */}
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    background: `${plan.color}15`,
                    color: plan.color,
                    border: `1px solid ${plan.color}30`,
                  }}
                >
                  {plan.icon}
                </div>
                <div>
                  <div className="font-bold text-white">{plan.name}</div>
                  <div className="text-xs text-white/40">{plan.description}</div>
                </div>
              </div>

              {/* Price */}
              <div className="mb-8">
                <div className="flex items-end gap-1">
                  <span className="text-5xl font-black" style={{ color: plan.color }}>
                    {plan.price === "$19" && annual ? "$15" : plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-white/40 text-sm mb-2">{plan.period}</span>
                  )}
                </div>
              </div>

              {/* Features */}
              <ul className="flex flex-col gap-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-white/70">
                    <Check className="w-4 h-4 flex-shrink-0" style={{ color: plan.color }} />
                    {f}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href={plan.href}
                className="block w-full py-3 rounded-xl text-center font-bold text-sm transition-all hover:-translate-y-1"
                style={
                  plan.popular
                    ? {
                        background: `linear-gradient(135deg, ${plan.color}, #B8955A)`,
                        color: "#0A0C10",
                        boxShadow: `0 0 20px ${plan.color}40`,
                      }
                    : {
                        background: `${plan.color}10`,
                        color: plan.color,
                        border: `1px solid ${plan.color}30`,
                      }
                }
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
