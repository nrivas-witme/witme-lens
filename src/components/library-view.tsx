"use client";

import { useMemo, useState, type DragEvent, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronRightIcon,
  FolderPlusIcon,
  GripVerticalIcon,
  SearchIcon,
} from "lucide-react";
import { AssetCard } from "@/components/asset-card";
import { AssetLocationEditor } from "@/components/asset-location-editor";
import { LibraryFolderCard } from "@/components/library-folder-card";
import { folderPath, useLibrary, type LibraryFolder } from "@/components/library-provider";
import { CreativePreview } from "@/components/creative-preview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { assetHref, catalogs } from "@/lib/demo-data";
import { FOLDER_COUNTRY_CODES, compareFolderNames } from "@/lib/folders";
import {
  canMoveFolderInto,
  DND_ASSET_MIME,
  readDraggedAssetCode,
  readDraggedFolderId,
} from "@/lib/library-dnd";

function folderHref(id: string | null): string {
  return id ? `/?carpeta=${encodeURIComponent(id)}` : "/";
}

function BreadcrumbDropTarget({
  label,
  href,
  folderId,
  active,
  folders,
  onDrop,
}: {
  label: string;
  href: string;
  folderId: string | null;
  active?: boolean;
  folders: LibraryFolder[];
  onDrop: (event: DragEvent) => void | Promise<void>;
}) {
  const [hover, setHover] = useState(false);

  function allowDrop(event: DragEvent) {
    const assetCode = readDraggedAssetCode(event.dataTransfer);
    if (assetCode && folderId) {
      event.preventDefault();
      return;
    }
    const draggedFolderId = readDraggedFolderId(event.dataTransfer);
    if (
      draggedFolderId &&
      canMoveFolderInto(folders, draggedFolderId, folderId)
    ) {
      event.preventDefault();
    }
  }

  return (
    <span
      className={`rounded-[8px] px-1.5 py-1 transition-colors ${
        hover ? "bg-brand-tint ring-1 ring-brand/30" : ""
      } ${active ? "font-medium text-brand" : "text-brand"}`}
      onDragOver={(event) => {
        allowDrop(event);
        setHover(true);
      }}
      onDragLeave={() => setHover(false)}
      onDrop={(event) => {
        setHover(false);
        void onDrop(event);
      }}
    >
      <Link href={href} className="hover:underline">
        {label}
      </Link>
    </span>
  );
}

