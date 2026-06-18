"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Info, ImagePlus, RotateCcw } from "lucide-react";
import type { MakeoverResult } from "@/hooks/useRoomMakeover";
import { useWallSegmentation } from "@/hooks/useWallSegmentation";
import { useCurtainAsset } from "@/hooks/useCurtainAsset";

// ── Inline SVG icons for each pin type (no external files, always transparent) ──
const SVG_LIGHT = (
  <svg viewBox="0 0 64 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <line x1="32" y1="0" x2="32" y2="14" stroke="#ccc" strokeWidth="3" strokeLinecap="round"/>
    <ellipse cx="32" cy="36" rx="18" ry="20" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="2"/>
    <ellipse cx="32" cy="36" rx="11" ry="13" fill="#FDE68A" opacity="0.8"/>
    <path d="M24 52 Q32 58 40 52" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" fill="none"/>
    <path d="M26 56 Q32 60 38 56" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    <ellipse cx="32" cy="26" rx="5" ry="7" fill="#FFFBEB" opacity="0.6"/>
    {/* glow rays */}
    {[0,45,90,135,180,225,270,315].map((deg,i) => {
      const rad = (deg * Math.PI) / 180;
      const x1 = 32 + Math.cos(rad) * 20, y1 = 36 + Math.sin(rad) * 22;
      const x2 = 32 + Math.cos(rad) * 26, y2 = 36 + Math.sin(rad) * 28;
      return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#FCD34D" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>;
    })}
  </svg>
);

const SVG_FLOOR_LAMP = (
  <svg viewBox="0 0 60 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="30" cy="112" rx="18" ry="6" fill="#1a1a2e" opacity="0.5"/>
    <rect x="27" y="60" width="6" height="52" rx="3" fill="#C0A060"/>
    <path d="M30 60 Q15 40 10 20" stroke="#C0A060" strokeWidth="5" strokeLinecap="round" fill="none"/>
    <ellipse cx="10" cy="18" rx="14" ry="10" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="1.5"/>
    <ellipse cx="10" cy="18" rx="9" ry="6" fill="#FDE68A"/>
    <path d="M4 24 Q10 30 16 24" stroke="#D97706" strokeWidth="2" strokeLinecap="round" fill="none"/>
    <ellipse cx="30" cy="112" rx="14" ry="4" fill="#A0844A" stroke="#C0A060" strokeWidth="1"/>
  </svg>
);

const SVG_LED_STRIP = (
  <svg viewBox="0 0 120 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="10" width="112" height="12" rx="6" fill="#1C1C2E" stroke="#F59E0B" strokeWidth="1"/>
    {[12,28,44,60,76,92,108].map((x,i) => (
      <g key={i}>
        <circle cx={x} cy="16" r="4" fill="#FDE68A"/>
        <circle cx={x} cy="16" r="2" fill="#FFFBEB"/>
        <ellipse cx={x} cy="16" rx="8" ry="10" fill="#FCD34D" opacity="0.15"/>
      </g>
    ))}
    <rect x="4" y="10" width="112" height="5" rx="3" fill="#FEF3C7" opacity="0.08"/>
  </svg>
);

