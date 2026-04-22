"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface DayData {
  day: string;
  updates: number;
  blockers: number;
}

interface ActivityChartProps {
  data: DayData[];
}

export function ActivityChart({ data }: ActivityChartProps) {
  return (
    <div style={{ width: "100%", height: 280 }}>
      <ResponsiveContainer>
        <BarChart data={data} barGap={4}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border)"
            vertical={false}
          />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 12, fill: "var(--text-tertiary)" }}
            tickLine={false}
            axisLine={{ stroke: "var(--border)" }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "var(--text-tertiary)" }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              fontSize: "13px",
              fontFamily: "var(--font-body)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            }}
            cursor={{ fill: "var(--surface-2)", radius: 4 }}
          />
          <Bar
            dataKey="updates"
            fill="var(--text-primary)"
            radius={[4, 4, 0, 0]}
            name="Updates"
          />
          <Bar
            dataKey="blockers"
            fill="var(--red)"
            radius={[4, 4, 0, 0]}
            name="Blockers"
            opacity={0.7}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
