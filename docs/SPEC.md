# Witme Lens — Especificación para desarrollar en Cursor

Versión: 2.3 (biblioteca por carpetas) · Repositorio: `witme-lens` · Fecha: 6 de octubre de 2026 · Idioma de la interfaz: español.

## 1. Instrucción principal para Cursor

Actúa como un equipo de producto, diseño y desarrollo. Construye una aplicación web interna llamada **Witme Lens** (repositorio `witme-lens`; antes «Witme Creative Hub»). Su alcance se limita a un único flujo:

> **Subo una imagen → recibe un ID y un enlace únicos → tráfico la usa en sus anuncios con ese ID → en la plataforma veo el análisis de esa imagen buscando su ID.**

Todo lo que no sirva a este flujo queda fuera del MVP (ver apartado 12).

Antes de modificar código, inspecciona el repositorio y respeta sus instrucciones. Si está vacío, usa la arquitectura propuesta. Trabaja por fases con incrementos ejecutables. **Empieza por el diseño de la interfaz**: construye primero las tres pantallas con datos de demostración y, cuando estén validadas, conecta la lógica real.

Las integraciones reales requieren cuentas y credenciales que no están en este documento. Construye los conectores y su configuración, y usa datos de demostración claramente etiquetados mientras no estén disponibles. No simules una conexión exitosa ni presentes métricas ficticias como reales. No publiques anuncios ni modifiques presupuestos.

## 2. El flujo en cuatro pasos

| Paso | Quién | Qué ocurre |
| --- | --- | --- |
| 1. Subir | Diseño | Sube una imagen e indica marca, país, producto e idioma. |
| 2. Identificar | Sistema | Genera un ID único (`CREA-000142`), un nombre normalizado y un enlace fijo a su ficha. |
| 3. Usar | Tráfico | Copia el ID o el enlace, descarga la imagen y crea el anuncio incluyendo el ID (ver apartado 5). |
| 4. Analizar | Cualquiera del equipo | Busca el ID y ve en la ficha: anuncios donde se usa, inversión, clics, leads, ingresos y ROAS. |

### Criterios de éxito

- Subir una imagen sin inventar su nombre técnico.
- Compartir con tráfico un ID o enlace que identifique la imagen sin ambigüedad.
- Encontrar cualquier imagen por su ID.
- Ver en su ficha los resultados de los anuncios que la usan, sin duplicar gasto ni ingresos.
- Distinguir resultados confirmados, pendientes y sin datos.

## 3. Pantallas (diseñar primero)

Solo tres pantallas y una navegación mínima. No añadir módulos vacíos.

Antes de ellas, una **pantalla de acceso** mínima: logo o texto «Witme Lens», botón «Entrar con Google» y mensaje claro si la cuenta no tiene acceso.

### A. Subir imagen

1. Arrastrar o seleccionar una o varias imágenes o vídeos (formatos y tamaños del catálogo).
2. Elegir marca, país, producto, idioma, **temática** y tamaño (aplicables en lote, corregibles por archivo). El tamaño sale del catálogo Display / PMax.
3. Mostrar el ID y el nombre que se generarán, sin pedir que el usuario los escriba.
4. Progreso de subida, reintento y cancelación.
5. Confirmación «Lista para compartir» con botones **Copiar ID** y **Copiar enlace**, y volver a la biblioteca.
6. **Ubicación:** si se abrió la subida desde una carpeta (`?carpeta=`), la creatividad se guarda ahí; si no, el sistema crea la ruta **marca → año → mes → país (código ISO) → temática**.

### B. Biblioteca (pantalla inicial)

Explorador tipo Drive (como la organización en Google Drive), no una cuadrícula plana con filtros.

