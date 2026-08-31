# Extensiones del design system — Backoffice

> **Qué es este documento.** El design system de la Academia se construyó para la **vista agencia**:
> un producto de cara al cliente, con cards, progreso y evaluaciones. El backoffice es otra cosa —
> una herramienta interna de uso diario, para 3 a 5 personas, con alta densidad de datos — y necesita
> componentes que ese sistema no tiene.
>
> Acá está cada pieza nueva: para qué se creó, de qué tokens sale, y si conviene promoverla al design
> system oficial.
>
> **Regla que se respetó sin excepción:** ni un hex nuevo, ni una fuente nueva, ni una escala nueva.
> Todo deriva de los tokens que ya existían en `src/input.css`, heredados sin tocar un valor.

**Dónde vive el código:** `src/input.css`, sección **6 · BACKOFFICE — extensiones**, dentro de
`@layer components`. Las secciones 1 a 5 son la herencia literal del repo
`wireframe-academia-AGENCIA`.

---

## Resumen

| Componente | Para qué | Promover al DS oficial |
|---|---|---|
| `.app-shell` · `.sidebar` | Shell de app interna con navegación lateral | **Sí** — cualquier backoffice futuro lo va a necesitar |
| `.layout-panel` y sus dos variantes | Contenido + panel de apoyo, con el panel acotado por `clamp` | **Sí** |
| `.grid-tarjetas` · `.grid-tiles` · `.pasos-modulo` | Grillas intrínsecas, sin breakpoints | **Sí** |
| `.surface-picker` | Conmutador global de superficie (BAK/FRT/CRM) | No — es específico de la Academia |
| `.nav-group` · `.nav-item` | Menú agrupado por función | **Sí**, junto con el shell |
| `.page-head` · `.breadcrumb` · `.page-title` | Encabezado de pantalla interna | **Sí** |
| `.table-dense` · `.table-scroll-y` | Tabla de alta densidad con encabezado pegado | **Sí** — es la deuda más clara del DS actual |
| `.chip` + 7 estados + `.chip-outline` / `-meta` / `-alerta` | Etiquetas chicas de estado y metadato | **Sí** el `.chip` genérico; los 7 estados no |
| `.filter-bar` · `.filter-pill` · `.filter-search` · `.filter-count` | Barra de filtros de listado | **Sí** |
| `.bulk-bar` | Acciones sobre una selección múltiple | **Sí** |
| `.metric-tile` · `.metric-value` · `.metric-value-sm` | Tiles de métrica de tablero, y su variante chica para panel lateral | **Sí** |
| `.segmented` | Conmutador de vista de dos o tres opciones | **Sí** |
| `.kanban` · `.kanban-col` · `.kanban-card` | Tablero por estados | Tal vez — solo si aparece otro flujo con estados |
| `.tabs` · `.tab` · `.tab-count` | Solapas dentro de una pantalla de detalle | **Sí** — falta en el DS y es un patrón universal |
| `.switch` | Interruptor booleano | **Sí** — el DS no tiene ninguno |
| `.locked-zone` · `.input-locked` | Campos de solo lectura permanente | **Sí** |
| `.tree-section` · `.tree-row` · `.grip` | Jerarquía de dos niveles reordenable | Tal vez |
| `.side-card` · `.side-title` | Panel lateral de apoyo | **Sí** |
| `.meter-row` · `.counter-big` | Contador con umbral y su barra | **Sí** |
| `.checklist` · `.checklist-item` | Checklist de estado, solo lectura | **Sí** |
| `.foot-note` | Nota aclaratoria al pie de un bloque | **Sí** |
| `.escena-badge` | Rótulo del momento de construcción | No — es una anotación del prototipo |
| `.wizard` · `.wizard-step` | Asistente por pasos con rótulo | **Sí** |
| `.step-num` | Número de paso de una lista de campos | **Sí** |
| `.dropzone-csv` | Importación de un archivo de datos | **Sí** |
| `.validation-group` | Filas listas / con error / a saltear | **Sí** |
| `.funnel` | Distribución de N ítems entre estados | **Sí** |
| `.hito-card` | Un objetivo por vez | **Sí** |
| `.grid-editable` | Carga por lote tipo planilla | **Sí** |
| `.split-editor` | Contexto \| edición | **Sí** |
| `.recipe-box` | Precondición antes de una acción | Tal vez |
| `.chain-link` | Dependencia entre ítems de una secuencia | Tal vez |
| `.checklist-live` | Checklist operable, no de solo lectura | **Sí** |
| `.guia-velo` · `.guia-foco` · `.guia-popover` | Capa de ayuda que resalta una parte de la pantalla | **Sí** — cualquier producto con un flujo largo la necesita |
| `.guia-barra` | Aviso de que hay un modo activo, con su salida | **Sí** |
| `.guia-estado` | Si el control ya está completo, o el motivo por el que no | **Sí** |
| `.guia-popover-en-modal` | La misma capa de ayuda cuando lo que explica vive dentro de un modal | **Sí**, junto con el popover |

