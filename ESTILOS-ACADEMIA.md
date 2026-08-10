# Guía de estilos SIGMMA.net — referencia de diseño para Academia

> **Qué es este documento.** Un extracto del lenguaje visual real de sigmma.net (repo `web-2026`),
> escrito para **diseñar**, no para codear. Contiene los valores exactos (colores, tipografía,
> escalas, medidas, estados) y la anatomía de cada componente, para que el diseño de Academia
> nazca alineado a la marca sin tener que leer el código.
>
> **Fuente:** `src/styles/variables.css`, `src/styles/globals.css` y los 121 CSS Modules del repo.
> **Fecha de extracción:** 31/07/2026.
>
> **Cómo leerlo.** Las secciones 1 a 4 son el *sistema* (lo que hay que respetar siempre).
> La 5 es el *catálogo de componentes* (anatomía y medidas). La 6 marca lo que **no** conviene
> replicar. La 7 es un brief comprimido, listo para pegar en Claude design como contexto.

---

## 1. Identidad visual en una frase

Un ERP B2B que se presenta **corporativo pero luminoso**: azules profundos como base institucional,
celeste como acento de energía, naranja reservado para llamadas a la acción puntuales, mucho blanco,
tipografía condensada de peso alto para titulares. El recurso estético distintivo no es el color
plano sino el **borde de gradiente celeste→azul** sobre fondo blanco, que aparece en botones,
paneles y contenedores destacados.

Sensación buscada: orden, confiabilidad, tecnología accesible. Nada de neón, nada de dark mode
(el sitio es 100% light), nada de ilustración caricaturesca.

---

## 2. Color

### 2.1 Paleta de marca

Cinco familias, cada una con tres valores (dark / normal / light). En el código se llaman
`--color-{n}-{variante}`; los nombres son numéricos, no semánticos.

| Familia | Rol real en el sitio | dark | **normal** | light |
|---|---|---|---|---|
| **1 — Índigo** | Titulares, textos de card, fondos institucionales profundos | `#212556` | `#2f346c` | `#454c9a` |
| **2 — Azul corporativo** | **Color primario**: botones sólidos, links, focus, topbar | `#003f7f` | `#004f9f` | `#006fe0` |
| **3 — Celeste** | Acento, gradientes, hovers, glows | `#008dc0` | `#00a6e2` | `#3dc4f4` |
| **4 — Naranja** | CTA de alto contraste, destacados puntuales | `#e6531f` | `#ff6b35` | `#ff9b73` |
| **5 — Verde** | Confirmaciones, checks, estados positivos | `#219667` | `#2dbe83` | `#70dcaf` |

Notas de uso observadas:
- El **primario efectivo** es `#004f9f` (relleno de botón) y su `light` `#006fe0` (link, hover, foco).
- El **índigo `#212556`** es el color de texto de titulares y de los fondos oscuros de sección.
- El **celeste `#3dc4f4`** casi nunca se usa plano: aparece en gradientes y en washes al 10 %.
- El **naranja** es minoritario y deliberado. No lo repartas: pierde función.
- Azul auxiliar de fondo: `#e5f1fd` (wash claro para bloques informativos).

### 2.2 Grises

Escala de 9 pasos (estilo Tailwind), más blanco y negro puros.

| Token | Hex | Uso típico |
|---|---|---|
| gray-100 | `#f9fafb` | Fondo de cards |
| gray-200 | `#f1f3f5` | Bordes suaves, divisores del chrome |
| gray-300 | `#e5e7eb` | **Borde de card por defecto** |
| gray-400 | `#d1d5db` | Scrollbar, bordes de input |
| gray-500 | `#9ca3af` | Texto deshabilitado |
| gray-600 | `#6b7280` | **Texto secundario / metadatos** |
| gray-700 | `#4b5563` | Links de navegación en reposo |
| gray-800 | `#1f2937` | Texto de botón outline |
| gray-900 | `#111827` | **Texto de cuerpo y titulares por defecto** |

### 2.3 Gradientes

Seis gradientes fijos. Los dos primeros son sólidos (para superficies), los otros cuatro llevan
alpha (para overlays sobre foto/video).

