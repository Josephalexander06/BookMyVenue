import type { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">{children}</section>;
}
