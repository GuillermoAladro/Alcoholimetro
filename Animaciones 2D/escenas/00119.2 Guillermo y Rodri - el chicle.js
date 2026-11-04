"use strict";
/* 00119.2 · Guillermo y Rodri · El chicle
 *
 * Negro → la puerta de una tienda de chucherías por la tarde: fachada verde menta con molduras crema,
 * toldo de rayas rosas y blancas con el borde festoneado, un escaparate lleno de tarros de caramelos,
 * piruletas y bastones, la puerta rosa con su ojo de buey, una máquina de chicles de bola en la acera,
 * un banco y una piruleta gigante de cartel (sin letras). Guillermo y Rodri, con las manos en los bolsillos.
 *
 * Rodri saca un paquete de chicles y lo sacude: salen dos chicles volando; uno se lo caza él con la boca
 * y el otro va derecho a la boca de Guillermo (¡ñam!) → mascan los dos → Rodri hace un globo grande y
 * perfecto, lo aguanta, lo sorbe de golpe (¡chas!) y guiña a cámara → Guillermo se pica, masca a lo
 * bruto, coge aire y sopla: el globo crece… y crece… más grande que su cabeza; le levanta de puntillas y
 * luego del suelo, con los pies colgando, mientras Rodri recula boquiabierto → ¡PAF!: el globo revienta y
 * le tapa la cara entera (y los pinchos) con una capa de chicle; cae al suelo y bracea a ciegas («mmf») →
 * Rodri se ríe, se acerca, le pellizca la punta que cuelga de la barbilla y se la arranca hacia arriba de un
 * tirón, como una careta, con hilos que se estiran → Guillermo se queda pasmado, con restos de chicle en
 * los pinchos y en las cejas; Rodri mira la careta (con la cara de Guillermo marcada) → Guillermo, muy
 * digno, hace un globito diminuto que le explota en la nariz y mira a cámara; Rodri guiña → negro.
 *
 * Sin textos. Los globos se anclan en la boca de cada uno en cada fotograma (cabeza → hoja → pantalla).
 * La careta es una capa del retrato de Guillermo (capaCabeza) recortada por la raya del despegue; el trozo
 * despegado se dibuja en pantalla como el objeto de la mano de Rodri (debajo de sus dedos). Todo depende de t.
 */
