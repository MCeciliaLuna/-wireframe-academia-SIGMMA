#!/usr/bin/env node
/* ============================================================================
   Cotejo del backoffice contra el modelo aprobado.

   `academia-AGENCIA` está aprobado por negocio: donde los dos difieren, manda
   AGENCIA. Este script compara el dato de las dos puntas y falla si se separan.

   Uso, con los dos repos hermanos en la misma carpeta:
       node cotejo.js  [ruta/a/academia-AGENCIA]

   Comprueba:
     1. que los IDs de video sean los mismos (salvo los dos propios del backoffice)
     2. que el título de cada video sea el aprobado
     3. que cada video esté en la sección aprobada, y en el orden aprobado
     4. las invariantes del contrato: recorrido 9/11, IDs de sección únicos,
        y que el tema de cada pregunta sea una sección de su propio módulo
     5. el banco de preguntas: que llegue al mínimo, que cubra todos los temas de los
        módulos del recorrido, que en el momento inicial no haya banco vigente, que los IDs
        de pregunta sean únicos y con formato, que la vigencia sea un momento válido, y que
        los parámetros de cada módulo respeten las reglas del MVP
   ========================================================================== */
const fs = require('fs'), path = require('path');

const AQUI = __dirname;
const AGENCIA = process.argv[2] || path.join(AQUI, '..', 'academia-AGENCIA');
const MOCK = path.join(AGENCIA, 'assets', 'js', 'mock-data.js');

if (!fs.existsSync(MOCK)) {
  console.error('No encuentro el modelo aprobado en ' + MOCK);
  console.error('Pasá la ruta del repo academia-AGENCIA como argumento.');
  process.exit(2);
}

/* -- el modelo aprobado: mock-data.js expone window.ACADEMIA ---------------- */
global.window = { location: { search: '' },
  localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} } };
require(MOCK);
const A = global.window.ACADEMIA;

/* -- el dato del backoffice: el bloque de datos completo de index.html ------
   Se evalúa desde `const GLOBAL={` hasta `DATA.forEach(initMod);`, que es una
   región contigua y autocontenida: incluye los parámetros globales, DATA, el banco
   escrito a mano, genPool e initMod. Antes se cortaba solo el literal de DATA, así
   que el banco —que se genera en initMod— quedaba afuera y no había forma de
   controlarlo.
   Lo único que hay que darle de afuera es lo que el bloque usa y se declara antes:
   PERFILES y USERS. Si estos dos marcadores se mueven o se renombran, el script
   falla acá con un error explícito y no con un diff vacío. */
const html = fs.readFileSync(path.join(AQUI, 'index.html'), 'utf8');
const ABRE = 'const GLOBAL={', CIERRA = 'DATA.forEach(initMod);';
const ini = html.indexOf(ABRE), fin = html.indexOf(CIERRA, ini);
if (ini < 0 || fin < 0) {
  console.error('No encuentro el bloque de datos de index.html.');
  console.error('Se busca desde "' + ABRE + '" hasta "' + CIERRA + '": si se renombró o se movió, hay que actualizar cotejo.js.');
  process.exit(2);
}
const PERFILES = ['Professional', 'Business'];
const USERS = ['M. Luna', 'Majo', 'Irene'];
/* Se sacan DOS cosas del bloque, no una: el dato y la tabla de orden de los
   momentos. Antes este script declaraba su propia copia de la lista de momentos,
   así que el control de vigencia se comparaba contra sí mismo: si el prototipo
   renombraba un momento, acá seguía en verde. */
const BLOQUE = eval(html.slice(ini, fin + CIERRA.length) + '\n({DATA:DATA,ESC_ORD:ESC_ORD});');
const DATA = BLOQUE.DATA, ORD = BLOQUE.ESC_ORD;

/* Los momentos se DERIVAN de la tabla de orden: este script no nombra ninguno,
   así que renombrarlos o colapsarlos no lo obliga a cambiar. */
const MOMENTOS = Object.keys(ORD);
if (MOMENTOS.length < 2) {
  console.error('El prototipo declara ' + MOMENTOS.length + ' momento(s) en ESC_ORD.');
  console.error('Con menos de dos, el primero y el último son el mismo y los controles de vigencia');
  console.error('del banco se contradicen en silencio. Hay que revisar ESC_ORD en index.html.');
  process.exit(2);
}
const PRIMERO = MOMENTOS.reduce((a, b) => (ORD[b] < ORD[a] ? b : a));
const ULTIMO = MOMENTOS.reduce((a, b) => (ORD[b] > ORD[a] ? b : a));

