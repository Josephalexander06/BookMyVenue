"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface DashboardSidebarProps {
  links: Array<{ href: string; label: string }>;
}

export function DashboardSidebar({ links }: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="h-fit rounded-xl border border-slate-100 bg-white p-2">
      <nav className="space-y-0.5">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "block rounded-lg px-3 py-2 text-[13px] font-medium text-slate-500 transition-all hover:bg-slate-50 hover:text-slate-700",
              pathname === link.href && "bg-slate-900 text-white hover:bg-slate-800 hover:text-white",
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
