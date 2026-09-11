import type { InputHTMLAttributes } from "react";
export function Input(props: InputHTMLAttributes<HTMLInputElement>) { return <input {...props} className={props.className ?? "rounded border px-3 py-2"} />; }
