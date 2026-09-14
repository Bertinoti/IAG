export function Badge({
  children,
  tone = "neutral",
}: {
  children: string;
  tone?: "neutral" | "brand" | "success" | "danger";
}) {
  const styles = {
    neutral: "bg-slate-100 text-slate-700",
    brand: "bg-brand-50 text-brand-700",
    success: "bg-emerald-50 text-emerald-700",
    danger: "bg-rose-50 text-rose-700",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${styles[tone]}`}
    >
      {children}
    </span>
  );
}