const SVG_CURTAIN = (
  <svg viewBox="0 0 100 160" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="4" width="96" height="6" rx="3" fill="#8B6050"/>
    {[8,20,32,44].map((_,i) => <circle key={i} cx={14+i*24} cy="7" r="4" fill="#C0A060" stroke="#8B6050" strokeWidth="1"/>)}
    {/* left panel */}
    <path d="M2 10 C8 40 4 80 2 160 L40 160 C38 80 44 40 38 10 Z" fill="#7D6B5E" opacity="0.92"/>
    <path d="M6 10 C12 45 8 85 6 160" stroke="#5C4A3E" strokeWidth="1" opacity="0.4"/>
    <path d="M18 10 C24 48 20 88 18 160" stroke="#5C4A3E" strokeWidth="1" opacity="0.3"/>
    <path d="M30 10 C36 45 32 85 30 160" stroke="#5C4A3E" strokeWidth="1" opacity="0.4"/>
    {/* right panel */}
    <path d="M98 10 C92 40 96 80 98 160 L60 160 C62 80 56 40 62 10 Z" fill="#7D6B5E" opacity="0.92"/>
    <path d="M94 10 C88 45 92 85 94 160" stroke="#5C4A3E" strokeWidth="1" opacity="0.4"/>
    <path d="M82 10 C76 48 80 88 82 160" stroke="#5C4A3E" strokeWidth="1" opacity="0.3"/>
    <path d="M70 10 C64 45 68 85 70 160" stroke="#5C4A3E" strokeWidth="1" opacity="0.4"/>
    {/* sheen */}
    <path d="M2 10 C8 40 4 80 2 160 L40 160 C38 80 44 40 38 10 Z" fill="url(#cs)" opacity="0.15"/>
    <defs><linearGradient id="cs" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="white" stopOpacity="0.6"/><stop offset="100%" stopColor="white" stopOpacity="0"/></linearGradient></defs>
  </svg>
);

const SVG_BED = (
  <svg viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="8" y="44" width="104" height="28" rx="6" fill="#1E3A5F" stroke="#3B82F6" strokeWidth="1.5"/>
    <rect x="8" y="30" width="104" height="18" rx="4" fill="#2563EB" opacity="0.7"/>
    <rect x="10" y="48" width="100" height="18" rx="4" fill="#DBEAFE" opacity="0.9"/>
    <rect x="14" y="32" width="38" height="14" rx="6" fill="#EFF6FF"/>
    <rect x="68" y="32" width="38" height="14" rx="6" fill="#EFF6FF"/>
    <rect x="10" y="68" width="100" height="4" rx="2" fill="#1D4ED8" opacity="0.5"/>
    <rect x="8" y="56" width="5" height="16" rx="2" fill="#1E3A5F"/>
    <rect x="107" y="56" width="5" height="16" rx="2" fill="#1E3A5F"/>
  </svg>
);

const SVG_MIRROR = (
  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Glowing purple Hexagon light panel */}
    <polygon points="40,10 70,27 70,62 40,79 10,62 10,27" fill="none" stroke="#C084FC" strokeWidth="5" strokeLinejoin="round"/>
    <polygon points="40,15 65,30 65,59 40,74 15,59 15,30" fill="none" stroke="#A855F7" strokeWidth="2.5" strokeLinejoin="round" opacity="0.8"/>
    <polygon points="40,20 60,32 60,57 40,69 20,57 20,32" fill="#E9D5FF" opacity="0.25"/>
    <circle cx="40" cy="45" r="8" fill="#ffffff" opacity="0.75"/>
  </svg>
);

const SVG_ICONS: Record<string, React.ReactNode> = {
  light:   SVG_LIGHT,
  curtain: SVG_CURTAIN,
  bed:     SVG_BED,
  accent:  SVG_MIRROR,
};

