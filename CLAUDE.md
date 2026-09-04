# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Qué es esto

Prototipo navegable de alta fidelidad del **backoffice de gestión de Academia SIGMMA** (staff que
carga contenido, administra bancos de preguntas, publica módulos y sigue el avance de las agencias).

**No hay build, ni dependencias, ni servidor, ni backend.** Todo el prototipo es un archivo:
`index.html` (CSS + markup + JS inline). Se abre con doble click y tiene que seguir funcionando
bajo `file://` — esa restricción explica varias decisiones del código (ver "Restricciones del
entorno"). La única dependencia externa es Google Fonts.

`README.md` es el documento funcional del prototipo: reglas de negocio, qué se deriva, qué es
ficticio y qué queda abierto. **Leerlo antes de tocar dato o reglas.**

## Comandos

```bash
xdg-open index.html          # ver el prototipo (o doble click)
node cotejo.js               # único control automático del repo
node cotejo.js /ruta/a/academia-AGENCIA   # si el repo hermano no está al lado
```

`cotejo.js` es el test de este repo: compara el dataset del backoffice contra el del prototipo
aprobado del lado agencia (`../academia-AGENCIA/assets/js/mock-data.js`) y sale con código 1 si
algún control queda en rojo. No hay selección de controles individuales: corre los 22 y se lee la
salida. **Correrlo después de cualquier cambio en `DATA`, en las secciones o en el banco.**

Los controles se dividen en cuatro: nueve cotejan el mapa de contenido contra el repo de la agencia,
tres los **planes** —que todo módulo declare planes válidos, que los planes propios de un video sean
un subconjunto *estricto* de los de su módulo (declarar los mismos es heredar, y escribirlo igual es
el estado redundante que hacía que «propio» significara dos cosas), y que los planes efectivos de
cada video sean los aprobados—, y siete el banco de preguntas —que llegue al mínimo, que los módulos que cada escena publica tengan
todos los temas cubiertos, IDs de pregunta únicos y con formato, `desde` válido, que el tema sea una
sección del propio módulo, que el video de repaso sea de ese mismo tema, y que los parámetros de cada
módulo respeten las reglas del MVP, incluida la decisión cerrada que sí tiene comportamiento
(`forzarCobertura:'si'`) y que ninguno declare `caducaAlRegrabar` ni `mostrarCorrectas`, los dos
campos que se eliminaron por no tener ninguno; es el reemplazo del candado que tenía la pestaña
«Configuración»—, y **dos los temas** —que los temas de cada módulo sean sus
secciones en el mismo orden, y que una sección agregada *después* de la carga inicial sea un tema en
el acto. Estos dos últimos existen por un bug concreto: el tema era un campo guardado, ver la
invariante 3.

Cómo lee el dato: `cotejo.js` corta `index.html` **desde `const GLOBAL={` hasta
`DATA.forEach(initMod);`** y hace `eval` de todo el bloque —parámetros globales, `DATA`, `HAND`,
`genPool` e `initMod`—, definiendo por su cuenta lo único que el bloque toma de afuera: `PLANES` y
`USERS`. Antes cortaba solo el literal de `DATA`, así que el banco de preguntas quedaba fuera del
alcance de los controles. **Mover o renombrar cualquiera de esos dos marcadores, o meter dentro del
bloque una referencia a un global declarado más abajo, rompe el script** (falla con un error
explícito, no con un diff vacío).

## Ramas

**La rama canónica es `main` y el archivo es `index.html`.** Las otras dos ramas remotas
(`feat/simplificacion-bloque-a`, `inicio-panel-de-modulos`) describen **otro producto**: un
backoffice multipágina de producción de contenido, con tres planes en lugar de dos y con la matriz
perfil × módulo fuera de alcance. No tomarlas como referencia. El `README.md` explica por qué.

## El modelo aprobado manda

`academia-AGENCIA` (repo hermano, la cara que usan las agencias) está aprobado por negocio.
**Donde los dos difieren, se ajusta este repo, nunca el otro.** La tabla de qué se alineó y por qué
está en el `README.md`. Vivía además en una pantalla del prototipo, «Reglas y decisiones»
(`viewCambios`), que **se eliminó el 03/09/2026**: era el anexo del MVP dibujado como interfaz, y no
administraba nada de contenido.

Invariantes compartidas que no se pueden cambiar de un solo lado — están en el `README.md` con más
detalle, y `cotejo.js` verifica las que son verificables:

1. **El ID es permanente** (módulo, sección, video). No se reasigna ni se renumera; sobrevive al
   regrabado. Por eso el **orden** es un campo aparte del ID (`ordenEfectivo`/`permutarVideo`).
2. **Toda base de cálculo son los módulos del recorrido del plan**, nunca los 11 del mapa.
3. **El tema del banco es una sección del propio módulo.** No hay catálogo de temas aparte y **no hay
   campo**: `subtemasDe(m)` lo deriva de `m.secciones` en cada lectura. Fue un campo guardado
   (`m.subtemas`, que `initMod` calculaba una sola vez) y se desincronizaba: una sección creada desde
   el backoffice no llegaba nunca a ser un tema, así que los desplegables de la consola quedaban
   vacíos y no se podía guardar ninguna pregunta, porque el tema es obligatorio.
4. **El enlace de la Meet vive en el turno y solo en el turno** (`TURNOS[].enlace`). La ficha del
   módulo no tiene campo de link, a propósito.
5. **Dos planes**: `Professional` y `Business` (`PLANES`). Recorrido 9 / 11. Son **un solo campo**,
   `m.planes` / `v.planes`, con el nombre y la forma del modelo aprobado; el matiz «caso puntual» es
   un flag aparte (`m.nicho`) y la etiqueta corta `P+B` / `B` / `B-nicho` se **deriva**
   (`etiquetaPlanes`), no se edita. De la misma fuente y pegadas a ella salen las otras dos lecturas
   del mismo dato: la etiqueta legible que lee quien administra contenido (`etiquetaPlanesLarga`:
   «Business · caso puntual») y la frase que explica el caso en pantalla (`ayudaPlanes`), que es el
   **único** lugar donde ese texto se escribe —tooltips, hints y toast salen de ahí—. Que `v.planes`
   **no exista** significa «los mismos que el
   módulo»: por eso al guardar se borra cuando el conjunto coincide con el del módulo, y así
   `planesPropios` —que solo pregunta si el campo existe— y «difiere del módulo» son la misma
   pregunta. `cotejo.js` lo custodia.
6. **Si se puede derivar, se deriva** (recorrido, ordinal, estado del cupo de Meet, promedios,
   cobertura del banco, vigencia de cada pregunta). El estado del cupo guardado se desincroniza; es el
   caso de manual.
7. **El MVP administra contenido que ya existe, no su producción.** Los videos entran con su link
   (o como ID reservado) y se agrupan en secciones. **Cohorte de grabación, guion, prioridad de
   rodaje y escenario previo se sacaron a propósito** el 03/09/2026: son la herramienta con la que
   Capacitación *fabrica* los videos y viven en `feat/simplificacion-bloque-a`. Lo que sí es de este
   repo es el **estado de producción** (`prodDe`: backlog / publicado / a regrabar / archivado),
   porque gobierna la visibilidad y el checklist. Si un campo describe *cómo se graba* y no *qué se
   publica*, no va acá.
8. **Los parámetros de la evaluación son del módulo** (`m.params`) **y no se editan en ningún lado.**
   Son las condiciones del MVP: 10 por intento, umbral 80,00 %, reintentos ilimitados, mínimo 30
   —nunca menos de 3× el intento— y objetivo 50, más `forzarCobertura:'si'`, la decisión 2, que se
   cerró probándola. `GLOBAL` es la semilla con la que nace un módulo
   y `viewParams` las expone con candado. La pestaña «Configuración» de la consola —el **único**
   escritor de `m.params`— se eliminó el 04/09/2026: en los 12 módulos nadie se apartó nunca del
   valor por defecto, así que era interfaz para una decisión ya tomada. Los parámetros viven en el
   módulo y no solo en `GLOBAL` porque el checklist de publicación mide contra `m.params.minimo`, y
   `cotejo.js` custodia que los doce declaren lo mismo. Dos campos salieron del dato por la misma
   razón —no tenían ningún efecto en runtime—: `caducaAlRegrabar` (decisión 6), que solo se dibujaba,
   y `mostrarCorrectas` (decisión 1), que perdió su único lector el 04/09/2026 al eliminarse el
   comparador de variantes de la pantalla de resultado. Que el resultado **no muestre las respuestas
   correctas** sigue siendo condición cerrada del MVP: es comportamiento fijo de `viewResultado`, y
   `viewParams` lo lee con candado desde un literal, no desde el dato. `cotejo.js` custodia la
   ausencia del campo, no su valor. Si alguna de las dos vuelve, vuelve con comportamiento.

## Arquitectura de `index.html`

Tres bloques en un archivo:

| Líneas | Qué |
|---|---|
| `10-945` | `<style>`: tokens en `:root` + componentes, con comentarios que citan la sección de `ESTILOS-ACADEMIA.md` que resuelven |
| `947-993` | Markup del shell: topbar, rail de navegación, header con el selector de escena, `#screens` vacío, `#toast` |
| `994-4344` | `<script>`: iconos, flag de diferidos, dato, escenas, estado, vistas y eventos |

SPA sin framework, con un único ciclo:

- **Estado**: el objeto `S` (`index.html:1804`) — pantalla actual, escena, superficie, nodo
  seleccionado, filtros, paso del importador, etc.
- **Render**: `render()` (`index.html:1913`) actualiza breadcrumb/notas, vacía `#screens` y llama a
  la vista según `S.screen` desde un map `screen → view*()`. Cada `view*()` **devuelve un nodo DOM**
  y no toca nada fuera de él. Al final, `renderIcons(document)` y `aplicarMVP(document)`.
- **Eventos**: una sola delegación de `click` en `document` (`index.html:3835`) que resuelve por
  atributos `data-*` (`data-go`, `data-go2`, `data-jump`, `data-sel`, `data-pub`, …), muta `S` y
  vuelve a llamar `render()`. **Agregar una interacción = agregar el `data-*` al selector del
  `closest(...)` y su rama al handler**, no un `addEventListener` propio.
- **Los campos de texto que filtran** son la excepción al «una sola delegación»: hay una segunda,
  de `input`, con una tabla `id del campo → clave de S` (`CAMPOS_FILTRO`). Es un **`Map`** por el
  mismo motivo que `ALIAS_EV`. Son tres: `#filtro` (árbol), `#bFiltro` (banco) y `#agFiltro`
  (agencias). **El foco y el caret no hay que parchearlos**: `recordarFoco`/`restaurarFoco`, al
  final de `render()`, recuerdan por `id` o por firma `data-*` y devuelven la posición del cursor.
- **Helpers**: `el(tag,clase,html)`, `esc()`, `$()`, `toast()`, `ico(nombre)`, `nota(variante,html)`.

### El selector de agencia

`selectorAgencia(agId, attr)` (`index.html:3531`) es **un solo componente para las dos pantallas
que eligen agencia**: «Avance por agencia» (`data-panelag`) y «Meet y colas de dudas»
(`data-meetag`). `attr` es el nombre del `data-*`, así que el componente no sabe en qué pantalla
está y los dos handlers de click siguen como estaban. Vive junto al dato de agencia, no dentro de una
vista: dos copias del mismo selector se desincronizan solas.

Son **doce agencias** y el camino principal es el **buscador** (`#agFiltro`, un solo `S.agFiltro`
para las dos pantallas, a propósito); los botones son el atajo. Dos cosas que parecen detalle y no lo
son:

- **Las sugeridas se derivan** (`agenciasSugeridas`, sobre `avancePromedio` + `tsAcceso`): menor
  avance del recorrido, desempate por actividad reciente, y **el rótulo nombra el criterio**. No se
  sortean: `render()` se vuelve a correr en cada tecla, así que un `Math.random()` por render haría
  temblar los botones mientras se escribe. Es la invariante 6 aplicada a la sugerencia.
- **La agencia elegida se dibuja siempre**, aunque no matchee el filtro ni entre en las sugeridas —si
  el botón activo desaparece, la pantalla parece desincronizada de sus propios números—, y cuando se
  agrega **el rótulo lo dice**, porque si no cuenta «6 coinciden» y se ven siete botones.

`avancePromedio(ag)` es la fórmula que estaba inline en `viewPanelAgencia`: la usan el KPI de la
pantalla **y** el orden de las sugerencias, y por eso se extrajo.

### Lo diferido: el flag `MVP`

`const MVP={importador:false,notas:false}` se declara **arriba de `GLOBAL`** —a propósito: adentro
caería en el bloque que evalúa `cotejo.js` y el script tendría que definirlo por su cuenta— y tiene
dos claves.

`importador` apaga **«Cargar desde planilla»**, que queda escrita, completa e inalcanzable. La
entrega del MVP va con **carga manual de todo el contenido**: módulo (`viewAltaMod`), sección
(`data-qsec`), video (puerta «Subir un video que ya tengo» → `S.quick`) y pregunta (`data-qnew` →
`viewPregunta`).

`notas` apaga las **notas de diseño**, los carteles que contaban qué cambió en cada versión del
prototipo. Son dato de proceso, no de contenido: sirvieron para acordar el modelo con negocio y el
acuerdo quedó escrito en el `README.md`. Antes se apagaban con un check del rail («Ver notas de
diseño») que venía **prendido**, así que estaban disponibles para visualizar; el check se eliminó
junto con `body.notes-off`, porque ocultar no es lo mismo que no estar. Las reglas CSS de `.note` sí
quedan escritas: son lo que el flag revive.

El mecanismo es genérico y sirve para cualquier cosa que haya que diferir:

1. Se le pone `data-mvp="<clave>"` al nodo — sirve igual en el markup estático del shell y en el
   HTML que generan las vistas, que es lo que un ternario dentro de un template no resuelve.
2. `aplicarMVP(root)` lo **remueve** si `MVP[clave]` es falso. Remueve en vez de ocultar porque un
   botón `hidden` sigue siendo alcanzable por teclado. Es idempotente, como `renderIcons`.
3. Si además hay una pantalla, va un guard en `render()`, al lado de la normalización de
   `ALIAS_EV`: `if(S.screen==='importar'&&!MVP.importador) S.screen='hub';`

Hoy hay **siete** nodos marcados con `importador` —la entrada del rail, dos «Pegar la estructura»,
tres «Pegar desde planilla» y «Exportar a planilla»— y **20 con `notas`**. Los textos de los cuatro
vacíos que ofrecían el camino de la planilla (hub, árbol, banco en la ficha y banco en la consola)
usan ternario contra el flag, así que **prenderlo devuelve la funcionalidad y la copia**, sin
reescribir nada. La vista, los fixtures, los handlers y `qImportar` **no se tocan**: son lo que el
flag revive. El `README.md` explica por qué se difirió y qué falta.

Las notas no se marcan a mano: el helper **`nota(variante,html)`** —al lado de `el`— devuelve el nodo
ya con el `data-mvp`, así que el atributo vive en un solo lugar en vez de en veintiún
`setAttribute`. Las cuatro notas que están escritas **dentro de un template string** (la ficha del
módulo y la de sección y video) llevan el atributo en el literal, que es el caso que el helper no
alcanza. Si agregás una nota, usá el helper: una nota sin `data-mvp` se dibuja siempre, y el control
es `document.querySelectorAll('.note').length === 0`.

**Al comentar código, no escribas los marcadores de corte de `cotejo.js` en texto plano**: el script
los busca con `indexOf` y se queda con la primera aparición, comentario incluido. Nombralos en prosa
(«la declaración de GLOBAL»), no como literal.

### La consola de evaluación

La evaluación de un módulo es **una sola pantalla**: `viewEvaluacion()` (`index.html:2677`) =
encabezado con selector de módulo (`evHead`) + tres pestañas (`EV_TABS`, `2645`) que resuelven a
`panelBanco`, `panelCobertura` y `panelPrevia`. Los `panel*` devuelven un nodo y **no ponen su
propio título ni su propio "volver"**: eso es del encabezado. Había una cuarta, `panelConfig`
(«Configuración»), que se eliminó el 04/09/2026 con todo lo suyo —el helper `valParam`, la rama
`data-pmsave` del handler y la tabla «Módulos con parámetros propios» de `viewParams`—: ver la
invariante 8. Un `S.evTab==='config'` viejo cae a `banco` por el guard de `EV_TABS.some(...)`.

Las claves de pantalla `banco`, `subtemas` y `preview` siguen funcionando como **aliases**: `render()`
las normaliza a `evaluacion` + la pestaña correspondiente vía `ALIAS_EV`, así que los `data-go2` y
`data-jump` que había no hubo que reescribirlos. `ALIAS_EV` **es un `Map` a propósito** — con un
objeto literal, `ALIAS_EV['constructor']` devuelve `Object.prototype.constructor` (algo verdadero) y
el árbol de estructura se redirigía a la consola. Mismo cuidado hace falta en cualquier map nuevo
indexado por `S.screen`.

La pantalla de resultado del intento de muestra (`viewResultado`) tenía debajo del detalle por tema
un comparador de dos botones —«Variante A · sin mostrar correctas» / «Variante B · mostrando
correctas», sobre el estado efímero `S.verCorrectas`— que dibujaba, en la B, el detalle pregunta por
pregunta con la opción correcta marcada. **Se eliminó el 04/09/2026 junto con `S.verCorrectas`, el
handler `data-vercorr`, sus dos resets y el CSS de `.optrow.correct` / `.optrow.wrong` / `.mkop`**:
era el instrumento con el que se cerró la decisión 1 —negocio comparó las dos en pantalla y firmó no
mostrar las correctas—, no una opción del producto. La variante A es hoy el único comportamiento.
`.optrow` a secas y `.qcard` **quedan**: los usa el intento de la previsualización.

`tabsBar(list, attr, actual)` sirve a los dos juegos de pestañas: la ficha del módulo usa `data-tab`
con `S.tab` (`Ficha · Evaluación · Meet · Publicar`) y la consola `data-evtab` con `S.evTab`.

### Los tres ejes que cruzan todas las vistas

Cualquier vista nueva tiene que respetar los tres, porque el prototipo se demuestra moviéndolos:

- **Escena** (`ESCENAS`, `index.html:1605`): en qué momento de la construcción está el
  sistema. Deriva el estado de producción de cada video (`prodDe`) y la visibilidad de los módulos
  (`modVisible`). El dato es siempre el mismo; lo que cambia es lo que se ve.
- **Rol**: **ya no existe.** El ajuste v4 eliminó el selector de rol y `can()` / `dis()` /
  `porque()` con él: todos los usuarios del backoffice entran con las mismas atribuciones, las
  cuatro puertas del hub están siempre disponibles y ninguna acción se atenúa según quién mire. No
  escribir código nuevo contra esos tres helpers —no están declarados y la llamada revienta en
  runtime.
- **Superficie** (`S.superficie`, `m.sup`): `initMod` deriva `m.sup` del prefijo del ID (`BAK-M30`
  → `BAK`). Hoy solo hay contenido `BAK`; `FRT` y `CRM` están abiertas en el `README.md`.

### El dato

Orden de declaración, que importa: `PLANES` (`1082`) → `GLOBAL` (`1091`, la **semilla**: umbral de
visto, preguntas por intento, objetivo y mínimo del banco con los que nace un módulo) →
`ESC_ORD` (`1107`, el orden de las escenas, con el que se compara la vigencia) → `DATA` (`1109`, los módulos con sus
secciones y videos) → `subtemasDe` (`1364`, el tema del banco derivado de la sección) → `initMod`
(`1377`) que se corre sobre todo `DATA` y completa lo derivado (`sup`, `planes`, `params`, `meet`,
IDs de sección faltantes, `pool`) → dato del lado agencia (`AGENCIAS` `1425`, `TURNOS` `1552`).

`subtemasDe` vive ahí adentro y no al lado de `planesDe` y `prodDe` porque `genPool` la usa, y porque
`cotejo.js` la necesita: el bloque exporta `subtemasDe` además de `DATA` y `ESC_ORD`.

`initMod` **no toca los videos**, y es a propósito: ponerle un `planes` por default a cada video lo
volvería indistinguible de uno al que alguien le eligió esos planes a mano.

Los bancos de preguntas: `HAND` (`1259`) tiene las preguntas escritas de verdad, solo de `BAK-M30` y
`BAK-M40`, y **cada una declara de qué video sale**; `genPool` (`1309`) completa el resto con
preguntas de estructura y la interfaz lo avisa. Escribir los bancos reales es trabajo de contenido,
no de código.

Dos cosas del banco que conviene tener claras antes de tocarlo:

- **La vigencia la declara la pregunta, no la vista.** Cada pregunta guarda `desde` (una clave de
  `ESCENAS`: hoy `VACIA` o `COMPLETA`) y `bancoVigente(m)` (`1690`) lo compara con la escena vía
  `ESC_ORD`; `bancoActivas(m)` (`1691`) filtra además por `estado==='activa'`, que es lo que entra al
  sorteo y cuenta para la cobertura. El `desde` se asigna donde nace la pregunta: literal en `HAND` y
  `genPool`, y `S.escena` en `qGuardar`. **No hay ninguna función que corte el pool por cantidad**: si aparece una, es un regreso al bug que hacía que el checklist pidiera un mínimo
  inalcanzable.
- **El banco se escribe.** `nextQId` (`1709`), `qGuardar` (`1720`), `qEstado`, `qTema` y `qImportar`
  son los únicos que mutan `m.pool`. El ID sale del máximo ya usado —nunca de `pool.length`—, editar
  conserva el ID y sube `ver` **solo si la pregunta ya se respondió**, y no hay borrado físico: se
  pasa a `inactiva`.

**Qué es ficticio**: agencias, personas, links de YouTube, duraciones, enunciados y porcentajes del
panel general. **No es ficticio** el mapa de contenido: los 11 módulos, las 31 secciones y los 55
IDs de video son los del mapa aprobado, y `cotejo.js` los custodia.

## Sistema visual

`ESTILOS-ACADEMIA.md` es la fuente del lenguaje visual (extraído de sigmma.net) y su **§6 «Qué no
replicar»** es una lista de deuda a no heredar: nada de nombres de color numéricos, un solo botón
con variantes, variantes cerradas en lugar de color libre por instancia, tres breakpoints, sin modo
oscuro. El `:root` de `index.html` ya resuelve varias de esas deudas (color por rol, escala de
feedback que el documento declara ausente, tintas oscurecidas para llegar a AA donde el hex de marca
no llegaba) — **usar los tokens del `:root`, no re-derivar valores del documento.**

Dos cosas del CSS que se malinterpretan fácil:

- La **escala tipográfica no es la de §3.2**. Esa es la del sitio comercial (H1 72, de landing). Acá
  se usa el tramo bajo, un escalón por debajo del de la vista agencia: la unidad de pantalla es la
  tabla de 50 filas.
- Los **iconos van inline** (`ICONS`, `index.html:1007`, Tabler outline, el mismo set que la vista
  agencia) y no como sprite, porque `<use href="archivo.svg#id">` no carga bajo `file://`. El trazo
  lo declara el CSS, no el SVG. `renderIcons` es idempotente y se puede llamar en cada render.

## Restricciones del entorno

Todo lo que sigue es consecuencia de "tiene que abrir con doble click":

- Un solo archivo, sin build, sin bundler, sin módulos ES, sin `import`.
- Sin `fetch` ni `XMLHttpRequest` (bloqueados en `file://`), sin sprites SVG externos.
- Nada de dialogs bloqueantes (`alert`/`confirm`): el feedback va por `toast()`.

## `wireframe.html`

Versión low-fi del mismo backoffice, **congelada el 02/09/2026**. No está enlazada desde
`index.html` y **no es fuente de verdad**. Las correcciones de dato no se replican ahí a propósito:
dos copias del mismo dataset se desincronizan solas. No editarla salvo pedido explícito.

## Convenciones de escritura

Español rioplatense, el mismo registro que el `README.md` y los comentarios del código: el
comentario explica **por qué** la decisión, no qué hace la línea. Formatos: fechas `DD/MM/YYYY`,
horario 24 h, zona `ART (UTC-3)` explícita, porcentajes con dos decimales (`80,00 %`), monedas con
código ISO.
