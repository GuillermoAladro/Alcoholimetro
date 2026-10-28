"use strict";
/*
 * 00054 · FOTO DE GRUPO
 *
 * Animación del banco. Empieza y acaba en negro.
 * Entra, pone la cámara en modo foto y llama a sus clones: llegan cuatro (gafas de sol, pelo dorado, pelo de punta y
 * uno con mala cara). Se colocan a empujones y el de mala cara se cuela delante tapándolo. ¡SONREÍD!, cuenta atrás y
 * salta justo cuando dispara el flash: la imagen se congela y se convierte en una foto con todas las caras distintas.
 */
(() => {
const FLASH = 6.65;
const ESC = 1.35;
const bache = (t, t0, d = 0.28) => Math.sin(Math.PI * tramo(t, t0, t0 + d));

class EscenaGrupo extends Escena {
  constructor() {
    super(10.4);
    this.p = new Parts(160);
    this.snap = null; this.flash = 0;
    const esq = { cara: "#fffdf5", lado: "#7d8590", borde: "#000" };
    this.nums = ["3", "2", "1"].map((s) => sprite3D(s, 170, esq));
  }
  /** Los cinco: posición, escala y pose en el instante t. Orden de pintado: de atrás adelante. */
  grupo(t) {
    const base = () => ({ cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [70, 158], manoI: [9, 160] });
    const entra = (x0, x1, t0, d = 0.95) => {
      const k = tramo(t, t0, t0 + d), x = lerp(x0, x1, eOut(k));
      const anda = k > 0 && k < 0.92 ? andar(t * 10 + x0, 0.9) : null;
      return { x, anda };
    };
    const res = [];
    // C1 · gafas de sol (por la izquierda)
    {
      const e = entra(-120, 210, 1.55), pose = base(); pose.gafas = true;
      let dx = -16 * bache(t, 3.2);
      if (e.anda) { pose.piernaI = e.anda.piernaI; pose.piernaD = e.anda.piernaD; }
      if (t > 4.4) { pose.manoD = [100, 128]; pose.manoI = [-6, 140]; }
      res.push({ x: e.x + dx, y: PIES + (e.anda ? e.anda.bote : 0), esc: ESC, giro: -0.08 * bache(t, 3.2), pose });
    }
    // C2 · pelo dorado (por la izquierda), empuja a Guillermo
    {
      const e = entra(-120, 360, 1.8), pose = base(); pose.oro = 1;
      const dx = 20 * bache(t, 2.9) + 10 * bache(t, 3.2);
      if (e.anda) { pose.piernaI = e.anda.piernaI; pose.piernaD = e.anda.piernaD; }
      if (t > 2.85 && t < 3.5) { pose.cara = "risa"; pose.manoD = [100, 120]; }
      if (t > 4.4) { pose.cara = "guino"; pose.manoI = [-14, 36 + 4 * Math.sin(t * 10)]; }
      res.push({ x: e.x + dx, y: PIES + (e.anda ? e.anda.bote : 0), esc: ESC, giro: 0.07 * bache(t, 2.9), pose });
    }
    // Guillermo
    {
      const pose = base();
      let x = lerp(-120, 512, eOut(tramo(t, 0.2, 1.15))), y = PIES, giro = 0, sx = 1, sy = 1;
      if (t < 1.15) { const a = andar(t * 9, 0.9); pose.piernaI = a.piernaI; pose.piernaD = a.piernaD; y += a.bote; }
      // llama a los clones
      if (t > 1.2 && t < 2.6) {
        const k = eInOut(tramo(t, 1.2, 1.4)) * (1 - eInOut(tramo(t, 2.4, 2.6)));
        pose.manoD = mezcla([70, 158], [104, 34 + 10 * Math.sin(t * 14)], k);
        pose.cara = "risa";
      }
      x += 14 * bache(t, 2.95) - 18 * bache(t, 3.3);
      giro = 0.06 * bache(t, 2.95) - 0.07 * bache(t, 3.3);
      if (t > 2.95 && t < 3.6) pose.cara = "sorpresa";
      // ¡que me tapas! se asoma por un lado
      if (t > 4.15 && t < 6.25) {
        const k = eInOut(tramo(t, 4.15, 4.45));
        giro = -0.14 * k; pose.rc = -0.1 * k;
        pose.cara = t < 4.6 ? "sorpresa" : "risa";
        pose.manoI = mezcla([9, 160], [-12, 40], k);
      }
      // salta justo cuando dispara la foto
      if (t >= 6.25) {
        const u = tramo(t, 6.3, FLASH);
        const agacha = tramo(t, 6.25, 6.32) * (1 - tramo(t, 6.32, 6.38));
        sy = 1 - 0.12 * agacha;
        y = PIES - 150 * eOut(u);
        giro = lerp(-0.14, 0.04, eOut(u));
        pose.cara = "risa"; pose.manoD = [92, 26]; pose.manoI = [-14, 26];
        pose.piernaI = [-8 * eOut(u), 0.12 * u]; pose.piernaD = [-8 * eOut(u), -0.12 * u];
      }
      res.push({ x, y, esc: ESC, giro, sx, sy, pose });
    }
    // C4 · pelo de punta (por la derecha); parpadea en el peor momento
    {
      const e = entra(1150, 668, 1.65), pose = base(); pose.puntas = 0.8;
      const dx = -18 * bache(t, 3.3) + 22 * bache(t, 3.7, 0.35);
      if (e.anda) { pose.piernaI = e.anda.piernaI; pose.piernaD = e.anda.piernaD; }
      if (t > 3.25 && t < 3.6) pose.cara = "guino";
      if (t > 3.7 && t < 4.1) pose.cara = "sorpresa";
      if (t > 4.4) { pose.manoD = [104, 60]; pose.cara = t > 6.45 ? "dormido" : "sonrisa"; }
      res.push({ x: e.x + dx, y: PIES + (e.anda ? e.anda.bote : 0), esc: ESC, giro: -0.08 * bache(t, 3.3) + 0.1 * bache(t, 3.7, 0.35), pose });
    }
    // C3 · el de mala cara (por la derecha): se cuela delante
    {
      const e = entra(1150, 820, 2.0), pose = base(); pose.cara = "borracho";
      let x = e.x, y = PIES + (e.anda ? e.anda.bote : 0), esc = ESC;
      if (e.anda) { pose.piernaI = e.anda.piernaI; pose.piernaD = e.anda.piernaD; }
      const k = eInOut(tramo(t, 3.65, 4.25));
      if (k > 0) {
        x = lerp(820, 562, k); y = PIES + 78 * k - 30 * Math.sin(Math.PI * k); esc = lerp(ESC, 1.62, k);
        if (k < 1) { const a = andar(t * 11, 0.9); pose.piernaI = a.piernaI; pose.piernaD = a.piernaD; }
        pose.cara = k < 1 ? "guino" : "borracho";
        pose.manoD = mezcla([70, 158], [96, 130], k); pose.manoI = mezcla([9, 160], [-16, 128], k);
      }
      res.push({ x, y, esc, giro: 0, pose });
    }
    return res;
  }
  dibujarFondo(g, t) {
    fondo(g, "#000");
    // fondo de estudio: degradado y luz
    const a = tramo(t, 0, 0.5);
    g.save(); g.globalAlpha = a;
    const gr = g.createLinearGradient(0, 0, 0, H);
    gr.addColorStop(0, "#14101c"); gr.addColorStop(1, "#2a2236");
    g.fillStyle = gr; g.fillRect(-60, -60, W + 120, H + 120);
    g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.22 * a;
    g.drawImage(BLOB.blanco, 60, 120, 900, 560);
    g.globalCompositeOperation = "source-over"; g.globalAlpha = 0.45 * a;
    g.drawImage(BLOB.humo, 80, PIES - 30, 860, 70);
    g.restore();
  }
  dibujarGrupo(g, t) {
    for (const o of this.grupo(t)) {
      if (o.x < -100 || o.x > W + 100) continue;
      pintarAvatar(g, matAv(o.x, o.y, o.esc, o.giro || 0, o.sx || 1, o.sy || 1), o.pose, t);
    }
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    this.una("e1", t > 2.95, () => temblar(5, 0.15));
    this.una("e2", t > 3.3, () => temblar(5, 0.15));
    this.una("cuela", t > 3.75, () => temblar(6, 0.15));
    this.una("flash", t > FLASH, () => {
      // la foto: se pinta la escena una vez en un lienzo aparte
      this.snap = lienzoNuevo(W, H);
      const s = this.snap.getContext("2d");
      this.dibujarFondo(s, t); this.dibujarGrupo(s, FLASH);
      this.flash = 1; temblar(8, 0.25);
    });
    this.una("cae", t > 7.25, () => {
      for (let i = 0; i < 12; i++) p.nueva(P.DESTELLO, azar(180, 840), azar(80, 470), 0, 0, azar(0.25, 0.45), azar(30, 60));
    });
    this.flash = Math.max(0, this.flash - dt * 1.8);
    p.actualizar(dt);
  }
  dibujar(g) {
    const t = this.t;
    if (!this.snap) {
      this.dibujarFondo(g, t);
      this.dibujarGrupo(g, t);
      // visor de la cámara
      const aV = tramo(t, 1.25, 1.5);
      if (aV > 0) {
        g.save(); g.globalAlpha = aV * 0.85; g.strokeStyle = "#fffdf5"; g.lineWidth = 4;
        const m = 26, L = 46;
        for (const [x, y, sx, sy] of [[m, m, 1, 1], [W - m, m, -1, 1], [m, H - m, 1, -1], [W - m, H - m, -1, -1]]) {
          g.beginPath(); g.moveTo(x, y + sy * L); g.lineTo(x, y); g.lineTo(x + sx * L, y); g.stroke();
        }
        const parp = t > 4.9 ? (Math.sin(t * 18) > 0 ? 1 : 0.25) : 1;
        g.fillStyle = `rgba(255,50,60,${parp})`; g.beginPath(); g.arc(W - 120, 60, 9, 0, 6.283); g.fill();
        txt(g, "FOTO", W - 70, 67, { tam: 20, peso: 800, color: "#fffdf5", esp: 2 });
        g.restore();
      }
      // ¡FOTO! (llama a los clones)
      if (t > 1.3 && t < 2.5) {
        const o = this.grupo(t)[2], q = aPant(matAv(o.x, o.y, o.esc), [39, -8]);
        bocadillo(g, q[0] - 110, q[1] - 40, "¡VENID, FOTO!", q[0] - 20, q[1], tramo(t, 1.3, 1.5) * (1 - tramo(t, 2.3, 2.5)), 32);
      }
      // empujones
      if (t > 2.95 && t < 3.6) txt(g, "¡EH!", 430, 225, { tam: 52, peso: 400, fam: FC, color: "#fff", borde: "#111", bordeAncho: 7, alfa: 1 - tramo(t, 3.4, 3.6) });
      if (t > 3.75 && t < 4.4) txt(g, "¡OYE!", 640, 205, { tam: 52, peso: 400, fam: FC, color: "#fff", borde: "#111", bordeAncho: 7, alfa: 1 - tramo(t, 4.2, 4.4) });
      // ¡SONREÍD!
      if (t > 4.45 && t < 5.0) {
        const k = tramo(t, 4.45, 4.6), s = lerp(2.4, 1, eOut(k));
        g.save(); g.translate(W / 2, 140); g.rotate(-0.04); g.scale(s, s);
        txt(g, "¡SONREÍD!", 0, 0, { tam: 120, peso: 400, fam: FC, color: "#ffd34d", borde: "#3a2400", bordeAncho: 11, esp: 3, alfa: Math.min(1, k * 4) * (1 - tramo(t, 4.85, 5.0)) });
        g.restore();
      }
      // cuenta atrás
      for (let i = 0; i < 3; i++) {
        const t0 = 5.0 + i * 0.55, k = tramo(t, t0, t0 + 0.14), a = Math.min(1, k * 3) * (1 - tramo(t, t0 + 0.42, t0 + 0.54));
        if (a <= 0) continue;
        const s = lerp(1.8, 1, eOut(k)), sp = this.nums[i];
        g.save(); g.globalAlpha = a; g.translate(W / 2, 125); g.scale(s, s); g.drawImage(sp, -sp.width / 2, -sp.height / 2); g.restore();
      }
    } else {
      // la imagen congelada se convierte en una foto
      fondo(g, "#000");
      const k = eInOut(tramo(t, FLASH + 0.35, FLASH + 0.95));
      const s = lerp(1, 0.72, k), rot = lerp(0, -0.045, k) + 0.03 * Math.sin(Math.max(0, t - FLASH - 0.95) * 8) * Math.exp(-Math.max(0, t - FLASH - 0.95) * 4);
      const sale = eIn(tramo(t, 9.35, 10.0));
      const cy = H / 2 - 18 * k + sale * 780;
      const borde = 18 * k, pie = 62 * k;
      g.save(); g.translate(W / 2, cy); g.rotate(rot + sale * 0.25); g.scale(s, s);
      g.shadowColor = "rgba(0,0,0,.7)"; g.shadowBlur = 30 * k; g.shadowOffsetY = 12 * k;
      g.fillStyle = "#f4f0e6"; g.fillRect(-W / 2 - borde, -H / 2 - borde, W + 2 * borde, H + borde + pie);
      g.shadowColor = "transparent"; g.shadowBlur = 0; g.shadowOffsetY = 0;
      g.drawImage(this.snap, -W / 2, -H / 2);
      if (k > 0.5) txt(g, "¡SONREÍD!", 0, H / 2 + pie * 0.72, { tam: 46, peso: 400, fam: FB, color: "#1f3f9a", alfa: tramo(k, 0.5, 1) });
      g.restore();
      this.p.dibujar(g);
    }
    if (this.flash > 0) { g.fillStyle = `rgba(255,255,250,${Math.min(1, this.flash * 1.3)})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00054", nombre: "Foto de grupo", crear: () => new EscenaGrupo() });
})();
