# Prompt para Claude Code — Simplificar el backoffice de la Academia SIGMMA

> **Cómo usarlo:** abrí Claude Code en la raíz del repo `-wireframe-academia-SIGMMA` y pegá todo lo que sigue.
> Antes de pegarlo, copiá el archivo `wireframe-backoffice-academia-sigmma.html` a `/referencias/` dentro del repo, así lo puede abrir y leer como referencia visual.

---

## Contexto

Estás trabajando sobre el wireframe del **backoffice de la Academia de Autocapacitación SIGMMA**: la plataforma donde las agencias clientes de sigmma.net se autocapacitan con videos y evaluaciones por módulo.

Este repo es hoy una maquetación estática (HTML + Tailwind compilado, sin backend, datos escritos a mano). El objetivo de este trabajo **no es agregar funcionalidad ni conectar un backend**: es **rediseñar el flujo de gestión de contenido para que cualquier persona del equipo pueda cargar y mantener módulos, secciones, videos y preguntas sin entrenamiento previo**, conservando intacta la arquitectura de datos.

El problema actual, en una frase: **la interfaz tiene la forma de la base de datos y no la forma de la tarea.** Hay ABMs separados por entidad (`alta-modulo.html`, `alta-seccion.html`, `alta-videos.html`), lo que obliga a la persona a entender el modelo relacional antes de poder hacer nada. Además, buena parte de la navegación real depende de conocer parámetros de URL (`?escena=`, `?tab=`, `?vista=`, `?paso=`) en lugar de controles visibles.

En `/referencias/wireframe-backoffice-academia-sigmma.html` hay un **wireframe navegable de la solución propuesta**. Abrilo y recorrelo antes de escribir código: es la referencia funcional y de interacción, no necesariamente la referencia visual final (el repo ya tiene su propio design system, que manda).

---

## Arquitectura de datos — NO se toca

Todo lo que sigue se conserva completo. Lo que se simplifica es **cómo se pide**, no **qué se guarda**.

- **Jerarquía:** `Módulo → Sección → Video`. El banco de preguntas se asocia al **Módulo**, no al video ni a la sección.
- **ID permanente:** `Superficie-Módulo.Secuencia` (ej. `BAK-M30.050`). Superficies: `BAK` (backend), `FRT` (frontend B2B2C), `CRM` (Deal Closer). Módulos y secuencias **de 10 en 10** para poder intercalar sin renumerar. **El ID no cambia nunca**, ni al regrabar.
- **Estados del ciclo de vida del video (7):** `backlog → guionado → grabado → editado → publicado → a regrabar → obsoleto`.
- **Tags de plan:** `P+B`, `B`, `B-nicho`.
- **Perfiles de agencia:** `Corporate`, `Business`, `Standard`. Matriz Perfil × Módulo.
- **Banco de preguntas:** 50 por módulo, cada pregunta con texto, opciones, respuesta correcta y **sub-tema obligatorio**.
- **Metadata de producción:** cohorte (`C01`–`C20`), prioridad Pareto (`P1`–`P4`), versión de video, versión de producto (`sgm2026.XX`), fecha, columna "impacta a".
- **Reglas de integridad duras:**
  - Un módulo inactivo no expone sus videos ni su evaluación en el front, y **no acepta videos nuevos**.
  - Un video no puede asociarse a un módulo inactivo.
  - El sub-tema de cada pregunta es obligatorio.
  - **El alta de video no pide link de YouTube** cuando el video todavía no existe (nacen como IDs reservados en backlog).
- **Sistema de escenas E1–E5** (el estado de construcción de la Academia: día cero → IDs reservados → guionando/grabando → ruta esencial publicada → régimen). **Es el mejor activo conceptual del repo: conservalo y hacelo más visible, no lo elimines.**

---

## FASE 0 — Auditoría. No escribas código todavía.

Mi análisis previo del repo se hizo sin poder leer el código fuente, así que hay cosas que **no están verificadas**. Antes de tocar nada, auditá y devolveme un informe corto (máximo 2 pantallas) con estos puntos. **Si algo no lo podés verificar, decilo; no lo inventes ni lo asumas.**

