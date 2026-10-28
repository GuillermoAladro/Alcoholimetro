"use strict";
/*
 * 00209 · LA BARRA DE BAJADA
 *
 * Animación del banco. Empieza y acaba en negro.
 * El parque de bomberos en corte, con dos pisos y la barra en medio. Suena la alarma: Marcos se agarra a la barra y
 * baja en un visto y no visto (¡ZIUUUM!). Guillermo lo intenta, se queda atascado a medio camino dando vueltas
 * alrededor de la barra (¡ÑIIIC!) y acaba bajando despacito, letra a letra: «ziu… u… um». Marcos lo espera abajo
 * mirando el reloj y se parte de risa.
 */
(() => {
const ESC = 1.15;
const BX = 512;                                  // la barra
const ARRIBA = 292, LOSA = 318;                  // suelo de arriba y fondo de la losa
const HUECO = [424, 600];
const XG0 = 270, XM0 = 740, XM_ABAJO = 735;
const XG_BARRA = BX - (71 - 39) * ESC, XM_BARRA = BX + (39 - 5) * ESC;
const T_ALARMA = 0.55, T_CORRE = 1.0, T_SALTA = 1.32, T_ZIUM = 1.5, T_ABAJO = 1.72, T_SALE = 1.95;
const T_G_ANDA = 2.0, T_G_BARRA = 2.55, T_G_BAJA = 2.75, T_ATASCO = 3.35, T_GIRA = 3.5, T_GIRA_FIN = 5.15;
const T_DESPACIO = 5.35, T_LLEGA = 7.45, T_FIN = 8.7, DUR = 9.3;
const MEDIO = 438;                               // donde se atasca (pies)
const CT = cacheTexto();

class BarraBajada extends Escena {
  constructor() {
    super(DUR);
    this.p = new Parts(240);
    this.p.suelo = () => PIES + 4;
  }
  alarma(t) { return t > T_ALARMA && t < T_FIN; }
  /** Pies de Guillermo en la barra durante la bajada lenta (a tirones). */
  bajaLenta(t) {
    const u = tramo(t, T_DESPACIO, T_LLEGA), n = 5;
    const i = Math.min(n - 1, Math.floor(u * n)), f = u * n - i;
    return lerp(MEDIO, PIES, (i + eInOut(clamp(f * 1.6, 0, 1))) / n);
  }
  poses() {
    const t = this.t;
    const G = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [70, 158], manoI: [9, 160] };
    const M = { quien: "bombero", cara: "risa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [67, 152], manoI: [6, 152] };
    let mM, mG, giraDetras = false, xmS = XM0;
    // ---------------- Marcos
    if (t < T_CORRE) {
      M.cara = t < T_ALARMA ? "risa" : "sorpresa"; M.rc = t < T_ALARMA ? -0.1 : 0.05;
      if (t > T_ALARMA) { M.puntas = 0.6 * (1 - tramo(t, T_ALARMA + 0.3, T_CORRE)); }
      if (t < T_ALARMA) { M.manoD = [74, 110 + 6 * Math.sin(t * 12)]; }
      mM = matAv(XM0, ARRIBA, ESC);
    } else if (t < T_SALTA) {
      const u = tramo(t, T_CORRE, T_SALTA), a = andar((t - T_CORRE) * 20, 1.3);
      M.piernaI = a.piernaI; M.piernaD = a.piernaD; M.cara = "guino";
      const s = Math.sin((t - T_CORRE) * 20); M.manoD = [74 + 8 * s, 130]; M.manoI = [0 - 8 * s, 130];
      xmS = lerp(XM0, XM_BARRA + 20, eIn(u));
      mM = matAv(xmS, ARRIBA + a.bote, ESC);
    } else if (t < T_ABAJO) {
      // se agarra y ¡ziuuum!
      const u = tramo(t, T_ZIUM, T_ABAJO);
      M.manoI = [4, 38]; M.manoD = [6, 102]; M.brazoIDelante = false;
      M.piernaI = [-8, -0.1]; M.piernaD = [-14, 0.25];
      M.cara = t < T_ZIUM ? "guino" : "sorpresa"; M.puntas = t > T_ZIUM ? 0.8 : 0;
      const y = lerp(ARRIBA - 10 * Math.sin(Math.PI * tramo(t, T_SALTA, T_ZIUM)), PIES, eIn(u));
      xmS = lerp(XM_BARRA + 20, XM_BARRA, tramo(t, T_SALTA, T_ZIUM));
      mM = matAv(xmS, y, ESC);
    } else {
      // abajo: aterriza, se aparta y espera
      const d = t - T_ABAJO;
      const sy = 1 - 0.12 * Math.exp(-d * 9) * Math.cos(d * 30);
      const u = tramo(t, T_SALE, T_SALE + 0.55);
      xmS = lerp(XM_BARRA, XM_ABAJO, eInOut(u));
      if (t > T_SALE && t < T_SALE + 0.55) { const a = andar((t - T_SALE) * 14, 1); M.piernaI = a.piernaI; M.piernaD = a.piernaD; }
      M.cara = t < T_SALE ? "guino" : "risa"; M.rc = -0.05;
      if (t < T_SALE) { M.manoI = [4, 38]; M.manoD = [6, 102]; }
      // brazos en jarra
      else if (t < T_ATASCO + 0.3) { M.manoD = [80, 140]; M.manoI = [-8, 140]; M.cara = "guino"; M.rc = -0.18; }
      // mira cómo se atasca: sorpresa y se ríe señalando
      else if (t < T_DESPACIO) {
        M.rc = -0.2; M.cara = t < T_GIRA + 0.4 ? "sorpresa" : "risa";
        M.brazoIDelante = true; M.manoI = [-40, 50 + 6 * Math.sin(t * 12)]; M.manoD = [80, 140];
      }
      // espera mirando el reloj y dando golpecitos con el pie
      else if (t < T_LLEGA) {
        const k = eOut(tramo(t, T_DESPACIO, T_DESPACIO + 0.3));
        M.brazoIDelante = true; M.manoI = mezcla([-40, 50], [36, 112], k); M.manoD = mezcla([80, 140], [56, 106], k);
        M.rc = 0.12 * k; M.cara = Math.floor(t * 1.5) % 2 ? "dormido" : "guino";
        M.piernaD = [-8 * Math.max(0, Math.sin(t * 14)), 0];
        if (t > 6.6) { M.rc = -0.18; M.cara = "sorpresa"; M.manoI = [-30, 96]; M.manoD = [92, 96]; }
      } else {
        // ¡por fin! se parte de risa
        M.cara = "risa"; M.rc = 0.1 * Math.sin(t * 9); M.brazoIDelante = true;
        const s = Math.sin(t * 16); M.manoD = [46 + 4 * s, 112]; M.manoI = [26 - 4 * s, 112];
      }
      const bote = t > T_LLEGA ? -4 * Math.abs(Math.sin(t * 16)) : 0;
      mM = matAv(xmS, PIES + bote, ESC, 0, 1, sy);
    }
    // ---------------- Guillermo
    const enBarra = (o, sx = 1) => {
      // en la barra: la barra le queda a su derecha
      G.manoD = [72, 36]; G.manoI = [71, 104]; G.brazoIDelante = true;
      G.piernaI = [-6, -0.18]; G.piernaD = [-12, 0.2];
      return matAv(BX, o, ESC, 0, sx, 1, [71, 232]);
    };
    if (t < T_G_ANDA) {
      G.cara = t < T_ALARMA ? "risa" : "sorpresa"; G.rc = t < T_ALARMA ? 0.1 : 0;
      if (t > T_ALARMA) { G.puntas = 0.5; G.manoD = [92, 70]; G.manoI = [-14, 72]; }
      if (t > T_ZIUM) { G.puntas = 1; G.rc = 0.12; G.manoD = [100, 96]; G.manoI = [-22, 98]; }
      if (t < T_ALARMA) G.manoD = [80, 116 + 5 * Math.sin(t * 10)];
      mG = matAv(XG0, ARRIBA, ESC);
    } else if (t < T_G_BARRA) {
      const u = tramo(t, T_G_ANDA, T_G_BARRA), a = andar((t - T_G_ANDA) * 11, 0.9);
      G.piernaI = a.piernaI; G.piernaD = a.piernaD; G.cara = u < 0.5 ? "sorpresa" : "guino"; G.rc = 0.06;
      G.puntas = 1 - u;
      mG = matAv(lerp(XG0, XG_BARRA, eInOut(u)), ARRIBA + a.bote, ESC);
    } else if (t < T_ATASCO) {
      // se agarra y empieza a bajar… muy poco a poco
      const k = eInOut(tramo(t, T_G_BARRA, T_G_BAJA));
      const y = lerp(ARRIBA, MEDIO, eIn(tramo(t, T_G_BAJA, T_ATASCO)));
      mG = enBarra(y);
      if (k < 1) { G.manoD = mezcla([70, 158], [72, 36], k); G.manoI = mezcla([9, 160], [71, 104], k); }
      G.cara = t < T_G_BAJA ? "guino" : "sonrisa";
    } else if (t < T_DESPACIO) {
      // atascado: da vueltas alrededor de la barra
      const ph = 4 * Math.PI * eInOut(tramo(t, T_GIRA, T_GIRA_FIN));
      const sx = Math.cos(ph);
      giraDetras = Math.sin(ph) > 0.15;
      mG = enBarra(MEDIO + 3 * Math.sin(t * 30) * (t < T_GIRA ? 1 : 0), Math.abs(sx) < 0.2 ? Math.sign(sx || 1) * 0.2 : sx);
      G.cara = t < T_GIRA ? "sorpresa" : t < T_GIRA_FIN ? "borracho" : "sorpresa";
      G.puntas = t > T_GIRA && t < T_GIRA_FIN ? 0.5 : 0;
      G.piernaI = [-10, -0.3 * Math.sin(ph * 2)]; G.piernaD = [-16, 0.3];
    } else {
      // baja despacito… y llega
      if (t < T_LLEGA) {
        mG = enBarra(this.bajaLenta(t));
        G.cara = Math.floor(t * 2) % 3 === 0 ? "guino" : "sonrisa"; G.rc = 0.05;
      } else {
        const d = t - T_LLEGA, k = eOut(tramo(d, 0.15, 0.45));
        const sy = 1 - 0.06 * Math.exp(-d * 8) * Math.cos(d * 26);
        G.manoD = mezcla([72, 36], [104, 30], k); G.manoI = mezcla([71, 104], [-26, 30], k); G.brazoIDelante = false;
        G.cara = d < 0.4 ? "sonrisa" : "risa"; G.rc = -0.05;
        mG = matAv(XG_BARRA - 30 * k, PIES - 10 * Math.sin(Math.PI * tramo(d, 0.1, 0.4)), ESC, 0, 1, sy);
      }
    }
    return { G, M, mG, mM, giraDetras };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    this.una("alarma", t > T_ALARMA, () => temblar(6, 0.25));
    this.una("zium", t > T_ZIUM, () => { temblar(12, 0.3); });
    this.una("abajo", t > T_ABAJO, () => {
      temblar(16, 0.35);
      for (let i = 0; i < 16; i++) p.nueva(P.POLVO, XM_BARRA + azar(-60, 60), PIES, azar(-160, 160), azar(-60, -10), azar(0.5, 0.9), azar(20, 36));
      p.nueva(P.DESTELLO, XM_BARRA, PIES - 30, 0, 0, 0.3, 160);
    });
    if (t > T_GIRA && t < T_GIRA_FIN && Math.random() < 30 * dt) {
      const a = azar(0, 6.283);
      p.nueva(P.CHISPA, BX + Math.cos(a) * 8, MEDIO - 200 * ESC + azar(-10, 10), Math.cos(a) * 200, azar(-160, 0), azar(0.3, 0.5), azar(5, 8));
    }
    this.una("llega", t > T_LLEGA, () => {
      temblar(5, 0.2);
      for (let i = 0; i < 8; i++) p.nueva(P.POLVO, XG_BARRA + azar(-40, 40), PIES, azar(-80, 80), azar(-30, -5), azar(0.4, 0.7), azar(14, 22));
      for (let i = 0; i < 50; i++) p.nueva(P.CONFETI, azar(80, 950), azar(-40, 0), azar(-40, 40), azar(30, 120), azar(1.8, 2.6), azar(9, 14), (Math.random() * 5) | 0);
    });
    p.actualizar(dt);
  }
  // ------------------------------------------------------------------ dibujo
  fondoFijo() {
    if (this.cF) return this.cF;
    const c = lienzoNuevo(W + 120, H + 120), g = c.getContext("2d");
    g.translate(60, 60);
    // piso de arriba
    const ga = g.createLinearGradient(0, -60, 0, ARRIBA);
    ga.addColorStop(0, "#26324a"); ga.addColorStop(1, "#46597a");
    g.fillStyle = ga; g.fillRect(-60, -60, W + 120, ARRIBA + 60);
    g.fillStyle = "rgba(255,255,255,.05)"; for (let x = -60; x < W + 60; x += 64) g.fillRect(x, -60, 3, ARRIBA + 60);
    // taquillas
    for (let i = 0; i < 4; i++) {
      const x = 20 + i * 54;
      const gt = g.createLinearGradient(x, 0, x + 50, 0); gt.addColorStop(0, "#8a98a8"); gt.addColorStop(1, "#5a6878");
      g.fillStyle = gt; g.fillRect(x, 92, 50, ARRIBA - 92);
      g.fillStyle = "rgba(0,0,0,.35)"; for (let k = 0; k < 4; k++) g.fillRect(x + 12, 104 + k * 6, 26, 2);
      g.fillStyle = "#d8dde2"; g.fillRect(x + 40, 180, 4, 22);
    }
    // ventana con la noche
    g.fillStyle = "#1a2236"; g.fillRect(800, 50, 170, 130);
    const gv = g.createLinearGradient(0, 56, 0, 174); gv.addColorStop(0, "#0b1530"); gv.addColorStop(1, "#2a3a6a");
    g.fillStyle = gv; g.fillRect(808, 58, 154, 114);
    g.fillStyle = "#fff6c8"; g.beginPath(); g.arc(920, 92, 16, 0, 6.283); g.fill();
    g.fillStyle = "#1a2236"; g.fillRect(882, 58, 6, 114); g.fillRect(808, 112, 154, 6);
    // suelo de arriba (tarima) y losa con el hueco
    g.fillStyle = "#7a5a3a"; g.fillRect(-60, ARRIBA - 8, W + 120, 10);
    g.fillStyle = "rgba(255,220,170,.35)"; g.fillRect(-60, ARRIBA - 8, W + 120, 2);
    // piso de abajo (garaje)
    const gb = g.createLinearGradient(0, LOSA, 0, PIES);
    gb.addColorStop(0, "#2a2a30"); gb.addColorStop(1, "#4a4a52");
    g.fillStyle = gb; g.fillRect(-60, LOSA, W + 120, PIES - LOSA);
    g.fillStyle = "rgba(255,255,255,.04)"; for (let y = LOSA + 30; y < PIES; y += 40) g.fillRect(-60, y, W + 120, 2);
    // perchero con chaquetones
    for (let i = 0; i < 3; i++) {
      const x = 70 + i * 64;
      g.fillStyle = "#2c4170"; rectR(g, x - 22, 380, 44, 96, 8); g.fill();
      g.fillStyle = "#e9f227"; g.fillRect(x - 22, 440, 44, 5); g.fillStyle = "#dfe6ea"; g.fillRect(x - 22, 446, 44, 4);
      g.fillStyle = "#d8261c"; g.beginPath(); g.ellipse(x, 372, 22, 14, 0, Math.PI, 0); g.fill();
      g.fillStyle = "#222"; g.fillRect(x - 12, 476, 10, 26); g.fillRect(x + 2, 476, 10, 26);
    }
    g.fillStyle = "#6a6a72"; g.fillRect(30, 356, 200, 6);
    // morro del camión
    g.save(); g.translate(860, 0);
    const gc = g.createLinearGradient(0, 360, 0, 560); gc.addColorStop(0, "#ff4a3a"); gc.addColorStop(1, "#9a120c");
    g.fillStyle = gc; rectR(g, 0, 370, 260, 196, 18); g.fill();
    g.fillStyle = "#bfe4ff"; rectR(g, 26, 384, 160, 70, 10); g.fill();
    g.fillStyle = "rgba(255,255,255,.4)"; g.beginPath(); g.moveTo(40, 450); g.lineTo(90, 388); g.lineTo(110, 388); g.lineTo(60, 450); g.fill();
    g.fillStyle = "#d0d6dc"; rectR(g, 20, 480, 190, 40, 6); g.fill();
    g.fillStyle = "#3a3f46"; for (let k = 0; k < 6; k++) g.fillRect(30 + k * 30, 486, 18, 28);
    g.fillStyle = "#fff6c0"; g.beginPath(); g.arc(30, 500, 0, 0, 6.283); g.fill();
    g.fillStyle = "#222"; g.fillRect(-4, 548, 240, 20);
    g.fillStyle = "#1a1a1a"; g.beginPath(); g.arc(70, 566, 30, Math.PI, 0); g.fill();
    g.restore();
    // suelo de abajo
    g.fillStyle = "#5a5a62"; g.fillRect(-60, PIES - 4, W + 120, H + 60 - PIES);
    g.fillStyle = "rgba(255,255,255,.2)"; g.fillRect(-60, PIES - 4, W + 120, 2);
    g.fillStyle = "#f2c21b"; for (let x = -40; x < W + 60; x += 80) { g.beginPath(); g.moveTo(x, PIES + 4); g.lineTo(x + 40, PIES + 4); g.lineTo(x + 30, PIES + 16); g.lineTo(x - 10, PIES + 16); g.fill(); }
    // losa (con el hueco)
    const gl = g.createLinearGradient(0, ARRIBA, 0, LOSA); gl.addColorStop(0, "#9a9aa2"); gl.addColorStop(1, "#5a5a62");
    g.fillStyle = gl; g.fillRect(-60, ARRIBA + 2, HUECO[0] + 60, LOSA - ARRIBA - 2); g.fillRect(HUECO[1], ARRIBA + 2, W + 60 - HUECO[1], LOSA - ARRIBA - 2);
    g.fillStyle = "rgba(0,0,0,.4)"; g.fillRect(HUECO[0] - 4, ARRIBA + 2, 4, LOSA - ARRIBA - 2); g.fillRect(HUECO[1], ARRIBA + 2, 4, LOSA - ARRIBA - 2);
    // rayas de aviso alrededor del hueco
    g.save(); g.beginPath(); g.rect(HUECO[0] - 40, ARRIBA - 8, 40, 10); g.rect(HUECO[1], ARRIBA - 8, 40, 10); g.clip();
    g.fillStyle = "#f2c21b"; g.fillRect(HUECO[0] - 40, ARRIBA - 8, 40, 10); g.fillRect(HUECO[1], ARRIBA - 8, 40, 10);
    g.fillStyle = "#1a1a1a"; for (let x = HUECO[0] - 50; x < HUECO[1] + 50; x += 12) { g.beginPath(); g.moveTo(x, ARRIBA + 2); g.lineTo(x + 6, ARRIBA + 2); g.lineTo(x + 14, ARRIBA - 8); g.lineTo(x + 8, ARRIBA - 8); g.fill(); }
    g.restore();
    return (this.cF = c);
  }
  barra(g) {
    const gr = g.createLinearGradient(BX - 8, 0, BX + 8, 0);
    gr.addColorStop(0, "#7a5200"); gr.addColorStop(0.35, "#ffe38a"); gr.addColorStop(0.6, "#e0a400"); gr.addColorStop(1, "#6e4300");
    g.fillStyle = gr; g.fillRect(BX - 7, -60, 14, PIES + 56);
    g.fillStyle = "#3a3f46"; g.fillRect(BX - 16, PIES - 6, 32, 8);
  }
  rotulo() {
    if (CT.has("t")) return CT.get("t");
    const c = lienzoNuevo(560, 190), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 30, 0, 150);
    gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.5, "#ffe38a"); gr.addColorStop(1, "#ff7a1a");
    txt(g, "¡ZIUUUM!", 286, 146, { tam: 130, peso: 400, fam: FC, color: "#3a1200", esp: 4 });
    txt(g, "¡ZIUUUM!", 280, 140, { tam: 130, peso: 400, fam: FC, color: gr, borde: "#3a1200", bordeAncho: 11, esp: 4, glow: "rgba(255,160,40,.8)", glowTam: 22 });
    CT.set("t", c);
    return c;
  }
  dibujar(g) {
    const t = this.t, e = this.poses();
    fondo(g, "#000");
    g.drawImage(this.fondoFijo(), -60, -60);
    const al = this.alarma(t);
    // luz de alarma girando (arriba y abajo)
    for (const [x, y] of [[140, 34], [420, LOSA + 18]]) {
      g.fillStyle = "#3a3f46"; g.fillRect(x - 16, y - 4, 32, 8);
      g.fillStyle = al && Math.sin(t * 14) > 0 ? "#ff3b2a" : "#7a1a12";
      g.beginPath(); g.arc(x, y + 4, 14, 0, Math.PI); g.fill();
      if (al) {
        g.save(); g.globalCompositeOperation = "lighter";
        const a = t * 7;
        g.globalAlpha = 0.25;
        g.fillStyle = "#ff3b2a";
        g.beginPath(); g.moveTo(x, y + 8); g.arc(x, y + 8, 520, a, a + 0.35); g.closePath(); g.fill();
        g.globalAlpha = 0.6; g.drawImage(BLOB.rojo, x - 50, y - 40, 100, 100);
        g.restore();
      }
    }
    // tinte rojo de la alarma
    if (al) { g.fillStyle = `rgba(255,30,20,${0.08 + 0.06 * Math.sin(t * 14)})`; g.fillRect(-60, -60, W + 120, H + 120); }
    // sombras
    g.fillStyle = "rgba(0,0,0,.3)";
    const pg = aPant(e.mG, [39, 232]), pm = aPant(e.mM, [37, 232]);
    for (const q of [pg, pm]) if (Math.abs(q[1] - ARRIBA) < 4 || Math.abs(q[1] - PIES) < 6) { g.beginPath(); g.ellipse(q[0], q[1] + 2, 44, 7, 0, 0, 6.283); g.fill(); }
    if (!e.giraDetras) this.barra(g);
    // estela de Marcos al bajar
    if (t > T_ZIUM && t < T_ABAJO + 0.15) {
      g.save(); g.globalAlpha = 0.25;
      for (let k = 1; k <= 3; k++) { const m = e.mM.translate(0, -40 * k); pintarAvatar(g, m, e.M, t); }
      g.restore();
      g.strokeStyle = "rgba(255,255,255,.7)"; g.lineWidth = 3;
      for (let k = 0; k < 6; k++) { const x = XM_BARRA - 50 + k * 22, y0 = aPant(e.mM, [37, 0])[1]; g.beginPath(); g.moveTo(x, y0 - 160 - k * 15); g.lineTo(x, y0 - 20); g.stroke(); }
    }
    pintarAvatar(g, e.mM, e.M, t);
    pintarAvatar(g, e.mG, e.G, t);
    if (e.giraDetras) this.barra(g);
    // líneas de giro
    if (t > T_GIRA && t < T_GIRA_FIN) {
      g.save(); g.strokeStyle = "rgba(255,255,255,.6)"; g.lineWidth = 4; g.lineCap = "round";
      for (let k = 0; k < 3; k++) { const y = MEDIO - (60 + k * 80) * ESC, a0 = t * 12 + k; g.beginPath(); g.ellipse(BX, y, 70, 14, 0, a0, a0 + 1.6); g.stroke(); }
      g.restore();
    }
    this.p.dibujar(g);
    const ono = (s, x, y, t0, dur, tam, col, borde, rot) => {
      const d = t - t0;
      if (d < 0 || d > dur) return;
      const k = eBack(tramo(d, 0, 0.1));
      g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k);
      txt(g, s, 0, 0, { tam, peso: 400, fam: FC, color: col, borde, bordeAncho: 8, esp: 2, alfa: 1 - tramo(d, dur - 0.15, dur) });
      g.restore();
    };
    ono("¡RIIING!", 200, 150, T_ALARMA, 0.8, 52, "#ffd34d", "#3a0a00", -0.1);
    ono("¡ÑIIIC!", 330, 170, T_GIRA + 0.1, 0.5, 40, "#fffdf5", "#1b1b1b", -0.12);
    ono("¡ÑIIIC!", 700, 220, T_GIRA + 0.75, 0.5, 40, "#fffdf5", "#1b1b1b", 0.12);
    ono("¡ÑIIIC!", 340, 240, T_GIRA + 1.3, 0.5, 40, "#fffdf5", "#1b1b1b", -0.08);
    ono("¡JA, JA!", 860, 300, T_LLEGA + 0.3, 1.0, 46, "#ffd34d", "#3a2400", 0.1);
    // ¡ZIUUUM! (Marcos)
    if (t > T_ZIUM && t < T_G_BAJA + 0.2) {
      const d = t - T_ZIUM, k = tramo(d, 0, 0.14), sal = tramo(t, T_G_BAJA - 0.1, T_G_BAJA + 0.2);
      const s = lerp(1.15, 1, eIn(k)) * (1 + 0.03 * Math.sin(d * 9));
      const r = this.rotulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3) * (1 - sal); g.translate(800, 150 + 30 * eIn(sal)); g.rotate(0.08); g.scale(s * 0.76, s * 0.76);
      g.drawImage(r, -r.width / 2, -r.height / 2); g.restore();
    }
    // ziu… u… um (Guillermo, despacito): una letra por tirón
    if (t > T_DESPACIO) {
      const letras = ["z", "i", "u", "u", "u", "u", "m"];
      const u = tramo(t, T_DESPACIO, T_LLEGA + 0.1), n = Math.min(letras.length, Math.floor(u * letras.length) + 1);
      const sal = tramo(t, T_FIN - 0.3, T_FIN);
      for (let i = 0; i < n; i++) {
        const t0 = T_DESPACIO + (i / letras.length) * (T_LLEGA + 0.1 - T_DESPACIO), d = t - t0, k = eBack(tramo(d, 0, 0.25));
        const x = 622 + i * 52, y = 110 + i * 16 + 4 * Math.sin(t * 3 + i);
        g.save(); g.translate(x, y); g.scale(k, k); g.rotate(0.12);
        txt(g, letras[i], 0, 0, { tam: 92, peso: 400, fam: FC, color: "#ffe38a", borde: "#3a1200", bordeAncho: 9, alfa: 1 - sal });
        g.restore();
      }
      if (t > T_LLEGA + 0.05) {
        const k = eBack(tramo(t, T_LLEGA + 0.05, T_LLEGA + 0.3));
        g.save(); g.translate(990, 210); g.scale(k, k); g.rotate(0.12);
        txt(g, "…", 0, 0, { tam: 80, peso: 400, fam: FC, color: "#ffe38a", borde: "#3a1200", bordeAncho: 9, alfa: 1 - sal });
        g.restore();
      }
    }
    // entrada y salida
    const a = Math.max(1 - tramo(t, 0.02, 0.42), tramo(t, T_FIN, DUR - 0.03));
    if (a > 0) { g.fillStyle = `rgba(0,0,0,${a})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00209", nombre: "La barra de bajada", crear: () => new BarraBajada() });
})();
