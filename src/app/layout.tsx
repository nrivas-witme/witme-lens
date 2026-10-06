import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import { Providers } from "@/components/providers";
import { WITME_LENS_CDN } from "@/lib/cdn-assets";
import "./globals.css";

const lexend = Lexend({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-lexend",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Witme Lens",
    template: "%s · Witme Lens",
  },
  description:
    "Sube una imagen, comparte su ID y consulta el análisis de los anuncios que la usan.",
  icons: {
    icon: WITME_LENS_CDN.favicon,
    apple: WITME_LENS_CDN.favicon,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${lexend.variable} h-full`}>
      <body
        className="min-h-full bg-background font-sans text-foreground"
        suppressHydrationWarning
      >
        <Providers>
          <a
            href="#contenido"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-[10px] focus:bg-white focus:px-3 focus:py-2"
          >
            Saltar al contenido
          </a>
          {children}
        </Providers>
      </body>
    </html>
  );
}
