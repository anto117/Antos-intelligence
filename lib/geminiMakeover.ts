/**
 * geminiMakeover.ts — Client-side Gemini 1.5 Pro call specifically for
 * the AR Room Makeover feature.  Mirrors the backend MakeoverService but
 * runs entirely in the browser when the Python API is unavailable.
 */

import type { MakeoverResult } from "@/hooks/useRoomMakeover";

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY ?? "";

// ── System prompt (kept in sync with backend MakeoverService) ─────────────
const MAKEOVER_PROMPT = `You are an elite interior designer AI specialising in bedroom transformations.
Analyse the bedroom image and return a SINGLE valid JSON object — no markdown, no explanation.

The JSON MUST follow this exact schema:
{
  "room_style": "<detected current style>",
  "wall_color": "<best new wall paint hex e.g. #D4B896>",
  "wall_color_name": "<friendly name e.g. Warm Sandstone>",
  "lighting": [
    {
      "id": "light_1",
      "type": "<fixture type>",
      "placement": "<short human description>",
      "x_pct": <0-100 float — horizontal % on image>,
      "y_pct": <0-100 float — vertical % on image>,
      "color_temp": "<e.g. 2700K Warm White>",
      "why": "<one sentence reason>"
    }
  ],
  "curtains": {
    "color": "<hex>",
    "color_name": "<name>",
    "style": "<e.g. Linen Blackout>",
    "placement": "<window description>",
    "x_pct": <0-100>,
    "y_pct": <0-100>,
    "why": "<one sentence>"
  },
  "bed_arrangement": {
    "suggestion": "<clear move instruction>",
    "x_pct": <0-100>,
    "y_pct": <0-100>,
    "why": "<one sentence>"
  },
  "accent_piece": {
    "name": "<e.g. Oval Rattan Mirror>",
    "placement": "<where>",
    "x_pct": <0-100>,
    "y_pct": <0-100>,
    "why": "<one sentence>"
  },
  "overall_vibe": "<2-3 sentence summary of the transformed look>"
}

CRITICAL RULES:
- If NO window or curtains are visible in the image, you MUST set "curtains" to null.
- If NO bed is visible in the image, you MUST set "bed_arrangement" to null.
- If NO accent piece is recommended, you MUST set "accent_piece" to null.

Respond with ONLY the JSON. Start with '{' and end with '}'.`;



// ── Demo / mock result (used when no API key is present) ──────────────────
export const DEMO_MAKEOVER: MakeoverResult = {
  room_style: "Transitional",
  wall_color: "#C8B99A",
  wall_color_name: "Warm Linen",
  lighting: [
    {
      id: "light_1",
      type: "Warm LED Strip",
      placement: "Along ceiling cornice above the headboard",
      x_pct: 50,
      y_pct: 10,
      color_temp: "2700K Warm White",
      why: "Creates a soft halo that defines the sleeping zone.",
    },
    {
      id: "light_2",
      type: "Bedside Arc Floor Lamp",
      placement: "Left side of the bed, angled over mattress",
      x_pct: 20,
      y_pct: 58,
      color_temp: "3000K Neutral Warm",
      why: "Focused reading light without harsh overhead glare.",
    },
  ],
  curtains: {
    color: "#8B6F5E",
    color_name: "Dusty Mocha",
    style: "Linen Blackout Drapes with Brass Rings",
    placement: "Full-height window on the right wall",
    x_pct: 82,
    y_pct: 35,
    why: "Anchors the room with warmth and blocks morning light.",
  },
  bed_arrangement: {
    suggestion:
      "Centre the bed on the longest wall, pull 40 cm from wall for airflow and bedside tables on both sides.",
    x_pct: 50,
    y_pct: 65,
    why: "Centring creates visual symmetry and improves energy flow.",
  },
  accent_piece: {
    name: "Neon Hexagon Light Panel",
    placement: "Above the dresser on the facing wall",
    x_pct: 30,
    y_pct: 30,
    why: "Provides dynamic modular lighting to complement the modern aesthetics.",
  },
  overall_vibe:
    "The redesigned bedroom embraces a warm Scandinavian-Boho fusion. Earthy linens, soft amber lighting, and rattan accents create a sanctuary that feels both grounded and airy — the kind of room you never want to leave.",
};


