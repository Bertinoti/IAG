import type { ButtonHTMLAttributes } from "react";

export function Button(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={
        props.className ?? "rounded-md bg-slate-900 px-4 py-2 text-white"
      }
    />
  );
}