1. **Stack y build:** contenido de `package.json`, cómo se compila `src/input.css` → `assets/css/academia.css`, si hay watch/scripts, para qué se usa `netlify.toml`.
2. **Design system existente:** leé `ESTILOS-ACADEMIA.md`, `DESIGN-SYSTEM-EXTENSIONS.md`, `CLAUDE.md` y `design-system.html`. Listame los tokens reales (colores, tipografía, espaciado, radios) y los componentes ya definidos. **Todo lo nuevo tiene que usar estos tokens, no inventar otros.**
3. **Shell y navegación:** cómo funciona `src/partials/app-shell.html`, cómo está duplicado en las 13 páginas, y cómo se sincroniza. Confirmá cuáles de los 16 destinos del sidebar son links reales y cuáles están inertes.
4. **`assets/js/ui.js` e `icons.js`:** qué hacen exactamente. Confirmá si hay o no `fetch`, `localStorage` y lógica de negocio.
5. **Contrato de URL:** listame todos los parámetros que interpreta cada página (`escena`, `tab`, `vista`, `paso`, y cualquier otro) y qué hace cada valor.
6. **ABMs — estado real de cada uno.** Para `alta-modulo.html`, `alta-seccion.html`, `alta-videos.html`, `banco.html` y `modulo.html`, decime: qué campos tiene el formulario, cuántos son obligatorios, si el ID se tipea o se genera, si hay validaciones, si hay `disabled`, si hay algún mecanismo de carga masiva o import, y cuántas filas/preguntas hay realmente en el DOM.
7. **Links muertos y pantallas huérfanas:** qué botones no llevan a ningún lado y qué páginas no tienen entrada de navegación.
8. **Accesibilidad, estado actual:** foco visible, `aria-*` en solapas y árboles, labels asociados, `outline:none` en algún lado, orden de tabulación, `prefers-reduced-motion`.

Terminá el informe con una recomendación tuya sobre **qué de la Fase 1 se puede hacer refactorizando lo existente y qué conviene reescribir**. Esperá mi confirmación antes de seguir.

---

## FASE 1 — Constructor de contenido (el 70% de la ganancia)

Reemplazá `alta-modulo.html`, `alta-seccion.html` y `alta-videos.html` por **una sola pantalla maestro-detalle**.

**Izquierda: árbol jerárquico** `Módulo → Sección → Video`, con:
- Expandir/colapsar por nodo y "cerrar todo".
- Buscador por título e ID, y filtro "solo lo pendiente".
- En cada nodo: ID como badge de solo lectura, tag de plan, chip de estado, y contador `n/50 preguntas` a nivel módulo.
- **Botones de alta en contexto**, dentro del nodo padre: `+ agregar video acá` debajo de cada sección, `+ agregar sección a BAK-Mxx` debajo de cada módulo, `+ agregar módulo` al final.
- Módulos inactivos: atenuados, con leyenda explícita, y **sin botón de agregar video** (la regla se ve, no se explica con un error).
- Checkbox por video para selección múltiple.

**Derecha: panel de detalle** del nodo seleccionado, con solapas.

**Requisitos técnicos:**
- El árbol y el detalle tienen que funcionar **sin editar la URL a mano**. Podés mantener el contrato de URL existente como estado profundo/deep-link, pero **cada estado alcanzable por URL debe ser alcanzable también por un control visible en pantalla**.
- Mantené el patrón del repo: si hoy es HTML estático que abre con doble clic sobre `file://`, no introduzcas un build ni un framework sin avisarme y explicarme el costo.
- Semántica de árbol accesible: `role="tree"`, `role="treeitem"`, `aria-expanded`, navegación con flechas y `Home`/`End`.

**Criterio de aceptación:** cargar un video en un módulo existente sin editar la URL, sin cambiar de pantalla y sin tener que recordar a qué módulo pertenece.

---

## FASE 2 — El ID lo genera el sistema, nunca la persona

- El ID se **deriva de la posición en el árbol**: superficie del módulo padre, módulo del nodo, secuencia = última + 10.
- Se muestra como **badge de solo lectura** con un botón de información que explique, en una línea, de dónde sale y que es permanente.
- **Ningún formulario debe tener un input de texto para el ID.**
- Decisión que necesito que respetes: **no habilites intercalado manual de secuencia.** Si hace falta cambiar el orden en que la agencia ve los videos, se usa el campo `orden`, que es independiente del ID. Si al auditar encontrás un caso donde esto no alcanza, avisame antes de implementar otra cosa.
- El ID **no se reutiliza nunca**. La baja de un video es lógica (estado `obsoleto`), no física.

