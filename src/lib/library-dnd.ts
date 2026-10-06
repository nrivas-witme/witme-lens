import { descendantFolderIds, findChildFolder, type LibraryFolder } from "@/lib/local-library";

export const DND_ASSET_MIME = "application/x-witme-asset";
export const DND_FOLDER_MIME = "application/x-witme-folder";

const ASSET_PLAIN_PREFIX = "witme-asset:";

export function writeAssetDrag(dataTransfer: DataTransfer, code: string): void {
  dataTransfer.clearData();
  dataTransfer.setData(DND_ASSET_MIME, code);
  dataTransfer.setData("text/plain", `${ASSET_PLAIN_PREFIX}${code}`);
  dataTransfer.effectAllowed = "move";
}

export function writeFolderDrag(dataTransfer: DataTransfer, folderId: string): void {
  dataTransfer.clearData();
  dataTransfer.setData(DND_FOLDER_MIME, folderId);
  dataTransfer.setData("text/plain", `witme-folder:${folderId}`);
  dataTransfer.effectAllowed = "move";
}

/** En dragOver no se puede leer getData; solo comprobar types. */
export function dragCarriesAsset(dataTransfer: DataTransfer): boolean {
  return (
    Array.from(dataTransfer.types).includes(DND_ASSET_MIME) ||
    Array.from(dataTransfer.types).includes("text/plain")
  );
}

export function dragCarriesFolder(dataTransfer: DataTransfer): boolean {
  return Array.from(dataTransfer.types).includes(DND_FOLDER_MIME);
}

export function readDraggedAssetCode(dataTransfer: DataTransfer): string | null {
  const custom = dataTransfer.getData(DND_ASSET_MIME).trim();
  if (custom) return custom;

  const plain = dataTransfer.getData("text/plain").trim();
  if (plain.startsWith(ASSET_PLAIN_PREFIX)) {
    return plain.slice(ASSET_PLAIN_PREFIX.length);
  }
  if (/^CREA-\d{6}$/i.test(plain)) return plain.toUpperCase();
  return null;
}

export function readDraggedFolderId(dataTransfer: DataTransfer): string | null {
  const custom = dataTransfer.getData(DND_FOLDER_MIME).trim();
  if (custom) return custom;

  const plain = dataTransfer.getData("text/plain").trim();
  if (plain.startsWith("witme-folder:")) {
    return plain.slice("witme-folder:".length);
  }
  return null;
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
  const sibling = findChildFolder(folders, newParentId, folder.name);
  if (sibling && sibling.id !== folderId) {
    return false;
  }
  return true;
}