/* Los dos que existen solo acá, y por qué. */
const PROPIOS = { 'BAK-M10.070': 'archivado', 'BAK-M35.010': 'módulo reservado' };

const aprobado = {}, backoffice = {};
A.modulos.forEach(m => m.secciones.forEach((s, si) => s.videos.forEach((v, vi) =>
  aprobado[v.id] = { t: v.titulo, sec: s.titulo, si, vi })));
DATA.forEach(m => (m.secciones || []).forEach((s, si) => (s.videos || []).forEach((v, vi) =>
  backoffice[m.id + '.' + v.seq] = { t: v.t, sec: s.name, si, vi })));

const fallos = [];
const chequeo = (ok, msg) => { console.log((ok ? '  ok   ' : '  FALLA ') + msg); if (!ok) fallos.push(msg); };

console.log('\nCotejo contra ' + path.relative(process.cwd(), AGENCIA) + '\n');

/* 1 · el mismo universo de IDs -------------------------------------------- */
const soloAca = Object.keys(backoffice).filter(id => !aprobado[id]);
const soloAlla = Object.keys(aprobado).filter(id => !backoffice[id]);
chequeo(soloAlla.length === 0, 'ningún video aprobado falta acá' + (soloAlla.length ? ': ' + soloAlla.join(', ') : ''));
chequeo(soloAca.every(id => PROPIOS[id]),
  'los videos propios del backoffice son los esperados: ' + soloAca.map(id => id + ' (' + (PROPIOS[id] || '¿?') + ')').join(', '));

/* 2, 3 · título, sección y orden ------------------------------------------ */
const comunes = Object.keys(aprobado).filter(id => backoffice[id]);
const dTit = comunes.filter(id => aprobado[id].t !== backoffice[id].t);
const dSec = comunes.filter(id => aprobado[id].sec !== backoffice[id].sec);
chequeo(dTit.length === 0, dTit.length + ' títulos difieren del aprobado' + (dTit.length ? ': ' + dTit.join(', ') : ''));
chequeo(dSec.length === 0, dSec.length + ' videos están en otra sección' + (dSec.length ? ': ' + dSec.join(', ') : ''));

/* el orden DENTRO de la sección, que en tres secciones rompe el ID a propósito */
const dOrd = comunes.filter(id => aprobado[id].si !== backoffice[id].si || aprobado[id].vi !== backoffice[id].vi);
chequeo(dOrd.length === 0, dOrd.length + ' videos están en otra posición' + (dOrd.length ? ': ' + dOrd.join(', ') : ''));

/* 4 · invariantes del contrato -------------------------------------------- */
const rec = p => DATA.filter(m => m.id.split('-')[0] === 'BAK' && m.perfiles.indexOf(p) !== -1 && !m.enPrep).length;
chequeo(rec('Professional') === 9, 'recorrido Professional = 9 (da ' + rec('Professional') + ')');
chequeo(rec('Business') === 11, 'recorrido Business = 11 (da ' + rec('Business') + ')');

const secIds = [];
DATA.forEach(m => (m.secciones || []).forEach(s => secIds.push(s.id)));
chequeo(secIds.every(Boolean) && new Set(secIds).size === secIds.length,
  'las ' + secIds.length + ' secciones tienen ID propio y único');

const nSecAprobadas = A.modulos.reduce((a, m) => a + m.secciones.length, 0);
const nSecAca = secIds.length - 1; /* la de BAK-M35, reservado, no está en el mapa aprobado */
chequeo(nSecAca === nSecAprobadas, nSecAprobadas + ' secciones aprobadas (acá ' + nSecAca + ' + 1 del módulo reservado)');

/* 5 · el banco de preguntas ------------------------------------------------ */
/* Una lista larga en una sola línea no se lee: se muestran los primeros y se dice
   cuántos quedaron. */
const lista = (a, n) => a.slice(0, n || 8).join(', ') + (a.length > (n || 8) ? ' … y ' + (a.length - (n || 8)) + ' más' : '');

/* La vigencia de cada pregunta la declara la propia pregunta (`desde`), así que se
   puede reconstruir el banco de cualquier momento sin abrir el navegador. `ORD` sale
   del propio prototipo (ver arriba). */
const activasEn = (m, e) => (m.pool || []).filter(q => ORD[q.desde] <= ORD[e] && q.estado === 'activa');
const sinCubrir = (m, e) => {
  const a = activasEn(m, e);
  return m.subtemas.filter(st => !a.some(q => q.st === st.id)).map(st => st.name);
};

const enRegimen = DATA.filter(m => m.sup === 'BAK' && !m.enPrep);
const cortos = enRegimen.filter(m => activasEn(m, ULTIMO).length < m.params.minimo)
  .map(m => m.id + ' (' + activasEn(m, ULTIMO).length + '/' + m.params.minimo + ')');
