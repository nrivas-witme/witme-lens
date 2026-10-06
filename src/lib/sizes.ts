export type SizeFamily = "display" | "pmax";

export type CatalogSize = {
  code: string;
  width: number;
  height: number;
  family: SizeFamily;
  familyName: "Display" | "PMax";
};

export const catalogSizes: readonly CatalogSize[] = [
  { code: "300x250", width: 300, height: 250, family: "display", familyName: "Display" },
  { code: "300x600", width: 300, height: 600, family: "display", familyName: "Display" },
  { code: "336x280", width: 336, height: 280, family: "display", familyName: "Display" },
  { code: "728x90", width: 728, height: 90, family: "display", familyName: "Display" },
  { code: "320x100", width: 320, height: 100, family: "display", familyName: "Display" },
  { code: "320x50", width: 320, height: 50, family: "display", familyName: "Display" },
  { code: "250x250", width: 250, height: 250, family: "display", familyName: "Display" },
  { code: "1200x1200", width: 1200, height: 1200, family: "pmax", familyName: "PMax" },
  { code: "960x1200", width: 960, height: 1200, family: "pmax", familyName: "PMax" },
  { code: "1200x628", width: 1200, height: 628, family: "pmax", familyName: "PMax" },
];

export const DEFAULT_SIZE_CODE = "1200x628";

export function getSize(code: string): CatalogSize {
  return (
    catalogSizes.find((size) => size.code === code) ??
    catalogSizes.find((size) => size.code === DEFAULT_SIZE_CODE)!
  );
}

export function matchSize(width: number, height: number): CatalogSize | undefined {
  return catalogSizes.find((size) => size.width === width && size.height === height);
}

export function formatSizeLabel(size: Pick<CatalogSize, "width" | "height">): string {
  return `${size.width}×${size.height}`;
}

export function formatSizeWithFamily(size: CatalogSize): string {
  return `${size.familyName} · ${formatSizeLabel(size)}`;
}

export const sizeGroups = [
  {
    family: "display" as const,
    label: "Display",
    sizes: catalogSizes.filter((size) => size.family === "display"),
  },
  {
    family: "pmax" as const,
    label: "PMax",
    sizes: catalogSizes.filter((size) => size.family === "pmax"),
  },
];
