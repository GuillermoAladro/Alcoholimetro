"use strict";
/* 00127 · Guillermo y Sara · El monopatín de noche
 *
 * Negro → una calle de noche: farolas con conos de luz anaranjada, fachadas con ventanas encendidas,
 * bicis aparcadas en la acera y el asfalto liso. La cámara viaja con Sara, que patina sin esfuerzo con
 * la melena negra al viento: empuja, se desliza, traza una curva (la tabla se inclina y enseña la lija y
 * luego el dibujo de abajo) y vuelve a empujar. Guillermo corre detrás para no quedarse atrás: lengua
 * fuera, sudando a chorros. Sara frena de cola (saltan chispas) y se queda de pie en la tabla mirándole,
 * impasible; él llega reventado y se apoya en las rodillas echando vaho. Se le ocurre algo: señala la
 * tabla, retrocede, coge carrerilla y salta a la cola, detrás de ella. La tabla sale disparada con los
 * dos: se tambalean con los brazos como aspas, él se agarra al hombro de Sara y salen de cuadro por la
 * derecha. Un instante de calma… ¡crash! fuera de cuadro: tiembla todo, entra una nube de polvo y hojas,
 * una tapa de cubo de basura rueda hasta quedarse plana y un gato sale escopetado, erizado, con un
 * maullido. La tabla vuelve sola rodando, pilla un bache, da media vuelta en el aire y se queda boca
 * arriba con las ruedas girando. Vuelven los dos cojeando, con polvo y hojas en el pelo: Sara levanta la
 * tabla con un toque del pie y la recoge al vuelo; Guillermo, frotándose la cabeza, levanta el pulgar.
 * Miran a cámara y Sara sonríe de medio lado → negro.
 *
 * Fondo por capas prerenderizadas con paralaje (cielo, rascacielos lejanos, fachadas, asfalto, acera
 * con farolas y bicis, bordillo); con la cámara quieta se reutiliza el fondo ya compuesto. La melena de
 * Sara la dibuja la escena (las dos tiras del rig) con muelles movidos por el viento y la inercia.
 * Sin textos. Todo depende del tiempo `t`.
 */
