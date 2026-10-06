"use client";

import { Popover as PopoverPrimitive } from "radix-ui";
import { Badge } from "@/components/ui/badge";
import {
  explainStatus,
  statusCopy,
  type DemoAsset,
} from "@/lib/demo-data";

const styles: Record<DemoAsset["status"], string> = {
  ready: "border-transparent bg-[color-mix(in_srgb,var(--success)_12%,white)] text-success",
  no_ads: "border-transparent bg-muted text-muted-foreground",
  insufficient:
    "border-transparent bg-[color-mix(in_srgb,var(--warning)_14%,white)] text-warning",
};

export function StatusBadge({ asset }: { asset: DemoAsset }) {
  const explanation = explainStatus(asset);
  const label = statusCopy[asset.status].label;

  return (
    <PopoverPrimitive.Root>
      <PopoverPrimitive.Trigger asChild>
        <button
          type="button"
          className="cursor-pointer rounded-4xl"
          aria-label={`${label}. Pulsa para ver el detalle.`}
        >
          <Badge className={`${styles[asset.status]} underline decoration-dotted decoration-current underline-offset-2`}>
            {label}
          </Badge>
        </button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          side="bottom"
          align="end"
          sideOffset={8}
          className="z-50 w-[280px] rounded-[10px] bg-white p-3 text-left text-[13px] text-foreground shadow-[0_8px_24px_rgba(49,82,112,0.12)] ring-1 ring-border outline-none"
        >
          <p className="font-medium text-brand">{explanation.title}</p>
          <p className="mt-1 leading-snug text-muted-foreground">{explanation.body}</p>
          {explanation.figures.length > 0 ? (
            <dl className="mt-2 grid gap-1 border-t border-border pt-2">
              {explanation.figures.map((figure) => (
                <div key={figure.label} className="flex items-baseline justify-between gap-3">
                  <dt className="text-muted-foreground">{figure.label}</dt>
                  <dd className="font-medium text-brand">{figure.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
