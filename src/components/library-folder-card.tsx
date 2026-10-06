"use client";

import { useState, type DragEvent } from "react";
import Link from "next/link";
import { FolderIcon, GripVerticalIcon, TrashIcon } from "lucide-react";
import { confirmDeleteFolder, useLibrary } from "@/components/library-provider";
import { Button } from "@/components/ui/button";
import {
  canMoveFolderInto,
  DND_ASSET_MIME,
  DND_FOLDER_MIME,
  readDraggedAssetCode,
  readDraggedFolderId,
} from "@/lib/library-dnd";

function countLabel(count: number): string {
  return `${count} ${count === 1 ? "elemento" : "elementos"}`;
}

export function LibraryFolderCard({
  folderId,
  name,
  total,
  folderHref,
  onNavigateAfterDelete,
}: {
  folderId: string;
  name: string;
  total: number;
  folderHref: string;
  onNavigateAfterDelete?: () => void;
}) {
  const { folders, deleteFolder, moveAssetToFolder, moveFolderToParent } = useLibrary();
  const [dropActive, setDropActive] = useState(false);

  function allowDrop(event: DragEvent) {
    const assetCode = readDraggedAssetCode(event.dataTransfer);
    const draggedFolderId = readDraggedFolderId(event.dataTransfer);
    if (assetCode) {
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
      return;
    }
    if (
      draggedFolderId &&
      canMoveFolderInto(folders, draggedFolderId, folderId)
    ) {
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
    }
  }

  async function handleDrop(event: DragEvent) {
    event.preventDefault();
    setDropActive(false);
    const assetCode = readDraggedAssetCode(event.dataTransfer);
    if (assetCode) {
      await moveAssetToFolder(assetCode, folderId);
      return;
    }
    const draggedFolderId = readDraggedFolderId(event.dataTransfer);
    if (
      draggedFolderId &&
      canMoveFolderInto(folders, draggedFolderId, folderId)
    ) {
      await moveFolderToParent(draggedFolderId, folderId);
    }
  }

  return (
    <div
      className={`relative rounded-[16px] bg-white shadow-[0_8px_24px_rgba(49,82,112,0.06)] ring-1 transition-shadow ${
        dropActive ? "ring-2 ring-brand ring-offset-2" : "ring-border"
      }`}
      onDragOver={(event) => {
        allowDrop(event);
        setDropActive(true);
      }}
      onDragLeave={() => setDropActive(false)}
      onDrop={(event) => void handleDrop(event)}
    >
      <div className="flex items-start gap-1 p-4 pr-12">
        <button
          type="button"
          draggable
          className="mt-0.5 shrink-0 cursor-grab rounded-[8px] p-1 text-muted-foreground hover:bg-muted active:cursor-grabbing"
          aria-label={`Arrastrar carpeta ${name}`}
          onDragStart={(event) => {
            event.dataTransfer.setData(DND_FOLDER_MIME, folderId);
            event.dataTransfer.effectAllowed = "move";
          }}
        >
          <GripVerticalIcon className="size-4" />
        </button>
        <Link href={folderHref} className="flex min-w-0 flex-1 items-start gap-3">
          <FolderIcon className="mt-0.5 size-8 shrink-0 text-brand" />
          <span>
            <span className="block font-medium text-brand">{name}</span>
            <span className="mt-1 block text-sm text-muted-foreground">
              {countLabel(total)}
            </span>
          </span>
        </Link>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 rounded-[10px] text-muted-foreground"
        aria-label={`Eliminar carpeta ${name}`}
        onClick={async () => {
          if (!confirmDeleteFolder(name)) return;
          await deleteFolder(folderId);
          onNavigateAfterDelete?.();
        }}
      >
        <TrashIcon />
      </Button>
    </div>
  );
}
