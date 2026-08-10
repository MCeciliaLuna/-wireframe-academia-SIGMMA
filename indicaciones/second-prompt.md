# Academia SIGMMA | Backoffice — Bloque de arranque (etapas 0 a 3)

**Fecha:** 10/08/2026
**Versión:** 1
**Enfoque:** escenas por momento del ciclo de vida del contenido
**Alcance:** etapas 0 a 3 (sistema vacío → reserva de IDs → guionado → grabación y edición), más el hito de lanzamiento
**Continúa:** Paquete de pre-producción del wireframe (07/08/2026), que cubrió el sistema en régimen

---

## 1 | El concepto de escena

Cada vista declara **en qué momento de la construcción de la Academia está el sistema**. La misma pantalla se maqueta más de una vez si su estado en distintos momentos enseña cosas distintas.

Esto corrige un problema silencioso de la tanda 1: dibujó el sistema en régimen sin declararlo, y eso podía llevar a desarrollo a priorizar como si el estado normal fuera el de dentro de un año.

| Escena | Momento | Qué se ve |
|---|---|---|
| **E1** | Día 0 — sistema vacío | Nada cargado. Un solo camino posible: importar el mapa |
| **E2** | Semana 1 — mapa cargado | 55 IDs reservados en `backlog`. Nada grabado, nada guionado, 0 preguntas |
| **E3** | Mes 1 — P1 en producción | C01 publicado, C02 editado, C03 guionado. El resto en backlog |
| **E4** | Mes 2 — hito de lanzamiento | Los 12 de P1 publicados. Ruta Esencial apta para activar |
| **E5** | Régimen | **Ya maquetada en la tanda 1**: bancos parciales, un video a regrabar, impactos de release |

E1 a E4 son las que faltan. E4 es el hito que responde la pregunta de negocio más importante: *cuándo se puede lanzar la Academia*.

---

## 2 | Datos de muestra por escena

**Crítico:** cada escena tiene su propio set de datos y los números tienen que cerrar dentro de la escena. No mezclar escenas en una misma vista.

### E1 · Sistema vacío

Todo en cero: 0 módulos, 0 secciones, 0 videos, 0 cohortes, 0 preguntas, 0 módulos activos. Las 3 superficies pueden venir precargadas como semilla (BAK, FRT, CRM) o no existir todavía — decisión a tomar.

### E2 · Mapa cargado

| Entidad | Cantidad |
|---|---|
| Superficies | 3 (BAK mapeada, FRT y CRM placeholder) |
| Módulos | 11 + `BAK-M35` reservado + `BAK-R01` Ruta Esencial = 13 |
| Cohortes | 20 (C01 a C20) |
| Videos | **55**, todos en `backlog` |
| Guionados / grabados / publicados | 0 / 0 / 0 |
| Preguntas | 0 |
| Módulos activos | 0 |

Distribución de videos por módulo (suma 55): M00 4 · M10 6 · M20 6 · M30 7 · M40 5 · M50 6 · M60 4 · M70 4 · M80 4 · M90 5 · M95 4

### E3 · P1 en producción

| Cohorte | Videos | Estado |
|---|---|---|
| C01 Arranque | `BAK-M00.010`, `BAK-M00.040` | **publicado** |
| C02 Alta de file y cliente | `BAK-M10.010`, `M10.020`, `M10.030`, `BAK-M20.010`, `M20.030`, `M20.040` | **editado** |
| C03 Voucher y cobro | `BAK-M30.010`, `M30.020`, `M30.050`, `BAK-M40.010` | **guionado** |
| C04 a C20 | los 43 restantes | `backlog` |

Verificación: 2 publicados + 6 editados + 4 guionados + 43 backlog = **55** ✓

- Preguntas: **10** (5 por cada video publicado de C01)
- Ruta Esencial: 2 de 12 videos publicados · banco 10 de 60 · **no apta**
- Módulos activos: **0**

### E4 · Hito de lanzamiento

Los 12 videos de P1 publicados. El resto en `backlog`.

- Preguntas: **60** (5 por video publicado)
- Ruta Esencial: 12 de 12 · banco 60 de 60 · **APTA para activar**

Módulos de biblioteca, videos publicados sobre total:

