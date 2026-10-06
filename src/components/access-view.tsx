import Link from "next/link";
import { DemoBanner } from "@/components/demo-banner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Wordmark } from "@/components/wordmark";

export function AccessView({ denied }: { denied: boolean }) {
  return (
    <div className="flex min-h-full flex-col bg-background">
      <DemoBanner />
      <main
        id="contenido"
        className="flex flex-1 items-center justify-center px-4 py-16"
      >
        <Card className="w-full max-w-md rounded-[16px] py-8 shadow-[0_8px_24px_rgba(49,82,112,0.08)] ring-border">
          <CardContent className="flex flex-col items-center gap-6 text-center">
            <Wordmark className="h-11 max-w-[280px]" />
            <p className="max-w-sm text-[15px] text-muted-foreground">
              Sube una imagen, comparte su ID y consulta el análisis de los
              anuncios que la usan.
            </p>

            {denied ? (
              <div
                role="alert"
                className="w-full rounded-[10px] border border-[color-mix(in_srgb,var(--danger)_25%,white)] bg-[color-mix(in_srgb,var(--danger)_8%,white)] px-4 py-3 text-left"
              >
                <p className="font-medium text-destructive">
                  Esta cuenta no tiene acceso
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  La cuenta de Google no pertenece a un dominio permitido de
                  Witme. El dominio se validará en servidor en la Fase 1.
                </p>
              </div>
            ) : (
              <p className="rounded-[10px] bg-brand-tint px-3 py-2 text-[13px] text-brand">
                Botón de prototipo: no inicia sesión con Google todavía.
              </p>
            )}

            {denied ? (
              <Button
                asChild
                variant="outline"
                className="h-11 w-full rounded-[10px] text-[15px]"
              >
                <Link href="/acceso">Volver</Link>
              </Button>
            ) : (
              <Button
                asChild
                className="h-11 w-full rounded-[10px] text-[15px]"
              >
                <Link href="/">Entrar con Google</Link>
              </Button>
            )}

            {!denied ? (
              <p className="text-sm text-muted-foreground">
                Para revisar el diseño del rechazo,{" "}
                <Link
                  href="/acceso?estado=sin-acceso"
                  className="font-medium text-brand underline-offset-4 hover:underline"
                >
                  simular cuenta sin acceso
                </Link>
                .
              </p>
            ) : null}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
