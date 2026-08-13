/* ============================================================================
   Academia SIGMMA — BACKOFFICE — comportamiento de interfaz
   ----------------------------------------------------------------------------
   ESTO ES MAQUETACIÓN. No hay backend, ni API, ni videos reales, ni estado de
   aplicación. Los datos están escritos a mano en el HTML.

   Este archivo hace SOLO lo imprescindible para poder recorrer el prototipo:

     · alternar escena             (los bloques de cada momento ya están en el HTML)
     · alternar solapas            (los 5 paneles ya están en el HTML)
     · alternar tabla / kanban     (las 2 vistas ya están en el HTML)
     · abrir menús y modales       con foco atrapado y Esc
     · ordenar una tabla           por la columna que se clickea
     · marcar filas                para mostrar la barra de acciones en lote
     · leer los query params       y aplicar el estado inicial

   No hay lógica de negocio, ni cálculo, ni persistencia, ni `fetch`. Si algo
   de eso aparece acá, está de más.

   La base (modal, menú, orden de tabla, contadores) viene tal cual del repo
   hermano `wireframe-academia-AGENCIA`. Lo que aquel tiene y acá NO se copió
   —guardas de módulo, sesión expirada, hidratación de usuario— dependía de un
   `mock-data.js` con reglas de negocio que este prototipo no tiene.
   ========================================================================== */

