"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { logout } from "../lib/api";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: "▦" },
  { href: "/agent", label: "Agent", icon: "✦" },
  { href: "/airlines", label: "Airlines", icon: "✈" },
  { href: "/conversations", label: "Conversations", icon: "◌" },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const isAdminRoute = links.some(
    ({ href }) => pathname === href || pathname.startsWith(`${href}/`),
  );
  if (!isAdminRoute) return <>{children}</>;
  async function signOut() {
    await logout();
    router.replace("/login");
  }
  return (
    <div className="min-h-screen lg:flex">
      <aside className={`z-40 border-b bg-white lg:fixed lg:inset-y-0 lg:!flex lg:flex-col lg:border-b-0 lg:border-r ${collapsed ? "lg:w-20" : "lg:w-1/4"}`}>
        <div className="flex items-center justify-start gap-3 px-4 py-4 lg:block lg:px-5 lg:py-5">
          <button
            type="button"
            className="rounded-lg border px-3 py-2 text-sm text-slate-600 lg:hidden"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            aria-controls="admin-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Link
            href="/dashboard"
            className="text-lg font-semibold tracking-tight text-ink"
          >
            IAG <span className={collapsed ? "hidden" : "font-normal text-slate-400"}>workspace</span>
          </Link>
          <button type="button" className="hidden rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:inline-flex" aria-label={collapsed ? "Expand menu" : "Collapse menu"} onClick={() => setCollapsed((value) => !value)}>{collapsed ? "→" : "←"}</button>
          <button onClick={signOut} className="ml-auto rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-ink lg:fixed lg:right-6 lg:top-3" aria-label="Sign out">Sign out</button>
        </div>
        <nav
          id="admin-navigation"
          className="hidden flex-col gap-1 px-3 pb-3 lg:!flex lg:space-y-1 lg:px-3"
          aria-label="Backoffice navigation"
        >
          {links.map((link) => {
            const active =
              pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition lg:w-full ${active ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-50 hover:text-ink"}`}
                onClick={() => setMenuOpen(false)}
              >
                <span className="w-5 text-center text-base">{link.icon}</span>
                <span className={collapsed ? "hidden" : ""}>{link.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="hidden flex-1 lg:block" />
      </aside>
      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Backoffice navigation">
          <button type="button" className="absolute inset-0 bg-slate-900/40" aria-label="Close menu" onClick={() => setMenuOpen(false)} />
          <aside className="relative h-full w-72 max-w-[85vw] bg-white p-4 shadow-xl">
            <div className="flex cursor-pointer items-center justify-between border-b pb-4" onClick={() => setMenuOpen(false)}>
              <span className="font-semibold text-ink">Navigation</span>
              <button type="button" className="rounded-lg p-2 text-xl text-slate-500 hover:bg-slate-100" aria-label="Close menu" onClick={() => setMenuOpen(false)}>×</button>
            </div>
            <nav className="mt-4 flex flex-col gap-1" aria-label="Backoffice navigation">
              {links.map((link) => {
                const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
                return <Link key={link.href} href={link.href} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium ${active ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-50"}`} onClick={() => setMenuOpen(false)}><span className="w-5 text-center">{link.icon}</span>{link.label}</Link>;
              })}
            </nav>
          </aside>
        </div>
      )}
      <div className={`min-w-0 flex-1 ${collapsed ? "lg:ml-20" : "lg:ml-[25%]"}`}>
        {children}
      </div>
    </div>
  );
}
