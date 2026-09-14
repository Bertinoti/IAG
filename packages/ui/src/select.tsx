import type { SelectHTMLAttributes } from "react";

export function Select({
  label,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { label?: string }) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      {
        <select
          {...props}
          className={`mt-1 w-full rounded-xl border bg-white px-3 py-2.5 focus:border-brand-500 focus:outline-none ${props.className ?? ""}`}
        >
          {children}
        </select>
      }
    </label>
  );
}
