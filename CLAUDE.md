# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Qué es esto

Prototipo de alta fidelidad del **backoffice de la Academia de Autocapacitación SIGMMA** (lado staff
interno). Dos bloques de trabajo:

- **Tanda 1** — las 6 pantallas del wireframe, en 8 vistas. Es el sistema **en régimen**.
- **Bloque de arranque** — 17 vistas más, organizadas por **escena**: el sistema en los momentos
  previos al régimen (día 0, mapa cargado, P1 en producción, hito de lanzamiento).

**Es solo maquetación.** No hay backend, ni API, ni videos reales, ni SSO, ni persistencia. Los datos
están **escritos a mano en el HTML**. Si aparece un `fetch`, un `localStorage` o una función de
cálculo, está de más.

Es el repo hermano de **`wireframe-academia-AGENCIA`** (la vista que usan las agencias): mismo design
system, mismas convenciones, misma estructura. Las divergencias están listadas en el README y todas
son deliberadas.

**Nomenclatura obligatoria:** la empresa es **SIGMMA**, siempre en mayúsculas y con doble M (sigla de
Sistema Integral de Gestión Multi Modal Administrativo). El producto es **SIGMMA.net** en contexto
comercial y `sigmma.net` en contexto técnico. **Nunca «SIGMA».**

La UI está íntegramente en español rioplatense. Los comentarios de código también.

Documentos de referencia, fuera de este repo:

| Documento | Qué define |
|---|---|
| `ACADEMIA-BACKLOG/MD-PROYECTO-CLAUDE.md` | Alcance funcional del MVP |
| `ACADEMIA-BACKLOG/Estrategia_Grabado_..._pareto_v2.md.pdf` | Mapa de contenido: los 55 videos con ID, tag de plan y prioridad Pareto |
| `ACADEMIA-BACKLOG/Majo_1_Maestro_de_Produccion.md.pdf` | Plan de rodaje: cohortes C01–C15 y estándar de grabación |
| `indicaciones/ACADEMIA-BACKOFFICE/.../Wireframes.dc.html` | **Fuente de verdad de layout, contenido y datos** |

## Comandos

```bash
npm install
npm run dev        # tailwindcss --watch sobre src/input.css
npm run build      # compilado minificado → assets/css/academia.css (versionado en git)
npm run build:dev  # igual pero sin minificar
npm run serve      # servidor estático en http://localhost:4321
```

**No hay suite de tests.** La verificación es por greps, lectura del HTML terminado y Chrome
headless (ver abajo).

`assets/css/academia.css` **está versionado a propósito**: permite abrir cualquier `.html` con doble
click sobre `file://`. Si tocás `src/input.css`, recompilá y commiteá el CSS.

## Arquitectura

### Sistema de tokens cerrado (Tailwind v4, CSS-first)

Todo el diseño vive en `src/input.css`. No hay `tailwind.config.js`: la configuración es el bloque
`@theme`. La paleta, los pesos, los tamaños, los radios, las sombras y los breakpoints por defecto de
Tailwind **fueron borrados** con `--color-*: initial` y equivalentes.

Consecuencia: `bg-blue-500`, `font-medium`, `text-2xl` **no compilan**. Si necesitás un valor nuevo,
se agrega al `@theme` con nombre semántico — nunca un hex suelto en el HTML.

**Las secciones 1 a 5 de `src/input.css` son herencia literal del repo hermano.** No se cambió un
solo valor: la consistencia entre los dos repos vale más que una mejora aislada. Lo propio del
backoffice está en la **sección 6**, al final, y está documentado pieza por pieza en
`DESIGN-SYSTEM-EXTENSIONS.md`.

Si extendés el design system: **derivá de los tokens que ya hay**. Ni un hex nuevo, ni una fuente
nueva, ni una escala nueva. Y documentá la extensión — es un entregable, no un opcional.

### Sin build de HTML — sidebar duplicado a propósito

Los `.html` son archivos planos, sin templating. El sidebar está **copiado literal en las 13 páginas
de app**, delimitado por:

```html
<!-- app-shell: sincronizar con src/partials/app-shell.html -->
...
<!-- /app-shell -->
```

`src/partials/app-shell.html` es la **fuente canónica** (no se sirve). Si modificás el sidebar,
replicá el cambio en todas las páginas de app y actualizá el partial. Al copiarlo, cambiá **solo** el
`aria-current="page"` al destino que corresponda.

Control rápido de que las copias siguen sincronizadas — tiene que dar **un solo hash**:

