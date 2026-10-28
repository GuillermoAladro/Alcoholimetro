"use strict";
/*
 * LA TIENDA 24H
 *
 * Animación del banco. Empieza y acaba en negro.
 * Cae del cielo con el pelo dorado y aterriza como un superhéroe; con el golpe se enciende el mostrador de la tienda
 * (neón ABIERTO 24H). Se le apaga el pelo echando vapor, se pone las gafas de sol, tira un fajo de billetes al
 * mostrador (¡QUÉDATE EL CAMBIO!, ¡KA-CHING!), coge la bolsa de litronas y se va. El mostrador se funde a negro.
 */

class EscenaTienda extends Escena {
  constructor() {
    super(9.3);
    this.p = new Parts(400);
    this.p.suelo = (x) => (x > 578 && x < 992 ? 426 : PIES - 2);
    this.ESC = 1.6;
    this.fajo = null; this.pagado = -1; this.grietas = [];
    this.BOLSA = [650, 342]; // asas de la bolsa en el mostrador
    this.fase = 0; this.x = 380;
  }
  aMostrador() {
    const t = this.t;
    if (t < 0.5) return 0;
    const on = t < 0.85 ? [1, 0.2, 1, 0.5, 1, 1, 0.7][Math.min(6, Math.floor((t - 0.5) / 0.05))] : 1;
    return on * (1 - tramo(t, 7.7, 9.0));
  }
  estado() {
    const t = this.t, ESC = this.ESC;
    const pose = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0] };
    let manoD = [70, 158], manoI = [9, 160], sx = 1, sy = 1, y = PIES, x = this.x, bote = 0;
    // cae desde arriba (como si viniera volando del Modo leyenda)
    if (t < 0.5) {
      y = lerp(-80, PIES, Math.pow(t / 0.5, 2));
      manoD = [66, -16]; manoI = [12, -16]; sy = 1.15; sx = 0.9;
      pose.oro = 1; pose.puntas = 1; pose.cara = "sorpresa";
    } else {
      // aterrizaje de superhéroe
      const kSube = eInOut(tramo(t, 0.85, 1.35));
      sy = lerp(0.76, 1, kSube); sx = lerp(1.08, 1, kSube);
      manoI = mezcla([-10, 222], [9, 160], kSube);
      manoD = mezcla([112, 118], [70, 158], kSube);
      pose.piernaI = [0, lerp(0.22, 0, kSube)]; pose.piernaD = [0, lerp(-0.22, 0, kSube)];
      pose.cara = t < 1.4 ? "guino" : "sonrisa";
      pose.oro = 1 - tramo(t, 1.35, 1.95);
      pose.puntas = 1 - eInOut(tramo(t, 1.3, 1.75));
    }
    // gafas de sol
    const kG = eInOut(tramo(t, 2.0, 2.42)) * (1 - eInOut(tramo(t, 2.5, 2.8)));
    if (t > 2.0 && t < 2.5) {
      const ojos = [(RIG.ojos[0][0] + RIG.ojos[1][0]) / 2, RIG.ojos[0][1] + 2];
      manoD = mezcla([70, 158], [ojos[0] + 26, ojos[1] + 6], kG);
      const kk = kG;
      pose.objD2 = (g, m) => { g.save(); g.translate(lerp(m[0] - 4, ojos[0] - 0, kk), lerp(m[1] - 6, ojos[1] - 1, kk)); gafasSol(g, -45 * 0.66, -68 * 0.66, 0.66); g.restore(); };
    } else if (t >= 2.5 && t < 2.8) manoD = mezcla([70, 158], [ojos2()[0] + 26, ojos2()[1] + 6], kG);
    pose.gafas = t >= 2.5;
    // andar hasta el mostrador
    if (t > 2.75 && t < 3.6) { const a = andar(this.fase, 0.8); pose.piernaI = a.piernaI; pose.piernaD = a.piernaD; bote = a.bote; }
    // fajo de billetes: lo saca, coge impulso y lo lanza
    if (t > 3.6 && t < 4.27) {
      const kSaca = eInOut(tramo(t, 3.6, 3.85)), kAtras = eInOut(tramo(t, 3.9, 4.12)), kLanza = eIn(tramo(t, 4.12, 4.27));
      manoD = mezcla(mezcla(mezcla([70, 158], [74, 128], kSaca), [92, 66], kAtras), [128, 108], kLanza);
      if (t > 3.72) pose.objD = (g, m) => dibujarFajo(g, m[0] + 2, m[1] + 4, -0.3 + kAtras * 0.8);
      pose.cara = t > 3.9 ? "guino" : "sonrisa";
    } else if (t >= 4.27 && t < 4.7) manoD = mezcla([128, 108], [70, 158], eInOut(tramo(t, 4.35, 4.7)));
    // coger la bolsa
    const B = [39 + (this.BOLSA[0] - this.xAndar(4.9)) / ESC, 232 - (PIES - this.BOLSA[1]) / ESC];
    if (t > 4.95 && t < 5.5) manoD = mezcla([70, 158], B, eInOut(tramo(t, 4.95, 5.4)));
    if (t >= 5.5) {
      manoD = mezcla(B, [76, 156], eInOut(tramo(t, 5.5, 5.85)));
      const balanceo = t > 5.85 ? 0.22 * Math.sin(this.fase) : 0.1 * Math.sin(t * 9) * (1 - tramo(t, 5.5, 5.85));
      pose.objD = (g, m) => dibujarBolsa(g, m[0] + 1, m[1] - 3, balanceo);
    }
    // se va por la derecha, chulito
    if (t > 5.85) { const a = andar(this.fase, 0.9); pose.piernaI = a.piernaI; pose.piernaD = a.piernaD; bote = a.bote; pose.rc = 0.05 * Math.sin(this.fase * 0.5); }
    pose.manoD = manoD; pose.manoI = manoI;
    const m = matAv(x, y + bote, ESC, 0, sx, sy);
    return { pose, m, y };
    function ojos2() { return [(RIG.ojos[0][0] + RIG.ojos[1][0]) / 2, RIG.ojos[0][1] + 2]; }
  }
  xAndar(t) {
    if (t < 2.75) return 380;
    if (t < 3.6) return lerp(380, 515, eInOut(tramo(t, 2.75, 3.6)));
    if (t < 5.85) return 515;
    return 515 + (t - 5.85) * 330;
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    this.x = this.xAndar(t);
    if ((t > 2.75 && t < 3.6) || t > 5.85) this.fase += dt * 9;
    // la cola dorada de la caída
    if (t < 0.5) for (let i = 0; i < 6; i++) p.nueva(P.LLAMA, this.x + azar(-30, 30), lerp(-80, PIES, Math.pow(t / 0.5, 2)) - azar(100, 360), 0, azar(-200, -60), azar(0.15, 0.3), azar(30, 60), 1);
    this.una("aterriza", t > 0.5, () => {
      temblar(28, 0.6);
      for (let i = 0; i < 36; i++) p.nueva(P.POLVO, this.x + azar(-30, 30), PIES - azar(0, 14), azar(-650, 650), azar(-90, -5), azar(0.7, 1.3), azar(30, 60));
      for (let i = 0; i < 26; i++) { const a = azar(-Math.PI, 0), v = azar(250, 600); p.nueva(P.CHISPA, this.x, PIES - 10, Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.7), azar(8, 14)); }
      for (let i = 0; i < 7; i++) {
        const lado = i % 2 ? 1 : -1, pts = [[this.x, PIES]];
        let gx = this.x;
        for (let k = 0; k < 4; k++) { gx += lado * azar(25, 55); pts.push([gx, PIES + azar(-3, 3)]); }
        this.grietas.push(pts);
      }
    });
    if (t > 1.35 && t < 2.1 && Math.random() < 40 * dt) {
      const q = aPant(this.estado().m, [39 + azar(-25, 25), azar(-5, 10)]);
      p.nueva(P.VAPOR, q[0], q[1], azar(-20, 20), azar(-90, -40), azar(0.6, 1.1), azar(20, 34));
    }
    this.una("brillo", t > 2.5, () => { const q = aPant(this.estado().m, RIG.ojos[1]); p.nueva(P.DESTELLO, q[0], q[1], 0, 0, 0.35, 70); });
    // el fajo vuela al mostrador y revienta en billetes
    this.una("lanza", t > 4.25, () => {
      const q = aPant(this.estado().m, [128, 108]);
      this.fajo = { x0: q[0], y0: q[1], x1: 762, y1: 412, t0: t, r: 0 };
    });
    if (this.fajo && !this.fajo.fin && t - this.fajo.t0 >= 0.36) {
      this.fajo.fin = true; this.pagado = t; temblar(6, 0.2);
      for (let i = 0; i < 18; i++) p.nueva(P.BILLETE, 762 + azar(-10, 10), 412, azar(-300, 300), azar(-400, -180), azar(6, 8), azar(36, 46));
      for (let i = 0; i < 14; i++) { const a = azar(-Math.PI, 0), v = azar(150, 380); p.nueva(P.CHISPA, 880, 360, Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.6), azar(6, 10)); }
    }
    p.alfa = t < 7.7 ? 1 : this.aMostrador();
    p.actualizar(dt);
  }
  dibujarMostrador(g, a, t) {
    if (a <= 0) return;
    g.save(); g.globalAlpha = a;
    // cartel de neón
    const zumbido = t > 1 && Math.sin(t * 37) > 0.97 ? 0.55 : 1;
    g.save(); g.globalAlpha = a * zumbido;
    g.strokeStyle = "rgba(255,80,160,.5)"; g.lineWidth = 3; rectR(g, 640, 92, 290, 150, 22);
    g.shadowColor = "#ff3d84"; g.shadowBlur = 18; g.stroke();
    txt(g, "ABIERTO", 785, 160, { tam: 62, peso: 900, fam: FD, color: "#ffd0e6", glow: "#ff3d84", glowTam: 22, esp: 5 });
    txt(g, "24H", 785, 224, { tam: 56, peso: 900, fam: FD, color: "#d6fbff", glow: "#2fe3e8", glowTam: 22, esp: 6 });
    g.restore();
    // mostrador
    const x0 = 585, x1 = 985, top = 432;
    const gr = g.createLinearGradient(0, top, 0, PIES);
    gr.addColorStop(0, "#4a3020"); gr.addColorStop(1, "#22150c");
    g.fillStyle = gr; g.fillRect(x0, top + 8, x1 - x0, PIES - top - 8);
    g.strokeStyle = "rgba(0,0,0,.45)"; g.lineWidth = 2;
    for (let x = x0 + 66; x < x1; x += 66) { g.beginPath(); g.moveTo(x, top + 12); g.lineTo(x, PIES - 14); g.stroke(); }
    g.fillStyle = "#151009"; g.fillRect(x0, PIES - 14, x1 - x0, 14);
    const gt = g.createLinearGradient(0, top - 6, 0, top + 10);
    gt.addColorStop(0, "#d9c3a0"); gt.addColorStop(1, "#8a6a48");
    g.fillStyle = gt; g.fillRect(x0 - 12, top - 4, x1 - x0 + 24, 14);
    // pegatina
    g.save(); g.translate(690, 500); g.rotate(-0.06);
    rectR(g, -62, -20, 124, 40, 8); g.fillStyle = "#1b75d1"; g.fill();
    txt(g, "CERVEZA FRÍA", 0, 7, { tam: 18, peso: 900, fam: FD, color: "#fff", esp: 1.5 });
    g.restore();
    // caja registradora
    const pag = this.pagado > 0 ? t - this.pagado : -1;
    const cajon = pag > 0 ? 14 * eBack(tramo(pag, 0, 0.25)) : 0;
    g.fillStyle = "#1d2026"; rectR(g, 828, 404 + cajon, 112, 18, 3); g.fill();
    g.fillStyle = "#2c3038"; rectR(g, 820, 350, 128, 60, 8); g.fill();
    g.fillStyle = "#3a3f49";
    for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) { rectR(g, 832 + c * 22, 376 + r * 10, 16, 7, 2); g.fill(); }
    g.fillStyle = "#0b1a0f"; rectR(g, 832, 326, 104, 28, 5); g.fill();
    g.strokeStyle = "#2c3038"; g.lineWidth = 4; g.stroke();
    const pantalla = pag < 0 ? "0,00 €" : pag < 0.35 ? "∙∙∙" : "¡GRACIAS!";
    txt(g, pantalla, 884, 347, { tam: 19, peso: 800, color: "#2bff5b", glow: "rgba(43,255,91,.7)", glowTam: 8, esp: 1 });
    if (pag > 0 && pag < 1.1) {
      const k = tramo(pag, 0, 0.18);
      g.save(); g.translate(905, 296); g.rotate(0.12); g.scale(eBack(k), eBack(k));
      txt(g, "¡KA-CHING!", 0, 0, { tam: 40, peso: 400, fam: FC, color: "#ffd34d", borde: "#3a2400", bordeAncho: 7, alfa: 1 - tramo(pag, 0.8, 1.1), esp: 2 });
      g.restore();
    }
    g.restore();
  }
  dibujar(g) {
    const t = this.t, e = this.estado(), aM = this.aMostrador();
    fondo(g, "#000");
    this.dibujarMostrador(g, aM, t);
    // la bolsa en el mostrador
    if (t < 5.5 && aM > 0) { g.save(); g.globalAlpha = aM; g.translate(this.BOLSA[0], this.BOLSA[1]); g.scale(this.ESC, this.ESC); dibujarBolsa(g, 0, 0, 0); g.restore(); }
    // grietas del suelo
    if (this.grietas.length) {
      const a = 1 - tramo(t, 1.2, 2.6);
      if (a > 0) {
        g.save(); g.strokeStyle = `rgba(255,214,120,${0.8 * a})`; g.lineWidth = 2.5; g.lineJoin = "round";
        for (const pts of this.grietas) { g.beginPath(); pts.forEach((q, i) => (i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]))); g.stroke(); }
        g.restore();
      }
    }
    // el fajo en el aire
    if (this.fajo && !this.fajo.fin) {
      const F = this.fajo, u = clamp((t - F.t0) / 0.36, 0, 1);
      const x = lerp(F.x0, F.x1, u), y = lerp(F.y0, F.y1, u) - 160 * 4 * u * (1 - u);
      g.save(); g.translate(x, y); g.scale(this.ESC, this.ESC); dibujarFajo(g, 0, 0, u * 9); g.restore();
    }
    // aura pequeña mientras cae y aterriza
    const cy = e.y - 118 * this.ESC;
    if (t < 1.6) dibujarAura(g, this.x, cy, 60 * this.ESC, 160 * this.ESC, (t < 0.5 ? 0.7 : 0.7 * (1 - tramo(t, 0.5, 1.6))), t);
    if (e.y > -400) pintarAvatar(g, e.m, e.pose, t);
    this.p.dibujar(g);
    // ¡Quédate el cambio!
    if (t > 4.35 && t < 6.1) {
      const q = aPant(e.m, [39, -10]);
      bocadillo(g, q[0] - 95, q[1] - 66, "¡QUÉDATE EL CAMBIO!", q[0] - 10, q[1] - 4, tramo(t, 4.35, 4.6) * (1 - tramo(t, 5.85, 6.1)), 34);
    }
  }
}
