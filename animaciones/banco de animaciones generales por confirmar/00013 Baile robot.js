"use strict";
/*
 * 00013 · BAILE ROBOT
 *
 * Animación del banco. Empieza y acaba en negro.
 * En la oscuridad se dibuja un suelo de neón y una línea de neón le recorre la silueta. Se le encienden los ojos:
 * MODO ROBOT. Baila a golpes, cada pose quieta un cuarto de segundo, con la silueta de neón (y su eco rosa) y BIP BOP
 * a cada paso. Al final se le acaba la batería: se le cae la cabeza y la pantalla se apaga como una tele vieja.
 */
(() => {
const X = 512, ESC = 1.5, PASO = 0.25;
const INICIO = 1.45, FIN_BAILE = 7.45, APAGA = 8.0;
const CIAN = "#2fe3e8", ROSA = "#ff3d84";
// poses robóticas (unidades de avatar)
const POSES = [
  { manoD: [72, 160], manoI: [6, 160], rc: 0 },                                                    // 0 firmes
  { manoD: [104, 48], manoI: [6, 160], rc: -0.22 },                                                 // 1 L derecha arriba
  { manoD: [72, 160], manoI: [-26, 48], rc: 0.22 },                                                 // 2 L izquierda arriba
  { manoD: [104, 48], manoI: [-26, 48], rc: 0 },                                                    // 3 las dos arriba
  { manoD: [104, 124], manoI: [-26, 124], rc: 0, sy: 0.94, piernaI: [0, 0.12], piernaD: [0, -0.12] }, // 4 agachado
  { manoD: [104, 48], manoI: [-26, 124], rc: -0.18 },                                               // 5 una arriba, otra abajo
  { manoD: [104, 124], manoI: [-26, 48], rc: 0.18 },                                                // 6 al revés
  { manoD: [150, 86], manoI: [6, 160], rc: -0.26 },                                                 // 7 señala a la derecha
  { manoD: [72, 160], manoI: [-72, 86], rc: 0.26 },                                                 // 8 señala a la izquierda
  { manoD: [104, 48], manoI: [-26, 124], rc: -0.1, piernaD: [-18, -0.05], giro: 0.05 },             // 9 pierna arriba
  { manoD: [104, 124], manoI: [-26, 48], rc: 0.1, piernaI: [-18, 0.05], giro: -0.05 },              // 10 la otra pierna
  { manoD: [100, 112], manoI: [-22, 112], rc: 0.3 },                                                // 11 antebrazos al frente, cabeza ladeada
  { manoD: [100, 112], manoI: [-22, 112], rc: -0.3 },                                               // 12 y al otro lado
];
// coreografía: [pose, desplazamiento x]
const BAILE = [
  [1, 0], [0, 0], [2, 0], [0, 0], [3, 0], [4, 0], [3, 0], [4, 0],
  [7, 0], [1, 0], [3, 0], [2, 0], [8, 0], [11, -40], [12, -80], [11, -120],
  [9, -90], [10, -60], [9, -30], [10, 0], [5, 0], [6, 0], [3, 0], [4, 0],
];
const cache = cacheTexto();
const SIL = new Map(); // siluetas de neón por pose y color

/** Silueta de neón de una pose (anillo alrededor del cuerpo con brillo). */
function silueta(i, col) {
  const clave = i + col;
  if (SIL.has(clave)) return SIL.get(clave);
  const w = 420, h = 440, pose = Object.assign({ cara: "sonrisa", piernaI: [0, 0], piernaD: [0, 0] }, POSES[i]);
  const a = lienzoNuevo(w, h), ga = a.getContext("2d");
  pintarAvatar(ga, matAv(w / 2, h - 16, ESC, pose.giro || 0, 1, pose.sy || 1), pose, 0);
  const b = lienzoNuevo(w, h), gb = b.getContext("2d");
  for (let k = 0; k < 12; k++) { const an = (k / 12) * 6.283; gb.drawImage(a, Math.cos(an) * 4.5, Math.sin(an) * 4.5); }
  gb.globalCompositeOperation = "source-in"; gb.fillStyle = col; gb.fillRect(0, 0, w, h);
  gb.globalCompositeOperation = "destination-out"; gb.drawImage(a, 0, 0);
  const c = lienzoNuevo(w, h), gc = c.getContext("2d");
  gc.shadowColor = col; gc.shadowBlur = 16; gc.drawImage(b, 0, 0);
  gc.shadowBlur = 5; gc.drawImage(b, 0, 0);
  gc.shadowBlur = 0; gc.globalAlpha = 0.6; gc.globalCompositeOperation = "lighter"; gc.drawImage(b, 0, 0);
  if (listo("torso") && listo("cara_sonrisa")) SIL.set(clave, c);
  return c;
}
function sprTxt(clave, s, o, w, h) {
  if (cache.has(clave)) return cache.get(clave);
  const c = lienzoNuevo(w, h), g = c.getContext("2d");
  txt(g, s, w / 2, h * 0.68, o);
  if (o.glow) { const o2 = Object.assign({}, o); delete o2.glow; delete o2.borde; txt(g, s, w / 2, h * 0.68, o2); }
  cache.set(clave, c);
  return c;
}
const rotP = (p, c, a) => { const r = rot2([p[0] - c[0], p[1] - c[1]], a); return [c[0] + r[0], c[1] + r[1]]; };

class EscenaRobot extends Escena {
  constructor() {
    super(8.75);
    this.p = new Parts(260);
    this.ultimoPaso = -1;
  }
  paso(t) { return t < INICIO ? -1 : Math.min(BAILE.length - 1, Math.floor((t - INICIO) / PASO)); }
  /** Pose actual (con el chasquido del servo al cambiar). */
  estado() {
    const t = this.t, n = this.paso(t);
    let pose, dx = 0, idx = 0, prev = null;
    if (n < 0 || t >= FIN_BAILE) {
      idx = t < INICIO ? 0 : 3;
      pose = Object.assign({}, POSES[0]);
      if (t >= FIN_BAILE) {
        idx = BAILE[BAILE.length - 1][0];
        const ult = POSES[idx];
        // se le acaba la batería
        const k = eIn(tramo(t, FIN_BAILE + 0.15, FIN_BAILE + 0.6));
        pose = Object.assign({}, ult, { manoD: mezcla(ult.manoD, [74, 162], k), manoI: mezcla(ult.manoI, [4, 162], k), rc: lerp(ult.rc || 0, 0.36, eOut(tramo(t, FIN_BAILE + 0.1, FIN_BAILE + 0.4))), sy: lerp(ult.sy || 1, 0.95, k) });
        dx = BAILE[BAILE.length - 1][1];
      }
    } else {
      idx = BAILE[n][0]; dx = BAILE[n][1];
      const ant = n > 0 ? BAILE[n - 1] : [0, 0];
      prev = ant[0];
      const u = (t - INICIO - n * PASO) / 0.05;
      const A = POSES[ant[0]], B = POSES[idx], k = eOut(clamp(u, 0, 1));
      pose = {
        manoD: mezcla(A.manoD, B.manoD, k), manoI: mezcla(A.manoI, B.manoI, k), rc: lerp(A.rc || 0, B.rc || 0, k),
        sy: lerp(A.sy || 1, B.sy || 1, k), giro: lerp(A.giro || 0, B.giro || 0, k),
        piernaI: B.piernaI || [0, 0], piernaD: B.piernaD || [0, 0],
      };
      dx = lerp(ant[1], dx, k);
      if (u > 1 && u < 2.2) dx += Math.sin(u * 20) * 1.2; // vibración del servo al frenar
    }
    pose.cara = t < 1.0 ? "dormido" : t >= FIN_BAILE + 0.15 ? "dormido" : n >= 0 && n % 4 === 3 ? "guino" : "sonrisa";
    pose.piernaI = pose.piernaI || [0, 0]; pose.piernaD = pose.piernaD || [0, 0];
    const m = matAv(X + dx, PIES, ESC, pose.giro || 0, 1, pose.sy || 1);
    return { pose, m, idx, prev, dx, n };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    const e = this.estado();
    if (e.n !== this.ultimoPaso && t < FIN_BAILE) {
      this.ultimoPaso = e.n;
      if (e.n >= 0) {
        temblar(3, 0.08);
        const q = aPant(e.m, e.pose.manoD), r = aPant(e.m, e.pose.manoI);
        for (const s of [q, r]) for (let i = 0; i < 5; i++) p.nueva(P.ELECTRICA, s[0], s[1], azar(-160, 160), azar(-160, 160), azar(0.15, 0.3), azar(8, 14));
      }
    }
    this.una("ojos", t > 1.0, () => {
      temblar(8, 0.25);
      for (const o of RIG.ojos) { const q = aPant(e.m, o); p.nueva(P.DESTELLO, q[0], q[1], 0, 0, 0.35, 60); }
    });
    this.una("pila", t > FIN_BAILE + 0.15, () => {
      const q = aPant(e.m, [39, 20]);
      for (let i = 0; i < 12; i++) p.nueva(P.ELECTRICA, q[0] + azar(-30, 30), q[1] + azar(-20, 20), azar(-80, 80), azar(-120, -20), azar(0.2, 0.5), azar(8, 14));
      for (let i = 0; i < 6; i++) p.nueva(P.HUMO, q[0] + azar(-20, 20), q[1] - 10, azar(-20, 20), azar(-80, -40), azar(0.8, 1.2), azar(20, 34));
    });
    p.actualizar(dt);
  }
  suelo(g, t, a) {
    if (a <= 0) return;
    const hz = 400, vx = W / 2;
    g.save(); g.globalCompositeOperation = "lighter";
    // horizonte
    g.globalAlpha = a * 0.5; g.drawImage(BLOB.rojo, -100, hz - 70, W + 200, 140);
    const dib = (lw, al) => {
      g.lineWidth = lw; g.strokeStyle = `rgba(255,61,132,${al * a})`;
      g.beginPath();
      for (let i = -9; i <= 9; i++) { const xb = vx + i * 130; g.moveTo(vx + i * 14, hz); g.lineTo(xb + (xb - vx) * 0.6, H + 30); }
      for (let j = 0; j < 9; j++) { const u = ((j + (t * 1.2) % 1) / 9), y = hz + Math.pow(u, 2.2) * (H + 40 - hz); g.moveTo(-40, y); g.lineTo(W + 40, y); }
      g.stroke();
    };
    g.globalAlpha = 1; dib(6, 0.12); dib(1.6, 0.6);
    g.restore();
  }
  dibujarEscena(g, t, e) {
    // el suelo se va dibujando desde el horizonte
    const aSuelo = tramo(t, 0.15, 0.6);
    const suelo = () => {
      g.save();
      if (t < 0.6) { g.beginPath(); g.rect(-60, 380, W + 120, (H - 380 + 60) * eOut(aSuelo)); g.clip(); }
      this.suelo(g, t, Math.min(1, aSuelo * 2));
      g.restore();
    };
    // el avatar: a oscuras al principio (solo se ve su silueta de neón)
    const luzAv = tramo(t, 0.95, 1.15);
    if (luzAv < 1) {
      pintarAvatar(g, e.m, e.pose, t);
      g.save(); g.globalAlpha = 0.92 * (1 - luzAv); g.fillStyle = "#000"; g.fillRect(-60, -60, W + 120, H + 120); g.restore();
      suelo();
    } else {
      suelo();
      // eco rosa de la pose anterior
      if (e.prev !== null && e.n >= 0 && t < FIN_BAILE) {
        const u = (t - INICIO - e.n * PASO) / PASO, ant = BAILE[Math.max(0, e.n - 1)];
        const S = silueta(ant[0], ROSA);
        g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.55 * (1 - u);
        g.drawImage(S, X + ant[1] - S.width / 2 - 14 * u, PIES + 16 - S.height); g.restore();
      }
      pintarAvatar(g, e.m, e.pose, t);
    }
    // silueta de neón: se dibuja con un barrido en cada pose
    const S = silueta(e.idx, CIAN), cx = X + e.dx, cy = PIES - 180;
    let barrido = 1;
    if (t < 1.0) barrido = tramo(t, 0.3, 0.9);
    else if (e.n >= 0 && t < FIN_BAILE) barrido = tramo(t - INICIO - e.n * PASO, 0, 0.1);
    let aSil = t < FIN_BAILE ? 1 : Math.max(0, 1 - (t - FIN_BAILE - 0.15) * 2) * (Math.sin(t * 60) > -0.2 ? 1 : 0.2);
    if (aSil > 0 && barrido > 0) {
      g.save();
      if (barrido < 1) { g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, 600, -Math.PI / 2, -Math.PI / 2 + barrido * 6.283); g.closePath(); g.clip(); }
      g.globalCompositeOperation = "lighter"; g.globalAlpha = aSil;
      g.drawImage(S, cx - S.width / 2, PIES + 16 - S.height);
      g.restore();
    }
    // ojos encendidos
    if (t > 1.0 && t < FIN_BAILE + 0.15) {
      g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.85 + 0.15 * Math.sin(t * 20);
      for (const o of RIG.ojos) {
        const q = aPant(e.m, rotP(o, RIG.cuello, e.pose.rc));
        g.drawImage(BLOB2.cian, q[0] - 16, q[1] - 12, 32, 24);
        g.fillStyle = "#e9ffff"; g.beginPath(); g.ellipse(q[0], q[1], 5, 3.5, e.pose.rc, 0, 6.283); g.fill();
      }
      g.restore();
    }
    this.p.dibujar(g);
    // MODO ROBOT
    if (t > 1.05 && t < FIN_BAILE + 0.3) {
      const R = sprTxt("modo", "MODO ROBOT", { tam: 92, peso: 900, fam: FD, color: "#d8fdff", glow: CIAN, glowTam: 26, esp: 10 }, 760, 140);
      const k = tramo(t, 1.05, 1.4), a = (t < FIN_BAILE ? 1 : 1 - tramo(t, FIN_BAILE, FIN_BAILE + 0.3)) * (Math.sin(t * 47) > 0.92 ? 0.5 : 1);
      g.save(); g.globalAlpha = a;
      if (k < 1) {
        // aparece con interferencias: tiras desplazadas
        for (let y = 0; y < R.height; y += 10) { const off = (1 - k) * azar(-60, 60); g.drawImage(R, 0, y, R.width, 10, W / 2 - R.width / 2 + off, 30 + y, R.width, 10); }
      } else g.drawImage(R, W / 2 - R.width / 2, 30);
      g.restore();
    }
    // BIP / BOP en cada paso
    if (e.n >= 0 && t < FIN_BAILE) {
      const u = (t - INICIO - e.n * PASO) / PASO, bip = e.n % 2 === 0;
      const R = bip ? sprTxt("bip", "BIP", { tam: 64, peso: 400, fam: FC, color: "#ffffff", borde: CIAN, bordeAncho: 9, esp: 3 }, 200, 100)
        : sprTxt("bop", "BOP", { tam: 64, peso: 400, fam: FC, color: "#ffffff", borde: ROSA, bordeAncho: 9, esp: 3 }, 200, 100);
      const q = aPant(e.m, [39, 10]), lado = (e.n >> 1) % 2 ? 1 : -1;
      const s = eBack(clamp(u * 3, 0, 1)) * (1 - 0.2 * u);
      g.save(); g.globalAlpha = 1 - tramo(u, 0.7, 1); g.translate(q[0] + lado * 150, q[1] + 10 - 20 * u); g.rotate(lado * 0.12); g.scale(s, s);
      g.drawImage(R, -R.width / 2, -R.height / 2); g.restore();
    }
  }
  dibujar(g) {
    const t = this.t, e = this.estado();
    fondo(g, "#000");
    // tele vieja que se apaga: la imagen se aplasta en una raya y luego en un punto
    const kV = eIn(tramo(t, APAGA, APAGA + 0.22)), kH = eIn(tramo(t, APAGA + 0.2, APAGA + 0.38));
    if (t < APAGA + 0.22) {
      g.save();
      if (kV > 0) { g.translate(W / 2, H / 2); g.scale(1 + 0.1 * kV, Math.max(0.004, 1 - kV)); g.translate(-W / 2, -H / 2); }
      this.dibujarEscena(g, t, e);
      if (kV > 0) { g.fillStyle = `rgba(255,255,255,${kV * 0.8})`; g.fillRect(-60, -60, W + 120, H + 120); }
      g.restore();
    }
    if (t >= APAGA + 0.18 && t < APAGA + 0.55) {
      const w = (1 - kH) * W * 0.9 + 8, a = 1 - tramo(t, APAGA + 0.38, APAGA + 0.55);
      g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = a;
      g.drawImage(BLOB.blanco, W / 2 - w / 2, H / 2 - 10, w, 20);
      g.fillStyle = "#fff"; g.fillRect(W / 2 - w / 2 + 4, H / 2 - 1.5, Math.max(2, w - 8), 3);
      g.restore();
    }
    if (t < 0.3) { g.fillStyle = "#000"; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00013", nombre: "Baile robot", crear: () => new EscenaRobot() });
})();