---

## Detalle

### `.app-shell` · `.sidebar` · `.sidebar-brand` · `.sidebar-foot`

**Por qué.** El chrome de la vista agencia es un header horizontal de 72 px con tres destinos. El
backoffice tiene **16 destinos agrupados en 6 funciones**: no entran en una barra, y el wireframe
resuelve con un sidebar de 200 px.

**Tokens.** `--sidebar-width` y `--shell-min-width` (nuevos, en `@theme static`),
`--color-surface`, `--color-line`, `--color-white`.

**Nota.** **No hay techo de ancho.** El lienzo usa el 100 % de la ventana. El wireframe se dibujó
en 1440 px y durante un tiempo eso fue una medida clavada, que fallaba en las dos direcciones: en
1920 sobraban 240 px muertos de cada lado, y en 1280 se cortaban 160 px del borde derecho —la
acción primaria del encabezado, el panel lateral y la tercera tarjeta de cada grilla— sin ningún
aviso. Ninguna de las dos es lo que quiere una herramienta interna de uso diario, que necesita
meter la tabla más ancha posible en pantalla.

**R7 sigue en pie: no hay un solo breakpoint.** Es un único lienzo fluido, y sigue siendo la
divergencia estructural con el repo hermano, que sí tiene tres. `--shell-min-width: 1160px` es el
piso: por debajo, scrollea antes que deformar el grid. `--sidebar-width: 200px` es lo único que
no crece.

---

### `.layout-panel` · `.layout-panel-inverso` · `.layout-panel-doble`

**Por qué.** Contenido a un lado, panel de metadatos o ayuda al otro: es el patrón de 16 de las 18
pantallas. Vivía como utilidad suelta en cada HTML, con **seis anchos distintos** —320, 330, 340,
360, 380, 400— que no respondían a ningún criterio: eran el número que quedó.

**Decisión.** El panel crece con la ventana pero acotado, con
`clamp(var(--panel-width-min), 22%, var(--panel-width-max))`. Con un ancho clavado, al soltar el
techo del lienzo la proporción contra el contenido se iba a ~6:1 a 2560 px y el panel quedaba como
una astilla; sin techo, un panel de metadatos de 700 px es igual de absurdo. `clamp` sostiene la
proporción en ~4:1 en todo el rango: 320 px hasta 1440, 370 a 1920, 460 de 2560 en adelante.

La columna de contenido es `minmax(0, 1fr)` y no `1fr`: sin eso, una tabla ancha empuja la columna
más allá de su parte y desborda el grid.

**Las tres variantes.** `.layout-panel` es el patrón. `.layout-panel-inverso` pone el panel a la
**izquierda**, para cuando el contexto se lee antes de trabajar y no después. La pantalla que lo
estrenó —el editor de guión— quedó fuera del MVP (D-17), pero la variante se conserva: es la que
sostiene ese patrón de lectura.
`.layout-panel-doble` parte el contenido en dos antes del panel (`video.html`) y es la única que
**no** lleva `align-items: start`: sus tres columnas se estiran parejas, y eso es deliberado: son
bloques de ficha, no un panel colgando al costado.

**Tokens.** `--panel-width-min` (320 px), `--panel-width-max` (460 px), nuevos.

> Reemplaza a `.split-editor`, que declaraba `340px 1fr` y no se usaba en ningún lado: el patrón
> real vivía inline.

---

### `.grid-tarjetas` · `.grid-tiles` · `.pasos-modulo`

**Por qué.** Son la contracara de soltar el techo del lienzo: si la ventana crece y la grilla no,
lo único que crece es el aire.

**No son breakpoints.** Son grillas intrínsecas, que resuelven cuántas columnas entran a partir de
un ancho mínimo por celda. R7 sigue sin tener un solo `@media`.

| Clase | Regla | Dónde |
|---|---|---|
| `.grid-tarjetas` | `repeat(auto-fill, minmax(340px, 1fr))` | Panel de carga de `modulos.html`. 3 columnas a 1440, 4 a 1920, 5 a 2400 |
| `.grid-tiles` | `repeat(auto-fit, minmax(180px, 1fr))` | Filas de tiles de métrica: `modulos.html` y `tablero.html` |
| `.pasos-modulo` | `repeat(5, minmax(0, 1fr))` con `max-width: 1240px` | Los cinco pasos de `modulo.html`, emitidos por `RENDER.tableroPasos()` |