function pickSvgIcon(type: string, lightType?: string): React.ReactNode {
  if (type === "light" && lightType) {
    const t = lightType.toLowerCase();
    if (t.includes("strip") || t.includes("led") || t.includes("under")) return SVG_LED_STRIP;
    if (t.includes("floor") || t.includes("arc") || t.includes("lamp")) return SVG_FLOOR_LAMP;
  }
  return SVG_ICONS[type] ?? SVG_LIGHT;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function hexToRgb(hex: string) {
  const c = hex.replace("#", "");
  return { r: parseInt(c.slice(0,2),16), g: parseInt(c.slice(2,4),16), b: parseInt(c.slice(4,6),16) };
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. SEGMENTED WALL COLOUR CANVAS
//    Reads the live mediapipe mask and paints ONLY wall pixels with the chosen
//    colour.  Person, furniture, and the curtain overlay are left untouched.
// ─────────────────────────────────────────────────────────────────────────────
function WallColorCanvas({
  videoRef, color, opacity, width, height,
  curtainBbox,          // {x,y,w,h} in px – exclude curtain overlay region
}: {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  color: string; opacity: number; width: number; height: number;
  curtainBbox: { x: number; y: number; w: number; h: number } | null;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { maskRef, status } = useWallSegmentation({ videoRef, width, height, enabled: opacity > 0 });
  const { r, g, b } = hexToRgb(color);

  useEffect(() => {
    let raf = 0;
    function paint() {
      const canvas = canvasRef.current;
      if (!canvas || !width || !height) { raf = requestAnimationFrame(paint); return; }
      if (canvas.width !== width)  canvas.width  = width;
      if (canvas.height !== height) canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) { raf = requestAnimationFrame(paint); return; }
      ctx.clearRect(0, 0, width, height);

      const mask = maskRef.current;

      if (!mask || status !== "running") {
        // Segmentation loading → subtle fallback (avoid ugly full-screen tint)
        if (opacity > 0) {
          ctx.fillStyle = `rgba(${r},${g},${b},${opacity * 0.25})`;
          ctx.fillRect(0, 0, width, height);
          // Exclude curtain region from fallback tint too
          if (curtainBbox) {
            ctx.clearRect(curtainBbox.x, curtainBbox.y, curtainBbox.w, curtainBbox.h);
          }
        }
      } else {
        // Pixel-accurate mask pass
        const imgData = ctx.createImageData(width, height);
        const px = imgData.data;
        // Mask dimensions: mask is from a 256×144 offscreen canvas, bilinear-interpolate
        const mW = 256;
        const mH = 144;
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            // Skip curtain overlay region — those pixels belong to the asset layer
            if (curtainBbox &&
                x >= curtainBbox.x && x < curtainBbox.x + curtainBbox.w &&
                y >= curtainBbox.y && y < curtainBbox.y + curtainBbox.h) continue;

            const mx = Math.min(Math.floor((x / width)  * mW), mW - 1);
            const my = Math.min(Math.floor((y / height) * mH), mH - 1);
            const wallConf = mask[my * mW + mx] ?? 0; // 1=wall, 0=person
            if (wallConf > 0.55) {
              const idx = (y * width + x) * 4;
              px[idx]     = r;
              px[idx + 1] = g;
              px[idx + 2] = b;
              // Soft edge: alpha ramps from threshold to 1
              const edge = Math.min((wallConf - 0.55) / 0.3, 1);
              px[idx + 3] = Math.round(edge * wallConf * opacity * 210);
            }
          }
        }
        ctx.putImageData(imgData, 0, 0);
      }
      raf = requestAnimationFrame(paint);
    }
    raf = requestAnimationFrame(paint);
    return () => cancelAnimationFrame(raf);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [color, opacity, width, height, status, r, g, b, curtainBbox]);

  return (
    <canvas ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 10, mixBlendMode: "color" }}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. CURTAIN IMAGE OVERLAY
//    Injects the curtain PNG precisely over the detected window/curtain area.
//    The image is drawn ABOVE the wall-colour canvas so the mask skips it.
// ─────────────────────────────────────────────────────────────────────────────
function CurtainImageOverlay({
  curtainUrl, x_pct, y_pct, width, height, onBboxChange,
}: {
  curtainUrl: string;
  x_pct: number; y_pct: number;
  width: number; height: number;
  onBboxChange: (bbox: { x: number; y: number; w: number; h: number }) => void;
}) {
  // The curtain image covers ~30% viewport width, centred on the pin
  const imgW = Math.round(width * 0.28);
  const imgH = Math.round(imgW * 2.2);          // curtains are tall
  const left = Math.round((x_pct / 100) * width - imgW / 2);
  const top  = Math.round(((y_pct - 25) / 100) * height);  // start above the pin

  // Report bbox to wall-colour canvas so it can be excluded
  useEffect(() => {
    onBboxChange({ x: left, y: top, w: imgW, h: imgH });
  }, [left, top, imgW, imgH, onBboxChange]);

  return (
    <div className="absolute pointer-events-none"
      style={{ left, top, width: imgW, height: imgH, zIndex: 12 }}>
      <motion.img
        src={curtainUrl}
        alt="Curtain overlay"
        initial={{ opacity: 0, scaleY: 0.85 }}
        animate={{ opacity: 1, scaleY: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{
          width: "100%", height: "100%", objectFit: "contain",
          filter: "drop-shadow(-10px 0 24px rgba(0,0,0,0.6)) drop-shadow(10px 0 24px rgba(0,0,0,0.6)) drop-shadow(0 8px 20px rgba(0,0,0,0.4))",
        }}
        draggable={false}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. LIGHTING GLOW CANVAS
// ─────────────────────────────────────────────────────────────────────────────
function LightGlow({ lights, width, height }: {
  lights: { x_pct: number; y_pct: number }[];
  width: number; height: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !width || !height) return;
    canvas.width = width; canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    lights.forEach(({ x_pct, y_pct }) => {
      const cx = (x_pct / 100) * width;
      const cy = (y_pct / 100) * height;
      const rad = Math.min(width, height) * 0.36;
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
      grad.addColorStop(0,    "rgba(255,210,90,0.42)");
      grad.addColorStop(0.25, "rgba(255,170,45,0.22)");
      grad.addColorStop(0.6,  "rgba(255,130,10,0.07)");
      grad.addColorStop(1,    "rgba(255,100,0,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    });
  }, [lights, width, height]);
  return (
    <canvas ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 11, mixBlendMode: "screen" }}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. AR DESIGN CARDS  (inline SVG — no external files, always transparent)
// ─────────────────────────────────────────────────────────────────────────────
const PIN_COLORS = {
  light:   "#F59E0B",
  curtain: "#8B6F5E",
  bed:     "#3B82F6",
  accent:  "#A855F7",
} as const;
type PinType = "light" | "curtain" | "bed" | "accent";

interface Pin {
  id: string; type: PinType; label: string;
  x_pct: number; y_pct: number;
  lightType?: string;   // for selecting right light SVG
  details: Record<string, string>;
  imgSrc?: string;
}

// Floating AR design card with inline SVG illustration
function ARDesignCard({ pin, viewportWidth, viewportHeight }: {
  pin: Pin; viewportWidth: number; viewportHeight: number;
}) {
  const color = PIN_COLORS[pin.type];
  const cardW = Math.round(Math.min(viewportWidth * 0.13, 110));
  const aspect = pin.type === "bed" ? 0.75 : pin.type === "curtain" ? 1.7 : pin.type === "accent" ? 1.3 : 1.2;
  const cardH = Math.round(cardW * aspect);
  const left  = Math.round((pin.x_pct / 100) * viewportWidth  - cardW / 2);
  const top   = Math.round((pin.y_pct / 100) * viewportHeight - cardH * 0.75);
  const icon  = pickSvgIcon(pin.type, pin.lightType);

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ left, top, width: cardW, height: cardH, zIndex: 14 }}
      initial={{ opacity: 0, scale: 0.6, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.6 }}
      transition={{ duration: 0.45, ease: [0.34, 1.26, 0.64, 1] }}
    >
      {/* Glassmorphic card */}
      <div style={{
        width: "100%", height: "100%",
        borderRadius: 14,
        background: "rgba(5,8,22,0.55)",
        backdropFilter: "blur(12px)",
        border: `1.5px solid ${color}55`,
        boxShadow: `0 0 24px ${color}30, 0 8px 24px rgba(0,0,0,0.5)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "6px 4px 4px",
        gap: 3,
        overflow: "hidden",
      }}>
        {/* corner accent */}
        <div style={{
          position: "absolute", top: 0, right: 0,
          width: 28, height: 28,
          background: `${color}22`,
          borderBottomLeftRadius: 12,
          borderTopRightRadius: 13,
        }}/>
        <div style={{
          position: "absolute", top: 4, right: 4,
          width: 6, height: 6, borderRadius: "50%",
          background: color, boxShadow: `0 0 6px ${color}`,
        }}/>
        {/* SVG illustration */}
        <div style={{ flex: 1, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: "2px 6px" }}>
          {icon}
        </div>
        {/* label strip */}
        <div style={{
          width: "100%",
          background: `${color}22`,
          borderTop: `1px solid ${color}30`,
          padding: "2px 4px",
          textAlign: "center",
          fontSize: 8,
          fontWeight: 700,
          color,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}>
          {pin.label.slice(0, 16)}
        </div>
      </div>
    </motion.div>
  );
}

function DesignPin({ pin }: { pin: Pin }) {
  const [open, setOpen] = useState(false);
  const color = PIN_COLORS[pin.type];
  const toRight  = pin.x_pct <= 60;
  const toBottom = pin.y_pct <= 65;
  const hasPng = !!pin.imgSrc;

  return (
    <div className="absolute" style={{
      left: `${pin.x_pct}%`, top: `${pin.y_pct}%`,
      transform: "translate(-50%,-50%)", zIndex: 30,
    }}>
      {/* Ripple */}
      <motion.div className="absolute rounded-full border-2 pointer-events-none"
        style={{ inset: 0, borderColor: color }}
        animate={{ scale: [1, 2.6], opacity: [0.55, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }} />

      {/* Pin button — inline SVG icon */}
      <motion.button id={`pin-${pin.id}`} onClick={() => setOpen(p => !p)}
        whileHover={{ scale: 1.18 }} whileTap={{ scale: 0.9 }}
        className="relative w-11 h-11 rounded-full flex items-center justify-center border-2 cursor-pointer"
        style={{
          background: `linear-gradient(135deg,${color}dd,${color}88)`,
          borderColor: color,
          boxShadow: `0 0 20px ${color}66, 0 4px 14px rgba(0,0,0,0.7)`,
          backdropFilter: "blur(6px)",
        }}>
        <div style={{ width: 22, height: 22 }}>
          {pickSvgIcon(pin.type, pin.lightType)}
        </div>
      </motion.button>

      {/* Pill label */}
      <div className="absolute top-full mt-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded text-[10px] font-bold pointer-events-none"
        style={{ background: `${color}dd`, color: "#050816" }}>
        {pin.label.length > 22 ? pin.label.slice(0,22)+"…" : pin.label}
      </div>

      {/* Detail popup */}
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, scale: 0.88, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 6 }}
            transition={{ type: "spring", stiffness: 340, damping: 28 }}
            className="absolute w-64 rounded-2xl shadow-2xl pointer-events-auto"
            style={{
              zIndex: 50,
              left:   toRight  ? "calc(100% + 12px)" : "auto",
              right:  toRight  ? "auto" : "calc(100% + 12px)",
              top:    toBottom ? "0" : "auto",
              bottom: toBottom ? "auto" : "0",
              background: "rgba(5,8,22,0.97)",
              backdropFilter: "blur(24px)",
              border: `1px solid ${color}45`,
              boxShadow: `0 0 36px ${color}18, 0 8px 32px rgba(0,0,0,0.8)`,
              overflow: "hidden",
            }}>
            {/* PNG preview banner */}
            {hasPng && (
              <div className="h-28 relative overflow-hidden" style={{ background: "rgba(0,0,0,0.4)" }}>
                <img src={pin.imgSrc} alt={pin.label}
                  style={{ width: "100%", height: "100%", objectFit: "contain",
                    filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.5))" }}
                  draggable={false} />
                <div className="absolute inset-0" style={{
                  background: `linear-gradient(to bottom, transparent 50%, rgba(5,8,22,0.9))` }} />
              </div>
            )}
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black uppercase tracking-wider" style={{ color }}>
                  {pin.label}
                </span>
                <button id={`close-pin-${pin.id}`} onClick={() => setOpen(false)}
                  className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20">
                  <X className="w-3 h-3 text-white/60" />
                </button>
              </div>
              <div className="space-y-2">
                {Object.entries(pin.details).map(([k, v]) => (
                  <div key={k} className="rounded-xl p-2.5"
                    style={{ background: `${color}08`, border: `1px solid ${color}15` }}>
                    <div className="text-[9px] text-white/35 font-mono uppercase tracking-wider mb-0.5">{k}</div>
                    <div className="text-xs text-white/85 font-medium leading-snug">{v}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Build pin list
function buildPins(result: MakeoverResult, curtainUrl: string): Pin[] {
  const pins: Pin[] = [];
  result.lighting.forEach((l, i) => {
    let imgSrc = "/assets/pin_light_bulb.png";
    const t = l.type.toLowerCase();
    if (t.includes("strip") || t.includes("led") || t.includes("under")) {
      imgSrc = "/assets/pin_led_strip.png";
    } else if (t.includes("floor") || t.includes("arc") || t.includes("lamp")) {
      imgSrc = "/assets/pin_floor_lamp.png";
    }
    pins.push({
      id: l.id ?? `light-${i}`, type: "light",
      label: l.type, lightType: l.type,
      x_pct: l.x_pct, y_pct: l.y_pct,
      details: { Type: l.type, Placement: l.placement, "Color Temp": l.color_temp, Why: l.why },
      imgSrc,
    });
  });

  if (result.bed_arrangement && result.bed_arrangement.x_pct > 0 && result.bed_arrangement.y_pct > 0) {
    pins.push({
      id: "bed", type: "bed", label: "Bed Repositioning",
      x_pct: result.bed_arrangement.x_pct, y_pct: result.bed_arrangement.y_pct,
      details: { Suggestion: result.bed_arrangement.suggestion, Why: result.bed_arrangement.why },
      imgSrc: "/assets/pin_bed.png",
    });
  }
  if (result.accent_piece && result.accent_piece.x_pct > 0 && result.accent_piece.y_pct > 0) {
    const isMirror = result.accent_piece.name.toLowerCase().includes("mirror");
    if (!isMirror) {
      pins.push({
        id: "accent", type: "accent", label: result.accent_piece.name,
        x_pct: result.accent_piece.x_pct, y_pct: result.accent_piece.y_pct,
        details: { Piece: result.accent_piece.name, Placement: result.accent_piece.placement, Why: result.accent_piece.why },
        imgSrc: "/assets/pin_wall_mirror.png",
      });
    }
  }
  return pins;
}


// ─────────────────────────────────────────────────────────────────────────────
// 5. UPLOAD CURTAIN STYLE BUTTON
// ─────────────────────────────────────────────────────────────────────────────
function CurtainUploadButton({
  onUpload, onReset, uploading,
}: {
  onUpload: (f: File) => void;
  onReset: () => void;
  uploading: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="flex items-center gap-2">
      <input ref={inputRef} type="file" accept="image/*" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) onUpload(f); e.target.value = ""; }} />
      <motion.button
        id="upload-curtain-btn"
        whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all"
        style={{ background: "rgba(139,92,246,0.18)", color: "#A855F7",
          border: "1px solid rgba(139,92,246,0.4)" }}>
        <ImagePlus className="w-3.5 h-3.5" />
        {uploading ? "Uploading…" : "Upload Curtain Style"}
      </motion.button>
      <button id="reset-curtain-btn" onClick={onReset} title="Reset to default"
        className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
        style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
        <RotateCcw className="w-3.5 h-3.5 text-white/40" />
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. VIBE SUMMARY STRIP
// ─────────────────────────────────────────────────────────────────────────────
function VibeSummary({ result, onClose }: { result: MakeoverResult; onClose: () => void }) {
  return (
    <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }} transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className="absolute bottom-0 inset-x-0 p-4" style={{ zIndex: 40 }}>
      <div className="rounded-2xl p-4 flex gap-4 items-start"
        style={{ background: "rgba(5,8,22,0.93)", backdropFilter: "blur(24px)",
          border: "1px solid rgba(139,92,246,0.3)", boxShadow: "0 -8px 40px rgba(139,92,246,0.12)" }}>
        <div className="flex-shrink-0 flex flex-col items-center gap-1.5">
          <div className="w-12 h-12 rounded-xl border-2 border-white/20 shadow-lg"
            style={{ background: result.wall_color }} title={result.wall_color_name} />
          <span className="text-[9px] text-white/40 font-mono text-center leading-tight">
            {result.wall_color_name}<br />{result.wall_color}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-xs font-black text-white/80 uppercase tracking-wider">AI Design Vision</span>
            <span className="ml-auto text-[9px] font-mono px-2 py-0.5 rounded-full"
              style={{ background: "rgba(139,92,246,0.15)", color: "#A855F7", border: "1px solid rgba(139,92,246,0.3)" }}>
              {result.room_style}
            </span>
          </div>
          <p className="text-xs text-white/60 leading-relaxed line-clamp-2">{result.overall_vibe}</p>
        </div>
        <button id="close-makeover-summary" onClick={onClose}
          className="flex-shrink-0 w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-red-500/20 hover:text-red-400 transition-colors text-white/50">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────────────────────
interface RoomMakeoverOverlayProps {
  result: MakeoverResult;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  viewportWidth: number;
  viewportHeight: number;
  onClose: () => void;
}

export default function RoomMakeoverOverlay({
  result, videoRef, viewportWidth, viewportHeight, onClose,
}: RoomMakeoverOverlayProps) {
  const [wallOpacity, setWallOpacity] = useState(0.55);
  const [showSummary, setShowSummary] = useState(true);
  // Track curtain image bounding box so the wall mask skips it
  const [curtainBbox, setCurtainBbox] = useState<{ x:number; y:number; w:number; h:number } | null>(null);

  const { curtainUrl, uploadCurtain, resetCurtain, uploading } = useCurtainAsset();
  const pins = buildPins(result, curtainUrl);
  const lightPositions = result.lighting.map(l => ({ x_pct: l.x_pct, y_pct: l.y_pct }));

  const handleBboxChange = useCallback(
    (bbox: { x:number; y:number; w:number; h:number }) => setCurtainBbox(bbox),
    []
  );

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 20 }}>

      {/* Layer 1 — Segmented wall colour (skips person + curtain region) */}
      <WallColorCanvas
        videoRef={videoRef}
        color={result.wall_color}
        opacity={wallOpacity}
        width={viewportWidth}
        height={viewportHeight}
        curtainBbox={curtainBbox}
      />

      {/* Layer 2 — Warm light glow */}
      <LightGlow lights={lightPositions} width={viewportWidth} height={viewportHeight} />



      {/* Layer 3b — AR design cards (inline SVG, always transparent) */}
      {viewportWidth > 0 && (
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 14 }}>
          {pins.map(p => (
            <ARDesignCard
              key={`card-${p.id}`}
              pin={p}
              viewportWidth={viewportWidth}
              viewportHeight={viewportHeight}
            />
          ))}
        </div>
      )}

      {/* Layer 4 — Interactive design pins (clickable dots above images) */}
      <div className="absolute inset-0 pointer-events-auto" style={{ zIndex: 30 }}>
        {pins.map(pin => <DesignPin key={pin.id} pin={pin} />)}
      </div>

      {/* Layer 5 — Controls HUD (top-left) */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-auto" style={{ zIndex: 40 }}>
        {/* Wall paint slider */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
          style={{ background: "rgba(5,8,22,0.88)", backdropFilter: "blur(16px)",
            border: "1px solid rgba(255,255,255,0.1)" }}>
          <Info className="w-3.5 h-3.5 text-white/40 flex-shrink-0" />
          <span className="text-[10px] text-white/50 font-mono whitespace-nowrap">Wall paint only</span>
          <input id="wall-opacity-slider" type="range" min={0} max={100}
            value={Math.round(wallOpacity * 100)}
            onChange={e => setWallOpacity(Number(e.target.value) / 100)}
            className="w-24 accent-purple-500 cursor-pointer" />
          <span className="text-[10px] font-mono text-purple-400 w-8 text-right">
            {Math.round(wallOpacity * 100)}%
          </span>
        </div>
      </div>

      {/* Layer 5 — Pin count badge (top-right) */}
      <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold pointer-events-none"
        style={{ zIndex: 40, background: "rgba(5,8,22,0.88)", backdropFilter: "blur(12px)",
          border: "1px solid rgba(139,92,246,0.3)", color: "#A855F7" }}>
        <Sparkles className="w-3 h-3" />{pins.length} design pins
      </div>

      {/* Layer 6 — Vibe summary */}
      <AnimatePresence>
        {showSummary && (
          <div className="pointer-events-auto">
            <VibeSummary result={result} onClose={() => setShowSummary(false)} />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
