"use strict";
/* 00056 · Guillermo y Dari · La pizza
 *
 * Negro → pizzería de noche: horno de leña encendido, baldas con aceite y tomates, guirnalda de
 * bombillas, pizarra con dibujos, ventana con luna, una columna de mármol y la barra al fondo. En la
 * mesita alta, una pizza recién hecha entre los dos. Se relamen, se miran de reojo → cogen una porción
 * a la vez y tiran: entre las dos puntas sale un hilo de queso → se miran, nadie suelta, y echan a
 * andar hacia atrás cada uno por su lado; el hilo se estira y se estira por toda la pizzería (la
 * cámara se abre). Dari se da con la espalda en la columna, la rodea por delante y el hilo se le queda
 * enganchado → desde las dos puntas del local intentan cortarlo a mordiscos; el queso aguanta, se
 * suelta de la columna (deja su mancha) y, como una goma, los arrastra por la boca hasta juntarlos
 * cara a cara; las porciones caen al suelo y el hilo les da tres vueltas, con los brazos pegados →
 * pausa: se miran → los dos sorben el hilo desde cada punta hasta que se tocan las narices; a Dari se
 * le empañan las gafas, los dos se ponen colorados → negro.
 *
 * Sin textos. Todo depende del tiempo absoluto `t`.
 */