**`auto-fill` en las tarjetas y `auto-fit` en los tiles**, y la diferencia importa: con `auto-fill`
la grilla mantiene el paso aunque sobren columnas —11 módulos en 4 columnas dejan la última fila
alineada a la izquierda, no estirada—; con `auto-fit` las pistas vacías colapsan, que es lo que se
quiere con 4 o 5 tiles sueltos.

**Los cinco pasos llevan techo y las otras dos no.** Una progresión de cinco se lee de un vistazo:
no puede envolver —serían dos progresiones— ni estirarse a 2400 px. En cambio `.metric-tile` **no**
lleva techo, aunque estirado le sobre aire adentro: la fila de tiles es un bloque de ancho completo,
hermano de la barra de progreso, la de filtros y la tabla. Toparlos los dejaba cortos contra todo lo
demás, y esa desalineación vertical se lee peor que el aire interno.

---

### `.surface-picker`

**Por qué.** El backoffice gestiona tres superficies de producto (BAK backoffice, FRT front, CRM) y
todo el contenido cuelga de cuál está activa. Es el conmutador de contexto de la herramienta entera.

**Tokens.** `--color-white`, `--color-info-bg` (hover), `--color-primary`, `--font-mono`,
`--radius-md`.

**Decisión.** Es el **único elemento del sidebar que lleva peso visual de marca**: la sigla va en
`--color-primary`. En la vista agencia el gesto de marca (`.brand-edge`) encoda estado y hay uno
solo por pantalla; acá el criterio se mantiene — no se repartió.

---

### `.sidebar .menu`

**Por qué.** `.menu` es el desplegable general del sistema: anclado a `right: 0`, con
`min-width: 214px`. Dentro del sidebar eso no cierra. La caja de contenido del sidebar mide
**176 px** (200 menos los 12 de padding a cada lado), y como `.sidebar` lleva `overflow-y: auto`
—y cuando un eje no es `visible` el otro tampoco puede serlo, por spec— el sidebar **recorta**. El
menú se desbordaba **38 px** hacia la izquierda y se los comía: las tres opciones se leían
«AK · Backoffice», «RT · Front» y «RM», en lugar de BAK, FRT y CRM.

**Decisión.** Un menú anclado a un control de 176 px tiene que medir 176 px: `min-width: 0`,
`width: 100%`, `left: 0`, `right: auto`. La opción más larga, `BAK · Backoffice`, mide ~115 px
contra 140 px útiles.

> `ui.js` solo alterna `hidden` y maneja el teclado: **no posiciona nada**. Todo el
> posicionamiento de `.menu` es CSS.

---

### `.nav-group` · `.nav-group-title` · `.nav-item`

**Por qué.** La navegación por función (Contenido · Evaluación · Currícula · Pipeline · Seguimiento ·
Administración) es una decisión de arquitectura tomada, no una lista plana.

**Tokens.** `--color-gray-600` (rótulo de grupo), `--color-gray-700` (ítem), `--color-info-bg`
(hover), `--color-surface-sunken` (activo), `--font-mono`, `--radius-sm`.

**Accesibilidad.** El rótulo de grupo usa `gray-600`, no `ink-muted`: a 10 px en mayúsculas, con
`ink-muted` daba **2.43:1**. Con `gray-600` da **4.63:1**.

**Los destinos que esta tanda no maqueta** se listan igual —el wireframe dibuja el menú completo—
pero llevan `aria-disabled="true"`, no son links, y quedan fuera del orden de tabulación. **Mantienen
el mismo gris que los demás**: atenuarlos los dejaba en 2.43:1, y "todavía no está construido" no es
motivo para volver un texto ilegible.

---

### `.page-head` · `.breadcrumb` · `.page-title` · `.page-actions` · `.page-body`

**Por qué.** Encabezado de pantalla con breadcrumb, título, chips de estado y botonera a la derecha.

**Tokens.** `--text-h4` (título), `--font-mono` (breadcrumb e ID), `--color-line`,
`--color-gray-600`.

**Decisión.** El título **no usa la escala de heading** (`--text-h1` es 40→48 px). En una herramienta
de alta densidad un título de 40 px se come el alto útil de la tabla. Se usa `--text-h4` (18→22 px),
que sigue siendo un token del sistema. **R6.**

