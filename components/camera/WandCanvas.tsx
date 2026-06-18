"use client";

import { useRef, useEffect, useCallback } from "react";

interface Wand {
  tip: { x: number; y: number };
  base: { x: number; y: number };
}

interface WandCanvasProps {
  wands?: Wand[];
  /** Stick endpoints (null if no hand detected) */
  stickTip: { x: number; y: number } | null;
  stickBase: { x: number; y: number } | null;
  /** Physics ragdoll pin positions */
  ragdollPositions: Record<string, { x: number; y: number; angle: number }>;
  /** Original pin data (for rendering icons in ragdoll state) */
  pins: Array<{
    id: string;
    x_pct: number;
    y_pct: number;
    label: string;
    color: string;
  }>;
  viewportWidth: number;
  viewportHeight: number;
  /** Toggle: curtain swaying when hit */
  curtainRef?: React.RefObject<HTMLElement | null>;
}

// ── Neon lightsaber palettes ───────────────────────────────────────────────────
const WAND_COLORS = {
  core:    "#ffffff",
  glow1:   "#00E5FF", // Cyan
  glow2:   "#7C3AED", // Violet
  tip:     "#FBBF24", // Yellow/Amber
  sparks:  ["#FF6B6B", "#FBBF24", "#00E5FF", "#A855F7", "#34D399"],
};

const WAND_2_COLORS = {
  core:    "#ffffff",
  glow1:   "#EC4899", // Neon pink/magenta
  glow2:   "#EF4444", // Neon red/rose
  tip:     "#10B981", // Emerald tip
  sparks:  ["#EC4899", "#EF4444", "#3B82F6", "#FBBF24", "#10B981"],
};

// ── Spark particle system ────────────────────────────────────────────────────
interface Spark {
  x: number; y: number;
  vx: number; vy: number;
  life: number;          // 0 → 1
  color: string;
  size: number;
}

const sparks: Spark[] = [];

function emitSparks(x: number, y: number, count = 5, customSparksList?: string[]) {
  const list = customSparksList || WAND_COLORS.sparks;
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 6;
    sparks.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2,
      life: 1,
      color: list[Math.floor(Math.random() * list.length)],
      size: 2 + Math.random() * 3,
    });
  }
}

function tickSparks(ctx: CanvasRenderingContext2D) {
  for (let i = sparks.length - 1; i >= 0; i--) {
    const s = sparks[i];
    s.x += s.vx;
    s.y += s.vy;
    s.vy += 0.22; // gravity
    s.life -= 0.035;
    if (s.life <= 0) { sparks.splice(i, 1); continue; }

    ctx.save();
    ctx.globalAlpha = s.life;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size * s.life, 0, Math.PI * 2);
    ctx.fillStyle = s.color;
    ctx.shadowColor = s.color;
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.restore();
  }
}

// ── Clash shockwave ring system ──────────────────────────────────────────────
interface ClashRing {
  x: number;
  y: number;
  radius: number;
  opacity: number;
}

const clashRings: ClashRing[] = [];

