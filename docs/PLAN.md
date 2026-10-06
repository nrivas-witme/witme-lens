# Witme Lens — Plan de fases

Objetivo único: **subir imagen → ID y enlace únicos → tráfico usa el ID → análisis buscando el ID**.

Estado del repo (2026-10-06): vacío salvo `docs/SPEC.md` y este plan. Sin app Next.js todavía.

## Fase 0 — Diseño de interfaz (esta, tras confirmación)

Scaffold Next.js (App Router, TypeScript, Tailwind, shadcn/ui, versiones fijadas) en la raíz.

Sistema visual Witme: Lexend 400/500/600, tokens del SPEC (`#315270`, acento rosa `#C80F4B` / `#ED145A`), fondo `#F7F9FC`, tarjetas blancas.

Cuatro pantallas navegables, **datos demo etiquetados** (nunca como métricas reales):

| Ruta | Pantalla |
| --- | --- |
| `/acceso` | Logo/texto, «Entrar con Google» (sin OAuth real), mensaje de cuenta sin acceso |
| `/` | Biblioteca: búsqueda, filtros marca/país, cuadrícula, CTA «Subir imagen» |
| `/subir` | Dropzone, metadatos en lote, preview de ID/nombre, confirmación copiar ID/enlace |
| `/creatividades/CREA-000142` | Ficha: preview contain, análisis, dónde se usa, calidad del dato |

Escenario demo del SPEC: Meta 100 € + Google 50 €; tracking 240 € confirmados + 40 € pendientes; ROAS 1,60. Etiqueta visible de demostración.

**Fuera de esta fase:** base de datos, login real, storage, APIs, conectores.

**Aceptación:** recorrer el flujo en el prototipo. Tráfico confirma que la ficha le sirve.

## Fase 1 — Subida e ID único

- Supabase (PostgreSQL, Auth Google OAuth, storage privado, RLS).
- Dominio permitido validado en servidor; cuenta ajena → «Esta cuenta no tiene acceso».
- Subida real, SHA-256, miniaturas, `CREA-######` transaccional, nombre normalizado, URL fija, descarga firmada.
- Catálogos marca / país / producto / idioma / tamaño (Display y PMax).

**Pendiente externo:** proyecto Google Cloud (OAuth), dominio(s) Witme, proyecto Supabase, variables de entorno (nunca `NEXT_PUBLIC_*` para secretos).

## Fase 2 — Uso por tráfico

- Convención: ID en nombre del anuncio y parámetro `crea` en la URL.
- Detección automática al importar anuncios; vinculación manual; lista «Anuncios sin imagen».
- Carrusel/dinámico: resultado compartido, no duplicar gasto.

**Pendiente:** confirmar la convención con tráfico.

## Fase 3 — Análisis por ID

- Conectores solo lectura Meta Ads y Google Ads; sync horaria (90 + 30 días).
- Ingresos: `POST /api/v1/revenue-events` + CSV. Tracking Witme aún no definido.
- Métricas del SPEC (cero vs «Sin datos», umbral 100 € / 20 leads, EUR, Europe/Madrid).

**Pendiente externo:** cuentas Meta (`ads_read`), Google Ads, fuente real de ingresos, tipo de cambio documentado si hay otras monedas.

## Dependencias externas (no simuladas como conectadas)

| Pieza | Estado |
| --- | --- |
| Google OAuth + dominio permitido | Sin configurar |
| Supabase | Sin proyecto |
| Meta Ads / Google Ads | Sin credenciales |
| Tracking Witme (ingresos) | Fuente no definida |
| Logo oficial | No aportado; se usa texto «Witme Lens» |

## Fuera del MVP (no se construye)

Vídeos, versiones/familias, pantalla global de Resultados, TikTok, YouTube orgánico, roles avanzados, publicar anuncios, colecciones IA.

---

Tras tu confirmación de este plan, se implementa **solo la Fase 0**.
