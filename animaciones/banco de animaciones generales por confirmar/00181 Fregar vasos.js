"use strict";
/*
 * 00181 · FREGAR VASOS
 *
 * Animación del banco. Empieza y acaba en negro.
 * Cadena de montaje detrás de la barra: Marcos saca los vasos del fregadero lleno de espuma, los friega y se los
 * lanza a Guillermo, que los seca con el trapo (ÑIC, ÑIC) y los lanza a la pirámide. Cada vez más rápido, hasta que
 * cae el décimo en la punta (¡TIN!): la pirámide perfecta brilla tanto que se ponen las gafas de sol. ¡RELUCIENTE!
 */
(() => {
const ESC = 1.6, AY = 618, BARRA = 468;
const XM = 226, XG = 604;
const PYX = 836, VW = 46, VH = 62;                       // pirámide: centro y tamaño de cada vaso
const MANO_M = [266, 426], MANO_G = [562, 404];           // donde friega Marcos y donde seca Guillermo (pantalla)
const FREG = [322, 486];                                  // dentro del fregadero
const N = 10;
const T_FIN = 5.35, T_GAFAS = 6.45, T_APAGA = 8.75, DUR = 9.3;
const CT = cacheTexto();
const aU = (X, q, dy = 0) => [(q[0] - X) / ESC + 39, (q[1] - AY - dy) / ESC + 232];

// tiempos de cada vaso: empieza s, dura d (cada vez más rápido)
const S = [], D = [];
{ let s = 0.75; for (let i = 0; i < N; i++) { const d = Math.max(0.36, 1.6 * Math.pow(0.81, i)); S.push(s); D.push(d); s += 0.55 * d; } }
// sitio en la pirámide (de abajo arriba: 4-3-2-1): centro del vaso
const SITIO = [];
{ let n = 4, r = 0; while (n > 0) { for (let c = 0; c < n; c++) SITIO.push([PYX + (c - (n - 1) / 2) * (VW + 4), BARRA - 6 - VH / 2 - r * (VH + 1)]); n--; r++; } }

/** Vaso de caña centrado en (x, y), con espuma (0–1) y brillo. */
function vaso(g, x, y, s, rot, esp, luz) {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  const w0 = VW / 2, w1 = VW / 2 - 5, h = VH / 2;
  g.beginPath(); g.moveTo(-w0, -h); g.lineTo(w0, -h); g.lineTo(w1, h); g.lineTo(-w1, h); g.closePath();
  g.fillStyle = "rgba(190,225,255,.22)"; g.fill();
  g.strokeStyle = "rgba(235,248,255,.95)"; g.lineWidth = 2.4; g.lineJoin = "round"; g.stroke();
  g.fillStyle = "rgba(220,240,255,.5)"; g.fillRect(-w1, h - 6, 2 * w1, 5);
  g.fillStyle = "rgba(255,255,255,.7)"; g.beginPath(); g.moveTo(-w0 + 5, -h + 4); g.lineTo(-w0 + 10, -h + 4); g.lineTo(-w1 + 8, h - 8); g.lineTo(-w1 + 4, h - 8); g.closePath(); g.fill();
  if (esp > 0.02) {
    g.globalAlpha *= esp;
    for (const [ex, ey, r] of [[-12, -h, 6], [-3, -h - 3, 7], [6, -h - 1, 6], [14, -h + 1, 5], [-15, -6, 5], [13, 6, 5], [-5, 15, 4], [4, 2, 4]]) g.drawImage(SPR.espuma, ex - r, ey - r, r * 2, r * 2);
  }
  g.restore();
  if (luz > 0) brillo(g, x + 8, y - 12, 18, luz);
}

class Fregar extends Escena {
  constructor() {
    super(DUR);
    this.p = new Parts(360);
  }
  luz() { return tramo(this.t, 0, 0.5) * (1 - tramo(this.t, T_APAGA, DUR - 0.05)); }
  /** Dónde está el vaso i: { fase, x, y, rot, esp } (fase: 0 no ha salido, 1 Marcos, 2 vuela, 3 Guillermo, 4 vuela, 5 puesto). */
  vasoEn(i, t) {
    const s = S[i], d = D[i], u = (t - s) / d;
    if (u < 0) return { fase: 0 };
    if (u < 0.35) {
      const k = eOut(tramo(u, 0, 0.12)), fr = tramo(u, 0.1, 0.32);
      const p = mezcla(FREG, MANO_M, k);
      return { fase: 1, x: p[0] + Math.sin(fr * 18) * 3, y: p[1], rot: 0.15 * Math.sin(fr * 18), esp: 1 - fr };
    }
    const arco = (a, b, k, alto, vueltas) => ({ x: lerp(a[0], b[0], k), y: lerp(a[1], b[1], k) - 4 * alto * k * (1 - k), rot: vueltas * 6.283 * k });
    if (u < 0.55) return Object.assign({ fase: 2, esp: 0 }, arco(MANO_M, MANO_G, tramo(u, 0.35, 0.55), 110, 1));
    if (u < 0.85) { const k = tramo(u, 0.55, 0.85); return { fase: 3, x: MANO_G[0], y: MANO_G[1] + Math.sin(k * 20) * 2, rot: 0.1 * Math.sin(k * 20), esp: 0 }; }
    if (u < 1.05) return Object.assign({ fase: 4, esp: 0 }, arco(MANO_G, SITIO[i], tramo(u, 0.85, 1.05), 90 + i * 6, -1));
    return { fase: 5, x: SITIO[i][0], y: SITIO[i][1], rot: 0, esp: 0 };
  }
  /** Qué está haciendo cada uno ahora: índice del vaso que tiene en la mano (o -1). */
  enMano(t, fase) { for (let i = 0; i < N; i++) if (this.vasoEn(i, t).fase === fase) return i; return -1; }
  poses() {
    const t = this.t;
    const M = { quien: "marcos", cara: "sonrisa", rc: 0.06, piernaI: [0, 0], piernaD: [0, 0], manoD: [67, 152], manoI: [6, 152] };
    const G = { cara: "sonrisa", rc: -0.06, piernaI: [0, 0], piernaD: [0, 0], manoD: [70, 158], manoI: [9, 160] };
    const prisa = tramo(t, 2.0, 4.6);
    let dyM = 0, dyG = 0;
    // ---- Marcos: mete la mano, saca el vaso, lo friega con la esponja y lo lanza
    const iM = this.enMano(t, 1);
    if (t < T_FIN) {
      M.brazoIDelante = true;
      M.manoI = aU(XM, [MANO_M[0] - 12, MANO_M[1] - 4]);
      M.objI2 = (g, m, ang) => { g.save(); g.translate(m[0], m[1]); g.rotate(ang); g.fillStyle = "#f2c230"; rectR(g, -4, -5, 13, 9, 2.5); g.fill(); g.fillStyle = "#2f8a4a"; g.fillRect(-4, 2, 13, 3); g.restore(); };
      if (iM >= 0) {
        const v = this.vasoEn(iM, t);
        M.manoD = aU(XM, [v.x + 4, v.y + 12]);
        M.manoI = aU(XM, [v.x - 14 + Math.cos(t * 30) * 5, v.y - 4 + Math.sin(t * 30) * 6]);
        const ve = v, aM = ve.rot;
        M.objD = (g, m) => vaso(g, m[0] - 4 / ESC * 0, m[1] - 12 / ESC, 1 / ESC, aM, ve.esp, 0);
      } else {
        // entre vaso y vaso: la mano va al fregadero (o acaba de lanzar)
        let ult = -1; for (let i = 0; i < N; i++) if (t > S[i]) ult = i;
        const lanzado = ult >= 0 ? t - (S[ult] + 0.35 * D[ult]) : 9;
        if (lanzado >= 0 && lanzado < 0.12) M.manoD = aU(XM, [MANO_M[0] + 40, MANO_M[1] - 50]);
        else M.manoD = aU(XM, [FREG[0], FREG[1] + 10]);
      }
      M.cara = prisa > 0.55 ? (Math.sin(t * 9) > 0 ? "risa" : "sorpresa") : Math.sin(t * 2) > 0 ? "sonrisa" : "guino";
      dyM = -Math.abs(Math.sin(t * (6 + 10 * prisa))) * 4 * (0.5 + prisa);
      M.puntas = prisa > 0.75 ? 0.5 : 0;
    }
    // ---- Guillermo: coge el vaso con la izquierda, lo seca con el trapo y lo lanza
    const iG = this.enMano(t, 3);
    const trapo = (g, m, ang) => {
      g.save(); g.translate(m[0], m[1]); g.rotate(ang - Math.PI / 2);
      g.fillStyle = "#f4f1e8"; g.beginPath(); g.moveTo(-8, -2); g.lineTo(8, -2); g.lineTo(10, 26); g.quadraticCurveTo(0, 30, -9, 26); g.closePath(); g.fill();
      g.fillStyle = "#3b6fd1"; g.fillRect(-8.5, 8, 17.5, 2.5); g.fillRect(-9, 16, 18.5, 2.5);
      g.restore();
    };
    G.objD = trapo;
    if (t < T_FIN) {
      G.brazoIDelante = true;
      G.manoI = aU(XG, [MANO_G[0] + 30, MANO_G[1] + 30]);
      G.manoD = aU(XG, [MANO_G[0] + 60, MANO_G[1] + 24]);
      if (iG >= 0) {
        const v = this.vasoEn(iG, t);
        G.manoI = aU(XG, [v.x - 10, v.y + 14]);
        G.manoD = aU(XG, [v.x + 12 + Math.cos(t * 32) * 9, v.y - 4 + Math.sin(t * 32) * 9]);
        const aG = v.rot;
        G.objI = (g, m) => vaso(g, m[0] + 10 / ESC, m[1] - 14 / ESC, 1 / ESC, aG, 0, 0);
        G.cara = "guino";
      } else {
        // acaba de lanzar: brazo arriba hacia la pirámide
        let ult = -1; for (let i = 0; i < N; i++) if (t > S[i] + 0.85 * D[i]) ult = i;
        const lanzado = ult >= 0 ? t - (S[ult] + 0.85 * D[ult]) : 9;
        if (lanzado >= 0 && lanzado < 0.15) G.manoI = aU(XG, [MANO_G[0] + 40, MANO_G[1] - 70]);
        G.cara = "sonrisa";
      }
      if (prisa > 0.55) G.cara = Math.sin(t * 9 + 1) > 0 ? "risa" : "sorpresa";
      G.rc = -0.06 + 0.05 * Math.sin(t * 8);
      dyG = -Math.abs(Math.sin(t * (6 + 10 * prisa) + 1)) * 4 * (0.5 + prisa);
      G.puntas = prisa > 0.75 ? 0.5 : 0;
    }
    // ---- ¡terminada!: deslumbra, se tapan los ojos y se ponen las gafas
    if (t >= T_FIN) {
      const kd = eOut(tramo(t, T_FIN + 0.35, T_FIN + 0.6)) * (1 - eInOut(tramo(t, T_GAFAS - 0.15, T_GAFAS + 0.1)));
      M.cara = t < T_FIN + 0.35 ? "risa" : t < T_GAFAS ? "dormido" : "guino";
      G.cara = t < T_FIN + 0.35 ? "risa" : t < T_GAFAS ? "dormido" : t > 7.6 ? "guino" : "risa";
      M.rc = 0.1; G.rc = -0.1;
      M.brazoIDelante = true; G.brazoIDelante = true;
      // mano de visera
      M.manoD = mezcla([67, 152], [52, 34], kd); M.manoI = [6, 152];
      G.manoI = mezcla([9, 160], [28, 30], kd); G.manoD = [70, 158];
      if (t > T_GAFAS) {
        M.gafas = true; G.gafas = true;
        const kp = eOut(tramo(t, T_GAFAS + 0.2, T_GAFAS + 0.45));
        // pose: Marcos de brazos cruzados, Guillermo trapo al hombro y pulgar arriba
        M.manoD = mezcla([67, 152], [22, 112], kp); M.manoI = mezcla([6, 152], [50, 114], kp);
        G.manoD = mezcla([70, 158], [62, 80], kp); G.manoI = mezcla([9, 160], [-16, 82], kp); G.brazoIDelante = false;
        dyG = -Math.abs(Math.sin((t - T_GAFAS) * 5)) * 6 * (1 - tramo(t, 7.8, 8.3));
      }
    }
    return [
      { pose: M, m: matAv(XM, AY + dyM, ESC) },
      { pose: G, m: matAv(XG, AY + dyG, ESC) },
    ];
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    for (let i = 0; i < N; i++) {
      // sale del agua salpicando
      this.una("sale" + i, t > S[i], () => { for (let k = 0; k < 6; k++) p.nueva(P.ESPUMA, FREG[0] + azar(-20, 20), BARRA - 14, azar(-80, 80), azar(-220, -80), azar(0.3, 0.5), azar(3, 6)); });
      this.una("pon" + i, t > S[i] + 1.05 * D[i], () => {
        temblar(i === N - 1 ? 12 : 3, 0.15);
        const [x, y] = SITIO[i];
        p.nueva(P.DESTELLO, x, y, 0, 0, 0.25, i === N - 1 ? 120 : 60);
        for (let k = 0; k < (i === N - 1 ? 18 : 5); k++) { const a = azar(0, 6.283), v = azar(80, 240); p.nueva(P.CHISPA, x, y, Math.cos(a) * v, Math.sin(a) * v, azar(0.25, 0.45), azar(4, 7)); }
      });
    }
    // burbujas del fregadero
    if (t < T_FIN && Math.random() < 6 * dt) p.nueva(P.ESPUMA, FREG[0] + azar(-50, 50), BARRA - 20, azar(-20, 20), azar(-60, -20), azar(0.4, 0.8), azar(3, 6));
    this.una("fin", t > T_FIN + 0.3, () => {
      temblar(14, 0.35);
      for (let k = 0; k < 30; k++) { const a = azar(0, 6.283), v = azar(150, 420); p.nueva(P.DESTELLO, PYX, 330, Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.6), azar(14, 26)); }
    });
    this.una("gafas", t > T_GAFAS, () => {
      for (const X of [XM, XG]) p.nueva(P.DESTELLO, X, AY - 190 * ESC, 0, 0, 0.3, 90);
      temblar(6, 0.15);
    });
    p.alfa = this.luz();
    p.actualizar(dt);
  }
  fondoBar() {
    if (this.cF) return this.cF;
    const c = lienzoNuevo(W, H), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 0, 0, H);
    gr.addColorStop(0, "#0c1216"); gr.addColorStop(1, "#1a2228");
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    // azulejos blancos de cocina
    g.fillStyle = "rgba(220,235,240,.07)";
    for (let y = 20; y < BARRA; y += 40) for (let x = 0; x < W; x += 40) { rectR(g, x + 2, y + 2, 36, 36, 3); g.fill(); }
    // estante con vasos al fondo
    g.fillStyle = "#3a2516"; g.fillRect(60, 180, W - 120, 8);
    for (let i = 0; i < 18; i++) { g.save(); g.globalAlpha = 0.45; vaso(g, 100 + i * 48, 180 - 22, 0.75, 0, 0, 0); g.restore(); }
    g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.22;
    g.drawImage(BLOB2.cian, W / 2 - 520, 60, 1040, 380);
    g.globalCompositeOperation = "source-over"; g.globalAlpha = 1;
    const v = g.createRadialGradient(W / 2, 300, 220, W / 2, 300, 700);
    v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,.8)");
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
      // fregadero de acero en el tablero
      const ga = x.createLinearGradient(0, 0, 0, 18);
      ga.addColorStop(0, "#dfe6ec"); ga.addColorStop(1, "#7d868e");
      x.fillStyle = ga; rectR(x, FREG[0] - 76, -2, 152, 20, 4); x.fill();
      x.fillStyle = "#3a4048"; rectR(x, FREG[0] - 66, 0, 132, 10, 3); x.fill();
      this.cB = c;
    }
    g.drawImage(this.cB, 0, BARRA - 6);
    g.fillStyle = "#8a5426"; g.fillRect(-60, BARRA - 6, 60, 24); g.fillRect(W, BARRA - 6, 60, 24);
    g.fillStyle = "#1c0f08"; g.fillRect(-60, BARRA + 18, 60, H); g.fillRect(W, BARRA + 18, 60, H);
  }
  /** Montaña de espuma del fregadero (tapa la mano al meterla). */
  espumaFregadero(g, t) {
    // dos montones de burbujas pintados una vez; se alternan para que la espuma «hierva»
    if (!this.cE) {
      this.cE = [0, 1].map((f) => {
        const c = lienzoNuevo(160, 60), x = c.getContext("2d"), r = semilla(3);
        x.translate(80 - FREG[0], 56 - BARRA);
        x.globalAlpha = 0.9; x.fillStyle = "#f3efe4"; x.beginPath(); x.ellipse(FREG[0], BARRA - 8, 70, 16, 0, Math.PI, 0); x.fill(); x.globalAlpha = 1;
        for (let i = 0; i < 34; i++) {
          const u = r(), px = FREG[0] - 66 + u * 132, py = BARRA - 6 - r() * 26 * Math.sin(u * Math.PI) - (f ? Math.sin(i) : -Math.sin(i)) * 1.5, sz = 4 + r() * 6;
          x.drawImage(SPR.espuma, px - sz, py - sz, sz * 2, sz * 2);
        }
        return c;
      });
    }
    g.drawImage(this.cE[Math.floor(t * 5) % 2], FREG[0] - 80, BARRA - 56);
  }
  dibujar(g) {
    const t = this.t, a = this.luz(), e = this.poses();
    fondo(g, "#000");
    g.save(); g.globalAlpha = a;
    g.drawImage(this.fondoBar(), 0, 0);
    foco(g, 512, 512, BARRA, 520, 0.55);
    for (const x of e) pintarAvatar(g, x.m, x.pose, t);
    this.barra(g);
    this.espumaFregadero(g, t);
    // los vasos que vuelan y los de la pirámide
    const brillo0 = t > T_FIN + 0.3 ? tramo(t, T_FIN + 0.3, T_FIN + 1.1) : -1;
    for (let i = 0; i < N; i++) {
      const v = this.vasoEn(i, t);
      if (v.fase === 2 || v.fase === 4) vaso(g, v.x, v.y, 1, v.rot, 0, 0);
      if (v.fase === 5) {
        const bota = t - (S[i] + 1.05 * D[i]) < 0.12 ? -Math.sin(tramo(t - (S[i] + 1.05 * D[i]), 0, 0.12) * Math.PI) * 5 : 0;
        const luz = brillo0 >= 0 ? Math.max(0, Math.sin(t * 5 + i * 2.1)) * (1 - tramo(t, T_APAGA - 0.3, T_APAGA)) : 0;
        vaso(g, v.x, v.y + bota, 1, 0, 0, luz);
      }
    }
    // barrido de brillo por la pirámide
    if (brillo0 >= 0 && brillo0 < 1) {
      g.save();
      g.beginPath(); for (const [x, y] of SITIO) g.rect(x - VW / 2, y - VH / 2, VW, VH); g.clip();
      const bx = lerp(PYX - 160, PYX + 160, brillo0);
      g.translate(bx, 330); g.rotate(0.5);
      const gb = g.createLinearGradient(-30, 0, 30, 0);
      gb.addColorStop(0, "rgba(255,255,255,0)"); gb.addColorStop(0.5, "rgba(255,255,255,.85)"); gb.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = gb; g.fillRect(-30, -260, 60, 520);
      g.restore();
    }
    // resplandor de la pirámide al acabar
    if (t > T_FIN + 0.3) {
      const k = tramo(t, T_FIN + 0.3, T_FIN + 0.7) * (1 - 0.6 * tramo(t, T_GAFAS, T_GAFAS + 0.5)) * (1 - tramo(t, T_APAGA - 0.3, T_APAGA));
      g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.55 * k * (0.85 + 0.15 * Math.sin(t * 9));
      g.drawImage(BLOB2.cian, PYX - 260, 140, 520, 380);
      g.restore();
    }
    g.restore();
    this.p.dibujar(g);
    const ono = (s, x, y, t0, dur, tam, col, borde, rot) => {
      const d = t - t0;
      if (d < 0 || d > dur) return;
      const k = eBack(tramo(d, 0, 0.1));
      g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k);
      txt(g, s, 0, 0, { tam, peso: 400, fam: FC, color: col, borde, bordeAncho: 7, esp: 2, alfa: a * (1 - tramo(d, dur - 0.12, dur)) });
      g.restore();
    };
    for (let i = 0; i < 3; i++) ono("ÑIC, ÑIC", 520, 300, S[i] + 0.58 * D[i], 0.25 * D[i], 36, "#fffdf5", "#1b1b1b", -0.08);
    for (let i = 0; i < N; i++) { const [x, y] = SITIO[i]; ono("¡TIN!", x + 34, y - 30, S[i] + 1.05 * D[i], i === N - 1 ? 0.5 : 0.28, i === N - 1 ? 46 : 30, "#2fe3e8", "#06303a", 0.12); }
    ono("¡MÁS RÁPIDO!", 420, 220, 2.9, 1.0, 40, "#ffd34d", "#3a2400", -0.06);
    // ¡RELUCIENTE!
    if (t > T_FIN + 0.45) {
      const d = t - T_FIN - 0.45, k = tramo(d, 0, 0.16), s = lerp(1.8, 1, eIn(k)) * (1 + 0.02 * Math.sin(d * 7));
      const r = this.titulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3) * a; g.translate(470, 92); g.rotate(-0.03); g.scale(s, s);
      g.drawImage(r, -r.width / 2, -r.height / 2);
      g.restore();
      // destellos sobre las letras
      for (let i = 0; i < 4; i++) { const ph = (t * 1.3 + i * 0.27) % 1; brillo(g, 150 + i * 200, 60 + (i % 2) * 50, 30, a * Math.sin(ph * Math.PI) * tramo(d, 0.2, 0.4)); }
    }
    const negro = 1 - a;
    if (negro > 0) { g.fillStyle = `rgba(0,0,0,${negro})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
  titulo() {
    if (CT.has(1)) return CT.get(1);
    const c = lienzoNuevo(900, 180), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 40, 0, 150);
    gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.5, "#c8f7ff"); gr.addColorStop(1, "#2fb8e8");
    txt(g, "¡RELUCIENTE!", 450, 140, { tam: 132, peso: 900, fam: FD, color: gr, borde: "#03222e", bordeAncho: 12, esp: 5, glow: "rgba(150,235,255,.95)", glowTam: 26, max: 860 });
    CT.set(1, c);
    return c;
  }
}

registrar({ id: "00181", nombre: "Fregar vasos", crear: () => new Fregar() });
})();
