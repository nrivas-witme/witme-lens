export function formatCreativeCode(n: number): string {
  return `CREA-${String(n).padStart(6, "0")}`;
}

export function parseCreativeNumber(code: string): number | null {
  const match = /^CREA-(\d{6})$/i.exec(code.trim());
  return match ? Number(match[1]) : null;
}

export function fileExtension(filename: string): string {
  const parts = filename.split(".");
  const ext = parts.length > 1 ? parts.pop() : "png";
  return (ext ?? "png").toLowerCase();
}

export function buildNormalizedName(input: {
  code: string;
  brand: string;
  country: string;
  product: string;
  format: string;
  width: number;
  height: number;
  language: string;
  extension: string;
}): string {
  const ext = input.extension.toLowerCase();
  const format = input.format === "VIDEO" ? "VIDEO" : "IMAGEN";
  return `${input.code}_${input.brand}_${input.country}_${input.product}_${format}_${input.width}x${input.height}_${input.language}_V01.${ext}`;
}
