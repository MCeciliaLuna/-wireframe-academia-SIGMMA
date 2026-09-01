/* ============================================================================
   Academia SIGMMA · Backoffice — helpers de markup
   ----------------------------------------------------------------------------
   Emite el MISMO markup que antes estaba escrito a mano en los `.html`: las
   mismas clases, los mismos atributos, la misma estructura. Esto no rediseña
   nada — mueve el markup de literal a generado, para que los datos vivan en un
   solo lugar y los agregados se puedan derivar.

   No tiene reglas de negocio: todo lo que es cálculo está en `academia-sim.js`.
   Acá solo se arma HTML a partir de lo que el motor ya resolvió.

   Cada página lo usa desde su script inline, que corre durante el parseo. El
   `renderIcons()` de `icons.js` hidrata los iconos generados en el
   `DOMContentLoaded` posterior, y `ui.js` cablea las solapas, el orden de tabla
   y la selección múltiple sobre las filas ya generadas.
   ========================================================================== */

window.RENDER = (function () {
  "use strict";

  /* -- Utilidades ---------------------------------------------------------- */

  /* Los títulos y enunciados son dato, no markup: se escapan siempre. Los
     enunciados de las preguntas llevan comillas angulares y ampersands. */
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /* El guion largo con el que el prototipo marca «este dato no existe». No es
     un cero: un video en backlog no tiene versión, no tiene versión 0. */
  const VACIO = '<span class="text-gray-600">—</span>';

  function oVacio(valor) {
    return valor ? esc(valor) : VACIO;
  }

  /* `a regrabar` es el único estado con espacio: su clase es `chip-regrabar`.
     El atributo `data-estado` conserva el nombre exacto, sin slugificar,
     porque ese vocabulario se copia a desarrollo. */
  function claseEstado(estado) {
    return "chip-" + (estado === "a regrabar" ? "regrabar" : estado);
  }

  function chipEstado(estado) {
    return '<span class="chip ' + claseEstado(estado) + '">' + esc(estado) + "</span>";
  }

  /* El id de checkbox y de columna sale del ID del video sin puntuación:
     `BAK-M00.010` → `M00010`. */
  function slug(id) {
    return String(id).replace(/^BAK-/, "").replace(/\./g, "");
  }

  /* La fecha se muestra DD/MM y se ordena MMDD. Ordenar por el texto visible
     pondría el 02/02 después del 30/07, porque compararía el día primero. */
  function fechaOrdenable(fecha) {
    const p = String(fecha || "").split("/");
    return p.length === 2 ? p[1] + p[0] : "";
  }

  /* -- Tablero · vista tabla ------------------------------------------------
     Los datos viajan duplicados a propósito: en `data-*` para que `ui.js`
     pueda ordenar sin volver a parsear el texto de la celda, y en el texto
     para el render. */
  function filaTablero(v, opciones) {
    const o = opciones || {};
    const s = slug(v.id);
    return (
      '<tr data-id="' + esc(v.id) + '" data-titulo="' + esc(v.titulo) +
        '" data-estado="' + esc(v.estado) + '" data-cohorte="' + esc(v.cohorte) +
        '" data-prioridad="' + esc(v.prioridad) + '" data-modulo="' + esc(v.codigoModulo) +
        '" data-version="' + esc(v.version || "") +
        /* La fecha viaja como AAAAMMDD para que ordene cronológicamente: el
           DD/MM que se muestra ordenaría por día del mes. */
        '" data-fecha="' + esc(fechaOrdenable(v.fecha)) +
        '" data-afectado="' + esc(v.afectadoPor || "") + '"' +
        (o.seleccionado ? ' data-selected="true"' : "") + ">" +
      '<td><input type="checkbox" id="sel-' + s + '"' + (o.seleccionado ? " checked" : "") +
        ' /><label class="sr-only" for="sel-' + s + '">Seleccionar ' + esc(v.id) + "</label></td>" +
      '<td class="cell-mono">' + esc(v.id) + "</td>" +
      '<td><a href="video.html?v=' + esc(v.id) + (o.escena ? "&amp;escena=" + esc(o.escena) : "") +
        '">' + esc(v.titulo) + "</a></td>" +
      '<td class="cell-mono">' + esc(v.cohorte) + "</td>" +
      '<td class="cell-mono">' + esc(v.prioridad) + "</td>" +
      "<td>" + chipEstado(v.estado) + "</td>" +
      '<td class="cell-mono">' + oVacio(v.version) + "</td>" +
      '<td class="cell-num">' + oVacio(v.fecha) + "</td>" +
      '<td class="cell-mono">' + oVacio(v.afectadoPor) + "</td>" +
      "</tr>"
    );
  }

  function cuerpoTablero(videos, opciones) {
    return videos.map(function (v) { return filaTablero(v, opciones); }).join("");
  }

  /* -- Tablero · vista kanban ----------------------------------------------
     R3: el estado lo determina la columna, y la visibilidad en el Front viaja
     como CHIP dentro de la tarjeta — nunca como columna. Son dos ejes
     independientes y colapsarlos es el error que la regla evita. */
  function tarjetaKanban(v, opciones) {
    const o = opciones || {};
    let chips = "";
    if (v.estado === "publicado") {
      chips += '<span class="chip chip-publicado">front: ' + (v.visible ? "on" : "off") + "</span>";
    }
    chips += '<span class="chip chip-meta">' + esc(v.cohorte) + "</span>";
    chips += '<span class="chip chip-outline">' + esc(v.prioridad) + "</span>";
    if (v.afectadoPor) {
      chips += '<span class="chip chip-meta is-mono">' + esc(v.afectadoPor) + "</span>";
    }
    let nota = "";
    if (o.nota) {
      nota = '<p class="mt-[5px] text-2xs text-error-dark">' + esc(o.nota) + "</p>";
    }
    /* Los mismos `data-*` que la fila de la tabla: es lo que permite que un
       filtro acote las dos vistas a la vez con un solo criterio. */
    return (
      '<li class="kanban-card" data-id="' + esc(v.id) + '" data-titulo="' + esc(v.titulo) +
        '" data-estado="' + esc(v.estado) + '" data-cohorte="' + esc(v.cohorte) +
        '" data-prioridad="' + esc(v.prioridad) + '" data-modulo="' + esc(v.codigoModulo) + '">' +
      '<a href="video.html?v=' + esc(v.id) + (o.escena ? "&amp;escena=" + esc(o.escena) : "") +
        '" class="text-ink hover:text-primary-light">' +
      '<span class="card-id">' + esc(v.id) + "</span>" + esc(v.titulo) + "</a>" +
      '<p class="kanban-card-tags">' + chips + "</p>" +
      nota +
      "</li>"
    );
  }

  /* Los rótulos de columna del wireframe. `backlog` es el único que no se
     nombra igual que el estado: la columna dice «En backlog». */
  const ROTULO_COLUMNA = {
    "backlog": "En backlog",
    "guionado": "Guionado",
    "grabado": "Grabado",
    "editado": "Editado",
    "publicado": "Publicado",
    "a regrabar": "A regrabar",
    "obsoleto": "Obsoleto",
  };

  function columnaKanban(estado, videos, opciones) {
    const o = opciones || {};
    const id = "col-" + (estado === "a regrabar" ? "regrabar" : estado);
    const cuerpo = videos.length
      ? videos.map(function (v) {
          return tarjetaKanban(v, {
            escena: o.escena,
            nota: o.notas ? o.notas[v.id] : null,
          });
        }).join("")
      : '<li class="px-2 py-4 text-center text-2xs text-gray-600">sin videos</li>';
    return (
      '<section class="kanban-col" aria-labelledby="' + id + '">' +
      '<h2 class="kanban-head" id="' + id + '">' + esc(ROTULO_COLUMNA[estado] || estado) +
        '<span class="kanban-count">' + videos.length + "</span></h2>" +
      '<ul class="kanban-body">' + cuerpo + "</ul>" +
      "</section>"
    );
  }

  /* El tablero completo: una columna por estado, en el orden de la máquina de
     estados. El conteo de cada columna sale de sus tarjetas, no de un número
     escrito aparte — que era la fuente de deriva del prototipo anterior. */
  function kanban(videos, estados, opciones) {
    const porEstado = {};
    estados.forEach(function (e) { porEstado[e] = []; });
    videos.forEach(function (v) { (porEstado[v.estado] || []).push(v); });
    return estados.map(function (e) {
      return columnaKanban(e, porEstado[e], opciones);
    }).join("");
  }

  /* -- Tiles de métrica ---------------------------------------------------- */
  function tile(etiqueta, valor, tono) {
    return (
      '<div class="metric-tile">' +
      '<span class="metric-label">' + esc(etiqueta) + "</span>" +
      '<p class="metric-value"' + (tono ? ' data-tone="' + esc(tono) + '"' : "") + ">" +
        esc(valor) + "</p>" +
      "</div>"
    );
  }

  /* `tiles` recibe `[etiqueta, valor, tono]`. El tono `alerta` se pasa solo
     cuando el número es el que hay que mirar: si todo está en alerta, nada lo
     está. */
  function tiles(defs) {
    return defs.map(function (d) { return tile(d[0], d[1], d[2]); }).join("");
  }

  /* -- Embudo del Home -----------------------------------------------------
     Los anchos se calculan. Escribirlos a mano era lo que obligaba a recalcular
     treinta porcentajes cada vez que un video cambiaba de estado. */
  /* El tramo lleva el nombre del estado solo si es lo bastante ancho para que
     entre. Los angostos muestran el número solo y se explican en la leyenda:
     un rótulo que se corta a la mitad no informa, ensucia. */
  const ANCHO_MINIMO_ROTULO = 40;

  function embudo(tramos) {
    return tramos.map(function (t) {
      const rotulo = t.porcentaje >= ANCHO_MINIMO_ROTULO
        ? t.cantidad + " " + esc(nombreEstado(t.estado, t.cantidad))
        : String(t.cantidad);
      return '<span data-estado="' + esc(t.estado) + '" style="width: ' + t.porcentaje + '%">' +
        rotulo + "</span>";
    }).join("");
  }

  /* La leyenda del embudo. Los colores son los tokens del design system, uno
     por estado de producción: los mismos que pinta `.funnel > span`. */
  const COLOR_ESTADO = {
    "backlog": "--color-gray-500",
    "guionado": "--color-gray-600",
    "grabado": "--color-primary-light",
    "editado": "--color-warning-dark",
    "publicado": "--color-success-dark",
    "a regrabar": "--color-error",
    "obsoleto": "--color-gray-700",
  };

  /* El participio del estado, con su singular: la leyenda tiene que decir
     «4 guionados» pero «1 obsoleto». `backlog` y `a regrabar` no concuerdan en
     número, así que llevan la misma forma en los dos casos. */
  const NOMBRE_ESTADO = {
    "backlog": ["en backlog", "en backlog"],
    "guionado": ["guionado", "guionados"],
    "grabado": ["grabado", "grabados"],
    "editado": ["editado", "editados"],
    "publicado": ["publicado", "publicados"],
    "a regrabar": ["a regrabar", "a regrabar"],
    "obsoleto": ["obsoleto", "obsoletos"],
  };

  function nombreEstado(estado, cantidad) {
    const par = NOMBRE_ESTADO[estado];
    if (!par) return estado;
    return cantidad === 1 ? par[0] : par[1];
  }

  function leyendaEmbudo(tramos) {
    return tramos.map(function (t) {
      return "<span><i style=\"background: var(" + COLOR_ESTADO[t.estado] + ")\"></i>" +
        t.cantidad + " " + esc(nombreEstado(t.estado, t.cantidad)) + "</span>";
    }).join("");
  }

  /* -- Tarjeta de hito -----------------------------------------------------
     El Home muestra UN hito, no una lista: en lugar de once módulos en alerta,
     un objetivo. `cumplido` cambia el rótulo y el tono cuando ya se alcanzó. */
  function hitoCard(h) {
    const id = "hito-" + (h.escena || "x").toLowerCase();
    const cta = h.cta
      ? '<a href="' + h.cta.href + '" class="btn btn-primary btn-sm mt-4">' + esc(h.cta.texto) + "</a>"
      : "";
    return (
      '<section class="hito-card"' + (h.cumplido ? ' data-cumplido="true"' : "") +
        ' aria-labelledby="' + id + '">' +
      '<p class="side-title !mb-2">' + esc(h.cumplido ? "Hito alcanzado" : "Próximo hito") + "</p>" +
      '<h2 class="hito-titulo" id="' + id + '">' + esc(h.titulo) + "</h2>" +
      '<p class="mt-2 max-w-[74ch] text-sm text-primary-dark">' + h.texto + "</p>" +
      cta +
      "</section>"
    );
  }

  /* La barra de filtros dejó de armarse acá: las pills viven en el HTML de cada
     pantalla y `UI.bindFilters()` las hace filtrar de verdad. Antes esta función
     emitía pills decorativas al lado de un contador que sí era real, y las dos
     cosas se contradecían apenas alguien tocaba una.
*/

  /* -- Listado de módulos --------------------------------------------------
     `publicados / total` y `banco / mínimo` salen del motor: son las dos
     columnas que tenían que decir lo mismo que el tablero y que el banco, y
     ahora no pueden discrepar porque salen del mismo cálculo. */
  function filaModulo(r, opciones) {
    const o = opciones || {};
    const m = r.modulo;
    const esReservado = m.tipo === "reservado";
    const q = o.escena ? "&amp;escena=" + esc(o.escena) : "";
    const destino = m.tipo === "ruta"
      ? "modulo.html?m=R01" + q
      : "modulo.html?m=" + m.numero + q;

    /* El módulo reservado no tiene nada que contar: ni videos, ni banco, ni
       plan. Mostrar ceros diría que está vacío; el guion dice que todavía no
       existe. */
    /* El chip de origen solo se muestra cuando el dato es reciente y relevante:
       recién importado el mapa importa saber qué entró por el importador y qué
       se creó a mano, para poder revisarlo. Un mes después ya no dice nada. */
    const chipOrigen = o.mostrarOrigen && r.creadoPor
      ? ' <span class="chip ' + (r.creadoPor === "mano" ? "chip-meta" : "chip-outline") +
        '">creado ' + (r.creadoPor === "mano" ? "a mano" : "por importación") + "</span>"
      : "";

    /* `data-orden` es lo que ordena la columna, y no es lo que se muestra: la
       Ruta va primera con «R» y el reservado último sin número. */
    const ordenSort = m.tipo === "ruta" ? 0 : m.tipo === "reservado" ? 99 : m.orden;
    /* `data-nombre` es la clave de ORDEN de la columna Nombre; `data-titulo` es
       la que busca el filtro, que usa el mismo par (id, título) en todas las
       tablas. Son el mismo valor con dos consumidores distintos. */
    const attrs = '<tr' + (esReservado ? ' data-reservado="true"' : "") +
      ' data-orden="' + ordenSort + '" data-id="' + esc(m.codigo) +
      '" data-nombre="' + esc(m.titulo) + '" data-titulo="' + esc(m.titulo) +
      '" data-tipo="' + esc(m.tipo) + '" data-estado="' + esc(r.estado) +
      '" data-plan="' + esc((m.planes || []).join(" ")) + '">';

    if (esReservado) {
      return (
        attrs +
        '<td class="cell-mono">' + VACIO + "</td>" +
        '<td class="cell-mono">' + esc(m.codigo) + "</td>" +
        "<td>" + esc(m.titulo) + chipOrigen + "</td>" +
        "<td>" + VACIO + "</td>" +
        '<td class="cell-num">' + VACIO + "</td>" +
        '<td class="cell-num">' + VACIO + "</td>" +
        "<td>" + VACIO + "</td>" +
        '<td><span class="chip chip-outline">reservado</span></td>' +
        '<td class="text-gray-600">' + oVacio(r.actividad) + "</td>" +
        "</tr>"
      );
    }

    const b = r.banco;
    const minimo = b.configurada ? String(b.minimo) : "—";
    const celdaBanco = b.derivado
      ? "<strong>" + b.vigentes + "</strong> heredadas / " + minimo + " mín. " + estadoBanco(b)
      : "<strong>" + b.vigentes + "</strong> / " + minimo + " " + estadoBanco(b);

    const claseEstadoModulo = r.estado === "activo" ? "chip-publicado" : "chip-backlog";
    return (
      attrs +
      '<td class="cell-mono">' + esc(m.orden) + "</td>" +
      '<td class="cell-mono">' + esc(m.codigo) + "</td>" +
      '<td><a href="' + destino + '">' + esc(m.titulo) + "</a>" + chipOrigen + "</td>" +
      "<td>" + esc(m.tipo) + "</td>" +
      '<td class="cell-num">' + r.publicados + " / " + r.totalVideos + "</td>" +
      '<td class="cell-num">' + (b.derivado ? '<span class="chip chip-meta">derivado</span> ' : "") +
        celdaBanco + "</td>" +
      "<td>" + esc((m.planes || []).join(" · ") || "—") + "</td>" +
      '<td><span class="chip ' + claseEstadoModulo + '">' + esc(r.estado) + "</span></td>" +
      '<td class="text-gray-600">' + oVacio(r.actividad) + "</td>" +
      "</tr>"
    );
  }

  /* El rótulo del banco: «apto», «faltan N» o «sin banco». Son tres mensajes
     distintos y el del medio es el único que dice cuánto. */
  /* Las dos puertas de entrada. El contrato: `href: null` significa que la
     puerta no tiene adónde llevar, y entonces `motivo` es obligatorio y se
     pinta en lugar de la bajada. Es la regla de que un control apagado dice
     POR QUÉ: en E6 no hay ningún video esperando link, y una puerta que
     lleva a una lista vacía es peor que una puerta apagada que lo explica.

     La guarda de abajo cubre al caller que se olvida el motivo: sin ella,
     `esc(undefined)` devuelve cadena vacía y la puerta apagada queda MUDA,
     que es exactamente lo que la regla del botón que no hace nada prohíbe.
     No es una excepción ni un `console.error` —nada que rompa la pantalla—,
     es un texto visible que delata el olvido en el propio markup. */
  function puertas(lista) {
    return lista.map(function (p) {
      const bajada = p.href
        ? p.bajada
        : (p.motivo || "(falta declarar el motivo de esta puerta apagada)");
      const cuerpo =
        '<span class="puerta-titulo">' + esc(p.titulo) + "</span>" +
        '<span class="puerta-bajada">' + esc(bajada) + "</span>" +
        '<span class="puerta-quien">' + esc(p.quien) + "</span>";
      return p.href
        ? '<a class="puerta" href="' + esc(p.href) + '">' + cuerpo + "</a>"
        : '<div class="puerta" aria-disabled="true">' + cuerpo + "</div>";
    }).join("");
  }

  /* -- Franja de trabajo inmediato ------------------------------------------
     La única vista TRANSVERSAL del panel: lo demás es por módulo. Contesta
     «¿qué hago hoy?» cruzando los 11 —el cohorte en vuelo, lo que falta
     guionar, la deuda de preguntas y la cola de regrabación—.

     Va en una fila y no en una tarjeta: cuatro números que se leen de un
     vistazo, no un panel de texto que hay que ponerse a leer. Cada uno lleva a
     donde se resuelve; el que no tiene adónde llevar no es un link. */
  function franjaTrabajo(items) {
    return items.map(function (i) {
      const valor = i.href
        ? '<a href="' + i.href + '">' + esc(i.valor) + " ›</a>"
        : '<span class="meter-value"' +
          (typeof i.ok === "boolean" ? ' data-ok="' + i.ok + '"' : "") + ">" +
          esc(i.valor) + "</span>";
      return (
        '<div class="flex flex-col gap-[2px]">' +
        '<dt class="text-2xs text-gray-600">' + esc(i.etiqueta) + "</dt>" +
        '<dd class="text-xs font-bold">' + valor + "</dd>" +
        "</div>"
      );
    }).join("");
  }

  /* -- Tarjeta del panel de carga -------------------------------------------
     La misma información que la fila de la tabla, en el formato que pidió el
     mock: dos barras y tres acciones. La tabla sigue siendo el default (R5);
     esto es la otra vista del conmutador, no su reemplazo.

     Los tres botones NO son links sueltos: cada uno lleva a la pantalla que ya
     resuelve ese paso, con el módulo fijado. Y el que no corresponde va
     deshabilitado CON EL MOTIVO, nunca presente y mudo. */
  const TONO_CARGA = {
    "sin empezar": "chip-meta",
    "faltan videos": "chip-alerta",
    "faltan publicar": "chip-alerta",
    "faltan preguntas": "chip-alerta",
    completo: "chip-publicado",
  };

  function barraCarga(rotulo, cifra, pct) {
    return (
      '<div class="mt-3">' +
      '<div class="flex items-baseline justify-between text-xs">' +
      "<span>" + esc(rotulo) + "</span>" +
      '<span class="meta">' + cifra + "</span>" +
      "</div>" +
      '<div class="progress progress-sm mt-1' + (pct === 100 ? " progress-complete" : "") +
      '"><span style="width: ' + pct + '%"></span></div>' +
      "</div>"
    );
  }

  function tarjetaModulo(x, opciones) {
    const o = opciones || {};
    const amp = o.escena ? "&amp;escena=" + o.escena : "";
    const m = x.modulo;

    /* Una acción por paso. `motivo` vacío = habilitada. */
    const acciones = [
      /* R11: acá no se sube nada. El destino reserva IDs —nacen en `backlog`,
         sin link y sin versión—, y el link de YouTube se carga meses después,
         al publicar. El rótulo decía «Subir video» y era el único del repo que
         lo decía, justo sobre la pantalla que tiene prohibido el campo de link. */
      {
        icono: "film", rotulo: "Reservar IDs",
        href: "alta-videos.html?m=" + m.numero + amp,
        motivo: x.creados >= x.esperados && x.publicados === x.creados
          ? "Los " + x.esperados + " videos que declara el mapa ya están creados y publicados."
          : "",
      },
      {
        icono: "help-circle", rotulo: "Cargar preguntas",
        href: o.primeroDeLaCola ? "escritura.html?v=" + o.primeroDeLaCola + amp : "",
        motivo: !o.primeroDeLaCola
          ? (x.publicados === 0
            ? "Todavía no hay ningún video publicado: la pregunta se escribe después de grabar."
            : "El banco de este módulo no tiene deuda.")
          : "",
      },
      {
        icono: "eye", rotulo: "Ver preguntas",
        href: "banco.html?m=" + m.numero + amp,
        motivo: x.publicados === 0 ? "El banco todavía no tiene nada que mostrar." : "",
      },
    ];

    /* Los MISMOS `data-*` que la fila de la tabla. Es lo que permite que un
       solo criterio de filtro acote las dos vistas a la vez, por el mecanismo
       `data-filtros-extra` que ya usa el kanban del tablero. Sin esto, filtrar
       en tabla y conmutar a tarjetas mostraría un conjunto distinto. */
    return (
      '<article class="card card-carga p-5" data-carga="' + esc(x.chip) + '"' +
      ' data-id="' + esc(m.codigo) + '" data-titulo="' + esc(m.titulo) +
      '" data-tipo="' + esc(m.tipo) + '" data-estado="' + esc(o.estadoModulo || "") +
      '" data-plan="' + esc((m.planes || []).join(" ")) + '">' +
      '<div class="flex items-start justify-between gap-3">' +
      '<h3 class="text-h5">' + esc(m.titulo) + "</h3>" +
      '<span class="chip ' + (TONO_CARGA[x.chip] || "chip-meta") + ' shrink-0">' + esc(x.chip) + "</span>" +
      "</div>" +
      '<p class="mt-1 text-2xs text-gray-600"><span class="font-mono">' + esc(m.codigo) + "</span> · " +
        esc((m.planes || []).join(" · ")) + "</p>" +

      /* Medidores y acciones van en un pie que se ancla al fondo. La grilla ya
         iguala el alto de las tres tarjetas de una fila; sin el ancla, un título
         de dos lineas —«Entidades (clientes, pasajeros, proveedores)»— corria su
         tarjeta 24 px para abajo y las filas «Videos», «Preguntas» y los botones
         dejaban de alinearse con las vecinas. Ahora el titulo crece hacia abajo
         sin arrastrar nada. */
      '<div class="card-carga-pie">' +
      barraCarga("Videos", x.publicados + " / " + x.esperados +
        (x.creados !== x.esperados ? " · " + x.creados + " creados" : "") +
        " · " + x.publicados + " publicados", x.pctVideos) +
      barraCarga("Preguntas", x.preguntas + " / " + (x.minimo || "—"), x.pctPreguntas) +

      '<div class="mt-4 flex flex-wrap gap-2">' +
      acciones.map(function (a) {
        const nombre = '<span class="icon icon-sm" data-icon="' + a.icono + '"></span>' + esc(a.rotulo);
        return a.motivo || !a.href
          ? '<button type="button" class="btn btn-bordered btn-sm" disabled title="' +
            esc(a.motivo) + '">' + nombre + "</button>"
          : '<a href="' + a.href + '" class="btn btn-bordered btn-sm">' + nombre + "</a>";
      }).join("") +
      "</div></div></article>"
    );
  }

  /* -- Tablero de pasos del módulo ------------------------------------------
     Los cinco pasos esenciales en un solo lugar, con su estado derivado y una
     acción cada uno. No es un asistente: el ciclo de vida de un módulo dura
     meses y esto se consulta el día 1 y también el día 90.

     El paso `en curso` es el único resaltado. Los `todavía no` se muestran
     igual, apagados con su motivo: esconderlos obligaría a recordar que
     existen, que es exactamente el problema que el tablero viene a resolver. */
  function tableroPasos(pasos, opciones) {
    const o = opciones || {};
    return (
      '<ol class="pasos-modulo" aria-label="Pasos del módulo">' +
      pasos.map(function (p, i) {
        /* Se apaga por MOTIVO, no por posición. El resaltado del paso «en
           curso» orienta; no da ni quita permiso. En régimen se pueden escribir
           las preguntas de los videos ya publicados aunque el paso de videos
           siga abierto, y bloquearlo sería inventar una precondición que el
           negocio no tiene.

           La guía paso por paso NO apaga nada de acá: acompaña control por
           control y su única compuerta es su propio «Siguiente». Ese fue el
           cierre de D-16 —se probó apagar los controles de la app y se
           descartó—, y es lo que deja este tablero con su regla intacta. */
        /* La pantalla puede poner su propio control para un paso, por id. Lo
           necesita cuando la acción no es navegar: activar el módulo es una
           mutación, y agregar una sección abre el alta en línea ahí mismo. El
           motor igual declara su `accion` con destino —es lo que hace que el
           paso siga teniendo sentido desde `verificar()` y desde cualquier
           pantalla que no inyecte nada. */
        const apagado = !p.accion || !!p.motivo;
        const propia = o.acciones && o.acciones[p.id];
        const accion = propia
          ? propia
          : p.accion
            ? (apagado
              ? '<button type="button" class="btn btn-bordered btn-sm btn-block" disabled title="' +
                esc(p.motivo) + '">' +
                esc(p.accion.rotulo) + "</button>"
              : '<a href="' + esc(p.accion.href) + '" class="btn ' +
                (p.estado === "en curso" ? "btn-primary" : "btn-bordered") +
                ' btn-sm btn-block">' + esc(p.accion.rotulo) + "</a>")
            : "";
        return (
          '<li class="side-card !p-4" data-paso="' + esc(p.id) + '" data-paso-estado="' + esc(p.estado) + '"' +
          (p.estado === "en curso" ? ' aria-current="step"' : "") + ">" +
          '<div class="flex items-baseline gap-2">' +
          '<span class="wizard-num">' + (i + 1) + "</span>" +
          '<h3 class="side-title !mb-0">' + esc(p.titulo) + "</h3>" +
          "</div>" +
          '<p class="mt-2 text-2xs text-gray-700">' + esc(p.detalle) + "</p>" +
          (p.estado === "en curso" ? '<p class="mt-1 text-2xs font-bold text-primary">el que sigue</p>' : "") +
          '<div class="mt-3">' + accion + "</div>" +
          "</li>"
        );
      }).join("") +
      "</ol>"
    );
  }

  function estadoBanco(b) {
    if (!b.configurada) return '<span class="chip chip-outline">sin configurar</span>';
    if (b.vigentes === 0) return '<span class="chip chip-alerta">sin banco</span>';
    if (b.faltan > 0) return '<span class="chip chip-alerta">faltan ' + b.faltan + "</span>";
    return '<span class="chip chip-publicado">apto</span>';
  }

  /* -- Árbol de secciones · detalle de módulo ------------------------------ */
  function filaVideoArbol(v, opciones) {
    const o = opciones || {};
    const q = o.escena ? "&amp;escena=" + esc(o.escena) : "";
    const cant = o.preguntas || 0;
    let chipPreg;
    if (o.aRevisar) {
      chipPreg = '<span class="chip chip-alerta">' + o.aRevisar + " preg. a revisar</span>";
    } else if (cant) {
      chipPreg = '<span class="chip chip-meta">' + cant + " preg.</span>";
    } else {
      chipPreg = '<span class="chip chip-outline">0 preg.</span>';
    }
    /* «Cargar link» es la otra mitad de R11: el video nace como ID reservado y
       sin versión, así que la acción que lo saca de ese estado tiene que estar
       ofrecida donde el video se ve. Lleva a la solapa de versiones de su ficha,
       que es donde vive el flujo link → «Traer datos» → confirmar (R1); no se
       duplica el modal acá. El que ya tiene versión vigente no la ofrece: no
       habría nada que cargar. */
    /* Subir y bajar. Solo botones, sin arrastrar: el flujo lo pide como
       alternativa opcional y el repo ya quitó una vez el rótulo «arrastrar para
       reordenar» porque el gesto no existía. Prometerlo de nuevo sería el mismo
       error.

       Se apagan en los extremos y lo DICEN: el primero no puede subir. Un botón
       apagado y mudo se lee como roto —es la regla insignia del repo—. */
    const reordenar = o.reordenable
      ? '<span class="inline-flex gap-1">' +
        '<button type="button" class="link-quiet" data-subir="' + esc(v.id) + '"' +
        (o.primero ? ' disabled title="Ya es el primero de su sección."' : '') +
        ' aria-label="Subir ' + esc(v.id) + ' en su sección">' +
        '<span class="icon icon-sm" data-icon="chevron-up"></span></button>' +
        '<button type="button" class="link-quiet" data-bajar="' + esc(v.id) + '"' +
        (o.ultimo ? ' disabled title="Ya es el último de su sección."' : '') +
        ' aria-label="Bajar ' + esc(v.id) + ' en su sección">' +
        '<span class="icon icon-sm" data-icon="chevron-down"></span></button>' +
        "</span>"
      : "";
    const cargar = o.sinLink
      ? '<a class="text-2xs font-normal" href="video.html?v=' + esc(v.id) + q +
        '&amp;tab=versiones" title="Este ID todavía no tiene link">cargar link</a>'
      : "";
    /* La casilla de selección en lote. Va solo si la pantalla la pide: el árbol
       de la Ruta referencia videos que viven en otro módulo (R8), así que ahí
       marcar y cambiar el estado en lote operaría sobre copias que no son suyas.

       `data-id` y `data-bulk-row` son el contrato que `UI` necesita para que la
       selección múltiple funcione fuera de una tabla; el fondo de la fila
       marcada sale de los tokens que ya existen —el mismo `info-bg` que usa
       `aria-current`—, declarado acá y no en `src/input.css`, que no se toca. */
    const casilla = o.seleccionable
      ? '<input type="checkbox" aria-label="Seleccionar ' + esc(v.id) + '" />'
      : "";
    return (
      /* `tabindex="-1"` de arranque: `UI.bindArbolTeclado()` promueve una sola
         fila a `0` para que Tab entre al árbol una vez y las flechas se muevan
         adentro. Sin el atributo puesto acá, la fila no es focusable y la flecha
         no tiene a dónde ir. */
      '<div class="tree-row data-[selected=true]:bg-info-bg" tabindex="-1"' +
        (o.actual ? ' aria-current="true"' : "") +
        (o.nuevo ? ' data-nuevo="1"' : "") +
        (o.seleccionable ? ' data-bulk-row data-id="' + esc(v.id) + '"' : "") +
        ' data-estado="' + esc(v.estado) + '">' +
      casilla +
      '<span class="row-id">' + (o.actual ? "<strong>" + esc(v.id) + "</strong>" : esc(v.id)) + "</span>" +
      '<span class="row-title"><a href="video.html?v=' + esc(v.id) + q + '">' +
        esc(v.titulo) + "</a></span>" +
      (o.nuevo ? '<span class="chip chip-meta">nuevo</span>' : "") +
      chipEstado(v.estado) +
      chipPreg +
      cargar +
      reordenar +
      "</div>"
    );
  }

  function seccionArbol(s, indice, opciones) {
    const o = opciones || {};
    const id = "sec-" + (indice + 1);
    const chipPreg = s.aRevisar && s.vigentes === 0
      ? '<span class="chip chip-alerta">' + s.total + " preguntas · todas a revisar</span>"
      : '<span class="chip chip-outline">' + s.total + " preguntas</span>";
    const filas = s.videos.map(function (v, i2) {
      const suyas = s.preguntas.filter(function (p) { return p.videoOrigen === v.id; });
      return filaVideoArbol(v, {
        escena: o.escena,
        actual: o.actual === v.id,
        nuevo: o.nuevo === v.id,
        seleccionable: !!o.seleccionable,
        /* Quién es primero y último lo sabe la sección, no la fila: por eso el
           veredicto se pasa desde acá y `filaVideoArbol` no vuelve a mirar la
           lista. Con una sola fila no hay nada que reordenar. */
        reordenable: !!o.reordenable && s.videos.length > 1,
        primero: i2 === 0,
        ultimo: i2 === s.videos.length - 1,
        /* El veredicto lo da el motor —`sinLink()`— y llega resuelto en un
           conjunto: render.js no lo calcula ni lo consulta por fila. */
        sinLink: !!(o.sinLink && o.sinLink[v.id]),
        preguntas: suyas.length,
        aRevisar: suyas.filter(function (p) { return p.estado === "a revisar"; }).length,
      });
    }).join("");
    /* La puerta de la sección a sus videos. Antes no existía: para reservar un
       ID había que salir al panel de módulos o al tablero, y el paso «Videos»
       del tablero ofrece «Ir al tablero» —no «Reservar IDs»— en cuanto el mapa
       está completo, que en E2 a E6 son los 11 módulos.

       Son DOS vías y las dos están a la vista, porque son dos trabajos
       distintos: «agregar video» abre el alta en línea acá mismo —el caso de a
       uno, que es el frecuente— y «en lote» lleva a la planilla, que es el caso
       de volumen. Obligar a pasar por una para llegar a la otra sería el rodeo
       que este árbol vino a sacar. El lote sigue pudiendo cruzar secciones;
       precargar la que se venía mirando no es atarlo a ella. */
    /* `!= null` y no truthiness: el número del primer módulo es **0**, que es
       falsy, así que `BAK-M00` se quedaba sin las dos acciones de la sección
       —«agregar video» y «en lote»— y era el único árbol del repo que no las
       ofrecía. Preexistente: el `o.modulo ?` viene del commit que sumó la
       entrada por sección, y no se notó porque el módulo 0 es el único caso. */
    const agregar = o.modulo != null
      ? '<button type="button" class="ml-auto inline-flex items-center gap-1 text-2xs font-normal"' +
        ' data-agregar-video data-seccion="' + esc(s.titulo) + '"' +
        ' title="Reservar un ID de video en «' + esc(s.titulo) + '»">' +
        '<span class="icon icon-sm" data-icon="plus"></span>agregar video</button>' +
        '<a class="text-2xs font-normal" href="alta-videos.html?m=' +
        esc(String(o.modulo)) + "&amp;seccion=" + esc(encodeURIComponent(s.titulo)) +
        (o.escena ? "&amp;escena=" + esc(o.escena) : "") +
        '" title="Reservar varios IDs de una, desde la planilla">en lote</a>'
      : "";
    return (
      '<section class="tree-section" aria-labelledby="' + id + '">' +
      '<div class="tree-head">' +
      '<span id="' + id + '">' + s.orden + " · " + esc(s.titulo) + "</span>" +
      '<span class="chip chip-meta">' + s.videos.length +
        (s.videos.length === 1 ? " video" : " videos") + "</span>" +
      chipPreg +
      agregar +
      "</div>" + filas +
      "</section>"
    );
  }

  /* -- Ruta Esencial · una sección por cohorte -----------------------------
     R8: la Ruta REFERENCIA videos, no los copia. Cada fila dice en qué módulo
     vive su copia canónica, porque un video vive UNA sola vez en la biblioteca
     y la Ruta solo lo apunta. */
  function seccionRuta(c, indice, opciones) {
    const o = opciones || {};
    const id = "ruta-s" + c.id;
    const preguntas = o.preguntasPorVideo || {};
    const total = c.videos.reduce(function (a, v) { return a + (preguntas[v.id] || 0); }, 0);
    const filas = c.videos.map(function (v) {
      const n = preguntas[v.id] || 0;
      return (
        '<div class="tree-row">' +
        '<span class="row-id">' + esc(v.id) + "</span>" +
        '<span class="row-title"><a href="video.html?v=' + esc(v.id) +
          (o.escena ? "&amp;escena=" + esc(o.escena) : "") + '">' + esc(v.titulo) + "</a></span>" +
        chipEstado(v.estado) +
        (n
          ? '<span class="chip chip-meta">' + n + " preg.</span>"
          : '<span class="chip chip-outline">0 preg.</span>') +
        '<span class="chip chip-outline">canónico en ' + esc(v.codigoModulo) + "</span>" +
        "</div>"
      );
    }).join("");
    return (
      '<section class="tree-section" aria-labelledby="' + id + '">' +
      '<div class="tree-head">' +
      '<span id="' + id + '">' + (indice + 1) + " · " + esc(c.nombre) + "</span>" +
      '<span class="chip chip-meta">' + c.videos.length +
        (c.videos.length === 1 ? " video" : " videos") + "</span>" +
      '<span class="chip chip-meta">' + total +
        (total === 1 ? " pregunta" : " preguntas") + "</span>" +
      (c.escenario
        ? '<span class="ml-auto text-2xs font-normal text-gray-600">cohorte ' + esc(c.id) +
          " · " + esc(c.escenario) + "</span>"
        : '<span class="ml-auto text-2xs font-normal text-gray-600">cohorte ' + esc(c.id) + "</span>") +
      "</div>" + filas +
      "</section>"
    );
  }

  /* -- Tarjeta de aptitud para activar -------------------------------------
     Contesta «¿por qué no puedo activar el módulo?» sin que haya que ir a
     buscarlo a otra pantalla. Los dos primeros criterios llevan barra porque
     son proporciones; los otros dos son sí o no.

     Es una compuerta AL MOMENTO de activar, no una condición permanente (D-4):
     un módulo ya activo puede dejar de cumplirla sin desactivarse. */
  function aptitudCard(ap, opciones) {
    const o = opciones || {};
    const r = ap.resumen;
    const filas = ap.criterios.map(function (c, i) {
      const fila = '<div class="meter-row"><span>' + esc(c.nombre) +
        '</span><b class="meter-value" data-ok="' + c.cumple + '">' + esc(c.valor) + "</b></div>";
      if (i > 1) return fila;
      const hecho = i === 0 ? r.publicados : r.banco.vigentes;
      const total = i === 0 ? r.totalVideos : r.banco.minimo;
      const pct = total ? Math.min(100, Math.round((hecho / total) * 100)) : 0;
      return fila + '<div class="progress progress-sm' + (pct === 100 ? " progress-complete" : "") +
        '"><span style="width: ' + pct + '%"></span></div>';
    }).join("");

    /* Enumeración en español: comas y una «y» al final. */
    function enumerar(xs) {
      const m = xs.map(function (x) { return "<strong>" + x + "</strong>"; });
      if (m.length <= 1) return m.join("");
      return m.slice(0, -1).join(", ") + " y " + m[m.length - 1];
    }

    let motivo;
    if (ap.apto) {
      motivo = o.motivoApto || "Cumple los criterios. La acción de activar está habilitada.";
    } else if (ap.faltan.length) {
      motivo = "Faltan " + enumerar(ap.faltan) + ".";
    } else if (ap.aRevisar) {
      /* Puede no faltar nada cuantitativo y aun así no ser apto: la deuda de
         revisión sola bloquea la activación. */
      motivo = "No falta cargar nada, pero hay <strong>" + ap.aRevisar +
        (ap.aRevisar === 1 ? " pregunta</strong> a revisar" : " preguntas</strong> a revisar") + ".";
    } else {
      motivo = "";
    }

    return (
      '<div class="side-card side-card-strong">' +
      '<h2 class="side-title">Aptitud para activar</h2>' +
      '<div class="flex flex-col gap-[9px]">' + filas + "</div>" +
      '<p class="foot-note" id="aptitud-motivo">' + motivo + (o.extra || "") + "</p>" +
      /* Con el módulo YA activo la compuerta no aplica: ofrecer «Activar» sería
         una acción sin sentido, y ofrecerla deshabilitada sugiere que se perdió
         algo. La aptitud se sigue mostrando —es información útil— pero sin
         botón, porque activar/desactivar vive en el encabezado (D-4). */
      (o.sinBoton
        ? ""
        /* El motivo está a la vista, justo arriba, en `#aptitud-motivo`. Pero
           «a la vista» no alcanza para quien navega con lector de pantalla: sin
           el `aria-describedby` el botón se anuncia apagado y sin explicación,
           que es la mitad del defecto que la regla del repo persigue. Es el
           mismo vínculo que ya lleva el botón del paso 5. */
        : '<button type="button" class="btn btn-primary btn-sm btn-block mt-3"' +
          (ap.apto ? "" : ' disabled aria-describedby="aptitud-motivo"') + ">" +
          esc(o.accion || "Activar módulo") + "</button>") +
      "</div>"
    );
  }

  /* -- Banco de preguntas --------------------------------------------------
     Una sección del banco, con sus dos indicadores: banco mínimo y mínimo por
     sorteo. Los dos se ven SIEMPRE (R4), no aparecen como error al final.

     Las preguntas se truncan: un banco de 50 no se lee en pantalla y la
     pantalla no es para leerlas una por una, es para saber cuánto falta. Las
     que están `a revisar` se muestran todas y primero, porque son las que
     reclaman una decisión. */
  function seccionBanco(s, indice, opciones) {
    const o = opciones || {};
    const tope = o.tope || 6;
    const id = "b-sec-" + (indice + 1);

    const aRevisar = s.preguntas.filter(function (p) { return p.estado === "a revisar"; });
    const resto = s.preguntas.filter(function (p) { return p.estado !== "a revisar"; });
    const visibles = aRevisar.concat(resto).slice(0, Math.max(tope, aRevisar.length));
    const ocultas = s.preguntas.length - visibles.length;

    const faltan = s.faltan
      ? ' <span class="text-error-dark">· faltan ' + s.faltan + "</span>"
      : "";
    /* Una sección en cero no es «una que va atrasada»: es una que bloquea la
       evaluación entera, porque el sorteo exige preguntas de las cuatro y sin
       ninguna no hay de dónde sacarlas. Por eso lleva su propia marca y no
       solamente el «faltan N» que llevan las demás. */
    const enCero = s.vigentes === 0
      ? '<span class="chip chip-alerta">sin preguntas vigentes</span>'
      : "";
    const indicadores = s.minimoBanco
      ? "banco mínimo " + s.minimoBanco + faltan + " · mínimo por sorteo " + s.minimoSorteo
      : "sin mínimo configurado";

    const filas = visibles.map(function (p) {
      return filaPregunta(p, { resaltar: p.estado === "a revisar" });
    }).join("");

    const cola = ocultas > 0
      ? '<p class="px-[11px] py-2 text-2xs text-gray-600">+ ' + ocultas +
        (ocultas === 1 ? " pregunta más" : " preguntas más") + "</p>"
      : "";

    return (
      '<section class="tree-section" aria-labelledby="' + id + '">' +
      '<div class="tree-head">' +
      '<span id="' + id + '">Sección ' + s.orden + " · " + esc(s.titulo) + "</span>" +
      '<span class="chip chip-meta">' + s.vigentes + " vigentes de " + s.total + "</span>" +
      enCero +
      '<span class="text-2xs text-gray-600">' + indicadores + "</span>" +
      "</div>" + filas + cola +
      "</section>"
    );
  }

  /* -- La cola de escritura ------------------------------------------------
     Qué falta escribir, video por video, con el motivo y el faltante. Vivía
     escrito a mano dentro de `banco.html`; se movió acá cuando la solapa del
     módulo tuvo que mostrar la misma cosa. Dos copias del mismo markup son dos
     redacciones de la misma regla, y la segunda es la que se queda vieja.

     `porContenido` es el modo de la deuda: contar lo escrito de verdad o contar
     lo vigente. La decisión es de la pantalla; acá solo se pinta. */
  function colaEscritura(cola, opciones) {
    const o = opciones || {};
    const q = o.escena ? "&amp;escena=" + esc(o.escena) : "";
    if (!cola.length) {
      return '<li class="text-gray-600">' +
        esc(o.vacio || "No queda nada por escribir en este módulo.") + "</li>";
    }
    return cola.slice(0, o.tope || cola.length).map(function (f) {
      const hechas = o.porContenido ? f.escritas : f.vigentes;
      const rev = f.motivo === "a revisar";
      return '<li class="flex items-center gap-2">' +
        '<span class="row-id">' + esc(f.video.id) + "</span>" +
        '<span class="flex-1">' + esc(f.video.titulo) + "</span>" +
        '<span class="chip ' + (rev ? "chip-alerta" : "chip-outline") + '">' + esc(f.motivo) + "</span>" +
        '<span class="meta w-[64px] shrink-0 text-right">' +
          (rev ? f.aRevisar + " a revisar" : hechas + " de " + f.cuota) + "</span>" +
        '<a href="escritura.html?v=' + esc(f.video.id) + q + '">' +
        (rev ? "revisar" : "escribir") + " ›</a></li>";
    }).join("");
  }

  /* -- Resumen del banco, para la solapa de módulo (D-20) ------------------
     `banco.html` sigue siendo el deep-link con la carga completa —escribir,
     filtrar, configurar, sortear—; esto es el resumen de solo lectura que
     contesta «¿cómo viene el banco?» sin salir de `modulo.html`. Reusa
     `seccionBanco()` para el detalle por sección: es el mismo cálculo
     (`resumenModulo`, `seccionesDe`) que ya resuelve `banco.html`, así que no
     hay una segunda redacción que se pueda desactualizar. */
  function resumenBancoModulo(modulo, r, secciones, opciones) {
    const o = opciones || {};
    const q = o.escena ? "&amp;escena=" + esc(o.escena) : "";
    const hrefBanco = "banco.html?m=" + esc(String(modulo.numero)) + q;
    const b = r.banco;

    if (r.esRuta) {
      return (
        '<div class="side-card side-card-strong">' +
        '<h2 class="side-title">Banco derivado (R8)</h2>' +
        '<p class="mt-2 text-sm text-gray-700">La Ruta Esencial no tiene banco propio: ' +
        '<strong>hereda</strong> preguntas de los videos que referencia, uno por uno. ' +
        "Vigentes <strong>" + b.vigentes + "</strong> de " +
        (b.configurada ? "<strong>" + b.minimo + "</strong>" : "<strong>—</strong>") + ".</p>" +
        '<a href="' + hrefBanco + '" class="btn btn-bordered btn-sm mt-3">' +
        '<span class="icon icon-sm" data-icon="help-circle"></span>Ver los bancos de origen</a>' +
        "</div>"
      );
    }

    if (r.publicados === 0) {
      return (
        '<div class="placeholder-box !py-14">' +
        '<span class="placeholder-icon" data-icon="help-circle"></span>' +
        '<h2 class="text-h4">Todavía no corresponde escribir preguntas</h2>' +
        '<p class="mt-3 max-w-[62ch] text-base text-gray-700">' +
        '<span class="font-mono">' + esc(modulo.codigo) + "</span> no tiene ningún video " +
        "publicado, así que su banco está en <strong>0</strong>. La pregunta se escribe " +
        "<em>después</em> de grabar el video, para que use el mismo lenguaje y el mismo " +
        "ejemplo que se ve en pantalla." +
        "</p>" +
        /* La consecuencia, que faltaba: un banco en cero no es solo trabajo
           pendiente, es la razón por la que el módulo no se puede activar. Sin
           decirlo, el estado vacío se lee como «acá no hay nada que hacer».

           Y NO se ofrecen las dos vías de carga acá, aunque el flujo las pida
           para el banco en cero: con cero videos publicados no hay a quién
           escribirle una pregunta, y un botón que abre una cola vacía es
           exactamente el control muerto que este repo trata como bug. Las vías
           aparecen solas —en la cola de esta misma solapa— en cuanto hay un
           video publicado. */
        '<p class="mt-4 max-w-[62ch] text-sm text-ink-soft">' +
        "Mientras el banco esté en cero <strong>el módulo no se puede evaluar</strong>, y sin " +
        "evaluación no cumple la aptitud para activarse. El camino no es escribir preguntas " +
        "ahora: es publicar el primer video." +
        "</p>" +
        "</div>"
      );
    }

    const minimo = b.configurada ? b.minimo : null;
    const pct = minimo ? Math.round((b.vigentes / minimo) * 100) : 0;

    return (
      '<div class="flex flex-col gap-[14px]">' +
      /* R4: el contador se ve SIEMPRE, no aparece como error al final. */
      '<section class="side-card side-card-strong flex items-center gap-6" aria-labelledby="lbl-resumen-banco">' +
      "<div>" +
      '<h2 class="side-title" id="lbl-resumen-banco">Banco vigente / mínimo exigido</h2>' +
      '<p class="counter-big"><b>' + b.vigentes + "</b><span>/ " + (minimo || "—") + "</span></p>" +
      "</div>" +
      '<div class="flex-1"><div class="progress"><span style="width: ' +
      Math.min(100, pct) + '%"></span></div></div>' +
      '<dl class="flex gap-5 border-l border-dashed border-line-strong pl-5">' +
      '<div><dt class="side-title !mb-1">A revisar</dt><dd class="metric-value metric-value-sm ' +
      'text-error-dark">' + b.aRevisar + "</dd></div>" +
      '<div><dt class="side-title !mb-1">Borradores</dt><dd class="metric-value metric-value-sm">' +
      b.borradores + "</dd></div>" +
      "</dl>" +
      '<a href="' + hrefBanco + '" class="btn btn-bordered btn-sm">' +
      '<span class="icon icon-sm" data-icon="help-circle"></span>Ver el banco completo</a>' +
      "</section>" +

      /* Las dos vías de carga, ACÁ. Antes esta solapa contestaba «¿cómo viene el
         banco?» y para hacer algo con la respuesta había que irse a
         `banco.html`. Son dos y son las que el repo tiene: la cola por video
         —donde la unidad de trabajo es el video y el motivo dice qué le pasa— y
         el modal de a una, que vive en el banco completo.

         Las preguntas NO se importan (R13): se escriben después de grabar cada
         video, con su lenguaje y su ejemplo. Por eso no hay una tercera vía. */
      '<section class="side-card" aria-labelledby="lbl-cola-modulo">' +
      '<div class="flex flex-wrap items-baseline gap-x-3 gap-y-1">' +
      '<h2 class="side-title !mb-0" id="lbl-cola-modulo">Qué falta escribir</h2>' +
      '<span class="text-2xs text-gray-600">la unidad de trabajo es el video, ' +
      "y el motivo dice qué le pasa a cada uno</span>" +
      (o.cola && o.cola.length
        ? '<a class="ml-auto text-2xs" href="escritura.html?v=' + esc(o.cola[0].video.id) + q +
          '">Empezar por ' + esc(o.cola[0].video.id) + " ›</a>"
        : "") +
      "</div>" +
      '<ul class="mt-3 flex flex-col gap-2 text-xs">' +
      colaEscritura(o.cola || [], {
        escena: o.escena,
        tope: 8,
        vacio: "Nada pendiente: todos los videos publicados llegan a su cuota.",
      }) +
      "</ul>" +
      (o.cola && o.cola.length > 8
        ? '<p class="foot-note">y ' + (o.cola.length - 8) + " más, en el banco completo.</p>"
        : "") +
      "</section>" +

      secciones.map(function (s, i) { return seccionBanco(s, i); }).join("") +
      "</div>"
    );
  }

  function filaPregunta(p, opciones) {
    const o = opciones || {};
    const clase = p.estado === "a revisar" ? "chip-alerta"
      : p.estado === "borrador" ? "chip-meta" : "chip-publicado";
    /* El relleno estructural se marca: un banco completado con relleno no es un
       banco terminado, y la pantalla lo tiene que decir. */
    const marca = p.origen === "estructural"
      ? ' <span class="chip chip-outline">estructural</span>' : "";
    return (
      '<div class="tree-row !pl-[11px]' + (o.resaltar ? " bg-error-bg" : "") + '">' +
      '<span class="row-id w-[76px]">' + esc(p.id) + "</span>" +
      '<span class="row-title">' + esc(p.texto) + marca + "</span>" +
      '<span class="row-id w-[110px]">' + esc(p.videoOrigen) + "</span>" +
      '<span class="chip ' + clase + '">' + esc(p.estado) + "</span>" +
      "</div>"
    );
  }

  /* -- Guía paso por paso --------------------------------------------------
     El popover anclado y la barra de modo. Markup solamente: qué control es, si
     está listo y con qué motivo lo resolvió la pantalla, todo lo decide
     `academia-guia.js`.

     El popover es un `role="dialog"`, no un tooltip: tiene título, prosa, el
     estado del control y hasta cuatro acciones. `.tooltip` lleva
     `white-space: nowrap` y sirve para una etiqueta de una línea.

     La numeración de la etapa es LA DEL TABLERO de `modulo.html`, que está en la
     misma pantalla: dos numeraciones para lo mismo hacían que la tarjeta dijera
     «2 · Videos» y el globo «3 de 6» al mismo tiempo. El alta no es una de las
     cinco —el módulo todavía no existe— así que se rotula en lugar de numerarse. */

  /* La línea de estado. Se re-pinta sola en cada tecleo, sin tocar el resto del
     popover: re-pintarlo entero le robaría el foco al campo que se está
     llenando, que es justo el campo que la guía pidió llenar. */
  function guiaEstado(d) {
    if (d.listo) {
      return '<span class="icon icon-sm" data-icon="check-circle"></span>' +
        "<span>" + (d.tipo === "nota" ? "leído" : "listo") + "</span>";
    }
    return '<span class="icon icon-sm" data-icon="alert-circle"></span><span>' +
      esc(d.motivoSiguiente || "Falta completar este campo.") + "</span>";
  }

  function guiaPopover(d) {
    const previo = d.etapaNumero === 0;
    const etapa = previo
      ? "antes de empezar · " + esc(d.etapaTitulo)
      : "paso " + d.etapaNumero + " de " + d.totalEtapas + " · " + esc(d.etapaTitulo);
    return (
      '<div class="guia-popover" role="dialog" aria-labelledby="guia-t" aria-describedby="guia-d" tabindex="-1">' +
      '<div class="guia-popover-flecha" aria-hidden="true"></div>' +
      '<div class="flex items-baseline gap-2">' +
      '<span class="eyebrow">' + etapa + "</span>" +
      '<span class="meta ml-auto">' + (d.iCampo + 1) + " de " + d.nCampos + "</span>" +
      "</div>" +
      '<h2 class="side-title !mb-0 mt-1" id="guia-t">' + esc(d.titulo) +
      (d.opcional ? ' <span class="label-optional">opcional</span>' : "") + "</h2>" +
      '<p class="mt-2 text-xs text-gray-700" id="guia-d">' + d.detalle + "</p>" +
      /* El estado del control, con el motivo que escribió la pantalla. */
      '<p class="guia-estado mt-3" data-guia-estado data-ok="' + (d.listo ? "true" : "false") + '">' +
      guiaEstado(d) + "</p>" +
      /* Un destino solo aparece cuando el motor lo resolvió (el puente del hub). */
      (d.accion
        ? '<div class="mt-3"><a href="' + esc(d.accion.href) +
          '" class="btn btn-primary btn-sm btn-block" data-guia-ir>' +
          esc(d.accion.rotulo) + "</a></div>"
        : "") +
      '<div class="mt-3 flex items-center gap-2">' +
      (d.anterior
        ? '<button type="button" class="btn btn-ghost btn-sm" data-guia-anterior>' +
          '<span class="icon icon-sm" data-icon="chevron-left"></span>Anterior</button>'
        : "") +
      (d.siguiente
        ? '<button type="button" class="btn btn-bordered btn-sm" data-guia-siguiente' +
          (d.motivoSiguiente ? ' disabled title="' + esc(d.motivoSiguiente) + '"' : "") +
          ">Siguiente<span class=\"icon icon-sm\" data-icon=\"chevron-right\"></span></button>"
        : '<span class="meta">último de esta pantalla</span>') +
      '<button type="button" class="link-quiet ml-auto" data-guia-salir>Salir de la guía</button>' +
      "</div></div>"
    );
  }

  /* La barra de modo. Es lo que hace que la guía no se lea como una ventana
     suelta: dice que hay un recorrido abierto, sobre qué módulo, en qué paso y
     en qué control, y ofrece la salida. */
  function guiaBarra(b) {
    const etapa = b.etapaNumero === 0
      ? "antes de empezar: " + esc(b.etapaTitulo)
      : "paso " + b.etapaNumero + " de " + b.totalEtapas + ": " + esc(b.etapaTitulo);
    return (
      '<div class="guia-barra" role="status">' +
      '<span class="icon icon-sm" data-icon="route" aria-hidden="true"></span>' +
      "<span><b>Guía paso por paso</b> · " + esc(b.modulo) + " — " + etapa +
      (b.campo
        ? ' <span class="text-ink-soft">· ' + esc(b.campo) +
          " (" + (b.iCampo + 1) + " de " + b.nCampos + ")</span>"
        : "") +
      "</span>" +
      '<button type="button" class="btn btn-bordered btn-sm ml-auto" data-guia-ver' +
      (b.motivoVer ? ' disabled title="' + esc(b.motivoVer) + '"' : "") +
      ">Ver el paso</button>" +
      '<button type="button" class="btn btn-ghost btn-sm" data-guia-salir>Salir de la guía</button>' +
      "</div>"
    );
  }

  /* -- Pintar --------------------------------------------------------------
     Escribe el HTML y hidrata los iconos que haya dentro. `renderIcons` marca
     lo que ya pintó, así que volver a llamarlo no duplica nada. */
  function pintar(selector, html) {
    const el = typeof selector === "string" ? document.querySelector(selector) : selector;
    if (!el) return null;
    el.innerHTML = html;
    if (window.renderIcons) window.renderIcons(el);
    return el;
  }

  return {
    esc: esc,
    VACIO: VACIO,
    oVacio: oVacio,
    chipEstado: chipEstado,
    claseEstado: claseEstado,
    slug: slug,
    filaTablero: filaTablero,
    cuerpoTablero: cuerpoTablero,
    tarjetaKanban: tarjetaKanban,
    columnaKanban: columnaKanban,
    kanban: kanban,
    tile: tile,
    tiles: tiles,
    embudo: embudo,
    leyendaEmbudo: leyendaEmbudo,
    hitoCard: hitoCard,
    filaModulo: filaModulo,
    franjaTrabajo: franjaTrabajo,
    puertas: puertas,
    tarjetaModulo: tarjetaModulo,
    tableroPasos: tableroPasos,
    estadoBanco: estadoBanco,
    filaVideoArbol: filaVideoArbol,
    seccionArbol: seccionArbol,
    seccionRuta: seccionRuta,
    aptitudCard: aptitudCard,
    filaPregunta: filaPregunta,
    seccionBanco: seccionBanco,
    colaEscritura: colaEscritura,
    resumenBancoModulo: resumenBancoModulo,
    guiaEstado: guiaEstado,
    guiaPopover: guiaPopover,
    guiaBarra: guiaBarra,
    pintar: pintar,
  };
})();