**Accesibilidad.** El breadcrumb pasó de `ink-muted` a `gray-600`: **2.54:1 → 4.83:1**.

---

### `.chip` y los 7 estados de producción

**Por qué.** `.badge` existe pero mide 24 px de alto y va en `--text-2xs`. Dentro de una fila de
tabla densa de 30 px no entra. `.chip` es la versión de 20 px.

**El mapeo de los 7 estados** usa exclusivamente los tokens de estado que ya existían. La progresión
se lee sola:

| Estado | Clase | Fondo / borde / texto | Contraste |
|---|---|---|---|
| `backlog` | `.chip-backlog` | `surface-sunken` / `line` / `gray-700` | 6.79:1 |
| `guionado` | `.chip-guionado` | `white` / `line-strong` / `gray-700` | 7.56:1 |
| `grabado` | `.chip-grabado` | `info-bg` / `info-line` / `primary` | 7.00:1 |
| `editado` | `.chip-editado` | `warning-bg` / `warning-line` / `warning-dark` | 5.20:1 |
| `publicado` | `.chip-publicado` | `success-bg` / `success-line` / `success-dark` | 6.17:1 |
| `a regrabar` | `.chip-regrabar` | `error-bg` / `error-line` / `error-dark` | 6.05:1 |
| `obsoleto` | `.chip-obsoleto` | `surface-sunken` / `line-strong` punteado / `gray-700`, tachado | 6.79:1 |

**Decisión de accesibilidad en `obsoleto`.** El impulso era pintarlo con `--color-ink-muted` porque
el estado está "apagado" — daba **2.28:1**. Lo que comunica el fin de la vida útil es el **tachado y
el borde punteado**, no un gris ilegible.

**El color nunca es el único portador de significado:** cada chip lleva su etiqueta escrita.

**Variantes de apoyo:** `.chip-outline` (dato ausente, punteado — mismo recurso que `.card-locked` en
la vista agencia), `.chip-meta` (metadato neutro: plan, cohorte, versión) y `.chip-alerta`.

---

### `.filter-bar` · `.filter-pill` · `.filter-search` · `.filter-count`

**Por qué.** Los cuatro listados del backoffice arrancan con una barra de filtros y un contador de
resultados. La guía de estilos menciona una "barra de filtros con chips removibles" en `web-2026`,
pero no está en el DS de la Academia.

**Tokens.** `--color-surface`, `--color-line-strong`, `--color-info-bg` y `--color-primary` (filtro
con valor puesto), `--radius-sm`, `--radius-md`.

**Detalle.** `.filter-pill[data-active="true"]` distingue el filtro que tiene un valor del que está
en "todos". Sin eso, una barra con seis filtros no dice cuál está recortando la lista.

---

### `.table-dense` · `.table-scroll-y`

**Por qué.** **R5 y R6**: tablas antes que tarjetas, densidad alta, los usuarios vienen de Google
Sheets. `.table-app` usa `--text-sm` con 14 px de padding; a 55 filas eso es scroll infinito.

**Tokens.** `--text-xs`, `--font-mono` (encabezado e IDs), `--color-line`, `--color-line-strong`,
`--color-surface` (hover), `--color-info-bg` (fila seleccionada), `--color-gray-800`.

**Decisiones.**
- **Encabezado pegado** (`position: sticky`): las tablas son de 55 filas, perder los títulos al
  scrollear es perder la tabla.
- **`.table-scroll-y`** da el scroll propio del contenedor. Es la nota del wireframe en el layout
  maestro: *"sin footer: la tabla usa todo el alto y scrollea sola"*.
- **`font-variant-numeric: tabular-nums`** en las celdas numéricas, para que las columnas de
  cantidades alineen.
- **`tr[data-reservado="true"]`** para la fila de ID reservado (`BAK-M35`), que existe en el mapa
  pero no tiene contenido. Usa `gray-600`, no `ink-muted`: con `ink-muted` daba **2.54:1**.

---

### `.bulk-bar`

**Por qué.** El tablero permite selección múltiple y acciones en lote.

**Tokens.** `--color-info-bg`, `--color-info-line`, `--color-primary-dark`. Es el mismo lenguaje que
`.alert-info`, en versión compacta de una línea.

---

### `.metric-tile` · `.metric-label` · `.metric-value`

**Por qué.** Los cuatro tiles de métrica arriba del tablero.

**Tokens.** `--color-surface`, `--color-line`, `--font-mono`, `--color-ink`, `--color-error-dark`
(`data-tone="alerta"`).

