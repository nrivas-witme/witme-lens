/** Prefijo público (p. ej. /witme-lens en GitHub Pages). Vacío en local. */
export const APP_BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function withBasePath(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (!APP_BASE_PATH) return normalized;
  if (normalized === "/") return `${APP_BASE_PATH}/`;
  return `${APP_BASE_PATH}${normalized}`;
}

export const HOME_HREF = "/" as const;