- Título «Biblioteca», botón principal **Subir imagen** y acción secundaria **Nueva carpeta**.
- **Ruta de carpetas** (breadcrumb) y navegación por niveles.
- **Jerarquía por defecto:** `Marca` → `Año` (p. ej. 2026) → `Mes` → `País` (códigos **ES, CO, MX, DE, PL, RO, IT, PT**, no el nombre completo) → `Temática`.
- **Temáticas** de catálogo: Genérica, Vídeos, Halloween, Comercios; también carpetas con nombre libre creadas por el usuario.
- En la **raíz:** carpetas de marca (precreadas en el prototipo con año 2026 y los doce meses) y bloque compacto **Últimas añadidas** (miniatura + ID).
- **Dentro de una carpeta:** subcarpetas y, en el último nivel útil, tarjetas de creatividad (miniatura, ID copiable, marca/país, tamaño Display o PMax, fecha, estado).
- **Buscador** «Busca por ID o nombre»: al escribir, resultados en **todas** las carpetas (sin depender de la ruta actual).
- En **Fase 0** la biblioteca y las subidas pueden persistir solo en el navegador (IndexedDB), claramente etiquetado; en **Fase 1** pasa a servidor y workspace compartido.

### C. Ficha de la imagen

URL fija: `/creatividades/CREA-000142` (requiere iniciar sesión con Google).

- **Encabezado:** ID, título, estado y acciones visibles: Copiar ID · Copiar enlace · Copiar nombre · Descargar.
- **Vista previa** de la imagen completa (`object-fit: contain`, sin recortar textos ni disclaimers).
- **Análisis:** selector de periodo; inversión, clics, leads válidos, ingresos confirmados, CPL, ROAS y resultado (ingresos − inversión). Ingresos pendientes mostrados aparte.
- **Dónde se usa:** plataforma, cuenta, campaña, anuncio y fechas.
- **Calidad del dato:** fuente, moneda, última sincronización y estados como «Sin anuncios todavía», «Datos insuficientes» o «Actualizado hace 12 min».

## 4. Identidad del archivo

- **ID visible:** `CREA-` + número correlativo de 6 dígitos, generado en servidor de forma transaccional y segura ante subidas simultáneas. Internamente, UUID como clave.
- **Nombre normalizado:**

```text
{CODIGO}_{MARCA}_{PAIS}_{PRODUCTO}_IMAGEN_{ANCHOxALTO}_{IDIOMA}_V01.{ext}

CREA-000143_MONEYA_RO_PRESTAMO_IMAGEN_1200x628_RO_V01.png
```

- Tokens en mayúsculas, sin tildes ni espacios; extensión en minúscula. País en ISO 3166-1 alfa-2.
- Marca, producto, idioma y tamaño salen de catálogos editables.
- **Tamaños de imagen (catálogo Witme):**
  - Display: `300×250`, `300×600`, `336×280`, `728×90`, `320×100`, `320×50`, `250×250`
  - PMax: `1200×1200`, `960×1200`, `1200×628`
- El token `{ANCHOxALTO}` del nombre es el del catálogo (p. ej. `1200x628`). Si los píxeles del archivo no coinciden, avisar y no inventar un tamaño.
- No incluir la plataforma en el nombre: una imagen puede usarse en varias.
- Guardar nombre original y nombre normalizado. El ID y el nombre no cambian una vez creados.
- Una imagen distinta (aunque sea una variante) recibe un ID nuevo. No reemplazar el archivo de un ID existente.
- Calcular SHA-256 para avisar de duplicados exactos y ofrecer reutilizar el existente.
- La descarga entrega el original con su nombre normalizado mediante una URL firmada temporal; el enlace que se comparte es siempre el de la ficha.

## 5. Cómo usa tráfico el ID (pieza clave)

El análisis solo es posible si el ID viaja con el anuncio. Convención inicial, a confirmar con tráfico:

1. **Nombre del anuncio:** debe contener el ID. Ejemplo: `CREA-000142 | Moneya RO | Chico en casa`.
2. **URL de destino:** añadir el parámetro `crea` conservando los existentes. Ejemplo: `https://landing.ejemplo/?utm_source=meta&crea=CREA-000142`.

Reglas de vinculación, por orden de prioridad:

1. ID exacto detectado en el nombre del anuncio o en el parámetro `crea`, validado contra la biblioteca → vínculo automático.
2. Vinculación manual desde la ficha o desde una lista de «Anuncios sin imagen vinculada».
3. Nunca vincular por parecido visual ni por nombre aproximado sin confirmación.

