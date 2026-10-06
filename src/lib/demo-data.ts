import { WITME_LENS_CDN } from "@/lib/cdn-assets";
import { divideOrDash, formatCount, formatEuro } from "@/lib/format";

export const DEMO_NOTICE =
  "Datos de demostración. No proceden de Meta, Google ni del tracking de Witme.";

export const catalogs = {
  brands: [
    { code: "CREDITIO", name: "Creditio", logo: "/brands/creditio.png", onDark: false },
    { code: "MONEYA", name: "Moneya", logo: "/brands/moneya.png", onDark: false },
    { code: "INSTADINERO", name: "InstaDinero", logo: "/brands/instadinero.png", onDark: false },
    { code: "KREDITIO", name: "Kreditio", logo: "/brands/kreditio.png", onDark: false },
    { code: "SMARTRATA", name: "Smartrata", logo: "/brands/smartrata.png", onDark: false },
    { code: "CREDITO_DIRECTO", name: "Crédito Directo", logo: "/brands/credito-directo.png", onDark: true },
    { code: "DEUDIO", name: "Deudio", logo: "/brands/deudio.png", onDark: true },
    { code: "FINCHIARO", name: "Finchiaro", logo: "/brands/finchiaro.png", onDark: false },
  ],
  countries: [
    { code: "ES", name: "España" },
    { code: "CO", name: "Colombia" },
    { code: "MX", name: "México" },
    { code: "DE", name: "Alemania" },
    { code: "PL", name: "Polonia" },
    { code: "RO", name: "Rumanía" },
    { code: "IT", name: "Italia" },
    { code: "PT", name: "Portugal" },
  ],
  products: [
    { code: "TARJETA", name: "Tarjeta" },
    { code: "PRESTAMO", name: "Préstamo" },
  ],
  languages: [
    { code: "DE", name: "Alemán" },
    { code: "ES", name: "Español" },
    { code: "PL", name: "Polaco" },
    { code: "RO", name: "Rumano" },
    { code: "IT", name: "Italiano" },
    { code: "PT", name: "Portugués" },
  ],
  formats: [
    { code: "IMAGEN", name: "Crea" },
    { code: "VIDEO", name: "Vídeo" },
  ],
  themes: [
    { code: "GENERICA", name: "Genérica" },
    { code: "VIDEOS", name: "Vídeos" },
    { code: "HALLOWEEN", name: "Halloween" },
    { code: "COMERCIOS", name: "Comercios" },
  ],
} as const;

export type CatalogBrand = (typeof catalogs.brands)[number];

export function getBrand(code: string): CatalogBrand | undefined {
  return catalogs.brands.find((brand) => brand.code === code);
}

export type CatalogFormat = (typeof catalogs.formats)[number];

export function getFormat(code: string): CatalogFormat {
  return catalogs.formats.find((format) => format.code === code) ?? catalogs.formats[0];
}

export function getCountry(code: string) {
  return catalogs.countries.find((item) => item.code === code) ?? catalogs.countries[0];
}

export function getProduct(code: string) {
  return catalogs.products.find((item) => item.code === code) ?? catalogs.products[0];
}

export function getLanguage(code: string) {
  return catalogs.languages.find((item) => item.code === code) ?? catalogs.languages[0];
}

export type CatalogTheme = (typeof catalogs.themes)[number];

export function getTheme(code: string): CatalogTheme {
  return catalogs.themes.find((item) => item.code === code) ?? catalogs.themes[0];
}

export type AssetStatus = "ready" | "no_ads" | "insufficient";

export type DemoUsage = {
  platform: string;
  account: string;
  campaign: string;
  adName: string;
  dateRange: string;
  spend: string;
  linkMethod: "automatic" | "manual";
};

export type DemoAnalysis = {
  spend: string;
  clicks: number | null;
  validLeads: number | null;
  confirmedRevenue: string;
  pendingRevenue: string;
  currency: "EUR";
  coverageNote: string;
};

export type DemoAsset = {
  code: string;
  title: string;
  originalName: string;
  normalizedName: string;
  brand: string;
  brandName: string;
  country: string;
  countryName: string;
  product: string;
  productName: string;
  format: CatalogFormat["code"];
  formatName: CatalogFormat["name"];
  language: string;
  languageName: string;
  width: number;
  height: number;
  sizeCode: string;
  sizeLabel: string;
  sizeFamily: "display" | "pmax";
  sizeFamilyName: "Display" | "PMax";
  createdAt: string;
  author: string;
  previewSrc: string;
  folderId?: string;
  theme?: string;
  themeName?: string;
  status: AssetStatus;
  analysis: DemoAnalysis | null;
  usages: DemoUsage[];
};

