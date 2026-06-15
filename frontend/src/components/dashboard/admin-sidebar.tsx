"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Building2, 
  Calendar, 
  LayoutDashboard, 
  BarChart3, 
  Settings, 
  HelpCircle, 
  LogOut, 
  Plus 
} from "lucide-react";
import { useAuthStore } from "@/store/auth-store";

export function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    window.location.replace("/");
  };

  const navItems = [
    {
      href: "/dashboard/admin",
      label: "Dashboard",
      icon: LayoutDashboard,
      active: pathname === "/dashboard/admin"
    },
    {
      href: "/dashboard/admin/bookings",
      label: "Bookings",
      icon: Calendar,
      active: pathname === "/dashboard/admin/bookings"
    },
    {
      href: "/dashboard/admin/venues",
      label: "My Venues",
      icon: Building2,
      active: pathname === "/dashboard/admin/venues"
    },
    {
      href: "/dashboard/admin/reports",
      label: "Analytics",
      icon: BarChart3,
      active: pathname === "/dashboard/admin/reports"
    },
    {
      href: "/dashboard/admin/users",
      label: "Settings",
      icon: Settings,
      active: pathname === "/dashboard/admin/users"
    }
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-slate-150 bg-white p-6 justify-between h-full shrink-0">
      <div className="space-y-8">
        <div>
          <h2 className="text-sm font-bold text-slate-800 tracking-tight">Admin Panel</h2>
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Venue Manager</p>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                  item.active
                    ? "text-emerald-800 shadow-sm"
                    : "text-slate-500 hover:text-slate-850 hover:bg-slate-50 border-transparent"
                }`}
                style={item.active ? {
                  background: "linear-gradient(135deg, rgba(52, 211, 153, 0.15), rgba(45, 212, 191, 0.15))"
                } : undefined}
              >
                <Icon className={`h-4 w-4 ${item.active ? "text-emerald-600" : ""}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="space-y-4 pt-6 border-t border-slate-100">
        <Link
          href="#"
          className="flex items-center gap-3 px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors"
        >
          <HelpCircle className="h-4 w-4" />
          Support
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2 text-xs font-bold text-slate-400 hover:text-red-650 transition-colors w-full text-left"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
        <Link
          href="/venues"
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-soft transition-all active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          Add New Venue
        </Link>
      </div>
    </aside>
  );
}
