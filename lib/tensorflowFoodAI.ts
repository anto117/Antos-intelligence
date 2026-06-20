/**
 * tensorflowFoodAI.ts
 * Runs MobileNet v2 directly in the browser via TensorFlow.js.
 * No API key required. Model (~8MB) is loaded once and cached.
 */

import type { AnalysisResult } from "@/hooks/useAICamera";

// ── Nutrition database keyed by ImageNet class keywords ──────────────────────
interface NutritionEntry {
  displayName: string;
  cal: string; pro: string; carb: string; fat: string;
  fib: string; sug: string; score: number;
  tips: string[];
}

const NUTRITION_DB: Record<string, NutritionEntry> = {
  // Fruits
  banana:     { displayName:"Banana",          cal:"89 kcal",   pro:"1.1g", carb:"23g", fat:"0.3g", fib:"2.6g", sug:"12g", score:8.0, tips:["Great pre-workout snack","Rich in potassium","Eat before it overripens for lower sugar"] },
  apple:      { displayName:"Apple",            cal:"72 kcal",   pro:"0.4g", carb:"19g", fat:"0.2g", fib:"3.3g", sug:"14g", score:8.5, tips:["High in antioxidants","Great fiber source","Keep skin on for max nutrients"] },
  orange:     { displayName:"Orange",           cal:"47 kcal",   pro:"0.9g", carb:"12g", fat:"0.1g", fib:"2.4g", sug:"9g",  score:8.8, tips:["Excellent vitamin C source","Boosts immunity","Best eaten whole, not as juice"] },
  mango:      { displayName:"Mango",            cal:"60 kcal",   pro:"0.8g", carb:"15g", fat:"0.4g", fib:"1.6g", sug:"14g", score:8.0, tips:["Rich in vitamin A","Tropical energy boost","Watch portion size — high natural sugar"] },
  strawberry: { displayName:"Strawberry",       cal:"32 kcal",   pro:"0.7g", carb:"8g",  fat:"0.3g", fib:"2g",   sug:"5g",  score:9.0, tips:["Very low calorie","High in antioxidants","Great with yogurt"] },
  pineapple:  { displayName:"Pineapple",        cal:"50 kcal",   pro:"0.5g", carb:"13g", fat:"0.1g", fib:"1.4g", sug:"10g", score:8.2, tips:["Contains bromelain enzyme","Anti-inflammatory","Good for digestion"] },
  lemon:      { displayName:"Lemon / Lime",     cal:"20 kcal",   pro:"0.4g", carb:"5g",  fat:"0.2g", fib:"1.4g", sug:"1g",  score:9.0, tips:["Add to water for vitamin C","Alkalizing effect","Great flavor without calories"] },
  grapes:     { displayName:"Grapes",           cal:"69 kcal",   pro:"0.7g", carb:"18g", fat:"0.2g", fib:"0.9g", sug:"15g", score:7.5, tips:["Rich in resveratrol","Natural energy","Freeze them for a cool snack"] },
  watermelon: { displayName:"Watermelon",       cal:"30 kcal",   pro:"0.6g", carb:"8g",  fat:"0.2g", fib:"0.4g", sug:"6g",  score:8.5, tips:["92% water — very hydrating","Low calorie summer snack","Good source of lycopene"] },
  pomegranate:{ displayName:"Pomegranate",      cal:"83 kcal",   pro:"1.7g", carb:"19g", fat:"1.2g", fib:"4g",   sug:"14g", score:9.0, tips:["High in antioxidants","Heart-healthy","Sprinkle on salads"] },

  // Vegetables
  broccoli:   { displayName:"Broccoli",         cal:"34 kcal",   pro:"2.8g", carb:"7g",  fat:"0.4g", fib:"2.6g", sug:"2g",  score:9.5, tips:["Steam, don't boil","High in vitamin K","Cancer-protective compounds"] },
  carrot:     { displayName:"Carrot",           cal:"41 kcal",   pro:"0.9g", carb:"10g", fat:"0.2g", fib:"2.8g", sug:"5g",  score:9.2, tips:["Rich in beta-carotene","Good for eyesight","Great raw with hummus"] },
  spinach:    { displayName:"Spinach / Greens", cal:"23 kcal",   pro:"2.9g", carb:"4g",  fat:"0.4g", fib:"2.2g", sug:"0.4g",score:9.8, tips:["Iron-rich leafy green","Add to smoothies","Light sauté preserves nutrients"] },
  tomato:     { displayName:"Tomato",           cal:"18 kcal",   pro:"0.9g", carb:"4g",  fat:"0.2g", fib:"1.2g", sug:"2.6g",score:9.0, tips:["Rich in lycopene","Cooked tomatoes have more lycopene","Low calorie base for meals"] },
  cucumber:   { displayName:"Cucumber",         cal:"16 kcal",   pro:"0.7g", carb:"4g",  fat:"0.1g", fib:"0.5g", sug:"1.7g",score:9.5, tips:["96% water — very hydrating","Great for skin","Add to water for flavor"] },
  pepper:     { displayName:"Bell Pepper",      cal:"31 kcal",   pro:"1g",   carb:"6g",  fat:"0.3g", fib:"2.1g", sug:"4g",  score:9.2, tips:["More vitamin C than oranges","Great raw or roasted","Eat a rainbow of colors"] },
  onion:      { displayName:"Onion",            cal:"40 kcal",   pro:"1.1g", carb:"9g",  fat:"0.1g", fib:"1.7g", sug:"4g",  score:8.5, tips:["Prebiotic fiber","Anti-inflammatory","Cook low-slow to bring out sweetness"] },
  mushroom:   { displayName:"Mushroom",         cal:"22 kcal",   pro:"3.1g", carb:"3g",  fat:"0.3g", fib:"1g",   sug:"2g",  score:9.0, tips:["Vitamin D source","High umami flavor","Great meat substitute"] },
  corn:       { displayName:"Corn",             cal:"86 kcal",   pro:"3.3g", carb:"19g", fat:"1.4g", fib:"2.7g", sug:"3g",  score:7.5, tips:["Good fiber source","Whole grain energy","Avoid heavy butter toppings"] },
  potato:     { displayName:"Potato",           cal:"77 kcal",   pro:"2g",   carb:"17g", fat:"0.1g", fib:"2.2g", sug:"0.8g",score:7.0, tips:["Bake, don't fry","High in potassium","Cooling after cooking increases resistant starch"] },

  // Grains & Breads
  bread:      { displayName:"Bread / Roti",     cal:"265 kcal",  pro:"9g",   carb:"49g", fat:"3.2g", fib:"2.7g", sug:"5g",  score:6.5, tips:["Choose whole grain","Pair with protein","Avoid white bread daily"] },
  rice:       { displayName:"Rice / Biryani",   cal:"206 kcal",  pro:"4.3g", carb:"45g", fat:"0.4g", fib:"0.6g", sug:"0g",  score:6.8, tips:["Brown rice has more fiber","Pair with dal for complete protein","Cool rice reduces glycemic impact"] },
  pizza:      { displayName:"Pizza",            cal:"~285 kcal", pro:"12g",  carb:"36g", fat:"10g",  fib:"2g",   sug:"4g",  score:5.5, tips:["Load with vegetable toppings","Thin crust saves ~100 kcal","Limit to 2 slices"] },
  noodles:    { displayName:"Noodles / Pasta",  cal:"~220 kcal", pro:"8g",   carb:"43g", fat:"1.3g", fib:"2.5g", sug:"1g",  score:6.5, tips:["Whole wheat pasta has more fiber","Add vegetables and protein","Watch portion size"] },
  pretzel:    { displayName:"Pretzel / Snack",  cal:"380 kcal",  pro:"9g",   carb:"80g", fat:"3g",   fib:"3g",   sug:"2g",  score:5.0, tips:["High in sodium","Occasional snack only","Pair with hummus for protein"] },

  // Protein Foods
  egg:        { displayName:"Eggs",             cal:"155 kcal",  pro:"13g",  carb:"1g",  fat:"11g",  fib:"0g",   sug:"0g",  score:9.0, tips:["Complete protein","Boiled is healthier than fried","Include yolk for vitamins"] },
  chicken:    { displayName:"Chicken",          cal:"165 kcal",  pro:"31g",  carb:"0g",  fat:"3.6g", fib:"0g",   sug:"0g",  score:8.5, tips:["Lean protein source","Grill or bake instead of fry","Remove skin to cut fat"] },
  fish:       { displayName:"Fish",             cal:"136 kcal",  pro:"28g",  carb:"0g",  fat:"2.5g", fib:"0g",   sug:"0g",  score:9.2, tips:["Rich in omega-3","Aim for 2 servings per week","Grilled is best"] },

  // Dairy
  milk:       { displayName:"Milk / Dairy",     cal:"61 kcal",   pro:"3.2g", carb:"5g",  fat:"3.3g", fib:"0g",   sug:"5g",  score:8.0, tips:["Great calcium source","Choose low-fat for weight management","Good post-workout recovery"] },
  cheese:     { displayName:"Cheese / Paneer",  cal:"402 kcal",  pro:"25g",  carb:"1.3g",fat:"33g",  fib:"0g",   sug:"0.5g",score:7.0, tips:["High protein","Limit portion to 30g","Paneer is great vegetarian protein"] },
  yogurt:     { displayName:"Yogurt / Curd",    cal:"59 kcal",   pro:"3.5g", carb:"5g",  fat:"3.3g", fib:"0g",   sug:"4g",  score:8.8, tips:["Excellent probiotic","Choose plain over flavored","Add fruits instead of sugar"] },

  // Snacks & Packaged
  chocolate:  { displayName:"Chocolate",        cal:"546 kcal",  pro:"5g",   carb:"60g", fat:"31g",  fib:"7g",   sug:"48g", score:4.5, tips:["Dark 70%+ is healthiest","1-2 squares is a good portion","Antioxidants in dark chocolate"] },
  cookie:     { displayName:"Biscuit / Cookie", cal:"~480 kcal", pro:"5g",   carb:"65g", fat:"21g",  fib:"1g",   sug:"35g", score:3.5, tips:["High in refined sugar","Occasional treat","Pair with milk for protein"] },
  chips:      { displayName:"Chips / Crisps",   cal:"536 kcal",  pro:"7g",   carb:"53g", fat:"35g",  fib:"5g",   sug:"0.4g",score:3.0, tips:["Very high in fat and sodium","Baked versions are better","30g is one portion"] },
  cake:       { displayName:"Cake / Dessert",   cal:"~350 kcal", pro:"4g",   carb:"55g", fat:"14g",  fib:"1g",   sug:"40g", score:3.5, tips:["High in sugar","Enjoy for celebrations only","Share to reduce portion"] },
  icecream:   { displayName:"Ice Cream",        cal:"207 kcal",  pro:"3.5g", carb:"24g", fat:"11g",  fib:"0g",   sug:"21g", score:4.0, tips:["High in sugar and fat","1 scoop is a serving","Choose fruit sorbet for lighter option"] },
  waffle:     { displayName:"Wafer / Waffle Snack", cal:"~150 kcal/serving", pro:"1.5g", carb:"18g", fat:"8g", fib:"0.5g", sug:"8g", score:4.0, tips:["Packaged wafer snack","Check label for exact serving size","Enjoy occasionally"] },

  // Drinks
  coffee:     { displayName:"Coffee",           cal:"2 kcal",    pro:"0.3g", carb:"0g",  fat:"0g",   fib:"0g",   sug:"0g",  score:7.5, tips:["Black coffee is nearly zero calorie","Limit to 2-3 cups/day","Avoid late afternoon coffee"] },
  tea:        { displayName:"Tea / Chai",       cal:"2 kcal",    pro:"0g",   carb:"0.4g",fat:"0g",   fib:"0g",   sug:"0g",  score:7.5, tips:["Green tea is rich in antioxidants","Reduce sugar in chai","2-3 cups per day is fine"] },
  juice:      { displayName:"Fruit Juice",      cal:"~110 kcal", pro:"0.5g", carb:"26g", fat:"0.2g", fib:"0g",   sug:"22g", score:5.5, tips:["Lacks fiber of whole fruit","High sugar content","Eat whole fruit instead"] },
  beer:       { displayName:"Beverage / Drink", cal:"~150 kcal", pro:"1g",   carb:"13g", fat:"0g",   fib:"0g",   sug:"0g",  score:4.0, tips:["Empty calories","Stay hydrated with water alongside","Drink responsibly"] },
  water:      { displayName:"Water",            cal:"0 kcal",    pro:"0g",   carb:"0g",  fat:"0g",   fib:"0g",   sug:"0g",  score:10,  tips:["Essential for all body functions","Aim for 2-3L per day","Best drink choice always"] },

  // Indian Foods
  curry:      { displayName:"Curry / Dal",      cal:"~250 kcal", pro:"12g",  carb:"30g", fat:"9g",   fib:"6g",   sug:"4g",  score:8.0, tips:["Rich in spices with anti-inflammatory benefits","Great plant protein source","Reduce oil to cut calories"] },
  samosa:     { displayName:"Samosa / Fried Snack", cal:"~260 kcal", pro:"5g", carb:"30g", fat:"13g", fib:"2g",  sug:"2g",  score:5.0, tips:["Deep fried — high in fat","Occasional treat","Baked version cuts fat by 60%"] },
  dosa:       { displayName:"Dosa / Idli",      cal:"~120 kcal", pro:"3g",   carb:"22g", fat:"3g",   fib:"1g",   sug:"1g",  score:7.5, tips:["Fermented — good for gut health","Add vegetables for nutrition","Sambar adds protein"] },

  // Fallback packaged
  container:  { displayName:"Packaged Product", cal:"Check label", pro:"—", carb:"—", fat:"—", fib:"—", sug:"—", score:5.0, tips:["Check the nutrition label for exact values","Packaged products vary widely","Moderation is key"] },
  canister:   { displayName:"Packaged Snack",   cal:"~150–300 kcal/serving", pro:"2–5g", carb:"20–40g", fat:"8–18g", fib:"0–2g", sug:"5–15g", score:4.0, tips:["Check the label for exact nutrition","High in refined carbs typically","Enjoy as an occasional treat"] },
  box:        { displayName:"Packaged Food Box", cal:"Check label", pro:"—", carb:"—", fat:"—", fib:"—", sug:"—", score:5.0, tips:["Read the nutrition facts label","Single serving is usually less than the whole box","Check sodium content"] },
};

