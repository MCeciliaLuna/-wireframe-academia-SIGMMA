# Simplificación del backoffice de la Academia · Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** cerrar el delta real entre lo que pide `docs/prompt-simplificacion.md` y lo que el repo ya construyó, sin romper ninguna de las 13 reglas cableadas ni bajar de 122 controles en verde.

**Architecture:** el repo ya implementó entre el 60 % y el 70 % de las Fases 1 a 6 con otra forma —árbol en `modulo.html`, carga masiva en `importador.html`, IDs derivados por R2/R11, checklist de completitud en `video.html`, acciones en lote en `tablero.html`—. Lo que queda no es construcción: son **tres tareas desbloqueadas** y **nueve decisiones** donde el prompt contradice una decisión ya tomada. El plan pone las tres tareas primero, cada una con su control nuevo en `SIM.verificar()`, y deja las nueve decisiones como compuertas explícitas con la opción recomendada.

**Tech Stack:** HTML plano sin templating · Tailwind v4 CSS-first (`@theme` cerrado) · JS por IIFE global, sin módulos ES · verificación por `SIM.verificar()` en node + greps + Chrome headless.

**Spec:** `docs/prompt-simplificacion.md` (requerimientos) y `docs/html-model-simplificacion.html` (referencia de interacción, **no** de estilo). Contexto del repo: `CLAUDE.md`.

## Global Constraints

Todo requerimiento de cada tarea incluye implícitamente esta sección.

- **Nomenclatura:** la empresa es **SIGMMA**, siempre en mayúsculas y con doble M. El producto es **SIGMMA.net** en contexto comercial y `sigmma.net` en técnico. **Nunca «SIGMA».**
- **Planes comerciales:** **Professional · Business · Corporate**. El `PERFILES = ['Corporate','Business','Standard']` del HTML modelo es el error de documento fuente B-4/D-3: **no se copia.**
- UI y comentarios de código en **español rioplatense**. Fechas `DD/MM/YYYY`; formato técnico `YYYY-MM-DD`.
- **Sigue prohibido:** `fetch`, `XMLHttpRequest`, módulos ES, números agregados escritos a mano, hex sueltos en HTML o JS, clases de paleta Tailwind por defecto (`bg-blue-500`, `font-medium`, `text-2xl` no compilan).
- **El almacén del navegador se escribe SOLO desde `academia-sim.js`.** Al comentar esta regla, no escribir el token: los controles de disciplina son greps a secas y un comentario que lo nombre hace fallar el control igual que si lo usara.
- **R11:** los videos nacen en `backlog`, sin link y sin versión. El alta **nunca** pide un link de YouTube. Verificado por grep sobre `alta-videos.html` e `importador.html`.
- **R12:** ningún camino puede dejar un video sin sección ni un módulo de biblioteca sin secciones.
- **R13:** lo que ya está escrito se importa; lo que nace del trabajo se escribe en la pantalla donde ese trabajo ocurre. **Las preguntas no se importan nunca.**
- **R6 · densidad alta**, R7 · desktop y todo el ancho, sin un solo breakpoint, piso 1160 px.
- **Un botón que no hace nada es un bug, no una maqueta.** Si una acción no se puede ejecutar, el control va deshabilitado **con el motivo a la vista** — no presente y mudo.
- **El sidebar está copiado literal en las 10 páginas de app.** Fuente canónica: `src/partials/app-shell.html`. Al replicar se cambia **solo** el `aria-current="page"`.
- **Después de mutar, recargar con `UI.recargar()`, nunca con `location.reload()`** — descarta `reset=1` de la URL.
- **Para probar cualquier URL con parámetros bajo `npm run serve`, usar la ruta sin `.html`.** `serve@14` responde 301 y se come el query string.
- **Baseline verificado el 31/08/2026:** 122 controles, 0 fallas, `ok: true`.

## Batería de regresión

La misma para todas las tareas. Es el "run the tests" de este repo: no hay suite de unit tests.

```bash
cd /home/mcecilialuna/Escritorio/SIGMMA/ACADEMIA-BACKLOG/academia-SIGMMA

# 1 · los controles del motor (122 + los que agregue la tarea)
node -e 'global.window={};
  ["academia-data","academia-agencias","academia-guiones","academia-preguntas","academia-sim",
   "academia-import","academia-guia"]
    .forEach(f => require(process.cwd()+"/assets/js/"+f+".js"));
  const r = window.SIM.verificar();
  console.log("controles:", r.controles.length, "| fallas:", r.fallas.length);
  r.fallas.forEach(f => console.log("  FALLA:", f));
  process.exit(r.ok ? 0 : 1)'

# 2 · disciplina del design system
mapfile -t PAGS < <(ls *.html | grep -v design-system.html)
grep -n "font-medium\|font-semibold" "${PAGS[@]}"                          # → vacío
grep -nE "#[0-9a-fA-F]{6}\b" "${PAGS[@]}" | grep -v href=                  # → vacío
grep -nE "#[0-9a-fA-F]{6}\b" assets/js/*.js                                # → vacío
grep -noE "\b(bg|text|border)-(red|blue|green|slate|sky|amber|emerald)-[0-9]{2,3}" "${PAGS[@]}"  # → vacío
grep -rn "SIGMA[^M]" *.html *.md assets/js/ src/ | grep -v SIGMMA | grep -v '«SIGMA»'           # → vacío
grep -n "fetch(\|XMLHttpRequest" assets/js/*.js *.html                     # → vacío
grep -ln "localStorage" assets/js/*.js                                     # → academia-sim.js
grep -nE '<(input|textarea)[^>]*(type="url"|link|youtu)' alta-videos.html importador.html       # → vacío

# 3 · ningún link colgado
mapfile -t TODAS < <(ls *.html)
grep -rhoE 'href *=? *["'"'"']?[a-z0-9-]+\.html' "${TODAS[@]}" assets/js/*.js \
  | grep -oE '[a-z0-9-]+\.html$' | sort -u \
  | grep -vE '^(planes|app-shell)\.html$' \
  | while read -r f; do [ -e "$f" ] || echo "COLGADO: $f"; done            # → vacío

# 4 · los 10 sidebars idénticos
for f in modulos.html modulo.html video.html tablero.html banco.html \
         importador.html alta-videos.html alta-modulo.html alta-seccion.html \
         escritura.html; do
  sed -n '/app-shell: sincronizar/,/<!-- \/app-shell -->/p' $f \
    | sed 's/ aria-current="page"//' | md5sum
done | sort -u | wc -l                                                     # → 1

# 5 · el CSS versionado al día
npx tailwindcss -i ./src/input.css -o /tmp/chk.css --minify
cmp /tmp/chk.css assets/css/academia.css                                   # → sin diferencias
```

> **Cuidado con `cmd | grep -v X >/dev/null && …`:** con entrada vacía y salida a `/dev/null`, GNU grep devuelve 0 y el condicional se invierte. Capturá la salida y comprobá que esté vacía. Y no pases la lista de páginas sin comillas a un `bash -c`: las líneas se interpretan como comandos y **todos los controles dan ✓ porque el grep nunca corrió**.

---

## Cobertura del spec

Cada requerimiento de `docs/prompt-simplificacion.md`, y dónde cae.

| Requerimiento | Estado | Dónde |
|---|---|---|
| Fase 0 · auditoría en 8 puntos | **Hecha**, con dos premisas del prompt refutadas: el repo sí usa el almacén del navegador, y son 10 páginas con 4 destinos, no 13 con 16 | Este plan + `CLAUDE.md` |
| Fase 1 · árbol maestro-detalle con altas en contexto | **Ya existe** con otra forma: `modulo.html` (árbol de secciones + tablero de 5 pasos) y `alta-videos.html?m=&seccion=` | — |
| Fase 1 · semántica `role="tree"`, flechas, `Home`/`End` | **Fuera de alcance**, justificado | «Fuera de alcance» |
| Fase 1 · todo estado de URL alcanzable por control visible | **Ya existe** (`?escena=`, `?vista=`, `?tab=` tienen control) · lo re-exige D-20 | D-20 |
| Fase 2 · el ID lo deriva el sistema, badge de solo lectura | **Ya existe** por R2 y R11 | — |
| Fase 2 · ningún input de texto para el ID | **Parcial**: la secuencia sí es editable | **D-24** |
| Fase 2 · no habilitar intercalado manual de secuencia | **Contradicho por el repo** | **D-24** |
| Fase 2 · el ID no se reutiliza; la baja es lógica | **Ya existe** (`obsoleto`) | — |
| Fase 3 · alta en tres decisiones | **Divergencia deliberada**: `alta-videos.html` es una grilla de lote de 6 columnas, porque nadie reserva 55 IDs de a uno. La reducción a tres decisiones aplica al alta unitaria, que en este repo no es el camino principal | **D-18** |
| Fase 3 · metadata derivada a la vista | **Ya existe**: columna «ID que queda» + aside «Qué se crea» | — |
| Fase 3 · ficha diferida en solapas | **Ya existe**: `video.html` con ficha, versiones, guión, preguntas, ubicaciones | — |
| Fase 3 · checklist de completitud | **Ya existe**: `checklistDe()`, y D-1 fija que advierte, no bloquea | — |
| Fase 4 · dos puertas de entrada | **Task 2** | Bloque A |
| Fase 4 · bloque «lo que está esperando algo» | **Ya existe**: `franjaTrabajo()` en `modulos.html` | — |
| Fase 4 · detectar el ID reservado con título parecido | **Sin resolver** | **D-25** |
| Fase 5.a · acciones masivas | **Ya existe y va más lejos**: estado, cohorte y cola de regrabación en lote | — |
| Fase 5.a · mover a otra sección | **Falta, y es lo más caro del prompt** | **D-22** |
| Fase 5.b · pegado desde planilla con vista previa fila por fila | **Ya existe**: `importador.html` + `academia-import.js`, por archivo en vez de pegado | — |
| Fase 5.b · mismo flujo para el banco de preguntas | **Contradicho por R13** | **D-19** |
| Fase 5.b · fuente de verdad, marcada como bloqueante | **Sin resolver** | **D-23** |
| Fase 6 · módulo inactivo no acepta videos nuevos | **La regla no tiene referente en este modelo** | **D-26** |
| Fase 6 · sub-tema obligatorio con contador de huecos | **Ya existe**: el sub-tema *es* el título de la sección, y `seccionesDe()` da `faltan` por sección | — |
| Fase 6 · banco como solapa del módulo | **Reubicar, nunca eliminar** | **D-20** |
| Fase 6 · el paso siguiente como botón primario | **Ya existe** por módulo (`pasosDeModulo()`); por video queda en la ficha | — |
| Microcopy · nombrar por la tarea | **Task 3** | Bloque A |
| Piso · WCAG 2.1 AA, foco visible, 100 % teclado | **Ya existe** y se re-verifica en cada tarea | Batería, bloque 5 |
| Piso · reordenamiento con botones además de arrastrar | **El arrastre ya se quitó**; los ↑ ↓ chocan con el orden derivado | **D-21** |
| Piso · usar los tokens existentes | **Constraint global** | Global Constraints |
| Piso · sin `localStorage` | **Cláusula vencida**: el repo lo usa en el motor por decisión de arquitectura | «Fuera de alcance» |
| Piso · sidebar honesto | **Ya existe**: lo de fuera del MVP va `disabled` | — |
| No hacer · framework, backend, SSO, YouTube, seguimiento staff | **Respetado** | Global Constraints |

