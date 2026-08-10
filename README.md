# Backoffice de la Academia SIGMMA — prototipo de alta fidelidad

Maquetación de las pantallas del wireframe `Academia SIGMMA Backoffice - Wireframes.dc.html`, con el
lenguaje visual real de sigmma.net descrito en [`ESTILOS-ACADEMIA.md`](./ESTILOS-ACADEMIA.md).

Es el **backoffice de gestión interna**: donde el staff de SIGMMA carga los videos, gestiona el ciclo
de vida del contenido y administra los bancos de preguntas. La otra cara de la Academia —la vista que
usan las agencias— vive en el repo hermano **`wireframe-academia-AGENCIA`**.

> **Es solo maquetación.** No hay backend, ni API, ni videos reales, ni SSO, ni persistencia. Los
> datos están escritos a mano en el HTML. Sirve como referencia de construcción para desarrollo y
> como pieza presentable a negocio.

---

## Cómo verlo

**Sin instalar nada.** Abrí `index.html` con doble click. El CSS compilado está versionado en
`assets/css/academia.css`, así que el prototipo funciona sobre `file://`.

**Para editar los estilos:**

```bash
npm install
npm run dev      # recompila al guardar src/input.css
npm run build    # compilado minificado para entregar
npm run serve    # servidor local en http://localhost:4321 (opcional)
```

Si tocás `src/input.css`, **recompilá y commiteá el CSS**: está versionado a propósito.

---

## Las pantallas

Las 6 pantallas del wireframe, en 8 vistas, sobre 6 archivos. Las solapas y los estados no tienen
archivo propio: se abren sobre su pantalla con un parámetro en la URL, igual que pasaría en el
producto real. `index.html` tiene el índice completo enlazado.

| # | Pantalla | URL |
|---|---|---|
| S00 | Layout maestro (shell) | `design-system.html#shell` |
| S02 | Listado de módulos | `modulos.html` |
| S03 | Detalle de módulo | `modulo.html?m=30` |
| S04 | Detalle de video — solapa Ficha | `video.html?v=BAK-M30.050` |
| S04 | Detalle de video — las otras cuatro solapas | `…&tab=versiones` · `guion` · `preguntas` · `ubicaciones` |
| S06 | Tablero de producción — vista tabla *(default)* | `tablero.html` |
| S06 | Tablero de producción — vista kanban | `tablero.html?vista=kanban` |
| S08 | Banco de preguntas del módulo | `banco.html?m=30` |

**Estados y variantes:**

| Qué muestra | URL |
|---|---|
| Superficie sin módulos mapeados | `modulos.html?sup=FRT` · `?sup=CRM` |
| Módulo cuyo detalle no maqueta esta tanda | `modulo.html?m=50` |
| Video cuya ficha no maqueta esta tanda | `video.html?v=BAK-M10.050` |

### Contrato de URL

| Param | Valores | Efecto |
|---|---|---|
| `?sup=` | `BAK` *(default)* · `FRT` · `CRM` | Superficie global |
| `?m=` | `0`, `10`, `20` … `95`, `R01` | Módulo |
| `?v=` | `BAK-M30.050` | Video, por ID permanente |
| `?tab=` | `ficha` *(default)* · `versiones` · `guion` · `preguntas` · `ubicaciones` | Solapa del detalle de video |
| `?vista=` | `tabla` *(default)* · `kanban` | Vista del tablero |

---

## El contenido es el real del mapa

**11 módulos BAK y los 55 videos con su ID permanente `BAK-Mxx.yyy`**, tomados del mapa de contenido
(`Estrategia_Grabado_..._pareto_v2`), más la Ruta Esencial `BAK-R01` y el ID reservado `BAK-M35`.
Los títulos de los videos que el wireframe nombra están copiados **verbatim**; el resto sale del mapa.

Son de muestra: las fechas, los links de YouTube, los enunciados de las preguntas y la persona del
sidebar.

### Convenciones de dato

- **Prioridad:** `P1` a `P4`. Son tandas de grabación del Pareto, **no urgencia** — nunca Alta/Media/Baja.
- **Planes:** «plan A» y «plan B», **placeholder deliberado**. El diccionario real es una decisión
  abierta del proyecto.
