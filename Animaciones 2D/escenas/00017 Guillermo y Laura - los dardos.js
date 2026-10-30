"use strict";
/* 00017 · Guillermo y Laura · Los dardos
 *
 * Negro → rincón de dardos de un pub inglés: pared verde botella con zócalo de caoba, la diana en
 * su armario con una pizarra de rayitas y una lámpara de latón colgando del techo. Laura, en la
 * línea de tiro, con tres dardos; Guillermo detrás, con las manos en los bolsillos y cara de chulo →
 * Laura lanza tres dardos: diana, diana y diana (la diana tiembla a cada golpe; el último lo tira
 * mirando a cámara) → Guillermo pasa de la chulería a quedarse con la boca abierta → Laura sacude la
 * melena, se pone en jarras y le invita a tirar → él se hace el sobrado: sacude las manos, se chupa
 * el dedo y lo levanta para ver el viento, mide con el pulgar guiñando un ojo, saca un dardo del
 * bolsillo, le echa el aliento, apunta con la lengua fuera y a la pata coja y hace tres amagos…
 * Laura, que espera dando golpecitos con el pie, se da cuenta de que está en medio y se agacha
 * tapándose la cabeza → él lanza con todas sus fuerzas: el dardo pasa por encima de Laura, da en la
 * lámpara, rebota y vuelve dando vueltas a clavársele en el pelo, temblando → él mira arriba sin
 * moverse; Laura se asoma, lo ve y se tapa la boca muerta de risa → él sonríe a cámara avergonzado
 * con el pulgar arriba → negro.
 *
 * Sin textos. Todo depende del tiempo absoluto `t`.
 */
