/**
 * Gemini Vision — runs directly in the browser.
 * Set NEXT_PUBLIC_GEMINI_API_KEY in .env.local to enable real AI analysis.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AnalysisResult, DetectionMode, SingleDetection } from "@/hooks/useAICamera";

// Key comes directly from the env variable — set in .env.local
const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY ?? "";


// Clean prompt without JS-style comments (smaller models get confused by them)
function getPromptForMode(forcedMode?: DetectionMode): string {
  let focusInstruction = "";
  if (forcedMode === "food") {
    focusInstruction = `\nCRITICAL: The user has selected FOOD MODE. Prioritize detecting food, beverage, snack, packaging, or ingredients in the frame. If the user is holding an item (e.g., a bottle of cola, snacks, fruit), focus on analyzing that item and return it as the primary detection with nutritional details.`;
  } else if (forcedMode === "emotion") {
    focusInstruction = `\nCRITICAL: The user has selected EMOTION MODE. Prioritize detecting human faces and performing detailed facial expression and emotion analysis.`;
  } else if (forcedMode === "room") {
    focusInstruction = `\nCRITICAL: The user has selected ROOM MODE. Prioritize analyzing the room's interior design, furniture layout, lighting quality, and clutter.`;
  }

  return `You are an expert AI vision system. Analyze this camera frame and identify ALL prominent items from these categories:
1. "food" - any food, beverage, snack, ingredient
2. "face" - human faces with emotion analysis
3. "room" - interior furniture, workspace elements, decoration
${focusInstruction}

Respond with ONLY this JSON structure, no other text:
{
  "detections": [
    {
      "category": "food",
      "name": "Specific item name",
      "confidence": 85,
      "box": [200, 150, 700, 600],
      "details": {
        "calories": "350 kcal",
        "protein": "18g",
        "carbohydrates": "42g",
        "fat": "11g",
        "fiber": "5g",
        "sugar": "6g",
        "health_score": 7.5
      },
      "suggestions": ["tip1", "tip2"]
    }
  ]
}

For face detections use details: dominant_emotion, happy, neutral, focused, eye_contact, confidence_score
For room detections use details: style, lighting, space_usage, clutter, design_score
Box values are normalized 0-1000 (0=top-left corner, 1000=bottom-right corner).
Respond with ONLY valid JSON.`;
}

export async function analyzeFrameWithGemini(base64Jpeg: string, forcedMode?: DetectionMode): Promise<AnalysisResult | null> {
  const promptText = getPromptForMode(forcedMode);

  // No API key → use local pixel-based AI (always works, no network)
  if (!GEMINI_API_KEY) {
    const { analyzeWithLocalAI } = await import("./localVisionAI");
    return analyzeWithLocalAI(base64Jpeg, forcedMode);
  }

  // ── OpenRouter Free Vision Models Support ───────────────────
  if (GEMINI_API_KEY.startsWith("sk-or-")) {
    // Confirmed free vision-capable models on OpenRouter (verified June 2026)
    // Ordered by reliability — the cascade tries each until one succeeds
    const MODELS = [
      "nvidia/nemotron-nano-12b-v2-vl:free",          // dedicated VL model
      "google/gemma-4-31b-it:free",                    // Google Gemma 4 31B
      "google/gemma-4-26b-a4b-it:free",               // Google Gemma 4 26B
      "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free", // Nemotron Omni
      "nex-agi/nex-n2-pro:free",                      // Nex-N2-Pro multimodal
    ];

    const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

    for (let i = 0; i < MODELS.length; i++) {
      const model = MODELS[i];
      // Small back-off between retries to avoid burst rate limits
      if (i > 0) await delay(500);
      try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${GEMINI_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": typeof window !== "undefined" ? window.location.origin : "https://localhost:3000",
            "X-Title": "RealityGPT Vision",
          },
          body: JSON.stringify({
            model,
            max_tokens: 1024,
            messages: [
              {
                role: "user",
                content: [
                  {
                    type: "image_url",
                    image_url: { url: `data:image/jpeg;base64,${base64Jpeg}`, detail: "low" },
                  },
                  { type: "text", text: promptText },
                ],
              },
            ],
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          console.warn(`[OpenRouter:${model}] HTTP ${response.status}:`, errText.slice(0, 200));
          // Always continue to next model on any server-side error
          continue;
        }

        const data = await response.json();
        const text: string = data.choices?.[0]?.message?.content ?? "";
        if (!text) { console.warn(`[OpenRouter:${model}] empty response`); continue; }

        // Robust JSON extraction — strip fences + find outermost {}
        const cleaned = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
        const startIdx = cleaned.indexOf("{");
        const endIdx   = cleaned.lastIndexOf("}");
        if (startIdx === -1 || endIdx < startIdx) { console.warn(`[OpenRouter:${model}] no JSON in response`); continue; }

        const json = JSON.parse(cleaned.slice(startIdx, endIdx + 1));
        return buildResult(json);
      } catch (err) {
        console.warn(`[OpenRouter:${model}] failed:`, err);
        // continue to next model
      }
    }

    // All cloud models failed → fall back to local pixel AI
    console.warn("[OpenRouter] All models failed — using local AI");
    const { analyzeWithLocalAI } = await import("./localVisionAI");
    return analyzeWithLocalAI(base64Jpeg, forcedMode);
  }

  // ── Standard Google Gemini API ─────────────────────────────
  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const imagePart = { inlineData: { data: base64Jpeg, mimeType: "image/jpeg" as const } };
    const response = await model.generateContent([promptText, imagePart]);
    const text = response.response.text().trim();

    // Strip any accidental markdown fences
    const cleaned = text.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();
    const json = JSON.parse(cleaned);

    return buildResult(json);
  } catch (err) {
    console.warn("[Gemini] analysis failed:", err);
    const msg = err instanceof Error ? err.message : String(err);
    const cleanMsg = msg.replace(/^.*?generateContent:\s*/i, "").trim();
    const isQuota = /quota|429/i.test(cleanMsg);
    const isExpired = /expired|invalid/i.test(cleanMsg);
    
    return {
      mode: "unknown",
      confidence: 0,
      detected: isQuota ? "Rate Limit Exceeded" : (isExpired ? "API Key Expired" : "Gemini Error"),
      data: {
        Status: isQuota ? "Quota exceeded (429)" : (isExpired ? "Key Expired (400)" : "API call failed"),
        Details: cleanMsg.slice(0, 120) + (cleanMsg.length > 120 ? "..." : "")
      },
      suggestions: isQuota ? [
        "Please wait 1 minute for the free tier rate limit to reset.",
        "Alternatively, start the local Python backend on port 8000.",
        "Check your API key status at aistudio.google.com"
      ] : [
        "Ensure your API key is correct in .env.local",
        "Check your internet connection",
        "Verify Gemini service status"
      ]
    };
  }
}

