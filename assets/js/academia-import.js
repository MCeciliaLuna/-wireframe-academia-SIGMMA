/* ══════════════════════════════════════════════════════════════════════════
   academia-import.js · La planilla del mapa de contenido

   Emite la plantilla, lee la planilla completada y arma el plan de alta. Va
   aparte de `academia-sim.js` porque el motor ya es el archivo más grande del
   repo, y se carga SOLO en `importador.html`: ninguna otra pantalla lo necesita.

   Dos límites que no se negocian:

     · NO persiste nada por su cuenta. Valida y devuelve un plan; el único que
       escribe en el almacén del navegador es el motor. El control de disciplina
       tiene que seguir señalando un solo archivo, y ese archivo es el motor.
     · NO hace pedidos de red, de ninguna clase. El archivo lo elige la persona y
       se lee con `FileReader`, o se pega a mano; la descarga sale por `Blob`.
       Así sigue andando por doble click sobre `file://`.

   ALTA + ALTA INCREMENTAL, NUNCA ACTUALIZACIÓN. Una fila cuyo ID ya existe se
   OMITE y se dice por qué. Un video publicado tiene guion, preguntas y agencias
   que lo vieron colgando: una planilla no puede tener autoridad sobre eso.

   Qué NO se pide, y por qué:

     · Se deduce del ID o del contenido — superficie, número de módulo,
       secuencia, orden del módulo, orden de la sección y la prioridad (la
       define el cohorte). Pedirlo sería invitar a que se contradigan.
     · Nace del trabajo — estado, link, duración, versión y guion. Los videos
       nacen en `backlog` sin link y sin versión (R11): el mapa trae identidad,
       no producción.
     · Las preguntas NO se importan nunca. Se escriben después de grabar cada
       video, para que usen su mismo lenguaje y su mismo ejemplo.

   Global `IMPORT`, IIFE, sin módulos ES.
   ══════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  const D = window.ACADEMIA_DATA;
  const S = window.SIM;

  /* Los tres tags del mapa de contenido contra los tres planes comerciales.
     La equivalencia no se inventa: sale de los conjuntos que ya usa el dataset
     —10 módulos con los tres planes, 1 con Business+Corporate, 1 solo
     Corporate—, que son exactamente los tres tags del documento fuente. */
  const TAGS = [
    { tag: "P+B", planes: ["Professional", "Business", "Corporate"] },
    { tag: "B", planes: ["Business", "Corporate"] },
    { tag: "B-nicho", planes: ["Corporate"] },
  ];

  const COL_VIDEOS = ["id", "modulo", "seccion", "titulo", "plan", "cohorte"];
  const COL_COHORTES = ["cohorte", "nombre", "prioridad", "escenario"];

  /* `BAK-M30.050` — superficie, módulo y secuencia en un solo dato. El ID es la
     identidad permanente del video (R2) y sobrevive al regrabado. */
  const RE_ID = /^([A-Z]{3})-M(\d{2})\.(\d{3})$/;

  /* ── Tags de plan ─────────────────────────────────────────────────────── */

  function tagDe(planes) {
    const clave = (planes || []).slice().sort().join("|");
    let salida = null;
    TAGS.forEach(function (t) {
      if (t.planes.slice().sort().join("|") === clave) salida = t.tag;
    });
    return salida;
  }

  function planesDe(tag) {
    const buscado = normalizar(tag);
    let salida = null;
    TAGS.forEach(function (t) {
      if (normalizar(t.tag) === buscado) salida = t.planes.slice();
    });
    return salida;
  }

  /* ── Texto ────────────────────────────────────────────────────────────── */

  function normalizar(s) {
    return String(s === undefined || s === null ? "" : s)
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  /* Sheets exporta con coma, `UI.exportarCSV` escribe con punto y coma, y
     alguien puede pegar desde una tabla, que llega con tabulador. Se detecta
     sobre el encabezado, que es la línea que no puede tener texto libre. */
  function separadorDe(linea) {
    let mejor = ";";
    let max = -1;
    [";", ",", "\t"].forEach(function (c) {
      const n = linea.split(c).length;
      if (n > max) { max = n; mejor = c; }
    });
    return mejor;
  }

  function parsearCSV(texto) {
    const limpio = String(texto || "")
      .replace(/^\uFEFF/, "")
      .replace(/\r\n?/g, "\n")
      .trim();
    if (!limpio) return [];

    const sep = separadorDe(limpio.split("\n")[0]);
    const filas = [];
    let fila = [];
    let campo = "";
    let enComillas = false;

    for (let i = 0; i < limpio.length; i++) {
      const ch = limpio.charAt(i);
      if (enComillas) {
        if (ch === '"') {
          if (limpio.charAt(i + 1) === '"') { campo += '"'; i++; }
          else enComillas = false;
        } else campo += ch;
      } else if (ch === '"') {
        enComillas = true;
      } else if (ch === sep) {
        fila.push(campo); campo = "";
      } else if (ch === "\n") {
        fila.push(campo); filas.push(fila); fila = []; campo = "";
      } else {
        campo += ch;
      }
    }
    fila.push(campo);
    filas.push(fila);
    return filas;
  }

  /* Cada fila queda con `_fila`: el número de línea de la planilla, contando el
     encabezado. Sin eso, «falta la sección» obliga a adivinar dónde. */
  function aObjetos(filas) {
    if (!filas.length) return [];
    const cabecera = filas[0].map(normalizar);
    return filas.slice(1)
      .filter(function (f) { return f.join("").trim() !== ""; })
      .map(function (f, i) {
        const o = { _fila: i + 2 };
        cabecera.forEach(function (col, k) {
          if (col) o[col] = String(f[k] === undefined ? "" : f[k]).trim();
        });
        return o;
      });
  }

  function aTexto(hoja) {
    const escapar = function (v) {
      const s = String(v === undefined || v === null ? "" : v);
      return /[;\n"]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
    };
    return [hoja.encabezados].concat(hoja.filas)
      .map(function (f) { return f.map(escapar).join(";"); })
      .join("\n");
  }

  /* ── La plantilla que emite el sistema ────────────────────────────────── */

  /* La planilla maestra no existe todavía, así que el sistema la entrega. Las
     55 filas salen del mapa de contenido ya cargado: quien la recibe revisa y
     agrupa, no transcribe.

     Ordenada por módulo → sección → secuencia, NO por ID. En `BAK-M30` y
     `BAK-M70` las secciones no son bloques contiguos de secuencia: ordenada por
     ID, la columna `seccion` «vuelve atrás» y parece un error a quien valida. */
  function plantilla(opciones) {
    const o = opciones || {};
    /* Por defecto la columna `seccion` viaja con la agrupación que ya propone
       el prototipo, para que Guillermo y Majo VALIDEN una propuesta en vez de
       inventarla desde cero. Con `{ seccionVacia: true }` sale en blanco. */
    const conSeccion = !o.seccionVacia;

    const filasVideos = [];
    S.modulos
      .filter(function (m) { return m.tipo === "biblioteca"; })
      .slice()
      .sort(function (a, b) { return a.orden - b.orden; })
      .forEach(function (m) {
        m.secciones.slice()
          .sort(function (a, b) { return S.ordenDeSeccion(a) - S.ordenDeSeccion(b); })
          .forEach(function (s) {
            (s.videos || []).slice()
              .sort(function (a, b) { return a.secuencia - b.secuencia; })
              .forEach(function (v) {
                const id = m.codigo + "." + String(v.secuencia).padStart(3, "0");
                filasVideos.push([
                  id,
                  m.titulo,
                  conSeccion ? s.titulo : "",
                  v.titulo,
                  tagDe(v.planes || m.planes) || "",
                  v.cohorte || "",
                ]);
              });
          });
      });

    const filasCohortes = S.cohortes.map(function (c) {
      return [c.id, c.nombre || "", c.prioridad || "", c.escenario || ""];
    });

    return {
      videos: { nombre: "mapa-videos", encabezados: COL_VIDEOS.slice(), filas: filasVideos },
      cohortes: { nombre: "plan-cohortes", encabezados: COL_COHORTES.slice(), filas: filasCohortes },
    };
  }

  /* ── Lectura y validación ─────────────────────────────────────────────── */

  function faltanColumnas(filas, requeridas) {
    if (!filas.length) return requeridas.slice();
    const presentes = Object.keys(filas[0]);
    return requeridas.filter(function (c) { return presentes.indexOf(c) === -1; });
  }

  function leer(textoVideos, textoCohortes) {
    const errores = [];
    const avisos = [];
    const omitir = [];
    const crear = { modulos: [], secciones: [], videos: [], cohortes: [] };

    const error = function (fila, que, valor) {
      errores.push({ fila: fila, motivo: que, valor: valor === undefined ? null : valor });
    };

    /* ── Hoja de cohortes ── */
    const filasCohortes = aObjetos(parsearCSV(textoCohortes));
    const cohortesConocidos = {};
    S.cohortes.forEach(function (c) { cohortesConocidos[c.id] = c; });

    if (filasCohortes.length) {
      const faltan = faltanColumnas(filasCohortes, COL_COHORTES);
      if (faltan.length) {
        error(1, "la hoja de cohortes no tiene la columna «" + faltan[0] + "»");
      } else {
        filasCohortes.forEach(function (f) {
          const id = (f.cohorte || "").toUpperCase();
          if (!id) return error(f._fila, "cohorte sin identificador");
          if (cohortesConocidos[id]) return;
          const nuevo = {
            id: id,
            nombre: f.nombre || null,
            prioridad: (f.prioridad || "").toUpperCase() || null,
            escenario: f.escenario || null,
            nota: null,
          };
          cohortesConocidos[id] = nuevo;
          crear.cohortes.push(nuevo);
        });
      }
    }

    /* ── Hoja de videos ── */
    const filasVideos = aObjetos(parsearCSV(textoVideos));
    if (!filasVideos.length) {
      error(0, "no se leyó ninguna fila de video");
      return armar(crear, omitir, errores, avisos, 0, filasCohortes.length);
    }
    const faltanV = faltanColumnas(filasVideos, COL_VIDEOS);
    if (faltanV.length) {
      error(1, "la hoja de videos no tiene la columna «" + faltanV[0] + "»");
      return armar(crear, omitir, errores, avisos, filasVideos.length, filasCohortes.length);
    }

    const superficies = {};
    S.superficies.forEach(function (s) { superficies[s.codigo] = true; });

    const modulosPorCodigo = {};
    S.modulos.forEach(function (m) { modulosPorCodigo[m.codigo] = m; });

    const vistos = {};           /* IDs ya leídos en este archivo             */
    const nombreDeModulo = {};   /* codigo → nombre, para detectar conflictos */
    const acumulado = {};        /* codigo → { titulo, filas: [] }            */

    filasVideos.forEach(function (f) {
      const id = (f.id || "").toUpperCase();
      const m = RE_ID.exec(id);
      if (!m) return error(f._fila, "el ID no tiene la forma BAK-M30.050", f.id || "");
      if (!superficies[m[1]]) return error(f._fila, "superficie desconocida", m[1]);
      if (vistos[id]) return error(f._fila, "el ID está repetido en el archivo", id);
      vistos[id] = true;

      const nombreModulo = (f.modulo || "").trim();
      if (!nombreModulo) return error(f._fila, "falta el nombre del módulo", id);

      const seccion = (f.seccion || "").trim();
      if (!seccion) return error(f._fila, "falta la sección", id);

      const titulo = (f.titulo || "").trim();
      if (!titulo) return error(f._fila, "falta el título del video", id);

      const cohorte = (f.cohorte || "").toUpperCase().trim();
      if (!cohorte) return error(f._fila, "falta el cohorte", id);
      if (!cohortesConocidos[cohorte]) {
        return error(f._fila, "el cohorte no existe ni viene en la hoja de cohortes", cohorte);
      }

      const planes = planesDe(f.plan);
      if (!planes) return error(f._fila, "tag de plan desconocido (P+B, B o B-nicho)", f.plan || "");

      const codigoModulo = m[1] + "-M" + m[2];
      if (nombreDeModulo[codigoModulo] && nombreDeModulo[codigoModulo] !== nombreModulo) {
        return error(f._fila, "el módulo " + codigoModulo + " aparece con dos nombres distintos", nombreModulo);
      }
      nombreDeModulo[codigoModulo] = nombreModulo;

      /* Alta incremental: lo que ya existe no se toca, se dice. */
      if (!S.idLibre(id)) {
        omitir.push({ fila: f._fila, id: id, motivo: "ya existe" });
        return;
      }

      const bolsa = acumulado[codigoModulo] ||
        (acumulado[codigoModulo] = { codigo: codigoModulo, superficie: m[1], numero: parseInt(m[2], 10), titulo: nombreModulo, filas: [] });
      bolsa.filas.push({
        id: id,
        secuencia: parseInt(m[3], 10),
        titulo: titulo,
        seccion: seccion,
        cohorte: cohorte,
        planes: planes,
        tag: normalizar(f.plan),
        fila: f._fila,
      });
    });

    /* ── Módulos, secciones y videos ── */
    Object.keys(acumulado).forEach(function (codigo) {
      const bolsa = acumulado[codigo];
      const existente = modulosPorCodigo[codigo];

      /* El tag mayoritario define los planes del módulo; el que difiere queda
         como tag propio del video —el caso de `BAK-M80.030`, que sin esto
         obligaría a que el módulo entero fuera Business. */
      const cuenta = {};
      bolsa.filas.forEach(function (f) { cuenta[f.tag] = (cuenta[f.tag] || 0) + 1; });
      let mayoritario = null;
      Object.keys(cuenta).forEach(function (t) {
        if (!mayoritario || cuenta[t] > cuenta[mayoritario]) mayoritario = t;
      });
      const planesModulo = existente ? existente.planes : planesDe(mayoritario);

      if (!existente) {
        crear.modulos.push({
          numero: bolsa.numero,
          codigo: codigo,
          titulo: bolsa.titulo,
          tipo: "biblioteca",
          /* El orden curricular se deduce del número: M00 antes que M10. */
          orden: ordenCurricular(bolsa.numero, crear.modulos, S.modulos),
          planes: planesModulo,
          activadoEn: null,
          secciones: [],
        });
      }

      /* Secciones: se ordenan por la secuencia más baja de sus videos, así el
         orden de las filas de la planilla no puede cambiar el syllabus. */
      const porSeccion = {};
      bolsa.filas.forEach(function (f) {
        const s = porSeccion[f.seccion] || (porSeccion[f.seccion] = { titulo: f.seccion, min: f.secuencia, secuencias: [] });
        if (f.secuencia < s.min) s.min = f.secuencia;
        s.secuencias.push(f.secuencia);
      });

      const yaExisten = {};
      let ultimoOrden = 0;
      if (existente) {
        existente.secciones.forEach(function (s) {
          yaExisten[s.titulo] = true;
          if (s.orden > ultimoOrden) ultimoOrden = s.orden;
        });
      }

      Object.keys(porSeccion)
        .map(function (t) { return porSeccion[t]; })
        .sort(function (a, b) { return a.min - b.min; })
        .forEach(function (s, i) {
          /* Una sección con videos salteados no es un error, pero conviene que
             quien valida la planilla lo vea rotulado: en `BAK-M30` y `BAK-M70`
             pasa de verdad, y ordenada por ID la columna parece equivocada. */
          const orden = s.secuencias.slice().sort(function (a, b) { return a - b; });
          const contigua = orden.every(function (v, k) { return k === 0 || v === orden[k - 1] + 10; });
          if (!contigua) {
            avisos.push({
              motivo: "la sección «" + s.titulo + "» de " + codigo + " tiene videos no contiguos",
              valor: orden.join(", "),
            });
          }

          if (yaExisten[s.titulo]) return;
          if (existente && existente.secciones.length) {
            /* El módulo ya tiene secciones y el overlay no puede renumerar las
               del dataset: la nueva va al final. Se avisa, porque si sus videos
               son de secuencia baja el orden derivado la habría puesto antes. */
            ultimoOrden++;
            avisos.push({
              motivo: "la sección «" + s.titulo + "» se agrega al final de " + codigo,
              valor: "orden " + ultimoOrden,
            });
            crear.secciones.push({ codigoModulo: codigo, titulo: s.titulo, orden: ultimoOrden });
          } else {
            crear.secciones.push({ codigoModulo: codigo, titulo: s.titulo, orden: i + 1 });
          }
        });

      bolsa.filas
        .sort(function (a, b) { return a.secuencia - b.secuencia; })
        .forEach(function (f) {
          /* Un módulo `reservado` no declara planes: ahí el tag del video es lo
             único que hay, así que se guarda propio en vez de perderse. Se avisa
             solo cuando hay divergencia real con el módulo —el caso de
             `BAK-M80.030`—, no cuando no hay con qué comparar. */
          const propio = !planesModulo || f.planes.join("|") !== planesModulo.join("|");
          if (propio && planesModulo) {
            avisos.push({
              motivo: f.id + " tiene un tag de plan distinto al de su módulo",
              valor: f.planes.join(" · "),
            });
          }
          crear.videos.push({
            codigoModulo: codigo,
            seccion: f.seccion,
            secuencia: f.secuencia,
            titulo: f.titulo,
            cohorte: f.cohorte,
            /* R11: nacen en `backlog`, sin link y sin versión. La duración real
               sale del rodaje, no del mapa. */
            duracion: null,
            planes: propio ? f.planes : null,
          });
        });
    });

    return armar(crear, omitir, errores, avisos, filasVideos.length, filasCohortes.length);
  }

  /* El orden curricular de un módulo nuevo: su posición por número entre todos
     los que va a haber. M00 antes que M10, sin pedirlo como columna. */
  function ordenCurricular(numero, nuevos, existentes) {
    const numeros = [];
    existentes.forEach(function (m) {
      if (m.tipo === "biblioteca" && typeof m.numero === "number") numeros.push(m.numero);
    });
    nuevos.forEach(function (m) { numeros.push(m.numero); });
    numeros.push(numero);
    numeros.sort(function (a, b) { return a - b; });
    return numeros.indexOf(numero) + 1;
  }

  function armar(crear, omitir, errores, avisos, leidasVideos, leidasCohortes) {
    return {
      crear: crear,
      omitir: omitir,
      errores: errores,
      avisos: avisos,
      leidas: { videos: leidasVideos, cohortes: leidasCohortes },
      total: crear.modulos.length + crear.secciones.length + crear.videos.length + crear.cohortes.length,
      /* Con bloqueantes no se confirma. Y sin nada que crear tampoco: un botón
         que se puede apretar y no hace nada es un bug, no una maqueta. */
      aplicable: errores.length === 0 && (crear.modulos.length + crear.secciones.length + crear.videos.length + crear.cohortes.length) > 0,
    };
  }

  /* ── Aplicar ──────────────────────────────────────────────────────────── */

  /* Todo o nada: una jerarquía a medias es peor que no haber importado, porque
     no se sabe dónde quedó. El orden importa —cohortes y módulos antes que las
     secciones, y las secciones antes que los videos— porque la materialización
     ubica cada entidad colgando de la anterior.

     El sello viaja después por la URL. Es lo que permite deshacer exactamente
     esta importación sin tocar nada más, con `SIM.borrar()`, que solo puede
     sacar lo creado en el overlay: el dataset no corre riesgo. */
  function aplicar(plan) {
    if (!plan || !plan.aplicable) return null;
    const sello = "imp-" + S.escena + "-" + Date.now().toString(36);
    const sellar = function (x) { return Object.assign({}, x, { importadoEn: sello }); };

    plan.crear.cohortes.forEach(function (c) { S.crear("cohortes", sellar(c)); });
    plan.crear.modulos.forEach(function (m) { S.crear("modulos", sellar(m)); });
    plan.crear.secciones.forEach(function (s) { S.crear("secciones", sellar(s)); });
    plan.crear.videos.forEach(function (v) { S.crear("videos", sellar(v)); });
    return sello;
  }

  /* Deshacer. No revive lo omitido —lo que ya existía sigue existiendo— y no se
     ofrece si sobre lo importado ya se trabajó: borrar un video que tiene guion,
     link o preguntas se lleva ese trabajo puesto. */
  function loImportado(sello) {
    return S.videos().filter(function (v) { return v.importadoEn === sello; });
  }

  function sePuedeDeshacer(sello) {
    if (!sello) return { puede: false, motivo: "no hay ninguna importación reciente" };
    const vs = loImportado(sello);
    if (!vs.length) return { puede: false, motivo: "no quedó nada de esa importación" };
    const trabajados = vs.filter(function (v) {
      return v.estado !== "backlog" || S.guionDe(v) || (S.bancoDe(v.modulo) || []).some(function (p) {
        return p.videoOrigen === v.id;
      });
    });
    if (trabajados.length) {
      return {
        puede: false,
        motivo: trabajados.length + (trabajados.length === 1 ? " video importado ya tiene trabajo encima" : " videos importados ya tienen trabajo encima"),
      };
    }
    return { puede: true, motivo: null };
  }

  function deshacer(sello) {
    if (!sePuedeDeshacer(sello).puede) return 0;
    const pred = function (x) { return x && x.importadoEn === sello; };
    return ["videos", "secciones", "modulos", "cohortes"].reduce(function (n, t) {
      return n + S.borrar(t, pred);
    }, 0);
  }

  window.IMPORT = {
    COL_VIDEOS: COL_VIDEOS,
    COL_COHORTES: COL_COHORTES,
    TAGS: TAGS,
    tagDe: tagDe,
    planesDe: planesDe,
    plantilla: plantilla,
    aTexto: aTexto,
    parsearCSV: parsearCSV,
    leer: leer,
    aplicar: aplicar,
    loImportado: loImportado,
    sePuedeDeshacer: sePuedeDeshacer,
    deshacer: deshacer,
  };
})();