Si un anuncio contiene varias imágenes (carrusel, dinámico), mostrar «Resultado compartido del anuncio» y no asignar todo el gasto a cada imagen.

El parámetro `crea` debe propagarse por el funnel hasta el evento de lead o ingreso del tracking de Witme. No incluir nombres, emails ni teléfonos en parámetros.

## 6. Datos de anuncios e ingresos

### Meta Ads (Facebook + Instagram)

Un único conector, solo lectura. Importar cuentas, campañas, anuncios (con su nombre y URL de destino) y métricas diarias: inversión, impresiones y clics. Requiere permiso `ads_read` y los que pida la consulta de creatividades. No contar Facebook e Instagram como fuentes adicionales al total de Meta.

### Google Ads (incluye YouTube)

Solo lectura. Importar campañas, anuncios, URL final y métricas diarias. Conservar `youtube_video_id` cuando exista.

### Ingresos y leads (tracking de Witme)

La fuente de verdad aún no está definida. Crear:

- `POST /api/v1/revenue-events`: endpoint autenticado e idempotente.
- Importación por CSV con previsualización, errores por fila y confirmación.

Ejemplo de evento:

```json
{
  "external_event_id": "revenue-987654",
  "source": "witme_tracking",
  "creative_code": "CREA-000142",
  "click_id": "opaque-click-ref",
  "lead_id": "opaque-lead-ref",
  "occurred_at": "2026-10-05T12:30:00Z",
  "status": "confirmed",
  "amount": "18.50",
  "currency": "EUR"
}
```

- Estados: `confirmed`, `pending`, `rejected`, `refunded`. Solo `confirmed` cuenta como ingreso; `pending` se muestra aparte.
- Repetir el mismo `external_event_id` no duplica el ingreso.
- El workspace se toma de la autenticación, no del payload.

### Sincronización

Cada hora, carga inicial de 90 días y reconsulta de los últimos 30. Reintentos con backoff; un fallo no sustituye datos válidos por ceros. Mostrar la última sincronización real y avisos claros («Sin permisos», «Credenciales caducadas», «Sin sincronizar»).

## 7. Métricas

| Métrica | Cálculo |
| --- | --- |
| CTR | Clics / impresiones × 100 |
| CPC | Inversión / clics |
| CPL | Inversión / leads válidos (del tracking, deduplicados) |
| ROAS | Ingresos confirmados / inversión |
| Resultado | Ingresos confirmados − inversión |

Reglas obligatorias:

- División por cero → «—», nunca infinito.
- Sin datos → «Sin datos», distinto de un cero real.
- Ratios agregados desde sumas, no medias de ratios.
- Una imagen usada en varios anuncios suma cada anuncio una sola vez.
- No sumar leads de Meta, Google y tracking como si fueran independientes: el tracking es la referencia.
- Importes en decimal (no floats). Moneda original conservada; consolidar en EUR solo con tipo de cambio documentado.
- Zona de presentación Europe/Madrid, conservando la zona de cada cuenta.
- Umbral provisional para valorar una imagen: 100 EUR de gasto y 20 leads válidos; por debajo, «Datos insuficientes».

## 8. Diseño visual

Referencia: https://witme.es/

```css
:root {
  --brand-blue: #315270;
  --brand-pink: #ED145A;
  --brand-blue-soft: #587C9D;
  --brand-tint: #E3ECF4;
  --app-bg: #F7F9FC;
  --surface: #FFFFFF;
  --text: #172B3A;
  --text-muted: #5D6B79;
  --border: #E2E8EF;
  --action: #C80F4B;
  --success: #167A52;
  --warning: #8A5A00;
  --danger: #B42318;
  --radius-card: 16px;
  --radius-control: 10px;
}
```