| # | Definición | Uso |
|---|---|---|
| 1 | `90deg, #006fe0 20% → #003f7f 100%` | Superficie azul institucional |
| 2 | `90deg, #3dc4f4 20% → #006fe0 100%` | Superficie de acento, la más "marca" |
| 3 | `90deg, rgba(61,196,244,.6) → transparente` | Wash celeste lateral |
| 4 | `90deg, rgba(0,111,224,.1) → rgba(255,255,255,.9)` | Fade azul→blanco |
| 5 | Igual que 4, invertido | Fade blanco→azul |
| 6 | `90deg, rgba(33,37,86,.1) → rgba(69,76,154,.9)` | Fade índigo |

**El borde de gradiente** (firma visual): borde de 1px pintado con
`180deg, #3dc4f4 20% → #006fe0 50%` sobre relleno blanco. En hover, el relleno se tiñe ~10 % de
azul y el texto pasa a `#006fe0`. Es el tratamiento del botón secundario, del panel de la
calculadora y de varios contenedores destacados. Si Academia necesita un solo gesto heredado,
es este.

### 2.4 Vacío a cubrir en Academia

El sistema actual **no tiene tokens de feedback**. Los rojos aparecen hardcodeados y sin criterio
(`#dc2626`, `#ff4d4f`, `#fef2f2`, `#fee2e2`, `#fecaca`). Para un producto con formularios,
progreso y evaluaciones, definí desde el diseño una escala de estados propia:

- **error** (base / fondo / borde)
- **advertencia**
- **éxito** → puede anclarse en la familia 5 (`#2dbe83`)
- **informativo** → puede anclarse en `#006fe0` / `#e5f1fd`

---

## 3. Tipografía

### 3.1 Familias

| Familia | Rol | Pesos disponibles |
|---|---|---|
| **Sofia Sans** | Titulares, UI, botones — es la voz del sitio | 400 y **700** |
| **Roboto** | Familia secundaria, texto largo | 400 y 700 |

Sofia Sans es condensada y de aspecto técnico: los titulares en 700 se leen compactos y con
presencia. Es lo que hace que el sitio no parezca genérico. **Diseñá asumiendo solo 400 y 700**
disponibles: los pesos intermedios (500/600) se usan en el código pero se renderizan sintetizados,
no son reales. Si Academia necesita un 500 o 600 verdadero, hay que sumar el archivo de fuente.

### 3.2 Escala de tamaños (px, fija)

| Nivel | Tamaño | Nivel | Tamaño |
|---|---|---|---|
| H1 | 72 | body large | 18 |
| H2 | 57 | body medium | **16** (base) |
| H3 | 45 | body small | 14 |
| H4 | 36 | botón large | 22 |
| H5 | 28 | botón medium | 16 |
| H6 | 22 | botón small | 12 |
|  |  | mínimo absoluto | 12 |

Interlineado: **tight 1.2** (titulares), **normal 1.5** (cuerpo, es el default), **relaxed 1.75**.

> **Atención al diseñar.** Esta escala es la de **desktop** y es fija: no es fluida. En mobile
> cada bloque la reduce a mano, sin regla común. Si en Academia definís la escala con un rango
> (mínimo mobile → máximo desktop) para cada nivel, el diseño se vuelve mucho más fácil de
> implementar bien y evitás la inconsistencia actual. Un H1 de 72 px en mobile es inviable:
> definí explícitamente cuánto mide ahí.

### 3.3 Comportamiento por defecto de los titulares

Todos los headings salen en peso 700, interlineado 1.2, color `#111827`, con 16 px de aire abajo.
Los párrafos: interlineado 1.5, 16 px de aire abajo. Los links: `#004f9f`, sin subrayado, hover a
`#006fe0`.

---

## 4. Sistema espacial, forma y profundidad

### 4.1 Espaciado — escala de 8 (con medio paso)

`4 · 8 · 16 · 24 · 32 · 48 · 64 · 96` px (xs → 4xl).

Es la parte **mejor adoptada** del sistema (más de 600 usos consistentes). Diseñá Academia sobre
esta grilla sin excepciones. Valores de referencia observados:
- Gap interno de grupos pequeños (icono + texto): **8**
- Padding de card: **24**
- Padding interno de modal: **32**
- Separación entre bloques dentro de una sección: **32–48**
- Respiro vertical entre secciones: **64–96**

### 4.2 Radios

