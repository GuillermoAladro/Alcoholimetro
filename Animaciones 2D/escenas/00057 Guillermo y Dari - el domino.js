"use strict";
/* 00057 · Guillermo y Dari · El dominó
 *
 * Negro → bar de barrio de noche: pared crema con una cenefa de azulejos azules, zócalo de azulejo verde,
 * botellero con espejo, dos jamones colgados, reloj sin números, diana y tres lámparas sobre una barra
 * larga de madera (con la caña de Dari en la punta). En la barra, 36 fichas de dominó serpentean desde
 * Guillermo hasta Dari, dan media vuelta delante de él, suben una rampita (una regla apoyada en un libro) y
 * acaban en una ficha negra, de pie sobre el libro, junto a un balancín (otra regla sobre un corcho) con una
 * campanita en la punta baja. Las fichas son cajitas en 3D con sus puntos; cada una cae girando sobre su
 * canto cuando la anterior la toca y se queda apoyada en la siguiente. Los dos lo admiran (Guillermo levanta
 * el pulgar, a Dari le brillan las gafas) → a Guillermo le pica la nariz: «ah… ah…», la cabeza hacia atrás
 * → Dari lo ve y, sin decir nada, agita las dos manos: «¡no, no, no!» → Guillermo se aguanta con el dedo
 * bajo la nariz; alivio de los dos → vuelve el picor, más fuerte → ¡achís! La ráfaga y las gotitas tumban
 * la primera ficha → Dari se queda helado con las manos arriba; Guillermo se tapa la boca → pero la cadena
 * funciona: la cámara sigue a la ficha que cae, que da la vuelta delante de Dari (se agacha a mirarla, le
 * brillan las gafas) y vuelve hacia Guillermo, que se muerde el puño (Dari aprieta los suyos bajo la
 * barbilla) → la cadena sube la rampa cada vez más despacio; la cámara se acerca a la ficha negra, que se tambalea, se queda en el filo… y cae sobre el
 * balancín → la campanita sale volando, sonando y dando vueltas, sube por encima de los dos y cae boca abajo
 * sobre la cabeza de Guillermo (¡dong!, estrellitas) y se le queda puesta como un sombrero → Guillermo,
 * mareado (ojos en espiral), acaba sonriendo y levantando el pulgar (la campanita vuelve a sonar); Dari aplaude
 * → negro.
 *
 * Sin textos. Todo depende del tiempo absoluto `t`.
 */
