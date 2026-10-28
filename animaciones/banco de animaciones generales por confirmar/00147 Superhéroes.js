"use strict";
/*
 * 00147 · SUPERHÉROES
 *
 * Animación del banco. Empieza y acaba en negro.
 * Parpadea y se enciende una farola en una calle de noche. Guillermo (capa verde) y Rodrigo (capa dorada) aterrizan
 * como superhéroes, posan con los puños en la cintura y despegan a la vez: ¡AL RESCATE! Guillermo sale disparado,
 * pero la capa de Rodrigo se engancha en el brazo de la farola y se queda colgando, pataleando. Guillermo vuelve,
 * se parte de risa y le señala; Rodrigo se cruza de brazos. La farola parpadea y se apaga.
 */
(() => {
const cache = cacheTexto();
const ESC = 1.5, XG = 300, XR = 772;
const POSTE = 962, BRAZO_Y = 92, FAROL_X = 648;
const GANCHO = [772, BRAZO_Y + 3];   // donde se queda enganchada la capa
const PIV_COLG = [38, -4];          // punto del avatar de Rodrigo que cuelga del gancho (encima de la cabeza)
const T_DESP = 2.85, T_ENG = 3.1, T_VUELVE = 4.75, T_APAGA = 8.7;
const VERDE = ["#20c25a", "#8dffad", "#0a5a26", "#05391a"];
const DORADA = ["#f0b21c", "#fff0a0", "#946300", "#5a3a00"];

function rotulo() {
  if (cache.has("t")) return cache.get("t");
  const c = lienzoNuevo(760, 200), g = c.getContext("2d");
  const gr = g.createLinearGradient(0, 40, 0, 160);
  gr.addColorStop(0, "#fffbe0"); gr.addColorStop(0.45, "#ffd34d"); gr.addColorStop(1, "#ff9d00");
  g.save(); g.translate(380, 100); g.transform(1, 0, -0.12, 1, 0, 0);
  txt(g, "¡AL RESCATE!", 8, 48 + 8, { tam: 120, peso: 400, fam: FC, color: "#0b4a1f", esp: 4 });
  txt(g, "¡AL RESCATE!", 0, 48, { tam: 120, peso: 400, fam: FC, color: gr, borde: "#062d12", bordeAncho: 12, esp: 4, glow: "rgba(43,255,91,.7)", glowTam: 24 });
  g.restore();
  cache.set("t", c);
  return c;
}

/** Capa lisa colgando de los hombros, en unidades de avatar (se pinta antes que el avatar, queda por detrás). */
function capa(g, R, col, viento, t, largo, flamea) {
  const y0 = R.hombroD[1] - 9, xi = R.hombroI2[0] + 4, xd = R.hombroD[0] - 4, yb = y0 + 116 * largo;
  const n = 6, bajo = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    bajo.push([lerp(xi - 17, xd + 17, u) + viento, yb + Math.sin(t * 12 + u * 7) * 5 * flamea]);
  }
  g.beginPath();
  g.moveTo(xi, y0);
  g.quadraticCurveTo(xi - 16 + viento * 0.3, (y0 + yb) / 2, bajo[0][0], bajo[0][1]);
  for (let i = 1; i <= n; i++) g.quadraticCurveTo((bajo[i - 1][0] + bajo[i][0]) / 2, Math.max(bajo[i - 1][1], bajo[i][1]) + 4, bajo[i][0], bajo[i][1]);
  g.quadraticCurveTo(xd + 16 + viento * 0.3, (y0 + yb) / 2, xd, y0);
  g.closePath();
  const gr = g.createLinearGradient(xi - 17, 0, xd + 17, 0);
  gr.addColorStop(0, col[2]); gr.addColorStop(0.3, col[0]); gr.addColorStop(0.55, col[1]); gr.addColorStop(0.8, col[0]); gr.addColorStop(1, col[2]);
  g.fillStyle = gr; g.fill();
  g.strokeStyle = col[3]; g.lineWidth = 1.4; g.stroke();
  g.strokeStyle = "rgba(0,0,0,.22)"; g.lineWidth = 1.6;
  for (const u of [0.18, 0.82]) {
    g.beginPath(); g.moveTo(lerp(xi, xd, u), y0 + 14);
    g.quadraticCurveTo(lerp(xi - 8, xd + 8, u) + viento * 0.4, (y0 + yb) / 2, lerp(xi - 17, xd + 17, u) + viento, yb - 3); g.stroke();
  }
}
/** Tirantes de la capa por encima de los hombros (después del avatar). */
function broches(g, R, col) {
  g.fillStyle = col[0]; g.strokeStyle = col[3]; g.lineWidth = 1;
  for (const s of [-1, 1]) {
    const hx = s < 0 ? R.hombroI2[0] + 3 : R.hombroD[0] - 3, cx = R.cuello[0] + s * 9;
    g.beginPath(); g.moveTo(cx, R.cuello[1] + 2); g.quadraticCurveTo((cx + hx) / 2, R.cuello[1] - 1, hx + s * 2, R.hombroD[1] - 6);
    g.lineTo(hx - s * 1, R.hombroD[1] - 2); g.quadraticCurveTo((cx + hx) / 2, R.cuello[1] + 4, cx, R.cuello[1] + 6); g.closePath();
    g.fill(); g.stroke();
  }
  g.fillStyle = col[1]; g.beginPath(); g.arc(R.cuello[0], R.cuello[1] + 5, 2.6, 0, 6.283); g.fill();
}

class Superheroes extends Escena {
  constructor() {
    super(9.9);
    this.p = new Parts(420);
    this.p.suelo = () => PIES;
    this.rayas = [];
    this.fondoC = null;
  }
  /** Luz de la farola (0–1): se enciende parpadeando, chisporrotea con el tirón y se apaga al final. */
  luz() {
    const t = this.t;
    if (t < 0.12) return 0;
    if (t < 0.62) return [1, 0, 0.8, 0, 0, 1, 0.4, 1, 1, 1][Math.min(9, Math.floor((t - 0.12) / 0.05))];
    if (t > T_ENG + 0.05 && t < T_ENG + 0.35) return Math.sin(t * 90) > 0 ? 1 : 0.45;
    if (t > T_APAGA) {
      if (t > T_APAGA + 0.75) return 0;
      return [1, 0.3, 1, 0, 0.7, 0, 0, 0.5, 0, 0, 0, 0, 0, 0, 0, 0][Math.min(15, Math.floor((t - T_APAGA) / 0.05))];
    }
    return 1;
  }
  // ------------------------------------------------------------------ Guillermo
  poseG() {
    const t = this.t;
    const pose = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [70, 158], manoI: [9, 160] };
    let y = PIES, sx = 1, sy = 1, viento = 6 * Math.sin(t * 2.3), flamea = 0.6, largo = 1;
    if (t < 0.75) {
      // cae del cielo
      y = lerp(-440, PIES, Math.pow(tramo(t, 0.4, 0.75), 2));
      pose.manoD = [66, -12]; pose.manoI = [12, -12]; sy = 1.12; sx = 0.9; pose.cara = "risa"; viento = 0; largo = 1.05; flamea = 1.4;
    } else if (t < T_DESP) {
      // aterrizaje de superhéroe y se levanta
      const k = eInOut(tramo(t, 0.95, 1.45));
      sy = lerp(0.78, 1, k); sx = lerp(1.1, 1, k);
      pose.manoI = mezcla([-10, 226], [9, 160], k); pose.manoD = mezcla([112, 118], [70, 158], k);
      pose.piernaI = [0, lerp(0.2, 0, k)]; pose.piernaD = [0, lerp(-0.2, 0, k)];
      pose.cara = t < 1.4 ? "guino" : "sonrisa";
      // puños en la cintura, pecho fuera
      const kP = eInOut(tramo(t, 1.45, 1.75));
      pose.manoD = mezcla(pose.manoD, [63, 141], kP); pose.manoI = mezcla(pose.manoI, [15, 141], kP);
      sx *= 1 + 0.05 * kP;
      // se miran y asienten
      const kM = eInOut(tramo(t, 1.7, 1.9)) * (1 - eInOut(tramo(t, 2.15, 2.35)));
      pose.rc = 0.16 * kM + 0.04 * Math.sin(t * 14) * tramo(t, 1.95, 2.0) * (1 - tramo(t, 2.1, 2.15));
      if (t > 1.75 && t < 2.2) pose.cara = "guino";
      // se agacha y sube el puño
      const kC = eInOut(tramo(t, 2.45, 2.8));
      sy *= 1 - 0.12 * kC; sx *= 1 + 0.04 * kC;
      pose.manoD = mezcla(pose.manoD, [74, 6], kC); pose.manoI = mezcla(pose.manoI, [8, 174], kC);
      if (t > 2.45) pose.cara = "risa";
      viento = lerp(viento, 12, tramo(t, 2.45, 2.8)); flamea = lerp(0.6, 1.4, kC);
    } else if (t < T_VUELVE) {
      // ¡despega!
      const s = t - T_DESP;
      y = PIES - (900 * s + 2700 * s * s);
      sy = 1.14; sx = 0.9; pose.manoD = [72, -14]; pose.manoI = [7, 176]; pose.cara = "risa";
      pose.piernaI = [0, 0.04]; pose.piernaD = [0, -0.04]; viento = 0; largo = 1.12; flamea = 1.8;
    } else {
      // vuelve flotando y se ríe de Rodrigo
      const k = eOut(tramo(t, T_VUELVE, T_VUELVE + 0.55));
      y = lerp(-480, 528, k) + 8 * Math.sin(t * 3.2) * tramo(t, 5.2, 5.6);
      pose.manoD = [72, -14]; pose.manoI = [7, 176]; pose.cara = "sorpresa";
      pose.piernaI = [0, 0.04 + 0.06 * Math.sin(t * 3)]; pose.piernaD = [0, -0.04 + 0.06 * Math.sin(t * 3 + 1)];
      flamea = 1.2 - 0.6 * k; viento = -6 + 5 * Math.sin(t * 2.6);
      const kB = eInOut(tramo(t, 5.15, 5.45));
      pose.manoD = mezcla(pose.manoD, [64, 142], kB); pose.manoI = mezcla(pose.manoI, [15, 142], kB);
      pose.rc = 0.14 * eInOut(tramo(t, 5.1, 5.4));
      if (t > 5.65) {
        // carcajada agarrándose la tripa
        pose.cara = "risa";
        const sac = Math.sin(t * 26) * 2.2;
        pose.manoD = mezcla(pose.manoD, [52, 150 + sac], eInOut(tramo(t, 5.65, 5.85)));
        pose.manoI = mezcla(pose.manoI, [24, 150 + sac], eInOut(tramo(t, 5.65, 5.85)));
        pose.rc = 0.14 + 0.06 * Math.sin(t * 13);
        sy *= 1 + 0.015 * Math.sin(t * 26);
      }
      // le señala
      const kS = eInOut(tramo(t, 6.45, 6.7)) * (1 - eInOut(tramo(t, 7.8, 8.05)));
      pose.manoD = mezcla(pose.manoD, [124, 92 + Math.sin(t * 22) * 2], kS);
    }
    return { pose, m: matAv(XG, y, ESC, 0, sx, sy), viento, flamea, largo };
  }
  // ------------------------------------------------------------------ Rodrigo
  poseR() {
    const t = this.t;
    const pose = { quien: "rodrigo", cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [68, 157], manoI: [9, 157] };
    let y = PIES, sx = 1, sy = 1, viento = -6 * Math.sin(t * 2.1 + 1), flamea = 0.6, largo = 1, colgado = false, m = null;
    if (t < 1.0) {
      y = lerp(-440, PIES, Math.pow(tramo(t, 0.66, 1.0), 2));
      pose.manoD = [64, 4]; pose.manoI = [12, 4]; sy = 1.12; sx = 0.9; pose.cara = "risa"; viento = 0; largo = 1.05; flamea = 1.4;
    } else if (t < T_DESP) {
      const k = eInOut(tramo(t, 1.15, 1.6));
      sy = lerp(0.78, 1, k); sx = lerp(1.1, 1, k);
      pose.manoD = mezcla([84, 226], [68, 157], k); pose.manoI = mezcla([-30, 120], [9, 157], k);
      pose.piernaI = [0, lerp(0.2, 0, k)]; pose.piernaD = [0, lerp(-0.2, 0, k)];
      pose.cara = t < 1.6 ? "guino" : "sonrisa";
      const kP = eInOut(tramo(t, 1.6, 1.9));
      pose.manoD = mezcla(pose.manoD, [62, 144], kP); pose.manoI = mezcla(pose.manoI, [15, 144], kP);
      sx *= 1 + 0.05 * kP;
      const kM = eInOut(tramo(t, 1.75, 1.95)) * (1 - eInOut(tramo(t, 2.15, 2.35)));
      pose.rc = -0.16 * kM;
      if (t > 1.9 && t < 2.25) pose.cara = "risa";
      const kC = eInOut(tramo(t, 2.45, 2.8));
      sy *= 1 - 0.12 * kC; sx *= 1 + 0.04 * kC;
      pose.manoD = mezcla(pose.manoD, [70, 30], kC); pose.manoI = mezcla(pose.manoI, [10, 172], kC);
      if (t > 2.45) pose.cara = "risa";
      viento = lerp(viento, -12, tramo(t, 2.45, 2.8)); flamea = lerp(0.6, 1.4, kC);
    } else if (t < T_ENG) {
      const s = t - T_DESP;
      y = PIES - (900 * s + 2700 * s * s);
      sy = 1.14; sx = 0.9; pose.manoD = [70, 24]; pose.manoI = [9, 172]; pose.cara = "risa";
      viento = 0; largo = 1.12; flamea = 1.8;
    } else {
      // enganchado: tirón, rebota y se queda colgando del brazo de la farola
      colgado = true;
      const s = T_ENG - T_DESP, y0 = PIES - (900 * s + 2700 * s * s) - (232 - PIV_COLG[1]) * ESC * 1.14;
      const u = tramo(t, T_ENG, T_ENG + 0.9);
      const py = lerp(y0, GANCHO[1], eElastico(u));
      const d = t - T_ENG;
      const giro = 0.32 * Math.sin(d * 4.6) * Math.exp(-d * 0.7) + 0.05 * Math.sin(t * 7) * (t < 6.6 ? 1 : 0.3);
      sy = lerp(1.1, 1, tramo(t, T_ENG, T_ENG + 0.4)); sx = lerp(0.92, 1, tramo(t, T_ENG, T_ENG + 0.4));
      m = matAv(GANCHO[0], py, ESC, giro, sx, sy, PIV_COLG);
      pose.cara = "sorpresa";
      // patalea y agita los brazos
      const f = t < 6.6 ? 1 : 1 - tramo(t, 6.6, 6.9);
      pose.piernaI = [0, 0.3 * Math.sin(t * 15) * f]; pose.piernaD = [0, -0.3 * Math.sin(t * 15 + 1.3) * f];
      pose.manoD = [86 + 12 * Math.sin(t * 13), 72 + 26 * Math.sin(t * 13 + 1)];
      pose.manoI = [-8 + 12 * Math.sin(t * 12 + 2), 72 + 26 * Math.sin(t * 12)];
      pose.rc = 0.08 * Math.sin(t * 9) * f;
      if (t > 5.35 && t < 6.6) { pose.cara = t % 0.5 < 0.25 ? "sorpresa" : "borracho"; pose.rc -= 0.1; }
      // se rinde: brazos cruzados, ojos cerrados… y al final un guiño
      const kX = eInOut(tramo(t, 6.6, 6.95));
      pose.manoD = mezcla(pose.manoD, [22, 130], kX); pose.manoI = mezcla(pose.manoI, [56, 128], kX);
      if (t > 6.7) { pose.cara = "dormido"; pose.rc = -0.12 * kX; }
      if (t > 7.75) { pose.cara = "guino"; pose.rc = -0.12 + 0.05 * Math.sin(t * 6); }
    }
    if (!m) m = matAv(XR, y, ESC, 0, sx, sy);
    return { pose, m, viento, flamea, largo, colgado };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    const polvo = (x, n, f) => {
      for (let i = 0; i < n; i++) p.nueva(P.POLVO, x + azar(-30, 30), PIES - azar(0, 12), azar(-f, f), azar(-90, -5), azar(0.6, 1.2), azar(28, 54));
      for (let i = 0; i < n * 0.6; i++) { const a = azar(-Math.PI, 0), v = azar(200, 520); p.nueva(P.CHISPA, x, PIES - 8, Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.6), azar(7, 12)); }
    };
    this.una("aterrizaG", t > 0.75, () => { temblar(20, 0.4); polvo(XG, 22, 560); });
    this.una("aterrizaR", t > 1.0, () => { temblar(22, 0.45); polvo(XR, 22, 560); });
    this.una("despega", t > T_DESP, () => {
      temblar(26, 0.5); polvo(XG, 26, 650); polvo(XR, 26, 650);
      p.nueva(P.DESTELLO, XG, PIES - 60, 0, 0, 0.35, 260); p.nueva(P.DESTELLO, XR, PIES - 60, 0, 0, 0.35, 260);
    });
    this.una("engancha", t > T_ENG, () => {
      temblar(18, 0.35);
      for (let i = 0; i < 26; i++) { const a = azar(-Math.PI, Math.PI), v = azar(120, 420); p.nueva(P.CHISPA, FAROL_X, BRAZO_Y + 40, Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.7), azar(7, 12)); }
      p.nueva(P.DESTELLO, GANCHO[0], GANCHO[1], 0, 0, 0.3, 150);
    });
    // rayas de velocidad al despegar y al volver
    const vuela = (t > T_DESP && t < T_DESP + 0.55) || (t > T_VUELVE && t < T_VUELVE + 0.5);
    if (vuela && Math.random() < 40 * dt) {
      const x = (t < 4 && Math.random() < 0.5 ? XR : XG) + azar(-70, 70);
      this.rayas.push({ x, y: azar(-50, 650), l: azar(80, 200), v: t < 4 ? 2600 : -2600, a: 1 });
    }
    for (const r of this.rayas) { r.y += r.v * dt; r.a -= dt * 3; }
    this.rayas = this.rayas.filter((r) => r.a > 0);
    this.una("vuelve", t > T_VUELVE + 0.5, () => { p.nueva(P.DESTELLO, XG, 330, 0, 0, 0.3, 200); });
    // chispitas de la farola al apagarse
    this.una("chispazo", t > T_APAGA + 0.15, () => {
      for (let i = 0; i < 18; i++) { const a = azar(0, Math.PI), v = azar(80, 300); p.nueva(P.CHISPA, FAROL_X, BRAZO_Y + 50, Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.6), azar(6, 10)); }
    });
    p.actualizar(dt);
  }
  fondo() {
    if (this.fondoC) return this.fondoC;
    const c = lienzoNuevo(W + 80, H + 80), g = c.getContext("2d");
    g.translate(40, 40);
    const gc = g.createLinearGradient(0, -40, 0, 470);
    gc.addColorStop(0, "#04061a"); gc.addColorStop(0.7, "#141a44"); gc.addColorStop(1, "#2a2560");
    g.fillStyle = gc; g.fillRect(-40, -40, W + 80, H + 80);
    const r = semilla(7);
    g.fillStyle = "#fff";
    for (let i = 0; i < 90; i++) { g.globalAlpha = 0.3 + 0.7 * r(); g.beginPath(); g.arc(r() * W, r() * 380, 0.6 + r() * 1.4, 0, 6.283); g.fill(); }
    g.globalAlpha = 1;
    // luna
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.7; g.drawImage(BLOB2.oroClaro, 815, -40, 170, 170); g.restore();
    const gl = g.createRadialGradient(888, 36, 4, 900, 46, 40);
    gl.addColorStop(0, "#fffdf0"); gl.addColorStop(1, "#e9dfb4");
    g.fillStyle = gl; g.beginPath(); g.arc(900, 46, 36, 0, 6.283); g.fill();
    g.fillStyle = "rgba(170,160,120,.35)";
    for (const [x, y, rr] of [[888, 38, 7], [911, 56, 5], [908, 31, 4], [890, 61, 3.5]]) { g.beginPath(); g.arc(x, y, rr, 0, 6.283); g.fill(); }
    // edificios (dos capas) con ventanas
    for (const [col, base, alto, ancho, sem, vent] of [["#151a3e", 470, 230, 90, 3, 0.25], ["#0a0d24", 500, 170, 120, 11, 0.4]]) {
      const rr = semilla(sem);
      let x = -40;
      while (x < W + 40) {
        const w = ancho * (0.6 + 0.8 * rr()), h = alto * (0.45 + 0.75 * rr());
        g.fillStyle = col; g.fillRect(x, base - h, w - 4, h + 120);
        if (rr() < 0.4) g.fillRect(x + w * 0.3, base - h - 26, w * 0.25, 30);
        for (let vy = base - h + 14; vy < base - 10; vy += 22) for (let vx = x + 8; vx < x + w - 16; vx += 16) {
          if (rr() < vent) { g.fillStyle = rr() < 0.7 ? "rgba(255,214,110,.85)" : "rgba(140,220,255,.7)"; g.fillRect(vx, vy, 7, 10); g.fillStyle = col; }
        }
        x += w;
      }
    }
    // acera y calzada
    const ga = g.createLinearGradient(0, 500, 0, H);
    ga.addColorStop(0, "#2d2c38"); ga.addColorStop(1, "#121219");
    g.fillStyle = ga; g.fillRect(-40, 500, W + 80, H - 500 + 40);
    g.fillStyle = "#4a4858"; g.fillRect(-40, 500, W + 80, 5);
    g.strokeStyle = "rgba(0,0,0,.35)"; g.lineWidth = 2;
    for (let x = -20; x < W + 40; x += 110) { g.beginPath(); g.moveTo(x, 506); g.lineTo(x - 30, H + 40); g.stroke(); }
    this.fondoC = c;
    return c;
  }
  farola(g, luz, t) {
    // poste, brazo con voluta y farol
    const gp = g.createLinearGradient(POSTE - 10, 0, POSTE + 10, 0);
    gp.addColorStop(0, "#0d1a14"); gp.addColorStop(0.5, "#3b5a4a"); gp.addColorStop(1, "#0b1510");
    g.fillStyle = gp; g.fillRect(POSTE - 8, BRAZO_Y - 30, 16, PIES - BRAZO_Y + 30);
    g.fillStyle = "#16261e"; rectR(g, POSTE - 20, PIES - 70, 40, 72, 6); g.fill();
    g.fillStyle = "#2c4438"; rectR(g, POSTE - 14, BRAZO_Y - 48, 28, 22, 6); g.fill();
    g.strokeStyle = "#1e3329"; g.lineCap = "round"; g.lineWidth = 9;
    g.beginPath(); g.moveTo(POSTE, BRAZO_Y - 10); g.quadraticCurveTo(POSTE - 30, BRAZO_Y - 2, POSTE - 70, BRAZO_Y); g.lineTo(FAROL_X + 8, BRAZO_Y); g.stroke();
    g.lineWidth = 4;
    g.beginPath(); g.moveTo(POSTE - 4, BRAZO_Y + 34); g.quadraticCurveTo(POSTE - 60, BRAZO_Y + 30, POSTE - 80, BRAZO_Y + 4); g.stroke();
    g.beginPath(); g.arc(POSTE - 62, BRAZO_Y + 18, 9, 0, 5); g.stroke();
    g.strokeStyle = "rgba(140,190,160,.35)"; g.lineWidth = 2;
    g.beginPath(); g.moveTo(POSTE - 70, BRAZO_Y - 3); g.lineTo(FAROL_X + 8, BRAZO_Y - 3); g.stroke();
    // farol
    const fx = FAROL_X, fy = BRAZO_Y + 4;
    g.strokeStyle = "#1e3329"; g.lineWidth = 3; g.beginPath(); g.moveTo(fx, fy); g.lineTo(fx, fy + 10); g.stroke();
    g.fillStyle = "#1e3329";
    g.beginPath(); g.moveTo(fx - 26, fy + 26); g.lineTo(fx, fy + 8); g.lineTo(fx + 26, fy + 26); g.closePath(); g.fill();
    const gv = g.createLinearGradient(0, fy + 26, 0, fy + 66);
    gv.addColorStop(0, `rgba(255,${200 + 40 * luz},${110 + 80 * luz},${0.35 + 0.65 * luz})`); gv.addColorStop(1, `rgba(255,170,60,${0.3 + 0.6 * luz})`);
    g.fillStyle = gv; g.beginPath(); g.moveTo(fx - 20, fy + 26); g.lineTo(fx + 20, fy + 26); g.lineTo(fx + 14, fy + 66); g.lineTo(fx - 14, fy + 66); g.closePath(); g.fill();
    g.strokeStyle = "#1e3329"; g.lineWidth = 2.5; g.stroke();
    g.beginPath(); g.moveTo(fx, fy + 26); g.lineTo(fx, fy + 66); g.stroke();
    g.fillStyle = "#1e3329"; rectR(g, fx - 16, fy + 64, 32, 7, 3); g.fill();
    if (luz > 0) {
      g.save(); g.globalCompositeOperation = "lighter";
      g.globalAlpha = 0.85 * luz; g.drawImage(BLOB.amarillo, fx - 110, fy - 60, 220, 220);
      // cono de luz
      const gr = g.createLinearGradient(0, fy + 60, 0, PIES);
      gr.addColorStop(0, `rgba(255,226,150,${0.22 * luz})`); gr.addColorStop(1, `rgba(255,226,150,${0.05 * luz})`);
      g.globalAlpha = 1; g.fillStyle = gr;
      g.beginPath(); g.moveTo(fx - 16, fy + 66); g.lineTo(fx + 16, fy + 66); g.lineTo(fx + 200, PIES); g.lineTo(fx - 200, PIES); g.closePath(); g.fill();
      g.globalAlpha = 0.35 * luz; g.drawImage(BLOB2.oroClaro, fx - 230, PIES - 34, 460, 64);
      g.restore();
    }
  }
  dibujar(g) {
    const t = this.t, luz = this.luz(), eG = this.poseG(), eR = this.poseR();
    fondo(g, "#000");
    // la noche: se ve con la farola (y algo de luna)
    const vis = t < 0.62 ? luz : t > T_APAGA ? Math.max(luz, 0) * 0.6 + 0.4 * (1 - tramo(t, T_APAGA, T_APAGA + 0.7)) : 0.55 + 0.45 * luz;
    g.save(); g.globalAlpha = clamp(vis, 0, 1);
    g.drawImage(this.fondo(), -40, -40);
    this.farola(g, luz, t);
    // rayas de velocidad
    g.strokeStyle = "rgba(230,240,255,.7)"; g.lineWidth = 3; g.lineCap = "round";
    for (const r of this.rayas) { g.globalAlpha = clamp(vis, 0, 1) * r.a * 0.7; g.beginPath(); g.moveTo(r.x, r.y); g.lineTo(r.x, r.y + r.l); g.stroke(); }
    g.globalAlpha = clamp(vis, 0, 1);
    // sombras en el suelo
    for (const e of [eG, eR]) {
      const pie = aPant(e.m, [39, 232]), alto = clamp((PIES - pie[1]) / 300, 0, 1);
      if (pie[1] < -100) continue;
      g.save(); g.globalAlpha = clamp(vis, 0, 1) * 0.55 * (1 - 0.6 * alto); g.fillStyle = "#000";
      g.beginPath(); g.ellipse(pie[0], PIES, 62 * (1 - 0.45 * alto), 12 * (1 - 0.45 * alto), 0, 0, 6.283); g.fill(); g.restore();
    }
    // Rodrigo (la capa: colgando de los hombros o enganchada al gancho)
    const RR = avatar("rodrigo").rig, RGu = avatar().rig;
    if (eR.colgado) this.capaEnganchada(g, eR, RR, t);
    else conMat(g, eR.m, () => capa(g, RR, DORADA, eR.viento, t, eR.largo, eR.flamea));
    pintarAvatar(g, eR.m, eR.pose, t);
    conMat(g, eR.m, () => broches(g, RR, DORADA));
    // Guillermo
    conMat(g, eG.m, () => capa(g, RGu, VERDE, eG.viento, t, eG.largo, eG.flamea));
    pintarAvatar(g, eG.m, eG.pose, t);
    conMat(g, eG.m, () => broches(g, RGu, VERDE));
    // el trozo de capa que cuelga por delante del brazo de la farola
    if (eR.colgado) this.solapa(g, t);
    this.p.dibujar(g);
    g.restore();
    // ¡AL RESCATE!
    if (t > T_DESP) {
      const d = t - T_DESP, k = tramo(d, 0, 0.18), s = lerp(2.6, 1, eIn(k)) * (1 + 0.025 * Math.sin(d * 7));
      const spr = rotulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3) * clamp(vis * 1.3, 0, 1); g.translate(330, 78); g.rotate(-0.05); g.scale(s, s);
      g.drawImage(spr, -spr.width / 2, -spr.height / 2); g.restore();
    }
    // ¡RAS! del enganchón
    if (t > T_ENG && t < T_ENG + 0.8) {
      const k = eBack(tramo(t, T_ENG, T_ENG + 0.15));
      g.save(); g.translate(GANCHO[0] + 112, GANCHO[1] + 120); g.rotate(0.15); g.scale(k, k);
      txt(g, "¡RAAAS!", 0, 0, { tam: 46, peso: 400, fam: FC, color: "#fffdf5", borde: "#5a3a00", bordeAncho: 8, alfa: 1 - tramo(t, T_ENG + 0.6, T_ENG + 0.8), esp: 2 });
      g.restore();
    }
    // entra a negro al principio
    const a = 1 - tramo(t, 0, 0.12);
    if (a > 0) { g.fillStyle = `rgba(0,0,0,${a})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
  capaEnganchada(g, eR, RR, t) {
    const y0 = RR.hombroD[1] - 9;
    const a = aPant(eR.m, [RR.hombroI2[0] + 4, y0]), b = aPant(eR.m, [RR.hombroD[0] - 4, y0]);
    const c = aPant(eR.m, [RR.cuello[0], y0 + 30]);
    const H = GANCHO;
    g.save();
    g.beginPath();
    g.moveTo(a[0], a[1]);
    g.quadraticCurveTo(a[0] - 22, (a[1] + H[1]) / 2, H[0] - 15, H[1]);
    g.lineTo(H[0] + 15, H[1]);
    g.quadraticCurveTo(b[0] + 22, (b[1] + H[1]) / 2, b[0], b[1]);
    g.quadraticCurveTo(c[0], c[1], a[0], a[1]);
    g.closePath();
    const gr = g.createLinearGradient(a[0] - 20, 0, b[0] + 20, 0);
    gr.addColorStop(0, DORADA[2]); gr.addColorStop(0.35, DORADA[0]); gr.addColorStop(0.55, DORADA[1]); gr.addColorStop(1, DORADA[2]);
    g.fillStyle = gr; g.fill();
    g.strokeStyle = DORADA[3]; g.lineWidth = 2; g.stroke();
    g.strokeStyle = "rgba(0,0,0,.25)"; g.lineWidth = 2;
    for (const u of [0.15, 0.4, 0.62, 0.85]) { const p = mezcla(a, b, u); g.beginPath(); g.moveTo(p[0], p[1]); g.quadraticCurveTo(lerp(p[0], H[0], 0.5), lerp(p[1], H[1], 0.6), H[0] + (u - 0.5) * 24, H[1] + 4); g.stroke(); }
    g.restore();
  }
  solapa(g, t) {
    // la capa pasa por encima del brazo de la farola y cuelga un poco por delante
    const H = GANCHO, k = tramo(t, T_ENG, T_ENG + 0.3), bal = Math.sin(t * 5) * 3;
    if (k <= 0) return;
    g.save();
    g.beginPath();
    g.moveTo(H[0] - 17, H[1] - 6);
    g.quadraticCurveTo(H[0], H[1] - 14, H[0] + 17, H[1] - 6);
    g.lineTo(H[0] + 14 + bal, H[1] + 24 * k);
    g.lineTo(H[0] + 3 + bal, H[1] + 17 * k);
    g.lineTo(H[0] - 8 + bal, H[1] + 27 * k);
    g.lineTo(H[0] - 14 + bal, H[1] + 18 * k);
    g.closePath();
    g.fillStyle = DORADA[0]; g.fill(); g.strokeStyle = DORADA[3]; g.lineWidth = 2; g.stroke();
    g.fillStyle = "rgba(255,255,255,.35)"; g.fillRect(H[0] - 10, H[1] - 9, 16, 2);
    g.restore();
  }
}

registrar({ id: "00147", nombre: "Superhéroes", crear: () => new Superheroes() });
})();
