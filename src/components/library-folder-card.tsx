"use client";

import { type DragEvent } from "react";
import Link from "next/link";
import { FolderIcon, GripVerticalIcon, TrashIcon } from "lucide-react";
import { FolderRenameControl } from "@/components/folder-rename-control";
import { confirmDeleteFolder, useLibrary } from "@/components/library-provider";
import { Button } from "@/components/ui/button";
import { useDropHighlight } from "@/hooks/use-drop-highlight";
import {
  canMoveFolderInto,
  dragCarriesAsset,
  dragCarriesFolder,
  readDraggedAssetCode,
  readDraggedFolderId,
  writeFolderDrag,
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
  const dropHighlight = useDropHighlight();

  function allowDrop(event: DragEvent) {
    if (dragCarriesAsset(event.dataTransfer)) {
      event.preventDefault();
      event.stopPropagation();
      event.dataTransfer.dropEffect = "move";
      return;
    }
    if (dragCarriesFolder(event.dataTransfer)) {
      event.preventDefault();
      event.stopPropagation();
      event.dataTransfer.dropEffect = "move";
    }
  }

  async function handleDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    dropHighlight.reset();
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
        dropHighlight.active ? "ring-2 ring-brand ring-offset-2" : "ring-border"
      }`}
      onDragEnter={dropHighlight.onDragEnter}
      onDragOver={(event) => allowDrop(event)}
      onDragLeave={dropHighlight.onDragLeave}
      onDrop={(event) => void handleDrop(event)}
    >
      <div className="flex items-start gap-1 p-4 pr-20">
        <button
          type="button"
          draggable
          className="mt-0.5 shrink-0 cursor-grab rounded-[8px] p-1 text-muted-foreground hover:bg-muted active:cursor-grabbing"
          aria-label={`Arrastrar carpeta ${name}`}
          onDragStart={(event) => writeFolderDrag(event.dataTransfer, folderId)}
        >
          <GripVerticalIcon className="size-4" />
        </button>
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <Link
            href={folderHref}
            className="mt-0.5 shrink-0 rounded-[8px] focus-visible:outline-2"
            aria-label={`Abrir carpeta ${name}`}
          >
            <FolderIcon className="size-8 text-brand" />
          </Link>
          <div className="min-w-0 flex-1">
            <FolderRenameControl folderId={folderId} name={name} variant="card" />
            <span className="mt-1 block text-sm text-muted-foreground">
              {countLabel(total)}
            </span>
          </div>
        </div>
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
