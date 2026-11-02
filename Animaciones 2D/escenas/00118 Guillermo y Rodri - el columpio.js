"use strict";
/* 00118 · Guillermo y Rodri · El columpio
 *
 * Negro → los columpios de un parque de noche: cielo azul marino con estrellas y luna, la ciudad a lo
 * lejos con sus ventanas, árboles, una farola con su cono de luz sobre la arena y dos columpios de
 * tubo pintado, uno al lado del otro. Rodri y Guillermo se columpian frente a frente → Rodri vuela
 * alto y tranquilo, con los ojos entornados y sin esfuerzo; le echa a Guillermo una mirada chula →
 * Guillermo se pica y bombea con todas sus fuerzas: cada vez más alto (la cámara se aleja), con la
 * lengua fuera y rojo de esfuerzo; Rodri se queda boquiabierto y frena arrastrando los pies →
 * Guillermo pasa por encima de la barra: arriba del todo, boca abajo, se queda un instante mirando
 * a cámara («¡uy!»)… y da la vuelta entera; las cadenas se enrollan en la barra y el columpio se
 * queda clavado de golpe en el aire, torcido, con Guillermo aplastado contra la barra y las piernas
 * colgando → mareado, mira abajo y suplica; Rodri se ríe, se baja de su columpio, se acerca, le
 * mira desde abajo y le da un buen empujón en la suela → Guillermo da la vuelta hacia atrás
 * desenrollándose como una hélice (Rodri se agacha cuando le pasa por encima) y se queda
 * columpiándose cada vez más flojo, mareado → miran a cámara; Rodri guiña → negro.
 *
 * Sin textos. Todo depende del tiempo absoluto (los tramos de física se integran una vez al cargar
 * con paso fijo, así que son deterministas). Cada columpio es un péndulo: el jinete se dibuja en su
 * postura «en reposo» (colgando bajo la barra) dentro de un giro alrededor del eje de la barra. Al
 * pasar por arriba, las cadenas se enrollan en la barra y se acortan. La cadena de delante se pinta
 * entre el cuerpo y la cabeza (capaTronco) para que pase por detrás de la cabeza y las manos la agarren.
 */
