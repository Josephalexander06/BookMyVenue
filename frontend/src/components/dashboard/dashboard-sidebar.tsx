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
    <div className="w-full bg-white border border-slate-100 rounded-2xl p-1.5 shadow-soft mb-8">
      <nav className="flex items-center gap-1.5 overflow-x-auto pb-0.5 sm:pb-0 scrollbar-none">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "shrink-0 rounded-xl px-4 py-2.5 text-xs font-bold transition-all border",
                isActive
                  ? "bg-[#0052ff] border-[#0052ff] text-white shadow-md shadow-blue-500/10"
                  : "bg-white text-slate-600 border-transparent hover:border-slate-100 hover:text-slate-900 hover:bg-slate-50/50"
              )}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

