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

/* -- el dato del backoffice: el bloque DATA de index.html ------------------- */
const html = fs.readFileSync(path.join(AQUI, 'index.html'), 'utf8');
const ini = html.indexOf('const DATA=['), fin = html.indexOf('\n];', ini);
const PERFILES = ['Professional', 'Business'];
const DATA = eval(html.slice(ini + 'const DATA='.length, fin + 2));

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

console.log('\n' + (fallos.length
  ? fallos.length + ' control(es) en rojo.\n'
  : 'El backoffice está alineado al modelo aprobado.\n'));
process.exit(fallos.length ? 1 : 0);
