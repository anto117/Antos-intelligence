"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  LayoutDashboard,
  Camera,
  FileText,
  Clock,
  BarChart3,
  Settings,
  Eye,
  User,
  Bell,
  Shield,
  Palette,
  Save,
  ChevronRight,
  Cpu,
  Code2,
  Globe,
  ChevronLeft,
} from "lucide-react";

const sidebarItems = [
  { icon: <LayoutDashboard className="w-4 h-4" />, label: "Overview", href: "/dashboard" },
  { icon: <Camera className="w-4 h-4" />, label: "Camera", href: "/camera" },
  { icon: <FileText className="w-4 h-4" />, label: "Reports", href: "/reports" },
  { icon: <Clock className="w-4 h-4" />, label: "History", href: "/history" },
  { icon: <BarChart3 className="w-4 h-4" />, label: "Analytics", href: "/analytics" },
  { icon: <Settings className="w-4 h-4" />, label: "Settings", href: "/settings", active: true },
];

type Tab = "profile" | "ai" | "notifications" | "privacy" | "appearance" | "env";

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "profile", label: "Profile", icon: <User className="w-4 h-4" /> },
  { id: "ai", label: "AI Models", icon: <Cpu className="w-4 h-4" /> },
  { id: "notifications", label: "Notifications", icon: <Bell className="w-4 h-4" /> },
  { id: "privacy", label: "Privacy", icon: <Shield className="w-4 h-4" /> },
  { id: "appearance", label: "Appearance", icon: <Palette className="w-4 h-4" /> },
  { id: "env", label: "Environment", icon: <Code2 className="w-4 h-4" /> },
];

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-6 rounded-full transition-all ${checked ? "bg-[#0070F3]" : "bg-slate-200"}`}
    >
      <span
        className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${checked ? "translate-x-4" : "translate-x-0"}`}
      />
    </button>
  );
}

function SettingRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-slate-100 last:border-0">
      <div className="flex-1 col-span-10">
        <div className="text-sm font-semibold text-slate-800">{label}</div>
        {description && <div className="text-xs text-slate-500 mt-0.5">{description}</div>}
      </div>
      <div className="ml-4">{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>("profile");
  const [saved, setSaved] = useState(false);

  // Profile state
  const [name, setName] = useState("Alex Chen");
  const [email, setEmail] = useState("alex.chen@example.com");

  // AI settings
  const [yoloEnabled, setYoloEnabled] = useState(true);
  const [mediapipeEnabled, setMediapipeEnabled] = useState(true);
  const [geminiEnabled, setGeminiEnabled] = useState(true);
  const [captureInterval, setCaptureInterval] = useState("4");
  const [quality, setQuality] = useState("75");
  const [autoMode, setAutoMode] = useState(true);

  // Custom key/websocket state
  const [customGeminiKey, setCustomGeminiKey] = useState("");
  const [customWsUrl, setCustomWsUrl] = useState("");

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      setCustomGeminiKey(window.localStorage.getItem("custom_gemini_key") ?? "");
      setCustomWsUrl(window.localStorage.getItem("custom_ws_url") ?? "");
    }
  }, []);

  // Notifications
  const [notifyScanComplete, setNotifyScanComplete] = useState(true);
  const [notifyWeeklyReport, setNotifyWeeklyReport] = useState(true);
  const [notifyTips, setNotifyTips] = useState(false);
  const [emailNotifs, setEmailNotifs] = useState(false);

  // Privacy
  const [saveHistory, setSaveHistory] = useState(true);
  const [shareAnonymous, setShareAnonymous] = useState(false);
  const [faceBlur, setFaceBlur] = useState(false);

  // Appearance
  const [darkMode, setDarkMode] = useState(false);
  const [compactMode, setCompactMode] = useState(false);
  const [animations, setAnimations] = useState(true);

  const handleSave = () => {
    if (typeof window !== "undefined") {
      if (customGeminiKey.trim()) {
        window.localStorage.setItem("custom_gemini_key", customGeminiKey.trim());
      } else {
        window.localStorage.removeItem("custom_gemini_key");
      }

      if (customWsUrl.trim()) {
        window.localStorage.setItem("custom_ws_url", customWsUrl.trim());
      } else {
        window.localStorage.removeItem("custom_ws_url");
      }
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-[#0F172A]">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 border-r border-slate-200 bg-white p-4 gap-1">
        <Link href="/" className="flex items-center gap-2.5 px-3 py-4 mb-4 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0070F3] to-[#0051B3] flex items-center justify-center shadow-sm">
            <LayoutDashboard className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-display font-bold text-slate-900 text-sm">
              Antos <span className="text-[#0070F3]">Intelligence</span>
            </span>
            <span className="text-[8px] text-slate-400 font-mono tracking-wider mt-0.5">CONSOLE</span>
          </div>
        </Link>

        {sidebarItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${item.active
              ? "bg-[#0070F3]/10 text-[#0070F3] border border-[#0070F3]/20"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}

        <div className="mt-auto flex flex-col gap-2">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-semibold transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Portal
          </Link>
          <Link href="/camera" className="flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-lg bg-[#0070F3] hover:bg-[#0051B3] text-white text-sm font-semibold shadow-sm transition-colors">
            <Camera className="w-4 h-4" /> New Analysis
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        {/* Mobile top bar */}
        <div className="flex items-center justify-between mb-6 lg:hidden">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-[#0070F3] font-semibold">
            <ChevronLeft className="w-4 h-4" /> Portal
          </Link>
          <div className="text-right">
            <span className="text-xs font-bold text-slate-800">Antos Intelligence</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-black text-slate-900 font-display">Settings</h1>
            <p className="text-sm text-slate-500 mt-1">Manage your account, AI models, and preferences.</p>
          </div>
          <button
            onClick={handleSave}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all self-start sm:self-auto shadow-sm ${saved
              ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
              : "bg-[#0070F3] hover:bg-[#0051B3] text-white"
              }`}
          >
            <Save className="w-4 h-4" />
            {saved ? "Saved!" : "Save Changes"}
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Tab list */}
          <div className="w-full md:w-48 flex-shrink-0">
            <div className="flex flex-row md:flex-col gap-1 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all text-left whitespace-nowrap md:w-full ${tab === t.id
                    ? "bg-[#0070F3]/10 text-[#0070F3] border border-[#0070F3]/20 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                >
                  {t.icon}
                  {t.label}
                  <ChevronRight className="w-3.5 h-3.5 ml-auto hidden md:block opacity-40" />
                </button>
              ))}
            </div>
          </div>

          {/* Tab content */}
          <div className="flex-1">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm"
            >
              {/* Profile */}
              {tab === "profile" && (
                <div>
                  <h2 className="text-base font-bold text-slate-800 mb-5">Profile Settings</h2>
                  <div className="flex items-center gap-4 mb-6 p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#0070F3] to-[#0EA5E9] flex items-center justify-center text-xl font-black text-white shadow-sm">
                      {name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-slate-800">{name}</div>
                      <div className="text-xs text-slate-500">{email}</div>
                      <button className="text-xs font-semibold text-[#0070F3] mt-1 hover:underline">Change avatar</button>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] text-slate-500 uppercase font-mono mb-2 block font-semibold">Display Name</label>
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-[#0070F3]/50 focus:ring-1 focus:ring-[#0070F3]/30"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 uppercase font-mono mb-2 block font-semibold">Email</label>
                      <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-[#0070F3]/50 focus:ring-1 focus:ring-[#0070F3]/30"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 uppercase font-mono mb-2 block font-semibold">Language</label>
                      <div className="flex items-center gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-700">
                        <Globe className="w-4 h-4 text-slate-400" />
                        <span>English (US)</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* AI Models */}
              {tab === "ai" && (
                <div>
                  <h2 className="text-base font-bold text-slate-800 mb-2">AI Model Settings</h2>
                  <p className="text-xs text-slate-500 mb-5">Configure which AI models are active during analysis.</p>
                  <SettingRow label="YOLOv8 Object Detection" description="Real-time object detection and scene classification">
                    <Toggle checked={yoloEnabled} onChange={setYoloEnabled} />
                  </SettingRow>
                  <SettingRow label="MediaPipe Face Analysis" description="Facial landmark detection for emotion inference">
                    <Toggle checked={mediapipeEnabled} onChange={setMediapipeEnabled} />
                  </SettingRow>
                  <SettingRow label="Gemini Pro Vision" description="Natural language analysis and recommendations">
                    <Toggle checked={geminiEnabled} onChange={setGeminiEnabled} />
                  </SettingRow>
                  <SettingRow label="Auto Mode Detection" description="Automatically detect food, room, or emotion without manual selection">
                    <Toggle checked={autoMode} onChange={setAutoMode} />
                  </SettingRow>
                  <SettingRow label="Capture Interval (seconds)" description="How often to send a frame for analysis">
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={captureInterval}
                      onChange={(e) => setCaptureInterval(e.target.value)}
                      className="w-16 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-800 text-center focus:outline-none focus:border-[#0070F3]/50"
                    />
                  </SettingRow>
                  <SettingRow label="JPEG Quality (%)" description="Frame compression quality sent to backend">
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="30"
                        max="100"
                        value={quality}
                        onChange={(e) => setQuality(e.target.value)}
                        className="w-24 accent-[#0070F3]"
                      />
                      <span className="text-sm text-slate-600 font-semibold w-8">{quality}%</span>
                    </div>
                  </SettingRow>
                </div>
              )}

              {/* Notifications */}
              {tab === "notifications" && (
                <div>
                  <h2 className="text-base font-bold text-slate-800 mb-5">Notification Preferences</h2>
                  <SettingRow label="Scan Complete" description="Notify when AI analysis finishes">
                    <Toggle checked={notifyScanComplete} onChange={setNotifyScanComplete} />
                  </SettingRow>
                  <SettingRow label="Weekly Report Ready" description="Get notified when your weekly summary is generated">
                    <Toggle checked={notifyWeeklyReport} onChange={setNotifyWeeklyReport} />
                  </SettingRow>
                  <SettingRow label="AI Tips & Recommendations" description="Receive personalized health and design tips">
                    <Toggle checked={notifyTips} onChange={setNotifyTips} />
                  </SettingRow>
                  <SettingRow label="Email Notifications" description="Receive reports and summaries via email">
                    <Toggle checked={emailNotifs} onChange={setEmailNotifs} />
                  </SettingRow>
                </div>
              )}

              {/* Privacy */}
              {tab === "privacy" && (
                <div>
                  <h2 className="text-base font-bold text-slate-800 mb-5">Privacy & Data</h2>
                  <SettingRow label="Save Scan History" description="Store your scan results for history and reports">
                    <Toggle checked={saveHistory} onChange={setSaveHistory} />
                  </SettingRow>
                  <SettingRow label="Share Anonymous Analytics" description="Help improve RealityGPT by sharing anonymized usage data">
                    <Toggle checked={shareAnonymous} onChange={setShareAnonymous} />
                  </SettingRow>
                  <SettingRow label="Blur Detected Faces in Exports" description="Automatically blur faces when exporting reports">
                    <Toggle checked={faceBlur} onChange={setFaceBlur} />
                  </SettingRow>
                  <div className="pt-4 mt-4 border-t border-slate-100">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100/50 text-sm font-semibold transition-colors">
                      Delete All My Data
                    </button>
                  </div>
                </div>
              )}

              {/* Appearance */}
              {tab === "appearance" && (
                <div>
                  <h2 className="text-base font-bold text-slate-800 mb-5">Appearance</h2>
                  <SettingRow label="White/Blue Light Theme" description="Antos Intelligence uses a clean corporate light theme by default">
                    <Toggle checked={!darkMode} onChange={() => { }} />
                  </SettingRow>
                  <SettingRow label="Compact Mode" description="Reduce padding and spacing for more content density">
                    <Toggle checked={compactMode} onChange={setCompactMode} />
                  </SettingRow>
                  <SettingRow label="Animations" description="Enable motion animations and transitions">
                    <Toggle checked={animations} onChange={setAnimations} />
                  </SettingRow>
                  <div className="mt-6">
                    <div className="text-xs text-slate-500 uppercase font-mono mb-3 font-semibold">Theme Palette</div>
                    <div className="flex gap-3">
                      {["#0070F3", "#0EA5E9", "#3B82F6", "#475569"].map((c) => (
                        <button
                          key={c}
                          className="w-8 h-8 rounded-full border-2 border-white ring-2 transition-all"
                          style={{
                            background: c,
                            boxShadow: `0 0 0 2px ${c === "#0070F3" ? "#0070F3" : "transparent"}`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Environment */}
              {tab === "env" && (
                <div>
                  <h2 className="text-base font-bold text-slate-800 mb-2">Environment Configuration</h2>
                  <p className="text-xs text-slate-500 mb-5">Configure your custom Gemini API key or backend WebSocket connection for Vercel/mobile devices.</p>
                  
                  <div className="space-y-5">
                    {/* Custom Gemini Key Input */}
                    <div className="p-4 rounded-lg bg-sky-50 border border-sky-100">
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Code2 className="w-4 h-4 text-[#0070F3]" /> Custom Gemini API Key
                        </label>
                        <span className="text-[10px] text-slate-400 font-mono">localStorage</span>
                      </div>
                      <input
                        type="password"
                        placeholder="Paste your AIzaSy... key (or sk-or-... for OpenRouter)"
                        value={customGeminiKey}
                        onChange={(e) => setCustomGeminiKey(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0070F3]/50 focus:ring-1 focus:ring-[#0070F3]/30 font-mono"
                      />
                      <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                        Supplying a key allows the app to perform cloud AI vision analysis directly from your browser (e.g. on your mobile phone) without needing a local Python backend.
                      </p>
                    </div>

                    {/* Custom WebSocket URL Input */}
                    <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Cpu className="w-4 h-4 text-slate-600" /> Custom WebSocket URL
                        </label>
                        <span className="text-[10px] text-slate-400 font-mono">localStorage</span>
                      </div>
                      <input
                        type="text"
                        placeholder="e.g. ws://192.168.1.36:8000/ws/analyze/mobile"
                        value={customWsUrl}
                        onChange={(e) => setCustomWsUrl(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0070F3]/50 focus:ring-1 focus:ring-[#0070F3]/30 font-mono"
                      />
                      <p className="text-[11px] text-slate-500 mt-2 leading-relaxed font-light">
                        Use this to connect your mobile device to your computer's local backend (e.g. <code className="font-mono bg-white px-1 py-0.5 rounded border">ws://&lt;local-ip-address&gt;:8000/ws/analyze/...</code>). 
                        If deploying securely on HTTPS (like Vercel), you must use a secure WebSocket tunnel (e.g. <code className="font-mono bg-white px-1 py-0.5 rounded border">wss://...ngrok-free.app/ws/analyze/...</code>) to bypass Mixed Content blocking.
                      </p>
                    </div>

                    {/* Default reference */}
                    <div className="p-4 rounded-lg border border-slate-250 bg-white">
                      <div className="text-[10px] text-slate-400 uppercase font-mono mb-1.5 font-bold">Standard Env File Reference</div>
                      <pre className="text-[10px] text-slate-600 font-mono bg-slate-50 rounded p-2 overflow-x-auto">{`NEXT_PUBLIC_GEMINI_API_KEY=your_key_here`}</pre>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
