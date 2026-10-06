import { cn } from "@/lib/utils";
import type { DemoAsset } from "@/lib/demo-data";

export function CreativePreview({
  asset,
  className,
  compact = false,
}: {
  asset: DemoAsset;
  className?: string;
  compact?: boolean;
}) {
  const alt = `${asset.code}: ${asset.title}`;

  if (asset.format === "VIDEO") {
    return (
      <video
        src={asset.previewSrc}
        aria-label={alt}
        width={asset.width}
        height={asset.height}
        className={cn("object-contain", className)}
        muted
        playsInline
        controls={!compact}
      />
    );
  }

  return (
    <img
      src={asset.previewSrc}
      alt={alt}
      width={asset.width}
      height={asset.height}
      className={cn("object-contain", className)}
    />
  );
}