export function LibraryView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    assets,
    folders,
    ready,
    folderIdOf,
    createFolder,
    deleteFolder,
    moveAssetToFolder,
    moveFolderToParent,
  } = useLibrary();
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [folderError, setFolderError] = useState<string | null>(null);

  const requestedId = searchParams.get("carpeta");
  const currentFolder = folders.find((folder) => folder.id === requestedId) ?? null;
  const currentId = currentFolder?.id ?? null;
  const path = folderPath(folders, currentId);
  const searching = query.trim().length > 0;

  const childFolders = useMemo(
    () =>
      folders
        .filter((folder) => folder.parentId === currentId)
        .sort((a, b) => compareFolderNames(a.name, b.name)),
    [currentId, folders],
  );

  const filteredAssets = useMemo(() => {
    const q = query.trim().toLowerCase();
    return assets.filter((asset) => {
      const matchesQuery =
        q.length === 0 ||
        asset.code.toLowerCase().includes(q) ||
        asset.normalizedName.toLowerCase().includes(q) ||
        asset.originalName.toLowerCase().includes(q) ||
        asset.title.toLowerCase().includes(q) ||
        asset.sizeLabel.toLowerCase().includes(q) ||
        asset.sizeCode.toLowerCase().includes(q) ||
        asset.sizeFamilyName.toLowerCase().includes(q) ||
        asset.brandName.toLowerCase().includes(q) ||
        (asset.themeName ?? "").toLowerCase().includes(q);
      const matchesFolder =
        searching || (folderIdOf(asset.code) ?? null) === currentId;
      return matchesQuery && matchesFolder;
    });
  }, [assets, currentId, folderIdOf, query, searching]);

  const recentAssets = useMemo(
    () =>
      [...assets]
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
        .slice(0, 6),
    [assets],
  );

  const localCount = assets.filter((asset) =>
    asset.author.startsWith("Subida local"),
  ).length;
  const uploadHref = currentId
    ? `/subir?carpeta=${encodeURIComponent(currentId)}`
    : "/subir";
  const countrySuggestions = !searching && path.length === 3;
  const themeSuggestions = !searching && path.length === 4;

  async function handleDropOnFolder(
    event: DragEvent,
    targetFolderId: string | null,
  ) {
    event.preventDefault();
    const assetCode = readDraggedAssetCode(event.dataTransfer);
    if (assetCode && targetFolderId) {
      await moveAssetToFolder(assetCode, targetFolderId);
      return;
    }
    const draggedFolderId = readDraggedFolderId(event.dataTransfer);
    if (
      draggedFolderId &&
      canMoveFolderInto(folders, draggedFolderId, targetFolderId)
    ) {
      await moveFolderToParent(draggedFolderId, targetFolderId);
    }
  }
  const empty = childFolders.length === 0 && filteredAssets.length === 0 && !creating;

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    const folder = await createFolder(currentId, newName);
    if (!folder) {
      setFolderError(
        newName.trim()
          ? "Ya hay una carpeta con ese nombre aquí."
          : "Escribe un nombre para la carpeta.",
      );
      return;
    }
    setNewName("");
    setFolderError(null);
    setCreating(false);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[28px] sm:text-[32px]">Biblioteca</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {ready
              ? `${assets.length} creatividades${
                  localCount > 0
                    ? ` · ${localCount} ${localCount === 1 ? "subida" : "subidas"} en este navegador`
                    : " de demostración"
                }. Nada está sincronizado.`
              : "Cargando biblioteca…"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-11 rounded-[10px] px-5 text-[15px]"
            onClick={() => {
              setCreating(true);
              setFolderError(null);
            }}
            disabled={searching}
          >
            <FolderPlusIcon data-icon="inline-start" />
            Nueva carpeta
          </Button>
          <Button asChild className="h-11 rounded-[10px] px-5 text-[15px]">
            <Link href={uploadHref}>Subir imagen</Link>
          </Button>
        </div>
      </div>

      <nav
        aria-label="Ruta de carpetas"
        className="mt-6 flex flex-wrap items-center gap-1 text-sm"
      >
        <BreadcrumbDropTarget
          label="Biblioteca"
          href="/"
          folderId={null}
          folders={folders}
          onDrop={(event) => handleDropOnFolder(event, null)}
        />
        {path.map((folder) => (
          <span key={folder.id} className="flex items-center gap-1">
            <ChevronRightIcon className="size-4 text-muted-foreground" />
            <BreadcrumbDropTarget
              label={folder.name}
              href={folderHref(folder.id)}
              folderId={folder.id}
              active={folder.id === currentId}
              folders={folders}
              onDrop={(event) => handleDropOnFolder(event, folder.id)}
            />
          </span>
        ))}
      </nav>
      {!searching ? (
        <p className="mt-2 text-xs text-muted-foreground">
          Arrastra creatividades o carpetas (icono ≡) sobre otra carpeta o la ruta
          de arriba para moverlas.
        </p>
      ) : null}

      <form className="mt-6" onSubmit={(event) => event.preventDefault()}>
        <Label htmlFor="buscar">Busca por ID o nombre</Label>
        <div className="relative mt-1.5">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="buscar"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="CREA-000142, Creditio o 1200x1200"
            className="h-10 rounded-[10px] bg-white pl-9"
          />
        </div>
      </form>

      {searching ? (
        <p className="mt-6 text-sm text-muted-foreground">
          Resultados en todas las carpetas
        </p>
      ) : null}

      {ready && !searching && !currentId && recentAssets.length > 0 ? (
        <section className="mt-6" aria-labelledby="ultimas-anadidas">
          <h2 id="ultimas-anadidas" className="text-sm font-medium text-brand">
            Últimas añadidas
          </h2>
          <ul className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
            {recentAssets.map((asset) => (
              <li key={asset.code} className="rounded-[10px] p-1 hover:bg-brand-tint">
                <div className="relative">
                  <button
                    type="button"
                    draggable
                    className="absolute top-1 left-1 z-10 cursor-grab rounded-[6px] bg-white/90 p-1 text-muted-foreground shadow-sm active:cursor-grabbing"
                    aria-label={`Arrastrar ${asset.code}`}
                    onDragStart={(event) => {
                      event.dataTransfer.setData(DND_ASSET_MIME, asset.code);
                      event.dataTransfer.effectAllowed = "move";
                    }}
                  >
                    <GripVerticalIcon className="size-3.5" />
                  </button>
                  <Link
                    href={assetHref(asset.code)}
                    className="block"
                    aria-label={`Ver ficha de ${asset.code}`}
                  >
                    <span className="flex h-16 items-center justify-center overflow-hidden rounded-[8px] bg-[#f0f4f8] ring-1 ring-border">
                      <CreativePreview
                        asset={asset}
                        compact
                        className="h-full w-full"
                      />
                    </span>
                    <span className="mt-1 block truncate text-center font-mono text-[11px] text-brand">
                      {asset.code}
                    </span>
                  </Link>
                </div>
                <div className="mt-1 px-0.5">
                  <AssetLocationEditor
                    code={asset.code}
                    compact
                    idPrefix={`recent-${asset.code}`}
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {!ready ? (
        <p className="mt-8 rounded-[16px] border border-dashed border-border bg-white px-6 py-12 text-center text-muted-foreground">
          Cargando carpetas…
        </p>
      ) : (
        <>
          {creating && !searching ? (
            <form
              className="mt-6 rounded-[16px] bg-white p-4 shadow-[0_8px_24px_rgba(49,82,112,0.06)] ring-1 ring-border"
              onSubmit={(event) => void handleCreate(event)}
            >
              <Label htmlFor="nueva-carpeta">Nombre de la carpeta</Label>
              <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                <Input
                  id="nueva-carpeta"
                  value={newName}
                  onChange={(event) => {
                    setNewName(event.target.value);
                    setFolderError(null);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Escape") {
                      setCreating(false);
                      setNewName("");
                      setFolderError(null);
                    }
                  }}
                  placeholder="Genérica, Vídeos, Halloween…"
                  className="h-10 rounded-[10px] bg-white"
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button type="submit" variant="outline" className="h-10 rounded-[10px]">
                    Crear
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-10 rounded-[10px]"
                    onClick={() => {
                      setCreating(false);
                      setNewName("");
                      setFolderError(null);
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
              {countrySuggestions ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {FOLDER_COUNTRY_CODES.map((code) => (
                    <button
                      key={code}
                      type="button"
                      className="rounded-full bg-brand-tint px-3 py-1 text-sm text-brand hover:underline"
                      onClick={() => {
                        setNewName(code);
                        setFolderError(null);
                      }}
                    >
                      {code}
                    </button>
                  ))}
                </div>
              ) : null}
              {themeSuggestions ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {catalogs.themes.map((theme) => (
                    <button
                      key={theme.code}
                      type="button"
                      className="rounded-full bg-brand-tint px-3 py-1 text-sm text-brand hover:underline"
                      onClick={() => {
                        setNewName(theme.name);
                        setFolderError(null);
                      }}
                    >
                      {theme.name}
                    </button>
                  ))}
                </div>
              ) : null}
              {folderError ? (
                <p role="alert" className="mt-2 text-sm text-destructive">
                  {folderError}
                </p>
              ) : null}
            </form>
          ) : null}

          {empty ? (
            <p className="mt-8 rounded-[16px] border border-dashed border-border bg-white px-6 py-12 text-center text-muted-foreground">
              {searching
                ? "No hay imágenes que coincidan. Prueba con un ID como CREA-000142."
                : "Esta carpeta está vacía. Crea una subcarpeta o sube una imagen."}
            </p>
          ) : (
            <>
              {!searching && childFolders.length > 0 ? (
                <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {childFolders.map((folder) => {
                    const nestedFolders = folders.filter(
                      (item) => item.parentId === folder.id,
                    ).length;
                    const nestedFiles = assets.filter(
                      (asset) => folderIdOf(asset.code) === folder.id,
                    ).length;
                    const total = nestedFolders + nestedFiles;
                    return (
                      <li key={folder.id}>
                        <LibraryFolderCard
                          folderId={folder.id}
                          name={folder.name}
                          total={total}
                          folderHref={folderHref(folder.id)}
                          onNavigateAfterDelete={() => {
                            const parentHref = folderHref(folder.parentId);
                            if (
                              currentId === folder.id ||
                              path.some((item) => item.id === folder.id)
                            ) {
                              router.push(parentHref);
                            }
                          }}
                        />
                      </li>
                    );
                  })}
                </ul>
              ) : null}

              {filteredAssets.length > 0 ? (
                <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredAssets.map((asset) => (
                    <li key={asset.code}>
                      <AssetCard asset={asset} />
                    </li>
                  ))}
                </ul>
              ) : !searching && childFolders.length > 0 ? (
                <p className="mt-8 text-sm text-muted-foreground">
                  No hay creatividades en esta carpeta.
                </p>
              ) : null}
            </>
          )}
        </>
      )}
    </div>
  );
}
