"use strict";
/*
 * 00090 · TAXI
 *
 * Animación del banco. Empieza y acaba en negro.
 * Sale del bar de noche y se enciende la farola. Saca las llaves del coche y las mira: en su pensamiento el coche se
 * tacha. Niega con la cabeza y se las guarda. Levanta la mano (¡TAXI!), para un taxi, se sube detrás y se va
 * saludando por la ventanilla. Queda el mensaje, en serio: SI BEBES, NO CONDUZCAS. Se apaga la farola.
 */
(() => {
const SUELO = 566;     // pies en la acera
const CALZADA = 597;   // donde apoyan las ruedas del taxi
const XG = 420;        // dónde está él
const VENT = 97;       // centro de la ventanilla de atrás respecto al centro del taxi
const ESC_DENTRO = 1.35;
const textos = cacheTexto();

/** Calle de noche: cielo, edificios con ventanas, la puerta del bar, acera y calzada (se pinta una vez). */
function pintarCalle() {
  const c = lienzoNuevo(W, H), g = c.getContext("2d");
  const cielo = g.createLinearGradient(0, 0, 0, SUELO);
  cielo.addColorStop(0, "#02040a"); cielo.addColorStop(1, "#0c1326");
  g.fillStyle = cielo; g.fillRect(0, 0, W, H);
  const rnd = semilla(11);
  // edificios del fondo
  let x = 236;
  while (x < W + 40) {
    const w = 80 + rnd() * 110, h = 190 + rnd() * 230, y = SUELO - 24 - h;
    g.fillStyle = rnd() < 0.5 ? "#0b0f1a" : "#0e1220"; g.fillRect(x, y, w - 6, h + 24);
    for (let wy = y + 18; wy < SUELO - 70; wy += 34) for (let wx = x + 12; wx < x + w - 26; wx += 26) {
      const r = rnd();
      if (r < 0.22) { g.fillStyle = r < 0.08 ? "rgba(255,196,110,.75)" : "rgba(255,214,150,.35)"; g.fillRect(wx, wy, 12, 16); }
      else { g.fillStyle = "rgba(40,52,80,.45)"; g.fillRect(wx, wy, 12, 16); }
    }
    x += w;
  }
  // fachada del bar (izquierda)
  const ladr = g.createLinearGradient(0, 150, 0, SUELO);
  ladr.addColorStop(0, "#1c120e"); ladr.addColorStop(1, "#2b1a12");
  g.fillStyle = ladr; g.fillRect(-10, 150, 246, SUELO - 140);
  g.strokeStyle = "rgba(0,0,0,.35)"; g.lineWidth = 1;
  for (let y = 162; y < SUELO - 20; y += 16) { g.beginPath(); g.moveTo(0, y); g.lineTo(236, y); g.stroke(); }
  // puerta iluminada
  const pu = g.createLinearGradient(0, 372, 0, SUELO - 22);
  pu.addColorStop(0, "#ffd88a"); pu.addColorStop(1, "#e08a2c");
  g.fillStyle = "#120b07"; g.fillRect(62, 360, 122, SUELO - 22 - 360 + 4);
  g.fillStyle = pu; g.fillRect(72, 372, 102, SUELO - 22 - 372);
  g.fillStyle = "rgba(120,60,10,.55)"; g.fillRect(120, 372, 5, SUELO - 22 - 372);
  g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.45;
  g.drawImage(BLOB.naranja, 20, SUELO - 70, 210, 90); g.restore();
  // acera, bordillo y calzada
  const ac = g.createLinearGradient(0, SUELO - 24, 0, 580);
  ac.addColorStop(0, "#26272d"); ac.addColorStop(1, "#33343b");
  g.fillStyle = ac; g.fillRect(-10, SUELO - 24, W + 20, 580 - (SUELO - 24));
  g.strokeStyle = "rgba(0,0,0,.4)";
  for (let bx = 30; bx < W; bx += 90) { g.beginPath(); g.moveTo(bx, SUELO - 24); g.lineTo(bx - 14, 580); g.stroke(); }
  g.fillStyle = "#4a4c54"; g.fillRect(-10, 580, W + 20, 6);
  g.fillStyle = "#0d0e12"; g.fillRect(-10, 586, W + 20, 40);
  return c;
}

/** Llaves del coche colgando de la anilla (en unidades de avatar). */
function llaves(g, x, y, ang) {
  g.save(); g.translate(x, y); g.rotate(ang); g.scale(1.9, 1.9);
  g.strokeStyle = "#d6dbe2"; g.lineWidth = 1.4;
  g.beginPath(); g.arc(0, 3.5, 3.6, 0, 6.283); g.stroke();
  // llave de metal
  g.save(); g.translate(-2.5, 6); g.rotate(0.35);
  const me = g.createLinearGradient(-2, 0, 2, 0); me.addColorStop(0, "#8d949c"); me.addColorStop(0.5, "#f1f4f7"); me.addColorStop(1, "#7d848c");
  g.fillStyle = me; g.beginPath(); g.arc(0, 2.5, 3, 0, 6.283); g.fill();
  g.fillRect(-1, 4, 2.2, 10); g.fillRect(1, 9, 1.6, 1.4); g.fillRect(1, 12, 1.6, 1.4);
  g.restore();
  // mando del coche
  g.save(); g.translate(2.6, 7.5); g.rotate(-0.25);
  g.fillStyle = "#15171b"; rectR(g, -3.6, 0, 7.2, 12, 3); g.fill();
  g.strokeStyle = "#3b3f47"; g.lineWidth = 0.7; g.stroke();
  g.fillStyle = "#e3262f"; g.beginPath(); g.arc(0, 4, 1.4, 0, 6.283); g.fill();
  g.fillStyle = "#5d636d"; g.beginPath(); g.arc(0, 8.2, 1.1, 0, 6.283); g.fill();
  g.restore();
  g.restore();
}

/** Coche pequeño de perfil (para el pensamiento). */
function cochecito(g, x, y, s, color) {
  g.save(); g.translate(x, y); g.scale(s, s);
  g.fillStyle = color;
  g.beginPath(); g.moveTo(-50, 8); g.lineTo(-50, -8); g.quadraticCurveTo(-48, -16, -36, -17); g.lineTo(-22, -18);
  g.lineTo(-10, -34); g.lineTo(22, -34); g.lineTo(34, -18); g.quadraticCurveTo(50, -16, 50, -6); g.lineTo(50, 8); g.closePath(); g.fill();
  g.fillStyle = "#bfe3ff"; g.beginPath(); g.moveTo(-17, -19); g.lineTo(-8, -30); g.lineTo(4, -30); g.lineTo(4, -19); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(9, -19); g.lineTo(9, -30); g.lineTo(20, -30); g.lineTo(28, -19); g.closePath(); g.fill();
  g.fillStyle = "#14161a";
  for (const wx of [-30, 30]) { g.beginPath(); g.arc(wx, 9, 11, 0, 6.283); g.fill(); }
  g.fillStyle = "#9aa2ab";
  for (const wx of [-30, 30]) { g.beginPath(); g.arc(wx, 9, 4.5, 0, 6.283); g.fill(); }
  g.restore();
}

/** Bocadillo de pensamiento (nube con dos bolitas que apuntan a (px, py)). */
function nubePensar(g, cx, cy, w, h, px, py, k) {
  if (k <= 0) return;
  const s = eBack(k);
  g.save(); g.translate(cx, cy); g.scale(s, s);
  const bolas = [];
  const n = 10;
  for (let i = 0; i < n; i++) { const a = (i / n) * 6.283; bolas.push([Math.cos(a) * w * 0.4, Math.sin(a) * h * 0.34, h * (0.26 + 0.05 * ((i * 3) % 2))]); }
  bolas.push([0, 0, h * 0.42]);
  const dx = cx - px, dy = cy - py, d = Math.hypot(dx, dy) || 1;
  const peq = [[px - cx + (dx / d) * 62, py - cy + (dy / d) * 62, 12], [px - cx + (dx / d) * 30, py - cy + (dy / d) * 30, 7]].map(([x, y, r]) => [x / s, y / s, r]);
  g.strokeStyle = "#111"; g.lineWidth = 8;
  for (const [x, y, r] of [...bolas, ...peq]) { g.beginPath(); g.arc(x, y, r, 0, 6.283); g.stroke(); }
  g.fillStyle = "#fffdf5";
  for (const [x, y, r] of [...bolas, ...peq]) { g.beginPath(); g.arc(x, y, r, 0, 6.283); g.fill(); }
  g.restore();
}

/** El taxi de perfil, mirando a la izquierda. (X, Y) = centro abajo (donde tocan las ruedas). */
function pintarTaxi(g, X, Y, ang, giroRueda, ocupado, t) {
  g.save(); g.translate(X, Y);
  // sombra
  g.fillStyle = "rgba(0,0,0,.55)"; g.beginPath(); g.ellipse(0, 0, 270, 9, 0, 0, 6.283); g.fill();
  g.rotate(ang);
  // pasos de rueda oscuros
  g.fillStyle = "#08090b";
  for (const wx of [-165, 165]) { g.beginPath(); g.arc(wx, -50, 55, Math.PI, 0); g.lineTo(wx + 55, -20); g.lineTo(wx - 55, -20); g.closePath(); g.fill(); }
  // carrocería con las ventanillas como huecos
  g.beginPath();
  g.moveTo(-262, -50); g.lineTo(-262, -112);
  g.quadraticCurveTo(-260, -146, -225, -150); g.lineTo(-150, -156);
  g.lineTo(-92, -268); g.quadraticCurveTo(-85, -277, -70, -277);
  g.lineTo(128, -277); g.quadraticCurveTo(142, -277, 148, -266);
  g.lineTo(206, -156); g.lineTo(245, -152);
  g.quadraticCurveTo(262, -148, 263, -118); g.lineTo(263, -50);
  g.lineTo(221, -50); g.arc(165, -50, 56, 0, Math.PI, true);
  g.lineTo(-109, -50); g.arc(-165, -50, 56, 0, Math.PI, true);
  g.closePath();
  const vDel = [[-138, -164], [-86, -261], [8, -261], [8, -164]];
  const vTras = [[24, -164], [24, -261], [124, -261], [184, -164]];
  for (const v of [vDel, vTras]) { g.moveTo(v[0][0], v[0][1]); for (const p of v.slice(1)) g.lineTo(p[0], p[1]); g.closePath(); }
  const gr = g.createLinearGradient(0, -277, 0, -40);
  gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.45, "#eef1f4"); gr.addColorStop(1, "#b7bdc4");
  g.fillStyle = gr; g.fill("evenodd");
  g.lineJoin = "round"; g.strokeStyle = "#0b0c0f"; g.lineWidth = 3.5; g.stroke();
  // cristales
  for (const v of [vDel, vTras]) {
    g.beginPath(); g.moveTo(v[0][0], v[0][1]); for (const p of v.slice(1)) g.lineTo(p[0], p[1]); g.closePath();
    g.fillStyle = "rgba(40,70,110,.42)"; g.fill();
    g.strokeStyle = "#16181d"; g.lineWidth = 5; g.stroke();
  }
  g.save(); g.globalCompositeOperation = "lighter"; g.strokeStyle = "rgba(200,230,255,.22)"; g.lineWidth = 9;
  g.beginPath(); g.moveTo(-60, -170); g.lineTo(-20, -255); g.moveTo(60, -170); g.lineTo(100, -255); g.stroke(); g.restore();
  // franja roja diagonal en la puerta de delante
  g.fillStyle = "#d4202a";
  g.beginPath(); g.moveTo(-128, -154); g.lineTo(-96, -154); g.lineTo(-58, -52); g.lineTo(-90, -52); g.closePath(); g.fill();
  // puertas, manillas y molduras
  g.strokeStyle = "rgba(0,0,0,.45)"; g.lineWidth = 2;
  g.beginPath(); g.moveTo(-150, -154); g.lineTo(-150, -60); g.moveTo(16, -160); g.lineTo(16, -56); g.moveTo(178, -154); g.quadraticCurveTo(186, -100, 170, -60); g.stroke();
  g.fillStyle = "#2a2d33"; rectR(g, -40, -136, 26, 6, 3); g.fill(); rectR(g, 118, -136, 26, 6, 3); g.fill();
  g.fillStyle = "rgba(0,0,0,.18)"; g.fillRect(-258, -96, 518, 5);
  // parachoques
  g.fillStyle = "#30333a"; rectR(g, -270, -78, 40, 20, 6); g.fill(); rectR(g, 232, -78, 38, 20, 6); g.fill();
  // faro y piloto
  g.fillStyle = "#fff4c8"; rectR(g, -264, -128, 18, 16, 5); g.fill();
  g.fillStyle = "#ff2b2b"; rectR(g, 250, -132, 13, 22, 4); g.fill();
  // módulo TAXI en el techo
  g.fillStyle = "#1a1c21"; g.fillRect(-12, -286, 64, 10);
  rectR(g, -30, -312, 100, 28, 6); g.fillStyle = "#fff6cf"; g.fill(); g.strokeStyle = "#0b0c0f"; g.lineWidth = 3; g.stroke();
  txt(g, "TAXI", 20, -290, { tam: 24, peso: 900, fam: FD, color: "#111", esp: 3 });
  const luz = ocupado ? "#ff3030" : "#2bff5b";
  g.fillStyle = luz; g.beginPath(); g.arc(88, -292, 8, Math.PI, 0); g.fill();
  g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.7;
  g.drawImage(ocupado ? BLOB.rojo : BLOB.verde, 66, -314, 44, 44); g.restore();
  // ruedas
  for (const wx of [-165, 165]) {
    g.save(); g.translate(wx, -44);
    g.fillStyle = "#111215"; g.beginPath(); g.arc(0, 0, 44, 0, 6.283); g.fill();
    const ll = g.createRadialGradient(-6, -6, 2, 0, 0, 26);
    ll.addColorStop(0, "#f2f4f6"); ll.addColorStop(1, "#7c838c");
    g.fillStyle = ll; g.beginPath(); g.arc(0, 0, 25, 0, 6.283); g.fill();
    g.rotate(giroRueda);
    g.strokeStyle = "#4b5059"; g.lineWidth = 4;
    for (let i = 0; i < 5; i++) { const a = (i / 5) * 6.283; g.beginPath(); g.moveTo(Math.cos(a) * 6, Math.sin(a) * 6); g.lineTo(Math.cos(a) * 22, Math.sin(a) * 22); g.stroke(); }
    g.fillStyle = "#2a2d33"; g.beginPath(); g.arc(0, 0, 6, 0, 6.283); g.fill();
    g.restore();
  }
  g.restore();
}

class EscenaTaxi extends Escena {
  constructor() {
    super(11.0);
    this.p = new Parts(260);
    this.calle = pintarCalle();
    this.fase = 0;
  }
  /** Posición del taxi en x (null si no está en pantalla). */
  xTaxi(t) {
    if (t < 4.35) return null;
    if (t < 5.25) return lerp(1360, XG - VENT, eOut(tramo(t, 4.35, 5.25)));
    if (t < 6.45) return XG - VENT;
    const s = t - 6.45, x = XG - VENT - 520 * s * s - 40 * s;
    return x < -320 ? null : x;
  }
  angTaxi(t) {
    if (t > 5.25 && t < 6.0) return -0.022 * Math.sin((t - 5.25) * 16) * Math.exp(-(t - 5.25) * 5);
    if (t > 6.45 && t < 6.9) return 0.014 * Math.sin(tramo(t, 6.45, 6.9) * Math.PI);
    return 0;
  }
  luz(t) {
    const on = t < 0.75 ? [0, 1, 0, 0, 1, 0.35, 1][Math.min(6, Math.floor(t / 0.1))] : 1;
    const off = t > 10.2 ? (t < 10.5 ? [1, 0.3, 0.8][Math.min(2, Math.floor((t - 10.2) / 0.1))] : 0) : 1;
    return on * off;
  }
  estado() {
    const t = this.t;
    const pose = { cara: "borracho", rc: 0.05 * Math.sin(t * 2.1), piernaI: [0, 0], piernaD: [0, 0] };
    let manoD = [70, 158], manoI = [9, 160];
    let x = XG + 4 * Math.sin(t * 1.6), y = SUELO, esc = 1.5;
    const BOLS = [57, 150];
    // saca las llaves del bolsillo
    if (t > 0.9 && t < 1.4) manoD = mezcla([70, 158], BOLS, eInOut(tramo(t, 0.9, 1.25)));
    let conLlaves = false, swing = 0;
    if (t >= 1.4 && t < 3.4) {
      manoD = mezcla(BOLS, [60, 98], eOut(tramo(t, 1.4, 1.75)));
      conLlaves = true; swing = 0.5 * Math.sin(t * 9) * Math.exp(-(t - 1.4) * 1.6);
    }
    if (t >= 3.4 && t < 3.95) {
      manoD = mezcla([60, 98], BOLS, eInOut(tramo(t, 3.4, 3.72)));
      if (t > 3.72) manoD = mezcla(BOLS, [70, 158], eInOut(tramo(t, 3.72, 3.95)));
      conLlaves = t < 3.72; swing = 0.2 * Math.sin(t * 12);
    }
    if (t > 1.9 && t < 2.95) pose.cara = "sorpresa";
    if (t >= 2.95 && t < 3.95) {
      pose.cara = "sonrisa";
      pose.rc = 0.17 * Math.sin((t - 2.95) * 26) * (1 - tramo(t, 3.35, 3.6));
    }
    if (conLlaves) pose.objD2 = (g, m) => llaves(g, m[0] - 2, m[1] + 1, swing);
    // levanta la mano: ¡TAXI!
    if (t >= 3.95 && t < 5.6) {
      pose.cara = t < 5.15 ? "risa" : "guino";
      const k = eBack(tramo(t, 3.95, 4.2)) * (1 - eInOut(tramo(t, 5.3, 5.6)));
      manoD = mezcla([70, 158], [84 + 3 * Math.sin(t * 18) * (t < 5.0 ? 1 : 0), -6], k);
      manoI = mezcla([9, 160], [4, 150], k);
    }
    // se sube: saltito y se mete detrás de la puerta
    if (t >= 5.6) {
      pose.cara = "risa";
      const kSube = eOut(tramo(t, 5.6, 5.8)), kBaja = eInOut(tramo(t, 5.8, 6.2));
      y = lerp(lerp(SUELO, SUELO - 40, kSube), CALZADA + 62, kBaja);
      esc = lerp(1.5, ESC_DENTRO, kBaja);
      manoD = [66, 120]; manoI = [12, 120];
      pose.piernaI = [-10 * kSube * (1 - kBaja), 0.1]; pose.piernaD = [-10 * kSube * (1 - kBaja), -0.1];
      const xt = this.xTaxi(t);
      x = (xt == null ? -999 : xt + VENT);
      if (t > 6.2) {
        manoD = [72 + 6 * Math.sin(t * 15), 50 + 3 * Math.cos(t * 15)];
        pose.cara = t < 6.6 ? "risa" : "guino";
        pose.rc = 0.06 * Math.sin(t * 5);
      }
    }
    pose.manoD = manoD; pose.manoI = manoI;
    return { pose, m: matAv(x, y, esc), x, y, esc, dentro: t >= 5.6 };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    this.una("tacha", t > 2.55, () => temblar(5, 0.2));
    this.una("taxi", t > 4.22, () => temblar(8, 0.25));
    // frenazo
    this.una("frena", t > 4.95, () => {
      for (const wx of [-165, 165]) for (let i = 0; i < 10; i++) p.nueva(P.POLVO, XG - VENT + wx + azar(-20, 40), CALZADA - azar(0, 10), azar(40, 260), azar(-60, -10), azar(0.5, 0.9), azar(26, 44));
    });
    // humo del tubo de escape al arrancar
    const xt = this.xTaxi(t);
    if (xt != null && t > 6.4 && t < 7.6 && Math.random() < 30 * dt) p.nueva(P.HUMO, xt + 268, CALZADA - 56, azar(60, 160), azar(-40, -10), azar(0.6, 1.0), azar(26, 40));
    this.una("arranca", t > 6.45, () => { for (let i = 0; i < 8; i++) p.nueva(P.HUMO, XG - VENT + 268, CALZADA - 56, azar(80, 220), azar(-50, -5), azar(0.7, 1.1), azar(30, 46)); });
    p.actualizar(dt);
  }
  dibujar(g) {
    const t = this.t, e = this.estado(), luz = this.luz(t);
    fondo(g, "#000");
    g.drawImage(this.calle, 0, 0);
    // luz de la farola
    const LX = 516, LY = 108;
    if (luz > 0) {
      g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = luz;
      const cono = g.createLinearGradient(0, LY, 0, SUELO);
      cono.addColorStop(0, "rgba(255,226,160,.30)"); cono.addColorStop(1, "rgba(255,226,160,.06)");
      g.fillStyle = cono; g.beginPath(); g.moveTo(LX - 22, LY + 10); g.lineTo(LX + 22, LY + 10); g.lineTo(XG + 190, SUELO); g.lineTo(XG - 170, SUELO); g.closePath(); g.fill();
      g.globalAlpha = 0.55 * luz; g.drawImage(BLOB.amarillo, XG - 210, SUELO - 40, 420, 70);
      g.globalAlpha = 0.9 * luz; g.drawImage(BLOB.amarillo, LX - 40, LY - 26, 80, 70);
      g.restore();
    }
    // farola
    g.fillStyle = "#15171c"; g.fillRect(596, LY - 8, 9, SUELO - LY - 10); g.fillRect(588, SUELO - 22, 25, 12);
    g.strokeStyle = "#15171c"; g.lineWidth = 8; g.lineCap = "round";
    g.beginPath(); g.moveTo(600, LY + 10); g.quadraticCurveTo(600, LY - 22, 560, LY - 18); g.lineTo(530, LY - 10); g.stroke();
    g.fillStyle = "#1d2027"; g.beginPath(); g.moveTo(LX - 26, LY + 6); g.lineTo(LX + 26, LY + 6); g.lineTo(LX + 14, LY - 12); g.lineTo(LX - 14, LY - 12); g.closePath(); g.fill();
    g.fillStyle = luz > 0.5 ? "#fff1c4" : "#5a5446"; g.fillRect(LX - 20, LY + 5, 40, 5);
    // neón del bar
    const neon = this.neon();
    if (neon) { g.save(); g.globalAlpha = t > 1 && Math.sin(t * 29) > 0.96 ? 0.6 : 1; g.drawImage(neon, 118 - neon.width / 2, 300 - neon.height / 2); g.restore(); }
    // él (y el taxista) detrás del taxi
    const xt = this.xTaxi(t), ocupado = t > 6.25;
    const recorta = (f) => { g.save(); g.beginPath(); g.rect(-60, -60, W + 120, CALZADA - 50 + 60); g.clip(); f(); g.restore(); };
    if (xt != null) {
      recorta(() => {
        const mT = matAv(xt - 64, CALZADA + 62, ESC_DENTRO);
        pintarAvatar(g, mT, { cara: "sonrisa", gafas: true, rc: 0.03 * Math.sin(t * 3), manoD: [62, 128], manoI: [16, 128] }, t);
      });
    }
    if (e.dentro) recorta(() => pintarAvatar(g, e.m, e.pose, t));
    else pintarAvatar(g, e.m, e.pose, t);
    if (xt != null) {
      // haz de los faros por delante
      g.save(); g.globalCompositeOperation = "lighter";
      const fx = xt - 262, fy = CALZADA - 120;
      const haz = g.createLinearGradient(fx, 0, fx - 300, 0);
      haz.addColorStop(0, "rgba(255,240,190,.35)"); haz.addColorStop(1, "rgba(255,240,190,0)");
      g.fillStyle = haz; g.beginPath(); g.moveTo(fx, fy - 6); g.lineTo(fx - 320, fy - 40); g.lineTo(fx - 320, CALZADA + 10); g.lineTo(fx, fy + 12); g.closePath(); g.fill();
      g.restore();
      pintarTaxi(g, xt, CALZADA, this.angTaxi(t), xt / 44, ocupado, t);
      // líneas de velocidad
      if (t > 4.35 && t < 5.1 || t > 6.7) {
        g.save(); g.strokeStyle = "rgba(255,255,255,.4)"; g.lineWidth = 3; g.lineCap = "round";
        const dir = t < 6 ? 1 : 1;
        for (let i = 0; i < 6; i++) { const ly = CALZADA - 60 - i * 38, lx = xt + 280 + (i % 3) * 30; g.beginPath(); g.moveTo(lx, ly); g.lineTo(lx + dir * azar(70, 150), ly); g.stroke(); }
        g.restore();
      }
    }
    this.p.dibujar(g);
    // pensamiento: el coche, tachado
    const kN = tramo(t, 2.0, 2.25) * (1 - tramo(t, 3.4, 3.6));
    if (kN > 0) {
      const cx = 250, cy = 150, q = aPant(e.m, [30, 2]);
      nubePensar(g, cx, cy, 250, 160, q[0], q[1], kN);
      g.save(); g.translate(cx, cy); g.scale(eBack(kN), eBack(kN));
      cochecito(g, 0, 18, 1.15, "#3b6fd6");
      if (t > 2.55) {
        const k = tramo(t, 2.55, 2.7), s = lerp(2.2, 1, eOut(k));
        g.save(); g.scale(s, s); g.globalAlpha = Math.min(1, k * 2);
        g.strokeStyle = "#e3262f"; g.lineWidth = 11; g.lineCap = "round";
        g.beginPath(); g.arc(0, 0, 58, 0, 6.283); g.stroke();
        g.beginPath(); g.moveTo(-41, -41); g.lineTo(41, 41); g.stroke();
        g.restore();
      }
      g.restore();
    }
    // ¡TAXI!
    if (t > 4.2 && t < 5.7) {
      const k = tramo(t, 4.2, 4.36), a = 1 - tramo(t, 5.45, 5.7);
      const q = aPant(e.m, e.pose.manoD);
      g.save(); g.strokeStyle = `rgba(255,255,255,${0.8 * a})`; g.lineWidth = 4; g.lineCap = "round";
      for (let i = 0; i < 3; i++) { const an = -2.2 + i * 0.55, r0 = 34 + 6 * Math.sin(t * 20 + i); g.beginPath(); g.moveTo(q[0] + Math.cos(an) * r0, q[1] + Math.sin(an) * r0); g.lineTo(q[0] + Math.cos(an) * (r0 + 22), q[1] + Math.sin(an) * (r0 + 22)); g.stroke(); }
      g.restore();
      g.save(); g.translate(q[0] + 185, q[1] - 30); g.rotate(-0.1); g.scale(eBack(k), eBack(k));
      txt(g, "¡TAXI!", 0, 0, { tam: 104, peso: 400, fam: FC, color: "#ffd34d", borde: "#2a1800", bordeAncho: 10, alfa: a, esp: 3 });
      g.restore();
    }
    // el mensaje, en serio
    const kM = tramo(t, 7.4, 7.9) * (1 - tramo(t, 10.0, 10.55));
    if (kM > 0) {
      g.fillStyle = `rgba(0,0,0,${0.62 * kM})`; g.fillRect(-60, -60, W + 120, H + 120);
      const msg = this.mensaje();
      if (msg) { const s = lerp(1.05, 1, eOut(tramo(t, 7.4, 7.9))); g.save(); g.globalAlpha = kM; g.translate(W / 2, 268); g.scale(s, s); g.drawImage(msg, -msg.width / 2, -msg.height / 2); g.restore(); }
    }
    // negro al empezar (la farola se enciende) y al acabar
    const osc = Math.max(t < 0.75 ? 0.97 * (1 - luz) : 0, tramo(t, 10.35, 10.95));
    if (osc > 0) { g.fillStyle = `rgba(0,0,0,${osc})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
  neon() {
    if (textos.has("neon")) return textos.get("neon");
    const c = lienzoNuevo(200, 110), g = c.getContext("2d");
    g.strokeStyle = "rgba(255,80,160,.6)"; g.lineWidth = 3; rectR(g, 22, 18, 156, 74, 16);
    g.shadowColor = "#ff3d84"; g.shadowBlur = 14; g.stroke();
    txt(g, "BAR", 100, 78, { tam: 60, peso: 900, fam: FD, color: "#ffd0e6", glow: "#ff3d84", glowTam: 18, esp: 8 });
    textos.set("neon", c);
    return c;
  }
  mensaje() {
    if (textos.has("msg")) return textos.get("msg");
    const c = lienzoNuevo(980, 300), g = c.getContext("2d");
    txt(g, "SI BEBES,", 490, 118, { tam: 116, peso: 900, fam: FD, color: "#fffdf5", borde: "#000", bordeAncho: 10, esp: 4, max: 940 });
    txt(g, "NO CONDUZCAS", 490, 246, { tam: 116, peso: 900, fam: FD, color: "#ffd34d", borde: "#000", bordeAncho: 10, esp: 4, max: 940 });
    textos.set("msg", c);
    return c;
  }
}

registrar({ id: "00090", nombre: "Taxi", crear: () => new EscenaTaxi() });
})();
