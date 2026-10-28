"use strict";
/*
 * 00180 · MONTAR LA TERRAZA
 *
 * Animación del banco. Empieza y acaba en negro.
 * Por la mañana, delante del bar, Marcos abre una mesa plegable (¡CLAC!) y Guillermo una silla (¡CRIC!). Guillermo
 * se sienta de un salto y la silla se cierra y lo atrapa como un bocadillo (¡ÑAC!): da saltitos sin poder salir.
 * Marcos se parte de risa, va a ayudarle y tira de él hasta sacarlo (¡PLOP!). Van a parar los dos contra la sombrilla,
 * que se abre de golpe (¡FLOOMP!) y con una ráfaga los levanta un poco del suelo: ¡A LA TERRAZA!
 */
(() => {
const ESC = 1.4;
const CX = 300, TX = 812, PX = 545, HUB = 215;           // silla, mesa, sombrilla (x del mástil y altura del cubo)
const T_MESA0 = 0.6, T_MESA1 = 1.0, T_SILLA0 = 1.15, T_SILLA1 = 1.6, T_SIENTA = 1.9, T_NAC = 2.15;
const T_RIE = 2.3, T_VA = 3.0, T_LLEGA = 3.7, T_POP = 4.6, T_ATERRIZA = 5.0, T_ABRE = 5.3, T_SUBE = 5.55;
const T_BAJA = 7.85, T_SUELO = 8.4, T_CHOCA = 9.0, T_APAGA = 9.8, DUR = 10.3;
const XG0 = 196, XM0 = 884, XGP = 488, XMP = 600;
const CT = cacheTexto();
const aU = (X, q, Y = PIES) => [(q[0] - X) / ESC + 39, (q[1] - Y) / ESC + 232];

class Terraza extends Escena {
  constructor() {
    super(DUR);
    this.p = new Parts(320);
  }
  luz() { return tramo(this.t, 0, 0.5) * (1 - tramo(this.t, T_APAGA, DUR - 0.05)); }
  /** Lo que sube la sombrilla (con ellos colgados) y su balanceo. */
  vuelo(t) {
    let lift = 0;
    if (t > T_SUBE && t < T_SUELO) lift = 56 * eOut(tramo(t, T_SUBE, T_SUBE + 0.6)) * (1 - eIn(tramo(t, T_BAJA, T_SUELO))) + 6 * Math.sin((t - T_SUBE) * 3) * tramo(t, T_SUBE + 0.5, T_SUBE + 0.9) * (1 - tramo(t, T_BAJA - 0.3, T_BAJA));
    const sway = t > T_SUBE && t < T_SUELO + 0.4 ? 0.07 * Math.sin((t - T_SUBE) * 2.6) * (1 - tramo(t, T_BAJA, T_SUELO + 0.4)) : 0;
    return { lift, sway };
  }
  apertura(t) { return t < T_ABRE ? 0 : eElastico(tramo(t, T_ABRE, T_ABRE + 0.55)); }
  /** Estado de Guillermo: x, dy, atrapado, etc. */
  gui(t) {
    let x = XG0, dy = 0;
    if (t > T_SILLA1 && t < T_NAC) {
      // salto para sentarse
      const u = tramo(t, T_SILLA1 + 0.05, T_NAC);
      x = lerp(XG0, CX, eInOut(u)); dy = -Math.sin(u * Math.PI) * 60 + 30 * eIn(tramo(u, 0.7, 1));
    }
    if (t >= T_NAC && t < T_POP) { x = CX; dy = 30 - Math.abs(Math.sin((t - T_NAC) * 7)) * 26 * (t > T_NAC + 0.2 && t < T_LLEGA + 0.1 ? 1 : 0); }
    if (t >= T_POP && t < T_ATERRIZA + 0.1) {
      const u = tramo(t, T_POP, T_ATERRIZA);
      x = lerp(CX, XGP, eOut(u)); dy = lerp(30, 0, u) - Math.sin(u * Math.PI) * 150;
    }
    if (t >= T_ATERRIZA + 0.1) x = XGP;
    return { x, dy, atrapado: t >= T_NAC && t < T_POP };
  }
  xm(t) {
    let x = XM0;
    if (t > T_VA) x = lerp(XM0, 458, eInOut(tramo(t, T_VA, T_LLEGA)));
    if (t > T_POP) x = lerp(458, XMP, eOut(tramo(t, T_POP, T_ATERRIZA + 0.05)));
    return x;
  }
  poses() {
    const t = this.t, Gs = this.gui(t), xm = this.xm(t), V = this.vuelo(t), ab = this.apertura(t);
    const G = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [70, 158], manoI: [9, 160] };
    const M = { quien: "marcos", cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [67, 152], manoI: [6, 152] };
    let dyM = 0, giroM = 0, giroG = 0, sxG = 1, syG = 1;
    // ---- Marcos abre la mesa
    if (t > T_MESA0 - 0.3 && t < T_MESA1 + 0.4) {
      const k = eInOut(tramo(t, T_MESA0 - 0.3, T_MESA0)), u = this.mesa(t);
      const borde = [TX + 4, lerp(392, 452, u)];
      M.brazoIDelante = true; M.manoI = mezcla([6, 152], aU(xm, borde), k * (1 - tramo(t, T_MESA1 + 0.1, T_MESA1 + 0.4)));
      M.cara = t > T_MESA1 ? "guino" : "sonrisa"; M.rc = -0.08;
    }
    // ---- Guillermo abre la silla y se sienta
    if (t > T_SILLA0 - 0.3 && t < T_SILLA1 + 0.1) {
      const k = eInOut(tramo(t, T_SILLA0 - 0.3, T_SILLA0));
      G.manoD = mezcla([70, 158], aU(Gs.x, [CX - 30, 470]), k);
      G.cara = t > T_SILLA1 - 0.1 ? "risa" : "sonrisa"; G.rc = 0.06;
    }
    if (t > T_SILLA1 && t < T_NAC) { G.cara = "risa"; G.manoD = [96, 60]; G.manoI = [-18, 60]; }
    // ---- atrapado
    if (Gs.atrapado) {
      G.cara = Math.sin(t * 6) > 0 ? "sorpresa" : "borracho";
      G.piernaI = [-14, 0.75]; G.piernaD = [-14, -0.75];
      const s = Math.sin(t * 14);
      G.manoD = [92 + 6 * s, 30 - 10 * s]; G.manoI = [-14 - 6 * s, 30 + 10 * s];
      G.rc = 0.12 * Math.sin(t * 7); syG = 0.94;
      if (t > T_LLEGA) {
        // le da la mano a Marcos
        G.manoD = aU(Gs.x, this.manoTirar(t), PIES + Gs.dy); G.cara = "sorpresa"; G.rc = 0.1;
      }
    }
    // ---- Marcos se ríe y va a ayudar
    if (t > T_RIE && t < T_VA) { M.cara = "risa"; M.manoD = [52, 128]; M.manoI = [22, 128]; M.brazoIDelante = true; dyM = -Math.abs(Math.sin(t * 16)) * 6; M.rc = -0.12; }
    if (t >= T_VA && t < T_LLEGA) {
      const an = andar((t - T_VA) * 14, 1.1);
      M.piernaI = an.piernaI; M.piernaD = an.piernaD; dyM = an.bote; M.cara = "guino"; M.rc = -0.1;
    }
    if (t >= T_LLEGA - 0.15 && t < T_POP) {
      // tira de Guillermo con las dos manos
      const tir = this.manoTirar(t);
      M.brazoIDelante = true; M.manoI = aU(xm, [tir[0] + 2, tir[1] + 2]); M.manoD = aU(xm, [tir[0] + 18, tir[1] + 10]);
      const tiron = Math.max(0, Math.sin((t - T_LLEGA) * 10));
      giroM = 0.12 + 0.08 * tiron; M.cara = "dormido"; M.rc = 0.15;
    }
    // ---- ¡PLOP!: salen despedidos hacia la sombrilla
    if (t >= T_POP && t < T_ATERRIZA + 0.1) {
      G.cara = "sorpresa"; M.cara = "sorpresa";
      G.manoD = [96, 50]; G.manoI = [-18, 50]; M.manoD = [92, 60]; M.manoI = [-18, 60];
      giroM = 0.18 * (1 - tramo(t, T_POP, T_ATERRIZA)); giroG = 0.3 * Math.sin(tramo(t, T_POP, T_ATERRIZA) * Math.PI);
      dyM = -Math.sin(tramo(t, T_POP, T_ATERRIZA) * Math.PI) * 30;
    }
    // ---- agarrados al mástil (y luego volando)
    if (t >= T_ATERRIZA) {
      const k = eOut(tramo(t, T_ATERRIZA, T_ATERRIZA + 0.2)) * (1 - eInOut(tramo(t, T_SUELO + 0.25, T_SUELO + 0.55)));
      G.manoD = mezcla([70, 158], aU(XGP, [PX - 5, 300]), k); G.manoI = mezcla([9, 160], aU(XGP, [PX - 3, 335]), k); G.brazoIDelante = true;
      M.manoI = mezcla([6, 152], aU(XMP, [PX + 4, 318]), k); M.manoD = mezcla([67, 152], aU(XMP, [PX + 11, 352]), k); M.brazoIDelante = true;
      G.cara = t < T_ABRE ? "risa" : t < T_SUBE + 0.4 ? "sorpresa" : t < T_SUELO ? (Math.sin(t * 2) > 0 ? "risa" : "sorpresa") : "risa";
      M.cara = t < T_ABRE ? "risa" : t < T_SUBE + 0.4 ? "sorpresa" : t < T_SUELO ? (Math.sin(t * 2 + 1) > 0 ? "risa" : "guino") : "risa";
      G.rc = 0.1; M.rc = -0.1;
      if (V.lift > 4) {
        // piernas colgando
        const s = Math.sin(t * 5);
        G.piernaI = [0, 0.15 * s]; G.piernaD = [0, -0.12 * s]; M.piernaI = [0, -0.12 * s]; M.piernaD = [0, 0.15 * s];
        G.puntas = 0.6; M.puntas = 0.6;
      }
      if (t > T_SUELO + 0.45) {
        // ¡choca!
        const kc = eOut(tramo(t, T_CHOCA - 0.25, T_CHOCA));
        G.manoD = mezcla([70, 158], aU(XGP, [PX - 2, 300]), kc); G.brazoIDelante = false;
        M.manoI = mezcla([6, 152], aU(XMP, [PX + 2, 300]), kc); M.brazoIDelante = true;
        G.cara = t > T_CHOCA ? "guino" : "risa"; M.cara = "risa";
      }
    }
    void ab;
    return [
      { pose: G, m: matAv(Gs.x, PIES + Gs.dy, ESC, giroG, sxG, syG), colgado: t >= T_ATERRIZA },
      { pose: M, m: matAv(xm, PIES + dyM, ESC, giroM), colgado: t >= T_ATERRIZA },
    ];
  }
  /** Dónde se dan la mano al tirar (pantalla). */
  manoTirar(t) {
    const tir = Math.max(0, Math.sin((t - T_LLEGA) * 10)) * (t > T_LLEGA ? 1 : 0);
    return [374 + tir * 12, 336];
  }
  mesa(t) { return eOut(tramo(t, T_MESA0, T_MESA1)); }
  silla(t) { return eOut(tramo(t, T_SILLA0, T_SILLA1)); }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    this.una("mesa", t > T_MESA1, () => { temblar(6, 0.15); for (let i = 0; i < 8; i++) p.nueva(P.POLVO, TX + azar(-60, 60), 440, azar(-80, 80), azar(-40, 10), azar(0.3, 0.5), azar(14, 22)); });
    this.una("silla", t > T_SILLA1, () => temblar(4, 0.12));
    this.una("nac", t > T_NAC, () => { temblar(14, 0.3); for (let i = 0; i < 12; i++) p.nueva(P.POLVO, CX + azar(-50, 50), 560, azar(-120, 120), azar(-60, 0), azar(0.4, 0.7), azar(18, 30)); });
    this.una("pop", t > T_POP, () => {
      temblar(14, 0.3);
      p.nueva(P.DESTELLO, CX, 420, 0, 0, 0.3, 120);
      for (let i = 0; i < 14; i++) { const a = azar(0, 6.283), v = azar(120, 300); p.nueva(P.CHISPA, CX, 420, Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.5), azar(5, 8)); }
    });
    this.una("abre", t > T_ABRE, () => { temblar(16, 0.35); for (let i = 0; i < 16; i++) p.nueva(P.POLVO, PX + azar(-200, 200), HUB + azar(-20, 40), azar(-200, 200), azar(-80, 40), azar(0.4, 0.8), azar(20, 40)); });
    this.una("suelo", t > T_SUELO, () => { temblar(10, 0.25); for (let i = 0; i < 14; i++) p.nueva(P.POLVO, PX + azar(-120, 120), 568, azar(-150, 150), azar(-50, 0), azar(0.4, 0.7), azar(18, 30)); });
    this.una("choca", t > T_CHOCA, () => {
      temblar(8, 0.2);
      p.nueva(P.DESTELLO, PX, 300, 0, 0, 0.3, 110);
      for (let i = 0; i < 12; i++) { const a = azar(0, 6.283), v = azar(120, 280); p.nueva(P.CHISPA, PX, 300, Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.5), azar(5, 8)); }
      for (let i = 0; i < 70; i++) p.nueva(P.CONFETI, azar(40, W - 40), azar(-60, -10), azar(-40, 40), azar(0, 120), azar(1.8, 2.6), azar(9, 14), i % 5);
    });
    p.suelo = () => 572;
    p.alfa = this.luz();
    p.actualizar(dt);
  }
  /** Fondo: cielo de mañana, fachada del bar, suelo de baldosas. */
  fondoFijo() {
    if (this.cF) return this.cF;
    const c = lienzoNuevo(W, H), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 0, 0, 380);
    gr.addColorStop(0, "#3d7fc9"); gr.addColorStop(0.7, "#9cc8ec"); gr.addColorStop(1, "#ffd9a8");
    g.fillStyle = gr; g.fillRect(0, 0, W, 400);
    g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.6; g.drawImage(BLOB2.oroClaro, 760, -60, 300, 300); g.globalCompositeOperation = "source-over"; g.globalAlpha = 1;
    // nubes
    g.fillStyle = "rgba(255,255,255,.8)";
    for (const [x, y, s] of [[130, 70, 1], [420, 40, 0.8], [900, 110, 0.9]]) {
      g.beginPath(); g.arc(x, y, 26 * s, 0, 6.283); g.arc(x + 30 * s, y - 10 * s, 32 * s, 0, 6.283); g.arc(x + 64 * s, y, 24 * s, 0, 6.283); g.rect(x, y, 64 * s, 24 * s); g.fill();
    }
    // fachada (pared con ventana y puerta) en la parte de atrás
    g.fillStyle = "#e9dcc4"; g.fillRect(0, 150, W, 300);
    g.fillStyle = "rgba(0,0,0,.08)"; for (let y = 160; y < 450; y += 22) g.fillRect(0, y, W, 2);
    // toldo a rayas sobre la ventana
    for (let i = 0; i < 12; i++) { g.fillStyle = i % 2 ? "#fffdf5" : "#2f8a4a"; g.fillRect(40 + i * 40, 160, 40, 46); }
    g.fillStyle = "rgba(0,0,0,.15)"; g.fillRect(40, 200, 480, 6);
    for (let i = 0; i < 12; i++) { g.fillStyle = i % 2 ? "#fffdf5" : "#2f8a4a"; g.beginPath(); g.arc(60 + i * 40, 206, 20, 0, Math.PI); g.fill(); }
    // ventana con luz cálida
    g.fillStyle = "#5a3218"; g.fillRect(62, 230, 436, 170);
    const gv = g.createLinearGradient(0, 238, 0, 392); gv.addColorStop(0, "#ffd78a"); gv.addColorStop(1, "#d98a2b");
    g.fillStyle = gv; g.fillRect(72, 240, 416, 150);
    g.fillStyle = "#5a3218"; g.fillRect(276, 240, 8, 150);
    // puerta
    g.fillStyle = "#5a3218"; g.fillRect(640, 210, 150, 240);
    g.fillStyle = "#7a4a28"; g.fillRect(652, 222, 126, 228);
    g.fillStyle = "#ffd78a"; g.fillRect(668, 238, 94, 90);
    g.fillStyle = "#ffd34d"; g.beginPath(); g.arc(764, 350, 6, 0, 6.283); g.fill();
    // zócalo y acera
    g.fillStyle = "#8a7a64"; g.fillRect(0, 440, W, 14);
    const gs = g.createLinearGradient(0, 454, 0, H); gs.addColorStop(0, "#c9b79a"); gs.addColorStop(1, "#8a7356");
    g.fillStyle = gs; g.fillRect(0, 454, W, H - 454);
    g.strokeStyle = "rgba(80,60,40,.35)"; g.lineWidth = 2;
    for (const y of [480, 516, 572]) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
    for (let i = -8; i <= 8; i++) { g.beginPath(); g.moveTo(512 + i * 70, 454); g.lineTo(512 + i * 130, H); g.stroke(); }
    return (this.cF = c);
  }
  /** Mesa plegable redonda: u = 0 tablero de pie (plegada), 1 abierta. */
  dibujarMesa(g, u) {
    const yTop = 438;
    g.fillStyle = "rgba(0,0,0,.25)"; g.beginPath(); g.ellipse(TX, 572, 60, 9, 0, 0, 6.283); g.fill();
    // pie
    g.strokeStyle = "#3a3f46"; g.lineWidth = 7; g.lineCap = "round";
    g.beginPath(); g.moveTo(TX, yTop + 6); g.lineTo(TX, 560); g.moveTo(TX - 40, 570); g.lineTo(TX, 552); g.lineTo(TX + 40, 570); g.stroke();
    // tablero: de disco de frente a elipse
    const ry = lerp(64, 12, u), cy = lerp(yTop - 54, yTop, u);
    const gr = g.createLinearGradient(TX - 66, 0, TX + 66, 0);
    gr.addColorStop(0, "#9aa3ab"); gr.addColorStop(0.4, "#f0f4f6"); gr.addColorStop(1, "#7d868e");
    g.fillStyle = "#5d656d"; g.beginPath(); g.ellipse(TX, cy + 4, 66, ry, 0, 0, 6.283); g.fill();
    g.fillStyle = gr; g.beginPath(); g.ellipse(TX, cy, 66, ry, 0, 0, 6.283); g.fill();
    g.strokeStyle = "rgba(0,0,0,.25)"; g.lineWidth = 1.5; g.stroke();
  }
  /** Silla plegable de frente. estado: u apertura (0 plegada, 1 abierta) o "tumbada" (k 0–1). */
  dibujarSilla(g, x, dy, u, tumbada) {
    const F = 572 + dy;
    g.save();
    if (tumbada > 0) { g.translate(x, F); g.rotate(-tumbada * Math.PI / 2 * 0.98); g.translate(-x, -F); }
    const metal = "#aeb7bf", madera = "#b5652b";
    g.strokeStyle = metal; g.lineWidth = 6; g.lineCap = "round";
    // patas traseras y respaldo
    g.beginPath(); g.moveTo(x - 34, F); g.lineTo(x - 36, F - 160); g.moveTo(x + 34, F); g.lineTo(x + 36, F - 160); g.stroke();
    g.fillStyle = madera; rectR(g, x - 38, F - 164, 76, 34, 5); g.fill();
    g.fillStyle = "rgba(255,255,255,.25)"; g.fillRect(x - 32, F - 160, 64, 4);
    // asiento: de vertical (plegada) a horizontal
    const hs = lerp(64, 12, u), ys = lerp(F - 120, F - 86, u);
    g.fillStyle = "#8a4a1e"; rectR(g, x - 42, ys, 84, hs + 4, 4); g.fill();
    g.fillStyle = madera; rectR(g, x - 42, ys, 84, hs, 4); g.fill();
    g.fillStyle = "rgba(255,255,255,.25)"; g.fillRect(x - 36, ys + 2, 72, 3);
    // patas delanteras (se abren)
    g.beginPath(); g.moveTo(x - 30 - 10 * u, F); g.lineTo(x - 30, ys + hs / 2); g.moveTo(x + 30 + 10 * u, F); g.lineTo(x + 30, ys + hs / 2); g.stroke();
    g.restore();
  }
  /** La silla cerrada con Guillermo dentro: parte de atrás (antes del avatar) y de delante (después). */
  sillaTrampa(g, x, dy, parte) {
    const F = 572 + dy;
    const metal = "#aeb7bf", madera = "#b5652b";
    if (parte === "atras") {
      g.strokeStyle = metal; g.lineWidth = 6; g.lineCap = "round";
      g.beginPath(); g.moveTo(x - 36, F - 40); g.lineTo(x - 40, F - 196); g.moveTo(x + 36, F - 40); g.lineTo(x + 40, F - 196); g.stroke();
      g.fillStyle = madera; rectR(g, x - 44, F - 206, 88, 36, 5); g.fill();
      return;
    }
    g.fillStyle = "rgba(0,0,0,.3)"; g.beginPath(); g.ellipse(x, 572, 70, 10, 0, 0, 6.283); g.fill();
    g.strokeStyle = metal; g.lineWidth = 7; g.lineCap = "round";
    g.beginPath(); g.moveTo(x - 46, F); g.lineTo(x - 48, F - 168); g.moveTo(x + 46, F); g.lineTo(x + 48, F - 168); g.stroke();
    // el asiento cerrado contra la barriga
    g.fillStyle = "#8a4a1e"; rectR(g, x - 52, F - 160, 104, 98, 6); g.fill();
    g.fillStyle = madera; rectR(g, x - 52, F - 164, 104, 96, 6); g.fill();
    g.fillStyle = "rgba(0,0,0,.18)"; for (let i = 0; i < 4; i++) g.fillRect(x - 48, F - 150 + i * 22, 96, 3);
    g.fillStyle = "rgba(255,255,255,.22)"; g.fillRect(x - 46, F - 160, 92, 4);
    g.strokeStyle = metal; g.lineWidth = 5;
    g.beginPath(); g.moveTo(x - 50, F - 66); g.lineTo(x + 50, F - 66); g.stroke();
  }
  /** La sombrilla: mástil y lona (k = apertura). Coordenadas de suelo. */
  sombrilla(g, k, t) {
    // mástil
    const gm = g.createLinearGradient(PX - 5, 0, PX + 5, 0);
    gm.addColorStop(0, "#9aa3ab"); gm.addColorStop(0.4, "#ffffff"); gm.addColorStop(1, "#7d868e");
    g.fillStyle = gm; g.fillRect(PX - 5, HUB, 10, 560 - HUB);
    // lona
    const rimY = HUB + lerp(112, 34, k), half = lerp(20, 236, k), apex = HUB - lerp(8, 50, k);
    const n = 8, cols = ["#2f8a4a", "#fffdf5"];
    const pt = (i) => { const u = i / n; return [PX - half + u * 2 * half, rimY + Math.sin(u * Math.PI) * lerp(4, 16, k)]; };
    for (let i = 0; i < n; i++) {
      const a = pt(i), b = pt(i + 1);
      g.fillStyle = cols[i % 2];
      g.beginPath(); g.moveTo(PX, apex);
      g.quadraticCurveTo(lerp(PX, a[0], 0.75), lerp(apex, a[1], 0.15) - 10 * k, a[0], a[1]);
      g.quadraticCurveTo((a[0] + b[0]) / 2, Math.max(a[1], b[1]) + 10 * k, b[0], b[1]);
      g.quadraticCurveTo(lerp(PX, b[0], 0.75), lerp(apex, b[1], 0.15) - 10 * k, PX, apex);
      g.fill();
    }
    g.strokeStyle = "rgba(0,0,0,.2)"; g.lineWidth = 1.5;
    g.beginPath(); for (let i = 0; i <= n; i++) { const a = pt(i); g.moveTo(PX, apex); g.lineTo(a[0], a[1]); } g.stroke();
    // flecos
    if (k > 0.3) {
      for (let i = 0; i < 2 * n; i++) {
        const u = (i + 0.5) / (2 * n), x = PX - half + u * 2 * half, y = rimY + Math.sin(u * Math.PI) * 16 + 2;
        g.fillStyle = i % 2 ? "#fffdf5" : "#2f8a4a"; g.beginPath(); g.arc(x, y, half / n / 2, 0, Math.PI); g.fill();
      }
    }
    g.fillStyle = "#e7a900"; g.beginPath(); g.arc(PX, apex - 4, 6, 0, 6.283); g.fill();
    void t;
  }
  dibujar(g) {
    const t = this.t, a = this.luz(), e = this.poses(), Gs = this.gui(t), V = this.vuelo(t), k = this.apertura(t);
    fondo(g, "#000");
    g.save(); g.globalAlpha = a;
    g.drawImage(this.fondoFijo(), 0, 0);
    // base de la sombrilla (se queda en el suelo)
    g.fillStyle = "rgba(0,0,0,.3)"; g.beginPath(); g.ellipse(PX, 572, 56, 9, 0, 0, 6.283); g.fill();
    g.fillStyle = "#3a3f46"; g.beginPath(); g.ellipse(PX, 562, 46, 12, 0, 0, 6.283); g.fill(); g.fillRect(PX - 46, 556, 92, 8);
    g.fillStyle = "#555c64"; g.beginPath(); g.ellipse(PX, 556, 46, 12, 0, 0, 6.283); g.fill();
    this.dibujarMesa(g, this.mesa(t));
    // la silla
    if (t < T_NAC) this.dibujarSilla(g, CX, 0, this.silla(t), 0);
    else if (t >= T_POP) this.dibujarSilla(g, CX + 10, 0, 0.2, eOut(tramo(t, T_POP, T_POP + 0.4)) * 1.0);
    // grupo que vuela: mástil, lona y los dos colgados
    const conVuelo = (f) => { g.save(); g.translate(PX, HUB - V.lift); g.rotate(V.sway); g.translate(-PX, -HUB); f(); g.restore(); };
    conVuelo(() => this.sombrilla(g, k, t));
    // Marcos por detrás de Guillermo
    const pinta = (i) => { if (e[i].colgado) conVuelo(() => pintarAvatar(g, e[i].m, e[i].pose, t)); else pintarAvatar(g, e[i].m, e[i].pose, t); };
    if (Gs.atrapado) this.sillaTrampa(g, CX, Gs.dy - 30, "atras");
    pinta(1);
    pinta(0);
    if (Gs.atrapado) this.sillaTrampa(g, CX, Gs.dy - 30, "delante");
    // ráfaga
    if (t > T_ABRE && t < T_BAJA + 0.3) {
      const ka = tramo(t, T_ABRE, T_ABRE + 0.2) * (1 - tramo(t, T_BAJA - 0.2, T_BAJA + 0.3));
      g.save(); g.strokeStyle = "rgba(255,255,255,.75)"; g.lineCap = "round"; g.lineWidth = 4; g.globalAlpha = a * ka;
      for (let i = 0; i < 7; i++) {
        const y = 140 + i * 58 + Math.sin(i * 3) * 20, x = W + 100 - ((t * 900 + i * 260) % (W + 400));
        g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 60, y - 14, x + 140, y); g.stroke();
      }
      g.restore();
    }
    g.restore();
    this.p.dibujar(g);
    const ono = (s, x, y, t0, dur, tam, col, borde, rot) => {
      const d = t - t0;
      if (d < 0 || d > dur) return;
      const kk = eBack(tramo(d, 0, 0.1));
      g.save(); g.translate(x, y); g.rotate(rot); g.scale(kk, kk);
      txt(g, s, 0, 0, { tam, peso: 400, fam: FC, color: col, borde, bordeAncho: 8, esp: 2, alfa: a * (1 - tramo(d, dur - 0.15, dur)) });
      g.restore();
    };
    ono("¡CLAC!", TX + 10, 330, T_MESA1, 0.55, 46, "#fffdf5", "#1b1b1b", 0.1);
    ono("¡CRIC!", CX - 70, 360, T_SILLA1, 0.5, 42, "#fffdf5", "#1b1b1b", -0.1);
    ono("¡ÑAC!", CX + 40, 250, T_NAC, 0.8, 66, "#ff5a5a", "#3a0505", -0.12);
    ono("¡JA, JA!", 860, 220, T_RIE + 0.1, 0.7, 44, "#ffd34d", "#3a2400", 0.1);
    ono("¡PLOP!", CX, 300, T_POP, 0.6, 62, "#2fe3e8", "#06303a", -0.1);
    ono("¡FLOOMP!", 800, 230, T_ABRE, 0.7, 58, "#fffdf5", "#1b1b1b", 0.12);
    ono("¡PUF!", PX - 150, 520, T_SUELO, 0.5, 44, "#fffdf5", "#1b1b1b", -0.1);
    ono("¡CHOCA!", PX + 215, 330, T_CHOCA, 0.6, 48, "#ffd34d", "#3a2400", 0.1);
    // ¡A LA TERRAZA!
    if (t > T_SUBE + 0.1) {
      const d = t - T_SUBE - 0.1, kt = tramo(d, 0, 0.16), s = lerp(1.8, 1, eIn(kt)) * (1 + 0.02 * Math.sin(d * 7));
      const r = this.titulo();
      g.save(); g.globalAlpha = Math.min(1, kt * 3) * a; g.translate(512, 62 + Math.sin(d * 3) * 3); g.rotate(-0.03); g.scale(s, s);
      g.drawImage(r, -r.width / 2, -r.height / 2);
      g.restore();
    }
    const negro = 1 - a;
    if (negro > 0) { g.fillStyle = `rgba(0,0,0,${negro})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
  titulo() {
    if (CT.has(1)) return CT.get(1);
    const c = lienzoNuevo(1000, 170), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 40, 0, 140);
    gr.addColorStop(0, "#fffef0"); gr.addColorStop(0.5, "#ffe58a"); gr.addColorStop(1, "#f2a100");
    txt(g, "¡A LA TERRAZA!", 500, 128, { tam: 116, peso: 900, fam: FD, color: gr, borde: "#3a2400", bordeAncho: 12, esp: 5, glow: "rgba(255,190,40,.85)", glowTam: 22, max: 940 });
    CT.set(1, c);
    return c;
  }
}

registrar({ id: "00180", nombre: "Montar la terraza", crear: () => new Terraza() });
})();
