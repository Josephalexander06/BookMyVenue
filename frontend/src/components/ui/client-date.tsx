"use client";

import { useEffect, useState } from "react";

export function ClientDate({ date }: { date: string | Date }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <span className="opacity-0">Loading date...</span>;
  }

  try {
    return <span>{new Date(date).toLocaleDateString()}</span>;
  } catch (e) {
    return <span>{String(date)}</span>;
  }
}
