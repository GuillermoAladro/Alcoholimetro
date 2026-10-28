"use strict";
/*
 * 00212 · FALSA ALARMA
 *
 * Animación del banco. Empieza y acaba en negro.
 * En el bar, Guillermo silba junto a la tostadora mientras sale un hilo de humo… que llega al detector del techo:
 * ¡PIII! Marcos entra derrapando con el extintor y apunta… y salta una tostada quemadísima (¡CLONC!). Marcos la caza al
 * vuelo: ¡FALSA ALARMA! Se encoge de hombros y se la come en tres bocados (¡CRUNCH!), con humito por la boca y el
 * pulgar arriba. Guillermo se parte de risa.
 */
(() => {
const ESC = 1.4;
const XG = 316, XM = 708, XM0 = 1180;
const MESA = [512, 430];                          // tablero de la mesa alta
const TOST = [512, 430];                          // tostadora (base)
const DET = [512, 16];                            // detector de humo
const T_PIII = 1.35, T_ENTRA = 1.9, T_FRENA = 2.3, T_APUNTA = 2.45, T_CLONC = 2.95, T_CAZA = 3.55, T_TXT = 3.65;
const T_MORDISCOS = [4.75, 5.35, 5.95], T_PULGAR = 6.5, T_PALANCA = 6.8, T_DORADA = 7.25, T_COGE = 7.75, T_FIN = 9.0, DUR = 9.5;
const CT = cacheTexto();
const aU = (m, q) => { const p = m.inverse().transformPoint(new DOMPoint(q[0], q[1])); return [p.x, p.y]; };

/** Tostada centrada en (x, y); `bocados` 0–3 (se la va comiendo por arriba); `dorada` = la buena. */
function tostada(g, x, y, s, ang, bocados = 0, dorada = false) {
  if (bocados >= 3) return;
  g.save(); g.translate(x, y); g.rotate(ang); g.scale(s, s);
  const w = 30, h = 32, top = -h / 2 + 6 + (bocados / 3) * (h - 6);
  const forma = (enc) => {
    g.beginPath();
    g.moveTo(-w / 2 + enc, h / 2 - 3 - enc); g.quadraticCurveTo(-w / 2 + enc, h / 2 - enc, -w / 2 + 3 + enc, h / 2 - enc);
    g.lineTo(w / 2 - 3 - enc, h / 2 - enc); g.quadraticCurveTo(w / 2 - enc, h / 2 - enc, w / 2 - enc, h / 2 - 3 - enc);
    if (bocados > 0) {
      g.lineTo(w / 2 - enc, top + enc);
      const n = 3;
      for (let i = 0; i < n; i++) { const x0 = w / 2 - (i * w) / n, x1 = w / 2 - ((i + 1) * w) / n; g.arc((x0 + x1) / 2, top + enc, w / n / 2, 0, Math.PI, true); }
      g.lineTo(-w / 2 + enc, top + enc);
    } else {
      // copete de pan de molde
      g.lineTo(w / 2 - enc, -h / 2 + 8);
      g.bezierCurveTo(w / 2 + 6 - enc, -h / 2 + 2, w / 2 - 2 - enc, -h / 2 - 6 + enc, w / 4, -h / 2 - 4 + enc);
      g.quadraticCurveTo(0, -h / 2 - 8 + enc, -w / 4, -h / 2 - 4 + enc);
      g.bezierCurveTo(-w / 2 + 2 + enc, -h / 2 - 6 + enc, -w / 2 - 6 + enc, -h / 2 + 2, -w / 2 + enc, -h / 2 + 8);
    }
    g.closePath();
  };
  forma(0); g.fillStyle = dorada ? "#b8641a" : "#24140a"; g.fill();
  g.lineWidth = 1.5; g.strokeStyle = dorada ? "#6a3408" : "#0a0502"; g.stroke();
  forma(3.2);
  const gr = g.createRadialGradient(-4, -4, 2, 0, 0, 20);
  if (dorada) { gr.addColorStop(0, "#ffe9a8"); gr.addColorStop(1, "#e8a640"); }
  else { gr.addColorStop(0, "#5a3a24"); gr.addColorStop(1, "#2e1a0e"); }
  g.fillStyle = gr; g.fill();
  g.save(); forma(3.2); g.clip();
  if (!dorada) {
    g.fillStyle = "#0c0705";
    for (const [cx, cy, r] of [[-6, -5, 6], [5, 3, 7], [-3, 8, 4], [8, -8, 3.5]]) { g.beginPath(); g.arc(cx, cy, r, 0, 6.283); g.fill(); }
    g.fillStyle = "rgba(255,110,30,.45)"; g.beginPath(); g.arc(5, 3, 2, 0, 6.283); g.arc(-6, -5, 1.6, 0, 6.283); g.fill();
  } else {
    g.fillStyle = "rgba(255,255,255,.35)"; g.fillRect(-9, -8, 4, 16);
  }
  g.restore();
  g.restore();
}
/** Extintor rojo; (x, y) = el asa. */
function extintor(g, x, y, s, ang = 0) {
  g.save(); g.translate(x, y); g.rotate(ang); g.scale(s, s);
  const gr = g.createLinearGradient(-9, 0, 9, 0); gr.addColorStop(0, "#7a0c08"); gr.addColorStop(0.4, "#ff4a3a"); gr.addColorStop(1, "#8e140e");
  g.fillStyle = "#2a2a2e"; g.fillRect(-6, -4, 12, 6);
  g.fillStyle = "#3a3a40"; g.fillRect(-3, 0, 6, 6);
  g.fillStyle = gr; rectR(g, -9, 5, 18, 42, 7); g.fill();
  g.fillStyle = "#f2f2ea"; g.fillRect(-7, 18, 14, 12);
  g.fillStyle = "#d8261c"; g.fillRect(-4, 21, 8, 2); g.fillRect(-1, 19, 2, 8);
  g.strokeStyle = "#1a1a1a"; g.lineWidth = 3; g.lineCap = "round";
  g.beginPath(); g.moveTo(5, 1); g.quadraticCurveTo(18, 6, 14, 26); g.stroke();
  g.fillStyle = "rgba(255,255,255,.35)"; g.fillRect(-6, 8, 2.5, 34);
  g.restore();
}

class FalsaAlarma extends Escena {
  constructor() {
    super(DUR);
    this.p = new Parts(360);
    this.p.suelo = () => PIES + 4;
    this.migas = [];
  }
  alarma(t) { return t > T_PIII && t < T_CLONC + 0.1; }
  /** Bocados que lleva Marcos. */
  bocados(t) { return T_MORDISCOS.filter((x) => t > x).length; }
  /** Tostada en vuelo o null. */
  vuelo(t, manoM) {
    if (t < T_CLONC || t > T_CAZA) return null;
    const u = tramo(t, T_CLONC, T_CAZA), a = [TOST[0] - 6, TOST[1] - 66];
    return [lerp(a[0], manoM[0], u), lerp(a[1], manoM[1], u) - 230 * Math.sin(Math.PI * u), u * 9];
  }
  poses() {
    const t = this.t;
    const G = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [70, 158], manoI: [9, 160] };
    const M = { quien: "bombero", cara: "sorpresa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [67, 152], manoI: [6, 152] };
    let xm = XM0, ym = PIES, giroM = 0, yg = PIES;
    const mG0 = matAv(XG, PIES, ESC);
    // ---------------- Guillermo
    if (t < T_PIII) {
      // silbando, con la mano en la palanca de la tostadora
      G.manoD = aU(mG0, [TOST[0] - 52, TOST[1] - 34 + 2 * Math.sin(t * 8)]); G.cara = Math.floor(t * 2) % 3 === 2 ? "guino" : "sonrisa";
      G.rc = 0.06 * Math.sin(t * 4);
    } else if (t < T_CAZA) {
      // se tapa los oídos
      G.brazoIDelante = true; G.manoD = [74, 44]; G.manoI = [4, 44]; G.cara = "sorpresa"; G.puntas = 0.7 * (1 - tramo(t, T_CLONC, T_CAZA));
      yg = PIES - (t < T_PIII + 0.3 ? 30 * Math.sin(Math.PI * tramo(t, T_PIII, T_PIII + 0.3)) : 0);
      G.rc = t > T_ENTRA ? 0.12 : 0;
      if (t > T_CLONC) { G.cara = "sorpresa"; G.rc = 0; G.manoD = [96, 70]; G.manoI = [-18, 72]; G.brazoIDelante = false; }
    } else if (t < T_PULGAR) {
      // mano en la nuca, pillado
      G.manoI = [-8, 118]; G.manoD = [58, 24]; G.cara = t < T_MORDISCOS[0] ? "guino" : "sorpresa"; G.rc = 0.1;
      if (t > T_MORDISCOS[1]) { G.cara = "risa"; G.manoD = [74, 140]; }
    } else if (t < T_PALANCA) {
      // se parte de risa
      G.cara = "risa"; G.rc = 0.12 * Math.sin(t * 9); G.brazoIDelante = true;
      const s = Math.sin(t * 16); G.manoD = [50 + 4 * s, 116]; G.manoI = [28 - 4 * s, 116];
      yg = PIES - 3 * Math.abs(Math.sin(t * 16));
    } else if (t < T_DORADA) {
      // otra tostada, esta vez bien
      const k = eInOut(tramo(t, T_PALANCA, T_PALANCA + 0.25));
      G.manoD = mezcla([70, 150], aU(mG0, [TOST[0] - 52, TOST[1] - 12]), k); G.cara = "guino"; G.rc = 0.08;
    } else {
      const k = eOut(tramo(t, T_DORADA, T_COGE));
      G.manoD = mezcla([84, 120], [96, 40], k); G.cara = t < T_COGE ? "sorpresa" : (Math.floor(t * 3) % 3 ? "risa" : "guino"); G.rc = -0.08;
      if (t > T_COGE) G.objD2 = (g, mano) => tostada(g, mano[0] - 2, mano[1] - 16, 1.25, -0.1, 0, true);
    }
    // ---------------- Marcos
    let tostEnMano = false;
    if (t < T_ENTRA) {
      xm = XM0;
    } else if (t < T_FRENA) {
      const u = tramo(t, T_ENTRA, T_FRENA), a = andar((t - T_ENTRA) * 26, 1.6);
      xm = lerp(XM0, XM - 20, eOut(u)); M.piernaI = a.piernaI; M.piernaD = a.piernaD; ym += a.bote;
      giroM = -0.1; M.cara = "sorpresa"; M.manoD = [92, 120]; M.manoI = [-10, 100];
    } else if (t < T_CLONC) {
      // derrapa y apunta con el extintor
      const u = tramo(t, T_FRENA, T_APUNTA);
      xm = lerp(XM - 20, XM, eOut(u)); giroM = lerp(0.14, 0, eOut(tramo(t, T_FRENA, T_APUNTA + 0.15)));
      M.cara = "guino"; M.rc = 0.06;
      const k = eInOut(tramo(t, T_FRENA, T_APUNTA + 0.1));
      M.manoD = mezcla([92, 120], [72, 138], k); M.manoI = mezcla([-10, 100], [-16, 102], k); M.brazoIDelante = true;
      M.lanza = k;
      M.piernaI = [0, 0.12]; M.piernaD = [0, -0.12];
    } else {
      xm = XM;
      // caza la tostada con la izquierda
      M.manoD = [70, 150];
      const mano0 = [-14, 96];
      if (t < T_CAZA) { M.cara = "sorpresa"; M.rc = 0.18; M.manoI = mezcla([-16, 102], mano0, eOut(tramo(t, T_CLONC, T_CLONC + 0.3))); M.puntas = 0.4; }
      else if (t < T_MORDISCOS[0] - 0.35) {
        tostEnMano = true;
        // la mira, se encoge de hombros
        const k = eInOut(tramo(t, T_CAZA + 0.3, T_CAZA + 0.6));
        M.manoI = mezcla(mano0, [-4, 90], k); M.rc = 0.18 - 0.1 * k; M.cara = t < T_CAZA + 0.5 ? "sorpresa" : "dormido";
        if (t > T_CAZA + 0.75) { M.cara = "guino"; M.rc = -0.06; }
      } else {
        tostEnMano = this.bocados(t) < 3;
        // a la boca: tres mordiscos
        const b = boca(M.rc, "bombero");
        let lejos = 0;
        for (const tm of T_MORDISCOS) lejos = Math.max(lejos, Math.max(0, 1 - Math.abs(t - tm - 0.25) / 0.25));
        const cerca = [b[0] - 10, b[1] + 6], fuera = [-2, 96];
        const k = t < T_MORDISCOS[0] ? eInOut(tramo(t, T_MORDISCOS[0] - 0.35, T_MORDISCOS[0])) : 1 - 0.75 * lejos;
        M.manoI = mezcla(fuera, cerca, k); M.brazoIDelante = true;
        M.cara = Math.abs(Math.sin(t * 14)) > 0.5 ? "sonrisa" : "guino"; M.rc = 0.04;
        if (t > T_MORDISCOS[2] + 0.2) { M.manoI = mezcla(cerca, fuera, eOut(tramo(t, T_MORDISCOS[2] + 0.2, T_MORDISCOS[2] + 0.45))); M.cara = "sonrisa"; }
        if (t > T_PULGAR) {
          // pulgar arriba y humito por la boca
          const k2 = eOut(tramo(t, T_PULGAR, T_PULGAR + 0.25));
          M.brazoIDelante = false; M.manoI = mezcla(fuera, [-26, 40], k2); M.cara = t < T_PULGAR + 0.6 ? "sorpresa" : "guino"; M.rc = -0.08;
          M.pulgar = true;
        }
        if (t > T_PALANCA) {
          // ¿otra? se asusta… y luego se ríe
          M.pulgar = t > T_COGE;
          M.cara = t < T_COGE ? "sorpresa" : "risa"; M.rc = t < T_COGE ? -0.1 : -0.14;
          if (t < T_COGE) { M.manoI = [-4, 96]; M.puntas = 0.5; }
        }
      }
    }
    // el extintor (y la tostada)
    const ext = t > T_ENTRA;
    M.objD = ext ? (g, mano, ang) => extintor(g, mano[0], mano[1] - 2, 1, 0.1) : null;
    if (M.lanza) {
      // la boquilla en la mano izquierda, con su manguerita hasta el extintor
      M.objI2 = (g, mano) => {
        g.strokeStyle = "#1a1a1a"; g.lineWidth = 3; g.lineCap = "round";
        g.beginPath(); g.moveTo(M.manoD[0] + 6, M.manoD[1] + 1); g.quadraticCurveTo(M.manoD[0] - 10, M.manoD[1] + 30, mano[0] + 4, mano[1] + 2); g.stroke();
        g.fillStyle = "#222"; g.beginPath(); g.moveTo(mano[0] + 2, mano[1] - 4); g.lineTo(mano[0] - 16, mano[1] - 7); g.lineTo(mano[0] - 16, mano[1] + 3); g.lineTo(mano[0] + 2, mano[1] + 4); g.closePath(); g.fill();
      };
    }
    const nb = this.bocados(t);
    if (tostEnMano) M.objI2 = (g, mano) => tostada(g, mano[0] + 4, mano[1] - 14, 1.25, 0.1, nb);
    if (M.pulgar) M.objI2 = (g, mano) => { g.fillStyle = "#e8b48a"; rectR(g, mano[0] - 2, mano[1] - 14, 6, 12, 3); g.fill(); };
    const mM = matAv(xm, ym, ESC, giroM), mG = matAv(XG, yg, ESC);
    return { G, M, mG, mM };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    // humo de la tostadora
    const humo = t > 0.3 && t < T_CLONC;
    if (humo && Math.random() < (t < T_PIII ? 14 : 24) * dt) p.nueva(P.HUMO, TOST[0] + azar(-14, 14), TOST[1] - 66, azar(-10, 10), azar(-260, -180), azar(1.6, 2.2), azar(16, 26));
    this.una("piii", t > T_PIII, () => temblar(12, 0.4));
    this.una("frena", t > T_FRENA, () => { temblar(8, 0.25); for (let i = 0; i < 14; i++) p.nueva(P.POLVO, XM + azar(-20, 60), PIES, azar(40, 260), azar(-60, -10), azar(0.4, 0.8), azar(18, 30)); });
    this.una("clonc", t > T_CLONC, () => {
      temblar(10, 0.25);
      for (let i = 0; i < 10; i++) p.nueva(P.HUMO, TOST[0] + azar(-20, 20), TOST[1] - 70, azar(-80, 80), azar(-140, -40), azar(0.8, 1.2), azar(20, 34));
      for (let i = 0; i < 8; i++) p.nueva(P.CHISPA, TOST[0], TOST[1] - 66, azar(-180, 180), azar(-320, -120), azar(0.3, 0.6), azar(5, 8));
    });
    T_MORDISCOS.forEach((tm, i) => this.una("m" + i, t > tm + 0.22, () => {
      temblar(5, 0.12);
      const e = this.poses(), b = aPant(e.mM, boca(0, "bombero"));
      for (let k = 0; k < 9; k++) this.migas.push({ x: b[0] - 14, y: b[1] + 6, vx: azar(-160, 60), vy: azar(-200, -40), r: azar(2, 4.5), vida: 1.2 });
    }));
    this.una("pulgar", t > T_PULGAR + 0.1, () => {
      const e = this.poses(), b = aPant(e.mM, boca(-0.08, "bombero"));
      for (let k = 0; k < 6; k++) p.nueva(P.HUMO, b[0] + azar(-6, 6), b[1] - 4, azar(-30, 30), azar(-90, -40), azar(0.8, 1.3), azar(12, 20));
    });
    for (const m of this.migas) { m.vy += 900 * dt; m.x += m.vx * dt; m.y += m.vy * dt; if (m.y > PIES) { m.y = PIES; m.vx = 0; m.vy = 0; } m.vida -= dt; }
    this.migas = this.migas.filter((m) => m.vida > 0);
    p.actualizar(dt);
  }
  // ------------------------------------------------------------------ dibujo
  fondoFijo() {
    if (this.cF) return this.cF;
    const c = lienzoNuevo(W + 120, H + 120), g = c.getContext("2d");
    g.translate(60, 60);
    const gp = g.createLinearGradient(0, -60, 0, 470);
    gp.addColorStop(0, "#2a1810"); gp.addColorStop(1, "#5e3420");
    g.fillStyle = gp; g.fillRect(-60, -60, W + 120, 600);
    // techo
    g.fillStyle = "#1a0e08"; g.fillRect(-60, -60, W + 120, 66);
    g.fillStyle = "#3a2214"; for (let x = -60; x < W + 60; x += 120) g.fillRect(x, -60, 26, 70);
    // estantes con botellas
    const cols = ["#2f7a3a", "#8a3b16", "#3b5d9a", "#b08a1a", "#8a1e4a"];
    const r = semilla(4);
    for (const [x0, x1, yb] of [[40, 300, 170], [40, 300, 270], [724, 990, 170], [724, 990, 270]]) {
      g.fillStyle = "#7a4a22"; g.fillRect(x0, yb, x1 - x0, 8);
      for (let x = x0 + 18; x < x1 - 10; x += 26 + r() * 6) {
        const alto = 36 + r() * 22; g.fillStyle = cols[(r() * cols.length) | 0];
        rectR(g, x - 8, yb - alto, 16, alto, 4); g.fill(); g.fillRect(x - 3, yb - alto - 12, 6, 13);
        g.fillStyle = "rgba(255,255,255,.25)"; g.fillRect(x - 5, yb - alto + 4, 2, alto - 8);
      }
    }
    // friso
    const gm = g.createLinearGradient(0, 390, 0, PIES); gm.addColorStop(0, "#5a3218"); gm.addColorStop(1, "#2e170a");
    g.fillStyle = gm; g.fillRect(-60, 396, W + 120, PIES - 396);
    g.fillStyle = "#7a4a26"; g.fillRect(-60, 390, W + 120, 8);
    // suelo
    const gs = g.createLinearGradient(0, PIES, 0, H + 60); gs.addColorStop(0, "#4a2a16"); gs.addColorStop(1, "#1a0c04");
    g.fillStyle = gs; g.fillRect(-60, PIES - 4, W + 120, H + 60 - PIES);
    g.fillStyle = "rgba(255,210,150,.18)"; g.fillRect(-60, PIES - 4, W + 120, 2);
    // mesa alta
    const [mx, my] = MESA;
    g.fillStyle = "#2a2a2e"; g.fillRect(mx - 7, my, 14, PIES - my); g.beginPath(); g.ellipse(mx, PIES - 2, 56, 10, 0, 0, 6.283); g.fill();
    const gt = g.createLinearGradient(0, my - 12, 0, my + 12); gt.addColorStop(0, "#b07a40"); gt.addColorStop(1, "#5a3414");
    g.fillStyle = gt; g.beginPath(); g.ellipse(mx, my + 4, 92, 18, 0, 0, 6.283); g.fill();
    g.fillStyle = "#c88a4a"; g.beginPath(); g.ellipse(mx, my, 92, 16, 0, 0, 6.283); g.fill();
    // enchufe y cable
    g.strokeStyle = "#1a1a1a"; g.lineWidth = 3; g.beginPath(); g.moveTo(mx + 40, my - 6); g.quadraticCurveTo(mx + 70, my + 30, mx + 10, my + 60); g.lineTo(mx + 6, PIES - 40); g.stroke();
    return (this.cF = c);
  }
  tostadora(g, t) {
    const [x, y] = TOST;
    const tiembla = t > 2.4 && t < T_CLONC ? azar(-2, 2) : 0;
    g.save(); g.translate(x + tiembla, y);
    const gr = g.createLinearGradient(-46, 0, 46, 0); gr.addColorStop(0, "#8a949e"); gr.addColorStop(0.35, "#f4f7f9"); gr.addColorStop(0.7, "#b8c0c8"); gr.addColorStop(1, "#6a727a");
    g.fillStyle = "#222"; g.fillRect(-40, -6, 10, 6); g.fillRect(30, -6, 10, 6);
    g.fillStyle = gr; rectR(g, -46, -64, 92, 60, 16); g.fill();
    g.strokeStyle = "#5a626a"; g.lineWidth = 2; g.stroke();
    g.fillStyle = "#1a1a1a"; rectR(g, -30, -66, 24, 6, 3); g.fill(); rectR(g, 6, -66, 24, 6, 3); g.fill();
    // palanca
    const baja = t < T_CLONC || (t > T_PALANCA + 0.2 && t < T_DORADA) ? 1 : 0;
    g.fillStyle = "#3a3a40"; g.fillRect(-52, -50, 6, 34);
    g.fillStyle = "#1a1a1a"; rectR(g, -62, -48 + 22 * baja, 14, 8, 3); g.fill();
    // luz
    g.fillStyle = baja ? "#ff6a2a" : "#4a2a1a"; g.beginPath(); g.arc(30, -20, 4, 0, 6.283); g.fill();
    g.fillStyle = "rgba(255,255,255,.5)"; g.fillRect(-34, -56, 6, 40);
    // la tostada asoma antes de saltar
    if (t > T_CLONC - 0.05 && t < T_CLONC + 0.05) tostada(g, 0, -80, 1.9, 0, 0);
    if (t > T_DORADA - 0.05 && t < T_DORADA + 0.05) tostada(g, 0, -80, 1.9, 0, 0, true);
    g.restore();
  }
  detector(g, t) {
    const [x, y] = DET, al = this.alarma(t);
    g.fillStyle = "#e9ecef"; g.beginPath(); g.ellipse(x, y, 42, 12, 0, 0, Math.PI); g.fill();
    g.fillStyle = "#cfd4d9"; g.fillRect(x - 42, y - 8, 84, 8);
    g.fillStyle = al && Math.sin(t * 24) > 0 ? "#ff2a1a" : "#5a1a12"; g.beginPath(); g.arc(x + 20, y + 4, 4, 0, 6.283); g.fill();
    if (al && Math.sin(t * 24) > 0) { g.save(); g.globalCompositeOperation = "lighter"; g.drawImage(BLOB.rojo, x - 10, y - 26, 60, 60); g.restore(); }
    if (al) {
      g.strokeStyle = "rgba(255,255,255,.7)"; g.lineWidth = 4;
      for (let i = 0; i < 3; i++) { const r = 30 + ((t - T_PIII) * 160 + i * 30) % 90; g.beginPath(); g.arc(x, y + 6, r, 0.3, Math.PI - 0.3); g.stroke(); }
    }
  }
  rotulo() {
    if (CT.has("t")) return CT.get("t");
    const c = lienzoNuevo(920, 170), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 30, 0, 140);
    gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.5, "#ffe38a"); gr.addColorStop(1, "#ff3d3d");
    txt(g, "¡FALSA ALARMA!", 466, 132, { tam: 116, peso: 900, fam: FD, color: "#3a0000", esp: 5, max: 860 });
    txt(g, "¡FALSA ALARMA!", 460, 126, { tam: 116, peso: 900, fam: FD, color: gr, borde: "#3a0000", bordeAncho: 11, esp: 5, glow: "rgba(255,70,40,.8)", glowTam: 22, max: 860 });
    CT.set("t", c);
    return c;
  }
  dibujar(g) {
    const t = this.t, e = this.poses();
    fondo(g, "#000");
    g.drawImage(this.fondoFijo(), -60, -60);
    this.detector(g, t);
    // sombras
    g.fillStyle = "rgba(0,0,0,.35)";
    for (const m of [e.mG, e.mM]) { const q = aPant(m, [39, 232]); g.beginPath(); g.ellipse(q[0], PIES + 2, 56, 9, 0, 0, 6.283); g.fill(); }
    this.tostadora(g, t);
    // estela de Marcos al entrar
    if (t > T_ENTRA && t < T_FRENA + 0.1) {
      g.strokeStyle = "rgba(255,255,255,.6)"; g.lineWidth = 4; g.lineCap = "round";
      const x = aPant(e.mM, [39, 232])[0];
      for (let k = 0; k < 5; k++) { const y = 260 + k * 60; g.beginPath(); g.moveTo(x + 70, y); g.lineTo(x + 200 + k * 20, y); g.stroke(); }
    }
    pintarAvatar(g, e.mG, e.G, t);
    pintarAvatar(g, e.mM, e.M, t);
    const tv = this.vuelo(t, aPant(e.mM, [-14, 86]));
    if (tv) tostada(g, tv[0], tv[1], 1.9, tv[2], 0);
    if (t > T_DORADA && t < T_COGE) {
      const u = tramo(t, T_DORADA, T_COGE), a = [TOST[0] - 6, TOST[1] - 80], b = aPant(e.mG, [94, 22]);
      tostada(g, lerp(a[0], b[0], u), lerp(a[1], b[1], u) - 170 * Math.sin(Math.PI * u), 1.9, -u * 6.283, 0, true);
    }
    g.fillStyle = "#1a0e06";
    for (const m of this.migas) { g.fillRect(m.x - m.r / 2, m.y - m.r / 2, m.r, m.r); }
    this.p.dibujar(g);
    // tinte rojo de la alarma
    if (this.alarma(t)) { g.fillStyle = `rgba(255,20,20,${0.1 + 0.08 * Math.sin(t * 24)})`; g.fillRect(-60, -60, W + 120, H + 120); }
    // textos
    const ono = (s, x, y, t0, dur, tam, col, borde, rot) => {
      const d = t - t0;
      if (d < 0 || d > dur) return;
      const k = eBack(tramo(d, 0, 0.1));
      g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k);
      txt(g, s, 0, 0, { tam, peso: 400, fam: FC, color: col, borde, bordeAncho: 8, esp: 2, alfa: 1 - tramo(d, dur - 0.15, dur) });
      g.restore();
    };
    // silbido
    if (t < T_PIII) for (let i = 0; i < 2; i++) { const d = (t * 0.9 + i * 0.5) % 1; txt(g, "♪", 230 - d * 40, 230 - d * 80, { tam: 34, peso: 800, color: "#ffd34d", alfa: Math.sin(Math.PI * d) }); }
    if (t > T_PIII && t < T_CLONC) {
      const d = t - T_PIII, k = eBack(tramo(d, 0, 0.12)), s = k * (1 + 0.06 * Math.sin(t * 40));
      g.save(); g.translate(512 + azar(-3, 3), 118); g.scale(s, s); g.rotate(-0.04);
      txt(g, "¡PIIIII!", 0, 0, { tam: 104, peso: 400, fam: FC, color: "#ffffff", borde: "#b0000a", bordeAncho: 12, esp: 4 });
      g.restore();
    }
    ono("¡CLONC!", 640, 300, T_CLONC, 0.55, 54, "#2fe3e8", "#06303a", 0.1);
    T_MORDISCOS.forEach((tm, i) => ono("¡CRUNCH!", 880 - (i % 2) * 40, 210 + i * 40, tm + 0.22, 0.45, 46 + i * 4, "#fffdf5", "#1b1b1b", i % 2 ? -0.1 : 0.1));
    ono("¡PUF!", 860, 210, T_PULGAR + 0.12, 0.7, 46, "#bfbfbf", "#1b1b1b", 0.08);
    ono("¡CLONC!", 640, 300, T_DORADA, 0.5, 54, "#2fe3e8", "#06303a", 0.1);
    ono("¡TACHÁN!", 160, 226, T_COGE, 0.9, 50, "#ffd34d", "#3a2400", -0.1);
    if (t > T_COGE) { const c = aPant(e.mG, [94, 6]); for (let i = 0; i < 3; i++) brillo(g, c[0] + Math.cos(t * 4 + i * 2.1) * 46, c[1] + Math.sin(t * 4 + i * 2.1) * 30, 16, 1); }
    // ¡FALSA ALARMA!
    if (t > T_TXT) {
      const d = t - T_TXT, k = tramo(d, 0, 0.16), s = lerp(1.6, 1, eIn(k)) * (1 + 0.02 * Math.sin(d * 7)) * 0.9;
      const r = this.rotulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3); g.translate(512, 92); g.rotate(-0.03); g.scale(s, s);
      g.drawImage(r, -r.width / 2, -r.height / 2); g.restore();
    }
    const a = Math.max(1 - tramo(t, 0.02, 0.4), tramo(t, T_FIN, DUR - 0.03));
    if (a > 0) { g.fillStyle = `rgba(0,0,0,${a})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00212", nombre: "Falsa alarma", crear: () => new FalsaAlarma() });
})();