(() => {
  const { clamp, lerp, fase, suave, suave5, salida, entrada, tramo, campana, mezcla, ruido, hash } = M2;
  const G = Guillermo, L = Laura;
  const S = 0.30, SUELO = 560, XG = 212, XL = 560;
  const DUR = 14.45;
  const T = {
    // Laura: coger dardo (mano lejana a la cercana), apuntar, soltar
    coge: [0.62, 1.86, 2.98], sueltaL: [1.56, 2.71, 3.82], vuelo: 0.24,
    melena: 4.15, jarra: 4.45, invita: 4.7, espera: 5.35,
    // Guillermo
    chulo: 5.0, sacude: 5.45, lame: 6.25, viento: 6.55, mide: 7.05, saca: 7.6, sopla: 8.05, apunta: 8.45, amagos: 8.7,
    carga: 9.35, lanza: 9.6, suelta: 9.7, lampara: 10.08, pelo: 10.6,
    // Laura se agacha y luego se ríe
    seDaCuenta: 8.75, agacha: 9.1, asoma: 11.0, risa: 11.4,
    mira: 10.95, camara: 11.9, fin: 13.3
  };
  T.clava = T.sueltaL.map(s => s + T.vuelo);

  /* ---------- utilidades ---------- */
  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n], k); return o; };
  function linea(guion, estados, ini, t) {
    let c = estados[ini];
    for (const [t0, t1, nom, f] of guion) { if (t <= t0) break; c = mezclaE(c, estados[nom], (f || suave)(fase(t, t0, t1))); }
    return Object.assign({}, c);
  }
  const rot = (q, a) => ({ x: q.x * Math.cos(a) - q.y * Math.sin(a), y: q.x * Math.sin(a) + q.y * Math.cos(a) });
  const dirA = a => ({ x: Math.cos(a), y: Math.sin(a) });
  const angDif = (a, b) => Math.atan2(Math.sin(b - a), Math.cos(b - a));
  const D = (pu, ix, md, re) => ({ pulgar: pu, indice: ix, medio: md, anular: re, menique: re });
  const R_M = G.MUNECA_R * G.JK;
  const punoDesde = (m, mu) => ({ x: m.x - Math.cos(mu) * R_M, y: m.y - Math.sin(mu) * R_M });
  const BOLS_G = { c: punoDesde({ x: 131, y: 652 }, -1.75), l: punoDesde({ x: 372, y: 648 }, -1.75) };
  const BOLS_L = { c: L.BOLSILLO_C, l: L.BOLSILLO_L };

  /* ---------- caras ---------- */
  const BASE = { mx: 0.85, my: 0, c: 0, wd: 0, wi: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, orig: 1, abre: 0, ancho: 1, sonr: 0.12,
    dientes: 1, lengua: 0, mof: 0, rub: 0, rojo: 0 };
  const E = o => Object.assign({}, BASE, o);
  function cara(e, extraC) {
    const c = clamp(e.c + extraC);
    return { mirada: { x: e.mx, y: e.my }, iris: e.iris, espiral: 0, ojos: { d: clamp(c + e.wd), i: clamp(c + e.wi), feliz: e.h, apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: e.orig, abre: e.abre, ancho: e.ancho, sonrisa: e.sonr, dientes: e.dientes > 0.5, lengua: e.lengua },
      mofletes: e.mof, rubor: e.rub, bigote: 0 };
  }
  const parpadeo = (t, lista, d = 0.14) => { let o = 0; for (const tb of lista) { const k = fase(t, tb, tb + d); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); } return o; };

  /* ================= decorado ================= */
  const DIANA = { x: 884, y: 236, r: 74 };
  const LAMP = { x: 706, y: -30, L: 150 };              // enganche en el techo y largo del cable
  let fondo = null, diana = null;
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W + 80; c.height = H + 120; const g = c.getContext("2d");
    g.translate(40, 60);
    // pared verde botella con papel de rayas finas
    const pared = g.createLinearGradient(0, -60, 0, 380); pared.addColorStop(0, "#0e2a1d"); pared.addColorStop(1, "#1c4a33");
    g.fillStyle = pared; g.fillRect(-40, -60, W + 80, 440);
    g.fillStyle = "rgba(255,240,190,0.05)";
    for (let x = -40; x < W + 40; x += 34) g.fillRect(x, -60, 12, 440);
    g.fillStyle = "rgba(220,190,110,0.08)";
    for (let x = -23; x < W + 40; x += 34) for (let y = -40; y < 370; y += 46) { g.beginPath(); g.arc(x + 6, y + (x % 68 ? 0 : 23), 3, 0, Math.PI * 2); g.fill(); }
    // moldura alta de caoba
    g.fillStyle = "#3a1a0c"; g.fillRect(-40, -20, W + 80, 14); g.fillStyle = "#6b3417"; g.fillRect(-40, -20, W + 80, 4);
    // armario de la diana (puertas abiertas) y pizarra de marcas (rayitas, sin letras)
    const ax = DIANA.x, ay = DIANA.y;
    g.fillStyle = "rgba(0,0,0,0.35)"; g.fillRect(ax - 112, ay - 98, 236, 214);
    g.fillStyle = "#4a210d"; g.fillRect(ax - 118, ay - 104, 236, 214);
    g.fillStyle = "#2a1206"; g.fillRect(ax - 104, ay - 90, 208, 186);
    g.strokeStyle = "#140703"; g.lineWidth = 3; g.strokeRect(ax - 118, ay - 104, 236, 214);
    g.fillStyle = "#1c2a20"; g.fillRect(ax - 214, ay - 100, 92, 206); g.strokeRect(ax - 214, ay - 100, 92, 206);   // puerta izquierda: pizarra
    g.fillStyle = "#5a2a12"; g.fillRect(ax - 222, ay - 104, 8, 214); g.fillRect(ax - 122, ay - 104, 6, 214);
    g.strokeStyle = "rgba(240,240,230,0.7)"; g.lineWidth = 2.2; g.lineCap = "round";
    for (let fila = 0; fila < 5; fila++) {
      const y = ay - 78 + fila * 38, n = [4, 5, 2, 5, 3][fila];
      for (let i = 0; i < n; i++) {
        const x = ax - 200 + (i % 5) * 12 + (hash(fila * 7 + i) - 0.5) * 2;
        if (i === 4) { g.beginPath(); g.moveTo(ax - 204, y + 14); g.lineTo(ax - 148, y - 2); g.stroke(); }
        else { g.beginPath(); g.moveTo(x, y); g.lineTo(x + 2, y + 18); g.stroke(); }
      }
    }
    // tiza en el canto
    g.fillStyle = "#f2efe6"; g.fillRect(ax - 200, ay + 100, 18, 5);
    // cuadros enmarcados (siluetas de copas, sin letras)
    for (const [x, y, w, h] of [[118, 64, 92, 112], [290, 40, 70, 90]]) {
      g.fillStyle = "#6b4a14"; g.fillRect(x - 6, y - 6, w + 12, h + 12); g.fillStyle = "#e8dcc0"; g.fillRect(x, y, w, h);
      g.strokeStyle = "#2a1a06"; g.lineWidth = 2.5; g.strokeRect(x - 6, y - 6, w + 12, h + 12);
      g.fillStyle = "#3a5a40"; g.beginPath(); g.moveTo(x + w * 0.3, y + h * 0.22); g.lineTo(x + w * 0.7, y + h * 0.22); g.lineTo(x + w * 0.62, y + h * 0.55);
      g.lineTo(x + w * 0.54, y + h * 0.58); g.lineTo(x + w * 0.54, y + h * 0.78); g.lineTo(x + w * 0.66, y + h * 0.82); g.lineTo(x + w * 0.34, y + h * 0.82);
      g.lineTo(x + w * 0.46, y + h * 0.78); g.lineTo(x + w * 0.46, y + h * 0.58); g.lineTo(x + w * 0.38, y + h * 0.55); g.closePath(); g.fill();
    }
    // zócalo de caoba con barandilla de latón
    const zo = g.createLinearGradient(0, 372, 0, SUELO); zo.addColorStop(0, "#5a2a12"); zo.addColorStop(1, "#2e1508");
    g.fillStyle = zo; g.fillRect(-40, 372, W + 80, SUELO - 372);
    g.strokeStyle = "rgba(0,0,0,0.45)"; g.lineWidth = 2.5;
    for (let x = -10; x < W + 40; x += 118) { g.strokeRect(x, 396, 98, SUELO - 420); }
    g.fillStyle = "rgba(255,200,140,0.08)"; for (let x = -10; x < W + 40; x += 118) g.fillRect(x + 3, 399, 92, 4);
    g.fillStyle = "#c9a14a"; g.fillRect(-40, 364, W + 80, 9); g.fillStyle = "#f2d690"; g.fillRect(-40, 365, W + 80, 2);
    g.fillStyle = "#6b4a14"; g.fillRect(-40, 372, W + 80, 2);
    // suelo de tarima y la línea de tiro (latón)
    const su = g.createLinearGradient(0, SUELO, 0, H + 60); su.addColorStop(0, "#4a2612"); su.addColorStop(1, "#1e0e06");
    g.fillStyle = su; g.fillRect(-40, SUELO, W + 80, H + 60 - SUELO);
    g.strokeStyle = "rgba(0,0,0,0.35)"; g.lineWidth = 2;
    for (let i = 0, y = SUELO + 6; y < H + 60; i++, y += 7 + i * 4) { g.beginPath(); g.moveTo(-40, y); g.lineTo(W + 40, y); g.stroke(); }
    g.fillStyle = "rgba(255,210,150,0.15)"; g.fillRect(-40, SUELO, W + 80, 2);
    g.fillStyle = "#b8862e"; g.beginPath(); g.moveTo(612, SUELO + 2); g.lineTo(632, SUELO + 2); g.lineTo(650, H + 60); g.lineTo(624, H + 60); g.closePath(); g.fill();
    g.fillStyle = "#f2d690"; g.beginPath(); g.moveTo(614, SUELO + 2); g.lineTo(618, SUELO + 2); g.lineTo(630, H + 60); g.lineTo(626, H + 60); g.closePath(); g.fill();
    // viñeta
    const v = g.createRadialGradient(512, 300, 280, 512, 300, 700); v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,8,4,0.6)");
    g.fillStyle = v; g.fillRect(-40, -60, W + 80, H + 120);
    return c;
  }
  // la diana se guarda en su propio lienzo (se dibuja girada cuando tiembla)
  function creaDiana() {
    const r = DIANA.r, c = document.createElement("canvas"); c.width = c.height = Math.ceil(r * 2 + 12); const g = c.getContext("2d");
    g.translate(c.width / 2, c.height / 2);
    g.fillStyle = "#141414"; g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.fill();
    const anillo = (r0, r1, a, b) => { for (let i = 0; i < 20; i++) { const a0 = -Math.PI / 2 - Math.PI / 20 + i * Math.PI / 10;
      g.fillStyle = i % 2 ? b : a; g.beginPath(); g.arc(0, 0, r1, a0, a0 + Math.PI / 10); g.arc(0, 0, r0, a0 + Math.PI / 10, a0, true); g.closePath(); g.fill(); } };
    const rr = r * 0.82;
    anillo(rr * 0.0, rr * 1.0, "#f2e6c8", "#1c1c1c");
    anillo(rr * 0.92, rr * 1.0, "#c8262a", "#1d8a46");
    anillo(rr * 0.55, rr * 0.62, "#c8262a", "#1d8a46");
    g.fillStyle = "#1d8a46"; g.beginPath(); g.arc(0, 0, rr * 0.16, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#c8262a"; g.beginPath(); g.arc(0, 0, rr * 0.07, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "rgba(200,200,200,0.75)"; g.lineWidth = 0.9;
    for (const k of [0.07, 0.16, 0.55, 0.62, 0.92, 1]) { g.beginPath(); g.arc(0, 0, rr * k, 0, Math.PI * 2); g.stroke(); }
    for (let i = 0; i < 20; i++) { const a = -Math.PI / 2 - Math.PI / 20 + i * Math.PI / 10; g.beginPath(); g.moveTo(Math.cos(a) * rr * 0.16, Math.sin(a) * rr * 0.16); g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); g.stroke(); }
    // números: solo marcas blancas en el anillo exterior (sin cifras)
    g.fillStyle = "rgba(240,240,230,0.85)";
    for (let i = 0; i < 20; i++) { const a = -Math.PI / 2 + i * Math.PI / 10; g.beginPath(); g.arc(Math.cos(a) * r * 0.91, Math.sin(a) * r * 0.91, 1.8, 0, Math.PI * 2); g.fill(); }
    g.strokeStyle = "#0b0a0e"; g.lineWidth = 3; g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.stroke();
    g.fillStyle = "rgba(255,255,255,0.08)"; g.beginPath(); g.ellipse(-r * 0.35, -r * 0.4, r * 0.45, r * 0.25, -0.6, 0, Math.PI * 2); g.fill();
    return c;
  }
  // temblor de la diana: cada dardo de Laura la sacude (giro pequeño alrededor del clavo)
  function giroDiana(t) {
    let a = 0;
    for (const tc of T.clava) if (t >= tc) { const u = t - tc; a += 0.045 * Math.exp(-u * 7) * Math.sin(u * 34) * suave(fase(u, 0, 0.02)); }
    return a;
  }
  const aDiana = (q, t) => { const a = giroDiana(t), v = rot(q, a); return { x: DIANA.x + v.x, y: DIANA.y + v.y }; };

  // lámpara de latón: oscila un poco siempre y mucho tras el golpe del dardo
  function anguloLampara(t) {
    let a = 0.018 * Math.sin(t * 1.25 + 0.4);
    if (t >= T.lampara) { const u = t - T.lampara; a += -0.32 * Math.exp(-u * 0.9) * Math.sin(u * 5.2) * suave(fase(u, 0, 0.03)); }
    return a;
  }
  const enLampara = (t, q) => { const v = rot(q, anguloLampara(t)); return { x: LAMP.x + v.x, y: LAMP.y + v.y }; };
  function lampara(g, t) {
    const a = anguloLampara(t);
    g.save(); g.translate(LAMP.x, LAMP.y); g.rotate(a); g.lineJoin = "round";
    g.strokeStyle = "#141008"; g.lineWidth = 3; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, LAMP.L - 8); g.stroke();
    g.fillStyle = "#8a6a2a"; g.fillRect(-6, LAMP.L - 12, 12, 10); g.strokeRect(-6, LAMP.L - 12, 12, 10);
    // tulipa de latón
    const y0 = LAMP.L - 2, y1 = LAMP.L + 30;
    const gr = g.createLinearGradient(-34, 0, 34, 0); gr.addColorStop(0, "#6b4a12"); gr.addColorStop(0.3, "#f2d690"); gr.addColorStop(0.55, "#c9a14a"); gr.addColorStop(1, "#5a3a0c");
    g.fillStyle = gr; g.beginPath(); g.moveTo(-12, y0); g.lineTo(12, y0); g.quadraticCurveTo(20, y0 + 8, 34, y1); g.lineTo(-34, y1); g.quadraticCurveTo(-20, y0 + 8, -12, y0); g.closePath(); g.fill();
    g.strokeStyle = "#1a1006"; g.lineWidth = 2.5; g.stroke();
    g.fillStyle = "#3a2608"; g.beginPath(); g.ellipse(0, y1, 34, 5, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    // bombilla
    g.fillStyle = "#fff4c8"; g.beginPath(); g.ellipse(0, y1 + 3, 10, 7, 0, 0, Math.PI); g.fill();
    g.restore();
  }
  function luzLampara(g, t) {
    const a = anguloLampara(t), b = enLampara(t, { x: 0, y: LAMP.L + 32 }), d = rot({ x: 0, y: 1 }, a), n = { x: -d.y, y: d.x };
    const largo = 470, ab = 230;
    g.save(); g.globalCompositeOperation = "lighter";
    const gr = g.createLinearGradient(b.x, b.y, b.x + d.x * largo, b.y + d.y * largo);
    gr.addColorStop(0, "rgba(255,214,140,0.30)"); gr.addColorStop(1, "rgba(255,200,120,0)");
    g.fillStyle = gr; g.beginPath();
    g.moveTo(b.x + n.x * 30, b.y + n.y * 30); g.lineTo(b.x + d.x * largo + n.x * ab, b.y + d.y * largo + n.y * ab);
    g.lineTo(b.x + d.x * largo - n.x * ab, b.y + d.y * largo - n.y * ab); g.lineTo(b.x - n.x * 30, b.y - n.y * 30); g.closePath(); g.fill();
    // charco de luz en el suelo
    const px = b.x + d.x * (SUELO - b.y) / Math.max(0.3, d.y);
    const ch = g.createRadialGradient(px, SUELO + 4, 10, px, SUELO + 4, 190); ch.addColorStop(0, "rgba(255,210,140,0.22)"); ch.addColorStop(1, "rgba(255,190,120,0)");
    g.fillStyle = ch; g.beginPath(); g.ellipse(px, SUELO + 4, 190, 24, 0, 0, Math.PI * 2); g.fill();
    g.restore();
  }

  /* ================= dardos ================= */
  // Dardo con la punta en el origen apuntando hacia +x (largo total ≈ 46·esc).
  function dardo(g, x, y, ang, esc, col, alarga = 1) {
    g.save(); g.translate(x, y); g.rotate(ang); g.scale(esc, esc); g.lineJoin = "round"; g.lineCap = "round";
    const L = 46 * alarga;
    // alas (dos, vistas de canto con un poco de perspectiva)
    g.fillStyle = col[0]; g.strokeStyle = "#0b0a0e"; g.lineWidth = 1.3;
    g.beginPath(); g.moveTo(-L + 13, 0); g.lineTo(-L + 3, -8); g.lineTo(-L, -8); g.lineTo(-L + 1, 0); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = col[1];
    g.beginPath(); g.moveTo(-L + 13, 0); g.lineTo(-L + 3, 7); g.lineTo(-L, 7); g.lineTo(-L + 1, 0); g.closePath(); g.fill(); g.stroke();
    // caña
    g.strokeStyle = "#0b0a0e"; g.lineWidth = 3.6; g.beginPath(); g.moveTo(-L + 2, 0); g.lineTo(-24 * alarga, 0); g.stroke();
    g.strokeStyle = col[0]; g.lineWidth = 2; g.stroke();
    // barril de tungsteno
    const gr = g.createLinearGradient(0, -3.5, 0, 3.5); gr.addColorStop(0, "#f4f4f4"); gr.addColorStop(0.45, "#a9adb5"); gr.addColorStop(1, "#5a5e66");
    g.fillStyle = gr; g.beginPath(); g.moveTo(-25 * alarga, -2.6); g.lineTo(-11, -3.4); g.lineTo(-8, -1.6); g.lineTo(-8, 1.6); g.lineTo(-11, 3.4); g.lineTo(-25 * alarga, 2.6); g.closePath(); g.fill();
    g.strokeStyle = "#0b0a0e"; g.lineWidth = 1.2; g.stroke();
    g.strokeStyle = "rgba(40,40,50,0.6)"; g.lineWidth = 0.8; for (let i = 0; i < 4; i++) { const xx = -21 + i * 3.2; g.beginPath(); g.moveTo(xx, -2.8); g.lineTo(xx, 2.8); g.stroke(); }
    // punta de acero
    g.strokeStyle = "#0b0a0e"; g.lineWidth = 2.2; g.beginPath(); g.moveTo(-8, 0); g.lineTo(-0.5, 0); g.stroke();
    g.strokeStyle = "#e8eaee"; g.lineWidth = 1; g.beginPath(); g.moveTo(-8, 0); g.lineTo(0, 0); g.stroke();
    g.restore();
  }
  const COL_L = ["#e84a7a", "#ff9ab8"], COL_G = ["#2a7be0", "#8cc6ff"];
  const ESC_D = 1.05, ESC_G = 1.25;       // tamaño en pantalla; el de Guillermo, algo mayor para que se vea bien en su pelo
  const AGARRE = 16;                        // de la punta al punto por donde se agarra (unidades del dardo)
  // punto de agarre en pantalla de una mano (encima del puño, entre el pulgar y el índice)
  function agarre(C, p, m) {
    const off = rot({ x: 2, y: -7 }, m.ang || 0);
    return C.aPantalla(p, { x: m.x + off.x * C.JK, y: m.y + off.y * C.JK });
  }

  /* ================= Guillermo ================= */
  const CG = {
    chulo: E({ mx: 0.9, my: 0.08, orig: 0, sonr: 0.45, ancho: 0.92, sd: 6, gd: 0.08, si: -3, gi: -0.08 }),
    suerte: E({ mx: 0.9, my: 0.05, orig: 0, sonr: 0.22, ancho: 0.85, sd: 17, gd: 0.18, si: -2, gi: -0.05, c: 0.12 }),
    cejas: E({ mx: 0.9, my: 0, orig: 0, sonr: 0, ancho: 0.62, abre: 10, sd: 19, si: 19, gd: 0.12, gi: 0.12, iris: 1.05 }),
    pasmo: E({ mx: 0.9, my: 0.02, orig: 0, sonr: -0.05, ancho: 0.72, abre: 44, sd: 25, si: 25, gd: 0.1, gi: 0.1, iris: 0.8, lengua: 0.4 }),
    recompone: E({ mx: 0.85, my: 0, orig: 0, sonr: 0.5, ancho: 0.95, c: 0.32, h: 0.6, sd: 12, si: 4, gd: 0.12, gi: -0.05 }),
    sobrado: E({ mx: -0.85, my: -0.25, orig: 0, sonr: 0.72, ancho: 1, c: 0.15, sd: 15, si: 2, gd: 0.15, gi: -0.08 }),
    sacude: E({ mx: 0.85, my: 0.15, orig: 0, sonr: 0.55, ancho: 0.95, c: 0.55, h: 0.8, sd: 10, si: 10 }),
    lame: E({ mx: 0.6, my: 0.35, orig: 0, sonr: 0.1, ancho: 0.62, abre: 16, lengua: 1, sd: 9, si: 9 }),
    viento: E({ mx: 0.95, my: -0.75, orig: 0, sonr: 0.1, ancho: 0.56, abre: 5, sd: 16, si: 16, gd: 0.1, gi: 0.1 }),
    asiente: E({ mx: 0.9, my: -0.2, orig: 0, sonr: 0.55, ancho: 0.9, c: 0.3, h: 0.5, sd: 12, si: 12 }),
    mide: E({ mx: 0.95, my: -0.05, orig: 0, sonr: 0.25, ancho: 0.82, wi: 0.9, sd: -7, si: 9, gd: -0.12, gi: 0.1 }),
    dardo: E({ mx: 0.75, my: 0.3, orig: 0, sonr: 0.6, ancho: 0.95, sd: 12, si: 12, gd: 0.1, gi: 0.1 }),
    sopla: E({ mx: 0.7, my: 0.15, orig: 0, sonr: -0.1, ancho: 0.45, abre: 9, sd: 10, si: 10, mof: 0.4 }),
    apunta: E({ mx: 0.95, my: -0.05, orig: 0, sonr: 0.05, ancho: 0.55, abre: 11, lengua: 1, wi: 0.85, sd: -9, si: 4, gd: -0.15, gi: 0.05 }),
    carga: E({ mx: 0.95, my: -0.1, orig: 0, sonr: -0.2, ancho: 0.9, abre: 6, c: 0.45, z: 0.4, sd: -12, si: -12, gd: -0.22, gi: -0.22, rub: 0.3, rojo: 0.12 }),
    lanza: E({ mx: 0.95, my: -0.2, orig: 0, sonr: -0.1, ancho: 1.12, abre: 34, c: 0.55, z: 0.6, sd: -12, si: -12, gd: -0.2, gi: -0.2, rub: 0.3, rojo: 0.12 }),
    sigue: E({ mx: 0.95, my: -0.45, orig: 0, sonr: 0.4, ancho: 0.8, abre: 16, sd: 15, si: 15, gd: 0.1, gi: 0.1, iris: 1.08 }),
    clonc: E({ mx: 0.9, my: -0.55, orig: 0, sonr: -0.15, ancho: 0.62, abre: 22, sd: 21, si: 21, gd: 0.12, gi: 0.12, iris: 0.85 }),
    vuelve: E({ mx: 0.55, my: -0.75, orig: 0, sonr: -0.35, ancho: 0.66, abre: 36, sd: 27, si: 27, gd: 0.1, gi: 0.1, iris: 0.7 }),
    pincha: E({ mx: 0.3, my: -0.4, orig: 0, sonr: -0.3, ancho: 0.95, abre: 20, c: 1, z: 1, sd: -4, si: -4 }),
    arriba: E({ mx: 0.15, my: -1, orig: 0, sonr: -0.25, ancho: 0.6, abre: 7, sd: 22, si: 22, gd: 0.14, gi: 0.14, iris: 0.92 }),
    camara: E({ mx: -0.85, my: -0.18, orig: 0, sonr: 0.72, ancho: 1.02, abre: 7, c: 0.28, h: 0.75, sd: 13, si: 13, gd: 0.28, gi: 0.28, rub: 0.75, rojo: 0.1 })
  };
  const GUION_CG = [
    [T.clava[0] + 0.08, T.clava[0] + 0.3, "suerte"], [T.clava[1] + 0.05, T.clava[1] + 0.25, "cejas"], [T.clava[2] + 0.04, T.clava[2] + 0.2, "pasmo"],
    [T.invita - 0.05, T.invita + 0.25, "recompone"], [T.chulo, T.chulo + 0.25, "sobrado"], [T.sacude + 0.05, T.sacude + 0.3, "sacude"],
    [T.lame - 0.15, T.lame + 0.05, "lame"], [T.viento, T.viento + 0.2, "viento"], [T.viento + 0.32, T.viento + 0.45, "asiente"],
    [T.mide, T.mide + 0.22, "mide"], [T.saca + 0.05, T.saca + 0.3, "dardo"], [T.sopla - 0.05, T.sopla + 0.1, "sopla"], [T.sopla + 0.3, T.sopla + 0.42, "dardo"],
    [T.apunta, T.apunta + 0.2, "apunta"], [T.carga - 0.05, T.carga + 0.1, "carga"],
    [T.lanza, T.lanza + 0.08, "lanza"], [T.suelta + 0.08, T.suelta + 0.25, "sigue"], [T.lampara, T.lampara + 0.06, "clonc"],
    [T.lampara + 0.18, T.lampara + 0.32, "vuelve"], [T.pelo - 0.02, T.pelo + 0.05, "pincha"], [T.pelo + 0.28, T.pelo + 0.5, "arriba"],
    [T.camara, T.camara + 0.4, "camara"]
  ];
  const PARP_G = [0.4, 2.2, 3.4, 5.95, 7.5, 11.35, 11.6, 12.6];

  // cuerpo: dx (px de pantalla), pel (hoja, + agacha), torso, cab; manos respecto a su hombro (hoja):
  // cercana (cx, cy, ca, cmu, cp = fuera del bolsillo, dedos c*) y lejana (lx, ly, la, lmu, lp, dedos l*)
  const P0G = { dx: 0, pel: 0, torso: 0, cab: 0, cx: 0, cy: 300, ca: 0, cmu: -1.75, cp: 0, cpu: 0, cix: 0, cre: 0,
    lx: 0, ly: 280, la: 0, lmu: -1.75, lp: 0, lpu: 0, lix: 0, lmd: 0, lre: 0 };
  const CuG = o => Object.assign({}, P0G, o);
  const CERCA_SUELTA = { cx: -34, cy: 288, cmu: -1.55, cp: 1, cpu: 0.35, cix: 0.45, cre: 0.4 };   // mano cercana colgando, relajada
  const AGARRA = { lpu: 0.3, lix: 0.3, lmd: 0.25, lre: 0.1 };                                     // pinza del dardo
  const CUER_G = {
    bolsillos: CuG({}),
    sobrado: CuG({ torso: -0.04, cab: -0.05 }),
    sacude: CuG(Object.assign({ torso: 0.02, cab: 0.03, lx: 52, ly: 262, la: 0, lmu: -1.6, lp: 1, lpu: 0.5, lix: 0.6, lmd: 0.6, lre: 0.55 },
      CERCA_SUELTA, { cx: -40, cy: 282, cpu: 0.5, cix: 0.6, cre: 0.55 })),
    lame: CuG(Object.assign({ torso: 0.02, cab: 0.03, lx: -18, ly: -140, la: 0, lmu: 0.1, lp: 1, lpu: 0.15, lix: 1, lmd: 0, lre: 0 }, CERCA_SUELTA)),
    viento: CuG(Object.assign({ torso: -0.06, cab: -0.12, lx: 112, ly: -246, la: 0, lmu: 1.5, lp: 1, lpu: 0.15, lix: 1, lmd: 0, lre: 0 }, CERCA_SUELTA)),
    mide: CuG(Object.assign({ torso: 0.05, cab: 0.04, lx: 246, ly: -124, la: 0, lmu: 3.05, lp: 1, lpu: 1, lix: 0, lmd: 0, lre: 0 }, CERCA_SUELTA)),
    alBolsillo: CuG(Object.assign({ torso: 0.03, cab: 0.06, lp: 0, lx: 0, ly: 280 }, CERCA_SUELTA)),
    muestra: CuG(Object.assign({ torso: 0.02, cab: 0.06, lx: 44, ly: 92, la: 0, lmu: 2.1, lp: 1 }, AGARRA, CERCA_SUELTA)),
    sopla: CuG(Object.assign({ torso: 0.04, cab: 0.08, lx: 2, ly: -86, la: 0, lmu: 1.9, lp: 1 }, AGARRA, CERCA_SUELTA)),
    apunta: CuG(Object.assign({ torso: 0.07, pel: 12, cab: 0.03, lx: 132, ly: -170, la: 0, lmu: 1.62, lp: 1 }, AGARRA,
      { cx: -96, cy: 196, cmu: -0.9, cp: 1, cpu: 0.75, cix: 0.95, cre: 0.9 })),
    carga: CuG(Object.assign({ torso: -0.16, pel: 20, dx: -8, cab: -0.05, lx: 44, ly: -58, la: 0, lmu: 1.15, lp: 1 }, AGARRA,
      { cx: 70, cy: 190, cmu: -1.9, cp: 1, cpu: 0.6, cix: 0.8, cre: 0.75 })),
    lanza: CuG({ torso: 0.17, pel: 14, dx: 16, cab: 0.06, cx: -110, cy: 190, cmu: -0.9, cp: 1, cpu: 0.7, cix: 0.9, cre: 0.85,
      lx: 236, ly: -148, la: 0, lmu: 3.0, lp: 1, lpu: 0.9, lix: 1, lmd: 0.95, lre: 0.85 }),
    quieto: CuG({ torso: 0.1, pel: 8, dx: 12, cab: -0.04, cx: -80, cy: 210, cmu: -1.2, cp: 1, cpu: 0.6, cix: 0.8, cre: 0.75,
      lx: 200, ly: -100, la: 0, lmu: 2.95, lp: 1, lpu: 0.8, lix: 0.9, lmd: 0.85, lre: 0.8 }),
    final: CuG(Object.assign({ torso: 0, pel: 4, dx: 8, cab: -0.06, lx: 6, ly: 92, la: 0, lmu: 1.75, lp: 1, lpu: 1, lix: 0, lmd: 0, lre: 0 }, CERCA_SUELTA))
  };
  const GUION_G = [
    [T.chulo, T.chulo + 0.3, "sobrado"], [T.sacude, T.sacude + 0.3, "sacude"],
    [T.lame - 0.32, T.lame - 0.02, "lame"], [T.viento, T.viento + 0.28, "viento"], [T.mide - 0.05, T.mide + 0.3, "mide"],
    [T.saca - 0.25, T.saca - 0.02, "alBolsillo"], [T.saca + 0.02, T.saca + 0.3, "muestra"], [T.sopla - 0.12, T.sopla + 0.1, "sopla"],
    [T.apunta - 0.05, T.apunta + 0.3, "apunta"], [T.carga, T.lanza, "carga", suave5],
    [T.lanza, T.suelta + 0.06, "lanza", salida], [T.lampara + 0.1, T.lampara + 0.7, "quieto"], [T.camara - 0.1, T.camara + 0.5, "final"]
  ];
  const TOB_G = { cerca: G.SUELO - G.TOBILLO_ALTO, lejos: G.SUELO - G.TOBILLO_ALTO - 12 };
  // Amagos: la mano va y viene por la línea de tiro mientras apunta (y levanta el pie de atrás)
  const amago = t => { const k = fase(t, T.amagos, T.carga - 0.05); return k <= 0 || k >= 1 ? 0 : Math.sin(k * Math.PI * 3) * Math.sin(k * Math.PI); };
  const pataCoja = t => tramo(t, T.apunta + 0.05, T.apunta + 0.35) * (1 - tramo(t, T.carga - 0.05, T.carga + 0.15));
  const sacudida = t => tramo(t, T.sacude + 0.1, T.sacude + 0.25) * (1 - tramo(t, T.lame - 0.45, T.lame - 0.3));
  const PELO = { x: 772, y: 318 };           // punto del pelo (retrato) donde se clava el dardo

  function poseG(t) {
    const b = linea(GUION_G, CUER_G, "bolsillos", t);
    const respira = Math.sin(t * 2.2 + 0.3);
    const p = {
      x: XG + b.dx, suelo: SUELO, s: S,
      pelvis: { x: G.PELVIS.x, y: G.PELVIS.y + b.pel + respira * 1.2 },
      torso: b.torso, torsoEsc: { x: 1, y: 1 + respira * 0.004 },
      piernas: {}, cabeza: { ang: b.cab, dx: 0, dy: 0, esc: { x: 1, y: 1 } }, tirasLimpias: true, ikContinuo: true
    };
    // asombro al tercer dardo: echa la cabeza atrás
    p.cabeza.ang -= 0.07 * campana(t, T.clava[2], T.clava[2] + 0.6);
    // asiente al ver el viento
    p.cabeza.ang += 0.05 * Math.sin((t - T.viento - 0.3) * 18) * campana(t, T.viento + 0.3, T.viento + 0.5);
    // pinchazo en el pelo: la cabeza da un respingo
    const pin = t >= T.pelo ? Math.exp(-(t - T.pelo) * 7) * suave(fase(t, T.pelo, T.pelo + 0.03)) : 0;
    p.cabeza.dy += 10 * pin; p.cabeza.esc = { x: 1 + 0.05 * pin, y: 1 - 0.07 * pin }; p.cabeza.ang += 0.06 * pin;
    // pies: firmes; el de atrás se levanta (a la pata coja) mientras apunta
    const pc = pataCoja(t);
    p.piernas.cerca = { tob: { x: G.PELVIS.x - 62 - 40 * pc, y: TOB_G.cerca - 70 * pc }, ang: 0.5 * pc };
    p.piernas.lejos = { tob: { x: G.PELVIS.x + 64, y: TOB_G.lejos }, ang: 0 };
    p.torso += 0.03 * Math.sin(t * 4.1) * pc;
    // cara
    const e = linea(GUION_CG, CG, "chulo", t);
    p.cara = cara(e, parpadeo(t, PARP_G));
    p.cara.mofletes = e.mof;
    p.rojo = e.rojo;
    // manos
    const Tr = G.tronco(p), hc = Tr(G.HOMBRO_C), hl = Tr(G.HOMBRO);
    let c = { x: hc.x + b.cx, y: hc.y + b.cy }, l = { x: hl.x + b.lx, y: hl.y + b.ly };
    c = mezcla(Tr(BOLS_G.c), c, clamp(b.cp * 1.5)); l = mezcla(Tr(BOLS_G.l), l, clamp(b.lp * 1.5));
    // sacude las manos para soltarlas
    const sc = sacudida(t);
    let cang = b.ca, lang = b.la;
    if (sc > 0) { const w = Math.sin(t * 38), w2 = Math.sin(t * 38 + 1.3);
      c = { x: c.x + 14 * w * sc, y: c.y + 6 * w2 * sc }; l = { x: l.x + 14 * w2 * sc, y: l.y + 6 * w * sc }; cang += 0.35 * w * sc; lang += 0.35 * w2 * sc; }
    // amagos a lo largo de la línea de tiro
    const am = amago(t); l = { x: l.x + 34 * am, y: l.y - 6 * am };
    p.manoCerca = { x: c.x, y: c.y, ang: cang, mu: b.cmu, dobla: -1, puno: b.cp, dedos: D(b.cpu, b.cix, b.cre, b.cre) };
    p.manoLejos = { x: l.x, y: l.y, ang: lang, mu: b.lmu, dobla: -1, puno: b.lp, dedos: D(b.lpu, b.lix, b.lmd, b.lre) };
    return p;
  }

  /* ================= Laura ================= */
  const CL = {
    centra: E({ mx: 0.9, my: 0.1, orig: 0, sonr: 0.22, ancho: 0.88, sd: 4, si: 4 }),
    apunta: E({ mx: 0.95, my: 0.05, orig: 0, sonr: 0.12, ancho: 0.78, wi: 0.55, c: 0.15, sd: -4, si: 6, gd: -0.08, gi: 0.06 }),
    tira: E({ mx: 0.95, my: 0.08, orig: 0, sonr: 0.45, ancho: 0.9, c: 0.08, sd: 6, si: 6 }),
    sinMirar: E({ mx: -0.85, my: -0.15, orig: 0, sonr: 0.62, ancho: 0.92, c: 0.2, h: 0.4, sd: 9, si: 13, gi: 0.12 }),
    melena: E({ mx: 0.4, my: -0.2, orig: 0, sonr: 0.62, ancho: 0.92, c: 0.85, h: 1, sd: 9, si: 9 }),
    chula: E({ mx: -0.75, my: 0.05, orig: 0, sonr: 0.66, ancho: 0.92, c: 0.25, h: 0.35, sd: 8, si: 15, gd: 0.02, gi: 0.14 }),
    divertida: E({ mx: -0.75, my: 0.08, orig: 0, sonr: 0.42, ancho: 0.9, c: 0.18, sd: 6, si: 12, gi: 0.1 }),
    aburrida: E({ mx: -0.7, my: 0.2, orig: 0, sonr: -0.1, ancho: 0.8, c: 0.42, sd: 4, si: 8, gi: 0.06 }),
    harta: E({ mx: -0.2, my: -0.95, orig: 0, sonr: -0.05, ancho: 0.82, c: 0.1, sd: 15, si: 15, gd: 0.08, gi: 0.08 }),
    alarma: E({ mx: -0.85, my: 0.05, orig: 0, sonr: -0.3, ancho: 0.62, abre: 15, iris: 0.8, sd: 22, si: 22, gd: 0.12, gi: 0.12 }),
    camaraAlarma: E({ mx: -0.85, my: -0.25, orig: 0, sonr: -0.35, ancho: 0.6, abre: 12, iris: 0.82, sd: 22, si: 22, gd: 0.18, gi: 0.18 }),
    agachada: E({ mx: 0.2, my: 0.3, orig: 0, sonr: -0.45, ancho: 0.72, abre: 6, c: 1, z: 1, sd: -6, si: -6, gd: -0.1, gi: -0.1 }),
    asoma: E({ mx: -0.7, my: -0.45, orig: 0, sonr: -0.05, ancho: 0.7, abre: 5, c: 0.25, sd: 14, si: 14, gd: 0.08, gi: 0.08 }),
    ve: E({ mx: -0.75, my: -0.55, orig: 0, sonr: 0.2, ancho: 0.75, abre: 14, sd: 20, si: 20, gd: 0.1, gi: 0.1, iris: 0.9 }),
    risa: E({ mx: -0.6, my: -0.2, orig: 0, sonr: 0.95, ancho: 1, abre: 18, c: 0.92, h: 1, sd: 14, si: 14, gd: 0.18, gi: 0.18, rub: 0.55 }),
    risaCam: E({ mx: -0.85, my: -0.2, orig: 0, sonr: 0.95, ancho: 1, abre: 12, c: 0.6, h: 1, sd: 13, si: 13, gd: 0.2, gi: 0.2, rub: 0.6 })
  };
  const GUION_CL = [
    [T.coge[0] + 0.25, T.coge[0] + 0.45, "apunta"], [T.sueltaL[0] - 0.02, T.sueltaL[0] + 0.1, "tira"],
    [T.coge[1] + 0.25, T.coge[1] + 0.45, "apunta"], [T.sueltaL[1] - 0.02, T.sueltaL[1] + 0.1, "tira"],
    [T.coge[2] + 0.2, T.coge[2] + 0.4, "sinMirar"], [T.melena - 0.05, T.melena + 0.15, "melena"], [T.jarra, T.jarra + 0.25, "chula"],
    [T.chulo + 0.25, T.chulo + 0.5, "divertida"], [T.viento + 0.1, T.viento + 0.35, "harta"], [T.mide + 0.15, T.mide + 0.35, "divertida"],
    [T.apunta + 0.1, T.apunta + 0.3, "aburrida"],
    [T.seDaCuenta, T.seDaCuenta + 0.12, "alarma"], [T.seDaCuenta + 0.22, T.seDaCuenta + 0.32, "camaraAlarma"], [T.agacha - 0.02, T.agacha + 0.1, "agachada"],
    [T.asoma - 0.05, T.asoma + 0.2, "asoma"], [T.mira + 0.3, T.mira + 0.42, "ve"], [T.risa, T.risa + 0.12, "risa"], [T.camara + 0.3, T.camara + 0.6, "risaCam"]
  ];
  const PARP_L = [0.3, 2.35, 5.15, 6.0, 7.4, 8.3, 10.6, 12.55];

  // manos de Laura respecto a su hombro (hoja). La cercana sujeta los dardos a la altura del pecho.
  const P0L = { dx: 0, pel: 6, torso: 0.02, cab: 0, cx: 104, cy: 196, ca: 0, cmu: -2.7, cp: 1, cpu: 0.35, cix: 0.35, cre: 0.3,
    lx: -108, ly: 196, la: 0, lmu: 2.6, lp: 1, lpu: 0.35, lix: 0.35, lmd: 0.3, lre: 0.25 };
  const CuL = o => Object.assign({}, P0L, o);
  const CUER_L = {
    pecho: CuL({}),
    apunta: CuL({ torso: 0.05, cab: 0.03, lx: 178, ly: -176, la: 0, lmu: 1.62 }),
    carga: CuL({ torso: 0.02, cab: 0.02, lx: 150, ly: -186, la: 0, lmu: 1.4 }),
    tira: CuL({ torso: 0.1, dx: 5, cab: 0.04, lx: 270, ly: -64, la: 0, lmu: 3.05, lpu: 0.9, lix: 1, lmd: 0.95, lre: 0.85 }),
    jarra: CuL({ pel: 0, torso: -0.03, cab: -0.06, cx: 18, cy: 250, ca: 0.2, cmu: -0.4, cp: 1, cpu: 0.2, cix: 0.25, cre: 0.25,
      lx: 30, ly: 245, la: 0, lmu: -2.6, lp: 1, lpu: 0.2, lix: 0.25, lmd: 0.25, lre: 0.25 }),
    invita: CuL({ pel: 0, torso: 0.02, cab: -0.04, cx: 18, cy: 250, ca: 0.2, cmu: -0.4, cp: 1, cpu: 0.2, cix: 0.25, cre: 0.25,
      lx: 205, ly: 60, la: 0, lmu: 2.75, lp: 1, lpu: 0.9, lix: 1, lmd: 1, lre: 1 }),
    espera: CuL({ pel: 0, torso: -0.02, cab: -0.05, cx: 18, cy: 250, ca: 0.2, cmu: -0.4, cp: 1, cpu: 0.2, cix: 0.25, cre: 0.25,
      lx: 30, ly: 245, la: 0, lmu: -2.6, lp: 1, lpu: 0.2, lix: 0.25, lmd: 0.25, lre: 0.25 }),
    agacha: CuL({ pel: 175, torso: 0.38, dx: -6, cab: 0.18, cp: 1, cpu: 0.8, cix: 0.9, cre: 0.9, lp: 1, lpu: 0.8, lix: 0.9, lmd: 0.9, lre: 0.9 }),
    asoma: CuL({ pel: 110, torso: 0.16, dx: -4, cab: -0.06, cp: 1, cpu: 0.8, cix: 0.9, cre: 0.9, lp: 1, lpu: 0.8, lix: 0.9, lmd: 0.9, lre: 0.9 }),
    risa: CuL({ pel: 10, torso: 0.06, cab: -0.08, cx: 138, cy: 190, ca: 0, cmu: -2.7, cp: 1, cpu: 0.5, cix: 0.65, cre: 0.6,
      lp: 1, lpu: 0.75, lix: 0.95, lmd: 0.95, lre: 0.9 })
  };
  // mano lejana: coger dardo (a la mano cercana) → apuntar → cargar → tirar, tres veces
  const GUION_L = [];
  for (let i = 0; i < 3; i++) {
    const c0 = T.coge[i], s0 = T.sueltaL[i];
    if (i > 0) GUION_L.push([c0 - 0.3, c0, "pecho"]);
    GUION_L.push([c0 + 0.08, c0 + 0.4, "apunta"], [s0 - 0.2, s0 - 0.09, "carga"], [s0 - 0.09, s0 + 0.03, "tira", salida]);
  }
  GUION_L.push([T.melena + 0.15, T.jarra + 0.15, "jarra"], [T.invita, T.invita + 0.3, "invita"], [T.espera, T.espera + 0.35, "espera"],
    [T.agacha - 0.2, T.agacha + 0.14, "agacha"], [T.asoma, T.asoma + 0.35, "asoma"], [T.risa - 0.15, T.risa + 0.25, "risa"]);
  // cubrirse la cabeza (agachada / asomándose) y taparse la boca (risa): posiciones calculadas sobre su cabeza
  const cubre = t => tramo(t, T.agacha - 0.22, T.agacha + 0.1) * (1 - tramo(t, T.asoma + 0.25, T.risa));
  const tapa = t => tramo(t, T.risa - 0.1, T.risa + 0.2);

  function poseL(t) {
    const b = linea(GUION_L, CUER_L, "pecho", t);
    const respira = Math.sin(t * 2.0 + 1.1);
    // risa: sacudidas de hombros
    const ri = tramo(t, T.risa, T.risa + 0.2) * (1 - tramo(t, T.fin, T.fin + 0.5));
    const sacude = ri * Math.abs(Math.sin((t - T.risa) * 15));
    // sacudida de melena tras el tercer dardo
    const flick = campana(t, T.melena, T.melena + 0.55);
    const p = {
      x: XL + b.dx, suelo: SUELO, s: S,
      pelvis: { x: L.PELVIS.x, y: L.PELVIS.y + b.pel + respira * 1.1 - 7 * sacude },
      torso: b.torso + 0.03 * sacude, torsoEsc: { x: 1, y: 1 + respira * 0.004 },
      piernas: {}, cabeza: { ang: b.cab - 0.22 * Math.sin(Math.PI * fase(t, T.melena, T.melena + 0.55)) * flick - 0.05 * sacude, dx: 0, dy: 0, esc: { x: 1, y: 1 } },
      tirasLimpias: true, ikContinuo: true
    };
    const ty = L.SUELO - L.TOBILLO_ALTO;
    p.piernas.cerca = { tob: { x: L.PELVIS.x - 78, y: ty }, ang: 0 };
    const golpea = tramo(t, T.mide + 0.2, T.mide + 0.4) * (1 - tramo(t, T.seDaCuenta - 0.15, T.seDaCuenta));
    const pie = golpea * Math.max(0, Math.sin((t - T.mide) * 13));
    p.piernas.lejos = { tob: { x: L.PELVIS.x + 104 - 8 * pie, y: ty - 10 - 4 * pie }, ang: -0.28 * pie };
    // melena: inercia con los giros de cabeza y el tirón del lanzamiento
    const d = (linea(GUION_L, CUER_L, "pecho", t).torso - linea(GUION_L, CUER_L, "pecho", t - 0.1).torso) / 0.1;
    p.pelo = { inercia: clamp(-0.5 * d + 1.6 * flick * Math.sin(Math.PI * 2 * fase(t, T.melena, T.melena + 0.55)), -1, 1), viento: 0.1 * Math.sin(t * 1.2) };
    // cara
    const e = linea(GUION_CL, CL, "centra", t);
    p.cara = cara(e, parpadeo(t, PARP_L, 0.13));
    p.rojo = e.rojo;
    // manos
    const Tr = L.tronco(p), hc = Tr(L.HOMBRO_C), hl = Tr(L.HOMBRO);
    let c = { x: hc.x + b.cx, y: hc.y + b.cy }, l = { x: hl.x + b.lx, y: hl.y + b.ly };
    let cmu = b.cmu, lmu = b.lmu, cang = b.ca, lang = b.la;
    const H = L.cabeza(p);
    const cu = cubre(t);
    if (cu > 0.0005) {
      const a = H.a({ x: 700, y: 300 }), bb = H.a({ x: 880, y: 250 });
      c = mezcla(c, { x: a.x - 6, y: a.y + 10 }, cu); l = mezcla(l, { x: bb.x + 4, y: bb.y + 14 }, cu);
      cmu = lerp(cmu, 2.3, cu); lmu = lerp(lmu, 1.0, cu);
    }
    const tp = tapa(t);
    if (tp > 0.0005) {
      const bo = L.boca(p);
      l = mezcla(l, { x: bo.x + 34, y: bo.y + 34 + 4 * sacude }, tp); lmu = lerp(lmu, 1.9, tp); lang = lerp(lang, -0.2, tp);
    }
    p.manoCerca = { x: c.x, y: c.y, ang: cang, mu: cmu, dobla: -1, puno: b.cp, dedos: D(b.cpu, b.cix, b.cre, b.cre) };
    p.manoLejos = { x: l.x, y: l.y, ang: lang, mu: lmu, dobla: 1, puno: b.lp, dedos: D(b.lpu, b.lix, b.lmd, b.lre) };
    return p;
  }

  /* ================= trayectorias de los dardos ================= */
  // dianas: dónde se clava cada dardo de Laura (coordenadas de la diana) y su ángulo
  const BLANCO = [{ x: -2, y: 1 }, { x: 3.5, y: -3 }, { x: 0.5, y: 4 }];
  const ANG_MANO_L = -0.12, ANG_MANO_G = -0.18;
  // abanico de dardos que sujeta la mano cercana de Laura (ángulo y desplazamiento en pantalla)
  const ABANICO = [{ a: 0.55, dx: 0, dy: -2 }, { a: 0.75, dx: -1, dy: 0 }, { a: 0.95, dx: -2, dy: 2 }];
  const memo = new Map();
  const cache = (k, f) => { if (!memo.has(k)) memo.set(k, f()); return memo.get(k); };
  function dardoLaura(i, t) {
    const c0 = T.coge[i], s0 = T.sueltaL[i], tc = T.clava[i];
    if (t >= tc) {                                         // clavado: tiembla un poco y sigue a la diana
      const llegada = cache("L" + i, () => vueloLaura(i, tc));
      const q = aDiana(BLANCO[i], t), u = t - tc;
      return { x: q.x, y: q.y, a: llegada.a + giroDiana(t) + 0.16 * Math.exp(-u * 9) * Math.sin(u * 48), clavado: true };
    }
    if (t >= s0) return vueloLaura(i, t);
    const pL = poseL(t);
    const enAbanico = () => { const m = pL.manoCerca, q = agarre(L, pL, m), s = ABANICO[i];
      const a = s.a + 0.08 * Math.sin(t * 2), o = dirA(a); return { x: q.x + s.dx + o.x * AGARRE * ESC_D, y: q.y + s.dy + o.y * AGARRE * ESC_D, a }; };
    const enMano = () => { const m = pL.manoLejos, q = agarre(L, pL, m), a = ANG_MANO_L + (m.ang || 0), o = dirA(a);
      return { x: q.x + o.x * AGARRE * ESC_D, y: q.y + o.y * AGARRE * ESC_D, a }; };
    const k = suave(fase(t, c0 - 0.06, c0 + 0.08));
    if (k <= 0) return enAbanico();
    if (k >= 1) return enMano();
    const A = enAbanico(), B = enMano();
    return { x: lerp(A.x, B.x, k), y: lerp(A.y, B.y, k), a: A.a + angDif(A.a, B.a) * k };
  }
  function vueloLaura(i, t) {
    const s0 = T.sueltaL[i], tc = T.clava[i];
    const ini = cache("Li" + i, () => { const pL = poseL(s0), m = pL.manoLejos, q = agarre(L, pL, m), a = ANG_MANO_L + (m.ang || 0), o = dirA(a);
      return { x: q.x + o.x * AGARRE * ESC_D, y: q.y + o.y * AGARRE * ESC_D, a }; });
    const fin = aDiana(BLANCO[i], tc), h = 16;
    const u = fase(t, s0, tc);
    const x = lerp(ini.x, fin.x, u), y = lerp(ini.y, fin.y, u) - 4 * h * u * (1 - u);
    const vx = fin.x - ini.x, vy = fin.y - ini.y - 4 * h * (1 - 2 * u);
    const av = Math.atan2(vy, vx);
    return { x, y, a: ini.a + angDif(ini.a, av) * suave(u / 0.35) };
  }

  // dardo de Guillermo: sale del bolsillo, en la mano hasta soltarlo, a la lámpara, vuelve y se le clava en el pelo
  const sacaK = t => tramo(t, T.saca - 0.08, T.saca + 0.14);            // cuánto ha salido del bolsillo
  function enManoG(t, pG) {
    const p = pG || poseG(t), m = p.manoLejos, q = agarre(G, p, m);
    // el dardo apunta hacia arriba mientras lo saca y hacia la diana mientras apunta
    const ap = tramo(t, T.apunta - 0.05, T.apunta + 0.3), cg = tramo(t, T.carga, T.lanza);
    const a = lerp(lerp(-1.25, ANG_MANO_G, ap), ANG_MANO_G - 0.35, cg * (1 - tramo(t, T.lanza, T.suelta))) + (m.ang || 0);
    const o = dirA(a);
    return { x: q.x + o.x * AGARRE * ESC_G, y: q.y + o.y * AGARRE * ESC_G, a };
  }
  const IMPACTO_LAMP = { x: -30, y: LAMP.L + 16 };                       // borde izquierdo de la tulipa (coord. de la lámpara)
  const clavoPelo = t => { const p = poseG(t); return G.aPantalla(p, G.cabeza(p).a(PELO)); };
  function dardoG(t) {
    if (t < T.suelta) return Object.assign(enManoG(t), { largo: sacaK(t) });
    const ini = cache("Gi", () => enManoG(T.suelta));
    const Q = cache("GQ", () => enLampara(T.lampara, IMPACTO_LAMP));
    if (t < T.lampara) {                                   // ida: parábola hacia la diana… y se cruza con la lámpara
      const u = fase(t, T.suelta, T.lampara), h = 70;
      const x = lerp(ini.x, Q.x, u), y = lerp(ini.y, Q.y, u) - 4 * h * u * (1 - u);
      const av = Math.atan2(Q.y - ini.y - 4 * h * (1 - 2 * u), Q.x - ini.x);
      return { x, y, a: ini.a + angDif(ini.a, av) * suave(u / 0.3), largo: 1 };
    }
    const P = cache("GP", () => clavoPelo(T.pelo));
    // vuelta: curva por arriba dando vueltas y entra de punta en el pelo
    const C1 = { x: Q.x - 140, y: Q.y - 80 }, C2 = { x: P.x + 170, y: P.y - 110 };
    const bez = u => { const v = 1 - u; return { x: v * v * v * Q.x + 3 * v * v * u * C1.x + 3 * v * u * u * C2.x + u * u * u * P.x, y: v * v * v * Q.y + 3 * v * v * u * C1.y + 3 * v * u * u * C2.y + u * u * u * P.y }; };
    const fin = cache("GaF", () => { const a = bez(0.97), b = bez(1); return Math.atan2(b.y - a.y, b.x - a.x); });
    const angQ = cache("GaQ", () => dardoGIda(T.lampara - 1e-4).a);
    if (t < T.pelo) {
      const u = fase(t, T.lampara, T.pelo), q = bez(salida(u) * 0.35 + u * 0.65);
      const vueltas = 2 * Math.PI * 2;
      const a = angQ + Math.PI + (angDif(angQ + Math.PI, fin) + vueltas) * salida(u);
      return { x: q.x, y: q.y, a, largo: 1 };
    }
    // clavado en el pelo: sigue a la cabeza y tiembla («boing»)
    const pG = poseG(t), H = G.cabeza(pG), H0 = cache("GH0", () => G.cabeza(poseG(T.pelo)).ang);
    const q = G.aPantalla(pG, H.a(PELO)), u = t - T.pelo;
    return { x: q.x, y: q.y, a: fin + (H.ang - H0) + 0.38 * Math.exp(-u * 4.2) * Math.sin(u * 40), largo: 1, clavado: true };
  }
  function dardoGIda(t) {
    const ini = cache("Gi", () => enManoG(T.suelta)), Q = cache("GQ", () => enLampara(T.lampara, IMPACTO_LAMP));
    const u = fase(t, T.suelta, T.lampara), h = 70;
    const av = Math.atan2(Q.y - ini.y - 4 * h * (1 - 2 * u), Q.x - ini.x);
    return { a: ini.a + angDif(ini.a, av) * suave(u / 0.3) };
  }

  /* ================= efectos ================= */
  function estrellaPuntas(g, x, y, r, puntas, rot0, rel = 0.45) {
    g.beginPath(); for (let i = 0; i < puntas * 2; i++) { const a = rot0 + i * Math.PI / puntas, rr = i % 2 ? r * rel : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath();
  }
  function impacto(g, t, t0, x, y, tam, dur = 0.28) {
    const k = fase(t, t0, t0 + dur); if (k <= 0 || k >= 1) return;
    g.save(); g.globalAlpha = 1 - k;
    estrellaPuntas(g, x, y, tam * (0.6 + 0.8 * salida(k)), 10, 0.3, 0.42); g.fillStyle = "#ffe14d"; g.fill(); g.lineWidth = 2.5; g.strokeStyle = "#0b0a0e"; g.stroke();
    estrellaPuntas(g, x, y, tam * (0.35 + 0.5 * salida(k)), 10, 0.55, 0.5); g.fillStyle = "#ffffff"; g.fill();
    g.strokeStyle = "#ffffff"; g.lineWidth = 3; g.lineCap = "round";
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + 0.2, r0 = tam * (0.9 + 0.9 * k), r1 = r0 + tam * 0.45; g.beginPath(); g.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0); g.lineTo(x + Math.cos(a) * r1, y + Math.sin(a) * r1); g.stroke(); }
    g.restore();
  }
  // «zas» del dardo en la diana: rayitas alrededor del punto
  function golpecito(g, t, t0, x, y) {
    const k = fase(t, t0, t0 + 0.22); if (k <= 0 || k >= 1) return;
    g.save(); g.strokeStyle = `rgba(255,250,220,${1 - k})`; g.lineWidth = 2.2; g.lineCap = "round";
    for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + 0.5, r0 = 9 + 12 * k; g.beginPath(); g.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0); g.lineTo(x + Math.cos(a) * (r0 + 8), y + Math.sin(a) * (r0 + 8)); g.stroke(); }
    g.restore();
  }
  // estela del dardo de Guillermo y del de Laura en vuelo
  function estela(g, f, t, t0, t1, col) {
    if (t <= t0 || t >= t1) return;
    g.save(); g.lineCap = "round";
    for (let i = 1; i <= 4; i++) {
      const q = f(Math.max(t0, t - i * 0.022)); g.strokeStyle = col; g.globalAlpha = 0.28 * (1 - i / 5);
      g.lineWidth = 5 - i; g.beginPath(); g.moveTo(q.x, q.y); const r = f(Math.max(t0, t - (i - 1) * 0.022)); g.lineTo(r.x, r.y); g.stroke();
    }
    g.restore();
  }
  // líneas de «boing» alrededor del dardo clavado en el pelo
  function boing(g, t, d) {
    const k = fase(t, T.pelo, T.pelo + 1.1); if (k <= 0 || k >= 1) return;
    const o = dirA(d.a), n = { x: -o.y, y: o.x }, cx = d.x - o.x * 30, cy = d.y - o.y * 30;
    g.save(); g.strokeStyle = `rgba(255,255,255,${0.9 * (1 - k)})`; g.lineWidth = 2.2; g.lineCap = "round";
    for (const s of [-1, 1]) { g.beginPath(); g.moveTo(cx + n.x * 16 * s, cy + n.y * 16 * s); g.quadraticCurveTo(cx + n.x * 24 * s - o.x * 8, cy + n.y * 24 * s - o.y * 8, cx + n.x * 18 * s - o.x * 18, cy + n.y * 18 * s - o.y * 18); g.stroke(); }
    g.restore();
  }
  // rayitas de las manos al sacudirlas
  function rayasSacude(g, t, pG) {
    const k = sacudida(t); if (k <= 0.02) return;
    g.save(); g.strokeStyle = `rgba(255,255,255,${0.75 * k})`; g.lineWidth = 2; g.lineCap = "round";
    for (const m of [pG.manoCerca, pG.manoLejos]) {
      const q = G.aPantalla(pG, m);
      for (const s0 of [-1, 1]) { const ph = Math.sin(t * 38 + s0); g.beginPath(); g.moveTo(q.x + s0 * 12, q.y - 8 + 3 * ph); g.quadraticCurveTo(q.x + s0 * 17, q.y, q.x + s0 * 12, q.y + 8 - 3 * ph); g.stroke(); }
    }
    g.restore();
  }
  // soplido al dardo: dos nubecillas de vaho que salen de la boca
  function vaho(g, t, pG) {
    const k = fase(t, T.sopla, T.sopla + 0.45); if (k <= 0 || k >= 1) return;
    const b = G.aPantalla(pG, G.boca(pG));
    g.save();
    for (let i = 0; i < 3; i++) { const u = clamp(k * 1.4 - i * 0.18); if (u <= 0 || u >= 1) continue;
      g.globalAlpha = 0.55 * Math.sin(Math.PI * u); g.fillStyle = "#eef6ff";
      g.beginPath(); g.arc(b.x + 8 + 26 * u, b.y + 6 + 14 * u, 3 + 6 * u, 0, Math.PI * 2); g.fill(); }
    g.restore();
  }
  // brisa alrededor del dedo levantado (comprueba el viento)
  function brisa(g, t, pG) {
    const k = tramo(t, T.viento + 0.15, T.viento + 0.3) * (1 - tramo(t, T.viento + 0.42, T.mide)); if (k <= 0.01) return;
    const q = G.aPantalla(pG, pG.manoLejos);
    g.save(); g.strokeStyle = `rgba(220,240,255,${0.7 * k})`; g.lineWidth = 1.8; g.lineCap = "round";
    for (let i = 0; i < 2; i++) { const ph = ((t - T.viento) * 1.8 + i * 0.5) % 1, x = q.x - 30 + 60 * ph, y = q.y - 26 + i * 9;
      g.beginPath(); g.moveTo(x - 12, y); g.quadraticCurveTo(x, y - 5, x + 10, y); g.arc(x + 10, y - 4, 4, Math.PI / 2, -Math.PI, true); g.stroke(); }
    g.restore();
  }
  // gotitas de risa
  function lagrimas(g, t, pL) {
    const k = tramo(t, T.risa + 0.3, T.risa + 0.6) * (1 - tramo(t, T.fin - 0.2, T.fin + 0.3)); if (k <= 0.01) return;
    const H = L.cabeza(pL);
    g.save();
    for (let i = 0; i < 2; i++) {
      const ph = ((t - T.risa) * 1.6 + i * 0.5) % 1, base = L.aPantalla(pL, H.a({ x: 760 + 170 * i, y: 470 + 30 * i }));
      const x = base.x + (i ? 8 : -8) * ph * 3, y = base.y - 4 + 26 * ph * ph;
      g.globalAlpha = k * Math.sin(Math.PI * ph);
      g.fillStyle = "#bfe8ff"; g.strokeStyle = "#1d3b52"; g.lineWidth = 1.5;
      g.beginPath(); g.moveTo(x, y - 6); g.quadraticCurveTo(x + 4, y, x, y + 4); g.quadraticCurveTo(x - 4, y, x, y - 6); g.fill(); g.stroke();
    }
    g.restore();
  }

  /* ================= escena ================= */
  const pose = t => ({ g: poseG(t), l: poseL(t) });
  function camara(t) {
    const clonc = t >= T.lampara ? Math.exp(-(t - T.lampara) * 7) * suave(fase(t, T.lampara, T.lampara + 0.03)) : 0;
    const pin = t >= T.pelo ? Math.exp(-(t - T.pelo) * 7) * suave(fase(t, T.pelo, T.pelo + 0.03)) : 0;
    return { tb: 3.2 * clonc + 4 * pin };
  }

  class GuillermoLauraDardos extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !L.listo()) return;
      if (!fondo) { fondo = creaFondo(); diana = creaDiana(); }
      const pG = poseG(t), pL = poseL(t);
      const luz = tramo(t, NEGRO_INICIO, 0.85, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t);
      g.save();
      if (cam.tb > 0.05) g.translate(ruido(t * 45) * cam.tb, ruido(t * 45 + 13) * cam.tb * 0.7);
      g.drawImage(fondo, -40, -60);
      luzLampara(g, t);
      // diana (gira un poco al temblar) y dardos clavados en ella
      const gd = giroDiana(t);
      g.save(); g.translate(DIANA.x, DIANA.y); g.rotate(gd); g.drawImage(diana, -diana.width / 2, -diana.height / 2); g.restore();
      // sombras en el suelo
      g.save(); g.fillStyle = "rgba(0,0,0,0.38)";
      g.beginPath(); g.ellipse(pG.x + 4, SUELO + 2, 92, 8, 0, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.ellipse(pL.x + 8, SUELO + 2, 96, 8, 0, 0, Math.PI * 2); g.fill(); g.restore();
      lampara(g, t);
      L.dibujar(g, pL, t);
      G.dibujar(g, pG, t);
      // dardos de Laura
      for (let i = 0; i < 3; i++) {
        const d = dardoLaura(i, t);
        if (!d.clavado) estela(g, tt => dardoLaura(i, tt), t, T.sueltaL[i] + 0.02, T.clava[i], "#ffd6e2");
        dardo(g, d.x, d.y, d.a, ESC_D, COL_L);
        golpecito(g, t, T.clava[i], d.x, d.y);
      }
      // dardo de Guillermo
      if (t > T.saca - 0.08) {
        const d = dardoG(t);
        if (d.largo > 0.01) {
          if (!d.clavado && t > T.suelta) estela(g, dardoG, t, T.suelta + 0.02, T.pelo, "#cfe6ff");
          g.save(); g.globalAlpha = clamp(d.largo * 3); dardo(g, d.x, d.y, d.a, ESC_G, COL_G, 0.35 + 0.65 * d.largo); g.restore();
          if (d.clavado) boing(g, t, d);
        }
      }
      const Q = cache("GQ", () => enLampara(T.lampara, IMPACTO_LAMP));
      impacto(g, t, T.lampara, Q.x, Q.y, 26);
      if (t > T.pelo) { const P = dardoG(t); impacto(g, t, T.pelo, P.x, P.y, 18, 0.22); }
      lagrimas(g, t, pL);
      rayasSacude(g, t, pG); vaho(g, t, pG); brisa(g, t, pG);
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00017", nombre: "Guillermo y Laura · Los dardos", crear: () => new GuillermoLauraDardos() });
  window.__A2D_00017 = { pose, poseG, poseL, T, DUR, dardoG, dardoLaura };
})();
