import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { UploadPageClient } from "@/components/upload-page-client";

export const metadata: Metadata = {
  title: "Subir imagen",
};

export default function SubirPage() {
  return (
    <AppShell current="subir">
      <UploadPageClient />
    </AppShell>
  );
}
