import Link from "next/link";
import { HomeLink } from "@/components/home-link";
import { Wordmark } from "@/components/wordmark";

export function AppShell({
  children,
  current,
}: {
  children: React.ReactNode;
  current?: "biblioteca" | "subir" | "ficha";
}) {
  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <HomeLink
            className="rounded-[10px] focus-visible:outline-2"
            aria-label="Witme Lens, ir a la biblioteca"
          >
            <Wordmark />
          </HomeLink>
          <nav aria-label="Principal" className="flex items-center gap-1">
            <HomeLink
              className={`rounded-[10px] px-3 py-2 text-sm font-medium ${
                current === "biblioteca"
                  ? "bg-brand-tint text-brand"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
              aria-current={current === "biblioteca" ? "page" : undefined}
            >
              Biblioteca
            </HomeLink>
            <Link
              href="/acceso"
              className="rounded-[10px] px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              Acceso
            </Link>
          </nav>
        </div>
      </header>
      <main id="contenido" className="flex-1">
        {children}
      </main>
    </div>
  );
}