`4 (sm) · 8 (md) · 12 (lg) · 16 (xl) · 9999 (full)`

- **12 px** → botones, modales, paneles. Es el radio característico.
- **16 px** → cards.
- **full** → chips y píldoras.

### 4.3 Sombras

Cuatro niveles, tipo Tailwind (sm / md / lg / xl). En la práctica el sitio es **plano**: la
jerarquía la dan el borde de 1px y el fondo `#f9fafb`, no la sombra. Las sombras fuertes se
reservan para el modal (`0 12px 48px rgba(0,0,0,.25)`) y para *glows* de acento
(`0 0 12px rgba(76,153,220,.25)` en hover del botón de borde-gradiente).

**Regla de diseño heredada: elevá con borde + fondo, no con sombra.**

### 4.4 Movimiento

| Velocidad | Duración |
|---|---|
| rápida | 150 ms |
| **base** | 250 ms |
| lenta | 350 ms |

Curva: `ease-in-out` como default; el hero usa `cubic-bezier(.25,.1,.25,1)` a 600 ms.
Los hovers reales del sitio corren a **300 ms** y animan color, borde, sombra, opacidad y
`transform` (nunca alto/ancho).

Animaciones de entrada existentes: *fade in* y *slide in up* (desplazamiento de 20 px hacia
arriba) a velocidad base. El hero entra con un `translateY(12px) → 0` en 600 ms, **sin** fade,
para no penalizar la métrica de carga.

Toda animación debe tener su variante **reducida** (para `prefers-reduced-motion`). En el sitio
actual esto casi no está implementado; en Academia conviene definirlo desde el diseño.

### 4.5 Grilla, anchos y breakpoints

Contenedor central: ancho máximo **1280 px**, centrado, con padding lateral que crece por tramo:
**16 px** (mobile) → **32 px** (≥768) → **48 px** (≥1024).

Anchos alternativos disponibles: 640 / 768 / 1024 / 1280 / 1536 / 100 %.

**Breakpoints reales del sitio** (mobile-first, `min-width`):

| Nombre | Valor | Peso de uso |
|---|---|---|
| tablet | **768 px** | dominante (82 usos) |
| laptop | **1024 px** | secundario (7 usos) |
| desktop | 1280 px | marginal |

En la práctica el sitio se diseña a **dos anchos: mobile y ≥768**, con ajustes puntuales en 1024.
Diseñá Academia para esos dos anchos como mínimo, y decidí explícitamente el tercero.

### 4.6 Capas (z-index)

Escala nombrada por rol: base 1 · dropdown 100 · overlay 999 · navbar 1000 · sidebar 1001 ·
modal 1002 · tooltip 1003. Cualquier superposición nueva debe entrar en esta escala.

### 4.7 Alturas del chrome

**Topbar 36 px** + **navbar 72 px** = 108 px de encabezado fijo. Es una constante del layout:
todo lo que se ancle arriba (banners, breadcrumbs sticky, progreso de curso) parte de ahí.

---

## 5. Catálogo de componentes — anatomía y medidas

### 5.1 Botones

Dos variantes canónicas, misma caja.

**Caja base:** alto **48 px**, ancho mínimo **223 px**, radio **12 px**, padding lateral 10 px,
gap icono-texto 8 px, texto 16 px en Sofia Sans, contenido centrado. El icono puede ir a
izquierda o derecha y en hover se desplaza 2 px hacia arriba.

| Variante | Reposo | Hover | Activo |
|---|---|---|---|
| **Primario** (sólido) | relleno `#004f9f`, texto blanco, borde del mismo color | relleno `#006fe0` | vuelve a `#004f9f` |
| **Secundario** (borde gradiente) | relleno blanco, texto `#1f2937`, borde 1px con gradiente celeste→azul | relleno teñido 10 % azul, texto `#006fe0`, icono sube 2 px | borde sólido `#004f9f`, texto `#006fe0` |

Variante grande observada (CTA de la calculadora): alto mínimo **56 px**, ancho 100 %, texto
**22 px**, con *inner highlight* superior y glow celeste en hover.

**Falta por diseñar en Academia:** estado **deshabilitado**, estado **cargando**, variante
**terciaria/ghost** (solo texto) y **tamaños** (S/M/L) explícitos. Hoy no existen como estándar.

