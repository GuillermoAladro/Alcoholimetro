"use strict";
/*
 * 00224 · EL CASCO GRANDE
 *
 * Animación del banco. Empieza y acaba en negro.
 * En el vestuario del parque, Marcos se quita el casco y se lo deja a Guillermo, que se lo prueba… y se le cae hasta
 * la nariz (¡CLONK!). Anda a ciegas con los brazos por delante y se choca con todo: con las taquillas (¡CLANG!, se abre
 * una y sale un patito de goma), con Marcos (¡BONK!) y con la escalera, que se tambalea (¡TOING!). Marcos se lo quita,
 * le aprieta la ruedecita por dentro (¡TE QUEDA GRANDE!) y se lo coloca bien: Guillermo saluda orgulloso.
 */
(() => {
const CT = cacheTexto();
const ESC = 1.4;
const XG0 = 410, XM0 = 650;
const T_QUITA = 0.45, T_DA = 1.05, T_COGE = 1.45, T_PONE = 1.75, T_CLONK = 2.05;
const T_IZQ = 2.55, T_CLANG = 3.3, T_DER = 3.55, T_BONK = 4.3, T_SIGUE = 4.6, T_TOING = 5.45;
const T_VIENE = 5.85, T_LEVANTA = 6.35, T_AJUSTA = 6.7, T_COLOCA = 7.35, T_SALUDA = 7.75, T_FIN = 9.7, DUR = 10.4;
const XLADO = 182, XESC = 935;

class CascoGrande extends Escena {
  constructor() {
    super(DUR);
    this.p = new Parts(300);
  }
  xG() {
    const t = this.t;
    if (t < T_IZQ) return XG0;
    if (t < T_CLANG) return lerp(XG0, XLADO + 70, tramo(t, T_IZQ, T_CLANG));
    if (t < T_DER) return lerp(XLADO + 70, XLADO + 110, eOut(tramo(t, T_CLANG, T_CLANG + 0.2)));
    if (t < T_BONK) return lerp(XLADO + 110, XM0 - 100, tramo(t, T_DER, T_BONK));
    if (t < T_SIGUE) return lerp(XM0 - 100, XM0 - 140, eOut(tramo(t, T_BONK, T_BONK + 0.2)));
    if (t < T_TOING) return lerp(XM0 - 140, XESC - 95, eInOut(tramo(t, T_SIGUE, T_TOING)));
    return lerp(XESC - 95, 826, eOut(tramo(t, T_TOING, T_TOING + 0.3)));
  }
  xM() {
    const t = this.t;
    return lerp(XM0, 688, eInOut(tramo(t, T_VIENE, T_LEVANTA - 0.25)));
  }
  /** Guillermo se inclina hacia Marcos para que le quite y le ponga el casco. */
  reverencia() {
    const t = this.t;
    return -0.2 * (eInOut(tramo(t, T_LEVANTA - 0.45, T_LEVANTA - 0.15)) * (1 - eInOut(tramo(t, T_LEVANTA + 0.2, T_LEVANTA + 0.5)))
      + eInOut(tramo(t, T_COLOCA - 0.3, T_COLOCA - 0.05)) * (1 - eInOut(tramo(t, T_COLOCA + 0.3, T_COLOCA + 0.55))));
  }
  /** El casco caído en la cabeza de Guillermo: { s escala, dx, dy } en píxeles de la cara (1, 0, 0 = bien puesto). */
  casco() {
    const t = this.t;
    if (t < T_PONE || t > T_LEVANTA + 0.1) return null;
    if (t < T_CLONK) { const u = eIn(tramo(t, T_PONE, T_CLONK)); return { s: 1.38, dx: -3, dy: lerp(-70, 34, u) }; }
    return { s: 1.38, dx: -3, dy: 34 };
  }
  /** Centro del casco en la pantalla, si estuviera en la cabeza de Guillermo con { s, dx, dy }. */
  cascoEnCabezaPant(mG, G, cs) {
    const p = IMG["cara_" + G.cara];
    if (!p) return null;
    const R = RIG, e = R.escCara, h = p.h * e, ax = p.ax != null ? p.ax : p.w / 2;
    const cx = p.w / 2, cy = 20, k = p.w / 88;
    const fx = cx + cs.dx + (46 * k - cx) * cs.s, fy = cy + cs.dy + (15 * k - cy) * cs.s;
    const v = rot2([(fx - ax) * e, fy * e + R.barbilla - R.cuello[1] - h], G.rc || 0);
    const q = aPant(mG, [R.cuello[0] + v[0], R.cuello[1] + v[1]]);
    return { x: q[0], y: q[1], s: cs.s * k * e * ESC };
  }
  /** El casco en la pantalla mientras Marcos lo quita, lo ajusta y lo vuelve a poner: { x, y, s, rot } o null. */
  cascoPant(mG, G, gG, mM) {
    const t = this.t;
    if (t < T_LEVANTA - 0.4 || t > T_COLOCA + 0.25) return null;
    const caido = this.cascoEnCabezaPant(mG, G, { s: 1.38, dx: -3, dy: 34 }), puesto = this.cascoEnCabezaPant(mG, G, { s: 1, dx: 0, dy: 0 });
    if (!caido) return null;
    const rot = gG + (G.rc || 0);
    const pecho = aPant(mM, [37, 112]);
    const sAj = lerp(caido.s, puesto.s, eInOut(tramo(t, T_AJUSTA + 0.05, T_COLOCA - 0.15)));
    if (t < T_LEVANTA + 0.1) return { x: caido.x, y: caido.y, s: caido.s, rot };
    if (t < T_AJUSTA) {
      const u = eInOut(tramo(t, T_LEVANTA + 0.1, T_AJUSTA));
      return { x: lerp(caido.x, pecho[0], u), y: lerp(caido.y, pecho[1], u) + Math.sin(u * Math.PI) * 40, s: caido.s, rot: lerp(rot, 0, u) };
    }
    if (t < T_COLOCA - 0.05) {
      const j = Math.sin(t * 40) * 0.08 * (1 - tramo(t, T_COLOCA - 0.25, T_COLOCA - 0.05));
      return { x: pecho[0], y: pecho[1], s: sAj, rot: j };
    }
    const u = eInOut(tramo(t, T_COLOCA - 0.05, T_COLOCA + 0.22));
    return { x: lerp(pecho[0], puesto.x, u), y: lerp(pecho[1], puesto.y, u) + Math.sin(u * Math.PI) * 30, s: lerp(sAj, puesto.s, u), rot: lerp(0, rot, u) };
  }
  ciego() { const t = this.t; return t > T_CLONK - 0.05 && t < T_LEVANTA + 0.1; }
  poses() {
    const t = this.t, xg = this.xG(), xm = this.xM();
    const G = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [70, 158], manoI: [9, 160] };
    const M = { quien: "bombero", cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [67, 152], manoI: [6, 152] };
    let yg = PIES, gG = 0, gM = 0, ym = PIES;
    const choque = (t0) => t > t0 && t < t0 + 0.5 ? Math.exp(-(t - t0) * 6) * Math.sin((t - t0) * 40) : 0;
    // ---------------- Marcos
    if (t < T_DA) {
      // se quita el casco
      const k = eInOut(tramo(t, T_QUITA, T_QUITA + 0.3));
      M.manoD = mezcla([67, 152], [62, 12], k); M.manoI = mezcla([6, 152], [12, 12], k); M.brazoIDelante = true;
      M.casco = t < T_QUITA + 0.3; M.cara = t < T_QUITA + 0.3 ? "sonrisa" : "risa"; M.rc = t > T_QUITA + 0.3 ? 0.08 * Math.sin(t * 18) : 0;
      if (t > T_QUITA + 0.35) { const k2 = eInOut(tramo(t, T_QUITA + 0.35, T_DA)); M.manoD = mezcla([62, 12], [70, 96], k2); M.manoI = mezcla([12, 12], [6, 152], k2); M.brazoIDelante = false; }
    } else if (t < T_COGE + 0.1) {
      // se lo ofrece
      M.casco = false; M.cara = "guino"; M.rc = 0.1;
      const k = eInOut(tramo(t, T_DA, T_COGE - 0.1));
      M.manoD = [70, 96]; M.manoI = mezcla([6, 152], [-14, 104], k);
    } else {
      M.casco = false;
      M.cara = t < T_CLONK + 0.15 ? "sonrisa" : "risa"; M.rc = 0.12;
      if (t > T_CLONK + 0.15 && t < T_BONK - 0.3) {
        const s = Math.sin(t * 22); M.brazoIDelante = true; M.manoD = [46, 132 + 3 * s]; M.manoI = [26, 132 - 3 * s];
      }
      if (t > T_BONK - 0.3 && t < T_VIENE) {
        M.cara = t < T_BONK ? "sorpresa" : t < T_BONK + 0.6 ? "dormido" : "risa";
        M.manoD = [86, 80]; M.manoI = [-14, 82]; gM = 0.14 * choque(T_BONK); M.rc = 0.18 * choque(T_BONK) + 0.1;
        if (t > T_TOING - 0.1) { M.cara = "sorpresa"; M.rc = -0.12; }
      }
      if (t > T_VIENE) {
        const w = andar((t - T_VIENE) * 13, 0.6);
        if (t < T_LEVANTA - 0.25) { M.piernaI = w.piernaI; M.piernaD = w.piernaD; ym += w.bote; }
        M.cara = "guino"; M.rc = -0.08;
        if (t > T_AJUSTA && t < T_COLOCA) { M.cara = "sonrisa"; M.rc = 0.1; }
        if (t > T_COLOCA + 0.3) { M.cara = t < 8.6 ? "risa" : "guino"; M.manoD = [80, 92]; M.manoI = [16, 140]; }
      }
    }
    // ---------------- Guillermo
    const anda = (a, b) => { if (t > a && t < b) { const w = andar((t - a) * 11, 0.7); G.piernaI = w.piernaI; G.piernaD = w.piernaD; yg += w.bote; } };
    if (t < T_COGE) {
      G.cara = t < T_DA ? "sonrisa" : "sorpresa"; G.rc = -0.1;
      if (t > T_DA + 0.15) { G.cara = "risa"; }
    } else if (t < T_CLONK) {
      // lo coge y se lo pone
      const k = eInOut(tramo(t, T_COGE - 0.1, T_COGE + 0.1)), k2 = eInOut(tramo(t, T_COGE + 0.1, T_PONE));
      G.manoD = mezcla(mezcla([70, 158], [70, 100], k), [64, -4], k2); G.manoI = mezcla(mezcla([9, 160], [18, 100], k), [14, -4], k2); G.brazoIDelante = true;
      G.cara = "risa";
      if (t > T_PONE) { const k3 = eIn(tramo(t, T_PONE, T_CLONK)); G.manoD = mezcla([64, -4], [66, 36], k3); G.manoI = mezcla([14, -4], [12, 36], k3); }
    } else if (this.ciego()) {
      // a ciegas: brazos por delante
      G.cara = "sorpresa"; G.rc = 0.08 * Math.sin(t * 4);
      G.manoD = [86 + 6 * Math.sin(t * 9), 94]; G.manoI = [-8 - 6 * Math.sin(t * 9 + 1), 96]; G.brazoIDelante = false;
      if (t < T_IZQ) { G.manoD = [66, 36]; G.manoI = [12, 36]; G.brazoIDelante = true; }
      anda(T_IZQ, T_CLANG); anda(T_DER, T_BONK); anda(T_SIGUE, T_TOING);
      for (const c of [T_CLANG, T_BONK, T_TOING]) { const ch = choque(c); gG += 0.12 * ch; if (t > c && t < c + 0.25) { G.cara = "borracho"; yg -= 10 * Math.sin(tramo(t, c, c + 0.25) * Math.PI); } }
      if (t > T_TOING + 0.3) { G.cara = "borracho"; G.manoD = [80, 120]; G.manoI = [0, 120]; }
    } else {
      G.cara = t < T_AJUSTA ? (Math.sin(t * 9) > 0.6 ? "dormido" : "sorpresa") : t < T_COLOCA ? "sonrisa" : "risa"; G.rc = -0.1;
      if (t > T_COLOCA - 0.3 && t < T_COLOCA + 0.3) G.cara = "dormido";
      if (t > T_SALUDA) {
        // saluda orgulloso
        const k = eOut(tramo(t, T_SALUDA, T_SALUDA + 0.25));
        G.manoD = mezcla([70, 158], [66, 30], k); G.manoI = [9, 160]; G.cara = t < 8.7 ? "guino" : "risa"; G.rc = -0.06;
      }
    }
    // el casco: en las manos de Marcos, en las de Guillermo o en la cabeza
    if (t > T_QUITA + 0.3 && t < T_COGE) {
      M.objD2 = (g) => {
        const m = t < T_DA ? mezcla(M.manoD, M.manoI, 0.5) : M.manoI;
        g.save(); g.translate(m[0], m[1] - 18); g.scale(0.6, 0.6); g.translate(-46, -26); cascoBombero(g, 88); g.restore();
      };
    } else if (t >= T_COGE && t < T_PONE) {
      G.objD2 = (g) => {
        const m = mezcla(G.manoD, G.manoI, 0.5);
        g.save(); g.translate(m[0], m[1] - 20); g.scale(0.62, 0.62); g.translate(-46, -26); cascoBombero(g, 88); g.restore();
      };
    }
    const cs = this.casco();
    if (t > T_COLOCA + 0.25) G.casco = true;             // ya bien puesto: el casco del motor
    else if (cs) G.objD = (g) => this.cascoEnCabeza(g, G, cs);
    gG += this.reverencia();
    const mG = matAv(xg, yg, ESC, gG), mM = matAv(xm, ym, ESC, gM);
    // Marcos coge el casco por el ala con las dos manos, lo ajusta y lo vuelve a poner
    const hs = this.cascoPant(mG, G, gG, mM);
    if (hs) {
      const inv = mM.inverse(), d = 50 * hs.s;
      const a = inv.transformPoint(new DOMPoint(hs.x + d, hs.y + 30 * hs.s)), b = inv.transformPoint(new DOMPoint(hs.x - d, hs.y + 30 * hs.s));
      const k = eInOut(tramo(t, T_LEVANTA - 0.4, T_LEVANTA - 0.1)) * (1 - eInOut(tramo(t, T_COLOCA + 0.2, T_COLOCA + 0.25)));
      M.manoD = mezcla([67, 150], [a.x, a.y], k); M.manoI = mezcla([6, 150], [b.x, b.y], k);
      M.brazoIDelante = M.manoI[0] < 30 || M.manoI[1] > 96;      // si cruzaría por delante de la cara, va por detrás
    }
    return { G, M, mG, mM, hs };
  }
  /** Casco en la cabeza de Guillermo, en las coordenadas de su cara (como lo pone el motor, pero más grande y caído). */
  cascoEnCabeza(g, G, cs) {
    const p = IMG["cara_" + G.cara];
    if (!p) return;
    const R = RIG, e = R.escCara, h = p.h * e, ax = p.ax != null ? p.ax : p.w / 2;
    g.save();
    g.translate(R.cuello[0], R.cuello[1]); g.rotate(G.rc || 0);
    g.translate(-ax * e, R.barbilla - R.cuello[1] - h); g.scale(e, e);
    // escalado alrededor del centro del casco
    const cx = p.w / 2, cy = 20;
    g.translate(cx + cs.dx, cy + cs.dy); g.scale(cs.s, cs.s); g.translate(-cx, -cy);
    cascoBombero(g, p.w);
    g.restore();
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    const e = this.poses();
    const golpe = (k, x, y, f) => this.una(k, true, () => {
      temblar(f, 0.3);
      p.nueva(P.DESTELLO, x, y, 0, 0, 0.3, 160);
      for (let i = 0; i < 10; i++) { const a = azar(0, 6.283), v = azar(120, 280); p.nueva(P.CHISPA, x, y, Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.6), azar(5, 8)); }
    });
    if (t > T_CLONK) golpe("clonk", ...aPant(e.mG, [39, 10]), 8);
    if (t > T_CLANG) golpe("clang", XLADO + 6, 330, 14);
    if (t > T_BONK) golpe("bonk", XM0 - 50, 330, 12);
    if (t > T_TOING) golpe("toing", XESC - 20, 330, 12);
    if (t > T_COLOCA + 0.22) golpe("clic", ...aPant(e.mG, [39, 0]), 6);
    this.una("conf", t > T_SALUDA, () => { for (let i = 0; i < 50; i++) p.nueva(P.CONFETI, azar(80, 944), azar(-60, 0), azar(-40, 40), azar(40, 160), azar(2, 3), azar(9, 14), (Math.random() * 5) | 0); });
    p.suelo = () => PIES + 4;
    p.actualizar(dt);
  }
  fondoFijo() {
    if (CT.has("fondo")) return CT.get("fondo");
    const c = lienzoNuevo(W + 120, H + 120), g = c.getContext("2d");
    g.translate(60, 60);
    const gw = g.createLinearGradient(0, -60, 0, 548);
    gw.addColorStop(0, "#c7b89a"); gw.addColorStop(1, "#e6dcc6");
    g.fillStyle = gw; g.fillRect(-60, -60, W + 120, 620);
    // azulejos abajo
    g.fillStyle = "#9fb8c8"; g.fillRect(-60, 380, W + 120, 170);
    g.strokeStyle = "rgba(255,255,255,.4)"; g.lineWidth = 2;
    for (let y = 380; y < 548; y += 28) { g.beginPath(); g.moveTo(-60, y); g.lineTo(W + 60, y); g.stroke(); }
    for (let x = -60; x < W + 60; x += 28) { g.beginPath(); g.moveTo(x, 380); g.lineTo(x, 548); g.stroke(); }
    // perchas con chaquetones
    for (const x of [470, 560]) {
      g.fillStyle = "#2a2e33"; g.fillRect(x - 3, 150, 6, 16);
      g.fillStyle = "#26365e"; g.beginPath(); g.moveTo(x - 34, 176); g.lineTo(x + 34, 176); g.lineTo(x + 40, 330); g.lineTo(x - 40, 330); g.closePath(); g.fill();
      g.fillStyle = "#e5c22a"; g.fillRect(x - 38, 262, 76, 8); g.fillStyle = "#d0d6da"; g.fillRect(x - 38, 272, 76, 5);
      g.fillStyle = "#1b2440"; g.beginPath(); g.moveTo(x - 10, 166); g.lineTo(x + 10, 166); g.lineTo(x, 196); g.closePath(); g.fill();
    }
    // ventanuco
    g.fillStyle = "#2a2e33"; rectR(g, 700, 90, 150, 90, 8); g.fill();
    const gv = g.createLinearGradient(0, 96, 0, 174); gv.addColorStop(0, "#bfe6ff"); gv.addColorStop(1, "#6fb0dc");
    g.fillStyle = gv; rectR(g, 707, 97, 136, 76, 5); g.fill();
    // suelo
    const gs = g.createLinearGradient(0, 548, 0, H + 60);
    gs.addColorStop(0, "#8a8f96"); gs.addColorStop(1, "#4a4f56");
    g.fillStyle = gs; g.fillRect(-60, 548, W + 120, H);
    g.fillStyle = "rgba(255,255,255,.2)"; g.fillRect(-60, 548, W + 120, 2);
    // banco
    g.fillStyle = "#8a5a2a"; rectR(g, 300, 500, 300, 14, 4); g.fill();
    g.fillStyle = "#5e3a18"; g.fillRect(320, 514, 12, 34); g.fillRect(568, 514, 12, 34);
    CT.set("fondo", c);
    return c;
  }
  /** Taquillas a la izquierda (la de delante se abre al chocar). */
  taquillas(g) {
    const t = this.t;
    const tiemb = t > T_CLANG && t < T_CLANG + 0.6 ? Math.exp(-(t - T_CLANG) * 7) * Math.sin((t - T_CLANG) * 45) * 4 : 0;
    g.save(); g.translate(tiemb, 0);
    for (let i = 0; i < 3; i++) {
      const x = -30 + i * 72;
      const gr = g.createLinearGradient(x, 0, x + 70, 0);
      gr.addColorStop(0, "#5f7a92"); gr.addColorStop(0.5, "#8fa9bf"); gr.addColorStop(1, "#4f687e");
      g.fillStyle = gr; g.fillRect(x, 150, 70, 400);
      g.strokeStyle = "#2f4152"; g.lineWidth = 3; g.strokeRect(x, 150, 70, 400);
      g.fillStyle = "#2f4152";
      for (let k = 0; k < 4; k++) g.fillRect(x + 16, 176 + k * 9, 38, 4);
      g.fillStyle = "#d0d6da"; rectR(g, x + 56, 330, 6, 26, 3); g.fill();
    }
    // la puerta que se abre (la de la derecha)
    const ab = t > T_CLANG ? eBack(tramo(t, T_CLANG, T_CLANG + 0.3)) : 0;
    if (ab > 0) {
      const x = -30 + 2 * 72;
      g.fillStyle = "#1c2630"; g.fillRect(x + 3, 153, 64, 394);
      g.fillStyle = "#2a3a4a"; g.fillRect(x + 6, 300, 58, 4);
      const w = 70 * (1 - 0.75 * ab);
      g.fillStyle = "#7d97ad"; g.beginPath(); g.moveTo(x + 70, 150); g.lineTo(x + 70 + w * 0.0 + 70 * 0.75 * ab * 0.35, 140); g.lineTo(x + 70 + 70 * 0.75 * ab * 0.35, 560); g.lineTo(x + 70, 550); g.closePath(); g.fill();
      g.strokeStyle = "#2f4152"; g.lineWidth = 3; g.stroke();
    }
    g.restore();
    // patito de goma que sale despedido
    if (t > T_CLANG) {
      const u = tramo(t, T_CLANG, T_CLANG + 0.75), x0 = -30 + 2 * 72 + 35;
      const x = lerp(x0, x0 + 160, u), y = u < 1 ? lerp(300, 560, u) - Math.sin(u * Math.PI) * 140 : 560;
      g.save(); g.translate(x, y); g.rotate(u < 1 ? u * 9 : 0);
      g.fillStyle = "#ffd23a"; g.beginPath(); g.ellipse(0, 0, 18, 13, 0, 0, 6.283); g.fill(); g.beginPath(); g.arc(10, -12, 9, 0, 6.283); g.fill();
      g.fillStyle = "#ff8a1a"; g.beginPath(); g.moveTo(18, -12); g.lineTo(27, -9); g.lineTo(18, -7); g.closePath(); g.fill();
      g.fillStyle = "#1b1b1b"; g.beginPath(); g.arc(12, -14, 2, 0, 6.283); g.fill();
      g.restore();
    }
  }
  escalera(g) {
    const t = this.t;
    const ang = t > T_TOING ? Math.exp(-(t - T_TOING) * 2.2) * Math.sin((t - T_TOING) * 9) * 0.28 : 0;
    g.save(); g.translate(XESC, PIES); g.rotate(0.14 + ang);
    g.lineCap = "round";
    for (const dx of [-26, 26]) {
      g.strokeStyle = "#7d868e"; g.lineWidth = 11; g.beginPath(); g.moveTo(dx, 0); g.lineTo(dx, -420); g.stroke();
      g.strokeStyle = "#d9e0e6"; g.lineWidth = 6; g.beginPath(); g.moveTo(dx - 1, 0); g.lineTo(dx - 1, -420); g.stroke();
    }
    g.strokeStyle = "#b9c2ca"; g.lineWidth = 6;
    for (let y = -30; y > -420; y -= 40) { g.beginPath(); g.moveTo(-26, y); g.lineTo(26, y); g.stroke(); }
    g.fillStyle = "#2a2e33"; g.fillRect(-34, -6, 16, 8); g.fillRect(18, -6, 16, 8);
    g.restore();
  }
  dibujar(g) {
    const t = this.t, e = this.poses();
    fondo(g, "#000");
    g.drawImage(this.fondoFijo(), -60, -60);
    this.escalera(g);
    this.taquillas(g);
    g.fillStyle = "rgba(0,0,0,.25)";
    for (const m of [e.mG, e.mM]) { const c = aPant(m, [39, 232]); g.beginPath(); g.ellipse(c[0], PIES + 3, 60, 8, 0, 0, 6.283); g.fill(); }
    // Marcos detrás cuando Guillermo pasa por delante
    pintarAvatar(g, e.mM, e.M, t);
    pintarAvatar(g, e.mG, e.G, t);
    if (e.hs && t > T_LEVANTA + 0.1) {
      g.save(); g.translate(e.hs.x, e.hs.y); g.rotate(e.hs.rot); g.scale(e.hs.s, e.hs.s); g.translate(-46, -15);
      cascoBombero(g, 88); g.restore();
    }
    this.p.dibujar(g);
    // estrellitas al chocar
    for (const c0 of [T_CLANG, T_BONK, T_TOING]) {
      if (t > c0 && t < c0 + 0.9) {
        const c = aPant(e.mG, [39, -10]), a0 = 1 - tramo(t, c0 + 0.6, c0 + 0.9);
        for (let i = 0; i < 3; i++) { const a = t * 7 + i * 2.094; brillo(g, c[0] + Math.cos(a) * 50, c[1] + Math.sin(a) * 12, 16, a0); }
      }
    }
    // textos
    const ono = (s, x, y, t0, dur, tam, col, borde, rot) => {
      const d = t - t0;
      if (d < 0 || d > dur) return;
      const k = eBack(tramo(d, 0, 0.12));
      g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k);
      txt(g, s, 0, 0, { tam, peso: 400, fam: FC, color: col, borde, bordeAncho: 8, esp: 2, alfa: 1 - tramo(d, dur - 0.15, dur) });
      g.restore();
    };
    ono("¡CLONK!", 410, 170, T_CLONK, 0.6, 58, "#ffd34d", "#3a2400", -0.1);
    ono("¡CLANG!", 250, 230, T_CLANG, 0.6, 60, "#fffdf5", "#1b1b1b", -0.12);
    ono("¡CUAC!", 330, 470, T_CLANG + 0.7, 0.5, 40, "#ffd23a", "#3a2400", 0.1);
    ono("¡BONK!", 560, 200, T_BONK, 0.6, 60, "#fffdf5", "#1b1b1b", 0.1);
    ono("¡TOING!", 930, 120, T_TOING, 0.8, 58, "#2fe3e8", "#06303a", 0.12);
    ono("clic, clic, clic", 560, 330, T_AJUSTA + 0.05, 0.6, 34, "#fffdf5", "#1b1b1b", -0.06);
    if (t > T_DA && t < T_COGE + 0.25) {
      const c = aPant(e.mM, [37, 10]);
      bocadillo(g, 780, 180, "¡PRUÉBATELO!", c[0], c[1] - 10, tramo(t, T_DA, T_DA + 0.2) * (1 - tramo(t, T_COGE + 0.1, T_COGE + 0.25)), 36);
    }
    // ¡TE QUEDA GRANDE!: cuando Marcos levanta el casco y aprieta la rueda
    if (t > T_LEVANTA - 0.1) {
      const d = t - T_LEVANTA + 0.1, k = tramo(d, 0, 0.18), s = lerp(1.7, 1, eIn(k)) * (1 + 0.02 * Math.sin(d * 6));
      const spr = this.titulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3); g.translate(470, 80); g.rotate(-0.03); g.scale(s, s);
      g.drawImage(spr, -spr.width / 2, -spr.height / 2); g.restore();
    }
    const a = Math.max(1 - tramo(t, 0.02, 0.45), tramo(t, T_FIN, DUR - 0.03));
    if (a > 0) { g.fillStyle = `rgba(0,0,0,${a})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
  titulo() {
    if (CT.has("t")) return CT.get("t");
    const c = lienzoNuevo(900, 170), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 30, 0, 150);
    gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.5, "#ffb3a8"); gr.addColorStop(1, "#e8261c");
    txt(g, "¡TE QUEDA GRANDE!", 456, 132, { tam: 116, peso: 900, fam: FD, color: "#2a0402", esp: 4, max: 860 });
    txt(g, "¡TE QUEDA GRANDE!", 450, 124, { tam: 116, peso: 900, fam: FD, color: gr, borde: "#2a0402", bordeAncho: 11, esp: 4, glow: "rgba(255,90,70,.75)", glowTam: 22, max: 860 });
    CT.set("t", c);
    return c;
  }
}

registrar({ id: "00224", nombre: "El casco grande", crear: () => new CascoGrande() });
})();
