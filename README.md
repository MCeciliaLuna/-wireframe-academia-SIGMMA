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
| **`main`** | **El backoffice de gestión de la Academia**, en un solo archivo: `index.html`. Administra módulos, secciones, videos, bancos, planes, Meet, certificados y los paneles de avance. **No administra la fabricación del contenido** —cohorte de grabación, guion, prioridad de rodaje—: eso es la rama de abajo. | **Canónica. Es la que manda.** |
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
backoffice**, nunca al revés. La tabla de qué se alineó y por qué es el anexo del documento de
requerimientos y está más abajo, en este mismo archivo.

Vivía en una pantalla del prototipo, «Reglas y decisiones», que **se eliminó el 03/09/2026**: era el
anexo del MVP dibujado como interfaz y no administraba nada de contenido, así que en el backoffice
era dato de más. Las dos tablas que llevaba se movieron acá; la tercera, la de lo que seguía abierto,
ya estaba cubierta por «Lo que queda abierto».

Lo que comparten y no se puede tocar de un solo lado:

| Dato | Valor |
|---|---|
| Módulos del mapa | **11** publicables + `BAK-M35` reservado, en preparación |
| Secciones | **31** (más la de `BAK-M35`), con ID permanente `BAK-M40.S3` |
| Videos | **55** del mapa + 1 archivado + 1 del módulo reservado |
| Recorrido | **9** módulos con Professional · **11** con Business |
| Evaluación | 10 preguntas al azar, se aprueba con 8 (80,00 %), reintentos ilimitados |
| Sorteo | cobertura por tema **forzada**: una pregunta de cada tema, el resto al azar |
| Resultado | **no** muestra las respuestas correctas: muestra el tema fallado y el video de repaso |
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
3. **El tema del banco es una sección del propio módulo.** No hay catálogo de temas aparte, y tampoco
   hay un campo: se deriva de la sección en cada lectura. Es lo que permite medir cobertura por
   sección y etiquetar las dudas de la Meet con valores que la agencia ve. Una pregunta sale de un
   video, y de ese video hereda las dos cosas: su tema y su video de repaso.
4. **Los parámetros de la evaluación son del módulo, y ninguno se edita.** Cada módulo se mide contra
   los suyos —el checklist de publicación lee su mínimo—, pero son las condiciones del MVP y el
   backoffice no las administra: 10 preguntas por intento, umbral 80,00 %, reintentos ilimitados,
   mínimo 30 (3× el intento), objetivo 50 y cobertura por tema forzada en el sorteo. Que el
   resultado no muestre las respuestas correctas es también una condición cerrada, pero **no es un
   parámetro**: es comportamiento fijo de la pantalla de resultado, sin campo que lo diga. Los globales son la semilla con la que nace un módulo nuevo y se
   leen con candado en «Parámetros globales»: moverlos es una decisión de negocio, no una tarea de
   administración.

---

### Alineado al prototipo aprobado — el anexo del MVP v2

Qué difería entre los dos repos y cómo quedó. En todos los casos se ajustó el backoffice.

