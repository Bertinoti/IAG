import type { ReactNode } from "react";

export function Alert({
  children,
  variant = "info",
}: {
  children: ReactNode;
  variant?: "info" | "success" | "error" | "warning";
}) {
  const styles = {
    info: "border-sky-200 bg-sky-50 text-sky-800",
    success: "border-emerald-200 bg-emerald-50 text-emerald-800",
    error: "border-rose-200 bg-rose-50 text-rose-800",
    warning: "border-amber-200 bg-amber-50 text-amber-800",
  };
  return (
    <div
      className={`rounded-xl border px-4 py-3 text-sm ${styles[variant]}`}
      role="status"
    >
      {children}
    </div>
  );
}