---

## FASE 3 — Alta en tres preguntas, ficha diferida

El alta de video pasa de ~12 campos a **tres decisiones**:

1. **¿Qué enseña este video?** → título, en lenguaje natural.
2. **¿Dónde va?** → ya resuelto por el nodo donde se hizo clic.
3. **¿En qué estado está?** → "ya lo tengo grabado" (pide link) / "todavía no se grabó" (queda en backlog sin link).

Mostrá, en un bloque de solo lectura junto al formulario, **toda la metadata derivada**: ID asignado, superficie, módulo, sección, tag de plan heredado, orden. La persona tiene que ver que el sistema lo resolvió, sin haber tenido que elegirlo.

Todo el resto se completa después, en la ficha del video, repartido en solapas:
- **Ficha:** ID, título, ubicación, link, estado.
- **Producción:** cohorte, prioridad Pareto, guion, escenario de datos a preparar antes de grabar.
- **Trazabilidad:** versión de video, versión de producto, "qué desarrollo lo dejó viejo", historial.

Agregá un **checklist de completitud** en la ficha ("Falta: link del video, duración") en lugar de obligar a llenar todo de una.

**Regla de revelación progresiva: dos niveles como máximo.** Nivel 1 = alta mínima. Nivel 2 = ficha completa. Nada más profundo.

---

## FASE 4 — Dos puertas de entrada

Creá una pantalla de entrada tipo "¿Qué querés hacer?" con dos accesos que llevan al mismo constructor en modos distintos:

- **"Subir un video que ya tengo"** → pide link, elige ubicación en el árbol, queda publicado. Para cualquier persona del equipo.
- **"Reservar lo que se va a grabar"** → crea IDs en `backlog` sin link. Para producción de contenido.

Esto hace que la regla "el alta no pide link" **desaparezca como problema**: cada persona entra por donde su tarea tiene sentido.

Sumá a esa pantalla un bloque de "lo que está esperando algo": videos a regrabar, módulos con banco incompleto, videos sin grabar. Que sea accionable, no decorativo.

**Pendiente que quiero que resuelvas acá:** al entrar por "ya lo tengo grabado", el sistema debe **buscar si existe un ID reservado con título parecido** y ofrecer completarlo en vez de crear un duplicado. Proponeme cómo detectarlo antes de implementarlo.

---

## FASE 5 — Volumen: pegado desde planilla y acciones masivas

**5.a — Acciones masivas (hacé esto primero, es lo más barato y lo que más alivia).**
Selección múltiple de videos en el árbol → barra de acciones contextual con: marcar a regrabar, marcar publicado, asignar cohorte, mover a otra sección. Este es el mantenimiento post-release: cuando sale una versión y hay 8 videos que quedaron viejos, tienen que ser dos clics.

**5.b — Pegado desde planilla.**
La fuente de verdad hoy es un tablero maestro en Google Sheets, así que la vía más corta es aceptar **pegado directo de filas** (paste-to-grid), no transcripción a formulario.
- Paso 1: pegar. Paso 2: vista previa con validación **fila por fila**. Paso 3: confirmar.
- Cada error se explica **en la fila que lo causó** y ofrece salida ahí mismo: corregir u omitir. **Nunca rechazar el lote entero por una celda.**
- Errores a cubrir como mínimo: módulo inexistente (con sugerencia del más parecido), ID duplicado, campo obligatorio faltante, módulo inactivo.
- Mismo flujo para el **banco de preguntas**, con columnas distintas y `sub-tema` obligatorio.
- Nunca un import a ciegas.

**Antes de construir 5.b, planteame la pregunta de fuente de verdad:** ¿manda el backoffice o manda el Sheets? Si quedan las dos vivas en paralelo hay doble carga y divergencia garantizada. Es decisión de producto, no de código, pero necesito que me la marques como bloqueante.

---

## FASE 6 — Reglas de integridad visibles, no explicadas

