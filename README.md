# Backoffice de la Academia SIGMMA — prototipo funcional

Maquetación del backoffice de gestión interna de la Academia de Autocapacitación SIGMMA: donde el
staff carga los videos, gestiona el ciclo de vida del contenido y administra los bancos de preguntas.
La otra cara —la que usan las agencias— vive en el repo hermano **`academia-AGENCIA`**.

El lenguaje visual sale de [`ESTILOS-ACADEMIA.md`](./ESTILOS-ACADEMIA.md), extraído de sigmma.net.

> **No hay backend, ni API, ni videos reales, ni SSO.** Pero sí hay una **academia completa
> simulada**: los datos viven en una capa propia de JS, los agregados se derivan de ella y los cambios
> persisten en `localStorage`. `?reset=1` vuelve al dataset limpio en cualquier pantalla.
>
> Eso revierte a propósito una decisión de la primera tanda, que tenía el dato escrito a mano en el
> HTML. El motivo: los 55 IDs aparecían **1.320 veces** solo en `tablero.html`, y cambiar el estado de
> un video obligaba a recalcular unos 30 números en 4 archivos. Hoy nada de eso se escribe.

---

## El concepto de escena

Cada vista declara **en qué momento de la construcción de la Academia está el sistema**. Es lo que
corrige el problema silencioso de la primera tanda: dibujó el sistema *en régimen* sin declararlo, y
eso podía llevar a desarrollo a priorizar como si el estado normal fuera el de dentro de un año.

| Escena | Momento | Qué se ve |
|---|---|---|
| **E1** | Día 0 | Nada cargado. Un solo camino posible: importar el mapa |
| **E2** | Semana 1 | 55 IDs reservados en `backlog`. Nada grabado, 0 preguntas |
| **E3** | Mes 1 | C01 publicado, C02 editado, C03 guionado. El resto en backlog |
| **E4** | Mes 2 | **El hito:** los 12 de P1 publicados, Ruta Esencial apta |
| **E5** | Régimen *(default)* | La Academia en marcha. Es lo que maquetó la primera tanda |
| **E6** | En operación | **La Academia completa, con uso:** los 11 módulos activos, bancos de 50 preguntas y 12 agencias usándola |

Se recorre con **`?escena=E1..E6`**. Sin parámetro, todas las pantallas abren en **E5**.

**Los datos de una escena nunca se mezclan con los de otra**, y las sumas cierran dentro de cada una.
Si se pide una escena que una pantalla no maqueta, **avisa** en vez de mostrar los datos de otro
momento con el rótulo cambiado.

### Monotonía temporal

Las seis escenas son una **línea de tiempo**, no seis variantes sueltas. De ahí sale la regla que
las mantiene consistentes:

> **Entre escenas sucesivas, el estado de un video solo puede avanzar.** Las únicas excepciones son
> `a regrabar` y `obsoleto`, que son estados posteriores a `publicado`.

Orden de avance: `backlog` → `guionado` → `grabado` → `editado` → `publicado` → `a regrabar` /
`obsoleto`.

Vale igual para todo contador **derivado**: el banco de la Ruta Esencial hereda de sus 12 videos y no
puede bajar entre dos momentos sucesivos sin que alguien haya borrado preguntas; un módulo que ya se
activó sigue activo en la escena siguiente. Sin esta regla, E5 deja de ser posterior a E4 y el flujo
**F8 · camino al lanzamiento** pierde continuidad justo en el tramo que le da sentido.

---

## Cómo verlo

**Sin instalar nada.** Abrí `index.html` con doble click. El CSS compilado está versionado en
`assets/css/academia.css`, así que el prototipo funciona sobre `file://`.

```bash
npm install
npm run dev      # recompila al guardar src/input.css
npm run build    # compilado minificado para entregar
npm run serve    # servidor local en http://localhost:4321 (opcional)
```

Si tocás `src/input.css`, **recompilá y commiteá el CSS**: está versionado a propósito.

