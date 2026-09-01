# Prompt 2 (versión corregida) — Rediseño del flujo de interacción del backoffice Academia SIGMMA

> **Reemplaza cualquier versión anterior de este prompt 2.** Si te pasé antes una especificación de tokens, tipografía y color: **ignorala por completo.**

---

## Qué se toca y qué no

**NO se toca:**
- El design system. Colores, tipografía, escala, espaciado, radios, tokens: **queda todo como está**. Usá `ESTILOS-ACADEMIA.md` y `DESIGN-SYSTEM-EXTENSIONS.md` tal cual, sin agregar ni modificar tokens.
- Los componentes visuales existentes. Si ya hay un botón, un chip, una tabla o una solapa definidos, **reutilizalos**. No rediseñes su apariencia.
- La arquitectura de datos: IDs, jerarquía `Módulo → Sección → Video`, los 7 estados del ciclo de vida, tags de plan, perfiles de agencia, banco de 50 con sub-tema obligatorio, sistema de escenas E1–E5.

**SÍ se toca:**
- **El flujo.** Cuántos pasos tiene cada tarea, en qué orden ocurren, qué pantalla se abre, dónde aterriza la persona después de cada acción, cómo vuelve, y cómo se encadena con lo siguiente.
- La navegación: puntos de entrada, transiciones, callejones sin salida.
- Qué se pide en cada paso y qué se difiere.

Dicho de otra forma: **las piezas son las mismas, el recorrido cambia.**

---

## El problema, en concreto

Hoy el flujo obliga a la persona a **armar el recorrido en su cabeza** antes de poder empezar. Para cargar un video tiene que saber que existe un módulo, que existe una sección, cuál es cuál, y en qué orden crearlos. La interfaz no la guía: le ofrece cuatro ABMs y espera que ella elija bien.

El rediseño tiene un solo objetivo: **que el recorrido lo proponga el software, no la persona.**

---

## Reglas de flujo — aplican a todo el backoffice

1. **La estructura vive en un solo lugar.** Todo lo que sea crear, editar, mover o eliminar módulos, secciones y videos ocurre en **una sola pantalla**. Se prohíbe navegar entre pantallas distintas para completar una sola tarea de estructura.
2. **Se entra por tarea, no por entidad.** El punto de entrada pregunta qué querés hacer, no qué tabla querés editar.
3. **Cada estado alcanzable por URL tiene que ser alcanzable por un control visible.** Podés conservar el contrato de URL (`?escena=`, `?tab=`) como deep-link, pero **nunca** como única vía. Si un estado solo se alcanza escribiendo en la barra de direcciones, el flujo está roto.
4. **Cero callejones sin salida.** Toda pantalla tiene salida visible: volver, cancelar, o el paso siguiente. Ninguna acción deja a la persona sin saber qué sigue.
5. **El contexto no se pierde nunca.** Al crear algo, el padre queda visible en pantalla durante todo el proceso. No se navega afuera del contexto para volver a él después.
6. **Aterrizaje predecible.** Después de guardar, la persona queda **en el objeto que acaba de crear o modificar**, no en un listado genérico ni en la pantalla de inicio.
7. **El sistema propone el paso siguiente.** Terminada una acción, la interfaz ofrece la continuación más probable como acción visible, no como algo que hay que ir a buscar.
8. **Lo que no hace falta ahora, se pide después.** Como máximo dos niveles de profundidad: alta mínima, y ficha completa.

---

## Especificación tarea por tarea

Para cada tarea: el flujo actual, el flujo objetivo con su secuencia exacta, y el criterio de aceptación. **El conteo de pasos es requisito, no sugerencia.**

---

### Tarea 1 — Subir un video que ya está grabado
*La tarea más frecuente y la que va a hacer gente sin entrenamiento.*

**Hoy (inferido):** entrar al índice → elegir entre 15 pantallas → abrir `alta-videos.html` → no encontrar campo de link → averiguar si primero hay que crear la sección → decidir superficie, módulo, secuencia, cohorte y prioridad → guardar sin saber si quedó bien.

**Objetivo: 4 pasos.**