**Decisión.** El número va en `--font-mono` con `tabular-nums` a 28 px. No usa la escala tipográfica
de heading porque no es un título: es un dato.

**`.metric-value-sm`** lo baja a 24 px, para cuando el tile va dentro de un panel lateral y hay dos
pegados: «grabados» y «con guión» del cohorte, «a revisar» y «borradores» del banco. A 28 px los dos
pares se tocan. Existe como clase propia y no como utilidad de tamaño porque **el `@theme` es
cerrado**: antes esto se pedía con un `!text-2xl` que no compila, así que no hacía nada y nadie se
enteraba.

---

### `.segmented` · `.segmented-option`

**Por qué.** El conmutador Tabla ↔ Kanban. **R5: la tabla es el default y el kanban es un
conmutador**, no dos pantallas.

**Tokens.** `--color-line-strong`, `--color-primary` (opción activa), `--radius-sm`.

**Accesibilidad.** Usa `aria-pressed`, no clases sueltas: el estado viaja en el atributo y un lector
de pantalla lo anuncia.

---

### `.kanban` · `.kanban-col` · `.kanban-head` · `.kanban-card`

**Por qué.** Las 7 columnas de estado de producción.

**Tokens.** `--color-surface` (columna), `--color-white` (tarjeta), `--color-line`,
`--color-primary-light` (hover), `--radius-md`, `--radius-sm`.

**Decisión — R3.** **La visibilidad en el Front nunca es una columna.** Viaja como chip dentro de la
tarjeta. Estado de producción y visibilidad son dos ejes independientes; convertirlos en un solo eje
de 8 columnas sería un error de modelo, no una simplificación de UI.

Cada columna tiene su propio `overflow-y`, así que una columna de 26 tarjetas no estira las otras
seis.

---

### `.tabs` · `.tab` · `.tab-count`

**Por qué.** El detalle de video tiene 5 solapas. El DS no tiene solapas.

**Tokens.** `--text-sm`, `--color-ink-soft`, `--color-primary` (borde inferior activo),
`--color-gray-600` (contador).

**Accesibilidad.** `role="tablist"` / `role="tab"` / `aria-selected`, navegación con flechas, y
`tabindex="-1"` en las inactivas — el patrón de tablist esperado.

---

### `.switch` · `.switch-track`

**Por qué.** **R3**: la visibilidad en el Front es un interruptor, separado del chip de estado. El DS
tiene checkbox y radio (`.choice`), pero ningún interruptor.

**Tokens.** `--color-primary` (encendido), `--color-line-strong`, `--color-gray-400`,
`--color-surface-sunken` (deshabilitado).

**Decisiones.**
- Es un `<input type="checkbox">` real con la pista dibujada por CSS. No es un `div` con
  `onclick`: se opera con teclado y los lectores de pantalla lo anuncian solo.
- **Se habilita solo si el estado es `publicado`.** Deshabilitado se lee como "todavía no
  corresponde", no como "roto".
- WCAG exime del contraste a los componentes inactivos, pero el rótulo deshabilitado sigue diciendo
  algo que hay que poder leer, así que se atenúa un paso (`gray-600`, 4.83:1), no dos.

---

### `.locked-zone` · `.input-locked`

**Por qué.** **R2**: el ID permanente, la superficie, el módulo y la secuencia **no se editan después
del alta**. El ID sobrevive al regrabado.

**Tokens.** `--color-surface`, `--color-surface-sunken`, `--color-line-strong` (punteado),
`--color-gray-700`, ícono `lock` del set existente.

**Decisión.** El punteado + el candado + el fondo hundido son tres señales redundantes a propósito:
**la interfaz enseña la regla**. `.input:disabled` sola no alcanzaba — se lee como "deshabilitado
ahora", no como "no editable nunca".

---

### `.tree-section` · `.tree-head` · `.tree-row` · `.grip`

**Por qué.** El árbol de secciones con videos anidados del detalle de módulo. `.video-row` de la
vista agencia es la fila de un video en el syllabus, pero no tiene el nivel de sección ni el asa.

**Tokens.** `--color-surface` (cabecera), `--color-line`, `--color-info-bg` (fila actual),
`--font-mono`, `--text-xs`.

**Nota honesta.** El asa (`.grip`) comunica que la fila se puede reordenar, pero **el arrastre no
está implementado**: esto es maquetación. Está anotado en las decisiones abiertas.

---

### `.side-card` · `.side-title` · `.meter-row` · `.counter-big` · `.checklist` · `.foot-note`

