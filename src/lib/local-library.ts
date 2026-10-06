import {
  demoAssets,
  getBrand,
  getCountry,
  getFormat,
  getLanguage,
  getProduct,
  getTheme,
  NEXT_CREATIVE_NUMBER,
  type DemoAsset,
} from "@/lib/demo-data";
import { getSize } from "@/lib/sizes";
import {
  buildNormalizedName,
  fileExtension,
  formatCreativeCode,
  parseCreativeNumber,
} from "@/lib/naming";

const DB_NAME = "witme-lens";
const DB_VERSION = 2;

export type LibraryFolder = {
  id: string;
  name: string;
  parentId: string | null;
};

export type LocalRecord = {
  code: string;
  asset: DemoAsset;
  blob: Blob;
};

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("assets")) {
        db.createObjectStore("assets", { keyPath: "code" });
      }
      if (!db.objectStoreNames.contains("meta")) {
        db.createObjectStore("meta");
      }
      if (!db.objectStoreNames.contains("folders")) {
        db.createObjectStore("folders", { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function idbRequest<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function loadLocalLibrary(): Promise<{
  records: LocalRecord[];
  deleted: string[];
  nextNumber: number;
  folders: LibraryFolder[];
  placements: Record<string, string>;
}> {
  const db = await openDb();
  const records = await idbRequest(
    db.transaction("assets").objectStore("assets").getAll() as IDBRequest<LocalRecord[]>,
  );
  const folders = await idbRequest(
    db.transaction("folders").objectStore("folders").getAll() as IDBRequest<LibraryFolder[]>,
  );
  const deleted =
    (await idbRequest(
      db.transaction("meta").objectStore("meta").get("deleted") as IDBRequest<string[] | undefined>,
    )) ?? [];
  const storedNext =
    (await idbRequest(
      db.transaction("meta").objectStore("meta").get("nextNumber") as IDBRequest<number | undefined>,
    )) ?? 0;
  const placements =
    (await idbRequest(
      db
        .transaction("meta")
        .objectStore("meta")
        .get("placements") as IDBRequest<Record<string, string> | undefined>,
    )) ?? {};

  const maxDemo = Math.max(
    0,
    ...demoAssets.map((asset) => parseCreativeNumber(asset.code) ?? 0),
  );
  const maxLocal = Math.max(
    0,
    ...records.map((record) => parseCreativeNumber(record.code) ?? 0),
  );
  const nextNumber = Math.max(maxDemo + 1, maxLocal + 1, storedNext, NEXT_CREATIVE_NUMBER);

  return { records, deleted, nextNumber, folders, placements };
}

export async function putFolder(folder: LibraryFolder): Promise<void> {
  await putFolders([folder]);
}

export async function putFolders(folders: LibraryFolder[]): Promise<void> {
  if (folders.length === 0) return;
  const db = await openDb();
  const tx = db.transaction("folders", "readwrite");
  const store = tx.objectStore("folders");
  for (const folder of folders) store.put(folder);
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

export async function deleteFolderRecord(id: string): Promise<void> {
  await deleteFolderRecords([id]);
}

export async function deleteFolderRecords(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const db = await openDb();
  const tx = db.transaction("folders", "readwrite");
  const store = tx.objectStore("folders");
  for (const id of ids) store.delete(id);
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

export async function savePlacements(placements: Record<string, string>): Promise<void> {
  const db = await openDb();
  await idbRequest(
    db.transaction("meta", "readwrite").objectStore("meta").put(placements, "placements"),
  );
}

export function findChildFolder(
  folders: LibraryFolder[],
  parentId: string | null,
  name: string,
): LibraryFolder | undefined {
  return folders.find(
    (folder) =>
      folder.parentId === parentId &&
      folder.name.localeCompare(name, "es", { sensitivity: "accent" }) === 0,
  );
}

export function folderPath(folders: LibraryFolder[], id: string | null): LibraryFolder[] {
  const path: LibraryFolder[] = [];
  const byId = new Map(folders.map((folder) => [folder.id, folder]));
  let current = id;
  while (current) {
    const folder = byId.get(current);
    if (!folder) break;
    path.unshift(folder);
    current = folder.parentId;
  }
  return path;
}

export function descendantFolderIds(folders: LibraryFolder[], id: string): string[] {
  const ids = [id];
  for (const child of folders.filter((folder) => folder.parentId === id)) {
    ids.push(...descendantFolderIds(folders, child.id));
  }
  return ids;
}

export async function putLocalRecord(record: LocalRecord): Promise<void> {
  const db = await openDb();
  await idbRequest(db.transaction("assets", "readwrite").objectStore("assets").put(record));
}

export async function deleteLocalRecord(code: string): Promise<void> {
  const db = await openDb();
  await idbRequest(db.transaction("assets", "readwrite").objectStore("assets").delete(code));
}

export async function saveDeletedCodes(codes: string[]): Promise<void> {
  const db = await openDb();
  await idbRequest(db.transaction("meta", "readwrite").objectStore("meta").put(codes, "deleted"));
}

export async function saveNextNumber(n: number): Promise<void> {
  const db = await openDb();
  await idbRequest(db.transaction("meta", "readwrite").objectStore("meta").put(n, "nextNumber"));
}

export function hydratePreview(asset: DemoAsset, blob: Blob): DemoAsset {
  return { ...asset, previewSrc: URL.createObjectURL(blob) };
}

export function buildAssetFromUpload(input: {
  file: File;
  code: string;
  brand: string;
  country: string;
  product: string;
  format: string;
  language: string;
  sizeCode: string;
  width: number;
  height: number;
  folderId: string;
  theme: string;
}): DemoAsset {
  const brand = getBrand(input.brand);
  const country = getCountry(input.country);
  const product = getProduct(input.product);
  const language = getLanguage(input.language);
  const format = getFormat(input.format);
  const size = getSize(input.sizeCode);
  const theme = getTheme(input.theme);
  const title = input.file.name.replace(/\.[^.]+$/, "") || input.code;

  return {
    code: input.code,
    title,
    originalName: input.file.name,
    normalizedName: buildNormalizedName({
      code: input.code,
      brand: input.brand,
      country: input.country,
      product: input.product,
      format: format.code,
      width: input.width,
      height: input.height,
      language: input.language,
      extension: fileExtension(input.file.name),
    }),
    brand: input.brand,
    brandName: brand?.name ?? input.brand,
    country: country.code,
    countryName: country.name,
    product: product.code,
    productName: product.name,
    format: format.code,
    formatName: format.name,
    language: language.code,
    languageName: language.name,
    width: input.width,
    height: input.height,
    sizeCode: size.code,
    sizeLabel: `${size.width}×${size.height}`,
    sizeFamily: size.family,
    sizeFamilyName: size.familyName,
    createdAt: new Date().toISOString(),
    author: "Subida local (este navegador)",
    previewSrc: "",
    folderId: input.folderId,
    theme: theme.code,
    themeName: theme.name,
    status: "no_ads",
    analysis: null,
    usages: [],
  };
}
