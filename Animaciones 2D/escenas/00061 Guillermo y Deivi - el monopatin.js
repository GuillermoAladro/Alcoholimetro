"use strict";
/* 00061 · Guillermo y Deivi · El monopatín
 *
 * Negro → rincón de skate a la puerta del bar, al atardecer: la fachada del bar (puerta, ventana con
 * luz cálida, toldo de rayas y un neón con forma de jarra), un muro de hormigón liso (sin grafitis),
 * una farola, unos conos y, a la derecha, una rampa (cuarto de tubo) con su plataforma. Guillermo
 * espera con las manos en los bolsillos → Deivi aparece rodando por la plataforma, se deja caer por la
 * rampa, hace un ollie limpio y un kickflip (la tabla gira sobre su eje largo: canto, lija, dibujo…),
 * aterriza, frena pisando la cola y la tabla salta sola hasta su mano. Guiño a cámara. Guillermo,
 * boquiabierto, aplaude → junta las manos y le suplica que le deje probar → Deivi se encoge de
 * hombros, le lanza la tabla (cae a sus pies) y se aparta invitándole con la mano → Guillermo se frota
 * las manos, mira a cámara muy chulo y pone un pie encima… la tabla sale disparada hacia delante (Deivi
 * la salta sin sacar las manos de los bolsillos) y Guillermo se queda tumbado en el aire, en horizontal,
 * un instante, mirando a cámara → cae de espaldas: ¡pum! Suspira aliviado… pero la tabla ha subido la
 * rampa, se tambalea en el borde y vuelve: Deivi la salta otra vez, Guillermo levanta la cabeza, la ve
 * llegar, choca con sus zapatillas, sale volando dando una vuelta y le cae en la barriga: ¡boing!
 * Ojos en espiral y estrellitas → Deivi hace una mueca, se ríe tapándose la boca y se acerca; Guillermo
 * se incorpora con la tabla en el regazo, Deivi le tiende la mano, se la agarra y tira de él → negro.
 *
 * Sin textos. Todo depende del tiempo absoluto `t`.
 */