| Tema | Antes (MVP v1) | Ahora (alineado) | Por qué |
|---|---|---|---|
| **Planes** | Corporate / Business / Standard (MVP §2). | **Professional / Business**, y son de la agencia. Un solo campo **planes** por módulo y por video, con el nombre y la forma del prototipo aprobado. | El prototipo usa dos planes; el README lo marca como "a corregir". |
| **Tema del banco** | Catálogo de sub-temas con su propio ABM. | El tema **es la sección** del módulo. Se eliminó el ABM de sub-temas. | Alinea con el prototipo y con las dudas de la Meet, y borra una fuente de desincronización. |
| **Temas y secciones** | El tema seguía siendo un **campo guardado** (`subtemas`), que se calculaba una sola vez al iniciar. | Se **deriva de las secciones en cada lectura**. El campo no existe. | Una sección creada desde el backoffice existía como sección y no como tema: los desplegables de la consola quedaban vacíos y no se podía guardar ninguna pregunta, porque el tema es obligatorio. Es la misma clase de error que el estado del cupo y que los parámetros globales —un dato derivado, guardado—, y era el que quedaba. |
| **Módulos fuera de plan** | "Ver como agencia" los ocultaba. | Se **muestran con candado de plan**, sin ordinal, sin contar para el avance. | Además de pedagógico, es una superficie comercial. Decisión del prototipo. |
| **Publicación y ordinales** | La cadena salteaba los no publicados. | **Publicación en orden** obligatoria (requisito duro nuevo). El ordinal del recorrido va 1..N sin huecos. | Sostiene la invariante que el prototipo ya verifica. |
| **Planes por video** | El plan del video se heredaba del módulo, sin poder restringirlo. | Un video puede incluir **menos planes que su módulo**, como el Dashboard de KPIs (Business en un módulo que incluye a los dos). **Filtra de verdad**: a una agencia Professional se le lista con candado y no cuenta para su avance. | Sin él, ese contenido aprobado no se puede cargar. Y declarado pero sin filtrar, el candado no existía. |
| **Un solo campo de planes** | Dos campos contiguos: **tag** editorial (P+B/B/B-nicho) al lado de los planes de agencia, y el primero prellenaba al segundo. | Queda **un campo**, `planes`, más un check **caso puntual (nicho)**. La etiqueta corta P+B/B/B-nicho **se deriva** y ya no se edita. | Eran dos escrituras del mismo dato, una arriba de la otra, y las dos se llamaban "plan": no había forma de saber cuál se estaba editando. El modelo aprobado usa un solo campo. |
| **Campos de contenido** | El ABM no pedía resumen ni descripción. | Se agregaron **resumen** (card) y **descripción** (syllabus) al módulo. | El prototipo los muestra; sin ellos la card y el syllabus quedan sin texto. |
| **Meet** | Un link fijo en la ficha del módulo. | **Cupo por agencia**, cola de dudas, coordinador, franja de atención y **enlace por turno**. La ficha del módulo ya **no tiene campo de link**. | Es el modelo de negocio: una Meet por módulo por agencia, no por usuario. Dos lugares para el mismo enlace eran dos fuentes de verdad. |
| **Estado del cupo** | Se guardaba en el turno y se llamaba `sin-cola`. | **Se deriva** de la cola y de la fecha del turno, con el vocabulario del prototipo: `sin-lugares · abierto · agendado · consumido`. | Un estado guardado se desincroniza en cuanto alguien retira una duda. Y un mismo estado no puede llamarse distinto en cada superficie. |
| **Secciones** | 20 secciones con nombres propios del backoffice. | Las **31 del prototipo aprobado**, con **ID permanente** (`BAK-M40.S3`) que no se reasigna al reordenar. | La sección es el tema del banco y el de las dudas: con dos taxonomías, ninguna pregunta resolvía contra el syllabus que ve la agencia. |
| **Orden del video** | Era la posición en la estructura, sin campo propio. | Campo **orden** dentro de la sección, independiente del ID y opcional: sin él manda la estructura. | El orden de dictado y el de reserva de IDs no son lo mismo. El ID es permanente y no se renumera para mover un video. |
| **Tipos de documento** | Claves propias del backoffice (`PAS`, `LCLE`), sin patrón. | Las claves del prototipo (`PASAPORTE`, `LC-LE`) más **patrón, ejemplo y mensajes**. | Un certificado emitido con una clave no se validaba con la otra. El catálogo es un parámetro global, no una constante de cada superficie. |
| **Certificado** | No estaba en el MVP. | Plantilla, tipos de documento, fuente del documento y registro de emisiones. | El prototipo lo emite; el backoffice tiene que administrarlo. |
| **Panel + tracking** | Estaba como "fase 2". | Avance por agencia y panel general, con la regla de agregación del prototipo. | El logueo de eventos entra en el MVP aunque las pantallas se pulan después: es lo irrecuperable. |
| **Banco** | Mínimo 20. | Mínimo **30** (3× el intento), objetivo 50. | Con reintentos ilimitados, un banco chico se memoriza. |
| **Dónde vive la evaluación** | Repartida en cinco lugares: dos pestañas de la ficha del módulo y tres pantallas propias, ninguna en la navegación principal. | Una **consola única** por módulo —Banco, Cobertura, Previsualizar— con selector de módulo, entrada propia en el rail y una sola pestaña "Evaluación" en la ficha. | Cargar preguntas de un módulo que no fuera el de la puerta del hub costaba cinco clicks y saber que el banco vivía dentro del árbol de estructura. Y adentro del banco no se podía cambiar de módulo. |
| **Parámetros de la evaluación** | El objetivo y el mínimo se editaban en dos pantallas —la ficha del módulo y Parámetros globales— sin precedencia definida. | **Son del módulo y no se editan en ningún lado.** Se leen con candado en «Parámetros globales», y `cotejo.js` custodia que los 12 módulos declaren lo mismo. | El global se copiaba una sola vez al iniciar, así que editarlo no propagaba a lo ya creado: el mismo número en dos lugares, y ninguno mandaba. Al quedar editables solo por módulo se vio lo otro: **nadie se apartó nunca** del valor por defecto, porque no había nada que decidir. |
| **Decisiones 1, 2 y 6** | Carteles fijos que decían "a definir" en la ficha. | **Cerradas.** La 2 (forzar cobertura) queda en **sí** y la 1 (mostrar correctas) en **no**, como reglas del MVP: se aplican y no se configuran. La 6 (caducar al regrabar) **salió del dato**. | Una decisión abierta se cierra probándola: negocio las vio funcionando —el sorteo, y el resultado con y sin las correctas a la vista— y las firmó, así que la pestaña que las editaba dejó de tener razón de ser. El comparador de variantes del resultado corrió la misma suerte: era el instrumento para decidir, no una opción del producto, y se retiró con la decisión firmada. La 6 nunca llegó a probarse porque nunca tuvo comportamiento, solo se dibujaba: si vuelve, vuelve con comportamiento. |
| **Vigencia del banco** | El banco de cada momento era un corte del pool contra una tabla de totales. | Cada pregunta declara **desde qué momento existe**, y el pool apunta al objetivo del módulo. | La tabla declaraba 50 preguntas para módulos cuyo pool máximo eran 18: el checklist pedía un mínimo inalcanzable, y una pregunta cargada a mano no movía ningún contador. |
| **Publicado y publicable** | El checklist se evaluaba antes que la visibilidad, así que un módulo publicado que dejaba de cumplir decía "todavía no se puede publicar". | Tres estados separados, incluido **"publicado, pero hoy no cumple"**, y el hub los cuenta por separado. | Es información de control: el módulo está afuera, en manos de las agencias, y hoy no cumple. Decirle "todavía no se publicó" era falso y tapaba el aviso. |
| **Video de repaso** | La pregunta tomaba el tema de su sección y el video de un video cualquiera del módulo. | Cada pregunta **sale de un video** y hereda de él las dos cosas: su tema y su video de repaso. | Una pregunta de "Los números del voucher" podía mandar a repasar un video de otra sección: el resultado derivaba a un video que no explicaba el concepto fallado. |
| **Carga de contenido** | Carga masiva desde planilla, en tres modos: estructura, videos y preguntas. | **Carga manual** de punta a punta: módulo, sección, video y pregunta, de a uno. La carga masiva queda **diferida post-MVP**. | El importador estaba diseñado pero no implementado: el pegado no se leía y la vista previa corría contra filas de ejemplo. Entregar el MVP con la carga que sí funciona es más honesto que entregar una pantalla que promete lo que no hace. |

