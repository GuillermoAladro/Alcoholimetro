"use strict";
/*
 * 00043 · EL PINTOR
 *
 * Animación del banco. Empieza y acaba en negro.
 * Se abre el telón: con boina, paleta y pincel, junto a un caballete con el lienzo en blanco. Pinta a toda velocidad
 * (el pincel echa chispas de pintura) y se ve aparecer una jarra de cerveza trazo a trazo; la firma. Se aparta y la
 * enseña orgulloso: OBRA MAESTRA. Entonces la jarra del cuadro se vuelca y la cerveza se sale del lienzo, chorrea por
 * el caballete y le moja los pies. El cartel se tuerce. Se cierra el telón.
 */
(() => {
const ESC = 1.5;
const SC = 1.25, CX = 510, CY = 168, CW = 200 * SC, CH = 160 * SC; // lienzo en pantalla
const T0 = 1.35, DT = 0.2;                    // trazos: empiezan en T0, uno cada DT
const T_VUELCA = 6.5;
// trazos del cuadro (coordenadas del lienzo, 200 × 160). capa 0 = fondo, 1 = jarra
const TRAZOS = [
  { capa: 0, c: "#4f7fd9", w: 26, p: [[6, 14], [194, 16], [192, 40], [8, 38], [8, 62], [194, 64], [192, 88], [8, 86], [8, 98], [194, 98]] },
  { capa: 0, c: "#7a4a24", w: 24, p: [[4, 114], [196, 116], [196, 134], [4, 132], [4, 152], [196, 154]] },
  { capa: 0, c: "#3d2410", w: 5, p: [[2, 104], [198, 104]] },
  { capa: 0, c: "#ffe27a", w: 9, p: [[160, 22], [170, 18], [176, 28], [166, 34], [158, 28], [164, 24]] },
  { capa: 1, c: "#f0a020", w: 22, p: [[79, 60], [79, 128], [96, 128], [96, 58], [113, 58], [113, 128]] },
  { capa: 1, c: "#c9700c", w: 8, p: [[119, 60], [119, 129]] },
  { capa: 1, c: "#ffd34d", w: 7, p: [[80, 66], [81, 122]] },
  { capa: 1, c: "#3b1d08", w: 12, p: [[124, 70], [142, 72], [147, 94], [141, 114], [124, 116]] },
  { capa: 1, c: "#e8f2fa", w: 6, p: [[124, 70], [142, 72], [147, 94], [141, 114], [124, 116]] },
  { capa: 1, c: "#fffaf0", w: 17, p: [[66, 54], [80, 45], [95, 52], [110, 43], [126, 52], [120, 60], [96, 60], [72, 60]] },
  { capa: 1, c: "#3b1d08", w: 3.5, p: [[68, 50], [68, 133], [124, 133], [124, 54]] },
  { capa: 1, c: "#fff6dc", w: 2.6, puntos: true, p: [[100, 108], [106, 92], [90, 84], [104, 72], [88, 114], [110, 120]] },
  { capa: 0, c: "#151515", w: 2.6, p: [[176, 138], [170, 134], [165, 140], [169, 148], [177, 146], [177, 141], [172, 141], [181, 148], [186, 147]] },
];
for (const s of TRAZOS) { s.L = 0; for (let i = 1; i < s.p.length; i++) s.L += Math.hypot(s.p[i][0] - s.p[i - 1][0], s.p[i][1] - s.p[i - 1][1]); }
const T_FIRMA = T0 + DT * (TRAZOS.length - 1);

class Pintor extends Escena {
  constructor() {
    super(10.3);
    this.p = new Parts(360);
    this.capas = [lienzoNuevo(400, 320), lienzoNuevo(400, 320)];
    this.hechos = 0;
    this.gotas = []; // salpicaduras de pintura del pincel al lienzo
    this.zas = [];
    this.telon = telonMitad();
    this.fase = 0;
  }
  xEn(t) {
    if (t < 1.0) return 330;
    if (t < 1.35) return lerp(330, 425, eInOut(tramo(t, 1.0, 1.35)));
    if (t < 4.3) return 425;
    if (t < 4.75) return lerp(425, 300, eInOut(tramo(t, 4.3, 4.75)));
    return 300;
  }
  aAv(q, x) { return [(q[0] - x) / ESC + 39, 232 - (PIES - q[1]) / ESC]; }
  trazoActual() { const i = Math.floor((this.t - T0) / DT); return i >= 0 && i < TRAZOS.length ? i : -1; }
  /** Punto del trazo i a la fracción k (coordenadas de pantalla). */
  puntoTrazo(i, k) {
    const s = TRAZOS[i]; let d = s.L * clamp(k, 0, 1);
    for (let j = 1; j < s.p.length; j++) {
      const a = s.p[j - 1], b = s.p[j], l = Math.hypot(b[0] - a[0], b[1] - a[1]);
      if (d <= l || j === s.p.length - 1) { const u = l ? Math.min(1, d / l) : 0; return [CX + SC * lerp(a[0], b[0], u), CY + SC * lerp(a[1], b[1], u)]; }
      d -= l;
    }
    return [CX, CY];
  }
  estado() {
    const t = this.t, x = this.xEn(t);
    const pose = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0] };
    let manoD = [74, 150], manoI = [-12, 140], bAng = 0.35, dy = 0, color = "#3b1d08";
    if (t < 1.0) { pose.cara = t > 0.55 ? "guino" : "sonrisa"; manoD = [76, 140]; }
    const anda = (t > 1.0 && t < 1.35) || (t > 4.3 && t < 4.75);
    if (anda) { const a = andar(this.fase, 0.8); pose.piernaI = a.piernaI; pose.piernaD = a.piernaD; dy = a.bote; }
    // a toda velocidad: el pincel va y viene junto al lienzo
    const i = this.trazoActual();
    if (t >= 1.2 && t < T_FIRMA + DT + 0.05) {
      const k = tramo(t, 1.2, 1.4);
      const tip = [CX + 8 + 26 * Math.sin(t * 31), CY + 80 + 62 * Math.sin(t * 13.7)];
      if (i === TRAZOS.length - 1) { const q = this.puntoTrazo(i, (t - T0 - DT * i) / DT); tip[0] = CX + 30 + (q[0] - CX) * 0.25; tip[1] = q[1]; }
      const hand = this.aAv([tip[0] - 26, tip[1] + 34], x);
      manoD = mezcla([74, 150], hand, eOut(k));
      bAng = 0.75 + 0.25 * Math.sin(t * 23);
      pose.cara = Math.sin(t * 5) > 0.6 ? "risa" : "guino";
      pose.rc = 0.05 * Math.sin(t * 17);
      manoI = [-14 + 3 * Math.sin(t * 9), 136];
      if (i >= 0) color = TRAZOS[i].c;
    }
    // se aparta y lo enseña orgulloso
    if (t >= 4.3 && t < T_VUELCA) {
      const k = eInOut(tramo(t, 4.7, 5.0));
      manoD = mezcla([74, 150], [126, 104], k); bAng = lerp(0.35, 1.2, k);
      manoI = mezcla([-12, 140], [-20, 124], k);
      pose.cara = t < 4.75 ? "sonrisa" : "risa";
      pose.rc = 0.06 * k;
    }
    // ¡se vuelca!
    if (t >= T_VUELCA) {
      const k = eOut(tramo(t, T_VUELCA + 0.1, T_VUELCA + 0.35));
      pose.cara = t < 7.25 ? "sorpresa" : t < 8.0 ? "sorpresa" : t < 8.6 ? "borracho" : "guino";
      manoD = mezcla([126, 104], [92, 30], k); manoI = mezcla([-20, 124], [-14, 34], k);
      bAng = 0.3;
      if (t > 7.3 && t < 8.1) { const sal = Math.max(0, Math.sin((t - 7.3) * 11)); pose.piernaD = [-12 * sal, -0.15 * sal]; pose.piernaI = [-12 * Math.max(0, -Math.sin((t - 7.3) * 11)), 0.15 * Math.max(0, -Math.sin((t - 7.3) * 11))]; }
      if (t > 8.1) { const v = eInOut(tramo(t, 8.1, 8.45)); manoD = mezcla([92, 30], [98, 112], v); manoI = mezcla([-14, 34], [-22, 112], v); pose.rc = 0.12 * v; }
    }
    pose.manoD = manoD; pose.manoI = manoI;
    pose.objD = (g, m) => { boina(g, pose.rc); pincel(g, m, bAng, color); };
    pose.objI = (g, m) => paleta(g, m);
    const mm = matAv(x, PIES + dy, ESC);
    const tipA = [manoD[0] + Math.sin(bAng) * 34, manoD[1] - Math.cos(bAng) * 34];
    return { pose, m: mm, x, tip: aPant(mm, tipA), trazo: i };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    if ((t > 1.0 && t < 1.35) || (t > 4.3 && t < 4.75)) this.fase += dt * 10;
    const e = this.estado();
    // trazos terminados → a su capa
    while (this.hechos < TRAZOS.length && t >= T0 + DT * (this.hechos + 1)) {
      const s = TRAZOS[this.hechos], g = this.capas[s.capa].getContext("2d");
      g.save(); g.scale(2, 2); trazo(g, s, 1); g.restore();
      this.hechos++;
    }
    // salpicaduras del pincel hacia el trazo que se está pintando
    if (e.trazo >= 0 && Math.random() < 34 * dt) {
      const k = (t - T0 - DT * e.trazo) / DT, q = this.puntoTrazo(e.trazo, k + azar(0, 0.25));
      this.gotas.push({ x0: e.tip[0], y0: e.tip[1], x1: q[0], y1: q[1], t0: t, c: TRAZOS[e.trazo].c });
    }
    this.gotas = this.gotas.filter((o) => t - o.t0 < 0.18);
    if (e.trazo >= 0 && Math.random() < 6 * dt) p.nueva(P.DESTELLO, e.tip[0], e.tip[1], 0, 0, 0.2, 26);
    for (const [k, tz] of [[0, 1.9], [1, 2.75], [2, 3.5]]) this.una("zas" + k, t > tz, () => this.zas.push({ t0: t, x: CX + azar(-60, 230), y: CY + azar(-50, 10), s: ["¡ZAS!", "¡FLIS!", "¡ZAS!"][k], r: azar(-0.25, 0.25) }));
    this.una("firma", t > T_FIRMA + DT * 0.8, () => { for (let k = 0; k < 14; k++) p.nueva(P.PURPURINA, CX + azar(0, CW), CY + azar(0, CH), azar(-30, 30), azar(-40, 10), azar(0.8, 1.4), azar(8, 14)); });
    this.una("obra", t > 5.0, () => {
      temblar(10, 0.3);
      for (let k = 0; k < 30; k++) { const a = azar(0, 6.283), v = azar(150, 420); p.nueva(P.CHISPA, W / 2 + azar(-250, 250), 95, Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.7), azar(7, 12)); }
    });
    // el chorro de cerveza
    if (t > T_VUELCA + 0.3 && t < 8.9) {
      const k = this.chorro();
      if (Math.random() < 30 * dt * k) p.nueva(P.GOTA, CX + CW + 14 + azar(-6, 6), azar(CY + 100, PIES - 20), azar(-30, 30), azar(0, 60), 0.3, azar(3, 5));
      if (Math.random() < 26 * dt * k) p.nueva(P.ESPUMA, CX + CW + 16 + azar(-14, 14), PIES - 6, azar(-160, 160), azar(-160, -40), azar(0.3, 0.6), azar(3, 7));
    }
    this.una("vuelca", t > T_VUELCA + 0.12, () => temblar(8, 0.25));
    p.actualizar(dt);
  }
  chorro() { const t = this.t; return tramo(t, T_VUELCA + 0.3, T_VUELCA + 0.5) * (1 - tramo(t, 8.4, 8.9)); }
  dibujarCaballete(g) {
    g.save(); g.lineCap = "round";
    g.strokeStyle = "#4a2e17"; g.lineWidth = 10;
    g.beginPath(); g.moveTo(CX + CW / 2 + 4, CY - 30); g.lineTo(CX + CW / 2 + 30, PIES - 8); g.stroke();
    const gp = g.createLinearGradient(CX, 0, CX + CW, 0);
    gp.addColorStop(0, "#8a5a32"); gp.addColorStop(0.5, "#b07a45"); gp.addColorStop(1, "#7a4c28");
    g.strokeStyle = gp; g.lineWidth = 13;
    g.beginPath(); g.moveTo(CX + CW / 2 - 6, CY - 40); g.lineTo(CX + 18, PIES); g.moveTo(CX + CW / 2 + 6, CY - 40); g.lineTo(CX + CW - 18, PIES); g.stroke();
    g.lineWidth = 9; g.beginPath(); g.moveTo(CX + 20, CY + CH + 70); g.lineTo(CX + CW - 20, CY + CH + 70); g.stroke();
    g.fillStyle = "#6b4424"; rectR(g, CX - 18, CY + CH - 2, CW + 36, 14, 4); g.fill();
    g.fillStyle = "#8a5a32"; rectR(g, CX + CW / 2 - 20, CY - 14, 40, 14, 4); g.fill();
    g.restore();
  }
  dibujarCuadro(g) {
    const t = this.t;
    g.save();
    // marco del lienzo
    g.fillStyle = "#d9cdb4"; g.fillRect(CX - 6, CY - 6, CW + 12, CH + 12);
    g.fillStyle = "#fffdf6"; g.fillRect(CX, CY, CW, CH);
    g.save(); g.beginPath(); g.rect(CX, CY, CW, CH); g.clip();
    g.translate(CX, CY); g.scale(SC, SC);
    g.drawImage(this.capas[0], 0, 0, 200, 160);
    const i = this.trazoActual();
    if (i >= 0 && TRAZOS[i].capa === 0) trazo(g, TRAZOS[i], (t - T0 - DT * i) / DT);
    // la jarra (se vuelca sobre su esquina de abajo a la derecha)
    const vk = t > T_VUELCA ? eBack(tramo(t, T_VUELCA, T_VUELCA + 0.45)) : 0;
    const tiembla = t > T_VUELCA - 0.35 && t < T_VUELCA ? 0.04 * Math.sin(t * 60) : 0;
    g.save(); g.translate(126, 134); g.rotate(1.05 * vk + tiembla); g.translate(-126, -134);
    g.drawImage(this.capas[1], 0, 0, 200, 160);
    if (i >= 0 && TRAZOS[i].capa === 1) trazo(g, TRAZOS[i], (t - T0 - DT * i) / DT);
    g.restore();
    // chorro pintado dentro del lienzo
    const ch = this.chorro();
    if (ch > 0) {
      g.strokeStyle = "#f0a020"; g.lineCap = "round"; g.lineWidth = 16 * ch;
      g.beginPath(); g.moveTo(190, 88); g.quadraticCurveTo(204, 92 + 3 * Math.sin(t * 20), 214, 104); g.stroke();
      g.strokeStyle = "#fffaf0"; g.lineWidth = 5 * ch; g.beginPath(); g.moveTo(186, 84); g.lineTo(196, 86); g.stroke();
    }
    g.restore();
    g.strokeStyle = "rgba(0,0,0,.25)"; g.lineWidth = 2; g.strokeRect(CX, CY, CW, CH);
    g.restore();
  }
  dibujarChorroFuera(g) {
    const t = this.t, ch = this.chorro();
    const charco = tramo(t, T_VUELCA + 0.45, 8.3);
    if (charco > 0) {
      g.save();
      const rx = 40 + 340 * eOut(charco), cx = CX + CW + 10 - rx * 0.62;
      const gr = g.createRadialGradient(cx, PIES + 4, 4, cx, PIES + 4, rx);
      gr.addColorStop(0, "rgba(255,190,50,.95)"); gr.addColorStop(0.85, "rgba(220,140,20,.9)"); gr.addColorStop(1, "rgba(220,140,20,0)");
      g.fillStyle = gr; g.beginPath(); g.ellipse(cx, PIES + 4, rx, 14 + 6 * charco, 0, 0, 6.283); g.fill();
      g.fillStyle = "rgba(255,250,235,.85)";
      for (let k = 0; k < 7; k++) { const fx = CX + CW + 10 - rx * (0.15 + k * 0.17); g.beginPath(); g.ellipse(fx, PIES + 2 + (k % 2) * 4, 9 - k * 0.6, 3.5, 0, 0, 6.283); g.fill(); }
      g.restore();
    }
    if (ch <= 0) return;
    // por fuera del lienzo: cae por el lado del caballete hasta el suelo
    const x0 = CX + CW + 14 * SC, y0 = CY + 104 * SC;
    g.save(); g.lineCap = "round";
    g.strokeStyle = "#e89a18"; g.lineWidth = 15 * ch;
    g.beginPath(); g.moveTo(x0 - 6, y0);
    for (let y = y0; y <= PIES; y += 24) g.lineTo(x0 + 4 * Math.sin(y * 0.05 + t * 16), y);
    g.stroke();
    g.strokeStyle = "rgba(255,230,140,.8)"; g.lineWidth = 4 * ch;
    g.beginPath(); g.moveTo(x0 - 6, y0);
    for (let y = y0; y <= PIES; y += 24) g.lineTo(x0 - 3 + 4 * Math.sin(y * 0.05 + t * 16), y);
    g.stroke();
    g.restore();
  }
  dibujarTelon(g) {
    const t = this.t;
    const abre = eInOut(tramo(t, 0.3, 1.05)) * (1 - eInOut(tramo(t, 9.25, 9.8)));
    // el telón se recoge hacia los lados
    const w = 560 * (1 - 0.45 * abre);
    g.drawImage(this.telon, -abre * 470, -10, w, H + 20);
    g.save(); g.translate(W, 0); g.scale(-1, 1); g.drawImage(this.telon, -abre * 470, -10, w, H + 20); g.restore();
    // bambalina
    const gb = g.createLinearGradient(0, 0, 0, 46);
    gb.addColorStop(0, "#5a0712"); gb.addColorStop(1, "#9c1024");
    g.fillStyle = gb; g.fillRect(-20, -20, W + 40, 62);
    g.fillStyle = "#d9a520"; g.fillRect(-20, 40, W + 40, 5);
    g.fillStyle = "#f4cf55";
    for (let x = 8; x < W; x += 32) { g.beginPath(); g.arc(x, 46, 5, 0, Math.PI); g.fill(); }
  }
  dibujar(g) {
    const t = this.t, e = this.estado();
    fondo(g, "#000");
    // pared de estudio y focos
    g.fillStyle = "#120d0b"; g.fillRect(0, 0, W, PIES);
    g.fillStyle = "#1c1410"; g.fillRect(0, PIES, W, H - PIES);
    foco(g, 330, 360, PIES, 200, 0.75);
    foco(g, 660, CX + CW / 2, PIES, 190, 0.85);
    this.dibujarCaballete(g);
    this.dibujarCuadro(g);
    this.dibujarChorroFuera(g);
    pintarAvatar(g, e.m, e.pose, t);
    // salpicaduras
    for (const o of this.gotas) {
      const u = (t - o.t0) / 0.18, x = lerp(o.x0, o.x1, u), y = lerp(o.y0, o.y1, u) - 40 * Math.sin(Math.PI * u);
      g.fillStyle = o.c; g.beginPath(); g.arc(x, y, 4.5, 0, 6.283); g.fill();
    }
    // estela del pincel
    if (e.trazo >= 0) {
      g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.35;
      g.drawImage(BLOB.blanco, e.tip[0] - 40, e.tip[1] - 40, 80, 80); g.restore();
    }
    this.p.dibujar(g);
    for (const z of this.zas) {
      const k = tramo(t, z.t0, z.t0 + 0.5);
      if (k >= 1) continue;
      g.save(); g.translate(z.x, z.y); g.rotate(z.r); g.scale(eBack(k * 3), eBack(k * 3));
      txt(g, z.s, 0, 0, { tam: 40, peso: 400, fam: FC, color: "#fffdf5", borde: "#1b3f8a", bordeAncho: 7, alfa: 1 - tramo(k, 0.65, 1), esp: 2 });
      g.restore();
    }
    // OBRA MAESTRA (se tuerce cuando se vuelca la jarra)
    if (t > 5.0) {
      const k = tramo(t, 5.0, 5.18), s = lerp(2.4, 1, eIn(k)), a = Math.min(1, k * 3) * (1 - tramo(t, 9.1, 9.4));
      const tuerce = t > T_VUELCA + 0.25 ? 0.05 * eElastico(tramo(t, T_VUELCA + 0.25, T_VUELCA + 1.2)) : 0;
      g.save(); g.translate(W / 2 - 290, 132); g.rotate(tuerce); g.translate(290, 0); g.scale(s, s);
      const gr = g.createLinearGradient(0, -70, 0, 6);
      gr.addColorStop(0, "#fff6c8"); gr.addColorStop(0.55, "#ffd34d"); gr.addColorStop(1, "#d48a00");
      txt(g, "OBRA MAESTRA", 0, 0, { tam: 92, peso: 900, fam: FD, color: gr, borde: "#3a1d00", bordeAncho: 9, alfa: a, esp: 6, max: 620 });
      g.restore();
    }
    if (t > 0.6 && t < 1.3) {
      const q = aPant(e.m, [39, -8]);
      bocadillo(g, q[0] - 60, q[1] - 46, "¡A PINTAR!", q[0] - 10, q[1] - 2, tramo(t, 0.6, 0.75) * (1 - tramo(t, 1.15, 1.3)), 32);
    }
    if (t > T_VUELCA + 0.25 && t < 7.6) {
      const q = aPant(e.m, [39, -8]);
      bocadillo(g, q[0] - 40, q[1] - 46, "¡EH, EH!", q[0] + 10, q[1] - 2, tramo(t, T_VUELCA + 0.25, T_VUELCA + 0.4) * (1 - tramo(t, 7.4, 7.6)), 34);
    }
    this.dibujarTelon(g);
    const negro = Math.max(1 - tramo(t, 0.02, 0.3), tramo(t, 9.8, 10.25));
    if (negro > 0) { g.fillStyle = `rgba(0,0,0,${negro})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}
/** Pinta el trazo s hasta la fracción k (coordenadas del lienzo). */
function trazo(g, s, k) {
  k = clamp(k, 0, 1);
  if (k <= 0) return;
  if (s.puntos) {
    g.fillStyle = s.c;
    for (let i = 0; i < Math.ceil(k * s.p.length); i++) { g.beginPath(); g.arc(s.p[i][0], s.p[i][1], s.w, 0, 6.283); g.fill(); }
    return;
  }
  g.save(); g.strokeStyle = s.c; g.lineWidth = s.w; g.lineCap = "round"; g.lineJoin = "round"; g.globalAlpha = 0.96;
  if (k < 1) { g.setLineDash([s.L * k, s.L + 10]); }
  g.beginPath(); s.p.forEach((q, i) => (i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]))); g.stroke();
  g.restore();
}
function telonMitad() {
  const c = lienzoNuevo(560, 640), g = c.getContext("2d");
  const gr = g.createLinearGradient(0, 0, 560, 0);
  for (let i = 0; i <= 8; i++) {
    const x = i / 8;
    gr.addColorStop(Math.min(1, x), "#4a0510");
    if (i < 8) { gr.addColorStop(x + 0.03, "#9e1026"); gr.addColorStop(x + 0.06, "#e03a52"); gr.addColorStop(x + 0.09, "#a8122a"); }
  }
  g.fillStyle = gr; g.fillRect(0, 0, 560, 640);
  const sombra = g.createLinearGradient(0, 0, 0, 640);
  sombra.addColorStop(0, "rgba(0,0,0,.35)"); sombra.addColorStop(0.3, "rgba(0,0,0,0)"); sombra.addColorStop(1, "rgba(0,0,0,.4)");
  g.fillStyle = sombra; g.fillRect(0, 0, 560, 640);
  g.fillStyle = "#d9a520"; g.fillRect(0, 618, 560, 8);
  return c;
}
/** Boina de pintor (sigue el giro de la cabeza). */
function boina(g, rc) {
  g.save(); g.translate(39, 72); g.rotate(rc); g.translate(-39, -72);
  g.translate(43, 4); g.rotate(-0.2);
  g.fillStyle = "#6e0f22"; g.beginPath(); g.ellipse(0, 3, 33, 9, 0, 0, 6.283); g.fill();
  const gr = g.createRadialGradient(-8, -6, 2, 0, 0, 34);
  gr.addColorStop(0, "#e2405a"); gr.addColorStop(0.6, "#a3203a"); gr.addColorStop(1, "#6e0f22");
  g.fillStyle = gr; g.beginPath(); g.ellipse(0, -1, 34, 11, 0, 0, 6.283); g.fill();
  g.strokeStyle = "#4a0814"; g.lineWidth = 2.2; g.lineCap = "round"; g.beginPath(); g.moveTo(2, -11); g.lineTo(4, -17); g.stroke();
  g.restore();
}
/** Pincel en la mano derecha (unidades de avatar). */
function pincel(g, m, ang, color) {
  g.save(); g.translate(m[0], m[1]); g.rotate(ang);
  g.fillStyle = "#3a2312"; rectR(g, -1.6, -8, 3.2, 26, 1.6); g.fill();
  g.fillStyle = "#c9ced3"; g.fillRect(-1.9, -16, 3.8, 8);
  g.fillStyle = color; g.beginPath(); g.moveTo(-2, -16); g.quadraticCurveTo(-2.6, -26, 0, -34); g.quadraticCurveTo(2.6, -26, 2, -16); g.closePath(); g.fill();
  g.restore();
}
/** Paleta de madera con pegotes de pintura en la mano izquierda. */
function paleta(g, m) {
  g.save(); g.translate(m[0] - 6, m[1] - 2); g.rotate(-0.25);
  g.fillStyle = "#c2884e";
  g.beginPath(); g.ellipse(-8, 0, 22, 14, 0, 0, 6.283); g.fill();
  g.strokeStyle = "#7a4c28"; g.lineWidth = 1.2; g.stroke();
  g.fillStyle = "#1a1a1a"; g.beginPath(); g.ellipse(4, 3, 3.2, 2.4, 0, 0, 6.283); g.fill();
  const cols = ["#4f7fd9", "#f0a020", "#fffaf0", "#7a4a24", "#e0294a"];
  cols.forEach((c, i) => { const a = -2.6 + i * 0.75; g.fillStyle = c; g.beginPath(); g.arc(-8 + Math.cos(a) * 14, Math.sin(a) * 8.5, 3.2, 0, 6.283); g.fill(); });
  g.restore();
}

registrar({ id: "00043", nombre: "El pintor", crear: () => new Pintor() });
})();
