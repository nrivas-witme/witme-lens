"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertCircleIcon, HomeIcon, UploadIcon, XIcon } from "lucide-react";
import { CopyButton } from "@/components/copy-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { catalogs } from "@/lib/demo-data";
import { folderPath, useLibrary } from "@/components/library-provider";
import { buildNormalizedName, fileExtension } from "@/lib/naming";
import {
  formatSizeLabel,
  getSize,
  matchSize,
  sizeGroups,
  type CatalogSize,
} from "@/lib/sizes";

type FileStatus = "ready" | "uploading" | "error" | "done" | "cancelled";

type UploadItem = {
  localId: string;
  file: File;
  previewUrl: string;
  fileWidth: number;
  fileHeight: number;
  sizeCode: string;
  width: number;
  height: number;
  brand: string;
  country: string;
  product: string;
  format: string;
  language: string;
  theme: string;
  code: string;
  status: FileStatus;
  progress: number;
};

const defaultMeta = {
  brand: "CREDITIO",
  country: "DE",
  product: "TARJETA",
  format: "IMAGEN",
  language: "DE",
  theme: "GENERICA",
  sizeCode: "1200x1200",
};

const ACCEPTED_LABEL = "PNG, JPG, WEBP, MP4 o WEBM";
const ACCEPTED_TYPES = "image/png,image/jpeg,image/webp,video/mp4,video/webm";
const ACCEPTED_MIME = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "video/mp4",
  "video/webm",
]);
const ACCEPTED_EXTENSIONS = new Set(["png", "jpg", "jpeg", "webp", "mp4", "webm"]);

function uploadExtension(filename: string): string | null {
  const dot = filename.lastIndexOf(".");
  if (dot <= 0 || dot === filename.length - 1) return null;
  return filename.slice(dot + 1).toLowerCase();
}

function isAllowedUpload(file: File): boolean {
  const ext = uploadExtension(file.name);
  const mimeOk = file.type ? ACCEPTED_MIME.has(file.type) : true;
  const extOk = ext ? ACCEPTED_EXTENSIONS.has(ext) : true;
  if (!file.type && !ext) return false;
  return mimeOk && extOk;
}

function dragHasBlockedType(dataTransfer: DataTransfer | null): boolean {
  if (!dataTransfer) return false;
  return Array.from(dataTransfer.items).some((item) => {
    if (item.kind !== "file") return false;
    const type = item.type.toLowerCase();
    if (!type) return false;
    return !ACCEPTED_MIME.has(type);
  });
}

function rejectNoticeFor(input: {
  format: File[];
  size: { name: string; width: number; height: number }[];
}): string | null {
  const parts: string[] = [];

  if (input.format.length === 1) {
    parts.push(
      `«${input.format[0].name}» no se ha cargado. Formatos admitidos: ${ACCEPTED_LABEL}.`,
    );
  } else if (input.format.length > 1) {
    const names = input.format
      .map((file) => file.name)
      .slice(0, 3)
      .join(", ");
    parts.push(
      `${input.format.length} archivos no se han cargado (${names}). Formatos admitidos: ${ACCEPTED_LABEL}.`,
    );
  }

  if (input.size.length === 1) {
    const item = input.size[0];
    parts.push(
      `«${item.name}» mide ${item.width}×${item.height}. Solo se admiten tamaños Display o PMax.`,
    );
  } else if (input.size.length > 1) {
    parts.push(
      `${input.size.length} archivos no coinciden con un tamaño Display o PMax.`,
    );
  }

  return parts.length > 0 ? parts.join(" ") : null;
}

