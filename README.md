# Backoffice de la Academia SIGMMA — prototipo de alta fidelidad

Maquetación del backoffice de gestión interna de la Academia de Autocapacitación SIGMMA: donde el
staff carga los videos, gestiona el ciclo de vida del contenido y administra los bancos de preguntas.
La otra cara —la que usan las agencias— vive en el repo hermano **`wireframe-academia-AGENCIA`**.

El lenguaje visual sale de [`ESTILOS-ACADEMIA.md`](./ESTILOS-ACADEMIA.md), extraído de sigmma.net.

> **Es solo maquetación.** No hay backend, ni API, ni videos reales, ni SSO, ni persistencia. Los
> datos están escritos a mano en el HTML.

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
| **E5** | Régimen | La Academia en marcha. Es lo que maquetó la primera tanda |

Se recorre con **`?escena=E1..E4`**. Sin parámetro, todas las pantallas abren en **E5**.

**Los datos de una escena nunca se mezclan con los de otra**, y las sumas cierran dentro de cada una.
Si se pide una escena que una pantalla no maqueta, **avisa** en vez de mostrar los datos de otro
momento con el rótulo cambiado.

### Monotonía temporal

Las cinco escenas son una **línea de tiempo**, no cinco variantes sueltas. De ahí sale la regla que
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

---

## Las pantallas

`index.html` tiene el índice completo, agrupado por escena. Lo esencial:

### Etapa 0 · sistema vacío (E1)

| Pantalla | URL |
|---|---|
| **Home — panel de obra vacío** | `home.html?escena=E1` |
| **Importador de carga inicial** | `importador.html?paso=1..4` · `?paso=resultado` |
| Listado de módulos — vacío | `modulos.html?escena=E1` |
| Alta de módulo · de sección | `alta-modulo.html` · `alta-seccion.html` |
| Superficies y planes | `superficies.html` |

### Etapa 1 · mapa cargado (E2)

| Pantalla | URL |
|---|---|
| **Home — mapa cargado** | `home.html?escena=E2` |
| Listado — 13 filas, todo en backlog | `modulos.html?escena=E2` |
| **Alta masiva / reserva de IDs** | `alta-videos.html` |
| **Kanban — los 55 en una sola columna** | `tablero.html?escena=E2&vista=kanban` |

### Etapa 2 y 3 · guionado y grabación (E3)

| Pantalla | URL |
|---|---|
| **Editor de guión y receta** | `guion.html?v=BAK-M30.050&escena=E3` |
| **Hoja de cohorte — planificación** | `cohorte.html?c=C03&escena=E3` |
| **Hoja de cohorte — sesión de grabación** | `cohorte.html?c=C03&escena=E3&modo=sesion` |
| Tablero — avance mixto entre cohortes | `tablero.html?escena=E3` |
| Video `editado`, sin link todavía | `video.html?v=BAK-M10.020&escena=E3` |

### Hito de lanzamiento (E4)

| Pantalla | URL |
|---|---|
| **Home — Ruta Esencial apta** | `home.html?escena=E4` |
| **Detalle de la Ruta — apta para activar** | `modulo.html?m=R01&escena=E4` |

### Régimen (E5) — la primera tanda

`modulos.html` · `modulo.html?m=30` · `video.html?v=BAK-M30.050` (+ `&tab=`) · `tablero.html`
(+ `?vista=kanban`) · `banco.html?m=30` · `design-system.html#shell`

### Los cuatro flujos

- **F5 · Arranque en frío** — home vacío → importador (4 pasos) → 13 módulos creados
- **F6 · Guionar un cohorte** — hoja de C03 → editor de guión → tablero
- **F7 · Sesión de grabación** — modo sesión → video editado
- **F8 · Camino al lanzamiento** — home E3 (falta) → home E4 (apta) → detalle de la Ruta → activar

**F8 es el que responde cuándo se puede lanzar la Academia**, y el más valioso para negocio.

### Contrato de URL

| Param | Valores |
|---|---|
| `?escena=` | `E1` · `E2` · `E3` · `E4` — sin parámetro, E5 |
| `?sup=` | `BAK` *(default)* · `FRT` · `CRM` |
| `?m=` | `0`, `10`, `20` … `95`, `R01` |
| `?v=` | `BAK-M30.050` |
| `?tab=` | `ficha` *(default)* · `versiones` · `guion` · `preguntas` · `ubicaciones` |
| `?vista=` | `tabla` *(default)* · `kanban` — tablero |
| `?modo=` | `planificacion` *(default)* · `sesion` — hoja de cohorte |
| `?paso=` | `1` · `2` · `3` · `4` · `resultado` — importador |
| `?c=` | `C03` — cohorte |

---

## El contenido es el real del mapa

**11 módulos BAK y los 55 videos con su ID permanente**, del mapa de contenido
(`Estrategia_Grabado_..._pareto_v2`), más la Ruta Esencial `BAK-R01` y el ID reservado `BAK-M35`.

**Los 20 cohortes (C01–C20) y las prioridades P1–P4 salen del Maestro de Producción**, con su
escenario compartido. **Las recetas y el encadenamiento de los guiones de P1** salen de
`Majo_3_Cohorte_P1_guiones`, verbatim.

Son de muestra: las fechas, los links de YouTube, los enunciados de las preguntas y la persona del
sidebar.

### Convenciones de dato

