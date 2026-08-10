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
  function bindSortableTables() {
    document.querySelectorAll("table[data-sortable]").forEach(function (table) {
      const body = table.querySelector("tbody");
      table.querySelectorAll("th[data-sort-key]").forEach(function (th) {
        const button = th.querySelector(".th-sort") || th;
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

  /* -- Contador de caracteres ---------------------------------------------- */
  function bindCounters() {
    document.querySelectorAll("[data-counter-for]").forEach(function (out) {
      const field = document.getElementById(out.dataset.counterFor);
      if (!field) return;
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
    const opciones = Array.prototype.slice.call(root.querySelectorAll("[data-view]"));

    function activar(clave, empujarUrl) {
      let hubo = false;
      opciones.forEach(function (o) {
        const on = o.dataset.view === clave;
        if (on) hubo = true;
        o.setAttribute("aria-pressed", on ? "true" : "false");
      });
      if (!hubo) return;
      document.querySelectorAll("[data-view-panel]").forEach(function (p) {
        p.hidden = p.dataset.viewPanel !== clave;
      });
      if (empujarUrl && window.history && window.history.replaceState) {
        const u = new URL(window.location.href);
        u.searchParams.set("vista", clave);
        window.history.replaceState({}, "", u);
      }
    }

    opciones.forEach(function (o) {
      o.addEventListener("click", function () {
        activar(o.dataset.view, true);
      });
    });

    activar(param("vista") || "tabla");
  }

  /* -- Selección múltiple de tabla ------------------------------------------
     Visual: marca las filas y muestra la barra de acciones en lote con el
     conteo. No ejecuta ninguna acción — es maquetación. */
  function bindBulkSelect() {
    const tabla = document.querySelector("table[data-bulk]");
    if (!tabla) return;
    const barra = document.getElementById(tabla.dataset.bulk);
    const todos = tabla.querySelector("thead input[type=checkbox]");
    const filas = Array.prototype.slice.call(
      tabla.querySelectorAll("tbody input[type=checkbox]")
    );

    function pintar() {
      const marcados = filas.filter(function (c) {
        return c.checked;
      });
      filas.forEach(function (c) {
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
        todos.checked = marcados.length === filas.length && filas.length > 0;
        todos.indeterminate = marcados.length > 0 && marcados.length < filas.length;
      }
    }

    filas.forEach(function (c) {
      c.addEventListener("change", pintar);
    });
    if (todos) {
      todos.addEventListener("change", function () {
        filas.forEach(function (c) {
          c.checked = todos.checked;
        });
        pintar();
      });
    }
    const limpiar = barra && barra.querySelector("[data-bulk-clear]");
    if (limpiar) {
      limpiar.addEventListener("click", function () {
        filas.forEach(function (c) {
          c.checked = false;
        });
        pintar();
      });
    }
    pintar();
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
  const ESCENAS = {
    E1: { orden: 1, titulo: "Día 0", detalle: "sistema vacío" },
    E2: { orden: 2, titulo: "Semana 1", detalle: "mapa cargado" },
    E3: { orden: 3, titulo: "Mes 1", detalle: "P1 en producción" },
    E4: { orden: 4, titulo: "Mes 2", detalle: "hito de lanzamiento" },
    E5: { orden: 5, titulo: "Régimen", detalle: "la Academia en marcha" },
  };

  function escenaActiva() {
    const pedida = (param("escena") || "E5").toUpperCase();
    return ESCENAS[pedida] ? pedida : "E5";
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
    if (actual !== "E5") {
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
  };
})();
