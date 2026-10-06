import { getBrand } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

export function BrandLogo({
  code,
  className,
}: {
  code: string;
  className?: string;
}) {
  const brand = getBrand(code);
  if (!brand) return null;

  return (
    <span
      className={cn(
        "inline-flex h-8 items-center justify-center rounded-[8px] px-1.5",
        brand.onDark ? "bg-[#172B3A]" : "bg-transparent",
        className,
      )}
    >
      <img
        src={brand.logo}
        alt=""
        className="h-6 w-auto max-w-[140px] object-contain"
      />
    </span>
  );
}
