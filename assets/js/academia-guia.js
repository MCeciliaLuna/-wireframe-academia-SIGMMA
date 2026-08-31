/* ============================================================================
   Academia SIGMMA · Backoffice — la guía paso por paso de creación de un módulo
   ----------------------------------------------------------------------------
   Un paso = UN CONTROL. Este `select`, este `input`, este botón. La guía
   acompaña la ejecución real —dónde escribir, qué va en cada campo, qué apretar
   después— en lugar de explicar el mapa desde arriba.

   Hace exactamente tres cosas:

     · SEÑALA el control y EXPLICA qué va. No escribe ni aprieta nada: el tipeo
       y el clic son de la persona.
     · No apaga ningún control de la app. Ninguno. Las siete pantallas se
       comportan igual con la guía abierta que sin ella.
     · No deja avanzar al control SIGUIENTE si el actual no está completo o
       correcto. La compuerta es la propia «Siguiente» de la guía, no la app.

   ── De dónde sale «completo o correcto» ──────────────────────────────────────
   No se reimplementa ni una regla de validación. Las cinco pantallas del flujo
   YA publican su veredicto en el DOM, y la guía lo lee:

     `aria-invalid="true"` en el campo          → está mal
     `[data-error="true"]` en la fila           → la fila está mal (alta-videos)
     `[data-error-num]`, `[data-cfg-error]`,
     `[data-pg-error]`, `[data-error]`          → el MOTIVO, ya redactado
     el botón primario `disabled` + `title`     → el veredicto de la pantalla

   Consecuencia buscada: hay una sola fuente para la regla y para su redacción.
   El motivo que muestra la guía es literalmente el texto que la pantalla
   escribió, así que no pueden divergir.

   ── Nada de progreso guardado ────────────────────────────────────────────────
   La etapa la da `SIM.pasosDeModulo()`; dentro de la etapa, el paso vigente es
   EL PRIMER CONTROL QUE NO ESTÁ LISTO. Todo derivado, del motor y del DOM. Un
   puntero propio se desincronizaría en cuanto alguien tocara algo desde otra
   pantalla, y encima habría que decidir qué hacer cuando el dato lo contradice.

   ── Capas ────────────────────────────────────────────────────────────────────
   CÁLCULO —qué control corresponde acá y si está listo— más DOM acotado —el
   popover, el velo y el resaltado—. No persiste nada: el único que escribe en el
   almacén del navegador sigue siendo el motor.

   El acceso al DOM es PEREZOSO, a propósito: así se puede requerir en node y los
   controles que `verificar()` corre sobre el mapa no quedan colgados de tener un
   navegador.

   Se carga después de `ui.js`, en las siete pantallas del flujo y en ninguna
   otra, y arranca en `DOMContentLoaded` —igual que `ui.js`— para correr cuando
   el script inline de la página ya pintó.
   ========================================================================== */

