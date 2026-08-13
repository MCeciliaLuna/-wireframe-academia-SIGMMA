/* ============================================================================
   Academia SIGMMA · Backoffice — agencias, personas y uso
   ----------------------------------------------------------------------------
   TODO LO DE ESTE ARCHIVO ES FICTICIO. No hay datos reales de agencias ni de
   personas: ni nombres, ni CUIT, ni documentos, ni credenciales, ni direcciones
   de correo que existan. Los nombres de agencia son inventados y los de las
   personas también.

   Se carga después de `academia-data.js` y se cuelga de `ACADEMIA_DATA`.

   POR QUÉ RECIÉN APARECEN EN E6
   ------------------------------
   R10: el Home mide AVANCE DE CONSTRUCCIÓN, no operación, y en las etapas de
   arranque no hay uso que medir. El wireframe lo dice con un número: «Agencias
   con acceso: 0» en E2, E3, E4 y E5, incluso con la Ruta Esencial ya activa.

   Así que las agencias entran en **E6**, que es exactamente lo que hace de E6
   una escena y no un adorno: es el primer momento en que existe uso, y por eso
   es el único donde las métricas de operación tienen algo que decir. R10 no se
   rompe: se cumple en las cinco escenas que cubre, y E6 queda afuera de su
   alcance porque describe otra cosa.

   EL AVANCE ES DERIVADO Y DETERMINISTA
   -------------------------------------
   No se escribe persona por persona: se deriva de una semilla estable sacada de
   su ID. Es a propósito. Con `Math.random()` el avance cambiaría en cada carga y
   el prototipo se leería como si los datos se movieran solos — alguien mostrando
   la pantalla vería un número distinto cada vez que refresca. Con semilla fija,
   la simulación es siempre la misma y se puede señalar un dato concreto en una
   reunión.

   El plan es de la AGENCIA, no de la persona: de la agencia sale el plan, del
   plan el recorrido, y del recorrido el denominador de toda base de cálculo.
   ========================================================================== */

(function () {
  "use strict";

  const D = window.ACADEMIA_DATA;
  if (!D) throw new Error("academia-agencias.js necesita academia-data.js cargado antes.");

  const PRO = "Professional";
  const BUS = "Business";
  const COR = "Corporate";

  /* -- Las agencias ---------------------------------------------------------
     Doce, con planteles de tamaño distinto: el panel de seguimiento tiene que
     poder mostrar una agencia de tres personas al lado de una de ocho sin que
     los promedios se lean como si todas fueran iguales.

     `altaEn` es la escena en que la agencia obtuvo acceso. Todas en E6. */
  function a(id, nombre, plan, personas) {
    return { id: id, nombre: nombre, plan: plan, altaEn: "E6", personas: personas };
  }

  const agencias = [
    a("viajes-del-sur", "Viajes del Sur", PRO, [
      "Lucía Fernández", "Martín Ruiz", "Carla Domínguez", "Diego Sosa", "Paula Iglesias", "Nicolás Vera",
    ]),
    a("andes-receptivo", "Andes Receptivo", COR, [
      "Sofía Bianchi", "Ramiro Cabrera", "Julieta Ponce", "Tomás Ferreyra", "Ana Lucero",
    ]),
    a("litoral-turismo", "Litoral Turismo", PRO, [
      "Gabriel Ortiz", "Mariana Sequeira", "Federico Ayala",
    ]),
    a("patagonia-expediciones", "Patagonia Expediciones", BUS, [
      "Valentina Rocha", "Ignacio Peralta", "Rocío Maidana", "Esteban Quiroga", "Camila Bustos",
    ]),
    a("cuyo-viajes", "Cuyo Viajes", PRO, [
      "Hernán Villalba", "Daniela Correa", "Lautaro Medina", "Micaela Ojeda",
    ]),
    a("norte-grande-tours", "Norte Grande Tours", BUS, [
      "Emilia Sandoval", "Joaquín Rivas", "Antonella Paz",
    ]),
    a("costa-atlantica-viajes", "Costa Atlántica Viajes", PRO, [
      "Bruno Alcaraz", "Florencia Núñez", "Matías Leiva", "Agustina Roldán", "Santiago Barrios",
      "Delfina Cáceres", "Pablo Zárate", "Julián Ibarra",
    ]),
    a("mediterraneo-corporate", "Mediterráneo Corporate", COR, [
      "Verónica Salgado", "Alejandro Funes", "Constanza Vidal", "Leandro Arce", "Milagros Duarte",
      "Facundo Herrera",
    ]),
    a("sierras-y-lagos", "Sierras y Lagos", BUS, [
      "Nadia Escobar", "Cristian Molina", "Belén Aguirre", "Marcos Tapia",
    ]),
    a("altiplano-operadores", "Altiplano Operadores", COR, [
      "Ezequiel Ramírez", "Tamara Guzmán", "Iván Cardozo",
    ]),
    a("pampa-corporativo", "Pampa Corporativo", BUS, [
      "Silvina Acosta", "Rodrigo Benítez", "Malena Sarmiento", "Ariel Cuello", "Lorena Pizarro",
    ]),
    /* Cuatro y no tres: con tres, el plantel total daba exactamente 55 y se
       confundía con los 55 videos del mapa en cualquier pantalla que mostrara
       los dos números. */
    a("delta-viajes", "Delta Viajes", PRO, [
      "Franco Maldonado", "Yamila Sosa", "Emanuel Godoy", "Brenda Ocampo",
    ]),
  ];

  /* Se les asigna un ID estable a las personas: `agencia:indice`. No hay
     correos ni documentos — nada que se pueda confundir con un dato real. */
  const personas = [];
  agencias.forEach(function (ag) {
    ag.plantel = ag.personas.map(function (nombre, i) {
      const p = {
        id: ag.id + ":" + (i + 1),
        nombre: nombre,
        agenciaId: ag.id,
        /* La primera persona de cada agencia es la coordinadora: es quien
           agenda las Meets de soporte. */
        coordinadora: i === 0,
      };
      personas.push(p);
      return p;
    });
    delete ag.personas;
  });

  /* -- Semilla estable -----------------------------------------------------
     Hash determinista de una cadena. No es criptográfico ni pretende serlo:
     solo tiene que repartir parejo y dar siempre el mismo resultado para la
     misma entrada, para que la simulación no cambie entre cargas. */
  function semilla(texto) {
    let h = 2166136261;
    for (let i = 0; i < texto.length; i++) {
      h ^= texto.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return (h >>> 0) / 4294967295;
  }

  /* -- Configuración del uso simulado -------------------------------------- */
  const uso = {
    /* Fecha de referencia del corte: es la que el panel muestra como «datos al».
       Va fija a propósito, igual que las versiones de los videos. */
    corteISO: "2026-08-12",
    /* Las dos señales que exige el alcance del MVP (§6): una cosa es abrir el
       video y otra consumirlo. Se registran separadas porque la brecha entre
       las dos es la señal interesante. */
    umbralVisto: 80,
  };

  D.agencias = agencias;
  D.personas = personas;
  D.uso = uso;
  D.semillaUso = semilla;
})();
