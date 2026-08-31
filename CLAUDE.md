# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Qué es esto

Prototipo funcional del **backoffice de la Academia de Autocapacitación SIGMMA** (lado staff interno),
con una **academia completa simulada**. Cuatro bloques de trabajo:

- **Tanda 1** — las 6 pantallas del wireframe, en 8 vistas. Es el sistema **en régimen**.
- **Bloque de arranque** — 17 vistas más, organizadas por **escena**: el sistema en los momentos
  previos al régimen (día 0, mapa cargado, P1 en producción, hito de lanzamiento).
- **Simulación completa** — el dato dejó de estar escrito en el HTML y pasó a una capa propia, con
  **550 preguntas, 12 agencias, 56 personas** y la escena **E6 · en operación**.
- **Backoffice operable** — **18 pantallas de app**: se abrieron 5 destinos del sidebar y **toda
  acción que se ofrece se puede ejecutar**, con el cambio persistido por escena.
- **Flujos de alta simplificados** — **19 pantallas**. La estructura del MVP entra por
  importación en vez de tipearse 44 veces, ninguna vía puede dejar un video sin sección, y
  escribir preguntas pasó de 550 aperturas de modal a una cola por video.
- **Los pasos, centralizados** — el **panel de carga** en `modulos.html` (conmutador tabla /
  tarjetas) y el **tablero de cinco pasos** en `modulo.html`. El panel contesta «¿cómo viene
  la carga?» sobre los 11; el módulo, «¿qué hago con este?».
- **El panel es la pantalla de inicio** — **18 pantallas**: se eliminó el «panel de obra»,
  que contaba cómo iba todo sin dejar hacer nada. Su hito por escena y su trabajo inmediato
  quedaron como franja del panel; el embudo se fue al tablero y el uso al panel macro, que
  pasó a llamarse **«Uso de la Academia»** porque es lo que mide.

  > El control de que no quedó ninguna referencia colgada es un grep **absoluto**, así que
  > la pantalla borrada no se nombra en ningún lado —ni para contar que se borró—. Si algún
  > día hace falta citarla, hay que decidir primero cómo se excluye la cita del control.

  Sobre esa franja se montaron las **dos puertas** de la Fase 4 del prompt de
  simplificación —cargar el link de un video, o reservar los IDs de lo que se
  va a grabar—. Se montaron **ahí y no en una pantalla nueva**: un hub
  «¿Qué querés hacer?» informa y deriva, que es exactamente por lo que se
  eliminó el panel de obra.

  **En E1 las dos puertas no se muestran**, a propósito. El placeholder del
  día 0 ya cumple esa función con su propio CTA al importador —el mismo
  destino que la segunda puerta— más «crear el primer módulo a mano» como
  salida secundaria. Pintar las puertas ahí encima daría una puerta muerta
  (nada espera link todavía) más un duplicado del CTA que ya está arriba.

- **Recorte al alcance del MVP** — **10 pantallas** y **4 destinos vivos** en el sidebar. El
  MVP es **crear y ver módulos**, así que salieron ocho pantallas y tres grupos enteros del
  menú: seguimiento de uso, detalle por agencia, superficies y planes, biblioteca de videos,
  cola de regrabación y la producción de rodaje —hoja de cohorte y editor de guión—. Ver D-17.

  > **El tablero y los bancos NO son destinos que se conserven por las dudas:** son los pasos
  > 2, 3 y 4 de `pasosDeModulo()`. Sin ellos el módulo no llega a `activo` —el paso 4 se traba
  > con «Todavía no hay ningún video publicado» y el paso 5 nunca cumple aptitud—, así que
  > recortarlos no simplifica el MVP: lo deja sin poder terminar un módulo.

  > **El motor y el dataset no se tocaron.** `modulos.html` sigue usando `operacion()` para el
  > hito de E6 y `escritura.html` usa `guionDe()`, así que borrar las pantallas **no habilita**
  > borrar sus datos: `academia-agencias.js` y `academia-guiones.js` siguen cargando, y los 15
  > controles de R10 siguen midiendo. Que los **129 controles** sigan en verde es la red que
  > dice que el recorte no rompió nada.

**Ya no es solo maquetación, ni solo navegación.** No hay backend, ni API, ni videos reales, ni SSO.
Pero **sí hay capa de datos, reglas de negocio derivadas, mutaciones y persistencia en
`localStorage`**. Eso revierte a propósito una decisión de la tanda 1 (ver «El cambio de
arquitectura»).

**Un botón que no hace nada es un bug, no una maqueta.** Es la regla que gobierna este bloque: si una
acción no se puede ejecutar, el control va deshabilitado **con el motivo a la vista** —no presente y
mudo. Los dos casos que lo motivaron enseñaban una compuerta funcionando y después no dejaban
cruzarla: «Reservar IDs» se re-rotulaba solo, y «Activar módulo» se habilitaba al cumplir la aptitud.

Es el repo hermano de **`academia-AGENCIA`** (la vista que usan las agencias): mismo design system,
mismas convenciones, misma estructura. Las divergencias están listadas en el README y todas son
deliberadas.

**Nomenclatura obligatoria:** la empresa es **SIGMMA**, siempre en mayúsculas y con doble M (sigla de
Sistema Integral de Gestión Multi Modal Administrativo). El producto es **SIGMMA.net** en contexto
comercial y `sigmma.net` en contexto técnico. **Nunca «SIGMA».**

La UI está íntegramente en español rioplatense. Los comentarios de código también.

Documentos de referencia, fuera de este repo:

| Documento | Qué define |
|---|---|
| `ACADEMIA-BACKLOG/MD-PROYECTO-CLAUDE.md` | Alcance funcional del MVP. **Ojo:** escribe «Standard» donde va «Professional» (B-4) |
| `ACADEMIA-BACKLOG/Estrategia_Grabado_..._pareto_v2.md.pdf` | Mapa de contenido: los 55 videos con ID, tag de plan y prioridad Pareto |
| `ACADEMIA-BACKLOG/Majo_1_Maestro_de_Produccion.md.pdf` | Plan de rodaje: cohortes C01–C20 y estándar de grabación |
| `ACADEMIA-BACKLOG/Majo_3_Cohorte_P1_guiones.md.pdf` | Los 12 guiones de P1. **Escribe «SIGMA» 10 veces** (B-2) |
| `indicaciones/ACADEMIA-BACKOFFICE/.../Wireframes.dc.html` | Fuente de verdad de layout del régimen |
| `web.sigmma.net/planes.html` | Los tres planes comerciales. Cierra D-3 |

