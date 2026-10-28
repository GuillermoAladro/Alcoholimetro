"use strict";
/*
 * 00087 · MALABARES
 *
 * Animación del banco. Empieza y acaba en negro.
 * Bajo un foco hace malabares con 3 botellines. Le lanzan otro desde un lado (4) y luego otro más y una jarra
 * desde el otro (6): cada vez más rápido y más alto, sudando. Lo tira todo hacia arriba y le va cayendo encima de
 * la cabeza: la jarra y los cinco botellines, uno sobre otro, en una torre que se balancea. ¡MALABARISTA!
 */
(() => {
const ESC = 1.25, X = 420;
const T_SUBE = 7.55;             // lo lanza todo hacia arriba
const CAEN = [8.2, 8.42, 8.6, 8.76, 8.9, 9.04]; // jarra y 5 botellines aterrizan en la torre
const ALTO_B = 44, ALTO_J = 46;  // alto en la torre (px)
const cache = cacheTexto();

function spriteBotella() {
  if (cache.has("bot")) return cache.get("bot");
  const S = 3, c = lienzoNuevo(20 * S, 48 * S), g = c.getContext("2d");
  g.scale(S, S); g.translate(10, 24);
  const gr = g.createLinearGradient(-8, 0, 8, 0);
  gr.addColorStop(0, "#2a1204"); gr.addColorStop(0.35, "#7a3a0c"); gr.addColorStop(0.55, "#b8641e"); gr.addColorStop(1, "#2a1204");
  g.fillStyle = gr;
  g.beginPath(); g.moveTo(-7.5, 21); g.lineTo(-7.5, -4); g.quadraticCurveTo(-7.5, -10, -3, -13); g.lineTo(-3, -19); g.lineTo(3, -19); g.lineTo(3, -13); g.quadraticCurveTo(7.5, -10, 7.5, -4); g.lineTo(7.5, 21); g.quadraticCurveTo(0, 23, -7.5, 21); g.closePath(); g.fill();
  g.fillStyle = "#f3e7c9"; g.fillRect(-7.5, 1, 15, 11);
  g.fillStyle = "#c4161c"; g.fillRect(-7.5, 4.5, 15, 3.5);
  g.fillStyle = "#e7a900"; g.beginPath(); g.arc(0, 6.2, 1.6, 0, 6.283); g.fill();
  g.fillStyle = "#ffd34d"; rectR(g, -3.6, -22, 7.2, 3.6, 1); g.fill();
  g.fillStyle = "rgba(255,255,255,.45)"; g.fillRect(-4.6, -6, 1.4, 25);
  cache.set("bot", c);
  return c;
}
function botella(g, x, y, ang, esc = 1) {
  const s = spriteBotella();
  g.save(); g.translate(x, y); g.rotate(ang); g.scale(esc, esc); g.drawImage(s, -10, -24, 20, 48); g.restore();
}
function jarra(g, x, y, ang, t) {
  // (x, y) = centro de la jarra
  g.save(); g.translate(x, y); g.rotate(ang); g.scale(1.3, 1.3); g.translate(-17, 0);
  dibujarJarra(g, [0, 0], 0, 1, "asa", t); dibujarJarra(g, [0, 0], 0, 1, "cuerpo", t);
  g.restore();
}

class Malabares extends Escena {
  constructor() {
    super(11.4);
    this.p = new Parts(380);
    this.gotas = [];
    this.textos = [];
  }
  /** Cuántos objetos y su ciclo en cada tramo. */
  n(t) { return t < 3.1 ? 3 : t < 5.3 ? 4 : 6; }
  ciclo(n) { return n === 3 ? 1.2 : n === 4 ? 1.02 : 0.9; }
  manosBase() { return [aPant(matAv(X, PIES, ESC), [-34, 134]), aPant(matAv(X, PIES, ESC), [112, 134])]; }
  /** Posición del objeto i en una cascada de n objetos. Devuelve { p, ang, mano } (mano: 0/1 si lo tiene en la mano). */
  patron(n, i, t) {
    const [L, R] = this.manosBase(), T = this.ciclo(n), alto = n === 3 ? 235 : n === 4 ? 268 : 300;
    const f = (((t / T + i / (n % 2 ? n : n + 0.5)) % 1) + 1) % 1, mitad = f < 0.5 ? 0 : 1, u = (f % 0.5) / 0.5;
    const A = mitad ? R : L, B = mitad ? L : R, dentro = mitad ? -1 : 1, quieto = 0.32;
    if (u < quieto) {
      const k = u / quieto;
      return { p: [A[0] + dentro * 24 * k, A[1] + 12 * Math.sin(k * Math.PI)], ang: 0, mano: mitad ? 1 : 0 };
    }
    const v = (u - quieto) / (1 - quieto);
    return { p: [lerp(A[0] + dentro * 24, B[0], v), lerp(A[1], B[1], v) - alto * 4 * v * (1 - v)], ang: dentro * v * Math.PI * 2, mano: -1, va: mitad ? 0 : 1, v };
  }
  /** Los 6 objetos (0–4 botellines, 5 la jarra). null si aún no han entrado. */
  objetos(t) {
    const out = [];
    const [L, R] = this.manosBase();
    for (let i = 0; i < 6; i++) {
      const entra = i < 3 ? 0 : i === 3 ? 3.1 : 5.3;
      if (t < entra - 0.55) { out.push(null); continue; }
      // entra volando desde un lado
      if (t < entra) {
        const u = tramo(t, entra - 0.55, entra), desde = i === 3 ? [-60, 260] : i === 4 ? [W + 60, 240] : [W + 60, 330], a = i === 3 ? L : R;
        out.push({ p: [lerp(desde[0], a[0], u), lerp(desde[1], a[1], u) - 180 * Math.sin(u * Math.PI)], ang: u * 9 * (i === 3 ? 1 : -1), mano: -1 });
        continue;
      }
      if (t >= T_SUBE) { out.push(this.torre(i, t)); continue; }
      const n = this.n(t), cambio = t < 3.1 ? 0 : t < 5.3 ? 3.1 : 5.3;
      let o = this.patron(n, i, t);
      if (cambio && t < cambio + 0.3) {
        const k = eInOut(tramo(t, cambio, cambio + 0.3));
        const viejo = i < (cambio === 3.1 ? 3 : 4) ? this.patron(cambio === 3.1 ? 3 : 4, i, t) : { p: (i === 3 ? L : R), ang: 0 };
        o = { p: mezcla(viejo.p, o.p, k), ang: lerp(viejo.ang, o.ang, k), mano: k < 0.5 ? viejo.mano : o.mano };
      }
      out.push(o);
    }
    return out;
  }
  /** Al final: suben todos y caen, uno a uno, en la torre sobre su cabeza (la jarra primero). */
  torre(i, t) {
    const orden = i === 5 ? 0 : i + 1, tc = CAEN[orden];
    const e = this.cabeza(t), base = this.alturaTorre(orden);
    const sway = this.balanceo(t) * (1 + 0.25 * orden);
    const pos = [e[0] + Math.sin(sway) * base, e[1] - Math.cos(sway) * base];
    const objP = i === 5 ? [pos[0] + Math.sin(sway) * ALTO_J / 2, pos[1] - Math.cos(sway) * ALTO_J / 2] : [pos[0] + Math.sin(sway) * ALTO_B / 2, pos[1] - Math.cos(sway) * ALTO_B / 2];
    if (t >= tc) return { p: objP, ang: sway, mano: -1 };
    // subida (desde donde estaba) y caída
    const ini = this._ini && this._ini[i];
    const s = t - T_SUBE;
    if (ini && s < 0.32) { const k = eOut(s / 0.32); return { p: [lerp(ini[0], objP[0] + (i - 2.5) * 40, k), lerp(ini[1], -120, k)], ang: s * 14, mano: -1 }; }
    const k = eIn(tramo(t, tc - 0.3, tc));
    return { p: [objP[0], lerp(-120, objP[1], k)], ang: (1 - k) * 3, mano: -1 };
  }
  alturaTorre(orden) { return orden === 0 ? 0 : ALTO_J + (orden - 1) * ALTO_B; }
  balanceo(t) { return t < 8.2 ? 0 : (0.03 + 0.03 * tramo(t, 8.6, 9.4)) * Math.sin((t - 8.2) * 4.2); }
  dx(t) { return -this.balanceo(t) * 120; }
  cabeza(t) { const m = matAv(X + this.dx(t), PIES, ESC); return aPant(m, [39, -4]); }
  estado(objs) {
    const t = this.t;
    const pose = { cara: "sonrisa", rc: 0, piernaI: [0, 0.03], piernaD: [0, -0.03] };
    const m0 = matAv(X + this.dx(t), PIES, ESC);
    const aU = (q) => [(q[0] - (X + this.dx(t))) / ESC + 39, (q[1] - PIES) / ESC + 232];
    let manoI = [-34, 134], manoD = [112, 134];
    if (t < T_SUBE) {
      // cada mano sigue lo que tiene; si está vacía, sale a buscar lo que le llega
      const base = this.manosBase();
      const mano = (h) => {
        const tiene = objs.find((o) => o && o.mano === h);
        if (tiene) return tiene.p;
        let llega = null;
        for (const o of objs) if (o && o.va === h && (!llega || o.v > llega.v)) llega = o;
        const dentro = [base[h][0] + (h ? -24 : 24), base[h][1]];
        return llega ? mezcla(dentro, base[h], eInOut(tramo(llega.v, 0.3, 0.95))) : base[h];
      };
      const qI = mano(0), qD = mano(1);
      manoI = aU([qI[0], qI[1] + 8]); manoD = aU([qD[0], qD[1] + 8]);
    }
    if (t < 0.7) { manoI = mezcla([9, 160], manoI, eInOut(tramo(t, 0.2, 0.7))); manoD = mezcla([70, 158], manoD, eInOut(tramo(t, 0.2, 0.7))); }
    // caras
    if (t > 1.6 && t < 2.6) pose.cara = "guino";
    if ((t > 2.7 && t < 3.3) || (t > 4.9 && t < 5.5)) { pose.cara = "sorpresa"; pose.rc = t < 4 ? -0.12 : 0.12; }
    if (t >= 5.5 && t < T_SUBE) { pose.cara = "sorpresa"; pose.rc = 0.04 * Math.sin(t * 13); pose.piernaI = [0, 0.03 + 0.03 * Math.sin(t * 20)]; }
    // lo lanza todo y mira arriba; luego equilibrio con los brazos abiertos
    if (t >= T_SUBE) {
      const k = eOut(tramo(t, T_SUBE, T_SUBE + 0.15)), k2 = eInOut(tramo(t, T_SUBE + 0.25, T_SUBE + 0.55));
      manoI = mezcla(mezcla([-34, 134], [-12, 20], k), [-36, 112], k2);
      manoD = mezcla(mezcla([112, 134], [90, 20], k), [114, 112], k2);
      const b = this.balanceo(t);
      manoI[1] += b * 160; manoD[1] -= b * 160;
      pose.cara = t < 9.15 ? "sorpresa" : t < 9.9 ? "guino" : "risa";
      pose.rc = t < 9.15 ? -0.02 : b * 1.5;
    }
    pose.manoI = manoI; pose.manoD = manoD;
    return { pose, m: m0 };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    this.una("llega4", t > 3.1, () => { temblar(4, 0.12); this.textos.push({ s: "¡OTRA!", x: 170, y: 210, t0: t - 0.55 }); });
    this.una("llega6", t > 5.3, () => { temblar(6, 0.15); this.textos.push({ s: "¡Y OTRA!", x: 760, y: 200, t0: t - 0.55 }); });
    this.una("sube", t >= T_SUBE, () => {
      const o = this.objetos(T_SUBE - 0.001); this._ini = o.map((x) => x && x.p);
      temblar(8, 0.2);
    });
    CAEN.forEach((tc, k) => this.una("cae" + k, t > tc, () => {
      temblar(4 + k, 0.15);
      const q = this.cabeza(t), h = this.alturaTorre(k);
      for (let i = 0; i < 8; i++) p.nueva(P.CHISPA, q[0], q[1] - h, azar(-220, 220), azar(-260, -60), azar(0.25, 0.45), azar(6, 10));
    }));
    this.una("titulo", t > 9.25, () => {
      temblar(18, 0.45);
      for (let i = 0; i < 150; i++) p.nueva(P.CONFETI, azar(0, W), azar(-260, -10), azar(-60, 60), azar(40, 140), azar(4, 6), azar(9, 15), (Math.random() * 5) | 0);
    });
    // sudor con 6 objetos
    if (t > 5.6 && t < T_SUBE + 1.2 && Math.random() < 8 * dt) {
      const q = this.cabeza(t), lado = Math.random() < 0.5 ? -1 : 1;
      this.gotas.push({ x: q[0] + lado * 34, y: q[1] + 40, vx: lado * azar(40, 110), vy: azar(-150, -60), v: 0.7 });
    }
    for (const g of this.gotas) { g.vy += 900 * dt; g.x += g.vx * dt; g.y += g.vy * dt; g.v -= dt; }
    this.gotas = this.gotas.filter((g) => g.v > 0);
    p.actualizar(dt);
  }
  luz(t) {
    if (t < 0.55) return [0, 0, 1, 0, 1, 0.4, 1][Math.min(6, Math.floor(t / 0.08))];
    return 1 - tramo(t, 10.7, 11.35);
  }
  dibujar(g) {
    const t = this.t, objs = this.objetos(t), e = this.estado(objs), luz = this.luz(t);
    fondo(g, "#000");
    foco(g, X, X + this.dx(t), PIES, 175, luz);
    pintarAvatar(g, e.m, e.pose, t);
    // la torre de abajo arriba y los que vuelan
    const lista = objs.map((o, i) => ({ o, i })).filter((x) => x.o);
    if (t >= T_SUBE) lista.sort((a, b) => (a.i === 5 ? 0 : a.i + 1) - (b.i === 5 ? 0 : b.i + 1));
    for (const { o, i } of lista) {
      if (i === 5) jarra(g, o.p[0], o.p[1], o.ang, t);
      else botella(g, o.p[0], o.p[1], o.ang);
    }
    g.fillStyle = "#bfe9ff";
    for (const d of this.gotas) { g.beginPath(); g.ellipse(d.x, d.y, 3.5, 5, 0, 0, 6.283); g.fill(); }
    this.p.dibujar(g);
    for (const o of this.textos) {
      const s = t - o.t0; if (s < 0 || s > 1.1) continue;
      const k = eBack(tramo(s, 0, 0.15));
      g.save(); g.translate(o.x, o.y); g.rotate(-0.1); g.scale(k, k);
      txt(g, o.s, 0, 0, { tam: 48, peso: 400, fam: FC, color: "#fffdf5", borde: "#3a2400", bordeAncho: 8, alfa: 1 - tramo(s, 0.85, 1.1), esp: 2 });
      g.restore();
    }
    // ¡MALABARISTA!
    if (t > 9.25) {
      const d = t - 9.25, k = tramo(d, 0, 0.17), s = lerp(2.5, 1, eIn(k)) * (1 + 0.03 * Math.sin(d * 8));
      const spr = this.titulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3) * luz; g.translate(760, 236); g.rotate(-0.06); g.scale(s, s);
      g.drawImage(spr, -spr.width / 2, -spr.height / 2); g.restore();
    }
    if (luz < 1) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
  titulo() {
    if (this._tit) return this._tit;
    const c = lienzoNuevo(560, 200), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 50, 0, 140);
    gr.addColorStop(0, "#e9fbff"); gr.addColorStop(0.5, "#7ff0f3"); gr.addColorStop(1, "#16b8c0");
    txt(g, "¡MALABARISTA!", 280, 140, { tam: 112, peso: 900, fam: FD, color: gr, borde: "#022c30", bordeAncho: 11, esp: 2, glow: "rgba(47,227,232,.8)", glowTam: 24, max: 500 });
    return (this._tit = c);
  }
}

registrar({ id: "00087", nombre: "Malabares", crear: () => new Malabares() });
})();
