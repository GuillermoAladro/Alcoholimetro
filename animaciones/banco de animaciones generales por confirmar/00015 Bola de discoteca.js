"use strict";
/*
 * 00015 · BOLA DE DISCOTECA
 *
 * Animación del banco. Empieza y acaba en negro.
 * Un foco ilumina una bola de espejos que baja del techo; empieza a girar y la sala se llena de puntitos de luz que
 * dan vueltas: ¡A BAILAR! Baila señalando arriba y abajo. La cadena cruje, salta un eslabón y la bola le cae en la
 * cabeza: ¡TONK! Estrellitas, se marea… y sigue bailando con la bola puesta de sombrero.
 */
(() => {
const X = 500, ESC = 1.45, R = 50;
const BAJA = [0.35, 1.45], GIRA = 1.45, BAILE = 1.9, CRUJE = 5.7, SUELTA = 6.45, OFF = 9.2;
const cache = cacheTexto();
let SPR15 = null;

function bolaBase() {
  const s = R * 2 + 8, c = lienzoNuevo(s, s), g = c.getContext("2d"), m = s / 2;
  const gr = g.createRadialGradient(m - R * 0.35, m - R * 0.4, R * 0.1, m, m, R);
  gr.addColorStop(0, "#9aa3b5"); gr.addColorStop(0.5, "#4a5263"); gr.addColorStop(1, "#151820");
  g.fillStyle = gr; g.beginPath(); g.arc(m, m, R, 0, 6.283); g.fill();
  return c;
}
function sprites() {
  if (!SPR15) {
    // puntitos de luz: direcciones fijas en la "esfera" de la sala
    const r = semilla(15), puntos = [];
    const cols = ["255,255,255", "255,255,255", "255,255,255", "255,140,200", "140,240,255", "255,226,140"];
    for (let i = 0; i < 90; i++) puntos.push({ lon: r() * 6.283, lat: (r() * 2 - 1) * 1.1, c: cols[(r() * cols.length) | 0], s: 0.6 + r() * 0.8 });
    SPR15 = { bola: bolaBase(), puntos };
  }
  return SPR15;
}
function rotulo(clave, s, tam, o, w, h) {
  if (cache.has(clave)) return cache.get(clave);
  const c = lienzoNuevo(w, h), g = c.getContext("2d");
  txt(g, s, w / 2, h * 0.72, Object.assign({ tam }, o));
  if (o.glow) txt(g, s, w / 2, h * 0.72, Object.assign({ tam }, o, { glow: null, borde: null }));
  cache.set(clave, c);
  return c;
}

class EscenaBola extends Escena {
  constructor() {
    super(9.9);
    this.p = new Parts(260);
    this.rot = 0; this.bola = { x: 512, y: -80, vy: 0, enCabeza: false, golpe: -1 };
    this.eslabon = null;
  }
  /** Baile: señala arriba (a la bola) y abajo, de lado a lado. */
  estado() {
    const t = this.t;
    const pose = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0] };
    let manoD = [70, 158], manoI = [9, 160], dx = 0, sx = 1, sy = 1, giro = 0;
    const golpe = this.bola.golpe;
    const mareo = golpe > 0 ? tramo(t, golpe, golpe + 0.15) * (1 - tramo(t, golpe + 1.25, golpe + 1.45)) : 0;
    if (t > BAILE) {
      const u = (t - BAILE) / 0.45, n = Math.floor(u), f = u - n;
      const k = eOut(Math.min(1, f * 3.5));
      const arriba = n % 2 === 0;
      const ARR = [108, -10], ABA = [150, 186];
      manoD = n === 0 ? mezcla([70, 158], ARR, k) : mezcla(arriba ? ABA : ARR, arriba ? ARR : ABA, k);
      manoI = [4, 138];                // mano en la cadera
      pose.rc = arriba ? -0.14 * k : 0.22 * k;
      dx = 22 * Math.sin(((t - BAILE) / 0.9) * Math.PI);
      giro = (arriba ? 0.05 : -0.09) * k;
      pose.piernaD = arriba ? [-6 * k, -0.12 * k] : [0, 0];
      pose.piernaI = arriba ? [0, 0] : [-6 * k, 0.12 * k];
      pose.cara = Math.floor(u / 2) % 2 ? "risa" : "guino";
    }
    if (golpe > 0 && t > golpe) {
      // ¡tonk!: se aplasta, se marea y vuelve a bailar
      const kA = Math.exp(-(t - golpe) * 7);
      sy *= 1 - 0.13 * kA * Math.cos((t - golpe) * 20); sx *= 1 + 0.06 * kA;
      if (mareo > 0) {
        pose.cara = "borracho"; pose.rc = 0.18 * Math.sin((t - golpe) * 6);
        manoD = mezcla(manoD, [74, 160], mareo); manoI = mezcla(manoI, [6, 160], mareo);
        giro = lerp(giro, 0.06 * Math.sin((t - golpe) * 5), mareo); dx *= 1 - mareo;
        pose.piernaI = [0, 0]; pose.piernaD = [0, 0];
      }
    }
    if (t > CRUJE && t < SUELTA + 0.2 && golpe < 0) pose.cara = "risa";
    pose.manoD = manoD; pose.manoI = manoI;
    const m = matAv(X + dx, PIES, ESC, giro, sx, sy);
    return { pose, m, dx };
  }
  /** Dónde se apoya la bola sobre la cabeza. */
  sobreCabeza(e) { const q = aPant(e.m, [39 + e.pose.rc * 30, -4]); return [q[0], q[1] - R * 0.86]; }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p, B = this.bola;
    const e = this.estado();
    if (t > GIRA) this.rot += dt * (t < OFF ? 0.9 : 0.4);
    // la bola baja, cuelga, cruje y cae
    if (t < SUELTA) {
      const k = eOut(tramo(t, BAJA[0], BAJA[1]));
      const vaiven = t > CRUJE ? Math.sin((t - CRUJE) * 14) * 7 * tramo(t, CRUJE, SUELTA) : Math.sin(t * 3) * 2 * (1 - tramo(t, 1.4, 2.5));
      B.x = 512 + vaiven; B.y = lerp(-80, 104, k);
    } else if (!B.enCabeza) {
      B.vy += 2400 * dt; B.y += B.vy * dt;
      const c = this.sobreCabeza(e);
      B.x = lerp(B.x, c[0], Math.min(1, dt * 8));
      if (B.y >= c[1]) {
        if (B.golpe < 0) {
          B.golpe = t; B.vy = -320; B.y = c[1]; temblar(20, 0.45);
          for (let i = 0; i < 18; i++) { const a = azar(-Math.PI, 0), v = azar(200, 500); p.nueva(P.CHISPA, c[0], c[1] + R * 0.8, Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.6), azar(6, 12)); }
          p.nueva(P.DESTELLO, c[0], c[1] + R * 0.6, 0, 0, 0.3, 140);
        } else if (B.vy > 0) { B.enCabeza = true; temblar(5, 0.15); }
      }
    }
    if (B.enCabeza) { const c = this.sobreCabeza(e); B.x = c[0]; B.y = c[1]; }
    // el eslabón que salta
    this.una("cruje", t > SUELTA - 0.55, () => { for (let i = 0; i < 8; i++) p.nueva(P.CHISPA, B.x, B.y - R - 4, azar(-200, 200), azar(-200, 0), azar(0.2, 0.4), azar(5, 8)); temblar(3, 0.1); });
    this.una("suelta", t > SUELTA, () => {
      this.eslabon = { x: B.x, y: B.y - R - 6, vx: 160, vy: -280, r: 0 };
      for (let i = 0; i < 12; i++) p.nueva(P.CHISPA, B.x, B.y - R - 6, azar(-260, 260), azar(-260, 60), azar(0.25, 0.5), azar(6, 10));
    });
    if (this.eslabon) { const L = this.eslabon; L.vy += 1500 * dt; L.x += L.vx * dt; L.y += L.vy * dt; L.r += 12 * dt; }
    p.actualizar(dt);
  }
  luz(t) {
    if (t < 0.3) return 0;
    if (t < 0.6) return [1, 0.2, 1, 1][Math.min(3, Math.floor((t - 0.3) / 0.08))];
    return 1 - tramo(t, OFF, OFF + 0.55);
  }
  puntos(g, t, a) {
    if (a <= 0) return;
    const S = sprites(), B = this.bola;
    g.save(); g.globalCompositeOperation = "lighter";
    // rayos tenues hacia algunos puntos
    g.lineWidth = 1.2;
    for (let i = 0; i < S.puntos.length; i++) {
      const q = S.puntos[i], an = q.lon + this.rot, fr = Math.cos(an);
      if (fr <= 0.05) continue;
      const x = B.x + Math.sin(an) * 720 * Math.cos(q.lat * 0.6), y = B.y + 170 + Math.sin(q.lat) * 380;
      const s = (8 + 10 * fr) * q.s;
      g.globalAlpha = a * Math.min(1, fr * 1.6) * 0.9;
      g.drawImage(BLOB.blanco, x - s, y - s * 0.7, s * 2, s * 1.4);
      g.fillStyle = `rgba(${q.c},${0.9 * a})`; g.beginPath(); g.ellipse(x, y, s * 0.28, s * 0.2, 0, 0, 6.283); g.fill();
      if (i % 7 === 0) { g.globalAlpha = a * 0.08 * fr; g.strokeStyle = `rgb(${q.c})`; g.beginPath(); g.moveTo(B.x, B.y); g.lineTo(x, y); g.stroke(); }
    }
    g.restore();
  }
  dibujarBola(g, t, luz) {
    const S = sprites(), B = this.bola;
    g.save(); g.globalAlpha = Math.min(1, luz + 0.05);
    // cadena
    if (!this.eslabon) {
      g.strokeStyle = "#8d939c"; g.lineWidth = 2.5;
      for (let y = -20; y < B.y - R - 2; y += 9) { g.beginPath(); g.ellipse(lerp(512, B.x, (y + 20) / (B.y + 20)), y + 4, 2.6, 4.6, 0, 0, 6.283); g.stroke(); }
    } else {
      const L = this.eslabon;
      g.strokeStyle = "#8d939c"; g.lineWidth = 2.5;
      for (let y = -20; y < 104 - R - 14; y += 9) { g.beginPath(); g.ellipse(512, y + 4, 2.6, 4.6, 0, 0, 6.283); g.stroke(); }
      g.save(); g.translate(L.x, L.y); g.rotate(L.r); g.beginPath(); g.ellipse(0, 0, 2.6, 4.6, 0, 0, 6.283); g.stroke(); g.restore();
    }
    g.drawImage(S.bola, B.x - R - 4, B.y - R - 4);
    // espejitos
    g.save(); g.beginPath(); g.arc(B.x, B.y, R - 0.5, 0, 6.283); g.clip();
    const bandas = 10, h = (R * 2) / bandas;
    for (let j = 0; j < bandas; j++) {
      const yc = -R + h * (j + 0.5), lat = Math.asin(clamp(yc / R, -1, 1)), rr = R * Math.cos(lat);
      const n = Math.max(4, Math.round(20 * Math.cos(lat)));
      for (let k = 0; k < n; k++) {
        const lon = (k / n) * 6.283 + this.rot + j * 0.3, c = Math.cos(lon);
        if (c <= 0) continue;
        const x = rr * Math.sin(lon), w = ((6.283 * rr) / n) * c;
        const ruido = ((j * 7 + k * 13) % 10) / 10, brillo = 0.25 + 0.55 * ruido * c + (Math.sin(lon * 3 + t * 4 + j) > 0.93 ? 0.6 : 0);
        const luzLado = clamp(0.6 - (x / R) * 0.3 - (yc / R) * 0.4, 0.2, 1.2);
        const v = Math.min(255, Math.round(255 * brillo * luzLado));
        g.fillStyle = `rgb(${v},${Math.min(255, v + 8)},${Math.min(255, v + 22)})`;
        g.fillRect(B.x + x - w / 2 + 0.6, B.y + yc - h / 2 + 0.6, Math.max(0.5, w - 1.2), h - 1.2);
      }
    }
    g.restore();
    // brillos
    if (t > GIRA) for (let i = 0; i < 3; i++) { const a = t * 1.7 + i * 2.1; brillo(g, B.x + Math.cos(a) * R * 0.55, B.y + Math.sin(a * 1.3) * R * 0.5, 16, luz * Math.max(0, Math.sin(t * 5 + i * 2))); }
    g.restore();
  }
  dibujar(g) {
    const t = this.t, e = this.estado(), luz = this.luz(t), B = this.bola;
    fondo(g, "#000");
    // ambiente
    if (luz > 0) {
      g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.25 * luz;
      g.drawImage(BLOB2.cian, -100, 200, 700, 500); g.drawImage(BLOB.rojo, 450, 160, 760, 520);
      g.restore();
      // suelo
      g.save(); g.globalAlpha = luz;
      const gs = g.createLinearGradient(0, PIES - 40, 0, H);
      gs.addColorStop(0, "#14101c"); gs.addColorStop(1, "#06050a");
      g.fillStyle = gs; g.fillRect(-60, PIES - 20, W + 120, H);
      g.restore();
    }
    // foco sobre la bola
    if (luz > 0) {
      g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.5 * luz;
      const gr = g.createLinearGradient(80, -40, B.x, B.y);
      gr.addColorStop(0, "rgba(255,250,230,0)"); gr.addColorStop(1, "rgba(255,250,230,.35)");
      g.fillStyle = gr; g.beginPath(); g.moveTo(40, -40); g.lineTo(120, -40); g.lineTo(B.x + R, B.y + R * 0.4); g.lineTo(B.x - R * 0.6, B.y - R); g.closePath(); g.fill();
      g.restore();
    }
    const aPuntos = tramo(t, GIRA, GIRA + 0.4) * luz;
    this.puntos(g, t, aPuntos);
    foco(g, X + e.dx, X + e.dx, PIES, 130, luz * 0.55);
    pintarAvatar(g, e.m, e.pose, t);
    if (B.y > -R - 10) this.dibujarBola(g, t, luz);
    // estrellitas de mareo
    if (B.golpe > 0 && t > B.golpe && t < B.golpe + 1.6) {
      const c = aPant(e.m, [39, 10]), a = Math.min(1, (t - B.golpe) * 5) * (1 - tramo(t, B.golpe + 1.2, B.golpe + 1.6));
      for (let k = 0; k < 4; k++) {
        const an = t * 6 + k * 1.57;
        g.save(); g.globalAlpha = a; g.fillStyle = "#ffd34d"; g.strokeStyle = "#7a4a00"; g.lineWidth = 2;
        estrella(g, c[0] + Math.cos(an) * 70, c[1] - 6 + Math.sin(an) * 18, 12, 5, t * 4); g.fill(); g.stroke();
        g.restore();
      }
    }
    this.p.dibujar(g);
    // puntitos que también le pasan por encima
    g.save(); g.globalAlpha = 0.5; this.puntos(g, t, aPuntos * 0.35); g.restore();
    // ¡A BAILAR!
    if (t > BAILE - 0.2 && t < SUELTA + 0.1) {
      const k = tramo(t, BAILE - 0.2, BAILE + 0.05), a = 1 - tramo(t, SUELTA - 0.3, SUELTA + 0.1);
      const R1 = rotulo("bailar", "¡A BAILAR!", 96, { peso: 400, fam: FB, color: "#ffffff", borde: "#ff3d84", bordeAncho: 12, esp: 3, glow: "rgba(255,61,132,.9)", glowTam: 24 }, 560, 150);
      const pulso = 1 + 0.06 * Math.max(0, Math.cos(((t - BAILE) / 0.45) * Math.PI * 2));
      g.save(); g.globalAlpha = a * luz; g.translate(232, 150); g.rotate(-0.1); g.scale(eBack(k) * pulso * 0.78, eBack(k) * pulso * 0.78);
      g.drawImage(R1, -R1.width / 2, -R1.height / 2); g.restore();
    }
    // ¡TONK!
    if (B.golpe > 0 && t > B.golpe && t < OFF + 0.3) {
      const k = tramo(t, B.golpe, B.golpe + 0.14), a = 1 - tramo(t, B.golpe + 1.7, B.golpe + 2.1);
      if (a > 0) {
        const R2 = rotulo("tonk", "¡TONK!", 130, { peso: 400, fam: FC, color: "#fffdf5", borde: "#1b4fd1", bordeAncho: 13, esp: 5, glow: "rgba(47,227,232,.8)", glowTam: 22 }, 520, 190);
        g.save(); g.globalAlpha = a; g.translate(250 + (t - B.golpe < 0.35 ? azar(-5, 5) : 0), 175); g.rotate(-0.14); g.scale(eBack(k) * 0.9, eBack(k) * 0.9);
        g.drawImage(R2, -R2.width / 2, -R2.height / 2); g.restore();
      }
    }
    if (luz < 1) { g.fillStyle = `rgba(0,0,0,${t < 0.3 ? 1 : (1 - luz) * (t < 1 ? 0.9 : 1)})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00015", nombre: "Bola de discoteca", crear: () => new EscenaBola() });
})();
