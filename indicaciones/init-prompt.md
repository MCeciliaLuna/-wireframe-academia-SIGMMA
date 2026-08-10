# Prompt para Claude Code — Prototipo de alta fidelidad del backoffice de la Academia SIGMMA

**Uso:** pegar este archivo completo como contexto en Claude Code, junto con los tres adjuntos que se listan en la sección 2.

---

## 1 | Qué hay que construir

Un **prototipo HTML de alta fidelidad** del backoffice de gestión interna de la Academia de Autocapacitación SIGMMA. Es **solo maquetación**: HTML, CSS y el JavaScript mínimo indispensable para navegar entre pantallas y alternar vistas. Sin backend, sin API, sin persistencia real, sin lógica de negocio.

El prototipo tiene que ser **hermano del que ya existe** para la vista agencia (repo `wireframe-academia-AGENCIA`): misma estructura de proyecto, mismas convenciones de código, mismo design system, mismo criterio de deploy. Alguien que abra los dos repos tiene que reconocerlos como parte del mismo sistema.

**Qué es la Academia:** plataforma de autocapacitación para las agencias de viajes que usan SIGMMA (el ERP). Tiene dos caras: la vista agencia (donde el cliente mira videos y rinde evaluaciones, ya maquetada) y este backoffice (donde el staff interno de SIGMMA carga los videos, gestiona el ciclo de vida del contenido y administra los bancos de preguntas).

**Nomenclatura obligatoria:** la empresa es **SIGMMA**, siempre en mayúsculas y con doble M (es la sigla de Sistema Integral de Gestión Multi Modal Administrativo). El producto es **SIGMMA.net** en contexto comercial y `sigmma.net` en contexto técnico. Nunca "SIGMA".

---

## 2 | Insumos adjuntos

| Archivo | Qué es | Cómo usarlo |
|---|---|---|
| `Academia_SIGMMA_Backoffice_-_Wireframes_dc.html` | Wireframe de baja fidelidad aprobado, 6 pantallas en 8 vistas | **Fuente de verdad de layout, contenido y datos de muestra.** No inventar nada que no esté ahí |
| Design system del sistema de agencias | Tokens, tipografía (Sofia Sans), colores, componentes | Base obligatoria. Ver sección 4 para cómo extenderlo |
| Modelo de datos del backoffice | 22 entidades, reglas de integridad, máquinas de estado | Referencia conceptual para entender qué significa cada campo |

---

## 3 | Fase 0 — Calibración contra el repo existente (hacer esto PRIMERO)

Antes de escribir una sola línea, inspeccionar el repo `wireframe-academia-AGENCIA` y extraer sus convenciones:

1. **Estructura de carpetas y archivos.** ¿Un HTML por pantalla o un solo HTML? ¿Dónde viven los assets, el CSS y el JS?
2. **Organización del CSS.** ¿Un archivo o varios? ¿Hay un archivo de tokens/variables separado? ¿Nomenclatura de clases (BEM, utility, otra)?
3. **Naming de archivos.** Convención exacta (kebab-case, numeración de pantallas, prefijos).
4. **Navegación entre pantallas.** ¿Links directos, un índice, un menú compartido? ¿Cómo se comparte el layout entre pantallas sin build step?
5. **JavaScript.** Cuánto hay, para qué se usa, si hay librerías externas o es vanilla.
6. **Cómo se cargan las fuentes** y si hay un reset o normalize.
7. **Configuración de deploy** (Netlify: `netlify.toml`, `_redirects`, o nada).
8. **README.** Estructura y nivel de detalle.

Luego producir un resumen corto de las convenciones detectadas y **seguirlas al pie de la letra**. Si algo del repo existente parece un error o una decisión mejorable, señalarlo pero no cambiarlo unilateralmente: la consistencia entre los dos repos vale más que una mejora aislada.

**Si el repo no está accesible:** avisar antes de continuar y pedir la estructura, en vez de inventar una.

---

## 4 | Design system: usar y extender

El design system existente fue diseñado para un producto de cara al cliente (la vista agencia). Este backoffice es una **herramienta interna de uso diario, de alta densidad de datos**, y va a necesitar componentes que ese design system probablemente no tenga: tablas densas, chips de estado, columnas kanban, campos deshabilitados, contadores de progreso, barras de filtros.

Procedimiento:

1. **Usar todo lo que ya exista** — tokens de color, tipografía (Sofia Sans), escala de espaciado, radios, sombras, botones, inputs. No redefinir lo que ya está resuelto.
2. **Donde falte un componente, extenderlo respetando los tokens existentes.** No introducir colores, fuentes ni escalas nuevas: derivar de las que hay.
3. **Documentar cada extensión** en un archivo `DESIGN-SYSTEM-EXTENSIONS.md` en la raíz del repo, con: nombre del componente, para qué se creó, qué tokens usa, y una nota de si conviene promoverlo al design system oficial. Esto es un entregable, no un opcional.

