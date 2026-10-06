"use client";

import { useEffect, useState, type FormEvent, type MouseEvent } from "react";
import { CheckIcon, PencilIcon, XIcon } from "lucide-react";
import { useLibrary } from "@/components/library-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type RenameFolderResult =
  | { ok: true }
  | { ok: false; reason: "empty" | "duplicate" | "missing" };

function renameErrorMessage(reason: "empty" | "duplicate" | "missing"): string {
  if (reason === "duplicate") return "Ya hay una carpeta con ese nombre aquí.";
  if (reason === "empty") return "Escribe un nombre para la carpeta.";
  return "No se encontró la carpeta.";
}

export function FolderRenameControl({
  folderId,
  name,
  variant = "card",
}: {
  folderId: string;
  name: string;
  variant?: "card" | "inline";
}) {
  const { renameFolder } = useLibrary();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!editing) setDraft(name);
  }, [editing, name]);

  function stopNav(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  async function submit(event?: FormEvent) {
    event?.preventDefault();
    setSaving(true);
    setError(null);
    const result = await renameFolder(folderId, draft);
    setSaving(false);
    if (!result.ok) {
      setError(renameErrorMessage(result.reason));
      return;
    }
    setEditing(false);
  }

  if (editing) {
    return (
      <form
        className={variant === "card" ? "min-w-0 flex-1 space-y-2" : "flex flex-wrap items-center gap-2"}
        onSubmit={(event) => void submit(event)}
        onClick={stopNav}
      >
        <Input
          value={draft}
          onChange={(event) => {
            setDraft(event.target.value);
            setError(null);
          }}
          className={
            variant === "card"
              ? "h-9 rounded-[10px] bg-white text-sm"
              : "h-9 w-48 rounded-[10px] bg-white sm:w-56"
          }
          autoFocus
          disabled={saving}
          aria-label="Nuevo nombre de la carpeta"
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setEditing(false);
              setDraft(name);
              setError(null);
            }
          }}
        />
        <div className="flex gap-1">
          <Button
            type="submit"
            size="icon"
            className="size-9 shrink-0 rounded-[10px]"
            disabled={saving}
            aria-label="Guardar nombre"
          >
            <CheckIcon className="size-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-9 shrink-0 rounded-[10px]"
            disabled={saving}
            aria-label="Cancelar"
            onClick={() => {
              setEditing(false);
              setDraft(name);
              setError(null);
            }}
          >
            <XIcon className="size-4" />
          </Button>
        </div>
        {error ? (
          <p role="alert" className="text-xs text-destructive">
            {error}
          </p>
        ) : null}
      </form>
    );
  }

  if (variant === "inline") {
    return (
      <div className="flex items-center gap-1">
        <span className="text-sm font-medium text-brand">{name}</span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 rounded-[10px] text-muted-foreground"
          aria-label={`Renombrar carpeta ${name}`}
          onClick={() => setEditing(true)}
        >
          <PencilIcon className="size-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-w-0 flex-1 items-start gap-1">
      <span className="block min-w-0 truncate font-medium text-brand">{name}</span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-8 shrink-0 rounded-[10px] text-muted-foreground"
        aria-label={`Renombrar carpeta ${name}`}
        onClick={(event) => {
          stopNav(event);
          setEditing(true);
        }}
      >
        <PencilIcon className="size-4" />
      </Button>
    </div>
  );
}
