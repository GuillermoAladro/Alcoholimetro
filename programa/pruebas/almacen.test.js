/* Almacén: ranking, top 10, borrado a las 24 h, reconstrucción tras cortes de luz, tarjeta llena y diario de cobros. */
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const os = require("os");
const path = require("path");
const fsn = require("fs");
const { RelojVirtual } = require("../nucleo/reloj");
const { Almacen } = require("../nucleo/almacen");
const { Ranking } = require("../nucleo/ranking");
const { FSMemoria } = require("../sim/fs_memoria");
const { FSNode } = require("../pi/fs_node");
const U = require("../nucleo/util");

const HORA = 3600e3;

function nuevo(fs, reloj) {
  reloj = reloj || new RelojVirtual(Date.UTC(2026, 9, 26, 21));
  fs = fs || new FSMemoria({ ahora: () => reloj.ahora() });
  return { fs, reloj, alm: new Almacen({ fs, reloj }) };
}

async function partida(alm, reloj, valor, conFoto = true) {
  const t = reloj.ahora();
  const id = U.nuevoId(t);
  if (conFoto) await alm.guardarFoto(id, new Uint8Array([0xff, 0xd8, 1, 2, 3, 0xff, 0xd9]), t);
  const r = await alm.registrarPartida({ id, t, valor, foto: conFoto });
  return { id, r };
}

test("puesto, total y top 10 con empates (manda el que llegó antes)", () => {
  const r = new Ranking();
  const vals = [10, 50, 50, 0, 90, 30, 50, 70, 20, 60, 80, 40, 50];
  const res = vals.map((v, i) => r.anadir({ id: "p" + i, valor: v, t: i }));
  assert.equal(r.total, vals.length);
  assert.equal(res[4].puesto, 1); // 90 primero
  assert.equal(r.puesto(50), 5); // por encima: 90, 80, 70, 60
  assert.deepEqual(r.top.map((e) => e.valor), [90, 80, 70, 60, 50, 50, 50, 50, 40, 30]);
  assert.equal(r.top[4].id, "p1"); // el primer 50 que llegó
  assert.equal(Ranking.topPorcentaje(120, 360), 34);
  assert.equal(Ranking.topPorcentaje(1, 360), 1);
  assert.equal(Ranking.topPorcentaje(1, 5), null);
  const j = Ranking.desdeJSON(JSON.parse(JSON.stringify(r.aJSON())));
  assert.deepEqual(j.aJSON(), r.aJSON());
});

test("las fotos fuera del top se borran a las 24 h; las del top se quedan", async () => {
  const { alm, reloj } = nuevo();
  await alm.abrir();
  const altos = [];
  for (let i = 0; i < 10; i++) altos.push((await partida(alm, reloj, 100 + i)).id);
  await reloj.avanzar(1000);
  const bajo = (await partida(alm, reloj, 5)).id;
  await reloj.avanzar(23 * HORA);
  assert.deepEqual(await alm.limpiar(), []);
  await reloj.avanzar(1 * HORA + 1000);
  assert.deepEqual(await alm.limpiar(), [bajo]);
  assert.equal(await alm.leerFoto(bajo), null);
  for (const id of altos) assert.ok(await alm.leerFoto(id), "sigue la del top");
  // un resultado nuevo saca del top al último: su foto tiene más de 24 h y se borra
  await partida(alm, reloj, 200);
  const borradas = await alm.limpiar();
  assert.deepEqual(borradas, [altos[0]]);
  assert.equal(alm.ranking.total, 12);
});

test("sin hora de red (reloj en 1970) no se borra nada", async () => {
  const reloj = new RelojVirtual(0);
  const { alm } = nuevo(null, reloj);
  await alm.abrir();
  await partida(alm, reloj, 5);
  await reloj.avanzar(48 * HORA);
  assert.deepEqual(await alm.limpiar(), []);
});