// ── Gemini API call ───────────────────────────────────────────────────────
export async function analyzeRoomMakeover(
  base64Jpeg: string
): Promise<MakeoverResult | null> {
  // No API key → use local pixel AI immediately (zero network calls)
  if (!GEMINI_API_KEY) {
    const { analyzeRoomWithLocalAI } = await import("./localMakeoverAI");
    return analyzeRoomWithLocalAI(base64Jpeg);
  }

  // ── OpenRouter free models (cascade) ───────────────────────────────────
  if (GEMINI_API_KEY.startsWith("sk-or-")) {
    // Confirmed free vision-capable models on OpenRouter (verified June 2026)
    const MODELS = [
      "nvidia/nemotron-nano-12b-v2-vl:free",           // dedicated VL model
      "google/gemma-4-31b-it:free",                     // Google Gemma 4 31B
      "google/gemma-4-26b-a4b-it:free",                // Google Gemma 4 26B
      "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free", // Nemotron Omni
      "nex-agi/nex-n2-pro:free",                       // Nex-N2-Pro multimodal
    ];
    const delay = (ms: number) => new Promise(r => setTimeout(r, ms));
    for (let i = 0; i < MODELS.length; i++) {
      const model = MODELS[i];
      if (i > 0) await delay(500); // back-off between retries
      try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${GEMINI_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": typeof window !== "undefined" ? window.location.origin : "https://localhost:3000",
            "X-Title": "RealityGPT Makeover",
          },
          body: JSON.stringify({
            model,
            max_tokens: 1200,
            messages: [{
              role: "user",
              content: [
                { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64Jpeg}`, detail: "low" } },
                { type: "text", text: MAKEOVER_PROMPT },
              ],
            }],
          }),
        });
        if (!response.ok) {
          const errText = await response.text();
          console.warn(`[OpenRouter Makeover:${model}] HTTP ${response.status}:`, errText.slice(0, 200));
          continue; // always try next model on any error
        }
        const data = await response.json();
        const text: string = data.choices?.[0]?.message?.content ?? "";
        if (!text) { console.warn(`[OpenRouter Makeover:${model}] empty response`); continue; }
        const result = parseJson(text);
        if (result) return result;
        console.warn(`[OpenRouter Makeover:${model}] JSON parse failed`);
      } catch (err) {
        console.warn(`[OpenRouter Makeover:${model}] failed:`, err);
      }
    }
    // All cloud models failed → use local pixel AI
    console.warn("[OpenRouter Makeover] All models failed — using local AI");
    const { analyzeRoomWithLocalAI } = await import("./localMakeoverAI");
    return analyzeRoomWithLocalAI(base64Jpeg);
  }

  // ── Standard Google Gemini ─────────────────────────────────────────────
  try {
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
      systemInstruction: MAKEOVER_PROMPT,
    });

    const imagePart = {
      inlineData: { data: base64Jpeg, mimeType: "image/jpeg" as const },
    };
    const response = await model.generateContent([
      "Analyse this bedroom and return the redesign JSON.",
      imagePart,
    ]);
    const text = response.response.text().trim();
    return parseJson(text);
  } catch (err) {
    console.warn("[Gemini Makeover] failed — using local AI:", err);
    const { analyzeRoomWithLocalAI } = await import("./localMakeoverAI");
    return analyzeRoomWithLocalAI(base64Jpeg);
  }
}

// ── Helper ─────────────────────────────────────────────────────────────────
function parseJson(raw: string): MakeoverResult | null {
  try {
    const cleaned = raw
      .replace(/^```json\s*/i, "")
      .replace(/\s*```$/, "")
      .trim();
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}") + 1;
    if (start === -1 || end === 0) return null;
    const parsed = JSON.parse(cleaned.slice(start, end));
    // Basic validation
    if (!parsed.wall_color || !parsed.lighting)
      return null;
    return parsed as MakeoverResult;
  } catch {
    return null;
  }
}