- **Prioridad `P1` a `P4`:** tandas de grabación del Pareto, **no urgencia**.
- **Planes:** «plan A» y «plan B», **placeholder deliberado** — el diccionario real es una decisión abierta.
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
│   └── js/  icons.js  ui.js       set de iconos + comportamiento de interfaz
├── index.html                     índice, agrupado por escena
├── home.html                      panel de obra, en 5 escenas
├── importador.html  alta-videos.html  alta-modulo.html  alta-seccion.html
├── cohorte.html  guion.html  superficies.html
├── modulos.html  modulo.html  video.html  tablero.html  banco.html
└── design-system.html             catálogo, escenas y decisiones abiertas
```

**El sidebar está duplicado en las 13 páginas de app**, a propósito: así los `.html` se abren con
doble click. La versión canónica es `src/partials/app-shell.html`, y cada copia está delimitada por
`<!-- app-shell: sincronizar … -->`. El control es que el bloque, sin el `aria-current`, dé el mismo
hash en todas.

---

## Diferencias con el repo de la vista agencia

| Punto | Vista agencia | Backoffice | Por qué |
|---|---|---|---|
| **Datos** | `mock-data.js` con reglas de negocio | **Hardcodeados en el HTML** | Aquel tiene estado real; este es maquetación |
| **Chrome** | Header horizontal de 72 px, 3 destinos | **Sidebar de 200 px**, 16 destinos en 6 grupos | No entran en una barra |
| **Responsive** | 3 breakpoints | **1440 px fijo** | Fuera de alcance |
| **JS** | 6 archivos con máquinas de estado | **2 archivos**, sin lógica de negocio | Solo escenas, solapas, conmutadores y menús |
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
| 1 | **Tabla y kanban completos** | Los 55 videos en las 4 escenas, no un extracto: cada contador es contable en el DOM |
| 2 | **Fechas y versiones** | Solo las que el wireframe especifica; el resto vacías |
| 3 | **Detalle de módulo y video** | Cada escena maqueta el ejemplo que le da sentido: `BAK-M30` en régimen, la Ruta en el hito, `BAK-M10.020` en E3 |
| 4 | **El importador es un flujo, no una escena** | Su eje es `?paso=`, porque se usa el día 0 y también después |
| 5 | **Los estados vacíos son escenas** | No hay un `?state=empty` aparte: el estado vacío *es* la pantalla en E1 o E2 |

Las **decisiones abiertas** (A-1 a A-5, D-1 a D-9) están en la tabla de
[`design-system.html`](./design-system.html#decisiones).

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
- **Las 4 escenas cierran:** E2 los 55 en backlog · E3 `2+6+4+43 = 55` · E4 publicados por módulo
  `2+3+3+3+1 = 12` y banco 60 · E5 `14+4+2+2+29+3+1 = 55` · y en E4 **ningún módulo de biblioteca
  queda completo**, que es el argumento de la Ruta Esencial.
- **Los mismos 55 IDs en las 4 escenas:** ninguno aparece ni desaparece, solo cambia el estado.
- **Monotonía temporal: cero retrocesos.** Los 55 videos, video por video, cumplen
  E2 ≤ E3 ≤ E4 ≤ E5 según el orden de avance. Los 12 de P1 están publicados en E4 **y** en E5, y la
  Ruta Esencial va de apta (E4) a activa (E5) con 12 / 12 videos y banco 60 / 60 en las dos.
- **Los 7 contadores del kanban suman 55 en cada escena**, y coinciden con las tarjetas reales y con
  las filas de la tabla, estado por estado.
- **Los 7 valores de `data-estado`** son exactamente los 7 nombres del vocabulario. Los pasos del
  importador usan `data-paso-estado`, así que no hay colisión.
- **Las 5 cadenas de `BAK-M30`** siguen cerrando en régimen: 28 / 20 / 15 / 35 / 10.
- **R10:** `home.html` no contiene métricas de uso. **R11:** ninguna pantalla de alta tiene campo de
  link de YouTube.
- **Los 6 estados vacíos** de las pantallas ya maquetadas, cada uno con su explicación y una sola
  acción posible.
- **Sin `font-medium`/`font-semibold`, sin hex sueltos, sin clases de la paleta default.**
- **Sin apariciones de «SIGMA»** en la superficie del producto.
- **Sin `fetch`, sin `localStorage`, sin lógica de negocio** en el JS.
- **Contraste WCAG AA** de todos los pares nuevos, incluidos los 7 segmentos del embudo.
- Un solo `<h1>` por pantalla, jerarquía sin saltos, `<img>` con `alt`, sin IDs duplicados, campos con
  label, botones y links con nombre accesible.
- **Los 13 sidebars idénticos**, verificado por hash.

Queda para probar a mano: el recorrido de teclado completo y `prefers-reduced-motion`.

---

## Fuera de alcance

- Los destinos del sidebar que este bloque no cubre: **Cola de regrabación, Biblioteca de videos,
  Matriz perfil × módulo, Impactos en Academia, Panel macro, Detalle por agencia, Usuarios y roles,
  Auditoría**. Se listan sin ser links.
- Backend, persistencia, y la **importación real de CSV**: el importador simula sus cuatro pasos, no
  parsea un archivo.
- Responsive: 1440 px fijo.
- La subida de archivos de video. Los videos viven en YouTube.