> **Con `npm run serve`, usá las URLs sin `.html`.** `serve@14` redirige `/tablero.html` a `/tablero`
> con un 301 que **descarta el query string**, así que `/tablero.html?escena=E6` renderiza E5 sin
> avisar. Sobre `file://` no pasa: ahí el `.html` va y los parámetros llegan.

**Para verificar el dataset sin navegador**, el motor corre en node:

```bash
node -e 'global.window={};
  ["academia-data","academia-agencias","academia-guiones","academia-preguntas","academia-sim",
   "academia-import"]
    .forEach(f => require(process.cwd()+"/assets/js/"+f+".js"));
  process.exit(window.SIM.informe().ok ? 0 : 1)'
```

Son **115 controles**: los 55 videos en las 6 escenas, la monotonía video por video, las 5 cadenas del
banco, el acumulado de preguntas, que no haya operación antes de E6 y que el uso simulado sea
determinista. Más los seis de los flujos de alta: el orden de sección derivado, que ningún video quede
sin sección, que ningún módulo de biblioteca quede sin secciones, la cuota por video, la cola, y la
ida y vuelta de la plantilla del importador.

Sin cargar `academia-import.js` son **113**: los dos de la ida y vuelta se saltean, porque el motor no
depende del importador.

---

## Las pantallas

`index.html` tiene el índice completo, agrupado por escena. Lo esencial:

### Etapa 0 · sistema vacío (E1)

| Pantalla | URL |
|---|---|
| **Panel de módulos — día 0** | `modulos.html?escena=E1` |
| **Importador del mapa** | `importador.html?paso=1` · `?paso=2` · `?paso=resultado&sello=…` |
| Listado de módulos — vacío | `modulos.html?escena=E1` |
| Alta de módulo *(con sus secciones)* · de sección | `alta-modulo.html` · `alta-seccion.html` |

### Etapa 1 · mapa cargado (E2)

| Pantalla | URL |
|---|---|
| **Panel de módulos — mapa cargado** | `modulos.html?escena=E2` |
| Listado — 13 filas, todo en backlog | `modulos.html?escena=E2` |
| **Alta masiva / reserva de IDs** | `alta-videos.html` |
| **Kanban — los 55 en una sola columna** | `tablero.html?escena=E2&vista=kanban` |

### Etapa 2 y 3 · guionado y grabación (E3)

| Pantalla | URL |
|---|---|
| Tablero — avance mixto entre cohortes | `tablero.html?escena=E3` |
| Video `editado`, sin link todavía | `video.html?v=BAK-M10.020&escena=E3` |
| Guión del video, en su solapa | `video.html?v=BAK-M30.050&tab=guion&escena=E3` |

La hoja de cohorte y el editor de guión quedaron fuera del MVP (D-17). El guión **se lee** en la
solapa del video; escribirlo pasa a ser trabajo de contenido fuera del backoffice.

### Hito de lanzamiento (E4)

| Pantalla | URL |
|---|---|
| **Panel — Ruta Esencial apta** | `modulos.html?escena=E4` |
| **Detalle de la Ruta — apta para activar** | `modulo.html?m=R01&escena=E4` |

### Régimen (E5)

`modulos.html` · `modulo.html?m=30` · `video.html?v=BAK-M30.050` (+ `&tab=`) · `tablero.html`
(+ `?vista=kanban`) · `banco.html?m=30` · `escritura.html?v=BAK-M30.050` · `design-system.html#shell`

### En operación (E6)

`modulos.html?escena=E6` · `tablero.html?escena=E6` · `banco.html?m=00&escena=E6` ·
`modulo.html?m=30&escena=E6`

**Medir el uso quedó fuera del MVP** (D-17): las tres pantallas que lo mostraban salieron. El dato
sigue en el dataset y **R10 sigue custodiado por el motor** —15 de los 129 controles verifican que no
haya operación antes de E6—, pero ya no hay pantalla que lo muestre.

### Los cinco flujos