```bash
for f in home.html modulos.html modulo.html video.html tablero.html banco.html \
         importador.html alta-videos.html alta-modulo.html alta-seccion.html \
         cohorte.html guion.html superficies.html; do
  sed -n '/app-shell: sincronizar/,/\/app-shell/p' $f | sed 's/ aria-current="page"//' | md5sum
done | sort -u   # → una sola línea
```

### La escena: en qué momento de la construcción está el sistema

Cada vista declara su **escena**. Es lo que corrige el problema silencioso de la tanda 1: dibujó el
régimen sin declararlo, y eso lleva a priorizar como si el estado normal fuera el de dentro de un año.

| Escena | Momento | Datos |
|---|---|---|
| `E1` | Día 0 | Nada cargado |
| `E2` | Semana 1 | 55 IDs en `backlog`, 0 preguntas |
| `E3` | Mes 1 | C01 publicado (2), C02 editado (6), C03 guionado (4), 43 en backlog |
| `E4` | Mes 2 | Los 12 de P1 publicados, 60 preguntas, Ruta apta |
| `E5` | Régimen | Lo que maquetó la tanda 1. **Es el default: sin `?escena=` se muestra este** |

Un bloque se marca con `data-escena="E2"`, o con varias separadas por coma. `ui.js` oculta los que no
corresponden con **`data-escena-off`** — un atributo propio, **no `hidden`**: las solapas y el
conmutador de vista usan `hidden` y se pisarían. Así componen.

**Tres reglas que no se negocian:**

1. **Los datos de una escena nunca se mezclan con los de otra.** Por eso se alternan bloques enteros
   de HTML y no celdas sueltas.
2. **Si se pide una escena que la pantalla no maqueta, avisa.** Nunca muestra los datos de otro
   momento con el rótulo cambiado.
3. **Monotonía temporal: entre escenas sucesivas, el estado de un video solo puede avanzar.** Las
   únicas excepciones son `a regrabar` y `obsoleto`, posteriores a `publicado`. Vale igual para todo
   contador derivado: el banco de la Ruta Esencial no baja, y un módulo ya activado sigue activo.

**Los estados vacíos son escenas**, no un parámetro aparte: el estado vacío de una pantalla *es* esa
pantalla en E1 o E2. No hay `?state=empty`.

**Ojo con el orden de ejecución.** El script inline de cada página corre durante el parseo, y
`bindEscena` corre en `DOMContentLoaded`. Si un controlador de página necesita ocultar el bloque de
la escena activa, tiene que usar `hidden` — con `data-escena-off` se lo saca `bindEscena` después.

### El contrato de URL

Los estados y las solapas no tienen archivo propio: se abren sobre su pantalla padre con query
params. `index.html` tiene la tabla completa enlazada — **es el índice canónico** y hay que
actualizarlo si se agrega una pantalla o un estado.

| Param | Valores |
|---|---|
| `?sup=` | `BAK` (default) · `FRT` · `CRM` |
| `?m=` | `0`, `10`, `20` … `95`, `R01` |
| `?v=` | `BAK-M30.050` |
| `?tab=` | `ficha` (default) · `versiones` · `guion` · `preguntas` · `ubicaciones` |
| `?vista=` | `tabla` (default) · `kanban` — tablero |
| `?escena=` | `E1` · `E2` · `E3` · `E4` — sin parámetro, `E5` |
| `?modo=` | `planificacion` (default) · `sesion` — hoja de cohorte |
| `?paso=` | `1` · `2` · `3` · `4` · `resultado` — importador |
| `?c=` | `C03` — cohorte |

`design-system.html` tiene la tabla de **decisiones abiertas**, que hay que mantener sincronizada con
lo que el prototipo resuelve de una manera sin que esté decidido.

### JS: dos archivos, sin lógica

No hay módulos ES (romperían `file://`). Cada archivo expone un global vía IIFE.

| Archivo | Global | Rol |
|---|---|---|
| `icons.js` | `ICONS`, `renderIcons()` | Mapa de paths SVG + hidratación de `<span class="icon" data-icon="…">` |
| `ui.js` | `UI` | Solapas, conmutador de vista, menús, modal, orden de tabla, selección múltiple |

**Orden obligatorio:** `icons.js` → `ui.js` → script inline de la página.

`ui.js` cablea solo, sin configuración: `data-tabs` + `data-tab` + `data-panel`, `data-view-switch` +
`data-view` + `data-view-panel`, `data-dropdown`, `data-modal-open` / `data-modal-close`,
`data-sortable` + `data-sort-key`, `data-bulk`.

Lo que el repo hermano tiene y acá **no se copió** —guardas de módulo, sesión expirada, hidratación
de usuario— dependía de un `mock-data.js` con reglas de negocio que este prototipo no tiene.

## Las reglas de diseño que están cableadas

