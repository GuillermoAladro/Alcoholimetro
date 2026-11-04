"use strict";
/* 00093.2 · Guillermo y Marta · El libro
 *
 * Negro → el rincón de lectura del bar, de noche: pared color miel con papel de hojitas, zócalo de
 * nogal, una estantería altísima de madera oscura llena de libros de colores (lomos sin letras),
 * una lámpara de pie con su pantalla de tela, una alfombra persa, una mesita con una taza que humea,
 * una planta grande y un cuadrito. Marta, sentada en un taburete junto a la lámpara, lee un libro
 * gordo, tan tranquila: pasa una página, sonríe con lo que lee. Guillermo, al lado de la estantería,
 * se aburre: suspira, da golpecitos con el pie, mira a todas partes… y mira arriba: en el estante
 * de arriba brilla un tomo gigantesco. Se pone de puntillas, lo saca tirando del lomo… y el tomo le
 * cae en los brazos: ¡zas!, se le doblan las rodillas. Se tambalea de un lado a otro con él, rojo y
 * sudando (Marta pasa otra página), hasta que se da de espaldas contra la estantería: ¡pum! La
 * estantería tiembla… y aguanta. Suspira aliviado. Pero en el hueco que dejó el tomo, los libros
 * empiezan a caer uno sobre otro como fichas de dominó (¡tac, tac, tac!) y, al llegar al final,
 * todo se viene abajo: una lluvia de libros que le cae encima (le dan en la cabeza, suelta el tomo
 * en el regazo, se encoge) hasta enterrarlo en una montaña de libros entre una nube de polvo. Solo
 * le asoman las zapatillas… y una mano, arriba, que se agita sin fuerzas y se rinde. Marta pasa una
 * página sin levantar la vista. El último libro, que se tambaleaba en el borde del estante, cae
 * abierto y se queda en lo alto de la montaña como un tejadito; las zapatillas se meten dentro y
 * ¡pop!: Guillermo asoma la cabeza por arriba con el libro puesto de tejado, mareado. Marta sube su
 * libro hasta la nariz y le mira por encima, solo con los ojos; lo baja un poco, sonríe y guiña un
 * ojo a cámara → negro.
 *
 * Sin textos. Los libros de la estantería son rectángulos con su lomo (sin letras); los que caen
 * siguen trayectorias fijas: de su hueco a un sitio de la montaña calculado una sola vez (se apilan
 * por orden de llegada sobre un perfil de alturas). El libro de Marta y el tomo se dibujan en
 * coordenadas de la escena desde la mano lejana (quedan detrás de esa mano y delante del cuerpo) y
 * las manos se ponen en sus bordes. Todo depende del tiempo absoluto `t`.
 */
