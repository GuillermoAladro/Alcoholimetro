"use strict";
/*
 * 00184 · CATADORES
 *
 * Animación del banco. Empieza y acaba en negro.
 * Cata muy seria detrás de la barra: Guillermo y Marcos (con monóculo) miran su jarra al trasluz, la huelen (SNIF,
 * SNIF), la hacen girar, Guillermo se rasca la barbilla, dan un sorbito con cara de expertos (MMM…), la dejan en la
 * barra, se miran con suspense… y sacan a la vez dos pizarritas con un 10 (¡TAC!): ¡DE DIEZ! Y se la terminan de un
 * trago.
 */
(() => {
const ESC = 1.6, AY = 618, BARRA = 468;
const XS = [352, 672];
const QUIEN = [undefined, "marcos"];
const T_LUZ = 0.65, T_HUELE = 1.95, T_GIRA = 3.05, T_SORBO = 4.3, T_DEJA = 5.45, T_NOTA = 6.35, T_TRAGO = 7.35, T_APAGA = 9.15, DUR = 9.7;
const CT = cacheTexto();
const aU = (X, q) => [(q[0] - X) / ESC + 39, (q[1] - AY) / ESC + 232];
const aS = (X, u) => [X + (u[0] - 39) * ESC, AY + (u[1] - 232) * ESC];
const REPOSO = [76, 120];
const MESA = (q) => [XS[q] + 70, BARRA - 31];             // asa de la jarra apoyada en la barra (pantalla)

/** Pizarrita con un 10 (unidades de avatar; centro en (0,0)). */
function pizarrita(g, x, y, ang) {
  g.save(); g.translate(x, y); g.rotate(ang);
  g.fillStyle = "#8a5426"; rectR(g, -24, -19, 48, 38, 4); g.fill();
  g.fillStyle = "#1f2b25"; g.fillRect(-20, -15, 40, 30);
  txt(g, "10", 0, 11, { tam: 29, peso: 400, fam: FB, color: "#f6f4ec" });
  g.fillStyle = "rgba(255,255,255,.12)"; g.fillRect(-19, -14, 10, 28);
  g.restore();
}

class Catadores extends Escena {
  constructor() {
    super(DUR);
    this.p = new Parts(300);
  }
  luz() { return tramo(this.t, 0, 0.5) * (1 - tramo(this.t, T_APAGA, DUR - 0.05)); }
  nivel(t) { return t < T_SORBO + 0.4 ? 0.92 : t < T_TRAGO ? lerp(0.92, 0.8, tramo(t, T_SORBO + 0.4, T_SORBO + 0.9)) : lerp(0.8, 0, tramo(t, T_TRAGO + 0.45, T_TRAGO + 1.2)); }
  /** ¿La jarra está en la barra (no en la mano)? */
  enBarra(t) { return t > T_DEJA + 0.35 && t < T_TRAGO + 0.12; }
  poses() {
    const t = this.t;
    return [0, 1].map((q) => {
      const X = XS[q], quien = QUIEN[q], R = avatar(quien).rig;
      const A = { quien, cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoI: R.manoI.slice() };
      let mD = REPOSO.slice(), inc = 0, rc = 0;
      const beber = (incB, rcB) => { const b = boca(rcB, quien), r = rot2(JARRA.borde, incB); return [b[0] - r[0], b[1] - r[1]]; };
      // 1 · al trasluz
      if (t > T_LUZ - 0.25 && t < T_HUELE) {
        const k = eInOut(tramo(t, T_LUZ - 0.25, T_LUZ + 0.2));
        mD = mezcla(REPOSO, [q ? 76 : 82, q ? 38 : 26], k); inc = -0.12 * k;
        rc = 0.14 * k + 0.03 * Math.sin(t * 3); A.cara = k > 0.5 ? "guino" : "sonrisa";
        mD[0] += 4 * Math.sin(t * 2.4) * k;
      }
      // 2 · la huelen
      if (t >= T_HUELE - 0.25 && t < T_GIRA) {
        const k = eInOut(tramo(t, T_HUELE - 0.25, T_HUELE + 0.1)), kV = eInOut(tramo(t, T_GIRA - 0.25, T_GIRA));
        const nariz = beber(-0.35, -0.05); nariz[1] += 9;
        mD = mezcla(mezcla([q ? 76 : 82, q ? 38 : 26], nariz, k), REPOSO, kV); inc = lerp(-0.12, -0.35, k) * (1 - kV);
        rc = -0.05 * k; A.cara = k > 0.5 && kV < 0.5 ? "dormido" : "guino";
        if (k > 0.5 && kV < 0.5) rc += 0.04 * Math.sin(t * 14);
      }
      // 3 · la hacen girar
      if (t >= T_GIRA && t < T_SORBO) {
        const u = (t - T_GIRA) * 9, k = tramo(t, T_GIRA, T_GIRA + 0.2) * (1 - tramo(t, T_SORBO - 0.2, T_SORBO));
        mD = [REPOSO[0] + Math.cos(u) * 9 * k, REPOSO[1] - 6 + Math.sin(u) * 6 * k]; inc = 0.16 * Math.sin(u) * k;
        A.cara = "guino"; rc = (q ? -0.1 : 0.1) * k;
        if (q === 0) { A.brazoIDelante = true; A.manoI = mezcla(R.manoI, [40, 78 + 2 * Math.sin(t * 16)], eOut(tramo(t, T_GIRA, T_GIRA + 0.3)) * (1 - eOut(tramo(t, T_SORBO - 0.3, T_SORBO)))); }
      }
      // 4 · sorbito de experto
      if (t >= T_SORBO && t < T_DEJA) {
        const kS = eInOut(tramo(t, T_SORBO, T_SORBO + 0.3)), kT = tramo(t, T_SORBO + 0.3, T_SORBO + 0.75), kB = eInOut(tramo(t, T_SORBO + 0.8, T_SORBO + 1.05));
        rc = -0.2 * eInOut(Math.min(1, kT * 3)) * (1 - kB);
        inc = (-0.4 * kS - 0.75 * eInOut(kT)) * (1 - kB);
        mD = mezcla(mezcla(REPOSO, beber(inc, rc), kS), REPOSO, kB);
        A.cara = kT > 0 && kB < 0.5 ? "dormido" : kB > 0.5 ? "sorpresa" : "guino";
        if (kB > 0.5) rc = 0.12 * Math.sin((t - T_SORBO) * 7);   // mmm…
      }
      // 5 · la dejan en la barra y se miran
      if (t >= T_DEJA && t < T_TRAGO + 0.12) {
        const k = eInOut(tramo(t, T_DEJA, T_DEJA + 0.35)), kV = eInOut(tramo(t, T_DEJA + 0.4, T_DEJA + 0.65));
        const mesa = aU(X, MESA(q));
        mD = mezcla(mezcla(REPOSO, mesa, k), R.manoD, kV);
        if (t > T_TRAGO - 0.2) mD = mezcla(R.manoD, mesa, eInOut(tramo(t, T_TRAGO - 0.2, T_TRAGO + 0.1)));
        rc = (q ? -0.16 : 0.16) * eInOut(tramo(t, T_DEJA + 0.3, T_DEJA + 0.6));
        A.cara = t < T_NOTA ? "sonrisa" : "risa";
        if (t > T_DEJA + 0.6 && t < T_NOTA) { A.cara = "guino"; rc += 0.02 * Math.sin(t * 20); }
      }
      // 6 · ¡la nota! pizarrita arriba con la izquierda
      if (t >= T_NOTA - 0.1) {
        const k = eBack(tramo(t, T_NOTA - 0.1, T_NOTA + 0.12));
        A.manoI = mezcla(R.manoI, q ? [-6, 44] : [-10, 30], k);
        A.objI = (g, m) => pizarrita(g, m[0] - 2, m[1] - 22, -0.12);
        A.cara = t > 8.6 ? "guino" : "risa";
        if (t < T_TRAGO) rc = (q ? -0.1 : 0.1) + 0.05 * Math.sin(t * 8);
      }
      // 7 · y se la terminan de un trago
      if (t >= T_TRAGO + 0.12) {
        const kS = eInOut(tramo(t, T_TRAGO + 0.12, T_TRAGO + 0.4)), kT = tramo(t, T_TRAGO + 0.4, T_TRAGO + 1.2), kB = eInOut(tramo(t, T_TRAGO + 1.25, T_TRAGO + 1.5));
        rc = -0.32 * eInOut(Math.min(1, kT * 3)) * (1 - kB) + (kT > 0 && kT < 1 ? 0.02 * Math.sin(t * 40) : 0);
        inc = (-0.4 * kS - 1.2 * eInOut(kT)) * (1 - kB);
        const mesa = aU(X, MESA(q));
        mD = mezcla(mezcla(mesa, beber(inc, rc), kS), [86, 70], kB);
        if (kB > 0) inc = lerp(inc, -0.3, kB);
        A.cara = kT > 0.05 && kB < 0.5 ? "dormido" : kB >= 0.5 ? (t > 8.6 ? "guino" : "risa") : "risa";
      }
      if (!this.enBarra(t)) A.jarra = { inc, nivel: this.nivel(t) };
      A.manoD = mD; A.rc = rc;
      // el monóculo de Marcos durante la cata
      if (q === 1 && t > T_LUZ && t < T_NOTA - 0.1) {
        const rcM = rc, kM = eBack(tramo(t, T_LUZ, T_LUZ + 0.25));
        A.objD = (g) => {
          g.save(); g.translate(R.cuello[0], R.cuello[1]); g.rotate(rcM); g.translate(-R.cuello[0], -R.cuello[1]);
          const [ox, oy] = R.ojos[1];
          g.strokeStyle = "#e7a900"; g.lineWidth = 1.6;
          g.beginPath(); g.arc(ox, oy, 7.5 * kM, 0, 6.283); g.stroke();
          g.fillStyle = "rgba(200,230,255,.25)"; g.fill();
          g.strokeStyle = "rgba(231,169,0,.8)"; g.lineWidth = 0.8;
          g.beginPath(); g.moveTo(ox + 7 * kM, oy + 2); g.quadraticCurveTo(ox + 12, oy + 22, ox + 4, oy + 34); g.stroke();
          g.restore();
        };
      }
      return { pose: A, m: matAv(X, AY, ESC) };
    });
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    // aroma que sube a la nariz
    if (t > T_HUELE + 0.1 && t < T_GIRA - 0.2 && Math.random() < 16 * dt) for (const q of [0, 1]) {
      const e = this.poses()[q], b = aPant(e.m, boca(-0.05, QUIEN[q]));
      p.nueva(P.VAPOR, b[0] + azar(-10, 10), b[1] + 26, azar(-10, 10), azar(-60, -30), azar(0.4, 0.7), azar(10, 18));
    }
    this.una("nota", t > T_NOTA, () => {
      temblar(14, 0.35);
      for (const q of [0, 1]) {
        const e = this.poses()[q], m = aPant(e.m, e.pose.manoI);
        p.nueva(P.DESTELLO, m[0], m[1] - 30, 0, 0, 0.3, 120);
        for (let k = 0; k < 12; k++) { const a = azar(0, 6.283), v = azar(120, 300); p.nueva(P.CHISPA, m[0], m[1] - 30, Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.6), azar(5, 8)); }
      }
      for (let k = 0; k < 80; k++) p.nueva(P.CONFETI, azar(30, W - 30), azar(-80, -10), azar(-40, 40), azar(0, 120), azar(2.2, 3.2), azar(9, 14), k % 5);
    });
    this.una("deja", t > T_DEJA + 0.35, () => temblar(4, 0.12));
    p.suelo = () => BARRA - 6;
    p.alfa = this.luz();
    p.actualizar(dt);
  }
  fondoBar() {
    if (this.cF) return this.cF;
    const c = lienzoNuevo(W, H), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 0, 0, H);
    gr.addColorStop(0, "#140c08"); gr.addColorStop(1, "#24140a");
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    // barriles al fondo
    for (const [x, y] of [[90, 330], [190, 330], [140, 250], [880, 330], [980, 330], [930, 250]]) {
      const gb = g.createLinearGradient(x - 46, 0, x + 46, 0);
      gb.addColorStop(0, "#3a2010"); gb.addColorStop(0.5, "#8a5426"); gb.addColorStop(1, "#3a2010");
      g.fillStyle = gb; g.beginPath(); g.ellipse(x, y, 46, 40, 0, 0, 6.283); g.fill();
      g.strokeStyle = "#2a2e33"; g.lineWidth = 4; g.beginPath(); g.ellipse(x, y, 30, 40, 0, 0, 6.283); g.stroke();
      g.fillStyle = "#5a3218"; g.beginPath(); g.ellipse(x, y, 16, 14, 0, 0, 6.283); g.fill();
    }
    // lámparas colgantes
    for (const x of XS) {
      g.strokeStyle = "#111"; g.lineWidth = 2; g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 46); g.stroke();
      g.fillStyle = "#2a2e33"; g.beginPath(); g.moveTo(x - 30, 72); g.lineTo(x + 30, 72); g.lineTo(x + 12, 46); g.lineTo(x - 12, 46); g.closePath(); g.fill();
      g.fillStyle = "#fff3c4"; g.beginPath(); g.ellipse(x, 72, 22, 5, 0, 0, 6.283); g.fill();
    }
    g.globalCompositeOperation = "lighter";
    for (const x of XS) { g.globalAlpha = 0.5; g.drawImage(BLOB2.oro, x - 220, 30, 440, 420); }
    g.globalCompositeOperation = "source-over"; g.globalAlpha = 1;
    const v = g.createRadialGradient(W / 2, 300, 220, W / 2, 300, 700);
    v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,.75)");
    g.fillStyle = v; g.fillRect(0, 0, W, H);
    return (this.cF = c);
  }
  barra(g) {
    if (!this.cB) {
      const c = lienzoNuevo(W, H - BARRA + 20), x = c.getContext("2d");
      const gr = x.createLinearGradient(0, 0, 0, c.height);
      gr.addColorStop(0, "#5a3218"); gr.addColorStop(1, "#1c0f08");
      x.fillStyle = gr; x.fillRect(0, 10, W, c.height);
      x.fillStyle = "rgba(0,0,0,.35)"; for (let i = 30; i < W; i += 96) x.fillRect(i, 26, 3, c.height);
      x.fillStyle = "#b8862d"; x.fillRect(0, 104, W, 8); x.fillStyle = "rgba(255,240,190,.55)"; x.fillRect(0, 105, W, 2);
      x.fillStyle = "#8a5426"; x.fillRect(0, 0, W, 18);
      x.fillStyle = "rgba(255,220,170,.45)"; x.fillRect(0, 0, W, 3);
      x.fillStyle = "rgba(0,0,0,.45)"; x.fillRect(0, 18, W, 5);
      this.cB = c;
    }
    g.drawImage(this.cB, 0, BARRA - 6);
    g.fillStyle = "#8a5426"; g.fillRect(-60, BARRA - 6, 60, 24); g.fillRect(W, BARRA - 6, 60, 24);
    g.fillStyle = "#1c0f08"; g.fillRect(-60, BARRA + 18, 60, H); g.fillRect(W, BARRA + 18, 60, H);
  }
  dibujar(g) {
    const t = this.t, a = this.luz(), e = this.poses();
    fondo(g, "#000");
    g.save(); g.globalAlpha = a;
    g.drawImage(this.fondoBar(), 0, 0);
    // haz de luz de cada lámpara (más fuerte al mirar al trasluz)
    const kL = 0.45 + 0.4 * tramo(t, T_LUZ, T_LUZ + 0.3) * (1 - tramo(t, T_HUELE - 0.3, T_HUELE));
    for (const x of XS) foco(g, x, x, BARRA, 170, kL);
    for (const x of e) pintarAvatar(g, x.m, x.pose, t);
    // brillo dorado de la cerveza al trasluz
    if (t > T_LUZ && t < T_HUELE) {
      const k = tramo(t, T_LUZ, T_LUZ + 0.3) * (1 - tramo(t, T_HUELE - 0.3, T_HUELE));
      g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.6 * k * a;
      for (const x of e) { const m = x.pose._manoD; if (!m) continue; const s = aPant(x.m, [m[0] + 17, m[1]]); g.drawImage(BLOB2.oro, s[0] - 60, s[1] - 60, 120, 120); }
      g.restore();
    }
    this.barra(g);
    // jarras apoyadas en la barra
    if (this.enBarra(t)) for (const q of [0, 1]) {
      const [x, y] = MESA(q);
      g.save(); g.translate(x, y); g.scale(ESC, ESC);
      dibujarJarra(g, [0, 0], 0, this.nivel(t), "asa", t); dibujarJarra(g, [0, 0], 0, this.nivel(t), "cuerpo", t);
      g.restore();
    }
    g.restore();
    this.p.dibujar(g);
    const ono = (s, x, y, t0, dur, tam, col, borde, rot) => {
      const d = t - t0;
      if (d < 0 || d > dur) return;
      const k = eBack(tramo(d, 0, 0.1));
      g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k);
      txt(g, s, 0, 0, { tam, peso: 400, fam: FC, color: col, borde, bordeAncho: 8, esp: 2, alfa: a * (1 - tramo(d, dur - 0.15, dur)) });
      g.restore();
    };
    ono("¿A VER…?", 512, 200, T_LUZ + 0.3, 1.0, 40, "#fffdf5", "#1b1b1b", -0.05);
    ono("SNIF, SNIF", 512, 230, T_HUELE + 0.15, 0.8, 42, "#fffdf5", "#1b1b1b", 0.06);
    ono("¡CHAP, CHAP!", 512, 210, T_GIRA + 0.15, 0.95, 40, "#ffd34d", "#3a2400", -0.06);
    ono("MMM…", 512, 220, T_SORBO + 0.85, 0.75, 52, "#fffdf5", "#1b1b1b", 0.05);
    ono("…", 512, 230, T_DEJA + 0.55, 0.4, 70, "#fffdf5", "#1b1b1b", 0);
    ono("¡TAC!", 512, 260, T_NOTA, 0.45, 48, "#2fe3e8", "#06303a", -0.08);
    ono("GLU, GLU, GLU", 512, 300, T_TRAGO + 0.45, 0.75, 40, "#ffd34d", "#3a2400", 0.05);
    // ¡DE DIEZ!
    if (t > T_NOTA + 0.08) {
      const d = t - T_NOTA - 0.08, k = tramo(d, 0, 0.16), s = lerp(1.8, 1, eIn(k)) * (1 + 0.025 * Math.sin(d * 7));
      const r = this.titulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3) * a; g.translate(512, 100); g.rotate(-0.04); g.scale(s, s);
      g.drawImage(r, -r.width / 2, -r.height / 2);
      g.restore();
    }
    const negro = 1 - a;
    if (negro > 0) { g.fillStyle = `rgba(0,0,0,${negro})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
  titulo() {
    if (CT.has(1)) return CT.get(1);
    const c = lienzoNuevo(700, 200), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 40, 0, 160);
    gr.addColorStop(0, "#fffef0"); gr.addColorStop(0.5, "#ffe58a"); gr.addColorStop(1, "#f2a100");
    txt(g, "¡DE DIEZ!", 350, 158, { tam: 150, peso: 900, fam: FD, color: gr, borde: "#3a2400", bordeAncho: 13, esp: 6, glow: "rgba(255,200,40,.9)", glowTam: 26, max: 660 });
    CT.set(1, c);
    return c;
  }
}

registrar({ id: "00184", nombre: "Catadores", crear: () => new Catadores() });
})();