(() => {
  const { clamp, lerp, fase, suave, suave5, salida, entrada, rebote, tramo, campana, ruido, hash } = M2;
  const G = Guillermo, Da = Dari;
  const S = 0.30, SUELO = 560;
  const DUR = 14.2;
  const T = {
    hambre: 0.3, relame: 0.7, relame1: 1.1, ojeada: 1.12, ojeada1: 1.5,
    alarga: 1.55, toma: 1.92, sube: 2.3,
    tira: 2.25, tira1: 2.85, miraHilo: 2.35, miraOtro: 2.8,
    anda0: 3.05, choque: 4.3, rodea0: 4.5, engancha: 5.6, rodea1: 5.75, anda1: 6.45,
    miraLargo: 6.55, miraOtroL: 6.95,
    muerde0: 7.15, muerde: 7.42, mastica1: 8.02,
    tiron: 8.08, suelta: 8.2, vuela0: 8.22, vuela1: 8.78,
    envuelve0: 8.72, envuelve1: 9.3,
    miran: 9.45, come0: 10.0, come1: 11.85,
    boop: 11.85, empana: 11.9, empana1: 12.6, sonrisa: 12.55,
    fin: 13.45
  };

  /* ---------- utilidades ---------- */
  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n], k); return o; };
  function linea(guion, estados, ini, t) {
    let c = estados[ini];
    for (const [t0, t1, nom, f] of guion) { if (t <= t0) break; c = mezclaE(c, estados[nom], (f || suave)(fase(t, t0, t1))); }
    return Object.assign({}, c);
  }
  const D = (pu, ix, md, re) => ({ pulgar: pu, indice: ix, medio: md, anular: re, menique: re });
  const DD = (a, b, k) => ({ pulgar: lerp(a.pulgar, b.pulgar, k), indice: lerp(a.indice, b.indice, k), medio: lerp(a.medio, b.medio, k),
    anular: lerp(a.anular, b.anular, k), menique: lerp(a.menique, b.menique, k) });
  const R_M = G.MUNECA_R * G.JK;
  const punoDesde = (m, mu) => ({ x: m.x - Math.cos(mu) * R_M, y: m.y - Math.sin(mu) * R_M });
  const BOLS_G = { c: punoDesde({ x: 131, y: 652 }, -1.75), l: punoDesde({ x: 372, y: 648 }, -1.75) };
  const parpadeo = (t, lista, d = 0.14) => { let o = 0; for (const tb of lista) { const k = fase(t, tb, tb + d); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); } return o; };
  const memo = new Map();
  const cache = (k, f) => { if (!memo.has(k)) memo.set(k, f()); return memo.get(k); };
  const rota = (q, a) => { const c = Math.cos(a), s = Math.sin(a); return { x: q.x * c - q.y * s, y: q.x * s + q.y * c }; };
  const TINTA = "#140b07";
  const GRAV = 1500;
  let MATRIZ = null;

  function pista(lista, t, resuelve) {
    let c = resuelve(lista[0][2]);
    for (let i = 1; i < lista.length; i++) {
      const [t0, t1, obj, f] = lista[i];
      if (t <= t0) break;
      const k = (f || suave)(fase(t, t0, t1)), d = resuelve(obj);
      c = { x: lerp(c.x, d.x, k), y: lerp(c.y, d.y, k), mu: lerp(c.mu, d.mu, k), ang: lerp(c.ang, d.ang, k), puno: lerp(c.puno, d.puno, k),
        dedos: DD(c.dedos, d.dedos, k) };
    }
    return c;
  }
  // trayectoria por claves [t, x, v] (Hermite cúbica: posición y velocidad continuas)
  function camino(claves, t) {
    if (t <= claves[0][0]) return claves[0][1];
    for (let i = 0; i < claves.length - 1; i++) {
      const [t0, x0, v0] = claves[i], [t1, x1, v1] = claves[i + 1];
      if (t <= t1) {
        const h = t1 - t0, u = (t - t0) / h, u2 = u * u, u3 = u2 * u;
        return (2 * u3 - 3 * u2 + 1) * x0 + (u3 - 2 * u2 + u) * h * v0 + (-2 * u3 + 3 * u2) * x1 + (u3 - u2) * h * v1;
      }
    }
    return claves[claves.length - 1][1];
  }
  // pasos alternos: listas [t0, t1, x] de cada tobillo (x de pantalla)
  function pasos(xc, off, tramos, primero) {
    const t0 = tramos[0][0];
    const L = { cerca: [[-9, -9, xc(t0) + off.cerca]], lejos: [[-9, -9, xc(t0) + off.lejos]] };
    let lado = primero;
    for (const [a0, a1, n, alto] of tramos) {
      const dt = (a1 - a0) / n;
      for (let i = 0; i < n; i++) {
        const a = a0 + i * dt, b = a + dt * 1.02;
        const tx = i >= n - 2 ? a1 : b + dt * 0.5;
        L[lado].push([a, b, xc(tx) + off[lado], alto]);
        lado = lado === "cerca" ? "lejos" : "cerca";
      }
    }
    return L;
  }
  function pie(lista, t) {
    let i = 0; while (i + 1 < lista.length && t >= lista[i + 1][0]) i++;
    const [t0, t1, x, h] = lista[i], xa = i > 0 ? lista[i - 1][2] : x, u = fase(t, t0, t1);
    return { x: lerp(xa, x, suave5(u)), alza: (h || 0) * Math.sin(Math.PI * u), u };
  }

  /* ---------- caras ---------- */
  const BASE = { mx: 0.85, my: 0, c: 0, wd: 0, wi: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, orig: 0, abre: 0, ancho: 1, sonr: 0.2,
    dientes: 1, lengua: 0, mof: 0, rub: 0, esp: 0 };
  const E = o => Object.assign({}, BASE, o);
  function cara(e, extraC) {
    const c = clamp(e.c + extraC);
    return { mirada: { x: e.mx, y: e.my }, iris: e.iris, espiral: e.esp, ojos: { d: clamp(c + e.wd), i: clamp(c + e.wi), feliz: e.h, apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: e.orig, abre: e.abre, ancho: e.ancho, sonrisa: e.sonr, dientes: e.dientes > 0.5, lengua: e.lengua },
      mofletes: e.mof, rubor: e.rub, bigote: 0 };
  }

  /* ================= pizza y porciones ================= */
  const MESA = { x: 512, y: 324, rx: 88, ry: 24 };
  const PIZZA = { x: 512, y: 318, R: 54, sq: 0.34 };
  const ALFA = Math.PI / 8;                          // media porción (8 porciones)
  const COL = { x: 905, r: 30 };
  // punto de una porción en su marco: punta en (R, 0), corteza en x ≈ 0; r = distancia a la punta
  const enPorcion = (r, f, R, sq) => ({ x: R - r * Math.cos(f), y: r * Math.sin(f) * sq });
  // dibuja una porción con el centro de la corteza en (x, y), la punta hacia `ang`, aplastada `sq` y con la punta caída `cae`
  function porcion(g, x, y, ang, sq, cae, R = PIZZA.R) {
    const c = Math.cos(ang), s = Math.sin(ang);
    const P = (r, f) => { const q = enPorcion(r, f, R, sq), u = 1 - r / R; return { x: x + q.x * c - q.y * s, y: y + q.x * s + q.y * c + cae * u * u }; };
    const forma = (r1) => { const a = P(r1, -ALFA); g.moveTo(a.x, a.y); for (let i = 1; i <= 8; i++) { const q = P(r1, -ALFA + 2 * ALFA * i / 8); g.lineTo(q.x, q.y); }
      const tp = P(0, 0); g.lineTo(tp.x, tp.y); g.closePath(); };
    g.save(); g.lineJoin = "round";
    g.beginPath(); forma(R); g.fillStyle = "#d48a3a"; g.fill();
    g.beginPath(); forma(R * 0.84); g.fillStyle = "#f6c449"; g.fill();
    // tomate asomando y pepperoni
    g.fillStyle = "rgba(214,72,40,0.55)"; for (const [r, f, a] of [[0.62, 0.18, 2.2], [0.4, -0.2, 1.8], [0.2, 0.1, 1.4]]) { const q = P(r * R, f); g.beginPath(); g.ellipse(q.x, q.y, a, a * Math.max(0.35, sq), ang, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = "#b8352a";
    for (const [r, f, a] of [[0.6, -0.16, 5.6], [0.34, 0.14, 4.6]]) { const q = P(r * R, f); g.beginPath(); g.ellipse(q.x, q.y, a, a * Math.max(0.35, sq), ang, 0, Math.PI * 2); g.fill();
      g.fillStyle = "rgba(255,200,160,0.45)"; g.beginPath(); g.ellipse(q.x - 1.2, q.y - 0.8, a * 0.35, a * 0.2 * Math.max(0.35, sq), ang, 0, Math.PI * 2); g.fill(); g.fillStyle = "#b8352a"; }
    g.fillStyle = "#3f8a3a"; { const q = P(0.5 * R, 0.05); g.beginPath(); g.ellipse(q.x, q.y, 3.2, 1.6, ang + 0.6, 0, Math.PI * 2); g.fill(); }
    g.strokeStyle = "rgba(255,240,190,0.75)"; g.lineWidth = 1.2; g.beginPath(); { const a = P(0.78 * R, -0.12), b = P(0.25 * R, -0.02); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); } g.stroke();
    g.beginPath(); forma(R); g.strokeStyle = TINTA; g.lineWidth = 1.3; g.stroke();
    g.restore();
  }
  // pizza en la mesa: tabla de madera y ocho porciones (la 0 a la derecha, de Dari; la 4 a la izquierda, de Guillermo)
  function pizzaMesa(g, t) {
    const { x, y, R, sq } = PIZZA;
    g.save(); g.lineJoin = "round";
    g.fillStyle = "rgba(40,10,0,0.25)"; g.beginPath(); g.ellipse(x + 3, y + 4, R + 12, (R + 12) * sq, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#a8743f"; g.beginPath(); g.ellipse(x, y + 2.5, R + 10, (R + 10) * sq, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#c9925a"; g.beginPath(); g.ellipse(x, y, R + 10, (R + 10) * sq, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = TINTA; g.lineWidth = 1.3; g.stroke();
    // mango de la tabla hacia el fondo
    g.fillStyle = "#b47c45"; g.beginPath(); g.ellipse(x + 30, y - (R + 13) * sq, 9, 4, -0.3, 0, Math.PI * 2); g.fill(); g.stroke();
    const quita = t >= T.toma;
    // las porciones 0 y 4 (las de ellos) se dibujan aparte con porcion(), igual que en la mano
    for (let i = 0; i < 8; i++) {
      if (i === 0 || i === 4) continue;
      const th = i * Math.PI / 4;
      g.save(); g.beginPath();
      g.moveTo(x, y); for (let j = 0; j <= 6; j++) { const f = th - ALFA + 2 * ALFA * j / 6; g.lineTo(x + R * Math.cos(f), y + R * Math.sin(f) * sq); } g.closePath();
      g.fillStyle = "#d48a3a"; g.fill();
      g.beginPath(); g.moveTo(x, y); for (let j = 0; j <= 6; j++) { const f = th - ALFA + 2 * ALFA * j / 6; g.lineTo(x + 0.84 * R * Math.cos(f), y + 0.84 * R * Math.sin(f) * sq); } g.closePath();
      g.fillStyle = "#f6c449"; g.fill();
      g.fillStyle = "#b8352a";
      for (const [r, f, a] of [[0.6, -0.16, 5.4], [0.34, 0.14, 4.4]]) { const fx = th + f, q = { x: x + r * R * Math.cos(fx), y: y + r * R * Math.sin(fx) * sq }; g.beginPath(); g.ellipse(q.x, q.y, a, a * sq, 0, 0, Math.PI * 2); g.fill(); }
      g.fillStyle = "#3f8a3a"; { const fx = th + 0.08, q = { x: x + 0.5 * R * Math.cos(fx), y: y + 0.5 * R * Math.sin(fx) * sq }; g.beginPath(); g.ellipse(q.x, q.y, 3, 1.3, 0.5, 0, Math.PI * 2); g.fill(); }
      g.beginPath(); g.moveTo(x, y); for (let j = 0; j <= 6; j++) { const f = th - ALFA + 2 * ALFA * j / 6; g.lineTo(x + R * Math.cos(f), y + R * Math.sin(f) * sq); } g.closePath();
      g.strokeStyle = "rgba(20,11,7,0.75)"; g.lineWidth = 1; g.stroke();
      g.restore();
    }
    // huecos: migas y tomate en la tabla
    if (quita) {
      g.fillStyle = "rgba(200,70,40,0.5)";
      for (const s of [-1, 1]) { g.beginPath(); g.ellipse(x + s * R * 0.55, y + 1, 6, 2, 0, 0, Math.PI * 2); g.fill(); }
      g.fillStyle = "#e9b46a"; for (let i = 0; i < 6; i++) { const s = i % 2 ? 1 : -1; g.fillRect(x + s * (R * (0.3 + 0.5 * hash(i + 70))), y - 3 + 6 * hash(i + 71), 2, 1.5); }
    }
    g.restore();
  }

  /* ================= decorado: pizzería de noche (mundo más ancho que la pantalla) ================= */
  const X0 = -420, Y0 = -200, AN = 1880, AL = 1000;   // lienzo del fondo en coordenadas de mundo
  const YS0 = 466;                                     // pie de la pared del fondo
  let fondo = null;
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = AN; c.height = AL; const g = c.getContext("2d");
    g.translate(-X0, -Y0); g.lineJoin = "round"; g.lineCap = "round";
    const XA = X0, XB = X0 + AN, YA = Y0, YB = Y0 + AL;
    // pared de estuco cálido
    const pa = g.createLinearGradient(0, YA, 0, YS0); pa.addColorStop(0, "#7a3e22"); pa.addColorStop(0.35, "#c47a45"); pa.addColorStop(1, "#d99a5c");
    g.fillStyle = pa; g.fillRect(XA, YA, AN, YS0 - YA);
    for (let i = 0; i < 900; i++) { const x = XA + hash(i + 1) * AN, y = YA + hash(i + 2) * (YS0 - YA); g.fillStyle = hash(i + 3) > 0.5 ? "rgba(255,230,190,0.10)" : "rgba(90,40,15,0.10)"; g.beginPath(); g.ellipse(x, y, 6 + 14 * hash(i + 4), 3 + 6 * hash(i + 5), hash(i + 6) * 3, 0, Math.PI * 2); g.fill(); }
    // ladrillo visto donde se ha caído el estuco
    for (const [bx, by] of [[330, 40], [1210, 70], [-30, 120], [610, 330]]) ladrillos(g, bx, by);
    // techo con vigas
    g.fillStyle = "#3a1d0e"; g.fillRect(XA, YA, AN, 150);
    g.fillStyle = "#4e2913"; g.fillRect(XA, -64, AN, 14);
    for (let x = XA + 20; x < XB; x += 150) { g.fillStyle = "#2a1308"; g.fillRect(x, YA, 26, 150); g.fillStyle = "rgba(255,190,120,0.12)"; g.fillRect(x, YA, 4, 150); }
    g.fillStyle = "rgba(0,0,0,0.35)"; g.fillRect(XA, -50, AN, 10);
    // horno de leña a la izquierda
    horno(g, -120);
    // baldas con aceite, latas de tomate y frascos; ajos y guindillas colgando
    baldas(g, 225);
    // pizarra con dibujos (sin letras)
    pizarra(g, 512, 168);
    // ventana con luna
    ventana(g, 745, 190);
    // barra al fondo a la derecha con botellero
    barra(g, 1240);
    // cuadro del volcán
    cuadro(g, 1240, 140);
    // zócalo de azulejos verdes
    const ZOC = 372;
    g.fillStyle = "#4a2410"; g.fillRect(XA, ZOC - 8, AN, 10); g.fillStyle = "rgba(255,210,150,0.3)"; g.fillRect(XA, ZOC - 8, AN, 2);
    for (let x = XA, i = 0; x < XB; x += 22, i++) for (let y = ZOC + 2, j = 0; y < YS0; y += 22, j++) {
      const h = hash(i * 31 + j * 7); g.fillStyle = h > 0.85 ? "#2c6a54" : h > 0.4 ? "#33785f" : "#3c8569"; g.fillRect(x + 1, y + 1, 20, 20);
      g.fillStyle = "rgba(255,255,255,0.18)"; g.fillRect(x + 3, y + 3, 7, 2);
    }
    g.fillStyle = "#2a1408"; g.fillRect(XA, YS0 - 6, AN, 6);
    // suelo ajedrezado en perspectiva
    suelo(g, XA, XB, YB);
    // mesita alta con mantel de cuadros
    mesa(g);
    // columna de mármol (sobre la línea de los personajes)
    columna(g);
    // guirnalda de bombillas de lado a lado
    guirnalda(g, XA, XB);
    // viñeta
    const vi = g.createRadialGradient(512, 300, 380, 512, 300, 1250); vi.addColorStop(0, "rgba(0,0,0,0)"); vi.addColorStop(1, "rgba(15,5,0,0.55)");
    g.fillStyle = vi; g.fillRect(XA, YA, AN, AL);
    return c;
  }
  function ladrillos(g, x, y) {
    g.save(); g.beginPath(); g.ellipse(x, y, 70, 38, 0.1, 0, Math.PI * 2); g.clip();
    g.fillStyle = "#8c4a2c"; g.fillRect(x - 80, y - 50, 160, 100);
    for (let r = 0; r < 8; r++) for (let k = 0; k < 6; k++) { const bx = x - 80 + k * 30 + (r % 2) * 15, by = y - 50 + r * 13; g.fillStyle = hash(r * 9 + k + x) > 0.5 ? "#a3563a" : "#9a4e32"; g.fillRect(bx + 1.5, by + 1.5, 27, 10); }
    g.restore();
    g.strokeStyle = "rgba(255,225,190,0.35)"; g.lineWidth = 2; g.beginPath(); g.ellipse(x, y, 70, 38, 0.1, 0, Math.PI * 2); g.stroke();
  }
  function horno(g, x) {
    g.save();
    // base de piedra
    g.fillStyle = "#6b5a4c"; g.fillRect(x - 165, 320, 330, YS0 - 320);
    for (let r = 0; r < 6; r++) for (let k = 0; k < 9; k++) { const bx = x - 165 + k * 38 + (r % 2) * 19, by = 322 + r * 24; g.fillStyle = hash(r * 13 + k) > 0.5 ? "#7d6a5a" : "#5f4f42"; g.beginPath(); g.ellipse(bx, by + 11, 17, 10, 0, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = "#4a3a2e"; g.fillRect(x - 175, 312, 350, 12);
    // cúpula de ladrillo y chimenea
    g.fillStyle = "#7a3a22"; g.fillRect(x - 22, -200, 44, 120);
    g.beginPath(); g.moveTo(x - 160, 312); g.bezierCurveTo(x - 160, 120, x + 160, 120, x + 160, 312); g.closePath();
    const cu = g.createLinearGradient(x - 160, 0, x + 160, 0); cu.addColorStop(0, "#8f4528"); cu.addColorStop(0.5, "#b35e36"); cu.addColorStop(1, "#7d3a20");
    g.fillStyle = cu; g.fill();
    g.save(); g.clip();
    for (let r = 0; r < 12; r++) for (let k = 0; k < 14; k++) { const bx = x - 170 + k * 26 + (r % 2) * 13, by = 140 + r * 15; g.strokeStyle = "rgba(60,20,8,0.45)"; g.lineWidth = 1.5; g.strokeRect(bx, by, 26, 15); }
    g.restore();
    g.strokeStyle = TINTA; g.lineWidth = 3; g.beginPath(); g.moveTo(x - 160, 312); g.bezierCurveTo(x - 160, 120, x + 160, 120, x + 160, 312); g.stroke();
    // boca del horno con fuego
    const bo = g.createRadialGradient(x, 300, 6, x, 300, 70); bo.addColorStop(0, "#ffd35a"); bo.addColorStop(0.45, "#f07a1c"); bo.addColorStop(1, "#3a0d04");
    g.fillStyle = bo; g.beginPath(); g.moveTo(x - 62, 312); g.lineTo(x - 62, 262); g.quadraticCurveTo(x, 214, x + 62, 262); g.lineTo(x + 62, 312); g.closePath(); g.fill();
    g.fillStyle = "#2a1006"; for (const [a, b] of [[-30, 0.2], [10, -0.25], [-5, 0.05]]) { g.save(); g.translate(x + a, 306); g.rotate(b); g.fillRect(-26, -5, 52, 10); g.restore(); }
    g.strokeStyle = "#c97f46"; g.lineWidth = 9; g.beginPath(); g.moveTo(x - 66, 314); g.lineTo(x - 66, 260); g.quadraticCurveTo(x, 208, x + 66, 260); g.lineTo(x + 66, 314); g.stroke();
    g.strokeStyle = TINTA; g.lineWidth = 2.5; g.stroke();
    // resplandor en la pared y el suelo
    const re = g.createRadialGradient(x, 290, 40, x, 290, 420); re.addColorStop(0, "rgba(255,150,60,0.28)"); re.addColorStop(1, "rgba(255,120,40,0)");
    g.fillStyle = re; g.fillRect(x - 440, -40, 880, 760);
    // pala de pizza apoyada
    g.save(); g.translate(x + 200, 300); g.rotate(-0.12); g.fillStyle = "#c9925a"; g.fillRect(-4, -170, 8, 170); g.beginPath(); g.ellipse(0, 20, 30, 34, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = TINTA; g.lineWidth = 2; g.stroke(); g.strokeRect(-4, -170, 8, 160); g.restore();
    g.restore();
  }
  function baldas(g, x) {
    g.save();
    for (const [y, w] of [[200, 210], [282, 210]]) {
      g.fillStyle = "#5a2e14"; g.fillRect(x - w / 2, y, w, 10); g.fillStyle = "rgba(255,210,150,0.3)"; g.fillRect(x - w / 2, y, w, 2);
      g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(x - w / 2, y, w, 10);
      g.fillStyle = "#3a1d0e"; g.fillRect(x - w / 2 + 10, y + 10, 6, 14); g.fillRect(x + w / 2 - 16, y + 10, 6, 14);
    }
    // balda de arriba: aceite, frascos y una botella con funda de paja
    const obj = (y, lista) => { for (const [dx, tipo, k] of lista) objeto(g, x + dx, y, tipo, k); };
    obj(200, [[-88, "aceite", 0], [-60, "frasco", 1], [-34, "frasco", 2], [-6, "fiasco", 0], [26, "aceite", 1], [56, "lata", 0], [80, "lata", 1]]);
    obj(282, [[-86, "lata", 2], [-62, "lata", 0], [-36, "frasco", 0], [-10, "aceite", 2], [18, "fiasco", 1], [52, "frasco", 1], [82, "aceite", 0]]);
    // ristra de ajos y guindillas colgando
    g.strokeStyle = "#7a5a2a"; g.lineWidth = 2; g.beginPath(); g.moveTo(x + 125, 90); g.lineTo(x + 125, 220); g.moveTo(x - 125, 90); g.lineTo(x - 125, 200); g.stroke();
    for (let i = 0; i < 7; i++) { g.fillStyle = "#f2ead8"; g.beginPath(); g.ellipse(x + 125 + (i % 2 ? 6 : -6), 110 + i * 15, 8, 9, 0, 0, Math.PI * 2); g.fill(); g.strokeStyle = "rgba(120,90,60,0.8)"; g.lineWidth = 1; g.stroke(); }
    for (let i = 0; i < 8; i++) { g.fillStyle = i % 3 ? "#c5241c" : "#e0371f"; g.save(); g.translate(x - 125 + (i % 2 ? 5 : -5), 104 + i * 12); g.rotate(i % 2 ? 0.5 : -0.5); g.beginPath(); g.ellipse(0, 6, 3.2, 9, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = "#3f7a2a"; g.fillRect(-1, -4, 2, 4); g.restore(); }
    g.restore();
  }
  function objeto(g, x, y, tipo, k) {
    g.save(); g.translate(x, y); g.strokeStyle = TINTA; g.lineWidth = 1.5;
    if (tipo === "aceite") {
      g.fillStyle = ["#6f8f2a", "#8aa232", "#5b7a22"][k]; g.beginPath(); g.moveTo(-7, 0); g.lineTo(-7, -34); g.quadraticCurveTo(-7, -42, -3, -46); g.lineTo(-3, -56); g.lineTo(3, -56); g.lineTo(3, -46); g.quadraticCurveTo(7, -42, 7, -34); g.lineTo(7, 0); g.closePath(); g.fill(); g.stroke();
      g.fillStyle = "#f2e2b0"; g.fillRect(-6, -26, 12, 12); g.fillStyle = "rgba(255,255,255,0.4)"; g.fillRect(-5, -44, 2, 40);
    } else if (tipo === "frasco") {
      g.fillStyle = ["#d9452a", "#8a2a1a", "#c9a23a"][k]; g.fillRect(-9, -26, 18, 26); g.strokeRect(-9, -26, 18, 26);
      g.fillStyle = "#c0c0b8"; g.fillRect(-10, -31, 20, 6); g.strokeRect(-10, -31, 20, 6); g.fillStyle = "rgba(255,255,255,0.35)"; g.fillRect(-7, -23, 3, 20);
    } else if (tipo === "lata") {
      g.fillStyle = "#c9c4b8"; g.fillRect(-10, -24, 20, 24); g.strokeRect(-10, -24, 20, 24);
      g.fillStyle = ["#d12c1f", "#e04a24", "#b8241a"][k]; g.fillRect(-10, -19, 20, 13);
      g.fillStyle = "#3f8a3a"; g.beginPath(); g.ellipse(0, -12.5, 4, 3, 0, 0, Math.PI * 2); g.fill();
    } else {
      g.fillStyle = "#3a1a2a"; g.beginPath(); g.moveTo(-3, -58); g.lineTo(3, -58); g.lineTo(3, -36); g.lineTo(-3, -36); g.closePath(); g.fill(); g.stroke();
      g.fillStyle = "#d9b25a"; g.beginPath(); g.ellipse(0, -16, 12, 17, 0, 0, Math.PI * 2); g.fill(); g.stroke();
      g.strokeStyle = "rgba(120,80,20,0.6)"; g.lineWidth = 1; for (let i = -10; i <= 10; i += 4) { g.beginPath(); g.moveTo(i, -30); g.lineTo(i * 0.8, -2); g.stroke(); }
      g.fillStyle = k ? "#b0222a" : "#2a6a3a"; g.fillRect(-3, -40, 6, 6);
    }
    g.restore();
  }
  function pizarra(g, x, y) {
    g.save();
    g.fillStyle = "#5a3418"; g.fillRect(x - 86, y - 62, 172, 124); g.strokeStyle = TINTA; g.lineWidth = 2.5; g.strokeRect(x - 86, y - 62, 172, 124);
    g.fillStyle = "#26302a"; g.fillRect(x - 78, y - 54, 156, 108);
    g.strokeStyle = "rgba(240,240,225,0.8)"; g.lineWidth = 2.2;
    // pizza dibujada con tiza
    g.beginPath(); g.arc(x - 34, y - 6, 28, 0, Math.PI * 2); g.stroke();
    g.beginPath(); for (let i = 0; i < 4; i++) { const a = i * Math.PI / 4; g.moveTo(x - 34 - 28 * Math.cos(a), y - 6 - 28 * Math.sin(a)); g.lineTo(x - 34 + 28 * Math.cos(a), y - 6 + 28 * Math.sin(a)); } g.stroke();
    g.strokeStyle = "rgba(230,90,80,0.85)"; for (const [a, b] of [[-46, -14], [-24, 6], [-40, 10], [-22, -20]]) { g.beginPath(); g.arc(x + a, y + b, 4, 0, Math.PI * 2); g.stroke(); }
    // guindilla y hojita
    g.strokeStyle = "rgba(230,90,80,0.85)"; g.beginPath(); g.moveTo(x + 18, y - 30); g.quadraticCurveTo(x + 48, y - 26, x + 56, y + 2); g.quadraticCurveTo(x + 40, y - 14, x + 18, y - 22); g.closePath(); g.stroke();
    g.strokeStyle = "rgba(140,210,120,0.85)"; g.beginPath(); g.ellipse(x + 40, y + 28, 14, 7, -0.4, 0, Math.PI * 2); g.moveTo(x + 28, y + 34); g.lineTo(x + 52, y + 22); g.stroke();
    g.fillStyle = "rgba(255,255,255,0.05)"; g.fillRect(x - 70, y - 50, 60, 40);
    g.restore();
  }
  function ventana(g, x, y) {
    g.save();
    g.fillStyle = "#5a2e14"; g.beginPath(); g.moveTo(x - 82, y + 104); g.lineTo(x - 82, y - 40); g.arc(x, y - 40, 82, Math.PI, 0); g.lineTo(x + 82, y + 104); g.closePath(); g.fill();
    const n = g.createLinearGradient(0, y - 120, 0, y + 100); n.addColorStop(0, "#0b1430"); n.addColorStop(1, "#2a3a6a");
    g.fillStyle = n; g.beginPath(); g.moveTo(x - 70, y + 94); g.lineTo(x - 70, y - 40); g.arc(x, y - 40, 70, Math.PI, 0); g.lineTo(x + 70, y + 94); g.closePath(); g.fill();
    g.save(); g.clip();
    g.fillStyle = "#fffbe0"; for (let i = 0; i < 12; i++) { g.globalAlpha = 0.5 + 0.5 * hash(i + 80); g.fillRect(x - 66 + hash(i + 81) * 132, y - 100 + hash(i + 82) * 100, 1.6, 1.6); } g.globalAlpha = 1;
    const lu = g.createRadialGradient(x + 26, y - 56, 4, x + 26, y - 56, 46); lu.addColorStop(0, "rgba(255,250,220,0.5)"); lu.addColorStop(1, "rgba(255,250,220,0)");
    g.fillStyle = lu; g.beginPath(); g.arc(x + 26, y - 56, 46, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#fbf6dc"; g.beginPath(); g.arc(x + 26, y - 56, 18, 0, Math.PI * 2); g.fill();
    // tejados y una cúpula
    g.fillStyle = "#0a0f1e"; g.beginPath(); g.moveTo(x - 70, y + 100); g.lineTo(x - 70, y + 40); g.lineTo(x - 40, y + 24); g.lineTo(x - 12, y + 40); g.lineTo(x - 12, y + 30);
    g.arc(x + 18, y + 30, 30, Math.PI, 0); g.lineTo(x + 70, y + 30); g.lineTo(x + 70, y + 100); g.closePath(); g.fill();
    g.fillStyle = "#f6c95a"; for (const [a, b] of [[-54, 52], [-32, 64], [6, 56], [30, 70], [56, 52]]) g.fillRect(x + a, y + b, 5, 6);
    g.restore();
    g.strokeStyle = "#7a4a26"; g.lineWidth = 6; g.beginPath(); g.moveTo(x, y - 110); g.lineTo(x, y + 94); g.moveTo(x - 70, y + 10); g.lineTo(x + 70, y + 10); g.stroke();
    g.strokeStyle = TINTA; g.lineWidth = 3; g.beginPath(); g.moveTo(x - 82, y + 104); g.lineTo(x - 82, y - 40); g.arc(x, y - 40, 82, Math.PI, 0); g.lineTo(x + 82, y + 104); g.stroke();
    // maceta de albahaca en el alféizar
    g.fillStyle = "#6b3f1e"; g.fillRect(x - 96, y + 100, 192, 12); g.strokeRect(x - 96, y + 100, 192, 12);
    g.fillStyle = "#b5552e"; g.beginPath(); g.moveTo(x - 50, y + 100); g.lineTo(x - 46, y + 78); g.lineTo(x - 14, y + 78); g.lineTo(x - 10, y + 100); g.closePath(); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 2; g.stroke();
    g.fillStyle = "#3f8a3a"; for (let i = 0; i < 9; i++) { g.beginPath(); g.ellipse(x - 30 + (hash(i + 90) - 0.5) * 36, y + 72 - hash(i + 91) * 26, 7, 4, hash(i + 92) * 3, 0, Math.PI * 2); g.fill(); }
    g.restore();
  }
  function barra(g, x) {
    g.save();
    // botellero en la pared
    g.fillStyle = "#4a2410"; g.fillRect(x - 210, 196, 420, 10); g.fillRect(x - 210, 266, 420, 10);
    const cols = ["#2a5a2a", "#6a1a1a", "#c9a23a", "#2a3a6a", "#3a1a2a", "#7a8a3a"];
    for (const yb of [196, 266]) for (let i = 0; i < 15; i++) {
      const bx = x - 196 + i * 28, h = 40 + 12 * hash(i + yb), cl = cols[Math.floor(hash(i * 3 + yb) * cols.length)];
      g.fillStyle = cl; g.beginPath(); g.moveTo(bx - 7, yb); g.lineTo(bx - 7, yb - h + 16); g.quadraticCurveTo(bx - 7, yb - h + 6, bx - 2.5, yb - h + 2); g.lineTo(bx - 2.5, yb - h - 8); g.lineTo(bx + 2.5, yb - h - 8); g.lineTo(bx + 2.5, yb - h + 2); g.quadraticCurveTo(bx + 7, yb - h + 6, bx + 7, yb - h + 16); g.lineTo(bx + 7, yb); g.closePath(); g.fill();
      g.strokeStyle = TINTA; g.lineWidth = 1.2; g.stroke(); g.fillStyle = "rgba(255,255,255,0.3)"; g.fillRect(bx - 5, yb - h + 14, 2, h - 18);
    }
    // mostrador
    g.fillStyle = "#3a1a0a"; g.fillRect(x - 230, 384, 470, 12);
    g.fillStyle = "rgba(255,200,140,0.3)"; g.fillRect(x - 230, 384, 470, 2);
    const fr = g.createLinearGradient(0, 396, 0, YS0); fr.addColorStop(0, "#7a3e1a"); fr.addColorStop(1, "#5a2a10");
    g.fillStyle = fr; g.fillRect(x - 222, 396, 462, YS0 - 396);
    for (let i = 0; i < 6; i++) { g.strokeStyle = "rgba(30,10,2,0.5)"; g.lineWidth = 2.5; g.strokeRect(x - 214 + i * 77, 404, 66, YS0 - 414); }
    g.strokeStyle = TINTA; g.lineWidth = 2.5; g.strokeRect(x - 230, 384, 470, 12);
    // grifo de cerveza y cafetera
    g.fillStyle = "#c9c4b8"; g.fillRect(x - 120, 344, 8, 40); g.fillRect(x - 136, 340, 40, 8); g.fillStyle = "#d9a83a"; g.fillRect(x - 134, 322, 6, 18); g.fillRect(x - 104, 322, 6, 18);
    g.fillStyle = "#b8b8b0"; g.fillRect(x + 40, 330, 70, 54); g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(x + 40, 330, 70, 54);
    g.fillStyle = "#2a2a2a"; g.fillRect(x + 50, 360, 14, 12); g.fillRect(x + 84, 360, 14, 12); g.fillStyle = "#e8e0d0"; g.fillRect(x + 52, 374, 10, 8); g.fillRect(x + 86, 374, 10, 8);
    g.restore();
  }
  function cuadro(g, x, y) {
    g.save();
    g.fillStyle = "#b8862c"; g.fillRect(x - 64, y - 46, 128, 92); g.strokeStyle = TINTA; g.lineWidth = 2.5; g.strokeRect(x - 64, y - 46, 128, 92);
    const c = g.createLinearGradient(0, y - 38, 0, y + 38); c.addColorStop(0, "#f2b46a"); c.addColorStop(1, "#5aa0c8");
    g.fillStyle = c; g.fillRect(x - 56, y - 38, 112, 76);
    g.fillStyle = "#6a4a3a"; g.beginPath(); g.moveTo(x - 56, y + 20); g.lineTo(x - 18, y - 20); g.lineTo(x + 6, y - 20); g.lineTo(x + 48, y + 20); g.closePath(); g.fill();
    g.fillStyle = "rgba(240,240,240,0.8)"; g.beginPath(); g.ellipse(x - 4, y - 30, 14, 7, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#2a6aa0"; g.fillRect(x - 56, y + 20, 112, 18);
    g.restore();
  }
  function suelo(g, XA, XB, YB) {
    g.save();
    g.fillStyle = "#e8dcc4"; g.fillRect(XA, YS0, XB - XA, YB - YS0);
    // filas en perspectiva (punto de fuga en el centro, a la altura de los ojos)
    const VX = 512, VY = 120, filas = [];
    for (let i = 0, y = YS0; y < YB + 40; i++) { filas.push(y); y += 9 + i * 5.5; }
    const lin = (k, y) => VX + (k * 48) * (y - VY) / (YS0 - VY);
    for (let r = 0; r < filas.length - 1; r++) for (let k = -40; k < 40; k++) {
      if ((r + k) % 2 === 0) continue;
      const ya = filas[r], yb = filas[r + 1];
      g.fillStyle = "#2a2422"; g.beginPath(); g.moveTo(lin(k, ya), ya); g.lineTo(lin(k + 1, ya), ya); g.lineTo(lin(k + 1, yb), yb); g.lineTo(lin(k, yb), yb); g.closePath(); g.fill();
    }
    const sb = g.createLinearGradient(0, YS0, 0, YB); sb.addColorStop(0, "rgba(60,25,5,0.35)"); sb.addColorStop(1, "rgba(60,25,5,0.1)");
    g.fillStyle = sb; g.fillRect(XA, YS0, XB - XA, YB - YS0);
    // brillo cálido del horno y de las bombillas en el suelo
    const br = g.createRadialGradient(512, 520, 20, 512, 520, 520); br.addColorStop(0, "rgba(255,200,130,0.16)"); br.addColorStop(1, "rgba(255,200,130,0)");
    g.fillStyle = br; g.fillRect(XA, YS0, XB - XA, YB - YS0);
    g.restore();
  }
  function mesa(g) {
    const { x, y, rx, ry } = MESA;
    g.save(); g.lineJoin = "round";
    g.fillStyle = "rgba(20,6,0,0.3)"; g.beginPath(); g.ellipse(x, SUELO + 2, 50, 8, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#1e1a18"; g.beginPath(); g.ellipse(x, SUELO - 4, 38, 8, 0, 0, Math.PI * 2); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 2; g.stroke();
    g.fillStyle = "#2c2624"; g.fillRect(x - 6, y + 20, 12, SUELO - 10 - y - 20); g.strokeRect(x - 6, y + 20, 12, SUELO - 10 - y - 20);
    // mantel de cuadros rojos y blancos que cuelga
    g.save(); g.beginPath(); g.moveTo(x - rx, y); g.lineTo(x - rx - 6, y + 46); g.quadraticCurveTo(x, y + 58, x + rx + 6, y + 46); g.lineTo(x + rx, y); g.ellipse(x, y, rx, ry, 0, 0, Math.PI, false); g.closePath();
    g.fillStyle = "#f4efe6"; g.fill(); g.clip();
    g.fillStyle = "rgba(200,30,30,0.85)";
    for (let i = -12; i < 12; i++) { g.fillRect(x + i * 14 + 3, y - 10, 7, 80); }
    for (let j = 0; j < 6; j++) { g.fillStyle = "rgba(200,30,30,0.5)"; g.fillRect(x - rx - 10, y + 2 + j * 11, 2 * rx + 20, 5); }
    g.fillStyle = "rgba(0,0,0,0.15)"; g.fillRect(x - rx - 10, y + 24, 2 * rx + 20, 40);
    g.restore();
    g.strokeStyle = TINTA; g.lineWidth = 2; g.beginPath(); g.moveTo(x - rx, y); g.lineTo(x - rx - 6, y + 46); g.quadraticCurveTo(x, y + 58, x + rx + 6, y + 46); g.lineTo(x + rx, y); g.stroke();
    // tapa del mantel (vista desde arriba)
    g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); g.fillStyle = "#f4efe6"; g.fill();
    g.save(); g.clip();
    g.fillStyle = "rgba(200,30,30,0.6)"; for (let i = -12; i < 12; i++) g.fillRect(x + i * 14 + 3, y - ry, 7, 2 * ry);
    for (let j = -3; j < 3; j++) { g.fillStyle = "rgba(200,30,30,0.4)"; g.fillRect(x - rx, y + j * 8, 2 * rx, 4); }
    g.restore();
    g.strokeStyle = TINTA; g.lineWidth = 2; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); g.stroke();
    // aceitera y servilletero
    g.fillStyle = "rgba(160,170,60,0.85)"; g.beginPath(); g.ellipse(x + 64, y - 14, 5, 9, 0, 0, Math.PI * 2); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 1.3; g.stroke();
    g.fillStyle = "#ddd"; g.fillRect(x + 62, y - 27, 4, 6);
    g.restore();
  }
  function columna(g) {
    const { x, r } = COL;
    g.save();
    g.fillStyle = "rgba(20,6,0,0.35)"; g.beginPath(); g.ellipse(x + 6, SUELO + 4, r + 26, 8, 0, 0, Math.PI * 2); g.fill();
    const fu = g.createLinearGradient(x - r, 0, x + r, 0); fu.addColorStop(0, "#b8ab98"); fu.addColorStop(0.35, "#f2eadb"); fu.addColorStop(0.7, "#d8ccb6"); fu.addColorStop(1, "#9e907c");
    g.fillStyle = fu; g.fillRect(x - r, -60, 2 * r, SUELO - 22 + 60);
    // vetas del mármol
    g.strokeStyle = "rgba(120,110,100,0.35)"; g.lineWidth = 1.2;
    for (let i = 0; i < 9; i++) { const y0 = -40 + i * 66; g.beginPath(); g.moveTo(x - r + 4, y0); g.bezierCurveTo(x - 4, y0 + 20, x + 6, y0 + 12, x + r - 6, y0 + 44); g.stroke(); }
    // estrías
    g.strokeStyle = "rgba(90,80,70,0.25)"; g.lineWidth = 2; for (const d of [-18, -6, 6, 18]) { g.beginPath(); g.moveTo(x + d, -40); g.lineTo(x + d, SUELO - 30); g.stroke(); }
    // basa y capitel
    g.fillStyle = "#e6dccb"; g.fillRect(x - r - 10, SUELO - 24, 2 * r + 20, 24); g.fillRect(x - r - 5, SUELO - 32, 2 * r + 10, 8);
    g.fillRect(x - r - 12, -64, 2 * r + 24, 16); g.fillRect(x - r - 6, -48, 2 * r + 12, 8);
    g.strokeStyle = TINTA; g.lineWidth = 2;
    g.strokeRect(x - r - 10, SUELO - 24, 2 * r + 20, 24); g.strokeRect(x - r - 5, SUELO - 32, 2 * r + 10, 8);
    g.strokeRect(x - r - 12, -64, 2 * r + 24, 16); g.strokeRect(x - r - 6, -48, 2 * r + 12, 8);
    g.beginPath(); g.moveTo(x - r, -40); g.lineTo(x - r, SUELO - 32); g.moveTo(x + r, -40); g.lineTo(x + r, SUELO - 32); g.stroke();
    g.restore();
  }
  function guirnalda(g, XA, XB) {
    g.save();
    const anclas = []; for (let x = XA; x <= XB + 1; x += 300) anclas.push(x);
    for (let i = 0; i < anclas.length - 1; i++) {
      const a = anclas[i], b = anclas[i + 1], ya = 8, cae = 46;
      g.strokeStyle = "#1a0f08"; g.lineWidth = 2; g.beginPath(); g.moveTo(a, ya); g.quadraticCurveTo((a + b) / 2, ya + 2 * cae, b, ya); g.stroke();
      for (let k = 1; k < 6; k++) {
        const u = k / 6, x = lerp(a, b, u), y = ya + 4 * cae * u * (1 - u);
        const h = g.createRadialGradient(x, y + 8, 1, x, y + 8, 26); h.addColorStop(0, "rgba(255,220,140,0.55)"); h.addColorStop(1, "rgba(255,200,120,0)");
        g.fillStyle = h; g.beginPath(); g.arc(x, y + 8, 26, 0, Math.PI * 2); g.fill();
        g.fillStyle = "#2a1a10"; g.fillRect(x - 2.5, y, 5, 4);
        g.fillStyle = "#fff0b8"; g.beginPath(); g.ellipse(x, y + 9, 4.5, 6, 0, 0, Math.PI * 2); g.fill();
      }
    }
    g.restore();
  }
  // llamas del horno (lo único del fondo que se mueve)
  function llamas(g, t) {
    const x = -120;
    g.save();
    const fl = 0.75 + 0.25 * ruido(t * 7);
    const h = g.createRadialGradient(x, 296, 4, x, 296, 60 * fl); h.addColorStop(0, "rgba(255,230,120,0.75)"); h.addColorStop(1, "rgba(255,120,30,0)");
    g.fillStyle = h; g.beginPath(); g.arc(x, 296, 60 * fl, 0, Math.PI * 2); g.fill();
    for (let i = 0; i < 5; i++) {
      const fx = x - 40 + i * 20, al = 22 + 14 * (0.5 + 0.5 * ruido(t * 9 + i * 3.1)), oc = 3 * ruido(t * 6 + i);
      g.fillStyle = i % 2 ? "rgba(255,190,60,0.9)" : "rgba(255,120,30,0.9)";
      g.beginPath(); g.moveTo(fx - 9, 304); g.quadraticCurveTo(fx - 8, 304 - al * 0.6, fx + oc, 304 - al); g.quadraticCurveTo(fx + 8, 304 - al * 0.6, fx + 9, 304); g.closePath(); g.fill();
    }
    g.restore();
  }

  /* ================= hilo de queso ================= */
  // tramo de hilo: cuadrática de a a b con flecha `cae` (hacia abajo) y vibración lateral `vib`
  function hebra(g, tramos, w) {
    const traza = () => {
      g.beginPath(); g.moveTo(tramos[0].a.x, tramos[0].a.y);
      for (const tr of tramos) {
        if (tr.arco) {
          const a = tr.arco; g.ellipse(a.x, a.y, a.rx, a.ry, 0, Math.PI, 0, true);
          // goterones colgando del queso que rodea la columna
          if (a.gotas > 0.3) for (const [dx, l] of [[-12, 9], [7, 13]]) { const y0 = a.y + a.ry * Math.sqrt(1 - (dx / a.rx) ** 2); g.moveTo(a.x + dx, y0); g.lineTo(a.x + dx + 0.5, y0 + l * a.gotas); g.moveTo(a.x + dx, y0); }
          g.moveTo(a.x + a.rx, a.y); continue;
        }
        const mx = (tr.a.x + tr.b.x) / 2, my = (tr.a.y + tr.b.y) / 2, dx = tr.b.x - tr.a.x, dy = tr.b.y - tr.a.y, L = Math.hypot(dx, dy) || 1;
        const nx = -dy / L, ny = dx / L;
        g.quadraticCurveTo(mx + nx * (tr.vib || 0), my + 2 * (tr.cae || 0) + ny * (tr.vib || 0), tr.b.x, tr.b.y);
      }
    };
    g.save(); g.lineCap = "round"; g.lineJoin = "round";
    traza(); g.strokeStyle = "#b8740f"; g.lineWidth = w + 2.2; g.stroke();
    g.strokeStyle = "#ffd54a"; g.lineWidth = w; g.stroke();
    g.translate(0, -w * 0.22); g.strokeStyle = "rgba(255,248,200,0.85)"; g.lineWidth = w * 0.32; g.stroke();
    g.restore();
  }
  // flecha de una cuadrática que cuelga: la longitud L entre dos puntos a distancia d
  const flecha = (d, L) => Math.sqrt(Math.max(0, 3 * d * (L - d) / 8));

  /* ================= Guillermo ================= */
  const XG0 = 410, XG1 = -95, XGf = 690;
  const OFF_G = { cerca: -30, lejos: 32 };
  const TOB_G = { cerca: G.SUELO - G.TOBILLO_ALTO, lejos: G.SUELO - G.TOBILLO_ALTO - 12 };
  const CAM_G = [[0, XG0, 0], [T.tira, XG0, 0], [T.tira1, XG0 - 14, -30], [T.anda0, XG0 - 22, -60], [4.8, 150, -160], [T.anda1, XG1, 0]];
  const xCaminaG = t => camino(CAM_G, t);
  const PASOS_G = pasos(xCaminaG, OFF_G, [[T.tira + 0.15, T.tira1 + 0.05, 1, 18], [T.anda0 - 0.1, T.anda1, 9, 26]], "cerca");
  const vuelo = (t, a, b) => { const u = fase(t, a, b); return 1 - Math.pow(1 - u, 2.4); };

  const CG = {
    inicio: E({ mx: 0.7, my: 0.75, sonr: 0.35, ancho: 0.95, sd: 10, si: 10 }),
    relame: E({ mx: 0.7, my: 0.75, sonr: 0.45, abre: 12, ancho: 0.9, lengua: 1, sd: 14, si: 14 }),
    recelo: E({ mx: 0.95, my: 0.15, c: 0.35, sonr: 0.05, ancho: 0.75, sd: -10, si: -4, gd: -0.16, gi: -0.08 }),
    coge: E({ mx: 0.75, my: 0.75, sonr: 0.55, ancho: 1, sd: 4, si: 4 }),
    hilo: E({ mx: 0.85, my: 0.45, iris: 0.85, sonr: 0, ancho: 0.6, abre: 8, sd: 18, si: 18, gd: 0.08, gi: 0.08 }),
    reto: E({ mx: 0.95, my: 0.05, c: 0.22, sonr: 0.45, ancho: 0.9, sd: -12, si: -12, gd: -0.22, gi: -0.22 }),
    largo: E({ mx: 0.9, my: 0.25, iris: 0.8, sonr: -0.1, ancho: 0.6, abre: 6, sd: 22, si: 22 }),
    retoL: E({ mx: 0.95, my: 0.0, c: 0.15, sonr: 0.1, ancho: 0.8, sd: -14, si: -14, gd: -0.24, gi: -0.24 }),
    muerde: E({ mx: 0.6, my: 0.6, c: 0.55, z: 0.6, sonr: -0.1, abre: 14, ancho: 0.8, sd: -16, si: -16, gd: -0.3, gi: -0.3 }),
    tiron: E({ mx: 0.9, my: 0.0, iris: 0.6, sonr: -0.2, abre: 10, ancho: 0.45, sd: 26, si: 26, gd: 0.12, gi: 0.12 }),
    aturde: E({ mx: 0.4, my: 0.2, c: 0.4, iris: 0.85, sonr: -0.05, abre: 4, ancho: 0.45, sd: 8, si: 2 }),
    mira: E({ mx: 0.95, my: -0.25, iris: 0.82, sonr: 0, abre: 4, ancho: 0.4, sd: 20, si: 20, gd: 0.08, gi: 0.08 }),
    come: E({ mx: 0.95, my: -0.2, c: 0.2, sonr: 0.05, abre: 4, ancho: 0.32, sd: 8, si: 12, mof: 0.3 }),
    boop: E({ mx: 0.6, my: -0.2, iris: 0.75, c: 0, sonr: 0.1, abre: 4, ancho: 0.35, sd: 26, si: 26, gd: 0.1, gi: 0.1, rub: 1 }),
    tierno: E({ mx: 0.7, my: -0.15, c: 0.45, h: 0.6, sonr: 0.55, abre: 2, ancho: 0.55, sd: 12, si: 14, rub: 1 })
  };
  const GUION_CG = [
    [T.relame, T.relame + 0.12, "relame"], [T.relame1 - 0.1, T.relame1 + 0.05, "inicio"], [T.ojeada, T.ojeada + 0.1, "recelo"],
    [T.ojeada1, T.ojeada1 + 0.1, "coge"], [T.miraHilo, T.miraHilo + 0.15, "hilo"], [T.miraOtro, T.miraOtro + 0.15, "reto"],
    [T.miraLargo, T.miraLargo + 0.2, "largo"], [T.miraOtroL, T.miraOtroL + 0.15, "retoL"], [T.muerde - 0.1, T.muerde + 0.05, "muerde"],
    [T.tiron, T.tiron + 0.06, "tiron"], [T.vuela1, T.vuela1 + 0.15, "aturde"], [T.miran, T.miran + 0.2, "mira"],
    [T.come0, T.come0 + 0.2, "come"], [T.boop, T.boop + 0.08, "boop"], [T.sonrisa, T.sonrisa + 0.4, "tierno"]
  ];
  const PARP_G = [0.55, 2.05, 3.9, 5.6, 9.05, 9.75, 10.9, 12.95];
  const P0G = { pel: 0, torso: 0.02, cab: 0.03 };
  const CuG = o => Object.assign({}, P0G, o);
  const CUER_G = {
    quieto: CuG({}),
    hambre: CuG({ torso: 0.08, cab: 0.1, pel: 4 }),
    recelo: CuG({ torso: 0.03, cab: 0.0 }),
    alarga: CuG({ torso: 0.14, cab: 0.08, pel: 10 }),
    tira: CuG({ torso: -0.1, cab: -0.04, pel: 6 }),
    anda: CuG({ torso: -0.07, cab: -0.02, pel: 4 }),
    para: CuG({ torso: -0.02, cab: 0.02 }),
    muerde: CuG({ torso: 0.1, cab: 0.18, pel: 8 }),
    tensa: CuG({ torso: -0.08, cab: -0.12, pel: 6 }),
    envuelto: CuG({ torso: -0.12, cab: -0.12, pel: 2 }),
    come: CuG({ torso: 0.0, cab: -0.24, pel: -4 }),
    boop: CuG({ torso: 0.04, cab: -0.42, pel: -10 })
  };
  const GUION_G = [
    [T.hambre, T.hambre + 0.5, "hambre"], [T.ojeada, T.ojeada + 0.15, "recelo"], [T.alarga, T.toma, "alarga"],
    [T.toma + 0.05, T.tira1, "tira"], [T.anda0, T.anda0 + 0.4, "anda"], [T.anda1 - 0.2, T.anda1 + 0.2, "para"],
    [T.muerde0, T.muerde, "muerde"], [T.mastica1 - 0.05, T.tiron, "tensa"], [T.vuela1 - 0.2, T.vuela1 + 0.08, "envuelto"],
    [T.come0, T.come1, "come", sorbidoK], [T.come1 - 0.15, T.boop + 0.05, "boop"]
  ];
  const NARIZ_G = { x: 881, y: 668 };

  // ¿qué hace el cuerpo de Guillermo en t? x, alzada (vuelo), inclinación extra
  function cuerpoG(t) {
    let x = xCaminaG(t), aire = 0, incl = 0;
    if (t >= T.vuela0) {
      const k = vuelo(t, T.vuela0, T.vuela1);
      x = lerp(XG1, XGf, k);
      aire = campana(t, T.vuela0, T.vuela1 + 0.02);
      incl = 0.42 * tramo(t, T.vuela0, T.vuela0 + 0.1) * (1 - tramo(t, T.vuela1 - 0.26, T.vuela1 - 0.04)) - 0.08 * campana(t, T.vuela1 - 0.06, T.vuela1 + 0.45);
    }
    return { x, aire, incl };
  }

  function poseG(t) {
    return cache("G" + t, () => {
      const b = linea(GUION_G, CUER_G, "quieto", t);
      const respira = Math.sin(t * 2.1 + 0.4);
      const cu = cuerpoG(t);
      const choque = campana(t, T.vuela1 - 0.02, T.vuela1 + 0.22);
      const x = cu.x;
      // tirón del hilo (lo arrastra por la boca)
      const tir = campana(t, T.tiron, T.vuela0 + 0.05);
      const mast = campana(t, T.muerde, T.mastica1);
      const p = {
        x, suelo: SUELO, s: S,
        pelvis: { x: G.PELVIS.x, y: G.PELVIS.y + b.pel + respira * 1.2 - 70 * cu.aire + 18 * choque },
        torso: b.torso + cu.incl + 0.05 * tir, torsoEsc: { x: 1, y: 1 + respira * 0.004 - 0.03 * choque },
        piernas: {}, cabeza: { ang: b.cab + 0.06 * mast * Math.sin((t - T.muerde) * 26) - 0.1 * cu.aire, dx: 0, dy: 0, esc: { x: 1, y: 1 } },
        tirasLimpias: true
      };
      // pies: andando, por el aire (arrastrados por detrás) y al caer
      const vol = tramo(t, T.vuela0, T.vuela0 + 0.12) * (1 - tramo(t, T.vuela1 - 0.1, T.vuela1));
      for (const lado of ["cerca", "lejos"]) {
        const pf = pie(PASOS_G[lado], t);
        let fx = pf.x, al = pf.alza, xr = x;
        // en el vuelo: hasta la mitad, los pies salen de donde estaban; luego van a donde caen
        if (t >= T.vuela0) {
          if (t < (T.vuela0 + T.vuela1) / 2) { fx = XG1 + OFF_G[lado]; xr = XG1; }
          else fx = XGf + OFF_G[lado] * (lado === "cerca" ? 1.1 : 0.9);
          al = 0;
        }
        let tob = { x: G.PELVIS.x + (fx - xr) / S, y: TOB_G[lado] - al / S };
        if (vol > 0) { const atras = { x: G.PELVIS.x - 260 - (lado === "cerca" ? 60 : 0), y: G.PELVIS.y + 300 + (lado === "cerca" ? 30 : 0) }; tob = { x: lerp(tob.x, atras.x, vol), y: lerp(tob.y, atras.y, vol) }; }
        p.piernas[lado] = { tob, ang: -0.5 * vol + (pf.u > 0 && pf.u < 1 ? -0.15 * Math.sin(Math.PI * pf.u) : 0) };
      }
      // cara
      const e = linea(GUION_CG, CG, "inicio", t);
      e.abre += 9 * mast * Math.max(0, Math.sin((t - T.muerde) * 21));
      const so = sorbo(t);
      e.mof += 0.5 * so; e.ancho -= 0.08 * so;
      p.cabeza.ang -= 0.04 * so;
      p.cara = cara(e, parpadeo(t, PARP_G));
      p.sudor = 0.5 * campana(t, T.miran, T.come0 + 0.6);
      // manos
      const Tr = G.tronco(p), hc = Tr(G.HOMBRO_C), hl = Tr(G.HOMBRO);
      const bo = G.aPantalla(p, G.boca(p));
      const resuelve = lado => o => {
        let q;
        if (o.bols) { const B = Tr(BOLS_G[lado]); return { x: B.x, y: B.y, mu: -1.75, ang: 0, puno: 0, dedos: D(0.4, 0.4, 0.4, 0.4) }; }
        if (o.pega) { const B = Tr(BOLS_G[lado]); q = { x: B.x + o.pega.x, y: B.y + o.pega.y }; }
        else if (o.hom) { const h = lado === "l" ? hl : hc; q = { x: h.x + o.hom.x, y: h.y + o.hom.y }; }
        else if (o.boca) q = G.aHoja(p, { x: bo.x + o.boca.x, y: bo.y + o.boca.y });
        else if (o.corteza) { const c = cortezaMesa(-1); q = G.aHoja(p, { x: c.x - AGARRE, y: c.y }); }
        return { x: q.x, y: q.y, mu: o.mu, ang: o.ang || 0, puno: o.puno, dedos: o.dedos };
      };
      const C = pista(PISTA_GC, t, resuelve("c")), L = pista(PISTA_GL, t, resuelve("l"));
      p.manoCerca = { x: C.x, y: C.y, ang: C.ang, mu: C.mu, dobla: -1, puno: C.puno, dedos: C.dedos };
      p.manoLejos = { x: L.x, y: L.y, ang: L.ang, mu: L.mu, dobla: -1, puno: L.puno, dedos: L.dedos };
      // la porción, cogida por la corteza (por debajo de los dedos)
      p._porcion = porcionEn("g", t, G.aPantalla(p, C), bo);
      if (p._porcion && p._porcion.mano) { const pr = p._porcion; p.manoCerca.objeto = g => { if (!MATRIZ) return; g.save(); g.setTransform(MATRIZ); porcion(g, pr.x, pr.y, pr.ang, pr.sq, pr.cae); g.restore(); }; }
      p._boca = bo;
      return p;
    });
  }
  const AGARRE = 5;          // del puño al centro de la corteza
  const PISTA_GC = [
    [0, 0, { bols: true }],
    [T.alarga, T.toma, { corteza: true, mu: -2.5, puno: 1, dedos: D(0.35, 0.32, 0.3, 0.28) }],
    [T.toma + 0.02, T.sube, { hom: { x: 225, y: 190 }, mu: -2.6, puno: 1, dedos: D(0.35, 0.32, 0.3, 0.28) }],
    [T.tira, T.tira1, { hom: { x: 245, y: 215 }, mu: -2.7, puno: 1, dedos: D(0.35, 0.32, 0.3, 0.28) }],
    [T.muerde0, T.muerde, { boca: { x: 13, y: 40 }, mu: -2.2, puno: 1, dedos: D(0.35, 0.32, 0.3, 0.28) }],
    [T.suelta, T.suelta + 0.16, { hom: { x: -190, y: 120 }, mu: 2.4, puno: 1, dedos: D(0.95, 1, 1, 0.95) }, salida],
    [T.vuela1 - 0.05, T.envuelve0 + 0.35, { pega: { x: -6, y: 6 }, mu: -1.8, puno: 1, dedos: D(0.85, 0.9, 0.9, 0.9) }]
  ];
  const PISTA_GL = [
    [0, 0, { bols: true }],
    [T.suelta - 0.02, T.suelta + 0.16, { hom: { x: -60, y: 200 }, mu: 2.2, puno: 1, dedos: D(0.95, 1, 1, 0.95) }, salida],
    [T.vuela1 - 0.05, T.envuelve0 + 0.3, { pega: { x: 4, y: 8 }, mu: -1.6, puno: 1, dedos: D(0.85, 0.9, 0.9, 0.9) }]
  ];

  /* ================= Dari ================= */
  const XD0 = 616, XD1 = 1150;
  const OFF_D = { cerca: 27, lejos: -29 };
  const TOB_D = Da.SUELO - Da.TOBILLO_ALTO;
  const CAM_D = [[0, XD0, 0], [T.tira, XD0, 0], [T.tira1, XD0 + 14, 30], [T.anda0, XD0 + 22, 70], [T.choque - 0.05, 838, 120], [T.choque + 0.04, 830, -40],
    [T.rodea0, 834, 30], [5.2, 960, 130], [T.rodea1, 1060, 110], [T.anda1, XD1, 0]];
  const xCaminaD = t => camino(CAM_D, t);
  const PASOS_D = pasos(xCaminaD, OFF_D, [[T.tira + 0.15, T.tira1 + 0.05, 1, 18], [T.anda0 - 0.08, T.choque, 4, 26], [T.rodea0 + 0.02, T.anda1, 6, 26]], "cerca");
  // rodeo por delante de la columna: z < 0 = más cerca de cámara
  const zD = t => -Math.sin(Math.PI * tramo(t, T.rodea0 + 0.05, T.rodea1, suave));
  const XDf = 776;

  const CD = {
    inicio: E({ mx: 0.75, my: 0.7, sonr: 0.3, ancho: 0.85, sd: 8, si: 12 }),
    relame: E({ mx: 0.75, my: 0.7, sonr: 0.4, ancho: 0.8, abre: 4, sd: 10, si: 16, gi: 0.1 }),
    recelo: E({ mx: 0.95, my: 0.1, c: 0.3, sonr: 0.0, ancho: 0.7, sd: -8, si: 2, gd: -0.14, gi: -0.04 }),
    coge: E({ mx: 0.75, my: 0.7, sonr: 0.5, ancho: 0.9, sd: 4, si: 8 }),
    hilo: E({ mx: 0.85, my: 0.45, iris: 0.85, sonr: 0, ancho: 0.6, abre: 6, sd: 16, si: 20 }),
    reto: E({ mx: 0.95, my: 0.0, c: 0.2, sonr: 0.35, ancho: 0.85, sd: -10, si: 6, gd: -0.2, gi: 0.08 }),
    golpe: E({ mx: -0.6, my: 0.0, c: 0.85, z: 0.8, sonr: -0.3, abre: 10, ancho: 0.6, sd: -8, si: -8, gd: -0.2, gi: -0.2 }),
    atras: E({ mx: -0.9, my: 0.0, iris: 0.85, sonr: -0.1, abre: 4, ancho: 0.6, sd: 16, si: 20 }),
    largo: E({ mx: 0.9, my: 0.25, iris: 0.8, sonr: -0.1, ancho: 0.6, abre: 6, sd: 20, si: 24 }),
    retoL: E({ mx: 0.95, my: 0.0, c: 0.15, sonr: 0.1, ancho: 0.8, sd: -12, si: 4, gd: -0.22, gi: 0.06 }),
    muerde: E({ mx: 0.6, my: 0.6, c: 0.55, z: 0.6, sonr: -0.1, abre: 12, ancho: 0.8, sd: -14, si: -14, gd: -0.28, gi: -0.28 }),
    tiron: E({ mx: 0.9, my: 0.0, iris: 0.6, sonr: -0.2, abre: 10, ancho: 0.45, sd: 26, si: 26, gd: 0.12, gi: 0.12 }),
    aturde: E({ mx: 0.4, my: 0.2, c: 0.4, iris: 0.85, sonr: -0.05, abre: 4, ancho: 0.45, sd: 8, si: 4 }),
    mira: E({ mx: 0.95, my: 0.3, iris: 0.82, sonr: 0, abre: 4, ancho: 0.4, sd: 18, si: 22, gd: 0.06, gi: 0.1 }),
    come: E({ mx: 0.95, my: 0.25, c: 0.2, sonr: 0.05, abre: 4, ancho: 0.32, sd: 8, si: 12, mof: 0.3 }),
    boop: E({ mx: 0.6, my: 0.25, iris: 0.75, sonr: 0.1, abre: 4, ancho: 0.35, sd: 24, si: 24, rub: 1 }),
    tierno: E({ mx: 0.7, my: 0.2, c: 0.4, h: 0.6, sonr: 0.55, abre: 2, ancho: 0.55, sd: 12, si: 16, rub: 1 })
  };
  const GUION_CD = [
    [T.relame - 0.05, T.relame + 0.15, "relame"], [T.relame1, T.relame1 + 0.1, "inicio"], [T.ojeada + 0.04, T.ojeada + 0.14, "recelo"],
    [T.ojeada1 + 0.02, T.ojeada1 + 0.12, "coge"], [T.miraHilo + 0.03, T.miraHilo + 0.18, "hilo"], [T.miraOtro + 0.02, T.miraOtro + 0.17, "reto"],
    [T.choque, T.choque + 0.06, "golpe"], [T.choque + 0.22, T.choque + 0.35, "atras"], [T.rodea0 + 0.5, T.rodea0 + 0.7, "reto"],
    [T.miraLargo + 0.05, T.miraLargo + 0.25, "largo"], [T.miraOtroL + 0.03, T.miraOtroL + 0.18, "retoL"], [T.muerde - 0.08, T.muerde + 0.07, "muerde"],
    [T.tiron, T.tiron + 0.06, "tiron"], [T.vuela1, T.vuela1 + 0.15, "aturde"], [T.miran + 0.05, T.miran + 0.25, "mira"],
    [T.come0, T.come0 + 0.2, "come"], [T.boop, T.boop + 0.08, "boop"], [T.sonrisa + 0.05, T.sonrisa + 0.45, "tierno"]
  ];
  const PARP_D = [0.35, 2.15, 3.6, 5.95, 7.0, 9.15, 10.5, 11.4];
  const P0D = { pel: 0, torso: 0.02, cab: 0.03 };
  const CuD = o => Object.assign({}, P0D, o);
  const CUER_D = {
    quieto: CuD({}),
    hambre: CuD({ torso: 0.08, cab: 0.12, pel: 4 }),
    recelo: CuD({ torso: 0.03, cab: 0.02 }),
    alarga: CuD({ torso: 0.15, cab: 0.1, pel: 10 }),
    tira: CuD({ torso: -0.1, cab: -0.04, pel: 6 }),
    anda: CuD({ torso: -0.07, cab: -0.02, pel: 4 }),
    golpe: CuD({ torso: 0.1, cab: 0.16, pel: 8 }),
    para: CuD({ torso: -0.02, cab: 0.03 }),
    muerde: CuD({ torso: 0.1, cab: 0.18, pel: 8 }),
    tensa: CuD({ torso: -0.08, cab: -0.12, pel: 6 }),
    envuelto: CuD({ torso: -0.12, cab: -0.04, pel: 4 }),
    come: CuD({ torso: 0.1, cab: 0.12, pel: 8 }),
    boop: CuD({ torso: 0.2, cab: 0.34, pel: 8 })
  };
  const GUION_D = [
    [T.hambre + 0.05, T.hambre + 0.55, "hambre"], [T.ojeada, T.ojeada + 0.15, "recelo"], [T.alarga, T.toma, "alarga"],
    [T.toma + 0.05, T.tira1, "tira"], [T.anda0, T.anda0 + 0.4, "anda"], [T.choque - 0.02, T.choque + 0.08, "golpe", salida],
    [T.choque + 0.2, T.rodea0 + 0.2, "anda"], [T.anda1 - 0.2, T.anda1 + 0.2, "para"],
    [T.muerde0 + 0.02, T.muerde, "muerde"], [T.mastica1 - 0.05, T.tiron, "tensa"], [T.vuela1 - 0.2, T.vuela1 + 0.08, "envuelto"],
    [T.come0, T.come1, "come", sorbidoK], [T.come1 - 0.15, T.boop + 0.05, "boop"]
  ];
  const NARIZ_D = { x: 900, y: 598 };

  function cuerpoD(t) {
    let x = xCaminaD(t), aire = 0, incl = 0;
    if (t >= T.vuela0) {
      const k = vuelo(t, T.vuela0, T.vuela1);
      x = lerp(XD1, XDf, k);
      aire = campana(t, T.vuela0, T.vuela1 + 0.02);
      incl = 0.42 * tramo(t, T.vuela0, T.vuela0 + 0.1) * (1 - tramo(t, T.vuela1 - 0.26, T.vuela1 - 0.04)) - 0.08 * campana(t, T.vuela1 - 0.06, T.vuela1 + 0.45);
    }
    return { x, aire, incl };
  }
  const gafasDy = t => -14 * campana(t, T.choque, T.choque + 0.3) + 10 * campana(t, T.vuela1 - 0.02, T.vuela1 + 0.3);

  function poseD(t) {
    return cache("D" + t, () => {
      const b = linea(GUION_D, CUER_D, "quieto", t);
      const respira = Math.sin(t * 1.9 + 1.4);
      const cu = cuerpoD(t);
      const z = t < T.vuela0 ? zD(t) : 0;
      const choque = campana(t, T.vuela1 - 0.02, T.vuela1 + 0.22);
      const tir = campana(t, T.tiron, T.vuela0 + 0.05);
      const mast = campana(t, T.muerde, T.mastica1);
      const sc = S * (1 - 0.07 * z), su = SUELO - 24 * z;
      const p = {
        x: cu.x, suelo: su, s: sc, espejo: true,
        pelvis: { x: Da.PELVIS.x, y: Da.PELVIS.y + b.pel + respira * 1.1 - 70 * cu.aire + 18 * choque },
        torso: b.torso + cu.incl + 0.05 * tir, torsoEsc: { x: 1, y: 1 + respira * 0.004 - 0.03 * choque },
        piernas: {}, cabeza: { ang: b.cab + 0.06 * mast * Math.sin((t - T.muerde) * 24 + 1) - 0.1 * cu.aire, dx: 0, dy: 0, esc: { x: 1, y: 1 } },
        tirasLimpias: true
      };
      // narices: al final la de Dari va exactamente a la de Guillermo (se corrige con el cuerpo y un poco la cabeza)
      const wn = tramo(t, T.come1 - 0.7, T.boop);
      if (wn > 0) {
        const pG = poseG(t), ng = G.aPantalla(pG, G.cabeza(pG).a(NARIZ_G)), nd = Da.aPantalla(p, Da.cabeza(p).a(NARIZ_D));
        const rebota = 4 * campana(t, T.boop, T.boop + 0.28);
        p.x += (ng.x + rebota - nd.x) * wn;
        p.cabeza.dy += (ng.y - nd.y) * wn / sc;
      }
      const vol = tramo(t, T.vuela0, T.vuela0 + 0.12) * (1 - tramo(t, T.vuela1 - 0.1, T.vuela1));
      for (const lado of ["cerca", "lejos"]) {
        const pf = pie(PASOS_D[lado], t);
        let fx = pf.x, al = pf.alza, xr = p.x;
        if (t >= T.vuela0) {
          if (t < (T.vuela0 + T.vuela1) / 2) { fx = XD1 + OFF_D[lado]; xr = XD1; }
          else fx = XDf + OFF_D[lado] * (lado === "cerca" ? 1.1 : 0.9);
          al = 0;
        }
        let tob = { x: Da.PELVIS.x - (fx - xr) / sc, y: TOB_D - (lado === "lejos" ? 10 : 0) - al / sc };
        if (vol > 0) { const atras = { x: Da.PELVIS.x - 260 - (lado === "cerca" ? 60 : 0), y: Da.PELVIS.y + 300 + (lado === "cerca" ? 30 : 0) }; tob = { x: lerp(tob.x, atras.x, vol), y: lerp(tob.y, atras.y, vol) }; }
        p.piernas[lado] = { tob, ang: -0.5 * vol + (pf.u > 0 && pf.u < 1 ? -0.15 * Math.sin(Math.PI * pf.u) : 0) };
      }
      const e = linea(GUION_CD, CD, "inicio", t);
      e.abre += 8 * mast * Math.max(0, Math.sin((t - T.muerde) * 19 + 0.8));
      const so = sorbo(t);
      e.mof += 0.5 * so; e.ancho -= 0.08 * so;
      p.cabeza.ang += 0.04 * so;
      p.cara = cara(e, parpadeo(t, PARP_D, 0.13));
      const gdy = gafasDy(t), em = empanado(t);
      p.gafas = { dx: 0, dy: gdy, ang: -0.05 * campana(t, T.choque, T.choque + 0.3) };
      p.capaCabeza = g => vaho(g, t, em, gdy);
      // manos
      const bo = Da.aPantalla(p, Da.boca(p));
      const Tr = Da.tronco(p);
      const resuelve = lado => o => {
        if (o.bols) { const m = Da.manoReposo(p, lado); return { x: m.x, y: m.y, mu: -1.75, ang: 0, puno: 0, dedos: D(0.4, 0.4, 0.4, 0.4) }; }
        let q;
        if (o.pega) { const m = Da.manoReposo(p, lado); q = { x: m.x + o.pega.x, y: m.y + o.pega.y }; }
        else if (o.hom) { const h = Tr(lado === "lejos" ? Da.HOMBRO : Da.HOMBRO_C); q = { x: h.x + o.hom.x, y: h.y + o.hom.y }; }
        else if (o.boca) q = Da.aHoja(p, { x: bo.x + o.boca.x, y: bo.y + o.boca.y });
        else if (o.corteza) { const c = cortezaMesa(1); q = Da.aHoja(p, { x: c.x + AGARRE, y: c.y }); }
        return { x: q.x, y: q.y, mu: o.mu, ang: o.ang || 0, puno: o.puno, dedos: o.dedos };
      };
      const C = pista(PISTA_DC, t, resuelve("cerca")), L = pista(PISTA_DL, t, resuelve("lejos"));
      p.manoCerca = { x: C.x, y: C.y, ang: C.ang, mu: C.mu, dobla: -1, puno: C.puno, dedos: C.dedos };
      p.manoLejos = { x: L.x, y: L.y, ang: L.ang, mu: L.mu, dobla: -1, puno: L.puno, dedos: L.dedos };
      p._porcion = porcionEn("d", t, Da.aPantalla(p, C), bo);
      if (p._porcion && p._porcion.mano) { const pr = p._porcion; p.manoCerca.objeto = g => { if (!MATRIZ) return; g.save(); g.setTransform(MATRIZ); porcion(g, pr.x, pr.y, pr.ang, pr.sq, pr.cae); g.restore(); }; }
      p._boca = bo;
      return p;
    });
  }
  const PISTA_DC = [
    [0, 0, { bols: true }],
    [T.alarga + 0.02, T.toma, { corteza: true, mu: -2.5, puno: 1, dedos: D(0.35, 0.32, 0.3, 0.28) }],
    [T.toma + 0.02, T.sube, { hom: { x: 240, y: 210 }, mu: -2.6, puno: 1, dedos: D(0.35, 0.32, 0.3, 0.28) }],
    [T.tira, T.tira1, { hom: { x: 262, y: 236 }, mu: -2.7, puno: 1, dedos: D(0.35, 0.32, 0.3, 0.28) }],
    [T.muerde0 + 0.02, T.muerde, { boca: { x: -13, y: 40 }, mu: -2.2, puno: 1, dedos: D(0.35, 0.32, 0.3, 0.28) }],
    [T.suelta, T.suelta + 0.16, { hom: { x: -190, y: 120 }, mu: 2.4, puno: 1, dedos: D(0.95, 1, 1, 0.95) }, salida],
    [T.vuela1 - 0.05, T.envuelve0 + 0.35, { pega: { x: -10, y: 4 }, mu: -1.8, puno: 1, dedos: D(0.85, 0.9, 0.9, 0.9) }]
  ];
  const PISTA_DL = [
    [0, 0, { bols: true }],
    [T.suelta - 0.02, T.suelta + 0.16, { hom: { x: -60, y: 200 }, mu: 2.2, puno: 1, dedos: D(0.95, 1, 1, 0.95) }, salida],
    [T.vuela1 - 0.05, T.envuelve0 + 0.3, { pega: { x: 6, y: 6 }, mu: -1.6, puno: 1, dedos: D(0.85, 0.9, 0.9, 0.9) }]
  ];

  /* ---------- porciones: en la mesa, en la mano, cayendo y en el suelo ---------- */
  // centro de la corteza de la porción de cada uno en la mesa (lado −1 = Guillermo, +1 = Dari)
  const cortezaMesa = lado => ({ x: PIZZA.x + lado * PIZZA.R, y: PIZZA.y });
  function porcionEn(quien, t, puno, boca) {
    const lado = quien === "g" ? -1 : 1, ang0 = quien === "g" ? 0 : Math.PI;
    if (t < T.toma) return null;
    if (t < T.suelta) {
      // inclinación: plana en la mesa → hacia cámara en la mano → punta arriba, hacia la boca, al morder
      const lev = tramo(t, T.toma, T.sube);
      const mor = tramo(t, T.muerde0, T.muerde) * (1 - tramo(t, T.tiron, T.suelta));
      const angM = quien === "g" ? -1.9 : -Math.PI + 1.9;
      const ang = lerp(ang0 + lado * 0.0, angM, mor) + (quien === "g" ? 0.08 : -0.08) * lev * (1 - mor);
      const sq = lerp(PIZZA.sq, 0.55, lev), cae = lerp(0, 9, lev) * (1 - 0.6 * mor);
      const off = rota({ x: AGARRE, y: 0 }, ang);
      const x = puno.x + off.x, y = puno.y + off.y;
      return { mano: true, x, y, ang, sq, cae, punta: puntaDe(x, y, ang, sq, cae) };
    }
    // cae al suelo dando media vuelta y se queda plana
    const s0 = cache("ps" + quien, () => { const p = quien === "g" ? poseG(T.suelta - 1e-4) : poseD(T.suelta - 1e-4); return p._porcion; });
    const u = t - T.suelta, yS = SUELO + 6, vx = lado * -60, vy = -220;
    const tc = (-vy + Math.sqrt(vy * vy + 2 * GRAV * (yS - s0.y))) / GRAV;
    const angF = quien === "g" ? 0.15 : Math.PI - 0.15;
    if (u < tc) { const k = u / tc; return { mano: false, x: s0.x + vx * u, y: s0.y + vy * u + 0.5 * GRAV * u * u, ang: lerp(s0.ang, angF, k), sq: lerp(s0.sq, 0.28, k), cae: lerp(s0.cae, 0, k) }; }
    const v = u - tc, rb = 3 * Math.abs(Math.sin(v * 14)) * Math.exp(-v * 9);
    return { mano: false, x: s0.x + vx * tc, y: yS - rb, ang: angF, sq: 0.28, cae: 0 };
  }
  const puntaDe = (x, y, ang, sq, cae) => { const q = rota({ x: PIZZA.R, y: 0 }, ang); return { x: x + q.x, y: y + q.y + cae }; };

  /* ---------- gafas empañadas (coordenadas del retrato, encima de las gafas) ---------- */
  const ARO_D = [[729, 474], [744, 471], [789, 478], [833, 496], [858, 509], [861, 517], [849, 545], [837, 569], [823, 579], [789, 575], [745, 561], [734, 553], [729, 530]];
  const ARO_I = [[905, 522], [949, 537], [993, 551], [1006, 557], [1003, 580], [999, 608], [986, 621], [949, 624], [917, 615], [907, 604], [904, 570]];
  const empanado = t => tramo(t, T.empana, T.empana1);
  function vaho(g, t, k, dy) {
    if (k <= 0.01) return;
    g.save(); g.translate(0, dy);
    for (const [aro, cx, cy] of [[ARO_D, 795, 525], [ARO_I, 955, 580]]) {
      g.save(); g.beginPath(); g.moveTo(aro[0][0], aro[0][1]); for (const [x, y] of aro.slice(1)) g.lineTo(x, y); g.closePath(); g.clip();
      // el vaho sube desde abajo
      const alto = 160 * k;
      const v = g.createLinearGradient(0, cy + 70, 0, cy + 70 - alto); v.addColorStop(0, "rgba(250,252,255,0.94)"); v.addColorStop(0.75, "rgba(240,246,252,0.86)"); v.addColorStop(1, "rgba(240,246,252,0)");
      g.fillStyle = v; g.fillRect(cx - 120, cy - 100, 240, 200);
      g.fillStyle = `rgba(255,255,255,${0.6 * k})`;
      for (let i = 0; i < 7; i++) { g.beginPath(); g.arc(cx - 40 + 80 * hash(i + cx), cy - 30 + 60 * hash(i + cy), 4 + 4 * hash(i + 7), 0, Math.PI * 2); g.fill(); }
      g.restore();
    }
    // vapor que se escapa por encima
    g.lineCap = "round";
    for (let i = 0; i < 3; i++) {
      const ph = (t * 0.9 + i / 3) % 1, a = k * Math.sin(Math.PI * ph);
      if (a <= 0.02) continue;
      g.strokeStyle = `rgba(255,255,255,${0.7 * a})`; g.lineWidth = 14;
      const x0 = 790 + i * 70, y0 = 470 - ph * 150;
      g.beginPath(); g.moveTo(x0, y0 + 40); g.bezierCurveTo(x0 - 24, y0 + 20, x0 + 24, y0 + 10, x0, y0 - 10); g.stroke();
    }
    g.restore();
  }

  /* ================= hilo: dónde está en cada momento ================= */
  const L_FINAL = 165;                       // hilo que queda entre las bocas al caer
  function hilo(t, pG, pD) {
    if (t < T.toma + 0.04) return null;
    const out = [];
    // extremos: punta de cada porción, y en la boca desde el mordisco
    const enBoca = tramo(t, T.muerde - 0.05, T.muerde + 0.1);
    const pg = pG._porcion && pG._porcion.mano ? pG._porcion.punta : pG._boca, pd = pD._porcion && pD._porcion.mano ? pD._porcion.punta : pD._boca;
    const bG = { x: pG._boca.x + 3, y: pG._boca.y + 1 }, bD = { x: pD._boca.x - 3, y: pD._boca.y + 1 };
    const A = { x: lerp(pg.x, bG.x, enBoca), y: lerp(pg.y, bG.y, enBoca) }, B = { x: lerp(pd.x, bD.x, enBoca), y: lerp(pd.y, bD.y, enBoca) };
    const d = Math.hypot(B.x - A.x, B.y - A.y);
    const w = lerp(4.2, 2.6, clamp(d / 1200));
    // tensión: blando al principio, tirante al morder, muy tirante (y vibrando) en el tirón
    const tens = lerp(0.25, 0.85, tramo(t, T.muerde, T.mastica1)) * (1 - tramo(t, T.vuela1 - 0.1, T.vuela1 + 0.1));
    let cae;
    if (t < T.vuela1) cae = lerp(14 + 0.05 * d, 0.012 * d, tens) * (1 - tramo(t, T.tiron - 0.04, T.tiron + 0.04));
    else { const L = lerp(L_FINAL, Math.max(d, 1), sorbido(t)); cae = flecha(d, Math.max(L, d)); }
    // al principio el queso hace un hilo grueso y caído que se va afinando
    if (t < T.tira1) cae += 10 * (1 - tramo(t, T.toma, T.tira1));
    cae = Math.min(cae, 0.5 * d + 1);
    const vib = 16 * Math.sin((t - T.tiron) * 46) * Math.exp(-(t - T.tiron) * 7) * (t > T.tiron ? 1 : 0) + 3 * mastica(t) * Math.sin(t * 37);
    // enganchado a la columna (lo rodea por delante)
    const wc = tramo(t, T.engancha, T.engancha + 0.35) * (1 - tramo(t, T.tiron, T.tiron + 0.05));
    if (wc > 0.001) {
      const yRecta = A.y + (B.y - A.y) * (COL.x - A.x) / (B.x - A.x || 1);
      const uc = clamp((COL.x - A.x) / (B.x - A.x || 1));
      const yCurva = yRecta + 4 * cae * uc * (1 - uc);
      const fija = t >= T.engancha + 0.35 ? cache("ycFija", () => { const q = T.engancha + 0.35 - 1e-4; return hilo(q, poseG(q), poseD(q)).tramos[1].arco.y; }) : null;
      const yc = fija !== null ? fija : lerp(yCurva, yRecta + 3, wc);
      const cL = { x: lerp(COL.x, COL.x - COL.r, wc), y: yc }, cR = { x: lerp(COL.x, COL.x + COL.r, wc), y: yc };
      const dL = cL.x - A.x, dR = B.x - cR.x;
      const s1 = lerp(cae * uc * uc, 0.05 * dL + 6, wc), s2 = lerp(cae * (1 - uc) * (1 - uc), 0.05 * dR + 6, wc);
      out.push({ a: A, b: cL, cae: s1, vib: vib * 0.4 });
      out.push({ arco: { x: COL.x, y: yc, rx: (cR.x - cL.x) / 2, ry: 6 * wc, gotas: wc } });
      out.push({ a: cR, b: B, cae: s2, vib: vib * 0.4 });
    } else out.push({ a: A, b: B, cae, vib });
    return { tramos: out, w, A, B };
  }
  function mastica(t) { return campana(t, T.muerde, T.mastica1); }
  // sorbos: cinco tirones a la vez; cada uno se come un trozo de hilo y luego una pausita
  const N_SORBOS = 5;
  function sorbidoK(k) {
    const u = clamp(k) * N_SORBOS, n = Math.min(N_SORBOS - 1, Math.floor(u));
    return u >= N_SORBOS ? 1 : (n + suave(clamp((u - n) / 0.55))) / N_SORBOS;
  }
  const sorbido = t => sorbidoK(fase(t, T.come0, T.come1));
  function sorbo(t) {
    const u = fase(t, T.come0, T.come1) * N_SORBOS; if (u <= 0 || u >= N_SORBOS) return 0;
    const f = u - Math.floor(u); return f < 0.55 ? Math.sin(Math.PI * f / 0.55) : 0;
  }

  /* ---------- vueltas de queso alrededor de los dos ---------- */
  const VUELTAS = [{ t: 0, y: 334, ang: 0.05 }, { t: 0.12, y: 312, ang: -0.04 }, { t: 0.24, y: 356, ang: 0.03 }];
  function vueltas(g, t, pG, pD, delante) {
    if (t < T.envuelve0) return;
    const xa = pG.x - 52, xb = pD.x + 52, cx = (xa + xb) / 2, rx0 = (xb - xa) / 2;
    for (const v of VUELTAS) {
      const k = fase(t, T.envuelve0 + v.t, T.envuelve0 + v.t + 0.32);
      if (k <= 0) continue;
      const apr = rebote(fase(t, T.envuelve0 + v.t + 0.15, T.envuelve0 + v.t + 0.55), 2.2);
      const rx = rx0 * lerp(1.6, 1, apr), ry = lerp(26, 9, apr);
      const y = v.y + (pG.pelvis.y - G.PELVIS.y) * S * 0.5;
      const barre = suave(k);
      g.save(); g.translate(cx, y); g.rotate(v.ang);
      g.lineCap = "round";
      const a0 = delante ? 0 : Math.PI, a1 = a0 + Math.PI * barre;
      g.beginPath(); g.ellipse(0, 0, rx, ry, 0, a0, a1);
      g.strokeStyle = "#b8740f"; g.lineWidth = 5.4; g.stroke(); g.strokeStyle = "#ffd54a"; g.lineWidth = 3.4; g.stroke();
      g.translate(0, -0.8); g.strokeStyle = "rgba(255,248,200,0.85)"; g.lineWidth = 1.1; g.stroke();
      g.restore();
    }
  }

  /* ================= efectos ================= */
  function golpeColumna(g, t) {
    const k = fase(t, T.choque, T.choque + 0.35); if (k <= 0 || k >= 1) return;
    g.save(); g.globalAlpha = 1 - k; g.strokeStyle = "#fff6d8"; g.lineWidth = 3; g.lineCap = "round";
    const cx = COL.x - COL.r - 4, cy = 330;
    for (let i = 0; i < 5; i++) { const a = Math.PI * (0.65 + 0.18 * i), r0 = 14 + 22 * salida(k), r1 = r0 + 12; g.beginPath(); g.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0); g.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1); g.stroke(); }
    g.restore();
  }
  // mancha de queso que queda en la columna al soltarse
  function manchaColumna(g, t, yc) {
    if (t < T.tiron) return;
    const a = tramo(t, T.tiron, T.tiron + 0.1);
    g.save(); g.globalAlpha = a; g.fillStyle = "#f2c443"; g.strokeStyle = "#b8740f"; g.lineWidth = 1.2;
    g.beginPath(); g.ellipse(COL.x, yc + 2, COL.r - 2, 4, 0, 0, Math.PI); g.lineTo(COL.x - COL.r + 2, yc + 2); g.closePath(); g.fill(); g.stroke();
    // goterón que va bajando un poco
    const dg = 10 * tramo(t, T.tiron + 0.1, T.tiron + 2.5);
    g.beginPath(); g.moveTo(COL.x + 4, yc + 5); g.quadraticCurveTo(COL.x + 7, yc + 8 + dg, COL.x + 5, yc + 10 + dg); g.quadraticCurveTo(COL.x + 2, yc + 8 + dg, COL.x + 2, yc + 5); g.fill(); g.stroke();
    g.restore();
  }
  // las narices se tocan: chispita y dos rayitas
  function boop(g, t, pG) {
    const k = fase(t, T.boop - 0.02, T.boop + 0.45); if (k <= 0 || k >= 1) return;
    const n = G.aPantalla(pG, G.cabeza(pG).a(NARIZ_G)), a = Math.sin(Math.PI * Math.sqrt(k));
    g.save(); g.globalAlpha = a; g.fillStyle = "#fffbe8"; g.strokeStyle = "#fffbe8"; g.lineCap = "round"; g.lineWidth = 1.6;
    const r = 7 + 5 * salida(k), cx = n.x + 1, cy = n.y - 9 - 4 * k;
    g.beginPath(); for (let i = 0; i < 8; i++) { const rr = i % 2 ? r * 0.18 : r, an = i * Math.PI / 4; g.lineTo(cx + Math.cos(an) * rr, cy + Math.sin(an) * rr); } g.closePath(); g.fill();
    for (const s of [-1, 1]) { const d = 9 + 6 * salida(k); g.beginPath(); g.moveTo(n.x + s * d, n.y - 2); g.lineTo(n.x + s * (d + 5), n.y - 5); g.stroke(); }
    g.restore();
  }
  function lineasVuelo(g, t, pG, pD) {
    const a = campana(t, T.vuela0, T.vuela1); if (a <= 0.02) return;
    g.save(); g.strokeStyle = `rgba(255,245,220,${0.55 * a})`; g.lineWidth = 3; g.lineCap = "round";
    for (const [p, s] of [[pG, -1], [pD, 1]]) for (let i = 0; i < 4; i++) {
      const y = SUELO - 150 - i * 34 - 70 * a, x = p.x + s * (70 + 20 * hash(i + (s > 0 ? 5 : 0)));
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + s * (60 + 40 * hash(i + 11)), y); g.stroke();
    }
    g.restore();
  }
  function polvo(g, t, x) {
    const k = fase(t, T.vuela1 - 0.02, T.vuela1 + 0.5); if (k <= 0 || k >= 1) return;
    g.save(); g.fillStyle = "#e8dcc4";
    for (let i = 0; i < 6; i++) { const s = i % 2 ? 1 : -1, d = 18 + 50 * salida(k) * (0.6 + 0.5 * hash(i + 40)); g.globalAlpha = 0.5 * (1 - k); g.beginPath(); g.arc(x + s * d, SUELO - 4 - 10 * hash(i + 41) * k, 5 + 9 * k, 0, Math.PI * 2); g.fill(); }
    g.restore();
  }
  // vibración de la columna al soltarse el hilo
  function vibraColumna(g, t) {
    const k = fase(t, T.tiron, T.tiron + 0.45); if (k <= 0 || k >= 1) return;
    g.save(); g.globalAlpha = 0.7 * (1 - k); g.strokeStyle = "#fff6d8"; g.lineWidth = 2.5; g.lineCap = "round";
    for (const s of [-1, 1]) for (let i = 0; i < 3; i++) { const x = COL.x + s * (COL.r + 8 + i * 7 + 10 * k), y0 = 300 + i * 12; g.beginPath(); g.moveTo(x, y0); g.quadraticCurveTo(x + s * 5, y0 + 18, x, y0 + 36); g.stroke(); }
    g.restore();
  }

  /* ================= escena ================= */
  const pose = t => ({ g: poseG(t), d: poseD(t) });
  // cámara: plano de los dos con la pizza; se abre a toda la pizzería; vuelve con el tirón y se acerca a las narices
  const PLANOS = [
    [0, 1.14, 512, 300], [1.3, 1.24, 512, 288], [2.4, 1.24, 512, 288], [3.4, 1.0, 512, 300], [5.3, 0.705, 522, 330],
    [7.9, 0.735, 522, 322], [8.25, 0.735, 522, 322], [8.95, 1.3, 730, 282], [9.9, 1.42, 730, 262], [11.7, 1.95, 728, 236], [DUR, 2.02, 728, 234]
  ];
  function camara(t) {
    let i = 0; while (i < PLANOS.length - 2 && t > PLANOS[i + 1][0]) i++;
    const a = PLANOS[i], b = PLANOS[i + 1], k = suave(fase(t, a[0], b[0]));
    const kk = lerp(a[1], b[1], k), x = lerp(a[2], b[2], k), y = lerp(a[3], b[3], k);
    const mx = W / 2 / kk, my = H / 2 / kk;
    return { k: kk, x: clamp(x, X0 + mx, X0 + AN - mx), y: clamp(y, Y0 + my, Y0 + AL - my) };
  }

  class GuillermoDariPizza extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !Da.listo()) return;
      if (!fondo) fondo = creaFondo();
      if (memo.size > 400) memo.clear();
      const pG = poseG(t), pD = poseD(t);
      const luz = tramo(t, NEGRO_INICIO, 0.8, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t);
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      MATRIZ = g.getTransform();
      g.drawImage(fondo, X0, Y0);
      llamas(g, t);
      const h = hilo(t, pG, pD);
      const ycol = cache("ycol", () => { const hh = hilo(T.tiron - 0.01, poseG(T.tiron - 0.01), poseD(T.tiron - 0.01)); return hh && hh.tramos[1] && hh.tramos[1].arco ? hh.tramos[1].arco.y : 380; });
      manchaColumna(g, t, ycol);
      vibraColumna(g, t);
      // sombras
      g.save(); g.fillStyle = "rgba(20,6,0,0.3)";
      g.beginPath(); g.ellipse(pG.x + 4, SUELO + 2, 60 * (1 - 0.5 * campana(t, T.vuela0, T.vuela1)), 7, 0, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.ellipse(pD.x - 4, pD.suelo + 2, 58 * (1 - 0.5 * campana(t, T.vuela0, T.vuela1)), 7, 0, 0, Math.PI * 2); g.fill(); g.restore();
      pizzaMesa(g, t);
      // porciones que no están en la mano (en la mesa antes de cogerlas, por el aire o en el suelo)
      if (t < T.toma) { porcion(g, PIZZA.x - PIZZA.R, PIZZA.y, 0, PIZZA.sq, 0); porcion(g, PIZZA.x + PIZZA.R, PIZZA.y, Math.PI, PIZZA.sq, 0); }
      for (const pr of [pG._porcion, pD._porcion]) if (pr && !pr.mano) porcion(g, pr.x, pr.y, pr.ang, pr.sq, pr.cae);
      golpeColumna(g, t);
      lineasVuelo(g, t, pG, pD);
      vueltas(g, t, pG, pD, false);
      Da.dibujar(g, pD, t);
      G.dibujar(g, pG, t);
      if (h) hebra(g, h.tramos, h.w);
      vueltas(g, t, pG, pD, true);
      boop(g, t, pG);
      polvo(g, t, (XGf + XDf) / 2);
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00056", nombre: "Guillermo y Dari · La pizza", crear: () => new GuillermoDariPizza() });
  window.__A2D_00056 = { pose, poseG, poseD, T, DUR };
})();
