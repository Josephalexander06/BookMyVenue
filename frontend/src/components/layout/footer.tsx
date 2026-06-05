"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { roleRoutes } from "@/lib/config";
import type { UserRole } from "@/types/auth";

export function Footer() {
  const { isAuthenticated, user } = useAuthStore();
  const dashboardRoute = user ? roleRoutes[user.role as UserRole] : "/";

  return (
    <footer className="bg-nav">
      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Three-column grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {/* Column 1: Brand */}
          <div>
            <span className="text-lg font-semibold tracking-tight text-white">
              BookMyVenue
            </span>
            <p className="mt-2 text-sm text-white/40">
              Discover &amp; book the perfect venue for every occasion.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="mb-3 text-xs font-medium uppercase tracking-wider text-white/60">
              Quick Links
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/venues"
                  className="text-sm text-white/50 transition hover:text-white"
                >
                  Explore
                </Link>
              </li>
              <li>
                {isAuthenticated ? (
                  <Link
                    href={dashboardRoute}
                    className="text-sm text-white/50 transition hover:text-white"
                  >
                    Dashboard
                  </Link>
                ) : (
                  <Link
                    href="/auth/login"
                    className="text-sm text-white/50 transition hover:text-white"
                  >
                    Sign In
                  </Link>
                )}
              </li>
              <li>
                <Link
                  href="/venues"
                  className="text-sm text-white/50 transition hover:text-white"
                >
                  List Your Venue
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Support */}
          <div>
            <h4 className="mb-3 text-xs font-medium uppercase tracking-wider text-white/60">
              Support
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#"
                  className="text-sm text-white/50 transition hover:text-white"
                >
                  Help
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-white/50 transition hover:text-white"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-white/50 transition hover:text-white"
                >
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 border-t border-white/10 pt-6">
          <p className="text-center text-xs text-white/30">
            &copy; 2026 BookMyVenue. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