## Comandos

```bash
npm install
npm run dev        # tailwindcss --watch sobre src/input.css
npm run build      # compilado minificado → assets/css/academia.css (versionado en git)
npm run build:dev  # igual pero sin minificar
npm run serve      # servidor estático en http://localhost:4321
```

> **`serve@14` descarta el query string.** Pide `/tablero.html?escena=E6` y responde un 301 a
> `/tablero`, **sin el parámetro**: la página renderiza E5 en silencio. Para probar cualquier URL con
> parámetros hay que usar la ruta **sin `.html`**:
>
> ```bash
> #  mal → renderiza E5           bien → renderiza E6
> curl "localhost:4321/tablero.html?escena=E6"   curl "localhost:4321/tablero?escena=E6"
> ```

**No hay suite de tests.** La verificación es `SIM.verificar()`, greps y Chrome headless (ver abajo).

`assets/css/academia.css` **está versionado a propósito**: permite abrir cualquier `.html` con doble
click sobre `file://`. Si tocás `src/input.css`, recompilá y commiteá el CSS.

## El cambio de arquitectura

La tanda 1 declaraba: *«es solo maquetación; si aparece un `fetch`, un `localStorage` o una función de
cálculo, está de más»*, y *«datos hardcodeados en el HTML»*. **Eso ya no vale**, y el cambio fue
deliberado, no un descuido.

El motivo: los agregados escritos a mano no cerraban entre pantallas y no podían cerrar. Los 55 IDs
aparecían **1.320 veces** solo en `tablero.html` (4 escenas × 2 vistas × 6 lugares por video), y
cambiar el estado de un video obligaba a recalcular unos 30 números en 4 archivos. El propio
`design-system.html` documentaba tres lugares donde el wireframe **no cerraba consigo mismo**.

Qué se conserva y qué cambió:

| Sigue prohibido | Ahora permitido |
|---|---|
| `fetch`, `XMLHttpRequest`, módulos ES | Capa de datos en JS, por IIFE global |
| Números agregados escritos a mano | `localStorage`, **solo** en `academia-sim.js` |
| Inventar datos del proyecto | Reglas de negocio derivadas del dato |

`file://` sigue funcionando por doble click: sin módulos ES, sin `fetch`, todo por global.

### Sistema de tokens cerrado (Tailwind v4, CSS-first)

Todo el diseño vive en `src/input.css`. No hay `tailwind.config.js`: la configuración es el bloque
`@theme`. La paleta, los pesos, los tamaños, los radios, las sombras y los breakpoints por defecto de
Tailwind **fueron borrados** con `--color-*: initial` y equivalentes.

Consecuencia: `bg-blue-500`, `font-medium`, `text-2xl` **no compilan**. Si necesitás un valor nuevo,
se agrega al `@theme` con nombre semántico — nunca un hex suelto en el HTML ni en el JS.

**Las secciones 1 a 5 de `src/input.css` son herencia literal del repo hermano.** No se cambió un solo
valor. Lo propio del backoffice está en la **sección 6**, documentado en `DESIGN-SYSTEM-EXTENSIONS.md`.

### Sin build de HTML — sidebar duplicado a propósito

Los `.html` son archivos planos, sin templating. El sidebar está **copiado literal en las 10 páginas
de app**, delimitado por:

```html
<!-- app-shell: sincronizar con src/partials/app-shell.html -->
...
<!-- /app-shell -->
```

`src/partials/app-shell.html` es la **fuente canónica** (no se sirve). Si modificás el sidebar,
replicá el cambio en todas las páginas y actualizá el partial. Al copiarlo, cambiá **solo** el
`aria-current="page"`.

## Los diez archivos de JS

No hay módulos ES (romperían `file://`). Cada archivo expone un global vía IIFE.

| Archivo | Global | Rol |
|---|---|---|
| `icons.js` | `ICONS`, `renderIcons()` | Mapa de paths SVG + hidratación de `<span class="icon" data-icon="…">` |
| `academia-data.js` | `ACADEMIA_DATA` | **El dataset.** Superficies, planes, 13 módulos, 31 secciones, 55 videos, 20 cohortes |
| `academia-agencias.js` | *(cuelga de `ACADEMIA_DATA`)* | 12 agencias y 56 personas, **todas ficticias** |
| `academia-guiones.js` | *(cuelga de `ACADEMIA_DATA`)* | Los 12 guiones de P1, verbatim |
| `academia-preguntas.js` | *(cuelga de `ACADEMIA_DATA`)* | Las 550 preguntas, en tres capas |
| `academia-sim.js` | `SIM` | **El motor.** Escenas, overlay, todos los agregados derivados, `verificar()` |
| `academia-import.js` | `IMPORT` | Emite la plantilla del mapa, lee la planilla y arma el plan de alta. **Se carga solo en `importador.html`** |
| `render.js` | `RENDER` | Helpers de markup. Emite el mismo HTML que antes estaba literal |
| `ui.js` | `UI` | Solapas, conmutador de vista, menús, modal, orden de tabla, selección múltiple, **filtros, exportación a CSV y `rebind()`** |
| `academia-guia.js` | `GUIA` | **La guía paso por paso** de creación de un módulo, **control por control**: el mapa de etapas × controles, el popover con spotlight y la compuerta de «Siguiente». **Se carga solo en las 7 pantallas del flujo** |

**Orden de carga obligatorio**, y no es negociable — cada uno necesita al anterior:

```
icons.js → academia-data.js → academia-agencias.js → academia-guiones.js
        → academia-preguntas.js → academia-sim.js → render.js → ui.js
        → academia-guia.js → script inline de la página
```

**`academia-import.js` va entre `academia-sim.js` y `render.js`, y solo en `importador.html`.**
Ninguna otra pantalla lo necesita y no hay razón para que lo cargue. El motor **no depende de
él**: es al revés. Sus dos controles de ida y vuelta se saltean donde no está cargado.

**`academia-guia.js` va DESPUÉS de `ui.js`**, y solo en las **7 pantallas del flujo de creación de
un módulo**: `modulo.html`, `alta-modulo.html`, `alta-seccion.html`, `alta-videos.html`,
`banco.html`, `escritura.html` y `tablero.html`. Necesita a los tres de arriba —motor, render y
UI— y se auto-inicializa en el `DOMContentLoaded`, así que corre cuando el script inline ya pintó.
Seis de sus siete controles se saltean donde no está cargado.

