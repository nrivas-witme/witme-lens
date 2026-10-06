import { catalogs } from "@/lib/demo-data";
import {
  deleteFolderRecords,
  findChildFolder,
  putFolders,
  type LibraryFolder,
} from "@/lib/local-library";

export const FOLDER_YEAR = "2026";

export const FOLDER_MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
] as const;

export const FOLDER_COUNTRY_CODES = [
  "ES",
  "CO",
  "MX",
  "DE",
  "PL",
  "RO",
  "IT",
  "PT",
] as const;

export function compareFolderNames(a: string, b: string): number {
  const monthA = FOLDER_MONTHS.indexOf(a as (typeof FOLDER_MONTHS)[number]);
  const monthB = FOLDER_MONTHS.indexOf(b as (typeof FOLDER_MONTHS)[number]);
  if (monthA >= 0 && monthB >= 0) return monthA - monthB;

  const countryA = FOLDER_COUNTRY_CODES.indexOf(a as (typeof FOLDER_COUNTRY_CODES)[number]);
  const countryB = FOLDER_COUNTRY_CODES.indexOf(b as (typeof FOLDER_COUNTRY_CODES)[number]);
  if (countryA >= 0 && countryB >= 0) return countryA - countryB;

  return a.localeCompare(b, "es", { sensitivity: "base" });
}

function countryCodeFromFolderName(name: string): string | null {
  const asCode = FOLDER_COUNTRY_CODES.find(
    (code) => code.localeCompare(name, "es", { sensitivity: "accent" }) === 0,
  );
  if (asCode) return asCode;
  const byName = catalogs.countries.find(
    (country) => country.name.localeCompare(name, "es", { sensitivity: "accent" }) === 0,
  );
  return byName?.code ?? null;
}

export async function migrateCountryFolderNames(
  folders: LibraryFolder[],
  placements: Record<string, string>,
): Promise<{ folders: LibraryFolder[]; placements: Record<string, string> }> {
  let list = folders.map((folder) => ({ ...folder }));
  const nextPlacements = { ...placements };
  const removed = new Set<string>();
  const dirty: LibraryFolder[] = [];

  for (const folder of list) {
    if (removed.has(folder.id)) continue;
    const code = countryCodeFromFolderName(folder.name);
    if (!code || folder.name === code) continue;

    const existing = findChildFolder(list, folder.parentId, code);
    if (existing && existing.id !== folder.id) {
      for (const child of list) {
        if (child.parentId === folder.id) {
          child.parentId = existing.id;
          dirty.push(child);
        }
      }
      for (const [assetCode, folderId] of Object.entries(nextPlacements)) {
        if (folderId === folder.id) nextPlacements[assetCode] = existing.id;
      }
      removed.add(folder.id);
    } else {
      folder.name = code;
      dirty.push(folder);
    }
  }

  list = list.filter((folder) => !removed.has(folder.id));
  await putFolders(dirty.filter((folder) => !removed.has(folder.id)));
  await deleteFolderRecords([...removed]);
  return { folders: list, placements: nextPlacements };
}

export async function seedBrandCalendarFolders(
  existing: LibraryFolder[],
): Promise<LibraryFolder[]> {
  const folders = [...existing];
  const created: LibraryFolder[] = [];

  const add = (name: string, parentId: string | null) => {
    let found = findChildFolder(folders, parentId, name);
    if (!found) {
      found = { id: crypto.randomUUID(), name, parentId };
      folders.push(found);
      created.push(found);
    }
    return found;
  };

  for (const brand of catalogs.brands) {
    const brandFolder = add(brand.name, null);
    const yearFolder = add(FOLDER_YEAR, brandFolder.id);
    for (const month of FOLDER_MONTHS) {
      add(month, yearFolder.id);
    }
  }

  await putFolders(created);
  return folders;
}
