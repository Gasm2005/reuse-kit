"use client";

// Reused from Recharts (MIT-licensed, https://recharts.org) rather than
// hand-drawing SVG bars — a chart is exactly the kind of thing an
// established, battle-tested library does better than a one-off.
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

// Matches the site's own palette rather than Recharts' default blues — Won
// gets the accent colour since it's the number that actually matters, Lost
// is muted red, everything mid-pipeline is the neutral ink tone.
const BAR_COLOR: Record<string, string> = {
  New: "#A8813F",
  Contacted: "#6E6045",
  "Ready to Visit": "#8A6E42",
  Visited: "#5A7A8A",
  Negotiating: "#B08A46",
  Won: "#3F6B4A",
  Lost: "#A8422C",
};

export default function PipelineChart({
  data,
}: {
  data: { stage: string; count: number }[];
}) {
  return (
    <div className="h-[260px] -ml-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
          <CartesianGrid vertical={false} stroke="rgba(43,27,18,0.08)" />
          <XAxis
            dataKey="stage"
            tick={{ fontSize: 12, fill: "#6E6045" }}
            axisLine={{ stroke: "rgba(43,27,18,0.12)" }}
            tickLine={false}
            interval={0}
            angle={-20}
            textAnchor="end"
            height={50}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 12, fill: "#6E6045" }}
            axisLine={false}
            tickLine={false}
            width={28}
          />
          <Tooltip
            cursor={{ fill: "rgba(43,27,18,0.05)" }}
            contentStyle={{
              background: "#FCFAF4",
              border: "1px solid rgba(43,27,18,0.12)",
              borderRadius: 8,
              fontSize: 13,
            }}
          />
          <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={48}>
            {data.map((d) => (
              <Cell key={d.stage} fill={BAR_COLOR[d.stage] ?? "#A8813F"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