**Cuántos controles da `verificar()`**, entonces, según qué hay cargado:

| Dónde | Controles |
|---|---|
| Una pantalla común | **126** |
| `importador.html` | **128** |
| Una de las 7 del flujo | **132** |
| El script de node de abajo, con los diez | **134** |

**Ojo con el orden de ejecución.** Los `<script src>` van al final del `<body>`, así que el script
inline corre durante el parseo y el `renderIcons()` de `icons.js` hidrata lo generado en el
`DOMContentLoaded` posterior. `ui.js` cablea solapas, orden de tabla y selección múltiple sobre las
filas ya generadas. Si un render ocurriera más tarde, hay que llamar a `renderIcons(root)` a mano —
`RENDER.pintar()` ya lo hace.

### Qué va en cada capa

- **`academia-data.js` es DATO, no lógica.** Si un número está escrito ahí y también se puede
  calcular, está de más.
- **`academia-sim.js` es CÁLCULO, no markup.** No toca el DOM: se puede cargar en node.
- **`render.js` es MARKUP, no cálculo.** Solo arma HTML con lo que el motor ya resolvió.
- **`academia-import.js` es CÁLCULO también**, pero acotado a la planilla: lee, valida y devuelve un
  plan. **No persiste nada** —el único que escribe en el almacén del navegador es el motor— y **no
  hace pedidos de red**: el archivo lo elige la persona y se lee con `FileReader`.
- **`academia-guia.js` es CÁLCULO + DOM acotado.** Resuelve qué control corresponde a la pantalla y
  si está completo, y arma el popover. **No persiste nada** ni deriva ningún agregado propio: la
  etapa la da `pasosDeModulo()` y el control vigente es el primero que no está listo. **Y no
  reimplementa ninguna validación:** lee el veredicto que la pantalla ya pintó en el DOM. Su acceso
  al DOM es **perezoso**, a propósito, así que se puede requerir en node y sus controles corren sin
  navegador.

> **Ojo al comentar estas reglas en el código.** Los controles de disciplina son greps a secas: un
> comentario que nombre `localStorage` o `fetch` para *enunciar* la prohibición hace fallar el
> control igual que si lo usara. Enunciala sin escribir el token.

## La escena: en qué momento de la construcción está el sistema

| Escena | Momento | Datos |
|---|---|---|
| `E1` | Día 0 | Nada cargado |
| `E2` | Semana 1 | 55 IDs en `backlog`, 0 preguntas |
| `E3` | Mes 1 | C01 publicado (2), C02 editado (6), C03 guionado (4), 43 en backlog · 10 preguntas |
| `E4` | Mes 2 | Los 12 de P1 publicados, 60 preguntas, Ruta apta |
| `E5` | Régimen | Lo que maquetó la tanda 1. **Es el default: sin `?escena=` se muestra este** |
| `E6` | En operación | La academia completa: 51 publicados, bancos de 50, **12 agencias usándola** |

**El estado se modela por HITOS, no por escena.** Cada video declara la primera escena en la que
alcanza cada estado:

```js
{ guionado: "E3", publicado: "E4" }   // en E2 está en backlog; de E4 en adelante, publicado
```

El estado en una escena es el más avanzado cuyo hito ya ocurrió. **Consecuencia: la monotonía temporal
es imposible de violar** — no existe forma de escribir un retroceso. Modelarlo con un estado por
escena sí lo permitía, y era el riesgo más grande del dato hecho a mano.

**Tres reglas que no se negocian:**

1. **Los datos de una escena nunca se mezclan con los de otra.** El overlay de `localStorage` se
   guarda **por escena** por el mismo motivo: marcar un video como grabado mirando el Mes 1 no puede
   ensuciar el régimen.
2. **Si se pide una escena que la pantalla no maqueta, avisa.** Nunca muestra los datos de otro
   momento con el rótulo cambiado.
3. **Monotonía temporal: entre escenas sucesivas, el estado de un video solo puede avanzar.** Las
   únicas excepciones son `a regrabar` y `obsoleto`, posteriores a `publicado`. Vale igual para todo
   contador de **logro acumulado**: el banco no baja y un módulo ya activado sigue activo.

   > No vale para todo contador derivado sin más — un contador de **deuda** sube cuando aparece
   > trabajo y baja cuando se hace, y eso también es correcto: `deudaDeEvaluacion()`, `colaDeEscritura()`
   > y `sinLink()` no son monótonos y no tienen por qué serlo. Tomada al pie de la letra, la frase
   > anterior los condenaba a los tres.

**Los estados vacíos son dato, no escena.** Un módulo sin videos publicados muestra «todavía no
corresponde escribir preguntas» en **cualquier** escena: `banco.html?m=50` en régimen y
`banco.html?m=30&escena=E2` muestran lo mismo, porque la condición es la misma.

Un bloque se marca con `data-escena="E2"`, o con varias separadas por coma. `ui.js` oculta los que no
corresponden con **`data-escena-off`** — un atributo propio, **no `hidden`**: las solapas y el
conmutador de vista usan `hidden` y se pisarían. Así componen.

## El contrato de URL

`index.html` tiene la tabla completa enlazada — **es el índice canónico** y hay que actualizarlo si se
agrega una pantalla o un estado.