chequeo(cortos.length === 0,
  'en ' + ULTIMO + ' todos los módulos del recorrido llegan a su mínimo' + (cortos.length ? ', menos: ' + lista(cortos) : ''));

/* Un módulo que el momento declara publicado no puede tener un tema en cero: el
   checklist lo marcaría bloqueado mientras las agencias lo están viendo. */
const malCubiertos = [];
enRegimen.forEach(m => { const f = sinCubrir(m, ULTIMO); if (f.length) malCubiertos.push(m.id + ': ' + f.join(', ')); });
chequeo(malCubiertos.length === 0,
  'en ' + ULTIMO + ' los módulos del recorrido tienen todos los temas cubiertos' + (malCubiertos.length ? '; fallan: ' + lista(malCubiertos, 4) : ''));

/* El espejo del control anterior, y lo único que sustituye a la vieja lista blanca
   de módulos visibles: en el momento inicial la Academia está vacía, así que NINGUNA
   pregunta puede estar vigente. Sin este control, con un solo valor posible de
   `desde` todo control sobre el banco evaluaría el pool completo y el cotejo quedaría
   verde por tautología en lugar de por corrección. */
const conBancoAlInicio = DATA.filter(m => activasEn(m, PRIMERO).length)
  .map(m => m.id + ' (' + activasEn(m, PRIMERO).length + ')');
chequeo(conBancoAlInicio.length === 0,
  'en ' + PRIMERO + ' ningún módulo tiene banco vigente' + (conBancoAlInicio.length ? '; lo tienen: ' + lista(conBancoAlInicio) : ''));

const idsQ = [], malForma = [], malDesde = [];
DATA.forEach(m => (m.pool || []).forEach(q => {
  idsQ.push(q.id);
  if (!new RegExp('^' + m.id + '-Q\\d{3}$').test(q.id)) malForma.push(q.id);
  if (!ORD[q.desde]) malDesde.push(q.id + ' (' + q.desde + ')');
}));
chequeo(new Set(idsQ).size === idsQ.length && malForma.length === 0,
  'las ' + idsQ.length + ' preguntas tienen ID único y con formato <MOD>-Qnnn' + (malForma.length ? '; mal formadas: ' + lista(malForma) : ''));
chequeo(malDesde.length === 0,
  'toda pregunta declara desde qué momento existe' + (malDesde.length ? '; no lo cumplen: ' + lista(malDesde) : ''));

/* El tema de una pregunta tiene que ser una sección DEL MISMO módulo, y su video de
   repaso tiene que pertenecer a esa sección: si no, el resultado del intento manda
   a repasar un video que no explica el concepto fallado. */
const temaAjeno = [], repasoAjeno = [];
DATA.forEach(m => {
  const ids = m.subtemas.map(s => s.id);
  const secDe = {};
  (m.secciones || []).forEach(s => s.videos.forEach(v => secDe[m.id + '.' + v.seq] = s.id));
  (m.pool || []).forEach(q => {
    if (q.st && ids.indexOf(q.st) === -1) temaAjeno.push(q.id);
    if (q.st && q.repaso && secDe[q.repaso] && secDe[q.repaso] !== q.st) repasoAjeno.push(q.id);
  });
});
chequeo(temaAjeno.length === 0, 'el tema de cada pregunta es una sección de su propio módulo' + (temaAjeno.length ? '; fallan: ' + lista(temaAjeno) : ''));
chequeo(repasoAjeno.length === 0, 'el video de repaso de cada pregunta es de su mismo tema' + (repasoAjeno.length ? '; fallan: ' + lista(repasoAjeno) : ''));

/* Las reglas ratificadas: mínimo = 3× el intento, y el objetivo nunca por debajo
   del mínimo (si no, el módulo no se podría publicar nunca). */
const malParams = [];
DATA.forEach(m => {
  const p = m.params;
  if (p.minimo < 3 * p.porIntento) malParams.push(m.id + ': mínimo ' + p.minimo + ' < 3×' + p.porIntento);
  if (p.objetivo < p.minimo) malParams.push(m.id + ': objetivo ' + p.objetivo + ' < mínimo ' + p.minimo);
});
chequeo(malParams.length === 0, 'los parámetros de cada módulo respetan las reglas del MVP' + (malParams.length ? '; fallan: ' + lista(malParams, 4) : ''));

console.log('\n' + (fallos.length
  ? fallos.length + ' control(es) en rojo.\n'
  : 'El backoffice está alineado al modelo aprobado.\n'));
process.exit(fallos.length ? 1 : 0);
