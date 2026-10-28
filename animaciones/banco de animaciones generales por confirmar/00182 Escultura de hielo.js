"use strict";
/*
 * 00182 · ESCULTURA DE HIELO
 *
 * Animación del banco. Empieza y acaba en negro.
 * Un bloque de hielo sobre un pedestal. Marcos, subido a un taburete, lo esculpe con martillo y cincel (solo
 * golpea el hielo): ¡TOC!, ¡TOC!… saltan esquirlas y caen trozos; Guillermo mira y se protege. Luego un frenesí
 * (¡CHAC, CHAC, CHAC!) dentro de una nube de escarcha. Al despejarse aparece una estatua de hielo de Guillermo con
 * la jarra en alto; Guillermo se pone al lado imitando la pose, jarra de verdad en mano: ¡OBRA MAESTRA!
 */
(() => {
const ESC = 1.5, SS = 1.18;
const BX0 = 420, BX1 = 604, BY0 = 182, BY1 = 470;         // el bloque de hielo
const CVW = 200, CVH = 310, NC = 6, NF = 9, CW = (BX1 - BX0) / NC, CH = (BY1 - BY0) / NF;
const XM = 692, YM = 506;                                 // Marcos (pies sobre el taburete)
const XG0 = 236, XG1 = 290;
const GOLPES = [0.85, 1.45, 2.05, 2.65, 3.25, 3.85];
const T_FRE = 4.3, T_FRE1 = 5.75, T_VE = 6.15, T_IMITA = 7.0, T_TIT = 7.45, T_APAGA = 10.45, DUR = 11.0;
const POSE_E = { cara: "guino", rc: -0.05, piernaI: [0, -0.04], piernaD: [0, 0.12], manoD: [84, 14], manoI: [2, 136], jarra: { inc: -0.25, nivel: 0.85 } };
const CT = cacheTexto();
const aU = (X, Y, q) => [(q[0] - X) / ESC + 39, (q[1] - Y) / ESC + 232];

class Escultura extends Escena {
  constructor() {
    super(DUR);
    this.p = new Parts(420);
    this.celdas = null;
    this.estatua = null;
  }
  luz() { return tramo(this.t, 0, 0.5) * (1 - tramo(this.t, T_APAGA, DUR - 0.05)); }
  /** Golpes del frenesí. */
  golpesFrenesi() { const L = []; for (let t = T_FRE; t < T_FRE1; t += 0.13) L.push(t); return L; }
  /** La estatua (una vez, cuando el avatar está cargado): Guillermo teñido de hielo. */
  hacerEstatua() {
    if (this.estatua || !listo("torso") || !listo("cara_guino")) return;
    const c = lienzoNuevo(CVW, CVH), g = c.getContext("2d");
    g.translate(36, 22); g.scale(SS, SS);
    g.imageSmoothingQuality = "high";
    dibujarAvatar(g, Object.assign({}, POSE_E), 0);
    g.setTransform(1, 0, 0, 1, 0, 0);
    // teñido de hielo
    g.globalCompositeOperation = "source-atop";
    const gr = g.createLinearGradient(0, 0, CVW, CVH);
    gr.addColorStop(0, "rgba(225,250,255,.66)"); gr.addColorStop(0.5, "rgba(130,210,245,.62)"); gr.addColorStop(1, "rgba(70,150,210,.7)");
    g.fillStyle = gr; g.fillRect(0, 0, CVW, CVH);
    g.fillStyle = "rgba(255,255,255,.12)"; g.fillRect(0, 0, CVW, CVH);
    g.strokeStyle = "rgba(255,255,255,.6)"; g.lineWidth = 3;
    for (let i = 0; i < 7; i++) { g.beginPath(); g.moveTo(-20 + i * 40, 0); g.lineTo(-90 + i * 40, CVH); g.stroke(); }
    g.globalCompositeOperation = "source-over";
    this.estatua = c;
    this.ex = 512 - (36 + 39 * SS); this.ey = BY1 - (22 + 232 * SS);
    // qué celdas del bloque tapan la estatua (una sola lectura de píxeles)
    let datos = null;
    try { datos = g.getImageData(0, 0, CVW, CVH).data; } catch (e) { datos = null; }
    const tapa = (x0, y0, w, h) => {
      if (!datos) return true;
      for (let y = Math.max(0, Math.floor(y0)); y < Math.min(CVH, y0 + h); y += 2) for (let x = Math.max(0, Math.floor(x0)); x < Math.min(CVW, x0 + w); x += 2) if (datos[(y * CVW + x) * 4 + 3] > 60) return true;
      return false;
    };
    const fuera = [], dentro = [];
    for (let r = 0; r < NF; r++) for (let q = 0; q < NC; q++) {
      const x = BX0 + q * CW, y = BY0 + r * CH;
      const cel = { x, y, t: 99, vx: 0, vy: 0, giro: 0 };
      (tapa(x - this.ex, y - this.ey, CW, CH) ? dentro : fuera).push(cel);
    }
    // las de fuera caen con los golpes lentos (las más lejanas primero); las de dentro, en la nube
    fuera.sort((a, b) => Math.hypot(b.x - 497, b.y - 330) - Math.hypot(a.x - 497, a.y - 330));
    fuera.forEach((c2, i) => { c2.t = GOLPES[Math.min(GOLPES.length - 1, Math.floor((i * GOLPES.length) / fuera.length))] + 0.02; });
    const gf = this.golpesFrenesi();
    dentro.forEach((c2, i) => { c2.t = gf[Math.min(gf.length - 1, 2 + Math.floor((i * (gf.length - 3)) / dentro.length))] + 0.02; c2.disuelve = true; });
    this.celdas = fuera.concat(dentro);
    for (const c2 of this.celdas) { c2.vx = (c2.x + CW / 2 - 512) * azar(1.5, 3) + azar(-40, 40); c2.vy = azar(-160, -40); c2.giro = azar(-6, 6); }
  }
  /** Bloque de hielo entero (una vez). */
  bloque() {
    if (this.cB) return this.cB;
    const w = BX1 - BX0, h = BY1 - BY0, c = lienzoNuevo(w, h), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 0, w, h);
    gr.addColorStop(0, "rgba(225,248,255,.95)"); gr.addColorStop(0.45, "rgba(150,215,245,.9)"); gr.addColorStop(1, "rgba(80,160,215,.92)");
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.strokeStyle = "rgba(255,255,255,.55)"; g.lineWidth = 2;
    const r = semilla(4);
    for (let i = 0; i < 9; i++) { g.beginPath(); let x = r() * w, y = r() * h; g.moveTo(x, y); for (let k = 0; k < 4; k++) { x += r() * 40 - 20; y += r() * 40 - 10; g.lineTo(x, y); } g.stroke(); }
    g.fillStyle = "rgba(255,255,255,.35)"; g.fillRect(8, 6, 10, h - 12); g.fillRect(0, 0, w, 6);
    g.strokeStyle = "rgba(255,255,255,.9)"; g.lineWidth = 3; g.strokeRect(1.5, 1.5, w - 3, h - 3);
    return (this.cB = c);
  }
  /** Punta del cincel (pantalla) en cada golpe. */
  punta(t) {
    const todos = GOLPES.concat(this.golpesFrenesi());
    let i = 0; while (i < todos.length - 1 && t > todos[i] + 0.12) i++;
    const ys = [290, 370, 240, 420, 330, 270];
    const y = i < GOLPES.length ? ys[i] : 240 + ((i * 53) % 170);
    return [BX1 + 2, y];
  }
  /** Fase del martillo respecto al golpe más cercano: -1 arriba (preparado), 0 golpe. */
  martillo(t) {
    const todos = GOLPES.concat(this.golpesFrenesi());
    for (const h of todos) {
      const rapido = h >= T_FRE;
      const pre = rapido ? 0.06 : 0.3, post = rapido ? 0.06 : 0.16;
      if (t > h - pre && t < h + post) return t < h ? -eInOut(tramo(t, h - pre, h - (rapido ? 0.03 : 0.08))) * (1 - eIn(tramo(t, h - (rapido ? 0.03 : 0.08), h))) - 0 : -0.3 * Math.sin(tramo(t, h, h + post) * Math.PI);
    }
    return -1;
  }
  poses() {
    const t = this.t;
    // ---- Marcos con martillo (derecha) y cincel (izquierda, por delante)
    const M = { quien: "marcos", cara: "guino", rc: -0.12, piernaI: [0, 0], piernaD: [0, 0], brazoIDelante: true };
    const esculpe = t > 0.5 && t < T_FRE1 + 0.15;
    let dyM = 0;
    if (esculpe) {
      const pt = this.punta(t), h = this.martillo(t);
      const mi = [pt[0] + 46, pt[1] + 6];
      M.manoI = aU(XM, YM + dyM, mi);
      M.objI2 = (g, m) => {
        // cincel: punta hacia el bloque
        g.save(); g.translate(m[0], m[1]); g.rotate(Math.PI - 0.08);
        g.fillStyle = "#8a5a2a"; rectR(g, -7, -3, 12, 6, 2); g.fill();
        const gc = g.createLinearGradient(0, -2, 0, 2); gc.addColorStop(0, "#f2f6f8"); gc.addColorStop(1, "#7d868e");
        g.fillStyle = gc; g.beginPath(); g.moveTo(5, -2); g.lineTo(28, -1.6); g.lineTo(31, 0); g.lineTo(28, 1.6); g.lineTo(5, 2); g.closePath(); g.fill();
        g.restore();
      };
      // martillo: arriba y atrás cuando h = -1; sobre el mango del cincel cuando h = 0
      const golpe = aU(XM, YM + dyM, [mi[0] + 34, mi[1] - 22]);
      const arriba = [96, 40 + (pt[1] - 330) / ESC * 0.5];
      M.manoD = mezcla(golpe, arriba, -h);
      M.objD = (g, m, ang) => {
        g.save(); g.translate(m[0], m[1]); g.rotate(ang + 0.9);
        g.fillStyle = "#9a6232"; rectR(g, -3, -2, 26, 4.2, 2); g.fill();
        const gm = g.createLinearGradient(0, -9, 0, 9); gm.addColorStop(0, "#dfe6ec"); gm.addColorStop(1, "#5d656e");
        g.fillStyle = gm; rectR(g, 20, -9, 9, 18, 2); g.fill();
        g.restore();
      };
      M.cara = h > -0.2 ? "dormido" : t > T_FRE ? "risa" : "guino";
      if (t > T_FRE) M.puntas = 0.7;
    } else if (t >= T_FRE1 + 0.15) {
      // ¡tachán!: presenta la estatua, aplaude y se cruza de brazos
      M.cara = "risa"; M.rc = -0.1;
      M.manoI = mezcla([6, 152], [-24, 80], eOut(tramo(t, T_VE - 0.1, T_VE + 0.2)));
      M.manoD = [67, 152];
      M.brazoIDelante = false;
      if (t > T_TIT) {
        const s = Math.sin((t - T_TIT) * 20);
        if (t < 8.7) { M.manoI = [26 - 5 * s, 112]; M.manoD = [48 + 5 * s, 112]; M.brazoIDelante = true; }
        else { M.manoD = mezcla([48, 112], [22, 112], eOut(tramo(t, 8.7, 8.95))); M.manoI = [50, 114]; M.brazoIDelante = true; M.cara = "guino"; }
      }
    } else { M.manoI = [6, 152]; M.manoD = [67, 152]; }
    // ---- Guillermo mira, se protege de las esquirlas y luego imita la pose
    const G = { cara: "sonrisa", rc: 0.12, piernaI: [0, 0], piernaD: [0, 0], manoD: [70, 158], manoI: [9, 160] };
    let xg = XG0, dyG = 0;
    if (t > 0.5 && t < T_FRE) {
      const cerca = GOLPES.some((h) => t > h && t < h + 0.35);
      G.cara = cerca ? "sorpresa" : "sonrisa";
      if (cerca) { G.brazoIDelante = true; G.manoD = [52, 44]; G.manoI = [24, 48]; G.cara = "dormido"; }
    }
    if (t >= T_FRE && t < T_VE) {
      // se asoma entre los dedos
      G.brazoIDelante = true; G.manoD = [50, 42 + 4 * Math.sin(t * 6)]; G.manoI = [26, 46]; G.cara = "sorpresa"; G.rc = 0.18 + 0.05 * Math.sin(t * 4);
    }
    if (t >= T_VE) {
      G.cara = t < T_VE + 0.5 ? "sorpresa" : "risa"; G.rc = 0.16;
      xg = lerp(XG0, XG1, eInOut(tramo(t, T_VE + 0.3, T_IMITA)));
      if (t > T_VE + 0.3 && t < T_IMITA) { const an = andar((t - T_VE) * 12, 0.7); G.piernaI = an.piernaI; G.piernaD = an.piernaD; dyG = an.bote; }
      if (t >= T_IMITA) {
        // la misma pose que la estatua, con una jarra de verdad
        const k = eBack(tramo(t, T_IMITA, T_IMITA + 0.3));
        G.manoD = mezcla([70, 158], POSE_E.manoD, k); G.manoI = mezcla([9, 160], POSE_E.manoI, k);
        G.piernaI = POSE_E.piernaI; G.piernaD = POSE_E.piernaD;
        G.jarra = { inc: -0.25, nivel: 0.85 };
        G.cara = "guino"; G.rc = lerp(0.16, POSE_E.rc, k);
        dyG = -Math.max(0, Math.sin(tramo(t, T_IMITA, T_IMITA + 0.3) * Math.PI)) * 10;
      }
    }
    return [
      { pose: G, m: matAv(xg, PIES + dyG, ESC) },
      { pose: M, m: matAv(XM, YM + dyM, ESC) },
    ];
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    const todos = GOLPES.concat(this.golpesFrenesi());
    todos.forEach((h, i) => this.una("g" + i, t > h, () => {
      const pt = this.punta(h - 0.01);
      const lento = h < T_FRE;
      temblar(lento ? 9 : 4, 0.15);
      p.nueva(P.DESTELLO, pt[0], pt[1], 0, 0, 0.2, lento ? 70 : 40);
      for (let k = 0; k < (lento ? 14 : 4); k++) p.nueva(P.CONFETI, pt[0], pt[1], azar(-420, -60), azar(-360, -40), azar(0.8, 1.4), azar(6, 11), k % 2 ? 2 : 4);
      for (let k = 0; k < (lento ? 6 : 2); k++) p.nueva(P.ELECTRICA, pt[0], pt[1], azar(-200, 0), azar(-150, 150), azar(0.2, 0.4), azar(10, 18));
    }));
    // nube de escarcha durante el frenesí
    if (t > T_FRE && t < T_FRE1 && Math.random() < 50 * dt) p.nueva(P.VAPOR, azar(BX0 - 20, BX1 + 20), azar(BY0, BY1), azar(-60, 60), azar(-60, 20), azar(0.6, 1.0), azar(50, 90));
    this.una("ve", t > T_VE, () => {
      temblar(12, 0.3);
      for (let k = 0; k < 24; k++) { const a = azar(0, 6.283), v = azar(120, 380); p.nueva(P.DESTELLO, 512 + Math.cos(a) * 60, 340 + Math.sin(a) * 100, Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.6), azar(12, 22)); }
    });
    this.una("imita", t > T_IMITA, () => { temblar(6, 0.15); p.nueva(P.DESTELLO, XG1 + 70, 200, 0, 0, 0.3, 100); });
    this.una("tit", t > T_TIT, () => {
      temblar(16, 0.4);
      for (let k = 0; k < 60; k++) p.nueva(P.CONFETI, azar(30, W - 30), azar(-80, -10), azar(-40, 40), azar(0, 120), azar(2.2, 3.2), azar(9, 14), k % 5);
    });
    // vaho frío del bloque
    if (Math.random() < 6 * dt) p.nueva(P.VAPOR, azar(BX0, BX1), BY1 + 6, azar(-20, 20), azar(-30, -10), azar(0.8, 1.4), azar(24, 40));
    p.suelo = () => PIES - 2;
    p.alfa = this.luz();
    p.actualizar(dt);
    // trozos que caen
    if (this.celdas) for (const c of this.celdas) if (t > c.t) {
      const d = t - c.t;
      c.cx = c.x + c.vx * d; c.cy = c.y + c.vy * d + 700 * d * d; c.rot = c.giro * d; c.d = d;
    }
  }
  fondoFijo() {
    if (this.cF) return this.cF;
    const c = lienzoNuevo(W, H), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 0, 0, H);
    gr.addColorStop(0, "#070b14"); gr.addColorStop(1, "#111a2a");
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.35; g.drawImage(BLOB2.cian, 512 - 360, 120, 720, 460); g.globalAlpha = 1; g.globalCompositeOperation = "source-over";
    // suelo
    const gs = g.createLinearGradient(0, 560, 0, H); gs.addColorStop(0, "#1c2433"); gs.addColorStop(1, "#080b12");
    g.fillStyle = gs; g.fillRect(0, 560, W, 40);
    // pedestal
    g.fillStyle = "rgba(0,0,0,.4)"; g.beginPath(); g.ellipse(512, 574, 120, 12, 0, 0, 6.283); g.fill();
    const gp = g.createLinearGradient(412, 0, 612, 0);
    gp.addColorStop(0, "#2c2f36"); gp.addColorStop(0.4, "#6a707a"); gp.addColorStop(1, "#22252b");
    g.fillStyle = gp; g.fillRect(420, BY1, 184, 104);
    g.fillStyle = "#7d848e"; g.fillRect(408, BY1 - 4, 208, 14); g.fillRect(408, 562, 208, 12);
    // taburete de Marcos
    g.fillStyle = "#5a3218"; g.fillRect(XM - 50, YM, 100, 12);
    g.fillStyle = "#3a2010"; g.fillRect(XM - 44, YM + 12, 9, PIES - YM - 10); g.fillRect(XM + 35, YM + 12, 9, PIES - YM - 10);
    g.fillRect(XM - 40, YM + 32, 80, 6);
    return (this.cF = c);
  }
  dibujar(g) {
    const t = this.t, a = this.luz(), e = this.poses();
    this.hacerEstatua();
    fondo(g, "#000");
    g.save(); g.globalAlpha = a;
    g.drawImage(this.fondoFijo(), 0, 0);
    foco(g, 512, 512, PIES, 300, 0.7);
    // la estatua (dentro del bloque)
    if (this.estatua) {
      const ve = t > T_VE ? 1 : 0.35;
      g.save(); g.globalAlpha *= ve; g.drawImage(this.estatua, this.ex, this.ey); g.restore();
      if (t > T_VE) {
        g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = a * 0.35 * (0.8 + 0.2 * Math.sin(t * 5)); g.drawImage(BLOB2.cian, 512 - 140, 180, 280, 300); g.restore();
      }
    }
    // el bloque, celda a celda
    const B = this.bloque();
    if (this.celdas) {
      for (const c of this.celdas) {
        if (t <= c.t) { g.drawImage(B, c.x - BX0, c.y - BY0, CW, CH, c.x, c.y, CW + 0.6, CH + 0.6); continue; }
        if (c.disuelve || c.d > 1.2 || c.cy > H) continue;
        g.save(); g.translate(c.cx + CW / 2, c.cy + CH / 2); g.rotate(c.rot); g.globalAlpha *= 1 - tramo(c.d, 0.7, 1.2);
        g.drawImage(B, c.x - BX0, c.y - BY0, CW, CH, -CW / 2, -CH / 2, CW, CH);
        g.restore();
      }
    } else g.drawImage(B, BX0, BY0);
    // los dos
    for (const x of e) pintarAvatar(g, x.m, x.pose, t);
    g.restore();
    this.p.dibujar(g);
    // la nube que tapa el frenesí
    const nube = tramo(t, T_FRE + 0.1, T_FRE + 0.5) * (1 - tramo(t, T_FRE1 - 0.05, T_VE));
    if (nube > 0) {
      g.save(); g.globalAlpha = a * nube * 0.95;
      g.drawImage(BLOB2.vapor, BX0 - 120, BY0 - 90, BX1 - BX0 + 240, BY1 - BY0 + 180);
      g.drawImage(BLOB.blanco, BX0 - 60, BY0 - 30, BX1 - BX0 + 120, BY1 - BY0 + 60);
      g.restore();
    }
    // brillos de la estatua
    if (t > T_VE) for (let i = 0; i < 3; i++) { const ph = (t * 0.9 + i / 3) % 1; brillo(g, [470, 580, 525][i], [230, 250, 410][i], 26, a * Math.sin(ph * Math.PI)); }
    const ono = (s, x, y, t0, dur, tam, col, borde, rot) => {
      const d = t - t0;
      if (d < 0 || d > dur) return;
      const k = eBack(tramo(d, 0, 0.1));
      g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k);
      txt(g, s, 0, 0, { tam, peso: 400, fam: FC, color: col, borde, bordeAncho: 8, esp: 2, alfa: a * (1 - tramo(d, dur - 0.15, dur)) });
      g.restore();
    };
    GOLPES.forEach((h, i) => ono(i % 3 === 2 ? "¡CHAC!" : "¡TOC!", 820 + (i % 2) * 70, 200 + (i % 3) * 40, h, 0.4, 44, "#e8fbff", "#062a3a", i % 2 ? 0.12 : -0.1));
    ono("¡CHAC, CHAC, CHAC!", 760, 150, T_FRE + 0.1, T_FRE1 - T_FRE - 0.1, 48, "#2fe3e8", "#06303a", 0.06);
    ono("¡TACHÁN!", 780, 200, T_VE, 0.9, 54, "#ffd34d", "#3a2400", 0.1);
    // ¡OBRA MAESTRA!
    if (t > T_TIT) {
      const d = t - T_TIT, k = tramo(d, 0, 0.16), s = lerp(1.8, 1, eIn(k)) * (1 + 0.02 * Math.sin(d * 7));
      const r = this.titulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3) * a; g.translate(512, 92); g.rotate(-0.03); g.scale(s, s);
      g.drawImage(r, -r.width / 2, -r.height / 2);
      g.restore();
    }
    const negro = 1 - a;
    if (negro > 0) { g.fillStyle = `rgba(0,0,0,${negro})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
  titulo() {
    if (CT.has(1)) return CT.get(1);
    const c = lienzoNuevo(1000, 180), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 40, 0, 150);
    gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.5, "#ffe58a"); gr.addColorStop(1, "#f2a100");
    txt(g, "¡OBRA MAESTRA!", 500, 140, { tam: 124, peso: 900, fam: FD, color: gr, borde: "#3a2400", bordeAncho: 12, esp: 5, glow: "rgba(150,235,255,.9)", glowTam: 26, max: 950 });
    CT.set(1, c);
    return c;
  }
}

registrar({ id: "00182", nombre: "Escultura de hielo", crear: () => new Escultura() });
})();
