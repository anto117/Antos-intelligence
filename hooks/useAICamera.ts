"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { analyzeFrameWithGemini } from "@/lib/geminiVision";

export type DetectionMode = "food" | "room" | "emotion" | "unknown" | "idle" | "wand";

export interface SingleDetection {
  category: DetectionMode;
  name: string;
  confidence: number;
  box: [number, number, number, number]; // [ymin, xmin, ymax, xmax] normalized to 1000
  data: Record<string, string | number>;
  suggestions?: string[];
  score?: number;
}

export interface AnalysisResult {
  mode: DetectionMode;
  confidence: number;
  detected: string;
  data: Record<string, string | number>;
  suggestions?: string[];
  score?: number;
  disclaimer?: string;
  source?: string; // e.g. "TensorFlow MobileNet", "Gemini Vision", "YOLOv8 Backend"
  bounding_boxes?: unknown[];
  detections?: SingleDetection[];
}
export function useAICamera({
  wsUrl,
  captureInterval = 5000,
  quality = 0.55,
  forceDemo = false,
  selectedMode = "idle",
  initialFacingMode = "environment",
}: {
  wsUrl: string;
  captureInterval?: number;
  quality?: number;
  forceDemo?: boolean;
  selectedMode?: DetectionMode;
  initialFacingMode?: "user" | "environment";
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const captureTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const frameRef = useRef(0);

  const [cameraActive, setCameraActive] = useState(false);
  const [paused, setPaused] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [mode, setMode] = useState<DetectionMode>("idle");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [frameCount, setFrameCount] = useState(0);
  const [scanProgress, setScanProgress] = useState(0);
  const [facingMode, setFacingMode] = useState<"user" | "environment">(initialFacingMode);
  const facingModeRef = useRef<"user" | "environment">(initialFacingMode);

  // ── WebSocket (backend) ─────────────────────────────────────
  const connectWs = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      ws.onopen = () => { setWsConnected(true); setError(null); };
      ws.onclose = () => setWsConnected(false);
      ws.onerror = () => setWsConnected(false);
      ws.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data as string);
          if (msg.type === "analysis") {
            applyResult({
              mode: msg.mode, confidence: msg.confidence, detected: msg.detected,
              data: msg.data, suggestions: msg.suggestions, score: msg.score,
              disclaimer: msg.mode === "emotion" ? "Emotion analysis is an AI estimation." : undefined,
            });
          }
        } catch { /* ignore */ }
      };
    } catch { setWsConnected(false); }
  }, [wsUrl]);

  const applyResult = (r: AnalysisResult) => {
    setMode(r.mode);
    setResult(r);
    setAnalyzing(false);
    setScanProgress(100);
    frameRef.current += 1;
    setFrameCount(frameRef.current);
    if (progressTimer.current) clearInterval(progressTimer.current);
  };

  // ── Frame capture + analysis ────────────────────────────────
  const captureAndSend = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    if (video.readyState < 2 || video.paused || video.ended) return;

    // Downscale for analysis to improve performance and reduce network payload
    const maxDim = 640;
    const videoW = video.videoWidth || 640;
    const videoH = video.videoHeight || 360;
    let targetW = videoW;
    let targetH = videoH;
    if (targetW > maxDim) {
      targetH = Math.round((maxDim / targetW) * targetH);
      targetW = maxDim;
    }
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", quality);
    const base64 = dataUrl.split(",")[1];

    // Start progress
    setAnalyzing(true);
    setScanProgress(0);
    if (progressTimer.current) clearInterval(progressTimer.current);
    progressTimer.current = setInterval(() => {
      setScanProgress(p => { if (p >= 85) { clearInterval(progressTimer.current!); return 85; } return p + 5; });
    }, 80);

    // Priority 1: backend WebSocket
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "frame", data: base64 }));
      return;
    }

    // Priority 1.5: Force Demo Mode
    if (forceDemo) {
      // Rotate mock results for demonstration
      const mockModes: DetectionMode[] = ["food", "emotion", "room"];
      const nextMode = mockModes[frameRef.current % mockModes.length];
      const mockResult = getMockResult(nextMode);
      applyResult(mockResult);
      return;
    }

    // Priority 2: Gemini / OpenRouter (cloud vision)
    const geminiResult = await analyzeFrameWithGemini(base64, selectedMode);
    if (geminiResult && geminiResult.confidence > 0) {
      applyResult(geminiResult);
      return;
    }

    // Priority 3: TensorFlow.js MobileNet — real neural network, no API key needed
    if (selectedMode === "food" || selectedMode === "idle") {
      try {
        const { analyzeWithTensorFlow } = await import("@/lib/tensorflowFoodAI");
        const tfResult = await analyzeWithTensorFlow(base64);
        if (tfResult) {
          applyResult(tfResult);
          return;
        }
      } catch (tfErr) {
        console.warn("[TF] failed:", tfErr);
      }
    }

    // Priority 4: Pixel-based local AI fallback
    try {
      const { analyzeWithLocalAI } = await import("@/lib/localVisionAI");
      const localResult = await analyzeWithLocalAI(base64, selectedMode !== "idle" ? selectedMode : undefined);
      applyResult(localResult);
      return;
    } catch (localErr) {
      console.warn("[LocalAI] failed:", localErr);
    }

    // Priority 4: Hard fallback — should never reach here
    applyResult({
      mode: selectedMode === "idle" ? "unknown" : selectedMode,
      confidence: 30,
      detected: "Point at an item",
      data: { Status: "Move closer and hold steady" },
      suggestions: ["Hold the camera steady", "Ensure good lighting", "Point directly at the item"]
    });
    frameRef.current += 1;
    setFrameCount(frameRef.current);
  }, [quality, selectedMode, forceDemo]);

  // ── Start camera ────────────────────────────────────────────
  const startCamera = useCallback(async (overrideFacing?: "user" | "environment") => {
    setError(null);
    // Stop any existing stream first
    if (captureTimer.current) { clearInterval(captureTimer.current); captureTimer.current = null; }
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;

    const facing = overrideFacing ?? facingModeRef.current;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: facing },
        audio: false,
      });
      streamRef.current = stream;
      
      // Dynamically detect actual camera facing mode from track settings or label (e.g., laptops/webcams)
      const track = stream.getVideoTracks()[0];
      if (track) {
        let actualFacing = track.getSettings().facingMode as "user" | "environment" | undefined;
        if (!actualFacing && track.label) {
          const lbl = track.label.toLowerCase();
          if (
            lbl.includes("front") ||
            lbl.includes("user") ||
            lbl.includes("selfie") ||
            lbl.includes("webcam") ||
            lbl.includes("integrated") ||
            lbl.includes("facetime") ||
            lbl.includes("brio") ||
            lbl.includes("c920")
          ) {
            actualFacing = "user";
          } else {
            actualFacing = "environment";
          }
        }
        if (actualFacing && actualFacing !== facingModeRef.current) {
          facingModeRef.current = actualFacing;
          setFacingMode(actualFacing);
        }
      }

      const video = videoRef.current;
      if (!video) throw new Error("Video element not ready");
      video.srcObject = stream;
      video.muted = true;
      video.playsInline = true;
      await video.play().catch(() => {});
      setCameraActive(true);
      setPaused(false);
      connectWs();
      if (captureTimer.current) clearInterval(captureTimer.current);
      captureTimer.current = setInterval(captureAndSend, captureInterval);
      setTimeout(captureAndSend, 1200);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (/NotAllowed|Permission|denied/i.test(msg)) {
        setError("Camera permission denied. Click the camera icon in the address bar and allow access.");
      } else if (/NotFound|Devices/i.test(msg)) {
        setError("No camera found. Please connect a webcam and try again.");
      } else {
        setError(`Could not start camera: ${msg}`);
      }
    }
  }, [connectWs, captureAndSend, captureInterval]);

  // ── Flip camera (front ↔ back) ───────────────────────────────
  const flipCamera = useCallback(async () => {
    const next: "user" | "environment" = facingModeRef.current === "environment" ? "user" : "environment";
    facingModeRef.current = next;
    setFacingMode(next);
    if (cameraActive) {
      await startCamera(next);
    }
  }, [cameraActive, startCamera]);

  // ── Stop camera ─────────────────────────────────────────────
  const stopCamera = useCallback(() => {
    if (captureTimer.current) { clearInterval(captureTimer.current); captureTimer.current = null; }
    if (progressTimer.current) { clearInterval(progressTimer.current); progressTimer.current = null; }
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    wsRef.current?.close(); wsRef.current = null;
    setWsConnected(false);
    setCameraActive(false); setPaused(false); setMode("idle");
    setResult(null); setScanProgress(0); setAnalyzing(false);
  }, []);

  const togglePause = useCallback(() => {
    const video = videoRef.current; if (!video) return;
    if (paused) {
      video.play();
      captureTimer.current = setInterval(captureAndSend, captureInterval);
    } else {
      video.pause();
      if (captureTimer.current) { clearInterval(captureTimer.current); captureTimer.current = null; }
    }
    setPaused(p => !p);
  }, [paused, captureAndSend, captureInterval]);

  useEffect(() => {
    if (cameraActive && !paused) {
      if (captureTimer.current) clearInterval(captureTimer.current);
      captureTimer.current = setInterval(captureAndSend, captureInterval);
    }
  }, [captureAndSend, cameraActive, paused, captureInterval]);

  useEffect(() => {
    if (cameraActive) {
      if (wsRef.current) {
        wsRef.current.close();
      }
      connectWs();
    }
  }, [wsUrl, cameraActive, connectWs]);

  useEffect(() => () => { stopCamera(); }, [stopCamera]);

  return { videoRef, canvasRef, cameraActive, paused, analyzing, mode, result, error, wsConnected, frameCount, scanProgress, facingMode, startCamera, stopCamera, togglePause, flipCamera };
}