// ── Keyword → nutrition mapping ───────────────────────────────────────────────
function lookupNutrition(className: string): NutritionEntry | null {
  const c = className.toLowerCase();
  for (const [key, entry] of Object.entries(NUTRITION_DB)) {
    if (c.includes(key)) return entry;
  }
  // Secondary checks
  if (c.includes("fruit") || c.includes("citrus")) return NUTRITION_DB.orange;
  if (c.includes("vegetable") || c.includes("veg") || c.includes("green")) return NUTRITION_DB.broccoli;
  if (c.includes("meat") || c.includes("beef") || c.includes("pork")) return NUTRITION_DB.chicken;
  if (c.includes("drink") || c.includes("beverage") || c.includes("bottle") || c.includes("can")) return NUTRITION_DB.beer;
  if (c.includes("snack") || c.includes("cracker") || c.includes("wafer") || c.includes("biscuit")) return NUTRITION_DB.cookie;
  if (c.includes("sweet") || c.includes("candy") || c.includes("sugar")) return NUTRITION_DB.chocolate;
  if (c.includes("bowl") || c.includes("dish") || c.includes("plate")) return NUTRITION_DB.curry;
  if (c.includes("bag") || c.includes("pack") || c.includes("wrap")) return NUTRITION_DB.chips;
  if (c.includes("cup") || c.includes("mug")) return NUTRITION_DB.coffee;
  return null;
}