| Param | Valores |
|---|---|
| `?sup=` | `BAK` (default) · `FRT` · `CRM` |
| `?m=` | Cualquiera de los 13: `0`, `10`, `20` … `95`, `R01` |
| `?v=` | Cualquiera de los 55: `BAK-M30.050`. También lo lee `escritura.html`, que es **por video** |
| `?tab=` | `ficha` (default) · `versiones` · `guion` · `preguntas` · `ubicaciones` |
| `?tab=` | También lo lee `modulo.html` (D-20): `contenido` (default) · `banco`. Un valor que no es ninguno de los dos avisa en vez de mostrar otra vista con el rótulo cambiado |
| `?vista=` | `tabla` (default) · `kanban` — tablero |
| `?escena=` | `E1` … `E6` — sin parámetro, `E5` |
| `?paso=` | `1` · `2` · `resultado` — importador. **Ya no hay pasos 3 ni 4** |
| `?sello=` | El sello de una importación — `importador.html?paso=resultado`. Sin él, la pantalla de resultado no tiene qué mostrar y arranca en el paso 1 |
| `?sup=` | También lo lee `alta-modulo.html`, para arrancar en la superficie que se venía mirando |
| `?m=` | También lo leen `alta-seccion.html` y `alta-videos.html`, para precargar el módulo padre |
| `?seccion=` | El **título** de una sección del `?m=`, URL-encodeado — `alta-videos.html?m=30&seccion=Carga%20y%20proceso`. Precarga esa sección en todas las filas del lote. Lo emite cada sección del árbol de `modulo.html`. **Precargar no es atar:** la columna «Sección» sigue estando y el lote sigue pudiendo cruzar secciones, porque el cohorte agrupa por escenario. Si el título no existe en el módulo, se ignora; al cambiar de módulo, se suelta |
| `?v=` | `escritura.html?v=BAK-M30.050` — la sesión de escritura de preguntas de un video |
| `?config=1` | Abre la configuración de evaluación — `banco.html` |
| `?guia=` | `1` abre la guía paso por paso sobre el `?m=` de la pantalla · `0` la cierra **y suprime el auto-arranque**, para compartir un link sin ella. Solo en las 7 pantallas del flujo |
| | La guía **no apaga ningún control de la app** (D-16): su única compuerta es su propia «Siguiente», que no habilita hasta que el control actual esté completo o correcto |
| `?reset=1` | **Borra el overlay de `localStorage`.** Vuelve al dataset limpio, en cualquier pantalla |

> **Después de mutar, recargá con `UI.recargar()`, nunca con `location.reload()`.** Descarta
> `reset=1` de la URL: recargar con ese parámetro puesto borra el cambio que se acaba de guardar, y
> el usuario ve que no pasó nada.

`design-system.html` tiene la tabla de **decisiones abiertas**, que hay que mantener sincronizada.

## Las reglas de diseño que están cableadas

Salieron de tres rondas de revisión del wireframe. **Romperlas es un error, no una variación.**

| # | Regla |
|---|---|
| R1 | **No hay carga de archivos de video.** Los videos viven en YouTube: link → «Traer datos» → validación de embebido → confirmar. **Nunca un dropzone** |
| R2 | **La zona de identidad del video va deshabilitada, con candado.** ID, superficie, módulo y secuencia no se editan después del alta: el ID sobrevive al regrabado |
| R3 | **Estado de producción y visibilidad en el Front son dos controles separados.** El interruptor se habilita solo si el estado es `publicado`. En el kanban la visibilidad viaja como chip dentro de la tarjeta, **nunca como columna** |
| R4 | **Los contadores del banco se ven siempre**, durante toda la carga. No aparecen como error al final |
| R5 | **Tablas antes que tarjetas**, con **una excepción declarada**: en el tablero la tabla es el default y el kanban un conmutador, pero en `modulos.html` el default es el **panel de carga con tarjetas** —es la pantalla desde donde se gestiona cada módulo, y la tarjeta lleva el avance y las acciones que la fila no puede llevar—. La tabla sigue estando, en el otro lado del conmutador (D-13) |
| R6 | **Densidad alta.** Herramienta interna de uso diario para 3 a 5 personas. Sin onboarding, sin tours, sin whitespace decorativo |
| R7 | **Desktop, y todo el ancho de la ventana.** El wireframe se dibujó en 1440 px, pero eso es la medida en la que se dibujó, no un techo: es una herramienta interna que necesita meter la tabla más ancha posible en pantalla. **Sigue sin haber responsive —no hay un solo breakpoint—**: es un único lienzo fluido. El piso es 1160 px; por debajo scrollea. El sidebar de 200 px es lo único que no crece; el panel lateral de apoyo crece acotado con `clamp` |
| R8 | **La Ruta Esencial referencia videos, no los copia.** Su banco es *derivado* y se muestra etiquetado como tal |
| R9 | **El wireframe dibuja estados rotos, no ideales.** Hay que mantenerlos: el sorteo que no se puede cumplir, el módulo no apto, las preguntas a revisar |
| R10 | **El Home mide avance de construcción, no operación** — en E1 a E5. En esas cinco escenas no hay uso, así que no hay métricas de uso: lo único de operación permitido es «módulos activos» y «agencias con acceso». **E6 queda fuera del alcance de R10**, y es la única escena donde el uso existe y se puede medir |
| R11 | **Los videos nacen en `backlog`, sin link y sin versión.** El alta **nunca** pide un link de YouTube: son IDs reservados |
| R12 | **Ningún camino puede dejar la jerarquía incompleta.** Hay tres vías para crear contenido —import, alta de módulo, alta de videos— y ninguna permite un video sin sección ni un módulo de biblioteca sin secciones. La sección es estructural del lado agencia: con ella se arma el syllabus, el progreso parcial, el breadcrumb del reproductor y la devolución de la evaluación |
| R13 | **Si el dato ya está escrito en algún lado, se importa. Si nace del trabajo, se escribe en la pantalla donde ese trabajo ocurre.** Módulos, secciones, videos y cohortes se importan; estado, link, duración, versión y guión entran por las pantallas de producción; **las preguntas no se importan nunca** |

Los 7 estados de producción, en orden: `backlog` → `guionado` → `grabado` → `editado` → `publicado`
→ `a regrabar` → `obsoleto`.

`data-estado` lleva **el nombre exacto**, sin abreviar ni slugificar — incluido
`data-estado="a regrabar"`, con espacio. Ese vocabulario se copia a desarrollo. Los pasos del
importador usan `data-paso-estado`, para no pisar el atributo.

## Las reglas de negocio, y dónde viven

Todas en `academia-sim.js`. Ninguna en el HTML.

