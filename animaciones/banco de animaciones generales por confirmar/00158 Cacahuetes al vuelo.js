"use strict";
/*
 * 00158 · CACAHUETES AL VUELO
 *
 * Animación del banco. Empieza y acaba en negro.
 * Guillermo y Marcos, cada uno con su cuenco, se tiran cacahuetes a la boca por turnos y cada vez desde más lejos.
 * Marcos los caza todos (hasta tres de golpe, saltando); a Guillermo le rebotan en la nariz (¡TOC!) y en la frente
 * (¡PLOC!)… y cuando se queda boquiabierto, Marcos le cuela el último sin mirar (¡GLUP!): ¡A LA BOCA!
 */
(() => {
const ESC = 1.62, DUR = 10.8, T_APAGA = 10.15, T_TIT = 8.62;
const XG = [[0, 392], [2.9, 392], [3.5, 272], [5.7, 272], [6.3, 150]];
const XM = [[0, 632], [2.9, 632], [3.5, 752], [5.7, 752], [6.3, 874]];
// lanzamientos: quién, suelta, llega, a quién, altura del arco, a dónde
const TIROS = [
  { de: 0, rel: 0.85, lle: 1.42, alto: 90, dian: "boca" },
  { de: 1, rel: 2.05, lle: 2.55, alto: 80, dian: "nariz" },
  { de: 0, rel: 3.85, lle: 4.55, alto: 210, dian: "boca" },
  { de: 1, rel: 4.95, lle: 5.45, alto: 150, dian: "frente" },
  { de: 0, rel: 6.8, lle: 7.45, alto: 150, dian: "boca" },
  { de: 0, rel: 6.8, lle: 7.62, alto: 180, dian: "boca" },
  { de: 0, rel: 6.8, lle: 7.79, alto: 210, dian: "boca" },
  { de: 1, rel: 8.05, lle: 8.45, alto: 36, dian: "boca" },
];
const CT = cacheTexto();

function pista(t, k) {
  if (t <= k[0][0]) return k[0][1];
  for (let i = 1; i < k.length; i++) if (t <= k[i][0]) { const u = (t - k[i - 1][0]) / (k[i][0] - k[i - 1][0]); return lerp(k[i - 1][1], k[i][1], eInOut(u)); }
  return k[k.length - 1][1];
}
/** ¿Está andando en t? (entre dos puntos de la pista que cambian de x) */
function andando(t, k) { for (let i = 1; i < k.length; i++) if (t > k[i - 1][0] && t < k[i][0] && k[i][1] !== k[i - 1][1]) return true; return false; }

/** Cacahuete con cáscara centrado en (x, y), en píxeles (s = 1 → 30 × 15). */
function cacahuete(g, x, y, ang, s = 1) {
  g.save(); g.translate(x, y); g.rotate(ang); g.scale(s, s);
  const ruta = () => {
    g.beginPath();
    g.moveTo(-15, 0);
    g.bezierCurveTo(-15, -9, -4, -9, -2, -4.5);
    g.bezierCurveTo(0, -2.5, 2, -2.5, 4, -4.5);
    g.bezierCurveTo(8, -8, 15, -6, 15, 0);
    g.bezierCurveTo(15, 6, 8, 8, 4, 4.5);
    g.bezierCurveTo(2, 2.5, 0, 2.5, -2, 4.5);
    g.bezierCurveTo(-4, 9, -15, 9, -15, 0);
    g.closePath();
  };
  ruta();
  const gr = g.createLinearGradient(0, -8, 0, 8);
  gr.addColorStop(0, "#f6d9a0"); gr.addColorStop(0.55, "#d9a65e"); gr.addColorStop(1, "#9c6a33");
  g.fillStyle = gr; g.fill();
  g.strokeStyle = "#6b4219"; g.lineWidth = 1.6; g.stroke();
  // la red de la cáscara
  g.fillStyle = "rgba(120,74,30,.5)";
  for (const [dx, dy] of [[-10, -2], [-7, 2], [-5, -3], [-11, 3], [7, -2], [10, 2], [9, -3], [6, 2], [12, -1]]) { g.beginPath(); g.arc(dx, dy, 1, 0, 6.283); g.fill(); }
  g.fillStyle = "rgba(255,255,255,.55)"; g.beginPath(); g.ellipse(-8, -4, 4, 1.6, -0.2, 0, 6.283); g.fill();
  g.beginPath(); g.ellipse(8, -3.5, 3, 1.3, 0.2, 0, 6.283); g.fill();
  g.restore();
}
/** Cuenco de cacahuetes en la mano (unidades de avatar; (x, y) = donde lo sujeta la mano). */
function cuenco(g, x, y) {
  g.save(); g.translate(x, y - 5);
  for (const [cx, cy] of [[-6, -4], [0, -6], [6, -4], [-2, -2], [4, -2.5]]) cacahuete(g, cx, cy, cx * 0.1, 0.3);
  g.beginPath(); g.moveTo(-13, -2); g.quadraticCurveTo(-12, 9, 0, 9); g.quadraticCurveTo(12, 9, 13, -2); g.closePath();
  const gr = g.createLinearGradient(-13, 0, 13, 0);
  gr.addColorStop(0, "#5a2f12"); gr.addColorStop(0.45, "#b9733a"); gr.addColorStop(1, "#4a250d");
  g.fillStyle = gr; g.fill();
  g.fillStyle = "#d89257"; g.beginPath(); g.ellipse(0, -2, 13, 2.2, 0, 0, 6.283); g.fill();
  g.restore();
}

class Cacahuetes extends Escena {
  constructor() {
    super(DUR);
    this.p = new Parts(260);
    // de dónde sale y a dónde llega cada cacahuete
    this.vuelos = TIROS.map((f) => {
      const eS = this.poses(f.rel)[f.de], eE = this.poses(f.lle)[1 - f.de];
      const S = aPant(eS.m, f.de ? eS.pose.manoI : eS.pose.manoD);
      const R = avatar(eE.pose.quien).rig;
      const pt = f.dian === "boca" ? boca(eE.pose.rc, eE.pose.quien) : f.dian === "nariz" ? [R.bocaPos[0], R.bocaPos[1] - 8] : [R.frente[0], R.frente[1] + 4];
      return Object.assign({ S, E: aPant(eE.m, pt) }, f);
    });
  }
  luz() { return tramo(this.t, 0, 0.5) * (1 - tramo(this.t, T_APAGA, DUR - 0.05)); }
  /** Lanzamiento con la mano de dentro: prepara, suelta y vuelve. q = 0 Guillermo, 1 Marcos. */
  brazoTiro(t, q, rel, reposo) {
    const atras = q ? [10, 148] : [66, 170], suelta = q ? [-22, 76] : [98, 78];
    const k1 = eInOut(tramo(t, rel - 0.32, rel - 0.1)), k2 = eOut(tramo(t, rel - 0.1, rel)), k3 = eInOut(tramo(t, rel + 0.15, rel + 0.5));
    let p = mezcla(reposo, atras, k1);
    p = mezcla(p, suelta, k2);
    return mezcla(p, reposo, k3);
  }
  poses(t = this.t) {
    const xg = pista(t, XG), xm = pista(t, XM);
    const G = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoI: [6, 150], manoD: [70, 158] };
    const M = { quien: "marcos", cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [74, 140], manoI: [6, 152], brazoIDelante: true };
    G.objI = (g, m) => cuenco(g, m[0] + 2, m[1] - 2);
    M.objD = (g, m) => cuenco(g, m[0] - 2, m[1] - 2);
    let yG = 0, yM = 0;
    for (const [P, k, q] of [[G, XG, 0], [M, XM, 1]]) if (andando(t, k)) {
      const a = andar(t * 15, 0.9); P.piernaI = a.piernaI; P.piernaD = a.piernaD;
      if (q) yM = a.bote; else yG = a.bote;
    }
    // tiros (con la mano de dentro)
    for (const f of TIROS) {
      if (t < f.rel - 0.35 || t > f.rel + 0.55) continue;
      if (f.de === 0) { G.manoD = this.brazoTiro(t, 0, f.rel, [70, 158]); if (t < f.rel + 0.1) G.cara = "guino"; }
      else { M.manoI = this.brazoTiro(t, 1, f.rel, [6, 152]); if (t < f.rel + 0.1) { M.cara = "guino"; if (f.rel > 8) M.rc = 0.16; } }
    }
    // Marcos: boca abierta mientras le llega uno; mastica después
    const comeM = [1.42, 4.55, 7.45, 7.62, 7.79];
    if ((t > 0.62 && t < 1.42) || (t > 3.9 && t < 4.55) || (t > 6.95 && t < 7.79)) M.cara = "sorpresa";
    for (const tc of comeM) { const d = t - tc; if (d > 0 && d < 0.4) M.cara = Math.floor(d * 14) % 2 ? "sonrisa" : "risa"; }
    if (t > 6.95 && t < 7.85) {
      // los tres seguidos: la cabeza va a por cada uno
      M.rc = 0.07 * Math.sin((t - 6.95) * 18);
      for (const tc of [7.45, 7.62]) if (t > tc && t < tc + 0.07) M.cara = "sonrisa";
    }
    if (t > 7.85 && t < 7.95) M.cara = "risa";
    if (t > 4.28 && t < 4.82) yM -= 62 * Math.sin(Math.PI * tramo(t, 4.28, 4.82));
    if ((t > 2.55 && t < 3.0) || (t > 5.45 && t < 5.9) || t > 8.45) M.cara = "risa";
    // Guillermo: espera con la boca abierta, le da en la nariz y en la frente
    if ((t > 1.42 && t < 1.85)) G.cara = "risa";
    if ((t > 1.95 && t < 2.55) || (t > 5.05 && t < 5.45)) G.cara = "sorpresa";
    if (t > 2.55 && t < 2.95) { G.cara = "dormido"; G.rc = -0.18 * Math.sin(Math.PI * tramo(t, 2.55, 2.95)); }
    if (t > 4.55 && t < 4.9) G.cara = "risa";
    if (t > 5.45 && t < 6.0) { G.cara = "dormido"; G.rc = -0.2 * Math.sin(Math.PI * tramo(t, 5.45, 5.9)); }
    if (t > 6.0 && t < 6.35) G.cara = "borracho";
    if (t > 7.4 && t < 8.6) { G.cara = "sorpresa"; G.rc = 0.04 * Math.sin(t * 9); }
    if (t > 8.45 && t < 8.75) { G.puntas = Math.sin(Math.PI * tramo(t, 8.45, 8.75)); yG -= 14 * Math.sin(Math.PI * tramo(t, 8.45, 8.7)); }
    if (t > 8.75) {
      G.cara = "risa"; M.cara = t > 9.4 ? "guino" : "risa";
      // se ríen los dos dando botes
      const b = Math.abs(Math.sin((t - 8.75) * 8)) * (1 - tramo(t, 9.6, 9.9));
      yG -= 8 * b; yM -= 8 * b;
      G.manoD = mezcla([70, 158], [96, 40 + 4 * Math.sin(t * 9)], eOut(tramo(t, 8.8, 9.05)));
      M.manoI = mezcla([6, 152], [-18, 44 + 4 * Math.sin(t * 9 + 1)], eOut(tramo(t, 8.85, 9.1)));
    }
    return [{ pose: G, m: matAv(xg, PIES + yG, ESC) }, { pose: M, m: matAv(xm, PIES + yM, ESC) }];
  }
  /** Dónde está el cacahuete de un vuelo en t (null si no está en el aire ni en el suelo). */
  pos(f, t) {
    if (t < f.rel || (f.dian === "boca" && t > f.lle)) return null;
    if (t <= f.lle) {
      const u = (t - f.rel) / (f.lle - f.rel);
      return { x: lerp(f.S[0], f.E[0], u), y: lerp(f.S[1], f.E[1], u) - 4 * f.alto * u * (1 - u), a: u * 13 };
    }
    // rebota en la cara y cae al suelo
    const d = t - f.lle, vx = 150, vy = -380, gr = 1700, suelo = PIES - 6;
    const tSuelo = (-vy + Math.sqrt(vy * vy + 2 * gr * (suelo - f.E[1]))) / gr;
    const dd = Math.min(d, tSuelo);
    return { x: f.E[0] + vx * dd + (d > tSuelo ? 20 * (1 - Math.exp(-(d - tSuelo) * 6)) : 0), y: f.E[1] + vy * dd + 0.5 * gr * dd * dd, a: d > tSuelo ? 0.12 : 13 + dd * 16 };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    for (const f of this.vuelos) this.una("lle" + f.lle, t > f.lle, () => {
      if (f.dian === "boca") {
        temblar(f.lle > 8 ? 12 : 5, 0.18);
        for (let i = 0; i < 8; i++) { const a = azar(0, 6.283), v = azar(80, 220); p.nueva(P.CHISPA, f.E[0], f.E[1], Math.cos(a) * v, Math.sin(a) * v - 60, azar(0.25, 0.45), azar(5, 8)); }
      } else {
        temblar(9, 0.2);
        p.nueva(P.DESTELLO, f.E[0], f.E[1], 0, 0, 0.25, 90);
      }
    });
    this.una("tit", t > T_TIT, () => {
      temblar(16, 0.4);
      for (let i = 0; i < 80; i++) p.nueva(P.CONFETI, azar(30, W - 30), azar(-90, -10), azar(-40, 40), azar(0, 120), azar(2.2, 3.4), azar(9, 15), i % 5);
    });
    p.suelo = () => PIES;
    p.alfa = this.luz();
    p.actualizar(dt);
  }
  dibujar(g) {
    const t = this.t, a = this.luz(), e = this.poses();
    fondo(g, "#000");
    g.save(); g.globalAlpha = a;
    foco(g, 512, 512, PIES, 470, 0.85);
    // suelo
    const gs = g.createLinearGradient(0, PIES - 20, 0, H);
    gs.addColorStop(0, "rgba(60,40,28,0)"); gs.addColorStop(0.3, "rgba(60,40,28,.55)"); gs.addColorStop(1, "rgba(30,20,14,.8)");
    g.fillStyle = gs; g.fillRect(-60, PIES - 20, W + 120, H - PIES + 80);
    // marcas de cinta en el suelo: cada vez más lejos
    g.fillStyle = "rgba(255,211,77,.75)";
    for (const [x0, x1] of [[392, 632], [272, 752], [150, 874]]) for (const x of [x0, x1]) g.fillRect(x - 22, PIES + 6, 44, 5);
    for (const q of [0, 1]) { g.fillStyle = "rgba(0,0,0,.45)"; const x = aPant(e[q].m, [39, 232])[0]; g.beginPath(); g.ellipse(x, PIES + 2, 52, 9, 0, 0, 6.283); g.fill(); }
    pintarAvatar(g, e[0].m, e[0].pose, t);
    pintarAvatar(g, e[1].m, e[1].pose, t);
    // cacahuetes en la mano antes de tirarlos
    for (const f of TIROS) {
      if (t < f.rel - 0.36 || t >= f.rel) continue;
      if (f !== TIROS[5] && f !== TIROS[6]) {
        const E = e[f.de], m = f.de ? E.pose._manoI : E.pose._manoD;
        if (!m) continue;
        const h = aPant(E.m, m);
        const n = f === TIROS[4] ? 3 : 1;
        for (let i = 0; i < n; i++) cacahuete(g, h[0] + (i - (n - 1) / 2) * 16, h[1] - 8 - (i % 2) * 8, 0.4 + i, 1.25);
      }
    }
    // cacahuetes volando (y los que se han caído)
    for (const f of this.vuelos) {
      const c = this.pos(f, t);
      if (!c) continue;
      if (t < f.lle && t > f.rel + 0.02) {
        g.save(); g.globalAlpha = 0.25; cacahuete(g, c.x - (f.E[0] - f.S[0]) * 0.035, c.y + 5, c.a - 0.6, 1.3); g.restore();
      }
      cacahuete(g, c.x, c.y, c.a, 1.45);
    }
    g.restore();
    this.p.dibujar(g);
    // onomatopeyas
    for (const f of this.vuelos) {
      const d = t - f.lle;
      if (d < 0 || d > 0.55) continue;
      const s = f.dian === "nariz" ? "¡TOC!" : f.dian === "frente" ? "¡PLOC!" : f.lle > 8 ? "¡GLUP!" : "¡ÑAM!";
      const lado = f.de ? -1 : 1, k = eBack(tramo(d, 0, 0.1));
      const pila = f.lle === 7.62 ? 1 : f.lle === 7.79 ? 2 : 0;
      const gx = f.lle > 8 ? f.E[0] + 130 : clamp(f.E[0] + lado * 30, 90, W - 90), gy = f.lle > 8 ? f.E[1] - 20 : f.E[1] - 120 - pila * 46;
      g.save(); g.translate(gx, gy); g.rotate(lado * 0.12); g.scale(k, k);
      const amar = f.dian === "boca";
      txt(g, s, 0, 0, { tam: f.lle > 8 ? 64 : 48, peso: 400, fam: FC, color: amar ? "#ffd34d" : "#e9fbff", borde: amar ? "#3a2400" : "#0a3d5c", bordeAncho: 8, esp: 2, alfa: a * (1 - tramo(d, 0.4, 0.55)) });
      g.restore();
    }
    // Marcos pide más
    for (const [t0, t1, s] of [[2.95, 3.65, "¡MÁS LEJOS!"], [6.05, 6.75, "¡TRES DE GOLPE!"]]) {
      if (t < t0 || t > t1) continue;
      const q = aPant(e[1].m, [30, 40]);
      g.save(); g.globalAlpha = a * (1 - tramo(t, t1 - 0.12, t1));
      bocadillo(g, clamp(q[0] - 130, 190, W - 190), q[1] - 120, s, q[0] - 6, q[1] - 34, tramo(t, t0, t0 + 0.25), 46);
      g.restore();
    }
    // ¡A LA BOCA!
    if (t > T_TIT) {
      const d = t - T_TIT, k = tramo(d, 0, 0.18), s = lerp(2.5, 1, eIn(k)) * (1 + 0.02 * Math.sin(d * 7));
      const r = this.titulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3) * a;
      g.translate(512, 122); g.rotate(-0.03); g.scale(s, s);
      g.drawImage(r, -r.width / 2, -r.height / 2);
      g.restore();
    }
    const negro = 1 - a;
    if (negro > 0) { g.fillStyle = `rgba(0,0,0,${negro})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
  titulo() {
    if (CT.has(1)) return CT.get(1);
    const c = lienzoNuevo(760, 200), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 40, 0, 160);
    gr.addColorStop(0, "#fffbe0"); gr.addColorStop(0.45, "#ffd34d"); gr.addColorStop(1, "#ff8f00");
    txt(g, "¡A LA BOCA!", 380, 150, { tam: 136, peso: 900, fam: FD, color: gr, borde: "#3a1d00", bordeAncho: 12, esp: 4, glow: "rgba(255,190,40,.85)", glowTam: 24, max: 720 });
    CT.set(1, c);
    return c;
  }
}

registrar({ id: "00158", nombre: "Cacahuetes al vuelo", crear: () => new Cacahuetes() });
})();
