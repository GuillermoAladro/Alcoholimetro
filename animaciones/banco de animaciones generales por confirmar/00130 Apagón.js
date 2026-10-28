"use strict";
/*
 * 00130 · APAGÓN
 *
 * Animación del banco. Empieza y acaba en negro.
 * Guillermo y Rodrigo charlan en la barra; la lámpara parpadea y se va la luz. En la oscuridad solo se ven dos pares
 * de ojos que miran a todos lados y se van juntando; cruje algo (¡CRAAC!) y… ¡AAAH! Vuelve la luz: están abrazados
 * temblando. Se sueltan de un salto y disimulan (uno silba, el otro se arregla el pelo) hasta que se miran y se
 * parten de risa. Se va la luz otra vez: los ojos se miran, parpadean y se cierran.
 */
(() => {
const ESC = 1.9, AY = 660, BARRA = 470;
const XG = 400, XR = 640, XGA = 482, XRA = 566; // separados / abrazados
const T_OFF = 1.95, T_CRAC = 3.6, T_AAH = 4.3, T_ON = 4.8, T_SUELTA = 5.85, T_OFF2 = 8.55;

function pista(t, k) {
  if (t <= k[0][0]) return k[0][1];
  for (let i = 1; i < k.length; i++) if (t <= k[i][0]) {
    const u = (k[i][2] || eInOut)((t - k[i - 1][0]) / (k[i][0] - k[i - 1][0])), a = k[i - 1][1], b = k[i][1];
    return Array.isArray(a) ? [lerp(a[0], b[0], u), lerp(a[1], b[1], u)] : lerp(a, b, u);
  }
  return k[k.length - 1][1];
}
const aAv = (m, q) => { const p = m.inverse().transformPoint(new DOMPoint(q[0], q[1])); return [p.x, p.y]; };

class Apagon extends Escena {
  constructor() {
    super(9.8);
    this.p = new Parts(200);
    this.notas = []; this.gotas = [];
  }
  /** Luz de la lámpara 0–1 (con parpadeos). */
  luz(t) {
    if (t < 0.4) return t / 0.4;
    if (t < T_OFF) { const u = t - 1.35; return u > 0 && Math.sin(u * 47) * Math.sin(u * 13) > 0.25 - u ? 0.15 : 1; }
    if (t < T_ON) return 0;
    if (t < T_ON + 0.3) return [1, 0.2, 1, 0.4, 1, 1][Math.min(5, Math.floor((t - T_ON) / 0.05))];
    if (t < T_OFF2) return 1;
    if (t < T_OFF2 + 0.25) return [0.3, 1, 0.1, 0.6, 0][Math.min(4, Math.floor((t - T_OFF2) / 0.05))];
    return 0;
  }
  xG(t) { return pista(t, [[2.6, XG], [3.5, XG + 30], [T_CRAC + 0.1, XG + 30], [T_AAH, XG + 52], [T_AAH + 0.2, XGA, eOut], [T_SUELTA, XGA], [T_SUELTA + 0.22, XG - 10, eOut], [T_SUELTA + 0.5, XG]]); }
  xR(t) { return pista(t, [[2.8, XR], [3.5, XR - 26], [T_CRAC + 0.1, XR - 26], [T_AAH, XR - 48], [T_AAH + 0.2, XRA, eOut], [T_SUELTA, XRA], [T_SUELTA + 0.22, XR + 10, eOut], [T_SUELTA + 0.5, XR]]); }
  poses() {
    const t = this.t;
    const G = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [64, 128], manoI: [14, 130] };
    const R = { quien: "rodrigo", cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [60, 128], manoI: [16, 130] };
    let dyG = 0, dyR = 0, gG = 0, gR = 0;
    // charlan: Rodrigo cuenta algo, Guillermo se ríe
    if (t < 1.35) {
      R.cara = Math.floor(t * 3) % 2 ? "risa" : "sonrisa"; R.manoD = [74 + 6 * Math.sin(t * 9), 108 + 6 * Math.cos(t * 7)]; R.rc = 0.05 * Math.sin(t * 4);
      G.cara = t > 0.8 ? "risa" : "sonrisa"; dyG = t > 0.8 ? -2 * Math.abs(Math.sin(t * 12)) : 0;
    }
    // parpadeo: miran arriba
    if (t >= 1.35 && t < T_OFF) { G.cara = "sorpresa"; R.cara = "sorpresa"; G.rc = -0.05; R.rc = 0.05; }
    // el susto (con luz): abrazados temblando
    if (t >= T_ON && t < T_SUELTA) {
      const tr = 1 - 0.5 * tramo(t, T_ON + 0.6, T_SUELTA);
      G.cara = "sorpresa"; R.cara = "sorpresa"; G.puntas = 1; R.puntas = 1;
      G.rc = 0.14 + azar(-0.02, 0.02) * tr; R.rc = -0.14 + azar(-0.02, 0.02) * tr;
      dyG = azar(-1.5, 1.5) * tr; dyR = azar(-1.5, 1.5) * tr;
      // Guillermo se agarra a Rodrigo con los dos brazos; Rodrigo le pasa el brazo por la espalda
      const mR0 = matAv(XRA, AY, ESC), mG0 = matAv(XGA, AY, ESC);
      G.manoD = aAv(mG0, aPant(mR0, [64, 92]));
      G.brazoIDelante = true; G.manoI = aAv(mG0, aPant(mR0, [28, 104]));
      R.manoI = aAv(mR0, aPant(mG0, [1, 84]));
      R.manoD = [52, 112];
    }
    // se sueltan de un salto y disimulan
    if (t >= T_SUELTA) {
      const d = t - T_SUELTA;
      G.puntas = 1 - tramo(d, 0.1, 0.5); R.puntas = 1 - tramo(d, 0.1, 0.5);
      if (d < 0.25) { dyG = -14 * Math.sin((d / 0.25) * Math.PI); dyR = dyG; G.cara = R.cara = "sorpresa"; G.rc = -0.1; R.rc = 0.1; }
      else if (d < 1.6) {
        // Guillermo silba y se arregla el cuello; Rodrigo se peina con la mano
        G.cara = "sonrisa"; G.rc = -0.14 + 0.03 * Math.sin(t * 5);
        G.manoD = mezcla([64, 128], [54, 78 + 2 * Math.sin(t * 16)], eOut(tramo(d, 0.25, 0.5)));
        R.cara = d > 0.9 ? "guino" : "sonrisa"; R.rc = 0.14 + 0.03 * Math.sin(t * 4);
        R.manoD = mezcla([60, 128], [60 + 10 * Math.sin(t * 8), 26 + 4 * Math.cos(t * 8)], eOut(tramo(d, 0.3, 0.55)));
        gG = -0.02; gR = 0.02;
      } else {
        // se miran y se parten de risa
        G.cara = d < 1.85 ? "guino" : "risa"; R.cara = d < 1.85 ? "guino" : "risa";
        G.rc = 0.06 * Math.sin(t * 10); R.rc = -0.06 * Math.sin(t * 10 + 1);
        dyG = -2.5 * Math.abs(Math.sin(t * 11)); dyR = -2.5 * Math.abs(Math.sin(t * 11 + 1));
        gG = 0.03 * Math.sin(t * 5.5); gR = -0.03 * Math.sin(t * 5.5 + 1);
        // palmadita en el hombro
        if (d > 2.1) { const k = eInOut(tramo(d, 2.1, 2.35)); G.manoD = mezcla([64, 128], aAv(matAv(XG, AY, ESC), aPant(matAv(XR, AY, ESC), [12, 96])), k * 0.92); }
      }
    }
    const mG = matAv(this.xG(t), AY + dyG, ESC, gG), mR = matAv(this.xR(t), AY + dyR, ESC, gR);
    return { G, mG, R, mR };
  }
  /** Ojos en la oscuridad: hacia dónde miran (-1…1) y lo abiertos que están. */
  mirada(t, quien) {
    const s = quien === "G" ? 0 : 0.37;
    let lx = Math.sin((t + s) * 2.3) > 0 ? 1 : -1, ly = 0, ab = 1, tam = 1;
    if (t < 2.4) { lx = 0; ly = -0.8; }
    else if (t < 3.0) { lx = Math.sin((t + s) * 9) > 0 ? 1 : -1; ly = 0.2 * Math.sin(t * 4); }
    else if (t < T_CRAC) { lx = quien === "G" ? 1 : -1; ly = 0; }
    else if (t < T_AAH) { lx = quien === "G" ? -1 : 1; ly = -0.3; tam = 1.25; }
    else { lx = quien === "G" ? 1 : -1; ly = -0.2; tam = 1.45; }
    if (t > T_OFF2) { lx = quien === "G" ? 1 : -1; ly = 0; tam = 1; }
    // parpadeos
    const b = [[2.15, 2.27], [2.95, 3.05], [3.25, 3.35], [T_OFF2 + 0.55, T_OFF2 + 0.65]];
    for (const [a, c] of b) if (t > a + s * 0.3 && t < c + s * 0.3) ab = 0.1;
    if (t > 9.25) ab = Math.max(0, 1 - (t - 9.25) / 0.2);
    return { lx, ly, ab, tam };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    this.una("off", t > T_OFF, () => temblar(4, 0.15));
    this.una("crac", t > T_CRAC, () => temblar(8, 0.25));
    this.una("aah", t > T_AAH, () => temblar(22, 0.6));
    this.una("on", t > T_ON, () => {
      for (let i = 0; i < 14; i++) p.nueva(P.CHISPA, 512 + azar(-20, 20), 20, azar(-200, 200), azar(0, 200), azar(0.3, 0.6), azar(6, 10));
    });
    // sudor del susto
    if (t > T_ON && t < T_SUELTA + 1.5 && Math.random() < 6 * dt) {
      const e = this.poses(), a = Math.random() < 0.5, m = a ? e.mG : e.mR;
      const q = aPant(m, [a ? 10 : 66, 30]);
      this.gotas.push({ x: q[0], y: q[1], vx: (a ? -1 : 1) * azar(40, 110), vy: azar(-200, -80), v: 0.7 });
    }
    for (const d of this.gotas) { d.vy += 900 * dt; d.x += d.vx * dt; d.y += d.vy * dt; d.v -= dt; }
    this.gotas = this.gotas.filter((d) => d.v > 0);
    if (t > T_SUELTA + 0.3 && t < T_SUELTA + 1.5) this.una("n" + Math.floor(t / 0.4), true, () => this.notas.push({ t0: t }));
    p.actualizar(dt);
  }
  barra(g) {
    const gf = this.grBarra || (this.grBarra = (() => { const gr = g.createLinearGradient(0, BARRA, 0, H); gr.addColorStop(0, "#5a3218"); gr.addColorStop(1, "#24130a"); return gr; })());
    g.fillStyle = gf; g.fillRect(-60, BARRA + 10, W + 120, H - BARRA + 60);
    g.fillStyle = "rgba(0,0,0,.35)";
    for (let x = 30; x < W; x += 96) g.fillRect(x, BARRA + 18, 3, H - BARRA);
    g.fillStyle = "rgba(255,210,150,.06)"; g.fillRect(-60, BARRA + 70, W + 120, 4);
    g.fillStyle = "#b8862d"; g.fillRect(-60, 556, W + 120, 9); g.fillStyle = "rgba(255,240,190,.6)"; g.fillRect(-60, 557, W + 120, 2);
    g.fillStyle = "#8a5426"; g.fillRect(-60, BARRA - 6, W + 120, 18);
    g.fillStyle = "rgba(255,220,170,.4)"; g.fillRect(-60, BARRA - 6, W + 120, 3);
    g.fillStyle = "rgba(0,0,0,.45)"; g.fillRect(-60, BARRA + 12, W + 120, 5);
  }
  lampara(g, luz, t) {
    // la lámpara que cuelga sobre la barra
    g.strokeStyle = "#3a3a3a"; g.lineWidth = 3; g.beginPath(); g.moveTo(512, -20); g.lineTo(512, 40); g.stroke();
    g.fillStyle = "#2b2420"; g.beginPath(); g.moveTo(470, 72); g.lineTo(554, 72); g.lineTo(530, 40); g.lineTo(494, 40); g.closePath(); g.fill();
    g.fillStyle = luz > 0.5 ? "#fff3c4" : "#5a5040"; g.beginPath(); g.ellipse(512, 74, 16, 9, 0, 0, 6.283); g.fill();
    if (luz > 0) {
      g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.45 * luz;
      g.drawImage(BLOB2.oroClaro, 100, 20, 824, 560);
      g.globalAlpha = 0.8 * luz; g.drawImage(BLOB.amarillo, 472, 44, 80, 60);
      g.restore();
    }
  }
  ojos(g, m, R, mir, tono) {
    for (const o of R.ojos) {
      const q = aPant(m, o);
      const rx = 17 * mir.tam, ry = 12.5 * mir.tam * mir.ab;
      g.save();
      g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.25; g.drawImage(BLOB.blanco, q[0] - rx * 2, q[1] - ry * 2 - 4, rx * 4, ry * 4 + 8);
      g.restore();
      g.fillStyle = tono; g.beginPath(); g.ellipse(q[0], q[1], rx, Math.max(1.2, ry), 0, 0, 6.283); g.fill();
      if (mir.ab > 0.4) {
        g.save(); g.beginPath(); g.ellipse(q[0], q[1], rx, ry, 0, 0, 6.283); g.clip();
        g.fillStyle = "#0b0b0b"; g.beginPath(); g.arc(q[0] + mir.lx * rx * 0.45, q[1] + mir.ly * ry * 0.45, 6.5 / Math.sqrt(mir.tam), 0, 6.283); g.fill();
        g.restore();
      }
    }
  }
  dibujar(g) {
    if (!this._tit) this.titulo(); // se prepara en el primer cuadro (negro), no en el remate
    const t = this.t, e = this.poses(), luz = this.luz(t);
    fondo(g, "#000");
    if (luz > 0) {
      this.lampara(g, luz, t);
      // jarras en la barra
      for (const [x, nv] of [[300, 0.8], [740, 0.6]]) {
        g.save(); g.translate(x, BARRA - 4); g.scale(1.9, 1.9);
        dibujarJarra(g, [0, -18], 0, nv, "asa", t); dibujarJarra(g, [0, -18], 0, nv, "cuerpo", t);
        g.restore();
      }
      pintarAvatar(g, e.mR, e.R, t);
      pintarAvatar(g, e.mG, e.G, t);
      this.barra(g);
      this.p.dibujar(g);
      g.fillStyle = "#bfe9ff";
      for (const d of this.gotas) { g.beginPath(); g.ellipse(d.x, d.y, 4, 6, 0, 0, 6.283); g.fill(); }
      // notas de silbar
      const b = aPant(e.mG, boca(e.G.rc));
      for (const n of this.notas) {
        const d = t - n.t0; if (d > 1.1) continue;
        const a = Math.min(1, d * 5) * (1 - tramo(d, 0.7, 1.1));
        g.save(); g.globalAlpha = a; g.translate(b[0] - 40 - d * 60, b[1] - 40 - d * 80 + 6 * Math.sin(d * 8)); g.scale(1.2, 1.2);
        g.fillStyle = "#fffdf5"; g.strokeStyle = "#fffdf5"; g.lineWidth = 2.4;
        g.beginPath(); g.ellipse(0, 0, 6, 4.4, -0.4, 0, 6.283); g.fill();
        g.beginPath(); g.moveTo(5.2, -1.5); g.lineTo(5.2, -22); g.quadraticCurveTo(12, -17, 12, -9); g.stroke();
        g.restore();
      }
      // oscurece según la lámpara
      if (luz < 1) { g.fillStyle = `rgba(0,0,0,${0.94 * (1 - luz)})`; g.fillRect(-60, -60, W + 120, H + 120); }
      // bzzz
      if (t > 1.35 && t < T_OFF) txt(g, "BZZZ…", 600, 60, { tam: 34, peso: 400, fam: FC, color: "#fff3c4", borde: "#3a2a00", bordeAncho: 6, esp: 2 });
    }
    // a oscuras: solo los ojos
    if (luz < 0.5 && t > T_OFF - 0.1) {
      const RG = avatar().rig, RR = avatar("rodrigo").rig;
      if (t < 9.5) {
        this.ojos(g, e.mG, RG, this.mirada(t, "G"), "#fffdf5");
        this.ojos(g, e.mR, RR, this.mirada(t, "R"), "#fffdf5");
      }
    }
    // ¡CRAAC!
    if (t > T_CRAC && t < T_CRAC + 0.7) {
      const k = tramo(t, T_CRAC, T_CRAC + 0.1);
      g.save(); g.translate(880, 200); g.rotate(0.15); g.scale(eBack(k), eBack(k));
      txt(g, "¡CRAAC!", 0, 0, { tam: 50, peso: 400, fam: FC, color: "#c9c9c9", borde: "#222", bordeAncho: 7, alfa: 1 - tramo(t, T_CRAC + 0.5, T_CRAC + 0.7), esp: 2 });
      g.restore();
    }
    // ¡AAAH!
    if (t > T_AAH && t < 7.3) {
      const d = t - T_AAH, k = tramo(d, 0, 0.15), s = lerp(2.4, 1, eIn(k));
      const spr = this.titulo();
      const tiembla = t < T_SUELTA ? 5 : 0;
      g.save(); g.globalAlpha = Math.min(1, k * 3) * (1 - tramo(t, 6.9, 7.3)); g.translate(512 + azar(-tiembla, tiembla), 115 + azar(-tiembla, tiembla)); g.rotate(-0.03); g.scale(s, s);
      g.drawImage(spr, -spr.width / 2, -spr.height / 2); g.restore();
    }
    if (t < 0.4) { g.fillStyle = `rgba(0,0,0,${1 - t / 0.4})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
  titulo() {
    if (this._tit) return this._tit;
    const c = lienzoNuevo(700, 220), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 50, 0, 170);
    gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.6, "#ffe0e8"); gr.addColorStop(1, "#ff7aa8");
    txt(g, "¡AAAH!", 350, 168, { tam: 160, peso: 400, fam: FC, color: gr, borde: "#5a0020", bordeAncho: 16, esp: 8, glow: "rgba(255,61,132,.8)", glowTam: 26 });
    return (this._tit = c);
  }
}

registrar({ id: "00130", nombre: "Apagón", crear: () => new Apagon() });
})();