- **F5 · Arranque en frío** — panel vacío → importador (2 pasos) → 13 módulos creados
- **F6 · Guionar un cohorte** — hoja de C03 → editor de guión → tablero
- **F7 · Sesión de grabación** — modo sesión → video editado
- **F8 · Camino al lanzamiento** — home E3 (falta) → home E4 (apta) → detalle de la Ruta → activar
- **F9 · Crear un módulo, paso por paso** — la guía, control por control, atravesando las 7 pantallas

**F8 es el que responde cuándo se puede lanzar la Academia**, y el más valioso para negocio.

### La guía paso por paso

El tablero de `modulo.html` ya decía **qué falta** para completar un módulo. Lo que no había era nada
que acompañe **la ejecución**: dónde escribir, qué va en cada campo, qué apretar después.

**Un paso de la guía es UN CONTROL** —este `select`, este `input`, este botón—, no una etapa. Son
**34 controles** repartidos en las 7 pantallas, numerados dentro de su etapa para que el número
coincida con el del tablero: «paso 2 de 5 · Videos — 5 de 10».

Se abre **sola la primera vez** de cada escena —en el alta de un módulo y en el detalle de un módulo
sin terminar— y después se retoma con **«Retomar la guía»**. Resalta el control con un velo recortado
y explica qué va ahí.

- **Señala y explica. No escribe ni aprieta nada:** el tipeo y el clic son de la persona.
- **No apaga ningún control de la app.** Ninguno. Las 7 pantallas se comportan igual con la guía
  abierta que sin ella. Es la decisión **D-16**, que revirtió la vía contraria.
- **Su única compuerta es su propia «Siguiente»**, que no habilita hasta que el control actual esté
  completo o correcto. Los campos con default —superficie, tipo, planes, orden— se explican pero
  **no traban**.
- **El veredicto no lo inventa: lo lee del DOM que la pantalla ya pintó** — `aria-invalid`,
  `[data-*-error]`, y el `disabled` + `title` del botón primario. Así el motivo que muestra es
  literalmente el texto de la pantalla, y no pueden divergir.
- **No guarda progreso.** La etapa la da `pasosDeModulo()`; dentro de ella, el control vigente es el
  primero que no está listo. Todo derivado.
- `?guia=1` la abre; `?guia=0` la suprime, para compartir un link sin ella.

### Lo que se puede hacer, y queda guardado

El prototipo dejó de ser solo navegable: **toda acción que se ofrece se puede ejecutar**, y el cambio
persiste por escena en `localStorage`. `?reset=1` vuelve al dataset limpio.

| Dónde | Qué |
|---|---|
| `video.html` | Cambiar el estado entre los 7 · prender o apagar la visibilidad en el Front · editar título, plan, cohorte y duración · cargar una versión nueva · duplicar |
| `modulo.html` | **Activar y desactivar el módulo** — el final del flujo F8 · abrir la **guía paso por paso** |
| `tablero.html` | Cambiar el estado, asignar cohorte o mandar a la cola **en lote**, sobre la selección |
| `banco.html` | Configurar la evaluación · escribir una pregunta · filtrar por estado, sección y video |
| `escritura.html` | La sesión de escritura de preguntas, video por video |
| `alta-videos.html` | **Reservar IDs** de verdad — nacen en `backlog`, sin link y sin versión (R11) |
| `alta-modulo.html` · `alta-seccion.html` | Crear módulos y secciones |
| `importador.html` | Traer el mapa completo, revisarlo y crear la jerarquía |
| Listados | Filtrar, buscar y **exportar a CSV lo que está filtrado** |

Lo que **no** cambia nunca: el ID, la superficie, el módulo y la secuencia de un video. Es **R2** —
el ID sobrevive al regrabado y todo cuelga de él.

**Las reglas siguen mandando sobre el overlay.** Un video `obsoleto` no se puede volver visible en el
Front aunque se guarde que sí (R3); al pasar un video a `a regrabar` sus preguntas caen solas a
`a revisar` y el sorteo sale corto; y `SIM.verificar()` **audita siempre el dataset limpio**, así que
sigue diciendo la verdad aunque la sesión tenga cambios encima.