| Módulo | Publicados / total |
|---|---|
| BAK-M00 | 2 / 4 |
| BAK-M10 | 3 / 6 |
| BAK-M20 | 3 / 6 |
| BAK-M30 | 3 / 7 |
| BAK-M40 | 1 / 5 |
| M50 a M95 | 0 / total |

Suma de publicados: 2+3+3+3+1 = **12** ✓

> **Esta tabla es la demostración visual del conflicto que resolvimos con la Ruta Esencial:** con el Pareto grabado, **ningún módulo de biblioteca queda completo**. Sin la Ruta, la Academia no se podría lanzar. Vale mostrarla tal cual en la revisión con Producto.

---

## 3 | Inventario de vistas

17 vistas. Las marcadas con ★ son las imprescindibles: pantallas nuevas o estados que no se pueden inferir de la tanda 1.

### Etapa 0 · Sistema vacío (escena E1)

| # | Vista | Nota |
|---|---|---|
| ★ V01 | **Home — estado vacío** | Un solo camino posible y un solo CTA |
| ★ V02 | **Importador de carga inicial** | Asistente de 4 pasos. Ver 4.1 |
| V03 | Listado de módulos — vacío | Estado vacío con salida al importador |
| V04 | Alta de módulo (formulario) | Creación manual, alternativa al importador |
| V05 | Alta de sección | Formulario simple, anidado al módulo |
| V06 | ABM de superficies y planes | Los planes en placeholder deliberado |

### Etapa 1 · Reserva de IDs (escena E2)

| # | Vista | Nota |
|---|---|---|
| ★ V07 | **Home — mapa cargado** | Panel de avance de construcción. Ver 4.2 |
| V08 | Listado de módulos — todo en backlog | 13 filas, todas con 0 publicados y ninguna apta |
| ★ V09 | **Alta masiva de videos / reserva de IDs** | Carga por lote con secuencia de 10 en 10. Ver 4.4 |
| V10 | Tablero — kanban con 55 en una columna | Vista muy reveladora del arranque |

### Etapa 2 · Guionado (escena E3)

| # | Vista | Nota |
|---|---|---|
| ★ V11 | **Editor de guión y receta** | Plantilla estructurada + contexto de cadena. Ver 4.5 |
| ★ V12 | **Hoja de cohorte — modo planificación** | La pantalla que faltaba. Ver 4.3 |
| V13 | Tablero — filtrado por cohorte | Avance mixto entre C01, C02 y C03 |

### Etapa 3 · Grabación y edición (escena E3)

| # | Vista | Nota |
|---|---|---|
| ★ V14 | **Hoja de cohorte — modo sesión de grabación** | Checklist de entorno + avance video por video |
| V15 | Detalle de video — estado `editado` | Sin link todavía: contrasta con la vista publicada de la tanda 1 |

### Hito de lanzamiento (escena E4)

| # | Vista | Nota |
|---|---|---|
| ★ V16 | **Home — Ruta Esencial apta** | El momento del lanzamiento |
| V17 | Detalle de módulo — Ruta Esencial apta | Aptitud cumplida, acción de activar habilitada |

---

## 4 | Especificación de las pantallas nuevas

### 4.1 · Importador de carga inicial (V02)

Cargar 11 módulos, 55 videos, secciones y 20 cohortes por formulario son unos 100 registros. No es viable a mano: hace falta importación desde el tablero de Google Sheets que hoy es la fuente de verdad.

Asistente de 4 pasos:

1. **Origen.** Subir CSV o pegar contenido. Mostrar las columnas esperadas, que son las del Sheets actual: ID · superficie · módulo · tag de plan · cohorte · prioridad · estado · versión video · versión producto · fecha · impacta a.
2. **Mapeo de columnas.** Columna del origen → campo del sistema, con detección automática por nombre y posibilidad de corregir.
3. **Validación y previsualización.** Tres grupos visibles: filas listas, filas con error (ID mal formado, secuencia duplicada, cohorte inexistente) y filas a saltear. Cada error con su motivo y su número de fila.
4. **Confirmación.** Resumen de lo que se va a crear, por entidad. Después de ejecutar, pantalla de resultado con log descargable.

**Decisión a tomar:** si el CSV menciona un cohorte o un módulo que no existe, ¿el importador lo crea o rechaza la fila? Recomendación: crearlo y marcarlo como `creado por importación` para revisión posterior. Rechazar obliga a cargar todo en un orden manual que anula el beneficio del importador.

