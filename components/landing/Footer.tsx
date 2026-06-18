"use client";

import Link from "next/link";
import { Eye, GitBranch, MessageCircle, Share2, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative py-16 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-[#00E5FF] to-[#0070f3] rounded-xl flex items-center justify-center">
                <Eye className="w-4 h-4 text-[#050816]" />
              </div>
              <span className="font-display font-bold text-white">
                Reality<span className="text-[#00E5FF]">GPT</span>
              </span>
            </Link>
            <p className="text-sm text-white/40 leading-relaxed">
              AI-powered vision platform for the real world. Built for developers,
              researchers, and innovators.
            </p>
            <div className="flex gap-3 mt-4">
              {[
                { icon: <GitBranch className="w-4 h-4" />, href: "#" },
                { icon: <MessageCircle className="w-4 h-4" />, href: "#" },
                { icon: <Share2 className="w-4 h-4" />, href: "#" },
                { icon: <Mail className="w-4 h-4" />, href: "#" },
              ].map((s, i) => (
                <a
                  key={i}
                  href={s.href}
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Product */}
          <div>
            <div className="text-sm font-semibold text-white mb-4">Product</div>
            <ul className="flex flex-col gap-2.5">
              {["Features", "How It Works", "Pricing", "Changelog", "Roadmap"].map((l) => (
                <li key={l}>
                  <a href="#" className="text-sm text-white/40 hover:text-white transition-colors">{l}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Platform */}
          <div>
            <div className="text-sm font-semibold text-white mb-4">Platform</div>
            <ul className="flex flex-col gap-2.5">
              {["Camera Analysis", "Dashboard", "Reports", "Analytics", "API Docs"].map((l) => (
                <li key={l}>
                  <Link href="/camera" className="text-sm text-white/40 hover:text-white transition-colors">{l}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <div className="text-sm font-semibold text-white mb-4">Company</div>
            <ul className="flex flex-col gap-2.5">
              {["About", "Blog", "Careers", "Privacy Policy", "Terms of Service"].map((l) => (
                <li key={l}>
                  <a href="#" className="text-sm text-white/40 hover:text-white transition-colors">{l}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/10">
          <p className="text-sm text-white/30">
            © 2025 RealityGPT. Built with ❤️ using Next.js, FastAPI, and Gemini AI.
          </p>
          <div className="flex items-center gap-2 mt-4 md:mt-0">
            <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
            <span className="text-xs text-white/30 font-mono">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
