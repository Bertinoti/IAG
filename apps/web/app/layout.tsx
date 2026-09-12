import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Airline AI Agent",
  description: "Local foundation",
};
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="bg-slate-50">
      <body>{children}</body>
    </html>
  );
}
