"use client";

import { useRef, useState, useCallback, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Upload, Pause, Play, X, Wifi, WifiOff, Download, Flame, Zap, Wand2, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useAICamera, type DetectionMode, type AnalysisResult } from "@/hooks/useAICamera";
import { useRoomMakeover } from "@/hooks/useRoomMakeover";
import { useWandMode, type WandPin } from "@/hooks/useWandMode";
import dynamic from "next/dynamic";

// Lazy-load the AR overlay
const RoomMakeoverOverlay = dynamic(
  () => import("@/components/camera/RoomMakeoverOverlay"),
  { ssr: false }
);

// Lazy-load the wand canvas
const WandCanvas = dynamic(
  () => import("@/components/camera/WandCanvas"),
  { ssr: false }
);

const WS_URL = typeof window !== "undefined"
  ? `ws://${window.location.hostname}:8000/ws/analyze/client-${Math.random().toString(36).slice(2, 8)}`
  : "ws://localhost:8000/ws/analyze/client-demo";

const MODE_COLOR: Record<DetectionMode, string> = {
  food: "#10B981", // Green
  room: "#0070F3", // Primary Blue
  emotion: "#0EA5E9", // Sky Blue
  unknown: "#64748B", // Slate
  idle: "#CBD5E1",
  wand: "#7C3AED", // Purple
};

const MODE_LABEL: Record<DetectionMode, string> = {
  food: "Food AI",
  room: "Interior AI",
  emotion: "Emotion AI",
  unknown: "Scanning…",
  idle: "Ready",
  wand: "Wand Mode",
};

// ── Calorie overlay shown on-screen over the camera feed ──────
function FoodOverlay({ result, color }: { result: AnalysisResult; color: string }) {
  const calories = result.data["Calories"] as string | undefined;
  const protein = result.data["Protein"] as string | undefined;
  const carbs = result.data["Carbohydrates"] as string | undefined;
  const fat = result.data["Fat"] as string | undefined;
  const fiber = result.data["Fiber"] as string | undefined;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      className="absolute bottom-6 left-6 right-6 z-30 pointer-events-none"
    >
      <div
        className="rounded-xl p-4 mb-3 bg-white border shadow-md"
        style={{
          borderColor: `${color}40`,
        }}
      >
        {/* Food name + confidence */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-[10px] text-slate-400 font-mono uppercase mb-0.5">Detected Food</div>
            <div className="text-slate-800 font-bold text-base leading-tight">{result.detected}</div>
          </div>
          <div
            className="text-right px-3 py-1 rounded-lg border"
            style={{ background: `${color}05`, borderColor: `${color}20` }}
          >
            <div className="text-[10px] text-slate-400 font-mono">Confidence</div>
            <div className="text-base font-black" style={{ color }}>{result.confidence.toFixed(0)}%</div>
          </div>
        </div>

        {/* Big calorie number */}
        {calories && (
          <div
            className="flex items-center gap-3 p-3 rounded-lg mb-3 border"
            style={{ background: `${color}05`, borderColor: `${color}15` }}
          >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: `${color}15`, color }}
            >
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-mono">Total Calories</div>
              <div className="text-xl font-black" style={{ color }}>{calories}</div>
            </div>
          </div>
        )}

        {/* Macro pills row */}
        <div className="flex gap-2">
          {[
            { label: "Protein", value: protein, color: "#3B82F6" },
            { label: "Carbs", value: carbs, color: "#F59E0B" },
            { label: "Fat", value: fat, color: "#EF4444" },
            { label: "Fiber", value: fiber, color: "#22C55E" },
          ].map(m => m.value ? (
            <div
              key={m.label}
              className="flex-1 rounded-lg p-2 text-center border bg-slate-50"
              style={{ borderColor: `${m.color}15` }}
            >
              <div className="text-xs font-bold" style={{ color: m.color }}>{m.value}</div>
              <div className="text-[9px] text-slate-400 mt-0.5 font-mono">{m.label}</div>
            </div>
          ) : null)}
        </div>
      </div>

      {/* Suggestions strip */}
      {result.suggestions?.[0] && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs bg-white border shadow-sm text-slate-600"
          style={{
            borderColor: `${color}20`,
          }}
        >
          <Zap className="w-3.5 h-3.5 flex-shrink-0" style={{ color }} />
          <span>{result.suggestions[0]}</span>
        </motion.div>
      )}
    </motion.div>
  );
}

