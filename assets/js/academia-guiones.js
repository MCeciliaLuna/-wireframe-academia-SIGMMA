/* ============================================================================
   Academia SIGMMA · Backoffice — guiones
   ----------------------------------------------------------------------------
   Los 12 guiones del cohorte P1, VERBATIM de `Majo_3_Cohorte_P1_guiones`. Son
   los únicos que existen: el resto de los cohortes se guioniza cuando le toca,
   «para no escribir de más sobre un producto que cambia» (Maestro §5).

   Se carga después de `academia-data.js` y se cuelga de `ACADEMIA_DATA.guiones`.

   CORRECCIÓN DE NOMENCLATURA (decisión B-2)
   ------------------------------------------
   El documento de origen escribe **«SIGMA»** con una sola M, diez veces,
   incluido el título de `BAK-M00.010`. Acá se escribe **SIGMMA**, que es la
   sigla correcta de Sistema Integral de Gestión Multi Modal Administrativo. El
   documento fuente queda pendiente de corregir.

   ESTRUCTURA
   ----------
   No es texto libre: es la estructura del documento de Plantilla de Guión, que
   existe justamente para que los videos queden parejos aunque se graben en meses
   distintos.

     receta  · el estado del sistema ANTES de grabar
     intro   · a cámara, ~15 seg
     cuerpo  · voz sobre pantalla, pasos numerados, acotaciones entre corchetes
     cierre  · a cámara, ~10 seg, invitando a la evaluación del módulo
     notas   · producción
     noMostrar · lo específico de este video, además del estándar del cohorte

   La cadena de encadenamiento («viene de» / «sigue») NO se guarda: se deriva del
   orden de grabación del cohorte. Guardarla sería duplicar un dato que ya está
   en la relación video → cohorte, y quedaría desincronizada al reordenar.
   ========================================================================== */