**Por qué.** El panel lateral de apoyo (aptitud para activar, deuda de evaluación, vista previa del
sorteo) y los contadores que lo habitan.

**Tokens.** `--color-white`, `--color-line`, `--color-line-strong`, `--font-mono`,
`--color-error-dark` / `--color-success-dark` (umbral incumplido / cumplido).

**Decisión — R4.** **Los contadores se ven siempre, durante toda la carga.** Nunca aparecen como
error al final. `.meter-value[data-ok="false"]` marca el umbral incumplido mientras se trabaja, no
cuando ya es tarde.

**`.checklist` advierte, no bloquea:** el ítem incumplido se marca en rojo pero el botón de publicar
sigue habilitado. Que la checklist sea bloqueante es una **decisión abierta** del proyecto.

---

## Bloque de arranque — las 11 piezas nuevas

Estas salieron del segundo bloque de trabajo: el sistema en los momentos previos al régimen.

### `.escena-badge`

**Por qué.** Cada vista declara en qué momento de la construcción está el sistema. Sin ese rótulo, un
listado vacío se lee como un error en vez de como el día 1.

**Tokens.** `--color-indigo` sobre blanco, con borde punteado.

**Decisión.** Usa el **índigo**, que en el design system es color de titular y nunca de estado. Eso lo
saca de la familia de los 7 chips de producción a propósito: **no es un dato del producto, es una
anotación del prototipo**. En régimen se atenúa a gris sólido, porque es el estado por defecto y no
tiene que competir con el título.

**Por eso no conviene promoverlo:** en el producto real la escena no existe.

---

### `.wizard` · `.wizard-step` · `.wizard-num`

**Por qué.** El importador tiene 4 pasos y hay que saber en cuál se está y cuántos faltan.
`.steps` heredado es una fila de puntos sin rótulo, y acá el rótulo importa: «mapeo» y «validación»
no son intercambiables.

**Tokens.** `--color-success-bg` (paso hecho), `--color-primary` (actual), `--font-mono` (número).

**Lleva `flex: none`, y no es decorativo.** `.page-body` es una columna flex que scrollea; como este
bloque tiene `overflow: hidden`, su alto mínimo automático resuelve a 0 y el algoritmo flex lo achica
hasta hacerlo desaparecer. En una ventana de 1440x760 los dos pasos no se veían. Vale para cualquier
pieza con `overflow: hidden` que sea hija directa de `.page-body`.

---

### `.step-num`

**Por qué.** El cuerpo del guión es una lista de pasos numerados, cada uno con su campo. El número
tiene que leerse como etiqueta del campo, no como parte del texto.

**Decisión.** Misma familia que `.wizard-num` —pastilla redonda, mono, 11 px— un punto más chica
(22 px) y con `margin-top` para alinear con la primera línea del campo, no con el centro del bloque.
Son dos cosas distintas: `.wizard-num` dice *en qué paso estás*, `.step-num` dice *qué número de paso
es*.

**Tokens.** `--color-line-strong`, `--color-white`, `--font-mono`, `--color-gray-700`.

---

### `.dropzone-csv`

**Por qué.** Cargar 11 módulos, 55 videos y 20 cohortes por formulario son unos 100 registros. La
fuente de verdad hoy es un Google Sheets, así que hace falta importar.

**Cuidado deliberado.** **R1 prohíbe el dropzone de video.** Este es de datos y tiene que leerse
inequívocamente como tal: el ícono es una tabla, el copy nombra el archivo esperado y el panel lateral
aclara que *no hay columna de link* porque el sistema no aloja video.

---

### `.validation-group` · `.validation-row` · `.validation-fila` · `.validation-motivo`

**Por qué.** Es el paso 3 del importador y **el más importante de los cuatro**. Un importador sin
pantalla de errores es peor que cargar a mano: no se sabe qué entró.

**Decisión.** Cada error lleva **su motivo y su número de fila**, no un contador agregado. «2 filas
con error» no sirve; «fila 34: ID mal formado, "M4O" lleva la letra O en vez de un cero» sí.

---

### `.funnel` · `.funnel-legend`

**Por qué.** Los 55 videos repartidos en los 7 estados, en una sola barra. Es el bloque que hace que
el Home mida **construcción** y no operación (R10).

**Accesibilidad.** Los segmentos llevan el número adentro, así que necesitan contraste de texto.
Seis pasan con blanco; **`backlog` es el único con texto oscuro**: sobre `gray-500` el blanco daba
**2.54:1** y el oscuro **6.99:1**. Y es justo el segmento más grande del arranque —los 55 videos en
E2—, o sea el que no podía quedar ilegible.