export const NEXT_CREATIVE_NUMBER = 146;

export const demoAssets: DemoAsset[] = [
  {
    code: "CREA-000142",
    title: "Deine Einkäufe. Dein Tempo.",
    originalName: "DE_1200x1200_einkaeufe.jpg",
    normalizedName:
      "CREA-000142_CREDITIO_DE_TARJETA_IMAGEN_1200x1200_DE_V01.jpg",
    brand: "CREDITIO",
    brandName: "Creditio",
    country: "DE",
    countryName: "Alemania",
    product: "TARJETA",
    productName: "Tarjeta",
    format: "IMAGEN",
    formatName: "Crea",
    language: "DE",
    languageName: "Alemán",
    width: 1200,
    height: 1200,
    sizeCode: "1200x1200",
    sizeLabel: "1200×1200",
    sizeFamily: "pmax",
    sizeFamilyName: "PMax",
    createdAt: "2026-10-01T09:12:00+02:00",
    author: "Equipo diseño (demo)",
    previewSrc: WITME_LENS_CDN.de1200x1200_4,
    status: "ready",
    analysis: {
      spend: "150.00",
      clicks: 1842,
      validLeads: 32,
      confirmedRevenue: "240.00",
      pendingRevenue: "40.00",
      currency: "EUR",
      coverageNote:
        "Inversión e ingresos del escenario SPEC. Clics y leads son ilustrativos para el prototipo.",
    },
    usages: [
      {
        platform: "Meta Ads",
        account: "Creditio DE (demo · no conectado)",
        campaign: "DE | Karte | PMax",
        adName: "CREA-000142 | Creditio DE | Einkäufe Tempo",
        dateRange: "1–6 oct 2026",
        spend: "100.00",
        linkMethod: "automatic",
      },
      {
        platform: "Google Ads",
        account: "Creditio DE (demo · no conectado)",
        campaign: "PMax | Karte DE",
        adName: "CREA-000142 | Creditio DE | Einkäufe Tempo",
        dateRange: "1–6 oct 2026",
        spend: "50.00",
        linkMethod: "automatic",
      },
    ],
  },
  {
    code: "CREA-000143",
    title: "Eine Karte für deine Pläne.",
    originalName: "DE_1200x1200_karte_plaene.jpg",
    normalizedName:
      "CREA-000143_CREDITIO_DE_TARJETA_IMAGEN_1200x1200_DE_V01.jpg",
    brand: "CREDITIO",
    brandName: "Creditio",
    country: "DE",
    countryName: "Alemania",
    product: "TARJETA",
    productName: "Tarjeta",
    format: "IMAGEN",
    formatName: "Crea",
    language: "DE",
    languageName: "Alemán",
    width: 1200,
    height: 1200,
    sizeCode: "1200x1200",
    sizeLabel: "1200×1200",
    sizeFamily: "pmax",
    sizeFamilyName: "PMax",
    createdAt: "2026-10-03T11:40:00+02:00",
    author: "Equipo diseño (demo)",
    previewSrc: WITME_LENS_CDN.de1200x1200_9,
    status: "insufficient",
    analysis: {
      spend: "80.00",
      clicks: 410,
      validLeads: 11,
      confirmedRevenue: "0.00",
      pendingRevenue: "0.00",
      currency: "EUR",
      coverageNote: "Por debajo del umbral de 100 EUR y 20 leads.",
    },
    usages: [
      {
        platform: "Meta Ads",
        account: "Creditio DE (demo · no conectado)",
        campaign: "DE | Karte | Prospecting",
        adName: "CREA-000143 | Creditio DE | Karte Pläne",
        dateRange: "3–6 oct 2026",
        spend: "80.00",
        linkMethod: "automatic",
      },
    ],
  },
  {
    code: "CREA-000144",
    title: "¿Necesitas dinero?",
    originalName: "ES_300x250.png",
    normalizedName:
      "CREA-000144_MONEYA_ES_PRESTAMO_IMAGEN_300x250_ES_V01.png",
    brand: "MONEYA",
    brandName: "Moneya",
    country: "ES",
    countryName: "España",
    product: "PRESTAMO",
    productName: "Préstamo",
    format: "IMAGEN",
    formatName: "Crea",
    language: "ES",
    languageName: "Español",
    width: 300,
    height: 250,
    sizeCode: "300x250",
    sizeLabel: "300×250",
    sizeFamily: "display",
    sizeFamilyName: "Display",
    createdAt: "2026-10-05T16:05:00+02:00",
    author: "Equipo diseño (demo)",
    previewSrc: WITME_LENS_CDN.es300x250,
    status: "no_ads",
    analysis: null,
    usages: [],
  },
  {
    code: "CREA-000145",
    title: "Haz realidad tus planes.",
    originalName: "MX_960X1200.png",
    normalizedName:
      "CREA-000145_MONEYA_MX_PRESTAMO_IMAGEN_960x1200_ES_V01.png",
    brand: "MONEYA",
    brandName: "Moneya",
    country: "MX",
    countryName: "México",
    product: "PRESTAMO",
    productName: "Préstamo",
    format: "IMAGEN",
    formatName: "Crea",
    language: "ES",
    languageName: "Español",
    width: 960,
    height: 1200,
    sizeCode: "960x1200",
    sizeLabel: "960×1200",
    sizeFamily: "pmax",
    sizeFamilyName: "PMax",
    createdAt: "2026-10-06T10:57:00+02:00",
    author: "Equipo diseño (demo)",
    previewSrc: WITME_LENS_CDN.mx960x1200,
    status: "no_ads",
    analysis: null,
    usages: [],
  },
];

