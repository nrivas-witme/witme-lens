import type { Metadata } from "next";
import { AccessView } from "@/components/access-view";

export const metadata: Metadata = {
  title: "Acceso",
};

export default async function AccesoPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string | string[] }>;
}) {
  const params = await searchParams;
  const estado = typeof params.estado === "string" ? params.estado : undefined;

  return <AccessView denied={estado === "sin-acceso"} />;
}
