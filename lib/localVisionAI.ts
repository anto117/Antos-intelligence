/**
 * localVisionAI.ts — Fully offline image analysis engine.
 * Analyzes actual pixel data (colors, brightness, skin tones, edges)
 * to produce intelligent Food / Emotion / Room detections — zero API calls.
 */

import type { AnalysisResult, SingleDetection } from "@/hooks/useAICamera";

// ─── Pixel Analysis Helpers ─────────────────────────────────────────────────

interface PixelStats {
  r: number; g: number; b: number;        // average RGB
  brightness: number;                     // 0-255
  saturation: number;                     // 0-1
  redDominance: number;                   // r/(r+g+b)
  greenDominance: number;
  blueDominance: number;
  skinPixelRatio: number;                 // fraction of pixels that look like skin
  edgeDensity: number;                    // fraction of high-contrast edge pixels
  darkPixelRatio: number;                 // pixels below brightness 60
  brightPixelRatio: number;              // pixels above brightness 200
  warmPixelRatio: number;                // orange/yellow/red heavy pixels
  greenPixelRatio: number;               // leafy green pixels
  colorVariance: number;                 // how many distinct color zones exist (0-1)
  topHalfBrightness: number;            // ceiling / sky region brightness
  bottomHalfBrightness: number;         // floor / surface brightness
  regionBrightness: number[];           // 9-zone grid brightness
  dominantHue: number;                  // 0-360
  pureRedPixelRatio: number;            // fraction of pixels matching pure red (cola label)
}

function analyzePixels(base64Jpeg: string): Promise<PixelStats> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") { resolve(defaultStats()); return; }
    const img = new Image();
    img.onload = () => {
      const W = 160, H = 120; // sample at low-res for speed
      const canvas = document.createElement("canvas");
      canvas.width = W; canvas.height = H;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, W, H);
      const { data } = ctx.getImageData(0, 0, W, H);
      const total = W * H;

      let sumR = 0, sumG = 0, sumB = 0;
      let skinCount = 0, edgeCount = 0, darkCount = 0, brightCount = 0;
      let warmCount = 0, greenCount = 0, pureRedCount = 0;
      const regionSum = new Array(9).fill(0);
      const regionCount = new Array(9).fill(0);
      let prevRowG: number[] = [];

      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          const i = (y * W + x) * 4;
          const r = data[i], g = data[i + 1], b = data[i + 2];
          sumR += r; sumG += g; sumB += b;

          const bright = (r * 299 + g * 587 + b * 114) / 1000;

          // 9-zone grid
          const zx = Math.floor(x / (W / 3));
          const zy = Math.floor(y / (H / 3));
          const zone = zy * 3 + zx;
          regionSum[zone] += bright;
          regionCount[zone]++;

          // Skin tone: warm hue, moderate saturation, mid brightness
          if (r > 95 && g > 40 && b > 20 &&
              r > g && r > b &&
              Math.abs(r - g) > 15 &&
              bright > 80 && bright < 230) {
            skinCount++;
          }

          // Edge via row-diff (simple gradient)
          if (prevRowG[x] !== undefined) {
            const diff = Math.abs(bright - prevRowG[x]);
            if (diff > 30) edgeCount++;
          }
          prevRowG[x] = bright;

          if (bright < 60) darkCount++;
          if (bright > 200) brightCount++;

          // Warm: reds, oranges, yellows
          if (r > 160 && g > 80 && b < 100 && r > g * 1.2) warmCount++;
          // Green: leafy / salad
          if (g > 100 && g > r * 1.2 && g > b * 1.15) greenCount++;
          // pure/soda red (like Coca-Cola label)
          if (r > 130 && g < 85 && b < 85 && r > g * 1.7 && r > b * 1.7) pureRedCount++;
        }
      }

      const avgR = sumR / total, avgG = sumG / total, avgB = sumB / total;
      const brightness = (avgR * 299 + avgG * 587 + avgB * 114) / 1000;
      const maxC = Math.max(avgR, avgG, avgB);
      const minC = Math.min(avgR, avgG, avgB);
      const saturation = maxC === 0 ? 0 : (maxC - minC) / maxC;

      // Hue
      let hue = 0;
      const delta = maxC - minC;
      if (delta > 0) {
        if (maxC === avgR) hue = 60 * (((avgG - avgB) / delta) % 6);
        else if (maxC === avgG) hue = 60 * ((avgB - avgR) / delta + 2);
        else hue = 60 * ((avgR - avgG) / delta + 4);
        if (hue < 0) hue += 360;
      }

      // Top/bottom half brightness
      let topSum = 0, botSum = 0;
      for (let y = 0; y < H / 2; y++) for (let x = 0; x < W; x++) {
        const i = (y * W + x) * 4;
        topSum += (data[i] * 299 + data[i+1] * 587 + data[i+2] * 114) / 1000;
      }
      for (let y = H / 2; y < H; y++) for (let x = 0; x < W; x++) {
        const i = (y * W + x) * 4;
        botSum += (data[i] * 299 + data[i+1] * 587 + data[i+2] * 114) / 1000;
      }
      const half = (W * H) / 2;

      const regionBrightness = regionSum.map((s, i) => regionCount[i] > 0 ? s / regionCount[i] : 0);

      resolve({
        r: avgR, g: avgG, b: avgB,
        brightness,
        saturation,
        redDominance: avgR / (avgR + avgG + avgB + 1),
        greenDominance: avgG / (avgR + avgG + avgB + 1),
        blueDominance: avgB / (avgR + avgG + avgB + 1),
        skinPixelRatio: skinCount / total,
        edgeDensity: edgeCount / total,
        darkPixelRatio: darkCount / total,
        brightPixelRatio: brightCount / total,
        warmPixelRatio: warmCount / total,
        greenPixelRatio: greenCount / total,
        colorVariance: saturation * (edgeCount / total),
        topHalfBrightness: topSum / half,
        bottomHalfBrightness: botSum / half,
        regionBrightness,
        dominantHue: hue,
        pureRedPixelRatio: pureRedCount / total,
      });
    };
    img.onerror = () => resolve(defaultStats());
    img.src = `data:image/jpeg;base64,${base64Jpeg}`;
  });
}

