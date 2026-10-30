"use strict";
/* 00054 · Guillermo y Dari · El pelo rizado
 *
 * Negro → salita de un café de barrio en una tarde de lluvia: pared mostaza, ventana redonda con la
 * lluvia, lámpara de pie con flecos, una estantería, una mesita con un té humeante y un cuadro con una
 * espiral. Dari está repantingado en un puf haciendo un crucigrama → entra Guillermo con las manos en
 * los bolsillos, se para y se queda embobado con los rizos de Dari → mira a cámara con cara de pillo y
 * los toca con un dedo: el dedo se hunde en los rizos (¡boing!) → risita → mete la mano entera hasta
 * la muñeca, hurga… y se le queda atascada → tira y la cabeza de Dari se va con él (Dari ni levanta
 * la vista) → apoya el pie en el puf, tira con todo y ¡plop!: sale con un lápiz y la parte de atrás
 * queda despeinada → Dari, sin mirar, tiende la mano, se lo quita y rellena una casilla → Guillermo
 * vuelve a meter la mano y saca un tenedor, un calcetín de rayas y un patito de goma, que va tirando
 * por encima del hombro al suelo → la última vez se oye un pío: asoma un herrerillo, salta a su mano,
 * pía y se va volando → Dari se guarda el lápiz en los rizos (asoma la goma), se los ahueca con dos
 * palmaditas y sigue a lo suyo; una pluma le cae a Guillermo en la nariz y Dari sonríe a cámara → negro.
 *
 * La mano de Guillermo se dibuja detrás de Dari, así que su pelo la tapa; encima, en el retrato de
 * Dari (capaCabeza), un anillo de rizos envuelve la muñeca justo en el punto de entrada (SUP), que es
 * por donde sale todo. Sin textos: el crucigrama son casillas y los píos son notitas. Todo depende de t.
 */