1. **Entrada:** en la pantalla de inicio, tocar `Subir un video que ya tengo`.
2. **Ubicación:** aterriza en el constructor con el árbol abierto. Toca `+ agregar video acá` debajo de la sección que corresponde. El formulario se abre **en línea, en ese mismo lugar del árbol**, sin modal y sin cambio de pantalla.
3. **Datos:** escribe qué enseña el video y pega el link. Nada más. En el mismo bloque ve, en solo lectura, el ID que le tocó, la superficie, el módulo, la sección, el plan heredado y el orden.
4. **Guardar:** aviso que nombra el ID asignado. Aterriza en la ficha del video recién creado, con el checklist de lo que falta si falta algo.

**Continuación ofrecida:** botón `Guardar y crear otro` que reabre el formulario en la misma sección, con el ID siguiente ya calculado.

**Criterio de aceptación:**
- Se completa **sin cambiar de pantalla** después del paso 1.
- Se completa **sin editar la URL**.
- La persona **no elige** superficie, módulo, secuencia, orden, cohorte ni prioridad.
- Al terminar ve el ID que se generó.

---

### Tarea 2 — Reservar los videos que todavía no se grabaron
*Planificación. Volumen alto: hasta 55 de una.*

**Objetivo: 3 pasos para el lote completo.**

1. **Entrada:** `Reservar lo que se va a grabar` desde el inicio.
2. **Elección de vía:** dos caminos visibles en la misma pantalla:
   - *De a uno:* mismo formulario en línea de la Tarea 1, pero con "todavía no se grabó" preseleccionado y **sin campo de link**.
   - *En lote:* pegar filas desde la planilla.
3. **Confirmación:** vista previa fila por fila → confirmar → aterriza en el árbol con los nuevos videos visibles en `backlog`.

**Criterio de aceptación:**
- Nunca pide link cuando el video no existe.
- La vía en lote **no** obliga a pasar por la vía de a uno primero.
- Al confirmar, los videos nuevos quedan visibles en el árbol, no en un listado aparte.

---

### Tarea 3 — Crear un módulo nuevo con sus secciones y videos
*Es la tarea que hoy exige tres pantallas y saber el orden correcto.*

**Objetivo: un solo recorrido continuo, sin cambio de pantalla.**

1. `+ agregar módulo` al final del árbol. Formulario en línea: nombre, plan y perfiles. El ID lo propone el sistema.
2. Al guardar, el módulo **queda abierto y seleccionado** en el árbol, y el sistema ofrece de inmediato `+ agregar sección a BAK-Mxx` como acción visible.
3. Al crear la sección, esta queda abierta y ofrece `+ agregar video acá`.
4. Cada video creado deja el formulario listo para el siguiente, con el ID ya calculado.

**Criterio de aceptación:**
- Se crea un módulo con dos secciones y cuatro videos **sin salir de la pantalla del constructor**.
- En ningún momento hay que elegir el padre en un desplegable: siempre viene dado por el lugar del árbol.
- Después de cada guardado, el paso siguiente está ofrecido en pantalla.

---

### Tarea 4 — Cargar las 50 preguntas de un módulo
*Hoy es la tarea más costosa del backoffice.*

**Objetivo: el banco se alcanza desde el módulo, y se carga en lote.**

1. Seleccionar el módulo en el árbol → solapa `Banco de preguntas` **dentro del panel del módulo**. `banco.html` deja de ser una pantalla suelta a la que se llega por navegación aparte.
2. Ver el estado: cuántas de 50 hay cargadas y el conteo por sub-tema, con los que están en cero marcados.
3. Dos vías visibles: `Pegar preguntas desde planilla` o `Agregar una pregunta`.
4. En la vía en lote: pegar → vista previa fila por fila con validación de sub-tema → confirmar → vuelve a la solapa del banco con los contadores actualizados.

**Criterio de aceptación:**
- No se puede llegar al banco sin saber de qué módulo es: el módulo es el contenedor.
- Nunca se guarda una pregunta sin sub-tema.
- Después de importar, la persona ve el efecto en los contadores por sub-tema sin tener que ir a buscarlo.

---

### Tarea 5 — Marcar videos a regrabar después de una release
*El mantenimiento recurrente. Hoy son N recorridos completos.*

**Objetivo: 3 pasos, sin importar cuántos videos sean.**