(() => {
  const { clamp, lerp, fase, suave, salida, entrada, tramo, campana, ruido, hash } = M2;
  const G = Guillermo, M = Marta;
  const S = 0.29, SUELO = 540, DUR = 14.6;
  const XM = 168, YPM = SUELO - 108;               // pelvis de Marta sentada (pantalla)
  const XG = 590;                                  // donde acaba Guillermo (enterrado)
  const T = {
    // Guillermo se aburre y va a por el tomo
    suspiro: 0.95, golpes0: 1.6, golpes1: 2.6, miraArriba: 2.75, brillo: 2.95, idea: 3.3,
    paso0: 3.72, paso1: 4.02, alcanza0: 3.85, alcanza1: 4.12, tira0: 4.16, tira1: 4.38, cae: 4.56, aplasta1: 4.86,
    tambaleo0: 4.9, tambaleo1: 7.12, topeton: 7.2, alivio0: 7.45, alivio1: 7.95,
    // dominó y lluvia de libros
    domino0: 8.0, oye: 8.18, horror: 8.55, agacha0: 8.8, suelta: 9.12, tortuga: 9.45, quieto: 10.3,
    mano0: 10.45, mano1: 11.25, tejado0: 11.0, tejado1: 11.38, mete0: 11.42, mete1: 11.58, pop0: 11.62, pop1: 11.9,
    miraM: 12.55, camaraG: 13.1,
    // Marta
    pag1: 1.25, sonrisaM: 2.3, pag2: 5.55, pag3: 10.85, sube0: 11.95, sube1: 12.4, ojeo: 12.45, baja0: 12.95, baja1: 13.3,
    guino: 13.42, fin: 13.95
  };

  /* ---------- utilidades ---------- */
  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n] ?? a[n], k); return o; };
  function linea(guion, estados, ini, t) {
    let c = estados[ini];
    for (const [t0, t1, nom, f] of guion) { if (t <= t0) break; c = mezclaE(c, estados[nom], (f || suave)(fase(t, t0, t1))); }
    return Object.assign({}, c);
  }
  const D5 = (pu, ix, md, an, me) => ({ pulgar: pu, indice: ix, medio: md, anular: an, menique: me });
  const D = (pu, ix, md, re) => D5(pu, ix, md, re, re);
  const DD = (a, b, k) => ({ pulgar: lerp(a.pulgar, b.pulgar, k), indice: lerp(a.indice, b.indice, k), medio: lerp(a.medio, b.medio, k),
    anular: lerp(a.anular, b.anular, k), menique: lerp(a.menique, b.menique, k) });
  const parpadeo = (t, lista, d = 0.14) => { let o = 0; for (const tb of lista) { const k = fase(t, tb, tb + d); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); } return o; };
  const rota = (q, a) => { const c = Math.cos(a), s = Math.sin(a); return { x: q.x * c - q.y * s, y: q.x * s + q.y * c }; };
  const TINTA = "#1a120c";
  let MATRIZ = null;

  /* ---------- manos ---------- */
  const JK = G.JK, R_M = G.MUNECA_R * JK;
  const BOLS_G = { c: { x: 131 - Math.cos(-1.75) * R_M, y: 652 - Math.sin(-1.75) * R_M }, l: { x: 372 - Math.cos(-1.75) * R_M, y: 648 - Math.sin(-1.75) * R_M } };
  function bolsillo(R, p, lado) {
    if (R === G) return G.tronco(p)(lado === "cerca" ? BOLS_G.c : BOLS_G.l);
    const m = R.manoReposo(p, lado); return { x: m.x, y: m.y };
  }
  // objetivo: { bols } | { tr: punto del tronco (hoja) } | { scr: () => punto de pantalla }
  function resolutor(R, p, lado) {
    return o => {
      if (o.bols) { const b = bolsillo(R, p, lado);
        return { x: b.x, y: b.y, mu: -1.75, ang: 0, puno: o.sale ? 1 : 0, dedos: o.dedos || D(0.4, 0.4, 0.4, 0.4), dobla: lado === "cerca" ? -1 : 1 }; }
      const q = o.tr ? R.tronco(p)(o.tr) : R.aHoja(p, o.scr());
      return { x: q.x, y: q.y, mu: o.mu, ang: o.ang || 0, puno: o.puno ?? 1, dedos: o.dedos || D(0.35, 0.35, 0.35, 0.35), dobla: o.dobla ?? (lado === "cerca" ? -1 : 1) };
    };
  }
  function pista(lista, t, resuelve) {
    let c = resuelve(lista[0][2]);
    for (let i = 1; i < lista.length; i++) {
      const [t0, t1, obj, f] = lista[i];
      if (t <= t0) break;
      const k = (f || suave)(fase(t, t0, t1)), d = resuelve(obj);
      c = { x: lerp(c.x, d.x, k), y: lerp(c.y, d.y, k), mu: lerp(c.mu, d.mu, k), ang: lerp(c.ang, d.ang, k), puno: lerp(c.puno, d.puno, k),
        dedos: DD(c.dedos, d.dedos, k), dobla: k < 0.5 ? c.dobla : d.dobla };
    }
    return c;
  }
  const mano = m => ({ x: m.x, y: m.y, ang: m.ang, mu: m.mu, dobla: m.dobla, puno: m.puno, dedos: m.dedos });
  // la mano (centro del puño) para que la muñeca quede donde toca: la escena da el punto de agarre
  const agarre = (q, mu, off = 6) => ({ x: q.x - Math.cos(mu) * off, y: q.y - Math.sin(mu) * off });

  /* ---------- caras ---------- */
  const BASE = { mx: 0.85, my: 0, c: 0, cd: 0, ci: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, orig: 0, abre: 0, ancho: 1, sonr: 0.15, lengua: 0, mof: 0, rub: 0, esp: 0 };
  const E = o => Object.assign({}, BASE, o);
  function cara(e, parp) {
    return { mirada: { x: e.mx, y: e.my }, iris: e.iris,
      ojos: { d: clamp(Math.max(e.c, e.cd, parp)), i: clamp(Math.max(e.c, e.ci, parp)), feliz: e.h, apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: e.orig, abre: Math.max(0, e.abre), ancho: e.ancho, sonrisa: e.sonr, dientes: true, lengua: e.lengua },
      mofletes: e.mof, rubor: e.rub, bigote: 0, espiral: e.esp };
  }

  /* ================= la estantería ================= */
  const BX0 = 330, BX1 = 800, LAT = 14, X0I = BX0 + LAT, X1I = BX1 - LAT;
  const CORONA = 92, TAB = 12;
  const BALDA = [235, 322, 405, 478];              // cara de arriba de cada balda
  const TECHO = [CORONA + 12, BALDA[0] + TAB, BALDA[1] + TAB, BALDA[2] + TAB];
  const TOMO = { x: 664, w: 38, h: 118 };         // hueco del tomo en el estante de arriba
  const COLS = [["#8e2a2a", "#c9a24e"], ["#1f3b63", "#d6b65a"], ["#2f5d3a", "#e0c070"], ["#c98a2b", "#5a2d10"], ["#5b2a55", "#e3c27a"],
    ["#1d6b6b", "#f0d68a"], ["#a8452a", "#f2d9a0"], ["#e8dcc0", "#8e2a2a"], ["#3b3b46", "#c9a24e"], ["#7a5230", "#f1d79a"],
    ["#b23a48", "#f3e0b0"], ["#40668c", "#f5e6b8"], ["#6b7a2a", "#f0dc9a"], ["#d9b44a", "#4a2a12"]];
  const LIBROS = [];                               // libros de los estantes 1 a 3 (los del 4 van en el fondo)
  const FIJOS = [];                                // estante 4
  (function genera() {
    let id = 0;
    for (let c = 0; c < 4; c++) {
      const piso = BALDA[c], alto = piso - TECHO[c];
      let x = X0I + 3, n = 0;
      while (x < X1I - 10) {
        if (c === 0 && x + 22 > TOMO.x && x < TOMO.x + TOMO.w + 1) { x = TOMO.x + TOMO.w + 1; continue; }
        const r = hash(c * 97 + n * 13.7 + 2);
        const w = Math.round(10 + 11 * hash(c * 31 + n * 7.3 + 1));
        const h = Math.round(alto * (c === 0 ? 0.56 + 0.3 * r : 0.68 + 0.26 * r));
        if (x + w > X1I - 2) break;
        const col = COLS[Math.floor(hash(c * 53 + n * 3.1 + 9) * COLS.length)];
        const lib = { id: id++, c, n, x, w, h, piso, col, banda: Math.floor(hash(n * 5.3 + c) * 3) };
        if (c === 3) FIJOS.push(lib); else LIBROS.push(lib);
        x += w + (hash(c * 11 + n * 17.1) < 0.12 ? 3 : 0.5);
        n++;
      }
    }
  })();

  /* ---------- dominó y lluvia: tiempos y caminos de cada libro ----------
   * Estante de arriba: los del lado del hueco del tomo se inclinan hacia él uno tras otro (dominó);
   * luego, todo cae. Estantes 2 y 3: caen los que no están detrás de Guillermo; los demás solo se
   * mueven con el temblor. Uno (el «tejadito») se queda tambaleándose en el borde y cae al final. */
  const G_GRAV = 2600;
  const TEJADO = LIBROS.filter(l => l.c === 0 && l.x > 730).slice(-2)[0];
  (function planifica() {
    const arriba = LIBROS.filter(l => l.c === 0);
    const izq = arriba.filter(l => l.x < TOMO.x).sort((a, b) => b.x - a.x);
    const der = arriba.filter(l => l.x > TOMO.x).sort((a, b) => a.x - b.x);
    izq.forEach((l, i) => { l.tInc = T.domino0 + 0.06 + i * 0.05; l.inc = i === 0 ? 1.05 : 0.5 + 0.12 * hash(l.id); l.piv = "d"; l.orden = i; });
    der.forEach((l, i) => { l.tInc = T.domino0 + i * 0.07; l.inc = -(i === 0 ? 1.0 : 0.5 + 0.12 * hash(l.id + 3)); l.piv = "i"; l.orden = i; });
    for (const l of arriba) {
      l.cae = l !== TEJADO && l.x > X0I + 40;
      l.tCae = 8.86 + 0.028 * l.orden + 0.06 * hash(l.id * 3.3);
      if (l.x + l.w > 545 && l.x < 690) l.tCae = Math.max(l.tCae, 9.18 + 0.05 * hash(l.id));
    }
    for (const l of LIBROS.filter(l => l.c > 0)) {
      const detras = l.x + l.w > 528 && l.x < 700;
      l.cae = (!detras && hash(l.id * 1.7) < (l.c === 1 ? 0.85 : 0.55)) || (detras && l.c === 1 && hash(l.id * 2.3) < 0.6);
      const lado = l.x < 528 ? (528 - l.x) / 180 : (l.x - 700) / 90;
      l.tCae = 9.0 + 0.16 * l.c + 0.32 * clamp(lado) + 0.08 * hash(l.id * 2.9);
      if (detras) l.tCae = 9.5 + 0.35 * hash(l.id * 5.1);
      // tiembla con el topetazo; algunos se quedan inclinados
      l.inc = 0; if (!l.cae && hash(l.id * 4.1) < 0.35) { l.inc = (hash(l.id) < 0.5 ? -1 : 1) * (0.25 + 0.3 * hash(l.id * 6.6)); l.tInc = 9.2 + 0.4 * hash(l.id * 8.8); l.piv = l.inc > 0 ? "d" : "i"; }
    }
    if (TEJADO) { TEJADO.tInc = T.domino0 + 0.5; TEJADO.inc = -0.18; TEJADO.piv = "i"; }
  })();

  // perfil de la montaña (pantalla): lo alto que puede llegar en cada x (fuera de ella, una capa en el suelo)
  const MX0 = 500, MX1 = 736, FX0 = 334, FX1 = 812;
  const PERF = [[500, SUELO], [518, 462], [540, 368], [565, 334], [600, 326], [650, 322], [688, 334], [706, 378], [716, 448], [727, 500], [736, SUELO - 12]];
  function perfilMonte(x) {
    if (x <= PERF[0][0] || x >= PERF[PERF.length - 1][0]) return SUELO;
    let i = 1; while (PERF[i][0] < x) i++;
    const [x0, y0] = PERF[i - 1], [x1, y1] = PERF[i];
    return lerp(y0, y1, suave((x - x0) / (x1 - x0)));
  }
  function perfilObjetivo(x) { return Math.min(SUELO - 16, perfilMonte(x)); }
  // los que caen, por orden de llegada; se van apilando sobre las alturas que ya hay. Los que caen
  // encima de Guillermo forman la montaña; los demás caen recto al suelo, delante de su hueco.
  const CAEN = [], CAPON = [];
  (function apila() {
    const lista = LIBROS.filter(l => l.cae);
    for (const l of lista) {
      const ox = l.x + l.w / 2;
      l.monte = ox > 488 && ox < 770;
      const y0 = l.piso - l.h / 2, drop = (l.monte ? 400 : SUELO - 10) - y0;
      l.tVuelo = Math.sqrt(2 * Math.max(60, drop) / G_GRAV) + 0.04;
    }
    for (const l of lista) l.tLlega = l.tCae + l.tVuelo;
    CAPON.push(...lista.filter(l => l.c === 0 && l.x > 690).sort((a, b) => a.tLlega - b.tLlega).slice(0, 2));
    CAPON.forEach((l, i) => {
      l.capon = T.agacha0 + 0.2 + i * 0.12;
      l.tCae = l.capon - 0.16;
      l.tLlega = Math.max(l.tLlega, l.capon + 0.32);
    });
    lista.sort((a, b) => a.tLlega - b.tLlega);
    const N = FX1 - FX0 + 1, alt = new Float32Array(N).fill(SUELO);
    lista.forEach((l, k) => {
      const largo = l.h, grosor = l.w;
      const jit = (hash(l.id * 7.7) - 0.5) * (l.monte ? 0.8 : 0.2);
      const ax = Math.abs(Math.cos(jit)) * largo + Math.abs(Math.sin(jit)) * grosor;
      const ay = Math.abs(Math.sin(jit)) * largo + Math.abs(Math.cos(jit)) * grosor;
      const ox = l.x + l.w / 2;
      const busca = (a0, a1, monte) => {
        let mejor = null;
        for (let cx = a0; cx <= a1; cx += 4) {
          let top = SUELO; for (let x = Math.max(FX0, Math.floor(cx - ax / 2)); x <= Math.min(FX1, cx + ax / 2); x++) top = Math.min(top, alt[x - FX0]);
          const hueco = (top - ay) - perfilObjetivo(cx);
          const pun = hueco + 18 * hash(l.id * 3.1 + cx * 0.13) - (monte ? 0 : 0.3 * Math.abs(cx - ox));
          if (!mejor || pun > mejor.pun) mejor = { pun, cx, top, hueco };
        }
        return mejor;
      };
      let mejor = l.monte ? busca(MX0 + ax * 0.3, MX1 - ax * 0.3, true) : busca(Math.max(FX0 + ax / 2, ox - 40), Math.min(FX1 - ax / 2, ox + 40), false);
      // la montaña ya está llena: resbala y cae al suelo, a su izquierda
      if (l.monte && mejor.hueco < -10) { l.monte = false; l.resbala = true; mejor = busca(FX0 + ax / 2, 515 - ax * 0.2, false); }
      const cy = mejor.top - ay / 2 + 3;
      for (let x = Math.max(FX0, Math.floor(mejor.cx - ax / 2 + 3)); x <= Math.min(FX1, mejor.cx + ax / 2 - 3); x++) alt[x - FX0] = Math.min(alt[x - FX0], cy - ay / 2 + 4);
      l.pila = { x: mejor.cx, y: cy, a: (hash(l.id * 9.1) < 0.5 ? 1 : -1) * Math.PI / 2 + jit };
      l.giros = (hash(l.id * 5.5) - 0.5) * 3;
      CAEN.push(l);
    });
    CAEN.sort((a, b) => a.tLlega - b.tLlega);
  })();
  /* ---------- dibujo de un libro (lomo) en su marco: centro en el origen ---------- */
  function lomo(g, l, sombra) {
    const w = l.w, h = l.h, x = -w / 2, y = -h / 2;
    g.fillStyle = l.col[0]; g.fillRect(x, y, w, h);
    g.fillStyle = "rgba(255,255,255,0.16)"; g.fillRect(x + w * 0.18, y + 1, w * 0.22, h - 2);
    g.fillStyle = "rgba(0,0,0,0.18)"; g.fillRect(x + w * 0.74, y + 1, w * 0.26, h - 2);
    g.fillStyle = l.col[1];
    if (l.banda === 0) { g.fillRect(x + 1, y + h * 0.12, w - 2, 2); g.fillRect(x + 1, y + h * 0.82, w - 2, 2); }
    else if (l.banda === 1) { g.fillRect(x + 1, y + h * 0.18, w - 2, h * 0.12); g.fillRect(x + 1, y + h * 0.86, w - 2, 1.5); }
    else { g.beginPath(); g.ellipse(0, y + h * 0.3, w * 0.24, w * 0.24, 0, 0, Math.PI * 2); g.fill(); g.fillRect(x + 1, y + h * 0.88, w - 2, 1.5); }
    g.strokeStyle = TINTA; g.lineWidth = 1.3; g.strokeRect(x, y, w, h);
    if (sombra) { g.fillStyle = `rgba(20,10,4,${sombra})`; g.fillRect(x, y, w, h); }
  }
  // posición de un libro en su estante (inclinado sobre una esquina de abajo) en el tiempo t
  function enEstante(l, t, temblor) {
    let a = 0;
    if (l.tInc !== undefined && t > l.tInc) {
      const u = t - l.tInc, k = clamp(u / 0.16);
      a = l.inc * (entrada(k) + (k >= 1 ? 0.12 * Math.sin((u - 0.16) * 30) * Math.exp(-(u - 0.16) * 9) : 0));
    }
    if (l === TEJADO && t > T.domino0 + 0.7) a += 0.06 * Math.sin(t * 7.5) * clamp((t - T.domino0 - 0.7) * 2);
    a += temblor * 0.05 * ruido(t * 31 + l.id);
    const px = l.piv === "d" ? l.x + l.w : l.x, py = l.piso;
    const c = rota({ x: (l.x + l.w / 2) - px, y: -l.h / 2 }, a);
    return { x: px + c.x, y: py + c.y, a };
  }
  // vuelo: del estante a su sitio en la montaña (o a la cabeza de Guillermo y luego a la montaña)
  function giroLibro(l, ini, u) {
    return { a: lerp(ini.a, l.pila.a, u) + l.giros * Math.PI * Math.sin(Math.PI * u) * 0.5,
      esc: 1 + 0.12 * Math.sin(Math.PI * clamp(u * 1.5)) };
  }
  function esquinaBaja(l, q) {
    const local = { x: Math.sign(Math.sin(q.a)) * l.w * q.esc / 2, y: Math.sign(Math.cos(q.a)) * l.h * q.esc / 2 };
    return rota(local, q.a);
  }
  function enVuelo(l, t, ini) {
    const fin = l.pila;
    const u = fase(t, l.tCae, l.tLlega);
    let x, y;
    if (l.capon && CABEZA_CAPON[l.id]) {
      const tc = l.capon, corona = CABEZA_CAPON[l.id];
      const borde = esquinaBaja(l, giroLibro(l, ini, fase(tc, l.tCae, l.tLlega)));
      const hc = { x: corona.x - borde.x, y: corona.y - borde.y };
      if (t < tc) { const k = fase(t, l.tCae, tc); x = lerp(ini.x, hc.x, k); y = lerp(ini.y, hc.y, k * k); }
      else { const k = fase(t, tc, l.tLlega); x = lerp(hc.x, fin.x, k); y = lerp(hc.y, fin.y, k) - 60 * Math.sin(Math.PI * k) * (1 - k * 0.3); }
    } else {
      x = lerp(ini.x, fin.x, suave(u) * 0.4 + u * 0.6);
      y = lerp(ini.y, fin.y, u * u);
      // sale un poco hacia delante del estante
      y -= 10 * Math.sin(Math.PI * clamp(u * 2));
    }
    return { x, y, ...giroLibro(l, ini, u) };
  }
  // rebotito al llegar
  function enPila(l, t) {
    const u = t - l.tLlega, k = Math.exp(-u * 10);
    return { x: l.pila.x, y: l.pila.y - 6 * Math.abs(Math.sin(u * 22)) * k, a: l.pila.a + 0.12 * Math.sin(u * 25) * k, esc: 1 };
  }
  let CABEZA_CAPON = {};

  /* ================= el tomo ================= */
  // caja con lomo (ancho TOMO.w) y tapa (ancho TOMO_TAPA); beta: 0 = de lomo, 1 = de tapa
  const TOMO_TAPA = 88;
  function dibTomo(g, cx, cy, ang, beta, esc = 1) {
    const wl = TOMO.w * Math.cos(beta * Math.PI / 2), wt = TOMO_TAPA * Math.sin(beta * Math.PI / 2), h = TOMO.h;
    const W0 = wl + wt;
    g.save(); g.translate(cx, cy); g.rotate(ang); g.scale(esc, esc); g.lineJoin = "round";
    const x0 = -W0 / 2;
    // lomo
    if (wl > 0.5) {
      g.fillStyle = "#5a2414"; g.beginPath(); g.rect(x0, -h / 2, wl, h); g.fill();
      g.fillStyle = "rgba(255,210,150,0.14)"; g.fillRect(x0 + wl * 0.15, -h / 2 + 2, wl * 0.25, h - 4);
      g.fillStyle = "#d9a83a";
      for (const f of [0.1, 0.24, 0.76, 0.9]) g.fillRect(x0 + 2, -h / 2 + h * f, Math.max(0, wl - 4), 3);
      g.save(); g.translate(x0 + wl / 2, 0); g.scale(Math.max(0.01, wl / TOMO.w), 1);
      g.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, r = i % 2 ? 6 : 13; const q = { x: Math.cos(a) * r, y: Math.sin(a) * r }; i ? g.lineTo(q.x, q.y) : g.moveTo(q.x, q.y); } g.closePath(); g.fill();
      g.restore();
      g.strokeStyle = TINTA; g.lineWidth = 1.6; g.strokeRect(x0, -h / 2, wl, h);
    }
    // tapa
    if (wt > 0.5) {
      const xt = x0 + wl;
      g.fillStyle = "#e9dcc0"; g.fillRect(xt + wt - Math.min(6, wt * 0.08), -h / 2 + 3, Math.min(6, wt * 0.08), h - 6);   // cantos de las hojas
      g.fillStyle = "#6d2c18"; g.fillRect(xt, -h / 2, wt - Math.min(5, wt * 0.07), h);
      g.fillStyle = "rgba(255,210,150,0.12)"; g.fillRect(xt + 3, -h / 2 + 3, wt * 0.3, h - 6);
      g.save(); g.translate(xt + wt / 2 - 2, 0); g.scale(Math.max(0.01, wt / TOMO_TAPA), 1);
      g.strokeStyle = "#d9a83a"; g.lineWidth = 2.2; g.strokeRect(-34, -h / 2 + 8, 66, h - 16);
      g.lineWidth = 1.2; g.strokeRect(-30, -h / 2 + 12, 58, h - 24);
      g.fillStyle = "#d9a83a";
      for (const [sx, sy] of [[-34, -h / 2 + 8], [32, -h / 2 + 8], [-34, h / 2 - 8], [32, h / 2 - 8]]) { g.beginPath(); g.moveTo(sx, sy); g.lineTo(sx + (sx < 0 ? 12 : -12), sy); g.lineTo(sx, sy + (sy < 0 ? 12 : -12)); g.closePath(); g.fill(); }
      g.beginPath(); g.arc(-1, -6, 15, 0, Math.PI * 2); g.lineWidth = 2.4; g.stroke();
      g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 4.5 : 10.5; const q = { x: -1 + Math.cos(a) * r, y: -6 + Math.sin(a) * r }; i ? g.lineTo(q.x, q.y) : g.moveTo(q.x, q.y); } g.closePath(); g.fill();
      g.fillRect(-20, 18, 38, 2.5); g.fillRect(-14, 25, 26, 2);
      g.restore();
      g.strokeStyle = TINTA; g.lineWidth = 1.8; g.strokeRect(xt, -h / 2, wt, h);
    }
    g.restore();
  }
  // brillo de «mírame» en el tomo
  function destello(g, x, y, r, k) {
    if (k <= 0.01) return;
    g.save(); g.globalAlpha = k; g.translate(x, y);
    const gr = g.createRadialGradient(0, 0, 0, 0, 0, r * 1.3); gr.addColorStop(0, "rgba(255,246,200,0.7)"); gr.addColorStop(1, "rgba(255,246,200,0)");
    g.fillStyle = gr; g.beginPath(); g.arc(0, 0, r * 1.3, 0, Math.PI * 2); g.fill();
    g.rotate(0.6 * k); g.fillStyle = "#fff6c8";
    g.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, rr = i % 2 ? r * 0.22 : r; i ? g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : g.moveTo(rr, 0); } g.closePath(); g.fill();
    g.restore();
  }

  /* ================= el libro de Marta ================= */
  // abierto en V visto desde fuera: lomo en el centro, tapas a los lados y el canto de las hojas arriba
  // b = { x, y (centro del lomo), ang, h, w (cada tapa), v (cuánto suben las esquinas de fuera), canto, pag (0..1 o -1) }
  function dibLibroM(g, b) {
    g.save(); g.translate(b.x, b.y); g.rotate(b.ang); g.lineJoin = "round"; g.lineCap = "round";
    const h = b.h, w = b.w, v = b.v, c = b.canto;
    const topL = { x: -w, y: -h / 2 - v }, botL = { x: -w, y: h / 2 - v * 0.6 }, topR = { x: w, y: -h / 2 - v }, botR = { x: w, y: h / 2 - v * 0.6 };
    // página que se pasa (por detrás de las tapas: solo asoma por arriba)
    if (b.pag > 0 && b.pag < 1) {
      const fi = Math.PI * suave(b.pag), L = w * 0.95;
      const tip = { x: Math.cos(fi) * L, y: -h / 2 - Math.sin(fi) * L * 0.75 - c };
      g.fillStyle = "#fbf4e2"; g.strokeStyle = TINTA; g.lineWidth = 1.1;
      g.beginPath(); g.moveTo(0, -h / 2 - c + 2); g.quadraticCurveTo(tip.x * 0.55, tip.y - 6 * Math.sin(fi), tip.x, tip.y);
      g.lineTo(tip.x * 0.98, tip.y + h * 0.7); g.lineTo(0, h * 0.2); g.closePath(); g.fill(); g.stroke();
      g.strokeStyle = "rgba(90,70,50,0.45)"; g.lineWidth = 0.9;
      for (let i = 1; i < 4; i++) { g.beginPath(); g.moveTo(tip.x * 0.2, tip.y * 0.25 + i * 6 - h * 0.1); g.lineTo(tip.x * 0.8, tip.y + i * 6 + 4); g.stroke(); }
    }
    // canto de las hojas (arriba)
    g.fillStyle = "#f3e8cc";
    g.beginPath(); g.moveTo(topL.x, topL.y); g.quadraticCurveTo(-w * 0.45, -h / 2 - c * 1.6, 0, -h / 2 - c * 0.6); g.quadraticCurveTo(w * 0.45, -h / 2 - c * 1.6, topR.x, topR.y);
    g.lineTo(topR.x, topR.y + 3); g.lineTo(0, -h / 2 + 2); g.lineTo(topL.x, topL.y + 3); g.closePath(); g.fill();
    g.strokeStyle = "rgba(120,96,70,0.6)"; g.lineWidth = 0.8;
    for (let i = 1; i <= 3; i++) { const f = i / 4; g.beginPath(); g.moveTo(topL.x * (1 - f * 0.1), topL.y + 3 - c * f * 0.5); g.quadraticCurveTo(-w * 0.45, -h / 2 - c * (1.6 - f), 0, -h / 2 - c * 0.6 + f * 2); g.quadraticCurveTo(w * 0.45, -h / 2 - c * (1.6 - f), topR.x * (1 - f * 0.1), topR.y + 3 - c * f * 0.5); g.stroke(); }
    // tapas
    const tapa = (a, bq, sg) => {
      g.beginPath(); g.moveTo(0, -h / 2); g.lineTo(a.x, a.y); g.lineTo(bq.x, bq.y); g.lineTo(0, h / 2); g.closePath();
      g.fillStyle = sg < 0 ? "#2f6d63" : "#3a7d72"; g.fill();
      g.save(); g.clip();
      g.fillStyle = "rgba(255,255,255,0.1)"; g.fillRect(sg < 0 ? -w : w * 0.55, -h, w * 0.45, h * 2);
      g.strokeStyle = "#e9c76a"; g.lineWidth = 1.4;
      g.beginPath(); g.moveTo(sg * 5, -h / 2 + 5); g.lineTo(sg * (w - 5), a.y + 5 - (a.y + h / 2) * 0.1); g.lineTo(sg * (w - 5), bq.y - 5); g.lineTo(sg * 5, h / 2 - 5); g.closePath(); g.stroke();
      g.fillStyle = "#e9c76a"; g.beginPath(); g.arc(sg * w * 0.52, (a.y + bq.y) / 2 + (h / 2 - v * 0.6) * 0.02, Math.min(w, h) * 0.14, 0, Math.PI * 2); g.fill();
      g.restore();
      g.strokeStyle = TINTA; g.lineWidth = 1.6;
      g.beginPath(); g.moveTo(0, -h / 2); g.lineTo(a.x, a.y); g.lineTo(bq.x, bq.y); g.lineTo(0, h / 2); g.stroke();
    };
    tapa(topL, botL, -1); tapa(topR, botR, 1);
    // lomo
    g.fillStyle = "#24564e"; g.beginPath(); g.ellipse(0, 0, 3.2, h / 2, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = TINTA; g.lineWidth = 1.2; g.stroke();
    g.restore();
  }

  /* ================= Marta ================= */
  const PEL_M = M.SUELO + (YPM - SUELO) / (S * M.K) - M.PELVIS.y;
  const CM = {
    lee: E({ mx: 0.55, my: 0.85, c: 0.25, sd: 4, si: 4, sonr: 0.25, ancho: 0.9 }),
    gusto: E({ mx: 0.55, my: 0.85, c: 0.3, h: 0.3, sd: 8, si: 10, sonr: 0.6, ancho: 0.95 }),
    serena: E({ mx: 0.5, my: 0.9, c: 0.35, sd: 2, si: 2, sonr: 0.18, ancho: 0.85 }),
    ojea: E({ mx: 1, my: 0.1, sd: 14, si: 18, gi: 0.08, sonr: 0.1, ancho: 0.7 }),
    sonrie: E({ mx: 0.9, my: 0, h: 0.35, c: 0.25, sd: 12, si: 14, sonr: 0.75, ancho: 1.0 }),
    guino: E({ mx: -0.4, my: 0, ci: 0, cd: 1, h: 0.6, sd: 6, si: 16, sonr: 0.8, ancho: 1.0 })
  };
  const GUION_CM = [
    [T.sonrisaM, T.sonrisaM + 0.25, "gusto"], [T.sonrisaM + 1.1, T.sonrisaM + 1.4, "lee"], [8.3, 8.6, "serena"],
    [T.ojeo, T.ojeo + 0.3, "ojea"], [T.baja0 + 0.05, T.baja1, "sonrie"], [T.guino, T.guino + 0.14, "guino"],
    [T.guino + 0.5, T.guino + 0.62, "sonrie"]
  ];
  const PARP_M = [0.6, 3.4, 4.9, 7.1, 9.0, 10.1, 12.2, 13.0];
  const CuM = o => Object.assign({ torso: 0.07, cab: 0.16, cdx: 0, cdy: 0 }, o);
  const CUER_M = {
    lee: CuM({}), gusto: CuM({ cab: 0.1, torso: 0.05 }), pasa: CuM({ cab: 0.2, torso: 0.08 }),
    alza: CuM({ torso: 0.0, cab: -0.04 }), ojea: CuM({ torso: 0.0, cab: -0.02 }), sonrie: CuM({ torso: -0.01, cab: -0.06 })
  };
  const GUION_M = [
    [T.sonrisaM, T.sonrisaM + 0.3, "gusto"], [T.sonrisaM + 1.1, T.sonrisaM + 1.4, "lee"],
    [T.sube0, T.sube1, "alza"], [T.ojeo, T.ojeo + 0.3, "ojea"], [T.baja0, T.baja1, "sonrie"]
  ];
  // libro de Marta: leyendo (a la altura del pecho, en V) → alzado (delante de la cara, bajo los ojos)
  const LEE = { tr: { x: 420, y: 470 }, ang: 0.08, h: 44, w: 33, v: 7, canto: 7 };
  function libroM(p, t) {
    const T0 = M.tronco(p), c0 = M.aPantalla(p, T0(LEE.tr));
    const H = M.cabeza(p), ojo = M.aPantalla(p, H.a({ x: 848, y: 548 }));
    const alza = tramo(t, T.sube0, T.sube1) * (1 - 0.32 * tramo(t, T.baja0, T.baja1));
    const arriba = { x: ojo.x + 6, y: ojo.y + 2 + 30 * (1 - 0.32 * 0) };
    const k = alza;
    const b = {
      x: lerp(c0.x, arriba.x, k), y: lerp(c0.y, arriba.y + 22 * tramo(t, T.baja0, T.baja1), k),
      ang: lerp(LEE.ang, -0.02, k), h: lerp(LEE.h, 58, k), w: lerp(LEE.w, 40, k), v: lerp(LEE.v, 2, k), canto: lerp(LEE.canto, 2.5, k), pag: -1
    };
    for (const tp of [T.pag1, T.pag2, T.pag3]) { const u = fase(t, tp, tp + 0.45); if (u > 0 && u < 1) b.pag = u; }
    // respiración y un vaivén de lectura
    b.y += 1.2 * Math.sin(t * 1.7 + 0.6);
    return b;
  }
  function poseM(t) {
    const b = linea(GUION_M, CUER_M, "lee", t);
    const respira = Math.sin(t * 1.7 + 0.6);
    const p = { x: XM, suelo: SUELO, s: S, tirasLimpias: true,
      pelvis: { x: M.PELVIS.x, y: M.PELVIS.y + PEL_M + respira * 0.8 },
      torso: b.torso, torsoEsc: { x: 1, y: 1 + respira * 0.004 }, piernas: {},
      cabeza: { ang: b.cab, dx: b.cdx, dy: b.cdy, esc: { x: 1, y: 1 } } };
    // al pasar página, la cabeza acompaña
    for (const tp of [T.pag1, T.pag2, T.pag3]) p.cabeza.ang += 0.05 * campana(t, tp, tp + 0.5);
    const aHojaX = sx => M.PELVIS.x + (sx - XM) / (S * M.K);
    const TOB = M.SUELO - M.TOBILLO_ALTO;
    p.piernas.cerca = { tob: { x: aHojaX(XM + 62), y: TOB }, ang: 0 };
    p.piernas.lejos = { tob: { x: aHojaX(XM + 80), y: TOB - 4 }, ang: -0.08 };
    // pelo: el soplo de polvo de la avalancha
    const soplo = campana(t, 9.35, 10.6);
    p.pelo = { viento: -0.8 * soplo, inercia: 0 };
    const e = linea(GUION_CM, CM, "lee", t);
    p.cara = cara(e, parpadeo(t, PARP_M));
    if (soplo > 0.05) p.cara.ojos.d = p.cara.ojos.i = Math.max(p.cara.ojos.d, 0.5 * soplo);
    // manos en los bordes del libro
    const lb = libroM(p, t);
    const borde = (sg, f) => { const q = rota({ x: sg * lb.w * 0.98, y: f * lb.h }, lb.ang); return { x: lb.x + q.x, y: lb.y + q.y }; };
    const res = resolutor(M, p, "cerca"), resL = resolutor(M, p, "lejos");
    const COGE = D5(0.45, 0.22, 0.2, 0.18, 0.18);
    const C = res({ scr: () => agarre(borde(-1, 0.12), -2.2, 4), mu: -2.2, dedos: COGE, dobla: -1 });
    const L = resL({ scr: () => agarre(borde(1, 0.1), -0.9, 4), mu: -0.9, dedos: COGE, dobla: 1 });
    // el pulgar lejano pasa la hoja
    for (const tp of [T.pag1, T.pag2, T.pag3]) { const k = campana(t, tp - 0.1, tp + 0.3); L.y -= 10 * k; L.dedos = DD(L.dedos, D5(1, 0.4, 0.3, 0.3, 0.3), k); }
    p.manoCerca = mano(C); p.manoLejos = mano(L);
    p.libro = lb;
    return p;
  }

  /* ================= Guillermo ================= */
  const CG = {
    aburre: E({ mx: 0.6, my: 0.2, c: 0.45, sd: -2, si: 0, sonr: -0.15, ancho: 0.7 }),
    suspira: E({ mx: 0.3, my: -0.6, c: 0.6, sd: 6, si: 8, abre: 8, ancho: 0.5, sonr: -0.1, mof: 0 }),
    mira1: E({ mx: -0.7, my: 0.1, c: 0.3, sd: 2, si: 4, sonr: -0.05, ancho: 0.7 }),
    mira2: E({ mx: 0.9, my: -0.2, c: 0.3, sd: 2, si: 4, sonr: -0.05, ancho: 0.7 }),
    arriba: E({ mx: 0.6, my: -1, sd: 14, si: 16, abre: 2, ancho: 0.5, sonr: 0.1 }),
    idea: E({ mx: -0.5, my: -0.1, sd: 18, gd: 0.05, si: 10, gi: -0.12, sonr: 0.9, ancho: 1.05, abre: 3 }),
    estira: E({ mx: 0.7, my: -1, z: 0.3, c: 0.3, sd: 10, si: 12, abre: 10, ancho: 0.6, sonr: -0.1, lengua: 1 }),
    peso: E({ mx: 0.2, my: 0.3, c: 1, z: 1, sd: -6, gd: -0.15, si: -6, gi: -0.15, abre: 20, ancho: 1.05, sonr: -0.4, mof: 0.3 }),
    carga: E({ mx: -0.4, my: -0.2, iris: 0.9, sd: 16, si: 14, abre: 14, ancho: 0.7, sonr: -0.3, lengua: 0.8 }),
    alivio: E({ c: 1, h: 0.6, sd: 6, si: 8, abre: 6, ancho: 0.7, sonr: 0.45 }),
    oye: E({ mx: 0.2, my: -1, sd: 12, si: 20, gi: 0.1, abre: 2, ancho: 0.5, sonr: -0.05 }),
    horror: E({ mx: 0.3, my: -1, iris: 0.62, sd: 30, si: 30, abre: 30, ancho: 0.7, sonr: -0.5 }),
    golpe: E({ c: 1, z: 1, sd: -4, si: -4, abre: 14, ancho: 0.8, sonr: -0.4 }),
    mareo: E({ mx: 0, my: 0, sd: 10, si: 14, abre: 6, ancho: 0.6, sonr: 0.15, esp: 1 }),
    miraM: E({ mx: -0.9, my: 0.15, sd: 12, si: 14, abre: 2, ancho: 0.6, sonr: 0.1 }),
    camara: E({ mx: -0.45, my: 0.05, sd: 16, si: 6, gi: -0.08, sonr: 0.65, ancho: 0.95, abre: 2 })
  };
  const GUION_CG = [
    [0.7, 0.9, "aburre"], [T.suspiro, T.suspiro + 0.2, "suspira"], [T.suspiro + 0.55, T.suspiro + 0.8, "aburre"],
    [1.85, 2.0, "mira1"], [2.25, 2.4, "mira2"], [T.miraArriba, T.miraArriba + 0.2, "arriba"], [T.idea, T.idea + 0.15, "idea"],
    [T.alcanza0, T.alcanza0 + 0.15, "estira"], [T.cae, T.cae + 0.05, "peso"], [T.aplasta1, T.aplasta1 + 0.2, "carga"],
    [T.topeton, T.topeton + 0.05, "golpe"], [T.alivio0, T.alivio0 + 0.2, "alivio"], [T.oye, T.oye + 0.2, "oye"],
    [T.horror, T.horror + 0.08, "horror"], [T.agacha0 + 0.18, T.agacha0 + 0.24, "golpe"], [T.agacha0 + 0.3, T.agacha0 + 0.36, "horror"],
    [T.agacha0 + 0.42, T.agacha0 + 0.48, "golpe"],
    [T.pop1, T.pop1 + 0.1, "mareo"], [T.miraM - 0.1, T.miraM + 0.15, "miraM"], [T.camaraG, T.camaraG + 0.25, "camara"]
  ];
  const PARP_G = [0.5, 1.5, 2.15, 3.55, 6.2, 7.8, 12.98, 14.3];
  const P0G = { torso: 0.02, cab: 0.03, cdy: 0, pel: 0 };
  const CuG = o => Object.assign({}, P0G, o);
  const CUER_G = {
    quieto: CuG({}), suspira: CuG({ torso: 0.07, cab: 0.08, pel: 8 }), mira: CuG({ cab: -0.02 }),
    arriba: CuG({ torso: -0.04, cab: -0.22 }), idea: CuG({ torso: -0.02, cab: -0.05 }),
    estira: CuG({ torso: -0.1, cab: -0.25, pel: -30 }),
    peso: CuG({ torso: 0.1, cab: 0.15, pel: 90 }), carga: CuG({ torso: -0.1, cab: -0.04, pel: 40 }),
    golpe: CuG({ torso: 0.08, cab: 0.1, pel: 40 }), alivio: CuG({ torso: -0.04, cab: -0.06, pel: 30 }),
    oye: CuG({ torso: -0.06, cab: -0.25, pel: 30 }), horror: CuG({ torso: -0.1, cab: -0.3, pel: 40 })
  };
  const GUION_G = [
    [T.suspiro, T.suspiro + 0.25, "suspira"], [T.suspiro + 0.5, T.suspiro + 0.85, "quieto"], [1.85, 2.1, "mira"],
    [T.miraArriba, T.miraArriba + 0.25, "arriba"], [T.idea, T.idea + 0.2, "idea"], [T.alcanza0, T.alcanza1, "estira"],
    [T.cae, T.cae + 0.07, "peso", salida], [T.aplasta1, T.aplasta1 + 0.25, "carga"],
    [T.topeton, T.topeton + 0.06, "golpe"], [T.topeton + 0.12, T.alivio0, "carga"], [T.alivio0, T.alivio0 + 0.25, "alivio"],
    [T.oye, T.oye + 0.25, "oye"], [T.horror, T.horror + 0.1, "horror"]
  ];
  const TOB_G = G.SUELO - G.TOBILLO_ALTO;
  // tambaleo con el tomo: x de la pelvis (pantalla) y pasos
  const TAMB = [[T.tambaleo0, 600], [5.45, 642], [6.05, 568], [6.6, 628], [7.12, XG]];
  function xTamb(t) {
    if (t <= TAMB[0][0]) return TAMB[0][1];
    for (let i = 1; i < TAMB.length; i++) { const [t1, x1] = TAMB[i], [t0, x0] = TAMB[i - 1]; if (t <= t1) return lerp(x0, x1, suave(fase(t, t0, t1))); }
    return TAMB[TAMB.length - 1][1];
  }
  function xG(t) {
    if (t < T.paso0) return 590;
    if (t < T.tambaleo0) return lerp(590, 600, tramo(t, T.paso0, T.paso1));
    return xTamb(t);
  }
  // pasos: [t0, t1, pie, x final (pantalla)]
  const PASOS = [
    [T.paso0, T.paso1, "lejos", 640], [T.paso0 + 0.12, T.paso1 + 0.1, "cerca", 576],
    [5.05, 5.3, "lejos", 682], [5.25, 5.5, "cerca", 618],
    [5.6, 5.85, "cerca", 540], [5.8, 6.05, "lejos", 604],
    [6.2, 6.45, "lejos", 668], [6.38, 6.6, "cerca", 600],
    [6.75, 6.98, "cerca", 560], [6.92, 7.12, "lejos", 628]
  ];
  function piesG(t) {
    const pies = { cerca: { x: 560, y: 0 }, lejos: { x: 622, y: 0 } };
    for (const [t0, t1, pie, x1] of PASOS) {
      if (t <= t0) break;
      const k = fase(t, t0, t1), x0 = pies[pie].x;
      pies[pie] = { x: lerp(x0, x1, suave(k)), y: 16 * Math.sin(Math.PI * k) };
    }
    return pies;
  }
  // el tomo cuando lo lleva en brazos (marco del tronco): centro y ángulo
  const TOMO_TR = { x: 335, y: 520 };
  const PEL_SENT = G.PELVIS.y + (SUELO - 25 - (SUELO - (G.SUELO - G.PELVIS.y) * S)) / S;    // sentado en el suelo
  const PEL_RODILLAS = G.PELVIS.y + (SUELO - 82 - (SUELO - (G.SUELO - G.PELVIS.y) * S)) / S;   // de rodillas
  function poseG(t) {
    const b = linea(GUION_G, CUER_G, "quieto", t);
    const respira = Math.sin(t * 2.1 + 0.4);
    const p = {
      x: xG(t), suelo: SUELO, s: S, tirasLimpias: true, hombrosContinuos: true, hombrosRecortados: true,
      pelvis: { x: G.PELVIS.x, y: G.PELVIS.y + b.pel + respira * 1.2 },
      torso: b.torso, torsoEsc: { x: 1, y: 1 + respira * 0.004 },
      piernas: {}, cabeza: { ang: b.cab, dx: 0, dy: b.cdy, esc: { x: 1, y: 1 } }
    };
    const aHojaX = sx => G.PELVIS.x + (sx - p.x) / S;
    // suspiro: se le caen los hombros
    p.pelvis.y += 10 * campana(t, T.suspiro + 0.2, T.suspiro + 0.9);
    // tambaleo: el peso le lleva de un lado a otro
    const tamb = tramo(t, T.aplasta1, T.tambaleo0 + 0.12) * (1 - tramo(t, T.tambaleo1 - 0.06, T.tambaleo1 + 0.1));
    const vel = (xTamb(t + 0.02) - xTamb(t - 0.02)) / 0.04;
    if (t > T.aplasta1 && t < T.agacha0) {
      p.torso += -0.0016 * vel * tamb + 0.05 * Math.sin(t * 5.3) * tamb;
      p.cabeza.ang += 0.04 * Math.sin(t * 4.1 + 1) * tamb;
      p.pelvis.y += 12 * Math.abs(Math.sin(t * 5.3)) * tamb;
    }
    // el topetazo contra la estantería: rebote hacia delante
    if (t > T.topeton) { const u = t - T.topeton; p.torso += 0.14 * Math.sin(u * 16) * Math.exp(-u * 7); }
    // piernas
    const enPie = t < T.agacha0;
    if (enPie) {
      const pies = piesG(t);
      // puntillas al alcanzar el tomo
      const punt = tramo(t, T.alcanza0, T.alcanza1) * (1 - tramo(t, T.tira1, T.cae));
      // golpecitos con el pie
      const golpe = t > T.golpes0 && t < T.golpes1 ? Math.max(0, Math.sin((t - T.golpes0) * 15)) * campana(t, T.golpes0, T.golpes1) : 0;
      // de puntillas: la punta sigue en el suelo (sube el tobillo lo que baja la punta al girar)
      const aP = 0.55 * punt, subeP = G.PUNTA.x * Math.sin(aP) + G.PUNTA.y * Math.cos(aP) - G.PUNTA.y;
      const aG = -0.45 * golpe, subeG = -G.TALON.x * Math.sin(-aG) + G.TALON.y * Math.cos(aG) - G.TALON.y;
      p.piernas.cerca = { tob: { x: aHojaX(pies.cerca.x), y: TOB_G - pies.cerca.y / S - subeP - subeG }, ang: aP + aG };
      p.piernas.lejos = { tob: { x: aHojaX(pies.lejos.x), y: TOB_G - pies.lejos.y / S - subeP }, ang: aP };
      p.pelvis.y -= subeP;
    } else {
      // se hunde: sentado en el suelo, encogido (tortuga) y, al final, de rodillas
      const baja = tramo(t, T.agacha0, T.tortuga, salida);
      const sube = tramo(t, T.pop0, T.pop1, salida);
      p.pelvis.y = lerp(lerp(p.pelvis.y, PEL_SENT, baja), PEL_RODILLAS, sube);
      p.x = XG;
      const tor = { torso: 0.02, cab: 0.26, cdy: 215 };
      p.torso = lerp(lerp(p.torso, tor.torso, baja), 0.0, sube);
      p.cabeza.ang = lerp(lerp(p.cabeza.ang, tor.cab, baja), 0.04, sube);
      p.cabeza.dy = lerp(lerp(p.cabeza.dy, tor.cdy, baja), 0, sube);
      // pies: de pie → sentado con las piernas estiradas → se meten (de rodillas)
      const piesApoyados = piesG(T.agacha0);
      const pieC0 = { x: aHojaX(piesApoyados.cerca.x), y: TOB_G }, pieL0 = { x: aHojaX(piesApoyados.lejos.x), y: TOB_G };
      const pieC1 = { x: 705, y: TOB_G + 2 }, pieL1 = { x: 735, y: TOB_G + 2 };
      const pieC2 = { x: 60, y: TOB_G }, pieL2 = { x: 100, y: TOB_G };
      const mete = tramo(t, T.mete0, T.mete1);
      const mz = (a, b2, c2) => ({ x: lerp(lerp(a.x, b2.x, baja), c2.x, mete), y: lerp(lerp(a.y, b2.y, baja), c2.y, mete) });
      p.piernas.cerca = { tob: mz(pieC0, pieC1, pieC2), ang: lerp(lerp(0, -0.55, baja), -0.15, mete) };
      p.piernas.lejos = { tob: mz(pieL0, pieL1, pieL2), ang: lerp(lerp(0, -0.55, baja), -0.15, mete) };
      // empuja desde dentro para sacar la mano (la cabeza se queda escondida)
      const empu = tramo(t, T.mano0 - 0.1, T.mano0 + 0.15) * (1 - tramo(t, T.mano1 - 0.15, T.mano1 + 0.1));
      p.pelvis.y -= 34 / S * empu; p.cabeza.dy += 40 / S * empu; p.torsoEsc.y += 0.06 * empu;
      // las zapatillas se agitan de vez en cuando
      const pat = campana(t, 10.1, 10.9);
      p.piernas.cerca.ang += 0.3 * Math.sin(t * 17) * pat; p.piernas.lejos.ang += 0.3 * Math.sin(t * 17 + 1.5) * pat;
      // pop: rebote de la cabeza
      if (t > T.pop1) { const u = t - T.pop1; p.cabeza.dy += -26 * Math.sin(u * 14) * Math.exp(-u * 6); }
      const mar = campana(t, T.pop1, T.miraM + 0.2);
      p.cabeza.ang += 0.08 * Math.sin(t * 6.5) * mar; p.cabeza.dx = 10 * Math.cos(t * 6.5) * mar;
    }
    // capones
    for (const l of CAPON) { if (t > l.capon) { const u = t - l.capon; p.cabeza.dy += 22 * Math.sin(u * 20) * Math.exp(-u * 9); p.cabeza.ang += 0.06 * Math.sin(u * 20) * Math.exp(-u * 9); } }
    // cara
    const e = linea(GUION_CG, CG, "aburre", t);
    p.cara = cara(e, parpadeo(t, PARP_G));
    p.rojo = 0.75 * tramo(t, T.cae, T.cae + 0.4) * (1 - tramo(t, T.alivio0, T.alivio1)) + 0.4 * campana(t, T.pop0, T.miraM);
    p.sudor = 0.8 * tramo(t, T.aplasta1, T.aplasta1 + 0.5) * (1 - tramo(t, T.alivio1, T.alivio1 + 0.4)) + 0.6 * campana(t, T.horror, T.tortuga);
    if (t < T.cae) p.cara.mofletes = Math.max(p.cara.mofletes, 0.8 * campana(t, T.suspiro - 0.25, T.suspiro + 0.15));
    // manos
    const res = resolutor(G, p, "cerca"), resL = resolutor(G, p, "lejos");
    const tm = tomoG(p, t);
    const CARGA = D5(0.8, 0.25, 0.25, 0.25, 0.25);
    const bordeT = sg => bordeTomo(tm, sg);
    const COLG_C = { tr: { x: 115, y: 700 }, mu: -1.65, dedos: D(0.4, 0.5, 0.5, 0.5), dobla: -1 };
    const COLG_L = { tr: { x: 392, y: 700 }, mu: -1.6, dedos: D(0.4, 0.5, 0.5, 0.5), dobla: 1 };
    const ALCANZA = { scr: () => ({ x: TOMO.x + 22, y: 198 }), mu: -1.2, dedos: D(1, 1, 1, 1), dobla: 1 };
    const LOMO = { scr: () => { const q = tomoG(p, t); return { x: q.x - 6, y: q.y + 26 }; }, mu: -1.3, dedos: D5(0.4, 0.15, 0.15, 0.15, 0.15), dobla: 1 };
    const TOMO_L = { scr: () => agarre(bordeT(1), -0.5, 2), mu: -0.5, dedos: CARGA, dobla: 1 };
    const TOMO_C = { scr: () => agarre(bordeT(-1), -2.6, 2), mu: -2.6, dedos: CARGA, dobla: -1 };
    const CABEZA_C = { scr: () => { const H = G.cabeza(p); return G.aPantalla(p, H.a({ x: 700, y: 300 })); }, mu: 0.5, dedos: D(0.6, 0.8, 0.8, 0.8), dobla: -1 };
    const CABEZA_L = { scr: () => { const H = G.cabeza(p); return G.aPantalla(p, H.a({ x: 900, y: 360 })); }, mu: 2.2, dedos: D(0.6, 0.8, 0.8, 0.8), dobla: 1 };
    const SALE = { scr: () => ({ x: 634, y: 306 + 3 * Math.sin(t * 9) }), mu: -1.57, dedos: D(1, 1, 1, 1), dobla: 1 };
    const DENTRO_L = { tr: { x: 425, y: 640 }, mu: -1.4, dedos: D(0.4, 0.4, 0.4, 0.4), dobla: 1 };
    const DENTRO_C = { tr: { x: 150, y: 640 }, mu: -1.6, dedos: D(0.4, 0.4, 0.4, 0.4), dobla: -1 };
    const PISTA_GL = [
      [0, 0, { bols: true }],
      [T.alcanza0 - 0.25, T.alcanza0 - 0.05, { bols: true, sale: true, dedos: D(0.6, 0.6, 0.6, 0.6) }],
      [T.alcanza0 - 0.05, T.alcanza1, ALCANZA, salida],
      [T.alcanza1, T.tira0, LOMO],
      [T.cae - 0.1, T.cae + 0.02, TOMO_L],
      [T.suelta, T.suelta + 0.12, CABEZA_L],
      [T.tortuga + 0.2, T.mano0 - 0.05, DENTRO_L],
      [T.mano0, T.mano0 + 0.25, SALE, salida],
      [T.mano1 - 0.12, T.mano1 + 0.1, DENTRO_L]
    ];
    const PISTA_GC = [
      [0, 0, { bols: true }],
      [T.alcanza1 - 0.05, T.alcanza1 + 0.15, { bols: true, sale: true, dedos: D(0.6, 0.6, 0.6, 0.6) }],
      [T.alcanza1 + 0.15, T.tira1, COLG_C],
      [T.cae - 0.12, T.cae + 0.02, TOMO_C],
      [T.suelta, T.suelta + 0.12, CABEZA_C],
      [T.tortuga + 0.2, T.tortuga + 0.5, DENTRO_C]
    ];
    const L = pista(PISTA_GL, t, resL), C = pista(PISTA_GC, t, res);
    // la mano que asoma: dedos que se agitan sin fuerza y luego se rinde
    const agita = campana(t, T.mano0 + 0.15, T.mano1 - 0.25);
    if (agita > 0) { L.dedos = DD(L.dedos, D5(0.6 + 0.4 * Math.sin(t * 13), 0.5 + 0.5 * Math.sin(t * 13 + 0.5), 0.5 + 0.5 * Math.sin(t * 13 + 1), 0.5 + 0.5 * Math.sin(t * 13 + 1.5), 0.5 + 0.5 * Math.sin(t * 13 + 2)), agita); L.x += 3 * Math.sin(t * 7) * agita / S; }
    const rinde = tramo(t, T.mano1 - 0.3, T.mano1 - 0.05) * (1 - tramo(t, T.mano1, T.mano1 + 0.15));
    if (rinde > 0 && t < T.mano1 + 0.2) { L.ang = (L.ang || 0) + 0.9 * rinde; L.dedos = DD(L.dedos, D(0.3, 0.4, 0.4, 0.4), rinde); }
    p.manoCerca = mano(C); p.manoLejos = mano(L);
    p.tomo = tm;
    return p;
  }
  // el tomo: en el estante → sacándolo → en brazos → al regazo
  function centroCarga(p, t) {
    const c = G.aPantalla(p, G.tronco(p)(TOMO_TR));
    const tem = 1.2 * tramo(t, T.cae, T.cae + 0.08) * (1 - tramo(t, T.suelta - 0.08, T.suelta));
    return { x: c.x + tem * ruido(t * 33), y: c.y + tem * ruido(t * 37 + 3), ang: p.torso * 0.6 };
  }
  function bordeTomo(tm, sg) {
    const beta = tm.beta * Math.PI / 2, ancho = TOMO.w * Math.cos(beta) + TOMO_TAPA * Math.sin(beta);
    const q = rota({ x: sg * tm.esc * ancho / 2, y: 6 * tm.esc }, tm.ang);
    return { x: tm.x + q.x, y: tm.y + q.y };
  }
  function tomoG(p, t) {
    const enEst = { x: TOMO.x + TOMO.w / 2, y: BALDA[0] - TOMO.h / 2, ang: 0, beta: 0, esc: 1, donde: "estante" };
    if (t < T.tira0) return enEst;
    if (t < T.cae) {
      const k = tramo(t, T.tira0, T.tira1), k2 = fase(t, T.tira1, T.cae);
      const sal = { x: enEst.x - 4 * k, y: enEst.y - 2 * k, ang: -0.25 * k };
      if (t < T.tira1) return { x: sal.x, y: sal.y, ang: sal.ang, beta: 0.15 * k, esc: 1 + 0.06 * k, donde: "aire" };
      const b = centroCarga(p, t);
      return { x: lerp(sal.x, b.x, k2), y: lerp(sal.y, b.y, k2 * k2), ang: lerp(sal.ang, b.ang, k2) + 0.4 * Math.sin(Math.PI * k2), beta: lerp(0.15, 1, suave(k2)), esc: 1.06 + 0.04 * k2, donde: "aire" };
    }
    if (t < T.suelta) { const b = centroCarga(p, t); return { x: b.x, y: b.y, ang: b.ang, beta: 1, esc: 1.1, donde: "brazos" }; }
    // al regazo: cae tumbado (de lomo) sobre los muslos
    const b0 = TOMO_SUELTA, regazo = { x: XG + 78, y: SUELO - 40 };
    const k = tramo(t, T.suelta, T.suelta + 0.26, entrada);
    const u = t - (T.suelta + 0.26), reb = u > 0 ? 5 * Math.abs(Math.sin(u * 20)) * Math.exp(-u * 9) : 0;
    return { x: lerp(b0.x, regazo.x, k), y: lerp(b0.y, regazo.y, k) - reb, ang: lerp(b0.ang, -Math.PI / 2 + 0.06, k), beta: lerp(1, 0, k), esc: 1.1, donde: "regazo" };
  }
  let TOMO_SUELTA = { x: XG, y: 300, ang: 0 };

  /* ---------- el «tejadito»: el último libro, abierto, en lo alto de la montaña y luego en la cabeza ---------- */
  const TEJ = { col: TEJADO ? TEJADO.col : ["#d84f3c", "#f3d27a"], w: 40, h: 34 };
  const oscuro = (hex, k) => { const c = [1, 3, 5].map(i => Math.round(parseInt(hex.slice(i, i + 2), 16) * k)); return `rgb(${c.join(",")})`; };
  function dibTejado(g, x, y, ang, abre, esc = 1) {
    g.save(); g.translate(x, y); g.rotate(ang); g.scale(esc, esc); g.lineJoin = "round"; g.lineCap = "round";
    const a = lerp(0.12, 0.62, abre), L = TEJ.w, hh = TEJ.h;
    const izq = { x: -Math.cos(a) * L, y: Math.sin(a) * L }, der = { x: Math.cos(a) * L, y: Math.sin(a) * L };
    // hojas (abanico) por debajo
    g.fillStyle = "#fbf3df"; g.strokeStyle = "rgba(110,90,60,0.7)"; g.lineWidth = 0.9;
    for (let i = 0; i < 5; i++) {
      const f = (i + 0.5) / 5, aa = lerp(-a, a, f) * 0.92, q = { x: Math.sin(aa) * L * 0.95, y: Math.cos(aa) * L * 0.8 + 2 };
      g.beginPath(); g.moveTo(0, 2); g.lineTo(q.x - 6, q.y); g.lineTo(q.x + 6, q.y); g.closePath(); g.fill(); g.stroke();
    }
    // tapas
    for (const [q, sg] of [[izq, -1], [der, 1]]) {
      g.fillStyle = sg < 0 ? oscuro(TEJ.col[0], 0.82) : TEJ.col[0];
      g.beginPath(); g.moveTo(0, -1); g.lineTo(q.x, q.y - 1); g.lineTo(q.x + sg * 2, q.y + hh * 0.18); g.lineTo(0, hh * 0.18); g.closePath(); g.fill();
      g.strokeStyle = TINTA; g.lineWidth = 1.4; g.stroke();
      g.strokeStyle = TEJ.col[1]; g.lineWidth = 1.2; g.beginPath(); g.moveTo(q.x * 0.25, q.y * 0.25 + 3); g.lineTo(q.x * 0.85, q.y * 0.85 + 3); g.stroke();
    }
    g.fillStyle = oscuro(TEJ.col[0], 0.6); g.beginPath(); g.ellipse(0, hh * 0.08, 2.4, hh * 0.1, 0, 0, Math.PI * 2); g.fill();
    g.restore();
  }
  // punto de la cabeza de Guillermo donde se posa (retrato): en lo alto de los pinchos
  const CIMA_G = { x: 772, y: 236 };
  const TEJ_ARRIBA = { x: 616, y: 0 };            // se rellena con la montaña
  function tejado(t, pG) {
    if (!TEJADO) return null;
    if (t < T.tejado0) return null;
    // cae del estante, se abre y aterriza en lo alto de la montaña
    const ini = enEstante(TEJADO, T.tejado0, 0);
    const cima = TEJ_ARRIBA;
    const H = G.cabeza(pG), enCab = G.aPantalla(pG, H.a(CIMA_G));
    if (t < T.tejado0 + 0.12) {
      const u = fase(t, T.tejado0, T.tejado0 + 0.12);
      return { vuelca: true, x: ini.x + 10 * u, y: ini.y + 26 * u * u, ang: ini.a - 1.3 * u * u };
    }
    if (t < T.tejado1) {
      const u = fase(t, T.tejado0 + 0.12, T.tejado1);
      const x = lerp(ini.x, cima.x, suave(u)), y = lerp(ini.y, cima.y, u * u) - 30 * Math.sin(Math.PI * u);
      return { x: x + 10 * (1 - u), y: y + 26 * (1 - u), ang: (1 - u) * (ini.a - 1.3) + 0.25 * Math.sin(u * 14) * (1 - u), abre: suave(u) * (1 - 0.18 * (1 - u) * (1 - Math.cos(2 * Math.PI * u))), despliegue: tramo(u, 0, 0.42), esc: 1 };
    }
    const u = t - T.tejado1, reb = 4 * Math.abs(Math.sin(u * 18)) * Math.exp(-u * 8);
    let x = cima.x, y = cima.y - reb, ang = 0.04 * Math.sin(u * 20) * Math.exp(-u * 6);
    // la cabeza lo empuja hacia arriba y se lo lleva puesto
    if (t > T.pop0 && enCab.y < y + 2) {
      const k = clamp((y + 2 - enCab.y) / 26);
      x = lerp(x, enCab.x, k); y = Math.min(y, enCab.y); ang = lerp(ang, H.ang + 0.05, k);
    }
    return { x, y, ang, abre: 1, esc: 1 };
  }

  /* ================= poses del fotograma ================= */
  const memo = new Map();
  const cache = (k, f) => { if (!memo.has(k)) memo.set(k, f()); return memo.get(k); };
  let ULT = { t: -1, v: null };
  function poses(t) {
    if (ULT.t === t) return ULT.v;
    const v = { m: poseM(t), g: poseG(t) };
    ULT = { t, v };
    return v;
  }
  // cabeza de Guillermo en el instante de cada capón; el tomo al soltarlo; lo alto de la montaña
  (function preparaFijos() {
    CABEZA_CAPON = {};
  })();
  function prepara() {
    if (memo.has("ok")) return;
    memo.set("ok", true);
    for (const l of CAPON) { const pg = poseG(l.capon); const H = G.cabeza(pg); CABEZA_CAPON[l.id] = G.aPantalla(pg, H.a(CIMA_G)); }
    TOMO_SUELTA = centroCarga(poseG(T.suelta), T.suelta);
    // lo alto de la montaña donde se posa el tejadito
    let top = SUELO; for (const l of CAEN) if (Math.abs(l.pila.x - TEJ_ARRIBA.x) < 30) top = Math.min(top, l.pila.y - Math.abs(Math.cos(l.pila.a)) * l.h / 2 - Math.abs(Math.sin(l.pila.a)) * l.w / 2);
    TEJ_ARRIBA.y = top - 4;
    // los de arriba, donde sale la cabeza, salen despedidos al hacer ¡pop!
    for (const l of CAEN) {
      if (Math.abs(l.pila.x - 622) < 62 && l.pila.y < 372) {
        const sg = l.pila.x < 622 ? -1 : 1;
        l.empuja = { x: sg * (34 + 24 * hash(l.id)), y: 30 + 20 * hash(l.id * 2), a: sg * (0.4 + 0.4 * hash(l.id * 3)) };
      }
    }
    ULT = { t: -1, v: null };
  }

  /* ================= decorado ================= */
  let fondo = null, fondoLleno = null, fondoFinal = null;
  function conLibros(lista, tq) {
    const c = document.createElement("canvas"); c.width = W + 80; c.height = H + 120; const g = c.getContext("2d");
    g.drawImage(fondo, 0, 0); g.translate(40, 60);
    for (const l of lista) { const q = enEstante(l, tq, 0); g.save(); g.translate(q.x, q.y); g.rotate(q.a); lomo(g, l, 0.12); g.restore(); }
    return c;
  }
  const YZ = 330;                                   // altura del zócalo (arriba)
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W + 80; c.height = H + 120; const g = c.getContext("2d");
    g.translate(40, 60); g.lineJoin = "round"; g.lineCap = "round";
    // pared color miel con papel de hojitas
    const pa = g.createLinearGradient(0, -60, 0, YZ); pa.addColorStop(0, "#b8803c"); pa.addColorStop(1, "#d29d55");
    g.fillStyle = pa; g.fillRect(-40, -60, W + 80, YZ + 60);
    g.save(); g.globalAlpha = 0.13; g.fillStyle = "#6b3f14";
    for (let y = -40; y < YZ; y += 34) for (let x = -40 + ((y / 34) & 1) * 22; x < W + 40; x += 44) {
      g.save(); g.translate(x, y); g.rotate(0.6); g.beginPath(); g.ellipse(0, 0, 3.2, 8, 0, 0, Math.PI * 2); g.fill();
      g.rotate(-1.2); g.beginPath(); g.ellipse(6, 4, 2.6, 6, 0, 0, Math.PI * 2); g.fill(); g.restore();
    }
    g.restore();
    // zócalo de nogal con cuarterones
    const zo = g.createLinearGradient(0, YZ, 0, SUELO); zo.addColorStop(0, "#5c3519"); zo.addColorStop(1, "#3e2210");
    g.fillStyle = zo; g.fillRect(-40, YZ, W + 80, SUELO - YZ);
    g.fillStyle = "#7a4a24"; g.fillRect(-40, YZ - 6, W + 80, 10); g.fillStyle = "rgba(255,220,170,0.25)"; g.fillRect(-40, YZ - 6, W + 80, 2);
    g.strokeStyle = "rgba(0,0,0,0.35)"; g.lineWidth = 2;
    for (let x = -30; x < W + 40; x += 120) { g.strokeRect(x, YZ + 22, 100, SUELO - YZ - 44); }
    g.strokeStyle = "rgba(255,210,160,0.12)"; g.lineWidth = 1;
    for (let x = -30; x < W + 40; x += 120) { g.strokeRect(x + 3, YZ + 25, 94, SUELO - YZ - 50); }
    // suelo de tarima
    const su = g.createLinearGradient(0, SUELO, 0, H + 60); su.addColorStop(0, "#6b4122"); su.addColorStop(1, "#3c220f");
    g.fillStyle = su; g.fillRect(-40, SUELO, W + 80, H + 60 - SUELO);
    g.strokeStyle = "rgba(0,0,0,0.3)"; g.lineWidth = 1.5;
    for (let i = 0; i < 6; i++) { const y = SUELO + 6 + i * i * 4; g.beginPath(); g.moveTo(-40, y); g.lineTo(W + 40, y); g.stroke(); }
    for (let i = -10; i < 22; i++) { const x = 512 + i * 70; g.beginPath(); g.moveTo(x, SUELO); g.lineTo(512 + (x - 512) * 1.5, H + 60); g.stroke(); }
    g.fillStyle = "#2a160a"; g.fillRect(-40, SUELO - 3, W + 80, 4);
    // luz cálida de la lámpara
    const lz = g.createRadialGradient(70, 190, 10, 120, 260, 470); lz.addColorStop(0, "rgba(255,226,160,0.55)"); lz.addColorStop(1, "rgba(255,226,160,0)");
    g.fillStyle = lz; g.fillRect(-40, -60, W + 80, H + 120);
    alfombra(g);
    cuadro(g, 880, 120);
    estanteria(g);
    for (const l of FIJOS) { g.save(); g.translate(l.x + l.w / 2, l.piso - l.h / 2); lomo(g, l, 0.12); g.restore(); }
    adornos(g);
    planta(g, 905, SUELO);
    mesita(g, 292, SUELO);
    lamparaPie(g, 62, SUELO);
    // viñeta
    const vi = g.createRadialGradient(512, 300, 330, 512, 300, 760); vi.addColorStop(0, "rgba(0,0,0,0)"); vi.addColorStop(1, "rgba(20,8,0,0.5)");
    g.fillStyle = vi; g.fillRect(-40, -60, W + 80, H + 120);
    return c;
  }
  function alfombra(g) {
    g.save();
    const y0 = SUELO + 6, y1 = H + 30;
    const ruta = () => { g.beginPath(); g.moveTo(40, y0); g.lineTo(880, y0); g.lineTo(960, y1); g.lineTo(-40, y1); g.closePath(); };
    ruta(); g.fillStyle = "#7d1f22"; g.fill();
    g.save(); ruta(); g.clip();
    g.strokeStyle = "#e0b45a"; g.lineWidth = 3; g.beginPath(); g.moveTo(60, y0 + 7); g.lineTo(860, y0 + 7); g.lineTo(930, y1); g.moveTo(40, y1); g.lineTo(60, y0 + 7); g.stroke();
    g.fillStyle = "#1f3557";
    for (let i = 0; i < 9; i++) { const x = 110 + i * 92; g.beginPath(); g.moveTo(x, y0 + 16); g.lineTo(x + 22, y0 + 30); g.lineTo(x, y0 + 44); g.lineTo(x - 22, y0 + 30); g.closePath(); g.fill(); }
    g.fillStyle = "#e0b45a";
    for (let i = 0; i < 9; i++) { const x = 110 + i * 92; g.beginPath(); g.arc(x, y0 + 30, 4, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = "rgba(0,0,0,0.25)"; g.fillRect(-40, y0, W + 80, 4);
    g.restore();
    g.strokeStyle = "#f1e2c0"; g.lineWidth = 1.2;
    for (let x = 44; x < 880; x += 6) { g.beginPath(); g.moveTo(x, y0); g.lineTo(x - 1, y0 - 4); g.stroke(); }
    g.restore();
  }
  function estanteria(g) {
    g.save();
    // fondo de la estantería
    g.fillStyle = "#2b170b"; g.fillRect(BX0, CORONA, BX1 - BX0, SUELO - CORONA);
    for (let c = 0; c < 4; c++) {
      const y0 = TECHO[c], y1 = BALDA[c];
      const gr = g.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, "#1c0e06"); gr.addColorStop(1, "#3a2110");
      g.fillStyle = gr; g.fillRect(X0I, y0, X1I - X0I, y1 - y0);
    }
    // laterales, baldas, corona y zócalo
    const madera = (x, y, w, h, claro) => {
      const gr = g.createLinearGradient(x, y, x, y + h); gr.addColorStop(0, claro ? "#8a5428" : "#6e401e"); gr.addColorStop(1, "#4a2a12");
      g.fillStyle = gr; g.fillRect(x, y, w, h); g.strokeStyle = TINTA; g.lineWidth = 1.4; g.strokeRect(x, y, w, h);
    };
    for (const b of BALDA) madera(BX0 + 4, b, BX1 - BX0 - 8, TAB, true);
    madera(BX0, CORONA - 4, BX1 - BX0, 16, true);
    g.fillStyle = "#8a5428"; g.fillRect(BX0 - 8, CORONA - 14, BX1 - BX0 + 16, 12); g.strokeStyle = TINTA; g.strokeRect(BX0 - 8, CORONA - 14, BX1 - BX0 + 16, 12);
    madera(BX0, CORONA, LAT, SUELO - CORONA, false); madera(BX1 - LAT, CORONA, LAT, SUELO - CORONA, false);
    madera(BX0, BALDA[3] + TAB, BX1 - BX0, SUELO - BALDA[3] - TAB, false);
    // cajones del zócalo
    g.strokeStyle = "rgba(0,0,0,0.45)"; g.lineWidth = 2;
    for (let i = 0; i < 3; i++) { const x = BX0 + 22 + i * 150; g.strokeRect(x, BALDA[3] + TAB + 8, 132, SUELO - BALDA[3] - TAB - 16);
      g.fillStyle = "#d9a83a"; g.beginPath(); g.arc(x + 66, (BALDA[3] + TAB + SUELO) / 2, 3.5, 0, Math.PI * 2); g.fill(); }
    // sombra en el suelo
    g.fillStyle = "rgba(0,0,0,0.3)"; g.fillRect(BX0 - 6, SUELO, BX1 - BX0 + 12, 6);
    g.restore();
  }
  function adornos(g) {
    // en el estante de abajo: un globo terráqueo pequeño y un sujetalibros
    g.save();
    const gx = 712, gy = BALDA[3];
    g.fillStyle = "#c9a24e"; g.fillRect(gx - 9, gy - 4, 18, 4); g.fillRect(gx - 1.5, gy - 14, 3, 10);
    g.fillStyle = "#3f7fa8"; g.beginPath(); g.arc(gx, gy - 30, 16, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#6fa65a"; g.beginPath(); g.ellipse(gx - 4, gy - 34, 7, 5, 0.4, 0, Math.PI * 2); g.fill(); g.beginPath(); g.ellipse(gx + 7, gy - 24, 5, 3, -0.2, 0, Math.PI * 2); g.fill();
    g.strokeStyle = TINTA; g.lineWidth = 1.3; g.beginPath(); g.arc(gx, gy - 30, 16, 0, Math.PI * 2); g.stroke();
    g.strokeStyle = "#c9a24e"; g.lineWidth = 2; g.beginPath(); g.arc(gx, gy - 30, 19, Math.PI * 0.6, Math.PI * 1.9); g.stroke();
    g.restore();
  }
  function cuadro(g, x, y) {
    g.save(); g.fillStyle = "#c9a24e"; g.fillRect(x - 48, y - 38, 96, 76); g.strokeStyle = TINTA; g.lineWidth = 1.5; g.strokeRect(x - 48, y - 38, 96, 76);
    const ci = g.createLinearGradient(0, y - 30, 0, y + 30); ci.addColorStop(0, "#f2c987"); ci.addColorStop(1, "#d98d58");
    g.fillStyle = ci; g.fillRect(x - 40, y - 30, 80, 60);
    g.fillStyle = "#6d8a4a"; g.beginPath(); g.moveTo(x - 40, y + 30); g.quadraticCurveTo(x - 10, y - 4, x + 40, y + 12); g.lineTo(x + 40, y + 30); g.closePath(); g.fill();
    g.fillStyle = "#fff0c0"; g.beginPath(); g.arc(x + 14, y - 10, 8, 0, Math.PI * 2); g.fill();
    g.restore();
  }
  function planta(g, x, y) {
    g.save();
    g.fillStyle = "#a8552c"; g.beginPath(); g.moveTo(x - 34, y - 70); g.lineTo(x + 34, y - 70); g.lineTo(x + 26, y); g.lineTo(x - 26, y); g.closePath(); g.fill();
    g.strokeStyle = TINTA; g.lineWidth = 1.5; g.stroke(); g.fillStyle = "#c46a3a"; g.fillRect(x - 37, y - 78, 74, 10); g.strokeRect(x - 37, y - 78, 74, 10);
    for (let i = 0; i < 11; i++) {
      const a = -Math.PI / 2 + (i - 5) * 0.26 + 0.08 * hash(i), L = 90 + 50 * hash(i * 3.3);
      const tip = { x: x + Math.cos(a) * L, y: y - 78 + Math.sin(a) * L };
      g.fillStyle = i % 2 ? "#2f6b34" : "#3f8a44";
      g.beginPath(); g.moveTo(x, y - 78);
      g.quadraticCurveTo(x + Math.cos(a - 0.3) * L * 0.6, y - 78 + Math.sin(a - 0.3) * L * 0.6, tip.x, tip.y);
      g.quadraticCurveTo(x + Math.cos(a + 0.3) * L * 0.6, y - 78 + Math.sin(a + 0.3) * L * 0.6, x, y - 78); g.fill();
      g.strokeStyle = "rgba(10,30,10,0.6)"; g.lineWidth = 1; g.stroke();
    }
    g.restore();
  }
  function mesita(g, x, y) {
    g.save();
    g.fillStyle = "#5a3214"; g.fillRect(x - 3, y - 92, 6, 92); g.fillRect(x - 20, y - 6, 40, 6);
    g.fillStyle = "#7a4a24"; g.beginPath(); g.ellipse(x, y - 94, 30, 7, 0, 0, Math.PI * 2); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 1.4; g.stroke();
    // taza
    g.fillStyle = "#f2ece0"; g.beginPath(); g.moveTo(x - 9, y - 112); g.lineTo(x + 9, y - 112); g.quadraticCurveTo(x + 9, y - 96, x, y - 96); g.quadraticCurveTo(x - 9, y - 96, x - 9, y - 112); g.fill(); g.stroke();
    g.beginPath(); g.arc(x + 11, y - 106, 4, -1.2, 1.2); g.stroke();
    g.fillStyle = "#6b3a1a"; g.beginPath(); g.ellipse(x, y - 112, 8.5, 2.2, 0, 0, Math.PI * 2); g.fill();
    g.restore();
  }
  function lamparaPie(g, x, y) {
    g.save();
    g.fillStyle = "#3a2a1a"; g.beginPath(); g.ellipse(x, y - 3, 24, 5, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#c9a24e"; g.fillRect(x - 2, y - 290, 4, 288);
    // pantalla de tela
    const gr = g.createLinearGradient(0, y - 345, 0, y - 285); gr.addColorStop(0, "#f7d9a0"); gr.addColorStop(1, "#f0b968");
    g.fillStyle = gr; g.beginPath(); g.moveTo(x - 30, y - 345); g.lineTo(x + 30, y - 345); g.lineTo(x + 46, y - 285); g.lineTo(x - 46, y - 285); g.closePath(); g.fill();
    g.strokeStyle = TINTA; g.lineWidth = 1.5; g.stroke();
    g.strokeStyle = "#a8552c"; g.lineWidth = 2; g.beginPath(); g.moveTo(x - 44, y - 290); g.lineTo(x + 44, y - 290); g.stroke();
    g.restore();
  }
  // taburete de Marta
  function taburete(g) {
    const x = XM - 4, y = YPM + 14;
    g.save(); g.lineJoin = "round";
    g.strokeStyle = "#4a2a12"; g.lineWidth = 6; g.lineCap = "round";
    g.beginPath(); g.moveTo(x - 24, y + 6); g.lineTo(x - 34, SUELO - 2); g.moveTo(x + 24, y + 6); g.lineTo(x + 34, SUELO - 2); g.moveTo(x, y + 8); g.lineTo(x, SUELO - 6); g.stroke();
    g.lineWidth = 4; g.beginPath(); g.moveTo(x - 30, SUELO - 40); g.lineTo(x + 30, SUELO - 40); g.stroke();
    g.fillStyle = "#6e401e"; g.beginPath(); g.ellipse(x, y + 4, 34, 8, 0, 0, Math.PI * 2); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 1.5; g.stroke();
    g.fillStyle = "#2f6b34"; g.beginPath(); g.ellipse(x, y, 32, 7, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    g.restore();
  }

  /* ================= efectos ================= */
  // nubecilla de polvo: una mancha suave guardada (polvo y aliento), dibujada tres veces
  const SPR = {};
  function sprite(col) {
    if (SPR[col]) return SPR[col];
    const c = document.createElement("canvas"); c.width = c.height = 64; const g = c.getContext("2d");
    const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, `rgba(${col},1)`); gr.addColorStop(0.6, `rgba(${col},0.7)`); gr.addColorStop(1, `rgba(${col},0)`);
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
    return (SPR[col] = c);
  }
  function nube(g, x, y, r, a, col = "226,204,164") {
    if (a <= 0.01 || r <= 0.5) return;
    const sp = sprite(col), a0 = g.globalAlpha;
    g.globalAlpha = a0 * Math.min(1, a);
    for (const [dx, dy, k] of [[0, 0, 1], [0.7, 0.2, 0.72], [-0.7, 0.25, 0.66]]) {
      const rr = r * k * 1.25; g.drawImage(sp, x + r * dx - rr, y + r * dy - rr, rr * 2, rr * 2);
    }
    g.globalAlpha = a0;
  }
  function polvo(g, t) {
    const k0 = 9.15;
    if (t < k0 || t > 11.6) return;
    for (let i = 0; i < 16; i++) {
      const t0 = k0 + 0.06 * i, u = fase(t, t0, t0 + 1.5); if (u <= 0 || u >= 1) continue;
      const lado = i % 2 ? -1 : 1, d = 50 + 110 * hash(i * 1.9);
      const x = 620 + lado * (30 + d * salida(u)), y = 500 - 120 * hash(i * 3.7) - 40 * salida(u);
      nube(g, x, y, 16 + 30 * salida(u), 0.8 * Math.sin(Math.PI * Math.pow(u, 0.6)) * (1 - u * 0.3), "236,220,190");
    }
  }
  function polvoAntes(g, t) {      // polvo que sale del estante al temblar
    const u = fase(t, T.topeton, T.topeton + 0.9); if (u <= 0 || u >= 1) return;
    for (let i = 0; i < 7; i++) { const x = BX0 + 40 + i * 65, y = BALDA[i % 3] - 4 + 14 * u; nube(g, x, y, 4 + 8 * u, 0.4 * Math.sin(Math.PI * u)); }
  }
  function estrella(g, x, y, r, a, col = "#fff2a8") {
    g.save(); g.translate(x, y); g.rotate(a); g.fillStyle = col; g.strokeStyle = TINTA; g.lineWidth = 1.4;
    g.beginPath(); for (let i = 0; i < 10; i++) { const aa = i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; i ? g.lineTo(Math.cos(aa) * rr, Math.sin(aa) * rr) : g.moveTo(rr, 0); } g.closePath(); g.fill(); g.stroke();
    g.restore();
  }
  function choque(g, x, y, t, t0) {
    const u = fase(t, t0, t0 + 0.3); if (u <= 0 || u >= 1) return;
    g.save(); g.globalAlpha = Math.sin(Math.PI * u); g.translate(x, y); g.scale(0.6 + 0.6 * u, 0.6 + 0.6 * u);
    g.fillStyle = "#fff6c8"; g.strokeStyle = TINTA; g.lineWidth = 2;
    g.beginPath(); for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8, r = i % 2 ? 9 : 22; i ? g.lineTo(Math.cos(a) * r, Math.sin(a) * r) : g.moveTo(r, 0); } g.closePath(); g.fill(); g.stroke();
    g.restore();
  }
  // ¡tac, tac!: rayitas en cada ficha del dominó
  function tacs(g, t) {
    for (const l of LIBROS) {
      if (l.c !== 0 || l.tInc === undefined || l === TEJADO) continue;
      const u = fase(t, l.tInc + 0.14, l.tInc + 0.34); if (u <= 0 || u >= 1) continue;
      const px = l.piv === "d" ? l.x + l.w + 2 : l.x - 2, py = l.piso - l.h * 0.75;
      g.save(); g.globalAlpha = Math.sin(Math.PI * u); g.strokeStyle = "#fff1c4"; g.lineWidth = 2; g.lineCap = "round";
      for (let i = -1; i <= 1; i++) { const a = -Math.PI / 2 + i * 0.6; g.beginPath(); g.moveTo(px + Math.cos(a) * 8, py + Math.sin(a) * 8); g.lineTo(px + Math.cos(a) * (14 + 6 * u), py + Math.sin(a) * (14 + 6 * u)); g.stroke(); }
      g.restore();
    }
  }
  // vapor de la taza de la mesita
  function vapor(g, t) {
    g.save(); g.lineCap = "round"; g.lineWidth = 2;
    for (let i = 0; i < 2; i++) {
      const f = (t * 0.5 + i * 0.5) % 1, x0 = 292 - 3 + i * 6, y0 = SUELO - 116;
      g.strokeStyle = `rgba(255,248,235,${0.45 * Math.sin(Math.PI * f)})`;
      g.beginPath();
      for (let k = 0; k <= 8; k++) { const u = k / 8, y = y0 - 26 * f - 18 * u, x = x0 + 3.5 * Math.sin(u * 5 + t * 3 + i * 2); k ? g.lineTo(x, y) : g.moveTo(x, y); }
      g.stroke();
    }
    g.restore();
  }
  function suspiroFx(g, t, pG) {
    const u = fase(t, T.suspiro + 0.15, T.suspiro + 0.95); if (u <= 0 || u >= 1) return;
    const b = G.aPantalla(pG, G.boca(pG));
    nube(g, b.x + 10 + 30 * u, b.y + 4 + 8 * u, 4 + 8 * u, 0.5 * Math.sin(Math.PI * u), "245,240,230");
  }
  function estrellitas(g, t, pG, t0, t1) {
    const k = campana(t, t0, t1); if (k <= 0.01) return;
    const H = G.cabeza(pG), c = G.aPantalla(pG, H.a({ x: 760, y: 260 }));
    for (let i = 0; i < 4; i++) { const a = t * 5 + i * Math.PI / 2; estrella(g, c.x + Math.cos(a) * 34, c.y - 6 + Math.sin(a) * 9, 5.5, t * 3 + i, "#fff2a8"); }
  }

  /* ---------- la montaña: los libros ya caídos (sombra detrás y libros encima) ---------- */
  const MONTE = CAEN.filter(l => l.monte);
  const LLEGA0 = Math.min(...MONTE.map(l => l.tLlega)), LLEGA1 = Math.max(...MONTE.map(l => l.tLlega));
  // cuánto ha subido la montaña en x (0..1) y el cráter por donde sale la cabeza
  function nivel(t) { return 0.94 * tramo(t, LLEGA0 - 0.05, LLEGA1 + 0.05, x => x); }
  function topeMasa(x, t) {
    let y = SUELO - (SUELO - perfilMonte(x)) * nivel(t);
    const cr = tramo(t, T.pop0, T.pop0 + 0.25);
    if (cr > 0) y = Math.max(y, lerp(y, 352, cr * clamp(1 - Math.abs(x - 618) / 70) ));
    return y;
  }
  let relleno = null;
  function creaRelleno() {
    const c = document.createElement("canvas"); c.width = MX1 - MX0 + 20; c.height = 270; const g = c.getContext("2d");
    g.fillStyle = "#2e1a0d"; g.fillRect(0, 0, c.width, c.height);
    g.translate(10 - MX0, 270 - SUELO);
    for (let i = 0; i < 95; i++) {
      const l = { w: 10 + 10 * hash(i * 3.1), h: 50 + 50 * hash(i * 1.7), col: COLS[Math.floor(hash(i * 7.3) * COLS.length)], banda: i % 3 };
      const x = MX0 + (MX1 - MX0) * hash(i * 9.7 + 1), y = SUELO - 262 * hash(i * 4.4 + 2);
      g.save(); g.translate(x, y); g.rotate((hash(i * 2.2) < 0.5 ? 1 : -1) * Math.PI / 2 + (hash(i * 6.1) - 0.5) * 1.3); lomo(g, l, 0.32); g.restore();
    }
    return c;
  }
  // la montaña quieta se guarda en un lienzo (antes y después del ¡pop!)
  const LLEGA_TODOS = Math.max(...CAEN.map(l => l.tLlega));
  const PILA_X = 300, PILA_Y = 150, PILA_W = 540, PILA_H = SUELO + 12 - 150;
  let pilaQuieta = null, pilaFinal = null;
  function creaPila(t) {
    const c = document.createElement("canvas"); c.width = PILA_W; c.height = PILA_H; const g = c.getContext("2d");
    g.translate(-PILA_X, -PILA_Y); dibPilaDirecta(g, t); return c;
  }
  function dibPila(g, t) {
    if (t > LLEGA_TODOS + 0.5 && t <= T.pop0) { if (!pilaQuieta) pilaQuieta = creaPila(T.pop0); g.drawImage(pilaQuieta, PILA_X, PILA_Y); return; }
    if (t > T.pop0 + 0.45) { if (!pilaFinal) pilaFinal = creaPila(T.pop0 + 0.5); g.drawImage(pilaFinal, PILA_X, PILA_Y); return; }
    dibPilaDirecta(g, t);
  }
  function dibPilaDirecta(g, t) {
    const caidos = CAEN.filter(l => t >= l.tLlega);
    if (!caidos.length) return;
    // masa oscura de la montaña (lo que queda entre los libros)
    if (t > LLEGA0) {
      if (!relleno) relleno = creaRelleno();
      g.save(); g.beginPath(); g.moveTo(MX0, SUELO + 2);
      for (let x = MX0; x <= MX1; x += 4) g.lineTo(x, topeMasa(x, t) + 8);
      g.lineTo(MX1, SUELO + 2); g.closePath(); g.clip(); g.drawImage(relleno, MX0 - 10, SUELO - 270); g.restore();
    }
    for (const l of caidos) {
      let q = enPila(l, t);
      if (l.empuja && t > T.pop0) { const k = tramo(t, T.pop0, T.pop0 + 0.4, salida); q = { x: q.x + l.empuja.x * k, y: q.y + l.empuja.y * k - 18 * Math.sin(Math.PI * k), a: q.a + l.empuja.a * k }; }
      g.save(); g.translate(q.x, q.y); g.rotate(q.a); lomo(g, l, 0.08 * clamp((SUELO - q.y) / 200)); g.restore();
    }
  }

  /* ---------- cámara ---------- */
  const PLANOS = [
    [0, 1.0, 512, 300], [3.4, 1.0, 512, 300], [4.1, 1.1, 560, 284], [6.9, 1.1, 560, 284], [7.6, 1.0, 512, 300],
    [11.7, 1.0, 512, 300], [12.6, 1.07, 430, 300], [DUR, 1.08, 428, 300]
  ];
  function camara(t) {
    let i = 0; while (i < PLANOS.length - 2 && t > PLANOS[i + 1][0]) i++;
    const a = PLANOS[i], b = PLANOS[i + 1], k = suave(fase(t, a[0], b[0]));
    const kk = lerp(a[1], b[1], k), x = lerp(a[2], b[2], k), y = lerp(a[3], b[3], k);
    const mx = W / 2 / kk, my = H / 2 / kk;
    const tem = 0.6 * campana(t, T.topeton, T.topeton + 0.35) + campana(t, 9.2, 10.2) * 0.8;
    const sx = tem * 3 * ruido(t * 34), sy = tem * 2.5 * ruido(t * 29 + 4);
    return { k: kk, x: clamp(x, mx - 30, W + 30 - mx) + sx, y: clamp(y, my - 50, H + 50 - my) + sy };
  }

  const pose = t => { prepara(); const v = poses(t); return { g: v.g, m: v.m }; };
  class GuillermoMartaLibro extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !M.listo()) return;
      if (!fondo) fondo = creaFondo();
      prepara();
      const v = poses(t), pG = v.g, pM = v.m;
      const luz = tramo(t, NEGRO_INICIO, 0.8, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t);
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      MATRIZ = g.getTransform();
      // la estantería tiembla con el topetazo
      const temblor = campana(t, T.topeton, T.topeton + 0.7) + 0.7 * campana(t, 8.9, 9.9);
      // libros en los estantes (de pie, inclinados o tambaleándose); quietos al principio y al final, guardados
      if (!fondoLleno) { fondoLleno = conLibros(LIBROS, 0); fondoFinal = conLibros(LIBROS.filter(l => !l.cae && l !== TEJADO), 13); }
      if (t < T.topeton) g.drawImage(fondoLleno, -40, -60);
      else if (t > 10.6) {
        g.drawImage(fondoFinal, -40, -60);
        if (TEJADO && t < T.tejado0) { const q = enEstante(TEJADO, t, 0); g.save(); g.translate(q.x, q.y); g.rotate(q.a); lomo(g, TEJADO, 0.12); g.restore(); }
      } else {
        g.drawImage(fondo, -40, -60);
        for (const l of LIBROS) {
          if (l.cae && t >= l.tCae) continue;
          if (l === TEJADO && t >= T.tejado0) continue;
          const q = enEstante(l, t, temblor);
          g.save(); g.translate(q.x, q.y); g.rotate(q.a); lomo(g, l, 0.12); g.restore();
        }
      }
      // el tomo en su estante
      const tm = pG.tomo;
      if (tm.donde === "estante") {
        const tq = tm, br = campana(t, T.brillo, T.brillo + 0.5);
        dibTomo(g, tq.x + 1.2 * temblor * ruido(t * 30), tq.y, tq.ang, tq.beta, tq.esc);
        destello(g, tq.x + 8, tq.y - 36, 24, br); destello(g, tq.x - 10, tq.y + 22, 13, campana(t, T.brillo + 0.15, T.brillo + 0.55));
      }
      polvoAntes(g, t);
      vapor(g, t);
      // Marta en su taburete
      taburete(g);
      const lb = pM.libro;
      pM.manoLejos.objeto = gg => { gg.save(); gg.setTransform(MATRIZ); dibLibroM(gg, lb); gg.restore(); };
      M.dibujar(g, pM, t);
      // Guillermo (el tomo va con su mano lejana mientras lo lleva)
      if (tm.donde === "aire" || tm.donde === "brazos") {
        if (pG.manoLejos) pG.manoLejos.objeto = gg => { gg.save(); gg.setTransform(MATRIZ); dibTomo(gg, tm.x, tm.y, tm.ang, tm.beta, tm.esc); gg.restore(); };
      }
      // sombra
      g.save(); g.fillStyle = "rgba(10,5,0,0.28)"; const sx = G.aPantalla(pG, pG.pelvis).x;
      g.beginPath(); g.ellipse(sx + 10, SUELO + 3, 64, 7, 0, 0, Math.PI * 2); g.fill(); g.restore();
      // ya sentado en el suelo, nada suyo asoma por debajo de la tarima
      if (t > T.agacha0 + 0.25) { g.save(); g.beginPath(); g.rect(-200, -200, W + 400, SUELO + 202); g.clip(); G.dibujar(g, pG, t); g.restore(); }
      else G.dibujar(g, pG, t);
      suspiroFx(g, t, pG);
      if (tm.donde === "regazo") dibTomo(g, tm.x, tm.y, tm.ang, tm.beta, tm.esc);
      // la montaña y los libros que vuelan
      polvo(g, t);
      dibPila(g, t);
      for (const l of CAEN) {
        if (t < l.tCae || t >= l.tLlega) continue;
        const ini = enEstante(l, l.tCae, 0), q = enVuelo(l, t, ini);
        g.save(); g.translate(q.x, q.y); g.rotate(q.a); g.scale(q.esc, q.esc); lomo(g, l, 0); g.restore();
      }
      if (TEJADO && t >= T.tejado0) {
        const q = tejado(t, pG), abre = q.vuelca ? 0 : (q.despliegue ?? 1);
        g.save(); g.translate(q.x, q.y); g.rotate(q.ang);
        if (abre < 1) { g.save(); g.globalAlpha *= 1 - abre; lomo(g, TEJADO, 0); g.restore(); }
        if (abre > 0) { g.globalAlpha *= abre; g.scale(lerp(0.35, 1, abre), 1); dibTejado(g, 0, 0, 0, q.abre, q.esc); }
        g.restore();
      }
      tacs(g, t);
      choque(g, G.aPantalla(pG, G.tronco(pG)({ x: 120, y: 420 })).x - 12, 300, t, T.topeton);
      for (const l of CAPON) if (CABEZA_CAPON[l.id]) choque(g, CABEZA_CAPON[l.id].x, CABEZA_CAPON[l.id].y, t, l.capon);
      estrellitas(g, t, pG, T.pop1 - 0.05, T.miraM + 0.1);
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00093.2", nombre: "Guillermo y Marta · El libro", crear: () => new GuillermoMartaLibro() });
  function diag(t) {
    const v = poses(t), o = {};
    const dist = (Rg, p, lado) => { const m = lado === "cerca" ? p.manoCerca : p.manoLejos, h = Rg.tronco(p)(lado === "cerca" ? Rg.HOMBRO_C || { x: 88, y: 345 } : Rg.HOMBRO);
      const mu = m.mu ?? -1.75, w = rota({ x: Math.cos(mu) * R_M, y: Math.sin(mu) * R_M }, m.ang || 0);
      return Math.round(Math.hypot(m.x + w.x - h.x, m.y + w.y - h.y)); };
    o.gC = dist(G, v.g, "cerca"); o.gL = dist(G, v.g, "lejos"); o.mC = dist(M, v.m, "cerca"); o.mL = dist(M, v.m, "lejos");
    return o;
  }
  window.__A2D_00093_2 = { pose, poses, T, DUR, diag, LIBROS, CAEN, CAPON, CIMA_G, enEstante, enVuelo, enPila, esquinaBaja, bordeTomo, tejado };
})();
