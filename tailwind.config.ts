import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Light professional colors
        background:    "#FFFFFF",
        "bg-surface":  "#F8FAFC",
        "bg-elevated": "#F1F5F9",

        // Corporate White/Blue Theme Colors
        primary:       "#0070F3", // Premium blue
        "primary-alt": "#0051B3", // Darker blue
        secondary:     "#475569", // Slate/Steel grey
        accent:        "#0EA5E9", // Sky blue
        "accent-soft": "#E0F2FE", // Soft light blue

        // Silver/Steel range
        silver:        "#94A3B8",
        "silver-dim":  "#64748B",
        platinum:      "#0F172A", // Text color

        // Semantic aliases
        "neon-cyan":    "#0070F3",
        "neon-purple":  "#475569",
        "neon-green":   "#0EA5E9",
        "neon-pink":    "#0051B3",

        card:           "#FFFFFF",
        border:         "#E2E8F0",
        "text-muted":   "#64748B",
      },
      fontFamily: {
        sans:    ["Inter", "system-ui", "sans-serif"],
        mono:    ["JetBrains Mono", "monospace"],
        display: ["Outfit", "sans-serif"],
      },
      backgroundImage: {
        "gradient-radial":  "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":   "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "hero-gradient":    "linear-gradient(135deg, #F8FAFC 0%, #FFFFFF 100%)",
        "card-gradient":    "linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)",
        "blue-gradient":    "linear-gradient(135deg, #0070F3, #0EA5E9)",
        "silver-gradient":  "linear-gradient(135deg, #F1F5F9, #E2E8F0)",
        "surface-gradient": "linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)",
      },
      boxShadow: {
        "premium-blue": "0 10px 30px rgba(0, 112, 243, 0.08), 0 1px 3px rgba(0, 0, 0, 0.02)",
        "card-shadow":  "0 4px 20px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.02)",
        "premium":      "0 20px 50px rgba(0, 112, 243, 0.05), 0 1px 1px rgba(0, 0, 0, 0.01)",
      },
      animation: {
        "float":          "float 7s ease-in-out infinite",
        "float-delay":    "float 7s ease-in-out infinite 2s",
        "pulse-glow":     "pulseGlow 2.5s ease-in-out infinite",
        "scan-line":      "scanLine 2.5s linear infinite",
        "particle-rise":  "particleRise 4s ease-out infinite",
        "gradient-shift": "gradientShift 10s ease infinite",
        "rotate-slow":    "rotate 22s linear infinite",
        "blink":          "blink 0.75s step-end infinite",
        "shimmer":        "shimmer 2s linear infinite",
        "fade-up":        "fadeUp 0.6s ease-out forwards",
        "fade-in":        "fadeIn 0.4s ease-out forwards",
        "slide-in-left":  "slideInLeft 0.5s ease-out forwards",
        "slide-in-right": "slideInRight 0.5s ease-out forwards",
        "breathe":        "breathe 4s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":       { transform: "translateY(-10px)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 16px rgba(0,112,243,0.05)" },
          "50%":       { boxShadow: "0 0 32px rgba(0,112,243,0.15)" },
        },
        scanLine: {
          "0%":   { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
        particleRise: {
          "0%":   { transform: "translateY(0)", opacity: "1" },
          "100%": { transform: "translateY(-100px)", opacity: "0" },
        },
        gradientShift: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%":       { backgroundPosition: "100% 50%" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        fadeUp: {
          "0%":   { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideInLeft: {
          "0%":   { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        slideInRight: {
          "0%":   { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        blink: {
          "from, to": { borderColor: "transparent" },
          "50%":       { borderColor: "#0070F3" },
        },
        breathe: {
          "0%, 100%": { opacity: "0.6", transform: "scale(1)" },
          "50%":       { opacity: "1", transform: "scale(1.02)" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
      screens: {
        xs: "375px",
      },
    },
  },
  plugins: [],
};

export default config;