(() => {
  const { clamp, lerp, fase, suave, suave5, salida, entrada, tramo, campana, mezcla, ruido, hash } = M2;
  const G = Guillermo, D = Dari;
  const S = 0.30, SUELO = 560, DUR = 14.75;
  const TINTA = "#0b0a0e";
  const PELO = "#5a3526", PELO_OSC = "#22130d", PELO_LUZ = "#86563a";
  const T = {
    entra0: 0.2, llega: 2.3,
    embobado: 2.35, pillo: 2.95,
    dedo0: 3.3, dedoIn: 3.55, dedoOut: 3.78, boing: 3.8, risa0: 3.95, risa1: 4.45,
    mano0: 4.5, manoIn: 5.0, hurga1: 5.55,
    tira1: 5.6, tira1b: 5.98, pie0: 6.05, tira2: 6.2, pop: 6.62,
    mira0: 7.0, vuelve: 7.15, palma0: 7.3, palma1: 7.62, da0: 7.55, da1: 7.9, quita: 7.95, marca0: 8.2, marca1: 8.5,
    curioso: 8.25,
    o1in: 8.75, o1out: 9.0, o1tira: 9.42,
    o2in: 9.7, o2out: 9.9, o2tira: 10.25,
    o3in: 10.52, o3out: 10.72, o3tira: 11.06,
    p0in: 11.3, pio1: 11.55, p0out: 11.72, salta: 11.82, posa: 12.05, pio2: 12.2, vuela: 12.45,
    alza: 12.75, mete0: 12.95, mete1: 13.25, ahueca0: 13.35, ahueca1: 13.7, lee: 13.85,
    pluma: 13.4, sonrie: 13.85,
    fin: 14.15
  };

  /* ---------- utilidades ---------- */
  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n] ?? a[n], k); return o; };
  function guion(lista, tabla, t, base) {
    let c = tabla[base];
    for (const [t0, t1, nom, f] of lista) { if (t <= t0) break; c = mezclaE(c, tabla[nom], (f || suave)(fase(t, t0, t1))); }
    return Object.assign({}, c);
  }
  function parpadeos(lista, t) {
    let o = 0;
    for (const tb of lista) { const k = fase(t, tb, tb + 0.15); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); }
    return o;
  }
  // claves [t, valor] con transición suave entre una y la siguiente
  function claves(L, t) {
    if (t <= L[0][0]) return L[0][1];
    for (let i = 0; i < L.length - 1; i++) { const [t0, a] = L[i], [t1, b] = L[i + 1]; if (t < t1) return lerp(a, b, suave(fase(t, t0, t1))); }
    return L[L.length - 1][1];
  }
  const dedosDe = (b, ch) => ({ pulgar: b[ch + "0"], indice: b[ch + "1"], medio: b[ch + "2"], anular: b[ch + "3"], menique: b[ch + "4"] });
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

  /* ---------- los rizos de Dari (retrato) ---------- */
  // Por aquí entra y sale todo: en la parte de atrás de la melena rizada, del lado de Guillermo.
  const SUP = { x: 492, y: 470 }, DENTRO = { x: 574, y: 482 };
  const UX = (DENTRO.x - SUP.x) / Math.hypot(DENTRO.x - SUP.x, DENTRO.y - SUP.y), UY = (DENTRO.y - SUP.y) / Math.hypot(DENTRO.x - SUP.x, DENTRO.y - SUP.y);
  const enPantallaD = (pd, q) => D.aPantalla(pd, D.cabeza(pd).a(q));
  // un rizo de Dari (unidades del retrato): bolita oscura con sus medias lunas de brillo y de sombra
  function rizo(g, x, y, r, giro) {
    if (r < 1) return;
    g.save(); g.translate(x, y); g.rotate(giro); g.lineCap = "round";
    g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.fillStyle = PELO; g.fill();
    // contorno abierto (como los rizos del retrato) y un tirabuzón oscuro dentro
    g.strokeStyle = PELO_OSC; g.lineWidth = 3; g.beginPath(); g.arc(0, 0, r, 0.5, 5.4); g.stroke();
    g.lineWidth = Math.max(2.5, r * 0.2); g.beginPath();
    for (let k = 0; k <= 12; k++) { const a = 0.6 + k / 12 * Math.PI * 1.7, rr = r * (0.75 - 0.4 * k / 12); const px = Math.cos(a) * rr, py = Math.sin(a) * rr; if (k) g.lineTo(px, py); else g.moveTo(px, py); }
    g.stroke();
    g.strokeStyle = PELO_LUZ; g.lineWidth = Math.max(2, r * 0.2); g.beginPath(); g.arc(0, 0, r * 0.7, 3.5, 5.3); g.stroke();
    g.restore();
  }
  // Rizos alrededor de la entrada [a lo largo del contorno, hacia fuera, radio, giro]
  const ANILLO = [[-52, 6, 20, 0.2], [-30, 14, 24, 1.1], [-6, 18, 25, 2.3], [18, 16, 24, 0.7], [42, 8, 21, 1.9], [-40, -6, 19, 2.9], [32, -6, 20, 0.4], [6, 2, 18, 1.4]];
  // rizos despeinados que se quedan de punta después de tanto hurgar
  const GREÑAS = [[-34, 58, 26, 0.5, -0.6], [-4, 74, 30, 1.7, 0.1], [26, 60, 25, 2.6, 0.7], [-60, 40, 22, 0.9, -1.0], [50, 42, 21, 2.0, 1.0], [8, 34, 20, 0.3, 0.3]];
  function anilloRizos(g, k, t, estira, temblor) {
    if (k <= 0.01) return;
    const nx = -UY, ny = UX;
    ANILLO.forEach(([a, f, r, gi], i) => {
      const w = 1 + 0.1 * Math.sin(t * 23 + i * 1.7) * temblor;
      const fuera = f + estira * (18 + 22 * hash(i + 7));
      const x = SUP.x + nx * a * (1 - 0.2 * estira) - UX * fuera + 3 * temblor * Math.sin(t * 31 + i);
      const y = SUP.y + ny * a * (1 - 0.2 * estira) - UY * fuera + 3 * temblor * Math.cos(t * 27 + i * 2);
      rizo(g, x, y, r * clamp(k * 1.5 - i * 0.06) * w, gi + t * 0.3 * temblor);
    });
  }
  function greñas(g, k, t, rebota) {
    if (k <= 0.01) return;
    const nx = -UY, ny = UX;
    GREÑAS.forEach(([a, f, r, gi, sale], i) => {
      const kk = clamp(k * 1.6 - i * 0.12), mu = 1 + 0.18 * rebota * Math.sin(t * 19 + i * 2.1);
      const fx = f * kk * mu, ax = a + sale * 18 * kk;
      const x = SUP.x + nx * ax - UX * fx, y = SUP.y + ny * ax - UY * fx;
      // muelle de pelo desde el contorno hasta el rizo suelto
      g.save(); g.strokeStyle = PELO_OSC; g.lineWidth = 9; g.lineCap = "round"; g.beginPath(); g.moveTo(SUP.x + nx * a - UX * 4, SUP.y + ny * a - UY * 4);
      g.quadraticCurveTo((SUP.x + nx * a + x) / 2 + nx * 10, (SUP.y + ny * a + y) / 2 + ny * 10, x, y); g.stroke(); g.restore();
      rizo(g, x, y, r * kk, gi + 0.4 * Math.sin(t * 3 + i));
    });
  }

  /* ---------- objetos (unidades de mano: 1 = JK hoja; el +x apunta hacia dentro del pelo) ---------- */
  function lapiz(g, hasta = 99) {
    g.save(); g.lineJoin = "round";
    g.beginPath(); g.rect(-30, -12, Math.max(0, hasta + 30), 24); g.clip();
    g.strokeStyle = TINTA; g.lineWidth = 1.4;
    g.fillStyle = "#f08a9a"; g.beginPath(); g.roundRect ? g.roundRect(-20, -3.4, 8, 6.8, 2) : g.rect(-20, -3.4, 8, 6.8); g.fill(); g.stroke();
    g.fillStyle = "#c9ced6"; g.fillRect(-12.5, -3.6, 5, 7.2); g.strokeRect(-12.5, -3.6, 5, 7.2);
    g.fillStyle = "#f4c430"; g.fillRect(-7.5, -3.4, 40, 6.8); g.strokeRect(-7.5, -3.4, 40, 6.8);
    g.fillStyle = "#d9a21c"; g.fillRect(-7.5, 0.8, 40, 2.4);
    g.fillStyle = "#f1d2a0"; g.beginPath(); g.moveTo(32.5, -3.4); g.lineTo(42, -1); g.lineTo(42, 1); g.lineTo(32.5, 3.4); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#2a2a30"; g.beginPath(); g.moveTo(40, -1.2); g.lineTo(44.5, 0); g.lineTo(40, 1.2); g.closePath(); g.fill();
    g.restore();
  }
  function tenedor(g) {
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    g.fillStyle = "#d4dae2"; g.strokeStyle = TINTA; g.lineWidth = 1.4;
    g.beginPath(); g.moveTo(-18, -2.8); g.quadraticCurveTo(-21, 0, -18, 2.8); g.lineTo(14, 1.6); g.lineTo(14, -1.6); g.closePath(); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(14, -1.6); g.quadraticCurveTo(20, -5.5, 24, -5.5); g.lineTo(24, 5.5); g.quadraticCurveTo(20, 5.5, 14, 1.6); g.closePath(); g.fill(); g.stroke();
    for (const y of [-4.4, -1.5, 1.5, 4.4]) { g.beginPath(); g.moveTo(24, y); g.lineTo(38, y * 1.05); g.lineWidth = 3.6; g.strokeStyle = TINTA; g.stroke(); g.lineWidth = 1.6; g.strokeStyle = "#d4dae2"; g.stroke(); }
    g.strokeStyle = "rgba(255,255,255,0.8)"; g.lineWidth = 1; g.beginPath(); g.moveTo(-14, -0.8); g.lineTo(12, -0.6); g.stroke();
    g.restore();
  }
  // calcetín de rayas: cuelga hacia abajo desde la mano (ang = giro de la mano, para que cuelgue en vertical)
  function calcetin(g, ang, balanceo, colgar = 1) {
    g.save(); g.rotate(lerp(-Math.PI / 2, -ang + balanceo, colgar)); g.lineJoin = "round";
    const forma = () => { g.beginPath(); g.moveTo(-6, -4); g.lineTo(6, -4); g.lineTo(6.5, 26); g.quadraticCurveTo(7, 32, 14, 33); g.lineTo(20, 33.5);
      g.quadraticCurveTo(26, 34, 26, 39); g.quadraticCurveTo(26, 44, 19, 44); g.lineTo(2, 43.5); g.quadraticCurveTo(-6.5, 43, -6.5, 34); g.closePath(); };
    forma(); g.fillStyle = "#fbf6ee"; g.fill();
    g.save(); forma(); g.clip(); g.fillStyle = "#d8343e";
    for (let y = -2; y < 46; y += 8) g.fillRect(-10, y, 40, 4);
    g.fillStyle = "#2b4f9a"; g.fillRect(-10, 38, 40, 8); g.restore();
    forma(); g.strokeStyle = TINTA; g.lineWidth = 1.5; g.stroke();
    g.restore();
  }
  function patito(g, ang, fuera = 0) {
    g.save(); g.translate(fuera, 0); g.rotate(-ang * 0.6); g.lineJoin = "round";
    g.strokeStyle = TINTA; g.lineWidth = 1.5;
    g.fillStyle = "#ffd23a"; g.beginPath(); g.ellipse(6, 4, 14, 9.5, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(-6, 0); g.quadraticCurveTo(-12, -2, -10, -7); g.quadraticCurveTo(-6, -2, -3, -3); g.closePath(); g.fill(); g.stroke();
    g.beginPath(); g.arc(14, -7, 7.5, 0, Math.PI * 2); g.fill(); g.stroke();
    g.fillStyle = "#ff8a1f"; g.beginPath(); g.moveTo(20, -8); g.quadraticCurveTo(28, -8, 27, -4.5); g.quadraticCurveTo(24, -3, 20, -4); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = TINTA; g.beginPath(); g.arc(16, -9, 1.6, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#ffffff"; g.beginPath(); g.arc(16.5, -9.6, 0.6, 0, Math.PI * 2); g.fill();
    g.fillStyle = "rgba(255,255,255,0.7)"; g.beginPath(); g.ellipse(2, 0, 5, 2.4, -0.3, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "#d9a21c"; g.lineWidth = 1.2; g.beginPath(); g.moveTo(0, 6); g.quadraticCurveTo(6, 10, 12, 6); g.stroke();
    g.restore();
  }
  const OBJETOS = { lapiz: (g) => lapiz(g), tenedor, calcetin: (g, a, b, c) => calcetin(g, a, b, c), patito: (g, a) => patito(g, a, 20) };
  // qué lleva Guillermo en la mano lejana: [desde, hasta, objeto]
  const EN_MANO = [[T.pop - 0.2, T.quita, "lapiz"], [T.o1out - 0.15, T.o1tira, "tenedor"], [T.o2out - 0.12, T.o2tira, "calcetin"], [T.o3out - 0.12, T.o3tira, "patito"]];
  const objetoEnMano = t => { for (const [a, b, o] of EN_MANO) if (t >= a && t < b) return o; return null; };
  // lanzados por encima del hombro: [suelta, objeto, x de aterrizaje, giro final, vueltas]
  const LANZA = [[T.o1tira, "tenedor", 352, 0.12, 2], [T.o2tira, "calcetin", 322, -Math.PI / 2 + 0.2, 1], [T.o3tira, "patito", 384, 0, 1]];
  // el calcetín sale de los rizos estirado y, ya fuera, cae y se balancea colgando de la mano
  const colgarCalcetin = t => salida(fase(t, T.o2out + 0.04, T.o2out + 0.22));
  const balanceoCalcetin = t => { const u = t - T.o2out - 0.22; return u > 0 ? 0.4 * Math.sin(u * 11) * Math.exp(-u * 3.5) : 0; };
  const VUELO = 0.58, SUELO_OBJ = 553;

  /* ---------- caras ---------- */
  const BASEC = { mx: 0.85, my: 0, c: 0, cd: 0, ci: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, orig: 0, abre: 0, ancho: 1, sonr: 0.12, dientes: 1, lengua: 0, mof: 0 };
  const E = o => Object.assign({}, BASEC, o);
  const CARAS_G = {
    inicio: E({ mx: 0.85, my: 0.05, sonr: 0.35, ancho: 0.95, abre: 4, sd: 4, gd: 0.05, si: 4, gi: 0.05 }),
    embobado: E({ mx: 0.95, my: 0.45, iris: 1.16, sd: 22, gd: 0.18, si: 22, gi: 0.18, abre: 12, ancho: 0.55, sonr: 0.15, lengua: 0 }),
    pillo: E({ mx: -0.85, my: -0.05, c: 0.25, h: 0.35, sonr: 0.9, ancho: 1.05, abre: 9, sd: 18, gd: 0.18, si: 2, gi: -0.08 }),
    apunta: E({ mx: 0.95, my: 0.5, sonr: 0.4, ancho: 0.7, abre: 7, lengua: 1, sd: 8, gd: 0.06, si: 8, gi: 0.06 }),
    boing: E({ mx: 0.95, my: 0.45, iris: 1.15, sonr: 0.3, ancho: 0.6, abre: 18, sd: 24, gd: 0.2, si: 24, gi: 0.2 }),
    risita: E({ mx: -0.85, my: -0.1, c: 0.4, h: 0.6, sonr: 0.95, ancho: 1.05, abre: 16, sd: 12, gd: 0.15, si: 12, gi: 0.15 }),
    mete: E({ mx: 0.95, my: 0.5, sonr: 0.5, ancho: 0.8, abre: 6, lengua: 0.8, sd: 4, gd: 0.04, si: 4, gi: 0.04, c: 0.15 }),
    hurga: E({ mx: 0.6, my: -0.35, sonr: 0.45, ancho: 0.8, abre: 10, sd: 14, gd: 0.12, si: 6, gi: 0.02, iris: 1.05 }),
    atasco: E({ mx: 0.95, my: 0.45, iris: 1.1, sonr: -0.2, ancho: 0.7, abre: 10, sd: 20, gd: 0.18, si: 20, gi: 0.18 }),
    esfuerzo: E({ mx: 0.9, my: 0.35, c: 0.9, z: 0.85, sonr: -0.25, ancho: 1.15, abre: 16, sd: -10, gd: -0.2, si: -10, gi: -0.2 }),
    pop: E({ mx: 0.9, my: 0.0, iris: 1.12, sonr: -0.1, ancho: 0.8, abre: 38, sd: 26, gd: 0.22, si: 26, gi: 0.22, lengua: 0.3 }),
    lapiz: E({ mx: 0.9, my: -0.35, iris: 1.1, sonr: 0.05, ancho: 0.65, abre: 8, sd: 18, gd: 0.18, si: 4, gi: 0 }),
    sorprendido: E({ mx: 0.7, my: 0.4, iris: 1.14, sonr: 0, ancho: 0.6, abre: 24, sd: 28, gd: 0.22, si: 28, gi: 0.22 }),
    curioso: E({ mx: -0.85, my: -0.05, sonr: 0.65, ancho: 0.95, abre: 5, sd: 20, gd: 0.2, si: -2, gi: -0.1 }),
    saca: E({ mx: 0.9, my: -0.2, iris: 1.12, sonr: 0.25, ancho: 0.7, abre: 22, sd: 20, gd: 0.2, si: 20, gi: 0.2 }),
    pio: E({ mx: 0.95, my: 0.4, iris: 0.92, sonr: -0.1, ancho: 0.55, abre: 12, sd: 26, gd: 0.22, si: 26, gi: 0.22 }),
    pajaro: E({ mx: 0.95, my: -0.1, iris: 1.18, sonr: 0.35, ancho: 0.7, abre: 16, sd: 22, gd: 0.2, si: 22, gi: 0.2 }),
    sube: E({ mx: 0.85, my: -0.85, iris: 1.05, sonr: 0, ancho: 0.6, abre: 22, sd: 26, gd: 0.22, si: 26, gi: 0.22 }),
    atonito: E({ mx: -0.88, my: -0.05, iris: 0.78, sonr: -0.2, ancho: 0.62, abre: 34, sd: 30, gd: 0.24, si: 30, gi: 0.24, lengua: 0.2 })
  };
  const GUION_CARA_G = [
    [T.embobado, T.embobado + 0.25, "embobado"], [T.pillo, T.pillo + 0.2, "pillo"], [T.dedo0, T.dedo0 + 0.2, "apunta"],
    [T.boing - 0.06, T.boing + 0.05, "boing", salida], [T.risa0, T.risa0 + 0.15, "risita"], [T.mano0, T.mano0 + 0.2, "mete"],
    [T.manoIn, T.manoIn + 0.2, "hurga"], [T.tira1, T.tira1 + 0.18, "atasco"], [T.pie0, T.tira2, "esfuerzo"],
    [T.pop, T.pop + 0.06, "pop", salida], [T.mira0, T.mira0 + 0.25, "lapiz"], [T.quita - 0.05, T.quita + 0.15, "sorprendido"],
    [T.curioso, T.curioso + 0.25, "curioso"], [T.o1in - 0.2, T.o1in, "mete"], [T.o1out, T.o1out + 0.08, "saca", salida],
    [T.o2in - 0.15, T.o2in, "mete"], [T.o2out, T.o2out + 0.08, "saca", salida], [T.o3in - 0.15, T.o3in, "mete"],
    [T.o3out, T.o3out + 0.08, "saca", salida], [T.p0in - 0.15, T.p0in, "mete"], [T.pio1, T.pio1 + 0.08, "pio", salida],
    [T.salta, T.salta + 0.2, "pajaro"], [T.vuela, T.vuela + 0.2, "sube"], [T.pluma - 0.3, T.pluma, "atonito"]
  ];
  const PARP_G = [0.9, 2.1, 4.35, 7.35, 8.6, 12.85];
  const CARAS_D = {
    lee: E({ mx: 0.62, my: 0.62, c: 0.36, sonr: 0.08, ancho: 0.92, sd: 2, gd: 0.02, si: 2, gi: 0.02 }),
    ceja: E({ mx: 0.62, my: 0.62, c: 0.3, sonr: 0.02, ancho: 0.88, sd: 16, gd: 0.18, si: 0, gi: 0 }),
    tiron: E({ mx: 0.62, my: 0.62, c: 0.42, z: 0.15, sonr: -0.08, ancho: 0.85, sd: 10, gd: 0.12, si: -4, gi: -0.06 }),
    mira: E({ mx: -0.85, my: -0.1, c: 0.2, sonr: 0.05, ancho: 0.9, sd: 12, gd: 0.12, si: 2, gi: 0.02 }),
    reojo: E({ mx: -0.9, my: 0.2, c: 0.38, sonr: 0.02, ancho: 0.88, sd: 4, gd: 0.04, si: 14, gi: 0.14 }),
    sonrie: E({ mx: -0.9, my: -0.12, c: 0.28, sonr: 0.55, ancho: 0.92, abre: 3, sd: 14, gd: 0.16, si: 2, gi: 0.02 })
  };
  const GUION_CARA_D = [
    [T.dedoIn, T.dedoIn + 0.15, "ceja"], [T.risa1, T.risa1 + 0.3, "lee"], [T.tira1, T.tira1 + 0.15, "tiron"], [T.pop + 0.05, T.pop + 0.35, "lee"],
    [T.o3out + 0.05, T.o3out + 0.2, "reojo"], [T.o3out + 0.5, T.o3out + 0.75, "lee"],
    [T.pio1 + 0.05, T.pio1 + 0.25, "ceja"], [T.vuela, T.vuela + 0.2, "mira"], [T.ahueca0, T.ahueca0 + 0.25, "lee"], [T.sonrie, T.sonrie + 0.25, "sonrie"]
  ];
  const PARP_D = [1.6, 4.1, 7.0, 9.6, 11.0, 13.2];
  function cara(e, parp) {
    return { mirada: { x: e.mx, y: e.my }, iris: e.iris, espiral: 0,
      ojos: { d: Math.max(e.c, e.cd, parp), i: Math.max(e.c, e.ci, parp), feliz: e.h, apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: e.orig, abre: e.abre, ancho: e.ancho, sonrisa: e.sonr, dientes: e.dientes > 0.5, lengua: e.lengua },
      mofletes: e.mof, rubor: 0, bigote: 0 };
  }

  /* ---------- Dari: repantingado en el puf con su crucigrama ---------- */
  const XD = 662, PEL_D = 412, TORSO_D = -0.36, CAB_D = -0.12;
  const PIES_D = { cerca: { x: 790, y: SUELO - 25 }, lejos: { x: 826, y: SUELO - 29 } };
  // tirón de los rizos: la cabeza (y algo el cuerpo) se van hacia Guillermo
  function tiron(t) {
    if (t < T.pop) {
      const a = 0.5 * suave(fase(t, T.tira1, T.tira1 + 0.3)) - 0.17 * suave(fase(t, T.tira1b - 0.1, T.tira1b));
      const b = 0.67 * suave(fase(t, T.tira2, T.pop - 0.04));
      return a + b + 0.03 * ruido(t * 30) * campana(t, T.tira1, T.pop);
    }
    // al soltarse, la cabeza vuelve de golpe con un rebote amortiguado
    const u = t - T.pop;
    return Math.exp(-u * 7) * Math.cos(u * 20);
  }
  // lo despeinado que queda la parte de atrás (crece con cada cosa que sale; Dari lo arregla con dos palmaditas)
  function despeine(t) {
    const d = 0.55 * tramo(t, T.pop - 0.05, T.pop + 0.15, salida) + 0.15 * tramo(t, T.o1out, T.o1out + 0.15, salida) +
      0.15 * tramo(t, T.o2out, T.o2out + 0.15, salida) + 0.15 * tramo(t, T.o3out, T.o3out + 0.15, salida) + 0.2 * tramo(t, T.salta - 0.1, T.salta + 0.1, salida);
    const arregla = 0.5 * tramo(t, T.ahueca0 + 0.04, T.ahueca0 + 0.14) + 0.5 * tramo(t, T.ahueca0 + 0.21, T.ahueca0 + 0.31);
    return clamp(d) * (1 - arregla);
  }
  // se incorpora un poco del puf cuando levanta el brazo (para coger el lápiz y para guardárselo)
  const incorporaD = t => tramo(t, T.palma0 - 0.15, T.palma1) * (1 - tramo(t, T.quita + 0.05, T.quita + 0.45)) +
    tramo(t, T.alza - 0.35, T.alza + 0.05) * (1 - tramo(t, T.ahueca1, T.lee + 0.15));
  // inclina la cabeza hacia la mano para guardar el lápiz y ahuecarse los rizos
  const inclinaD = t => tramo(t, T.alza - 0.1, T.alza + 0.2) * (1 - tramo(t, T.ahueca1, T.lee + 0.15));
  // cuánto se ve el anillo de rizos que tapa la muñeca o el lápiz
  function kAnillo(t) {
    const prof = claves(PROF, t), kP = claves(PELO_K, t);
    const lap = 0.8 * tramo(t, T.mete0 - 0.05, T.mete0 + 0.12) - 0.3 * tramo(t, T.mete1, T.ahueca1);
    return Math.max(kP * clamp((prof + 30) / 26), lap);
  }
  function capaPeloD(g, t, pd) {
    const tr = tiron(t), estira = t < T.pop ? clamp(tr) : 0, tb = temblorPelo(t);
    greñas(g, despeine(t), t, 0.4 + tb);
    anilloRizos(g, kAnillo(t), t, estira, 0.4 + tb);
    // el lápiz guardado: asoma la goma entre los rizos
    if (t >= T.mete1) {
      const xs = surLapiz(1), fac = dist(enPantallaD(pd, SUP), enPantallaD(pd, DENTRO)) / Math.hypot(DENTRO.x - SUP.x, DENTRO.y - SUP.y);
      const e = JKS / fac;
      g.save(); g.translate(SUP.x - UX * xs * e, SUP.y - UY * xs * e); g.rotate(Math.atan2(UY, UX)); g.scale(e, e); lapiz(g, xs); g.restore();
      const k = tramo(t, T.mete1, T.mete1 + 0.25, salida), nx = -UY, ny = UX;
      rizo(g, SUP.x + nx * 16 - UX * 4, SUP.y + ny * 16 - UY * 4, 15 * k, 0.8);
      rizo(g, SUP.x - nx * 16 - UX * 2, SUP.y - ny * 16 - UY * 2, 14 * k, 2.1);
    }
  }
  // temblor de los rizos al tocarlos o hurgar
  function temblorPelo(t) {
    return campana(t, T.dedoIn - 0.02, T.dedoOut + 0.25) * 0.8 + tramo(t, T.manoIn - 0.2, T.manoIn) * (1 - tramo(t, T.hurga1, T.tira1)) +
      campana(t, T.o1in, T.o1out + 0.2) + campana(t, T.o2in, T.o2out + 0.2) + campana(t, T.o3in, T.o3out + 0.2) + campana(t, T.p0in, T.salta + 0.2) +
      campana(t, T.ahueca0, T.ahueca1 + 0.1) * 0.8;
  }
  // libro (hoja local del torso de Dari): centro y esquinas de las páginas
  const LIBRO = { x: 296, y: 586, ang: -0.62, w: 96, h: 64 };     // en coordenadas del torso (capaTronco)
  const enLibro = (pd, u, v) => {        // punto del libro (u, v en −1..1) en hoja global
    const c = Math.cos(LIBRO.ang), s = Math.sin(LIBRO.ang), x = u * LIBRO.w, y = v * LIBRO.h;
    return D.tronco(pd)({ x: LIBRO.x + x * c - y * s, y: LIBRO.y + x * s + y * c });
  };
  // casilla que rellena con el lápiz (u, v de la página derecha)
  const CASILLA = { u: 0.62, v: -0.30 };
  let cacheD = new Map();
  function poseD(t) {
    const key = Math.round(t * 1e5); if (cacheD.has(key)) return cacheD.get(key);
    if (cacheD.size > 300) cacheD = new Map();
    const e = guion(GUION_CARA_D, CARAS_D, t, "lee");
    const tr = tiron(t), tb = temblorPelo(t);
    const empujon = campana(t, T.pie0, T.pop + 0.2);                 // el pie de Guillermo hunde el puf
    const resp = Math.sin(t * 2.1);
    const inc = inclinaD(t), sube = incorporaD(t);
    const p = {
      x: XD - 12 * tr, suelo: SUELO, s: S,
      pelvis: { x: D.PELVIS.x, y: D.PELVIS.y + PEL_D + resp * 1.5 + 2.4 * empujon * Math.sin(t * 30) },
      torso: TORSO_D - 0.15 * tr + 0.28 * sube + 0.01 * resp, torsoEsc: { x: 1, y: 1 + 0.006 * resp },
      piernas: {},
      cabeza: { ang: CAB_D - 0.5 * tr - 0.1 * inc - 0.05 * sube + 0.03 * tb * Math.sin(t * 25), dx: -16 * tr, dy: 6 * tr,
        esc: { x: 1 - 0.015 * tb * Math.sin(t * 29), y: 1 + 0.015 * tb * Math.sin(t * 29) } },
      cara: cara(e, parpadeos(PARP_D, t)), tirasLimpias: true, ikContinuo: true,
      gafas: { dx: -4 * tr, dy: 11 * tr, ang: -0.09 * tr },
      capaCabeza: null
    };
    p.capaCabeza = gg => capaPeloD(gg, t, p);
    for (const lado of ["cerca", "lejos"]) { const f = PIES_D[lado]; p.piernas[lado] = { tob: D.aHoja(p, f), ang: -0.18 }; }
    // mano lejana: sujeta el libro por el borde derecho
    const bordeDer = enLibro(p, 1.0, 0.25);
    p.manoLejos = { x: bordeDer.x, y: bordeDer.y, ang: LIBRO.ang + TORSO_D - 0.1, mu: -1.2, dobla: 1, puno: 1,
      dedos: { pulgar: 0.75, indice: 0.45, medio: 0.42, anular: 0.4, menique: 0.38 } };
    // mano cercana: en la página; pasa página, coge el lápiz, marca la casilla, ahueca los rizos y guarda el lápiz
    p.manoCerca = manoCercaD(t, p);
    p.capaTronco = gg => dibLibro(gg, t);
    cacheD.set(key, p);
    return p;
  }

  /* ---------- Guillermo ---------- */
  // pasos (px de pantalla de cada tobillo): entra andando desde la izquierda y se planta junto al puf
  const XG = 444;
  const PASOS_G = {
    lejos: [[-10, -9, -100], [0.2, 0.52, 20], [0.8, 1.12, 160], [1.4, 1.72, 300], [2.0, 2.3, XG + 18],
            [T.pop + 0.02, T.pop + 0.24, XG - 22], [T.vuelve, T.vuelve + 0.24, XG + 18]],
    cerca: [[-10, -9, -150], [0.5, 0.82, 90], [1.1, 1.42, 230], [1.7, 2.02, 370], [2.15, 2.4, XG - 19],
            [T.pop + 0.14, T.pop + 0.36, XG - 54], [T.vuelve + 0.14, T.vuelve + 0.38, XG - 19]]
  };
  function pieG(lado, t) {
    const L = PASOS_G[lado]; let i = 0; while (i + 1 < L.length && t >= L[i + 1][0]) i++;
    const [t0, t1, x] = L[i], xa = i > 0 ? L[i - 1][2] : x, u = fase(t, t0, t1);
    const arco = Math.sin(Math.PI * u);
    const alto = Math.min(52, 0.75 * Math.abs(x - xa));       // pasos cortos: el pie sube menos
    return { x: lerp(xa, x, suave5(u)), alto: alto * arco, punta: arco * alto / 52 };
  }
  const TOB_G = G.SUELO - G.TOBILLO_ALTO;
  // el pie lejano se apoya en el puf para tirar con más fuerza
  const PIE_PUF = { x: 506, y: 478 };
  const kPiePuf = t => tramo(t, T.pie0, T.pie0 + 0.15) * (1 - tramo(t, T.pop, T.pop + 0.12));

  // posturas del cuerpo (manos respecto a su hombro, hoja)
  const P0 = { pel: 0, torso: 0, cab: 0, cx: 40, cy: 300, ca: 0, cmu: -1.75, cp: 0, lx: 0, ly: 280, la: 0, lmu: -1.75, lp: 0,
    c0: 0, c1: 0, c2: 0, c3: 0, c4: 0, l0: 0, l1: 0, l2: 0, l3: 0, l4: 0 };
  const C_ = o => Object.assign({}, P0, o);
  const CUERPOS_G = {
    bolsillos: C_({}),
    embobado: C_({ pel: 10, torso: 0.1, cab: 0.06 }),
    apunta: C_({ pel: 12, torso: 0.14, cab: 0.06, lx: 120, ly: 60, la: 0, lmu: -3.14, lp: 1, l0: 0, l1: 1 }),
    risa: C_({ pel: 18, torso: 0.06, cab: 0.08, cx: 200, cy: 60, cmu: -2.0, cp: 1, c0: 0.9, c1: 1, c2: 1, c3: 1, c4: 1, lx: 60, ly: 170, la: 0, lmu: -1.75, lp: 1, l0: 0.3, l1: 0.3, l2: 0.3, l3: 0.3, l4: 0.3 }),
    mete: C_({ pel: 14, torso: 0.16, cab: 0.06, lx: 120, ly: 60, la: 0, lmu: -3.14, lp: 1, l0: 1, l1: 1, l2: 1, l3: 1, l4: 1 }),
    hurga: C_({ pel: 14, torso: 0.18, cab: -0.02, cx: 40, cy: 300, lx: 120, ly: 60, la: 0, lmu: -3.14, lp: 1, l0: 0.5, l1: 0.6, l2: 0.6, l3: 0.6, l4: 0.6 }),
    tira: C_({ pel: 34, torso: -0.14, cab: -0.08, cx: 150, cy: 150, ca: 0, cmu: -1.75, cp: 1, lx: 120, ly: 60, la: 0, lmu: -3.14, lp: 1, l0: 0.3, l1: 0.3, l2: 0.3, l3: 0.3, l4: 0.3 }),
    tira2: C_({ pel: 46, torso: -0.24, cab: -0.14, cx: 120, cy: 110, ca: 0, cmu: -1.75, cp: 1, lx: 120, ly: 60, la: 0, lmu: -3.14, lp: 1, l0: 0.3, l1: 0.3, l2: 0.3, l3: 0.3, l4: 0.3 }),
    pop: C_({ pel: 8, torso: -0.3, cab: -0.2, cx: -60, cy: 120, ca: 0, cmu: -1.75, cp: 1, c0: 1, c1: 1, c2: 1, c3: 1, c4: 1, lx: 80, ly: -60, la: -0.75, lmu: -3.14, lp: 1, l0: 0.35, l1: 0.35, l2: 0.35, l3: 0.35, l4: 0.35 }),
    mira: C_({ pel: 6, torso: 0.0, cab: 0.04, lx: 105, ly: -30, la: -0.6, lmu: -3.14, lp: 1, l0: 0.35, l1: 0.35, l2: 0.35, l3: 0.35, l4: 0.35 }),
    da: C_({ pel: 10, torso: 0.12, cab: 0.06, lx: 160, ly: 60, la: 0, lmu: -3.14, lp: 1, l0: 0.35, l1: 0.35, l2: 0.35, l3: 0.35, l4: 0.35 }),
    curioso: C_({ pel: 6, torso: 0.04, cab: 0.02, lx: 70, ly: 150, la: 0, lmu: -1.75, lp: 1, l0: 0.4, l1: 0.6, l2: 0.55, l3: 0.5, l4: 0.5 }),
    saca: C_({ pel: 10, torso: 0.1, cab: 0.04, lx: 120, ly: 60, la: 0, lmu: -3.14, lp: 1, l0: 0.55, l1: 0.6, l2: 0.6, l3: 0.6, l4: 0.6 }),
    pajaro: C_({ pel: 10, torso: 0.06, cab: 0.04, lx: 130, ly: 20, la: 0, lmu: -3.14, lp: 1, l0: 0.7, l1: 1, l2: 0.15, l3: 0.1, l4: 0.1 }),
    atonito: C_({ pel: 4, torso: -0.03, cab: -0.04, lx: 30, ly: 250, la: 0, lmu: -1.75, lp: 1, l0: 0.45, l1: 0.5, l2: 0.45, l3: 0.42, l4: 0.4 })
  };
  const GUION_G = [
    [T.embobado, T.embobado + 0.35, "embobado"], [T.dedo0 - 0.05, T.dedo0 + 0.2, "apunta"], [T.risa0, T.risa0 + 0.15, "risa"],
    [T.mano0 - 0.05, T.mano0 + 0.2, "mete"], [T.manoIn, T.manoIn + 0.2, "hurga"], [T.tira1, T.tira1 + 0.26, "tira"],
    [T.tira1b, T.tira1b + 0.1, "hurga"], [T.pie0, T.tira2 + 0.05, "tira2"], [T.pop, T.pop + 0.08, "pop", salida],
    [T.mira0, T.mira0 + 0.3, "mira"], [T.da0 - 0.05, T.da1, "da"], [T.quita + 0.05, T.curioso + 0.2, "curioso"],
    [T.o1in - 0.25, T.o1in, "saca"], [T.p0in - 0.25, T.p0in, "saca"], [T.p0out, T.salta, "pajaro"], [T.vuela + 0.1, T.vuela + 0.6, "atonito"]
  ];

  // mano lejana de Guillermo en los rizos: claves [t, cuánto va al pelo, profundidad en px (−: fuera, +: dentro)]
  const PELO_K = [[T.dedo0, 0], [T.dedo0 + 0.2, 1], [T.dedoOut + 0.05, 1], [T.risa0 + 0.05, 0],
    [T.mano0, 0], [T.mano0 + 0.25, 1], [T.pop - 0.02, 1], [T.pop + 0.1, 0.0],
    [T.o1in - 0.2, 0], [T.o1in, 1], [T.o1out + 0.12, 1], [T.o1out + 0.32, 0],
    [T.o2in - 0.2, 0], [T.o2in, 1], [T.o2out + 0.1, 1], [T.o2out + 0.28, 0],
    [T.o3in - 0.2, 0], [T.o3in, 1], [T.o3out + 0.1, 1], [T.o3out + 0.28, 0],
    [T.p0in - 0.2, 0], [T.p0in, 1], [T.p0out + 0.25, 1], [T.vuela + 0.1, 1], [T.vuela + 0.6, 0]];
  const PROF = [[T.dedo0, -48], [T.dedo0 + 0.2, -42], [T.dedoIn, -6], [T.dedoOut - 0.04, -6], [T.dedoOut + 0.05, -48],
    [T.mano0 + 0.2, -42], [T.manoIn, 13], [T.pop - 0.01, 13], [T.pop + 0.08, -66],
    [T.o1in - 0.05, -36], [T.o1in + 0.1, 13], [T.o1out - 0.05, 13], [T.o1out + 0.1, -60],
    [T.o2in - 0.05, -36], [T.o2in + 0.08, 13], [T.o2out - 0.05, 13], [T.o2out + 0.1, -60],
    [T.o3in - 0.05, -36], [T.o3in + 0.08, 13], [T.o3out - 0.05, 13], [T.o3out + 0.1, -60],
    [T.p0in - 0.05, -36], [T.p0in + 0.12, 16], [T.pio1, 16], [T.p0out, -40], [T.posa, -44]];
  // después de sacar cada objeto lo enseña a la altura de la cara y lo tira por encima del hombro
  const ENSENA = [[T.o1out + 0.12, T.o1tira], [T.o2out + 0.1, T.o2tira], [T.o3out + 0.1, T.o3tira]];

  const R_M = G.MUNECA_R * G.JK;
  const punoDesde = (m, ang, mu) => { const o = G.rotP({ x: Math.cos(mu) * R_M, y: Math.sin(mu) * R_M }, ang); return { x: m.x - o.x, y: m.y - o.y }; };
  const BOLS_G = { c: punoDesde({ x: 131, y: 652 }, 0, -1.75), l: punoDesde({ x: 372, y: 648 }, 0, -1.75) };
  const NARIZ_G = { x: 866, y: 684 };

  let cacheG = new Map();
  function poseG(t, pd) {
    const key = Math.round(t * 1e5); if (cacheG.has(key)) return cacheG.get(key);
    if (cacheG.size > 300) cacheG = new Map();
    const b = guion(GUION_G, CUERPOS_G, t, "bolsillos"), e = guion(GUION_CARA_G, CARAS_G, t, "inicio");
    const fl = pieG("lejos", t), fc = pieG("cerca", t);
    const respira = Math.sin(t * 2.4);
    const bote = Math.max(fl.alto, fc.alto) / 52;
    const anda = 1 - tramo(t, T.llega - 0.3, T.llega);
    const x = (fl.x + fc.x) / 2 + 2 + 10 * anda;
    const p = {
      x, suelo: SUELO, s: S,
      pelvis: { x: G.PELVIS.x, y: G.PELVIS.y + b.pel - 14 * bote + respira * 1.2 }, torso: b.torso + 0.05 * anda, torsoEsc: { x: 1, y: 1 + respira * 0.004 },
      piernas: {}, cabeza: { ang: b.cab, dx: 0, dy: 0, esc: { x: 1, y: 1 } },
      cara: cara(e, parpadeos(PARP_G, t)), tirasLimpias: true, ikContinuo: true
    };
    for (const lado of ["cerca", "lejos"]) {
      const f = lado === "cerca" ? fc : fl, hx = G.aHoja(p, { x: f.x, y: 0 }).x;
      p.piernas[lado] = { tob: { x: hx, y: TOB_G - f.alto / S - (lado === "lejos" ? 10 : 0) }, ang: -0.22 * f.punta };
    }
    // el pie lejano en el puf
    const kp = kPiePuf(t);
    if (kp > 0) {
      const q = G.aHoja(p, PIE_PUF), pl = p.piernas.lejos;
      p.piernas.lejos = { tob: mezcla(pl.tob, q, suave(kp)), ang: lerp(pl.ang, -1.05, suave(kp)) };
    }
    // risita: se tapa la boca y le tiemblan los hombros
    const rk = tramo(t, T.risa0, T.risa0 + 0.15) * (1 - tramo(t, T.risa1 - 0.12, T.risa1));
    p.torso += 0.03 * Math.sin(t * 34) * rk; p.cabeza.ang += 0.035 * Math.sin(t * 34 + 1) * rk;
    // tirones: temblor del esfuerzo
    const ef = tramo(t, T.tira1, T.tira1 + 0.25) * (1 - tramo(t, T.pop, T.pop + 0.08));
    p.torso += 0.02 * ruido(t * 26) * ef; p.cabeza.ang += 0.02 * ruido(t * 22 + 3) * ef;
    p.rojo = 0.5 * tramo(t, T.pie0, T.tira2 + 0.2) * (1 - tramo(t, T.pop + 0.2, T.pop + 0.8));
    p.cara.rubor = p.rojo;
    p.sudor = tramo(t, T.tira1 + 0.1, T.tira1 + 0.4) * (1 - tramo(t, T.pop + 0.3, T.pop + 0.9)) + 0.8 * tramo(t, T.pio1, T.pio1 + 0.3) * (1 - tramo(t, T.vuela, T.vuela + 0.5));
    // manos
    const Tr = G.tronco(p), hc = Tr(G.HOMBRO_C), hl = Tr(G.HOMBRO);
    let c = { x: hc.x + b.cx, y: hc.y + b.cy }, l = { x: hl.x + b.lx, y: hl.y + b.ly };
    const bc = Tr(BOLS_G.c), bl = Tr(BOLS_G.l);
    c = mezcla(c, bc, (1 - clamp(b.cp * 1.5)) * (1 - b.cp)); l = mezcla(l, bl, (1 - clamp(b.lp * 1.5)) * (1 - b.lp));
    let angL = b.la, muL = b.lmu, angC = b.ca, muC = b.cmu;
    const H = q => G.aHoja(p, q);
    // risita: la mano cercana a la boca
    if (rk > 0.01) { const bo = G.cabeza(p).a({ x: 830, y: 770 }); c = mezcla(c, bo, rk); angC = lerp(angC, -0.3, rk); muC = lerp(muC, -2.6, rk); }
    // la mano lejana en los rizos de Dari
    const kP = claves(PELO_K, t);
    const sup = enPantallaD(pd, SUP), den = enPantallaD(pd, DENTRO);
    const L = dist(sup, den), ux = (den.x - sup.x) / L, uy = (den.y - sup.y) / L, dirA = Math.atan2(uy, ux);
    if (kP > 0.001) {
      let prof = claves(PROF, t);
      // hurgar: la mano se menea dentro
      const hg = tramo(t, T.manoIn - 0.05, T.manoIn + 0.1) * (1 - tramo(t, T.hurga1 - 0.1, T.hurga1)) + campana(t, T.o1in, T.o1out) + campana(t, T.o2in, T.o2out) + campana(t, T.o3in, T.o3out) + campana(t, T.p0in, T.pio1);
      const q = { x: sup.x + ux * prof + 3.5 * hg * Math.sin(t * 28), y: sup.y + uy * prof + 3.5 * hg * Math.cos(t * 24) };
      l = mezcla(l, H(q), kP); angL = lerp(angL, dirA, kP); muL = lerp(muL, -Math.PI, kP);
    }
    // enseña el objeto que ha sacado (a la altura de la cara) y lo lanza hacia atrás
    for (const [a, z] of ENSENA) {
      const k = tramo(t, a, a + 0.14) * (1 - tramo(t, z - 0.02, z + 0.2));
      if (k > 0) {
        const lanza = campana(t, z - 0.16, z + 0.1);
        const q = { x: hl.x + 120 - 50 * lanza, y: hl.y - 20 - 80 * lanza };
        l = mezcla(l, q, k); angL = lerp(angL, -1.0 - 0.9 * lanza, k); muL = lerp(muL, -Math.PI, k);
      }
    }
    // entrega del lápiz: las dos manos se encuentran
    const kDa = tramo(t, T.da0, T.da1 - 0.05) * (1 - tramo(t, T.quita + 0.05, T.quita + 0.35));
    if (kDa > 0) { l = mezcla(l, H(MANO_G_ENT), kDa); angL = lerp(angL, A_G_ENT, kDa); muL = lerp(muL, -1.75, kDa); }
    // pajarito: la mano se queda quieta fuera, con el índice estirado
    const pe = posadero(pd, t);
    if (pe) { const kq = tramo(t, T.p0out - 0.05, T.p0out + 0.2) * (1 - tramo(t, T.vuela + 0.1, T.vuela + 0.6)); if (kq > 0) { l = mezcla(l, H(pe), kq); angL = lerp(angL, -0.35, kq); } }
    const obj = objetoEnMano(t);
    const agarra = obj ? { pulgar: 0.35, indice: 0.35, medio: 0.35, anular: 0.35, menique: 0.35 } : null;
    p.manoCerca = { x: c.x, y: c.y, ang: angC, mu: muC, dobla: -1, puno: b.cp, dedos: dedosDe(b, "c") };
    p.manoLejos = { x: l.x, y: l.y, ang: angL, mu: muL, dobla: -1, puno: b.lp, dedos: agarra || dedosDe(b, "l") };
    if (obj) {
      const balanceo = balanceoCalcetin(t);
      p.manoLejos.objeto = gg => OBJETOS[obj](gg, angL, balanceo, colgarCalcetin(t));
    }
    cacheG.set(key, p);
    return p;
  }

  /* ---------- manos de Dari (mano cercana) ---------- */
  const JKS = D.JK * S;
  // donde se pasan el lápiz (pantalla): la mano de Guillermo un poco a la izquierda, la de Dari a la derecha
  const M_ENT = { x: 514, y: 352 };
  const MANO_G_ENT = { x: M_ENT.x - 13, y: M_ENT.y + 3 }, MANO_D_ENT = { x: M_ENT.x + 10, y: M_ENT.y - 3 }, A_G_ENT = -0.2, A_D_ENT = -2.2;
  // El lápiz en la mano de Dari se queda tal cual lo coge (posición y giro dentro de su mano, en unidades de mano)
  let REL = null;
  function relLapiz() {
    if (REL) return REL;
    const pd = poseD(T.quita), pg = poseG(T.quita, pd), mg = pg.manoLejos, md = pd.manoCerca;
    const oG = G.aPantalla(pg, { x: mg.x, y: mg.y }), hD = D.aPantalla(pd, { x: md.x, y: md.y });
    const v = D.rotP({ x: (oG.x - hD.x) / JKS, y: (oG.y - hD.y) / JKS }, -md.ang);
    REL = { x: v.x, y: v.y, a: mg.ang - md.ang };
    return REL;
  }
  // vector (pantalla) desde la mano de Dari (girada a) hasta el punto u del lápiz
  function aLapiz(a, u) {
    const R = relLapiz(), v = D.rotP({ x: R.x + u * Math.cos(R.a), y: R.y + u * Math.sin(R.a) }, a);
    return { x: v.x * JKS, y: v.y * JKS };
  }
  const PUNTA = 44.5;
  // al guardarlo: profundidad de la punta dentro del pelo (px) y trozo que queda fuera (x del lápiz donde está la superficie)
  const profLapiz = k => lerp(-6, 26, k);
  const surLapiz = k => PUNTA - profLapiz(k) / JKS;
  const golpes = t => Math.max(campana(t, T.ahueca0, T.ahueca0 + 0.16), campana(t, T.ahueca0 + 0.17, T.ahueca0 + 0.33));
  function manoCercaD(t, p) {
    const reposo = enLibro(p, -0.25, 0.1);                 // en la página izquierda
    let m = { x: reposo.x, y: reposo.y }, ang = LIBRO.ang + TORSO_D, mu = -1.75;
    const abierta = { pulgar: 0.6, indice: 0.75, medio: 0.7, anular: 0.62, menique: 0.55 };
    let dedos = abierta;
    const H = q => D.aHoja(p, q), Hs = q => D.aPantalla(p, q);
    const hombro = Hs(D.tronco(p)(D.HOMBRO_C));
    // pasa una página al principio
    const pag = campana(t, 1.2, 1.75);
    if (pag > 0) { const q = enLibro(p, 0.35, -0.15); m = mezcla(m, q, pag); }
    // tiende la mano para que le den el lápiz (sin levantar la vista del libro)
    const kPal = tramo(t, T.palma0, T.palma1) * (1 - tramo(t, T.quita + 0.05, T.quita + 0.35));
    if (kPal > 0) {
      m = mezcla(m, H(MANO_D_ENT), kPal); ang = lerp(ang, A_D_ENT, kPal); mu = lerp(mu, -Math.PI, kPal);
      const ab = kPal * (1 - tramo(t, T.quita - 0.08, T.quita));
      dedos = { pulgar: lerp(0.35, 0.9, ab), indice: lerp(0.35, 1, ab), medio: lerp(0.35, 1, ab), anular: lerp(0.35, 1, ab), menique: lerp(0.35, 1, ab) };
    }
    const conLapiz = t >= T.quita && t < T.mete1;
    if (conLapiz) dedos = { pulgar: 0.35, indice: 0.35, medio: 0.35, anular: 0.35, menique: 0.35 };
    // con el lápiz: rellena una casilla y se queda con él apoyado en la página
    const kMarca = tramo(t, T.quita + 0.05, T.marca0) * (1 - tramo(t, T.alza - 0.25, T.alza));
    if (kMarca > 0) {
      const R = relLapiz(), aW = 1.2 - R.a;
      const cas = Hs(enLibro(p, CASILLA.u, CASILLA.v)), raya = campana(t, T.marca0, T.marca1), punta = aLapiz(aW, PUNTA);
      // pensando la siguiente palabra: golpecitos con el lápiz en la página
      const pen = 1.2 * Math.sin(t * 1.7) * tramo(t, T.marca1, T.marca1 + 0.3) - 5 * (campana(t, 9.2, 9.38) + campana(t, 9.42, 9.6) + campana(t, 10.25, 10.43) + campana(t, 10.47, 10.65));
      const q = { x: cas.x - punta.x - 4 + 7 * raya, y: cas.y - punta.y - 2 - 3 * raya + pen };
      m = mezcla(m, H(q), kMarca); ang = lerp(ang, aW, kMarca); mu = lerp(mu, -1.75, kMarca);
    }
    // sube la mano y mete el lápiz en los rizos, por donde salió todo
    const kAl = tramo(t, T.alza - 0.25, T.alza + 0.1) * (1 - tramo(t, T.mete1, T.mete1 + 0.12));
    if (kAl > 0) {
      const R = relLapiz(), sup = enPantallaD(p, SUP), den = enPantallaD(p, DENTRO);
      const L = dist(sup, den), ux = (den.x - sup.x) / L, uy = (den.y - sup.y) / L, a = Math.atan2(uy, ux) - R.a;
      const dp = profLapiz(tramo(t, T.mete0, T.mete1)), punta = aLapiz(a, PUNTA);
      const q = { x: sup.x + ux * dp - punta.x, y: sup.y + uy * dp - punta.y };
      m = mezcla(m, H(q), kAl); ang = lerp(ang, a, kAl); mu = lerp(mu, -1.75, kAl);
    }
    // dos palmaditas para ahuecar los rizos que le han despeinado
    const kPat = tramo(t, T.mete1, T.mete1 + 0.12) * (1 - tramo(t, T.ahueca1, T.lee));
    if (kPat > 0) {
      const g2 = golpes(t), segundo = tramo(t, T.ahueca0 + 0.15, T.ahueca0 + 0.2);
      const sup = enPantallaD(p, SUP), den = enPantallaD(p, DENTRO);
      const L = dist(sup, den), ux = (den.x - sup.x) / L, uy = (den.y - sup.y) / L;
      const c = enPantallaD(p, { x: SUP.x + 8, y: SUP.y + lerp(34, -18, segundo) });
      const q = { x: c.x - ux * (16 - 11 * g2), y: c.y - uy * (16 - 11 * g2) };
      const aP = Math.atan2(q.y - hombro.y, q.x - hombro.x);
      m = mezcla(m, H(q), kPat); ang = lerp(ang, aP, kPat); mu = lerp(mu, -Math.PI, kPat);
      const ab = kPat * (1 - tramo(t, T.ahueca1 - 0.05, T.lee));
      dedos = { pulgar: lerp(abierta.pulgar, 0.8, ab), indice: lerp(abierta.indice, 1, ab), medio: lerp(abierta.medio, 1, ab), anular: lerp(abierta.anular, 1, ab), menique: lerp(abierta.menique, 1, ab) };
    }
    const mano = { x: m.x, y: m.y, ang, mu, dobla: -1, puno: 1, dedos };
    if (conLapiz) {
      mano.objeto = gg => {
        const R = relLapiz();
        gg.save(); gg.translate(R.x, R.y); gg.rotate(R.a);
        // al meterlo en el pelo solo se ve el trozo de fuera
        lapiz(gg, t >= T.mete0 - 0.01 ? surLapiz(tramo(t, T.mete0, T.mete1)) : 99);
        gg.restore();
      };
    }
    return mano;
  }

  /* ---------- libro del crucigrama (coordenadas del torso de Dari) ---------- */
  function dibLibro(g, t) {
    const marca = salida(fase(t, T.marca0 + 0.05, T.marca1));
    g.save(); g.translate(LIBRO.x, LIBRO.y); g.rotate(LIBRO.ang); g.lineJoin = "round";
    const w = LIBRO.w, h = LIBRO.h;
    // tapas y páginas (abierto)
    g.fillStyle = "#2a5a7a"; g.strokeStyle = TINTA; g.lineWidth = 5;
    g.beginPath(); g.moveTo(-w - 8, -h - 4); g.lineTo(w + 8, -h - 4); g.lineTo(w + 8, h + 8); g.lineTo(-w - 8, h + 8); g.closePath(); g.fill(); g.stroke();
    for (const sg of [-1, 1]) {
      g.fillStyle = "#fbf6e8"; g.beginPath(); g.moveTo(0, -h + 4); g.quadraticCurveTo(sg * w * 0.5, -h - 6, sg * w, -h); g.lineTo(sg * w, h);
      g.quadraticCurveTo(sg * w * 0.5, h - 6, 0, h + 2); g.closePath(); g.fill(); g.lineWidth = 3.5; g.stroke();
    }
    g.strokeStyle = "rgba(0,0,0,0.25)"; g.lineWidth = 3; g.beginPath(); g.moveTo(0, -h + 4); g.lineTo(0, h + 2); g.stroke();
    // página izquierda: rayitas de texto (sin letras)
    g.strokeStyle = "#9a958a"; g.lineWidth = 3;
    for (let i = 0; i < 7; i++) { const y = -h + 16 + i * 15, x1 = -w + 12, x2 = -12 - 22 * hash(i + 2); g.beginPath(); g.moveTo(x1, y); g.lineTo(x2, y + 1); g.stroke(); }
    // página derecha: cuadrícula del crucigrama
    const cx0 = 14, cy0 = -h + 12, cs = 13, n = 6;
    g.lineWidth = 1.6; g.strokeStyle = "#3a3a40";
    for (let i = 0; i < n; i++) for (let j = 0; j < n - 1; j++) {
      const x = cx0 + i * cs, y = cy0 + j * cs, negra = hash(i * 7 + j * 3 + 1) < 0.22;
      g.fillStyle = negra ? "#2a2a30" : "#ffffff"; g.fillRect(x, y, cs, cs); g.strokeRect(x, y, cs, cs);
      if (!negra && hash(i * 5 + j * 11 + 4) < 0.35) { g.fillStyle = "#8a8f9a"; g.fillRect(x + 3, y + 3, cs - 6, cs - 6); }   // casillas ya hechas
    }
    // la casilla que rellena ahora
    const ci = 3, cj = 2, x = cx0 + ci * cs, y = cy0 + cj * cs;
    if (marca > 0) { g.fillStyle = `rgba(60,60,72,${marca})`; g.fillRect(x + 3, y + 3, (cs - 6) * Math.min(1, marca * 1.4), cs - 6); }
    g.restore();
  }

  /* ---------- pajarito ---------- */
  // posadero: encima de la mano de Guillermo, fuera del pelo
  function posadero(pd, t) {
    if (t < T.p0out - 0.1) return null;
    const s = enPantallaD(pd, SUP);
    return { x: s.x - 30, y: s.y + 4 };
  }
  function pajaro(g, x, y, esc, aleteo, pico, mira, giro) {
    g.save(); g.translate(x, y); g.rotate(giro); g.scale(esc * mira, esc); g.lineJoin = "round"; g.lineCap = "round";
    g.strokeStyle = TINTA; g.lineWidth = 1.6;
    // cola
    g.fillStyle = "#2f6fb0"; g.beginPath(); g.moveTo(-9, 2); g.lineTo(-19, -1); g.lineTo(-18, 6); g.closePath(); g.fill(); g.stroke();
    // cuerpo
    g.fillStyle = "#3d86c9"; g.beginPath(); g.ellipse(0, 0, 11, 9.5, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    g.save(); g.beginPath(); g.ellipse(0, 0, 11, 9.5, 0, 0, Math.PI * 2); g.clip();
    g.fillStyle = "#ffd84a"; g.beginPath(); g.ellipse(4, 5, 9, 7, 0, 0, Math.PI * 2); g.fill(); g.restore();
    g.beginPath(); g.ellipse(0, 0, 11, 9.5, 0, 0, Math.PI * 2); g.stroke();
    // cara blanca y ojo
    g.fillStyle = "#ffffff"; g.beginPath(); g.ellipse(6, -3, 4.5, 3.6, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = TINTA; g.beginPath(); g.arc(7, -3.5, 1.8, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#ffffff"; g.beginPath(); g.arc(7.5, -4.2, 0.6, 0, Math.PI * 2); g.fill();
    // pico (se abre al piar)
    g.fillStyle = "#f2a23a"; g.beginPath(); g.moveTo(10, -2.5 - pico); g.lineTo(15, -1); g.lineTo(10, 0.5 + pico); g.closePath(); g.fill(); g.lineWidth = 1.2; g.stroke();
    // ala
    g.fillStyle = "#2a68a8"; g.lineWidth = 1.5;
    g.beginPath(); g.moveTo(-5, -2); g.quadraticCurveTo(-2, -2 - 12 * aleteo, 4, -3 - 8 * aleteo); g.quadraticCurveTo(2, 2, -5, 3); g.closePath(); g.fill(); g.stroke();
    // patitas
    g.strokeStyle = "#e08a2a"; g.lineWidth = 1.4;
    g.beginPath(); g.moveTo(-1, 9); g.lineTo(-2, 13); g.moveTo(3, 9); g.lineTo(3, 13); g.stroke();
    g.restore();
  }
  function estadoPajaro(t, pd, pg) {
    if (t < T.pio1 - 0.05 || t > T.vuela + 1.0) return null;
    const ent = enPantallaD(pd, SUP), pos = posadero(pd, t) || ent;
    if (t < T.salta) {        // asoma la cabecita entre los rizos
      const k = salida(fase(t, T.pio1 - 0.05, T.p0out + 0.05));
      return { x: ent.x - 6 * k, y: ent.y - 4, esc: 0.5 + 0.35 * k, aleteo: 0, pico: campana(t, T.pio1, T.pio1 + 0.15) * 2.2, mira: -1, giro: 0, delante: false };
    }
    if (t < T.posa) {        // saltito hasta la mano
      const k = fase(t, T.salta, T.posa), x = lerp(ent.x - 6, pos.x, k), y = lerp(ent.y - 4, pos.y - 14, k) - 30 * Math.sin(Math.PI * k);
      return { x, y, esc: lerp(0.85, 1, k), aleteo: 0.6 + 0.4 * Math.sin(t * 60), pico: 0, mira: -1, giro: 0, delante: true };
    }
    if (t < T.vuela) {        // posado: mira a Guillermo, ladea la cabeza y pía
      return { x: pos.x, y: pos.y - 14, esc: 1, aleteo: 0, pico: campana(t, T.pio2, T.pio2 + 0.16) * 2.4, mira: -1, giro: 0.25 * campana(t, T.posa + 0.05, T.pio2), delante: true };
    }
    // se va volando hacia arriba a la derecha
    const k = fase(t, T.vuela, T.vuela + 0.95), x = pos.x + 520 * entrada(k) + 30 * Math.sin(k * 9), y = pos.y - 14 - 380 * salida(k);
    return { x, y, esc: 1, aleteo: Math.sin(t * 55), pico: 0, mira: 1, giro: -0.35, delante: true };
  }
  function notitas(g, t, q, t0) {
    const k = fase(t, t0, t0 + 0.55); if (k <= 0 || k >= 1) return;
    g.save(); g.globalAlpha = Math.sin(Math.PI * k); g.fillStyle = TINTA; g.strokeStyle = TINTA; g.lineWidth = 1.8;
    for (let i = 0; i < 2; i++) {
      const x = q.x + 10 + 14 * i + 10 * k, y = q.y - 14 - 18 * k - 8 * i;
      g.beginPath(); g.ellipse(x, y, 3.4, 2.6, -0.4, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.moveTo(x + 3, y); g.lineTo(x + 3, y - 11); g.quadraticCurveTo(x + 7, y - 9, x + 8, y - 5); g.stroke();
    }
    g.restore();
  }
  // pluma que cae del pajarito y acaba en la nariz de Guillermo (retrato de Guillermo)
  const PLUMA_T0 = T.vuela + 0.05;
  let plumaFin = null;
  function pluma(g, x, y, a) {
    g.save(); g.translate(x, y); g.rotate(a); g.lineCap = "round";
    g.fillStyle = "#cfe3f6"; g.strokeStyle = "#2a68a8"; g.lineWidth = 1.2;
    g.beginPath(); g.moveTo(-9, 0); g.quadraticCurveTo(-2, -5, 9, -1); g.quadraticCurveTo(-1, 4, -9, 0); g.closePath(); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(-11, 1); g.lineTo(8, -0.5); g.stroke();
    g.restore();
  }
  function posPluma(t, pd, pg) {
    if (t < PLUMA_T0) return null;
    const ini = posadero(pd, PLUMA_T0) || { x: 500, y: 290 };
    const fin = G.aPantalla(pg, G.cabeza(pg).a(NARIZ_G));
    const k = fase(t, PLUMA_T0, T.pluma);
    if (k >= 1) return { x: fin.x, y: fin.y - 3, a: -0.3, enNariz: true };
    const y = lerp(ini.y - 18, fin.y - 3, entrada(k) * 0.4 + k * 0.6), x = lerp(ini.x, fin.x, k) + 16 * Math.sin(k * 10) * (1 - k);
    return { x, y, a: 0.6 * Math.sin(k * 10) * (1 - k) - 0.3 * k, enNariz: false };
  }

  /* ---------- efectos ---------- */
  function boingRayas(g, t, q, t0) {
    const k = fase(t, t0, t0 + 0.32); if (k <= 0 || k >= 1) return;
    g.save(); g.strokeStyle = `rgba(255,255,255,${0.95 * (1 - k)})`; g.lineWidth = 2.4; g.lineCap = "round";
    for (let i = 0; i < 4; i++) { const a = Math.PI + (i - 1.5) * 0.45, r0 = 14 + 12 * k;
      g.beginPath(); g.moveTo(q.x + Math.cos(a) * r0, q.y + Math.sin(a) * r0); g.lineTo(q.x + Math.cos(a) * (r0 + 9), q.y + Math.sin(a) * (r0 + 9)); g.stroke(); }
    g.restore();
  }
  function plopEstrella(g, t, q, t0, tam) {
    const k = fase(t, t0, t0 + 0.3); if (k <= 0 || k >= 1) return;
    g.save(); g.globalAlpha = 1 - k; g.translate(q.x, q.y);
    g.beginPath(); for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8, r = (i % 2 ? 0.45 : 1) * tam * (0.6 + 0.6 * salida(k)); g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.closePath();
    g.fillStyle = "#fff4c2"; g.fill(); g.lineWidth = 2; g.strokeStyle = TINTA; g.stroke();
    g.restore();
  }
  function chirrido(g, t, q, t0) {           // pitido del patito
    const k = fase(t, t0, t0 + 0.3); if (k <= 0 || k >= 1) return;
    g.save(); g.strokeStyle = `rgba(255,255,255,${1 - k})`; g.lineWidth = 2; g.lineCap = "round";
    for (let i = 0; i < 3; i++) { const a = -Math.PI / 2 + (i - 1) * 0.5, r0 = 16 + 10 * k; g.beginPath(); g.moveTo(q.x + Math.cos(a) * r0, q.y + Math.sin(a) * r0); g.lineTo(q.x + Math.cos(a) * (r0 + 7), q.y + Math.sin(a) * (r0 + 7)); g.stroke(); }
    g.restore();
  }
  function tirones(g, t, pd) {              // rayitas de tensión a los lados de la muñeca durante el tirón
    const k = tramo(t, T.tira1 + 0.05, T.tira1 + 0.25) * (1 - tramo(t, T.pop - 0.06, T.pop)); if (k <= 0.01) return;
    const sup = enPantallaD(pd, SUP), den = enPantallaD(pd, DENTRO), L = dist(sup, den), ux = (den.x - sup.x) / L, uy = (den.y - sup.y) / L, nx = -uy, ny = ux;
    g.save(); g.strokeStyle = `rgba(255,255,255,${0.85 * k})`; g.lineWidth = 2; g.lineCap = "round";
    for (const lado of [-1, 1]) for (let i = 0; i < 2; i++) {
      const v = 1.5 * Math.sin(t * 47 + i * 2 + lado), d0 = 15 + i * 7 + v;
      const cx = sup.x - ux * (8 + i * 9) + nx * lado * d0, cy = sup.y - uy * (8 + i * 9) + ny * lado * d0;
      g.beginPath(); g.moveTo(cx - ux * 4, cy - uy * 4); g.lineTo(cx + ux * 4 + nx * lado * 3, cy + uy * 4 + ny * lado * 3); g.stroke();
    }
    g.restore();
  }

  // objetos lanzados por encima del hombro: vuelo y reposo en el suelo
  function lanzados(g, t, pose) {
    for (const [ts, nom, xf, af, vueltas] of LANZA) {
      if (t < ts) continue;
      const pg = pose(ts).g, m = pg.manoLejos, h0 = G.aPantalla(pg, { x: m.x, y: m.y });
      const fu = nom === "patito" ? 20 * G.JK * S : 0, h = { x: h0.x + fu * Math.cos(m.ang), y: h0.y + fu * Math.sin(m.ang) };
      const k = fase(t, ts, ts + VUELO);
      const x = lerp(h.x, xf, k), y = lerp(h.y, SUELO_OBJ, k * k) - 150 * Math.sin(Math.PI * k) * (1 - 0.3 * k);
      // giro en pantalla: el mismo que tenía en la mano al soltarlo → vueltas enteras → el de reposo en el suelo
      const a0 = nom === "calcetin" ? balanceoCalcetin(ts) : nom === "patito" ? 0.4 * m.ang : m.ang;
      const a = lerp(a0, af, k) - vueltas * Math.PI * 2 * salida(k);
      // el patito bota una vez al caer
      const yy = nom === "patito" ? y - 14 * campana(t, ts + VUELO, ts + VUELO + 0.3) : y;
      g.save(); g.translate(x, yy); g.rotate(a); g.scale(G.JK * S, G.JK * S);
      if (nom === "calcetin") calcetin(g, 0, 0); else if (nom === "patito") patito(g, 0); else OBJETOS[nom](g, 0, 0);
      g.restore();
    }
  }

  /* ---------- puf ---------- */
  function puf(g, t) {
    const hunde = campana(t, T.pie0, T.pop + 0.15) * (0.7 + 0.3 * Math.sin(t * 30));
    const bote = tiron(t);
    const P = [[512, 562], [497, 500], [512 + 18 * hunde, 432], [544, 386 - 4 * bote], [585, 364 - 6 * bote], [620, 378], [634, 420], [652, 486], [702, 490], [752, 480], [792, 498], [802, 534], [780, 562]];
    const forma = () => { g.beginPath(); M2.curva(g, P.map(([x, y]) => ({ x, y })), true, 0.5); };
    g.save(); g.lineJoin = "round";
    forma(); const gr = g.createLinearGradient(500, 360, 800, 560); gr.addColorStop(0, "#3fa39c"); gr.addColorStop(1, "#1f5f5b"); g.fillStyle = gr; g.fill();
    g.save(); forma(); g.clip();
    g.strokeStyle = "rgba(0,0,0,0.16)"; g.lineWidth = 4;
    for (let i = 0; i < 14; i++) { const x = 500 + i * 22; g.beginPath(); g.moveTo(x, 340); g.quadraticCurveTo(x + 18, 460, x - 6, 570); g.stroke(); }
    g.fillStyle = "rgba(255,255,255,0.14)"; g.beginPath(); g.ellipse(560, 420, 34, 60, -0.4, 0, Math.PI * 2); g.fill();
    g.fillStyle = "rgba(0,0,0,0.18)"; g.beginPath(); g.ellipse(720, 556, 120, 30, 0, 0, Math.PI * 2); g.fill();
    g.restore();
    forma(); g.lineWidth = 3.2; g.strokeStyle = TINTA; g.stroke();
    // costura
    g.strokeStyle = "rgba(20,40,40,0.6)"; g.lineWidth = 2; g.setLineDash([5, 5]); g.beginPath(); g.moveTo(600, 372); g.quadraticCurveTo(560, 470, 540, 560); g.stroke(); g.setLineDash([]);
    g.restore();
  }

  /* ---------- decorado: salita del café en una tarde de lluvia ---------- */
  const VENT = { x: 214, y: 168, r: 92 };
  const LAMPARA = { x: 955, y: 150 };
  let fondo = null, vineta = null;
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W + 80; c.height = H + 120; const g = c.getContext("2d");
    g.translate(40, 60);
    // pared mostaza con papel de rombos
    const pared = g.createLinearGradient(0, -60, 0, 430); pared.addColorStop(0, "#b77d24"); pared.addColorStop(1, "#dca449");
    g.fillStyle = pared; g.fillRect(-40, -60, W + 80, 500);
    g.strokeStyle = "rgba(120,70,10,0.16)"; g.lineWidth = 1.5;
    for (let i = -20; i < 40; i++) { g.beginPath(); g.moveTo(i * 44, -60); g.lineTo(i * 44 + 500, 440); g.stroke(); g.beginPath(); g.moveTo(i * 44, -60); g.lineTo(i * 44 - 500, 440); g.stroke(); }
    g.fillStyle = "rgba(255,240,200,0.12)"; for (let i = 0; i < 40; i++) { g.beginPath(); g.arc(22 + (i % 8) * 132 + (Math.floor(i / 8) % 2) * 66, -40 + Math.floor(i / 8) * 100, 3, 0, Math.PI * 2); g.fill(); }
    // zócalo verde azulado de listones
    g.fillStyle = "#24524f"; g.fillRect(-40, 400, W + 80, SUELO - 400);
    g.strokeStyle = "rgba(0,0,0,0.25)"; g.lineWidth = 2; for (let x = -40; x < W + 40; x += 26) { g.beginPath(); g.moveTo(x, 408); g.lineTo(x, SUELO); g.stroke(); }
    g.fillStyle = "#3a716c"; g.fillRect(-40, 396, W + 80, 12); g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(-40, 396, W + 80, 12);
    // ventana redonda (la lluvia se pinta en cada fotograma)
    g.save(); g.translate(VENT.x, VENT.y);
    const cielo = g.createLinearGradient(0, -VENT.r, 0, VENT.r); cielo.addColorStop(0, "#2a3c66"); cielo.addColorStop(1, "#56709c");
    g.fillStyle = cielo; g.beginPath(); g.arc(0, 0, VENT.r, 0, Math.PI * 2); g.fill();
    g.save(); g.beginPath(); g.arc(0, 0, VENT.r, 0, Math.PI * 2); g.clip();
    g.fillStyle = "#1c2848"; for (let i = 0; i < 7; i++) { const w = 22 + hash(i + 40) * 20, h = 40 + hash(i + 50) * 60; g.fillRect(-VENT.r + i * 30 - 6, VENT.r - h, w, h); }
    g.fillStyle = "#ffd98a"; for (let i = 0; i < 10; i++) { g.fillRect(-VENT.r + 6 + hash(i + 60) * 170, VENT.r - 20 - hash(i + 70) * 70, 4, 5); }
    g.restore();
    g.strokeStyle = "#efe4c8"; g.lineWidth = 12; g.beginPath(); g.arc(0, 0, VENT.r, 0, Math.PI * 2); g.stroke();
    g.lineWidth = 6; g.beginPath(); g.moveTo(-VENT.r, 0); g.lineTo(VENT.r, 0); g.moveTo(0, -VENT.r); g.lineTo(0, VENT.r); g.stroke();
    g.strokeStyle = TINTA; g.lineWidth = 2.5; g.beginPath(); g.arc(0, 0, VENT.r + 6, 0, Math.PI * 2); g.stroke(); g.beginPath(); g.arc(0, 0, VENT.r - 6, 0, Math.PI * 2); g.stroke();
    // alféizar con un cactus
    g.fillStyle = "#efe4c8"; g.fillRect(-VENT.r - 10, VENT.r + 4, 2 * VENT.r + 20, 10); g.strokeRect(-VENT.r - 10, VENT.r + 4, 2 * VENT.r + 20, 10);
    g.fillStyle = "#b8562f"; g.beginPath(); g.moveTo(-60, VENT.r + 4); g.lineTo(-40, VENT.r + 4); g.lineTo(-43, VENT.r - 14); g.lineTo(-57, VENT.r - 14); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#4f8f4a"; g.beginPath(); g.ellipse(-50, VENT.r - 26, 7, 13, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    g.restore();
    // cuadro con una espiral (homenaje a los rizos)
    g.save(); g.translate(640, 118);
    g.fillStyle = "#4a2e1c"; g.fillRect(-58, -48, 116, 96); g.strokeStyle = TINTA; g.lineWidth = 2.5; g.strokeRect(-58, -48, 116, 96);
    g.fillStyle = "#f3e7cc"; g.fillRect(-48, -38, 96, 76);
    g.strokeStyle = "#c2552e"; g.lineWidth = 5; g.lineCap = "round"; g.beginPath();
    for (let k = 0; k <= 80; k++) { const a = k / 80 * Math.PI * 6, r = 2 + k / 80 * 30; const x = Math.cos(a) * r, y = Math.sin(a) * r * 0.85; if (k) g.lineTo(x, y); else g.moveTo(x, y); }
    g.stroke(); g.restore();
    // estantería con libros y una planta colgante
    g.save(); g.translate(735, 110);
    g.fillStyle = "#5a3820"; g.fillRect(0, 70, 150, 9); g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(0, 70, 150, 9);
    const LIB = ["#c2552e", "#2a5a7a", "#e3b44a", "#3f7f5a", "#8a3a6a", "#d9d2c0"];
    for (let i = 0; i < 9; i++) { const h = 34 + 18 * hash(i + 9), w = 9 + 4 * hash(i + 19), x = 6 + i * 14; g.fillStyle = LIB[i % LIB.length];
      g.fillRect(x, 70 - h, w, h); g.strokeRect(x, 70 - h, w, h); g.fillStyle = "rgba(255,255,255,0.25)"; g.fillRect(x + 2, 70 - h + 6, 2, h - 12); }
    g.fillStyle = "#b8562f"; g.beginPath(); g.moveTo(128, 70); g.lineTo(148, 70); g.lineTo(145, 50); g.lineTo(131, 50); g.closePath(); g.fill(); g.stroke();
    g.strokeStyle = "#3f7f4a"; g.lineWidth = 3;
    for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(138, 52); g.quadraticCurveTo(150 + k * 8, 90, 140 + k * 10, 120 + k * 30); g.stroke(); }
    g.fillStyle = "#5aa35a"; g.strokeStyle = TINTA; g.lineWidth = 1.3;
    for (let k = 0; k < 14; k++) { const u = (k % 5) / 5, br = Math.floor(k / 5), x = 138 + (br * 9) * u + 8 * u, y = 56 + (64 + br * 30) * u; g.beginPath(); g.ellipse(x + 4, y, 5, 3.4, 0.6, 0, Math.PI * 2); g.fill(); g.stroke(); }
    g.restore();
    // lámpara de pie con flecos y su halo
    const halo = g.createRadialGradient(LAMPARA.x, LAMPARA.y + 20, 10, LAMPARA.x, LAMPARA.y + 20, 300); halo.addColorStop(0, "rgba(255,226,150,0.55)"); halo.addColorStop(1, "rgba(255,210,120,0)");
    g.fillStyle = halo; g.fillRect(LAMPARA.x - 300, LAMPARA.y - 280, 600, 600);
    g.strokeStyle = TINTA; g.lineWidth = 6; g.beginPath(); g.moveTo(LAMPARA.x, LAMPARA.y + 40); g.lineTo(LAMPARA.x, SUELO - 6); g.stroke();
    g.strokeStyle = "#b08a3a"; g.lineWidth = 3; g.stroke();
    g.fillStyle = "#3a2a1a"; g.beginPath(); g.ellipse(LAMPARA.x, SUELO - 4, 30, 7, 0, 0, Math.PI * 2); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 2; g.stroke();
    g.fillStyle = "#f2e2b6"; g.beginPath(); g.moveTo(LAMPARA.x - 32, LAMPARA.y - 12); g.lineTo(LAMPARA.x + 32, LAMPARA.y - 12); g.lineTo(LAMPARA.x + 52, LAMPARA.y + 40); g.lineTo(LAMPARA.x - 52, LAMPARA.y + 40); g.closePath(); g.fill(); g.lineWidth = 2.5; g.stroke();
    g.strokeStyle = "#c08a3a"; g.lineWidth = 2; for (let k = 0; k < 15; k++) { const x = LAMPARA.x - 50 + k * 7.2; g.beginPath(); g.moveTo(x, LAMPARA.y + 40); g.lineTo(x + 1, LAMPARA.y + 52); g.stroke(); }
    // mesita con una taza
    g.save(); g.translate(262, 0);
    g.fillStyle = "#5a3820"; g.strokeStyle = TINTA; g.lineWidth = 2.5;
    g.beginPath(); g.ellipse(0, 452, 46, 9, 0, 0, Math.PI * 2); g.fill(); g.stroke(); g.fillRect(-4, 452, 8, SUELO - 456); g.strokeRect(-4, 452, 8, SUELO - 456);
    g.fillStyle = "#f3eee2"; g.beginPath(); g.moveTo(-12, 448); g.lineTo(12, 448); g.lineTo(10, 430); g.lineTo(-10, 430); g.closePath(); g.fill(); g.stroke();
    g.beginPath(); g.arc(14, 438, 5, -1.2, 1.2); g.stroke();
    g.restore();
    // suelo de madera en espiga y alfombra
    const su = g.createLinearGradient(0, SUELO, 0, H + 60); su.addColorStop(0, "#7a4a28"); su.addColorStop(1, "#3a2010");
    g.fillStyle = su; g.fillRect(-40, SUELO, W + 80, H + 60 - SUELO);
    g.strokeStyle = "rgba(0,0,0,0.25)"; g.lineWidth = 2;
    for (let i = 0; i < 4; i++) { const y = SUELO + 8 + i * i * 8 + i * 6; g.beginPath(); g.moveTo(-40, y); g.lineTo(W + 40, y); g.stroke(); }
    for (let x = -60; x < W + 80; x += 60) { g.beginPath(); g.moveTo(x, SUELO); g.lineTo(x + (x - 512) * 0.25, H + 60); g.stroke(); }
    g.fillStyle = "#b8452e"; g.beginPath(); g.ellipse(650, SUELO + 10, 250, 22, 0, 0, Math.PI * 2); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 2; g.stroke();
    g.strokeStyle = "#f0c66a"; g.lineWidth = 3; g.beginPath(); g.ellipse(650, SUELO + 10, 220, 16, 0, 0, Math.PI * 2); g.stroke();
    g.setLineDash([8, 7]); g.strokeStyle = "#f6e2b0"; g.lineWidth = 2; g.beginPath(); g.ellipse(650, SUELO + 10, 190, 12, 0, 0, Math.PI * 2); g.stroke(); g.setLineDash([]);
    return c;
  }
  function creaVineta() {
    const c = document.createElement("canvas"); c.width = W; c.height = H; const g = c.getContext("2d");
    const v = g.createRadialGradient(W / 2, H / 2, 280, W / 2, H / 2, 700); v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(30,10,0,0.45)");
    g.fillStyle = v; g.fillRect(0, 0, W, H);
    return c;
  }
  function lluvia(g, t) {
    g.save(); g.beginPath(); g.arc(VENT.x, VENT.y, VENT.r - 6, 0, Math.PI * 2); g.clip();
    g.strokeStyle = "rgba(200,220,255,0.5)"; g.lineWidth = 1.6; g.lineCap = "round";
    for (let i = 0; i < 22; i++) { const ph = (t * (1.3 + hash(i) * 0.6) + hash(i + 7)) % 1, x = VENT.x - VENT.r + hash(i + 3) * 2 * VENT.r - ph * 20, y = VENT.y - VENT.r + ph * 2 * VENT.r;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x - 4, y + 12); g.stroke(); }
    g.restore();
  }
  function vapor(g, t) {
    g.save(); g.strokeStyle = "rgba(255,255,255,0.45)"; g.lineWidth = 2.4; g.lineCap = "round";
    for (let i = 0; i < 2; i++) { const ph = (t * 0.5 + i * 0.5) % 1; g.globalAlpha = Math.sin(Math.PI * ph); const x = 258 + i * 8, y = 426 - ph * 40;
      g.beginPath(); g.moveTo(x, y + 14); g.quadraticCurveTo(x + 6 * Math.sin(t * 3 + i), y + 7, x, y); g.stroke(); }
    g.restore();
  }

  /* ---------- cámara ---------- */
  const CAM = [[0, 1.0, 512, 300], [2.0, 1.0, 512, 300], [3.1, 1.2, 585, 335], [11.6, 1.2, 585, 335], [12.6, 1.12, 590, 320], [14.6, 1.12, 590, 320]];
  function camara(t) {
    let i = 0; while (i + 1 < CAM.length && t >= CAM[i + 1][0]) i++;
    const a = CAM[i], b = CAM[Math.min(CAM.length - 1, i + 1)], k = b === a ? 0 : suave(fase(t, a[0], b[0]));
    return { k: lerp(a[1], b[1], k), x: lerp(a[2], b[2], k), y: lerp(a[3], b[3], k) };
  }

  function pose(t) { const d = poseD(t); return { g: poseG(t, d), d }; }

  class GuillermoDariPelo extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !D.listo()) return;
      if (!fondo) { fondo = creaFondo(); vineta = creaVineta(); }
      const { g: pg, d: pd } = pose(t);
      const luz = tramo(t, NEGRO_INICIO, 0.8, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t);
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      g.drawImage(fondo, -40, -60);
      lluvia(g, t); vapor(g, t);
      // sombras
      g.save(); g.fillStyle = "rgba(0,0,0,0.32)";
      g.beginPath(); g.ellipse(pg.x, SUELO + 2, 70, 7, 0, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.ellipse(690, SUELO + 2, 150, 9, 0, 0, Math.PI * 2); g.fill(); g.restore();
      puf(g, t);
      lanzados(g, t, pose);
      G.dibujar(g, pg, t);
      D.dibujar(g, pd, t);
      // pajarito y pluma
      const pj = estadoPajaro(t, pd, pg);
      if (pj) pajaro(g, pj.x, pj.y, pj.esc, pj.aleteo, pj.pico, pj.mira, pj.giro);
      if (pj) { notitas(g, t, pj, T.pio1); notitas(g, t, pj, T.pio2); }
      const pl = posPluma(t, pd, pg); if (pl) pluma(g, pl.x, pl.y, pl.a);
      // efectos
      const ent = enPantallaD(pd, SUP);
      boingRayas(g, t, ent, T.boing);
      tirones(g, t, pd);
      plopEstrella(g, t, { x: ent.x - 6, y: ent.y }, T.pop, 22);
      const pd3 = pose(T.o3out + 0.15).g, h3 = G.aPantalla(pd3, { x: pd3.manoLejos.x, y: pd3.manoLejos.y });
      chirrido(g, t, h3, T.o3out + 0.05);
      g.restore();
      g.drawImage(vineta, 0, 0);
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00054", nombre: "Guillermo y Dari · El pelo rizado", crear: () => new GuillermoDariPelo() });
  // diagnóstico: cuánto se estiran los brazos (1 = brazo recto)
  function alcance(t) {
    const { g: pg, d: pd } = pose(t), r = {};
    const mide = (Q, p, hombro, mano, L) => { const h = Q.tronco(p)(hombro), m = Q.rotP({ x: Math.cos(mano.mu) * Q.MUNECA_R * Q.JK, y: Math.sin(mano.mu) * Q.MUNECA_R * Q.JK }, mano.ang || 0);
      return Math.hypot(mano.x + m.x - h.x, mano.y + m.y - h.y) / L; };
    r.gL = mide(G, pg, G.HOMBRO, pg.manoLejos, G.BRAZO_L); r.gC = mide(G, pg, G.HOMBRO_C, pg.manoCerca, G.BRAZO_C_L);
    r.dL = mide(D, pd, D.HOMBRO, pd.manoLejos, D.BRAZO_L); r.dC = mide(D, pd, D.HOMBRO_C, pd.manoCerca, D.BRAZO_C_L);
    return r;
  }
  window.__A2D_00054 = { pose, T, DUR, poseG, poseD, alcance, enPantallaD, SUP };
})();