- **Módulo inactivo:** el botón "agregar video" no existe; el nodo aparece atenuado con la leyenda de por qué.
- **Sub-tema obligatorio:** selector precargado con los sub-temas existentes del módulo, sin opción de guardar vacío, **más un contador por sub-tema** que muestre los huecos ("IVA: 0 preguntas · sin cubrir") antes de que sean un problema.
- **Banco a nivel módulo:** llevá `banco.html` a ser una **solapa del módulo**, no una pantalla suelta. Que la relación se entienda por ubicación.
- **Estados:** en lugar de un combo con siete opciones, mostrá el estado actual y **el paso siguiente como botón primario** ("Marcar como grabado"), con el listado completo detrás de un acceso secundario.

---

## Microcopy — nombrá por la tarea, no por la tabla

Reescribí todos los labels desde la perspectiva de quien usa, en **español argentino, tono conversacional, sentence case**:

| No escribas | Escribí |
|---|---|
| Título | ¿Qué enseña este video? |
| Estado: activo / inactivo | ¿Visible para las agencias? |
| Matriz Perfil × Módulo | ¿Qué agencias tienen que hacer este módulo? |
| ABM de Secciones | Secciones del módulo |
| Submit / Enviar | Guardar video / Publicar módulo |
| Error: campo requerido | Falta el plan al que aplica (P+B, B o B-nicho) |

Reglas: verbos en voz activa; el botón dice exactamente qué pasa; una acción conserva el mismo nombre en todo el flujo (si el botón dice "Publicar", el aviso dice "Publicado"); los errores explican qué pasó y cómo salir, sin disculparse ni ser vagos; una pantalla vacía es una invitación a actuar, no un mensaje de error.

---

## Piso de calidad, no negociable

- **Accesibilidad WCAG 2.1 AA:** foco visible siempre (nunca `outline:none` sin reemplazo), operable 100% por teclado, labels asociados, `aria-*` correcto en solapas y árbol, contraste verificado, `prefers-reduced-motion` respetado.
- **Reordenamiento:** si implementás arrastrar y soltar, agregá **siempre** botones subir/bajar como alternativa. Arrastrar solo con mouse deja gente afuera.
- **Sin `localStorage` ni `sessionStorage`** si el repo no los usa hoy; mantené el estado en memoria.
- Usá los **tokens del design system existente**. Si necesitás un token nuevo, agregalo a `DESIGN-SYSTEM-EXTENSIONS.md` y justificalo.
- Mantené el sidebar honesto: los destinos que todavía no existen, marcados como pendientes; no los presentes como funcionales.

---

## Qué NO hacer

- No inventes funcionalidades, campos, pantallas ni comportamientos que no estén en este prompt o en el repo.
- No elimines ni simplifiques ningún campo del modelo de datos. Todo lo que "se simplifica" se **deriva, se difiere o se relocaliza** — nunca se borra.
- No elimines el sistema de escenas E1–E5.
- No introduzcas un framework, un build nuevo ni dependencias sin avisar y explicar el costo.
- No implementes backend, SSO, integración con YouTube ni Jira: están fuera de alcance.
- No construyas las vistas de seguimiento para staff (avance por agencia, panel general): quedan para después.
- No hagas commit ni push sin preguntarme primero.

---

## Cómo quiero que trabajes

1. Fase 0 primero: informe de auditoría, y **esperá mi confirmación**.
2. Después, **una fase por vez**. Al terminar cada una: resumen de qué cambió, qué archivos tocaste, y qué quedó pendiente o dudoso.
3. Cuando una decisión dependa de producto y no de código (fuente de verdad, detección de duplicados, comportamiento del intercalado), **paralo y preguntá**. No elijas por mí y sigas.
4. Si algo del repo contradice este prompt, decímelo en vez de resolverlo solo.
5. Al terminar cada fase, si hay cambios en git, seguí el flujo habitual de ramas y tickets del equipo — pero **mostrame el resumen de pasos y esperá confirmación antes de ejecutar** cualquier commit, merge o push.

---

## Criterio de éxito

Una sola prueba, y es la que importa:

> **Una persona que no conoce la estructura de la Academia carga un video en un módulo existente, sin preguntarle nada a nadie y sin leer documentación.**

Si eso pasa, funcionó. Si se traba, decime exactamente en qué paso se traba y por qué.