### Contrato de URL

| Param | Valores |
|---|---|
| `?escena=` | `E1` … `E6` — sin parámetro, **E5** |
| `?sup=` | `BAK` *(default)* · `FRT` · `CRM` |
| `?m=` | **Cualquiera de los 13:** `0`, `10`, `20` … `95`, `R01` |
| `?v=` | **Cualquiera de los 55:** `BAK-M30.050`. También `escritura.html`, que es por video |
| `?tab=` | `ficha` *(default)* · `versiones` · `guion` · `preguntas` · `ubicaciones` |
| `?vista=` | `tabla` *(default)* · `kanban` — tablero · en `modulos.html`, `tarjetas` *(default)* · `tabla` |
| `?paso=` | `1` · `2` · `resultado` — importador |
| `?sello=` | El sello de una importación — `importador.html?paso=resultado` |
| `?config=1` | Abre la configuración de evaluación — `banco.html` |
| `?guia=` | `1` abre la guía paso por paso · `0` la suprime — las 7 pantallas del flujo |
| `?reset=1` | **Borra el overlay de `localStorage`** y vuelve al dataset limpio, en cualquier pantalla |

---

## El contenido es el real del mapa

**11 módulos BAK y los 55 videos con su ID permanente**, del mapa de contenido
(`Estrategia_Grabado_..._pareto_v2`), más la Ruta Esencial `BAK-R01` y el ID reservado `BAK-M35`.

**Los 20 cohortes (C01–C20) y las prioridades P1–P4 salen del Maestro de Producción**, con su
escenario compartido. **Las recetas y el encadenamiento de los guiones de P1** salen de
`Majo_3_Cohorte_P1_guiones`, verbatim.

Son de muestra: las fechas, los links de YouTube, los enunciados de las preguntas y la persona del
sidebar.

### Qué está simulado, y se puede tocar

Son de muestra: los links de YouTube, los enunciados de las preguntas, las duraciones de los videos,
las cadenas de «última actividad» y la persona del sidebar.

Y **todo lo de las agencias es ficticio**: las 12 agencias y las 56 personas de
`assets/js/academia-agencias.js` no existen. No hay CUIT, ni documentos, ni credenciales, ni correos.

El banco tiene **550 preguntas** —50 por cada módulo de biblioteca— en tres capas:

| Capa | Cuántas | Qué es |
|---|---|---|
| `reutilizada` | 48 | Verbatim del repo `academia-AGENCIA` |
| `escrita` | 64 | Las 9 de `banco.html` más las de los módulos que no tenían ninguna |
| `estructural` | 438 | Relleno hasta 50. Preguntan por la **estructura** del módulo, nunca por cómo funciona SIGMMA |

En la escena default hay 166 preguntas, **43 % escritas**. El relleno va marcado y la interfaz lo
dice: un banco completado con relleno no es un banco terminado. Escribir las 550 reales es trabajo de
contenido, no de código.

### Convenciones de dato

- **Prioridad `P1` a `P4`:** tandas de grabación del Pareto, **no urgencia**.
- **Planes:** **Professional · Business · Corporate**, de `web.sigmma.net/planes.html` — **cierra D-3**.
  Lo que sigue siendo provisorio es la **asignación de planes por módulo**: la vieja «plan A / plan B»
  era arbitraria por admisión propia, así que se **re-derivó del Maestro de Producción** en vez de
  renombrarse. Renombrarla habría disfrazado un dato inventado de dato real.
- **IDs de video:** `BAK-M30.050`, de 10 en 10, para poder intercalar sin renumerar.
- **Los 7 estados:** `backlog` → `guionado` → `grabado` → `editado` → `publicado` → `a regrabar` → `obsoleto`.
  El atributo `data-estado` lleva **el nombre exacto**, sin abreviar ni slugificar — incluido
  `data-estado="a regrabar"`, con espacio. Ese vocabulario se copia a desarrollo: un estado no puede
  llamarse de una manera en la interfaz y de otra en el atributo. Los pasos del importador, que son
  otro vocabulario, usan `data-paso-estado` para no pisarlo.