- Lexend (400/500/600) en toda la interfaz; cuerpo 14–16 px, títulos 24–32 px, métricas 28–36 px.
- Fondo claro, tarjetas blancas, sombras discretas, espaciado en múltiplos de 4/8 px.
- Rosa `--action` para la acción principal (una por pantalla); verificar contraste.
- Usar el logo oficial si se aporta; si no, el texto «Witme Lens».
- Navegación por teclado, foco visible, estados con texto además de color.
- Escritorio prioritario; subir y consultar deben funcionar en móvil.

## 9. Arquitectura propuesta

- TypeScript, Next.js + React, Tailwind CSS y shadcn/ui.
- Supabase: PostgreSQL, autenticación y almacenamiento privado con RLS.
- **Login con la cuenta de Google** (proveedor Google OAuth de Supabase Auth): botón único «Entrar con Google», sin contraseñas propias.
  - Acceso limitado a las cuentas de Google de Witme: dominio permitido configurable (por defecto el dominio de la empresa) validado en servidor, no solo en el cliente.
  - El primer acceso de una cuenta permitida crea su usuario en el workspace; un administrador puede retirar el acceso.
  - Cuentas fuera del dominio: pantalla «Esta cuenta no tiene acceso» sin revelar datos.
  - Credenciales OAuth (client ID y secret) solo en variables de entorno del servidor; documentar en el README cómo crearlas en Google Cloud Console y las URL de redirección de cada entorno.
- Worker Node.js para miniaturas y sincronizaciones; cola en PostgreSQL.
- Zod para validar entradas.
- Fijar versiones y lockfile. Claves de servicio solo en servidor (nunca en `NEXT_PUBLIC_*`); tokens OAuth cifrados.

### Modelo de datos mínimo

| Entidad | Contenido |
| --- | --- |
| workspaces / memberships | Espacio del equipo y usuarios |
| brands / products / languages | Catálogos editables |
| assets | UUID, código CREA, título, nombre original y normalizado, storage key, SHA-256, MIME, dimensiones, marca, país, producto, idioma, autor, estado |
| connections / ad_accounts | Meta o Google, cuentas, moneda, zona horaria, estado |
| external_ads | ID externo, nombre, URL de destino, campaña, cuenta |
| ad_asset_links | Imagen, anuncio, fechas, método (automático/manual), quién confirma |
| ad_daily_facts | Anuncio, fecha, moneda, inversión, impresiones, clics |
| revenue_events | Fuente, ID externo, código CREA, click/lead opacos, estado, importe, moneda, fecha |
| sync_runs | Periodo, progreso, error, último éxito |

Unicidad del evento por `(workspace, source, external_event_id)` y del dato diario por `(cuenta, anuncio, fecha)`.

### API mínima

| Ruta | Propósito |
| --- | --- |
| `POST /api/v1/uploads/init` · `POST /api/v1/uploads/:id/complete` | Subida directa a storage y confirmación |
| `GET /api/v1/assets` | Biblioteca: búsqueda, carpeta actual y listado jerárquico |
| `GET /api/v1/assets/:code` | Ficha de la imagen |
| `GET /api/v1/assets/:code/download` | Descarga temporal con nombre normalizado |
| `GET /api/v1/assets/:code/metrics` | Análisis por ID con periodo, moneda y cobertura |
| `POST /api/v1/ad-links` · `GET /api/v1/unmatched-ads` | Vinculación manual y anuncios sin imagen |
| `POST /api/v1/revenue-events` · `POST /api/v1/imports/preview` · `POST /api/v1/imports/:id/commit` | Ingresos por API y CSV |
| `POST /api/v1/connections/:id/sync` | Lanzar sincronización |

## 10. Fases y aceptación

### Fase 0 — Diseño de interfaz

Sistema visual, la pantalla de acceso con Google y las pantallas (Acceso, Subir, Biblioteca por carpetas, Ficha) navegables con datos demo etiquetados. Revisión con tráfico antes de seguir.

**Aceptación:** el flujo completo se puede recorrer en el prototipo y tráfico confirma que la ficha le da lo que necesita.

### Fase 1 — Subida e ID único

Login con Google, subida real, miniaturas, generación de ID y nombre, ficha con enlace fijo y descarga.

