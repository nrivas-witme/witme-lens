"use client";

import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { AssetDetail } from "@/components/asset-detail";
import { useLibrary } from "@/components/library-provider";
import { Button } from "@/components/ui/button";

export function AssetPageBody({ code }: { code: string }) {
  const { getAsset, ready } = useLibrary();
  const asset = getAsset(code);

  if (!ready) {
    return (
      <AppShell current="ficha">
        <p className="mx-auto max-w-xl px-4 py-16 text-center text-muted-foreground">
          Cargando ficha…
        </p>
      </AppShell>
    );
  }

  if (!asset) {
    return (
      <AppShell current="ficha">
        <div className="mx-auto max-w-xl px-4 py-16 text-center">
          <h1 className="text-[28px]">No encontramos ese ID</h1>
          <p className="mt-2 text-muted-foreground">
            {code} no está en la biblioteca. Prueba con CREA-000142.
          </p>
          <Button asChild className="mt-6 h-11 rounded-[10px] px-5">
            <Link href="/">Volver a la biblioteca</Link>
          </Button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell current="ficha">
      <AssetDetail asset={asset} />
    </AppShell>
  );
}
