"use client";

import { useState } from "react";
import { motion as motionFramer, AnimatePresence as AnimatePresenceFramer } from "framer-motion";
import { Eye, Mail, Lock, User, ArrowRight, Globe, Cpu } from "lucide-react";
import Link from "next/link";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      window.location.href = "/dashboard";
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 relative overflow-hidden text-[#0F172A]">
      {/* Background decoration */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none opacity-[0.3]" 
        style={{
          backgroundImage: `linear-gradient(#E2E8F0 1px, transparent 1px), linear-gradient(90deg, #E2E8F0 1px, transparent 1px)`,
          backgroundSize: "48px 48px"
        }}
      />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-[#E0F2FE] opacity-[0.4] blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 justify-center mb-8 group">
          <div className="w-10 h-10 bg-gradient-to-br from-[#0070F3] to-[#0051B3] rounded-xl flex items-center justify-center shadow-md">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-display font-bold text-lg text-slate-900">
              Antos <span className="text-[#0070F3]">Intelligence</span>
            </span>
            <span className="text-[8px] text-slate-400 font-mono tracking-wider mt-0.5">SECURE AUTH</span>
          </div>
        </Link>

        {/* Card */}
        <motionFramer.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-200 p-8 rounded-2xl shadow-md"
        >
          {/* Toggle */}
          <div className="flex p-1 bg-slate-50 border border-slate-200 rounded-xl mb-6">
            {(["login", "signup"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  mode === m
                    ? "bg-[#0070F3] text-white font-bold shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {m === "login" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          <AnimatePresenceFramer mode="wait">
            <motionFramer.form
              key={mode}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleSubmit}
              className="flex flex-col gap-4"
            >
              <div className="text-center mb-1">
                <h1 className="text-lg font-bold text-slate-800">
                  {mode === "login" ? "Welcome Back" : "Create Account"}
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  {mode === "login"
                    ? "Sign in to your Antos Intelligence account"
                    : "Start your browser-based AI vision journey"}
                </p>
              </div>

              {mode === "signup" && (
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Full Name"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-800 placeholder:text-slate-400 text-sm focus:outline-none focus:border-[#0070F3]/50 focus:ring-1 focus:ring-[#0070F3]/30 transition-all"
                  />
                </div>
              )}

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  placeholder="Email address"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-800 placeholder:text-slate-400 text-sm focus:outline-none focus:border-[#0070F3]/50 focus:ring-1 focus:ring-[#0070F3]/30 transition-all"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  placeholder="Password"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-800 placeholder:text-slate-400 text-sm focus:outline-none focus:border-[#0070F3]/50 focus:ring-1 focus:ring-[#0070F3]/30 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#0070F3] hover:bg-[#0051B3] text-white font-bold text-sm shadow-md transition-colors disabled:opacity-75"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    {mode === "login" ? "Sign In" : "Create Account"}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 my-1">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-[10px] font-mono text-slate-400 uppercase">or</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              {/* Google */}
              <button
                type="button"
                className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-650 hover:bg-slate-50 text-sm font-semibold transition-all shadow-sm"
              >
                <Globe className="w-4 h-4 text-slate-500" />
                Continue with Google
              </button>
            </motionFramer.form>
          </AnimatePresenceFramer>
        </motionFramer.div>

        {/* Bottom link */}
        <p className="text-center text-sm text-slate-550 mt-6">
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="text-[#0070F3] hover:underline font-semibold"
          >
            {mode === "login" ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
