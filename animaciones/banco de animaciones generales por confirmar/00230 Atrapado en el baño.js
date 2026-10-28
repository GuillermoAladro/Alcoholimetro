"use strict";
/*
 * 00230 · ATRAPADO EN EL BAÑO
 *
 * Animación del banco. Empieza y acaba en negro.
 * Guillermo entra en el baño del bar y cierra (¡CLIC!)… y ya no puede abrir: ÑEC, ÑEC. Aporrea la puerta y se le ve
 * por el cristal: ¡ÁBREME! Llega Marcos a la carrera con todo el equipo (casco con linterna, cuerda y caja de
 * herramientas), suelta la caja, examina la cerradura muy serio (MMM…)… y descubre la llave colgada justo al lado de la
 * puerta. ¡CLIC! Guillermo sale disparado a abrazarlo y Marcos le enseña la llave guiñando un ojo. Fundido a negro.
 */
(() => {
const CT = cacheTexto();
const DUR = 10.2;
const DX0 = 330, DX1 = 530, DW = DX1 - DX0, DY0 = 150, DY1 = PIES;   // el hueco de la puerta
const VY0 = 232, VY1 = 338;                                         // el cristal (alto)
const POMO = [DX1 - 26, 392], CERR = [DX1 - 26, 424], LLAVE = [568, 262];
const XG_DENTRO = 430, ESC_D = 1.4, ESC = 1.5;
const T_CIERRA = 1.05, T_CLIC = 1.42, T_ÑEC = 1.55, T_POM = 2.2, T_ABREME = 2.35, T_LLEGA = 3.3, T_PARA = 3.95, T_CAJA = 4.05;
const T_MIRA = 4.25, T_PIENSA = 5.35, T_VE = 5.6, T_COGE = 5.95, T_METE = 6.3, T_ABRE = 6.62, T_SALE = 6.85, T_ABRAZO = 7.4, T_ENSEÑA = 8.05, T_APAGA = 9.65;
const XM1 = 690, XM2 = 622;
const enAv = (m, q) => { const p = m.inverse().transformPoint(new DOMPoint(q[0], q[1])); return [p.x, p.y]; };

// ------------------------------------------------------------------------------------------- objetos
function cajaHerramientas(g, x, y, ang) {
  g.save(); g.translate(x, y); g.rotate(ang);
  // asa
  g.strokeStyle = "#2a2a2a"; g.lineWidth = 2.6; g.beginPath(); g.moveTo(-9, 6); g.lineTo(-9, 0); g.lineTo(9, 0); g.lineTo(9, 6); g.stroke();
  // herramientas que asoman
  g.fillStyle = "#9aa2aa"; g.save(); g.translate(-12, 6); g.rotate(-0.4); g.fillRect(-1.6, -14, 3.2, 16); g.fillStyle = "#e3262f"; g.fillRect(-2.4, -18, 4.8, 6); g.restore();
  g.fillStyle = "#c8a040"; g.save(); g.translate(13, 6); g.rotate(0.3); g.fillRect(-1.4, -12, 2.8, 14); g.restore();
  const gr = g.createLinearGradient(0, 6, 0, 30);
  gr.addColorStop(0, "#ff4a3a"); gr.addColorStop(1, "#8a0c08");
  g.fillStyle = gr; rectR(g, -20, 6, 40, 24, 3); g.fill();
  g.fillStyle = "rgba(255,255,255,.3)"; g.fillRect(-18, 8, 36, 2);
  g.fillStyle = "#2a2a2a"; g.fillRect(-20, 14, 40, 2.4);
  g.fillStyle = "#e7c400"; g.fillRect(-3, 12.5, 6, 5);
  g.restore();
}
/** Llave con su etiqueta; (x, y) = la anilla. */
function llave(g, x, y, ang, s = 1) {
  g.save(); g.translate(x, y); g.rotate(ang); g.scale(s, s);
  g.fillStyle = "#e3262f"; rectR(g, -14, -4, 11, 16, 2); g.fill();
  g.fillStyle = "#fff"; g.beginPath(); g.arc(-8.5, -1, 1.3, 0, 6.283); g.fill();
  g.strokeStyle = "#7a5a10"; g.lineWidth = 1; g.beginPath(); g.moveTo(-8.5, -1); g.lineTo(0, 0); g.stroke();
  g.strokeStyle = "#e7b400"; g.lineWidth = 3; g.beginPath(); g.arc(0, 4, 4, 0, 6.283); g.stroke();
  g.fillStyle = "#f2c430"; g.fillRect(-1.5, 8, 3, 18);
  g.fillRect(1, 18, 4, 2.5); g.fillRect(1, 23, 3, 2.5);
  g.fillStyle = "rgba(255,255,255,.55)"; g.fillRect(-1, 9, 1, 15);
  g.restore();
}

class AtrapadoBaño extends Escena {
  constructor() {
    super(DUR);
    this.p = new Parts(260);
    this.cP = null; this.cI = null;
  }
  luz() { return tramo(this.t, 0, 0.45) * (1 - tramo(this.t, T_APAGA, DUR - 0.05)); }
  /** Cuánto está abierta la puerta (0 cerrada, 1 abierta hacia dentro). */
  abierta(t) {
    if (t < T_CIERRA) return 0.85;
    if (t < T_ABRE) return 0.85 * (1 - eIn(tramo(t, T_CIERRA, T_CLIC)));
    return 0.9 * eOut(tramo(t, T_ABRE, T_ABRE + 0.3));
  }
  // ------------------------------------------------------------------ Guillermo
  poseG() {
    const t = this.t;
    const G = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], brazoIDelante: true };
    let x = XG_DENTRO, y = DY1 - 8, esc = ESC_D, dentro = true, giro = 0;
    let gD = [70, 158], gI = [9, 160];
    if (t < T_CIERRA) {
      // saluda desde dentro
      gD = [92 + 6 * Math.sin(t * 14), 30]; G.cara = "guino"; G.rc = 0.06;
    } else if (t < T_ÑEC) {
      const k = eInOut(tramo(t, T_CIERRA, T_CIERRA + 0.3));
      gD = mezcla([92, 30], [80, 130], k); G.cara = "sonrisa";
      if (t > T_CLIC) G.cara = "sorpresa";
    } else if (t < T_POM) {
      // ÑEC, ÑEC: el pomo no va
      gD = [80, 128 + 6 * Math.sin(t * 30)]; G.cara = "sorpresa"; G.rc = 0.1 * Math.sin(t * 18);
    } else if (t < T_LLEGA + 0.4) {
      // aporrea la puerta
      const f = Math.sin(t * 22);
      gD = [60, 50 + 12 * Math.max(0, f)]; gI = [18, 50 + 12 * Math.max(0, -f)];
      G.cara = Math.sin(t * 5) > 0 ? "sorpresa" : "risa"; G.rc = 0.06 * f; G.puntas = 0.3;
      if (t > T_ABREME && t < T_ABREME + 0.9) G.cara = "sorpresa";
    } else if (t < T_SALE) {
      // mira por el cristal cómo trabaja Marcos
      gD = [74, 60]; gI = [4, 60];
      G.cara = t > T_VE && t < T_ABRE ? "sorpresa" : (Math.floor(t * 2.5) % 4 === 0 ? "dormido" : "sorpresa");
      G.rc = 0.12;
      if (t > T_ABRE - 0.2) { G.cara = "sorpresa"; G.puntas = 0.6; }
    }
    // ¡sale disparado!
    if (t >= T_SALE) {
      dentro = false;
      const u = eOut(tramo(t, T_SALE, T_ABRAZO));
      x = lerp(XG_DENTRO, 520, u); y = lerp(DY1 - 8, PIES, u); esc = lerp(ESC_D, ESC, u);
      gD = [96, 40]; gI = [-18, 40]; G.cara = "risa"; giro = 0.12 * Math.sin(u * Math.PI);
      if (t < T_ABRAZO) { const a = andar(t * 18, 1.3); G.piernaI = a.piernaI; G.piernaD = a.piernaD; y += a.bote; }
    }
    if (t >= T_ABRAZO - 0.1) {
      const k = eInOut(tramo(t, T_ABRAZO - 0.1, T_ABRAZO + 0.2));
      const mG = matAv(520, PIES, ESC), mM = this.poseM().m;
      gD = mezcla([96, 40], enAv(mG, aPant(mM, [20, 96])), k); gI = mezcla([-18, 40], [9, 160], k);
      G.cara = "dormido"; G.rc = 0.16 * k;
      if (t > T_ENSEÑA) {
        // se da cuenta de la llave: risa avergonzada, mano a la nuca
        const k2 = eInOut(tramo(t, T_ENSEÑA, T_ENSEÑA + 0.3));
        gD = mezcla(gD, [96, 120], k2); gI = mezcla([9, 160], [8, 20], k2);
        G.cara = t < T_ENSEÑA + 0.4 ? "sorpresa" : "risa"; G.rc = 0.1 + 0.04 * Math.sin(t * 9);
      }
    }
    G.manoD = gD; G.manoI = gI;
    return { G, m: matAv(x, y, esc, giro), dentro };
  }
  // ------------------------------------------------------------------ Marcos
  poseM() {
    const t = this.t;
    const M = { quien: "bombero", cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], brazoIDelante: true };
    let x = 1200, sy = 1, giro = 0, y = PIES;
    let mD = [74, 132], mI = [2, 150], caja = true, llaveEn = null, foco = 0;
    if (t > T_LLEGA) {
      const u = tramo(t, T_LLEGA, T_PARA);
      x = lerp(1200, XM1, eOut(u));
      if (u < 1) { const a = andar(t * 20, 1.5); M.piernaI = a.piernaI; M.piernaD = a.piernaD; y += a.bote; giro = -0.08; }
      M.cara = "sonrisa"; mD = [80, 128 + 6 * Math.sin(t * 20)]; mI = [-4 - 8 * Math.sin(t * 20), 118];
    }
    // suelta la caja
    if (t > T_CAJA) {
      caja = false; mD = [74, 140]; mI = [2, 150];
      M.cara = "sonrisa"; M.rc = -0.1;
    }
    // examina la cerradura (se agacha, linterna del casco)
    if (t > T_MIRA) {
      const k = eInOut(tramo(t, T_MIRA, T_MIRA + 0.35)) * (1 - eInOut(tramo(t, T_PIENSA, T_PIENSA + 0.25)));
      x = lerp(XM1, XM2, eInOut(tramo(t, T_MIRA, T_MIRA + 0.35)));
      sy = 1 - 0.17 * k; giro = -0.13 * k; M.rc = -0.18 * k;
      const mm = matAv(x, PIES, ESC, giro, 1, sy);
      const q = enAv(mm, [CERR[0] + 14, CERR[1] - 6]);
      mI = mezcla([2, 150], [q[0] + 2 * Math.sin(t * 9), q[1]], k);
      mD = mezcla([74, 140], [64, 70], k);
      M.cara = k > 0.5 ? (Math.sin(t * 3) > 0 ? "guino" : "sonrisa") : "sonrisa";
      foco = k;
    }
    // piensa… y ve la llave
    if (t > T_PIENSA) {
      const k = eInOut(tramo(t, T_PIENSA, T_PIENSA + 0.25));
      mD = mezcla([64, 70], [62, 24 + 3 * Math.sin(t * 16)], k); mI = mezcla(mI, [2, 150], k);
      M.cara = "sonrisa"; M.rc = 0.08;
      if (t > T_VE) { M.cara = "sorpresa"; M.rc = -0.2; mD = mezcla([62, 24], [74, 140], eInOut(tramo(t, T_VE, T_VE + 0.3))); }
    }
    // coge la llave y la mete en la cerradura
    if (t > T_VE + 0.1) {
      const mm = matAv(x, y, ESC, giro, 1, sy);
      const gancho = enAv(mm, [LLAVE[0], LLAVE[1] + 12]), cerr = enAv(mm, [CERR[0] + 18, CERR[1] - 8]);
      const k1 = eInOut(tramo(t, T_VE + 0.1, T_COGE)), k2 = eInOut(tramo(t, T_METE - 0.05, T_METE + 0.25));
      mI = mezcla(mezcla([2, 150], gancho, k1), cerr, k2);
      if (t > T_COGE) llaveEn = true;
      M.cara = t < T_COGE ? "sorpresa" : "guino"; M.rc = -0.12;
    }
    // la puerta se abre: se aparta y le abraza
    if (t > T_ABRE) {
      const k = eInOut(tramo(t, T_ABRE, T_ABRAZO));
      x = lerp(XM2, 650, k);
      const mm = matAv(x, PIES, ESC);
      mI = mezcla(mI, [-4, 70], k);
      M.cara = t < T_ABRAZO ? "sorpresa" : "risa"; M.rc = -0.1;
      void mm;
    }
    if (t > T_ENSEÑA) {
      // le enseña la llave colgando
      const k = eBack(tramo(t, T_ENSEÑA, T_ENSEÑA + 0.3));
      mI = mezcla([-4, 70], [-10, 40], k);
      M.cara = Math.floor((t - T_ENSEÑA) * 2) % 2 ? "guino" : "risa"; M.rc = -0.08;
    }
    M.manoD = mD; M.manoI = mI;
    const rc = M.rc, kf = foco;
    M.objD = (g, m) => {
      // cuerda enrollada en bandolera
      g.save(); g.lineCap = "round";
      g.strokeStyle = "#a07a10"; g.lineWidth = 5; g.beginPath(); g.moveTo(14, 92); g.quadraticCurveTo(40, 112, 58, 140); g.stroke();
      g.strokeStyle = "#f2c430"; g.lineWidth = 3.4; g.beginPath(); g.moveTo(14, 92); g.quadraticCurveTo(40, 112, 58, 140); g.stroke();
      g.translate(56, 142);
      for (let i = 0; i < 3; i++) {
        g.strokeStyle = "#a07a10"; g.lineWidth = 4.6; g.beginPath(); g.ellipse(i * 1.6 - 1.6, i * 1.2, 11, 14, 0.25, 0, 6.283); g.stroke();
        g.strokeStyle = "#f2c430"; g.lineWidth = 3; g.beginPath(); g.ellipse(i * 1.6 - 1.6, i * 1.2, 11, 14, 0.25, 0, 6.283); g.stroke();
      }
      g.restore();
      // linterna del casco
      g.save(); const R = avatar("bombero").rig; g.translate(R.cuello[0], R.cuello[1]); g.rotate(rc); g.translate(-R.cuello[0], -R.cuello[1]);
      g.fillStyle = "#1c1c1c"; rectR(g, 6, 16, 9, 7, 2); g.fill();
      g.fillStyle = kf > 0.3 ? "#fff6b0" : "#c8c070"; g.beginPath(); g.ellipse(7, 19.5, 2, 3.2, 0, 0, 6.283); g.fill();
      g.restore();
      if (caja) cajaHerramientas(g, m[0], m[1] + 2, 0);
    };
    if (llaveEn) M.objI2 = (g, m) => llave(g, m[0] - 2, m[1] - 4, t > T_ENSEÑA ? 0.3 * Math.sin(t * 6) : 0.4, t > T_ENSEÑA ? 1.5 : 1.1);
    return { M, m: matAv(x, y, ESC, giro, 1, sy), caja, foco: kf };
  }
  // ------------------------------------------------------------------ actualizar
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    this.una("clic", t > T_CLIC, () => temblar(5, 0.12));
    // golpes en la puerta
    if (t > T_POM && t < T_LLEGA + 0.4) {
      const k = Math.floor((t - T_POM) * 7);
      this.una("pom" + k, true, () => { temblar(5, 0.1); p.nueva(P.POLVO, azar(DX0 + 20, DX1 - 20), azar(DY0 + 10, DY1 - 40), azar(-30, 30), azar(-20, 20), azar(0.4, 0.7), azar(16, 26)); });
    }
    if (t > T_LLEGA && t < T_PARA && Math.random() < 20 * dt) { const e = this.poseM(); const c = aPant(e.m, [39, 225]); p.nueva(P.POLVO, c[0] + 30, PIES - 4, azar(40, 120), azar(-30, -5), azar(0.4, 0.7), azar(20, 34)); }
    this.una("caja", t > T_CAJA, () => { temblar(10, 0.25); for (let i = 0; i < 12; i++) p.nueva(P.POLVO, 760 + azar(-30, 30), PIES - 4, azar(-120, 120), azar(-50, -5), azar(0.5, 0.8), azar(22, 36)); });
    this.una("ve", t > T_VE, () => { p.nueva(P.DESTELLO, LLAVE[0], LLAVE[1] + 20, 0, 0, 0.35, 120); });
    this.una("abre", t > T_ABRE, () => {
      temblar(14, 0.35);
      p.nueva(P.DESTELLO, CERR[0], CERR[1], 0, 0, 0.35, 180);
      for (let i = 0; i < 18; i++) { const a = azar(0, 6.283), v = azar(140, 360); p.nueva(P.CHISPA, CERR[0], CERR[1], Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.6), azar(5, 9)); }
    });
    this.una("abrazo", t > T_ABRAZO, () => {
      temblar(8, 0.2);
      for (let i = 0; i < 60; i++) p.nueva(P.CONFETI, azar(30, W - 30), azar(-80, -10), azar(-40, 40), azar(0, 120), azar(2.4, 3.4), azar(9, 15), i % 5);
    });
    p.suelo = () => PIES;
    p.alfa = this.luz();
    p.actualizar(dt);
  }
  // ------------------------------------------------------------------ escenario
  pared() {
    if (this.cP) return this.cP;
    const c = lienzoNuevo(W + 120, H + 120), g = c.getContext("2d");
    g.translate(60, 60);
    const gr = g.createLinearGradient(0, -60, 0, H);
    gr.addColorStop(0, "#2a1810"); gr.addColorStop(1, "#1a0e08");
    g.fillStyle = gr; g.fillRect(-60, -60, W + 120, H + 120);
    // friso de azulejos abajo
    g.fillStyle = "#3a5a52"; g.fillRect(-60, 360, W + 120, PIES - 360);
    g.strokeStyle = "rgba(0,0,0,.25)"; g.lineWidth = 2;
    for (let y = 360; y < PIES; y += 30) { g.beginPath(); g.moveTo(-60, y); g.lineTo(W + 60, y); g.stroke(); }
    for (let x = -60; x < W + 60; x += 30) { g.beginPath(); g.moveTo(x, 360); g.lineTo(x, PIES); g.stroke(); }
    g.fillStyle = "#6a3e1c"; g.fillRect(-60, 352, W + 120, 10);
    g.fillStyle = "rgba(255,210,150,.3)"; g.fillRect(-60, 352, W + 120, 2);
    // suelo
    const gs = g.createLinearGradient(0, PIES - 20, 0, H);
    gs.addColorStop(0, "#3a2412"); gs.addColorStop(1, "#1c1008");
    g.fillStyle = gs; g.fillRect(-60, PIES - 22, W + 120, H - PIES + 82);
    // cuadros y aplique en la pared
    g.fillStyle = "#4a2c18"; rectR(g, 760, 140, 150, 110, 6); g.fill();
    g.fillStyle = "#1a2a3a"; g.fillRect(772, 152, 126, 86);
    g.fillStyle = "#ffd34d"; g.beginPath(); g.arc(835, 195, 22, 0, 6.283); g.fill();
    g.fillStyle = "#2a1a10"; g.fillRect(772, 205, 126, 33);
    g.fillStyle = "#fff3c4"; g.beginPath(); g.ellipse(170, 150, 30, 10, 0, 0, 6.283); g.fill();
    g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.5; g.drawImage(BLOB2.oro, 20, 20, 300, 300); g.globalAlpha = 1; g.globalCompositeOperation = "source-over";
    // el hueco de la puerta: transparente
    g.clearRect(DX0, DY0, DW, DY1 - DY0);
    // marco
    g.fillStyle = "#8a5426";
    g.fillRect(DX0 - 16, DY0 - 16, DW + 32, 16); g.fillRect(DX0 - 16, DY0, 16, DY1 - DY0); g.fillRect(DX1, DY0, 16, DY1 - DY0);
    g.fillStyle = "rgba(255,220,170,.35)"; g.fillRect(DX0 - 16, DY0 - 16, DW + 32, 3); g.fillRect(DX0 - 16, DY0, 3, DY1 - DY0);
    g.fillStyle = "rgba(0,0,0,.35)"; g.fillRect(DX0 - 2, DY0, 2, DY1 - DY0); g.fillRect(DX1, DY0, 2, DY1 - DY0);
    // cartel ASEOS
    g.fillStyle = "#f4f0e6"; rectR(g, DX0 + 40, DY0 - 72, DW - 80, 44, 8); g.fill();
    g.strokeStyle = "#2a2a2a"; g.lineWidth = 3; rectR(g, DX0 + 40, DY0 - 72, DW - 80, 44, 8); g.stroke();
    txt(g, "ASEOS", (DX0 + DX1) / 2 + 14, DY0 - 38, { tam: 28, peso: 900, fam: FD, color: "#2a2a2a", esp: 3 });
    g.fillStyle = "#2a5aa0"; g.beginPath(); g.arc(DX0 + 58, DY0 - 59, 5, 0, 6.283); g.fill(); g.fillRect(DX0 + 53, DY0 - 53, 10, 16);
    // gancho de la llave
    g.fillStyle = "#6a6e74"; rectR(g, LLAVE[0] - 8, LLAVE[1] - 10, 16, 10, 2); g.fill();
    g.strokeStyle = "#9aa2aa"; g.lineWidth = 2.4; g.beginPath(); g.moveTo(LLAVE[0], LLAVE[1] - 2); g.quadraticCurveTo(LLAVE[0], LLAVE[1] + 6, LLAVE[0] + 5, LLAVE[1] + 3); g.stroke();
    const v = g.createRadialGradient(W / 2, 300, 260, W / 2, 300, 720);
    v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,.7)");
    g.fillStyle = v; g.fillRect(-60, -60, DX0 + 60, H + 120); g.fillRect(DX1, -60, W + 60 - DX1, H + 120); g.fillRect(DX0, -60, DW, DY0 + 60); g.fillRect(DX0, DY1, DW, 120);
    return (this.cP = c);
  }
  interior() {
    if (this.cI) return this.cI;
    const c = lienzoNuevo(DW, DY1 - DY0), g = c.getContext("2d");
    g.fillStyle = "#9fc8d8"; g.fillRect(0, 0, DW, c.height);
    g.strokeStyle = "rgba(40,80,100,.35)"; g.lineWidth = 2;
    for (let y = 0; y < c.height; y += 24) { g.beginPath(); g.moveTo(0, y); g.lineTo(DW, y); g.stroke(); }
    for (let x = 0; x < DW; x += 24) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, c.height); g.stroke(); }
    g.fillStyle = "#c8e0ea"; rectR(g, 60, 40, 80, 70, 6); g.fill();
    g.fillStyle = "rgba(255,255,255,.5)"; g.fillRect(70, 48, 8, 54);
    g.fillStyle = "#7a9aa8"; g.fillRect(0, c.height - 40, DW, 40);
    const v = g.createLinearGradient(0, 0, 0, c.height);
    v.addColorStop(0, "rgba(0,20,30,.25)"); v.addColorStop(1, "rgba(0,20,30,.55)");
    g.fillStyle = v; g.fillRect(0, 0, DW, c.height);
    return (this.cI = c);
  }
  /** La puerta: bisagra a la izquierda; `ab` 0 cerrada → 1 abierta hacia dentro. */
  puerta(g, ab, t) {
    const t0 = this.t, golpe = t0 > T_POM && t0 < T_LLEGA + 0.4 ? Math.sin(t0 * 44) * 1.6 : 0;
    const w = DW * (1 - 0.8 * ab), H0 = DY1 - DY0;
    g.save(); g.translate(DX0 + golpe, DY0); g.scale(w / DW, 1);
    // la hoja con el cristal (agujero)
    const cx0 = DW * 0.24, cx1 = DW * 0.76, cy0 = VY0 - DY0, cy1 = VY1 - DY0;
    g.beginPath(); g.rect(0, 0, DW, H0); g.rect(cx0, cy0, cx1 - cx0, cy1 - cy0);
    const gr = g.createLinearGradient(0, 0, DW, 0);
    const osc = 0.5 * ab;
    gr.addColorStop(0, `rgb(${150 - 60 * osc},${92 - 40 * osc},${46 - 20 * osc})`); gr.addColorStop(1, `rgb(${112 - 50 * osc},${66 - 30 * osc},${32 - 15 * osc})`);
    g.fillStyle = gr; g.fill("evenodd");
    g.strokeStyle = "rgba(40,20,8,.6)"; g.lineWidth = 3;
    rectR(g, 24, cy1 + 26, DW - 48, 70, 4); g.stroke(); rectR(g, 24, cy1 + 112, DW - 48, H0 - cy1 - 136, 4); g.stroke();
    rectR(g, cx0 - 6, cy0 - 6, cx1 - cx0 + 12, cy1 - cy0 + 12, 4); g.stroke();
    // cristal esmerilado
    g.fillStyle = "rgba(200,230,245,.32)"; g.fillRect(cx0, cy0, cx1 - cx0, cy1 - cy0);
    g.strokeStyle = "rgba(255,255,255,.45)"; g.lineWidth = 6;
    g.beginPath(); g.moveTo(cx0 + 14, cy1 - 10); g.lineTo(cx0 + 44, cy0 + 8); g.moveTo(cx0 + 34, cy1 - 6); g.lineTo(cx0 + 54, cy0 + 40); g.stroke();
    // placa WC
    g.fillStyle = "#f4f0e6"; rectR(g, DW / 2 - 22, cy0 - 50, 44, 30, 5); g.fill();
    txt(g, "WC", DW / 2, cy0 - 26, { tam: 22, peso: 900, fam: FD, color: "#2a5aa0" });
    g.restore();
    // pomo y cerradura (en el borde derecho de la hoja)
    const px = DX0 + golpe + w - 26 * (w / DW);
    const ñec = this.t > T_ÑEC && this.t < T_POM ? 0.5 * Math.max(0, Math.sin(this.t * 30)) : 0;
    g.save(); g.translate(px, POMO[1]); g.scale(w / DW, 1);
    g.fillStyle = "#c89a2a"; g.beginPath(); g.arc(0, 0, 9, 0, 6.283); g.fill();
    g.save(); g.rotate(ñec); g.fillStyle = "#e7c040"; rectR(g, -30, -4, 32, 8, 4); g.fill(); g.fillStyle = "rgba(255,255,255,.5)"; g.fillRect(-26, -3, 22, 2); g.restore();
    g.fillStyle = "#b8862d"; rectR(g, -7, 22, 14, 22, 4); g.fill();
    g.fillStyle = "#1a1a1a"; g.beginPath(); g.arc(0, 30, 2.6, 0, 6.283); g.fill(); g.fillRect(-1, 30, 2, 7);
    g.restore();
  }
  // ------------------------------------------------------------------ dibujar
  dibujar(g) {
    const t = this.t, a = this.luz(), eG = this.poseG(), eM = this.poseM(), ab = this.abierta(t);
    fondo(g, "#000");
    g.save(); g.globalAlpha = a;
    // dentro del baño
    g.drawImage(this.interior(), DX0, DY0);
    if (eG.dentro) {
      g.save(); g.beginPath(); g.rect(DX0, DY0, DW, DY1 - DY0); g.clip();
      pintarAvatar(g, eG.m, eG.G, t);
      g.restore();
    }
    g.drawImage(this.pared(), -60, -60);
    this.puerta(g, ab, t);
    // la llave en su gancho
    if (t < T_COGE) {
      const brilla = t > T_VE - 0.3 && t < T_COGE;
      llave(g, LLAVE[0], LLAVE[1] + 2, 0.08 * Math.sin(t * 2), 1.6);
      if (brilla) brillo(g, LLAVE[0] + 10, LLAVE[1] + 20, 30 * Math.abs(Math.sin(t * 8)), 1);
    }
    // la caja en el suelo
    if (!eM.caja) { g.save(); g.translate(756, PIES - 46); g.scale(ESC, ESC); cajaHerramientas(g, 0, 0, 0); g.restore(); }
    // sombras
    for (const m of [eM.m].concat(eG.dentro ? [] : [eG.m])) { const c = aPant(m, [39, 232]); g.fillStyle = "rgba(0,0,0,.35)"; g.beginPath(); g.ellipse(c[0], PIES + 2, 58, 9, 0, 0, 6.283); g.fill(); }
    if (!eG.dentro && t < T_ABRAZO) pintarAvatar(g, eG.m, eG.G, t);
    pintarAvatar(g, eM.m, eM.M, t);
    if (!eG.dentro && t >= T_ABRAZO) pintarAvatar(g, eG.m, eG.G, t);
    // haz de la linterna del casco sobre la cerradura
    if (eM.foco > 0.05) {
      const R = avatar("bombero").rig, l = aPant(eM.m, [R.cuello[0] - 30, R.cuello[1] - 54]);
      g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.5 * eM.foco;
      const gl = g.createLinearGradient(l[0], l[1], CERR[0], CERR[1]);
      gl.addColorStop(0, "rgba(255,250,200,.9)"); gl.addColorStop(1, "rgba(255,250,200,.15)");
      g.fillStyle = gl; g.beginPath(); g.moveTo(l[0], l[1] - 4); g.lineTo(CERR[0] - 30, CERR[1] - 32); g.lineTo(CERR[0] - 30, CERR[1] + 34); g.lineTo(l[0], l[1] + 4); g.closePath(); g.fill();
      g.globalAlpha = 0.6 * eM.foco; g.drawImage(BLOB.blanco, CERR[0] - 40, CERR[1] - 40, 80, 80);
      g.restore();
    }
    g.restore();
    this.p.dibujar(g);
    // textos
    const ono = (s, x, y, t0, dur, tam, col, borde, rot) => {
      const d = t - t0;
      if (d < 0 || d > dur) return;
      const k = eBack(tramo(d, 0, 0.12));
      g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k);
      txt(g, s, 0, 0, { tam, peso: 400, fam: FC, color: col, borde, bordeAncho: 8, esp: 2, alfa: a * (1 - tramo(d, dur - 0.15, dur)) });
      g.restore();
    };
    ono("CLIC", 600, 380, T_CLIC, 0.5, 40, "#fffdf5", "#1b1b1b", 0.08);
    ono("ÑEC, ÑEC", 640, 400, T_ÑEC + 0.05, 0.6, 42, "#fffdf5", "#1b1b1b", -0.06);
    for (let i = 0; i < 4; i++) ono("¡POM!", [250, 620, 240, 640][i], [300, 250, 440, 470][i], T_POM + i * 0.3, 0.35, 50, "#ffd34d", "#3a2400", i % 2 ? 0.1 : -0.1);
    ono("¡VOY!", 960, 230, T_LLEGA + 0.1, 0.6, 50, "#fffdf5", "#1b1b1b", 0.06);
    ono("¡CLONC!", 800, 470, T_CAJA, 0.45, 44, "#fffdf5", "#1b1b1b", 0.08);
    ono("¡!", 680, 160, T_VE, 0.5, 70, "#ffd34d", "#3a2400", 0);
    ono("¡CLIC!", 190, 300, T_ABRE, 0.9, 90, "#2bff5b", "#03230c", -0.08);
    if (t > T_MIRA + 0.3 && t < T_PIENSA + 0.2) {
      const k = tramo(t, T_MIRA + 0.3, T_MIRA + 0.5) * (1 - tramo(t, T_PIENSA, T_PIENSA + 0.2));
      const b = aPant(eM.m, [60, 20]);
      bocadillo(g, 850, 200, "MMM…", b[0] + 10, b[1] - 10, k * a, 42);
    }
    if (t > T_ENSEÑA + 0.1) { const mk = eM.M._manoI; if (mk) { const q = aPant(eM.m, [mk[0], mk[1] + 18]); brillo(g, q[0] + 8, q[1], 22 * Math.abs(Math.sin(t * 5)), a); } }
    if (t > T_ENSEÑA + 0.2) {
      const k = tramo(t, T_ENSEÑA + 0.2, T_ENSEÑA + 0.45) * (1 - tramo(t, T_APAGA - 0.2, T_APAGA));
      const b = aPant(eM.m, [60, 20]);
      bocadillo(g, 820, 140, "¡ESTABA AL LADO!", b[0] + 10, b[1] - 10, k * a, 40);
    }
    // ¡ÁBREME!
    if (t > T_ABREME && t < T_LLEGA + 0.6) {
      const d = t - T_ABREME, k = tramo(d, 0, 0.16), s = lerp(2.2, 1, eIn(k)), sal = tramo(t, T_LLEGA + 0.3, T_LLEGA + 0.6);
      const r = this.titulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3) * a * (1 - sal);
      g.translate(512 + Math.sin(t * 47) * 5, 92 + Math.cos(t * 39) * 4); g.rotate(-0.04 + 0.03 * Math.sin(t * 22)); g.scale(s, s);
      g.drawImage(r, -r.width / 2, -r.height / 2); g.restore();
    }
    const negro = 1 - a;
    if (negro > 0) { g.fillStyle = `rgba(0,0,0,${negro})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
  titulo() {
    if (CT.has("t")) return CT.get("t");
    const c = lienzoNuevo(760, 210), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 40, 0, 165);
    gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.5, "#ffe0e8"); gr.addColorStop(1, "#ff3d84");
    txt(g, "¡ÁBREME!", 386, 170, { tam: 150, peso: 400, fam: FC, color: "#3a0018", esp: 6 });
    txt(g, "¡ÁBREME!", 380, 162, { tam: 150, peso: 400, fam: FC, color: gr, borde: "#3a0018", bordeAncho: 13, esp: 6, glow: "rgba(255,60,130,.85)", glowTam: 26 });
    CT.set("t", c);
    return c;
  }
}

registrar({ id: "00230", nombre: "Atrapado en el baño", crear: () => new AtrapadoBaño() });
})();
