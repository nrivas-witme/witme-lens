"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { LibraryProvider } from "@/components/library-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      <LibraryProvider>{children}</LibraryProvider>
    </TooltipProvider>
  );
}