| Regla | Función |
|---|---|
| Estado del video en una escena | `estadoDe(video, escena)` — el hito más avanzado ya alcanzado |
| Visibilidad en el Front (R3) | `visibleEnFront()` — solo `publicado` o `a regrabar`; el obsoleto nunca |
| **Al pasar a `a regrabar` u `obsoleto`, las preguntas del video van a `a revisar`** | `estadoPregunta()` |
| Sorteo de 10 **con cuota por sección** | `sortear()` — no rellena de otra sección: mostraría un banco sano donde no lo hay |
| Banco de la Ruta, derivado (R8) | `resumenModulo()` — 5 preguntas × video publicado que referencia |
| Aptitud para activar, 4 criterios | `aptitud()` — compuerta al activar, no condición permanente (D-4) |
| Mínimo del banco solo si la evaluación está configurada | `resumenModulo()` — antes muestra `—`, no `0 de 50` |
| Deuda de evaluación | `deudaDeEvaluacion()` — publicados sin ninguna pregunta |
| Cadena de encadenamiento del cohorte | `cadenaDe()` — se deriva del orden de grabación, no se guarda |
| Recorrido de una agencia según su plan | `recorridoDe(plan)` — el denominador de todo cálculo de avance |
| Avance de una persona, **determinista** | `avanceDe()` — semilla estable por ID, nunca `Math.random()` |
| Configuración de evaluación del módulo | `configEvaluacion()` — hito del dataset, o lo que guardó el overlay |
| La prioridad la define el cohorte | `conEstado()` — al cambiar el cohorte, la prioridad lo sigue |
| **Estado de carga de un módulo** | `estadoDeCarga()` — el chip se resuelve en cascada: `sin empezar` → `faltan videos` → `faltan publicar` → `faltan preguntas` → `completo`. El primero que da verdadero gana, así que la etiqueta dice qué hacer AHORA y no qué falta en general |
| **Los cinco pasos del módulo** | `pasosDeModulo()` — `hecho` si su condición se cumple; `en curso` es el primero no hecho y el único resaltado; el resto, `todavía no`. **El resaltado orienta, no da permiso**: un paso se apaga por MOTIVO, nunca por posición |
| Los IDs existen desde que se reservó el mapa | `mapaCargadoEn` — hito de reserva del módulo. Sin él, E1 contaba 55 videos en la escena que se define como «nada cargado» |
| **Orden de una sección** | `ordenDeSeccion()` — la secuencia más baja de sus videos. Verificado: reproduce las 31 del dataset. Hace que ordenar la planilla por ID no pueda romper el syllabus. Una sección recién creada no tiene videos, así que ahí manda su `orden` explícito. La pantalla lo dice: el árbol de secciones lleva el rótulo de dónde sale ese orden, porque un orden que no se puede cambiar y no se explica se lee como un bug. En la Ruta no se pinta —ahí el orden lo da el cohorte (R8)—. |
| **Cuota de preguntas de un video** | `cuotaDeVideo()` — el mínimo de su sección repartido entre sus videos. **Orientativa:** lo exigible sigue siendo el mínimo por sección. **No es 10 parejo: va de 5 a 20** |
| **Cola de escritura** | `colaDeEscritura()` — la unidad de trabajo es el VIDEO. Tres motivos en orden de urgencia: `sin preguntas` · `bajo cuota` · `a revisar`. **No lista lo que todavía no se publicó** |
| **Los videos que esperan su link** | `sinLink()` — ID reservado y sin versión vigente, filtrado por estado anterior a `publicado` y por el hito de reserva del módulo. Es lo que hace que R11 deje de ser un obstáculo: el alta no pide link porque cargar el link es otra tarea |
| ID de la próxima pregunta | `proximoIdPregunta()` — se deriva del banco, no del reloj. Lo usan el modal del banco y la sesión de escritura |
| **Dónde quedó la guía** | No es una regla nueva. La etapa es el paso `en curso` de `pasosDeModulo()` y, dentro de ella, el control vigente es **el primero que no está listo**. La guía **no guarda progreso**, así que no puede desincronizarse si el módulo avanza desde otra pantalla o otra sesión |
| **«¿Este control está completo?»** | No vive en el motor: la guía lo **lee del DOM** que la pantalla ya pintó — `aria-invalid`, `[data-*-error]`, y el `disabled` + `title` del botón primario. Reimplementarlo daría dos redacciones para la misma regla, y la de la guía sería la que se queda vieja |
| **Dónde vive hoy un video (D-22)** | `seccionEfectiva(video, escenaId)` — el parche del overlay si existe **y nombra una sección real del módulo del video**, y si no la sección estructural (resuelta por ID, nunca por el campo del objeto recibido). La validación es lo que sostiene R12 aunque alguien escriba en el overlay sin pasar por la compuerta de la pantalla. La sección la POSEE el dataset, así que mover un video es la única mutación del overlay que cambia una pertenencia y no un atributo |
| **La compuerta de mover un video (D-22)** | `movible(video, escenaId)` — cierra en 0 preguntas ya alcanzadas para ese video. Vive en el motor y no en la pantalla, o `verificar()` no podría auditarla |

### Mutar el overlay

Cinco primitivas, todas en `academia-sim.js` y todas sobre **la escena activa**:

| Función | Qué hace |
|---|---|
| `anotar(tipo, id, campos)` | Cambia una entidad. `tipo` ∈ `videos` · `modulos` · `preguntas` · `cohortes` |
| `crear(tipo, entidad)` | Da de alta. `tipo` ∈ `modulos` · `secciones` · `videos` · `preguntas` · `superficies` · `cohortes` |
| `borrar(tipo, predicado)` | Solo borra lo creado en el overlay; el dataset no se toca |
| `anotado(tipo, id, escena)` | Lee el parche |
| `hayCambios(escena)` | Cuántos cambios tiene encima la escena |

Y cuatro más para el estado de la guía, que va en su **propia clave** —`academia:sim:guia:<escena>`—
y no dentro del overlay de entidades: aquel declara exactamente qué campos consume cada cálculo, y
abrir una guía no es un cambio sobre una entidad. Comparte el prefijo, así que **`?reset=1` la limpia
sola**. Un control de `verificar()` vigila que no se mude adentro.

| Función | Qué hace |
|---|---|
| `guia(escena)` | Lee el estado: `{modulo, activa, vista}` o `null` |
| `abrirGuia(codigo)` | Activa la guía sobre un módulo y marca `vista` |
| `cerrarGuia()` | Desactiva. **Conserva `vista`**, así que no vuelve a abrirse sola |
| `guiaVista(escena)` | Si ya se mostró en esta escena. Gobierna el auto-arranque |

**Lo creado se fusiona al cargar, una sola vez** (paso de materialización), y queda marcado con
`creadoEnOverlay`. Por eso una pantalla que da de alta **navega o recarga** en vez de re-indexar: así
el alta se ve igual viniendo de esta sesión o de otra.

**La materialización copia con `Object.assign`, no con literales.** Es lo que permite que una entidad
lleve campos propios encima —el sello de importación, por ejemplo— sin que se descarten en silencio.
Las secciones se armaban con un literal y perdían todo lo demás; ya no.

**Las formas que espera la materialización**, y no otras:

