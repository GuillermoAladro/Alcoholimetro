/* Pruebas del protocolo del ZE29A: las 18 tramas del manual V1.1 y los 8 escenarios de recepción de la auditoría 6-A. */
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const P = require("../nucleo/protocolo_ze29a");

const hex = (s) => Uint8Array.from(s.trim().split(/\s+/).map((x) => parseInt(x, 16)));

// Peticiones y respuestas de ejemplo del manual V1.1 (componentes/winsen-ze29a/README.md, apartado 5)
const MANUAL = [
  ["FF 01 85 00 00 00 00 00 7A", "FF 85 31 00 00 00 00 00 4A"],
  ["FF 01 86 00 00 00 00 00 79", "FF 86 00 5A 00 00 00 02 1E"],
  ["FF 01 87 31 00 00 00 00 47", "FF 87 01 00 00 00 00 00 78"],
  ["FF 01 88 00 00 00 00 00 77", "FF 88 04 00 00 00 00 00 74"],
  ["FF 01 89 04 00 00 00 00 72", "FF 89 01 00 00 00 00 00 76"],
  ["FF 01 90 00 00 00 00 00 6F", "FF 90 14 50 00 00 00 00 0C"],
  ["FF 01 91 14 50 00 00 00 0A", "FF 91 01 00 00 00 00 00 6E"],
  ["FF 01 92 00 00 00 00 00 6D", "FF 92 08 00 00 00 00 00 66"],
  ["FF 01 93 08 00 00 00 00 64", "FF 93 01 00 00 00 00 00 6C"],
];

test("las 18 tramas del manual tienen el checksum correcto", () => {
  for (const [p, r] of MANUAL) {
    assert.equal(P.checksum(hex(p)), hex(p)[8], p);
    assert.equal(P.checksum(hex(r)), hex(r)[8], r);
  }
});

test("las peticiones se construyen igual que en el manual", () => {
  for (const [p] of MANUAL) {
    const b = hex(p);
    const datos = Array.from(b.slice(3, 8));
    while (datos.length && datos[datos.length - 1] === 0) datos.pop();
    assert.deepEqual(P.peticion(b[2], ...datos), b, p);
  }
  // trama de arranque calculada en la ficha: checksum 46 (no 48 como en el foro de Arduino)
  assert.deepEqual(P.peticion(0x87, 0x32), hex("FF 01 87 32 00 00 00 00 46"));
});

test("se interpretan estado, resultado y acuses del manual", () => {
  assert.equal(P.interpretarEstado(hex(MANUAL[0][1])).estado, 0x31);
  const r = P.interpretarResultado(hex(MANUAL[1][1]));
  assert.equal(r.valor, 90);
  assert.equal(r.alarma, 2);
  assert.equal(r.saturado, false);
  assert.equal(P.interpretarAcuse(hex(MANUAL[2][1]), 0x87), true);
  assert.equal(P.interpretarAcuse(P.respuesta(0x87, 0x02), 0x87), false);
});

test("respuestas no válidas se rechazan, nunca dan 0", () => {
  assert.throws(() => P.interpretarEstado(null));
  assert.throws(() => P.interpretarEstado(hex("FF 85 31 00 00 00 00 00 4B"))); // checksum mal
  assert.throws(() => P.interpretarEstado(P.respuesta(0x85, 0x40))); // estado inexistente
  assert.throws(() => P.interpretarResultado(P.respuesta(0x85, 0x31))); // otro comando
  assert.throws(() => P.interpretarResultado(P.respuesta(0x86, 0x02, 0x00))); // 512 > 500: no creíble
  assert.equal(P.interpretarResultado(P.respuesta(0x86, 0x00, 0xf0)).saturado, true); // 240 > 220
});

// ---------------------------------------------------------------- escenarios de recepción (auditoría 6-A, anexo S1)
const BUENA = hex("FF 85 31 00 00 00 00 00 4A");
function leer(...trozos) {
  const l = new P.LectorTramas();
  const out = [];
  for (const t of trozos) out.push(...l.alimentar(t));
  return { out, l };
}

test("respuesta válida", () => {
  assert.equal(leer(BUENA).out.length, 1);
});

test("basura inicial sin FF", () => {
  const { out } = leer(Uint8Array.from([0x12, 0x34, 0x00, ...BUENA]));
  assert.deepEqual(out, [BUENA]);
});

test("FF espurio antes de la respuesta", () => {
  const { out } = leer(Uint8Array.from([0xff, ...BUENA]));
  assert.deepEqual(out, [BUENA]);
});

test("lectura partida en trozos (cualquier corte)", () => {
  for (let corte = 1; corte < 9; corte++) {
    const { out } = leer(BUENA.slice(0, corte), BUENA.slice(corte));
    assert.deepEqual(out, [BUENA], "corte en " + corte);
  }
  const bytes = Array.from(BUENA).map((b) => Uint8Array.from([b]));
  assert.equal(leer(...bytes).out.length, 1);
});

test("checksum alterado se rechaza", () => {
  const mala = Uint8Array.from(BUENA);
  mala[8] ^= 1;
  assert.equal(leer(mala).out.length, 0);
});

test("trama truncada no sale", () => {
  assert.equal(leer(BUENA.slice(0, 7)).out.length, 0);
});

test("trama corrupta seguida de una buena", () => {
  const mala = Uint8Array.from(BUENA);
  mala[3] = 0x77;
  const { out } = leer(Uint8Array.from([...mala, ...BUENA]));
  assert.deepEqual(out, [BUENA]);
});

test("respuesta de otro comando seguida de la esperada: salen las dos y se filtra por comando", () => {
  const otra = P.respuesta(0x88, 0x04);
  const { out } = leer(Uint8Array.from([...otra, ...BUENA]));
  assert.equal(out.length, 2);
  assert.equal(out[1][1], 0x85);
});

test("ráfaga de ruido larga no hace crecer el búfer", () => {
  const l = new P.LectorTramas();
  const ruido = new Uint8Array(10000).map((_, i) => (i * 37) & 0xff);
  l.alimentar(ruido);
  assert.ok(l.n <= 9);
  assert.deepEqual(l.alimentar(BUENA), [BUENA]);
});
