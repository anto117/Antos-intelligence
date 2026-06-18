/**
 * useWallSegmentation
 *
 * Loads MediaPipe Selfie Segmentation via its CDN WASM files and runs it
 * on a live <video> element every animation frame.
 *
 * Returns a `maskRef` — a Float32Array where:
 *   value ≈ 1.0  → background (wall / ceiling / floor)
 *   value ≈ 0.0  → foreground (person, furniture)
 *
 * The caller can use this mask to restrict canvas painting to wall pixels only.
 */
"use client";

import { useRef, useEffect, useCallback, useState } from "react";

export type SegmentationStatus = "idle" | "loading" | "running" | "error";

interface UseWallSegmentationOptions {
  /** The live <video> element to run segmentation on */
  videoRef: React.RefObject<HTMLVideoElement | null>;
  /** Canvas dimensions (should match the viewport overlay) */
  width: number;
  height: number;
  /** Set false to pause the loop without destroying the model */
  enabled?: boolean;
}

export function useWallSegmentation({
  videoRef,
  width,
  height,
  enabled = true,
}: UseWallSegmentationOptions) {
  const [status, setStatus] = useState<SegmentationStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  // Off-screen canvases / buffers
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const offscreenCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  // Float32 mask — background=1, foreground=0
  const maskRef = useRef<Float32Array | null>(null);
  const segmentorRef = useRef<any>(null);
  const rafRef = useRef<number>(0);
  const mountedRef = useRef(true);

  // ── Initialise MediaPipe ───────────────────────────────────────────────
  useEffect(() => {
    mountedRef.current = true;
    if (!enabled) return;

    let cancelled = false;
    setStatus("loading");

    async function init() {
      try {
        // Dynamic import — keeps the heavy WASM out of the initial bundle
        const { SelfieSegmentation } = await import(
          "@mediapipe/selfie_segmentation"
        );

        if (cancelled || !mountedRef.current) return;

        const segmentor = new SelfieSegmentation({
          locateFile: (file: string) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`,
        });

        segmentor.setOptions({
          modelSelection: 1, // 1 = landscape model (better for rooms)
          selfieMode: false,
        });

        segmentor.onResults((results: any) => {
          if (!mountedRef.current) return;
          const seg: ImageData = results.segmentationMask;
          if (!seg) return;

          // Build a Float32 mask from the RGBA segmentation output.
          // MediaPipe encodes confidence in the Red channel:
          //   R=255 → foreground (person), R=0 → background (wall)
          // We INVERT so wall=1, person=0 for easy thresholding later.
          const px = seg.data; // Uint8ClampedArray, RGBA
          const len = seg.width * seg.height;
          if (!maskRef.current || maskRef.current.length !== len) {
            maskRef.current = new Float32Array(len);
          }
          for (let i = 0; i < len; i++) {
            // R channel; 255 = person → inverted = wall=0, person=1
            // We want wall=1 so: wallMask = 1 - (R/255)
            maskRef.current[i] = 1 - px[i * 4] / 255;
          }
        });

        await segmentor.initialize();
        if (cancelled || !mountedRef.current) {
          segmentor.close();
          return;
        }

        segmentorRef.current = segmentor;

        // Create persistent off-screen canvas
        const oc = document.createElement("canvas");
        oc.width = 256; // MediaPipe input size
        oc.height = 144;
        offscreenCanvasRef.current = oc;
        offscreenCtxRef.current = oc.getContext("2d");

        setStatus("running");
        tick();
      } catch (err) {
        if (!mountedRef.current) return;
        const msg = err instanceof Error ? err.message : String(err);
        setError(msg);
        setStatus("error");
      }
    }

    async function tick() {
      if (!mountedRef.current || cancelled) return;
      const video = videoRef.current;
      const ctx = offscreenCtxRef.current;
      const canvas = offscreenCanvasRef.current;
      const segmentor = segmentorRef.current;

      if (
        video &&
        ctx &&
        canvas &&
        segmentor &&
        video.readyState >= 2 &&
        !video.paused
      ) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        try {
          await segmentor.send({ image: canvas });
        } catch {
          /* ignore transient errors */
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    init();

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
      if (segmentorRef.current) {
        try { segmentorRef.current.close(); } catch { /* ignore */ }
        segmentorRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  useEffect(() => {
    return () => { mountedRef.current = false; };
  }, []);

  return { maskRef, status, error };
}
