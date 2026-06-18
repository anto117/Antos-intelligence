"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import type Matter from "matter-js";

// ── Types ────────────────────────────────────────────────────────────────────

export interface WandPin {
  id: string;
  x_pct: number;
  y_pct: number;
  label: string;
  color: string;
}

export interface Wand {
  tip: { x: number; y: number };
  base: { x: number; y: number };
}

export interface WandModeOptions {
  /** Live video element to track hands from */
  videoRef: React.RefObject<HTMLVideoElement | null>;
  /** Overlay canvas to paint stick + physics debug */
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  /** Viewport dims so we can convert % → px */
  viewportWidth: number;
  viewportHeight: number;
  /** AR pins to collide with */
  pins: WandPin[];
  /** Whether wand mode is on */
  enabled: boolean;
  /** Which camera is active — flips X coords to match mirrored video */
  facingMode?: "user" | "environment";
}

export interface WandModeState {
  wands: Wand[];
  /** Tip of the "wand" in viewport px, or null */
  stickTip: { x: number; y: number } | null;
  /** Base (thumb) of the wand */
  stickBase: { x: number; y: number } | null;
  /** Ragdoll positions for pins after being smacked */
  ragdollPositions: Record<string, { x: number; y: number; angle: number }>;
  /** true once MediaPipe loaded */
  ready: boolean;
}

