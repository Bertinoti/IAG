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
  const option = {
    title: { text: title, left: "center", textStyle: { fontSize: 14 } },
    tooltip: {},
    xAxis: { type: "category", data: items.map((i) => i.label) },
    yAxis: { type: "value" },
    series: [
      {
        type: "bar",
        data: items.map((i) => i.value),
        itemStyle: { color: "#0f172a" },
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