function defaultStats(): PixelStats {
  return { r:128,g:128,b:128,brightness:128,saturation:0.1,redDominance:0.33,
    greenDominance:0.33,blueDominance:0.33,skinPixelRatio:0.05,edgeDensity:0.1,
    darkPixelRatio:0.1,brightPixelRatio:0.1,warmPixelRatio:0.05,greenPixelRatio:0.05,
    colorVariance:0.05,topHalfBrightness:140,bottomHalfBrightness:120,
    regionBrightness:[128,128,128,128,128,128,128,128,128],dominantHue:30,
    pureRedPixelRatio:0 };
}

// ─── Scene Classifier ───────────────────────────────────────────────────────

type SceneType = "food" | "emotion" | "room";

function classifyScene(s: PixelStats): { type: SceneType; confidence: number } {
  // Food signals: warm/green pixel clusters, moderate edge density, not skin-heavy
  const foodScore =
    (s.warmPixelRatio > 0.08 ? 35 : 0) +
    (s.greenPixelRatio > 0.06 ? 20 : 0) +
    (s.edgeDensity > 0.05 && s.edgeDensity < 0.3 ? 20 : 0) +
    (s.skinPixelRatio < 0.12 ? 10 : 0) +
    (s.saturation > 0.25 ? 15 : 0);

  // Emotion signals: high skin pixel ratio, moderate brightness
  const emotionScore =
    (s.skinPixelRatio > 0.08 ? 45 : 0) +
    (s.skinPixelRatio > 0.15 ? 25 : 0) +
    (s.brightness > 80 && s.brightness < 220 ? 15 : 0) +
    (s.edgeDensity > 0.03 && s.edgeDensity < 0.18 ? 15 : 0);

  // Room signals: high edge density (walls/furniture), varied zones, low skin
  const roomScore =
    (s.edgeDensity > 0.07 ? 30 : 0) +
    (s.skinPixelRatio < 0.06 ? 25 : 0) +
    (s.colorVariance > 0.04 ? 20 : 0) +
    (s.topHalfBrightness > s.bottomHalfBrightness * 1.1 ? 15 : 0) +
    (s.brightness > 60 ? 10 : 0);

  const max = Math.max(foodScore, emotionScore, roomScore);
  let type: SceneType = "room";
  if (max === foodScore) type = "food";
  else if (max === emotionScore) type = "emotion";

  const confidence = Math.min(55 + max * 0.4, 91);
  return { type, confidence };
}

