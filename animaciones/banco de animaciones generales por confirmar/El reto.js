"use strict";
/*
 * EL RETO
 *
 * Animación del banco. Empieza y acaba en negro.
 * Se encienden dos focos y sube un podio con él en el 1, con un trofeo lleno de cerveza y confeti. Sale el récord
 * del bar (el puesto 1 del ranking), ¿TE ATREVES A SUPERARLO? y PAGA AQUÍ con una flecha al lector de tarjetas.
 * Grita ¡BEBE!, el escenario se apaga y el grito se desvanece.
 */

class EscenaReto extends Escena {
  constructor() {
    super(7.55);
    this.t = 0.7; // empieza en negro: los focos se encienden enseguida
    this.p = new Parts(400);
    this.p.suelo = (x) => (x > 437 && x < 587 ? PIES - 125 : x > 282 && x < 432 ? PIES - 85 : x > 592 && x < 742 ? PIES - 60 : PIES);
    this.ESC = 1.25; this.confeti = false;
    this.grito = sprite3D("¡BEBE!", 150, EscenaBebe.ESQUEMAS[0]);
  }
  subida() { return (1 - eBack(tramo(this.t, 1.3, 2.15))) * 560; }
  estado() {
    const t = this.t, dy = this.subida();
    const pose = { cara: "sonrisa", rc: 0, piernaI: [0, -0.04], piernaD: [0, 0.04] };
    const bombea = Math.sin(t * 6) * 4;
    pose.manoI = [-8, 34 + bombea];
    pose.objI = (g, m) => dibujarTrofeo(g, m[0] + 1, m[1] + 2, -0.08 + 0.03 * Math.sin(t * 6), t);
    pose.manoD = [124, 44 + Math.sin(t * 4) * 3];
    let sx = 1;
    if (t > 2.2 && t < 5.4) pose.cara = Math.floor(t * 0.8) % 2 ? "guino" : "sonrisa";
    if (t >= 5.4 && t < 5.95) { pose.cara = "sorpresa"; sx = 1 + 0.04 * tramo(t, 5.4, 5.95); }
    if (t >= 5.95) { pose.cara = "risa"; pose.rc = 0.03 * Math.sin(t * 40); }
    const m = matAv(512, PIES - 125 + dy, this.ESC, 0, sx, 1);
    return { pose, m, dy };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    this.una("confeti", t > 2.15, () => {
      temblar(8, 0.3);
      for (let i = 0; i < 140; i++) p.nueva(P.CONFETI, azar(0, W), azar(-200, -10), azar(-60, 60), azar(20, 120), azar(5, 7), azar(8, 14), (Math.random() * 5) | 0);
    });
    if (t > 2.6 && t < 5.8 && Math.random() < 25 * dt) p.nueva(P.CONFETI, azar(0, W), -10, azar(-40, 40), azar(40, 100), 6, azar(8, 14), (Math.random() * 5) | 0);
    this.una("record", t > 2.35, () => temblar(10, 0.25));
    this.una("grito", t > 5.95, () => temblar(22, 0.6));
    this.una("filas", t > 6.85, () => temblar(10, 0.2));
    p.actualizar(dt);
  }
  podio(g, dy) {
    const bloques = [[282, 85, "2", ["#f4f7fa", "#8d969f"]], [592, 60, "3", ["#f1b07c", "#8a4f22"]], [437, 125, "1", ["#ffe27a", "#b07d00"]]];
    for (const [x, h, n, [c0, c1]] of bloques) {
      const y = PIES - h + dy, w = 150;
      g.fillStyle = c0; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 14, y - 12); g.lineTo(x + w + 14, y - 12); g.lineTo(x + w, y); g.closePath(); g.fill();
      const gr = g.createLinearGradient(0, y, 0, y + h);
      gr.addColorStop(0, c0); gr.addColorStop(1, c1);
      g.fillStyle = gr; g.fillRect(x, y, w, h + 40);
      g.fillStyle = "rgba(0,0,0,.25)"; g.beginPath(); g.moveTo(x + w, y); g.lineTo(x + w + 14, y - 12); g.lineTo(x + w + 14, y + h + 40); g.lineTo(x + w, y + h + 40); g.fill();
      txt(g, n, x + w / 2, y + Math.min(h - 10, 78), { tam: n === "1" ? 84 : 60, peso: 900, fam: FD, color: "rgba(40,24,0,.75)" });
    }
  }
  dibujar(g) {
    const t = this.t, e = this.estado();
    fondo(g, "#000");
    const kFin = tramo(t, 6.3, 6.8); // al gritar, el escenario se apaga
    const aEsc = 1 - kFin;
    g.save(); g.globalAlpha = aEsc;
    // focos que barren hasta el centro
    const kF = eInOut(tramo(t, 1.0, 1.9)), aF = tramo(t, 1.0, 1.2);
    foco(g, 110, lerp(-60, 470, kF), PIES, 120, aF * 0.9);
    foco(g, 914, lerp(1084, 554, kF), PIES, 120, aF * 0.9);
    this.podio(g, e.dy);
    pintarAvatar(g, e.m, e.pose, t);
    g.restore();
    this.p.alfa = aEsc; this.p.dibujar(g);
    g.save(); g.globalAlpha = aEsc;
    // récord del bar
    if (t > 2.3) {
      const k = tramo(t, 2.3, 2.45), s = lerp(2.4, 1, eIn(k));
      txt(g, "RÉCORD DEL BAR", 205, 112, { tam: 24, peso: 800, color: "#2bff5b", esp: 4, alfa: Math.min(1, k * 3) });
      g.save(); g.translate(205, 212); g.scale(s, s);
      const gr = g.createLinearGradient(0, -80, 0, 0);
      gr.addColorStop(0, "#fff6c2"); gr.addColorStop(1, "#ffb21a");
      txt(g, `${fmt(datos.top[0].valor)} ${datos.unidad}`, 0, 0, { tam: 104, peso: 900, fam: FD, color: gr, borde: "#3a2200", bordeAncho: 8, alfa: Math.min(1, k * 3), esp: 1, max: 380 });
      g.restore();
    }
    if (t > 2.95) {
      const k = eBack(tramo(t, 2.95, 3.3));
      g.save(); g.translate(205, 290); g.rotate(-0.04); g.scale(k, k);
      txt(g, "¿TE ATREVES", 0, 0, { tam: 50, peso: 400, fam: FC, color: "#fff", esp: 2 });
      txt(g, "A SUPERARLO?", 0, 50, { tam: 50, peso: 400, fam: FC, color: "#fff", esp: 2 });
      g.restore();
    }
    // paga con tarjeta, con flecha al lector (arriba a la derecha)
    if (t > 3.45) {
      const k = eBack(tramo(t, 3.45, 3.8)), rebote = Math.sin(t * 7) * 6;
      g.save(); g.translate(800, 140); g.scale(k, k);
      rectR(g, -150, -34, 300, 68, 34); g.fillStyle = "#2bff5b"; g.fill();
      g.fillStyle = "#04140a"; rectR(g, -126, -15, 40, 28, 4); g.fill();
      g.fillStyle = "#2bff5b"; g.fillRect(-126, -9, 40, 5);
      txt(g, "PAGA AQUÍ · 2,00 €", -72, 11, { tam: 30, peso: 900, fam: FD, color: "#04140a", esp: 1, alin: "left", max: 210 });
      g.restore();
      g.save(); g.translate(950 + rebote * 0.7, 62 - rebote * 0.7); g.rotate(-Math.PI / 4); g.globalAlpha *= Math.min(1, tramo(t, 3.45, 3.7) * 2);
      g.fillStyle = "#2bff5b"; g.beginPath();
      g.moveTo(38, 0); g.lineTo(6, -28); g.lineTo(6, -11); g.lineTo(-34, -11); g.lineTo(-34, 11); g.lineTo(6, 11); g.lineTo(6, 28); g.closePath(); g.fill();
      g.restore();
    }
    g.restore();
    // ¡BEBE! sale de su boca, se queda solo en el negro y se apaga
    if (t > 5.95) {
      const M0 = aPant(e.m, boca(0)), k = tramo(t, 5.95, 6.35);
      const s = lerp(0.1, 1, eBack(k)) * (1 + 0.12 * tramo(t, 6.35, 7.4));
      const x = lerp(M0[0], W / 2, eOut(k)), y = lerp(M0[1], 300, eOut(k));
      const a = 1 - tramo(t, 6.95, 7.4);
      if (a > 0) {
        g.save(); g.globalAlpha = a; g.translate(x + (t < 6.9 ? azar(-5, 5) : 0), y); g.scale(s, s);
        g.drawImage(this.grito, -this.grito.width / 2, -this.grito.height / 2);
        g.restore();
      }
    }
  }
}
