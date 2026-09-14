"use client";
import dynamic from "next/dynamic";
const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });
export function Chart({
  title,
  items,
  type = "bar",
}: {
  title: string;
  items: { label: string; value: number }[];
  type?: "bar" | "pie";
}) {
  const palette = ["#737373", "#4f7188", "#5d8a88", "#b28a56", "#80677f"];
  const option = {
    color: palette,
    title: {
      text: title,
      left: 16,
      top: 10,
      textStyle: { fontSize: 14, fontWeight: 600, color: "#3f3f46" },
    },
    tooltip: {
      trigger: type === "pie" ? "item" : "axis",
      axisPointer: { type: "shadow" },
      backgroundColor: "#27272a",
      borderWidth: 0,
      textStyle: { color: "#fff" },
    },
    // Pie labels carry the share directly on each slice, so a separate legend
    // is unnecessary and would duplicate the information.
    legend:
      type === "pie"
        ? { show: true, bottom: 4, textStyle: { color: "#71717a" } }
        : undefined,
    grid:
      type === "bar"
        ? { left: 42, right: 18, top: 58, bottom: 38, containLabel: true }
        : undefined,
    xAxis:
      type === "bar"
        ? {
            type: "category",
            data: items.map((i) => i.label),
            axisLabel: { color: "#71717a" },
            axisLine: { lineStyle: { color: "#e4e4e7" } },
          }
        : undefined,
    yAxis:
      type === "bar"
        ? {
            type: "value",
            axisLabel: { color: "#a1a1aa" },
            splitLine: { lineStyle: { color: "#f4f4f5", type: "dashed" } },
          }
        : undefined,
    series: [
      {
        type,
        data:
          type === "pie"
            ? items.map((i) => ({ name: i.label, value: i.value }))
            : items.map((i) => i.value),
        radius: type === "pie" ? ["38%", "68%"] : undefined,
        center: type === "pie" ? ["50%", "56%"] : undefined,
        label:
          type === "pie"
            ? {
                show: true,
                formatter: (params: { percent: number }) =>
                  `${params.percent.toFixed(1)}%`,
                color: "#27272a",
                fontSize: 12,
                fontWeight: 600,
              }
            : undefined,
        labelLine: type === "pie" ? { show: false } : undefined,
        itemStyle: {
          color: (params: { dataIndex: number }) =>
            palette[params.dataIndex % palette.length],
          borderRadius: [6, 6, 0, 0],
        },
        barMaxWidth: 34,
      },
    ],
  };
  return items.length ? (
    <ReactECharts option={option} style={{ height: 260 }} />
  ) : (
    <p className="p-8 text-center text-sm text-slate-500">
      No data for this period.
    </p>
  );
}