(() => {
  const { clamp, lerp, fase, suave, salida, entrada, tramo, campana, ruido, hash } = M2;
  const G = Guillermo, Da = Dari;
  const S = 0.30, SUELO = 560;
  const XG = 228, XD = 792;                     // pelvis de Guillermo y de Dari (Dari mira a la izquierda)
  const DUR = 14.1;

  /* ================= la barra en 3D =================
   * Proyección oblicua: X → x de pantalla; el fondo Z (hacia la cámara) baja y la altura Y sube. */
  const SA = 0.36, CA = 0.933;
  const YB = 312, ZD = 150, HB = 238;           // borde de atrás de la tapa (y), fondo y alto de la barra
  const BX0 = 300, BX1 = 726;                   // extremos de la barra
  const P3 = (X, Y, Z) => ({ x: X, y: YB + Z * SA - Y * CA });
  const TINTA = "#0b0a0e";

  /* ---------- recorrido de las fichas ---------- */
  const DH = 26, DW = 13, DT = 5, PASO = 16;    // alto, ancho y grueso de una ficha; distancia entre fichas
  const ZF = 130;                               // carril de delante
  const LIBRO = { x0: 554, x1: 582, z0: 116, z1: 144, h: 22 };      // el libro donde apoya la rampa
  const RAMPA = { x0: 648, x1: 582 };                                // la regla inclinada (de la barra al libro)
  const FINAL = { X: LIBRO.x0 + 12, Y: LIBRO.h, Z: ZF };            // la última ficha, de pie sobre el libro
  const SERP = { x0: 330, semi: 64, n: 5, amp: 18, zc: 46 };        // serpiente: de Guillermo hacia Dari
  const RUTA = (() => {
    const P = [], { x0, semi, n, amp, zc } = SERP;
    for (let i = 0; i <= 150; i++) { const X = x0 + semi * n * i / 150; P.push({ X, Y: 0, Z: zc - amp * Math.cos(Math.PI * (X - x0) / semi) }); }
    // gancho: media vuelta hacia delante, junto a Dari
    const XH = x0 + semi * n, Z0 = zc + amp, R = (ZF - Z0) / 2;
    for (let i = 1; i <= 30; i++) { const a = -Math.PI / 2 + Math.PI * i / 30; P.push({ X: XH + R * Math.cos(a), Y: 0, Z: Z0 + R + R * Math.sin(a) }); }
    for (let i = 1; i <= 6; i++) P.push({ X: lerp(XH, RAMPA.x0, i / 6), Y: 0, Z: ZF });
    // rampa y libro
    for (let i = 1; i <= 20; i++) { const k = i / 20; P.push({ X: lerp(RAMPA.x0, RAMPA.x1, k), Y: LIBRO.h * k, Z: ZF }); }
    for (let i = 1; i <= 8; i++) P.push({ X: lerp(RAMPA.x1, FINAL.X - 4, i / 8), Y: LIBRO.h, Z: ZF });
    const d = [0];
    for (let i = 1; i < P.length; i++) d.push(d[i - 1] + Math.hypot(P[i].X - P[i - 1].X, P[i].Y - P[i - 1].Y, P[i].Z - P[i - 1].Z));
    return { P, d, L: d[d.length - 1] };
  })();
  function enRuta(s) {
    const { P, d } = RUTA; let i = 1; while (i < d.length - 1 && d[i] < s) i++;
    const k = clamp((s - d[i - 1]) / Math.max(1e-6, d[i] - d[i - 1])), a = P[i - 1], b = P[i];
    const L = Math.hypot(b.X - a.X, b.Y - a.Y, b.Z - a.Z) || 1;
    return { X: lerp(a.X, b.X, k), Y: lerp(a.Y, b.Y, k), Z: lerp(a.Z, b.Z, k), h: { x: (b.X - a.X) / L, y: (b.Y - a.Y) / L, z: (b.Z - a.Z) / L } };
  }
  // fichas: base, ejes (avance h, través c, arriba u) y el instante en que empiezan a caer
  const T = {
    admira: 0.35, dGafas: 0.95, dEmpuja: 1.12, dBrillo: 1.32, dGafas1: 1.4, gPulgar: 1.25, gPulgar1: 1.95, miran: 1.75, asienten: 2.0,
    pica: 2.45, aspira1: 2.7, suelta1: 3.05, aspira2: 3.2,
    dVe: 2.78, dNo0: 3.0,
    dedo: 3.48, aguanta: 3.55, alivio: 3.92, baja: 4.12,
    dAlivio: 3.98,
    vuelve: 4.36, aspira3: 4.48, dNo2: 4.42,
    achis: 5.05, cadena: 5.2
  };
  const FICHAS = (() => {
    const F = [];
    const sFin = (() => { let best = 0, dm = 1e9; for (let s = RUTA.L - 30; s <= RUTA.L; s += 0.25) { const q = enRuta(s), dd = Math.abs(q.X - FINAL.X) + Math.abs(q.Y - FINAL.Y); if (dd < dm) { dm = dd; best = s; } } return best; })();
    for (let s = sFin; s >= 0; s -= PASO) F.unshift(s);
    return F.map((s, i) => {
      // en la rampa también están de pie (verticales), como en escalones
      const q = enRuta(s), hl = Math.hypot(q.h.x, q.h.z) || 1, h = { x: q.h.x / hl, y: 0, z: q.h.z / hl }, c = { x: -h.z, y: 0, z: h.x }, u = { x: 0, y: 1, z: 0 };
      return { i, s, B: { x: q.X, y: q.Y, z: q.Z }, h, c, u, pa: 1 + Math.floor(hash(i * 3 + 1) * 6), pb: Math.floor(hash(i * 3 + 2) * 7) };
    });
  })();
  const N = FICHAS.length;
  // ritmo: arranca despacio, corre, frena al subir la rampa; la última se lo piensa
  (() => {
    let t = T.cadena;
    for (let i = 0; i < N; i++) {
      FICHAS[i].t0 = t;
      const F = FICHAS[i], sube = F.B.y > 0.5 || (i + 1 < N && FICHAS[i + 1].B.y > 0.5);
      let dt = 0.088;
      if (i < 5) dt = [0.2, 0.15, 0.12, 0.105, 0.095][i];
      if (sube) dt = 0.13 + 0.035 * Math.max(0, FICHAS[i + 1] ? FICHAS[i + 1].B.y / 6 : 0);
      if (i === N - 2) dt = 0.24;
      t += dt;
    }
  })();
  T.ultima = FICHAS[N - 1].t0;                  // la penúltima la toca: se tambalea
  T.cae = T.ultima + 0.62;                      // se pasa del punto de equilibrio
  T.palanca = T.cae + 0.2;                      // toca el balancín
  T.lanza = T.palanca + 0.035;                  // la campanita sale volando
  T.bonk = T.lanza + 0.78;                      // le cae en la cabeza
  Object.assign(T, {
    arriba: T.lanza + 0.08, mareo: T.bonk + 0.35, dAplaude0: T.bonk + 0.5, dAplaude1: T.bonk + 2.25,
    gPulgar2: T.bonk + 1.35, sonrie: T.bonk + 1.1, fin: DUR - 0.75
  });
  const TC = Math.asin((PASO - DT) / DH), TF = 1.1, ANG_FIN = 1.72;          // ángulo al tocar la siguiente y ángulo final, tumbada
  // la última: se balancea, se queda en el filo… y cae sobre la punta alta del balancín
  function anguloUltima(t) {
    if (t <= T.ultima) return 0;
    const u = t - T.ultima;
    if (t <= T.cae) return 0.24 * Math.sin(Math.PI * fase(u, 0, 0.24)) + 0.19 * suave(fase(u, 0.27, T.cae - T.ultima));
    if (t <= T.palanca) return lerp(0.19, CONTACTO, entrada(fase(t, T.cae, T.palanca)));
    return lerp(CONTACTO, ANG_FIN, salida(fase(t, T.palanca, T.palanca + 0.1))) - 0.06 * campana(t, T.palanca + 0.1, T.palanca + 0.2);
  }
  function angulos(t) {
    const th = new Array(N).fill(0);
    for (let i = N - 1; i >= 0; i--) {
      const F = FICHAS[i], u = t - F.t0;
      if (u <= 0) continue;
      if (i === N - 1) { th[i] = anguloUltima(t); continue; }
      const dt = FICHAS[i + 1].t0 - F.t0;
      if (u < dt) { const k = u / dt; th[i] = TC * k * (0.35 + 0.65 * k); }
      else {
        const fin = i === N - 2 ? ANG_FIN : TF;
        th[i] = TC + (TF - TC) * clamp(th[i + 1] / fin) - 0.07 * campana(u, dt, dt + 0.09);
      }
    }
    return th;
  }
  // la ficha que está cayendo ahora (para seguirla con la cámara y con los ojos)
  function frente(t) {
    if (t <= FICHAS[0].t0) return FICHAS[0].B;
    let i = 0; while (i < N - 1 && FICHAS[i + 1].t0 <= t) i++;
    if (i >= N - 1) return FICHAS[N - 1].B;
    const k = (t - FICHAS[i].t0) / (FICHAS[i + 1].t0 - FICHAS[i].t0), a = FICHAS[i].B, b = FICHAS[i + 1].B;
    return { x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), z: lerp(a.z, b.z, k) };
  }
  const frentePant = t => { const f = frente(t); return P3(f.x, f.y + DH * 0.5, f.z); };

  /* ---------- balancín: regla sobre un corcho; la campanita en la punta baja ---------- */
  const PIV_U = { x: FINAL.X - DT / 2, y: LIBRO.h };                 // canto sobre el que cae la última ficha (X, Y)
  const DXC = 19;                                                     // de ese canto a la punta alta de la regla
  const PUNTA_ALTA = { x: PIV_U.x - DXC, y: LIBRO.h + Math.sqrt(DH * DH - DXC * DXC) };
  const CORCHO = { x: 0, h: 12, r: 6 };
  const REGLA = { a: 58, b: 24, z0: ZF - 10, z1: ZF + 10, g: 2.2 };   // del corcho a la punta alta (a) y a la baja (b)
  const PSI0 = Math.asin((PUNTA_ALTA.y - CORCHO.h) / REGLA.a);
  CORCHO.x = PUNTA_ALTA.x - REGLA.a * Math.cos(PSI0);
  const PSI1 = -Math.asin(CORCHO.h / REGLA.a);
  const CONTACTO = Math.asin(DXC / DH);
  const psi = t => {
    if (t <= T.palanca) return PSI0;
    const k = fase(t, T.palanca, T.palanca + 0.075);
    return lerp(PSI0, PSI1, salida(k)) + 0.06 * Math.sin((t - T.palanca - 0.075) * 40) * Math.exp(-(t - T.palanca - 0.075) * 14) * (k >= 1 ? 1 : 0);
  };
  const enRegla = (r, al, t) => { const a = psi(t), c = Math.cos(a), s = Math.sin(a); return { X: CORCHO.x + r * c - al * s, Y: CORCHO.h + r * s + al * c }; };

  /* ---------- campanita ---------- */
  const R_CAMP = -REGLA.b + 7;                  // dónde está sentada en la regla
  const ESC_B = 1.55;
  function campanaEnRegla(t) {
    const q = enRegla(R_CAMP, REGLA.g, t), p = P3(q.X, q.Y, ZF), a = psi(t);
    return { x: p.x, y: p.y, rot: -Math.atan2(Math.sin(a) * CA, Math.cos(a)), esc: 1 };
  }

  /* ---------- utilidades (como en las otras escenas de Dari) ---------- */
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
  const GRAV = 1800;
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
  // mirada hacia un punto de la pantalla desde la cara (en el marco del personaje: x > 0 es hacia delante)
  function mirarA(desde, a, espejo) {
    const dx = (a.x - desde.x) * (espejo ? -1 : 1), dy = a.y - desde.y, d = Math.hypot(dx, dy) || 1;
    return { mx: clamp(dx / d * 1.05, -1, 1), my: clamp(dy / d * 1.15, -1, 1) };
  }

  /* ================= dibujo de las fichas ================= */
  const VIS = { x: 0, y: SA, z: CA };
  const LUZ = (() => { const l = { x: -0.35, y: 0.85, z: 0.4 }, n = Math.hypot(l.x, l.y, l.z); return { x: l.x / n, y: l.y / n, z: l.z / n }; })();
  const pdot = (a, b) => a.x * b.x + a.y * b.y + a.z * b.z;
  const PIPS = [[], [[0, 0]], [[-1, -1], [1, 1]], [[-1, -1], [0, 0], [1, 1]], [[-1, -1], [1, -1], [-1, 1], [1, 1]],
    [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]], [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]]];
  // marfil para todas; la última es negra con puntos blancos (se distingue entre el lío de fichas caídas)
  const COLF = { claro: [[251, 245, 230], [206, 192, 156], "#2b2016", "#1c140e"], negra: [[78, 73, 88], [30, 27, 36], "#0b0a0e", "#f6f0e0"] };
  // tono continuo según la luz (sin saltos de color mientras gira)
  function tono(n, P) { const k = clamp((0.5 + 0.5 * pdot(n, LUZ) - 0.3) / 0.45), a = P[1], b = P[0];
    return `rgb(${Math.round(lerp(a[0], b[0], k))},${Math.round(lerp(a[1], b[1], k))},${Math.round(lerp(a[2], b[2], k))})`; }
  function ficha(g, F, th) {
    const { B, h, c, u } = F, ct = Math.cos(th), st = Math.sin(th);
    const u2 = { x: u.x * ct + h.x * st, y: u.y * ct + h.y * st, z: u.z * ct + h.z * st };
    const h2 = { x: h.x * ct - u.x * st, y: h.y * ct - u.y * st, z: h.z * ct - u.z * st };
    const pv = { x: B.x + h.x * DT / 2, y: B.y + h.y * DT / 2, z: B.z + h.z * DT / 2 };
    const V = (a, b, e) => P3(pv.x + h2.x * a + c.x * b + u2.x * e, pv.y + h2.y * a + c.y * b + u2.y * e, pv.z + h2.z * a + c.z * b + u2.z * e);
    const w = DW / 2;
    const q = {};
    for (const a of [0, 1]) for (const b of [0, 1]) for (const e of [0, 1]) q[`${a}${b}${e}`] = V(-a * DT, (b ? 1 : -1) * w, e * DH);
    const caras = [
      { n: h2, k: ["000", "010", "011", "001"], pips: true },
      { n: { x: -h2.x, y: -h2.y, z: -h2.z }, k: ["100", "110", "111", "101"] },
      { n: u2, k: ["001", "011", "111", "101"] },
      { n: c, k: ["010", "110", "111", "011"] },
      { n: { x: -c.x, y: -c.y, z: -c.z }, k: ["000", "100", "101", "001"] }
    ];
    const PAL = F.i === N - 1 ? COLF.negra : COLF.claro;
    g.lineJoin = "round"; g.strokeStyle = PAL[2]; g.lineWidth = 1.05;
    for (const f of caras) {
      const vv = pdot(f.n, VIS); if (vv <= 0.02) continue;
      g.beginPath(); f.k.forEach((n, j) => { const p = q[n]; if (j) g.lineTo(p.x, p.y); else g.moveTo(p.x, p.y); }); g.closePath();
      g.fillStyle = tono(f.n, PAL); g.fill(); g.stroke();
      if (f.pips && vv > 0.12) {
        // raya del medio y puntos (aparecen poco a poco según se ve la cara)
        g.save(); g.globalAlpha = clamp((vv - 0.12) / 0.14);
        const m0 = V(0, -w, DH / 2), m1 = V(0, w, DH / 2);
        g.fillStyle = PAL[3]; if (F.i === N - 1) g.strokeStyle = PAL[3];
        g.beginPath(); g.moveTo(lerp(m0.x, m1.x, 0.12), lerp(m0.y, m1.y, 0.12)); g.lineTo(lerp(m0.x, m1.x, 0.88), lerp(m0.y, m1.y, 0.88)); g.stroke();
        const r = 0.95 * Math.sqrt(vv);
        for (const [mitad, n] of [[0, F.pa], [1, F.pb]]) for (const [px, py] of PIPS[n]) {
          const p = V(0, px * w * 0.52, DH * (0.25 + 0.5 * mitad) + py * DH * 0.13);
          g.beginPath(); g.arc(p.x, p.y, r, 0, Math.PI * 2); g.fill();
        }
        g.restore();
      }
    }
  }

  /* ---------- balancín, corcho y campanita ---------- */
  function balancin(g, t) {
    const a = psi(t), c = Math.cos(a), s = Math.sin(a);
    // corcho
    const cb = P3(CORCHO.x, 0, ZF), ct = P3(CORCHO.x, CORCHO.h - 1, ZF), r = CORCHO.r;
    g.save(); g.lineJoin = "round"; g.strokeStyle = TINTA; g.lineWidth = 1.1;
    g.fillStyle = "#c8945a"; g.beginPath(); g.moveTo(cb.x - r, cb.y); g.lineTo(ct.x - r * 0.9, ct.y); g.lineTo(ct.x + r * 0.9, ct.y); g.lineTo(cb.x + r, cb.y);
    g.ellipse(cb.x, cb.y, r, r * SA, 0, 0, Math.PI); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#a8743e"; for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(cb.x - 2.5 + hash(i + 70) * 5, cb.y - 2 - hash(i + 71) * 8, 0.6, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = "#deb07a"; g.beginPath(); g.ellipse(ct.x, ct.y, r * 0.9, r * 0.9 * SA, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    // regla: tapa de arriba y canto de delante
    const E = (rr, al, z) => { const X = CORCHO.x + rr * c - al * s, Y = CORCHO.h + rr * s + al * c; return P3(X, Y, z); };
    const { a: la, b: lb, z0, z1, g: gr } = REGLA;
    const A0 = E(-lb, gr, z0), A1 = E(la, gr, z0), A2 = E(la, gr, z1), A3 = E(-lb, gr, z1);
    const F0 = E(-lb, 0, z1), F1 = E(la, 0, z1);
    g.fillStyle = "#e9c25a"; g.beginPath(); g.moveTo(A0.x, A0.y); g.lineTo(A1.x, A1.y); g.lineTo(A2.x, A2.y); g.lineTo(A3.x, A3.y); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#b8902e"; g.beginPath(); g.moveTo(A3.x, A3.y); g.lineTo(A2.x, A2.y); g.lineTo(F1.x, F1.y); g.lineTo(F0.x, F0.y); g.closePath(); g.fill(); g.stroke();
    g.strokeStyle = "rgba(60,40,10,0.75)"; g.lineWidth = 0.7;
    for (let i = 1; i < 16; i++) { const rr = lerp(-lb, la, i / 16), p = E(rr, gr, z1), q = E(rr, gr, z1 - (i % 4 === 0 ? 7 : 3.5)); g.beginPath(); g.moveTo(p.x, p.y); g.lineTo(q.x, q.y); g.stroke(); }
    g.restore();
  }
  // campanita: (x, y) el centro de la boca; mira hacia arriba con rot = 0
  let SPR_CAMP = null;
  const CS = 3, CW = 34, CH = 44;
  function creaCampana() {
    const cv = document.createElement("canvas"); cv.width = CW * CS; cv.height = CH * CS; const g = cv.getContext("2d");
    g.scale(CS, CS); g.translate(CW / 2, CH - 3); g.lineJoin = "round"; g.lineCap = "round";
    // badajo asomando por la boca
    g.fillStyle = "#6b4a1a"; g.beginPath(); g.arc(0, 1.2, 2.2, 0, Math.PI * 2); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 0.9; g.stroke();
    const cuerpo = () => { g.beginPath(); g.moveTo(-12.5, 0); g.quadraticCurveTo(-11, -2, -8.6, -6); g.bezierCurveTo(-7, -9, -6.6, -16, -5.6, -19);
      g.quadraticCurveTo(0, -22.5, 5.6, -19); g.bezierCurveTo(6.6, -16, 7, -9, 8.6, -6); g.quadraticCurveTo(11, -2, 12.5, 0);
      g.quadraticCurveTo(0, 2.6, -12.5, 0); g.closePath(); };
    const lg = g.createLinearGradient(-12, 0, 12, 0); lg.addColorStop(0, "#9a6a12"); lg.addColorStop(0.3, "#f7d76a"); lg.addColorStop(0.55, "#e4b23a"); lg.addColorStop(1, "#7a520c");
    cuerpo(); g.fillStyle = lg; g.fill();
    g.save(); cuerpo(); g.clip(); g.fillStyle = "rgba(255,255,240,0.75)"; g.fillRect(-5.2, -20, 1.6, 20); g.fillStyle = "rgba(120,70,0,0.35)"; g.fillRect(-13, -2.6, 26, 3); g.restore();
    cuerpo(); g.strokeStyle = "#2a1a04"; g.lineWidth = 1.1; g.stroke();
    // borde de la boca
    g.beginPath(); g.ellipse(0, 0, 12.5, 2.2, 0, 0, Math.PI); g.strokeStyle = "#5a3a06"; g.lineWidth = 1; g.stroke();
    // mango de madera
    g.fillStyle = "#5a2e14"; g.beginPath(); g.moveTo(-2.2, -20.5); g.lineTo(-1.8, -28); g.lineTo(1.8, -28); g.lineTo(2.2, -20.5); g.closePath(); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 0.9; g.stroke();
    g.beginPath(); g.ellipse(0, -32, 4.2, 5, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    g.fillStyle = "rgba(255,220,180,0.55)"; g.beginPath(); g.ellipse(-1.4, -33.5, 1.2, 2, -0.3, 0, Math.PI * 2); g.fill();
    return cv;
  }
  function campanita(g, x, y, rot, esc, aplasta = 0) {
    if (!SPR_CAMP) SPR_CAMP = creaCampana();
    g.save(); g.translate(x, y); g.rotate(rot); g.scale(esc * (1 + 0.18 * aplasta) / CS, esc * (1 - 0.22 * aplasta) / CS);
    g.drawImage(SPR_CAMP, -CW / 2 * CS, -(CH - 3) * CS); g.restore();
  }
  // ondas de sonido a los dos lados de la campanita
  function ondas(g, x, y, rot, esc, k, t) {
    if (k <= 0.01) return;
    g.save(); g.translate(x, y); g.rotate(rot); g.scale(esc, esc); g.lineCap = "round";
    for (let i = 0; i < 3; i++) {
      const ph = (t * 3.2 + i / 3) % 1, r = 16 + 16 * ph;
      g.globalAlpha = k * Math.sin(Math.PI * ph); g.strokeStyle = "#fff2b0"; g.lineWidth = 2.6;
      for (const sg of [-1, 1]) { g.beginPath(); g.arc(0, -12, r, sg > 0 ? -0.55 : Math.PI - 0.55, sg > 0 ? 0.55 : Math.PI + 0.55); g.stroke(); }
      g.strokeStyle = "rgba(60,40,0,0.55)"; g.lineWidth = 0.8;
      for (const sg of [-1, 1]) { g.beginPath(); g.arc(0, -12, r + 1.6, sg > 0 ? -0.5 : Math.PI - 0.5, sg > 0 ? 0.5 : Math.PI + 0.5); g.stroke(); }
    }
    g.restore();
  }

  /* ---------- Guillermo: coronilla y nariz (retrato) ---------- */
  const CORONA = { x: 812, y: 268 }, NARIZ = { x: 912, y: 688 };
  const coronaG = p => G.aPantalla(p, G.cabeza(p).a(CORONA));
  const coronaEn = t => cache("cor" + t, () => { const p = poseG(t); return { c: coronaG(p), ang: p.cabeza.ang }; });
  // vuelo de la campanita: de la regla a la cabeza (tiro parabólico exacto)
  function vueloCampana() {
    return cache("vuelo", () => {
      const s0 = campanaEnRegla(T.lanza), fin = coronaEn(T.bonk), tau = T.bonk - T.lanza;
      const vx = (fin.c.x - s0.x) / tau, vy = (fin.c.y - s0.y - 0.5 * GRAV * tau * tau) / tau;
      const giros = -2, w = (fin.ang + 2 * Math.PI * giros - s0.rot) / tau;
      return { x0: s0.x, y0: s0.y, r0: s0.rot, vx, vy, w, tau };
    });
  }
  const ASIENTO = 3;                            // la boca de la campana se hunde un poco en el pelo
  function estadoCampana(t, pG) {
    if (t < T.lanza) return Object.assign(campanaEnRegla(t), { modo: "regla" });
    const V = vueloCampana(), u = t - T.lanza;
    if (u < V.tau) {
      const k = u / V.tau;
      return { modo: "aire", x: V.x0 + V.vx * u, y: V.y0 + V.vy * u + 0.5 * GRAV * u * u, rot: V.r0 + V.w * u, esc: lerp(1, ESC_B, salida(clamp(k * 1.6))) };
    }
    const v = u - V.tau, c = coronaG(pG), a = pG.cabeza.ang;
    const bam = 0.38 * Math.sin(v * 13) * Math.exp(-v * 3.2) + 0.07 * mareo(t) * Math.sin(t * 4.2 + 1.1);
    const ap = Math.sin(Math.PI * fase(v, 0, 0.16)) * (1 - fase(v, 0, 0.16));
    const o = rota({ x: 0, y: ASIENTO * suave(fase(v, 0, 0.08)) }, a);
    return { modo: "cabeza", x: c.x + o.x, y: c.y + o.y, rot: a + bam, esc: ESC_B, aplasta: 2.2 * ap };
  }
  const golpe = t => { const k = fase(t, T.bonk, T.bonk + 0.26); return k > 0 && k < 1 ? Math.sin(Math.PI * Math.sqrt(k)) : 0; };
  const mareo = t => tramo(t, T.mareo, T.mareo + 0.4) * (1 - 0.7 * tramo(t, T.sonrie, T.sonrie + 0.5));
  // tilín: cuándo suena la campanita
  const suena = t => 0.8 * tramo(t, T.lanza, T.lanza + 0.05) * (1 - tramo(t, T.bonk - 0.1, T.bonk)) + 1.2 * tramo(t, T.bonk, T.bonk + 0.04) * (1 - tramo(t, T.bonk + 0.5, T.bonk + 1.2))
    + 0.6 * campana(t, T.gPulgar2 + 0.15, T.gPulgar2 + 0.9);

  /* ================= decorado: bar de barrio ================= */
  let fondo = null, barra = null;
  const YP = 446;                               // pie de la pared
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W + 80; c.height = H + 120; const g = c.getContext("2d");
    g.translate(40, 60); g.lineJoin = "round"; g.lineCap = "round";
    // pared crema con un estuco suave
    const pw = g.createLinearGradient(0, -60, 0, YP); pw.addColorStop(0, "#d9c39a"); pw.addColorStop(1, "#efdcb4");
    g.fillStyle = pw; g.fillRect(-40, -60, W + 80, YP + 60);
    g.fillStyle = "rgba(150,110,60,0.06)"; for (let i = 0; i < 140; i++) g.fillRect(-40 + hash(i + 10) * (W + 80), -60 + hash(i + 11) * (YP + 60), 3 + 8 * hash(i + 12), 2);
    // vigas del techo
    g.fillStyle = "#4a2a14"; g.fillRect(-40, -60, W + 80, 34); g.fillStyle = "rgba(255,210,150,0.18)"; g.fillRect(-40, -28, W + 80, 2);
    for (let x = -20; x < W + 40; x += 150) { g.fillStyle = "#3a200e"; g.fillRect(x, -60, 26, 38); }
    // luz cálida de las lámparas sobre la pared
    for (const x of [380, 518, 656]) { const lz = g.createRadialGradient(x, 130, 10, x, 130, 300); lz.addColorStop(0, "rgba(255,214,140,0.28)"); lz.addColorStop(1, "rgba(255,200,120,0)"); g.fillStyle = lz; g.fillRect(-40, -60, W + 80, YP + 60); }
    // botellero con espejo detrás de la barra
    botellero(g, 518, 92);
    // jamones colgados a la izquierda
    jamon(g, 62, 18, 0.06); jamon(g, 122, 26, -0.05);
    // reloj de pared (sin números) y diana
    reloj(g, 900, 92); diana(g, 960, 236);
    // zócalo de azulejos
    azulejos(g);
    // suelo de baldosas en damero
    suelo(g);
    // lámparas
    for (const x of [380, 518, 656]) lampara(g, x);
    // viñeta
    const vi = g.createRadialGradient(512, 300, 300, 512, 300, 740); vi.addColorStop(0, "rgba(0,0,0,0)"); vi.addColorStop(1, "rgba(16,8,4,0.5)");
    g.fillStyle = vi; g.fillRect(-40, -60, W + 80, H + 120);
    return c;
  }
  function botellero(g, x, y) {
    g.save();
    const w = 330, h = 190, x0 = x - w / 2;
    g.fillStyle = "#3b200e"; g.fillRect(x0 - 12, y - 12, w + 24, h + 24);
    const es = g.createLinearGradient(0, y, 0, y + h); es.addColorStop(0, "#5e6e78"); es.addColorStop(1, "#a7b2b0");
    g.fillStyle = es; g.fillRect(x0, y, w, h);
    g.strokeStyle = "rgba(255,255,255,0.22)"; g.lineWidth = 10; for (const xx of [x0 + 60, x0 + 210]) { g.beginPath(); g.moveTo(xx, y + h); g.lineTo(xx + 70, y); g.stroke(); }
    const cols = ["#2f6a36", "#8a4a12", "#d9e4d0", "#7a1a24", "#c9902a", "#2a4a6a", "#4a7a2a", "#e8d9a0"];
    for (let b = 0; b < 2; b++) {
      const yb = y + 82 + b * 92;
      let xx = x0 + 10, i = 0;
      while (xx < x0 + w - 22) {
        const n = b * 30 + i, bw = 12 + 8 * hash(n + 300), bh = 42 + 30 * hash(n + 301), col = cols[Math.floor(hash(n + 302) * cols.length)];
        g.fillStyle = col; g.globalAlpha = 0.92;
        g.beginPath(); g.moveTo(xx, yb); g.lineTo(xx, yb - bh * 0.62); g.quadraticCurveTo(xx, yb - bh * 0.74, xx + bw * 0.34, yb - bh * 0.8); g.lineTo(xx + bw * 0.34, yb - bh);
        g.lineTo(xx + bw * 0.66, yb - bh); g.lineTo(xx + bw * 0.66, yb - bh * 0.8); g.quadraticCurveTo(xx + bw, yb - bh * 0.74, xx + bw, yb - bh * 0.62); g.lineTo(xx + bw, yb); g.closePath(); g.fill();
        g.globalAlpha = 1; g.strokeStyle = "rgba(20,10,4,0.6)"; g.lineWidth = 1.2; g.stroke();
        g.fillStyle = "rgba(255,255,255,0.4)"; g.fillRect(xx + 2.5, yb - bh * 0.6, 2, bh * 0.5);
        g.fillStyle = "rgba(245,235,210,0.85)"; g.fillRect(xx + 1.5, yb - bh * 0.42, bw - 3, bh * 0.2);
        xx += bw + 5 + 4 * hash(n + 303); i++;
      }
      g.fillStyle = "#6b3f1e"; g.fillRect(x0 - 6, yb, w + 12, 7); g.fillStyle = "rgba(255,210,150,0.3)"; g.fillRect(x0 - 6, yb, w + 12, 2);
    }
    g.strokeStyle = "#1c0c04"; g.lineWidth = 3; g.strokeRect(x0 - 12, y - 12, w + 24, h + 24);
    g.restore();
  }
  function jamon(g, x, y, a) {
    g.save(); g.translate(x, y); g.rotate(a); g.lineJoin = "round"; g.lineCap = "round";
    // cuerda y pezuña negra arriba
    g.strokeStyle = "#d8c8a0"; g.lineWidth = 2; g.beginPath(); g.moveTo(0, -80); g.lineTo(0, -4); g.stroke();
    g.beginPath(); g.ellipse(0, 0, 5.5, 4, 0, 0, Math.PI * 2); g.stroke();
    g.fillStyle = "#1a0e08"; g.beginPath(); g.moveTo(-4.5, 2); g.quadraticCurveTo(-7, 12, -5, 22); g.lineTo(6, 22); g.quadraticCurveTo(7.5, 11, 4.5, 2); g.closePath(); g.fill();
    // caña y maza, con la piel curada
    const forma = () => { g.beginPath(); g.moveTo(-5, 21); g.quadraticCurveTo(-7, 44, -18, 70); g.bezierCurveTo(-36, 104, -34, 150, -10, 166); g.bezierCurveTo(10, 178, 32, 160, 30, 128);
      g.bezierCurveTo(28, 96, 12, 66, 7, 44); g.quadraticCurveTo(5, 30, 6, 21); g.closePath(); };
    const jg = g.createLinearGradient(-34, 0, 32, 0); jg.addColorStop(0, "#6a2a0e"); jg.addColorStop(0.4, "#c27a36"); jg.addColorStop(0.75, "#a35a24"); jg.addColorStop(1, "#5a220a");
    forma(); g.fillStyle = jg; g.fill();
    g.save(); forma(); g.clip();
    // tocino blanco por un lado y vetas oscuras
    g.fillStyle = "rgba(250,236,200,0.85)"; g.beginPath(); g.ellipse(26, 128, 12, 36, -0.15, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "rgba(70,20,4,0.45)"; g.lineWidth = 2; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(-22 + i * 8, 92 + i * 6); g.quadraticCurveTo(-14 + i * 8, 120, -18 + i * 9, 150); g.stroke(); }
    g.fillStyle = "rgba(255,230,180,0.35)"; g.beginPath(); g.ellipse(-12, 108, 5, 24, 0.2, 0, Math.PI * 2); g.fill();
    g.restore();
    forma(); g.strokeStyle = "#1c0a04"; g.lineWidth = 2; g.stroke();
    // paragüitas de plástico debajo
    g.fillStyle = "rgba(245,240,225,0.9)"; g.beginPath(); g.moveTo(-10, 178); g.lineTo(16, 178); g.lineTo(3, 192); g.closePath(); g.fill(); g.strokeStyle = "#6a5a40"; g.lineWidth = 1; g.stroke();
    g.restore();
  }
  function reloj(g, x, y) {
    g.save();
    g.fillStyle = "#2a1608"; g.beginPath(); g.arc(x, y, 40, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#f6efdc"; g.beginPath(); g.arc(x, y, 33, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "#2a1608"; for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6, r0 = i % 3 ? 28 : 24; g.lineWidth = i % 3 ? 1.5 : 3; g.beginPath(); g.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0); g.lineTo(x + Math.cos(a) * 31, y + Math.sin(a) * 31); g.stroke(); }
    g.lineWidth = 3.5; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(-2.3) * 18, y + Math.sin(-2.3) * 18); g.stroke();
    g.lineWidth = 2.2; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(-0.6) * 26, y + Math.sin(-0.6) * 26); g.stroke();
    g.fillStyle = "#2a1608"; g.beginPath(); g.arc(x, y, 3, 0, Math.PI * 2); g.fill();
    g.restore();
  }
  function diana(g, x, y) {
    g.save();
    g.fillStyle = "#2a1608"; g.beginPath(); g.arc(x, y, 46, 0, Math.PI * 2); g.fill();
    for (let i = 0; i < 20; i++) { g.fillStyle = i % 2 ? "#1a1a1a" : "#efe2c0"; g.beginPath(); g.moveTo(x, y); g.arc(x, y, 38, i * Math.PI / 10 - Math.PI / 20, (i + 1) * Math.PI / 10 - Math.PI / 20); g.closePath(); g.fill(); }
    for (const [r, cA, cB] of [[38, "#b82020", "#1f7a3a"], [24, "#b82020", "#1f7a3a"]]) for (let i = 0; i < 20; i++) { g.strokeStyle = i % 2 ? cA : cB; g.lineWidth = 4; g.beginPath(); g.arc(x, y, r - 2, i * Math.PI / 10 - Math.PI / 20, (i + 1) * Math.PI / 10 - Math.PI / 20); g.stroke(); }
    g.fillStyle = "#1f7a3a"; g.beginPath(); g.arc(x, y, 6, 0, Math.PI * 2); g.fill(); g.fillStyle = "#b82020"; g.beginPath(); g.arc(x, y, 3, 0, Math.PI * 2); g.fill();
    // dardos clavados
    for (const [dx, dy, a] of [[-12, -8, -0.5], [14, 6, -0.3]]) { g.strokeStyle = "#333"; g.lineWidth = 2; g.beginPath(); g.moveTo(x + dx, y + dy); g.lineTo(x + dx + Math.cos(a) * 18, y + dy + Math.sin(a) * 18); g.stroke();
      g.fillStyle = "#d83a3a"; g.beginPath(); g.moveTo(x + dx + Math.cos(a) * 14, y + dy + Math.sin(a) * 14); g.lineTo(x + dx + Math.cos(a - 0.4) * 24, y + dy + Math.sin(a - 0.4) * 24); g.lineTo(x + dx + Math.cos(a + 0.4) * 24, y + dy + Math.sin(a + 0.4) * 24); g.closePath(); g.fill(); }
    g.restore();
  }
  // cenefa de azulejos azules a la altura del pecho y zócalo de azulejo verde oscuro debajo (las fichas resaltan)
  function azulejos(g) {
    const y0 = 214, y1 = 280, L = 22;
    g.save();
    g.fillStyle = "#f4f1e8"; g.fillRect(-40, y0, W + 80, y1 - y0);
    for (let j = 0; y0 + j * L < y1; j++) for (let i = 0; -40 + i * L < W + 40; i++) {
      const x = -40 + i * L, y = y0 + j * L, cx = x + L / 2, cy = y + L / 2;
      g.fillStyle = "#2a56a0";
      g.beginPath(); for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2; g.moveTo(cx, cy); g.quadraticCurveTo(cx + Math.cos(a - 0.5) * 9, cy + Math.sin(a - 0.5) * 9, cx + Math.cos(a) * 9, cy + Math.sin(a) * 9); g.quadraticCurveTo(cx + Math.cos(a + 0.5) * 9, cy + Math.sin(a + 0.5) * 9, cx, cy); } g.fill();
      g.fillStyle = "#e8b83a"; g.beginPath(); g.arc(cx, cy, 2, 0, Math.PI * 2); g.fill();
      g.fillStyle = "#2a56a0"; for (const [ax, ay] of [[x, y], [x + L, y], [x, y + L], [x + L, y + L]]) { g.beginPath(); g.arc(ax, ay, 3.2, 0, Math.PI * 2); g.fill(); }
    }
    g.strokeStyle = "rgba(120,130,150,0.35)"; g.lineWidth = 1;
    for (let x = -40; x < W + 40; x += L) { g.beginPath(); g.moveTo(x, y0); g.lineTo(x, y1); g.stroke(); }
    for (let y = y0; y < y1; y += L) { g.beginPath(); g.moveTo(-40, y); g.lineTo(W + 40, y); g.stroke(); }
    // zócalo: azulejo verde botella, brillante
    const zg = g.createLinearGradient(0, y1, 0, YP); zg.addColorStop(0, "#1d4536"); zg.addColorStop(1, "#163428");
    g.fillStyle = zg; g.fillRect(-40, y1, W + 80, YP - y1);
    const Lz = 26;
    for (let j = 0; y1 + j * Lz < YP; j++) for (let i = 0; -40 + i * Lz < W + 40; i++) {
      const x = -40 + i * Lz + (j % 2) * Lz / 2, y = y1 + j * Lz;
      g.fillStyle = `rgba(255,255,255,${0.04 + 0.05 * hash(i * 7 + j * 13)})`; g.fillRect(x + 2, y + 2, Lz - 4, Lz - 4);
      g.fillStyle = "rgba(255,255,255,0.16)"; g.fillRect(x + 4, y + 4, 6, 2);
    }
    g.strokeStyle = "rgba(0,0,0,0.35)"; g.lineWidth = 1.2;
    for (let j = 0; y1 + j * Lz < YP; j++) { const y = y1 + j * Lz; g.beginPath(); g.moveTo(-40, y); g.lineTo(W + 40, y); g.stroke();
      for (let i = 0; -40 + i * Lz < W + 40; i++) { const x = -40 + i * Lz + (j % 2) * Lz / 2; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + Lz); g.stroke(); } }
    // molduras de madera
    for (const y of [y0 - 8, y1]) { g.fillStyle = "#5b3519"; g.fillRect(-40, y, W + 80, 8); g.fillStyle = "rgba(255,210,150,0.3)"; g.fillRect(-40, y, W + 80, 2); }
    g.fillStyle = "#2a1608"; g.fillRect(-40, YP - 9, W + 80, 9);
    g.restore();
  }
  function suelo(g) {
    g.save();
    g.fillStyle = "#e9e0cc"; g.fillRect(-40, YP, W + 80, H + 60 - YP);
    // damero en perspectiva suave
    const filas = [YP];
    for (let i = 1; i < 12; i++) filas.push(YP + (H + 60 - YP) * (Math.pow(1.38, i) - 1) / (Math.pow(1.38, 11) - 1));
    for (let j = 0; j < filas.length - 1; j++) {
      const ya = filas[j], yb = filas[j + 1], ea = 0.45 + 0.55 * (ya - YP) / (H + 60 - YP), eb = 0.45 + 0.55 * (yb - YP) / (H + 60 - YP);
      for (let i = -14; i <= 14; i++) {
        if ((i + j) % 2 === 0) continue;
        const xa0 = 512 + i * 62 * ea, xa1 = 512 + (i + 1) * 62 * ea, xb0 = 512 + i * 62 * eb, xb1 = 512 + (i + 1) * 62 * eb;
        g.fillStyle = "#2c2a30"; g.beginPath(); g.moveTo(xa0, ya); g.lineTo(xa1, ya); g.lineTo(xb1, yb); g.lineTo(xb0, yb); g.closePath(); g.fill();
      }
    }
    const sh = g.createLinearGradient(0, YP, 0, YP + 60); sh.addColorStop(0, "rgba(30,15,5,0.35)"); sh.addColorStop(1, "rgba(30,15,5,0)");
    g.fillStyle = sh; g.fillRect(-40, YP, W + 80, 60);
    g.restore();
  }
  function lampara(g, x) {
    g.save();
    g.strokeStyle = "#1a1208"; g.lineWidth = 2; g.beginPath(); g.moveTo(x, -60); g.lineTo(x, 22); g.stroke();
    const cono = g.createLinearGradient(0, 40, 0, 300); cono.addColorStop(0, "rgba(255,226,160,0.22)"); cono.addColorStop(1, "rgba(255,226,160,0)");
    g.fillStyle = cono; g.beginPath(); g.moveTo(x - 20, 40); g.lineTo(x + 20, 40); g.lineTo(x + 110, 300); g.lineTo(x - 110, 300); g.closePath(); g.fill();
    g.fillStyle = "#1f5a3e"; g.beginPath(); g.moveTo(x - 6, 20); g.lineTo(x + 6, 20); g.quadraticCurveTo(x + 10, 30, x + 30, 42); g.lineTo(x - 30, 42); g.quadraticCurveTo(x - 10, 30, x - 6, 20); g.closePath(); g.fill();
    g.strokeStyle = "#0e2a1c"; g.lineWidth = 1.5; g.stroke();
    g.fillStyle = "rgba(255,255,255,0.25)"; g.beginPath(); g.ellipse(x - 12, 33, 5, 2.5, -0.5, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#fff4cc"; g.beginPath(); g.ellipse(x, 42, 14, 4, 0, 0, Math.PI * 2); g.fill();
    g.restore();
  }
  // la barra, la rampa y el libro: a doble resolución (la cámara se acerca mucho)
  const BAR_R = 2, BAR_X = BX0 - 14, BAR_Y = YB - 14, BAR_W = BX1 - BX0 + 28, BAR_H = 300;
  function creaBarra() {
    const c = document.createElement("canvas"); c.width = BAR_W * BAR_R; c.height = BAR_H * BAR_R; const g = c.getContext("2d");
    g.scale(BAR_R, BAR_R); g.translate(-BAR_X, -BAR_Y); g.lineJoin = "round"; g.lineCap = "round";
    const tf = P3(0, 0, ZD).y, ESP = 7;                               // borde de delante de la tapa y su grosor
    const pie = P3(0, -HB, ZD).y;
    // frente de madera con paneles
    const fr = g.createLinearGradient(0, tf, 0, pie); fr.addColorStop(0, "#5a2e14"); fr.addColorStop(1, "#3a1c0a");
    g.fillStyle = fr; g.fillRect(BX0 + 6, tf + ESP, BX1 - BX0 - 12, pie - tf - ESP);
    for (let i = 0; i < 5; i++) {
      const w = (BX1 - BX0 - 40) / 5, x = BX0 + 20 + i * w;
      g.strokeStyle = "rgba(20,8,2,0.6)"; g.lineWidth = 3; g.strokeRect(x + 6, tf + ESP + 20, w - 12, pie - tf - ESP - 64);
      g.strokeStyle = "rgba(255,190,130,0.16)"; g.lineWidth = 1.5; g.strokeRect(x + 9, tf + ESP + 23, w - 18, pie - tf - ESP - 70);
    }
    g.fillStyle = "rgba(0,0,0,0.35)"; g.fillRect(BX0 + 6, tf + ESP, BX1 - BX0 - 12, 10);
    // barra de latón para los pies
    g.strokeStyle = "#7a5a1a"; g.lineWidth = 7; g.beginPath(); g.moveTo(BX0 + 4, pie - 26); g.lineTo(BX1 - 4, pie - 26); g.stroke();
    g.strokeStyle = "#e8c66a"; g.lineWidth = 3; g.stroke();
    for (const x of [BX0 + 30, (BX0 + BX1) / 2, BX1 - 30]) { g.strokeStyle = "#7a5a1a"; g.lineWidth = 4; g.beginPath(); g.moveTo(x, pie - 26); g.lineTo(x, pie - 10); g.stroke(); }
    g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(BX0 + 6, tf + ESP, BX1 - BX0 - 12, pie - tf - ESP);
    // tapa de madera barnizada
    const tp = g.createLinearGradient(0, YB, 0, tf); tp.addColorStop(0, "#4e2a12"); tp.addColorStop(1, "#6e3c1a");
    g.fillStyle = tp; g.fillRect(BX0, YB, BX1 - BX0, tf - YB);
    g.strokeStyle = "rgba(30,12,2,0.35)"; g.lineWidth = 0.8;
    for (let i = 0; i < 22; i++) { const y = YB + 2 + hash(i + 500) * (tf - YB - 4), x = BX0 + hash(i + 501) * (BX1 - BX0 - 120);
      g.beginPath(); g.moveTo(x, y); g.bezierCurveTo(x + 40, y + 1.5, x + 80, y - 1.5, x + 60 + 80 * hash(i + 502), y + 0.8); g.stroke(); }
    // charcos de luz de las lámparas
    for (const x of [380, 518, 656]) { const lz = g.createRadialGradient(x, (YB + tf) / 2, 4, x, (YB + tf) / 2, 90); lz.addColorStop(0, "rgba(255,220,150,0.3)"); lz.addColorStop(1, "rgba(255,210,140,0)");
      g.save(); g.beginPath(); g.rect(BX0, YB, BX1 - BX0, tf - YB); g.clip(); g.fillStyle = lz; g.fillRect(x - 100, YB, 200, tf - YB); g.restore(); }
    g.strokeStyle = TINTA; g.lineWidth = 1.6; g.strokeRect(BX0, YB, BX1 - BX0, tf - YB);
    // canto redondeado de la tapa
    g.fillStyle = "#7a4520"; g.fillRect(BX0 - 2, tf, BX1 - BX0 + 4, ESP);
    g.fillStyle = "rgba(255,220,170,0.35)"; g.fillRect(BX0 - 2, tf + 1, BX1 - BX0 + 4, 1.5);
    g.strokeStyle = TINTA; g.lineWidth = 1.6; g.strokeRect(BX0 - 2, tf, BX1 - BX0 + 4, ESP);
    // posavasos y servilletero en las puntas (detalles)
    posavasos(g, P3(BX1 - 34, 0, 62)); cana(g, P3(BX1 - 34, 0, 62));
    return c;
  }
  function posavasos(g, p) {
    g.save(); g.fillStyle = "#d8c49a"; g.strokeStyle = "#5a4020"; g.lineWidth = 1;
    g.beginPath(); g.ellipse(p.x, p.y, 13, 13 * SA, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    g.strokeStyle = "#b8442a"; g.beginPath(); g.ellipse(p.x, p.y, 9, 9 * SA, 0, 0, Math.PI * 2); g.stroke(); g.restore();
  }
  // caña de cerveza de Dari en la punta de la barra
  function cana(g, p) {
    g.save(); g.lineJoin = "round";
    const w0 = 7.5, w1 = 9.5, h = 34, x = p.x, y = p.y - 1;
    g.fillStyle = "rgba(10,4,0,0.3)"; g.beginPath(); g.ellipse(x + 3, y + 1, 12, 3.5, 0, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.moveTo(x - w0, y); g.lineTo(x - w1, y - h); g.lineTo(x + w1, y - h); g.lineTo(x + w0, y); g.closePath();
    const cg = g.createLinearGradient(x - w1, 0, x + w1, 0); cg.addColorStop(0, "#c9861c"); cg.addColorStop(0.35, "#f2b83a"); cg.addColorStop(1, "#b0700f");
    g.fillStyle = cg; g.fill();
    g.fillStyle = "rgba(255,255,255,0.5)"; for (let i = 0; i < 5; i++) { g.beginPath(); g.arc(x - 3 + 6 * hash(i + 60), y - 4 - 22 * hash(i + 61), 0.8, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = "#fbf6e8"; g.beginPath(); g.moveTo(x - w1 + 0.3, y - h + 7); g.lineTo(x + w1 - 0.3, y - h + 7); g.lineTo(x + w1, y - h);
    g.quadraticCurveTo(x + w1 + 1, y - h - 6, x + 3, y - h - 5); g.quadraticCurveTo(x, y - h - 8, x - 4, y - h - 5); g.quadraticCurveTo(x - w1 - 1, y - h - 5, x - w1, y - h); g.closePath(); g.fill();
    g.strokeStyle = "rgba(255,255,255,0.7)"; g.lineWidth = 1.6; g.beginPath(); g.moveTo(x - w1 + 2.5, y - h + 9); g.lineTo(x - w0 + 2, y - 3); g.stroke();
    g.strokeStyle = TINTA; g.lineWidth = 1.3; g.beginPath(); g.moveTo(x - w0, y); g.lineTo(x - w1, y - h); g.moveTo(x + w0, y); g.lineTo(x + w1, y - h); g.moveTo(x - w0, y); g.lineTo(x + w0, y); g.stroke();
    g.restore();
  }
  function libro(g) {
    const { x0, x1, z0, z1, h } = LIBRO;
    const a = P3(x0, h, z0), b = P3(x1, h, z0), c = P3(x1, h, z1), d = P3(x0, h, z1), e = P3(x1, 0, z1), f = P3(x0, 0, z1);
    g.save(); g.strokeStyle = TINTA; g.lineWidth = 1.2;
    // sombra
    g.fillStyle = "rgba(10,4,0,0.35)"; const s0 = P3(x0 - 4, 0, z1 + 4), s1 = P3(x1 + 6, 0, z1 + 4); g.beginPath(); g.ellipse((s0.x + s1.x) / 2, s0.y - 2, (s1.x - s0.x) / 2, 5, 0, 0, Math.PI * 2); g.fill();
    // tapa de arriba (cubierta roja) y frente (hojas)
    g.fillStyle = "#a8282a"; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.lineTo(c.x, c.y); g.lineTo(d.x, d.y); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "rgba(255,210,120,0.8)"; const m0 = P3(x0 + 4, h, z0 + 8), m1 = P3(x1 - 4, h, z0 + 8); g.fillRect(m0.x, m0.y - 0.6, m1.x - m0.x, 1.4);
    g.fillStyle = "#f2e8cc"; g.beginPath(); g.moveTo(d.x, d.y); g.lineTo(c.x, c.y); g.lineTo(e.x, e.y); g.lineTo(f.x, f.y); g.closePath(); g.fill(); g.stroke();
    g.strokeStyle = "rgba(120,100,70,0.6)"; g.lineWidth = 0.6; for (let i = 1; i < 7; i++) { const y = lerp(d.y, f.y, i / 7); g.beginPath(); g.moveTo(d.x + 1.5, y); g.lineTo(c.x - 1.5, y); g.stroke(); }
    g.fillStyle = "#8a1e20"; g.fillRect(d.x, d.y, c.x - d.x, 2.2); g.fillRect(f.x, f.y - 2.2, e.x - f.x, 2.2);
    g.restore();
  }
  function rampa(g) {
    const z0 = ZF - 13, z1 = ZF + 13, gr = 2;
    const A = (X, Y, Z) => P3(X, Y, Z);
    const lo = { X: RAMPA.x0 + 2, Y: 0 }, hi = { X: RAMPA.x1 - 4, Y: LIBRO.h };
    g.save(); g.strokeStyle = TINTA; g.lineWidth = 1.1;
    const p0 = A(lo.X, lo.Y, z0), p1 = A(hi.X, hi.Y, z0), p2 = A(hi.X, hi.Y, z1), p3 = A(lo.X, lo.Y, z1), q2 = A(hi.X, hi.Y - gr, z1), q3 = A(lo.X, lo.Y - gr, z1);
    g.fillStyle = "rgba(10,4,0,0.3)"; g.beginPath(); g.moveTo(p3.x, p3.y + 2); g.lineTo(q2.x, P3(hi.X, 0, z1).y + 2); g.lineTo(P3(hi.X, 0, z1).x, P3(hi.X, 0, z1).y - 3); g.closePath(); g.fill();
    g.fillStyle = "#d9b25a"; g.beginPath(); g.moveTo(p0.x, p0.y); g.lineTo(p1.x, p1.y); g.lineTo(p2.x, p2.y); g.lineTo(p3.x, p3.y); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#a07e2a"; g.beginPath(); g.moveTo(p3.x, p3.y); g.lineTo(p2.x, p2.y); g.lineTo(q2.x, q2.y); g.lineTo(q3.x, q3.y); g.closePath(); g.fill(); g.stroke();
    g.strokeStyle = "rgba(60,40,10,0.7)"; g.lineWidth = 0.7;
    for (let i = 1; i < 12; i++) { const k = i / 12, X = lerp(lo.X, hi.X, k), Y = lerp(lo.Y, hi.Y, k), a = A(X, Y, z1), b = A(X, Y, z1 - (i % 4 === 0 ? 7 : 3.5)); g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke(); }
    g.restore();
  }

  /* ================= Guillermo ================= */
  const CG = {
    inicio: E({ mx: 0.85, my: 0.55, sonr: 0.55, ancho: 0.95, sd: 6, si: 6 }),
    orgullo: E({ mx: 0.85, my: 0.45, c: 0.35, h: 0.7, sonr: 0.85, ancho: 1, abre: 6, sd: 12, si: 12 }),
    aDari: E({ mx: 0.95, my: 0.1, sonr: 0.7, ancho: 1, abre: 6, sd: 10, si: 10 }),
    pica: E({ mx: 0.4, my: -0.1, c: 0.3, wd: 0.15, sonr: -0.1, ancho: 0.7, abre: 4, sd: 16, si: 4, gd: 0.12, gi: -0.1 }),
    aspira: E({ mx: 0.1, my: -0.7, c: 0.66, sonr: -0.1, ancho: 0.62, abre: 34, sd: 24, si: 24, gd: 0.14, gi: 0.14 }),
    medio: E({ mx: 0.3, my: -0.3, c: 0.45, sonr: -0.1, ancho: 0.65, abre: 10, sd: 14, si: 14, gd: 0.08, gi: 0.08 }),
    aspira2: E({ mx: 0, my: -0.9, c: 0.84, sonr: -0.15, ancho: 0.6, abre: 42, sd: 28, si: 28, gd: 0.18, gi: 0.18 }),
    aguanta: E({ mx: 0.4, my: -0.2, c: 0.55, z: 0.5, sonr: -0.25, ancho: 0.7, abre: 0, sd: -6, si: -6, gd: -0.16, gi: -0.16, mof: 0.55 }),
    alivio: E({ mx: 0.92, my: 0.15, c: 0.25, h: 0.55, sonr: 0.75, ancho: 0.95, abre: 4, sd: 12, si: 12 }),
    aspira3: E({ mx: 0, my: -1, c: 0.92, sonr: -0.2, ancho: 0.62, abre: 54, sd: 32, si: 32, gd: 0.22, gi: 0.22 }),
    achis: E({ mx: 0, my: 0, c: 1, z: 1, sonr: -0.25, ancho: 1.1, abre: 42, sd: -16, si: -16, gd: -0.28, gi: -0.28 }),
    ups: E({ mx: 0.85, my: 0.75, iris: 0.72, sonr: -0.3, ancho: 0.55, abre: 0, sd: 24, si: 24, gd: 0.1, gi: 0.1 }),
    sigue: E({ mx: 0.85, my: 0.55, sonr: 0.62, ancho: 0.95, abre: 10, sd: 14, si: 14 }),
    nervio: E({ mx: 0.85, my: 0.55, iris: 0.85, sonr: -0.1, ancho: 0.6, abre: 0, sd: 20, si: 8, gd: 0.12, gi: -0.08 }),
    arriba: E({ mx: 0.2, my: -1, iris: 0.8, sonr: -0.1, ancho: 0.55, abre: 22, sd: 26, si: 26 }),
    mareo: E({ mx: 0, my: 0, esp: 1, sonr: 0.3, ancho: 0.8, abre: 6, sd: 10, si: 4, gd: 0.08 }),
    feliz: E({ mx: -0.55, my: 0.05, c: 0.25, h: 0.75, sonr: 0.9, ancho: 1, abre: 8, sd: 14, si: 10, esp: 0.35 })
  };
  const GOLPE_E = E({ mx: 0, my: 0, c: 1, z: 1, sd: -10, si: -10, gd: -0.2, gi: -0.2, abre: 14, ancho: 0.6, sonr: -0.4 });
  const GUION_CG = [
    [1.0, 1.2, "orgullo"], [T.miran, T.miran + 0.15, "aDari"], [T.asienten + 0.2, T.asienten + 0.4, "inicio"],
    [T.pica, T.pica + 0.15, "pica"], [T.aspira1, T.aspira1 + 0.3, "aspira"], [T.suelta1, T.suelta1 + 0.12, "medio"], [T.aspira2, T.aspira2 + 0.25, "aspira2"],
    [T.aguanta - 0.04, T.aguanta + 0.08, "aguanta"], [T.alivio, T.alivio + 0.2, "alivio"], [T.vuelve, T.vuelve + 0.12, "pica"],
    [T.aspira3, T.achis - 0.1, "aspira3"], [T.achis - 0.03, T.achis + 0.02, "achis"], [T.achis + 0.3, T.achis + 0.45, "ups"],
    [FICHAS[6].t0, FICHAS[6].t0 + 0.4, "sigue"], [T.ultima - 0.3, T.ultima - 0.05, "nervio"], [T.arriba, T.arriba + 0.15, "arriba"],
    [T.mareo, T.mareo + 0.3, "mareo"], [T.sonrie, T.sonrie + 0.4, "feliz"]
  ];
  const PARP_G = [0.5, 1.85, 4.2, 6.4, 7.9, 9.0];
  const P0G = { dx: 0, pel: 0, torso: 0, cab: 0 };
  const CuG = o => Object.assign({}, P0G, o);
  const CUER_G = {
    quieto: CuG({ torso: 0.05, cab: 0.08 }),
    orgullo: CuG({ torso: -0.06, cab: -0.08 }),
    pica: CuG({ torso: 0.0, cab: -0.04 }),
    aspira: CuG({ torso: -0.12, cab: -0.28, pel: -6 }),
    medio: CuG({ torso: -0.05, cab: -0.1 }),
    aspira2: CuG({ torso: -0.16, cab: -0.36, pel: -8 }),
    aguanta: CuG({ torso: -0.04, cab: -0.06 }),
    alivio: CuG({ torso: 0.0, cab: 0.02 }),
    aspira3: CuG({ torso: -0.22, cab: -0.42, pel: -10, dx: -3 }),
    achis: CuG({ torso: 0.22, cab: 0.3, pel: 16, dx: 2 }),
    ups: CuG({ torso: 0.12, cab: 0.12, pel: 8, dx: 4 }),
    sigue: CuG({ torso: 0.1, cab: 0.1, pel: 6, dx: 2 }),
    cerca: CuG({ torso: 0.13, cab: 0.12, pel: 14, dx: 4 }),
    arriba: CuG({ torso: -0.08, cab: -0.26, pel: 2 }),
    mareo: CuG({ torso: 0.02, cab: 0.04, pel: 10 }),
    feliz: CuG({ torso: -0.04, cab: -0.04, pel: 4 })
  };
  const GUION_G = [
    [0.9, 1.3, "orgullo"], [T.asienten + 0.2, T.asienten + 0.5, "quieto"],
    [T.pica, T.pica + 0.2, "pica"], [T.aspira1, T.aspira1 + 0.32, "aspira"], [T.suelta1, T.suelta1 + 0.15, "medio"], [T.aspira2, T.aspira2 + 0.25, "aspira2"],
    [T.aguanta, T.aguanta + 0.15, "aguanta"], [T.alivio, T.alivio + 0.3, "alivio"], [T.vuelve, T.vuelve + 0.15, "pica"],
    [T.aspira3, T.achis - 0.06, "aspira3", salida], [T.achis - 0.04, T.achis + 0.03, "achis", entrada], [T.achis + 0.25, T.achis + 0.6, "ups"],
    [FICHAS[6].t0, FICHAS[6].t0 + 0.6, "sigue"], [T.ultima - 0.9, T.ultima - 0.2, "cerca"], [T.arriba - 0.04, T.arriba + 0.22, "arriba"],
    [T.mareo, T.mareo + 0.5, "mareo"], [T.sonrie, T.sonrie + 0.5, "feliz"]
  ];
  const TOB_G = { cerca: G.SUELO - G.TOBILLO_ALTO, lejos: G.SUELO - G.TOBILLO_ALTO - 12 };
  const PIES_G = { cerca: XG - 30, lejos: XG + 32 };
  const BARRA_G = { x: 322, y: P3(0, 0, 70).y - 2 };                // donde apoya la mano en la barra
  const RELAJ = D(0.55, 0.6, 0.62, 0.58), PALMA = D(0.9, 1, 1, 1), PUNO = D(0, 0, 0, 0), DEDO = D(0.25, 1, 0, 0), PULGAR = D(1, 0, 0, 0);
  const PISTA_GL = [
    [0, 0, { pant: BARRA_G, mu: 2.5, dedos: RELAJ }],
    [T.gPulgar, T.gPulgar + 0.22, { hom: { x: 130, y: 95 }, mu: 2.55, dedos: PULGAR }],
    [T.gPulgar1, T.gPulgar1 + 0.3, { pant: BARRA_G, mu: 2.5, dedos: RELAJ }],
    [T.dedo - 0.12, T.dedo + 0.07, { nariz: { x: 56, y: 30 }, mu: 0.3, dedos: DEDO }, salida],
    [T.baja, T.baja + 0.3, { hom: { x: 70, y: 210 }, mu: 2.3, dedos: RELAJ }],
    [T.aspira3 + 0.1, T.achis - 0.08, { nariz: { x: 75, y: 70 }, mu: 0.6, dedos: DEDO }],
    [T.achis - 0.03, T.achis + 0.12, { colgar: { x: 30, y: -40 }, mu: -1.8, dedos: D(0.8, 1, 1, 0.9) }, salida],
    [T.achis + 0.3, T.achis + 0.52, { boca: { x: 6, y: 4 }, mu: 0.25, dedos: PALMA }],
    [FICHAS[8].t0, FICHAS[8].t0 + 0.4, { pant: BARRA_G, mu: 2.5, dedos: RELAJ }],
    [T.ultima - 0.75, T.ultima - 0.35, { boca: { x: 14, y: 16 }, mu: 1.3, dedos: PUNO }],
    [T.arriba, T.arriba + 0.25, { hom: { x: 60, y: 230 }, mu: 2.2, dedos: RELAJ }],
    [T.mareo, T.mareo + 0.5, { colgar: { x: 10, y: 26 }, mu: -1.85, dedos: D(0.6, 0.65, 0.6, 0.55) }],
    [T.gPulgar2, T.gPulgar2 + 0.3, { hom: { x: 130, y: 90 }, mu: 2.55, dedos: PULGAR }, salida]
  ];
  const PISTA_GC = [
    [0, 0, { bols: true }],
    [T.achis + 0.3, T.achis + 0.6, { bols: true }],
  ];
  const tiembla = t => tramo(t, T.aguanta, T.aguanta + 0.1) * (1 - tramo(t, T.alivio - 0.05, T.alivio + 0.05)) + 0.8 * tramo(t, T.aspira3 + 0.2, T.achis - 0.2) * (1 - tramo(t, T.achis, T.achis + 0.02));

  function poseG(t) {
    const b = linea(GUION_G, CUER_G, "quieto", t);
    const respira = Math.sin(t * 2.1 + 0.4);
    // inspirar antes del estornudo: el pecho se hincha
    const hincha = 0.6 * campana(t, T.aspira1, T.suelta1 + 0.1) + 0.8 * campana(t, T.aspira2, T.aguanta + 0.1) + 1.2 * tramo(t, T.aspira3, T.achis - 0.05) * (1 - tramo(t, T.achis - 0.03, T.achis + 0.05));
    const tb = tiembla(t), bk = golpe(t), ma = mareo(t);
    const sx = 0.8 * tb * ruido(t * 40), sy = 0.5 * tb * ruido(t * 43 + 5);
    // asiente orgulloso
    const nod = 0.05 * Math.sin((t - T.asienten) * 14) * campana(t, T.asienten, T.asienten + 0.45);
    const x = XG + b.dx + sx;
    const p = {
      x, suelo: SUELO, s: S,
      pelvis: { x: G.PELVIS.x, y: G.PELVIS.y + b.pel + respira * 1.2 + sy / S + 16 * bk },
      torso: b.torso + 0.04 * bk + 0.03 * ma * Math.sin(t * 4.2 + 0.7), torsoEsc: { x: 1 + 0.02 * hincha, y: 1 + respira * 0.004 + 0.025 * hincha },
      piernas: {}, cabeza: { ang: b.cab + nod + 0.07 * bk + 0.07 * ma * Math.sin(t * 4.2), dx: 12 * ma * Math.cos(t * 4.2), dy: 30 * bk, esc: { x: 1 + 0.06 * bk, y: 1 - 0.1 * bk } },
      tirasLimpias: true
    };
    for (const lado of ["cerca", "lejos"]) p.piernas[lado] = { tob: { x: G.PELVIS.x + (PIES_G[lado] - x) / S, y: TOB_G[lado] }, ang: 0 };
    // cara: sigue las fichas con los ojos mientras caen
    let e = linea(GUION_CG, CG, "inicio", t);
    const H0 = G.cabeza(p), ojo = G.aPantalla(p, H0.a({ x: 840, y: 590 }));
    const sig = tramo(t, T.cadena + 0.25, T.cadena + 0.6) * (1 - tramo(t, T.arriba - 0.05, T.arriba + 0.1));
    if (sig > 0) { const m = mirarA(ojo, frentePant(t + 0.05), false); e.mx = lerp(e.mx, m.mx, sig); e.my = lerp(e.my, m.my, sig); }
    const up = tramo(t, T.arriba, T.arriba + 0.12) * (1 - tramo(t, T.bonk - 0.05, T.bonk));
    if (up > 0) { const V = vueloCampana(), u = t - T.lanza, cp = { x: V.x0 + V.vx * u, y: V.y0 + V.vy * u + 0.5 * GRAV * u * u }, m = mirarA(ojo, cp, false); e.mx = lerp(e.mx, m.mx, up); e.my = lerp(e.my, m.my, up); }
    e = mezclaE(e, GOLPE_E, clamp(bk * 1.3) * (1 - 0.5 * ma));
    // «ah… ah…»: la boca tiembla un poco
    e.abre += 4 * hincha * Math.sin(t * 19);
    p.cara = cara(e, bk > 0.3 || e.c > 0.6 ? 0 : parpadeo(t, PARP_G));
    p.sudor = 0.55 * campana(t, T.ultima - 0.6, T.cae + 0.3);
    // manos
    const Tr = G.tronco(p), hc = Tr(G.HOMBRO_C), hl = Tr(G.HOMBRO);
    const bo = G.boca(p), na = H0.a(NARIZ);
    const resuelve = lado => o => {
      let q;
      if (o.bols) { const B = Tr(BOLS_G[lado]); return { x: B.x, y: B.y, mu: -1.75, ang: 0, puno: 0, dedos: D(0.4, 0.4, 0.4, 0.4) }; }
      if (o.colgar) { const B = Tr(BOLS_G[lado]); q = { x: B.x + o.colgar.x, y: B.y + o.colgar.y }; }
      else if (o.pant) q = G.aHoja(p, o.pant);
      else if (o.hom) { const h = lado === "l" ? hl : hc; q = { x: h.x + o.hom.x, y: h.y + o.hom.y }; }
      else if (o.tron) q = Tr(o.tron);
      else if (o.boca) q = { x: bo.x + o.boca.x / S * 0.3, y: bo.y + o.boca.y / S * 0.3 };
      else if (o.nariz) q = { x: na.x + o.nariz.x, y: na.y + o.nariz.y };
      return { x: q.x, y: q.y, mu: o.mu, ang: o.ang || 0, puno: 1, dedos: o.dedos };
    };
    const L = pista(PISTA_GL, t, resuelve("l")), C = pista(PISTA_GC, t, resuelve("c"));
    // el pulgar del final tiembla un poco (mareado)
    const pul = tramo(t, T.gPulgar2 + 0.2, T.gPulgar2 + 0.4);
    L.x += pul * 2.5 * Math.sin(t * 9) / S * 0.3; L.ang += 0.08 * pul * Math.sin(t * 7);
    // aguantando: el dedo aprieta y tiembla
    L.x += 1.2 * tb * ruido(t * 47 + 2) / S * 0.3; L.y += 1.0 * tb * ruido(t * 51 + 9) / S * 0.3;
    p.manoCerca = { x: C.x, y: C.y, ang: C.ang, mu: C.mu, dobla: -1, puno: C.puno, dedos: C.dedos };
    p.manoLejos = { x: L.x, y: L.y, ang: L.ang, mu: L.mu, dobla: -1, puno: L.puno, dedos: L.dedos };
    p._nariz = G.aPantalla(p, na); p._boca = G.aPantalla(p, bo);
    return p;
  }

  /* ================= Dari ================= */
  const CD = {
    base: E({ mx: 0.88, my: 0.55, sonr: 0.4, ancho: 0.85 }),
    orgullo: E({ mx: 0.85, my: 0.5, c: 0.3, h: 0.6, sonr: 0.65, ancho: 0.9, sd: 6, si: 8 }),
    aG: E({ mx: 0.95, my: 0.05, sonr: 0.5, ancho: 0.85, sd: 4, si: 8 }),
    alerta: E({ mx: 0.95, my: 0.0, iris: 0.72, sonr: -0.2, ancho: 0.6, abre: 0, sd: 22, si: 26, gd: 0.15, gi: 0.15 }),
    panico: E({ mx: 0.95, my: 0.0, iris: 0.6, sonr: -0.35, ancho: 1.15, abre: 16, sd: 32, si: 34, gd: 0.3, gi: 0.3 }),
    alivio: E({ mx: 0.6, my: -0.2, c: 0.65, sonr: 0.3, ancho: 0.7, abre: 10, sd: 12, si: 12 }),
    horror: E({ mx: 0.92, my: 0.25, iris: 0.55, sonr: -0.5, ancho: 0.7, abre: 52, sd: 36, si: 36, gd: 0.32, gi: 0.32 }),
    asombro: E({ mx: 0.9, my: 0.5, iris: 0.9, sonr: 0.2, ancho: 0.6, abre: 18, sd: 20, si: 20 }),
    encanta: E({ mx: 0.88, my: 0.6, sonr: 0.7, ancho: 0.95, abre: 10, sd: 16, si: 16, gd: 0.1, gi: 0.1 }),
    nervio: E({ mx: 0.88, my: 0.5, sonr: -0.15, ancho: 0.6, sd: 16, si: 20, gd: 0.15, gi: 0.2 }),
    arriba: E({ mx: 0.6, my: -1, iris: 0.85, sonr: 0, ancho: 0.6, abre: 16, sd: 24, si: 24 }),
    auch: E({ mx: 0.95, my: -0.2, c: 0.55, z: 0.45, sonr: -0.45, ancho: 0.85, abre: 6, sd: 10, si: 16, gd: 0.22, gi: 0.22 }),
    aplaude: E({ mx: 0.9, my: 0.1, c: 0.4, h: 1, sonr: 0.95, ancho: 1, abre: 18, sd: 14, si: 14 })
  };
  const GUION_CD = [
    [T.admira, T.admira + 0.3, "base"], [T.dBrillo - 0.1, T.dBrillo + 0.15, "orgullo"], [T.miran, T.miran + 0.15, "aG"],
    [T.dVe, T.dVe + 0.12, "alerta"], [T.dNo0 + 0.05, T.dNo0 + 0.2, "panico"], [T.dAlivio, T.dAlivio + 0.2, "alivio"],
    [T.vuelve + 0.04, T.vuelve + 0.14, "panico"], [T.achis, T.achis + 0.08, "horror"], [FICHAS[4].t0, FICHAS[4].t0 + 0.4, "asombro"],
    [FICHAS[12].t0, FICHAS[12].t0 + 0.4, "encanta"], [T.ultima - 0.5, T.ultima - 0.2, "nervio"], [T.arriba, T.arriba + 0.15, "arriba"],
    [T.bonk, T.bonk + 0.08, "auch"], [T.dAplaude0 - 0.1, T.dAplaude0 + 0.15, "aplaude"]
  ];
  const PARP_D = [0.3, 2.2, 6.2, 8.2, T.bonk + 1.3, T.bonk + 2.4];
  const P0D = { pel: 0, torso: 0.02, cab: 0.03, dx: 0 };
  const CuD = o => Object.assign({}, P0D, o);
  const CUER_D = {
    quieto: CuD({}),
    admira: CuD({ torso: 0.07, cab: 0.1, pel: 3 }),
    alerta: CuD({ torso: -0.04, cab: -0.06 }),
    panico: CuD({ torso: -0.1, cab: -0.08, pel: 4, dx: 4 }),
    alivio: CuD({ torso: 0.05, cab: 0.12, pel: 8 }),
    horror: CuD({ torso: -0.13, cab: -0.1, pel: 2, dx: 6 }),
    mira: CuD({ torso: 0.1, cab: 0.12, pel: 6 }),
    agacha: CuD({ torso: 0.26, cab: 0.2, pel: 26, dx: -6 }),
    nervio: CuD({ torso: 0.08, cab: 0.06, pel: 6 }),
    arriba: CuD({ torso: -0.08, cab: -0.26 }),
    aplaude: CuD({ torso: 0.0, cab: 0.02, pel: 4 })
  };
  const tU = FICHAS.findIndex(F => F.B.x > 640);                    // la cadena pasa por la curva, delante de Dari
  const T_CURVA = FICHAS[Math.max(0, tU)].t0;
  const GUION_D = [
    [T.admira, T.admira + 0.5, "admira"], [T.miran - 0.05, T.miran + 0.3, "quieto"], [T.dVe, T.dVe + 0.15, "alerta"],
    [T.dNo0, T.dNo0 + 0.2, "panico"], [T.dAlivio, T.dAlivio + 0.3, "alivio"], [T.vuelve, T.vuelve + 0.15, "panico"],
    [T.achis - 0.02, T.achis + 0.1, "horror"], [FICHAS[5].t0, FICHAS[5].t0 + 0.6, "mira"], [T_CURVA - 0.7, T_CURVA - 0.15, "agacha"],
    [T_CURVA + 0.5, T_CURVA + 1.0, "mira"], [T.ultima - 0.6, T.ultima - 0.2, "nervio"], [T.arriba, T.arriba + 0.2, "arriba"],
    [T.dAplaude0 - 0.15, T.dAplaude0 + 0.2, "aplaude"]
  ];
  const PISTA_DL = [
    [0, 0, { bols: true }],
    [T.dNo0, T.dNo0 + 0.16, { hom: { x: 120, y: 60 }, mu: 1.75, dedos: PALMA }],
    [T.dAlivio, T.dAlivio + 0.3, { bols: true }],
    [T.dNo2 - 0.02, T.dNo2 + 0.14, { hom: { x: 120, y: 60 }, mu: 1.75, dedos: PALMA }],
    [T.achis - 0.03, T.achis + 0.08, { hom: { x: 105, y: -25 }, mu: 1.9, dedos: D(1, 1, 1, 1) }],
    [FICHAS[6].t0, FICHAS[6].t0 + 0.6, { bols: true }],
    [T.ultima - 0.6, T.ultima - 0.25, { hom: { x: 95, y: 95 }, mu: 2.1, dedos: PUNO }],
    [T.arriba, T.arriba + 0.3, { bols: true }],
    [T.dAplaude0 - 0.25, T.dAplaude0, { aplauso: 1, mu: 1.75, dedos: PALMA }]
  ];
  const PISTA_DC = [
    [0, 0, { bols: true }],
    [T.dGafas, T.dEmpuja - 0.02, { cab: { x: 884, y: 515 }, off: { x: 5, y: 17 }, mu: 1.95, dedos: D(0.25, 0.55, 0.12, 0.08) }],
    [T.dEmpuja, T.dEmpuja + 0.1, { cab: { x: 884, y: 515 }, off: { x: 5, y: 13 }, mu: 1.95, dedos: D(0.25, 0.55, 0.12, 0.08) }],
    [T.dEmpuja + 0.16, T.dGafas1 + 0.25, { bols: true }],
    [T.dNo0 + 0.04, T.dNo0 + 0.2, { hom: { x: 200, y: 75 }, mu: 1.75, dedos: PALMA }],
    [T.dAlivio, T.dAlivio + 0.22, { tron: { x: 330, y: 400 }, mu: 2.25, dedos: PALMA }],
    [T.dNo2, T.dNo2 + 0.14, { hom: { x: 200, y: 75 }, mu: 1.75, dedos: PALMA }],
    [T.achis - 0.03, T.achis + 0.08, { hom: { x: 60, y: -40 }, mu: 1.7, dedos: D(1, 1, 1, 1) }],
    [FICHAS[6].t0, FICHAS[6].t0 + 0.6, { bols: true }],
    [T.ultima - 0.6, T.ultima - 0.25, { hom: { x: 210, y: 105 }, mu: 2.0, dedos: PUNO }],
    [T.arriba, T.arriba + 0.3, { bols: true }],
    [T.dAplaude0 - 0.25, T.dAplaude0, { aplauso: -1, mu: 1.75, dedos: PALMA }]
  ];
  const gafasDy = t => 6 * tramo(t, 0.2, 0.9) * (1 - tramo(t, T.dEmpuja, T.dEmpuja + 0.12)) + 4 * tramo(t, T_CURVA - 0.6, T_CURVA - 0.2) * (1 - tramo(t, T_CURVA + 0.4, T_CURVA + 0.7));
  const brilloGafas = t => Math.max(1.25 * campana(t, T.dBrillo - 0.08, T.dBrillo + 0.5), 0.9 * campana(t, T_CURVA - 0.05, T_CURVA + 0.45));
  // aplausos (0–1) y el choque de las palmas
  const aplauso = t => tramo(t, T.dAplaude0, T.dAplaude0 + 0.12) * (1 - tramo(t, T.dAplaude1, T.dAplaude1 + 0.25));
  const RITMO_AP = 4.6;                                             // palmadas por segundo
  const choque = t => { const a = aplauso(t); if (a <= 0) return 0; const ph = ((t - T.dAplaude0) * RITMO_AP) % 1; return a * Math.max(0, 1 - ph / 0.25) * (ph < 0.25 ? 1 : 0); };

  function poseD(t) {
    const b = linea(GUION_D, CUER_D, "quieto", t);
    const respira = Math.sin(t * 1.9 + 1.4);
    const ap = aplauso(t), bote = ap * Math.abs(Math.sin((t - T.dAplaude0) * Math.PI * 2.3));
    const pan = tramo(t, T.dNo0, T.dNo0 + 0.1) * (1 - tramo(t, T.dAlivio - 0.05, T.dAlivio + 0.1)) + tramo(t, T.dNo2, T.dNo2 + 0.1) * (1 - tramo(t, T.achis - 0.05, T.achis));
    const p = {
      x: XD + b.dx, suelo: SUELO, s: S, espejo: true,
      pelvis: { x: Da.PELVIS.x, y: Da.PELVIS.y + b.pel + respira * 1.1 - 10 * bote + 2 * pan * ruido(t * 30) },
      torso: b.torso, torsoEsc: { x: 1, y: 1 + respira * 0.004 },
      piernas: {}, cabeza: { ang: b.cab + 0.04 * Math.sin((t - T.asienten) * 14) * campana(t, T.asienten, T.asienten + 0.45), dx: 0, dy: 0, esc: { x: 1, y: 1 } },
      tirasLimpias: true
    };
    // pánico: la cabeza dice que no
    p.cabeza.ang += 0.06 * pan * Math.sin(t * 17);
    const ty = Da.SUELO - Da.TOBILLO_ALTO;
    p.piernas.cerca = { tob: { x: Da.PELVIS.x - 90 - b.dx / S, y: ty }, ang: 0 };
    p.piernas.lejos = { tob: { x: Da.PELVIS.x + 96 - b.dx / S, y: ty - 10 }, ang: 0 };
    let e = linea(GUION_CD, CD, "base", t);
    const H0 = Da.cabeza(p), ojo = Da.aPantalla(p, H0.a({ x: 860, y: 540 }));
    const sig = tramo(t, T.cadena + 0.4, T.cadena + 0.8) * (1 - tramo(t, T.arriba - 0.05, T.arriba + 0.1));
    if (sig > 0) { const m = mirarA(ojo, frentePant(t + 0.05), true); e.mx = lerp(e.mx, m.mx, sig); e.my = lerp(e.my, m.my, sig); }
    const up = tramo(t, T.arriba + 0.05, T.arriba + 0.18) * (1 - tramo(t, T.bonk - 0.05, T.bonk));
    if (up > 0) { const V = vueloCampana(), u = t - T.lanza, cp = { x: V.x0 + V.vx * u, y: V.y0 + V.vy * u + 0.5 * GRAV * u * u }, m = mirarA(ojo, cp, true); e.mx = lerp(e.mx, m.mx, up); e.my = lerp(e.my, m.my, up); }
    p.cara = cara(e, e.c > 0.5 || e.h > 0.5 ? 0 : parpadeo(t, PARP_D, 0.13));
    p.sudor = 0.8 * tramo(t, T.dNo0, T.dNo0 + 0.2) * (1 - tramo(t, T.dAlivio, T.dAlivio + 0.3)) + 0.9 * tramo(t, T.dNo2, T.dNo2 + 0.2) * (1 - tramo(t, FICHAS[10].t0, FICHAS[10].t0 + 0.6));
    const gdy = gafasDy(t), kb = brilloGafas(t);
    p.gafas = { dx: 0, dy: gdy, ang: 0 };
    p.capaCabeza = g => brillo(g, t, kb, gdy);
    // manos
    const Tr = Da.tronco(p);
    const resuelve = lado => o => {
      if (o.bols) { const m = Da.manoReposo(p, lado); return { x: m.x, y: m.y, mu: -1.75, ang: 0, puno: 0, dedos: D(0.4, 0.4, 0.4, 0.4) }; }
      let q;
      if (o.hom) { const h = Tr(lado === "lejos" ? Da.HOMBRO : Da.HOMBRO_C); q = { x: h.x + o.hom.x, y: h.y + o.hom.y }; }
      else if (o.tron) q = Tr(o.tron);
      else if (o.cab) { const c = Da.aPantalla(p, H0.a(o.cab)); q = Da.aHoja(p, { x: c.x + o.off.x, y: c.y + o.off.y }); }
      else if (o.aplauso) { const c = Tr({ x: 335, y: 375 }); q = { x: c.x + o.aplauso * 5, y: c.y + o.aplauso * 3 }; }
      else if (o.boca) { const bp = Da.aPantalla(p, Da.boca(p)); q = Da.aHoja(p, { x: bp.x - o.boca.x * S, y: bp.y + o.boca.y * S }); }
      return { x: q.x, y: q.y, mu: o.mu, ang: o.ang || 0, puno: 1, dedos: o.dedos };
    };
    const L = pista(PISTA_DL, t, resuelve("lejos")), C = pista(PISTA_DC, t, resuelve("cerca"));
    // «¡no, no, no!»: las palmas se agitan de lado a lado
    if (pan > 0) {
      const w = Math.sin(t * 22), w2 = Math.sin(t * 22 + 0.9);
      L.x += 14 * pan * w; L.ang += 0.3 * pan * w; C.x += 14 * pan * w2; C.ang += 0.3 * pan * w2;
    }
    // aplausos: las manos se separan y se juntan
    if (ap > 0) {
      const ph = ((t - T.dAplaude0) * RITMO_AP) % 1, sep = 1 - Math.pow(Math.abs(Math.cos(Math.PI * ph)), 0.6);
      L.x += 55 * sep * ap; C.x -= 55 * sep * ap; L.ang += 0.32 * sep * ap; C.ang -= 0.32 * sep * ap; L.y -= 8 * sep * ap; C.y -= 8 * sep * ap;
    }
    p.manoLejos = { x: L.x, y: L.y, ang: L.ang, mu: L.mu, dobla: -1, puno: L.puno, dedos: L.dedos };
    // al aplaudir, la mano cercana va en espejo (las dos palmas se miran); cambia dentro del bolsillo, sin verse
    p.manoCerca = { x: C.x, y: C.y, ang: C.ang, mu: C.mu, dobla: -1, puno: C.puno, dedos: C.dedos, espejo: t > T.dAplaude0 - 0.24 };
    p._aplauso = Da.aPantalla(p, { x: (L.x + C.x) / 2, y: (L.y + C.y) / 2 });
    return p;
  }

  /* ---------- destello en las gafas de Dari (coordenadas del retrato) ---------- */
  const ARO_D = [[729, 474], [744, 471], [789, 478], [833, 496], [858, 509], [861, 517], [849, 545], [837, 569], [823, 579], [789, 575], [745, 561], [734, 553], [729, 530]];
  function brillo(g, t, k, dy) {
    if (k <= 0.01) return;
    g.save(); g.translate(0, dy); g.lineJoin = "round";
    g.save(); g.beginPath(); g.moveTo(ARO_D[0][0], ARO_D[0][1]); for (const [x, y] of ARO_D.slice(1)) g.lineTo(x, y); g.closePath(); g.clip();
    g.globalAlpha = 0.85 * clamp(k); g.fillStyle = "#ffffff"; g.fillRect(720, 460, 150, 130);
    g.globalAlpha = 0.9 * clamp(k); g.strokeStyle = "#dff0ff"; g.lineWidth = 16; g.beginPath(); g.moveTo(752, 572); g.lineTo(800, 474); g.stroke();
    g.restore();
    const r = 95 * k, cx = 828, cy = 498, a = 0.3 + t * 1.5;
    g.globalAlpha = clamp(k);
    const halo = g.createRadialGradient(cx, cy, 2, cx, cy, r * 0.7); halo.addColorStop(0, "rgba(255,255,255,0.9)"); halo.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = halo; g.beginPath(); g.arc(cx, cy, r * 0.7, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#ffffff"; g.beginPath();
    for (let i = 0; i < 8; i++) { const rr = i % 2 ? r * 0.12 : (i % 4 === 0 ? r : r * 0.62), an = a + i * Math.PI / 4; g.lineTo(cx + Math.cos(an) * rr, cy + Math.sin(an) * rr); }
    g.closePath(); g.fill();
    g.restore();
  }

  /* ================= efectos ================= */
  function estrella(g, x, y, r, a, col) {
    g.beginPath(); for (let i = 0; i < 10; i++) { const rr = i % 2 ? r * 0.45 : r, an = a + i * Math.PI / 5 - Math.PI / 2; g.lineTo(x + Math.cos(an) * rr, y + Math.sin(an) * rr); } g.closePath();
    g.fillStyle = col; g.fill(); g.lineWidth = 1.4; g.strokeStyle = TINTA; g.stroke();
  }
  // la última ficha se tambalea: rayitas de movimiento junto a su cabeza
  function tambaleo(g, t, th) {
    const k = tramo(t, T.ultima + 0.02, T.ultima + 0.1) * (1 - tramo(t, T.cae + 0.05, T.palanca));
    if (k <= 0.01) return;
    const F = FICHAS[N - 1], a = th[N - 1], top = P3(F.B.x - DH * Math.sin(a), F.B.y + DH * Math.cos(a), F.B.z);
    g.save(); g.lineCap = "round"; g.globalAlpha = k;
    for (const sg of [-1, 1]) for (let i = 0; i < 2; i++) {
      const r = 7 + i * 4.5, c = -Math.PI / 2 + sg * 0.95;
      g.beginPath(); g.arc(top.x, top.y + 2, r, c - 0.42, c + 0.42);
      g.strokeStyle = "rgba(20,10,4,0.75)"; g.lineWidth = 2.6; g.stroke(); g.strokeStyle = "#fff4cc"; g.lineWidth = 1.2; g.stroke();
    }
    g.restore();
  }
  // estrellitas del golpe
  function chispazo(g, t) {
    const k = fase(t, T.bonk, T.bonk + 0.42); if (k <= 0 || k >= 1) return;
    const c = coronaEn(T.bonk).c;
    g.save(); g.globalAlpha = 1 - k * k;
    for (let i = 0; i < 4; i++) {
      const an = -Math.PI / 2 + (i - 1.5) * 0.75, d = 22 + 34 * salida(k);
      estrella(g, c.x + Math.cos(an) * d, c.y - 14 + Math.sin(an) * d, 5.5 * (1 - 0.4 * k), k * 4 + i, "#ffe14a");
    }
    g.restore();
  }
  // estrellitas del mareo alrededor de la campana
  function mareoEstrellas(t, pG) {
    const a = mareo(t) * (1 - tramo(t, T.fin - 0.2, T.fin + 0.4));
    if (a <= 0.01) return { atras: [], delante: [], a: 0 };
    const c = coronaG(pG), atras = [], delante = [];
    for (let i = 0; i < 3; i++) {
      const an = t * 4.5 + i * Math.PI * 2 / 3, x = c.x + Math.cos(an) * 40, y = c.y + 4 + Math.sin(an) * 9;
      (Math.sin(an) < 0 ? atras : delante).push([x, y, an]);
    }
    return { atras, delante, a };
  }
  function pintaEstrellas(g, lista, a) {
    if (!lista.length || a <= 0) return;
    g.save(); g.globalAlpha = a; for (const [x, y, an] of lista) estrella(g, x, y, 6, an, "#ffe14a"); g.restore();
  }
  // picor: rayitas junto a la nariz
  function picor(g, t, pG) {
    const k = tramo(t, T.pica, T.pica + 0.15) * (1 - tramo(t, T.aguanta - 0.1, T.aguanta)) + tramo(t, T.vuelve, T.vuelve + 0.1) * (1 - tramo(t, T.achis - 0.15, T.achis - 0.05));
    if (k <= 0.01) return;
    const n = pG._nariz;
    g.save(); g.strokeStyle = TINTA; g.lineWidth = 1.5; g.lineCap = "round";
    for (let i = 0; i < 3; i++) {
      const on = Math.sin(t * 26 + i * 2.1) > -0.2 ? 1 : 0.35, an = -1.2 + i * 0.55, r0 = 8, r1 = 13 + 2 * Math.sin(t * 30 + i);
      g.globalAlpha = k * on;
      g.beginPath(); g.moveTo(n.x + 3 + Math.cos(an) * r0, n.y + Math.sin(an) * r0); g.lineTo(n.x + 3 + Math.cos(an) * r1, n.y + Math.sin(an) * r1); g.stroke();
    }
    g.restore();
  }
  // estornudo: gotitas y ráfaga desde la boca (donde esté en cada instante) hasta la primera ficha
  const bocaEn = te => cache("bo" + te.toFixed(3), () => poseG(te)._boca);
  function estornudo(g, t) {
    const k = fase(t, T.achis, T.achis + 0.6); if (k <= 0 || k >= 1) return;
    const f0 = FICHAS[0], dst = P3(f0.B.x - 3, DH * 0.75, f0.B.z), o = bocaEn(T.achis + 0.035);
    g.save(); g.lineCap = "round";
    const kr = fase(t, T.achis + 0.035, T.achis + 0.24);
    if (kr > 0 && kr < 1) {
      for (let i = 0; i < 3; i++) {
        const off = (i - 1) * 8, a0 = clamp(kr * 1.6 - 0.4), a1 = clamp(kr * 1.6);
        g.globalAlpha = Math.sin(Math.PI * kr);
        g.beginPath();
        for (let j = 0; j <= 10; j++) { const u = lerp(a0, a1, j / 10), x = lerp(o.x + 4, dst.x, u), y = lerp(o.y + 2 + off * 0.4, dst.y + off * 0.5, u) - (8 + off) * Math.sin(Math.PI * u); if (j) g.lineTo(x, y); else g.moveTo(x, y); }
        g.strokeStyle = "rgba(30,60,80,0.45)"; g.lineWidth = 4.4; g.stroke();
        g.strokeStyle = "#f4fbff"; g.lineWidth = 2.4; g.stroke();
      }
    }
    g.fillStyle = "#d6f2ff"; g.strokeStyle = "rgba(40,90,120,0.8)"; g.lineWidth = 0.8;
    const dx = dst.x - o.x, dy = dst.y - o.y, dl = Math.hypot(dx, dy);
    for (let i = 0; i < 14; i++) {
      const te = T.achis + 0.035 + 0.006 * i, u = t - te; if (u <= 0) continue;
      const q = bocaEn(te), v = 380 + 260 * hash(i + 801), an = Math.atan2(dy, dx) + (hash(i + 802) - 0.55) * 0.9;
      const x = q.x + 3 + Math.cos(an) * v * u, y = q.y + Math.sin(an) * v * u + 420 * u * u;
      g.globalAlpha = (1 - k) * (1 - k); g.beginPath(); g.arc(x, y, 1.1 + 1.3 * hash(i + 803), 0, Math.PI * 2); g.fill(); g.stroke();
    }
    g.restore();
  }
  // aplausos: rayitas donde chocan las palmas
  function palmadas(g, t, pD) {
    const k = choque(t); if (k <= 0.02) return;
    const c = pD._aplauso;
    g.save(); g.lineCap = "round"; g.globalAlpha = k;
    for (let i = 0; i < 5; i++) { const an = -Math.PI / 2 + (i - 2) * 0.5, r0 = 15, r1 = 15 + 10 * (1 - k) + 6; g.beginPath(); g.moveTo(c.x + Math.cos(an) * r0, c.y - 6 + Math.sin(an) * r0); g.lineTo(c.x + Math.cos(an) * r1, c.y - 6 + Math.sin(an) * r1);
      g.strokeStyle = "rgba(40,24,8,0.7)"; g.lineWidth = 3.8; g.stroke(); g.strokeStyle = "#fff3b8"; g.lineWidth = 2; g.stroke(); }
    g.restore();
  }

  /* ================= escena ================= */
  const pose = t => ({ g: poseG(t), d: poseD(t) });
  // cámara: general; se acerca a las caras; al estornudo; sigue a la ficha que cae; la rampa; se abre para la campana
  const PLANOS = [
    [0, 1.0, 512, 330], [0.9, 1.0, 512, 330], [2.4, 1.12, 512, 300], [4.95, 1.14, 505, 300], [5.3, 1.5, 390, 318],
    [5.75, 1.6, 430, 305], [6.5, 1.82, 470, 318], [T.ultima - 1.05, 1.82, 560, 318], [T.ultima - 0.25, 1.48, 525, 302], [T.ultima - 0.05, 1.48, 525, 302],
    [T.ultima + 0.32, 2.8, 552, 328], [T.lanza + 0.02, 2.8, 552, 328],
    [T.lanza + 0.42, 1.1, 425, 292], [T.bonk + 0.6, 1.14, 470, 310], [T.bonk + 1.6, 1.16, 505, 318], [DUR, 1.18, 505, 318]
  ];
  // la ficha que cae, suavizada en el tiempo (la cámara no da tirones)
  function seguir(t) {
    let sx = 0, sw = 0;
    for (let i = -6; i <= 6; i++) { const w = Math.exp(-(i * i) / 18), f = frente(t + 0.12 + i * 0.05); sx += w * f.x; sw += w; }
    return sx / sw;
  }
  function camara(t) {
    let i = 0; while (i < PLANOS.length - 2 && t > PLANOS[i + 1][0]) i++;
    const a = PLANOS[i], b = PLANOS[i + 1], k = suave(fase(t, a[0], b[0]));
    let kk = lerp(a[1], b[1], k), x = lerp(a[2], b[2], k), y = lerp(a[3], b[3], k);
    const w = tramo(t, 5.45, 6.0) * (1 - tramo(t, T.ultima - 0.9, T.ultima - 0.2));
    if (w > 0) x = lerp(x, seguir(t), w);
    const mx = W / 2 / kk, my = H / 2 / kk;
    return { k: kk, x: clamp(x, mx - 40, W + 40 - mx), y: clamp(y, my - 60, H + 60 - my) };
  }

  class GuillermoDariDomino extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !Da.listo()) return;
      if (!fondo) fondo = creaFondo();
      if (!barra) barra = creaBarra();
      const pG = poseG(t), pD = poseD(t);
      const luz = tramo(t, NEGRO_INICIO, 0.8, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t);
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      g.drawImage(fondo, -40, -60);
      // sombras de los dos
      g.save(); g.fillStyle = "rgba(20,8,0,0.3)";
      g.beginPath(); g.ellipse(pG.x + 4, SUELO + 2, 62, 7, 0, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.ellipse(pD.x - 4, SUELO + 2, 60, 7, 0, 0, Math.PI * 2); g.fill(); g.restore();
      g.drawImage(barra, BAR_X, BAR_Y, BAR_W, BAR_H);
      // fichas (de atrás hacia delante), balancín y campanita
      const th = angulos(t);
      const orden = cache("orden", () => FICHAS.map((F, i) => i).sort((a, b) => FICHAS[a].B.z - FICHAS[b].B.z || a - b));
      const cb = estadoCampana(t, pG);
      const trastos = () => { rampa(g); libro(g); balancin(g, t); if (cb.modo === "regla") campanita(g, cb.x, cb.y, cb.rot, cb.esc); };
      let hecho = false;
      for (const i of orden) {
        if (!hecho && FICHAS[i].B.z > 100) { trastos(); hecho = true; }
        ficha(g, FICHAS[i], th[i]);
      }
      if (!hecho) trastos();
      Da.dibujar(g, pD, t);
      const me = mareoEstrellas(t, pG);
      pintaEstrellas(g, me.atras, me.a);
      G.dibujar(g, pG, t);
      if (cb.modo !== "regla") campanita(g, cb.x, cb.y, cb.rot, cb.esc, cb.aplasta || 0);
      ondas(g, cb.x, cb.y, cb.rot, cb.esc, suena(t), t);
      pintaEstrellas(g, me.delante, me.a);
      picor(g, t, pG);
      estornudo(g, t);
      tambaleo(g, t, th);
      chispazo(g, t);
      palmadas(g, t, pD);
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00057", nombre: "Guillermo y Dari · El dominó", crear: () => new GuillermoDariDomino() });
  window.__A2D_00057 = { pose, poseG, poseD, T, DUR, FICHAS };
})();
