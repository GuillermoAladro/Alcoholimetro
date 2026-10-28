"use strict";
/*
 * 00109 · SIN PARPADEAR
 *
 * Animación del banco. Empieza y acaba en negro.
 * Primer plano: Guillermo y Rodrigo se acercan hasta casi tocarse la frente (¡NO PARPADEES!) y empieza a correr el
 * cronómetro. Una mosca les da vueltas y se les posa en la nariz y en la frente, luego sopla un vendaval que les
 * levanta el pelo y al final les lloran los ojos… Guillermo no aguanta más y guiña un ojo: ha perdido. Rodrigo lo
 * celebra con los brazos arriba y Guillermo se frota el ojo.
 */
(() => {
const ESC = 2.2, YO = 266, DUR = 10.0;
const T_YA = 1.9, T_MOSCA = 2.25, T_VIENTO = 4.35, T_LLORA = 5.3, T_PIERDE = 7.35;

class SinParpadear extends Escena {
  constructor() {
    super(DUR);
    this.p = new Parts(300);
    this.cache = cacheTexto();
    this.papeles = [];
  }
  zoom(t) { return 1 + 0.12 * eInOut(tramo(t, 1.6, T_PIERDE)) - 0.12 * eInOut(tramo(t, T_PIERDE, T_PIERDE + 0.6)); }
  tension(t) { return t < T_YA || t > T_PIERDE ? 0 : 0.25 + 0.75 * tramo(t, T_YA, T_PIERDE); }
  estado() {
    const t = this.t, ten = this.tension(t), pierde = t >= T_PIERDE, dP = t - T_PIERDE;
    const kA = eInOut(tramo(t, 0.25, 1.3));          // se acercan
    const kSep = eInOut(tramo(dP, 0.2, 0.7));         // se separan al acabar
    const viento = Math.sin(Math.PI * tramo(t, T_VIENTO, T_VIENTO + 1.3));
    const tr = (f, i) => Math.sin(t * f + i * 2.1) * ten;   // temblor
    // ---------------- Guillermo
    const G = { cara: "sonrisa", rc: 0.12 * kA, piernaI: [0, 0], piernaD: [0, 0], manoD: [71, 158] };
    let xg = lerp(250, 419, kA) - 60 * kSep, giroG = 0.05 * kA;
    if (t > 0.9 && t < T_YA) G.cara = "sonrisa";
    if (t >= T_YA && !pierde) {
      G.rc = 0.12 + 0.012 * tr(41, 0); xg += 1.5 * tr(37, 0);
      if (t > T_VIENTO) G.cara = "sorpresa";
      G.puntas = 0.75 * viento;
      giroG += 0.03 * viento;
    }
    if (pierde) {
      G.cara = dP < 0.55 ? "guino" : dP < 1.6 ? "dormido" : "risa";
      G.rc = 0.12 * (1 - kSep) - 0.08 * Math.sin(Math.PI * tramo(dP, 0.6, 1.6));
      // se frota el ojo
      const kF = Math.sin(Math.PI * tramo(dP, 0.55, 1.75));
      G.manoD = mezcla([71, 158], [55 + 3 * Math.sin(t * 30), 46], kF);
      giroG = 0.05 * (1 - kSep);
    }
    // ---------------- Rodrigo
    const R = { quien: "rodrigo", cara: "sonrisa", rc: -0.12 * kA, piernaI: [0, 0], piernaD: [0, 0], manoD: [69, 157] };
    let xr = lerp(774, 605, kA) + 100 * kSep, giroR = -0.05 * kA, yr = YO;
    if (t >= T_YA && !pierde) {
      R.rc = -0.12 + 0.012 * tr(43, 1); xr += 1.5 * tr(39, 1);
      if (t > T_VIENTO) R.cara = "sorpresa";
      R.puntas = 0.75 * viento;
      giroR -= 0.03 * viento;
      if (t > 3.15 && t < 3.6) R.rc += 0.03 * Math.sin(t * 70); // la mosca en la nariz
    }
    if (pierde) {
      R.cara = dP < 0.25 ? "sorpresa" : dP < 1.9 ? "risa" : "guino";
      R.rc = -0.12 * (1 - kSep) + 0.07 * Math.sin(dP * 9) * tramo(dP, 0.3, 0.6);
      const kB = eBack(tramo(dP, 0.3, 0.6));
      R.manoD = mezcla([69, 157], [104, 34 + 5 * Math.sin(t * 12)], kB);
      R.manoI = mezcla([9, 157], [-28, 34 + 5 * Math.sin(t * 12 + 1)], kB);
      yr = YO - 34 * Math.abs(Math.sin(Math.max(0, dP - 0.3) * 7)) * tramo(dP, 0.3, 0.5) * (1 - tramo(dP, 1.5, 1.9));
    }
    const z = this.zoom(t);
    const zm = (x, y) => [512 + (x - 512) * z, 300 + (y - 300) * z];
    const pG = zm(xg, YO), pR = zm(xr, yr);
    const mG = matAv(pG[0], pG[1], ESC * z, giroG, 1, 1, [39, 40]);
    const mR = matAv(pR[0], pR[1], ESC * z, giroR, 1, 1, [38, 47]);
    return { G, R, mG, mR, ten, z };
  }
  mosca(t, e) {
    // dónde está la mosca (pantalla) y si está posada
    const nariz = aPant(e.mR, [37.5, 57]), frente = aPant(e.mG, [44, 20]);
    const vuelo = (u) => [512 + 190 * Math.sin(u * 5.3), 212 + 70 * Math.sin(u * 8.7 + 0.6)];
    if (t < T_MOSCA || t > 4.6) return null;
    if (t < 2.55) return { q: mezcla([1100, 120], vuelo(t), eOut(tramo(t, T_MOSCA, 2.55))), posada: false };
    if (t < 2.95) return { q: vuelo(t), posada: false };
    if (t < 3.15) return { q: mezcla(vuelo(t), nariz, eInOut(tramo(t, 2.95, 3.15))), posada: false };
    if (t < 3.6) return { q: nariz, posada: true };
    if (t < 3.85) { const u = tramo(t, 3.6, 3.85), q = mezcla(nariz, frente, eInOut(u)); return { q: [q[0], q[1] - 70 * Math.sin(Math.PI * u)], posada: false }; }
    if (t < 4.15) return { q: frente, posada: true };
    const u = tramo(t, 4.15, 4.6); return { q: mezcla(frente, [-80, -60], eIn(u)), posada: false };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    this.una("titulo", t > 0.75, () => temblar(10, 0.25));
    this.una("ya", t > T_YA, () => temblar(5, 0.12));
    // vendaval: papelitos y polvo que cruzan
    if (t > T_VIENTO && t < T_VIENTO + 1.25) {
      if (Math.random() < 9 * dt) this.papeles.push({ x: -40, y: azar(80, 560), vx: azar(700, 1100), vy: azar(-60, 60), r: azar(0, 6), vr: azar(-12, 12), s: azar(14, 24) });
      if (Math.random() < 20 * dt) p.nueva(P.POLVO, -20, azar(100, 580), azar(800, 1200), azar(-40, 40), azar(0.8, 1.2), azar(30, 60));
      temblar(3, 0.1);
    }
    for (const q of this.papeles) { q.x += q.vx * dt; q.y += q.vy * dt + Math.sin(t * 9 + q.r) * 60 * dt; q.r += q.vr * dt; }
    this.papeles = this.papeles.filter((q) => q.x < W + 60);
    // lágrimas
    if (t > T_LLORA && t < T_PIERDE + 0.4) {
      const e = this.estado();
      if (Math.random() < 10 * dt) {
        const i = Math.random() < 0.5, m = i ? e.mR : e.mG, ojos = i ? [[24, 51], [52, 51]] : [[23, 44], [55, 44]];
        const o = aPant(m, ojos[Math.random() < 0.5 ? 0 : 1]);
        p.nueva(P.GOTA, o[0], o[1], azar(-20, 20), azar(20, 80), 0.6, azar(4, 6));
      }
    }
    this.una("pierde", t > T_PIERDE, () => {
      temblar(20, 0.4);
      const e = this.estado(), q = aPant(e.mG, [50, 40]);
      p.nueva(P.DESTELLO, q[0], q[1], 0, 0, 0.35, 160);
    });
    this.una("celebra", t > T_PIERDE + 0.35, () => {
      for (let i = 0; i < 70; i++) p.nueva(P.CONFETI, azar(560, 980), azar(-40, 40), azar(-150, 150), azar(0, 120), azar(2.2, 3.2), azar(9, 15), i % 5);
    });
    p.actualizar(dt);
  }
  titulo() {
    if (this.cache.has("t")) return this.cache.get("t");
    const c = lienzoNuevo(1000, 150), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 25, 0, 115);
    gr.addColorStop(0, "#fffbe0"); gr.addColorStop(0.5, "#ffd34d"); gr.addColorStop(1, "#ff8f00");
    txt(g, "¡NO PARPADEES!", 500, 112, { tam: 104, peso: 900, fam: FD, color: gr, borde: "#3a1d00", bordeAncho: 11, esp: 4, glow: "rgba(255,170,30,.8)", glowTam: 22, max: 960 });
    this.cache.set("t", c);
    return c;
  }
  tituloRojo() {
    if (this.cache.has("r")) return this.cache.get("r");
    const c = lienzoNuevo(1000, 150), g = c.getContext("2d");
    txt(g, "¡NO PARPADEES!", 500, 112, { tam: 104, peso: 900, fam: FD, color: "#ff4b4b", borde: "#3a0000", bordeAncho: 11, esp: 4, glow: "rgba(255,40,40,.9)", glowTam: 22, max: 960 });
    this.cache.set("r", c);
    return c;
  }
  dibujar(g) {
    const t = this.t, e = this.estado(), pierde = t >= T_PIERDE;
    fondo(g, "#000");
    // fondo: luz cálida y latido rojo de la tensión
    g.save(); g.globalCompositeOperation = "lighter";
    g.globalAlpha = 0.4; g.drawImage(BLOB2.oroClaro, 60, 20, 904, 620);
    if (e.ten > 0.5) { g.globalAlpha = 0.25 * (e.ten - 0.5) * (0.5 + 0.5 * Math.sin(t * 9)); g.drawImage(BLOB.rojo, -100, -100, W + 200, H + 200); }
    g.restore();
    // los dos (Rodrigo un poco por delante)
    pintarAvatar(g, e.mG, e.G, t);
    pintarAvatar(g, e.mR, e.R, t);
    // ojos rojos de aguantar
    const rojo = tramo(t, 4.6, T_PIERDE) * (pierde ? 1 - tramo(t, T_PIERDE, T_PIERDE + 1.2) : 1);
    if (rojo > 0) {
      g.save(); g.globalAlpha = 0.2 * rojo;
      for (const [m, ojos] of [[e.mG, [[27, 40], [50, 40]]], [e.mR, [[28, 47], [48, 47]]]]) for (const o of ojos) { const q = aPant(m, o), r = 22 * e.z; g.drawImage(BLOB.rojo, q[0] - r, q[1] - r, r * 2, r * 2); }
      g.restore();
    }
    // lágrimas que caen por la cara
    if (t > T_LLORA && t < T_PIERDE + 1) {
      const a = tramo(t, T_LLORA, T_LLORA + 0.5) * (1 - tramo(t, T_PIERDE + 0.5, T_PIERDE + 1));
      g.save(); g.strokeStyle = `rgba(150,215,255,${0.7 * a})`; g.lineWidth = 5 * e.z; g.lineCap = "round";
      for (const [m, ojos] of [[e.mG, [[22, 44], [56, 44]]], [e.mR, [[23, 51], [53, 51]]]]) for (const o of ojos) {
        const q0 = aPant(m, o), q1 = aPant(m, [o[0] + (o[0] < 39 ? -1 : 1), o[1] + 20 * tramo(t, T_LLORA, T_LLORA + 1.2)]);
        g.beginPath(); g.moveTo(q0[0], q0[1]); g.lineTo(q1[0], q1[1]); g.stroke();
      }
      g.restore();
    }
    // papelitos del viento
    for (const q of this.papeles) {
      g.save(); g.translate(q.x, q.y); g.rotate(q.r); g.scale(1, Math.abs(Math.cos(q.r * 1.3)) * 0.8 + 0.2);
      g.fillStyle = "#f4f0e6"; g.fillRect(-q.s / 2, -q.s / 2, q.s, q.s); g.restore();
    }
    if (t > T_VIENTO && t < T_VIENTO + 1.3) {
      const a = Math.sin(Math.PI * tramo(t, T_VIENTO, T_VIENTO + 1.3));
      g.save(); g.strokeStyle = `rgba(255,255,255,${0.35 * a})`; g.lineWidth = 3; g.lineCap = "round";
      for (let i = 0; i < 12; i++) { const y = 60 + ((i * 97) % 520), x = ((t * 1500 + i * 211) % 1300) - 200; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 140, y); g.stroke(); }
      g.restore();
    }
    // la mosca
    const mo = this.mosca(t, e);
    if (mo) {
      const [x, y] = mo.q;
      g.save(); g.translate(x, y + (mo.posada ? 0 : Math.sin(t * 50) * 2));
      const ala = mo.posada ? 0.5 + 0.5 * Math.abs(Math.sin(t * 6)) : Math.abs(Math.sin(t * 90));
      g.fillStyle = "rgba(220,240,255,.7)";
      g.beginPath(); g.ellipse(-7, -8, 8, 5 * ala + 1, -0.6, 0, 6.283); g.ellipse(7, -8, 8, 5 * ala + 1, 0.6, 0, 6.283); g.fill();
      g.fillStyle = "#151515"; g.beginPath(); g.ellipse(0, 0, 7, 9, 0, 0, 6.283); g.fill();
      g.beginPath(); g.arc(0, -10, 5, 0, 6.283); g.fill();
      g.fillStyle = "#c0201a"; g.beginPath(); g.arc(-3, -11, 2.3, 0, 6.283); g.arc(3, -11, 2.3, 0, 6.283); g.fill();
      g.restore();
      if (!mo.posada) txt(g, "bzzz", x + 26, y - 18, { tam: 26, peso: 400, fam: FC, color: "#fffdf5", alfa: 0.75, esp: 2 });
    }
    this.p.dibujar(g);
    // título arriba (grande al principio, luego en la cabecera)
    if (t > 0.65) {
      const d = t - 0.65, k = tramo(d, 0, 0.16);
      let s = lerp(2.6, 1, eIn(k)) * lerp(0.95, 0.72, eInOut(tramo(t, 1.45, 1.85)));
      let y = lerp(118, 66, eInOut(tramo(t, 1.45, 1.85))), x = 512, rot = -0.03;
      let spr = this.titulo();
      if (pierde) {
        const dP = t - T_PIERDE;
        spr = Math.sin(dP * 30) > 0 || dP > 0.6 ? this.tituloRojo() : spr;
        x += Math.sin(dP * 70) * 12 * (1 - tramo(dP, 0, 0.6)); s *= 1 + 0.2 * eOut(tramo(dP, 0, 0.15)) * (1 - tramo(dP, 0.15, 0.5));
      }
      g.save(); g.globalAlpha = Math.min(1, k * 3); g.translate(x, y); g.rotate(rot); g.scale(s, s);
      g.drawImage(spr, -spr.width / 2, -spr.height / 2); g.restore();
    }
    // cronómetro
    if (t > T_YA) {
      const a = tramo(t, T_YA, T_YA + 0.2);
      const seg = Math.min(t, T_PIERDE) - T_YA;
      g.save(); g.globalAlpha = a;
      rectR(g, 432, 124, 160, 46, 23); g.fillStyle = "rgba(0,0,0,.75)"; g.fill();
      g.strokeStyle = pierde ? "#ff4b4b" : "#2bff5b"; g.lineWidth = 2.5; g.stroke();
      txt(g, seg.toFixed(1).replace(".", ",") + " s", 528, 158, { tam: 32, peso: 800, color: pierde ? "#ff6b6b" : "#2bff5b", glow: pierde ? "#ff3030" : "rgba(43,255,91,.7)", glowTam: 8 });
      g.strokeStyle = pierde ? "#ff6b6b" : "#c8ffd6"; g.lineWidth = 3;
      g.beginPath(); g.arc(458, 147, 12, 0, 6.283); g.stroke();
      const an = seg * 6.283 - Math.PI / 2; g.beginPath(); g.moveTo(458, 147); g.lineTo(458 + Math.cos(an) * 9, 147 + Math.sin(an) * 9); g.stroke();
      g.restore();
    }
    // Rodrigo: «¡HAS PARPADEADO!»
    if (pierde && t < DUR - 0.5) {
      const q = aPant(e.mR, [40, -6]);
      bocadillo(g, 822, 124, "¡HAS PARPADEADO!", q[0] + 18, q[1] + 22, tramo(t, T_PIERDE + 0.45, T_PIERDE + 0.7) * (1 - tramo(t, DUR - 0.9, DUR - 0.6)), 32);
    }
    // iris de entrada y salida
    const r = t < 0.6 ? 700 * eOut(tramo(t, 0.02, 0.6)) : 700 * (1 - eIn(tramo(t, DUR - 0.65, DUR - 0.05)));
    if (r < 690) {
      g.fillStyle = "#000"; g.beginPath(); g.rect(-60, -60, W + 120, H + 120);
      if (r > 1) g.arc(512, 280, r, 0, 6.283, true);
      g.fill();
    }
  }
}

registrar({ id: "00109", nombre: "Sin parpadear", crear: () => new SinParpadear() });
})();