function buildResult(j: Record<string, any>): AnalysisResult {
  const detectionsRaw = Array.isArray(j.detections) ? j.detections : [];
  
  const detections: SingleDetection[] = detectionsRaw.map((d: any) => {
    const cat = String(d.category ?? "unknown");
    const name = String(d.name ?? "Object");
    const confidence = Number(d.confidence ?? 70);
    const box: [number, number, number, number] = Array.isArray(d.box) && d.box.length === 4
      ? [Number(d.box[0]), Number(d.box[1]), Number(d.box[2]), Number(d.box[3])]
      : [0, 0, 1000, 1000]; // default full box
    
    const details = d.details ?? {};
    const suggestions = Array.isArray(d.suggestions) ? d.suggestions : [];
    
    // Map details depending on category
    let category: DetectionMode = "unknown";
    const data: Record<string, string | number> = {};
    let score = 7;
    
    if (cat === "food") {
      category = "food";
      score = Number(details.health_score ?? 7);
      data["Calories"] = String(details.calories ?? "—");
      data["Protein"] = String(details.protein ?? "—");
      data["Carbohydrates"] = String(details.carbohydrates ?? "—");
      data["Fat"] = String(details.fat ?? "—");
      data["Fiber"] = String(details.fiber ?? "—");
      data["Sugar"] = String(details.sugar ?? "—");
    } else if (cat === "face" || cat === "emotion") {
      category = "emotion";
      score = Number(details.confidence_score ?? 7);
      data["Dominant Emotion"] = String(details.dominant_emotion ?? "Neutral");
      data["Happy"] = String(details.happy ?? "—");
      data["Neutral"] = String(details.neutral ?? "—");
      data["Focused"] = String(details.focused ?? "—");
      data["Eye Contact"] = String(details.eye_contact ?? "—");
    } else if (cat === "room") {
      category = "room";
      score = Number(details.design_score ?? 7);
      data["Style"] = String(details.style ?? "—");
      data["Lighting"] = String(details.lighting ?? "—");
      data["Space Usage"] = String(details.space_usage ?? "—");
      data["Clutter"] = String(details.clutter ?? "—");
    }
    
    return {
      category,
      name,
      confidence,
      box,
      data,
      suggestions,
      score
    };
  });
  
  // Choose primary detection for compatibility with the dashboard/history
  // Priority: food first, then emotion, then room
  let primary = detections.find(d => d.category === "food");
  if (!primary) primary = detections.find(d => d.category === "emotion");
  if (!primary) primary = detections.find(d => d.category === "room");
  if (!primary) primary = detections[0];
  
  if (primary) {
    return {
      mode: primary.category,
      confidence: primary.confidence,
      detected: detections.map(d => d.name).join(" & "),
      data: primary.data,
      suggestions: primary.suggestions,
      score: primary.score,
      detections
    };
  }
  
  // Default fallback if no detections are found
  return {
    mode: "unknown",
    confidence: 30,
    detected: "Unknown Scene",
    data: { Status: "No clear subject detected" },
    suggestions: ["Move closer", "Point at food, face, or room"],
    detections: []
  };
}