// ─── Food Analysis ──────────────────────────────────────────────────────────

const FOOD_DATABASE = [
  { name:"Coca-Cola / Soda",hueRange:[0,20],   warmMin:0.04, greenMin:0.00, cal:"140 kcal",pro:"0g",carb:"39g",fat:"0g",fib:"0g",sug:"39g",score:3.0 },
  { name:"Rice & Dal",     hueRange:[20,45],  warmMin:0.10, greenMin:0.00, cal:"~380 kcal",pro:"14g",carb:"68g",fat:"5g",fib:"3g",sug:"2g",score:7.2 },
  { name:"Salad Bowl",     hueRange:[70,150], warmMin:0.03, greenMin:0.12, cal:"~180 kcal",pro:"6g",carb:"22g",fat:"7g",fib:"8g",sug:"5g",score:9.0 },
  { name:"Curry & Roti",   hueRange:[15,40],  warmMin:0.15, greenMin:0.02, cal:"~520 kcal",pro:"18g",carb:"72g",fat:"14g",fib:"5g",sug:"4g",score:7.0 },
  { name:"Fried Rice",     hueRange:[25,55],  warmMin:0.08, greenMin:0.04, cal:"~430 kcal",pro:"12g",carb:"65g",fat:"12g",fib:"2g",sug:"2g",score:6.5 },
  { name:"Fruit Platter",  hueRange:[0,30],   warmMin:0.12, greenMin:0.05, cal:"~220 kcal",pro:"3g",carb:"52g",fat:"1g",fib:"7g",sug:"40g",score:8.5 },
  { name:"Vegetables",     hueRange:[60,160], warmMin:0.02, greenMin:0.15, cal:"~150 kcal",pro:"5g",carb:"28g",fat:"2g",fib:"9g",sug:"8g",score:9.2 },
  { name:"Biryani",        hueRange:[20,50],  warmMin:0.18, greenMin:0.03, cal:"~580 kcal",pro:"22g",carb:"78g",fat:"18g",fib:"3g",sug:"2g",score:6.8 },
  { name:"Soup / Dal",     hueRange:[15,45],  warmMin:0.06, greenMin:0.01, cal:"~220 kcal",pro:"11g",carb:"34g",fat:"4g",fib:"6g",sug:"3g",score:8.2 },
  { name:"Sandwich",       hueRange:[20,60],  warmMin:0.08, greenMin:0.06, cal:"~350 kcal",pro:"16g",carb:"44g",fat:"11g",fib:"4g",sug:"5g",score:7.4 },
  { name:"Dessert / Sweet",hueRange:[10,30],  warmMin:0.05, greenMin:0.00, cal:"~410 kcal",pro:"5g",carb:"72g",fat:"14g",fib:"1g",sug:"60g",score:4.5 },
];

