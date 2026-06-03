"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, Menu, User, LogOut, LayoutDashboard, Compass, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";
import { roleRoutes } from "@/lib/config";
import type { UserRole } from "@/types/auth";

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const dashboardRoute = user ? roleRoutes[user.role as UserRole] : "/";

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur-lg">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900">
            <Building2 className="h-4 w-4 text-white" />
          </div>
          <span className="text-[15px] font-bold tracking-tight text-slate-900">BookMyVenue</span>
        </Link>

        {/* Center Nav */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            href="/venues"
            className={`rounded-full px-4 py-2 text-[13px] font-medium transition-all ${
              pathname === "/venues"
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            Explore
          </Link>
          {isAuthenticated && user && (
            <Link
              href={dashboardRoute}
              className={`rounded-full px-4 py-2 text-[13px] font-medium transition-all ${
                pathname.startsWith("/dashboard")
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              Dashboard
            </Link>
          )}
        </nav>

        {/* Profile Pill */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 transition-all hover:shadow-soft active:scale-[0.97]"
            aria-label="User menu"
          >
            <Menu className="h-3.5 w-3.5 text-slate-500" />
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-slate-900 text-[10px] font-bold text-white">
              {isAuthenticated && user ? (
                user.role.substring(0, 1).toUpperCase()
              ) : (
                <User className="h-3.5 w-3.5" />
              )}
            </div>
          </button>

          {/* Dropdown */}
          {menuOpen && (
            <div className="absolute right-0 mt-2.5 w-52 rounded-xl border border-slate-100 bg-white py-1.5 shadow-hover animate-fade-in">
              {isAuthenticated && user ? (
                <>
                  <div className="px-3.5 py-2.5 border-b border-slate-50">
                    <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Account</p>
                    <p className="text-sm font-semibold text-slate-800 truncate mt-0.5">{user.phone}</p>
                    <span className="inline-block text-[10px] font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full mt-1.5 capitalize">
                      {user.role}
                    </span>
                  </div>

                  <div className="py-1">
                    <Link
                      href={dashboardRoute}
                      className="flex items-center gap-2.5 px-3.5 py-2 text-[13px] font-medium text-slate-700 hover:bg-slate-50 transition-colors rounded-lg mx-1"
                    >
                      <LayoutDashboard className="h-4 w-4 text-slate-400" />
                      Dashboard
                    </Link>
                    <Link
                      href="/venues"
                      className="flex items-center gap-2.5 px-3.5 py-2 text-[13px] font-medium text-slate-700 hover:bg-slate-50 transition-colors rounded-lg mx-1"
                    >
                      <Compass className="h-4 w-4 text-slate-400" />
                      Explore
                    </Link>
                  </div>

                  <div className="border-t border-slate-50 pt-1 mt-1">
                    <button
                      onClick={logout}
                      className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-[13px] font-medium text-red-600 hover:bg-red-50/50 transition-colors rounded-lg mx-1"
                    >
                      <LogOut className="h-4 w-4" />
                      Log out
                    </button>
                  </div>
                </>
              ) : (
                <div className="py-1">
                  <Link
                    href="/auth/login"
                    className="flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] font-semibold text-slate-800 hover:bg-slate-50 transition-colors rounded-lg mx-1"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/venues"
                    className="flex items-center gap-2.5 px-3.5 py-2 text-[13px] font-medium text-slate-600 hover:bg-slate-50 transition-colors rounded-lg mx-1"
                  >
                    Explore spaces
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
