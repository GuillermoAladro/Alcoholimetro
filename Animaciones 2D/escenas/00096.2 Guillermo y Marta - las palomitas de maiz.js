"use strict";
/* 00096.2 · Guillermo y Marta · El microondas
 *
 * Negro → la cocinita de detrás de la barra, al anochecer: pared crema, zócalo de azulejo verde agua,
 * una ventana con la ciudad azul y una cortina de cuadros, una balda con tarros sin etiqueta y tazas
 * colgadas, una lámpara colgante, la encimera de madera con el hervidor, un frutero y un bote de
 * cucharones, una nevera con imanes y suelo de baldosa de barro. En la encimera, un microondas plateado
 * con la puerta entreabierta (luz encendida dentro) y su panel a la izquierda (pantalla con la hora).
 *
 * Guillermo sacude muy chulo un sobre de palomitas, mira a cámara y lo encesta de un lanzamiento en el
 * microondas (¡sí!) → se acerca, cierra la puerta de un empujón (¡clac!), vuelve un paso y teclea con el
 * índice: 9, 99, 9:99, 99:99… y ¡START! (pitidos). El plato gira, se enciende la luz, zumbido → Guillermo
 * se aparta, se pone chulo, golpea el suelo con el pie → ¡pop!: el sobre empieza a hincharse a tirones
 * (estallidos por encima del microondas), Guillermo se ilusiona… el sobre lo llena todo, aprieta el
 * cristal, la puerta se abomba y el microondas tiembla; Guillermo, sudando, alarga el dedo hacia el botón…
 * y lo retira → ¡BUM!: la puerta sale despedida, el sobre revienta y una ola de palomitas se le viene
 * encima: bracea, grita… y se queda enterrado hasta el cuello en una montaña de palomitas, con alguna en el
 * pelo; una última sale del microondas y le da en la cabeza. Mirada seria a cámara → Marta entra por la
 * derecha, pasa con un zancada por encima de las palomitas del suelo, se para, mira la montaña y a
 * Guillermo, coge un puñado del montón (deja un hoyo) y se las va comiendo una a una, tan tranquila,
 * mientras Guillermo se relame → Marta le lanza una sola palomita: Guillermo la caza al vuelo con la boca
 * y mastica feliz; Marta guiña un ojo → negro.
 *
 * Solo hay cifras en la pantalla del microondas (es una máquina). Palomitas: sprites hechos una vez; la
 * montaña es una sola imagen cacheada que sube desde el suelo; las palomitas sueltas siguen trayectorias
 * precalculadas (aterrizan contra la montaña que sube). Todo depende de `t`.
 */
