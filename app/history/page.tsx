"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  LayoutDashboard,
  Camera,
  FileText,
  Clock,
  BarChart3,
  Settings,
  Utensils,
  Home,
  Smile,
  ScanLine,
  Search,
  Filter,
  ChevronRight,
  Calendar,
  Star,
  Trash2,
  ChevronLeft,
} from "lucide-react";

const sidebarItems = [
  { icon: <LayoutDashboard className="w-4 h-4" />, label: "Overview", href: "/dashboard" },
  { icon: <Camera className="w-4 h-4" />, label: "Camera", href: "/camera" },
  { icon: <FileText className="w-4 h-4" />, label: "Reports", href: "/reports" },
  { icon: <Clock className="w-4 h-4" />, label: "History", href: "/history", active: true },
  { icon: <BarChart3 className="w-4 h-4" />, label: "Analytics", href: "/analytics" },
  { icon: <Settings className="w-4 h-4" />, label: "Settings", href: "/settings" },
];

type ScanType = "food" | "room" | "emotion";

interface ScanEntry {
  id: string;
  type: ScanType;
  label: string;
  detected: string;
  score: number;
  confidence: number;
  time: string;
  date: string;
  tags: string[];
  color: string;
}

const HISTORY: ScanEntry[] = [
  { id: "1", type: "food", label: "Pasta Carbonara", detected: "Italian Pasta", score: 8.1, confidence: 94.2, time: "2:14 PM", date: "Today", tags: ["high-protein", "italian"], color: "#10B981" },
  { id: "2", type: "room", label: "Home Office Setup", detected: "Office Room", score: 7.4, confidence: 90.8, time: "11:32 AM", date: "Today", tags: ["workspace", "modern"], color: "#0070F3" },
  { id: "3", type: "emotion", label: "Interview Prep", detected: "Human Face", score: 8.9, confidence: 97.6, time: "9:05 AM", date: "Today", tags: ["confident", "focused"], color: "#0EA5E9" },
  { id: "4", type: "food", label: "Avocado Toast", detected: "Toast with Avocado", score: 9.2, confidence: 95.1, time: "8:20 AM", date: "Yesterday", tags: ["healthy", "breakfast"], color: "#10B981" },
  { id: "5", type: "room", label: "Living Room", detected: "Living Room", score: 6.8, confidence: 88.4, time: "6:45 PM", date: "Yesterday", tags: ["cozy", "warm"], color: "#0070F3" },
  { id: "6", type: "emotion", label: "Morning Check-in", detected: "Human Face", score: 7.2, confidence: 96.3, time: "7:30 AM", date: "Yesterday", tags: ["neutral", "morning"], color: "#0EA5E9" },
  { id: "7", type: "food", label: "Green Smoothie", detected: "Beverage", score: 9.5, confidence: 92.7, time: "3:00 PM", date: "Jun 9", tags: ["healthy", "vegetarian"], color: "#10B981" },
  { id: "8", type: "room", label: "Kitchen Renovation", detected: "Kitchen", score: 8.3, confidence: 91.2, time: "1:15 PM", date: "Jun 9", tags: ["modern", "open-plan"], color: "#0070F3" },
  { id: "9", type: "emotion", label: "Presentation Mode", detected: "Human Face", score: 8.6, confidence: 98.1, time: "10:00 AM", date: "Jun 9", tags: ["confident", "professional"], color: "#0EA5E9" },
  { id: "10", type: "food", label: "Sushi Platter", detected: "Japanese Food", score: 8.8, confidence: 93.5, time: "7:30 PM", date: "Jun 8", tags: ["japanese", "seafood"], color: "#10B981" },
];

const typeIcons: Record<ScanType, React.ReactNode> = {
  food: <Utensils className="w-4 h-4" />,
  room: <Home className="w-4 h-4" />,
  emotion: <Smile className="w-4 h-4" />,
};

const typeLabels: Record<ScanType, string> = {
  food: "Food Analysis",
  room: "Interior AI",
  emotion: "Emotion Scan",
};

