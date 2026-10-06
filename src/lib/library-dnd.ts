import { descendantFolderIds, findChildFolder, type LibraryFolder } from "@/lib/local-library";

export const DND_ASSET_MIME = "application/x-witme-asset";
export const DND_FOLDER_MIME = "application/x-witme-folder";

export function readDraggedAssetCode(dataTransfer: DataTransfer): string | null {
  const code = dataTransfer.getData(DND_ASSET_MIME);
  return code.trim().length > 0 ? code : null;
}

export function readDraggedFolderId(dataTransfer: DataTransfer): string | null {
  const id = dataTransfer.getData(DND_FOLDER_MIME);
  return id.trim().length > 0 ? id : null;
}

export function canMoveFolderInto(
  folders: LibraryFolder[],
  folderId: string,
  newParentId: string | null,
): boolean {
  if (folderId === newParentId) return false;
  if (newParentId && descendantFolderIds(folders, folderId).includes(newParentId)) {
    return false;
  }
  const folder = folders.find((item) => item.id === folderId);
  if (!folder) return false;
  if (
    findChildFolder(folders, newParentId, folder.name) &&
    findChildFolder(folders, newParentId, folder.name)?.id !== folderId
  ) {
    return false;
  }
  return true;
}
