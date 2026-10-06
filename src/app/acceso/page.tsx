import type { Metadata } from "next";
import { Suspense } from "react";
import { AccesoPageClient } from "@/app/acceso/acceso-page-client";

export const metadata: Metadata = {
  title: "Acceso",
};

function AccesoFallback() {
  return (
    <div className="flex min-h-full items-center justify-center px-4 py-16 text-sm text-muted-foreground">
      Cargando acceso…
    </div>
  );
}

export default function AccesoPage() {
  return (
    <Suspense fallback={<AccesoFallback />}>
      <AccesoPageClient />
    </Suspense>
  );
}
