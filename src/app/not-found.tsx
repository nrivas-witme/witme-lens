import { AppShell } from "@/components/app-shell";
import Link from "next/link";

export default function NotFound() {
  return (
    <AppShell>
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="text-[28px]">Página no encontrada</h1>
        <p className="mt-2 text-muted-foreground">
          Esa ruta no forma parte del prototipo.
        </p>
        <Link href="/" className="mt-6 inline-block font-medium text-brand underline">
          Ir a la biblioteca
        </Link>
      </div>
    </AppShell>
  );
}