Salieron de tres rondas de revisión del wireframe. **Romperlas es un error, no una variación.**

| # | Regla |
|---|---|
| R1 | **No hay carga de archivos de video.** Los videos viven en YouTube: link → «Traer datos» (título y duración por API) → validación de embebido → confirmar. **Nunca un dropzone** |
| R2 | **La zona de identidad del video va deshabilitada, con candado.** ID, superficie, módulo y secuencia no se editan después del alta: el ID sobrevive al regrabado |
| R3 | **Estado de producción y visibilidad en el Front son dos controles separados.** El interruptor se habilita solo si el estado es `publicado`. En el kanban la visibilidad viaja como chip dentro de la tarjeta, **nunca como columna** |
| R4 | **Los contadores del banco se ven siempre**, durante toda la carga. No aparecen como error al final |
| R5 | **Tablas antes que tarjetas.** La tabla es el default del tablero; el kanban es un conmutador |
| R6 | **Densidad alta.** Herramienta interna de uso diario para 3 a 5 personas. Sin onboarding, sin tours, sin contenido de marketing, sin whitespace decorativo |
| R7 | **Desktop 1440 px.** No hay responsive en este alcance |
| R8 | **La Ruta Esencial referencia videos, no los copia.** Su banco es *derivado* y se muestra etiquetado como tal |
| R9 | **El wireframe dibuja estados rotos, no ideales.** Hay que mantenerlos: el sorteo que no se puede cumplir, el módulo no apto para activar, las preguntas a revisar. Es el estado en el que se va a vivir mientras se carga contenido |
| R10 | **El Home mide avance de construcción, no operación.** En las etapas de arranque no hay uso: no inventar métricas de uso. Lo único de operación permitido es «módulos activos» y «agencias con acceso» |
| R11 | **Los videos nacen en `backlog`, sin link y sin versión.** El alta **nunca** pide un link de YouTube: son IDs reservados. Es lo que permite que el mapa mire hacia adelante |

Los 7 estados de producción, en orden: `backlog` → `guionado` → `grabado` → `editado` → `publicado`
→ `a regrabar` → `obsoleto`.

`data-estado` lleva **el nombre exacto**, sin abreviar ni slugificar — incluido
`data-estado="a regrabar"`, con espacio. Ese vocabulario se copia a desarrollo. Los pasos del
importador son otro vocabulario y usan `data-paso-estado`, para no pisar el atributo.

## La regla numérica que une todo

Los datos están escritos a mano, así que **los números tienen que cerrar entre pantallas**. Si tocás
uno, recalculá la cadena entera.

**Cada video tiene exactamente un estado.** De ahí salen los contadores del kanban, los tiles de
métrica del tablero y la columna «videos publicados / total» del listado de módulos. Los tres tienen
que decir lo mismo.

Las 5 cadenas de `BAK-M30`:

1. Preguntas por sección = total del módulo → `6 + 8 + 7 + 7 = 28`
2. Total − a revisar − borradores = banco vigente → `28 − 7 − 1 = 20`
3. Faltantes por sección = faltante del módulo → `3 + 2 + 2 + 8 = 15`
4. Banco mínimo por sección = mínimo del módulo → `8 + 10 + 9 + 8 = 35`
5. Mínimos por sorteo = preguntas del intento → `2 + 3 + 3 + 2 = 10`

Y la regla que las une: **cuando un video pasa a `a regrabar`, todas sus preguntas vigentes pasan a
`a revisar`.** Por eso `BAK-M30.060` deja la sección 4 en 0 vigentes de 7, y por eso el sorteo saca
8 de 10 en vez de 10.

## Datos: qué se puede tocar y qué no

**No inventar datos.** El wireframe pasó tres rondas de corrección para que sean los reales del
proyecto.

- **Los 55 videos** son los del mapa de contenido, con su ID permanente. Los títulos que el wireframe
  nombra están copiados verbatim; el resto sale del mapa.
- **Los 20 cohortes (C01–C20), su escenario compartido y las prioridades P1–P4** salen del
  **Maestro de Producción**, no del wireframe: 8 de 9 cohortes del wireframe lo contradecían y se
  alinearon (decisión B-1). Las recetas y el encadenamiento de los guiones de P1 salen de
  `Majo_3_Cohorte_P1_guiones`, verbatim.
- **Prioridad P1 a P4:** son tandas de grabación del Pareto, **no urgencia**. Nunca Alta/Media/Baja.
- **`Majo_3_Cohorte_P1_guiones` escribe «SIGMA» con una sola M**, 10 veces. Al traer ese texto al
  prototipo se escribe **SIGMMA**. El documento fuente está pendiente de corrección (B-2).
