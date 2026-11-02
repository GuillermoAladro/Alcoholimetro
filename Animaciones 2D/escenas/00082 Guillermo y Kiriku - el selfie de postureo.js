"use strict";
/* 00082 · Guillermo y Kiriku · El postureo
 *
 * Negro → terraza de un local de brunch a media mañana: un muro de flores (rosas, peonías y hojas)
 * con unas alas de neón detrás de donde posa Kiriku, un aro de luz de influencer, un banco blanco con
 * cojines, suelo de terrazo, una pérgola con guirnalda de bombillas y, a la derecha, el pretil con
 * lavanda, la ciudad al fondo, una costilla de Adán y una mesa alta de mármol con un cóctel rosa en
 * copa de balón y un dónut. (Sin textos.)
 * Kiriku posa para el móvil en un palo de selfie: barbilla arriba, morritos, se coloca el jersey…
 * Guillermo, detrás, le hace «photobombing»: 1) lengua fuera y bizco; 2) mofletes de pez globo que
 * se pincha con el dedo; 3) gafas de nariz y bigote. Cada vez que Kiriku se da la vuelta, Guillermo
 * se queda quieto mirando al cielo y silbando (la tercera le pilla con las gafas puestas y se las
 * quita muy despacio). Foto final: Guillermo se agacha detrás de Kiriku y salta como un muelle por
 * encima de su cabeza; con la mano le da al palo y el móvil sale volando dando vueltas… y cae dentro
 * del cóctel (¡plof!). Kiriku, impasible, suelta el palo, pesca el móvil con dos dedos, chorreando;
 * Guillermo se va de puntillas. Kiriku mira a cámara muy serio… y, por si acaso, vuelve a poner
 * morritos al móvil mojado, que suelta un flash raquítico y unas chispas → negro.
 *
 * El palo y el móvil se dibujan dentro del puño de Kiriku (objeto de la mano), así se aplastan con
 * él cuando se da la vuelta (giro aplastado, nunca una vuelta completa). Las caras de broma (lengua,
 * bizco, moflete cercano, gafas de broma, morritos) son capas del retrato (capaCabeza).
 * Todo depende del tiempo absoluto `t`.
 */