### Decisiones que el prototipo cierra

No hacen falta como pendientes: el prototipo aprobado ya las resolvió y el backoffice las respeta.

| Lo que el prototipo ya cierra | Cómo |
|---|---|
| **Mostrar las respuestas correctas** | No se muestran (P07.6). Solo el tema fallado y el video de repaso. Es el único comportamiento de la pantalla de resultado: no se configura ni se compara. |
| **Orden independiente del ID** | Confirmado y en uso: tres secciones muestran los videos fuera del orden de ID a propósito. |
| **Estado "Próximamente"** | No existe: un módulo se publica solo con su syllabus completo. Valida el requisito "al menos un video". |
| **Tipo de pregunta** | Opción única con 4 opciones. Verdadero/falso no necesita desarrollo aparte. |
| **Qué número ve la agencia** | La posición en el recorrido (1..N), nunca el ID. |
| **Rehacer evaluación aprobada** | Gana la última nota aprobada; desaprobar no revoca (P05.4). |

## Qué se persiste y qué se deriva

La mitad de las contradicciones que este prototipo cazó salían de guardar algo que había que calcular.
La regla: **si se puede derivar, se deriva.**

| Se deriva | De qué sale |
|---|---|
| Recorrido y su total (9 / 11) | `modulo.planes` ∩ plan de la agencia, excluyendo los reservados |
| Planes de un video | `video.planes` si existe; si no, los del módulo — la ausencia **es** la herencia |
| Etiqueta corta `P+B` / `P` / `B` / `B-nicho` | `modulo.planes` + el flag `modulo.nicho` (`etiquetaPlanes`) |
| Etiqueta legible «Professional + Business» / «Business · caso puntual» | la misma fuente (`etiquetaPlanesLarga`); sin planes es «sin plan asignado» |
| La frase que explica el caso en pantalla | la misma fuente (`ayudaPlanes`), y es el único lugar donde se escribe |
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

