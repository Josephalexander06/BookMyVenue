import { Card } from "@/components/ui/card";
import type { StatCardData } from "@/types/dashboard";

const accentColors = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-violet-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-cyan-500",
];

interface StatCardProps extends StatCardData {
  index?: number;
}

export function StatCard({ title, value, helper, index = 0 }: StatCardProps) {
  const accent = accentColors[index % accentColors.length];

  return (
    <Card className="group relative overflow-hidden hover-lift animate-fade-in-up">
      {/* Accent bar */}
      <div
        className={`absolute left-0 top-0 h-full w-1 ${accent} transition-all duration-300 group-hover:w-1.5`}
      />

      <div className="p-5 pl-6">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
          {title}
        </p>

        <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>

        {helper && (
          <p className="mt-1.5 text-xs text-slate-400">{helper}</p>
        )}
      </div>
    </Card>
  );
}