---

## File Structure

| Archivo | Responsabilidad | Tareas |
|---|---|---|
| `assets/js/academia-sim.js` | **Cálculo.** Nuevo derivado `sinLink()` + 2 controles nuevos en `auditar()`. No toca el DOM. | 1 |
| `assets/js/render.js` | **Markup.** Nuevo helper `puertas()`. Solo arma HTML con lo que el motor resolvió. | 2 |
| `src/input.css` | Sección 6 (lo propio del backoffice): clases de la tarjeta de puerta. | 2 |
| `assets/css/academia.css` | Compilado versionado. Se recompila y commitea. | 2 |
| `modulos.html` | Pantalla de inicio: monta las dos puertas arriba de la franja de trabajo. | 2 |
| `alta-videos.html`, `alta-modulo.html`, `alta-seccion.html`, `banco.html` | Rótulos por tarea (microcopy). Solo texto visible. | 3 |
| `design-system.html` | Tabla de decisiones abiertas (D-18 a D-26) + tabla de microcopy. | 3, Bloque B |
| `CLAUDE.md` | Tabla de conteos de `verificar()` y contrato de URL. | 1, 2 |
| `DESIGN-SYSTEM-EXTENSIONS.md` | Justificación de los tokens nuevos de la puerta. | 2 |

---

# BLOQUE A — desbloqueado

No depende de ninguna decisión de producto. Se puede ejecutar hoy.

---

### Task 1: `sinLink()` — el derivado que sostiene la puerta «ya lo tengo grabado»

La Fase 4 del prompt pide dos puertas de entrada, y la primera es «subir un video que ya tengo». En este repo eso **no es un alta**: el ID ya existe reservado (R11) y lo que falta es la versión con el link, que se carga en `video.html`. La puerta necesita saber *cuáles* son esos videos, y ese número no puede escribirse a mano.

**Files:**
- Modify: `assets/js/academia-sim.js` — agregar `sinLink()` junto a `colaDeEscritura()`, exportarla, y sumar 2 controles en `auditar()`
- Modify: `CLAUDE.md` — tabla de reglas de negocio y tabla de conteos de `verificar()`

**Interfaces:**
- Consumes, **por su nombre INTERNO a la IIFE, no por el exportado**: `todos(escenaId)` (se exporta como `videos`), `modulosPorNumero[numero]` (se exporta como `modulo()`), `versionesDe(video, escenaId)`, `rango(estado)`, `alcanzada(hito, escenaId)`. Es el patrón que ya usan `estadoDeCarga()` y `resumenModulo()`: acceden al índice directo, nunca al wrapper exportado. Escribir `videos(esc)` o `modulo(v.modulo)` tira `ReferenceError`.
- Produces: `SIM.sinLink(escenaId) → Array<video>`. Cada elemento es un video ya con estado derivado (la forma que devuelve `videos()`). Ordenado por `id` ascendente. La Task 2 consume exactamente esto.

- [ ] **Step 1: escribir el control que falla**

En `assets/js/academia-sim.js`, dentro de `auditar()`, inmediatamente después del bloque de controles de `colaDeEscritura` (buscar el control «La cola no lista videos que no llegaron a publicado»), agregar:

```js
    /* -- La puerta «ya lo tengo grabado» ---------------------------------
       Dos cosas la pueden romper, y las dos ya pasaron en este repo:

       · Contar un publicado como «sin link» mandaría a cargar un link que ya
         está. En E6 hay 18 videos publicados que NO tienen versión vigente en
         el dataset, así que definir la puerta por «no tiene versión» a secas
         listaría 18 publicados. La condición es el ESTADO, no la versión.

       · Contar los 55 IDs en E1 repetiría el bug que arregló `mapaCargadoEn`:
         `videos()` devuelve los 55 en TODAS las escenas —la escena cambia el
         estado, no la existencia—, así que sin el hito de reserva la escena
         que se define como «nada cargado» ofrecería 54 videos para cargar. */
    ["E1", "E2", "E3", "E4", "E5", "E6"].forEach(function (e) {
      const lista = sinLink(e);
      chequeo(
        "Puerta · en " + e + " ningún publicado figura sin link",
        lista.every(function (v) { return rango(v.estado) < rango("publicado"); }),
        lista.filter(function (v) { return rango(v.estado) >= rango("publicado"); })
          .map(function (v) { return v.id; }).join(", ")
      );
    });

    chequeo(
      "Puerta · en E1 no hay ningún video esperando link",
      sinLink("E1").length === 0,
      sinLink("E1").length + " videos ofrecidos en la escena «nada cargado»"
    );
```

- [ ] **Step 2: correr y verificar que falla**

```bash
node -e 'global.window={};
  ["academia-data","academia-agencias","academia-guiones","academia-preguntas","academia-sim"]
    .forEach(f => require(process.cwd()+"/assets/js/"+f+".js"));
  window.SIM.verificar()'
```

Esperado: `ReferenceError: sinLink is not defined`.

- [ ] **Step 3: implementar `sinLink()`**

En `assets/js/academia-sim.js`, inmediatamente antes de `function colaDeEscritura(`, agregar:

```js
  /* -- Los videos que esperan su link -------------------------------------
     La unidad de trabajo es el VIDEO y el motivo es único: el ID ya está
     reservado y todavía no tiene versión vigente. Es la puerta por la que
     entra cualquiera del equipo, y es lo que hace que R11 deje de ser un
     obstáculo: el alta no pide link porque cargar el link es OTRA tarea, con
     su propia entrada.

     Dos filtros, y ninguno es decorativo:

     · `rango(estado) < rango("publicado")` — un publicado ya tiene su link
       por definición. El dataset de E6 tiene publicados sin versión vigente,
       así que preguntar por la versión en vez de por el estado listaría 18
       videos publicados como pendientes.

     · el hito de reserva del módulo — `videos()` devuelve los 55 en todas las
       escenas, y sin esto E1 ofrecería 54 videos para cargar en la escena que
       se define como «nada cargado». Es el mismo cierre que hace
       `estadoDeCarga()` con `mapaCargadoEn`. */
  function sinLink(escenaId) {
    const esc = escenaId || escena;
    return todos(esc).filter(function (v) {
      if (rango(v.estado) >= rango("publicado")) return false;
      const m = modulosPorNumero[v.modulo];
      const cargado = !m || !m.mapaCargadoEn || alcanzada(m.mapaCargadoEn, esc);
      if (!cargado) return false;
      return !versionesDe(v, esc).some(function (x) { return x.vigente; });
    }).sort(function (a, b) { return a.id < b.id ? -1 : 1; });
  }
```

Y en el objeto que devuelve la IIFE, agregar la línea en orden alfabético cerca de `sortear`:

```js
    sinLink: sinLink,
```

- [ ] **Step 4: correr y verificar que pasa, con los números esperados**

```bash
node -e 'global.window={};
  ["academia-data","academia-agencias","academia-guiones","academia-preguntas","academia-sim"]
    .forEach(f => require(process.cwd()+"/assets/js/"+f+".js"));
  const S = window.SIM;
  ["E1","E2","E3","E4","E5","E6"].forEach(e => console.log(e, S.sinLink(e).length));
  const r = S.verificar();
  console.log("controles:", r.controles.length, "| fallas:", r.fallas.length);
  process.exit(r.ok ? 0 : 1)'
```

Esperado, exacto:

```
E1 0
E2 54
E3 46
E4 43
E5 18
E6 0
controles: 121 | fallas: 0
```