- **«plan A» y «plan B» son un placeholder deliberado.** El diccionario real es una decisión abierta:
  **no reemplazarlo por nombres inventados.** (El Maestro usa `P+B / B / B-nicho` y la vista agencia
  usa Professional / Business — tres nomenclaturas para lo mismo, sin decidir.)
- **Fechas y versiones de producto:** solo las que el wireframe especifica. Los videos que no detalla
  las muestran vacías. **No inventar fechas.**
- Son de muestra: los links de YouTube, los enunciados de las preguntas y la persona del sidebar.

## Verificación

No hay tests automatizados. Esto es lo que se corre antes de dar algo por terminado.
`design-system.html` se excluye de los greps: ahí los hex son contenido legítimo.

```bash
PAGS=$(ls *.html | grep -v design-system.html)

# Disciplina del design system
grep -n "font-medium\|font-semibold" $PAGS                 # → vacío
grep -nE "#[0-9a-fA-F]{6}\b" $PAGS | grep -v href=         # → vacío
grep -noE "\b(bg|text|border)-(red|blue|green|slate|sky|amber|emerald)-[0-9]{2,3}" $PAGS  # → vacío

# Nomenclatura — sobre la superficie del producto, no sobre los .md:
# README.md y CLAUDE.md citan «SIGMA» entrecomillado para enunciar la regla.
grep -rn "SIGMA[^M]" *.html assets/js/ src/ | grep -v SIGMMA        # → vacío

# Que siga siendo maquetación
grep -n "fetch(\|localStorage\|XMLHttpRequest" assets/js/*.js *.html  # → vacío
```

> **Cuidado con el idiom `cmd | grep -v X >/dev/null && …`.** Con entrada vacía y la salida
> redirigida a `/dev/null`, GNU grep devuelve 0 y el condicional se invierte. Para automatizar estos
> controles, capturá la salida y comprobá que esté vacía.

**Coherencia numérica.** Como los datos van a mano, se verifica leyendo el HTML terminado: 55 filas
en la tabla del tablero, los 7 contadores del kanban sumando 55 y coincidiendo con las tarjetas
reales de cada columna, el listado de módulos coincidiendo con el tablero módulo por módulo, y las
5 cadenas de `BAK-M30` presentes en `banco.html`.

**Por escena**, además:

- `E2`: los 55 en `backlog`, 0 preguntas, 0 módulos activos
- `E3`: `2 + 6 + 4 + 43 = 55`, y los 2 publicados son C01, los 6 editados C02 y los 4 guionados C03
- `E4`: publicados por módulo `2+3+3+3+1 = 12`, banco 60, Ruta 12/12 apta, y **ningún módulo de
  biblioteca completo** — que es el argumento de la Ruta Esencial
- `E5`: `14 + 4 + 2 + 2 + 29 + 3 + 1 = 55`, los 12 de P1 **siguen publicados**, y la Ruta pasó de
  apta a **activa** con 12/12 videos y banco 60/60
- **Los mismos 55 IDs en las cuatro:** ninguno aparece ni desaparece, solo cambia el estado
- **Monotonía: cero retrocesos.** Video por video, `E2 ≤ E3 ≤ E4 ≤ E5` según el orden de avance

```bash
# R10 — el Home no inventa métricas de uso
grep -inE "videos vistos|% de completitud|evaluaciones rendidas" home.html   # → vacío

# R11 — ninguna pantalla de alta pide un link
grep -nE '<(input|textarea)[^>]*(type="url"|link|youtu)' alta-videos.html importador.html  # → vacío

# Los 13 sidebars idénticos
for f in home.html modulos.html modulo.html video.html tablero.html banco.html \
         importador.html alta-videos.html alta-modulo.html alta-seccion.html \
         cohorte.html guion.html superficies.html; do
  sed -n '/app-shell: sincronizar/,/\/app-shell/p' $f | sed 's/ aria-current="page"//' | md5sum
done | sort -u | wc -l   # → 1
```

**Recorrido en el navegador** con `google-chrome --headless=new --dump-dom`, que verifica el DOM ya
hidratado: cada URL del índice, las 5 solapas de `video.html`, el conmutador tabla↔kanban y los
estados por `?sup=` / `?m=` / `?v=`. Conviene pasar `--virtual-time-budget=1200`: sin eso, las
capturas agarran la transición del conmutador a mitad de camino.

**Accesibilidad estructural:** un solo `<h1>` por pantalla, jerarquía de headings sin saltos,
`<img>` con `alt`, sin IDs duplicados, campos con label, botones y links con nombre accesible.

## Git

Rama principal **`main`**. Commits en Conventional Commits, en español.