export const SPEND_THRESHOLD = 100;
export const LEADS_THRESHOLD = 20;

export function getAssetByCode(code: string): DemoAsset | undefined {
  return demoAssets.find((asset) => asset.code.toUpperCase() === code.toUpperCase());
}

export function assetHref(code: string): string {
  return `/creatividades/${code}`;
}

export function derivedMetrics(analysis: DemoAnalysis | null) {
  if (!analysis) {
    return {
      cpl: null as number | null,
      roas: null as number | null,
      result: null as number | null,
      sufficient: false,
    };
  }

  const spend = Number(analysis.spend);
  const revenue = Number(analysis.confirmedRevenue);
  const leads = analysis.validLeads;
  const cpl = leads === null ? null : divideOrDash(spend, leads);
  const roas = divideOrDash(revenue, spend);
  const result = revenue - spend;
  const sufficient =
    spend >= SPEND_THRESHOLD && (leads ?? 0) >= LEADS_THRESHOLD;

  return { cpl, roas, result, sufficient };
}

export const statusCopy: Record<AssetStatus, { label: string; description: string }> = {
  ready: {
    label: "Lista para compartir",
    description: "ID y enlace listos. Los resultados son de demostración.",
  },
  no_ads: {
    label: "Sin anuncios todavía",
    description: "Nadie ha usado este ID en un anuncio (dato demo).",
  },
  insufficient: {
    label: "Datos insuficientes",
    description: "Por debajo de 100 EUR de gasto y 20 leads válidos.",
  },
};

export type StatusFigure = { label: string; value: string };

export type StatusExplanation = {
  title: string;
  body: string;
  figures: StatusFigure[];
};

export function explainStatus(asset: DemoAsset): StatusExplanation {
  const analysis = asset.analysis;

  if (asset.status === "no_ads" || !analysis) {
    return {
      title: "Sin anuncios todavía",
      body: "Este ID aún no está en ningún anuncio, así que no hay inversión, clics, leads ni ingresos que mostrar. Cuando tráfico lo use en el nombre del anuncio o en el parámetro crea, aquí aparecerán los datos.",
      figures: [],
    };
  }

  const figures: StatusFigure[] = [
    { label: "Inversión", value: formatEuro(analysis.spend) },
    { label: "Clics", value: formatCount(analysis.clicks) },
    { label: "Leads válidos", value: formatCount(analysis.validLeads) },
    { label: "Ingresos confirmados", value: formatEuro(analysis.confirmedRevenue) },
    { label: "Ingresos pendientes", value: formatEuro(analysis.pendingRevenue) },
  ];

  if (asset.status === "insufficient") {
    return {
      title: "Hay datos, pero no bastan para valorar",
      body: `Ya hay anuncios vinculados. Para valorar una crea hacen falta al menos ${SPEND_THRESHOLD} € de inversión y ${LEADS_THRESHOLD} leads válidos. Estos números son de demostración.`,
      figures: [
        {
          label: "Inversión",
          value: `${formatEuro(analysis.spend)} / ${SPEND_THRESHOLD} €`,
        },
        { label: "Clics", value: formatCount(analysis.clicks) },
        {
          label: "Leads válidos",
          value: `${formatCount(analysis.validLeads)} / ${LEADS_THRESHOLD}`,
        },
        { label: "Ingresos confirmados", value: formatEuro(analysis.confirmedRevenue) },
        { label: "Ingresos pendientes", value: formatEuro(analysis.pendingRevenue) },
      ],
    };
  }

  return {
    title: "Datos suficientes para valorar",
    body: `Supera el umbral de ${SPEND_THRESHOLD} € de inversión y ${LEADS_THRESHOLD} leads válidos. Los resultados son de demostración, no salen de Meta ni de Google.`,
    figures,
  };
}
