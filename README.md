# Witme Lens

Aplicación interna para un único flujo: **subir una imagen → ID y enlace únicos → tráfico la usa en anuncios → análisis buscando el ID**.

Fase actual: **0 — diseño de interfaz**. Prototipo navegable con datos de demostración. Sin base de datos en servidor, login real ni conectores.

Especificación: [`docs/SPEC.md`](docs/SPEC.md). Plan: [`docs/PLAN.md`](docs/PLAN.md).

## Arranque en local

Requisitos: Node.js 20 o superior, npm.

```bash
npm install
npm run dev
```

En **PowerShell**, si `npm run dev` falla por la política de ejecución de scripts, usa:

```bat
npm.cmd run dev
```

Abre [http://localhost:3000/acceso](http://localhost:3000/acceso) o directamente la [biblioteca](http://localhost:3000/).

| Ruta | Pantalla |
| --- | --- |
| `/acceso` | Entrar con Google (simulado) y estado «cuenta sin acceso» |
| `/` | Biblioteca (explorador de carpetas + buscador) |
| `/subir` | Subir imagen o vídeo (guardado en este navegador) |
| `/creatividades/CREA-000142` | Ficha del escenario demo del SPEC |

«Entrar con Google» lleva a la biblioteca. No hay OAuth. Para ver el rechazo: `/acceso?estado=sin-acceso`.

## Biblioteca (recorrido Fase 0)

Organización tipo Drive: **Marca → Año → Mes → País (ES, CO, MX…) → Temática**. Puedes crear carpetas, borrarlas (con confirmación) y subir desde la carpeta abierta. El buscador encuentra creatividades en cualquier nivel. En la raíz aparece **Últimas añadidas** en formato compacto.

Las creatividades demo se colocan automáticamente en la ruta que corresponde a su marca, fecha, país y temática.

## Qué es demo (etiquetado en la UI)

- Cuatro creatividades de ejemplo. **CREA-000142** usa el escenario del SPEC: Meta 100 € + Google Ads 50 €; tracking 240 € confirmados y 40 € pendientes; ROAS 1,60; resultado 90 €.
- Clics y leads de las fichas son ilustrativos para maquetar, no salen de ninguna plataforma.
- **Subida y biblioteca en Fase 0:** los archivos y carpetas se guardan en **IndexedDB de este navegador** (no se sincronizan ni sustituyen un ID de servidor). Borrar datos del sitio en el navegador elimina las subidas locales.

## Stack (versiones fijadas en lockfile)

Next.js (App Router) · TypeScript · Tailwind CSS · shadcn/ui · fuente Lexend · logo Witme Lens en cabecera y favicon.

## Desarrollo

La biblioteca depende del almacenamiento del navegador y no se renderiza en el servidor, para evitar avisos de hidratación en modo desarrollo. El aviso «Issue» de Next.js en local debería ser mucho menos frecuente; si persiste, prueba recarga forzada o ventana de incógnito (extensiones del navegador también pueden provocarlo).

## Pendiente para la Fase 1

- Proyecto Supabase (PostgreSQL, Auth, Storage privado, RLS).
- Login real con Google (proveedor OAuth de Supabase) y validación del dominio en servidor.
- Confirmar dominio(s) permitidos de Witme.
- Credenciales OAuth en Google Cloud Console y URLs de redirección por entorno.
- Subida real, SHA-256, miniaturas, `CREA-######` transaccional, nombre normalizado, descarga firmada y biblioteca compartida en servidor.

No hay integraciones conectadas. Meta Ads, Google Ads y la fuente de ingresos de Witme quedan para fases posteriores.