---

## Estructura

```
├── ESTILOS-ACADEMIA.md            guía de diseño (fuente de verdad visual)
├── DESIGN-SYSTEM-EXTENSIONS.md    los 30 componentes nuevos y su justificación
├── package.json · netlify.toml · .gitignore
├── src/
│   ├── input.css                  @theme heredado íntegro + capa backoffice (sección 6)
│   └── partials/app-shell.html    fuente canónica del sidebar
├── assets/
│   ├── css/academia.css           compilado y versionado
│   ├── fonts/  img/logo.svg       de web-2026
│   └── js/
│       ├── icons.js               set de iconos SVG
│       ├── academia-data.js       EL DATASET · superficies, módulos, secciones, videos, cohortes
│       ├── academia-agencias.js   12 agencias y 56 personas · todo ficticio
│       ├── academia-guiones.js    los 12 guiones de P1, verbatim
│       ├── academia-preguntas.js  las 550 preguntas, en tres capas
│       ├── academia-sim.js        EL MOTOR · escenas, overlay, agregados, verificar()
│       ├── academia-import.js     la plantilla del mapa · solo en importador.html
│       ├── render.js              helpers de markup
│       ├── ui.js                  solapas, conmutadores, menús, orden de tabla
│       └── academia-guia.js       la guía paso por paso · las 7 pantallas del flujo
├── index.html                     índice, agrupado por escena
├── importador.html  alta-modulo.html  alta-seccion.html  alta-videos.html
│                                  las cuatro vías de creación
├── modulos.html  modulo.html  video.html
│                                  visualización · panel, detalle con los 5 pasos, ficha
├── tablero.html  banco.html  escritura.html
│                                  los pasos 2, 3 y 4 del módulo
└── design-system.html             catálogo, escenas y decisiones abiertas
```

Salieron ocho pantallas con el recorte del MVP: la biblioteca de videos, la cola de regrabación, la
hoja de cohorte, el editor de guión, el uso de la Academia, el listado y el detalle de agencias, y
superficies y planes. **El motor y el dataset quedaron intactos** —`academia-agencias.js` y
`academia-guiones.js` siguen cargando, porque `modulos.html` usa `operacion()` y `escritura.html` usa
`guionDe()`—, así que los **129 controles** de `verificar()` siguen en verde. Ver D-17.

**El sidebar está duplicado en las 10 páginas de app**, a propósito: así los `.html` se abren con
doble click. La versión canónica es `src/partials/app-shell.html`, y cada copia está delimitada por
`<!-- app-shell: sincronizar … -->`. El control es que el bloque, sin el `aria-current`, dé el mismo
hash en todas.

---

## Diferencias con el repo de la vista agencia

| Punto | Vista agencia | Backoffice | Por qué |
|---|---|---|---|
| **Datos** | `mock-data.js` con reglas de negocio | **Capa de datos propia**, con 550 preguntas y 12 agencias | Los dos tienen estado real. El dataset es distinto: acá manda el ciclo de producción, allá el recorrido del alumno |
| **Chrome** | Header horizontal de 72 px, 3 destinos | **Sidebar de 200 px**, 16 destinos en 6 grupos | No entran en una barra |
| **Responsive** | 3 breakpoints | **Un lienzo fluido, sin breakpoints** | Los dos son desktop. La agencia adapta el recorrido del alumno a varios tamaños; acá se usa todo el ancho de la ventana y no hay más de un layout |
| **JS** | 6 archivos con máquinas de estado | **10 archivos**: dataset, motor, render, UI, importador y guía | El motor deriva todos los agregados; nada se escribe a mano |
| **Planes** | Professional · Business | **Professional · Business · Corporate** | Cierra D-3 con los tres reales de `web.sigmma.net/planes.html` |
| **Naranja `#ff6b35`** | Una aparición: el certificado | **Ninguna** | Nada acá lo justifica |

