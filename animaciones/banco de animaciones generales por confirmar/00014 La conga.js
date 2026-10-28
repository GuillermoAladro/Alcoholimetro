"use strict";
/*
 * 00014 · LA CONGA
 *
 * Animación del banco. Empieza y acaba en negro.
 * Se encienden las bombillas de la fiesta y entra una conga de 6 Guillermos (con gafas, rubio, despeinado…), cada uno
 * con su jarra en alto y la mano en el hombro del de delante: un, dos, tres… ¡patada! (y siempre alguno a destiempo).
 * El último, borracho, da la patada al revés, tropieza y los tumba a todos como fichas de dominó. En el suelo el
 * primero atrapa su jarra al vuelo y todos siguen pataleando: ¡CONGA! Se cierra en un círculo.
 */
(() => {
const ESC = 1.12, D = 122, N = 6;
const BEAT = 0.33, CICLO = BEAT * 4, T0 = 0.35;
const TROPIEZO = 5.94, CAE = 6.3, IRIS = 9.7;
const CLONES = [
  { cara: "risa" },
  { cara: "sonrisa", gafas: true },
  { cara: "guino", oro: 1 },
  { cara: "risa", puntas: 0.55 },
  { cara: "sonrisa", gafas: true, oro: 1 },
  { cara: "borracho" },
];
const ANG_FIN = [1.5, 1.32, 1.2, 1.11, 1.04, 0.98];
const cache = cacheTexto();
let SPR14 = null;

function guirnalda() {
  const c = lienzoNuevo(W, 140), g = c.getContext("2d");
  g.strokeStyle = "#2a2a2a"; g.lineWidth = 2.5;
  g.beginPath(); g.moveTo(-10, 30); g.quadraticCurveTo(W * 0.25, 95, W / 2, 40); g.quadraticCurveTo(W * 0.75, 95, W + 10, 30); g.stroke();
  return c;
}
function sprites() {
  if (!SPR14) SPR14 = { guirnalda: guirnalda() };
  return SPR14;
}
function rotulo(clave, tam, w, h) {
  if (cache.has(clave)) return cache.get(clave);
  const c = lienzoNuevo(w, h), g = c.getContext("2d");
  const gr = g.createLinearGradient(0, h * 0.2, 0, h * 0.8);
  gr.addColorStop(0, "#fff6c2"); gr.addColorStop(0.5, "#ffd34d"); gr.addColorStop(1, "#ff8a00");
  txt(g, "¡CONGA!", w / 2, h * 0.74, { tam, peso: 400, fam: FC, color: gr, borde: "#5a0a2a", bordeAncho: tam * 0.09, esp: tam * 0.04, glow: "rgba(255,61,132,.85)", glowTam: tam * 0.18 });
  txt(g, "¡CONGA!", w / 2, h * 0.74, { tam, peso: 400, fam: FC, color: gr, esp: tam * 0.04 });
  cache.set(clave, c);
  return c;
}
/** Bombillas de la guirnalda: posición sobre la curva. */
function bombilla(i) {
  const u = i / 15, mitad = u < 0.5 ? u * 2 : (u - 0.5) * 2;
  const x0 = u < 0.5 ? -10 : W / 2, x1 = u < 0.5 ? W / 2 : W + 10, cx = u < 0.5 ? W * 0.25 : W * 0.75;
  const y0 = u < 0.5 ? 30 : 40, y1 = u < 0.5 ? 40 : 30, v = 1 - mitad;
  return [v * v * x0 + 2 * v * mitad * cx + mitad * mitad * x1, v * v * y0 + 2 * v * mitad * 95 + mitad * mitad * y1];
}
const COLB = ["255,61,132", "255,211,77", "43,255,91", "47,227,232", "176,72,255"];

class EscenaConga extends Escena {
  constructor() {
    super(10.7);
    this.p = new Parts(320);
    this.jarras = []; this.atrapada = false;
  }
  /** x del primero de la fila: avanza en los tres pasos y se para en la patada. */
  xLider(t) {
    const tt = Math.min(t, TROPIEZO) - T0;
    if (tt < 0) return -80;
    const c = Math.floor(tt / CICLO), r = tt - c * CICLO;
    const pasos = c * 3 + (r < BEAT * 3 ? Math.floor(r / BEAT) + eInOut((r % BEAT) / BEAT) : 3);
    return -80 + pasos * 56;
  }
  /** Inclinación de cada clon al caer (0 de pie). */
  caida(i, t) {
    const t0 = CAE + (N - 1 - i) * 0.13;
    const u = tramo(t, t0, t0 + 0.42);
    let a = ANG_FIN[i] * eIn(u);
    if (u >= 1) a = ANG_FIN[i] + 0.06 * Math.exp(-(t - t0 - 0.42) * 9) * Math.sin((t - t0) * 40);
    return { a, u, t0 };
  }
  pose(i, t) {
    const C = CLONES[i];
    const pose = { cara: C.cara, rc: 0, gafas: C.gafas, oro: C.oro || 0, puntas: C.puntas || 0, piernaI: [0, 0], piernaD: [0, 0] };
    const desfase = [0, 0.04, -0.05, 0.07, -0.03, 0.11][i];
    const tt = t - T0 - desfase, r = ((tt % CICLO) + CICLO) % CICLO, b = Math.floor(r / BEAT);
    const cae = this.caida(i, t);
    let bote = 0, giro = 0;
    // brazo de la jarra en alto (el izquierdo) y la mano derecha en el hombro del de delante
    let manoI = [4 + 3 * Math.sin(t * 5 + i), 6 + 3 * Math.sin(t * 7 + i)], manoD = [9 + D / ESC, 88];
    if (i === 0) manoD = [96 + 6 * Math.sin(t * 6), 30];
    if (t < TROPIEZO + 0.01 || cae.u <= 0) {
      if (tt > 0 && b < 3) { const f = (r % BEAT) / BEAT; bote = -Math.sin(f * Math.PI) * 10; const lado = b % 2 ? 1 : -1; if (lado > 0) pose.piernaD = [-8 * Math.sin(f * Math.PI), 0]; else pose.piernaI = [-8 * Math.sin(f * Math.PI), 0]; }
      if (tt > 0 && b === 3) {
        const f = (r % BEAT) / BEAT, k = Math.sin(Math.min(1, f * 1.6) * Math.PI);
        const alReves = i === 3 || i === 5;   // siempre hay alguno a destiempo
        if (alReves) pose.piernaI = [-6 * k, 0.55 * k]; else pose.piernaD = [-6 * k, -0.55 * k];
        giro = (alReves ? 0.05 : -0.05) * k;
      }
      giro += 0.03 * Math.sin(t * 4.7 + i);
    }
    // el último tropieza
    if (i === N - 1 && t >= TROPIEZO && cae.u <= 0) {
      const k = tramo(t, TROPIEZO, CAE);
      pose.cara = "sorpresa"; pose.piernaI = [-10, 0.6 * Math.sin(k * 9)]; giro = 0.25 * Math.sin(k * 14) * k;
      manoI = [-40, 60 + 20 * Math.sin(t * 30)];
    }
    if (cae.u > 0) {
      giro = cae.a;
      pose.cara = cae.u < 1 ? "sorpresa" : i === 0 ? "risa" : "borracho";
      manoD = [100, 30]; manoI = [-30, 30];
      if (cae.u >= 1) {
        // en el suelo siguen pataleando al ritmo
        const pat = Math.sin((t - CAE) * 9 + i * 1.3);
        pose.piernaD = [0, -0.35 * Math.max(0, pat)]; pose.piernaI = [0, 0.35 * Math.max(0, -pat)];
        manoD = [86, 150]; manoI = [-60, 96 + 8 * Math.sin(t * 6 + i)];
        if (i === 0) manoI = [-62, 88];
      }
    }
    pose.manoD = manoD; pose.manoI = manoI;
    const x = this.xLider(t) - i * D;
    const m = matAv(x, PIES + (cae.u > 0 ? 6 * cae.u : 0) + bote * (cae.u > 0 ? 0 : 1), ESC, giro);
    // la jarra
    const tieneJarra = cae.u <= 0.25 || (i === 0 && this.atrapada);
    if (tieneJarra) {
      const g0 = giro, inc = 0.15 * Math.sin(t * 6 + i);
      pose.objI = (g, mI) => { g.save(); g.translate(mI[0], mI[1]); g.rotate(-g0); g.scale(-1, 1); dibujarJarra(g, [0, 0], inc, 1, "asa", t); g.restore(); };
      pose.objI2 = (g, mI) => { g.save(); g.translate(mI[0], mI[1]); g.rotate(-g0); g.scale(-1, 1); dibujarJarra(g, [0, 0], inc, i === 0 && this.atrapada ? 0.75 : 1, "cuerpo", t); g.restore(); };
    }
    return { pose, m, cae, x };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    for (let i = 0; i < N; i++) {
      const c = this.caida(i, t);
      // suelta la jarra al caer
      this.una("suelta" + i, c.u > 0.25, () => {
        const e = this.pose(i, t), q = aPant(e.m, [-30, 30]);
        this.jarras.push({ i, x: q[0], y: q[1], vx: azar(60, 220), vy: i === 0 ? -900 : azar(-520, -300), r: 0, vr: i === 0 ? 4.7 : azar(-9, 9), suelo: false });
      });
      this.una("golpe" + i, c.u >= 1, () => {
        temblar(i === 0 ? 20 : 8, i === 0 ? 0.5 : 0.2);
        const e = this.pose(i, t), q = aPant(e.m, [39, 60]);
        for (let k = 0; k < 10; k++) p.nueva(P.POLVO, q[0] + azar(-60, 60), PIES - 4, azar(-200, 200), azar(-60, -10), azar(0.5, 0.9), azar(26, 44));
      });
    }
    this.una("tropieza", t > TROPIEZO + 0.05, () => temblar(4, 0.2));
    // jarras volando: la del primero vuelve a su mano
    for (const j of this.jarras) {
      if (j.fuera) continue;
      j.vy += 1500 * dt; j.x += j.vx * dt; j.y += j.vy * dt; j.r += j.vr * dt;
      if (j.i === 0) {
        const e = this.pose(0, t), q = aPant(e.m, [-62, 88]);
        if (j.vy > 0 && j.y > q[1] - 40 && t > CAE + 1.2) { j.fuera = true; this.atrapada = t; temblar(6, 0.15); for (let k = 0; k < 12; k++) p.nueva(P.ESPUMA, q[0], q[1] - 50, azar(-120, 120), azar(-260, -80), azar(0.4, 0.7), azar(4, 8)); }
        else { j.x = lerp(j.x, q[0] - 30, Math.min(1, dt * 2)); }
      } else if (j.y > PIES - 10) {
        j.fuera = true;
        for (let k = 0; k < 18; k++) p.nueva(P.GOTA, j.x, PIES - 10, azar(-260, 260), azar(-420, -120), azar(0.5, 0.9), azar(3, 5));
        for (let k = 0; k < 8; k++) p.nueva(P.ESPUMA, j.x, PIES - 14, azar(-150, 150), azar(-200, -60), azar(0.4, 0.7), azar(4, 8));
      }
    }
    this.una("titulo", t > CAE + 1.35, () => temblar(14, 0.3));
    p.actualizar(dt);
  }
  dibujar(g) {
    const t = this.t, S = sprites();
    fondo(g, "#000");
    const encendido = t < 0.6 ? [0, 0, 1, 0.3, 0, 1, 0.6, 1][Math.min(7, Math.floor(t / 0.075))] : 1;
    // luz cálida de fiesta
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.28 * encendido;
    g.drawImage(BLOB.naranja, -100, 60, W + 200, 640); g.restore();
    // suelo
    g.save(); g.globalAlpha = encendido;
    const gs = g.createLinearGradient(0, PIES - 10, 0, H);
    gs.addColorStop(0, "#3a2414"); gs.addColorStop(1, "#160d07");
    g.fillStyle = gs; g.fillRect(-60, PIES - 6, W + 120, H - PIES + 66);
    g.fillStyle = "rgba(255,200,120,.25)"; g.fillRect(-60, PIES - 6, W + 120, 2);
    // guirnalda de bombillas
    g.drawImage(S.guirnalda, 0, 0);
    for (let i = 0; i <= 15; i++) {
      const [x, y] = bombilla(i), c = COLB[i % 5], on = 0.7 + 0.3 * Math.sin(t * 5 + i * 2.1);
      g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.5 * on * encendido;
      g.drawImage(BLOB.blanco, x - 26, y - 14, 52, 52); g.restore();
      g.fillStyle = `rgb(${c})`; g.beginPath(); g.ellipse(x, y + 12, 7, 10, 0, 0, 6.283); g.fill();
      g.fillStyle = "rgba(255,255,255,.7)"; g.beginPath(); g.ellipse(x - 2, y + 9, 2, 3.5, 0, 0, 6.283); g.fill();
      g.fillStyle = "#333"; g.fillRect(x - 4, y - 1, 8, 6);
    }
    g.restore();
    // la fila (de delante hacia atrás: la mano de cada uno queda sobre el hombro del de delante)
    for (let i = 0; i < N; i++) {
      const e = this.pose(i, t);
      if (e.x < -160 || e.x > W + 400) continue;
      pintarAvatar(g, e.m, e.pose, t);
    }
    // estrellitas de mareo
    for (let i = 1; i < N; i++) {
      const e = this.pose(i, t);
      if (e.cae.u < 1) continue;
      const q = aPant(e.m, [39, 20]), a = Math.min(1, (t - e.cae.t0 - 0.42) * 3) * (1 - tramo(t, IRIS - 0.3, IRIS));
      for (let k = 0; k < 3; k++) {
        const an = t * 5 + k * 2.09 + i;
        g.save(); g.globalAlpha = a; g.fillStyle = "#ffd34d";
        estrella(g, q[0] + Math.cos(an) * 34, q[1] - 30 + Math.sin(an) * 10, 9, 4, t * 3); g.fill();
        g.restore();
      }
    }
    // jarras en el aire
    for (const j of this.jarras) {
      if (j.fuera) continue;
      g.save(); g.translate(j.x, j.y); g.rotate(j.r); g.scale(ESC * 1.1, ESC * 1.1);
      dibujarJarra(g, [-17, 0], 0, 0.8, "asa", t); dibujarJarra(g, [-17, 0], 0, 0.8, "cuerpo", t);
      g.restore();
    }
    this.p.dibujar(g);
    // ¡CONGA! en cada patada
    const lider = this.pose(0, t);
    for (let c = 0; c < 4; c++) {
      const tk = T0 + c * CICLO + BEAT * 3;
      if (t < tk || t > tk + 0.55 || tk > TROPIEZO) continue;
      const k = tramo(t, tk, tk + 0.15), R = rotulo("chica", 58, 300, 100);
      const x = clamp(lider.x + 60, 170, W - 170);
      g.save(); g.globalAlpha = 1 - tramo(t, tk + 0.4, tk + 0.55); g.translate(x, PIES - 360 - 20 * tramo(t, tk, tk + 0.55)); g.rotate(c % 2 ? 0.1 : -0.1); g.scale(eBack(k), eBack(k));
      g.drawImage(R, -R.width / 2, -R.height / 2); g.restore();
    }
    // ¡CONGA! final
    if (t > CAE + 1.35) {
      const k = tramo(t, CAE + 1.35, CAE + 1.6), R = rotulo("grande", 170, 760, 260);
      const s = eBack(k) * (1 + 0.04 * Math.sin(t * 9));
      g.save(); g.translate(W / 2, 175); g.rotate(-0.06 + 0.03 * Math.sin(t * 4.5)); g.scale(s, s);
      g.drawImage(R, -R.width / 2, -R.height / 2); g.restore();
    }
    // iris que se cierra sobre el primero
    if (t > IRIS) {
      const q = aPant(lider.m, [39, 60]), r = lerp(900, 0, eIn(tramo(t, IRIS, this.dur - 0.08)));
      const rr = Math.max(0.1, r);
      g.save(); g.fillStyle = "#000"; g.beginPath(); g.rect(-60, -60, W + 120, H + 120); g.moveTo(q[0] + rr, q[1]); g.arc(q[0], q[1], rr, 0, 6.2832, true); g.closePath(); g.fill(); g.restore();
    }
    if (encendido < 1) { g.fillStyle = `rgba(0,0,0,${1 - encendido})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00014", nombre: "La conga", crear: () => new EscenaConga() });
})();