function CatalogSelect({
  id,
  label,
  value,
  onChange,
  options,
  disabled,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly { code: string; name: string }[];
  disabled?: boolean;
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger id={id} className="h-10 w-full rounded-[10px] bg-white">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((item) => (
            <SelectItem key={item.code} value={item.code}>
              {item.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function SizeSelect({
  id,
  value,
  onChange,
  disabled,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>Tamaño</Label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger id={id} className="h-10 w-full rounded-[10px] bg-white">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {sizeGroups.map((group) => (
            <SelectGroup key={group.family}>
              <SelectLabel>{group.label}</SelectLabel>
              {group.sizes.map((size) => (
                <SelectItem key={size.code} value={size.code}>
                  {formatSizeLabel(size)}
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function detectFormat(file: File): "IMAGEN" | "VIDEO" {
  return file.type.startsWith("video/") ? "VIDEO" : "IMAGEN";
}

async function readImageSize(
  file: File,
): Promise<{ width: number; height: number } | null> {
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    if (!image.naturalWidth || !image.naturalHeight) return null;
    return { width: image.naturalWidth, height: image.naturalHeight };
  } catch {
    return null;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function readVideoSize(
  file: File,
): Promise<{ width: number; height: number } | null> {
  const url = URL.createObjectURL(file);
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      const width = video.videoWidth;
      const height = video.videoHeight;
      URL.revokeObjectURL(url);
      resolve(width && height ? { width, height } : null);
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    video.src = url;
  });
}

function readMediaSize(
  file: File,
): Promise<{ width: number; height: number } | null> {
  return detectFormat(file) === "VIDEO" ? readVideoSize(file) : readImageSize(file);
}

export function UploadFlow() {
  const inputRef = useRef<HTMLInputElement>(null);
  const searchParams = useSearchParams();
  const { allocateCodes, folders, ready, saveUpload } = useLibrary();
  const requestedFolder = searchParams.get("carpeta");
  const currentFolder =
    folders.find((folder) => folder.id === requestedFolder) ?? null;
  const currentPath = folderPath(folders, currentFolder?.id ?? null);
  const backHref = currentFolder ? `/?carpeta=${encodeURIComponent(currentFolder.id)}` : "/";
  const savedIds = useRef<Set<string>>(new Set());
  const [batch, setBatch] = useState(defaultMeta);
  const [items, setItems] = useState<UploadItem[]>([]);
  const [dragging, setDragging] = useState(false);
  const [dragBlocked, setDragBlocked] = useState(false);
  const [rejectNotice, setRejectNotice] = useState<string | null>(null);
  const timers = useRef<Record<string, number>>({});

  const activeItems = items.filter((item) => item.status !== "cancelled");
  const allDone =
    activeItems.length > 0 && activeItems.every((item) => item.status === "done");
  const anyDone = items.some((item) => item.status === "done");

  useEffect(() => {
    if (requestedFolder && !ready) return;
    for (const item of items) {
      if (item.status !== "done" || savedIds.current.has(item.localId)) continue;
      savedIds.current.add(item.localId);
      void saveUpload({
        file: item.file,
        code: item.code,
        brand: item.brand,
        country: item.country,
        product: item.product,
        format: item.format,
        language: item.language,
        sizeCode: item.sizeCode,
        width: item.width,
        height: item.height,
        theme: item.theme,
        folderId: currentFolder?.id,
      });
    }
  }, [currentFolder?.id, items, ready, requestedFolder, saveUpload]);

  async function addFiles(fileList: FileList | File[]) {
    const incoming = Array.from(fileList);
    if (incoming.length === 0) return;

    const rejectedFormat: File[] = [];
    const rejectedSize: { name: string; width: number; height: number }[] = [];
    const accepted: {
      file: File;
      pixels: { width: number; height: number };
      matched: CatalogSize;
    }[] = [];

    for (const file of incoming) {
      if (!isAllowedUpload(file)) {
        rejectedFormat.push(file);
        continue;
      }

      const pixels = await readMediaSize(file);
      if (!pixels) {
        rejectedFormat.push(file);
        continue;
      }

      const matched = matchSize(pixels.width, pixels.height);
      if (!matched) {
        rejectedSize.push({
          name: file.name,
          width: pixels.width,
          height: pixels.height,
        });
        continue;
      }

      accepted.push({ file, pixels, matched });
    }

    const codes = accepted.length > 0 ? allocateCodes(accepted.length) : [];
    const next: UploadItem[] = accepted.map((entry, index) => ({
      localId: crypto.randomUUID(),
      file: entry.file,
      previewUrl: URL.createObjectURL(entry.file),
      fileWidth: entry.pixels.width,
      fileHeight: entry.pixels.height,
      ...batch,
      format: detectFormat(entry.file),
      sizeCode: entry.matched.code,
      width: entry.matched.width,
      height: entry.matched.height,
      code: codes[index],
      status: "ready",
      progress: 0,
    }));

    setRejectNotice(rejectNoticeFor({ format: rejectedFormat, size: rejectedSize }));
    if (next.length > 0) {
      setItems((current) => [...current, ...next]);
    }
  }

  function applyBatchToAll() {
    const size = getSize(batch.sizeCode);
    setItems((current) =>
      current.map((item) =>
        item.status === "done"
          ? item
          : { ...item, ...batch, width: size.width, height: size.height },
      ),
    );
  }

  function simulateUpload(id: string) {
    window.clearInterval(timers.current[id]);
    setItems((current) =>
      current.map((item) =>
        item.localId === id
          ? { ...item, status: "uploading", progress: 8 }
          : item,
      ),
    );

    timers.current[id] = window.setInterval(() => {
      setItems((current) =>
        current.map((item) => {
          if (item.localId !== id || item.status !== "uploading") return item;
          const progress = Math.min(item.progress + 12, 100);
          if (progress >= 100) {
            window.clearInterval(timers.current[id]);
            return { ...item, progress: 100, status: "done" };
          }
          return { ...item, progress };
        }),
      );
    }, 180);
  }

  function startAll() {
    items
      .filter((item) => item.status === "ready" || item.status === "error")
      .forEach((item) => simulateUpload(item.localId));
  }

  function cancel(id: string) {
    window.clearInterval(timers.current[id]);
    setItems((current) =>
      current.map((item) =>
        item.localId === id
          ? { ...item, status: "cancelled", progress: 0 }
          : item,
      ),
    );
  }

  function retry(id: string) {
    setItems((current) =>
      current.map((item) =>
        item.localId === id ? { ...item, status: "ready", progress: 0 } : item,
      ),
    );
    simulateUpload(id);
  }

  function remove(id: string) {
    window.clearInterval(timers.current[id]);
    setItems((current) => {
      const found = current.find((item) => item.localId === id);
      if (found) URL.revokeObjectURL(found.previewUrl);
      return current.filter((item) => item.localId !== id);
    });
  }

  const summary = useMemo(
    () =>
      items.map((item) => ({
        ...item,
        normalizedName: buildNormalizedName({
          code: item.code,
          brand: item.brand,
          country: item.country,
          product: item.product,
          format: item.format,
          width: item.width,
          height: item.height,
          language: item.language,
          extension: fileExtension(item.file.name),
        }),
      })),
    [items],
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <p className="text-sm text-muted-foreground">
        <Link href={backHref} className="hover:underline">
          Biblioteca
        </Link>
        {currentPath.map((folder) => (
          <span key={folder.id}>
            {" "}
            /{" "}
            <Link
              href={`/?carpeta=${encodeURIComponent(folder.id)}`}
              className="hover:underline"
            >
              {folder.name}
            </Link>
          </span>
        ))}{" "}
        / Subir imagen
      </p>
      <h1 className="mt-2 text-[28px] sm:text-[32px]">Subir imagen</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {currentFolder
          ? `Se guardará en «${currentFolder.name}» de este navegador.`
          : "Sin carpeta abierta: se creará marca / año / mes / país / temática."}{" "}
        Simulación local, no un servidor.
      </p>

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
          setDragBlocked(dragHasBlockedType(event.dataTransfer));
        }}
        onDragLeave={() => {
          setDragging(false);
          setDragBlocked(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          setDragBlocked(false);
          void addFiles(event.dataTransfer.files);
        }}
        className={`mt-8 flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-[16px] border-2 border-dashed px-6 py-10 text-center ${
          dragBlocked || rejectNotice
            ? "border-destructive bg-[color-mix(in_srgb,var(--danger)_8%,white)]"
            : dragging
              ? "border-action bg-brand-tint"
              : "border-border bg-white"
        }`}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Arrastrar o seleccionar imágenes o vídeos"
      >
        {dragBlocked || rejectNotice ? (
          <div role="alert" className="flex max-w-lg flex-col items-center">
            <AlertCircleIcon className="size-8 text-destructive" />
            <p className="mt-3 font-medium text-destructive">
              Tamaño o archivo no permitido
            </p>
            <p className="mt-1 text-sm text-destructive">
              {rejectNotice ??
                `No se cargará. Formatos admitidos: ${ACCEPTED_LABEL}.`}
            </p>
            {rejectNotice ? (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setRejectNotice(null);
                }}
                className="mt-3 rounded-[10px] px-3 py-1.5 text-sm font-medium text-destructive underline-offset-4 hover:underline"
              >
                Cerrar aviso
              </button>
            ) : null}
          </div>
        ) : (
          <>
            <UploadIcon className="size-8 text-brand" />
            <p className="mt-3 font-medium text-brand">
              Arrastra una o varias imágenes o vídeos
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              o pulsa para seleccionarlas. {ACCEPTED_LABEL}.
            </p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES}
          multiple
          className="sr-only"
          aria-hidden="true"
          tabIndex={-1}
          onChange={(event) => {
            if (event.target.files) void addFiles(event.target.files);
            event.target.value = "";
          }}
        />
      </div>
      <p className="mt-3 text-sm text-muted-foreground">
        Display: 300×250, 300×600, 336×280, 728×90, 320×100, 320×50, 250×250.
        PMax: 1200×1200, 960×1200, 1200×628.
      </p>

      {items.length > 0 ? (
        <>
          <section className="mt-8 rounded-[16px] bg-white p-5 shadow-[0_8px_24px_rgba(49,82,112,0.06)] ring-1 ring-border">
            <h2 className="text-lg text-brand">Metadatos del lote</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Se aplican a todos los archivos pendientes. Puedes corregir cada
              uno abajo. El ID y el nombre los genera el sistema.
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <CatalogSelect
                id="lote-marca"
                label="Marca"
                value={batch.brand}
                onChange={(brand) => setBatch((current) => ({ ...current, brand }))}
                options={catalogs.brands}
              />
              <CatalogSelect
                id="lote-pais"
                label="País"
                value={batch.country}
                onChange={(country) =>
                  setBatch((current) => ({ ...current, country }))
                }
                options={catalogs.countries}
              />
              <CatalogSelect
                id="lote-tipo"
                label="Tipo"
                value={batch.format}
                onChange={(format) => setBatch((current) => ({ ...current, format }))}
                options={catalogs.formats}
              />
              <CatalogSelect
                id="lote-producto"
                label="Producto"
                value={batch.product}
                onChange={(product) =>
                  setBatch((current) => ({ ...current, product }))
                }
                options={catalogs.products}
              />
              <CatalogSelect
                id="lote-idioma"
                label="Idioma"
                value={batch.language}
                onChange={(language) =>
                  setBatch((current) => ({ ...current, language }))
                }
                options={catalogs.languages}
              />
              <CatalogSelect
                id="lote-tematica"
                label="Temática"
                value={batch.theme}
                onChange={(theme) => setBatch((current) => ({ ...current, theme }))}
                options={catalogs.themes}
              />
              <SizeSelect
                id="lote-tamano"
                value={batch.sizeCode}
                onChange={(sizeCode) => setBatch((current) => ({ ...current, sizeCode }))}
              />
            </div>
            <Button
              type="button"
              variant="secondary"
              className="mt-4 h-10 rounded-[10px]"
              onClick={applyBatchToAll}
            >
              Aplicar a todos los pendientes
            </Button>
          </section>

          <ul className="mt-6 grid gap-4">
            {summary.map((item) => (
              <li key={item.localId}>
                <Card className="rounded-[16px] ring-border">
                  <CardContent className="grid gap-4 sm:grid-cols-[120px_1fr]">
                    <img
                      src={item.previewUrl}
                      alt=""
                      className="h-24 w-full rounded-[10px] object-contain bg-brand-tint"
                    />
                    <div className="grid gap-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-mono text-sm font-semibold text-brand">
                            {item.code}
                          </p>
                          <p className="mt-1 break-all text-xs text-muted-foreground">
                            {item.normalizedName}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Original: {item.file.name} · archivo {item.fileWidth}×
                            {item.fileHeight}
                          </p>
                          {item.fileWidth !== item.width ||
                          item.fileHeight !== item.height ? (
                            <p role="status" className="mt-1 text-xs text-warning">
                              El archivo no coincide con {item.width}×{item.height} del
                              catálogo. Revisa el tamaño o el archivo.
                            </p>
                          ) : (
                            <p className="mt-1 text-xs text-muted-foreground">
                              Coincide con {getSize(item.sizeCode).familyName}{" "}
                              {item.width}×{item.height}.
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => remove(item.localId)}
                          className="rounded-[10px] p-1 text-muted-foreground hover:bg-muted"
                          aria-label={`Quitar ${item.file.name}`}
                        >
                          <XIcon className="size-4" />
                        </button>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        <CatalogSelect
                          id={`${item.localId}-marca`}
                          label="Marca"
                          value={item.brand}
                          disabled={item.status === "done" || item.status === "uploading"}
                          onChange={(brand) =>
                            setItems((current) =>
                              current.map((row) =>
                                row.localId === item.localId ? { ...row, brand } : row,
                              ),
                            )
                          }
                          options={catalogs.brands}
                        />
                        <CatalogSelect
                          id={`${item.localId}-pais`}
                          label="País"
                          value={item.country}
                          disabled={item.status === "done" || item.status === "uploading"}
                          onChange={(country) =>
                            setItems((current) =>
                              current.map((row) =>
                                row.localId === item.localId
                                  ? { ...row, country }
                                  : row,
                              ),
                            )
                          }
                          options={catalogs.countries}
                        />
                        <CatalogSelect
                          id={`${item.localId}-producto`}
                          label="Producto"
                          value={item.product}
                          disabled={item.status === "done" || item.status === "uploading"}
                          onChange={(product) =>
                            setItems((current) =>
                              current.map((row) =>
                                row.localId === item.localId
                                  ? { ...row, product }
                                  : row,
                              ),
                            )
                          }
                          options={catalogs.products}
                        />
                        <CatalogSelect
                          id={`${item.localId}-idioma`}
                          label="Idioma"
                          value={item.language}
                          disabled={item.status === "done" || item.status === "uploading"}
                          onChange={(language) =>
                            setItems((current) =>
                              current.map((row) =>
                                row.localId === item.localId
                                  ? { ...row, language }
                                  : row,
                              ),
                            )
                          }
                          options={catalogs.languages}
                        />
                        <CatalogSelect
                          id={`${item.localId}-tematica`}
                          label="Temática"
                          value={item.theme}
                          disabled={item.status === "done" || item.status === "uploading"}
                          onChange={(theme) =>
                            setItems((current) =>
                              current.map((row) =>
                                row.localId === item.localId ? { ...row, theme } : row,
                              ),
                            )
                          }
                          options={catalogs.themes}
                        />
                        <SizeSelect
                          id={`${item.localId}-tamano`}
                          value={item.sizeCode}
                          disabled={item.status === "done" || item.status === "uploading"}
                          onChange={(sizeCode) => {
                            const size = getSize(sizeCode);
                            setItems((current) =>
                              current.map((row) =>
                                row.localId === item.localId
                                  ? {
                                      ...row,
                                      sizeCode,
                                      width: size.width,
                                      height: size.height,
                                    }
                                  : row,
                              ),
                            );
                          }}
                        />
                      </div>
                      {item.status === "uploading" || item.status === "done" ? (
                        <div>
                          <Progress value={item.progress} className="h-2" />
                          <p className="mt-1 text-xs text-muted-foreground">
                            {item.status === "done"
                              ? "Lista para compartir (simulado)"
                              : `Subiendo… ${item.progress}%`}
                          </p>
                        </div>
                      ) : null}
                      <div className="flex flex-wrap gap-2">
                        {item.status === "done" ? (
                          <>
                            <CopyButton value={item.code} label="Copiar ID" primary />
                            <CopyButton
                              value={`/creatividades/${item.code}`}
                              label="Copiar enlace"
                            />
                          </>
                        ) : item.status === "uploading" ? (
                          <Button
                            type="button"
                            variant="outline"
                            className="h-10 rounded-[10px]"
                            onClick={() => cancel(item.localId)}
                          >
                            Cancelar
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            className="h-10 rounded-[10px]"
                            onClick={() =>
                              item.status === "error" || item.status === "cancelled"
                                ? retry(item.localId)
                                : simulateUpload(item.localId)
                            }
                          >
                            {item.status === "error" || item.status === "cancelled"
                              ? "Reintentar"
                              : "Subir este archivo"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>

          {!allDone ? (
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button
                type="button"
                className="h-11 rounded-[10px] px-5 text-[15px]"
                onClick={startAll}
              >
                Subir todas
              </Button>
              {anyDone ? (
                <Button asChild variant="outline" className="h-11 rounded-[10px] px-5 text-[15px]">
                  <Link href={backHref}>
                    <HomeIcon data-icon="inline-start" />
                    Volver a inicio
                  </Link>
                </Button>
              ) : null}
            </div>
          ) : (
            <div className="mt-6 flex flex-col items-start gap-4">
              <p className="rounded-[10px] bg-brand-tint px-4 py-3 text-sm text-brand">
                Guardada en la biblioteca de este navegador. Copia el ID o el
                enlace y vuelve al inicio cuando quieras.
              </p>
              <Button asChild className="h-11 rounded-[10px] px-5 text-[15px]">
                <Link href={backHref}>
                  <HomeIcon data-icon="inline-start" />
                  Volver a inicio
                </Link>
              </Button>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
