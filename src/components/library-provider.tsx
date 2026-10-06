"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  demoAssets,
  getBrand,
  getCountry,
  getTheme,
  type DemoAsset,
} from "@/lib/demo-data";
import { migrateCountryFolderNames, seedBrandCalendarFolders } from "@/lib/folders";
import { folderMonth, folderYear } from "@/lib/format";
import {
  buildAssetFromUpload,
  deleteFolderRecord,
  deleteLocalRecord,
  descendantFolderIds,
  findChildFolder,
  hydratePreview,
  loadLocalLibrary,
  putFolder,
  putLocalRecord,
  saveDeletedCodes,
  saveNextNumber,
  savePlacements,
  type LibraryFolder,
} from "@/lib/local-library";
import { formatCreativeCode } from "@/lib/naming";

export type { LibraryFolder };
export { folderPath } from "@/lib/local-library";

type UploadSnapshot = {
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
  theme: string;
  folderId?: string;
};

type LibraryContextValue = {
  ready: boolean;
  assets: DemoAsset[];
  folders: LibraryFolder[];
  getAsset: (code: string) => DemoAsset | undefined;
  folderIdOf: (code: string) => string | null;
  allocateCodes: (count: number) => string[];
  saveUpload: (snapshot: UploadSnapshot) => Promise<void>;
  deleteAsset: (code: string) => Promise<void>;
  createFolder: (parentId: string | null, name: string) => Promise<LibraryFolder | null>;
  deleteFolder: (id: string) => Promise<void>;
  ensurePath: (names: string[]) => Promise<string>;
};

const LibraryContext = createContext<LibraryContextValue | null>(null);

type BootState = {
  hydrated: DemoAsset[];
  previewUrls: string[];
  deleted: string[];
  nextNumber: number;
  folders: LibraryFolder[];
  placements: Record<string, string>;
};

let bootPromise: Promise<BootState> | null = null;

async function bootLibrary(): Promise<BootState> {
  const loaded = await loadLocalLibrary();
  const urls: string[] = [];
  const hydrated = loaded.records
    .map((record) => {
      const asset = hydratePreview(record.asset, record.blob);
      urls.push(asset.previewSrc);
      return asset;
    })
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  const migrated = await migrateCountryFolderNames(
    loaded.folders,
    loaded.placements,
  );
  let nextFolders = await seedBrandCalendarFolders(migrated.folders);
  let nextPlacements = { ...migrated.placements };

  const placeAsset = async (asset: DemoAsset) => {
    if (nextPlacements[asset.code] || asset.folderId) {
      if (asset.folderId && !nextPlacements[asset.code]) {
        nextPlacements[asset.code] = asset.folderId;
      }
      return;
    }
    const brandName = getBrand(asset.brand)?.name ?? asset.brand;
    const countryCode = getCountry(asset.country).code;
    const themeName = getTheme(asset.theme ?? "GENERICA").name;
    const names = [
      brandName,
      folderYear(asset.createdAt),
      folderMonth(asset.createdAt),
      countryCode,
      themeName,
    ];
    let parentId: string | null = null;
    for (const name of names) {
      let found = findChildFolder(nextFolders, parentId, name);
      if (!found) {
        found = { id: crypto.randomUUID(), name, parentId };
        await putFolder(found);
        nextFolders = [...nextFolders, found];
      }
      parentId = found.id;
    }
    if (parentId) nextPlacements[asset.code] = parentId;
  };

  for (const asset of demoAssets) {
    if (!loaded.deleted.includes(asset.code)) {
      await placeAsset(asset);
    }
  }
  for (const asset of hydrated) {
    await placeAsset(asset);
  }

  await savePlacements(nextPlacements);
  return {
    hydrated,
    previewUrls: urls,
    deleted: loaded.deleted,
    nextNumber: loaded.nextNumber,
    folders: nextFolders,
    placements: nextPlacements,
  };
}

function bootLibraryShared(): Promise<BootState> {
  if (!bootPromise) {
    bootPromise = bootLibrary().finally(() => {
      window.setTimeout(() => {
        bootPromise = null;
      }, 0);
    });
  }
  return bootPromise;
}