Lo que se ve es **solo lo que administra contenido**. Las «notas de diseño» —los carteles que
contaban qué había cambiado en cada versión del prototipo— se apagaron el 03/09/2026 con el flag
`MVP.notas`, junto con el check del rail que las prendía. Eran dato de proceso: útiles para acordar
el modelo con negocio, ruido para quien entra a cargar un video. El texto no se perdió, está escrito
detrás del flag (ver `CLAUDE.md`).

### Las escenas

El prototipo declara **en qué momento de la construcción de la Academia está el sistema**. Se cambia
con los botones del encabezado:

| Escena | Qué se ve |
|---|---|
| `E1` · Día cero | Nada cargado. Se crea el primer módulo con su primera sección |
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
| Empezar | Qué querés hacer |
| Contenido | Estructura de la Academia (árbol y ficha) · **Evaluaciones y bancos** |
| Soporte y certificación | Meet y colas de dudas · Certificados |
| Seguimiento | Avance por agencia · Panel general |
| Control | **Ver como agencia** · Parámetros globales |

Son los nueve ítems del rail, en ese orden. «Cargar desde planilla» iría en Contenido y está apagada
por el flag `MVP.importador`. Antes había además dos entradas que ya no existen: «Reglas y
decisiones», el anexo del MVP, y «Roles y permisos», que se fue con el selector de rol.

**Evaluaciones y bancos** es la consola de la evaluación de un módulo: banco de preguntas,
cobertura por tema, parámetros y previsualización del intento, con el módulo elegido en el
encabezado. Reemplaza a las tres pantallas sueltas que había antes (banco, temas y previsualizar) y a
las dos pestañas de la ficha; la ficha del módulo conserva una sola pestaña **Evaluación**, que es un
resumen con la puerta.

«Ver como agencia» es la que más rinde para revisar antes de publicar: muestra el recorrido tal como
lo ve una agencia de cada plan, con los módulos fuera de plan bajo candado y sin ordinal.

### Los roles: ya no existen

El ajuste v4 eliminó el selector de rol del encabezado y los tres helpers que atenuaban acciones
(`can()` / `dis()` / `porque()`). **Todos los usuarios del backoffice entran con las mismas
atribuciones**: las cuatro puertas del hub están siempre disponibles y ningún botón se deshabilita
según quién esté mirando. Si el permiso por perfil vuelve a hacer falta, es una decisión de negocio
que hay que abrir de nuevo, no código que esté esperando apagado.

