"use strict";
/* 00067 · Guillermo y Deivi · La guerra de almohadas
 *
 * Negro → salón de noche, ambiente de fiesta de pijamas: papel pintado mostaza, ventana con luna y
 * cortinas granates, lámpara de pie encendida, guirnalda de bombillitas, sofá de terciopelo con
 * cojines y una manta, cuadro, mesita con un bol de palomitas, montón de cojines y un saco de dormir
 * en el suelo de tarima, y una alfombra granate. Guillermo (almohada azul de lunares) y Deivi
 * (almohada verde menta de rayas, al hombro y con la otra mano en el bolsillo) se miden dando
 * saltitos; Deivi le reta con la barbilla → da un paso y le atiza en la cabeza: ¡puf! (se escapan
 * cuatro plumas) → Guillermo sacude la cabeza, se enfada y prepara un golpe enorme: almohada en alto
 * por detrás, rodilla arriba, tiembla… → la suelta con todas sus fuerzas; Deivi se agacha sin sacar la
 * mano del bolsillo y la almohada pasa silbando por encima → la inercia le hace girar sobre sí mismo
 * (giro 2D aplastado, con estelas) y, al frenar, la almohada sigue de largo, da la vuelta y le cae
 * encima de la cabeza: ¡zas! → revienta: explosión de plumas que flotan despacio, balanceándose, y le
 * dejan cubierto como a una gallina (cresta de plumas en el pelo y plumas en los hombros, hasta el
 * final); en la mano le queda la funda rota y vacía. Deivi lanza su almohada al sofá, le señala y se
 * parte de risa; Guillermo mira a cámara muy serio y cabecea como una gallina → una última pluma baja
 * haciendo eses y se le posa en la nariz: bizquea, le pica… ah… ah… ¡achís!: estornuda una nube de
 * plumas que va directa a la cara de Deivi, que se había acercado a mirar → Deivi, emplumado, hincha
 * los mofletes y sopla la pluma del labio; Guillermo se limpia la nariz con la muñeca, sonríe a cámara
 * y guiña → negro.
 *
 * Sin textos. Todo depende del tiempo absoluto `t`.
 */