El bloque `@theme` de `src/input.css` es **idéntico** al del repo hermano.

---

## Decisiones tomadas

### Los números se derivan de un solo dato

Los 55 videos tienen **un estado cada uno**, y de ahí salen los contadores del kanban, los tiles del
tablero y la columna «publicados / total» del listado. Eso destapó contradicciones del wireframe:

| Qué | Decía | Queda |
|---|---|---|
| `BAK-M10` publicados | 6 / 6 | **5 / 6** — `BAK-M10.050` está `obsoleto` |
| Columnas del kanban | sumaban 58 con 55 videos | **suman 55** |
| Los 12 de P1 en régimen | E4 los publicaba y E5 devolvía 3 a `editado`, `grabado` y `guionado` | **los 12 publicados también en E5** — `BAK-M20.030`, `BAK-M20.040` y `BAK-M40.010` |
| Banco de la Ruta Esencial | 60 / 60 en E4 y 18 / 60 en E5 | **60 / 60 en las dos**, y la Ruta queda **activa** en E5 |

Las dos últimas filas salen de la **monotonía temporal**: son retrocesos entre escenas sucesivas, y
un video —o un banco derivado— no retrocede solo.

### B-1 · Manda el Maestro de Producción

**8 de 9 cohortes de la primera tanda contradecían al plan de rodaje real.** Era tolerable cuando el
cohorte era una columna; dejó de serlo cuando pasó a ser una pantalla de trabajo con receta y
encadenamiento: si contradice el plan real, no sirve para grabar. Y el Maestro es el que tiene el
escenario de datos compartido de cada cohorte — el wireframe de baja fidelidad nunca los tuvo
especificados, se generaron por aproximación.

Los 55 videos —y sus prioridades— **quedaron alineados al Maestro**: `BAK-M30.030` va en C07, no en
C03. Los 12 de P1 conservan C01, C02 y C03 según `Majo_3_Cohorte_P1_guiones`, porque de eso dependen
las tres secciones de la Ruta Esencial y el modo sesión de la hoja de cohorte.

**D-7 queda cerrada**, y así figura en la tabla de decisiones de `design-system.html`.

### B-2 · El documento de guiones escribe «SIGMA»

10 apariciones con una sola M en `Majo_3_Cohorte_P1_guiones`, incluido el título de `BAK-M00.010`.
El prototipo escribe **SIGMMA**. **Conviene corregir el documento fuente.**

### B-3 · La posición de `BAK-M30.050` en la Ruta

Pasó de «9 de 12» a **«11 de 12»**: con las tres secciones de la Ruta (C01, C02, C03) cae en la 11.

### Otras

| # | Punto | Decisión |
|---|---|---|
| 1 | **Tabla y kanban completos** | Los 55 videos en las 6 escenas, no un extracto: cada contador es contable en el DOM |
| 2 | **Fechas y versiones** | Solo las que el wireframe especifica; el resto vacías |
| 3 | **Detalle de módulo y video** | Cada escena maqueta el ejemplo que le da sentido: `BAK-M30` en régimen, la Ruta en el hito, `BAK-M10.020` en E3 |
| 4 | **El importador es un flujo, no una escena** | Su eje es `?paso=`, porque se usa el día 0 y también después |
| 5 | **Los estados vacíos son escenas** | No hay un `?state=empty` aparte: el estado vacío *es* la pantalla en E1 o E2 |

