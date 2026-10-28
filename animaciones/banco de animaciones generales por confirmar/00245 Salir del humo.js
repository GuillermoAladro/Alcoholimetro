"use strict";
/*
 * 00245 · SALIR DEL HUMO
 *
 * Animación del banco. Empieza y acaba en negro.
 * Un pasillo se ha llenado de humo de dibujos (nubes grises arriba). Marcos, de bombero y con la linterna, coge de la
 * mano a Guillermo: ¡POR AQUÍ! Se agachan por debajo del humo y avanzan con calma siguiendo las flechas verdes que
 * ilumina la linterna, hasta una puerta con el cartel de SALIDA. Marcos la abre: entra la luz cálida del bar, se
 * ponen de pie y sonríen. Tranquilo, sin sustos.
 */
(() => {
const CT = cacheTexto();
const ESC = 1.4, SY = 0.78;                                  // agachados
const XM0 = 610, XG0 = 400, XM1 = 770, XG1 = 588;            // en pantalla
const AVANCE = 1180;                                         // lo que se desplaza el pasillo
const PUERTA = 2080, FLECHAS = [960, 1330, 1700];            // mundo
const T_COGE = 0.9, T_AGACHA = 1.6, T_ANDA = 2.2, T_PARA = 6.5, T_ABRE = 6.75, T_ENTRAN = 7.25, T_DEPIE = 7.7,
  T_FIN = 9.4, DUR = 9.9;
const enAv = (m, q) => { const p = m.inverse().transformPoint(new DOMPoint(q[0], q[1])); return [p.x, p.y]; };

function rotulo() {
  if (CT.has("t")) return CT.get("t");
  const c = lienzoNuevo(760, 200), g = c.getContext("2d");
  const gr = g.createLinearGradient(0, 40, 0, 160);
  gr.addColorStop(0, "#f2fff6"); gr.addColorStop(0.5, "#9dffb8"); gr.addColorStop(1, "#2bd85b");
  txt(g, "¡POR AQUÍ!", 386, 156, { tam: 134, peso: 900, fam: FD, color: "#02200c", esp: 6, max: 720 });
  txt(g, "¡POR AQUÍ!", 380, 150, { tam: 134, peso: 900, fam: FD, color: gr, borde: "#03230c", bordeAncho: 12, esp: 6, glow: "rgba(43,255,91,.7)", glowTam: 22, max: 720 });
  CT.set("t", c);
  return c;
}
/** Linterna en la mano (unidades de avatar), apuntando ang. */
function linterna(g, x, y, ang) {
  g.save(); g.translate(x, y); g.rotate(ang);
  g.fillStyle = "#26282c"; rectR(g, -12, -5, 24, 10, 3); g.fill();
  g.fillStyle = "#f2c21b"; g.beginPath(); g.moveTo(10, -6); g.lineTo(20, -9); g.lineTo(20, 9); g.lineTo(10, 6); g.closePath(); g.fill();
  g.fillStyle = "#fffbe0"; g.beginPath(); g.ellipse(20, 0, 2.5, 8, 0, 0, 6.283); g.fill();
  g.restore();
}
/** Cartel de flecha verde (diseño propio). */
function flecha(g, x, y, s, luz) {
  g.save(); g.translate(x, y); g.scale(s, s);
  if (luz > 0.05) { g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.5 * luz; g.drawImage(BLOB.verde, -80, -60, 160, 120); g.restore(); }
  g.fillStyle = luz > 0.3 ? "#1fd85a" : "#1a8a3a"; rectR(g, -52, -26, 104, 52, 8); g.fill();
  g.strokeStyle = "#e8fff0"; g.lineWidth = 3; g.stroke();
  g.fillStyle = "#ffffff";
  g.beginPath(); g.moveTo(-30, -7); g.lineTo(8, -7); g.lineTo(8, -17); g.lineTo(32, 0); g.lineTo(8, 17); g.lineTo(8, 7); g.lineTo(-30, 7); g.closePath(); g.fill();
  g.restore();
}

class SalirDelHumo extends Escena {
  constructor() {
    super(DUR);
    this.p = new Parts(220);
    const r = semilla(12);
    // bocanadas de humo de dibujos (mundo): x, y, radio, fase
    this.humo = [];
    for (let i = 0; i < 60; i++) this.humo.push({ x: -200 + i * 48 + r() * 40, y: 10 + r() * 196, r: 52 + r() * 42, f: r() * 6 });
  }
  cx() { return AVANCE * eInOut(tramo(this.t, T_ANDA, T_PARA)) * 0.12 + AVANCE * tramo(this.t, T_ANDA, T_PARA) * 0.88; }
  abierta() { return eInOut(tramo(this.t, T_ABRE, T_ABRE + 0.45)); }
  poses() {
    const t = this.t, cx = this.cx();
    const M = { quien: "bombero", cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [80, 120], manoI: [6, 152] };
    const G = { cara: "sorpresa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [70, 158], manoI: [9, 160] };
    let xm = XM0, xg = XG0, syM = SY, syG = 1, dyM = 0, dyG = 0;
    // ---- al principio: Guillermo de pie, mira el humo; Marcos, ya agachado, le tiende la mano
    if (t < T_AGACHA) { G.rc = -0.12 + 0.06 * Math.sin(t * 2); G.cara = "sorpresa"; G.manoI = [-6, 120]; }
    M.cara = t > T_COGE - 0.3 ? "guino" : "sonrisa"; M.rc = -0.12;
    // Guillermo se agacha (tranquilo)
    const kA = eInOut(tramo(t, T_AGACHA, T_AGACHA + 0.5));
    syG = lerp(1, SY, kA);
    if (t > T_AGACHA) { G.cara = "sonrisa"; G.rc = 0.06; }
    // andan agachados, despacito
    const anda = t > T_ANDA && t < T_PARA;
    if (anda) {
      const a = andar((t - T_ANDA) * 8.5, 0.7), b = andar((t - T_ANDA) * 8.5 + 1.6, 0.7);
      M.piernaI = a.piernaI; M.piernaD = a.piernaD; dyM = a.bote * 0.6; G.piernaI = b.piernaI; G.piernaD = b.piernaD; dyG = b.bote * 0.6;
      M.cara = "sonrisa"; G.cara = Math.sin(t * 0.9) > 0.6 ? "guino" : "sonrisa";
      M.rc = -0.04 * Math.sin(t * 1.3); G.rc = 0.05;
    }
    // hasta la puerta
    if (t > T_ENTRAN - 0.35) {
      const u = tramo(t, T_ENTRAN - 0.35, T_DEPIE), a = andar((t - T_ENTRAN) * 8.5, 0.7 * (u < 1 ? 1 : 0)), b = andar((t - T_ENTRAN) * 8.5 + 1.6, 0.7 * (u < 1 ? 1 : 0));
      xm = lerp(XM0, XM1, eInOut(u)); xg = lerp(XG0, XG1, eInOut(u));
      M.piernaI = a.piernaI; M.piernaD = a.piernaD; G.piernaI = b.piernaI; G.piernaD = b.piernaD;
    }
    // de pie, a la luz
    const kP = eInOut(tramo(t, T_DEPIE, T_DEPIE + 0.5));
    if (t > T_DEPIE) {
      syM = lerp(SY, 1, kP); syG = lerp(SY, 1, kP);
      M.cara = "risa"; G.cara = "risa"; M.rc = -0.1; G.rc = 0.1;
    }
    // la linterna, con la mano derecha, apunta adelante y abajo
    const angL = t > T_ABRE - 0.2 ? lerp(0.35, 0.9, eInOut(tramo(t, T_ABRE - 0.2, T_ABRE + 0.2))) : 0.35 + 0.06 * Math.sin(t * 1.4);
    this.angL = angL;
    const mM = matAv(xm, PIES + dyM, ESC, 0, 1, syM), mG = matAv(xg, PIES + dyG, ESC, 0, 1, syG);
    if (t > T_ABRE - 0.3 && t < T_ABRE + 0.5) {
      // abre la puerta con la mano derecha
      const k = Math.sin(tramo(t, T_ABRE - 0.3, T_ABRE + 0.5) * Math.PI);
      M.manoD = mezcla([80, 120], [104, 110], k);
    }
    if (t > T_DEPIE + 0.5) { M.manoD = [84, 64 + 3 * Math.sin(t * 6)]; }      // pulgar arriba
    M.objD = (g, mano) => { if (t < T_DEPIE + 0.4) linterna(g, mano[0], mano[1], angL); };
    // de la mano: la izquierda de Marcos con la derecha de Guillermo
    const kM = eInOut(tramo(t, T_COGE - 0.3, T_COGE + 0.2)), suelta = eInOut(tramo(t, T_DEPIE + 0.3, T_DEPIE + 0.7));
    if (kM > 0) {
      const mM0 = aPant(mM, [6, 152]), mG0 = aPant(mG, [70, 158]);
      const P0 = [lerp(mM0[0], mG0[0], 0.5) + 4, Math.max(mM0[1], mG0[1]) - 18];
      M.manoI = mezcla([6, 152], enAv(mM, [P0[0] + 6, P0[1]]), kM * (1 - suelta));
      G.manoD = mezcla([70, 158], enAv(mG, [P0[0] - 6, P0[1]]), kM * (1 - suelta));
      if (t < T_AGACHA) G.manoD = mezcla([70, 158], enAv(mG, [P0[0] - 6, P0[1]]), kM);
    }
    if (t > T_DEPIE + 0.6) { G.manoD = [52, 112]; G.manoI = [26, 112]; G.brazoIDelante = true; G.cara = "risa"; }   // aplaude bajito
    return { M, G, mM, mG, cx, xm, xg };
  }

  actualizar(dt) {
    const t = (this.t += dt), p = this.p, e = this.poses();
    // polvo dorado en la luz de la puerta
    if (this.abierta() > 0.3 && Math.random() < 14 * dt) {
      const px = PUERTA - e.cx;
      p.nueva(P.PURPURINA, px + azar(-80, 200), azar(160, 520), azar(-20, 20), azar(-10, 10), azar(1.4, 2.2), azar(8, 13));
    }
    p.actualizar(dt);
  }

  pasillo(g, cx, t) {
    // pared: lienzo de 2 pantallas que se repite
    if (!this.cP) {
      const c = lienzoNuevo(1024, H), k = c.getContext("2d");
      const gp = k.createLinearGradient(0, 0, 0, PIES);
      gp.addColorStop(0, "#2a2a34"); gp.addColorStop(1, "#4a4440");
      k.fillStyle = gp; k.fillRect(0, 0, 1024, H);
      k.fillStyle = "rgba(0,0,0,.18)"; for (let x = 0; x < 1024; x += 128) k.fillRect(x, 0, 4, PIES);
      // zócalo
      k.fillStyle = "#3a2a20"; k.fillRect(0, 440, 1024, 135);
      k.fillStyle = "rgba(255,220,170,.12)"; k.fillRect(0, 440, 1024, 3);
      // suelo
      const gs = k.createLinearGradient(0, PIES, 0, H);
      gs.addColorStop(0, "#2a2420"); gs.addColorStop(1, "#140f0c");
      k.fillStyle = gs; k.fillRect(0, PIES - 4, 1024, H);
      this.cP = c;
    }
    const off = ((cx % 1024) + 1024) % 1024;
    g.drawImage(this.cP, -off - 60, 0); g.drawImage(this.cP, -off + 1024 - 60, 0); g.drawImage(this.cP, -off + 2048 - 60, 0);
    // flechas del suelo
    for (let x = 300; x < 2200; x += 180) {
      const sx = x - cx;
      if (sx < -80 || sx > W + 80) continue;
      g.fillStyle = "rgba(60,200,110,.35)";
      g.beginPath(); g.moveTo(sx - 20, PIES + 8); g.lineTo(sx + 4, PIES + 8); g.lineTo(sx + 18, PIES + 15); g.lineTo(sx + 4, PIES + 22); g.lineTo(sx - 20, PIES + 22); g.lineTo(sx - 6, PIES + 15); g.closePath(); g.fill();
    }
  }
  puerta(g, cx, t) {
    const x = PUERTA - cx, ab = this.abierta();
    if (x < -300 || x > W + 300) return;
    const w = 140, h = 250, y0 = PIES - h;
    // marco
    g.fillStyle = "#1b1410"; g.fillRect(x - w / 2 - 14, y0 - 14, w + 28, h + 14);
    // el bar al otro lado (luz cálida)
    const gl = g.createLinearGradient(0, y0, 0, PIES);
    gl.addColorStop(0, "#ffe6a0"); gl.addColorStop(1, "#ffb84a");
    g.fillStyle = gl; g.fillRect(x - w / 2, y0, w, h);
    g.fillStyle = "rgba(140,70,20,.35)"; for (let i = 0; i < 5; i++) g.fillRect(x - w / 2 + 14 + i * 24, y0 + 60, 12, 34);
    g.fillStyle = "rgba(120,60,20,.5)"; g.fillRect(x - w / 2, y0 + 150, w, 14);
    // hoja de la puerta (se abre hacia dentro)
    const hw = w * (1 - ab);
    if (hw > 1) {
      const gd = g.createLinearGradient(x - w / 2, 0, x - w / 2 + hw, 0);
      gd.addColorStop(0, "#6a4426"); gd.addColorStop(1, "#4a2a14");
      g.fillStyle = gd; g.fillRect(x - w / 2, y0, hw, h);
      g.fillStyle = "#c9a040"; g.beginPath(); g.arc(x - w / 2 + hw - 14, y0 + 130, 5, 0, 6.283); g.fill();
      g.strokeStyle = "rgba(0,0,0,.3)"; g.lineWidth = 2; g.strokeRect(x - w / 2 + 12, y0 + 16, Math.max(0, hw - 24), 90); g.strokeRect(x - w / 2 + 12, y0 + 126, Math.max(0, hw - 24), 108);
    }
    // cartel de SALIDA encima (verde, encendido)
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.6; g.drawImage(BLOB.verde, x - 110, y0 - 90, 220, 110); g.restore();
    g.fillStyle = "#14a84a"; rectR(g, x - 78, y0 - 66, 156, 44, 6); g.fill();
    g.strokeStyle = "#e8fff0"; g.lineWidth = 3; g.stroke();
    txt(g, "SALIDA", x - 8, y0 - 33, { tam: 30, peso: 900, fam: FD, color: "#ffffff", esp: 5 });
    g.fillStyle = "#fff"; g.beginPath(); g.moveTo(x + 50, y0 - 52); g.lineTo(x + 66, y0 - 44); g.lineTo(x + 50, y0 - 36); g.closePath(); g.fill();
    // la luz sale por la puerta
    if (ab > 0.02) {
      g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.5 * ab;
      g.fillStyle = "#ffcf7a";
      g.beginPath(); g.moveTo(x - w / 2, y0); g.lineTo(x + w / 2, y0); g.lineTo(x + w / 2 - 20, PIES); g.lineTo(x - w / 2 - 420, PIES + 30); g.closePath(); g.fill();
      g.drawImage(BLOB2.oro, x - 300, y0 - 60, 600, 420);
      g.restore();
    }
  }
  nubes(g, cx, t, ab) {
    // humo de dibujos: se pinta opaco en un lienzo aparte (las bocanadas se funden en una sola nube) y se copia
    // con transparencia. Al abrir la puerta sube y se aclara.
    // (a media resolución: en la Pi cuesta 4 veces menos y en el humo no se nota)
    if (!this.cH) { this.cH = lienzoNuevo((W + 120) / 2, 210); }
    const c = this.cH, k = c.getContext("2d");
    k.setTransform(1, 0, 0, 1, 0, 0); k.clearRect(0, 0, c.width, c.height); k.setTransform(0.5, 0, 0, 0.5, 0, 0);
    const pos = (b) => {
      const sx = b.x - cx * 0.9 + 14 * Math.sin(t * 0.5 + b.f) + 60;
      const ret = ab * (0.55 + 0.45 * clamp(1 - (PUERTA - cx - (sx - 60)) / 700, 0, 1));
      return [sx, b.y + 6 * Math.sin(t * 0.8 + b.f) - 170 * ret];
    };
    k.fillStyle = "#7c7c88";
    for (const b of this.humo) { const [x, y] = pos(b); if (x < -180 || x > W + 300) continue; k.beginPath(); k.arc(x, y, b.r, 0, 6.283); k.fill(); }
    k.fillStyle = "#9a9aa6";
    for (const b of this.humo) { const [x, y] = pos(b); if (x < -180 || x > W + 300) continue; k.beginPath(); k.arc(x - b.r * 0.18, y - b.r * 0.22, b.r * 0.72, 0, 6.283); k.fill(); }
    k.fillStyle = "#b4b4c0";
    for (const b of this.humo) { const [x, y] = pos(b); if (x < -180 || x > W + 300) continue; k.beginPath(); k.arc(x - b.r * 0.32, y - b.r * 0.38, b.r * 0.34, 0, 6.283); k.fill(); }
    g.save(); g.globalAlpha = 0.92 * (1 - 0.75 * ab); g.drawImage(c, -60, 0, W + 120, 420); g.restore();
    // bruma suave por debajo del humo
    const gb = g.createLinearGradient(0, 230, 0, 380);
    gb.addColorStop(0, `rgba(110,110,122,${0.5 * (1 - ab)})`); gb.addColorStop(1, "rgba(110,110,122,0)");
    g.fillStyle = gb; g.fillRect(-60, 230, W + 120, 150);
  }

  dibujar(g) {
    const t = this.t, e = this.poses(), cx = e.cx, ab = this.abierta();
    fondo(g, "#000");
    this.pasillo(g, cx, t);
    // haz de la linterna (antes que las flechas, para iluminarlas)
    const mano = e.M._manoD || e.M.manoD, a = this.angL;
    const L = aPant(e.mM, [mano[0] + Math.cos(a) * 20, mano[1] + Math.sin(a) * 20]);
    const lin = t < T_DEPIE + 0.4 ? 1 - tramo(t, T_DEPIE, T_DEPIE + 0.4) : 0;
    const dir = Math.atan2(Math.sin(a) * SY, Math.cos(a));
    const fin = [L[0] + Math.cos(dir) * 360, L[1] + Math.sin(dir) * 360];
    // flechas de la pared (se encienden con la luz)
    for (const fx of FLECHAS) {
      const sx = fx - cx;
      if (sx < -100 || sx > W + 100) continue;
      const luz = lin * clamp(1 - Math.abs(sx - (L[0] + 200)) / 220, 0, 1);
      flecha(g, sx, 470, 0.9, luz);
    }
    this.puerta(g, cx, t);
    if (lin > 0) {
      g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.28 * lin;
      const n = [-Math.sin(dir), Math.cos(dir)];
      g.fillStyle = "#fff3c0";
      g.beginPath(); g.moveTo(L[0] + n[0] * 6, L[1] + n[1] * 6); g.lineTo(L[0] - n[0] * 6, L[1] - n[1] * 6);
      g.lineTo(fin[0] - n[0] * 90, fin[1] - n[1] * 90); g.lineTo(fin[0] + n[0] * 90, fin[1] + n[1] * 90); g.closePath(); g.fill();
      g.globalAlpha = 0.35 * lin; g.drawImage(BLOB.amarillo, fin[0] - 110, fin[1] - 70, 220, 140);
      g.restore();
    }
    pintarAvatar(g, e.mG, e.G, t);
    pintarAvatar(g, e.mM, e.M, t);
    this.nubes(g, cx, t, ab);
    // al abrir la puerta, todo se ilumina un poco
    if (ab > 0) { g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.18 * ab; g.fillStyle = "#ffb84a"; g.fillRect(-60, -60, W + 120, H + 120); g.restore(); }
    this.p.dibujar(g);
    // ¡POR AQUÍ! (al cogerle de la mano y al abrir la puerta)
    const tit = (t0, t1, y) => {
      if (t < t0 || t > t1) return;
      const d = t - t0, k = tramo(d, 0, 0.2), s = lerp(1.5, 1, eOut(k)), sal = tramo(t, t1 - 0.3, t1);
      const r = rotulo();
      g.save(); g.globalAlpha = Math.min(1, k * 2) * (1 - sal); g.translate(512, y); g.scale(s, s);
      g.drawImage(r, -r.width / 2, -r.height / 2); g.restore();
    };
    tit(T_COGE - 0.2, T_ANDA + 1.4, 110);
    tit(T_ABRE + 0.2, DUR, 110);
    const a2 = Math.max(1 - tramo(t, 0.02, 0.6), tramo(t, T_FIN, DUR - 0.03));
    if (a2 > 0) { g.fillStyle = `rgba(0,0,0,${a2})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00245", nombre: "Salir del humo", crear: () => new SalirDelHumo() });
})();