- **Versión de producto:** `sgm2026.XX`
- **Fechas:** DD/MM/YYYY
- **IDs de video:** `BAK-M30.050` — superficie-módulo.secuencia, de 10 en 10.
- **Los 7 estados de producción**, en orden: `backlog` → `guionado` → `grabado` → `editado` →
  `publicado` → `a regrabar` → `obsoleto`.

---

## Estructura

```
├── ESTILOS-ACADEMIA.md            guía de diseño (fuente de verdad visual, no se toca)
├── DESIGN-SYSTEM-EXTENSIONS.md    los 18 componentes nuevos y su justificación
├── package.json                   @tailwindcss/cli v4
├── netlify.toml                   deploy estático, sin build
├── src/
│   ├── input.css                  @theme heredado íntegro + capa backoffice (sección 6)
│   └── partials/app-shell.html    fuente canónica del sidebar
├── assets/
│   ├── css/academia.css           compilado y versionado
│   ├── fonts/                     Sofia Sans + Roboto (400/700), de web-2026
│   ├── img/logo.svg               de web-2026
│   └── js/
│       ├── icons.js               set de iconos, hidratados en el cliente
│       └── ui.js                  solapas, conmutador, menús, modal, orden de tabla
├── index.html                     índice de las 8 vistas
├── modulos.html  modulo.html  video.html  tablero.html  banco.html
└── design-system.html             catálogo, layout maestro y decisiones abiertas
```

**El sidebar está duplicado en las 5 páginas de app**, a propósito: así los `.html` se abren con
doble click, sin build ni servidor. La versión canónica es `src/partials/app-shell.html` y cada copia
está marcada con `<!-- app-shell: sincronizar con src/partials/app-shell.html -->`. Si lo tocás,
replicalo en las 5 y cambiá **solo** el `aria-current="page"`.

---

## Diferencias con el repo de la vista agencia

Los dos repos comparten design system, convenciones de código, estructura y criterio de deploy. Estas
son las divergencias, todas deliberadas:

| Punto | Vista agencia | Backoffice | Por qué |
|---|---|---|---|
| **Datos** | `mock-data.js` con reglas de negocio y derivados | **Hardcodeados en el HTML** | Aquel prototipo tiene estado real (personas, aprobaciones en `localStorage`, desbloqueo secuencial). Este es maquetación |
| **Chrome** | Header horizontal de 72 px, 3 destinos | **Sidebar de 200 px**, 16 destinos en 6 grupos | No entran en una barra |
| **Responsive** | 3 breakpoints (base, md, lg) | **1440 px fijo** | Fuera de alcance del MVP |
| **JS** | 6 archivos, con máquinas de estado | **2 archivos**, sin lógica de negocio | Solo solapas, conmutador y menús |
| **Naranja `#ff6b35`** | Una aparición: el certificado | **Ninguna** | No hay nada acá que lo justifique |

El bloque `@theme` de `src/input.css` es **idéntico** al del repo hermano: no se cambió un solo
valor. Lo propio del backoffice vive en la sección 6, al final del archivo.

---

## Decisiones tomadas

Donde el wireframe manda, se siguió al pie de la letra. Donde no cerraba o no decía, se decidió.

### Los números se derivan de un solo dato

Se construyeron los 55 videos con **un estado cada uno**, y de ahí salen tanto los contadores del
kanban como la columna «videos publicados / total» del listado. Eso destapó **tres contradicciones**
que el wireframe tenía escondidas — un video no puede estar en dos columnas:

| Qué | El wireframe decía | Queda |
|---|---|---|
| `BAK-M10` videos publicados | 6 / 6 | **5 / 6** — `BAK-M10.050` está `obsoleto` |
| `BAK-M40` videos publicados | 5 / 5 | **4 / 5** — `BAK-M40.010` está `guionado` |
| Columnas del kanban | sumaban 58, con 55 videos | **suman 55** |

Los cuatro tiles de métrica del tablero también se recalcularon: son la misma pantalla.
«En cola de regrabación» bajó de 6 a **3**, porque `a regrabar` implica haber estado publicado y
entre los módulos con contenido publicado no hay lugar para seis.

### Otras decisiones