1. En el árbol, filtrar o buscar los videos afectados.
2. Seleccionar con los checkboxes. Al haber al menos uno seleccionado, aparece la barra de acciones al pie de la columna.
3. `Marcar a regrabar` → aviso con el conteo → los chips de estado cambian **en el mismo árbol, a la vista**.

**Criterio de aceptación:**
- Cambiar el estado de 8 videos no requiere abrir 8 fichas.
- La selección se mantiene mientras se navega el árbol y se limpia al terminar la acción.
- El resultado se ve en el árbol, sin recargar ni navegar.

---

### Tarea 6 — Reordenar y mover
**Objetivo: sin pantalla aparte.**

1. Reordenar dentro de su sección: botones subir/bajar en el nodo, más arrastrar como alternativa opcional.
2. Mover a otra sección: desde la barra de acciones masivas o desde la ficha, con selector del destino.
3. El cambio se refleja al instante en el árbol.

**Criterio de aceptación:** el ID **no cambia** al reordenar ni al mover dentro del mismo módulo. Si el destino es otro módulo, la interfaz avisa qué pasa con el ID antes de ejecutar.

---

### Tarea 7 — Activar o desactivar un módulo
**Objetivo: la consecuencia se ve antes de confirmar.**

1. Seleccionar el módulo → solapa `Ficha` → control de visibilidad.
2. Antes de aplicar, la interfaz dice qué implica: cuántos videos y qué evaluación dejan de verse.
3. Al desactivarlo, el nodo del árbol cambia de aspecto y **desaparece el botón de agregar video**, con una leyenda que explica por qué.

**Criterio de aceptación:** nadie descubre por mensaje de error que un módulo inactivo no acepta videos. La acción imposible simplemente no está ofrecida.

---

### Tarea 8 — Saber qué falta
*Sin esto, el resto no se usa: nadie sabe por dónde empezar.*

**Objetivo:** en la pantalla de inicio, una lista accionable de lo que está esperando algo.

- Videos marcados a regrabar.
- Módulos con banco incompleto, con el conteo.
- Videos reservados sin grabar.
- Módulos sin sub-temas definidos.

Cada ítem tiene un botón que **lleva directo al lugar donde se resuelve**, con el nodo ya seleccionado y la solapa correcta abierta. No a un listado general.

**Criterio de aceptación:** desde el inicio, cualquier pendiente se alcanza en **un clic**, no en tres.

---

## Mapa de navegación objetivo

Esto reemplaza el índice de 15 pantallas y el sidebar de 16 destinos con 8 inertes.

```
Inicio (¿qué querés hacer?)
 ├── Subir un video que ya tengo ──┐
 ├── Reservar lo que se va a grabar┤
 │                                 ├──> Constructor (una sola pantalla)
 ├── Pendientes (lista accionable) ┘      ├── árbol Módulo › Sección › Video
 │                                        └── panel de detalle
 │                                             ├── Módulo: Ficha | Banco | Perfiles
 │                                             ├── Sección: Ficha
 │                                             └── Video: Ficha | Producción | Trazabilidad
 └── Cargar desde planilla (3 pasos) ──> vuelve al Constructor
```

**Reglas del mapa:**
- Los destinos que no existen todavía (avance por agencia, panel general) se muestran marcados como pendientes o no se muestran. **No como links que no llevan a ningún lado.**
- El selector de escena E1–E5 vive en la barra superior, siempre visible, en todas las pantallas.
- La ruta de lo que estás editando también va en la barra superior. Nunca hay duda de dónde estás parada.

---

## Comportamiento después de cada acción

| Acción | Aterrizaje | Continuación ofrecida |
|---|---|---|
| Guardar video | ficha del video creado | `Guardar y crear otro` en la misma sección |
| Guardar sección | sección abierta y seleccionada en el árbol | `+ agregar video acá` |
| Guardar módulo | módulo abierto y seleccionado | `+ agregar sección` |
| Importar en lote | árbol, con lo importado visible | resumen de cuántos entraron |
| Acción masiva | mismo árbol, chips actualizados a la vista | selección limpia |
| Publicar video | misma ficha, estado actualizado | siguiente video pendiente de la sección |
| Cancelar cualquier alta | el árbol, en el mismo lugar donde estaba | — |

