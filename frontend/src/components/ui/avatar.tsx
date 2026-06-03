"use client";

import * as AvatarPrimitive from "@radix-ui/react-avatar";

export function Avatar({ src, fallback }: { src?: string; fallback: string }) {
  return (
    <AvatarPrimitive.Root className="inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-blue-100">
      {src ? (
        <AvatarPrimitive.Image src={src} alt={fallback} className="h-full w-full object-cover" />
      ) : null}
      <AvatarPrimitive.Fallback className="text-sm font-semibold text-blue-700">
        {fallback}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );
}
