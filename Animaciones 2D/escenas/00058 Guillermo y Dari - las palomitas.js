"use strict";
/* 00058 · Guillermo y Dari · Las palomitas
 *
 * Negro → sala de cine a oscuras: butacas de terciopelo granate, filas que suben hacia el fondo, la
 * ventanita del proyector y su haz de luz con polvo por encima de las cabezas. La pantalla queda fuera
 * de cuadro, a la derecha: su luz azulada parpadea suave sobre las caras. Entre los dos, en el reposabrazos,
 * un cubo enorme de palomitas → Dari come de una en una, con dos dedos, tranquilísimo; Guillermo mete la
 * mano entera y se embute un puñado (mofletes llenos) → la peli se pone oscura y roja; Guillermo vuelve a
 * meter la mano, muy despacio, sin quitar ojo → SUSTO: un fogonazo que crece en varios fotogramas; Guillermo
 * pega un bote en la butaca, arranca la mano del cubo (que da un brinco) y las palomitas salen disparadas →
 * llueven: a Guillermo le quedan unas cuantas en el pelo, a Dari dos en los rizos, otras caen en las butacas
 * de delante y otras vuelven al cubo; Dari ni pestañea: abre la boca y una le cae dentro → Guillermo, agarrado
 * a los reposabrazos, tiembla y suda; Dari le ofrece una palomita y Guillermo dice que no con la cabeza; Dari
 * se la come él → la peli se vuelve a poner oscura → SEGUNDO SUSTO: Guillermo sale disparado de la butaca y
 * se tira de cabeza a la capucha de la parka de Dari, que sube a recibirle y se hincha; solo le asoman las
 * piernas, pataleando → Dari sigue con sus palomitas, una a una, con la pantalla reflejada en las gafas; otro
 * destello y las piernas se agitan otra vez; Dari mira a cámara, levanta una ceja y sigue masticando → negro.
 *
 * Sin textos. Todo depende del tiempo absoluto `t`.
 */
