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
algún control queda en rojo. No hay selección de controles individuales: corre los 9 y se lee la
salida. **Correrlo después de cualquier cambio en `DATA`, en las secciones o en el banco.**

Cómo lee el dato: `cotejo.js` busca literalmente `const DATA=[` y el siguiente `\n];` en
`index.html` y hace `eval` del bloque. Renombrar `DATA`, moverlo o reformatear ese cierre rompe el
script en silencio conceptual (falla con error, no con diff).

## Ramas

**La rama canónica es `main` y el archivo es `index.html`.** Las otras dos ramas remotas
(`feat/simplificacion-bloque-a`, `inicio-panel-de-modulos`) describen **otro producto**: un
backoffice multipágina de producción de contenido, con tres planes en lugar de dos y con la matriz
perfil × módulo fuera de alcance. No tomarlas como referencia. El `README.md` explica por qué.

## El modelo aprobado manda

`academia-AGENCIA` (repo hermano, la cara que usan las agencias) está aprobado por negocio.
**Donde los dos difieren, se ajusta este repo, nunca el otro.** La pantalla «Reglas y decisiones»
del propio prototipo (`viewCambios`) lleva la tabla de qué se alineó y por qué.

Invariantes compartidas que no se pueden cambiar de un solo lado — están en el `README.md` con más
detalle, y `cotejo.js` verifica las que son verificables:

1. **El ID es permanente** (módulo, sección, video). No se reasigna ni se renumera; sobrevive al
   regrabado. Por eso el **orden** es un campo aparte del ID (`ordenEfectivo`/`permutarVideo`).
2. **Toda base de cálculo son los módulos del recorrido del plan**, nunca los 11 del mapa.
3. **El tema del banco es una sección del propio módulo.** No hay catálogo de temas aparte:
   `initMod` deriva `m.subtemas` de `m.secciones`.
4. **El enlace de la Meet vive en el turno y solo en el turno** (`TURNOS[].enlace`). La ficha del
   módulo no tiene campo de link, a propósito.
5. **Dos planes**: `Professional` y `Business` (`PERFILES`). Recorrido 9 / 11.
6. **Si se puede derivar, se deriva** (recorrido, ordinal, estado del cupo de Meet, promedios,
   cobertura del banco). El estado del cupo guardado se desincroniza; es el caso de manual.

## Arquitectura de `index.html`

Tres bloques en un archivo:

| Líneas | Qué |
|---|---|
| `10-936` | `<style>`: tokens en `:root` + componentes, con comentarios que citan la sección de `ESTILOS-ACADEMIA.md` que resuelven |
| `938-999` | Markup del shell: topbar, rail de navegación, header con los controles de rol y escena, `#screens` vacío, `#toast` |
| `1000-3524` | `<script>`: iconos, roles, dato, escenas, estado, vistas y eventos |

SPA sin framework, con un único ciclo:

- **Estado**: el objeto `S` (`index.html:1514`) — pantalla actual, escena, rol, superficie, nodo
  seleccionado, filtros, paso del importador, etc.
- **Render**: `render()` (`index.html:1579`) actualiza breadcrumb/notas, vacía `#screens` y llama a
  la vista según `S.screen` desde un map `screen → view*()`. Cada `view*()` **devuelve un nodo DOM**
  y no toca nada fuera de él. Al final, `renderIcons(document)`.
- **Eventos**: una sola delegación de `click` en `document` (`index.html:3221`) que resuelve por
  atributos `data-*` (`data-go`, `data-go2`, `data-jump`, `data-sel`, `data-pub`, …), muta `S` y
  vuelve a llamar `render()`. **Agregar una interacción = agregar el `data-*` al selector del
  `closest(...)` y su rama al handler**, no un `addEventListener` propio.
- **Helpers**: `el(tag,clase,html)`, `esc()`, `$()`, `toast()`, `ico(nombre)`.

### Los tres ejes que cruzan todas las vistas

Cualquier vista nueva tiene que respetar los tres, porque el prototipo se demuestra moviéndolos:

- **Escena** (`ESCENAS`, `index.html:1399`, `E1`…`E5`): en qué momento de la construcción está el
  sistema. Deriva el estado de producción de cada video (`prodDe`) y la visibilidad de los módulos
  (`modVisible`). El dato es siempre el mismo; lo que cambia es lo que se ve.
- **Rol** (`ROLES` / `PERMS`, `index.html:1051`): `can('publicar')` decide, `dis('publicar')`
  devuelve el atributo `disabled` para el template y `porque('publicar')` el texto del toast que
  explica el bloqueo. **Todo botón que muta tiene que pasar por los tres.** El rol no es decorativo.
- **Superficie** (`S.superficie`, `m.sup`): `initMod` deriva `m.sup` del prefijo del ID (`BAK-M30`
  → `BAK`). Hoy solo hay contenido `BAK`; `FRT` y `CRM` están abiertas en el `README.md`.

### El dato

Orden de declaración, que importa: `GLOBAL` (`1073`, parámetros globales: umbral de visto,
preguntas por intento, objetivo y mínimo del banco) → `DATA` (`1077`, los módulos con sus secciones
y videos) → `initMod` (`1275`) que se corre sobre todo `DATA` y completa lo derivado (`sup`,
`params`, `meet`, IDs de sección faltantes, `subtemas`, `pool`) → dato del lado agencia
(`AGENCIAS` `1297`, `TURNOS` `1356`).

Los bancos de preguntas: `HAND` (`1224`) tiene las preguntas escritas de verdad, solo de `BAK-M30`
y `BAK-M40`; `genPool` (`1236`) completa el resto con preguntas de estructura y la interfaz lo
avisa. Escribir los bancos reales es trabajo de contenido, no de código.

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
- Los **iconos van inline** (`ICONS`, `index.html:1013`, Tabler outline, el mismo set que la vista
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
