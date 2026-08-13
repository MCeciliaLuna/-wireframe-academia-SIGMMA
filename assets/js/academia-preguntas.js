/* ============================================================================
   Academia SIGMMA · Backoffice — bancos de preguntas
   ----------------------------------------------------------------------------
   El banco es DEL MÓDULO (`MD-PROYECTO-CLAUDE.md` §2 y §3.4): 50 preguntas por
   módulo, cada una con `subtema` obligatorio. El `subtema` es el título de una
   sección de su módulo, y eso es lo que permite exigir cobertura por sección y
   que el sorteo de 10 no deje afuera un concepto central.

   Cada pregunta declara además su VIDEO DE ORIGEN. El banco no es del video
   —un video no tiene banco propio— pero la pregunta sí sabe de dónde salió, y
   es lo que permite invalidarla cuando ese video se regraba.

   Va en un archivo aparte de `academia-data.js` a propósito: 550 preguntas
   metidas en el medio del árbol de módulos lo volverían innavegable. Se carga
   DESPUÉS de `academia-data.js` y ANTES de `academia-sim.js`, y se cuelga de
   `ACADEMIA_DATA.preguntas`.

   TRES CAPAS
   ----------
   1 · REUTILIZADAS (`origen: "reutilizada"`). Las 48 escritas del repo
       `academia-AGENCIA`, verbatim. Vienen con `subtema` de las secciones de ese
       repo; acá se remapean al video que les corresponde, y de ahí sale la
       sección del backoffice. Para `BAK-M30` el remapeo es obligatorio: sus
       secciones son distintas en los dos repos.

   2 · ESCRITAS (`origen: "escrita"`). Las 9 que ya estaban en `banco.html`
       —enunciado verbatim, opciones nuevas, porque el wireframe solo mostraba
       el título— y las nuevas de los módulos que no tenían ninguna.

   3 · ESTRUCTURALES (`origen: "estructural"`). El relleno hasta llegar a 50 por
       módulo. Preguntan por la ESTRUCTURA del módulo —a qué sección pertenece
       cada video, qué videos la componen, en qué orden van— y no afirman nada
       sobre cómo funciona SIGMMA, que es justamente lo que no se puede
       inventar. Van marcadas para que la interfaz pueda avisarlo: un banco con
       relleno estructural no es un banco terminado.

   CUÁNDO EXISTE CADA PREGUNTA
   ---------------------------
   `creadaEn` es la escena a partir de la cual la pregunta existe, y se resuelve
   por CUPO: cada video declara cuántas preguntas tiene que tener en E3, E4 y E5,
   y el resto del banco se crea en E6. Modelarlo por cupo y no a mano garantiza
   que el banco no pueda achicarse entre escenas sucesivas.

   Los cupos salen de los números ya verificados del prototipo:
     · E3 · 10 preguntas — los 2 videos publicados de C01
     · E4 · 60 preguntas — el hito de lanzamiento
     · E5 · 166 preguntas, de las cuales 153 vigentes — los del listado de módulos
     · E6 · 550 — el banco completo, 50 por módulo

   Sobre las 60 de E4: el documento de origen las describe como «5 por video
   publicado». No puede ser literal: `BAK-M30.050` está publicado en E4 y en E5
   tiene 0 preguntas —el propio banco lo lista en «deuda de evaluación»— y una
   pregunta no desaparece. Las 60 son el AGREGADO. El reparto de acá lo respeta
   y sigue sumando 60.
   ========================================================================== */