---

### `.hito-card` · `.hito-titulo`

**Por qué.** **Un solo próximo hito, no once módulos en alerta.** Es lo que convierte un tablero rojo
en un objetivo.

**Tokens.** `--color-info-bg` + `--color-primary` (pendiente), `--color-success-bg` +
`--color-success-dark` (`data-cumplido="true"`).

---

### `.grid-editable` · `.cell-input` · `.grid-error`

**Por qué.** El alta masiva se elige superficie y módulo una vez y se cargan filas. Que sean 30
inputs sueltos con borde propio se lee como un formulario gigante; que se lea como una planilla es lo
que espera alguien que viene de Sheets.

**Decisión.** El campo no tiene borde hasta que se lo apunta o se lo enfoca. **El motivo del error va
en la fila de abajo, no en un tooltip**: tiene que poder leerse sin apuntar con el mouse.

---

### `.split-editor`

**Por qué.** El editor de guión es contexto a la izquierda, plantilla a la derecha. El guión **no se
escribe aislado**: se escribe sabiendo de dónde viene el escenario del cohorte y en qué estado lo
tiene que dejar para el video siguiente.

---

### `.recipe-box` y `.chain-link`

**Por qué.** La receta es el estado que tiene que tener el sistema **antes** de apretar REC; el
encadenamiento dice de dónde viene ese estado.

**`.chain-link` es el componente que justifica que el cohorte exista.** Sin él, la hoja de cohorte es
una lista de videos filtrada; con él, se ve que grabarlos desordenados obliga a rearmar el escenario
entre uno y otro.

**Tokens.** `.recipe-box` reusa el lenguaje de `.locked-zone` (punteado + fondo hundido): es una
precondición, no un formulario.

---

### `.checklist-live`

**Por qué.** `.checklist` es de **solo lectura** —el estado de publicación de un video—. Esta se
tilda de verdad: es la que se usa antes de grabar, con el `.choice` heredado adentro para que el
checkbox sea real y se opere con teclado.

---

### `.puertas` · `.puerta` · `.puerta-titulo` · `.puerta-bajada` · `.puerta-quien`

**Por qué.** La Fase 4 del prompt de simplificación pedía una pantalla «¿Qué querés hacer?». No se
creó: es el mismo defecto del «panel de obra» que se eliminó, informar y derivar sin dejar hacer. Las
dos puertas se montan en la franja de inicio de `modulos.html` y dan el mismo efecto —cada persona
entra por donde su tarea tiene sentido— sin sumar un destino más al sidebar.

**Decisión.** La puerta apagada es un **`<div>`, no un `<a>` sin `href`**: un link sin destino igual
recibe foco y se lee como accionable, y eso es justo lo que la regla de «un botón que no hace nada es
un bug» prohíbe. Cuando `href` es `null`, `motivo` es obligatorio y se pinta en el lugar de la
bajada, así el control apagado dice **por qué** en vez de quedar mudo.

**Tokens.** `border-line`, `border-primary-light` (hover), `bg-surface`, `bg-white`, `text-ink`,
`text-ink-soft`, `rounded-md` — todos ya existentes en el `@theme`, no se agregó ninguno.

---

## La guía paso por paso — 5 piezas

### `.guia-velo` · `.guia-foco`

El velo cubre la pantalla y **se recorta** sobre el elemento resaltado con un `clip-path` que le
pone el JS. No reusa `.modal-overlay`: aquel tapa todo por igual, y este tiene que dejar ver **y
clickear** la parte que se está explicando. Son dos cosas distintas, y compartir la clase habría
obligado a una de las dos a mentir.

El hueco se agranda 10 px alrededor del ancla, y no es un detalle estético: el anillo de foco de
`.guia-foco` es un `box-shadow` con esparcido, y si el hueco quedara justo, el borde del anillo
caería debajo del velo y se vería cortado.

Dos tokens nuevos de apilamiento, porque el techo del DS era `--z-tooltip: 1003` y esta capa tiene
que quedar por encima de todo lo que explica: `--z-guia-velo: 1004` y `--z-guia: 1005`. El velo va
un escalón debajo del popover para que lo resaltado se lea recortado contra él.

### `.guia-popover`

Un `role="dialog"` anclado, no un tooltip. `.tooltip` lleva `white-space: nowrap` y sirve para una
etiqueta de una línea; esto tiene título, prosa, el estado real del paso y dos acciones.

