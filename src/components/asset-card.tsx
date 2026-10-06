"use client";

import Link from "next/link";
import { GripVerticalIcon, TrashIcon } from "lucide-react";
import { DND_ASSET_MIME } from "@/lib/library-dnd";
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

export function AssetCard({ asset }: { asset: DemoAsset }) {
  const { deleteAsset } = useLibrary();

  return (
    <Card className="rounded-[16px] py-0 shadow-[0_8px_24px_rgba(49,82,112,0.06)] ring-border">
      <div className="relative">
        <div className="relative flex h-56 items-center justify-center overflow-hidden rounded-t-[16px] bg-[#f0f4f8]">
          <button
            type="button"
            draggable
            className="absolute top-2 left-2 z-10 cursor-grab rounded-[8px] bg-white/90 p-1.5 text-muted-foreground shadow-sm hover:bg-white active:cursor-grabbing"
            aria-label={`Arrastrar ${asset.code} a otra carpeta`}
            onDragStart={(event) => {
              event.dataTransfer.setData(DND_ASSET_MIME, asset.code);
              event.dataTransfer.effectAllowed = "move";
            }}
          >
            <GripVerticalIcon className="size-4" />
          </button>
          <Link
            href={assetHref(asset.code)}
            aria-label={`Ver ficha de ${asset.code}: ${asset.title}`}
            className="flex h-full w-full items-center justify-center"
          >
            <CreativePreview asset={asset} className="h-full w-full" />
          </Link>
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