// Keep getMockResult for upload fallback
export function getMockResult(mode: DetectionMode): AnalysisResult {
  if (mode === "food") {
    return {
      mode: "food", confidence: 92, detected: "Avocado Salad & Beverage", score: 8.5,
      data: { Calories: "~450 kcal", Protein: "12g", Carbohydrates: "51g", Fat: "29g" },
      suggestions: ["Avocado is rich in heart-healthy fats", "Hydrate well with water!"],
      detections: [
        {
          category: "food",
          name: "Avocado Salad",
          confidence: 94,
          box: [250, 100, 850, 520],
          data: { Calories: "310 kcal", Protein: "12g", Carbs: "12g", Fat: "29g", Fiber: "8g", Sugar: "3g" },
          suggestions: ["Healthy meal choice", "Rich in fiber and heart-healthy fats"]
        },
        {
          category: "food",
          name: "Coca-Cola",
          confidence: 91,
          box: [100, 580, 900, 880],
          data: { Calories: "140 kcal", Protein: "0g", Carbs: "39g", Fat: "0g", Fiber: "0g", Sugar: "39g" },
          suggestions: ["High sugar content, consume in moderation", "Zero nutritional value"]
        }
      ]
    };
  }
  if (mode === "room") {
    return {
      mode: "room", confidence: 85, detected: "Minimalist Workspace", score: 8,
      data: { Style: "Minimalist", Lighting: "Natural", Clutter: "Low" },
      suggestions: ["Great clutter control!", "Natural lighting enhances productivity"],
      detections: [
        {
          category: "room",
          name: "Desk Setup",
          confidence: 88,
          box: [350, 150, 950, 850],
          data: { Style: "Modern", Objects: "4", Clutter: "Low", "Space Usage": "70%" },
          suggestions: ["Keep desk clean", "Ensure ergonomics are correct"]
        },
        {
          category: "room",
          name: "Desk Lamp",
          confidence: 90,
          box: [150, 700, 550, 880],
          data: { Lighting: "Warm White", Status: "On", Power: "8W" },
          suggestions: ["Position lamp to avoid direct screen glare"]
        }
      ]
    };
  }
  return {
    mode: "emotion", confidence: 90, detected: "Human Face & Expression", score: 8.2,
    disclaimer: "Emotion analysis is an AI estimation.",
    data: { "Dominant Emotion": "Happy", Happy: "95%" },
    suggestions: ["Smile detected! Keep up the good vibes."],
    detections: [
      {
        category: "emotion",
        name: "Happy Face",
        confidence: 95,
        box: [150, 300, 800, 700],
        data: { Emotion: "Happy", Happy: "95%", Neutral: "3%", Focused: "2%", "Eye Contact": "88%" },
        suggestions: ["Positive mood detected", "High engagement level"]
      }
    ]
  };
}
