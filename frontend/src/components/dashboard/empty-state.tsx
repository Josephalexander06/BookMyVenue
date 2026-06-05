import { PackageOpen } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="animate-fade-in flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-16 text-center">
      {/* Soft icon circle */}
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
        <PackageOpen className="h-7 w-7 text-blue-400 animate-pulse-soft" strokeWidth={1.5} />
      </div>

      <h3 className="text-base font-semibold text-slate-800">{title}</h3>

      <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-slate-400">
        {description}
      </p>
    </div>
  );
}
