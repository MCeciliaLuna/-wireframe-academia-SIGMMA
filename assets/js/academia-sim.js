/* ============================================================================
   Academia SIGMMA · Backoffice — motor de simulación
   ----------------------------------------------------------------------------
   Todo lo que en el prototipo anterior era un número escrito a mano se calcula
   acá: los contadores del kanban, los tiles del tablero, los anchos del embudo
   del Home, `publicados / total` del listado de módulos, las 5 cadenas del
   banco y la aptitud para activar. La regla es una sola: si un número se puede
   derivar, no se escribe.

   No hay `fetch` ni módulos ES: expone un global por IIFE para que el prototipo
   siga abriéndose por doble click sobre `file://`.

   `localStorage` sí se usa, y es el único archivo del repo que lo toca. Guarda
   un OVERLAY de cambios sobre el dataset —cambiar un estado, prender la
   visibilidad en el Front, marcar un video como grabado— para que la simulación
   tenga estado real. `?reset=1` lo borra en cualquier página.

   El overlay se guarda POR ESCENA. Marcar un video como grabado mientras se
   mira el Mes 1 no puede ensuciar el régimen: son dos momentos distintos de la
   misma línea de tiempo, y mezclarlos es exactamente lo que la regla de no
   mezclar escenas prohíbe.

   Este archivo no toca el DOM. Se puede cargar en node para verificar el
   dataset sin navegador:

       node -e 'global.window={};
                require("./assets/js/academia-data.js");
                require("./assets/js/academia-sim.js");
                process.exit(window.SIM.verificar().ok ? 0 : 1)'
   ========================================================================== */

