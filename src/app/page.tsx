import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { LibraryPageClient } from "@/components/library-page-client";

export const metadata: Metadata = {
  title: "Biblioteca",
};

export default function BibliotecaPage() {
  return (
    <AppShell current="biblioteca">
      <LibraryPageClient />
    </AppShell>
  );
}
