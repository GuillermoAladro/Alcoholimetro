"use strict";
/*
 * 00022 · HALTEROFILIA DE BARRILES
 *
 * Animación del banco. Empieza y acaba en negro.
 * A oscuras da una palmada con las manos llenas de magnesio (¡CLAP!) y se enciende la lámpara. Se agacha, agarra una
 * barra con un barril de cerveza en cada lado y no se mueve (¡NNNGH!): cara roja, sudor, temblores. La sube al pecho
 * y luego por encima de la cabeza (¡ARRIBA!): los barriles sueltan un chorrito de espuma y los tres jueces dan la luz
 * blanca. La suelta: ¡BUM!, la lámpara se balancea y se apaga.
 */
(() => {
const CACHE = cacheTexto();
function cartel(clave, s, o) {
  let c = CACHE.get(clave);
  if (c) return c;
  const m = lienzoNuevo(1, 1).getContext("2d");
  m.font = `${o.peso || 400} ${o.tam}px ${o.fam}`;
  if ("letterSpacing" in m) m.letterSpacing = (o.esp || 0) + "px";
  const pad = (o.glowTam || 0) + (o.bordeAncho || 0) + 14;
  c = lienzoNuevo(m.measureText(s).width + pad * 2, o.tam * 1.3 + pad * 2);
  const g = c.getContext("2d");
  txt(g, s, c.width / 2, c.height / 2 + o.tam * 0.36, o);
  CACHE.set(clave, c);
  return c;
}
function ponCartel(g, c, x, y, s, a = 1, rot = 0) {
  if (a <= 0 || s <= 0) return;
  g.save(); g.globalAlpha *= a; g.translate(x, y); g.rotate(rot); g.scale(s, s);
  g.drawImage(c, -c.width / 2, -c.height / 2); g.restore();
}
function arriba() {
  let c = CACHE.get("arriba3d");
  if (!c) { c = sprite3D("¡ARRIBA!", 132, { cara: "#ffd34d", lado: "#9a5200", borde: "#2a1400" }); CACHE.set("arriba3d", c); }
  return c;
}

const RB = 57;          // radio de los barriles (de pie en el suelo, la barra queda a PIES - RB)
const SEP = 205;        // distancia del centro de la barra a cada barril
const LAMP = [512, 0];  // de donde cuelga la lámpara

/** Barril de madera tumbado (eje a lo largo de la barra), centrado en (0, 0). `lado` = -1 izquierda, 1 derecha. */
function barril(g, lado) {
  const L = 44, Rr = RB, bul = 8;
  g.save();
  g.beginPath();
  g.moveTo(-L, -Rr + 5); g.quadraticCurveTo(0, -Rr - bul, L, -Rr + 5);
  g.quadraticCurveTo(L + 6, 0, L, Rr - 5);
  g.quadraticCurveTo(0, Rr + bul, -L, Rr - 5);
  g.quadraticCurveTo(-L - 6, 0, -L, -Rr + 5); g.closePath();
  const gr = g.createLinearGradient(0, -Rr - bul, 0, Rr + bul);
  gr.addColorStop(0, "#3d2210"); gr.addColorStop(0.3, "#a8642c"); gr.addColorStop(0.45, "#d9934e"); gr.addColorStop(0.75, "#8a4f22"); gr.addColorStop(1, "#2e190b");
  g.fillStyle = gr; g.fill();
  g.strokeStyle = "#1e1007"; g.lineWidth = 2.5; g.stroke();
  g.save(); g.clip();
  // duelas
  g.strokeStyle = "rgba(40,20,6,.45)"; g.lineWidth = 1.4;
  for (let i = -3; i <= 3; i++) { const y = i * 16; g.beginPath(); g.moveTo(-L - 6, y * 0.9); g.quadraticCurveTo(0, y * 1.12, L + 6, y * 0.9); g.stroke(); }
  // aros de hierro
  for (const x of [-30, 30]) {
    const ga = g.createLinearGradient(0, -Rr, 0, Rr);
    ga.addColorStop(0, "#22262b"); ga.addColorStop(0.45, "#9aa3ad"); ga.addColorStop(1, "#1b1e22");
    g.fillStyle = ga; g.beginPath(); g.moveTo(x - 5, -Rr - 10); g.quadraticCurveTo(x - 7, 0, x - 5, Rr + 10); g.lineTo(x + 5, Rr + 10); g.quadraticCurveTo(x + 3, 0, x + 5, -Rr - 10); g.closePath(); g.fill();
  }
  g.restore();
  // la tapa del extremo y el grifo
  g.fillStyle = "#6b3c18"; g.beginPath(); g.ellipse(lado * L, 0, 8, Rr - 7, 0, 0, 6.283); g.fill();
  g.strokeStyle = "#1e1007"; g.lineWidth = 2; g.stroke();
  g.fillStyle = "#c9ced4"; g.beginPath(); g.arc(lado * (L + 6), 0, 6, 0, 6.283); g.fill();
  g.fillStyle = "#7f868e"; g.fillRect(lado > 0 ? L + 6 : -L - 16, -3, 10, 6);
  // texto
  txt(g, "CERVEZA", 0, 5, { tam: 13, peso: 900, fam: FD, color: "rgba(30,14,4,.7)", esp: 1.5 });
  g.restore();
}

class EscenaHalterofilia extends Escena {
  constructor() {
    super(8.9);
    this.p = new Parts(450);
    this.p.suelo = () => PIES;
    this.ESC = 1.5; this.X = 512;
    this.tClap = 0.38; this.tArriba = 5.05; this.tSuelta = 6.95; this.tBum = 7.35;
    this.sudor = [];
    this.caida = null; // la barra cayendo
  }
  luz() {
    const t = this.t;
    const on = t < this.tClap ? 0 : t < this.tClap + 0.3 ? [1, 0.25, 1, 0.5, 1, 1][Math.min(5, Math.floor((t - this.tClap) / 0.05))] : 1;
    const off = t < this.tBum + 0.25 ? 1 : t < this.tBum + 0.75 ? [0.3, 1, 0.6, 0.1, 0.8, 0.2, 0.5, 0, 0.3, 0][Math.min(9, Math.floor((t - this.tBum - 0.25) / 0.05))] : 0;
    return on * off;
  }
  /** cuánto está agachado (0–1) */
  agacha() {
    const t = this.t;
    return eInOut(tramo(t, 1.5, 1.95)) * (1 - eInOut(tramo(t, 3.05, 3.5)));
  }
  estado() {
    const t = this.t, ESC = this.ESC;
    const pose = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0] };
    let manoD = [70, 158], manoI = [9, 160], sx = 1, sy = 1, dx = 0;
    const ag = this.agacha();
    // palmada de magnesio y se frota las manos
    if (t < 1.55) {
      const kJ = t < this.tClap ? eIn(tramo(t, 0.05, this.tClap)) : 1 - 0.25 * Math.abs(Math.sin((t - this.tClap) * 16)) * (t > 0.7 && t < 1.3 ? 1 : 0);
      manoD = mezcla([84, 118], [46, 112], kJ); manoI = mezcla([-6, 118], [32, 112], kJ);
      if (t > 0.7 && t < 1.3) { manoD[1] += 4 * Math.sin(t * 30); manoI[1] -= 4 * Math.sin(t * 30); }
      pose.brazoIDelante = true;
      pose.cara = t < 0.75 ? "sonrisa" : t < 1.3 ? "guino" : "sonrisa";
      if (t > 1.3) { const k = eInOut(tramo(t, 1.3, 1.55)); manoD = mezcla(manoD, [81, 158], k); manoI = mezcla(manoI, [-3, 158], k); }
    }
    // agarra la barra
    let fuerza = 0, barraY = 0;
    if (t >= 1.55) {
      pose.brazoIDelante = true;
      manoD = [81, 158]; manoI = [-3, 158];
      pose.cara = t < 2.0 ? "sorpresa" : "dormido";
      if (t > 2.0) fuerza = tramo(t, 2.0, 2.6);
    }
    // a la altura del pecho
    const kPecho = eInOut(tramo(t, 3.05, 3.45));
    if (kPecho > 0) { manoD = mezcla(manoD, [80, 96], kPecho); manoI = mezcla(manoI, [-2, 96], kPecho); }
    if (t > 3.45 && t < 4.75) { fuerza = 1; pose.cara = Math.floor(t * 3.2) % 3 === 0 ? "sorpresa" : "dormido"; }
    // impulso y por encima de la cabeza
    const kDip = Math.sin(Math.PI * tramo(t, 4.6, 4.85)), kSube = eOut(tramo(t, 4.82, this.tArriba));
    sy *= 1 - 0.06 * kDip;
    if (kSube > 0) { manoD = mezcla(manoD, [84, 16], kSube); manoI = mezcla(manoI, [-6, 16], kSube); pose.brazoIDelante = kSube < 0.45; }
    if (t > 4.82 && t < this.tArriba) pose.cara = "sorpresa";
    if (t >= this.tArriba) {
      fuerza = 0.35 * (1 - tramo(t, 5.6, 6.2));
      pose.cara = t < 5.4 ? "sorpresa" : "risa";
      pose.piernaI = [0, 0.1]; pose.piernaD = [0, -0.1];
    }
    // la suelta
    if (t >= this.tSuelta) {
      const k = eOut(tramo(t, this.tSuelta, this.tSuelta + 0.2));
      manoD = mezcla([84, 16], [100, 70], k); manoI = mezcla([-6, 16], [-22, 70], k);
      pose.brazoIDelante = false;
      pose.cara = t < this.tBum ? "sorpresa" : t < 7.6 ? "risa" : "guino";
      if (t > 7.55) { const k2 = eInOut(tramo(t, 7.55, 7.85)); manoD = mezcla(manoD, [56, 112], k2); manoI = mezcla(manoI, [24, 112], k2); pose.brazoIDelante = k2 > 0.5; if (k2 > 0.5) { manoD[0] += 5 * Math.sin(t * 34); manoI[0] -= 5 * Math.sin(t * 34); } }
    }
    // temblor por el esfuerzo
    if (fuerza > 0) {
      dx = azar(-1.5, 1.5) * fuerza * 2;
      manoD = [manoD[0] + azar(-1, 1) * fuerza, manoD[1] + azar(-1.2, 1.2) * fuerza];
      manoI = [manoI[0] + azar(-1, 1) * fuerza, manoI[1] + azar(-1.2, 1.2) * fuerza];
      pose.rc = azar(-0.03, 0.03) * fuerza;
    }
    // agachado: piernas metidas bajo la camisa y abiertas
    const D = 30 * ag;
    pose.piernaI = [pose.piernaI[0] - D, pose.piernaI[1] + 0.22 * ag + (fuerza > 0 && t < 4.75 ? azar(-0.02, 0.02) : 0)];
    pose.piernaD = [pose.piernaD[0] - D, pose.piernaD[1] - 0.22 * ag + (fuerza > 0 && t < 4.75 ? azar(-0.02, 0.02) : 0)];
    sy *= 1 - 0.08 * ag;
    pose.manoD = manoD; pose.manoI = manoI;
    const m = matAv(this.X + dx, PIES + D * ESC, ESC, 0, sx, sy);
    return { pose, m, fuerza, ag };
  }
  /** Centro de la barra (en pantalla), su flexión y si va por delante del cuerpo. */
  barra(e) {
    const t = this.t;
    if (this.caida) return { x: this.caida.x, y: this.caida.y, flex: this.caida.flex, delante: true };
    if (t < 2.6 || (t < 3.05)) return { x: this.X, y: PIES - RB, flex: 0, delante: true };
    const a = aPant(e.m, e.pose.manoI), b = aPant(e.m, e.pose.manoD);
    const y = (a[1] + b[1]) / 2, x = (a[0] + b[0]) / 2;
    let flex = 6 + 8 * e.fuerza + (t > 3.45 && t < 4.75 ? 4 * Math.sin(t * 9) : 0);
    if (t > this.tArriba) flex = 10 + 16 * Math.exp(-(t - this.tArriba) * 3) * Math.sin((t - this.tArriba) * 22);
    const barbilla = aPant(e.m, [39, 76])[1];
    return { x, y, flex, delante: t < 4.8 || (t < this.tArriba && y > barbilla) };
  }
  pintarBarra(g, B) {
    const L = SEP + 30, lado = (s) => [B.x + s * SEP, B.y + B.flex];
    g.save();
    g.lineCap = "round";
    g.strokeStyle = "#2a2e33"; g.lineWidth = 9;
    g.beginPath(); g.moveTo(B.x - L, B.y + B.flex * 1.15); g.bezierCurveTo(B.x - 70, B.y, B.x + 70, B.y, B.x + L, B.y + B.flex * 1.15); g.stroke();
    g.strokeStyle = "#b9c2cb"; g.lineWidth = 6; g.stroke();
    g.strokeStyle = "rgba(255,255,255,.75)"; g.lineWidth = 1.6; g.beginPath(); g.moveTo(B.x - L, B.y + B.flex * 1.15 - 1.5); g.bezierCurveTo(B.x - 70, B.y - 1.5, B.x + 70, B.y - 1.5, B.x + L, B.y + B.flex * 1.15 - 1.5); g.stroke();
    for (const s of [-1, 1]) {
      const [x, y] = lado(s), ang = Math.atan2(B.flex, SEP) * s;
      // collarín
      g.fillStyle = "#6d757e"; g.save(); g.translate(x - s * 54, y - s * 0); g.rotate(ang); rectR(g, -6, -15, 12, 30, 3); g.fill(); g.restore();
      g.save(); g.translate(x, y); g.rotate(ang); barril(g, s); g.restore();
    }
    g.restore();
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    const e = this.estado();
    this.una("clap", t > this.tClap, () => {
      temblar(7, 0.2);
      const q = aPant(e.m, [39, 112]);
      for (let i = 0; i < 40; i++) { const a = azar(0, 6.283), v = azar(60, 320); p.nueva(P.VAPOR, q[0], q[1], Math.cos(a) * v, Math.sin(a) * v * 0.7 - 40, azar(0.8, 1.6), azar(20, 46)); }
      p.nueva(P.DESTELLO, q[0], q[1], 0, 0, 0.3, 130);
    });
    if (t > 0.6 && t < 1.4 && Math.random() < 20 * dt) { const q = aPant(e.m, [39, 112]); p.nueva(P.VAPOR, q[0] + azar(-14, 14), q[1], azar(-30, 30), azar(-60, -10), azar(0.6, 1), azar(10, 20)); }
    this.una("agarra", t > 1.95, () => temblar(3, 0.15));
    // sudor
    if (e.fuerza > 0.4 && Math.random() < 9 * dt * e.fuerza) {
      const lado = Math.random() < 0.5 ? -1 : 1, q = aPant(e.m, [39 + lado * azar(18, 28), azar(22, 40)]);
      this.sudor.push({ x: q[0], y: q[1], vx: lado * azar(60, 160), vy: azar(-220, -90), v: 1 });
    }
    for (const s of this.sudor) { s.vy += 900 * dt; s.x += s.vx * dt; s.y += s.vy * dt; s.v -= dt * 1.2; }
    this.sudor = this.sudor.filter((s) => s.v > 0 && s.y < PIES);
    this.una("pecho", t > 3.45, () => { temblar(6, 0.2); });
    this.una("arriba", t > this.tArriba, () => {
      temblar(20, 0.5);
      const B = this.barra(e);
      for (let i = 0; i < 30; i++) { const a = azar(0, 6.283), v = azar(200, 500); p.nueva(P.CHISPA, B.x, B.y, Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.6), azar(7, 12)); }
    });
    // chorritos de espuma por los grifos de los barriles
    if (t > this.tArriba + 0.08 && t < 6.6) {
      const B = this.barra(e);
      for (const s of [-1, 1]) {
        const x = B.x + s * (SEP + 52), y = B.y + B.flex;
        const fuerte = 1 - tramo(t, 5.9, 6.6);
        if (Math.random() < 50 * dt * fuerte) p.nueva(P.ESPUMA, x, y, s * azar(150, 260), azar(-300, -160), azar(0.8, 1.3), azar(5, 10));
        if (Math.random() < 25 * dt * fuerte) p.nueva(P.GOTA, x, y, s * azar(120, 230), azar(-260, -120), 1.2, azar(3, 5));
      }
    }
    this.una("suelta", t > this.tSuelta, () => {
      const B = this.barra(e);
      this.caida = { x: B.x, y: B.y, vy: -80, flex: B.flex, tope: false };
    });
    if (this.caida) {
      const C = this.caida;
      C.vy += 2200 * dt; C.y += C.vy * dt;
      C.flex = lerp(C.flex, -6, 4 * dt);
      if (C.y > PIES - RB) {
        C.y = PIES - RB; C.flex = 0;
        if (!C.tope) {
          C.tope = true; C.vy = -C.vy * 0.25;
          temblar(34, 0.8);
          for (const s of [-1, 1]) for (let i = 0; i < 18; i++) p.nueva(P.POLVO, C.x + s * SEP + azar(-40, 40), PIES - 4, s * azar(40, 500), azar(-120, -10), azar(0.7, 1.3), azar(30, 60));
          for (let i = 0; i < 16; i++) p.nueva(P.ESPUMA, C.x + azar(-SEP, SEP), PIES - RB * 2, azar(-200, 200), azar(-380, -150), azar(0.6, 1), azar(5, 9));
        } else C.vy = 0;
      }
    }
    p.alfa = this.luz();
    p.actualizar(dt);
  }
  lampara(g, a, t) {
    // cuelga del techo; se balancea con el golpe
    const sw = t > this.tBum ? 0.22 * Math.exp(-(t - this.tBum) * 1.5) * Math.sin((t - this.tBum) * 7) : 0;
    g.save(); g.translate(LAMP[0], LAMP[1]); g.rotate(sw);
    const vis = Math.max(a, this.t > this.tClap ? 0.35 * (1 - tramo(this.t, this.tBum + 0.7, this.tBum + 0.9)) : 0);
    g.globalAlpha = vis;
    g.strokeStyle = "#2b2f35"; g.lineWidth = 3; g.beginPath(); g.moveTo(0, -10); g.lineTo(0, 22); g.stroke();
    const gr = g.createLinearGradient(-50, 0, 50, 0);
    gr.addColorStop(0, "#14301c"); gr.addColorStop(0.5, "#2f6a40"); gr.addColorStop(1, "#14301c");
    g.fillStyle = gr; g.beginPath(); g.moveTo(-12, 20); g.lineTo(12, 20); g.lineTo(52, 50); g.lineTo(-52, 50); g.closePath(); g.fill();
    g.globalAlpha = 1;
    if (a > 0) {
      g.fillStyle = `rgba(255,248,220,${a})`; g.beginPath(); g.ellipse(0, 50, 22, 9, 0, 0, 6.283); g.fill();
      g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.7 * a; g.drawImage(BLOB.blanco, -80, 10, 160, 90);
      g.globalAlpha = 1;
      const gc = g.createLinearGradient(0, 50, 0, PIES);
      gc.addColorStop(0, `rgba(255,246,215,${0.22 * a})`); gc.addColorStop(1, `rgba(255,246,215,${0.06 * a})`);
      g.fillStyle = gc; g.beginPath(); g.moveTo(-50, 50); g.lineTo(50, 50); g.lineTo(330, PIES + 10); g.lineTo(-330, PIES + 10); g.closePath(); g.fill();
    }
    g.restore();
  }
  plataforma(g) {
    const gr = g.createLinearGradient(0, PIES - 16, 0, PIES + 24);
    gr.addColorStop(0, "#5a3a1c"); gr.addColorStop(1, "#2b1a0b");
    g.fillStyle = "#151515"; g.beginPath(); g.moveTo(170, PIES + 24); g.lineTo(220, PIES - 16); g.lineTo(804, PIES - 16); g.lineTo(854, PIES + 24); g.closePath(); g.fill();
    g.fillStyle = gr; g.beginPath(); g.moveTo(330, PIES + 24); g.lineTo(356, PIES - 16); g.lineTo(668, PIES - 16); g.lineTo(694, PIES + 24); g.closePath(); g.fill();
    g.strokeStyle = "rgba(0,0,0,.4)"; g.lineWidth = 1.5;
    for (let i = 1; i < 6; i++) { const k = i / 6; g.beginPath(); g.moveTo(lerp(356, 668, k), PIES - 16); g.lineTo(lerp(330, 694, k), PIES + 24); g.stroke(); }
    g.fillStyle = "#0d0d0d"; g.fillRect(170, PIES + 24, 684, 12);
  }
  jueces(g, t) {
    // las tres luces blancas de «levantamiento válido»
    const x0 = 892, y = 96;
    g.save();
    g.fillStyle = "#16181c"; rectR(g, x0 - 92, y - 40, 184, 80, 12); g.fill();
    g.strokeStyle = "#3b4048"; g.lineWidth = 3; g.stroke();
    for (let i = 0; i < 3; i++) {
      const on = t > 5.55 + i * 0.22, x = x0 - 54 + i * 54;
      g.fillStyle = on ? "#fffdf2" : "#2a2d33"; g.beginPath(); g.arc(x, y - 4, 19, 0, 6.283); g.fill();
      if (on) { g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha *= 0.8; g.drawImage(BLOB.blanco, x - 46, y - 50, 92, 92); g.restore(); }
    }
    txt(g, "JUECES", x0, y + 32, { tam: 12, peso: 800, color: "rgba(255,253,245,.55)", esp: 4 });
    g.restore();
  }
  dibujar(g) {
    const t = this.t, e = this.estado(), a = this.luz();
    fondo(g, "#000");
    this.lampara(g, a, t);
    g.save(); g.globalAlpha = a;
    this.plataforma(g);
    this.jueces(g, t);
    const B = this.barra(e);
    // sombra
    g.fillStyle = "rgba(0,0,0,.5)"; g.beginPath(); g.ellipse(this.X, PIES - 2, 300, 12, 0, 0, 6.283); g.fill();
    if (B.delante && !this.caida) {
      e.pose.objI = () => { g.save(); const inv = e.m.inverse(); g.transform(inv.a, inv.b, inv.c, inv.d, inv.e, inv.f); this.pintarBarra(g, B); g.restore(); };
      pintarAvatar(g, e.m, e.pose, t);
    } else if (this.caida) {
      pintarAvatar(g, e.m, e.pose, t);
      this.pintarBarra(g, B);
    } else {
      this.pintarBarra(g, B);
      pintarAvatar(g, e.m, e.pose, t);
    }
    // cara roja del esfuerzo
    const rojo = t < this.tArriba + 0.4 ? e.fuerza * 0.85 : 0;
    if (rojo > 0.02) {
      conMat(g, e.m, () => {
        g.globalCompositeOperation = "multiply";
        const gr = g.createRadialGradient(39, 46, 4, 39, 46, 36);
        gr.addColorStop(0, `rgba(255,70,60,${0.75 * rojo})`); gr.addColorStop(0.7, `rgba(255,90,80,${0.5 * rojo})`); gr.addColorStop(1, "rgba(255,90,80,0)");
        g.fillStyle = gr; g.fillRect(0, 6, 78, 80);
      });
    }
    // sudor
    g.fillStyle = "#bfe9ff";
    for (const s of this.sudor) {
      g.save(); g.globalAlpha = a * Math.min(1, s.v * 2); g.translate(s.x, s.y); g.rotate(Math.atan2(s.vy, s.vx) - Math.PI / 2);
      g.scale(1.5, 1.5); g.beginPath(); g.moveTo(0, -7); g.quadraticCurveTo(5, 2, 0, 5); g.quadraticCurveTo(-5, 2, 0, -7); g.fill(); g.restore();
    }
    g.restore();
    this.p.dibujar(g);
    // ¡CLAP!
    if (t > this.tClap && t < 1.25) {
      const k = tramo(t, this.tClap, this.tClap + 0.12), al = 1 - tramo(t, 0.95, 1.25);
      ponCartel(g, cartel("clap", "¡CLAP!", { tam: 64, fam: FC, color: "#ffffff", borde: "#1f2a44", bordeAncho: 8, esp: 2 }), this.X + 170, 300, eBack(k), al, 0.12);
    }
    // ¡NNNGH!
    if (t > 2.1 && t < 3.15) {
      const k = tramo(t, 2.1, 2.25), al = 1 - tramo(t, 2.95, 3.15);
      ponCartel(g, cartel("ngh", "¡NNNGH!", { tam: 58, fam: FC, color: "#ff6a5a", borde: "#3a0600", bordeAncho: 8, esp: 2 }), this.X - 230 + azar(-3, 3), 250 + azar(-3, 3), eBack(k), al * a, -0.1);
    }
    // ¡ARRIBA!
    if (t > this.tArriba) {
      const k = tramo(t, this.tArriba, this.tArriba + 0.16), al = Math.min(1, k * 3) * (1 - tramo(t, this.tBum + 0.2, this.tBum + 0.6));
      const c = arriba();
      ponCartel(g, c, W / 2, 128 + (t < 6.2 ? azar(-2, 2) : 0), lerp(2.4, 1, eIn(k)) * (1 + 0.02 * Math.sin(t * 8)), al);
    }
    // ¡BUM!
    if (t > this.tBum && t < this.tBum + 1.0) {
      const k = tramo(t, this.tBum, this.tBum + 0.12), al = 1 - tramo(t, this.tBum + 0.6, this.tBum + 1.0);
      ponCartel(g, cartel("bum", "¡BUM!", { tam: 96, fam: FC, color: "#ffd34d", borde: "#3a1d00", bordeAncho: 10, esp: 3 }), this.X + 260, 420, eBack(k), al, -0.08);
    }
  }
}

registrar({ id: "00022", nombre: "Halterofilia de barriles", crear: () => new EscenaHalterofilia() });
})();