(function () {
  "use strict";

  const D = window.ACADEMIA_DATA;
  if (!D) throw new Error("academia-guiones.js necesita academia-data.js cargado antes.");

  function g(video, o) {
    return {
      video: video,
      duracionObjetivo: o.duracion,
      receta: o.receta,
      intro: o.intro,
      cuerpo: o.cuerpo,
      cierre: o.cierre,
      notas: o.notas || "",
      noMostrar: o.noMostrar || null,
      evaluacion: o.evaluacion || "A diseñar post-grabación.",
    };
  }

  D.guiones = [
    /* ══════════ C01 · Arranque ══════════
       Escenario: sin datos cargados. Son los dos videos de entrada. */
    g("BAK-M00.010", {
      duracion: "3-4 min",
      receta: "Ninguna. Puede ser solo a cámara o con apoyo de una imagen simple.",
      intro: "Antes de tocar un solo botón, quiero que entiendas qué es SIGMMA. Dos minutos que te van a ordenar todo lo que viene.",
      cuerpo: [
        "SIGMMA es a tu agencia lo que el sistema operativo es a tu celular: la base sobre la que todo funciona y se conecta. [mostrar analogía simple]",
        "Tu equipo es el hardware; todo lo demás (mayoristas, GDS, herramientas) termina integrándose sobre SIGMMA.",
        "La idea rectora: lo que no está en SIGMMA, no existe para la empresa. Si un proceso queda afuera, la agencia queda «ciega» en ese punto.",
        "Todo está conectado: una venta que cargás impacta al mismo tiempo en lo operativo, lo administrativo y lo contable. Por eso importa completar los procesos, no solo cargar datos.",
      ],
      cierre: "Esa es la lógica de todo lo que sigue: cargar bien, una vez, y que el sistema haga el resto. Vamos a la navegación.",
      noMostrar: "Nada sensible.",
    }),
    g("BAK-M00.040", {
      duracion: "3-4 min",
      receta: "Estar deslogueado para mostrar el ingreso; usuario demo de Viajando.com.",
      intro: "Te muestro cómo entrar y cómo moverte por SIGMMA para que nunca te sientas perdido.",
      cuerpo: [
        "Ingreso con usuario y contraseña. [mostrar login]",
        "Al entrar, SIGMMA abre el último file en el que trabajaste; si es tu primera vez, vas a ver un cartel de «file inexistente». Es normal, no es un error. [mostrar]",
        "Recorrido del menú principal y los botones clave: file, clientes, pasajeros, proveedores. [señalar cada uno]",
        "La rueda de progreso del file: te dice cuánto te falta para completarlo. Más adelante vemos cómo se configura.",
      ],
      cierre: "Con esto ya te movés por SIGMMA. Ahora sí, vamos a crear nuestra primera reserva.",
      noMostrar: "Contraseña real.",
    }),

    /* ══════════ C02 · Alta de file y cliente ══════════
       Escenario compartido: partimos sin el cliente demo creado. Acá se crea el
       cliente y se abre el file que se usa también en C03. Los 6 se graban
       seguidos sobre el mismo escenario. */
    g("BAK-M10.010", {
      duracion: "2-3 min",
      receta: "Algunos files demo ya existentes en Viajando.com.",
      intro: "Antes de crear, buscar. Te muestro las tres formas de encontrar un file.",
      cuerpo: [
        "Por número de file. [mostrar]",
        "Con la lupa y los filtros. [mostrar]",
        "Listando por nombre del cliente. Regla práctica: siempre escribí al menos 3 letras o números.",
      ],
      cierre: "Buscar primero te evita duplicar. Ahora sí, creamos uno nuevo.",
    }),
    g("BAK-M10.020", {
      duracion: "4-5 min",
      receta: "Viene de M10.010, sin file nuevo creado todavía.",
      intro: "Vamos a abrir un file desde cero. Es el contenedor de toda la operación.",
      cuerpo: [
        "Botón de nuevo file. [mostrar]",
        "Elegir tipo de servicio: emisivo, receptivo, nacional, internacional. [mostrar opciones]",
        "Individual vs grupal: individual es uno que paga por todos; grupal, cada uno paga lo suyo y tiene su cuenta corriente. [explicar con el ejemplo demo]",
        "Cómo editar un file ya creado y dónde se guarda. Nada se pierde: todo queda registrado.",
      ],
      cierre: "Ya tenemos el file abierto. Le vamos a definir la moneda.",
    }),
    g("BAK-M10.030", {
      duracion: "3 min",
      receta: "El file recién creado en M10.020.",
      intro: "Este concepto evita el 90% de los errores de plata. Prestá atención.",
      cuerpo: [
        "Moneda de registro: cómo cotizás. Fija la cuenta corriente y no se cambia. [mostrar]",
        "Moneda de documento: cómo te paga el cliente. Puede fluctuar y lleva tipo de cambio. [mostrar]",
        "Ejemplo: cotizo en dólares (registro) y el cliente paga en pesos (documento).",
      ],
      cierre: "Registro es cómo cotizás; documento es cómo te pagan. Ahora cargamos al cliente.",
    }),
    g("BAK-M20.010", {
      duracion: "4-5 min",
      receta: "El cliente demo todavía NO existe; se crea acá.",
      intro: "Damos de alta un cliente. Te muestro el atajo que te ahorra tipear todo.",
      cuerpo: [
        "Antes de crear, buscar (por si ya existe de una compra vieja). [mostrar]",
        "Persona física vs jurídica. [mostrar diferencia]",
        "Autocompletar por CUIT con ARCA: cargás el CUIT y trae los datos. [mostrar]",
        "Recorrido rápido de las solapas; hoy nos quedamos con lo básico de la solapa personal.",
      ],
      cierre: "Cliente creado. Pero cuidado con una diferencia clave que veremos ahora: cliente no es lo mismo que pasajero.",
    }),
    g("BAK-M20.030", {
      duracion: "3 min",
      receta: "El cliente creado en M20.010.",
      intro: "La confusión más común de todas, y la más fácil de aclarar.",
      cuerpo: [
        "El cliente tiene cuenta corriente; el pasajero no. [mostrar]",
        "Persona jurídica que paga por sus empleados: es cliente, no pasajero. [ejemplo]",
        "Persona física que viaja: queda como cliente y como pasajero a la vez. [ejemplo]",
      ],
      cierre: "Cliente es quien paga; pasajero es quien viaja. A veces son la misma persona, a veces no. Cargamos el pasajero.",
    }),
    g("BAK-M20.040", {
      duracion: "3-4 min",
      receta: "El file y el cliente ya cargados.",
      intro: "Sumamos a quien viaja y te muestro un par de detalles que después agradecés.",
      cuerpo: [
        "Agregar pasajero al file. [mostrar]",
        "Marcar el pasajero principal (queda destacado). [mostrar]",
        "Opción «agregar a la base de clientes» para reutilizarlo. [mostrar]",
        "Selección múltiple cuando son varios.",
      ],
      cierre: "Ya tenemos file, cliente y pasajero. En la próxima tanda le cargamos el servicio, que es el corazón del sistema.",
    }),

    /* ══════════ C03 · Voucher y cobro ══════════
       Escenario compartido: se sigue con el file que quedó armado en C02
       (cliente + pasajero cargados). Acá se le agrega el servicio y se cobra. */
    g("BAK-M30.010", {
      duracion: "3 min",
      receta: "El file de C02.",
      intro: "El voucher es el corazón de SIGMMA. Entendé qué es antes de cargarlo.",
      cuerpo: [
        "El voucher es cómo SIGMMA llama a cargar un servicio. [mostrar]",
        "Tiene dos perfiles: operativo (el itinerario que le das al pasajero) y administrativo (venta, costo y utilidad). [mostrar ambos]",
        "Regla: un voucher por proveedor.",
      ],
      cierre: "Un servicio = un voucher = dos caras, la del pasajero y la de tu bolsillo. Vamos a cargar uno.",
    }),
    g("BAK-M30.020", {
      duracion: "4-5 min",
      receta: "El file de C02, con un proveedor demo disponible.",
      intro: "Cargamos un servicio real paso a paso.",
      cuerpo: [
        "Elegir tipo y subtipo de servicio. [mostrar]",
        "Asociar el proveedor (siempre antes de seguir). [mostrar]",
        "Cargar venta y costo básicos. [mostrar]",
        "Guardar el voucher dentro del file.",
      ],
      cierre: "Servicio cargado. Falta un paso que mucha gente olvida y es clave: procesarlo.",
    }),
    g("BAK-M30.050", {
      duracion: "2-3 min",
      receta: "El voucher recién cargado en M30.020.",
      intro: "El paso que hace que todo impacte donde tiene que impactar.",
      cuerpo: [
        "Qué significa procesar el voucher. [mostrar botón]",
        "Al procesar, impacta en la cuenta del proveedor y aparece en los informes. Sin procesar, no existe para la administración. [mostrar el antes y después]",
      ],
      cierre: "Regla de oro: voucher que no se procesa, es plata que no se ve. Ahora cobramos.",
    }),
    g("BAK-M40.010", {
      duracion: "4-5 min",
      receta: "El file con voucher procesado.",
      intro: "Cerramos el circuito: cobrar. Te muestro los tres modos de recibo.",
      cuerpo: [
        "Recibo indicado: con el file ya posicionado. [mostrar]",
        "Recibo automático: sin un servicio puntual asociado. [mostrar]",
        "Recibo detallado: varios files de un mismo cliente en un recibo. [mostrar]",
        "Emitir el recibo y ver cómo impacta en la cuenta del cliente y en la caja.",
      ],
      cierre: "Y con esto hiciste una reserva completa: file, cliente, pasajero, servicio y cobro. Cuando termines el módulo, hacé la evaluación para afianzar todo esto.",
    }),
  ];

  /* Preparación previa a TODO el cohorte P1, del encabezado del documento. La
     consume la hoja de cohorte en modo sesión. */
  D.preparacionP1 =
    "Tener listo en Viajando.com un cliente demo que todavía NO exista (para poder crearlo en " +
    "cámara) y decidir un file de ejemplo que se irá completando a lo largo de C02 y C03. " +
    "Sugerencia de datos demo: pasajero «Juan Demo», destino Madrid, salida a 30 días.";

  /* El cierre del cohorte, que explica por qué P1 se graba primero y en este
     orden. Es el argumento del encadenamiento. */
  D.cierreP1 =
    "Con estos 12, Viajando.com queda con un file demo completo de punta a punta, que sirve de base " +
    "para grabar los cohortes siguientes (facturación, pagos, caja) sin volver a armar todo. Al " +
    "terminar de grabar cada video, cargarlo en el tablero con estado «publicado» y recién ahí se " +
    "diseña su evaluación.";
})();