test("estado.json corrupto o desfasado: se reconstruye desde las partidas", async () => {
  const { alm, reloj, fs } = nuevo();
  await alm.abrir();
  for (const v of [30, 60, 10, 90]) await partida(alm, reloj, v);
  const antes = alm.ranking.aJSON();
  await fs.escribirAtomico("estado.json", "{roto");
  const b = new Almacen({ fs, reloj });
  await b.abrir();
  assert.deepEqual(b.ranking.aJSON(), antes);
  assert.equal(b.fotos.size, 4);
  // estado.json viejo (le falta la última partida)
  const viejo = await fs.leer("estado.json");
  await partida(b, reloj, 95);
  await fs.escribirAtomico("estado.json", viejo);
  const c = new Almacen({ fs, reloj });
  await c.abrir();
  assert.equal(c.ranking.total, 5);
  assert.equal(c.ranking.top[0].valor, 95);
});

test("apagón a mitad de una línea: la línea cortada se ignora y lo demás sigue", async () => {
  const { alm, reloj, fs } = nuevo();
  await alm.abrir();
  await partida(alm, reloj, 40);
  fs.fallos.cortarEnProximaEscritura = true;
  const r = await partida(alm, reloj, 70, false);
  assert.equal(r.r.guardada, false); // la pantalla lo enseña, pero se sabe que no quedó guardado
  // la prueba se jugó (está en estado.json) aunque su línea quedó cortada
  const b = new Almacen({ fs, reloj });
  await b.abrir();
  assert.equal(b.ranking.total, 2);
  // la línea siguiente no se pega a la media línea: sobrevive a una reconstrucción completa
  const ultima = await partida(b, reloj, 20, false);
  await fs.borrar("estado.json");
  const c = new Almacen({ fs, reloj });
  await c.abrir();
  assert.equal(c.ranking.total, 2); // 40 y 20 (la de 70 no llegó a escribirse entera)
  assert.equal(c.ultimo, ultima.id);
});

test("tarjeta llena o de solo lectura: salud() lo dice y se recupera sola", async () => {
  const { alm, fs } = nuevo();
  await alm.abrir();
  assert.equal((await alm.salud()).ok, true);
  fs.fallos.llena = true;
  assert.equal((await alm.salud()).ok, false);
  fs.fallos.llena = false;
  fs.fallos.soloLectura = true;
  await assert.rejects(alm.anotarCobro("x", { estado: "abriendo" }));
  assert.equal((await alm.salud()).ok, false);
  fs.fallos.soloLectura = false;
  assert.equal((await alm.salud()).ok, true);
});

test("diario de cobros: se recupera tras reiniciar y se compacta sin perder los abiertos", async () => {
  const { alm, reloj, fs } = nuevo();
  alm.maxCobrosBytes = 4000;
  await alm.abrir();
  for (let i = 0; i < 200; i++) {
    await alm.anotarCobro("r" + i, { estado: "abriendo" });
    await alm.anotarCobro("r" + i, { estado: "abierto", checkout_id: "c" + i });
    await alm.anotarCobro("r" + i, { estado: i === 150 ? "pagado" : "caducado" });
    await reloj.avanzar(10);
  }
  const b = new Almacen({ fs, reloj });
  await b.abrir();
  const abiertos = b.cobrosAbiertos();
  assert.equal(abiertos.length, 1);
  assert.equal(abiertos[0].ref, "r150");
  assert.equal(abiertos[0].checkout_id, "c150");
  assert.ok((await fs.leer("cobros.jsonl")).length < 30000);
});

test("lo mismo sobre el disco de verdad (fs_node)", async () => {
  const dir = fsn.mkdtempSync(path.join(os.tmpdir(), "alc-"));
  try {
    const reloj = new RelojVirtual(Date.UTC(2026, 9, 26, 21));
    const fs = new FSNode(dir);
    const alm = new Almacen({ fs, reloj });
    await alm.abrir();
    for (const v of [12, 44, 3]) await partida(alm, reloj, v);
    await alm.anotarCobro("a", { estado: "pagado" });
    const st = fsn.statSync(path.join(dir, "estado.json"));
    assert.equal(st.mode & 0o777, 0o600);
    assert.equal(fsn.statSync(path.join(dir, "fotos")).mode & 0o777, 0o700);
    const b = new Almacen({ fs: new FSNode(dir), reloj });
    await b.abrir();
    assert.equal(b.ranking.total, 3);
    assert.equal(b.cobrosAbiertos().length, 1);
    assert.ok((await b.fs.libre()) > 0);
    await assert.rejects(b.fs.leer("../../etc/passwd"));
  } finally {
    fsn.rmSync(dir, { recursive: true, force: true });
  }
});
