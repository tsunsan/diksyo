"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="bg-black border-[2px] border-[#FFE500] px-3 py-2"
        style={{ fontFamily: "'Geist', 'Inter', sans-serif" }}
      >
        <p className="text-[#FFE500] text-xs uppercase tracking-wider" style={{ fontWeight: 800 }}>
          {label}
        </p>
        <p className="text-white text-sm" style={{ fontWeight: 900 }}>
          {payload[0].value}
          {payload[0].name === "accuracy" ? "%" : " words"}
        </p>
      </div>
    );
  }
  return null;
};

export function WeeklyWordsChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} barSize={28}>
        <CartesianGrid
          strokeDasharray="0"
          stroke="#eee"
          vertical={false}
        />
        <XAxis
          dataKey="day"
          tick={{ fontWeight: 800, fontSize: 10, fill: "#000" }}
          axisLine={{ stroke: "#000", strokeWidth: 2 }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontWeight: 700, fontSize: 10, fill: "#888" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ fill: "#FFE500", opacity: 0.3 }}
        />
        <Bar
          dataKey="words"
          fill="#0057FF"
          stroke="#000"
          strokeWidth={2}
          radius={0}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function AccuracyTrendChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data}>
        <defs>
          <linearGradient
            id="accuracyGrad"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop
              offset="5%"
              stopColor="#00C853"
              stopOpacity={0.4}
            />
            <stop
              offset="95%"
              stopColor="#00C853"
              stopOpacity={0.0}
            />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="0"
          stroke="#eee"
          vertical={false}
        />
        <XAxis
          dataKey="week"
          tick={{ fontWeight: 800, fontSize: 10, fill: "#000" }}
          axisLine={{ stroke: "#000", strokeWidth: 2 }}
          tickLine={false}
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fontWeight: 700, fontSize: 10, fill: "#888" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) => `${v}%`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="step"
          dataKey="accuracy"
          stroke="#00C853"
          strokeWidth={3}
          fill="url(#accuracyGrad)"
          activeDot={{
            r: 7,
            fill: "#FFE500",
            stroke: "#000",
            strokeWidth: 2,
          }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