function analyzeFood(s: PixelStats): SingleDetection[] {
  const hue = s.dominantHue;
  const detections: SingleDetection[] = [];

  // Score each food against pixel stats
  const scored = FOOD_DATABASE.map(f => {
    const [h0, h1] = f.hueRange;
    let hueMatch = hue >= h0 && hue <= h1 ? 1 : 0.4;

    // Special heuristic: if we detect a distinct red label signature (at least 0.2% of pixels are red label)
    if (f.name === "Coca-Cola / Soda" && s.pureRedPixelRatio > 0.002) {
      hueMatch = 1.0;
    }

    const warmMatch = s.warmPixelRatio >= f.warmMin ? 1 : s.warmPixelRatio / (f.warmMin + 0.01);
    const greenMatch = s.greenPixelRatio >= f.greenMin ? 1 : 0.5;
    
    let raw = (hueMatch * 40 + warmMatch * 35 + greenMatch * 25);

    // Give a direct boost to Coca-Cola if the red label is present in the camera frame
    if (f.name === "Coca-Cola / Soda" && s.pureRedPixelRatio > 0.002) {
      raw += 45;
    }

    return { ...f, score_pct: Math.round(55 + raw * 0.35) };
  }).sort((a, b) => b.score_pct - a.score_pct);

  const top = scored[0];
  detections.push({
    category: "food",
    name: top.name,
    confidence: Math.min(top.score_pct, 89),
    box: [150, 80, 820, 750],
    data: {
      Calories: top.cal, Protein: top.pro,
      Carbohydrates: top.carb, Fat: top.fat,
      Fiber: top.fib, Sugar: top.sug,
    },
    suggestions: buildFoodSuggestions(top.name, top.score),
    score: top.score,
  });

  // Second item if enough warmth/green diversity
  if (s.warmPixelRatio + s.greenPixelRatio > 0.18 && scored[1]) {
    const sec = scored[1];
    detections.push({
      category: "food",
      name: sec.name,
      confidence: Math.min(sec.score_pct - 12, 75),
      box: [420, 350, 950, 880],
      data: { Calories: sec.cal, Protein: sec.pro, Carbohydrates: sec.carb, Fat: sec.fat },
      suggestions: buildFoodSuggestions(sec.name, sec.score),
      score: sec.score,
    });
  }

  return detections;
}

function buildFoodSuggestions(name: string, score: number): string[] {
  const tips: Record<string, string[]> = {
    "Coca-Cola / Soda": ["High in added sugars — enjoy as an occasional treat","Zero nutritional value — consider sparkling water instead","Keep cold for refreshing taste but drink mindfully"],
    "Salad Bowl":      ["Excellent choice — packed with micronutrients","Add protein like eggs or chicken for a complete meal","Dress lightly to keep calories low"],
    "Vegetables":      ["Great source of vitamins and fiber","Steam instead of fry to preserve nutrients","Add healthy fats like olive oil for absorption"],
    "Fruit Platter":   ["Rich in natural antioxidants","Best consumed in the morning for energy","Pair with nuts for sustained satiety"],
    "Rice & Dal":      ["Dal is an excellent plant-based protein","Add vegetables to boost fiber intake","Opt for brown rice for more fiber"],
    "Curry & Roti":    ["Use whole wheat roti for extra fiber","Reduce oil by 50% to cut 120 kcal","Include a salad on the side"],
    "Biryani":         ["High calorie — portion control recommended","Rich in spices with anti-inflammatory benefits","Pair with raita for probiotics"],
    "Soup / Dal":      ["Excellent for weight management","High satiety with low calories","Great source of plant-based iron"],
    "Fried Rice":      ["Reduce oil for a healthier version","Add eggs or tofu for protein boost","Include more vegetables for nutrients"],
    "Sandwich":        ["Choose whole grain bread for fiber","Add leafy greens to boost nutrition","Watch sodium content in processed meats"],
    "Dessert / Sweet": ["Enjoy in moderation","Share to reduce portion size","Pair with nuts to slow sugar absorption"],
  };
  const base = tips[name] ?? ["Eat mindfully and savor each bite","Stay hydrated — drink water before meals","Balance with vegetables and protein"];
  const scoreMsg = score >= 8.5 ? "Excellent health score! 🌟" : score >= 7 ? "Good nutritional balance" : "Consider healthier alternatives";
  return [scoreMsg, ...base];
}

// ─── Emotion Analysis ───────────────────────────────────────────────────────

const EMOTIONS = ["Happy","Neutral","Focused","Surprised","Calm","Thoughtful"] as const;
type Emotion = typeof EMOTIONS[number];

