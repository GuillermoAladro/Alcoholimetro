"use strict";
/*
 * 00003 · TORRE DE CHUPITOS
 *
 * Animación del banco. Empieza y acaba en negro.
 * Detrás de la barra monta a toda prisa una pirámide de chupitos de 4 pisos (los de abajo los desliza por la barra).
 * El último lo pone arriba conteniendo la respiración… lo consigue… le pica la nariz (¡A…! ¡AA…!) y ¡ATCHÍS!: la torre
 * se viene abajo a cámara lenta y los vasitos se rompen. Se queda con cara de apuro y se apaga la luz.
 */
(() => {
const X = 360, ESC = 1.6, BARRA = 430, BX0 = 150, BX1 = 790;
const EV = 1.75, CW = 16, CH = 20;          // los chupitos: 28 × 35 px
const PASO = 30, PX = 480;                  // separación y centro de la pirámide
const COLORES = [["#ffe27a", "#c26400"], ["#9dff9a", "#139a3a"], ["#ff9cc0", "#c2185b"]];
const T_ULTIMO = 3.15, T_PUESTO = 4.45, T_ATCHIS = 5.95;

function vasito(g, x, y, ang, esc, col, nivel = 1) {
  g.save(); g.translate(x, y); g.rotate(ang); g.scale(esc, esc);
  const w = CW, h = CH;
  const forma = () => { g.beginPath(); g.moveTo(-w / 2, -h / 2); g.lineTo(w / 2, -h / 2); g.lineTo(w / 2 - 1.6, h / 2); g.lineTo(-w / 2 + 1.6, h / 2); g.closePath(); };
  forma(); g.fillStyle = "rgba(210,235,255,.2)"; g.fill();
  if (nivel > 0.02) {
    g.save(); forma(); g.clip();
    const alto = (h - 6.5) * nivel;
    const gr = g.createLinearGradient(0, -h / 2, 0, h / 2);
    gr.addColorStop(0, col[0]); gr.addColorStop(1, col[1]);
    g.fillStyle = gr; g.fillRect(-w, h / 2 - 4.5 - alto, w * 2, alto);
    g.restore();
  }
  g.fillStyle = "rgba(225,240,255,.55)"; rectR(g, -w / 2 + 1.8, h / 2 - 4.5, w - 3.6, 4.2, 1.2); g.fill();
  forma(); g.strokeStyle = "rgba(240,248,255,.95)"; g.lineWidth = 1.2; g.stroke();
  g.fillStyle = "rgba(255,255,255,.55)"; g.fillRect(-w / 2 + 2.2, -h / 2 + 1.5, 1.4, h - 7);
  g.restore();
}

class EscenaTorre extends Escena {
  constructor() {
    super(10.6);
    this.p = new Parts(260);
    this.trozos = [];
    this.tLento = 0; // tiempo "de física" (va más despacio en la cámara lenta)
    // la pirámide: 4 + 3 + 2 + 1, de abajo arriba
    this.vasos = [];
    let n = 0;
    for (let piso = 0; piso < 4; piso++) for (let i = 0; i < 4 - piso; i++) {
      const x = PX + (i - (3 - piso) / 2) * PASO, y = BARRA - CH * EV / 2 - piso * CH * EV;
      this.vasos.push({ x, y, x0: x, y0: y, piso, col: COLORES[n % 3], r: 0, vx: 0, vy: 0, vr: 0, roto: false, n: n++ });
    }
    // cuándo se coloca cada uno
    this.cuando = [0.55, 0.8, 1.05, 1.3, 1.65, 1.92, 2.19, 2.5, 2.77, T_PUESTO];
  }
  luz() { const t = this.t; return (t < 0.6 ? [0, 1, 0, 0, 1, 0.5][Math.min(5, Math.floor(t / 0.1))] : 1) * (1 - tramo(t, 9.5, 10.3)); }
  aAvatar(x, y) { return [39 + (x - X) / ESC, 232 - (PIES - y) / ESC]; }
  /** Mano derecha hacia cada vaso que coloca. */
  manoColocando(t) {
    const C = this.cuando;
    // piso de abajo: los suelta junto a él y salen deslizando
    if (t < 1.5) {
      const i = clamp(Math.floor((t - 0.4) / 0.25), 0, 3), u = ((t - 0.4) / 0.25) % 1;
      const cerca = this.aAvatar(PX - 1.5 * PASO, BARRA - 22), abajo = [72, 150];
      return u < 0.5 ? mezcla(abajo, cerca, eInOut(u * 2)) : mezcla(cerca, abajo, eInOut((u - 0.5) * 2));
    }
    for (let i = 4; i < 9; i++) {
      const t0 = C[i] - 0.27;
      if (t < C[i] + 0.06) {
        const dest = this.aAvatar(this.vasos[i].x0, this.vasos[i].y0 + 12 * ESC), u = tramo(t, t0, C[i]);
        return mezcla([72, 150], dest, eInOut(u));
      }
    }
    return [72, 150];
  }
  estado() {
    const t = this.t;
    const pose = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0] };
    let manoD = [72, 160], manoI = [9, 160], sx = 1, sy = 1;
    if (t > 0.35 && t < 2.9) { manoD = this.manoColocando(t); pose.cara = "guino"; pose.rc = 0.04 * Math.sin(t * 9); }
    if (t >= 2.9 && t < T_ULTIMO) manoD = mezcla([72, 150], [70, 156], tramo(t, 2.9, T_ULTIMO));
    // el último: despacio, sin respirar
    if (t >= T_ULTIMO && t < T_PUESTO + 0.3) {
      const dest = this.aAvatar(this.vasos[9].x0, this.vasos[9].y0 + 12 * ESC);
      const k = eInOut(tramo(t, T_ULTIMO, T_PUESTO));
      const tiembla = Math.sin(tramo(t, T_ULTIMO, T_PUESTO) * Math.PI) * 1.2;
      manoD = mezcla([70, 156], dest, k);
      manoD = [manoD[0] + tiembla * Math.sin(t * 47), manoD[1] + tiembla * Math.cos(t * 41)];
      pose.cara = "sorpresa"; pose.rc = 0.08 * k;
      sx = 1 + 0.06 * eInOut(tramo(t, T_ULTIMO, T_ULTIMO + 0.4)); // aguanta el aire
      pose.manoI = [-2, 140];
      if (t > T_PUESTO) manoD = mezcla(dest, [70, 156], eInOut(tramo(t, T_PUESTO + 0.05, T_PUESTO + 0.3)));
    }
    // ¡lo consigue!
    if (t >= T_PUESTO + 0.05 && t < 5.15) { pose.cara = "risa"; sx = 1 + 0.06 * (1 - eOut(tramo(t, T_PUESTO, T_PUESTO + 0.3))); }
    // le pica la nariz
    if (t >= 5.15 && t < T_ATCHIS) {
      const k = tramo(t, 5.15, T_ATCHIS);
      pose.cara = k < 0.25 ? "sorpresa" : "dormido";
      pose.rc = -0.22 * eIn(k) + 0.02 * Math.sin(t * 30) * k;
      sy = 1 + 0.04 * k; sx = 1 + 0.03 * k;
      manoD = mezcla([70, 156], [62, 118], eInOut(tramo(t, 5.15, 5.45)));
      manoI = [6, 150];
    }
    // ¡ATCHÍS!
    if (t >= T_ATCHIS) {
      const k = tramo(t, T_ATCHIS, T_ATCHIS + 0.12);
      pose.cara = t < 6.9 ? "dormido" : t < 8.6 ? "sorpresa" : "borracho";
      pose.rc = lerp(-0.22, 0.13, eOut(k)) * (1 - eInOut(tramo(t, 7.2, 7.6))) + (t > 8.6 ? -0.08 : 0);
      sy = lerp(1.04, 0.92, eOut(k)) + 0.08 * eInOut(tramo(t, 7.2, 7.6));
      manoD = mezcla([62, 118], [96, 104], eOut(k));
      if (t > 7.6) manoD = mezcla([96, 104], [58, 70], eInOut(tramo(t, 8.4, 8.8))); // se rasca la cabeza
      manoI = [6, 150];
    }
    pose.manoD = manoD; if (!pose.manoI) pose.manoI = manoI;
    // vaso en la mano mientras lo coloca
    const enMano = this.vasoEnMano(t);
    if (enMano) pose.objD2 = (g, m) => vasito(g, m[0] + 1, m[1] - 12, 0, EV / ESC, enMano.col);
    const m = matAv(X, PIES, ESC, 0, sx, sy);
    return { pose, m };
  }
  vasoEnMano(t) {
    for (let i = 4; i < 10; i++) {
      const t0 = i < 9 ? this.cuando[i] - 0.27 : T_ULTIMO;
      if (t >= t0 + (i < 9 ? 0.04 : 0) && t < this.cuando[i]) return this.vasos[i];
    }
    if (t > 0.4 && t < 1.4) { const u = ((t - 0.4) / 0.25) % 1; if (u < 0.5) return this.vasos[3 - clamp(Math.floor((t - 0.4) / 0.25), 0, 3)]; }
    return null;
  }
  /** 1 = velocidad normal; en la cámara lenta, 0,22. */
  lentitud() { const t = this.t; return t < T_ATCHIS + 0.05 ? 1 : lerp(0.22, 1, tramo(t, 7.3, 7.7)); }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    const lento = this.lentitud(), dl = dt * lento;
    this.tLento += dl;
    const e = this.estado();
    // los del piso de abajo se deslizan hasta su sitio
    for (let i = 0; i < 4; i++) {
      const V = this.vasos[3 - i], t0 = 0.4 + i * 0.25 + 0.125;
      if (t < T_ATCHIS) { const u = eOut(tramo(t, t0, t0 + 0.28)); V.x = lerp(PX - 1.5 * PASO, V.x0, u); }
      this.una("desliza" + i, t > t0, () => { if (i < 3) for (let k = 0; k < 4; k++) p.nueva(P.POLVO, PX - 1.5 * PASO, BARRA - 3, azar(80, 260), azar(-30, 0), 0.3, 14); });
    }
    for (let i = 4; i < 10; i++) this.una("pon" + i, t > this.cuando[i], () => {
      const V = this.vasos[i];
      p.nueva(P.DESTELLO, V.x0, V.y0 - 10, 0, 0, 0.25, i === 9 ? 80 : 36);
      if (i === 9) { temblar(3, 0.15); for (let k = 0; k < 14; k++) { const a = azar(-Math.PI, 0), v = azar(100, 260); p.nueva(P.CHISPA, V.x0, V.y0 - 16, Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.6), azar(6, 10)); } }
    });
    // gota de sudor al poner el último
    this.una("sudor", t > 3.6, () => { this.sudor = t; });
    // ¡ATCHÍS!
    this.una("atchis", t > T_ATCHIS, () => {
      temblar(30, 0.6); this.tLentoA = this.tLento;
      const q = aPant(e.m, boca(0.2));
      for (let i = 0; i < 40; i++) p.nueva(P.ESPUMA, q[0] + 10, q[1], azar(150, 700), azar(-220, 160), azar(0.4, 0.9), azar(2, 5));
      for (let i = 0; i < 14; i++) p.nueva(P.VAPOR, q[0] + 20, q[1], azar(200, 600), azar(-150, 100), azar(0.4, 0.8), azar(24, 44));
      for (const V of this.vasos) {
        const alto = 3 - V.piso;
        V.vx = azar(60, 260) + (V.x - PX) * 2.2 + 90 * (3 - alto); V.vy = -azar(180, 420) - V.piso * 80; V.vr = azar(-5, 5) + 2;
      }
    });
    if (t > T_ATCHIS) {
      for (const V of this.vasos) {
        if (V.roto) continue;
        V.vy += 1400 * dl; V.x += V.vx * dl; V.y += V.vy * dl; V.r += V.vr * dl;
        if (Math.random() < 3 * dl) p.nueva(P.GOTA, V.x, V.y, V.vx * 0.5, V.vy * 0.5 - 50, 0.6, azar(2.5, 4));
        const suelo = V.x > BX0 && V.x < BX1 ? BARRA : PIES;
        if (V.y > suelo - 10) {
          V.roto = true;
          temblar(lento > 0.9 ? 7 : 3, 0.15);
          for (let k = 0; k < 9; k++) this.trozos.push({ x: V.x + azar(-8, 8), y: suelo - 8, vx: azar(-260, 260), vy: azar(-420, -120), r: azar(0, 6), vr: azar(-20, 20), s: azar(4, 9), suelo });
          for (let k = 0; k < 6; k++) p.nueva(P.GOTA, V.x, suelo - 6, azar(-180, 180), azar(-260, -60), 0.6, azar(2.5, 4.5));
          p.nueva(P.DESTELLO, V.x, suelo - 8, 0, 0, 0.25, 40);
        }
      }
    }
    for (const T of this.trozos) {
      if (T.quieto) continue;
      T.vy += 1500 * dl; T.x += T.vx * dl; T.y += T.vy * dl; T.r += T.vr * dl;
      if (T.y > T.suelo - 2) { T.y = T.suelo - 2; T.vy *= -0.3; T.vx *= 0.5; T.vr *= 0.4; if (Math.abs(T.vy) < 40) T.quieto = true; }
    }
    p.actualizar(dl);
  }
  dibujarBarra(g) {
    // frente de la barra
    const gr = g.createLinearGradient(0, BARRA, 0, PIES);
    gr.addColorStop(0, "#4b2e18"); gr.addColorStop(1, "#1e1209");
    g.fillStyle = gr; g.fillRect(BX0, BARRA + 8, BX1 - BX0, PIES - BARRA - 8);
    g.strokeStyle = "rgba(0,0,0,.4)"; g.lineWidth = 2;
    for (let x = BX0 + 80; x < BX1; x += 80) { g.beginPath(); g.moveTo(x, BARRA + 14); g.lineTo(x, PIES - 18); g.stroke(); }
    // barra de latón para los pies
    g.fillStyle = "#c99a3a"; g.fillRect(BX0, PIES - 34, BX1 - BX0, 6);
    g.fillStyle = "rgba(255,240,200,.5)"; g.fillRect(BX0, PIES - 34, BX1 - BX0, 1.5);
    // tablero
    const gt = g.createLinearGradient(0, BARRA - 4, 0, BARRA + 12);
    gt.addColorStop(0, "#d9b88a"); gt.addColorStop(1, "#7a5232");
    g.fillStyle = gt; g.fillRect(BX0 - 14, BARRA - 2, BX1 - BX0 + 28, 14);
    g.fillStyle = "rgba(255,255,255,.18)"; g.fillRect(BX0 - 14, BARRA - 2, BX1 - BX0 + 28, 2);
  }
  dibujar(g) {
    const t = this.t, e = this.estado(), luz = this.luz();
    fondo(g, "#000");
    // cámara un poco más cerca de la barra
    const Z = 1.3, CX = 470, CY = 360;
    g.save(); g.translate(W / 2, H / 2); g.scale(Z, Z); g.translate(-CX, -CY);
    foco(g, 450, 450, BARRA, 300, luz);
    // estantería del fondo con botellas (siluetas)
    g.save(); g.globalAlpha = 0.35 * luz;
    g.fillStyle = "#2a1c12"; g.fillRect(560, 170, 380, 8); g.fillRect(560, 270, 380, 8);
    for (let i = 0; i < 9; i++) for (const yb of [170, 270]) {
      const x = 585 + i * 40 + (yb === 270 ? 18 : 0), h = 50 + ((i * 7) % 3) * 10;
      g.fillStyle = ["#2f6b3a", "#7a3b16", "#3b4d7a"][i % 3];
      rectR(g, x - 9, yb - h, 18, h, 4); g.fill(); g.fillRect(x - 4, yb - h - 14, 8, 16);
    }
    g.restore();
    pintarAvatar(g, e.m, e.pose, t);
    this.dibujarBarra(g);
    // los vasitos de la pirámide
    for (const V of this.vasos) {
      if (V.roto) continue;
      const puesto = V.n < 4 ? t > 0.4 + (3 - V.n) * 0.25 + 0.125 : t > this.cuando[V.n];
      if (!puesto) continue;
      const nivel = t > T_ATCHIS ? Math.max(0.15, 1 - (t - T_ATCHIS) * 0.5) : 1;
      vasito(g, V.x, V.y, V.r, EV, V.col, nivel);
    }
    // cristales rotos
    g.save();
    for (const T of this.trozos) {
      g.save(); g.translate(T.x, T.y); g.rotate(T.r);
      g.fillStyle = "rgba(220,240,255,.75)"; g.strokeStyle = "rgba(255,255,255,.9)"; g.lineWidth = 1;
      g.beginPath(); g.moveTo(-T.s, T.s * 0.4); g.lineTo(T.s * 0.2, -T.s * 0.7); g.lineTo(T.s, T.s * 0.5); g.closePath(); g.fill(); g.stroke();
      g.restore();
    }
    g.restore();
    this.p.dibujar(g);
    // gota de sudor
    if (this.sudor && t - this.sudor < 0.9) {
      const s = t - this.sudor, q = aPant(e.m, [16, 30]);
      g.save(); g.globalAlpha = 1 - tramo(s, 0.6, 0.9);
      g.fillStyle = "#9fe3ff"; g.beginPath(); g.moveTo(q[0], q[1] + 40 * s - 10); g.quadraticCurveTo(q[0] + 8, q[1] + 40 * s + 4, q[0], q[1] + 40 * s + 8); g.quadraticCurveTo(q[0] - 8, q[1] + 40 * s + 4, q[0], q[1] + 40 * s - 10); g.fill();
      g.restore();
    }
    g.restore();
    // ¡A…! ¡AA…! ¡AAA…!
    const avisos = [[5.2, "¡A…!", 44, 205, 300], [5.5, "¡AA…!", 58, 175, 228], [5.75, "¡AAA…!", 72, 200, 150]];
    for (const [t0, s, tam, x, y] of avisos) {
      if (t < t0 || t > T_ATCHIS + 0.05) continue;
      const k = tramo(t, t0, t0 + 0.12);
      g.save(); g.translate(x + azar(-1.5, 1.5), y); g.rotate(-0.12); g.scale(eBack(k), eBack(k));
      txt(g, s, 0, 0, { tam, peso: 400, fam: FC, color: "#fffdf5", borde: "#1b1b1b", bordeAncho: 7, esp: 2 });
      g.restore();
    }
    // ¡ATCHÍS! (también a cámara lenta)
    if (t > T_ATCHIS && t < 8.9) {
      const s = this.tLentoA != null ? Math.min(1.1, this.tLento - this.tLentoA) : 0, k = tramo(s, 0, 0.06);
      const a = 1 - tramo(t, 8.4, 8.9);
      g.save(); g.translate(680 + s * 20, 140 - s * 20); g.rotate(-0.08 + s * 0.03); g.scale(lerp(0.3, 1, eBack(k)) * (1 + s * 0.05), lerp(0.3, 1, eBack(k)) * (1 + s * 0.05));
      txt(g, "¡ATCHÍS!", 0, 0, { tam: 138, peso: 400, fam: FC, color: "#e9fbff", borde: "#0a5d80", bordeAncho: 12, alfa: a, esp: 5, max: 540 });
      g.restore();
    }
    const negro = Math.max(t < 0.6 ? 0.97 * (1 - luz) : 0, tramo(t, 9.9, 10.55));
    if (negro > 0) { g.fillStyle = `rgba(0,0,0,${negro})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00003", nombre: "Torre de chupitos", crear: () => new EscenaTorre() });
})();
