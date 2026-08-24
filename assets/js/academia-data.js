/* ============================================================================
   Academia SIGMMA · Backoffice — dataset del prototipo
   ----------------------------------------------------------------------------
   Este archivo es DATO, no lógica. Todo lo que se calcula —contadores del
   kanban, tiles del tablero, embudos del Home, `publicados / total`, las
   cadenas del banco— se deriva en `academia-sim.js`. Si un número aparece
   escrito acá y también se puede calcular, está de más.

   QUÉ ES REAL Y QUÉ ES DE MUESTRA
   ---------------------------------
   Real, del mapa de contenido (`Estrategia_Grabado_..._pareto_v2`) y del
   Maestro de Producción (`Majo_1_Maestro_de_Produccion`):
     · las 3 superficies, los 13 módulos, las 31 secciones
     · los 55 videos con su ID permanente `BAK-Mxx.yyy`
     · los 20 cohortes con su escenario compartido y su prioridad Pareto
     · los 3 planes comerciales, tomados de `web.sigmma.net/planes.html`

   De muestra: las duraciones de los videos (dentro del rango 2–5 min que
   declara el mapa), los links de YouTube, las agencias, las personas y los
   enunciados de las preguntas. No hay datos reales de agencias ni de personas.

   Fechas en DD/MM/YYYY, horario 24 h, zona ART (UTC-3). El año del proyecto es
   2026: las fechas de la tabla del tablero se muestran DD/MM por ancho de
   columna, pero el dato es del 2026.

   TRES DECISIONES DE DATO QUE SE TOMARON ACÁ
   -------------------------------------------
   1 · Los títulos son los del BACKOFFICE. 41 de los 55 coinciden con los del
       repo `academia-AGENCIA`; 14 difieren (M10.050, M20.030, M20.040, las 7 de
       M30, M40.010, M50.020, M70.010, M80.020). Donde difieren manda este repo,
       que es el que los tiene maquetados. En `BAK-M80.020` la divergencia no es
       de largo sino de tema —«Informe de ventas» vs. «Informe de vencimientos:
       cobranzas y pagos»—: queda anotada para reconciliar entre los dos repos.

   2 · Las secciones de `BAK-M30` son las del BACKOFFICE (`modulo.html`), no las
       del repo agencia: son las que sostienen las 5 cadenas verificadas. Las
       otras 27 secciones salen del mapa de contenido, que es la única fuente
       que las tiene nombradas. Tres rompen el orden del ID a propósito
       (M40.S3, M70.S1, M80.S2): el agrupamiento pedagógico manda sobre la
       secuencia, y el ID nunca se mueve.

   3 · La asignación de planes por módulo se RE-DERIVÓ. La vieja —«plan A» a 6
       módulos, «plan B» a 4, ambos a 3— era un placeholder arbitrario por
       admisión del propio proyecto (D-3). Al cerrar D-3 con los planes reales,
       renombrar esa asignación habría disfrazado un dato inventado de dato
       real. La nueva sale del Maestro: el núcleo es «P+B», C19 Contable está
       marcado «(Business)» y C20 Receptivo «(nicho)».
       La matriz Perfil × Módulo completa sigue siendo una decisión abierta del
       proyecto (`MD-PROYECTO-CLAUDE.md` §2 la deja fuera del MVP inicial).
   ========================================================================== */