// ── Model singleton ───────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let modelInstance: any = null;
let modelLoading = false;
let modelLoadPromise: Promise<void> | null = null;

async function loadModel() {
  if (modelInstance) return;
  if (modelLoading && modelLoadPromise) { await modelLoadPromise; return; }
  modelLoading = true;
  modelLoadPromise = (async () => {
    try {
      // Dynamic imports keep the initial bundle small
      const tf = await import("@tensorflow/tfjs");
      await tf.ready();
      const mobilenet = await import("@tensorflow-models/mobilenet");
      modelInstance = await mobilenet.load({ version: 2, alpha: 0.5 });
      console.log("[TF] MobileNet loaded ✅");
    } catch (e) {
      console.error("[TF] Model load failed:", e);
    }
  })();
  await modelLoadPromise;
  modelLoading = false;
}

// Preload in background when module is first imported
if (typeof window !== "undefined") {
  setTimeout(() => { loadModel().catch(() => {}); }, 3000);
}

// ── Main export ───────────────────────────────────────────────────────────────
export async function analyzeWithTensorFlow(base64Jpeg: string): Promise<AnalysisResult | null> {
  if (typeof window === "undefined") return null;

  try {
    await loadModel();
    if (!modelInstance) return null;

    // Draw the image into a canvas so TF can read it
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const el = new Image();
      el.onload = () => res(el);
      el.onerror = rej;
      el.src = `data:image/jpeg;base64,${base64Jpeg}`;
    });

    const tf = await import("@tensorflow/tfjs");
    const tensor = tf.browser.fromPixels(img);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const predictions: Array<{ className: string; probability: number }> =
      await modelInstance.classify(tensor);
    tensor.dispose();

    if (!predictions || predictions.length === 0) return null;

    // Try top-3 predictions for a nutrition match
    for (const pred of predictions.slice(0, 3)) {
      const entry = lookupNutrition(pred.className);
      if (entry) {
        const confidence = Math.round(pred.probability * 100);
        return {
          mode: "food",
          confidence: Math.max(confidence, 55),
          detected: entry.displayName,
          data: {
            Calories: entry.cal,
            Protein: entry.pro,
            Carbohydrates: entry.carb,
            Fat: entry.fat,
            Fiber: entry.fib,
            Sugar: entry.sug,
          },
          suggestions: [
            entry.score >= 8.5 ? "Excellent health score! 🌟" : entry.score >= 7 ? "Good nutritional balance" : "Consider healthier alternatives",
            ...entry.tips,
          ],
          score: entry.score,
          detections: [{
            category: "food",
            name: entry.displayName,
            confidence: Math.max(confidence, 55),
            box: [80, 60, 920, 920],
            data: { Calories: entry.cal, Protein: entry.pro, Carbohydrates: entry.carb, Fat: entry.fat, Fiber: entry.fib, Sugar: entry.sug },
            suggestions: entry.tips,
            score: entry.score,
          }],
        };
      }
    }

    // No food match — return top prediction as generic info
    const top = predictions[0];
    return {
      mode: "food",
      confidence: 50,
      detected: "Packaged Product",
      data: {
        Detected: top.className,
        Calories: "Check label",
        Note: "Add a Gemini key in Settings for precise identification",
      },
      suggestions: ["Check the nutrition facts label on the product", "Packaged items vary — serving size matters", "For exact info, use Settings → Environment → Gemini Key"],
      score: 5.0,
    };
  } catch (err) {
    console.warn("[TF] Analysis failed:", err);
    return null;
  }
}