(() => {
  const { clamp, lerp, fase, suave, salida, entrada, tramo, campana, ruido, hash, rot } = M2;
  const G = Guillermo, S = SaraSaez;
  const DUR = 14.55, TINTA = "#0b0a0e", TAU = Math.PI * 2;
  const P = (x, y) => ({ x, y });

  const ESC = 0.28;                                    // los dos a la misma escala (Sara es más baja por su K)
  const SUELO_S = 540, SUELO_G = 526, SUELO_V = 548;   // carril de Sara (y de la tabla), de Guillermo y de la tabla que vuelve
  const SK_S = ESC * S.K, SK_G = ESC * G.K;

  const T = {
    emp: [0.3, 1.2, 3.45],                       // empujones de Sara
    carve0: 1.95, carve1: 3.15, mira0: 2.9, mira1: 3.45,
    frena0: 4.3, frena1: 4.95, sMira: 5.1,
    gFrena: 4.15,                                // Guillermo deja de seguirla y frena
    gIdea: 6.05, gSenala: 6.1, gAtras0: 6.5, gAtras1: 6.95, gCorre: 7.0, gSalta: 7.46,
    sVe: 7.02, sale: 7.78, agarra: 8.2,
    choque: 9.62, tapa: 9.68, gato: 9.74, vuelve: 9.75,
    entran: 11.3, llegan: 12.58, pisa: 12.64, coge: 12.98, pulgar: 13.0, camara: 13.18, sonrisa: 13.42, fin: 13.95
  };

  /* ---------- utilidades ---------- */
  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n] ?? a[n], k); return o; };
  function guion(lista, dic, base, t) {
    let c = dic[base];
    for (const [t0, t1, nom, f] of lista) { if (t <= t0) break; c = mezclaE(c, dic[nom], (f || suave)(fase(t, t0, t1))); }
    return Object.assign({}, c);
  }
  const parpadeo = (t, lista, d = 0.14) => { let o = 0; for (const tb of lista) { const k = fase(t, tb, tb + d); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); } return o; };
  const D5 = (pu, ix, md, an, me) => ({ pulgar: pu, indice: ix, medio: md, anular: an, menique: me });
  const TODOS = k => D5(k, k, k, k, k);
  const PUNO = TODOS(0), SENALA = D5(0, 1, 0, 0, 0), PULGAR = D5(1, 0, 0, 0, 0), AGARRA = TODOS(0.3), ABIERTA = D5(0.8, 1, 1, 1, 1);
  const DD = (a, b, k) => ({ pulgar: lerp(a.pulgar, b.pulgar, k), indice: lerp(a.indice, b.indice, k), medio: lerp(a.medio, b.medio, k),
    anular: lerp(a.anular, b.anular, k), menique: lerp(a.menique, b.menique, k) });

  const BASE = { mx: 0.5, my: 0, c: 0, cd: 0, ci: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, abre: 0, ancho: 1, sonr: 0.15, lengua: 0, mof: 0, rub: 0, esp: 0 };
  const E = o => Object.assign({}, BASE, o);
  function cara(e, parp) {
    return { mirada: { x: e.mx, y: e.my }, iris: e.iris, espiral: e.esp,
      ojos: { d: clamp(Math.max(e.c, e.cd, parp)), i: clamp(Math.max(e.c, e.ci, parp)), feliz: e.h, apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: 0, abre: Math.max(0, e.abre), ancho: e.ancho, sonrisa: e.sonr, dientes: true, lengua: e.lengua },
      mofletes: e.mof, rubor: e.rub, bigote: 0 };
  }
  /* Curva por claves [t, v1, v2, …] (Hermite con tangentes de Catmull-Rom; quieta en los extremos). */
  function curva(claves, t) {
    const n = claves.length;
    if (t <= claves[0][0]) return claves[0].slice(1);
    if (t >= claves[n - 1][0]) return claves[n - 1].slice(1);
    let i = 0; while (claves[i + 1][0] < t) i++;
    const k0 = claves[Math.max(0, i - 1)], k1 = claves[i], k2 = claves[i + 1], k3 = claves[Math.min(n - 1, i + 2)];
    const h = k2[0] - k1[0], u = (t - k1[0]) / h, u2 = u * u, u3 = u2 * u, out = [];
    for (let j = 1; j < k1.length; j++) {
      const m1 = i > 0 ? (k2[j] - k0[j]) / (k2[0] - k0[0]) * h : 0, m2 = i + 2 < n ? (k3[j] - k1[j]) / (k3[0] - k1[0]) * h : 0;
      out.push((2 * u3 - 3 * u2 + 1) * k1[j] + (u3 - 2 * u2 + u) * m1 + (-2 * u3 + 3 * u2) * k2[j] + (u3 - u2) * m2);
    }
    return out;
  }
  const MEMO = new Map();
  const memo = (c, f) => { if (MEMO.has(c)) return MEMO.get(c); if (MEMO.size > 120) MEMO.clear(); const v = f(); MEMO.set(c, v); return v; };

  // bolsillos de Guillermo (muñecas del avatar → centro del puño), como en 00122
  const R_M = G.MUNECA_R * G.JK;
  const manoDesde = (m, mu) => P(m.x - Math.cos(mu) * R_M, m.y - Math.sin(mu) * R_M);
  const BOLS_GC = manoDesde(P(131, 652), -1.75), BOLS_GL = manoDesde(P(372, 648), -1.75);

  /* ---------- manos ----------
   * { h: [x, y] } punto del tronco (hoja, sin inclinar) con mu relativo al tronco, { abs: [x, y] } punto de
   * la hoja con mu absoluto, { scr: () => punto del mundo } con mu absoluto, o { bols: true }. */
  function resolutor(R, p, lado) {
    const Tr = R.tronco(p);
    return o => {
      if (o.bols) {
        if (R.manoReposo) { const m = R.manoReposo(p, lado); return { x: m.x, y: m.y, mu: m.mu, ang: 0, puno: 0, dedos: TODOS(0.4), dobla: lado === "cerca" ? -1 : 1 }; }
        const m = Tr(lado === "cerca" ? BOLS_GC : BOLS_GL);
        return { x: m.x, y: m.y, mu: -1.75 + p.torso, ang: 0, puno: 0, dedos: TODOS(0.4), dobla: lado === "cerca" ? -1 : 1 };
      }
      if (o.scr) { const h = R.aHoja(p, o.scr()); return { x: h.x, y: h.y, mu: o.mu, ang: 0, puno: 1, dedos: o.dedos, dobla: o.dobla ?? (lado === "cerca" ? -1 : 1) }; }
      if (o.abs) return { x: o.abs[0], y: o.abs[1], mu: o.mu, ang: 0, puno: 1, dedos: o.dedos, dobla: o.dobla ?? (lado === "cerca" ? -1 : 1) };
      const q = Tr(P(o.h[0], o.h[1]));
      return { x: q.x, y: q.y, mu: o.mu + p.torso, ang: 0, puno: o.puno ?? 1, dedos: o.dedos, dobla: o.dobla ?? (lado === "cerca" ? -1 : 1), doblaYa: o.doblaYa };
    };
  }
  const mezMano = (a, d, k) => ({ x: lerp(a.x, d.x, k), y: lerp(a.y, d.y, k), mu: lerp(a.mu, d.mu, k), ang: 0, puno: lerp(a.puno, d.puno, k),
    dedos: DD(a.dedos, d.dedos, k), dobla: (d.doblaYa ? k > 0 : k >= 0.5) ? d.dobla : a.dobla });
  function pista(lista, t, res) {
    let c = res(lista[0][2]);
    for (let i = 1; i < lista.length; i++) {
      const [t0, t1, obj, f] = lista[i];
      if (t <= t0) break;
      c = mezMano(c, res(obj), (f || suave)(fase(t, t0, t1)));
    }
    return c;
  }
  const HM = (x, y, mu, dedos, dobla) => ({ h: [x, y], mu, dedos, dobla });
  const conMano = (m, dx, dy, dmu = 0) => Object.assign({}, m, { x: m.x + dx, y: m.y + dy, mu: m.mu + dmu });

  /* ---------- piernas ----------
   * Cada pie: { tob, ang } en la hoja (tobillo) o { x, y, ang } punto de apoyo de la suela en el mundo con el
   * giro de pantalla (para pisar la tabla). Si las piernas no llegan, la pelvis baja lo justo. */
  function ponPiernas(R, p, pies, cx) {
    for (const lado of ["cerca", "lejos"]) {
      const f = pies[lado];
      if (f.tob) { p.piernas[lado] = { tob: f.tob, ang: f.ang }; continue; }
      const ah = p.espejo ? -f.ang : f.ang, h = R.aHoja(p, P(f.x, f.y)), o = rot(P(cx, R.TOBILLO_ALTO), ah);
      p.piernas[lado] = { tob: P(h.x - o.x, h.y - o.y), ang: ah };
    }
  }
  // de un tobillo (pantalla) con su giro (hoja) al punto de la suela (pantalla): así se mezclan los dos modos sin saltos
  function suelaDe(R, p, tobH, angH, cx) { const o = rot(P(cx, R.TOBILLO_ALTO), angH); return R.aPantalla(p, P(tobH.x + o.x, tobH.y + o.y)); }
  const tobDe = (R, p, x, suelo, h, a) => { const q = R.aHoja(p, P(x, suelo - h)); return { tob: P(q.x, q.y - R.TOBILLO_ALTO), ang: a }; };
  function agacha(R, p, L, marg = 0.975) {
    const Tr = R.tronco(p), m = L * marg; let d = 0;
    for (const lado of ["cerca", "lejos"]) {
      const c = Tr(R.CADERA[lado]), a = p.piernas[lado].tob, dx = a.x - c.x;
      const yN = Math.abs(dx) < m ? a.y - Math.sqrt(m * m - dx * dx) : a.y;
      d = Math.max(d, yN - c.y);
    }
    if (d > 0) p.pelvis.y += d;
    return d;
  }
  const pelHoja = (R, p, y) => R.SUELO + (y - p.suelo) / (p.s * R.K);
  const PIERNA_S = 552, PIERNA_G = 540;
  const CX_S = (S.PUNTA.x + S.TALON.x) / 2, CX_G = (G.PUNTA.x + G.TALON.x) / 2;
  const ALTO_PEL_S = (S.SUELO - S.PELVIS.y) * SK_S, ALTO_PEL_G = (G.SUELO - G.PELVIS.y) * SK_G;

  // pasos sueltos [t0, t1, xDestino, alto] (de 00071)
  const ANG_PASO = u => 0.28 * Math.sin(Math.PI * u) - 0.05 * Math.sin(2 * Math.PI * u);
  function pieLista(lista, x0, t) {
    let x = x0;
    for (const [a, b, xd, alto] of lista) {
      if (t < a) break;
      const u = fase(t, a, b);
      if (u < 1) return { x: lerp(x, xd, suave(u)), h: alto * Math.sin(Math.PI * u), a: ANG_PASO(u), u };
      x = xd;
    }
    return { x, h: 0, a: 0, u: 1 };
  }

  /* =====================================================================================
   * LA TABLA (la de 00061, más larga para que quepan dos; giro alrededor del eje largo f y guiñada yaw)
   * ===================================================================================== */
  const TL = 204, TW = 44, TH = 6, RUEDA = 7.5, EJE = 54, CAMION = 9;
  const HO = RUEDA + CAMION + TH / 2;              // altura del centro del tablero sobre el suelo
  const kick = x => { const d = Math.abs(x) - (TL / 2 - 30); return d > 0 ? 11 * (d / 30) * (d / 30) : 0; };
  const anchoEn = x => { const d = Math.abs(x) - (TL / 2 - 20); return d > 0 ? TW * Math.sqrt(Math.max(0, 1 - (d / 20) * (d / 20))) : TW; };
  const CT = { tinta: TINTA, canto: "#e9c690", capa: "#8a4dff", lija: "#26252c", dibujo: "#2e2150", luna: "#ffd86b", estrella: "#ff8fbf",
    rueda: "#efe6ff", ruedaS: "#b9a6ee", camion: "#c9d0d8", camionS: "#7d868f" };
  // freno de cola: la tabla gira sobre la rueda trasera hasta que la cola toca el suelo
  const A_COLA = -Math.atan2(HO + kick(TL / 2) - TH / 2, TL / 2 - EJE);
  function dibTabla(g, B) {
    const cf = Math.cos(B.f || 0), sf = Math.sin(B.f || 0);
    g.save(); g.translate(B.x, B.y); g.rotate(B.a); g.scale(Math.cos(B.yaw || 0), 1); g.lineJoin = "round"; g.lineCap = "round";
    const Y = (u, z) => -(u * cf - z * sf), Z = (u, z) => u * sf + z * cf;
    const uEje = -(TH / 2 + CAMION), zr = TW / 2 - 6;
    const piezas = [];
    for (const xe of [-EJE, EJE]) {
      for (const zz of [-zr, zr]) piezas.push({ z: Z(uEje, zz), d: () => rueda(xe, Y(uEje, zz)) });
      piezas.push({ z: Z(uEje * 0.5, 0) - 0.01, d: () => camion(xe) });
    }
    piezas.sort((p, q) => p.z - q.z);
    function rueda(x, y) {
      const ry = Math.max(RUEDA * Math.abs(cf), 2.6);
      g.fillStyle = CT.rueda; g.strokeStyle = CT.tinta; g.lineWidth = 1.8;
      g.beginPath(); g.ellipse(x, y, RUEDA, ry, 0, 0, TAU); g.fill(); g.stroke();
      if (ry > 4) {
        g.fillStyle = CT.ruedaS; g.beginPath(); g.ellipse(x, y, RUEDA * 0.45, ry * 0.45, 0, 0, TAU); g.fill();
        const a = B.giro || 0; g.fillStyle = CT.tinta;
        g.beginPath(); g.ellipse(x + Math.cos(a) * RUEDA * 0.62, y + Math.sin(a) * ry * 0.62, 1.3, 1.3 * ry / RUEDA, 0, 0, TAU); g.fill();
      }
    }
    function camion(x) {
      const y0 = Y(-TH / 2, 0), y1 = Y(uEje, 0), ya = Y(uEje, -zr), yb = Y(uEje, zr);
      if (Math.abs(ya - yb) > 1) { g.strokeStyle = CT.tinta; g.lineWidth = 5; g.beginPath(); g.moveTo(x, ya); g.lineTo(x, yb); g.stroke();
        g.strokeStyle = CT.camion; g.lineWidth = 2.6; g.beginPath(); g.moveTo(x, ya); g.lineTo(x, yb); g.stroke(); }
      if (Math.abs(y1 - y0) > 1.5) {
        g.fillStyle = CT.camion; g.strokeStyle = CT.tinta; g.lineWidth = 1.6;
        g.beginPath(); g.moveTo(x - 10, y0); g.lineTo(x + 10, y0); g.lineTo(x + 5, y1); g.lineTo(x - 5, y1); g.closePath(); g.fill(); g.stroke();
        g.fillStyle = CT.camionS; g.beginPath(); g.ellipse(x, y1, 3.2, 3.2 * Math.abs(cf) + 0.6, 0, 0, TAU); g.fill();
      }
    }
    function tablero() {
      const N = 30, xs = []; for (let i = 0; i <= N; i++) xs.push(-TL / 2 + TL * i / N);
      if (Math.abs(cf) > 0.04) {
        const zl = (cf > 0 ? 1 : -1);
        const arriba = xs.map(x => [x, Y(kick(x) + TH / 2, zl * anchoEn(x) / 2)]), abajo = xs.map(x => [x, Y(kick(x) - TH / 2, zl * anchoEn(x) / 2)]);
        const poli = arriba.concat(abajo.reverse());
        g.beginPath(); poli.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath();
        g.fillStyle = CT.canto; g.fill();
        if (Math.abs(cf) > 0.5) { g.strokeStyle = CT.capa; g.lineWidth = 1.4; g.beginPath(); xs.forEach((x, i) => { const y = Y(kick(x), zl * anchoEn(x) / 2); i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.stroke(); }
        g.strokeStyle = CT.tinta; g.lineWidth = 2; g.beginPath(); poli.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.stroke();
      }
      if (Math.abs(sf) > 0.04) {
        const top = sf > 0, uc = x => kick(x) + (top ? TH / 2 : -TH / 2);
        const a1 = xs.map(x => [x, Y(uc(x), -anchoEn(x) / 2)]), a2 = xs.map(x => [x, Y(uc(x), anchoEn(x) / 2)]);
        const poli = a1.concat(a2.reverse());
        const camino = () => { g.beginPath(); poli.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); };
        camino(); g.fillStyle = top ? CT.lija : CT.dibujo; g.fill();
        g.save(); camino(); g.clip();
        const yc = Y(uc(0), 0), hh = Math.abs(sf) * TW / 2;
        if (top) {
          g.fillStyle = "rgba(255,255,255,0.09)"; for (let i = 0; i < 30; i++) g.fillRect(-TL / 2 + hash(i + 3) * TL, yc - hh + hash(i + 40) * 2 * hh, 1.6, 1.6);
          g.fillStyle = "rgba(255,255,255,0.12)"; g.fillRect(-TL / 2, yc - hh * 0.9, TL, Math.max(1, hh * 0.18));
        } else {
          // dibujo de abajo: una luna menguante y estrellitas
          g.save(); g.translate(0, yc); g.scale(1, Math.max(0.05, Math.abs(sf)) * (sf > 0 ? 1 : -1));
          g.fillStyle = CT.luna; g.beginPath(); g.arc(-34, 0, 15, 0, TAU); g.fill();
          g.fillStyle = CT.dibujo; g.beginPath(); g.arc(-28, -4, 13, 0, TAU); g.fill();
          g.fillStyle = CT.estrella;
          for (const [x, y, r] of [[8, -8, 5], [34, 6, 4], [58, -6, 3.2], [-64, 8, 3]]) { estrella(g, x, y, r, 4, 0, 0.42); g.fill(); }
          g.restore();
          g.fillStyle = "rgba(255,255,255,0.16)"; g.fillRect(-TL / 2, yc - hh, TL, Math.max(1, hh * 0.22));
        }
        g.restore();
        camino(); g.strokeStyle = CT.tinta; g.lineWidth = 2; g.stroke();
      }
    }
    for (const p of piezas) if (p.z < 0) p.d();
    tablero();
    for (const p of piezas) if (p.z >= 0) p.d();
    g.restore();
  }
  const enLija = (B, lx) => { const q = rot(P(lx * Math.cos(B.yaw || 0), -TH / 2 - kick(lx)), B.a); return P(B.x + q.x, B.y + q.y); };

  /* =====================================================================================
   * MOVIMIENTO: la tabla de Sara (velocidad integrada en una tabla) y la cámara
   * ===================================================================================== */
  const EMP = 0.62, V_SALE = 610;
  function vTabla(t) {
    // sale disparada con los dos; tras el bamboleo, otro tirón y se van
    if (t >= T.sale) return 330 * salida(fase(t, T.sale, T.sale + 0.22)) + 640 * tramo(t, T.sale + 0.72, T.sale + 1.15);
    let v = 290;
    T.emp.forEach((e, i) => { v += (i === 2 ? 72 : 44) * suave(fase(t, e + 0.13, e + 0.4)) * (1 - 0.72 * tramo(t, e + 0.55, e + 1.7)); });
    return v * (1 - tramo(t, T.frena0 + 0.1, T.frena1));
  }
  const DT = 1 / 400, T_INI = -2, NT = Math.round((DUR + 3 - T_INI) / DT) + 2;
  let XB = null;
  const interpA = (A, t) => { const u = (clamp(t, T_INI, T_INI + (NT - 1) * DT) - T_INI) / DT, i = Math.min(NT - 2, Math.floor(u)), f = u - i; return A[i] + (A[i + 1] - A[i]) * f; };
  function tablaXB() {
    if (XB) return XB;
    const A = new Float64Array(NT); let x = 0;
    for (let i = 1; i < NT; i++) { const t = T_INI + i * DT; x += (vTabla(t - DT) + vTabla(t)) * 0.5 * DT; A[i] = x; }
    const x0 = interpA(A, 0); for (let i = 0; i < NT; i++) A[i] += 700 - x0;
    XB = A; return XB;
  }
  const xB = t => interpA(tablaXB(), t);
  let XBR = null;
  const xbr = () => XBR ?? (XBR = xB(T.sale));             // dónde se para la tabla
  const LAG = 0.2, XS_P = 640, PAN = 300;
  function camX(t) { return t < T.sale ? xB(t - LAG) - XS_P : xbr() - XS_P + PAN * suave(fase(t, T.sale + 0.1, T.sale + 1.5)); }
  const camF = () => xbr() - XS_P + PAN;                    // cámara al final (quieta)

  // la tabla con Sara encima
  function tablaS(t) {
    const x = xB(t);
    const uc = fase(t, T.carve0, T.carve1), env = Math.sin(Math.PI * uc);
    const dy = 16 * env * env;                              // la curva: se acerca a cámara y vuelve
    const f = 0.42 * Math.sin(TAU * uc), yaw = 0.2 * Math.sin(TAU * uc);
    let a = A_COLA * tramo(t, T.frena0, T.frena0 + 0.14) * (1 - tramo(t, T.frena1 + 0.02, T.frena1 + 0.22));
    a += -0.075 * campana(t, T.sale - 0.01, T.sale + 0.22);   // la cola se hunde al caer Guillermo
    const bam = tramo(t, T.sale + 0.15, T.sale + 0.35);
    a += -bam * 0.045 * (0.5 + 0.5 * Math.sin((t - T.sale) * 10.5));
    const cy = Math.cos(yaw), suelo = SUELO_S + dy;
    const c = rot(P(-EJE * cy, HO), a);
    return { x: x - EJE * cy - c.x, y: suelo - c.y, a, f, yaw, giro: (x - 700) / RUEDA, suelo, dy, cx: x };
  }

  /* =====================================================================================
   * SARA
   * ===================================================================================== */
  // pies sobre la tabla (posición a lo largo de la tabla)
  function lxS(t) {
    let c = -38, l = 30;
    const kc = tramo(t, T.frena0 - 0.12, T.frena0 + 0.02) * (1 - tramo(t, T.frena1 + 0.12, T.frena1 + 0.36));
    c = lerp(c, -84, kc);
    const kp = tramo(t, T.sVe, T.sVe + 0.16);              // le ve venir: se adelanta y deja sitio en la cola
    c = lerp(c, 6, kp); l = lerp(l, 66, tramo(t, T.sVe + 0.06, T.sVe + 0.22));
    return { c, l };
  }
  // caminata de vuelta (pelvis): de fuera de cuadro a su sitio
  const XS_V0 = 1110, XS_V1 = 560, XG_V0 = 1260, XG_V1 = 740;
  const tVS0 = T.entran - 0.3, tVG0 = T.entran - 0.18, tVG1 = T.llegan + 0.12;
  const xVueltaS = t => camF() + lerp(XS_V0, XS_V1, suaveLin(fase(t, tVS0, T.llegan)));
  const xVueltaG = t => camF() + lerp(XG_V0, XG_V1, suaveLin(fase(t, tVG0, tVG1)));
  // arranque y parada suaves con velocidad constante en medio
  function suaveLin(k) { const a = 0.18; k = clamp(k); const vmax = 1 / (1 - a); if (k < a) return vmax * k * k / (2 * a); if (k > 1 - a) { const r = 1 - k; return 1 - vmax * r * r / (2 * a); } return vmax * (k - a / 2); }

  // x de la pelvis de Sara (para el viento de la melena)
  function xPelS(t) {
    if (t < 9.6) { const l = lxS(t); return xB(t) + (l.c + l.l) / 2; }
    if (t < tVS0) return camF() + XS_V0;
    return xVueltaS(t);
  }
  let PASOS_S = null, PASOS_G = null;
  // pasos de la vuelta: [t0, t1, xDestino, alto] por pie (dir −1: mira a la izquierda)
  function genPasos(t0, t1, xp, x1, n, primero, alto, cojo) {
    const L = { cerca: [], lejos: [] }, dir = -1, dt = (t1 - t0) / n;
    const fin = { cerca: x1 - dir * 20, lejos: x1 + dir * 22 };
    let lado = primero;
    for (let i = 0; i < n; i++) {
      const malo = cojo && lado === "cerca";
      const a = t0 + i * dt + (malo ? 0.04 : 0), b = a + dt * (malo ? 0.82 : 1.02);
      const xd = i >= n - 2 ? fin[lado] : xp(b) + dir * 26;
      L[lado].push([a, b, xd, alto * (malo ? 0.6 : 1)]);
      lado = lado === "cerca" ? "lejos" : "cerca";
    }
    return L;
  }
  function pasosS() { return PASOS_S || (PASOS_S = genPasos(tVS0 + 0.02, T.llegan - 0.02, xVueltaS, camF() + XS_V1, 6, "lejos", 20, false)); }
  function pasosG() { return PASOS_G || (PASOS_G = genPasos(tVG0 + 0.02, tVG1 - 0.02, xVueltaG, camF() + XG_V1, 6, "cerca", 22, true)); }

  const CS0 = { pel: 0, torso: 0, cab: 0 };
  const CSo = o => Object.assign({}, CS0, o);
  const CUERPOS_S = {
    monta: CSo({ pel: 10, torso: 0.04, cab: -0.02 }),
    carve: CSo({ pel: 22, torso: 0.1, cab: -0.04 }),
    mira: CSo({ pel: 12, torso: 0.0, cab: -0.12 }),
    frena: CSo({ pel: 18, torso: -0.14, cab: 0.02 }),
    espera: CSo({ pel: 6, torso: -0.02, cab: -0.1 }),
    ceja: CSo({ pel: 6, torso: -0.04, cab: -0.14 }),
    alerta: CSo({ pel: 14, torso: 0.0, cab: -0.08 }),
    sale: CSo({ pel: 22, torso: -0.06, cab: 0.1 }),
    tambalea: CSo({ pel: 24, torso: 0.08, cab: 0.0 }),
    anda: CSo({ pel: 6, torso: 0.02, cab: 0.02 }),
    para: CSo({ pel: 6, torso: 0.0, cab: 0.0 }),
    pisa: CSo({ pel: 14, torso: 0.08, cab: 0.1 }),
    camara: CSo({ pel: 6, torso: -0.02, cab: -0.04 })
  };
  const GUION_CUERPO_S = [
    [T.carve0, T.carve0 + 0.35, "carve"], [T.carve1 - 0.35, T.carve1, "monta"], [T.mira0, T.mira0 + 0.25, "mira"], [T.mira1, T.mira1 + 0.2, "monta"],
    [T.frena0 - 0.1, T.frena0 + 0.1, "frena"], [T.frena1, T.frena1 + 0.35, "espera"], [T.gSenala + 0.1, T.gSenala + 0.35, "ceja"],
    [T.sVe, T.sVe + 0.2, "alerta"], [T.sale, T.sale + 0.12, "sale", salida], [T.sale + 0.3, T.agarra + 0.2, "tambalea"],
    [9.6, 9.62, "anda"], [T.llegan - 0.2, T.llegan + 0.1, "para"], [T.pisa - 0.04, T.pisa + 0.12, "pisa"], [T.coge, T.coge + 0.25, "camara"]
  ];
  const CARAS_S = {
    crucero: E({ mx: 0.65, my: 0.05, c: 0.32, sd: 2, si: 4, abre: 0, ancho: 0.8, sonr: 0.2 }),
    carve: E({ mx: 0.75, my: 0.1, c: 0.42, h: 0.3, sd: 4, si: 8, abre: 0, ancho: 0.85, sonr: 0.4 }),
    reojo: E({ mx: -1, my: 0.05, c: 0.42, sd: -2, gd: 0.04, si: 10, gi: -0.05, abre: 0, ancho: 0.75, sonr: 0.32 }),
    frena: E({ mx: 0.5, my: 0.1, c: 0.3, sd: 6, si: 8, abre: 0, ancho: 0.8, sonr: 0.12 }),
    espera: E({ mx: -1, my: 0.12, c: 0.5, sd: -4, si: 2, abre: 0, ancho: 0.7, sonr: 0 }),
    ceja: E({ mx: -1, my: 0.1, c: 0.38, sd: -5, gd: 0.04, si: 18, gi: -0.08, abre: 0, ancho: 0.68, sonr: 0.05 }),
    alerta: E({ mx: -1, my: 0.18, c: 0.08, iris: 0.85, sd: 12, si: 20, abre: 6, ancho: 0.6, sonr: -0.25 }),
    susto: E({ mx: 0.7, my: -0.1, c: 0, iris: 0.72, sd: 24, si: 24, abre: 28, ancho: 0.85, sonr: -0.35 }),
    tambalea: E({ mx: 0.9, my: 0.1, c: 0.15, z: 0.4, sd: 16, si: 20, abre: 16, ancho: 0.8, sonr: -0.45 }),
    vuelve: E({ mx: 0.6, my: 0.12, c: 0.55, sd: -5, si: -3, abre: 0, ancho: 0.7, sonr: -0.08 }),
    pisa: E({ mx: 0.45, my: 0.7, c: 0.5, sd: -3, si: 0, abre: 0, ancho: 0.7, sonr: 0 }),
    camara: E({ mx: -0.28, my: 0.04, c: 0.42, sd: -2, si: 12, gi: -0.06, abre: 0, ancho: 0.75, sonr: 0.08 }),
    sonrie: E({ mx: -0.28, my: 0.04, c: 0.38, sd: 0, si: 14, gi: -0.06, abre: 0, ancho: 0.82, sonr: 0.5 })
  };
  const GUION_CARA_S = [
    [T.carve0 + 0.1, T.carve0 + 0.35, "carve"], [T.mira0, T.mira0 + 0.2, "reojo"], [T.mira1, T.mira1 + 0.2, "crucero"],
    [T.frena0 - 0.05, T.frena0 + 0.1, "frena"], [T.sMira, T.sMira + 0.25, "espera"], [T.gSenala + 0.12, T.gSenala + 0.3, "ceja"],
    [T.sVe, T.sVe + 0.12, "alerta"], [T.sale, T.sale + 0.06, "susto", salida], [T.sale + 0.3, T.sale + 0.5, "tambalea"],
    [9.6, 9.62, "vuelve"], [T.pisa - 0.1, T.pisa + 0.1, "pisa"], [T.coge + 0.05, T.camara + 0.1, "camara"], [T.sonrisa, T.sonrisa + 0.3, "sonrie"]
  ];
  const PARP_S = [0.9, 2.6, 4.0, 5.6, 6.7, 9.0, 11.9, 12.95, 13.9];

  // cuerpo de Sara sin cara ni manos (la melena y la pose lo usan)
  function cuerpoS(t) { return memo("c" + t, () => cuerpoS0(t)); }
  function cuerpoS0(t) {
    const b = guion(GUION_CUERPO_S, CUERPOS_S, "monta", t);
    const respira = Math.sin(t * 2.0 + 0.4);
    const vuelta = t >= 9.6;
    const p = { s: ESC, espejo: vuelta, tirasLimpias: true, torsoEsc: { x: 1, y: 1 + respira * 0.004 }, piernas: {},
      cabeza: { ang: b.cab, dx: 0, dy: 0, esc: { x: 1, y: 1 } }, torso: b.torso };
    let pies, pelY;
    if (!vuelta) {
      const B = tablaS(t), l = lxS(t), cyw = Math.cos(B.yaw);
      p.suelo = B.suelo; p.B = B;
      let pc = enLija(B, l.c), pl = enLija(B, l.l), ac = B.a, al = B.a;
      // saltitos al recolocar los pies en la tabla
      pc = P(pc.x, pc.y - 10 * campana(t, T.frena0 - 0.14, T.frena0 + 0.04) - 9 * campana(t, T.frena1 + 0.1, T.frena1 + 0.4) - 12 * campana(t, T.sVe - 0.02, T.sVe + 0.16));
      pl = P(pl.x, pl.y - 10 * campana(t, T.sVe + 0.04, T.sVe + 0.24));
      let empuja = 0;
      // empujones: el pie de atrás baja al asfalto, empuja y vuelve a la tabla
      for (const e of T.emp) {
        const u = (t - e) / EMP; if (u <= 0 || u >= 1) continue;
        const tp = e + 0.22 * EMP, sx = xB(tp) + 8, sy = SUELO_S + 3;
        empuja = Math.sin(Math.PI * u);
        if (u < 0.22) { const k = suave(u / 0.22); pc = P(lerp(pc.x, sx, k), lerp(pc.y, sy, k) - 12 * Math.sin(Math.PI * k)); ac = lerp(B.a, 0, k); }
        else if (u < 0.6) { pc = P(sx, sy); ac = 0.32 * tramo(u, 0.42, 0.6); }
        else { const k = suave((u - 0.6) / 0.4); pc = P(lerp(sx, pc.x, k), lerp(sy, pc.y, k) - 16 * Math.sin(Math.PI * k)); ac = lerp(0.32, B.a, k); }
      }
      pies = { cerca: { x: pc.x, y: pc.y, ang: ac }, lejos: { x: pl.x, y: pl.y, ang: al } };
      // pelvis sobre el pie de la tabla (el de delante), un poco adelantada al empujar
      const yPie = Math.min(pl.y, enLija(B, l.c).y);
      p.x = B.cx + ((l.c + l.l) / 2) * cyw + 6 * empuja + 4 * Math.sin(Math.PI * fase(t, T.carve0, T.carve1)) + 6 * tramo(t, T.sale, T.sale + 0.15) * (1 - tramo(t, T.sale + 0.4, T.sale + 0.9));
      pelY = yPie - ALTO_PEL_S + b.pel + 10 * empuja + respira * 0.4;
      p.torso += 0.1 * empuja + 0.05 * Math.sin(Math.PI * fase(t, T.carve0, T.carve1)) * Math.sin(TAU * fase(t, T.carve0, T.carve1));
      // al salir disparada: latigazo atrás y bamboleo
      const tb = t - T.sale;
      if (tb > 0) { const amort = Math.exp(-tb * 1.6); p.torso += 0.1 * Math.sin(tb * 8.5) * amort * tramo(t, T.sale + 0.12, T.sale + 0.3); p.cabeza.ang += 0.1 * Math.sin(tb * 8.5 - 0.8) * amort; }
      // bamboleo suave al patinar
      p.torso += 0.012 * Math.sin(t * 3.1) * (1 - tramo(t, T.frena1, T.frena1 + 0.3)) + 0.012 * Math.sin(t * 3.1) * tramo(t, T.sale, T.sale + 0.3);
    } else {
      // vuelve andando, con las manos en los bolsillos
      p.suelo = SUELO_S;
      const x = xVueltaS(t), PS = pasosS(), x0 = camF() + XS_V0;
      const fc = pieLista(PS.cerca, x0 + 20, t), fl = pieLista(PS.lejos, x0 - 22, t);
      p.x = x;
      pelY = SUELO_S - ALTO_PEL_S + b.pel + respira * 0.4 - 0.12 * Math.max(fc.h, fl.h);
      pies = { cerca: tobDe(S, Object.assign({}, p, { pelvis: S.PELVIS }), fc.x, SUELO_S, fc.h, fc.a), lejos: tobDe(S, Object.assign({}, p, { pelvis: S.PELVIS }), fl.x, SUELO_S, fl.h, fl.a) };
      // toque a la tabla con el pie de delante (el lejano, a la izquierda)
      const kp = campana(t, T.pisa - 0.06, T.coge - 0.08);
      if (kp > 0) {
        const q = pies.lejos.tob, ke = tramo(t, T.pisa - 0.06, T.pisa + 0.1) * (1 - tramo(t, T.pisa + 0.18, T.coge));
        pies.lejos = { tob: P(q.x + 70 * ke, q.y - 40 * campana(t, T.pisa + 0.06, T.coge - 0.04)), ang: 0.25 * ke };
      }
      pies.vuelta = true;
    }
    p.pelvis = { x: S.PELVIS.x, y: 0 };
    p.pelvis.y = pelHoja(S, p, pelY + ALTO_PEL_S) - (S.SUELO - S.PELVIS.y);
    ponPiernas(S, p, pies, CX_S);
    agacha(S, p, PIERNA_S, 0.965);
    p.empuja = !vuelta ? 1 : 0;
    return p;
  }

  /* ---------- la melena de Sara: dos muelles (raíz y punta) movidos por el viento y la inercia ---------- */
  const MEL_S = [
    { pieza: "melena_atras", raiz: P(565, 615), sg: -1, esc: 0.98, abre: 0.07, k: 1 },
    { pieza: "melena", raiz: P(990, 615), sg: 1, esc: 1, abre: -0.07, k: 0.45 }       // la de delante se va menos (no cruza el cuello)
  ];
  const LARGO_MEL = 488.18;
  const DTP = 1 / 240;
  let PELO = null;
  function movS(t) {
    const h = DTP, dir = t >= 9.6 ? -1 : 1;
    const x0 = xPelS(t - h), x1 = xPelS(t), x2 = xPelS(t + h);
    let vf = (x2 - x0) / (2 * h) * dir, af = (x2 - 2 * x1 + x0) / (h * h) * dir;
    if (t > 9.45 && t < tVS0 + 0.05) { vf = 0; af = 0; }        // fuera de cuadro: se cambia de lado sin tirones
    if (t >= tVS0) { vf *= 0.4; af *= 0.35; }                   // andando: poco viento
    return { vf, af: clamp(af, -4000, 4000) };
  }
  function tablaPelo() {
    if (PELO) return PELO;
    const n = Math.ceil((DUR + 0.5) / DTP) + 2; PELO = new Float32Array(n * 2);
    let a1 = 0.32, v1 = 0, a2 = 0.62, v2 = 0;
    for (let i = -360; i < n; i++) {
      const t = i * DTP, m = movS(t), ha = guion(GUION_CUERPO_S, CUERPOS_S, "monta", t).cab;
      const w = clamp(m.vf / 420, -0.3, 1.3);
      const o1 = 0.45 * ha + 0.7 * w, o2 = 0.15 * ha + 1.45 * w;
      v1 += (-81 * (a1 - o1) - 7.2 * v1 + 0.03 * m.af) * DTP; a1 += v1 * DTP;
      v2 += (-36 * (a2 - o2) - 3.6 * v2 + 0.026 * m.af) * DTP; a2 += v2 * DTP;
      a1 = clamp(a1, -1.0, 1.45); a2 = clamp(a2, -1.2, 1.85);
      if (i >= 0) { PELO[i * 2] = a1; PELO[i * 2 + 1] = a2; }
    }
    return PELO;
  }
  function anguloMelena(t) {
    const A = tablaPelo(), u = clamp(t, 0, DUR) / DTP, i = Math.floor(u), f = u - i;
    const a1 = lerp(A[i * 2], A[i * 2 + 2], f), a2 = lerp(A[i * 2 + 1], A[i * 2 + 3], f);
    const w = clamp(movS(t).vf / 520, 0, 1.25);
    // aleteo de las puntas con el viento
    return [a1 + 0.03 * w * Math.sin(t * 13.1), a2 + 0.07 * w * Math.sin(t * 17.3 + 1) + 0.04 * w * Math.sin(t * 26.7), 1 + 0.03 * w];
  }
  const TIRA = Recortes.tira, SIN_MELENA = new Set(["melena", "melena_atras"]);
  function dibMelenaS(g, ps, t) {
    const H = S.cabeza(ps), A = S.A, k = ps.s * S.K, [a1, a2, est] = anguloMelena(t);
    g.save(); g.translate(ps.x, ps.suelo); g.scale(ps.espejo ? -k : k, k); g.translate(-S.PELVIS.x, -S.SUELO);
    g.imageSmoothingEnabled = true; g.imageSmoothingQuality = "high";
    for (const m of MEL_S) {
      const r = H.a(m.raiz), L = LARGO_MEL;
      const c = { raiz: P(0, 0), a1: m.sg * (a1 * m.k + m.abre), a2: m.sg * (a2 * m.k + m.abre * 1.5), L, sj: L * 0.45, r: L * 0.4, estira: est, cuna: true, cunaAjustada: true };
      g.save(); g.translate(r.x, r.y); g.scale(m.sg * H.kx * m.esc, H.ky * m.esc);
      TIRA(g, A, m.pieza, c, 14);
      g.restore();
    }
    g.restore();
  }
  function dibujaSara(g, ps, t) {
    dibMelenaS(g, ps, t);
    Recortes.tira = function (gg, AA, n) { return AA === S.A && SIN_MELENA.has(n) ? [] : TIRA.apply(this, arguments); };
    try { S.dibujar(g, ps, t); } finally { Recortes.tira = TIRA; }
  }

  function poseS(t) { return memo("s" + t, () => poseS0(t)); }
  function poseS0(t) {
    const p = Object.assign({}, cuerpoS(t));
    const e = guion(GUION_CARA_S, CARAS_S, "crucero", t);
    p.cara = cara(e, parpadeo(t, PARP_S));
    const [a1] = anguloMelena(t);
    p.pelo = { viento: 0, inercia: clamp(a1 * 1.1, -2, 2) };
    p.tirasLimpias = true;
    manosS(p, t);
    // polvo y hojas tras el golpe
    if (t > 9.6) p.capaTronco = (g) => polvoTronco(g, 3);
    if (t > 9.6) p.capaCabeza = (g) => hojaPeloS(g, t);
    return p;
  }
  function manosS(p, t) {
    const rC = resolutor(S, p, "cerca"), rL = resolutor(S, p, "lejos");
    const vaiven = Math.sin(t * 3.1);
    const monta = { c: HM(18, 636, -1.4, TODOS(0.55), -1), l: HM(470, 628, -1.9, TODOS(0.55), 1) };
    const carve = { c: HM(-110, 470, -0.62, ABIERTA, -1), l: HM(600, 440, -2.7, ABIERTA, 1) };
    const frena = { c: HM(-80, 430, -0.8, TODOS(0.8), -1), l: HM(590, 470, -2.6, TODOS(0.8), 1) };
    const bols = { bols: true };
    const alerta = { c: HM(40, 560, -1.3, TODOS(0.7), -1), l: HM(470, 560, -2.0, TODOS(0.7), 1) };
    const aspa = { c: HM(20, 560, -1.2, ABIERTA, -1), l: HM(560, 300, -2.4, ABIERTA, 1) };
    // coge la tabla al vuelo junto a la cadera
    const coge = HM(170, 590, -1.85, AGARRA, -1);
    const pistaC = [[0, 0, monta.c], [T.carve0, T.carve0 + 0.35, carve.c], [T.carve1 - 0.3, T.carve1, monta.c],
      [T.frena0 - 0.1, T.frena0 + 0.12, frena.c], [T.frena1 + 0.1, T.frena1 + 0.5, bols], [T.sVe, T.sVe + 0.2, alerta.c],
      [T.sale + 0.02, T.sale + 0.2, aspa.c, salida], [9.6, 9.62, bols], [T.pisa + 0.05, T.coge - 0.04, coge]];
    const pistaL = [[0, 0, monta.l], [T.carve0 + 0.05, T.carve0 + 0.4, carve.l], [T.carve1 - 0.3, T.carve1, monta.l],
      [T.frena0 - 0.1, T.frena0 + 0.12, frena.l], [T.frena1 + 0.15, T.frena1 + 0.55, bols], [T.sVe + 0.03, T.sVe + 0.22, alerta.l],
      [T.sale + 0.02, T.sale + 0.2, aspa.l, salida], [9.6, 9.62, bols]];
    let C = pista(pistaC, t, rC), L = pista(pistaL, t, rL);
    // brazos sueltos al patinar: se mecen; en los empujones, braceo contrario a la pierna
    const kM = 1 - tramo(t, T.frena1, T.frena1 + 0.4);
    if (kM > 0 && t < T.sale) {
      C = conMano(C, 10 * vaiven * kM, 6 * Math.sin(t * 2.3) * kM); L = conMano(L, -10 * vaiven * kM, 6 * Math.sin(t * 2.3 + 1) * kM);
      for (const e of T.emp) { const k = campana(t, e, e + EMP); if (k > 0) { C = conMano(C, -70 * k, -20 * k, 0.3 * k); L = conMano(L, 60 * k, -40 * k, -0.3 * k); } }
    }
    // aspas: los brazos van y vienen (arcos, sin dar la vuelta)
    const kA = tramo(t, T.sale + 0.05, T.sale + 0.2) * (1 - tramo(t, T.agarra + 0.3, T.agarra + 0.8));
    if (kA > 0) {
      const ph = (t - T.sale) * 13;
      C = conMano(C, 26 * Math.sin(ph) * kA, 40 * Math.cos(ph) * kA, 0.3 * Math.sin(ph) * kA);
      L = conMano(L, -60 * Math.sin(ph + 1.7) * kA, 90 * Math.cos(ph + 1.7) * kA, -0.4 * Math.sin(ph + 1.7) * kA);
    }
    // tras agarrarse él: brazos abiertos para equilibrarse
    const kE = tramo(t, T.agarra + 0.3, T.agarra + 0.8);
    if (kE > 0 && t < 9.6) { const ee = { c: rC(HM(30, 540, -1.2, ABIERTA, -1)), l: rL(HM(590, 400, -2.6, ABIERTA, 1)) };
      C = mezMano(C, conMano(ee.c, 0, 30 * Math.sin(t * 7)), kE); L = mezMano(L, conMano(ee.l, 0, -30 * Math.sin(t * 7)), kE); }
    p.manoCerca = C; p.manoLejos = L;
    // la tabla en la mano al final
    const B = tablaEnMano(t, p);
    if (B) { const TM = B; p.manoCerca = Object.assign({}, p.manoCerca, { objeto: g => { g.save(); g.setTransform(MUNDO); dibTabla(g, TM); g.restore(); } }); }
  }

  /* =====================================================================================
   * GUILLERMO
   * ===================================================================================== */
  // distancia por detrás de Sara mientras corre
  const GAP = [[-1.5, 840], [0, 770], [1.7, 300], [2.6, 252], [3.4, 232], [3.8, 250], [T.gFrena, 300]];
  const xCorreG = t => xB(t) - curva(GAP, t)[0];
  let FRENO_G = null;
  function frenoG() {
    if (FRENO_G) return FRENO_G;
    const t0 = T.gFrena, x0 = xCorreG(t0), v0 = (xCorreG(t0 + 0.004) - xCorreG(t0 - 0.004)) / 0.008;
    const xf = xbr() - 250, d = xf - x0, h = 2 * d / v0;
    FRENO_G = { t0, x0, v0, xf, h, t1: t0 + h };
    return FRENO_G;
  }
  function xRunG(t) {
    const F = frenoG();
    if (t <= F.t0) return xCorreG(t);
    if (t >= F.t1) return F.xf;
    const u = (t - F.t0) / F.h, u2 = u * u, u3 = u2 * u;
    return (2 * u3 - 3 * u2 + 1) * F.x0 + (u3 - 2 * u2 + u) * F.v0 * F.h + (-2 * u3 + 3 * u2) * F.xf;
  }
  const vRunG = t => (xRunG(t + 0.004) - xRunG(t - 0.004)) / 0.008;
  // apoyos de la carrera: la cadencia sigue a la velocidad
  let CARRERA = null;
  function carrera() {
    if (CARRERA) return CARRERA;
    const F = frenoG(), ap = [];
    let ph = 0.5, lado = 0;
    for (let t = -1.2; t < F.t1 - 0.22; t += 0.001) {
      const v = vRunG(t), per = clamp(lerp(0.34, 0.24, (v - 140) / 320), 0.24, 0.34);
      ph += 0.001 / per;
      if (ph >= 1) { ph -= 1; ap.push([t, xRunG(t) + clamp(v / 380 * 26, 6, 30), lado ? "lejos" : "cerca", per]); lado ^= 1; }
    }
    // los dos últimos: se planta
    const sig = lado ? "lejos" : "cerca", otro = lado ? "cerca" : "lejos";
    const fin = { cerca: F.xf - 22, lejos: F.xf + 24 };
    const tl = ap[ap.length - 1][0];
    ap.push([Math.max(tl + 0.2, F.t1 - 0.18), fin[sig], sig, 0.3]);
    ap.push([Math.max(tl + 0.36, F.t1), fin[otro], otro, 0.3]);
    CARRERA = { ap, fin, tFin: Math.max(tl + 0.36, F.t1) };
    return CARRERA;
  }
  function pieCarrera(lado, t) {
    const ap = carrera().ap.filter(a => a[2] === lado);
    let i = -1; for (let k = 0; k < ap.length; k++) if (ap[k][0] <= t) i = k;
    if (i < 0) i = 0;
    const [tf, xf, , per] = ap[i], dur = 0.36 * per;
    if (i === ap.length - 1 || t <= tf + dur) { const u = clamp((t - tf) / dur); return { x: xf, h: 0, a: i === ap.length - 1 ? 0 : lerp(-0.12, 0.38, u) * (t >= tf ? 1 : 0) }; }
    const [tn, xn] = ap[i + 1], toff = tf + dur, u = clamp((t - toff) / (tn - toff));
    const alto = clamp(52 * (xn - xf) / 200, 14, 58);
    const k = suave(clamp((u - 0.1) / 0.9)), h = alto * Math.sin(Math.PI * Math.pow(u, 0.72));
    const a = u < 0.3 ? lerp(0.38, 1.0, suave(u / 0.3)) : u < 0.75 ? lerp(1.0, 0.15, suave((u - 0.3) / 0.45)) : lerp(0.15, -0.12, suave((u - 0.75) / 0.25));
    const ult = i + 1 === ap.length - 1;                     // al plantarse, el pie baja plano
    return { x: lerp(xf, xn, k), h: ult ? h * 0.6 : h, a: ult ? a * (1 - u) : a };
  }
  // fase de la carrera (entera en cada apoyo; par en los del pie cercano) para bracear y botar
  function faseCarrera(t) {
    const ap = carrera().ap;
    let i = 0; for (let k = 0; k < ap.length; k++) if (ap[k][0] <= t) i = k;
    if (i >= ap.length - 1) return { f: ap.length - 1, per: 0.3 };
    return { f: i + clamp((t - ap[i][0]) / (ap[i + 1][0] - ap[i][0])), per: ap[i][3] };
  }

  // de la parada al salto: pasos atrás, carrerilla y salto (posiciones respecto a donde se paró)
  const XGS = () => xbr() - 250;
  function pasosSalto() {
    const x = XGS();
    return {
      lejos: [[T.gAtras0, T.gAtras0 + 0.2, x - 70, 14], [T.gCorre + 0.13, T.gCorre + 0.27, x + 40, 34]],
      cerca: [[T.gAtras0 + 0.18, T.gAtras0 + 0.38, x - 112, 14], [T.gCorre, T.gCorre + 0.14, x - 20, 30], [T.gCorre + 0.26, T.gCorre + 0.4, x + 98, 34]]
    };
  }
  const CLAVES_XG = () => { const x = XGS(); return [[T.gAtras0, x], [T.gAtras1, x - 90], [T.gCorre, x - 90], [T.gCorre + 0.2, x - 28], [T.gCorre + 0.34, x + 40], [T.gSalta, x + 92]]; };
  const PIES_TABLA_G = { cerca: -92, lejos: -50 };

  const CG0 = { pel: 0, torso: 0.02, cab: 0.02 };
  const CGc = o => Object.assign({}, CG0, o);
  const CUERPOS_G = {
    corre: CGc({ pel: 10, torso: 0.2, cab: -0.12 }),
    rodillas: CGc({ pel: 28, torso: 0.74, cab: -0.1 }),
    idea: CGc({ pel: 8, torso: -0.04, cab: 0.06 }),
    senala: CGc({ pel: 10, torso: 0.06, cab: 0.04 }),
    atras: CGc({ pel: 22, torso: 0.1, cab: 0.0 }),
    carrerilla: CGc({ pel: 16, torso: 0.22, cab: -0.08 }),
    salta: CGc({ pel: 0, torso: -0.05, cab: -0.1 }),
    cae: CGc({ pel: 30, torso: -0.45, cab: -0.22 }),
    agarra: CGc({ pel: 22, torso: -0.22, cab: -0.1 }),
    anda: CGc({ pel: 10, torso: 0.06, cab: 0.06 }),
    para: CGc({ pel: 8, torso: 0.02, cab: 0.02 }),
    pulgar: CGc({ pel: 8, torso: -0.04, cab: -0.04 })
  };
  function guionCuerpoG() {
    const F = carrera();
    return [[F.tFin - 0.1, F.tFin + 0.35, "rodillas"], [T.gIdea - 0.1, T.gIdea + 0.15, "idea", salida], [T.gSenala + 0.05, T.gSenala + 0.3, "senala"],
      [T.gAtras0, T.gAtras0 + 0.25, "atras"], [T.gCorre, T.gCorre + 0.2, "carrerilla"], [T.gSalta - 0.04, T.gSalta + 0.1, "salta"],
      [T.sale - 0.02, T.sale + 0.1, "cae", salida], [T.agarra - 0.1, T.agarra + 0.25, "agarra"], [9.6, 9.62, "anda"],
      [tVG1 - 0.25, tVG1, "para"], [T.pulgar, T.pulgar + 0.25, "pulgar"]];
  }
  const CARAS_G = {
    corre: E({ mx: 0.9, my: -0.05, c: 0.12, sd: 14, gd: 0.16, si: 14, gi: 0.16, abre: 30, ancho: 0.75, sonr: -0.1, lengua: 1 }),
    jadea: E({ mx: 0.85, my: -0.25, c: 0.45, sd: 10, gd: 0.2, si: 10, gi: 0.2, abre: 34, ancho: 0.8, sonr: -0.25, lengua: 1 }),
    idea: E({ mx: 0.9, my: 0.45, c: 0.05, sd: 26, si: 26, abre: 16, ancho: 1, sonr: 0.95 }),
    picaro: E({ mx: 0.9, my: 0.25, c: 0.3, sd: -8, gd: -0.2, si: -6, gi: -0.18, abre: 4, ancho: 1, sonr: 0.9 }),
    salta: E({ mx: 0.9, my: 0.35, c: 0, sd: 22, si: 22, abre: 30, ancho: 1, sonr: 0.8 }),
    susto: E({ mx: 0.6, my: -0.1, c: 0, iris: 0.7, sd: 26, si: 26, abre: 34, ancho: 0.9, sonr: -0.5 }),
    agarra: E({ mx: 0.9, my: 0.1, c: 0.3, z: 0.6, sd: 18, gd: 0.1, si: 18, gi: 0.1, abre: 20, ancho: 0.9, sonr: -0.45 }),
    aturdido: E({ mx: 0.6, my: 0.1, esp: 0.75, sd: 10, gd: 0.15, si: 10, gi: 0.15, abre: 10, ancho: 0.7, sonr: 0.15 }),
    pulgar: E({ mx: -0.32, my: 0.05, c: 0.18, h: 0.45, sd: 16, si: 12, abre: 22, ancho: 0.95, sonr: 0.95 })
  };
  function guionCaraG() {
    const F = carrera();
    return [[F.tFin - 0.15, F.tFin + 0.2, "jadea"], [T.gIdea, T.gIdea + 0.12, "idea", salida], [T.gSenala + 0.2, T.gSenala + 0.4, "picaro"],
      [T.gSalta - 0.1, T.gSalta + 0.05, "salta"], [T.sale, T.sale + 0.05, "susto", salida], [T.agarra, T.agarra + 0.15, "agarra"],
      [9.6, 9.62, "aturdido"], [T.pulgar - 0.05, T.pulgar + 0.2, "pulgar"]];
  }
  const PARP_G = [1.4, 3.3, 6.4, 7.2, 11.95, 13.75];

  function poseG(t) { return memo("g" + t, () => poseG0(t)); }
  function poseG0(t) {
    const F = carrera(), b = guion(guionCuerpoG(), CUERPOS_G, "corre", t);
    const respira = Math.sin(t * 2.1);
    const p = { s: ESC, suelo: SUELO_G, espejo: false, tirasLimpias: true, ikContinuo: false, hombrosContinuos: true, hombrosRecortados: true,
      torso: b.torso, torsoEsc: { x: 1, y: 1 + respira * 0.004 }, piernas: {}, cabeza: { ang: b.cab, dx: 0, dy: 0, esc: { x: 1, y: 1 } } };
    let pies, pelY, fc = null;
    const jadeo = tramo(t, F.tFin - 0.2, F.tFin + 0.1) * (1 - tramo(t, T.gIdea - 0.1, T.gIdea + 0.1));
    if (t < T.gAtras0) {
      // carrera y parada
      p.x = xRunG(t);
      const wC = pieCarrera("cerca", t), wL = pieCarrera("lejos", t);
      const fc0 = faseCarrera(t), kR = clamp(vRunG(t) / 300);
      const bote = 9 * Math.cos(TAU * (fc0.f - 0.18)) * kR;
      pelY = SUELO_G - ALTO_PEL_G + b.pel + bote + respira * 0.4 + 5 * Math.sin(t * 15) * jadeo;
      p.torso += 0.12 * kR * (1 - tramo(t, F.tFin - 0.3, F.tFin)) + 0.04 * Math.sin(t * 15) * jadeo;
      p.cabeza.ang += 0.04 * Math.sin(t * 15 + 1) * jadeo;
      p.pelvis = { x: G.PELVIS.x, y: G.PELVIS.y };
      pies = { cerca: tobDe(G, p, wC.x, SUELO_G, wC.h, wC.a), lejos: tobDe(G, p, wL.x, SUELO_G, wL.h, wL.a) };
      fc = fc0;
    } else if (t < T.gSalta) {
      // pasos atrás y carrerilla
      p.x = curva(CLAVES_XG(), t)[0];
      const PS = pasosSalto(), wC = pieLista(PS.cerca, F.fin.cerca, t), wL = pieLista(PS.lejos, F.fin.lejos, t);
      const kc = tramo(t, T.gCorre, T.gCorre + 0.12);
      const agacha0 = 14 * campana(t, T.gSalta - 0.12, T.gSalta + 0.02);
      pelY = SUELO_G - ALTO_PEL_G + b.pel - 0.2 * Math.max(wC.h, wL.h) + agacha0;
      p.pelvis = { x: G.PELVIS.x, y: G.PELVIS.y };
      // en la carrerilla el pie de atrás despega con el talón alto
      pies = { cerca: tobDe(G, p, wC.x, SUELO_G, wC.h, wC.a * (1 + 1.5 * kc)), lejos: tobDe(G, p, wL.x, SUELO_G, wL.h, wL.a * (1 + 1.5 * kc)) };
    } else if (t < 9.6) {
      // vuelo y tabla
      const B = tablaS(t), cyw = Math.cos(B.yaw);
      const pc = enLija(B, PIES_TABLA_G.cerca), pl = enLija(B, PIES_TABLA_G.lejos);
      const xT = B.cx + ((PIES_TABLA_G.cerca + PIES_TABLA_G.lejos) / 2) * cyw;
      if (t < T.sale) {
        const u = fase(t, T.gSalta, T.sale), X0 = XGS() + 92;
        p.x = lerp(X0, xT, u);
        p.suelo = lerp(SUELO_G, SUELO_S, suave(u));
        // pies: de donde despegan a la cola de la tabla, recogidos por el camino
        const P0 = pasosSalto(), s0 = { cerca: pieLista(P0.cerca, F.fin.cerca, T.gSalta), lejos: pieLista(P0.lejos, F.fin.lejos, T.gSalta) };
        const pp = { x: p.x, suelo: p.suelo, s: ESC, espejo: false };
        const de = l => { const w = s0[l], q = tobDe(G, Object.assign({}, pp, { x: X0, suelo: SUELO_G }), w.x, SUELO_G, w.h, w.a); return suelaDe(G, Object.assign({}, pp, { x: X0, suelo: SUELO_G }), q.tob, q.ang, CX_G); };
        const a = { cerca: pc, lejos: pl }; pies = {};
        for (const l of ["cerca", "lejos"]) {
          const d = de(l), k = suave(u), sube = 66 * Math.sin(Math.PI * Math.pow(u, 0.8));
          pies[l] = { x: lerp(d.x, a[l].x, k), y: lerp(d.y, a[l].y, k) - sube, ang: lerp(0, B.a, k) + 0.5 * Math.sin(Math.PI * u) * (l === "cerca" ? 1 : 0.6) };
        }
        const yT = Math.min(pc.y, pl.y);
        const yAire = lerp(SUELO_G, yT, u) - 40 * Math.sin(Math.PI * u);
        pelY = yAire - ALTO_PEL_G + 14;
      } else {
        p.suelo = SUELO_S;
        const tb = t - T.sale, amort = Math.exp(-tb * 1.5);
        p.x = xT - 10 * tramo(t, T.sale, T.sale + 0.12) * (1 - tramo(t, T.agarra - 0.05, T.agarra + 0.25)) + 6 * Math.sin(tb * 7.3) * amort;
        pies = { cerca: { x: pc.x, y: pc.y, ang: B.a }, lejos: { x: pl.x, y: pl.y, ang: B.a } };
        const aterriza = 26 * campana(t, T.sale - 0.02, T.sale + 0.3);
        pelY = Math.min(pc.y, pl.y) - ALTO_PEL_G + b.pel + aterriza;
        p.torso += 0.14 * Math.sin(tb * 7.3 + 1) * amort * tramo(t, T.sale + 0.1, T.sale + 0.3);
        p.cabeza.ang += 0.1 * Math.sin(tb * 7.3 + 0.2) * amort;
      }
      p.pelvis = { x: G.PELVIS.x, y: G.PELVIS.y };
    } else {
      // vuelve cojeando
      p.suelo = SUELO_G; p.espejo = true;
      p.x = xVueltaG(t);
      const PS = pasosG(), x0 = camF() + XG_V0;
      const wC = pieLista(PS.cerca, x0 + 20, t), wL = pieLista(PS.lejos, x0 - 22, t);
      // cojera: se hunde al apoyar el pie malo (el cercano)
      const cojea = wL.h > 0.5 ? 9 * Math.sin(Math.PI * wL.u) : 0;
      pelY = SUELO_G - ALTO_PEL_G + b.pel - 0.12 * Math.max(wC.h, wL.h) + cojea + respira * 0.4;
      p.torso += 0.05 * Math.sin(Math.PI * (wL.h > 0.5 ? wL.u : 0));
      p.pelvis = { x: G.PELVIS.x, y: G.PELVIS.y };
      pies = { cerca: tobDe(G, p, wC.x, SUELO_G, wC.h, wC.a), lejos: tobDe(G, p, wL.x, SUELO_G, wL.h, wL.a) };
    }
    p.pelvis.y = pelHoja(G, p, pelY + ALTO_PEL_G) - (G.SUELO - G.PELVIS.y);
    ponPiernas(G, p, pies, CX_G);
    agacha(G, p, PIERNA_G, t > T.sale - 0.1 && t < 9.6 ? 0.965 : 0.99);
    // cara
    const e = guion(guionCaraG(), CARAS_G, "corre", t);
    if (jadeo > 0) e.abre += 10 * jadeo * Math.max(0, Math.sin(t * 15));
    p.cara = cara(e, parpadeo(t, PARP_G));
    p.sudor = 0.9 * (1 - tramo(t, T.gIdea, T.gIdea + 0.4)) + 0.6 * campana(t, T.sale, T.agarra + 0.6);
    p.rojo = 0.3 * tramo(t, 1.5, 3.0) * (1 - tramo(t, T.gIdea, T.gIdea + 0.5));
    manosG(p, t, fc);
    if (t > 9.6) { p.capaCabeza = (g) => hojaPeloG(g, t); p.capaTronco = (g) => polvoTronco(g, 7); }
    return p;
  }
  // rodilla (hoja) a partir de cadera y tobillo (la rodilla sale hacia delante)
  function rodilla(R, p, lado, L) {
    const c = R.tronco(p)(R.CADERA[lado]), a = p.piernas[lado].tob, dx = a.x - c.x, dy = a.y - c.y, d = Math.hypot(dx, dy);
    const h = Math.sqrt(Math.max(0, (L / 2) * (L / 2) - (d / 2) * (d / 2)));
    return P((c.x + a.x) / 2 + dy / d * h, (c.y + a.y) / 2 - dx / d * h);
  }
  function manosG(p, t, fc) {
    const rC = resolutor(G, p, "cerca"), rL = resolutor(G, p, "lejos"), F = carrera();
    const bols = { bols: true };
    // carrera: brazos contrarios a las piernas (00071)
    const brazos = ph => ({ c: rC(HM(150 - 150 * ph, 525 + 85 * ph, 1.5 - 0.8 * ph, PUNO, -1)), l: rL(HM(470 + 120 * ph, 525 - 85 * ph, 1.1 + 0.8 * ph, PUNO, 1)) });
    let C, L;
    if (t < T.gAtras0) {
      const f = (fc || faseCarrera(t)).f, br = brazos(Math.cos(Math.PI * f));
      C = br.c; L = br.l;
      // manos a las rodillas
      const kR = tramo(t, F.tFin - 0.15, F.tFin + 0.2) * (1 - tramo(t, T.gIdea - 0.05, T.gIdea + 0.15));
      if (kR > 0) {
        const rc = rodilla(G, p, "cerca", PIERNA_G), rl = rodilla(G, p, "lejos", PIERNA_G), cad = G.tronco(p)(G.CADERA.cerca);
        const jad = 4 * Math.sin(t * 15);
        const mc = { x: lerp(rc.x, cad.x, 0.14) + 6, y: lerp(rc.y, cad.y, 0.14) - 24 + jad, mu: -2.2, ang: 0, puno: 1, dedos: TODOS(0.75), dobla: -1 };
        const ml = { x: lerp(rl.x, cad.x, 0.1) + 34, y: lerp(rl.y, cad.y, 0.1) - 24 + jad, mu: -2.0, ang: 0, puno: 1, dedos: TODOS(0.75), dobla: 1 };
        C = mezMano(C, mc, kR); L = mezMano(L, ml, kR);
      }
      // la idea: señala la tabla (antebrazo tumbado) y la otra mano al bolsillo
      const kS = tramo(t, T.gSenala, T.gSenala + 0.2);
      if (kS > 0) { C = mezMano(C, rC(bols), kS); L = mezMano(L, rL(HM(640, 500, Math.PI - 0.25, SENALA, 1)), kS); }
    } else if (t < T.gSalta) {
      // atrás: puños a los lados; carrerilla: braceo
      const kc = tramo(t, T.gCorre - 0.05, T.gCorre + 0.08);
      const at = { c: rC(HM(140, 580, 1.75, PUNO, -1)), l: rL(HM(430, 570, 1.6, PUNO, 1)) };
      const ph = Math.cos(Math.PI * (t - T.gCorre) / 0.135), br = brazos(ph);
      const kA = tramo(t, T.gAtras0 - 0.1, T.gAtras0 + 0.15);
      const prev = { c: rC(bols), l: rL(HM(640, 500, Math.PI - 0.25, SENALA, 1)) };
      C = mezMano(mezMano(prev.c, at.c, kA), br.c, kc); L = mezMano(mezMano(prev.l, at.l, kA), br.l, kc);
    } else if (t < 9.6) {
      // salto: brazos arriba hacia delante; caída: aspas; luego se agarra al hombro de Sara
      const arriba = { c: rC(HM(-90, 300, -0.5, ABIERTA, -1)), l: rL(HM(540, 450, 2.0, PUNO, 1)) };      // en bomba: el puño lejano recogido delante del pecho
      const k0 = tramo(t, T.gSalta - 0.05, T.gSalta + 0.12);
      const ph = Math.cos(Math.PI * (T.gSalta - T.gCorre - 0.4) / 0.135), br = brazos(ph);
      C = mezMano(br.c, arriba.c, k0); L = mezMano(br.l, arriba.l, k0);
      const kA = tramo(t, T.sale, T.sale + 0.12) * (1 - tramo(t, T.agarra + 0.4, T.agarra + 0.9));
      if (kA > 0) { const w = (t - T.sale) * 12;
        const atras = rC(HM(-120, 300, -0.4, ABIERTA, -1)), aire = rL(HM(560, 560, -2.4, TODOS(0.6), 1));
        C = mezMano(C, conMano(atras, 70 * Math.sin(w + 2), 90 * Math.cos(w + 2), 0.5 * Math.sin(w + 2)), kA);
        L = mezMano(L, conMano(aire, 24 * Math.sin(w), 34 * Math.cos(w), -0.3 * Math.sin(w)), kA); }
      const kG = tramo(t, T.agarra - 0.12, T.agarra + 0.04);
      if (kG > 0) {
        const ag = rL({ scr: () => hombroSara(t), mu: Math.PI - 0.35, dedos: AGARRA, dobla: 1 });
        L = mezMano(L, ag, kG);
        // la otra mano sigue haciendo aspas, cada vez más tranquila
        const w = (t - T.sale) * 9, kc = 1 - tramo(t, T.agarra + 0.6, T.agarra + 1.2);
        C = mezMano(C, rC(HM(-110 + 50 * Math.sin(w) * kc, 300 + 70 * Math.cos(w) * kc, -0.4, ABIERTA, -1)), kG);
      }
    } else {
      // vuelve: se frota la coronilla con la cercana; al final, pulgar arriba con la lejana (antebrazo tumbado)
      const frota = HM(170, 120, -2.2, TODOS(0.8), -1);
      C = conMano(rC(frota), 0, 0);
      const fr = Math.sin(t * 13) * (1 - tramo(t, T.pulgar, T.pulgar + 0.3));
      C = conMano(C, 14 * fr, 8 * Math.cos(t * 13) * (1 - tramo(t, T.pulgar, T.pulgar + 0.3)));
      L = rL(bols);
      const kP = tramo(t, T.pulgar, T.pulgar + 0.22, salida);
      if (kP > 0) L = mezMano(L, rL(HM(590, 450, Math.PI, PULGAR, 1)), kP);
    }
    p.manoCerca = C; p.manoLejos = L;
  }
  // hombro cercano de Sara (mundo): ahí se agarra Guillermo
  function hombroSara(t) { const ps = cuerpoS(t); const q = S.tronco(ps)(P(130, 330)); return S.aPantalla(ps, q); }

  function pose(t) { return { g: poseG(t), s: poseS(t) }; }

  /* =====================================================================================
   * LA TABLA QUE VUELVE SOLA, LA TAPA Y EL GATO
   * ===================================================================================== */
  const X_BACHE = 560;                                    // pantalla (cámara final)
  let VUELTA = null;
  function vueltaTabla() {
    if (VUELTA) return VUELTA;
    const cf = camF(), x0 = cf + 1200, v0 = 720, dec = 260, xHit = cf + X_BACHE + EJE;
    // instante en que la rueda delantera pilla el bache
    const disc = v0 * v0 - 2 * dec * (x0 - xHit), tau = (v0 - Math.sqrt(Math.max(0, disc))) / dec;
    const tHit = T.vuelve + tau, vHit = v0 - dec * tau;
    VUELTA = { x0, v0, dec, tHit, vHit, xHit, vuelo: 0.36, tierra: SUELO_V };
    return VUELTA;
  }
  function tablaVuelve(t) {
    const V = vueltaTabla();
    if (t < V.tHit) {
      const tau = t - T.vuelve, x = V.x0 - V.v0 * tau + 0.5 * V.dec * tau * tau;
      return { x, y: V.tierra - HO, a: 0, f: 0, giro: -(V.x0 - x) / RUEDA, yaw: 0 };
    }
    const tl = V.tHit + V.vuelo, giroHit = -(V.x0 - V.xHit) / RUEDA;
    if (t < tl) {
      const u = (t - V.tHit) / V.vuelo, x = V.xHit - V.vHit * 0.75 * (t - V.tHit);
      // medio giro sobre su eje largo: de pie a boca arriba (las ruedas arriba)
      const y = lerp(V.tierra - HO, V.tierra - 14, u) - 50 * Math.sin(Math.PI * u);
      return { x, y, a: -0.3 * Math.sin(Math.PI * u), f: Math.PI * suave(u), giro: giroHit - 14 * (t - V.tHit), yaw: 0 };
    }
    // boca arriba: un botecito, se desliza un poco y se para; las ruedas siguen girando
    const xl = V.xHit - V.vHit * 0.75 * V.vuelo, tt = t - tl;
    const x = xl - 70 * (1 - Math.exp(-tt * 6));
    const bote = 9 * Math.exp(-tt * 9) * Math.abs(Math.sin(tt * 16));
    return { x, y: V.tierra - 14 - bote, a: 0.05 * Math.exp(-tt * 7) * Math.sin(tt * 20), f: Math.PI, giro: giroHit - 14 * V.vuelo - 26 * (1 - Math.exp(-tt * 0.3)) / 0.3, yaw: 0, quieta: true, tl };
  }
  // del suelo a la mano de Sara: un toque en la punta y media vuelta en el aire
  let AGARRE_S = null;
  const LG = P(TL / 2 - 26, 0);                            // por dónde la coge (cerca del morro)
  function tablaEnMano(t, p) {
    if (t < T.coge) return null;
    const m = p.manoCerca, q = S.aPantalla(p, P(m.x, m.y));
    const sw = 0.12 * Math.exp(-(t - T.coge) * 4) * Math.sin((t - T.coge) * 10) + 0.03 * Math.sin(t * 2.1);
    const a = -Math.PI / 2 + sw, r = rot(LG, a);
    return { x: q.x - r.x, y: q.y - r.y, a, f: 0, giro: 0, yaw: 0 };
  }
  function tablaSuelta(t) {
    if (t < T.vuelve - 0.05 || t >= T.coge) return null;
    const B = tablaVuelve(t);
    if (t < T.pisa + 0.08) return B;
    // vuela a la mano
    if (!AGARRE_S) AGARRE_S = tablaEnMano(T.coge, poseS(T.coge));
    const A0 = tablaVuelve(T.pisa + 0.08), A1 = AGARRE_S, u = fase(t, T.pisa + 0.08, T.coge), k = suave(u);
    return { x: lerp(A0.x, A1.x, k), y: lerp(A0.y, A1.y, k) - 60 * Math.sin(Math.PI * u), a: lerp(0, A1.a, salida(u)), f: lerp(Math.PI, TAU, k), giro: A0.giro - 10 * (t - T.pisa), yaw: 0 };
  }

  // tapa del cubo: entra rodando de canto, se tambalea y se queda plana
  const R_TAPA = 32;
  const CLAVES_TAPA = [[T.tapa, 1090], [T.tapa + 0.4, 905], [T.tapa + 0.75, 842], [T.tapa + 1.15, 826]];
  function tapa(g, t) {
    if (t < T.tapa) return;
    const cf = camF(), x = cf + curva(CLAVES_TAPA, t)[0], gira = -(1090 - (x - cf)) / R_TAPA;
    const cae = tramo(t, T.tapa + 0.55, T.tapa + 1.25, entrada);       // de canto (0) a plana (1)
    const ry = lerp(R_TAPA, R_TAPA * 0.24, cae), cy = SUELO_V + 8 - lerp(R_TAPA, 3, cae);
    const bail = (1 - tramo(t, T.tapa + 1.2, T.tapa + 1.6)) * cae, w = Math.pow(Math.max(0, t - T.tapa - 0.55), 1.6) * 34;
    const incl = 0.22 * bail * Math.sin(w), dy = 3 * bail * Math.abs(Math.sin(w));
    g.save(); g.translate(x, cy - dy); g.rotate(incl);
    // sombra
    g.fillStyle = "rgba(0,0,0,0.35)"; g.beginPath(); g.ellipse(0, lerp(R_TAPA, 3, cae) + 2 + dy, R_TAPA * 0.9, 4, 0, 0, TAU); g.fill();
    g.lineWidth = 2;
    g.fillStyle = "#7d8597"; g.strokeStyle = TINTA; g.beginPath(); g.ellipse(0, 0, R_TAPA, ry, 0, 0, TAU); g.fill(); g.stroke();
    g.strokeStyle = "rgba(30,34,46,0.7)"; g.lineWidth = 1.4;
    for (const k of [0.78, 0.56]) { g.beginPath(); g.ellipse(0, 0, R_TAPA * k, ry * k, 0, 0, TAU); g.stroke(); }
    g.fillStyle = "rgba(255,255,255,0.28)"; g.beginPath(); g.ellipse(-R_TAPA * 0.35, -ry * 0.35, R_TAPA * 0.32, ry * 0.18, -0.5, 0, TAU); g.fill();
    // asa: gira mientras rueda; tumbada se ve de canto
    g.save(); g.scale(1, ry / R_TAPA); g.rotate(gira * (1 - cae));
    g.strokeStyle = TINTA; g.lineWidth = 6; g.beginPath(); g.moveTo(-9, 0); g.lineTo(9, 0); g.stroke();
    g.strokeStyle = "#aab2c2"; g.lineWidth = 3; g.beginPath(); g.moveTo(-9, 0); g.lineTo(9, 0); g.stroke();
    g.restore();
    g.restore();
  }
  // gato: entra escopetado por la derecha, salta la tapa y sale por la izquierda
  function gato(g, t) {
    const u = fase(t, T.gato, T.gato + 0.9); if (u <= 0 || u >= 1) return;
    const cf = camF(), x = cf + lerp(1100, -120, u), xt = cf + curva(CLAVES_TAPA, t)[0];
        const d = (x - xt) / 90, brinco = Math.abs(d) < 1 ? 46 * Math.cos(d * Math.PI / 2) : 0;
    const gal = (t - T.gato) * 22, bote = 5 * Math.abs(Math.sin(gal));
    const y = SUELO_V + 12 - 24 - bote - brinco * 1.3;
    g.save(); g.translate(x, y); g.scale(-1.6, 1.6);    // mira a la izquierda
    g.fillStyle = "#0d0b10"; g.strokeStyle = "#0d0b10"; g.lineCap = "round"; g.lineJoin = "round";
    const est = Math.sin(gal);                          // estirado / recogido
    // patas
    g.lineWidth = 5;
    for (const [bx, s] of [[16, 1], [-16, -1]]) { g.beginPath(); g.moveTo(bx, 2); g.lineTo(bx + 14 * est * s + (brinco > 2 ? 10 * s : 0), 15 - 3 * Math.abs(est)); g.stroke(); }
    // cuerpo erizado
    g.beginPath(); g.ellipse(0, -2, 24, 10 + 2 * est, 0, 0, TAU); g.fill();
    for (let i = 0; i < 9; i++) { const a = Math.PI + 0.25 + i * 0.32, r0 = 9; g.beginPath(); g.moveTo(Math.cos(a) * 22, -2 + Math.sin(a) * r0); g.lineTo(Math.cos(a) * 26, -2 + Math.sin(a) * (r0 + 7)); g.lineWidth = 3; g.stroke(); }
    // cola en escobilla
    g.lineWidth = 7; g.beginPath(); g.moveTo(-22, -4); g.quadraticCurveTo(-36, -14, -30, -32 - 4 * est); g.stroke();
    for (let i = 0; i < 6; i++) { const yy = -10 - i * 4; g.lineWidth = 2.4; g.beginPath(); g.moveTo(-32 + (i % 2 ? 4 : -4), yy); g.lineTo(-32 + (i % 2 ? 10 : -10), yy - 3); g.stroke(); }
    // cabeza con orejas
    g.beginPath(); g.arc(25, -10, 10, 0, TAU); g.fill();
    g.beginPath(); g.moveTo(18, -16); g.lineTo(20, -28); g.lineTo(26, -18); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(27, -18); g.lineTo(33, -28); g.lineTo(34, -14); g.closePath(); g.fill();
    // ojos como platos y boca abierta (maullido)
    g.fillStyle = "#ffe14d"; g.beginPath(); g.arc(28, -12, 3.2, 0, TAU); g.arc(33.5, -11, 2.6, 0, TAU); g.fill();
    g.fillStyle = "#0d0b10"; g.fillRect(28, -14, 1.2, 4); g.fillRect(33.4, -13, 1, 3.4);
    g.fillStyle = "#ff7a8a"; g.beginPath(); g.ellipse(33, -4, 3, 2.6, 0, 0, TAU); g.fill();
    g.restore();
  }
  // maullido: bocadillo erizado con un garabato dentro (sin letras)
  function maullido(g, t) {
    const k = campana(t, T.gato + 0.04, T.gato + 0.7); if (k < 0.01) return;
    const cf = camF(), u = fase(t, T.gato, T.gato + 0.9), x = cf + lerp(1100, -120, u) + 30, y = 400;
    const s = 0.7 + 0.3 * k;
    g.save(); g.translate(Math.min(x, cf + 960), y); g.scale(s, s); g.globalAlpha = clamp(k * 1.6);
    estrella(g, 0, 0, 44, 11, 0.2 + t * 0.4, 0.72); g.fillStyle = "#fffbe8"; g.fill(); g.strokeStyle = TINTA; g.lineWidth = 3; g.stroke();
    g.strokeStyle = "#e0453a"; g.lineWidth = 3.4; g.lineJoin = "round"; g.lineCap = "round";
    g.beginPath(); for (let i = 0; i <= 7; i++) { const px = -22 + i * 6.3, py = (i % 2 ? -9 : 9) * (1 - 0.15 * Math.abs(i - 3.5)); i ? g.lineTo(px, py) : g.moveTo(px, py); } g.stroke();
    g.restore();
  }
  // bache del asfalto donde pilla la rueda
  function bache(g) {
    const x = camF() + X_BACHE, y = SUELO_V + 1;
    g.save(); g.fillStyle = "#14151d"; g.beginPath(); g.ellipse(x, y, 22, 5, 0, 0, TAU); g.fill();
    g.strokeStyle = "rgba(160,160,180,0.35)"; g.lineWidth = 1.4; g.beginPath(); g.ellipse(x, y - 1, 22, 5, 0, Math.PI, TAU); g.stroke();
    g.fillStyle = "#3a3b48"; for (const [dx, dy, r] of [[-26, 2, 2.4], [24, 1, 2], [30, 3, 1.5]]) { g.beginPath(); g.arc(x + dx, y + dy, r, 0, TAU); g.fill(); }
    g.restore();
  }

  /* =====================================================================================
   * HOJAS Y POLVO (tras el golpe)
   * ===================================================================================== */
  function hoja(g, x, y, r, a, col) {
    g.save(); g.translate(x, y); g.rotate(a);
    g.beginPath(); g.moveTo(-r, 0); g.quadraticCurveTo(-r * 0.2, -r * 0.62, r, 0); g.quadraticCurveTo(-r * 0.2, r * 0.62, -r, 0); g.closePath();
    g.fillStyle = col; g.fill(); g.strokeStyle = "rgba(40,20,10,0.8)"; g.lineWidth = r * 0.12; g.stroke();
    g.beginPath(); g.moveTo(-r * 0.9, 0); g.lineTo(r * 0.8, 0); g.lineWidth = r * 0.08; g.stroke();
    g.restore();
  }
  function hojaPeloS(g, t) { hoja(g, 760, 140, 60, -0.5, "#c9772f"); hoja(g, 1010, 330, 46, 0.9, "#9a8a2a"); manchas(g, [[760, 520, 34], [930, 610, 22]]); }
  function hojaPeloG(g, t) {
    const cae = tramo(t, T.pulgar + 0.2, T.pulgar + 0.9, entrada);
    hoja(g, 700, 120 + 260 * cae, 64, 0.4 + 2 * cae, "#d1842e");
    hoja(g, 930, 70, 48, -0.7, "#a0952f");
    manchas(g, [[660, 680, 40], [930, 720, 26], [820, 540, 18]]);
  }
  function manchas(g, L) { g.save(); g.fillStyle = "rgba(120,96,80,0.3)"; for (const [x, y, r] of L) { g.beginPath(); g.ellipse(x, y, r, r * 0.7, 0.4, 0, TAU); g.fill(); } g.restore(); }
  function polvoTronco(g, sem) {
    g.save(); g.fillStyle = "rgba(176,160,140,0.2)";
    for (let i = 0; i < 4; i++) { const x = 160 + 200 * hash(sem + i * 3.1), y = 420 + 260 * hash(sem + i * 5.7), r = 12 + 10 * hash(sem + i); g.beginPath(); g.ellipse(x, y, r * 1.4, r * 0.6, 0.3 * i, 0, TAU); g.fill(); }
    g.restore();
  }

  /* =====================================================================================
   * EFECTOS
   * ===================================================================================== */
  function estrella(g, x, y, r, n, giro, hueco = 0.45) {
    g.beginPath();
    for (let i = 0; i < n * 2; i++) { const a = giro + i * Math.PI / n, rr = i % 2 ? r * hueco : r; const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr; if (i) g.lineTo(px, py); else g.moveTo(px, py); }
    g.closePath();
  }
  // chispas del freno de cola
  function chispas(g, t) {
    const t0 = T.frena0 + 0.13, t1 = T.frena1 - 0.05; if (t < t0 || t > t1 + 0.35) return;
    g.save(); g.globalCompositeOperation = "lighter"; g.lineCap = "round";
    for (let i = 0; i < 44; i++) {
      const tb = t0 + (t1 - t0) * i / 44, vida = 0.22 + 0.12 * hash(i * 1.7), u = (t - tb) / vida;
      if (u <= 0 || u >= 1) continue;
      const B = tablaS(tb), q = enLija(B, -TL / 2 + 4);
      const vx = -(140 + 160 * hash(i * 3.3)), vy = -(60 + 120 * hash(i * 5.9)), dt = t - tb;
      const x = q.x + 6 + vx * dt, y = SUELO_S - 1 + vy * dt + 420 * dt * dt;
      const a = (1 - u);
      g.strokeStyle = `rgba(255,${190 + 50 * hash(i)},110,${0.85 * a})`; g.lineWidth = 2;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x - vx * 0.022, y - (vy + 840 * dt) * 0.022); g.stroke();
    }
    g.restore();
  }
  // gotas de sudor que salen volando al correr
  function gotas(g, t) {
    const F = carrera(); if (t > T.gIdea + 0.4) return;
    g.save(); g.fillStyle = "#bfe6ff"; g.strokeStyle = "rgba(20,40,80,0.7)"; g.lineWidth = 1.2;
    for (let i = 0; i < 26; i++) {
      const tb = 0.6 + i * 0.21, u = (t - tb) / 0.42; if (u <= 0 || u >= 1 || tb > T.gIdea) continue;
      const pg = poseG(Math.round(tb * 60) / 60), c = G.aPantalla(pg, G.cabeza(pg).a(P(700 + 200 * hash(i), 300 + 120 * hash(i + 4))));
      const dt = t - tb, x = c.x - (60 + 50 * hash(i * 2.3)) * dt + (t < F.tFin ? vRunG(tb) * dt : 0), y = c.y - 90 * dt + 380 * dt * dt;
      g.globalAlpha = 1 - u * u;
      g.beginPath(); g.moveTo(x, y - 6); g.quadraticCurveTo(x + 4, y, x, y + 3); g.quadraticCurveTo(x - 4, y, x, y - 6); g.fill(); g.stroke();
    }
    g.restore();
  }
  // vaho al jadear (noche fría)
  function vaho(g, t) {
    const F = carrera(), a0 = F.tFin - 0.6, a1 = T.gIdea + 0.2; if (t < a0 || t > a1 + 0.9) return;
    g.save();
    for (let i = 0; i < 12; i++) {
      const tb = a0 + i * 0.36; if (tb > a1) break;
      const u = (t - tb) / 0.85; if (u <= 0 || u >= 1) continue;
      const pg = poseG(Math.round(tb * 60) / 60), b = G.aPantalla(pg, G.boca(pg));
      const r = 4 + 11 * salida(u), x = b.x + 26 + 40 * salida(u), y = b.y + 6 - 16 * u;
      g.globalAlpha = 0.26 * (1 - u) * clamp(u * 6);
      g.fillStyle = "#e8eefc"; g.beginPath(); g.arc(x, y, r, 0, TAU); g.arc(x + r * 0.7, y - r * 0.3, r * 0.7, 0, TAU); g.fill();
    }
    g.restore();
  }
  // la idea: unas chispitas junto a la cabeza
  function chispaIdea(g, t, pg) {
    const k = campana(t, T.gIdea - 0.02, T.gIdea + 0.5); if (k < 0.01) return;
    const c = G.aPantalla(pg, G.cabeza(pg).a(P(980, 120)));
    g.save(); g.globalAlpha = k;
    for (let i = 0; i < 3; i++) { estrella(g, c.x + [0, 22, 10][i], c.y + [0, 14, -22][i], (5 + 3 * i) * k + 2, 4, t * 3 + i, 0.3); g.fillStyle = "#fff4b8"; g.fill(); }
    g.restore();
  }
  // la curva deja dos surcos de luz en el asfalto (las ruedas), que se apagan
  function surco(g, t) {
    const a = T.carve0, b = Math.min(t, T.carve1), k = 1 - tramo(t, T.carve1, T.carve1 + 0.7);
    if (t < a + 0.02 || k <= 0) return;
    g.save(); g.lineCap = "round"; g.lineJoin = "round";
    for (const [dz, al] of [[0, 0.22], [5, 0.12]]) {
      g.beginPath(); let n = 0;
      for (let tt = Math.max(a, t - 0.9); tt <= b; tt += 1 / 60) { const B = tablaS(tt), x = B.cx - EJE, y = B.suelo + 1 + dz; n++ ? g.lineTo(x, y) : g.moveTo(x, y); }
      g.strokeStyle = `rgba(200,210,255,${al * k})`; g.lineWidth = 2; g.stroke();
    }
    g.restore();
  }
  // líneas de velocidad detrás de los patinadores
  function velocidad(g, t, ps) {
    const v = vTabla(t), k = clamp((v - 200) / 400) * (t < 9.6 ? 1 : 0); if (k < 0.02) return;
    const fuerte = tramo(t, T.sale, T.sale + 0.25);
    const x0 = (t >= T.sale ? poseG(t).x - 70 : ps.x - 60);
    g.save(); g.lineCap = "round";
    for (let i = 0; i < 9; i++) {
      const y = 250 + i * 34 + 10 * hash(i * 2.1), L = (50 + 80 * hash(i * 4.4)) * (0.7 + 1.2 * fuerte);
      const fl = ((t * (1.6 + hash(i)) + hash(i * 7.7)) % 1);
      const x = x0 - 40 - fl * 160;
      g.strokeStyle = `rgba(220,230,255,${(0.08 + 0.32 * fuerte) * k * Math.sin(Math.PI * fl)})`; g.lineWidth = 1.6 + 1.6 * fuerte;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x - L, y); g.stroke();
    }
    g.restore();
  }
  // nubecillas de polvo (posiciones del mundo)
  let POLVO_SPR = null;
  function polvoSpr() {
    if (POLVO_SPR) return POLVO_SPR;
    const c = document.createElement("canvas"); c.width = c.height = 128; const g = c.getContext("2d");
    const r = g.createRadialGradient(64, 64, 6, 64, 64, 64); r.addColorStop(0, "rgba(196,184,170,0.85)"); r.addColorStop(0.6, "rgba(170,160,150,0.45)"); r.addColorStop(1, "rgba(150,140,130,0)");
    g.fillStyle = r; g.fillRect(0, 0, 128, 128); POLVO_SPR = c; return c;
  }
  function nube(g, t, t0, x, y, n, tam, dir, vida = 0.9) {
    const u0 = (t - t0) / vida; if (u0 <= 0 || u0 >= 1.25) return;
    const spr = polvoSpr();
    g.save();
    for (let i = 0; i < n; i++) {
      const u = clamp(u0 - 0.04 * hash(i * 3.3)), r = tam * (0.4 + 0.9 * salida(u)) * (0.7 + 0.5 * hash(i * 1.9));
      const px = x + dir * (20 + 90 * hash(i * 7.1)) * salida(u) + (hash(i * 2.7) - 0.5) * tam, py = y - 30 * salida(u) * hash(i * 4.2) - r * 0.3;
      g.globalAlpha = 0.6 * (1 - u) * clamp(u * 8);
      g.drawImage(spr, px - r, py - r, r * 2, r * 2);
    }
    g.restore();
  }
  // golpe fuera de cuadro: estallido en el borde, polvo y hojas que caen
  function golpe(g, t) {
    const cf = camF();
    const k = campana(t, T.choque - 0.02, T.choque + 0.32);
    if (k > 0.01) {
      g.save(); g.globalAlpha = k;
      estrella(g, cf + 1040, 455, 84 * (0.6 + 0.4 * k), 10, 0.3, 0.5); g.fillStyle = "#fff2b0"; g.fill(); g.strokeStyle = TINTA; g.lineWidth = 3; g.stroke();
      g.strokeStyle = "rgba(255,250,230,0.9)"; g.lineWidth = 3; g.lineCap = "round";
      for (let i = 0; i < 6; i++) { const a = 2.2 + i * 0.36, r0 = 104 + 20 * (1 - k); g.beginPath(); g.moveTo(cf + 1040 + Math.cos(a) * r0, 455 + Math.sin(a) * r0); g.lineTo(cf + 1040 + Math.cos(a) * (r0 + 30), 455 + Math.sin(a) * (r0 + 30)); g.stroke(); }
      g.restore();
    }
    nube(g, t, T.choque, cf + 1080, 520, 9, 70, -1, 1.4);
    nube(g, t, T.choque + 0.12, cf + 1060, 440, 6, 55, -1, 1.3);
    // hojas que suben con el golpe y caen balanceándose
    if (t > T.choque) {
      for (let i = 0; i < 9; i++) {
        const tb = T.choque + 0.03 * i, dt = t - tb; if (dt <= 0) continue;
        const vida = 2.2 + 0.8 * hash(i * 5.1); if (dt > vida) continue;
        const x = cf + 1050 - (120 + 260 * hash(i * 2.9)) * salida(clamp(dt / 1.2)) + 18 * Math.sin(dt * 5 + i);
        const y = 470 - 300 * Math.sin(Math.PI * clamp(dt / 0.9) / 2) * (0.6 + 0.4 * hash(i)) + Math.max(0, dt - 0.9) * (70 + 30 * hash(i * 3.7));
        g.save(); g.globalAlpha = clamp((vida - dt) * 2); hoja(g, x, Math.min(y, SUELO_S + 12), 9 + 4 * hash(i), dt * 3 + i, ["#d1842e", "#a0952f", "#b8552c"][i % 3]); g.restore();
      }
    }
  }
  // líneas de giro en las ruedas de la tabla boca arriba
  function giroRuedas(g, t, B) {
    if (!B || !B.quieta) return;
    const k = Math.exp(-(t - B.tl) * 0.35); if (k < 0.08) return;
    g.save(); g.strokeStyle = `rgba(255,255,255,${0.6 * k})`; g.lineWidth = 1.6; g.lineCap = "round";
    for (const xe of [-EJE, EJE]) {
      const c = P(B.x + xe, B.y - 12);
      for (let j = 0; j < 2; j++) { const a0 = t * 9 + j * Math.PI; g.beginPath(); g.arc(c.x, c.y, RUEDA + 5, a0, a0 + 1.1); g.stroke(); }
    }
    g.restore();
  }
  function sombraEl(g, x, y, rx, a = 0.32) { g.fillStyle = `rgba(0,0,8,${a})`; g.beginPath(); g.ellipse(x, y, rx, 6, 0, 0, TAU); g.fill(); }

  /* =====================================================================================
   * DECORADO: capas prerenderizadas con paralaje
   * ===================================================================================== */
  let CAPAS = null, FONDO = null, FONDO_CAM = null, MUNDO = null;
  const lienzo = (w, h) => { const c = document.createElement("canvas"); c.width = w; c.height = h; return [c, c.getContext("2d")]; };
  const repite = (w, x, fn) => { fn(x); fn(x - w); fn(x + w); };
  const Y_ACERA = 344, Y_BORDILLO = 398, Y_ASFALTO = 410;
  function creaCapas() {
    const capas = {};
    /* cielo (quieto) */
    {
      const [c, g] = lienzo(W, H);
      const cg = g.createLinearGradient(0, 0, 0, 360); cg.addColorStop(0, "#060a1c"); cg.addColorStop(0.55, "#111a3c"); cg.addColorStop(1, "#2a2a55");
      g.fillStyle = cg; g.fillRect(0, 0, W, H);
      const hz = g.createLinearGradient(0, 230, 0, 360); hz.addColorStop(0, "rgba(255,150,120,0)"); hz.addColorStop(1, "rgba(255,150,120,0.16)");
      g.fillStyle = hz; g.fillRect(0, 230, W, 130);
      for (let i = 0; i < 90; i++) { const x = hash(i * 3.7) * W, y = hash(i * 9.1) * 250, r = 0.5 + 1.1 * hash(i * 1.3); g.fillStyle = `rgba(255,250,230,${0.3 + 0.6 * hash(i * 6.6)})`; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); }
      // luna menguante con halo
      const lx = 500, ly = 66;
      const halo = g.createRadialGradient(lx, ly, 10, lx, ly, 110); halo.addColorStop(0, "rgba(255,240,200,0.35)"); halo.addColorStop(1, "rgba(255,240,200,0)");
      g.fillStyle = halo; g.fillRect(lx - 120, ly - 120, 240, 240);
      g.fillStyle = "#fff3cf"; g.beginPath(); g.arc(lx, ly, 26, 0, TAU); g.fill();
      g.fillStyle = "#0d1430"; g.beginPath(); g.arc(lx + 12, ly - 7, 23, 0, TAU); g.fill();
      capas.cielo = c;
    }
    /* rascacielos lejanos (×0,1) */
    {
      const w = 1400, [c, g] = lienzo(w, 280), y0 = 280;
      let x = 0, i = 0;
      while (x < w) {
        const bw = 50 + 70 * hash(i * 2.3), bh = 80 + 170 * hash(i * 4.1);
        const xx = x;
        repite(w, xx, xo => {
          g.fillStyle = i % 2 ? "#161c3e" : "#1a2044"; g.fillRect(xo, y0 - bh, bw, bh);
          g.fillStyle = "rgba(255,214,140,0.5)";
          for (let r = 0; r < bh / 14 - 1; r++) for (let k = 0; k < bw / 10 - 1; k++) if (hash(i * 31 + r * 7 + k * 13) > 0.83) g.fillRect(xo + 5 + k * 10, y0 - bh + 8 + r * 14, 3, 5);
          if (hash(i * 5.5) > 0.6) { g.fillStyle = "#ff5a5a"; g.beginPath(); g.arc(xo + bw / 2, y0 - bh - 8, 2.2, 0, TAU); g.fill(); g.fillStyle = "#161c3e"; g.fillRect(xo + bw / 2 - 1, y0 - bh - 8, 2, 8); }
        });
        x += bw + 4 + 14 * hash(i * 8.8); i++;
      }
      capas.lejos = { c, w, y: Y_ACERA - 280 + 2, f: 0.1 };
    }
    /* fachadas (×0,42) */
    {
      const w = 2100, [c, g] = lienzo(w, Y_ACERA + 4), base = Y_ACERA + 4;
      const COL = ["#2b2442", "#2f2a4c", "#24304a", "#3a2c40", "#2a2f3e", "#33283a"];
      let x = 0, i = 0;
      while (x < w - 10) {
        const bw = Math.min(w - x, 150 + 120 * hash(i * 3.3)), top = 60 + 120 * hash(i * 5.9), col = COL[i % COL.length];
        const xx = x, ii = i;
        repite(w, xx, xo => fachada(g, xo, bw, top, base, col, ii));
        x += bw; i++;
      }
      capas.fachadas = { c, w, y: 0, f: 0.42 };
    }
    /* asfalto (×1) */
    {
      const w = 1600, [c, g] = lienzo(w, H - Y_ASFALTO), y0 = Y_ASFALTO;
      const ag = g.createLinearGradient(0, 0, 0, H - y0); ag.addColorStop(0, "#1d1f2b"); ag.addColorStop(0.5, "#252837"); ag.addColorStop(1, "#2b2e3e");
      g.fillStyle = ag; g.fillRect(0, 0, w, H - y0);
      for (let i = 0; i < 900; i++) { const x = hash(i * 1.37) * w, y = hash(i * 2.91) * (H - y0); g.fillStyle = hash(i * 7.3) > 0.5 ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.12)"; g.fillRect(x, y, 1.6, 1.4); }
      // línea del carril bici y discontinua del centro
      g.fillStyle = "rgba(230,230,210,0.5)"; g.fillRect(0, 438 - y0, w, 3);
      for (let k = 0; k < w; k += 200) repite(w, k, xo => { g.fillStyle = "rgba(240,236,214,0.6)"; g.beginPath(); g.moveTo(xo, 486 - y0); g.lineTo(xo + 90, 486 - y0); g.lineTo(xo + 92, 492 - y0); g.lineTo(xo + 2, 492 - y0); g.closePath(); g.fill(); });
      // tapas de alcantarilla y grietas
      for (const k of [330, 1130]) repite(w, k, xo => { g.fillStyle = "#1a1b25"; g.beginPath(); g.ellipse(xo, 566 - y0, 40, 7, 0, 0, TAU); g.fill(); g.strokeStyle = "rgba(150,150,170,0.3)"; g.lineWidth = 1.5; g.stroke();
        g.strokeStyle = "rgba(0,0,0,0.4)"; for (let j = -2; j <= 2; j++) { g.beginPath(); g.moveTo(xo + j * 13, 560 - y0); g.lineTo(xo + j * 13, 572 - y0); g.stroke(); } });
      g.strokeStyle = "rgba(10,10,16,0.5)"; g.lineWidth = 1.2;
      for (const k of [120, 700, 1420]) repite(w, k, xo => { g.beginPath(); g.moveTo(xo, 452 - y0); g.lineTo(xo + 18, 458 - y0); g.lineTo(xo + 30, 456 - y0); g.lineTo(xo + 52, 463 - y0); g.stroke(); });
      capas.asfalto = { c, w, y: y0, f: 1 };
    }
    /* acera con farolas, bicis, papeleras y árboles (×0,82) */
    {
      const w = 1800, [c, g] = lienzo(w, H), f = 0.82;
      // fase: que una farola quede junto a los dos con la cámara quieta
      const off = ((camF() * f) % w + w) % w, fase0 = (((610 + off) % 600) + 600) % 600;
      // acera
      const sg = g.createLinearGradient(0, Y_ACERA, 0, Y_BORDILLO); sg.addColorStop(0, "#2f3045"); sg.addColorStop(1, "#3b3d54");
      g.fillStyle = sg; g.fillRect(0, Y_ACERA, w, Y_BORDILLO - Y_ACERA);
      g.strokeStyle = "rgba(10,10,20,0.35)"; g.lineWidth = 1;
      for (let k = 0; k < w; k += 46) { g.beginPath(); g.moveTo(k, Y_ACERA); g.lineTo(k - 10, Y_BORDILLO); g.stroke(); }
      g.beginPath(); g.moveTo(0, 372); g.lineTo(w, 372); g.stroke();
      // bordillo
      g.fillStyle = "#56586e"; g.fillRect(0, Y_BORDILLO, w, 4); g.fillStyle = "#2a2b3a"; g.fillRect(0, Y_BORDILLO + 4, w, Y_ASFALTO - Y_BORDILLO - 4);
      g.fillStyle = "rgba(0,0,0,0.3)"; for (let k = 0; k < w; k += 92) g.fillRect(k, Y_BORDILLO, 1.5, Y_ASFALTO - Y_BORDILLO);
      // mobiliario
      const objs = [];
      for (let k = 0; k < 3; k++) objs.push(["farola", fase0 + k * 600]);
      for (const [x, tipo] of [[160, "bici"], [235, "bici2"], [430, "arbol"], [980, "papelera"], [1080, "bici"], [1270, "banco"], [1500, "arbol"], [1650, "boca"]]) objs.push([tipo, (fase0 + x) % w]);
      for (const [tipo, x] of objs) if (tipo !== "farola") repite(w, x, xo => mueble(g, tipo, xo));
      for (const [tipo, x] of objs) if (tipo === "farola") repite(w, x, xo => farola(g, xo));
      capas.acera = { c, w, y: 0, f };
    }
    /* bordillo de delante (×1,18) */
    {
      const w = 1400, [c, g] = lienzo(w, 22);
      g.fillStyle = "#1b1c26"; g.fillRect(0, 0, w, 6); g.fillStyle = "#3c3f53"; g.fillRect(0, 6, w, 16);
      g.fillStyle = "rgba(0,0,0,0.3)"; for (let k = 0; k < w; k += 110) g.fillRect(k, 6, 1.5, 16);
      for (let i = 0; i < 10; i++) repite(w, hash(i * 3.3) * w, xo => hoja(g, xo, 9 + 6 * hash(i), 6, hash(i * 2) * 6, ["#7a4a24", "#6b6324"][i % 2]));
      capas.delante = { c, w, y: H - 20, f: 1.18 };
    }
    return capas;
  }
  function fachada(g, x, bw, top, base, col, i) {
    g.fillStyle = col; g.fillRect(x, top, bw, base - top);
    g.fillStyle = "rgba(255,255,255,0.05)"; g.fillRect(x, top, bw, 6); g.fillStyle = "rgba(0,0,0,0.25)"; g.fillRect(x + bw - 4, top, 4, base - top);
    // cornisa y azotea
    g.fillStyle = "rgba(0,0,0,0.35)"; g.fillRect(x - 3, top + 6, bw + 6, 4);
    if (hash(i * 7.7) > 0.5) { g.fillStyle = "#1c1a2a"; g.fillRect(x + bw * 0.6, top - 18, 22, 18); g.fillRect(x + bw * 0.6 + 4, top - 26, 2, 8); }
    // ventanas
    const cols = Math.max(2, Math.floor((bw - 24) / 38)), dx = (bw - 24) / cols, pisoBajo = base - 78;
    for (let r = 0; top + 28 + r * 50 < pisoBajo - 40; r++) for (let k = 0; k < cols; k++) {
      const wx = x + 12 + k * dx + (dx - 20) / 2, wy = top + 28 + r * 50, hsh = hash(i * 97 + r * 13 + k * 7);
      g.fillStyle = "#151427"; g.fillRect(wx - 2, wy - 2, 24, 34);
      if (hsh > 0.52) {
        const lg = g.createLinearGradient(0, wy, 0, wy + 30); lg.addColorStop(0, "#ffe2a0"); lg.addColorStop(1, "#f0a95a");
        g.fillStyle = lg; g.fillRect(wx, wy, 20, 30);
        if (hsh > 0.8) { g.fillStyle = "rgba(120,40,40,0.55)"; g.fillRect(wx, wy, 8, 30); }
        else if (hsh > 0.7) { g.fillStyle = "rgba(30,40,30,0.7)"; g.beginPath(); g.ellipse(wx + 14, wy + 26, 5, 6, 0, 0, TAU); g.fill(); }
      } else if (hsh > 0.45) { g.fillStyle = "rgba(120,180,255,0.55)"; g.fillRect(wx, wy, 20, 30); }
      else { g.fillStyle = "#22223a"; g.fillRect(wx, wy, 20, 30); }
      g.fillStyle = "rgba(0,0,0,0.5)"; g.fillRect(wx + 9, wy, 2, 30);
      if (hash(i * 11 + r * 3 + k) > 0.8) { g.strokeStyle = "rgba(20,18,30,0.9)"; g.lineWidth = 2; g.strokeRect(wx - 4, wy + 26, 28, 8); for (let j = 0; j < 5; j++) { g.beginPath(); g.moveTo(wx - 4 + j * 7, wy + 26); g.lineTo(wx - 4 + j * 7, wy + 34); g.stroke(); } }
    }
    // planta baja: persiana, escaparate o portal (separados por pilastras)
    const tipo = hash(i * 17.3 + 2.1);
    const yb = pisoBajo + 6, hb = base - yb;
    g.fillStyle = "rgba(0,0,0,0.28)"; g.fillRect(x, yb - 4, bw, 4);
    g.fillStyle = "rgba(255,255,255,0.04)"; g.fillRect(x, yb, 8, hb); g.fillRect(x + bw - 8, yb, 8, hb);
    if (tipo < 0.42) {
      g.fillStyle = "#3d4258"; g.fillRect(x + 12, yb + 6, bw - 24, hb - 6);
      g.strokeStyle = "rgba(0,0,0,0.32)"; g.lineWidth = 1; for (let y = yb + 9; y < base; y += 5) { g.beginPath(); g.moveTo(x + 12, y); g.lineTo(x + bw - 12, y); g.stroke(); }
      g.fillStyle = "rgba(0,0,0,0.3)"; g.fillRect(x + 12, yb + 6, bw - 24, 6);
      if (hash(i * 3.9) > 0.5) { g.fillStyle = "rgba(200,90,160,0.3)"; g.beginPath(); g.ellipse(x + bw * 0.4, yb + hb * 0.55, 18, 10, 0.2, 0, TAU); g.fill();
        g.fillStyle = "rgba(90,200,190,0.25)"; g.beginPath(); g.ellipse(x + bw * 0.58, yb + hb * 0.5, 14, 9, -0.3, 0, TAU); g.fill(); }   // pintadas (sin letras)
    } else if (tipo < 0.68) {
      const sx = x + 14, sw = bw - 28;
      const lg = g.createLinearGradient(0, yb, 0, base); lg.addColorStop(0, "#e9c98e"); lg.addColorStop(1, "#c78a52");
      g.fillStyle = lg; g.fillRect(sx, yb + 10, sw, hb - 14);
      g.fillStyle = "rgba(70,40,30,0.55)"; for (let k = 0; k < 2; k++) g.fillRect(sx + 4, yb + 30 + k * 22, sw - 8, 3);
      for (let k = 0; k < 7; k++) { g.fillStyle = ["#9c4a46", "#46679a", "#7d9a4f", "#6e5590"][k % 4]; g.fillRect(sx + 8 + k * (sw - 20) / 7, yb + 18 + (k % 2) * 22, 7, 10); }
      g.fillStyle = "#1c1826"; for (let k = 1; k < 3; k++) g.fillRect(sx + sw * k / 3 - 2, yb + 10, 4, hb - 14);
      g.fillStyle = "#1c1826"; g.fillRect(sx, base - 8, sw, 8);
      if (hash(i * 2.2) > 0.5) for (let k = 0; k < bw - 16; k += 14) { g.fillStyle = (k / 14) % 2 ? "#5a2a36" : "#9c8c7c"; g.fillRect(x + 8 + k, yb - 2, 14, 10); }
    } else {
      g.fillStyle = "rgba(0,0,0,0.18)"; g.fillRect(x + 8, yb, bw - 16, hb);
      g.fillStyle = "#1e1a28"; g.fillRect(x + bw / 2 - 18, yb + 10, 36, hb - 10);
      g.fillStyle = "rgba(255,255,255,0.06)"; g.fillRect(x + bw / 2 - 14, yb + 14, 12, hb - 18); g.fillRect(x + bw / 2 + 2, yb + 14, 12, hb - 18);
      g.fillStyle = "#ffd98f"; g.beginPath(); g.arc(x + bw / 2 + 28, yb + 18, 4, 0, TAU); g.fill();
      const r = g.createRadialGradient(x + bw / 2 + 28, yb + 18, 2, x + bw / 2 + 28, yb + 18, 40); r.addColorStop(0, "rgba(255,210,140,0.35)"); r.addColorStop(1, "rgba(255,210,140,0)");
      g.fillStyle = r; g.fillRect(x + bw / 2 - 20, yb - 22, 92, 80);
    }
  }
  function farola(g, x) {
    const yb = Y_BORDILLO - 6, yl = 66, lx = x + 46;
    // cono de luz (hasta el asfalto) y charco de luz en el suelo
    const cg = g.createLinearGradient(0, yl, 0, 600); cg.addColorStop(0, "rgba(255,196,110,0.26)"); cg.addColorStop(1, "rgba(255,196,110,0.04)");
    g.fillStyle = cg; g.beginPath(); g.moveTo(lx - 12, yl + 6); g.lineTo(lx + 12, yl + 6); g.lineTo(lx + 175, 600); g.lineTo(lx - 175, 600); g.closePath(); g.fill();
    const pg = g.createRadialGradient(lx, 520, 10, lx, 520, 190); pg.addColorStop(0, "rgba(255,190,110,0.2)"); pg.addColorStop(1, "rgba(255,190,110,0)");
    g.save(); g.translate(lx, 520); g.scale(1, 0.32); g.translate(-lx, -520); g.fillStyle = pg; g.beginPath(); g.arc(lx, 520, 190, 0, TAU); g.fill(); g.restore();
    const pa = g.createRadialGradient(lx, 380, 6, lx, 380, 120); pa.addColorStop(0, "rgba(255,190,110,0.22)"); pa.addColorStop(1, "rgba(255,190,110,0)");
    g.save(); g.translate(lx, 380); g.scale(1, 0.3); g.translate(-lx, -380); g.fillStyle = pa; g.beginPath(); g.arc(lx, 380, 120, 0, TAU); g.fill(); g.restore();
    // poste y brazo
    g.fillStyle = "#14151e"; g.fillRect(x - 4, yl + 4, 8, yb - yl - 4); g.fillRect(x - 8, yb - 14, 16, 14);
    g.strokeStyle = "#14151e"; g.lineWidth = 6; g.beginPath(); g.moveTo(x, yl + 30); g.quadraticCurveTo(x, yl, lx - 8, yl + 2); g.stroke();
    g.fillStyle = "#1c1d28"; g.beginPath(); g.moveTo(lx - 20, yl + 6); g.lineTo(lx + 20, yl + 6); g.lineTo(lx + 12, yl - 4); g.lineTo(lx - 12, yl - 4); g.closePath(); g.fill();
    // bombilla y halo
    const h = g.createRadialGradient(lx, yl + 8, 2, lx, yl + 8, 60); h.addColorStop(0, "rgba(255,230,170,0.9)"); h.addColorStop(0.2, "rgba(255,200,120,0.45)"); h.addColorStop(1, "rgba(255,190,110,0)");
    g.fillStyle = h; g.fillRect(lx - 60, yl - 52, 120, 120);
    g.fillStyle = "#fff4d6"; g.beginPath(); g.ellipse(lx, yl + 8, 12, 4, 0, 0, TAU); g.fill();
  }
  function mueble(g, tipo, x) {
    const yb = Y_BORDILLO - 4;
    g.save(); g.lineCap = "round"; g.lineJoin = "round";
    if (tipo === "bici" || tipo === "bici2") {
      const col = tipo === "bici" ? "#3d7a8c" : "#8c3d5a", r = 21, x1 = x - 30, x2 = x + 30, y = yb - r;
      // aparcabicis
      g.strokeStyle = "#5d6175"; g.lineWidth = 4; g.beginPath(); g.moveTo(x - 20, yb); g.lineTo(x - 20, yb - 34); g.quadraticCurveTo(x - 20, yb - 44, x - 8, yb - 44); g.lineTo(x + 8, yb - 44); g.quadraticCurveTo(x + 20, yb - 44, x + 20, yb - 34); g.lineTo(x + 20, yb); g.stroke();
      g.strokeStyle = "#101118"; g.lineWidth = 3.4;
      for (const xx of [x1, x2]) { g.beginPath(); g.arc(xx, y, r, 0, TAU); g.stroke(); }
      g.strokeStyle = "rgba(120,120,140,0.5)"; g.lineWidth = 0.8; for (const xx of [x1, x2]) for (let k = 0; k < 6; k++) { const a = k * Math.PI / 6; g.beginPath(); g.moveTo(xx - Math.cos(a) * r, y - Math.sin(a) * r); g.lineTo(xx + Math.cos(a) * r, y + Math.sin(a) * r); g.stroke(); }
      g.strokeStyle = col; g.lineWidth = 3.4;
      g.beginPath(); g.moveTo(x1, y); g.lineTo(x - 4, y); g.lineTo(x + 18, y - 26); g.lineTo(x - 10, y - 26); g.closePath(); g.moveTo(x - 4, y); g.lineTo(x - 12, y - 32); g.moveTo(x + 18, y - 26); g.lineTo(x2, y); g.moveTo(x + 18, y - 26); g.lineTo(x + 20, y - 36); g.stroke();
      g.strokeStyle = "#101118"; g.lineWidth = 3; g.beginPath(); g.moveTo(x + 14, y - 38); g.lineTo(x + 26, y - 36); g.stroke();
      g.fillStyle = "#101118"; g.beginPath(); g.ellipse(x - 12, y - 34, 8, 3, 0, 0, TAU); g.fill();
    } else if (tipo === "arbol") {
      g.fillStyle = "#1a1612"; g.fillRect(x - 22, yb - 2, 44, 4);
      g.strokeStyle = "#2a1f18"; g.lineWidth = 7; g.beginPath(); g.moveTo(x, yb); g.lineTo(x, yb - 120); g.moveTo(x, yb - 90); g.lineTo(x - 20, yb - 120); g.stroke();
      for (const [dx, dy, r, c] of [[-30, -150, 40, "#16302a"], [24, -160, 44, "#1a3830"], [-4, -190, 46, "#1d3e34"], [10, -132, 34, "#173229"]]) { g.fillStyle = c; g.beginPath(); g.arc(x + dx, yb + dy, r, 0, TAU); g.fill(); }
    } else if (tipo === "papelera") {
      g.fillStyle = "#2f4a3a"; g.beginPath(); g.moveTo(x - 18, yb - 52); g.lineTo(x + 18, yb - 52); g.lineTo(x + 15, yb); g.lineTo(x - 15, yb); g.closePath(); g.fill();
      g.strokeStyle = "rgba(0,0,0,0.35)"; g.lineWidth = 1.4; for (let k = -10; k <= 10; k += 5) { g.beginPath(); g.moveTo(x + k, yb - 48); g.lineTo(x + k * 0.85, yb - 4); g.stroke(); }
      g.fillStyle = "#24382c"; g.fillRect(x - 20, yb - 56, 40, 6);
    } else if (tipo === "banco") {
      g.fillStyle = "#4a3426"; for (let k = 0; k < 3; k++) g.fillRect(x - 46, yb - 40 + k * 7 - (k === 2 ? 0 : 14), 92, 5);
      g.fillStyle = "#16171f"; g.fillRect(x - 40, yb - 22, 5, 22); g.fillRect(x + 35, yb - 22, 5, 22);
    } else if (tipo === "boca") {
      g.fillStyle = "#a33a32"; g.beginPath(); g.roundRect ? g.roundRect(x - 8, yb - 34, 16, 34, 4) : g.rect(x - 8, yb - 34, 16, 34); g.fill();
      g.beginPath(); g.arc(x, yb - 34, 9, Math.PI, TAU); g.fill(); g.fillRect(x - 14, yb - 24, 28, 7);
      g.fillStyle = "rgba(255,255,255,0.18)"; g.fillRect(x - 5, yb - 32, 3, 28);
    }
    g.restore();
  }
  function dibCapa(g, L, cam) {
    const off = ((cam * L.f) % L.w + L.w) % L.w;
    g.drawImage(L.c, -off, L.y); if (L.w - off < W) g.drawImage(L.c, L.w - off, L.y);
  }
  function fondo(g, cam) {
    if (!CAPAS) CAPAS = creaCapas();
    if (!FONDO) FONDO = lienzo(W, H);
    if (FONDO_CAM !== cam) {
      const f = FONDO[1];
      f.drawImage(CAPAS.cielo, 0, 0);
      dibCapa(f, CAPAS.lejos, cam); dibCapa(f, CAPAS.fachadas, cam); dibCapa(f, CAPAS.asfalto, cam); dibCapa(f, CAPAS.acera, cam); dibCapa(f, CAPAS.delante, cam);
      FONDO_CAM = cam;
    }
    g.drawImage(FONDO[0], 0, 0);
  }
  // temblor del golpe (sube y baja suave)
  function temblor(t) {
    const k = tramo(t, T.choque - 0.02, T.choque + 0.08) * (1 - tramo(t, T.choque + 0.2, T.choque + 0.75));
    if (k < 0.001) return null;
    const a = 7 * k;
    return { x: ruido(t * 26) * a, y: ruido(t * 26 + 17) * a * 0.7, z: (a + 2) / 500 };
  }

  class GuillermoSaraSkate extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !S.listo()) return;
      const luz = tramo(t, NEGRO_INICIO, 0.8) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02));
      const cam = camX(t), sh = temblor(t);
      const pg = poseG(t), ps = poseS(t);
      g.save();
      if (sh) { g.translate(512, 300); g.scale(1 + sh.z, 1 + sh.z); g.translate(-512 + sh.x, -300 + sh.y); }
      fondo(g, cam);
      g.save(); g.translate(-cam, 0); MUNDO = g.getTransform();
      const vis = p => p.x - cam > -260 && p.x - cam < W + 260;
      const enTabla = t < 9.6, B = enTabla ? tablaS(t) : null;
      if (t > T.vuelve - 1) bache(g);
      // sombras
      if (B) sombraEl(g, B.x, B.suelo + 1, TL * 0.5, 0.35);
      if (vis(pg)) sombraEl(g, pg.x, pg.suelo + 2, 46, t < T.gSalta || t > 9.6 ? 0.3 : 0.12);
      if (!enTabla && vis(ps)) sombraEl(g, ps.x, ps.suelo + 2, 40, 0.3);
      surco(g, t);
      velocidad(g, t, ps);
      chispas(g, t);
      const delanteG = t > T.gSalta + 0.06 && t < 9.6;          // en la tabla, Guillermo por encima (sus manos en el hombro de ella)
      if (!delanteG && vis(pg)) G.dibujar(g, pg, t);
      if (B) dibTabla(g, B);
      if (vis(ps)) dibujaSara(g, ps, t);
      if (delanteG && vis(pg)) G.dibujar(g, pg, t);
      chispaIdea(g, t, pg);
      gotas(g, t);
      vaho(g, t);
      if (t > T.sale - 0.05 && t < T.sale + 0.6) nube(g, t, T.sale - 0.02, pg.x - 30, SUELO_S + 4, 5, 22, -1, 0.6);
      // tras el golpe
      const BV = tablaSuelta(t);
      if (BV) { sombraEl(g, BV.x, SUELO_V + 2, TL * 0.45, 0.3); dibTabla(g, BV); giroRuedas(g, t, BV); }
      tapa(g, t);
      if (t > T.vuelve) { const V = vueltaTabla(); nube(g, t, V.tHit + V.vuelo, V.xHit - V.vHit * 0.75 * V.vuelo, SUELO_V + 4, 5, 22, -1, 0.7); }
      gato(g, t);
      golpe(g, t);
      maullido(g, t);
      g.restore();
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00127", nombre: "Guillermo y Sara · El monopatín de noche", crear: () => new GuillermoSaraSkate() });
  window.__A2D_00127 = { pose, T, DUR, tablaS, xB, camX, carrera, frenoG, vueltaTabla, hombroSara };
})();
