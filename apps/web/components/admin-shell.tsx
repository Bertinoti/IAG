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
      <aside className="border-b bg-white lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between px-4 py-4 lg:block lg:px-5 lg:py-5">
          <Link
            href="/dashboard"
            className="text-lg font-semibold tracking-tight text-ink"
          >
            IAG <span className="font-normal text-slate-400">workspace</span>
          </Link>
          <button
            type="button"
            className="rounded-lg border px-3 py-2 text-sm text-slate-600 lg:hidden"
            aria-expanded={menuOpen}
            aria-controls="admin-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            Menu
          </button>
        </div>
        <nav
          id="admin-navigation"
          className={`${menuOpen ? "flex" : "hidden"} flex-col gap-1 px-3 pb-3 lg:flex lg:space-y-1 lg:px-3`}
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
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="hidden flex-1 lg:block" />
        <div className="hidden border-t p-4 lg:block">
          <button
            onClick={signOut}
            className="w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-ink"
          >
            Sign out
          </button>
        </div>
      </aside>
      <div className="min-w-0 flex-1 lg:ml-64">{children}</div>
    </div>
  );
}
