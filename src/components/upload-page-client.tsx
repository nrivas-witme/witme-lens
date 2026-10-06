"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

function UploadFallback() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="mt-2 text-[28px] sm:text-[32px]">Subir imagen</h1>
      <p className="mt-1 text-sm text-muted-foreground">Cargando…</p>
    </div>
  );
}

const UploadFlow = dynamic(
  () => import("@/components/upload-flow").then((mod) => mod.UploadFlow),
  {
    ssr: false,
    loading: UploadFallback,
  },
);

export function UploadPageClient() {
  return (
    <Suspense fallback={<UploadFallback />}>
      <UploadFlow />
    </Suspense>
  );
}