| Tipo | Forma | Dedup |
|---|---|---|
| `modulos` | `{numero, codigo, titulo, tipo, orden, planes, activadoEn, secciones: []}` | por `codigo` |
| `secciones` | `{codigoModulo, titulo, orden}` — **`orden` explícito**, no derivado | por `titulo` dentro del módulo |
| `videos` | `{codigoModulo, seccion, secuencia, titulo, cohorte, duracion, planes}` — **`seccion` por título** | por `secuencia` |
| `cohortes` | `{id, nombre, prioridad, escenario}` | por `id` |

Qué campos se leen del overlay, y nada más: `estado` y `visible` de un video, los cinco de
`EDITABLES` (título, cohorte, duración, planes, **sección**), `versiones`, `guion`, el `estado` de un
módulo y su `evaluacion`, el `estado` de una pregunta, y el `entorno` de un cohorte. **Escribir
cualquier otro campo persiste el JSON pero ningún cálculo lo consume.**

`seccion` es distinto de los otros cuatro de `EDITABLES`: no es un atributo del video, es su
**pertenencia** (D-22, mover un video a otra sección en lote). Tiene su propia compuerta —
`movible(video, escenaId)`, cierra solo con 0 preguntas ya alcanzadas— y su propio derivado,
`seccionEfectiva(video, escenaId)`, que devuelve el título de la sección donde el video vive hoy: el
parche del overlay si existe, y si no la sección estructural. Los mínimos **no siguen** al video
movido: los reparte `minimosDeSeccion()`, que es dato y lee la lista estructural; lo que se corre es
`cuotaDeVideo()`, que el motor ya declara orientativa.

Tres cosas que no se negocian al mutar:

1. **`verificar()` audita SIEMPRE el dataset limpio.** Levanta `ignorarOverlay`, así que el informe
   sigue midiendo el compromiso del prototipo y no la sesión. Con overlay activo antepone un control
   informativo (`ok: null`) y suma **cinco** de integridad sobre lo creado —el quinto exige que
   ningún video creado quede sin sección, que es la invariante de R12.
2. **Las reglas ganan sobre el overlay.** `visibleEnFront()` chequea `obsoleto` **antes** de leer el
   parche: un `{visible:true}` guardado no puede devolver al Front un video dado de baja (R3).
3. **Después de mutar hay que repintar.** No hay eventos: la pantalla llama a su función de render
   —el patrón es `tablero.html:396-398`— y si re-pintó un `tbody`, además a `UI.rebind()`, o la
   selección múltiple y los filtros quedan sin cablear.

**Por qué determinista:** con `Math.random()` el avance cambiaría en cada carga y el prototipo se
leería como si el dato se moviera solo. Alguien mostrando la pantalla en una reunión vería un número
distinto cada vez que refresca.

## La regla numérica que une todo

**Cada video tiene exactamente un estado.** De ahí salen los contadores del kanban, los tiles del
tablero y la columna «videos publicados / total» del listado de módulos. Los tres salen del mismo
cálculo, así que **ya no pueden discrepar**.

Las 5 cadenas de `BAK-M30`, en régimen:

| Cadena | Verificación |
|---|---|
| 1 · Preguntas por sección = total del módulo | `6 + 8 + 7 + 7 = 28` |
| 2 · Total − a revisar − borradores = banco vigente | `28 − 7 − 1 = 20` |
| 3 · Faltantes por sección = faltante del módulo | `6 + 7 + 6 + 11 = 30` |
| 4 · Banco mínimo por sección = mínimo del módulo | `11 + 15 + 13 + 11 = 50` |
| 5 · Mínimos por sorteo = preguntas del intento | `2 + 3 + 3 + 2 = 10` |

Y la regla que las une: **cuando un video pasa a `a regrabar`, todas sus preguntas vigentes pasan a
`a revisar`.** Por eso `BAK-M30.060` deja la sección 4 en 0 vigentes de 7, y por eso el sorteo saca
**8 de 10** en vez de 10.

> Las cadenas 3 y 4 cambiaron respecto de la tanda 1 (`15` y `35`): el mínimo del banco pasó de 35 a
> **50**, que es el que manda el alcance del MVP. Consecuencia visible: en E5 **ningún** módulo de
> biblioteca cubre su mínimo, y `BAK-M00`, `BAK-M10` y `BAK-M40` perdieron el chip `apto` — siguen
> `activo`, que es correcto por D-4.

## Datos: qué se puede tocar y qué no

**No inventar datos del proyecto.**

- **Los 55 videos** son los del mapa de contenido, con su ID permanente. Los títulos son los del
  backoffice: 41 coinciden con el repo agencia y **14 difieren**. En `BAK-M80.020` la divergencia es
  de tema, no de largo («Informe de ventas» vs. «Informe de vencimientos»): queda para reconciliar.
- **Las secciones de `BAK-M30`** son las del backoffice, no las del repo agencia: son las que
  sostienen las 5 cadenas. Las otras 27 salen del mapa de contenido.
- **Los 20 cohortes, su escenario compartido y las prioridades P1–P4** salen del **Maestro de
  Producción** (decisión B-1). Las recetas y el encadenamiento de P1 salen de
  `Majo_3_Cohorte_P1_guiones`, verbatim.
- **Prioridad P1 a P4:** son tandas de grabación del Pareto, **no urgencia**. Nunca Alta/Media/Baja.
- **`Majo_3_Cohorte_P1_guiones` escribe «SIGMA» con una sola M**, 10 veces. Al traer ese texto se
  escribe **SIGMMA**. El documento fuente está pendiente de corrección (B-2).
- **Los planes son Professional · Business · Corporate**, de `web.sigmma.net/planes.html`. Cierra D-3.
  `MD-PROYECTO-CLAUDE.md` escribe «Standard» donde va «Professional»: es un error del documento
  fuente (B-4). La vieja asignación «plan A / plan B» por módulo **no se renombró**: era arbitraria por
  admisión propia, así que se re-derivó del Maestro. Renombrarla habría disfrazado un dato inventado
  de dato real.
- **Fechas y versiones de producto:** solo las que el wireframe especifica. **No inventar fechas.**

Son de muestra, y se pueden tocar: los links de YouTube, los enunciados de las preguntas, las
duraciones de los videos, las cadenas de «última actividad», la persona del sidebar y **todo
`academia-agencias.js`** — las 12 agencias y las 56 personas son ficticias, sin CUIT, sin documentos
y sin credenciales.

