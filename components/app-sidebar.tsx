"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
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
    <div className="min-h-screen flex bg-white font-sans">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col w-64 bg-white border-r-4 border-black transition-transform duration-200
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:inset-auto`}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 px-6 py-5 border-b-4 border-black">
            <Image src="/icon.svg" alt="Diksyo Icon" width={24} height={24} className="w-6 h-6" />
          <span className="text-black font-black uppercase tracking-tighter text-xl italic">
            DIKSYO
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-6 flex flex-col gap-4">
          {navItems.map(({ href, icon: Icon, label }) => {
            const isActive = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 border-2 border-black transition-all uppercase tracking-tighter text-sm font-bold rounded-none
                ${
                  isActive
                    ? "bg-yellow-400 shadow-[4px_4px_0_0_#000] translate-x-[-2px] translate-y-[-2px]"
                    : "bg-white hover:bg-yellow-100 hover:translate-x-[2px] border-black text-black"
                }`}
              >
                <Icon className="w-5 h-5" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="px-4 pb-6 border-t-4 border-black pt-6">
          <form action={logout}>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-black bg-white hover:bg-red-400 hover:text-black transition-all uppercase tracking-tighter text-sm font-bold text-black"
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
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b-4 border-black">
          <span className="text-black font-black uppercase tracking-tighter text-xl italic">
            DIKSYO
          </span>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="text-black p-1.5 border-2 border-black bg-white shadow-[2px_2px_0_0_#000] hover:bg-yellow-400 hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </header>

        <main className="flex-1 overflow-auto p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}