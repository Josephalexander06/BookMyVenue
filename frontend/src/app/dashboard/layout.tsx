"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isWorkspace = pathname.startsWith("/dashboard/admin") || pathname.startsWith("/dashboard/owner");

  if (isWorkspace) {
    return <section className="w-full h-[calc(100vh-3.5rem)] overflow-hidden bg-[#F8F9FC]">{children}</section>;
  }

  return <section className="mx-auto w-full max-w-[1400px] px-4 py-8 sm:px-6">{children}</section>;
}
