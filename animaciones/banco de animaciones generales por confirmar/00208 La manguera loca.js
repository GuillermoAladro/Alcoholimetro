"use strict";
/*
 * 00208 · LA MANGUERA LOCA
 *
 * Animación del banco. Empieza y acaba en negro.
 * En el patio del parque de bomberos, Marcos abre la manguera… y se vuelve loca como una serpiente: lo levanta del
 * suelo y lo zarandea. Guillermo corre, lo agarra de las botas y salen volando los dos, colgados de la manguera
 * (¡SUJÉTALA!). Se acaba el agua, caen sentados en un charco y sale un arcoíris por encima. Un último chorrito para
 * Guillermo y se ríen los dos.
 */
(() => {
const ESC = 1.35;
const XM0 = 470, XG0 = 770;
const BOCA = [930, 575];                       // boca de riego (base)
const SALIDA = [904, 516];                     // por donde sale la manguera
const T_ABRE = 0.65, T_BULTO = 1.15, T_TIRON = 1.65, T_ZARANDEA = 2.1, T_CORRE = 2.25, T_AGARRA = 2.8;
const T_CORTE = 6.2, T_SUELO = 6.7, T_ARCO = 6.95, T_PFF = 8.0, T_FUNDE = 9.0, DUR = 9.5;
const XG_F = 400, XM_F = 640;                  // donde quedan sentados
const ALTO = 290;                              // altura de los pies de Marcos cuando lo levanta
const CT = cacheTexto();
const aU = (m, q) => { const p = m.inverse().transformPoint(new DOMPoint(q[0], q[1])); return [p.x, p.y]; };

class MangueraLoca extends Escena {
  constructor() {
    super(DUR);
    this.p = new Parts(200);
    this.p.suelo = () => PIES + 6;
    this.gotas = [];
  }
  /** Zoom de la cámara (se aleja mientras vuelan), anclado abajo en el centro. */
  zoom(t) { return lerp(1, 0.72, eInOut(tramo(t, T_TIRON + 0.05, T_ZARANDEA + 0.25))) + (0.28) * eInOut(tramo(t, T_CORTE + 0.05, T_SUELO + 0.15)); }
  /** Vuelo: pies de Marcos en coordenadas del mundo. */
  vuelo(t) {
    const u = t - T_AGARRA;
    return [512 + 210 * Math.sin(2.1 * u) + 36 * Math.sin(5.3 * u), 264 + 30 * Math.sin(3.1 * u) + 6 * Math.sin(11 * u)];
  }
  /** Pies de Marcos (mundo), giro y si sale el chorro. */
  marcos(t) {
    if (t < T_TIRON) return { p: [XM0, PIES], giro: 0 };
    if (t < T_ZARANDEA) {
      const u = tramo(t, T_TIRON, T_ZARANDEA);
      return { p: [XM0 + 10 * Math.sin(u * 30), lerp(PIES, ALTO, eOut(u))], giro: 0.2 * Math.sin(u * 26) };
    }
    const zar = (tt) => [XM0 + 46 * Math.sin(14 * (tt - T_ZARANDEA)), ALTO + 6 * Math.sin(23 * tt)];
    if (t < T_AGARRA) { const p = zar(t); return { p, giro: 0.3 * Math.sin(14 * (t - T_ZARANDEA) + 0.6) }; }
    const pA = zar(T_AGARRA);
    if (t < T_CORTE) {
      const k = eInOut(tramo(t, T_AGARRA, T_AGARRA + 0.6)), f = this.vuelo(t);
      const u = t - T_AGARRA;
      return { p: mezcla(pA, f, k), giro: lerp(0.3 * Math.sin(14 * (T_AGARRA - T_ZARANDEA) + 0.6), 0.32 * Math.sin(2.1 * u + 1.1) + 0.12 * Math.sin(7 * u), k) };
    }
    const f = this.vuelo(T_CORTE), u = tramo(t, T_CORTE, T_SUELO), gi = 0.32 * Math.sin(2.1 * (T_CORTE - T_AGARRA) + 1.1) + 0.12 * Math.sin(7 * (T_CORTE - T_AGARRA));
    return { p: [lerp(f[0], XM_F, eOut(u)), lerp(f[1], PIES, eIn(u))], giro: gi * (1 - u) };
  }
  poses() {
    const t = this.t;
    const G = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [70, 158], manoI: [9, 160] };
    const M = { quien: "bombero", cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [50, 110], manoI: [26, 112], brazoIDelante: true };
    const SM = this.marcos(t);
    let syM = 1;
    // ---- Marcos (con la lanza en las manos)
    let angN = Math.PI;            // hacia dónde apunta la lanza (pantalla): izquierda
    if (t < T_TIRON) {
      M.cara = t < T_ABRE ? "guino" : t < T_BULTO + 0.2 ? "sonrisa" : "sorpresa";
      if (t > T_ABRE - 0.2 && t < T_ABRE + 0.1) M.manoD = [54, 104];
      angN = Math.PI + 0.25 + (t > T_ABRE ? 0.03 * Math.sin(t * 40) : 0);
      M.rc = t > T_BULTO + 0.2 ? 0.16 : 0;
    } else if (t < T_CORTE) {
      const u = t - T_TIRON;
      M.cara = t < T_AGARRA + 1.2 ? "sorpresa" : (Math.floor(t * 3) % 2 ? "borracho" : "sorpresa");
      M.puntas = 0.9; M.rc = 0.2 * Math.sin(t * 9);
      const s = Math.sin(t * 13);
      M.piernaI = [-10 * Math.max(0, s), 0.25 + 0.15 * s]; M.piernaD = [-10 * Math.max(0, -s), -0.25 + 0.15 * s];
      M.manoD = [52 + 6 * s, 106]; M.manoI = [26 + 6 * s, 110];
      // la lanza da latigazos: casi siempre hacia abajo y a un lado (el chorro los empuja hacia arriba)
      angN = Math.PI / 2 + 0.95 * Math.sin(u * 4.2) + 0.25 * Math.sin(u * 11);
    } else {
      // caen y se quedan sentados en el charco
      const u = tramo(t, T_CORTE, T_SUELO);
      M.cara = t < T_SUELO + 0.5 ? "sorpresa" : t < T_ARCO + 0.6 ? "borracho" : "risa";
      M.puntas = 0.9 * (1 - tramo(t, T_SUELO, T_SUELO + 0.6));
      M.manoD = [56, 128]; M.manoI = [30, 130];
      angN = lerp(Math.PI / 2 + 0.6, Math.PI + 0.35, eOut(u));
      if (t > T_SUELO) {
        const d = t - T_SUELO;
        syM = 0.94 - 0.08 * Math.exp(-d * 7) * Math.cos(d * 28);
        M.piernaI = [-26, 0.6]; M.piernaD = [-26, -0.6];
      }
      if (t > T_ARCO) { M.rc = -0.12 * eInOut(tramo(t, T_ARCO, T_ARCO + 0.4)); }
      if (t > T_PFF - 0.3) {
        // apunta a Guillermo… ¡pfff!
        const k = eInOut(tramo(t, T_PFF - 0.3, T_PFF));
        angN = lerp(Math.PI + 0.35, Math.PI - 0.45, k); M.cara = "guino"; M.rc = 0.1;
        if (t > T_PFF + 0.45) { M.cara = "risa"; M.rc = 0.14 * Math.sin(t * 10); }
      }
    }
    const mM = matAv(SM.p[0], SM.p[1], ESC, SM.giro, 1, syM, t > T_SUELO ? [39, 196] : [39, 232]);
    // ---- Guillermo
    let mG;
    if (t < T_CORRE) {
      G.cara = t < T_ABRE ? "sonrisa" : t < T_BULTO ? "risa" : "sorpresa";
      G.rc = t > T_BULTO ? 0.16 : -0.08;
      if (t < T_BULTO) { const k = eOut(tramo(t, 0.3, 0.6)); G.manoD = mezcla([70, 158], [84, 66], k * (1 - tramo(t, T_BULTO - 0.2, T_BULTO))); }
      if (t > T_TIRON) { G.cara = "sorpresa"; G.puntas = 0.6; G.manoI = [-16, 64]; G.manoD = [94, 64]; G.rc = -0.12; }
      mG = matAv(XG0, PIES, ESC);
    } else if (t < T_AGARRA) {
      // corre a por él y le agarra de las botas
      const u = tramo(t, T_CORRE, T_AGARRA);
      const xb = aPant(mM, [37.5, 226]);
      const x = lerp(XG0, xb[0], eInOut(u));
      const a = andar((t - T_CORRE) * 20, 1.4);
      G.piernaI = a.piernaI; G.piernaD = a.piernaD;
      G.cara = "sorpresa"; G.puntas = 0.7;
      const m0 = matAv(x, PIES + a.bote * (1 - u), ESC);
      const k = eInOut(tramo(u, 0.5, 1));
      G.manoD = mezcla([94, 64], aU(m0, [xb[0] + 14, xb[1]]), k); G.manoI = mezcla([-16, 64], aU(m0, [xb[0] - 14, xb[1]]), k);
      mG = m0;
    } else {
      // colgado de las botas (o cayendo)
      const botas = aPant(mM, [37.5, 226]);
      const u = t - T_AGARRA;
      const subir = eInOut(tramo(t, T_AGARRA, T_AGARRA + 0.5));
      const hy = 16;
      G.manoD = [50, hy]; G.manoI = [28, hy];
      G.cara = Math.floor(t * 4) % 3 === 0 ? "sorpresa" : t > 4.2 ? "risa" : "sorpresa";
      G.puntas = 0.9;
      const s = Math.sin(t * 15);
      G.piernaI = [-14 * Math.max(0, s), 0.18 * s]; G.piernaD = [-14 * Math.max(0, -s), 0.18 * s];
      // péndulo: se queda atrás cuando Marcos se mueve
      const giro = subir * (-0.55 * Math.cos(2.1 * u - 0.5) + 0.08 * Math.sin(9 * u));
      const off = rot2([0, (116 - hy) * ESC], giro);
      let c = [botas[0] + off[0], botas[1] + off[1]], gi = giro, sy = 1;
      if (t > T_CORTE) {
        // se suelta y cae sentado
        const k = tramo(t, T_CORTE, T_SUELO);
        const b0 = this.colgadoEn(T_CORTE);
        const fin = [XG_F, PIES - 116 * ESC];
        c = [lerp(b0.c[0], fin[0], eOut(k)), lerp(b0.c[1], fin[1], eIn(k))]; gi = b0.giro * (1 - k);
        G.manoD = mezcla([50, 16], [86, 130], k); G.manoI = mezcla([28, 16], [-8, 130], k);
        G.cara = "sorpresa";
        if (t > T_SUELO) {
          const d = t - T_SUELO;
          sy = 0.94 - 0.08 * Math.exp(-d * 7) * Math.cos(d * 28);
          c[1] = PIES - (195 - 116) * ESC * sy;
          G.piernaI = [-26, 0.6]; G.piernaD = [-26, -0.6];
          G.cara = d < 0.5 ? "sorpresa" : t < T_ARCO + 0.6 ? "borracho" : "risa";
          G.puntas = 0.9 * (1 - tramo(t, T_SUELO, T_SUELO + 0.6));
          if (t > T_ARCO) G.rc = -0.12 * eInOut(tramo(t, T_ARCO, T_ARCO + 0.4));
          if (t > T_PFF + 0.1) { G.cara = t < T_PFF + 0.6 ? "sorpresa" : "risa"; G.rc = 0.12; G.puntas = t < T_PFF + 0.6 ? 0.6 : 0; }
          if (t > T_PFF + 0.6) { G.brazoIDelante = false; G.manoD = [82, 120 + 6 * Math.sin(t * 12)]; }
        }
      }
      mG = matAv(c[0], c[1], ESC, gi, 1, sy, [39, 116]);
    }
    return { G, M, mG, mM, angN };
  }
  /** Centro y giro de Guillermo colgado en el instante t (para empezar la caída). */
  colgadoEn(t) {
    const SM = this.marcos(t), mM = matAv(SM.p[0], SM.p[1], ESC, SM.giro);
    const botas = aPant(mM, [37.5, 226]), u = t - T_AGARRA;
    const giro = -0.55 * Math.cos(2.1 * u - 0.5) + 0.08 * Math.sin(9 * u);
    const off = rot2([0, (116 - 16) * ESC], giro);
    return { c: [botas[0] + off[0], botas[1] + off[1]], giro };
  }
  /** Punta de la lanza y su dirección (mundo). */
  lanza(e) {
    const mano = aPant(e.mM, e.M.manoD);
    const d = [Math.cos(e.angN), Math.sin(e.angN)];
    return { mano, punta: [mano[0] + d[0] * 46, mano[1] + d[1] * 46], cola: [mano[0] - d[0] * 22, mano[1] - d[1] * 22], d };
  }
  chorro(t) { return (t > T_ABRE && t < T_CORTE) ? 1 : (t > T_PFF && t < T_PFF + 0.22 ? 0.35 : 0); }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    const e = this.poses(), L = this.lanza(e), ch = this.chorro(t);
    if (ch > 0) {
      const n = ch < 1 ? 3 : 6;
      for (let i = 0; i < n; i++) {
        if (this.gotas.length > 300) break;
        const v = (ch < 1 ? 380 : azar(700, 900)), a = Math.atan2(L.d[1], L.d[0]) + azar(-0.1, 0.1);
        this.gotas.push({ x: L.punta[0], y: L.punta[1], vx: Math.cos(a) * v, vy: Math.sin(a) * v, r: azar(3, 6.5), vida: azar(0.5, 0.9) });
      }
    }
    for (const q of this.gotas) {
      q.vy += 900 * dt; q.x += q.vx * dt; q.y += q.vy * dt; q.vida -= dt;
      if (q.y > PIES + 4 && q.vida > 0) { q.vida = 0; if (Math.random() < 0.25) p.nueva(P.VAPOR, q.x, PIES - 4, azar(-30, 30), azar(-40, -10), azar(0.4, 0.8), azar(14, 26)); }
    }
    this.gotas = this.gotas.filter((q) => q.vida > 0);
    this.una("tiron", t > T_TIRON, () => temblar(10, 0.3));
    this.una("agarra", t > T_AGARRA, () => temblar(8, 0.2));
    this.una("suelo", t > T_SUELO, () => {
      temblar(16, 0.35);
      for (const x of [XG_F, XM_F]) for (let i = 0; i < 14; i++) {
        const a = azar(-Math.PI, 0), v = azar(120, 380);
        this.gotas.push({ x: x + azar(-50, 50), y: PIES - 4, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 120, r: azar(3, 6), vida: azar(0.5, 0.9) });
      }
    });
    this.una("arco", t > T_ARCO, () => { for (let i = 0; i < 26; i++) p.nueva(P.PURPURINA, azar(150, 870), azar(150, 300), azar(-20, 20), azar(-10, 20), azar(1.2, 2), azar(10, 18)); });
    p.actualizar(dt);
  }
  // ------------------------------------------------------------------ dibujo
  fondoFijo() {
    if (this.cF) return this.cF;
    const OX = 220, OY = 260, c = lienzoNuevo(W + 2 * OX, H + OY + 70), g = c.getContext("2d");
    g.translate(OX, OY);
    const gc = g.createLinearGradient(0, -OY, 0, 470);
    gc.addColorStop(0, "#2f7fd6"); gc.addColorStop(0.6, "#7cc4f4"); gc.addColorStop(1, "#c9ecff");
    g.fillStyle = gc; g.fillRect(-OX, -OY, W + 2 * OX, 760);
    // nubes
    g.fillStyle = "rgba(255,255,255,.85)";
    for (const [x, y, s] of [[90, -120, 1.2], [760, -170, 1], [980, 40, 0.8], [330, 60, 0.7], [-120, 120, 0.9]]) {
      for (const [dx, dy, r] of [[0, 0, 34], [36, -14, 40], [76, 0, 32], [38, 12, 34]]) { g.beginPath(); g.arc(x + dx * s, y + dy * s, r * s, 0, 6.283); g.fill(); }
    }
    // parque de bomberos
    g.fillStyle = "#b8442e"; g.fillRect(-OX, 150, 760 + OX, 430);
    g.fillStyle = "rgba(0,0,0,.12)";
    for (let y = 160; y < 575; y += 22) for (let x = (y / 22) % 2 ? -OX : -OX + 22; x < 760; x += 44) g.fillRect(x, y, Math.min(40, 760 - x), 2);
    g.fillStyle = "#e9dcc4"; g.fillRect(-OX, 138, 772 + OX, 18);
    // cartel
    g.fillStyle = "#1c2b4a"; rectR(g, 120, 172, 330, 64, 10); g.fill();
    g.strokeStyle = "#f2c21b"; g.lineWidth = 4; rectR(g, 128, 180, 314, 48, 6); g.stroke();
    txt(g, "BOMBEROS", 285, 222, { tam: 44, peso: 900, fam: FD, color: "#fffdf5", esp: 6 });
    // portón
    for (const [x0, w] of [[40, 220], [300, 220]]) {
      g.fillStyle = "#3a3f46"; g.fillRect(x0 - 8, 270, w + 16, 305);
      const gp = g.createLinearGradient(0, 278, 0, 575); gp.addColorStop(0, "#d8261c"); gp.addColorStop(1, "#8e140e");
      g.fillStyle = gp; g.fillRect(x0, 278, w, 297);
      g.fillStyle = "rgba(255,255,255,.15)"; for (let y = 300; y < 575; y += 30) g.fillRect(x0, y, w, 3);
      g.fillStyle = "rgba(200,230,255,.6)"; for (let i = 0; i < 4; i++) g.fillRect(x0 + 14 + i * 52, 296, 40, 22);
    }
    // valla al fondo
    g.fillStyle = "#6a8a4a"; g.fillRect(760, 420, W + OX - 760, 155);
    g.strokeStyle = "#e6e0d0"; g.lineWidth = 5;
    for (let x = 770; x < W + OX; x += 34) { g.beginPath(); g.moveTo(x, 470); g.lineTo(x, 575); g.stroke(); }
    g.beginPath(); g.moveTo(760, 488); g.lineTo(W + OX, 488); g.moveTo(760, 540); g.lineTo(W + OX, 540); g.stroke();
    // suelo
    const gs = g.createLinearGradient(0, PIES - 6, 0, H + 60); gs.addColorStop(0, "#9a9a94"); gs.addColorStop(1, "#5a5a56");
    g.fillStyle = gs; g.fillRect(-OX, PIES - 6, W + 2 * OX, 120);
    g.fillStyle = "rgba(255,255,255,.25)"; g.fillRect(-OX, PIES - 6, W + 2 * OX, 2);
    // charco
    g.fillStyle = "rgba(120,190,240,.55)"; g.beginPath(); g.ellipse(520, PIES + 12, 260, 14, 0, 0, 6.283); g.fill();
    this.OX = OX; this.OY = OY;
    return (this.cF = c);
  }
  bocaRiego(g, t) {
    const [x, y] = BOCA;
    g.save(); g.translate(x, y);
    const gr = g.createLinearGradient(-26, 0, 26, 0); gr.addColorStop(0, "#8e140e"); gr.addColorStop(0.45, "#ff5a40"); gr.addColorStop(1, "#7a0c08");
    g.fillStyle = "#5a5a56"; g.fillRect(-34, -10, 68, 10);
    g.fillStyle = gr; rectR(g, -24, -84, 48, 76, 8); g.fill();
    g.beginPath(); g.ellipse(0, -84, 26, 12, 0, Math.PI, 0); g.fill();
    g.fillStyle = "#d8261c"; g.beginPath(); g.arc(0, -96, 12, 0, 6.283); g.fill();
    g.fillStyle = gr; rectR(g, -38, -62, 14, 20, 3); g.fill(); rectR(g, 24, -62, 14, 20, 3); g.fill();
    g.fillStyle = "#f2c21b"; g.fillRect(-26, -30, 52, 6);
    g.fillStyle = "rgba(255,255,255,.3)"; g.fillRect(-14, -80, 5, 64);
    g.restore();
  }
  /** La manguera: de la boca de riego a la lanza, ondulando como una serpiente. */
  manguera(g, t, L) {
    const loca = tramo(t, T_TIRON, T_TIRON + 0.3) * (1 - tramo(t, T_CORTE, T_CORTE + 0.4));
    const A = SALIDA, B = L.cola;
    const c1 = [A[0] - 150, A[1] + 20 - 120 * loca * Math.sin(t * 5)];
    const c2 = [B[0] - L.d[0] * 140, B[1] - L.d[1] * 140];
    const N = 42, pts = [];
    for (let i = 0; i <= N; i++) {
      const s = i / N, a = 1 - s;
      const x = a * a * a * A[0] + 3 * a * a * s * c1[0] + 3 * a * s * s * c2[0] + s * s * s * B[0];
      const y = a * a * a * A[1] + 3 * a * a * s * c1[1] + 3 * a * s * s * c2[1] + s * s * s * B[1];
      pts.push([x, y]);
    }
    // ondas de serpiente (perpendiculares)
    for (let i = 1; i < N; i++) {
      const s = i / N, d = [pts[i + 1][0] - pts[i - 1][0], pts[i + 1][1] - pts[i - 1][1]], l = Math.hypot(d[0], d[1]) || 1;
      const amp = loca * 34 * Math.sin(Math.PI * s) * Math.sin(s * 16 - t * 14);
      pts[i][0] += (-d[1] / l) * amp; pts[i][1] += (d[0] / l) * amp;
    }
    const traza = () => { g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); };
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    const grosor = t > T_CORTE + 0.2 ? 11 : 15;
    traza(); g.strokeStyle = "#6a5a32"; g.lineWidth = grosor + 4; g.stroke();
    g.strokeStyle = "#e8d6a2"; g.lineWidth = grosor; g.stroke();
    g.strokeStyle = "rgba(255,255,255,.45)"; g.lineWidth = 3; g.stroke();
    // bulto de agua que llega
    if (t > T_BULTO && t < T_TIRON + 0.1) {
      const s = tramo(t, T_BULTO, T_TIRON), i = Math.round(s * N), q = pts[i];
      g.fillStyle = "#e8d6a2"; g.strokeStyle = "#6a5a32"; g.lineWidth = 2;
      g.beginPath(); g.arc(q[0], q[1], 16, 0, 6.283); g.fill(); g.stroke();
    }
    g.restore();
  }
  /** La lanza (en la mano de Marcos). */
  dibujarLanza(g, L) {
    g.save(); g.translate(L.mano[0], L.mano[1]); g.rotate(Math.atan2(L.d[1], L.d[0]));
    const gr = g.createLinearGradient(0, -8, 0, 8); gr.addColorStop(0, "#f0f3f5"); gr.addColorStop(0.5, "#9aa4ad"); gr.addColorStop(1, "#4a5258");
    g.fillStyle = "#222"; rectR(g, -24, -9, 22, 18, 4); g.fill();
    g.fillStyle = gr; g.beginPath(); g.moveTo(-4, -9); g.lineTo(40, -5); g.lineTo(46, -6); g.lineTo(46, 6); g.lineTo(40, 5); g.lineTo(-4, 9); g.closePath(); g.fill();
    g.fillStyle = "#d8261c"; g.fillRect(6, -12, 8, 6);
    g.restore();
  }
  dibujarChorro(g, t, L) {
    const ch = this.chorro(t);
    if (ch <= 0) return;
    const P0 = L.punta, d = L.d, len = ch < 1 ? 70 : 330;
    const P2 = [P0[0] + d[0] * len, P0[1] + d[1] * len + (ch < 1 ? 10 : 60)];
    const P1 = [P0[0] + d[0] * len * 0.5, P0[1] + d[1] * len * 0.5];
    g.save(); g.lineCap = "round";
    for (const [w, col] of [[30, "rgba(150,210,255,.35)"], [17, "rgba(190,230,255,.75)"], [7, "rgba(255,255,255,.95)"]]) {
      g.strokeStyle = col; g.lineWidth = w * (ch < 1 ? 0.5 : 1) * (1 + 0.08 * Math.sin(t * 50));
      g.beginPath(); g.moveTo(P0[0], P0[1]); g.quadraticCurveTo(P1[0], P1[1], P2[0], P2[1]); g.stroke();
    }
    g.restore();
  }
  arcoiris(g, t) {
    const a = eInOut(tramo(t, T_ARCO, T_ARCO + 1.0));
    if (a <= 0) return;
    const cols = ["#ff3b3b", "#ff9a1f", "#ffe23b", "#3bd16f", "#2fa8ff", "#7a5cff"];
    g.save(); g.globalAlpha = 0.75 * a; g.lineWidth = 17;
    const fin = Math.PI + Math.PI * eOut(tramo(t, T_ARCO, T_ARCO + 0.9));
    cols.forEach((c, i) => { g.strokeStyle = c; g.beginPath(); g.arc(520, PIES + 30, 430 - i * 16, Math.PI, fin); g.stroke(); });
    g.restore();
  }
  rotulo() {
    if (CT.has("t")) return CT.get("t");
    const c = lienzoNuevo(760, 170), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 30, 0, 140);
    gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.5, "#bfe8ff"); gr.addColorStop(1, "#2fa8ff");
    txt(g, "¡SUJÉTALA!", 386, 132, { tam: 122, peso: 900, fam: FD, color: "#05203a", esp: 5, max: 700 });
    txt(g, "¡SUJÉTALA!", 380, 126, { tam: 122, peso: 900, fam: FD, color: gr, borde: "#05203a", bordeAncho: 11, esp: 5, glow: "rgba(80,180,255,.8)", glowTam: 20, max: 700 });
    CT.set("t", c);
    return c;
  }
  dibujar(g) {
    const t = this.t, e = this.poses(), L = this.lanza(e), z = this.zoom(t);
    fondo(g, "#000");
    g.save();
    g.translate(512, 600); g.scale(z, z); g.translate(-512, -600);
    const F = this.fondoFijo();
    g.drawImage(F, -this.OX, -this.OY);
    this.arcoiris(g, t);
    this.bocaRiego(g, t);
    // sombras
    g.fillStyle = "rgba(0,0,0,.28)";
    const pm = aPant(e.mM, [37, 232]), pg = aPant(e.mG, [39, 232]);
    for (const x of [pm[0], t < T_AGARRA || t > T_SUELO ? (t > T_SUELO ? XG_F : pg[0]) : null]) if (x != null) { g.beginPath(); g.ellipse(x, PIES + 2, 54, 8, 0, 0, 6.283); g.fill(); }
    if (t > T_AGARRA && t < T_SUELO) { g.beginPath(); g.ellipse(pm[0], PIES + 2, 80, 10, 0, 0, 6.283); g.fill(); }
    this.manguera(g, t, L);
    pintarAvatar(g, e.mM, e.M, t);
    this.dibujarLanza(g, L);
    pintarAvatar(g, e.mG, e.G, t);
    this.dibujarChorro(g, t, L);
    // gotas
    g.fillStyle = "rgba(200,235,255,.9)";
    for (const q of this.gotas) { g.beginPath(); g.ellipse(q.x, q.y, q.r * 0.7, q.r, 0, 0, 6.283); g.fill(); }
    this.p.dibujar(g);
    // mareo
    if (t > T_SUELO + 0.3 && t < T_ARCO + 0.7) {
      for (const m of [e.mG, e.mM]) {
        const c = aPant(m, [39, 2]);
        for (let i = 0; i < 3; i++) { const an = t * 5 + i * 2.09; brillo(g, c[0] + Math.cos(an) * 52, c[1] - 8 + Math.sin(an) * 12, 14, 1); }
      }
    }
    g.restore();
    // onomatopeyas
    const ono = (s, x, y, t0, dur, tam, col, borde, rot) => {
      const d = t - t0;
      if (d < 0 || d > dur) return;
      const k = eBack(tramo(d, 0, 0.1));
      g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k);
      txt(g, s, 0, 0, { tam, peso: 400, fam: FC, color: col, borde, bordeAncho: 8, esp: 2, alfa: 1 - tramo(d, dur - 0.15, dur) });
      g.restore();
    };
    ono("¡FSSSH!", 200, 300, T_ABRE + 0.05, 0.75, 52, "#e6f6ff", "#05203a", -0.1);
    ono("¡GLUP!", 760, 400, T_BULTO + 0.1, 0.5, 46, "#fffdf5", "#3a2a10", 0.1);
    ono("¡PLAF!", 512, 330, T_SUELO, 0.6, 70, "#bfe8ff", "#05203a", -0.05);
    ono("¡PFFF!", 470, 300, T_PFF + 0.02, 0.5, 44, "#e6f6ff", "#05203a", 0.08);
    // ¡SUJÉTALA!
    if (t > T_ZARANDEA - 0.1 && t < T_CORTE + 0.2) {
      const d = t - T_ZARANDEA + 0.1, k = tramo(d, 0, 0.16), sal = tramo(t, T_CORTE - 0.1, T_CORTE + 0.2);
      const s = lerp(1.7, 1, eIn(k)) * (1 + 0.04 * Math.sin(d * 16)) * (1 - 0.3 * sal);
      const r = this.rotulo();
      const y = 56;
      g.save(); g.globalAlpha = Math.min(1, k * 3) * (1 - sal); g.translate(512 + 8 * Math.sin(d * 21), y); g.rotate(-0.04 + 0.04 * Math.sin(d * 7)); g.scale(s * 0.8, s * 0.8);
      g.drawImage(r, -r.width / 2, -r.height / 2); g.restore();
    }
    // entrada y salida
    const a = Math.max(1 - tramo(t, 0.02, 0.4), tramo(t, T_FUNDE, DUR - 0.03));
    if (a > 0) { g.fillStyle = `rgba(0,0,0,${a})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00208", nombre: "La manguera loca", crear: () => new MangueraLoca() });
})();
