"use client";
import dynamic from "next/dynamic";
const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });
export function Chart({
  title,
  items,
}: {
  title: string;
  items: { label: string; value: number }[];
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
      trigger: "axis",
      axisPointer: { type: "shadow" },
      backgroundColor: "#27272a",
      borderWidth: 0,
      textStyle: { color: "#fff" },
    },
    grid: { left: 42, right: 18, top: 58, bottom: 38, containLabel: true },
    xAxis: {
      type: "category",
      data: items.map((i) => i.label),
      axisLabel: { color: "#71717a" },
      axisLine: { lineStyle: { color: "#e4e4e7" } },
    },
    yAxis: {
      type: "value",
      axisLabel: { color: "#a1a1aa" },
      splitLine: { lineStyle: { color: "#f4f4f5", type: "dashed" } },
    },
    series: [
      {
        type: "bar",
        data: items.map((i) => i.value),
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