### 5.2 Cards

Patrón unificado y muy reconocible:

- Ancho 100 %, alto mínimo **382 px**, radio **16 px**.
- Borde **1 px `#e5e7eb`**, fondo **`#f9fafb`**, contenido recortado al radio.
- Estructura: **media arriba** (imagen 200 px de alto, o video en 16:9) + **bloque de texto** con
  padding 24 px y gap interno 8 px.
- Título en peso 700, color **índigo `#2f346c`**, interlineado 1.2, **recortado a 2 líneas**.
- Metadatos en 14 px, `#6b7280`, separados por un punto medio.
- Enlace de cierre al pie, 16 px, `#1f2937`.

**Hover de card (importante, es la interacción firma):** el borde pasa a `#006fe0`, el fondo se
tiñe con un wash de celeste al **10 %**, y el título + el enlace cambian a `#006fe0`. Sin
elevación, sin escala, sin sombra.

Para Academia: este patrón sirve tal cual para *card de curso* o *card de lección*. Lo que hay
que sumar por diseño es lo que no existe hoy: **badge de estado** (nuevo / en curso / completado),
**barra de progreso**, **duración**, **nivel** y estado **bloqueado**.

### 5.3 Chips / píldoras

Dos tipos:

- **Chip de texto (outline):** borde 1 px, radio full, peso 800, 12 px en mobile → 16 px desde
  768, padding 10×8 → 10×15. El color de borde y texto es paramétrico.
- **Chip relleno con icono:** radio full (~41 px), padding 13×20, icono de 15–20 px + texto
  (10 px en mobile → 16 px en desktop), gap 5 px. El fondo es paramétrico.

Para Academia conviene convertir esto en un set **con variantes semánticas fijas** (categoría,
nivel, estado) en lugar de color libre por instancia.

### 5.4 Modales

El sitio tiene **dos patrones distintos**, lo cual es deuda. Para Academia definí **uno solo**,
tomando lo mejor de cada uno:

- **Overlay:** negro al **60 %**, a pantalla completa, con fade de entrada de 200 ms.
- **Panel:** fondo blanco, radio **12 px**, ancho máximo **540 px** para diálogos simples y
  **850 px** para formularios (100 % del ancho por debajo de 1024 px), alto máximo **90 vh** con
  scroll interno, padding **32 px** (con 48 px arriba si el cierre flota), sombra
  `0 12px 48px rgba(0,0,0,.25)`, entrada con slide de 250 ms.
- **Cierre:** botón arriba a la derecha, a 20 px de cada borde.
- **Comportamiento:** el fondo no scrollea mientras el modal está abierto.

**A diseñar explícitamente (hoy falta):** foco visible al abrir, foco atrapado dentro del panel,
cierre con `Esc`, y jerarquía de acciones en el pie (primaria a la derecha).

**Patrón de éxito heredado, muy útil:** el modal **no se cierra al enviar** un formulario —
reemplaza su contenido por un estado de confirmación (ícono de check, titular, texto, botón de
cierre) y se cierra solo a los 4 segundos. Vale replicarlo para inscripción a un curso o entrega
de una evaluación.

### 5.5 Barra de navegación

- **Topbar (36 px):** fondo azul `#004f9f`, contenido centrado, links blancos de 14–15 px en peso
  medio con hover a 80 % de opacidad, gap de 32 px. **Se oculta al scrollear hacia abajo**
  (se desplaza hacia arriba en 250 ms) y reaparece al subir.
- **Navbar (72 px):** fondo blanco, fija debajo de la topbar, borde inferior 1 px `#f1f3f5`,
  padding 16×24. Logo a la izquierda, links al centro-derecha con gap 16, botones de acción a la
  derecha con gap 16.
- **Links:** `#4b5563` en reposo, `#006fe0` en hover. El **link activo** además recibe fondo
  teñido de azul al 10 % y radio 4 px con padding 8×13.
- Menú desktop con dropdowns; navegación mobile en componente aparte (patrón de panel).

### 5.6 Formularios

Lo importante para Academia: **el sitio actual casi no tiene formularios propios**. La captación
de leads se hace con formularios embebidos de un proveedor externo (GoHighLevel), así que **no
hay un estándar visual maduro de input, label, error ni validación** que heredar.