### El banco de preguntas, en tres capas

550 preguntas: 50 por cada uno de los 11 módulos de biblioteca.

| Capa | Cuántas | Qué es |
|---|---|---|
| `reutilizada` | 48 | Verbatim del repo `academia-AGENCIA`, remapeadas al video que les corresponde |
| `escrita` | 64 | Las 9 de `banco.html` (enunciado verbatim, opciones nuevas) más las de los módulos que no tenían ninguna |
| `estructural` | 438 | Relleno hasta llegar a 50. Preguntan por la **estructura** del módulo, nunca por cómo funciona SIGMMA |

En la escena default hay **166 preguntas, 43 % escritas**. El relleno estructural va marcado y la
interfaz lo dice: **un banco completado con relleno no es un banco terminado.** Escribir las 550 reales
es trabajo de contenido, no de código.

`creadaEn` es la escena a partir de la cual la pregunta existe, y se resuelve por **cupo** por video.
Modelarlo así garantiza que el banco no pueda achicarse entre escenas: `0 → 10 → 60 → 166 → 550`.

## Verificación

### 1 · `SIM.verificar()` — 134 controles

Reemplaza los greps manuales de coherencia numérica. Corre en la consola del navegador o en node.
**Cargá también `academia-import.js` y `academia-guia.js`**, o los controles que dependen de ellos
se saltean (ver la tabla de conteos más arriba):

```bash
node -e 'global.window={};
  ["academia-data","academia-agencias","academia-guiones","academia-preguntas","academia-sim",
   "academia-import","academia-guia"]
    .forEach(f => require(process.cwd()+"/assets/js/"+f+".js"));
  const r = window.SIM.informe();
  process.exit(r.ok ? 0 : 1)'
```

Controla: los 55 videos en las 6 escenas · el conteo por estado de cada escena · **monotonía video por
video** · los 12 publicados de E4 y que ningún módulo de biblioteca esté completo · los mínimos de
banco y de sorteo por módulo · las 5 cadenas de `BAK-M30` · el acumulado de preguntas por escena · que
el banco no se achique · **que no haya operación antes de E6** · que ningún avance saltee módulos ·
que el uso simulado sea determinista.

Y los siete de la guía paso por paso: **que su mapa cubra exactamente las cinco etapas del motor más
el alta** —es lo único que detecta que se renombre un paso y la guía quede muda— · que ninguna etapa
quede sin texto · que toda etapa tenga al menos un control · que todo control declare pantalla,
ancla, título y detalle · que ningún control repita su ancla dentro de la etapa · que ningún control
redacte su propio motivo ni su destino · y que su estado no se mezcle con el overlay de entidades.

Y los seis de los flujos de alta: **que el orden de sección derivado de la secuencia mínima reproduzca
las 31 del dataset** · que ningún video quede sin sección · que ningún módulo de biblioteca quede sin
secciones · que la cuota por video sume el mínimo de su sección · que la cola no liste videos que no
llegaron a `publicado` · y la **ida y vuelta de la plantilla**.

Y los cinco de mover un video de sección (D-22): **que `seccionEfectiva()` coincida con la sección
estructural en los 55 sin overlay** · que siempre devuelva una sección real del módulo del video ·
que `seccionesDe()` devuelva los videos de cada sección ordenados por secuencia · que ningún video
con preguntas ya alcanzadas sea `movible()` · y que el fallback de `seccionEfectiva()` resuelva por
ID en el padrón estructural y no por el campo `seccion` del objeto que le llega.

> **La ida y vuelta no prueba que se creen los 55.** En el prototipo los 55 existen en TODAS las
> escenas —la escena cambia el estado, no la existencia—, así que importar el mapa completo los
> **omite**, y eso es el alta incremental funcionando. Lo que prueba es que las seis columnas
> alcancen: que lo emitido se relea sin un error y reconstruya módulo, sección, título y cohorte.

### 2 · Disciplina del design system

`design-system.html` se excluye: ahí los hex son contenido legítimo. `docs/` queda fuera de estos
greps por el mismo motivo que `app-shell.html` no se sirve: los globs de raíz (`*.html`,
`assets/js/*.js`, `src/`) no lo alcanzan, y está bien que no lo alcancen — es material de spec y
tiene que quedar **verbatim**. `docs/html-model-simplificacion.html` tiene 34 hex sueltos, dos
`type="url"` y el error B-4 de «Standard» por «Professional»: son del documento fuente, no del
prototipo, y "corregirlos" ahí falsificaría la cita.

```bash
PAGS=$(ls *.html | grep -v design-system.html)

grep -n "font-medium\|font-semibold" $PAGS                 # → vacío
grep -nE "#[0-9a-fA-F]{6}\b" $PAGS | grep -v href=         # → vacío
grep -nE "#[0-9a-fA-F]{6}\b" assets/js/*.js                # → vacío
grep -noE "\b(bg|text|border)-(red|blue|green|slate|sky|amber|emerald)-[0-9]{2,3}" $PAGS  # → vacío

# Nomenclatura. Cuatro archivos citan «SIGMA» ENTRECOMILLADO para enunciar la regla o para
# documentar el error del documento fuente (B-2/B-4). Citar no es usar, así que se excluyen
# las comillas angulares — que es justamente lo que marca la diferencia:
grep -rn "SIGMA[^M]" *.html *.md assets/js/ src/ | grep -v SIGMMA | grep -v '«SIGMA»'   # → vacío

# Sigue sin backend
grep -n "fetch(\|XMLHttpRequest" assets/js/*.js *.html              # → vacío
# `localStorage` SOLO en el motor
grep -ln "localStorage" assets/js/*.js                              # → academia-sim.js

# R10 · el uso solo existe donde hay uso. Ya no hay pantalla que lo muestre —medirlo
#       quedó fuera del MVP—, pero la regla sigue viva en el motor: 15 de los 129
#       controles verifican que no haya operación antes de E6.
# R11 · ninguna pantalla de alta pide un link
grep -nE '<(input|textarea)[^>]*(type="url"|link|youtu)' alta-videos.html importador.html  # → vacío
# R12 · ninguna vía deja un video sin sección. Lo verifica el motor, no el grep:
#       los controles «Ningún video sin sección» y «Overlay · ningún video creado quedó sin sección»

# Ningún link apunta a una pantalla que no existe. Es el control que faltaba, y el
# recorte del MVP es lo que lo hizo evidente: un href a un archivo borrado NO da error
# en ningún lado —el 404 llega recién cuando alguien lo clickea— y `verificar()` audita
# el dato, no la navegación, así que los 129 controles siguen en verde igual.
# Se excluye `planes.html`, que es web.sigmma.net y es externo, y `app-shell.html`, que
# es el partial y no se sirve. Anclar a `href` es lo que evita el falso positivo de
# `f.html`, que en render.js es el acceso a una propiedad y no un nombre de archivo.
mapfile -t PAGS < <(ls *.html)
grep -rhoE 'href *=? *["'"'"']?[a-z0-9-]+\.html' "${PAGS[@]}" assets/js/*.js \
  | grep -oE '[a-z0-9-]+\.html$' | sort -u \
  | grep -vE '^(planes|app-shell)\.html$' \
  | while read -r f; do [ -e "$f" ] || echo "COLGADO: $f"; done   # → vacío

# El CSS versionado está al día. Es el control que más falta hacía: una clase que el
# HTML usa y el CSS compilado no tiene NO da error en ningún lado — el navegador la
# ignora y la pantalla sale mal en silencio. Así se perdieron `gap-x-8`, `list-decimal`
# y `text-right`, entre otras.
npx tailwindcss -i ./src/input.css -o /tmp/chk.css --minify
cmp /tmp/chk.css assets/css/academia.css                            # → sin diferencias
```

