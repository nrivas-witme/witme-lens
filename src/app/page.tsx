import { Suspense } from "react";
import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { LibraryView } from "@/components/library-view";

export const metadata: Metadata = {
  title: "Biblioteca",
};

function LibraryFallback() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="text-[28px] sm:text-[32px]">Biblioteca</h1>
      <p className="mt-1 text-sm text-muted-foreground">Cargando biblioteca…</p>
    </div>
  );
}

export default function BibliotecaPage() {
  return (
    <AppShell current="biblioteca">
      <Suspense fallback={<LibraryFallback />}>
        <LibraryView />
      </Suspense>
    </AppShell>
  );
}
