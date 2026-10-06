import { WITME_LENS_CDN } from "@/lib/cdn-assets";
import { cn } from "@/lib/utils";

export function Wordmark({ className }: { className?: string }) {
  return (
    <img
      src={WITME_LENS_CDN.logoBlack}
      alt="Witme Lens"
      width={813}
      height={123}
      className={cn("h-8 w-auto max-w-[220px] object-contain object-left", className)}
    />
  );
}
