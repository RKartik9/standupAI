"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface MemberData {
  name: string;
  updates: number;
}

interface MemberChartProps {
  data: MemberData[];
}

const colors = [
  "#1a1916",
  "#3d3b36",
  "#5e5c56",
  "#7f7d76",
  "#9b9890",
];

export function MemberChart({ data }: MemberChartProps) {
  const chartData = data.slice(0, 8).map((d) => ({
    ...d,
    name: d.name.split(" ")[0],
  }));

  return (
    <div style={{ width: "100%", height: 280 }}>
      <ResponsiveContainer>
        <BarChart data={chartData} layout="vertical" barSize={20}>
          <XAxis
            type="number"
            tick={{ fontSize: 12, fill: "var(--text-tertiary)" }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 12, fill: "var(--text-secondary)" }}
            tickLine={false}
            axisLine={false}
            width={80}
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
          <Bar dataKey="updates" radius={[0, 4, 4, 0]} name="Updates">
            {chartData.map((_, i) => (
              <Cell key={i} fill={colors[i % colors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