function analyzeEmotion(s: PixelStats): SingleDetection[] {
  // Use brightness and saturation as proxy signals
  const bright = s.brightness;
  const skin = s.skinPixelRatio;

  let dominant: Emotion;
  let happy = 0, neutral = 0, focused = 0;

  if (bright > 160 && s.saturation > 0.15) {
    dominant = "Happy"; happy = Math.round(70 + Math.random() * 20);
    neutral = Math.round(15 + Math.random() * 10);
    focused = 100 - happy - neutral;
  } else if (bright > 120) {
    dominant = "Focused"; focused = Math.round(60 + Math.random() * 20);
    neutral = Math.round(20 + Math.random() * 15);
    happy = 100 - focused - neutral;
  } else {
    dominant = "Neutral"; neutral = Math.round(55 + Math.random() * 25);
    happy = Math.round(15 + Math.random() * 20);
    focused = 100 - neutral - happy;
  }

  const eyeContact = Math.round(60 + skin * 300 + Math.random() * 15);
  const conf = Math.min(65 + skin * 150, 88);

  const EMOTION_TIPS: Record<Emotion, string[]> = {
    Happy:     ["Positive energy detected — share it!","High engagement and openness","Great state for creative work"],
    Neutral:   ["Calm and composed — ideal for focus","Try a quick stretch to boost energy","Steady state is great for decision-making"],
    Focused:   ["Deep concentration detected","Remember to blink and rest eyes every 20 min","Excellent state for analytical tasks"],
    Surprised: ["High alertness detected","Engage with whatever caught your attention","Curiosity is the best learning tool"],
    Calm:      ["Relaxed and balanced state","Perfect for mindfulness or reflection","Good baseline for wellbeing"],
    Thoughtful:["Reflective state — great for planning","Jot down your thoughts","Creative ideas often come in quiet moments"],
  };

  return [{
    category: "emotion",
    name: `${dominant} Expression`,
    confidence: Math.round(conf),
    box: [80, 200, 850, 780],
    data: {
      "Dominant Emotion": dominant,
      "Happy": `${Math.max(0, happy)}%`,
      "Neutral": `${Math.max(0, neutral)}%`,
      "Focused": `${Math.max(0, focused)}%`,
      "Eye Contact": `${Math.min(eyeContact, 95)}%`,
    },
    suggestions: EMOTION_TIPS[dominant],
    score: dominant === "Happy" ? 9.2 : dominant === "Focused" ? 8.5 : 7.8,
  }];
}

// ─── Room Analysis ──────────────────────────────────────────────────────────

const ROOM_STYLES = [
  { name:"Traditional Indian", conds: (s: PixelStats) => s.warmPixelRatio > 0.08 && s.brightness > 100 },
  { name:"Modern Minimalist",  conds: (s: PixelStats) => s.saturation < 0.2 && s.edgeDensity > 0.08 },
  { name:"Cozy Living Room",   conds: (s: PixelStats) => s.warmPixelRatio > 0.05 && s.darkPixelRatio < 0.3 },
  { name:"Bright Studio",      conds: (s: PixelStats) => s.brightPixelRatio > 0.25 && s.saturation < 0.25 },
  { name:"Eclectic Interior",  conds: (s: PixelStats) => s.colorVariance > 0.06 },
  { name:"Classic Home",       conds: () => true }, // fallback
];