window.GUIA = (function () {
  "use strict";

  /* -- El mapa ------------------------------------------------------------
     Las seis etapas del ciclo, cada una con sus controles EN ORDEN. La etapa es
     la espina dorsal porque es lo que numera el tablero de `modulo.html`, que
     está en la misma pantalla: dos numeraciones para lo mismo convierten una
     explicación en un acertijo. Los controles se numeran DENTRO de la etapa.

     Cada control declara:

       pantalla   dónde vive. Una etapa puede repartirse en dos (el paso de
                  videos se reserva en `alta-videos` y se publica en `tablero`)
       ancla      su selector. Puede listar varios separados por coma: se toma el
                  primero VISIBLE, porque varios viven en bloques que la pantalla
                  esconde según el caso
       tipo       `campo` · `boton` · `nota` — de esto depende cómo se evalúa
       requerido  si traba el avance. Los que tienen default NO traban
       error      dónde la pantalla escribe el motivo, si tiene un lugar propio

     Lo que NO se declara nunca: el motivo redactado a mano. Sale del DOM. */
  const ETAPAS = [
    {
      id: "crear",
      titulo: "Crear el módulo",
      campos: [
        {
          pantalla: "alta-modulo.html", ancla: "#sup", tipo: "campo", requerido: false,
          titulo: "Superficie",
          detalle: "De la superficie cuelga todo el contenido del backoffice. Viene en " +
            "<b>BAK</b>, que es la única con currícula mapeada: FRT y CRM todavía no tienen " +
            "módulos, así que crear ahí reserva el ID pero no hay dónde colgarle videos.",
        },
        {
          pantalla: "alta-modulo.html", ancla: "#num", tipo: "campo", requerido: true,
          error: "[data-error-num]",
          titulo: "Número de módulo",
          detalle: "Va <b>de 10 en 10</b>, y se puede saltear para reservar espacio hacia " +
            "adelante. Con la superficie forma el ID —<span class=\"font-mono\">BAK-M35</span>— " +
            "y ese ID <b>no se cambia nunca</b>: los videos cuelgan de él y sobrevive a " +
            "cualquier regrabado. Se escribe con o sin la M.",
        },
        {
          pantalla: "alta-modulo.html", ancla: "#nom", tipo: "campo", requerido: true,
          titulo: "Nombre",
          detalle: "Es lo que ve la agencia en su syllabus. El ID identifica; el nombre " +
            "explica. A diferencia del ID, esto sí se puede corregir después.",
        },
        {
          pantalla: "alta-modulo.html", ancla: "#tipo", tipo: "campo", requerido: false,
          titulo: "Tipo",
          detalle: "<b>biblioteca</b> es el caso normal: agrupa videos en secciones. " +
            "<b>ruta</b> no tiene videos propios —referencia los de otros módulos—. " +
            "<b>reservado</b> aparta el ID para un producto que todavía no existe, y por eso " +
            "no lleva orden ni planes.",
        },
        {
          pantalla: "alta-modulo.html", ancla: "#orden", tipo: "campo", requerido: false,
          titulo: "Orden curricular",
          detalle: "Es la secuencia de desbloqueo del lado agencia. <b>Se puede dejar vacío</b> " +
            "y definirlo más adelante: el módulo nace inactivo igual, así que todavía no " +
            "desbloquea nada.",
        },
        {
          pantalla: "alta-modulo.html", ancla: "#planes", tipo: "campo", requerido: false,
          titulo: "Planes",
          detalle: "El plan es de la <b>agencia</b>, no de la persona, y define su recorrido — " +
            "que es el denominador de todo cálculo de avance. Un módulo puede estar en más de uno.",
        },
        {
          pantalla: "alta-modulo.html", ancla: "[data-sec-campo]", tipo: "campo", requerido: true,
          titulo: "Nombre de la primera sección",
          detalle: "La sección no es un agrupamiento visual: es la <b>unidad sobre la que se " +
            "exige cobertura de preguntas</b>. Conviene que nombre un concepto, no una pantalla. " +
            "Un módulo de biblioteca sin ninguna sección deja el producto roto del lado agencia, " +
            "y por eso acá es obligatoria.",
        },
        {
          pantalla: "alta-modulo.html", ancla: "[data-agregar-seccion]", tipo: "nota",
          titulo: "Las demás secciones",
          detalle: "Si el módulo necesita más, se agregan acá y el <b>orden es el de la lista</b>. " +
            "También se pueden sumar después desde el detalle del módulo, así que no hace falta " +
            "tenerlas todas ahora.",
        },
        {
          pantalla: "alta-modulo.html", ancla: "[data-crear]", tipo: "boton",
          titulo: "Crear el módulo",
          detalle: "Crea el módulo <b>con sus secciones</b>, en estado " +
            "<span class=\"chip chip-meta\">borrador</span>: todavía no expone nada del lado " +
            "agencia. Lleva al detalle del módulo, que es donde sigue el trabajo.",
        },
      ],
    },

    {
      id: "secciones",
      titulo: "Secciones",
      campos: [
        {
          pantalla: "alta-seccion.html", ancla: "#mod", tipo: "campo", requerido: false,
          titulo: "Módulo padre",
          detalle: "Viene elegido desde el módulo del que se llegó. Solo lista los de " +
            "<b>biblioteca</b>: la Ruta Esencial no tiene secciones propias y el reservado no " +
            "tiene contenido.",
        },
        {
          pantalla: "alta-seccion.html", ancla: "#nom", tipo: "campo", requerido: true,
          titulo: "Nombre de la sección",
          detalle: "Es el <b>sub-tema con el que se etiquetan las preguntas</b> del banco, y por " +
            "eso conviene que nombre un concepto. De acá sale la exigencia de cobertura: si el " +
            "módulo tiene cuatro secciones, la evaluación garantiza preguntas de las cuatro.",
        },
        {
          pantalla: "alta-seccion.html", ancla: "#orden", tipo: "campo", requerido: false,
          titulo: "Orden dentro del módulo",
          detalle: "Cada opción nombra la sección que quedaría después, así que se ve dónde cae " +
            "sin tener que contar. Por defecto va al final.",
        },
        {
          pantalla: "alta-seccion.html", ancla: "[data-crear]", tipo: "boton",
          titulo: "Crear la sección",
          detalle: "Vuelve al detalle del módulo con la sección ya en el árbol, lista para " +
            "colgarle videos.",
        },
      ],
    },

    {
      id: "videos",
      titulo: "Videos",
      campos: [
        {
          pantalla: "alta-videos.html", ancla: "#sup", tipo: "campo", requerido: false,
          titulo: "Superficie del lote",
          detalle: "Se elige <b>una vez para todo el lote</b>: es lo que hace que cargar seis " +
            "videos no sea llenar seis formularios.",
        },
        {
          pantalla: "alta-videos.html", ancla: "#mod", tipo: "campo", requerido: false,
          titulo: "Módulo del lote",
          detalle: "Todos los videos del lote van al mismo módulo. Si el módulo todavía no tiene " +
            "secciones, no hay dónde colgarlos y la pantalla lo avisa arriba.",
        },
        {
          pantalla: "alta-videos.html", ancla: "#desde", tipo: "campo", requerido: false,
          titulo: "Secuencia desde",
          detalle: "Arranca en la primera libre y avanza <b>de 10 en 10</b>. Ese hueco es " +
            "deliberado: si mañana hace falta algo entre <span class=\"font-mono\">.020</span> y " +
            "<span class=\"font-mono\">.030</span>, entra como " +
            "<span class=\"font-mono\">.025</span> sin renumerar nada.",
        },
        {
          pantalla: "alta-videos.html", ancla: "#s1", tipo: "campo", requerido: false,
          error: "#err1",
          titulo: "Secuencia de la primera fila",
          detalle: "Con el módulo forma el ID permanente que se ve en la columna de al lado. " +
            "<b>No se puede repetir</b> uno ya usado —ni entre dos filas del mismo lote—: el ID " +
            "es para siempre y reasignarlo rompería el historial de versiones.",
        },
        {
          pantalla: "alta-videos.html", ancla: "#x1", tipo: "campo", requerido: true,
          error: "#err1",
          titulo: "Sección de la primera fila",
          detalle: "<b>Obligatoria.</b> Sin sección la agencia no puede ubicar el video en el " +
            "syllabus del módulo. Antes esta pantalla lo resolvía sola colgándolo de la primera " +
            "sección, que es dato incorrecto en silencio.",
        },
        {
          pantalla: "alta-videos.html", ancla: "#t1", tipo: "campo", requerido: true,
          titulo: "¿Qué enseña este video? de la primera fila",
          detalle: "Una fila sin título no está terminada de cargar, y no se reserva. Es " +
            "distinto de una fila con error: eso hay que corregirlo, esto hay que escribirlo.",
        },
        {
          pantalla: "alta-videos.html", ancla: "#p1", tipo: "campo", requerido: false,
          titulo: "¿A qué planes aplica? de la fila",
          detalle: "Por defecto hereda el del módulo. Solo se cambia cuando un video puntual " +
            "pertenece a otro plan que el resto — en los 55 del mapa pasa una sola vez.",
        },
        {
          pantalla: "alta-videos.html", ancla: "#c1", tipo: "campo", requerido: false,
          titulo: "Cohorte de la fila",
          detalle: "El cohorte es la tanda de grabación. <b>La prioridad no se carga acá:</b> la " +
            "define el cohorte, así que al cambiarlo la prioridad lo sigue sola.",
        },
        {
          pantalla: "alta-videos.html", ancla: "[data-agregar-fila]", tipo: "nota",
          titulo: "Las demás filas",
          detalle: "Los mismos cuatro datos por fila: secuencia, sección, título y cohorte. El " +
            "panel de la derecha lleva la cuenta de cuántas están listas, cuántas tienen error y " +
            "a cuántas les falta el título o la sección.",
        },
        {
          pantalla: "alta-videos.html", ancla: "[data-reservar]", tipo: "boton",
          titulo: "Reservar los IDs",
          detalle: "Reserva <b>solo las filas listas</b>. Los videos nacen en " +
            "<span class=\"chip chip-backlog\">backlog</span>, <b>sin link y sin versión</b>: el " +
            "link de YouTube se carga recién al publicar, meses después. Acá se aparta el lugar, " +
            "no se sube nada.",
        },
        {
          pantalla: "tablero.html", ancla: "table[data-bulk] thead input[type=checkbox]",
          tipo: "nota",
          titulo: "Marcar los videos",
          detalle: "El paso de videos no termina al reservar los IDs: termina cuando están " +
            "<b>publicados</b>, y en el medio hay un rodaje entero. Desde acá se los mueve por " +
            "los siete estados, y marcando varios se opera <b>en lote</b>.",
        },
        {
          pantalla: "tablero.html", ancla: "[data-menu-estados]", tipo: "nota",
          titulo: "Cambiar el estado en lote",
          detalle: "El estado solo avanza: <span class=\"font-mono\">backlog → guionado → " +
            "grabado → editado → publicado</span>. <span class=\"font-mono\">a regrabar</span> y " +
            "<span class=\"font-mono\">obsoleto</span> son posteriores a publicado, no anteriores.",
        },
      ],
    },

    {
      id: "evaluacion",
      titulo: "Evaluación",
      campos: [
        {
          pantalla: "banco.html", ancla: "[data-modal-open]", tipo: "nota",
          titulo: "Abrir la configuración",
          detalle: "Configurar la evaluación es lo que <b>declara el mínimo</b> del banco. Sin " +
            "esto no hay mínimo, así que no se sabe cuántas preguntas faltan y el módulo no " +
            "puede quedar trabado por una exigencia que todavía nadie declaró.",
        },
        {
          pantalla: "banco.html", ancla: "#cfg-banco", tipo: "campo", requerido: true,
          error: "[data-cfg-error]",
          titulo: "Banco mínimo",
          detalle: "Cuántas preguntas necesita el módulo para poder activarse. El alcance del " +
            "MVP fija <b>50</b>. Ese mínimo <b>se reparte por sección</b>, y no a prorrata: una " +
            "sección de un solo video igual necesita cubrirse.",
        },
        {
          pantalla: "banco.html", ancla: "#cfg-intento", tipo: "campo", requerido: true,
          error: "[data-cfg-error]",
          titulo: "Preguntas por intento",
          detalle: "Cuántas se sortean en cada evaluación — <b>10</b> por defecto. El sorteo " +
            "lleva <b>cuota por sección</b>: no rellena de otra si a una le falta banco, porque " +
            "eso mostraría un banco sano donde no lo hay.",
        },
        {
          pantalla: "banco.html", ancla: "#cfg-umbral", tipo: "campo", requerido: true,
          error: "[data-cfg-error]",
          titulo: "Nota de corte",
          detalle: "Cuántas hay que acertar para aprobar — <b>8 de 10</b>. No puede pedir más " +
            "aciertos que preguntas del intento. Los reintentos son ilimitados.",
        },
        {
          pantalla: "banco.html", ancla: "[data-cfg-guardar]", tipo: "boton",
          titulo: "Guardar la configuración",
          detalle: "El panel de al lado ya muestra <b>qué le pasa a este módulo</b> con esos " +
            "números antes de guardar: cuántas preguntas tiene y cuántas le faltarían.",
        },
      ],
    },

    {
      id: "preguntas",
      titulo: "Preguntas",
      campos: [
        {
          pantalla: "escritura.html", ancla: "#texto", tipo: "campo", requerido: true,
          error: "[data-error]",
          titulo: "El enunciado",
          detalle: "Las preguntas se escriben <b>por video</b>, no por módulo: la unidad de " +
            "trabajo es el video, y la cola de la derecha los ordena por urgencia — sin " +
            "preguntas, bajo cuota, a revisar. La cuota de cada uno es orientativa y " +
            "<b>no es pareja: va de 5 a 20</b>, porque el mínimo se reparte por sección.",
        },
        {
          pantalla: "escritura.html", ancla: "#o1", tipo: "campo", requerido: true,
          error: "[data-error]",
          titulo: "Las opciones",
          detalle: "Hacen falta <b>al menos dos</b> con texto. Las vacías se descartan, así que " +
            "no hace falta llenar las cuatro.",
        },
        {
          pantalla: "escritura.html", ancla: "[name=\"correcta\"]", tipo: "campo", requerido: false,
          error: "[data-error]",
          titulo: "Cuál es la correcta",
          detalle: "Viene marcada la primera. Si se marca una opción que quedó vacía, la " +
            "pantalla no deja guardar y lo dice.",
        },
        {
          pantalla: "escritura.html", ancla: "[data-guardar]", tipo: "boton",
          titulo: "Guardar la pregunta",
          detalle: "Se suma al banco del módulo y los contadores de arriba se actualizan al " +
            "instante: el avance del banco se ve <b>durante</b> toda la carga, no como un error " +
            "al final.",
        },
        {
          pantalla: "escritura.html", ancla: "[data-siguiente]", tipo: "nota",
          titulo: "El video que sigue",
          detalle: "Lleva al próximo video de la cola sin volver al listado. La cola no lista " +
            "videos que todavía no llegaron a <b>publicado</b>: escribir antes es escribir sobre " +
            "algo que todavía puede cambiar.",
        },
      ],
    },

    {
      id: "activacion",
      titulo: "Activación",
      campos: [
        {
          pantalla: "modulo.html", ancla: "[data-activar]", tipo: "boton",
          titulo: "Activar el módulo",
          detalle: "Es lo que expone el módulo del lado agencia, y exige los <b>cuatro criterios " +
            "de aptitud</b> que muestra la tarjeta de la derecha. Es una <b>compuerta al momento " +
            "de activar, no una condición permanente</b>: un módulo que después deja de cumplirla " +
            "sigue activo, porque el producto cambió y el contenido todavía no.",
        },
      ],
    },
  ];

  const PORID = {};
  ETAPAS.forEach(function (e, i) {
    e.indice = i;
    PORID[e.id] = e;
    e.campos.forEach(function (c) { c.etapa = e; });
  });

  /* Las cinco del tablero. El alta no se cuenta: el módulo todavía no existe, y
     el tablero —que es lo que numera— ni siquiera está en pantalla. */
  const TOTAL_ETAPAS = ETAPAS.length - 1;

  /* -- Lo que audita `verificar()`, sin DOM ------------------------------- */
  function pasos() {
    return ETAPAS.map(function (e) { return e.id; });
  }
  function texto(id) {
    const e = PORID[id];
    return e ? { titulo: e.titulo, detalle: e.campos.map(function (c) { return c.detalle; }).join(" ") } : null;
  }
  function campos(id) {
    const e = PORID[id];
    return e ? e.campos.slice() : [];
  }
  /* Siempre falso, y es la invariante: si algún control declarara su propio
     `href` o su propio `motivo`, este control lo delata. Los destinos salen de
     `pasosDeModulo().accion` y los motivos, del DOM que pintó la pantalla. */
  function textoLiteral(id) {
    const e = PORID[id];
    if (!e) return false;
    return e.campos.some(function (c) { return !!(c.href || c.motivo); });
  }

  /* Todo lo de acá para abajo toca el DOM. Nada corre al cargar el archivo. */
  const enNavegador = typeof document !== "undefined";
  const S = typeof window !== "undefined" ? window.SIM : null;
  const R = typeof window !== "undefined" ? window.RENDER : null;

  /* -- Contexto de la pantalla -------------------------------------------- */
  function pantalla() {
    const f = window.location.pathname.split("/").pop() || "modulo.html";
    /* `serve@14` sirve las rutas sin `.html`, así que el nombre puede llegar
       pelado. Normalizar acá evita que el mapa falle según cómo se entró. */
    return f.indexOf(".") >= 0 ? f : f + ".html";
  }

  function param(nombre) {
    return new URLSearchParams(window.location.search).get(nombre);
  }

  function conEscena(href) {
    if (!href) return href;
    if (S.escena === "E5" || href.indexOf("escena=") >= 0) return href;
    return href + (href.indexOf("?") >= 0 ? "&" : "?") + "escena=" + S.escena;
  }

  function moduloDeLaPantalla() {
    const m = param("m");
    if (m) {
      const clave = m.toUpperCase() === "R01" ? "R01" : Number(m);
      const mod = S.modulo(clave);
      if (mod) return mod;
    }
    const v = param("v");
    if (v) {
      const vid = S.video(v.toUpperCase());
      if (vid) return S.modulo(vid.modulo);
    }
    const g = S.guia();
    if (g && g.modulo) {
      const porCodigo = S.modulos.filter(function (x) { return x.codigo === g.modulo; })[0];
      if (porCodigo) return porCodigo;
    }
    return null;
  }

  /* -- Estado en memoria de la sesión ------------------------------------- */
  let modulo = null;
  let etapaVigente = null;   /* la del MOTOR: qué le falta al módulo */
  let etapaActual = null;    /* la de la PANTALLA: qué se está haciendo acá */
  let recorrido = [];        /* los controles de ESTA pantalla, en orden */
  let indice = 0;
  let popover = null;
  let velo = null;
  let disparador = null;
  let observador = null;
  let raicesObservadas = [];
  let anclado = null;
  let ultimoFoco = null;
  let dentroDelModal = false;

  function activa() {
    const g = S.guia();
    return !!(g && g.activa);
  }

  /* La guía escribe DENTRO de las raíces que observa —la barra en `#contenido`,
     el disparador en `.page-actions`—, así que sus propias escrituras
     dispararían al observador y este volvería a escribir: un bucle que no
     termina. Pausar mientras escribe corta la realimentación de raíz, en lugar
     de depender de que cada escritura resulte idempotente. */
  function sinObservar(fn) {
    if (!observador) return fn();
    observador.disconnect();
    try {
      fn();
    } finally {
      raicesObservadas.forEach(function (r) {
        observador.observe(r, { childList: true, subtree: true });
      });
    }
  }

  /* -- La etapa que le falta al módulo ------------------------------------
     Del motor, no de un puntero propio. Sin módulo —el alta, antes de crear— la
     etapa es `crear` por definición. */
  function etapaDelModulo() {
    if (!modulo) return ETAPAS[0];
    const delMotor = S.pasosDeModulo(modulo, S.escena);
    for (let i = 0; i < delMotor.length; i++) {
      if (delMotor[i].estado !== "hecho") return PORID[delMotor[i].id] || ETAPAS[0];
    }
    return PORID["activacion"];
  }

  function moduloTerminado() {
    if (!modulo) return false;
    return S.pasosDeModulo(modulo, S.escena).every(function (p) { return p.estado === "hecho"; });
  }

  /* -- Anclajes ----------------------------------------------------------- */

  /* El primero de la lista que exista Y se vea. `offsetParent` es el mismo
     criterio de visibilidad que usa `ui.js` para juntar los focusables. */
  function primeroVisible(selectores) {
    if (!selectores) return null;
    let encontrados;
    try {
      encontrados = document.querySelectorAll(selectores);
    } catch (e) {
      return null;
    }
    for (let i = 0; i < encontrados.length; i++) {
      if (encontrados[i].offsetParent !== null) return encontrados[i];
    }
    return null;
  }

  function elementoDe(campo) {
    return primeroVisible(campo.ancla);
  }

  /* -- «¿Está completo y correcto?» ---------------------------------------
     Leyendo lo que la pantalla ya pintó. Nunca reimplementando su regla. */

  function tieneValor(el) {
    if (!el) return false;
    if (el.type === "radio" || el.type === "checkbox") {
      /* Del grupo entero, no de este nodo: lo que importa es si hay alguna
         marcada. */
      const nombre = el.getAttribute("name");
      if (nombre) {
        return !!document.querySelector('[name="' + nombre + '"]:checked');
      }
      return el.checked;
    }
    const v = String(el.value == null ? "" : el.value).trim();
    /* El guion largo es cómo la interfaz dibuja «este dato no existe». No es un
       valor: `#orden` arranca en «—» y eso significa vacío. */
    return v !== "" && v !== "—";
  }

  function invalido(el) {
    if (!el) return false;
    if (el.getAttribute("aria-invalid") === "true") return true;
    /* `alta-videos` marca la FILA entera cuando la secuencia está duplicada. */
    const fila = el.closest ? el.closest('[data-error="true"]') : null;
    return !!fila;
  }

  function listo(campo) {
    const el = elementoDe(campo);
    /* Si el control no está en pantalla, no puede trabar nada: varias pantallas
       cortan antes de pintar, y un ancla ausente no es un campo sin llenar. */
    if (!el) return true;
    if (campo.tipo === "nota") return true;
    if (campo.tipo === "boton") {
      return !el.disabled && el.getAttribute("aria-disabled") !== "true";
    }
    if (!campo.requerido) return true;
    return tieneValor(el) && !invalido(el);
  }

  /* El motivo, con la redacción de la pantalla. Se prefiere siempre el texto que
     la pantalla escribió: si la guía redactara el suyo, tendríamos dos mensajes
     para la misma regla y el de la guía sería el que se queda viejo. */
  function motivoDe(campo) {
    const el = elementoDe(campo);
    if (!el) return null;

    const propio = campo.error ? document.querySelector(campo.error) : null;
    if (propio && !propio.hidden && propio.textContent.trim()) {
      return propio.textContent.trim();
    }

    if (campo.tipo === "boton") {
      if (el.title && el.title.trim()) return el.title.trim();
      /* El botón puede estar apagado por un error que la pantalla escribió en
         otro lado —el modal de config no le pone `title` al botón—. */
      const errores = document.querySelectorAll(
        "[data-error], [data-error-num], [data-cfg-error], [data-pg-error]"
      );
      for (let i = 0; i < errores.length; i++) {
        if (!errores[i].hidden && errores[i].textContent.trim()) {
          return errores[i].textContent.trim();
        }
      }
      return "Todavía falta completar algo de esta pantalla.";
    }

    if (invalido(el)) return "Este valor no se puede usar. Corregilo para poder seguir.";
    return "Falta completar este campo para poder seguir.";
  }

  /* -- Qué etapa se está haciendo ACÁ -------------------------------------
     La decide la PANTALLA, no el motor. Si alguien está parado en el alta de
     sección, está haciendo secciones —agregar una más es trabajo legítimo—
     aunque el motor tenga esa etapa por terminada. Atarlo a la etapa vigente
     dejaba la guía muda en tres de las siete pantallas.

     La excepción es el hub: en `modulo.html` están las cinco etapas a la vista,
     así que ahí sí manda el motor. */
  function etapaDeLaPantalla() {
    const p = pantalla();
    if (p === "modulo.html") return etapaVigente;
    for (let i = 0; i < ETAPAS.length; i++) {
      const tiene = ETAPAS[i].campos.some(function (c) { return c.pantalla === p; });
      if (tiene) return ETAPAS[i];
    }
    return etapaVigente;
  }

  /* -- El recorrido de ESTA pantalla --------------------------------------
     Los controles de la etapa de esta pantalla. En `modulo.html` —el hub— puede
     no haber ninguno: si al módulo le falta una etapa que se resuelve en otra
     pantalla, se arma un PUENTE contra la tarjeta de esa etapa, con la acción que
     el tablero ya le puso. */
  function armarRecorrido() {
    const p = pantalla();
    const etapa = etapaActual;
    const propios = etapa.campos.filter(function (c) { return c.pantalla === p; });
    if (propios.length) return propios;

    /* El puente. No se declara en el mapa: su destino sale de
       `pasosDeModulo().accion`, así que no hay dos derivaciones del mismo link. */
    if (p === "modulo.html" && modulo) {
      const delMotor = S.pasosDeModulo(modulo, S.escena);
      const paso = delMotor.filter(function (x) { return x.id === etapaVigente.id; })[0];
      if (paso) {
        return [{
          etapa: etapaVigente,
          puente: true,
          tipo: "nota",
          ancla: '[data-paso="' + etapaVigente.id + '"]',
          titulo: etapaVigente.titulo,
          detalle: "Es el paso que le falta a este módulo, y <b>se resuelve en otra pantalla</b>. " +
            "En este módulo: <b>" + R.esc(paso.detalle) + "</b>." +
            (paso.motivo ? " " + R.esc(paso.motivo) : ""),
          accion: paso.motivo ? null : paso.accion,
        }];
      }
    }

    /* Una pantalla del flujo a la que se llegó fuera de orden: la etapa que le
       falta al módulo no se resuelve acá. Se dice, en lugar de mostrar el
       control de otra etapa como si fuera el que toca. */
    return [];
  }

  /* El paso vigente DENTRO del recorrido: el primer control que no está listo.
     Derivado, no guardado.

     Solo se miran los que están EN PANTALLA. Los tres campos de la configuración
     de evaluación viven dentro de un modal cerrado, así que no están visibles y
     no pueden trabar nada; si se los contara como listos y se devolviera el
     último índice, el paso elegido sería el botón de guardar —también oculto— y
     el popover no tendría dónde abrirse.

     Si todo lo visible está listo, se muestra el ÚLTIMO visible: es el final del
     recorrido de esta pantalla, no el principio. */
  function primeroNoListo() {
    let ultimoVisible = 0;
    for (let i = 0; i < recorrido.length; i++) {
      if (!elementoDe(recorrido[i])) continue;
      ultimoVisible = i;
      if (!listo(recorrido[i])) return i;
    }
    return ultimoVisible;
  }

  function anclaDe(i) {
    return recorrido[i] ? elementoDe(recorrido[i]) : null;
  }

  /* El próximo control que EXISTE Y SE VE. Varios aparecen recién cuando la
     pantalla los muestra: el menú de acciones en lote del tablero sale al marcar
     filas, y los campos de la evaluación al abrir el modal. Avanzar hacia uno
     invisible dejaría el popover sin poder abrirse, que desde afuera se ve como
     un botón que no hace nada. */
  function proximoVisible(i) {
    for (let k = i + 1; k < recorrido.length; k++) {
      if (elementoDe(recorrido[k])) return k;
    }
    return -1;
  }

  function hayAncla() {
    return recorrido.length > 0 && !!anclaDe(primeroNoListo());
  }

  /* -- El velo con el recorte --------------------------------------------- */
  function pintarVelo(rect) {
    /* Dentro de un modal no hay velo propio: el modal ya tiene su overlay, y
       superponer dos oscurece el doble justo lo que se quiere mostrar. */
    if (dentroDelModal) {
      if (velo) { velo.remove(); velo = null; }
      return;
    }
    if (!velo) {
      velo = document.createElement("div");
      velo.className = "guia-velo";
      velo.setAttribute("aria-hidden", "true");
      /* Un clic en el velo cierra el popover pero NO sale de la guía: son dos
         cosas distintas, y confundirlas haría que un clic al costado descarte
         un modo que la persona eligió entrar. */
      velo.addEventListener("click", cerrarPopover);
      document.body.appendChild(velo);
    }
    if (!rect) {
      velo.style.clipPath = "";
      return;
    }
    /* El hueco se agranda 10 px alrededor del ancla para que el anillo de foco
       entre adentro: si quedara justo, el borde del anillo caería debajo del
       velo y se vería cortado. */
    const p = 10;
    const x1 = Math.max(0, rect.left - p);
    const y1 = Math.max(0, rect.top - p);
    const x2 = rect.right + p;
    const y2 = rect.bottom + p;
    velo.style.clipPath =
      "polygon(0 0, 0 100%, " + x1 + "px 100%, " + x1 + "px " + y1 + "px, " +
      x2 + "px " + y1 + "px, " + x2 + "px " + y2 + "px, " + x1 + "px " + y2 + "px, " +
      x1 + "px 100%, 100% 100%, 100% 0)";
  }

  /* -- Posicionar el popover ----------------------------------------------
     Debajo del ancla si entra, y arriba si no. Nunca se sale del lienzo por el
     costado: el ancho es fluido y un popover fuera de pantalla provocaría el
     scroll horizontal del body, que R7 no permite. */
  function ubicar() {
    if (!popover || !anclado) return;
    /* Dentro del modal el popover es un bloque del panel, no algo flotante:
       posicionarlo contra el viewport lo sacaría del modal al hacer scroll. */
    if (dentroDelModal) {
      pintarVelo(null);
      return;
    }
    const r = anclado.getBoundingClientRect();
    const pop = popover.getBoundingClientRect();
    const margen = 14;
    const abajo = r.bottom + margen + pop.height <= window.innerHeight;
    const top = abajo ? r.bottom + margen : r.top - margen - pop.height;

    let left = r.left + r.width / 2 - pop.width / 2;
    left = Math.max(12, Math.min(left, window.innerWidth - pop.width - 12));

    popover.style.top = top + window.scrollY + "px";
    popover.style.left = left + window.scrollX + "px";

    const flecha = popover.querySelector(".guia-popover-flecha");
    if (flecha) {
      const cx = Math.max(16, Math.min(r.left + r.width / 2 - left, pop.width - 28));
      flecha.style.left = cx + "px";
      flecha.style.top = abajo ? "-7px" : pop.height - 6 + "px";
      flecha.style.transform = abajo ? "rotate(45deg)" : "rotate(225deg)";
    }
    pintarVelo(r);
  }

  /* -- Abrir y cerrar el popover ----------------------------------------- */
  function cerrarPopover() {
    if (!popover) return;
    popover.remove();
    popover = null;
    if (anclado) anclado.classList.remove("guia-foco");
    anclado = null;
    dentroDelModal = false;
    if (velo) { velo.remove(); velo = null; }
    window.removeEventListener("scroll", ubicar, true);
    window.removeEventListener("resize", ubicar);
    document.removeEventListener("keydown", alTeclear);
    /* El foco vuelve a donde estaba. Pero el disparador se re-pinta al entrar
       —su rótulo cambia— y también en cada repintado de la pantalla, así que el
       nodo guardado puede haber quedado desprendido del documento. Sin este
       respaldo, cerrar con Esc dejaba el foco en el `body`: quien navega por
       teclado tenía que tabular desde el principio de la página. */
    const destino = ultimoFoco && document.contains(ultimoFoco)
      ? ultimoFoco
      : document.querySelector("[data-guia-abrir]");
    if (destino) destino.focus();
    ultimoFoco = null;
  }

  function alTeclear(ev) {
    if (ev.key === "Escape") {
      ev.preventDefault();
      cerrarPopover();
      return;
    }
    /* El foco queda dentro del popover mientras está abierto. No se reusa el
       `trap` de `ui.js` a propósito: ese está atado a `openModal`, y dos
       trampas compartiendo estado se pisan. */
    if (ev.key !== "Tab" || !popover) return;
    const items = popover.querySelectorAll(
      "a[href], button:not([disabled]), [tabindex]:not([tabindex='-1'])"
    );
    if (!items.length) return;
    const primero = items[0];
    const ultimo = items[items.length - 1];
    if (ev.shiftKey && document.activeElement === primero) {
      ev.preventDefault();
      ultimo.focus();
    } else if (!ev.shiftKey && document.activeElement === ultimo) {
      ev.preventDefault();
      primero.focus();
    }
  }

  /* Los datos con que se pinta un paso. Aparte del render porque también los usa
     la actualización en vivo de la compuerta. */
  function datosDe(i) {
    const campo = recorrido[i];
    const estaListo = listo(campo);
    /* «Siguiente» se ofrece si hay más controles en el recorrido, pero se apaga
       por dos motivos distintos: porque esto todavía no está completo —y ahí el
       texto es el de la pantalla—, o porque el que viene todavía no está en
       pantalla. Son dos cosas y decir la equivocada manda a buscar el error al
       lugar que no es. */
    const sig = i < recorrido.length - 1;
    const idxSig = proximoVisible(i);
    const motivoSig = !estaListo
      ? motivoDe(campo)
      : idxSig === -1
        ? "El control que sigue todavía no está en pantalla: aparece al usar este."
        : null;
    return {
      etapaNumero: campo.etapa.indice,
      etapaTitulo: campo.etapa.titulo,
      totalEtapas: TOTAL_ETAPAS,
      iCampo: i,
      nCampos: recorrido.length,
      titulo: campo.titulo,
      detalle: campo.detalle,
      listo: estaListo,
      opcional: campo.tipo === "campo" && !campo.requerido,
      /* La compuerta: no se avanza si lo de acá no está completo o correcto, y
         el motivo es el de la pantalla. */
      siguiente: sig,
      motivoSiguiente: sig ? motivoSig : null,
      anterior: i > 0,
      ultimo: !sig,
      accion: campo.accion ? { rotulo: campo.accion.rotulo, href: conEscena(campo.accion.href) } : null,
    };
  }

  function mostrarPaso(i) {
    const campo = recorrido[i];
    if (!campo) return;
    const ancla = elementoDe(campo);
    /* Anclar a un nodo que no existe deja un popover flotando en el vacío. Las
       pantallas cortan antes de pintar en varios casos —FRT, E1, sin video, sin
       publicados—, así que esto pasa de verdad. */
    if (!ancla) return;

    cerrarPopover();
    indice = i;
    ultimoFoco = document.activeElement;

    /* Si el control vive dentro de un modal abierto, el popover va ADENTRO del
       panel. El `trap()` de `ui.js` recalcula sus focusables en cada `Tab`, así
       que toma los botones del popover sin que haya que tocarlo. */
    const panel = ancla.closest ? ancla.closest(".modal-panel") : null;
    dentroDelModal = !!(panel && window.UI && window.UI.modalAbierto());

    const caja = document.createElement("div");
    caja.innerHTML = R.guiaPopover(datosDe(i));
    popover = caja.firstChild;
    if (dentroDelModal) {
      popover.classList.add("guia-popover-en-modal");
      panel.appendChild(popover);
    } else {
      document.body.appendChild(popover);
    }
    if (window.renderIcons) window.renderIcons(popover);

    anclado = ancla;
    ancla.classList.add("guia-foco");

    popover.querySelectorAll("[data-guia-salir]").forEach(function (b) {
      b.addEventListener("click", salir);
    });
    const sig = popover.querySelector("[data-guia-siguiente]");
    if (sig) {
      sig.addEventListener("click", function () {
        if (sig.disabled) return;
        const k = proximoVisible(indice);
        if (k !== -1) mostrarPaso(k);
      });
    }
    const ant = popover.querySelector("[data-guia-anterior]");
    if (ant) ant.addEventListener("click", function () { mostrarPaso(Math.max(0, i - 1)); });

    window.addEventListener("scroll", ubicar, true);
    window.addEventListener("resize", ubicar);
    /* Con un modal abierto el `Esc` es del modal: dos handlers lo cerrarían
       todo de una vez y la persona perdería el formulario sin pedirlo. */
    if (!dentroDelModal) document.addEventListener("keydown", alTeclear);

    ubicar();
    ancla.scrollIntoView({ block: "center", behavior: "smooth" });
    popover.focus();
  }

  /* -- La compuerta, en vivo ----------------------------------------------
     Se actualiza EN EL LUGAR, sin re-pintar el popover: re-pintarlo en cada
     tecleo le robaría el foco al campo que la persona está llenando, que es
     exactamente el campo que la guía le pidió llenar. */
  function actualizarCompuerta() {
    if (!popover || !recorrido[indice]) return;
    const d = datosDe(indice);

    const sig = popover.querySelector("[data-guia-siguiente]");
    if (sig) {
      sig.disabled = !!d.motivoSiguiente;
      if (d.motivoSiguiente) sig.setAttribute("title", d.motivoSiguiente);
      else sig.removeAttribute("title");
    }
    const estado = popover.querySelector("[data-guia-estado]");
    if (estado) estado.innerHTML = R.guiaEstado(d);
    if (window.renderIcons) window.renderIcons(popover);
  }

  /* El `validar()` de cada pantalla está cableado sobre estos mismos eventos y
     se registró ANTES, así que ya corrió cuando el evento llega acá arriba. El
     `setTimeout 0` lo garantiza igual, sin depender del orden de registro: sin
     él la guía leería el estado anterior y «Siguiente» iría un tecleo atrasado. */
  function alInteractuar() {
    if (!popover) return;
    window.setTimeout(actualizarCompuerta, 0);
  }

  /* -- Entrar y salir del modo ------------------------------------------- */
  function rotuloModulo() {
    return modulo ? modulo.codigo : "módulo nuevo";
  }

  function entrar() {
    if (!recorrido.length) return;
    S.abrirGuia(modulo ? modulo.codigo : null);
    pintarBarra();
    mostrarPaso(primeroNoListo());
    pintarDisparador();
  }

  function salir() {
    S.cerrarGuia();
    cerrarPopover();
    document.querySelectorAll(".guia-foco").forEach(function (el) {
      el.classList.remove("guia-foco");
    });
    const barra = document.querySelector(".guia-barra");
    if (barra) sinObservar(function () { barra.remove(); });
    pintarDisparador();
  }

  /* -- La barra de modo -------------------------------------------------- */
  function pintarBarra() {
    if (!activa()) return;
    const main = document.getElementById("contenido");
    if (!main || main.querySelector(".guia-barra")) return;
    const i = recorrido.length ? primeroNoListo() : 0;
    const caja = document.createElement("div");
    caja.innerHTML = R.guiaBarra({
      modulo: rotuloModulo(),
      etapaNumero: etapaActual.indice,
      etapaTitulo: etapaActual.titulo,
      totalEtapas: TOTAL_ETAPAS,
      campo: recorrido.length ? recorrido[i].titulo : null,
      iCampo: i,
      nCampos: recorrido.length,
      /* Sin ancla, «Ver el paso» no tendría dónde abrirse: se apaga con su
         motivo en lugar de quedar mudo. */
      motivoVer: hayAncla() ? null : (recorrido.length
        ? "En esta pantalla todavía no hay nada del paso que mostrar."
        : "El paso que le falta a este módulo se resuelve en otra pantalla."),
    });
    const barra = caja.firstChild;
    sinObservar(function () {
      main.insertBefore(barra, main.firstChild);
      if (window.renderIcons) window.renderIcons(barra);
    });
    barra.querySelector("[data-guia-salir]").addEventListener("click", salir);
    const ver = barra.querySelector("[data-guia-ver]");
    if (ver && !ver.disabled) {
      ver.addEventListener("click", function () { mostrarPaso(primeroNoListo()); });
    }
  }

  /* -- El disparador ------------------------------------------------------
     Va en `.page-actions`, que existe en las 18 pantallas, y lo inyecta la guía
     en vez de estar escrito en cada HTML: sin build de HTML, cualquier cosa
     literal cuesta una copia por pantalla. Además así sobrevive a los
     repintados de las pantallas que arman sus acciones por JS. */
  function pintarDisparador() {
    const acciones = document.querySelector(".page-actions");
    if (!acciones) return;
    const previo = acciones.querySelector("[data-guia-abrir]");

    /* No se ofrece donde el paso no se puede mostrar: ofrecer un botón que no
       abre nada es un bug. Y en el hub, tampoco si el módulo ya terminó — pero
       solo ahí: en una pantalla de trabajo, agregar una sección más a un módulo
       completo sigue siendo trabajo que la guía puede acompañar. */
    if (!hayAncla() || (pantalla() === "modulo.html" && moduloTerminado())) {
      if (previo) sinObservar(function () { previo.remove(); });
      return;
    }

    const rotulo = activa()
      ? "Ver el paso"
      : S.guiaVista() ? "Retomar la guía" : "Guía paso por paso";

    /* Si ya está y dice lo mismo, no se toca NADA. Es lo que corta el bucle:
       este botón vive en `.page-actions`, que es una de las raíces observadas,
       así que recrearlo en cada pasada hacía que el observador se disparara a sí
       mismo sin fin —y cada vuelta le robaba el foco a quien lo tuviera. */
    if (previo) {
      if (previo.dataset.guiaRotulo !== rotulo) {
        sinObservar(function () {
          previo.dataset.guiaRotulo = rotulo;
          previo.innerHTML = '<span class="icon" data-icon="route"></span>' + rotulo;
          if (window.renderIcons) window.renderIcons(previo);
        });
      }
      disparador = previo;
      return;
    }

    disparador = document.createElement("button");
    disparador.type = "button";
    disparador.className = "btn btn-bordered btn-sm";
    disparador.setAttribute("data-guia-abrir", "");
    disparador.dataset.guiaRotulo = rotulo;
    disparador.innerHTML = '<span class="icon" data-icon="route"></span>' + rotulo;
    /* El handler lee el estado al momento del clic, así que sobrevive a que el
       rótulo cambie: no hay que volver a cablearlo nunca. */
    disparador.addEventListener("click", function () {
      if (activa()) mostrarPaso(primeroNoListo());
      else entrar();
    });
    sinObservar(function () {
      /* Primero de las acciones: es la que orienta, y las otras son el trabajo. */
      acciones.insertBefore(disparador, acciones.firstChild);
      if (window.renderIcons) window.renderIcons(disparador);
    });
  }

  /* -- Arranque ---------------------------------------------------------- */
  function refrescar() {
    etapaVigente = etapaDelModulo();
    etapaActual = etapaDeLaPantalla();
    recorrido = armarRecorrido();
    pintarDisparador();
    if (activa()) {
      pintarBarra();
      actualizarCompuerta();
    }
  }

  function init() {
    if (!S || !R) return;

    const pedida = param("guia");
    modulo = moduloDeLaPantalla();

    /* El alta es el paso previo y ahí el módulo todavía no existe: es el único
       lugar donde la guía corre sin uno. En cualquier otra pantalla, sin módulo
       no hay nada que guiar. */
    const esElAlta = pantalla() === "alta-modulo.html";
    if (!modulo && !esElAlta) return;

    /* R8: la Ruta Esencial no tiene secciones ni videos propios, así que no
       tiene estas etapas. El reservado tampoco: no tiene contenido. */
    if (modulo && modulo.tipo !== "biblioteca") return;

    etapaVigente = etapaDelModulo();
    etapaActual = etapaDeLaPantalla();
    recorrido = armarRecorrido();

    /* `?guia=0` no es solo «cerrala si está abierta»: es «no me la muestres».
       Sin esto, entrar con el overlay limpio la abría igual por auto-arranque, y
       el link que se compartió justamente para no verla la mostraba. */
    if (pedida === "0") {
      if (activa()) salir();
      else S.cerrarGuia();
    }

    pintarDisparador();

    /* Un repintado borraría la barra y el disparador, y dejaría el popover
       anclado a un nodo que ya no está. Varias pantallas repintan después de
       mutar —`alta-videos` en cada tecleo, `modulo.html` al activar, y todas las
       que llaman a `UI.rebind()`—.

       Solo `childList`: los cambios de atributo que hace la guía no disparan el
       observador, y por eso no se realimenta. */
    const raices = [document.getElementById("contenido"), document.querySelector(".page-head")]
      .filter(Boolean);
    if (raices.length && window.MutationObserver) {
      /* El rebote va por `setTimeout`, no por `requestAnimationFrame`: rAF se
         estrangula cuando el documento no se está pintando —una pestaña de
         fondo, o un iframe que el navegador considera no visible— y ahí la
         compuerta no volvería a actualizarse nunca. */
      let pendiente = false;
      observador = new MutationObserver(function () {
        if (pendiente) return;
        pendiente = true;
        window.setTimeout(function () {
          pendiente = false;
          refrescar();
        }, 0);
      });
      raicesObservadas = raices;
      raices.forEach(function (r) {
        observador.observe(r, { childList: true, subtree: true });
      });
    }

    /* La compuerta se recalcula con cada interacción. En el `document` y en fase
       de burbuja, para que los handlers de la pantalla corran antes. */
    document.addEventListener("input", alInteractuar);
    document.addEventListener("change", alInteractuar);
    document.addEventListener("click", alInteractuar);

    if (activa() || pedida === "1") {
      if (pedida === "1" && !activa()) S.abrirGuia(modulo ? modulo.codigo : null);
      pintarBarra();
      mostrarPaso(primeroNoListo());
      pintarDisparador();
      return;
    }

    /* ── Auto-arranque ──────────────────────────────────────────────────────
       Una sola vez por escena, y solo donde arranca de verdad la funcionalidad:
       el alta de un módulo, y el detalle de un módulo sin terminar —que es el
       hub del recorrido—. Nunca en E1, que es la escena donde no hay nada
       cargado y la pantalla muestra su día 0. */
    const p = pantalla();
    const dondeArranca = p === "alta-modulo.html" ||
      (p === "modulo.html" && !!document.querySelector("[data-paso]"));
    if (dondeArranca && S.escena !== "E1" && !S.guiaVista() && !moduloTerminado() && hayAncla()) {
      entrar();
    }
  }

  if (enNavegador) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", init);
    } else {
      init();
    }
  }

  return {
    /* Contrato que audita `verificar()` — sin DOM. */
    pasos: pasos,
    texto: texto,
    campos: campos,
    textoLiteral: textoLiteral,
    /* Control desde la pantalla, si alguna vez hace falta. */
    entrar: entrar,
    salir: salir,
    refrescar: refrescar,
  };
})();