window.ACADEMIA_DATA = (function () {
  "use strict";

  /* -- Escenas ---------------------------------------------------------------
     La línea de tiempo de la construcción de la Academia. No son seis variantes
     sueltas: es una secuencia, y de ahí sale la regla de monotonía temporal.
     E5 es el default: sin `?escena=` se muestra el régimen. */
  const ESCENAS = [
    { id: "E1", orden: 1, titulo: "Día 0", detalle: "sistema vacío" },
    { id: "E2", orden: 2, titulo: "Semana 1", detalle: "mapa cargado" },
    { id: "E3", orden: 3, titulo: "Mes 1", detalle: "P1 en producción" },
    { id: "E4", orden: 4, titulo: "Mes 2", detalle: "hito de lanzamiento" },
    { id: "E5", orden: 5, titulo: "Régimen", detalle: "la Academia en marcha" },
    { id: "E6", orden: 6, titulo: "En operación", detalle: "la Academia completa, con uso" },
  ];
  const ESCENA_DEFAULT = "E5";

  /* -- Los 7 estados de producción, en orden -------------------------------
     El orden ES la máquina de estados: un video solo puede avanzar. `a regrabar`
     y `obsoleto` son posteriores a `publicado`, no anteriores. El nombre va
     textual —incluido "a regrabar" con espacio— porque este vocabulario se
     copia a desarrollo. */
  const ESTADOS = [
    "backlog",
    "guionado",
    "grabado",
    "editado",
    "publicado",
    "a regrabar",
    "obsoleto",
  ];

  /* -- Planes comerciales ---------------------------------------------------
     Los tres del producto, verbatim de `web.sigmma.net/planes.html`. Cierra la
     decisión D-3, que tenía cuatro nomenclaturas en conflicto: «plan A / plan B»
     (placeholder de este prototipo), «P+B / B / B-nicho» (Maestro de
     Producción), «Professional / Business» (repo agencia) y «Corporate /
     Business / Standard» (MD-PROYECTO-CLAUDE.md, que escribe «Standard» donde
     va «Professional» — error del documento fuente, anotado como B-4).

     El plan es de la AGENCIA, no de la persona: de la agencia sale el plan y del
     plan el recorrido. */
  const PRO = "Professional";
  const BUS = "Business";
  const COR = "Corporate";
  const TODOS = [PRO, BUS, COR];

  const planes = [
    {
      id: "professional",
      nombre: PRO,
      orden: 1,
      resumen: "Orden operativo inicial. Dejar las planillas y tomar control de la operación.",
    },
    {
      id: "business",
      nombre: BUS,
      orden: 2,
      resumen: "Agencias en crecimiento que perdieron trazabilidad. Recuperar el control y la rentabilidad por venta.",
    },
    {
      id: "corporate",
      nombre: COR,
      orden: 3,
      resumen: "Control total a escala. Centralizar la gestión y garantizar la integridad del dato.",
    },
  ];

  /* -- Superficies ---------------------------------------------------------
     Precargadas como semilla (decisión A-2): el selector global del sidebar
     cuelga de ellas y sin al menos una el backoffice no tiene contexto. Solo
     BAK está mapeada; FRT y CRM son la gobernanza pendiente. */
  const superficies = [
    { codigo: "BAK", nombre: "Backoffice", mapeada: true, gobernanza: "Soporte y Capacitación" },
    { codigo: "FRT", nombre: "Front", mapeada: false, gobernanza: null },
    { codigo: "CRM", nombre: "CRM · Deal Closer", mapeada: false, gobernanza: null },
  ];

  /* -- Configuración de evaluación -----------------------------------------
     `MD-PROYECTO-CLAUDE.md` §3.4, §4 y §7: banco de 50 preguntas por módulo,
     sorteo de 10, umbral 8/10 (80,00 %), reintentos ilimitados. El `subtema` de
     cada pregunta es obligatorio y es el título de una sección de su módulo:
     es lo que permite exigir cobertura por sección y que el sorteo aleatorio no
     deje afuera un concepto central. */
  const evaluacion = {
    bancoMinimoPorModulo: 50,
    preguntasPorIntento: 10,
    umbral: 8,
    reintentos: null, // ilimitados
    /* La Ruta Esencial no tiene banco propio: lo hereda de los videos que
       referencia, a razón de 5 por video (R8, y la tabla de E4: 5 × 12 = 60). */
    preguntasHeredadasPorVideo: 5,
  };

  /* -- Reparto de mínimos por sección --------------------------------------
     El mínimo del módulo (50) y el mínimo por sorteo (10) se reparten entre las
     secciones y la suma tiene que cerrar EXACTA: son las cadenas 4 y 5.

     El reparto NO es proporcional a la cantidad de videos. Los valores
     verificados de `BAK-M30` —11 · 15 · 13 · 11 para secciones de 1 · 2 · 2 · 2
     videos— son mucho más planos que proporcionales: una sección con un solo
     video igual necesita cubrirse. Proporcional puro daría 7 · 14 · 14 · 14, y
     en `BAK-M00` (secciones de 3 y 1 videos) daría 37 · 13, que deja una
     sección con un mínimo absurdo.

     La regla: 60 % del total se reparte PAREJO entre las secciones y el 40 %
     restante a prorrata de los videos, con resto mayor para que cierre exacto.
     Cada sección recibe al menos 1 en el sorteo: pedir 0 de una sección la deja
     fuera de toda evaluación, que es justo lo que el `subtema` obligatorio
     viene a evitar.

     `BAK-M30` no pasa por acá: usa los valores verificados de `MINIMOS_M30`. */
  const PROPORCION_PAREJA = 0.6;

  function restoMayor(total, pesos) {
    const suma = pesos.reduce(function (a, b) { return a + b; }, 0);
    const exactos = pesos.map(function (p) { return suma ? (total * p) / suma : 0; });
    const base = exactos.map(function (x) { return Math.floor(x); });
    let resto = total - base.reduce(function (a, b) { return a + b; }, 0);
    const orden = exactos
      .map(function (x, i) { return { i: i, frac: x - Math.floor(x) }; })
      .sort(function (a, b) { return b.frac - a.frac || a.i - b.i; });
    for (let k = 0; resto > 0; k++, resto--) base[orden[k % orden.length].i]++;
    return base;
  }

  function reparto(total, pesos, pisoMinimo) {
    const n = pesos.length;
    if (!n) return [];
    /* El piso parejo, sin bajar del mínimo pedido ni pasarse del total. */
    let piso = Math.floor((total * PROPORCION_PAREJA) / n);
    piso = Math.max(pisoMinimo || 0, piso);
    piso = Math.min(piso, Math.floor(total / n));
    const porVideos = restoMayor(total - piso * n, pesos);
    return porVideos.map(function (x) { return x + piso; });
  }

  /* Los mínimos de una sección, ya resueltos. Es la única puerta: nadie más
     reparte estos números. */
  function minimosDeSeccion(modulo) {
    if (modulo.numero === 30) {
      return modulo.secciones.map(function (s) { return MINIMOS_M30[s.titulo]; });
    }
    const pesos = modulo.secciones.map(function (s) { return s.videos.length; });
    const banco = reparto(evaluacion.bancoMinimoPorModulo, pesos, 1);
    const sorteo = reparto(evaluacion.preguntasPorIntento, pesos, 1);
    return pesos.map(function (_, i) { return { banco: banco[i], sorteo: sorteo[i] }; });
  }

  /* Los mínimos verificados de BAK-M30. El de sorteo (2+3+3+2 = 10) es del
     wireframe y no se toca. El de banco se re-escaló de 35 a 50 —el mínimo que
     manda el MVP— conservando las proporciones y el empate entre la sección 1 y
     la 4, que en el original eran las dos de 8:
        8 → 11 · 10 → 15 · 9 → 13 · 8 → 11   (suma 50) */
  const MINIMOS_M30 = {
    "Concepto": { banco: 11, sorteo: 2 },
    "Carga y proceso": { banco: 15, sorteo: 3 },
    "Plata: margen e impuestos": { banco: 13, sorteo: 3 },
    "Estados y plantillas": { banco: 11, sorteo: 2 },
  };

  /* -- Videos --------------------------------------------------------------
     `hitos` declara la PRIMERA escena en la que el video alcanza cada estado.
     El estado en una escena es el más avanzado cuyo hito ya ocurrió. Modelarlo
     así hace que la monotonía temporal sea imposible de violar: no existe forma
     de escribir un retroceso.

     Los videos nacen en `backlog`, sin link y sin versión (R11): sin ningún
     hito, un video está en backlog en las seis escenas.

     E6 · en operación: todo lo que en E5 no había llegado a `publicado` se
     publica. Los 3 `a regrabar` y el `obsoleto` se quedan donde están —la
     monotonía no admite volver a `publicado`— y eso es lo honesto: una academia
     en marcha siempre arrastra alguna deuda de regrabación.

     `duracion` es de muestra, dentro del rango 2–5 min que declara el mapa. La
     interfaz solo la muestra en los videos que llegaron a grabarse: antes de
     eso, la duración objetivo se expresa como rango y se deriva de ella. */
  function v(secuencia, titulo, seccion, cohorte, duracion, hitos, extra) {
    const o = extra || {};
    return {
      secuencia: secuencia,
      titulo: titulo,
      seccion: seccion,
      cohorte: cohorte,
      duracion: duracion,
      hitos: hitos || {},
      version: o.version || null,
      fecha: o.fecha || null,
      afectadoPor: o.afectadoPor || null,
      /* Tag de plan propio, distinto del de su módulo. Solo `BAK-M80.030` lo
         usa: sin este campo el módulo entero tendría que ser Business. */
      planes: o.planes || null,
      /* Historial de versiones, solo donde hay más de una. El ID NO cambia
         entre versiones: lo que cambia es el link, la versión de producto que
         documenta y el motivo del regrabado. Cuando no está declarado, el motor
         sintetiza una sola versión a partir de `version` y `fecha`. */
      versiones: o.versiones || null,
    };
  }

  /* -- Los 13 módulos ------------------------------------------------------
     `numero` es el del mapa (0, 10, 20 … 95) y es lo que viaja en `?m=`; la
     Ruta Esencial usa `R01`. `codigo` es el ID permanente.

     `activadoEn` es la escena en que el módulo pasó a `activo`. Antes de eso
     está en `borrador`. La aptitud para activar es una compuerta AL MOMENTO de
     activar, no una condición permanente (D-4): por eso `BAK-M10` sigue activo
     con 5 de 6 videos publicados, porque `BAK-M10.050` quedó obsoleto DESPUÉS
     de la activación. */
  /* `mapaCargadoEn` es el hito de RESERVA: en qué escena entraron los IDs de
     este módulo. Es distinto de los hitos de un video, que hablan de su
     producción. Sin este campo, el panel de carga contaba 55 videos en E1 —la
     escena que el propio README describe como «nada cargado»—, porque la escena
     cambia el ESTADO de un video, no su existencia.

     Un módulo creado a mano no lo declara, y ahí se cuentan sus videos reales:
     es el único caso en que «faltan videos» se alcanza en el recorrido normal. */
  const modulos = [
    {
      numero: "R01",
      codigo: "BAK-R01",
      titulo: "Ruta Esencial P1",
      tipo: "ruta",
      orden: "R",
      planes: TODOS,
      activadoEn: "E5",
      /* R8: referencia videos, no los copia. Las secciones de la Ruta son los
         tres cohortes de P1, y su banco es DERIVADO de los videos que
         referencia. Los videos no se listan acá: se resuelven por cohorte. */
      referencia: { cohortes: ["C01", "C02", "C03"] },
      secciones: [],
    },
    {
      numero: 0,
      codigo: "BAK-M00",
      titulo: "Fundamentos",
      tipo: "biblioteca",
      videosEsperados: 4,
      mapaCargadoEn: "E2",
      orden: 1,
      planes: TODOS,
      activadoEn: "E5",
      secciones: [
        {
          orden: 1,
          titulo: "La lógica del sistema",
          videos: [
            v(10, "Qué es SIGMMA: el sistema operativo de la agencia", "La lógica del sistema", "C01", "4:10", { publicado: "E3" }, { version: "v1" }),
            v(20, "El ciclo 360° de la operación turística: cliente, prestador y utilidad", "La lógica del sistema", "C04", "4:45", { publicado: "E5" }, { version: "v1" }),
            v(30, "Los 7 principios y los procesos atomizados", "La lógica del sistema", "C04", "3:55", { publicado: "E5" }, { version: "v1" }),
          ],
        },
        {
          orden: 2,
          titulo: "Moverse por SIGMMA",
          videos: [
            v(40, "Navegación: ingreso, menú, botones, último file y rueda de progreso", "Moverse por SIGMMA", "C01", "3:30", { publicado: "E3" }, { version: "v1" }),
          ],
        },
      ],
    },
    {
      numero: 10,
      codigo: "BAK-M10",
      titulo: "File",
      tipo: "biblioteca",
      videosEsperados: 6,
      mapaCargadoEn: "E2",
      orden: 2,
      planes: TODOS,
      activadoEn: "E5",
      secciones: [
        {
          orden: 1,
          titulo: "Encontrar y crear un file",
          videos: [
            v(10, "Buscar file: número, filtros y por nombre", "Encontrar y crear un file", "C02", "2:50", { editado: "E3", publicado: "E4" }, { version: "v1" }),
            v(20, "Crear y editar un file: tipo de servicio, individual vs. grupal", "Encontrar y crear un file", "C02", "4:20", { editado: "E3", publicado: "E4" }, { version: "v1" }),
          ],
        },
        {
          orden: 2,
          titulo: "Configurar el file",
          videos: [
            v(30, "Moneda de registro vs. moneda de documento", "Configurar el file", "C02", "4:05", { editado: "E3", publicado: "E4" }, { version: "v1" }),
            v(40, "Datos del file: nombre, destino IATA, fechas y segmentación", "Configurar el file", "C05", "3:35", { publicado: "E5" }, { version: "v1" }),
            /* Obsoleto DESPUÉS de la activación del módulo: es el caso que
               sostiene la decisión D-4. Se publicó y se dio de baja entre E4
               y E5, así que los dos hitos caen en E5 y gana el más avanzado. */
            v(50, "Estados del file", "Configurar el file", "C05", "3:15", { publicado: "E5", obsoleto: "E5" }, { version: "v1", fecha: "14/03", afectadoPor: "sgm2026.01" }),
          ],
        },
        {
          orden: 3,
          titulo: "Files grupales",
          videos: [
            v(60, "Salida grupal: vincular files e informe de salida", "Files grupales", "C13", "4:40", { publicado: "E5" }, { version: "v1" }),
          ],
        },
      ],
    },
    {
      numero: 20,
      codigo: "BAK-M20",
      titulo: "Entidades (clientes, pasajeros, proveedores)",
      tipo: "biblioteca",
      videosEsperados: 6,
      mapaCargadoEn: "E2",
      orden: 3,
      planes: TODOS,
      activadoEn: null,
      secciones: [
        {
          orden: 1,
          titulo: "Clientes",
          videos: [
            v(10, "Cargar un cliente: físico vs. jurídico y autocompletado por ARCA/CUIT", "Clientes", "C02", "4:15", { editado: "E3", publicado: "E4" }, { version: "v1" }),
            v(20, "Cliente: solapas de documentación, tarjetas, clasificación y adjuntos", "Clientes", "C06", "3:50", { publicado: "E5" }, { version: "v1" }),
          ],
        },
        {
          orden: 2,
          titulo: "Cliente vs. pasajero",
          videos: [
            v(30, "Pasajeros", "Cliente vs. pasajero", "C02", "3:05", { editado: "E3", publicado: "E4" }, { version: "v1", fecha: "28/07" }),
            v(40, "Cargar pasajero", "Cliente vs. pasajero", "C02", "3:40", { editado: "E3", publicado: "E4" }, { version: "v1", fecha: "30/07" }),
          ],
        },
        {
          orden: 3,
          titulo: "Proveedores y carga masiva",
          videos: [
            v(50, "Proveedor turístico y no turístico", "Proveedores y carga masiva", "C06", "2:55", { publicado: "E5" }, { version: "v1" }),
            v(60, "Importar la base de clientes y proveedores desde Excel", "Proveedores y carga masiva", "C06", "4:30", { publicado: "E5" }, { version: "v1" }),
          ],
        },
      ],
    },
    {
      numero: 30,
      codigo: "BAK-M30",
      titulo: "Voucher / Servicios",
      tipo: "biblioteca",
      videosEsperados: 7,
      mapaCargadoEn: "E2",
      orden: 4,
      planes: TODOS,
      activadoEn: null,
      /* Las 4 secciones son las del backoffice (`modulo.html`), no las del repo
         agencia: son las que sostienen las 5 cadenas verificadas. */
      secciones: [
        {
          orden: 1,
          titulo: "Concepto",
          videos: [
            v(10, "Qué es el voucher", "Concepto", "C03", "3:45", { guionado: "E3", publicado: "E4" }, { version: "v1" }),
          ],
        },
        {
          orden: 2,
          titulo: "Carga y proceso",
          videos: [
            v(20, "Cargar voucher", "Carga y proceso", "C03", "4:25", { guionado: "E3", publicado: "E4" }, { version: "v1" }),
            /* Regrabado por sgm2026.03: subió a v2 y SIGUE publicado. Cambiar de
               versión no es cambiar de estado. */
            v(50, "Procesar el voucher", "Carga y proceso", "C03", "3:30", { guionado: "E3", publicado: "E4" }, {
              version: "v2", fecha: "12/06", afectadoPor: "sgm2026.03",
              versiones: [
                { v: "v2", link: "youtu.be/xxxxxxxxxxx", versionProducto: "sgm2026.02", fecha: "12/06/2026",
                  motivo: "Cambió la pantalla de proceso del voucher", vigente: true },
                { v: "v1", link: "youtu.be/yyyyyyyyyyy", versionProducto: "sgm2026.01", fecha: "02/02/2026",
                  motivo: null, vigente: false },
              ],
            }),
          ],
        },
        {
          orden: 3,
          titulo: "Plata: margen e impuestos",
          videos: [
            v(30, "Margen comisión vs utilidad", "Plata: margen e impuestos", "C07", "4:00", { editado: "E5", publicado: "E6" }, { version: "v1", fecha: "28/07" }),
            v(40, "Conceptos impositivos e IVA", "Plata: margen e impuestos", "C07", "4:50", { publicado: "E5" }, { version: "v1" }),
          ],
        },
        {
          orden: 4,
          titulo: "Estados y plantillas",
          videos: [
            /* El caso que sostiene la regla: al pasar a `a regrabar`, sus 7
               preguntas vigentes pasan a `a revisar`, la sección 4 queda en 0
               vigentes y el sorteo saca 8 de 10 en vez de 10. */
            v(60, "Estados del voucher", "Estados y plantillas", "C12", "3:10", { publicado: "E5", "a regrabar": "E5" }, { version: "v1", fecha: "02/02", afectadoPor: "sgm2026.03" }),
            v(70, "Modelos de venta", "Estados y plantillas", "C12", "3:20", { publicado: "E6" }),
          ],
        },
      ],
    },
    {
      numero: 35,
      codigo: "BAK-M35",
      titulo: "reservado (Tráfico)",
      tipo: "reservado",
      orden: null,
      planes: null,
      activadoEn: null,
      /* ID reservado: el módulo existe en el mapa para que el pipeline pueda
         mirar hacia adelante, pero el producto todavía no está desarrollado.
         Sin secciones y sin videos. */
      secciones: [],
    },
    {
      numero: 40,
      codigo: "BAK-M40",
      titulo: "Cobranzas / Recibos",
      tipo: "biblioteca",
      videosEsperados: 5,
      mapaCargadoEn: "E2",
      orden: 5,
      planes: TODOS,
      activadoEn: "E5",
      secciones: [
        {
          orden: 1,
          titulo: "Emitir el recibo",
          videos: [
            v(10, "Recibos de cobranza", "Emitir el recibo", "C03", "4:05", { guionado: "E3", publicado: "E4" }, { version: "v1", fecha: "21/07" }),
            v(20, "Valores: efectivo, transferencia, tarjeta y de tercero (TR3/TC3)", "Emitir el recibo", "C08", "4:35", { publicado: "E5" }, { version: "v1" }),
          ],
        },
        {
          orden: 2,
          titulo: "Moneda en la cobranza",
          videos: [
            v(30, "Moneda y tipo de cambio en el recibo", "Moneda en la cobranza", "C08", "3:50", { publicado: "E5" }, { version: "v1" }),
          ],
        },
        {
          /* Rompe el orden del ID a propósito: 050 antes que 040. El
             agrupamiento pedagógico manda sobre la secuencia, y el ID no se
             mueve. */
          orden: 3,
          titulo: "Cuenta corriente y devoluciones",
          videos: [
            v(50, "Cuenta corriente del cliente y saldos por moneda", "Cuenta corriente y devoluciones", "C08", "4:10", { publicado: "E5" }, { version: "v1" }),
            v(40, "Devolución y egreso", "Cuenta corriente y devoluciones", "C14", "3:00", { publicado: "E5" }, { version: "v1" }),
          ],
        },
      ],
    },
    {
      numero: 50,
      codigo: "BAK-M50",
      titulo: "Facturación",
      tipo: "biblioteca",
      videosEsperados: 6,
      mapaCargadoEn: "E2",
      orden: 6,
      planes: TODOS,
      activadoEn: null,
      secciones: [
        {
          orden: 1,
          titulo: "Emitir la factura",
          videos: [
            v(10, "Factura al pasajero: por servicio vs. por producto", "Emitir la factura", "C09", "4:15", { guionado: "E5", publicado: "E6" }),
            v(20, "Emitir factura", "Emitir la factura", "C09", "4:40", { publicado: "E6" }),
          ],
        },
        {
          orden: 2,
          titulo: "Controlar antes de facturar",
          videos: [
            v(30, "Verificar el voucher antes de facturar: prestador vs. proveedor", "Controlar antes de facturar", "C09", "3:35", { grabado: "E5", publicado: "E6" }, { version: "v1" }),
          ],
        },
        {
          orden: 3,
          titulo: "Ajustes y casos especiales",
          videos: [
            v(40, "Notas de crédito", "Ajustes y casos especiales", "C15", "3:25", { publicado: "E6" }),
            v(50, "Factura parcial: dividir entre pasajeros", "Ajustes y casos especiales", "C15", "3:55", { publicado: "E6" }),
            v(60, "Tipo de cambio promedio ponderado", "Ajustes y casos especiales", "C15", "4:20", { publicado: "E6" }),
          ],
        },
      ],
    },
    {
      numero: 60,
      codigo: "BAK-M60",
      titulo: "Pagos a proveedores",
      tipo: "biblioteca",
      videosEsperados: 4,
      mapaCargadoEn: "E2",
      orden: 7,
      planes: TODOS,
      activadoEn: null,
      secciones: [
        {
          orden: 1,
          titulo: "Ordenar el pago",
          videos: [
            v(10, "Orden de pago: automática, dividida y manual", "Ordenar el pago", "C10", "4:10", { publicado: "E5" }, { version: "v1" }),
            v(20, "Vincular la factura de compra y el importador ARCA", "Ordenar el pago", "C16", "4:00", { publicado: "E5" }, { version: "v1" }),
          ],
        },
        {
          orden: 2,
          titulo: "Ajustes y cuenta corriente",
          videos: [
            v(30, "Saldo a favor, anular y reabrir", "Ajustes y cuenta corriente", "C16", "3:20", { publicado: "E5", "a regrabar": "E5" }, { version: "v1" }),
            v(40, "Cuenta corriente del proveedor", "Ajustes y cuenta corriente", "C10", "3:45", { publicado: "E5" }, { version: "v1" }),
          ],
        },
      ],
    },
    {
      numero: 70,
      codigo: "BAK-M70",
      titulo: "Caja y bancos",
      tipo: "biblioteca",
      videosEsperados: 4,
      mapaCargadoEn: "E2",
      orden: 8,
      planes: TODOS,
      activadoEn: null,
      secciones: [
        {
          /* Rompe el orden del ID: 010 y 030 juntos, 020 en la sección 2. */
          orden: 1,
          titulo: "Configurar y operar la caja",
          videos: [
            v(10, "Caja: única vs por vendedor", "Configurar y operar la caja", "C11", "3:30", { publicado: "E6" }),
            v(30, "Apertura y cierre de caja", "Configurar y operar la caja", "C17", "3:05", { publicado: "E5" }, { version: "v1" }),
          ],
        },
        {
          orden: 2,
          titulo: "Movimientos y asientos",
          videos: [
            v(20, "Asientos automáticos y manuales, egresos y centro de costo", "Movimientos y asientos", "C17", "4:45", { publicado: "E5", "a regrabar": "E5" }, { version: "v1" }),
          ],
        },
        {
          orden: 3,
          titulo: "Bancos y comprobantes",
          videos: [
            v(40, "Bancos, transferencias y scan de comprobantes con IA", "Bancos y comprobantes", "C17", "4:15", { publicado: "E5" }, { version: "v1" }),
          ],
        },
      ],
    },
    {
      numero: 80,
      codigo: "BAK-M80",
      titulo: "Informes",
      tipo: "biblioteca",
      videosEsperados: 4,
      mapaCargadoEn: "E2",
      orden: 9,
      planes: TODOS,
      activadoEn: null,
      secciones: [
        {
          orden: 1,
          titulo: "Informes operativos",
          videos: [
            v(10, "Informes operativos: saldos, listados y comisiones", "Informes operativos", "C11", "4:00", { guionado: "E5", publicado: "E6" }),
            /* El título difiere del que usa el repo agencia («Informe de
               vencimientos: cobranzas y pagos»). No es una diferencia de largo:
               son dos temas distintos. Queda para reconciliar. */
            v(20, "Informe de ventas", "Informes operativos", "C11", "3:40", { guionado: "E5", publicado: "E6" }, { fecha: "05/08" }),
          ],
        },
        {
          /* Rompe el orden del ID: 040 antes que 030. */
          orden: 2,
          titulo: "Administración y KPIs",
          videos: [
            v(40, "Informes administrativos: ingresos y egresos", "Administración y KPIs", "C18", "3:50", { publicado: "E6" }),
            /* El único video con tag de plan propio, distinto del de su módulo:
               el dashboard de KPIs no entra en Professional. Sin este campo, el
               módulo entero tendría que salir del plan base. */
            v(30, "Dashboard: KPIs del negocio", "Administración y KPIs", "C18", "4:25", { publicado: "E6" }, { planes: [BUS, COR] }),
          ],
        },
      ],
    },
    {
      numero: 90,
      codigo: "BAK-M90",
      titulo: "Contable",
      tipo: "biblioteca",
      videosEsperados: 5,
      mapaCargadoEn: "E2",
      orden: 10,
      /* El Maestro marca C19 como «Contable (Business)». */
      planes: [BUS, COR],
      activadoEn: null,
      secciones: [
        {
          orden: 1,
          titulo: "Configuración contable",
          videos: [
            v(10, "Plan de cuentas: para qué sirve", "Configuración contable", "C19", "4:05", { editado: "E5", publicado: "E6" }, { version: "v1" }),
            v(20, "Asientos automáticos: cómo se configuran", "Configuración contable", "C19", "4:30", { grabado: "E5", publicado: "E6" }, { version: "v1" }),
          ],
        },
        {
          orden: 2,
          titulo: "Libros y balances",
          videos: [
            v(30, "Libro diario, libro banco y mayor", "Libros y balances", "C19", "4:20", { publicado: "E6" }),
            v(40, "Balance de suma y saldo", "Libros y balances", "C19", "3:55", { publicado: "E6" }),
          ],
        },
        {
          orden: 3,
          titulo: "Cierres",
          videos: [
            v(50, "Ejercicios contables y cierres", "Cierres", "C19", "4:10", { publicado: "E6" }),
          ],
        },
      ],
    },
    {
      numero: 95,
      codigo: "BAK-M95",
      titulo: "Receptivo operador",
      tipo: "biblioteca",
      videosEsperados: 4,
      mapaCargadoEn: "E2",
      orden: 11,
      /* El Maestro marca C20 como «Receptivo operador (nicho)». */
      planes: [COR],
      activadoEn: null,
      secciones: [
        {
          orden: 1,
          titulo: "El tarifario",
          videos: [
            v(10, "Tarifario por proveedor: tipo, categoría, vigencia y temporada", "El tarifario", "C20", "4:45", { guionado: "E5", publicado: "E6" }),
          ],
        },
        {
          orden: 2,
          titulo: "Armar el producto",
          videos: [
            v(20, "Armar el itinerario con el tarifario", "Armar el producto", "C20", "4:15", { publicado: "E6" }),
            v(30, "Modelos multidestino: paquetes", "Armar el producto", "C20", "4:00", { publicado: "E6" }),
          ],
        },
        {
          orden: 3,
          titulo: "Impositivo del receptivo",
          videos: [
            v(40, "Prestador nacional vs. internacional e impacto impositivo", "Impositivo del receptivo", "C20", "3:50", { publicado: "E6" }),
          ],
        },
      ],
    },
  ];

  /* -- Los 20 cohortes -----------------------------------------------------
     Verbatim del Maestro de Producción, que es el plan de rodaje real (decisión
     D-7: donde el wireframe lo contradecía, manda el Maestro). El cohorte es la
     unidad de RODAJE, no de currícula: agrupa videos que comparten el mismo
     escenario de datos, para preparar una vez y grabar varios de corrido.

     `escenario` es el escenario compartido que declara el Maestro. C12 a C18 no
     lo tienen especificado y quedan vacíos: no se inventa. C19 y C20 tienen una
     nota de precondición en lugar de escenario.

     Los videos no se listan acá: cada video declara su cohorte y la relación se
     resuelve al derivar. */
  const cohortes = [
    { id: "C01", nombre: "Arranque", prioridad: "P1", escenario: "Sin datos. Concepto + navegación", nota: null },
    { id: "C02", nombre: "Alta de file y cliente", prioridad: "P1", escenario: "Cliente demo nuevo + file nuevo", nota: null },
    { id: "C03", nombre: "Voucher y cobro", prioridad: "P1", escenario: "El file de C02, se le agrega voucher", nota: null },
    { id: "C04", nombre: "Fundamentos conceptuales", prioridad: "P2", escenario: "Sin datos", nota: null },
    { id: "C05", nombre: "File avanzado", prioridad: "P2", escenario: "File demo", nota: null },
    { id: "C06", nombre: "Entidades avanzado", prioridad: "P2", escenario: "Cliente y proveedor demo", nota: null },
    { id: "C07", nombre: "Voucher detalle", prioridad: "P2", escenario: "Voucher demo", nota: null },
    { id: "C08", nombre: "Cobranzas", prioridad: "P2", escenario: "Recibo sobre file demo", nota: null },
    { id: "C09", nombre: "Facturación núcleo", prioridad: "P2", escenario: "File con voucher listo", nota: null },
    { id: "C10", nombre: "Pagos a proveedor", prioridad: "P2", escenario: "Proveedor con voucher procesado", nota: null },
    { id: "C11", nombre: "Caja e informes", prioridad: "P2", escenario: "Caja abierta con movimientos", nota: null },
    { id: "C12", nombre: "Voucher extra", prioridad: "P3", escenario: null, nota: null },
    { id: "C13", nombre: "File grupal", prioridad: "P3", escenario: null, nota: null },
    { id: "C14", nombre: "Cobranzas extra", prioridad: "P3", escenario: null, nota: null },
    { id: "C15", nombre: "Facturación extra", prioridad: "P3", escenario: null, nota: null },
    { id: "C16", nombre: "Pagos extra", prioridad: "P3", escenario: null, nota: null },
    { id: "C17", nombre: "Caja y bancos", prioridad: "P3", escenario: null, nota: null },
    { id: "C18", nombre: "Dashboard e informes admin", prioridad: "P3", escenario: null, nota: null },
    { id: "C19", nombre: "Contable (Business)", prioridad: "P4", escenario: null, nota: "Requiere plan de cuentas cargado en Viajando.com" },
    { id: "C20", nombre: "Receptivo operador (nicho)", prioridad: "P4", escenario: null, nota: "Requiere tarifario cargado" },
  ];

  /* -- Metadatos del listado de módulos ------------------------------------
     Lo que el listado muestra y no es contenido: quién creó el módulo, desde qué
     escena su evaluación está configurada, y la última actividad.

     `configEvaluacionEn` importa más de lo que parece. Antes de configurar la
     evaluación el módulo NO tiene mínimo de banco, y el listado lo dice
     «sin configurar» con el mínimo en guion — no «0 de 50». Son dos cosas
     distintas: un banco vacío es trabajo pendiente, un mínimo sin definir es una
     decisión pendiente. La Ruta Esencial se configura antes que la biblioteca
     porque es la compuerta del lanzamiento: en E4 hay que poder medirla.

     `actividad` son cadenas de muestra, no fechas del proyecto. En E2 todas son
     de la hora de la importación; en E5 están repartidas. Se guardan como texto
     relativo a propósito: una fecha fija se vuelve vieja sola y la demo se
     desactualiza sin que nadie la toque. */
  const listado = {
    "BAK-R01": { creadoPor: "mano", configEvaluacionEn: "E4",
      actividad: { E2: "hoy 11:20", E3: "hace 6 días", E4: "hoy 10:02", E5: "hace 3 días", E6: "ayer" } },
    "BAK-M00": { creadoPor: "importación", configEvaluacionEn: "E5",
      actividad: { E2: "hoy 09:14", E3: "hace 2 días", E4: "hace 5 días", E5: "hace 2 días", E6: "hoy 09:40" } },
    "BAK-M10": { creadoPor: "importación", configEvaluacionEn: "E5",
      actividad: { E2: "hoy 09:14", E3: "ayer", E4: "hace 3 días", E5: "hace 4 días", E6: "ayer" } },
    "BAK-M20": { creadoPor: "importación", configEvaluacionEn: "E5",
      actividad: { E2: "hoy 09:14", E3: "ayer", E4: "hace 4 días", E5: "ayer", E6: "hace 2 días" } },
    "BAK-M30": { creadoPor: "importación", configEvaluacionEn: "E5",
      actividad: { E2: "hoy 09:14", E3: "hoy 15:30", E4: "hace 2 días", E5: "hoy 11:04", E6: "hoy 11:04" } },
    "BAK-M35": { creadoPor: "mano", configEvaluacionEn: null,
      actividad: { E2: "hoy 11:18", E3: "hace 3 sem.", E4: "hace 1 mes", E5: "hace 2 meses", E6: "hace 4 meses" } },
    "BAK-M40": { creadoPor: "importación", configEvaluacionEn: "E5",
      actividad: { E2: "hoy 09:14", E3: "hoy 16:05", E4: "hace 2 días", E5: "hace 5 días", E6: "hace 3 días" } },
    "BAK-M50": { creadoPor: "importación", configEvaluacionEn: "E5",
      actividad: { E2: "hoy 09:14", E3: "hace 3 sem.", E4: "hace 1 mes", E5: "hace 2 sem.", E6: "hace 6 días" } },
    "BAK-M60": { creadoPor: "importación", configEvaluacionEn: "E5",
      actividad: { E2: "hoy 09:14", E3: "hace 3 sem.", E4: "hace 1 mes", E5: "hace 8 días", E6: "hace 9 días" } },
    "BAK-M70": { creadoPor: "importación", configEvaluacionEn: "E5",
      actividad: { E2: "hoy 09:14", E3: "hace 3 sem.", E4: "hace 1 mes", E5: "hace 12 días", E6: "hace 10 días" } },
    "BAK-M80": { creadoPor: "importación", configEvaluacionEn: "E5",
      actividad: { E2: "hoy 09:14", E3: "hace 3 sem.", E4: "hace 1 mes", E5: "hace 1 mes", E6: "hace 2 sem." } },
    "BAK-M90": { creadoPor: "importación", configEvaluacionEn: "E5",
      actividad: { E2: "hoy 09:14", E3: "hace 3 sem.", E4: "hace 1 mes", E5: "hace 1 mes", E6: "hace 3 sem." } },
    "BAK-M95": { creadoPor: "importación", configEvaluacionEn: "E5",
      actividad: { E2: "hoy 09:14", E3: "hace 3 sem.", E4: "hace 1 mes", E5: "hace 3 sem.", E6: "hace 1 mes" } },
  };

  /* -- Estándar de grabación -----------------------------------------------
     Igual para todos los videos, del Maestro §2. Lo consume la hoja de cohorte
     en modo sesión. */
  const estandarGrabacion = {
    entorno: "Viajando.com",
    formato: "Intro y cierre a cámara; cuerpo con voz sobre pantalla (screencast).",
    duracion: "2 a 5 min. Si un tema se pasa de 5, probablemente sean dos videos.",
    cierre: "Todos terminan invitando a la evaluación del módulo.",
    noMostrar: [
      "Datos sensibles reales: CUIT o documentos de personas reales.",
      "Precios comerciales reales.",
      "Credenciales de acceso.",
      "Nada que exponga a un cliente real. Usar siempre datos de Viajando.com.",
    ],
  };

  return {
    ESCENAS: ESCENAS,
    ESCENA_DEFAULT: ESCENA_DEFAULT,
    ESTADOS: ESTADOS,
    planes: planes,
    superficies: superficies,
    modulos: modulos,
    cohortes: cohortes,
    listado: listado,
    evaluacion: evaluacion,
    estandarGrabacion: estandarGrabacion,
    MINIMOS_M30: MINIMOS_M30,
    minimosDeSeccion: minimosDeSeccion,
  };
})();