(() => {
  const { clamp, lerp, fase, suave, suave5, salida, entrada, tramo, campana, mezcla, ruido, hash } = M2;
  const G = Guillermo, D = Deivi;
  const S = 0.29, SUELO = 560, DUR = 14.15, TAU = Math.PI * 2;
  const PARED = 515;                                  // pie del muro (fondo del suelo)

  const T = {
    entra: 0.5, labio: 1.02, abajo: 1.38,
    ollie0: 1.44, ollie: 1.6, ollie1: 2.04,
    kf0: 2.24, kf: 2.38, kf1: 2.84,
    bajaPie: 3.14, pisa: 3.27, agarra: 3.48, guino: 3.85,
    aplaude0: 3.5, aplaude1: 4.2, reza0: 4.35, reza1: 5.25,
    vale: 5.05, atrasA0: 5.22, atrasA1: 5.66, lanza0: 5.62, suelta: 5.86, toca: 6.1, para: 6.45,
    atras0: 6.18, atras1: 6.98,
    frota0: 6.22, chulo: 6.64, sube0: 6.9, sube1: 7.22, dispara: 7.5, horiz: 7.65, cae0: 8.27, pum: 8.42,
    rampa: 7.9, borde: 8.18, vuelve: 8.85, abajo2: 9.15, choca: 9.5, boing: 10.03,
    alivio: 8.55, oye: 9.0, ve: 9.13, salto1: 7.6, salto2: 9.17,
    auch: 10.05, risa0: 10.35, risa1: 10.95, anda0: 11.0, anda1: 11.75,
    sienta0: 11.2, sienta1: 11.8, ofrece0: 11.65, ofrece1: 12.1, coge: 12.17, tira0: 12.27, tira1: 12.75,
    guino2: 12.9, fin: 13.4
  };

  /* ---------- utilidades ---------- */
  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n], k); return o; };
  const guion = (lista, dic, base, t) => {
    let c = dic[base];
    for (const [t0, t1, nom, f] of lista) { if (t <= t0) break; c = mezclaE(c, dic[nom], (f || suave)(fase(t, t0, t1))); }
    return Object.assign({}, c);
  };
  const recorrido = (lista, t) => {
    if (t <= lista[0][0]) return lista[0][1];
    for (let i = 1; i < lista.length; i++) if (t < lista[i][0]) return lerp(lista[i - 1][1], lista[i][1], suave(fase(t, lista[i - 1][0], lista[i][0])));
    return lista[lista.length - 1][1];
  };
  // curva de Hermite por claves [t, valor, velocidad]: posición con velocidad continua
  function hermite(K, t) {
    if (t <= K[0][0]) return K[0][1] + K[0][2] * (t - K[0][0]);
    for (let i = 1; i < K.length; i++) if (t < K[i][0]) {
      const [t0, p0, v0] = K[i - 1], [t1, p1, v1] = K[i], h = t1 - t0, u = (t - t0) / h, u2 = u * u, u3 = u2 * u;
      return (2 * u3 - 3 * u2 + 1) * p0 + (u3 - 2 * u2 + u) * h * v0 + (-2 * u3 + 3 * u2) * p1 + (u3 - u2) * h * v1;
    }
    const L = K[K.length - 1]; return L[1] + L[2] * (t - L[0]);
  }
  // pie: lista de pasos [t0, t1, x, alza]
  function pie(lista, t) {
    let i = 0; while (i + 1 < lista.length && t >= lista[i + 1][0]) i++;
    const [t0, t1, x, alza = 24] = lista[i], xa = i > 0 ? lista[i - 1][2] : x, u = fase(t, t0, t1);
    return { x: lerp(xa, x, suave5(u)), alza: alza * Math.sin(Math.PI * u), u };
  }
  const parpadeo = (t, lista) => { let o = 0; for (const tb of lista) { const k = fase(t, tb, tb + 0.15); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); } return o; };
  const rot = (q, a) => ({ x: q.x * Math.cos(a) - q.y * Math.sin(a), y: q.x * Math.sin(a) + q.y * Math.cos(a) });
  const dedosTodos = k => ({ pulgar: k, indice: k, medio: k, anular: k, menique: k });
  const AGARRA = dedosTodos(0.32);
  // ángulo del antebrazo (de la muñeca hacia el hombro), para manos estiradas con naturalidad
  const muHacia = (m, h, extra = 0) => Math.atan2(h.y - m.y, h.x - m.x) + extra;

  /* ---------- caras ---------- */
  const BASE = { mx: 0.85, my: 0, c: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, orig: 1, abre: 0, ancho: 1, sonr: 0.12, dientes: 1, lengua: 0, esp: 0, mof: 0, wd: 0 };
  const E = o => Object.assign({}, BASE, o);
  function cara(e, parp) {
    return { mirada: { x: e.mx, y: e.my }, iris: e.iris, espiral: e.esp,
      ojos: { d: Math.max(e.c, parp, e.wd), i: Math.max(e.c, parp), feliz: e.h, apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: e.orig, abre: e.abre, ancho: e.ancho, sonrisa: e.sonr, dientes: e.dientes > 0.5, lengua: e.lengua },
      mofletes: e.mof, rubor: 0, bigote: 0 };
  }

  /* =====================================================================================
   * LA TABLA: tablero con nose y tail levantados, lija negra arriba, dibujo debajo, camiones y ruedas.
   * Se dibuja en 3D simplificado: el giro f es alrededor de su eje largo (kickflip).
   * ===================================================================================== */
  const TL = 168, TW = 44, TH = 6, RUEDA = 7.5, EJE = 50, CAMION = 9;
  const HO = RUEDA + CAMION + TH / 2;              // altura del centro del tablero sobre el suelo
  const LIJA = HO + TH / 2;                        // altura de la lija (donde se pisa)
  const kick = x => { const d = Math.abs(x) - (TL / 2 - 30); return d > 0 ? 11 * (d / 30) * (d / 30) : 0; };
  const anchoEn = x => { const d = Math.abs(x) - (TL / 2 - 20); return d > 0 ? TW * Math.sqrt(Math.max(0, 1 - (d / 20) * (d / 20))) : TW; };
  const CT = { tinta: "#0b0a0e", canto: "#f2d29c", capa: "#e2563b", lija: "#2a2a31", dibujo: "#1fb5a5", dibujo2: "#ffd23f", dibujo3: "#ff5d8f",
    rueda: "#f6efd8", ruedaS: "#cbbf9b", camion: "#c3cbd3", camionS: "#7d868f" };
  function dibTabla(g, B) {
    const cf = Math.cos(B.f || 0), sf = Math.sin(B.f || 0);
    g.save(); g.translate(B.x, B.y); g.rotate(B.a); g.lineJoin = "round"; g.lineCap = "round";
    // proyección: (x, u hacia arriba, z hacia la cámara) → y local = −(u·cos f − z·sin f); profundidad z' = u·sin f + z·cos f
    const Y = (u, z) => -(u * cf - z * sf), Z = (u, z) => u * sf + z * cf;
    const uEje = -(TH / 2 + CAMION), zr = TW / 2 - 6;
    const piezas = [];
    for (const xe of [-EJE, EJE]) {
      for (const zz of [-zr, zr]) piezas.push({ z: Z(uEje, zz), d: () => rueda(xe, Y(uEje, zz)) });
      piezas.push({ z: Z(uEje * 0.5, 0) - 0.01, d: () => camion(xe) });
    }
    piezas.sort((p, q) => p.z - q.z);
    function rueda(x, y) {
      const ry = Math.max(RUEDA * Math.abs(cf), 2.6);
      g.fillStyle = CT.rueda; g.strokeStyle = CT.tinta; g.lineWidth = 1.8;
      g.beginPath(); g.ellipse(x, y, RUEDA, ry, 0, 0, TAU); g.fill(); g.stroke();
      if (ry > 4) {
        g.fillStyle = CT.ruedaS; g.beginPath(); g.ellipse(x, y, RUEDA * 0.45, ry * 0.45, 0, 0, TAU); g.fill();
        const a = B.giro || 0; g.fillStyle = CT.tinta;
        g.beginPath(); g.ellipse(x + Math.cos(a) * RUEDA * 0.62, y + Math.sin(a) * ry * 0.62, 1.3, 1.3 * ry / RUEDA, 0, 0, TAU); g.fill();
      }
    }
    function camion(x) {
      const y0 = Y(-TH / 2, 0), y1 = Y(uEje, 0), ya = Y(uEje, -zr), yb = Y(uEje, zr);
      // eje (se ve cuando la tabla está de canto)
      if (Math.abs(ya - yb) > 1) { g.strokeStyle = CT.tinta; g.lineWidth = 5; g.beginPath(); g.moveTo(x, ya); g.lineTo(x, yb); g.stroke();
        g.strokeStyle = CT.camion; g.lineWidth = 2.6; g.beginPath(); g.moveTo(x, ya); g.lineTo(x, yb); g.stroke(); }
      if (Math.abs(y1 - y0) > 1.5) {
        g.fillStyle = CT.camion; g.strokeStyle = CT.tinta; g.lineWidth = 1.6;
        g.beginPath(); g.moveTo(x - 10, y0); g.lineTo(x + 10, y0); g.lineTo(x + 5, y1); g.lineTo(x - 5, y1); g.closePath(); g.fill(); g.stroke();
        g.fillStyle = CT.camionS; g.beginPath(); g.ellipse(x, y1, 3.2, 3.2 * Math.abs(cf) + 0.6, 0, 0, TAU); g.fill();
      }
    }
    function tablero() {
      const N = 28, xs = []; for (let i = 0; i <= N; i++) xs.push(-TL / 2 + TL * i / N);
      // canto (la cara lateral que mira a la cámara)
      if (Math.abs(cf) > 0.04) {
        const zl = (cf > 0 ? 1 : -1);
        const arriba = xs.map(x => [x, Y(kick(x) + TH / 2, zl * anchoEn(x) / 2)]), abajo = xs.map(x => [x, Y(kick(x) - TH / 2, zl * anchoEn(x) / 2)]);
        const poli = arriba.concat(abajo.reverse());
        g.beginPath(); poli.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath();
        g.fillStyle = CT.canto; g.fill();
        if (Math.abs(cf) > 0.5) { g.strokeStyle = CT.capa; g.lineWidth = 1.4; g.beginPath(); xs.forEach((x, i) => { const y = Y(kick(x), zl * anchoEn(x) / 2); i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.stroke(); }
        g.strokeStyle = CT.tinta; g.lineWidth = 2; g.beginPath(); poli.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.stroke();
      }
      // cara ancha: la lija (arriba) o el dibujo (abajo)
      if (Math.abs(sf) > 0.04) {
        const top = sf > 0, uc = x => kick(x) + (top ? TH / 2 : -TH / 2);
        const a1 = xs.map(x => [x, Y(uc(x), -anchoEn(x) / 2)]), a2 = xs.map(x => [x, Y(uc(x), anchoEn(x) / 2)]);
        const poli = a1.concat(a2.reverse());
        const camino = () => { g.beginPath(); poli.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); };
        camino(); g.fillStyle = top ? CT.lija : CT.dibujo; g.fill();
        g.save(); camino(); g.clip();
        const yc = Y(uc(0), 0), hh = Math.abs(sf) * TW / 2;
        if (top) {
          g.fillStyle = "rgba(255,255,255,0.09)"; for (let i = 0; i < 26; i++) g.fillRect(-TL / 2 + hash(i + 3) * TL, yc - hh + hash(i + 40) * 2 * hh, 1.6, 1.6);
          g.fillStyle = "rgba(255,255,255,0.12)"; g.fillRect(-TL / 2, yc - hh * 0.9, TL, Math.max(1, hh * 0.18));
        } else {
          // dibujo: rayo amarillo con borde rosa
          g.fillStyle = CT.dibujo3; g.beginPath();
          const pts = [[-46, -0.75], [10, -0.75], [-6, -0.05], [44, -0.05], [-12, 0.8], [2, 0.12], [-50, 0.12]];
          pts.forEach(([x, k], i) => { const y = yc + k * hh * (sf > 0 ? 1 : -1); i ? g.lineTo(x + 3, y + 2) : g.moveTo(x + 3, y + 2); }); g.closePath(); g.fill();
          g.fillStyle = CT.dibujo2; g.beginPath();
          pts.forEach(([x, k], i) => { const y = yc + k * hh * (sf > 0 ? 1 : -1); i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.closePath(); g.fill();
          g.fillStyle = "rgba(255,255,255,0.18)"; g.fillRect(-TL / 2, yc - hh, TL, Math.max(1, hh * 0.22));
        }
        g.restore();
        camino(); g.strokeStyle = CT.tinta; g.lineWidth = 2; g.stroke();
      }
    }
    for (const p of piezas) if (p.z < 0) p.d();
    tablero();
    for (const p of piezas) if (p.z >= 0) p.d();
    g.restore();
  }

  /* ---------- rampa: cuarto de tubo a la derecha, con plataforma ---------- */
  const RX0 = 872, RR = 160, RTH = 1.08;
  const RLX = RX0 + RR * Math.sin(RTH), RALTO = RR * (1 - Math.cos(RTH)), RARC = RR * RTH;
  // punto de la línea de rodadura por longitud de arco s (s < 0: suelo; 0…RARC: curva; > RARC: plataforma)
  function sup(s) {
    if (s <= 0) return { x: RX0 + s, y: SUELO };
    if (s >= RARC) return { x: RLX + (s - RARC), y: SUELO - RALTO };
    const th = s / RR; return { x: RX0 + RR * Math.sin(th), y: SUELO - RR * (1 - Math.cos(th)) };
  }
  // tabla apoyada: ruedas en s ± EJE → centro del tablero y ángulo
  function enRampa(s) {
    const p1 = sup(s - EJE), p2 = sup(s + EJE);
    const dx = p2.x - p1.x, dy = p2.y - p1.y, l = Math.hypot(dx, dy), ux = dx / l, uy = dy / l;
    return { x: (p1.x + p2.x) / 2 + uy * HO, y: (p1.y + p2.y) / 2 - ux * HO, a: Math.atan2(uy, ux) };
  }

  /* =====================================================================================
   * MOVIMIENTO DE LA TABLA (todo cerrado en t)
   * ===================================================================================== */
  // Deivi: entra por la plataforma, se deja caer y rueda hacia la izquierda (s de la rampa)
  const KD = [[T.entra, RARC + 130, -230], [T.labio, RARC, -250], [T.abajo, 0, -470], [T.ollie, -82, -290],
              [T.ollie1, -198, -240], [T.kf, -256, -210], [T.kf1, -340, -160], [T.bajaPie, -378, -55], [T.pisa, -382, 0]];
  const X_PISA = RX0 + KD[KD.length - 1][1];       // dónde frena
  // trucos (en el suelo): elevación, cabeceo (+ = morro arriba, el morro va a la izquierda) y giro sobre el eje largo
  function truco(t) {
    let lift = 0, pitch = 0, flip = 0;
    const uo = fase(t, T.ollie, T.ollie1);
    if (uo > 0 && uo < 1) {
      pitch = 0.5 * salida(fase(uo, 0, 0.1)) * (1 - suave(fase(uo, 0.14, 0.46))) - 0.07 * campana(uo, 0.7, 1);
      lift = 72 * 4 * uo * (1 - uo);
    }
    const uk = fase(t, T.kf, T.kf1);
    if (uk > 0 && uk < 1) {
      pitch = 0.3 * salida(fase(uk, 0, 0.1)) * (1 - suave(fase(uk, 0.1, 0.34)));
      lift = 58 * 4 * uk * (1 - uk);
      flip = TAU * suave(fase(uk, 0.1, 0.78));
    }
    // la cola no se mete en el suelo al cabecear
    lift = Math.max(lift, TL / 2 * Math.sin(Math.abs(pitch)) - (HO + 6));
    return { lift, pitch, flip };
  }
  const LG = { x: -TL / 2 + 24, y: 0 };            // por dónde la agarra Deivi (cerca del morro)
  const LP = { x: EJE, y: HO };                     // contacto de la rueda trasera (eje de giro al pisar la cola)
  function tablaPisada(t) {
    const k = salida(fase(t, T.pisa, T.pisa + 0.1)), a = Math.PI / 2 * k;
    const pc = { x: X_PISA + EJE, y: SUELO }, r = rot(LP, a);
    const sube = 104 * salida(fase(t, T.pisa + 0.07, T.agarra));
    return { x: pc.x - r.x, y: pc.y - r.y - sube, a, f: 0, giro: 0 };
  }
  // punto de agarre de la tabla en el instante en que llega a la mano
  const AGARRE = (() => { const B = tablaPisada(T.agarra), r = rot(LG, B.a); return { x: B.x + r.x, y: B.y + r.y }; })();

  // al soltarla: vuela hasta los pies de Guillermo y rueda un poco
  const XL = 462, XT = 430;
  let soltada = null;
  const tablaSoltada = () => soltada || (soltada = poseD(T.suelta - 1e-4).tablaMano);

  // disparada: cruza, sube la rampa, se tambalea en el borde y vuelve (s de la rampa)
  const LX = 320, LY = SUELO - 38;                  // Guillermo tumbado: pelvis
  const SUELA_X = LX + 180;                         // suelas de Guillermo tumbado (aprox.)
  const S_CHOCA = SUELA_X + TL / 2 + 2 - RX0;
  const KT1 = [[T.dispara, XT - RX0, 700], [T.dispara + 0.09, XT - RX0 + 110, 1450], [T.rampa, 0, 1120], [T.borde, RARC + 22, 0]];
  const KT2 = [[T.vuelve, 0, 0], [T.abajo2, 0, -900], [T.choca, S_CHOCA, -860]];
  function sBorde(t) { const u = t - T.borde; return RARC + 16 + 6 * Math.cos(u * TAU * 2.4) * Math.exp(-u * 1.5); }
  KT2[0][1] = sBorde(T.vuelve);
  // barriga de Guillermo
  const XB = LX - 36, ALTO_BARRIGA = 66, YB = SUELO - ALTO_BARRIGA - HO, AB = -0.1;

  function tabla(t) {
    if (t < T.pisa) {
      const s = hermite(KD, t), r = enRampa(s), tr = truco(t);
      return { modo: "deivi", x: r.x, y: r.y - tr.lift, a: r.a + tr.pitch, f: tr.flip, giro: s / RUEDA, s, rampa: r, tr };
    }
    if (t < T.agarra) return Object.assign({ modo: "pisa" }, tablaPisada(t));
    if (t < T.suelta) return { modo: "mano" };                   // la lleva Deivi (la calcula su postura)
    if (t < T.toca) {
      const A = tablaSoltada(), u = fase(t, T.suelta, T.toca);
      const x = lerp(A.x, XL, u), y = lerp(A.y, SUELO - HO, u * u) - 46 * 4 * u * (1 - u);
      return { modo: "vuela", x, y, a: lerp(A.a, 0, suave(u)), f: 0, giro: 0 };
    }
    if (t < T.dispara) {
      const u = fase(t, T.toca, T.para), x = lerp(XL, XT, salida(u));
      const bote = t < T.toca + 0.35 ? 7 * Math.exp(-(t - T.toca) * 12) * Math.abs(Math.sin((t - T.toca) * 26)) : 0;
      // con el pie de Guillermo encima se mueve un poquito, adelante y atrás
      const duda = 5 * Math.sin((t - T.sube1) * 15) * campana(t, T.sube1 - 0.05, T.dispara);
      return { modo: "suelo", x: x + duda, y: SUELO - HO - bote, a: -0.05 * bote / 7, f: 0, giro: (x + duda) / RUEDA };
    }
    if (t < T.choca) {
      let s;
      if (t < T.borde) s = hermite(KT1, t);
      else if (t < T.vuelve) s = sBorde(t);
      else s = hermite(KT2, t);
      const r = enRampa(s);
      return { modo: "rueda", x: r.x, y: r.y, a: r.a, f: 0, giro: s / RUEDA, s };
    }
    if (t < T.boing) {
      const u = fase(t, T.choca, T.boing), x0 = RX0 + S_CHOCA;
      return { modo: "salta", x: lerp(x0, XB, u), y: lerp(SUELO - HO, YB, u) - 225 * 4 * u * (1 - u), a: (-TAU + AB) * u, f: 0, giro: 0 };
    }
    return { modo: "barriga" };                                  // la coloca la postura de Guillermo
  }

  /* =====================================================================================
   * DEIVI: entra montado mirando a la izquierda (espejo); frena, se queda con la tabla y luego mira.
   * ===================================================================================== */
  const CARAS_D = {
    monta: E({ mx: 0.85, my: 0.05, c: 0.15, sd: 6, gd: 0.04, si: 8, gi: 0.05, orig: 0, sonr: 0.6, ancho: 0.95 }),
    truco: E({ mx: 0.5, my: 0.75, c: 0.25, sd: -4, gd: -0.1, si: -4, gi: -0.1, orig: 0, sonr: 0.35, abre: 4, ancho: 0.9, lengua: 0.5 }),
    chulo: E({ mx: -0.85, my: -0.05, c: 0.1, sd: 10, gd: 0.08, si: 14, gi: 0.1, orig: 0, sonr: 0.85, ancho: 1 }),
    guino: E({ mx: -0.85, my: -0.05, h: 1, wd: 1, sd: 6, gd: 0.05, si: 16, gi: 0.12, orig: 0, sonr: 0.95, abre: 4, ancho: 1.02 }),
    mira: E({ mx: 0.85, my: 0.1, c: 0.15, sd: 8, gd: 0.06, si: 10, gi: 0.06, orig: 0, sonr: 0.45, ancho: 0.9 }),
    divertido: E({ mx: 0.85, my: 0.1, c: 0.3, sd: 18, gd: 0.12, si: 6, gi: 0.04, orig: 0, sonr: 0.7, abre: 6, ancho: 0.95 }),
    vale: E({ mx: 0.85, my: 0.05, c: 0.35, h: 0.6, sd: 16, gd: 0.1, si: 16, gi: 0.1, orig: 0, sonr: 0.8, abre: 8, ancho: 1 }),
    pasmo: E({ mx: 0.85, my: 0.3, iris: 0.9, sd: 22, gd: 0.14, si: 22, gi: 0.14, orig: 0, abre: 22, ancho: 0.7, sonr: 0.1 }),
    salta: E({ mx: 0.6, my: 0.6, c: 0.2, sd: 14, gd: 0.1, si: 10, gi: 0.08, orig: 0, sonr: 0.7, abre: 6, ancho: 0.95 }),
    rampa: E({ mx: -0.6, my: -0.25, sd: 18, gd: 0.12, si: 18, gi: 0.12, orig: 0, sonr: 0.2, abre: 10, ancho: 0.75 }),
    auch: E({ mx: 0.85, my: 0.4, c: 0.75, z: 1, sd: -8, gd: -0.2, si: -8, gi: -0.2, orig: 0, abre: 14, ancho: 1.25, sonr: -0.55 }),
    risa: E({ mx: 0.6, my: 0.3, c: 1, h: 1, sd: 14, gd: 0.1, si: 14, gi: 0.1, orig: 0, sonr: 1, abre: 30, ancho: 1.1, lengua: 0.3 }),
    amable: E({ mx: 0.85, my: 0.45, c: 0.2, h: 0.4, sd: 12, gd: 0.1, si: 12, gi: 0.1, orig: 0, sonr: 0.75, abre: 6, ancho: 1 }),
    guino2: E({ mx: -0.85, my: 0, h: 1, wd: 1, sd: 6, gd: 0.05, si: 16, gi: 0.12, orig: 0, sonr: 1, abre: 10, ancho: 1.05 })
  };
  const GUION_CARA_D = [
    [T.ollie0 - 0.05, T.ollie0 + 0.08, "truco"], [T.ollie1 + 0.02, T.ollie1 + 0.12, "monta"], [T.kf0, T.kf0 + 0.1, "truco"],
    [T.kf1 + 0.02, T.kf1 + 0.14, "monta"], [T.agarra, T.agarra + 0.2, "chulo"], [T.guino - 0.06, T.guino + 0.06, "guino"],
    [T.guino + 0.42, T.guino + 0.55, "chulo"], [T.reza0 + 0.1, T.reza0 + 0.3, "divertido"], [T.vale, T.vale + 0.18, "vale"],
    [T.suelta + 0.1, T.suelta + 0.3, "mira"], [T.dispara + 0.02, T.dispara + 0.1, "pasmo"], [T.salto1 - 0.02, T.salto1 + 0.08, "salta"],
    [T.rampa, T.rampa + 0.15, "rampa"], [T.vuelve + 0.1, T.vuelve + 0.3, "pasmo"], [T.salto2 - 0.02, T.salto2 + 0.08, "salta"],
    [T.choca - 0.04, T.choca + 0.1, "pasmo"], [T.auch - 0.02, T.auch + 0.08, "auch"], [T.risa0, T.risa0 + 0.15, "risa"],
    [T.risa1 - 0.05, T.risa1 + 0.15, "amable"], [T.guino2 - 0.06, T.guino2 + 0.06, "guino2"]
  ];
  // cuerpo (hoja de Deivi): pel (+ abajo), torso, cab; manos respecto a sus hombros; p = puño visible, d = dedos
  const P0D = { pel: 0, torso: 0, cab: 0, cx: 9, cy: 377, cp: 0, cd: 0.5, lx: -56, ly: 381, lp: 0, ld: 0.5 };
  const CD = o => Object.assign({}, P0D, o);
  const CUERPOS_D = {
    bolsillos: CD({}),
    monta: CD({ torso: 0.08, cab: -0.04, cx: -120, cy: 355, cp: 1, cd: 0.6, lx: 160, ly: 360, lp: 1, ld: 0.6 }),
    abre: CD({ torso: 0.2, cab: -0.12, cx: -280, cy: 250, cp: 1, cd: 0.95, lx: 310, ly: 240, lp: 1, ld: 0.95 }),
    aire: CD({ torso: 0.1, cab: 0.06, cx: -320, cy: 180, cp: 1, cd: 0.9, lx: 345, ly: 170, lp: 1, ld: 0.9 }),
    frena: CD({ torso: 0.02, cab: 0.02, cx: -80, cy: 365, cp: 1, cd: 0.5, lx: 130, ly: 370, lp: 1, ld: 0.5 }),
    tabla: CD({ torso: -0.03, cab: -0.04, cx: -30, cy: 330, cp: 1, cd: 0.32, lx: -56, ly: 381, lp: 0, ld: 0.5 }),
    lanza: CD({ torso: 0.12, cab: 0.06, cx: 150, cy: 300, cp: 1, cd: 0.32, lx: -56, ly: 381, lp: 0, ld: 0.5 }),
    invita: CD({ torso: 0.06, cab: 0.04, cx: 9, cy: 377, cp: 0, cd: 0.5, lx: 320, ly: 235, lp: 1, ld: 1 }),
    risa: CD({ pel: 14, torso: 0.1, cab: 0.08, cx: 9, cy: 377, cp: 0, lx: 120, ly: -10, lp: 1, ld: 0.9 }),
    ofrece: CD({ pel: 45, torso: 0.34, cab: 0.16, cx: 9, cy: 377, cp: 0, lx: 260, ly: 200, lp: 1, ld: 1 }),
    tira: CD({ pel: 22, torso: 0.04, cab: 0.0, cx: 9, cy: 377, cp: 0, lx: 260, ly: 200, lp: 1, ld: 0.32 })
  };
  const GUION_CUERPO_D = [
    [T.labio - 0.1, T.labio + 0.08, "abre"], [T.abajo - 0.05, T.abajo + 0.12, "monta"], [T.ollie - 0.02, T.ollie + 0.1, "aire"],
    [T.ollie1 - 0.06, T.ollie1 + 0.14, "monta"], [T.kf - 0.02, T.kf + 0.1, "aire"], [T.kf1 - 0.06, T.kf1 + 0.14, "monta"],
    [T.bajaPie - 0.08, T.pisa, "frena"], [T.pisa + 0.05, T.agarra, "tabla"], [T.lanza0, T.suelta, "lanza"],
    [T.suelta + 0.05, T.atras0 + 0.25, "invita"], [T.atras1 - 0.15, T.atras1 + 0.2, "bolsillos"],
    [T.risa0 - 0.05, T.risa0 + 0.2, "risa"], [T.risa1 - 0.1, T.risa1 + 0.2, "bolsillos"], [T.ofrece0, T.ofrece1, "ofrece"],
    [T.coge + 0.05, T.tira1, "tira"]
  ];
  // pelvis de Deivi (x de pantalla) cuando ya no va montado
  const XQ = 770;                                   // dónde se queda mirando
  const XD = [[T.agarra, X_PISA + 13], [T.atrasA0, X_PISA + 13], [T.atrasA1, 610], [T.atras0, 610], [T.atras1, XQ], [T.anda0, XQ], [T.anda1, 590], [DUR, 590]];
  // pasos (x de pantalla del tobillo): [t0, t1, x, alza]
  const PD0 = X_PISA + 13;
  const PASOS_D = {
    cerca: [[-9, -8, PD0 + 15], [T.atrasA0, T.atrasA0 + 0.24, 625, 20], [T.atras0, T.atras0 + 0.3, 700, 22], [T.atras0 + 0.42, T.atras0 + 0.7, XQ + 15, 22],
            [T.anda0 + 0.17, T.anda0 + 0.42, 690, 24], [T.anda0 + 0.52, T.anda0 + 0.77, 605, 22]],
    lejos: [[-9, -8, PD0 - 47], [T.atrasA0 + 0.18, T.atrasA0 + 0.42, 563, 20], [T.atras0 + 0.2, T.atras0 + 0.5, 650, 22], [T.atras0 + 0.56, T.atras0 + 0.8, XQ - 47, 22],
            [T.anda0, T.anda0 + 0.25, 650, 24], [T.anda0 + 0.35, T.anda0 + 0.6, 543, 22]]
  };
  const TOB_D = { cerca: D.SUELO - D.TOBILLO_ALTO, lejos: D.SUELO - D.TOBILLO_ALTO - 6 };
  const ALTO_PEL_D = (D.SUELO - D.PELVIS.y) * S;          // altura de la pelvis de pie (px)
  // saltitos de Deivi para dejar pasar la tabla
  // (se calculan con el paso real de la tabla bajo sus pies: así nunca la pisa)
  let SALTOS = null;
  function calculaSaltos() {
    const xa = XQ - 47 - 35 - TL / 2 - 6, xb = XQ + 15 + 9 + TL / 2 + 6, out = [];
    for (const [t0, t1] of [[T.dispara, T.borde], [T.vuelve, T.choca]]) {
      let a = null, b = null;
      for (let t = t0; t <= t1; t += 0.005) { const x = tabla(t).x; if (x > xa && x < xb) { if (a === null) a = t; b = t; } }
      const L = (b - a) / 0.59 + 0.04, c = (a + b) / 2;
      out.push([c - L / 2, c + L / 2]);
    }
    return out;
  }
  const salto = t => { if (!SALTOS) SALTOS = calculaSaltos(); let m = 0; for (const [a, b] of SALTOS) m = Math.max(m, campana(t, a, b)); return m; };
  // de la suela (pantalla) al tobillo (hoja), con el pie inclinado ang (pantalla)
  function tobDesdeSuela(P, p, q, ang, cx, alto) {
    const ah = p.espejo ? -ang : ang, h = P.aHoja(p, q), o = rot({ x: cx, y: alto }, ah);
    return { tob: { x: h.x - o.x, y: h.y - o.y }, ang: ah };
  }

  function poseD(t) {
    const b = guion(GUION_CUERPO_D, CUERPOS_D, "monta", t);
    const B = t < T.pisa ? tabla(t) : null;
    const montado = t < T.pisa;
    const respira = Math.sin(t * 2.2 + 0.7);
    let x, pelH, flex = 12;                 // pelH: altura de la pelvis (px sobre el suelo)
    const p = { suelo: SUELO, s: S, espejo: true, tirasLimpias: true, torsoEsc: { x: 1, y: 1 + respira * 0.004 }, piernas: {},
      cabeza: { ang: b.cab, dx: 0, dy: 0, esc: { x: 1, y: 1 } } };
    // ---- pies ----
    let pies;
    if (montado) {
      // marco "plano": la tabla como si estuviera en el suelo (la rampa se aplica girando a Deivi entero)
      const tr = B.tr, bx = B.x, by = SUELO - HO - tr.lift, ba = tr.pitch;
      const enLija = lx => { const q = rot({ x: lx, y: -TH / 2 - kick(lx) }, ba); return { x: bx + q.x, y: by + q.y }; };
      // al hacer el kickflip los pies se separan de la tabla y el delantero da el toque hacia fuera
      const uk = fase(t, T.kf, T.kf1), sep = 26 * campana(uk, 0.06, 0.82), toque = 22 * campana(uk, 0.04, 0.4);
      const ollie = fase(t, T.ollie, T.ollie1), arrastra = 16 * campana(ollie, 0.05, 0.5);
      // al frenar: el pie de atrás se va a la cola y el de delante baja al suelo
      const fre = suave(fase(t, T.bajaPie - 0.1, T.bajaPie + 0.06)), bajaL = fase(t, T.bajaPie, T.pisa - 0.02);
      const fc = enLija(48 + 20 * fre), fl0 = enLija(-46 - toque - arrastra);
      const fl = { x: lerp(fl0.x, X_PISA - 46, suave(bajaL)), y: lerp(fl0.y, SUELO, suave(bajaL)) - 16 * Math.sin(Math.PI * bajaL) };
      pies = { cerca: { x: fc.x, y: fc.y - sep, ang: ba }, lejos: { x: fl.x, y: fl.y - sep * 1.1, ang: ba - 0.25 * campana(uk, 0.04, 0.4) - 0.15 * Math.sin(Math.PI * bajaL) } };
      x = bx + 13;
      // flexión: agachado antes del salto, recogido en el aire, amortigua al caer
      const ag = tramo(t, T.ollie0, T.ollie, salida) * (1 - fase(t, T.ollie, T.ollie + 0.06)) + tramo(t, T.kf0, T.kf, salida) * (1 - fase(t, T.kf, T.kf + 0.06));
      const amort = campana(t, T.ollie1 - 0.02, T.ollie1 + 0.3) + campana(t, T.kf1 - 0.02, T.kf1 + 0.3) + 0.7 * campana(t, T.abajo - 0.15, T.abajo + 0.25);
      const recoge = campana(t, T.ollie, T.ollie1) + campana(t, T.kf, T.kf1) * 1.1;
      flex = 12 + 30 * ag + 26 * amort + 34 * recoge + 18 * tramo(t, T.bajaPie - 0.1, T.bajaPie + 0.05) - 18 * tramo(t, T.pisa - 0.1, T.pisa);
      const piesH = SUELO - (pies.cerca.y + pies.lejos.y) / 2;
      pelH = piesH + ALTO_PEL_D - flex;
    } else {
      x = recorrido(XD, t);
      const sa = salto(t);
      const pa = {};
      for (const lado of ["cerca", "lejos"]) {
        const f = pie(PASOS_D[lado], t);
        pa[lado] = { x: f.x, alza: f.alza + 58 * sa, u: f.u, sube: f.alza > 1 };
      }
      // frenada: el pie delantero baja al suelo; el de atrás pisa la cola y luego se apoya
      const fr = fase(t, T.pisa, T.agarra + 0.2);
      if (fr < 1) {
        const kL = suave(fase(t, T.pisa - 0.12, T.pisa)), kC = suave(fase(t, T.pisa + 0.03, T.agarra + 0.12));
        const xc0 = X_PISA + 68 + 13, xl0 = X_PISA - 46 + 13;
        pa.lejos = { x: lerp(xl0, PD0 - 47, kL), alza: 0, u: 0, sube: false };
        pa.cerca = { x: lerp(xc0, PD0 + 15, kC), alza: (LIJA - 18 * salida(fase(t, T.pisa, T.pisa + 0.06))) * (1 - kC) + 10 * campana(kC, 0, 1), u: kC, sube: kC > 0 && kC < 1 };
      }
      pies = {};
      for (const lado of ["cerca", "lejos"]) {
        const f = pa[lado];
        pies[lado] = { x: f.x - 13, y: SUELO - f.alza, ang: f.sube ? -0.18 * Math.sin(Math.PI * f.u) : 0, tobX: f.x };
      }
      if (!SALTOS) SALTOS = calculaSaltos();
      flex = 4 + 22 * sa + 12 * campana(t, SALTOS[0][0] - 0.1, SALTOS[0][0] + 0.04) + 12 * campana(t, SALTOS[1][0] - 0.1, SALTOS[1][0] + 0.04)
        + 14 * campana(t, T.pisa - 0.05, T.agarra + 0.25);
      pelH = ALTO_PEL_D + 40 * sa - flex;
    }
    p.x = x;
    p.pelvis = { x: D.PELVIS.x, y: D.PELVIS.y - (pelH - ALTO_PEL_D) / S + b.pel + respira * 1.2 };
    p.torso = b.torso;
    for (const lado of ["cerca", "lejos"]) {
      const f = pies[lado];
      const r = tobDesdeSuela(D, p, { x: f.x, y: f.y }, f.ang, 44, D.TOBILLO_ALTO);
      p.piernas[lado] = { tob: { x: r.tob.x, y: r.tob.y - (lado === "lejos" ? 6 : 0) }, ang: r.ang };
    }
    // bamboleo al rodar
    if (montado) { p.torso += 0.03 * Math.sin(t * 5.3) * (1 - campana(t, T.ollie0, T.kf1 + 0.2)); p.cabeza.ang += 0.04 * Math.sin(t * 4.1 + 1); }
    // cabeceo: asiente al decir que vale
    p.cabeza.ang += 0.1 * campana(t, T.vale, T.vale + 0.3) + 0.06 * campana(t, T.vale + 0.25, T.vale + 0.5);
    // ---- cara ----
    const ex = guion(GUION_CARA_D, CARAS_D, "monta", t);
    p.cara = cara(ex, parpadeo(t, [1.9, 4.6, 6.4, 8.2, 10.9, 12.4]));
    p.cara.rubor = 0.25 * tramo(t, T.risa0, T.risa0 + 0.3) * (1 - tramo(t, T.risa1, T.risa1 + 0.5));
    // ---- manos ----
    const Tr = D.tronco(p), hc = Tr(D.HOMBRO_C), hl = Tr(D.HOMBRO);
    const bC = Tr(D.BOLSILLO_C), bL = Tr(D.BOLSILLO_L);
    let c = mezcla({ x: hc.x + b.cx, y: hc.y + b.cy }, bC, 1 - clamp(b.cp * 1.4));
    let l = mezcla({ x: hl.x + b.lx, y: hl.y + b.ly }, bL, 1 - clamp(b.lp * 1.4));
    // brazos sueltos al rodar: se mecen para equilibrar
    const mece = montado ? 1 : 0;
    c = { x: c.x + 18 * Math.sin(t * 5.3 + 1) * mece, y: c.y + 12 * Math.sin(t * 4.4) * mece };
    l = { x: l.x - 16 * Math.sin(t * 5.3 + 2) * mece, y: l.y + 12 * Math.sin(t * 4.4 + 1) * mece };
    let cmu = muHacia(c, hc, 0.1), lmu = muHacia(l, hl, -0.1), cdedos = dedosTodos(b.cd), ldedos = dedosTodos(b.ld), cpuno = b.cp, lpuno = b.lp;
    if (b.cp < 0.05) cmu = -1.75;
    if (b.lp < 0.05) lmu = -1.75;
    // la tabla en la mano: la agarra cuando sube y la lleva colgando junto a la pierna
    let tablaMano = null;
    const lleva = t >= T.agarra - 0.1 && t < T.suelta;
    if (lleva) {
      const a0 = fase(t, T.agarra - 0.1, T.agarra);
      const aH = D.aHoja(p, AGARRE);
      if (t < T.agarra) c = mezcla(c, aH, suave(a0));
      else {
        // la deja colgando junto a la pierna; al lanzar la lleva por delante
        const cuelga = Tr({ x: 62, y: 640 }), delante = Tr({ x: 330, y: 610 });
        const k1 = suave(fase(t, T.agarra, T.agarra + 0.3)), k2 = suave(fase(t, T.lanza0, T.suelta));
        c = mezcla(mezcla(aH, cuelga, k1), delante, k2);
        const cs = D.aPantalla(p, c);
        const swing = 0.14 * Math.exp(-(t - T.agarra) * 4) * Math.sin((t - T.agarra) * 11) + 0.04 * Math.sin(t * 2.1);
        const a = Math.PI / 2 + swing - 0.5 * k2;
        const r = rot(LG, a);
        tablaMano = { modo: "mano", x: cs.x - r.x, y: cs.y - r.y, a, f: 0, giro: 0 };
        cmu = lerp(-1.6, -2.4, k2);
      }
      cdedos = AGARRA; cpuno = 1;
    }
    // invita: la palma abierta hacia la tabla
    const inv = campana(t, T.suelta + 0.05, T.atras1);
    if (inv > 0) { lmu = lerp(lmu, 2.6, clamp(inv * 1.5)); ldedos = dedosTodos(1); }
    // risa: la mano lejana a la boca
    const tapa = campana(t, T.risa0 - 0.05, T.risa1 + 0.1);
    if (tapa > 0) { const bo = D.boca(p); l = mezcla(l, { x: bo.x + 40, y: bo.y + 40 }, clamp(tapa * 1.6)); lmu = lerp(lmu, 1.2, clamp(tapa * 1.6)); }
    // ofrece la mano: va a buscar la de Guillermo (se fija en pose())
    p.manoCerca = { x: c.x, y: c.y, ang: 0, mu: cmu, dobla: -1, puno: cpuno, dedos: cdedos };
    p.manoLejos = { x: l.x, y: l.y, ang: 0, mu: lmu, dobla: 1, puno: lpuno, dedos: ldedos };
    if (tablaMano) { const TM = tablaMano; p.manoCerca.objeto = g => { g.save(); g.setTransform(CAM); dibTabla(g, TM); g.restore(); }; }
    p.tablaMano = tablaMano;
    p.ikContinuo = false;
    // en la rampa, Deivi entero gira con la tabla
    if (montado) { const r = B.rampa; p.grupo = { x: r.x, y: r.y, a: r.a, x0: r.x, y0: SUELO - HO }; }
    return p;
  }

  /* =====================================================================================
   * GUILLERMO: a la izquierda mirando a la derecha. Mira, aplaude, suplica, prueba… y se la pega.
   * ===================================================================================== */
  const CARAS_G = {
    inicio: E({ mx: 0.9, my: -0.1, sonr: 0.35, orig: 0, sd: 4, gd: 0.04, si: 4, gi: 0.04 }),
    asombro: E({ mx: 0.9, my: 0, iris: 1.05, sd: 20, gd: 0.12, si: 20, gi: 0.12, orig: 0, abre: 12, ancho: 0.7, sonr: 0.2 }),
    pasmo: E({ mx: 0.9, my: 0.1, iris: 0.82, sd: 26, gd: 0.15, si: 26, gi: 0.15, orig: 0, abre: 50, ancho: 0.8, sonr: -0.1, lengua: 0.4 }),
    aplaude: E({ mx: 0.9, my: 0, c: 0.8, h: 1, sd: 18, gd: 0.12, si: 18, gi: 0.12, orig: 0, abre: 30, ancho: 1.1, sonr: 1, lengua: 0.3 }),
    suplica: E({ mx: 0.9, my: -0.25, iris: 1.16, sd: 24, gd: 0.3, si: 24, gi: 0.3, orig: 0, abre: 5, ancho: 0.55, sonr: -0.3 }),
    contento: E({ mx: 0.9, my: 0.1, c: 0.6, h: 1, sd: 16, gd: 0.1, si: 16, gi: 0.1, orig: 0, abre: 18, ancho: 1.05, sonr: 1 }),
    chulo: E({ mx: -0.85, my: -0.15, sd: 18, gd: 0.16, si: -4, gi: -0.08, orig: 0, sonr: 0.85, abre: 4, ancho: 0.95 }),
    concentra: E({ mx: 0.6, my: 0.8, c: 0.3, sd: -6, gd: -0.15, si: -6, gi: -0.15, orig: 0, sonr: 0.3, abre: 6, ancho: 0.8, lengua: 0.8 }),
    susto: E({ mx: 0.4, my: 0.5, iris: 0.72, sd: 28, gd: 0.18, si: 28, gi: 0.18, orig: 0, abre: 30, ancho: 0.65, sonr: -0.2 }),
    pausa: E({ mx: 0, my: 0, iris: 0.78, sd: 26, gd: 0.2, si: 26, gi: 0.2, orig: 0, abre: 10, ancho: 0.5, sonr: -0.35 }),
    pum: E({ mx: 0, my: 0, c: 1, z: 1, sd: -10, gd: -0.25, si: -10, gi: -0.25, orig: 0, abre: 14, ancho: 1.2, sonr: -0.6 }),
    alivio: E({ mx: 0, my: -0.4, c: 0.9, h: 0.6, sd: 8, gd: 0.05, si: 8, gi: 0.05, orig: 0, abre: 16, ancho: 0.7, sonr: 0.35 }),
    oye: E({ mx: 0.2, my: 0.9, iris: 0.95, sd: 14, gd: 0.08, si: 14, gi: 0.08, orig: 0, abre: 4, ancho: 0.7, sonr: 0 }),
    panico: E({ mx: 0.2, my: 0.9, iris: 0.7, sd: 28, gd: 0.25, si: 28, gi: 0.25, orig: 0, abre: 30, ancho: 1.05, sonr: -0.75 }),
    sigue: E({ mx: 0.6, my: -0.6, iris: 0.75, sd: 28, gd: 0.25, si: 28, gi: 0.25, orig: 0, abre: 34, ancho: 0.8, sonr: -0.5 }),
    boing: E({ mx: 0, my: -0.6, iris: 0.6, sd: 30, gd: 0.2, si: 30, gi: 0.2, orig: 0, abre: 8, ancho: 0.6, sonr: -0.3, mof: 1 }),
    ko: E({ mx: 0, my: 0, esp: 1, sd: 12, gd: 0.2, si: -6, gi: -0.1, orig: 0, abre: 22, ancho: 0.8, sonr: -0.2, lengua: 0.9 }),
    aturdido: E({ mx: 0.5, my: -0.1, esp: 0.35, c: 0.45, sd: 6, gd: 0.1, si: 2, gi: 0.02, orig: 0, abre: 8, ancho: 0.8, sonr: 0.25, lengua: 0.2 }),
    gracias: E({ mx: 0.85, my: -0.4, c: 0.35, h: 0.7, sd: 14, gd: 0.1, si: 10, gi: 0.08, orig: 0, abre: 12, ancho: 1, sonr: 0.85 })
  };
  const GUION_CARA_G = [
    [0.7, 1.0, "inicio"], [T.ollie - 0.05, T.ollie + 0.1, "asombro"], [T.kf + 0.05, T.kf + 0.2, "pasmo"],
    [T.aplaude0, T.aplaude0 + 0.15, "aplaude"], [T.reza0, T.reza0 + 0.2, "suplica"], [T.vale + 0.1, T.vale + 0.3, "contento"],
    [T.chulo, T.chulo + 0.15, "chulo"], [T.sube0 + 0.05, T.sube0 + 0.2, "concentra"], [T.dispara, T.dispara + 0.06, "susto"],
    [T.horiz + 0.02, T.horiz + 0.15, "pausa"], [T.pum - 0.02, T.pum + 0.04, "pum"], [T.alivio, T.alivio + 0.2, "alivio"],
    [T.oye, T.oye + 0.12, "oye"], [T.ve, T.ve + 0.1, "panico"], [T.choca, T.choca + 0.1, "sigue"],
    [T.boing - 0.02, T.boing + 0.04, "boing"], [T.boing + 0.4, T.boing + 0.65, "ko"], [T.sienta0 + 0.1, T.sienta1, "aturdido"],
    [T.ofrece1, T.coge + 0.2, "gracias"]
  ];
  const P0G = { pel: 0, torso: 0, cab: 0, cx: 0, cy: 0, cp: 0, cd: 0.5, lx: 0, ly: 0, lp: 0, ld: 0.5 };
  const CG = o => Object.assign({}, P0G, o);
  const CUERPOS_G = {
    bolsillos: CG({}),
    aplaude: CG({ torso: 0.03, cab: -0.02, cx: 265, cy: 120, cp: 1, cd: 1, lx: 30, ly: 110, lp: 1, ld: 1 }),
    reza: CG({ pel: 8, torso: 0.08, cab: -0.04, cx: 285, cy: 55, cp: 1, cd: 1, lx: 15, ly: 42, lp: 1, ld: 1 }),
    frota: CG({ torso: 0.04, cab: 0.04, cx: 265, cy: 150, cp: 1, cd: 0.7, lx: 25, ly: 130, lp: 1, ld: 0.7 }),
    equilibrio: CG({ pel: 14, torso: 0.1, cab: 0.04, cx: -300, cy: 110, cp: 1, cd: 1, lx: 290, ly: 70, lp: 1, ld: 1 }),
    aire: CG({ torso: 0.0, cab: -0.05, cx: 340, cy: -20, cp: 1, cd: 1, lx: 285, ly: -40, lp: 1, ld: 1 }),
    tumbado: CG({ torso: 0, cab: 0.06, cx: -90, cy: 285, cp: 1, cd: 0.8, lx: -50, ly: 255, lp: 1, ld: 0.8 }),
    mira: CG({ torso: 0.14, cab: 0.2, cx: -110, cy: 270, cp: 1, cd: 0.9, lx: -60, ly: 250, lp: 1, ld: 0.9 }),
    sentado: CG({ torso: 0.12, cab: 0.04, cx: 60, cy: 200, cp: 1, cd: 0.6, lx: 150, ly: 160, lp: 1, ld: 0.5 })
  };
  const GUION_CUERPO_G = [
    [T.aplaude0 - 0.1, T.aplaude0 + 0.1, "aplaude"], [T.reza0 - 0.1, T.reza0 + 0.2, "reza"], [T.reza1, T.reza1 + 0.3, "bolsillos"],
    [T.frota0, T.frota0 + 0.2, "frota"], [T.chulo + 0.15, T.sube0, "bolsillos"], [T.sube0, T.sube1, "equilibrio"],
    [T.dispara, T.horiz, "aire", salida], [T.cae0, T.pum, "tumbado"], [T.oye, T.ve, "mira"], [T.choca + 0.1, T.boing, "tumbado"],
    [T.sienta0, T.sienta1, "sentado"]
  ];
  const XG = [[0, 280], [T.sube0, 280], [T.sube1, 316], [DUR, 316]];
  const PASOS_G = {
    cerca: [[-9, -8, 280 - 18]],
    lejos: [[-9, -8, 280 + 21], [T.sube1 - 0.08, T.sube1 + 0.14, 326, 10]]
  };
  const TOB_G = { cerca: G.SUELO - G.TOBILLO_ALTO, lejos: G.SUELO - G.TOBILLO_ALTO - 12 };
  const R_M = G.MUNECA_R * G.JK;
  const manoDesde = (m, ang, mu) => { const o = G.rotP({ x: Math.cos(mu) * R_M, y: Math.sin(mu) * R_M }, ang); return { x: m.x - o.x, y: m.y - o.y }; };
  const BOLS_GC = manoDesde({ x: 131, y: 652 }, 0, -1.75), BOLS_GL = manoDesde({ x: 372, y: 648 }, 0, -1.75);
  const LARGO_PIERNA_G = (G.SUELO - G.TOBILLO_ALTO - G.PELVIS.y) * 0.98;
  const AIRE = { x: 330, y: 394 }, SENTADO_Y = SUELO - 40;

  // hundimiento de la barriga al caerle la tabla
  function aplasta(t) { return t >= T.boing ? Math.exp(-(t - T.boing) * 7) * Math.abs(Math.cos((t - T.boing) * 13)) : 0; }
  // Guillermo entero gira como un bloque alrededor de la pelvis (o: pelvis de la postura interna)
  function caida(t, o) {
    const k = salida(fase(t, T.dispara, T.horiz));
    if (k <= 0) return { k: 0, phi: 0, dx: 0, dy: 0 };
    let phi = -Math.PI / 2 * k, x = lerp(o.x, AIRE.x, k), y = lerp(o.y, AIRE.y, k);
    // suspendido en el aire: un vaivén mínimo
    const fl = tramo(t, T.horiz, T.horiz + 0.12) * (1 - fase(t, T.cae0, T.cae0 + 0.03));
    y += 2.5 * Math.sin((t - T.horiz) * 8) * fl; phi += 0.025 * Math.sin((t - T.horiz) * 6.5) * fl;
    // y cae de golpe, de espaldas
    const c = entrada(fase(t, T.cae0, T.pum));
    x = lerp(x, LX, c); y = lerp(y, LY, c); phi = lerp(phi, -Math.PI / 2, c);
    if (t > T.pum) { const r = Math.exp(-(t - T.pum) * 10) * Math.sin((t - T.pum) * 24); y -= 6 * Math.max(0, r); }
    y += 3 * aplasta(t);
    // levanta la cabeza para mirar (encoge un poco el cuerpo)
    // se incorpora y se queda sentado
    const si = suave(fase(t, T.sienta0, T.sienta1));
    phi = lerp(phi, 0, si); y = lerp(y, SENTADO_Y, si);
    // Deivi tira de él
    const ti = tramo(t, T.tira0, T.tira1); phi += 0.1 * ti; x += 6 * ti; y -= 8 * ti;
    return { k: Math.max(k, 1e-4), phi, dx: x - o.x, dy: y - o.y };
  }
  const enCaida = (pg, q) => {
    const cd = pg.caida, o = pg.o; if (!cd.k) return q;
    const c = Math.cos(cd.phi), s = Math.sin(cd.phi), dx = q.x - o.x, dy = q.y - o.y;
    return { x: o.x + cd.dx + dx * c - dy * s, y: o.y + cd.dy + dx * s + dy * c };
  };
  const deCaida = (pg, q) => {
    const cd = pg.caida, o = pg.o; if (!cd.k) return q;
    const c = Math.cos(-cd.phi), s = Math.sin(-cd.phi), dx = q.x - o.x - cd.dx, dy = q.y - o.y - cd.dy;
    return { x: o.x + dx * c - dy * s, y: o.y + dx * s + dy * c };
  };

  function poseG(t, pd) {
    const b = guion(GUION_CUERPO_G, CUERPOS_G, "bolsillos", t);
    const x = recorrido(XG, t), respira = Math.sin(t * 2.3);
    const p = {
      x, suelo: SUELO, s: S, tirasLimpias: true,
      pelvis: { x: G.PELVIS.x, y: G.PELVIS.y + b.pel + respira * 1.2 },
      torso: b.torso, torsoEsc: { x: 1, y: 1 + respira * 0.004 }, piernas: {},
      cabeza: { ang: b.cab, dx: 0, dy: 0, esc: { x: 1, y: 1 } }
    };
    // sigue a Deivi con la cabeza mientras patina; se inclina un poco al aplaudir y al suplicar
    const tras = tramo(t, T.entra + 0.2, T.labio) * (1 - tramo(t, T.agarra, T.agarra + 0.3));
    p.cabeza.ang += -0.08 * tras * (1 - tramo(t, T.abajo - 0.2, T.abajo + 0.3)) + 0.04 * campana(t, T.kf, T.kf1 + 0.4);
    const aplauso = campana(t, T.aplaude0, T.aplaude1 + 0.1);
    p.pelvis.y -= 8 * Math.abs(Math.sin((t - T.aplaude0) * Math.PI * 4.5)) * aplauso;
    const ruego = tramo(t, T.reza0, T.reza0 + 0.2) * (1 - tramo(t, T.reza1, T.reza1 + 0.2));
    p.cabeza.ang += 0.05 * Math.sin((t - T.reza0) * 13) * ruego; p.pelvis.y += 5 * Math.abs(Math.sin((t - T.reza0) * 6.5)) * ruego;
    // equilibrio sobre la tabla: se tambalea
    const tambalea = tramo(t, T.sube1 - 0.1, T.sube1 + 0.05) * (1 - fase(t, T.dispara, T.dispara + 0.02));
    p.torso += 0.06 * Math.sin((t - T.sube1) * 14) * tambalea;
    // pies
    for (const lado of ["cerca", "lejos"]) {
      const f = pie(PASOS_G[lado], t);
      p.piernas[lado] = { tob: { x: G.PELVIS.x + (f.x - p.x) / S, y: TOB_G[lado] - f.alza / S }, ang: -0.2 * Math.sin(Math.PI * f.u) * (f.alza > 1 ? 1 : 0) };
    }
    // pone el pie cercano encima de la tabla
    const sube = fase(t, T.sube0, T.sube1);
    if (sube > 0 && t < T.dispara + 0.05) {
      const B = tabla(Math.min(t, T.dispara)), u = suave(sube);
      const encima = { x: B.x - 40, y: B.y - TH / 2 };
      const r = tobDesdeSuela(G, p, encima, 0, 47, G.TOBILLO_ALTO);
      const de = p.piernas.cerca.tob, arco = 40 * Math.sin(Math.PI * u) / S;
      p.piernas.cerca = { tob: { x: lerp(de.x, r.tob.x, u), y: lerp(de.y, r.tob.y, u) - arco }, ang: -0.3 * Math.sin(Math.PI * u) };
    }
    // cara
    const ex = guion(GUION_CARA_G, CARAS_G, "inicio", t);
    // mientras Deivi patina, Guillermo le sigue con la mirada
    if (pd && t < T.agarra + 0.3) {
      const dc = D.aPantalla(pd, D.cabeza(pd).a({ x: 840, y: 520 })), gc = G.aPantalla(p, G.cabeza(p).a({ x: 760, y: 470 }));
      const k = tramo(t, T.entra, T.entra + 0.3);
      ex.mx = lerp(ex.mx, clamp((dc.x - gc.x) / 160, -1, 1) * 0.95, k);
      ex.my = lerp(ex.my, clamp((dc.y - gc.y) / 260, -0.8, 0.8), k);
    }
    p.cara = cara(ex, parpadeo(t, [0.95, 3.3, 5.6, 6.9, 7.85, 11.9]));
    p.cara.rubor = 0.35 * campana(t, T.reza0, T.reza1 + 0.2) + 0.45 * tramo(t, T.coge, T.coge + 0.4);
    p.sudor = 0.9 * tramo(t, T.horiz + 0.15, T.horiz + 0.35) * (1 - tramo(t, T.pum, T.pum + 0.3)) + 0.8 * campana(t, T.ve, T.boing + 0.2);
    p.enfado = 0;
    // manos
    const Tr = G.tronco(p), hc = Tr(G.HOMBRO_C), hl = Tr(G.HOMBRO);
    let c = mezcla({ x: hc.x + b.cx, y: hc.y + b.cy }, BOLS_GC, 1 - clamp(b.cp * 1.4));
    let l = mezcla({ x: hl.x + b.lx, y: hl.y + b.ly }, BOLS_GL, 1 - clamp(b.lp * 1.4));
    let cmu = muHacia(c, hc, -0.1), lmu = muHacia(l, hl, 0.1), cd = dedosTodos(b.cd), ld = dedosTodos(b.ld);
    if (b.cp < 0.05) cmu = -1.75;
    if (b.lp < 0.05) lmu = -1.75;
    // aplausos: la mano lejana va y viene contra la cercana
    if (aplauso > 0) { const a = Math.abs(Math.sin((t - T.aplaude0) * Math.PI * 4.5)); l = { x: l.x + 70 * a * aplauso, y: l.y - 20 * a * aplauso }; cmu = lerp(cmu, 2.3, aplauso); lmu = lerp(lmu, 2.0, aplauso); }
    // súplica: palmas juntas, dedos arriba, temblando
    if (ruego > 0) { c = { x: c.x + 4 * Math.sin((t - T.reza0) * 26) * ruego, y: c.y }; cmu = lerp(cmu, 1.75, ruego); lmu = lerp(lmu, 1.75, ruego); }
    // se frota las manos
    const frota = campana(t, T.frota0, T.chulo + 0.1);
    if (frota > 0) { const a = Math.sin((t - T.frota0) * 22); c = { x: c.x + 16 * a * frota, y: c.y + 6 * a * frota }; l = { x: l.x - 16 * a * frota, y: l.y }; cmu = lerp(cmu, 2.6, frota); lmu = lerp(lmu, 2.6, frota); }
    // en el aire: los brazos se agitan
    const agita = tramo(t, T.dispara, T.horiz) * (1 - tramo(t, T.cae0, T.pum));
    c = { x: c.x + 30 * Math.sin(t * 19) * agita, y: c.y + 20 * Math.cos(t * 17) * agita };
    l = { x: l.x + 26 * Math.sin(t * 21 + 1) * agita, y: l.y + 20 * Math.cos(t * 15 + 2) * agita };
    // ¡boing!: brazos arriba de golpe (en el marco girado: hacia delante)
    const golpe = t >= T.boing ? Math.exp(-(t - T.boing) * 4) * clamp((t - T.boing) / 0.06) : 0;
    c = mezcla(c, { x: hc.x + 280, y: hc.y - 30 }, golpe); l = mezcla(l, { x: hl.x + 230, y: hl.y - 20 }, golpe);
    p.manoCerca = { x: c.x, y: c.y, ang: 0, mu: cmu, dobla: -1, puno: b.cp, dedos: cd };
    p.manoLejos = { x: l.x, y: l.y, ang: 0, mu: lmu, dobla: -1, puno: b.lp, dedos: ld };
    p.ikContinuo = false;
    // caída: piernas rectas desde las caderas (en pantalla: horizontales); con los golpes, suben
    const o = G.aPantalla(p, p.pelvis);
    p.caida = caida(t, o); p.o = o;
    const cae = salida(fase(t, T.dispara, T.horiz));
    if (cae > 0) {
      const phi = p.caida.phi;
      const beta = 0.75 * golpe + 0.25 * campana(t, T.choca - 0.02, T.choca + 0.25) + 0.08 * campana(t, T.pum - 0.02, T.pum + 0.2)
        + 0.06 * Math.sin((t - T.horiz) * 9) * tramo(t, T.horiz, T.horiz + 0.1) * (1 - fase(t, T.cae0, T.cae0 + 0.05));
      for (const lado of ["cerca", "lejos"]) {
        const cad = G.CADERA[lado], q = p.piernas[lado], bl = beta * (lado === "cerca" ? 1 : 0.85);
        const dir = rot({ x: Math.cos(bl), y: -Math.sin(bl) }, -phi);
        const recto = { x: cad.x + LARGO_PIERNA_G * dir.x + (lado === "cerca" ? -6 : 10), y: cad.y + LARGO_PIERNA_G * dir.y + (lado === "cerca" ? 0 : -12) };
        q.tob = mezcla(q.tob, recto, cae); q.ang = lerp(q.ang, -Math.PI / 2 - phi - 0.2 * bl, cae);
      }
    }
    // levanta la cabeza para ver venir la tabla
    const mira = tramo(t, T.oye, T.ve) * (1 - tramo(t, T.choca + 0.15, T.boing));
    p.cabeza.ang += 0.12 * mira;
    p.capaTronco = null;
    return p;
  }

  /* ---------- postura conjunta ---------- */
  function pose(t) {
    const pd = poseD(t), pg = poseG(t, pd);
    let B = t >= T.agarra && t < T.suelta ? pd.tablaMano : tabla(t);
    if (B.modo === "barriga") {
      // en la barriga (rebota y se hunde con ella); al incorporarse resbala hasta el regazo
      const tb = t - T.boing;
      const bote = 24 * Math.exp(-tb * 5.5) * Math.abs(Math.sin(tb * 11));
      const enBarriga = { x: XB, y: YB - bote + 3 * aplasta(t), a: AB + 0.06 * Math.exp(-tb * 3) * Math.sin(tb * 13) };
      const si = suave(fase(t, T.sienta0 + 0.05, T.sienta1 - 0.05));
      const pel = enCaida(pg, pg.o);
      const regazo = { x: pel.x + 92, y: pel.y - 26 - HO, a: -0.04 };
      B = { modo: "barriga", x: lerp(enBarriga.x, regazo.x, si), y: lerp(enBarriga.y, regazo.y, si) - 18 * Math.sin(Math.PI * si), a: lerp(enBarriga.a, regazo.a, si), f: 0, giro: 0 };
    }
    // apretón de manos: Deivi busca la mano de Guillermo, que sube a por la suya
    const ofrece = tramo(t, T.ofrece0, T.ofrece1), coge = tramo(t, T.ofrece1 - 0.1, T.coge);
    if (ofrece > 0) {
      const ti = tramo(t, T.tira0, T.tira1), encuentro = { x: 436 + 10 * ti, y: 368 - 10 * ti };
      // Guillermo: la mano lejana (la de delante) sube a por la de Deivi
      const qi = deCaida(pg, encuentro), qg = G.aHoja(pg, qi);
      const hlG = G.tronco(pg)(G.HOMBRO);
      pg.manoLejos = Object.assign(pg.manoLejos, mezcla(pg.manoLejos, { x: qg.x - 14, y: qg.y + 6 }, coge), { mu: lerp(pg.manoLejos.mu, muHacia(qg, hlG, 0.15), coge), puno: 1, dedos: dedosTodos(lerp(0.9, 0.32, tramo(t, T.coge - 0.05, T.coge + 0.1))) });
      // Deivi: le tiende la suya, abierta, y al agarrarse la cierra
      const qd = D.aHoja(pd, { x: encuentro.x + 8, y: encuentro.y - 4 }), hlD = D.tronco(pd)(D.HOMBRO);
      pd.manoLejos = Object.assign(pd.manoLejos, mezcla(pd.manoLejos, qd, ofrece), { mu: lerp(pd.manoLejos.mu, muHacia(qd, hlD, 0), ofrece), puno: 1, dedos: dedosTodos(lerp(1, 0.32, tramo(t, T.coge - 0.05, T.coge + 0.1))) });
    }
    return { g: pg, d: pd, b: B };
  }

  /* ---------- decorado ---------- */
  let fondo = null, CAM = null;
  const yCurva = x => x <= RX0 ? SUELO : x >= RLX ? SUELO - RALTO : SUELO - (RR - Math.sqrt(RR * RR - (x - RX0) * (x - RX0)));
  function cono(g, x, y, e) {
    g.save(); g.translate(x, y); g.scale(e, e); g.lineJoin = "round";
    g.fillStyle = "#3a3436"; g.strokeStyle = "#0b0a0e"; g.lineWidth = 2.2;
    g.beginPath(); g.moveTo(-24, 0); g.lineTo(24, 0); g.lineTo(20, -7); g.lineTo(-20, -7); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#ff7a2a"; g.beginPath(); g.moveTo(-15, -7); g.lineTo(15, -7); g.lineTo(4, -50); g.quadraticCurveTo(0, -54, -4, -50); g.closePath(); g.fill(); g.stroke();
    g.save(); g.clip(); g.fillStyle = "#f4f1ea"; g.fillRect(-20, -34, 40, 9); g.fillStyle = "rgba(255,255,255,0.28)"; g.fillRect(-6, -50, 4, 43); g.restore();
    g.restore();
  }
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W + 120; c.height = H + 140; const g = c.getContext("2d");
    g.translate(60, 70); g.lineJoin = "round"; g.lineCap = "round";
    // cielo de atardecer
    const cielo = g.createLinearGradient(0, -70, 0, 300);
    cielo.addColorStop(0, "#1d1a3e"); cielo.addColorStop(0.35, "#4c2f63"); cielo.addColorStop(0.68, "#b5566b"); cielo.addColorStop(0.88, "#ef8b5d"); cielo.addColorStop(1, "#f6b56b");
    g.fillStyle = cielo; g.fillRect(-60, -70, W + 120, 380);
    // sol que se esconde
    const sol = g.createRadialGradient(640, 250, 10, 640, 250, 170); sol.addColorStop(0, "rgba(255,226,150,0.85)"); sol.addColorStop(0.25, "rgba(255,190,120,0.35)"); sol.addColorStop(1, "rgba(255,160,110,0)");
    g.fillStyle = sol; g.fillRect(400, 60, 480, 260);
    g.fillStyle = "#ffe3a0"; g.beginPath(); g.arc(640, 252, 26, 0, TAU); g.fill();
    // nubes alargadas
    g.fillStyle = "rgba(255,190,170,0.35)";
    for (const [x, y, w] of [[480, 120, 150], [780, 80, 120], [600, 170, 200], [920, 150, 90]]) { g.beginPath(); g.ellipse(x, y, w, 7, 0, 0, TAU); g.fill(); g.beginPath(); g.ellipse(x + w * 0.3, y - 6, w * 0.45, 6, 0, 0, TAU); g.fill(); }
    // ciudad lejana
    g.fillStyle = "#3b2a4f";
    let xx = 300; for (let i = 0; xx < W + 60; i++) { const w = 40 + hash(i + 7) * 60, h = 50 + hash(i + 31) * 90; g.fillRect(xx, 262 - h, w, h + 20); xx += w + 2; }
    g.fillStyle = "rgba(255,214,140,0.7)";
    xx = 300; for (let i = 0; xx < W + 60; i++) { const w = 40 + hash(i + 7) * 60, h = 50 + hash(i + 31) * 90;
      for (let k = 0; k < 6; k++) if (hash(i * 13 + k) > 0.55) g.fillRect(xx + 6 + hash(i * 7 + k) * (w - 14), 262 - h + 10 + hash(i * 5 + k * 3) * (h - 20), 4, 5);
      xx += w + 2; }
    // muro del skate: hormigón liso por paneles (sin pintadas)
    const muro = g.createLinearGradient(0, 250, 0, PARED); muro.addColorStop(0, "#9b8f9e"); muro.addColorStop(1, "#6f6577");
    g.fillStyle = muro; g.fillRect(320, 250, W + 60 - 320, PARED - 250);
    g.fillStyle = "#b3a8b4"; g.fillRect(320, 242, W + 60 - 320, 10); g.fillStyle = "#0b0a0e"; g.fillRect(320, 252, W + 60 - 320, 2);
    for (let x = 320; x < W + 60; x += 150) {
      g.fillStyle = "rgba(0,0,0,0.22)"; g.fillRect(x, 254, 2, PARED - 254); g.fillStyle = "rgba(255,255,255,0.08)"; g.fillRect(x + 2, 254, 2, PARED - 254);
      g.fillStyle = "rgba(40,30,45,0.35)"; for (const [dx, dy] of [[35, 60], [115, 60], [35, 190], [115, 190]]) { g.beginPath(); g.arc(x + dx, 254 + dy, 3, 0, TAU); g.fill(); }
    }
    g.fillStyle = "rgba(0,0,0,0.12)"; for (let i = 0; i < 40; i++) g.fillRect(330 + hash(i + 90) * 700, 270 + hash(i + 91) * 230, 2 + hash(i + 92) * 3, 1.5);
    // fachada del bar (izquierda): ladrillo cálido
    g.fillStyle = "#7d4433"; g.fillRect(-60, -70, 390, PARED + 70);
    for (let y = -70, f = 0; y < PARED; y += 16, f++) {
      g.fillStyle = "rgba(0,0,0,0.2)"; g.fillRect(-60, y, 390, 2);
      for (let x = -60 + (f % 2) * 19; x < 330; x += 38) { g.fillRect(x, y, 2, 16); g.fillStyle = hash(f * 31 + x) > 0.7 ? "rgba(255,200,160,0.06)" : "rgba(0,0,0,0.05)"; g.fillRect(x + 2, y + 2, 36, 14); g.fillStyle = "rgba(0,0,0,0.2)"; }
    }
    g.fillStyle = "#5a2e22"; g.fillRect(326, -70, 8, PARED + 70); g.fillStyle = "#0b0a0e"; g.fillRect(332, -70, 2, PARED + 70);
    // zócalo de piedra
    g.fillStyle = "#4b3b3c"; g.fillRect(-60, PARED - 26, 394, 26); g.fillStyle = "rgba(255,255,255,0.08)"; g.fillRect(-60, PARED - 26, 394, 3);
    // toldo de rayas
    g.save(); g.translate(70, 278);
    for (let i = 0; i < 9; i++) { g.fillStyle = i % 2 ? "#f3e6cf" : "#c2372f"; g.beginPath(); g.moveTo(i * 30, 0); g.lineTo(i * 30 + 30, 0); g.lineTo(i * 30 + 34, 34); g.lineTo(i * 30 + 4, 34); g.closePath(); g.fill(); }
    g.strokeStyle = "#0b0a0e"; g.lineWidth = 2.5; g.beginPath(); g.moveTo(0, 0); g.lineTo(270, 0); g.lineTo(274, 34); g.lineTo(4, 34); g.closePath(); g.stroke();
    for (let i = 0; i < 9; i++) { g.fillStyle = i % 2 ? "#f3e6cf" : "#c2372f"; g.beginPath(); g.arc(i * 30 + 19, 34, 15, 0, Math.PI); g.fill(); g.stroke(); }
    g.restore();
    // puerta de madera con ojo de buey iluminado
    g.fillStyle = "#3a2216"; g.fillRect(88, 328, 104, PARED - 328); g.strokeStyle = "#0b0a0e"; g.lineWidth = 3; g.strokeRect(88, 328, 104, PARED - 328);
    g.fillStyle = "#6a3c22"; g.fillRect(96, 336, 88, PARED - 340);
    g.strokeStyle = "rgba(0,0,0,0.35)"; g.lineWidth = 2; g.strokeRect(104, 420, 72, 82);
    const ojo = g.createRadialGradient(140, 372, 2, 140, 372, 26); ojo.addColorStop(0, "#fff0b8"); ojo.addColorStop(1, "#f2a64a");
    g.fillStyle = "#c08a3a"; g.beginPath(); g.arc(140, 372, 25, 0, TAU); g.fill(); g.fillStyle = ojo; g.beginPath(); g.arc(140, 372, 19, 0, TAU); g.fill();
    g.strokeStyle = "#0b0a0e"; g.lineWidth = 2.5; g.beginPath(); g.arc(140, 372, 25, 0, TAU); g.stroke(); g.beginPath(); g.arc(140, 372, 19, 0, TAU); g.stroke();
    g.fillStyle = "#e3b04a"; g.beginPath(); g.arc(178, 440, 5, 0, TAU); g.fill(); g.stroke();
    // luz que se escapa por debajo de la puerta
    const bajo = g.createLinearGradient(0, PARED - 4, 0, PARED + 34); bajo.addColorStop(0, "rgba(255,200,110,0.55)"); bajo.addColorStop(1, "rgba(255,200,110,0)");
    g.fillStyle = bajo; g.beginPath(); g.moveTo(92, PARED); g.lineTo(188, PARED); g.lineTo(214, PARED + 34); g.lineTo(66, PARED + 34); g.closePath(); g.fill();
    // ventana con luz cálida y botellas a contraluz
    const vx = 214, vy = 352, vw = 100, vh = 104;
    g.fillStyle = "#2a1610"; g.fillRect(vx - 8, vy - 8, vw + 16, vh + 16);
    const luz = g.createLinearGradient(0, vy, 0, vy + vh); luz.addColorStop(0, "#ffd88a"); luz.addColorStop(1, "#f29a46");
    g.fillStyle = luz; g.fillRect(vx, vy, vw, vh);
    g.fillStyle = "rgba(90,40,20,0.75)";
    for (let i = 0; i < 6; i++) { const bx = vx + 10 + i * 15, bh = 26 + hash(i + 5) * 14; g.fillRect(bx, vy + 64 - bh, 9, bh); g.fillRect(bx + 3, vy + 64 - bh - 10, 3, 11); }
    g.fillRect(vx, vy + 64, vw, 4);
    g.strokeStyle = "#2a1610"; g.lineWidth = 5; g.beginPath(); g.moveTo(vx + vw / 2, vy); g.lineTo(vx + vw / 2, vy + vh); g.moveTo(vx, vy + vh / 2 - 10); g.lineTo(vx + vw, vy + vh / 2 - 10); g.stroke();
    g.strokeStyle = "#0b0a0e"; g.lineWidth = 2.5; g.strokeRect(vx - 8, vy - 8, vw + 16, vh + 16);
    // aplique de pared
    g.fillStyle = "#1d1714"; g.fillRect(52, 342, 10, 22); g.beginPath(); g.moveTo(44, 342); g.lineTo(70, 342); g.lineTo(64, 326); g.lineTo(50, 326); g.closePath(); g.fill();
    const ap = g.createRadialGradient(57, 352, 2, 57, 352, 70); ap.addColorStop(0, "rgba(255,210,130,0.55)"); ap.addColorStop(1, "rgba(255,210,130,0)"); g.fillStyle = ap; g.fillRect(-20, 280, 160, 150);
    // farola
    g.save(); g.translate(774, PARED);
    g.fillStyle = "#2b2730"; g.strokeStyle = "#0b0a0e"; g.lineWidth = 2;
    g.fillRect(-10, -14, 20, 14); g.fillRect(-4, -440, 8, 430);
    g.lineWidth = 7; g.strokeStyle = "#2b2730"; g.beginPath(); g.moveTo(0, -436); g.quadraticCurveTo(0, -470, -42, -468); g.stroke();
    g.fillStyle = "#2b2730"; g.beginPath(); g.moveTo(-60, -472); g.lineTo(-26, -472); g.lineTo(-32, -458); g.lineTo(-54, -458); g.closePath(); g.fill();
    g.fillStyle = "#fff1c0"; g.beginPath(); g.ellipse(-43, -456, 10, 4, 0, 0, TAU); g.fill();
    g.restore();
    const halo = g.createRadialGradient(731, 60, 4, 731, 60, 120); halo.addColorStop(0, "rgba(255,236,170,0.55)"); halo.addColorStop(1, "rgba(255,236,170,0)");
    g.fillStyle = halo; g.fillRect(600, -70, 260, 260);
    // suelo: losas de hormigón en perspectiva
    const su = g.createLinearGradient(0, PARED, 0, H + 70); su.addColorStop(0, "#7a6c78"); su.addColorStop(1, "#3a3140");
    g.fillStyle = su; g.fillRect(-60, PARED, W + 120, H + 70 - PARED);
    g.strokeStyle = "rgba(0,0,0,0.28)"; g.lineWidth = 2;
    for (const y of [PARED + 18, PARED + 44, PARED + 78, PARED + 124]) { g.beginPath(); g.moveTo(-60, y); g.lineTo(W + 60, y); g.stroke(); }
    for (let i = -6; i < 14; i++) { const x0 = i * 110; g.beginPath(); g.moveTo(x0, PARED); g.lineTo(x0 + (x0 - 512) * 0.9, H + 70); g.stroke(); }
    g.fillStyle = "rgba(255,255,255,0.05)"; for (let i = 0; i < 70; i++) g.fillRect(-60 + hash(i + 200) * (W + 120), PARED + 6 + hash(i + 201) * 140, 2, 1.5);
    // charcos de luz: farola y bar
    const pool = (x, y, rx, ry, col) => { g.save(); g.translate(x, y); g.scale(1, ry / rx); const r = g.createRadialGradient(0, 0, 4, 0, 0, rx); r.addColorStop(0, col); r.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = r; g.beginPath(); g.arc(0, 0, rx, 0, TAU); g.fill(); g.restore(); };
    pool(700, SUELO + 6, 260, 40, "rgba(255,226,160,0.22)"); pool(200, SUELO, 220, 36, "rgba(255,190,110,0.18)");
    // conos: uno junto a la puerta y dos apilados en la esquina de la rampa
    cono(g, 30, PARED + 6, 0.9); cono(g, 838, PARED + 4, 0.86); cono(g, 838, PARED - 8, 0.8);
    // rampa (por delante del muro): superficie de rodadura, lateral de madera, plataforma y albardilla
    const FR = 24, AT = -36;                    // desplazamiento del borde delantero y trasero respecto a la línea de rodadura
    const xs = []; for (let i = 0; i <= 30; i++) xs.push(RX0 + (RLX - RX0) * i / 30);
    // plataforma: cara de arriba
    g.fillStyle = "#c5bcc4"; g.fillRect(RLX, SUELO - RALTO + AT, W + 60 - RLX, FR - AT);
    // superficie curva
    const sr = g.createLinearGradient(RX0, 0, RLX, 0); sr.addColorStop(0, "#b9b0b9"); sr.addColorStop(1, "#d8d0d6");
    g.fillStyle = sr; g.beginPath();
    xs.forEach((x, i) => i ? g.lineTo(x, yCurva(x) + AT) : g.moveTo(x - 30, SUELO + AT));
    for (let i = xs.length - 1; i >= 0; i--) g.lineTo(xs[i], yCurva(xs[i]) + FR);
    g.lineTo(RX0 - 30, SUELO + FR); g.closePath(); g.fill();
    g.strokeStyle = "rgba(0,0,0,0.12)"; g.lineWidth = 1.5;
    for (const k of [0.25, 0.5, 0.75]) { g.beginPath(); xs.forEach((x, i) => { const y = yCurva(x) + lerp(AT, FR, k); i ? g.lineTo(x, y) : g.moveTo(x - 20, y); }); g.stroke(); }
    // lateral de madera (por delante de la superficie)
    g.fillStyle = "#8d5f35"; g.beginPath(); g.moveTo(RX0 - 30, SUELO + FR);
    xs.forEach(x => g.lineTo(x, yCurva(x) + FR)); g.lineTo(W + 60, SUELO - RALTO + FR); g.lineTo(W + 60, SUELO + FR + 2); g.closePath(); g.fill();
    g.strokeStyle = "rgba(0,0,0,0.25)"; g.lineWidth = 3;
    for (let x = RX0 + 30; x < W + 60; x += 34) { const y0 = yCurva(Math.min(x, RLX)) + FR + 4; if (y0 < SUELO + FR - 6) { g.beginPath(); g.moveTo(x, y0); g.lineTo(x, SUELO + FR); g.stroke(); } }
    g.beginPath(); g.moveTo(RX0 + 40, SUELO + FR - 6); g.lineTo(W + 60, SUELO + FR - 6); g.stroke();
    g.fillStyle = "rgba(255,220,170,0.12)"; g.beginPath(); xs.forEach((x, i) => i ? g.lineTo(x, yCurva(x) + FR) : g.moveTo(x, yCurva(x) + FR)); g.lineTo(W + 60, SUELO - RALTO + FR); g.lineTo(W + 60, SUELO - RALTO + FR + 7); for (let i = xs.length - 1; i >= 0; i--) g.lineTo(xs[i], yCurva(xs[i]) + FR + 7); g.closePath(); g.fill();
    // contornos
    g.strokeStyle = "#0b0a0e"; g.lineWidth = 2.6;
    g.beginPath(); xs.forEach((x, i) => i ? g.lineTo(x, yCurva(x) + FR) : g.moveTo(x - 30, SUELO + FR)); g.lineTo(W + 60, SUELO - RALTO + FR); g.stroke();
    g.beginPath(); xs.forEach((x, i) => i ? g.lineTo(x, yCurva(x) + AT) : g.moveTo(x - 30, SUELO + AT)); g.lineTo(W + 60, SUELO - RALTO + AT); g.stroke();
    g.beginPath(); g.moveTo(RX0 - 30, SUELO + FR); g.lineTo(RX0 - 30, SUELO + AT); g.stroke();
    // albardilla (tubo metálico en el borde)
    g.lineWidth = 8; g.strokeStyle = "#0b0a0e"; g.beginPath(); g.moveTo(RLX, SUELO - RALTO + FR); g.lineTo(RLX, SUELO - RALTO + AT); g.stroke();
    g.lineWidth = 5; g.strokeStyle = "#c9d1d8"; g.beginPath(); g.moveTo(RLX, SUELO - RALTO + FR); g.lineTo(RLX, SUELO - RALTO + AT); g.stroke();
    g.lineWidth = 1.5; g.strokeStyle = "#ffffff"; g.beginPath(); g.moveTo(RLX - 1, SUELO - RALTO + FR - 2); g.lineTo(RLX - 1, SUELO - RALTO + AT + 2); g.stroke();
    // barandilla de la plataforma
    g.strokeStyle = "#2b2730"; g.lineWidth = 4;
    for (const x of [RLX + 30, RLX + 80]) { g.beginPath(); g.moveTo(x, SUELO - RALTO + AT + 2); g.lineTo(x, SUELO - RALTO + AT - 70); g.stroke(); }
    g.beginPath(); g.moveTo(RLX + 30, SUELO - RALTO + AT - 66); g.lineTo(W + 60, SUELO - RALTO + AT - 66); g.stroke();
    // viñeta
    const v = g.createRadialGradient(512, 320, 300, 512, 320, 760); v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(10,0,20,0.5)");
    g.fillStyle = v; g.fillRect(-60, -70, W + 120, H + 140);
    return c;
  }
  // neón con forma de jarra encima del toldo (parpadea un poco)
  function neon(g, t) {
    const fl = 0.85 + 0.15 * Math.sin(t * 23) * (ruido(t * 3) > 0.6 ? 1 : 0.2);
    g.save(); g.translate(118, 150); g.lineJoin = "round"; g.lineCap = "round";
    const halo = g.createRadialGradient(0, 0, 6, 0, 0, 90); halo.addColorStop(0, `rgba(255,190,70,${0.35 * fl})`); halo.addColorStop(1, "rgba(255,190,70,0)");
    g.fillStyle = halo; g.fillRect(-90, -90, 180, 180);
    const trazo = (w, col) => { g.strokeStyle = col; g.lineWidth = w;
      g.beginPath(); g.moveTo(-26, -30); g.lineTo(-22, 36); g.lineTo(18, 36); g.lineTo(22, -30); g.stroke();
      g.beginPath(); g.moveTo(22, -16); g.quadraticCurveTo(48, -14, 46, 6); g.quadraticCurveTo(44, 24, 20, 22); g.stroke();
      g.beginPath(); g.moveTo(-30, -30); g.quadraticCurveTo(-28, -48, -12, -44); g.quadraticCurveTo(-2, -56, 10, -44); g.quadraticCurveTo(26, -48, 26, -30); g.stroke();
      g.beginPath(); g.moveTo(-10, -18); g.lineTo(-9, 24); g.moveTo(6, -18); g.lineTo(6, 24); g.stroke(); };
    trazo(9, `rgba(255,170,40,${0.35 * fl})`); trazo(4, `rgba(255,214,120,${fl})`); trazo(1.6, `rgba(255,250,225,${fl})`);
    g.restore();
  }

  /* ---------- efectos ---------- */
  function estrellaPuntas(g, x, y, r, puntas, rot0, rel = 0.45) {
    g.beginPath(); for (let i = 0; i < puntas * 2; i++) { const a = rot0 + i * Math.PI / puntas, rr = i % 2 ? r * rel : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath();
  }
  function impacto(g, t, t0, x, y, tam) {
    const k = fase(t, t0, t0 + 0.3); if (k <= 0 || k >= 1) return;
    g.save(); g.globalAlpha = 1 - k;
    estrellaPuntas(g, x, y, tam * (0.6 + 0.8 * salida(k)), 12, 0.3, 0.42); g.fillStyle = "#ffe14d"; g.fill(); g.lineWidth = 3; g.strokeStyle = "#0b0a0e"; g.stroke();
    estrellaPuntas(g, x, y, tam * (0.35 + 0.5 * salida(k)), 12, 0.55, 0.5); g.fillStyle = "#ffffff"; g.fill();
    g.restore();
  }
  function polvo(g, t, x0, t0, ancho = 1) {
    const k = fase(t, t0 - 0.02, t0 + 0.9); if (k <= 0 || k >= 1) return;
    g.save();
    for (let i = 0; i < 10; i++) { const lado = i % 2 ? 1 : -1, d = (30 + 140 * ancho * salida(k)) * (0.5 + hash(i + 70) * 0.7);
      g.globalAlpha = 0.4 * (1 - k); g.fillStyle = "#b9a9b3";
      g.beginPath(); g.ellipse(x0 + lado * d, SUELO - 6 - 22 * k * hash(i + 71), 14 + 22 * k, 7 + 10 * k, 0, 0, TAU); g.fill(); }
    g.restore();
  }
  function estrellitas(g, t, cab) {
    const k = tramo(t, T.boing + 0.25, T.boing + 0.55) * (1 - tramo(t, T.sienta0 + 0.2, T.sienta1)); if (k <= 0.01) return;
    const pts = [];
    for (let i = 0; i < 5; i++) { const a = t * 4 + i * TAU / 5; pts.push({ a, x: cab.x + Math.cos(a) * 44, y: cab.y + Math.sin(a) * 12, z: Math.sin(a) }); }
    pts.sort((u, v) => u.z - v.z);
    g.save();
    for (const q of pts) { const r = (7.5 + 2.5 * q.z) * k; estrellaPuntas(g, q.x, q.y, r, 5, t * 3 + q.a, 0.45); g.fillStyle = "#ffe14d"; g.fill(); g.lineWidth = 2; g.strokeStyle = "#0b0a0e"; g.stroke(); }
    g.restore();
  }
  // líneas de velocidad detrás de algo que va rápido
  function velocidad(g, x, y, dir, k, largo = 70) {
    if (k <= 0.02) return;
    g.save(); g.strokeStyle = `rgba(255,255,255,${0.75 * k})`; g.lineWidth = 2.4; g.lineCap = "round";
    for (let i = 0; i < 3; i++) { const yy = y - 12 + i * 12, x0 = x - dir * (18 + i * 9); g.beginPath(); g.moveTo(x0, yy); g.lineTo(x0 - dir * largo * k * (1 - i * 0.2), yy); g.stroke(); }
    g.restore();
  }
  // arcos de giro alrededor de la tabla en el kickflip
  function giroLineas(g, B, k) {
    if (k <= 0.02) return;
    g.save(); g.translate(B.x, B.y); g.rotate(B.a); g.strokeStyle = `rgba(255,255,255,${0.8 * k})`; g.lineWidth = 2.2; g.lineCap = "round";
    for (const s of [-1, 1]) { g.beginPath(); g.ellipse(s * 60, 0, 8, 28, 0, s > 0 ? -1.2 : Math.PI - 1.2, s > 0 ? 1.2 : Math.PI + 1.2); g.stroke(); }
    g.restore();
  }
  // tambaleo en el borde de la rampa
  function tambaleo(g, t, B) {
    const k = campana(t, T.borde, T.vuelve); if (k <= 0.02) return;
    g.save(); g.strokeStyle = `rgba(255,255,255,${0.75 * k})`; g.lineWidth = 2.2; g.lineCap = "round";
    for (const s of [-1, 1]) for (let i = 0; i < 2; i++) { const x = B.x + s * (TL / 2 + 8 + i * 8), y = B.y - 20; g.beginPath(); g.moveTo(x, y - 8 + i * 3); g.quadraticCurveTo(x + s * 5, y, x, y + 8 - i * 3); g.stroke(); }
    g.restore();
  }
  function boingLineas(g, t, B) {
    const k = fase(t, T.boing, T.boing + 0.45); if (k <= 0 || k >= 1) return;
    g.save(); g.strokeStyle = `rgba(255,255,255,${0.9 * (1 - k)})`; g.lineWidth = 2.4; g.lineCap = "round";
    for (const s of [-1, 1]) for (let i = 0; i < 3; i++) { const x = B.x + s * (TL / 2 + 10 + 7 * i), y = B.y; g.beginPath(); g.moveTo(x, y - 13 + i * 2); g.quadraticCurveTo(x + s * 6, y, x, y + 13 - i * 2); g.stroke(); }
    g.restore();
  }
  // gotitas de "¿y ahora qué?" bajo Guillermo suspendido
  function suspendido(g, t, pg) {
    const k = tramo(t, T.horiz + 0.1, T.horiz + 0.25) * (1 - fase(t, T.cae0, T.cae0 + 0.05)); if (k <= 0.01) return;
    const o = enCaida(pg, pg.o);
    g.save(); g.strokeStyle = `rgba(255,255,255,${0.7 * k})`; g.lineWidth = 2.2; g.lineCap = "round";
    for (let i = 0; i < 4; i++) { const x = o.x - 120 + i * 80, y = o.y + 62 + 4 * Math.sin(t * 10 + i); g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 14); g.stroke(); }
    g.restore();
  }

  /* ---------- cámara ---------- */
  function camara(t) {
    const z = tramo(t, T.horiz - 0.05, T.horiz + 0.3) * (1 - tramo(t, T.cae0, T.pum + 0.5));
    return { k: 1 + 0.0 * z, x: 512, y: 300 };
  }

  function sombra(g, x, ancho, alfa) { g.save(); g.fillStyle = `rgba(10,0,20,${alfa})`; g.beginPath(); g.ellipse(x, SUELO + 2, ancho, 7, 0, 0, TAU); g.fill(); g.restore(); }

  function dibujaDeivi(g, pd, t) {
    const gr = pd.grupo;
    g.save();
    if (gr && (Math.abs(gr.a) > 1e-4 || Math.abs(gr.y - gr.y0) > 0.01)) { g.translate(gr.x, gr.y); g.rotate(gr.a); g.translate(-gr.x0, -gr.y0); }
    D.dibujar(g, pd, t);
    g.restore();
  }
  function dibujaGuillermo(g, pg, t) {
    const cd = pg.caida, o = pg.o;
    g.save();
    if (cd.k > 0) { g.translate(o.x + cd.dx, o.y + cd.dy); g.rotate(cd.phi); g.translate(-o.x, -o.y); }
    G.dibujar(g, pg, t);
    g.restore();
  }

  class Monopatin extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !D.listo()) return;
      if (!fondo) fondo = creaFondo();
      const P = pose(t), pg = P.g, pd = P.d, B = P.b;
      const luz = tramo(t, NEGRO_INICIO, 0.8, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t);
      const tb = (t >= T.pum ? 7 * Math.exp(-(t - T.pum) * 7) * suave(fase(t, T.pum, T.pum + 0.04)) : 0)
        + (t >= T.boing ? 5 * Math.exp(-(t - T.boing) * 8) * suave(fase(t, T.boing, T.boing + 0.04)) : 0);
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      if (tb > 0.05) g.translate(ruido(t * 45) * tb, ruido(t * 45 + 13) * tb * 0.7);
      CAM = g.getTransform();
      g.drawImage(fondo, -60, -70);
      neon(g, t);
      // sombras
      const od = D.aPantalla(pd, pd.pelvis);
      const kr = pd.grupo ? clamp(1 - Math.abs(pd.grupo.a) * 10) * clamp(1 - Math.abs(pd.grupo.y - pd.grupo.y0) / 15) : 1;
      if (kr > 0.01) {
        const alto = SUELO - (od.y + ALTO_PEL_D);
        sombra(g, od.x - 10, 62 - clamp(alto / 4, 0, 20), kr * (0.32 - clamp(alto / 400, 0, 0.15)));
      }
      const cd = pg.caida, og = enCaida(pg, pg.o);
      sombra(g, lerp(pg.o.x, og.x - 25, cd.k), lerp(66, 150 - 40 * (1 - fase(t, T.cae0, T.pum)) * (t < T.pum ? 1 : 0), cd.k), 0.32);
      if (B && B.modo !== "mano" && B.modo !== "barriga" && B.y > SUELO - 200) {
        const alto = SUELO - HO - B.y;
        const ks = B.s !== undefined ? clamp(1 - B.s / 30) : 1;
        if (ks > 0.01) sombra(g, B.x, 70 - clamp(alto / 3, 0, 40), ks * (0.3 - clamp(alto / 500, 0, 0.2)));
      }
      // tabla bajo los pies de Deivi
      const bajoDeivi = B.modo === "deivi" || (B.modo === "pisa" && t < T.pisa + 0.035);
      if (bajoDeivi) {
        dibTabla(g, B);
        if (B.modo === "deivi") giroLineas(g, B, campana(t, T.kf + 0.04, T.kf1 - 0.04));
      }
      if (B.modo === "deivi") velocidad(g, B.x + 100, B.y - 120, -1, 0.9 * campana(t, T.labio, T.abajo + 0.35), 60);
      dibujaDeivi(g, pd, t);
      // tabla suelta (por delante de Deivi)
      const libre = B.modo === "vuela" || B.modo === "suelo" || B.modo === "rueda" || (B.modo === "pisa" && !bajoDeivi);
      if (libre) {
        dibTabla(g, B);
        if (B.modo === "rueda") {
          const rap = t < T.borde ? campana(t, T.dispara, T.rampa + 0.1) : campana(t, T.abajo2 - 0.2, T.choca + 0.05);
          velocidad(g, B.x, B.y, t < T.borde ? 1 : -1, rap, 80);
          tambaleo(g, t, B);
        }
      }
      dibujaGuillermo(g, pg, t);
      if (B.modo === "salta" || B.modo === "barriga") { dibTabla(g, B); boingLineas(g, t, B); }
      // efectos
      suspendido(g, t, pg);
      polvo(g, t, og.x, T.pum, 1.1);
      impacto(g, t, T.pum, og.x - 60, SUELO - 4, 22);
      impacto(g, t, T.pisa, X_PISA + EJE + 30, SUELO - 6, 12);
      impacto(g, t, T.toca, XL, SUELO - 4, 12);
      impacto(g, t, T.choca, SUELA_X, SUELO - 22, 16);
      if (B.modo === "barriga") impacto(g, t, T.boing, B.x, B.y + 8, 30);
      polvo(g, t, RX0 - 170, T.abajo, 0.35);
      const cab = enCaida(pg, G.aPantalla(pg, G.cabeza(pg).a({ x: 760, y: 470 })));
      estrellitas(g, t, cab);
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00061", nombre: "Guillermo y Deivi · El monopatín", crear: () => new Monopatin() });
  window.__A2D_00061 = { pose, T, DUR, tabla };
})();
