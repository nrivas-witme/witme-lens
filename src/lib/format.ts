const euroFormatter = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
});

const numberFormatter = new Intl.NumberFormat("es-ES");

const decimalFormatter = new Intl.NumberFormat("es-ES", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat("es-ES", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Europe/Madrid",
});

export function formatEuro(amount: string | null): string {
  if (amount === null) return "Sin datos";
  return euroFormatter.format(Number(amount));
}

export function formatCount(value: number | null): string {
  if (value === null) return "Sin datos";
  return numberFormatter.format(value);
}

export function formatRatio(value: number | null): string {
  if (value === null) return "—";
  return decimalFormatter.format(value);
}

export function formatDate(iso: string): string {
  return dateFormatter.format(new Date(iso));
}

export function folderYear(iso: string): string {
  return new Intl.DateTimeFormat("es-ES", {
    year: "numeric",
    timeZone: "Europe/Madrid",
  }).format(new Date(iso));
}

export function folderMonth(iso: string): string {
  const name = new Intl.DateTimeFormat("es-ES", {
    month: "long",
    timeZone: "Europe/Madrid",
  }).format(new Date(iso));
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export function divideOrDash(numerator: number, denominator: number): number | null {
  if (denominator === 0) return null;
  return numerator / denominator;
}
