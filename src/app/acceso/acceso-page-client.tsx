"use client";

import { useSearchParams } from "next/navigation";
import { AccessView } from "@/components/access-view";

export function AccesoPageClient() {
  const searchParams = useSearchParams();
  const denied = searchParams.get("estado") === "sin-acceso";
  return <AccessView denied={denied} />;
}
