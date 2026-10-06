"use client";

import { useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TrashIcon } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { confirmDeleteAsset, useLibrary } from "@/components/library-provider";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/copy-button";
import { AssetLocationEditor } from "@/components/asset-location-editor";
import { CreativePreview } from "@/components/creative-preview";
import { StatusBadge } from "@/components/status-badge";
import { assetHref, type DemoAsset } from "@/lib/demo-data";
import { formatDate } from "@/lib/format";
import { writeAssetDrag } from "@/lib/library-dnd";

export function AssetCard({ asset }: { asset: DemoAsset }) {
  const { deleteAsset } = useLibrary();
  const router = useRouter();
  const dragged = useRef(false);

  return (
    <Card className="rounded-[16px] py-0 shadow-[0_8px_24px_rgba(49,82,112,0.06)] ring-border">
      <div className="relative">
        <div
          draggable
          role="button"
          tabIndex={0}
          aria-label={`${asset.code}: arrastra a una carpeta o pulsa para abrir la ficha`}
          className="relative flex h-56 cursor-grab items-center justify-center overflow-hidden rounded-t-[16px] bg-[#f0f4f8] active:cursor-grabbing"
          onDragStart={(event) => {
            dragged.current = true;
            writeAssetDrag(event.dataTransfer, asset.code);
          }}
          onDragEnd={() => {
            window.setTimeout(() => {
              dragged.current = false;
            }, 0);
          }}
          onClick={() => {
            if (dragged.current) return;
            router.push(assetHref(asset.code));
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              router.push(assetHref(asset.code));
            }
          }}
        >
          <CreativePreview asset={asset} className="h-full w-full pointer-events-none" />
          <span className="pointer-events-none absolute bottom-10 left-2 rounded-[8px] bg-white/90 px-2 py-1 text-[11px] font-medium text-muted-foreground shadow-sm">
            Arrastra a una carpeta
          </span>
        </div>
        <div
          className="absolute inset-x-0 bottom-0 border-t border-border/60 bg-white/95 p-2 backdrop-blur-sm"
          onClick={(event) => event.stopPropagation()}
        >
          <AssetLocationEditor code={asset.code} compact idPrefix={`card-${asset.code}`} />
        </div>
      </div>
      <div className="flex flex-col gap-3 px-4 py-4">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={assetHref(asset.code)}
            className="font-mono text-[15px] font-semibold text-brand hover:underline"
          >
            {asset.code}
          </Link>
          <StatusBadge asset={asset} />
        </div>
        <div className="flex items-center gap-2">
          <BrandLogo code={asset.brand} />
          <p className="text-sm text-muted-foreground">
            {asset.brandName} · {asset.countryName}
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          {asset.sizeFamilyName} · {asset.sizeLabel} · {formatDate(asset.createdAt)}
        </p>
        <div className="flex flex-wrap gap-2">
          <CopyButton value={asset.code} label="Copiar ID" />
          <Button
            type="button"
            variant="destructive"
            className="h-10 rounded-[10px] px-3.5 text-[14px]"
            onClick={async () => {
              if (!confirmDeleteAsset(asset.code)) return;
              await deleteAsset(asset.code);
            }}
          >
            <TrashIcon data-icon="inline-start" />
            Eliminar
          </Button>
        </div>
      </div>
    </Card>
  );
}