export default function HistoryPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | ScanType>("all");
  const [selected, setSelected] = useState<ScanEntry | null>(null);
  const [deleted, setDeleted] = useState<Set<string>>(new Set());

  const filtered = HISTORY.filter((s) => {
    if (deleted.has(s.id)) return false;
    if (filter !== "all" && s.type !== filter) return false;
    if (search && !s.label.toLowerCase().includes(search.toLowerCase()) && !s.detected.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const grouped = filtered.reduce<Record<string, ScanEntry[]>>((acc, scan) => {
    if (!acc[scan.date]) acc[scan.date] = [];
    acc[scan.date].push(scan);
    return acc;
  }, {});

  const handleDelete = (id: string) => {
    setDeleted((d) => new Set([...d, id]));
    if (selected?.id === id) setSelected(null);
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
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              item.active
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
      <main className="flex-1 flex overflow-hidden">
        {/* List panel */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-slate-200 bg-white">
            <div className="flex items-center justify-between mb-4 lg:hidden">
              <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-[#0070F3] font-semibold">
                <ChevronLeft className="w-4 h-4" /> Portal
              </Link>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mb-4 font-display">Scan History</h1>

            {/* Search + filter */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search scans..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#0070F3]/50 focus:ring-1 focus:ring-[#0070F3]/30"
                />
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-1.5 sm:pb-0 scrollbar-none">
                {(["all", "food", "room", "emotion"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize border ${
                      filter === f
                        ? "bg-[#0070F3]/10 text-[#0070F3] border-[#0070F3]/25 font-bold"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Scan list */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {Object.entries(grouped).map(([date, scans]) => (
              <div key={date}>
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs font-semibold text-slate-400 uppercase font-mono">{date}</span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>
                <div className="space-y-2.5">
                  {scans.map((scan) => (
                    <motion.div
                      key={scan.id}
                      layout
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      onClick={() => setSelected(scan)}
                      className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer border transition-all group ${
                        selected?.id === scan.id
                          ? "bg-white border-[#0070F3] shadow-md"
                          : "bg-white/80 border-slate-200 hover:border-[#0070F3]/45 hover:bg-white"
                      }`}
                    >
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: `${scan.color}10`, color: scan.color }}
                      >
                        {typeIcons[scan.type]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-slate-900 truncate">{scan.label}</div>
                        <div className="text-xs text-slate-500 font-light">{scan.detected} • {scan.time}</div>
                      </div>
                      <div className="text-right flex-shrink-0 mr-1.5">
                        <div className="text-sm font-bold" style={{ color: scan.color }}>
                          {scan.score}/10
                        </div>
                        <div className="text-xs text-slate-400 font-mono">{scan.confidence}%</div>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(scan.id); }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition-colors flex-shrink-0" />
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <ScanLine className="w-12 h-12 text-slate-200" />
                <p className="text-slate-400 text-sm font-light">No scans found</p>
              </div>
            )}
          </div>
        </div>

        {/* Detail panel */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-80 border-l border-slate-200 bg-white flex flex-col overflow-y-auto"
            >
              <div className="p-5 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded border"
                    style={{ background: `${selected.color}10`, color: selected.color, borderColor: `${selected.color}20` }}
                  >
                    {typeLabels[selected.type]}
                  </span>
                  <button
                    onClick={() => setSelected(null)}
                    className="text-slate-400 hover:text-[#0F172A] text-xs font-semibold"
                  >
                    ✕ Close
                  </button>
                </div>
                <h2 className="text-base font-bold text-slate-900 mt-4 leading-snug">{selected.label}</h2>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{selected.date} at {selected.time}</p>
              </div>

              <div className="p-5 flex-1 space-y-5">
                {/* Score */}
                <div
                  className="p-4 rounded-xl flex items-center justify-between border"
                  style={{ background: `${selected.color}05`, borderColor: `${selected.color}15` }}
                >
                  <div>
                    <div className="text-[10px] uppercase font-mono text-slate-400 font-semibold mb-0.5">AI Rating</div>
                    <div className="text-3xl font-black" style={{ color: selected.color }}>
                      {selected.score}
                      <span className="text-xs text-slate-400 font-normal">/10</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] uppercase font-mono text-slate-400 font-semibold mb-0.5">Confidence</div>
                    <div className="text-2xl font-black" style={{ color: selected.color }}>
                      {selected.confidence}%
                    </div>
                  </div>
                </div>

                {/* Confidence bar */}
                <div>
                  <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                    <span>Detection Confidence</span>
                    <span className="font-semibold text-slate-700">{selected.confidence}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className="rounded-full h-2"
                      style={{
                        width: `${selected.confidence}%`,
                        background: selected.color,
                      }}
                    />
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <div className="text-[10px] uppercase font-mono text-slate-400 font-semibold mb-2">Tags</div>
                  <div className="flex flex-wrap gap-2">
                    {selected.tags.map((tag) => (
                      <span
                        key={tag}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border"
                        style={{ background: `${selected.color}05`, color: selected.color, borderColor: `${selected.color}15` }}
                      >
                        <Star className="w-3 h-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <Link
                    href="/camera"
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-[#0070F3] hover:bg-[#0051B3] text-white text-sm font-semibold shadow-sm transition-colors"
                  >
                    <Camera className="w-4 h-4" /> Run Similar Scan
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
