"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DownloadIcon, TrashIcon } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { CopyButton } from "@/components/copy-button";
import { AssetLocationEditor } from "@/components/asset-location-editor";
import { CreativePreview } from "@/components/creative-preview";
import { confirmDeleteAsset, useLibrary } from "@/components/library-provider";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  DEMO_NOTICE,
  derivedMetrics,
  explainStatus,
  type DemoAsset,
} from "@/lib/demo-data";
import { formatCount, formatEuro, formatRatio } from "@/lib/format";

function MetricTile({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-[16px] bg-white p-4 ring-1 ring-border">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-[28px] font-semibold tracking-tight text-brand sm:text-[32px]">
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function AssetDetail({ asset }: { asset: DemoAsset }) {
  const [period, setPeriod] = useState("90");
  const { deleteAsset } = useLibrary();
  const router = useRouter();
  const metrics = derivedMetrics(asset.analysis);
  const fichaPath = `/creatividades/${asset.code}`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <p className="text-sm text-muted-foreground">
        <Link href="/" className="hover:underline">
          Biblioteca
        </Link>{" "}
        / {asset.code}
      </p>

      <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <BrandLogo code={asset.brand} className="h-10 px-2" />
            <h1 className="font-mono text-[24px] sm:text-[28px]">{asset.code}</h1>
            <StatusBadge asset={asset} />
          </div>
          <p className="mt-1 text-[18px] font-medium text-foreground">{asset.title}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {asset.brandName} · {asset.countryName} · {asset.productName} ·{" "}
            {asset.languageName} · {asset.sizeFamilyName} {asset.sizeLabel}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <CopyButton value={asset.code} label="Copiar ID" primary />
          <CopyButton value={fichaPath} label="Copiar enlace" />
          <CopyButton value={asset.normalizedName} label="Copiar nombre" />
          <Button asChild variant="outline" className="h-10 rounded-[10px] px-3.5">
            <a href={asset.previewSrc} download={asset.normalizedName}>
              <DownloadIcon data-icon="inline-start" />
              Descargar
            </a>
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="h-10 rounded-[10px] px-3.5"
            onClick={async () => {
              if (!confirmDeleteAsset(asset.code)) return;
              router.push("/");
              await deleteAsset(asset.code);
            }}
          >
            <TrashIcon data-icon="inline-start" />
            Eliminar
          </Button>
        </div>
      </div>

      <p className="mt-4 rounded-[10px] bg-brand-tint px-3 py-2 text-[13px] text-brand">
        {DEMO_NOTICE}
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <section className="rounded-[16px] bg-white p-4 ring-1 ring-border">
          <h2 className="mb-3 text-lg text-brand">Vista previa</h2>
          <div className="rounded-[10px] bg-[#f0f4f8] p-4">
            <CreativePreview
              asset={asset}
              className="mx-auto h-auto max-h-[min(70vh,640px)] w-full"
            />
          </div>
          <p className="mt-3 break-all text-xs text-muted-foreground">
            Nombre normalizado: {asset.normalizedName}
          </p>
          <div className="mt-4 border-t border-border pt-4">
            <AssetLocationEditor code={asset.code} idPrefix={`ficha-${asset.code}`} />
          </div>
        </section>

        <section>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="text-lg text-brand">Análisis</h2>
            <div className="grid gap-1.5">
              <Label htmlFor="periodo">Periodo</Label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger id="periodo" className="h-10 w-[180px] rounded-[10px] bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Últimos 7 días</SelectItem>
                  <SelectItem value="30">Últimos 30 días</SelectItem>
                  <SelectItem value="90">Últimos 90 días</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            El selector no filtra: no hay sincronización. Se muestra el escenario
            demo ({period} días etiquetados).
          </p>

          {asset.analysis ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <MetricTile
                label="Inversión"
                value={formatEuro(asset.analysis.spend)}
                hint={
                  asset.code === "CREA-000142"
                    ? "Escenario SPEC: Meta 100 € + Google 50 €"
                    : "Dato de demostración"
                }
              />
              <MetricTile
                label="Clics"
                value={formatCount(asset.analysis.clicks)}
                hint="Ilustrativo para el prototipo"
              />
              <MetricTile
                label="Leads válidos"
                value={formatCount(asset.analysis.validLeads)}
                hint="Ilustrativo para el prototipo"
              />
              <MetricTile
                label="Ingresos confirmados"
                value={formatEuro(asset.analysis.confirmedRevenue)}
                hint="Solo estado confirmed"
              />
              <MetricTile
                label="CPL"
                value={metrics.cpl === null ? "—" : formatEuro(metrics.cpl.toFixed(2))}
              />
              <MetricTile
                label="ROAS"
                value={formatRatio(metrics.roas)}
              />
              <MetricTile
                label="Resultado"
                value={
                  metrics.result === null ? "Sin datos" : formatEuro(metrics.result.toFixed(2))
                }
                hint="Ingresos confirmados − inversión"
              />
              <MetricTile
                label="Ingresos pendientes"
                value={formatEuro(asset.analysis.pendingRevenue)}
                hint="No entran en ROAS ni resultado"
              />
            </div>
          ) : (
            <p className="mt-4 rounded-[16px] border border-dashed border-border bg-white px-4 py-8 text-muted-foreground">
              Sin anuncios todavía. Cuando tráfico use este ID, aquí aparecerán
              inversión e ingresos.
            </p>
          )}
        </section>
      </div>

      <section className="mt-8">
        <h2 className="text-lg text-brand">Dónde se usa</h2>
        {asset.usages.length === 0 ? (
          <p className="mt-3 rounded-[16px] border border-dashed border-border bg-white px-4 py-8 text-muted-foreground">
            Ningún anuncio vinculado a este ID.
          </p>
        ) : (
          <div className="mt-3 overflow-x-auto rounded-[16px] bg-white ring-1 ring-border">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-brand-tint text-brand">
                <tr>
                  <th className="px-4 py-3 font-medium">Plataforma</th>
                  <th className="px-4 py-3 font-medium">Cuenta</th>
                  <th className="px-4 py-3 font-medium">Campaña</th>
                  <th className="px-4 py-3 font-medium">Anuncio</th>
                  <th className="px-4 py-3 font-medium">Fechas</th>
                  <th className="px-4 py-3 font-medium">Vínculo</th>
                </tr>
              </thead>
              <tbody>
                {asset.usages.map((usage) => (
                  <tr key={`${usage.platform}-${usage.adName}`} className="border-t border-border">
                    <td className="px-4 py-3">{usage.platform}</td>
                    <td className="px-4 py-3">{usage.account}</td>
                    <td className="px-4 py-3">{usage.campaign}</td>
                    <td className="px-4 py-3 font-medium">{usage.adName}</td>
                    <td className="px-4 py-3">{usage.dateRange}</td>
                    <td className="px-4 py-3">
                      {usage.linkMethod === "automatic" ? "Automático" : "Manual"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Card className="mt-8 rounded-[16px] ring-border">
        <CardContent>
          <h2 className="text-lg text-brand">Calidad del dato</h2>
          <Separator className="my-3" />
          <dl className="grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-muted-foreground">Fuente</dt>
              <dd>Demostración. Conectores Meta y Google no configurados.</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Moneda</dt>
              <dd>EUR (conservada, sin conversión)</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Última sincronización</dt>
              <dd>Sin sincronizar</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Estado</dt>
              <dd className="mt-1">
                <StatusBadge asset={asset} />
                <p className="mt-2 text-sm">{explainStatus(asset).body}</p>
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
