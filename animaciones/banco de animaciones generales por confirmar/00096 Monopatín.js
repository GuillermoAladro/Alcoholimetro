"use strict";
/*
 * 00096 · MONOPATÍN
 *
 * Animación del banco. Empieza y acaba en negro.
 * Llega en monopatín a toda velocidad, se agacha y salta una caja de botellines (ollie, ¡CLAC!). Aterriza… más o
 * menos: con un pie fuera, haciendo molinillos con los brazos. Se recupera y posa: ¡TOMA YA! Se va rodando
 * chulito por la derecha y fuera de pantalla se oye el golpe (¡CATAPUM!). Vuelve el monopatín solo, del revés, y él
 * asoma despeinado y mareado, aún presumiendo.
 */
(() => {
const ESC = 1.45;
const DECK = PIES - 25;          // altura de la tabla (donde pisa) cuando rueda
const CAJA = 560;                // centro de la caja de botellines
const SALTA = 1.95, ATERRIZA = 2.85, TOMA = 4.05, CHOQUE = 5.75;
const textos = cacheTexto();

function pintarCalle() {
  const c = lienzoNuevo(W, H), g = c.getContext("2d");
  const cielo = g.createLinearGradient(0, 0, 0, PIES);
  cielo.addColorStop(0, "#0b0618"); cielo.addColorStop(0.7, "#2a1638"); cielo.addColorStop(1, "#4a2440");
  g.fillStyle = cielo; g.fillRect(0, 0, W, H);
  const rnd = semilla(21);
  for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(255,255,255,${0.3 + rnd() * 0.5})`; g.fillRect(rnd() * W, rnd() * 260, 2, 2); }
  let x = -10;
  while (x < W) {
    const w = 60 + rnd() * 100, h = 90 + rnd() * 160;
    g.fillStyle = "#150c20"; g.fillRect(x, PIES - 40 - h, w - 4, h + 40);
    g.fillStyle = "rgba(255,190,120,.4)";
    for (let wy = PIES - 30 - h; wy < PIES - 70; wy += 26) for (let wx = x + 8; wx < x + w - 18; wx += 20) if (rnd() < 0.25) g.fillRect(wx, wy, 8, 11);
    x += w;
  }
  // muro con pintadas de colores (manchas, sin letras)
  g.fillStyle = "#2b2230"; g.fillRect(0, PIES - 120, W, 82);
  g.strokeStyle = "rgba(0,0,0,.3)"; g.lineWidth = 1;
  for (let y = PIES - 120; y < PIES - 40; y += 16) for (let x = (y / 16) % 2 ? 0 : 24; x < W; x += 48) g.strokeRect(x, y, 48, 16);
  for (let i = 0; i < 7; i++) {
    const col = ["43,255,91", "255,61,132", "47,227,232", "255,211,77"][i % 4], cx = 80 + i * 150, cy = PIES - 82;
    g.strokeStyle = `rgba(${col},.32)`; g.lineWidth = 7; g.lineCap = "round";
    g.beginPath(); g.moveTo(cx - 40, cy + 14);
    for (let k = 0; k < 5; k++) g.quadraticCurveTo(cx - 30 + k * 18, cy - 26 + (k % 2) * 40, cx - 20 + k * 18, cy + (k % 2 ? 14 : -10));
    g.stroke();
    g.fillStyle = `rgba(${col},.25)`; g.beginPath(); g.arc(cx + 52, cy - 12, 5, 0, 6.283); g.fill();
  }
  g.fillStyle = "rgba(0,0,0,.35)"; g.fillRect(0, PIES - 40, W, 4);
  const su = g.createLinearGradient(0, PIES - 38, 0, H);
  su.addColorStop(0, "#3a3640"); su.addColorStop(1, "#24212a");
  g.fillStyle = su; g.fillRect(0, PIES - 38, W, H - PIES + 40);
  g.fillStyle = "rgba(255,255,255,.08)";
  for (let xx = 20; xx < W; xx += 140) g.fillRect(xx, PIES + 6, 70, 4);
  return c;
}

/** Caja de botellines (base en el suelo). */
function pintarCaja(g, x) {
  const w = 140, h = 66, y = PIES - h;
  for (let i = 0; i < 5; i++) {
    const bx = x - 52 + i * 26;
    g.fillStyle = "#5a2f0c"; rectR(g, bx - 7, y - 30, 14, 40, 4); g.fill();
    g.fillRect(bx - 4, y - 44, 8, 16);
    g.fillStyle = "rgba(255,255,255,.3)"; g.fillRect(bx - 4, y - 28, 2, 26);
    g.fillStyle = "#ffd34d"; rectR(g, bx - 5.5, y - 48, 11, 6, 2); g.fill();
  }
  const gr = g.createLinearGradient(0, y, 0, PIES);
  gr.addColorStop(0, "#ffcf33"); gr.addColorStop(1, "#c98a00");
  g.fillStyle = gr; rectR(g, x - w / 2, y, w, h, 6); g.fill();
  g.strokeStyle = "#7a4d00"; g.lineWidth = 3; g.stroke();
  g.fillStyle = "#7a4d00";
  for (let i = 0; i < 4; i++) rectR(g, x - 54 + i * 30, y + 24, 18, 30, 4), g.fill();
  g.fillStyle = "#3a2400"; rectR(g, x - 26, y + 7, 52, 10, 5); g.fill();
}

/** Monopatín; (x, y) = centro de la tabla por arriba. bocaAbajo: del revés. */
function pintarTabla(g, x, y, ang, rueda, bocaAbajo = false) {
  g.save(); g.translate(x, y); g.rotate(ang); if (bocaAbajo) g.scale(1, -1);
  // ejes y ruedas
  g.fillStyle = "#9aa1aa";
  for (const sx of [-44, 44]) { g.beginPath(); g.moveTo(sx - 12, 6); g.lineTo(sx + 12, 6); g.lineTo(sx + 5, 13); g.lineTo(sx - 5, 13); g.closePath(); g.fill(); }
  for (const sx of [-44, 44]) {
    g.save(); g.translate(sx, 17);
    g.fillStyle = "#f2e6c4"; g.beginPath(); g.arc(0, 0, 8.5, 0, 6.283); g.fill();
    g.strokeStyle = "#b8a77a"; g.lineWidth = 1.5; g.stroke();
    g.rotate(rueda); g.strokeStyle = "#8a7a50"; g.beginPath(); g.moveTo(-5, 0); g.lineTo(5, 0); g.moveTo(0, -5); g.lineTo(0, 5); g.stroke();
    g.restore();
  }
  // tabla
  g.lineCap = "round"; g.lineJoin = "round";
  const ruta = () => { g.beginPath(); g.moveTo(-82, -11); g.quadraticCurveTo(-72, 3, -56, 3); g.lineTo(56, 3); g.quadraticCurveTo(72, 3, 82, -11); };
  g.strokeStyle = "#ff3d84"; g.lineWidth = 9; ruta(); g.stroke();
  g.strokeStyle = "#c27a3e"; g.lineWidth = 5; g.save(); g.translate(0, -2); ruta(); g.stroke(); g.restore();
  g.strokeStyle = "#141416"; g.lineWidth = 3; g.save(); g.translate(0, -5); ruta(); g.stroke(); g.restore();
  g.restore();
}

class EscenaSkate extends Escena {
  constructor() {
    super(9.6);
    this.p = new Parts(300);
    this.calle = pintarCalle();
  }
  xEn(t) {
    if (t < 1.6) return lerp(-160, 300, eOut(tramo(t, 0, 1.6)) * 0.4 + tramo(t, 0, 1.6) * 0.6);
    if (t < SALTA) return lerp(300, 400, tramo(t, 1.6, SALTA));
    if (t < ATERRIZA) return lerp(400, 720, tramo(t, SALTA, ATERRIZA));
    if (t < 4.6) return lerp(720, 790, eOut(tramo(t, ATERRIZA, 3.7)));
    return 790 + 560 * Math.pow(t - 4.6, 2);
  }
  altura(t) { // cuánto sube en el salto
    if (t < SALTA || t > ATERRIZA) return 0;
    const u = tramo(t, SALTA, ATERRIZA);
    return 4 * 165 * u * (1 - u);
  }
  tablaAng(t) {
    if (t < SALTA - 0.05) return 0;
    if (t < SALTA + 0.05) return 0.25 * tramo(t, SALTA - 0.05, SALTA) - 0.5 * tramo(t, SALTA, SALTA + 0.05);
    if (t < ATERRIZA) { const u = tramo(t, SALTA, ATERRIZA); return u < 0.45 ? -0.5 * (1 - u / 0.45) : 0.14 * Math.sin(Math.PI * (u - 0.45) / 0.55); }
    if (t < 3.3) return 0.06 * Math.sin((t - ATERRIZA) * 30) * (1 - tramo(t, ATERRIZA, 3.3));
    return 0;
  }
  estado() {
    const t = this.t;
    const pose = { cara: "guino", rc: 0, piernaI: [0, 0.07], piernaD: [0, -0.07] };
    let manoD = [100, 138], manoI = [-22, 138], sx = 1, sy = 1, giro = 0, pies = 0;
    const x = this.xEn(t), yT = DECK - this.altura(t);
    // llega: brazos de equilibrio
    manoD = [96 + 4 * Math.sin(t * 3), 132]; manoI = [-18 - 4 * Math.sin(t * 3), 132];
    // se agacha y salta
    if (t > 1.6 && t < SALTA) { const k = eInOut(tramo(t, 1.6, SALTA)); sy = 1 - 0.16 * k; sx = 1 + 0.04 * k; manoD = mezcla(manoD, [92, 160], k); manoI = mezcla(manoI, [-14, 160], k); pose.cara = "sonrisa"; }
    if (t >= SALTA && t < ATERRIZA) {
      const u = tramo(t, SALTA, ATERRIZA);
      sy = u < 0.15 ? lerp(0.84, 1.08, u / 0.15) : lerp(1.08, 1, tramo(u, 0.15, 0.4));
      const enc = Math.sin(Math.PI * u);
      pose.piernaI = [-18 * enc, 0.12]; pose.piernaD = [-18 * enc, -0.12]; pies = 18 * enc * ESC * sy;
      manoD = [106, 70 - 20 * enc]; manoI = [-28, 70 - 20 * enc];
      pose.cara = u > 0.3 && u < 0.85 ? "risa" : "sorpresa";
    }
    // aterriza más o menos: molinillos con los brazos
    if (t >= ATERRIZA && t < TOMA) {
      const k = tramo(t, ATERRIZA, TOMA);
      sy = t < 3.05 ? lerp(0.8, 1, tramo(t, ATERRIZA, 3.05)) : 1;
      giro = 0.42 * Math.sin((t - ATERRIZA) * 8.5) * (1 - eIn(k));
      const w = (t - ATERRIZA) * 16;
      manoD = [70 + 42 * Math.cos(w), 96 + 42 * Math.sin(w)]; manoI = [9 - 42 * Math.cos(w + 1), 96 + 42 * Math.sin(w + 1)];
      pose.piernaD = [-16 * Math.max(0, Math.sin((t - ATERRIZA) * 8.5)), -0.25];
      pose.piernaI = [0, 0.1];
      pose.cara = "sorpresa"; pose.rc = -giro * 0.6;
    }
    // ¡TOMA YA!
    if (t >= TOMA) {
      const k = eBack(tramo(t, TOMA, TOMA + 0.3));
      manoD = mezcla([96, 132], [104, -2], k); manoI = mezcla([-18, 132], [-26, -2], k);
      pose.cara = t < 4.9 ? "risa" : "guino";
      pose.rc = 0.05 * Math.sin(t * 6);
      sy = 1 + 0.03 * Math.sin(Math.PI * tramo(t, TOMA, TOMA + 0.3));
    }
    pose.manoD = manoD; pose.manoI = manoI;
    return { pose, m: matAv(x, yT, ESC, giro, sx, sy), x, yT, pies };
  }
  /** Vuelve asomándose por la derecha, despeinado. */
  estadoAsoma(t) {
    const k = eOut(tramo(t, 7.55, 8.0));
    const pose = { cara: "borracho", puntas: 0.85, rc: 0.1 * Math.sin(t * 2.5), piernaI: [0, 0], piernaD: [0, 0], manoD: [70, 158], manoI: [-12 + 4 * Math.sin(t * 9), 40] };
    return { pose, m: matAv(lerp(1180, 1062, k), PIES, ESC, -0.36 * k) };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    const e = this.estado();
    this.una("clac", t > SALTA, () => { temblar(6, 0.15); for (let i = 0; i < 12; i++) p.nueva(P.POLVO, e.x - 70, PIES - 4, azar(-160, 40), azar(-60, -10), azar(0.4, 0.8), azar(18, 30)); });
    this.una("aterriza", t > ATERRIZA, () => {
      temblar(14, 0.3);
      for (let i = 0; i < 18; i++) p.nueva(P.POLVO, e.x + azar(-60, 60), PIES - 4, azar(-200, 200), azar(-60, -10), azar(0.5, 0.9), azar(20, 34));
      for (let i = 0; i < 16; i++) { const a = azar(-Math.PI, 0), v = azar(150, 380); p.nueva(P.CHISPA, e.x + azar(-44, 44), PIES - 2, Math.cos(a) * v, Math.sin(a) * v, azar(0.25, 0.5), azar(5, 9)); }
    });
    this.una("toma", t > TOMA + 0.1, () => {
      temblar(14, 0.35);
      for (let i = 0; i < 24; i++) { const a = azar(0, 6.283), v = azar(200, 500); p.nueva(P.CHISPA, e.x, e.yT - 200, Math.cos(a) * v, Math.sin(a) * v, azar(0.4, 0.8), azar(7, 12)); }
    });
    if (t < 1.6 || (t > 4.6 && t < 5.5)) if (Math.random() < 20 * dt) p.nueva(P.POLVO, e.x - 60, PIES - 4, azar(-120, -40), azar(-30, -5), azar(0.3, 0.6), azar(12, 22));
    this.una("choque", t > CHOQUE, () => {
      temblar(26, 0.6);
      for (let i = 0; i < 40; i++) p.nueva(P.POLVO, W + azar(-30, 10), azar(260, PIES), azar(-360, -40), azar(-120, 60), azar(0.7, 1.3), azar(36, 70));
      for (let i = 0; i < 26; i++) { const a = azar(Math.PI * 0.6, Math.PI * 1.4), v = azar(250, 650); p.nueva(P.CHISPA, W - 10, azar(300, 520), Math.cos(a) * v, Math.sin(a) * v, azar(0.4, 0.8), azar(8, 14)); }
    });
    p.actualizar(dt);
  }
  dibujar(g) {
    const t = this.t, e = this.estado();
    fondo(g, "#000");
    g.drawImage(this.calle, 0, 0);
    pintarCaja(g, CAJA);
    // sombra
    const sh = 1 - this.altura(t) / 300;
    if (e.x < W + 120) { g.fillStyle = `rgba(0,0,0,${0.35 * sh})`; g.beginPath(); g.ellipse(e.x, PIES + 2, 80 * sh, 8 * sh, 0, 0, 6.283); g.fill(); }
    // líneas de velocidad
    if (t < 1.7 || (t > 4.7 && t < 5.5)) {
      g.save(); g.strokeStyle = "rgba(255,255,255,.35)"; g.lineWidth = 3; g.lineCap = "round";
      for (let i = 0; i < 7; i++) { const ly = e.yT - 30 - i * 44, lx = e.x - 110 - (i % 3) * 26; g.beginPath(); g.moveTo(lx, ly); g.lineTo(lx - azar(60, 150), ly); g.stroke(); }
      g.restore();
    }
    // la tabla bajo sus pies (o vuelve sola del revés)
    if (t < 6.2) pintarTabla(g, e.x, e.yT + 1 - e.pies, this.tablaAng(t), e.x / 8.5);
    else {
      const k = eOut(tramo(t, 6.3, 7.5)), xt = lerp(1130, 850, k);
      pintarTabla(g, xt, PIES - 12, Math.PI + 0.05 * Math.sin(t * 20) * (1 - k), t * 14 * (1 - k * 0.7));
    }
    if (t < 6.2) pintarAvatar(g, e.m, e.pose, t);
    // asoma por la derecha
    if (t > 7.5) {
      const a = this.estadoAsoma(t);
      pintarAvatar(g, a.m, a.pose, t);
      const c = aPant(a.m, [39, 10]);
      for (let i = 0; i < 3; i++) {
        const an = t * 4 + (i * 6.283) / 3;
        g.save(); g.translate(c[0] + Math.cos(an) * 50, c[1] - 30 + Math.sin(an) * 14); g.rotate(t * 3);
        estrella(g, 0, 0, 12, 5, 0); g.fillStyle = "#ffd34d"; g.fill(); g.strokeStyle = "#7a4d00"; g.lineWidth = 2; g.stroke();
        g.restore();
      }
      if (t > 8.15) { const q = aPant(a.m, [10, -6]); bocadillo(g, q[0] - 150, q[1] - 30, "…¡TOMA YA!", q[0] - 40, q[1] + 10, tramo(t, 8.15, 8.4) * (1 - tramo(t, 9.0, 9.2)), 30); }
    }
    this.p.dibujar(g);
    // ¡CLAC!
    if (t > SALTA && t < SALTA + 0.6) {
      const d = t - SALTA;
      g.save(); g.translate(330, 470); g.rotate(-0.15); g.scale(eBack(tramo(d, 0, 0.12)), eBack(tramo(d, 0, 0.12)));
      txt(g, "¡CLAC!", 0, 0, { tam: 46, peso: 400, fam: FC, color: "#fffdf5", borde: "#2a1438", bordeAncho: 7, alfa: 1 - tramo(d, 0.4, 0.6), esp: 2 });
      g.restore();
    }
    // ¡TOMA YA!
    if (t > TOMA + 0.1 && t < 6.0) {
      const tit = this.titulo(), k = tramo(t, TOMA + 0.1, TOMA + 0.24), s = lerp(2.6, 1, eIn(k)) * (1 + 0.03 * Math.sin(t * 8));
      const a = Math.min(1, k * 4) * (1 - tramo(t, 5.6, 6.0));
      if (tit) { g.save(); g.globalAlpha = a; g.translate(W / 2, 110); g.rotate(-0.06); g.scale(s, s); g.drawImage(tit, -tit.width / 2, -tit.height / 2); g.restore(); }
    }
    // ¡CATAPUM! fuera de pantalla
    if (t > CHOQUE && t < CHOQUE + 1.3) {
      const d = t - CHOQUE;
      g.save(); g.translate(800 + azar(-4, 4) * (1 - tramo(d, 0, 0.6)), 330); g.rotate(0.12); g.scale(eBack(tramo(d, 0, 0.14)), eBack(tramo(d, 0, 0.14)));
      txt(g, "¡CATAPUM!", 0, 0, { tam: 96, peso: 400, fam: FC, color: "#ff5a3d", borde: "#2a0a00", bordeAncho: 11, alfa: 1 - tramo(d, 1.0, 1.3), esp: 3 });
      g.restore();
    }
    const osc = Math.max(1 - tramo(t, 0, 0.4), tramo(t, 9.0, 9.55));
    if (osc > 0) { g.fillStyle = `rgba(0,0,0,${osc})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
  titulo() {
    if (textos.has(1)) return textos.get(1);
    const c = lienzoNuevo(760, 180), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 40, 0, 140);
    gr.addColorStop(0, "#f4fff6"); gr.addColorStop(0.5, "#8dffab"); gr.addColorStop(1, "#16c94a");
    txt(g, "¡TOMA YA!", 380, 140, { tam: 132, peso: 900, fam: FD, color: gr, borde: "#032010", bordeAncho: 12, esp: 4, glow: "rgba(43,255,91,.7)", glowTam: 24 });
    textos.set(1, c);
    return c;
  }
}

registrar({ id: "00096", nombre: "Monopatín", crear: () => new EscenaSkate() });
})();