### 4.2 · Home — panel de avance de construcción (V01, V07, V16)

No es un dashboard de métricas de uso: en esta etapa no hay uso. Es un panel de obra.

Bloques:

- **Progreso del contenido.** Los 55 videos distribuidos en los 7 estados de producción, como barra o embudo.
- **Próximo hito, uno solo.** "Ruta Esencial: faltan 10 videos publicados y 50 preguntas para poder activarla". Esto es lo que resuelve el problema del tablero rojo: en lugar de 11 módulos en alerta, un objetivo.
- **Trabajo inmediato.** Cohorte activo con su avance, videos a guionar, videos publicados sin pregunta.
- **Estado de la Academia.** Módulos activos (0 hasta el hito), agencias con acceso.

Las tres versiones (E1 vacío, E2 mapa cargado, E4 apta) son la misma pantalla en tres momentos, y el contraste entre ellas es el argumento visual de por qué el Home tiene que medir construcción y no operación.

### 4.3 · Hoja de cohorte (V12, V14)

**La pantalla que faltaba en el inventario original.** Majo no graba por módulo: graba por cohorte, preparando una vez el escenario de datos en Viajando.com para grabar varios videos de corrido. En la tanda 1 el cohorte era apenas una columna de una tabla.

**Encabezado:** código y nombre del cohorte, prioridad Pareto, entorno (Viajando.com), avance (por ejemplo 4 de 6 grabados), escenario compartido en texto.

**Modo planificación:**
- Receta de preparación del cohorte completo (por ejemplo, para C02: "partimos sin el cliente demo creado").
- Lista de videos en orden de grabación, cada uno con su estado, si tiene guión, y su duración objetivo.
- **Cadena de encadenamiento visible:** cada video indica de dónde viene ("viene de M10.010, sin file nuevo creado todavía"). Es un dato textual de los guiones de P1 y es lo que hace que el cohorte funcione.

**Modo sesión de grabación:**
- Checklist de preparación del entorno antes de apretar REC.
- Los videos uno debajo del otro con su receta individual, con acción rápida de marcar grabado sin salir de la pantalla.
- Recordatorio de qué no mostrar (datos sensibles, precios reales, credenciales).

### 4.4 · Alta masiva de videos / reserva de IDs (V09)

Se eligen superficie y módulo una vez, y se cargan filas: secuencia (sugerida automáticamente de 10 en 10), título, tag de plan, cohorte, prioridad. Validación de secuencia duplicada en vivo.

Los videos nacen en `backlog`, sin link y sin versión: son IDs reservados. Es el mecanismo que permite que el mapa mire hacia adelante, incluidos los que todavía están en desarrollo de producto como `BAK-M35.010`.

### 4.5 · Editor de guión y receta (V11)

Pantalla partida, mismo patrón que el editor de preguntas.

**Panel izquierdo, contexto:** receta del cohorte, video anterior de la cadena y su estado final, notas de qué no mostrar.

**Panel derecho, la plantilla estructurada:**
- Receta de preparación de este video (estado del sistema antes de grabar)
- INTRO · a cámara · ~15 seg
- CUERPO · voz sobre pantalla · pasos numerados, cada paso una acción visible, con acotaciones entre corchetes
- CIERRE · a cámara · ~10 seg, invitando a la evaluación del módulo
- Notas de producción
- Checklist de la plantilla: un solo concepto, menos de 5 minutos, sin datos sensibles

La plantilla no es texto libre: es la estructura del documento de Plantilla de Guión, que existe justamente para que los videos queden parejos aunque se graben en meses distintos.

---

## 5 | Estados vacíos de las pantallas ya maquetadas

No son pantallas nuevas, pero son trabajo real y son el primer estado que va a ver Majo. Cada una necesita: qué se explica, y cuál es la única acción posible.

| Pantalla | Estado vacío |
|---|---|
| Listado de módulos | "La Academia no tiene contenido cargado" → importar el mapa |
| Detalle de módulo | Módulo sin secciones → crear la primera sección |
| Detalle de video | Video en `backlog` sin guión → escribir guión |
| Tablero de producción | Sin videos → importar; con 55 en backlog → filtrar por cohorte |
| Banco de preguntas | Módulo sin videos publicados → explicar que la pregunta se escribe después de grabar |
| Superficies FRT y CRM | Superficie sin mapear → explicar la gobernanza pendiente |