window.SIM = (function () {
  "use strict";

  const D = window.ACADEMIA_DATA;
  if (!D) throw new Error("academia-sim.js necesita academia-data.js cargado antes.");

  /* -- Entorno -------------------------------------------------------------
     Corre igual en el navegador y en node. En node no hay `location` ni
     `localStorage`: la simulación queda en el dataset limpio, que es
     precisamente lo que hay que verificar. */
  const enNavegador = typeof window.location !== "undefined" && !!window.location.search;
  const busqueda = enNavegador ? window.location.search : "";

  function param(nombre) {
    const m = new RegExp("[?&]" + nombre + "=([^&]*)").exec(busqueda);
    return m ? decodeURIComponent(m[1]) : null;
  }

  const almacen = (function () {
    try {
      if (typeof window.localStorage === "undefined") return null;
      window.localStorage.setItem("academia:ping", "1");
      window.localStorage.removeItem("academia:ping");
      return window.localStorage;
    } catch (e) {
      /* Modo privado, o `file://` con almacenamiento bloqueado. La simulación
         funciona igual: sin persistencia entre páginas. */
      return null;
    }
  })();

  /* -- Escenas -------------------------------------------------------------- */
  const ordenDe = {};
  D.ESCENAS.forEach(function (e) { ordenDe[e.id] = e.orden; });

  const escenaPedida = param("escena");
  const escena = ordenDe[escenaPedida] ? escenaPedida : D.ESCENA_DEFAULT;
  /* Si se pidió una escena que no existe, la interfaz tiene que poder decirlo
     en lugar de mostrar otro momento con el rótulo cambiado. */
  const escenaInvalida = !!escenaPedida && !ordenDe[escenaPedida];

  function orden(escenaId) {
    return ordenDe[escenaId] || 0;
  }
  function alcanzada(hitoEscena, escenaId) {
    return !!hitoEscena && orden(hitoEscena) <= orden(escenaId);
  }

  /* -- Overlay ------------------------------------------------------------- */
  const PREFIJO = "academia:sim:";

  if (param("reset") === "1" && almacen) {
    Object.keys(almacen)
      .filter(function (k) { return k.indexOf(PREFIJO) === 0; })
      .forEach(function (k) { almacen.removeItem(k); });
  }

  function claveOverlay(escenaId) {
    return PREFIJO + (escenaId || escena);
  }

  function leerOverlay(escenaId) {
    if (!almacen) return {};
    try {
      return JSON.parse(almacen.getItem(claveOverlay(escenaId)) || "{}");
    } catch (e) {
      return {};
    }
  }

  function guardarOverlay(datos, escenaId) {
    if (!almacen) return;
    try {
      almacen.setItem(claveOverlay(escenaId), JSON.stringify(datos));
    } catch (e) {
      /* Cuota llena: la simulación sigue, sin persistir. */
    }
  }

  /* Un cambio sobre una entidad de la escena activa. `tipo` es "videos",
     "modulos" o "preguntas"; `campos` se mezcla sobre lo que ya había. */
  function anotar(tipo, id, campos) {
    const o = leerOverlay();
    o[tipo] = o[tipo] || {};
    o[tipo][id] = Object.assign({}, o[tipo][id], campos);
    guardarOverlay(o);
    return o[tipo][id];
  }

  /* Con `ignorarOverlay` en alto, el motor se comporta como si el overlay
     estuviera vacío. Es lo que le permite a `verificar()` auditar el DATASET y
     no la sesión: sin esto, dar de alta un video en el navegador haría fallar
     «los 55 videos» y el informe dejaría de significar algo. */
  let ignorarOverlay = false;

  function anotado(tipo, id, escenaId) {
    if (ignorarOverlay) return null;
    const o = leerOverlay(escenaId);
    return (o[tipo] && o[tipo][id]) || null;
  }

  /* Dar de alta una entidad en la escena activa. Hermana de `anotar()` y con la
     misma disciplina: escribe siempre en la escena que se está mirando.

     No re-indexa: la materialización corre una sola vez, al cargar. La pantalla
     que da de alta navega o recarga, que es lo que hace un backoffice sin
     backend — y así el alta se ve igual viniendo de esta sesión o de otra. */
  function crear(tipo, entidad) {
    const o = leerOverlay();
    o.nuevos = o.nuevos || {};
    o.nuevos[tipo] = o.nuevos[tipo] || [];
    o.nuevos[tipo].push(entidad);
    guardarOverlay(o);
    return entidad;
  }

  /* Solo borra lo que se creó en el overlay: el dataset no se toca. Devuelve
     cuántas entidades sacó. */
  function borrar(tipo, predicado) {
    const o = leerOverlay();
    if (!o.nuevos || !o.nuevos[tipo]) return 0;
    const antes = o.nuevos[tipo].length;
    o.nuevos[tipo] = o.nuevos[tipo].filter(function (x) { return !predicado(x); });
    guardarOverlay(o);
    return antes - o.nuevos[tipo].length;
  }

  /* Cuántos cambios tiene encima la escena activa. Lo usa `verificar()` para
     avisar que está auditando el dataset y no lo que se ve en pantalla. */
  function hayCambios(escenaId) {
    const o = leerOverlay(escenaId);
    let n = 0;
    ["videos", "modulos", "preguntas", "cohortes"].forEach(function (t) {
      n += Object.keys(o[t] || {}).length;
    });
    Object.keys(o.nuevos || {}).forEach(function (t) {
      n += (o.nuevos[t] || []).length;
    });
    return n;
  }

  /* Un ID de video no se puede reusar: sobrevive al regrabado (R2), así que un
     alta que pise uno existente rompería el historial de versiones. */
  function idLibre(id) {
    return !porId[id];
  }

  /* -- Materialización -----------------------------------------------------
     El dataset es la semilla; el overlay puede sumarle entidades. Fusionar acá
     —una sola vez, antes de indexar— es lo que hace que un módulo o un video
     creado se comporte igual que uno del dataset en TODAS las pantallas, sin
     que ninguna tenga que saber de dónde salió.

     Todo lo creado queda marcado con `creadoEnOverlay`, y vive solo en la
     escena donde se creó: el overlay es por escena, así que dar de alta un
     video mirando el Mes 1 no puede aparecer en el régimen. Es la misma regla
     que ya gobierna los cambios de estado.

     El dataset NO se muta: `academia-data.js` es dato, y `verificar()` tiene
     que poder auditarlo limpio. Se clona lo que haga falta. */
  const nuevos = (function () {
    const n = leerOverlay().nuevos || {};
    return {
      modulos: n.modulos || [],
      secciones: n.secciones || [],
      videos: n.videos || [],
      preguntas: n.preguntas || [],
      superficies: n.superficies || [],
    };
  })();

  const modulos = (function () {
    /* Clon de un nivel por módulo, más un array de secciones propio: alcanza
       para poder agregarle secciones y videos sin tocar el original. */
    const clonados = D.modulos.map(function (m) {
      return Object.assign({}, m, {
        secciones: m.secciones.map(function (s) {
          return Object.assign({}, s, { videos: s.videos.slice() });
        }),
      });
    });
    nuevos.modulos.forEach(function (m) {
      if (clonados.some(function (x) { return x.codigo === m.codigo; })) return;
      clonados.push(Object.assign({ secciones: [] }, m, { creadoEnOverlay: true }));
    });

    const porCodigo = {};
    clonados.forEach(function (m) { porCodigo[m.codigo] = m; });

    nuevos.secciones.forEach(function (s) {
      const m = porCodigo[s.codigoModulo];
      if (!m) return;
      if (m.secciones.some(function (x) { return x.titulo === s.titulo; })) return;
      m.secciones.push({
        orden: s.orden, titulo: s.titulo, videos: [], creadoEnOverlay: true,
      });
    });

    nuevos.videos.forEach(function (v) {
      const m = porCodigo[v.codigoModulo];
      if (!m) return;
      const seccion = m.secciones.filter(function (s) { return s.titulo === v.seccion; })[0] ||
        m.secciones[0];
      if (!seccion) return;
      if (seccion.videos.some(function (x) { return x.secuencia === v.secuencia; })) return;
      /* R11: nacen en backlog, sin link y sin versión. `hitos` vacío es
         exactamente eso: ningún estado alcanzado todavía. */
      seccion.videos.push(Object.assign({
        hitos: {}, version: null, fecha: null, afectadoPor: null, versiones: null,
      }, v, { creadoEnOverlay: true }));
    });

    return clonados;
  })();

  /* En modo limpio se devuelve el dataset original, sin lo creado ni las
     secciones agregadas. Toda función del motor que recorra el catálogo tiene
     que pasar por acá, no por `D.modulos`. */
  function catalogo() {
    return ignorarOverlay ? D.modulos : modulos;
  }
  function delDataset(x) {
    return !x.creadoEnOverlay;
  }

  /* -- Estados de producción ----------------------------------------------- */
  const ESTADOS = D.ESTADOS;
  function rango(estado) {
    return ESTADOS.indexOf(estado);
  }

  /* -- Índice plano de videos ---------------------------------------------
     El dataset los guarda anidados en módulo → sección → videos, que es la
     forma del árbol. Casi todas las pantallas los quieren planos. */
  const videos = [];
  const porId = {};
  const modulosPorNumero = {};

  modulos.forEach(function (m) {
    modulosPorNumero[m.numero] = m;
    m.secciones.forEach(function (s) {
      s.videos.forEach(function (v) {
        const id = m.codigo + "." + String(v.secuencia).padStart(3, "0");
        const cohorte = D.cohortes.filter(function (c) { return c.id === v.cohorte; })[0] || null;
        const reg = Object.assign({}, v, {
          id: id,
          modulo: m.numero,
          codigoModulo: m.codigo,
          tituloModulo: m.titulo,
          seccionOrden: s.orden,
          prioridad: cohorte ? cohorte.prioridad : null,
          /* El tag de plan es del módulo, salvo que el video declare el suyo. */
          planes: v.planes || m.planes,
        });
        videos.push(reg);
        porId[id] = reg;
      });
    });
  });

  /* El padrón de videos según el modo: en limpio, solo los del dataset. */
  function padron() {
    return ignorarOverlay ? videos.filter(delDataset) : videos;
  }

  /* El estado más avanzado cuyo hito ya ocurrió en esta escena. Sin hitos, el
     video está en `backlog`: nace así, sin link y sin versión (R11). */
  function estadoDe(video, escenaId) {
    const esc = escenaId || escena;
    const cambio = anotado("videos", video.id, esc);
    if (cambio && cambio.estado) return cambio.estado;
    let mejor = "backlog";
    for (const estado in video.hitos) {
      if (alcanzada(video.hitos[estado], esc) && rango(estado) > rango(mejor)) mejor = estado;
    }
    return mejor;
  }

  /* Estado de producción y visibilidad en el Front son dos ejes distintos (R3).
     Solo un video `publicado` puede estar visible; el obsoleto nunca lo está. */
  function visibleEnFront(video, escenaId) {
    const esc = escenaId || escena;
    const est = estadoDe(video, esc);
    /* El chequeo del obsoleto va ANTES del overlay, no después: es una regla
       del producto, no un default que la sesión pueda pisar. Al revés —como
       estaba— un `{visible:true}` guardado devolvía al Front un video dado de
       baja, que es justo lo que R3 impide. */
    if (est === "obsoleto") return false;
    const cambio = anotado("videos", video.id, esc);
    if (cambio && typeof cambio.visible === "boolean") return cambio.visible;
    /* `a regrabar` sigue publicado en el Front: se saca cuando hay reemplazo,
       no cuando se detecta que quedó viejo. */
    return est === "publicado" || est === "a regrabar";
  }

  function videosDe(moduloNumero, escenaId) {
    return padron().filter(function (v) { return v.modulo === moduloNumero; })
      .map(function (v) { return conEstado(v, escenaId); });
  }

  /* Los campos del video que la ficha deja editar. La IDENTIDAD no está: ID,
     superficie, módulo y secuencia no se editan nunca (R2), porque el ID
     sobrevive al regrabado y los videos cuelgan de él. */
  const EDITABLES = ["titulo", "cohorte", "duracion", "planes"];

  function conEstado(video, escenaId) {
    const esc = escenaId || escena;
    const cambio = anotado("videos", video.id, esc) || {};
    const editado = {};
    EDITABLES.forEach(function (k) {
      if (cambio[k] !== undefined && cambio[k] !== null) editado[k] = cambio[k];
    });
    /* La prioridad NO se edita: es la del cohorte. Si el cohorte cambió, la
       prioridad tiene que seguirlo, o el tablero mostraría un video en P1
       grabándose con una tanda P3. */
    if (editado.cohorte) {
      const c = D.cohortes.filter(function (x) { return x.id === editado.cohorte; })[0];
      editado.prioridad = c ? c.prioridad : null;
    }
    return Object.assign({}, video, editado, {
      estado: estadoDe(video, esc),
      visible: visibleEnFront(video, esc),
    });
  }

  function todos(escenaId) {
    return padron().map(function (v) { return conEstado(v, escenaId); });
  }

  /* -- Preguntas -----------------------------------------------------------
     El banco es DEL MÓDULO (`MD-PROYECTO-CLAUDE.md` §2): 50 por módulo, cada
     una con `subtema` obligatorio —que es el título de una sección— y con el
     video de origen, que es lo que permite invalidarlas al regrabar.

     `creadaEn` es la escena a partir de la cual la pregunta existe. Igual que
     con los hitos de los videos, modelarlo así hace que el banco no pueda
     achicarse entre escenas sucesivas.

     El estado de una pregunta se DERIVA, no se guarda:
       · `borrador`  — lo declara la propia pregunta
       · `a revisar` — su video de origen está `a regrabar` u `obsoleto`
       · `vigente`   — el resto
     De ahí sale la regla que une las 5 cadenas: cuando un video pasa a
     `a regrabar`, todas sus preguntas vigentes pasan a `a revisar`.

     El caso `obsoleto` extiende esa regla, y por el mismo motivo: una pregunta
     sobre un video dado de baja tampoco se puede tomar. Lo trae `BAK-M10.050`,
     que quedó obsoleto con dos preguntas escritas. El vocabulario de estados no
     tiene «retirada», así que caen en `a revisar` y alguien tiene que decidir
     qué hacer con ellas — que es exactamente lo que `a revisar` significa.
     Toca el territorio de la decisión D-5, que sigue abierta. */
  const preguntas = (D.preguntas || []).slice().concat(
    nuevos.preguntas.map(function (p) {
      return Object.assign({ creadaEn: escena, borrador: false, origen: "escrita" }, p,
        { creadoEnOverlay: true });
    })
  );
  const preguntasPorModulo = {};
  preguntas.forEach(function (p) {
    (preguntasPorModulo[p.modulo] = preguntasPorModulo[p.modulo] || []).push(p);
  });

  /* El padrón de preguntas según el modo, hermano de `padron()`. */
  function padronPreguntas() {
    return ignorarOverlay ? preguntas.filter(delDataset) : preguntas;
  }

  function estadoPregunta(pregunta, escenaId) {
    const esc = escenaId || escena;
    const cambio = anotado("preguntas", pregunta.id, esc);
    if (cambio && cambio.estado) return cambio.estado;
    if (pregunta.borrador) return "borrador";
    const origen = pregunta.videoOrigen ? porId[pregunta.videoOrigen] : null;
    if (origen) {
      const est = estadoDe(origen, esc);
      if (est === "a regrabar" || est === "obsoleto") return "a revisar";
    }
    return "vigente";
  }

  function bancoDe(moduloNumero, escenaId) {
    const esc = escenaId || escena;
    return (preguntasPorModulo[moduloNumero] || [])
      .filter(function (p) { return ignorarOverlay ? delDataset(p) : true; })
      .filter(function (p) { return alcanzada(p.creadaEn, esc); })
      .map(function (p) { return Object.assign({}, p, { estado: estadoPregunta(p, esc) }); });
  }

  /* -- Módulos ------------------------------------------------------------- */
  function moduloEstado(modulo, escenaId) {
    const esc = escenaId || escena;
    const cambio = anotado("modulos", modulo.codigo, esc);
    if (cambio && cambio.estado) return cambio.estado;
    if (modulo.tipo === "reservado") return "reservado";
    /* En E6 la Academia está completa y en uso: todos los módulos activos. */
    if (orden(esc) >= orden("E6")) return "activo";
    return alcanzada(modulo.activadoEn, esc) ? "activo" : "borrador";
  }

  /* La configuración de evaluación de un módulo.

     El dataset la declara por HITO —`configEvaluacionEn` es la escena a partir
     de la cual está cargada—, igual que todo lo demás. El overlay puede
     configurarla desde la pantalla, y ahí manda el overlay.

     Los tres valores tienen default global en `D.evaluacion`: un módulo que no
     los tocó usa los del producto. Guardar el default por módulo haría que
     cambiar la política del producto no llegara a ninguno. */
  function configEvaluacion(modulo, escenaId) {
    const esc = escenaId || escena;
    const meta = (D.listado || {})[modulo.codigo] || {};
    const cambio = anotado("modulos", modulo.codigo, esc) || {};
    const propia = cambio.evaluacion || null;
    return {
      configurada: propia ? true : alcanzada(meta.configEvaluacionEn, esc),
      bancoMinimo: (propia && propia.bancoMinimo) || D.evaluacion.bancoMinimoPorModulo,
      porIntento: (propia && propia.porIntento) || D.evaluacion.preguntasPorIntento,
      umbral: (propia && propia.umbral) || D.evaluacion.umbral,
    };
  }

  /* Los videos que la Ruta Esencial referencia (R8: los referencia, no los
     copia). Salen de sus cohortes, no de una lista propia. */
  function videosDeRuta(modulo) {
    const cohortes = (modulo.referencia && modulo.referencia.cohortes) || [];
    return padron().filter(function (v) { return cohortes.indexOf(v.cohorte) !== -1; });
  }

  function resumenModulo(modulo, escenaId) {
    const esc = escenaId || escena;
    const esRuta = modulo.tipo === "ruta";
    const vs = (esRuta ? videosDeRuta(modulo) : videos.filter(function (v) { return v.modulo === modulo.numero; }))
      .map(function (v) { return conEstado(v, esc); });
    const publicados = vs.filter(function (v) { return v.estado === "publicado"; }).length;

    /* El mínimo del banco existe recién cuando la evaluación del módulo está
       configurada. Antes de eso el listado dice «sin configurar» con el mínimo
       en guion, no «0 de 50»: un banco vacío es trabajo pendiente, un mínimo sin
       definir es una decisión pendiente. */
    const meta = (D.listado || {})[modulo.codigo] || {};
    const cfg = configEvaluacion(modulo, esc);
    const configurada = cfg.configurada;

    let banco, minimo, vigentes, aRevisar, borradores, total;
    if (esRuta) {
      /* Banco DERIVADO: 5 preguntas por cada video publicado que referencia.
         No copia las preguntas del módulo de origen: las hereda. */
      const porVideo = D.evaluacion.preguntasHeredadasPorVideo;
      minimo = configurada ? vs.length * porVideo : 0;
      vigentes = publicados * porVideo;
      aRevisar = 0;
      borradores = 0;
      total = vigentes;
      banco = { derivado: true };
    } else {
      const b = bancoDe(modulo.numero, esc);
      total = b.length;
      vigentes = b.filter(function (p) { return p.estado === "vigente"; }).length;
      aRevisar = b.filter(function (p) { return p.estado === "a revisar"; }).length;
      borradores = b.filter(function (p) { return p.estado === "borrador"; }).length;
      minimo = configurada && modulo.tipo !== "reservado" ? cfg.bancoMinimo : 0;
      banco = { derivado: false };
    }

    return {
      modulo: modulo,
      esRuta: esRuta,
      estado: moduloEstado(modulo, esc),
      videos: vs,
      publicados: publicados,
      totalVideos: vs.length,
      creadoPor: meta.creadoPor || null,
      actividad: (meta.actividad || {})[esc] || null,
      banco: {
        derivado: banco.derivado,
        configurada: configurada,
        total: total,
        vigentes: vigentes,
        aRevisar: aRevisar,
        borradores: borradores,
        minimo: minimo,
        faltan: Math.max(0, minimo - vigentes),
      },
    };
  }

  /* Aptitud para activar: los 4 criterios, con el faltante explícito. Es una
     compuerta AL MOMENTO de activar, no una condición permanente (D-4): un
     módulo ya activo puede dejar de cumplirla sin desactivarse. */
  function aptitud(modulo, escenaId) {
    const r = resumenModulo(modulo, escenaId);
    const criterios = [
      {
        nombre: "Videos publicados",
        valor: r.publicados + " de " + r.totalVideos,
        cumple: r.totalVideos > 0 && r.publicados === r.totalVideos,
      },
      {
        nombre: "Banco de preguntas vigentes",
        valor: r.banco.vigentes + " de " + r.banco.minimo,
        cumple: r.banco.minimo > 0 && r.banco.vigentes >= r.banco.minimo,
      },
      {
        nombre: "Configuración de evaluación",
        valor: r.banco.configurada ? "cargada" : "sin configurar",
        cumple: r.banco.configurada,
      },
      {
        nombre: "Preguntas a revisar",
        valor: r.banco.aRevisar === 0 ? "ninguna" : String(r.banco.aRevisar),
        cumple: r.banco.aRevisar === 0,
      },
    ];
    /* `faltan` lista solo los faltantes CUANTITATIVOS, que son los que se
       enumeran en una sola frase. La deuda de revisión va aparte: no es algo que
       falte cargar sino una decisión pendiente, y encadenarla con «y» daba
       «faltan 3 videos y 30 preguntas y revisar 7 preguntas». */
    const faltan = [];
    const faltanVideos = r.totalVideos - r.publicados;
    if (faltanVideos > 0) faltan.push(faltanVideos + (faltanVideos === 1 ? " video publicado" : " videos publicados"));
    if (r.banco.faltan > 0) faltan.push(r.banco.faltan + (r.banco.faltan === 1 ? " pregunta vigente" : " preguntas vigentes"));
    if (!r.banco.configurada) faltan.push("configurar la evaluación");
    return {
      apto: criterios.every(function (c) { return c.cumple; }),
      criterios: criterios,
      faltan: faltan,
      faltanVideos: faltanVideos,
      aRevisar: r.banco.aRevisar,
      resumen: r,
    };
  }

  /* El módulo de biblioteca más cerca de poder activarse. Es lo que le permite
     al Home mostrar UN hito en lugar de once módulos en alerta: primero los que
     ya tienen todos sus videos publicados y solo les falta banco, y entre esos
     el que menos preguntas necesita. */
  function moduloMasCerca(escenaId) {
    const esc = escenaId || escena;
    const candidatos = catalogo()
      .filter(function (m) { return m.tipo === "biblioteca"; })
      .map(function (m) { return resumenModulo(m, esc); })
      .filter(function (r) { return r.estado !== "activo" && r.totalVideos > 0; });
    if (!candidatos.length) return null;
    candidatos.sort(function (a, b) {
      const faltanVideosA = a.totalVideos - a.publicados;
      const faltanVideosB = b.totalVideos - b.publicados;
      if (faltanVideosA !== faltanVideosB) return faltanVideosA - faltanVideosB;
      return a.banco.faltan - b.banco.faltan;
    });
    return candidatos[0];
  }

  /* -- Secciones ----------------------------------------------------------
     Cada sección lleva sus dos indicadores: banco mínimo y mínimo por sorteo.
     Los mínimos los reparte el dataset; acá se cuentan las preguntas reales. */
  function seccionesDe(modulo, escenaId) {
    const esc = escenaId || escena;
    /* Sin evaluación configurada la sección tampoco tiene mínimos: el módulo
       todavía no declaró cuántas preguntas necesita. */
    const configurada = configEvaluacion(modulo, esc).configurada;
    const minimos = configurada
      ? D.minimosDeSeccion(modulo)
      : modulo.secciones.map(function () { return { banco: 0, sorteo: 0 }; });
    const b = bancoDe(modulo.numero, esc);
    return modulo.secciones.map(function (s, i) {
      const vs = s.videos.map(function (v) { return conEstado(porId[modulo.codigo + "." + String(v.secuencia).padStart(3, "0")], esc); });
      const ps = b.filter(function (p) { return p.subtema === s.titulo; });
      const vigentes = ps.filter(function (p) { return p.estado === "vigente"; }).length;
      const min = minimos[i] || { banco: 0, sorteo: 0 };
      return {
        orden: s.orden,
        titulo: s.titulo,
        videos: vs,
        preguntas: ps,
        total: ps.length,
        vigentes: vigentes,
        aRevisar: ps.filter(function (p) { return p.estado === "a revisar"; }).length,
        borradores: ps.filter(function (p) { return p.estado === "borrador"; }).length,
        minimoBanco: min.banco,
        minimoSorteo: min.sorteo,
        faltan: Math.max(0, min.banco - vigentes),
      };
    });
  }

  /* -- Orden derivado de una sección ---------------------------------------
     El orden de una sección se DERIVA de la secuencia más baja de sus videos,
     nunca del orden en que llegaron las filas que la crearon. Es lo que hace
     que ordenar la planilla de importación por ID, por módulo o por cohorte no
     pueda cambiar el syllabus que ve la agencia: un «ordenar de A a Z» en
     Sheets rompería el producto sin que nadie se entere.

     Verificado contra el dataset: reproduce las 31 secciones sin excepción.

     Una sección recién creada todavía no tiene videos de los que derivar nada,
     así que ahí manda el `orden` explícito que trae la entidad. */
  function ordenDeSeccion(seccion) {
    const vs = (seccion && seccion.videos) || [];
    if (!vs.length) {
      return seccion && typeof seccion.orden === "number" ? seccion.orden : null;
    }
    return vs.reduce(function (min, v) {
      return v.secuencia < min ? v.secuencia : min;
    }, vs[0].secuencia);
  }

  /* -- Cuota de preguntas de un video --------------------------------------
     ORIENTATIVA, no exigible. Lo que el sistema exige sigue siendo el mínimo
     POR SECCIÓN: si alguien escribe 12 preguntas de un video y 8 de otro de la
     misma sección, la sección está igual de sana. La cuota existe para que la
     tarea tenga un tamaño —«escribir las de BAK-M30.050» se empieza y se
     termina; «cargar las 50 de BAK-M30» no se termina nunca de una sentada, y
     por eso se abandona—, no para auditar a nadie.

     NO es 10 parejo: el reparto por sección va de 5 a 20 según cuántos videos
     comparten la sección. `BAK-M00 · Moverse por SIGMMA` tiene un solo video y
     un banco de 20. El resto de la división inexacta se reparte entre los
     videos de menor secuencia, para que la suma cierre EXACTA contra el mínimo
     de la sección.

     Devuelve 0 si la evaluación del módulo no está configurada: antes de eso no
     hay mínimo que repartir, igual que `resumenModulo()` muestra `—` y no
     `0 de 50`. */
  function cuotaDeVideo(video, escenaId) {
    const esc = escenaId || escena;
    if (!video) return 0;
    const m = modulosPorNumero[video.modulo];
    if (!m || !m.secciones || !m.secciones.length) return 0;
    if (!configEvaluacion(m, esc).configurada) return 0;

    const minimos = D.minimosDeSeccion(m);
    let cuota = 0;
    m.secciones.forEach(function (s, i) {
      if (s.titulo !== video.seccion) return;
      const vs = (s.videos || []).slice().sort(function (a, b) {
        return a.secuencia - b.secuencia;
      });
      if (!vs.length) return;
      const banco = (minimos[i] || { banco: 0 }).banco;
      const base = Math.floor(banco / vs.length);
      const resto = banco % vs.length;
      let pos = 0;
      vs.forEach(function (v, k) { if (v.secuencia === video.secuencia) pos = k; });
      cuota = base + (pos < resto ? 1 : 0);
    });
    return cuota;
  }

  /* -- Sorteo de un intento -----------------------------------------------
     10 preguntas sobre las 50 del módulo, RESPETANDO la cuota por sección. La
     cuota es lo que evita que el azar deje afuera un concepto central, y es la
     razón de que el `subtema` sea obligatorio.

     Cuando una sección no llega a su cuota —porque sus preguntas pasaron a
     `a revisar`— el sorteo sale corto y hay que poder decirlo: es el estado
     roto que el wireframe dibuja a propósito. No se rellena con preguntas de
     otra sección, porque eso escondería el problema. */
  function sortear(moduloNumero, escenaId, aleatorio) {
    const modulo = modulosPorNumero[moduloNumero];
    if (!modulo) return null;
    const rnd = aleatorio || Math.random;
    const secciones = seccionesDe(modulo, escenaId);
    const cfg = configEvaluacion(modulo, escenaId);
    const pedidas = cfg.porIntento;
    const salida = [];
    const cortas = [];

    secciones.forEach(function (s) {
      const vigentes = s.preguntas.filter(function (p) { return p.estado === "vigente"; });
      const mezcladas = mezclar(vigentes, rnd);
      const toma = Math.min(s.minimoSorteo, mezcladas.length);
      for (let i = 0; i < toma; i++) salida.push(mezcladas[i]);
      if (toma < s.minimoSorteo) {
        cortas.push({ seccion: s.titulo, pide: s.minimoSorteo, tiene: mezcladas.length });
      }
    });

    return {
      preguntas: salida,
      pedidas: pedidas,
      salen: salida.length,
      completo: salida.length === pedidas,
      cortas: cortas,
      umbral: cfg.umbral,
    };
  }

  function mezclar(lista, rnd) {
    const a = lista.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor((rnd || Math.random)() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  /* El historial de versiones de un video. Cuando el dataset no lo declara se
     sintetiza a partir de la versión vigente: la enorme mayoría de los videos
     tiene una sola, y escribirla dos veces sería duplicar el dato.

     Los links son de muestra y se derivan del ID para que sean estables: un
     link aleatorio cambiaría en cada carga y el prototipo se leería como si el
     dato se moviera solo. */
  function versionesDe(video, escenaId) {
    const esc = escenaId || escena;
    const est = estadoDe(video, esc);
    const base = video.versiones
      ? video.versiones.map(function (x) { return Object.assign({}, x); })
      : (!video.version || rango(est) < rango("grabado"))
        ? []
        : [{
            v: video.version,
            link: "youtu.be/" + video.id.replace(/[^A-Za-z0-9]/g, "").toLowerCase(),
            versionProducto: video.afectadoPor,
            fecha: video.fecha ? video.fecha + "/2026" : null,
            motivo: null,
            vigente: true,
          }];

    /* Las versiones cargadas desde la ficha toman la vigencia y las anteriores
       quedan archivadas, no se borran. El ID del video no cambia entre
       versiones (R2) — lo que cambia es el link, la versión de producto que
       documenta y el motivo del regrabado.

       Van ADELANTE: el dataset las lista de la más nueva a la más vieja, y
       agregarlas al final dejaría la tabla en v2, v1, v3. */
    const cambio = anotado("videos", video.id, esc);
    const sumadas = (cambio && cambio.versiones) || [];
    if (!sumadas.length) return base;
    return sumadas.slice().reverse()
      .map(function (x, i) { return Object.assign({}, x, { vigente: i === 0 }); })
      .concat(base.map(function (x) { return Object.assign({}, x, { vigente: false }); }));
  }

  /* Las ubicaciones de un video: dónde aparece. Tiene UNA sola canónica —la de
     su módulo de biblioteca— y el resto son referencias. R8: la Ruta Esencial
     referencia, no copia, y esta pantalla es donde se ve. */
  function ubicacionesDe(video, escenaId) {
    const esc = escenaId || escena;
    const modulo = modulosPorNumero[video.modulo];
    const salida = [];
    if (modulo) {
      const hermanos = modulo.secciones.filter(function (s) { return s.titulo === video.seccion; })[0];
      const total = hermanos ? hermanos.videos.length : 0;
      const pos = hermanos
        ? hermanos.videos.map(function (x) { return x.secuencia; }).indexOf(video.secuencia) + 1
        : 0;
      salida.push({
        etiqueta: modulo.codigo + " · " + video.seccion,
        orden: pos + " de " + total,
        canonica: true,
      });
    }
    /* La Ruta lo referencia si su cohorte es uno de los que la componen. */
    catalogo().filter(function (m) { return m.tipo === "ruta"; }).forEach(function (ruta) {
      const cohortes = (ruta.referencia && ruta.referencia.cohortes) || [];
      if (cohortes.indexOf(video.cohorte) === -1) return;
      const dentro = videosDeRuta(ruta);
      const pos = dentro.map(function (x) { return x.id; }).indexOf(video.id) + 1;
      const cohorte = D.cohortes.filter(function (c) { return c.id === video.cohorte; })[0];
      salida.push({
        etiqueta: ruta.codigo + " · " + ruta.titulo + " · " + (cohorte ? cohorte.nombre : video.cohorte),
        orden: pos + " de " + dentro.length,
        canonica: false,
      });
    });
    return salida;
  }

  /* La checklist de publicación. D-1: ADVIERTE, no bloquea — se puede publicar
     sin pregunta asociada y el video queda listado en «publicados sin pregunta».
     Lo pregunta el propio wireframe y así quedó resuelto. */
  function checklistDe(video, escenaId) {
    const esc = escenaId || escena;
    const est = estadoDe(video, esc);
    const versiones = versionesDe(video, esc);
    const vigente = versiones.filter(function (x) { return x.vigente; })[0] || null;
    const preguntas = padronPreguntas().filter(function (p) {
      return p.videoOrigen === video.id && alcanzada(p.creadaEn, esc);
    });
    const ubic = ubicacionesDe(video, esc);
    return [
      { texto: "Link cargado y validado", hecho: !!vigente, obligatorio: true },
      { texto: "Embebido permitido en el dominio", hecho: !!vigente, obligatorio: true },
      { texto: "Guión versionado", hecho: rango(est) >= rango("guionado"), obligatorio: true },
      { texto: "Duración dentro del objetivo", hecho: !!video.duracion, obligatorio: false },
      { texto: "Tiene al menos 1 pregunta asociada", hecho: preguntas.length > 0, obligatorio: true },
      { texto: "Ubicación canónica definida", hecho: ubic.some(function (u) { return u.canonica; }), obligatorio: true },
    ];
  }

  /* El guión de un video, si existe. Solo los 12 de P1 lo tienen escrito: el
     resto se guioniza cuando le toca. */
  /* El guión escrito desde el editor pisa al del dataset: es el mismo guión,
     editado. Solo los 12 de P1 vienen escritos; el resto nace vacío.

     A-4: al publicar queda CONGELADO con la versión, y esa compuerta la aplica
     el editor —no acá—, porque el motor tiene que poder leer el guión de un
     video publicado igual. */
  function guionDe(video, escenaId) {
    const esc = escenaId || escena;
    const cambio = anotado("videos", video.id, esc);
    if (cambio && cambio.guion) return cambio.guion;
    return (D.guiones || []).filter(function (g) { return g.video === video.id; })[0] || null;
  }

  /* La cadena de encadenamiento dentro del cohorte: de dónde viene el video y
     qué sigue. Es el dato que hace que el cohorte funcione —se prepara el
     escenario una vez y se graba el recorrido— y NO se guarda: se deriva del
     orden de grabación. Guardarlo sería duplicar la relación video → cohorte y
     quedaría desincronizado al reordenar.

     El orden de grabación es el del mapa: módulo, después sección, después
     secuencia. Coincide con el que declara el Maestro para los tres cohortes de
     P1, que son los únicos que lo tienen especificado. */
  function cadenaDe(video, escenaId) {
    const esc = escenaId || escena;
    const hermanos = videos.filter(function (v) { return v.cohorte === video.cohorte; });
    const i = hermanos.map(function (v) { return v.id; }).indexOf(video.id);
    const cohorte = D.cohortes.filter(function (c) { return c.id === video.cohorte; })[0] || null;
    return {
      cohorte: cohorte,
      posicion: i + 1,
      total: hermanos.length,
      anterior: i > 0 ? conEstado(hermanos[i - 1], esc) : null,
      siguiente: i >= 0 && i < hermanos.length - 1 ? conEstado(hermanos[i + 1], esc) : null,
    };
  }

  /* Deuda de evaluación: videos publicados sin ninguna pregunta. Es lo que
     hace que la checklist de publicación advierta en lugar de bloquear (D-1):
     se puede publicar sin pregunta, pero el sistema lo tiene que decir. */
  function deudaDeEvaluacion(escenaId) {
    const esc = escenaId || escena;
    const conPregunta = {};
    padronPreguntas().forEach(function (p) {
      if (alcanzada(p.creadaEn, esc)) conPregunta[p.videoOrigen] = true;
    });
    return todos(esc).filter(function (v) {
      return v.estado === "publicado" && !conPregunta[v.id];
    });
  }

  /* -- Cola de escritura de preguntas --------------------------------------
     La unidad de trabajo es el VIDEO, no el módulo. Es todo el cambio: «cargar
     las 50 de un módulo» no tiene punto de corte y por eso se abandona.

     La cola NO lista los 55 videos: lista lo que se puede hacer hoy. Un video
     que no se grabó no aparece —todavía no corresponde escribirle preguntas—,
     así que en E1 y E2 la cola está legítimamente vacía. Eso es dato, no un
     estado roto de la pantalla.

     Tres motivos, en orden de urgencia:
       1 · `sin preguntas` — publicado y sin ninguna. Está visible para las
           agencias y no se puede evaluar: es la `deudaDeEvaluacion()`.
       2 · `bajo cuota`    — publicado y por debajo de la cuota de su sección.
       3 · `a revisar`     — pasó a `a regrabar` y sus preguntas cayeron a
           `a revisar` por la regla de `estadoPregunta()`. Acá no se escribe:
           se revisa, que es otro trabajo y se rotula distinto.

     `escritas` cuenta las que no son relleno `estructural`. Es la diferencia
     entre la deuda formal —cuánto falta para el mínimo, que es la que habilita
     la aptitud— y la deuda de contenido, que es la que dice cuánto trabajo
     queda de verdad: un módulo puede figurar completo evaluando con preguntas
     que no preguntan por SIGMMA. */
  const MOTIVOS = ["sin preguntas", "bajo cuota", "a revisar"];

  function colaDeEscritura(escenaId, moduloNumero) {
    const esc = escenaId || escena;

    const porVideo = {};
    padronPreguntas().forEach(function (p) {
      if (!p.videoOrigen || !alcanzada(p.creadaEn, esc)) return;
      const c = porVideo[p.videoOrigen] ||
        (porVideo[p.videoOrigen] = { total: 0, vigentes: 0, aRevisar: 0, escritas: 0 });
      c.total++;
      const est = estadoPregunta(p, esc);
      if (est === "vigente") c.vigentes++;
      if (est === "a revisar") c.aRevisar++;
      if (p.origen !== "estructural") c.escritas++;
    });

    const filas = [];
    todos(esc).forEach(function (v) {
      if (moduloNumero !== undefined && moduloNumero !== null && v.modulo !== moduloNumero) return;
      const m = modulosPorNumero[v.modulo];
      /* La Ruta no entra: su banco es DERIVADO de los videos que referencia
         (R8), así que no hay nada que escribir contra ella. */
      if (!m || m.tipo !== "biblioteca") return;

      const c = porVideo[v.id] || { total: 0, vigentes: 0, aRevisar: 0, escritas: 0 };
      const cuota = cuotaDeVideo(v, esc);

      let motivo = null;
      if (v.estado === "publicado" && c.total === 0) motivo = "sin preguntas";
      else if (v.estado === "publicado" && cuota > 0 && c.vigentes < cuota) motivo = "bajo cuota";
      else if (v.estado === "a regrabar" && c.aRevisar > 0) motivo = "a revisar";
      if (!motivo) return;

      filas.push({
        video: v,
        modulo: m,
        seccion: v.seccion,
        motivo: motivo,
        total: c.total,
        vigentes: c.vigentes,
        aRevisar: c.aRevisar,
        escritas: c.escritas,
        cuota: cuota,
        faltan: Math.max(0, cuota - c.vigentes),
      });
    });

    filas.sort(function (a, b) {
      const ra = MOTIVOS.indexOf(a.motivo);
      const rb = MOTIVOS.indexOf(b.motivo);
      if (ra !== rb) return ra - rb;
      /* Dentro del mismo motivo, el orden curricular del módulo y después la
         secuencia: es el orden en que la agencia va a encontrarse los videos. */
      if (a.modulo.orden !== b.modulo.orden) return a.modulo.orden - b.modulo.orden;
      return a.video.secuencia - b.video.secuencia;
    });
    return filas;
  }

  /* -- Agregados del tablero y del Home ------------------------------------ */
  function conteoPorEstado(escenaId) {
    const c = {};
    ESTADOS.forEach(function (e) { c[e] = 0; });
    todos(escenaId).forEach(function (v) { c[v.estado]++; });
    return c;
  }

  /* El embudo del Home. Los anchos se calculan: escribirlos a mano fue lo que
     obligaba a recalcular 30 números cada vez que un video cambiaba de estado. */
  function embudo(escenaId) {
    const c = conteoPorEstado(escenaId);
    const total = videos.length;
    return ESTADOS
      .filter(function (e) { return c[e] > 0; })
      .map(function (e) {
        return { estado: e, cantidad: c[e], porcentaje: Number(((c[e] / total) * 100).toFixed(2)) };
      });
  }

  function cohortesConAvance(escenaId) {
    const esc = escenaId || escena;
    return D.cohortes.map(function (c) {
      const vs = videos.filter(function (v) { return v.cohorte === c.id; })
        .map(function (v) { return conEstado(v, esc); });
      const alcanzo = function (estado) {
        return vs.filter(function (v) { return rango(v.estado) >= rango(estado); }).length;
      };
      return Object.assign({}, c, {
        videos: vs,
        total: vs.length,
        conGuion: alcanzo("guionado"),
        grabados: alcanzo("grabado"),
        publicados: vs.filter(function (v) { return v.estado === "publicado"; }).length,
      });
    });
  }

  /* -- Operación · agencias, personas y uso --------------------------------
     Todo esto existe solo desde E6: antes no hay uso que medir (R10). Las
     funciones devuelven cero o listas vacías en las escenas anteriores, para que
     la interfaz pueda mostrar «0 agencias con acceso» sin casos especiales.

     El avance se DERIVA de una semilla estable por persona. No se escribe, y no
     es aleatorio: con `Math.random()` el número cambiaría en cada carga y la
     demo se leería como si el dato se moviera solo. */
  function agencias(escenaId) {
    const esc = escenaId || escena;
    return (D.agencias || []).filter(function (a) { return alcanzada(a.altaEn, esc); });
  }

  /* El recorrido de una agencia: los módulos que su plan habilita, en orden
     curricular. Es el denominador de toda base de cálculo, y cambia con el plan:
     un módulo fuera de plan no entra ni a la cadena de desbloqueo ni al total. */
  function recorridoDe(plan, escenaId) {
    const esc = escenaId || escena;
    return catalogo()
      .filter(function (m) {
        if (m.tipo !== "biblioteca") return false;
        if (moduloEstado(m, esc) !== "activo") return false;
        return (m.planes || []).indexOf(plan) !== -1;
      })
      .sort(function (x, y) { return x.orden - y.orden; });
  }

  /* El avance de una persona: qué módulos aprobó, con cuántos intentos y qué
     nota, y cómo viene el que tiene en curso.

     El desbloqueo es secuencial: se aprueba uno y se habilita el siguiente. Por
     eso el avance es un PREFIJO del recorrido y no un conjunto salteado — no
     existe aprobar el módulo 5 sin haber aprobado el 4. */
  function avanceDe(persona, escenaId) {
    const esc = escenaId || escena;
    const ag = (D.agencias || []).filter(function (a) { return a.id === persona.agenciaId; })[0];
    if (!ag || !alcanzada(ag.altaEn, esc)) {
      return { agencia: ag || null, recorrido: [], aprobados: [], enCurso: null, certificada: false };
    }
    const recorrido = recorridoDe(ag.plan, esc);
    const s = D.semillaUso(persona.id);
    /* Cuántos aprobó: del 0 al total. La coordinadora arranca más avanzada —es
       quien empuja la capacitación— y eso hace que el ranking del equipo no sea
       plano. */
    const empuje = persona.coordinadora ? 0.35 : 0;
    const fraccion = Math.min(1, s + empuje);
    const cuantos = Math.round(fraccion * recorrido.length);

    const aprobados = recorrido.slice(0, cuantos).map(function (m, i) {
      const sm = D.semillaUso(persona.id + ":" + m.numero);
      /* Umbral 8 de 10: una nota aprobada va de 8 a 10.
         Los intentos NO se reparten parejo entre 1, 2 y 3: la mayoría aprueba en
         el primero. Con reparto uniforme el promedio daba 2 intentos por
         aprobación y una tasa de reprobación del 47 %, que para un promedio
         general es implausible y le sacaría valor a la señal — si todos los
         módulos se reprueban la mitad de las veces, el número deja de servir
         para detectar el módulo cuyo contenido hay que revisar. */
      return {
        modulo: m,
        nota: 8 + Math.floor(sm * 3),
        intentos: 1 + (sm > 0.74 ? 1 : 0) + (sm > 0.92 ? 1 : 0),
        orden: i + 1,
      };
    });

    /* El módulo en curso es el siguiente del recorrido, con avance parcial de
       videos vistos. Si aprobó todos, no hay ninguno en curso. */
    let enCurso = null;
    if (cuantos < recorrido.length) {
      const m = recorrido[cuantos];
      const vs = videos.filter(function (v) { return v.modulo === m.numero; })
        .map(function (v) { return conEstado(v, esc); })
        .filter(function (v) { return v.visible; });
      const sm = D.semillaUso(persona.id + ":curso:" + m.numero);
      const vistos = Math.floor(sm * (vs.length + 1));
      enCurso = { modulo: m, videos: vs.length, vistos: vistos };
    }

    return {
      agencia: ag,
      recorrido: recorrido,
      aprobados: aprobados,
      enCurso: enCurso,
      certificada: recorrido.length > 0 && cuantos === recorrido.length,
    };
  }

  /* El uso de un video: las DOS señales que pide el alcance del MVP (§6).
     Una cosa es abrir el video y otra consumirlo: la brecha entre aperturas y
     reproducciones completas es justamente la señal interesante, y colapsarlas
     en un solo número la borra. */
  function usoDeVideo(video, escenaId) {
    const esc = escenaId || escena;
    const ags = agencias(esc);
    if (!ags.length) return { aperturas: 0, reproducciones: 0, alcance: 0 };
    let aperturas = 0;
    let reproducciones = 0;
    let alcance = 0;
    ags.forEach(function (ag) {
      const enPlan = (video.planes || []).indexOf(ag.plan) !== -1;
      if (!enPlan) return;
      ag.plantel.forEach(function (p) {
        const av = avanceDe(p, esc);
        const aprobado = av.aprobados.some(function (x) { return x.modulo.numero === video.modulo; });
        const enCurso = av.enCurso && av.enCurso.modulo.numero === video.modulo;
        if (!aprobado && !enCurso) return;
        alcance++;
        const s = D.semillaUso(p.id + ":" + video.id);
        /* Quien aprobó el módulo vio casi todo; quien lo tiene en curso, parte. */
        const vio = aprobado ? s < 0.88 : s < 0.45;
        aperturas += 1 + Math.floor(s * 3);
        if (vio) reproducciones++;
      });
    });
    return { aperturas: aperturas, reproducciones: reproducciones, alcance: alcance };
  }

  /* Los agregados por módulo: qué porcentaje de agencias lo completó y cuál es
     su tasa de reprobación. La tasa de reprobación es la señal de CONTENIDO a
     revisar: si un módulo se reprueba mucho, el problema suele estar en el video
     o en las preguntas, no en la gente. */
  function usoDeModulo(modulo, escenaId) {
    const esc = escenaId || escena;
    const ags = agencias(esc);
    let personasEnPlan = 0;
    let aprobaron = 0;
    let intentos = 0;
    let agenciasCompletas = 0;
    let agenciasEnPlan = 0;

    ags.forEach(function (ag) {
      if ((modulo.planes || []).indexOf(ag.plan) === -1) return;
      agenciasEnPlan++;
      let todas = ag.plantel.length > 0;
      ag.plantel.forEach(function (p) {
        personasEnPlan++;
        const av = avanceDe(p, esc);
        const x = av.aprobados.filter(function (y) { return y.modulo.numero === modulo.numero; })[0];
        if (x) {
          aprobaron++;
          intentos += x.intentos;
        } else {
          todas = false;
        }
      });
      if (todas) agenciasCompletas++;
    });

    /* Reprobación = intentos que no aprobaron sobre intentos totales. Con
       reintentos ilimitados, cada aprobación de 3 intentos deja 2 reprobados. */
    const reprobados = intentos - aprobaron;
    return {
      modulo: modulo,
      personasEnPlan: personasEnPlan,
      aprobaron: aprobaron,
      intentos: intentos,
      agenciasEnPlan: agenciasEnPlan,
      agenciasCompletas: agenciasCompletas,
      pctAgencias: agenciasEnPlan ? Number(((agenciasCompletas / agenciasEnPlan) * 100).toFixed(2)) : 0,
      tasaReprobacion: intentos ? Number(((reprobados / intentos) * 100).toFixed(2)) : 0,
    };
  }

  /* El resumen de operación que consume el Home en E6. */
  function operacion(escenaId) {
    const esc = escenaId || escena;
    const ags = agencias(esc);
    const plantel = ags.reduce(function (acc, a) { return acc.concat(a.plantel); }, []);
    let certificadas = 0;
    let aprobacionesTotales = 0;
    let intentosTotales = 0;
    plantel.forEach(function (p) {
      const av = avanceDe(p, esc);
      if (av.certificada) certificadas++;
      aprobacionesTotales += av.aprobados.length;
      av.aprobados.forEach(function (x) { intentosTotales += x.intentos; });
    });
    /* Una Meet de 30 min por módulo POR AGENCIA, al aprobarlo: es el techo que
       define la carga operativa de Soporte. */
    const meets = ags.reduce(function (acc, ag) {
      return acc + catalogo().filter(function (m) {
        return m.tipo === "biblioteca" &&
          moduloEstado(m, esc) === "activo" &&
          (m.planes || []).indexOf(ag.plan) !== -1;
      }).length;
    }, 0);
    return {
      agencias: ags.length,
      personas: plantel.length,
      certificadas: certificadas,
      aprobaciones: aprobacionesTotales,
      intentos: intentosTotales,
      tasaReprobacion: intentosTotales
        ? Number((((intentosTotales - aprobacionesTotales) / intentosTotales) * 100).toFixed(2))
        : 0,
      meetsDisponibles: meets,
      corte: (D.uso || {}).corteISO || null,
    };
  }

  /* -- Verificación --------------------------------------------------------
     Reemplaza los greps manuales de coherencia numérica. Corre en la consola
     del navegador o en node. Devuelve `{ok, fallas, controles}`.

     Audita SIEMPRE el dataset limpio, aunque la sesión tenga cambios encima:
     lo que se verifica es el compromiso del prototipo, no lo que alguien tocó
     mirando la pantalla. Sin esto, dar de alta un video haría fallar «los 55
     videos» y el informe pasaría a medir la sesión en vez del dato. */
  function verificar() {
    ignorarOverlay = true;
    try {
      return auditar();
    } finally {
      ignorarOverlay = false;
    }
  }

  function auditar() {
    const fallas = [];
    const controles = [];
    /* El detalle solo se muestra cuando el control falla: si no, «28 ≠ 28» se
       lee como un error en un control que pasó. */
    const chequeo = function (nombre, ok, detalle) {
      controles.push({ nombre: nombre, ok: !!ok, detalle: ok ? null : detalle });
      if (!ok) fallas.push(nombre + (detalle ? " — " + detalle : ""));
    };

    /* Informativo, no un control: `ok: null` ya es el marcador de salteado. Que
       figure primero es lo que evita leer «✓ sin fallas» y creer que también se
       verificó lo que se está viendo en pantalla. */
    const cambios = hayCambios();
    if (cambios) {
      controles.push({
        nombre: "Overlay activo en " + escena + " — se audita el dataset limpio",
        ok: null,
        detalle: cambios + (cambios === 1 ? " cambio" : " cambios") + " en esta escena",
      });
    }

    /* Contrato de los conteos por escena. Estos números son el compromiso del
       prototipo: si cambian, cambió el relato, no un detalle. */
    const ESPERADO = {
      E2: { backlog: 55 },
      E3: { backlog: 43, guionado: 4, editado: 6, publicado: 2 },
      E4: { backlog: 43, publicado: 12 },
      E5: { backlog: 14, guionado: 4, grabado: 2, editado: 2, publicado: 29, "a regrabar": 3, obsoleto: 1 },
      E6: { publicado: 51, "a regrabar": 3, obsoleto: 1 },
    };

    chequeo("Los 55 videos del mapa", padron().length === 55, padron().length + " videos");
    chequeo("Los 13 módulos", D.modulos.length === 13, D.modulos.length + " módulos");
    chequeo("Las 31 secciones",
      D.modulos.reduce(function (a, m) { return a + m.secciones.length; }, 0) === 31);
    chequeo("Los 20 cohortes", D.cohortes.length === 20);

    Object.keys(ESPERADO).forEach(function (esc) {
      const c = conteoPorEstado(esc);
      const total = ESTADOS.reduce(function (a, e) { return a + c[e]; }, 0);
      chequeo(esc + " · los 55 videos presentes", total === 55, "suman " + total);
      const dif = ESTADOS.filter(function (e) {
        return (c[e] || 0) !== (ESPERADO[esc][e] || 0);
      });
      chequeo(esc + " · conteo por estado", dif.length === 0,
        dif.map(function (e) { return e + ": " + c[e] + " ≠ " + (ESPERADO[esc][e] || 0); }).join(", "));
    });

    /* Monotonía temporal: entre escenas sucesivas el estado solo puede avanzar. */
    const secuencia = D.ESCENAS.map(function (e) { return e.id; }).filter(function (e) { return e !== "E1"; });
    const retrocesos = [];
    videos.forEach(function (v) {
      for (let i = 1; i < secuencia.length; i++) {
        const antes = rango(estadoDe(v, secuencia[i - 1]));
        const despues = rango(estadoDe(v, secuencia[i]));
        if (despues < antes) {
          retrocesos.push(v.id + " " + secuencia[i - 1] + "→" + secuencia[i]);
        }
      }
    });
    chequeo("Monotonía temporal · cero retrocesos", retrocesos.length === 0, retrocesos.join(", "));

    /* E4 · publicados por módulo: 2+3+3+3+1 = 12, y ningún módulo de biblioteca
       completo. Es el argumento visual de la Ruta Esencial. */
    const bib = D.modulos.filter(function (m) { return m.tipo === "biblioteca"; });
    const pubE4 = bib.map(function (m) { return resumenModulo(m, "E4"); });
    chequeo("E4 · 12 videos publicados",
      pubE4.reduce(function (a, r) { return a + r.publicados; }, 0) === 12);
    chequeo("E4 · ningún módulo de biblioteca completo",
      pubE4.every(function (r) { return r.publicados < r.totalVideos; }),
      pubE4.filter(function (r) { return r.publicados >= r.totalVideos; })
        .map(function (r) { return r.modulo.codigo; }).join(", "));

    /* Mínimos por módulo: el banco suma 50 y el sorteo suma exactamente 10. */
    bib.forEach(function (m) {
      const mins = D.minimosDeSeccion(m);
      const banco = mins.reduce(function (a, x) { return a + x.banco; }, 0);
      const sorteo = mins.reduce(function (a, x) { return a + x.sorteo; }, 0);
      chequeo(m.codigo + " · banco mínimo por sección suma " + D.evaluacion.bancoMinimoPorModulo,
        banco === D.evaluacion.bancoMinimoPorModulo, "suma " + banco);
      chequeo(m.codigo + " · mínimos por sorteo suman " + D.evaluacion.preguntasPorIntento,
        sorteo === D.evaluacion.preguntasPorIntento, "suma " + sorteo);
      chequeo(m.codigo + " · ninguna sección con sorteo 0",
        mins.every(function (x) { return x.sorteo >= 1; }));
    });

    /* El banco: 50 por módulo, y el acumulado por escena. Los cuatro números
       son el contrato del relato — 10 preguntas en el Mes 1, 60 en el hito de
       lanzamiento, 166 en régimen y las 550 con la Academia en operación. */
    if ((D.preguntas || []).length) {
      bib.forEach(function (m) {
        const b = bancoDe(m.numero, "E6");
        chequeo(m.codigo + " · banco completo en E6",
          b.length === D.evaluacion.bancoMinimoPorModulo, b.length + " preguntas");
      });
      const ACUMULADO = { E2: 0, E3: 10, E4: 60, E5: 166, E6: 550 };
      Object.keys(ACUMULADO).forEach(function (esc) {
        const n = D.modulos.reduce(function (a, m) {
          return a + (m.tipo === "biblioteca" ? bancoDe(m.numero, esc).length : 0);
        }, 0);
        chequeo(esc + " · preguntas en el banco", n === ACUMULADO[esc],
          n + " ≠ " + ACUMULADO[esc]);
      });
      /* El banco tampoco puede achicarse entre escenas sucesivas. */
      const bajas = [];
      bib.forEach(function (m) {
        for (let i = 1; i < secuencia.length; i++) {
          const antes = bancoDe(m.numero, secuencia[i - 1]).length;
          const despues = bancoDe(m.numero, secuencia[i]).length;
          if (despues < antes) bajas.push(m.codigo + " " + secuencia[i - 1] + "→" + secuencia[i]);
        }
      });
      chequeo("El banco no se achica entre escenas", bajas.length === 0, bajas.join(", "));

      /* Vigentes por módulo en E5: son los números del listado de módulos. */
      const VIGENTES_E5 = { 0: 25, 10: 35, 20: 22, 30: 20, 40: 30, 50: 0, 60: 12, 70: 9, 80: 0, 90: 0, 95: 0 };
      bib.forEach(function (m) {
        const r = resumenModulo(m, "E5");
        chequeo(m.codigo + " · vigentes en E5", r.banco.vigentes === VIGENTES_E5[m.numero],
          r.banco.vigentes + " ≠ " + VIGENTES_E5[m.numero]);
      });

      /* El sorteo: con el banco completo tiene que salir de 10; en E5, BAK-M30
         sale corto a propósito porque su sección 4 no tiene vigentes. */
      const sorteoE6 = sortear(30, "E6", function () { return 0.5; });
      chequeo("M30 · el sorteo sale completo con el banco lleno",
        sorteoE6 && sorteoE6.completo, sorteoE6 ? "salen " + sorteoE6.salen : "sin sorteo");
      const sorteoE5 = sortear(30, "E5", function () { return 0.5; });
      chequeo("M30 · en régimen el sorteo sale corto (8 de 10)",
        sorteoE5 && sorteoE5.salen === 8 && sorteoE5.cortas.length === 1,
        sorteoE5 ? "salen " + sorteoE5.salen + " de " + sorteoE5.pedidas : "sin sorteo");
    }

    /* Las 5 cadenas de BAK-M30, si el banco ya está cargado. */
    const m30 = modulosPorNumero[30];
    const b30 = bancoDe(30, "E5");
    if (b30.length) {
      const secs = seccionesDe(m30, "E5");
      const r30 = resumenModulo(m30, "E5");
      const suma = function (campo) {
        return secs.reduce(function (a, s) { return a + s[campo]; }, 0);
      };
      chequeo("M30 cadena 1 · preguntas por sección = total del módulo",
        suma("total") === r30.banco.total, suma("total") + " ≠ " + r30.banco.total);
      chequeo("M30 cadena 2 · total − a revisar − borradores = vigentes",
        r30.banco.total - r30.banco.aRevisar - r30.banco.borradores === r30.banco.vigentes);
      chequeo("M30 cadena 3 · faltantes por sección = faltante del módulo",
        suma("faltan") === r30.banco.faltan, suma("faltan") + " ≠ " + r30.banco.faltan);
      chequeo("M30 cadena 4 · banco mínimo por sección = mínimo del módulo",
        suma("minimoBanco") === r30.banco.minimo, suma("minimoBanco") + " ≠ " + r30.banco.minimo);
      chequeo("M30 cadena 5 · mínimos por sorteo = preguntas del intento",
        suma("minimoSorteo") === D.evaluacion.preguntasPorIntento);
      /* La regla que las une. */
      const s4 = secs[3];
      chequeo("M30 · al regrabar M30.060, la sección 4 queda sin vigentes",
        s4 && s4.vigentes === 0 && s4.aRevisar > 0,
        s4 ? s4.vigentes + " vigentes, " + s4.aRevisar + " a revisar" : "sin sección 4");
    } else {
      controles.push({ nombre: "Las 5 cadenas de BAK-M30", ok: null, detalle: "banco sin cargar todavía" });
    }

    /* R10 · no hay operación antes de E6. Es la regla que mantiene honesto al
       panel de obra: en las etapas de arranque no hay uso que medir, y si
       apareciera un número de uso sería inventado. */
    ["E1", "E2", "E3", "E4", "E5"].forEach(function (esc) {
      const op = operacion(esc);
      chequeo(esc + " · sin agencias con acceso", op.agencias === 0, op.agencias + " agencias");
      chequeo(esc + " · sin métricas de uso", op.intentos === 0 && op.aprobaciones === 0,
        op.intentos + " intentos");
    });
    if ((D.agencias || []).length) {
      const op6 = operacion("E6");
      chequeo("E6 · hay agencias con acceso", op6.agencias > 0);
      chequeo("E6 · hay uso registrado", op6.intentos > 0 && op6.aprobaciones > 0);
      chequeo("E6 · la tasa de reprobación es un porcentaje válido",
        op6.tasaReprobacion >= 0 && op6.tasaReprobacion <= 100, String(op6.tasaReprobacion));
      /* El avance de cada persona tiene que ser un PREFIJO de su recorrido: el
         desbloqueo es secuencial y no existe aprobar el 5 sin el 4. */
      const salteados = [];
      (D.personas || []).forEach(function (p) {
        const av = avanceDe(p, "E6");
        av.aprobados.forEach(function (x, i) {
          if (av.recorrido[i] !== x.modulo) salteados.push(p.id);
        });
      });
      chequeo("E6 · ningún avance saltea módulos del recorrido",
        salteados.length === 0, salteados.slice(0, 3).join(", "));
      /* Determinismo: dos lecturas seguidas tienen que dar lo mismo, o la demo
         cambia sola entre refrescos. */
      const a1 = JSON.stringify(operacion("E6"));
      const a2 = JSON.stringify(operacion("E6"));
      chequeo("E6 · el uso simulado es determinista", a1 === a2);
    }

    /* -- Jerarquía: superficie → módulo → sección → video -------------------
       La sección es estructural del lado agencia: con ella se arma el syllabus,
       el progreso parcial, el breadcrumb del reproductor y la devolución de la
       evaluación. Un video sin sección o un módulo sin secciones dejan el
       producto roto, no incompleto. */
    const bibliotecas = catalogo().filter(function (m) { return m.tipo === "biblioteca"; });

    /* El control que sostiene la regla de derivación. Si el orden que se deduce
       de la secuencia mínima no reproduce el que declara el dataset, la regla
       está mal y hay que enterarse acá, no después de importar. */
    const ordenRoto = [];
    bibliotecas.forEach(function (m) {
      const derivado = m.secciones.slice().sort(function (a, b) {
        return ordenDeSeccion(a) - ordenDeSeccion(b);
      });
      derivado.forEach(function (s, i) {
        if (s.orden !== i + 1) ordenRoto.push(m.codigo + " · " + s.titulo);
      });
    });
    chequeo("El orden de sección derivado de la secuencia mínima reproduce el dataset",
      ordenRoto.length === 0, ordenRoto.slice(0, 3).join(", "));

    const sinSeccion = padron().filter(function (v) { return !v.seccion; });
    chequeo("Ningún video sin sección",
      sinSeccion.length === 0, sinSeccion.map(function (v) { return v.id; }).slice(0, 3).join(", "));

    const sinSecciones = bibliotecas.filter(function (m) {
      return !m.secciones || !m.secciones.length;
    });
    chequeo("Ningún módulo de biblioteca sin secciones",
      sinSecciones.length === 0, sinSecciones.map(function (m) { return m.codigo; }).join(", "));

    /* La cuota por video es orientativa, pero no puede inventar un total
       distinto al que se exige: por sección tiene que sumar el mínimo exacto. */
    const cuotaRota = [];
    bibliotecas.forEach(function (m) {
      const minimos = D.minimosDeSeccion(m);
      m.secciones.forEach(function (s, i) {
        const suma = (s.videos || []).reduce(function (acc, v) {
          return acc + cuotaDeVideo(porId[m.codigo + "." + String(v.secuencia).padStart(3, "0")], "E6");
        }, 0);
        const esperado = (minimos[i] || { banco: 0 }).banco;
        if (suma !== esperado) cuotaRota.push(m.codigo + " · " + s.titulo + ": " + suma + " ≠ " + esperado);
      });
    });
    chequeo("La cuota por video suma el mínimo de su sección",
      cuotaRota.length === 0, cuotaRota.slice(0, 3).join(" · "));

    /* La cola solo ofrece trabajo que se puede hacer hoy. Un video que no llegó
       a publicado no tiene preguntas que escribir: ofrecerlas sería pedir que se
       evalúe algo que todavía no existe. */
    const colaMal = [];
    D.ESCENAS.forEach(function (e) {
      colaDeEscritura(e.id).forEach(function (f) {
        if (f.video.estado !== "publicado" && f.video.estado !== "a regrabar") {
          colaMal.push(e.id + " · " + f.video.id + " (" + f.video.estado + ")");
        }
      });
    });
    chequeo("La cola no lista videos que no llegaron a publicado",
      colaMal.length === 0, colaMal.slice(0, 3).join(", "));

    /* -- Integridad de lo creado en el overlay ------------------------------
       Estos controles sí miran la sesión: son lo único que puede detectar un
       alta mal formada, y una entidad rota se ve igual que una sana hasta que
       una pantalla la intenta pintar. */
    if (cambios) {
      const creados = videos.filter(function (v) { return !delDataset(v); });
      const sinCampos = creados.filter(function (v) {
        return !v.titulo || !v.cohorte || typeof v.secuencia !== "number";
      });
      chequeo("Overlay · los videos creados tienen título, cohorte y secuencia",
        sinCampos.length === 0, sinCampos.map(function (v) { return v.id; }).slice(0, 3).join(", "));

      /* Un ID duplicado no se puede detectar mirando `porId`, que ya colapsó
         los dos en una sola entrada: hay que contar sobre el array. */
      const vistos = {};
      const repetidos = [];
      videos.forEach(function (v) {
        if (vistos[v.id]) repetidos.push(v.id);
        vistos[v.id] = true;
      });
      chequeo("Overlay · ningún ID creado pisa uno del dataset",
        repetidos.length === 0, repetidos.slice(0, 3).join(", "));

      const huerfanas = preguntas.filter(function (p) {
        return p.videoOrigen && !porId[p.videoOrigen];
      });
      chequeo("Overlay · ninguna pregunta apunta a un video inexistente",
        huerfanas.length === 0, huerfanas.map(function (p) { return p.id; }).slice(0, 3).join(", "));

      const modsRotos = modulos.filter(function (m) {
        return !m.codigo || !m.titulo || m.numero === undefined;
      });
      chequeo("Overlay · los módulos creados tienen código, título y número",
        modsRotos.length === 0, modsRotos.length + " módulos");

      /* La invariante que cierra el agujero: ninguna vía de alta —import, alta
         de módulo, alta de videos— puede dejar un video sin sección. Del lado
         agencia un video sin sección no se puede ubicar en el syllabus. */
      const creadosSinSeccion = creados.filter(function (v) { return !v.seccion; });
      chequeo("Overlay · ningún video creado quedó sin sección",
        creadosSinSeccion.length === 0,
        creadosSinSeccion.map(function (v) { return v.id; }).slice(0, 3).join(", "));
    }

    return { ok: fallas.length === 0, fallas: fallas, controles: controles };
  }

  /* Volcado legible para la consola. */
  function informe() {
    const r = verificar();
    r.controles.forEach(function (c) {
      const marca = c.ok === null ? "·" : c.ok ? "✓" : "✗";
      /* eslint-disable-next-line no-console */
      console.log("  " + marca + " " + c.nombre + (c.detalle ? "  (" + c.detalle + ")" : ""));
    });
    /* eslint-disable-next-line no-console */
    console.log(r.ok ? "\n✓ sin fallas" : "\n✗ " + r.fallas.length + " fallas");
    return r;
  }

  return {
    /* Escena activa */
    escena: escena,
    escenaInvalida: escenaInvalida,
    escenas: D.ESCENAS,
    orden: orden,
    alcanzada: alcanzada,
    param: param,

    /* Catálogo */
    modulos: modulos,
    modulo: function (numero) { return modulosPorNumero[numero] || null; },
    cohortes: D.cohortes,
    superficies: D.superficies.concat(nuevos.superficies),
    planes: D.planes,
    evaluacion: D.evaluacion,
    estandarGrabacion: D.estandarGrabacion,
    ESTADOS: ESTADOS,

    /* Videos */
    videos: todos,
    video: function (id, escenaId) { return porId[id] ? conEstado(porId[id], escenaId) : null; },
    videosDe: videosDe,
    estadoDe: estadoDe,
    visibleEnFront: visibleEnFront,
    rango: rango,

    /* Módulos, secciones, banco */
    resumenModulo: resumenModulo,
    configEvaluacion: configEvaluacion,
    seccionesDe: seccionesDe,
    ordenDeSeccion: ordenDeSeccion,
    cuotaDeVideo: cuotaDeVideo,
    colaDeEscritura: colaDeEscritura,
    bancoDe: bancoDe,
    aptitud: aptitud,
    videosDeRuta: videosDeRuta,
    deudaDeEvaluacion: deudaDeEvaluacion,
    versionesDe: versionesDe,
    ubicacionesDe: ubicacionesDe,
    checklistDe: checklistDe,
    guionDe: guionDe,
    cadenaDe: cadenaDe,
    moduloMasCerca: moduloMasCerca,

    /* Operación · solo desde E6 */
    agencias: agencias,
    recorridoDe: recorridoDe,
    avanceDe: avanceDe,
    usoDeVideo: usoDeVideo,
    usoDeModulo: usoDeModulo,
    operacion: operacion,

    /* Evaluación */
    sortear: sortear,

    /* Agregados */
    conteoPorEstado: conteoPorEstado,
    embudo: embudo,
    cohortesConAvance: cohortesConAvance,

    /* Overlay */
    anotar: anotar,
    anotado: anotado,
    crear: crear,
    borrar: borrar,
    hayCambios: hayCambios,
    idLibre: idLibre,
    reset: function () {
      if (!almacen) return;
      Object.keys(almacen)
        .filter(function (k) { return k.indexOf(PREFIJO) === 0; })
        .forEach(function (k) { almacen.removeItem(k); });
    },

    /* Verificación */
    verificar: verificar,
    informe: informe,
  };
})();
