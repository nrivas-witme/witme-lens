"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

function LibraryFallback() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="text-[28px] sm:text-[32px]">Biblioteca</h1>
      <p className="mt-1 text-sm text-muted-foreground">Cargando biblioteca…</p>
    </div>
  );
}

const LibraryView = dynamic(
  () => import("@/components/library-view").then((mod) => mod.LibraryView),
  {
    ssr: false,
    loading: LibraryFallback,
  },
);

export function LibraryPageClient() {
  return (
    <Suspense fallback={<LibraryFallback />}>
      <LibraryView />
    </Suspense>
  );
}