(() => {
  const { clamp, lerp, fase, suave, salida, entrada, tramo, campana, ruido, hash } = M2;
  const G = Guillermo, KI = Kiriku;
  const DUR = 14.4;
  const SK = 0.3, SUELO_K = 560, SG = 0.28, SUELO_G = 546;
  const kK = SK * KI.K;                       // px de pantalla por unidad de hoja (Kiriku)
  const XK0 = 610, XK1 = 652, XG0 = 452;
  const T = {
    ajusta0: 0.45, ajusta1: 0.95, click1: 1.15,
    idea0: 1.35, idea1: 1.75,
    // ronda 1: lengua y bizco
    pato0: 1.85, pato1: 2.1, in1a: 1.98, in1b: 2.28, click2: 2.55,
    sosp1: 2.7, baja1a: 2.76, baja1b: 2.98, out1a: 2.82, out1b: 3.02, gira1a: 2.96, gira1b: 3.2,
    vuelve1a: 3.8, vuelve1b: 4.02, sube1a: 3.98, sube1b: 4.2,
    // ronda 2: pez globo
    jersey0: 4.08, jersey1: 4.3, tiron1: 4.36, tiron2: 4.5, in2a: 4.1, in2b: 4.3, click3: 4.58,
    baja2a: 4.66, baja2b: 4.8, out2a: 4.68, out2b: 4.8, gira2a: 4.74, gira2b: 4.9,
    vuelve2a: 5.45, vuelve2b: 5.6, sube2a: 5.55, sube2b: 5.74,
    // ronda 3: gafas de broma
    pose3a: 5.62, pose3b: 5.86, in3a: 5.62, in3b: 5.86, gafas: 5.95, click4: 6.04,
    gira3a: 6.06, gira3b: 6.18, quita0: 6.72, quita1: 6.92, quita2: 7.14, atras0: 7.0, atras1: 7.32,
    vuelve3a: 7.36, vuelve3b: 7.62,
    // la foto final
    final0: 7.62, final1: 7.98, sigilo0: 7.66, sigilo1: 8.04, despega: 8.17, cima: 8.42, click5: 8.42, golpe: 8.45,
    aterriza: 8.84, plof: 9.18,
    horror: 9.22, giraG0: 9.5, giraG1: 9.66, puntillas0: 9.66, puntillas1: 12.0,
    bajaPalo0: 9.48, bajaPalo1: 9.85, suelta: 9.92, paloSuelo: 10.24, paso0: 10.0, paso1: 10.45,
    pesca0: 10.52, pesca1: 10.8, saca1: 11.55, camara: 12.15,
    sube0: 12.52, sube1: 12.84, patoF: 12.86, chispa: 13.12, fin: 13.72
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
  const TINTA = "#14101a";
  let MATRIZ = null;
  const memo = new Map();
  const cache = (k, f) => { if (!memo.has(k)) memo.set(k, f()); return memo.get(k); };
  // giro aplastado: +1 mira a la derecha, −1 a la izquierda; cada tramo [a, b] da media vuelta
  function giro(t, lista) {
    let s = 1;
    for (const [a, b, f] of lista) { if (t >= b) s = -s; else if (t > a) return s * Math.cos(Math.PI * (f || suave)(fase(t, a, b))); }
    return s;
  }

  // Pistas de una mano: [t0, t1, objetivo, curva]; el objetivo se resuelve en la hoja en cada fotograma.
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
  const offMano = (Rg, m, q) => { const r = rota(q, m.mu + Math.PI / 2); return rota({ x: r.x * Rg.JK, y: r.y * Rg.JK }, m.ang || 0); };
  const PINZA = { x: 6.2, y: 15.5 }, PALMA = { x: 0, y: 1 }, PUNO = { x: 0, y: 0 }, YEMA = { x: 8.4, y: 18.6 };
  const R_M = G.MUNECA_R * G.JK;
  const punoDesde = (m, mu) => ({ x: m.x - Math.cos(mu) * R_M, y: m.y - Math.sin(mu) * R_M });
  const BOLS_G = { c: punoDesde({ x: 131, y: 652 }, -1.75), l: punoDesde({ x: 372, y: 648 }, -1.75) };
  function resolutor(Rg, p, lado) {
    const Tr = Rg.tronco(p);
    return o => {
      if (o.bols) {
        const B = Rg.manoReposo ? Rg.manoReposo(p, lado) : Tr(lado === "cerca" ? BOLS_G.c : BOLS_G.l);
        return { x: B.x, y: B.y, mu: -1.75, ang: 0, puno: o.sale ? 1 : 0, dedos: o.dedos || D(0.4, 0.4, 0.4, 0.4), dobla: lado === "cerca" ? -1 : 1 };
      }
      const m = { mu: o.mu, ang: o.ang || 0 };
      let q;
      if (o.hoja) q = Tr(o.hoja);
      else {
        const sc = typeof o.scr === "function" ? o.scr() : o.scr, h = Rg.aHoja(p, sc), f = offMano(Rg, m, o.ref || PINZA);
        q = { x: h.x - f.x, y: h.y - f.y };
      }
      return { x: q.x, y: q.y, mu: o.mu, ang: m.ang, puno: o.puno ?? 1, dedos: o.dedos, dobla: o.dobla ?? (lado === "cerca" ? -1 : 1) };
    };
  }
  const mano = m => ({ x: m.x, y: m.y, ang: m.ang, mu: m.mu, dobla: m.dobla, puno: m.puno, dedos: m.dedos });
  // retrato ↔ pantalla
  const PIV = { G: { x: 700, y: 800 }, K: { x: 780, y: 700 } };
  const deRetrato = (Rg, p, q) => Rg.aPantalla(p, Rg.cabeza(p).a(q));
  function aRetrato(Rg, piv, p, q) {
    const h = Rg.aHoja(p, q), H = Rg.cabeza(p), dx = h.x - H.cx, dy = h.y - H.cy, c = Math.cos(H.ang), s = Math.sin(H.ang);
    return { x: (dx * c + dy * s) / H.kx + piv.x, y: (-dx * s + dy * c) / H.ky + piv.y };
  }
  // pies: pasos alternos entre dos posiciones de la pelvis (px de pantalla)
  function pasos(t, t0, t1, x0, x1, n, w, alto, lider) {
    const out = { c: x0 - w, l: x0 + w, yc: 0, yl: 0 };
    if (t <= t0) return out;
    const movs = n + 1, d = (t1 - t0) / movs;
    let pie = lider;                                   // "c" o "l"
    for (let j = 0; j < movs; j++) {
      const a = t0 + j * d, b = a + d, dest = (j < n ? lerp(x0, x1, (j + 1) / n) : x1) + (pie === "c" ? -w : w);
      if (t >= b) out[pie] = dest;
      else if (t > a) { const k = fase(t, a, b); out[pie] = lerp(out[pie], dest, suave(k)); out["y" + pie] = alto * Math.sin(Math.PI * k); break; }
      pie = pie === "c" ? "l" : "c";
    }
    return out;
  }

  /* ---------- caras ---------- */
  const BASE = { mx: 0.85, my: 0, c: 0, cd: 0, ci: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, abre: 0, ancho: 1, sonr: 0.15, lengua: 0, mof: 0, rub: 0 };
  const E = o => Object.assign({}, BASE, o);
  function cara(e, parp) {
    return { mirada: { x: e.mx, y: e.my }, iris: e.iris,
      ojos: { d: clamp(Math.max(e.c, e.cd, parp)), i: clamp(Math.max(e.c, e.ci, parp)), feliz: e.h, apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: 0, abre: Math.max(0, e.abre), ancho: e.ancho, sonrisa: e.sonr, dientes: true, lengua: e.lengua },
      mofletes: e.mof, rubor: e.rub };
  }

  /* =====================================================================================
   * DECORADO
   * ===================================================================================== */
  const GX = 786, TY = 338;                  // copa (centro) y tablero de la mesa alta
  const MURO = { x0: -60, x1: 742, y0: 40, y1: 452 };
  const ALAS = { x: 612, y: 238 };
  let fondo = null;
  function rnd(i) { return hash(i * 1.618 + 0.37); }
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W + 120; c.height = H + 140; const g = c.getContext("2d");
    g.translate(60, 70); g.lineJoin = "round"; g.lineCap = "round";
    // cielo
    const cie = g.createLinearGradient(0, -70, 0, 420);
    cie.addColorStop(0, "#8fcdef"); cie.addColorStop(0.55, "#cdebf4"); cie.addColorStop(1, "#fff0de");
    g.fillStyle = cie; g.fillRect(-60, -70, W + 120, 520);
    const sol = g.createRadialGradient(960, 40, 8, 960, 40, 260);
    sol.addColorStop(0, "rgba(255,252,230,0.95)"); sol.addColorStop(0.3, "rgba(255,244,205,0.45)"); sol.addColorStop(1, "rgba(255,240,200,0)");
    g.fillStyle = sol; g.fillRect(700, -70, 420, 400);
    ciudad(g);
    pretil(g);
    suelo(g);
    muroFlores(g);
    alasNeon(g);
    banco(g);
    aroLuz(g);
    pergola(g);
    monstera(g, 984, 548);
    mesa(g);
    return c;
  }
  function ciudad(g) {
    // tejados y fachadas pastel al fondo, entre el muro y el borde derecho
    const capas = [[312, ["#e3c9c2", "#d9c3d8", "#efd9c4", "#cfd3e6"], 0.75, 3], [340, ["#e8b49c", "#f2d2b6", "#d8c0cf", "#f5e2c8"], 1, 7]];
    for (const [base, cols, k, sem] of capas) {
      let x = 700;
      let i = sem * 40;
      while (x < W + 70) {
        const w = 34 + 40 * rnd(i), h = (48 + 70 * rnd(i + 1)) * k, col = cols[Math.floor(rnd(i + 2) * cols.length)];
        g.fillStyle = col; g.fillRect(x, base - h, w, h + 80);
        // tejado
        if (rnd(i + 3) < 0.55) { g.fillStyle = k < 1 ? "#d6a49a" : "#d28a6c"; g.beginPath(); g.moveTo(x - 3, base - h); g.lineTo(x + w / 2, base - h - 14 * k); g.lineTo(x + w + 3, base - h); g.closePath(); g.fill(); }
        // ventanas
        g.fillStyle = k < 1 ? "rgba(150,150,185,0.45)" : "rgba(130,120,160,0.5)";
        for (let yy = base - h + 10; yy < base - 4; yy += 14 * k) for (let xx = x + 6; xx < x + w - 6; xx += 10) if (rnd(xx * 3 + yy) < 0.75) g.fillRect(xx, yy, 4, 6 * k);
        x += w + 2; i += 5;
      }
    }
    // cúpula
    g.fillStyle = "#e9cdb8"; g.fillRect(880, 236, 46, 70);
    g.fillStyle = "#b7c6d6"; g.beginPath(); g.ellipse(903, 238, 26, 30, 0, Math.PI, 0); g.fill();
    g.fillStyle = "#e9cdb8"; g.fillRect(899, 196, 8, 14); g.beginPath(); g.arc(903, 194, 4, 0, Math.PI * 2); g.fill();
    // árboles redondos
    for (let j = 0; j < 7; j++) { const x = 760 + j * 46 + 10 * rnd(j), y = 352 + 6 * rnd(j + 9);
      g.fillStyle = j % 2 ? "#8fb27e" : "#7ea86f"; g.beginPath(); g.arc(x, y, 16 + 6 * rnd(j + 4), 0, Math.PI * 2); g.fill(); }
    // bruma
    g.fillStyle = "rgba(255,246,236,0.35)"; g.fillRect(700, 200, W + 60 - 700, 200);
  }
  function pretil(g) {
    const x0 = 730, y0 = 376;
    g.fillStyle = "#f7f1ea"; g.fillRect(x0, y0, W + 70 - x0, 80);
    g.fillStyle = "#e3d8cc"; g.fillRect(x0, y0 + 14, W + 70 - x0, 4);
    g.fillStyle = "#fffaf4"; g.fillRect(x0 - 4, y0 - 8, W + 74 - x0, 10);
    g.strokeStyle = "rgba(60,40,40,0.55)"; g.lineWidth = 2; g.beginPath(); g.moveTo(x0 - 4, y0 + 2); g.lineTo(W + 70, y0 + 2); g.stroke();
    // jardinera con lavanda
    g.fillStyle = "#c98e6a"; g.fillRect(860, y0 - 30, 160, 22); g.fillStyle = "#b07656"; g.fillRect(860, y0 - 12, 160, 4);
    for (let i = 0; i < 26; i++) { const x = 866 + i * 6 + 3 * rnd(i), h = 22 + 16 * rnd(i + 3);
      g.strokeStyle = "#7d9a6a"; g.lineWidth = 1.6; g.beginPath(); g.moveTo(x, y0 - 30); g.quadraticCurveTo(x + 2, y0 - 30 - h * 0.6, x + 1 + 4 * (rnd(i + 7) - 0.5), y0 - 30 - h); g.stroke();
      g.fillStyle = i % 3 ? "#9d86c9" : "#b39ddb"; for (let k = 0; k < 4; k++) { g.beginPath(); g.ellipse(x + 1 + 4 * (rnd(i + 7) - 0.5), y0 - 30 - h + k * 4, 2.2, 3, 0, 0, Math.PI * 2); g.fill(); } }
  }
  function suelo(g) {
    const y0 = 446;
    const gr = g.createLinearGradient(0, y0, 0, H + 70); gr.addColorStop(0, "#efe2d6"); gr.addColorStop(1, "#f7ece2");
    g.fillStyle = gr; g.fillRect(-60, y0, W + 120, H + 70 - y0);
    // juntas de las baldosas (perspectiva suave)
    g.strokeStyle = "rgba(170,140,120,0.35)"; g.lineWidth = 1.2;
    for (const y of [470, 503, 548, 610]) { g.beginPath(); g.moveTo(-60, y); g.lineTo(W + 60, y); g.stroke(); }
    for (let i = -8; i < 14; i++) { const xa = 512 + i * 84, xb = 512 + i * 150; g.beginPath(); g.moveTo(xa, y0); g.lineTo(xb, H + 70); g.stroke(); }
    // chinas del terrazo
    const cols = ["#e79aa6", "#9fc4a8", "#b9b0c9", "#e7b48c", "#8f8a98", "#f3c9cf"];
    for (let i = 0; i < 520; i++) {
      const y = y0 + 4 + Math.pow(rnd(i), 1.4) * (H + 60 - y0), x = -60 + rnd(i + 500) * (W + 120), s = 0.6 + (y - y0) / 120;
      g.fillStyle = cols[Math.floor(rnd(i + 900) * cols.length)]; g.globalAlpha = 0.8;
      g.beginPath(); for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2 + rnd(i + k), r = s * (1 + 1.4 * rnd(i * 7 + k)); g.lineTo(x + Math.cos(a) * r * 1.4, y + Math.sin(a) * r * 0.7); } g.closePath(); g.fill();
    }
    g.globalAlpha = 1;
    // sombra al pie del muro y del pretil
    const sb = g.createLinearGradient(0, y0, 0, y0 + 26); sb.addColorStop(0, "rgba(90,60,60,0.28)"); sb.addColorStop(1, "rgba(90,60,60,0)");
    g.fillStyle = sb; g.fillRect(-60, y0, W + 120, 26);
  }
  // una flor (vista de frente): pétalos alrededor y centro
  function flor(g, x, y, r, col, osc, centro, petalos, giro) {
    g.fillStyle = osc;
    g.beginPath(); g.arc(x + r * 0.12, y + r * 0.15, r * 1.02, 0, Math.PI * 2); g.fill();
    g.fillStyle = col;
    for (let k = 0; k < petalos; k++) { const a = giro + k * Math.PI * 2 / petalos; g.beginPath(); g.ellipse(x + Math.cos(a) * r * 0.5, y + Math.sin(a) * r * 0.5, r * 0.55, r * 0.42, a, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = osc; g.beginPath(); g.arc(x, y, r * 0.42, 0, Math.PI * 2); g.fill();
    g.fillStyle = centro; g.beginPath(); g.arc(x - r * 0.05, y - r * 0.05, r * 0.28, 0, Math.PI * 2); g.fill();
  }
  function rosa(g, x, y, r, col, osc, luz) {
    g.fillStyle = osc; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
    g.fillStyle = col; g.beginPath(); g.arc(x - r * 0.08, y - r * 0.1, r * 0.86, 0, Math.PI * 2); g.fill();
    g.strokeStyle = osc; g.lineWidth = Math.max(1, r * 0.13);
    for (let k = 0; k < 3; k++) { g.beginPath(); g.arc(x - r * 0.05, y - r * 0.05, r * (0.62 - k * 0.18), 0.4 + k * 1.3, 0.4 + k * 1.3 + 3.6); g.stroke(); }
    g.fillStyle = luz; g.beginPath(); g.ellipse(x - r * 0.35, y - r * 0.4, r * 0.25, r * 0.16, -0.6, 0, Math.PI * 2); g.fill();
  }
  function muroFlores(g) {
    const { x0, x1, y0, y1 } = MURO;
    g.save();
    // marco blanco de madera
    g.fillStyle = "#fbf7f2"; g.fillRect(x0, y0 - 14, x1 - x0 + 14, y1 - y0 + 22);
    g.strokeStyle = "rgba(80,60,60,0.5)"; g.lineWidth = 2; g.strokeRect(x0, y0 - 14, x1 - x0 + 14, y1 - y0 + 22);
    g.beginPath(); g.rect(x0, y0, x1 - x0, y1 - y0); g.clip();
    g.fillStyle = "#3e6b45"; g.fillRect(x0, y0, x1 - x0, y1 - y0);
    // hojas
    for (let i = 0; i < 1500; i++) {
      const x = x0 + rnd(i * 3) * (x1 - x0), y = y0 + rnd(i * 3 + 1) * (y1 - y0), a = rnd(i * 3 + 2) * Math.PI * 2, l = 7 + 6 * rnd(i + 77);
      g.fillStyle = ["#4f8a52", "#5f9a5c", "#6aa865", "#467a4a"][i % 4];
      g.beginPath(); g.ellipse(x, y, l, l * 0.45, a, 0, Math.PI * 2); g.fill();
    }
    // flores
    const pal = [["#f7b8c6", "#e48aa2", "#fde3a8"], ["#fff3f1", "#e9cfd2", "#f6d37a"], ["#f493b0", "#d9668a", "#ffd27a"], ["#ffd1b3", "#eba887", "#f6c85f"], ["#f9c9d6", "#e7a3b6", "#fff1c9"]];
    for (let i = 0; i < 620; i++) {
      const x = x0 + rnd(i * 5 + 11) * (x1 - x0), y = y0 + rnd(i * 5 + 12) * (y1 - y0), r = 7 + 9 * rnd(i * 5 + 13), [col, osc, cen] = pal[Math.floor(rnd(i * 5 + 14) * pal.length)];
      if (rnd(i * 5 + 15) < 0.45) rosa(g, x, y, r, col, osc, "rgba(255,255,255,0.55)");
      else flor(g, x, y, r, col, osc, cen, 5 + Math.floor(rnd(i + 3) * 3), rnd(i) * 3);
    }
    // velo: que quede detrás
    g.fillStyle = "rgba(255,246,244,0.24)"; g.fillRect(x0, y0, x1 - x0, y1 - y0);
    const vi = g.createLinearGradient(0, y1 - 60, 0, y1); vi.addColorStop(0, "rgba(40,50,40,0)"); vi.addColorStop(1, "rgba(40,50,40,0.25)");
    g.fillStyle = vi; g.fillRect(x0, y1 - 60, x1 - x0, 60);
    g.restore();
    // listón de abajo
    g.fillStyle = "#fbf7f2"; g.fillRect(x0, y1, x1 - x0 + 14, 10); g.strokeStyle = "rgba(80,60,60,0.45)"; g.lineWidth = 1.5; g.strokeRect(x0, y1, x1 - x0 + 14, 10);
  }
  // alas de neón (blanco rosado) detrás de donde posa Kiriku
  function rutaAla(g, sx) {
    const { x, y } = ALAS;
    g.save(); g.translate(x, y); g.scale(sx, 1);
    g.beginPath();
    g.moveTo(14, -44);
    g.bezierCurveTo(48, -96, 104, -118, 124, -96);
    g.bezierCurveTo(132, -70, 118, -40, 100, -30);
    g.quadraticCurveTo(116, -16, 108, 4); g.quadraticCurveTo(96, 14, 84, 10);
    g.quadraticCurveTo(96, 28, 84, 44); g.quadraticCurveTo(70, 52, 58, 44);
    g.quadraticCurveTo(64, 64, 50, 74); g.quadraticCurveTo(36, 78, 28, 66);
    g.bezierCurveTo(20, 40, 12, 0, 14, -44);
    g.moveTo(34, -36); g.bezierCurveTo(60, -62, 86, -70, 104, -72);
    g.moveTo(40, -6); g.quadraticCurveTo(64, -18, 90, -16);
    g.moveTo(40, 26); g.quadraticCurveTo(56, 22, 70, 26);
    g.restore();
  }
  function alasNeon(g) {
    g.save(); g.lineCap = "round"; g.lineJoin = "round";
    const hal = g.createRadialGradient(ALAS.x, ALAS.y - 10, 20, ALAS.x, ALAS.y - 10, 190);
    hal.addColorStop(0, "rgba(28,52,36,0.55)"); hal.addColorStop(0.7, "rgba(28,52,36,0.35)"); hal.addColorStop(1, "rgba(28,52,36,0)");
    g.fillStyle = hal; g.beginPath(); g.ellipse(ALAS.x, ALAS.y - 10, 190, 165, 0, 0, Math.PI * 2); g.fill();
    for (const sx of [-1, 1]) {
      rutaAla(g, sx); g.strokeStyle = "rgba(255,120,190,0.22)"; g.lineWidth = 18; g.stroke();
      rutaAla(g, sx); g.strokeStyle = "rgba(255,150,210,0.45)"; g.lineWidth = 8; g.stroke();
      rutaAla(g, sx); g.strokeStyle = "#fff3fb"; g.lineWidth = 3; g.stroke();
    }
    // corazoncito de neón entre las alas
    g.translate(ALAS.x, ALAS.y - 58);
    const cor = () => { g.beginPath(); g.moveTo(0, 8); g.bezierCurveTo(-14, -2, -10, -14, 0, -7); g.bezierCurveTo(10, -14, 14, -2, 0, 8); };
    cor(); g.strokeStyle = "rgba(255,90,150,0.3)"; g.lineWidth = 12; g.stroke();
    cor(); g.strokeStyle = "#ffd3e6"; g.lineWidth = 2.6; g.stroke();
    g.restore();
  }
  function banco(g) {
    const x0 = 30, x1 = 286, ys = 486;
    g.save();
    g.fillStyle = "rgba(90,60,60,0.22)"; g.beginPath(); g.ellipse((x0 + x1) / 2, 520, (x1 - x0) / 2 + 10, 7, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#fbf7f2"; g.strokeStyle = "rgba(70,50,50,0.7)"; g.lineWidth = 2;
    for (const x of [x0 + 10, x1 - 18]) { g.fillRect(x, ys, 8, 32); g.strokeRect(x, ys, 8, 32); }
    g.fillRect(x0, ys - 6, x1 - x0, 10); g.strokeRect(x0, ys - 6, x1 - x0, 10);
    // cojines
    const coj = [[x0 + 20, "#f6b6c4"], [x0 + 104, "#c8e2cf"], [x0 + 178, "#f8d9a8"]];
    for (const [x, col] of coj) { g.fillStyle = col; g.beginPath(); g.moveTo(x, ys - 6); g.quadraticCurveTo(x - 6, ys - 40, x + 6, ys - 44); g.quadraticCurveTo(x + 34, ys - 50, x + 60, ys - 42); g.quadraticCurveTo(x + 70, ys - 26, x + 64, ys - 6); g.closePath(); g.fill(); g.stroke();
      g.fillStyle = "rgba(255,255,255,0.4)"; g.beginPath(); g.ellipse(x + 22, ys - 34, 12, 5, -0.2, 0, Math.PI * 2); g.fill(); }
    g.restore();
  }
  function aroLuz(g) {
    const x = 330, yr = 214, pieY = 532;
    g.save(); g.lineCap = "round";
    g.strokeStyle = "#4a4650"; g.lineWidth = 3.5;
    g.beginPath(); g.moveTo(x, yr + 40); g.lineTo(x, pieY - 70); g.stroke();
    g.lineWidth = 3; for (const dx of [-30, 0, 28]) { g.beginPath(); g.moveTo(x, pieY - 70); g.lineTo(x + dx, pieY - (dx === 0 ? 8 : 0)); g.stroke(); }
    g.strokeStyle = "#2c2a30"; g.lineWidth = 4; g.beginPath(); g.moveTo(x, pieY - 70); g.lineTo(x, yr + 40); g.stroke();
    // aro
    const luz = g.createRadialGradient(x, yr, 10, x, yr, 70); luz.addColorStop(0, "rgba(255,255,255,0)"); luz.addColorStop(0.55, "rgba(255,255,255,0.0)"); luz.addColorStop(0.62, "rgba(255,250,240,0.55)"); luz.addColorStop(1, "rgba(255,250,240,0)");
    g.fillStyle = luz; g.beginPath(); g.ellipse(x, yr, 70, 74, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "#2c2a30"; g.lineWidth = 12; g.beginPath(); g.ellipse(x, yr, 34, 40, 0, 0, Math.PI * 2); g.stroke();
    g.strokeStyle = "#fffdf6"; g.lineWidth = 7; g.beginPath(); g.ellipse(x, yr, 34, 40, 0, 0, Math.PI * 2); g.stroke();
    g.fillStyle = "#2c2a30"; g.fillRect(x - 5, yr + 36, 10, 10);
    g.restore();
  }
  function pergola(g) {
    // viga de madera arriba y bombillas colgando en guirnaldas
    g.save();
    g.fillStyle = "#c8a27a"; g.fillRect(-60, -18, W + 120, 22); g.fillStyle = "#a9835d"; g.fillRect(-60, 2, W + 120, 5);
    g.strokeStyle = "rgba(60,40,30,0.6)"; g.lineWidth = 2; g.beginPath(); g.moveTo(-60, 7); g.lineTo(W + 60, 7); g.stroke();
    for (let x = -40; x < W + 60; x += 128) { g.fillStyle = "#b8916b"; g.fillRect(x, -18, 14, 25); }
    const ganchos = [-60, 150, 360, 570, 780, 990, W + 60];
    for (let i = 0; i < ganchos.length - 1; i++) {
      const a = ganchos[i], b = ganchos[i + 1], sag = 34;
      g.strokeStyle = "#3a3236"; g.lineWidth = 1.6; g.beginPath(); g.moveTo(a, 8); g.quadraticCurveTo((a + b) / 2, 8 + sag * 2, b, 8); g.stroke();
      for (let k = 1; k < 5; k++) {
        const u = k / 5, x = lerp(a, b, u), y = 8 + sag * 4 * u * (1 - u);
        g.fillStyle = "rgba(255,226,150,0.35)"; g.beginPath(); g.arc(x, y + 9, 9, 0, Math.PI * 2); g.fill();
        g.fillStyle = "#3a3236"; g.fillRect(x - 2.5, y, 5, 4);
        g.fillStyle = "#fff4cf"; g.strokeStyle = "rgba(60,40,30,0.6)"; g.lineWidth = 1; g.beginPath(); g.ellipse(x, y + 9, 4.2, 5.4, 0, 0, Math.PI * 2); g.fill(); g.stroke();
      }
    }
    // poste derecho
    g.fillStyle = "#c8a27a"; g.fillRect(W + 18, -18, 20, 580); g.strokeStyle = "rgba(60,40,30,0.5)"; g.strokeRect(W + 18, -18, 20, 580);
    g.restore();
  }
  function monstera(g, x, y) {
    g.save();
    // hojas
    const hojas = [[-0.9, 150, 0.85], [-0.45, 190, 1], [0.0, 170, 0.95], [0.5, 175, 0.9], [-1.4, 120, 0.75], [0.95, 140, 0.8]];
    for (const [a, L, s] of hojas) {
      const bx = x + Math.sin(a) * L * 0.55, by = y - 92 - Math.cos(a) * L * 0.6;
      g.strokeStyle = "#3f6b3c"; g.lineWidth = 3; g.beginPath(); g.moveTo(x, y - 90); g.quadraticCurveTo(x + Math.sin(a) * L * 0.2, by + 20, bx, by); g.stroke();
      g.save(); g.translate(bx, by); g.rotate(a); g.scale(s, s);
      g.fillStyle = "#3f8a4a"; g.beginPath(); g.moveTo(0, 26); g.bezierCurveTo(-58, 10, -54, -62, 0, -70); g.bezierCurveTo(54, -62, 58, 10, 0, 26); g.fill();
      g.strokeStyle = "#2b5e33"; g.lineWidth = 2; g.stroke();
      g.strokeStyle = "#e8e2d2"; g.lineWidth = 7;
      for (let k = 0; k < 3; k++) { const yy = -48 + k * 22; g.beginPath(); g.moveTo(-50 + k * 4, yy - 6); g.lineTo(-22, yy + 4); g.stroke(); g.beginPath(); g.moveTo(50 - k * 4, yy - 6); g.lineTo(22, yy + 4); g.stroke(); }
      g.strokeStyle = "#5fa564"; g.lineWidth = 2.5; g.beginPath(); g.moveTo(0, 22); g.lineTo(0, -62); g.stroke();
      g.restore();
    }
    // maceta blanca de rayas
    g.fillStyle = "#f6f1ea"; g.strokeStyle = "rgba(60,40,40,0.7)"; g.lineWidth = 2;
    g.beginPath(); g.moveTo(x - 44, y - 96); g.lineTo(x + 44, y - 96); g.lineTo(x + 34, y); g.lineTo(x - 34, y); g.closePath(); g.fill(); g.stroke();
    g.strokeStyle = "rgba(160,140,130,0.5)"; g.lineWidth = 1.4; for (let k = -3; k <= 3; k++) { g.beginPath(); g.moveTo(x + k * 12, y - 94); g.lineTo(x + k * 9.5, y - 2); g.stroke(); }
    g.fillStyle = "rgba(90,60,60,0.22)"; g.beginPath(); g.ellipse(x, y + 2, 48, 6, 0, 0, Math.PI * 2); g.fill();
    g.restore();
  }
  function mesa(g) {
    g.save();
    g.fillStyle = "rgba(90,60,60,0.25)"; g.beginPath(); g.ellipse(GX + 4, 558, 46, 7, 0, 0, Math.PI * 2); g.fill();
    // pie de latón
    g.fillStyle = "#c9a45c"; g.strokeStyle = TINTA; g.lineWidth = 2;
    g.beginPath(); g.ellipse(GX, 553, 30, 6, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    g.fillRect(GX - 4, TY + 6, 8, 548 - TY - 6); g.strokeRect(GX - 4, TY + 6, 8, 548 - TY - 6);
    g.fillStyle = "rgba(255,240,200,0.6)"; g.fillRect(GX - 2.5, TY + 8, 2, 538 - TY);
    // tablero de mármol
    g.fillStyle = "#e9e4e0"; g.beginPath(); g.ellipse(GX, TY + 5, 52, 9, 0, 0, Math.PI); g.lineTo(GX - 52, TY); g.fill(); g.stroke();
    g.fillStyle = "#fbf9f7"; g.beginPath(); g.ellipse(GX, TY, 52, 9, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    g.strokeStyle = "rgba(150,150,160,0.45)"; g.lineWidth = 1; g.beginPath(); g.moveTo(GX - 36, TY - 2); g.quadraticCurveTo(GX - 10, TY + 4, GX + 20, TY - 3); g.stroke();
    // platito con dónut
    g.fillStyle = "#fff"; g.strokeStyle = TINTA; g.lineWidth = 1.5; g.beginPath(); g.ellipse(GX - 28, TY - 2, 16, 4, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    g.fillStyle = "#d99a5e"; g.beginPath(); g.ellipse(GX - 28, TY - 6, 11, 5.5, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    g.fillStyle = "#f59ab6"; g.beginPath(); g.ellipse(GX - 28, TY - 7.5, 9.5, 4, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#c98a52"; g.beginPath(); g.ellipse(GX - 28, TY - 7.5, 3, 1.5, 0, 0, Math.PI * 2); g.fill();
    for (let k = 0; k < 6; k++) { g.fillStyle = ["#fff", "#7fd1e8", "#ffe07a"][k % 3]; g.fillRect(GX - 34 + k * 2.2, TY - 9 + (k % 2) * 2, 1.6, 0.9); }
    g.restore();
  }

  /* ---------- la copa (en vivo: el móvil acaba dentro) ---------- */
  const COPA = { yb: TY - 2, ys: TY - 18, cy: TY - 38, rx: 17, ry: 20, yr: TY - 55, yl: TY - 46 };
  function copaAtras(g, t) {
    const { yb, ys, cy, rx, ry, yr } = COPA;
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    // pie y tallo
    g.fillStyle = "rgba(225,240,250,0.6)"; g.strokeStyle = "rgba(40,50,70,0.8)"; g.lineWidth = 1.4;
    g.beginPath(); g.ellipse(GX, yb, 11, 2.6, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(GX - 1.5, yb - 1); g.lineTo(GX - 1.5, ys); g.lineTo(GX + 1.5, ys); g.lineTo(GX + 1.5, yb - 1); g.fill(); g.stroke();
    // interior del balón (cristal)
    g.fillStyle = "rgba(220,238,250,0.35)"; g.beginPath(); g.ellipse(GX, cy, rx, ry, 0, 0, Math.PI * 2); g.fill();
    // bebida
    const ola = olaCopa(t);
    g.save(); g.beginPath(); g.ellipse(GX, cy, rx - 1.2, ry - 1.2, 0, 0, Math.PI * 2); g.clip();
    const nivel = COPA.yl - ola.sube;
    const gr = g.createLinearGradient(0, nivel, 0, cy + ry); gr.addColorStop(0, "#ff9a7a"); gr.addColorStop(1, "#ff5f7e");
    g.fillStyle = gr; g.beginPath(); g.moveTo(GX - rx - 2, nivel + ola.inc);
    for (let k = 0; k <= 8; k++) { const x = GX - rx + k * rx / 4; g.lineTo(x, nivel + ola.inc * (1 - k / 4) + ola.a * Math.sin(k * 1.3 + t * 18)); }
    g.lineTo(GX + rx + 2, cy + ry + 2); g.lineTo(GX - rx - 2, cy + ry + 2); g.closePath(); g.fill();
    // hielos y rodaja de pomelo
    for (const [dx, dy, a] of [[-7, 4, 0.3], [5, 7, -0.4], [-1, 12, 0.9]]) {
      const by = Math.sin(t * 3 + dx) * 0.8 + ola.a * 0.6 * Math.sin(t * 15 + dx);
      g.save(); g.translate(GX + dx, nivel + dy + by); g.rotate(a); g.fillStyle = "rgba(255,255,255,0.55)"; g.fillRect(-4, -4, 8, 8); g.strokeStyle = "rgba(255,255,255,0.8)"; g.lineWidth = 0.8; g.strokeRect(-4, -4, 8, 8); g.restore();
    }
    g.fillStyle = "#ffb08a"; g.beginPath(); g.arc(GX + 7, nivel + 6, 6, 0, Math.PI * 2); g.fill(); g.strokeStyle = "#ffe7d6"; g.lineWidth = 1; g.stroke();
    g.restore();
    // pajita de rayas (de dentro hacia fuera por el borde)
    g.strokeStyle = TINTA; g.lineWidth = 4.2; g.beginPath(); g.moveTo(GX - 4, cy + 6); g.lineTo(GX - 13, yr - 22); g.stroke();
    g.strokeStyle = "#fff"; g.lineWidth = 2.6; g.beginPath(); g.moveTo(GX - 4, cy + 6); g.lineTo(GX - 13, yr - 22); g.stroke();
    g.strokeStyle = "#ff6f91"; g.lineWidth = 2.6; g.setLineDash([3, 3]); g.beginPath(); g.moveTo(GX - 4, cy + 6); g.lineTo(GX - 13, yr - 22); g.stroke(); g.setLineDash([]);
    g.restore();
  }
  function copaDelante(g, t) {
    const { cy, rx, ry, yr } = COPA;
    g.save(); g.lineJoin = "round";
    // rodaja de fresa clavada en el borde
    g.fillStyle = "#e8344e"; g.beginPath(); g.moveTo(GX + rx - 6, yr - 1); g.quadraticCurveTo(GX + rx + 2, yr - 12, GX + rx + 9, yr - 3); g.quadraticCurveTo(GX + rx + 4, yr + 7, GX + rx - 6, yr - 1); g.fill();
    g.strokeStyle = TINTA; g.lineWidth = 1.2; g.stroke();
    g.fillStyle = "#ffd9de"; for (const [dx, dy] of [[2, -3], [5, -1], [0, 1]]) { g.beginPath(); g.arc(GX + rx + dx - 2, yr + dy - 1, 0.7, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = "#3c8a3a"; g.beginPath(); g.ellipse(GX + rx + 7, yr - 6, 3, 1.5, -0.8, 0, Math.PI * 2); g.fill();
    // contorno del balón y brillos
    g.strokeStyle = "rgba(40,50,70,0.85)"; g.lineWidth = 1.6;
    g.beginPath(); g.ellipse(GX, cy, rx, ry, 0, -Math.PI * 0.62, Math.PI * 1.62); g.stroke();
    g.beginPath(); g.ellipse(GX, yr + 1, rx * 0.78, 3.2, 0, 0, Math.PI * 2); g.stroke();
    g.strokeStyle = "rgba(255,255,255,0.85)"; g.lineWidth = 2.2; g.beginPath(); g.ellipse(GX, cy, rx - 4, ry - 4, 0, Math.PI * 1.05, Math.PI * 1.35); g.stroke();
    g.fillStyle = "rgba(255,255,255,0.7)"; g.beginPath(); g.ellipse(GX + 9, cy + 7, 1.6, 4, -0.3, 0, Math.PI * 2); g.fill();
    g.restore();
  }
  // oleaje de la bebida tras el ¡plof!
  function olaCopa(t) {
    const u = t - T.plof;
    if (u <= 0) return { a: 0.35, inc: 0, sube: 0 };
    const a = 0.35 + 3.2 * Math.exp(-u * 3.5), inc = 4 * Math.sin(u * 11) * Math.exp(-u * 3);
    const dentro = t < T.pesca1 ? 1 : 1 - tramo(t, T.pesca1, T.pesca1 + 0.5);
    return { a, inc, sube: 3 * dentro * salida(clamp(u / 0.15)) };
  }

  /* ---------- el palo de selfie y el móvil ---------- */
  const PALO_L = 108, MOV_W = 15, MOV_H = 28;
  function rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.lineTo(x + w - r, y); g.quadraticCurveTo(x + w, y, x + w, y + r); g.lineTo(x + w, y + h - r);
    g.quadraticCurveTo(x + w, y + h, x + w - r, y + h); g.lineTo(x + r, y + h); g.quadraticCurveTo(x, y + h, x, y + h - r); g.lineTo(x, y + r); g.quadraticCurveTo(x, y, x + r, y); g.closePath(); }
  // móvil centrado en el origen, eje largo en x (la parte de arriba hacia +x); pantalla hacia −y
  function dibMovil(g, fl, moja) {
    g.save(); g.lineJoin = "round";
    const w = MOV_H, h = MOV_W;
    // canto de la pantalla
    rr(g, -w / 2 + 1, -h / 2 - 3, w - 2, 6, 2.5);
    g.fillStyle = fl > 0.02 ? `rgb(${Math.round(lerp(140, 255, fl))},${Math.round(lerp(200, 255, fl))},255)` : "#8ccdf2"; g.fill();
    g.lineWidth = 1.3; g.strokeStyle = TINTA; g.stroke();
    // trasera negra mate con aro dorado
    rr(g, -w / 2, -h / 2, w, h, 3.5);
    const gr = g.createLinearGradient(0, -h / 2, 0, h / 2); gr.addColorStop(0, "#3a3640"); gr.addColorStop(1, "#141218");
    g.fillStyle = gr; g.fill(); g.lineWidth = 1.6; g.strokeStyle = TINTA; g.stroke();
    g.fillStyle = "rgba(255,255,255,0.18)"; rr(g, -w / 2 + 3, h / 2 - 4, w - 8, 2, 1); g.fill();
    // cámara
    g.fillStyle = "#d4af5a"; g.beginPath(); g.arc(w / 2 - 6, -1.5, 3.6, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#101018"; g.beginPath(); g.arc(w / 2 - 6, -1.5, 2.4, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#4f6fa8"; g.beginPath(); g.arc(w / 2 - 6, -1.5, 1.2, 0, Math.PI * 2); g.fill();
    g.fillStyle = fl > 0.02 ? "#ffffff" : "#ffe9a8"; g.beginPath(); g.arc(w / 2 - 6, 4, 1.3, 0, Math.PI * 2); g.fill();
    // mojado: brillos de agua y gotitas
    if (moja > 0.01) {
      g.globalAlpha = moja; g.fillStyle = "rgba(255,150,170,0.55)"; rr(g, -w / 2 + 1, -h / 2 + 1, w * 0.45, h - 2, 3); g.fill();
      g.fillStyle = "rgba(255,255,255,0.85)";
      for (const [x, y, r] of [[-6, -3, 1.6], [2, 3, 1.2], [-10, 4, 1], [6, -4, 1.1]]) { g.beginPath(); g.ellipse(x, y, r, r * 1.3, 0, 0, Math.PI * 2); g.fill(); }
      g.globalAlpha = 1;
    }
    g.restore();
  }
  // palo: origen en el puño, a lo largo de +x (px de pantalla); con o sin móvil
  function dibPalo(g, conMovil, fl, extiende) {
    const L = PALO_L * extiende;
    g.save(); g.lineCap = "round"; g.lineJoin = "round";
    // correa de la muñeca
    g.strokeStyle = "#2a2730"; g.lineWidth = 1.4; g.beginPath(); g.moveTo(-14, 0); g.quadraticCurveTo(-22, 10, -12, 14); g.stroke();
    // tubos telescópicos
    const tubos = [[8, L * 0.42, 3.4], [L * 0.42, L * 0.74, 2.8], [L * 0.74, L, 2.2]];
    for (const [a, b, w] of tubos) { g.strokeStyle = TINTA; g.lineWidth = w + 2.4; g.beginPath(); g.moveTo(a, 0); g.lineTo(b, 0); g.stroke();
      g.strokeStyle = "#c9ced8"; g.lineWidth = w; g.beginPath(); g.moveTo(a, 0); g.lineTo(b, 0); g.stroke();
      g.strokeStyle = "rgba(255,255,255,0.8)"; g.lineWidth = 0.9; g.beginPath(); g.moveTo(a + 1, -w * 0.25); g.lineTo(b - 1, -w * 0.25); g.stroke(); }
    // empuñadura de goma
    rr(g, -15, -4.4, 25, 8.8, 4); g.fillStyle = "#2a2730"; g.fill(); g.strokeStyle = TINTA; g.lineWidth = 1.4; g.stroke();
    // pinza
    g.fillStyle = "#2a2730"; rr(g, L - 1, -5, 6, 10, 2); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 1.2; g.stroke();
    if (conMovil) { g.save(); g.translate(L + 3 + MOV_H / 2, 0); dibMovil(g, fl, 0); g.restore(); }
    else { g.fillStyle = "#2a2730"; rr(g, L + 3, -8.5, 4, 17, 1.5); g.fill(); g.stroke(); }
    g.restore();
  }

  /* =====================================================================================
   * KIRIKU
   * ===================================================================================== */
  const CK = {
    inicio: E({ mx: 0.45, my: -0.75, c: 0.35, sd: 10, si: 6, sonr: 0.35, ancho: 0.95 }),
    pose1: E({ mx: 0.4, my: -0.85, c: 0.45, sd: 12, gd: 0.05, si: 4, sonr: 0.5, ancho: 0.95 }),
    pato: E({ mx: 0.45, my: -0.85, c: 0.38, sd: 18, si: 12, ancho: 0.4, sonr: 0.05 }),
    sospecha: E({ mx: -0.95, my: -0.15, c: 0.32, sd: -4, gd: -0.1, si: 10, sonr: -0.05, ancho: 0.6 }),
    recela: E({ mx: 0.9, my: 0.15, c: 0.5, sd: -8, gd: -0.16, si: 14, gi: 0.06, sonr: -0.1, ancho: 0.55 }),
    recela2: E({ mx: 0.95, my: 0.2, c: 0.66, sd: -12, gd: -0.2, si: 16, gi: 0.08, sonr: -0.15, ancho: 0.45 }),
    jersey: E({ mx: 0.4, my: -0.8, c: 1, h: 0.25, sd: 14, si: 14, sonr: 0.6, ancho: 1 }),
    pose3: E({ mx: 0.5, my: -0.8, c: 0.42, sd: 6, si: 18, gi: 0.08, sonr: 0.6, ancho: 0.95 }),
    pillado: E({ mx: 0.95, my: 0.05, iris: 0.92, c: 0.45, sd: -10, gd: -0.2, si: -4, gi: -0.1, sonr: -0.15, ancho: 0.5 }),
    mirandoAtras: E({ mx: -0.95, my: 0.0, c: 0.5, sd: -8, gd: -0.16, si: 12, sonr: -0.1, ancho: 0.55 }),
    final: E({ mx: 0.42, my: -0.88, c: 0.5, sd: 14, si: 8, sonr: 0.78, ancho: 1.02 }),
    susto: E({ mx: 0.65, my: -1, iris: 0.8, sd: 22, si: 22, abre: 10, ancho: 0.5, sonr: 0 }),
    sigue: E({ mx: 1, my: 0.7, iris: 0.85, sd: 18, si: 18, abre: 6, ancho: 0.45, sonr: 0 }),
    cierra: E({ mx: 1, my: 0.6, c: 1, sd: 4, si: 4, abre: 0, ancho: 0.7, sonr: -0.05 }),
    serio: E({ mx: 0.95, my: 0.6, c: 0.55, sd: 0, si: 0, sonr: -0.05, ancho: 0.68 }),
    miraMovil: E({ mx: 0.95, my: 0.35, c: 0.52, sd: 2, si: -2, sonr: -0.08, ancho: 0.62 }),
    camara: E({ mx: -0.38, my: 0.05, c: 0.55, sd: 2, si: -4, sonr: -0.08, ancho: 0.64 }),
    patoF: E({ mx: 0.5, my: -0.85, c: 0.38, sd: 18, si: 12, ancho: 0.4, sonr: 0.05 }),
    tras: E({ mx: -0.35, my: 0.05, c: 0.5, sd: 18, gd: 0.06, si: 0, sonr: -0.05, ancho: 0.55 })
  };
  const GUION_CK = [
    [T.ajusta0, T.ajusta1, "pose1"], [T.pato0, T.pato1, "pato"], [T.sosp1, T.sosp1 + 0.1, "sospecha"],
    [(T.gira1a + T.gira1b) / 2, (T.gira1a + T.gira1b) / 2 + 0.02, "recela"], [T.vuelve1a, T.vuelve1b, "pose1"],
    [T.jersey0, T.jersey1, "jersey"], [T.baja2a - 0.04, T.baja2a + 0.06, "sospecha"], [(T.gira2a + T.gira2b) / 2, (T.gira2a + T.gira2b) / 2 + 0.02, "recela"],
    [T.gira2b + 0.2, T.vuelve2a - 0.1, "recela2"], [T.vuelve2a, T.vuelve2b, "pose3"], [T.pose3a, T.pose3b, "pose3"],
    [(T.gira3a + T.gira3b) / 2, (T.gira3a + T.gira3b) / 2 + 0.01, "pillado"], [T.quita0, T.atras1, "recela2"],
    [(T.vuelve3a + T.vuelve3b) / 2, (T.vuelve3a + T.vuelve3b) / 2 + 0.01, "mirandoAtras"], [T.final0, T.final1, "final"],
    [T.golpe, T.golpe + 0.08, "susto"], [T.golpe + 0.35, T.plof - 0.05, "sigue"], [T.plof + 0.08, T.plof + 0.25, "cierra"],
    [T.plof + 0.45, T.plof + 0.7, "serio"], [T.pesca1 + 0.1, T.saca1, "miraMovil"], [T.camara, T.camara + 0.2, "camara"],
    [T.sube0 + 0.1, T.patoF, "patoF"], [T.chispa + 0.25, T.chispa + 0.4, "cierra"], [T.chispa + 0.42, T.chispa + 0.6, "tras"]
  ];
  const PARP_K = [0.3, 3.5, 5.2, 6.6, 7.2, 11.0, 11.9];
  const P0K = { torso: 0.02, cab: -0.04, cdy: 0, pel: 0 };
  const CuK = o => Object.assign({}, P0K, o);
  const CUER_K = {
    quieto: CuK({}),
    posa: CuK({ torso: -0.04, cab: -0.12 }),
    pato: CuK({ torso: -0.06, cab: -0.16, cdy: -4 }),
    recela: CuK({ torso: 0.06, cab: 0.04 }),
    recela2: CuK({ torso: 0.14, cab: 0.1, cdy: 6 }),
    jersey: CuK({ torso: -0.07, cab: -0.2, cdy: -6 }),
    pose3: CuK({ torso: -0.08, cab: -0.14 }),
    final: CuK({ torso: -0.08, cab: -0.2, cdy: -4 }),
    susto: CuK({ torso: -0.1, cab: -0.24, pel: -6 }),
    sigue: CuK({ torso: 0.04, cab: 0.1 }),
    serio: CuK({ torso: 0.03, cab: 0.06 }),
    pesca: CuK({ torso: 0.2, cab: 0.18, pel: 10 }),
    mira: CuK({ torso: 0.02, cab: 0.08 }),
    camara: CuK({ torso: 0.0, cab: 0.0 })
  };
  const GUION_K = [
    [T.ajusta0, T.ajusta1, "posa"], [T.pato0, T.pato1, "pato"], [T.gira1a, T.gira1b, "recela"], [T.vuelve1a, T.vuelve1b, "posa"],
    [T.jersey0, T.jersey1, "jersey"], [T.gira2a, T.gira2b, "recela"], [T.gira2b + 0.15, T.gira2b + 0.4, "recela2"], [T.vuelve2a, T.vuelve2b, "posa"],
    [T.pose3a, T.pose3b, "pose3"], [T.gira3a, T.gira3b, "recela"], [T.quita0, T.atras1, "recela2"], [T.vuelve3a, T.vuelve3b, "posa"],
    [T.final0, T.final1, "final"], [T.golpe, T.golpe + 0.1, "susto", salida], [T.golpe + 0.35, T.plof, "sigue"], [T.plof + 0.4, T.plof + 0.7, "serio"],
    [T.paso1 - 0.1, T.pesca0, "pesca"], [T.pesca1 + 0.1, T.saca1, "mira"], [T.camara, T.camara + 0.25, "camara"], [T.sube0, T.sube1, "final"]
  ];
  const GIROS_K = [[T.gira1a, T.gira1b], [T.vuelve1a, T.vuelve1b], [T.gira2a, T.gira2b], [T.vuelve2a, T.vuelve2b], [T.gira3a, T.gira3b, salida], [T.vuelve3a, T.vuelve3b]];
  const TOB_K = KI.SUELO - KI.TOBILLO_ALTO;
  // manos de Kiriku (hoja, relativas al tronco)
  const AGARRA = D5(0.42, 0.3, 0.25, 0.22, 0.2);
  const SEL = (x, y, mu, db) => ({ hoja: { x, y }, mu, dedos: AGARRA, dobla: db ?? -1 });
  const SEL_A = SEL(515, 136, 2.25), SEL_B = SEL(522, 120, 2.2), SEL_C = SEL(528, 112, 2.15), ALTO = SEL(540, 74, 2.1), REPOSO_P = SEL(430, 612, -1.62, 1);
  // ángulo del palo en pantalla (mirando a la derecha) para cada postura
  const ANG = { A: -1.96, B: -2.02, C: -2.08, ALTO: -2.06, REPOSO: 1.72 };
  function angPalo(t) {
    let a = ANG.A;
    const tr = (t0, t1, b, f) => { a = lerp(a, b, (f || suave)(fase(t, t0, t1))); };
    tr(T.ajusta0, T.ajusta1, ANG.A - 0.06);
    tr(T.baja1a, T.baja1b, ANG.REPOSO); tr(T.sube1a, T.sube1b, ANG.B);
    tr(T.baja2a, T.baja2b, ANG.REPOSO); tr(T.sube2a, T.sube2b, ANG.C);
    tr(T.gira3a - 0.02, T.gira3b, ANG.REPOSO, salida); tr(T.vuelve3b - 0.1, T.final1, ANG.ALTO);
    tr(T.bajaPalo0, T.bajaPalo1, ANG.REPOSO);
    // golpe: el palo da un latigazo y se queda temblando
    const u = t - T.golpe;
    if (u > 0) a += 0.6 * Math.exp(-u * 5) * Math.sin(u * 22) * (1 - tramo(t, T.bajaPalo0, T.bajaPalo1));
    return a;
  }
  function xK(t) { return lerp(XK0, XK1, tramo(t, T.paso0, T.paso1)); }
  function poseK(t) {
    const b = linea(GUION_K, CUER_K, "quieto", t);
    const respira = Math.sin(t * 1.9 + 0.7);
    const x = xK(t);
    const f = giro(t, GIROS_K);
    const p = {
      x, suelo: SUELO_K, s: SK, tirasLimpias: true, espejo: f < 0, giroX: Math.max(0.05, Math.abs(f)),
      pelvis: { x: KI.PELVIS.x, y: KI.PELVIS.y + b.pel + respira * 1.1 }, torso: b.torso, torsoEsc: { x: 1, y: 1 + respira * 0.004 },
      piernas: {}, cabeza: { ang: b.cab, dx: 0, dy: b.cdy, esc: { x: 1, y: 1 } }
    };
    // tirones del jersey y latigazo del golpe
    p.torso += 0.02 * (campana(t, T.tiron1, T.tiron1 + 0.12) + campana(t, T.tiron2, T.tiron2 + 0.12));
    p.cabeza.ang += 0.03 * Math.sin((t - T.golpe) * 20) * Math.exp(-(t - T.golpe) * 6) * (t > T.golpe ? 1 : 0);
    // pies: quieto o paso hacia la mesa (px de pantalla: izquierdo y derecho)
    const w = 95 * kK;
    const ps = pasos(t, T.paso0, T.paso1, XK0, XK1, 2, w, 14, "l");
    const aHx = sx => KI.PELVIS.x + (sx - x) / kK * (p.espejo ? -1 : 1);
    const pIzq = { tob: { x: aHx(ps.c), y: TOB_K - ps.yc / kK }, ang: 0 }, pDer = { tob: { x: aHx(ps.l), y: TOB_K - ps.yl / kK }, ang: 0 };
    p.piernas.cerca = p.espejo ? pDer : pIzq; p.piernas.lejos = p.espejo ? pIzq : pDer;
    p.cara = cara(linea(GUION_CK, CK, "inicio", t), parpadeo(t, PARP_K));
    p.rubor = 0;
    // manos
    const res = resolutor(KI, p, "cerca"), resL = resolutor(KI, p, "lejos");
    const PISTA_KL = [
      [0, 0, SEL_A],
      [T.ajusta0, T.ajusta1, SEL(518, 130, 2.22)],
      [T.baja1a, T.baja1b, REPOSO_P], [T.sube1a, T.sube1b, SEL_B],
      [T.baja2a, T.baja2b, REPOSO_P], [T.sube2a, T.sube2b, SEL_C],
      [T.gira3a - 0.02, T.gira3b, REPOSO_P, salida], [T.vuelve3b - 0.1, T.final1, ALTO],
      [T.bajaPalo0, T.bajaPalo1, REPOSO_P],
      [T.suelta, T.suelta + 0.14, { hoja: { x: 440, y: 600 }, mu: -1.6, dedos: D(0.9, 0.9, 0.9, 0.9), dobla: 1 }],
      [T.paso0 + 0.15, T.pesca0, { scr: () => topeMovilCopa(t), ref: PINZA, mu: 2.75, dedos: D5(0.85, 0.85, 0.3, 0.2, 0.2), dobla: -1 }],
      [T.pesca0, T.pesca1, { scr: () => topeMovilCopa(t), ref: PINZA, mu: 2.75, dedos: D5(0.55, 0.62, 0.15, 0.12, 0.12), dobla: -1 }],
      [T.pesca1, T.saca1, { hoja: { x: 560, y: 330 }, mu: 2.85, dedos: D5(0.55, 0.62, 0.15, 0.12, 0.12), dobla: -1 }],
      [T.sube0, T.sube1, { hoja: { x: 600, y: 160 }, mu: 2.8, dedos: D5(0.55, 0.62, 0.15, 0.12, 0.12), dobla: -1 }]
    ];
    const JERSEY = { hoja: { x: 232, y: 438 }, mu: 2.6, dedos: D5(0.6, 0.62, 0.2, 0.15, 0.15), dobla: -1 };
    const CADERA_K = { hoja: { x: 118, y: 640 }, mu: -0.45, dedos: D5(0.2, 0.15, 0.1, 0.1, 0.1), dobla: -1 };
    const PISTA_KC = [
      [0, 0, { bols: true }],
      [T.jersey0, T.jersey1, JERSEY], [T.baja2a - 0.02, T.baja2b, { bols: true }],
      [T.pose3a, T.pose3b, CADERA_K],
      [T.golpe + 0.6, T.golpe + 1.0, { bols: true }],
      [T.sube0, T.sube1, CADERA_K]
    ];
    const C = pista(PISTA_KC, t, res), L = pista(PISTA_KL, t, resL);
    // tirones: la mano baja y sube
    const tir = campana(t, T.tiron1, T.tiron1 + 0.12) + campana(t, T.tiron2, T.tiron2 + 0.12);
    C.y += tir * 16;
    // latigazo en la mano del palo
    if (t > T.golpe) { const u = t - T.golpe; L.x += 18 * Math.exp(-u * 6) * Math.sin(u * 18); L.y += 22 * Math.exp(-u * 7) * Math.sin(u * 15 + 0.6); }
    // el móvil pescado se balancea: la mano tiembla un pelín
    p.manoCerca = mano(C); p.manoLejos = mano(L);
    p.palo = { ang: angPalo(t), movil: t < T.golpe, suelto: t >= T.suelta };
    return p;
  }

  /* ---------- puntos del palo en pantalla (Kiriku sin aplastar) ---------- */
  function puno(p, Rg, m) { return Rg.aPantalla(p, { x: m.x, y: m.y }); }
  function puntoPalo(p, u, v) {
    const c = puno(p, KI, p.manoLejos), a = p.palo.ang;
    const lx = u * Math.cos(a) - v * Math.sin(a), ly = u * Math.sin(a) + v * Math.cos(a);
    return { x: c.x + (p.espejo ? -lx : lx), y: c.y + ly };
  }
  const centroMovilPalo = p => puntoPalo(p, PALO_L + 3 + MOV_H / 2, 0);
  const pantallaMovil = p => puntoPalo(p, PALO_L + 3 + MOV_H / 2, -MOV_W / 2 - 3);

  /* ---------- el móvil que vuela y acaba en la copa ---------- */
  const MOV_COPA = { x: GX + 2, y: COPA.yl - 9, ang: -Math.PI / 2 + 0.32 };      // dentro de la copa (eje largo casi vertical)
  function vueloMovil(t) {
    const p0 = cache("p0", () => { const pk = poseK(T.golpe); return { c: centroMovilPalo(pk), ang: pk.palo.ang }; });
    const u = fase(t, T.golpe, T.plof);
    const x = lerp(p0.c.x, MOV_COPA.x, u), yLin = lerp(p0.c.y, MOV_COPA.y - 6, u);
    const y = yLin - 140 * 4 * u * (1 - u) * (1 - 0.25 * u);
    const ang = lerp(p0.ang, MOV_COPA.ang + Math.PI * 2 * 2, salida(u) * 0.3 + u * 0.7);
    return { x, y, ang, u };
  }
  // el móvil en la copa (hundiéndose y meciéndose); luego lo pesca Kiriku
  function movilEnCopa(t) {
    const u = t - T.plof;
    const hunde = 6 * salida(clamp(u / 0.25)) + 1.5 * Math.sin(u * 9) * Math.exp(-u * 3);
    return { x: MOV_COPA.x + 1.5 * Math.sin(u * 7) * Math.exp(-u * 2.5), y: MOV_COPA.y + hunde, ang: MOV_COPA.ang + 0.08 * Math.sin(u * 8) * Math.exp(-u * 2.5) };
  }
  // punto de agarre (borde de arriba del móvil) mientras está en la copa
  function topeMovilCopa(t) {
    const m = movilEnCopa(Math.max(t, T.plof + 0.8));
    return { x: m.x + Math.cos(m.ang) * (MOV_H / 2 - 2), y: m.y + Math.sin(m.ang) * (MOV_H / 2 - 2) };
  }

  /* =====================================================================================
   * GUILLERMO
   * ===================================================================================== */
  const CG = {
    inicio: E({ mx: 0.85, my: -0.25, c: 0.15, sd: 4, si: 2, sonr: 0.1, ancho: 0.8 }),
    ceja: E({ mx: 0.9, my: -0.35, sd: 20, gd: 0.12, si: 0, sonr: -0.05, ancho: 0.6 }),
    idea: E({ mx: -0.5, my: 0.05, c: 0.3, sd: 10, si: 18, gi: 0.12, sonr: 0.9, ancho: 1.1 }),
    bleh: E({ mx: 0, my: 0, c: 1, z: 1, abre: 26, ancho: 0.82, sonr: 0.3, sd: 24, si: 16, gi: -0.1, iris: 0.9 }),
    inocente: E({ mx: 0.15, my: -1, sd: 16, si: 18, abre: 3, ancho: 0.32, sonr: 0 }),
    pez: E({ mx: 0, my: 0, mof: 1, ancho: 0.32, abre: 0, sonr: -0.1, sd: 26, si: 26, iris: 0.75 }),
    pfff: E({ mx: 0.1, my: -0.2, c: 0.8, z: 0.6, ancho: 0.55, abre: 12, sonr: 0.1, sd: 22, si: 22, mof: 0 }),
    groucho: E({ mx: -0.45, my: 0, c: 0.1, sd: 22, si: 12, sonr: 0.9, abre: 10, ancho: 1.05 }),
    pillado: E({ mx: 0.9, my: 0, iris: 0.78, sd: 22, si: 22, sonr: 0.65, abre: 0, ancho: 1 }),
    apurado: E({ mx: 0.6, my: 0.3, c: 0.2, sd: 14, gd: 0.18, si: 14, gi: 0.18, sonr: 0.15, ancho: 0.6 }),
    sigilo: E({ mx: 0.9, my: -0.45, c: 0.25, sd: 6, gd: -0.1, si: 16, sonr: 0.75, ancho: 0.95 }),
    salto: E({ mx: -0.45, my: 0, iris: 0.85, abre: 32, ancho: 1.15, sonr: 0.9, sd: 26, si: 26 }),
    vuelo: E({ mx: 0.75, my: -1, iris: 0.9, sd: 20, si: 20, abre: 10, ancho: 0.5, sonr: 0 }),
    horror: E({ mx: 0.95, my: 0.4, iris: 0.7, sd: 26, gd: 0.2, si: 26, gi: 0.2, abre: 14, ancho: 1.1, sonr: -0.5 }),
    puntillas: E({ mx: -0.8, my: 0.05, c: 0.15, sd: 14, si: 12, abre: 0, ancho: 0.42, sonr: -0.1 })
  };
  const GUION_CG = [
    [T.click1 + 0.05, T.click1 + 0.2, "ceja"], [T.idea0, T.idea0 + 0.2, "idea"],
    [T.in1a + 0.05, T.in1b, "bleh", salida], [T.out1a, T.out1a + 0.1, "inocente"],
    [T.in2a + 0.05, T.in2b, "pez", salida], [T.click3 + 0.02, T.click3 + 0.08, "pfff"], [T.out2a, T.out2a + 0.08, "inocente"],
    [T.in3a + 0.05, T.in3b, "groucho"], [T.gira3b - 0.02, T.gira3b + 0.06, "pillado"], [T.quita0, T.quita0 + 0.15, "apurado"],
    [T.atras1, T.atras1 + 0.12, "inocente"], [T.sigilo0, T.sigilo0 + 0.2, "sigilo"], [T.despega - 0.04, T.despega + 0.08, "salto"],
    [T.golpe + 0.05, T.golpe + 0.2, "vuelo"], [T.plof, T.plof + 0.1, "horror"], [T.giraG0, T.giraG1, "puntillas"]
  ];
  const PARP_G = [0.75, 1.62, 3.5, 5.15, 8.0, 9.9, 11.0];
  const P0G = { torso: 0.02, cab: 0.03, cdy: 0, baja: 0 };
  const CuG = o => Object.assign({}, P0G, o);
  const CUER_G = {
    quieto: CuG({}),
    ceja: CuG({ torso: 0.0, cab: 0.06 }),
    idea: CuG({ torso: -0.03, cab: -0.04 }),
    asoma: CuG({ torso: 0.17, cab: 0.18, cdy: 6 }),
    asoma2: CuG({ torso: 0.17, cab: 0.12, cdy: 4 }),
    asoma3: CuG({ torso: 0.17, cab: 0.12, cdy: 4 }),
    inocente: CuG({ torso: -0.05, cab: -0.14, cdy: 4 }),
    pillado: CuG({ torso: -0.06, cab: -0.04 }),
    sigilo: CuG({ torso: 0.2, cab: -0.18, baja: 200 }),
    agacha: CuG({ torso: 0.16, cab: -0.12, baja: 300 }),
    salto: CuG({ torso: -0.06, cab: -0.08, baja: 0 }),
    cae: CuG({ torso: 0.32, cab: 0.12, baja: 170 }),
    mira: CuG({ torso: 0.02, cab: -0.14, baja: 40 }),
    horror: CuG({ torso: -0.12, cab: -0.04, baja: 20 }),
    puntillas: CuG({ torso: 0.17, cab: -0.04, baja: 30 })
  };
  const GUION_G = [
    [T.click1 + 0.05, T.click1 + 0.25, "ceja"], [T.idea0, T.idea1, "idea"],
    [T.in1a, T.in1b, "asoma"], [T.out1a, T.out1b, "inocente", salida], [T.sube1a, T.sube1b + 0.1, "quieto"],
    [T.in2a, T.in2b, "asoma2"], [T.out2a, T.out2b, "inocente", salida], [T.sube2a, T.sube2b, "quieto"],
    [T.in3a, T.in3b, "asoma3"], [T.gira3b, T.gira3b + 0.08, "pillado", salida], [T.atras0, T.atras1, "inocente"],
    [T.sigilo0, T.sigilo1, "sigilo"], [T.sigilo1, T.despega, "agacha"], [T.despega, T.despega + 0.14, "salto", salida],
    [T.aterriza - 0.04, T.aterriza + 0.06, "cae", salida], [T.aterriza + 0.12, T.plof - 0.05, "mira"], [T.plof, T.plof + 0.2, "horror"],
    [T.giraG0, T.puntillas0 + 0.2, "puntillas"]
  ];
  const TOB_G = G.SUELO - G.TOBILLO_ALTO;
  const XIN = [474, 466, 470];
  function xG(t) {
    let x = XG0;
    const tr = (t0, t1, b, f) => { x = lerp(x, b, (f || suave)(fase(t, t0, t1))); };
    tr(T.in1a, T.in1b, XIN[0]); tr(T.out1a, T.out1b, XG0, salida);
    tr(T.in2a, T.in2b, XIN[1]); tr(T.out2a, T.out2b, XG0, salida);
    tr(T.in3a, T.in3b, XIN[2]); tr(T.atras0, T.atras1, XG0);
    tr(T.sigilo0, T.sigilo1, 516); tr(T.despega, T.cima + 0.04, 584, salida); tr(T.cima + 0.04, T.aterriza, 505, t => t);
    tr(T.puntillas0, T.puntillas1, -130, t => t);
    return x;
  }
  // altura del salto (px)
  function altoSalto(t) {
    if (t <= T.despega || t >= T.aterriza) return 0;
    const H = 146, ta = T.despega, tc = T.cima + 0.04, tb = T.aterriza;
    if (t < tc) return H * salida(fase(t, ta, tc));
    return H * (1 - entrada(fase(t, tc, tb)));
  }
  const GIROS_G = [[T.giraG0, T.giraG1]];
  function poseG(t) {
    const b = linea(GUION_G, CUER_G, "quieto", t);
    const respira = Math.sin(t * 2.1 + 0.4);
    const x = xG(t), f = giro(t, GIROS_G), esp = f < 0;
    const H = altoSalto(t);
    const p = {
      x, suelo: SUELO_G - H, s: SG, tirasLimpias: true, espejo: esp, giroX: Math.max(0.05, Math.abs(f)),
      pelvis: { x: G.PELVIS.x, y: G.PELVIS.y + b.baja + respira * 1.2 }, torso: b.torso, torsoEsc: { x: 1, y: 1 + respira * 0.004 },
      piernas: {}, cabeza: { ang: b.cab, dx: 0, dy: b.cdy, esc: { x: 1, y: 1 } }
    };
    // silbar: la cabeza se mece
    const silba = silbando(t);
    p.cabeza.ang += 0.04 * Math.sin(t * 5) * silba;
    // pies (px de pantalla: izquierdo y derecho)
    const w = 100 * SG;
    let izq = x - w, der = x + w, yi = 0, yd = 0, ai = 0, ad = 0;
    const segs = [[T.in1a, T.in1b, XG0, XIN[0], 2, "l"], [T.out1a, T.out1b, XIN[0], XG0, 2, "c"], [T.in2a, T.in2b, XG0, XIN[1], 2, "l"], [T.out2a, T.out2b, XIN[1], XG0, 2, "c"],
      [T.in3a, T.in3b, XG0, XIN[2], 2, "l"], [T.atras0, T.atras1, XIN[2], XG0, 2, "c"], [T.sigilo0, T.sigilo1, XG0, 516, 3, "l"]];
    for (const [t0, t1, x0, x1, n, lid] of segs) if (t > t0 - 0.001) { const ps = pasos(t, t0, t1, x0, x1, n, w, n > 2 ? 10 : 14, lid); izq = ps.c; der = ps.l; yi = ps.yc; yd = ps.yl; }
    // agachado detrás de Kiriku: pies separados
    const ag = tramo(t, T.sigilo0, T.sigilo1) * (1 - tramo(t, T.despega - 0.02, T.despega + 0.1));
    izq -= 8 * ag; der += 8 * ag;
    // en el aire: piernas recogidas
    let recoge = 0;
    if (t > T.despega && t < T.aterriza + 0.02) recoge = Math.sin(Math.PI * fase(t, T.despega, T.aterriza));
    if (t >= T.despega) { const xa = xG(t); izq = xa - w * (1 + 0.6 * recoge); der = xa + w * (1 + 0.4 * recoge); yi = yd = 0; }
    // de puntillas: pasos largos hacia la izquierda, de punta
    let punta = 0;
    if (t >= T.giraG0) punta = tramo(t, T.giraG0, T.puntillas0);
    if (t >= T.puntillas0) { const ps = pasos(t, T.puntillas0, T.puntillas1, 505, -130, 9, w * 0.45, 30, "c"); izq = ps.c; der = ps.l; yi = ps.yc; yd = ps.yl; }
    ai = punta * (0.5 + 0.5 * yi / 30); ad = punta * (0.5 + 0.5 * yd / 30);
    const aHx = sx => G.PELVIS.x + (sx - x) / SG * (esp ? -1 : 1);
    const pIzq = { tob: { x: aHx(izq), y: TOB_G - yi / SG - 230 * recoge - 58 * punta }, ang: ai + 0.3 * recoge };
    const pDer = { tob: { x: aHx(der), y: TOB_G - yd / SG - 170 * recoge - 58 * punta }, ang: ad + 0.2 * recoge };
    p.piernas.cerca = esp ? pDer : pIzq; p.piernas.lejos = esp ? pIzq : pDer;
    // cara
    p.cara = cara(linea(GUION_CG, CG, "inicio", t), parpadeo(t, PARP_G));
    p.sudor = 0.7 * campana(t, T.gira2b, T.vuelve2b) + 0.9 * campana(t, T.gira3b, T.atras1 + 0.2) + 0.8 * campana(t, T.plof, T.puntillas0 + 0.8);
    // manos
    const res = resolutor(G, p, "cerca"), resL = resolutor(G, p, "lejos");
    const H_ = q => () => deRetrato(G, p, q);
    const MEJILLA = { x: 640, y: 720 }, NARIZ_G = { x: 700, y: 600 };
    const PISTA_GC = [
      [0, 0, { bols: true }],
      // ronda 2: el dedo al moflete
      [T.in2a + 0.04, T.in2b + 0.04, { scr: H_({ x: 500, y: 560 }), ref: PALMA, mu: 1.45, dedos: D(1, 1, 1, 1), dobla: -1 }],
      [T.out2a, T.out2b, { bols: true }, salida],
      // ronda 3: saca las gafas y se las pone
      [T.in3a - 0.02, T.in3a + 0.1, { bols: true, sale: true, dedos: D5(0.55, 0.6, 0.3, 0.3, 0.3) }],
      [T.in3a + 0.1, T.in3b + 0.02, { scr: H_(AGARRE_GAFAS), ref: PINZA, mu: 2.3, dedos: D5(0.55, 0.6, 0.3, 0.3, 0.3), dobla: -1 }],
      [T.gafas, T.gafas + 0.12, { scr: H_({ x: 470, y: 760 }), ref: PALMA, mu: 1.9, dedos: D(1, 1, 1, 1), dobla: -1 }, salida],
      [T.quita0, T.quita1, { scr: H_(AGARRE_GAFAS), ref: PINZA, mu: 2.3, dedos: D5(0.55, 0.6, 0.3, 0.3, 0.3), dobla: -1 }],
      [T.quita1 + 0.02, T.quita2, { bols: true, sale: true, dedos: D5(0.55, 0.6, 0.3, 0.3, 0.3) }],
      [T.quita2, T.quita2 + 0.06, { bols: true }],
      // el salto: brazos arriba
      [T.despega - 0.06, T.cima - 0.04, { hoja: { x: -40, y: 140 }, mu: 1.2, dedos: D(1, 1, 1, 1), dobla: 1 }, salida],
      [T.aterriza - 0.1, T.aterriza + 0.1, { hoja: { x: 60, y: 560 }, mu: -1.4, dedos: D(0.6, 0.6, 0.6, 0.6), dobla: -1 }],
      // horror: manos a la cara
      [T.plof + 0.02, T.plof + 0.18, { scr: H_({ x: 560, y: 780 }), ref: PALMA, mu: 1.6, dedos: D(1, 1, 1, 1), dobla: -1 }, salida],
      // de puntillas: patitas delante del pecho
      [T.giraG0, T.puntillas0 + 0.15, { hoja: { x: 300, y: 430 }, mu: -1.3, dedos: D(0.2, 0.25, 0.25, 0.25), dobla: -1, ang: 0.9 }]
    ];
    const PISTA_GL = [
      [0, 0, { bols: true }],
      [T.despega - 0.06, T.cima - 0.06, { scr: () => golpePalo(t), ref: PALMA, mu: 2.4, dedos: D(1, 1, 1, 1), dobla: 1 }, salida],
      [T.golpe, T.golpe + 0.12, { hoja: { x: 640, y: 40 }, mu: 2.6, dedos: D(1, 1, 1, 1), dobla: 1 }, salida],
      [T.aterriza - 0.1, T.aterriza + 0.1, { hoja: { x: 430, y: 560 }, mu: -1.6, dedos: D(0.6, 0.6, 0.6, 0.6), dobla: 1 }],
      [T.plof + 0.02, T.plof + 0.18, { scr: H_({ x: 1000, y: 820 }), ref: PALMA, mu: 2.2, dedos: D(1, 1, 1, 1), dobla: 1 }, salida],
      [T.giraG0, T.puntillas0 + 0.15, { hoja: { x: 400, y: 440 }, mu: -1.4, dedos: D(0.2, 0.25, 0.25, 0.25), dobla: 1, ang: 0.9 }]
    ];
    const C = pista(PISTA_GC, t, res), L = pista(PISTA_GL, t, resL);
    // ronda 2: menea los dedos junto a la oreja (burla)
    const bu = campana(t, T.in2b - 0.1, T.out2a + 0.05);
    if (bu > 0) { const n = ["indice", "medio", "anular", "menique"]; n.forEach((f, i) => { C.dedos[f] = lerp(C.dedos[f], 0.55 + 0.45 * Math.sin(t * 32 + i * 1.1), bu); }); C.ang += 0.12 * bu * Math.sin(t * 16); }
    p.manoCerca = mano(C); p.manoLejos = mano(L);
    p.silba = silba;
    return p;
  }
  function silbando(t) { return campana(t, T.out1b - 0.05, T.vuelve1b + 0.15) + campana(t, T.out2b - 0.05, T.vuelve2b + 0.1) + campana(t, T.atras1 - 0.1, T.vuelve3b + 0.15); }
  // punto del palo que golpea la mano de Guillermo
  function golpePalo(t) { const pk = poseK(Math.min(t, T.golpe)); return puntoPalo(pk, PALO_L * 0.62, 0); }
  // las gafas de broma: dónde agarra la mano (retrato de Guillermo)
  const AGARRE_GAFAS = { x: 690, y: 600 };
  /* =====================================================================================
   * CAPAS DE LA CARA
   * ===================================================================================== */
  const BOCA_C = { x: 803, y: 730 }, BOCA_ANG = 0.26;
  const OJOS_G = {
    d: { arriba: [[733, 551], [737, 541], [748, 541], [762, 545], [776, 550], [790, 556], [803, 561], [809, 566]], c: { x: 771, y: 563 }, r: 17.5, rx: 25, ry: 9 },
    i: { arriba: [[866, 603], [872, 597], [885, 598], [900, 602], [913, 606], [921, 611]], c: { x: 894, y: 617 }, r: 15, rx: 19, ry: 7 }
  };
  let ojosListos = false;
  function prepOjos() {
    if (ojosListos) return; const PO = G.A.datos.piezas.cabeza.ojos; OJOS_G.d.poli = PO.derecho; OJOS_G.i.poli = PO.izquierdo; ojosListos = true;
  }
  function ojo(g, o, m, escIris) {
    const C = G.C;
    g.save(); g.beginPath(); g.moveTo(o.poli[0][0], o.poli[0][1]); for (let i = 1; i < o.poli.length; i++) g.lineTo(o.poli[i][0], o.poli[i][1]); g.closePath();
    g.fillStyle = C.blanco; g.fill(); g.clip();
    const ix = o.c.x + o.rx * m.x, iy = o.c.y + o.ry * m.y, r = o.r * escIris;
    g.fillStyle = C.iris; g.beginPath(); g.arc(ix, iy, r, 0, Math.PI * 2); g.fill();
    g.fillStyle = C.irisLuz; g.beginPath(); g.ellipse(ix, iy + r * 0.32, r * 0.7, r * 0.55, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#120806"; g.beginPath(); g.arc(ix, iy + r * 0.05, r * 0.46, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#ffffff"; g.beginPath(); g.ellipse(ix - r * 0.36, iy - r * 0.34, r * 0.3, r * 0.24, -0.4, 0, Math.PI * 2); g.fill();
    g.strokeStyle = C.ojoSombra; g.lineWidth = 9; g.beginPath(); g.moveTo(o.arriba[0][0], o.arriba[0][1]); for (let i = 1; i < o.arriba.length; i++) g.lineTo(o.arriba[i][0], o.arriba[i][1]); g.stroke();
    g.restore();
  }
  // lengua fuera (blé): cuelga de la boca abierta
  function lenguaFuera(g, k, lado, t) {
    if (k <= 0.01) return;
    const C = G.C;
    g.save(); g.translate(BOCA_C.x, BOCA_C.y); g.rotate(BOCA_ANG); g.translate(lado * 26, 16); g.rotate(-0.12 * lado + 0.08 * Math.sin(t * 9)); g.scale(k * 1.45, k * 1.45);
    g.beginPath(); g.moveTo(-22, -6); g.bezierCurveTo(-26, 44, 24, 50, 22, -6); g.closePath();
    g.fillStyle = C.lengua; g.fill(); g.lineWidth = 5; g.strokeStyle = C.tinta; g.stroke();
    g.strokeStyle = "rgba(120,20,30,0.55)"; g.lineWidth = 3; g.beginPath(); g.moveTo(0, 4); g.lineTo(0, 26); g.stroke();
    g.fillStyle = "rgba(255,255,255,0.4)"; g.beginPath(); g.ellipse(-9, 18, 5, 8, 0.2, 0, Math.PI * 2); g.fill();
    g.restore();
  }
  // moflete cercano hinchado (como en 00066/00072)
  function carrillo(g, k) {
    if (k <= 0.01) return;
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    const A = { x: 600, y: 684 }, Bq = { x: 768, y: 842 }, b = 30 * k;
    const c1 = { x: 586 - b * 0.9, y: 748 + b * 0.5 }, c2 = { x: 690 - b * 0.5, y: 850 + b * 0.8 };
    g.beginPath(); g.moveTo(A.x, A.y); g.bezierCurveTo(c1.x, c1.y, c2.x, c2.y, Bq.x, Bq.y); g.lineTo(760, 800); g.lineTo(640, 700); g.closePath();
    g.fillStyle = G.C.piel; g.fill();
    g.beginPath(); g.moveTo(A.x, A.y); g.bezierCurveTo(c1.x, c1.y, c2.x, c2.y, Bq.x, Bq.y); g.lineWidth = 6; g.strokeStyle = TINTA; g.stroke();
    g.globalAlpha = 0.5 * clamp(k); g.fillStyle = "#fff1dc";
    g.beginPath(); g.ellipse(706, 664, 20 + 12 * k, 13 + 7 * k, -0.35, 0, Math.PI * 2); g.fill();
    g.restore();
  }
  // labios de silbar
  function labiosSilbo(g, k) {
    if (k <= 0.01) return;
    g.save(); g.translate(BOCA_C.x + 8, BOCA_C.y + 4); g.rotate(BOCA_ANG); g.scale(k, k);
    g.fillStyle = "#e88b78"; g.beginPath(); g.ellipse(0, 0, 15, 12, 0, 0, Math.PI * 2); g.fill();
    g.lineWidth = 4.5; g.strokeStyle = G.C.tinta; g.stroke();
    g.fillStyle = "#4f1512"; g.beginPath(); g.ellipse(1, 0, 6, 5, 0, 0, Math.PI * 2); g.fill();
    g.restore();
  }
  // gafas de broma: montura negra, cejas pobladas, nariz rosa y bigote (retrato de Guillermo)
  function gafasBroma(g, k) {
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    // patilla hacia la oreja
    g.strokeStyle = TINTA; g.lineWidth = 9; g.beginPath(); g.moveTo(735, 560); g.lineTo(640, 548); g.stroke();
    // monturas (cerca grande, lejos pequeña)
    g.lineWidth = 11;
    g.beginPath(); g.ellipse(772, 566, 46, 38, 0.32, 0, Math.PI * 2); g.stroke();
    g.beginPath(); g.ellipse(902, 616, 33, 31, 0.32, 0, Math.PI * 2); g.stroke();
    g.fillStyle = "rgba(220,240,255,0.18)"; g.beginPath(); g.ellipse(772, 566, 41, 33, 0.32, 0, Math.PI * 2); g.fill(); g.beginPath(); g.ellipse(902, 616, 28, 26, 0.32, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "rgba(255,255,255,0.7)"; g.lineWidth = 4; g.beginPath(); g.ellipse(772, 566, 34, 26, 0.32, 3.6, 4.4); g.stroke();
    g.strokeStyle = TINTA; g.lineWidth = 10; g.beginPath(); g.moveTo(816, 584); g.quadraticCurveTo(842, 576, 870, 600); g.stroke();
    // cejas pobladas
    g.fillStyle = "#1b1418";
    g.beginPath(); g.moveTo(718, 520); g.quadraticCurveTo(760, 490, 818, 524); g.quadraticCurveTo(770, 512, 722, 532); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(872, 572); g.quadraticCurveTo(906, 556, 942, 582); g.quadraticCurveTo(905, 572, 876, 584); g.closePath(); g.fill();
    // nariz rosa
    g.fillStyle = "#f2a0a6"; g.strokeStyle = TINTA; g.lineWidth = 6;
    g.beginPath(); g.ellipse(884, 668, 36, 30, 0.35, 0, Math.PI * 2); g.fill(); g.stroke();
    g.fillStyle = "rgba(255,255,255,0.65)"; g.beginPath(); g.ellipse(872, 652, 11, 7, -0.4, 0, Math.PI * 2); g.fill();
    g.fillStyle = "rgba(160,60,70,0.5)"; g.beginPath(); g.ellipse(896, 690, 8, 5, 0.3, 0, Math.PI * 2); g.fill();
    // bigote
    g.fillStyle = "#1b1418";
    g.beginPath(); g.moveTo(808, 704); g.quadraticCurveTo(840, 690, 868, 702); g.quadraticCurveTo(900, 690, 924, 712);
    g.quadraticCurveTo(904, 734, 872, 722); g.quadraticCurveTo(846, 740, 812, 724); g.quadraticCurveTo(796, 716, 808, 704); g.closePath(); g.fill();
    g.strokeStyle = "rgba(255,255,255,0.25)"; g.lineWidth = 2; for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(820 + i * 16, 708); g.lineTo(816 + i * 16, 722); g.stroke(); }
    g.restore();
  }
  // morritos de Kiriku (retrato de Kiriku)
  function morritos(g, k) {
    if (k <= 0.01) return;
    g.save(); g.translate(896, 549); g.rotate(0.2); g.scale(k * 1.2, k * 1.2); g.lineJoin = "round";
    g.fillStyle = "#e9887a"; g.strokeStyle = TINTA; g.lineWidth = 4.2;
    // labio de arriba
    g.beginPath(); g.moveTo(-26, 0); g.bezierCurveTo(-24, -18, -4, -22, 6, -14); g.bezierCurveTo(16, -24, 34, -18, 38, -2); g.quadraticCurveTo(8, 4, -26, 0); g.closePath(); g.fill(); g.stroke();
    // labio de abajo
    g.fillStyle = "#f29e8e"; g.beginPath(); g.moveTo(-24, 2); g.quadraticCurveTo(8, 6, 38, 0); g.bezierCurveTo(36, 22, -6, 26, -24, 2); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "rgba(255,255,255,0.55)"; g.beginPath(); g.ellipse(12, 10, 9, 3.5, -0.1, 0, Math.PI * 2); g.fill();
    g.restore();
    // pliegue del moflete chupado
    g.save(); g.globalAlpha = 0.6 * k; g.strokeStyle = "#b8653a"; g.lineWidth = 4; g.lineCap = "round";
    g.beginPath(); g.moveTo(818, 520); g.quadraticCurveTo(808, 552, 822, 580); g.stroke(); g.restore();
  }
  // brillito de «postureo» (en pantalla)
  function destello(g, x, y, r, a, rot) {
    if (a <= 0.01) return;
    g.save(); g.globalAlpha = a; g.translate(x, y); g.rotate(rot || 0); g.fillStyle = "#ffffff";
    g.beginPath(); for (let i = 0; i < 8; i++) { const rr_ = i % 2 ? r * 0.18 : r, an = i * Math.PI / 4; g.lineTo(Math.cos(an) * rr_, Math.sin(an) * rr_); } g.closePath(); g.fill();
    g.restore();
  }

  /* ---------- capa de la cara de Guillermo ---------- */
  function capaG(g, t, p) {
    prepOjos();
    const f = p.cara;
    // bizco (ronda 1 y en la foto final)
    const bz = tramo(t, T.cima - 0.12, T.cima) * (1 - tramo(t, T.golpe + 0.05, T.golpe + 0.15));
    if (bz > 0.01) {
      const md = { x: lerp(f.mirada.x, 0.95, bz), y: lerp(f.mirada.y, 0.7, bz) }, mi = { x: lerp(f.mirada.x, -0.95, bz), y: lerp(f.mirada.y, 0.65, bz) };
      ojo(g, OJOS_G.d, md, f.iris ?? 1); ojo(g, OJOS_G.i, mi, f.iris ?? 1);
    }
    // lengua: ronda 1 (centrada) y salto (de lado)
    const lg1 = tramo(t, T.in1b - 0.1, T.in1b + 0.02) * (1 - tramo(t, T.out1a, T.out1a + 0.06));
    const lg2 = tramo(t, T.cima - 0.12, T.cima - 0.02) * (1 - tramo(t, T.golpe + 0.1, T.golpe + 0.22));
    const lg3 = campana(t, T.click3 - 0.02, T.out2a + 0.02);
    lenguaFuera(g, lg1, 0, t); lenguaFuera(g, lg2 * 0.8, 0.9, t); lenguaFuera(g, lg3 * 0.6, 0.2, t * 3);
    // moflete cercano de pez globo; se desinfla con el pinchazo
    const mof = tramo(t, T.in2a + 0.05, T.in2b) * (1 - tramo(t, T.click3 + 0.01, T.click3 + 0.07, salida));
    carrillo(g, mof * (0.9 + 0.1 * Math.sin(t * 12)));
    // labios de silbar
    labiosSilbo(g, clamp(p.silba * 1.4));
    
    // gafas de broma (en la cara; en la mano se pintan desplazadas hasta el puño)
    const ga = estadoGafas(t);
    if (ga.k > 0.01) {
      g.save();
      if (ga.enMano) {
        const hS = puntoMano(G, p, p.manoCerca, PINZA), hR = aRetrato(G, PIV.G, p, hS);
        g.translate(hR.x - AGARRE_GAFAS.x, hR.y - AGARRE_GAFAS.y);
        g.translate(AGARRE_GAFAS.x, AGARRE_GAFAS.y); g.scale(ga.k, ga.k); g.rotate(ga.giro); g.translate(-AGARRE_GAFAS.x, -AGARRE_GAFAS.y);
      }
      gafasBroma(g, ga.k);
      g.restore();
    }
  }
  function estadoGafas(t) {
    if (t < T.in3a + 0.02 || t > T.quita2 + 0.02) return { k: 0 };
    if (t < T.in3b + 0.02) return { k: lerp(0.35, 1, tramo(t, T.in3a + 0.02, T.in3a + 0.2)), enMano: true, giro: lerp(-0.9, 0, tramo(t, T.in3a + 0.02, T.in3b)) };
    if (t < T.quita1) return { k: 1, enMano: false };
    return { k: lerp(1, 0.35, tramo(t, T.quita1 + 0.05, T.quita2)), enMano: true, giro: lerp(0, -0.9, tramo(t, T.quita1, T.quita2)) };
  }
  function puntoMano(Rg, p, m, ref) { const o = offMano(Rg, m, ref); return Rg.aPantalla(p, { x: m.x + o.x, y: m.y + o.y }); }

  /* =====================================================================================
   * EFECTOS
   * ===================================================================================== */
  const CLICKS = [T.click1, T.click2, T.click3, T.click4, T.click5];
  function flashK(t) {
    let f = 0;
    for (const tf of CLICKS) { if (t < tf - 0.05) continue; f = Math.max(f, t < tf ? fase(t, tf - 0.05, tf) : Math.exp(-(t - tf) * 9)); }
    return f;
  }
  function flash(g, t, pK) {
    const f = flashK(t); if (f < 0.01 || !pK.palo.movil) return;
    const s = pantallaMovil(pK), c = centroMovilPalo(pK);
    g.save();
    const r = 30 + 22 * f;
    const gr = g.createRadialGradient(s.x, s.y, 2, s.x, s.y, r); gr.addColorStop(0, `rgba(255,255,255,${0.9 * f})`); gr.addColorStop(0.35, `rgba(235,248,255,${0.35 * f})`); gr.addColorStop(1, "rgba(235,248,255,0)");
    g.fillStyle = gr; g.beginPath(); g.arc(s.x, s.y, r, 0, Math.PI * 2); g.fill();
    // luz sobre la cara de Kiriku
    const cf = KI.aPantalla(pK, KI.cabeza(pK).a({ x: 860, y: 450 }));
    const g2 = g.createRadialGradient(cf.x, cf.y, 4, cf.x, cf.y, 70); g2.addColorStop(0, `rgba(255,255,255,${0.3 * f})`); g2.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = g2; g.beginPath(); g.arc(cf.x, cf.y, 70, 0, Math.PI * 2); g.fill();
    // rayitas del destello
    g.strokeStyle = `rgba(255,255,255,${0.9 * f})`; g.lineWidth = 2; g.lineCap = "round";
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + 0.3, r0 = 10 + 8 * (1 - f), r1 = r0 + 10 * f; g.beginPath(); g.moveTo(s.x + Math.cos(a) * r0, s.y + Math.sin(a) * r0); g.lineTo(s.x + Math.cos(a) * r1, s.y + Math.sin(a) * r1); g.stroke(); }
    g.restore();
  }
  // notas del silbido (redondas)
  function notas(g, t, pG) {
    const k = pG.silba; if (k < 0.01) return;
    const b = G.aPantalla(pG, G.cabeza(pG).a({ x: 830, y: 740 }));
    g.save();
    for (let i = 0; i < 4; i++) {
      const ph = ((t * 0.9 + i * 0.25) % 1), a = Math.sin(Math.PI * ph) * k;
      if (a < 0.02) continue;
      const x = b.x + 34 + ph * 34 + 6 * Math.sin(t * 4 + i), y = b.y - 2 - ph * 56;
      nota(g, x, y, 1.5 + 0.4 * (i % 2), a, i % 2 ? "#3b6fd8" : "#e2457a");
    }
    g.restore();
  }
  function nota(g, x, y, s, a, col) {
    g.save(); g.globalAlpha = a; g.translate(x, y); g.scale(s, s); g.rotate(-0.25);
    g.fillStyle = col; g.strokeStyle = TINTA; g.lineWidth = 1.2;
    g.beginPath(); g.ellipse(0, 0, 4.6, 3.4, -0.4, 0, Math.PI * 2); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(4, -1); g.lineTo(4, -15); g.quadraticCurveTo(10, -12, 9, -6); g.lineWidth = 1.8; g.strokeStyle = col; g.stroke();
    g.restore();
  }
  function estrella(g, x, y, r, a, col) {
    if (a <= 0.01) return;
    g.save(); g.globalAlpha = a; g.fillStyle = col || "#ffe14d"; g.strokeStyle = TINTA; g.lineWidth = 1.6;
    g.beginPath(); for (let i = 0; i < 10; i++) { const rr_ = i % 2 ? r * 0.42 : r, an = i * Math.PI / 5 - Math.PI / 2; g.lineTo(x + Math.cos(an) * rr_, y + Math.sin(an) * rr_); } g.closePath(); g.fill(); g.stroke();
    g.restore();
  }
  // golpe de la mano al palo
  function golpeFx(g, t) {
    const k = fase(t, T.golpe, T.golpe + 0.3); if (k <= 0 || k >= 1) return;
    const q = cache("golpeP", () => golpePalo(T.golpe));
    estrella(g, q.x + 3, q.y - 3, 9 + 10 * salida(k), 1 - k);
    g.save(); g.globalAlpha = 1 - k; g.strokeStyle = "#ffffff"; g.lineWidth = 2.4; g.lineCap = "round";
    for (let i = 0; i < 6; i++) { const a = -2.6 + i * 0.5, r0 = 14 + 16 * k, r1 = r0 + 9; g.beginPath(); g.moveTo(q.x + Math.cos(a) * r0, q.y + Math.sin(a) * r0); g.lineTo(q.x + Math.cos(a) * r1, q.y + Math.sin(a) * r1); g.stroke(); }
    g.restore();
  }
  // giro de látigo: arcos alrededor de la cabeza de Kiriku
  function latigo(g, t, pK) {
    const k = campana(t, T.gira3a - 0.02, T.gira3b + 0.18); if (k <= 0.01) return;
    const c = { x: pK.x, y: 175 };
    g.save(); g.globalAlpha = k * 0.85; g.strokeStyle = "#ffffff"; g.lineWidth = 2.6; g.lineCap = "round";
    for (let i = 0; i < 3; i++) { g.beginPath(); g.ellipse(c.x, c.y + i * 26, 58 + i * 6, 10, 0, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); }
    g.restore();
  }
  // rayitas de movimiento del móvil volando
  function movilVolando(g, t) {
    if (t < T.golpe || t >= T.plof) return;
    const v = vueloMovil(t);
    if (v.u > 0.9) return;                      // los últimos fotogramas ya entra en la copa (se pinta con ella)
    for (let i = 1; i <= 3; i++) {             // estela
      const w = vueloMovil(t - i * 0.025);
      g.save(); g.globalAlpha = 0.18 / i; g.translate(w.x, w.y); g.rotate(w.ang); dibMovil(g, 0, 0); g.restore();
    }
    g.save(); g.translate(v.x, v.y); g.rotate(v.ang); dibMovil(g, 0, 0); g.restore();
    // arcos de giro
    g.save(); g.strokeStyle = "rgba(255,255,255,0.8)"; g.lineWidth = 2; g.lineCap = "round";
    g.beginPath(); g.arc(v.x, v.y, 22, v.ang + 0.6, v.ang + 1.8); g.stroke(); g.beginPath(); g.arc(v.x, v.y, 22, v.ang + 3.7, v.ang + 4.9); g.stroke();
    g.restore();
  }
  // pedorreta: gotitas de saliva y rayitas que salen de la boca
  function pedorreta(g, t, pG) {
    const u = t - T.click3; if (u < -0.02 || u > 0.4) return;
    const b = G.aPantalla(pG, G.cabeza(pG).a({ x: 830, y: 760 }));
    g.save(); g.lineCap = "round";
    for (let i = 0; i < 7; i++) {
      const tt = u - 0.015 * i; if (tt <= 0) continue;
      const a = -0.5 + (hash(i + 70) - 0.5) * 1.3, v = 110 + 70 * hash(i + 80);
      const x = b.x + Math.cos(a) * v * tt, y = b.y + Math.sin(a) * v * tt + 260 * tt * tt;
      g.globalAlpha = clamp(1 - tt / 0.35); g.fillStyle = "#e9f7ff"; g.strokeStyle = "rgba(40,70,100,0.8)"; g.lineWidth = 0.8;
      g.beginPath(); g.arc(x, y, 1.6 + hash(i) * 1.2, 0, Math.PI * 2); g.fill(); g.stroke();
    }
    const k = fase(u, 0, 0.25);
    if (k > 0 && k < 1) { g.globalAlpha = 1 - k; g.strokeStyle = "#ffffff"; g.lineWidth = 2;
      for (let i = -1; i <= 1; i++) { const a = -0.35 + i * 0.35, r0 = 8 + 10 * k; g.beginPath(); g.moveTo(b.x + Math.cos(a) * r0, b.y + Math.sin(a) * r0); g.lineTo(b.x + Math.cos(a) * (r0 + 8), b.y + Math.sin(a) * (r0 + 8)); g.stroke(); } }
    g.restore();
  }
  // ¡plof!: corona de bebida y gotas
  function salpicon(g, t) {
    const u = t - T.plof; if (u < 0 || u > 1.6) return;
    g.save();
    // corona
    const k = fase(u, 0, 0.32);
    if (k < 1) {
      g.globalAlpha = 1 - k * k; g.fillStyle = "#ff7d8a"; g.strokeStyle = TINTA; g.lineWidth = 1.2;
      for (let i = 0; i < 7; i++) { const a = -Math.PI + (i + 0.5) * Math.PI / 7, h = 18 * Math.sin(Math.PI * k) * (0.7 + 0.5 * hash(i + 4));
        const x = GX + Math.cos(a) * 15, y = COPA.yr - 1; g.beginPath(); g.moveTo(x - 2.4, y); g.quadraticCurveTo(x + Math.cos(a) * 4, y - h, x + Math.cos(a) * 6, y - h - 3); g.quadraticCurveTo(x + 1, y - h * 0.5, x + 2.4, y); g.closePath(); g.fill(); g.stroke(); }
    }
    g.globalAlpha = 1;
    // gotas balísticas
    for (let i = 0; i < 12; i++) {
      const vx = (hash(i * 3 + 1) - 0.5) * 230, vy = -120 - 170 * hash(i * 3 + 2), tt = u - 0.02 * hash(i);
      if (tt <= 0) continue;
      const x = GX + vx * tt, y = COPA.yr - 4 + vy * tt + 600 * tt * tt;
      if (y > (Math.abs(x - GX) < 50 ? TY : 556)) continue;
      const r = 1.8 + 2 * hash(i * 3 + 3);
      g.fillStyle = "#ff7d8a"; g.strokeStyle = TINTA; g.lineWidth = 0.9; g.beginPath(); g.ellipse(x, y, r, r * 1.25, Math.atan2(vy + 1200 * tt, vx) + Math.PI / 2, 0, Math.PI * 2); g.fill(); g.stroke();
    }
    g.restore();
  }
  // charquito en la mesa y gotas que resbalan por la copa
  function charco(g, t) {
    const k = tramo(t, T.plof + 0.05, T.plof + 0.6); if (k <= 0) return;
    g.save();
    g.fillStyle = "rgba(255,110,140,0.55)"; g.beginPath(); g.ellipse(GX + 14, TY + 1, 20 * k, 3.2 * k, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "rgba(255,255,255,0.6)"; g.beginPath(); g.ellipse(GX + 9, TY, 5 * k, 1 * k, 0, 0, Math.PI * 2); g.fill();
    // regueros por el cristal
    for (const [dx, d0] of [[14, 0.05], [-12, 0.2], [6, 0.35]]) {
      const kk = tramo(t, T.plof + d0, T.plof + d0 + 0.9);
      if (kk <= 0) continue;
      const x = GX + dx, y0 = COPA.yr + 4, y1 = y0 + (COPA.cy + COPA.ry - y0) * kk;
      g.strokeStyle = "rgba(255,110,140,0.75)"; g.lineWidth = 2.2; g.lineCap = "round"; g.beginPath(); g.moveTo(x, y0); g.quadraticCurveTo(x + dx * 0.15, (y0 + y1) / 2, x + dx * 0.1, y1); g.stroke();
      g.fillStyle = "rgba(255,110,140,0.9)"; g.beginPath(); g.arc(x + dx * 0.1, y1, 2.2, 0, Math.PI * 2); g.fill();
    }
    g.restore();
  }
  // gotas que caen del móvil pescado
  function goteo(g, t, pK) {
    if (t < T.pesca1 + 0.05) return;
    g.save(); g.fillStyle = "#ff8a9a"; g.strokeStyle = TINTA; g.lineWidth = 0.8;
    const n = Math.floor((t - T.pesca1) / 0.17);
    for (let i = Math.max(0, n - 4); i <= n; i++) {
      const ts = T.pesca1 + 0.05 + i * 0.17 + 0.05 * hash(i); if (t < ts) continue;
      const q = cache("gota" + i, () => bajoMovil(poseK(ts), ts));
      const tt = t - ts, x = q.x, y = q.y + 30 * tt + 520 * tt * tt;
      const suelo = Math.abs(x - GX) < 18 && q.y < COPA.yl ? COPA.yl : (Math.abs(x - GX) < 50 && q.y < TY ? TY : 556);
      if (y > suelo) { const k = fase(tt, (Math.sqrt(30 * 30 + 4 * 520 * (suelo - q.y)) - 30) / 1040, 0.4 + (suelo - q.y) / 600); if (k < 1) { g.globalAlpha = 1 - k; g.beginPath(); g.ellipse(x, suelo, 3 + 4 * k, 1 + k, 0, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1; } continue; }
      const r = 2.2;
      g.beginPath(); g.moveTo(x, y - r * 2); g.quadraticCurveTo(x + r, y, x, y + r); g.quadraticCurveTo(x - r, y, x, y - r * 2); g.fill(); g.stroke();
    }
    g.restore();
  }
  // móvil colgando de los dedos de Kiriku (pantalla)
  function colgando(pK, t) {
    const pz = puntoMano(KI, pK, pK.manoLejos, PINZA);
    const u = t - T.pesca1, bal = 0.35 * Math.sin(u * 6.2) * Math.exp(-u * 1.4) + 0.05 * Math.sin(t * 2.3);
    const ang = Math.PI / 2 + bal;                 // eje largo hacia abajo
    const c = { x: pz.x + Math.cos(ang) * (MOV_H / 2 - 2), y: pz.y + Math.sin(ang) * (MOV_H / 2 - 2) };
    return { pz, c, ang: ang + Math.PI };          // la parte de arriba (cámara) en la pinza
  }
  function bajoMovil(pK, t) { const m = colgando(pK, t); return { x: m.c.x + Math.cos(m.ang + Math.PI) * (MOV_H / 2), y: m.c.y + Math.sin(m.ang + Math.PI) * (MOV_H / 2) }; }
  // chispazo final del móvil mojado
  function chispazo(g, t, pK) {
    const u = t - T.chispa; if (u < -0.02 || u > 0.7) return;
    const m = colgando(pK, t), s = { x: m.c.x - 9, y: m.c.y };
    const fl = Math.max(0, campana(u, 0, 0.06) * 0.5, campana(u, 0.1, 0.15) * 0.35, campana(u, 0.22, 0.26) * 0.25);
    g.save();
    if (fl > 0.01) { const gr = g.createRadialGradient(s.x, s.y, 1, s.x, s.y, 26); gr.addColorStop(0, `rgba(255,255,240,${fl})`); gr.addColorStop(1, "rgba(255,255,240,0)"); g.fillStyle = gr; g.beginPath(); g.arc(s.x, s.y, 26, 0, Math.PI * 2); g.fill(); }
    for (let i = 0; i < 6; i++) {
      const tt = u - 0.03 * i; if (tt <= 0 || tt > 0.4) continue;
      const a = -Math.PI / 2 + (hash(i + 30) - 0.5) * 2.4, v = 90 + 60 * hash(i + 40);
      const x = m.c.x + Math.cos(a) * v * tt, y = m.c.y + Math.sin(a) * v * tt + 300 * tt * tt;
      g.fillStyle = i % 2 ? "#fff3a0" : "#ffd23e"; g.globalAlpha = 1 - tt / 0.4; g.beginPath(); g.arc(x, y, 1.6, 0, Math.PI * 2); g.fill();
    }
    g.globalAlpha = 1;
    // humito
    const hk = fase(u, 0.15, 0.7);
    if (hk > 0 && hk < 1) { g.fillStyle = `rgba(200,200,210,${0.5 * (1 - hk)})`; for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(m.c.x + 4 + i * 4, m.c.y - 10 - hk * 26 - i * 6, 3 + hk * 5, 0, Math.PI * 2); g.fill(); } }
    g.restore();
  }
  // palo que cae al suelo
  function paloCaido(g, t, pK) {
    if (t < T.suelta) return;
    const p0 = cache("palo0", () => { const pk = poseK(T.suelta); return { c: puno(pk, KI, pk.manoLejos), a: pk.palo.ang }; });
    const yS = 553, L = PALO_L + 7;
    const punta0 = { x: p0.c.x + Math.cos(p0.a) * L, y: p0.c.y + Math.sin(p0.a) * L };
    const tc = T.suelta + 0.1, caida = Math.max(0, yS - punta0.y);
    let a = p0.a, dy = 0;
    if (t < tc) dy = caida * entrada(fase(t, T.suelta, tc));
    else {
      dy = caida;
      const aF = Math.PI - 0.05, u = fase(t, tc, T.paloSuelo);
      a = lerp(p0.a, aF, entrada(u));
      if (t >= T.paloSuelo) { const v = t - T.paloSuelo; a = aF - 0.1 * Math.abs(Math.sin(v * 15)) * Math.exp(-v * 8); }
    }
    const punta = { x: punta0.x, y: punta0.y + dy };
    const c = { x: punta.x - Math.cos(a) * L, y: punta.y - Math.sin(a) * L };
    g.save(); g.translate(c.x, c.y); g.rotate(a); dibPalo(g, false, 0, 1); g.restore();
    const k = fase(t, T.paloSuelo, T.paloSuelo + 0.3);
    if (k > 0 && k < 1) { g.save(); g.globalAlpha = 1 - k; g.strokeStyle = "#6b5a60"; g.lineWidth = 1.8; g.lineCap = "round";
      for (const dx of [10, 50, 90]) for (const sg of [-1, 1]) { g.beginPath(); g.moveTo(punta.x + dx + sg * 6, yS - 8); g.lineTo(punta.x + dx + sg * (10 + 8 * k), yS - 14 - 6 * k); g.stroke(); }
      g.restore(); }
  }
  // polvo al aterrizar
  function polvo(g, t, x, y, t0) {
    const k = fase(t, t0, t0 + 0.45); if (k <= 0 || k >= 1) return;
    g.save(); g.fillStyle = `rgba(230,215,200,${0.75 * (1 - k)})`;
    for (let i = 0; i < 5; i++) { const s = i % 2 ? 1 : -1, d = 14 + 30 * salida(k) * (0.6 + 0.4 * hash(i)); g.beginPath(); g.arc(x + s * d, y - 4 - 6 * k * hash(i + 2), 5 + 6 * k, 0, Math.PI * 2); g.fill(); }
    g.restore();
  }
  // pétalos que caen del muro
  function petalos(g, t) {
    g.save();
    for (let i = 0; i < 5; i++) {
      const per = 4.5 + 1.5 * hash(i), ph = ((t + i * 2.1) % per) / per, x0 = 60 + 150 * i + 40 * hash(i + 8);
      const x = x0 + 26 * Math.sin(ph * 8 + i) + ph * 20, y = 60 + ph * 420;
      g.globalAlpha = Math.sin(Math.PI * ph) * 0.9; g.fillStyle = i % 2 ? "#f7b8c6" : "#fff0f2";
      g.save(); g.translate(x, y); g.rotate(ph * 9 + i); g.scale(1, 0.4 + 0.6 * Math.abs(Math.sin(ph * 7 + i))); g.beginPath(); g.ellipse(0, 0, 4, 2.6, 0, 0, Math.PI * 2); g.fill(); g.restore();
    }
    g.restore();
  }

  /* ---------- cámara ---------- */
  const PLANOS = [[0, 1.0, 512, 300], [1.5, 1.0, 512, 300], [2.0, 1.08, 548, 292], [7.5, 1.08, 548, 292], [7.95, 1.0, 512, 286], [9.0, 1.0, 512, 286], [9.6, 1.0, 512, 300],
    [11.9, 1.0, 512, 300], [12.6, 1.12, 640, 292], [DUR, 1.14, 646, 292]];
  function camara(t) {
    let i = 0; while (i < PLANOS.length - 2 && t > PLANOS[i + 1][0]) i++;
    const a = PLANOS[i], b = PLANOS[i + 1], k = suave(fase(t, a[0], b[0]));
    const kk = lerp(a[1], b[1], k), x = lerp(a[2], b[2], k), y = lerp(a[3], b[3], k);
    const mx = W / 2 / kk, my = H / 2 / kk;
    const tem = campana(t, T.golpe, T.golpe + 0.2) * 1.2 + campana(t, T.plof, T.plof + 0.2) * 0.8;
    return { k: kk, x: clamp(x, mx - 50, W + 50 - mx) + tem * ruido(t * 31), y: clamp(y, my - 60, H + 60 - my) + tem * ruido(t * 29 + 3) };
  }

  /* ---------- dibujo de un personaje con el giro aplastado ---------- */
  function dibuja(g, Rg, p, t) {
    if (p.giroX < 0.999) { g.save(); g.translate(p.x, 0); g.scale(p.giroX, 1); g.translate(-p.x, 0); Rg.dibujar(g, p, t); g.restore(); }
    else Rg.dibujar(g, p, t);
  }
  function sombra(g, x, y, rx, k) { g.save(); g.fillStyle = `rgba(80,50,50,${0.25 * k})`; g.beginPath(); g.ellipse(x, y, rx, 7, 0, 0, Math.PI * 2); g.fill(); g.restore(); }

  const pose = t => ({ g: poseG(t), k: poseK(t) });
  class GuillermoKirikuPostureo extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !KI.listo()) return;
      if (!fondo) fondo = creaFondo();
      const pG = poseG(t), pK = poseK(t);
      const luz = tramo(t, NEGRO_INICIO, 0.75, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t);
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      MATRIZ = g.getTransform();
      g.drawImage(fondo, -60, -70);
      petalos(g, t);
      // copa (detrás de todo lo de delante) con el móvil dentro
      copaAtras(g, t);
      const enCopa = (t >= T.golpe && vueloMovil(t).u > 0.9 && t < T.plof) || (t >= T.plof && t < T.pesca1);
      if (enCopa) {
        const m = t < T.plof ? vueloMovil(t) : movilEnCopa(t);
        g.save(); g.beginPath(); g.rect(GX - 40, 0, 80, COPA.yr + 2); g.ellipse(GX, COPA.cy, COPA.rx - 1, COPA.ry - 1, 0, 0, Math.PI * 2); g.clip();
        g.translate(m.x, m.y); g.rotate(m.ang); dibMovil(g, 0, 0); g.restore();
        // la bebida tapa lo que queda dentro
        g.save(); g.beginPath(); g.ellipse(GX, COPA.cy, COPA.rx - 1.2, COPA.ry - 1.2, 0, 0, Math.PI * 2); g.clip();
        g.fillStyle = "rgba(255,95,126,0.78)"; g.fillRect(GX - 20, COPA.yl - olaCopa(t).sube, 40, 60); g.restore();
      }
      copaDelante(g, t);
      charco(g, t);
      // sombras
      sombra(g, pG.x, SUELO_G + 2, 40 * (1 - 0.4 * altoSalto(t) / 146), 1 - 0.5 * altoSalto(t) / 146);
      sombra(g, pK.x, SUELO_K + 2, 44, 1);
      // Guillermo (detrás) y Kiriku
      pG.capaCabeza = gg => capaG(gg, t, pG);
      pK.capaCabeza = gg => { morritos(gg, morroK(t)); };
      // el palo (y el móvil) en el puño de Kiriku
      const fl = flashK(t);
      if (!pK.palo.suelto) {
        const m = pK.manoLejos, ang = pK.palo.ang, esp = pK.espejo;
        m.objeto = gg => {
          gg.save(); gg.rotate(-(m.ang || 0)); gg.scale(1 / (KI.JK * kK), 1 / (KI.JK * kK));
          gg.rotate(ang);
          dibPalo(gg, pK.palo.movil, fl, 1); gg.restore();
        };
      } else if (t >= T.pesca1) {
        const mm = pK.manoLejos;
        mm.objeto = gg => { if (!MATRIZ) return; const c = colgando(pK, t); gg.save(); gg.setTransform(MATRIZ); gg.translate(c.c.x, c.c.y); gg.rotate(c.ang); dibMovil(gg, chispaK(t), 1); gg.restore(); };
      }
      dibuja(g, G, pG, t);
      dibuja(g, KI, pK, t);
      paloCaido(g, t, pK);
      movilVolando(g, t);
      salpicon(g, t);
      goteo(g, t, pK);
      flash(g, t, pK);
      golpeFx(g, t);
      latigo(g, t, pK);
      notas(g, t, pG);
      pedorreta(g, t, pG);
      chispazo(g, t, pK);
      polvo(g, t, xG(T.aterriza), SUELO_G, T.aterriza);
      // brillos de postureo
      const br = campana(t, T.click1 - 0.1, T.click1 + 0.35) + campana(t, T.jersey1, T.jersey1 + 0.45) + campana(t, T.final1, T.final1 + 0.45);
      if (br > 0.01) { const c = KI.aPantalla(pK, KI.cabeza(pK).a({ x: 990, y: 300 })); destello(g, c.x, c.y, 9, br, t * 3); }
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  function morroK(t) { return Math.max(tramo(t, T.pato0, T.pato1) * (1 - tramo(t, T.sosp1, T.sosp1 + 0.1)), tramo(t, T.sube1 - 0.05, T.patoF) * (1 - tramo(t, T.chispa + 0.2, T.chispa + 0.32))); }
  function chispaK(t) { const u = t - T.chispa; return Math.max(0, campana(u, 0, 0.06) * 0.6, campana(u, 0.1, 0.15) * 0.4); }
  registrar({ id: "00082", nombre: "Guillermo y Kiriku · El postureo", crear: () => new GuillermoKirikuPostureo() });
  window.__A2D_00082 = { pose, poseG, poseK, T, DUR };
})();
