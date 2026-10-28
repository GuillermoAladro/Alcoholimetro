"use strict";
/*
 * 00053 · ESCALERA DEL TOP 10
 *
 * Animación del banco. Empieza y acaba en negro.
 * Sale del suelo una escalera de 10 escalones numerados del 10 al 1 (verdes, bronce, plata y oro). Entra con una
 * bandera enrollada y sube saltando de escalón en escalón; cada uno se enciende al pisarlo. En el 2 coge carrerilla,
 * da un salto enorme hasta el 1, planta la bandera verde, que se despliega, y lo celebra. ¡A LA CIMA!
 */
(() => {
const X0 = 70, SW = 82, SH = 30, ANCHO1 = 128;
const COL = (n) => (n === 1 ? ["#ffe27a", "#b07d00", "255,211,77"] : n === 2 ? ["#f4f7fa", "#8d969f", "225,235,250"] : n === 3 ? ["#f1b07c", "#8a4f22", "242,169,107"] : ["#5dff86", "#0b6e2a", "43,255,91"]);
/** Escalón i (0 = el 10, 9 = el 1): x izquierda, ancho y altura de la pisada. */
const esc = (i) => ({ x: X0 + i * SW, w: i === 9 ? ANCHO1 : SW, y: PIES - (i + 1) * SH, n: 10 - i });
/** Dónde pisa en el escalón i (-1 = el suelo, antes de la escalera). */
const pisada = (i) => (i < 0 ? [X0 - 30, PIES] : i === 9 ? [esc(9).x + 38, esc(9).y] : [esc(i).x + SW / 2, esc(i).y]);

/** Bandera en coordenadas de pantalla: (x, y) = pie del mástil. despl 0–1 (enrollada → desplegada). */
function bandera(g, x, y, alto, despl, t) {
  const top = y - alto;
  const gp = g.createLinearGradient(x - 3, 0, x + 3, 0);
  gp.addColorStop(0, "#8c939e"); gp.addColorStop(0.5, "#f2f4f7"); gp.addColorStop(1, "#5a606a");
  g.fillStyle = gp; g.fillRect(x - 3, top, 6, alto);
  g.fillStyle = "#ffd34d"; g.beginPath(); g.arc(x, top - 3, 6, 0, 6.283); g.fill();
  g.strokeStyle = "#6e4600"; g.lineWidth = 1.5; g.stroke();
  const hb = 56, wb = 92 * despl;
  if (despl < 0.05) {
    // enrollada en el mástil
    rectR(g, x - 1, top + 6, 11, hb + 4, 4); g.fillStyle = "#1fd04e"; g.fill();
    g.strokeStyle = "#0b6e2a"; g.lineWidth = 2; g.stroke();
    return;
  }
  const N = 12, onda = (j) => Math.sin(t * 9 - j * 0.7) * 6 * (j / N);
  g.beginPath();
  for (let j = 0; j <= N; j++) g.lineTo(x + 3 + (wb * j) / N, top + 6 + onda(j));
  for (let j = N; j >= 0; j--) g.lineTo(x + 3 + (wb * j) / N, top + 6 + hb + onda(j) * 1.1);
  g.closePath();
  const gf = g.createLinearGradient(x, 0, x + wb, 0);
  gf.addColorStop(0, "#0e9c38"); gf.addColorStop(0.5, "#2bff5b"); gf.addColorStop(1, "#14b844");
  g.fillStyle = gf; g.fill();
  g.strokeStyle = "#0b5a22"; g.lineWidth = 2; g.stroke();
  if (despl > 0.6) {
    g.save(); g.globalAlpha = tramo(despl, 0.6, 1);
    const yc = top + 6 + hb / 2 + onda(N / 2);
    txt(g, "1", x + 3 + wb / 2, yc + 17, { tam: 46, peso: 900, fam: FD, color: "#fffdf5", borde: "#0b5a22", bordeAncho: 5 });
    g.restore();
  }
}

class EscenaEscalera extends Escena {
  constructor() {
    super(9.3);
    this.p = new Parts(380);
    this.p.suelo = (x) => { for (let i = 9; i >= 0; i--) { const s = esc(i); if (x >= s.x && x < s.x + s.w) return s.y; } return PIES; };
    this.ESC = 1.0; this.fase = 0;
    // saltos: [inicio, duración, altura del arco]
    this.saltos = [];
    for (let k = 0; k < 9; k++) this.saltos.push([1.45 + k * 0.37, 0.3, 34]);
    this.saltos.push([5.12, 0.55, 150]);
    this.encendido = new Array(10).fill(-1);
    this.plantada = null;
    this.titulo = sprite3D("¡A LA CIMA!", 120, { cara: "#2bff5b", lado: "#0b6e2a", borde: "#000" });
  }
  /** Posición de los pies y el estado del salto. */
  pos(t) {
    if (t < 1.4) return { x: lerp(-90, pisada(-1)[0], eOut(tramo(t, 0.25, 1.3))), y: PIES, salto: -1, u: 0, anda: t < 1.3 };
    let i = -1;
    for (let k = 0; k < 10; k++) {
      const [t0, d, h] = this.saltos[k];
      if (t < t0) break;
      if (t < t0 + d) {
        const u = (t - t0) / d, A = pisada(k - 1), B = pisada(k);
        return { x: lerp(A[0], B[0], u), y: lerp(A[1], B[1], u) - h * Math.sin(Math.PI * u), salto: k, u };
      }
      i = k;
    }
    const P = pisada(i);
    return { x: P[0], y: P[1], salto: -1, u: 0, en: i };
  }
  estado() {
    const t = this.t, q = this.pos(t);
    const pose = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0] };
    let manoD = [72, 122], manoI = [9, 160], sx = 1, sy = 1, bote = 0;
    if (q.anda) { const a = andar(this.fase, 0.9); pose.piernaI = a.piernaI; pose.piernaD = a.piernaD; bote = a.bote; }
    // agacharse antes de cada salto y aplastarse al caer
    for (const [t0, d] of this.saltos) {
      const pre = tramo(t, t0 - 0.07, t0) * (1 - tramo(t, t0, t0 + 0.05));
      const post = tramo(t, t0 + d, t0 + d + 0.04) * (1 - tramo(t, t0 + d + 0.04, t0 + d + 0.14));
      sy -= 0.1 * Math.max(pre, post); sx += 0.04 * Math.max(pre, post);
    }
    if (q.salto >= 0) {
      pose.piernaI = [-7, 0.16]; pose.piernaD = [-7, -0.16];
      manoI = [-12, 108]; manoD = [78, 96];
      pose.cara = q.salto === 9 ? "sorpresa" : q.salto % 2 ? "risa" : "sonrisa";
      if (q.salto === 9) { manoI = [-16, 40]; pose.puntas = 0.5 * Math.sin(Math.PI * q.u); }
    }
    // en el 2: coge carrerilla
    if (t > 4.72 && t < 5.12) {
      const k = eInOut(tramo(t, 4.72, 4.95));
      sy -= 0.14 * k; sx += 0.05 * k; pose.cara = "guino"; pose.rc = -0.06 * k;
      manoI = mezcla([9, 160], [-10, 178], k);
    }
    // arriba: levanta la bandera y la clava
    if (t >= 5.67 && t < 6.2) {
      pose.cara = "risa";
      const kSube = eInOut(tramo(t, 5.75, 5.98)), kBaja = eIn(tramo(t, 6.0, 6.12));
      manoD = mezcla(mezcla([72, 122], [94, 68], kSube), [97, 150], kBaja);
      manoI = mezcla([9, 160], [-6, 120], kSube);
    }
    if (t >= 6.12) {
      // ¡victoria! los dos brazos arriba
      const k = eOut(tramo(t, 6.2, 6.42));
      manoD = mezcla([97, 150], [90, 18 + 4 * Math.sin(t * 9)], k);
      manoI = mezcla([-6, 120], [-12, 18 + 4 * Math.sin(t * 9 + 1)], k);
      pose.cara = t < 7.6 ? "risa" : "guino";
      bote = -Math.abs(Math.sin((t - 6.3) * 6)) * 16 * tramo(t, 6.3, 6.45) * (1 - tramo(t, 7.4, 7.8));
    }
    pose.manoD = manoD; pose.manoI = manoI;
    if (!this.plantada) pose.objD = (g, m) => bandera(g, m[0], m[1] + 85, 190, 0, t);
    const m = matAv(q.x, q.y + bote, this.ESC, 0, sx, sy);
    return { pose, m, q };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    if (t < 1.3) this.fase += dt * 9;
    // al caer en cada escalón: se enciende, polvo y un golpecito
    for (let k = 0; k < 10; k++) {
      const [t0, d] = this.saltos[k];
      this.una("cae" + k, t > t0 + d, () => {
        this.encendido[k] = t;
        const [x, y] = pisada(k);
        temblar(k === 9 ? 22 : 3 + k * 0.6, k === 9 ? 0.5 : 0.15);
        for (let i = 0; i < (k === 9 ? 26 : 8); i++) p.nueva(P.POLVO, x + azar(-20, 20), y - 2, azar(-220, 220), azar(-60, -5), azar(0.4, 0.8), azar(16, 30));
        if (k >= 7) for (let i = 0; i < (k === 9 ? 40 : 12); i++) { const a = azar(-Math.PI, 0), v = azar(150, 520); p.nueva(P.CHISPA, x, y, Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.7), azar(7, 13)); }
      });
    }
    // planta la bandera
    this.una("planta", t > 6.12, () => {
      const e = this.estado(), mano = aPant(e.m, [97, 150]);
      this.plantada = { x: mano[0], y: esc(9).y + 2, t0: t };
      temblar(16, 0.35);
      for (let i = 0; i < 18; i++) { const a = azar(-Math.PI, 0), v = azar(150, 420); p.nueva(P.CHISPA, mano[0], esc(9).y, Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.6), azar(7, 12)); }
    });
    this.una("cima", t > 6.3, () => {
      temblar(14, 0.4);
      for (let i = 0; i < 150; i++) p.nueva(P.CONFETI, azar(0, W), azar(-220, -10), azar(-60, 60), azar(20, 120), azar(4, 6), azar(8, 14), (Math.random() * 5) | 0);
    });
    if (t > 6.6 && t < 8.0 && Math.random() < 14 * dt) p.nueva(P.CONFETI, azar(0, W), -10, azar(-40, 40), azar(40, 100), 5, azar(8, 14), (Math.random() * 5) | 0);
    if (t > 5.7 && t < 8.2 && Math.random() < 10 * dt) p.nueva(P.PURPURINA, esc(9).x + azar(0, ANCHO1), esc(9).y + azar(-140, 0), 0, azar(10, 40), azar(0.6, 1.1), azar(7, 12));
    p.alfa = 1 - tramo(t, 8.4, 9.1);
    p.actualizar(dt);
  }
  dibujarEscalon(g, i, t) {
    const s = esc(i), aparece = 0.12 + i * 0.055, k = tramo(t, aparece, aparece + 0.28);
    if (k <= 0) return;
    const dy = (1 - eBack(k)) * 260;
    const encendido = this.encendido[i] >= 0, kL = encendido ? tramo(t, this.encendido[i], this.encendido[i] + 0.15) : 0;
    const [c0, c1, luz] = COL(s.n);
    const y = s.y + dy, h = PIES - s.y;
    g.save(); g.globalAlpha = Math.min(1, k * 3);
    // tapa (con un poco de perspectiva)
    g.fillStyle = encendido ? c0 : "#3a3f48";
    g.beginPath(); g.moveTo(s.x, y); g.lineTo(s.x + 10, y - 9); g.lineTo(s.x + s.w + 10, y - 9); g.lineTo(s.x + s.w, y); g.closePath(); g.fill();
    // frente
    const gr = g.createLinearGradient(0, y, 0, y + h);
    if (encendido) { gr.addColorStop(0, c0); gr.addColorStop(0.35, c1); gr.addColorStop(1, "#0a0a0a"); }
    else { gr.addColorStop(0, "#2a2e35"); gr.addColorStop(1, "#0c0d10"); }
    g.fillStyle = gr; g.fillRect(s.x, y, s.w, h + 30);
    // lateral
    g.fillStyle = "rgba(0,0,0,.35)"; g.beginPath(); g.moveTo(s.x + s.w, y); g.lineTo(s.x + s.w + 10, y - 9); g.lineTo(s.x + s.w + 10, y + h + 30); g.lineTo(s.x + s.w, y + h + 30); g.fill();
    g.strokeStyle = "rgba(0,0,0,.6)"; g.lineWidth = 1.5; g.strokeRect(s.x, y, s.w, h + 30);
    // número
    const sN = 1 + 0.35 * Math.sin(Math.PI * kL);
    g.save(); g.translate(s.x + s.w / 2, y + 26); g.scale(sN, sN);
    txt(g, String(s.n), 0, 0, { tam: s.n === 1 ? 30 : 26, peso: 900, fam: FD, color: encendido ? "rgba(20,14,0,.85)" : "rgba(255,255,255,.35)", esp: 1 });
    g.restore();
    if (kL > 0 && kL < 1) { g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.6 * (1 - kL); g.fillStyle = `rgb(${luz})`; g.fillRect(s.x, y - 9, s.w + 10, 40); g.restore(); }
    g.restore();
  }
  dibujar(g) {
    const t = this.t, e = this.estado();
    fondo(g, "#000");
    // resplandor de la cima
    const kC = tramo(t, 5.67, 6.0);
    if (kC > 0) { g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.5 * kC; g.drawImage(BLOB2.oro, esc(9).x - 160, esc(9).y - 300, 460, 460); g.restore(); }
    for (let i = 0; i < 10; i++) this.dibujarEscalon(g, i, t);
    if (this.plantada) {
      const P0 = this.plantada, d = tramo(t, P0.t0 + 0.05, P0.t0 + 0.45);
      bandera(g, P0.x, P0.y, 190, eOut(d), t);
    }
    pintarAvatar(g, e.m, e.pose, t);
    this.p.dibujar(g);
    // ¡A LA CIMA!
    if (t > 6.3) {
      const k = tramo(t, 6.3, 6.45), s = lerp(2.6, 1, eIn(k)) * (1 + 0.02 * Math.sin(t * 6)), sp = this.titulo;
      g.save(); g.globalAlpha = Math.min(1, k * 4); g.translate(345, 160); g.rotate(-0.05); g.scale(s, s);
      g.drawImage(sp, -sp.width / 2, -sp.height / 2);
      g.restore();
    }
    const aF = tramo(t, 8.4, 9.1);
    if (aF > 0) { g.fillStyle = `rgba(0,0,0,${aF})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00053", nombre: "Escalera del top 10", crear: () => new EscenaEscalera() });
})();