> **`docs/` está excluido del escaneo, y tiene que seguir estándolo.** Tailwind v4 escanea
> el proyecto entero por su cuenta: los `@source` de `src/input.css` **suman, no reemplazan**.
> Los planes de ejecución citan nombres de clase dentro de bloques de código, así que sin el
> `@source not "../docs/**"` **editar un documento cambia el CSS compilado** y este control se
> pone rojo por una cita. Se probó `source(none)` para hacer autoritativa la lista de `@source`
> y es demasiado: borra ocho reglas que el compilado publica hoy.

> **Una clase que no compila no avisa: se ignora.** El `@theme` es cerrado, así que pedir
> `text-2xl` o `bg-blue-500` no rompe el build — simplemente no existe la regla. Si tocás el
> markup, el control de arriba es lo único que separa «recompilé» de «se ve raro y no sé por qué».

> **Cuidado con el idiom `cmd | grep -v X >/dev/null && …`.** Con entrada vacía y la salida redirigida
> a `/dev/null`, GNU grep devuelve 0 y el condicional se invierte. Capturá la salida y comprobá que
> esté vacía. Y **no pases `$PAGS` sin comillas a un `bash -c`** —ni lo metas en un `eval`—: las
> líneas se interpretan como comandos y **todos los controles dan ✓ porque el grep nunca corrió**.
> Con `mapfile -t PAGS < <(ls *.html …)` y `"${PAGS[@]}"` no pasa.

### 3 · Los 10 sidebars idénticos

```bash
for f in modulos.html modulo.html video.html tablero.html banco.html \
         importador.html alta-videos.html alta-modulo.html alta-seccion.html \
         escritura.html; do
  sed -n '/app-shell: sincronizar/,/<!-- \/app-shell -->/p' $f \
    | sed 's/ aria-current="page"//' | md5sum
done | sort -u | wc -l   # → 1
```

> **Ojo con el marcador de cierre.** `/\/app-shell/` matchea también la línea de
> apertura, porque ahí dice `src/partials/app-shell.html`: el rango se abre y se cierra
> en la misma línea y el `sed` devuelve un renglón. Hay que anclarlo al comentario
> completo, `<!-- \/app-shell -->`, o los diez hashes coinciden **por vacío**.

### 4 · Recorrido en el navegador

`google-chrome --headless=new --dump-dom`, con `--virtual-time-budget=1500` — sin eso, las capturas
agarran el render a mitad de camino. **Sin `.html` en la URL** (ver la nota de `serve@14`).

Vale la pena barrer todo, que es rápido y encuentra caídas: los **55** `video?v=` y `escritura?v=`,
los **13** `modulo?m=` y `banco?m=`, y las **6** escenas × 10 pantallas. Todas las URLs de
`index.html` tienen que dar 200.

**Tres recorridos que hay que manejar, no volcar:** importar la plantilla completa (omite las 55 y
deja el botón apagado con su motivo) · importar IDs nuevos, confirmar y volver a importar lo mismo
(la segunda vez omite todo) · escribir una pregunta en la sesión, salir y volver.

> **Al confirmar la importación con `npm run serve` se cae en el paso 1, no en el resultado.** No es
> un bug del importador: es la misma trampa de `serve@14` —el 301 sobre `.html` se come el query
> string— y afecta a cualquier navegación con parámetros del repo. Por `file://` funciona completo.
> Para probarlo servido, entrá al resultado por `/importador?paso=resultado&sello=…`, sin `.html`.

**Para probar lo que se clickea**, `--dump-dom` no alcanza: hay que manejar la página. Un banco de
pruebas de un archivo, servido desde el mismo origen, resuelve el problema sin sumar dependencias —
carga la pantalla en un `<iframe>`, le hace clicks reales y vuelca el resultado en un `<pre>` que
`--dump-dom` sí captura:

```html
<pre id="out"></pre><iframe id="f"></iframe>
<script>
  const cargar = (u) => new Promise((r) => {
    const f = document.getElementById("f");
    f.onload = () => setTimeout(() => r(f.contentWindow), 350);
    f.src = u;                        /* ¡sin `.html`! si no, se pierde el query */
  });
</script>
```

Dos trampas que cuestan una hora cada una: **las URLs del iframe también las redirige `serve@14`**,
así que `?v=…` se pierde y la prueba corre contra el default sin avisar; y **un `.click()` no mueve
el foco**, así que para probar que el modal lo devuelve hay que llamar a `.focus()` antes.

### 5 · Accesibilidad estructural

Un solo `<h1>` por pantalla, jerarquía sin saltos, `<img>` con `alt`, sin IDs duplicados, campos con
label, botones y links con nombre accesible.

> **Al auditar el DOM volcado, sacá primero los `<script>`.** El dump incluye su texto, y los
> templates del render se cuentan como markup real: da IDs duplicados y `<article>` de más que no
> existen. Y contá como nombrados los botones con `aria-label` y los inputs envueltos por su `<label>`.

## Git

Rama principal **`main`**. Commits en Conventional Commits, en español.