// ── Tiny vector helpers ───────────────────────────────────────────────────────
function dist(ax: number, ay: number, bx: number, by: number) {
  return Math.hypot(bx - ax, by - ay);
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useWandMode({
  videoRef,
  canvasRef,
  viewportWidth,
  viewportHeight,
  pins,
  enabled,
  facingMode = "environment",
}: WandModeOptions): WandModeState {
  const [ready, setReady] = useState(false);
  const [wands, setWands] = useState<Wand[]>([]);
  const [stickTip, setStickTip] = useState<{ x: number; y: number } | null>(null);
  const [stickBase, setStickBase] = useState<{ x: number; y: number } | null>(null);
  const [ragdollPositions, setRagdollPositions] = useState<
    Record<string, { x: number; y: number; angle: number }>
  >({});

  // Internal refs — avoid re-render churn on every frame
  const handsRef = useRef<unknown>(null);
  const matterRef = useRef<typeof Matter | null>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const worldRef = useRef<Matter.World | null>(null);
  const stickBodiesRef = useRef<Matter.Body[]>([]);
  const pinBodiesRef = useRef<Record<string, Matter.Body>>({});
  const rafRef = useRef<number>(0);
  const prevSticksRef = useRef<Array<{ x: number; y: number } | null>>([null, null]);
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  const wRef = useRef(viewportWidth);
  const hRef = useRef(viewportHeight);
  const facingModeRef = useRef<"user" | "environment">(facingMode);
  useEffect(() => {
    wRef.current = viewportWidth;
    hRef.current = viewportHeight;
    facingModeRef.current = facingMode;
  }, [viewportWidth, viewportHeight, facingMode]);

  // ── Load MediaPipe Hands from CDN once ─────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (handsRef.current) return;

    const loadScript = (src: string) =>
      new Promise<void>((res, rej) => {
        if (document.querySelector(`script[src="${src}"]`)) { res(); return; }
        const s = document.createElement("script");
        s.src = src; s.crossOrigin = "anonymous";
        s.onload = () => res();
        s.onerror = rej;
        document.head.appendChild(s);
      });

    (async () => {
      try {
        await loadScript(
          "https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js"
        );
        await loadScript(
          "https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js"
        );

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const MP = (window as any);
        if (!MP.Hands) return;

        const hands = new MP.Hands({
          locateFile: (f: string) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}`,
        });
        hands.setOptions({
          maxNumHands: 2,          // Support up to 2 hands!
          modelComplexity: 0,      // 0 = fastest (lite model)
          minDetectionConfidence: 0.6,
          minTrackingConfidence: 0.5,
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        hands.onResults((results: any) => {
          if (!enabledRef.current) return;
          const landmarksList = results.multiHandLandmarks || [];
          
          const newWands: Wand[] = [];
          for (let i = 0; i < Math.min(landmarksList.length, 2); i++) {
            const lm = landmarksList[i];
            if (!lm || !lm[0] || !lm[9]) continue;

            const wrist = lm[0];
            const mcp = lm[9];

            // MediaPipe uses normalised [0,1] coords.
            // When using the front (selfie) camera, the video is CSS-mirrored
            // with scaleX(-1), so we must flip X to match the visual display.
            const flipX = facingModeRef.current === "user";
            const rawWristX = flipX ? (1 - wrist.x) : wrist.x;
            const rawMcpX   = flipX ? (1 - mcp.x)   : mcp.x;

            const wristX = rawWristX * wRef.current;
            const wristY = wrist.y   * hRef.current;
            const mcpX   = rawMcpX   * wRef.current;
            const mcpY   = mcp.y     * hRef.current;

            // Angle points from wrist to knuckles (hand direction)
            const angle = Math.atan2(mcpY - wristY, mcpX - wristX);
            const stickLength = 220;
            const handleOffset = 45;

            const base = {
              x: mcpX - Math.cos(angle) * handleOffset,
              y: mcpY - Math.sin(angle) * handleOffset,
            };
            const tip = {
              x: mcpX + Math.cos(angle) * (stickLength - handleOffset),
              y: mcpY + Math.sin(angle) * (stickLength - handleOffset),
            };

            newWands.push({ tip, base });
          }

          setWands(newWands);
          
          // Backwards compatibility for single wand variables
          if (newWands.length > 0) {
            setStickTip(newWands[0].tip);
            setStickBase(newWands[0].base);
          } else {
            setStickTip(null);
            setStickBase(null);
          }

          updateStickBodies(newWands);
        });

        handsRef.current = hands;
        setReady(true);
      } catch (e) {
        console.warn("[WandMode] MediaPipe load failed:", e);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Load Matter.js from CDN once ───────────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (matterRef.current) return;

    import("matter-js").then((M) => {
      matterRef.current = M.default ?? M as unknown as typeof Matter;
      bootstrapPhysics();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Bootstrap physics world ────────────────────────────────────────────────
  const bootstrapPhysics = useCallback(() => {
    const M = matterRef.current;
    if (!M || engineRef.current) return;

    const engine = M.Engine.create({ gravity: { y: 0.6 } });
    const world = engine.world;
    engineRef.current = engine;
    worldRef.current = world;

    // Invisible floor & walls
    const w = viewportWidth || 800;
    const h = viewportHeight || 600;
    const walls = [
      M.Bodies.rectangle(w / 2, h + 40, w + 100, 80, { isStatic: true }),
      M.Bodies.rectangle(w / 2, -40, w + 100, 80, { isStatic: true }),
      M.Bodies.rectangle(-40, h / 2, 80, h + 100, { isStatic: true }),
      M.Bodies.rectangle(w + 40, h / 2, 80, h + 100, { isStatic: true }),
    ];
    M.World.add(world, walls);

    // Create a body per pin
    const bodies: Record<string, Matter.Body> = {};
    pins.forEach((pin) => {
      const x = (pin.x_pct / 100) * w;
      const y = (pin.y_pct / 100) * h;
      const body = M.Bodies.circle(x, y, 28, {
        restitution: 0.72,
        friction: 0.3,
        frictionAir: 0.04,
        density: 0.002,
        label: pin.id,
      });
      bodies[pin.id] = body;
      M.World.add(world, body);
    });
    pinBodiesRef.current = bodies;

    // Two stick bodies for 2 wands (kinematic — we move them manually, default off-screen)
    const stick1 = M.Bodies.rectangle(-9999, -9999, 220, 14, {
      isStatic: true,
      isSensor: false,
      label: "__wand_1__",
      restitution: 0.85,
      friction: 0.1,
    });
    const stick2 = M.Bodies.rectangle(-9999, -9999, 220, 14, {
      isStatic: true,
      isSensor: false,
      label: "__wand_2__",
      restitution: 0.85,
      friction: 0.1,
    });
    stickBodiesRef.current = [stick1, stick2];
    M.World.add(world, [stick1, stick2]);

    // Physics tick — capture M so TS knows it's non-null inside closure
    const Mcap = M;
    function tick() {
      if (!engineRef.current) return;
      Mcap.Engine.update(engineRef.current, 1000 / 60);

      // Sync ragdoll positions to state
      const newPos: Record<string, { x: number; y: number; angle: number }> = {};
      Object.entries(pinBodiesRef.current).forEach(([id, body]) => {
        newPos[id] = { x: body.position.x, y: body.position.y, angle: body.angle };
      });
      setRagdollPositions(newPos);
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
  }, [pins, viewportWidth, viewportHeight]);

  // ── Update stick bodies position (called from MediaPipe results) ───────────
  const updateStickBodies = useCallback((
    detectedWands: Wand[]
  ) => {
    const M = matterRef.current;
    if (!M) return;

    for (let i = 0; i < 2; i++) {
      const stick = stickBodiesRef.current[i];
      if (!stick) continue;

      const wand = detectedWands[i];
      if (!wand) {
        // Move offscreen if wand not detected
        M.Body.setPosition(stick, { x: -9999, y: -9999 });
        prevSticksRef.current[i] = null;
        continue;
      }

      const { tip, base } = wand;
      const cx = (tip.x + base.x) / 2;
      const cy = (tip.y + base.y) / 2;
      const angle = Math.atan2(tip.y - base.y, tip.x - base.x);

      // Fixed length wand
      const stickLength = 220;
      const handleOffset = 45;
      const bodyCx = cx + Math.cos(angle) * (stickLength / 2 - handleOffset);
      const bodyCy = cy + Math.sin(angle) * (stickLength / 2 - handleOffset);

      // Velocity from previous frame → gives physics bodies a kick
      const prev = prevSticksRef.current[i];
      if (prev) {
        const vx = (bodyCx - prev.x) * 0.8;
        const vy = (bodyCy - prev.y) * 0.8;
        M.Body.setVelocity(stick, { x: vx, y: vy });
      }
      prevSticksRef.current[i] = { x: bodyCx, y: bodyCy };

      M.Body.setPosition(stick, { x: bodyCx, y: bodyCy });
      M.Body.setAngle(stick, angle);
    }
  }, []);

  // ── Start the MediaPipe camera loop ───────────────────────────────────────
  useEffect(() => {
    if (!enabled || !ready || typeof window === "undefined") return;
    const video = videoRef.current;
    if (!video) return;

    let active = true;
    let isProcessing = false;
    const hands = handsRef.current;
    if (!hands) return;

    let lastTime = 0;
    const processFrame = async (now: number) => {
      if (!active) return;
      if (now - lastTime >= 40) { // Limit to 25 FPS
        if (video.readyState >= 2 && !video.paused && !isProcessing) {
          isProcessing = true;
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (hands as any).send({ image: video });
            lastTime = now;
          } catch (err) {
            console.error("[WandMode] Error processing frame:", err);
          } finally {
            isProcessing = false;
          }
        }
      }
      requestAnimationFrame(processFrame);
    };

    requestAnimationFrame(processFrame);

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ready]);

  // ── Tear down physics on disable ──────────────────────────────────────────
  useEffect(() => {
    if (!enabled) {
      cancelAnimationFrame(rafRef.current);
      const M = matterRef.current;
      if (M && engineRef.current) {
        M.Engine.clear(engineRef.current);
        engineRef.current = null;
        worldRef.current = null;
        stickBodiesRef.current = [];
      }
      setWands([]);
      setStickTip(null);
      setStickBase(null);
      setRagdollPositions(prev => Object.keys(prev).length === 0 ? prev : {});
    } else if (matterRef.current && !engineRef.current) {
      bootstrapPhysics();
    }
  }, [enabled, bootstrapPhysics]);

  // ── Cleanup on unmount ────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return { wands, stickTip, stickBase, ragdollPositions, ready };
}
