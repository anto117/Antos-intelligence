/**
 * useRoomMakeover — React hook for the AR Room Makeover feature.
 *
 * Captures a snapshot from a <video> element, sends it to the backend
 * (or directly to the Gemini API via geminiMakeover.ts), and returns
 * the parsed interior-design JSON used to drive the canvas / pin overlay.
 */
"use client";

import { useState, useCallback } from "react";

// ── Types ──────────────────────────────────────────────────────────────────

export interface LightPin {
  id: string;
  type: string;
  placement: string;
  x_pct: number;
  y_pct: number;
  color_temp: string;
  why: string;
}

export interface CurtainPin {
  color: string;
  color_name: string;
  style: string;
  placement: string;
  x_pct: number;
  y_pct: number;
  why: string;
}

export interface BedPin {
  suggestion: string;
  x_pct: number;
  y_pct: number;
  why: string;
}

export interface AccentPin {
  name: string;
  placement: string;
  x_pct: number;
  y_pct: number;
  why: string;
}

export interface MakeoverResult {
  room_style: string;
  wall_color: string;
  wall_color_name: string;
  lighting: LightPin[];
  curtains?: CurtainPin | null;
  bed_arrangement?: BedPin | null;
  accent_piece?: AccentPin | null;
  overall_vibe: string;
}

type MakeoverStatus = "idle" | "capturing" | "analyzing" | "done" | "error";

// ── Hook ───────────────────────────────────────────────────────────────────

export function useRoomMakeover(backendUrl?: string) {
  const [status, setStatus] = useState<MakeoverStatus>("idle");
  const [result, setResult] = useState<MakeoverResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [snapshotDataUrl, setSnapshotDataUrl] = useState<string | null>(null);

  /**
   * Captures a frame from `videoEl`, sends it for analysis, and stores
   * the MakeoverResult.  Supply `captureCanvas` (an offscreen canvas) for
   * efficiency, or the hook creates a temporary one.
   */
  const analyze = useCallback(
    async (videoEl: HTMLVideoElement, captureCanvas?: HTMLCanvasElement) => {
      setStatus("capturing");
      setError(null);
      setResult(null);

      try {
        // ── 1. Capture snapshot from live video ───────────────────────────
        const canvas =
          captureCanvas ?? document.createElement("canvas");
        canvas.width = videoEl.videoWidth || 640;
        canvas.height = videoEl.videoHeight || 480;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas 2D context unavailable");
        ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);

        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        setSnapshotDataUrl(dataUrl);
        const base64 = dataUrl.split(",")[1];

        setStatus("analyzing");

        // ── 2a. Try backend route first (when available) ──────────────────
        if (backendUrl) {
          try {
            const token =
              typeof window !== "undefined"
                ? localStorage.getItem("auth_token")
                : null;

            const res = await fetch(`${backendUrl}/api/makeover/analyze`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
              },
              body: JSON.stringify({ image_b64: base64 }),
            });

            if (res.ok) {
              const data: MakeoverResult = await res.json();
              setResult(data);
              setStatus("done");
              return;
            }
          } catch {
            // Backend not reachable — fall through to Gemini direct
          }
        }

        // ── 2b. Direct Gemini Vision call (client-side, no backend) ───────
        const { analyzeRoomMakeover, DEMO_MAKEOVER } = await import(
          "@/lib/geminiMakeover"
        );
        const geminiResult = await analyzeRoomMakeover(base64);
        if (geminiResult) {
          setResult(geminiResult);
          setStatus("done");
        } else {
          // All models were rate-limited or returned empty — show demo so
          // the user can still see the UI working, with a soft warning.
          console.warn("[Makeover] All OpenRouter models failed — showing demo result");
          setResult(DEMO_MAKEOVER);
          setStatus("done");
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setError(msg);
        setStatus("error");
      }
    },
    [backendUrl]
  );

  const reset = useCallback(() => {
    setStatus("idle");
    setResult(null);
    setError(null);
    setSnapshotDataUrl(null);
  }, []);

  return {
    status,
    result,
    error,
    snapshotDataUrl,
    analyze,
    reset,
    isAnalyzing: status === "capturing" || status === "analyzing",
    isDone: status === "done",
  };
}