Si el design system no tiene resuelto un componente de modal o de drawer, avisarlo: es una decisión de UX que quedó pendiente en el proyecto y conviene no darla por sentada.

---

## 5 | Reglas de diseño no negociables

Estas salieron de tres rondas de revisión del wireframe. Romperlas es un error, no una variación estilística.

| # | Regla | Por qué |
|---|---|---|
| R1 | **No hay carga de archivos de video.** Los videos viven en YouTube. El flujo es: campo de link → botón "Traer datos" (título y duración por API) → fila de validación de embebido → confirmar. Nunca dibujar un dropzone o un "arrastrá tu video acá" | El sistema no aloja video |
| R2 | **La zona de identidad del video va deshabilitada, con candado.** ID permanente, superficie y secuencia no se editan después del alta | El ID sobrevive al regrabado; la interfaz enseña la regla |
| R3 | **Estado de producción y visibilidad en el Front son dos controles separados.** Chip de estado (7 valores) + interruptor de visibilidad, habilitado solo si el estado es `publicado`. En el kanban, la visibilidad viaja como chip dentro de la tarjeta, nunca como columna | Son dos ejes independientes |
| R4 | **Los contadores de banco de preguntas se ven siempre**, durante toda la carga. No aparecen como error al final | Majo tiene que saber cuánto le falta mientras trabaja |
| R5 | **Tablas antes que tarjetas** en todo el backoffice. La vista tabla es el default del tablero de producción; el kanban es un conmutador | Los usuarios vienen de Google Sheets |
| R6 | **Densidad alta.** Herramienta interna de uso diario para 3 a 5 personas. Sin onboarding, sin tours, sin contenido de marketing, sin whitespace decorativo | La belleza no vale un clic extra |
| R7 | **Desktop 1440px.** No hay responsive en este alcance (decisión tomada para la vista agencia, se replica acá) | Fuera de alcance del MVP |
| R8 | **La Ruta Esencial referencia videos, no los copia.** Su banco de preguntas es *derivado*, y hay que mostrarlo etiquetado como tal | Un video vive una sola vez en la biblioteca |
| R9 | **El wireframe dibuja estados rotos, no ideales.** Mantener los casos de falla que ya están maquetados (sorteo que no se puede cumplir, módulo no apto para activar, preguntas a revisar) | Es el estado en el que se va a vivir mientras se carga contenido |

Los 7 estados de producción del video, en orden: `backlog` → `guionado` → `grabado` → `editado` → `publicado` → `a regrabar` → `obsoleto`.

---

## 6 | Pantallas a maquetar

Las 6 pantallas del wireframe, en 8 vistas. El wireframe adjunto tiene el layout de cada una: replicarlo, no reinterpretarlo.

| # | Pantalla | Notas |
|---|---|---|
| 1 | **Layout maestro (shell)** | Sidebar ~200px con selector global de superficie (BAK/FRT/CRM) arriba y menú agrupado por función: Contenido, Evaluación, Currícula, Pipeline, Seguimiento, Administración. Header con breadcrumb, título, chips de estado y botonera a la derecha. Es el contenedor de todas las demás |
| 2 | **Listado de módulos** | Tabla de 13 filas con columnas de orden, ID, nombre, tipo, videos publicados/total, banco, planes, estado. Barra de filtros. Incluye la fila de ID reservado con guiones |
| 3 | **Detalle de módulo** | Árbol de secciones con videos anidados + tarjeta de "aptitud para activar" con los criterios y el faltante explícito |
| 4 | **Detalle de video — solapa Ficha** | Zona de identidad bloqueada, zona editable, versión vigente con preview y campo de link, checklist de publicación |
| 5 | **Detalle de video — solapas restantes** | Versiones, Guión y receta, Preguntas, Ubicaciones |
| 6 | **Tablero de producción — vista tabla** | Métricas arriba, barra de filtros, tabla con selección múltiple |
| 7 | **Tablero de producción — vista kanban** | 7 columnas de estado, conmutable con la vista tabla |
| 8 | **Banco de preguntas del módulo** | Contador grande, preguntas agrupadas por sección con los dos indicadores (banco mínimo y mínimo por sorteo), alerta de preguntas a revisar, deuda de evaluación, vista previa del sorteo |

Además: un **índice de navegación** que permita saltar a cualquier pantalla, siguiendo el patrón que use el repo de la vista agencia.

---

## 7 | Datos de muestra — extraer del wireframe, verbatim

