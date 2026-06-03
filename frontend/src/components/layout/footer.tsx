"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { roleRoutes } from "@/lib/config";
import type { UserRole } from "@/types/auth";

export function Footer() {
  const { isAuthenticated, user } = useAuthStore();
  const dashboardRoute = user ? roleRoutes[user.role as UserRole] : "/";

  return (
    <footer className="border-t border-slate-100 bg-white">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-5 sm:px-6">
        <p className="text-xs text-slate-400">&copy; {new Date().getFullYear()} BookMyVenue</p>
        <div className="flex items-center gap-4">
          <Link href="/venues" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
            Explore
          </Link>
          {isAuthenticated ? (
            <Link href={dashboardRoute} className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
              Dashboard
            </Link>
          ) : (
            <Link href="/auth/login" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
              Sign in
            </Link>
          )}
        </div>
      </div>
    </footer>
  );
}