Lo único definido a nivel global es el **foco**: contorno de 2 px `#004f9f` con 1 px de
separación y borde del campo en `#006fe0`.

→ **Esto es un espacio en blanco, no una restricción.** Diseñá desde cero, para Academia, el set
completo: label, placeholder, texto de ayuda, campo en reposo / foco / error / deshabilitado /
solo lectura, mensaje de error, checkbox, radio, select, textarea, upload. Es probablemente el
mayor aporte que Academia puede devolverle al sistema de diseño de SIGMMA.

### 5.7 Otros patrones presentes en el repo

Por si Academia los necesita, ya existen resueltos: paginación (variante desktop y mobile
separadas), acordeón / dropdown de FAQ, carrusel con flechas laterales, barra de filtros con chips
removibles, breadcrumbs, banner de consentimiento de cookies con modal de preferencias, tabla
comparativa, slider numérico de entrada, indicador de pasos (progreso), botones de compartir,
widget de autor y lector de texto en voz alta.

### 5.8 Estados globales (accesibilidad)

- **Foco visible:** contorno **3 px** `#004f9f` con 3 px de separación (y un halo azul al 10 %
  en links y botones). Es explícito y generoso: **mantenelo**.
- Existe una clase para texto solo-lectores-de-pantalla.
- Los headings deben seguir orden jerárquico correcto (fue un fix histórico del sitio).

### 5.9 Fondos y tratamientos de sección

Recursos de composición usados en heroes y secciones destacadas:

- **Video de fondo** a pantalla completa, con dos capas encima: un tinte azul `#004f9f` al 85 %
  en modo multiplicar, y un gradiente vertical que va de transparente a `#006fe0` abajo.
- **Textura de puntos** (patrón `hero-dots`) superpuesta al fondo.
- **Fade a blanco** arriba y abajo de la sección, para que el hero se funda con la página
  (gradiente vertical blanco → transparente al 50 % → blanco al 90 %).
- Altura de hero: **65 vh** en la home, **556 px** fijos en landings.

Es un lenguaje de "profundidad por capas translúcidas azules", no de bloques de color plano.

---

## 6. Qué **no** replicar

Deuda identificada en el sistema actual. Al diseñar Academia, resolvela desde el origen:

1. **Nombres de color numéricos.** `color-2-normal` no dice "primario". Nombrá por rol
   (primario, acento, superficie, texto) y dejá los hex como capa de abajo.
2. **Sin tokens de estado.** Faltan error / advertencia / éxito / info. Definilos.
3. **Escala tipográfica fija y no fluida.** Definí mínimo y máximo por nivel.
4. **Pesos inexistentes.** No diseñes con 500/600 salvo que se agreguen los archivos de fuente.
5. **Dos patrones de modal en paralelo.** Uno solo.
6. **Botones fragmentados.** El sitio tiene un botón "genérico" y además cinco botones a medida
   que reimplementan el mismo borde de gradiente. Definí **un** botón con variantes y tamaños,
   y no aceptes excepciones.
7. **Color pasado como valor libre por instancia** (chips, cards de ícono). Usá variantes cerradas.
8. **Breakpoints improvisados.** Además de 768 y 1024 aparecen 400, 480, 992, 1200, 1025 y
   767.98. Elegí 3 y cerralo.
9. **Sin modo oscuro.** El sistema es solo claro. Si Academia lo quiere, es diseño nuevo, no
   herencia — y conviene decidirlo antes de definir la paleta.
10. **`prefers-reduced-motion` casi ausente.** Especificá la versión reducida de cada animación.

---

## 7. Brief comprimido (para pegar como contexto en Claude design)

