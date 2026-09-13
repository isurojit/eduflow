"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ScoreTrendPoint, SubjectPerformance } from "@/lib/analytics/performance";

const tooltipStyle = {
  background: "#11090B",
  border: "1px solid rgba(255,255,255,.08)",
  borderRadius: 0,
  color: "#F7F2F3",
  fontSize: 12,
};

function shortDate(value: string) {
  const date = new Date(value);
  return new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short" }).format(date);
}

export function ScoreTrendChart({ data }: { data: ScoreTrendPoint[] }) {
  return (
    <div className="h-[270px] w-full" role="img" aria-label="Line chart of test scores over time">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 16, right: 12, left: -20, bottom: 0 }}>
          <CartesianGrid stroke="rgba(255,255,255,.055)" vertical={false} />
          <XAxis dataKey="date" tickFormatter={shortDate} tick={{ fill: "#807478", fontSize: 10 }} tickLine={false} axisLine={false} />
          <YAxis domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} tick={{ fill: "#807478", fontSize: 10 }} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={tooltipStyle}
            labelFormatter={(value) => shortDate(String(value))}
            formatter={(value, _name, props) => [`${value}/10 · ${props.payload.topicName}`, props.payload.subjectName]}
          />
          <Line type="monotone" dataKey="score" stroke="#C52845" strokeWidth={2.2} dot={{ r: 3, fill: "#090708", stroke: "#C52845", strokeWidth: 2 }} activeDot={{ r: 4 }} isAnimationActive />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SubjectPerformanceChart({ data }: { data: SubjectPerformance[] }) {
  const chartData = data.filter((item) => item.average !== null).map((item) => ({ ...item, average: Number(item.average?.toFixed(2)) }));
  return (
    <div className="h-[280px] w-full" role="img" aria-label="Bar chart of average scores by subject">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 16, right: 8, left: -20, bottom: 8 }}>
          <CartesianGrid stroke="rgba(255,255,255,.055)" vertical={false} />
          <XAxis dataKey="subjectName" tick={{ fill: "#807478", fontSize: 10 }} tickLine={false} axisLine={false} interval={0} tickFormatter={(value) => String(value).length > 12 ? `${String(value).slice(0, 10)}…` : String(value)} />
          <YAxis domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} tick={{ fill: "#807478", fontSize: 10 }} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${value}/10`, "Average"]} />
          <Bar dataKey="average" fill="#78152A" radius={[2, 2, 0, 0]} isAnimationActive />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
