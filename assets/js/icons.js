/* ============================================================================
   Academia SIGMMA — iconos
   ----------------------------------------------------------------------------
   Trazo de 2 px sobre grilla de 24, sin relleno: el mismo lenguaje que los
   iconos del sitio. Se hidratan desde `<span class="icon" data-icon="check">`
   en vez de un sprite externo, porque un `<use href="archivo.svg#id">` no carga
   bajo el protocolo `file://` y el prototipo tiene que abrirse con doble click.
   ========================================================================== */

window.ICONS = {
  check: '<path d="M20 6 9 17l-5-5"/>',
  "check-circle":
    '<circle cx="12" cy="12" r="9"/><path d="m8.5 12.5 2.5 2.5 4.5-5"/>',
  lock: '<rect x="4.5" y="10.5" width="15" height="10" rx="2"/><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5"/>',
  unlock:
    '<rect x="4.5" y="10.5" width="15" height="10" rx="2"/><path d="M8 10.5V7a4 4 0 0 1 7.5-2"/>',
  play: '<path d="M8 5.5v13l10-6.5-10-6.5Z"/>',
  "play-circle": '<circle cx="12" cy="12" r="9"/><path d="M10 8.5v7l5.5-3.5-5.5-3.5Z"/>',
  pause: '<path d="M9 5.5v13M15 5.5v13"/>',
  activity: '<path d="M2.5 12H6l3-8 6 16 3-8h3.5"/>',
  "chevron-right": '<path d="m9 5 7 7-7 7"/>',
  "chevron-left": '<path d="m15 5-7 7 7 7"/>',
  "chevron-down": '<path d="m5 9 7 7 7-7"/>',
  "chevron-up": '<path d="m5 15 7-7 7 7"/>',
  "arrow-right": '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  "arrow-left": '<path d="M20 12H4m6-6-6 6 6 6"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  "alert-triangle":
    '<path d="M10.3 4.3 2.6 17.5a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 4.3a2 2 0 0 0-3.4 0Z"/><path d="M12 9.5v4"/><path d="M12 17h.01"/>',
  "alert-circle":
    '<circle cx="12" cy="12" r="9"/><path d="M12 7.5v5"/><path d="M12 16h.01"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 8h.01"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3.5 2"/>',
  logout:
    '<path d="M14 20H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h8"/><path d="m16 8 4 4-4 4"/><path d="M20 12H9"/>',
  download: '<path d="M12 4v11"/><path d="m7.5 10.5 4.5 4.5 4.5-4.5"/><path d="M4.5 20h15"/>',
  award:
    '<circle cx="12" cy="9.5" r="5.5"/><path d="m8.2 14.2-1.7 6.3 5.5-3 5.5 3-1.7-6.3"/>',
  trophy:
    '<path d="M7 3.5h10V9a5 5 0 0 1-10 0V3.5Z"/><path d="M7 5.5H4.5a2.5 2.5 0 0 0 0 5H6.4"/><path d="M17 5.5h2.5a2.5 2.5 0 0 1 0 5h-1.9"/><path d="M12 14v3"/><path d="M9 20.5c0-1.9 1.3-3.5 3-3.5s3 1.6 3 3.5"/><path d="M8 20.5h8"/>',
  video: '<rect x="3" y="6" width="12.5" height="12" rx="2"/><path d="m15.5 13 5.5 3.5v-9L15.5 11Z"/>',
  users:
    '<circle cx="9.5" cy="8.5" r="3.5"/><path d="M3.5 20a6 6 0 0 1 12 0"/><path d="M16.5 5.2a3.5 3.5 0 0 1 0 6.6"/><path d="M18 14.6a6 6 0 0 1 2.5 5.4"/>',
  "file-text":
    '<path d="M14 3.5H7a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.5Z"/><path d="M14 3.5v5h5"/><path d="M9 13h6M9 16.5h4"/>',
  "list-checks":
    '<path d="M4 6.5l2 2 3-3.5"/><path d="M4 13l2 2 3-3.5"/><path d="M4 19.5h5"/><path d="M12.5 7h7.5M12.5 13.5h7.5M12.5 20h7.5"/>',
  "help-circle":
    '<circle cx="12" cy="12" r="9"/><path d="M9.8 9.5a2.3 2.3 0 1 1 3.4 2c-.8.5-1.2 1-1.2 1.9"/><path d="M12 17h.01"/>',
  refresh:
    '<path d="M20 11a8 8 0 0 0-13.7-4.7L4 8.5"/><path d="M4 4.5v4h4"/><path d="M4 13a8 8 0 0 0 13.7 4.7L20 15.5"/><path d="M20 19.5v-4h-4"/>',
  message:
    '<path d="M20.5 12a7.5 7.5 0 0 1-10.9 6.7L4.5 20l1.3-4.6A7.5 7.5 0 1 1 20.5 12Z"/>',
  "arrow-up-down": '<path d="m8 4 0 16"/><path d="m4.5 7.5 3.5-3.5 3.5 3.5"/><path d="m20 20 0-16"/><path d="m16.5 16.5 3.5 3.5 3.5-3.5"/>',
  sort: '<path d="m6 9 6-6 6 6"/><path d="m6 15 6 6 6-6"/>',
  wifi: '<path d="M2.5 8.5a16 16 0 0 1 19 0"/><path d="M6 12.5a11 11 0 0 1 12 0"/><path d="M9.5 16.5a6 6 0 0 1 5 0"/><path d="M12 20h.01"/>',
  eye: '<path d="M2.5 12S6 6 12 6s9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.8"/>',
  target:
    '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1"/>',
  sparkles:
    '<path d="M12 3.5 13.6 8l4.4 1.6-4.4 1.6L12 15.7l-1.6-4.5L6 9.6 10.4 8 12 3.5Z"/><path d="M18.5 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2Z"/>',

  /* -- Backoffice ----------------------------------------------------------
     Destinos del sidebar y controles propios de la herramienta interna.
     Mismo trazo de 2 px sobre grilla de 24 que los de arriba. */
  layers:
    '<path d="m12 3.5 8.5 4.5L12 12.5 3.5 8Z"/><path d="m3.5 12.5 8.5 4.5 8.5-4.5"/>',
  film: '<rect x="3" y="4.5" width="18" height="15" rx="2"/><path d="M8 4.5v15M16 4.5v15M3 12h18M3 8.2h5M3 15.8h5M16 8.2h5M16 15.8h5"/>',
  columns:
    '<rect x="3" y="4.5" width="18" height="15" rx="2"/><path d="M9 4.5v15M15 4.5v15"/>',
  list: '<path d="M9 6.5h12M9 12h12M9 17.5h12"/><path d="M4.5 6.5h.01M4.5 12h.01M4.5 17.5h.01"/>',
  "help-circle":
    '<circle cx="12" cy="12" r="9"/><path d="M9.6 9.5a2.5 2.5 0 0 1 4.8.8c0 1.7-2.4 2.2-2.4 3.7"/><path d="M12 17h.01"/>',
  route:
    '<circle cx="6" cy="18.5" r="2.5"/><circle cx="18" cy="5.5" r="2.5"/><path d="M15.5 5.5H10a3 3 0 0 0 0 6h4a3 3 0 0 1 0 6H8.5"/>',
  grid: '<rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/>',
  "git-branch":
    '<path d="M6.5 3.5v11"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="6.5" cy="6" r="2.5"/><circle cx="17.5" cy="6" r="2.5"/><path d="M17.5 8.5v1.5a4 4 0 0 1-4 4H9"/>',
  "bar-chart": '<path d="M4.5 20.5V13m5 7.5V6.5m5 14v-5m5 5V9.5"/>',
  settings:
    '<circle cx="12" cy="12" r="3"/><path d="M19.4 14.5a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2v.2a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-2.9-1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0-1.2-2.9H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.2-2.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3h.1A1.7 1.7 0 0 0 10 3.2V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 2.9 1.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0 1.2 2.9h.2a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.6 1.5Z"/>',
  shield:
    '<path d="M12 3 5 6v5.5c0 4.3 2.9 8.3 7 9.5 4.1-1.2 7-5.2 7-9.5V6l-7-3Z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>',
  "external-link":
    '<path d="M14 4.5h5.5V10"/><path d="M19.5 4.5 11 13"/><path d="M18 14v4.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6H10"/>',
  filter: '<path d="M3.5 5.5h17l-6.5 7.5v6l-4 2v-8L3.5 5.5Z"/>',
};

(function hydrate() {
  "use strict";

  function svg(name) {
    const body = window.ICONS[name];
    if (!body) return "";
    return (
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ' +
      'width="100%" height="100%" aria-hidden="true" focusable="false">' +
      body +
      "</svg>"
    );
  }

  window.renderIcons = function (root) {
    (root || document).querySelectorAll("[data-icon]").forEach(function (el) {
      if (el.dataset.iconDone === "1") return;
      el.innerHTML = svg(el.dataset.icon);
      el.dataset.iconDone = "1";
      if (!el.hasAttribute("aria-hidden") && !el.hasAttribute("aria-label")) {
        el.setAttribute("aria-hidden", "true");
      }
    });
  };

  window.iconMarkup = svg;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      window.renderIcons();
    });
  } else {
    window.renderIcons();
  }
})();
