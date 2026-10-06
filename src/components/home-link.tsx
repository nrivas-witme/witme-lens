"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";
import { HOME_HREF, withBasePath } from "@/lib/paths";

type HomeLinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
  href?: typeof HOME_HREF;
};

/**
 * En export estático (GitHub Pages) usa recarga completa al ir a la biblioteca,
 * para evitar fallos intermitentes de navegación cliente desde rutas profundas.
 */
export function HomeLink({ href = HOME_HREF, onClick, prefetch = false, ...props }: HomeLinkProps) {
  const pathname = usePathname();
  const atHome = pathname === HOME_HREF || pathname === "";

  return (
    <Link
      href={href}
      prefetch={prefetch}
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented || atHome) return;
        const fromDeepRoute = pathname.startsWith("/creatividades");
        const useFullLoad =
          process.env.NEXT_PUBLIC_STATIC_EXPORT === "1" || fromDeepRoute;
        if (useFullLoad) {
          event.preventDefault();
          window.location.assign(withBasePath(HOME_HREF));
        }
      }}
    />
  );
}