> `E2 54` y no 55 porque **`BAK-M30.050`** ya figura con una versión vigente en E2. Y el motivo no es «desde el arranque»: `versionesDe()` devuelve el array explícito de `versiones` **sin mirar el estado**, así que un video en `backlog` puede tener una v2 vigente. Verificalo, no lo asumas — la primera redacción de este plan nombraba `BAK-M00.010` y era falso. `E6 0` es correcto y es dato, no bug: en E6 los 55 videos están en `publicado`, `a regrabar` u `obsoleto`, así que ninguno espera link — y la Task 2 tiene que mostrar ese vacío con su motivo, no un link muerto.

- [ ] **Step 5: correr la batería completa de regresión**

Correr los 5 bloques de «Batería de regresión». Los controles suben de 122 a **129** con los siete JS cargados (6 por escena + 1 de E1).

- [ ] **Step 6: actualizar `CLAUDE.md`**

En la tabla «Las reglas de negocio, y dónde viven», agregar después de la fila de `colaDeEscritura()`:

```markdown
| **Los videos que esperan su link** | `sinLink()` — ID reservado y sin versión vigente, filtrado por estado anterior a `publicado` y por el hito de reserva del módulo. Es lo que hace que R11 deje de ser un obstáculo: el alta no pide link porque cargar el link es otra tarea |
```

Y en la tabla «Cuántos controles da `verificar()`», cambiar los cuatro números: **121** una pantalla común · **123** `importador.html` · **127** una de las 7 del flujo · **129** el script de node con los diez.

- [ ] **Step 7: commit**

```bash
git add assets/js/academia-sim.js CLAUDE.md
git commit -m "feat(motor): los videos que esperan su link son un derivado, no una cuenta a mano

Es lo que sostiene la puerta «ya lo tengo grabado» de la Fase 4. Dos filtros
que no son decorativos: el estado, porque en E6 hay 18 publicados sin version
vigente en el dataset y preguntar por la version los listaria como pendientes;
y el hito de reserva, porque videos() devuelve los 55 en todas las escenas y
sin eso E1 ofreceria 54 videos en la escena que se define como «nada cargado».

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: Las dos puertas, como franja del panel

La Fase 4 pide una pantalla «¿Qué querés hacer?». **No se crea la pantalla.** El commit `00ba459` y `CLAUDE.md` registran que el «panel de obra» se eliminó justamente por informar sin dejar hacer, y que la pantalla de inicio pasó a ser `modulos.html`. Las dos puertas se montan **ahí**, arriba de la franja de trabajo que ya existe: se gana el efecto que buscaba la Fase 4 —que cada persona entre por donde su tarea tiene sentido— sin reintroducir la pantalla que se borró.

**Files:**
- Modify: `src/input.css` sección 6 — clases `.puertas`, `.puerta`, `.puerta-quien`
- Modify: `assets/js/render.js` — helper `puertas()`, exportado
- Modify: `modulos.html` — contenedor `[data-puertas]` en la franja de inicio + el montaje en el script inline
- Modify: `assets/css/academia.css` — recompilado
- Modify: `DESIGN-SYSTEM-EXTENSIONS.md`, `CLAUDE.md`

**Interfaces:**
- Consumes: `SIM.sinLink(escenaId)` de la Task 1 · `RENDER.pintar(sel, html)` · `RENDER.esc(s)` · `SIM.escena`.
- Produces: `RENDER.puertas(lista) → string` donde `lista` es un array de `{titulo, bajada, quien, href, motivo}`. Si `href` es `null`, la puerta se pinta como `<div>` deshabilitado y **`motivo` es obligatorio** — es la regla de que un control apagado dice por qué.

- [ ] **Step 1: escribir la prueba que falla**

Banco de pruebas de un archivo, servido desde el mismo origen. Crear `/tmp/claude-1000/-home-mcecilialuna-Escritorio-SIGMMA-ACADEMIA-BACKLOG-academia-SIGMMA/43295c6c-4f5e-4968-99cd-9d71fcc52dff/scratchpad/puertas.html` y copiarlo a la raíz del repo como `_prueba-puertas.html` (se borra en el Step 6):

```html
<pre id="out"></pre><iframe id="f" width="1400" height="900"></iframe>
<script>
  const cargar = (u) => new Promise((r) => {
    const f = document.getElementById("f");
    f.onload = () => setTimeout(() => r(f.contentWindow), 350);
    f.src = u;                        /* ¡sin `.html`! si no, se pierde el query */
  });
  const log = (s) => document.getElementById("out").textContent += s + "\n";

  (async () => {
    for (const e of ["E1", "E2", "E5", "E6"]) {
      const w = await cargar("/modulos?escena=" + e);
      const cont = w.document.querySelector("[data-puertas]");
      if (!cont) { log(e + " · SIN CONTENEDOR"); continue; }
      /* MEDIR LAYOUT, NO CONTAR NODOS. La primera versión de esta prueba usaba
         solo `querySelectorAll` y dio un FALSO POSITIVO: en E1 las puertas se
         pintaban dentro de `#listado`, que lleva `data-escena-off` y se apaga
         con `display:none !important`, así que los nodos existían y no se veían.
         El instrumento estaba ciego justo al defecto que existía para atrapar. */
      const r = cont.getBoundingClientRect();
      const visible = !!(cont.offsetParent && r.width > 0 && r.height > 0);
      const activas = cont.querySelectorAll("a.puerta").length;
      const apagadas = cont.querySelectorAll("div.puerta").length;
      const mudas = Array.from(cont.querySelectorAll("div.puerta"))
        .filter((d) => (d.textContent || "").trim().length < 40).length;
      log(e + " · visible=" + visible + " activas=" + activas +
          " apagadas=" + apagadas + " mudas=" + mudas);
    }
    log("FIN");
  })();
</script>
```

- [ ] **Step 2: correr y verificar que falla**

```bash
npm run serve &
sleep 2
google-chrome --headless=new --virtual-time-budget=6000 \
  --dump-dom "http://localhost:4321/_prueba-puertas" 2>/dev/null \
  | sed -n '/<pre id="out">/,/<\/pre>/p'
```

Esperado: las cuatro líneas dicen `SIN CONTENEDOR`.

- [ ] **Step 3: los estilos**

En `src/input.css`, al final de la **sección 6**, agregar:

```css
  /* Las dos puertas del panel. Son la Fase 4 del prompt de simplificación
     SIN la pantalla que pedía: el hub «¿Qué querés hacer?» informaba y
     derivaba, que es exactamente por lo que se eliminó el panel de obra.
     Montadas en el inicio, dan el mismo efecto —cada persona entra por donde
     su tarea tiene sentido— y no agregan un destino más al sidebar.

     La apagada es un `div`, no un `a` sin `href`: un link sin destino igual
     recibe foco y se lee como accionable. */
  .puertas {
    @apply grid grid-cols-2 gap-3 mb-4;
  }
  .puerta {
    @apply block text-left border border-line rounded-md bg-white px-4 py-3 no-underline;
  }
  a.puerta:hover {
    @apply border-primary-light bg-surface;
  }
  div.puerta {
    @apply bg-surface text-ink-soft cursor-not-allowed;
  }
  .puerta-titulo {
    @apply block text-sm font-bold text-ink mb-1;
  }
  div.puerta .puerta-titulo {
    @apply text-ink-soft;
  }
  .puerta-bajada {
    @apply block text-xs text-ink-soft mb-2;
  }
  .puerta-quien {
    @apply block text-2xs text-ink-soft border-t border-line pt-2;
  }
