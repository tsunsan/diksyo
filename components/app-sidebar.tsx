"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  Zap,
  LayoutDashboard,
  LogOut,
  BookMarked,
  Menu,
  X,
  Flame,
} from "lucide-react";
import { useState } from "react";
import { logout } from "@/app/actions/auth";

const navItems = [
  // These links assume your authenticated routes will live under `/home/*`.
  // You would then create pages like `/app/home/dashboard/page.tsx`.
  { href: "/home/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/home/dictionary", icon: BookOpen, label: "Dictionary" },
  { href: "/home/quiz", icon: Zap, label: "Quick Quiz" },
];

export function AppSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-[#FFFBF0]">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col w-64 bg-black border-r-[3px] border-black transition-transform duration-200
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:inset-auto`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b-[3px] border-[#FFE500]">
          <div className="w-10 h-10 bg-[#FFE500] border-[2px] border-[#FFE500] flex items-center justify-center">
            <BookMarked className="w-5 h-5 text-black" />
          </div>
          <span
            className="text-white tracking-[0.2em] uppercase"
            style={{ fontWeight: 900, fontSize: "1.3rem" }}
          >
            DIKSYO
          </span>
        </div>

        {/* Streak pill */}
        <div className="mx-4 mt-4 flex items-center gap-2 bg-[#FF6D00] border-[2px] border-[#FFE500] px-4 py-2">
          <Flame className="w-5 h-5 text-[#FFE500]" fill="#FFE500" />
          <span className="text-white text-sm uppercase tracking-widest" style={{ fontWeight: 800 }}>
            12 DAY STREAK
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-6 flex flex-col gap-2">
          {navItems.map(({ href, icon: Icon, label }) => {
            const isActive = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 border-[2px] transition-all duration-100 uppercase tracking-widest text-sm
                ${
                  isActive
                    ? "bg-[#FFE500] border-[#FFE500] text-black shadow-[3px_3px_0_#FFE500]"
                    : "border-transparent text-[#aaa] hover:bg-[#1a1a1a] hover:border-[#FFE500] hover:text-[#FFE500]"
                }`}
                style={{ fontWeight: 800 }}
              >
                <Icon className="w-5 h-5" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="px-4 pb-6 border-t-[2px] border-[#222] pt-4">
          <form action={logout}>
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-4 py-3 border-[2px] border-transparent text-[#666] hover:border-red-500 hover:text-red-400 transition-all uppercase tracking-widest text-sm"
              style={{ fontWeight: 800 }}
            >
              <LogOut className="w-5 h-5" />
              LOGOUT
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile topbar */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-black border-b-[3px] border-[#FFE500]">
          <span
            className="text-white tracking-[0.2em] uppercase"
            style={{ fontWeight: 900, fontSize: "1.2rem" }}
          >
            DIKSYO
          </span>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="text-white p-1"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </header>

        <main className="flex-1 overflow-auto p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}