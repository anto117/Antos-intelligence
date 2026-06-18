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
  Eye,
  Utensils,
  Home,
  Smile,
  TrendingUp,
  Zap,
  ArrowUpRight,
  Activity,
  ChevronLeft
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const sidebarItems = [
  { icon: <LayoutDashboard className="w-4 h-4" />, label: "Overview", href: "/dashboard", active: true },
  { icon: <Camera className="w-4 h-4" />, label: "Camera", href: "/camera" },
  { icon: <FileText className="w-4 h-4" />, label: "Reports", href: "/reports" },
  { icon: <Clock className="w-4 h-4" />, label: "History", href: "/history" },
  { icon: <BarChart3 className="w-4 h-4" />, label: "Analytics", href: "/analytics" },
  { icon: <Settings className="w-4 h-4" />, label: "Settings", href: "/settings" },
];

const kpiCards = [
  {
    label: "Total Scans",
    value: "2,847",
    change: "+18.2%",
    icon: <Eye className="w-5 h-5" />,
    color: "#0070F3", // Primary Blue
    sub: "All time",
  },
  {
    label: "Food Analyses",
    value: "1,293",
    change: "+24.1%",
    icon: <Utensils className="w-5 h-5" />,
    color: "#10B981", // Emerald Green
    sub: "This month",
  },
  {
    label: "Room Analyses",
    value: "748",
    change: "+9.8%",
    icon: <Home className="w-5 h-5" />,
    color: "#3B82F6", // Royal Blue
    sub: "This month",
  },
  {
    label: "Emotion Scans",
    value: "806",
    change: "+31.5%",
    icon: <Smile className="w-5 h-5" />,
    color: "#0EA5E9", // Sky Blue
    sub: "This month",
  },
];

const activityData = [
  { day: "Mon", scans: 42 },
  { day: "Tue", scans: 78 },
  { day: "Wed", scans: 55 },
  { day: "Thu", scans: 91 },
  { day: "Fri", scans: 63 },
  { day: "Sat", scans: 110 },
  { day: "Sun", scans: 84 },
];

const pieData = [
  { name: "Food", value: 45, color: "#10B981" },
  { name: "Room", value: 26, color: "#0070F3" },
  { name: "Emotion", value: 29, color: "#0EA5E9" },
];

const recentScans = [
  { type: "food", label: "Pasta Carbonara", time: "2 min ago", score: 8.1, color: "#10B981" },
  { type: "room", label: "Home Office", time: "15 min ago", score: 7.4, color: "#0070F3" },
  { type: "emotion", label: "Interview Session", time: "1 hr ago", score: 8.9, color: "#0EA5E9" },
  { type: "food", label: "Fruit Salad", time: "3 hr ago", score: 9.2, color: "#10B981" },
  { type: "room", label: "Bedroom", time: "Yesterday", score: 6.8, color: "#0070F3" },
];

const typeIcons: Record<string, React.ReactNode> = {
  food: <Utensils className="w-3.5 h-3.5" />,
  room: <Home className="w-3.5 h-3.5" />,
  emotion: <Smile className="w-3.5 h-3.5" />,
};

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-[#0F172A]">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 border-r border-slate-200 bg-white p-4 gap-1">
        {/* Logo */}
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
            <ChevronLeft className="w-4 h-4" />
            Back to Portal
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

      {/* Main content */}
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        {/* Mobile back link & top bar */}
        <div className="flex items-center justify-between mb-6 lg:hidden">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-[#0070F3] font-semibold">
            <ChevronLeft className="w-4 h-4" /> Portal
          </Link>
          <div className="text-right">
            <span className="text-xs font-bold text-slate-800">Antos Intelligence</span>
          </div>
        </div>

        {/* Top bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-black text-slate-900 font-display">Overview</h1>
            <p className="text-sm text-slate-500 mt-1">Welcome back! Here's your AI activity summary.</p>
          </div>
          <div className="flex items-center gap-3 self-start sm:self-auto">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono bg-white border border-slate-200 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-slate-600">Diagnostics OK</span>
            </div>
            <Link
              href="/camera"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0070F3] hover:bg-[#0051B3] text-white text-sm font-semibold shadow-sm transition-all"
            >
              <Zap className="w-4 h-4" />
              Start Scan
            </Link>
          </div>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {kpiCards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white border border-slate-200 p-5 rounded-xl hover-card shadow-sm"
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ background: `${card.color}10`, color: card.color }}
                >
                  {card.icon}
                </div>
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">
                  <TrendingUp className="w-3 h-3" />
                  {card.change}
                </span>
              </div>
              <div
                className="text-2xl font-black mb-1"
                style={{ color: card.color }}
              >
                {card.value}
              </div>
              <div className="text-xs text-slate-500 font-medium">{card.label}</div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5 uppercase">{card.sub}</div>
            </motion.div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Activity chart */}
          <div className="lg:col-span-2 bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="font-semibold text-slate-900 text-sm">Weekly Activity</div>
                <div className="text-xs text-slate-500 mt-0.5">Scans per day this week</div>
              </div>
              <div className="text-xs text-slate-400 font-mono">Last 7 days</div>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={activityData} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
                <defs>
                  <linearGradient id="scanGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0070F3" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#0070F3" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "8px", color: "#0F172A", fontSize: 12 }}
                />
                <Area type="monotone" dataKey="scans" stroke="#0070F3" strokeWidth={2} fill="url(#scanGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Pie chart */}
          <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
            <div className="font-semibold text-slate-900 text-sm mb-1">Scan Distribution</div>
            <div className="text-xs text-slate-500 mb-4">By analysis type</div>
            <div className="flex justify-center mb-4">
              <PieChart width={120} height={120}>
                <Pie data={pieData} cx={55} cy={55} innerRadius={30} outerRadius={55} dataKey="value" strokeWidth={0}>
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </div>
            <div className="flex flex-col gap-2">
              {pieData.map((d) => (
                <div key={d.name} className="flex items-center justify-between border-t border-slate-50 pt-1.5 first:border-0 first:pt-0">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                    <span className="text-xs text-slate-500">{d.name}</span>
                  </div>
                  <span className="text-xs font-bold" style={{ color: d.color }}>{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent scans */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
            <div className="font-semibold text-slate-900 text-sm">Recent Scans</div>
            <Link href="/history" className="flex items-center gap-1 text-xs text-[#0070F3] hover:underline font-semibold">
              View all <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {recentScans.map((scan, i) => (
            <div
              key={i}
              className="flex items-center gap-4 px-5 py-3.5 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: `${scan.color}10`, color: scan.color }}
              >
                {typeIcons[scan.type]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-slate-800">{scan.label}</div>
                <div className="text-xs text-slate-400 font-mono">{scan.time}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold" style={{ color: scan.color }}>
                  {scan.score}/10
                </div>
                <div className="text-[10px] text-slate-400 uppercase font-mono">AI Rating</div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