---

## Qué es ficticio

Las 12 agencias y sus 59 personas, los links de YouTube, las duraciones, los enunciados de las
preguntas y los porcentajes de uso del panel general. **No es ficticio el contenido**: los 11 módulos,
las 31 secciones y los 55 IDs de video son los del mapa de contenido, los mismos del repo de la
agencia.

**Son 12 agencias y no 2 para que el selector de agencia se pueda demostrar.** SIGMMA administra
muchas agencias, así que las dos pantallas que eligen una —«Avance por agencia» y «Meet y colas de
dudas»— la **buscan**, no la recorren con la vista: el buscador es el camino principal y los botones
quedan como atajo. Con dos filas eso no se puede mostrar. Del dataset ampliado, cuatro casos están
puestos a propósito, porque son los que el selector tiene que ordenar bien y las otras pantallas
tienen que tolerar: una agencia recién incorporada (todo el plantel en 0 y sin ningún acceso), una
con el recorrido cerrado (100,00 %), una de plantel chico y una de plantel grande. Tres reglas del
dato que hay que mantener al agregar una agencia: plantel no vacío (el promedio divide por su
tamaño), `coordinadorId` apuntando a alguien de su propio plantel, y un certificado emitido en el
registro por cada `cert:true` del plantel — si no, el plantel dice «emitido» y el registro no lo
tiene.

**Las agencias sugeridas del selector se derivan, no se sortean.** El criterio es el que Capacitación
efectivamente persigue —**menor avance del recorrido, desempate por actividad reciente**— y el rótulo
lo nombra en pantalla, así que la sugerencia se puede explicar. No son aleatorias por dos motivos: el
prototipo vuelve a dibujar la pantalla en cada tecla, así que un sorteo por render haría temblar los
botones mientras se escribe; y una sugerencia al azar no le sirve a nadie que esté buscando a quién
salir a buscar. Es la misma regla que el resto del prototipo: si se puede derivar, se deriva.

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
- Si la aprobación caduca al regrabar un video del módulo (decisión 6). Es la única de las tres
  decisiones de la evaluación que sigue abierta: la 2 (forzar cobertura en el sorteo) se cerró en
  **sí** y la 1 (mostrar las respuestas correctas al finalizar) en **no**, y las dos se pueden ver
  aplicadas en la consola —en Previsualizar y en la pantalla de resultado—. La 6 **no tiene campo
  ni interfaz**: nunca tuvo comportamiento, solo se dibujaba, así que salió del dato. Cerrarla es
  decidir qué hace, no qué valor toma.
- Despublicar un módulo que una agencia está cursando: ¿pierde acceso, aprobación, ordinal?
- Si la Meet debe exigir aprobar (`P08.6`): el que necesita ayuda es el que desaprueba.
- Quién designa al coordinador y qué pasa si se va de la agencia.
- Las superficies FRT y CRM: ¿recorrido propio con certificado propio, o secuencia intercalada?
- **El ABM de agencias no existe en ninguno de los dos repos.** Falta definir si vive en la Academia
  o en el ABM de usuarios de sigmma.net.
- **El nombre de los planes.** Acá y en la vista agencia son Professional / Business; el alcance
  funcional del MVP dice Corporate / Business / Standard y la línea multipágina usa
  Professional / Business / Corporate. Son tres taxonomías en tres documentos: hay que cerrarlo con
  negocio. **El colapso a un solo campo `planes` no cierra este pendiente**: cambia dónde se guarda
  el dato, no cómo se llaman los planes.
