"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { UserRole } from "@/types/auth";
import { cn } from "@/lib/utils";

const linksByRole: Record<UserRole, Array<{ href: string; label: string }>> = {
  customer: [
    { href: "/venues", label: "Browse" },
    { href: "/dashboard/customer", label: "My Bookings" },
  ],
  owner: [
    { href: "/dashboard/owner", label: "Overview" },
    { href: "/dashboard/owner/venues", label: "Venue Management" },
    { href: "/dashboard/owner/bookings", label: "Booking Management" },
  ],
  admin: [
    { href: "/dashboard/admin", label: "Overview" },
    { href: "/dashboard/admin/users", label: "Users" },
    { href: "/dashboard/admin/venues", label: "Venues" },
    { href: "/dashboard/admin/bookings", label: "Bookings" },
    { href: "/dashboard/admin/reports", label: "Reports" },
  ],
};

export function RoleNavigation({ role }: { role: UserRole }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap items-center gap-2">
      {linksByRole[role].map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "rounded-md px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-100",
            pathname.startsWith(item.href) && "bg-blue-50 text-blue-700",
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