window.UI = (function () {
  "use strict";

  const FOCUSABLE = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled]):not([type=hidden])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    '[tabindex]:not([tabindex="-1"])',
  ].join(",");

  /* -- Query params -------------------------------------------------------- */
  const params = new URLSearchParams(window.location.search);

  function param(name, fallback) {
    return params.get(name) || fallback || null;
  }

  /* -- Modal ---------------------------------------------------------------
     Un solo patrón para todo el producto: overlay negro 60%, panel radio 12,
     foco atrapado, Esc, y el foco vuelve al disparador al cerrar. Los modales
     con `data-dismissible="false"` (sesión expirada) no se pueden descartar. */
  let openModal = null;
  let lastFocused = null;

  function focusables(root) {
    return Array.prototype.filter.call(
      root.querySelectorAll(FOCUSABLE),
      function (el) {
        return el.offsetParent !== null || el === document.activeElement;
      }
    );
  }

  function trap(event) {
    if (!openModal || event.key !== "Tab") return;
    const items = focusables(openModal);
    if (!items.length) {
      event.preventDefault();
      return;
    }
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function onKeydown(event) {
    if (event.key === "Escape" && openModal) {
      if (openModal.dataset.dismissible !== "false") {
        event.preventDefault();
        const onEsc = openModal.dataset.onEscape;
        if (onEsc && typeof window[onEsc] === "function") window[onEsc]();
        else closeModal();
      }
      return;
    }
    trap(event);
  }

  function showModal(target) {
    const el = typeof target === "string" ? document.getElementById(target) : target;
    if (!el) return;
    if (openModal && openModal !== el) closeModal();
    lastFocused = document.activeElement;
    el.hidden = false;
    openModal = el;
    document.body.style.overflow = "hidden";
    const autofocus = el.querySelector("[data-autofocus]") || focusables(el)[0];
    if (autofocus) autofocus.focus();
    else el.setAttribute("tabindex", "-1"), el.focus();
  }

  function closeModal() {
    if (!openModal) return;
    openModal.hidden = true;
    openModal = null;
    document.body.style.overflow = "";
    if (lastFocused && document.contains(lastFocused)) lastFocused.focus();
    lastFocused = null;
  }

  function bindModals() {
    document.addEventListener("keydown", onKeydown);

    document.addEventListener("click", function (event) {
      const opener = event.target.closest("[data-modal-open]");
      if (opener) {
        event.preventDefault();
        showModal(opener.dataset.modalOpen);
        return;
      }
      const closer = event.target.closest("[data-modal-close]");
      if (closer) {
        event.preventDefault();
        closeModal();
        return;
      }
      /* Click en el overlay: cierra solo si el modal es descartable. */
      if (
        openModal &&
        event.target.classList.contains("modal-overlay") &&
        openModal.dataset.dismissible !== "false"
      ) {
        closeModal();
      }
    });
  }

  /* -- Menú desplegable ---------------------------------------------------- */
  function bindDropdowns() {
    const roots = document.querySelectorAll("[data-dropdown]");

    function close(root) {
      const trigger = root.querySelector("[data-dropdown-trigger]");
      const menu = root.querySelector("[data-dropdown-menu]");
      if (!trigger || !menu) return;
      trigger.setAttribute("aria-expanded", "false");
      menu.hidden = true;
    }

    function open(root) {
      const trigger = root.querySelector("[data-dropdown-trigger]");
      const menu = root.querySelector("[data-dropdown-menu]");
      if (!trigger || !menu) return;
      roots.forEach(close);
      trigger.setAttribute("aria-expanded", "true");
      menu.hidden = false;
      const first = menu.querySelector('[role="menuitem"], button, a');
      if (first) first.focus();
    }

    roots.forEach(function (root) {
      const trigger = root.querySelector("[data-dropdown-trigger]");
      const menu = root.querySelector("[data-dropdown-menu]");
      if (!trigger || !menu) return;

      trigger.addEventListener("click", function (event) {
        event.preventDefault();
        const expanded = trigger.getAttribute("aria-expanded") === "true";
        if (expanded) close(root);
        else open(root);
      });

      menu.addEventListener("keydown", function (event) {
        const items = Array.prototype.slice.call(
          menu.querySelectorAll('[role="menuitem"], button, a')
        );
        const index = items.indexOf(document.activeElement);
        if (event.key === "Escape") {
          event.preventDefault();
          close(root);
          trigger.focus();
        } else if (event.key === "ArrowDown") {
          event.preventDefault();
          (items[index + 1] || items[0]).focus();
        } else if (event.key === "ArrowUp") {
          event.preventDefault();
          (items[index - 1] || items[items.length - 1]).focus();
        }
      });
    });

    document.addEventListener("click", function (event) {
      roots.forEach(function (root) {
        if (!root.contains(event.target)) close(root);
      });
    });

    window.UI_openDropdown = open;
    window.UI_dropdownRoots = roots;
  }

  /* -- Orden de tablas ----------------------------------------------------- */
  /* Marca un elemento como ya cableado y avisa si lo estaba. Es lo que permite
     volver a llamar a los `bind*` después de re-pintar una tabla sin duplicar
     listeners — un segundo listener de orden ordenaría dos veces por click. */
  function yaCableado(el, marca) {
    const clave = "bound" + marca;
    if (el.dataset[clave]) return true;
    el.dataset[clave] = "1";
    return false;
  }

  function bindSortableTables() {
    document.querySelectorAll("table[data-sortable]").forEach(function (table) {
      const body = table.querySelector("tbody");
      table.querySelectorAll("th[data-sort-key]").forEach(function (th) {
        const button = th.querySelector(".th-sort") || th;
        if (yaCableado(button, "Sort")) return;
        button.addEventListener("click", function () {
          const key = th.dataset.sortKey;
          const numeric = th.dataset.sortType === "number";
          const current = button.getAttribute("aria-sort");
          const dir = current === "ascending" ? "descending" : "ascending";

          table.querySelectorAll(".th-sort").forEach(function (other) {
            other.setAttribute("aria-sort", "none");
          });
          button.setAttribute("aria-sort", dir);

          const rows = Array.prototype.slice.call(body.querySelectorAll("tr"));
          rows.sort(function (a, b) {
            const av = a.dataset[key] || "";
            const bv = b.dataset[key] || "";
            const cmp = numeric
              ? Number(av) - Number(bv)
              : String(av).localeCompare(String(bv), "es");
            return dir === "ascending" ? cmp : -cmp;
          });
          rows.forEach(function (row) {
            body.appendChild(row);
          });
        });
      });
    });
  }

  /* -- Filtros de listado ---------------------------------------------------
     Hasta acá los filtros no filtraban: el contador de al lado sí era real, así
     que las dos cosas se contradecían apenas alguien tocaba una pill. El patrón
     se repite en seis pantallas, así que vive acá y no en seis scripts.

     Monta sobre:
       [data-filtros="<selector del tbody>"]   el contenedor de la barra
       [data-filtro-pill="clave"]              la pill que abre el menú
       [data-filtro-menu="clave"]              el menú de opciones
       [data-filtro-buscar]                    el campo de búsqueda
       [data-conteo]                           el contador
     Y filtra por los `data-<clave>` que las filas ya traen del render.

     `data-filtros-extra` suma otro contenedor a filtrar con el mismo criterio:
     es lo que permite que el tablero filtre la tabla Y el kanban a la vez. */
  const filtrosActivos = {};

  function bindFilters() {
    document.querySelectorAll("[data-filtros]").forEach(function (barra) {
      const destino = barra.dataset.filtros;
      const extra = barra.dataset.filtrosExtra || null;
      const buscar = barra.querySelector("[data-filtro-buscar]");
      const conteo = barra.querySelector("[data-conteo]");
      const estado = {};
      const modos = {};

      function candidatos() {
        const sel = [destino + " > tr"];
        /* En el kanban la unidad es la tarjeta, no la fila; las dos llevan los
           mismos `data-*`, así que el mismo criterio sirve para las dos. */
        if (extra) sel.push(extra + " [data-id]");
        return Array.prototype.slice.call(document.querySelectorAll(sel.join(", ")));
      }

      function aplicar() {
        const texto = (buscar && buscar.value || "").trim().toLowerCase();
        /* El contador cuenta ELEMENTOS, no nodos filtrados: cuando la tabla y
           el kanban muestran el mismo conjunto, sumar los dos daría el doble.
           Se cuenta solo el destino principal. */
        let visibles = 0;
        candidatos().forEach(function (el) {
          let pasa = true;
          Object.keys(estado).forEach(function (clave) {
            if (!estado[clave]) return;
            const valor = el.dataset[clave] || "";
            /* Un campo puede tener varios valores —un módulo está en más de un
               plan—, y ahí la comparación exacta no sirve. `modo="incluye"`
               busca el valor entre los de la celda, separados por espacio. */
            const ok = modos[clave] === "incluye"
              ? (" " + valor + " ").indexOf(" " + estado[clave] + " ") !== -1
              : valor === estado[clave];
            if (!ok) pasa = false;
          });
          if (pasa && texto) {
            const heno = ((el.dataset.id || "") + " " + (el.dataset.titulo || "")).toLowerCase();
            if (heno.indexOf(texto) === -1) pasa = false;
          }
          /* `data-filtro-off` y no `hidden`: `hidden` ya lo usan las solapas y
             el conmutador de vista, y se pisarían. Es la misma razón por la que
             la escena usa `data-escena-off`. */
          if (pasa) {
            el.removeAttribute("data-filtro-off");
            if (el.matches(destino + " > *")) visibles++;
          } else {
            el.setAttribute("data-filtro-off", "");
          }
        });
        if (conteo) {
          conteo.textContent = visibles + (visibles === 1 ? " resultado" : " resultados");
        }
        const vacio = document.querySelector("[data-filtro-vacio]");
        if (vacio) vacio.hidden = visibles !== 0;
      }

      barra.querySelectorAll("[data-filtro-menu]").forEach(function (menu) {
        const clave = menu.dataset.filtroMenu;
        estado[clave] = "";
        modos[clave] = menu.dataset.filtroModo || "exacto";
        menu.addEventListener("click", function (event) {
          const opcion = event.target.closest("[data-filtro-valor]");
          if (!opcion) return;
          event.preventDefault();
          estado[clave] = opcion.dataset.filtroValor;
          const pill = barra.querySelector('[data-filtro-pill="' + clave + '"]');
          if (pill) {
            const etiqueta = pill.dataset.filtroEtiqueta || clave;
            pill.firstChild.textContent = etiqueta + ": " + opcion.textContent.trim() + " ";
            pill.dataset.active = estado[clave] ? "true" : "false";
          }
          menu.hidden = true;
          const trigger = menu.parentNode.querySelector("[data-dropdown-trigger]");
          if (trigger) { trigger.setAttribute("aria-expanded", "false"); trigger.focus(); }
          aplicar();
        });
      });

      if (buscar) buscar.addEventListener("input", aplicar);
      filtrosActivos[destino] = aplicar;
      aplicar();
    });
  }

  /* Puebla el menú de una faceta. Las opciones salen de los datos, no de una
     lista escrita a mano: así un módulo nuevo aparece en el filtro solo. */
  function poblarFiltro(clave, opciones, etiqueta) {
    const menu = document.querySelector('[data-filtro-menu="' + clave + '"]');
    const pill = document.querySelector('[data-filtro-pill="' + clave + '"]');
    if (!menu) return;
    if (pill && etiqueta) pill.dataset.filtroEtiqueta = etiqueta;
    const items = [{ valor: "", texto: "todos" }].concat(
      opciones.map(function (o) {
        return typeof o === "string" ? { valor: o, texto: o } : o;
      })
    );
    menu.innerHTML = items.map(function (o) {
      return '<button type="button" class="menu-item" role="menuitem" data-filtro-valor="' +
        o.valor.replace(/"/g, "&quot;") + '">' + o.texto + "</button>";
    }).join("");
  }

  /* Re-aplica los filtros de un listado. La usan las pantallas que re-pintan la
     tabla después de una mutación: sin esto la fila nueva ignora el filtro. */
  function refiltrar(destino) {
    if (destino && filtrosActivos[destino]) return filtrosActivos[destino]();
    Object.keys(filtrosActivos).forEach(function (k) { filtrosActivos[k](); });
  }

  /* -- Contador de caracteres ---------------------------------------------- */
  function bindCounters() {
    document.querySelectorAll("[data-counter-for]").forEach(function (out) {
      const field = document.getElementById(out.dataset.counterFor);
      if (!field || yaCableado(field, "Counter")) return;
      const max = field.getAttribute("maxlength") || 500;
      const update = function () {
        out.textContent = field.value.length + " / " + max;
      };
      field.addEventListener("input", update);
      update();
    });
  }

  /* -- Botón en estado de carga -------------------------------------------- */
  function loading(button, on) {
    if (!button) return;
    button.classList.toggle("is-loading", on !== false);
    if (on === false) button.removeAttribute("aria-busy");
    else button.setAttribute("aria-busy", "true");
  }

  /* -- Solapas --------------------------------------------------------------
     `data-tabs` con botones `data-tab="clave"` y paneles `data-panel="clave"`.
     La solapa inicial sale de `?tab=`. Solo alterna visibilidad: los cinco
     paneles están escritos en el HTML. */
  function bindTabs() {
    document.querySelectorAll("[data-tabs]").forEach(function (root) {
      const tabs = Array.prototype.slice.call(root.querySelectorAll("[data-tab]"));
      const scope = document.getElementById(root.dataset.tabs) || document;
      if (!tabs.length) return;

      function activar(clave, mover) {
        let hubo = false;
        tabs.forEach(function (t) {
          const on = t.dataset.tab === clave;
          if (on) hubo = true;
          t.setAttribute("aria-selected", on ? "true" : "false");
          t.setAttribute("tabindex", on ? "0" : "-1");
        });
        if (!hubo) return false;
        scope.querySelectorAll("[data-panel]").forEach(function (p) {
          p.hidden = p.dataset.panel !== clave;
        });
        if (mover) {
          const activa = tabs.filter(function (t) {
            return t.dataset.tab === clave;
          })[0];
          if (activa) activa.focus();
        }
        return true;
      }

      tabs.forEach(function (t, i) {
        t.addEventListener("click", function (event) {
          event.preventDefault();
          activar(t.dataset.tab);
        });
        /* Flechas entre solapas: es el patrón esperado de un tablist. */
        t.addEventListener("keydown", function (event) {
          if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
          event.preventDefault();
          const paso = event.key === "ArrowRight" ? 1 : -1;
          const sig = tabs[(i + paso + tabs.length) % tabs.length];
          activar(sig.dataset.tab, true);
        });
      });

      activar(param("tab") || tabs[0].dataset.tab);
    });
  }

  /* -- Conmutador de vista (tabla / kanban) ---------------------------------
     Las dos vistas están escritas en el HTML; esto solo alterna cuál se ve y
     deja la URL en sincronía para poder compartir el link. */
  function bindViewSwitch() {
    const root = document.querySelector("[data-view-switch]");
    if (!root) return;
    /* El nombre del parámetro es configurable: el tablero conmuta `?vista=`
       (tabla/kanban) y la hoja de cohorte `?modo=` (planificación/sesión). Son
       ejes distintos y compartirlos confundiría los deep links. */
    const clave = root.dataset.viewSwitch || "vista";
    const opciones = Array.prototype.slice.call(root.querySelectorAll("[data-view]"));

    function activar(valor, empujarUrl) {
      let hubo = false;
      opciones.forEach(function (o) {
        const on = o.dataset.view === valor;
        if (on) hubo = true;
        o.setAttribute("aria-pressed", on ? "true" : "false");
      });
      if (!hubo) return;
      document.querySelectorAll("[data-view-panel]").forEach(function (p) {
        p.hidden = p.dataset.viewPanel !== valor;
      });
      if (empujarUrl && window.history && window.history.replaceState) {
        const u = new URL(window.location.href);
        u.searchParams.set(clave, valor);
        window.history.replaceState({}, "", u);
      }
    }

    opciones.forEach(function (o) {
      o.addEventListener("click", function () {
        activar(o.dataset.view, true);
      });
    });

    activar(param(clave) || opciones[0].dataset.view);
  }

  /* -- Selección múltiple de tabla ------------------------------------------
     Marca las filas y muestra la barra de acciones en lote con el conteo. La
     acción en sí la ejecuta la pantalla, leyendo `UI.seleccionados()`.

     Las filas se consultan en vivo y no se guardan en un array: la tabla se
     re-pinta después de cada mutación, y una lista capturada dejaría a «marcar
     todas» operando sobre checkboxes que ya no están en el documento. */
  function bindBulkSelect() {
    const tabla = document.querySelector("table[data-bulk]");
    if (!tabla) return;
    const barra = document.getElementById(tabla.dataset.bulk);
    const todos = tabla.querySelector("thead input[type=checkbox]");
    const filas = function () {
      return Array.prototype.slice.call(
        tabla.querySelectorAll("tbody input[type=checkbox]")
      );
    };

    function pintar() {
      const actuales = filas();
      const marcados = actuales.filter(function (c) {
        return c.checked;
      });
      actuales.forEach(function (c) {
        c.closest("tr").dataset.selected = c.checked ? "true" : "false";
      });
      if (barra) {
        barra.hidden = marcados.length === 0;
        const n = barra.querySelector("[data-bulk-count]");
        if (n) {
          n.textContent =
            marcados.length + (marcados.length === 1 ? " seleccionado" : " seleccionados");
        }
      }
      if (todos) {
        todos.checked = marcados.length === actuales.length && actuales.length > 0;
        todos.indeterminate = marcados.length > 0 && marcados.length < actuales.length;
      }
    }

    /* Los checkboxes de fila son nuevos en cada pintado: van siempre. El de
       `thead` y el de limpiar sobreviven, así que van una sola vez. */
    filas().forEach(function (c) {
      if (!yaCableado(c, "Bulk")) c.addEventListener("change", pintar);
    });
    if (todos && !yaCableado(todos, "Bulk")) {
      todos.addEventListener("change", function () {
        filas().forEach(function (c) {
          c.checked = todos.checked;
        });
        pintar();
      });
    }
    const limpiar = barra && barra.querySelector("[data-bulk-clear]");
    if (limpiar && !yaCableado(limpiar, "Bulk")) {
      limpiar.addEventListener("click", function () {
        filas().forEach(function (c) {
          c.checked = false;
        });
        pintar();
      });
    }
    pintar();
  }

  /* Los IDs de las filas marcadas. Es lo que le permite a una pantalla ejecutar
     una acción en lote sin volver a recorrer el DOM a mano. */
  function seleccionados() {
    const tabla = document.querySelector("table[data-bulk]");
    if (!tabla) return [];
    return Array.prototype.slice
      .call(tabla.querySelectorAll("tbody input[type=checkbox]"))
      .filter(function (c) { return c.checked; })
      .map(function (c) {
        const tr = c.closest("tr");
        return tr && tr.dataset.id;
      })
      .filter(Boolean);
  }

  /* -- Escena ---------------------------------------------------------------
     Cada vista declara en qué momento de la construcción de la Academia está
     el sistema. Sin `?escena=` se muestra E5, el régimen — que es lo que
     maquetó la tanda 1.

     Un bloque se marca con `data-escena="E2"`, o con varias separadas por coma
     (`data-escena="E3,E4"`) cuando la misma maqueta sirve para dos momentos.
     El rótulo se pinta en `[data-escena-label]`.

     Los datos de una escena NUNCA se mezclan con los de otra: por eso esto
     alterna bloques enteros y no celdas sueltas. */
  /* Las escenas salen del dataset, que es donde están declaradas: tener el
     diccionario dos veces fue lo que hizo que E6 se rotulara como E5 cuando se
     agregó. El literal de acá es solo el respaldo para una página que cargue
     `ui.js` sin el dataset. */
  const ESCENAS = (function () {
    if (window.ACADEMIA_DATA && window.ACADEMIA_DATA.ESCENAS) {
      const mapa = {};
      window.ACADEMIA_DATA.ESCENAS.forEach(function (e) {
        mapa[e.id] = { orden: e.orden, titulo: e.titulo, detalle: e.detalle };
      });
      return mapa;
    }
    return {
      E1: { orden: 1, titulo: "Día 0", detalle: "sistema vacío" },
      E2: { orden: 2, titulo: "Semana 1", detalle: "mapa cargado" },
      E3: { orden: 3, titulo: "Mes 1", detalle: "P1 en producción" },
      E4: { orden: 4, titulo: "Mes 2", detalle: "hito de lanzamiento" },
      E5: { orden: 5, titulo: "Régimen", detalle: "la Academia en marcha" },
      E6: { orden: 6, titulo: "En operación", detalle: "la Academia completa, con uso" },
    };
  })();

  const ESCENA_DEFAULT =
    (window.ACADEMIA_DATA && window.ACADEMIA_DATA.ESCENA_DEFAULT) || "E5";

  function escenaActiva() {
    const pedida = (param("escena") || ESCENA_DEFAULT).toUpperCase();
    return ESCENAS[pedida] ? pedida : ESCENA_DEFAULT;
  }

  function bindEscena() {
    const actual = escenaActiva();
    const info = ESCENAS[actual];

    /* Se marca con `data-escena-off`, no con `hidden`: las solapas y el
       conmutador de vista usan `hidden`, y si compartieran atributo se
       pisarían entre sí. Así componen — un bloque fuera de escena queda
       oculto aunque su solapa esté activa. */
    const bloques = document.querySelectorAll("[data-escena]");
    let hayDeEstaEscena = false;
    bloques.forEach(function (el) {
      const suyas = el.dataset.escena.split(",").map(function (s) {
        return s.trim().toUpperCase();
      });
      const dentro = suyas.indexOf(actual) >= 0;
      if (dentro) hayDeEstaEscena = true;
      if (dentro) el.removeAttribute("data-escena-off");
      else el.setAttribute("data-escena-off", "");
    });

    /* Si se pidió una escena que esta pantalla no maqueta, se avisa en vez de
       mostrar los datos de otro momento con el rótulo cambiado. */
    if (bloques.length && !hayDeEstaEscena) {
      const main = document.getElementById("contenido") || document.querySelector("main");
      if (main && !document.getElementById("escena-sin-maquetar")) {
        const aviso = document.createElement("div");
        aviso.id = "escena-sin-maquetar";
        aviso.className = "placeholder-box";
        aviso.innerHTML =
          '<span class="placeholder-icon" data-icon="layers"></span>' +
          '<h2 class="text-h5">Esta pantalla no está maquetada en ' + actual + "</h2>" +
          '<p class="mt-2 max-w-[52ch] text-sm text-ink-soft">' + actual + " es <strong>" +
          info.titulo + " — " + info.detalle + "</strong>. Esta pantalla solo tiene maquetados " +
          "otros momentos de la construcción.</p>" +
          '<a href="' + window.location.pathname.split("/").pop() +
          '" class="btn btn-primary btn-sm mt-6">Ver en régimen</a>';
        main.appendChild(aviso);
        if (window.renderIcons) window.renderIcons(aviso);
      }
    }

    document.querySelectorAll("[data-escena-label]").forEach(function (el) {
      el.textContent = actual + " · " + info.titulo + " — " + info.detalle;
      el.setAttribute("data-escena-actual", actual);
    });

    /* Los links que quieran conservar la escena la llevan sola. */
    if (actual !== ESCENA_DEFAULT) {
      document.querySelectorAll("[data-escena-keep]").forEach(function (a) {
        const href = a.getAttribute("href");
        if (!href || href.indexOf("escena=") >= 0) return;
        a.setAttribute("href", href + (href.indexOf("?") >= 0 ? "&" : "?") + "escena=" + actual);
      });
    }

    document.documentElement.setAttribute("data-escena-actual", actual);
  }

  /* -- Arranque ------------------------------------------------------------- */
  function init() {
    bindEscena();
    bindModals();
    bindDropdowns();
    bindSortableTables();
    bindCounters();
    bindTabs();
    bindViewSwitch();
    bindBulkSelect();
    bindFilters();
  }

  /* Volver a cablear lo que depende de las FILAS y no de la tabla.
     `bindSortableTables` engancha en el `th`, así que sobrevive a un re-pintado;
     `bindBulkSelect` captura los checkboxes una sola vez y no. Toda pantalla que
     re-pinte un `tbody` después de una mutación tiene que llamar a esto, o la
     selección múltiple deja de responder sin decir por qué. */
  function rebind() {
    bindSortableTables();
    bindBulkSelect();
    bindCounters();
    refiltrar();
  }

  /* Recargar la pantalla después de una mutación que la cambia entera.

     Descarta `reset=1` de la URL, y no es un detalle: ese parámetro borra el
     overlay al cargar, así que recargar con él puesto borraría el cambio que
     se acaba de guardar. Quien llegó con `?reset=1` y después configuró algo
     vería que no pasó nada. */
  function recargar() {
    const url = new URL(window.location.href);
    url.searchParams.delete("reset");
    window.location.replace(url.toString());
  }

  /* -- Exportar a CSV --------------------------------------------------------
     Arma el archivo en memoria y lo baja con un `Blob`. No es `fetch` ni
     backend: anda igual sobre `file://`.

     Exporta lo que está EN PANTALLA, no el total: si el usuario filtró, exportar
     el listado completo sería una respuesta a una pregunta que no hizo. */
  function exportarCSV(nombre, encabezados, filas) {
    const escapar = function (v) {
      const s = v === null || v === undefined ? "" : String(v);
      return /[";\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
    };
    /* Separador `;` y BOM: es lo que hace que Excel en español abra el archivo
       en columnas en vez de meter todo en la primera. */
    const cuerpo = [encabezados].concat(filas)
      .map(function (f) { return f.map(escapar).join(";"); })
      .join("\r\n");
    const blob = new Blob(["﻿" + cuerpo], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = nombre;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /* Las filas visibles de una tabla, como matriz de texto. Es la entrada
     natural de `exportarCSV`: lo que se ve es lo que se baja.

     Dos cosas de la tabla no son dato y se descartan: la celda del checkbox de
     selección —cuyo único texto es el rótulo para lectores de pantalla— y el
     guion largo con que la interfaz dibuja un valor vacío. En una planilla, «—»
     no es un valor: es ruido que rompe cualquier fórmula. */
  function filasVisibles(selector) {
    return Array.prototype.slice.call(document.querySelectorAll(selector + " > tr"))
      .filter(function (tr) {
        return !tr.hasAttribute("data-filtro-off") && !tr.hasAttribute("data-escena-off");
      })
      .map(function (tr) {
        return Array.prototype.slice.call(tr.querySelectorAll("td"))
          .filter(function (td) { return !td.querySelector('input[type="checkbox"]'); })
          .map(function (td) {
            const t = td.textContent.trim().replace(/\s+/g, " ");
            return t === "—" ? "" : t;
          });
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  return {
    param: param,
    escena: escenaActiva,
    escenas: ESCENAS,
    showModal: showModal,
    closeModal: closeModal,
    loading: loading,
    rebind: rebind,
    recargar: recargar,
    poblarFiltro: poblarFiltro,
    refiltrar: refiltrar,
    seleccionados: seleccionados,
    exportarCSV: exportarCSV,
    filasVisibles: filasVisibles,
  };
})();