- **El «caso puntual» (`modulo.nicho`).** Hoy solo lo tiene Receptivo operador, y lo único que hace
  es cambiar cómo se nombra el módulo: la etiqueta corta `B-nicho`, la legible «Business · caso
  puntual» y, del lado agencia, la cláusula del aviso de módulo fuera de recorrido. Lo que **sigue
  abierto es el comportamiento**: si entra al recorrido, si aparece en el certificado, o si queda
  para siempre como editorial. Lo que ya no está abierto es la explicación: el concepto está escrito
  en pantalla —en los dos formularios, en el árbol, en el panel general y en el botón `i` de la ficha
  (`ayudaPlanes`)— y esa copy dice explícitamente que hoy no cambia recorrido, evaluación ni
  certificado. **Si negocio cierra el pendiente, `ayudaPlanes` es el único texto a reescribir.**
- **Los planes en la ficha del módulo.** El check «caso puntual» de la ficha ahora escribe
  (`data-nicho`), pero los dos checks de `PLANES` que están arriba **siguen siendo decorativos**: se
  tildan y el render siguiente los revierte sin avisar. Es el mismo defecto que tuvieron el nombre de
  la sección y los planes del video, y se arregla igual —un `data-*` y una rama en el handler de
  `change`—, pero implica decidir si el backoffice deja **cambiarle el plan a un módulo ya
  publicado**: eso mueve el recorrido de las agencias que lo tienen y la alineación con el mapa
  aprobado. Es una decisión de negocio, no una de implementación.

### Carga masiva desde planilla — diferida post-MVP

**Para la entrega, la carga de contenido es manual de punta a punta**: módulo, sección, video y
pregunta, de a uno. La pantalla «Cargar desde planilla» está apagada por el flag `MVP.importador`
(ver `CLAUDE.md`), no por borrado: el código sigue en `index.html`, inalcanzable.

Se difiere porque **estaba diseñada pero no implementada**. Lo que hay que saber cuando se retome:

- **El `<textarea>` nunca se lee.** No hay parser: las filas de la vista previa son fixtures fijos
  (`FILAS_E`, `FILAS_V`, `FILAS_P`) y «Subir un archivo CSV» es un `toast()`. Bajo `file://` un
  `<input type="file">` con `FileReader` sí funciona —no necesita `fetch`—, así que el botón es
  implementable sin romper la restricción del doble click.
- **Solo el modo Preguntas escribe de verdad** (`qImportar` → `qGuardar`). El modo Videos no crea
  nada y el modo Estructura crea tres módulos FRT hardcodeados, sin relación con lo pegado.
- **Lo que sí está cerrado y no hay que rediscutir**: el contrato de columnas de los tres modos, el
  cruce del tema por ID de sección con el nombre como respaldo que avisa, y la regla de que un lote
  no se rechaza entero por una celda (aviso entra, error no: `esAviso`).
- **Definición de negocio pendiente**: la planilla de videos no declara **a qué sección** va cada
  video. El ID (`BAK-M30.060`) nombra el módulo y la secuencia, pero no la sección, y los videos
  viven dentro de secciones. Falta una columna o una regla.
- **Dos filas del fixture de videos mienten** y hay que corregirlas antes de usarlo como demo:
  `BAK-M30.060` y `BAK-M30.070` figuran como filas limpias, pero esos dos videos **ya existen** en
  `DATA` (`BAK-M30.S3` y `BAK-M30.S4`). En el mismo pegado hay otra fila cuyo error declarado es
  justamente «Ya existe un video con este ID».
- **Nada del importador entra en el bloque que evalúa `cotejo.js`**, así que ningún control
  automático lo custodia. Si se retoma, conviene extender el script para cotejar los tres fixtures
  contra `DATA`.

### Requisito del front que no es de este repo

El panel general se apoya en eventos que **hay que loguear desde el día uno**: por usuario y módulo,
los intentos con fecha-hora al segundo, la versión de cada pregunta sorteada, la respuesta y la nota;
por usuario y video, **aperturas**, progreso y visto ≥80 %. La apertura es la que hoy no emite
ninguna de las dos superficies. Si no entra al MVP, la métrica es irrecuperable: no se reconstruye
después.