**Nada de aterrizar en la pantalla de inicio después de guardar.** Es el patrón que obliga a rehacer el camino para la acción siguiente.

---

## Estados del flujo que hay que resolver

- **Academia vacía (E1):** no una tabla sin filas. Una línea que diga qué falta y los caminos posibles como botones.
- **Módulo sin secciones:** ofrecer crear la primera, no dejar el nodo mudo.
- **Sección sin videos:** ofrecer agregar el primero.
- **Banco en cero:** decir explícitamente que sin preguntas el módulo no se puede evaluar, y ofrecer las dos vías de carga.
- **Búsqueda sin resultados:** decir qué se buscó y ofrecer limpiar el filtro. No una lista vacía.
- **Error de validación:** en el campo que lo causó, con qué pasó y cómo salir. No un resumen arriba de todo.
- **Error de fila en importación:** dentro de la fila, con `Corregir` y `Omitir` ahí mismo. **Nunca rechazar el lote entero por una celda.**

---

## Flujo de teclado

- El árbol se navega con flechas: arriba y abajo entre nodos, derecha y izquierda para abrir y cerrar.
- `Enter` sobre un nodo lo selecciona y abre su detalle.
- En el formulario en línea, `Tab` recorre los tres campos y llega al botón primario. `Enter` guarda. `Escape` cancela y devuelve el foco al nodo desde donde se abrió.
- El buscador filtra mientras se escribe **sin perder el cursor** al re-renderizar.
- Reordenar tiene botones subir/bajar además de arrastrar. Arrastrar solo con mouse deja gente afuera.

---

## Cómo verifico que el flujo cambió

Respondeme cada una con el número, no con una descripción.

1. Tarea 1: ¿cuántos clics desde el inicio hasta tener el video guardado? *(objetivo: 4 o menos)*
2. Tarea 1: ¿cuántas pantallas distintas se visitan? *(objetivo: 2 — inicio y constructor)*
3. Tarea 3: ¿cuántas pantallas para crear un módulo con 2 secciones y 4 videos? *(objetivo: 1)*
4. Tarea 5: ¿cuántos clics para marcar 8 videos a regrabar? *(objetivo: 3 más los 8 checkboxes)*
5. Tarea 8: ¿cuántos clics desde el inicio hasta el lugar donde se resuelve un pendiente? *(objetivo: 1)*
6. ¿Queda algún estado alcanzable **solo** editando la URL? *(objetivo: ninguno)*
7. ¿Queda algún botón o link que no lleve a ningún lado? *(objetivo: ninguno)*
8. ¿En alguna tarea hay que elegir el módulo o la sección padre en un desplegable? *(objetivo: en ninguna)*
9. ¿Alguna acción aterriza en la pantalla de inicio? *(objetivo: ninguna)*
10. ¿Se puede completar la Tarea 1 entera solo con teclado? *(objetivo: sí)*

---

## Qué NO hacer

- **No modifiques ni agregues tokens de diseño.** Ni colores, ni tipografía, ni escala, ni espaciado, ni radios.
- No rediseñes la apariencia de componentes existentes. Reutilizalos.
- No agregues librerías, frameworks ni dependencias.
- No elimines ningún campo del modelo de datos. Diferir a otra solapa no es eliminar.
- No elimines el sistema de escenas E1–E5.
- No implementes backend, SSO, YouTube ni Jira.
- No construyas las vistas de seguimiento para staff.
- No hagas commit ni push sin preguntarme.

---

## Orden de trabajo

1. **Mapa de flujo actual.** Antes de tocar nada, recorré el repo y devolveme, para cada una de las 8 tareas, el conteo real de pasos, clics y pantallas de hoy. **Pará acá y esperá mi confirmación.**
2. Tarea 1 y Tarea 3 completas (constructor con altas en contexto y encadenamiento). Es el 70% de la ganancia.
3. Tarea 5 (acciones masivas) y Tarea 8 (pendientes accionables).
4. Tarea 4 (banco como solapa del módulo) y Tarea 2 (lote).
5. Tareas 6 y 7.
6. Flujo de teclado y estados del flujo.
7. Las 10 preguntas de verificación respondidas con números.

Si algo de esta especificación no se puede hacer sin tocar el design system, **decímelo y esperá** en vez de resolverlo solo.