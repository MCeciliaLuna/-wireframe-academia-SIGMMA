# Academia SIGMMA — backoffice de gestión (prototipo de alta fidelidad)

Maquetación del **backoffice interno** de la Academia de Autocapacitación SIGMMA: donde el staff carga
el contenido, administra los bancos de preguntas, publica módulos y sigue el avance de las agencias.
La otra cara —la que usan las agencias— vive en el repo hermano
[`wireframe-academia-AGENCIA`](https://github.com/MCeciliaLuna/wireframe-academia-AGENCIA).

El lenguaje visual sale de [`ESTILOS-ACADEMIA.md`](./ESTILOS-ACADEMIA.md), extraído de sigmma.net.

> **No hay backend, ni API, ni videos reales, ni SSO.** Es un prototipo navegable: sirve como
> referencia de construcción para desarrollo y como pieza presentable a negocio.

---

## La rama canónica es `main`

El repo tiene tres ramas y **no describen el mismo sistema**. Esto es lo primero que hay que saber
antes de estimar o de escribir una línea de código:

| Rama | Qué es | Estado |
|---|---|---|
| **`main`** | **El backoffice de gestión de la Academia**, en un solo archivo: `index.html`. Administra módulos, secciones, videos, bancos, planes, Meet, certificados y los paneles de avance. | **Canónica. Es la que manda.** |
| `feat/simplificacion-bloque-a` | Backoffice **multipágina de producción de contenido**: cohortes, guiones, tablero de rodaje, importador. Es la herramienta de trabajo de Capacitación para *fabricar* los videos. | Otro producto, otro alcance. **Fuera de este MVP.** |
| `inicio-panel-de-modulos` | Estado intermedio de esa misma línea multipágina. | Histórica. No usar. |

La línea multipágina declara **fuera de alcance** justamente lo que hace falta para que el sistema
cierre con la vista de agencia —matriz perfil × módulo, usuarios y roles, auditoría— y además usa
**tres planes** (Professional / Business / Corporate) donde el modelo aprobado usa dos. Tomar esa
rama por error lleva a construir un sistema que no matchea con la Academia que ve la agencia.

**Si venís a implementar el MVP de gestión, la rama es `main` y el archivo es `index.html`.**

---

## El modelo aprobado es el repo de la agencia

`academia-AGENCIA` está aprobado por negocio. **Donde los dos difieren, manda AGENCIA y se ajusta el
backoffice**, nunca al revés. La pantalla **«Reglas y decisiones»** del propio prototipo lleva la
tabla de qué se alineó y por qué; es el anexo del documento de requerimientos.

Lo que comparten y no se puede tocar de un solo lado:

| Dato | Valor |
|---|---|
| Módulos del mapa | **11** publicables + `BAK-M35` reservado, en preparación |
| Secciones | **31** (más la de `BAK-M35`), con ID permanente `BAK-M40.S3` |
| Videos | **55** del mapa + 1 archivado + 1 del módulo reservado |
| Recorrido | **9** módulos con Professional · **11** con Business |
| Evaluación | 10 preguntas al azar, se aprueba con 8 (80,00 %), reintentos ilimitados |
| Banco | objetivo 50, mínimo 30 para publicar (3× el intento) |
| Visto | 80 % de la duración |
| Meet | 30 min · martes y jueves · 15:00 a 16:30 · ventana de 3 semanas · ART (UTC-3) |
| Tipos de documento | `DNI` · `PASAPORTE` · `CI` · `LC-LE` |

### Las cuatro reglas que sostienen todo lo demás

1. **El ID es permanente.** El del módulo, el de la sección y el del video. No se reasigna ni se
   renumera nunca — sobrevive al regrabado. Por eso el **orden** es un campo aparte del ID.
2. **Toda base de cálculo son los módulos del recorrido del plan**, nunca los 11 del mapa. Un módulo
   fuera del plan de la agencia se muestra con candado, pero no entra a la cadena de desbloqueo ni a
   ningún denominador.
3. **El tema del banco es una sección del propio módulo.** No hay catálogo de temas aparte. Es lo que
   permite medir cobertura por sección y etiquetar las dudas de la Meet con valores que la agencia ve.
   Una pregunta sale de un video, y de ese video hereda las dos cosas: su tema y su video de repaso.
4. **Los parámetros de la evaluación son del módulo.** Los globales son la semilla con la que nace un
   módulo nuevo, no un segundo lugar donde editarlos. Lo que sí es global y no se edita son las reglas
   del MVP: 10 preguntas por intento, umbral 80,00 %, reintentos ilimitados, mínimo = 3× el intento.

---

## Qué se persiste y qué se deriva

La mitad de las contradicciones que este prototipo cazó salían de guardar algo que había que calcular.
La regla: **si se puede derivar, se deriva.**

| Se deriva | De qué sale |
|---|---|
| Recorrido y su total (9 / 11) | `modulo.perfiles` ∩ plan de la agencia, excluyendo los reservados |
| Posición en el recorrido (1..N, sin huecos) | orden de los módulos publicados del recorrido |
| **Estado del cupo de Meet** | la cola de dudas + la fecha del turno |
| Promedio de avance de la agencia | aprobaciones del plantel / (personas × total del recorrido) |
| Cobertura del banco por tema | `pregunta.st` contra las secciones del módulo |
| **Qué preguntas existen en cada escena** | `pregunta.desde` contra la escena actual |
| Si un módulo se puede publicar | el checklist, contra el banco y los videos del momento |

El estado del cupo es el caso de manual: guardado se desincroniza en cuanto alguien retira una duda.
Sus cuatro valores son `sin-lugares` → `abierto` → `agendado` → `consumido`, con **el mismo
vocabulario que la vista agencia**. No hay `vencido`: la cola no caduca.

Y el enlace de la Meet **vive en el turno y solo en el turno**. La ficha del módulo no tiene campo de
link, a propósito: dos lugares para el mismo dato son dos fuentes de verdad.

---

## Cómo verlo

**Sin instalar nada.** Abrí `index.html` con doble click. No hay build, ni dependencias, ni servidor.

### Las escenas

El prototipo declara **en qué momento de la construcción de la Academia está el sistema**. Se cambia
con los botones del encabezado:

| Escena | Qué se ve |
|---|---|
| `E1` · Día cero | Nada cargado. Se puede crear el primer módulo o pegar la estructura |
| `E2` · IDs reservados | Los 55 videos existen como IDs en backlog, sin bancos |
| `E3` · Guionando y grabando | Los de Prioridad 1 entre guionados y grabados |
| `E4` · Ruta esencial publicada | BAK-M00, M10 y M20 completos y visibles; uno con el embebido roto |
| `E5` · En régimen *(default)* | Todo publicado con el banco completo: aparece la cola de «a regrabar» |

El banco también depende de la escena, y cada pregunta declara **desde cuándo existe** (`desde`):
`E1` y `E2` sin banco, `E3` el primer banco a medio cargar —el único caso donde se ve la regla de
cobertura bloqueando de verdad—, `E4` la ruta esencial completa, `E5` todos los módulos en su
objetivo. Una pregunta cargada a mano nace en la escena en la que se cargó, igual que un video.

### Las pantallas

| Grupo | Pantalla |
|---|---|
| Inicio | Qué querés hacer · **Reglas y decisiones** |
| Contenido | Estructura de la Academia (árbol y ficha) · **Evaluaciones y bancos** · Cargar desde planilla |
| Soporte | Meet y colas de dudas · Certificados |
| Seguimiento | Avance por agencia · Panel general |
| Revisión | **Ver como agencia** · Roles y permisos · Parámetros globales |

**Evaluaciones y bancos** es la consola de la evaluación de un módulo: banco de preguntas,
cobertura por tema, parámetros y previsualización del intento, con el módulo elegido en el
encabezado. Reemplaza a las tres pantallas sueltas que había antes (banco, temas y previsualizar) y a
las dos pestañas de la ficha; la ficha del módulo conserva una sola pestaña **Evaluación**, que es un
resumen con la puerta.

«Ver como agencia» es la que más rinde para revisar antes de publicar: muestra el recorrido tal como
lo ve una agencia de cada plan, con los módulos fuera de plan bajo candado y sin ordinal.

### Los roles

El rol del encabezado **no es decorativo**: deshabilita botones en todas las pantallas.
`Contenido` crea y edita pero no publica · `Publicación` además publica, archiva y toca los
parámetros · `Consulta` es solo lectura.

---

## Qué es ficticio

Las 2 agencias y sus 11 personas, los links de YouTube, las duraciones, los enunciados de las
preguntas y los porcentajes de uso del panel general. **No es ficticio el contenido**: los 11 módulos,
las 31 secciones y los 55 IDs de video son los del mapa de contenido, los mismos del repo de la
agencia.

Los bancos de preguntas están escritos de verdad solo en `BAK-M30` y `BAK-M40`; el resto se completa
con preguntas de estructura, y la interfaz lo avisa. Escribir los bancos reales es trabajo de
contenido, no de código.

---

## `wireframe.html`

Es la versión low-fi de este mismo backoffice, **congelada el 02/09/2026**. No está enlazada desde
`index.html` y **no es fuente de verdad**: quedó como registro del paso previo. Las correcciones de
dato no se replican ahí a propósito — dos copias del mismo dataset se desincronizan solas.

---

## Lo que queda abierto

Deuda compartida con el repo de la agencia, no divergencias entre los dos:

- Cómo se mide el 80 % de visto: posición del cursor vs. segundos acumulados anti-scrub (`P04.3`).
- De dónde sale el documento del titular del certificado (`CE-1`) y si se persiste.
- Longitudes válidas por tipo de documento (`CE-3`): las de acá son conservadoras, sin confirmar.
- Si la aprobación caduca al regrabar un video del módulo (decisión 6). **Ya es configurable por
  módulo**, junto con forzar cobertura en el sorteo (decisión 2) y mostrar las respuestas correctas al
  finalizar (decisión 1): las tres arrancan en «a definir» y se pueden probar en la consola antes de
  cerrarlas con negocio.
- Despublicar un módulo que una agencia está cursando: ¿pierde acceso, aprobación, ordinal?
- Si la Meet debe exigir aprobar (`P08.6`): el que necesita ayuda es el que desaprueba.
- Quién designa al coordinador y qué pasa si se va de la agencia.
- Las superficies FRT y CRM: ¿recorrido propio con certificado propio, o secuencia intercalada?
- **El ABM de agencias no existe en ninguno de los dos repos.** Falta definir si vive en la Academia
  o en el ABM de usuarios de sigmma.net.
- **El nombre de los planes.** Acá y en la vista agencia son Professional / Business; el alcance
  funcional del MVP dice Corporate / Business / Standard y la línea multipágina usa
  Professional / Business / Corporate. Son tres taxonomías en tres documentos: hay que cerrarlo con
  negocio.

### Requisito del front que no es de este repo

El panel general se apoya en eventos que **hay que loguear desde el día uno**: por usuario y módulo,
los intentos con fecha-hora al segundo, la versión de cada pregunta sorteada, la respuesta y la nota;
por usuario y video, **aperturas**, progreso y visto ≥80 %. La apertura es la que hoy no emite
ninguna de las dos superficies. Si no entra al MVP, la métrica es irrecuperable: no se reconstruye
después.