Las **decisiones** (A-1 a A-5, D-1 a D-9) están en la tabla de
[`design-system.html`](./design-system.html#decisiones), con **D-2, D-3, D-7 y D-9 ya cerradas**.

---

## Las reglas

A las 9 reglas no negociables de la primera tanda se suman dos:

- **R10 · El Home mide avance de construcción, no operación.** En esta etapa no hay uso: no se
  inventan métricas de uso. Lo único de operación es «módulos activos» y «agencias con acceso».
- **R11 · Los videos nacen en `backlog`, sin link y sin versión.** El alta **nunca** pide un link de
  YouTube: son IDs reservados.

---

## Verificado

- **Compila** con `@tailwindcss/cli` 4.3.3, sin errores.
- **Las 5 escenas con dato cierran:** E2 los 55 en backlog · E3 `2+6+4+43 = 55` · E4 publicados por
  módulo `2+3+3+3+1 = 12` y banco 60 · E5 `14+4+2+2+29+3+1 = 55` · E6 `51+3+1 = 55` · y en E4
  **ningún módulo de biblioteca queda completo**, que es el argumento de la Ruta Esencial.
- **Los mismos 55 IDs en las 6 escenas:** ninguno aparece ni desaparece, solo cambia el estado.
- **Monotonía temporal: cero retrocesos.** Los 55 videos, video por video, cumplen
  E2 ≤ E3 ≤ E4 ≤ E5 ≤ E6 según el orden de avance. Los 12 de P1 están publicados en E4 **y** en E5, y la
  Ruta Esencial va de apta (E4) a activa (E5) con 12 / 12 videos y banco 60 / 60 en las dos.
- **Los 7 contadores del kanban suman 55 en cada escena**, y coinciden con las tarjetas reales y con
  las filas de la tabla, estado por estado.
- **Los 7 valores de `data-estado`** son exactamente los 7 nombres del vocabulario. Los pasos del
  importador usan `data-paso-estado`, así que no hay colisión.
- **Las 5 cadenas de `BAK-M30`** siguen cerrando en régimen: 28 / 20 / 30 / 50 / 10.
- **R10:** el uso solo existe donde hay uso. Medirlo quedó fuera del MVP, así que ya no hay pantalla
  que lo muestre, pero la regla vive en el motor: 15 de los 129 controles verifican que no haya
  operación antes de E6. **R11:** ninguna pantalla de alta tiene campo de link de YouTube.
- **Los 6 estados vacíos** de las pantallas ya maquetadas, cada uno con su explicación y una sola
  acción posible.
- **Sin `font-medium`/`font-semibold`, sin hex sueltos, sin clases de la paleta default.**
- **Sin apariciones de «SIGMA»** en la superficie del producto.
- **Sin `fetch`, sin `XMLHttpRequest`, sin módulos ES.** `localStorage` se usa, y **solo** en
  `academia-sim.js`: es el overlay de la simulación.
- **Contraste WCAG AA** de todos los pares nuevos, incluidos los 7 segmentos del embudo.
- Un solo `<h1>` por pantalla, jerarquía sin saltos, `<img>` con `alt`, sin IDs duplicados, campos con
  label, botones y links con nombre accesible.
- **Los 10 sidebars idénticos**, verificado por hash.
- **Ningún link apunta a una pantalla que no existe.** Es el control que faltaba: un `href` a un
  archivo borrado no da error en ningún lado, y `verificar()` audita el dato, no la navegación.

Queda para probar a mano: el recorrido de teclado completo y `prefers-reduced-motion`.

---

## Fuera de alcance

- Los **5 destinos del sidebar** que necesitan entidades que el dataset no tiene: **Configuración de
  evaluación** *(no hace falta como pantalla: se configura por modal desde el banco)*, **Matriz
  perfil × módulo**, **Impactos en Academia**, **Usuarios y roles** y **Auditoría**. Se listan sin
  ser links: un link que no lleva a ningún lado miente.
- **Reordenar por arrastre** (D-6): el asa `⠿` del árbol de secciones y las tarjetas del kanban
  entre columnas. Sigue siendo una decisión abierta.
- Backend. **La importación sí es real**: el importador emite la plantilla, lee el archivo con
  `FileReader` o lo pegado a mano, valida fila por fila y crea la jerarquía en el overlay. Lo que no
  hay es un servidor del otro lado.
- Responsive: no hay breakpoints. El lienzo usa el 100 % del ancho, con un piso de 1160 px por debajo
  del cual scrollea (R7).
- La subida de archivos de video. Los videos viven en YouTube (R1).
