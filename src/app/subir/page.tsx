import { Suspense } from "react";
import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { UploadFlow } from "@/components/upload-flow";

export const metadata: Metadata = {
  title: "Subir imagen",
};

function UploadFallback() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="mt-2 text-[28px] sm:text-[32px]">Subir imagen</h1>
      <p className="mt-1 text-sm text-muted-foreground">Cargando…</p>
    </div>
  );
}

export default function SubirPage() {
  return (
    <AppShell current="subir">
      <Suspense fallback={<UploadFallback />}>
        <UploadFlow />
      </Suspense>
    </AppShell>
  );
}