(function () {
  "use strict";

  const D = window.ACADEMIA_DATA;
  if (!D) throw new Error("academia-preguntas.js necesita academia-data.js cargado antes.");

  /* -- Cupos por video ------------------------------------------------------
     Cuántas preguntas tiene cada video en cada escena. Lo que no está acá está
     en cero hasta E6, donde el banco se completa. Los cupos son acumulativos y
     no pueden bajar: la verificación lo controla. */
  const CUPOS = {
    /* E3 · 10 · los dos videos publicados de C01 */
    "BAK-M00.010": { E3: 5, E4: 6, E5: 8 },
    "BAK-M00.040": { E3: 5, E4: 5, E5: 8 },
    /* E4 · 60 · el hito de lanzamiento */
    "BAK-M10.010": { E4: 5, E5: 9 },
    "BAK-M10.020": { E4: 5, E5: 9 },
    "BAK-M10.030": { E4: 5, E5: 9 },
    "BAK-M20.010": { E4: 5, E5: 6 },
    "BAK-M20.030": { E4: 5, E5: 6 },
    "BAK-M20.040": { E4: 5, E5: 5 },
    "BAK-M30.010": { E4: 6, E5: 6 },
    "BAK-M30.020": { E4: 8, E5: 8 },
    "BAK-M40.010": { E4: 5, E5: 8 },
    /* E5 · el resto del régimen */
    "BAK-M00.020": { E5: 9 },
    "BAK-M10.040": { E5: 8 },
    "BAK-M20.020": { E5: 5 },
    "BAK-M30.040": { E5: 7 },
    "BAK-M30.060": { E5: 7 },
    "BAK-M40.020": { E5: 11 },
    "BAK-M40.030": { E5: 11 },
    "BAK-M60.010": { E5: 6 },
    "BAK-M60.020": { E5: 6 },
    "BAK-M60.030": { E5: 3 },
    "BAK-M70.020": { E5: 2 },
    "BAK-M70.030": { E5: 9 },
    /* -- Sin cupo hasta E6 ---------------------------------------------------
       Nueve de estos videos están PUBLICADOS y sin ninguna pregunta en régimen,
       y eso no es un descuido del dataset: es el tile «Publicados sin pregunta:
       9» del tablero y la «deuda de evaluación» del banco. La checklist de
       publicación advierte, no bloquea (D-1), así que un video puede estar en el
       Front antes de tener con qué evaluarlo — y el sistema tiene que decirlo.

       Los nueve: M00.030 · M10.060 · M20.050 · M20.060 · M30.050 · M40.040 ·
       M40.050 · M60.040 · M70.040.

       El resto no tiene cupo por otras razones: `BAK-M10.050` está obsoleto,
       `BAK-M30.030` / `.070` y `BAK-M70.010` todavía no se publicaron, y M50,
       M80, M90 y M95 no tienen ningún video publicado en E5. */
  };

  /* -- Capa 1 y 2 · preguntas escritas -------------------------------------
     `q(video, texto, opciones, correcta, origen, borrador)`. La sección la
     resuelve el video: no se declara dos veces. */
  function q(video, texto, opciones, correcta, origen, borrador) {
    return {
      video: video,
      texto: texto,
      opciones: opciones,
      correcta: correcta,
      origen: origen || "escrita",
      borrador: !!borrador,
    };
  }
  /* Reutilizada verbatim del repo agencia. */
  function r(video, texto, opciones, correcta) {
    return q(video, texto, opciones, correcta, "reutilizada");
  }

  const escritas = [
    /* ══════════ BAK-M00 · Fundamentos ══════════ */
    r("BAK-M00.010", "¿Qué rol cumple SIGMMA dentro de la operación de una agencia?", [
      "Es una herramienta de facturación que se usa solo al cierre del mes.",
      "Es el sistema donde se registra y administra toda la operación de la agencia.",
      "Es un canal de venta al público que reemplaza la web de la agencia.",
      "Es un repositorio de tarifas para consultar antes de cotizar.",
    ], 1),
    r("BAK-M00.020", "En el ciclo 360° de la operación turística, ¿qué tres caras se articulan?", [
      "Vendedor, cajero y contador.",
      "Agencia, banco y organismo fiscal.",
      "Cliente, prestador y utilidad.",
      "Cotización, reserva y voucher.",
    ], 2),
    r("BAK-M00.020", "¿Cuál de estas afirmaciones describe mejor la relación entre las tres caras del ciclo?", [
      "Son circuitos independientes que no se cruzan entre sí.",
      "La utilidad es la consecuencia de lo que se le cobra al cliente y de lo que se le paga al prestador.",
      "El prestador y el cliente son siempre la misma entidad.",
      "La utilidad se define antes de cargar el cliente.",
    ], 1),
    r("BAK-M00.020", "¿Qué implica pensar la operación como un ciclo y no como tareas sueltas?", [
      "Que cada paso condiciona al siguiente y deja rastro en el que viene después.",
      "Que hay que completar todos los pasos el mismo día.",
      "Que el orden de los pasos lo elige cada agencia libremente.",
      "Que un paso mal cargado no afecta a los demás.",
    ], 0),
    r("BAK-M00.030", "¿Qué quiere decir que los procesos del sistema estén atomizados?", [
      "Que cada paso se registra como una unidad propia y trazable.",
      "Que todos los pasos se ejecutan juntos en una sola pantalla.",
      "Que el sistema se divide en instalaciones separadas por sucursal.",
      "Que cada usuario define su propio circuito de trabajo.",
    ], 0),
    r("BAK-M00.030", "¿Por qué conviene registrar cada movimiento en el sistema y no resolverlo por fuera?", [
      "Porque el sistema no permite cargar movimientos con fecha anterior.",
      "Porque de lo contrario se pierde el descuento del proveedor.",
      "Porque la trazabilidad y los saldos dependen de que todo movimiento quede registrado.",
      "Porque es un requisito para poder acceder a la Academia.",
    ], 2),
    r("BAK-M00.030", "¿Para qué sirve conocer los principios del sistema antes de operarlo?", [
      "Para poder configurar los permisos de los usuarios.",
      "Para saber de memoria en qué menú está cada botón.",
      "Para entender por qué el sistema pide cada dato y no solo dónde se carga.",
      "Para poder saltear los pasos que no apliquen a la agencia.",
    ], 2),
    r("BAK-M00.030", "¿Qué se gana cuando cada tarea queda registrada como un paso propio?", [
      "Se puede saber quién hizo qué y cuándo, sin reconstruirlo de memoria.",
      "Se reduce la cantidad de datos que hay que cargar.",
      "Se pueden eliminar movimientos sin dejar rastro.",
      "Se acelera el cierre contable sin necesidad de revisarlo.",
    ], 0),
    r("BAK-M00.040", "¿Qué ofrece el acceso al último file desde la pantalla principal?", [
      "Un listado de todos los files de la agencia ordenado por fecha.",
      "Un atajo para retomar el file en el que se estaba trabajando.",
      "Un informe de los files cerrados en el mes.",
      "Una copia del último file creado, para reutilizarlo.",
    ], 1),
    r("BAK-M00.040", "¿Qué comunica la rueda de progreso?", [
      "El porcentaje de la capacitación de la Academia que ya se completó.",
      "El tiempo restante hasta el cierre del período.",
      "El avance de la operación sobre los pasos que le faltan.",
      "La cantidad de usuarios conectados al sistema.",
    ], 2),
    r("BAK-M00.040", "¿Cuál es la vía de ingreso al sistema?", [
      "Las credenciales de sigmma.net.",
      "Un código que envía soporte cada mañana.",
      "Un acceso local por equipo, sin usuario.",
      "Las credenciales del organismo fiscal.",
    ], 0),
    r("BAK-M00.040", "¿Por qué conviene reconocer la estructura del menú antes de empezar a operar?", [
      "Porque el menú cambia de orden según el día de la semana.",
      "Porque cada agencia tiene que armar su propio menú.",
      "Porque el menú refleja el circuito de la operación, no una lista alfabética.",
      "Porque el menú se oculta después del primer ingreso.",
    ], 2),

    /* ══════════ BAK-M10 · File ══════════ */
    r("BAK-M10.010", "¿Cuáles son las vías para localizar un file existente?", [
      "Únicamente el número de file.",
      "El número, los filtros de búsqueda y el nombre.",
      "Solo el nombre del pasajero titular.",
      "Solo la fecha de creación.",
    ], 1),
    r("BAK-M10.020", "Al crear un file, ¿qué definición condiciona cómo se va a operar después?", [
      "El tipo de servicio y si es individual o grupal.",
      "El color de la etiqueta del file.",
      "El vendedor que lo abre.",
      "La cantidad de vouchers que va a tener.",
    ], 0),
    r("BAK-M10.020", "¿Qué diferencia hay entre un file individual y uno grupal?", [
      "El grupal no admite facturación.",
      "El individual no permite cargar más de un servicio.",
      "El grupal agrupa una salida con varios files vinculados.",
      "No hay diferencia funcional, solo de nombre.",
    ], 2),
    r("BAK-M10.030", "¿Qué distingue la moneda de registro de la moneda de documento?", [
      "La de registro es la del sistema y la de documento es la del comprobante que se emite.",
      "Son sinónimos: el sistema usa una sola moneda por file.",
      "La de registro se define al cerrar el file.",
      "La de documento solo aplica a los files grupales.",
    ], 0),
    r("BAK-M10.030", "¿Por qué la definición de moneda del file no es un dato menor?", [
      "Porque determina el idioma de los comprobantes.",
      "Porque arrastra al resto del circuito: valorización, cobranza y facturación.",
      "Porque define quién puede ver el file.",
      "Porque condiciona la cantidad de pasajeros admitidos.",
    ], 1),
    r("BAK-M10.040", "¿Para qué sirve el destino IATA en los datos del file?", [
      "Para calcular automáticamente la comisión del vendedor.",
      "Para autorizar la emisión del voucher.",
      "Para identificar el destino de forma normalizada y poder segmentar después.",
      "Para determinar la moneda de registro.",
    ], 2),
    r("BAK-M10.040", "¿Para qué se usa la segmentación en los datos del file?", [
      "Para dividir el cobro entre pasajeros.",
      "Para separar el file en varios files independientes.",
      "Para clasificar la operación y poder analizarla después en los informes.",
      "Para asignar el file a una caja distinta.",
    ], 2),
    /* Estas dos son de `BAK-M10.050`, que quedó OBSOLETO. Se conservan porque el
       enunciado es real, y la interfaz las muestra como `a revisar`: una
       pregunta sobre una funcionalidad dada de baja no se puede tomar. */
    r("BAK-M10.050", "Sobre los estados del file, ¿qué afirmación es correcta?", [
      "Hay estados que el sistema resuelve solo y otros que se definen a mano.",
      "Todos los estados se cargan manualmente.",
      "El estado del file lo define el proveedor.",
      "Un file no cambia de estado una vez creado.",
    ], 0),
    r("BAK-M10.050", "¿Qué implica cerrar un file?", [
      "Que se elimina del sistema junto con sus movimientos.",
      "Que se da por terminada su operación y deja de admitir movimientos nuevos.",
      "Que se archiva y no se puede volver a consultar.",
      "Que se transfiere al circuito contable de forma automática.",
    ], 1),
    r("BAK-M10.060", "En una salida grupal, ¿qué relación se establece entre los files?", [
      "Se vinculan al file de la salida, que los agrupa.",
      "Se fusionan en un único file y los demás se dan de baja.",
      "Se replican con el mismo número de file.",
      "Quedan sueltos: el grupo se controla por fuera del sistema.",
    ], 0),
    r("BAK-M10.060", "¿Qué información consolida el informe de salida?", [
      "El estado de las cajas de la agencia.",
      "El detalle de la salida grupal con los files que la componen.",
      "El listado de proveedores con saldo pendiente.",
      "Las comisiones de los vendedores del mes.",
    ], 1),
    r("BAK-M10.060", "¿Cuándo conviene trabajar con un file grupal en lugar de files sueltos?", [
      "Cuando la operación se paga en más de una moneda.",
      "Cuando el file lleva más de un voucher.",
      "Cuando varios pasajeros comparten una misma salida y hay que verla como conjunto.",
      "Cuando la venta la hace más de un vendedor.",
    ], 2),

    /* ══════════ BAK-M20 · Entidades ══════════ */
    r("BAK-M20.010", "Al cargar un cliente, ¿qué determina la distinción entre físico y jurídico?", [
      "El monto de la operación.",
      "Si es una persona o una empresa, con los datos fiscales que corresponden a cada caso.",
      "Si viaja o no viaja.",
      "Si paga en efectivo o con transferencia.",
    ], 1),
    r("BAK-M20.010", "¿Qué aporta el autocompletado por CUIT al dar de alta un cliente?", [
      "Trae los datos fiscales ya normalizados y evita cargarlos a mano.",
      "Asigna automáticamente el vendedor responsable.",
      "Define la moneda de la operación.",
      "Habilita la cuenta corriente sin necesidad de aprobación.",
    ], 0),
    r("BAK-M20.020", "¿Qué se resuelve en las solapas de la ficha del cliente?", [
      "El estado de los vouchers asociados.",
      "El cierre de su cuenta corriente.",
      "Documentación, tarjetas, clasificación y adjuntos del cliente.",
      "La emisión de su factura.",
    ], 2),
    r("BAK-M20.020", "¿Para qué sirve clasificar a un cliente?", [
      "Para bloquearle la posibilidad de operar en cuenta corriente.",
      "Para agruparlo según criterios de la agencia y poder analizarlo después.",
      "Para asignarle un número de file fijo.",
      "Para definir en qué caja se registran sus cobros.",
    ], 1),
    r("BAK-M20.030", "¿Cuál es la diferencia entre cliente y pasajero?", [
      "Son la misma entidad con dos nombres según la pantalla.",
      "El cliente es quien viaja y el pasajero es quien paga.",
      "El cliente es quien contrata y el pasajero es quien viaja; pueden coincidir o no.",
      "El pasajero solo existe en los files grupales.",
    ], 2),
    r("BAK-M20.030", "Una empresa contrata un viaje para dos de sus empleados. ¿Cómo se registra?", [
      "La empresa como cliente y cada empleado como pasajero.",
      "Cada empleado como cliente, porque son los que viajan.",
      "La empresa como pasajero y los empleados como clientes.",
      "Se abre un file por empleado, sin registrar a la empresa.",
    ], 0),
    r("BAK-M20.040", "¿Qué identifica al pax principal dentro de un file?", [
      "Es el pasajero de mayor edad del grupo.",
      "Es el pasajero de referencia de la operación.",
      "Es el pasajero que paga la operación.",
      "Es el primer pasajero que se carga, sin otro efecto.",
    ], 1),
    r("BAK-M20.040", "¿Qué permite agregar un pasajero a la base de clientes?", [
      "Convertirlo automáticamente en cliente jurídico.",
      "Habilitarle una cuenta corriente propia de forma automática.",
      "Reutilizar sus datos como cliente en operaciones siguientes.",
      "Facturarle sin necesidad de categoría de IVA.",
    ], 2),
    r("BAK-M20.050", "¿Qué distingue a un proveedor turístico de uno no turístico?", [
      "El proveedor turístico presta el servicio que se vende; el no turístico cubre gastos de la agencia.",
      "El no turístico no admite orden de pago.",
      "El turístico se carga como cliente y el no turístico como proveedor.",
      "La diferencia es solo de clasificación, sin efecto en el circuito.",
    ], 0),
    r("BAK-M20.060", "¿En qué momento resulta más útil la importación desde Excel?", [
      "En el cierre contable de cada período.",
      "En la migración inicial, para no cargar la base a mano.",
      "Cada vez que se emite un voucher.",
      "Al generar el informe de vencimientos.",
    ], 1),
    r("BAK-M20.060", "¿Qué entidades se pueden cargar de forma masiva?", [
      "Solo los clientes.",
      "Solo los proveedores.",
      "Clientes y proveedores.",
      "Clientes, proveedores y vouchers.",
    ], 2),
    r("BAK-M20.060", "¿Por qué conviene revisar la base antes de importarla?", [
      "Porque el sistema no admite correcciones posteriores.",
      "Porque la importación bloquea la carga manual durante 24 horas.",
      "Porque un dato mal cargado se replica en todas las operaciones que usen esa entidad.",
      "Porque solo se puede importar una vez por agencia.",
    ], 2),

    /* ══════════ BAK-M30 · Voucher / Servicios ══════════
       Las 9 de `banco.html` van primero: son las que el prototipo ya mostraba,
       con su enunciado verbatim. Las opciones son nuevas —el wireframe solo
       tenía el título— y son de muestra. */
    q("BAK-M30.010", "¿Qué documenta un voucher?", [
      "El cobro que se le hizo al cliente por el servicio.",
      "El servicio vendido, con su cara operativa y su cara administrativa.",
      "La factura que emitió el proveedor del servicio.",
      "El saldo de la cuenta corriente del pasajero.",
    ], 1),
    /* El borrador de `BAK-M30.010`: es el que hace que la sección 1 muestre
       5 vigentes de 6. */
    q("BAK-M30.010", "El voucher se emite a nombre de…", [
      "el pasajero que va a recibir el servicio.",
      "el cliente que contrató la operación.",
      "la agencia que vendió el servicio.",
      "el proveedor que lo presta.",
    ], 0, "escrita", true),
    q("BAK-M30.020", "Los servicios se cargan al voucher desde…", [
      "el tarifario del proveedor o a mano, según el tipo de servicio.",
      "el informe de vencimientos.",
      "la ficha del cliente.",
      "la caja del vendedor.",
    ], 0),
    q("BAK-M30.020", "¿Qué dato es obligatorio para cargar el voucher?", [
      "El número de factura del proveedor.",
      "El proveedor del servicio.",
      "La categoría de IVA del pasajero.",
      "La caja donde se va a cobrar.",
    ], 1),
    q("BAK-M30.040", "¿Sobre qué base se calcula el IVA del servicio?", [
      "Sobre el total facturado al cliente, sin distinguir conceptos.",
      "Sobre la comisión del vendedor.",
      "Sobre el concepto imputado, que separa lo exento de lo gravado.",
      "Sobre el saldo de la cuenta del proveedor.",
    ], 2),
    q("BAK-M30.040", "El impuesto país se imputa como…", [
      "un concepto propio, separado del servicio.",
      "parte del costo del prestador.",
      "una comisión negativa.",
      "un ajuste de la cuenta corriente.",
    ], 0),
    q("BAK-M30.060", "¿Qué estado impide modificar el voucher?", [
      "El estado de carga inicial.",
      "El estado procesado.",
      "El estado de cotización.",
      "Ninguno: el voucher se puede modificar siempre.",
    ], 1),
    q("BAK-M30.060", "Anular un voucher procesado implica…", [
      "eliminarlo del file sin dejar rastro.",
      "revertir su impacto en la cuenta del proveedor.",
      "cerrar el file automáticamente.",
      "emitir una nota de crédito al pasajero.",
    ], 1),
    q("BAK-M30.060", "¿Desde qué estado se puede reimprimir el voucher?", [
      "Solo desde el estado de carga.",
      "Desde cualquier estado posterior a la emisión.",
      "Solo desde el estado anulado.",
      "No se puede reimprimir: se emite una sola vez.",
    ], 1),
    /* Las 12 reutilizadas del repo agencia, remapeadas a las secciones del
       backoffice: en el otro repo `BAK-M30` tiene otras cuatro secciones. */
    r("BAK-M30.010", "¿Qué representa el voucher dentro del file?", [
      "El comprobante de cobro al cliente.",
      "El servicio vendido, con su cara operativa y su cara administrativa.",
      "La factura del proveedor.",
      "El resumen de la cuenta corriente del cliente.",
    ], 1),
    r("BAK-M30.010", "¿A qué se refiere el perfil operativo del voucher?", [
      "Al detalle del servicio: qué se presta, cuándo y a quién.",
      "Al margen y los impuestos del servicio.",
      "Al estado de la cuenta del proveedor.",
      "Al comprobante que se le entrega al pasajero.",
    ], 0),
    r("BAK-M30.020", "Al cargar un voucher, ¿qué define el tipo y el subtipo?", [
      "La moneda en la que se va a cobrar.",
      "El vendedor que percibe la comisión.",
      "La naturaleza del servicio que se está vendiendo.",
      "El estado inicial del file.",
    ], 2),
    r("BAK-M30.030", "¿Qué diferencia hay entre comisión y utilidad?", [
      "La comisión es lo que reconoce el proveedor; la utilidad es el resultado del servicio para la agencia.",
      "Son sinónimos, cambia el nombre según el tipo de voucher.",
      "La comisión la define la agencia y la utilidad el pasajero.",
      "La utilidad solo existe en los servicios exentos.",
    ], 0),
    r("BAK-M30.030", "¿Sobre qué se calcula el margen de un servicio?", [
      "Sobre lo que se le cobra al cliente y lo que se le paga al prestador.",
      "Sobre el total facturado en el período.",
      "Sobre el saldo de la cuenta corriente del cliente.",
      "Sobre la comisión del vendedor.",
    ], 0),
    r("BAK-M30.040", "¿Por qué hay que separar el aéreo del terrestre en los conceptos impositivos?", [
      "Porque se cargan en files distintos.",
      "Porque no reciben el mismo tratamiento frente al IVA.",
      "Porque el aéreo no admite comisión.",
      "Porque el terrestre no se puede facturar.",
    ], 1),
    r("BAK-M30.040", "¿Qué consecuencia tiene cargar mal los conceptos impositivos de un voucher?", [
      "Ninguna: se corrige al facturar.",
      "El voucher no se puede procesar.",
      "Se arrastra el error a la facturación y al resultado del servicio.",
      "El sistema recalcula los impuestos automáticamente al cerrar el file.",
    ], 2),
    r("BAK-M30.050", "¿Qué produce el procesamiento de un voucher?", [
      "La emisión de la factura al pasajero.",
      "El impacto del servicio en la cuenta del proveedor.",
      "El cierre del file.",
      "La generación del recibo de cobro.",
    ], 1),
    r("BAK-M30.050", "¿Por qué es el paso que más se olvida?", [
      "Porque el sistema lo pide recién al cierre del período.",
      "Porque lo tiene que hacer el proveedor.",
      "Porque el voucher ya se ve cargado y completo, aunque todavía no impactó.",
      "Porque solo aplica a los servicios en moneda extranjera.",
    ], 2),
    r("BAK-M30.060", "¿Qué informa el estado de un voucher?", [
      "En qué punto del circuito está el servicio.",
      "Cuánto se le cobró al cliente.",
      "Qué vendedor lo cargó.",
      "Si el pasajero confirmó su asistencia.",
    ], 0),
    r("BAK-M30.070", "¿Para qué sirven los modelos de venta?", [
      "Para archivar los vouchers de files cerrados.",
      "Para armar plantillas reutilizables de servicios que se venden seguido.",
      "Para exportar los vouchers a Excel.",
      "Para agrupar vouchers de distintos files en una factura.",
    ], 1),
    r("BAK-M30.070", "¿Qué se gana al trabajar con modelos?", [
      "Se puede facturar sin procesar el voucher.",
      "Se elimina la necesidad de cargar el proveedor.",
      "Se reduce el tiempo de carga y la posibilidad de error en ventas repetidas.",
      "Se obtiene una comisión diferencial del proveedor.",
    ], 2),

    /* ══════════ BAK-M40 · Cobranzas / Recibos ══════════ */
    q("BAK-M40.010", "¿Qué documenta el recibo de cobranza?", [
      "El servicio que se le vendió al cliente.",
      "El ingreso de valores por parte del cliente.",
      "La deuda de la agencia con el proveedor.",
      "El cierre de la caja del vendedor.",
    ], 1),
    q("BAK-M40.010", "¿Qué distingue el modo indicado del modo automático al emitir un recibo?", [
      "En el indicado se elige a qué se imputa el cobro; en el automático lo resuelve el sistema.",
      "El indicado solo admite efectivo.",
      "El automático no genera comprobante.",
      "El indicado no impacta en la cuenta corriente.",
    ], 0),
    q("BAK-M40.010", "¿Cuándo conviene el modo detallado?", [
      "Cuando el cobro se aplica a varios conceptos y hay que discriminar cada uno.",
      "Cuando el cliente paga en una sola moneda.",
      "Cuando el file todavía no tiene voucher.",
      "Cuando el cobro es parcial.",
    ], 0),
    q("BAK-M40.020", "¿Qué es un valor de tercero (TR3 / TC3)?", [
      "Un valor emitido por alguien distinto del cliente que paga.",
      "Un valor en moneda extranjera.",
      "Un valor que se acredita recién al cierre del mes.",
      "Un valor que no requiere recibo.",
    ], 0),
    q("BAK-M40.020", "¿Por qué el sistema distingue el tipo de valor con el que se cobra?", [
      "Porque cada tipo tiene un circuito y un momento de acreditación distintos.",
      "Porque cambia la comisión del vendedor.",
      "Porque define la moneda del file.",
      "Porque determina el número de recibo.",
    ], 0),
    q("BAK-M40.030", "En un recibo con moneda distinta a la del file, ¿qué dato es indispensable?", [
      "El tipo de cambio aplicado.",
      "La categoría de IVA del cliente.",
      "El destino IATA del file.",
      "El número de voucher.",
    ], 0),
    q("BAK-M40.030", "¿Por qué el tipo de cambio del recibo no puede quedar sin registrar?", [
      "Porque de él depende cuánto se imputa realmente a la deuda del cliente.",
      "Porque sin él no se puede imprimir el comprobante.",
      "Porque el sistema bloquea la caja.",
      "Porque cambia el estado del voucher.",
    ], 0),
    q("BAK-M40.040", "¿Qué diferencia una devolución de un egreso de caja?", [
      "La devolución se le reintegra al cliente; el egreso es una salida de dinero de la agencia por otro motivo.",
      "Son el mismo movimiento con dos nombres.",
      "La devolución no deja registro contable.",
      "El egreso solo aplica a proveedores.",
    ], 0),
    q("BAK-M40.050", "¿Qué muestra la cuenta corriente de un cliente?", [
      "El saldo entre lo que se le facturó y lo que efectivamente pagó.",
      "Los vouchers que tiene sin procesar.",
      "Las comisiones que generó para el vendedor.",
      "Los files que tiene abiertos.",
    ], 0),
    q("BAK-M40.050", "¿Por qué la cuenta corriente se lleva por moneda?", [
      "Porque un saldo en pesos y uno en dólares no se pueden sumar sin definir un tipo de cambio.",
      "Porque cada moneda tiene un cliente distinto.",
      "Porque el sistema no admite más de una moneda por file.",
      "Porque lo exige el organismo fiscal.",
    ], 0),

    /* ══════════ BAK-M50 · Facturación ══════════ */
    q("BAK-M50.010", "¿Qué diferencia hay entre facturar por servicio y facturar por producto?", [
      "Por servicio se factura cada voucher; por producto se factura el paquete armado.",
      "Por servicio no se puede facturar a una empresa.",
      "Por producto no se emite comprobante fiscal.",
      "Es la misma operación con distinto nombre.",
    ], 0),
    q("BAK-M50.010", "¿A quién se le emite la factura de una operación?", [
      "Siempre al pasajero que viaja.",
      "Al cliente que contrató, que puede no ser el pasajero.",
      "Al proveedor del servicio.",
      "A la agencia que vendió.",
    ], 1),
    q("BAK-M50.020", "¿Qué determina si corresponde factura A o B?", [
      "La categoría de IVA del cliente.",
      "El monto de la operación.",
      "La moneda del file.",
      "El tipo de servicio vendido.",
    ], 0),
    q("BAK-M50.020", "¿Qué es el CAE de un comprobante?", [
      "La autorización del organismo fiscal para el comprobante emitido.",
      "El código interno del file.",
      "El número de recibo asociado.",
      "La clave de acceso del cliente.",
    ], 0),
    q("BAK-M50.030", "¿Por qué hay que verificar el voucher antes de facturar?", [
      "Porque si los conceptos o el prestador están mal, el error se arrastra al comprobante fiscal.",
      "Porque el sistema no permite facturar sin voucher procesado.",
      "Porque la factura toma el número del voucher.",
      "Porque el cliente lo exige.",
    ], 0),
    q("BAK-M50.030", "¿Qué distingue al prestador del proveedor en un voucher?", [
      "El prestador es quien ejecuta el servicio; el proveedor es a quien se le paga.",
      "Son la misma entidad siempre.",
      "El prestador se carga como cliente.",
      "El proveedor solo existe en los servicios exentos.",
    ], 0),
    q("BAK-M50.040", "¿Para qué se emite una nota de crédito?", [
      "Para revertir total o parcialmente un comprobante ya emitido.",
      "Para registrar un cobro en moneda extranjera.",
      "Para dar de baja un file.",
      "Para reimprimir una factura.",
    ], 0),
    q("BAK-M50.050", "¿Qué permite la factura parcial?", [
      "Dividir el importe de una operación entre varios pasajeros o comprobantes.",
      "Facturar sin CAE.",
      "Emitir la factura antes de cargar el voucher.",
      "Facturar en una moneda distinta a la del file.",
    ], 0),
    q("BAK-M50.060", "¿Cuándo interviene el tipo de cambio promedio ponderado?", [
      "Cuando una operación recibió cobros a distintos tipos de cambio y hay que valorizarla.",
      "Cuando el file tiene un solo voucher.",
      "Cuando el cliente es una empresa.",
      "Cuando se emite una nota de crédito.",
    ], 0),
    q("BAK-M50.060", "¿Por qué el promedio se pondera y no es un promedio simple?", [
      "Porque cada cobro pesa según su importe, no según su cantidad.",
      "Porque el sistema no admite promedios simples.",
      "Porque lo exige el organismo fiscal.",
      "Porque el tipo de cambio cambia todos los días.",
    ], 0),

    /* ══════════ BAK-M60 · Pagos a proveedores ══════════ */
    q("BAK-M60.010", "¿Qué habilita la orden de pago?", [
      "Registrar la salida de dinero hacia el proveedor por los servicios prestados.",
      "Cobrarle al cliente el servicio vendido.",
      "Emitir la factura de la operación.",
      "Cerrar el file.",
    ], 0),
    q("BAK-M60.010", "¿Qué diferencia hay entre una orden de pago automática y una manual?", [
      "La automática la arma el sistema con los vouchers procesados; la manual se carga a criterio.",
      "La manual no deja registro contable.",
      "La automática no admite más de un proveedor.",
      "No hay diferencia funcional.",
    ], 0),
    q("BAK-M60.010", "¿Cuándo se usa una orden de pago dividida?", [
      "Cuando el pago al proveedor se hace en más de un tramo o por más de un medio.",
      "Cuando hay más de un pasajero en el file.",
      "Cuando el voucher está anulado.",
      "Cuando la moneda del file es extranjera.",
    ], 0),
    q("BAK-M60.020", "¿Para qué se vincula la factura de compra a la orden de pago?", [
      "Para que el pago quede respaldado por el comprobante que emitió el proveedor.",
      "Para calcular la comisión del vendedor.",
      "Para emitir el voucher.",
      "Para habilitar la cuenta corriente del cliente.",
    ], 0),
    q("BAK-M60.020", "¿Qué aporta el importador de comprobantes de ARCA?", [
      "Trae los comprobantes de compra ya emitidos, sin cargarlos a mano.",
      "Emite las facturas de venta de la agencia.",
      "Calcula el tipo de cambio del día.",
      "Concilia la caja del vendedor.",
    ], 0),
    q("BAK-M60.030", "¿Qué es un saldo a favor con un proveedor?", [
      "Un importe pagado por encima de lo debido, que queda disponible para aplicar.",
      "Una comisión pendiente de cobro.",
      "Un voucher sin procesar.",
      "Una factura sin CAE.",
    ], 0),
    q("BAK-M60.030", "¿Qué implica reabrir una orden de pago anulada?", [
      "Volver a habilitarla para modificarla, con su impacto en la cuenta del proveedor.",
      "Duplicar el pago al proveedor.",
      "Eliminar la factura de compra vinculada.",
      "Cerrar el file asociado.",
    ], 0),
    q("BAK-M60.040", "¿Qué muestra la cuenta corriente de un proveedor?", [
      "El saldo entre lo que se le debe por servicios y lo que ya se le pagó.",
      "Los pasajeros que viajaron con ese proveedor.",
      "Las comisiones de los vendedores.",
      "Los files abiertos de la agencia.",
    ], 0),

    /* ══════════ BAK-M70 · Caja y bancos ══════════ */
    q("BAK-M70.010", "¿Qué diferencia hay entre caja única y caja por vendedor?", [
      "La única concentra todos los movimientos; la por vendedor separa el manejo de valores por persona.",
      "La única no admite moneda extranjera.",
      "La por vendedor no requiere cierre.",
      "Es una decisión estética, sin efecto operativo.",
    ], 0),
    q("BAK-M70.020", "¿Qué distingue un asiento automático de uno manual?", [
      "El automático lo genera el sistema a partir de un movimiento; el manual se carga a criterio.",
      "El manual no impacta en el libro diario.",
      "El automático no se puede consultar.",
      "El manual solo aplica al cierre de ejercicio.",
    ], 0),
    q("BAK-M70.020", "¿Para qué sirve el centro de costo en un movimiento?", [
      "Para imputar el gasto a la unidad de la agencia que lo generó.",
      "Para definir la moneda del movimiento.",
      "Para asignar el movimiento a un cliente.",
      "Para autorizar el egreso.",
    ], 0),
    q("BAK-M70.030", "¿Qué condición hace falta para registrar movimientos en la caja?", [
      "Que la caja esté abierta.",
      "Que el file esté cerrado.",
      "Que el voucher esté procesado.",
      "Que exista una orden de pago.",
    ], 0),
    q("BAK-M70.030", "¿Qué produce el cierre de caja?", [
      "El corte de los movimientos del período y el arqueo contra lo registrado.",
      "La eliminación de los movimientos cargados.",
      "La emisión de las facturas del día.",
      "El pago automático a los proveedores.",
    ], 0),
    q("BAK-M70.040", "¿Qué permite la conciliación bancaria?", [
      "Cotejar los movimientos registrados con los del extracto del banco.",
      "Emitir transferencias sin comprobante.",
      "Cerrar el ejercicio contable.",
      "Facturar en moneda extranjera.",
    ], 0),
    q("BAK-M70.040", "¿Qué aporta el scan de comprobantes con IA?", [
      "Lee el comprobante y precarga sus datos, que después se confirman.",
      "Emite el comprobante en nombre del proveedor.",
      "Reemplaza la conciliación bancaria.",
      "Autoriza el pago sin revisión.",
    ], 0),

    /* ══════════ BAK-M80 · Informes ══════════ */
    q("BAK-M80.010", "¿Qué resuelve un informe de saldos?", [
      "Muestra cuánto se debe y cuánto se debe cobrar a una fecha dada.",
      "Lista los pasajeros que viajaron en el mes.",
      "Calcula el tipo de cambio promedio.",
      "Emite los comprobantes pendientes.",
    ], 0),
    q("BAK-M80.010", "¿Para qué sirve el informe de comisiones?", [
      "Para saber qué comisión generó cada operación y a quién le corresponde.",
      "Para conciliar la cuenta bancaria.",
      "Para emitir las notas de crédito del período.",
      "Para cerrar la caja del vendedor.",
    ], 0),
    q("BAK-M80.020", "¿Qué informa un informe de ventas?", [
      "Qué se vendió en un período, con su importe y su resultado.",
      "Qué proveedores tienen saldo pendiente.",
      "Qué asientos se generaron en el libro diario.",
      "Qué cajas quedaron sin cerrar.",
    ], 0),
    q("BAK-M80.020", "¿Por qué conviene mirar el informe de ventas por período y no por file?", [
      "Porque permite comparar la evolución del negocio y no solo una operación.",
      "Porque el informe por file no existe.",
      "Porque el sistema no admite filtros por fecha.",
      "Porque los files se borran al cerrarse.",
    ], 0),
    q("BAK-M80.030", "¿Qué debería mostrar un dashboard de KPIs?", [
      "Los pocos indicadores que resumen cómo va el negocio, no todos los datos disponibles.",
      "El detalle de cada movimiento del período.",
      "El listado completo de clientes.",
      "Los comprobantes emitidos uno por uno.",
    ], 0),
    q("BAK-M80.040", "¿Qué distingue un informe administrativo de uno operativo?", [
      "El administrativo mira ingresos y egresos de la agencia; el operativo mira la operación vendida.",
      "El administrativo no se puede exportar.",
      "El operativo solo lo ve el contador.",
      "Son el mismo informe con distinto filtro.",
    ], 0),

    /* ══════════ BAK-M90 · Contable ══════════ */
    q("BAK-M90.010", "¿Para qué sirve el plan de cuentas?", [
      "Define las cuentas contra las que se imputan los movimientos del sistema.",
      "Define los permisos de los usuarios.",
      "Define las monedas habilitadas.",
      "Define los tipos de voucher disponibles.",
    ], 0),
    q("BAK-M90.010", "¿Qué pasa si el plan de cuentas está incompleto?", [
      "Los movimientos no encuentran contra qué imputarse y el circuito contable queda con huecos.",
      "El sistema bloquea la carga de files.",
      "Se pierde la trazabilidad de los pasajeros.",
      "No se puede emitir voucher.",
    ], 0),
    q("BAK-M90.020", "¿Qué define la configuración de asientos automáticos?", [
      "Qué cuenta se mueve, y en qué sentido, ante cada tipo de movimiento.",
      "Qué usuarios pueden ver el libro diario.",
      "En qué moneda se registra la operación.",
      "Cuándo se cierra la caja.",
    ], 0),
    q("BAK-M90.030", "¿Qué registra el libro diario?", [
      "Los asientos en orden cronológico.",
      "Los saldos finales de cada cuenta.",
      "Los comprobantes emitidos al cliente.",
      "Los pasajeros de cada file.",
    ], 0),
    q("BAK-M90.030", "¿Qué diferencia hay entre el libro diario y el mayor?", [
      "El diario ordena por fecha; el mayor agrupa por cuenta.",
      "El mayor solo incluye asientos manuales.",
      "El diario no es obligatorio.",
      "Son el mismo libro con dos nombres.",
    ], 0),
    q("BAK-M90.040", "¿Qué verifica el balance de suma y saldo?", [
      "Que el total del debe coincida con el total del haber.",
      "Que todos los files estén cerrados.",
      "Que las cajas estén conciliadas.",
      "Que los vouchers estén procesados.",
    ], 0),
    q("BAK-M90.050", "¿Qué implica cerrar un ejercicio contable?", [
      "Dar por terminado el período: no admite asientos nuevos y sus saldos pasan al siguiente.",
      "Eliminar los asientos del período.",
      "Dar de baja el plan de cuentas.",
      "Cerrar todas las cajas de la agencia.",
    ], 0),

    /* ══════════ BAK-M95 · Receptivo operador ══════════ */
    q("BAK-M95.010", "¿Qué define un tarifario de proveedor?", [
      "Los precios del proveedor por tipo de servicio, con su vigencia y su temporada.",
      "El saldo de la cuenta corriente del proveedor.",
      "Los pasajeros que ese proveedor atendió.",
      "La comisión del vendedor que lo usa.",
    ], 0),
    q("BAK-M95.010", "¿Por qué el tarifario lleva vigencia y temporada?", [
      "Porque el mismo servicio tiene precios distintos según la fecha en que se presta.",
      "Porque lo exige el organismo fiscal.",
      "Porque define la moneda del file.",
      "Porque determina el tipo de voucher.",
    ], 0),
    q("BAK-M95.020", "¿Qué ventaja tiene armar el itinerario desde el tarifario?", [
      "Los precios y los servicios se traen ya cargados, sin tipearlos de nuevo.",
      "Permite facturar sin voucher.",
      "Evita tener que cargar el cliente.",
      "Elimina la necesidad de procesar el voucher.",
    ], 0),
    q("BAK-M95.020", "¿Qué es un itinerario en el circuito del receptivo?", [
      "La secuencia de servicios que va a recibir el pasajero, con sus fechas.",
      "El comprobante fiscal de la operación.",
      "El listado de proveedores disponibles.",
      "El saldo pendiente del cliente.",
    ], 0),
    q("BAK-M95.030", "¿Qué resuelve un modelo multidestino?", [
      "Armar una vez un paquete que recorre varios destinos y reutilizarlo.",
      "Facturar cada destino por separado sin cargarlos.",
      "Cobrar en varias monedas sin tipo de cambio.",
      "Evitar cargar el tarifario del proveedor.",
    ], 0),
    q("BAK-M95.040", "¿Por qué importa distinguir un prestador nacional de uno internacional?", [
      "Porque el tratamiento impositivo del servicio no es el mismo.",
      "Porque el internacional no admite voucher.",
      "Porque el nacional no se puede facturar.",
      "Porque cambia la moneda de registro del file.",
    ], 0),
    q("BAK-M95.040", "En una operación de receptivo, ¿qué determina el impacto impositivo?", [
      "Dónde se presta el servicio y quién lo presta.",
      "El monto total de la operación.",
      "La cantidad de pasajeros.",
      "El vendedor que la cargó.",
    ], 0),
  ];

  /* -- Capa 3 · relleno estructural ----------------------------------------
     Preguntan por la estructura del módulo, no por el comportamiento del
     producto. Cada forma se instancia sobre los videos o las secciones del
     módulo, y las opciones se arman con los nombres reales del mapa.

     La respuesta correcta ROTA de posición: si estuviera siempre en el mismo
     lugar se podría acertar por costumbre y la pregunta no mediría nada.

     Van marcadas `origen: "estructural"` y la interfaz lo dice: un banco
     completado con relleno no es un banco terminado. Escribir las 50 reales de
     cada módulo es trabajo de contenido, no de código. */
  function estructurales(modulo, todosLosModulos) {
    const secciones = modulo.secciones;
    if (!secciones.length) return [];
    const nombres = secciones.map(function (s) { return s.titulo; });
    const pares = [];
    secciones.forEach(function (s) {
      s.videos.forEach(function (v) {
        pares.push({ v: v, s: s, id: modulo.codigo + "." + String(v.secuencia).padStart(3, "0") });
      });
    });
    if (!pares.length) return [];

    /* Nombres de secciones de OTROS módulos, para los distractores. */
    const ajenas = todosLosModulos
      .filter(function (o) { return o.numero !== modulo.numero; })
      .reduce(function (acc, o) { return acc.concat(o.secciones.map(function (s) { return s.titulo; })); }, []);
    const otrosTitulos = todosLosModulos
      .filter(function (o) { return o.numero !== modulo.numero; })
      .reduce(function (acc, o) {
        return acc.concat(o.secciones.reduce(function (a, s) {
          return a.concat(s.videos.map(function (v) { return v.titulo; }));
        }, []));
      }, []);

    const salida = [];
    let n = 0;
    /* Coloca la correcta en una posición que rota, y rellena con distractores. */
    function armar(video, texto, correcta, distractores) {
      const pool = distractores.filter(function (d) { return d && d !== correcta; });
      const elegidos = [];
      for (let i = 0; i < pool.length && elegidos.length < 3; i++) {
        if (elegidos.indexOf(pool[i]) === -1) elegidos.push(pool[i]);
      }
      if (!elegidos.length) return null;
      const donde = n % (elegidos.length + 1);
      const opciones = elegidos.slice();
      opciones.splice(donde, 0, correcta);
      n++;
      return q(video, texto, opciones, donde, "estructural");
    }
    function agregar(p) { if (p) salida.push(p); }

    /* Forma A · video → sección */
    pares.forEach(function (p) {
      agregar(armar(p.id, "¿A qué parte del módulo corresponde «" + p.v.titulo + "»?",
        p.s.titulo, nombres.filter(function (x) { return x !== p.s.titulo; }).concat(ajenas)));
    });
    /* Forma B · sección → video. El enunciado alterna: dos preguntas con el
       mismo texto y distinta respuesta se leen como un error. */
    const ENUNCIADOS_B = [
      "¿Cuál de estos videos forma parte de «{s}»?",
      "Entre estos videos, ¿cuál corresponde a «{s}»?",
    ];
    pares.forEach(function (p, i) {
      const otros = pares.filter(function (o) { return o.s !== p.s; }).map(function (o) { return o.v.titulo; });
      agregar(armar(p.id, ENUNCIADOS_B[i % ENUNCIADOS_B.length].replace("{s}", p.s.titulo),
        p.v.titulo, otros.concat(otrosTitulos)));
    });
    /* Forma C · cuántos videos tiene la sección */
    secciones.forEach(function (s) {
      const cant = s.videos.length;
      agregar(armar(modulo.codigo + "." + String(s.videos[0].secuencia).padStart(3, "0"),
        "¿Cuántos videos tiene la sección «" + s.titulo + "»?",
        String(cant), [String(cant + 1), String(cant + 2), String(Math.max(1, cant - 1))]));
    });
    /* Forma D · qué video NO pertenece a la sección */
    secciones.filter(function (s) { return s.videos.length >= 2; }).forEach(function (s) {
      const ajenos = pares.filter(function (o) { return o.s !== s; }).map(function (o) { return o.v.titulo; });
      if (!ajenos.length) return;
      agregar(armar(modulo.codigo + "." + String(s.videos[0].secuencia).padStart(3, "0"),
        "¿Cuál de estos videos NO forma parte de «" + s.titulo + "»?",
        ajenos[0], s.videos.map(function (v) { return v.titulo; })));
    });
    /* Forma E · orden de la sección dentro del módulo */
    secciones.forEach(function (s) {
      agregar(armar(modulo.codigo + "." + String(s.videos[0].secuencia).padStart(3, "0"),
        "¿En qué lugar del módulo « " + modulo.titulo + " » va la parte «" + s.titulo + "»?",
        "en el lugar " + s.orden,
        secciones.filter(function (o) { return o.orden !== s.orden; })
          .map(function (o) { return "en el lugar " + o.orden; })
          .concat(["en el lugar " + (secciones.length + 1)])));
    });
    /* Forma F · qué sección sigue */
    for (let i = 0; i < secciones.length - 1; i++) {
      agregar(armar(modulo.codigo + "." + String(secciones[i].videos[0].secuencia).padStart(3, "0"),
        "Después de «" + secciones[i].titulo + "», ¿qué parte del módulo viene?",
        secciones[i + 1].titulo,
        nombres.filter(function (x) { return x !== secciones[i + 1].titulo && x !== secciones[i].titulo; }).concat(ajenas)));
    }
    /* Forma G · a qué módulo pertenece el video */
    const otrosModulos = todosLosModulos
      .filter(function (o) { return o.numero !== modulo.numero && o.tipo === "biblioteca"; })
      .map(function (o) { return o.titulo; });
    pares.forEach(function (p) {
      agregar(armar(p.id, "¿A qué módulo de la Academia pertenece «" + p.v.titulo + "»?",
        modulo.titulo, otrosModulos));
    });
    /* Forma H · con qué otro video comparte sección */
    secciones.filter(function (s) { return s.videos.length >= 2; }).forEach(function (s) {
      s.videos.forEach(function (v, i) {
        const companero = s.videos[(i + 1) % s.videos.length];
        if (companero === v) return;
        const ajenos = pares.filter(function (o) { return o.s !== s; }).map(function (o) { return o.v.titulo; });
        agregar(armar(modulo.codigo + "." + String(v.secuencia).padStart(3, "0"),
          "¿Con qué otro video comparte parte del módulo «" + v.titulo + "»?",
          companero.titulo, ajenos.concat(otrosTitulos)));
      });
    });
    /* Forma I · cuántas partes tiene el módulo */
    agregar(armar(pares[0].id, "¿En cuántas partes está dividido el módulo «" + modulo.titulo + "»?",
      String(secciones.length),
      [String(secciones.length + 1), String(secciones.length + 2), String(Math.max(1, secciones.length - 1))]));
    /* Forma J · cuál es el primer video de la sección */
    secciones.filter(function (s) { return s.videos.length >= 2; }).forEach(function (s) {
      const ajenos = pares.filter(function (o) { return o.s !== s; }).map(function (o) { return o.v.titulo; });
      agregar(armar(modulo.codigo + "." + String(s.videos[0].secuencia).padStart(3, "0"),
        "¿Con qué video abre la parte «" + s.titulo + "»?",
        s.videos[0].titulo,
        s.videos.slice(1).map(function (v) { return v.titulo; }).concat(ajenos)));
    });

    return salida;
  }

  /* -- Construcción del banco ---------------------------------------------
     Junta las tres capas, asigna ID y resuelve `creadaEn` por cupo.

     ID: `P-` + módulo (2) + secuencia/10 (1) + índice (2). `P-30105` es la
     quinta pregunta del video `BAK-M30.010`. El wireframe usaba IDs de muestra
     sin esquema (`P-1002`); este los reemplaza por uno que dice de dónde sale
     cada pregunta, que es lo que el banco necesita para poder auditarse. */
  function construir() {
    const bib = D.modulos.filter(function (m) { return m.tipo === "biblioteca"; });
    const porVideo = {};

    /* Las escritas primero: son las que tienen que entrar en los cupos. */
    escritas.forEach(function (p) {
      (porVideo[p.video] = porVideo[p.video] || []).push(p);
    });

    bib.forEach(function (m) {
      const ids = [];
      m.secciones.forEach(function (s) {
        s.videos.forEach(function (v) {
          ids.push(m.codigo + "." + String(v.secuencia).padStart(3, "0"));
        });
      });

      /* El relleno estructural, agrupado por el video del que habla, para poder
         completar el cupo de UN video y no solo el del módulo. */
      const bolsa = {};
      let cursor = {};
      estructurales(m, bib).forEach(function (p) {
        (bolsa[p.video] = bolsa[p.video] || []).push(p);
      });
      ids.forEach(function (id) { cursor[id] = 0; });

      /* Saca una estructural del video pedido. Si su bolsa se agotó, recicla
         desde el principio marcando el pase, para que dos copias de la misma
         forma no queden con el mismo ID ni se lean como la misma pregunta. */
      function tomar(id) {
        const b = bolsa[id];
        if (!b || !b.length) return null;
        const p = b[cursor[id] % b.length];
        const pase = Math.floor(cursor[id] / b.length);
        cursor[id]++;
        return Object.assign({}, p, { pase: pase });
      }

      /* Paso 1 · completar el cupo de cada video. Es lo que sostiene las
         cadenas por sección: si la sección 1 de BAK-M30 tiene que mostrar 6
         preguntas, el video que la compone tiene que llegar a 6. */
      ids.forEach(function (id) {
        const cupos = CUPOS[id] || {};
        const tope = Object.keys(cupos).reduce(function (a, k) { return Math.max(a, cupos[k]); }, 0);
        while ((porVideo[id] || []).length < tope) {
          const p = tomar(id);
          if (!p) break;
          (porVideo[id] = porVideo[id] || []).push(p);
        }
      });

      /* Paso 2 · completar el módulo hasta su mínimo, repartiendo por turnos
         entre los videos para que ninguno quede con un banco desbalanceado. */
      const cuenta = function () {
        return ids.reduce(function (a, id) { return a + ((porVideo[id] || []).length); }, 0);
      };
      let vueltas = 0;
      while (cuenta() < D.evaluacion.bancoMinimoPorModulo && vueltas < 500) {
        let sumoAlguna = false;
        for (let k = 0; k < ids.length && cuenta() < D.evaluacion.bancoMinimoPorModulo; k++) {
          const p = tomar(ids[k]);
          if (!p) continue;
          (porVideo[ids[k]] = porVideo[ids[k]] || []).push(p);
          sumoAlguna = true;
        }
        if (!sumoAlguna) break;
        vueltas++;
      }
    });

    /* IDs, subtema y `creadaEn` por cupo. */
    const salida = [];
    bib.forEach(function (m) {
      m.secciones.forEach(function (s) {
        s.videos.forEach(function (v) {
          const id = m.codigo + "." + String(v.secuencia).padStart(3, "0");
          const lista = porVideo[id] || [];
          const cupos = CUPOS[id] || {};
          lista.forEach(function (p, i) {
            /* La primera escena cuyo cupo ya alcanza a esta pregunta. */
            let creadaEn = "E6";
            for (let e = 0; e < D.ESCENAS.length; e++) {
              const esc = D.ESCENAS[e].id;
              if (cupos[esc] && i < cupos[esc]) { creadaEn = esc; break; }
            }
            salida.push({
              id: "P-" + String(m.numero).padStart(2, "0") +
                String(v.secuencia / 10) + String(i + 1).padStart(2, "0"),
              modulo: m.numero,
              codigoModulo: m.codigo,
              videoOrigen: id,
              subtema: s.titulo,
              texto: p.texto,
              opciones: p.opciones,
              correcta: p.correcta,
              origen: p.origen,
              borrador: !!p.borrador,
              creadaEn: creadaEn,
            });
          });
        });
      });
    });
    return salida;
  }

  D.preguntas = construir();
  /* Para poder informar cuánto del banco es relleno. */
  D.preguntasCupos = CUPOS;
})();