```
Proyecto: Academia SIGMMA (plataforma de formación del ERP SIGMMA.net).
Debe heredar el lenguaje visual de sigmma.net: corporativo B2B, luminoso, solo modo claro.

PALETA
- Primario: #004f9f  | primario claro (hover/link/foco): #006fe0 | primario oscuro: #003f7f
- Índigo (titulares y fondos profundos): #212556 / #2f346c / #454c9a
- Acento celeste: #00a6e2 / claro #3dc4f4  (usar en gradientes y washes, casi nunca plano)
- CTA naranja, uso escaso y deliberado: #ff6b35
- Éxito/confirmación: #2dbe83
- Wash azul de fondo: #e5f1fd
- Grises: #f9fafb #f1f3f5 #e5e7eb #d1d5db #9ca3af #6b7280 #4b5563 #1f2937 #111827
- Texto por defecto #111827; texto secundario #6b7280; borde por defecto #e5e7eb;
  superficie de card #f9fafb; fondo de página #ffffff.
- Gesto de marca: borde de 1px con gradiente 180deg #3dc4f4 20% → #006fe0 50% sobre relleno
  blanco. Hover: relleno teñido 10% de azul + texto #006fe0.
- FALTAN y hay que crear: escala de error / advertencia / info.

TIPOGRAFÍA
- Sofia Sans (condensada, técnica) para todo; Roboto como secundaria. Solo pesos 400 y 700.
- Escala desktop en px: 72 / 57 / 45 / 36 / 28 / 22 (H1–H6); cuerpo 18 / 16 / 14; base 16.
- Interlineado: 1.2 titulares, 1.5 cuerpo, 1.75 texto extenso.
- Definir tamaños mobile explícitos (la escala de arriba es solo desktop).

ESPACIO Y FORMA
- Escala de espaciado: 4 8 16 24 32 48 64 96. Sin valores fuera de la escala.
- Radios: 4 / 8 / 12 (botones, modales, paneles) / 16 (cards) / píldora.
- Contenedor 1280px máx, padding lateral 16 → 32 (≥768) → 48 (≥1024).
- Breakpoints: mobile, 768, 1024.
- Encabezado fijo: topbar 36px + navbar 72px = 108px.
- Jerarquía por borde 1px + fondo gris claro, NO por sombra. Sombras solo en modales y glows.
- Movimiento: 150 / 250 / 350 ms, ease-in-out; hovers a 300ms animando color, borde y transform.

COMPONENTES A RESPETAR
- Botón: alto 48px, radio 12px, min-ancho 223px, texto 16px, gap 8px. Variante sólida azul y
  variante de borde-gradiente. Necesita además: deshabilitado, cargando, ghost, tamaños S/M/L.
- Card: radio 16px, borde 1px #e5e7eb, fondo #f9fafb, media arriba (imagen 200px o video 16:9),
  texto con padding 24px, título peso 700 color #2f346c recortado a 2 líneas, meta 14px #6b7280.
  Hover: borde #006fe0 + wash celeste 10% + título y link en #006fe0. Sin elevación.
- Chip: radio píldora; outline (peso 800, 12→16px) o relleno con icono (padding 13x20).
- Modal: overlay negro 60%, panel blanco radio 12px, 540px (diálogo) / 850px (formulario),
  máx 90vh con scroll interno, padding 32px, cierre arriba a la derecha a 20px, entrada 250ms.
  Incluir foco atrapado, cierre con Esc y estado de confirmación in-place.
- Foco visible: contorno 3px #004f9f con 3px de offset. No eliminarlo nunca.

A DISEÑAR DESDE CERO (no existe en el sitio actual)
- Set completo de formularios: label, ayuda, input en reposo/foco/error/deshabilitado,
  checkbox, radio, select, textarea, upload, mensajes de validación.
- Componentes propios de formación: card de curso con progreso y badge de estado, lección
  bloqueada/en curso/completada, barra de progreso, indicador de racha o logro, reproductor de
  lección, cuestionario, certificado.
- Estados vacíos, de carga y de error de página.
```

---

## 8. Referencias en el repo

| Qué | Dónde |
|---|---|
| Todos los tokens | `src/styles/variables.css` |
| Base tipográfica, foco, utilidades, animaciones | `src/styles/globals.css` |
| Botón canónico | `src/components/ui/Button/ButtonGeneric.*` |
| Card canónica | `src/components/CardBlog/CardBlog.module.css` |
| Modal con librería / modal artesanal | `src/components/ModalFormPricing/` · `src/components/CookieConsent/CookiePreferencesModal.*` |
| Chips | `src/components/ChipText/` · `src/components/ChipSecondary/` |
| Chrome | `src/components/layout/TopBar/` · `src/components/layout/Navbar/` |
| Tratamiento de hero por capas | `src/features/home/styles/Hero.module.css` · `src/features/calculadora-fuga-operativa/styles/HeroCalculadora.module.css` |