// ── Generic overlay for room/emotion ──────────────────────────
function GenericOverlay({ result, color }: { result: AnalysisResult; color: string }) {
  const entries = Object.entries(result.data).slice(0, 4);
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="absolute top-20 right-5 z-30 w-56 pointer-events-none"
    >
      <div
        className="rounded-xl p-4 bg-white border shadow-md"
        style={{
          borderColor: `${color}30`,
        }}
      >
        <div className="text-[10px] text-slate-400 font-mono uppercase mb-1">Detected</div>
        <div className="text-slate-800 font-bold mb-3 text-sm">{result.detected}</div>
        {entries.map(([k, v]) => (
          <div key={k} className="flex justify-between py-1.5 border-b border-slate-100 last:border-0">
            <span className="text-xs text-slate-500">{k}</span>
            <span className="text-xs font-bold text-slate-700">{String(v)}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ── Main page ─────────────────────────────────────────────────
export default function CameraPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const wandCanvasRef = useRef<HTMLCanvasElement>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<AnalysisResult | null>(null);
  const [uploadAnalyzing, setUploadAnalyzing] = useState(false);
  const [uploadMode, setUploadMode] = useState<DetectionMode>("idle");
  const [demoMode, setDemoMode] = useState(false);
  const [wandEnabled, setWandEnabled] = useState(false);
  const [autoStartRoom, setAutoStartRoom] = useState(false);
  const [viewportSize, setViewportSize] = useState({ w: 0, h: 0 });
  const [selectedMode, setSelectedMode] = useState<DetectionMode>("idle");
  const { videoRef, canvasRef, cameraActive, paused, analyzing, mode, result, error, wsConnected, frameCount, scanProgress, facingMode, startCamera, stopCamera, togglePause, flipCamera } = useAICamera({ wsUrl: WS_URL, captureInterval: 7000, quality: 0.78, forceDemo: demoMode, selectedMode });

  // Makeover hook
  const makeover = useRoomMakeover(
    typeof window !== "undefined" ? `http://${window.location.hostname}:8000` : undefined
  );

  const handleMakeover = useCallback(() => {
    if (!videoRef.current || !cameraActive) return;
    makeover.analyze(videoRef.current, canvasRef.current ?? undefined);
  }, [videoRef, canvasRef, cameraActive, makeover]);

  // Auto-start based on query params on mount
  const initializedRef = useRef(false);
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const m = params.get("mode") as DetectionMode;

    if (m === "food" || m === "room" || m === "emotion" || m === "wand") {
      setSelectedMode(m);
    }

    if (m === "wand") {
      startCamera().then(() => {
        setWandEnabled(true);
      });
    } else if (m === "food") {
      startCamera();
    } else if (m === "room") {
      startCamera().then(() => {
        setAutoStartRoom(true);
      });
    }
  }, [startCamera]);

  useEffect(() => {
    if (autoStartRoom && cameraActive) {
      setAutoStartRoom(false);
      setTimeout(() => {
        handleMakeover();
      }, 1200);
    }
  }, [autoStartRoom, cameraActive, handleMakeover]);

  // Track viewport size for AR pin positioning
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setViewportSize({ w: Math.round(width), h: Math.round(height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const activeResult = cameraActive ? result : uploadResult;
  const activeMode = cameraActive ? mode : uploadMode;
  const activeAnalyzing = cameraActive ? analyzing : uploadAnalyzing;
  const activeProgress = cameraActive ? scanProgress : 0;
  const color = MODE_COLOR[activeMode];

  // ── Build wand pins from current AR makeover result ──────────
  const wandPins: WandPin[] = useMemo(() => {
    return makeover.isDone && makeover.result
      ? (() => {
          const r = makeover.result;
          const out: WandPin[] = [];
          r.lighting.forEach((l, i) => out.push({
            id: l.id ?? `light-${i}`, label: l.type,
            x_pct: l.x_pct, y_pct: l.y_pct, color: "#0070F3",
          }));
          if (r.bed_arrangement?.x_pct) out.push({
            id: "bed", label: "Bed Repositioning",
            x_pct: r.bed_arrangement.x_pct, y_pct: r.bed_arrangement.y_pct, color: "#3B82F6",
          });
          if (r.accent_piece?.x_pct) {
            const isMirror = r.accent_piece.name.toLowerCase().includes("mirror");
            if (!isMirror) {
              out.push({
                id: "accent", label: r.accent_piece.name,
                x_pct: r.accent_piece.x_pct, y_pct: r.accent_piece.y_pct, color: "#0EA5E9",
              });
            }
          }
          return out;
        })()
      : [
          { id: "demo-1", label: "Warm LED Strip",       x_pct: 20, y_pct: 30, color: "#0070F3" },
          { id: "demo-2", label: "Bed Repositioning",    x_pct: 50, y_pct: 55, color: "#3B82F6" },
        ];
  }, [makeover.isDone, makeover.result]);

  // ── Wand mode hook ───────────────────────────────────────────
  const { wands, stickTip, stickBase, ragdollPositions, ready: wandReady } = useWandMode({
    videoRef,
    canvasRef: wandCanvasRef,
    viewportWidth:  viewportSize.w,
    viewportHeight: viewportSize.h,
    pins: wandPins,
    enabled: wandEnabled && cameraActive,
    facingMode,
  });

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    if (cameraActive) stopCamera();
    const objectUrl = URL.createObjectURL(file);
    setUploadedImage(objectUrl);
    setUploadResult(null); setUploadAnalyzing(true); setUploadMode("unknown");

    // Convert to base64 and run real Gemini analysis
    const { analyzeFrameWithGemini } = await import("@/lib/geminiVision");
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(",")[1];
      const geminiResult = await analyzeFrameWithGemini(base64, selectedMode);
      if (geminiResult) {
        setUploadMode(geminiResult.mode); setUploadResult(geminiResult);
      } else {
        // No API key
        setUploadMode("unknown");
        setUploadResult({
          mode: "unknown", confidence: 0, detected: "No API Key",
          data: { Status: "Add your Gemini API key in Settings → Environment for real analysis" },
          suggestions: ["Go to Settings → Environment", "Get a free key at aistudio.google.com"]
        });
      }
      setUploadAnalyzing(false);
    };
    reader.readAsDataURL(file);
  }, [cameraActive, stopCamera, selectedMode]);

  const handleExport = () => {
    if (!activeResult) return;
    const blob = new Blob([JSON.stringify(activeResult, null, 2)], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `antos-${activeMode}-${Date.now()}.json`; a.click();
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-100 text-[#0F172A]" style={{ fontFamily: "Inter, sans-serif" }}>
      {/* Hidden elements */}
      <canvas ref={canvasRef} className="hidden" />
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />

      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="flex-shrink-0 h-14 flex items-center justify-between px-6 border-b border-slate-200 bg-white/95 backdrop-blur-md z-50">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-slate-500 hover:text-slate-900 text-xs font-semibold transition-colors flex items-center gap-1">
            ← Portal
          </Link>
          <div className="w-px h-4 bg-slate-200" />
          <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
            <Camera className="w-4 h-4 text-[#0070F3]" /> Live AI Camera
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:flex items-center gap-1.5 text-xs font-mono"
            style={{ color: wsConnected ? "#10B981" : "#64748B" }}>
            {wsConnected ? <Wifi className="w-3.5 h-3.5 text-emerald-500" /> : <WifiOff className="w-3.5 h-3.5 text-slate-400" />}
            {wsConnected ? "AI Online" : "Demo Mode"}
          </span>
          <AnimatePresence mode="wait">
            <motion.span key={wandEnabled ? "wand" : activeMode}
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="px-2.5 py-0.5 rounded text-xs font-bold border"
              style={
                wandEnabled
                  ? { background: "rgba(124,58,237,0.05)", color: "#7C3AED", borderColor: "rgba(124,58,237,0.15)" }
                  : { background: `${color}08`, color, borderColor: `${color}20` }
              }>
              {wandEnabled ? "Wand Physics" : MODE_LABEL[activeMode]}
            </motion.span>
          </AnimatePresence>
          <span className="text-[10px] font-mono text-slate-400 font-semibold">#{frameCount.toString().padStart(4, "0")}</span>
        </div>
      </header>

      {/* ── Controls bar ───────────────────────────────────────── */}
      <div className="flex-shrink-0 flex items-center gap-2 px-3 sm:px-6 py-2.5 border-b border-slate-200 bg-white shadow-sm overflow-x-auto">
        {/* Start / Stop */}
        <button id="start-camera-btn" onClick={cameraActive ? stopCamera : () => startCamera()}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all shadow-sm shrink-0 ${cameraActive
            ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100/50"
            : "bg-[#0070F3] hover:bg-[#0051B3] text-white"}`}>
          {cameraActive ? <><X className="w-4 h-4" /><span className="hidden sm:inline">Stop</span></> : <><Camera className="w-4 h-4" /><span className="hidden sm:inline">Start</span></>}
        </button>

        {/* Upload */}
        <button onClick={() => fileInputRef.current?.click()}
          title="Upload Image"
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 transition-all shadow-sm shrink-0">
          <Upload className="w-4 h-4" /><span className="hidden sm:inline">Upload</span>
        </button>

        {/* Pause/Resume — only when camera is active */}
        {cameraActive && (
          <button onClick={togglePause} title={paused ? "Resume" : "Pause"}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 transition-all shadow-sm shrink-0">
            {paused ? <><Play className="w-4 h-4" /><span className="hidden sm:inline">Resume</span></> : <><Pause className="w-4 h-4" /><span className="hidden sm:inline">Pause</span></>}
          </button>
        )}

        {/* Clear — only when image is uploaded */}
        {uploadedImage && !cameraActive && (
          <button onClick={() => { setUploadedImage(null); setUploadResult(null); setUploadMode("idle"); }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-red-50 text-red-600 border border-red-200 hover:bg-red-100/50 transition-all shadow-sm shrink-0">
            <X className="w-4 h-4" /><span className="hidden sm:inline">Clear</span>
          </button>
        )}

        {/* Divider */}
        <div className="w-px h-6 bg-slate-200 mx-1 shrink-0 hidden sm:block" />

        {/* Flip Camera */}
        {cameraActive && (
          <button
            onClick={flipCamera}
            title={facingMode === "environment" ? "Switch to Front Camera" : "Switch to Back Camera"}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-slate-50 text-slate-700 border border-slate-200 hover:bg-blue-50 hover:text-[#0070F3] hover:border-blue-200 transition-all shadow-sm shrink-0"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">
              {facingMode === "environment" ? "Front Cam" : "Back Cam"}
            </span>
          </button>
        )}

        {/* Wand Mode */}
        <button
          id="wand-mode-btn"
          onClick={() => setWandEnabled(p => !p)}
          title={wandEnabled ? "Wand Mode ON" : "Wand Mode"}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all border shadow-sm shrink-0 ${
            wandEnabled
              ? "bg-violet-50 text-violet-600 border-violet-200 animate-pulse"
              : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
          }`}
        >
          <Wand2 className="w-4 h-4" />
          <span className="hidden sm:inline">{wandEnabled ? (wandReady ? "Wand ON" : "Loading…") : "Wand"}</span>
        </button>

        {/* AR Makeover */}
        <button
          id="ar-makeover-btn"
          onClick={makeover.isDone ? makeover.reset : handleMakeover}
          disabled={!cameraActive || makeover.isAnalyzing}
          title={makeover.isDone ? "Exit Makeover" : "Analyze & Redesign"}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all border shadow-sm shrink-0 ${
            makeover.isDone
              ? "bg-purple-50 text-purple-600 border-purple-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
              : makeover.isAnalyzing
              ? "bg-purple-50 text-purple-500 border-purple-200 cursor-wait animate-pulse"
              : cameraActive
              ? "bg-[#0070F3] hover:bg-[#0051B3] text-white border-[#0070F3]"
              : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60"
          }`}
        >
          <Zap className="w-4 h-4" />
          <span className="hidden sm:inline">
            {makeover.isAnalyzing ? "Redesigning…" : makeover.isDone ? "Exit" : "Redesign"}
          </span>
        </button>

        {/* Demo Mode */}
        <button onClick={() => setDemoMode(p => !p)}
          title={demoMode ? "Demo Mode ON" : "Demo Mode"}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all shadow-sm shrink-0 ml-auto ${demoMode
            ? "bg-amber-50 text-amber-600 border border-amber-200 animate-pulse"
            : "bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100"}`}>
          <span className="text-sm">⚡</span>
          <span className="hidden sm:inline">{demoMode ? "Demo ON" : "Demo"}</span>
        </button>

        {/* Export */}
        {activeResult && (
          <button onClick={handleExport} title="Export JSON"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 transition-all shadow-sm shrink-0">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
        )}

      </div>

      {/* ── Main viewport ──────────────────────────────────────── */}
      <div ref={viewportRef} className="flex-1 relative overflow-hidden bg-slate-900">

        {/* Video — always mounted so ref is always available */}
        <video
          ref={videoRef}
          autoPlay muted playsInline
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
          style={{
            opacity: cameraActive ? 1 : 0,
            transform: facingMode === "user" ? "scaleX(-1)" : "none",
          }}
        />

        {/* Uploaded image */}
        {uploadedImage && !cameraActive && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={uploadedImage} alt="Uploaded" className="absolute inset-0 w-full h-full object-contain bg-slate-950" />
        )}

        {/* ── Idle splash ───────────────────────────────────────── */}
        {!cameraActive && !uploadedImage && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-[#F8FAFC]">
            <motion.div animate={{ scale: [1, 1.03, 1] }} transition={{ duration: 3, repeat: Infinity }}
              className="w-24 h-24 rounded-2xl bg-[#0070F3]/5 border border-[#0070F3]/15 flex items-center justify-center">
              <Camera className="w-12 h-12 text-[#0070F3]/60" />
            </motion.div>
            <div className="text-center space-y-1">
              <p className="text-slate-800 text-sm sm:text-base font-bold">Point your camera at food to see calories instantly</p>
              <p className="text-slate-500 text-xs sm:text-sm font-light">Also supports interior layout design & emotion metrics</p>
            </div>
            <div className="flex gap-3 mt-2">
              <button onClick={() => startCamera()}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold bg-[#0070F3] hover:bg-[#0051B3] text-white shadow-md transition-all">
                <Camera className="w-4 h-4" />Start Camera
              </button>
              <button onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold bg-white text-slate-700 border border-slate-250 hover:bg-slate-50 transition-all shadow-sm">
                <Upload className="w-4 h-4" />Upload Image
              </button>
            </div>
          </div>
        )}

        {/* ── Scan overlays (when camera or image is active) ──── */}
        {(cameraActive || uploadedImage) && !wandEnabled && (
          <>
            {/* Corner brackets */}
            {(["top-5 left-5 border-t-2 border-l-2 rounded-tl-lg",
              "top-5 right-5 border-t-2 border-r-2 rounded-tr-lg",
              "bottom-5 left-5 border-b-2 border-l-2 rounded-bl-lg",
              "bottom-5 right-5 border-b-2 border-r-2 rounded-br-lg"] as const).map((cls, i) => (
                <div key={i} className={`absolute w-8 h-8 pointer-events-none z-20 ${cls}`}
                  style={{ borderColor: color }} />
              ))}

            {/* Scan sweep line */}
            <motion.div className="absolute left-0 right-0 h-px z-20 pointer-events-none"
              style={{ background: `linear-gradient(90deg,transparent,${color},transparent)` }}
              animate={{ top: ["0%", "100%", "0%"] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} />

            {/* Status badge */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 animate-fade-in">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/95 border shadow-sm"
                style={{ color }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: color }} />
                {activeAnalyzing ? "ANALYZING…" : "AI ACTIVE"}
              </div>
            </div>

            {/* Scan progress bar */}
            {activeAnalyzing && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-200 z-30">
                <motion.div className="h-full" style={{ width: `${activeProgress}%`, background: color }} />
              </div>
            )}

            {/* ── Bounding Box Outlines ────────────────────────── */}
            {activeResult?.detections?.map((det, idx) => {
              const boxColor = MODE_COLOR[det.category] || "#0070F3";
              const [ymin, xmin, ymax, xmax] = det.box;
              return (
                <motion.div
                  key={`box-${idx}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute border-2 rounded-lg pointer-events-none z-20 transition-all duration-300"
                  style={{
                    top: `${ymin / 10}%`,
                    left: `${xmin / 10}%`,
                    width: `${(xmax - xmin) / 10}%`,
                    height: `${(ymax - ymin) / 10}%`,
                    borderColor: boxColor,
                    boxShadow: `0 0 12px ${boxColor}25`,
                  }}
                >
                  <div
                    className="absolute -top-6 left-0 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-white"
                    style={{
                      backgroundColor: boxColor,
                    }}
                  >
                    {det.name} ({det.confidence.toFixed(0)}%)
                  </div>
                </motion.div>
              );
            })}

            {/* ── Side Detail Cards Panel ───────────────────────── */}
            {activeResult?.detections && activeResult.detections.length > 0 && !activeAnalyzing && (
              <div className="absolute top-16 right-4 bottom-4 w-80 z-30 overflow-y-auto space-y-3 pointer-events-auto pr-1">
                {activeResult.detections.map((det, idx) => {
                  const cardColor = MODE_COLOR[det.category] || "#0070F3";
                  return (
                    <motion.div
                      key={`card-${idx}`}
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="rounded-xl p-4 bg-white border border-slate-200 shadow-md"
                    >
                      {/* Card Title */}
                      <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100">
                        <div>
                          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono font-bold">
                            {det.category.toUpperCase()} AI
                          </div>
                          <div className="text-slate-800 font-bold text-sm leading-tight">{det.name}</div>
                        </div>
                        <span className="text-xs font-bold px-2 py-0.5 rounded border" style={{ background: `${cardColor}05`, color: cardColor, borderColor: `${cardColor}15` }}>
                          {det.confidence.toFixed(0)}%
                        </span>
                      </div>

                      {/* Detail Metrics */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {Object.entries(det.data).map(([key, val]) => (
                          <div key={key} className="bg-slate-50 rounded p-2 border border-slate-150">
                            <div className="text-[10px] text-slate-400 font-semibold">{key}</div>
                            <div className="text-slate-700 font-bold mt-0.5">
                              {val}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Suggestions */}
                      {det.suggestions?.[0] && (
                        <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex gap-1.5 items-start text-[10px] text-slate-500">
                          <Zap className="w-3.5 h-3.5 text-[#0070F3] mt-0.5 flex-shrink-0" />
                          <span>{det.suggestions[0]}</span>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Detected label top-left */}
            {activeResult && !activeAnalyzing && (
              <div className="absolute top-16 left-5 z-30">
                <div className="px-3 py-1 rounded-lg text-xs font-bold bg-white border shadow-md text-slate-800">
                  {activeResult.detected.toUpperCase()} · {activeResult.confidence.toFixed(0)}%
                </div>
              </div>
            )}
          </>
        )}

        {/* ── AR Room Makeover Overlay ──────────────────────────── */}
        <AnimatePresence>
          {makeover.isDone && makeover.result && !wandEnabled && (
            <motion.div
              key="makeover-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-20"
            >
              <RoomMakeoverOverlay
                result={makeover.result}
                videoRef={videoRef}
                viewportWidth={viewportSize.w}
                viewportHeight={viewportSize.h}
                onClose={makeover.reset}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── 🪄 Wand Mode Canvas ── */}
        <AnimatePresence>
          {wandEnabled && cameraActive && (
            <motion.div
              key="wand-canvas"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 pointer-events-none"
              style={{ zIndex: 50 }}
            >
              <WandCanvas
                wands={wands}
                stickTip={stickTip}
                stickBase={stickBase}
                ragdollPositions={ragdollPositions}
                pins={wandPins}
                viewportWidth={viewportSize.w}
                viewportHeight={viewportSize.h}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Makeover analyzing spinner */}
        <AnimatePresence>
          {makeover.isAnalyzing && (
            <motion.div
              key="makeover-spinner"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-900/65 backdrop-blur-sm"
            >
              <motion.div
                className="w-16 h-16 rounded-xl flex items-center justify-center mb-5 bg-white border border-slate-200 shadow-lg"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Wand2 className="w-8 h-8 text-[#0070F3]" />
              </motion.div>
              <p className="text-white font-bold text-base">AI is redesigning your room…</p>
              <p className="text-white/60 text-xs mt-1">Analysing walls, lighting & furniture placement</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Makeover error */}
        <AnimatePresence>
          {makeover.status === "error" && (
            <motion.div
              initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
              className="absolute bottom-16 inset-x-4 z-40 p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-3 shadow-md"
            >
              <span className="text-red-700 text-xs flex-1">{makeover.error}</span>
              <button onClick={makeover.reset} className="px-3 py-1 rounded-md bg-red-100 hover:bg-red-200/50 text-red-700 text-xs font-semibold">Dismiss</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Error banner ──────────────────────────────────────── */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
              className="absolute bottom-0 inset-x-0 p-4 bg-red-50 border-t border-red-200 z-40 flex items-center gap-3 shadow-lg">
              <span className="text-red-700 text-xs sm:text-sm font-semibold flex-1">{error}</span>
              <div className="flex gap-2">
                <button onClick={() => { setDemoMode(true); startCamera(); }} className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold hover:bg-amber-100 transition-all">
                  Use Demo Mode
                </button>
                <button onClick={() => startCamera()} className="px-3 py-1.5 rounded-lg bg-red-100 text-red-700 text-xs font-bold hover:bg-red-200 transition-all">
                  Retry
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