(() => {
  const { clamp, lerp, fase, suave, salida, entrada, tramo, campana, ruido, hash, rectanguloRedondeado } = M2;
  const G = Guillermo, M = Marta;
  const DUR = 14.9;
  const TINTA = "#0b0a0e";

  /* ---------- guion (s) ---------- */
  const T = {
    sacude0: 0.55, sacude1: 1.05, gCamara: 0.62,
    carga: 1.12, lanza: 1.4, aterriza: 1.82, bote: 1.96, siPuno: 1.5, siPuno1: 1.9,
    anda0: 1.92, anda1: 2.3, cierra0: 2.32, slam: 2.56, atras0: 2.64, atras1: 2.92,
    dedo: 2.98, teclas: [3.18, 3.44, 3.7, 3.96], start: 4.2,
    aparta0: 4.36, aparta1: 4.78, chulo: 4.86, pie0: 4.95, pie1: 5.5,
    pop0: 5.35, gMira: 5.45, ilusion: 5.85, lleno: 6.6, gDuda: 6.45, aprieta: 6.75,
    alarga0: 6.8, alarga1: 7.06, retira: 7.12, tiembla: 7.0,
    bum: 7.42, sube0: 7.5, sube1: 8.6, brazos0: 7.55, brazos1: 8.32, hunde: 8.48,
    pelo1: 8.82, ultima: 9.12, gSerio: 9.42,
    mEntra0: 9.6, mEntra1: 10.95, mMira: 11.0, mCeja: 11.25,
    coge0: 11.45, coge: 11.75, sube: 12.0,
    come: [12.2, 12.55, 12.9], mPinza: 13.15, mLanza: 13.32, atrapa: 13.66,
    gCamaraF: 13.95, guino: 14.12,
    fin: 14.32
  };

  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n], k); return o; };
  const guion = (lista, dic, base, t) => {
    let c = dic[base];
    for (const [t0, t1, nom, f] of lista) { if (t <= t0) break; c = mezclaE(c, dic[nom], (f || suave)(fase(t, t0, t1))); }
    return Object.assign({}, c);
  };
  const dentro = (t, a0, a1, b0, b1) => tramo(t, a0, a1) * (1 - tramo(t, b0, b1));
  const lerpAng = (a, b, k) => a + Math.atan2(Math.sin(b - a), Math.cos(b - a)) * k;
  const DED = ["pulgar", "indice", "medio", "anular", "menique"];
  const mezclaD = (a, b, k) => { const o = {}; for (const n of DED) o[n] = lerp(a[n] ?? 0, b[n] ?? 0, k); return o; };
  const D = (pu, i, m, a, me) => ({ pulgar: pu, indice: i, medio: m ?? i, anular: a ?? i, menique: me ?? i });
  const RELAJADA = D(0.55, 0.6, 0.55, 0.5, 0.45), ABRE = D(0.85, 0.9, 0.9, 0.85, 0.8), PALMA = D(1, 1),
    PINZA = D(0.5, 0.55, 0.12, 0.1, 0.1), SENALA = D(0.25, 1, 0, 0, 0), PUNO = D(0, 0),
    CUENCO = D(0.55, 0.45, 0.42, 0.4, 0.38), GARRA = D(0.6, 0.5, 0.48, 0.45, 0.42);

  /* ---------- caras ---------- */
  const BASE = { mx: 0.85, my: 0, c: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, abre: 0, ancho: 1, sonr: 0.15,
    dientes: 1, lengua: 0, esp: 0, mof: 0, wd: 0, wi: 0, rub: 0 };
  const E = o => Object.assign({}, BASE, o);
  function cara(e, parp) {
    return { mirada: { x: e.mx, y: e.my }, iris: e.iris, espiral: e.esp,
      ojos: { d: clamp(Math.max(e.c, parp) + e.wd), i: clamp(Math.max(e.c, parp) + e.wi), feliz: e.h, apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: 0, abre: Math.max(0, e.abre), ancho: e.ancho, sonrisa: e.sonr, dientes: e.dientes > 0.5, lengua: e.lengua },
      mofletes: e.mof, rubor: e.rub, bigote: 0 };
  }
  const parpadeo = (t, lista) => { let o = 0; for (const tb of lista) { const k = fase(t, tb, tb + 0.15); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); } return o; };

  // pies: pasos alternos entre dos posiciones de la pelvis (px de pantalla); `w` separa los pies
  function pasos(t, t0, t1, x0, x1, n, w, alto, lider, altos) {
    const out = { c: x0 - w, l: x0 + w, yc: 0, yl: 0 };
    if (t <= t0) return out;
    const movs = n + 1, d = (t1 - t0) / movs;
    let pie = lider;
    for (let j = 0; j < movs; j++) {
      const a = t0 + j * d, b = a + d, dest = (j < n ? lerp(x0, x1, (j + 1) / n) : x1) + (pie === "c" ? -w : w);
      const h = altos && altos[j] != null ? altos[j] : alto;
      if (t >= b) out[pie] = dest;
      else if (t > a) { const k = fase(t, a, b); out[pie] = lerp(out[pie], dest, suave(k)); out["y" + pie] = h * Math.sin(Math.PI * k); break; }
      pie = pie === "c" ? "l" : "c";
    }
    return out;
  }

  /* =====================================================================================
   * DISPOSICIÓN (px de pantalla del mundo)
   * ===================================================================================== */
  const S = 0.3, SUELO = 560;
  const ENC = 336;                                       // encimera (tablero)
  const MW = { x0: 388, x1: 590, y0: 224, y1: 334 };      // microondas
  const PAN = { x0: 390, x1: 444 };                       // panel (a la izquierda)
  const PUERTA = { x0: 446, x1: 590, y0: 225, y1: 333 };  // puerta, bisagra a la derecha
  const CAV = { x0: 451, x1: 585, y0: 231, y1: 330 };     // hueco
  const PLATO = { x: 518, y: 324 };
  const TECLA9 = { x: PAN.x0 + 43, y: 285 }, BOTON = { x: (PAN.x0 + PAN.x1) / 2, y: 315 };
  const PY = rig => SUELO - (rig.SUELO - rig.PELVIS.y) * S * rig.K;
  const TOBY = rig => SUELO - rig.TOBILLO_ALTO * S * rig.K;

  /* =====================================================================================
   * PALOMITAS (sprites hechos una vez, 16 px a 4×)
   * ===================================================================================== */
  const SPR = [], SPR_S = [];
  function creaPalomitas() {
    for (const [lista, borde, sombra] of [[SPR, TINTA, "rgba(232,196,120,0.6)"], [SPR_S, "#b98c52", "rgba(236,204,140,0.55)"]])
    for (let v = 0; v < 8; v++) {
      const c = document.createElement("canvas"); c.width = c.height = 64; const g = c.getContext("2d");
      g.scale(4, 4); g.translate(8, 8);
      const n = 4 + (v % 3), lob = [];
      for (let i = 0; i < n; i++) {
        const a = i / n * Math.PI * 2 + hash(v * 13 + i) * 0.9, r = 2.4 + hash(v * 7 + i * 3) * 1.3;
        lob.push({ x: Math.cos(a) * r, y: Math.sin(a) * r * 0.85, r: 2.3 + hash(v * 5 + i * 11) * 1.2 });
      }
      lob.push({ x: 0.2, y: 0, r: 2.7 });
      const circ = (x, y, r) => { g.moveTo(x + r, y); g.arc(x, y, r, 0, Math.PI * 2); };
      g.fillStyle = borde; g.beginPath(); for (const l of lob) circ(l.x, l.y, l.r + 0.8); g.fill();
      g.fillStyle = "#fffaf0"; g.beginPath(); for (const l of lob) circ(l.x, l.y, l.r); g.fill();
      g.save(); g.beginPath(); for (const l of lob) circ(l.x, l.y, l.r); g.clip();
      g.fillStyle = sombra; g.beginPath(); g.ellipse(2.2, 3.2, 5.2, 3.6, 0.3, 0, Math.PI * 2); g.fill();
      g.strokeStyle = "rgba(190,150,90,0.55)"; g.lineWidth = 0.45;
      for (const l of lob) { g.beginPath(); g.arc(l.x, l.y, l.r * 0.95, 0.3, 1.6); g.stroke(); }
      g.restore();
      g.fillStyle = "#ffffff"; g.beginPath(); g.ellipse(-1.6, -2, 1.2, 0.8, -0.4, 0, Math.PI * 2); g.fill();
      // cascarilla dorada
      const hl = lob[v % n], ha = Math.atan2(hl.y, hl.x);
      g.save(); g.translate(Math.cos(ha) * 1.2, Math.sin(ha) * 1.2); g.rotate(ha);
      g.fillStyle = "#cf8d36"; g.strokeStyle = borde; g.lineWidth = 0.45;
      g.beginPath(); g.ellipse(0.5, 0, 1.5, 1.0, 0, 0, Math.PI * 2); g.fill(); g.stroke(); g.restore();
      lista.push(c);
    }
  }
  function palomita(g, x, y, s, v, rot, set) {
    const L = set || SPR, c = L[((v % L.length) + L.length) % L.length], w = 16 * s;
    if (!rot) { g.drawImage(c, x - w / 2, y - w / 2, w, w); return; }
    g.save(); g.translate(x, y); g.rotate(rot); g.drawImage(c, -w / 2, -w / 2, w, w); g.restore();
  }
  const TAM = 0.78;                                      // tamaño normal de una palomita (× 16 px)

  /* =====================================================================================
   * LA MONTAÑA (una imagen cacheada que sube desde el suelo)
   * ===================================================================================== */
  const SUP = [[112, 572], [146, 552], [178, 512], [204, 456], [224, 392], [240, 330], [252, 284], [264, 258], [280, 248], [300, 245], [320, 247], [342, 252], [366, 262],
    [398, 278], [436, 293], [478, 304], [520, 312], [556, 322], [584, 338], [604, 366], [618, 410], [628, 466], [636, 520], [644, 572]];
  function ySup(x) {
    if (x <= SUP[0][0]) return 600; if (x >= SUP[SUP.length - 1][0]) return 600;
    let i = 0; while (i < SUP.length - 2 && SUP[i + 1][0] < x) i++;
    const P = k => SUP[Math.max(0, Math.min(SUP.length - 1, k))][1];
    const u = (x - SUP[i][0]) / (SUP[i + 1][0] - SUP[i][0]), p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
    return 0.5 * ((2 * p1) + (-p0 + p2) * u + (2 * p0 - 5 * p1 + 4 * p2 - p3) * u * u + (-p0 + 3 * p1 - 3 * p2 + p3) * u * u * u);
  }
  const MON = { x0: 80, y0: 232, w: 570, h: 356, k: 1.5 }, PICO = 252, FONDO = 575, ALTO = FONDO - PICO + 8;
  let monton = null;
  function creaMonton() {
    const c = document.createElement("canvas"); c.width = MON.w * MON.k; c.height = MON.h * MON.k; const g = c.getContext("2d");
    g.scale(MON.k, MON.k); g.translate(-MON.x0, -MON.y0);
    const forma = () => { g.beginPath(); g.moveTo(SUP[0][0], 576); for (let x = SUP[0][0]; x <= SUP[SUP.length - 1][0]; x += 3) g.lineTo(x, Math.min(576, ySup(x) + 4)); g.lineTo(SUP[SUP.length - 1][0], 576); g.closePath(); };
    forma(); g.fillStyle = "#f6e4b0"; g.fill();
    g.save(); forma(); g.clip();
    // relleno de palomitas, de abajo arriba
    let s = 1;
    for (let y = 582; y > 240; y -= 8) {
      for (let x = 90; x < 648; x += 9.2) {
        s++; const xx = x + (hash(s * 1.7) - 0.5) * 7 + (Math.round(y) % 2 ? 4 : 0), yy = y + (hash(s * 2.3) - 0.5) * 6;
        if (yy < ySup(xx) + 3) continue;
        palomita(g, xx, yy, TAM * (1.0 + 0.3 * hash(s * 3.1)), Math.floor(hash(s * 4.7) * 8), (hash(s * 5.3) - 0.5) * 2, SPR_S);
      }
    }
    // sombra hacia abajo y hacia los bordes
    const gr = g.createLinearGradient(0, 250, 0, 580); gr.addColorStop(0, "rgba(160,100,30,0)"); gr.addColorStop(0.6, "rgba(150,95,30,0.06)"); gr.addColorStop(1, "rgba(110,60,20,0.24)");
    g.globalCompositeOperation = "source-atop"; g.fillStyle = gr; g.fillRect(80, 230, 580, 360);
    g.globalCompositeOperation = "source-over";
    g.restore();
    // borde de arriba: palomitas que asoman (silueta irregular)
    for (let x = SUP[0][0] + 4, i = 0; x < SUP[SUP.length - 1][0] - 2; x += 6.2, i++) {
      const y = ySup(x); if (y > 572) continue;
      palomita(g, x + (hash(i * 9.1) - 0.5) * 3, y + 1 + hash(i * 3.7) * 3, TAM * (0.9 + 0.25 * hash(i * 1.3)), i * 3 + 1, (hash(i * 6.1) - 0.5) * 2.4);
    }
    return c;
  }
  const nivel = t => tramo(t, T.sube0, T.sube1, salida);
  const ySupT = (x, t) => ySup(x) + (1 - nivel(t)) * ALTO;          // superficie de la montaña en el instante t
  const SUELO_P = x => 548 + 22 * hash(x * 0.37 + 4.1);               // suelo donde caen las sueltas (profundidad)

  /* =====================================================================================
   * PALOMITAS SUELTAS (trayectorias precalculadas)
   * ===================================================================================== */
  const BOCA_MW = { x: 517, y: 284 };
  let sueltas = null;
  function creaSueltas() {
    const L = [], GR = 980;
    const n = 230;
    for (let i = 0; i < n; i++) {
      const r = k => hash(i * 17.3 + k * 3.1);
      const t0 = T.bum + 0.02 + 1.15 * Math.pow(r(1), 1.6);
      const der = r(2) < 0.12;
      const vx = der ? 70 + 230 * r(3) : -(90 + 380 * r(3) * (1 - 0.35 * fase(t0, T.bum, T.bum + 1.2)));
      const vy = -(80 + 330 * r(4));
      const x0 = BOCA_MW.x + (r(5) - 0.5) * 70, y0 = BOCA_MW.y + (r(6) - 0.5) * 50;
      // aterriza contra la montaña que sube (o contra el suelo)
      let tl = null, xl = 0, yl = 0;
      for (let k = 1; k < 240; k++) {
        const tau = k / 120, x = x0 + vx * tau, y = y0 + vy * tau + 0.5 * GR * tau * tau, tt = t0 + tau;
        const lim = Math.min(ySupT(x, tt) + 3, SUELO_P(x));
        if (vy + GR * tau > 0 && y >= lim) { tl = tt; xl = x; yl = lim; break; }
      }
      if (tl == null) continue;
      L.push({ t0, x0, y0, vx, vy, tl, xl, yl, v: i % 8, s: TAM * (0.85 + 0.3 * r(7)), w: (r(8) - 0.5) * 18 });
    }
    // las que saltan a la derecha y se quedan en el suelo (Marta pasa por encima)
    const SUELO_D = [[690, 556], [706, 566], [722, 553], [741, 563], [757, 551], [771, 567], [732, 571], [700, 548]];
    SUELO_D.forEach(([xl, yl], i) => {
      const t0 = T.bum + 0.05 + i * 0.07, Tf = 0.75 + 0.1 * hash(i * 2.2);
      L.push({ t0, x0: 520 + i * 3, y0: 288, arco: true, Tf, tl: t0 + Tf, xl, yl, v: i + 2, s: TAM, w: 9 + i, alto: 120 + 30 * hash(i * 5.5) });
    });
    return L;
  }
  function dibSueltas(g, t) {
    for (const q of sueltas) {
      if (t < q.t0) continue;
      let x, y, rot;
      if (t < q.tl) {
        const tau = t - q.t0;
        if (q.arco) { const u = tau / q.Tf; x = lerp(q.x0, q.xl, u); y = lerp(q.y0, q.yl, u) - q.alto * 4 * u * (1 - u); }
        else { x = q.x0 + q.vx * tau; y = q.y0 + q.vy * tau + 0.5 * 980 * tau * tau; }
        rot = q.w * tau;
        if (!q.arco && y > ySupT(x, t) + 4) continue;           // ya dentro de la montaña
      } else {
        // botecito al aterrizar y luego quieta
        const b = t - q.tl, bote = b < 0.22 ? 7 * Math.sin(Math.PI * b / 0.22) * (q.arco ? 1 : 0.6) : 0;
        x = q.xl + (b < 0.22 ? (q.vx || 30) * 0.03 * b / 0.22 : (q.vx || 30) * 0.03); y = q.yl - bote; rot = q.w * (q.tl - q.t0) + (b < 0.22 ? q.w * 0.1 * b : q.w * 0.022);
        if (!q.arco && y > ySupT(x, t) + 3 && q.yl < SUELO_P(q.xl) - 1) continue;   // tapada por la montaña que sube
        if (!q.arco && q.yl >= SUELO_P(q.xl) - 1 && ySupT(x, t) < q.yl - 2) continue;
      }
      palomita(g, x, y, q.s, q.v, rot);
    }
  }
  // racimos grandes que salen primero (la «ola»)
  let racimo = null;
  function creaRacimo() {
    const c = document.createElement("canvas"); c.width = c.height = 160; const g = c.getContext("2d");
    g.translate(80, 80); g.scale(2, 2);
    for (let i = 0; i < 46; i++) {
      const a = hash(i * 3.3) * Math.PI * 2, r = Math.sqrt(hash(i * 7.7)) * 24;
      palomita(g, Math.cos(a) * r, Math.sin(a) * r * 0.85, TAM * (0.9 + 0.3 * hash(i * 1.9)), i, hash(i * 2.9) * 6);
    }
    return c;
  }
  const RACIMOS = [[-330, -260, 0.0, 1.0], [-250, -340, 0.04, 0.85], [-420, -180, 0.07, 0.9], [-180, -230, 0.1, 0.75], [-300, -120, 0.15, 0.8], [-140, -320, 0.2, 0.7]];
  function dibRacimos(g, t) {
    RACIMOS.forEach(([vx, vy, dt, s], i) => {
      const t0 = T.bum + dt, tau = t - t0; if (tau < 0 || tau > 0.9) return;
      const x = BOCA_MW.x - 10 + vx * tau, y = BOCA_MW.y + vy * tau + 0.5 * 980 * tau * tau;
      if (y > ySupT(x, t) + 10 && tau > 0.15) return;
      const k = s * (0.45 + 0.55 * salida(tau / 0.25)), w = 80 * k;
      g.save(); g.translate(x, y); g.rotate(-0.8 * tau * (i % 2 ? 1 : -1)); g.drawImage(racimo, -w / 2, -w / 2, w, w); g.restore();
    });
  }

  /* =====================================================================================
   * EL SOBRE DE PALOMITAS (rayas rojas y blancas, sin letras)
   * ===================================================================================== */
  // b = { x, y (centro), w, h, ang, hinchado 0…1, roto 0…1 }
  function dibSobre(g, b) {
    g.save(); g.translate(b.x, b.y); g.rotate(b.ang || 0); g.lineJoin = "round"; g.lineCap = "round";
    const w = b.w / 2, h = b.h / 2, hi = b.hinchado || 0, ab = 1.2 + 5 * hi;
    const ruta = () => {
      g.beginPath(); g.moveTo(-w, -h + 1);
      g.quadraticCurveTo(0, -h - ab, w, -h + 1); g.quadraticCurveTo(w + ab, 0, w, h - 1);
      g.quadraticCurveTo(0, h + ab * 0.8, -w, h - 1); g.quadraticCurveTo(-w - ab, 0, -w, -h + 1); g.closePath();
    };
    ruta(); g.fillStyle = "#fbf6ec"; g.fill();
    g.save(); ruta(); g.clip();
    g.fillStyle = "#d8382e"; const paso = Math.max(4, b.w / 7);
    for (let x = -w - 4; x < w + 4; x += paso * 2) { g.beginPath(); g.moveTo(x, -h - 9); g.lineTo(x + paso, -h - 9); g.lineTo(x + paso + 2 * hi, h + 9); g.lineTo(x + 2 * hi, h + 9); g.closePath(); g.fill(); }
    // brillo y sombra (volumen al hincharse)
    g.fillStyle = `rgba(255,255,255,${0.25 + 0.3 * hi})`; g.beginPath(); g.ellipse(-w * 0.35, -h * 0.35, w * 0.35, h * 0.28, -0.3, 0, Math.PI * 2); g.fill();
    g.fillStyle = `rgba(80,20,10,${0.12 + 0.18 * hi})`; g.beginPath(); g.ellipse(w * 0.3, h * 0.45, w * 0.8, h * 0.5, 0, 0, Math.PI * 2); g.fill();
    // pliegue central (sobre plano) y escudo de palomita dibujado
    if (hi < 0.6) { g.strokeStyle = `rgba(120,40,30,${0.5 * (1 - hi / 0.6)})`; g.lineWidth = 0.8; g.beginPath(); g.moveTo(-w * 0.9, 0); g.lineTo(w * 0.9, 0); g.stroke(); }
    g.restore();
    g.fillStyle = "#ffd64a"; g.strokeStyle = TINTA; g.lineWidth = 0.9;
    g.beginPath(); g.arc(0, 0, Math.min(w, h) * 0.42, 0, Math.PI * 2); g.fill(); g.stroke();
    g.fillStyle = "#fffaf0"; for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(-Math.min(w, h) * 0.18 + i * Math.min(w, h) * 0.18, -1 + (i % 2) * 2, Math.min(w, h) * 0.15, 0, Math.PI * 2); g.fill(); }
    ruta(); g.lineWidth = 1.4; g.strokeStyle = TINTA; g.stroke();
    g.restore();
  }

  /* =====================================================================================
   * MICROONDAS
   * ===================================================================================== */
  // ángulo de la puerta (rad): entreabierta al principio, se cierra de un empujón, revienta
  const A0 = 0.9;
  function anguloPuerta(t) {
    if (t < T.cierra0 + 0.06) return A0;
    if (t < T.slam) return A0 * (1 - entrada(fase(t, T.cierra0 + 0.06, T.slam)));
    if (t < T.bum) return Math.max(0, 0.05 * Math.sin(Math.PI * fase(t, T.slam, T.slam + 0.12)));
    const tau = t - T.bum;
    if (tau < 0.09) return 2.7 * salida(tau / 0.09);
    return 2.27 + 0.43 * Math.exp(-5 * (tau - 0.09)) * Math.cos(13 * (tau - 0.09));
  }
  // el sobre: en vuelo, en el plato (gira con él) y hinchándose
  const SOBRE_MANO = { w: 40, h: 28 }, MANO_SOBRE = { x: 370, y: 268 };
  const centroSobre = m => ({ x: m.x + 8, y: m.y + 16 });
  function sobre(t) {
    const P0 = centroSobre(MANO_SOBRE), P1 = { x: 478, y: PLATO.y - 1 - SOBRE_MANO.h / 2 };
    if (t < T.lanza) return null;
    if (t < T.aterriza) {
      const u = fase(t, T.lanza, T.aterriza);
      return { x: lerp(P0.x, P1.x, u), y: lerp(P0.y, P1.y, u) - 95 * 4 * u * (1 - u), w: SOBRE_MANO.w, h: SOBRE_MANO.h, ang: 0.12 - 2 * Math.PI * u, vuelo: true };
    }
    const b = t - T.aterriza;
    const bote = b < 0.2 ? 6 * Math.sin(Math.PI * b / 0.2) : 0;
    const plano = tramo(t, T.aterriza, T.aterriza + 0.12);          // cae plano sobre el plato
    const gira = t > T.start ? (t - T.start) * 1.6 : 0;
    let hi = 0;
    if (t > T.pop0) { const u = fase(t, T.pop0, T.lleno); hi = clamp(u + 0.04 * Math.sin(u * 40) * u + 0.05 * Math.pow(Math.abs(Math.sin(t * 9)), 8) * (1 - u)); }
    const ap = tramo(t, T.lleno, T.bum - 0.04);
    const off = 24 * Math.sin(gira) * (1 - hi);
    const anch = gira > 0 ? 0.84 + 0.16 * Math.abs(Math.cos(gira)) : 1;
    const w = lerp(lerp(SOBRE_MANO.w, 52, plano), 116, hi) + 12 * ap, h = lerp(lerp(SOBRE_MANO.h, 12, plano), 80, hi) + 10 * ap;
    const yb = PLATO.y - 1 - h / 2;
    return { x: lerp(P1.x, PLATO.x, tramo(t, T.start, T.start + 0.9)) + off, y: yb - bote, w: w * lerp(1, anch, 1 - hi), h, ang: lerp(0.12 - 2 * Math.PI, -2 * Math.PI, plano) + 0.03 * Math.sin(gira * 2) * (1 - ap), hinchado: hi, aprieta: ap };
  }
  function cifra7(g, ch, x, y, w, h) {
    const S7 = { "0": "abcdef", "1": "bc", "2": "abged", "3": "abgcd", "4": "fgbc", "5": "afgcd", "6": "afgedc", "7": "abc", "8": "abcdefg", "9": "abcfgd" };
    if (ch === ":") { g.fillRect(x + w * 0.35, y + h * 0.26, w * 0.3, w * 0.3); g.fillRect(x + w * 0.35, y + h * 0.64, w * 0.3, w * 0.3); return; }
    const s = S7[ch]; if (!s) return; const e = Math.max(1, w * 0.2);
    const seg = { a: [x + e, y, w - 2 * e, e], g: [x + e, y + h / 2 - e / 2, w - 2 * e, e], d: [x + e, y + h - e, w - 2 * e, e],
      f: [x, y + e, e, h / 2 - e], b: [x + w - e, y + e, e, h / 2 - e], e: [x, y + h / 2, e, h / 2 - e], c: [x + w - e, y + h / 2, e, h / 2 - e] };
    for (const k of s) g.fillRect(...seg[k]);
  }
  function textoPantalla(t) {
    const tk = T.teclas;
    if (t < tk[0]) return { txt: "21:47", luz: 0.75 };
    if (t < tk[1]) return { txt: "    9", luz: 1 };
    if (t < tk[2]) return { txt: "   99", luz: 1 };
    if (t < tk[3]) return { txt: " 9:99", luz: 1 };
    if (t < T.start) return { txt: "99:99", luz: 1 };
    const seg = Math.floor(Math.min(t, T.bum) - T.start), r = 99 - seg;
    const txt = "99:" + String(r).padStart(2, "0");
    if (t < T.tiembla) return { txt, luz: 1 };
    if (t < T.bum) return { txt, luz: 0.6 + 0.4 * Math.abs(Math.sin(t * 40)) };
    return { txt, luz: Math.sin((t - T.bum) * 6) > -0.2 ? 1 : 0.15 };
  }
  function encendido(t) { return t >= T.start + 0.04 && t < T.bum; }
  // temblor del microondas (px)
  function tembleque(t) {
    const a = 0.5 * dentro(t, T.lleno, T.lleno + 0.2, T.bum, T.bum + 0.01) + 2.2 * tramo(t, T.tiembla, T.bum - 0.02) * (t < T.bum ? 1 : 0)
      + 0.7 * dentro(t, T.slam, T.slam + 0.02, T.slam + 0.06, T.slam + 0.22);
    return { x: a * ruido(t * 31), y: a * 0.6 * ruido(t * 29 + 7) };
  }
  function dibMicroondas(g, t) {
    const tb = tembleque(t);
    const abombe = tramo(t, T.aprieta, T.bum - 0.02) * (t < T.bum ? 1 : 0);
    const cx = (MW.x0 + MW.x1) / 2;
    g.save(); g.translate(tb.x, tb.y); g.lineJoin = "round"; g.lineCap = "round";
    // sombra en la encimera
    g.fillStyle = "rgba(60,40,20,0.25)"; g.beginPath(); g.ellipse(cx - tb.x, ENC + 1, 108, 4.5, 0, 0, Math.PI * 2); g.fill();
    // carcasa
    const gr = g.createLinearGradient(0, MW.y0, 0, MW.y1); gr.addColorStop(0, "#eef0f2"); gr.addColorStop(1, "#b9c0c6");
    g.fillStyle = gr; g.beginPath(); rectanguloRedondeado(g, MW.x0, MW.y0, MW.x1 - MW.x0, MW.y1 - MW.y0, 7); g.fill();
    g.strokeStyle = TINTA; g.lineWidth = 2.2; g.stroke();
    g.fillStyle = "rgba(255,255,255,0.6)"; g.fillRect(MW.x0 + 8, MW.y0 + 2, MW.x1 - MW.x0 - 16, 2);
    // patitas
    g.fillStyle = "#3a3f44"; g.fillRect(MW.x0 + 10, MW.y1 - 1, 12, 3); g.fillRect(MW.x1 - 22, MW.y1 - 1, 12, 3);
    // rejilla de ventilación arriba
    g.strokeStyle = "rgba(60,66,72,0.5)"; g.lineWidth = 1.2; for (let x = MW.x0 + 70; x < MW.x0 + 130; x += 6) { g.beginPath(); g.moveTo(x, MW.y0 + 4); g.lineTo(x + 3, MW.y0 + 4); g.stroke(); }
    // hueco (con luz si está encendido o abierto)
    const ang = anguloPuerta(t), abierta = clamp(ang / 0.25);
    const luz = Math.max(encendido(t) ? 1 : 0, abierta);
    const cw = CAV.x1 - CAV.x0, chh = CAV.y1 - CAV.y0, ccx = (CAV.x0 + CAV.x1) / 2;
    g.save(); g.beginPath(); g.rect(CAV.x0, CAV.y0, cw, chh); g.clip();
    g.fillStyle = "#4b4f54"; g.fillRect(CAV.x0, CAV.y0, cw, chh);
    if (luz > 0.01) { g.globalAlpha = luz; const gl = g.createRadialGradient(ccx, CAV.y0 + 10, 6, ccx, CAV.y0 + 50, 95); gl.addColorStop(0, "#fff3c4"); gl.addColorStop(1, "#c9a659"); g.fillStyle = gl; g.fillRect(CAV.x0, CAV.y0, cw, chh); g.globalAlpha = 1; }
    // paredes interiores (perspectiva)
    g.fillStyle = "rgba(0,0,0,0.16)"; g.beginPath(); g.moveTo(CAV.x0, CAV.y0); g.lineTo(CAV.x0 + 13, CAV.y0 + 10); g.lineTo(CAV.x0 + 13, CAV.y1 - 12); g.lineTo(CAV.x0, CAV.y1); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(CAV.x1, CAV.y0); g.lineTo(CAV.x1 - 13, CAV.y0 + 10); g.lineTo(CAV.x1 - 13, CAV.y1 - 12); g.lineTo(CAV.x1, CAV.y1); g.closePath(); g.fill();
    g.fillStyle = "rgba(0,0,0,0.1)"; g.fillRect(CAV.x0 + 13, CAV.y0, cw - 26, 10);
    // plato giratorio
    const gira = t > T.start ? (t - T.start) * 1.6 : 0;
    g.fillStyle = "rgba(255,255,255,0.55)"; g.strokeStyle = "rgba(40,40,40,0.5)"; g.lineWidth = 1;
    g.beginPath(); g.ellipse(PLATO.x, PLATO.y, 52, 6, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    g.fillStyle = "rgba(120,110,90,0.5)"; g.beginPath(); g.ellipse(PLATO.x + 42 * Math.sin(gira), PLATO.y + 2 * Math.cos(gira), 4, 1.4, 0, 0, Math.PI * 2); g.fill();
    // sobre
    const b = sobre(t);
    if (b && !b.vuelo && t < T.bum) dibSobre(g, b);
    // palomitas dentro después de reventar
    if (t >= T.bum) {
      const ll = tramo(t, T.bum, T.bum + 0.15);
      for (let i = 0; i < 40; i++) palomita(g, CAV.x0 + 6 + (i * 37) % (cw - 8), CAV.y1 - 5 - Math.floor(i / 8) * 11 * ll + (hash(i) - 0.5) * 4, TAM * 1.05, i, hash(i * 3) * 5);
      // jirones del sobre colgando
      g.fillStyle = "#d8382e"; g.strokeStyle = TINTA; g.lineWidth = 1.2;
      g.beginPath(); g.moveTo(CAV.x0 + 24, CAV.y0 + 30); g.lineTo(CAV.x0 + 44, CAV.y0 + 24); g.lineTo(CAV.x0 + 38, CAV.y0 + 50); g.lineTo(CAV.x0 + 30, CAV.y0 + 42); g.closePath(); g.fill(); g.stroke();
      g.fillStyle = "#fbf6ec"; g.beginPath(); g.moveTo(CAV.x0 + 78, CAV.y0 + 20); g.lineTo(CAV.x0 + 100, CAV.y0 + 24); g.lineTo(CAV.x0 + 92, CAV.y0 + 40); g.closePath(); g.fill(); g.stroke();
    }
    g.restore();
    // panel (izquierda)
    g.fillStyle = "#2f3438"; g.beginPath(); rectanguloRedondeado(g, PAN.x0, MW.y0 + 3, PAN.x1 - PAN.x0, MW.y1 - MW.y0 - 6, 4); g.fill();
    // pantalla
    const pt = textoPantalla(t);
    g.fillStyle = "#0d1a12"; g.fillRect(PAN.x0 + 4, MW.y0 + 8, PAN.x1 - PAN.x0 - 8, 19);
    g.fillStyle = `rgba(120,255,160,${0.95 * pt.luz})`;
    const dw = 7.4, dh = 12.5; let x = PAN.x0 + 6.5;
    for (const c of pt.txt) { if (c === ":") { cifra7(g, ":", x - 1.2, MW.y0 + 11.5, 4, dh); x += 3.2; continue; } if (c !== " ") cifra7(g, c, x, MW.y0 + 11.5, dw - 1.8, dh); x += dw + 0.6; }
    g.fillStyle = "rgba(255,255,255,0.12)"; g.fillRect(PAN.x0 + 4, MW.y0 + 8, PAN.x1 - PAN.x0 - 8, 5);
    // teclado 3×4
    const pulsa = pulsacion(t);
    for (let f = 0; f < 4; f++) for (let k = 0; k < 3; k++) {
      const bx = PAN.x0 + 5 + k * 15.5, by = MW.y0 + 32 + f * 12, hund = (f === 2 && k === 2) ? pulsa.k9 : 0;
      g.fillStyle = hund > 0.1 ? "#9aa3ab" : "#c9d0d6"; g.fillRect(bx, by + hund, 13, 9 - hund * 0.5);
      g.fillStyle = "rgba(20,24,28,0.7)"; g.fillRect(bx + 5, by + 3 + hund, 3, 3);
    }
    // botón de arranque
    g.fillStyle = pulsa.st > 0.1 ? "#2f9a52" : "#48c26f"; g.beginPath(); rectanguloRedondeado(g, PAN.x0 + 5, MW.y1 - 25 + pulsa.st * 1.2, PAN.x1 - PAN.x0 - 10, 13 - pulsa.st, 3); g.fill();
    g.strokeStyle = TINTA; g.lineWidth = 0.9; g.stroke();
    g.fillStyle = "#e9fff0"; const bc = (PAN.x0 + PAN.x1) / 2; g.beginPath(); g.moveTo(bc - 3, MW.y1 - 22 + pulsa.st); g.lineTo(bc + 4, MW.y1 - 18.5 + pulsa.st); g.lineTo(bc - 3, MW.y1 - 15 + pulsa.st); g.closePath(); g.fill();
    // puerta
    dibPuerta(g, t, ang, abombe);
    g.restore();
  }
  function pulsacion(t) {
    let k9 = 0; for (const tk of T.teclas) k9 = Math.max(k9, campana(t, tk - 0.065, tk + 0.065));
    return { k9: 1.5 * k9, st: 2 * campana(t, T.start - 0.085, T.start + 0.085) };
  }
  // puerta con bisagra a la derecha: a = 0 cerrada; > π/2 se ve por dentro
  function dibPuerta(g, t, a, abombe) {
    const P = PUERTA, w = P.x1 - P.x0, yc = (P.y0 + P.y1) / 2, hh = (P.y1 - P.y0) / 2;
    const xf = P.x1 - w * Math.cos(a), ky = 1 + 0.16 * Math.sin(a);
    const q = (u, v) => ({ x: lerp(xf, P.x1, u), y: yc + v * hh * lerp(ky, 1, u) });     // u 0 borde libre, 1 bisagra; v −1…1
    g.save(); g.lineJoin = "round";
    const dentro_ = a > Math.PI / 2;
    const traza = (u0, u1, v0, v1) => { const A = q(u0, v0), B = q(u1, v0), C = q(u1, v1), Dd = q(u0, v1); g.moveTo(A.x, A.y); g.lineTo(B.x, B.y); g.lineTo(C.x, C.y); g.lineTo(Dd.x, Dd.y); g.closePath(); };
    const quad = (u0, u1, v0, v1) => { g.beginPath(); traza(u0, u1, v0, v1); };
    if (abombe > 0.001) { const cx = (P.x0 + P.x1) / 2; g.translate(cx, yc); g.scale(1 + 0.05 * abombe, 1 + 0.07 * abombe); g.translate(-cx, -yc); }
    const wu0 = 0.08, wu1 = 0.9, wv = 0.8;
    const cerrada = !dentro_ && a < 0.12;
    // marco (con el hueco de la ventana cuando está cerrada: se ve el interior)
    g.beginPath(); traza(0, 1, -1, 1); if (cerrada) traza(wu0, wu1, -wv, wv);
    g.fillStyle = dentro_ ? "#c5ccd2" : "#e3e6e9"; g.fill("evenodd");
    g.strokeStyle = TINTA; g.lineWidth = 2; quad(0, 1, -1, 1); g.stroke();
    if (abombe > 0.001) {         // brillo combado del cristal que empuja
      g.save(); quad(wu0, wu1, -wv, wv); g.clip(); g.fillStyle = `rgba(255,255,255,${0.25 * abombe})`; g.beginPath(); g.ellipse((P.x0 + P.x1) / 2, yc, 40, 26, 0, 0, Math.PI * 2); g.fill(); g.restore();
    }
    quad(wu0, wu1, -wv, wv);
    if (cerrada) {
      // cristal ahumado con la rejilla de puntitos: deja ver el sobre
      g.fillStyle = "rgba(20,26,30,0.22)"; g.fill();
      g.save(); quad(wu0, wu1, -wv, wv); g.clip();
      g.fillStyle = "rgba(10,12,14,0.22)";
      for (let y = P.y0 + 8; y < P.y1 - 6; y += 3.4) for (let x = P.x0 + 10 + ((y | 0) % 2 ? 1.7 : 0); x < P.x1 - 8; x += 3.4) g.fillRect(x, y, 1, 1);
      g.fillStyle = "rgba(255,255,255,0.2)"; g.beginPath(); g.moveTo(P.x0 + 20, P.y0 + 10); g.lineTo(P.x0 + 40, P.y0 + 10); g.lineTo(P.x0 + 22, P.y1 - 12); g.lineTo(P.x0 + 14, P.y1 - 12); g.closePath(); g.fill();
      g.restore();
    } else {
      g.fillStyle = dentro_ ? "#7f8a92" : "#3d474e"; g.fill();
      g.save(); quad(wu0, wu1, -wv, wv); g.clip(); g.fillStyle = "rgba(255,255,255,0.18)"; quad(wu0 + 0.05, wu0 + 0.25, -wv, wv); g.fill(); g.restore();
    }
    g.strokeStyle = TINTA; g.lineWidth = 1.3; quad(wu0, wu1, -wv, wv); g.stroke();
    // asa (borde libre, por fuera)
    if (!dentro_) { g.fillStyle = "#9aa3ab"; quad(0.0, 0.05, -0.62, 0.62); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 1; g.stroke(); }
    else { g.strokeStyle = "rgba(40,40,40,0.5)"; g.lineWidth = 1.6; quad(0.04, 0.96, -0.94, 0.94); g.stroke(); }
    g.restore();
  }

  /* =====================================================================================
   * MANOS
   * ===================================================================================== */
  let BASE_M = null;
  function conCamara(g, f) { g.save(); g.setTransform(BASE_M); f(); g.restore(); }
  const evalua = (o, t) => (typeof o === "function" ? o(t) : o);
  function pista(lista, t, bolsilloPant) {
    const destino = obj => { const q = evalua(obj, t); return q.bol === 1 ? { ...q, ...bolsilloPant } : q; };
    let c = Object.assign({}, destino(lista[0][2]));
    for (let i = 1; i < lista.length; i++) {
      const [t0, t1, obj, f] = lista[i]; if (t <= t0) break;
      const o = destino(obj), k = (f || suave)(fase(t, t0, t1));
      c = { x: lerp(c.x, o.x, k), y: lerp(c.y, o.y, k), d: mezclaD(c.d, o.d || c.d, k), mo: lerp(c.mo || 0, o.mo ?? (c.mo || 0), k), bol: lerp(c.bol || 0, o.bol || 0, k) };
    }
    return c;
  }
  const muHacia = (m, h, off) => Math.atan2(h.y - m.y, h.x - m.x) + off;
  function manoRig(rig, p, m, lado, dobla, objeto) {
    const h = rig.aHoja(p, m), hom = rig.tronco(p)(lado === "cerca" ? rig.HOMBRO_C : rig.HOMBRO);
    const k = clamp(m.bol || 0);
    const mu0 = muHacia(h, hom, (m.mo || 0)), x = h.x, y = h.y;
    return { x, y, ang: 0, mu: lerpAng(mu0, -1.75, k), puno: 1 - k, dedos: m.d, dobla, objeto: k < 0.5 ? objeto : null };
  }
  const R_MG = G.MUNECA_R * G.JK;
  const manoDesde = (m, mu) => ({ x: m.x - Math.cos(mu) * R_MG, y: m.y - Math.sin(mu) * R_MG });
  const BOLS_GC = manoDesde({ x: 131, y: 652 }, -1.75), BOLS_GL = manoDesde({ x: 372, y: 648 }, -1.75);
  // la yema del índice en `punta` (pantalla) con el dedo apuntando desde el hombro
  function offsetIndice(rig, mu) {
    const a = mu + Math.PI / 2, c = Math.cos(a), sn = Math.sin(a);
    return { x: rig.JK * (8.4 * c - 18.9 * sn), y: rig.JK * (8.4 * sn + 18.9 * c) };
  }
  function yema(rig, p, punta, lado) {
    const h = rig.tronco(p)(lado === "cerca" ? rig.HOMBRO_C : rig.HOMBRO), q = rig.aHoja(p, punta);
    const mu = Math.atan2(h.y - q.y, h.x - q.x), off = offsetIndice(rig, mu), palma = { x: q.x - off.x, y: q.y - off.y };
    const giro = mu - Math.atan2(h.y - palma.y, h.x - palma.x);
    return { ...rig.aPantalla(p, palma), mo: Math.atan2(Math.sin(giro), Math.cos(giro)), d: SENALA };
  }

  /* =====================================================================================
   * GUILLERMO
   * ===================================================================================== */
  const CARAS_G = {
    inicio: E({ mx: 0.6, my: 0.55, c: 0.3, sd: 8, gd: 0.04, si: 10, gi: 0.04, sonr: 0.6, ancho: 1 }),
    camara: E({ mx: -0.85, my: 0, c: 0.4, sd: 18, gd: 0.06, si: 4, gi: -0.02, sonr: 0.85, ancho: 1.05 }),
    apunta: E({ mx: 0.9, my: 0.2, c: 0.45, sd: 4, gd: -0.06, si: 4, gi: -0.06, abre: 6, ancho: 0.8, sonr: 0.3, lengua: 1 }),
    si: E({ mx: 0.4, my: 0, c: 1, h: 1, sd: 18, gd: 0.06, si: 18, gi: 0.06, abre: 18, ancho: 1.1, sonr: 1 }),
    decidido: E({ mx: 0.85, my: 0.35, c: 0.3, sd: 6, gd: -0.04, si: 8, gi: 0, sonr: 0.55, ancho: 1 }),
    teclea: E({ mx: 0.75, my: 0.55, c: 0.38, sd: 10, gd: 0.02, si: 12, gi: 0.04, sonr: 0.75, ancho: 1.02, abre: 3, lengua: 1 }),
    chulo: E({ mx: -0.85, my: 0, c: 0.42, sd: 16, gd: 0.06, si: 16, gi: 0.06, abre: 2, ancho: 1.05, sonr: 0.85 }),
    mira: E({ mx: 0.9, my: 0.3, c: 0.1, sd: 20, gd: 0.08, si: 20, gi: 0.08, sonr: 0.4, abre: 4, ancho: 0.8 }),
    ilusion: E({ mx: 0.9, my: 0.35, c: 0, iris: 1.1, sd: 22, gd: 0.06, si: 22, gi: 0.06, sonr: 0.95, abre: 12, ancho: 1.05 }),
    duda: E({ mx: 0.9, my: 0.35, iris: 0.9, c: 0, sd: 22, gd: 0.2, si: 22, gi: 0.2, sonr: -0.1, abre: 6, ancho: 0.7 }),
    miedo: E({ mx: 0.9, my: 0.3, iris: 0.78, c: 0, sd: 30, gd: 0.24, si: 30, gi: 0.24, abre: 14, ancho: 0.55, sonr: -0.35 }),
    susto: E({ mx: 0, my: 0, c: 1, z: 1, sd: 10, gd: 0.18, si: 10, gi: 0.18, abre: 24, ancho: 0.9, sonr: -0.5 }),
    grita: E({ mx: 0.3, my: -0.7, iris: 0.78, c: 0, sd: 32, gd: 0.22, si: 32, gi: 0.22, abre: 30, ancho: 0.8, sonr: -0.4 }),
    tapado: E({ mx: 0.1, my: 0.2, c: 0.55, sd: 6, gd: 0.04, si: 6, gi: 0.04, abre: 3, ancho: 0.7, sonr: -0.1 }),
    serio: E({ mx: -0.85, my: 0, c: 0.5, sd: -2, gd: -0.04, si: -2, gi: -0.04, abre: 0, ancho: 0.75, sonr: -0.15 }),
    miraM: E({ mx: 0.9, my: 0.1, c: 0.3, sd: 12, gd: 0.04, si: 12, gi: 0.04, sonr: 0, ancho: 0.8 }),
    hambre: E({ mx: 0.9, my: 0.05, c: 0.12, sd: 18, gd: 0.12, si: 18, gi: 0.12, abre: 9, ancho: 0.7, sonr: 0.1, lengua: 1 }),
    abre: E({ mx: 0.85, my: -0.65, c: 0, iris: 1.05, sd: 22, gd: 0.08, si: 22, gi: 0.08, abre: 30, ancho: 0.9, sonr: 0.3, lengua: 1 }),
    mastica: E({ mx: 0.4, my: 0, c: 1, h: 1, sd: 16, gd: 0.06, si: 16, gi: 0.06, sonr: 0.8, ancho: 0.9, mof: 0.45, rub: 0.3 }),
    final: E({ mx: -0.85, my: 0, c: 0.32, h: 0.5, sd: 16, gd: 0.06, si: 16, gi: 0.06, sonr: 0.95, ancho: 1, mof: 0.3, rub: 0.4 })
  };
  const GUION_CARA_G = [
    [T.gCamara - 0.05, T.gCamara + 0.15, "camara"], [T.carga - 0.12, T.carga, "apunta"], [T.siPuno - 0.05, T.siPuno + 0.08, "si"],
    [T.anda0, T.anda0 + 0.2, "decidido"], [T.dedo - 0.1, T.dedo + 0.1, "teclea"], [T.aparta0, T.aparta0 + 0.2, "decidido"],
    [T.chulo - 0.08, T.chulo + 0.12, "chulo"], [T.gMira - 0.05, T.gMira + 0.12, "mira"], [T.ilusion, T.ilusion + 0.2, "ilusion"],
    [T.gDuda, T.gDuda + 0.25, "duda"], [T.tiembla - 0.05, T.tiembla + 0.15, "miedo"], [T.bum - 0.02, T.bum + 0.06, "susto"],
    [T.brazos0 + 0.05, T.brazos0 + 0.15, "grita"], [T.hunde, T.hunde + 0.2, "tapado"], [T.gSerio - 0.06, T.gSerio + 0.14, "serio"],
    [T.mEntra0 + 0.3, T.mEntra0 + 0.55, "miraM"], [T.coge + 0.05, T.coge + 0.25, "hambre"], [T.mLanza + 0.04, T.mLanza + 0.16, "abre"],
    [T.atrapa - 0.02, T.atrapa + 0.08, "mastica"], [T.gCamaraF - 0.05, T.gCamaraF + 0.2, "final"]
  ];
  const CUERPOS_G = {
    inicio: { torso: 0.03, cab: 0.06 }, camara: { torso: -0.02, cab: -0.06 }, carga: { torso: -0.08, cab: -0.04 }, lanza: { torso: 0.08, cab: -0.02 },
    si: { torso: 0.04, cab: 0.08 }, anda: { torso: 0.05, cab: 0.04 }, empuja: { torso: 0.14, cab: 0.06 }, teclea: { torso: 0.08, cab: 0.14 },
    chulo: { torso: -0.06, cab: -0.08 }, mira: { torso: 0.02, cab: 0.04 }, ilusion: { torso: 0.08, cab: 0.08 }, duda: { torso: -0.02, cab: 0.0 },
    alarga: { torso: 0.1, cab: 0.04 }, miedo: { torso: -0.1, cab: -0.1 }, susto: { torso: -0.14, cab: -0.14 }, grita: { torso: -0.04, cab: -0.16 },
    tapado: { torso: 0.0, cab: 0.02 }, serio: { torso: 0.0, cab: 0.0 }, miraM: { torso: 0.0, cab: 0.06 }, abre: { torso: 0.0, cab: -0.16 },
    mastica: { torso: 0.0, cab: 0.04 }, final: { torso: 0.0, cab: -0.03 }
  };
  const GUION_CUERPO_G = [
    [T.gCamara - 0.05, T.gCamara + 0.2, "camara"], [T.carga - 0.1, T.carga + 0.1, "carga"], [T.lanza - 0.1, T.lanza + 0.05, "lanza"],
    [T.siPuno - 0.02, T.siPuno + 0.12, "si"], [T.anda0, T.anda0 + 0.25, "anda"], [T.cierra0, T.cierra0 + 0.15, "empuja"],
    [T.atras0, T.atras1, "anda"], [T.dedo - 0.05, T.dedo + 0.15, "teclea"], [T.aparta0, T.aparta0 + 0.25, "anda"],
    [T.chulo - 0.08, T.chulo + 0.2, "chulo"], [T.gMira, T.gMira + 0.2, "mira"], [T.ilusion, T.ilusion + 0.25, "ilusion"],
    [T.gDuda, T.gDuda + 0.25, "duda"], [T.alarga0, T.alarga1, "alarga"], [T.retira - 0.02, T.retira + 0.14, "miedo"],
    [T.bum - 0.02, T.bum + 0.06, "susto"], [T.brazos0, T.brazos0 + 0.15, "grita"], [T.hunde, T.hunde + 0.2, "tapado"],
    [T.gSerio - 0.06, T.gSerio + 0.2, "serio"], [T.mEntra0 + 0.3, T.mEntra0 + 0.6, "miraM"], [T.mLanza + 0.02, T.mLanza + 0.2, "abre"],
    [T.atrapa - 0.02, T.atrapa + 0.1, "mastica"], [T.gCamaraF - 0.05, T.gCamaraF + 0.25, "final"]
  ];
  // pelvis de Guillermo (pantalla) y pies
  function piesG(t) {
    const w = 26;
    let x = 300, ps = { c: 300 - w, l: 300 + w, yc: 0, yl: 0 };
    if (t > T.anda0) { const k = tramo(t, T.anda0, T.anda1); x = lerp(300, 392, k); ps = pasos(t, T.anda0, T.anda1 + 0.06, 300, 392, 2, w, 14, "l"); }
    if (t > T.atras0) { const k = tramo(t, T.atras0, T.atras1); x = lerp(392, 342, k); ps = pasos(t, T.atras0, T.atras1 + 0.04, 392, 342, 1, w, 10, "c"); }
    if (t > T.aparta0) { const k = tramo(t, T.aparta0, T.aparta1); x = lerp(342, 318, k); ps = pasos(t, T.aparta0, T.aparta1 + 0.04, 342, 318, 1, w, 10, "c"); }
    return { x, ps };
  }
  function poseG(t) {
    const b = guion(GUION_CUERPO_G, CUERPOS_G, "inicio", t);
    const respira = Math.sin(t * 2.3);
    const enterrado = tramo(t, T.hunde - 0.1, T.hunde + 0.2);
    const p = {
      x: 330, suelo: SUELO, s: S, tirasLimpias: true, hombrosContinuos: true, hombrosRecortados: true,
      torso: b.torso, torsoEsc: { x: 1, y: 1 + respira * 0.005 * (1 - enterrado) }, piernas: {},
      cabeza: { ang: b.cab, dx: 0, dy: 0, esc: { x: 1, y: 1 } }
    };
    const { x, ps } = piesG(t);
    // sacude el sobre: el cuerpo acompaña
    const sac = dentro(t, T.sacude0, T.sacude0 + 0.06, T.sacude1 - 0.06, T.sacude1);
    p.torso += 0.02 * Math.sin((t - T.sacude0) * 26) * sac;
    // golpecitos con el pie (chulo)
    const golpe = dentro(t, T.pie0, T.pie0 + 0.05, T.pie1 - 0.05, T.pie1);
    const tap = Math.max(0, Math.sin((t - T.pie0) * 14)) * golpe;
    // ilusión: saltitos de puntillas
    const salt = dentro(t, T.ilusion, T.ilusion + 0.1, T.gDuda - 0.1, T.gDuda);
    const brinco = Math.abs(Math.sin((t - T.ilusion) * 11)) * salt;
    // temblor de miedo
    const tiem = dentro(t, T.tiembla, T.tiembla + 0.1, T.bum, T.bum + 0.1);
    p.torso += 0.01 * Math.sin(t * 47) * tiem;
    // el susto: se echa atrás de golpe
    const susto = campana(t, T.bum - 0.02, T.bum + 0.35);
    // braceando mientras sube la montaña: se agita
    const bra = dentro(t, T.brazos0, T.brazos0 + 0.08, T.brazos1 - 0.1, T.brazos1 + 0.05);
    p.torso += 0.05 * Math.sin((t - T.brazos0) * 15) * bra;
    p.cabeza.ang += 0.06 * Math.sin((t - T.brazos0) * 15 + 1) * bra;
    // atrapa la palomita: cabeceo
    const chomp = campana(t, T.atrapa - 0.04, T.atrapa + 0.18);
    p.cabeza.ang += 0.08 * chomp;
    const mast = dentro(t, T.atrapa + 0.05, T.atrapa + 0.15, DUR, DUR + 1);
    p.cabeza.ang += 0.02 * Math.sin((t - T.atrapa) * 13) * mast;
    // golpe de la última palomita en la cabeza
    const bonk = campana(t, T.ultima, T.ultima + 0.22);
    p.cabeza.ang += 0.06 * bonk; p.cabeza.dy += 3 * bonk;
    const py = PY(G) + respira * 0.9 * (1 - enterrado) - 9 * brinco + 4 * enterrado;
    p.pelvis = G.aHoja(p, { x: x - 8 * susto, y: py });
    const TOB = TOBY(G);
    p.piernas.cerca = { tob: G.aHoja(p, { x: ps.c - 8 * susto * 0.5, y: TOB - ps.yc - 9 * brinco }), ang: 0 };
    p.piernas.lejos = { tob: G.aHoja(p, { x: ps.l, y: TOB - ps.yl - 7 * tap - 9 * brinco }), ang: -0.25 * tap };
    const ex = guion(GUION_CARA_G, CARAS_G, "inicio", t);
    // mira el sobre en el aire
    const vuela = dentro(t, T.lanza, T.lanza + 0.05, T.aterriza, T.aterriza + 0.1);
    if (vuela > 0) { ex.mx = lerp(ex.mx, 0.9, vuela); ex.my = lerp(ex.my, -0.2 + 0.9 * fase(t, T.lanza, T.aterriza), vuela); }
    // sigue con la mirada las palomitas que come Marta
    const sig = dentro(t, T.come[0] - 0.1, T.come[0], T.mPinza, T.mPinza + 0.1);
    if (sig > 0) ex.my = lerp(ex.my, -0.3 + 0.4 * Math.abs(Math.sin((t - T.come[0]) * 9)), sig);
    // masticando
    if (mast > 0) { ex.abre = 3 * Math.max(0, Math.sin((t - T.atrapa) * 13)) * mast; ex.mof = ex.mof + 0.15 * Math.sin((t - T.atrapa) * 13) * mast; }
    p.cara = cara(ex, parpadeo(t, [0.4, 2.1, 4.6, 6.2, 8.9, 9.05, 10.6, 12.05]));
    p.rojo = 0.3 * dentro(t, T.brazos0, T.brazos0 + 0.2, T.hunde, T.hunde + 0.3) + 0.2 * dentro(t, T.atrapa + 0.1, T.atrapa + 0.4, DUR, DUR + 1);
    p.sudor = 0.6 * dentro(t, T.gDuda + 0.1, T.gDuda + 0.3, T.bum, T.bum + 0.2) + 0.3 * dentro(t, T.coge, T.coge + 0.3, T.mLanza, T.mLanza + 0.2);
    manosG(p, t);
    return p;
  }
  // el sobre en la mano (pantalla): cuelga de una esquina
  function manosG(p, t) {
    const sac = dentro(t, T.sacude0, T.sacude0 + 0.06, T.sacude1 - 0.06, T.sacude1);
    const sacude = () => ({ x: 352 + 5 * Math.sin((t - T.sacude0) * 26) * sac, y: 296 - 4 * Math.abs(Math.sin((t - T.sacude0) * 26)) * sac, d: PINZA });
    const bolsillo = { x: 0, y: 0, d: RELAJADA, bol: 1 };
    const borde = () => { const a = anguloPuerta(t), xf = PUERTA.x1 - (PUERTA.x1 - PUERTA.x0) * Math.cos(a); return { x: xf - 4, y: 290, d: PALMA, mo: 0.3 }; };
    const tecla = () => { const k = pulsacion(t).k9; return yema(G, p, { x: TECLA9.x - 1, y: TECLA9.y - 6 + k * 4.4 }, "lejos"); };
    const tecla0 = () => yema(G, p, { x: TECLA9.x - 3, y: TECLA9.y - 6 }, "lejos");
    const boton = () => yema(G, p, { x: BOTON.x, y: BOTON.y + pulsacion(t).st * 0.6 }, "lejos");
    const boton0 = () => yema(G, p, { x: BOTON.x - 4, y: BOTON.y - 8 }, "lejos");
    const tiembla = () => { const b = yema(G, p, { x: BOTON.x - 12, y: BOTON.y - 4 }, "lejos"); b.x += 1.5 * Math.sin(t * 43); b.y += 1.2 * Math.sin(t * 37); return b; };
    const ag = (fx, fy, ph) => () => ({ x: fx + 22 * Math.sin((t - T.brazos0) * 15 + ph), y: fy + 18 * Math.cos((t - T.brazos0) * 15 + ph), d: ABRE, mo: 0.2 });
    const PL = [
      [0, 0, sacude],
      [T.carga - 0.25, T.carga, { x: 334, y: 318, d: PINZA, mo: 0.2 }],
      [T.carga, T.lanza, { ...MANO_SOBRE, d: PINZA, mo: 0 }, entrada],
      [T.lanza, T.lanza + 0.14, { x: 386, y: 250, d: ABRE, mo: -0.2 }, salida],
      [T.siPuno - 0.04, T.siPuno + 0.08, { x: 372, y: 262, d: PUNO, mo: 0 }],
      [T.siPuno + 0.08, T.siPuno1, { x: 350, y: 312, d: PUNO, mo: 0 }, salida],
      [T.siPuno1, T.anda1, { x: 0, y: 0, d: RELAJADA, bol: 1 }],
      [T.cierra0 - 0.12, T.cierra0 + 0.06, borde],
      [T.cierra0 + 0.06, T.slam + 0.05, borde, s => 1],
      [T.slam + 0.05, T.atras0 + 0.1, { x: 430, y: 306, d: ABRE, mo: 0.2 }, salida],
      [T.atras0 + 0.1, T.dedo, { x: 404, y: 314, d: RELAJADA }],
      [T.dedo, T.teclas[0] - 0.1, tecla0],
      [T.teclas[0] - 0.1, T.teclas[3] + 0.1, tecla, s => 1],
      [T.teclas[3] + 0.1, T.start - 0.12, boton0],
      [T.start - 0.12, T.start + 0.12, boton, s => 1],
      [T.start + 0.12, T.aparta0 + 0.1, { x: 400, y: 300, d: RELAJADA }],
      [T.aparta0 + 0.1, T.aparta1, bolsillo],
      [T.alarga0, T.alarga1, tiembla],
      [T.alarga1, T.retira, tiembla, s => 1],
      [T.retira, T.retira + 0.16, { x: 352, y: 302, d: PUNO, mo: 0.1 }, salida],
      [T.bum - 0.04, T.bum + 0.08, { x: 362, y: 206, d: PALMA, mo: 0.3 }],
      [T.brazos0, T.brazos0 + 0.1, ag(370, 194, 0)],
      [T.brazos0 + 0.1, T.brazos1, ag(370, 194, 0), s => 1],
      [T.brazos1, T.hunde, { x: 360, y: 330, d: ABRE, mo: 0 }, entrada],
      [T.hunde, DUR, { x: 352, y: 336, d: RELAJADA, mo: 0 }]
    ];
    const l = pista(PL, t, G.aPantalla(p, G.tronco(p)(BOLS_GL)));
    let objeto = null;
    if (t < T.lanza) objeto = g => conCamara(g, () => { const m = l; dibSobre(g, { ...centroSobre(m), w: SOBRE_MANO.w, h: SOBRE_MANO.h, ang: 0.12 + 0.25 * Math.sin((t - T.sacude0) * 26) * sac }); });
    p.manoLejos = manoRig(G, p, l, "lejos", -1, objeto);
    // mano cercana: en el bolsillo salvo para protegerse y bracear
    const PC = [
      [0, 0, bolsillo],
      [T.bum - 0.06, T.bum + 0.08, { x: 330, y: 222, d: PALMA, mo: 0.3, bol: 0 }],
      [T.brazos0, T.brazos0 + 0.1, ag(296, 176, 2.6)],
      [T.brazos0 + 0.1, T.brazos1, ag(296, 176, 2.6), s => 1],
      [T.brazos1, T.hunde, { x: 300, y: 330, d: ABRE, mo: 0 }, entrada],
      [T.hunde, DUR, { x: 300, y: 336, d: RELAJADA, mo: 0 }]
    ];
    const c = pista(PC, t, G.aPantalla(p, G.tronco(p)(BOLS_GC)));
    p.manoCerca = manoRig(G, p, c, "cerca", -1, null);
  }

  /* =====================================================================================
   * MARTA (entra por la derecha, mira a la izquierda)
   * ===================================================================================== */
  const XM = 676;
  const CARAS_M = {
    inicio: E({ mx: 0.85, my: 0.1, c: 0.25, sd: 8, gd: 0.03, si: 8, gi: 0.03, sonr: 0.45, ancho: 0.9 }),
    anda: E({ mx: 0.8, my: 0.45, c: 0.3, sd: 6, gd: 0.02, si: 6, gi: 0.02, sonr: 0.35, ancho: 0.85 }),
    monton: E({ mx: 0.5, my: 0.6, c: 0.1, sd: 22, gd: 0.12, si: 22, gi: 0.12, abre: 8, ancho: 0.6, sonr: 0.1 }),
    ceja: E({ mx: 0.9, my: 0.15, c: 0.3, sd: 26, gd: 0.16, si: 4, gi: -0.04, sonr: 0.55, ancho: 0.85 }),
    coge: E({ mx: 0.5, my: 0.75, c: 0.35, sd: 10, gd: 0.04, si: 10, gi: 0.04, sonr: 0.5, ancho: 0.85 }),
    come: E({ mx: 0.5, my: 0, c: 0.85, h: 0.8, sd: 12, gd: 0.04, si: 12, gi: 0.04, sonr: 0.65, ancho: 0.85 }),
    apunta: E({ mx: 0.9, my: 0.0, c: 0.35, sd: 16, gd: 0.06, si: 16, gi: 0.06, sonr: 0.6, ancho: 0.9 }),
    tierna: E({ mx: 0.9, my: 0.1, c: 0.4, h: 0.5, sd: 14, gd: 0.06, si: 14, gi: 0.06, sonr: 0.85, ancho: 0.95 }),
    camara: E({ mx: -0.85, my: 0.05, c: 0.35, h: 0.3, sd: 12, gd: 0.04, si: 14, gi: 0.06, sonr: 0.8, ancho: 0.95 })
  };
  const GUION_CARA_M = [
    [T.mEntra0, T.mEntra0 + 0.1, "anda"], [T.mMira - 0.1, T.mMira + 0.1, "monton"], [T.mCeja, T.mCeja + 0.15, "ceja"],
    [T.coge0, T.coge0 + 0.2, "coge"], [T.sube, T.sube + 0.15, "come"], [T.mPinza - 0.05, T.mPinza + 0.12, "apunta"],
    [T.atrapa + 0.05, T.atrapa + 0.25, "tierna"], [T.gCamaraF + 0.05, T.gCamaraF + 0.25, "camara"]
  ];
  const CUERPOS_M = {
    inicio: { torso: 0.06, cab: 0.04 }, anda: { torso: 0.07, cab: 0.03 }, para: { torso: -0.02, cab: -0.03 }, monton: { torso: 0.0, cab: 0.12 },
    ceja: { torso: -0.02, cab: -0.04 }, coge: { torso: 0.24, cab: 0.18 }, come: { torso: -0.02, cab: -0.06 }, lanza: { torso: 0.06, cab: 0.0 },
    tierna: { torso: 0.0, cab: 0.04 }, camara: { torso: 0.0, cab: 0.06 }
  };
  const GUION_CUERPO_M = [
    [T.mEntra0, T.mEntra0 + 0.1, "anda"], [T.mEntra1 - 0.1, T.mEntra1 + 0.15, "para"], [T.mMira - 0.05, T.mMira + 0.15, "monton"],
    [T.mCeja, T.mCeja + 0.2, "ceja"], [T.coge0, T.coge, "coge"], [T.coge + 0.05, T.sube + 0.05, "come"],
    [T.mPinza, T.mLanza, "lanza"], [T.mLanza + 0.1, T.mLanza + 0.35, "tierna"], [T.gCamaraF, T.gCamaraF + 0.3, "camara"]
  ];
  const cuerpoM = t => guion(GUION_CUERPO_M, CUERPOS_M, "inicio", t);
  function piesM(t) {
    const w = -20, x0 = 1035;
    const ps = pasos(t, T.mEntra0, T.mEntra1 + 0.05, x0, XM, 6, w, 14, "l", [12, 12, 12, 14, 24, 24, 16]);
    const anda = dentro(t, T.mEntra0, T.mEntra0 + 0.1, T.mEntra1 - 0.1, T.mEntra1 + 0.1);
    // la pelvis va entre los dos pies, algo adelantada hacia donde camina
    const x = (ps.c + ps.l) / 2 - 7 * anda;
    return { x, ps, anda };
  }
  function poseM(t) {
    const b = cuerpoM(t), b0 = cuerpoM(t - 0.1);
    const respira = Math.sin(t * 2.0 + 0.7);
    const p = {
      x: XM, suelo: SUELO, s: S, espejo: true, tirasLimpias: true,
      torso: b.torso, torsoEsc: { x: 1, y: 1 + respira * 0.004 }, piernas: {},
      cabeza: { ang: b.cab, dx: 0, dy: 0, esc: { x: 1, y: 1 } }
    };
    const { x, ps, anda } = piesM(t), x1 = piesM(t - 0.06).x;
    const bob = Math.max(ps.yc, ps.yl) * 0.18;
    // zancada por encima de las palomitas del suelo: se inclina
    const zanc = campana(t, T.mEntra0 + 0.8, T.mEntra0 + 1.2);
    p.torso += 0.03 * zanc;
    // mastica
    let mast = 0; for (const tc of T.come) mast = Math.max(mast, dentro(t, tc + 0.18, tc + 0.22, tc + 0.42, tc + 0.5));
    p.cabeza.ang += 0.015 * Math.sin(t * 15) * mast;
    // lanzamiento: golpe de muñeca
    const vel = (b.torso - b0.torso) * 6 + (b.cab - b0.cab) * 4 + (x - x1) * 0.04;
    p.pelo = { viento: 0, inercia: clamp(-vel * 1.2 + 0.6 * b.torso + 0.4 * anda, -1, 1) };
    p.pelvis = M.aHoja(p, { x, y: PY(M) + respira * 0.7 - bob });
    const TOB = TOBY(M);
    p.piernas.cerca = { tob: M.aHoja(p, { x: ps.c, y: TOB - ps.yc }), ang: 0.1 * Math.sin(Math.PI * clamp(ps.yc / 16)) };
    p.piernas.lejos = { tob: M.aHoja(p, { x: ps.l, y: TOB - ps.yl }), ang: 0.1 * Math.sin(Math.PI * clamp(ps.yl / 16)) };
    const ex = guion(GUION_CARA_M, CARAS_M, "inicio", t);
    ex.wd = campana(t, T.guino, T.guino + 0.35);
    // come: la boca se abre para recibir y mastica
    let ab = 0; for (const tc of T.come) { ab = Math.max(ab, 10 * campana(t, tc + 0.02, tc + 0.22)); }
    ex.abre = Math.max(ex.abre, ab + 3 * Math.max(0, Math.sin(t * 15)) * mast);
    ex.mof = 0.18 * mast;
    // sigue la palomita lanzada con la mirada
    const sig = dentro(t, T.mLanza, T.mLanza + 0.05, T.atrapa, T.atrapa + 0.1);
    if (sig > 0) { ex.mx = lerp(ex.mx, 0.95, sig); ex.my = lerp(ex.my, -0.4 + 0.5 * fase(t, T.mLanza, T.atrapa), sig); }
    p.cara = cara(ex, parpadeo(t, [10.2, 11.6, 13.0]));
    manosM(p, t);
    return p;
  }
  // puñado en la mano (pantalla, relativo a la mano)
  const PUNADO = [[-4, -8, 0], [3, -9, 3], [-1, -13, 5], [6, -5, 1], [-7, -4, 6]];
  const MANO_COME = { x: 620, y: 318 };
  const AGUJERO = { x: 590, y: ySup(590) + 2 };
  function quedanEnMano(t) {
    if (t < T.coge) return 0;
    let n = PUNADO.length; for (const tc of T.come) if (t >= tc) n--; if (t >= T.mPinza - 0.02) n--; return Math.max(0, n);
  }
  function manosM(p, t) {
    const bolsillo = { x: 0, y: 0, d: RELAJADA, bol: 1 };
    const flick = tc => () => { const k = campana(t, tc - 0.06, tc + 0.1); return { x: MANO_COME.x + 2 * k, y: MANO_COME.y - 10 * k, d: CUENCO, mo: 0.2 }; };
    const PL = [
      [0, 0, bolsillo],
      [T.coge0, T.coge0 + 0.18, { x: AGUJERO.x + 6, y: AGUJERO.y - 16, d: ABRE, mo: 0.4, bol: 0 }],
      [T.coge0 + 0.18, T.coge - 0.06, { x: AGUJERO.x, y: AGUJERO.y - 2, d: GARRA, mo: 0.4 }],
      [T.coge - 0.06, T.coge, { x: AGUJERO.x + 1, y: AGUJERO.y - 4, d: CUENCO, mo: 0.4 }],
      [T.coge + 0.02, T.sube, { x: MANO_COME.x, y: MANO_COME.y, d: CUENCO, mo: 0.2 }],
      [T.come[0] - 0.08, T.come[0] + 0.12, flick(T.come[0])],
      [T.come[1] - 0.08, T.come[1] + 0.12, flick(T.come[1])],
      [T.come[2] - 0.08, T.come[2] + 0.12, flick(T.come[2])],
      [T.mPinza - 0.15, T.mPinza, { x: 612, y: 312, d: PINZA, mo: 0.3 }],
      [T.mPinza + 0.02, T.mLanza - 0.04, { x: 624, y: 324, d: PINZA, mo: 0.6 }],
      [T.mLanza - 0.04, T.mLanza + 0.1, { x: 596, y: 282, d: ABRE, mo: -0.1 }, salida],
      [T.mLanza + 0.3, T.mLanza + 0.55, { x: MANO_COME.x + 4, y: MANO_COME.y + 4, d: CUENCO, mo: 0.2 }],
      [T.gCamaraF, T.gCamaraF + 0.3, { x: MANO_COME.x + 2, y: MANO_COME.y + 8, d: CUENCO, mo: 0.2 }]
    ];
    const l = pista(PL, t, M.aPantalla(p, M.tronco(p)(M.BOLSILLO_L)));
    p.manoLejos = manoRig(M, p, l, "lejos", -1, null);
    p.manoCerca = M.manoReposo(p, "cerca");
    p.manoM = l;
  }

  /* =====================================================================================
   * PALOMITAS QUE VUELAN AL FINAL (a la boca de Marta y a la de Guillermo)
   * ===================================================================================== */
  // el puñado en la mano de Marta (encima de los dedos) y la palomita en pinza
  const INDICE_LANZA = PUNADO.length - 1 - T.come.length;
  function enCuenquito(l, i) {
    const [dx, dy] = PUNADO[i]; return { x: l.x + dx * 0.9, y: l.y + dy * 0.75 - 2 };
  }
  function enPinza(l, t) {
    const q = enCuenquito(l, INDICE_LANZA), k = tramo(t, T.mPinza - 0.02, T.mPinza + 0.1);
    return { x: lerp(q.x, l.x - 9, k), y: lerp(q.y, l.y - 5, k) };
  }
  function enManoM(g, t, pM) {
    const l = pM.manoM, quedan = quedanEnMano(t);
    for (let i = 0; i < quedan; i++) { const q = enCuenquito(l, i); palomita(g, q.x, q.y, TAM * 0.95, PUNADO[i][2], 0.3 * i); }
    if (t >= T.mPinza - 0.02 && t < T.mLanza) {
      const q = enPinza(l, t); palomita(g, q.x, q.y, TAM * 0.95, PUNADO[INDICE_LANZA][2], 0.3 * INDICE_LANZA);
    }
  }
  const trayectos = [];
  function vueloGrano(i, t) {
    const lanza = i === T.come.length, t0 = lanza ? T.mLanza : T.come[i], t1 = lanza ? T.atrapa : t0 + 0.22;
    if (t < t0 || t > t1) return null;
    const indice = PUNADO.length - 1 - i;
    if (!trayectos[i]) {
      const mano = poseM(t0).manoM, origen = lanza ? enPinza(mano, t0) : enCuenquito(mano, indice);
      const rig = lanza ? G : M, p = lanza ? poseG(t1) : poseM(t1);
      trayectos[i] = { origen, fin: rig.aPantalla(p, rig.boca(p)) };
    }
    const { origen, fin } = trayectos[i], u = fase(t, t0, t1);
    return { x: lerp(origen.x, fin.x, u), y: lerp(origen.y, fin.y, u) - (lanza ? 120 : 36) * 4 * u * (1 - u),
      v: PUNADO[indice][2], ang: 0.3 * indice + (lanza ? 9 : 6) * u, s: TAM * lerp(0.95, lanza ? 1 : 0.75, u) };
  }
  function vuelos(g, t) {
    for (let i = 0; i <= T.come.length; i++) { const q = vueloGrano(i, t); if (q) palomita(g, q.x, q.y, q.s, q.v, q.ang); }
  }
  // palomitas en el pelo de Guillermo (coordenadas del retrato)
  const deRetrato = (Rg, p, q) => Rg.aPantalla(p, Rg.cabeza(p).a(q));
  const EN_PELO = [[690, 250, T.pelo1, 2], [905, 235, T.pelo1 + 0.18, 5], [800, 205, T.ultima, 1]];
  function enElPelo(g, t, pG) {
    EN_PELO.forEach(([x, y, tl, v], i) => {
      if (t < tl) {
        // cae desde arriba
        const u = fase(t, tl - 0.35, tl); if (u <= 0) return;
        const q = deRetrato(G, pG, { x, y });
        if (i === 2) {   // la última: sale del microondas y le da en la cabeza
          const x0 = BOCA_MW.x, y0 = BOCA_MW.y - 10;
          palomita(g, lerp(x0, q.x, u), lerp(y0, q.y, u) - 70 * 4 * u * (1 - u), TAM, v, 8 * u);
        } else palomita(g, q.x + 10 * (1 - u), q.y - 120 * (1 - u * u), TAM, v, 5 * u);
        return;
      }
      const q = deRetrato(G, pG, { x, y }), b = t - tl, bote = b < 0.25 ? 6 * Math.sin(Math.PI * b / 0.25) : 0;
      palomita(g, q.x, q.y - bote, TAM, v, 0.4 + i);
    });
    // estrellita del golpe
    const k = campana(t, T.ultima, T.ultima + 0.5);
    if (k > 0.01) { const q = deRetrato(G, pG, { x: 800, y: 180 }); estrella(g, q.x + 14, q.y - 12, 6 * k, "#ffd84a"); estrella(g, q.x - 12, q.y - 16, 4 * k, "#ffffff"); }
  }

  /* =====================================================================================
   * EFECTOS
   * ===================================================================================== */
  function estrella(g, x, y, r, col) {
    g.save(); g.translate(x, y); g.beginPath();
    for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
    g.closePath(); g.fillStyle = col; g.fill(); g.lineWidth = 1.1; g.strokeStyle = TINTA; g.stroke(); g.restore();
  }
  function rayas(g, x, y, ang, n, L, k, col) {
    g.save(); g.globalAlpha = clamp(k); g.strokeStyle = col || TINTA; g.lineWidth = 1.6; g.lineCap = "round";
    for (let i = 0; i < n; i++) { const a = ang + (i - (n - 1) / 2) * 0.45; g.beginPath(); g.moveTo(x + Math.cos(a) * 6, y + Math.sin(a) * 6); g.lineTo(x + Math.cos(a) * (6 + L), y + Math.sin(a) * (6 + L)); g.stroke(); }
    g.restore();
  }
  // pitidos del teclado
  function pitidos(g, t) {
    for (const tk of [...T.teclas, T.start]) {
      const u = fase(t, tk, tk + 0.35); if (u <= 0 || u >= 1) continue;
      g.save(); g.globalAlpha = 1 - u; g.strokeStyle = "#2b6e44"; g.lineWidth = 1.4;
      for (let i = 0; i < 2; i++) { g.beginPath(); g.arc(PAN.x0 + 4, MW.y0 + 18, 8 + i * 6 + u * 9, Math.PI * 1.05, Math.PI * 1.45); g.stroke(); }
      g.restore();
    }
  }
  // zumbido mientras funciona
  function zumbido(g, t) {
    if (!encendido(t)) return;
    const k = tramo(t, T.start, T.start + 0.2);
    g.save(); g.strokeStyle = "rgba(60,70,80,0.55)"; g.lineWidth = 1.2; g.globalAlpha = k;
    for (let i = 0; i < 3; i++) {
      const x = 490 + i * 28, y = MW.y0 - 6 - ((t * 18 + i * 5) % 10);
      g.beginPath(); for (let j = 0; j <= 8; j++) { const xx = x - 8 + j * 2, yy = y + 1.6 * Math.sin(j * 1.6 + t * 20); if (j) g.lineTo(xx, yy); else g.moveTo(xx, yy); } g.stroke();
    }
    g.restore();
  }
  // «¡pop!»: estallidos por encima del microondas
  const POPS = (() => { const L = []; let tt = T.pop0; let i = 0; while (tt < T.bum - 0.05) { L.push([tt, 450 + 130 * hash(i * 3.3), MW.y0 - 8 - 24 * hash(i * 7.1), i]); tt += lerp(0.28, 0.05, fase(tt, T.pop0, T.lleno)); i++; } return L; })();
  function pops(g, t) {
    for (const [tp, x, y, i] of POPS) {
      const u = fase(t, tp, tp + 0.3); if (u <= 0 || u >= 1) continue;
      const r = 4 + 7 * salida(u);
      g.save(); g.globalAlpha = 1 - entrada(u); g.translate(x, y - 6 * u); g.rotate(i);
      g.beginPath(); for (let k = 0; k < 14; k++) { const a = k * Math.PI / 7, rr = k % 2 ? r * 0.5 : r; g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
      g.closePath(); g.fillStyle = "#fff6c8"; g.fill(); g.strokeStyle = TINTA; g.lineWidth = 1.2; g.stroke();
      g.restore();
    }
  }
  // vapor por las rendijas de la puerta abombada
  function vapor(g, t) {
    const k = dentro(t, T.lleno, T.lleno + 0.2, T.bum + 0.3, T.bum + 1.4);
    if (k <= 0.01) return;
    g.save();
    for (let i = 0; i < 6; i++) {
      const ph = ((t * 0.9 + i / 6) % 1), x = (i % 2 ? PUERTA.x0 : PUERTA.x1) + (i % 2 ? -1 : 1) * 8 * ph, y = 300 - i * 11 - 34 * ph;
      g.globalAlpha = k * 0.5 * Math.sin(Math.PI * ph); g.fillStyle = "#ffffff";
      g.beginPath(); g.arc(x, y, 4 + 7 * ph, 0, Math.PI * 2); g.fill();
    }
    g.restore();
  }
  // el portazo
  function portazo(g, t) {
    const k = campana(t, T.slam, T.slam + 0.25);
    if (k > 0.01) { rayas(g, PUERTA.x0 - 2, 244, Math.PI * 1.15, 3, 9 * k, k); rayas(g, PUERTA.x0 - 2, 316, Math.PI * 0.85, 3, 9 * k, k); }
  }
  // «¡sí!» del enceste
  function enceste(g, t) {
    const k = campana(t, T.aterriza, T.aterriza + 0.45);
    if (k > 0.01) { estrella(g, 474, 262, 5 * k, "#ffe680"); estrella(g, 500, 272, 3.5 * k, "#ffffff"); }
  }
  // la explosión (aro de rayas y polvo al reventar)
  function explosion(g, t) {
    const u = fase(t, T.bum, T.bum + 0.35); if (u <= 0 || u >= 1) return;
    g.save(); g.globalAlpha = 1 - u; g.strokeStyle = TINTA; g.lineWidth = 2.2; g.lineCap = "round";
    for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2 + 0.2, r0 = 50 + 50 * u, r1 = r0 + 18; g.beginPath(); g.moveTo(BOCA_MW.x + Math.cos(a) * r0, BOCA_MW.y + Math.sin(a) * r0 * 0.75); g.lineTo(BOCA_MW.x + Math.cos(a) * r1, BOCA_MW.y + Math.sin(a) * r1 * 0.75); g.stroke(); }
    g.globalAlpha = (1 - entrada(u)) * 0.7; g.fillStyle = "#fff8de"; g.beginPath(); g.ellipse(BOCA_MW.x, BOCA_MW.y, 60 + 40 * u, 46 + 30 * u, 0, 0, Math.PI * 2); g.fill();
    g.restore();
  }
  // rayitas del grito y del susto
  function susto(g, t, pG) {
    const k = campana(t, T.bum, T.bum + 0.4);
    if (k > 0.01) { const c = G.aPantalla(pG, G.centroCabeza(pG)); rayas(g, c.x - 6, c.y - 46, -Math.PI / 2, 5, 12 * k, k); }
  }
  // migas al masticar (caen de la comisura)
  function migas(g, b, t0, t, lado) {
    for (let i = 0; i < 4; i++) {
      const u = fase(t, t0 + i * 0.09, t0 + i * 0.09 + 0.45); if (u <= 0 || u >= 1) continue;
      g.save(); g.globalAlpha = 1 - entrada(u); g.fillStyle = "#fff6dc"; g.strokeStyle = "rgba(120,80,30,0.8)"; g.lineWidth = 0.6;
      g.beginPath(); g.arc(b.x + lado * (5 + 5 * u + i), b.y + 2 + 22 * u * u, 1.3, 0, Math.PI * 2); g.fill(); g.stroke(); g.restore();
    }
  }
  function crunch(g, t, pG, pM) {
    if (t > T.atrapa) migas(g, G.aPantalla(pG, G.boca(pG)), T.atrapa + 0.1, t, 1);
    if (t > T.atrapa + 0.3) migas(g, G.aPantalla(pG, G.boca(pG)), T.atrapa + 0.45, t, -1);
    const bm = M.aPantalla(pM, M.boca(pM));
    for (const tc of T.come) if (t > tc) migas(g, bm, tc + 0.24, t, -1);
  }
  // el hoyo del puñado
  function agujero(g, t) {
    const k = tramo(t, T.coge, T.coge + 0.10); if (k <= 0.01) return;
    g.save(); g.globalAlpha = k; g.fillStyle = "rgba(140,90,30,0.35)"; g.beginPath(); g.ellipse(AGUJERO.x, AGUJERO.y + 2, 9, 4, -0.3, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "rgba(60,30,10,0.45)"; g.lineWidth = 1; g.beginPath(); g.ellipse(AGUJERO.x, AGUJERO.y + 2, 9, 4, -0.3, Math.PI, Math.PI * 2); g.stroke();
    g.restore();
  }

  /* =====================================================================================
   * DECORADO: cocinita de detrás de la barra, al anochecer
   * ===================================================================================== */
  const ZOC = 190, BASE_MUEBLE = 470, SUELO_PARED = 482;
  let fondo = null;
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W + 160; c.height = H + 140; const g = c.getContext("2d");
    g.translate(80, 70); g.lineJoin = "round"; g.lineCap = "round";
    // pared crema
    const gp = g.createLinearGradient(0, -70, 0, ZOC); gp.addColorStop(0, "#e9d6a8"); gp.addColorStop(1, "#f3e4bd");
    g.fillStyle = gp; g.fillRect(-80, -70, W + 160, ZOC + 70);
    g.fillStyle = "rgba(255,255,255,0.18)"; for (let x = -80; x < W + 80; x += 34) g.fillRect(x, -70, 14, ZOC + 70);
    // moldura de techo
    g.fillStyle = "#fbf3df"; g.fillRect(-80, -70, W + 160, 26); g.fillStyle = "rgba(120,80,40,0.25)"; g.fillRect(-80, -44, W + 160, 3);
    // azulejo verde agua (de la balda a la encimera)
    g.fillStyle = "#bfe0db"; g.fillRect(-80, ZOC, W + 160, ENC - ZOC);
    g.strokeStyle = "rgba(90,130,128,0.55)"; g.lineWidth = 1;
    for (let y = ZOC, f = 0; y < ENC; y += 14, f++) {
      g.beginPath(); g.moveTo(-80, y); g.lineTo(W + 80, y); g.stroke();
      for (let x = -80 + (f % 2 ? 14 : 0); x < W + 80; x += 28) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 14); g.stroke(); }
    }
    g.fillStyle = "rgba(255,255,255,0.32)"; for (let y = ZOC + 2; y < ENC; y += 14) g.fillRect(-80, y, W + 160, 2);
    g.fillStyle = "#7fb3ad"; g.fillRect(-80, ZOC - 3, W + 160, 4);
    ventana(g);
    balda(g);
    nevera(g);
    encimera(g);
    hervidor(g, 630, ENC);
    frutero(g, 712, ENC);
    cucharones(g, 112, ENC);
    tabla(g, 160, ENC);
    sueloBarro(g);
    return c;
  }
  function ventana(g) {
    const x0 = 20, y0 = 30, w = 170, h = 140;
    g.fillStyle = "#f6efe0"; g.fillRect(x0 - 8, y0 - 8, w + 16, h + 16);
    const cie = g.createLinearGradient(0, y0, 0, y0 + h); cie.addColorStop(0, "#1f2f62"); cie.addColorStop(0.7, "#53609a"); cie.addColorStop(1, "#e79a7c");
    g.fillStyle = cie; g.fillRect(x0, y0, w, h);
    // ciudad
    g.fillStyle = "#1b2140";
    for (let i = 0; i < 9; i++) { const bx = x0 + i * 20 - 4, bh = 30 + 40 * hash(i * 2.7); g.fillRect(bx, y0 + h - bh, 18, bh); }
    g.fillStyle = "#ffd77a";
    for (let i = 0; i < 40; i++) { const bx = x0 + 4 + Math.floor(hash(i * 1.3) * 160), by = y0 + h - 8 - Math.floor(hash(i * 3.9) * 50); if (hash(i * 5.1) > 0.4) g.fillRect(bx, by, 2.5, 3); }
    g.fillStyle = "#fffbe8"; g.beginPath(); g.arc(x0 + 128, y0 + 30, 9, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#2a376a"; g.beginPath(); g.arc(x0 + 132, y0 + 27, 8, 0, Math.PI * 2); g.fill();
    // marco y cruceta
    g.strokeStyle = "#f6efe0"; g.lineWidth = 5; g.beginPath(); g.moveTo(x0 + w / 2, y0); g.lineTo(x0 + w / 2, y0 + h); g.moveTo(x0, y0 + h / 2); g.lineTo(x0 + w, y0 + h / 2); g.stroke();
    g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(x0 - 8, y0 - 8, w + 16, h + 16); g.strokeRect(x0, y0, w, h);
    // alféizar con una maceta
    g.fillStyle = "#e7dcc6"; g.fillRect(x0 - 14, y0 + h + 6, w + 28, 8); g.strokeRect(x0 - 14, y0 + h + 6, w + 28, 8);
    g.fillStyle = "#c86a3c"; g.beginPath(); g.moveTo(x0 + 120, y0 + h + 6); g.lineTo(x0 + 144, y0 + h + 6); g.lineTo(x0 + 140, y0 + h - 14); g.lineTo(x0 + 124, y0 + h - 14); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#4e9a52"; for (let i = 0; i < 5; i++) { g.beginPath(); g.ellipse(x0 + 126 + i * 3.5, y0 + h - 22 - (i % 2) * 6, 3.5, 9, -0.4 + i * 0.2, 0, Math.PI * 2); g.fill(); g.lineWidth = 1; g.stroke(); }
    // cortina de cuadros (media, a la izquierda)
    g.save(); g.beginPath(); g.moveTo(x0 - 12, y0 - 14); g.lineTo(x0 + 46, y0 - 14); g.quadraticCurveTo(x0 + 30, y0 + 60, x0 + 40, y0 + h + 4); g.lineTo(x0 - 12, y0 + h + 4); g.closePath();
    g.fillStyle = "#f7f1e6"; g.fill(); g.clip(); g.fillStyle = "rgba(200,60,50,0.55)";
    for (let y = y0 - 14; y < y0 + h + 4; y += 10) g.fillRect(x0 - 12, y, 70, 5);
    for (let x = x0 - 12; x < x0 + 60; x += 10) g.fillRect(x, y0 - 14, 5, h + 20);
    g.restore(); g.strokeStyle = TINTA; g.lineWidth = 1.6; g.beginPath(); g.moveTo(x0 + 46, y0 - 14); g.quadraticCurveTo(x0 + 30, y0 + 60, x0 + 40, y0 + h + 4); g.stroke();
    g.fillStyle = "#8a5a32"; g.fillRect(x0 - 20, y0 - 18, w + 40, 5);
  }
  function balda(g) {
    const x0 = 560, x1 = 820, y = 150;
    g.fillStyle = "#b07a48"; g.fillRect(x0, y, x1 - x0, 8); g.strokeStyle = TINTA; g.lineWidth = 1.6; g.strokeRect(x0, y, x1 - x0, 8);
    g.fillStyle = "#8a5a32"; g.beginPath(); g.moveTo(x0 + 16, y + 8); g.lineTo(x0 + 26, y + 8); g.lineTo(x0 + 16, y + 24); g.closePath(); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(x1 - 16, y + 8); g.lineTo(x1 - 26, y + 8); g.lineTo(x1 - 16, y + 24); g.closePath(); g.fill(); g.stroke();
    // tarros sin etiqueta
    const tarros = [[582, 34, 18, "#e8b04a"], [610, 42, 20, "#c4543c"], [640, 30, 17, "#7a9c46"], [668, 44, 22, "#f2e6c4"], [700, 36, 18, "#6d4a2c"], [730, 40, 20, "#e8d27a"]];
    for (const [x, h, w, col] of tarros) {
      g.fillStyle = "rgba(220,240,240,0.6)"; g.beginPath(); rectanguloRedondeado(g, x - w / 2, y - h, w, h, 4); g.fill();
      g.fillStyle = col; g.beginPath(); rectanguloRedondeado(g, x - w / 2 + 2, y - h * 0.7, w - 4, h * 0.7 - 2, 3); g.fill();
      g.fillStyle = "rgba(255,255,255,0.45)"; g.fillRect(x - w / 2 + 3, y - h + 4, 3, h - 8);
      g.strokeStyle = TINTA; g.lineWidth = 1.4; g.beginPath(); rectanguloRedondeado(g, x - w / 2, y - h, w, h, 4); g.stroke();
      g.fillStyle = "#c9c3b5"; g.fillRect(x - w / 2 - 1, y - h - 5, w + 2, 6); g.strokeRect(x - w / 2 - 1, y - h - 5, w + 2, 6);
    }
    // tazas colgadas
    const tazas = [[770, "#3f8fc4"], [796, "#e38b3b"]];
    for (const [x, col] of tazas) {
      g.strokeStyle = TINTA; g.lineWidth = 1.2; g.beginPath(); g.moveTo(x, y + 8); g.lineTo(x, y + 14); g.stroke();
      g.fillStyle = col; g.beginPath(); g.moveTo(x - 8, y + 14); g.lineTo(x + 8, y + 14); g.lineTo(x + 6, y + 30); g.lineTo(x - 6, y + 30); g.closePath(); g.fill(); g.stroke();
      g.lineWidth = 2; g.beginPath(); g.arc(x + 8, y + 21, 4, -Math.PI / 2, Math.PI / 2); g.stroke();
    }
    // tarro de galletas grande encima
    g.fillStyle = "#f0c9a0"; g.beginPath(); g.ellipse(806, y - 18, 12, 18, 0, 0, Math.PI * 2); g.fill(); g.lineWidth = 1.4; g.stroke();
  }
  function nevera(g) {
    const x0 = 838, x1 = 990, y0 = 100, y1 = SUELO_PARED;
    g.fillStyle = "rgba(40,30,20,0.25)"; g.fillRect(x0 - 6, y0 + 6, 8, y1 - y0 - 6);
    const gr = g.createLinearGradient(x0, 0, x1, 0); gr.addColorStop(0, "#d8ecef"); gr.addColorStop(0.5, "#f4fbfb"); gr.addColorStop(1, "#c3dade");
    g.fillStyle = gr; g.beginPath(); rectanguloRedondeado(g, x0, y0, x1 - x0, y1 - y0, 10); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 2; g.stroke();
    g.beginPath(); g.moveTo(x0, y0 + 120); g.lineTo(x1, y0 + 120); g.stroke();
    g.fillStyle = "#9fb5b9"; g.beginPath(); rectanguloRedondeado(g, x0 + 12, y0 + 70, 6, 40, 3); g.fill(); g.stroke(); g.beginPath(); rectanguloRedondeado(g, x0 + 12, y0 + 134, 6, 60, 3); g.fill(); g.stroke();
    // imanes y un dibujo de niño (sin letras)
    g.fillStyle = "#fffdf6"; g.save(); g.translate(x0 + 70, y0 + 170); g.rotate(-0.06); g.fillRect(-24, -20, 48, 40); g.strokeRect(-24, -20, 48, 40);
    g.fillStyle = "#e4553f"; g.beginPath(); g.moveTo(-12, 2); g.lineTo(0, -10); g.lineTo(12, 2); g.closePath(); g.fill(); g.fillStyle = "#f2c040"; g.fillRect(-10, 2, 20, 12);
    g.fillStyle = "#f6c84a"; g.beginPath(); g.arc(16, -12, 4, 0, Math.PI * 2); g.fill(); g.fillStyle = "#4e9a52"; g.fillRect(-24, 14, 48, 6);
    g.fillStyle = "#3f8fc4"; g.beginPath(); g.arc(0, -22, 4, 0, Math.PI * 2); g.fill(); g.stroke(); g.restore();
    const imanes = [[x0 + 40, y0 + 40, "#e4553f"], [x0 + 92, y0 + 30, "#f2c040"], [x0 + 120, y0 + 72, "#4e9a52"], [x0 + 110, y0 + 230, "#3f8fc4"], [x0 + 40, y0 + 270, "#c66fb0"]];
    for (const [x, y, col] of imanes) { g.fillStyle = col; g.beginPath(); g.arc(x, y, 6, 0, Math.PI * 2); g.fill(); g.lineWidth = 1.2; g.stroke(); g.fillStyle = "rgba(255,255,255,0.6)"; g.beginPath(); g.arc(x - 2, y - 2, 2, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = "#e4553f"; g.save(); g.translate(x0 + 60, y0 + 60); g.beginPath(); g.arc(0, 0, 9, 0, Math.PI * 2); g.fill(); g.stroke(); g.fillStyle = "#4e9a52"; g.beginPath(); g.ellipse(4, -10, 4, 2, -0.6, 0, Math.PI * 2); g.fill(); g.stroke(); g.restore();
    g.fillStyle = "#2b2f33"; g.fillRect(x0 + 10, y1 - 8, x1 - x0 - 20, 8);
  }
  function encimera(g) {
    // muebles bajos
    g.fillStyle = "#e9e1cf"; g.fillRect(-80, ENC + 8, 918, BASE_MUEBLE - ENC - 8);
    g.strokeStyle = TINTA; g.lineWidth = 1.6;
    for (let x = -60; x < 830; x += 98) {
      g.fillStyle = "#f2ecdc"; g.beginPath(); rectanguloRedondeado(g, x + 4, ENC + 16, 88, BASE_MUEBLE - ENC - 26, 3); g.fill(); g.stroke();
      g.strokeStyle = "rgba(120,100,70,0.35)"; g.strokeRect(x + 12, ENC + 24, 72, BASE_MUEBLE - ENC - 42); g.strokeStyle = TINTA;
      g.fillStyle = "#b48a4a"; g.beginPath(); g.arc(x + 48, ENC + 30, 3, 0, Math.PI * 2); g.fill(); g.stroke();
    }
    g.fillStyle = "#6b5440"; g.fillRect(-80, BASE_MUEBLE, 918, SUELO_PARED - BASE_MUEBLE);
    // tablero de madera
    const gt = g.createLinearGradient(0, ENC - 2, 0, ENC + 9); gt.addColorStop(0, "#d4a26a"); gt.addColorStop(1, "#a8743f");
    g.fillStyle = gt; g.fillRect(-80, ENC - 2, 922, 11); g.strokeStyle = TINTA; g.lineWidth = 1.8; g.strokeRect(-82, ENC - 2, 922, 11);
    g.strokeStyle = "rgba(120,70,30,0.4)"; g.lineWidth = 1; for (let x = -60; x < 830; x += 47) { g.beginPath(); g.moveTo(x, ENC + 1); g.quadraticCurveTo(x + 20, ENC + 3, x + 40, ENC + 1); g.stroke(); }
  }
  function hervidor(g, x, y) {
    g.save(); g.translate(x, y); g.lineJoin = "round";
    g.fillStyle = "#e4553f"; g.beginPath(); g.moveTo(-18, -2); g.quadraticCurveTo(-22, -30, -10, -38); g.lineTo(10, -38); g.quadraticCurveTo(22, -30, 18, -2); g.closePath(); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 1.6; g.stroke();
    g.fillStyle = "rgba(255,255,255,0.4)"; g.beginPath(); g.ellipse(-9, -22, 3, 10, 0.1, 0, Math.PI * 2); g.fill();
    g.lineWidth = 3.5; g.strokeStyle = TINTA; g.beginPath(); g.moveTo(-10, -38); g.quadraticCurveTo(0, -52, 10, -38); g.stroke(); g.lineWidth = 1.8; g.strokeStyle = "#2b2f33"; g.stroke();
    g.fillStyle = "#e4553f"; g.strokeStyle = TINTA; g.lineWidth = 1.4; g.beginPath(); g.moveTo(18, -24); g.lineTo(30, -32); g.lineTo(30, -28); g.lineTo(19, -16); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#2b2f33"; g.fillRect(-20, -4, 40, 4);
    g.restore();
  }
  function frutero(g, x, y) {
    g.save(); g.translate(x, y);
    const frutas = [[-12, -14, 8, "#f2c040"], [0, -18, 9, "#e4553f"], [12, -14, 8, "#7fbf4a"], [-5, -24, 7, "#f08a3a"]];
    for (const [fx, fy, r, col] of frutas) { g.fillStyle = col; g.beginPath(); g.arc(fx, fy, r, 0, Math.PI * 2); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 1.3; g.stroke(); }
    g.fillStyle = "#3f8fc4"; g.beginPath(); g.moveTo(-24, -12); g.quadraticCurveTo(0, 8, 24, -12); g.closePath(); g.fill(); g.stroke();
    g.restore();
  }
  function cucharones(g, x, y) {
    g.save(); g.translate(x, y);
    g.strokeStyle = TINTA; g.lineWidth = 2.4;
    g.beginPath(); g.moveTo(-4, -20); g.lineTo(-10, -50); g.stroke(); g.fillStyle = "#c9a26a"; g.beginPath(); g.ellipse(-11, -54, 4, 7, -0.2, 0, Math.PI * 2); g.fill(); g.lineWidth = 1.2; g.stroke();
    g.lineWidth = 2.4; g.beginPath(); g.moveTo(3, -20); g.lineTo(8, -54); g.stroke(); g.fillStyle = "#9aa3ab"; g.beginPath(); g.ellipse(8, -57, 5, 4, 0, 0, Math.PI * 2); g.fill(); g.lineWidth = 1.2; g.stroke();
    g.fillStyle = "#f0e2c4"; g.beginPath(); rectanguloRedondeado(g, -11, -24, 22, 24, 3); g.fill(); g.stroke();
    g.fillStyle = "#3f8fc4"; g.fillRect(-11, -16, 22, 4);
    g.restore();
  }
  function tabla(g, x, y) {
    g.save(); g.translate(x, y); g.rotate(-0.12);
    g.fillStyle = "#c08a52"; g.beginPath(); rectanguloRedondeado(g, -20, -60, 40, 60, 8); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 1.6; g.stroke();
    g.fillStyle = "#f2e6c4"; g.beginPath(); g.arc(0, -50, 4, 0, Math.PI * 2); g.fill(); g.stroke();
    g.restore();
  }
  function sueloBarro(g) {
    const y0 = SUELO_PARED, y1 = H + 70;
    g.fillStyle = "#c97b52"; g.fillRect(-80, y0, W + 160, y1 - y0);
    g.strokeStyle = "rgba(120,60,30,0.5)"; g.lineWidth = 1.3;
    const fil = [y0, y0 + 14, y0 + 32, y0 + 56, y0 + 88, y0 + 128, y0 + 180];
    for (const y of fil) { g.beginPath(); g.moveTo(-80, y); g.lineTo(W + 80, y); g.stroke(); }
    for (let i = -16; i <= 16; i++) { const xb = W / 2 + i * 48; g.beginPath(); g.moveTo(xb, y0); g.lineTo(W / 2 + i * 120, y1); g.stroke(); }
    g.fillStyle = "rgba(255,230,200,0.12)"; for (let i = 0; i < fil.length - 1; i++) if (i % 2) g.fillRect(-80, fil[i], W + 160, fil[i + 1] - fil[i]);
    const gs = g.createLinearGradient(0, y0, 0, y0 + 30); gs.addColorStop(0, "rgba(40,20,10,0.35)"); gs.addColorStop(1, "rgba(40,20,10,0)");
    g.fillStyle = gs; g.fillRect(-80, y0, W + 160, 30);
  }
  // lámpara colgante (encima de todo el decorado) y su luz
  let lampara = null;
  function creaLampara() {
    const c = document.createElement("canvas"); c.width = 520; c.height = 520; const g = c.getContext("2d");
    g.translate(260, 40);
    const gl = g.createRadialGradient(0, 70, 10, 0, 220, 260); gl.addColorStop(0, "rgba(255,226,150,0.32)"); gl.addColorStop(1, "rgba(255,226,150,0)");
    g.fillStyle = gl; g.beginPath(); g.moveTo(-20, 50); g.lineTo(20, 50); g.lineTo(240, 470); g.lineTo(-240, 470); g.closePath(); g.fill();
    g.strokeStyle = TINTA; g.lineWidth = 1.6; g.beginPath(); g.moveTo(0, -60); g.lineTo(0, 20); g.stroke();
    g.fillStyle = "#3f8f84"; g.beginPath(); g.moveTo(-8, 18); g.lineTo(8, 18); g.lineTo(30, 50); g.lineTo(-30, 50); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#fff4cc"; g.beginPath(); g.ellipse(0, 51, 14, 4, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "rgba(255,255,255,0.35)"; g.beginPath(); g.moveTo(-4, 22); g.lineTo(-20, 48); g.lineTo(-14, 48); g.lineTo(0, 22); g.closePath(); g.fill();
    return c;
  }

  /* ---------- cámara ---------- */
  function camara(t) {
    const tec = dentro(t, T.atras0, T.dedo, T.start + 0.1, T.aparta1);
    const sus = dentro(t, T.lleno, T.bum - 0.1, T.bum, T.bum + 0.5);
    const mar = tramo(t, T.mEntra0 - 0.3, T.mEntra0 + 0.9);
    const fin = tramo(t, T.mLanza, T.atrapa + 0.3);
    const k = 1.12 + 0.07 * tec + 0.05 * sus - 0.1 * mar + 0.04 * fin;
    let x = 420 + 15 * tec + 40 * sus + 55 * mar - 20 * fin, y = 318 - 8 * tec - 6 * sus + 6 * mar - 6 * fin;
    // sacudida al reventar (suave y continua)
    const sa = Math.exp(-6 * Math.max(0, t - T.bum)) * (t > T.bum ? 1 : 0) * tramo(t, T.bum, T.bum + 0.04);
    x += 4 * sa * ruido(t * 22); y += 3 * sa * ruido(t * 19 + 3);
    return { k, x, y };
  }

  function poses(t) { return { g: poseG(t), m: poseM(t) }; }

  class ElMicroondas extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !M.listo()) return;
      if (!fondo) { fondo = creaFondo(); creaPalomitas(); monton = creaMonton(); sueltas = creaSueltas(); racimo = creaRacimo(); lampara = creaLampara(); }
      const pG = poseG(t), pM = t > T.mEntra0 ? poseM(t) : null;
      const luz = tramo(t, NEGRO_INICIO, 0.8, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t);
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      BASE_M = g.getTransform();
      g.drawImage(fondo, -80, -70);
      dibMicroondas(g, t);
      vapor(g, t);
      pops(g, t);
      zumbido(g, t);
      pitidos(g, t);
      portazo(g, t);
      enceste(g, t);
      g.drawImage(lampara, 520 - 260, 40);
      // el sobre en vuelo
      const b = sobre(t);
      if (b && b.vuelo) dibSobre(g, b);
      // Guillermo
      G.dibujar(g, pG, t);
      susto(g, t, pG);
      explosion(g, t);
      dibRacimos(g, t);
      // la montaña
      const nv = nivel(t);
      if (nv > 0.001) {
        g.save(); g.globalAlpha = 0.3 * nv; g.fillStyle = "#4a2a14"; g.beginPath(); g.ellipse(360, 572, 270 * (0.4 + 0.6 * nv), 12, 0, 0, Math.PI * 2); g.fill(); g.restore();
        g.save(); g.beginPath(); g.rect(-100, -100, W + 200, 576 + 100); g.clip();
        g.drawImage(monton, MON.x0, MON.y0 + (1 - nv) * ALTO, MON.w, MON.h);
        g.restore();
      }
      dibSueltas(g, t);
      agujero(g, t);
      enElPelo(g, t, pG);
      if (pM) M.dibujar(g, pM, t);
      if (pM) { enManoM(g, t, pM); vuelos(g, t); crunch(g, t, pG, pM); }
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00096.2", nombre: "Guillermo y Marta · El microondas", crear: () => new ElMicroondas() });
  window.__A2D_00096_2 = { pose: poses, poseG, poseM, T, DUR, vueloGrano, enCuenquito, enPinza, quedanEnMano, PUNADO, sobre, centroSobre, MANO_SOBRE, textoPantalla, pulsacion, AGUJERO, ySup, offsetIndice, TECLA9, BOTON, PLATO };
})();