**Aceptación:** dos usuarios del equipo entran con su cuenta de Google, suben y consultan la misma biblioteca; una cuenta de Google fuera del dominio permitido no accede. Subidas simultáneas no repiten ID. La descarga conserva el nombre normalizado. Un reinicio no borra nada.

### Fase 2 — Uso por tráfico

Convención del apartado 5, detección automática del ID en anuncios importados, vinculación manual y lista de anuncios sin imagen.

**Aceptación:** un anuncio con `CREA-000142` en su nombre o en `crea=` queda vinculado automáticamente; uno sin ID aparece como pendiente.

### Fase 3 — Análisis por ID

Conectores Meta y Google, ingesta de ingresos (API + CSV) y panel de análisis en la ficha.

**Aceptación:** contrastar un periodo pequeño con los informes de cada plataforma (misma zona y moneda). Repetir una sincronización o un evento no duplica valores.

### Escenario de prueba (datos demo)

- `CREA-000142` se usa en un anuncio de Meta (100 EUR) y otro de Google Ads (50 EUR).
- Tracking: 240 EUR confirmados y 40 EUR pendientes.
- Resultado esperado: inversión 150 EUR, ingresos 240 EUR, resultado 90 EUR, ROAS 1,60; los 40 EUR pendientes aparecen aparte.
- Reimportar los mismos eventos no cambia los totales.

## 11. Entregables

- Aplicación funcional organizada por módulos.
- Migraciones, políticas de acceso y datos demo separados.
- `.env.example` sin secretos y README con comandos reproducibles.
- Guía corta para tráfico con la convención del ID.
- Instrucciones para conectar las cuentas de Meta y Google.
- Pruebas de: login con Google y dominio permitido, aislamiento del workspace, unicidad del ID, vinculación por ID, no duplicación y fórmulas con cero y sin datos.
- Lista breve de qué funciona, qué se validó con datos reales y qué falta configurar.

## 12. Fuera del MVP

Vídeos · versiones y familias de creatividades · pantalla global de Resultados y comparador · cohortes y modelos de atribución avanzados · costes de producción · TikTok Ads · analítica orgánica de YouTube · roles avanzados, aprobaciones y comentarios · colecciones y etiquetas por IA · publicar anuncios desde la app.

Pendiente de aclarar: qué significa «sacar mds» (¿Markdown, metadatos?). No es requisito.

## 13. Decisiones pendientes (no bloquean el arranque)

| Decisión | Valor provisional |
| --- | --- |
| Fuente de ingresos | API + CSV genéricos hasta confirmar el sistema de tracking |
| Dónde pone tráfico el ID | Nombre del anuncio + parámetro `crea` en la URL |
| Login | **Decidido:** cuenta de Google. Pendiente: confirmar el dominio o dominios permitidos |
| Moneda | EUR, conservando la original |
| Zona horaria | Europe/Madrid |
| Borrado | Archivado lógico; sin borrado físico en el MVP |

## 14. Prompt de arranque

Guarda este documento como `docs/SPEC.md` en la raíz del repositorio `witme-lens` y pega en el chat de Cursor (modo Agent):

> Lee `docs/SPEC.md` completo y úsalo como especificación de Witme Lens. El objetivo es un único flujo: subir una imagen, asignarle un ID y un enlace únicos, que tráfico la use con ese ID y ver su análisis buscando el ID.
>
> 1. Inspecciona el repositorio. Si está vacío, crea un proyecto Next.js con TypeScript, App Router, Tailwind y shadcn/ui en la carpeta actual, con versiones fijadas.
> 2. Escribe un plan breve por fases en `docs/PLAN.md` y espera mi confirmación antes de seguir.
> 3. Trabaja solo la Fase 0: sistema visual Witme (Lexend, azul #315270, acento rosa) y las pantallas Acceso, Biblioteca, Subir imagen y Ficha, navegables con datos demo claramente etiquetados. Sin base de datos ni login real todavía.
> 4. Al terminar, dime cómo arrancarlo en local y qué falta para la Fase 1.
>
> No inventes credenciales, métricas ni integraciones conectadas. Documenta cualquier dependencia externa pendiente.
