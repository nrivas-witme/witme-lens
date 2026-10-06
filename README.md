# Witme Lens

Aplicación interna para un único flujo: **subir una imagen → ID y enlace únicos → tráfico la usa en anuncios → análisis buscando el ID**.

Fase actual: **0 — diseño de interfaz**. Prototipo navegable con datos de demostración. Sin base de datos, login real ni conectores.

Especificación: [`docs/SPEC.md`](docs/SPEC.md). Plan: [`docs/PLAN.md`](docs/PLAN.md).

## Arranque en local

Requisitos: Node.js 20 o superior, npm.

```bash
npm install
npm run dev
```

Abre [http://localhost:3000/acceso](http://localhost:3000/acceso).

| Ruta | Pantalla |
| --- | --- |
| `/acceso` | Entrar con Google (simulado) y estado «cuenta sin acceso» |
| `/` | Biblioteca |
| `/subir` | Subir imagen (simulado en el navegador) |
| `/creatividades/CREA-000142` | Ficha del escenario demo del SPEC |

«Entrar con Google» lleva a la biblioteca. No hay OAuth. Para ver el rechazo: `/acceso?estado=sin-acceso`.

## Qué es demo (etiquetado en la UI)

- Cuatro creatividades de ejemplo. **CREA-000142** usa el escenario del SPEC: Meta 100 € + Google Ads 50 €; tracking 240 € confirmados y 40 € pendientes; ROAS 1,60; resultado 90 €.
- Clics y leads de las fichas son ilustrativos para maquetar, no salen de ninguna plataforma.
- La subida no guarda archivos ni reserva un ID real.

## Stack (versiones fijadas en lockfile)

Next.js (App Router) · TypeScript · Tailwind CSS · shadcn/ui · fuente Lexend.

## Pendiente para la Fase 1

- Proyecto Supabase (PostgreSQL, Auth, Storage privado, RLS).
- Login real con Google (proveedor OAuth de Supabase) y validación del dominio en servidor.
- Confirmar dominio(s) permitidos de Witme.
- Credenciales OAuth en Google Cloud Console y URLs de redirección por entorno.
- Subida real, SHA-256, miniaturas, `CREA-######` transaccional, nombre normalizado, descarga firmada.
- Logo oficial si se aporta (ahora se usa el texto «Witme Lens»).

No hay integraciones conectadas. Meta Ads, Google Ads y la fuente de ingresos de Witme quedan para fases posteriores.