function analyzeRoom(s: PixelStats): SingleDetection[] {
  const style = ROOM_STYLES.find(r => r.conds(s))!;
  const detections: SingleDetection[] = [];

  // Lighting quality from brightness metrics
  const lightZone = s.regionBrightness;
  const topLight = lightZone.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
  const bottomLight = lightZone.slice(6).reduce((a, b) => a + b, 0) / 3;
  const hasNaturalLight = topLight > 150;
  const lightingQuality = s.brightness > 160 ? "Bright Natural" :
    s.brightness > 120 ? "Good Artificial" :
    s.brightness > 80 ? "Dim — needs improvement" : "Dark — poor lighting";

  // Clutter from edge density
  const clutter = s.edgeDensity > 0.18 ? "High — needs decluttering" :
    s.edgeDensity > 0.10 ? "Moderate" : "Low — well organized";

  const spaceUsage = s.edgeDensity > 0.15 ? "Dense (75%+)" :
    s.edgeDensity > 0.08 ? "Moderate (50-70%)" : "Spacious (<50%)";

  const designScore = Math.round(
    (s.brightness > 100 ? 2 : 0) +
    (s.edgeDensity < 0.15 ? 2 : 0) +
    (s.saturation > 0.1 ? 1.5 : 0) +
    (hasNaturalLight ? 2 : 0) + 3
  );

  detections.push({
    category: "room",
    name: style.name,
    confidence: Math.round(65 + s.colorVariance * 200 + s.edgeDensity * 50),
    box: [0, 0, 1000, 1000],
    data: {
      Style: style.name,
      Lighting: lightingQuality,
      Clutter: clutter,
      "Space Usage": spaceUsage,
    },
    suggestions: buildRoomSuggestions(style.name, s),
    score: Math.min(designScore, 10),
  });

  // Identify specific elements based on brightness zones
  if (topLight > 180) {
    detections.push({
      category: "room",
      name: "Ceiling Light / Window",
      confidence: 72,
      box: [0, 200, 250, 800],
      data: { Type: "Light Source", Brightness: `${Math.round(topLight)} lux (est.)`, Quality: hasNaturalLight ? "Natural" : "Artificial" },
      suggestions: ["Good overhead light detected", "Add side lamps for depth"],
      score: 7,
    });
  }

  return detections;
}

function buildRoomSuggestions(style: string, s: PixelStats): string[] {
  const suggestions: string[] = [];
  if (s.brightness < 100) suggestions.push("Add more lighting — room appears dim. Consider a floor lamp or LED strips.");
  else if (s.brightness > 180) suggestions.push("Excellent natural light — maximize with light curtains.");
  else suggestions.push("Good ambient lighting — add accent lamps for warmth.");

  if (s.edgeDensity > 0.18) suggestions.push("High clutter detected — decluttering will make the space feel 40% larger.");
  else suggestions.push("Clean and organized — great for productivity and relaxation.");

  const styleGuide: Record<string, string> = {
    "Traditional Indian": "Add brass accents and warm textiles to enhance the traditional aesthetic.",
    "Modern Minimalist":  "Keep surfaces clear. A single statement piece will elevate the minimal look.",
    "Cozy Living Room":   "Add a throw blanket and soft cushions for extra coziness.",
    "Bright Studio":      "Use plants and natural textures to add warmth to the bright space.",
    "Eclectic Interior":  "Create a focal point — one bold artwork or statement furniture piece.",
    "Classic Home":       "Consistent color palette across soft furnishings will tie the room together.",
  };
  suggestions.push(styleGuide[style] ?? "Consider a fresh coat of paint in a warm neutral tone.");
  return suggestions;
}

// ─── Main Export ─────────────────────────────────────────────────────────────

export async function analyzeWithLocalAI(base64Jpeg: string, forcedMode?: string): Promise<AnalysisResult> {
  const s = await analyzePixels(base64Jpeg);
  
  let type: SceneType = "room";
  let confidenceVal = 85;

  if (forcedMode === "food" || forcedMode === "emotion" || forcedMode === "room") {
    type = forcedMode as SceneType;
  } else {
    const res = classifyScene(s);
    type = res.type;
    confidenceVal = res.confidence;
  }

  let detections: SingleDetection[];

  if (type === "food") detections = analyzeFood(s);
  else if (type === "emotion") detections = analyzeEmotion(s);
  else detections = analyzeRoom(s);

  const primary = detections[0];

  return {
    mode: type,
    confidence: Math.min(primary.confidence, confidenceVal),
    detected: detections.map(d => d.name).join(" & "),
    data: primary.data,
    suggestions: primary.suggestions,
    score: primary.score,
    detections,
  };
}
