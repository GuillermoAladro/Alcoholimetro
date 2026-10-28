"use strict";
/*
 * 00103 · MONUMENTOS DE LATAS
 *
 * Animación del banco. Empieza y acaba en negro.
 * Entra con la bolsa de litronas y gafas de sol y bebe lata tras lata, cada vez más rápido. Las latas que tira por
 * encima del hombro forman una pirámide, la torre de Pisa y la torre Eiffel (con contador de latas y carteles).
 * Él crece con cada lata hasta que la cámara se mete en su camisa y se funde a negro.
 * Dónde va cada lata: monumentos(), en motor/base.js (lo comparte con El eructo).
 */
(() => {
class EscenaMonumentos extends Escena {
  constructor() {
    super(12.5);
    this.M = monumentos();
    this.capa = lienzoNuevo(W, H); this.gc = this.capa.getContext("2d");
    this.volando = []; this.lanzadas = 0; this.puestas = 0; this.porMon = this.M.mons.map(() => 0); this.completo = this.M.mons.map(() => -1);
    this.p = new Parts(200);
    this.x = -150; this.fase = 0; this.esc = 1.45; this.ultimoCiclo = -1; this.cuenta = 0; this.pulso = 0;
    // horario de tragos: cada vez más rápido y con más latas por lanzamiento
    const N = this.M.latas.length, T0 = 2.25, T1 = 8.9;
    const ciclos = []; let tt = T0, n = 0, i = 0;
    while (n < N) {
      const d = Math.max(0.2, 0.95 * Math.pow(0.8, i)), k = i < 4 ? 1 : Math.min(14, Math.round(Math.pow(1.25, i - 2)));
      ciclos.push({ t0: tt, d, k: Math.min(k, N - n) }); tt += d; n += k; i++;
    }
    const f = (T1 - T0) / (tt - T0);
    for (const c of ciclos) { c.t0 = T0 + (c.t0 - T0) * f; c.d *= f; }
    this.ciclos = ciclos;
  }
  ciclo(t) {
    for (let i = this.ciclos.length - 1; i >= 0; i--) if (t >= this.ciclos[i].t0) return t < this.ciclos[i].t0 + this.ciclos[i].d ? i : -1;
    return -1;
  }
  estado() {
    const t = this.t, esc = this.esc;
    const pose = { cara: "sonrisa", rc: 0, gafas: true, piernaI: [0, 0], piernaD: [0, 0] };
    let manoD = [76, 156], manoI = [9, 160], bote = 0, lata = null;
    // entra andando con la bolsa (la de La tienda 24H)
    if (t < 1.75) { const a = andar(this.fase, 0.9); pose.piernaI = a.piernaI; pose.piernaD = a.piernaD; bote = a.bote; }
    // se pasa la bolsa a la mano izquierda, delante de la tripa
    const kPasa = eInOut(tramo(t, 1.75, 2.05)), kSuelta = eInOut(tramo(t, 2.05, 2.25));
    let bolsaEn = "D";
    if (kPasa > 0) { manoD = mezcla(manoD, [40, 150], kPasa); manoI = mezcla(manoI, [30, 152], kPasa); }
    if (t >= 2.05) { bolsaEn = "I"; manoD = mezcla([40, 150], [70, 158], kSuelta); manoI = [30, 152]; }
    // ciclos de beber: mete la mano en la bolsa, a la boca, trago y la tira por encima del hombro
    const ci = this.ciclo(t);
    if (ci >= 0) {
      const c = this.ciclos[ci], u = (t - c.t0) / c.d;
      const bolsa = [38, 146], b = boca(-0.3 * Math.sin(Math.PI * tramo(u, 0.35, 0.8)));
      const tope = rot2([1.5, -13], -1.6);
      const enBoca = [b[0] - tope[0] + 2, b[1] - tope[1]];
      if (u < 0.22) manoD = mezcla([84, 70], bolsa, eInOut(u / 0.22));
      else if (u < 0.42) manoD = mezcla(bolsa, enBoca, eInOut((u - 0.22) / 0.2));
      else if (u < 0.75) manoD = enBoca;
      else manoD = mezcla(enBoca, [84, 70], eOut((u - 0.75) / 0.25));
      if (ci === 0 && u < 0.22) manoD = mezcla([70, 158], bolsa, eInOut(u / 0.22));
      pose.rc = -0.3 * Math.sin(Math.PI * tramo(u, 0.35, 0.8));
      const ang = u < 0.22 ? 0 : u < 0.42 ? -1.6 * eInOut((u - 0.22) / 0.2) : u < 0.75 ? -1.6 - 0.4 * tramo(u, 0.42, 0.75) : -2.0;
      if (u > 0.18 && u < 0.86) lata = ang;
      pose.cara = this.lanzadas > this.M.latas.length * 0.55 ? "borracho" : "risa";
    } else if (t > 8.9) {
      manoD = mezcla([84, 70], [70, 158], eInOut(tramo(t, 8.9, 9.3)));
      pose.cara = "risa";
    }
    pose.manoD = manoD; pose.manoI = manoI; pose.brazoIDelante = bolsaEn === "I";
    if (bolsaEn === "D") pose.objD = (g, m) => dibujarBolsa(g, m[0] + 1, m[1] - 3, 0.2 * Math.sin(this.fase) * (t < 1.75 ? 1 : 0));
    else pose.objI = (g, m) => dibujarBolsa(g, m[0], m[1] - 3, 0.03 * Math.sin(t * 3));
    if (lata !== null) pose.objD = (g, m) => dibujarLata(g, m[0], m[1], lata, { abierta: true });
    const m = matAv(this.x, PIES + bote, esc);
    return { pose, m };
  }
  /** Cámara: al final se acerca a su camisa hasta llenar la pantalla. */
  camara() {
    const k = eInOut(tramo(this.t, 10.7, 12.4));
    const Z = Math.exp(Math.log(12) * k);
    const P = aPant(matAv(W / 2, PIES, 2.4), [39, 108]);
    return { Z, cx: lerp(W / 2, P[0], k), cy: lerp(H / 2, P[1], k), k };
  }
  actualizar(dt) {
    const t = (this.t += dt);
    if (t < 1.75) { this.x = lerp(-150, W / 2, eOut(t / 1.75) * 0.25 + (t / 1.75) * 0.75); this.fase += dt * 9; } else this.x = W / 2;
    const N = this.M.latas.length;
    this.esc = lerp(this.esc, 1.45 + 0.95 * Math.pow(this.lanzadas / N, 0.85), Math.min(1, 6 * dt));
    if (t > 9.4) this.esc = lerp(this.esc, 2.4, Math.min(1, 6 * dt));
    // lanzar las latas de cada ciclo
    const ci = this.ciclo(t);
    if (ci >= 0 && ci !== this.ultimoCiclo) {
      const c = this.ciclos[ci], u = (t - c.t0) / c.d;
      if (u >= 0.8) {
        this.ultimoCiclo = ci;
        const q = aPant(this.estado().m, [84, 70]);
        for (let j = 0; j < c.k && this.lanzadas < N; j++) {
          const li = this.M.orden[this.lanzadas++], L = this.M.latas[li];
          this.volando.push({ li, x0: q[0], y0: q[1], x1: L.x, y1: L.y, t0: t + j * 0.025, d: azar(0.5, 0.75), r0: azar(0, 6), vr: azar(-16, 16), alto: azar(120, 260) });
        }
      }
    }
    // latas que llegan a su sitio
    for (const v of this.volando) {
      if (t - v.t0 >= v.d) {
        v.fin = true;
        const L = this.M.latas[v.li];
        lataSuelta(this.gc, L.x, L.y, 0);
        this.puestas++; this.porMon[L.m]++; this.pulso = 1;
        if (this.porMon[L.m] === this.M.mons[L.m].n) { this.completo[L.m] = t; temblar(4, 0.15); }
        if (Math.random() < 0.25) this.p.nueva(P.DESTELLO, L.x, L.y, 0, 0, 0.25, 26);
      }
    }
    this.volando = this.volando.filter((v) => !v.fin);
    this.pulso = Math.max(0, this.pulso - dt * 5);
    this.p.actualizar(dt);
  }
  dibujar(g) {
    const t = this.t, e = this.estado(), cam = this.camara();
    fondo(g, "#000");
    g.save();
    g.translate(W / 2, H / 2); g.scale(cam.Z, cam.Z); g.translate(-cam.cx, -cam.cy);
    // suelo
    const gs = g.createLinearGradient(0, PIES - 4, 0, H + 40);
    gs.addColorStop(0, "#1a1a1d"); gs.addColorStop(1, "#050506");
    g.fillStyle = gs; g.fillRect(-60, PIES, W + 120, H - PIES + 80);
    g.drawImage(this.capa, 0, 0);
    // carteles de los monumentos
    this.M.mons.forEach((mo, i) => {
      const tc = this.completo[i];
      if (tc < 0) return;
      const k = tramo(t, tc, tc + 0.3), a = 1 - tramo(t, 10.6, 10.95);
      g.save(); g.translate(mo.x + (i === 1 ? -28 : 0), mo.top - 26); g.scale(eBack(k), eBack(k)); g.globalAlpha = a;
      const s = `${mo.nombre} · ${mo.n} LATAS`;
      g.font = `800 15px ${FT}`;
      const w = g.measureText(s).width + 22;
      rectR(g, -w / 2, -15, w, 28, 6); g.fillStyle = "#c99a2e"; g.fill();
      g.strokeStyle = "#5a3d00"; g.lineWidth = 2; g.stroke();
      txt(g, s, 0, 5, { tam: 15, peso: 800, color: "#2a1a00" });
      g.restore();
    });
    pintarAvatar(g, e.m, e.pose, t);
    for (const v of this.volando) {
      const u = clamp((t - v.t0) / v.d, 0, 1);
      if (t < v.t0) continue;
      lataSuelta(g, lerp(v.x0, v.x1, u), lerp(v.y0, v.y1, u) - v.alto * 4 * u * (1 - u), v.r0 + v.vr * u * v.d * (1 - u * 0.999), 1 + 0.4 * (1 - u));
    }
    this.p.dibujar(g);
    g.restore();
    // marcador de latas
    const a = 1 - tramo(t, 10.5, 10.9);
    if (t > 2.2 && a > 0) {
      txt(g, "LATAS", 34, 52, { tam: 22, peso: 800, color: "#2bff5b", alin: "left", esp: 3, alfa: a });
      g.save(); g.translate(34, 128); g.scale(1 + 0.12 * this.pulso, 1 + 0.12 * this.pulso);
      txt(g, String(this.puestas).padStart(3, "0"), 0, 0, { tam: 84, peso: 900, fam: FD, color: "#fff", alin: "left", alfa: a, esp: 2 });
      g.restore();
    }
    // empieza en negro y acaba en negro: su camisa se funde
    const aIn = 1 - tramo(t, 0, 0.35);
    if (aIn > 0) { g.fillStyle = `rgba(0,0,0,${aIn})`; g.fillRect(-60, -60, W + 120, H + 120); }
    const kN = tramo(t, 11.85, 12.45);
    if (kN > 0) { g.fillStyle = `rgba(0,0,0,${kN})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00103", nombre: "Monumentos de latas", crear: () => new EscenaMonumentos() });
})();
