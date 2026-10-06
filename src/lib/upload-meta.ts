import { catalogs, getTheme } from "@/lib/demo-data";
import { folderMonth, folderYear } from "@/lib/format";
import { FOLDER_MONTHS } from "@/lib/folders";

const COUNTRY_CODES = new Set<string>(catalogs.countries.map((item) => item.code));
const BRAND_CODES = catalogs.brands.map((item) => item.code);

const LANGUAGE_BY_COUNTRY: Record<string, string> = {
  ES: "ES",
  CO: "ES",
  MX: "ES",
  DE: "DE",
  PL: "PL",
  RO: "RO",
  IT: "IT",
  PT: "PT",
};

export const UPLOAD_THEME_CUSTOM = "CUSTOM";

export function currentUploadCalendar(): { folderYear: string; folderMonth: string } {
  const iso = new Date().toISOString();
  return { folderYear: folderYear(iso), folderMonth: folderMonth(iso) };
}

export function languageForCountry(countryCode: string): string {
  return LANGUAGE_BY_COUNTRY[countryCode] ?? "ES";
}

export function resolveThemeFolderName(theme: string, themeCustom: string): string {
  if (theme === UPLOAD_THEME_CUSTOM) {
    const trimmed = themeCustom.trim();
    return trimmed.length > 0 ? trimmed : getTheme("GENERICA").name;
  }
  return getTheme(theme).name;
}

export function guessUploadFromFilename(filename: string): {
  brand?: string;
  country?: string;
  language?: string;
} {
  const base = filename.replace(/\.[^.]+$/, "");
  const upper = base.toUpperCase();
  const tokens = upper.split(/[^A-Z0-9]+/).filter(Boolean);

  let country: string | undefined;
  for (const token of tokens) {
    if (COUNTRY_CODES.has(token)) {
      country = token;
      break;
    }
  }
  if (!country) {
    const inline = upper.match(
      /(?:^|[_\s-])(ES|CO|MX|DE|PL|RO|IT|PT)(?:[_\s-]|\d|$)/,
    );
    if (inline) country = inline[1];
  }

  let brand: string | undefined;
  for (const code of BRAND_CODES) {
    if (upper.includes(code)) {
      brand = code;
      break;
    }
  }

  const resolvedCountry = country ?? "ES";
  return {
    brand,
    country,
    language: country ? languageForCountry(resolvedCountry) : undefined,
  };
}

export function uploadYearOptions(): string[] {
  const current = Number(folderYear(new Date().toISOString()));
  return Array.from({ length: 5 }, (_, index) => String(current - 2 + index));
}

export { FOLDER_MONTHS as uploadMonthOptions };