El del banco de preguntas es el más importante: sin esa explicación, un módulo con 0 preguntas y 0 videos publicados parece un error del sistema.

---

## 6 | Flujos a validar

**F5 · Arranque en frío.** Sistema vacío → importador → mapeo → validación → 55 IDs reservados y 13 módulos creados. Valida que el día 1 tenga un camino claro.

**F6 · Guionar un cohorte.** Hoja de cohorte C02 → escribir los 6 guiones respetando el encadenamiento → los 6 pasan a `guionado`. Valida que el guión se escriba en contexto de cadena y no aislado.

**F7 · Sesión de grabación.** Hoja de cohorte en modo sesión → checklist de entorno → grabar los 6 → editar → publicar con link. Valida la pantalla que Majo va a tener abierta mientras graba.

**F8 · Camino al lanzamiento.** Home en E3 (falta) → Home en E4 (Ruta apta) → detalle de la Ruta → activar. **Es el flujo que responde cuándo se puede lanzar la Academia** y el más valioso para la revisión con negocio.

---

## 7 | Decisiones abiertas de este bloque

| # | Decisión | Bloquea |
|---|---|---|
| A1 | ¿El importador crea las entidades faltantes o rechaza la fila? | V02 |
| A2 | ¿Las 3 superficies vienen precargadas como semilla o se crean a mano? | V01, V06 |
| A3 | ¿La hoja de cohorte es una pantalla con dos modos o dos pantallas separadas? | V12, V14 |
| A4 | ¿El guión se puede editar después de publicar el video, o queda congelado con la versión? | V11, V15 |
| A5 | Al activar la Ruta Esencial, ¿los 12 videos quedan marcados como vistos también en su ubicación canónica de la biblioteca? | V17 y el desbloqueo del Front |

A5 es la decisión D5 del modelo de datos, que sigue abierta y que este bloque vuelve a tocar.

---

## 8 | Brief para el siguiente prototipo

> Necesito extender el prototipo de alta fidelidad del backoffice de la Academia SIGMMA con el **bloque de arranque**: el sistema en los momentos previos al régimen que ya está maquetado.
>
> **Concepto de escena.** Cada vista declara en qué momento de la construcción está el sistema, y ese momento se indica visiblemente en la vista (por ejemplo, en el índice de navegación y en un rótulo discreto). Las escenas son cuatro: E1 sistema vacío, E2 mapa cargado, E3 P1 en producción, E4 hito de lanzamiento. Lo ya maquetado es E5, régimen.
>
> **Datos de muestra:** usar exactamente los de la sección 2 de este documento, por escena. Los números tienen que cerrar dentro de cada escena y no mezclarse entre escenas. Verificar que en E2 los videos sumen 55, en E3 sumen 2+6+4+43 = 55, y en E4 los publicados por módulo sumen 12.
>
> **Pantallas nuevas:** importador de carga inicial (asistente de 4 pasos), Home como panel de avance de construcción (en tres escenas), hoja de cohorte (modo planificación y modo sesión de grabación), alta masiva de videos, editor de guión y receta con la plantilla estructurada, alta de módulo y de sección.
>
> **Estados vacíos:** además, la versión vacía de las 6 pantallas ya maquetadas, cada una con una explicación de por qué está vacía y una sola acción posible.
>
> **Reglas:** siguen valiendo las 9 reglas no negociables del prompt anterior. Se agregan dos: (10) el Home mide avance de construcción, no operación — no inventar métricas de uso que en esta etapa no existen; (11) los videos nacen en `backlog` sin link ni versión, y el alta nunca pide un link de YouTube.
>
> Mantener las convenciones de estructura, CSS y design system del repo existente.

---

## 9 | Puntos de control

| Riesgo | Control |
|---|---|
| Que se mezclen datos de distintas escenas en una vista | Rótulo de escena visible en cada vista + verificación de las sumas |
| Que el Home vacío quede sin salida | Un solo CTA, sin menús de opciones equivalentes |
| Que el importador se maquete sin la pantalla de errores | El paso 3 (validación) es el más importante de los cuatro |
| Que la hoja de cohorte pierda el encadenamiento | El dato "viene de…" es lo que justifica la existencia del cohorte |
| Que las 5 decisiones abiertas se resuelvan de facto al maquetar | Marcarlas como pendientes, igual que se hizo con los planes |