(() => {
  const { clamp, lerp, fase, suave, salida, entrada, tramo, hash, campana, curva } = M2;
  const G = Guillermo, R = Rodri;
  const DUR = 14.8;
  const TINTA = "#0b0a0e";

  /* ---------- guion (s) ---------- */
  const T = {
    // el paquete y los dos chicles
    sacaPaq: 0.72, paqArriba: 1.1, sacude: 1.42, vuelaR: 1.46, cazaR: 1.86, vuelaG: 1.5, cazaG: 2.12, guardaPaq: 2.2,
    masca0: 2.2,
    // el globo de Rodri
    rReta: 2.75, rAire: 3.05, rSopla0: 3.3, rSopla1: 4.55, rSorbe: 5.12, rSorbe1: 5.26, rCamara: 5.42, rGuino: 5.7,
    gOoh: 4.2,
    // el globo de Guillermo
    gPica: 5.85, gMasca0: 6.05, gMasca1: 6.65, gAire: 6.7, gSopla0: 7.0, gSopla1: 9.55,
    gPuntillas: 8.25, gDespega: 8.85, gArriba: 9.45,
    rBoquia: 8.1, rRecula0: 8.7, rRecula1: 9.35,
    pop: 10.35, cae0: 10.42, cae1: 10.66,
    gCiego0: 10.8, gCiego1: 11.75,
    rRie0: 10.62, rRie1: 11.28,
    rAnda0: 11.3, rAnda1: 11.98,
    gAgacha: 11.75, pellizca: 12.02, despega0: 12.12, despega1: 12.52,
    gPasmo: 12.5, rMiraCareta: 12.62, rCamara2: 13.18,
    gMasca2: 13.0, gGlobito0: 13.3, gGlobitoPop: 13.66, gCamara: 13.78, rGuino2: 13.9,
    fin: 14.15
  };

  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n], k); return o; };
  const guion = (lista, dic, base, t) => {
    let c = dic[base];
    for (const [t0, t1, nom, f] of lista) { if (t <= t0) break; c = mezclaE(c, dic[nom], (f || suave)(fase(t, t0, t1))); }
    return Object.assign({}, c);
  };
  const dentro = (t, a0, a1, b0, b1) => tramo(t, a0, a1) * (1 - tramo(t, b0, b1));
  const lerpAng = (a, b, k) => a + Math.atan2(Math.sin(b - a), Math.cos(b - a)) * k;
  const rot = (q, a) => { const c = Math.cos(a), s = Math.sin(a); return { x: q.x * c - q.y * s, y: q.x * s + q.y * c }; };
  const P = (x, y) => ({ x, y });
  const DED = ["pulgar", "indice", "medio", "anular", "menique"];
  const mezclaD = (a, b, k) => { const o = {}; for (const n of DED) o[n] = lerp(a[n] ?? 0, b[n] ?? 0, k); return o; };
  const D = (pu, i, m, a, me) => ({ pulgar: pu, indice: i, medio: m ?? i, anular: a ?? i, menique: me ?? i });
  const RELAJADA = D(0.55, 0.6, 0.55, 0.5, 0.45), ABRE = D(0.85, 0.9, 0.9, 0.85, 0.8), ABIERTA = D(1, 1),
    AGARRA = D(0.2, 0.25, 0.22, 0.22, 0.25), PUNO = D(0.1, 0.05, 0.05, 0.05, 0.05),
    PINZA = D(0.55, 0.5, 0.15, 0.1, 0.1), SENALA = D(0.15, 1, 0.05, 0.05, 0.05);
  const muelle = (t, t0, f, dec) => t < t0 ? 0 : Math.exp(-(t - t0) * dec) * Math.sin((t - t0) * f);

  /* ---------- caras (mismos campos para los dos) ---------- */
  const BASE = { mx: 0.85, my: 0, c: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, abre: 0, ancho: 1, sonr: 0.15,
    dientes: 1, lengua: 0, esp: 0, mof: 0, wd: 0, wi: 0 };
  const E = o => Object.assign({}, BASE, o);
  function cara(e, parp) {
    return { mirada: { x: e.mx, y: e.my }, iris: e.iris, espiral: e.esp,
      ojos: { d: clamp(Math.max(e.c, parp) + e.wd), i: clamp(Math.max(e.c, parp) + e.wi), feliz: e.h, apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: 0, abre: e.abre, ancho: e.ancho, sonrisa: e.sonr, dientes: e.dientes > 0.5, lengua: e.lengua },
      mofletes: e.mof, rubor: 0, bigote: 0 };
  }
  const parpadeo = (t, lista) => { let o = 0; for (const tb of lista) { const k = fase(t, tb, tb + 0.15); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); } return o; };
  // mascar: la boca se abre y cierra (a ~2,6 mordiscos por segundo)
  const mascar = (t, f = 2.6) => 0.5 - 0.5 * Math.cos(t * Math.PI * 2 * f);

  /* =====================================================================================
   * DISPOSICIÓN (px de pantalla)
   * ===================================================================================== */
  const S = 0.3, SUELO = 562;
  const XG = 372, XR = 690;
  const PY_PIE = rig => SUELO - (rig.SUELO - rig.PELVIS.y) * S * rig.K;
  // pies de Rodri (x de pantalla del tobillo): reculada y paseo hasta Guillermo
  const PIES_R0 = { cerca: XR + 22, lejos: XR - 25 };
  const PASOS_R = [
    // recula ante el globo gigante (pie de atrás primero)
    { t0: T.rRecula0, t1: T.rRecula0 + 0.3, lado: "cerca", x: XR + 70, alto: 12 },
    { t0: T.rRecula0 + 0.28, t1: T.rRecula0 + 0.6, lado: "lejos", x: XR + 26, alto: 12 },
    // va hacia Guillermo
    { t0: T.rAnda0, t1: T.rAnda0 + 0.24, lado: "lejos", x: 662, alto: 16 },
    { t0: T.rAnda0 + 0.18, t1: T.rAnda0 + 0.44, lado: "cerca", x: 632, alto: 16 },
    { t0: T.rAnda0 + 0.38, t1: T.rAnda0 + 0.62, lado: "lejos", x: 554, alto: 14 },
    { t0: T.rAnda0 + 0.52, t1: T.rAnda1, lado: "cerca", x: 600, alto: 10 }
  ];
  function pieR(t, lado) {
    let x = PIES_R0[lado], h = 0, a = 0;
    for (const e of PASOS_R) {
      if (e.lado !== lado) continue;
      if (t >= e.t1) { x = e.x; continue; }
      if (t > e.t0) { const u = (t - e.t0) / (e.t1 - e.t0); x = lerp(x, e.x, suave(u)); h = e.alto * Math.sin(Math.PI * u); a = 0.25 * Math.sin(Math.PI * u); }
      break;
    }
    return { x, h, a };
  }

  /* =====================================================================================
   * MANOS
   * ===================================================================================== */
  let BASE_M = null;
  function conCamara(g, f) { g.save(); g.setTransform(BASE_M); f(); g.restore(); }
  const evalua = (o, t) => (typeof o === "function" ? o(t) : o);
  // pista de objetivos de pantalla {x, y, ang, d, mo, bol, ma (mu absoluto de la hoja), ka (su peso)}
  function pista(lista, t) {
    let c = Object.assign({ mo: 0, bol: 0, ma: 0, ka: 0 }, evalua(lista[0][2], t));
    for (let i = 1; i < lista.length; i++) {
      const [t0, t1, obj, f] = lista[i]; if (t <= t0) break;
      const o = evalua(obj, t), k = (f || suave)(fase(t, t0, t1));
      c = { x: lerp(c.x, o.x, k), y: lerp(c.y, o.y, k), ang: lerpAng(c.ang || 0, o.ang ?? (c.ang || 0), k),
        d: mezclaD(c.d, o.d || c.d, k), mo: lerp(c.mo || 0, o.mo ?? (c.mo || 0), k), bol: lerp(c.bol || 0, o.bol ?? (c.bol || 0), k),
        ma: lerpAng(c.ma || 0, o.ma ?? (c.ma || 0), k), ka: lerp(c.ka || 0, o.ka ?? (c.ka || 0), k) };
    }
    return c;
  }
  const muHacia = (m, h, off) => Math.atan2(h.y - m.y, h.x - m.x) + off;
  const R_MG = G.MUNECA_R * G.JK;
  const manoDesde = (m, mu) => ({ x: m.x - Math.cos(mu) * R_MG, y: m.y - Math.sin(mu) * R_MG });
  const BOLS_GC = manoDesde({ x: 131, y: 652 }, -1.75), BOLS_GL = manoDesde({ x: 372, y: 648 }, -1.75);
  // m: objetivo de pantalla; bolsillo: punto de la hoja (sigue al torso)
  function manoRig(rig, p, m, lado, bolsillo, dobla, objeto) {
    const h = rig.aHoja(p, m), Tr = rig.tronco(p), hom = Tr(lado === "cerca" ? rig.HOMBRO_C : rig.HOMBRO);
    const b = Tr(bolsillo), k = clamp(m.bol || 0);
    let mu0 = muHacia(h, hom, (m.mo || 0));
    if ((m.ka || 0) > 0.001) mu0 = lerpAng(mu0, m.ma, m.ka);
    return { x: lerp(h.x, b.x, k), y: lerp(h.y, b.y, k), ang: 0, mu: lerpAng(mu0, -1.75 + p.torso, k), puno: 1 - k, dedos: m.d, dobla,
      objeto: k < 0.5 ? objeto : null };
  }
  // la mano en pantalla del objetivo de una pose (para los objetos que lleva)
  const enPantalla = (rig, p, m) => rig.aPantalla(p, m);

  /* =====================================================================================
   * GLOBOS DE CHICLE (pantalla)
   * ===================================================================================== */
  const ROSA = "#ff7fb4", ROSA_OSC = "#c2307a", ROSA_CLARO = "#ffc4dd", ROSA_TINTA = "#7c1546";
  // c: centro, r: radio, ancla: punto de los labios (la goma se pega ahí)
  function globo(g, c, r, ancla, o = {}) {
    if (r < 0.6) return;
    const a = o.alfa ?? 1, wob = o.wob || 0;
    g.save();
    g.globalAlpha *= a;
    // la goma pegada a los labios (el cuello del globo)
    if (ancla) {
      const d = Math.hypot(c.x - ancla.x, c.y - ancla.y) || 1, ux = (c.x - ancla.x) / d, uy = (c.y - ancla.y) / d;
      const w = Math.min(r * 0.42, 7 + r * 0.06);
      g.fillStyle = ROSA; g.strokeStyle = ROSA_TINTA; g.lineWidth = 1.4;
      g.beginPath(); g.moveTo(ancla.x - uy * w * 0.6, ancla.y + ux * w * 0.6);
      g.quadraticCurveTo(ancla.x + ux * r * 0.3 - uy * w, ancla.y + uy * r * 0.3 + ux * w, c.x - ux * r * 0.8 - uy * w * 1.3, c.y - uy * r * 0.8 + ux * w * 1.3);
      g.lineTo(c.x - ux * r * 0.8 + uy * w * 1.3, c.y - uy * r * 0.8 - ux * w * 1.3);
      g.quadraticCurveTo(ancla.x + ux * r * 0.3 + uy * w, ancla.y + uy * r * 0.3 - ux * w, ancla.x + uy * w * 0.6, ancla.y - ux * w * 0.6);
      g.closePath(); g.fill(); g.stroke();
    }
    g.translate(c.x, c.y); g.scale(1 + wob, 1 - wob);
    const gr = g.createRadialGradient(-r * 0.32, -r * 0.34, r * 0.05, 0, 0, r);
    gr.addColorStop(0, "rgba(255,226,238,0.55)"); gr.addColorStop(0.55, "rgba(255,150,196,0.6)"); gr.addColorStop(0.9, "rgba(246,96,160,0.78)"); gr.addColorStop(1, "rgba(214,60,130,0.9)");
    g.fillStyle = gr; g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.fill();
    // reflejo de abajo y brillo
    g.strokeStyle = "rgba(255,240,248,0.5)"; g.lineWidth = Math.max(1.2, r * 0.05); g.lineCap = "round";
    g.beginPath(); g.arc(0, 0, r * 0.8, Math.PI * 0.2, Math.PI * 0.75); g.stroke();
    g.fillStyle = "rgba(255,255,255,0.85)";
    g.save(); g.rotate(-0.65); g.beginPath(); g.ellipse(-r * 0.05, -r * 0.55, r * 0.26, r * 0.11, 0, 0, Math.PI * 2); g.fill(); g.restore();
    g.beginPath(); g.arc(-r * 0.62, -r * 0.08, Math.max(1, r * 0.06), 0, Math.PI * 2); g.fill();
    // contorno
    g.strokeStyle = ROSA_TINTA; g.globalAlpha *= 0.85; g.lineWidth = Math.max(1.5, Math.min(3.2, r * 0.025));
    g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.stroke();
    g.restore();
  }
  // el centro del globo: delante de la boca, hacia donde mira la cara
  function centroGlobo(rig, p, r, dir, sube) {
    const b = rig.aPantalla(p, rig.cabeza(p).a(rig === G ? BOCA_G : BOCA_R));
    const a = dir + (rig === G ? 1 : -1) * p.cabeza.ang * 0.8;
    return { ancla: b, c: { x: b.x + Math.cos(a) * r * 0.9, y: b.y + Math.sin(a) * r * 0.9 - r * (sube || 0) } };
  }
  const BOCA_G = P(808, 738), BOCA_R = P(826, 614);

  /* ---------- radios de los globos ---------- */
  function radioR(t) {
    const crece = tramo(t, T.rSopla0, T.rSopla1, s => 1 - Math.pow(1 - s, 2));
    let r = 42 * crece;
    // lo aguanta: respira un poco
    r *= 1 + 0.025 * Math.sin((t - T.rSopla1) * 9) * dentro(t, T.rSopla1, T.rSopla1 + 0.1, T.rSorbe - 0.1, T.rSorbe);
    // ¡lo sorbe!
    r *= 1 - tramo(t, T.rSorbe, T.rSorbe1, entrada);
    return r;
  }
  // el globo gigante: crece a empujones (tres soplidos), tiembla al final
  function radioG(t) {
    if (t < T.gSopla0) return 0;
    const u = fase(t, T.gSopla0, T.gSopla1);
    // tres empujones: cada uno sube y luego se queda un poco quieto
    const emp = (u2, a, b) => tramo(u2, a, b, s => 1 - Math.pow(1 - s, 2));
    const k = 0.22 * emp(u, 0, 0.22) + 0.3 * emp(u, 0.28, 0.55) + 0.48 * emp(u, 0.6, 1);
    let r = 128 * k;
    r *= 1 + 0.02 * Math.sin(t * 7.3) * tramo(t, T.gSopla1 - 0.3, T.gSopla1);
    // revienta: un último hinchazón y fuera
    r *= 1 + 0.05 * campana(t, T.pop - 0.08, T.pop + 0.03);
    return r;
  }
  let estallidoGrande;
  function globoAlEstallar() {
    if(estallidoGrande)return estallidoGrande;
    const p=poseG(T.pop),r=radioG(T.pop),v=centroGlobo(G,p,r,-.06,.06);
    estallidoGrande={...v,r,wob:.015*Math.sin(T.pop*5.3)};return estallidoGrande;
  }
  function globoGrande(t,p) {
    if(t<T.pop){const r=radioG(t);return {...centroGlobo(G,p,r,-.06,.06),r,wob:.015*Math.sin(t*5.3),alfa:1};}
    const b=globoAlEstallar(),u=fase(t,T.pop,T.pop+.16),k=suave(u),ancla=retratoAPant(p,BOCA_G);
    return {ancla,c:P(lerp(b.c.x,ancla.x,k),lerp(b.c.y,ancla.y,k)),r:b.r*(1-k),wob:lerp(b.wob,.08,k),alfa:1-u};
  }
  // cuánto le ha despegado del suelo (px) y su balanceo
  function despegue(t) {
    const sube = 26 * tramo(t, T.gDespega, T.gArriba + 0.2, suave) * (1 - tramo(t, T.cae0, T.cae1, entrada));
    const bob = 4 * Math.sin((t - T.gDespega) * 4.2) * dentro(t, T.gDespega + 0.2, T.gArriba, T.pop - 0.1, T.pop);
    const punt = tramo(t, T.gPuntillas, T.gDespega, suave) * (1 - tramo(t, T.cae0, T.cae1));
    return { sube: sube+bob*suave(clamp(sube/4)), punt };
  }

  /* =====================================================================================
   * LA CARETA DE CHICLE (retrato de Guillermo)
   * ===================================================================================== */
  // silueta de la cabeza (pelo incluido), un poco ensanchada; el pico de abajo cuelga de la barbilla
  const CARETA = [[706, 186], [790, 168], [880, 182], [968, 204], [1050, 226], [1118, 280], [1132, 340], [1120, 404], [1128, 448],
    [1104, 500], [1084, 556], [1040, 604], [962, 634], [940, 694], [920, 744], [894, 792], [862, 832], [850, 872], [858, 924],
    [836, 958], [808, 948], [796, 900], [770, 872], [724, 844], [690, 806], [648, 774], [612, 726], [592, 676], [562, 644],
    [536, 600], [516, 540], [494, 472], [494, 392], [510, 336], [538, 290], [582, 248], [640, 210]].map(([x, y]) => P(x, y));
  const CARETA_PUNTA = P(832, 954);
  // ancho de la careta a una altura (para el borde del despegue)
  const FILAS = [[176, 760, 860], [206, 700, 950], [238, 610, 1068], [270, 584, 1050], [302, 546, 1124], [334, 532, 1122], [366, 506, 1112],
    [398, 504, 1112], [430, 504, 1124], [462, 498, 1110], [494, 512, 1092], [526, 518, 1070], [558, 526, 1084], [590, 524, 1040],
    [622, 544, 990], [654, 568, 940], [686, 600, 930], [718, 610, 918], [750, 636, 900], [782, 676, 876], [814, 712, 860],
    [846, 760, 852], [878, 784, 856], [910, 798, 856], [950, 812, 846]];
  function anchoEn(y) {
    if (y <= FILAS[0][0]) return [FILAS[0][1], FILAS[0][2]];
    for (let i = 1; i < FILAS.length; i++) if (y <= FILAS[i][0]) {
      const [y0, a0, b0] = FILAS[i - 1], [y1, a1, b1] = FILAS[i], k = (y - y0) / (y1 - y0);
      return [lerp(a0, a1, k), lerp(b0, b1, k)];
    }
    const l = FILAS[FILAS.length - 1]; return [l[1], l[2]];
  }
  const Y_ABAJO = 960, Y_ARRIBA = 160;
  // raya del despegue (retrato): por debajo ya no hay careta
  const rayaDespegue = t => lerp(Y_ABAJO, Y_ARRIBA, tramo(t, T.despega0, T.despega1, s => s < 0.5 ? 2 * s * s : 1 - 2 * (1 - s) * (1 - s)));
  // la careta aparece como un plaf desde la boca
  const plaf = t => tramo(t, T.pop + 0.02, T.pop + 0.17, salida);
  const restos = [[612, 250, 26, 0.3], [760, 206, 22, -0.2], [918, 226, 24, 0.6], [1080, 300, 20, 1.1], [1050, 430, 18, -0.6],
    [752, 486, 14, 0.2], [902, 522, 12, -0.4]];

  function careta(g, t) {
    const k = plaf(t), yd = rayaDespegue(t);
    if (k <= 0.001 || yd <= Y_ARRIBA + 1) return;
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    // se extiende desde la boca y se corta por la raya del despegue
    g.beginPath(); g.arc(BOCA_G.x, BOCA_G.y, 40 + 760 * k, 0, Math.PI * 2); g.clip();
    g.beginPath(); g.rect(300, 0, 1000, yd); g.clip();
    const forma = () => { g.beginPath(); curva(g, CARETA, true, 0.5); };
    const gr = g.createLinearGradient(560, 200, 1060, 860);
    gr.addColorStop(0, "#ff9cc6"); gr.addColorStop(0.5, ROSA); gr.addColorStop(1, "#ef5d9e");
    forma(); g.fillStyle = gr; g.fill();
    g.save(); forma(); g.clip();
    // bultos de lo que hay debajo: los pinchos, los ojos, la nariz y la boca
    g.fillStyle = "rgba(255,214,232,0.55)";
    for (const [x, y, rx, ry, a] of [[640, 300, 70, 30, -0.6], [800, 250, 80, 28, -0.2], [960, 280, 70, 26, 0.3], [1060, 360, 40, 60, 0.4],
      [772, 560, 46, 26, 0.15], [896, 616, 36, 22, 0.25], [858, 676, 22, 34, 0.3]]) { g.beginPath(); g.ellipse(x, y, rx, ry, a, 0, Math.PI * 2); g.fill(); }
    g.strokeStyle = "rgba(160,30,90,0.45)"; g.lineWidth = 7;
    for (const [x0, y0, x1, y1, cx, cy] of [[560, 360, 720, 300, 640, 290], [700, 330, 880, 290, 790, 280], [880, 340, 1060, 380, 980, 320],
      [740, 600, 820, 590, 780, 612], [870, 650, 920, 640, 896, 660], [610, 520, 640, 690, 590, 600], [690, 820, 830, 860, 760, 870]]) {
      g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(cx, cy, x1, y1); g.stroke(); }
    // la boca: respira dentro del chicle (una pompita que entra y sale)
    const resp = dentro(t, T.pop + 0.3, T.pop + 0.4, T.pellizca - 0.1, T.pellizca);
    const rb = (16 + 16 * (0.5 + 0.5 * Math.sin((t - T.pop) * 7.5))) * resp;
    if (rb > 1) { g.fillStyle = "rgba(255,190,220,0.9)"; g.strokeStyle = "rgba(124,21,70,0.7)"; g.lineWidth = 4; g.beginPath(); g.arc(BOCA_G.x + 6, BOCA_G.y + 2, rb, 0, Math.PI * 2); g.fill(); g.stroke(); }
    // brillos
    g.fillStyle = "rgba(255,255,255,0.75)";
    for (const [x, y, rx, ry, a] of [[700, 270, 46, 13, -0.5], [940, 250, 30, 9, 0.25], [700, 640, 26, 9, 0.9], [830, 520, 18, 7, 0.1]]) { g.beginPath(); g.ellipse(x, y, rx, ry, a, 0, Math.PI * 2); g.fill(); }
    g.restore();
    forma(); g.strokeStyle = ROSA_TINTA; g.lineWidth = 8; g.stroke();
    // chorretones que cuelgan del borde de abajo (se estiran despacio) y pompitas en la superficie
    for (const [x, y, w, l0, f] of [[650, 776, 30, 38, 0], [736, 852, 26, 50, 1.3], [1010, 618, 24, 40, 3.4]]) {
      const L = l0 * (0.7 + 0.5 * k) * (1 + 0.18 * Math.sin((t - T.pop) * 2.6 + f));
      g.beginPath(); g.moveTo(x - w, y - 10); g.quadraticCurveTo(x - w * 0.5, y + L * 0.6, x - w * 0.35, y + L);
      g.arc(x, y + L, w * 0.5, Math.PI, 0, true); g.quadraticCurveTo(x + w * 0.5, y + L * 0.6, x + w, y - 10); g.closePath();
      g.fillStyle = "#f4679f"; g.fill(); g.strokeStyle = ROSA_TINTA; g.lineWidth = 6; g.stroke();
      g.fillStyle = "rgba(255,255,255,0.6)"; g.beginPath(); g.ellipse(x - w * 0.2, y + L * 0.75, w * 0.12, w * 0.3, 0, 0, Math.PI * 2); g.fill();
    }
    for (const [x, y, r] of [[990, 420, 22], [622, 600, 15], [840, 300, 12]]) {
      g.fillStyle = "rgba(255,210,230,0.55)"; g.strokeStyle = "rgba(124,21,70,0.6)"; g.lineWidth = 4;
      g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); g.stroke();
      g.fillStyle = "rgba(255,255,255,0.85)"; g.beginPath(); g.arc(x - r * 0.35, y - r * 0.35, r * 0.25, 0, Math.PI * 2); g.fill();
    }
    // el borde del despegue: un labio más oscuro
    if (yd < Y_ABAJO - 2) {
      const [a, b] = anchoEn(yd);
      g.strokeStyle = ROSA_TINTA; g.lineWidth = 10; g.beginPath(); g.moveTo(a - 20, yd - 4); g.quadraticCurveTo((a + b) / 2, yd + 10, b + 20, yd - 4); g.stroke();
      g.strokeStyle = "rgba(255,200,226,0.9)"; g.lineWidth = 5; g.beginPath(); g.moveTo(a - 10, yd - 12); g.quadraticCurveTo((a + b) / 2, yd + 2, b + 10, yd - 12); g.stroke();
    }
    g.restore();
  }
  // lo que queda pegado: pegotes en los pinchos, las cejas y la nariz
  function pegotes(g, t) {
    const yd = rayaDespegue(t);
    if (t < T.despega0) return;
    g.save(); g.lineJoin = "round";
    restos.forEach(([x, y, r, a], i) => {
      if (yd > y + 10) return;
      const e = clamp((y + 10 - yd) / 40);
      g.save(); g.translate(x, y); g.rotate(a); g.scale(e, e);
      g.beginPath(); g.moveTo(-r, -r * 0.2); g.quadraticCurveTo(-r * 0.6, -r, r * 0.2, -r * 0.7); g.quadraticCurveTo(r * 1.1, -r * 0.4, r * 0.9, r * 0.3);
      g.quadraticCurveTo(r * 0.6, r * 1.3, r * 0.1, r * 0.9); g.lineTo(0, r * 1.5 + 8 * hash(i + 3)); g.lineTo(-r * 0.3, r * 0.8); g.quadraticCurveTo(-r * 1.1, r * 0.6, -r, -r * 0.2);
      g.fillStyle = ROSA; g.fill(); g.lineWidth = 5; g.strokeStyle = ROSA_TINTA; g.stroke();
      g.fillStyle = "rgba(255,255,255,0.7)"; g.beginPath(); g.ellipse(-r * 0.3, -r * 0.35, r * 0.28, r * 0.12, -0.5, 0, Math.PI * 2); g.fill();
      g.restore();
    });
    // el globito final le explota en la nariz: un pegotito más
    const kn = tramo(t, T.gGlobitoPop, T.gGlobitoPop + 0.08);
    if (kn > 0) { g.save(); g.translate(MANCHA_NARIZ.x,MANCHA_NARIZ.y); g.scale(kn, kn); g.fillStyle = ROSA; g.strokeStyle = ROSA_TINTA; g.lineWidth = 5;
      g.beginPath(); g.ellipse(0, 0, 26, 18, 0.3, 0, Math.PI * 2); g.fill(); g.stroke();
      g.fillStyle = "rgba(255,255,255,0.7)"; g.beginPath(); g.ellipse(-8, -6, 8, 4, -0.4, 0, Math.PI * 2); g.fill(); g.restore(); }
    g.restore();
  }

  /* ---------- el trozo despegado: de la cara a los dedos de Rodri (pantalla) ---------- */
  let POSE_G = null;
  const retratoAPant = (p, q) => G.aPantalla(p, G.cabeza(p).a(q));
  function solapa(g, t, mano) {
    const pG = (POSE_G && POSE_G._t === t) ? POSE_G : poseG(t);
    const yd = rayaDespegue(t);
    if(t<T.pellizca||t>=T.despega1+.13)return;
    const [a, b] = anchoEn(Math.min(yd, 930));
    const suelta=tramo(t,T.despega1-.025,T.despega1+.13);
    const aa=retratoAPant(pG,P(a-6,yd-2)),bb=retratoAPant(pG,P(b+6,yd-2));
    const A=P(lerp(aa.x,mano.x-4,suelta),lerp(aa.y,mano.y+2,suelta)),B=P(lerp(bb.x,mano.x+4,suelta),lerp(bb.y,mano.y+2,suelta));
    // antes de despegar: solo la punta estirada hasta los dedos
    const tir = fase(t, T.pellizca, T.despega0);
    const desp = tramo(t, T.despega0, T.despega1);
    const mitad = P((A.x + B.x) / 2, (A.y + B.y) / 2);
    const H = mano;
    const ancho=lerp(lerp(10,26,desp),8,suelta);
    const dx = H.x - mitad.x, dy = H.y - mitad.y, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
    const H1 = P(H.x + nx * ancho * 0.5, H.y + ny * ancho * 0.5), H2 = P(H.x - nx * ancho * 0.5, H.y - ny * ancho * 0.5);
    const cuelga=(18*desp+6)*(1-suelta);
    g.save();g.globalAlpha*=1-suelta; g.lineJoin = "round"; g.lineCap = "round";
    if (desp <= 0.001) {
      // la punta de la barbilla, estirada hasta los dedos
      const Pt = retratoAPant(pG, CARETA_PUNTA), Pb1 = retratoAPant(pG, P(806, 912)), Pb2 = retratoAPant(pG, P(852, 900));
      const kk = suave(tir);
      const E1 = P(lerp(Pt.x, H.x, kk), lerp(Pt.y, H.y, kk));
      g.beginPath(); g.moveTo(Pb1.x, Pb1.y); g.quadraticCurveTo((Pb1.x + E1.x) / 2 - 3, (Pb1.y + E1.y) / 2 + 3, E1.x - 4, E1.y);
      g.lineTo(E1.x + 4, E1.y); g.quadraticCurveTo((Pb2.x + E1.x) / 2 + 3, (Pb2.y + E1.y) / 2, Pb2.x, Pb2.y); g.closePath();
      g.fillStyle = ROSA; g.fill(); g.strokeStyle = ROSA_TINTA; g.lineWidth = 1.6; g.stroke();
      g.restore(); return;
    }
    // la solapa: del borde que se despega a los dedos, combándose
    const C1 = P(lerp(A.x, H1.x, 0.5) - nx * 6, lerp(A.y, H1.y, 0.5) + cuelga);
    const C2 = P(lerp(B.x, H2.x, 0.5) + nx * 6, lerp(B.y, H2.y, 0.5) + cuelga);
    const forma = () => { g.beginPath(); g.moveTo(A.x, A.y); g.quadraticCurveTo(C1.x, C1.y, H1.x, H1.y); g.lineTo(H2.x, H2.y);
      g.quadraticCurveTo(C2.x, C2.y, B.x, B.y); g.quadraticCurveTo(mitad.x + nx * 4, mitad.y + ny * 4 + 3, A.x, A.y); g.closePath(); };
    const gr = g.createLinearGradient(mitad.x, mitad.y, H.x, H.y);
    gr.addColorStop(0, "#f2609f"); gr.addColorStop(1, "#ff9ac4");
    forma(); g.fillStyle = gr; g.fill();
    g.save(); forma(); g.clip();
    g.strokeStyle = "rgba(150,24,80,0.45)"; g.lineWidth = 1.6;
    for (let i = 1; i < 5; i++) { const u = i / 5, Q0 = P(lerp(A.x, B.x, u), lerp(A.y, B.y, u)), Q1 = P(lerp(H1.x, H2.x, u), lerp(H1.y, H2.y, u));
      g.beginPath(); g.moveTo(Q0.x, Q0.y); g.quadraticCurveTo((Q0.x + Q1.x) / 2, (Q0.y + Q1.y) / 2 + cuelga * 0.8, Q1.x, Q1.y); g.stroke(); }
    g.fillStyle = "rgba(255,255,255,0.55)"; g.beginPath(); g.ellipse(lerp(mitad.x, H.x, 0.55), lerp(mitad.y, H.y, 0.55) + cuelga * 0.4, 9, 3, Math.atan2(dy, dx), 0, Math.PI * 2); g.fill();
    g.restore();
    forma(); g.strokeStyle = ROSA_TINTA; g.lineWidth = 1.8; g.stroke();
    // hilos de chicle entre la cara (lo ya destapado) y el borde de abajo de la solapa
    const hil = dentro(t, T.despega0, T.despega0 + 0.05, T.despega1 - 0.05, T.despega1 + 0.25);
    if (hil > 0.01) {
      const enCurva = (p0, p1, p2, u) => P((1 - u) * (1 - u) * p0.x + 2 * u * (1 - u) * p1.x + u * u * p2.x, (1 - u) * (1 - u) * p0.y + 2 * u * (1 - u) * p1.y + u * u * p2.y);
      for (let i = 0; i < 5; i++) {
        const xf = lerp(a + 50, b - 40, (i + 0.5) / 5), yf = Math.min(yd + 70 + 60 * hash(i + 11), 860);
        const F = retratoAPant(pG, P(xf, yf));
        const Q = i < 3 ? enCurva(A, C1, H1, 0.12 + 0.12 * i) : enCurva(B, C2, H2, 0.1 + 0.12 * (i - 3));
        const len = Math.hypot(Q.x - F.x, Q.y - F.y), rompe = clamp((len - 24) / 46);
        g.globalAlpha = (1-suelta)*hil*(1-rompe);
        g.strokeStyle = ROSA_OSC; g.lineWidth = 2.4 * (1 - 0.6 * rompe) + 0.7;
        g.beginPath(); g.moveTo(F.x, F.y); g.quadraticCurveTo((F.x + Q.x) / 2, Math.max(F.y, Q.y) + 6, Q.x, Q.y); g.stroke();
        g.strokeStyle = "rgba(255,200,226,0.9)"; g.lineWidth = 0.9; g.stroke();
        g.fillStyle = ROSA; g.beginPath(); g.arc(F.x, F.y, 1.8, 0, Math.PI * 2); g.fill();
      }
      g.globalAlpha = 1;
    }
    g.restore();
  }
  // la careta ya arrancada, colgando de los dedos de Rodri (con la cara de Guillermo marcada)
  function caretaColgando(g, t, H) {
    const k=tramo(t,T.despega0+.10,T.despega1+.10);
    if (k <= 0) return;
    const bal = 0.22 * muelle(t, T.despega1, 7, 2.2) + 0.04 * Math.sin(t * 2.4);
    g.save(); g.translate(H.x, H.y); g.rotate(bal); g.lineJoin = "round"; g.lineCap = "round";
    g.scale(.24+.76*Math.sqrt(k),k); g.globalAlpha*=suave(clamp(k/.16));
    // una sábana arrugada de chicle: arriba se junta en los dedos, abajo se abre
    const forma = () => { g.beginPath(); g.moveTo(-5, -2); g.lineTo(5, -2);
      g.bezierCurveTo(16, 12, 30, 30, 30, 52); g.lineTo(24, 58); g.lineTo(26, 66); g.lineTo(16, 70); g.lineTo(10, 80); g.lineTo(0, 74);
      g.lineTo(-8, 82); g.lineTo(-16, 72); g.lineTo(-26, 70); g.lineTo(-28, 58); g.bezierCurveTo(-30, 34, -16, 12, -5, -2); g.closePath(); };
    const gr = g.createLinearGradient(-30, 0, 30, 80); gr.addColorStop(0, "#ff9cc6"); gr.addColorStop(1, "#ee5799");
    forma(); g.fillStyle = gr; g.fill();
    g.save(); forma(); g.clip();
    // la cara marcada: dos ojos, la nariz y la boca
    g.fillStyle = "rgba(120,18,64,0.55)";
    g.beginPath(); g.ellipse(-11, 38, 6, 3.6, 0.15, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.ellipse(10, 40, 5, 3.2, 0.25, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.ellipse(2, 60, 7, 2.6, 0.2, 0, Math.PI * 2); g.fill();
    g.fillStyle = "rgba(255,214,232,0.75)"; g.beginPath(); g.ellipse(5, 50, 3.5, 6, 0.3, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "rgba(150,24,80,0.4)"; g.lineWidth = 1.3;
    for (const [x0, x1] of [[-18, -6], [6, 18], [-20, 20]]) { g.beginPath(); g.moveTo(x0, 22); g.quadraticCurveTo((x0 + x1) / 2, 14, x1, 22); g.stroke(); }
    g.fillStyle = "rgba(255,255,255,0.6)"; g.beginPath(); g.ellipse(-14, 20, 6, 2.4, -0.7, 0, Math.PI * 2); g.fill();
    g.restore();
    forma(); g.strokeStyle = ROSA_TINTA; g.lineWidth = 1.8; g.stroke();
    // un hilo que aún cuelga
    g.strokeStyle = ROSA_OSC; g.lineWidth = 1.6; g.beginPath(); g.moveTo(10, 80); g.quadraticCurveTo(12 + 3 * Math.sin(t * 3), 92, 9, 100 + 4 * Math.sin(t * 2.2)); g.stroke();
    g.restore();
  }

  /* ---------- carrillo cercano hinchado (retrato de Guillermo; como en 00113) ---------- */
  const PIEL_G = "rgb(254,181,116)";
  function carrillo(g, k) {
    if (k <= 0.01) return;
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    const A = { x: 600, y: 684 }, B = { x: 768, y: 842 }, b = 30 * k;
    const c1 = { x: 586 - b * 0.9, y: 748 + b * 0.5 }, c2 = { x: 690 - b * 0.5, y: 850 + b * 0.8 };
    g.beginPath(); g.moveTo(A.x, A.y); g.bezierCurveTo(c1.x, c1.y, c2.x, c2.y, B.x, B.y); g.lineTo(760, 800); g.lineTo(640, 700); g.closePath();
    g.fillStyle = PIEL_G; g.fill();
    g.beginPath(); g.moveTo(A.x, A.y); g.bezierCurveTo(c1.x, c1.y, c2.x, c2.y, B.x, B.y); g.lineWidth = 6; g.strokeStyle = TINTA; g.stroke();
    g.globalAlpha = 0.5 * clamp(k); g.fillStyle = "#fff1dc";
    g.beginPath(); g.ellipse(706, 664, 20 + 12 * k, 13 + 7 * k, -0.35, 0, Math.PI * 2); g.fill();
    g.globalAlpha = clamp(k); g.strokeStyle = TINTA; g.lineWidth = 4.5;
    g.beginPath(); g.moveTo(744, 694 - 4 * k); g.quadraticCurveTo(756 - 4 * k, 716, 748, 742 + 3 * k); g.stroke();
    g.restore();
  }

  /* =====================================================================================
   * GUILLERMO (izquierda, mira a la derecha)
   * ===================================================================================== */
  const CARAS_G = {
    inicio: E({ mx: 0.9, my: 0.15, c: 0.2, sd: 10, gd: 0.04, si: 12, gi: 0.06, abre: 0, ancho: 0.95, sonr: 0.4 }),
    curioso: E({ mx: 0.95, my: 0.1, c: 0.05, sd: 18, gd: 0.08, si: 20, gi: 0.1, abre: 2, ancho: 0.8, sonr: 0.25 }),
    caza: E({ mx: 0.7, my: -0.2, iris: 0.9, c: 0, sd: 24, gd: 0.1, si: 24, gi: 0.1, abre: 30, ancho: 0.75, sonr: 0.1 }),
    nam: E({ c: 1, h: 0.6, sd: 10, si: 10, abre: 0, ancho: 0.8, sonr: 0.6 }),
    masca: E({ mx: 0.9, my: 0.1, c: 0.25, sd: 8, si: 10, abre: 0, ancho: 0.8, sonr: 0.35 }),
    ooh: E({ mx: 0.95, my: -0.1, iris: 0.86, c: 0, sd: 22, gd: 0.12, si: 24, gi: 0.14, abre: 14, ancho: 0.45, sonr: 0.05 }),
    picado: E({ mx: 0.9, my: 0.1, c: 0.3, sd: -8, gd: -0.18, si: -8, gi: -0.18, abre: 0, ancho: 0.75, sonr: -0.3 }),
    furioso: E({ mx: 0.6, my: 0.2, c: 0.35, sd: -10, gd: -0.2, si: -10, gi: -0.2, abre: 0, ancho: 0.8, sonr: -0.1 }),
    aire: E({ mx: 0.5, my: -0.4, c: 0.3, sd: 16, si: 16, abre: 4, ancho: 0.45, sonr: 0, mof: 0.6 }),
    sopla: E({ mx: 0.9, my: -0.3, c: 0.15, sd: 12, gd: 0.04, si: 14, gi: 0.05, abre: 3, ancho: 0.35, sonr: 0, mof: 0.85 }),
    asusta: E({ mx: -0.2, my: 0.9, iris: 0.72, c: 0, sd: 28, gd: 0.12, si: 28, gi: 0.12, abre: 3, ancho: 0.35, sonr: 0, mof: 0.85 }),
    pasmo: E({ mx: 0.6, my: 0.0, iris: 0.68, c: 0, sd: 30, gd: 0.12, si: 30, gi: 0.12, abre: 18, ancho: 0.42, sonr: -0.05 }),
    camara: E({ mx: -0.85, my: 0.05, c: 0.35, h: 0.2, sd: 14, gd: 0.04, si: 16, gi: 0.06, abre: 0, ancho: 0.75, sonr: 0.4 }),
    globito: E({ mx: -0.85, my: 0.05, c: 0.35, sd: 18, si: 20, abre: 2, ancho: 0.35, sonr: 0, mof: 0.4 }),
    digno: E({ mx: -0.85, my: 0.0, c: 0.5, h: 0.4, sd: 16, gd: 0.04, si: 18, gi: 0.06, abre: 0, ancho: 0.85, sonr: 0.7 })
  };
  const GUION_CARA_G = [
    [0.9, 1.15, "curioso"], [T.vuelaG + 0.18, T.vuelaG + 0.36, "caza"], [T.cazaG - 0.02, T.cazaG + 0.08, "nam", salida], [T.cazaG + 0.4, T.cazaG + 0.6, "masca"],
    [T.gOoh, T.gOoh + 0.25, "ooh"], [T.gPica, T.gPica + 0.18, "picado"], [T.gMasca0, T.gMasca0 + 0.2, "furioso"],
    [T.gAire, T.gAire + 0.2, "aire"], [T.gSopla0, T.gSopla0 + 0.2, "sopla"], [T.gDespega - 0.1, T.gDespega + 0.3, "asusta"],
    [T.despega1 - 0.04, T.despega1 + 0.06, "pasmo", salida], [T.gMasca2, T.gMasca2 + 0.2, "camara"], [T.gGlobito0, T.gGlobito0 + 0.15, "globito"],
    [T.gGlobitoPop + 0.04, T.gGlobitoPop + 0.2, "digno"]
  ];
  const CUERPOS_G = {
    inicio: { torso: 0.02, cab: 0.02 }, curioso: { torso: 0.05, cab: 0.08 }, caza: { torso: 0.08, cab: -0.24 }, nam: { torso: 0.02, cab: 0.06 },
    masca: { torso: 0.02, cab: 0.03 }, ooh: { torso: -0.04, cab: -0.08 }, picado: { torso: 0.06, cab: 0.08 }, furioso: { torso: 0.04, cab: 0.1 },
    aire: { torso: -0.1, cab: -0.2 }, sopla: { torso: -0.02, cab: -0.06 }, flota: { torso: -0.06, cab: -0.12 },
    ciego: { torso: 0.02, cab: 0.0 }, agacha: { torso: 0.1, cab: 0.26 }, tirado: { torso: 0.04, cab: -0.18 }, pasmo: { torso: -0.04, cab: -0.04 },
    camara: { torso: 0.0, cab: 0.0 }
  };
  const GUION_CUERPO_G = [
    [0.9, 1.15, "curioso"], [T.vuelaG + 0.15, T.vuelaG + 0.4, "caza"], [T.cazaG - 0.02, T.cazaG + 0.12, "nam", salida], [T.cazaG + 0.35, T.cazaG + 0.6, "masca"],
    [T.gOoh, T.gOoh + 0.25, "ooh"], [T.gPica, T.gPica + 0.18, "picado"], [T.gMasca0, T.gMasca0 + 0.2, "furioso"],
    [T.gAire, T.gAire + 0.25, "aire"], [T.gSopla0, T.gSopla0 + 0.25, "sopla"], [T.gDespega - 0.2, T.gDespega + 0.4, "flota"],
    [T.cae1, T.cae1 + 0.2, "ciego"], [T.gAgacha, T.pellizca, "agacha"], [T.despega0, T.despega1, "tirado"],
    [T.despega1, T.despega1 + 0.3, "pasmo", salida], [T.gMasca2, T.gMasca2 + 0.3, "camara"]
  ];

  const suelas=new Map();
  function perfilSuela(rig,lado) {
    const key=rig.A.id+lado;if(suelas.has(key))return suelas.get(key);
    const z=rig.A.datos.piezas[lado==="cerca"?"zapato":"zapato_lejos"],piv=rig.A.datos.piezas.zapato.pivote;
    const [mx,my,w,h]=z.marco,c=document.createElement("canvas");c.width=w;c.height=h;const g=c.getContext("2d",{willReadFrequently:true});
    g.drawImage(rig.A.imgs[z.img||0],mx,my,w,h,0,0,w,h);const ink=g.getImageData(0,0,w,h).data,perfil=[];
    for(let x=0;x<w;x++) {
      let top=0,bt=h-1;while(top<h&&ink[(top*w+x)*4+3]<128)top++;
      while(bt>=0&&ink[(bt*w+x)*4+3]<128)bt--;
      if(bt<top)continue;
      const xx=z.origen[0]-piv[0]+(x+.5)*z.tam_hoja[0]/w;
      for(const y of [top,bt])perfil.push({x:xx,y:z.origen[1]-piv[1]+(y+.5)*z.tam_hoja[1]/h});
    }
    if(!perfil.length)throw Error("Falta el contorno del zapato");
    suelas.set(key,perfil);return perfil;
  }
  function apoyoPunta(rig,p,lado) {
    const q=p.piernas[lado],b=perfilSuela(rig,lado),c=Math.cos(q.ang),s=Math.sin(q.ang);
    let base=b[0],alto=-Infinity;
    for(const pt of b){const h=pt.x*s+pt.y*c;if(h>alto){alto=h;base=pt;}}
    const d=rot(base,q.ang);return rig.aPantalla(p,P(q.tob.x+d.x,q.tob.y+d.y));
  }
  function fijaZapato(rig,p,lado,altura) {
    const q=p.piernas[lado],b=apoyoPunta(rig,p,lado);
    q.tob.y+=(SUELO-altura-b.y)/(p.s*rig.K);
  }
  function poseG(t) {
    const b = guion(GUION_CUERPO_G, CUERPOS_G, "inicio", t);
    const respira = Math.sin(t * 2.3);
    const dsp = despegue(t);
    const p = {
      x: XG, suelo: SUELO, s: S, tirasLimpias: true, hombrosContinuos: true, hombrosRecortados: true,
      torso: b.torso, torsoEsc: { x: 1, y: 1 + respira * 0.005 }, piernas: {},
      cabeza: { ang: b.cab, dx: 0, dy: 0, esc: { x: 1, y: 1 } }
    };
    // masca: la cabeza acompaña cada mordisco
    const mk = dentro(t, T.cazaG + 0.25, T.cazaG + 0.4, T.gAire - 0.05, T.gAire) * (1 - campana(t, T.gOoh - 0.2, T.gPica + 0.2) * 0.8);
    const furia = dentro(t, T.gMasca0, T.gMasca0 + 0.1, T.gMasca1 - 0.1, T.gMasca1);
    const mm = mascar(t, 2.6 + 2.4 * furia);
    p.cabeza.dy += (1.2 + 2 * furia) * mm * Math.max(mk, furia);
    p.cabeza.ang += 0.04 * Math.sin(t * Math.PI * 2 * 5) * furia;
    // coge aire: el pecho se hincha
    const aire = dentro(t, T.gAire, T.gAire + 0.25, T.gSopla0 + 0.3, T.gSopla0 + 0.8);
    p.torsoEsc.y += 0.03 * aire; p.torsoEsc.x += 0.04 * aire;
    // tiembla de esfuerzo al soplar
    const esf = dentro(t, T.gSopla0 + 0.1, T.gSopla0 + 0.3, T.pop - 0.1, T.pop);
    p.cabeza.dx += 0.8 * Math.sin(t * 43) * esf;
    // a ciegas: sacude la cabeza
    const ciego = dentro(t, T.gCiego0, T.gCiego0 + 0.15, T.gCiego1 - 0.15, T.gCiego1);
    p.cabeza.ang += 0.12 * Math.sin((t - T.gCiego0) * 7) * ciego; p.torso += 0.04 * Math.sin((t - T.gCiego0) * 7 + 0.5) * ciego;
    // el tirón de la careta: la cabeza sigue a la mano y vuelve de golpe
    p.cabeza.ang += -0.12 * campana(t, T.despega0, T.despega1 + 0.05) + 0.06 * muelle(t, T.despega1, 18, 6);
    // el globito: un saltito de la cabeza al explotar
    p.cabeza.ang += -0.05 * muelle(t, T.gGlobitoPop, 22, 7);
    // aterriza: se le doblan las rodillas
    const aterriza = campana(t, T.cae1 - 0.02, T.cae1 + 0.25);
    const py = PY_PIE(G) + respira * 0.9 - dsp.sube + 9 * aterriza - 5 * dsp.punt;
    p.pelvis = G.aHoja(p, { x: XG + 2 * Math.sin(t * 1.3) * dsp.punt, y: py });
    const TOB = G.SUELO - G.TOBILLO_ALTO;
    const levanta = (dsp.sube + 5 * dsp.punt) / S;
    const cuelga = clamp(dsp.sube / 20);
    p.piernas.cerca = { tob: { x: G.CADERA.cerca.x - 8 + 14 * cuelga, y: TOB - levanta + 30 * cuelga }, ang: 0.55 * dsp.punt + 0.25 * cuelga };
    p.piernas.lejos = { tob: { x: G.CADERA.lejos.x + 14 - 8 * cuelga, y: TOB - levanta + 36 * cuelga }, ang: 0.5 * dsp.punt + 0.35 * cuelga };
    for(const lado of ["cerca","lejos"])fijaZapato(G,p,lado,Math.max(0,dsp.sube));
    const ex = guion(GUION_CARA_G, CARAS_G, "inicio", t);
    // masca: la boca
    const boca = Math.max(mk, furia);
    if (boca > 0) { ex.abre = lerp(ex.abre, 3 + (6 + 6 * furia) * mm, boca); ex.ancho = lerp(ex.ancho, 0.75, boca); ex.mof = Math.max(ex.mof, 0.15 * mm * boca); }
    // sopla: los carrillos tiemblan al empujar
    if (esf > 0) ex.mof = clamp(ex.mof + 0.08 * Math.sin(t * 31) * esf);
    // masca otra vez al final (lo que le queda en la boca)
    const mf = dentro(t, T.gMasca2, T.gMasca2 + 0.1, T.gGlobito0 - 0.05, T.gGlobito0);
    if (mf > 0) { ex.abre = lerp(ex.abre, 2 + 6 * mascar(t, 3), mf); ex.ancho = lerp(ex.ancho, 0.7, mf); }
    p.cara = cara(ex, (ex.c > 0.8 || ex.z > 0.4) ? 0 : parpadeo(t, [0.55, 3.6, 5.5, 12.85, 13.1]));
    p.rojo = 0.35 * dentro(t, T.gPica - 0.05, T.gPica + 0.2, T.gAire, T.gAire + 0.2) + 0.45 * dentro(t, T.gSopla0 + 0.6, T.gSopla1, T.pop, T.pop + 0.1)
      + 0.18 * dentro(t, T.despega1, T.despega1 + 0.15, T.gCamara, T.gCamara + 0.4);
    p.enfado = 0.9 * dentro(t, T.gPica - 0.05, T.gPica + 0.15, T.gAire - 0.1, T.gAire + 0.1);
    p.sudor = 0.8 * dentro(t, T.gDespega, T.gDespega + 0.2, T.pop, T.pop + 0.05);
    manosG(p, t);
    const carr = Math.max(ex.mof, 0);
    p._t = t;
    p.capaCabeza = g => { carrillo(g, carr); careta(g, t); pegotes(g, t); };
    return p;
  }

  function manosG(p, t) {
    const Tr = G.tronco(p), aP = q => G.aPantalla(p, Tr(q));
    const hom = aP(G.HOMBRO), homC = aP(G.HOMBRO_C);
    // brazos abiertos para no caerse (al flotar)
    const equilibrio = (lado, tt) => {
      const sg = lado === "lejos" ? 1 : -1, w = Math.sin((tt - T.gPuntillas) * 5 + (sg > 0 ? 0 : 1.4));
      const h0 = lado === "lejos" ? hom : homC;
      return { x: h0.x + sg * 62, y: h0.y + 34 + 14 * w, ang: 0, d: ABIERTA, bol: 0, mo: sg * 0.9 };
    };
    // a ciegas: bracea delante
    const aCiegas = (lado, tt) => {
      const sg = lado === "lejos" ? 1 : -1, u = (tt - T.gCiego0) * 6.5 + (sg > 0 ? 0 : Math.PI);
      const h0 = lado === "lejos" ? hom : homC;
      return { x: h0.x + sg * 30 + 26 * Math.cos(u) + (sg > 0 ? 24 : 6), y: h0.y + 30 + 22 * Math.sin(u), ang: 0, d: ABIERTA, bol: 0, mo: sg * 0.4 };
    };
    // la mano lejana (la de delante): bolsillo; en jarras al picarse; equilibrio; a ciegas; manos arriba del susto
    const PL = [
      [0, 0, { x: 420, y: 340, ang: 0, d: RELAJADA, bol: 1 }],
      [T.gPica, T.gPica + 0.25, () => ({ x: aP(P(372, 560)).x + 8, y: aP(P(372, 560)).y, ang: 0, d: PUNO, bol: 0, mo: -0.6 })],
      [T.gAire - 0.1, T.gAire + 0.2, { x: 420, y: 340, ang: 0, d: RELAJADA, bol: 1 }],
      [T.gPuntillas - 0.1, T.gPuntillas + 0.35, tt => equilibrio("lejos", tt)],
      [T.pop - 0.05, T.pop + 0.12, tt => ({ x: hom.x + 50, y: hom.y - 10, ang: 0, d: ABIERTA, bol: 0, mo: 1.2 })],
      [T.gCiego0 - 0.1, T.gCiego0 + 0.1, tt => aCiegas("lejos", tt)],
      [T.gCiego1, T.gAgacha + 0.2, tt => ({ x: hom.x + 16, y: hom.y + 74, ang: 0, d: ABRE, bol: 0, mo: 0.3 })],
      [T.despega1 + 0.05, T.despega1 + 0.25, tt => ({ x: hom.x + 30, y: hom.y + 44, ang: 0, d: ABIERTA, bol: 0, mo: 0.9 })],
      [T.gMasca2 + 0.1, T.gMasca2 + 0.5, { x: 420, y: 340, ang: 0, d: RELAJADA, bol: 1, mo: 0 }]
    ];
    const l = pista(PL, t);
    if (t > T.gPuntillas && t < T.pop - 0.05) Object.assign(l, equilibrio("lejos", t), { bol: l.bol });
    if (t > T.gCiego0 + 0.1 && t < T.gCiego1) Object.assign(l, aCiegas("lejos", t));
    p.manoLejos = manoRig(G, p, l, "lejos", BOLS_GL, -1, null);
    const PC = [
      [0, 0, { x: 340, y: 340, ang: 0, d: RELAJADA, bol: 1 }],
      [T.gPica, T.gPica + 0.25, () => ({ x: aP(P(150, 560)).x - 6, y: aP(P(150, 560)).y, ang: 0, d: PUNO, bol: 0, mo: 0.6 })],
      [T.gAire - 0.1, T.gAire + 0.2, { x: 340, y: 340, ang: 0, d: RELAJADA, bol: 1 }],
      [T.gPuntillas - 0.05, T.gPuntillas + 0.4, tt => equilibrio("cerca", tt)],
      [T.pop - 0.05, T.pop + 0.12, tt => ({ x: homC.x - 40, y: homC.y - 6, ang: 0, d: ABIERTA, bol: 0, mo: -1.2 })],
      [T.gCiego0 - 0.1, T.gCiego0 + 0.1, tt => aCiegas("cerca", tt)],
      [T.gCiego1, T.gAgacha + 0.2, tt => ({ x: homC.x - 20, y: homC.y + 66, ang: 0, d: ABRE, bol: 0, mo: -0.4 })],
      [T.despega1 + 0.05, T.despega1 + 0.25, tt => ({ x: homC.x - 46, y: homC.y + 26, ang: 0, d: ABIERTA, bol: 0, mo: -0.9 })],
      [T.gMasca2 + 0.1, T.gMasca2 + 0.5, { x: 340, y: 340, ang: 0, d: RELAJADA, bol: 1, mo: 0 }]
    ];
    const c = pista(PC, t);
    if (t > T.gPuntillas && t < T.pop - 0.05) Object.assign(c, equilibrio("cerca", t), { bol: c.bol });
    if (t > T.gCiego0 + 0.1 && t < T.gCiego1) Object.assign(c, aCiegas("cerca", t));
    p.manoCerca = manoRig(G, p, c, "cerca", BOLS_GC, -1, null);
  }

  /* =====================================================================================
   * RODRI (derecha, mira a la izquierda)
   * ===================================================================================== */
  const CARAS_R = {
    inicio: E({ mx: 0.9, my: 0.15, c: 0.25, sd: 4, si: 4, sonr: 0.5, ancho: 0.95 }),
    pillo: E({ mx: 0.95, my: 0.05, c: 0.35, sd: 2, gd: -0.06, si: 10, gi: 0.05, sonr: 0.8, ancho: 1.05 }),
    caza: E({ mx: 0.4, my: -0.8, c: 0.1, sd: 8, si: 8, abre: 26, ancho: 0.8, sonr: 0.2 }),
    nam: E({ mx: 0.9, c: 0.6, h: 0.5, sd: 6, si: 6, abre: 0, ancho: 0.9, sonr: 0.7 }),
    masca: E({ mx: 0.9, my: 0.1, c: 0.3, sd: 4, si: 6, abre: 0, ancho: 0.85, sonr: 0.5 }),
    reta: E({ mx: 0.95, my: 0.05, c: 0.38, sd: 2, gd: -0.06, si: 10, gi: 0.05, sonr: 0.75, ancho: 1.0 }),
    aire: E({ mx: 0.5, my: -0.4, c: 0.4, sd: 8, si: 8, abre: 4, ancho: 0.45, sonr: 0 }),
    sopla: E({ mx: 0.6, my: -0.1, c: 0.55, h: 0.2, sd: 6, si: 6, abre: 3, ancho: 0.35, sonr: 0.1 }),
    chulo: E({ mx: -0.85, my: 0.05, c: 0.45, h: 0.35, sd: 4, si: 4, abre: 0, ancho: 1.0, sonr: 0.9 }),
    mira: E({ mx: 0.9, my: 0.1, c: 0.2, sd: 6, si: 6, abre: 2, ancho: 0.9, sonr: 0.5 }),
    alucina: E({ mx: 0.9, my: -0.3, iris: 0.74, c: 0, sd: 16, si: 16, abre: 26, ancho: 0.6, sonr: -0.1 }),
    susto: E({ mx: 0.9, my: 0.0, iris: 0.7, c: 0.2, z: 0.6, sd: 16, si: 16, abre: 18, ancho: 0.7, sonr: -0.3 }),
    risa: E({ mx: 0.7, my: 0.3, c: 1, h: 1, sd: 10, si: 10, abre: 24, ancho: 1.1, sonr: 0.95 }),
    pillo2: E({ mx: 0.95, my: 0.25, c: 0.3, h: 0.25, sd: 6, si: 8, abre: 0, ancho: 1.0, sonr: 0.8 }),
    tira: E({ mx: 0.9, my: 0.1, c: 0.3, z: 0.4, sd: 4, si: 4, abre: 8, ancho: 1.0, sonr: 0.3 }),
    careta: E({ mx: 0.8, my: -0.4, iris: 0.85, c: 0.1, sd: 12, si: 12, abre: 6, ancho: 0.7, sonr: 0.35 }),
    camara: E({ mx: -0.85, my: 0.05, c: 0.4, h: 0.35, sd: 6, si: 6, abre: 4, ancho: 1.0, sonr: 0.85 })
  };
  const GUION_CARA_R = [
    [0.6, 0.9, "pillo"], [T.vuelaR + 0.1, T.vuelaR + 0.25, "caza"], [T.cazaR - 0.02, T.cazaR + 0.08, "nam", salida], [T.cazaR + 0.4, T.cazaR + 0.6, "masca"],
    [T.rReta, T.rReta + 0.2, "reta"], [T.rAire, T.rAire + 0.2, "aire"], [T.rSopla0, T.rSopla0 + 0.2, "sopla"],
    [T.rSorbe1, T.rSorbe1 + 0.1, "chulo", salida], [T.rGuino + 0.4, T.rGuino + 0.6, "mira"], [T.rBoquia, T.rBoquia + 0.25, "alucina"],
    [T.pop - 0.02, T.pop + 0.06, "susto", salida], [T.rRie0, T.rRie0 + 0.12, "risa"], [T.rRie1, T.rRie1 + 0.2, "pillo2"],
    [T.despega0 - 0.05, T.despega0 + 0.1, "tira"], [T.rMiraCareta, T.rMiraCareta + 0.2, "careta"], [T.rCamara2, T.rCamara2 + 0.25, "camara"]
  ];
  const CUERPOS_R = {
    inicio: { torso: 0.02, cab: 0.02 }, pillo: { torso: 0.04, cab: 0.06 }, caza: { torso: -0.12, cab: -0.36 }, nam: { torso: 0.02, cab: 0.05 },
    masca: { torso: 0.02, cab: 0.03 }, aire: { torso: -0.1, cab: -0.18 }, sopla: { torso: -0.02, cab: -0.04 }, chulo: { torso: -0.04, cab: -0.1 },
    mira: { torso: 0.02, cab: 0.04 }, alucina: { torso: -0.1, cab: -0.14 }, atras: { torso: -0.2, cab: -0.24 }, susto: { torso: -0.14, cab: -0.2 },
    risa: { torso: 0.16, cab: 0.16 }, anda: { torso: 0.06, cab: 0.04 }, alcanza: { torso: 0.2, cab: 0.06 }, tira: { torso: -0.02, cab: -0.12 },
    careta: { torso: -0.02, cab: -0.16 }, camara: { torso: 0.0, cab: 0.0 }
  };
  const GUION_CUERPO_R = [
    [0.6, 0.9, "pillo"], [T.vuelaR + 0.05, T.vuelaR + 0.28, "caza"], [T.cazaR - 0.02, T.cazaR + 0.1, "nam", salida], [T.cazaR + 0.4, T.cazaR + 0.6, "masca"],
    [T.rAire, T.rAire + 0.25, "aire"], [T.rSopla0, T.rSopla0 + 0.25, "sopla"], [T.rSorbe1, T.rSorbe1 + 0.15, "chulo", salida],
    [T.rGuino + 0.4, T.rGuino + 0.6, "mira"], [T.rBoquia, T.rBoquia + 0.3, "alucina"], [T.rRecula0 - 0.1, T.rRecula1, "atras"],
    [T.pop - 0.02, T.pop + 0.08, "susto", salida], [T.rRie0, T.rRie0 + 0.15, "risa"], [T.rAnda0 - 0.05, T.rAnda0 + 0.2, "anda"],
    [T.rAnda1 - 0.15, T.pellizca, "alcanza"], [T.despega0, T.despega1, "tira"], [T.rMiraCareta, T.rMiraCareta + 0.25, "careta"],
    [T.rCamara2, T.rCamara2 + 0.3, "camara"]
  ];

  function poseR(t) {
    const b = guion(GUION_CUERPO_R, CUERPOS_R, "inicio", t);
    const respira = Math.sin(t * 2.0 + 0.7);
    const p = {
      x: XR, suelo: SUELO, s: S, espejo: true, tirasLimpias: true,
      torso: b.torso, torsoEsc: { x: 1, y: 1 + respira * 0.004 }, piernas: {},
      cabeza: { ang: b.cab, dx: 0, dy: 0, esc: { x: 1, y: 1 } }
    };
    // masca tranquilo
    const mk = dentro(t, T.cazaR + 0.3, T.cazaR + 0.45, T.rAire - 0.05, T.rAire) + dentro(t, T.rSorbe1 + 0.3, T.rSorbe1 + 0.45, T.rBoquia - 0.05, T.rBoquia);
    const mm = mascar(t + 0.2, 2.1);
    p.cabeza.dy += 1.2 * mm * mk;
    // la risa
    const rie = dentro(t, T.rRie0, T.rRie0 + 0.12, T.rRie1 - 0.25, T.rRie1);
    p.torso += 0.035 * Math.sin((t - T.rRie0) * 21) * rie; p.cabeza.ang += 0.04 * Math.sin((t - T.rRie0) * 21 + 0.6) * rie;
    // el ¡chas! del sorbo
    p.cabeza.ang += -0.05 * muelle(t, T.rSorbe1, 24, 8);
    // susto del ¡paf!
    p.cabeza.ang += -0.05 * muelle(t, T.pop + 0.02, 26, 6);
    // pies y pelvis
    const pc = pieR(t, "cerca"), pl = pieR(t, "lejos");
    const anda = Math.max(pc.h, pl.h);
    const midX = (pc.x + pl.x) / 2;
    p.pelvis = R.aHoja(p, { x: midX + 1, y: PY_PIE(R) + respira * 0.8 - 0.25 * anda });
    const yTob = SUELO - R.TOBILLO_ALTO * S * R.K;
    const tc = R.aHoja(p, { x: pc.x, y: yTob - pc.h }), tl = R.aHoja(p, { x: pl.x, y: yTob - pl.h });
    p.piernas.cerca = { tob: tc, ang: pc.a };
    p.piernas.lejos = { tob: tl, ang: pl.a };
    fijaZapato(R,p,"cerca",pc.h);fijaZapato(R,p,"lejos",pl.h);
    const ex = guion(GUION_CARA_R, CARAS_R, "inicio", t);
    if (mk > 0) { ex.abre = lerp(ex.abre, 2 + 6 * mm, clamp(mk)); ex.ancho = lerp(ex.ancho, 0.8, clamp(mk)); }
    if (rie > 0) ex.abre += 8 * Math.abs(Math.sin((t - T.rRie0) * 10.5)) * rie;
    ex.mof = 0;                    // (su carrillo del rig pinta un borde recto sobre el pelo)
    ex.wd += 1.4 * 0.6 * campana(t, T.rGuino, T.rGuino + 0.4) + 1.4 * 0.6 * campana(t, T.rGuino2, T.rGuino2 + 0.4);
    p.cara = cara(ex, (ex.c > 0.8 || ex.z > 0.4) ? 0 : parpadeo(t, [0.4, 2.5, 6.4, 7.6, 11.1, 12.95]));
    p.rojo = 0.15 * campana(t, T.rRie0 + 0.1, T.rRie1);
    manosR(p, t);
    return p;
  }

  // el paquete de chicles (pantalla): una cajita rosa y blanca, sin letras
  function paquete(g, x, y, ang, abierto) {
    g.save(); g.translate(x, y); g.rotate(ang); g.lineJoin = "round";
    g.fillStyle = "#ff6fa8"; g.strokeStyle = TINTA; g.lineWidth = 1.4;
    g.beginPath(); g.roundRect(-9, -13, 18, 22, 2.5); g.fill(); g.stroke();
    g.fillStyle = "#ffffff"; g.beginPath(); g.roundRect(-9, -4, 18, 6, 1); g.fill();
    g.fillStyle = "#3fc1c9"; g.beginPath(); g.arc(0, -1, 2.6, 0, Math.PI * 2); g.fill();
    if (abierto > 0) { g.fillStyle = "#ffd1e3"; g.beginPath(); g.moveTo(-9, -13); g.lineTo(9, -13); g.lineTo(9 - 2 * abierto, -13 - 8 * abierto); g.lineTo(-9, -13 - 6 * abierto); g.closePath(); g.fill(); g.stroke(); }
    if(abierto>0){g.beginPath();g.ellipse(0,-13,7*abierto,1.5*abierto,0,0,Math.PI*2);g.fillStyle="#8b2955";g.fill();}
    g.restore();
  }

  const padPinza=mu=>{const q=rot(P(7.5,7),mu+Math.PI/2);return P(q.x*R.JK,q.y*R.JK);};
  function puntoPinza(p,m) {const d=padPinza(m.mu);return R.aPantalla(p,P(m.x+d.x,m.y+d.y));}
  function estadoPaquete(p,t) {
    const w=R.aPantalla(p,p.manoLejos),ab=tramo(t,T.sacude-.2,T.sacude-.05)*(1-tramo(t,T.guardaPaq-.10,T.guardaPaq));
    const ang=-.2-.18*campana(t,T.sacude-.055,T.sacude+.085)+.07*muelle(t,T.sacude+.06,27,9);
    const c=P(w.x+1,w.y-6),lab=rot(P(0,-13),ang);
    return {c,ang,ab,boca:P(c.x+lab.x,c.y+lab.y),visible:tramo(t,T.sacaPaq+.19,T.sacaPaq+.34)*(1-tramo(t,T.guardaPaq+.045,T.guardaPaq+.16))};
  }
  function manosR(p, t) {
    const Tr = R.tronco(p), aP = q => R.aPantalla(p, Tr(q));
    const hom = aP(R.HOMBRO), homC = aP(R.HOMBRO_C);
    // pinza en la punta de la careta (barbilla de Guillermo) y el tirón hacia arriba
    const pinza = () => { const pG = (POSE_G && POSE_G._t === t) ? POSE_G : poseG(t); const q = retratoAPant(pG, CARETA_PUNTA); const mu=-2.25,d=padPinza(mu),z=R.aHoja(p,q),m=R.aPantalla(p,P(z.x-d.x,z.y-d.y)); return {x:m.x,y:m.y,ang:0,d:PINZA,bol:0,ma:mu,ka:1}; };
    const arriba = () => ({ x: hom.x - 34, y: hom.y - 62, ang: 0, d: PINZA, bol: 0, mo: 0.9 });
    const muestra = () => ({ x: hom.x - 46, y: hom.y - 30, ang: 0, d: PINZA, bol: 0, mo: 0.6 });
    // mano lejana (la de delante, hacia Guillermo)
    const PL = [
      [0, 0, { x: 640, y: 340, ang: 0, d: RELAJADA, bol: 1 }],
      [T.sacaPaq, T.paqArriba, () => ({ x: hom.x - 38, y: hom.y + 52, ang: 0, d: AGARRA, bol: 0, mo: 0.4 })],
      [T.sacude - 0.08, T.sacude, () => ({ x: hom.x - 40, y: hom.y + 60, ang: 0, d: AGARRA, mo: 0.4 }), entrada],
      [T.sacude, T.sacude + 0.08, () => ({ x: hom.x - 44, y: hom.y + 38, ang: 0, d: AGARRA, mo: 0.4 }), salida],
      [T.guardaPaq, T.guardaPaq + 0.35, { x: 640, y: 340, ang: 0, d: RELAJADA, bol: 1, mo: 0 }],
      // ¡guau! las manos fuera de los bolsillos
      [T.rBoquia + 0.1, T.rBoquia + 0.35, () => ({ x: hom.x - 40, y: hom.y + 40, ang: 0, d: ABIERTA, bol: 0, mo: 0.6 })],
      [T.pop - 0.02, T.pop + 0.08, () => ({ x: hom.x - 26, y: hom.y - 6, ang: 0, d: ABIERTA, bol: 0, mo: 1.2 })],
      // se ríe señalándole
      [T.rRie0 + 0.1, T.rRie0 + 0.3, () => ({ x: hom.x - 80, y: hom.y + 14, ang: 0, d: SENALA, bol: 0, mo: 0, ma: Math.PI, ka: 0.8 })],
      [T.rRie1 - 0.1, T.rAnda0 + 0.1, { x: 640, y: 340, ang: 0, d: RELAJADA, bol: 1, mo: 0, ka: 0 }],
      [T.rAnda1 - 0.25, T.pellizca, pinza],
      [T.despega0, T.despega1, arriba, s => s < 0.5 ? 2 * s * s : 1 - 2 * (1 - s) * (1 - s)],
      [T.despega1 + 0.1, T.despega1 + 0.4, muestra]
    ];
    const l = pista(PL, t);
    if (t >= T.pellizca && t < T.despega0) Object.assign(l, pinza());
    const lleva=t>=T.sacaPaq&&t<T.guardaPaq+.35;
    const objPaq=lleva?g=>conCamara(g,()=>{const q=estadoPaquete(p,t);if(q.visible<=0)return;
      g.save();g.globalAlpha*=q.visible;paquete(g,q.c.x,q.c.y,q.ang,q.ab);g.restore();}):null;
    const objCareta=t>=T.pellizca?g=>conCamara(g,()=>{
      const pin=puntoPinza(p,p.manoLejos);
      if(t<T.despega1+.13)solapa(g,t,pin);
      if(t>T.despega0+.10)caretaColgando(g,t,pin);
    }):null;
    p.manoLejos=manoRig(R,p,l,"lejos",R.BOLSILLO_L,-1,objPaq||objCareta);
    p._manoL=R.aPantalla(p,p.manoLejos);
    // mano cercana: bolsillo; en la cadera (chulo); manos arriba; la barriga al reír
    const PC = [
      [0, 0, { x: 720, y: 340, ang: 0, d: RELAJADA, bol: 1 }],
      [T.rReta, T.rReta + 0.3, () => Object.assign(aP(P(150, 560)), { ang: 0, d: PUNO, bol: 0, mo: 0.6 })],
      [T.rGuino + 0.4, T.rGuino + 0.75, { x: 720, y: 340, ang: 0, d: RELAJADA, bol: 1, mo: 0 }],
      [T.rBoquia + 0.15, T.rBoquia + 0.4, () => ({ x: homC.x + 18, y: homC.y + 46, ang: 0, d: ABIERTA, bol: 0, mo: -0.5 })],
      [T.pop - 0.02, T.pop + 0.08, () => ({ x: homC.x + 14, y: homC.y - 2, ang: 0, d: ABIERTA, bol: 0, mo: -1.1 })],
      [T.rRie0, T.rRie0 + 0.25, () => Object.assign(aP(P(270, 560)), { ang: 0, d: RELAJADA, bol: 0, mo: 0.9 })],
      [T.rRie1 - 0.1, T.rAnda0 + 0.15, { x: 720, y: 340, ang: 0, d: RELAJADA, bol: 1, mo: 0 }]
    ];
    const c = pista(PC, t);
    p.manoCerca = manoRig(R, p, c, "cerca", R.BOLSILLO_C, -1, null);
  }

  /* =====================================================================================
   * LOS DOS CHICLES POR EL AIRE
   * ===================================================================================== */
  let trayectos;
  function vuelosChicle() {
    if(trayectos)return trayectos;
    trayectos=[[T.vuelaR,T.cazaR,R,95,2.2],[T.vuelaG,T.cazaG,G,120,3.1]].map(([sale,caza,rig,alto,giros])=>{
      const origen=estadoPaquete(poseR(sale),sale).boca;
      const p=rig===G?poseG(caza):poseR(caza),destino=rig.aPantalla(p,rig.cabeza(p).a(rig===G?BOCA_G:BOCA_R));
      return {sale,caza,origen,destino,alto,giros};
    });
    return trayectos;
  }
  function piezaEn(v,t) {
    if(t<v.sale||t>=v.caza)return null;
    const u=fase(t,v.sale,v.caza),x=lerp(v.origen.x,v.destino.x,u),y=lerp(v.origen.y,v.destino.y,u)-4*v.alto*u*(1-u);
    return {x,y,ang:u*2*Math.PI*v.giros,k:suave(clamp(Math.hypot(x-v.destino.x,y-v.destino.y)/12))};
  }
  function chicle(g, x, y, ang) {
    g.save(); g.translate(x, y); g.rotate(ang); g.scale(1.5, 1.5); g.fillStyle = "#ff8cc0"; g.strokeStyle = ROSA_TINTA; g.lineWidth = 1.2;
    g.beginPath(); g.roundRect(-4.5, -3, 9, 6, 2.5); g.fill(); g.stroke();
    g.fillStyle = "rgba(255,255,255,0.8)"; g.fillRect(-3, -2, 3, 1.2); g.restore();
  }
  function vuelos(g,t) {
    for(const v of vuelosChicle()){const p=piezaEn(v,t);if(!p||p.k<.01)continue;
      g.save();g.translate(p.x,p.y);g.scale(p.k,p.k);chicle(g,0,0,p.ang);g.restore();}
  }

  /* =====================================================================================
   * EFECTOS
   * ===================================================================================== */
  // ¡ñam! rayitas en la boca al cazar
  function nam(g, t, q, t0) {
    const k = campana(t, t0 - 0.02, t0 + 0.22); if (k <= 0.01) return;
    g.save(); g.globalAlpha = k; g.strokeStyle = "rgba(255,255,255,0.95)"; g.lineWidth = 2; g.lineCap = "round";
    for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * 0.5, r0 = 10, r1 = 18 + 4 * (1 - k); g.beginPath(); g.moveTo(q.x + Math.cos(a) * r0, q.y + Math.sin(a) * r0); g.lineTo(q.x + Math.cos(a) * r1, q.y + Math.sin(a) * r1); g.stroke(); }
    g.restore();
  }
  // ¡chas! del globo sorbido
  function chas(g, t, q) {
    const k = campana(t, T.rSorbe1 - 0.03, T.rSorbe1 + 0.22); if (k <= 0.01) return;
    g.save(); g.globalAlpha = k; g.strokeStyle = "rgba(255,240,248,0.95)"; g.lineWidth = 2.2; g.lineCap = "round";
    for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3 + 0.4, r0 = 8, r1 = 15 + 10 * (1 - k); g.beginPath(); g.moveTo(q.x + Math.cos(a) * r0, q.y + Math.sin(a) * r0); g.lineTo(q.x + Math.cos(a) * r1, q.y + Math.sin(a) * r1); g.stroke(); }
    g.restore();
  }
  // ¡PAF!: estallido del globo gigante (rayos, jirones que vuelan hacia la cara)
  function paf(g, t, c, r, ancla, wob) {
    const u = t - T.pop; if (u < -0.001 || u > 0.5) return;
    const kr = 1 - fase(u, 0.05, 0.45);
    g.save(); g.lineCap = "round";
    // rayos
    g.strokeStyle = `rgba(255,248,200,${0.95 * kr})`; g.lineWidth = 4;
    for (let i = 0; i < 12; i++) {
      const a = i / 12 * Math.PI * 2 + 0.2, r0 = r * (0.9 + 0.5 * salida(fase(u, 0, 0.3))), r1 = r0 + 22 + 30 * hash(i + 40);
      g.beginPath(); g.moveTo(c.x + Math.cos(a) * r0, c.y + Math.sin(a) * r0); g.lineTo(c.x + Math.cos(a) * r1, c.y + Math.sin(a) * r1); g.stroke();
    }
    // jirones de goma: salen del borde y se van hacia la boca
    const kj = fase(u, 0, 0.16);
    if (kj < 1) for (let i = 0; i < 11; i++) {
      const a = i / 11 * Math.PI * 2 + 0.3 * hash(i + 50);
      const x = lerp(c.x+Math.cos(a)*r*(1+wob),ancla.x,entrada(kj)), y=lerp(c.y+Math.sin(a)*r*(1-wob),ancla.y,entrada(kj));
      const s = (10 + 12 * hash(i + 51)) * (1 - 0.6 * kj);
      g.save(); g.translate(x, y); g.rotate(a + kj * 3); g.globalAlpha = 1 - 0.3 * kj;
      g.fillStyle = ROSA; g.strokeStyle = ROSA_TINTA; g.lineWidth = 1.2;
      g.beginPath(); g.moveTo(-s, 0); g.quadraticCurveTo(-s * 0.2, -s * 0.6, s, -s * 0.2); g.quadraticCurveTo(s * 0.3, s * 0.5, -s, 0); g.fill(); g.stroke();
      g.restore();
    }
    // el fogonazo blanco del borde (rampa corta)
    const kf = campana(u, 0, 0.12);
    if (kf > 0) { g.strokeStyle = `rgba(255,255,255,${0.8 * kf})`; g.lineWidth = 10 * kf; g.beginPath(); g.arc(c.x, c.y, r * (1 + 0.15 * u), 0, Math.PI * 2); g.stroke(); }
    g.restore();
  }
  // el globito final: crece y le explota en la nariz
  const MANCHA_NARIZ=P(884,700);
  function globitoEn(t,pG) {
    const r=11*tramo(t,T.gGlobito0,T.gGlobitoPop-.04,salida),ancla=retratoAPant(pG,BOCA_G),n=retratoAPant(pG,MANCHA_NARIZ);
    const dx=n.x-ancla.x,dy=n.y-ancla.y,l=Math.hypot(dx,dy),k=(l-11)*r/(11*(l||1));
    return {r,ancla,n,c:P(ancla.x+dx*k,ancla.y+dy*k)};
  }
  function globito(g, t, pG) {
    const {r,ancla,c,n}=globitoEn(t,pG);
    if (t < T.gGlobitoPop && r > 0.5) globo(g, c, r, ancla);
    const u = t - T.gGlobitoPop;
    if (u >= 0 && u < 0.3) {
      const k = 1 - fase(u, 0.05, 0.3);
      g.save(); g.strokeStyle = `rgba(255,240,248,${k})`; g.lineWidth = 1.8; g.lineCap = "round";
      for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3, r0 = 8 + 10 * u, r1 = r0 + 7; g.beginPath(); g.moveTo(n.x + Math.cos(a) * r0, n.y + Math.sin(a) * r0); g.lineTo(n.x + Math.cos(a) * r1, n.y + Math.sin(a) * r1); g.stroke(); }
      g.restore();
    }
  }
  // «mmf»: ondas que salen de la boca tapada
  function mmf(g, t, pG) {
    const k = dentro(t, T.cae1, T.cae1 + 0.1, T.gCiego1 - 0.2, T.gCiego1); if (k <= 0.01) return;
    const b = retratoAPant(pG, P(880, 760));
    g.save(); g.lineCap = "round"; g.strokeStyle = "rgba(255,255,255,0.9)"; g.lineWidth = 2;
    for (let i = 0; i < 3; i++) { const ph = ((t - T.cae1) * 1.8 + i / 3) % 1; g.globalAlpha = k * Math.sin(Math.PI * ph);
      g.beginPath(); g.arc(b.x + 6 + ph * 22, b.y, 6 + ph * 10, -0.7, 0.7); g.stroke(); }
    g.restore();
  }
  // polvo al aterrizar
  let zapatosCaida;
  function polvo(g,t) {
    const u=t-T.cae1;if(u<=0||u>.7)return;
    if(!zapatosCaida){const p=poseG(T.cae1);zapatosCaida=["cerca","lejos"].map(l=>apoyoPunta(G,p,l));}
    g.save();
    for(let i=0;i<8;i++){
      const q=zapatosCaida[i%2],sg=i%2?1:-1,k=salida(fase(u,0,.5)),d=38*k*(.6+.6*hash(i+90));
      const r=(5+9*k)*tramo(u,0,.07);
      g.fillStyle="rgba(240,226,214,"+(.6*(1-fase(u,.2,.7)))+")";g.beginPath();
      g.arc(q.x+sg*d,q.y-r-10*k*hash(i+3),r,0,Math.PI*2);g.fill();
    }
    g.restore();
  }
  // rayitas de equilibrio (flotando) y de esfuerzo
  function esfuerzo(g, t, pG) {
    const k = dentro(t, T.gSopla0 + 0.4, T.gSopla0 + 0.6, T.gDespega - 0.2, T.gDespega); if (k <= 0.01) return;
    const c = retratoAPant(pG, P(760, 520));
    g.save(); g.strokeStyle = `rgba(255,255,255,${0.85 * k})`; g.lineWidth = 2.2; g.lineCap = "round";
    for (let i = 0; i < 5; i++) { const a = -Math.PI * 0.95 + i / 4 * Math.PI * 0.75, r0 = 62 + 3 * Math.sin(t * 40 + i), r1 = r0 + 11;
      g.beginPath(); g.moveTo(c.x + Math.cos(a) * r0, c.y + Math.sin(a) * r0); g.lineTo(c.x + Math.cos(a) * r1, c.y + Math.sin(a) * r1); g.stroke(); }
    g.restore();
  }
  // sombras en la acera
  function sombras(g, pG, pR, t) {
    g.save(); g.fillStyle = "rgba(90,60,70,0.22)";
    const sub = despegue(t).sube;
    g.beginPath(); g.ellipse(XG + 8, SUELO + 2, 44 * (1 - sub / 90), 7 * (1 - sub / 90), 0, 0, Math.PI * 2); g.fill();
    const rx = (pieR(t, "cerca").x + pieR(t, "lejos").x) / 2;
    g.beginPath(); g.ellipse(rx - 4, SUELO + 2, 46, 7, 0, 0, Math.PI * 2); g.fill();
    g.restore(); void pG; void pR;
  }

  /* =====================================================================================
   * DECORADO: la tienda de chucherías por la tarde
   * ===================================================================================== */
  const ACERA = 470;
  const VENT = { x0: 120, x1: 758, y0: 176, y1: 404 };
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W + 120; c.height = H + 100; const g = c.getContext("2d");
    g.translate(60, 50); g.lineJoin = "round"; g.lineCap = "round";
    // fachada verde menta con luz de tarde
    const gf = g.createLinearGradient(0, -50, 0, ACERA); gf.addColorStop(0, "#9fd8c2"); gf.addColorStop(1, "#c3ead9");
    g.fillStyle = gf; g.fillRect(-60, -50, W + 120, ACERA + 50);
    // tablillas verticales suaves
    for (let x = -60; x < W + 60; x += 22) { g.fillStyle = "rgba(255,255,255,0.12)"; g.fillRect(x, -50, 2, ACERA + 50); g.fillStyle = "rgba(40,110,90,0.07)"; g.fillRect(x + 11, -50, 1, ACERA + 50); }
    // cornisa de arriba
    g.fillStyle = "#fff4e2"; g.fillRect(-60, -50, W + 120, 42); g.fillStyle = "#f2c6d8"; g.fillRect(-60, -10, W + 120, 10);
    for (let x = -50; x < W + 60; x += 34) { g.fillStyle = "#e7b3c8"; g.beginPath(); g.arc(x, 0, 9, 0, Math.PI); g.fill(); }
    // escaparate: marco crema, interior cálido con baldas de tarros
    escaparate(g);
    // puerta rosa con ojo de buey (derecha)
    puerta(g, 812, 150);
    // zócalo de la fachada
    g.fillStyle = "#f2c6d8"; g.fillRect(-60, ACERA - 40, W + 120, 40); g.fillStyle = "rgba(255,255,255,0.4)"; g.fillRect(-60, ACERA - 40, W + 120, 3);
    g.fillStyle = "rgba(160,60,100,0.25)"; g.fillRect(-60, ACERA - 4, W + 120, 4);
    // toldo de rayas con festón
    toldo(g);
    // cartel de piruleta colgado (sin letras)
    piruletaCartel(g, 985, 92);
    // acera: losas claras en perspectiva y bordillo
    const ga = g.createLinearGradient(0, ACERA, 0, H + 50); ga.addColorStop(0, "#efdcd0"); ga.addColorStop(1, "#e2c7b8");
    g.fillStyle = ga; g.fillRect(-60, ACERA, W + 120, H + 50 - ACERA);
    g.save(); g.beginPath(); g.rect(-60, ACERA, W + 120, H + 50 - ACERA); g.clip();
    g.strokeStyle = "rgba(150,110,100,0.35)"; g.lineWidth = 1.5;
    const fx = 512, fy = 300;
    for (let i = -30; i <= 30; i++) { g.beginPath(); g.moveTo(fx + i * 90 * 0.35, ACERA); g.lineTo(fx + i * 90 * 1.6, H + 60); g.stroke(); }
    for (const y of [ACERA + 22, ACERA + 54, ACERA + 98, ACERA + 158]) { g.beginPath(); g.moveTo(-60, y); g.lineTo(W + 60, y); g.stroke(); }
    g.restore();
    // luz de la tarde (cálida, desde la izquierda) y sombra del toldo
    const lz = g.createLinearGradient(-60, 0, W + 60, 0); lz.addColorStop(0, "rgba(255,214,150,0.22)"); lz.addColorStop(0.6, "rgba(255,214,150,0.05)"); lz.addColorStop(1, "rgba(120,80,140,0.08)");
    g.fillStyle = lz; g.fillRect(-60, -50, W + 120, H + 100);
    // máquina de chicles de bola (izquierda) y banco (derecha)
    maquinaChicles(g, 168, ACERA + 66);
    banco(g, 930, ACERA + 54);
    maceta(g, 770, ACERA + 6);
    // viñeta suave
    const vg = g.createRadialGradient(512, 300, 300, 512, 300, 780); vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(40,20,40,0.35)");
    g.fillStyle = vg; g.fillRect(-60, -50, W + 120, H + 100);
    return c;
  }
  function toldo(g) {
    const y0 = 116, y1 = 168, x0 = VENT.x0 - 30, x1 = VENT.x1 + 30, n = 14, w = (x1 - x0) / n;
    g.save();
    g.fillStyle = "rgba(60,90,80,0.18)"; g.fillRect(x0, y1, x1 - x0, 30);
    for (let i = 0; i < n; i++) {
      g.fillStyle = i % 2 ? "#ffffff" : "#ff86b6";
      g.beginPath(); g.moveTo(x0 + i * w + 6, y0); g.lineTo(x0 + (i + 1) * w + 6, y0); g.lineTo(x0 + (i + 1) * w, y1); g.lineTo(x0 + i * w, y1); g.closePath(); g.fill();
      g.beginPath(); g.arc(x0 + i * w + w / 2, y1, w / 2, 0, Math.PI); g.fill();
    }
    g.strokeStyle = "#b33c74"; g.lineWidth = 2.5;
    g.beginPath(); g.moveTo(x0 + 6, y0); g.lineTo(x1 + 6, y0); g.lineTo(x1, y1);
    for (let i = n - 1; i >= 0; i--) g.arc(x0 + i * w + w / 2, y1, w / 2, 0, Math.PI, false);
    g.lineTo(x0 + 6, y0); g.stroke();
    g.fillStyle = "#b33c74"; g.fillRect(x0 - 4, y0 - 8, x1 - x0 + 16, 9);
    g.fillStyle = "rgba(255,255,255,0.35)"; g.fillRect(x0 - 4, y0 - 8, x1 - x0 + 16, 2);
    g.restore();
  }
  function escaparate(g) {
    const { x0, x1, y0, y1 } = VENT;
    g.save();
    g.fillStyle = "#fff4e2"; g.fillRect(x0 - 14, y0 - 10, x1 - x0 + 28, y1 - y0 + 40);
    const gi = g.createLinearGradient(0, y0, 0, y1); gi.addColorStop(0, "#fff0c8"); gi.addColorStop(1, "#ffd9b0");
    g.fillStyle = gi; g.fillRect(x0, y0, x1 - x0, y1 - y0);
    g.beginPath(); g.rect(x0, y0, x1 - x0, y1 - y0); g.clip();
    // pared del fondo de la tienda: papel de rayas
    for (let x = x0; x < x1; x += 26) { g.fillStyle = "rgba(255,170,200,0.25)"; g.fillRect(x, y0, 12, y1 - y0); }
    // baldas con tarros
    const baldas = [y0 + 76, y0 + 150, y1 - 6];
    const cols = ["#ff5d8f", "#ffd23f", "#3fc1c9", "#8cd867", "#b28dff", "#ff9f43", "#ff7eb6", "#5ab9ea"];
    let n = 0;
    for (const yb of baldas) {
      g.fillStyle = "#c98b5e"; g.fillRect(x0, yb, x1 - x0, 7); g.fillStyle = "rgba(255,255,255,0.35)"; g.fillRect(x0, yb, x1 - x0, 2);
      for (let x = x0 + 26; x < x1 - 20; x += 54) {
        n++; const h = 46 + 12 * hash(n + 3), w = 34 + 8 * hash(n + 7), c = cols[n % cols.length], c2 = cols[(n + 3) % cols.length];
        if (n % 5 === 2) { // piruletas en un vaso
          g.fillStyle = "rgba(220,240,255,0.6)"; g.fillRect(x - 10, yb - 26, 22, 26);
          for (let k = 0; k < 3; k++) { const px = x - 8 + k * 9, py = yb - 50 - 6 * k; g.strokeStyle = "#ffffff"; g.lineWidth = 2; g.beginPath(); g.moveTo(px, yb - 6); g.lineTo(px, py); g.stroke();
            g.fillStyle = cols[(n + k) % cols.length]; g.beginPath(); g.arc(px, py, 9, 0, Math.PI * 2); g.fill(); g.strokeStyle = "rgba(255,255,255,0.8)"; g.lineWidth = 2; g.beginPath(); g.arc(px, py, 5, 0.5, 4.5); g.stroke(); }
          continue;
        }
        // tarro de cristal con caramelos
        g.save(); g.beginPath(); g.roundRect(x - w / 2, yb - h, w, h, 8); g.clip();
        g.fillStyle = "rgba(230,245,255,0.45)"; g.fillRect(x - w / 2, yb - h, w, h);
        for (let k = 0; k < 22; k++) { g.fillStyle = k % 2 ? c : c2; g.beginPath(); g.arc(x - w / 2 + 5 + (w - 10) * hash(n * 31 + k), yb - 4 - (h - 16) * hash(n * 17 + k * 3) * 0.85, 4.5, 0, Math.PI * 2); g.fill(); }
        g.restore();
        g.strokeStyle = "rgba(90,120,140,0.6)"; g.lineWidth = 1.5; g.beginPath(); g.roundRect(x - w / 2, yb - h, w, h, 8); g.stroke();
        g.fillStyle = c; g.beginPath(); g.roundRect(x - w / 2 - 2, yb - h - 8, w + 4, 9, 3); g.fill();
        g.fillStyle = "rgba(255,255,255,0.6)"; g.fillRect(x - w / 2 + 4, yb - h + 6, 3, h - 14);
      }
    }
    // bastones de caramelo cruzados en la esquina
    for (const [x, a] of [[x1 - 40, -0.25], [x1 - 26, 0.2]]) { g.save(); g.translate(x, y0 + 64); g.rotate(a); g.lineCap = "round";
      g.strokeStyle = "#ffffff"; g.lineWidth = 8; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -40); g.arc(-10, -40, 10, 0, Math.PI, true); g.stroke();
      g.strokeStyle = "#e8324d"; g.lineWidth = 8; g.setLineDash([6, 7]); g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -40); g.arc(-10, -40, 10, 0, Math.PI, true); g.stroke(); g.setLineDash([]); g.restore(); }
    // reflejos del cristal
    g.fillStyle = "rgba(255,255,255,0.22)";
    for (const [x, w] of [[x0 + 60, 50], [x0 + 140, 18], [x0 + 380, 70], [x0 + 470, 22]]) { g.beginPath(); g.moveTo(x, y1); g.lineTo(x + w, y1); g.lineTo(x + w + 120, y0); g.lineTo(x + 120, y0); g.closePath(); g.fill(); }
    g.restore();
    // marco y travesaño
    g.strokeStyle = "#fff4e2"; g.lineWidth = 10; g.strokeRect(x0, y0, x1 - x0, y1 - y0);
    g.fillStyle = "#fff4e2"; g.fillRect((x0 + x1) / 2 - 5, y0, 10, y1 - y0);
    g.strokeStyle = "rgba(120,80,90,0.35)"; g.lineWidth = 2; g.strokeRect(x0 - 5, y0 - 5, x1 - x0 + 10, y1 - y0 + 10);
    // alféizar
    g.fillStyle = "#f7e6cf"; g.fillRect(x0 - 18, y1 + 5, x1 - x0 + 36, 12); g.fillStyle = "rgba(120,80,60,0.25)"; g.fillRect(x0 - 18, y1 + 15, x1 - x0 + 36, 3);
  }
  function puerta(g, x, y) {
    const w = 120, h = ACERA - 40 - y;
    g.save();
    g.fillStyle = "#fff4e2"; g.fillRect(x - 12, y - 14, w + 24, h + 14);
    // marco de bastón de caramelo
    g.save(); g.beginPath(); g.rect(x - 12, y - 14, w + 24, h + 14); g.rect(x, y, w, h); g.clip("evenodd");
    for (let i = -20; i < 40; i++) { g.strokeStyle = i % 2 ? "#ff86b6" : "#ffffff"; g.lineWidth = 9; g.beginPath(); g.moveTo(x - 20 + i * 9, y - 20); g.lineTo(x - 20 + i * 9 + 60, y + h + 20); g.stroke(); }
    g.restore();
    const gd = g.createLinearGradient(x, y, x + w, y + h); gd.addColorStop(0, "#ff9fc4"); gd.addColorStop(1, "#f06ea4");
    g.fillStyle = gd; g.fillRect(x, y, w, h);
    g.strokeStyle = "rgba(150,40,90,0.35)"; g.lineWidth = 3; g.strokeRect(x + 14, y + 130, w - 28, h - 150);
    // ojo de buey
    g.fillStyle = "#fff4e2"; g.beginPath(); g.arc(x + w / 2, y + 62, 34, 0, Math.PI * 2); g.fill();
    const gv = g.createLinearGradient(0, y + 30, 0, y + 94); gv.addColorStop(0, "#fff7d6"); gv.addColorStop(1, "#ffd59a");
    g.fillStyle = gv; g.beginPath(); g.arc(x + w / 2, y + 62, 27, 0, Math.PI * 2); g.fill();
    g.fillStyle = "rgba(255,255,255,0.5)"; g.beginPath(); g.ellipse(x + w / 2 - 9, y + 52, 9, 4, -0.6, 0, Math.PI * 2); g.fill();
    // pomo
    g.fillStyle = "#ffd23f"; g.beginPath(); g.arc(x + w - 18, y + h / 2 + 30, 6, 0, Math.PI * 2); g.fill(); g.strokeStyle = "rgba(120,80,20,0.6)"; g.lineWidth = 1.5; g.stroke();
    g.restore();
  }
  function piruletaCartel(g, x, y) {
    g.save(); g.lineCap = "round";
    g.strokeStyle = "#6b5560"; g.lineWidth = 5; g.beginPath(); g.moveTo(x + 60, y - 30); g.lineTo(x - 10, y - 30); g.stroke();
    g.lineWidth = 2; g.beginPath(); g.moveTo(x - 4, y - 30); g.lineTo(x - 4, y - 12); g.moveTo(x + 4, y - 30); g.lineTo(x + 4, y - 12); g.stroke();
    g.strokeStyle = "#ffffff"; g.lineWidth = 8; g.beginPath(); g.moveTo(x, y + 30); g.lineTo(x, y + 84); g.stroke();
    g.fillStyle = "#ff86b6"; g.beginPath(); g.arc(x, y + 10, 34, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "#ffffff"; g.lineWidth = 7; g.beginPath();
    for (let k = 0; k <= 60; k++) { const a = k / 60 * Math.PI * 5, r = 2 + k / 60 * 28; const px = x + Math.cos(a) * r, py = y + 10 + Math.sin(a) * r; k ? g.lineTo(px, py) : g.moveTo(px, py); } g.stroke();
    g.strokeStyle = "#b33c74"; g.lineWidth = 2.5; g.beginPath(); g.arc(x, y + 10, 34, 0, Math.PI * 2); g.stroke();
    g.restore();
  }
  function maquinaChicles(g, x, y) {
    g.save(); g.lineJoin = "round";
    // pie
    g.fillStyle = "#c62a3f"; g.beginPath(); g.moveTo(x - 30, y); g.lineTo(x + 30, y); g.lineTo(x + 16, y - 16); g.lineTo(x - 16, y - 16); g.closePath(); g.fill();
    g.fillRect(x - 6, y - 110, 12, 96);
    // cuerpo
    g.beginPath(); g.moveTo(x - 30, y - 110); g.lineTo(x + 30, y - 110); g.lineTo(x + 24, y - 160); g.lineTo(x - 24, y - 160); g.closePath(); g.fill();
    g.fillStyle = "#d9dde4"; g.beginPath(); g.roundRect(x - 13, y - 150, 26, 26, 4); g.fill(); g.fillStyle = "#9aa3ad"; g.beginPath(); g.arc(x, y - 137, 6, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#9aa3ad"; g.fillRect(x - 8, y - 120, 16, 7);
    // globo de cristal con chicles de bola
    const cy = y - 200, r = 42;
    g.save(); g.beginPath(); g.arc(x, cy, r, 0, Math.PI * 2); g.clip();
    g.fillStyle = "rgba(225,245,255,0.6)"; g.fillRect(x - r, cy - r, 2 * r, 2 * r);
    const cols = ["#ff5d8f", "#ffd23f", "#3fc1c9", "#8cd867", "#b28dff", "#ff9f43", "#ffffff"];
    for (let i = 0; i < 70; i++) { const a = hash(i + 200) * Math.PI * 2, d = Math.sqrt(hash(i + 300)) * r, px = x + Math.cos(a) * d, py = cy + 10 + Math.abs(Math.sin(a)) * d * 0.7 - 6;
      if (py < cy - 14) continue; g.fillStyle = cols[i % cols.length]; g.beginPath(); g.arc(px, py, 7, 0, Math.PI * 2); g.fill(); g.strokeStyle = "rgba(0,0,0,0.15)"; g.lineWidth = 1; g.stroke(); }
    g.restore();
    g.strokeStyle = "rgba(80,100,120,0.6)"; g.lineWidth = 2; g.beginPath(); g.arc(x, cy, r, 0, Math.PI * 2); g.stroke();
    g.fillStyle = "rgba(255,255,255,0.7)"; g.beginPath(); g.ellipse(x - 16, cy - 18, 12, 6, -0.7, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#c62a3f"; g.beginPath(); g.ellipse(x, cy - r + 2, 20, 8, 0, 0, Math.PI * 2); g.fill(); g.fillRect(x - 6, cy - r - 12, 12, 10);
    g.beginPath(); g.arc(x, cy - r - 13, 7, 0, Math.PI * 2); g.fill();
    g.restore();
  }
  function banco(g, x, y) {
    g.save(); g.lineJoin = "round";
    g.fillStyle = "#6b4c3b"; g.fillRect(x - 70, y - 58, 8, 58); g.fillRect(x + 62, y - 58, 8, 58);
    for (const yy of [y - 64, y - 54]) { g.fillStyle = "#d98fb0"; g.beginPath(); g.roundRect(x - 84, yy, 168, 8, 3); g.fill(); }
    for (const yy of [y - 110, y - 96, y - 82]) { g.fillStyle = "#e7a5c3"; g.beginPath(); g.roundRect(x - 84, yy, 168, 9, 3); g.fill(); }
    g.fillStyle = "#6b4c3b"; g.fillRect(x - 76, y - 112, 6, 50); g.fillRect(x + 70, y - 112, 6, 50);
    g.restore();
  }
  function maceta(g, x, y) {
    g.save(); g.fillStyle = "#e88a5a"; g.beginPath(); g.moveTo(x - 22, y - 34); g.lineTo(x + 22, y - 34); g.lineTo(x + 16, y); g.lineTo(x - 16, y); g.closePath(); g.fill();
    g.fillStyle = "#c46a42"; g.fillRect(x - 24, y - 38, 48, 7);
    for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i - 3) * 0.32; g.strokeStyle = "#4f9a5a"; g.lineWidth = 3; g.beginPath(); g.moveTo(x, y - 36); g.quadraticCurveTo(x + Math.cos(a) * 20, y - 50, x + Math.cos(a) * 30, y - 36 + Math.sin(a) * 30); g.stroke();
      g.fillStyle = ["#ff86b6", "#ffd23f", "#ffffff"][i % 3]; g.beginPath(); g.arc(x + Math.cos(a) * 30, y - 36 + Math.sin(a) * 30, 5, 0, Math.PI * 2); g.fill(); }
    g.restore();
  }

  /* ---------- cámara ---------- */
  function camara(t) {
    const tir = dentro(t, T.rAnda0, T.rAnda1, T.gCamara - 0.2, T.gCamara + 0.3);
    const fin = tramo(t, T.gCamara - 0.2, T.fin);
    let k = 1.04 + 0.1 * tir + 0.03 * fin, x = 532 - 70 * tir - 20 * fin, y = 318 - 22 * tir - 4 * fin;
    // el globo gigante: un poco más abierto
    const gl = dentro(t, T.gSopla0 + 1, T.gDespega, T.pop + 0.2, T.pop + 0.8);
    k -= 0.04 * gl; y -= 18 * gl;
    const s = muelle(t, T.pop + 0.01, 50, 7) * 3.5 + muelle(t, T.cae1, 48, 9) * 1.5;
    return { k, x: x + s, y: y + s * 0.6 };
  }

  function poses(t) { return { g: poseG(t), r: poseR(t) }; }

  let fondo = null;
  class ElChicle extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !R.listo()) return;
      if (!fondo) fondo = creaFondo();
      const pG = poseG(t); POSE_G = pG;
      const pR = poseR(t);
      const luz = tramo(t, NEGRO_INICIO, 0.8, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t);
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      BASE_M = g.getTransform();
      g.save(); g.translate(-60, -50); g.drawImage(fondo, 0, 0); g.restore();
      sombras(g, pG, pR, t);
      G.dibujar(g, pG, t);
      R.dibujar(g, pR, t);
      // los chicles por el aire y sus ¡ñam!
      vuelos(g, t);
      for(const v of vuelosChicle())nam(g,t,v.destino,v.caza);
      // el globo de Rodri
      const rr = radioR(t);
      if (rr > 0.5) { const { ancla, c } = centroGlobo(R, pR, rr, Math.PI - 0.1, -0.04); globo(g, c, rr, ancla, { wob: 0.02 * Math.sin(t * 6) }); }
      chas(g, t, R.aPantalla(pR, R.cabeza(pR).a(BOCA_R)));
      // el globo gigante de Guillermo
      const b=globoGrande(t,pG);
      if(b.r>.5&&b.alfa>0)globo(g,b.c,b.r,b.ancla,{wob:b.wob,alfa:b.alfa});
      if(t>=T.pop && t<=T.pop+.5){ const fijo=globoAlEstallar();paf(g,t,fijo.c,fijo.r,b.ancla,fijo.wob); }
      esfuerzo(g, t, pG);
      polvo(g, t);
      mmf(g, t, pG);
      globito(g, t, pG);
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }

  registrar({ id: "00119.2", nombre: "Guillermo y Rodri · El chicle (revisión 2)", crear: () => new ElChicle() });
  // diagnóstico: distancia hombro → muñeca / largo del brazo (≤ 1,08 o la mano se despega)
  function diag(t) {
    const out = {};
    for (const [n, Rg, p] of [["g", G, poseG(t)], ["r", R, poseR(t)]]) for (const lado of ["cerca", "lejos"]) {
      const m = lado === "cerca" ? p.manoCerca : p.manoLejos; if (!m) continue;
      const Tr = Rg.tronco(p), h = Tr(lado === "cerca" ? Rg.HOMBRO_C : Rg.HOMBRO), mu = m.mu ?? -1.75;
      const w = { x: m.x + Math.cos(mu) * Rg.MUNECA_R * Rg.JK, y: m.y + Math.sin(mu) * Rg.MUNECA_R * Rg.JK };
      out[n + lado] = Math.hypot(w.x - h.x, w.y - h.y) / (lado === "cerca" ? Rg.BRAZO_C_L : Rg.BRAZO_L);
    }
    return out;
  }
  window.__A2D_00119_2 = { pose: poses, poseG, poseR,T,DUR,diag,vuelosChicle,piezaEn,estadoPaquete,radioR,radioG,globoGrande,globoAlEstallar,centroGlobo,despegue,apoyoPunta,perfilSuela,puntoPinza,retratoAPant,CARETA_PUNTA,globitoEn,solapa,caretaColgando,careta,rayaDespegue,SUELO,BOCA_G,BOCA_R };
})();
