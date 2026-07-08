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
  Settings,
} from "lucide-react";
import { useState } from "react";
import { logout } from "@/app/actions/auth";

const navItems = [
  { href: "/dictionary", icon: BookOpen, label: "Dictionary" },
  { href: "/vault", icon: BookMarked, label: "Vocabulary Vault" },
  { href: "/quiz", icon: Zap, label: "Quick Quiz" },
  { href: "/stats", icon: LayoutDashboard, label: "Statistics" },
];

export function AppSidebar({
  children,
  user,
}: {
  children: React.ReactNode;
  user?: { username: string; email: string; avatar_url?: string | null; levelName?: string; levelColor?: string; levelIndex?: number };
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="h-screen flex bg-[#f4f1ea] font-sans overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col w-64 bg-[#f4f1ea] border-r-4 border-black transition-transform duration-200
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
                className={`flex items-center gap-3 px-4 py-3 border-4 border-black transition-all uppercase tracking-tighter text-sm font-bold rounded-none
                ${
                  isActive
                    ? "bg-yellow-400 shadow-[4px_4px_0_0_#000] translate-x-[-2px] translate-y-[-2px]"
                    : "bg-[#f4f1ea] hover:bg-yellow-100 hover:translate-x-[2px] border-black text-black"
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
          <div className="flex flex-col border-4 border-black bg-white shadow-[4px_4px_0_0_#000]">
            {user && (
              <div className="flex items-center gap-3 p-3 border-b-4 border-black bg-[#f4f1ea]">
                <div className="w-10 h-10 rounded-full border-2 border-black bg-yellow-400 flex items-center justify-center shrink-0 overflow-hidden">
                  {user.avatar_url ? (
                    <Image 
                      src={user.avatar_url} 
                      alt={user.username} 
                      width={40} 
                      height={40} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-black"
                    >
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  )}
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="font-bold text-sm uppercase tracking-tighter truncate text-black leading-tight">
                    {user.username}
                  </span>
                  <div className="mt-1 flex items-center gap-1.5 bg-white border-2 border-black rounded-full pl-0.5 pr-2.5 py-0.5 w-max shadow-[2px_2px_0_0_#000]">
                    <div
                      className="w-4 h-4 shrink-0 rounded-full border-2 border-black flex items-center justify-center"
                      style={{ background: user.levelColor || "#8B5E3C" }}
                    >
                      <span
                        className="font-black leading-none"
                        style={{
                          fontSize: '9px',
                          color: (user.levelColor === '#EAB308' || user.levelColor === '#FFE500') ? '#000' : '#fff',
                        }}
                      >
                        {user.levelIndex || 1}
                      </span>
                    </div>
                    <span
                      className="text-black uppercase tracking-tighter truncate text-[10px] font-black"
                    >
                      {user.levelName || "BAGUHAN"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex bg-white">
              <Link
                href="/profile"
                onClick={() => setMobileOpen(false)}
                className="flex-1 flex items-center justify-center gap-1.5 py-3 px-1 border-r-4 border-black hover:bg-yellow-400 transition-colors group"
                title="Profile & Settings"
              >
                <Settings className="w-4 h-4 text-black group-hover:rotate-90 transition-transform duration-300 shrink-0" />
                <span className="uppercase tracking-tighter text-xs font-bold text-black">
                  SETTINGS
                </span>
              </Link>
              
              <form action={logout} className="flex-1 flex">
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-1.5 py-3 px-1 hover:bg-red-400 transition-colors group"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4 text-black group-hover:translate-x-1 transition-transform duration-300 shrink-0" />
                  <span className="uppercase tracking-tighter text-xs font-bold text-black">
                    LOGOUT
                  </span>
                </button>
              </form>
            </div>
          </div>
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
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-[#f4f1ea] border-b-4 border-black">
          <span className="text-black font-black uppercase tracking-tighter text-xl italic">
            DIKSYO
          </span>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="text-black p-1.5 border-4 border-black bg-[#f4f1ea] shadow-[2px_2px_0_0_#000] hover:bg-yellow-400 hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </header>

        <main className="flex-1 overflow-auto p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}