**Crítico: no inventar datos.** El wireframe adjunto pasó tres rondas de corrección justamente para que los datos sean los reales del proyecto. Copiarlos exactamente: nombres de módulos, títulos de videos, secciones, cantidades, estados, fechas y versiones.

Los nombres reales de los módulos BAK, para verificar que se extrajeron bien:

`BAK-M00` Fundamentos · `BAK-M10` File · `BAK-M20` Entidades (clientes, pasajeros, proveedores) · `BAK-M30` Voucher / Servicios · `BAK-M35` reservado (Tráfico) · `BAK-M40` Cobranzas / Recibos · `BAK-M50` Facturación · `BAK-M60` Pagos a proveedores · `BAK-M70` Caja y bancos · `BAK-M80` Informes · `BAK-M90` Contable · `BAK-M95` Receptivo operador · `BAK-R01` Ruta Esencial P1

Convenciones de dato que hay que respetar:

- **Prioridad:** P1, P2, P3, P4 (nunca Alta/Media/Baja — P1 a P4 son tandas de grabación, no urgencia)
- **Planes:** "plan A" y "plan B" como placeholder deliberado. El diccionario real de planes es una decisión abierta del proyecto: **no reemplazarlo por nombres inventados**
- **Versión de producto:** formato `sgm2026.XX`
- **Fechas:** DD/MM/YYYY
- **IDs de video:** `BAK-M30.050` (superficie-módulo.secuencia, de 10 en 10)

### Coherencia numérica — verificar antes de entregar

El wireframe tiene cinco cadenas de cálculo que cierran entre pantallas. Si al maquetar se toca un número, hay que recalcular todas. Verificar en BAK-M30:

1. Preguntas por sección suman el total del módulo (28)
2. Total menos las que están a revisar menos los borradores = banco vigente (20)
3. Faltantes por sección suman el faltante del módulo (15)
4. Banco mínimo por sección suma el mínimo del módulo (35)
5. Mínimos por sorteo suman exactamente la cantidad de preguntas del intento (10)

Y la regla que las une: cuando un video pasa a `a regrabar`, **todas** sus preguntas vigentes pasan a `a revisar` (en el wireframe, las 7 de `BAK-M30.060`).

---

## 8 | Restricciones técnicas

- **HTML, CSS y JS vanilla**, salvo que el repo de la vista agencia use algo distinto — en ese caso, seguirlo.
- **Sin build step**, sin framework, sin bundler, salvo que el repo existente los tenga.
- **JavaScript solo para lo imprescindible:** navegación entre pantallas, cambio de solapa, conmutador tabla/kanban, apertura de menús. Nada de estado de aplicación ni lógica de negocio.
- **Datos hardcodeados en el HTML.** No hay fetch, no hay JSON externo, no hay mock server.
- **Accesibilidad básica:** HTML semántico, `label` en los inputs, contraste que cumpla WCAG AA, foco visible, orden de tabulación coherente.
- **Deploy en Netlify**, replicando la configuración del repo de la vista agencia.

---

## 9 | Qué NO hacer

- No inventar pantallas que no estén en el wireframe (el proyecto tiene 20 pantallas identificadas; estas 6 son la primera tanda, las otras 14 son otra iteración).
- No agregar animaciones, transiciones elaboradas ni microinteracciones decorativas.
- No cambiar la arquitectura de navegación (por función + selector de superficie) por una alternativa "más limpia".
- No reemplazar tablas por tarjetas ni grillas.
- No inventar nombres de módulos, videos, planes ni números.
- No agregar responsive ni breakpoints.
- No implementar la subida de archivos de video.
- No escribir "SIGMA".

---

## 10 | Entregables

1. Repo completo con las 8 vistas maquetadas en alta fidelidad, siguiendo las convenciones del repo de la vista agencia.
2. `DESIGN-SYSTEM-EXTENSIONS.md` con los componentes nuevos y su justificación.
3. `README.md` con la estructura del proyecto, cómo correrlo local, cómo navegar las pantallas y qué queda fuera de alcance.
4. Configuración de deploy de Netlify.
5. Un resumen final en el chat con: convenciones detectadas en la fase 0, componentes que hubo que extender, y cualquier ambigüedad del wireframe que haya requerido una decisión propia (explicitando cuál se tomó y por qué).

---

## 11 | Definición de terminado

- [ ] Las 8 vistas maquetadas y navegables
- [ ] Estructura, naming y organización de CSS consistentes con `wireframe-academia-AGENCIA`
- [ ] Design system aplicado; extensiones documentadas
- [ ] Datos de muestra idénticos a los del wireframe, con las 5 cadenas numéricas verificadas
- [ ] Las 9 reglas no negociables de la sección 5 cumplidas
- [ ] Sin apariciones de "SIGMA" en el código ni en el contenido
- [ ] README y configuración de deploy listos