El ancho va acotado con `clamp(320px, 30vw, 420px)`, por el mismo motivo que el panel lateral: el
lienzo es fluido y sin techo, y un popover de 700 px en una pantalla de 2560 px se lee peor que uno
de 380. La posición y la rotación de la flecha las resuelve el JS según de qué lado del ancla quedó.

### `.guia-barra`

La franja que dice que hay un modo activo, en qué paso va y cómo salir. **No participa del velo**, a
propósito: tiene que seguir legible y clickeable con el popover cerrado, porque es de donde sale la
salida. Sin ella, un control apagado por el modo no tendría de dónde explicarse.

### `.guia-estado`

La línea que dice si el control ya está completo, o el motivo por el que todavía no se puede
avanzar. Dos estados por `data-ok`: verde cuando está listo, ámbar cuando falta.

Lo importante no es el estilo: es que **el texto lo escribió la pantalla, no la guía**. Sale del
`[data-error-num]`, del `[data-cfg-error]`, del `[data-error]` o del `title` del botón primario, que
es donde cada pantalla ya publica su veredicto. Si la guía redactara el suyo, habría dos mensajes
para la misma regla y el de la guía sería el que se queda viejo.

### `.guia-popover-en-modal`

El mismo popover cuando el control que explica vive **dentro de un modal** —los tres campos de la
configuración de evaluación—. Deja de flotar y pasa a ser un bloque del panel: el modal ya tiene su
overlay y su foco atrapado, así que no hace falta un segundo velo, y un globo posicionado contra el
viewport se le escaparía al hacer scroll.

No hubo que tocar `ui.js` para esto. Su `trap()` recalcula `focusables(openModal)` en **cada** `Tab`,
así que toma los botones del popover sin saber que existen. Lo único que la guía hace distinto ahí es
no registrar su propio handler de `Escape`: con un modal abierto, el `Esc` es del modal.

---

## Hallazgos sobre el design system heredado

Cosas que aparecieron al construir el backoffice y que **no se cambiaron unilateralmente**, porque
la consistencia entre los dos repos vale más que una mejora aislada. Van acá para que se decidan.

### 1 · El borde de los inputs no llega a WCAG AA para componentes

`--color-line-strong` (`#d1d5db`) sobre blanco da **1.47:1**. WCAG 1.4.11 pide **3:1** para el borde
que identifica un control interactivo.

**Alcance: los dos repos.** Es el borde de `.input`, `.textarea` y `.select` en el design system
heredado, no algo que el backoffice haya introducido — `.filter-pill` simplemente lo reusa para ser
consistente.

**No se tocó.** Cambiarlo acá y no allá rompería la simetría; cambiarlo en los dos es una decisión de
design system, no de este prototipo. `--color-line-strong` pasando a `--color-gray-500` (`#9ca3af`,
2.6:1) todavía no alcanza; haría falta `--color-gray-600` (`#6b7280`, 4.8:1), que es un cambio visible
en todos los formularios de la Academia.

### 2 · El DS no tiene drawer, y hace falta decidirlo

El design system tiene **un solo patrón de modal**, bien resuelto (overlay al 60 %, foco atrapado,
`Esc`, el foco vuelve al disparador). **No tiene drawer.**

El wireframe de la tanda 1 **no dibuja ninguno de los dos**, así que no se inventó nada. La pregunta
era qué abren «Agregar sección», «Agregar video» y «Escribir pregunta».

**Se está respondiendo sin drawer.** «Escribir pregunta» usa el modal que ya existe. «Agregar video»
—que ahora vive en cada sección del árbol del módulo— navega a la reserva de IDs con la sección
precargada: es un lote de hasta N filas, y eso no entra en un modal. «Agregar sección» todavía
navega a su propia pantalla, y va a resolverse como **formulario inline** en el árbol, que es donde
está el contexto. Queda abierto si el drawer hace falta para algo más.

### 3 · Componentes heredados que el backoffice no usa

`.card-active`, `.card-locked`, `.eyebrow`, `.steps`, `.choice-wrong`, `.video-row`,
`.table-app.is-ranking`, `.progress-complete` y `.btn-cta` quedan definidos pero sin uso.

**Se conservaron a propósito**, para que `src/input.css` siga siendo comparable línea a línea con el
del repo hermano. El costo es unos KB de CSS en un prototipo; el beneficio es que un cambio en el DS
se puede aplicar a los dos archivos sin reconciliarlos primero.

Vale la nota sobre `.btn-cta`: **el naranja `#ff6b35` no aparece ni una vez en el backoffice.** En la
vista agencia tiene una sola aparición (descargar el certificado). Acá no hay ningún momento que lo
justifique, y repartirlo le sacaría la función.
