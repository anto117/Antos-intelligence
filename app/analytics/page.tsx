"use client";

import { motion } from "framer-motion";
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
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
  Target,
  ChevronLeft,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  LineChart,
  Line,
  Legend,
} from "recharts";

const sidebarItems = [
  { icon: <LayoutDashboard className="w-4 h-4" />, label: "Overview", href: "/dashboard" },
  { icon: <Camera className="w-4 h-4" />, label: "Camera", href: "/camera" },
  { icon: <FileText className="w-4 h-4" />, label: "Reports", href: "/reports" },
  { icon: <Clock className="w-4 h-4" />, label: "History", href: "/history" },
  { icon: <BarChart3 className="w-4 h-4" />, label: "Analytics", href: "/analytics", active: true },
  { icon: <Settings className="w-4 h-4" />, label: "Settings", href: "/settings" },
];

const monthlyData = [
  { month: "Jan", food: 120, room: 80, emotion: 95 },
  { month: "Feb", food: 145, room: 92, emotion: 110 },
  { month: "Mar", food: 132, room: 105, emotion: 130 },
  { month: "Apr", food: 178, room: 118, emotion: 142 },
  { month: "May", food: 195, room: 134, emotion: 158 },
  { month: "Jun", food: 220, room: 145, emotion: 172 },
];

const accuracyData = [
  { name: "Food Detection", accuracy: 94 },
  { name: "Room Analysis", accuracy: 91 },
  { name: "Emotion Scan", accuracy: 88 },
  { name: "Object ID", accuracy: 96 },
  { name: "Scene Class.", accuracy: 90 },
];

const radarData = [
  { metric: "Accuracy", A: 94, fullMark: 100 },
  { metric: "Speed", A: 88, fullMark: 100 },
  { metric: "Coverage", A: 76, fullMark: 100 },
  { metric: "Confidence", A: 91, fullMark: 100 },
  { metric: "Reliability", A: 95, fullMark: 100 },
  { metric: "Precision", A: 89, fullMark: 100 },
];

const weeklyTrend = [
  { day: "Mon", scans: 42, accuracy: 91 },
  { day: "Tue", scans: 78, accuracy: 94 },
  { day: "Wed", scans: 55, accuracy: 89 },
  { day: "Thu", scans: 91, accuracy: 96 },
  { day: "Fri", scans: 63, accuracy: 92 },
  { day: "Sat", scans: 110, accuracy: 93 },
  { day: "Sun", scans: 84, accuracy: 95 },
];

const kpiMetrics = [
  { label: "Avg Accuracy", value: "93.4%", change: "+2.1%", up: true, icon: <Target className="w-5 h-5" />, color: "#0070F3" },
  { label: "Avg Processing", value: "1.2s", change: "-0.3s", up: true, icon: <Zap className="w-5 h-5" />, color: "#10B981" },
  { label: "Food Score Avg", value: "7.8/10", change: "+0.4", up: true, icon: <Utensils className="w-5 h-5" />, color: "#10B981" },
  { label: "Emotion Precision", value: "88.1%", change: "-1.2%", up: false, icon: <Smile className="w-5 h-5" />, color: "#0EA5E9" },
];

const TOOLTIP_STYLE = {
  contentStyle: {
    background: "#FFFFFF",
    border: "1px solid #E2E8F0",
    borderRadius: "8px",
    color: "#0F172A",
    fontSize: "12px",
  },
};

export default function AnalyticsPage() {
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
          <Link
            href="/camera"
            className="flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-lg bg-[#0070F3] hover:bg-[#0051B3] text-white text-sm font-semibold shadow-sm transition-colors"
          >
            <Camera className="w-4 h-4" />
            New Analysis
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

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-slate-900 font-display">Analytics</h1>
            <p className="text-sm text-slate-500 mt-1">Deep-dive into your AI performance metrics.</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#10B981] font-mono bg-emerald-50 border border-emerald-150 px-2.5 py-1 rounded-full">
            <Activity className="w-3.5 h-3.5" />
            <span>Live data stream</span>
          </div>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {kpiMetrics.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white border border-slate-200 p-5 rounded-xl hover-card shadow-sm"
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ background: `${m.color}10`, color: m.color }}
                >
                  {m.icon}
                </div>
                <span
                  className={`text-xs font-bold flex items-center gap-0.5 px-2 py-0.5 rounded border ${
                    m.up 
                      ? "text-emerald-600 bg-emerald-50 border-emerald-100" 
                      : "text-red-600 bg-red-50 border-red-100"
                  }`}
                >
                  {m.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {m.change}
                </span>
              </div>
              <div className="text-2xl font-black mb-1" style={{ color: m.color }}>
                {m.value}
              </div>
              <div className="text-xs text-slate-500 font-medium">{m.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Charts row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Monthly trends */}
          <div className="lg:col-span-2 bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="font-semibold text-slate-900 text-sm">Monthly Scan Trends</div>
                <div className="text-xs text-slate-500 mt-0.5">By analysis category</div>
              </div>
              <div className="text-xs text-slate-400 font-mono">Last 6 months</div>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={monthlyData} margin={{ top: 0, right: 0, left: -28, bottom: 0 }}>
                <defs>
                  <linearGradient id="gFood" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gRoom" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0070F3" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#0070F3" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gEmo" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip {...TOOLTIP_STYLE} />
                <Legend
                  wrapperStyle={{ fontSize: "11px", color: "#64748B", paddingTop: "12px" }}
                />
                <Area type="monotone" dataKey="food" stroke="#10B981" strokeWidth={2} fill="url(#gFood)" name="Food" />
                <Area type="monotone" dataKey="room" stroke="#0070F3" strokeWidth={2} fill="url(#gRoom)" name="Room" />
                <Area type="monotone" dataKey="emotion" stroke="#0EA5E9" strokeWidth={2} fill="url(#gEmo)" name="Emotion" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Radar */}
          <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
            <div className="font-semibold text-slate-900 text-sm mb-1">AI Performance</div>
            <div className="text-xs text-slate-500 mb-3">Multi-metric radar</div>
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#E2E8F0" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: "#64748B", fontSize: 10 }} />
                <Radar name="Score" dataKey="A" stroke="#0070F3" fill="#0070F3" fillOpacity={0.15} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Model accuracy bars */}
          <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
            <div className="font-semibold text-slate-900 text-sm mb-1">Model Accuracy by Task</div>
            <div className="text-xs text-slate-500 mb-5">Detection precision %</div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={accuracyData} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                <XAxis type="number" domain={[80, 100]} tick={{ fill: "#64748B", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fill: "#64748B", fontSize: 10 }} axisLine={false} tickLine={false} width={110} />
                <Tooltip {...TOOLTIP_STYLE} />
                <Bar dataKey="accuracy" fill="#0070F3" radius={[0, 6, 6, 0]} opacity={0.8} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Weekly dual line */}
          <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
            <div className="font-semibold text-slate-900 text-sm mb-1">Weekly Scans vs Accuracy</div>
            <div className="text-xs text-slate-500 mb-5">Correlation view — this week</div>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={weeklyTrend} margin={{ top: 0, right: 10, left: -28, bottom: 0 }}>
                <XAxis dataKey="day" tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip {...TOOLTIP_STYLE} />
                <Legend wrapperStyle={{ fontSize: "11px", color: "#64748B", paddingTop: "12px" }} />
                <Line type="monotone" dataKey="scans" stroke="#10B981" strokeWidth={2} dot={false} name="Scans" />
                <Line type="monotone" dataKey="accuracy" stroke="#0070F3" strokeWidth={2} dot={false} name="Accuracy %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>
    </div>
  );
}