export function LibraryProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [localAssets, setLocalAssets] = useState<DemoAsset[]>([]);
  const [deleted, setDeleted] = useState<string[]>([]);
  const [nextNumber, setNextNumber] = useState(146);
  const [folders, setFolders] = useState<LibraryFolder[]>([]);
  const [placements, setPlacements] = useState<Record<string, string>>({});
  const previewUrls = useRef<string[]>([]);
  const foldersRef = useRef<LibraryFolder[]>([]);
  const pathChain = useRef(Promise.resolve());

  function replaceFolders(next: LibraryFolder[]) {
    foldersRef.current = next;
    setFolders(next);
  }

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const booted = await bootLibraryShared();
        if (cancelled) return;
        previewUrls.current = booted.previewUrls;
        setLocalAssets(booted.hydrated);
        setDeleted(booted.deleted);
        setNextNumber(booted.nextNumber);
        foldersRef.current = booted.folders;
        setFolders(booted.folders);
        setPlacements(booted.placements);
      } catch (error) {
        console.error("No se pudo cargar la biblioteca local", error);
      } finally {
        if (!cancelled) setReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const assets = useMemo(() => {
    const hidden = new Set(deleted);
    const demo = demoAssets.filter((asset) => !hidden.has(asset.code));
    const local = localAssets.filter((asset) => !hidden.has(asset.code));
    return [...local, ...demo];
  }, [deleted, localAssets]);

  const getAsset = useCallback(
    (code: string) =>
      assets.find((asset) => asset.code.toUpperCase() === code.toUpperCase()),
    [assets],
  );

  const folderIdOf = useCallback(
    (code: string) => placements[code] ?? null,
    [placements],
  );

  const allocateCodes = useCallback((count: number) => {
    const codes = Array.from({ length: count }, (_, index) =>
      formatCreativeCode(nextNumber + index),
    );
    const following = nextNumber + count;
    setNextNumber(following);
    void saveNextNumber(following);
    return codes;
  }, [nextNumber]);

  const ensurePath = useCallback((names: string[]) => {
    const run = async () => {
      let parentId: string | null = null;
      let list = foldersRef.current;
      for (const raw of names) {
        const name = raw.trim();
        if (!name) continue;
        let found = findChildFolder(list, parentId, name);
        if (!found) {
          found = { id: crypto.randomUUID(), name, parentId };
          await putFolder(found);
          list = [...list, found];
          foldersRef.current = list;
          setFolders(list);
        }
        parentId = found.id;
      }
      if (!parentId) {
        throw new Error("No se pudo crear la ruta de carpetas");
      }
      return parentId;
    };
    const next = pathChain.current.then(run, run);
    pathChain.current = next.then(
      () => undefined,
      () => undefined,
    );
    return next;
  }, []);

  const saveUpload = useCallback(
    async (snapshot: UploadSnapshot) => {
      const folderId =
        snapshot.folderId &&
        foldersRef.current.some((folder) => folder.id === snapshot.folderId)
          ? snapshot.folderId
          : await ensurePath([
              getBrand(snapshot.brand)?.name ?? snapshot.brand,
              folderYear(new Date().toISOString()),
              folderMonth(new Date().toISOString()),
              getCountry(snapshot.country).code,
              getTheme(snapshot.theme).name,
            ]);
      const asset = buildAssetFromUpload({ ...snapshot, folderId });
      const previewSrc = URL.createObjectURL(snapshot.file);
      previewUrls.current.push(previewSrc);
      const stored = { ...asset, previewSrc, folderId };
      await putLocalRecord({
        code: asset.code,
        asset: { ...asset, previewSrc: "", folderId },
        blob: snapshot.file,
      });
      setPlacements((current) => {
        const next = { ...current, [asset.code]: folderId };
        void savePlacements(next);
        return next;
      });
      setLocalAssets((current) => [
        stored,
        ...current.filter((item) => item.code !== stored.code),
      ]);
    },
    [ensurePath],
  );

  const deleteAsset = useCallback(async (code: string) => {
    const upper = code.toUpperCase();
    setLocalAssets((current) =>
      current.filter((asset) => asset.code !== upper && asset.code !== code),
    );
    setDeleted((current) => {
      const next = current.includes(code) ? current : [...current, code];
      void saveDeletedCodes(next);
      return next;
    });
    setPlacements((current) => {
      const next = { ...current };
      delete next[code];
      void savePlacements(next);
      return next;
    });
    await deleteLocalRecord(code);
  }, []);

  const createFolder = useCallback(async (parentId: string | null, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return null;
    if (findChildFolder(foldersRef.current, parentId, trimmed)) return null;
    const folder: LibraryFolder = {
      id: crypto.randomUUID(),
      name: trimmed,
      parentId,
    };
    await putFolder(folder);
    replaceFolders([...foldersRef.current, folder]);
    return folder;
  }, []);

  const deleteFolder = useCallback(
    async (id: string) => {
      const ids = descendantFolderIds(foldersRef.current, id);
      const codes = Object.entries(placements)
        .filter(([, folderId]) => ids.includes(folderId))
        .map(([code]) => code);
      for (const folderId of ids) {
        await deleteFolderRecord(folderId);
      }
      for (const code of codes) {
        await deleteLocalRecord(code);
      }
      replaceFolders(foldersRef.current.filter((folder) => !ids.includes(folder.id)));
      setDeleted((current) => {
        const next = [...current];
        for (const code of codes) {
          if (!next.includes(code)) next.push(code);
        }
        void saveDeletedCodes(next);
        return next;
      });
      setPlacements((current) => {
        const next = { ...current };
        for (const code of codes) delete next[code];
        void savePlacements(next);
        return next;
      });
      setLocalAssets((current) => current.filter((asset) => !codes.includes(asset.code)));
    },
    [placements],
  );

  const value = useMemo(
    () => ({
      ready,
      assets,
      folders,
      getAsset,
      folderIdOf,
      allocateCodes,
      saveUpload,
      deleteAsset,
      createFolder,
      deleteFolder,
      ensurePath,
    }),
    [
      allocateCodes,
      assets,
      createFolder,
      deleteAsset,
      deleteFolder,
      ensurePath,
      folderIdOf,
      folders,
      getAsset,
      ready,
      saveUpload,
    ],
  );

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export function useLibrary() {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error("useLibrary debe usarse dentro de LibraryProvider");
  }
  return context;
}

export function confirmDeleteAsset(code: string): boolean {
  return window.confirm(
    `¿Eliminar ${code} de la biblioteca? Desaparecerá de este navegador.`,
  );
}

export function confirmDeleteFolder(name: string): boolean {
  return window.confirm(
    `¿Eliminar la carpeta «${name}» y todo su contenido de este navegador?`,
  );
}