```

> **Los nombres de clase de este bloque están verificados uno por uno contra el `@theme`** — se compiló un archivo sonda que los usa y se comprobó que Tailwind emite cada regla. Escribilos **verbatim**.
>
> **Y cuidado con cómo se verifica.** La primera sonda de este plan usó `grep '\.rounded\b'` y dio OK, pero matcheaba `.rounded-md`: el guion es límite de palabra, así que `\b` no separa una clase de sus variantes. `rounded` **no existe** —el `@theme` mata el radio DEFAULT con `--radius-*: initial` y solo define `sm/md/lg/xl`—, y el radio correcto es `rounded-md`, el mismo `--radius-md` que usa `.side-card`. Ese caso sí falla ruidoso, porque `@apply` con una clase desconocida es error de build; los que fallan en silencio son los de color. La primera redacción de este plan usaba `border-brand` y `bg-gray-50`, y **ninguna de las dos existe**: el `@theme` es cerrado, así que no rompen el build — simplemente no existe la regla y la puerta sale sin borde de hover y sin fondo, en silencio. Los nombres correctos son los semánticos que ya usa el repo: `border-line`, `border-primary-light`, `bg-surface`, `text-ink`, `text-ink-soft`. **No agregues ningún token nuevo al `@theme` para esta tarea.**

- [ ] **Step 4: el helper de markup**

En `assets/js/render.js`, antes de `function franjaTrabajo(`, agregar:

```js
  /* Las dos puertas de entrada. El contrato: `href: null` significa que la
     puerta no tiene adónde llevar, y entonces `motivo` es obligatorio y se
     pinta en lugar de la bajada. Es la regla de que un control apagado dice
     POR QUÉ: en E6 no hay ningún video esperando link, y una puerta que
     lleva a una lista vacía es peor que una puerta apagada que lo explica. */
  function puertas(lista) {
    return lista.map(function (p) {
      const cuerpo =
        '<span class="puerta-titulo">' + esc(p.titulo) + "</span>" +
        '<span class="puerta-bajada">' + esc(p.href ? p.bajada : p.motivo) + "</span>" +
        '<span class="puerta-quien">' + esc(p.quien) + "</span>";
      return p.href
        ? '<a class="puerta" href="' + esc(p.href) + '">' + cuerpo + "</a>"
        : '<div class="puerta" aria-disabled="true">' + cuerpo + "</div>";
    }).join("");
  }
```

Y en el objeto exportado, junto a `franjaTrabajo`:

```js
    puertas: puertas,
```

- [ ] **Step 5: el montaje en `modulos.html`**

En `modulos.html`, en la franja de inicio, **antes** de `<div data-hito></div>` (línea 157), insertar:

```html
              <div class="puertas" data-puertas></div>
```

Y en el script inline, **antes de la línea `if (esc === "E1") return;`** (hoy línea 323), insertar:

> **Ojo con el punto de montaje, que es lo único delicado de esta tarea.** `modulos.html` tiene un `return` temprano para E1 —«el día 0 lo cubre su placeholder»— y está **antes** de `R.pintar("[data-hito]", …)`. Si el bloque de las puertas se monta ahí, en E1 no se pinta nada y la prueba del Step 6 da `activas=0 apagadas=0` en vez de `1/1`. Las puertas tienen que quedar **arriba de ese `return`**: en el día 0 la puerta de reservar IDs es justamente la que tiene que estar.

```js
        /* ── Las dos puertas ─────────────────────────────────────────────
           Fase 4 del prompt de simplificación, sin su pantalla: el hub
           informaba y derivaba, que es por lo que se eliminó el panel de obra.
           Acá cada puerta lleva a la pantalla donde la tarea se hace. */
        const esperandoLink = S.sinLink(esc);
        R.pintar("[data-puertas]", R.puertas([
          {
            titulo: "Cargar el link de un video ya grabado",
            bajada: "Hay " + esperandoLink.length +
              (esperandoLink.length === 1 ? " video con su ID reservado" : " videos con su ID reservado") +
              " esperando el link. Entrás a la ficha y cargás la versión.",
            quien: "Cualquiera del equipo · no hace falta saber la estructura de antemano",
            href: esperandoLink.length
              ? "video.html?v=" + esperandoLink[0].id + (esc === "E5" ? "" : "&escena=" + esc)
              : null,
            motivo: "Ningún video está esperando link en este momento.",
          },
          {
            titulo: "Reservar los IDs de lo que se va a grabar",
            bajada: "Entra la estructura del mapa desde la planilla maestra. " +
              "Los videos quedan en backlog, sin link, listos para guionar.",
            quien: "Producción de contenido · el lote se pega de una vez",
            href: "importador.html" + (esc === "E5" ? "" : "?escena=" + esc),
            motivo: null,
          },
        ]));
```

> `esc` es la escena activa, ya declarada arriba en ese script (es la variable que usan `q` y los `href` de la franja). No la redeclares.

- [ ] **Step 6: recompilar, correr la prueba y verificar que pasa**

```bash
npm run build
google-chrome --headless=new --virtual-time-budget=6000 \
  --dump-dom "http://localhost:4321/_prueba-puertas" 2>/dev/null \
  | sed -n '/<pre id="out">/,/<\/pre>/p'
```

Esperado, exacto:

```
E1 · visible=false activas=0 apagadas=0 mudas=0
E2 · visible=true  activas=2 apagadas=0 mudas=0
E3 · visible=true  activas=2 apagadas=0 mudas=0
E4 · visible=true  activas=2 apagadas=0 mudas=0
E5 · visible=true  activas=2 apagadas=0 mudas=0
E6 · visible=true  activas=1 apagadas=1 mudas=0
FIN
```

> **En E1 no se pinta ninguna puerta, y es correcto.** El placeholder del día 0 ya cumple esa función, y mejor: explica que no hay contenido cargado y su CTA primario es «Importar el mapa de contenido» → `importador.html`, que es **exactamente el destino de la segunda puerta**, con «crear el primer módulo a mano» como salida secundaria. Mostrar las puertas ahí daría una puerta muerta más un duplicado del CTA que está justo arriba. Por eso el `R.pintar` va **abajo** de `if (esc === "E1") return;`: pintar dentro de un contenedor oculto es trabajo para nadie.
>
> La primera redacción de este plan esperaba `E1 · activas=1 apagadas=1` y montaba el bloque arriba de ese `return`. Estaba mal por las dos puntas — el número y el lugar — y la prueba que contaba nodos no lo detectó.

Después:

```bash
rm _prueba-puertas.html
kill %1
```

- [ ] **Step 7: batería completa + accesibilidad de la pantalla**

Correr los 5 bloques de «Batería de regresión». `cmp` del bloque 5 tiene que dar sin diferencias **después** del `npm run build`.

Además, sobre `modulos.html`: un solo `<h1>`, jerarquía sin saltos, sin IDs duplicados, y los dos `.puerta` con nombre accesible. Al auditar el DOM volcado, **sacá primero los `<script>`**: el dump incluye su texto y los templates del render se cuentan como markup real.

- [ ] **Step 8: documentar**

En `DESIGN-SYSTEM-EXTENSIONS.md`, sección 6, agregar la entrada de `.puertas` / `.puerta` explicando que la apagada es un `div` y no un `a` sin `href`, y por qué.

En `CLAUDE.md`, en el bullet «**El panel es la pantalla de inicio**», agregar al final:

```markdown
  Sobre esa franja se montaron las **dos puertas** de la Fase 4 del prompt de
  simplificación —cargar el link de algo ya grabado, o reservar los IDs de lo
  que se va a grabar—. Se montaron **ahí y no en una pantalla nueva**: un hub
  «¿Qué querés hacer?» informa y deriva, que es exactamente por lo que se
  eliminó el panel de obra.
```

- [ ] **Step 9: commit**

```bash
git add src/input.css assets/css/academia.css assets/js/render.js modulos.html \
        DESIGN-SYSTEM-EXTENSIONS.md CLAUDE.md
git commit -m "feat(panel): las dos puertas de entrada, sin la pantalla que pedian

Fase 4 del prompt de simplificacion. El hub «¿Que queres hacer?» informaba y
derivaba, que es por lo que se elimino el panel de obra: las dos puertas van
en el inicio, donde cada una lleva a la pantalla en la que la tarea se hace.
En E6 no hay ningun video esperando link, asi que esa puerta va apagada CON
el motivo a la vista, y como div y no como link sin href.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: Microcopy por tarea

La sección «Microcopy» del prompt pide nombrar por la tarea y no por la tabla. Hoy los rótulos son **de dominio** («Título», «Tag de plan», «Secuencia»), que no es lo mismo que de tabla, pero tampoco es la tarea.

**Límite que no se cruza:** se cambia **solo texto visible**. `data-campo="secuencia"`, `data-estado`, `data-paso-estado` y los nombres de campo del dataset **no se tocan** — ese vocabulario se copia a desarrollo, y renombrarlo rompe el contrato con `academia-import.js` y con la materialización del overlay.

**Files:**
- Modify: `alta-videos.html` — los dos `<th>` de la grilla **y los dos `<label class="sr-only">` de esas mismas columnas**
- Modify: `video.html` — el label del campo `f-titulo`
- Modify: `alta-modulo.html` — el label del campo `planes`
- Modify: `design-system.html` — tabla de microcopy, **solo con filas verdaderas**

> **Dos cosas que la primera redacción de esta tarea hizo mal, y son la lección.**
>
> **Una:** cambiaba el `<th>` visible y dejaba el `<label class="sr-only">` de esa misma celda con el nombre viejo. La grilla emite un label por celda, así que la columna quedaba llamándose «¿Qué enseña este video?» con los ojos y «Título fila 1» con un lector de pantalla. Los `<th>` y los labels de las columnas que se tocan **se cambian juntos**; los de `Secuencia`, `Sección` y `Cohorte` quedan intactos porque sus encabezados no cambian.
>
> **La otra:** la tabla declaraba en su columna «Dónde» pantallas donde el rótulo no estaba escrito —`video.html` decía «Título», `alta-modulo.html` decía «Planes»—. Una tabla rotulada como contrato verificable que afirma cuatro cosas falsas es peor que no tenerla. **Toda fila que se deje tiene que tener su grep**, y el rótulo se implementa en *todas* las pantallas que la fila nombra: la regla del proyecto dice que una acción conserva el mismo nombre en todo el flujo, así que cambiarlo en el alta y no en la ficha del mismo video es la inconsistencia que la tarea venía a eliminar.
>
> **`alta-seccion.html` y `banco.html` quedan afuera**, y no por alcance sino por motivo: «¿Visible para las agencias?» describiría un estado que este modelo no tiene (ver **D-26**), y «Sub-tema del banco» esconde que el sub-tema *es* el título de la sección, que es justo lo que hace entendible la regla.

**Interfaces:**
- Consumes: nada. Es una tarea de texto.
- Produces: nada que otra tarea consuma.

- [ ] **Step 1: escribir el control que falla**

En `design-system.html`, en la sección de vocabulario, agregar la tabla de equivalencias como **contrato verificable**:

```html
            <table class="table-dense" data-microcopy>
              <caption class="sr-only">Rótulos por tarea, y el término de dominio que reemplazan</caption>
              <thead>
                <tr><th scope="col">Se ve</th><th scope="col">Reemplaza a</th><th scope="col">Dónde</th></tr>
              </thead>
              <tbody>
                <tr><td>¿Qué enseña este video?</td><td>Título</td><td>alta-videos, video</td></tr>
                <tr><td>¿A qué planes aplica?</td><td>Tag de plan</td><td>alta-videos, alta-modulo</td></tr>
                <tr><td>Reservar IDs <em>(ya estaba)</em></td><td>Guardar / Enviar</td><td>alta-videos</td></tr>
              </tbody>
            </table>
```

Y el control, en bash:

```bash
# Cada rótulo declarado en la tabla de microcopy existe en la pantalla que dice.
grep -o '¿Qué enseña este video?' alta-videos.html   # → 1 línea
grep -o '¿A qué planes aplica?'   alta-videos.html   # → 1 línea
grep -c 'Reservar IDs'            alta-videos.html   # → ya da 5: es el control de no-regresión
```

- [ ] **Step 2: correr y verificar que falla**

Los tres greps de arriba dan vacío.

- [ ] **Step 3: aplicar los rótulos**

En `alta-videos.html`, en el `<thead>` de la grilla (líneas 155-161), cambiar **solo** el texto de las celdas:

```html
                      <th scope="col" class="w-[90px]">Secuencia</th>
                      <th scope="col" class="w-[140px]">ID que queda</th>
                      <th scope="col" class="w-[170px]">Sección</th>
                      <th scope="col">¿Qué enseña este video?</th>
                      <th scope="col" class="w-[130px]">¿A qué planes aplica?</th>
                      <th scope="col" class="w-[90px]">Cohorte</th>
```

> «Secuencia», «ID que queda» y «Sección» **se quedan como están**: los tres nombran algo que la persona ve y compara en la grilla, y «¿Qué número de orden le toca?» es más largo sin ser más claro. La regla es nombrar por la tarea cuando el término de dominio esconde la tarea, no reescribir todo.

**El botón primario no se toca.** `alta-videos.html:102` ya dice `Reservar IDs`, y en `alta-videos.html:445-446` se re-rotula contando —«Reservar 4 IDs»—, que es mejor de lo que pide el prompt. El grep del Step 1 está ahí como control de **no regresión**: que una pasada de microcopy no lo empeore.

En `alta-modulo.html`, línea 107 (`<h2 class="side-title" id="ident">Identidad</h2>`) queda: es un encabezado de zona, no un campo.

- [ ] **Step 4: correr y verificar que pasa**

Los dos primeros greps del Step 1 dan una línea cada uno; el tercero sigue dando `5`.

- [ ] **Step 5: batería completa**

Correr los 5 bloques. Atención al bloque 2: el rótulo nuevo no puede introducir `font-medium`/`font-semibold` ni una clase de paleta por defecto. Y correr el barrido headless de las 6 escenas × `alta-videos` para confirmar que la grilla sigue pintando.

- [ ] **Step 6: commit**

```bash
git add alta-videos.html design-system.html
git commit -m "feat(alta): los rotulos de la grilla nombran la tarea, no la columna

Seccion «Microcopy» del prompt de simplificacion. Se cambia SOLO texto
visible: data-campo, data-estado y los nombres del dataset se quedan, porque
ese vocabulario se copia a desarrollo y renombrarlo romperia el contrato con
el importador y con la materializacion del overlay. «Secuencia», «ID que
queda» y «Seccion» tambien se quedan: nombran algo que se ve y se compara en
la grilla, y la regla es nombrar por la tarea cuando el termino de dominio la
esconde, no reescribir todo.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

# BLOQUE B — compuertas

Nueve puntos donde el prompt contradice una decisión ya tomada y cableada. **Ninguno se implementa sin que la decisión esté resuelta y anotada en `design-system.html`.** Cada uno lleva la evidencia y la opción que recomiendo.

El propio prompt lo pide así: *«Cuando una decisión dependa de producto y no de código, paralo y preguntá. No elijas por mí y sigas.»*

### D-18 · ¿El alta pide el link cuando «ya lo tengo grabado»?

- **Pide el prompt (Fase 3):** tercera decisión del alta = «ya lo tengo grabado» → pide link. El HTML modelo tiene `<input type="url" id="qlink">`.
- **Dice el repo:** R11 — *«El alta nunca pide un link de YouTube: son IDs reservados»*, verificado por el grep `grep -nE '<(input|textarea)[^>]*(type="url"|link|youtu)' alta-videos.html importador.html`.
- **Recomiendo: NO cambiar R11.** La Task 2 ya resolvió el problema que la Fase 3 quería resolver, y por la vía que el propio prompt propone en la Fase 4: separar las dos tareas en dos puertas. Un `type="url"` en el alta hace fallar un control de disciplina **y** vuelve el alta un formulario de dos modos.
- **Si se decide lo contrario:** hay que modificar el grep de R11 para excluir el campo nuevo, y esa exclusión deja de proteger contra el caso que el grep existía para atrapar.

### D-19 · ¿Las preguntas se importan desde planilla?

- **Pide el prompt (Fase 5.b):** *«Mismo flujo para el banco de preguntas, con columnas distintas y `sub-tema` obligatorio.»*
- **Dice el repo:** R13 — *«las preguntas no se importan nunca»*. Nacen del trabajo, en `escritura.html`, con `colaDeEscritura()` como cola por video.
- **Recomiendo: NO importar preguntas.** El motivo de R13 sigue en pie: 438 de las 550 del dataset son relleno estructural precisamente porque escribir las reales es trabajo de contenido. Una vía de import las volvería a hacer parecer cargadas sin estarlo.
- **Costo de decidir lo contrario:** `academia-import.js` gana un segundo formato de planilla, y `verificar()` necesita un control que garantice que ninguna pregunta importada quede con `subtema` que no sea una sección de su módulo.

### D-20 · ¿`banco.html` pasa a ser solapa del módulo?

- **Pide el prompt (Fase 6):** *«llevá `banco.html` a ser una solapa del módulo, no una pantalla suelta»*.
- **Dice el repo:** `banco.html` es destino del sidebar **y** el paso 3 de `pasosDeModulo()`. `CLAUDE.md` advierte: *«El tablero y los bancos NO son destinos que se conserven por las dudas: son los pasos 2, 3 y 4. Sin ellos el módulo no llega a `activo`.»*
- **Recomiendo: reubicar, nunca eliminar.** Se puede sumar el banco como solapa dentro de `modulo.html` conservando `banco.html?m=` como deep-link —el prompt lo permite explícitamente: *«cada estado alcanzable por URL debe ser alcanzable también por un control visible»*—. Es una tarea real de ~1 día. **No** entra en el Bloque A porque toca el paso 3 del tablero de cinco pasos y hay que rehacer el barrido headless de los 13 `banco?m=`.

### D-21 · ¿El orden de una sección se desacopla de la secuencia?

**Esta es la que el prompt pidió explícitamente que le avisara.**

- **Pide el prompt (Fase 2):** *«Si hace falta cambiar el orden en que la agencia ve los videos, se usa el campo `orden`, que es independiente del ID. Si al auditar encontrás un caso donde esto no alcanza, avisame antes de implementar otra cosa.»* Y el HTML modelo ofrece «↑ Subir / ↓ Bajar» en la ficha de sección.
- **El caso donde no alcanza, con evidencia:** `ordenDeSeccion()` en `academia-sim.js` devuelve **la secuencia más baja de los videos de la sección**, y solo cae al campo `orden` explícito cuando la sección **no tiene videos**. O sea: en las 31 secciones del dataset el campo `orden` **no se lee**. Mover una sección hacia arriba exigiría renumerar las secuencias de sus videos, y eso viola R2 (el ID sobrevive al regrabado). El comentario de `modulo.html:361` ya dejó los ↑ ↓ como pendiente.
- **Recomiendo: no desacoplar.** El acoplamiento es deliberado y está documentado: *«Hace que ordenar la planilla por ID no pueda romper el syllabus»*, y está verificado por un control que reproduce las 31 secciones. Lo que corresponde es **decirlo en la pantalla**: donde hoy no hay nada, poner que el orden de la sección lo define el ID más bajo de sus videos. Un rótulo, no un gesto.

### D-22 · ¿Se puede mover un video a otra sección?

El prompt lo lista dentro de la Fase 5.a, la que llama *«lo más barato y lo que más alivia»*. **En este repo es lo más caro de todo el prompt.**

- **Lo demás de la Fase 5.a ya está**, y va más lejos de lo que pide: `tablero.html:199-215` tiene barra de acciones en lote con cambiar estado, asignar cohorte y agregar a la cola de regrabación, sobre `UI.seleccionados()`, escribiendo en el overlay uno por video.
- **Lo que falta es «mover a otra sección», y la evidencia de por qué es caro:**
  - `seccionesDe()` arma cada sección desde `modulo.secciones[].videos` — **la sección posee sus videos**. El campo `seccion` del video es derivado al indexar, así que pisarlo por overlay **no lo mueve**.
  - `EDITABLES = ["titulo", "cohorte", "duracion", "planes"]` — `seccion` no está, y `CLAUDE.md` es explícito: *«Escribir cualquier otro campo persiste el JSON pero ningún cálculo lo consume.»*
  - Los mínimos de banco salen de `D.minimosDeSeccion(modulo)`, derivados de los videos de la sección: mover un video **cambia los mínimos de las dos secciones**, y con ellos las cadenas 3, 4 y 5 de `BAK-M30` y la `cuotaDeVideo()` de todos sus hermanos.
  - Las preguntas se filtran por `p.subtema === s.titulo`. Un video movido **deja sus preguntas en la sección vieja**: la nueva lo cuenta con banco 0 y la vieja queda con preguntas cuyo `videoOrigen` ya no está ahí. Es la condición de huérfano exacta.
- **Recomiendo el recorte:** habilitar mover **solo videos con 0 preguntas**, y para el resto dejar la acción deshabilitada con el motivo a la vista —«3 de los seleccionados tienen preguntas escritas: moverlos dejaría su banco fuera de sección»—. Eso evita extender dos contratos de overlay y es exactamente lo que manda la regla del botón que no hace nada. La migración de `subtema` queda como decisión aparte.

### D-23 · Fuente de verdad: ¿manda el backoffice o manda el Google Sheets?

El prompt la marca como **bloqueante** y no la resuelve: *«Si quedan las dos vivas en paralelo hay doble carga y divergencia garantizada. Es decisión de producto, no de código.»* Sigue abierta. Ninguna tarea del Bloque A depende de ella; **toda ampliación del importador sí**.

### D-24 · ¿La secuencia se sigue pudiendo tipear?

- **Pide el prompt (Fase 2):** *«Ningún formulario debe tener un input de texto para el ID»* y *«no habilites intercalado manual de secuencia»*.
- **Dice el repo:** `alta-videos.html:368` tiene un `<input data-campo="secuencia">` editable por fila. Es deliberado: propone la próxima libre de 10 en 10, y `alta-videos.html:396-401` valida el duplicado nombrando el video que ya ocupa esa secuencia. La última fila de la semilla **propone a propósito una secuencia ya ocupada**, para que el error se vea sin provocarlo.
- **Recomiendo: conservarlo, y anotar la excepción.** No es «tipear el ID»: la superficie y el módulo van con candado (R2) y lo editable es solo el tramo que decide dónde se intercala. Sacarlo obligaría a reservar los IDs siempre al final, y el mapa de contenido tiene huecos de secuencia a propósito —`BAK-M30` va 010, 020, 050 en su primera sección— que hoy se pueden reproducir y sin el campo no.
- **Si se decide sacarlo:** hay que decidir antes cómo se cargan esos huecos, o el importador queda como única vía para reproducir el mapa real.

### D-25 · ¿Cómo se detecta que un video «que ya tengo» es un ID ya reservado?

- **Pide el prompt (Fase 4):** *«al entrar por “ya lo tengo grabado”, el sistema debe buscar si existe un ID reservado con título parecido y ofrecer completarlo en vez de crear un duplicado. Proponeme cómo detectarlo antes de implementarlo.»*
- **Lo que la Task 2 ya resuelve sin detección:** la puerta no crea nada — lleva directo a la ficha de un video que **ya está** reservado y esperando link. Mientras la entrada sea esa, el duplicado no se puede producir.
- **Cuándo hace falta igual:** si alguien entra por `alta-videos.html` y reserva un ID para algo que ya estaba reservado con otro título. Hoy eso lo atrapa la validación de secuencia duplicada, pero no la de **título** duplicado.
- **Recomiendo, si se decide implementarlo:** comparar por título normalizado —minúsculas, sin tildes, sin signos, palabras ordenadas— **dentro del módulo**, no en los 55, y ofrecer la coincidencia como aviso que no bloquea, igual que hace D-1 con la checklist. Nada de distancia de edición: con 4 a 7 videos por módulo, un umbral difuso genera más falsos positivos que aciertos.

### D-26 · «Un módulo inactivo no acepta videos nuevos» — la regla no tiene referente

- **Pide el prompt:** está en la lista de *reglas de integridad duras* que dice que no se tocan, y la Fase 6 la quiere visible: *«el botón “agregar video” no existe; el nodo aparece atenuado con la leyenda de por qué»*. El HTML modelo lo muestra con `BAK-M35`.
- **Dice el repo:** los estados de módulo son **`borrador` · `reservado` · `activo`**, no activo/inactivo. En E2 los 12 módulos están en `borrador` y en E6 los 12 están `activo`. **No existe un estado «inactivo después de haber estado activo»**: por D-4 la aptitud es una compuerta al activar, no una condición permanente.
- **Consecuencia:** si `borrador` se tratara como «inactivo», ningún módulo aceptaría videos nunca —hay que poder cargarle videos justamente antes de activarlo—, y la Academia no se podría construir. La regla del prompt describe un estado que este modelo no tiene.
- **Recomiendo: declarar la regla inaplicable y anotarlo**, en vez de agregar un estado `pausado` para sostenerla. Si en algún momento hace falta retirar un módulo ya activo, ahí se decide el estado nuevo — y ahí la regla recupera su referente.

### Fuera de alcance, y por qué

- **`role="tree"` con flechas y `Home`/`End`:** no hay un solo `role="tree"` en el repo (verificado). El árbol del prompt abarca los 12 módulos a la vez, y **por eso** necesita expandir/colapsar. El repo dividió eso a propósito en dos pantallas: `modulos.html` (los 11) y `modulo.html?m=` (uno, con sus 3 o 4 secciones). Ponerle semántica de widget de árbol a un esquema plano de cuatro nodos es ceremonia contra R6. **Recomiendo no hacerlo** y anotarlo como decisión cerrada.
- **Escenas E1–E5:** el prompt dice *«no elimines el sistema de escenas E1–E5»*. Hoy son **E1–E6**. Nada que hacer: se conservó y se amplió.
- **Vistas de seguimiento para staff:** el prompt las excluye y el repo ya las sacó por D-17. Coinciden.
- **La cláusula «sin `localStorage` ni `sessionStorage`»** del piso de calidad está vencida: el repo los usa en el motor desde el cambio de arquitectura, con su justificación escrita. No se revierte.

---

## Orden de ejecución

1. **Task 1** — `sinLink()` + controles. Sola, porque la Task 2 la consume.
2. **Task 2** — las dos puertas. Depende de 1.
3. **Task 3** — microcopy. Independiente; puede ir en paralelo a 1.
4. **Compuertas D-18 a D-26** — resolver con María Cecilia, anotar en `design-system.html`, y recién entonces planificar las tareas que habiliten.

Al terminar cada tarea: resumen de qué cambió, qué archivos se tocaron, y qué quedó dudoso. **Sin commit, merge ni push sin mostrar antes el resumen de pasos y esperar confirmación** — y el flujo de ramas y tickets SGM del equipo va por la skill `pushear-a-git`.

---

# BLOQUE C — lo que habilitan las decisiones

Las nueve decisiones del Bloque B quedaron **cerradas y anotadas** en `design-system.html` (D-18 a D-26) el 31/08/2026. Seis se cierran sin trabajo; **tres habilitan tarea**.

| Decisión | Qué se resolvió | Trabajo |
|---|---|---|
| D-18 | El alta nunca pide el link — cerrada **por construcción** con las dos puertas | ninguno |
| D-19 | Las preguntas no se importan; R13 se conserva | ninguno |
| D-20 | El banco pasa a **solapa del módulo**, y `banco.html?m=` sigue como deep-link | **C3** |
| D-21 | El orden de sección lo sigue dando el ID más bajo; falta el **rótulo** | **C1** |
| D-22 | Mover un video se habilita **solo si no tiene preguntas** | **C2** |
| D-23 | **Manda el backoffice**; el Sheets es el origen de la carga inicial | ninguno |
| D-24 | La secuencia editable queda como excepción declarada | ninguno |
| D-25 | La detección de duplicado no hace falta todavía | ninguno |
| D-26 | «Módulo inactivo» no tiene referente; la regla queda inaplicable | ninguno |

**Orden recomendado: C1 → C2 → C3.** C1 es barata y cierra D-21. **C2 va antes que C3 a propósito**, aunque sea más riesgosa: toca la pertenencia de un video a su sección en el motor, y `seccionesDe()` es justo lo que C3 va a consumir para pintar el banco. Hacerla primero significa que C3 se construye sobre la semántica final, y que si C2 sale peor de lo previsto se para **antes** de invertir en la tarea más grande.

La **Batería de regresión** y las **Global Constraints** de este plan aplican tal cual. El baseline al abrir el Bloque C es **129 controles, 0 fallas**.

---

### Task C1: el rótulo del orden de sección (D-21)

Hoy `modulo.html` pinta el título «Árbol de secciones» y **nada** que explique de dónde sale el orden. El campo `orden` explícito no se lee en ninguna de las 31 secciones, y los ↑ ↓ no tienen dónde escribir: la secuencia manda. Eso es deliberado y hay que decirlo, porque un orden que no se puede cambiar y no se explica se lee como un bug.

**Files:**
- Modify: `modulo.html` — un `<p class="hint">` debajo de `[data-arbol-titulo]` (hoy línea 120)
- Modify: `CLAUDE.md` — la fila de `ordenDeSeccion()` en la tabla de reglas

**Interfaces:**
- Consumes: `SIM.ordenDeSeccion(seccion)` y `SIM.seccionesDe(modulo)`, ya existentes. No necesita nada nuevo del motor.
- Produces: nada que otra tarea consuma.

- [ ] **Step 1: escribir el control que falla**

```bash
grep -c 'secuencia más baja</strong> de sus videos' modulo.html   # → 1
grep -c 'data-arbol-orden' modulo.html                            # → 2 (el markup y la línea que lo oculta)
```

- [ ] **Step 2: correr y verificar que falla** — los dos dan `0`.

> **El control mide la cadena que el markup TIENE, tags incluidos.** La primera redacción de este plan pedía el markup con `<strong>secuencia más baja</strong>` y un control `grep -c 'la secuencia más baja'`, que con el tag puesto da **0**: el brief se contradecía solo, y el implementador lo resolvió sacando el énfasis. Es al revés — el énfasis es lo que el lector necesita ver de un vistazo, así que **el markup manda y el control se adapta**.

- [ ] **Step 3: el rótulo**

En `modulo.html`, inmediatamente después de `<h2 class="side-title !mb-0" data-arbol-titulo></h2>`, insertar:

```html
              <p class="hint !mt-0" data-arbol-orden>
                Las secciones se ordenan por la <strong>secuencia más baja</strong> de sus videos, no
                por un campo aparte. Para cambiar el orden se reserva el ID que corresponde: así
                ordenar la planilla por ID no puede romper el syllabus.
              </p>
```

> Solo se pinta en el árbol de secciones, **no** en la Ruta Esencial: ahí el orden lo da el recorrido del cohorte (R8) y la frase sería falsa. El script inline ya distingue los dos casos con `esRuta`, así que el rótulo se oculta en la rama de la Ruta.

En el script inline, dentro de la rama `if (esRuta) { … }`, junto al `document.querySelector("[data-arbol-titulo]").textContent = …`, agregar:

```js
          document.querySelector("[data-arbol-orden]").hidden = true;
```

- [ ] **Step 4: correr y verificar que pasa** — los dos greps dan `1`, y el rótulo **no** aparece en la Ruta:

```bash
curl -s "http://localhost:4321/modulo?m=R01" | grep -c 'data-arbol-orden'     # → 1 (el nodo existe)
google-chrome --headless=new --virtual-time-budget=6000 \
  --dump-dom "http://localhost:4321/modulo?m=R01" 2>/dev/null \
  | grep -o 'data-arbol-orden hidden\|hidden data-arbol-orden'                 # → una coincidencia
```

- [ ] **Step 5: batería completa** — los 5 bloques. El rótulo usa `hint`, que ya existe: el `cmp` del CSS no debería moverse.

- [ ] **Step 6: `CLAUDE.md`** — en la fila de **Orden de una sección**, **cerrar la oración anterior con un punto** —`…ahí manda su `orden` explícito.`— y después agregar: `La pantalla lo dice: el árbol de secciones lleva el rótulo de dónde sale ese orden, porque un orden que no se puede cambiar y no se explica se lee como un bug. En la Ruta no se pinta —ahí el orden lo da el cohorte (R8)—.`

- [ ] **Step 7: commit**

```bash
git add modulo.html CLAUDE.md
git commit -m "feat(modulo): el arbol dice de donde sale el orden de sus secciones

Cierra D-21. El campo `orden` no se lee en ninguna de las 31 secciones: manda
la secuencia mas baja de los videos, y es deliberado —hace que ordenar la
planilla por ID no pueda romper el syllabus—. Faltaba decirlo: un orden que no
se puede cambiar y no se explica se lee como un bug. En la Ruta no se pinta,
porque ahi el orden lo da el recorrido del cohorte (R8).

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task C2: mover un video a otra sección, en lote (D-22)

La barra de acciones en lote de `tablero.html` ya tiene cambiar estado, asignar cohorte y agregar a la cola. Falta **mover a otra sección**, habilitado solo para videos sin preguntas.

**El nudo, y cómo se resuelve.** `seccionesDe()` arma cada sección desde `modulo.secciones[].videos` — la sección **posee** sus videos y el campo `seccion` del video es derivado al indexar. Así que pisar `v.seccion` por overlay **no lo mueve**. Y `minimosDeSeccion()` vive en `academia-data.js`, lee `s.videos.length` de la lista **estructural**, y su propio comentario dice «es la única puerta: nadie más reparte estos números».

**Decisión de implementación, ya tomada:** los mínimos **no siguen** al video movido. Se quedan con el reparto estructural.
- Motivo: hacerlos seguir obliga a mover el cálculo de mínimos al motor o a pasarle un override, y eso rompe la regla de que `academia-data.js` es DATO y no lógica — además de tocar sus 4 consumidores, dos de los cuales son los controles de las 5 cadenas.
- Consecuencia declarada: la sección destino reparte su mínimo entre un video más. Lo **exigible** sigue siendo el mínimo por sección y el total por módulo no cambia; lo que se corre es `cuotaDeVideo()`, que el propio motor declara **orientativa**.
- Y la restricción de D-22 lo mantiene inofensivo: solo se mueven videos con **0 preguntas**, así que ninguna pregunta queda huérfana de su sección.

**Files:**
- Modify: `assets/js/academia-sim.js` — `seccionesDe()` agrupa por la sección **efectiva**; `seccion` entra a los campos que el overlay consume; 4 controles nuevos
- Modify: `tablero.html` — la acción en lote, con su compuerta y su motivo
- Modify: `CLAUDE.md` — la tabla de campos del overlay y los conteos de controles

**Interfaces:**
- Consumes: `anotar("videos", id, campos)` · `seccionesDe(modulo, escena)` · `bancoDe(numero, escena)` · `UI.seleccionados()`.
- Produces: `SIM.seccionEfectiva(video, escenaId) → string` (el título de la sección donde el video vive hoy: el parche del overlay si existe, y si no la sección estructural). C3 la consume para pintar el banco por sección.

- [ ] **Step 1: escribir los tres controles que fallan**

En `auditar()`, después del control «Ningún video sin sección»:

```js
    /* -- Mover un video de sección (D-22) --------------------------------
       Los cuatro controles cubren la invariante de R12 extendida al movimiento,
       y la compuerta que la hace cierta. Sin el tercero, la restricción de
       D-22 sería una promesa de la pantalla y no una propiedad del motor. */
    chequeo(
      "Sección efectiva · sin overlay coincide con la estructural en los 55",
      todos().every(function (v) { return seccionEfectiva(v) === v.seccion; }),
      "el derivado se despegó del dataset limpio"
    );

    chequeo(
      "Sección efectiva · siempre devuelve una sección real del módulo",
      todos().every(function (v) {
        const m = modulosPorNumero[v.modulo];
        return !m || m.secciones.some(function (s) { return s.titulo === seccionEfectiva(v); });
      }),
      "algún video quedó apuntando a una sección que su módulo no tiene"
    );

    chequeo(
      "Sección efectiva · los videos de cada sección salen ordenados por secuencia",
      catalogo().filter(function (m) { return m.tipo === "biblioteca"; }).every(function (m) {
        return seccionesDe(m).every(function (s) {
          return s.videos.every(function (v, i) {
            return i === 0 || v.secuencia >= s.videos[i - 1].secuencia;
          });
        });
      }),
      "alguna sección devolvió sus videos desordenados"
    );

    chequeo(
      "Mover · ningún video con preguntas es movible",
      todos().every(function (v) {
        const conPreguntas = padronPreguntas().filter(function (p) {
          return p.videoOrigen === v.id;
        }).length > 0;
        return !conPreguntas || !movible(v);
      }),
      "la compuerta de D-22 no está cerrada en el motor"
    );
```

> **El accesor de módulos:** dentro de la IIFE existen `modulos` (local, línea 292), `catalogo()` y `D.modulos`, y los controles de `auditar()` usan los dos últimos —`D.modulos` en la línea 1628 y `catalogo()` en la 1763—. Arriba está escrito `catalogo()`, que es lo que usa el control más cercano. **Si el control que quede inmediatamente arriba del tuyo usa otro, usá ese**: la consistencia local vale más que mi elección. Los tres ven el dataset limpio, porque `verificar()` levanta `ignorarOverlay`.
>
> **Ojo:** este plan ya cometió **dos veces** el mismo error —escribir `videos(esc)` y `modulo(v.modulo)`, que dentro de la IIFE **no existen**: son claves del objeto exportado—. Los nombres internos son **`todos()`** y **`modulosPorNumero[]`**, y así están escritos arriba. Copiá el bloque revisándolo, no en piloto automático. Y si al implementar encontrás cualquier otro dato de este plan que no cierre contra el árbol, **avisá antes de adaptarlo**: en este plan ya hubo ocho números y snippets mal.

- [ ] **Step 2: correr y verificar que falla** — `ReferenceError: seccionEfectiva is not defined`.

- [ ] **Step 3: el motor**

Tres cambios en `assets/js/academia-sim.js`:

1. Agregar `"seccion"` a `EDITABLES` (hoy `["titulo", "cohorte", "duracion", "planes"]`), con el comentario de por qué es distinto de los otros cuatro: los otros son atributos del video, este es **pertenencia**, y hay una compuerta encima.

2. Declarar las dos funciones nuevas, antes de `seccionesDe`:

```js
  /* -- Dónde vive hoy un video ---------------------------------------------
     La sección la POSEE el dataset —`modulo.secciones[].videos`— y el campo
     `seccion` del video es derivado al indexar. Mover un video es entonces lo
     único del overlay que cambia una pertenencia y no un atributo, así que
     tiene su propio derivado y su propia compuerta.

     Los mínimos NO siguen al video movido: los reparte `minimosDeSeccion()`,
     que es dato y lee la lista estructural. Lo exigible sigue siendo el mínimo
     por sección y el total del módulo no cambia; lo que se corre es la cuota
     por video, que este motor ya declara orientativa. */
  function seccionEfectiva(video, escenaId) {
    const esc = escenaId || escena;
    const cambio = anotado("videos", video.id, esc) || {};
    return cambio.seccion || video.seccion;
  }

  /* La compuerta de D-22, y vive acá y no en la pantalla: si la escribiera el
     tablero, sería una promesa de la interfaz en vez de una propiedad del
     motor, y `verificar()` no podría auditarla. */
  function movible(video, escenaId) {
    const esc = escenaId || escena;
    return padronPreguntas().filter(function (p) {
      return p.videoOrigen === video.id && alcanzada(p.creadaEn, esc);
    }).length === 0;
  }
```

3. En `seccionesDe()` —hoy **línea 700**, `const vs = s.videos.map(…)`— agrupar por la sección efectiva sobre **todos** los videos del módulo en vez de sobre `s.videos`. La lista de secciones sigue saliendo de `modulo.secciones` —el orden y los mínimos no se tocan—; lo que cambia es qué videos caen en cada una.

> **Y hay que ORDENAR por secuencia, explícitamente.** Es la trampa de este paso y está verificada: `videosDe()` devuelve el padrón, que va **sección por sección**, no globalmente por secuencia. En `BAK-M30` sale `10 · 20 · 50 · 30 · 40 · 60 · 70`. Así que filtrar la lista plana por sección efectiva **sin ordenar** deja el video movido en la posición de su sección **original**. El caso real, medido: mover `.050` de «Carga y proceso» a «Plata: margen e impuestos» da **`50 · 30 · 40`** en vez de `30 · 40 · 50`. Ordená el resultado por `secuencia` ascendente y el problema desaparece.

> **Dato que NO hay que arreglar en esta tarea, pero conviene conocer:** `seccionesDe()` devuelve `orden: s.orden` —el campo del **dataset**—, no `ordenDeSeccion(s)`. Si un movimiento cambia la secuencia mínima de una sección, el número que la pantalla muestra y el que el derivado calcularía pueden discrepar. No lo toques acá: el control que audita las 31 secciones corre sobre el dataset limpio y sigue en verde. Anotalo en tu informe si lo ves.

Exportar `seccionEfectiva` y `movible` junto a `seccionesDe`.

- [ ] **Step 4: correr y verificar que pasa**

```bash
node -e 'global.window={};
  ["academia-data","academia-agencias","academia-guiones","academia-preguntas","academia-sim","academia-import","academia-guia"]
    .forEach(f => require(process.cwd()+"/assets/js/"+f+".js"));
  const S = window.SIM, r = S.verificar();
  console.log("controles:", r.controles.length, "| fallas:", r.fallas.length);
  r.fallas.forEach(f => console.log("  FALLA:", f));
  /* las 5 cadenas de BAK-M30 no se movieron */
  const secs = S.seccionesDe(S.modulo(30));
  console.log("cadena 1:", secs.reduce((a,s)=>a+s.total,0));
  console.log("cadena 4:", secs.reduce((a,s)=>a+s.minimoBanco,0));
  process.exit(r.ok ? 0 : 1)'
```

Esperado: **133 controles, 0 fallas**, `cadena 1: 28` y `cadena 4: 50` — los mismos números que hoy, porque sin overlay nada se movió.

- [ ] **Step 5: la acción en lote**

En `tablero.html`, en la `.bulk-bar`, agregar el dropdown «Mover a otra sección» siguiendo **exactamente** el patrón de los dos que ya están (`data-dropdown` + `data-dropdown-trigger` + `[data-menu-…]`). Dos cosas propias:

- El menú se puebla con las secciones del módulo de los videos seleccionados. **Si la selección cruza módulos, la acción va deshabilitada** con el motivo: mover entre módulos cambiaría el ID, y el ID no cambia nunca (R2).
- Si alguno de los seleccionados tiene preguntas, la acción va deshabilitada y el `title` dice cuántos y por qué: `"3 de los seleccionados tienen preguntas escritas: moverlos dejaría su banco fuera de sección"`. Es la regla del botón que no hace nada, y el veredicto lo da `S.movible()`, no la pantalla.

El handler reusa `enLote({ seccion: titulo })`, que ya existe.

- [ ] **Step 6: probar el movimiento de verdad**

Con el banco de pruebas del iframe, en E5 sobre `BAK-M30`: seleccionar un video sin preguntas, moverlo, y verificar que **aparece en la sección destino y desaparece de la de origen**, que el total de videos del módulo no cambia, y que el mínimo de banco del módulo sigue en 50. Después `?reset=1` y confirmar que vuelve.

- [ ] **Step 7: batería completa + `CLAUDE.md`**

Actualizar: la tabla de campos que el overlay consume (agregar `seccion`, con la compuerta), la tabla de reglas de negocio (`seccionEfectiva()` y `movible()`), y los cuatro conteos de controles, que pasan a **125 · 127 · 131 · 133**.

- [ ] **Step 8: commit**

```bash
git add assets/js/academia-sim.js tablero.html CLAUDE.md
git commit -m "feat(tablero): mover un video a otra seccion, en lote y solo si no tiene preguntas

Cierra D-22. Era lo mas caro del prompt y no lo mas barato: la seccion POSEE
sus videos, asi que mover uno no es pisar un atributo sino cambiar una
pertenencia. Va con su propio derivado, su propia compuerta en el motor —no en
la pantalla, o verificar() no podria auditarla— y tres controles.

Los minimos NO siguen al video movido: los reparte minimosDeSeccion(), que es
dato y lee la lista estructural. Lo exigible sigue siendo el minimo por seccion
y el total del modulo no cambia; lo que se corre es la cuota por video, que el
motor ya declara orientativa.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task C3: el banco, como solapa del módulo (D-20)

`modulo.html` **no tiene solapas hoy** — el patrón vive en `video.html`, con `data-tabs="paneles"`, `role="tablist"`, `data-tab` y `aria-controls`, y `ui.js` ya le cablea las flechas. Esta tarea lo introduce en el módulo por primera vez.

**Lo que no se toca:** `banco.html` **sigue existiendo** y sigue siendo el paso 3 de `pasosDeModulo()`. Es deep-link, y el prompt lo permite explícitamente: cada estado alcanzable por URL tiene que ser alcanzable también por un control visible. Borrarlo dejaría al módulo sin poder llegar a `activo`.

**Files:**
- Modify: `modulo.html` — el `tablist` con dos solapas, los dos paneles, y `?tab=`
- Modify: `assets/js/render.js` — si el resumen del banco necesita un helper propio; reusar los de `banco.html` antes de escribir uno nuevo
- Modify: `index.html` — el índice canónico de URLs
- Modify: `CLAUDE.md` — el contrato de URL (`?tab=` pasa a leerlo también `modulo.html`)
- Modify: `design-system.html` — la fila D-20 pasa de «pendiente de implementación» a describir dónde quedó

**Interfaces:**
- Consumes: `SIM.resumenModulo(modulo)` · `SIM.seccionesDe(modulo)` · `SIM.configEvaluacion(modulo)` · `SIM.seccionEfectiva()` de C2 · los helpers de render que ya usa `banco.html`.
- Produces: nada que otra tarea consuma.

- [ ] **Step 1: escribir los controles que fallan**

```bash
grep -c 'role="tablist"' modulo.html                                    # → 1
curl -s "http://localhost:4321/modulo?m=30&tab=banco" | grep -c 'panel-banco'   # → ≥1
curl -s "http://localhost:4321/banco?m=30" | grep -c '<h1'              # → 1 (sigue vivo)
```

- [ ] **Step 2: correr y verificar que falla** — el primero da `0`.

- [ ] **Step 3: las solapas**

Copiar el patrón de `video.html:116-125` **literal**, cambiando solo los valores: dos solapas, `data-tab="contenido"` (default) y `data-tab="banco"`, con `aria-controls="panel-contenido"` y `aria-controls="panel-banco"`. El árbol de secciones y el tablero de cinco pasos van dentro del panel de contenido; el resumen del banco por sección, en el otro.

> **No dupliques el cálculo del banco.** `banco.html` ya lo resuelve con `resumenModulo()` y `seccionesDe()`; si su markup no está en un helper de `render.js`, extraelo ahí y que **las dos pantallas lo usen**. Dos redacciones del mismo resumen es exactamente el defecto que este repo evita, y la de la solapa sería la que se queda vieja.

- [ ] **Step 4: `?tab=` en `modulo.html`**

Leerlo con `UI.param("tab")`, default `contenido`, y aceptar solo `contenido` · `banco`. Un valor que la pantalla no maqueta **avisa** — regla 2 de las escenas: nunca mostrar otro panel con el rótulo cambiado.

- [ ] **Step 5: correr y verificar que pasa** — los tres controles del Step 1, más el recorrido headless de los **13** `modulo?m=` × las dos solapas, todos 200 y sin errores de consola.

- [ ] **Step 6: batería completa**

Atención a dos bloques: el `cmp` del CSS —las clases `tabs`/`tab` ya existen, pero si agregás algo nuevo hay que recompilar— y los **10 sidebars idénticos**, porque `modulo.html` es una de las diez.

- [ ] **Step 7: la documentación de URL**

`index.html` es el índice canónico y hay que agregar las dos URLs nuevas. En `CLAUDE.md`, la fila de `?tab=` pasa a decir que `modulo.html` también lo lee, con sus dos valores. En `design-system.html`, actualizar la fila **D-20**.

- [ ] **Step 8: commit**

```bash
git add modulo.html assets/js/render.js index.html CLAUDE.md design-system.html
git commit -m "feat(modulo): el banco entra como solapa, y el deep-link se conserva

Cierra D-20. La relacion «las preguntas son del modulo, no del video» se
entiende por ubicacion en vez de explicarse. banco.html sigue vivo como
deep-link —el prompt exige que todo estado alcanzable por URL lo sea tambien
por un control visible— y sigue siendo el paso 3 de pasosDeModulo(): borrarlo
dejaria al modulo sin poder llegar a activo.

Primeras solapas de modulo.html: el patron se copio de video.html, que ya lo
tenia cableado en ui.js.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```