function tickClashRings(ctx: CanvasRenderingContext2D) {
  for (let i = clashRings.length - 1; i >= 0; i--) {
    const ring = clashRings[i];
    ring.radius += 3.5;
    ring.opacity -= 0.045;
    if (ring.opacity <= 0) {
      clashRings.splice(i, 1);
      continue;
    }
    ctx.save();
    ctx.beginPath();
    ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(236, 72, 153, ${ring.opacity})`;
    ctx.lineWidth = 3.5;
    ctx.shadowColor = "#EC4899";
    ctx.shadowBlur = 15;
    ctx.stroke();
    ctx.restore();
  }
}

// Line segment intersection helper (Base to Tip)
function getLineIntersection(
  p0: { x: number; y: number },
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  p3: { x: number; y: number }
): { x: number; y: number } | null {
  const s1_x = p1.x - p0.x;
  const s1_y = p1.y - p0.y;
  const s2_x = p3.x - p2.x;
  const s2_y = p3.y - p2.y;

  const denom = -s2_x * s1_y + s1_x * s2_y;
  if (Math.abs(denom) < 0.0001) return null; // Parallel

  const s = (-s1_y * (p0.x - p2.x) + s1_x * (p0.y - p2.y)) / denom;
  const t = (s2_x * (p0.y - p2.y) - s2_y * (p0.x - p2.x)) / denom;

  if (s >= 0 && s <= 1 && t >= 0 && t <= 1) {
    return {
      x: p0.x + t * s1_x,
      y: p0.y + t * s1_y,
    };
  }
  return null;
}

// ── Main component ────────────────────────────────────────────────────────────
export default function WandCanvas({
  wands, stickTip, stickBase,
  ragdollPositions, pins,
  viewportWidth, viewportHeight,
}: WandCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prevTips  = useRef<Array<{ x: number; y: number } | null>>([null, null]);
  const frameRef  = useRef<number>(0);
  const lastClashTime = useRef<number>(0);

  const draw = useCallback(() => {
    frameRef.current = requestAnimationFrame(draw);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Size canvas to viewport
    if (canvas.width !== viewportWidth)  canvas.width  = viewportWidth;
    if (canvas.height !== viewportHeight) canvas.height = viewportHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // ── Draw ragdoll pins ───────────────────────────────────────────────────
    pins.forEach((pin) => {
      const rag = ragdollPositions[pin.id];
      if (!rag) return;

      const cx = rag.x;
      const cy = rag.y;
      const angle = rag.angle;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);

      // Glowing pin bubble
      ctx.beginPath();
      ctx.arc(0, 0, 26, 0, Math.PI * 2);
      ctx.fillStyle = pin.color + "33";
      ctx.shadowColor = pin.color;
      ctx.shadowBlur = 18;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(0, 0, 26, 0, Math.PI * 2);
      ctx.strokeStyle = pin.color;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label text
      ctx.shadowBlur = 0;
      ctx.fillStyle = pin.color;
      ctx.font = `bold ${Math.max(8, Math.min(11, 130 / pin.label.length))}px Inter, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const text = pin.label.length > 14 ? pin.label.slice(0, 13) + "…" : pin.label;
      ctx.fillText(text, 0, 0);
      ctx.restore();
    });

    // ── Draw sparks & clash rings ───────────────────────────────────────────
    tickSparks(ctx);
    tickClashRings(ctx);

    // ── Draw lightsaber sticks ──────────────────────────────────────────────
    const activeWands = wands && wands.length > 0
      ? wands
      : (stickTip && stickBase ? [{ tip: stickTip, base: stickBase }] : []);

    if (activeWands.length === 0) {
      prevTips.current = [null, null];
      return;
    }

    // Process each wand
    activeWands.forEach((wand, idx) => {
      const { x: tx, y: ty } = wand.tip;
      const { x: bx, y: by } = wand.base;

      // Select palette based on hand index
      const colors = idx === 1 ? WAND_2_COLORS : WAND_COLORS;

      // Emit sparks at tip when moving fast
      const prev = prevTips.current[idx];
      if (prev) {
        const speed = Math.hypot(tx - prev.x, ty - prev.y);
        if (speed > 5) {
          emitSparks(tx, ty, Math.min(8, Math.floor(speed / 3)), colors.sparks);
        }
      }
      prevTips.current[idx] = { x: tx, y: ty };

      // Animated time for chromatic shimmer
      const t = Date.now() / 500;

      // ── Outer plasma glow (widest, most transparent) ────────────────────────
      const glowGrad = ctx.createLinearGradient(bx, by, tx, ty);
      glowGrad.addColorStop(0,   colors.glow2 + "00");
      glowGrad.addColorStop(0.3, colors.glow2 + "55");
      glowGrad.addColorStop(0.7, colors.glow1 + "55");
      glowGrad.addColorStop(1,   colors.tip   + "88");

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(tx, ty);
      ctx.strokeStyle = glowGrad;
      ctx.lineWidth   = 24 + Math.sin(t) * 4;
      ctx.lineCap     = "round";
      ctx.shadowColor = colors.glow1;
      ctx.shadowBlur  = 40;
      ctx.globalAlpha = 0.5;
      ctx.stroke();
      ctx.restore();

      // ── Mid glow ────────────────────────────────────────────────────────────
      const midGrad = ctx.createLinearGradient(bx, by, tx, ty);
      midGrad.addColorStop(0, colors.glow2 + "bb");
      midGrad.addColorStop(1, colors.glow1 + "cc");
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(tx, ty);
      ctx.strokeStyle = midGrad;
      ctx.lineWidth   = 10;
      ctx.lineCap     = "round";
      ctx.shadowColor = colors.glow1;
      ctx.shadowBlur  = 20;
      ctx.globalAlpha = 0.85;
      ctx.stroke();
      ctx.restore();

      // ── Bright white core ───────────────────────────────────────────────────
      const coreGrad = ctx.createLinearGradient(bx, by, tx, ty);
      coreGrad.addColorStop(0, idx === 1 ? "#ffccee" : "#ccaaff");
      coreGrad.addColorStop(0.5, "#ffffff");
      coreGrad.addColorStop(1, idx === 1 ? "#aaffdd" : "#ffd700");
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(tx, ty);
      ctx.strokeStyle = coreGrad;
      ctx.lineWidth   = 3.5;
      ctx.lineCap     = "round";
      ctx.shadowColor = "#ffffff";
      ctx.shadowBlur  = 12;
      ctx.globalAlpha = 1;
      ctx.stroke();
      ctx.restore();

      // ── Tip flare ───────────────────────────────────────────────────────────
      const flareR = 8 + Math.sin(t * 3) * 3;
      const flareGrad = ctx.createRadialGradient(tx, ty, 0, tx, ty, flareR * 3);
      flareGrad.addColorStop(0,   colors.tip + "ff");
      flareGrad.addColorStop(0.4, colors.tip + "99");
      flareGrad.addColorStop(1,   colors.tip + "00");
      ctx.save();
      ctx.beginPath();
      ctx.arc(tx, ty, flareR * 3, 0, Math.PI * 2);
      ctx.fillStyle = flareGrad;
      ctx.globalAlpha = 0.9;
      ctx.fill();

      // Inner white dot
      ctx.beginPath();
      ctx.arc(tx, ty, flareR * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "#ffffff";
      ctx.shadowBlur  = 12;
      ctx.globalAlpha = 1;
      ctx.fill();
      ctx.restore();

      // ── Handle / grip at base ───────────────────────────────────────────────
      ctx.save();
      ctx.beginPath();
      ctx.arc(bx, by, 9, 0, Math.PI * 2);
      ctx.fillStyle = idx === 1 ? "#9F1239" : "#6B21A8"; // Deep rose vs deep violet
      ctx.shadowColor = colors.glow2;
      ctx.shadowBlur  = 16;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(bx, by, 5, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.restore();
    });

    // ── Check for dual-wand intersection (Clash effect!) ──────────────────
    if (activeWands.length === 2) {
      const w1 = activeWands[0];
      const w2 = activeWands[1];
      const clashPt = getLineIntersection(w1.base, w1.tip, w2.base, w2.tip);
      if (clashPt) {
        const now = Date.now();
        // Emit extra sparks at clash point
        emitSparks(clashPt.x, clashPt.y, 8, ["#ffffff", "#00E5FF", "#EC4899", "#EF4444", "#10B981"]);

        // Throttle ring emission
        if (now - lastClashTime.current > 150) {
          clashRings.push({
            x: clashPt.x,
            y: clashPt.y,
            radius: 5,
            opacity: 0.9,
          });
          lastClashTime.current = now;
        }

        // Draw dramatic glowing energy orb at clash point
        const t = Date.now() / 200;
        const clashR = 14 + Math.sin(t * 6) * 4;
        const clashGrad = ctx.createRadialGradient(clashPt.x, clashPt.y, 0, clashPt.x, clashPt.y, clashR * 4);
        clashGrad.addColorStop(0, "#ffffff");
        clashGrad.addColorStop(0.2, "#00E5FF");
        clashGrad.addColorStop(0.5, "#EC4899");
        clashGrad.addColorStop(1, "rgba(236,72,153,0)");

        ctx.save();
        ctx.beginPath();
        ctx.arc(clashPt.x, clashPt.y, clashR * 4, 0, Math.PI * 2);
        ctx.fillStyle = clashGrad;
        ctx.globalAlpha = 0.95;
        ctx.fill();

        // Inner white hot core
        ctx.beginPath();
        ctx.arc(clashPt.x, clashPt.y, clashR * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = "#ffffff";
        ctx.shadowBlur = 24;
        ctx.fill();
        ctx.restore();
      }
    }
  }, [wands, stickTip, stickBase, ragdollPositions, pins, viewportWidth, viewportHeight]);

  useEffect(() => {
    frameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frameRef.current);
  }, [draw]);

  // ── Render phantom prompt when no hand detected ─────────────────────────
  const showHint = !stickTip && (!wands || wands.length === 0);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 50 }}
        width={viewportWidth}
        height={viewportHeight}
      />
      {showHint && (
        <div
          className="absolute bottom-24 left-1/2 -translate-x-1/2 pointer-events-none"
          style={{ zIndex: 51 }}
        >
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold text-white/70 backdrop-blur-sm"
            style={{
              background: "rgba(124,58,237,0.18)",
              border: "1px solid rgba(124,58,237,0.4)",
              animation: "pulse 2s infinite",
            }}
          >
            <span style={{ fontSize: 16 }}>🪄</span>
            Hold your hands up in front of the camera to grab the neon wands!
          </div>
        </div>
      )}
    </>
  );
}