(() => {
  const { clamp, lerp, fase, suave, salida, entrada, tramo, campana, ruido, hash } = M2;
  const G = Guillermo, Da = Dari;
  const S = 0.3, SUELO = 575;
  const XG = 395, XD = 640;                     // pelvis de Guillermo y de Dari (los dos miran a la derecha, a la pantalla)
  const DY_G = 250, DY_D = 268;                 // cuánto baja la pelvis al sentarse (hoja)
  const DUR = 14.25;
  const T = {
    dCome: [0.7, 2.4, 5.45, 8.95, 10.75],       // Dari coge una palomita (la mano llega a la boca 0,85 s después)
    ofrece: 5.95, niega: 6.15, niega1: 6.7, retira: 6.78,      // la tercera se la ofrece a Guillermo, que dice que no
    gMete: 1.0, gCoge: 1.28, gBoca: 1.58, gEmbute: 1.74, gSale: 1.9, gVuelve: 2.3,
    tension: 2.5, gRoba: 2.7, gDentro: 3.15,
    s1: 3.6, cima: 3.82, cae: 3.98, asienta: 4.2, agarra: 4.32,
    atrapa: 4.62,
    tension2: 7.05, s2: 7.75, b1: 8.25,
    tension3: 9.9, s3: 10.35,
    camara: 12.2, camara1: 12.85,
    fin: 13.35
  };

  /* ---------- utilidades ---------- */
  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n], k); return o; };
  function linea(guion, estados, ini, t) {
    let c = estados[ini];
    for (const [t0, t1, nom, f] of guion) { if (t <= t0) break; c = mezclaE(c, estados[nom], (f || suave)(fase(t, t0, t1))); }
    return Object.assign({}, c);
  }
  const D = (pu, ix, md, re) => ({ pulgar: pu, indice: ix, medio: md, anular: re, menique: re });
  const DD = (a, b, k) => ({ pulgar: lerp(a.pulgar, b.pulgar, k), indice: lerp(a.indice, b.indice, k), medio: lerp(a.medio, b.medio, k),
    anular: lerp(a.anular, b.anular, k), menique: lerp(a.menique, b.menique, k) });
  const parpadeo = (t, lista, d = 0.14) => { let o = 0; for (const tb of lista) { const k = fase(t, tb, tb + d); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); } return o; };
  const memo = new Map();
  const cache = (k, f) => { if (!memo.has(k)) memo.set(k, f()); return memo.get(k); };
  const rota = (q, a) => { const c = Math.cos(a), s = Math.sin(a); return { x: q.x * c - q.y * s, y: q.x * s + q.y * c }; };
  const rgb = (c, a = 1) => `rgba(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])},${a})`;
  const TINTA = "#0b0a0e";
  let MATRIZ = null;

  // Pistas de una mano: [t0, t1, objetivo, curva]; el objetivo se resuelve a la hoja del personaje en cada fotograma.
  function pista(lista, t, resuelve) {
    let c = resuelve(lista[0][2]);
    for (let i = 1; i < lista.length; i++) {
      const [t0, t1, obj, f] = lista[i];
      if (t <= t0) break;
      const k = (f || suave)(fase(t, t0, t1)), d = resuelve(obj);
      c = { x: lerp(c.x, d.x, k), y: lerp(c.y, d.y, k), mu: lerp(c.mu, d.mu, k), ang: lerp(c.ang, d.ang, k), puno: lerp(c.puno, d.puno, k),
        dedos: DD(c.dedos, d.dedos, k) };
    }
    return c;
  }

  /* ---------- caras ---------- */
  const BASE = { mx: 0.85, my: -0.1, c: 0, wd: 0, wi: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, orig: 0, abre: 0, ancho: 1, sonr: 0.2,
    dientes: 1, lengua: 0, mof: 0, rub: 0, esp: 0 };
  const E = o => Object.assign({}, BASE, o);
  function cara(e, extraC) {
    const c = clamp(e.c + extraC);
    return { mirada: { x: e.mx, y: e.my }, iris: e.iris, espiral: e.esp, ojos: { d: clamp(c + e.wd), i: clamp(c + e.wi), feliz: e.h, apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: e.orig, abre: e.abre, ancho: e.ancho, sonrisa: e.sonr, dientes: e.dientes > 0.5, lengua: e.lengua },
      mofletes: e.mof, rubor: e.rub, bigote: 0 };
  }

  /* ================= luz de la pantalla ================= */
  const C_CALMA = [190, 212, 255], C_MIEDO = [215, 120, 138], C_FLASH = [255, 252, 244];
  // fogonazos (0–1): suben en varios fotogramas y se apagan despacio
  const FOGON = [[T.s1, 1], [T.s2, 1], [T.s3, 0.6]];
  function fogonazo(t) {
    let o = 0;
    for (const [t0, a] of FOGON) {
      if (t < t0) continue;
      const sube = 0.17, baja = 0.9;
      const k = t < t0 + sube ? suave((t - t0) / sube) : Math.pow(1 - clamp((t - t0 - sube) / baja), 2);
      o = Math.max(o, a * k);
    }
    return o;
  }
  // tensión (0–1): la peli se pone oscura y roja antes de cada susto
  const miedo = t => Math.max(
    tramo(t, T.tension, T.s1 - 0.05) * (1 - tramo(t, T.s1, T.s1 + 0.6)),
    tramo(t, T.tension2, T.s2 - 0.05) * (1 - tramo(t, T.s2, T.s2 + 0.6)),
    0.6 * tramo(t, T.tension3, T.s3 - 0.05) * (1 - tramo(t, T.s3, T.s3 + 0.5)));
  function luzPantalla(t) {
    const f = fogonazo(t), m = miedo(t);
    const parp = 0.86 + 0.07 * ruido(t * 1.6 + 3) + 0.05 * ruido(t * 4.1 + 11) + 0.025 * ruido(t * 8.7 + 2);
    const b = lerp(lerp(parp, 0.7 + 0.04 * ruido(t * 2.6 + 5), m), 1, f);
    const col = [0, 1, 2].map(i => lerp(lerp(C_CALMA[i], C_MIEDO[i], m), C_FLASH[i], f));
    return { f, m, b, col };
  }
  const FOCO = { x: 1320, y: 210 };              // la pantalla, fuera de cuadro
  // la sala a oscuras (multiplica) y la luz de la pantalla que llega desde la derecha
  function iluminar(g, L) {
    g.save();
    g.globalCompositeOperation = "multiply";
    const gr = g.createRadialGradient(FOCO.x, FOCO.y, 260, FOCO.x, FOCO.y, 1250);
    const cerca = L.col.map(c => clamp(c * L.b, 0, 255));
    const medio = L.col.map(c => clamp(c * L.b * lerp(0.86, 1, L.f), 0, 255));
    const lejos = L.col.map((c, i) => clamp(c * L.b * lerp(0.5, 0.9, L.f) + [4, 4, 14][i], 0, 255));
    gr.addColorStop(0, rgb(cerca)); gr.addColorStop(0.5, rgb(medio)); gr.addColorStop(1, rgb(lejos));
    g.fillStyle = gr; g.fillRect(-40, -60, W + 80, H + 120);
    if (L.f > 0.004) {
      g.globalCompositeOperation = "lighter";
      const v = g.createRadialGradient(FOCO.x, FOCO.y, 200, FOCO.x, FOCO.y, 1300);
      v.addColorStop(0, `rgba(255,250,236,${0.5 * L.f})`); v.addColorStop(1, `rgba(255,250,236,${0.12 * L.f})`);
      g.fillStyle = v; g.fillRect(-40, -60, W + 80, H + 120);
    }
    g.restore();
  }

  /* ================= palomitas (sprites hechos una vez) ================= */
  const PS = 4, PW = 14;                         // sprite a 4×, 14 px de lado
  let PALOM = null;
  function creaPalomita(sem) {
    const c = document.createElement("canvas"); c.width = c.height = PW * PS; const g = c.getContext("2d");
    g.scale(PS, PS); g.translate(PW / 2, PW / 2);
    const n = 4 + Math.floor(hash(sem) * 2), bul = [];
    for (let i = 0; i < n; i++) { const a = i * Math.PI * 2 / n + 0.6 * (hash(sem + i * 3) - 0.5), d = 1.5 + 0.9 * hash(sem + i * 5);
      bul.push({ x: Math.cos(a) * d, y: Math.sin(a) * d * 0.9, r: 1.9 + 0.7 * hash(sem + i * 7) }); }
    bul.push({ x: 0, y: 0, r: 2.2 });
    g.fillStyle = TINTA; for (const b of bul) { g.beginPath(); g.arc(b.x, b.y, b.r + 0.55, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = "#fff3d6"; for (const b of bul) { g.beginPath(); g.arc(b.x, b.y, b.r, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = "rgba(214,170,100,0.45)"; for (const b of bul) { g.beginPath(); g.arc(b.x + b.r * 0.35, b.y + b.r * 0.35, b.r * 0.55, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = "rgba(255,255,255,0.9)"; g.beginPath(); g.arc(bul[0].x - 0.6, bul[0].y - 0.7, 0.7, 0, Math.PI * 2); g.fill();
    // cascarilla dorada
    g.fillStyle = "#d99a32"; g.beginPath(); g.ellipse(0.4, 1.4, 1.1, 0.7, 0.4, 0, Math.PI * 2); g.fill();
    return c;
  }
  // una palomita centrada en (x, y); esc = 1 → unos 9 px
  function palomita(g, x, y, rot, esc, v) {
    if (!PALOM) PALOM = [0, 1, 2, 3, 4].map(i => creaPalomita(11 + i * 17));
    const im = PALOM[((v % 5) + 5) % 5];
    g.save(); g.translate(x, y); if (rot) g.rotate(rot); const k = esc * 0.72 / PS; g.scale(k, k);
    g.drawImage(im, -PW * PS / 2, -PW * PS / 2); g.restore();
  }

  /* ================= el cubo ================= */
  const CUBO = { x: 522, y: 458, h: 80, wa: 34, wb: 24, ry: 8 };      // base, alto, medio ancho arriba/abajo, elipse del borde
  // el cubo pega un brinco cuando Guillermo saca la mano de golpe
  function estadoCubo(t) {
    const k = fase(t, T.s1 + 0.03, T.s1 + 0.4);
    let dy = 0, rot = 0;
    if (k > 0 && k < 1) { dy = -18 * Math.sin(Math.PI * Math.min(1, k / 0.55)) * (k < 0.55 ? 1 : 0) - (k >= 0.55 ? 5 * Math.sin(Math.PI * (k - 0.55) / 0.45) : 0);
      rot = 0.16 * Math.sin(Math.PI * Math.min(1, k / 0.55)) * (k < 0.55 ? 1 : 0) - (k >= 0.55 ? 0.05 * Math.sin(Math.PI * (k - 0.55) / 0.45) : 0); }
    return { x: CUBO.x, y: CUBO.y + dy, rot };
  }
  // borde del cubo (centro de la boca) en pantalla
  const bocaCubo = t => { const c = estadoCubo(t), a = rota({ x: 0, y: -CUBO.h }, c.rot); return { x: c.x + a.x, y: c.y + a.y, rot: c.rot }; };
  // nivel del montón: baja de golpe con la erupción y sube un poco con las que vuelven
  let VUELTA = [0, 1];
  const nivel = t => 1 - 0.55 * tramo(t, T.s1 + 0.02, T.s1 + 0.12) + 0.22 * tramo(t, VUELTA[0], VUELTA[1]);
  let MONTON = null;
  function creaMonton() {
    const w = CUBO.wa * 2 + 8, h = 30, c = document.createElement("canvas"); c.width = w * 3; c.height = h * 3; const g = c.getContext("2d");
    g.scale(3, 3); g.translate(w / 2, h - 6);
    const pts = [];
    for (let i = 0; i < 46; i++) { const u = hash(i + 700) * 2 - 1, alto = 15 * Math.sqrt(1 - u * u) * (0.55 + 0.45 * hash(i + 701));
      pts.push({ x: u * (CUBO.wa - 2), y: -alto + 3 * hash(i + 702), r: hash(i + 703) * 6, v: i }); }
    pts.sort((a, b) => a.y - b.y);
    // base cremosa para que no se vea el fondo entre palomitas
    g.fillStyle = "#e9d3a4"; g.beginPath(); g.ellipse(0, 0, CUBO.wa - 1, 9, 0, Math.PI, 0); g.lineTo(CUBO.wa - 1, 4); g.lineTo(-CUBO.wa + 1, 4); g.closePath(); g.fill();
    for (const q of pts) palomita(g, q.x, q.y, q.r, 1, q.v);
    return { c, w, h };
  }
  // fondo del cubo por dentro (antes del montón)
  function cuboDentro(g, t) {
    const b = bocaCubo(t);
    g.save(); g.translate(b.x, b.y); g.rotate(b.rot);
    g.fillStyle = "#3a0d10"; g.beginPath(); g.ellipse(0, 0, CUBO.wa, CUBO.ry, 0, 0, Math.PI * 2); g.fill();
    g.restore();
  }
  function cuboMonton(g, t) {
    if (!MONTON) MONTON = creaMonton();
    const b = bocaCubo(t), n = nivel(t);
    g.save(); g.translate(b.x, b.y); g.rotate(b.rot);
    g.beginPath(); g.rect(-CUBO.wa - 6, -40, CUBO.wa * 2 + 12, 40 + CUBO.ry * 0.2); g.ellipse(0, 0, CUBO.wa, CUBO.ry, 0, 0, Math.PI); g.clip();
    const dy = (1 - n) * 17;
    g.drawImage(MONTON.c, -MONTON.w / 2, -(MONTON.h - 6) + dy, MONTON.w, MONTON.h);
    g.restore();
  }
  function cuboFuera(g, t) {
    const c = estadoCubo(t), { h, wa, wb, ry } = CUBO;
    g.save(); g.translate(c.x, c.y); g.rotate(c.rot); g.lineJoin = "round";
    const cuerpo = () => { g.beginPath(); g.moveTo(-wa, -h); g.lineTo(-wb, 0); g.ellipse(0, 0, wb, ry * 0.7, 0, Math.PI, 0, true); g.lineTo(wa, -h); g.ellipse(0, -h, wa, ry, 0, 0, Math.PI); g.closePath(); };
    cuerpo(); g.fillStyle = "#f6efe4"; g.fill();
    g.save(); cuerpo(); g.clip();
    // rayas rojas que se abren hacia arriba
    g.fillStyle = "#c8202a";
    for (let i = -3; i <= 3; i += 2) { const a0 = (i - 0.5) / 7, a1 = (i + 0.5) / 7;
      g.beginPath(); g.moveTo(a0 * 2 * wb, 4); g.lineTo(a0 * 2 * wa, -h - 10); g.lineTo(a1 * 2 * wa, -h - 10); g.lineTo(a1 * 2 * wb, 4); g.closePath(); g.fill(); }
    // volumen: sombra a la izquierda, brillo a la derecha (la pantalla)
    const vol = g.createLinearGradient(-wa, 0, wa, 0);
    vol.addColorStop(0, "rgba(40,0,10,0.5)"); vol.addColorStop(0.45, "rgba(0,0,0,0)"); vol.addColorStop(0.8, "rgba(255,255,255,0.18)"); vol.addColorStop(1, "rgba(0,0,0,0.15)");
    g.fillStyle = vol; g.fillRect(-wa - 4, -h - 12, wa * 2 + 8, h + 20);
    // ribete de arriba
    g.fillStyle = "#c8202a"; g.fillRect(-wa - 4, -h - 2, wa * 2 + 8, 9);
    g.fillStyle = "rgba(255,255,255,0.25)"; g.fillRect(-wa - 4, -h + 1, wa * 2 + 8, 1.5);
    // estrellitas blancas en el ribete
    g.fillStyle = "#f6efe4";
    for (let i = -2; i <= 2; i++) { const x = i * wa * 0.38, y = -h + 3.5; g.beginPath(); for (let k = 0; k < 10; k++) { const r = k % 2 ? 1.1 : 2.6, a = k * Math.PI / 5 - Math.PI / 2; g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } g.closePath(); g.fill(); }
    g.restore();
    cuerpo(); g.strokeStyle = TINTA; g.lineWidth = 2.2; g.stroke();
    g.beginPath(); g.ellipse(0, -h, wa, ry, 0, 0, Math.PI); g.lineWidth = 2; g.stroke();
    g.restore();
  }

  /* ================= la sala (fondo hecho una vez) ================= */
  let fondo = null, fila = null;
  const PROY = { x: 118, y: 74 };
  const ASIENTO = { G: XG - 12, D: XD - 12, alto: 318, ancho: 168 };      // respaldos de las butacas de los dos
  function respaldo(g, cx, top, w, bot, k = 1) {
    g.save(); g.lineJoin = "round";
    const r = 22 * k;
    const forma = () => { g.beginPath(); g.moveTo(cx - w / 2, bot); g.lineTo(cx - w / 2, top + r); g.quadraticCurveTo(cx - w / 2, top, cx - w / 2 + r, top - 2 * k);
      g.quadraticCurveTo(cx, top - 9 * k, cx + w / 2 - r, top - 2 * k); g.quadraticCurveTo(cx + w / 2, top, cx + w / 2, top + r); g.lineTo(cx + w / 2, bot); g.closePath(); };
    forma(); const v = g.createLinearGradient(cx - w / 2, 0, cx + w / 2, 0);
    v.addColorStop(0, "#4a0d16"); v.addColorStop(0.55, "#7a1624"); v.addColorStop(1, "#962033");
    g.fillStyle = v; g.fill();
    g.save(); forma(); g.clip();
    // canales del tapizado
    g.strokeStyle = "rgba(20,0,6,0.45)"; g.lineWidth = 2.2 * k;
    for (let i = 1; i < 4; i++) { const x = cx - w / 2 + w * i / 4; g.beginPath(); g.moveTo(x, top + 8 * k); g.lineTo(x, bot); g.stroke(); }
    g.strokeStyle = "rgba(255,170,180,0.16)"; g.lineWidth = 1.4 * k;
    for (let i = 1; i < 4; i++) { const x = cx - w / 2 + w * i / 4 + 3 * k; g.beginPath(); g.moveTo(x, top + 10 * k); g.lineTo(x, bot); g.stroke(); }
    g.fillStyle = "rgba(255,190,200,0.2)"; g.fillRect(cx - w / 2, top - 10 * k, w, 7 * k);
    g.restore();
    forma(); g.strokeStyle = TINTA; g.lineWidth = 3 * k; g.stroke();
    g.restore();
  }
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W + 80; c.height = H + 120;
    const g = c.getContext("2d"); g.translate(40, 60);
    // pared del fondo: azul noche con paneles acústicos
    const p = g.createLinearGradient(0, -60, 0, 360); p.addColorStop(0, "#211d3a"); p.addColorStop(1, "#141126");
    g.fillStyle = p; g.fillRect(-40, -60, W + 80, H + 120);
    for (let x = -40; x < W + 40; x += 46) {
      const q = g.createLinearGradient(x, 0, x + 46, 0); q.addColorStop(0, "rgba(255,255,255,0.05)"); q.addColorStop(0.5, "rgba(255,255,255,0)"); q.addColorStop(1, "rgba(0,0,0,0.18)");
      g.fillStyle = q; g.fillRect(x, -60, 46, 300);
    }
    g.fillStyle = "#14112a"; g.fillRect(-40, 230, W + 80, 10);
    // ventanita del proyector
    g.fillStyle = "#0c0a18"; g.fillRect(PROY.x - 34, PROY.y - 24, 68, 48);
    const vp = g.createRadialGradient(PROY.x, PROY.y, 2, PROY.x, PROY.y, 30); vp.addColorStop(0, "#ffffff"); vp.addColorStop(0.4, "#cfe0ff"); vp.addColorStop(1, "#4a5a8a");
    g.fillStyle = vp; g.fillRect(PROY.x - 26, PROY.y - 17, 52, 34);
    g.strokeStyle = "#5a5470"; g.lineWidth = 4; g.strokeRect(PROY.x - 28, PROY.y - 19, 56, 38);
    // apliques de pared apagados
    for (const x of [380, 760]) { g.fillStyle = "rgba(255,190,120,0.16)"; g.beginPath(); g.arc(x, 150, 34, 0, Math.PI * 2); g.fill();
      g.fillStyle = "#8a6a4a"; g.beginPath(); g.moveTo(x - 10, 160); g.lineTo(x + 10, 160); g.lineTo(x + 6, 138); g.lineTo(x - 6, 138); g.closePath(); g.fill(); }
    // gradas: filas de butacas vacías que suben hacia el fondo
    for (let f = 3; f >= 1; f--) {
      const k = Math.pow(0.8, f), top = 330 - f * 52, bot = top + 120 * k, w = 150 * k;
      g.fillStyle = "#100d20"; g.fillRect(-40, bot - 6, W + 80, 60);
      g.fillStyle = "rgba(255,200,120,0.6)";
      for (let x = 40 + f * 30; x < W; x += 260) { g.beginPath(); g.arc(x, bot - 2, 2.2, 0, Math.PI * 2); g.fill(); }
      g.save(); g.globalAlpha = 0.3 + 0.12 * (3 - f);
      for (let x = -60 + f * 37; x < W + 60; x += w + 10 * k) respaldo(g, x, top, w, bot, k);
      g.restore();
    }
    // las dos butacas de ellos
    for (const cx of [ASIENTO.G, ASIENTO.D]) respaldo(g, cx, ASIENTO.alto, ASIENTO.ancho, 520, 1);
    // asientos (cojines) y reposabrazos
    for (const cx of [ASIENTO.G, ASIENTO.D]) {
      g.fillStyle = "#5a1019"; g.beginPath(); g.ellipse(cx + 20, 478, 92, 20, 0, 0, Math.PI * 2); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 2.5; g.stroke();
    }
    for (const x of [ASIENTO.G - 96, (ASIENTO.G + ASIENTO.D) / 2 + 2, ASIENTO.D + 96]) {
      g.fillStyle = "#24161c"; g.fillRect(x - 9, 452, 18, 70); g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(x - 9, 452, 18, 70);
      g.fillStyle = "#3a2630"; g.beginPath(); g.ellipse(x + 8, 452, 30, 9, 0, 0, Math.PI * 2); g.fill(); g.stroke();
      g.fillStyle = "rgba(255,200,210,0.18)"; g.beginPath(); g.ellipse(x + 12, 449, 20, 3.5, 0, 0, Math.PI * 2); g.fill();
    }
    // portavasos del cubo
    g.fillStyle = "#120a0e"; g.beginPath(); g.ellipse(CUBO.x, CUBO.y, CUBO.wb + 6, 7, 0, 0, Math.PI * 2); g.fill();
    // viñeta
    const vi = g.createRadialGradient(560, 300, 260, 560, 300, 720); vi.addColorStop(0, "rgba(0,0,0,0)"); vi.addColorStop(1, "rgba(4,2,12,0.55)");
    g.fillStyle = vi; g.fillRect(-40, -60, W + 80, H + 120);
    return c;
  }
  // la fila de delante: respaldos que tapan las piernas
  const FILA_Y = 486;
  const filaTop = x => FILA_Y + 0;        // borde de arriba (para las palomitas que caen encima)
  const FILA_X = [];
  for (let x = 118; x < W + 120; x += 196) FILA_X.push(x);
  function creaFila() {
    const c = document.createElement("canvas"); c.width = W + 80; c.height = H + 120;
    const g = c.getContext("2d"); g.translate(40, 60);
    for (const x of FILA_X) respaldo(g, x, FILA_Y, 186, H + 60, 1.25);
    return c;
  }
  // alto del borde de la fila de delante en x (el respaldo es abombado)
  function bordeFila(x) {
    let best = FILA_X[0]; for (const fx of FILA_X) if (Math.abs(fx - x) < Math.abs(best - x)) best = fx;
    const u = (x - best) / 93; return FILA_Y - 9 * 1.25 * 0.5 * (1 - u * u) - 1.5 * 1.25;
  }

  /* ================= Guillermo ================= */
  const CG = {
    mira: E({ mx: 0.85, my: -0.25, sonr: 0.22, ancho: 0.9 }),
    goloso: E({ mx: 0.85, my: -0.2, sonr: 0.45, ancho: 0.9, sd: 6, si: 2 }),
    bocaza: E({ mx: 0.85, my: -0.15, abre: 44, ancho: 0.9, sonr: 0.1, sd: 10, si: 10, lengua: 0.4 }),
    lleno: E({ mx: 0.85, my: -0.25, mof: 1, sonr: 0.05, ancho: 0.62, sd: 4, si: 4 }),
    tenso: E({ mx: 0.9, my: -0.22, iris: 0.78, sd: 20, si: 20, gd: 0.08, gi: 0.08, abre: 6, ancho: 0.42, sonr: -0.35, mof: 0.4 }),
    grito: E({ mx: 0.9, my: -0.3, iris: 0.55, sd: 34, si: 34, gd: 0.12, gi: 0.12, abre: 56, ancho: 0.85, sonr: -0.35, lengua: 0.7 }),
    pasmo: E({ mx: 0.85, my: -0.2, iris: 0.62, sd: 26, si: 26, abre: 18, ancho: 0.55, sonr: -0.3 }),
    tiembla: E({ mx: 0.88, my: -0.22, iris: 0.72, sd: 18, si: 22, gd: 0.1, gi: 0.14, abre: 8, ancho: 0.7, sonr: -0.45 }),
    aterrado: E({ mx: 0.92, my: -0.3, iris: 0.6, sd: 30, si: 30, abre: 30, ancho: 0.7, sonr: -0.4 }),
    niega: E({ mx: 0.95, my: 0.35, iris: 0.74, sd: 12, si: 24, gd: -0.06, gi: 0.14, abre: 5, ancho: 0.55, sonr: -0.5 })
  };
  const GUION_CG = [
    [T.gMete - 0.1, T.gMete + 0.15, "goloso"], [T.gBoca - 0.06, T.gBoca + 0.06, "bocaza"], [T.gEmbute, T.gEmbute + 0.1, "lleno"],
    [T.tension + 0.2, T.tension + 0.8, "tenso"], [T.s1, T.s1 + 0.07, "grito"], [T.asienta, T.asienta + 0.3, "pasmo"],
    [T.agarra + 0.4, T.agarra + 0.9, "tiembla"], [T.ofrece - 0.3, T.ofrece, "niega"], [T.niega1, T.niega1 + 0.3, "tiembla"],
    [T.tension2 + 0.2, T.tension2 + 0.8, "tenso"], [T.s2, T.s2 + 0.07, "aterrado"]
  ];
  const PARP_G = [0.45, 2.55, 5.3, 6.95, 7.45];
  const P0G = { dx: 0, pel: 0, torso: -0.04, cab: 0.02 };
  const CuG = o => Object.assign({}, P0G, o);
  const CUER_G = {
    sentado: CuG({}),
    come: CuG({ torso: 0.03, cab: 0.03, dx: 2 }),
    traga: CuG({ torso: -0.06, cab: -0.05 }),
    tenso: CuG({ torso: 0.08, cab: 0.07, pel: 8, dx: 3 }),
    bote: CuG({ torso: -0.14, cab: -0.16, pel: -150, dx: -4 }),
    cae: CuG({ torso: 0.03, cab: 0.05, pel: 12 }),
    encogido: CuG({ torso: 0.06, cab: 0.08, pel: 10, dx: 2 }),
    tenso2: CuG({ torso: 0.1, cab: 0.09, pel: 14, dx: 3 })
  };
  const GUION_G = [
    [T.gMete - 0.05, T.gCoge, "come"], [T.gEmbute, T.gEmbute + 0.3, "traga"], [T.gVuelve, T.gVuelve + 0.4, "sentado"],
    [T.tension + 0.2, T.gDentro, "tenso"], [T.s1 + 0.01, T.cima, "bote", salida], [T.cima + 0.05, T.asienta, "cae", entrada],
    [T.asienta + 0.05, T.asienta + 0.4, "encogido"], [T.tension2 + 0.1, T.s2, "tenso2"]
  ];
  const TOB_G = G.SUELO - G.TOBILLO_ALTO;
  const PIES_G = { cerca: { x: 52, y: 0 }, lejos: { x: 80, y: -4 } };
  const DESCANSO_G = { cerca: { x: XG - 22, y: 452 }, lejos: { x: XG + 52, y: 448 } };
  const AGARRE_G = { cerca: { x: ASIENTO.G - 92, y: 452 }, lejos: { x: (ASIENTO.G + ASIENTO.D) / 2 - 26, y: 454 } };
  const DED_RELAJ = D(0.55, 0.6, 0.55, 0.5), DED_ABIERTA = D(0.9, 1, 1, 0.95), DED_PUNO = D(0.25, 0.08, 0.06, 0.05), DED_GARRA = D(0.4, 0.3, 0.28, 0.26);
  const PISTA_GL = [
    [0, 0, { pant: DESCANSO_G.lejos, mu: -1.75, puno: 1, dedos: DED_RELAJ }],
    [T.gMete, T.gCoge - 0.05, { cubo: { x: -6, y: 4 }, mu: -1.5, puno: 1, dedos: DED_ABIERTA }],
    [T.gCoge - 0.05, T.gCoge + 0.06, { cubo: { x: -6, y: 6 }, mu: -1.5, puno: 1, dedos: DED_PUNO }],
    [T.gCoge + 0.06, T.gBoca, { boca: { x: 14, y: 26 }, mu: -4.1, puno: 1, dedos: DED_PUNO }],
    [T.gBoca, T.gEmbute, { boca: { x: 6, y: 15 }, mu: -4.15, puno: 1, dedos: DED_PUNO }],
    [T.gSale, T.gVuelve, { pant: DESCANSO_G.lejos, mu: -1.75, puno: 1, dedos: DED_RELAJ }],
    [T.gRoba, T.gDentro, { cubo: { x: -4, y: 5 }, mu: -1.45, puno: 1, dedos: D(0.7, 0.8, 0.8, 0.75) }],
    [T.s1 + 0.01, T.s1 + 0.17, { hom: { x: 150, y: -190 }, mu: 1.25, puno: 1, dedos: DED_ABIERTA }, salida],
    [T.cae, T.agarra, { pant: AGARRE_G.lejos, mu: -1.6, puno: 1, dedos: DED_GARRA }],
    [T.s2 + 0.01, T.s2 + 0.12, { hom: { x: 40, y: 75 }, mu: 2.4, puno: 1, dedos: DED_PUNO }, salida]
  ];
  const PISTA_GC = [
    [0, 0, { pant: DESCANSO_G.cerca, mu: -1.75, puno: 1, dedos: DED_RELAJ }],
    [T.tension + 0.3, T.gDentro, { pant: AGARRE_G.cerca, mu: -1.6, puno: 1, dedos: DED_GARRA }],
    [T.s1 + 0.01, T.s1 + 0.18, { hom: { x: 60, y: -210 }, mu: 1.45, puno: 1, dedos: DED_ABIERTA }, salida],
    [T.cae, T.agarra + 0.05, { pant: AGARRE_G.cerca, mu: -1.6, puno: 1, dedos: DED_GARRA }],
    [T.s2 + 0.01, T.s2 + 0.12, { hom: { x: 95, y: 55 }, mu: 2.3, puno: 1, dedos: DED_PUNO }, salida]
  ];
  // susto (0–1): temblor de Guillermo
  const temblor = t => 0.35 * tramo(t, T.tension + 0.5, T.gDentro) * (1 - tramo(t, T.s1, T.s1 + 0.05))
    + tramo(t, T.asienta, T.agarra + 0.3) * (1 - 0.5 * tramo(t, T.niega1, T.tension2)) * (1 - tramo(t, T.s2, T.s2 + 0.05))
    + 0.4 * tramo(t, T.tension2 + 0.3, T.s2 - 0.1) * (1 - tramo(t, T.s2, T.s2 + 0.05));

  /* ---------- el salto a la capucha ---------- */
  const B0 = T.s2 + 0.02, B1 = T.b1;
  const buceo = t => fase(t, B0, B1);
  const ANCLA_H = { x: 178, y: 226 };                 // nacimiento de la capucha (hoja de Dari, detrás del cuello)
  const BOCA_H = { x: -66, y: -70 };                  // boca de la capucha respecto al ancla (pantalla, girada con el torso)
  const DIR_H = { x: 0.87, y: 0.5 };                  // hacia dentro de la capucha
  // capucha: ancla, boca (L), dirección hacia dentro (d), apertura y lo hinchada que está
  function capucha(pD, t, abierta) {
    const a = Da.aPantalla(pD, Da.tronco(pD)(ANCLA_H)), r = pD.torso;
    const ab = abierta ?? abreCapucha(t);
    const o = rota({ x: BOCA_H.x * lerp(0.2, 1, ab), y: BOCA_H.y * lerp(0.2, 1, ab) }, r);
    return { a, L: { x: a.x + o.x, y: a.y + o.y }, d: rota(DIR_H, r), ab, hin: hinchado(t), r };
  }
  // la capucha sube y se abre justo antes de que llegue Guillermo; luego se hincha (con un rebote)
  const abreCapucha = t => tramo(t, B0 + 0.03, B0 + 0.15);
  function hinchado(t) {
    const k = fase(t, B0 + 0.2, B1 + 0.04);
    if (k <= 0) return 0;
    const base = salida(k), v = t - B1;
    return base * (1 + (v > 0 ? 0.14 * Math.sin(v * 15) * Math.exp(-v * 4.5) : 0));
  }

  function poseG(t) {
    const b = linea(GUION_G, CUER_G, "sentado", t);
    const respira = Math.sin(t * 2.2 + 0.4);
    const tm = temblor(t), tx = 1.6 * tm * ruido(t * 38), ty = 0.8 * tm * ruido(t * 41 + 5);
    const x = XG + b.dx + tx;
    const p = {
      x, suelo: SUELO, s: S,
      pelvis: { x: G.PELVIS.x, y: G.PELVIS.y + DY_G + b.pel + respira * 1.2 + ty / S },
      torso: b.torso, torsoEsc: { x: 1, y: 1 + respira * 0.004 },
      piernas: {}, cabeza: { ang: b.cab, dx: 0, dy: 0, esc: { x: 1, y: 1 } },
      tirasLimpias: true
    };
    // masticar con la boca llena: la cabeza cabecea un poco
    const ma = tramo(t, T.gEmbute, T.gEmbute + 0.1) * (1 - tramo(t, T.gVuelve + 0.3, T.gVuelve + 0.6));
    p.cabeza.ang += 0.02 * ma * Math.sin(t * 13);
    // «no, gracias»: niega con la cabeza a la palomita que le ofrece Dari
    p.cabeza.ang += 0.075 * Math.sin((t - T.niega) * 15) * campana(t, T.niega, T.niega1);
    // piernas: tobillos delante, tapados por la fila de delante; en el salto se estiran hacia abajo (hoja)
    const u = buceo(t), ku = suave(clamp(u / 0.6));
    for (const lado of ["cerca", "lejos"]) {
      const f = PIES_G[lado];
      const sent = G.aHoja(p, { x: XG + f.x, y: SUELO - G.TOBILLO_ALTO * S + f.y });
      const rect = { x: G.CADERA[lado].x + (lado === "cerca" ? -10 : 8), y: p.pelvis.y + 560 };
      p.piernas[lado] = { tob: { x: lerp(sent.x, rect.x, ku), y: lerp(sent.y, rect.y, ku) }, ang: lerp(0, -0.25, ku) };
    }
    // dentro de la capucha: patalea
    if (t > B0) patalea(p, t);
    // cara
    let e = linea(GUION_CG, CG, "mira", t);
    const ch = ma * Math.max(0, Math.sin(t * 13));
    e.mof = Math.max(e.mof, ma * (0.75 + 0.25 * ch)); e.abre += 3 * ch;
    p.cara = cara(e, parpadeo(t, PARP_G));
    p.sudor = 0.8 * tramo(t, T.tension + 0.4, T.gDentro) * (1 - tramo(t, T.s1, T.s1 + 0.3)) + 0.9 * tramo(t, T.asienta + 0.2, T.agarra + 0.6);
    // manos
    const Tr = G.tronco(p), hc = Tr(G.HOMBRO_C), hl = Tr(G.HOMBRO);
    const bo = G.aPantalla(p, G.boca(p));
    const resuelve = lado => o => {
      let q;
      if (o.pant) q = G.aHoja(p, o.pant);
      else if (o.cubo) { const c = bocaCubo(t); q = G.aHoja(p, { x: c.x + o.cubo.x, y: c.y - 14 * nivel(t) + o.cubo.y }); }
      else if (o.boca) q = G.aHoja(p, { x: bo.x + o.boca.x, y: bo.y + o.boca.y });
      else if (o.hom) { const h = lado === "l" ? hl : hc; q = { x: h.x + o.hom.x, y: h.y + o.hom.y }; }
      return { x: q.x, y: q.y, mu: o.mu, ang: o.ang || 0, puno: o.puno, dedos: o.dedos };
    };
    const L = pista(PISTA_GL, t, resuelve("l")), C = pista(PISTA_GC, t, resuelve("c"));
    // agarrado a los reposabrazos: los nudillos tiemblan
    L.x += 1.4 * tm * ruido(t * 47 + 2) / S; C.x += 1.4 * tm * ruido(t * 44 + 4) / S;
    p.manoCerca = { x: C.x, y: C.y, ang: C.ang, mu: C.mu, dobla: -1, puno: C.puno, dedos: C.dedos };
    p.manoLejos = { x: L.x, y: L.y, ang: L.ang, mu: L.mu, dobla: -1, puno: L.puno, dedos: L.dedos };
    // palomitas en el pelo (las que le caen encima)
    p.capaCabeza = g => enPelo(g, t, "g", G.cabeza(p).kx);
    return p;
  }
  // cuánto patalea (0–1): frenético al entrar y con el destello; luego tiembla
  function patadas(t) {
    const v = t - B1;
    if (v < 0) return 0;
    const loco = Math.max(clamp(1 - v / 1.1), 0.9 * campana(t, T.s3, T.s3 + 0.9));
    return loco + (1 - loco) * (0.25 + 0.1 * Math.sin(t * 1.7));
  }
  // piernas pataleando fuera de la capucha (hoja de Guillermo: las piernas «cuelgan» y el dibujo va girado)
  function patalea(p, t) {
    const v = t - B1;
    const loco = v < 0 ? 0 : Math.max(clamp(1 - v / 1.1), 0.9 * campana(t, T.s3, T.s3 + 0.9));
    const suaveA = 0.25 + 0.1 * Math.sin(t * 1.7);
    const amp = clamp(v / 0.15) * Math.max(loco, suaveA * (1 - loco));
    const w = lerp(5.5, 17, loco);
    for (const [lado, ph] of [["cerca", 0], ["lejos", Math.PI]]) {
      const q = p.piernas[lado], sube = 210 * amp * (0.5 + 0.5 * Math.sin(t * w + ph)) + 18 * clamp(v / 0.2) * ruido(t * 30 + ph);
      q.tob = { x: q.tob.x + 0.45 * sube, y: q.tob.y - sube };
      q.ang = -0.25 + 0.6 * amp * Math.sin(t * w + ph + 0.8);
    }
  }
  // transformación del dibujo de Guillermo durante el salto y dentro de la capucha
  // Trayectoria: sale disparado hacia arriba, se pone en horizontal y entra de cabeza en línea recta por la boca.
  const bez = (a, b, c, d, k) => { const m = 1 - k; return { x: m * m * m * a.x + 3 * m * m * k * b.x + 3 * m * k * k * c.x + k * k * k * d.x,
    y: m * m * m * a.y + 3 * m * m * k * b.y + 3 * m * k * k * c.y + k * k * k * d.y }; };
  function vueloG(pG, pD, t) {
    const u = buceo(t);
    if (u <= 0) return null;
    const P0 = G.aPantalla(pG, pG.pelvis), cap = capucha(pD, t), cf = capucha(pD, t, 1);
    const fin = { x: cf.L.x - cf.d.x * 6, y: cf.L.y - cf.d.y * 6 };
    const c2 = { x: fin.x - cf.d.x * 400, y: fin.y - cf.d.y * 400 }, c1 = { x: P0.x - 40, y: P0.y - 380 };
    const e = 1 - Math.pow(1 - u, 2.2);
    const P = bez(P0, c1, c2, fin, e);
    const thF = Math.atan2(cf.d.x, -cf.d.y);
    let th = thF * suave(clamp(e / 0.45));
    if (u >= 1) { const v = t - B1; th = thF + 0.07 * Math.sin(v * 10) * Math.exp(-v * 2.5) + 0.03 * Math.sin(t * 3.3) * tramo(t, B1, B1 + 0.5); }
    return { P0, P, th, cap, cf, recorta: e > 0.35 };
  }

  /* ================= Dari ================= */
  const CD = {
    base: E({ mx: 0.85, my: -0.25, c: 0.28, sonr: 0.12, ancho: 0.8 }),
    abre: E({ mx: 0.85, my: -0.25, c: 0.3, sonr: 0.05, ancho: 0.55, abre: 16 }),
    atrapa: E({ mx: 0.85, my: -0.5, c: 0.32, sonr: 0.0, ancho: 0.55, abre: 22, sd: 4, si: 6 }),
    camara: E({ mx: -0.85, my: -0.05, c: 0.32, sonr: 0.1, ancho: 0.8, sd: 0, si: 18, gi: 0.15 }),
    ofrece: E({ mx: 0.9, my: 0.25, c: 0.3, sonr: 0.22, ancho: 0.8, sd: 4, si: 10, gi: 0.08 })
  };
  const DESCANSO_D = { x: XD - 58, y: 446 };
  const DED_PINZA = D(0.42, 0.5, 0.18, 0.12), DED_COGE = D(0.65, 0.75, 0.3, 0.22);
  const OFRECE = { x: 497, y: 366 };            // delante de Guillermo, por encima del cubo
  const PISTA_DC = [[0, 0, { pant: DESCANSO_D, mu: -1.4, puno: 1, dedos: DED_RELAJ }]];
  const EN_DEDOS = [];                          // la palomita entre los dedos de Dari: [aparece, desaparece en la boca]
  const BOCA_D = [];                            // instante en que se la mete en la boca
  let giro = 0;                                 // tras la que ofrece, la muñeca ha dado la vuelta entera (+2π)
  for (const tc of T.dCome) {
    PISTA_DC.push([tc, tc + 0.36, { cubo: { x: 12, y: 2 }, mu: -1.25 + giro, puno: 1, dedos: DED_COGE }]);
    PISTA_DC.push([tc + 0.36, tc + 0.46, { cubo: { x: 12, y: 4 }, mu: -1.25 + giro, puno: 1, dedos: DED_PINZA }]);
    if (tc === T.dCome[2]) {
      PISTA_DC.push([tc + 0.46, T.ofrece, { pant: OFRECE, mu: 0.7, puno: 1, dedos: DED_PINZA }]);
      PISTA_DC.push([T.retira, T.retira + 0.34, { boca: { x: -4, y: 19 }, mu: 1.88, puno: 1, dedos: DED_PINZA }]);
      PISTA_DC.push([T.retira + 0.45, T.retira + 0.85, { pant: DESCANSO_D, mu: -1.4 + 2 * Math.PI, puno: 1, dedos: DED_RELAJ }]);
      EN_DEDOS.push([tc + 0.47, T.retira + 0.35]); BOCA_D.push(T.retira + 0.35);
      giro = 2 * Math.PI;
      continue;
    }
    PISTA_DC.push([tc + 0.46, tc + 0.84, { boca: { x: -4, y: 19 }, mu: -4.4 + giro, puno: 1, dedos: DED_PINZA }]);
    PISTA_DC.push([tc + 0.95, tc + 1.35, { pant: DESCANSO_D, mu: -1.4 + giro, puno: 1, dedos: DED_RELAJ }]);
    EN_DEDOS.push([tc + 0.47, tc + 0.85]); BOCA_D.push(tc + 0.85);
  }
  const GUION_CD = [];
  // la boca se abre un poco antes de que llegue cada palomita (BOCA_D se rellena con la pista de la mano)
  GUION_CD.push([T.atrapa - 0.3, T.atrapa - 0.15, "atrapa"], [T.atrapa, T.atrapa + 0.1, "base"]);
  GUION_CD.push([T.camara, T.camara + 0.25, "camara"], [T.camara1, T.camara1 + 0.3, "base"]);
  GUION_CD.push([T.ofrece - 0.3, T.ofrece, "ofrece"], [T.retira - 0.05, T.retira + 0.2, "base"]);
  const PARP_D = [0.3, 2.05, 3.1, 5.25, 6.45, 8.65, 10.1, 11.95, 13.1];
  for (const bm of BOCA_D) GUION_CD.push([bm - 0.24, bm - 0.12, "abre"], [bm + 0.01, bm + 0.11, "base"]);
  GUION_CD.sort((x, y) => x[0] - y[0]);
  const MASTICA_D = BOCA_D.map(bm => bm + 0.03).concat([T.atrapa + 0.02]).sort((a, b) => a - b);
  const mastica = t => { let o = 0; for (const m of MASTICA_D) { const k = fase(t, m, m + 0.85); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k) * Math.abs(Math.sin((t - m) * 10.5))); } return o; };
  const P0D = { pel: 0, torso: -0.03, cab: 0.02 };
  const CuD = o => Object.assign({}, P0D, o);
  const CUER_D = {
    quieto: CuD({}),
    coge: CuD({ torso: 0.02, cab: 0.03 }),
    atrapa: CuD({ torso: -0.06, cab: -0.12 }),
    lastre: CuD({ torso: -0.07, cab: -0.04 }),
    camara: CuD({ torso: -0.05, cab: -0.02 }),
    ofrece: CuD({ torso: -0.07, cab: 0.03 })
  };
  const GUION_D = [];
  for (const tc of T.dCome) if (tc !== T.dCome[2]) GUION_D.push([tc, tc + 0.35, "coge"], [tc + 0.5, tc + 0.85, tc > T.b1 ? "lastre" : "quieto"]);
  GUION_D.push([T.dCome[2], T.dCome[2] + 0.35, "coge"], [T.dCome[2] + 0.45, T.ofrece, "ofrece"], [T.retira, T.retira + 0.35, "quieto"]);
  GUION_D.push([T.atrapa - 0.35, T.atrapa - 0.1, "atrapa"], [T.atrapa + 0.05, T.atrapa + 0.4, "quieto"]);
  GUION_D.push([T.b1 - 0.05, T.b1 + 0.3, "lastre"], [T.camara, T.camara + 0.3, "camara"]);
  GUION_D.sort((x, y) => x[0] - y[0]);

  function poseD(t) {
    const b = linea(GUION_D, CUER_D, "quieto", t);
    const respira = Math.sin(t * 1.9 + 1.4);
    // con Guillermo en la capucha, el peso le balancea un poco
    const pa = tramo(t, B1, B1 + 0.2), bal = pa * (0.012 * Math.sin(t * 6.5) + 0.006 * ruido(t * 9));
    const p = {
      x: XD, suelo: SUELO, s: S,
      pelvis: { x: Da.PELVIS.x, y: Da.PELVIS.y + DY_D + b.pel + respira * 1.1 },
      torso: b.torso + bal, torsoEsc: { x: 1, y: 1 + respira * 0.004 },
      piernas: {}, cabeza: { ang: b.cab + bal * 0.6, dx: 0, dy: 0, esc: { x: 1, y: 1 } },
      tirasLimpias: true
    };
    p.piernas.cerca = { tob: Da.aHoja(p, { x: XD + 44, y: SUELO - Da.TOBILLO_ALTO * S }), ang: 0 };
    p.piernas.lejos = { tob: Da.aHoja(p, { x: XD + 72, y: SUELO - Da.TOBILLO_ALTO * S - 4 }), ang: 0 };
    const e = linea(GUION_CD, CD, "base", t);
    const ch = mastica(t);
    e.abre += 3.5 * ch; e.mof = Math.max(e.mof, 0.22 * ch);
    p.cara = cara(e, parpadeo(t, PARP_D, 0.13));
    p.gafas = { dx: 0, dy: 0, ang: 0 };
    p.capaCabeza = g => enPelo(g, t, "d", Da.cabeza(p).kx);
    // manos: la cercana come; la lejana, en el bolsillo de la parka
    const bo = Da.aPantalla(p, Da.boca(p));
    const resuelve = o => {
      let q;
      if (o.pant) q = Da.aHoja(p, o.pant);
      else if (o.cubo) { const c = bocaCubo(t); q = Da.aHoja(p, { x: c.x + o.cubo.x, y: c.y - 14 * nivel(t) + o.cubo.y }); }
      else if (o.boca) q = Da.aHoja(p, { x: bo.x + o.boca.x, y: bo.y + o.boca.y });
      return { x: q.x, y: q.y, mu: o.mu, ang: o.ang || 0, puno: o.puno, dedos: o.dedos };
    };
    const C = pista(PISTA_DC, t, resuelve);
    p.manoCerca = { x: C.x, y: C.y, ang: C.ang, mu: C.mu, dobla: -1, puno: C.puno, dedos: C.dedos };
    const m = Da.manoReposo(p, "lejos");
    p.manoLejos = { x: m.x, y: m.y, ang: 0, mu: -1.75, dobla: 1, puno: 0, dedos: D(0.4, 0.4, 0.4, 0.4) };
    return p;
  }

  /* ================= la lluvia de palomitas ================= */
  const GRAV = 820;
  // pelo (coordenadas del retrato) donde se quedan las que caen en la cabeza
  const PELO = { g: [{ x: 760, y: 300 }, { x: 860, y: 262 }, { x: 940, y: 318 }, { x: 700, y: 352 }], d: [{ x: 760, y: 252 }, { x: 905, y: 268 }] };
  const VUELOS = [];
  (() => {
    const tipos = [];
    for (let i = 0; i < 4; i++) tipos.push({ a: "g", q: i });
    for (let i = 0; i < 2; i++) tipos.push({ a: "d", q: i });
    tipos.push({ a: "boca" });
    for (let i = 0; i < 8; i++) tipos.push({ a: "cubo" });
    for (let i = 0; i < 10; i++) tipos.push({ a: "fila" });
    for (let i = 0; i < 18; i++) tipos.push({ a: "suelo" });
    tipos.forEach((o, i) => {
      const h = k => hash(i * 13 + k);
      o.i = i; o.v = Math.floor(h(1) * 5);
      o.t0 = T.s1 + 0.02 + 0.07 * h(2);
      o.dx = (h(3) - 0.5) * 50; o.w = (h(4) > 0.5 ? 1 : -1) * (4 + 6 * h(5));
      if (o.a === "g") o.t1 = 4.35 + 0.18 * o.q + 0.1 * h(6);
      else if (o.a === "d") o.t1 = 4.5 + 0.25 * o.q;
      else if (o.a === "boca") o.t1 = T.atrapa;
      else if (o.a === "cubo") { o.t1 = 4.25 + 0.55 * h(6); o.x = CUBO.x + (h(7) - 0.5) * 36; }
      else if (o.a === "fila") { o.t1 = 4.3 + 0.6 * h(6); o.x = 250 + 580 * (i % 10) / 9 + 30 * (h(7) - 0.5); }
      else { o.t1 = 4.15 + 0.85 * h(6); o.x = 180 + 720 * h(7); o.y = 640; }
      VUELOS.push(o);
    });
    const vc = VUELOS.filter(o => o.a === "cubo").map(o => o.t1);
    VUELTA = [Math.min(...vc), Math.max(...vc) + 0.1];
  })();
  // destino (pantalla) de una palomita en el instante en que llega
  function destino(o) {
    return cache("dst" + o.i, () => {
      if (o.a === "g") { const p = poseG(o.t1); return G.aPantalla(p, G.cabeza(p).a(PELO.g[o.q])); }
      if (o.a === "d") { const p = poseD(o.t1); return Da.aPantalla(p, Da.cabeza(p).a(PELO.d[o.q])); }
      if (o.a === "boca") { const p = poseD(o.t1); const b = Da.aPantalla(p, Da.boca(p)); return { x: b.x, y: b.y - 2 }; }
      if (o.a === "cubo") { const b = bocaCubo(o.t1); return { x: o.x, y: b.y - 12 * nivel(o.t1) }; }
      if (o.a === "fila") return { x: o.x, y: bordeFila(o.x) - 3 };
      return { x: o.x, y: o.y };
    });
  }
  function salida0(o) {
    return cache("sal" + o.i, () => { const b = bocaCubo(o.t0); return { x: b.x + o.dx, y: b.y - 14 }; });
  }
  // estado: null (aún en el cubo o ya comida), {aire}, {quieta}
  function estadoPalomita(o, t) {
    if (t < o.t0) return null;
    const s0 = salida0(o), f = destino(o), tau = o.t1 - o.t0;
    if (t < o.t1) {
      const u = t - o.t0, vx = (f.x - s0.x) / tau, vy = (f.y - s0.y - 0.5 * GRAV * tau * tau) / tau;
      const esc = 1.3 + 0.35 * Math.sin(Math.PI * clamp(u / tau));
      return { modo: "aire", x: s0.x + vx * u, y: s0.y + vy * u + 0.5 * GRAV * u * u, rot: o.w * u, esc };
    }
    if (o.a === "fila") {
      const v = t - o.t1, h = 6 * Math.abs(Math.sin(v * 13)) * Math.exp(-v * 7);
      return { modo: "quieta", x: f.x + 4 * (1 - Math.exp(-v * 6)) * (o.dx > 0 ? 1 : -1), y: f.y - h, rot: o.w * tau * 0.3 + 0.3 * Math.sin(v * 9) * Math.exp(-v * 5), esc: 1 };
    }
    return null;          // en el pelo (lo pinta la cabeza), en el cubo, en la boca o detrás de la fila
  }
  // palomitas posadas en el pelo: se dibujan con la cabeza (coordenadas del retrato)
  function enPelo(g, t, quien, kx) {
    const esc = 1 / (kx * S);
    for (const o of VUELOS) {
      if (o.a !== quien || t < o.t1) continue;
      const q = PELO[quien][o.q], v = t - o.t1, h = 26 * Math.abs(Math.sin(v * 12)) * Math.exp(-v * 7);
      palomita(g, q.x, q.y - h * esc * 0.1 - 18, o.w * 0.4, esc, o.v);
    }
  }

  /* ================= la capucha hinchada ================= */
  const PARKA = "#cdb187", PARKA_SOMBRA = "#9a7e55", PARKA_LUZ = "#e8d3a9";
  // medidas de la capucha en este instante (pantalla): medio ancho y grosor de la boca, ancho y fondo de la bolsa
  function medidas(cap, t) {
    const ab = cap.ab, hi = cap.hin, pat = t > B1 ? patadas(t) : 0;
    const wob = 1 + 0.045 * Math.sin(t * 13) * pat + 0.02 * Math.sin(t * 4.1) * hi;
    const R = 44 * ab, r = 13 * ab;
    return { R, r, A: lerp(R * 1.08, 66, hi) * wob * ab, P: lerp(52, 102, hi) / wob * ab };
  }
  const local = (cap, a, b) => { const n = { x: -cap.d.y, y: cap.d.x }; return { x: cap.L.x + n.x * a + cap.d.x * b, y: cap.L.y + n.y * a + cap.d.y * b }; };
  // la bolsa de tela: tapa lo que de Guillermo ya ha entrado (y queda detrás de Dari)
  function capuchaBolsa(g, cap, t) {
    if (cap.ab <= 0.01) return;
    const { R, r, A, P } = medidas(cap, t), { L, d } = cap, n = { x: -d.y, y: d.x }, ang = Math.atan2(n.y, n.x);
    const pts = [[R, 0], [A * 0.97, P * 0.3], [A * 0.86, P * 0.66], [A * 0.5, P * 0.94], [0, P], [-A * 0.5, P * 0.94], [-A * 0.86, P * 0.66], [-A * 0.97, P * 0.3], [-R, 0]]
      .map(([a, b]) => local(cap, a, b));
    const contorno = () => { g.beginPath(); M2.curva(g, pts, false, 0.5); g.ellipse(L.x, L.y, R, r, ang, Math.PI, 2 * Math.PI, false); g.closePath(); };
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    contorno();
    const lg = g.createLinearGradient(L.x + n.x * A, L.y + n.y * A, L.x - n.x * A, L.y - n.y * A);
    lg.addColorStop(0, PARKA_SOMBRA); lg.addColorStop(0.5, PARKA); lg.addColorStop(1, PARKA_LUZ);
    g.fillStyle = lg; g.fill();
    g.save(); contorno(); g.clip();
    // sombras en pico, como las de la parka, que se mueven con lo que hay dentro
    g.fillStyle = "rgba(120,92,52,0.38)";
    for (let k = 0; k < 4; k++) {
      const s0 = (k - 1.5) * 0.5, tw = 0.12 * Math.sin(t * 6 + k * 1.7) * cap.hin;
      const q0 = local(cap, A * (s0 + tw), P * 0.18), q1 = local(cap, A * (s0 + 0.32), P * 0.45), q2 = local(cap, A * (s0 * 0.6 + 0.1), P * 0.95);
      g.beginPath(); g.moveTo(q0.x, q0.y); g.lineTo(q1.x, q1.y); g.lineTo(q2.x, q2.y); g.closePath(); g.fill();
    }
    // costura central de la capucha
    const c0 = local(cap, 0, r), c1 = local(cap, A * 0.12 * Math.sin(t * 5) * cap.hin, P * 0.55), c2 = local(cap, 0, P);
    g.strokeStyle = "rgba(80,58,30,0.75)"; g.lineWidth = 1.6; g.setLineDash([3, 3]);
    g.beginPath(); g.moveTo(c0.x, c0.y); g.quadraticCurveTo(c1.x, c1.y, c2.x, c2.y); g.stroke(); g.setLineDash([]);
    g.restore();
    contorno(); g.strokeStyle = TINTA; g.lineWidth = 2.6; g.stroke();
    g.strokeStyle = "#7e6240"; g.lineWidth = 4; g.beginPath(); g.ellipse(L.x, L.y, R, r, ang, Math.PI, 2 * Math.PI, false); g.stroke();
    g.restore();
  }
  // el hueco oscuro de la boca: detrás de Guillermo
  function capuchaHueco(g, cap, t) {
    if (cap.ab <= 0.01) return;
    const { R, r } = medidas(cap, t), { L, d } = cap, ang = Math.atan2(d.x, -d.y);
    g.save(); g.fillStyle = "#2a1c10"; g.beginPath(); g.ellipse(L.x, L.y, R, r, ang, 0, Math.PI * 2); g.fill(); g.restore();
  }
  // el dobladillo de delante de la boca: tapa el arranque de las piernas
  function capuchaBorde(g, cap, t) {
    if (cap.ab <= 0.01) return;
    const { R, r } = medidas(cap, t), { L, d } = cap, n = { x: -d.y, y: d.x }, ang = Math.atan2(n.y, n.x);
    g.save(); g.lineCap = "round"; g.globalAlpha = clamp((cap.ab - 0.15) / 0.4);
    g.strokeStyle = TINTA; g.lineWidth = 9; g.beginPath(); g.ellipse(L.x, L.y, R, r, ang, -0.08, Math.PI + 0.08, false); g.stroke();
    g.strokeStyle = PARKA; g.lineWidth = 5.5; g.stroke();
    g.strokeStyle = PARKA_LUZ; g.lineWidth = 1.6; g.beginPath(); g.ellipse(L.x, L.y, R - 1, r + 1, ang, 0.3, Math.PI - 0.3, false); g.stroke();
    // cordones de la capucha, con su puntera, que se balancean
    for (const s0 of [-1, 1]) {
      const b = local(cap, s0 * R * 0.62, -r * 0.7), lc = 30 * cap.ab, sw = 0.5 * Math.sin(t * 5 + s0) * (t > B1 ? patadas(t) + 0.3 : 0.3);
      const e = { x: b.x - d.x * 4 + lc * Math.sin(0.25 * s0 + sw) * 0.4, y: b.y + lc * Math.cos(0.25 * s0 + sw) };
      g.strokeStyle = TINTA; g.lineWidth = 3.4; g.beginPath(); g.moveTo(b.x, b.y); g.quadraticCurveTo(b.x + s0 * 4, (b.y + e.y) / 2, e.x, e.y); g.stroke();
      g.strokeStyle = "#e9e2d6"; g.lineWidth = 1.8; g.stroke();
      g.fillStyle = "#b9b2a6"; g.fillRect(e.x - 1.6, e.y - 1, 3.2, 6); g.strokeStyle = TINTA; g.lineWidth = 0.9; g.strokeRect(e.x - 1.6, e.y - 1, 3.2, 6);
    }
    g.restore();
  }
  // recorte: lo que de Guillermo pasa de la boca de la capucha no se dibuja
  function recorteCapucha(g, cap) {
    const { L, d } = cap, n = { x: -d.y, y: d.x }, w = 150, lejos = 600;
    g.beginPath(); g.rect(-200, -200, W + 400, H + 400);
    g.moveTo(L.x + n.x * w, L.y + n.y * w); g.lineTo(L.x - n.x * w, L.y - n.y * w);
    g.lineTo(L.x - n.x * w + d.x * lejos, L.y - n.y * w + d.y * lejos); g.lineTo(L.x + n.x * w + d.x * lejos, L.y + n.y * w + d.y * lejos); g.closePath();
    g.clip("evenodd");
  }

  /* ================= reflejo de la pantalla en las gafas de Dari ================= */
  const AROS = [
    [[729, 474], [744, 471], [789, 478], [833, 496], [858, 509], [861, 517], [849, 545], [837, 569], [823, 579], [789, 575], [745, 561], [734, 553], [729, 530]],
    [[905, 522], [949, 537], [993, 551], [1006, 557], [1003, 580], [999, 608], [986, 621], [949, 624], [917, 615], [907, 604], [904, 570]]
  ];
  function reflejo(g, pD, t, L) {
    const H = Da.cabeza(pD), P = q => Da.aPantalla(pD, H.a({ x: q[0], y: q[1] }));
    g.save(); g.globalCompositeOperation = "lighter";
    for (let j = 0; j < 2; j++) {
      const aro = AROS[j].map(P);
      g.save(); g.beginPath(); g.moveTo(aro[0].x, aro[0].y); for (const q of aro.slice(1)) g.lineTo(q.x, q.y); g.closePath(); g.clip();
      const cx = aro.reduce((s, q) => s + q.x, 0) / aro.length, cy = aro.reduce((s, q) => s + q.y, 0) / aro.length;
      const kw = j ? 0.75 : 1;
      // la pantalla: un rectángulo inclinado que brilla con el color de la peli
      g.translate(cx + 1, cy - 1); g.rotate(H.ang + 0.18); g.transform(1, 0, -0.25, 1, 0, 0);
      const wr = 11 * kw, hr = 6.5 * kw;
      g.fillStyle = rgb(L.col, 0.3 + 0.4 * (L.b - 0.5) + 0.5 * L.f); g.fillRect(-wr, -hr, wr * 2, hr * 2);
      // algo que se mueve en la peli (sombra) y, en los sustos, un bicho con ojos rojos
      const fig = 0.55 * L.m + 0.8 * L.f;
      if (fig > 0.02) {
        g.fillStyle = `rgba(0,0,0,${0.5 * fig})`;
        const fx = -4 + 5 * Math.sin(t * 0.9) + 4 * L.f;
        g.beginPath(); g.ellipse(fx, hr * 0.35, 4.5 * kw * (1 + L.f), 6 * kw * (1 + 0.6 * L.f), 0, 0, Math.PI * 2); g.fill();
        g.fillStyle = `rgba(255,40,40,${0.9 * fig})`; g.fillRect(fx - 2.2 * kw, -1.5 * kw, 1.4 * kw, 1.2 * kw); g.fillRect(fx + 0.8 * kw, -1.5 * kw, 1.4 * kw, 1.2 * kw);
      }
      g.fillStyle = `rgba(255,255,255,${0.25 + 0.4 * L.f})`; g.fillRect(-wr, -hr, wr * 2, 1.4 * kw);
      g.restore();
    }
    g.restore();
  }

  /* ================= haz del proyector ================= */
  const HAZ_FIN = { x: W + 60, y0: -40, y1: 258 };
  function haz(g, t, L) {
    const a = 0.045 + 0.06 * (L.b - 0.5) + 0.2 * L.f;
    g.save(); g.globalCompositeOperation = "lighter";
    const gr = g.createLinearGradient(PROY.x, PROY.y, HAZ_FIN.x, (HAZ_FIN.y0 + HAZ_FIN.y1) / 2);
    gr.addColorStop(0, rgb(L.col, a * 2.2)); gr.addColorStop(0.25, rgb(L.col, a)); gr.addColorStop(1, rgb(L.col, a * 0.35));
    g.fillStyle = gr; g.beginPath(); g.moveTo(PROY.x + 20, PROY.y - 12); g.lineTo(HAZ_FIN.x, HAZ_FIN.y0); g.lineTo(HAZ_FIN.x, HAZ_FIN.y1); g.lineTo(PROY.x + 20, PROY.y + 12); g.closePath(); g.fill();
    // motas de polvo flotando en el haz
    g.fillStyle = rgb(L.col, 0.35 + 0.4 * L.f);
    for (let i = 0; i < 22; i++) {
      const u = (hash(i + 900) + t * 0.012 * (0.5 + hash(i + 901))) % 1, x = lerp(PROY.x + 40, HAZ_FIN.x, u);
      const y0 = lerp(PROY.y - 10, HAZ_FIN.y0, u), y1 = lerp(PROY.y + 10, HAZ_FIN.y1, u);
      const y = lerp(y0, y1, 0.15 + 0.7 * hash(i + 902)) + 6 * Math.sin(t * 0.7 + i);
      g.globalAlpha = 0.5 + 0.5 * Math.sin(t * 1.3 + i * 2.1);
      g.beginPath(); g.arc(x, y, 1.1 + hash(i + 903), 0, Math.PI * 2); g.fill();
    }
    g.restore();
  }

  /* ================= escena ================= */
  const pose = t => ({ g: poseG(t), d: poseD(t) });
  // cámara: plano general; se acerca con la tensión; se abre en la lluvia; sigue la capucha y acaba cerca de Dari
  const PLANOS = [
    [0, 1.18, 515, 312], [1.2, 1.22, 515, 316], [3.45, 1.46, 515, 300], [3.6, 1.46, 515, 300], [4.08, 1.2, 520, 305], [4.42, 1.36, 560, 300], [5.2, 1.36, 552, 302],
    [5.95, 1.6, 525, 305], [7.0, 1.55, 525, 308], [7.73, 1.48, 528, 305], [8.3, 1.22, 545, 280], [9.6, 1.25, 545, 280], [11.2, 1.6, 585, 268], [DUR, 1.68, 590, 268]
  ];
  function camara(t) {
    let i = 0; while (i < PLANOS.length - 2 && t > PLANOS[i + 1][0]) i++;
    const a = PLANOS[i], b = PLANOS[i + 1], k = suave(fase(t, a[0], b[0]));
    const kk = lerp(a[1], b[1], k), x = lerp(a[2], b[2], k), y = lerp(a[3], b[3], k);
    const mx = W / 2 / kk, my = H / 2 / kk;
    return { k: kk, x: clamp(x, mx - 40, W + 40 - mx), y: clamp(y, my - 60, H + 60 - my) };
  }

  class GuillermoDariPalomitas extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !Da.listo()) return;
      if (!fondo) { fondo = creaFondo(); fila = creaFila(); }
      const pG = poseG(t), pD = poseD(t), L = luzPantalla(t);
      const luz = tramo(t, NEGRO_INICIO, 0.8, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t);
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      MATRIZ = g.getTransform();
      g.drawImage(fondo, -40, -60);
      // Guillermo (girado y recortado cuando se mete en la capucha) y la capucha hinchada
      const vu = vueloG(pG, pD, t);
      if (vu) capuchaHueco(g, vu.cap, t);
      g.save();
      if (vu) { if (vu.recorta) recorteCapucha(g, vu.cf); g.translate(vu.P.x, vu.P.y); g.rotate(vu.th); g.translate(-vu.P0.x, -vu.P0.y); }
      G.dibujar(g, pG, t);
      g.restore();
      if (vu) { capuchaBolsa(g, vu.cap, t); capuchaBorde(g, vu.cap, t); }
      Da.dibujar(g, pD, t);
      // el cubo, con las manos metidas en el montón
      cuboDentro(g, t); cuboMonton(g, t); cuboFuera(g, t);
      // palomitas en la mano
      manos(g, t, pG, pD);
      // palomitas por el aire y en la fila de delante
      for (const o of VUELOS) { const e = estadoPalomita(o, t); if (e) palomita(g, e.x, e.y, e.rot, e.esc, o.v); }
      g.drawImage(fila, -40, -60);
      iluminar(g, L);
      haz(g, t, L);
      reflejo(g, pD, t, L);
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  // palomitas que llevan en la mano: el puñado de Guillermo y la de Dari, entre dos dedos
  function manos(g, t, pG, pD) {
    if (t > T.gCoge + 0.04 && t < T.gEmbute + 0.05) {
      const m = G.aPantalla(pG, pG.manoLejos), dir = { x: -Math.cos(pG.manoLejos.mu), y: -Math.sin(pG.manoLejos.mu) };
      const a = 1 - tramo(t, T.gEmbute - 0.06, T.gEmbute + 0.05);
      g.save(); g.globalAlpha = a;
      for (let i = 0; i < 4; i++) palomita(g, m.x + dir.x * 7 + (i - 1.5) * 4.5, m.y + dir.y * 7 - 3 + 3 * hash(i + 40), i, 1, i);
      g.restore();
    }
    for (const [a, b] of EN_DEDOS) {
      if (t < a || t > b) continue;
      const mn = pD.manoCerca, m = Da.aPantalla(pD, mn), dir = { x: -Math.cos(mn.mu), y: -Math.sin(mn.mu) };
      palomita(g, m.x + dir.x * 9, m.y + dir.y * 9, 0.5, 1.2, 2);
    }
  }
  registrar({ id: "00058", nombre: "Guillermo y Dari · Las palomitas", crear: () => new GuillermoDariPalomitas() });
  window.__A2D_00058 = { pose, poseG, poseD, T, DUR };
})();
