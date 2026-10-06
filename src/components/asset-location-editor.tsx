"use client";

import { useMemo, type SyntheticEvent } from "react";
import Link from "next/link";
import { FolderOpenIcon } from "lucide-react";
import { folderPath, useLibrary } from "@/components/library-provider";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function folderBrowseHref(folderId: string): string {
  return `/?carpeta=${encodeURIComponent(folderId)}`;
}

function stopCardNavigation(event: SyntheticEvent) {
  event.preventDefault();
  event.stopPropagation();
}

export function AssetLocationEditor({
  code,
  compact = false,
  idPrefix = code,
}: {
  code: string;
  compact?: boolean;
  idPrefix?: string;
}) {
  const { folders, folderIdOf, moveAssetToFolder, ready } = useLibrary();
  const folderId = folderIdOf(code);

  const options = useMemo(
    () =>
      folders
        .map((folder) => ({
          id: folder.id,
          label: folderPath(folders, folder.id)
            .map((item) => item.name)
            .join(" / "),
        }))
        .sort((a, b) => a.label.localeCompare(b.label, "es", { sensitivity: "base" })),
    [folders],
  );

  const pathLabel = folderId
    ? options.find((option) => option.id === folderId)?.label
    : null;

  if (!ready || options.length === 0) {
    return compact ? null : (
      <p className="text-sm text-muted-foreground">Cargando ubicación…</p>
    );
  }

  const selectId = `${idPrefix}-ubicacion`;

  return (
    <div
      className={compact ? "space-y-1.5" : "space-y-2"}
      onClick={stopCardNavigation}
      onKeyDown={stopCardNavigation}
    >
      <Label htmlFor={selectId} className={compact ? "sr-only" : undefined}>
        Ubicación
      </Label>
      <Select
        value={folderId ?? undefined}
        onValueChange={(nextId) => {
          void moveAssetToFolder(code, nextId).catch((error) => {
            console.error("No se pudo mover la creatividad", error);
          });
        }}
      >
        <SelectTrigger
          id={selectId}
          className={
            compact
              ? "h-9 w-full rounded-[10px] bg-white text-xs"
              : "h-10 w-full max-w-xl rounded-[10px] bg-white"
          }
          onPointerDown={stopCardNavigation}
        >
          <SelectValue placeholder="Elige una carpeta…" />
        </SelectTrigger>
        <SelectContent className="max-h-72">
          {options.map((option) => (
            <SelectItem key={option.id} value={option.id}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {!compact && pathLabel ? (
        <p className="text-xs text-muted-foreground">{pathLabel}</p>
      ) : null}
      {folderId && !compact ? (
        <Link
          href={folderBrowseHref(folderId)}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline"
          onClick={stopCardNavigation}
        >
          <FolderOpenIcon className="size-4" />
          Ver en carpeta
        </Link>
      ) : null}
    </div>
  );
}