(() => {
  const { clamp, lerp, fase, suave, salida, entrada, tramo, campana, mezcla, hash, ruido } = M2;
  const G = Guillermo, RO = Rodri;
  const TAU = Math.PI * 2, PI = Math.PI, TINTA = "#141218";
  const S = 0.25, SY = 528;                               // escala de los dos y línea del suelo
  const DUR = 14.8;
  const PR = { x: 330, y: 120 }, PG = { x: 700, y: 120 };  // ejes de las barras
  const L0 = 300;                                          // largo de las cadenas (eje → asiento)
  const RB = 17.8;                                         // radio del enrollado (se acortan RB por radián)
  const W0 = TAU / 1.9, GR = W0 * W0 * L0;                 // periodo 1,9 s
  const T = {
    t0: 0.55,                                              // fase de los dos columpios
    rMira0: 1.4, rMira1: 2.5, gPique: 1.95, gBombea: 2.5,
    rNota: 4.4, rFrena0: 5.0, rFrena1: 7.4,
    salto: 6.25,                                            // empieza la vuelta (abajo, hacia delante)
    rLevanta0: 8.45, rLevanta1: 8.9, rAnda0: 8.95, rAnda1: 9.62,
    rMira: 10.0, rRie0: 10.12, rRie1: 10.6, alza0: 10.62, toca: 10.86, empuja: 11.0, suelta: 11.12,
    agacha0: 11.85, agacha1: 12.05, levanta0: 12.62, levanta1: 12.95,
    camara: 13.3, guino: 13.62, fin: 13.95
  };

  /* ---------- utilidades ---------- */
  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n] ?? a[n], k); return o; };
  function linea(guion, estados, ini, t) {
    let c = estados[ini];
    for (const [t0, t1, nom, f] of guion) { if (t <= t0) break; c = mezclaE(c, estados[nom], (f || suave)(fase(t, t0, t1))); }
    return Object.assign({}, c);
  }
  const parpadeo = (t, lista, d = 0.14) => { let o = 0; for (const tb of lista) { const k = fase(t, tb, tb + d); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); } return o; };
  const rota = (q, a) => { const c = Math.cos(a), s = Math.sin(a); return { x: q.x * c - q.y * s, y: q.x * s + q.y * c }; };
  const lienzo = (w, h) => { const c = document.createElement("canvas"); c.width = w; c.height = h; return c; };
  const amort = (t, t0, f, w) => t < t0 ? 0 : Math.exp(-(t - t0) * f) * Math.sin((t - t0) * w);
  const D = (pu, ix, md, re) => ({ pulgar: pu, indice: ix, medio: md ?? ix, anular: re ?? md ?? ix, menique: re ?? md ?? ix });
  // giro de un punto alrededor del eje P
  const giraEn = (P, a, q) => { const r = rota({ x: q.x - P.x, y: q.y - P.y }, a); return { x: P.x + r.x, y: P.y + r.y }; };

  /* ---------- caras ---------- */
  const BASE = { mx: 0.85, my: 0, c: 0, cd: 0, ci: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, abre: 0, ancho: 1, sonr: 0.15, lengua: 0, mof: 0, rub: 0, esp: 0 };
  const E = o => Object.assign({}, BASE, o);
  function cara(e, parp) {
    return { mirada: { x: clamp(e.mx, -1, 1), y: e.my }, iris: e.iris, espiral: e.esp,
      ojos: { d: clamp(Math.max(e.c, e.cd, parp)), i: clamp(Math.max(e.c, e.ci, parp)), feliz: e.h, apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: 0, abre: Math.max(0, e.abre), ancho: e.ancho, sonrisa: e.sonr, dientes: true, lengua: e.lengua },
      mofletes: e.mof, rubor: e.rub, bigote: 0 };
  }

  /* =====================================================================================
   * FÍSICA DE LOS COLUMPIOS
   * θ > 0: hacia delante (Rodri mira a la derecha, Guillermo a la izquierda). En pantalla, el
   * jinete de Guillermo se gira α = θ y el de Rodri α = −θ alrededor de su barra.
   * ===================================================================================== */
  const largoG = th => th > PI ? L0 - RB * (th - PI) : L0;
  // amplitud de Guillermo: le cuesta coger a Rodri, se pica y bombea hasta pasar por arriba
  const ampG = t => 0.42 + 0.63 * suave(fase(t, 0.2, 2.3)) + 1.07 * suave(fase(t, 2.55, T.salto));
  const ampR = t => 1.05 * (1 - suave(fase(t, T.rFrena0, T.rFrena1)));
  const A_FIN = ampG(T.salto) * W0;                       // velocidad al empezar la vuelta
  const TH_JAM = TAU + 1.1;                                 // ángulo en el que se atasca
  // tramos integrados (paso fijo; tablas cada 1/600 s)
  const DT = 1 / 2400, PASO = 1 / 600;
  function integra(t0, th0, w0, tFin, amortigua, para) {
    const tab = []; let t = t0, th = th0, w = w0, k = 0, next = t0;
    while (t <= tFin + PASO) {
      if (t >= next - 1e-9) { tab.push(th); next = t0 + (++k) * PASO; }
      if (para && para(th)) { return { t0, tab, tFin: t, th, w }; }
      const c = amortigua ? amortigua(th, w) : 0;
      const a = -(GR / largoG(th)) * Math.sin(th) - c * w;
      w += a * DT; th += w * DT; t += DT;
    }
    return { t0, tab, tFin: t, th, w };
  }
  const VUELTA = integra(T.salto, 0, A_FIN, T.salto + 3, null, th => th >= TH_JAM);
  const T_ATASCO = VUELTA.tFin, W_ATASCO = VUELTA.w;
  let pasoAbajo = false;
  const DESENREDO = integra(T.empuja, TH_JAM, -6.6, DUR + 0.2, (th, w) => { if (th < 0.4) pasoAbajo = true; return pasoAbajo ? 2.8 : 0; });
  const tabla = (S_, t) => { const u = (t - S_.t0) / PASO, i = Math.floor(u), f = u - i, a = S_.tab;
    if (i <= 0) return a[0]; if (i >= a.length - 1) return a[a.length - 1]; return lerp(a[i], a[i + 1], f); };
  // momentos de la vuelta (para las caras y la cámara)
  const cuando = (S_, v, baja) => { for (let i = 1; i < S_.tab.length; i++) if (baja ? S_.tab[i] <= v : S_.tab[i] >= v) return S_.t0 + i * PASO; return S_.t0; };
  const T_ARRIBA = cuando(VUELTA, PI), T_ABAJO2 = cuando(VUELTA, TAU);
  const T_ARRIBA2 = cuando(DESENREDO, PI, true), T_SOBRE_R = cuando(DESENREDO, PI / 2, true);
  function thetaG(t) {
    if (t < T.salto) return ampG(t) * Math.sin(W0 * (t - T.t0));
    if (t < T_ATASCO) return tabla(VUELTA, t);
    if (t < T.empuja) {
      // se clava de golpe: rebota un poco contra el enrollado y se queda temblando
      const u = t - T_ATASCO;
      return TH_JAM - 0.11 * Math.exp(-u * 5.5) * Math.sin(u * 17) - 0.012 * Math.sin(t * 2.1) * (1 - Math.exp(-u * 2));
    }
    return tabla(DESENREDO, t);
  }
  function thetaR(t) {
    if (t < T.rLevanta0) return -ampR(t) * Math.sin(W0 * (t - T.t0));
    // asiento vacío: al levantarse lo empuja hacia atrás con el culo y se balancea solo
    return -0.24 * amort(t, T.rLevanta0 + 0.15, 1.3, W0);
  }
  const velo = (f, t) => (f(t + 0.008) - f(t - 0.008)) / 0.016;

  /* =====================================================================================
   * COLUMPIOS: geometría (marco del jinete en reposo, mirando hacia f)
   * ===================================================================================== */
  const BARRA = { x: 0.8, y: -0.6 };                       // dirección del tubo (en profundidad)
  // ganchos: el de delante (cerca) y el de detrás, sobre el tubo
  const gancho = (P, lado) => ({ x: P.x + BARRA.x * (lado === "cerca" ? -9 : 9), y: P.y + BARRA.y * (lado === "cerca" ? -9 : 9) });
  // extremos del asiento en el marco en reposo (x hacia donde mira el jinete)
  const extremo = (P, L, f, lado) => lado === "cerca" ? { x: P.x - 50 * f, y: P.y + L + 2 } : { x: P.x + 50 * f, y: P.y + L - 3 };
  // la cadena: arriba (gancho o salida del enrollado) y abajo (asiento), en pantalla
  function cadena(P, L, f, a, lado, enrollado) {
    const h = gancho(P, lado), k = clamp(enrollado / 0.5);
    const arriba = { x: h.x + k * (RB - 4) * Math.cos(a), y: h.y + k * (RB - 4) * Math.sin(a) };
    return { arriba, abajo: giraEn(P, a, extremo(P, L, f, lado)) };
  }
  // punto de la cadena (en el marco en reposo) a una altura dy sobre el asiento
  function enCadena(P, L, f, a, lado, enrollado, dy) {
    const c = cadena(P, L, f, a, lado, enrollado);
    const ar = giraEn(P, -a, c.arriba), ab = extremo(P, L, f, lado);
    const u = clamp(dy / Math.max(1, ab.y - ar.y));
    return { x: lerp(ab.x, ar.x, u), y: ab.y - dy };
  }
  function dibCadena(g, c, t, k = 1) {
    g.save(); g.lineCap = "round";
    g.strokeStyle = "#1a1b22"; g.lineWidth = 5.2 * k; g.beginPath(); g.moveTo(c.arriba.x, c.arriba.y); g.lineTo(c.abajo.x, c.abajo.y); g.stroke();
    g.strokeStyle = "#a9b0bd"; g.lineWidth = 2.6 * k; g.setLineDash([4.5 * k, 3.2 * k]); g.lineDashOffset = 0;
    g.beginPath(); g.moveTo(c.arriba.x, c.arriba.y); g.lineTo(c.abajo.x, c.abajo.y); g.stroke();
    g.setLineDash([]); g.restore();
  }
  // el asiento: tabla de goma negra con sus abrazaderas
  function dibAsiento(g, P, L, f, a) {
    const n = extremo(P, L, f, "cerca"), l = extremo(P, L, f, "lejos");
    g.save(); g.translate(P.x, P.y); g.rotate(a); g.translate(-P.x, -P.y);
    const n1 = { x: n.x - 8 * f, y: n.y + 1 }, l1 = { x: l.x + 8 * f, y: l.y - 1 };
    g.lineJoin = "round";
    g.beginPath(); g.moveTo(n1.x, n1.y - 3); g.quadraticCurveTo((n1.x + l1.x) / 2, (n1.y + l1.y) / 2 + 9, l1.x, l1.y - 3);
    g.lineTo(l1.x, l1.y + 6); g.quadraticCurveTo((n1.x + l1.x) / 2, (n1.y + l1.y) / 2 + 19, n1.x, n1.y + 7); g.closePath();
    g.fillStyle = "#2b2c34"; g.fill(); g.lineWidth = 3; g.strokeStyle = TINTA; g.stroke();
    g.strokeStyle = "rgba(255,255,255,0.18)"; g.lineWidth = 2; g.beginPath(); g.moveTo(n1.x + 6 * f, n1.y); g.quadraticCurveTo((n1.x + l1.x) / 2, (n1.y + l1.y) / 2 + 11, l1.x - 6 * f, l1.y); g.stroke();
    for (const q of [n, l]) { g.fillStyle = "#c4cad4"; g.beginPath(); g.rect(q.x - 4, q.y - 6, 8, 10); g.fill(); g.lineWidth = 2; g.strokeStyle = TINTA; g.stroke(); }
    g.restore();
  }
  // el tubo de la barra (mitad de detrás o de delante) y el enrollado de cada cadena
  const COL_TUBO = "#2f8f86", COL_TUBO_L = "#6fd0c4", COL_TUBO_O = "#1d5b56";
  function dibTubo(g, P, delante) {
    const a = delante ? { x: P.x - 34 * BARRA.x, y: P.y - 34 * BARRA.y } : { x: P.x + 34 * BARRA.x, y: P.y + 34 * BARRA.y };
    const b = { x: P.x, y: P.y };
    g.save(); g.lineCap = "butt";
    g.strokeStyle = TINTA; g.lineWidth = 20; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke();
    g.strokeStyle = COL_TUBO; g.lineWidth = 14; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke();
    g.strokeStyle = COL_TUBO_L; g.lineWidth = 3; g.beginPath(); g.moveTo(a.x - 3, a.y - 4); g.lineTo(b.x - 3, b.y - 4); g.stroke();
    if (delante) {     // tapa del extremo de delante
      g.fillStyle = COL_TUBO_O; g.beginPath(); g.ellipse(a.x, a.y, 6, 10, Math.atan2(BARRA.y, BARRA.x), 0, TAU); g.fill();
      g.lineWidth = 2.5; g.strokeStyle = TINTA; g.stroke();
    }
    g.restore();
  }
  function dibEnrollado(g, P, lado, w) {
    if (w <= 0.02) return;
    const h = gancho(P, lado), n = Math.min(5, 1 + Math.floor(w / 0.9)), ang = Math.atan2(BARRA.y, BARRA.x);
    g.save(); g.translate(h.x, h.y); g.rotate(ang);
    const vueltas = Math.min(1, w / 0.9);
    for (let i = 0; i < n; i++) {
      const x = (i - (n - 1) / 2) * 4.2, frac = i === n - 1 ? (w % 0.9) / 0.9 || 1 : 1;
      g.lineCap = "round";
      g.strokeStyle = "#1a1b22"; g.lineWidth = 4.6; g.beginPath(); g.ellipse(x, 0, 4.5, 11, 0, -PI / 2, -PI / 2 + PI * Math.max(vueltas, frac)); g.stroke();
      g.strokeStyle = "#b9c0cc"; g.lineWidth = 2.2; g.beginPath(); g.ellipse(x, 0, 4.5, 11, 0, -PI / 2, -PI / 2 + PI * Math.max(vueltas, frac)); g.stroke();
    }
    g.restore();
  }

  /* =====================================================================================
   * FONDO: parque de noche (una vez, en un lienzo grande para poder alejar la cámara)
   * ===================================================================================== */
  const FX = -440, FY = -460, FW = 1940, FH = 1120;
  let FONDO = null;
  function creaFondo() {
    const c = lienzo(FW, FH), g = c.getContext("2d");
    g.translate(-FX, -FY);
    // cielo
    const cielo = g.createLinearGradient(0, FY, 0, 450);
    cielo.addColorStop(0, "#070a1f"); cielo.addColorStop(0.55, "#121a42"); cielo.addColorStop(1, "#2c3f72");
    g.fillStyle = cielo; g.fillRect(FX, FY, FW, 470 - FY);
    // estrellas
    for (let i = 0; i < 260; i++) {
      const x = FX + hash(i * 3.1) * FW, y = FY + hash(i * 7.7 + 2) * (420 - FY), r = 0.6 + hash(i * 1.3) * 1.5;
      g.fillStyle = `rgba(255,250,235,${0.35 + 0.6 * hash(i * 5.2)})`; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
      if (hash(i * 9.1) > 0.93) { g.strokeStyle = "rgba(255,250,235,0.5)"; g.lineWidth = 1; g.beginPath(); g.moveTo(x - 5, y); g.lineTo(x + 5, y); g.moveTo(x, y - 5); g.lineTo(x, y + 5); g.stroke(); }
    }
    // luna
    const lx = 930, ly = 70;
    const halo = g.createRadialGradient(lx, ly, 20, lx, ly, 160); halo.addColorStop(0, "rgba(255,246,210,0.35)"); halo.addColorStop(1, "rgba(255,246,210,0)");
    g.fillStyle = halo; g.beginPath(); g.arc(lx, ly, 160, 0, TAU); g.fill();
    g.fillStyle = "#fff4cf"; g.beginPath(); g.arc(lx, ly, 36, 0, TAU); g.fill();
    g.fillStyle = "rgba(205,190,150,0.5)"; for (const [x, y, r] of [[-10, -8, 8], [12, 6, 6], [-4, 14, 5], [14, -14, 4]]) { g.beginPath(); g.arc(lx + x, ly + y, r, 0, TAU); g.fill(); }
    // ciudad a lo lejos
    g.fillStyle = "#1a2346";
    let x = FX;
    for (let i = 0; x < FX + FW; i++) {
      const w = 40 + hash(i * 4.4) * 70, h = 50 + hash(i * 2.9) * 130;
      g.fillRect(x, 440 - h, w, h + 20);
      g.fillStyle = "#e9c46a";
      for (let yy = 440 - h + 10; yy < 430; yy += 16) for (let xx = x + 7; xx < x + w - 8; xx += 13) if (hash(xx * 0.7 + yy * 1.9) > 0.72) g.fillRect(xx, yy, 5, 7);
      g.fillStyle = "#1a2346"; x += w + 4;
    }
    // colinas y árboles de detrás
    g.fillStyle = "#16233a";
    g.beginPath(); g.moveTo(FX, 470); for (let xx = FX; xx <= FX + FW; xx += 40) g.lineTo(xx, 446 - 18 * Math.sin(xx * 0.006) - 10 * Math.sin(xx * 0.017)); g.lineTo(FX + FW, 470); g.fill();
    const arbol = (ax, ay, r, col) => {
      g.fillStyle = "#1a1410"; g.fillRect(ax - r * 0.1, ay - r * 0.2, r * 0.2, r * 1.3);
      g.fillStyle = col; for (const [dx, dy, k] of [[0, -r * 0.6, 0.75], [-r * 0.45, -r * 0.2, 0.55], [r * 0.45, -r * 0.25, 0.6], [0, -r * 1.05, 0.5]]) { g.beginPath(); g.arc(ax + dx, ay + dy, r * k, 0, TAU); g.fill(); }
    };
    arbol(-60, 452, 120, "#14281f"); arbol(80, 460, 90, "#183025"); arbol(1040, 452, 130, "#14281f"); arbol(1200, 460, 100, "#183025"); arbol(-300, 456, 110, "#14281f"); arbol(1380, 450, 120, "#14281f");
    // suelo: césped y arenero bajo los columpios
    const cesped = g.createLinearGradient(0, 450, 0, 640); cesped.addColorStop(0, "#1d3a2a"); cesped.addColorStop(1, "#0f2419");
    g.fillStyle = cesped; g.fillRect(FX, 455, FW, FY + FH - 455);
    g.fillStyle = "#5a4734"; g.beginPath(); g.ellipse(505, 548, 560, 66, 0, 0, TAU); g.fill();
    g.fillStyle = "#6b5640"; g.beginPath(); g.ellipse(505, 544, 520, 50, 0, 0, TAU); g.fill();
    for (let i = 0; i < 160; i++) { const ax = 505 + (hash(i * 3.3) - 0.5) * 1000, ay = 520 + hash(i * 6.1) * 56; if (((ax - 505) / 520) ** 2 + ((ay - 544) / 50) ** 2 > 1) continue;
      g.fillStyle = hash(i) > 0.5 ? "#8a7052" : "#4a3a2a"; g.fillRect(ax, ay, 3 + hash(i * 2) * 4, 2); }
    // surcos bajo cada columpio (de arrastrar los pies)
    for (const P of [PR, PG]) { g.fillStyle = "rgba(40,28,18,0.55)"; g.beginPath(); g.ellipse(P.x, SY + 8, 70, 8, 0, 0, TAU); g.fill(); }
    // matas de hierba
    g.strokeStyle = "#2c5a3c"; g.lineWidth = 2;
    for (let i = 0; i < 90; i++) { const ax = FX + hash(i * 8.3) * FW, ay = 470 + hash(i * 4.7) * 130; if (Math.abs(ax - 505) < 560 && ay > 490) continue;
      g.beginPath(); g.moveTo(ax, ay); g.lineTo(ax - 4, ay - 10); g.moveTo(ax, ay); g.lineTo(ax + 2, ay - 12); g.moveTo(ax, ay); g.lineTo(ax + 6, ay - 8); g.stroke(); }
    // banco a la derecha
    g.save(); g.translate(1010, 512);
    g.fillStyle = "#3a2a1c"; g.fillRect(-70, -36, 140, 9); g.fillRect(-70, -60, 140, 8); g.fillRect(-70, -48, 140, 7);
    g.fillStyle = "#14141a"; g.fillRect(-60, -30, 6, 34); g.fillRect(54, -30, 6, 34);
    g.restore();
    // farola con su luz
    const fx = 506, fy = 236;
    const cono = g.createRadialGradient(fx, SY + 10, 10, fx, SY + 10, 230);
    cono.addColorStop(0, "rgba(255,214,140,0.35)"); cono.addColorStop(1, "rgba(255,214,140,0)");
    g.fillStyle = cono; g.beginPath(); g.ellipse(fx, SY + 14, 240, 60, 0, 0, TAU); g.fill();
    const haz = g.createLinearGradient(0, fy, 0, SY);
    haz.addColorStop(0, "rgba(255,220,150,0.22)"); haz.addColorStop(1, "rgba(255,220,150,0.03)");
    g.fillStyle = haz; g.beginPath(); g.moveTo(fx - 12, fy + 10); g.lineTo(fx + 12, fy + 10); g.lineTo(fx + 150, SY + 10); g.lineTo(fx - 150, SY + 10); g.closePath(); g.fill();
    g.fillStyle = "#15161c"; g.fillRect(fx - 4, fy, 8, SY - fy + 4); g.fillRect(fx - 10, SY - 10, 20, 14);
    g.fillStyle = "#22242c"; g.beginPath(); g.moveTo(fx - 18, fy + 6); g.lineTo(fx + 18, fy + 6); g.lineTo(fx + 10, fy - 14); g.lineTo(fx - 10, fy - 14); g.closePath(); g.fill();
    const bombilla = g.createRadialGradient(fx, fy + 8, 2, fx, fy + 8, 40); bombilla.addColorStop(0, "rgba(255,236,180,1)"); bombilla.addColorStop(1, "rgba(255,236,180,0)");
    g.fillStyle = bombilla; g.beginPath(); g.arc(fx, fy + 8, 40, 0, TAU); g.fill();
    // los dos columpios: patas en A (la de detrás y la de delante, ligeramente desplazadas)
    for (const P of [PR, PG]) {
      const fin = { x: P.x + 34 * BARRA.x, y: P.y + 34 * BARRA.y }, ini = { x: P.x - 34 * BARRA.x, y: P.y - 34 * BARRA.y };
      const pata = (a, b, col, w) => { g.lineCap = "round"; g.strokeStyle = TINTA; g.lineWidth = w + 6; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke();
        g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke(); };
      // detrás (más oscura)
      pata(fin, { x: fin.x - 150, y: SY - 26 }, "#245e59", 10); pata(fin, { x: fin.x + 150, y: SY - 26 }, "#245e59", 10);
      // delante
      pata(ini, { x: ini.x - 168, y: SY + 18 }, COL_TUBO, 12); pata(ini, { x: ini.x + 168, y: SY + 18 }, COL_TUBO, 12);
      g.strokeStyle = COL_TUBO_L; g.lineWidth = 2.5; g.beginPath(); g.moveTo(ini.x - 3, ini.y + 4); g.lineTo(ini.x - 168 - 3, SY + 18); g.stroke();
      // zapatas
      g.fillStyle = "#6f7480"; for (const q of [{ x: ini.x - 168, y: SY + 18 }, { x: ini.x + 168, y: SY + 18 }]) { g.beginPath(); g.ellipse(q.x, q.y + 2, 14, 5, 0, 0, TAU); g.fill(); }
    }
    return c;
  }

  /* =====================================================================================
   * POSTURAS
   * ===================================================================================== */
  // piernas sentado (desplazamientos tobillo − cadera en la hoja, mirando a la derecha)
  const PIER = {
    reposo: { x: 265, y: 300, ang: 0.12 },
    estira: { x: 495, y: 120, ang: -0.95 },
    encoge: { x: 120, y: 420, ang: 0.4 },
    arrastra: { x: 230, y: 470, ang: -0.1 }
  };
  const mezP = (a, b, k) => ({ x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), ang: lerp(a.ang, b.ang, k) });
  // jinete sentado en su columpio (postura en el marco en reposo)
  function sentado(Rg, P, L, f, base) {
    const pel = { x: P.x, y: P.y + L - 7 };
    return Object.assign({ x: pel.x, suelo: SY, s: S, espejo: f < 0, tirasLimpias: true,
      pelvis: { x: Rg.PELVIS.x, y: Rg.SUELO + (pel.y - SY) / (S * Rg.K) },
      torso: 0, torsoEsc: { x: 1, y: 1 }, cabeza: { ang: 0, dx: 0, dy: 0, esc: { x: 1, y: 1 } }, piernas: {} }, base || {});
  }
  function piernasSentado(Rg, p, cerca, lejos) {
    const Tr = Rg.tronco(p);
    for (const [lado, q] of [["cerca", cerca], ["lejos", lejos]]) {
      const h = Tr(Rg.CADERA[lado]);
      p.piernas[lado] = { tob: { x: h.x + q.x, y: h.y + q.y }, ang: q.ang };
    }
  }
  // piernas colgando en vertical (en pantalla) aunque el columpio esté torcido
  function piernasColgando(Rg, p, a, f, t, patalea) {
    const Tr = Rg.tronco(p);
    for (const [lado, fa] of [["cerca", 0], ["lejos", 1.7]]) {
      const h = Rg.aPantalla(p, Tr(Rg.CADERA[lado]));
      // muslo apoyado en el asiento (gira con el columpio) y espinilla colgando a plomo
      const sw = 0.1 * Math.sin(t * 2.3 + fa) + patalea * 0.5 * Math.sin(t * 13 + fa * 2);
      const muslo = { x: f * (lado === "cerca" ? 64 : 70), y: lado === "cerca" ? 6 : 2 };
      const esp = rota({ x: 70 * Math.sin(sw), y: 70 * Math.cos(sw) }, -a);
      const tob = Rg.aHoja(p, { x: h.x + muslo.x + esp.x, y: h.y + muslo.y + esp.y });
      p.piernas[lado] = { tob, ang: -a * f + 0.25 + 0.3 * patalea * Math.sin(t * 13 + fa * 2) };
    }
  }
  // fundido entre dos juegos de piernas
  function mezPiernas(A, B, k) {
    const o = {};
    for (const lado of ["cerca", "lejos"]) o[lado] = { tob: { x: lerp(A[lado].tob.x, B[lado].tob.x, k), y: lerp(A[lado].tob.y, B[lado].tob.y, k) }, ang: lerp(A[lado].ang, B[lado].ang, k) };
    return o;
  }
  // manos agarradas a las cadenas
  function manosCadenas(Rg, p, P, L, f, a, enrollado, alto) {
    const Tr = Rg.tronco(p);
    const o = {};
    for (const lado of ["cerca", "lejos"]) {
      const q = enCadena(P, L, f, a, lado, enrollado, lado === "cerca" ? alto : alto + 6);
      const h = Rg.aHoja(p, q), hom = Tr(lado === "cerca" ? Rg.HOMBRO_C : Rg.HOMBRO);
      const muH = Math.atan2(hom.y - h.y, hom.x - h.x);
      o[lado] = { x: h.x, y: h.y, ang: 0, mu: muH + (lado === "cerca" ? -0.55 : 0.55), puno: 1, dobla: lado === "cerca" ? -1 : 1 };
    }
    p.manoCerca = o.cerca; p.manoLejos = o.lejos;
  }

  /* ---------- Guillermo ---------- */
  const CG = {
    feliz: E({ mx: 0.9, my: 0.1, c: 0.15, sd: 8, gd: 0.04, si: 8, gi: 0.04, abre: 8, ancho: 0.95, sonr: 0.7 }),
    pique: E({ mx: 0.9, my: 0, c: 0.4, sd: -8, gd: -0.22, si: -8, gi: -0.22, abre: 2, ancho: 1.05, sonr: 0.45 }),
    esfuerzo: E({ mx: 0.9, my: 0, c: 0.55, z: 0.35, sd: -10, gd: -0.24, si: -10, gi: -0.24, abre: 18, ancho: 1.05, sonr: 0.35, lengua: 0.7 }),
    alto: E({ mx: 0.9, my: -0.2, c: 0.1, sd: 18, gd: 0.08, si: 18, gi: 0.08, abre: 30, ancho: 1.05, sonr: 0.95 }),
    uy: E({ mx: 0.6, my: -0.6, iris: 0.8, sd: 26, gd: 0.2, si: 26, gi: 0.2, abre: 22, ancho: 0.65, sonr: -0.4 }),
    arriba: E({ mx: -0.85, my: 0, iris: 0.68, sd: 32, gd: 0.26, si: 32, gi: 0.26, abre: 28, ancho: 0.58, sonr: -0.6 }),
    vuela: E({ mx: 0, my: 0, c: 1, z: 1, sd: 14, gd: 0.2, si: 14, gi: 0.2, abre: 40, ancho: 0.95, sonr: -0.5, lengua: 0.3 }),
    aplastado: E({ mx: 0, my: 0, c: 1, z: 1, sd: -6, gd: -0.2, si: -6, gi: -0.2, abre: 10, ancho: 1.1, sonr: -0.6 }),
    mareo: E({ mx: 0, my: 0, esp: 1, sd: 12, gd: 0.2, si: -6, gi: -0.1, abre: 16, ancho: 0.85, sonr: -0.1, lengua: 0.8 }),
    suplica: E({ mx: 0.75, my: 0.85, iris: 0.92, sd: 20, gd: 0.28, si: 20, gi: 0.28, abre: 8, ancho: 0.6, sonr: -0.4 }),
    susto: E({ mx: 0.6, my: 0.7, iris: 0.72, sd: 30, gd: 0.25, si: 30, gi: 0.25, abre: 30, ancho: 0.7, sonr: -0.6 }),
    final: E({ mx: -0.85, my: 0, esp: 0.45, c: 0.15, sd: 10, gd: 0.15, si: 4, gi: 0.05, abre: 10, ancho: 0.95, sonr: 0.65 })
  };
  const GUION_CG = [
    [T.gPique - 0.1, T.gPique + 0.12, "pique"], [T.gBombea, T.gBombea + 0.25, "esfuerzo"], [4.5, 4.8, "alto"],
    [5.75, 5.95, "uy"], [T_ARRIBA - 0.22, T_ARRIBA - 0.08, "arriba"], [T_ARRIBA + 0.14, T_ARRIBA + 0.22, "vuela"],
    [T_ATASCO - 0.02, T_ATASCO + 0.04, "aplastado"], [T_ATASCO + 0.45, T_ATASCO + 0.65, "mareo"],
    [T.rMira - 0.25, T.rMira, "suplica"], [T.toca - 0.08, T.toca + 0.05, "susto"], [T.empuja + 0.08, T.empuja + 0.16, "vuela"],
    [12.65, 12.85, "mareo"], [T.camara - 0.1, T.camara + 0.15, "final"]
  ];
  const PARP_G = [1.1, 3.6, 9.2, 10.4, 13.55];

  function poseG(t) {
    const th = thetaG(t), L = largoG(th), a = th, f = -1;
    const enr = Math.max(0, th - PI);
    const p = sentado(G, PG, L, f, { hombrosContinuos: true, hombrosRecortados: true });
    const respira = Math.sin(t * 2.3 + 0.4);
    const v = velo(thetaG, t);
    const e = linea(GUION_CG, CG, "feliz", t);
    // bombeo: piernas estiradas al ir hacia delante y encogidas al volver
    const bombeoL = clamp(0.55 + 0.55 * suave(fase(t, 1.9, 2.6)));
    const bombeo = bombeoL * (1 - tramo(t, T.salto, T.salto + 0.15));
    const kEst = 0.5 + 0.5 * Math.tanh(v / 1.4);
    let torso = -0.05, cab = 0.02 + 0.03 * Math.sin(t * 1.7);
    torso += (-0.15 * kEst + 0.1 * (1 - kEst)) * bombeo;
    cab += (0.1 * kEst - 0.06 * (1 - kEst)) * bombeo;
    // empujones de esfuerzo al bombear
    torso += 0.02 * Math.sin(t * 6.6) * bombeo * tramo(t, 2.5, 3);
    const vuelta = t >= T.salto && t < T_ATASCO, atasco = t >= T_ATASCO && t < T.empuja, desenredo = t >= T.empuja;
    // cada fase funde con la anterior (sin saltos de pose)
    const kV = tramo(t, T.salto, T.salto + 0.15), kA = tramo(t, T_ATASCO, T_ATASCO + 0.1, salida), kD = tramo(t, T.empuja + 0.04, T.empuja + 0.3);
    const torsoV = -0.12 + 0.05 * Math.sin(t * 9), cabV = 0.1;
    const uA = Math.max(0, t - T_ATASCO);
    // aplastado contra la barra: encogido hacia delante, cabeza ladeada; mira abajo a Rodri y suplica
    const torsoA = 0.12 + 0.05 * Math.exp(-uA * 4) * Math.sin(uA * 15);
    const cabA = 0.22 - 0.06 * Math.exp(-uA * 3) + 0.03 * Math.sin(t * 2.4) - 0.12 * tramo(t, T.rMira - 0.25, T.rMira);
    if (vuelta) { torso = lerp(torso, torsoV, kV); cab = lerp(cab, cabV, kV); }
    if (atasco) { torso = lerp(torsoV, torsoA, kA); cab = lerp(cabV, cabA, kA); }
    if (desenredo) {
      const k = tramo(t, 12.4, 13.2);
      const torsoD = lerp(-0.1, -0.04, k) + 0.04 * Math.sin(t * 7) * (1 - k), cabD = lerp(0.08, 0.04, k) + 0.08 * Math.sin(t * 3.1) * k;
      torso = lerp(torsoA, torsoD, kD); cab = lerp(cabA, cabD, kD);
    }
    p.torso = torso; p.cabeza.ang = cab;
    p.torsoEsc = { x: 1, y: 1 + respira * 0.004 };
    // piernas: bombeo → pataleo en la vuelta → colgando atascado → pataleo al desenredarse
    const pBombeo = q => { const m = mezP(PIER.encoge, PIER.estira, kEst), r = mezP(PIER.reposo, m, bombeoL); piernasSentado(G, q, r, { x: r.x + 15, y: r.y - 10, ang: r.ang }); };
    const pVuelta = q => {
      const pa = Math.sin(t * 16), q1 = mezP(PIER.estira, PIER.reposo, 0.35 + 0.25 * pa), q2 = mezP(PIER.estira, PIER.reposo, 0.35 - 0.25 * pa);
      piernasSentado(G, q, q1, { x: q2.x, y: q2.y - 30, ang: q2.ang });
    };
    const pColg = q => piernasColgando(G, q, a, f, t, 0.25 * campana(t, T_ATASCO, T_ATASCO + 0.8) + 0.5 * campana(t, T.toca - 0.05, T.suelta + 0.15));
    const pDes = q => {
      const k = tramo(t, 12.5, 13.1), pa = Math.sin(t * 15) * (1 - k);
      const q1 = mezP(mezP(PIER.estira, PIER.reposo, 0.4 + 0.3 * pa), PIER.reposo, k), q2 = mezP(mezP(PIER.estira, PIER.reposo, 0.4 - 0.3 * pa), PIER.reposo, k);
      piernasSentado(G, q, q1, { x: q2.x + 15, y: q2.y - 14, ang: q2.ang });
    };
    const con = fn => { const q = Object.assign({}, p, { piernas: {} }); fn(q); return q.piernas; };
    const mez = (fa, fb, k) => k <= 0 ? con(fa) : k >= 1 ? con(fb) : mezPiernas(con(fa), con(fb), k);
    p.piernas = t < T.salto ? con(pBombeo) : vuelta ? mez(pBombeo, pVuelta, kV) : atasco ? mez(pVuelta, pColg, kA) : mez(pColg, pDes, kD);
    // cara y extras
    p.cara = cara(e, parpadeo(t, PARP_G));
    p.enfado = 0.9 * tramo(t, T.gPique, T.gPique + 0.2) * (1 - tramo(t, 4.4, 4.7));
    p.rojo = 0.55 * tramo(t, 2.6, 3.0) * (1 - tramo(t, 4.6, 5.0)) + 0.5 * tramo(t, T.rMira - 0.3, T.rMira) * (1 - tramo(t, T.empuja, T.empuja + 0.3));
    p.sudor = 0.8 * tramo(t, 2.8, 3.2) * (1 - tramo(t, 4.6, 4.9)) + 0.9 * tramo(t, 5.7, 5.9) * (1 - tramo(t, T_ARRIBA + 0.2, T_ARRIBA + 0.4)) + 0.8 * tramo(t, T.rMira - 0.3, T.rMira) * (1 - tramo(t, T.empuja, T.empuja + 0.2));
    p.chichon = 0.75 * tramo(t, T_ATASCO + 0.05, T_ATASCO + 0.3, salida);
    // manos en las cadenas
    manosCadenas(G, p, PG, L, f, a, enr, 50);
    return p;
  }

  /* ---------- Rodri ---------- */
  const CR = {
    tranqui: E({ mx: 0.6, my: -0.1, c: 0.45, h: 0.15, abre: 2, ancho: 0.95, sonr: 0.5 }),
    chulo: E({ mx: 0.92, my: 0, c: 0.38, abre: 4, ancho: 1.05, sonr: 0.85 }),
    sorpresa: E({ mx: 0.9, my: -0.3, iris: 0.8, c: 0, abre: 22, ancho: 0.62, sonr: -0.1 }),
    pasmo: E({ mx: 0.85, my: -0.75, iris: 0.74, c: 0, abre: 38, ancho: 0.72, sonr: -0.2 }),
    risa: E({ mx: 0.5, c: 0.95, h: 1, abre: 34, ancho: 1.05, sonr: 0.95 }),
    mirarArriba: E({ mx: 0.8, my: -0.9, c: 0.15, abre: 6, ancho: 0.95, sonr: 0.55 }),
    pillo: E({ mx: 0.85, my: -0.75, c: 0.35, abre: 4, ancho: 1.05, sonr: 0.95 }),
    fuerza: E({ mx: 0.8, my: -0.7, c: 0.55, z: 0.4, abre: 12, ancho: 1, sonr: 0.3 }),
    agacha: E({ mx: 0, my: 0, c: 1, z: 1, abre: 10, ancho: 0.9, sonr: -0.3 }),
    mira: E({ mx: 0.85, my: -0.5, c: 0.1, abre: 18, ancho: 0.8, sonr: 0.5 }),
    camara: E({ mx: -0.85, c: 0.3, abre: 8, ancho: 1, sonr: 0.9 }),
    guino: E({ mx: -0.85, c: 0.3, cd: 1, abre: 8, ancho: 1, sonr: 1 })
  };
  const GUION_CR = [
    [T.rMira0, T.rMira0 + 0.25, "chulo"], [T.rMira1, T.rMira1 + 0.3, "tranqui"], [T.rNota, T.rNota + 0.15, "sorpresa"],
    [5.7, 6.0, "pasmo"], [T_ATASCO + 0.05, T_ATASCO + 0.2, "sorpresa"], [T_ATASCO + 0.5, T_ATASCO + 0.75, "risa"],
    [T.rAnda0, T.rAnda0 + 0.3, "pillo"], [T.rMira, T.rMira + 0.15, "mirarArriba"], [T.rRie0, T.rRie0 + 0.12, "risa"],
    [T.alza0 - 0.05, T.alza0 + 0.1, "pillo"], [T.toca - 0.05, T.toca + 0.05, "fuerza"], [T.suelta + 0.05, T.suelta + 0.2, "mira"],
    [T.agacha0 - 0.05, T.agacha0 + 0.08, "agacha"], [T.levanta0, T.levanta0 + 0.2, "mira"], [T.levanta1, T.levanta1 + 0.15, "risa"],
    [T.camara, T.camara + 0.15, "camara"], [T.guino, T.guino + 0.08, "guino"], [T.guino + 0.35, T.guino + 0.45, "camara"]
  ];
  const PARP_R = [0.95, 3.3, 7.1, 9.5, 12.25];
  const XR1 = 400;                                       // donde se planta Rodri bajo Guillermo
  // pies al andar: [t0, t1, x, alza]
  function pie(lista, t) {
    let i = 0; while (i + 1 < lista.length && t >= lista[i + 1][0]) i++;
    const [t0, t1, x, alza = 18] = lista[i], xa = i > 0 ? lista[i - 1][2] : x, u = fase(t, t0, t1);
    return { x: lerp(xa, x, M2.suave5(u)), alza: alza * Math.sin(Math.PI * u), u };
  }
  const PASOS_R = {
    cerca: [[-9, -8, PR.x - 12], [T.rAnda0, T.rAnda0 + 0.34, XR1 - 14, 20]],
    lejos: [[-9, -8, PR.x + 22], [T.rAnda0 + 0.3, T.rAnda0 + 0.64, XR1 + 24, 20]]
  };
  const xAndaR = t => lerp(PR.x, XR1, suave(fase(t, T.rAnda0 - 0.05, T.rAnda1)));

  function poseR(t, pG, MG) {
    const respira = Math.sin(t * 2.0 + 1.1);
    const e = linea(GUION_CR, CR, "tranqui", t);
    const f = 1;
    if (t < T.rLevanta0) {
      const th = thetaR(t), a = -th;
      const p = sentado(RO, PR, L0, f);
      const v = velo(thetaR, t);
      const bombeo = 0.75 * (1 - tramo(t, T.rFrena0, T.rFrena0 + 0.3));
      const kEst = 0.5 + 0.5 * Math.tanh(v / 1.4);
      p.torso = -0.06 + (-0.12 * kEst + 0.07 * (1 - kEst)) * bombeo;
      // echa la cabeza atrás, gozándola, en lo alto de cada vaivén
      p.cabeza.ang = -0.05 - 0.08 * Math.abs(Math.sin(W0 * (t - T.t0))) * bombeo + 0.03 * Math.sin(t * 1.3);
      const frena = tramo(t, T.rFrena0, T.rFrena0 + 0.4);
      // frena arrastrando los pies: piernas abajo hasta el suelo
      const q = mezP(PIER.reposo, mezP(PIER.encoge, PIER.estira, kEst), bombeo);
      const qa = mezP(q, PIER.arrastra, frena);
      piernasSentado(RO, p, qa, { x: qa.x + 18, y: qa.y - 8, ang: qa.ang });
      // risa al verle atascado: se echa atrás
      const ri = tramo(t, T_ATASCO + 0.5, T_ATASCO + 0.75) * (1 - tramo(t, T.rLevanta0 - 0.3, T.rLevanta0));
      p.torso -= 0.12 * ri; p.cabeza.ang -= 0.1 * ri + 0.04 * Math.sin(t * 18) * ri;
      p.cara = cara(e, parpadeo(t, PARP_R));
      manosCadenas(RO, p, PR, L0, f, a, 0, 52);
      return { p, a, sentado: true };
    }
    // de pie: se levanta, anda hasta Guillermo, empuja, se agacha y se ríe
    const p = { x: xAndaR(t), suelo: SY, s: S, tirasLimpias: true, torso: 0, torsoEsc: { x: 1, y: 1 + respira * 0.004 },
      cabeza: { ang: 0, dx: 0, dy: 0, esc: { x: 1, y: 1 } }, piernas: {} };
    const sube = suave(fase(t, T.rLevanta0, T.rLevanta1));
    const yS = PR.y + L0 - 7, yP = SY - (RO.SUELO - RO.PELVIS.y) * S;
    let pelY = lerp(yS, yP, sube) + 1.0 * respira;
    let torso = lerp(0.2, 0, sube) * sube + 0.25 * campana(t, T.rLevanta0, T.rLevanta1 + 0.1);
    let cab = 0.02 * Math.sin(t * 1.6);
    // al andar, bote
    const anda = campana(t, T.rAnda0 - 0.05, T.rAnda1 + 0.05);
    pelY += 4 * Math.abs(Math.sin((t - T.rAnda0) * PI / 0.33)) * anda;
    // mira arriba
    cab -= 0.18 * tramo(t, T.rMira - 0.2, T.rMira + 0.1) * (1 - tramo(t, T.suelta, T.suelta + 0.3));
    torso -= 0.08 * tramo(t, T.rMira - 0.2, T.rMira + 0.1) * (1 - tramo(t, T.suelta, T.suelta + 0.3));
    // risa
    const ri = campana(t, T.rRie0, T.rRie1 + 0.05);
    torso += 0.05 * Math.sin(t * 20) * ri; cab += -0.06 * ri;
    // empujón: se estira hacia arriba y empuja con todo el cuerpo
    const emp = tramo(t, T.alza0, T.toca) * (1 - tramo(t, T.suelta, T.suelta + 0.3));
    torso -= 0.1 * emp; pelY -= 6 * emp; cab -= 0.06 * emp;
    torso -= 0.08 * campana(t, T.toca, T.suelta + 0.1);
    // se agacha cuando le pasa por encima
    const ag = tramo(t, T.agacha0, T.agacha1, salida) * (1 - tramo(t, T.levanta0, T.levanta1));
    pelY += 62 * ag; torso += 0.42 * ag; cab += 0.25 * ag;
    // risa final
    const rf = tramo(t, T.levanta1, T.levanta1 + 0.2) * (1 - tramo(t, T.camara - 0.1, T.camara + 0.1));
    torso -= 0.05 * rf - 0.04 * Math.sin(t * 18) * rf; cab -= 0.08 * rf;
    p.pelvis = { x: RO.PELVIS.x, y: RO.SUELO + (pelY - SY) / S };
    p.torso = torso; p.cabeza.ang = cab;
    // pies: primero bajo la pelvis (levantarse) y luego andando
    const tobY = SY - RO.TOBILLO_ALTO * S;
    const fc = pie(PASOS_R.cerca, t), fl = pie(PASOS_R.lejos, t);
    const desdeSentado = 1 - sube;
    for (const [lado, fp, dx] of [["cerca", fc, -6], ["lejos", fl, 10]]) {
      const tob = { x: fp.x - 8 * ag * (lado === "cerca" ? 1 : -1), y: tobY - fp.alza };
      // sentado: el tobillo estaba delante de la rodilla
      const sent = RO.aPantalla(Object.assign({}, p, { x: PR.x }), { x: 0, y: 0 });
      void sent;
      p.piernas[lado] = { tob: RO.aHoja(p, { x: tob.x + dx * desdeSentado, y: tob.y }), ang: -0.25 * Math.sin(Math.PI * fp.u) * (fp.alza > 1 ? 1 : 0) };
    }
    p.cara = cara(e, parpadeo(t, PARP_R));
    // manos: de las cadenas a los bolsillos; la de detrás empuja la suela de Guillermo
    const bc = RO.manoReposo(p, "cerca"), bl = RO.manoReposo(p, "lejos");
    let mc = { x: bc.x, y: bc.y, ang: 0, mu: bc.mu, puno: bc.puno, dobla: -1 };
    let ml = { x: bl.x, y: bl.y, ang: 0, mu: bl.mu, puno: bl.puno, dobla: 1 };
    // al levantarse suelta las cadenas (venían de arriba)
    const suelta = tramo(t, T.rLevanta0, T.rLevanta0 + 0.35);
    if (suelta < 1) {
      const Tr = RO.tronco(p);
      const ca = Tr({ x: RO.HOMBRO_C.x - 40, y: RO.HOMBRO_C.y + 260 }), la = Tr({ x: RO.HOMBRO.x + 40, y: RO.HOMBRO.y + 250 });
      mc = { x: lerp(ca.x, mc.x, suelta), y: lerp(ca.y, mc.y, suelta), ang: 0, mu: lerp(-1.2, mc.mu, suelta), puno: lerp(1, mc.puno, suelta), dobla: -1 };
      ml = { x: lerp(la.x, ml.x, suelta), y: lerp(la.y, ml.y, suelta), ang: 0, mu: lerp(-1.9, ml.mu, suelta), puno: lerp(1, ml.puno, suelta), dobla: 1 };
    }
    const kE = tramo(t, T.alza0, T.toca - 0.04) * (1 - tramo(t, T.suelta + 0.05, T.suelta + 0.38));
    if (kE > 0 && pG && MG) {
      // la palma contra la suela de Guillermo (sigue a la suela mientras empuja)
      const suela = sueloG(pG, MG);
      const tg = RO.aHoja(p, { x: suela.x - 6, y: suela.y + 10 });
      const muE = -2.2;
      const off = rota({ x: Math.cos(muE) * RO.MUNECA_R * RO.JK, y: Math.sin(muE) * RO.MUNECA_R * RO.JK }, 0);
      const tgm = { x: tg.x - 0 * off.x, y: tg.y };
      ml = { x: lerp(ml.x, tgm.x, kE), y: lerp(ml.y, tgm.y, kE), ang: lerp(0, -0.6, kE), mu: lerp(ml.mu, muE, kE), puno: lerp(ml.puno, 1, kE),
        dedos: D(lerp(0, 0.9, kE), lerp(0, 1, kE)), dobla: 1 };
      alcanza(RO, p, ml, RO.HOMBRO, RO.BRAZO_L * 1.05);
    }
    p.manoCerca = mc; p.manoLejos = ml;
    return { p, a: thetaR(t) * -1, sentado: false };
  }
  const R_M = G.MUNECA_R * G.JK;
  function alcanza(Rg, p, m, hombro, lim) {
    const h = Rg.tronco(p)(hombro), w = rota({ x: Math.cos(m.mu) * R_M, y: Math.sin(m.mu) * R_M }, m.ang || 0);
    const dx = m.x + w.x - h.x, dy = m.y + w.y - h.y, d = Math.hypot(dx, dy);
    if (d > lim) { const k = lim / d - 1; m.x += dx * k; m.y += dy * k; }
  }

  /* ---------- marcos (afín del jinete en pantalla) ---------- */
  const AF = (a, b, c, d, e, f) => ({ a, b, c, d, e, f });
  const apl = (A, q) => ({ x: A.a * q.x + A.c * q.y + A.e, y: A.b * q.x + A.d * q.y + A.f });
  const marco = (P, a) => { const c = Math.cos(a), s = Math.sin(a); return AF(c, s, -s, c, P.x - c * P.x + s * P.y, P.y - s * P.x - c * P.y); };
  const aplica = (g, A) => g.transform(A.a, A.b, A.c, A.d, A.e, A.f);
  // suela del pie cercano de Guillermo (pantalla)
  function sueloG(pG, MG) {
    const q = pG.piernas.cerca, o = rota({ x: 40, y: 88 }, q.ang);
    return apl(MG, G.aPantalla(pG, { x: q.tob.x + o.x, y: q.tob.y + o.y }));
  }

  /* =====================================================================================
   * EFECTOS
   * ===================================================================================== */
  function rayitas(g, x, y, k, ang, n, col, L) {
    if (k <= 0.01) return;
    g.save(); g.globalAlpha = clamp(k); g.strokeStyle = col; g.lineWidth = 3; g.lineCap = "round";
    for (let i = 0; i < n; i++) { const a = ang + (i - (n - 1) / 2) * 0.42, r0 = 16 + 6 * (1 - k), r1 = r0 + L * k;
      g.beginPath(); g.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0); g.lineTo(x + Math.cos(a) * r1, y + Math.sin(a) * r1); g.stroke(); }
    g.restore();
  }
  function estrella(g, x, y, r, k, col = "#ffe066", rot = 0) {
    if (k <= 0.01) return;
    g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k); g.beginPath();
    for (let i = 0; i < 10; i++) { const a = i * PI / 5 - PI / 2, rr = i % 2 ? r * 0.45 : r; g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
    g.closePath(); g.fillStyle = col; g.fill(); g.lineWidth = 2.5; g.strokeStyle = TINTA; g.stroke(); g.restore();
  }
  // estrellitas de mareo girando alrededor de la cabeza
  function mareo(g, c, k, t) {
    if (k <= 0.01) return;
    for (let i = 0; i < 4; i++) { const a = t * 4.2 + i * TAU / 4; estrella(g, c.x + Math.cos(a) * 40, c.y - 46 + Math.sin(a) * 11, 8, k * (0.75 + 0.25 * Math.sin(a)), "#ffe066", a); }
  }
  // arcos de velocidad alrededor de la barra
  function arcosVelocidad(g, P, L, a, w, k) {
    if (k <= 0.01 || Math.abs(w) < 1) return;
    const fi = PI / 2 + a, sg = Math.sign(w), lar = clamp(Math.abs(w) / 7) * 0.9;
    g.save(); g.globalAlpha = 0.55 * k; g.strokeStyle = "#dfe8ff"; g.lineCap = "round";
    for (const [r, wd] of [[L + 28, 3], [L - 30, 2.5], [L - 110, 2]]) {
      g.lineWidth = wd; g.beginPath(); g.arc(P.x, P.y, r, fi - sg * (0.18 + lar), fi - sg * 0.18, sg < 0); g.stroke();
    }
    g.restore();
  }
  // polvo al arrastrar los pies
  function polvo(g, x, y, k, t) {
    if (k <= 0.01) return;
    g.save();
    for (let i = 0; i < 5; i++) { const a = PI + 0.3 + i * 0.5, r = 6 + 22 * k; g.fillStyle = `rgba(150,120,90,${0.45 * (1 - k) + 0.1})`;
      g.beginPath(); g.arc(x + Math.cos(a) * r * 1.4, y - 6 + Math.sin(a) * r * 0.45, 6 + 8 * k, 0, TAU); g.fill(); }
    g.restore();
  }

  /* ---------- cámara ---------- */
  const PLANOS = [
    [0, 1, 520, 300], [3.0, 1, 520, 300], [5.9, 0.68, 640, 108], [T_ATASCO + 0.05, 0.68, 640, 108],
    [T_ATASCO + 1.1, 1.05, 540, 300], [T.empuja + 0.05, 1.05, 540, 300], [T.empuja + 0.55, 0.69, 590, 112], [12.45, 0.7, 590, 125],
    [13.35, 1.05, 540, 300], [DUR, 1.05, 540, 300]
  ];
  function camara(t) {
    let i = 0; while (i < PLANOS.length - 2 && t > PLANOS[i + 1][0]) i++;
    const a = PLANOS[i], b = PLANOS[i + 1], k = suave(fase(t, a[0], b[0]));
    return { k: lerp(a[1], b[1], k), x: lerp(a[2], b[2], k), y: lerp(a[3], b[3], k) };
  }
  const temblor = t => 6 * Math.exp(-Math.max(0, t - T_ATASCO) * 7) * (t >= T_ATASCO ? 1 : 0);

  /* =====================================================================================
   * PINTAR
   * ===================================================================================== */
  function pose(t) {
    const pG = poseG(t), aG = thetaG(t), MG = marco(PG, aG);
    const r = poseR(t, pG, MG);
    return { g: pG, r: r.p, aG, aR: r.a, sentadoR: r.sentado };
  }
  class Columpio extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !RO.listo()) return;
      if (!FONDO) FONDO = creaFondo();
      const luz = tramo(t, NEGRO_INICIO, 0.8, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t), tb = temblor(t);
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      if (tb > 0.05) g.translate(ruido(t * 45) * tb, ruido(t * 45 + 13) * tb * 0.7);
      const CAM = g.getTransform();
      g.drawImage(FONDO, FX, FY);
      const ps = pose(t), pG = ps.g, pR = ps.r;
      const thG = thetaG(t), LG = largoG(thG), aG = ps.aG, aR = ps.aR, enr = Math.max(0, thG - PI);
      // mitad de detrás de las barras y su enrollado
      dibTubo(g, PR, false); dibTubo(g, PG, false);
      dibEnrollado(g, PG, "lejos", enr);
      // sombras en el suelo
      const sombra = (x, w) => { g.save(); g.fillStyle = "rgba(10,8,6,0.32)"; g.beginPath(); g.ellipse(x, SY + 6, w, 7, 0, 0, TAU); g.fill(); g.restore(); };
      sombra(PR.x + L0 * Math.sin(-aR) * (ps.sentadoR ? 1 : 1), 46); sombra(PG.x - LG * Math.sin(aG), 46 * clamp(Math.cos(aG) * 0.5 + 0.6, 0.2, 1));
      if (!ps.sentadoR) sombra(pR.x + 10, 48);
      // ---- Rodri y su columpio ----
      const cadR = l => cadena(PR, L0, 1, aR, l, 0);
      dibCadena(g, cadR("lejos"), t);
      dibAsiento(g, PR, L0, 1, aR);
      if (ps.sentadoR) {
        pR.capaTronco = gg => { gg.save(); gg.setTransform(CAM); dibCadena(gg, cadR("cerca"), t); gg.restore(); };
        g.save(); aplica(g, marco(PR, aR)); RO.dibujar(g, pR, t); g.restore();
      } else {
        dibCadena(g, cadR("cerca"), t);
        // polvo al levantarse y al agacharse
        RO.dibujar(g, pR, t);
      }
      // polvo de arrastrar los pies (en cada paso por abajo)
      if (t > T.rFrena0 && t < T.rFrena1 + 0.4) {
        const fase0 = (W0 * (t - T.t0)) / PI, cerca = Math.abs(fase0 - Math.round(fase0));
        polvo(g, PR.x + 30, SY, clamp(1 - cerca * 4) * (1 - fase(t, 7.0, 7.8)), t);
      }
      // ---- Guillermo y su columpio ----
      const MG = marco(PG, aG);
      const cadG = l => cadena(PG, LG, -1, aG, l, enr);
      arcosVelocidad(g, PG, LG, aG, velo(thetaG, t), campana(t, 5.6, T_ATASCO + 0.05) + campana(t, T.empuja, 12.9));
      dibCadena(g, cadG("lejos"), t);
      dibAsiento(g, PG, LG, -1, aG);
      pG.capaTronco = gg => { gg.save(); gg.setTransform(CAM); dibCadena(gg, cadG("cerca"), t); gg.restore(); };
      g.save(); aplica(g, MG); G.dibujar(g, pG, t); g.restore();
      // mitad de delante de las barras (y el enrollado de la cadena de delante)
      dibEnrollado(g, PG, "cerca", enr);
      dibTubo(g, PR, true); dibTubo(g, PG, true);
      // efectos
      const cabG = apl(MG, G.aPantalla(pG, G.centroCabeza(pG)));
      mareo(g, cabG, tramo(t, T_ATASCO + 0.35, T_ATASCO + 0.6) * (1 - tramo(t, T.rMira - 0.4, T.rMira - 0.1)) + tramo(t, 12.6, 12.9) * (1 - tramo(t, T.camara + 0.3, T.camara + 0.6)), t);
      // ¡clonc! al atascarse
      const kc = campana(t, T_ATASCO, T_ATASCO + 0.4);
      if (kc > 0) { estrella(g, PG.x - 26, PG.y + 4, 22, kc, "#fff3a8", 0.3); rayitas(g, PG.x, PG.y, kc, PI * 0.75, 5, "#f4f1e6", 26); }
      // empujón
      const ke = campana(t, T.toca, T.toca + 0.3);
      if (ke > 0) { const s = sueloG(pG, MG); rayitas(g, s.x, s.y, ke, -0.6, 4, "#f4f1e6", 18); }
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00118", nombre: "Guillermo y Rodri · El columpio", crear: () => new Columpio() });
  // diagnóstico: distancia hombro → objetivo de cada mano (y lo que da el brazo)
  function diag(t) {
    const ps = pose(t), o = {};
    const dist = (Rg, p, lado) => { const m = lado === "cerca" ? p.manoCerca : p.manoLejos; if (!m) return null; const h = Rg.tronco(p)(lado === "cerca" ? Rg.HOMBRO_C : Rg.HOMBRO);
      const mu = m.mu ?? -1.75, w = rota({ x: Math.cos(mu) * 13 * 2.6, y: Math.sin(mu) * 13 * 2.6 }, m.ang || 0);
      return +(Math.hypot(m.x + w.x - h.x, m.y + w.y - h.y) / (lado === "cerca" ? Rg.BRAZO_C_L : Rg.BRAZO_L)).toFixed(3); };
    o.gC = dist(G, ps.g, "cerca"); o.gL = dist(G, ps.g, "lejos"); o.rC = dist(RO, ps.r, "cerca"); o.rL = dist(RO, ps.r, "lejos");
    return o;
  }
  window.__A2D_00118 = { pose, T, DUR, diag, thetaG, thetaR, T_ATASCO, T_ARRIBA, T_ABAJO2, T_ARRIBA2, T_SOBRE_R, W_ATASCO };
})();