(() => {
  const { clamp, lerp, fase, suave, suave5, salida, entrada, tramo, campana, mezcla, ruido, hash } = M2;
  const G = Guillermo, D = Deivi;
  const S = 0.29, SUELO = 560, DUR = 14.0, TAU = Math.PI * 2;
  const PARED = 470;                                  // línea pared / suelo

  const T = {
    llama0: 0.95, llama1: 1.6,
    avanza0: 1.62, avanza1: 1.98, golpe: 2.16, atras0: 2.45, atras1: 2.95,
    sacude0: 2.62, sacude1: 3.1, enfado0: 3.0,
    prep0: 3.3, prep1: 3.85, swing0: 4.4, pasa: 4.55, swing1: 4.66,
    miedo0: 3.75, agacha0: 4.3, agacha1: 4.42, sube0: 5.3, sube1: 5.6,
    giro0: 4.64, giro1: 5.24,
    latigo0: 5.24, zas: 5.42, revienta: 5.76,
    baja0: 6.3, baja1: 6.95,
    rie0: 6.25, suelta: 6.4, dobla0: 7.35, rie1: 8.75,
    camara0: 6.95, gallina0: 7.45, gallina1: 8.0,
    pluma0: 7.25, bizco0: 8.55, nariz: 8.95,
    ah1: 9.15, ah2: 9.58, ah3: 9.98, achis: 10.42,
    curioso0: 9.1, curioso1: 9.85, impacta: 10.6,
    frota0: 10.9, frota1: 11.55, sopla0: 11.15, sopla1: 11.72,
    orgullo0: 11.7, guino: 12.55, deadpan0: 12.0,
    fin: 13.15
  };

  /* ---------- utilidades ---------- */
  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n], k); return o; };
  const guion = (lista, dic, base, t) => {
    let c = dic[base];
    for (const [t0, t1, nom, f] of lista) { if (t <= t0) break; c = mezclaE(c, dic[nom], (f || suave)(fase(t, t0, t1))); }
    return Object.assign({}, c);
  };
  const recorrido = (lista, t) => {
    if (t <= lista[0][0]) return lista[0][1];
    for (let i = 1; i < lista.length; i++) if (t < lista[i][0]) return lerp(lista[i - 1][1], lista[i][1], suave(fase(t, lista[i - 1][0], lista[i][0])));
    return lista[lista.length - 1][1];
  };
  // curva por claves [t, valor] con tramos suaves (para ángulos)
  const claves = (K, t, f = suave) => {
    if (t <= K[0][0]) return K[0][1];
    for (let i = 1; i < K.length; i++) if (t < K[i][0]) return lerp(K[i - 1][1], K[i][1], f(fase(t, K[i - 1][0], K[i][0])));
    return K[K.length - 1][1];
  };
  // pie: lista de pasos [t0, t1, x, alza]
  function pie(lista, t) {
    let i = 0; while (i + 1 < lista.length && t >= lista[i + 1][0]) i++;
    const [t0, t1, x, alza = 24] = lista[i], xa = i > 0 ? lista[i - 1][2] : x, u = fase(t, t0, t1);
    return { x: lerp(xa, x, suave5(u)), alza: alza * Math.sin(Math.PI * u), u };
  }
  const parpadeo = (t, lista) => { let o = 0; for (const tb of lista) { const k = fase(t, tb, tb + 0.15); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); } return o; };
  const rot = (q, a) => ({ x: q.x * Math.cos(a) - q.y * Math.sin(a), y: q.x * Math.sin(a) + q.y * Math.cos(a) });
  const dedosTodos = k => ({ pulgar: k, indice: k, medio: k, anular: k, menique: k });
  const AGARRA = dedosTodos(0.3);
  const SENALA = { pulgar: 0.35, indice: 1, medio: 0, anular: 0, menique: 0 };
  const muHacia = (m, h, extra = 0) => Math.atan2(h.y - m.y, h.x - m.x) + extra;
  const angPant = (p, a) => p.espejo ? Math.PI - a : a;
  const amort = (t, t0, f, d) => t >= t0 ? Math.exp(-(t - t0) * d) * Math.sin((t - t0) * f) : 0;

  /* ---------- caras ---------- */
  const BASE = { mx: 0.85, my: 0, c: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, orig: 0, abre: 0, ancho: 1, sonr: 0.12, dientes: 1, lengua: 0, esp: 0, mof: 0, wd: 0 };
  const E = o => Object.assign({}, BASE, o);
  function cara(e, parp) {
    return { mirada: { x: e.mx, y: e.my }, iris: e.iris, espiral: e.esp,
      ojos: { d: Math.max(e.c, parp, e.wd), i: Math.max(e.c, parp), feliz: e.h, apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: e.orig, abre: e.abre, ancho: e.ancho, sonrisa: e.sonr, dientes: e.dientes > 0.5, lengua: e.lengua },
      mofletes: e.mof, rubor: 0, bigote: 0 };
  }

  /* =====================================================================================
   * PLUMAS: unos pocos dibujos hechos una vez (lienzos pequeños) que se pintan girados y escalados.
   * ===================================================================================== */
  let SPR = null;
  const PL_L = 124;                                   // largo del dibujo (px del lienzo)
  function creaPlumas() {
    const out = [];
    for (let v = 0; v < 4; v++) {
      const c = document.createElement("canvas"); c.width = 136; c.height = 56; const g = c.getContext("2d");
      g.translate(6, 28); g.lineJoin = "round"; g.lineCap = "round";
      const L = 118, w = [19, 16, 21, 15][v], cb = [0.1, -0.12, 0.16, 0.05][v];
      const Y = x => cb * ((x - L / 2) * (x - L / 2) / (L / 2) - L / 2) * 0.5;
      const sup = [], inf = [];
      for (let i = 0; i <= 26; i++) {
        const x = 14 + (L - 14) * i / 26, u = i / 26;
        const pr = Math.pow(Math.sin(Math.PI * Math.min(1, u * 0.9 + 0.06)), 0.55) * (1 - 0.18 * u * u);
        const mella = (k, c0) => 1 - 0.28 * Math.exp(-Math.pow((u - c0) / 0.035, 2)) * k;          // barbas separadas
        sup.push({ x, y: Y(x) - w * pr * mella(1, [0.42, 0.55, 0.38, 0.5][v]) });
        inf.push({ x, y: Y(x) + w * 0.9 * pr * mella(1, [0.68, 0.3, 0.72, 0.62][v]) });
      }
      const vane = () => { g.beginPath(); M2.curva(g, sup.concat(inf.slice().reverse()), true, 0.45); };
      // plumón esponjoso en la base
      for (let k = 0; k < 7; k++) {
        const x0 = 8 + k * 3.2, s = k % 2 ? 1 : -1, l = 12 + (k % 3) * 4;
        g.strokeStyle = "#9d93a8"; g.lineWidth = 4.6; g.beginPath(); g.moveTo(x0 + 6, Y(x0)); g.quadraticCurveTo(x0 - 2, Y(x0) + s * l * 0.6, x0 - 8, Y(x0) + s * l); g.stroke();
        g.strokeStyle = "#ffffff"; g.lineWidth = 2.6; g.stroke();
      }
      vane(); g.fillStyle = "#fffefa"; g.fill();
      g.save(); vane(); g.clip();
      g.fillStyle = "#e8e1f0"; g.beginPath(); g.moveTo(0, Y(0) + 1); for (let x = 0; x <= L; x += 6) g.lineTo(x, Y(x) + 1); g.lineTo(L, 40); g.lineTo(0, 40); g.closePath(); g.fill();
      // barbas: líneas finas en diagonal hacia la punta
      g.strokeStyle = "rgba(140,128,160,0.4)"; g.lineWidth = 1.5;
      for (let x = 22; x < L - 6; x += 7) { g.beginPath(); g.moveTo(x, Y(x)); g.lineTo(x + 9, Y(x + 9) - w); g.moveTo(x, Y(x)); g.lineTo(x + 9, Y(x + 9) + w); g.stroke(); }
      g.fillStyle = "rgba(255,255,255,0.75)"; g.beginPath(); g.ellipse(L * 0.5, Y(L * 0.5) - w * 0.5, L * 0.28, w * 0.22, 0, 0, TAU); g.fill();
      g.restore();
      vane(); g.strokeStyle = "#6c6178"; g.lineWidth = 4; g.stroke();
      // raquis y cálamo
      g.strokeStyle = "#bdb2c6"; g.lineWidth = 3; g.beginPath(); g.moveTo(4, Y(4)); for (let x = 4; x <= L - 8; x += 6) g.lineTo(x, Y(x)); g.stroke();
      g.strokeStyle = "#6c6178"; g.lineWidth = 6; g.beginPath(); g.moveTo(-3, Y(-3)); g.lineTo(13, Y(13)); g.stroke();
      g.strokeStyle = "#f3ead8"; g.lineWidth = 3; g.beginPath(); g.moveTo(-2, Y(-2)); g.lineTo(13, Y(13)); g.stroke();
      out.push(c);
    }
    return out;
  }
  // pluma centrada en (x, y), apuntando hacia r, de largo `largo` (px en el sistema actual)
  function pluma(g, x, y, r, largo, v, alfa = 1, aplana = 1) {
    if (!SPR) SPR = creaPlumas();
    const k = largo / PL_L;
    g.save(); g.translate(x, y); g.rotate(r); g.scale(k, k * aplana);
    if (alfa < 1) g.globalAlpha *= alfa;
    g.drawImage(SPR[v & 3], -68, -28);
    g.restore();
  }

  /* ---------- física de una pluma suelta (cerrada en t) ---------- */
  // f: { t0, x0, y0, vx, vy, k, vt, A, w, ph, giro, r0, rA, suelo, largo, v, capa }
  function libre(f, tau) {
    const e = (1 - Math.exp(-f.k * tau)) / f.k, sw = 1 - Math.exp(-tau * 2.2);
    const s = Math.sin(f.w * tau + f.ph);
    return {
      x: f.x0 + f.vx * e + f.A * s * sw,
      y: f.y0 + f.vy * e + f.vt * Math.max(0, tau - e) + f.A * 0.22 * Math.cos(2 * (f.w * tau + f.ph)) * sw,
      r: f.r0 + f.giro * f.k * e / 2.2 + f.rA * Math.cos(f.w * tau + f.ph) * sw
    };
  }
  function preparaPluma(f) {
    // instante en que toca el suelo (o nunca, si sale del cuadro)
    f.tL = 1e9;
    for (let tau = 0.05; tau < 30; tau += 0.01) {
      const q = libre(f, tau), q2 = libre(f, tau + 0.01);
      if (q.y >= f.suelo && q2.y >= q.y) { f.tL = tau; f.xL = q.x; f.rA0 = q.r; break; }
    }
    if (f.tL < 1e9) {
      const base = ((f.rA0 % TAU) + TAU) % TAU, cand = [0, Math.PI, TAU];
      let mejor = 0; for (const c of cand) if (Math.abs(c - base) < Math.abs(mejor - base)) mejor = c;
      f.rL = f.rA0 + (mejor - base) + (hash(f.sem + 9) - 0.5) * 0.5;
    }
    return f;
  }
  function posPluma(f, t) {
    const tau = t - f.t0; if (tau < 0) return null;
    if (tau < f.tL) return libre(f, tau);
    const k = suave(fase(tau, f.tL, f.tL + 0.3));
    return { x: f.xL, y: f.suelo - 2 * campana(tau, f.tL, f.tL + 0.3), r: lerp(f.rA0, f.rL, k), posada: k };
  }
  function nuevaPluma(sem, t0, x0, y0, ang, abre, v0, v1, o = {}) {
    const h = n => hash(sem * 17.13 + n * 3.71);
    const phi = ang + (h(1) - 0.5) * abre, v = lerp(v0, v1, Math.pow(h(2), 0.8));
    const capa = o.capa || (h(13) < 0.5 ? "atras" : "delante");
    return preparaPluma({
      sem, t0: t0 + (o.retraso || 0) * h(14), x0, y0, vx: Math.cos(phi) * v, vy: Math.sin(phi) * v,
      k: lerp(o.k0 || 3.8, o.k1 || 6.5, h(3)), vt: lerp(o.vt0 || 48, o.vt1 || 92, h(4)),
      A: lerp(8, 26, h(5)), w: lerp(2.1, 3.7, h(6)), ph: h(7) * TAU, giro: (h(8) - 0.5) * 9, r0: h(9) * TAU,
      rA: lerp(0.35, 0.85, h(10)), largo: lerp(o.l0 || 15, o.l1 || 24, h(11)), v: Math.floor(h(12) * 4), capa,
      suelo: capa === "atras" ? SUELO - 50 + h(15) * 40 : SUELO + 4 + h(15) * 32
    });
  }

  /* =====================================================================================
   * ALMOHADAS: se agarran por un extremo (el de la mano). Lomo curvo, laterales abombados, esquinas
   * con «orejas», ribete y pliegues donde la aprieta el puño. Todo en coordenadas de pantalla.
   * ===================================================================================== */
  const AL = 128, AW = 80;
  const PAL_G = { base: "#7cc3ef", sombra: "#4f93c9", luz: "#c9ecff", motivo: "#2f6fb0", ribete: "#f7f1e1", tipo: "lunares" };
  const PAL_D = { base: "#8fe0c1", sombra: "#57b394", luz: "#d8fbee", motivo: "#ffffff", ribete: "#ff8f7a", tipo: "rayas" };
  function lomo(st, n = 16) {
    const L = AL * (st.sl ?? 1), pts = []; let x = st.x, y = st.y;
    const ang = s => st.a + (st.curva || 0) * s + (st.curva2 || 0) * s * s;
    for (let i = 0; i <= n; i++) {
      const s = i / n; pts.push({ x, y, a: ang(s) });
      if (i < n) { const am = ang(s + 0.5 / n); x += Math.cos(am) * L / n; y += Math.sin(am) * L / n; }
    }
    return pts;
  }
  const perfil = (s, st) => {
    const junta = st.junta ?? 0.22;
    return (junta + (1 - junta) * suave(Math.min(1, s / 0.3))) * (1 + 0.08 * Math.sin(Math.PI * s));
  };
  function marco(st) {
    const P = lomo(st), n = P.length - 1, hw = AW / 2 * (st.sw ?? 1);
    const M = (s, v) => {
      const f = clamp(s) * n, i = Math.min(n - 1, Math.floor(f)), k = f - i;
      const a = lerp(P[i].a, P[i + 1].a, k), x = lerp(P[i].x, P[i + 1].x, k), y = lerp(P[i].y, P[i + 1].y, k);
      const h = hw * perfil(clamp(s), st);
      return { x: x - Math.sin(a) * v * h, y: y + Math.cos(a) * v * h, a };
    };
    return { P, M, hw };
  }
  function contorno(g, F, st, dientes = 0) {
    const { M, hw } = F, pts = [], N = 22;
    for (let i = 0; i <= N; i++) pts.push(M(i / N * 0.97, -1));
    // extremo lejano: esquinas con oreja y borde abombado (o roto)
    const e1 = M(1, -1.06), e2 = M(1, 1.06), c = M(1, 0), a = c.a;
    const ox = Math.cos(a), oy = Math.sin(a);
    pts.push({ x: e1.x + ox * 5, y: e1.y + oy * 5 });
    if (dientes) {
      for (let k = 1; k < 9; k++) { const v = -1 + 2 * k / 9, q = M(0.99, v), d = (k % 2 ? 10 : -3) * dientes + 2;
        pts.push({ x: q.x + ox * d, y: q.y + oy * d }); }
    } else {
      for (let k = 1; k < 6; k++) { const v = -1 + 2 * k / 6, q = M(1, v), b = hw * 0.16 * Math.sin(Math.PI * k / 6);
        pts.push({ x: q.x + ox * b, y: q.y + oy * b }); }
    }
    pts.push({ x: e2.x + ox * 5, y: e2.y + oy * 5 });
    for (let i = N; i >= 0; i--) pts.push(M(i / N * 0.97, 1));
    g.beginPath(); M2.curva(g, pts, true, 0.35);
  }
  function dibAlmohada(g, st) {
    const F = marco(st), pal = st.pal, { M } = F;
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    if (st.alfa !== undefined) g.globalAlpha *= st.alfa;
    contorno(g, F, st); g.fillStyle = pal.base; g.fill();
    g.save(); contorno(g, F, st); g.clip();
    // motivo
    if (pal.tipo === "lunares") {
      g.fillStyle = pal.motivo;
      for (let i = 0; i < 6; i++) for (let j = -2; j <= 2; j++) {
        const s = 0.18 + i * 0.15 + (j & 1) * 0.075, v = j * 0.42; if (s > 1.02) continue;
        const q = M(s, v), r = 5.2 * (st.sw ?? 1);
        g.beginPath(); g.ellipse(q.x, q.y, r * (st.sl ?? 1), r, q.a, 0, TAU); g.fill();
      }
    } else {
      g.fillStyle = pal.motivo; g.globalAlpha *= 0.85;
      for (let i = 0; i < 6; i++) {
        const s0 = 0.16 + i * 0.15, s1 = s0 + 0.06, pts = [];
        for (let k = 0; k <= 4; k++) pts.push(M(s0 + (s1 - s0) * k / 4, -1.4));
        for (let k = 4; k >= 0; k--) pts.push(M(s0 + (s1 - s0) * k / 4, 1.4));
        g.beginPath(); pts.forEach((q, i2) => i2 ? g.lineTo(q.x, q.y) : g.moveTo(q.x, q.y)); g.closePath(); g.fill();
      }
      g.globalAlpha /= 0.85;
    }
    // volumen: sombra en un lado, luz en el otro, y el extremo agarrado más oscuro
    const banda = (v0, v1, col) => { const pts = []; for (let k = 0; k <= 12; k++) pts.push(M(k / 12, v0)); for (let k = 12; k >= 0; k--) pts.push(M(k / 12, v1));
      g.beginPath(); M2.curva(g, pts, true, 0.3); g.fillStyle = col; g.fill(); };
    banda(0.42, 1.4, "rgba(20,30,70,0.2)"); banda(0.7, 1.4, "rgba(20,30,70,0.16)");
    banda(-0.78, -0.42, "rgba(255,255,255,0.32)");
    const m0 = M(0, 0); const rg = g.createRadialGradient(m0.x, m0.y, 2, m0.x, m0.y, AL * 0.35 * (st.sl ?? 1));
    rg.addColorStop(0, "rgba(20,30,60,0.32)"); rg.addColorStop(1, "rgba(20,30,60,0)"); g.fillStyle = rg; g.fillRect(m0.x - 60, m0.y - 60, 120, 120);
    g.restore();
    // ribete (costura del borde)
    g.strokeStyle = pal.ribete; g.lineWidth = 2.6;
    g.beginPath(); for (let k = 0; k <= 12; k++) { const q = M(0.26 + 0.7 * k / 12, -0.84); k ? g.lineTo(q.x, q.y) : g.moveTo(q.x, q.y); }
    for (let k = 0; k <= 6; k++) { const q = M(0.955, -0.84 + 1.68 * k / 6); g.lineTo(q.x, q.y); }
    for (let k = 12; k >= 0; k--) { const q = M(0.26 + 0.7 * k / 12, 0.84); g.lineTo(q.x, q.y); }
    g.stroke();
    // pliegues donde aprieta el puño
    g.strokeStyle = "rgba(10,10,30,0.45)"; g.lineWidth = 1.6;
    for (const v of [-0.55, 0, 0.55]) { g.beginPath(); const a0 = M(0.03, v * 0.6), a1 = M(0.17, v * 1.1), a2 = M(0.3, v * 1.05); g.moveTo(a0.x, a0.y); g.quadraticCurveTo(a1.x, a1.y, a2.x, a2.y); g.stroke(); }
    contorno(g, F, st); g.strokeStyle = "#0b0a0e"; g.lineWidth = 3; g.stroke();
    g.restore();
  }
  // funda rota y vacía: plana, arrugada, con el extremo deshilachado y alguna pluma asomando
  function dibFunda(g, st, t) {
    const F = marco(st), pal = st.pal, { M } = F;
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    contorno(g, F, st, 1); g.fillStyle = pal.base; g.fill();
    g.save(); contorno(g, F, st, 1); g.clip();
    g.fillStyle = pal.motivo;
    for (let i = 0; i < 6; i++) for (let j = -2; j <= 2; j++) {
      const s = 0.18 + i * 0.15 + (j & 1) * 0.075, v = j * 0.42; if (s > 1) continue;
      const q = M(s, v); g.beginPath(); g.ellipse(q.x, q.y, 4.4, 4.4 * (st.sw ?? 1), q.a, 0, TAU); g.fill();
    }
    // arrugas de tela vacía
    g.strokeStyle = "rgba(15,35,80,0.45)"; g.lineWidth = 1.8;
    for (const [s0, v0, s1, v1] of [[0.2, -0.6, 0.55, 0.3], [0.35, 0.7, 0.7, -0.2], [0.55, -0.7, 0.9, 0.1], [0.62, 0.6, 0.92, 0.75]]) {
      const a = M(s0, v0), b = M((s0 + s1) / 2, (v0 + v1) / 2 + 0.25), c = M(s1, v1); g.beginPath(); g.moveTo(a.x, a.y); g.quadraticCurveTo(b.x, b.y, c.x, c.y); g.stroke(); }
    g.fillStyle = "rgba(20,30,70,0.18)"; g.beginPath(); for (let k = 0; k <= 10; k++) { const q = M(k / 10, 0.3); k ? g.lineTo(q.x, q.y) : g.moveTo(q.x, q.y); }
    for (let k = 10; k >= 0; k--) { const q = M(k / 10, 1.3); g.lineTo(q.x, q.y); } g.fill();
    g.restore();
    contorno(g, F, st, 1); g.strokeStyle = "#0b0a0e"; g.lineWidth = 2.6; g.stroke();
    // plumas que asoman por el roto
    for (let k = 0; k < 3; k++) { const q = M(0.99, -0.55 + k * 0.55); pluma(g, q.x + Math.cos(q.a) * 7, q.y + Math.sin(q.a) * 7, q.a + (k - 1) * 0.6 + 0.08 * Math.sin(t * 3 + k), 15, k + 1); }
    g.restore();
  }

  /* =====================================================================================
   * GUILLERMO (izquierda, mira a la derecha)
   * ===================================================================================== */
  const CARAS_G = {
    picaro: E({ mx: 0.9, my: 0, sd: 10, gd: 0.1, si: -2, gi: -0.06, sonr: 0.75, ancho: 0.95, abre: 3 }),
    golpe: E({ mx: 0.2, my: -0.3, c: 1, z: 1, sd: -6, gd: -0.2, si: -6, gi: -0.2, abre: 26, ancho: 1.1, sonr: -0.55 }),
    aturdido: E({ mx: 0.5, my: -0.1, esp: 0.45, c: 0.3, sd: 6, gd: 0.1, si: 2, gi: 0.02, abre: 10, ancho: 0.8, sonr: 0.1 }),
    enfado: E({ mx: 0.92, my: 0.05, sd: -10, gd: -0.3, si: -10, gi: -0.3, abre: 6, ancho: 1.15, sonr: -0.35 }),
    carga: E({ mx: 0.95, my: 0.05, c: 0.35, wd: 0.6, sd: -8, gd: -0.28, si: -2, gi: -0.2, abre: 9, ancho: 0.85, sonr: 0.45, lengua: 1 }),
    grito: E({ mx: 0.95, my: 0.1, sd: -6, gd: -0.25, si: -6, gi: -0.25, abre: 44, ancho: 1.15, sonr: 0.2, lengua: 0.4 }),
    sorpresa: E({ mx: 0.95, my: 0.3, iris: 0.8, sd: 24, gd: 0.15, si: 24, gi: 0.15, abre: 30, ancho: 0.75, sonr: -0.2 }),
    gira: E({ mx: 0, my: 0, iris: 0.75, sd: 26, gd: 0.2, si: 26, gi: 0.2, abre: 34, ancho: 0.7, sonr: -0.3 }),
    arriba: E({ mx: 0.3, my: -0.95, iris: 0.8, sd: 28, gd: 0.2, si: 28, gi: 0.2, abre: 14, ancho: 0.6, sonr: -0.4 }),
    zas: E({ mx: 0, my: 0, c: 1, z: 1, sd: -10, gd: -0.25, si: -10, gi: -0.25, abre: 18, ancho: 1.2, sonr: -0.6 }),
    pasmado: E({ mx: 0.1, my: 0, iris: 0.72, sd: 18, gd: 0.06, si: 18, gi: 0.06, abre: 6, ancho: 0.5, sonr: -0.15 }),
    serio: E({ mx: -0.85, my: -0.05, c: 0.42, sd: -2, gd: -0.06, si: -2, gi: -0.06, abre: 0, ancho: 0.62, sonr: -0.28 }),
    bizco: E({ mx: 0.45, my: 0.95, iris: 0.92, c: 0.15, sd: 16, gd: 0.18, si: 16, gi: 0.18, abre: 4, ancho: 0.55, sonr: -0.1 }),
    ah1: E({ mx: 0.3, my: 0.6, c: 0.45, sd: 22, gd: 0.2, si: 22, gi: 0.2, abre: 14, ancho: 0.62, sonr: -0.1 }),
    ah2: E({ mx: 0.2, my: 0.4, c: 0.65, sd: 28, gd: 0.25, si: 28, gi: 0.25, abre: 24, ancho: 0.7, sonr: -0.1 }),
    ah3: E({ mx: 0.1, my: 0.2, c: 0.82, sd: 32, gd: 0.3, si: 32, gi: 0.3, abre: 34, ancho: 0.8, sonr: -0.05 }),
    achis: E({ mx: 0, my: 0, c: 1, z: 1, sd: -14, gd: -0.3, si: -14, gi: -0.3, abre: 52, ancho: 1.2, sonr: -0.2, lengua: 0.5 }),
    sorbe: E({ mx: 0.9, my: 0.1, c: 0.4, sd: 6, gd: 0.04, si: 6, gi: 0.04, abre: 0, ancho: 0.6, sonr: 0.2 }),
    orgullo: E({ mx: -0.85, my: -0.05, c: 0.2, sd: 12, gd: 0.12, si: 4, gi: 0.02, abre: 8, ancho: 1.05, sonr: 0.95 }),
    guino: E({ mx: -0.85, my: -0.05, h: 1, wd: 1, sd: 6, gd: 0.05, si: 16, gi: 0.12, abre: 10, ancho: 1.05, sonr: 1 })
  };
  const GUION_CARA_G = [
    [T.golpe - 0.02, T.golpe + 0.04, "golpe"], [T.golpe + 0.3, T.golpe + 0.45, "aturdido"], [T.enfado0 - 0.1, T.enfado0 + 0.12, "enfado"],
    [T.prep0 + 0.2, T.prep0 + 0.4, "carga"], [T.swing0 - 0.04, T.swing0 + 0.06, "grito"], [T.swing1, T.swing1 + 0.08, "sorpresa"],
    [T.giro0 + 0.12, T.giro0 + 0.22, "gira"], [T.latigo0 + 0.02, T.latigo0 + 0.12, "arriba"], [T.zas - 0.02, T.zas + 0.04, "zas"],
    [T.revienta + 0.12, T.revienta + 0.3, "pasmado"], [T.camara0, T.camara0 + 0.35, "serio"], [T.bizco0, T.bizco0 + 0.25, "bizco"],
    [T.ah1 - 0.12, T.ah1 + 0.1, "ah1"], [T.ah2 - 0.12, T.ah2 + 0.1, "ah2"], [T.ah3 - 0.12, T.ah3 + 0.1, "ah3"],
    [T.achis - 0.03, T.achis + 0.02, "achis"], [T.achis + 0.35, T.achis + 0.55, "sorbe"], [T.orgullo0, T.orgullo0 + 0.25, "orgullo"],
    [T.guino - 0.06, T.guino + 0.06, "guino"], [T.guino + 0.42, T.guino + 0.55, "orgullo"]
  ];
  // cx, cy: mano cercana respecto a su hombro (hoja); lx, ly: la lejana; cd, ld: dedos
  const P0G = { pel: 14, torso: 0.06, cab: 0.03, cx: -12, cy: 245, cd: 0.3, lx: 62, ly: 72, ld: 0.05 };
  const CG = o => Object.assign({}, P0G, o);
  const CUERPOS_G = {
    guardia: CG({}),
    golpeado: CG({ pel: 30, torso: -0.16, cab: -0.24, cx: -70, cy: 190, lx: 90, ly: -30, ld: 1 }),
    sacude: CG({ pel: 10, torso: 0.03, cab: 0, cx: -12, cy: 245, lx: 55, ly: 80, ld: 0.05 }),
    enfado: CG({ pel: 20, torso: 0.1, cab: 0.07, cx: -12, cy: 240, lx: 50, ly: 40, ld: 0 }),
    carga: CG({ pel: 46, torso: -0.27, cab: -0.12, cx: -232, cy: -64, cd: 0.3, lx: 235, ly: -40, ld: 1 }),
    golpeo: CG({ pel: 40, torso: 0.33, cab: 0.12, cx: 330, cy: -40, lx: -60, ly: 230, ld: 0.6 }),
    gira: CG({ pel: 10, torso: 0.02, cab: -0.02, cx: 318, cy: -50, lx: 210, ly: 50, ld: 0.9 }),
    zas: CG({ pel: 40, torso: 0.04, cab: 0.1, cx: 318, cy: -6, lx: 120, ly: -20, ld: 1 }),
    pasmado: CG({ pel: 6, torso: 0.0, cab: 0.0, cx: 318, cy: -6, lx: 10, ly: 225, ld: 0.85 }),
    baja: CG({ pel: 6, torso: 0.0, cab: 0.0, cx: -6, cy: 250, lx: 10, ly: 225, ld: 0.85 }),
    ah: CG({ pel: -4, torso: -0.12, cab: -0.24, cx: -20, cy: 240, lx: 60, ly: 70, ld: 0.9 }),
    achis: CG({ pel: 34, torso: 0.3, cab: 0.3, cx: 40, cy: 230, lx: 130, ly: 120, ld: 1 }),
    erguido: CG({ pel: 6, torso: 0.02, cab: 0.02, cx: -6, cy: 250, lx: 40, ly: 150, ld: 0.6 }),
    orgullo: CG({ pel: 4, torso: -0.04, cab: -0.04, cx: -6, cy: 250, lx: 12, ly: 262, ld: 0.1 })
  };
  const GUION_CUERPO_G = [
    [T.golpe - 0.01, T.golpe + 0.07, "golpeado", salida], [T.golpe + 0.3, T.sacude0 + 0.1, "sacude"], [T.enfado0, T.enfado0 + 0.25, "enfado"],
    [T.prep0, T.prep1, "carga"], [T.swing0, T.pasa - 0.01, "golpeo", entrada], [T.pasa + 0.02, T.giro0 + 0.16, "gira"],
    [T.latigo0, T.zas, "zas"], [T.revienta + 0.05, T.revienta + 0.3, "pasmado"], [T.baja0, T.baja1, "baja"],
    [T.ah1 - 0.25, T.ah1 + 0.1, "ah"], [T.achis - 0.03, T.achis + 0.04, "achis", salida], [T.achis + 0.3, T.achis + 0.7, "erguido"],
    [T.orgullo0, T.orgullo0 + 0.4, "orgullo"]
  ];
  const XG = [[0, 360], [T.golpe + 0.04, 360], [T.golpe + 0.34, 338], [T.prep0, 338], [T.prep1, 322], [T.swing0, 322], [T.pasa, 418], [T.swing1, 424], [T.giro0 + 0.3, 412], [DUR, 412]];
  const PASOS_G = {
    cerca: [[-9, -8, 342], [T.golpe + 0.05, T.golpe + 0.27, 316, 16], [T.prep0 + 0.05, T.prep0 + 0.4, 296, 14], [T.swing1 - 0.1, T.swing1 + 0.08, 370, 20],
            [T.giro0 + 0.04, T.giro0 + 0.2, 398, 22], [T.achis + 0.02, T.achis + 0.16, 406, 14]],
    lejos: [[-9, -8, 381], [T.golpe + 0.14, T.golpe + 0.32, 358, 14], [T.swing0 - 0.08, T.swing0 + 0.12, 494, 34], [T.giro0 + 0.14, T.giro0 + 0.32, 430, 24],
            [T.achis - 0.04, T.achis + 0.1, 448, 16]]
  };
  const TOB_G = { cerca: G.SUELO - G.TOBILLO_ALTO, lejos: G.SUELO - G.TOBILLO_ALTO - 12 };
  const R_M = G.MUNECA_R * G.JK;

  // giro sobre sí mismo (aplastado en x): ángulo de 0 a 2π
  function giroG(t) {
    const u = fase(t, T.giro0, T.giro1); if (u <= 0 || u >= 1) return 0;
    return TAU * (u < 0.5 ? 0.5 * Math.pow(u * 2, 1.6) : 1 - 0.5 * Math.pow((1 - u) * 2, 1.9));
  }

  function poseG(t) {
    const b = guion(GUION_CUERPO_G, CUERPOS_G, "guardia", t);
    const x = recorrido(XG, t), respira = Math.sin(t * 2.3);
    const p = {
      x, suelo: SUELO, s: S, tirasLimpias: true, ikContinuo: true, hombrosContinuos: true, hombrosRecortados: true,
      pelvis: { x: G.PELVIS.x, y: G.PELVIS.y + b.pel + respira * 1.2 },
      torso: b.torso, torsoEsc: { x: 1, y: 1 + respira * 0.004 }, piernas: {},
      cabeza: { ang: b.cab, dx: 0, dy: 0, esc: { x: 1, y: 1 } }
    };
    // saltitos de boxeo al principio
    const bote = tramo(t, 0.5, 0.8) * (1 - tramo(t, T.avanza0, T.golpe));
    p.pelvis.y -= 14 * Math.abs(Math.sin(t * 7.2)) * bote;
    // golpe de Deivi: la cabeza se aplasta y se va hacia atrás
    const gk = t >= T.golpe ? Math.exp(-(t - T.golpe) * 6) : 0;
    p.cabeza.esc.y = 1 - 0.1 * gk * clamp((t - T.golpe) / 0.04); p.cabeza.esc.x = 1 + 0.05 * gk;
    p.cabeza.dy += 10 * gk;
    // sacude la cabeza
    const sac = campana(t, T.sacude0, T.sacude1);
    p.cabeza.ang += 0.16 * Math.sin((t - T.sacude0) * 34) * sac;
    // enfado: tiembla
    const enf = tramo(t, T.enfado0, T.enfado0 + 0.2) * (1 - tramo(t, T.prep0, T.prep0 + 0.2));
    p.pelvis.y += 3 * Math.sin(t * 40) * enf;
    // carga: tiembla de tanto aguantar
    const aguanta = tramo(t, T.prep1 - 0.15, T.prep1 + 0.1) * (1 - fase(t, T.swing0, T.swing0 + 0.02));
    p.torso += 0.012 * Math.sin(t * 47) * aguanta; p.cabeza.ang += 0.015 * Math.sin(t * 39) * aguanta;
    // ¡zas!: la almohada le aplasta la cabeza
    const zk = t >= T.zas ? Math.exp(-(t - T.zas) * 5) * clamp((t - T.zas) / 0.04) : 0;
    p.cabeza.esc.y *= 1 - 0.12 * zk; p.cabeza.esc.x *= 1 + 0.06 * zk; p.cabeza.dy += 12 * zk;
    // gallina: cabeceo adelante-atrás
    const gal = fase(t, T.gallina0, T.gallina1);
    if (gal > 0 && gal < 1) { const s = Math.sin(gal * TAU * 2); p.cabeza.dx += 26 * Math.max(0, s) - 10 * Math.max(0, -s); p.cabeza.ang += 0.05 * s; }
    // ah… ah… ah…: cada vez más atrás
    const ahs = [[T.ah1, 0.5], [T.ah2, 0.75], [T.ah3, 1]];
    let ahK = 0; for (const [ta, k] of ahs) ahK = Math.max(ahK, k * campana(t, ta - 0.3, ta + 0.22));
    ahK = Math.max(ahK, tramo(t, T.ah3, T.achis - 0.05) * (1 - fase(t, T.achis - 0.02, T.achis + 0.02)));
    p.cabeza.ang -= 0.16 * ahK; p.torso -= 0.06 * ahK; p.torsoEsc.y += 0.03 * ahK; p.torsoEsc.x += 0.03 * ahK;
    const ach = t >= T.achis ? Math.exp(-(t - T.achis) * 5) : 0;
    p.cabeza.dx += 18 * ach;

    // pies
    for (const lado of ["cerca", "lejos"]) {
      const f = pie(PASOS_G[lado], t);
      p.piernas[lado] = { tob: { x: G.PELVIS.x + (f.x - p.x) / S, y: TOB_G[lado] - f.alza / S }, ang: -0.2 * Math.sin(Math.PI * f.u) * (f.alza > 1 ? 1 : 0) };
    }
    // carga: la rodilla de delante sube (como un lanzador)
    const rod = tramo(t, T.prep0 + 0.15, T.prep1) * (1 - tramo(t, T.swing0 - 0.06, T.swing0 + 0.08));
    if (rod > 0) { const q = p.piernas.lejos; q.tob = { x: q.tob.x - 120 * rod, y: q.tob.y - 175 * rod }; q.ang = lerp(q.ang, 0.55, rod); }
    // de puntillas al girar
    const gk2 = campana(t, T.giro0, T.giro1);
    p.pelvis.y -= 22 * gk2;
    for (const lado of ["cerca", "lejos"]) p.piernas[lado].ang -= 0.25 * gk2;
    // cara
    const ex = guion(GUION_CARA_G, CARAS_G, "picaro", t);
    p.cara = cara(ex, parpadeo(t, [1.35, 3.25, 6.25, 6.55, 7.35, 8.3, 11.3, 12.15]));
    p.cara.rubor = 0.35 * tramo(t, T.ah2, T.ah3) * (1 - tramo(t, T.achis + 0.3, T.achis + 0.9));
    p.enfado = 0.9 * tramo(t, T.enfado0, T.enfado0 + 0.2) * (1 - tramo(t, T.swing1, T.swing1 + 0.3));
    p.sudor = 0.7 * campana(t, T.revienta + 0.2, T.camara0 + 0.4);
    // manos
    const Tr = G.tronco(p), hc = Tr(G.HOMBRO_C), hl = Tr(G.HOMBRO);
    let c = { x: hc.x + b.cx, y: hc.y + b.cy }, l = { x: hl.x + b.lx, y: hl.y + b.ly };
    let cmu = muHacia(c, hc, -0.1), lmu = muHacia(l, hl, 0.1), cd = AGARRA, ld = dedosTodos(b.ld);
    // llamando con los puños: guardia boxeadora con amago
    const amago = bote * Math.sin(t * 7.2 + 1);
    l = { x: l.x + 14 * amago, y: l.y - 6 * Math.abs(amago) };
    // tras el estornudo se limpia la nariz con la muñeca (la lejana): dos pasadas por debajo de la nariz
    const fr = tramo(t, T.frota0, T.frota0 + 0.16) * (1 - tramo(t, T.frota1 - 0.16, T.frota1));
    if (fr > 0) {
      const H = G.cabeza(p), nar = H.a(NARIZ_G);
      const u = fase(t, T.frota0 + 0.1, T.frota1 - 0.1), pasa = 0.5 - 0.5 * Math.cos(u * TAU * 1.5);
      const objetivo = { x: nar.x - 40 + 150 * pasa, y: nar.y + 46 - 8 * Math.sin(u * TAU * 1.5) };
      l = mezcla(l, objetivo, fr); lmu = lerp(lmu, muHacia(objetivo, hl, 0.25), fr); ld = dedosTodos(lerp(b.ld, 0.15, fr));
      p.cabeza.ang -= 0.05 * Math.sin(u * TAU * 1.5) * fr;
    }
    p.manoCerca = { x: c.x, y: c.y, ang: 0, mu: cmu, dobla: -1, puno: 1, dedos: cd };
    p.manoLejos = { x: l.x, y: l.y, ang: 0, mu: lmu, dobla: -1, puno: 1, dedos: ld };
    // giro 2D
    const th = giroG(t);
    p.giro = th ? { px: G.aPantalla(p, p.pelvis).x, c: Math.cos(th), th } : null;
    return p;
  }

  /* =====================================================================================
   * DEIVI (derecha, mira a la izquierda: espejo)
   * ===================================================================================== */
  const CARAS_D = {
    picaro: E({ mx: 0.85, my: 0.05, c: 0.15, sd: 14, gd: 0.1, si: 4, gi: 0.02, sonr: 0.7, ancho: 0.95, abre: 2 }),
    llama: E({ mx: 0.85, my: 0.05, c: 0.3, sd: 20, gd: 0.16, si: 2, gi: 0.0, sonr: 0.9, ancho: 1, abre: 4 }),
    ataca: E({ mx: 0.9, my: 0.25, c: 0.3, sd: -6, gd: -0.15, si: -6, gi: -0.15, sonr: 0.5, abre: 12, ancho: 0.95, lengua: 0.8 }),
    chulo: E({ mx: -0.85, my: -0.05, c: 0.1, sd: 10, gd: 0.08, si: 14, gi: 0.1, sonr: 0.9, ancho: 1, abre: 5 }),
    miedo: E({ mx: 0.85, my: -0.15, iris: 0.78, sd: 26, gd: 0.22, si: 26, gi: 0.22, abre: 18, ancho: 0.7, sonr: -0.35 }),
    agacha: E({ mx: 0.4, my: 0.5, c: 1, z: 1, sd: -4, gd: -0.1, si: -4, gi: -0.1, abre: 14, ancho: 1.15, sonr: 0.55 }),
    pasmo: E({ mx: 0.85, my: -0.1, iris: 0.85, sd: 22, gd: 0.14, si: 22, gi: 0.14, abre: 26, ancho: 0.7, sonr: 0.05 }),
    risa: E({ mx: 0.6, my: 0.3, c: 1, h: 1, sd: 14, gd: 0.1, si: 14, gi: 0.1, sonr: 1, abre: 34, ancho: 1.1, lengua: 0.3 }),
    carcajada: E({ mx: 0.4, my: 0.6, c: 1, z: 0.6, h: 0.6, sd: 18, gd: 0.16, si: 18, gi: 0.16, sonr: 1, abre: 44, ancho: 1.15, lengua: 0.5 }),
    curioso: E({ mx: 0.85, my: 0.05, sd: 16, gd: 0.12, si: 10, gi: 0.06, abre: 4, ancho: 0.7, sonr: 0.3 }),
    plumas: E({ mx: 0, my: 0, c: 1, z: 1, sd: -8, gd: -0.2, si: -8, gi: -0.2, abre: 6, ancho: 0.9, sonr: -0.4 }),
    tieso: E({ mx: 0.85, my: 0, iris: 0.82, sd: 12, gd: 0.04, si: 12, gi: 0.04, abre: 0, ancho: 0.55, sonr: -0.25 }),
    sopla: E({ mx: 0.6, my: 0.8, iris: 0.9, sd: 6, gd: 0.02, si: 6, gi: 0.02, abre: 0, ancho: 0.4, sonr: -0.1, mof: 1 }),
    soplido: E({ mx: 0.6, my: 0.8, c: 0.4, sd: 6, gd: 0.02, si: 6, gi: 0.02, abre: 10, ancho: 0.38, sonr: -0.05 }),
    deadpan: E({ mx: -0.85, my: 0, c: 0.45, sd: 0, gd: -0.04, si: 0, gi: -0.04, abre: 0, ancho: 0.6, sonr: -0.18 })
  };
  const GUION_CARA_D = [
    [T.llama0, T.llama0 + 0.15, "llama"], [T.avanza0 + 0.1, T.avanza0 + 0.25, "ataca"], [T.golpe + 0.18, T.golpe + 0.32, "chulo"],
    [T.miedo0, T.miedo0 + 0.2, "miedo"], [T.agacha0, T.agacha1, "agacha"], [T.sube0, T.sube0 + 0.15, "pasmo"],
    [T.rie0, T.rie0 + 0.15, "risa"], [T.dobla0, T.dobla0 + 0.2, "carcajada"], [T.rie1 - 0.2, T.rie1, "risa"], [T.curioso0, T.curioso0 + 0.3, "curioso"], [T.impacta - 0.02, T.impacta + 0.04, "plumas"],
    [T.impacta + 0.25, T.impacta + 0.4, "tieso"], [T.sopla0, T.sopla0 + 0.2, "sopla"], [T.sopla1 - 0.22, T.sopla1 - 0.15, "soplido"],
    [T.sopla1 + 0.05, T.sopla1 + 0.2, "tieso"], [T.deadpan0, T.deadpan0 + 0.3, "deadpan"]
  ];
  // cuerpo (hoja de Deivi): manos respecto a sus hombros; cp/lp: mano fuera (1) o en el bolsillo (0)
  const P0D = { pel: 10, torso: 0.04, cab: 0.02, cx: 0, cy: 0, cp: 0, cd: 0.3, lx: 34, ly: 40, lp: 1, ld: 0.3 };
  const CD = o => Object.assign({}, P0D, o);
  // la cercana va casi siempre en el bolsillo (su pose de siempre); la lejana lleva la almohada
  const CUERPOS_D = {
    guardia: CD({}),
    reta: CD({ pel: 4, torso: -0.06, cab: -0.14 }),
    carga: CD({ pel: 18, torso: -0.08, cab: -0.06, lx: 70, ly: -40 }),
    golpe: CD({ pel: 34, torso: 0.3, cab: 0.1, lx: 262, ly: -6 }),
    chulo: CD({ pel: 8, torso: -0.03, cab: -0.04 }),
    miedo: CD({ pel: 4, torso: -0.1, cab: -0.06, lx: 30, ly: 60 }),
    agacha: CD({ pel: 330, torso: 0.5, cab: 0.42, lx: 40, ly: 210 }),
    mira: CD({ pel: 8, torso: -0.04, cab: -0.04, lx: 20, ly: 252 }),
    lanza: CD({ pel: 16, torso: 0.06, cab: -0.04, lx: 190, ly: 30 }),
    senala: CD({ pel: 16, torso: 0.08, cab: -0.12, lx: 368, ly: 24, ld: 0.3 }),
    doblado: CD({ pel: 70, torso: 0.5, cab: 0.26, lx: 20, ly: 252, ld: 0.9 }),
    curioso: CD({ pel: 2, torso: 0.17, cab: 0.12, lp: 0 }),
    plumazo: CD({ pel: 4, torso: -0.16, cab: -0.2, lp: 0 }),
    tieso: CD({ pel: 4, torso: -0.02, cab: 0.02, lp: 0 })
  };
  const GUION_CUERPO_D = [
    [T.llama0 - 0.1, T.llama0 + 0.15, "reta"], [T.llama1 - 0.1, T.llama1 + 0.05, "guardia"],
    [T.avanza0, T.avanza1 - 0.05, "carga"], [T.golpe - 0.1, T.golpe, "golpe", entrada], [T.golpe + 0.12, T.atras1, "chulo"],
    [T.miedo0, T.miedo0 + 0.25, "miedo"], [T.agacha0, T.agacha1, "agacha", salida], [T.sube0, T.sube1, "mira"],
    [T.suelta - 0.22, T.suelta, "lanza", entrada], [T.suelta + 0.04, T.suelta + 0.32, "senala"], [T.dobla0, T.dobla0 + 0.35, "doblado"], [T.rie1, T.curioso0 + 0.3, "mira"],
    [T.curioso0 + 0.2, T.curioso1, "curioso"], [T.impacta - 0.03, T.impacta + 0.05, "plumazo", salida], [T.impacta + 0.25, T.impacta + 0.7, "tieso"]
  ];
  const XD = [[0, 700], [T.avanza0, 700], [T.avanza1, 622], [T.atras0, 622], [T.atras1, 668], [T.curioso0 + 0.2, 668], [T.curioso1, 640], [T.impacta, 640], [T.impacta + 0.3, 652], [DUR, 652]];
  const PASOS_D = {
    cerca: [[-9, -8, 716], [T.avanza0 + 0.12, T.avanza1, 648, 22], [T.atras0 + 0.08, T.atras0 + 0.36, 684, 20], [T.curioso0 + 0.45, T.curioso0 + 0.75, 656, 14], [T.impacta + 0.02, T.impacta + 0.2, 668, 12]],
    lejos: [[-9, -8, 654], [T.avanza0, T.avanza0 + 0.3, 560, 26], [T.atras0 + 0.22, T.atras0 + 0.5, 622, 20], [T.curioso0 + 0.25, T.curioso0 + 0.55, 594, 14]]
  };
  const TOB_D = { cerca: D.SUELO - D.TOBILLO_ALTO, lejos: D.SUELO - D.TOBILLO_ALTO - 6 };

  function poseD(t) {
    const b = guion(GUION_CUERPO_D, CUERPOS_D, "guardia", t);
    const x = recorrido(XD, t), respira = Math.sin(t * 2.2 + 0.7);
    const p = { x, suelo: SUELO, s: S, espejo: true, tirasLimpias: true, ikContinuo: true, torsoEsc: { x: 1, y: 1 + respira * 0.004 }, piernas: {},
      pelvis: { x: D.PELVIS.x, y: D.PELVIS.y + b.pel + respira * 1.2 }, torso: b.torso,
      cabeza: { ang: b.cab, dx: 0, dy: 0, esc: { x: 1, y: 1 } } };
    const bote = tramo(t, 0.45, 0.75) * (1 - tramo(t, T.avanza0 - 0.1, T.avanza0 + 0.1));
    p.pelvis.y -= 12 * Math.abs(Math.sin(t * 6.6 + 0.6)) * bote;
    // chulería: cabeceo
    const ch = tramo(t, T.golpe + 0.35, T.golpe + 0.5) * (1 - tramo(t, T.miedo0 - 0.1, T.miedo0 + 0.1));
    p.cabeza.ang += 0.06 * Math.sin((t - T.golpe) * 7) * ch;
    // risa: sacudidas
    const ri = tramo(t, T.rie0, T.rie0 + 0.15) * (1 - tramo(t, T.rie1 - 0.2, T.rie1 + 0.2));
    const pulso = Math.abs(Math.sin((t - T.rie0) * 15));
    p.pelvis.y -= 9 * pulso * ri; p.cabeza.ang += 0.07 * pulso * ri; p.torso += 0.03 * pulso * ri;
    // el soplido: la cabeza se echa un poco atrás al soplar
    const so = campana(t, T.sopla1 - 0.25, T.sopla1 + 0.15);
    p.cabeza.ang -= 0.05 * so;
    // pies
    for (const lado of ["cerca", "lejos"]) {
      const f = pie(PASOS_D[lado], t);
      // espejo: x de pantalla → hoja con el signo invertido
      p.piernas[lado] = { tob: { x: D.PELVIS.x - (f.x - p.x) / S, y: TOB_D[lado] - f.alza / S }, ang: -0.2 * Math.sin(Math.PI * f.u) * (f.alza > 1 ? 1 : 0) };
    }
    // cara
    const ex = guion(GUION_CARA_D, CARAS_D, "picaro", t);
    p.cara = cara(ex, parpadeo(t, [1.25, 3.4, 5.6, 9.4, 11.0, 12.6, 13.3]));
    p.cara.rubor = 0.3 * ri;
    // manos
    const Tr = D.tronco(p), hc = Tr(D.HOMBRO_C), hl = Tr(D.HOMBRO);
    const bC = Tr(D.BOLSILLO_C), bL = Tr(D.BOLSILLO_L);
    let c = mezcla({ x: hc.x + b.cx, y: hc.y + b.cy }, bC, 1 - clamp(b.cp * 1.4));
    let l = mezcla({ x: hl.x + b.lx, y: hl.y + b.ly }, bL, 1 - clamp(b.lp * 1.4));
    let cmu = muHacia(c, hc, 0.1), lmu = muHacia(l, hl, -0.1), cdd = dedosTodos(b.cd), ldd = dedosTodos(b.ld);
    if (b.cp < 0.05) cmu = -1.75;
    if (b.lp < 0.05) lmu = -1.75;
    // señala a Guillermo con el índice (la lejana, antebrazo horizontal)
    const se = tramo(t, T.rie0 + 0.15, T.rie0 + 0.35) * (1 - tramo(t, T.dobla0, T.dobla0 + 0.25));
    if (se > 0) { lmu = lerp(lmu, Math.PI - 0.06, se); ldd = { pulgar: lerp(b.ld, 0.35, se), indice: lerp(b.ld, 1, se), medio: lerp(b.ld, 0, se), anular: lerp(b.ld, 0, se), menique: lerp(b.ld, 0, se) };
      l = { x: l.x - 6 * Math.abs(Math.sin((t - T.rie0) * 15)) * se, y: l.y - 8 * Math.abs(Math.sin((t - T.rie0) * 15)) * se }; }
    // doblado de risa: palmadas en el muslo
    const db = tramo(t, T.dobla0, T.dobla0 + 0.3) * (1 - tramo(t, T.rie1 - 0.2, T.rie1 + 0.1));
    if (db > 0) { const muslo = Tr({ x: 372, y: 770 }), pal = Math.abs(Math.sin((t - T.dobla0) * 9));
      l = mezcla(l, { x: muslo.x + 30, y: muslo.y - 70 * pal }, db); lmu = lerp(lmu, -1.9, db); ldd = dedosTodos(lerp(b.ld, 1, db)); }
    // con la almohada, la mano agarra; sin ella, abierta y relajada
    if (t < T.suelta) ldd = AGARRA;
    else if (se <= 0 && db <= 0) ldd = dedosTodos(lerp(0.3, 0.7, tramo(t, T.suelta, T.suelta + 0.2)));
    p.manoCerca = { x: c.x, y: c.y, ang: 0, mu: cmu, dobla: -1, puno: clamp(b.cp * 1.4), dedos: cdd };
    p.manoLejos = { x: l.x, y: l.y, ang: 0, mu: lmu, dobla: 1, puno: clamp(b.lp * 1.4), dedos: ldd };
    return p;
  }

  /* ---------- puntos de la cara ---------- */
  const NARIZ_G = { x: 884, y: 668 };
  const pantG = (pg, q) => { let s = G.aPantalla(pg, q); if (pg.giro) s = { x: pg.giro.px + pg.giro.c * (s.x - pg.giro.px), y: s.y }; return s; };
  const pantD = (pd, q) => D.aPantalla(pd, q);
  const cabG = (pg, q) => pantG(pg, G.cabeza(pg).a(q));
  const cabD = (pd, q) => pantD(pd, D.cabeza(pd).a(q));

  /* =====================================================================================
   * ALMOHADA DE GUILLERMO: ángulo en su propio marco (0 = hacia delante)
   * ===================================================================================== */
  const A_CUELGA = 1.5, A_ARRIBA = -2.05 + TAU;
  const KA_G = [[0, A_CUELGA], [T.golpe, A_CUELGA], [T.prep0, A_CUELGA], [T.prep1 - 0.05, A_ARRIBA], [T.swing0, A_ARRIBA],
    [T.pasa, TAU - 0.8], [T.swing1, TAU - 0.72], [T.giro0 + 0.12, TAU - 0.68], [T.latigo0, TAU - 0.78], [T.latigo0 + 0.09, TAU - 1.6], [T.zas, TAU - 2.42]];
  function angBaseG(t) {
    let a = claves(KA_G, t);
    // colgando: balanceo con los saltitos y con el golpe recibido
    const cuelga = 1 - tramo(t, T.prep0, T.prep0 + 0.25);
    a += cuelga * (0.1 * Math.sin(t * 7.2) * tramo(t, 0.5, 0.8) * (1 - tramo(t, T.avanza0, T.golpe)) + 0.5 * amort(t, T.golpe, 11, 4) + 0.05 * Math.sin(t * 2));
    // aguantando la carga: bambolea
    a += 0.08 * Math.sin(t * 15) * tramo(t, T.prep1 - 0.2, T.prep1) * (1 - fase(t, T.swing0, T.swing0 + 0.03));
    return a;
  }
  function almohadaG(t, pg) {
    if (t >= T.revienta) return null;
    const m = pg.manoCerca, A = G.aPantalla(pg, m);
    const a = angBaseG(t), w = (angBaseG(t + 0.012) - angBaseG(t - 0.012)) / 0.024;
    const st = { x: A.x, y: A.y, a, curva: clamp(-w * 0.045, -1.1, 1.1) + 0.25 * Math.cos(a), sl: 1, sw: 1, pal: PAL_G, junta: 0.22 };
    // al girar, estirada por la fuerza
    const gk = campana(t, T.giro0, T.giro1);
    st.sl += 0.1 * gk; st.sw -= 0.08 * gk; st.curva *= 1 - 0.6 * gk;
    // ¡zas!: encima de la cabeza (se adapta a la cabeza de verdad)
    const enc = tramo(t, T.zas - 0.05, T.zas);
    if (enc > 0) {
      const H = G.cabeza(pg), top = G.aPantalla(pg, H.a({ x: 820, y: 175 }));
      const aT = Math.atan2(top.y - A.y, top.x - A.x);
      let aT2 = aT; while (aT2 < st.a - Math.PI) aT2 += TAU; while (aT2 > st.a + Math.PI) aT2 -= TAU;
      st.a = lerp(st.a, aT2 - 0.28, enc);
      const zk = t >= T.zas ? Math.exp(-(t - T.zas) * 7) : 0;
      st.curva = lerp(st.curva, -1.25 - 0.3 * zk, enc); st.sl = lerp(st.sl, 0.98 - 0.1 * zk, enc); st.sw = lerp(st.sw, 1.05 + 0.12 * zk, enc);
      // se hincha justo antes de reventar
      const hin = tramo(t, T.revienta - 0.18, T.revienta);
      st.sw += 0.12 * hin + 0.03 * Math.sin(t * 60) * hin; st.sl += 0.05 * hin;
    }
    return st;
  }
  // funda rota (después de reventar): cuelga de la mano
  function fundaG(t, pg) {
    if (t < T.revienta) return null;
    const m = pg.manoCerca, A = G.aPantalla(pg, m), u = t - T.revienta;
    const cae = suave(fase(t, T.revienta, T.revienta + 0.35));
    const a0 = TAU - 2.7, a1 = TAU + Math.PI / 2 - 0.12;
    const a = lerp(a0, a1, cae) + 0.35 * amort(t, T.revienta + 0.3, 9, 3) + 0.25 * amort(t, T.baja0 + 0.15, 7, 2.5) + 0.04 * Math.sin(t * 2.2)
      + 0.3 * amort(t, T.achis, 12, 4);
    return { x: A.x, y: A.y, a, curva: 0.3 * Math.sin(u * 3) * Math.exp(-u * 1.5) + 0.15, sl: 0.66, sw: 0.72, pal: PAL_G, junta: 0.35 };
  }

  /* =====================================================================================
   * ALMOHADA DE DEIVI
   * ===================================================================================== */
  const AD_HOMBRO = -2.45, AD_GOLPE = 0.45;
  const AD_CUELGA = 1.5 - TAU;
  const KA_D = [[0, AD_HOMBRO], [T.avanza0, AD_HOMBRO], [T.avanza1 - 0.05, -1.85], [T.golpe - 0.08, -1.7], [T.golpe, AD_GOLPE],
    [T.golpe + 0.1, 0.2], [T.golpe + 0.45, AD_HOMBRO], [T.miedo0, AD_HOMBRO], [T.miedo0 + 0.3, -2.3], [T.agacha0 - 0.05, -2.4], [T.agacha1 + 0.1, AD_CUELGA - 0.5], [T.sube0, AD_CUELGA], [T.sube1, AD_CUELGA], [T.suelta - 0.22, AD_CUELGA], [T.suelta, AD_CUELGA - 2.25]];
  function angBaseD(t) {
    let a = claves(KA_D, t);
    a += 0.08 * Math.sin(t * 6.6 + 0.6) * tramo(t, 0.45, 0.75) * (1 - tramo(t, T.avanza0 - 0.1, T.avanza0 + 0.1));
    a += 0.06 * Math.sin(t * 7) * tramo(t, T.golpe + 0.35, T.golpe + 0.5) * (1 - tramo(t, T.miedo0 - 0.1, T.miedo0 + 0.1));
    a += 0.1 * Math.sin(t * 2.6) * tramo(t, T.sube1, T.sube1 + 0.3);
    return a;
  }
  let ATERRIZA_D = null;
  function almohadaD(t, pd, pg) {
    if (t >= T.suelta) return null;
    const m = pd.manoLejos, A = D.aPantalla(pd, m);
    const af = angBaseD(t), w = (angBaseD(t + 0.012) - angBaseD(t - 0.012)) / 0.024;
    const a = Math.PI - af;
    const st = { x: A.x, y: A.y, a, curva: clamp(w * 0.045, -1.1, 1.1) + 0.25 * Math.cos(a), sl: 1, sw: 1, pal: PAL_D, junta: 0.22 };
    // al hombro o colgando: siempre por detrás de su cuerpo (la mano por delante)
    st.detras = true;
    // golpe en la cabeza de Guillermo
    const gk = clamp(1 - Math.abs(t - T.golpe) / 0.09);
    if (gk > 0 && pg) {
      const H = G.cabeza(pg), punto = G.aPantalla(pg, H.a({ x: 900, y: 300 }));
      const d = Math.hypot(punto.x - A.x, punto.y - A.y), aT = Math.atan2(punto.y - A.y, punto.x - A.x);
      let aT2 = aT; while (aT2 < st.a - Math.PI) aT2 += TAU; while (aT2 > st.a + Math.PI) aT2 -= TAU;
      const k = suave(gk);
      st.a = lerp(st.a, aT2 + 0.12, k);
      const apl = t >= T.golpe ? Math.exp(-(t - T.golpe) * 14) : 0;
      st.sl = lerp(1, clamp((d + 18) / AL, 0.7, 1.05) - 0.1 * apl, k); st.sw = lerp(1, 1.0 / Math.sqrt(st.sl), k) + 0.1 * apl; st.curva = lerp(st.curva, 0.25, k);
    }
    return st;
  }
  // almohada suelta de Deivi: la lanza por lo bajo y cae en el sofá, entre los dos
  const T_CAE_D = 0.55;
  function almohadaDSuelta(t, pd) {
    if (t < T.suelta) return null;
    if (!ATERRIZA_D) { const p0 = poseD(T.suelta - 1e-4), m = p0.manoLejos, s0 = almohadaD(T.suelta - 1e-4, p0, null); ATERRIZA_D = { A: D.aPantalla(p0, m), a: s0.a, curva: s0.curva }; }
    const u = fase(t, T.suelta, T.suelta + T_CAE_D), A0 = ATERRIZA_D.A;
    const fin = { x: 476, y: 382 };
    const x = lerp(A0.x, fin.x, u), y = lerp(A0.y, fin.y, u) - 170 * 4 * u * (1 - u);
    const tc = T.suelta + T_CAE_D;
    const bote = t > tc ? 10 * Math.exp(-(t - tc) * 8) * Math.abs(Math.sin((t - tc) * 18)) : 0;
    const apl = t > tc ? Math.exp(-(t - tc) * 7) : 0;
    let a0 = ATERRIZA_D.a; while (a0 < 0.04) a0 += TAU; while (a0 > 0.04 + TAU) a0 -= TAU;
    const a = lerp(a0, 0.04, salida(u));
    return { x, y: y - bote, a, curva: lerp(ATERRIZA_D.curva, 0.04, salida(fase(t, T.suelta, T.suelta + 0.25))) + 0.2 * apl, sl: 1 - 0.06 * apl, sw: lerp(1, 0.78, suave(u)) + 0.1 * apl, pal: PAL_D, junta: lerp(0.22, 0.7, u), suelo: true };
  }

  /* =====================================================================================
   * PLUMAS DE LA ESCENA
   * ===================================================================================== */
  let PL = null;
  // pegadas: [x, y, giro relativo, largo, variante, retraso de llegada (s tras reventar; 0 = ya en el pelo)]
  const PEGA_CAB_G = [
    [772, 214, -2.05, 30, 0, 0], [842, 196, -1.42, 34, 2, 0], [918, 222, -0.98, 27, 1, 0],         // cresta
    [668, 262, -2.55, 24, 3, 0], [985, 262, -0.45, 24, 0, 0], [612, 338, 2.9, 22, 1, 0], [1045, 330, 0.15, 22, 2, 0],
    [726, 272, 2.6, 21, 2, 0.05], [880, 268, 0.5, 22, 3, 0.4],
    [1075, 400, 0.9, 21, 1, 0.75], [690, 330, 2.95, 20, 0, 0.95], [955, 340, -0.2, 20, 3, 1.25], [560, 430, 2.4, 19, 2, 1.5]
  ];
  const PEGA_TRONCO_G = [   // hoja: hombros y pecho
    [120, 330, -0.4, 21, 0, 0.55], [196, 316, 0.3, 19, 2, 0.85], [352, 352, 2.7, 20, 1, 1.05], [262, 420, 0.9, 18, 3, 1.4], [70, 390, -0.9, 18, 1, 1.7]
  ];
  const PEGA_CAB_D = [
    [690, 240, -2.2, 22, 0, 0], [770, 196, -1.7, 24, 2, 0.02], [860, 192, -1.3, 22, 1, 0.04], [945, 222, -0.8, 22, 3, 0.03],
    [1010, 290, -0.3, 20, 0, 0.06], [640, 320, -2.6, 19, 2, 0.07], [905, 300, 0.4, 18, 1, 0.05], [990, 420, 0.5, 17, 0, 0.06], [868, 630, 0.27, 19, 3, 0.08]
  ];
  function creaPlumasEscena() {
    const o = { libres: [], cabG: [], troncoG: [], cabD: [] };
    // ¡puf!: el golpe de Deivi suelta cuatro plumas
    const pg0 = poseG(T.golpe), pz = cabG(pg0, { x: 900, y: 300 });
    for (let i = 0; i < 4; i++) o.libres.push(nuevaPluma(500 + i, T.golpe, pz.x, pz.y, -1.6, 2.4, 90, 230, { vt0: 34, vt1: 52, capa: i % 2 ? "delante" : "atras" }));
    // ¡revienta!
    const pg1 = poseG(T.revienta), st = almohadaG(T.revienta - 1e-4, pg1), Fm = marco(st), c0 = Fm.M(0.6, 0);
    o.centro = c0;
    for (let i = 0; i < 118; i++) o.libres.push(nuevaPluma(i, T.revienta, c0.x + (hash(i + 0.5) - 0.5) * 50, c0.y + (hash(i + 0.7) - 0.5) * 30, -Math.PI / 2, 4.4, 200, 720, { retraso: 0.05 }));
    // pegadas a Guillermo: salen del estallido y vuelan hasta su sitio
    PEGA_CAB_G.forEach((q, i) => o.cabG.push({ q, f: nuevaPluma(300 + i, T.revienta, c0.x, c0.y, -Math.PI / 2, 4, 150, 380) }));
    PEGA_TRONCO_G.forEach((q, i) => o.troncoG.push({ q, f: nuevaPluma(400 + i, T.revienta, c0.x, c0.y, -Math.PI / 2, 4, 150, 380) }));
    // ¡achís!: nube de plumas hacia Deivi
    const pga = poseG(T.achis), boca = pantG(pga, G.boca(pga)), pda = poseD(T.impacta), cd = cabD(pda, { x: 840, y: 470 });
    const ang = Math.atan2(cd.y - boca.y, cd.x - boca.x);
    o.boca = boca; o.angAchis = ang;
    for (let i = 0; i < 40; i++) o.libres.push(nuevaPluma(700 + i, T.achis, boca.x + 10, boca.y, ang - 0.15, 1.0, 420, 980, { k0: 3.2, k1: 4.6, retraso: 0.06 }));
    PEGA_CAB_D.forEach((q, i) => o.cabD.push({ q, sem: 800 + i }));
    // la pluma de la nariz (cae haciendo eses)
    o.nariz = { inicio: { x: 520, y: -40 } };
    return o;
  }
  // la pluma de la nariz: posición en pantalla
  function plumaNariz(t, pg) {
    if (t < T.pluma0) return null;
    const N = cabG(pg, NARIZ_G), ini = PL.nariz.inicio;
    if (t < T.nariz) {
      const u = fase(t, T.pluma0, T.nariz), k = 1 - Math.pow(1 - u, 1.6);
      const sw = Math.sin(u * TAU * 2.6) * (1 - u * u);
      return { x: lerp(ini.x, N.x + 6, k) + 48 * sw, y: lerp(ini.y, N.y - 2, Math.pow(u, 1.15)) + 8 * Math.cos(u * TAU * 5.2) * (1 - u), r: 0.12 + 0.7 * Math.cos(u * TAU * 2.6) * (1 - u), enNariz: false };
    }
    if (t < T.achis) return { x: N.x + 6, y: N.y - 2, r: 0.12, enNariz: true };
    // sale disparada con el estornudo y luego cae
    const a = PL.angAchis - 0.35, N0 = PL.narizLibre ? null : cabG(poseG(T.achis), NARIZ_G);
    const f = PL.narizLibre || (PL.narizLibre = preparaPluma({ sem: 999, t0: T.achis, x0: N0.x + 6, y0: N0.y - 2, vx: Math.cos(a) * 700, vy: Math.sin(a) * 700, k: 3.4, vt: 55,
      A: 22, w: 2.6, ph: 1, giro: 3, r0: 0.1, rA: 0.6, largo: 20, v: 2, capa: "delante", suelo: SUELO + 20 }));
    return posPluma(f, t);
  }
  // pluma pegada (cabeza o tronco): de su vuelo libre a su sitio; devuelve null si ya está pegada
  function vueloPegada(e, t, objetivo, rObj) {
    const lleg = T.revienta + 0.15 + e.q[5];
    if (e.q[5] === 0 || t >= lleg) return null;
    const tau = t - e.f.t0; if (tau < 0) return null;
    const q = libre(e.f, tau), k = suave(fase(t, T.revienta + 0.12, lleg));
    let r = q.r; while (r < rObj - Math.PI) r += TAU; while (r > rObj + Math.PI) r -= TAU;
    return { x: lerp(q.x, objetivo.x, k), y: lerp(q.y, objetivo.y, k), r: lerp(r, rObj, k), largo: e.q[3], v: e.q[4] };
  }

  /* ---------- capas sobre los personajes (plumas pegadas) ---------- */
  const KP_G = 1 / (0.6 * S), KS = 1 / S, KP_D = 1 / (0.6 * S);
  function capaCabezaG(g, t) {
    if (!PL || t < T.revienta) return;
    for (const e of PL.cabG) {
      const [x, y, r, l, v, ret] = e.q, lleg = T.revienta + 0.15 + ret;
      if (ret === 0) { const k = salida(fase(t, T.revienta, T.revienta + 0.1)); pluma(g, x, y, r + 0.12 * amort(t, T.revienta, 18, 5), l * KP_G * (0.4 + 0.6 * k), v); }
      else if (t >= lleg) pluma(g, x, y, r + 0.2 * amort(t, lleg, 16, 6) + 0.05 * Math.sin(t * 9) * campana(t, T.gallina0, T.gallina1), l * KP_G, v);
    }
    // la pluma de la nariz, ya posada
    if (t >= T.nariz && t < T.achis) {
      const tick = 0.2 * Math.sin(t * 23) * tramo(t, T.nariz, T.nariz + 0.15) + 0.12 * Math.sin(t * 31) * tramo(t, T.ah1 - 0.3, T.ah1);
      pluma(g, NARIZ_G.x + 6 * KP_G, NARIZ_G.y - 2 * KP_G, 0.12 + tick, 20 * KP_G, 2);
    }
  }
  function capaTroncoG(g, t) {
    if (!PL || t < T.revienta) return;
    for (const e of PL.troncoG) { const [x, y, r, l, v, ret] = e.q, lleg = T.revienta + 0.15 + ret; if (t >= lleg) pluma(g, x, y, r + 0.2 * amort(t, lleg, 16, 6), l * KS, v); }
  }
  function capaCabezaD(g, t) {
    if (!PL || t < T.impacta) return;
    PL.cabD.forEach((e, i) => {
      const [x, y, r, l, v, ret] = e.q, lleg = T.impacta + ret;
      if (t < lleg) return;
      if (i === PL.cabD.length - 1 && t >= T.sopla1 - 0.12) return;          // la del labio sale volando con el soplido
      pluma(g, x, y, r + 0.18 * amort(t, lleg, 15, 6) + (i === PL.cabD.length - 1 ? 0.25 * Math.sin(t * 9) * tramo(t, T.sopla0, T.sopla1 - 0.2) : 0), l * KP_D, v);
    });
  }
  // vuelo de las plumas del estornudo que acaban pegadas a Deivi
  function vueloD(e, i, t, pd) {
    const lleg = T.impacta + e.q[5]; if (t < T.achis || t >= lleg) return null;
    const u = fase(t, T.achis + 0.02 * (i % 3), lleg), dest = cabD(pd, { x: e.q[0], y: e.q[1] }), o = PL.boca;
    const k = salida(u);
    return { x: lerp(o.x + 12, dest.x, k), y: lerp(o.y, dest.y, k) - 26 * Math.sin(Math.PI * u) * (i % 2 ? 1 : -0.6), r: e.q[2] + (1 - k) * 6 * (i % 2 ? 1 : -1), largo: e.q[3], v: e.q[4] };
  }
  // la del labio, soplada
  function plumaSoplada(t, pd) {
    if (t < T.sopla1 - 0.12) return null;
    if (!PL.soplada) { const e = PL.cabD[PL.cabD.length - 1], p0 = poseD(T.sopla1 - 0.12), q = cabD(p0, { x: e.q[0], y: e.q[1] });
      PL.soplada = preparaPluma({ sem: 1234, t0: T.sopla1 - 0.12, x0: q.x, y0: q.y, vx: -150, vy: -330, k: 2.6, vt: 46, A: 20, w: 2.4, ph: 0.3, giro: 2, r0: Math.PI - e.q[2], rA: 0.7, largo: e.q[3], v: e.q[4], capa: "delante", suelo: SUELO + 26 }); }
    return posPluma(PL.soplada, t);
  }

  /* ---------- postura conjunta ---------- */
  function pose(t) {
    const pg = poseG(t), pd = poseD(t);
    pg.capaCabeza = capaCabezaG; pg.capaTronco = capaTroncoG; pd.capaCabeza = capaCabezaD;
    const aG = almohadaG(t, pg), fG = fundaG(t, pg), aD = almohadaD(t, pd, pg), sD = almohadaDSuelta(t, pd);
    return { g: pg, d: pd, aG, fG, aD, sD };
  }

  /* =====================================================================================
   * DECORADO: salón de noche
   * ===================================================================================== */
  let fondo = null, CAM = null;
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W + 120; c.height = H + 140; const g = c.getContext("2d");
    g.translate(60, 70); g.lineJoin = "round"; g.lineCap = "round";
    const X0 = -60, X1 = W + 60, Y0 = -70;
    // pared: papel pintado mostaza con rayas y rombos
    const pared = g.createLinearGradient(0, Y0, 0, PARED); pared.addColorStop(0, "#b98a45"); pared.addColorStop(1, "#d8aa5e");
    g.fillStyle = pared; g.fillRect(X0, Y0, X1 - X0, PARED - Y0);
    for (let x = X0; x < X1; x += 44) { g.fillStyle = "rgba(120,70,20,0.13)"; g.fillRect(x, Y0, 16, PARED - Y0); g.fillStyle = "rgba(255,235,180,0.08)"; g.fillRect(x + 16, Y0, 3, PARED - Y0); }
    g.fillStyle = "rgba(255,240,200,0.18)";
    for (let x = X0 + 30, i = 0; x < X1; x += 44, i++) for (let y = Y0 + 20 + (i % 2) * 30; y < PARED; y += 60) { g.beginPath(); g.moveTo(x, y - 6); g.lineTo(x + 4, y); g.lineTo(x, y + 6); g.lineTo(x - 4, y); g.closePath(); g.fill(); }
    // moldura de techo
    g.fillStyle = "#f2e2c2"; g.fillRect(X0, Y0, X1 - X0, 82); g.fillStyle = "#d9c49c"; g.fillRect(X0, 4, X1 - X0, 6); g.fillStyle = "#0b0a0e"; g.fillRect(X0, 10, X1 - X0, 2.5);
    // ventana con noche, luna y estrellas
    const vx = 70, vy = 92, vw = 190, vh = 230;
    g.fillStyle = "#f4e8cf"; g.fillRect(vx - 14, vy - 14, vw + 28, vh + 28);
    const noche = g.createLinearGradient(0, vy, 0, vy + vh); noche.addColorStop(0, "#0d1534"); noche.addColorStop(1, "#2c3f78");
    g.fillStyle = noche; g.fillRect(vx, vy, vw, vh);
    g.fillStyle = "#fff6d8"; for (let i = 0; i < 26; i++) { const sx = vx + 6 + hash(i + 40) * (vw - 12), sy = vy + 6 + hash(i + 41) * (vh * 0.7), r = 0.8 + hash(i + 42) * 1.4; g.beginPath(); g.arc(sx, sy, r, 0, TAU); g.fill(); }
    const lx = vx + 132, ly = vy + 52;
    const hl = g.createRadialGradient(lx, ly, 4, lx, ly, 60); hl.addColorStop(0, "rgba(255,246,200,0.5)"); hl.addColorStop(1, "rgba(255,246,200,0)"); g.fillStyle = hl; g.fillRect(vx, vy, vw, vh);
    g.fillStyle = "#fff3c4"; g.beginPath(); g.arc(lx, ly, 22, 0, TAU); g.fill();
    g.fillStyle = "#1a2550"; g.beginPath(); g.arc(lx + 11, ly - 7, 20, 0, TAU); g.fill();
    // tejados de enfrente
    g.fillStyle = "#121a38"; g.beginPath(); g.moveTo(vx, vy + vh); g.lineTo(vx, vy + 178); g.lineTo(vx + 40, vy + 150); g.lineTo(vx + 80, vy + 178); g.lineTo(vx + 80, vy + 160); g.lineTo(vx + 130, vy + 160); g.lineTo(vx + 130, vy + 190); g.lineTo(vx + 160, vy + 168); g.lineTo(vx + vw, vy + 190); g.lineTo(vx + vw, vy + vh); g.closePath(); g.fill();
    g.fillStyle = "#ffcf6a"; for (const [a, b] of [[22, 190], [100, 180], [150, 200], [52, 205]]) g.fillRect(vx + a, vy + b, 8, 9);
    g.strokeStyle = "#f4e8cf"; g.lineWidth = 8; g.beginPath(); g.moveTo(vx + vw / 2, vy); g.lineTo(vx + vw / 2, vy + vh); g.moveTo(vx, vy + vh * 0.46); g.lineTo(vx + vw, vy + vh * 0.46); g.stroke();
    g.strokeStyle = "#0b0a0e"; g.lineWidth = 2.5; g.strokeRect(vx - 14, vy - 14, vw + 28, vh + 28); g.strokeRect(vx, vy, vw, vh);
    g.fillStyle = "#f4e8cf"; g.fillRect(vx - 24, vy + vh + 10, vw + 48, 12); g.strokeRect(vx - 24, vy + vh + 10, vw + 48, 12);
    // cortinas granates con pliegues y alzapaños
    for (const s of [-1, 1]) {
      const x0 = s < 0 ? vx - 40 : vx + vw + 40, ancho = 62, sg = s < 0 ? 1 : -1;
      g.save(); g.beginPath(); g.moveTo(x0, 86); g.lineTo(x0 + sg * ancho, 86);
      g.quadraticCurveTo(x0 + sg * 30, 230, x0 + sg * 22, 262); g.quadraticCurveTo(x0 + sg * 44, 330, x0 + sg * 54, 400); g.lineTo(x0 - sg * 6, 400); g.closePath();
      g.fillStyle = "#8f2234"; g.fill(); g.clip();
      for (let k = 0; k < 5; k++) { g.fillStyle = k % 2 ? "rgba(0,0,0,0.22)" : "rgba(255,140,140,0.12)"; g.fillRect(x0 + sg * (k * 13) - (sg < 0 ? 8 : 0), 80, 8, 330); }
      g.restore();
      g.strokeStyle = "#0b0a0e"; g.lineWidth = 2.5; g.beginPath(); g.moveTo(x0, 86); g.lineTo(x0 + sg * ancho, 86);
      g.quadraticCurveTo(x0 + sg * 30, 230, x0 + sg * 22, 262); g.quadraticCurveTo(x0 + sg * 44, 330, x0 + sg * 54, 400); g.lineTo(x0 - sg * 6, 400); g.closePath(); g.stroke();
      g.fillStyle = "#e3b04a"; g.beginPath(); g.ellipse(x0 + sg * 22, 262, 14, 6, 0, 0, TAU); g.fill(); g.stroke();
    }
    g.fillStyle = "#3a2a1c"; g.fillRect(vx - 60, 78, vw + 120, 8); g.beginPath(); g.arc(vx - 60, 82, 7, 0, TAU); g.arc(vx + vw + 60, 82, 7, 0, TAU); g.fill();
    // cuadro encima del sofá: montañas y un sol (sin letras)
    const cx0 = 488, cy0 = 120, cw = 170, ch = 112;
    g.fillStyle = "#4a2e1a"; g.fillRect(cx0 - 10, cy0 - 10, cw + 20, ch + 20); g.strokeStyle = "#0b0a0e"; g.lineWidth = 2.5; g.strokeRect(cx0 - 10, cy0 - 10, cw + 20, ch + 20);
    const cq = g.createLinearGradient(0, cy0, 0, cy0 + ch); cq.addColorStop(0, "#f6c98a"); cq.addColorStop(1, "#e98a6a"); g.fillStyle = cq; g.fillRect(cx0, cy0, cw, ch);
    g.fillStyle = "#fff0b0"; g.beginPath(); g.arc(cx0 + 118, cy0 + 46, 16, 0, TAU); g.fill();
    g.fillStyle = "#6b5a8e"; g.beginPath(); g.moveTo(cx0, cy0 + ch); g.lineTo(cx0 + 52, cy0 + 48); g.lineTo(cx0 + 96, cy0 + 92); g.lineTo(cx0 + 128, cy0 + 66); g.lineTo(cx0 + cw, cy0 + 100); g.lineTo(cx0 + cw, cy0 + ch); g.closePath(); g.fill();
    g.fillStyle = "#47406a"; g.beginPath(); g.moveTo(cx0, cy0 + ch); g.lineTo(cx0 + 30, cy0 + 86); g.lineTo(cx0 + 70, cy0 + ch); g.closePath(); g.fill();
    g.strokeRect(cx0, cy0, cw, ch);
    // lámpara de pie (izquierda) con su luz
    const lmx = 22;
    const halo = g.createRadialGradient(lmx + 10, 190, 10, lmx + 10, 190, 260); halo.addColorStop(0, "rgba(255,226,150,0.55)"); halo.addColorStop(0.4, "rgba(255,210,130,0.18)"); halo.addColorStop(1, "rgba(255,210,130,0)");
    g.fillStyle = halo; g.fillRect(X0, Y0, 360, 560);
    g.fillStyle = "#2b2420"; g.fillRect(lmx + 6, 200, 6, PARED + 30 - 200); g.beginPath(); g.ellipse(lmx + 9, PARED + 32, 30, 7, 0, 0, TAU); g.fill();
    g.beginPath(); g.moveTo(lmx - 36, 210); g.lineTo(lmx + 54, 210); g.lineTo(lmx + 36, 150); g.lineTo(lmx - 18, 150); g.closePath();
    const pant = g.createLinearGradient(0, 150, 0, 210); pant.addColorStop(0, "#f7dfa8"); pant.addColorStop(1, "#ffc76b"); g.fillStyle = pant; g.fill();
    g.strokeStyle = "#0b0a0e"; g.lineWidth = 2.5; g.stroke();
    g.fillStyle = "rgba(255,240,190,0.6)"; g.beginPath(); g.moveTo(lmx - 36, 210); g.lineTo(lmx + 54, 210); g.lineTo(lmx + 80, PARED); g.lineTo(lmx - 70, PARED); g.closePath(); g.globalAlpha = 0.18; g.fill(); g.globalAlpha = 1;
    // sofá de terciopelo verde azulado
    const sx0 = 345, sx1 = 790, sTop = 288, sAsiento = 390, sBase = 488;
    const tercio = "#2f7f7a", tercioO = "#1f5b58", tercioL = "#4fa59c";
    g.fillStyle = tercioO; g.fillRect(sx0 + 20, sBase - 6, 14, 12); g.fillRect(sx1 - 34, sBase - 6, 14, 12);
    g.beginPath(); g.moveTo(sx0 + 40, sAsiento); g.lineTo(sx0 + 40, sTop + 20); g.quadraticCurveTo(sx0 + 40, sTop, sx0 + 70, sTop); g.lineTo(sx1 - 70, sTop); g.quadraticCurveTo(sx1 - 40, sTop, sx1 - 40, sTop + 20); g.lineTo(sx1 - 40, sAsiento); g.closePath();
    g.fillStyle = tercio; g.fill(); g.strokeStyle = "#0b0a0e"; g.lineWidth = 2.6; g.stroke();
    // capitoné del respaldo
    g.fillStyle = tercioO; for (let i = 0; i < 6; i++) for (let j = 0; j < 2; j++) { const bx = sx0 + 90 + i * 68 + j * 34, by = sTop + 32 + j * 36; g.beginPath(); g.arc(bx, by, 3, 0, TAU); g.fill(); }
    g.strokeStyle = "rgba(0,0,0,0.18)"; g.lineWidth = 1.5;
    for (let i = 0; i < 6; i++) for (let j = 0; j < 2; j++) { const bx = sx0 + 90 + i * 68 + j * 34, by = sTop + 32 + j * 36; g.beginPath(); g.moveTo(bx - 14, by - 10); g.lineTo(bx, by); g.lineTo(bx + 14, by - 10); g.stroke(); }
    g.fillStyle = "rgba(255,255,255,0.1)"; g.fillRect(sx0 + 60, sTop + 6, sx1 - sx0 - 120, 8);
    // cojines del asiento y faldón
    for (let i = 0; i < 3; i++) { const a = sx0 + 40 + i * (sx1 - sx0 - 80) / 3, bb = a + (sx1 - sx0 - 80) / 3;
      g.beginPath(); g.moveTo(a + 4, sAsiento + 30); g.quadraticCurveTo(a, sAsiento - 6, a + 20, sAsiento - 8); g.lineTo(bb - 20, sAsiento - 8); g.quadraticCurveTo(bb, sAsiento - 6, bb - 4, sAsiento + 30); g.closePath();
      g.fillStyle = tercioL; g.fill(); g.strokeStyle = "#0b0a0e"; g.lineWidth = 2.2; g.stroke(); }
    g.fillStyle = tercio; g.fillRect(sx0 + 30, sAsiento + 28, sx1 - sx0 - 60, sBase - sAsiento - 30); g.strokeStyle = "#0b0a0e"; g.strokeRect(sx0 + 30, sAsiento + 28, sx1 - sx0 - 60, sBase - sAsiento - 30);
    g.fillStyle = "rgba(0,0,0,0.18)"; g.fillRect(sx0 + 30, sBase - 22, sx1 - sx0 - 60, 20);
    // brazos del sofá
    for (const [x, s] of [[sx0, 1], [sx1, -1]]) {
      g.beginPath(); g.moveTo(x, sBase - 4); g.lineTo(x, sAsiento - 30); g.quadraticCurveTo(x, sAsiento - 62, x + s * 34, sAsiento - 62); g.quadraticCurveTo(x + s * 66, sAsiento - 62, x + s * 66, sAsiento - 30); g.lineTo(x + s * 66, sBase - 4); g.closePath();
      g.fillStyle = tercio; g.fill(); g.strokeStyle = "#0b0a0e"; g.lineWidth = 2.6; g.stroke();
      g.fillStyle = tercioL; g.beginPath(); g.ellipse(x + s * 33, sAsiento - 50, 26, 9, 0, 0, TAU); g.fill();
    }
    // cojines decorativos en el sofá
    const cojin = (x, y, w, h, a, col, col2) => { g.save(); g.translate(x, y); g.rotate(a);
      g.beginPath(); g.moveTo(-w, -h); g.quadraticCurveTo(0, -h * 0.8, w, -h); g.quadraticCurveTo(w * 0.82, 0, w, h); g.quadraticCurveTo(0, h * 0.8, -w, h); g.quadraticCurveTo(-w * 0.82, 0, -w, -h); g.closePath();
      g.fillStyle = col; g.fill(); g.save(); g.clip(); g.fillStyle = col2; for (let k = -3; k <= 3; k++) g.fillRect(k * 12 - 3, -h, 6, 2 * h); g.restore();
      g.strokeStyle = "#0b0a0e"; g.lineWidth = 2.2; g.stroke(); g.restore(); };
    cojin(sx0 + 92, sAsiento - 36, 34, 30, -0.18, "#e98a3a", "rgba(255,255,255,0.18)");
    cojin(sx1 - 96, sAsiento - 34, 32, 30, 0.2, "#c9487a", "rgba(255,220,120,0.35)");
    // manta de punto sobre el brazo derecho
    g.fillStyle = "#f08a74"; g.beginPath(); g.moveTo(sx1 - 52, sAsiento - 60); g.quadraticCurveTo(sx1 + 4, sAsiento - 76, sx1 + 30, sAsiento - 54); g.lineTo(sx1 + 40, sBase - 26); g.lineTo(sx1 + 2, sBase - 18); g.quadraticCurveTo(sx1 - 6, sAsiento, sx1 - 52, sAsiento - 60); g.closePath(); g.fill();
    g.strokeStyle = "rgba(160,50,40,0.5)"; g.lineWidth = 2; for (let k = 0; k < 5; k++) { g.beginPath(); g.moveTo(sx1 - 30 + k * 12, sAsiento - 60 + k * 2); g.lineTo(sx1 - 6 + k * 9, sBase - 22); g.stroke(); }
    g.strokeStyle = "#0b0a0e"; g.lineWidth = 2.2; g.beginPath(); g.moveTo(sx1 - 52, sAsiento - 60); g.quadraticCurveTo(sx1 + 4, sAsiento - 76, sx1 + 30, sAsiento - 54); g.lineTo(sx1 + 40, sBase - 26); g.lineTo(sx1 + 2, sBase - 18); g.quadraticCurveTo(sx1 - 6, sAsiento, sx1 - 52, sAsiento - 60); g.closePath(); g.stroke();
    // rodapié
    g.fillStyle = "#f2e2c2"; g.fillRect(X0, PARED - 12, X1 - X0, 14); g.fillStyle = "#0b0a0e"; g.fillRect(X0, PARED - 13, X1 - X0, 2); g.fillRect(X0, PARED + 1, X1 - X0, 2);
    // suelo de tarima
    const su = g.createLinearGradient(0, PARED, 0, H + 70); su.addColorStop(0, "#8a5634"); su.addColorStop(1, "#5a331d");
    g.fillStyle = su; g.fillRect(X0, PARED + 2, X1 - X0, H + 70 - PARED);
    g.strokeStyle = "rgba(0,0,0,0.25)"; g.lineWidth = 2;
    for (let i = -10; i < 20; i++) { const x0 = i * 70; g.beginPath(); g.moveTo(x0, PARED + 2); g.lineTo(x0 + (x0 - 512) * 1.1, H + 70); g.stroke(); }
    for (const y of [PARED + 26, PARED + 60, PARED + 108]) { g.strokeStyle = "rgba(0,0,0,0.12)"; g.beginPath(); g.moveTo(X0, y); g.lineTo(X1, y); g.stroke(); }
    // mesita con bol de palomitas y una taza (derecha)
    const mx = 828;
    g.fillStyle = "#5b3a24"; g.fillRect(mx, 400, 92, 10); g.fillRect(mx + 8, 410, 7, PARED + 20 - 410); g.fillRect(mx + 77, 410, 7, PARED + 20 - 410);
    g.strokeStyle = "#0b0a0e"; g.lineWidth = 2; g.strokeRect(mx, 400, 92, 10);
    g.fillStyle = "#e84b4b"; g.beginPath(); g.moveTo(mx + 14, 372); g.lineTo(mx + 60, 372); g.lineTo(mx + 54, 400); g.lineTo(mx + 20, 400); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#fff"; for (let k = 0; k < 3; k++) g.fillRect(mx + 22 + k * 12, 374, 5, 25);
    for (let k = 0; k < 9; k++) { const px = mx + 18 + hash(k + 3) * 38, py = 368 - hash(k + 4) * 10; g.fillStyle = "#fff6d6"; g.beginPath(); g.arc(px, py, 5, 0, TAU); g.fill(); g.strokeStyle = "#c9a35a"; g.lineWidth = 1; g.stroke(); }
    g.fillStyle = "#6fb1d6"; g.fillRect(mx + 66, 380, 16, 20); g.strokeStyle = "#0b0a0e"; g.lineWidth = 2; g.strokeRect(mx + 66, 380, 16, 20); g.beginPath(); g.arc(mx + 84, 390, 5, -1.4, 1.4); g.stroke();
    // montón de cojines y saco de dormir (derecha, en el suelo)
    g.save(); g.translate(0, 0);
    g.fillStyle = "#3f6fb0"; g.beginPath(); g.ellipse(960, PARED + 30, 70, 26, 0, 0, TAU); g.fill(); g.strokeStyle = "#0b0a0e"; g.lineWidth = 2.4; g.stroke();
    g.strokeStyle = "rgba(0,0,0,0.25)"; g.lineWidth = 2; for (let k = 0; k < 4; k++) { g.beginPath(); g.ellipse(960, PARED + 30, 70 - k * 15, 26 - k * 5, 0, -0.4, 0.9); g.stroke(); }
    g.restore();
    cojin(940, PARED - 8, 40, 26, -0.12, "#f2c14e", "rgba(255,255,255,0.25)");
    cojin(986, PARED - 40, 36, 24, 0.15, "#7d4fb0", "rgba(255,255,255,0.18)");
    cojin(950, PARED - 66, 32, 22, -0.08, "#ef6f6c", "rgba(255,255,255,0.22)");
    // alfombra granate con cenefa
    g.save(); g.translate(512, 566); g.scale(1, 0.13);
    g.fillStyle = "#8c1f2c"; g.beginPath(); g.arc(0, 0, 470, 0, TAU); g.fill();
    g.strokeStyle = "#f1d7a2"; g.lineWidth = 16; g.beginPath(); g.arc(0, 0, 440, 0, TAU); g.stroke();
    g.strokeStyle = "#e6a640"; g.lineWidth = 6; g.beginPath(); g.arc(0, 0, 410, 0, TAU); g.stroke();
    g.fillStyle = "rgba(241,215,162,0.5)"; for (let k = 0; k < 24; k++) { const a = k / 24 * TAU; g.beginPath(); g.arc(Math.cos(a) * 380, Math.sin(a) * 380, 9, 0, TAU); g.fill(); }
    g.fillStyle = "rgba(0,0,0,0.15)"; g.beginPath(); g.arc(0, 0, 300, 0, TAU); g.fill();
    g.strokeStyle = "#0b0a0e"; g.lineWidth = 6; g.beginPath(); g.arc(0, 0, 470, 0, TAU); g.stroke();
    g.restore();
    // viñeta
    const v = g.createRadialGradient(512, 320, 300, 512, 320, 780); v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(20,8,30,0.55)");
    g.fillStyle = v; g.fillRect(X0, Y0, X1 - X0, H + 140);
    return c;
  }
  // guirnalda de bombillitas (parpadean)
  const BOMB = (() => { const out = [], cols = ["#ffd56a", "#ff8f7a", "#9fe0ff", "#b6ff9a", "#ffb3e6"];
    for (let i = 0; i < 30; i++) { const x = -20 + i * 36, tramoI = Math.floor((x + 20) / 216), xa = -20 + tramoI * 216, u = (x - xa) / 216;
      out.push({ x, y: 22 + 28 * Math.sin(Math.PI * u), col: cols[i % 5], ph: hash(i + 77) * TAU }); }
    return out; })();
  function guirnalda(g, t) {
    g.save(); g.strokeStyle = "#2a241e"; g.lineWidth = 1.6;
    g.beginPath(); for (let k = 0; k < 6; k++) { const xa = -20 + k * 216; g.moveTo(xa, 22); g.quadraticCurveTo(xa + 108, 22 + 56, xa + 216, 22); } g.stroke();
    for (const b of BOMB) {
      const br = 0.75 + 0.25 * Math.sin(t * 2.6 + b.ph);
      const rg = g.createRadialGradient(b.x, b.y + 6, 1, b.x, b.y + 6, 16); rg.addColorStop(0, b.col); rg.addColorStop(1, "rgba(255,255,255,0)");
      g.globalAlpha = 0.35 * br; g.fillStyle = rg; g.fillRect(b.x - 16, b.y - 10, 32, 32); g.globalAlpha = 1;
      g.fillStyle = "#2a241e"; g.fillRect(b.x - 2, b.y, 4, 4);
      g.fillStyle = b.col; g.globalAlpha = 0.65 + 0.35 * br; g.beginPath(); g.ellipse(b.x, b.y + 8, 3.6, 5, 0, 0, TAU); g.fill(); g.globalAlpha = 1;
    }
    g.restore();
  }

  /* ---------- efectos ---------- */
  function estrellaPuntas(g, x, y, r, puntas, rot0, rel = 0.45) {
    g.beginPath(); for (let i = 0; i < puntas * 2; i++) { const a = rot0 + i * Math.PI / puntas, rr = i % 2 ? r * rel : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath();
  }
  function impacto(g, t, t0, x, y, tam) {
    const k = fase(t, t0, t0 + 0.28); if (k <= 0 || k >= 1) return;
    g.save(); g.globalAlpha = 1 - k;
    estrellaPuntas(g, x, y, tam * (0.6 + 0.8 * salida(k)), 10, 0.3, 0.45); g.fillStyle = "#fff4b8"; g.fill(); g.lineWidth = 2.5; g.strokeStyle = "#0b0a0e"; g.stroke();
    g.restore();
  }
  // nube de plumón: un racimo de bolas blancas que se hincha y se desvanece (una sola silueta)
  function nube(g, t, t0, x, y, tam, dir = null, dur = 0.6) {
    const k = fase(t, t0, t0 + dur); if (k <= 0 || k >= 1) return;
    const bolas = [], cre = salida(Math.min(1, k * 2.5));
    for (let i = 0; i < 14; i++) {
      const a = dir === null ? i / 14 * TAU + hash(i + 3) : dir + (hash(i + 5) - 0.5) * (0.5 + 0.9 * (i / 14));
      const d = tam * (0.1 + 0.55 * salida(k)) * (dir === null ? 0.3 + hash(i + 9) * 0.7 : 0.2 + 2.6 * i / 14);
      const r = tam * (0.3 + 0.2 * hash(i + 11)) * (0.5 + 0.6 * cre);
      bolas.push({ x: x + Math.cos(a) * d, y: y + Math.sin(a) * d - 12 * k, r });
    }
    g.save(); g.globalAlpha = Math.pow(1 - k, 1.6);
    g.fillStyle = "#9a90aa"; for (const b of bolas) { g.beginPath(); g.arc(b.x, b.y, b.r + 2, 0, TAU); g.fill(); }
    g.fillStyle = "#ffffff"; for (const b of bolas) { g.beginPath(); g.arc(b.x, b.y, b.r, 0, TAU); g.fill(); }
    g.fillStyle = "#eee8f5"; for (const b of bolas) { g.beginPath(); g.arc(b.x + b.r * 0.12, b.y + b.r * 0.3, b.r * 0.62, 0.1, Math.PI - 0.1); g.fill(); }
    g.restore();
  }
  // estelas del giro
  function estelas(g, t, pg) {
    const k = campana(t, T.giro0 + 0.03, T.giro1 - 0.03); if (k <= 0.02) return;
    const o = G.aPantalla(pg, pg.pelvis), th = giroG(t);
    g.save(); g.lineCap = "round";
    for (const [dy, rx, ry] of [[-150, 92, 16], [-60, 108, 18], [40, 96, 14]]) {
      g.strokeStyle = `rgba(255,255,255,${0.7 * k})`; g.lineWidth = 3;
      const a0 = th * 1.2 + dy * 0.01;
      g.beginPath(); g.ellipse(o.x, o.y + dy, rx, ry, 0, a0, a0 + 2.2); g.stroke();
      g.globalAlpha = 0.5; g.beginPath(); g.ellipse(o.x, o.y + dy, rx * 0.9, ry * 0.9, 0, a0 + Math.PI, a0 + Math.PI + 1.6); g.stroke(); g.globalAlpha = 1;
    }
    g.restore();
  }
  // silbido de la almohada al pasar
  function silbido(g, t, st) {
    const k = campana(t, T.swing0 + 0.02, T.swing1 + 0.06); if (k <= 0.02 || !st) return;
    const F = marco(st), e = F.M(0.9, 0), a = st.a;
    g.save(); g.strokeStyle = `rgba(255,255,255,${0.8 * k})`; g.lineWidth = 2.6; g.lineCap = "round";
    const A = { x: st.x, y: st.y }, R = Math.hypot(e.x - A.x, e.y - A.y);
    for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(A.x, A.y, R - 14 + i * 14, a - 0.9 + i * 0.1, a - 0.15); g.stroke(); }
    g.restore();
  }
  // gotas de «qué ha pasado»
  function lineasSusto(g, t, t0, t1, x, y) {
    const k = campana(t, t0, t1); if (k <= 0.02) return;
    g.save(); g.strokeStyle = `rgba(30,20,40,${0.8 * k})`; g.lineWidth = 3; g.lineCap = "round";
    for (let i = -1; i <= 1; i++) { const a = -Math.PI / 2 + i * 0.5; g.beginPath(); g.moveTo(x + Math.cos(a) * 64, y + Math.sin(a) * 64); g.lineTo(x + Math.cos(a) * 82, y + Math.sin(a) * 82); g.stroke(); }
    g.restore();
  }
  // tembleque de la nariz (ah… ah…)
  function picor(g, t, pg) {
    const k = tramo(t, T.ah1 - 0.3, T.ah1) * (1 - fase(t, T.achis - 0.02, T.achis + 0.02)); if (k <= 0.02) return;
    const N = cabG(pg, NARIZ_G);
    g.save(); g.strokeStyle = `rgba(30,20,40,${0.7 * k})`; g.lineWidth = 2.2; g.lineCap = "round";
    for (let i = 0; i < 3; i++) { const a = -0.9 + i * 0.6, j = 2 * Math.sin(t * 40 + i); g.beginPath(); g.moveTo(N.x + 18 + Math.cos(a) * (14 + j), N.y + Math.sin(a) * (14 + j)); g.lineTo(N.x + 18 + Math.cos(a) * (24 + j), N.y + Math.sin(a) * (24 + j)); g.stroke(); }
    g.restore();
  }

  /* ---------- cámara ---------- */
  function camara(t) {
    const z = tramo(t, T.prep0, T.prep1) * (1 - tramo(t, T.swing0, T.swing1 + 0.1)) * 0.05 + tramo(t, T.ah1 - 0.4, T.ah3) * (1 - tramo(t, T.achis + 0.4, T.achis + 1.2)) * 0.05;
    return { k: 1 + z, x: lerp(512, 470, z / 0.05 * tramo(t, T.prep0, T.prep1) * (1 - tramo(t, T.swing0, T.swing1))), y: 310 };
  }
  function sombra(g, x, ancho, alfa, y = SUELO + 2) { g.save(); g.fillStyle = `rgba(30,5,10,${alfa})`; g.beginPath(); g.ellipse(x, y, ancho, 8, 0, 0, TAU); g.fill(); g.restore(); }

  function dibujaPlumaLibre(g, f, t) {
    const q = posPluma(f, t); if (!q) return;
    pluma(g, q.x, q.y, q.r, f.largo, f.v, 1, q.posada ? lerp(1, 0.7, q.posada) : 1);
  }

  class GuerraAlmohadas extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !D.listo()) return;
      if (!fondo) fondo = creaFondo();
      if (!PL) PL = creaPlumasEscena();
      const P = pose(t), pg = P.g, pd = P.d;
      const luz = tramo(t, NEGRO_INICIO, 0.8, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t);
      const tb = (t >= T.zas ? 5 * Math.exp(-(t - T.zas) * 9) : 0) + (t >= T.revienta ? 7 * Math.exp(-(t - T.revienta) * 7) : 0) + (t >= T.achis ? 6 * Math.exp(-(t - T.achis) * 8) : 0);
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      if (tb > 0.05) g.translate(ruido(t * 45) * tb, ruido(t * 45 + 13) * tb * 0.7);
      CAM = g.getTransform();
      g.drawImage(fondo, -60, -70);
      guirnalda(g, t);
      // sombras
      const xg = pg.giro ? pg.giro.px : G.aPantalla(pg, pg.pelvis).x;
      sombra(g, xg + 6, 70, 0.32);
      sombra(g, D.aPantalla(pd, pd.pelvis).x - 8, 66 + 10 * campana(t, T.agacha0, T.sube1), 0.32);
      // plumas del fondo (por detrás de los personajes)
      for (const f of PL.libres) if (f.capa === "atras") dibujaPlumaLibre(g, f, t);
      // almohadas que van por detrás de su dueño
      const objeto = (st, funda, giro) => (gg, tt) => { gg.save(); gg.setTransform(CAM);
        if (giro) { gg.translate(giro.px, 0); gg.scale(giro.c, 1); gg.translate(-giro.px, 0); }
        if (funda) dibFunda(gg, st, tt); else dibAlmohada(gg, st); gg.restore(); };
      if (P.aD && !P.aD.detras) pd.manoCerca.objeto = objeto(P.aD);
      if (P.aG) pg.manoCerca.objeto = objeto(P.aG, false, pg.giro);
      if (P.fG) pg.manoCerca.objeto = objeto(P.fG, true);
      const dibD = () => { if (P.aD && P.aD.detras) { g.save(); g.setTransform(CAM); dibAlmohada(g, P.aD); g.restore(); } D.dibujar(g, pd, t); };
      const dibG = () => {
        g.save();
        if (pg.giro) { g.translate(pg.giro.px, 0); g.scale(pg.giro.c, 1); g.translate(-pg.giro.px, 0); }
        G.dibujar(g, pg, t);
        g.restore();
      };
      // almohada de Deivi, tirada por detrás (vuela por detrás de él y cae en la alfombra)
      if (P.sD) dibAlmohada(g, P.sD);
      if (t < 3.0) { dibG(); dibD(); } else { dibD(); dibG(); }
      // plumas que vuelan hacia su sitio (encima de todo)
      for (const e of PL.cabG) { const q = vueloPegada(e, t, cabG(pg, { x: e.q[0], y: e.q[1] }), e.q[2] + pg.cabeza.ang); if (q) pluma(g, q.x, q.y, q.r, q.largo, q.v); }
      for (const e of PL.troncoG) { const q = vueloPegada(e, t, pantG(pg, G.tronco(pg)({ x: e.q[0], y: e.q[1] })), e.q[2] + pg.torso); if (q) pluma(g, q.x, q.y, q.r, q.largo, q.v); }
      PL.cabD.forEach((e, i) => { const q = vueloD(e, i, t, pd); if (q) pluma(g, q.x, q.y, Math.PI - q.r, q.largo, q.v); });
      // plumas del frente
      for (const f of PL.libres) if (f.capa === "delante") dibujaPlumaLibre(g, f, t);
      const pn = plumaNariz(t, pg); if (pn && !pn.enNariz) pluma(g, pn.x, pn.y, pn.r, 20, 2, 1, pn.posada ? lerp(1, 0.7, pn.posada) : 1);
      const ps = plumaSoplada(t, pd); if (ps) pluma(g, ps.x, ps.y, ps.r, 18, 3, 1, ps.posada ? lerp(1, 0.7, ps.posada) : 1);
      // efectos
      silbido(g, t, P.aG);
      estelas(g, t, pg);
      const ptoGolpe = cabG(pg, { x: 900, y: 300 });
      impacto(g, t, T.golpe, ptoGolpe.x + 6, ptoGolpe.y - 10, 22);
      nube(g, t, T.golpe, ptoGolpe.x + 4, ptoGolpe.y - 12, 26, null, 0.45);
      const top = cabG(pg, { x: 820, y: 220 });
      impacto(g, t, T.zas, top.x + 10, top.y - 16, 26);
      nube(g, t, T.revienta - 0.025, PL.centro.x, PL.centro.y, 70, null, 0.45);
      impacto(g, t, T.revienta - 0.025, PL.centro.x, PL.centro.y, 46);
      nube(g, t, T.achis, PL.boca.x + Math.cos(PL.angAchis) * 46, PL.boca.y + Math.sin(PL.angAchis) * 46, 30, PL.angAchis, 0.6);
      lineasSusto(g, t, T.revienta + 0.25, T.revienta + 0.9, cabG(pg, { x: 820, y: 520 }).x, cabG(pg, { x: 820, y: 520 }).y);
      picor(g, t, pg);
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00067", nombre: "Guillermo y Deivi · La guerra de almohadas", crear: () => new GuerraAlmohadas() });
  window.__A2D_00067 = { pose, T, DUR };
})();
