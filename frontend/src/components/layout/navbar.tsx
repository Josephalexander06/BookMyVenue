"use client";

import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import {
  Search,
  ChevronDown,
  Menu,
  X,
  User,
  LogOut,
  LayoutDashboard,
  Compass,
  Building2,
  MapPin,
} from "lucide-react";
import { useState, useRef, useEffect, Suspense } from "react";
import { useAuthStore } from "@/store/auth-store";
import { roleRoutes } from "@/lib/config";
import type { UserRole } from "@/types/auth";

/* ─── Constants ──────────────────────────────────────────────── */

const CITIES = [
  "All Cities",
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Chennai",
  "Kochi",
  "Hyderabad",
  "Pune",
  "Kolkata",
] as const;

const CATEGORY_TABS = [
  { label: "All", value: "" },
  { label: "Meeting Rooms", value: "meeting_room" },
  { label: "Cafes", value: "cafe" },
  { label: "Auditoriums", value: "auditorium" },
  { label: "Studios", value: "studio" },
  { label: "Outdoor", value: "outdoor" },
  { label: "Event Venues", value: "event_venue" },
  { label: "Community Centers", value: "community_center" },
] as const;

/* ─── Inner component that uses useSearchParams ──────────────── */

function NavbarInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isAuthenticated, logout, openLogin } = useAuthStore();

  const handleLogout = () => {
    logout();
    window.location.replace("/");
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  /* State */
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState<string>("All Cities");
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  /* Refs */
  const cityRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const mobileRef = useRef<HTMLDivElement>(null);

  /* Close dropdowns on outside click */
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (cityRef.current && !cityRef.current.contains(target)) {
        setCityDropdownOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(target)) {
        setProfileDropdownOpen(false);
      }
      if (mobileRef.current && !mobileRef.current.contains(target)) {
        setMobileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* Close everything on route change */
  useEffect(() => {
    setCityDropdownOpen(false);
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [pathname]);

  const dashboardRoute = user ? roleRoutes[user.role as UserRole] : "/";
  const activeType = searchParams.get("type") ?? "";
  const showCategoryRow = pathname === "/" || pathname === "/venues";

  /* Handlers */
  function handleSearch(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && searchQuery.trim()) {
      router.push(`/venues?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  }

  function handleMobileSearch() {
    if (searchQuery.trim()) {
      router.push(`/venues?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  }

  /* ─── RENDER ─────────────────────────────────────────────── */
  return (
    <header className="sticky top-0 z-50">
      {/* ━━━ TOP BAR ━━━ */}
      <div
        style={{ backgroundColor: "#1A1D2E" }}
        className="relative"
      >
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          {/* ── Logo ── */}
          <Link
            href="/"
            className="flex flex-shrink-0 items-center gap-2 transition-opacity hover:opacity-80"
          >
            <Building2 className="h-5 w-5 text-white/90" />
            <span className="text-[15px] font-bold tracking-tight">
              <span className="text-white">Book</span>
              <span style={{ color: "#F84464" }}>My</span>
              <span className="text-white">Venue</span>
            </span>
          </Link>

          {/* ── Search Bar (hidden on mobile) ── */}
          {pathname !== "/" && (
            <div
              className="hidden md:flex items-center justify-center flex-1 max-w-xl mx-4 transition-all duration-300"
              style={{ maxWidth: searchFocused ? "36rem" : "32rem" }}
            >
              <div
                className="relative w-full group"
              >
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40 transition-colors group-focus-within:text-white/70" />
                <input
                  type="text"
                  placeholder="Search for venues, spaces and events"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearch}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  className="w-full rounded-full border border-white/10 bg-white/10 py-2 pl-10 pr-4 text-sm text-white placeholder-white/40 outline-none backdrop-blur-sm transition-all duration-300 focus:border-white/25 focus:bg-white/[0.14] focus:ring-1 focus:ring-white/10"
                />
              </div>
            </div>
          )}

          {/* ── Right Section ── */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* City Dropdown (hidden on mobile) */}
            <div className="relative hidden md:block" ref={cityRef}>
              <button
                onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-white/80 transition-all hover:bg-white/10 hover:text-white"
              >
                <MapPin className="h-3.5 w-3.5" />
                <span className="max-w-[80px] truncate text-[13px] font-medium">
                  {selectedCity}
                </span>
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform duration-200 ${
                    cityDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {cityDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl border border-gray-100 bg-white py-1.5 shadow-hover animate-fade-in z-50">
                  {CITIES.map((city) => (
                    <button
                      key={city}
                      onClick={() => {
                        setSelectedCity(city);
                        setCityDropdownOpen(false);
                      }}
                      className={`flex w-full items-center gap-2.5 px-4 py-2 text-left text-[13px] font-medium transition-colors ${
                        selectedCity === city
                          ? "bg-accent-light text-accent"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <MapPin className="h-3.5 w-3.5 flex-shrink-0 opacity-50" />
                      {city}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Auth: Sign In or Avatar */}
            {!isAuthenticated ? (
              <button
                onClick={() => openLogin()}
                className="rounded-lg px-4 py-1.5 text-[13px] font-semibold text-white transition-all hover:brightness-110 active:scale-[0.97]"
                style={{ backgroundColor: "#F84464" }}
              >
                Sign In
              </button>
            ) : (
              <div className="relative hidden md:block" ref={profileRef}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-[12px] font-bold text-white transition-all hover:ring-2 hover:ring-white/30 active:scale-95"
                  style={{ backgroundColor: "#F84464" }}
                  aria-label="User menu"
                >
                  {user?.role?.substring(0, 1).toUpperCase() ?? (
                    <User className="h-4 w-4" />
                  )}
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2.5 w-56 rounded-xl border border-gray-100 bg-white py-1.5 shadow-hover animate-fade-in z-50">
                    {/* User info */}
                    <div className="border-b border-gray-100 px-4 py-3">
                      <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
                        Account
                      </p>
                      <p className="mt-0.5 truncate text-sm font-semibold text-gray-800">
                        {user?.phone}
                      </p>
                      <span
                        className="mt-1.5 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider capitalize"
                        style={{
                          backgroundColor: "#FFECEF",
                          color: "#F84464",
                        }}
                      >
                        {user?.role}
                      </span>
                    </div>

                    {/* Links */}
                    <div className="py-1">
                      <Link
                        href={dashboardRoute}
                        className="mx-1 flex items-center gap-2.5 rounded-lg px-3.5 py-2 text-[13px] font-medium text-gray-700 transition-colors hover:bg-gray-50"
                      >
                        <LayoutDashboard className="h-4 w-4 text-gray-400" />
                        Dashboard
                      </Link>
                      {user?.role === "customer" && (
                        <Link
                          href="/dashboard/customer/profile"
                          className="mx-1 flex items-center gap-2.5 rounded-lg px-3.5 py-2 text-[13px] font-medium text-gray-700 transition-colors hover:bg-gray-50"
                        >
                          <User className="h-4 w-4 text-gray-400" />
                          My Profile
                        </Link>
                      )}
                      <Link
                        href="/venues"
                        className="mx-1 flex items-center gap-2.5 rounded-lg px-3.5 py-2 text-[13px] font-medium text-gray-700 transition-colors hover:bg-gray-50"
                      >
                        <Compass className="h-4 w-4 text-gray-400" />
                        Explore
                      </Link>
                    </div>

                    {/* Logout */}
                    <div className="mt-1 border-t border-gray-100 pt-1">
                      <button
                        onClick={handleLogout}
                        className="mx-1 flex w-full items-center gap-2.5 rounded-lg px-3.5 py-2 text-left text-[13px] font-medium transition-colors hover:bg-red-50/60"
                        style={{ color: "#F84464" }}
                      >
                        <LogOut className="h-4 w-4" />
                        Log out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Hamburger — mobile only */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-white/80 transition-colors hover:bg-white/10 hover:text-white md:hidden"
              aria-label="Mobile menu"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* ━━━ MOBILE SLIDE-DOWN ━━━ */}
        <div
          ref={mobileRef}
          className={`absolute left-0 right-0 top-full z-40 overflow-hidden transition-all duration-300 md:hidden ${
            mobileMenuOpen
              ? "max-h-[500px] opacity-100"
              : "max-h-0 opacity-0"
          }`}
          style={{ backgroundColor: "#1A1D2E" }}
        >
          <div className="space-y-4 px-4 pb-5 pt-3">
            {/* Mobile Search */}
            {pathname !== "/" && (
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  placeholder="Search for venues, spaces and events"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleMobileSearch();
                  }}
                  className="w-full rounded-xl border border-white/10 bg-white/10 py-2.5 pl-10 pr-4 text-sm text-white placeholder-white/40 outline-none focus:border-white/25"
                />
              </div>
            )}

            {/* Mobile City Pills */}
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-white/40">
                Select City
              </p>
              <div className="flex flex-wrap gap-2">
                {CITIES.map((city) => (
                  <button
                    key={city}
                    onClick={() => setSelectedCity(city)}
                    className={`rounded-full px-3 py-1 text-[12px] font-medium transition-all ${
                      selectedCity === city
                        ? "text-white"
                        : "border border-white/15 text-white/60 hover:border-white/30 hover:text-white/90"
                    }`}
                    style={
                      selectedCity === city
                        ? { backgroundColor: "#F84464" }
                        : {}
                    }
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Nav Links */}
            <div className="space-y-1 border-t border-white/10 pt-3">
              <Link
                href="/venues"
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Compass className="h-4 w-4 opacity-60" />
                Explore Venues
              </Link>

              {isAuthenticated && user ? (
                <>
                  <Link
                    href={dashboardRoute}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LayoutDashboard className="h-4 w-4 opacity-60" />
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13px] font-medium transition-colors hover:bg-white/10"
                    style={{ color: "#F84464" }}
                  >
                    <LogOut className="h-4 w-4" />
                    Log out
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openLogin();
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13px] font-semibold text-white transition-colors hover:bg-white/10"
                >
                  <User className="h-4 w-4 opacity-60" />
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ━━━ CATEGORY TABS ROW ━━━ */}
      {showCategoryRow && (
        <div
          className="border-b border-white/10"
          style={{ backgroundColor: "#121420" }}
        >
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6">
            {/* Scrollable tabs */}
            <div
              className="flex items-center gap-1 overflow-x-auto py-0"
              style={{
                msOverflowStyle: "none",
                scrollbarWidth: "none",
              }}
            >
              <style jsx>{`
                div::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
              {CATEGORY_TABS.map((tab) => {
                const isActive =
                  tab.value === activeType ||
                  (tab.value === "" && !activeType);
                return (
                  <Link
                    key={tab.value}
                    href={
                      tab.value
                        ? `/venues?type=${tab.value}`
                        : "/venues"
                    }
                    className={`relative whitespace-nowrap px-3 py-2.5 text-[13px] font-medium transition-colors ${
                      isActive
                        ? "text-white"
                        : "text-white/50 hover:text-white/80"
                    }`}
                  >
                    {tab.label}
                    {/* Active indicator */}
                    {isActive && (
                      <span
                        className="absolute bottom-0 left-1/2 h-[2px] w-4/5 -translate-x-1/2 rounded-full"
                        style={{ backgroundColor: "#F84464" }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Right-side secondary links (hidden on mobile) */}
            <div className="hidden flex-shrink-0 items-center gap-4 pl-4 md:flex">
              <Link
                href={
                  isAuthenticated && user?.role === "owner"
                    ? "/dashboard/owner"
                    : "/"
                }
                className="whitespace-nowrap text-[12px] font-semibold text-white/60 transition-colors hover:text-white"
              >
                List Your Venue
              </Link>
              <span className="whitespace-nowrap text-[12px] font-semibold text-white/40 cursor-default">
                Offers
              </span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

/* ─── Exported wrapper with Suspense boundary ────────────────── */

export function Navbar() {
  return (
    <Suspense
      fallback={
        <header className="sticky top-0 z-50">
          <div style={{ backgroundColor: "#1A1D2E" }} className="h-14" />
        </header>
      }
    >
      <NavbarInner />
    </Suspense>
  );
}