| # | Punto | Decisión |
|---|---|---|
| 1 | **Tabla y kanban completos** | Se renderizan los **55 videos**, no un extracto. Es lo que pide una herramienta densa, y hace que cada contador sea contable en el DOM en vez de un número que haya que creer |
| 2 | **Fechas y versiones de producto** | Solo las que el wireframe especifica. Los videos que no detalla las muestran vacías: no se inventaron fechas |
| 3 | **Cohortes** | Manda el wireframe donde nombra el video, aunque contradiga al Maestro de Producción (pone `BAK-M30.030` en C03 y el Maestro en C07) |
| 4 | **Detalle de módulo y ficha de video** | Maquetados para `BAK-M30` y `BAK-M30.050`, que son los que el wireframe dibuja. Las otras URLs avisan en vez de inventar el árbol o la ficha |
| 5 | **Checklist de publicación** | El wireframe lista 6 ítems y dice «4 de 5 obligatorios». Se marcó «Duración dentro del objetivo» como *recomendado* para que los dos números cierren |
| 6 | **Destinos del menú sin pantalla** | Se listan (el wireframe dibuja el menú completo) pero no son links: un link que no lleva a ningún lado miente |
| 7 | **Título de pantalla** | Usa `--text-h4` (18→22 px), no `--text-h1` (40→48). En una herramienta densa un título de 40 px se come el alto útil |

Las **decisiones abiertas** —lo que el prototipo resuelve de una manera pero todavía no está
decidido— están en la tabla de [`design-system.html`](./design-system.html#decisiones).

---

## Verificado

- **Compila** con `@tailwindcss/cli` 4.3.3, sin errores.
- **55 videos, 13 módulos**, cada video con exactamente un estado.
- **Las 5 cadenas numéricas de `BAK-M30`** cierran: `6+8+7+7 = 28` · `28−7−1 = 20` ·
  `3+2+2+8 = 15` · `8+10+9+8 = 35` · `2+3+3+2 = 10`.
- **Los 7 contadores del kanban suman 55**, y cada uno coincide con las tarjetas que hay realmente
  en su columna.
- **La tabla y el kanban dicen lo mismo**, estado por estado.
- **El listado de módulos coincide con el tablero**, módulo por módulo, y los totales suman 55.
- Las 7 preguntas de `BAK-M30.060` figuran todas «a revisar» y la sección 4 queda en 0 vigentes de 7,
  que es lo que hace que el sorteo saque 8 de 10.
- **Sin `font-medium`/`font-semibold`, sin hex sueltos en el HTML, sin clases de la paleta default.**
- **Sin apariciones de «SIGMA»** en el código ni en el contenido.
- **Sin `fetch`, sin `localStorage`, sin lógica de negocio** en el JS.
- **32 pares de color contra WCAG AA** (4.5:1 texto, 3:1 gráficos): todos pasan. Cinco tonos se
  ajustaron respecto del primer borrador — están documentados en `DESIGN-SYSTEM-EXTENSIONS.md`.
- Las **URLs del índice** renderizan la pantalla correcta, verificadas en Chrome headless leyendo el
  DOM ya hidratado: las 5 solapas, el conmutador tabla↔kanban y los estados por `?sup=` / `?m=` / `?v=`.
- Un solo `<h1>` por pantalla, jerarquía de headings sin saltos, todas las `<img>` con `alt`, sin IDs
  duplicados, todos los campos con label, y todos los botones y links con nombre accesible.

Lo que queda para probar a mano en un navegador real: el recorrido de teclado completo (foco visible,
`Esc` en el menú, flechas entre solapas) y el comportamiento con `prefers-reduced-motion` activo.

---

## Fuera de alcance

- Las **14 pantallas restantes** del proyecto: esta es la primera de las dos tandas identificadas.
- Backend, API de YouTube, persistencia y lógica de negocio.
- **Responsive**: el prototipo está diseñado a 1440 px.
- **La subida de archivos de video.** Los videos viven en YouTube: el flujo es pegar el link,
  traer título y duración por API y validar el embebido. Nunca hay un dropzone.
- El contenedor de alta de sección, video o pregunta: es una **decisión de UX pendiente** (el design
  system tiene modal pero no drawer).
