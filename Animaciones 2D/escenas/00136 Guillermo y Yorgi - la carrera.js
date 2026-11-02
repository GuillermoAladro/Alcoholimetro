"use strict";
/* 00136 · Guillermo y Yorgi · La carrera
 *
 * Negro → un paseo peatonal de un pueblo blanco, una tarde de sol: cielo azul con nubes de algodón,
 * sierra y campanario a lo lejos, al otro lado de la calzada casas encaladas y de colores con
 * balcones, persianas verdes y geranios; en el paseo, farolas de hierro, naranjos en sus alcorques,
 * un banco y, al fondo, el bar: un quiosco encalado con zócalo de azulejos, tejado de teja, ventanas
 * con jamones colgados, el cartel de la jarra, la máquina del alcoholímetro y la puerta verde con su
 * campanilla. En el suelo, dibujos de tiza: la salida escalonada (una marca en cada calle), las calles,
 * una rayuela y, delante de la puerta, la meta a cuadros. A Guillermo le han atado los cordones: un cordón corto une sus dos
 * zapatillas desde el principio.
 * Preparados (el semáforo de la salida en rojo): Yorgi calienta dando botecitos y sacudiendo las
 * manos; Guillermo le copia, con los pies juntos. Listos (ámbar): Yorgi se pone en posición de
 * salida de pie, de atleta; Guillermo se agacha con las manos en las rodillas. Se miran de reojo.
 * ¡Ya! (verde, con destello): Yorgi sale disparado, perfecto, con nube de polvo y rayas de velocidad.
 * Guillermo da la primera zancada… el cordón se tensa, ¡tuing!, y se cae de bruces, tieso como una
 * tabla: ¡plaf!, polvo y estrellitas. Levanta la cabeza, se mira los pies, ve el cordón, pone cara de
 * decidido y se levanta de golpe, como un resorte. Y va a la pata coja… con las dos: a saltitos de
 * conejo, pies juntos, con los puños y la lengua fuera; la cámara le sigue por todo el paseo.
 * Yorgi ya está en la puerta del bar: la ha abierto (bisagras a la derecha, la hoja abierta hacia la
 * máquina) y la sujeta por la barra, a la derecha del hueco y de cara a la calle; da golpecitos con el
 * pie y se ríe al verle llegar a saltos. Cuando Guillermo se acerca le hace una reverencia de caballero
 * (mano al corazón) y, al llegar, le indica la puerta con la palma arriba. Guillermo salta al umbral
 * sin pasar por delante de él, le devuelve una reverencia torpe para darle las gracias y se da media
 * vuelta para celebrarlo de cara a la calle (¡sí!, con los puños). Yorgi, con la floritura final, da
 * un pasito y suelta la puerta: se cierra de golpe desde la derecha y le da a Guillermo en el trasero,
 * ¡boing!, y entra en el bar trastabillando. Tilín de la campanilla. Yorgi, tapándose la boca, se parte
 * de risa (la cámara se acerca un poco). La puerta se entreabre y por la rendija (a la izquierda) sale
 * el brazo de Guillermo con el pulgar arriba (antebrazo en horizontal); Yorgi le contesta con otro
 * pulgar, mira a cámara y guiña un ojo → negro.
 *
 * Fondo por capas prerenderizadas con paralaje (cielo, sierra, fachadas, calzada y el paseo con el
 * bar, que va con el suelo). La caída y el resorte giran el muñeco entero alrededor de la punta de la
 * zapatilla que apoya; la media vuelta en el umbral es una escala en x alrededor de su pelvis. Dentro
 * del hueco de la puerta Guillermo se recorta al hueco (el muro le tapa al entrar) y la hoja de la
 * puerta, en perspectiva, se pinta por delante. Sin textos (solo las cifras
 * de la máquina). Todo depende del tiempo `t`.
 */
(() => {
  const { clamp, lerp, fase, suave, salida, entrada, tramo, campana, ruido, hash, rot, rebote } = M2;
  const G = Guillermo, Y = Yorgi;
  const DUR = 14.6, TINTA = "#0b0a0e", TAU = Math.PI * 2;
  const P = (x, y) => ({ x, y });

  /* ---------- escenario (px; x del mundo) ---------- */
  const SG = 0.3, SY = 0.29;                     // escala de cada uno (Guillermo va en el carril de delante)
  const SUELO_G = 556, SUELO_Y = 510;            // carril de Guillermo y de Yorgi
  const FB = 494, HZ = 300;                      // pie de la fachada del bar (umbral) y horizonte de la perspectiva
  const XG0 = 300, XY0 = 525;                    // salida de cada uno (pelvis): salida escalonada, cada uno en su calle
  const XS_G = XG0 + 52, XS_Y = XY0 + 84;         // marcas de salida de tiza (delante, detrás)
  const XSEM = 700;                              // semáforo
  const XL = 1560, WD = 230, XR = XL + WD, FT = 84;   // hueco de la puerta del bar (bisagras a la derecha)
  const XYP = 1920;                              // Yorgi en la puerta: a la derecha del hueco, de cara a la calle
  const CAMF = 1060;                             // cámara al final
  const TH_ABIERTA = 1.78;                       // la puerta, abierta hacia la calle (hacia la derecha)
  const X_UMBRAL = (XL + XR) / 2 - 4, S_UMBRAL = SG * 0.955;   // Guillermo en el umbral (un poco más al fondo)
  const XG_PUERTA = X_UMBRAL + 7;                // último salto de Guillermo, delante de la puerta

  /* ---------- guion (s) ---------- */
  const T = {
    calienta0: 0.42, calienta1: 1.42,
    ambar: 1.5, listos0: 1.56, listos1: 1.98,
    yMira: 2.04, gMira: 2.16, gFrente: 2.38,
    verde: 2.58, ya: 2.62,
    gSale: 2.66, tensa: 2.84, choca: 3.2,
    alza: 3.84, miraPies: 3.98, ve: 4.1, decide: 4.26, sube0: 4.44, sube1: 4.84,
    salto0: 5.3, per: 0.45, aire: 0.3, nSaltos: 10,
    reves0: 8.6, reves1: 8.95, barre0: 9.3, barre1: 9.72,
    entra0: 9.8, entra1: 10.16,
    gracias: 10.18, gira0: 10.4, gira1: 10.58, floritura: 10.56, cierra0: 10.62, cierra1: 10.88, golpe: 10.755,
    rie0: 11.2, rie1: 11.95,
    rendija0: 12.0, rendija1: 12.24, brazo0: 12.2, brazo1: 12.46,
    yVe: 12.28, yPulgar: 12.72, yCamara: 12.98, guino: 13.3, fin: 14.0
  };

  /* ---------- utilidades ---------- */
  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n] ?? a[n], k); return o; };
  function guion(lista, dic, base, t) {
    let c = dic[base];
    for (const [t0, t1, nom, f] of lista) { if (t <= t0) break; c = mezclaE(c, dic[nom], (f || suave)(fase(t, t0, t1))); }
    return Object.assign({}, c);
  }
  const parpadeo = (t, lista, d = 0.14) => { let o = 0; for (const tb of lista) { const k = fase(t, tb, tb + d); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); } return o; };
  const D5 = (pu, ix, md, an, me) => ({ pulgar: pu, indice: ix, medio: md, anular: an, menique: me });
  const TODOS = k => D5(k, k, k, k, k);
  const PUNO = TODOS(0), SENALA = D5(0, 1, 0, 0, 0), PULGAR = D5(1, 0, 0, 0, 0), AGARRA = TODOS(0.3), ABIERTA = D5(0.8, 1, 1, 1, 1), FLOJA = TODOS(0.55);
  const DD = (a, b, k) => ({ pulgar: lerp(a.pulgar, b.pulgar, k), indice: lerp(a.indice, b.indice, k), medio: lerp(a.medio, b.medio, k),
    anular: lerp(a.anular, b.anular, k), menique: lerp(a.menique, b.menique, k) });

  const BASE = { mx: 0.5, my: 0, c: 0, cd: 0, ci: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, abre: 0, ancho: 1, sonr: 0.15, lengua: 0, mof: 0, rub: 0, esp: 0, wd: 0, wi: 0 };
  const E = o => Object.assign({}, BASE, o);
  function cara(e, parp) {
    return { mirada: { x: e.mx, y: e.my }, iris: e.iris, espiral: e.esp,
      ojos: { d: clamp(Math.max(e.c, e.cd, parp) + e.wd), i: clamp(Math.max(e.c, e.ci, parp) + e.wi), feliz: e.h, apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: 0, abre: Math.max(0, e.abre), ancho: e.ancho, sonrisa: e.sonr, dientes: true, lengua: e.lengua },
      mofletes: e.mof, rubor: e.rub, bigote: 0 };
  }
  /* Curva por claves [t, v1, v2, …] (Hermite con tangentes de Catmull-Rom; quieta en los extremos). */
  function curva(claves, t) {
    const n = claves.length;
    if (t <= claves[0][0]) return claves[0].slice(1);
    if (t >= claves[n - 1][0]) return claves[n - 1].slice(1);
    let i = 0; while (claves[i + 1][0] < t) i++;
    const k0 = claves[Math.max(0, i - 1)], k1 = claves[i], k2 = claves[i + 1], k3 = claves[Math.min(n - 1, i + 2)];
    const h = k2[0] - k1[0], u = (t - k1[0]) / h, u2 = u * u, u3 = u2 * u, out = [];
    for (let j = 1; j < k1.length; j++) {
      const m1 = i > 0 ? (k2[j] - k0[j]) / (k2[0] - k0[0]) * h : 0, m2 = i + 2 < n ? (k3[j] - k1[j]) / (k3[0] - k1[0]) * h : 0;
      out.push((2 * u3 - 3 * u2 + 1) * k1[j] + (u3 - 2 * u2 + u) * m1 + (-2 * u3 + 3 * u2) * k2[j] + (u3 - u2) * m2);
    }
    return out;
  }
  const MEMO = new Map();
  const memo = (c, f) => { if (MEMO.has(c)) return MEMO.get(c); if (MEMO.size > 120) MEMO.clear(); const v = f(); MEMO.set(c, v); return v; };
  const lienzo = (w, h) => { const c = document.createElement("canvas"); c.width = w; c.height = h; return [c, c.getContext("2d")]; };

  // bolsillos de Guillermo (muñecas del avatar → centro del puño), como en 00122
  const R_M = G.MUNECA_R * G.JK;
  const manoDesde = (m, mu) => P(m.x - Math.cos(mu) * R_M, m.y - Math.sin(mu) * R_M);
  const BOLS_GC = manoDesde(P(131, 652), -1.75), BOLS_GL = manoDesde(P(372, 648), -1.75);

  /* ---------- manos ----------
   * { h: [x, y] } punto del tronco (hoja, sin inclinar) con mu relativo al tronco, { scr: () => punto del
   * mundo } con mu absoluto, o { bols: true }. mu: dirección de la mano a la muñeca. */
  function resolutor(R, p, lado) {
    const Tr = R.tronco(p);
    return o => {
      if (o.bols) {
        if (R.manoReposo) { const m = R.manoReposo(p, lado); return { x: m.x, y: m.y, mu: m.mu, ang: 0, puno: 0, dedos: TODOS(0.4), dobla: lado === "cerca" ? -1 : 1, detras: o.detras }; }
        const m = Tr(lado === "cerca" ? BOLS_GC : BOLS_GL);
        return { x: m.x, y: m.y, mu: -1.75 + p.torso, ang: 0, puno: 0, dedos: TODOS(0.4), dobla: lado === "cerca" ? -1 : 1 };
      }
      if (o.scr) { const h = R.aHoja(p, o.scr()); return { x: h.x, y: h.y, mu: o.mu, ang: 0, puno: 1, dedos: o.dedos, dobla: o.dobla ?? (lado === "cerca" ? -1 : 1), detras: o.detras }; }
      const q = Tr(P(o.h[0], o.h[1]));
      return { x: q.x, y: q.y, mu: o.mu + p.torso, ang: 0, puno: o.puno ?? 1, dedos: o.dedos, dobla: o.dobla ?? (lado === "cerca" ? -1 : 1), detras: o.detras };
    };
  }
  const mezMano = (a, d, k) => ({ x: lerp(a.x, d.x, k), y: lerp(a.y, d.y, k), mu: lerp(a.mu, d.mu, k), ang: 0, puno: lerp(a.puno, d.puno, k),
    dedos: DD(a.dedos, d.dedos, k), dobla: k >= 0.5 ? d.dobla : a.dobla, detras: k >= 0.5 ? d.detras : a.detras });
  function pista(lista, t, res) {
    let c = res(lista[0][2]);
    for (let i = 1; i < lista.length; i++) {
      const [t0, t1, obj, f] = lista[i];
      if (t <= t0) break;
      c = mezMano(c, res(obj), (f || suave)(fase(t, t0, t1)));
    }
    return c;
  }
  const HM = (x, y, mu, dedos, dobla, detras) => ({ h: [x, y], mu, dedos, dobla, detras });
  const conMano = (m, dx, dy, dmu = 0) => Object.assign({}, m, { x: m.x + dx, y: m.y + dy, mu: m.mu + dmu });

  /* ---------- piernas ---------- */
  // tobillo (hoja) para un punto del pie (ref, en la hoja respecto al tobillo) apoyado en q (mundo) con giro a (+ = talón arriba)
  function pieEn(R, p, q, ref, a) {
    const h = R.aHoja(p, q), o = rot(ref, a);
    return { tob: P(h.x - o.x, h.y - o.y), ang: a };
  }
  const tobDe = (R, p, x, suelo, h, a) => { const q = R.aHoja(p, P(x, suelo - h)); return { tob: P(q.x, q.y - R.TOBILLO_ALTO), ang: a }; };
  /* Pie dado por X (x del tobillo si el pie estuviera plano en el suelo), h (altura del punto de
   * referencia), a (giro, + = talón arriba) y q (punto de referencia: 0 punta, 1 talón). Con a = 0 y h = 0
   * da lo mismo para cualquier q: así se pasa de apoyar en la punta a apoyar en el talón sin saltos. */
  const REF = R => ({ punta: P(R.PUNTA.x, R.TOBILLO_ALTO), talon: P(R.TALON.x, R.TOBILLO_ALTO) });
  const REF_G = REF(G), REF_Y = REF(Y);
  function pieRef(R, p, X, suelo, h, a, q) {
    const rf = R === G ? REF_G : REF_Y, ref = P(lerp(rf.punta.x, rf.talon.x, q), rf.punta.y);
    return pieEn(R, p, P(X + ref.x * p.s * R.K * (p.espejo ? -1 : 1), suelo - h), ref, a);
  }
  const qSuelo = a => a >= 0 ? 0 : 1;
  function agacha(R, p, L, marg = 0.985) {
    const Tr = R.tronco(p), m = L * marg; let d = 0;
    for (const lado of ["cerca", "lejos"]) {
      const c = Tr(R.CADERA[lado]), a = p.piernas[lado].tob, dx = a.x - c.x;
      const yN = Math.abs(dx) < m ? a.y - Math.sqrt(m * m - dx * dx) : a.y;
      d = Math.max(d, yN - c.y);
    }
    if (d > 0) p.pelvis.y += d;
    return d;
  }
  const PIERNA_G = 540, PIERNA_Y = 559;
  // altura de la pelvis sobre el suelo (pantalla) de pie
  const ALTO_PEL = (R, s) => (R.SUELO - R.PELVIS.y) * s * R.K;
  // pasos sueltos [t0, t1, xDestino, alto] (de 00071)
  const ANG_PASO = u => 0.28 * Math.sin(Math.PI * u) - 0.05 * Math.sin(2 * Math.PI * u);
  function pieLista(lista, x0, t) {
    let x = x0;
    for (const [a, b, xd, alto] of lista) {
      if (t < a) break;
      const u = fase(t, a, b);
      if (u < 1) return { x: lerp(x, xd, suave(u)), h: alto * Math.sin(Math.PI * u), a: ANG_PASO(u), u };
      x = xd;
    }
    return { x, h: 0, a: 0, u: 1 };
  }
  function nuevaP(R, x, suelo, s, extra) {
    return Object.assign({ x, suelo, s, espejo: false, tirasLimpias: true, torso: 0, torsoEsc: { x: 1, y: 1 }, piernas: {},
      cabeza: { ang: 0, dx: 0, dy: 0, esc: { x: 1, y: 1 } }, pelvis: { x: R.PELVIS.x, y: R.PELVIS.y } }, extra || {});
  }
  // pelvis a una altura de pantalla (y de la pelvis) sobre su x
  const ponPelvis = (R, p, yPant) => { const q = R.aHoja(p, P(p.x, yPant)); p.pelvis = { x: R.PELVIS.x, y: q.y }; };
  // rodilla (hoja) a partir de cadera y tobillo (la rodilla sale hacia delante)
  function rodilla(R, p, lado, L) {
    const c = R.tronco(p)(R.CADERA[lado]), a = p.piernas[lado].tob, dx = a.x - c.x, dy = a.y - c.y, d = Math.hypot(dx, dy);
    const h = Math.sqrt(Math.max(0, (L / 2) * (L / 2) - (d / 2) * (d / 2)));
    return P((c.x + a.x) / 2 + dy / d * h, (c.y + a.y) / 2 - dx / d * h);
  }

  /* =====================================================================================
   * LA PUERTA DEL BAR (bisagra a la izquierda; se abre hacia la calle)
   * ===================================================================================== */
  const proy = (y, dz) => HZ + (y - HZ) * (1 + dz / 330);
  function thPuerta(t) {
    // ya está abierta cuando la vemos (Yorgi la abrió al llegar, fuera de cuadro)
    let th = TH_ABIERTA * tramo(t, 5.4, 6.1);
    // la suelta: se cierra de golpe (muelle) y rebota en el marco
    const k = fase(t, T.cierra0, T.cierra1);
    if (k > 0) th = TH_ABIERTA * (1 - k * k);
    const tb = t - T.cierra1;
    if (tb > 0) th = 0.075 * Math.exp(-tb * 7) * Math.abs(Math.sin(tb * 24));
    // la rendija: Guillermo la entreabre desde dentro
    const kr = tramo(t, T.rendija0, T.rendija1, salida);
    if (kr > 0) th += 0.34 * kr + 0.012 * Math.sin((t - T.rendija1) * 9) * tramo(t, T.rendija1, T.rendija1 + 0.2);
    return th;
  }
  function hojaPuerta(th) {
    const dz = WD * Math.sin(th) * 0.16, xF = XR - WD * Math.cos(th);
    return { th, dz, xF, ftop: proy(FT, dz), fbot: proy(FB, dz) };
  }
  const bilP = (Hj, u, v) => {
    const top = lerp(FT, Hj.ftop, u), bot = lerp(FB, Hj.fbot, u);
    return P(lerp(XR, Hj.xF, u), lerp(top, bot, v));
  };
  function dibHoja(g, Hj) {
    if (Hj.th < 0.004 && Hj.th >= 0) { dibHojaPlana(g, Hj); return; }
    const A = P(XR, FT), B = P(XR, FB), C = P(Hj.xF, Hj.fbot), D = P(Hj.xF, Hj.ftop);
    const bil = (u, v) => bilP(Hj, u, v);
    const quad = q => { g.beginPath(); q.forEach((z, i) => i ? g.lineTo(z.x, z.y) : g.moveTo(z.x, z.y)); g.closePath(); };
    g.save(); g.lineJoin = "round";
    // canto en el lado libre (se ve cuando la hoja sale hacia la calle)
    const gr = 7 * clamp(Math.abs(Math.sin(Hj.th)) * 5) * (Hj.xF >= XR ? 1 : -1);
    if (Math.abs(gr) > 0.3) {
      g.beginPath(); g.moveTo(D.x, D.y); g.lineTo(D.x + gr, D.y + 1); g.lineTo(C.x + gr, C.y + 1); g.lineTo(C.x, C.y); g.closePath();
      g.fillStyle = "#1f4636"; g.fill(); g.lineWidth = 2.5; g.strokeStyle = TINTA; g.stroke();
    }
    quad([A, B, C, D]);
    const gg = g.createLinearGradient(A.x, 0, D.x, 0); gg.addColorStop(0, "#2a5f48"); gg.addColorStop(1, "#3f7d61");
    g.fillStyle = gg; g.fill(); g.lineWidth = 3; g.strokeStyle = TINTA; g.stroke();
    // cristal arriba (con el reflejo del cielo) y cuarterón abajo
    quad([bil(0.14, 0.07), bil(0.86, 0.07), bil(0.86, 0.5), bil(0.14, 0.5)]);
    const gc = g.createLinearGradient(0, Hj.ftop, 0, (Hj.ftop + Hj.fbot) / 2); gc.addColorStop(0, "#cfe8f2"); gc.addColorStop(1, "#8fb8c8");
    g.fillStyle = gc; g.fill(); g.lineWidth = 2.5; g.stroke();
    g.save(); quad([bil(0.14, 0.07), bil(0.86, 0.07), bil(0.86, 0.5), bil(0.14, 0.5)]); g.clip();
    g.strokeStyle = "rgba(255,255,255,0.65)"; g.lineWidth = 9;
    const r1 = bil(0.3, 0.1), r2 = bil(0.6, 0.45); g.beginPath(); g.moveTo(r1.x, r1.y + 60); g.lineTo(r2.x, r2.y - 80); g.stroke();
    g.lineWidth = 4; const r3 = bil(0.5, 0.1), r4 = bil(0.75, 0.4); g.beginPath(); g.moveTo(r3.x, r3.y + 50); g.lineTo(r4.x, r4.y - 40); g.stroke();
    g.restore();
    // cruceta del cristal
    g.strokeStyle = "#2a5f48"; g.lineWidth = 5; const c1 = bil(0.5, 0.07), c2 = bil(0.5, 0.5); g.beginPath(); g.moveTo(c1.x, c1.y); g.lineTo(c2.x, c2.y); g.stroke();
    quad([bil(0.14, 0.58), bil(0.86, 0.58), bil(0.86, 0.9), bil(0.14, 0.9)]);
    g.fillStyle = "rgba(15,45,32,0.35)"; g.fill(); g.lineWidth = 2; g.strokeStyle = "rgba(8,25,18,0.85)"; g.stroke();
    // placa de latón abajo
    quad([bil(0.06, 0.93), bil(0.94, 0.93), bil(0.94, 0.985), bil(0.06, 0.985)]);
    g.fillStyle = "#c99a3a"; g.fill(); g.lineWidth = 1.5; g.strokeStyle = TINTA; g.stroke();
    // barra de latón (asidero) cerca del canto
    const b1 = bil(0.9, 0.34), b2 = bil(0.9, 0.5);
    g.lineCap = "round"; g.strokeStyle = TINTA; g.lineWidth = 8; g.beginPath(); g.moveTo(b1.x, b1.y); g.lineTo(b2.x, b2.y); g.stroke();
    g.strokeStyle = "#e6be5a"; g.lineWidth = 4.5; g.beginPath(); g.moveTo(b1.x, b1.y); g.lineTo(b2.x, b2.y); g.stroke();
    // bisagras
    for (const v of [0.08, 0.5, 0.92]) { const b = bil(0.015, v); g.fillStyle = "#2b2b2b"; g.fillRect(b.x - 2, b.y - 9, 6, 18); }
    g.restore();
  }
  function dibHojaPlana(g, Hj) {
    dibHoja(g, Object.assign({}, Hj, { th: -1e-6 }));
  }

  /* =====================================================================================
   * LA CARRERA DE YORGI
   * ===================================================================================== */
  const VMAX = 1250, TAU_V = 0.24, D_FRENO = 260;
  // posición de salida (tobillos, mundo): la pierna de delante es la lejana
  const PIE_Y0 = { cerca: XY0 - 26, lejos: XY0 + 22 };
  const PIE_YS = { cerca: XY0 - 96, lejos: XY0 + 40 };     // en «listos»
  const PIE_YP = { cerca: XYP + 20, lejos: XYP - 26 };     // en la puerta (mira a la izquierda)
  let RUN_Y = null;
  function runY() {
    if (RUN_Y) return RUN_Y;
    const t0 = T.ya + 0.04;
    const xa = tt => tt <= 0 ? 0 : VMAX * (tt - TAU_V * (1 - Math.exp(-tt / TAU_V)));
    const va = tt => tt <= 0 ? 0 : VMAX * (1 - Math.exp(-tt / TAU_V));
    let tD = 0; while (XY0 + xa(tD) < XYP - D_FRENO) tD += 0.0005;
    const vD = va(tD), h = 2 * D_FRENO / vD;
    RUN_Y = { t0, xa, va, tD: t0 + tD, vD, h, tF: t0 + tD + h };
    return RUN_Y;
  }
  function xRunY(t) {
    const R = runY();
    if (t <= R.t0) return XY0;
    if (t <= R.tD) return XY0 + R.xa(t - R.t0);
    if (t >= R.tF) return XYP;
    const u = (t - R.tD) / R.h;
    return XYP - D_FRENO + R.vD * R.h * (u - u * u / 2);
  }
  const vRunY = t => (xRunY(t + 0.003) - xRunY(t - 0.003)) / 0.006;
  // apoyos: [t de pisada, x del tobillo, lado, periodo]
  let APOYOS_Y = null;
  function apoyosY() {
    if (APOYOS_Y) return APOYOS_Y;
    const R = runY(), ap = [[-9, PIE_YS.cerca, "cerca", 0.2], [-9, PIE_YS.lejos, "lejos", 0.2]];
    let ph = 0.12, lado = 0;
    for (let t = R.t0; t < R.tF - 0.2; t += 0.0005) {
      const v = vRunY(t), per = lerp(0.19, 0.215, clamp(v / VMAX));
      ph += 0.0005 / per;
      if (ph >= 1) { ph -= 1; ap.push([t, xRunY(t) + clamp(v / VMAX * 30, 10, 30) + (ap.length < 4 ? 14 : 0), lado ? "lejos" : "cerca", per]); lado ^= 1; }
    }
    const sig = lado ? "lejos" : "cerca", otro = lado ? "cerca" : "lejos";
    const tl = ap[ap.length - 1][0];
    ap.push([Math.max(tl + 0.2, R.tF - 0.16), PIE_YP[sig], sig, 0.3]);
    ap.push([Math.max(tl + 0.36, R.tF), PIE_YP[otro], otro, 0.3]);
    APOYOS_Y = ap;
    return ap;
  }
  function pieCarreraY(lado, t) {
    const todos = apoyosY(), ap = todos.filter(a => a[2] === lado);
    let i = 0; for (let k = 0; k < ap.length; k++) if (ap[k][0] <= t) i = k;
    const [tf, xf, , per] = ap[i];
    if (i === ap.length - 1) return { x: xf, h: 0, a: 0, q: 0 };
    const [tn, xn] = ap[i + 1];
    // fin del apoyo: los primeros despegan al dar la salida (el de detrás antes)
    const t0 = runY().t0, toff = i === 0 ? t0 + (lado === "cerca" ? -0.02 : 0.07) : tf + 0.36 * per;
    if (t <= toff) {
      if (i === 0) { const a = lado === "cerca" ? 0.42 : 0.42 * fase(t, t0 - 0.05, toff); return { x: xf, h: 0, a, q: 0 }; }
      const a = lerp(-0.12, 0.42, clamp((t - tf) / (toff - tf)));
      return { x: xf, h: 0, a, q: qSuelo(a) };
    }
    const u = clamp((t - toff) / (tn - toff));
    const alto = clamp(60 * (xn - xf) / 220, 20, 70);
    const k = suave(clamp((u - 0.06) / 0.94)), h = alto * Math.sin(Math.PI * Math.pow(u, 0.7));
    const a = u < 0.3 ? lerp(0.42, 1.1, suave(u / 0.3)) : u < 0.75 ? lerp(1.1, 0.12, suave((u - 0.3) / 0.45)) : lerp(0.12, -0.12, suave((u - 0.75) / 0.25));
    const ult = i + 1 === ap.length - 1;
    return { x: lerp(xf, xn, k), h: ult ? h * 0.5 : h, a: ult ? a * (1 - u) : a, q: suave(u) };
  }
  function faseCarreraY(t) {
    const ap = apoyosY().slice(2);
    if (t < ap[0][0] - 0.2) return { f: -1, per: 0.2 };
    let i = -1; for (let k = 0; k < ap.length; k++) if (ap[k][0] <= t) i = k;
    if (i < 0) return { f: -1 + clamp((t - (ap[0][0] - 0.2)) / 0.2), per: 0.2 };
    if (i >= ap.length - 1) return { f: ap.length - 1, per: 0.3 };
    return { f: i + clamp((t - ap[i][0]) / (ap[i + 1][0] - ap[i][0])), per: ap[i][3] };
  }

  /* =====================================================================================
   * YORGI
   * ===================================================================================== */
  const CY0 = { pel: 0, torso: 0, cab: 0 };
  const CYc = o => Object.assign({}, CY0, o);
  const CUERPOS_Y = {
    quieto: CYc({}),
    listos: CYc({ pel: 26, torso: 0.74, cab: -0.56 }),
    espera: CYc({ pel: 4, torso: -0.05, cab: -0.02 }),
    endereza: CYc({ pel: 2, torso: 0.02, cab: 0.02 }),
    reves: CYc({ pel: 12, torso: 0.26, cab: 0.2 }),
    barre: CYc({ pel: 8, torso: 0.16, cab: 0.08 }),
    flori: CYc({ pel: 22, torso: 0.56, cab: 0.24 }),
    ups: CYc({ pel: 4, torso: -0.06, cab: -0.08 }),
    rie: CYc({ pel: 8, torso: -0.2, cab: -0.2 }),
    final: CYc({ pel: 4, torso: -0.04, cab: -0.04 })
  };
  const GUION_CUERPO_Y = [
    [T.listos0, T.listos1, "listos"], [4.3, 4.31, "espera"],
    [T.reves0 - 0.15, T.reves0 + 0.05, "endereza"], [T.reves0 + 0.05, T.reves1, "reves"], [T.barre0, T.barre1, "barre"],
    [T.floritura, T.floritura + 0.18, "flori"], [T.golpe, T.golpe + 0.16, "ups", salida], [T.rie0, T.rie0 + 0.25, "rie"], [T.yCamara - 0.1, T.yCamara + 0.25, "final"]
  ];
  const CARAS_Y = {
    calienta: E({ mx: 0.7, my: -0.05, c: 0.2, sd: 4, si: 4, abre: 0, ancho: 0.9, sonr: 0.5 }),
    reojo: E({ mx: -0.9, my: 0.25, c: 0.36, sd: -2, gd: -0.06, si: 14, gi: 0.08, abre: 0, ancho: 0.9, sonr: 0.62 }),
    listos: E({ mx: 0.95, my: -0.05, c: 0.42, sd: -8, gd: -0.12, si: -8, gi: -0.12, abre: 0, ancho: 0.8, sonr: 0.2 }),
    corre: E({ mx: 0.95, my: 0.0, c: 0.3, sd: -4, gd: -0.08, si: -4, gi: -0.08, abre: 10, ancho: 0.8, sonr: 0.5 }),
    espera: E({ mx: 0.9, my: 0.2, c: 0.34, h: 0.4, sd: 6, si: 10, abre: 0, ancho: 0.95, sonr: 0.72 }),
    risita: E({ mx: 0.9, my: 0.2, c: 0.5, h: 0.8, sd: 8, si: 10, abre: 12, ancho: 1, sonr: 0.9 }),
    reves: E({ mx: 0.6, my: 0.5, c: 0.5, h: 0.5, sd: 14, si: 14, abre: 0, ancho: 0.95, sonr: 0.8 }),
    barre: E({ mx: 0.9, my: 0.25, c: 0.3, h: 0.5, sd: 12, si: 14, abre: 4, ancho: 1, sonr: 0.85 }),
    ups: E({ mx: 0.9, my: 0.1, c: 0, iris: 0.8, sd: 24, si: 24, abre: 14, ancho: 0.7, sonr: -0.3 }),
    rie: E({ mx: 0.5, my: 0.1, c: 1, h: 1, sd: 18, si: 18, abre: 34, ancho: 1, sonr: 1 }),
    mira: E({ mx: 0.9, my: 0.1, c: 0.3, h: 0.6, sd: 12, si: 12, abre: 10, ancho: 1, sonr: 0.95 }),
    camara: E({ mx: -0.3, my: 0.05, c: 0.2, h: 0.5, sd: 10, si: 14, abre: 4, ancho: 1, sonr: 0.9 })
  };
  const GUION_CARA_Y = [
    [T.calienta1, T.calienta1 + 0.2, "calienta"], [T.listos0 + 0.1, T.listos0 + 0.3, "listos"],
    [T.yMira, T.yMira + 0.14, "reojo"], [T.yMira + 0.42, T.yMira + 0.56, "listos"],
    [T.ya, T.ya + 0.08, "corre"], [4.3, 4.31, "espera"],
    [8.05, 8.17, "risita"], [8.4, 8.52, "espera"],
    [T.reves0 + 0.05, T.reves0 + 0.25, "reves"], [T.barre0, T.barre0 + 0.2, "barre"], [T.floritura, T.floritura + 0.12, "reves"],
    [T.golpe, T.golpe + 0.08, "ups", salida], [T.rie0, T.rie0 + 0.15, "rie"], [T.yVe, T.yVe + 0.2, "mira"], [T.yCamara, T.yCamara + 0.2, "camara"]
  ];
  const PARP_Y = [0.9, 2.3, 7.6, 8.55, 9.1, 10.1, 12.1, 12.6, 13.85];

  function poseY(t) { return memo("y" + t, () => poseY0(t)); }
  function poseY0(t) {
    const b = guion(GUION_CUERPO_Y, CUERPOS_Y, "quieto", t);
    const respira = Math.sin(t * 2.2 + 0.7);
    const R = runY(), corriendo = t > R.t0 && t < R.tF + 0.3;
    const p = nuevaP(Y, XY0, SUELO_Y, SY, { torso: b.torso, torsoEsc: { x: 1, y: 1 + respira * 0.005 } });
    p.cabeza.ang = b.cab;
    let pies, pelY;
    const pelBase = SUELO_Y - ALTO_PEL(Y, SY);
    if (t <= R.t0) {
      // calentamiento: botecitos de puntillas; luego, posición de salida de pie (de atleta)
      const kL = tramo(t, T.listos0, T.listos1);
      // tensión: se mece un poco antes del ¡ya!
      p.x = XY0 + 3 * Math.sin(t * 7) * tramo(t, T.listos1, T.listos1 + 0.2) * (1 - tramo(t, T.verde - 0.12, T.verde));
      const kb = tramo(t, T.calienta0, T.calienta0 + 0.15) * (1 - tramo(t, T.calienta1 - 0.15, T.calienta1));
      const bote = Math.max(0, Math.sin((t - T.calienta0) * TAU / 0.32)) * kb;
      // pasos a la posición: el de delante adelante y el de detrás atrás
      const wL = pieLista([[T.listos0, T.listos0 + 0.22, PIE_YS.lejos, 14]], PIE_Y0.lejos, t);
      const wC = pieLista([[T.listos0 + 0.12, T.listos0 + 0.36, PIE_YS.cerca, 12]], PIE_Y0.cerca, t);
      const talon = 0.42 * tramo(t, T.listos0 + 0.36, T.listos1 + 0.04);       // el pie de detrás, de puntillas
      const aB = 0.3 * bote;
      pies = {
        cerca: pieRef(Y, p, wC.x, SUELO_Y, wC.h, wC.a + Math.max(aB, talon), wC.u < 1 ? suave(wC.u) : 0),
        lejos: pieRef(Y, p, wL.x, SUELO_Y, wL.h, wL.a + aB, wL.u < 1 ? suave(wL.u) : 0)
      };
      pelY = pelBase + b.pel - 10 * bote + respira * 0.5 + 3 * Math.sin(t * 9) * kL * (1 - kL);
      p.torso += 0.02 * Math.sin((t - T.calienta0) * 6) * kb;
      p.cabeza.ang += 0.05 * Math.sin((t - T.calienta0) * 5) * kb;
    } else if (corriendo) {
      p.x = xRunY(t);
      const v = vRunY(t), kv = clamp(v / VMAX), fc = faseCarreraY(t);
      const wC = pieCarreraY("cerca", t), wL = pieCarreraY("lejos", t);
      const kSale = tramo(t, R.t0, R.t0 + 0.12);
      const bote = 10 * Math.cos(TAU * (fc.f - 0.18)) * kv;
      const llega = tramo(t, R.tF - 0.35, R.tF + 0.2);
      pelY = pelBase + respira * 0.5 + lerp(b.pel, lerp(22 - 14 * kv, 4, llega), kSale) + bote * (1 - llega);
      p.torso = lerp(b.torso, lerp(lerp(0.56, 0.22, kv), -0.04, llega), kSale);
      p.cabeza.ang = lerp(b.cab, lerp(-0.32 + 0.16 * kv, 0, llega), kSale);
      pies = { cerca: pieRef(Y, p, wC.x, SUELO_Y, wC.h, wC.a, wC.q), lejos: pieRef(Y, p, wL.x, SUELO_Y, wL.h, wL.a, wL.q) };
    } else {
      // en la puerta del bar, a la derecha del hueco y de cara a la calle (mira a la izquierda), sujetando la hoja por la barra
      p.espejo = true;
      // en la floritura da un pasito adelante… y suelta la puerta
      const wL = pieLista([[T.floritura - 0.02, T.floritura + 0.2, PIE_YP.lejos - 26, 14]], PIE_YP.lejos, t);
      p.x = XYP - 16 * tramo(t, T.floritura - 0.02, T.floritura + 0.22);
      const golpecitos = Math.max(0, Math.sin((t - 7.95) * TAU / 0.42)) * tramo(t, 7.95, 8.15) * (1 - tramo(t, 8.4, 8.58));
      const rieK = tramo(t, T.rie0, T.rie0 + 0.2) * (1 - tramo(t, T.rie1, T.rie1 + 0.3));
      const risaPeq = tramo(t, T.yVe + 0.1, T.yVe + 0.3) * (1 - tramo(t, T.yCamara - 0.1, T.yCamara + 0.2));
      const salto = Math.abs(Math.sin((t - T.rie0) * 15)) * rieK * 5 + Math.abs(Math.sin((t - T.yVe) * 14)) * risaPeq * 3;
      const chuckle = Math.abs(Math.sin((t - 8.05) * 16)) * campana(t, 8.05, 8.5) * 3;
      pelY = pelBase + b.pel + respira * 0.6 - salto - chuckle;
      p.torso += 0.03 * Math.sin((t - T.rie0) * 15) * rieK - 0.004 * chuckle;
      p.cabeza.ang += 0.05 * Math.sin((t - T.rie0) * 15 + 0.6) * rieK;
      pies = {
        cerca: pieRef(Y, p, PIE_YP.cerca, SUELO_Y, 0, -0.28 * golpecitos, 1),
        lejos: pieRef(Y, p, wL.x, SUELO_Y, wL.h, wL.a, wL.u < 1 ? suave(wL.u) : 0)
      };
    }
    ponPelvis(Y, p, pelY);
    p.piernas = { cerca: pies.cerca, lejos: pies.lejos };
    agacha(Y, p, PIERNA_Y);
    // cara
    const e = guion(GUION_CARA_Y, CARAS_Y, "calienta", t);
    // mira a Guillermo cuando se acerca a saltos y cuando pasa por delante
    if (t > 4.3 && t < T.barre0 + 0.2) { const xg = xSaltoG(t), d = xg - p.x, k = 1 - tramo(t, T.reves0 + 0.05, T.reves0 + 0.25) + tramo(t, T.barre0 - 0.1, T.barre0); e.mx = lerp(e.mx, lerp(0.9, -1, clamp((d + 60) / 140)), clamp(k)); }
    if (t > T.guino - 0.05) e.wd += campana(t, T.guino, T.guino + 0.5) * 1.2;
    const cerrado = e.c > 0.8;
    p.cara = cara(e, cerrado ? 0 : parpadeo(t, PARP_Y));
    manosY(p, t, corriendo);
    return p;
  }
  function manosY(p, t, corriendo) {
    const rC = resolutor(Y, p, "cerca"), rL = resolutor(Y, p, "lejos");
    const bols = { bols: true };
    let C, L;
    const R = runY();
    if (t <= R.t0) {
      // calentamiento: sacude las manos a los lados; en «listos», brazos de atleta
      const kb = tramo(t, T.calienta0, T.calienta0 + 0.15) * (1 - tramo(t, T.calienta1 - 0.2, T.calienta1));
      const sac = Math.sin((t - T.calienta0) * 26);
      // saca las manos de los bolsillos y las sacude sueltas
      const kO = tramo(t, T.calienta0 - 0.14, T.calienta0 + 0.1);
      C = conMano(mezMano(rC(bols), rC(HM(140, 680, -1.6, FLOJA, -1)), kO), 8 * sac * kb, 4 * Math.cos((t - T.calienta0) * 26) * kb, 0.3 * sac * kb);
      L = conMano(mezMano(rL(bols), rL(HM(420, 650, -1.7, FLOJA, 1)), kO), -8 * sac * kb, 4 * Math.cos((t - T.calienta0) * 26 + 1) * kb, -0.3 * sac * kb);
      const kL = tramo(t, T.listos0 + 0.08, T.listos1);
      const lc = rC(HM(400, 440, 2.2, PUNO, -1)), ll = rL(HM(200, 540, -0.9, PUNO, 1, true));
      C = mezMano(C, lc, kL); L = mezMano(L, ll, kL);
      L.detras = kL > 0.3;
    } else if (corriendo) {
      // carrera: brazos contrarios a las piernas; el lejano, por detrás del cuerpo
      const fc = faseCarreraY(t), ph = Math.cos(Math.PI * fc.f), llega = tramo(t, R.tF - 0.3, R.tF + 0.25);
      const brC = rC(HM(190 - 190 * ph, 470 + 110 * ph, 0.65 - 1.55 * ph, PUNO, -1)), brL = rL(HM(405 + 155 * ph, 510 - 90 * ph, 0.55 + 1.45 * ph, PUNO, 1, true));
      const kS = tramo(t, R.t0, R.t0 + 0.1);
      const lc = rC(HM(400, 440, 2.2, PUNO, -1)), ll = rL(HM(200, 540, -0.9, PUNO, 1, true));
      C = mezMano(lc, brC, kS); L = mezMano(ll, brL, kS); L.detras = true;
      C = mezMano(C, rC(bols), llega); L = mezMano(L, rL({ bols: true, detras: true }), llega); L.detras = true;
    } else {
      // en la puerta: la lejana en la barra de la hoja (desde que la abre), la cercana en el bolsillo
      const barra = rL({ scr: () => bilP(hojaPuerta(thPuerta(t)), 0.9, 0.48), mu: Math.PI - 0.15, dedos: AGARRA, dobla: 1 });
      C = rC(bols); L = mezMano(rL(bols), barra, tramo(t, 5.2, 5.4));
      // reverencia: la mano cercana al corazón
      const kH = tramo(t, T.reves0 - 0.1, T.reves0 + 0.14);
      C = mezMano(C, rC(HM(330, 470, -4.08, D5(0.6, 1, 1, 1, 1), -1)), kH);
      // al llegar Guillermo: le indica la puerta (a su izquierda), con la palma arriba
      const kB = tramo(t, T.barre0, T.barre1);
      C = mezMano(C, rC(HM(340, 560, -2.8, ABIERTA, -1)), kB);
      C = conMano(C, 0, 4 * Math.sin((t - T.barre1) * 5) * tramo(t, T.barre1, T.barre1 + 0.3) * (1 - tramo(t, T.floritura - 0.1, T.floritura)));
      // floritura: suelta la puerta y barre con los dos brazos hacia delante
      const kF = tramo(t, T.floritura, T.floritura + 0.18, salida);
      if (kF > 0) { C = mezMano(C, rC(HM(280, 600, -2.35, ABIERTA, -1)), kF); L = mezMano(L, rL(HM(500, 610, 3.9, ABIERTA, 1)), kF); }
      // ¡uy!: la cercana a la boca (por delante de la cara)
      const kU = tramo(t, T.golpe, T.golpe + 0.14, salida) * (1 - tramo(t, T.rie0 - 0.05, T.rie0 + 0.15));
      if (kU > 0) {
        const m = Y.cabeza(p).a(P(905, 735));
        C = mezMano(C, { x: m.x + 30, y: m.y + 40, mu: -4.18, ang: 0, puno: 1, dedos: D5(0.6, 1, 1, 1, 1), dobla: -1 }, kU);
      }
      // risa: las dos manos a la barriga
      const kR = tramo(t, T.rie0 - 0.05, T.rie0 + 0.15);
      if (kR > 0) {
        const tr = Math.sin((t - T.rie0) * 15) * (1 - tramo(t, T.rie1, T.rie1 + 0.3));
        C = mezMano(C, conMano(rC(HM(400, 620, -3.78, TODOS(0.25), -1)), 0, 6 * tr), kR);
        L = mezMano(L, conMano(rL(HM(470, 640, 2.3, TODOS(0.25), 1)), 0, 5 * tr), kR);
      }
      // le contesta a Guillermo con otro pulgar (antebrazo tumbado)
      const kP = tramo(t, T.yPulgar, T.yPulgar + 0.22, salida);
      if (kP > 0) L = mezMano(L, conMano(rL(HM(610, 440, Math.PI, PULGAR, 1)), 0, -6 * Math.abs(Math.sin((t - T.yPulgar) * 9)) * campana(t, T.yPulgar + 0.2, T.yPulgar + 0.9)), kP);
    }
    p.manoCerca = C; p.manoLejos = L;
  }

  /* =====================================================================================
   * GUILLERMO
   * ===================================================================================== */
  const LC = 64;                                       // cordón (px de pantalla entre los lazos)
  const PIE_G0 = { cerca: XG0 - 9, lejos: XG0 + 7 };   // pies casi juntos (tobillos, mundo)
  // la zancada: el pie lejano sale hacia delante hasta donde da el cordón
  const XL_ZANCADA = PIE_G0.cerca + LC - 4;
  const PUNTA_G = P(G.PUNTA.x, G.TOBILLO_ALTO);
  const PIVOTE = P(XL_ZANCADA + G.PUNTA.x * SG, SUELO_G);       // punta de la zapatilla lejana: ahí gira al caer
  const PHI_CARA = 1.48;                               // giro al quedar de bruces (la cara toca el suelo)
  // de pie tras el resorte: pelvis y pies
  const XG_UP = XL_ZANCADA - 6, PIE_UP = { cerca: XL_ZANCADA - 14, lejos: XL_ZANCADA };
  // saltos: dónde cae cada uno (el último, delante del hueco de la puerta; Yorgi está más a la derecha)
  const CAIDAS = [470, 600, 735, 870, 1005, 1140, 1270, 1405, 1540];
  let SALTOS = null;
  function saltos() {
    if (SALTOS) return SALTOS;
    const X = [XG_UP, ...CAIDAS, XG_PUERTA], D = [];
    for (let i = 0; i < X.length - 1; i++) D.push(X[i + 1] - X[i]);
    SALTOS = { D, X };
    return SALTOS;
  }
  const H_SALTO = 58, G_SUELO = T.per - T.aire, C_HUNDE = 4 * H_SALTO * G_SUELO / (Math.PI * T.aire);
  // x de la pelvis mientras salta: rápido en el aire, despacio en el suelo (función suave)
  const ALFA = 0.62;
  function xSaltoG(t) {
    const S = saltos(), n = T.nSaltos;
    const tm0 = T.salto0 - G_SUELO / 2;                    // mitad del primer apoyo
    const u = (t - tm0) / T.per;
    if (u <= 0) return S.X[0];
    const i = Math.floor(u); if (i >= n) return S.X[n];
    const f = u - i, w = f - ALFA / TAU * Math.sin(TAU * f);
    return S.X[i] + S.D[i] * w;
  }
  // ciclo del salto i: s = tiempo desde que despega
  function cicloSalto(t) {
    const s0 = t - T.salto0, i = Math.floor(s0 / T.per), s = s0 - i * T.per;
    return { i, s };
  }
  // altura (arriba +) de la pelvis por los saltos; en el suelo se hunde
  const T_AGACHA = 0.26;                                   // agachada antes del primer salto
  function altoSalto(t) {
    if (t < T.salto0 - T_AGACHA) return 0;
    if (t < T.salto0) {
      // agachada de preparación: baja suave y sube de golpe (sale con la velocidad del despegue)
      const q = fase(t, T.salto0 - T_AGACHA, T.salto0);
      return q < 0.5 ? -C_HUNDE * 0.9 * suave(q / 0.5) : -C_HUNDE * 0.9 * (1 - entrada((q - 0.5) / 0.5));
    }
    const { i, s } = cicloSalto(t);
    if (i >= T.nSaltos) return -C_HUNDE;
    if (s < T.aire) { const q = s / T.aire; return 4 * H_SALTO * q * (1 - q); }
    const q = (s - T.aire) / G_SUELO;
    // último apoyo: se queda agachado y se prepara para el salto al umbral
    if (i === T.nSaltos - 1) return -C_HUNDE * Math.sin(Math.PI * Math.min(q, 0.5));
    return -C_HUNDE * Math.sin(Math.PI * q);
  }
  // pies juntos al saltar: { X (tobillo lejano si estuviera plano), h, a, q } (el cercano va 14 px por detrás)
  const plantG = j => xSaltoG(T.salto0 + j * T.per - G_SUELO / 2) + 6;
  function piesSalto(t) {
    const { i, s } = cicloSalto(t);
    if (i < 0) {
      const q = fase(t, T.salto0 - T_AGACHA, T.salto0);
      return { X: plantG(0), h: 0, a: 0.35 * tramo(q, 0.6, 1), q: 0 };
    }
    if (i >= T.nSaltos) return { X: plantG(T.nSaltos), h: 0, a: 0, q: 0 };
    if (s < T.aire) {
      // en el aire: despega de punta y aterriza de talón; las rodillas se encogen
      const u = s / T.aire, lift = 4 * H_SALTO * u * (1 - u), tuck = 30 * Math.sin(Math.PI * u);
      const a = lerp(0.35, -0.12, suave(u)) + 0.14 * Math.sin(Math.PI * u);
      return { X: lerp(plantG(i), plantG(i + 1), suave(u)), h: lift + tuck, a, q: suave(u) };
    }
    const u = (s - T.aire) / G_SUELO, ult = i === T.nSaltos - 1;
    const a = -0.12 * (1 - tramo(u, 0, 0.35)) + (ult ? 0 : 0.35 * tramo(u, 0.6, 1));
    return { X: plantG(i + 1), h: 0, a, q: qSuelo(a) };
  }

  const CG0 = { pel: 0, torso: 0.02, cab: 0.02 };
  const CGc = o => Object.assign({}, CG0, o);
  const CUERPOS_G = {
    quieto: CGc({}),
    rodillas: CGc({ pel: 30, torso: 0.72, cab: -0.42 }),
    sale: CGc({ pel: 10, torso: 0.36, cab: -0.2 }),
    tabla: CGc({ pel: 0, torso: 0.05, cab: 0.1 }),
    tumbado: CGc({ pel: 0, torso: 0.02, cab: 0.16 }),
    alza: CGc({ pel: 0, torso: -0.08, cab: -0.92 }),
    miraPies: CGc({ pel: 0, torso: -0.08, cab: -1.05 }),
    decide: CGc({ pel: 0, torso: -0.08, cab: -0.95 }),
    resorte: CGc({ pel: 0, torso: 0.0, cab: 0.0 }),
    salta: CGc({ pel: 0, torso: 0.12, cab: -0.06 }),
    umbral: CGc({ pel: 4, torso: 0.0, cab: 0.0 }),
    gracias: CGc({ pel: 6, torso: 0.3, cab: 0.2 }),
    victoria: CGc({ pel: 2, torso: -0.04, cab: -0.1 })
  };
  const GUION_CUERPO_G = [
    [T.listos0 + 0.1, T.listos1, "rodillas"], [T.gSale, T.gSale + 0.12, "sale", salida], [T.tensa, T.tensa + 0.2, "tabla"],
    [T.choca, T.choca + 0.1, "tumbado"], [T.alza, T.alza + 0.2, "alza"], [T.miraPies, T.miraPies + 0.14, "miraPies"], [T.decide, T.decide + 0.12, "decide"],
    [T.sube0, T.sube0 + 0.2, "resorte"], [T.sube1, T.salto0, "salta"], [T.entra1 - 0.1, T.entra1 + 0.1, "umbral"],
    [T.gracias, T.gracias + 0.12, "gracias"], [T.gira0 - 0.04, T.gira0 + 0.1, "umbral"], [T.gira1 - 0.08, T.gira1 + 0.06, "victoria"]
  ];
  const CARAS_G = {
    quieto: E({ mx: 0.6, my: -0.1, c: 0.1, sd: 6, si: 6, abre: 0, ancho: 0.9, sonr: 0.45 }),
    copia: E({ mx: 0.5, my: -0.35, c: 0.1, sd: 12, si: 10, abre: 6, ancho: 0.9, sonr: 0.5 }),
    listos: E({ mx: 0.95, my: -0.25, c: 0.3, sd: -6, gd: -0.14, si: -6, gi: -0.14, abre: 0, ancho: 0.75, sonr: 0.1, mof: 0.2 }),
    reojo: E({ mx: 0.7, my: -0.6, c: 0.38, sd: -10, gd: -0.2, si: 14, gi: 0.1, abre: 0, ancho: 0.9, sonr: 0.6 }),
    sale: E({ mx: 0.95, my: -0.1, c: 0.05, sd: 10, si: 10, abre: 22, ancho: 0.95, sonr: 0.8 }),
    susto: E({ mx: 0.8, my: 0.4, c: 0, iris: 0.68, sd: 28, si: 28, abre: 34, ancho: 0.9, sonr: -0.5 }),
    plaf: E({ mx: 0.5, my: 0.3, c: 0.9, z: 1, sd: 4, si: 4, abre: 4, ancho: 0.7, sonr: -0.4, mof: 0.5 }),
    mareado: E({ mx: 0.5, my: 0.1, esp: 0.8, sd: 10, gd: 0.15, si: 10, gi: 0.15, abre: 10, ancho: 0.75, sonr: 0.1 }),
    pies: E({ mx: -0.85, my: 0.75, c: 0.2, sd: 6, si: 8, abre: 0, ancho: 0.8, sonr: -0.1 }),
    ve: E({ mx: -0.9, my: 0.75, c: 0, iris: 0.8, sd: 26, si: 26, abre: 16, ancho: 0.7, sonr: -0.35 }),
    decide: E({ mx: 0.9, my: 0.0, c: 0.3, sd: -12, gd: -0.28, si: -12, gi: -0.28, abre: 0, ancho: 0.8, sonr: 0.0, mof: 0.3 }),
    salta: E({ mx: 0.95, my: -0.05, c: 0.28, sd: -10, gd: -0.26, si: -10, gi: -0.26, abre: 0, ancho: 0.75, sonr: 0.05, mof: 0.45 }),
    contento: E({ mx: 0.9, my: 0.05, c: 0.15, h: 0.4, sd: 14, si: 14, abre: 20, ancho: 1, sonr: 0.95 }),
    gracias: E({ mx: 0.9, my: 0.2, c: 0.4, h: 0.7, sd: 14, si: 16, abre: 6, ancho: 1, sonr: 0.95 }),
    victoria: E({ mx: 0.5, my: -0.3, c: 0.75, h: 1, sd: 18, si: 18, abre: 28, ancho: 1, sonr: 1 }),
    boing: E({ mx: 0.6, my: -0.35, c: 0, iris: 0.7, sd: 30, si: 30, abre: 36, ancho: 0.95, sonr: -0.2 })
  };
  const GUION_CARA_G = [
    [T.gCopia || 0.75, 0.9, "copia"], [T.calienta1, T.calienta1 + 0.15, "quieto"], [T.listos0 + 0.1, T.listos0 + 0.3, "listos"],
    [T.gMira, T.gMira + 0.12, "reojo"], [T.gFrente, T.gFrente + 0.12, "listos"],
    [T.gSale - 0.02, T.gSale + 0.06, "sale"], [T.tensa, T.tensa + 0.06, "susto", salida], [T.choca, T.choca + 0.04, "plaf"],
    [T.choca + 0.35, T.choca + 0.5, "mareado"], [T.alza + 0.04, T.alza + 0.2, "pies"], [T.ve, T.ve + 0.08, "ve", salida],
    [T.decide, T.decide + 0.12, "decide"], [T.sube1 + 0.1, T.salto0, "salta"],
    [9.3, 9.5, "contento"], [T.entra1, T.entra1 + 0.12, "gracias"], [T.gira0 + 0.06, T.gira1, "victoria"], [T.golpe, T.golpe + 0.05, "boing", salida]
  ];
  const PARP_G = [1.25, 2.5, 5.1, 6.6, 8.1, 9.6];

  // giro del muñeco entero (caída y resorte) alrededor de la punta de la zapatilla lejana
  function giroG(t) {
    if (t < T.tensa || t > T.sube1 + 0.2) return 0;
    if (t < T.choca) { const k = fase(t, T.tensa, T.choca); return PHI_CARA * k * k; }
    // antes del resorte se encoge un pelín contra el suelo (anticipación)
    const anti = 0.035 * Math.sin(Math.PI * fase(t, T.sube0 - 0.18, T.sube0));
    // al levantar la cabeza el pecho baja hasta el suelo
    const pecho = 0.05 * tramo(t, T.alza, T.alza + 0.22);
    if (t < T.sube0) { const tb = t - T.choca; return PHI_CARA + pecho - 0.07 * Math.exp(-tb * 9) * Math.abs(Math.sin(tb * 17)) + anti; }
    const k = suave(fase(t, T.sube0, T.sube1));
    return (PHI_CARA + pecho) * (1 - rebote(k, 2.2));
  }
  // del espacio de la pose al mundo y al revés (el giro de la caída)
  const aMundoG = (gi, q) => { const d = rot(P(q.x - gi.Pp.x, q.y - gi.Pp.y), gi.phi); return P(gi.W.x + d.x, gi.W.y + d.y); };
  const aPoseG = (gi, q) => { const d = rot(P(q.x - gi.W.x, q.y - gi.W.y), -gi.phi); return P(gi.Pp.x + d.x, gi.Pp.y + d.y); };
  const enUmbral = t => t >= T.entra1 && t < T.rendija0 - 0.05;
  const enRendija = t => t >= T.rendija0 - 0.05;

  function poseG(t) { return memo("g" + t, () => poseG0(t)); }
  function poseG0(t) {
    if (enRendija(t)) return poseRendija(t);
    const b = guion(GUION_CUERPO_G, CUERPOS_G, "quieto", t);
    const respira = Math.sin(t * 2.1);
    const p = nuevaP(G, XG0, SUELO_G, SG, { ikContinuo: false, hombrosContinuos: true, hombrosRecortados: true, torso: b.torso,
      torsoEsc: { x: 1, y: 1 + respira * 0.004 } });
    p.cabeza.ang = b.cab;
    let pies, pelY, giro = null, clip = null, fx = 1;
    const pelBase = SUELO_G - ALTO_PEL(G, SG);
    if (t < T.gSale) {
      // de pie (pies juntos por el cordón): copia los botecitos de Yorgi y se agacha con las manos en las rodillas
      p.x = XG0 - 4 * tramo(t, T.verde - 0.03, T.ya + 0.04);
      const kb = tramo(t, 0.78, 0.92) * (1 - tramo(t, T.calienta1 - 0.12, T.calienta1));
      const bote = Math.max(0, Math.sin((t - 0.78) * TAU / 0.34)) * kb;
      const aB = 0.26 * bote;
      pies = { cerca: pieRef(G, p, PIE_G0.cerca, SUELO_G, 0, aB, 0), lejos: pieRef(G, p, PIE_G0.lejos, SUELO_G, 0, aB, 0) };
      pelY = pelBase + b.pel - 9 * bote + respira * 0.4 + 3 * Math.sin(t * 8) * tramo(t, T.listos1, T.listos1 + 0.2) * (1 - tramo(t, T.verde - 0.12, T.verde));
      p.torso += 0.04 * Math.sin((t - 0.78) * 9) * kb;
      p.cabeza.ang += 0.06 * Math.sin((t - 0.78) * 9 + 1) * kb;
    } else if (t < T.salto0 - T_AGACHA) {
      // la zancada, el tirón del cordón, la caída de bruces, tumbado y el resorte
      const kZ = tramo(t, T.gSale, T.tensa, salida);
      // el pie lejano sale hacia delante (hasta donde da el cordón) y apoya de talón
      const uL = fase(t, T.gSale + 0.02, T.tensa);
      const XLj = lerp(PIE_G0.lejos, XL_ZANCADA, suave(uL)), hLj = 40 * Math.sin(Math.PI * uL);
      const aLj = 0.5 * Math.sin(Math.PI * uL) * (1 - uL) - 0.1 * Math.sin(Math.PI * uL) * uL;
      // el cercano empuja de puntillas y luego se arrastra hasta juntarse con el otro
      const kArr = tramo(t, T.tensa, T.choca);
      const XCe = lerp(PIE_G0.cerca, PIE_UP.cerca, kArr), hCe = 26 * Math.sin(Math.PI * kArr), aCe = lerp(0.5 * kZ, 0, kArr);
      const kT = tramo(t, T.tensa - 0.04, T.tensa + 0.1);
      p.x = lerp(lerp(XG0 - 4, XG0 + 34, kZ), XG_UP, kT);
      pelY = pelBase + b.pel + respira * 0.4;
      pies = { lejos: pieRef(G, p, XLj, SUELO_G, hLj, aLj, uL < 1 ? suave(uL) : 0), cerca: pieRef(G, p, XCe, SUELO_G, hCe, aCe, 0) };
      const phi = giroG(t);
      if (phi !== 0) giro = { W: PIVOTE, Pp: PIVOTE, phi };
      // tumbado: respira
      p.torso += 0.01 * Math.sin(t * 3) * tramo(t, T.choca, T.choca + 0.3) * (1 - tramo(t, T.sube0 - 0.1, T.sube0));
      // el resorte: estirado al subir
      const kRe = campana(t, T.sube0, T.sube1);
      p.torsoEsc = { x: 1 - 0.04 * kRe, y: 1 + 0.06 * kRe + respira * 0.004 };
      // aterriza del resorte: se hunde un poco
      pelY += 12 * campana(t, T.sube1 - 0.06, T.sube1 + 0.2);
    } else if (t < T.entra0) {
      // saltos de conejo
      p.x = xSaltoG(t);
      const alto = altoSalto(t), w = piesSalto(t);
      const kh = Math.max(0, -alto) / C_HUNDE, ka = Math.max(0, alto) / H_SALTO;
      pelY = pelBase + b.pel - alto + respira * 0.4;
      p.torso += 0.2 * kh + 0.05 * ka;
      p.cabeza.ang += -0.1 * kh + 0.04 * ka;
      const sy = 1 - 0.08 * kh + 0.045 * ka;
      p.torsoEsc = { x: 1 + (1 - sy) * 0.6, y: sy + respira * 0.004 };
      pies = { cerca: pieRef(G, p, w.X - 14, SUELO_G, w.h, w.a, w.q), lejos: pieRef(G, p, w.X, SUELO_G, w.h, w.a, w.q) };
    } else {
      // salto al umbral (hacia el fondo: sube y se hace un poco más pequeño), gracias, ¡boing! y dentro
      const u = fase(t, T.entra0, T.entra1);
      const S = saltos(), x0 = S.X[T.nSaltos], x1 = X_UMBRAL;
      p.s = lerp(SG, S_UMBRAL, suave(u));
      p.suelo = lerp(SUELO_G, FB, suave(u));
      p.x = lerp(x0, x1, suave(u));
      const lift = 44 * Math.sin(Math.PI * u), tuck = 30 * Math.sin(Math.PI * u);
      const despega = C_HUNDE * (1 - tramo(u, 0, 0.22));
      const aterriza = 24 * campana(t, T.entra1 - 0.02, T.entra1 + 0.2);
      const pb = p.suelo - ALTO_PEL(G, p.s);
      pelY = pb + b.pel - lift + despega + aterriza + respira * 0.4;
      p.torso += 0.16 * Math.sin(Math.PI * u) + 0.1 * campana(t, T.entra1 - 0.02, T.entra1 + 0.2);
      const kh = (despega + aterriza) / C_HUNDE, sy = 1 - 0.07 * clamp(kh) + 0.04 * Math.sin(Math.PI * u);
      p.torsoEsc = { x: 1 + (1 - sy) * 0.6, y: sy };
      let Xf = lerp(x0 + 6, x1 + 6, suave(u)), hP = lift + tuck, aP = 0.3 * Math.sin(Math.PI * u) * (1 - u) - 0.08 * Math.sin(Math.PI * u) * u, qP = suave(u);
      if (u >= 1) { hP = 0; aP = 0; qP = 0; }
      // da las gracias de cara a Yorgi y luego media vuelta (se aplasta en x) para celebrarlo de cara a la calle
      fx = Math.cos(Math.PI * tramo(t, T.gira0, T.gira1));
      pelY -= 10 * campana(t, T.gira0, T.gira1);
      // ¡boing!: la hoja le empuja por el trasero; sale volando hacia dentro con los pies por detrás
      const em = empujon(t);
      if (em) {
        p.x = em.x;
        pelY -= em.lift;
        p.torso += -0.34 * em.k;
        p.cabeza.ang += 0.2 * em.k;
        Xf = em.x + 6 - 40 * em.k; hP = em.lift + 20 * em.k; aP = -0.4 * em.k; qP = 1;     // (se dibuja con la media vuelta)
      }
      pies = { cerca: pieRef(G, p, Xf - 14, p.suelo, hP, aP, qP), lejos: pieRef(G, p, Xf, p.suelo, hP, aP, qP) };
      clip = enUmbral(t) ? "hueco" : null;
    }
    ponPelvis(G, p, pelY);
    p.piernas = { cerca: pies.cerca, lejos: pies.lejos };
    agacha(G, p, PIERNA_G);
    // cara
    const e = guion(GUION_CARA_G, CARAS_G, "quieto", t);
    if (t < T.gSale) e.mx = lerp(e.mx, 0.4, campana(t, 0.7, 1.4));
    p.cara = cara(e, e.c > 0.85 || e.esp > 0.3 ? 0 : parpadeo(t, PARP_G));
    p.rojo = 0.35 * tramo(t, 6.0, 7.5) * (1 - tramo(t, 9.3, 9.8));
    p.sudor = 0.7 * tramo(t, 6.5, 7.5) * (1 - tramo(t, 9.6, 10.0)) + 0.6 * campana(t, T.ve, T.sube0 + 0.2);
    // la lengua por la comisura al saltar (concentrado)
    const kL = tramo(t, T.sube1 + 0.15, T.salto0 + 0.1) * (1 - tramo(t, 9.25, 9.45));
    if (kL > 0.01) p.capaCabeza = g => lenguaFuera(g, kL, t);
    manosG(p, t, giro);
    return { p, giro, clip, fx };
  }
  // la lengua asomando por la comisura (retrato)
  function lenguaFuera(g, k, t) {
    const mueve = 0.08 * Math.sin(t * 7);
    g.save(); g.translate(842, 744); g.rotate(0.55 + mueve); g.scale(k, k);
    g.fillStyle = "#df6a5e"; g.strokeStyle = TINTA; g.lineWidth = 5;
    g.beginPath(); g.moveTo(-14, -6); g.quadraticCurveTo(26, -14, 34, 10); g.quadraticCurveTo(30, 32, 8, 22); g.quadraticCurveTo(-6, 16, -12, 10); g.closePath(); g.fill(); g.stroke();
    g.strokeStyle = "rgba(120,20,20,0.5)"; g.lineWidth = 3; g.beginPath(); g.moveTo(6, 0); g.lineTo(16, 14); g.stroke();
    g.restore();
  }
  // el empujón de la puerta: la hoja barre hacia la izquierda y le lleva por el trasero (ya está de espaldas a ella)
  const BUM = 58;                                     // del canto de la hoja a su pelvis
  let EMP = null;
  function empujonDatos() {
    if (EMP) return EMP;
    const x1 = X_UMBRAL;
    let tHit = T.cierra1;
    for (let t = T.cierra0; t < T.cierra1; t += 0.001) if (hojaPuerta(thPuerta(t)).xF - BUM <= x1) { tHit = t; break; }
    EMP = { tHit, x1 };
    return EMP;
  }
  function empujon(t) {
    const D = empujonDatos();
    if (t < D.tHit) return null;
    const tb = t - D.tHit, hoja = t < T.cierra1 ? hojaPuerta(thPuerta(t)).xF - BUM : 1e9;
    const propio = D.x1 - 1100 * 0.24 * (1 - Math.exp(-tb / 0.24));
    const x = Math.min(D.x1, hoja, propio), k = tramo(t, D.tHit, D.tHit + 0.08);
    return { x, k, lift: 26 * k };
  }
  // dentro del bar, de cara a la calle: asoma el brazo por la rendija (lado izquierdo) con el pulgar arriba
  function poseRendija(t) {
    const Hj = hojaPuerta(thPuerta(t));
    const s = S_UMBRAL;
    const p = nuevaP(G, 0, FB, s, { espejo: true, ikContinuo: false, hombrosContinuos: true, hombrosRecortados: true, torso: 0.02 });
    const hom = (G.HOMBRO.x - G.PELVIS.x) * s;
    p.x = Hj.xF + 26 + hom;
    ponPelvis(G, p, FB - ALTO_PEL(G, s));
    p.piernas = { cerca: tobDe(G, p, p.x + 14, FB, 0, 0), lejos: tobDe(G, p, p.x - 4, FB, 0, 0) };
    const sh = G.aPantalla(p, G.tronco(p)(G.HOMBRO));
    const k = tramo(t, T.brazo0, T.brazo1, salida);
    const bombea = -5 * Math.abs(Math.sin((t - T.brazo1) * 8)) * campana(t, T.brazo1 + 0.1, T.brazo1 + 0.9);
    const mano = P(lerp(sh.x - 10, sh.x - G.BRAZO_L * s * 0.975, k), sh.y + 3 + bombea);
    p.cara = cara(E({ mx: 0.9, sonr: 0.9, h: 0.5, abre: 10 }), 0);
    p.manoCerca = resolutor(G, p, "cerca")({ bols: true });
    p.manoLejos = resolutor(G, p, "lejos")({ scr: () => mano, mu: Math.PI, dedos: PULGAR, dobla: 1 });
    return { p, giro: null, clip: "rendija", brazoY: sh.y + 3, fx: 1 };
  }
  function manosG(p, t, giro) {
    const rC = resolutor(G, p, "cerca"), rL = resolutor(G, p, "lejos");
    const bols = { bols: true };
    let C = rC(bols), L = rL(bols);
    // copia el calentamiento: sacude las manos
    const kb = tramo(t, 0.8, 0.95) * (1 - tramo(t, T.calienta1 - 0.15, T.calienta1));
    const kO = tramo(t, 0.66, 0.86);
    if (kO > 0) { C = mezMano(C, rC(HM(130, 660, -1.65, FLOJA, -1)), kO); L = mezMano(L, rL(HM(390, 640, -1.72, FLOJA, 1)), kO); }
    if (kb > 0) { const sac = Math.sin((t - 0.8) * 24); C = conMano(C, 10 * sac * kb, 5 * Math.cos((t - 0.8) * 24) * kb, 0.4 * sac * kb); L = conMano(L, -9 * sac * kb, 5 * Math.cos((t - 0.8) * 24 + 1) * kb, -0.4 * sac * kb); }
    // manos a las rodillas
    const kR = tramo(t, T.listos0 + 0.12, T.listos1 - 0.05) * (1 - tramo(t, T.gSale, T.gSale + 0.08));
    if (kR > 0) {
      const rc = rodilla(G, p, "cerca", PIERNA_G), rl = rodilla(G, p, "lejos", PIERNA_G), cad = G.tronco(p)(G.CADERA.cerca);
      const mc = { x: lerp(rc.x, cad.x, 0.12) + 4, y: lerp(rc.y, cad.y, 0.12) - 26, mu: -2.2, ang: 0, puno: 1, dedos: TODOS(0.75), dobla: -1 };
      const ml = { x: lerp(rl.x, cad.x, 0.08) + 30, y: lerp(rl.y, cad.y, 0.08) - 26, mu: -2.0, ang: 0, puno: 1, dedos: TODOS(0.75), dobla: 1 };
      C = mezMano(C, mc, kR); L = mezMano(L, ml, kR);
    }
    if (t >= T.gSale) {
      // sale braceando (la cercana adelante)
      const kS = tramo(t, T.gSale, T.gSale + 0.1);
      C = mezMano(C, rC(HM(340, 420, 2.2, PUNO, -1)), kS); L = mezMano(L, rL(HM(440, 620, -1.4, PUNO, 1)), kS);
      // al tensarse el cordón: manos por delante, agitándose (arcos, sin dar la vuelta)
      const kA = tramo(t, T.tensa - 0.02, T.tensa + 0.1) * (1 - tramo(t, T.choca - 0.08, T.choca + 0.02));
      if (kA > 0) {
        const w = (t - T.tensa) * 15;
        C = mezMano(C, conMano(rC(HM(390, 380, 2.4, ABIERTA, -1)), 26 * Math.sin(w), 30 * Math.cos(w)), kA);
        L = mezMano(L, conMano(rL(HM(600, 360, 2.6, ABIERTA, 1)), 30 * Math.sin(w + 1.5), 30 * Math.cos(w + 1.5)), kA);
      }
      // al chocar: pegados al cuerpo, como una tabla
      const kP = tramo(t, T.choca - 0.06, T.choca + 0.04);
      if (kP > 0) { C = mezMano(C, rC(HM(220, 630, -1.6, ABIERTA, -1)), kP); L = mezMano(L, rL(HM(340, 630, -1.65, ABIERTA, 1)), kP); }
      // los dedos se mueven un poco (está vivo)
      const kV = tramo(t, T.choca + 0.6, T.choca + 0.8) * (1 - tramo(t, T.sube0, T.sube0 + 0.1));
      if (kV > 0) { C = conMano(C, 0, 3 * Math.sin(t * 10) * kV); L = conMano(L, 0, 3 * Math.sin(t * 10 + 2) * kV); }
      // el resorte: brazos arriba un instante (¡boing!) y vuelven
      const kU = campana(t, T.sube0 + 0.05, T.sube1 + 0.15);
      if (kU > 0) { C = mezMano(C, rC(HM(340, 420, 2.4, ABIERTA, -1)), kU * 0.8); L = mezMano(L, rL(HM(560, 380, 2.4, ABIERTA, 1)), kU * 0.8); }
    }
    if (t >= T.sube1) {
      // saltos: los dos brazos a la vez, atrás al agacharse y adelante al despegar; puños cerrados
      const kS = tramo(t, T.salto0 - 0.34, T.salto0 - 0.16);
      const s0 = t - T.salto0, s = s0 - Math.floor(s0 / T.per) * T.per;
      const a = lerp(0.5, 0.5 + 0.5 * Math.cos(TAU * (s - T.aire * 0.5) / T.per), kS);
      const atC = rC(HM(-40, 600, -0.6, PUNO, -1)), adC = rC(HM(400, 340, 2.6, PUNO, -1));
      const atL = rL(HM(420, 650, -1.3, PUNO, 1)), adL = rL(HM(580, 340, 2.6, PUNO, 1));
      const kM = tramo(t, T.sube1, T.sube1 + 0.3);
      C = mezMano(C, mezMano(atC, adC, a), kM); L = mezMano(L, mezMano(atL, adL, a), kM);
    }
    if (t >= T.entra0 + 0.1) {
      // en el umbral: puños a la cintura, contento
      const kW = tramo(t, T.entra0 + 0.1, T.entra1 + 0.06);
      C = mezMano(C, rC(HM(250, 600, 2.0, PUNO, -1)), kW); L = mezMano(L, rL(HM(430, 600, 2.1, PUNO, 1)), kW);
      // gracias: la mano cercana al pecho, con una reverencia torpe
      const kG = tramo(t, T.gracias, T.gracias + 0.12) * (1 - tramo(t, T.gira0 - 0.04, T.gira0 + 0.08));
      if (kG > 0) C = mezMano(C, rC(HM(300, 470, 2.2, D5(0.6, 1, 1, 1, 1), -1)), kG);
      // ¡sí!: puños arriba delante del pecho, de cara a la calle
      const kV = tramo(t, T.gira0 + 0.04, T.gira1);
      if (kV > 0) {
        const pump = 8 * Math.abs(Math.sin((t - T.gira1) * 13)) * tramo(t, T.gira1, T.gira1 + 0.05);
        C = mezMano(C, conMano(rC(HM(380, 400, 2.3, PUNO, -1)), 0, -pump), kV); L = mezMano(L, conMano(rL(HM(560, 380, 2.4, PUNO, 1)), 0, -pump), kV);
      }
      // tras el golpe, brazos al aire
      const em = empujon(t);
      if (em) { C = mezMano(C, rC(HM(380, 330, 2.6, ABIERTA, -1)), em.k); L = mezMano(L, rL(HM(600, 300, 2.6, ABIERTA, 1)), em.k); }
    }
    p.manoCerca = C; p.manoLejos = L;
  }
  function pose(t) { return { g: poseG(t).p, y: poseY(t) }; }

  /* =====================================================================================
   * CÁMARA: sigue a Guillermo saltando (media móvil de su x, sin tirones) y se para en la puerta
   * ===================================================================================== */
  let CAM = null;
  function tablaCam() {
    if (CAM) return CAM;
    const dt = 0.005, n = Math.ceil(DUR / dt) + 1, obj = new Float64Array(n);
    for (let i = 0; i < n; i++) { const t = i * dt; obj[i] = clamp(xSaltoG(t) - XG_UP, 0, CAMF); }
    const caja = (a, w) => { const m = Math.round(w / dt / 2), o = new Float64Array(n); let s = 0, c = 0;
      for (let i = 0; i < n; i++) { let acc = 0, k = 0; for (let j = Math.max(0, i - m); j <= Math.min(n - 1, i + m); j++) { acc += a[j]; k++; } o[i] = acc / k; } return o; };
    CAM = { dt, v: caja(caja(obj, T.per), 0.5) };
    return CAM;
  }
  function camX(t) {
    const C = tablaCam(), f = clamp(t / C.dt, 0, C.v.length - 1), i = Math.floor(f), k = f - i;
    return lerp(C.v[i], C.v[Math.min(C.v.length - 1, i + 1)], k);
  }

  /* =====================================================================================
   * EFECTOS
   * ===================================================================================== */
  let POLVO_SPR = null;
  function polvoSpr() {
    if (POLVO_SPR) return POLVO_SPR;
    const [c, g] = lienzo(64, 64), gr = g.createRadialGradient(32, 32, 2, 32, 32, 31);
    gr.addColorStop(0, "rgba(236,226,206,0.95)"); gr.addColorStop(0.55, "rgba(222,208,182,0.6)"); gr.addColorStop(1, "rgba(222,208,182,0)");
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
    POLVO_SPR = c; return c;
  }
  function nube(g, t, t0, x, y, n, tam, dir, vida = 0.8, alto = 30) {
    const u0 = (t - t0) / vida; if (u0 <= 0 || u0 >= 1.2) return;
    const spr = polvoSpr();
    g.save();
    for (let i = 0; i < n; i++) {
      const u = clamp(u0 - 0.05 * hash(i * 3.3 + t0)), r = tam * (0.35 + 0.85 * salida(u)) * (0.7 + 0.5 * hash(i * 1.9 + t0));
      const ang = dir === 0 ? (hash(i * 7.1 + t0) - 0.5) * 2 : dir;
      const px = x + ang * (14 + 70 * hash(i * 7.1 + t0)) * salida(u), py = y - alto * salida(u) * hash(i * 4.2 + t0) - r * 0.3;
      g.globalAlpha = 0.75 * (1 - clamp(u)) * clamp(u0 * 10);
      g.drawImage(spr, px - r, py - r, r * 2, r * 2);
    }
    g.restore();
  }
  function estrella(g, x, y, r, n = 5, ri = 0.45, a0 = -Math.PI / 2) {
    g.beginPath();
    for (let i = 0; i < n * 2; i++) { const a = a0 + i * Math.PI / n, rr = i % 2 ? r * ri : r; const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr; i ? g.lineTo(px, py) : g.moveTo(px, py); }
    g.closePath();
  }
  // polvo de las pisadas y los golpes: [t0, x, y, n, tam, dir, vida, alto]
  let POLVOS = null;
  function polvos() {
    if (POLVOS) return POLVOS;
    const L = [];
    L.push([T.ya + 0.04, XY0 - 30, SUELO_Y + 2, 9, 30, -1, 0.9, 26]);
    const ap = apoyosY().slice(2, 7);
    for (const a of ap) L.push([a[0], a[1], SUELO_Y + 2, 4, 18, -1, 0.6, 14]);
    L.push([T.choca, PIVOTE.x + 330, SUELO_G + 2, 10, 34, 0, 1.0, 34]);
    L.push([T.choca + 0.02, PIVOTE.x + 120, SUELO_G + 2, 6, 26, 0, 0.9, 20]);
    L.push([T.sube1 - 0.02, XG_UP, SUELO_G + 2, 6, 22, 0, 0.7, 16]);
    for (let i = 0; i < T.nSaltos; i++) { const tl = T.salto0 + i * T.per + T.aire; L.push([tl, xSaltoG(tl) + 4, SUELO_G + 2, 5, 17, 0, 0.6, 12]); }
    L.push([T.entra1, (XL + XR) / 2, FB + 3, 5, 18, 0, 0.6, 12]);
    POLVOS = L; return L;
  }
  function dibPolvos(g, t, delante) {
    for (const [t0, x, y, n, tam, dir, vida, alto] of polvos()) if ((y > 530) === delante) nube(g, t, t0, x, y, n, tam, dir, vida, alto);
  }
  // rayas de velocidad detrás de Yorgi
  function rayasVel(g, t, py, xG) {
    const v = vRunY(t), k = clamp((v - 380) / 500) * (1 - tramo(t, runY().tF - 0.6, runY().tF - 0.3));
    if (k < 0.01) return;
    // no cruzan por encima de Guillermo: solo por delante de él
    g.save(); g.beginPath(); g.rect(xG + 120, 0, 3000, H); g.clip(); g.lineCap = "round";
    for (let i = 0; i < 7; i++) {
      const y = SUELO_Y - 60 - i * 46 + 8 * Math.sin(i * 2.1), largo = (90 + 80 * hash(i * 3.1)) * k, ph = ((t * 3.4 + hash(i * 5.7)) % 1);
      const x0 = py.x - 70 - 40 * hash(i * 1.7) - ph * 60;
      g.globalAlpha = 0.75 * k * Math.sin(Math.PI * ph);
      g.strokeStyle = "#ffffff"; g.lineWidth = 5; g.beginPath(); g.moveTo(x0, y); g.lineTo(x0 - largo, y); g.stroke();
      g.strokeStyle = "rgba(120,150,190,0.7)"; g.lineWidth = 2; g.beginPath(); g.moveTo(x0, y + 3); g.lineTo(x0 - largo * 0.8, y + 3); g.stroke();
    }
    g.restore();
  }
  // estrellitas girando sobre la cabeza
  function estrellitas(g, t, c) {
    const k = tramo(t, T.choca + 0.05, T.choca + 0.25) * (1 - tramo(t, T.ve - 0.1, T.ve + 0.1));
    if (k < 0.01) return;
    g.save();
    for (let i = 0; i < 3; i++) {
      const a = t * 6.2 + i * TAU / 3, x = c.x + Math.cos(a) * 58, y = c.y - 30 + Math.sin(a) * 15, z = Math.sin(a);
      g.globalAlpha = k * (0.75 + 0.25 * z);
      estrella(g, x, y, (10 + 2.5 * z) * k, 5, 0.45, a * 0.5);
      g.fillStyle = "#ffe14d"; g.fill(); g.strokeStyle = TINTA; g.lineWidth = 2.4; g.stroke();
    }
    g.restore();
  }
  // rayitas de sorpresa sobre la cabeza
  function rayitas(g, t, c, t0, ang0 = -Math.PI / 2) {
    const k = campana(t, t0, t0 + 0.5); if (k < 0.01) return;
    g.save(); g.strokeStyle = TINTA; g.lineWidth = 3.4; g.lineCap = "round"; g.globalAlpha = clamp(k * 1.6);
    for (let i = -1; i <= 1; i++) { const a = ang0 + i * 0.5, r0 = 70 + 8 * k, r1 = r0 + 22 * k; g.beginPath(); g.moveTo(c.x + Math.cos(a) * r0, c.y + Math.sin(a) * r0); g.lineTo(c.x + Math.cos(a) * r1, c.y + Math.sin(a) * r1); g.stroke(); }
    g.restore();
  }
  // estallido del ¡boing!
  function boing(g, t, q) {
    const t0 = empujonDatos().tHit, k = campana(t, t0 - 0.01, t0 + 0.34); if (k < 0.01) return;
    g.save(); g.globalAlpha = clamp(k * 1.4);
    estrella(g, q.x, q.y, 40 * (0.6 + 0.4 * k), 9, 0.5, 0.2); g.fillStyle = "#fff2a8"; g.fill(); g.strokeStyle = TINTA; g.lineWidth = 3; g.stroke();
    g.strokeStyle = TINTA; g.lineWidth = 3; g.lineCap = "round";
    for (let i = 0; i < 5; i++) { const a = -2.4 + i * 0.42, r0 = 50 + 14 * (1 - k); g.beginPath(); g.moveTo(q.x + Math.cos(a) * r0, q.y + Math.sin(a) * r0); g.lineTo(q.x + Math.cos(a) * (r0 + 22), q.y + Math.sin(a) * (r0 + 22)); g.stroke(); }
    g.restore();
  }
  // el cordón entre las dos zapatillas (con un nudo en medio); M lleva los puntos al mundo (giro)
  const LAZO = P(40, 18);                              // donde se ata (respecto al tobillo, hoja)
  function lazos(p) {
    const q = l => { const pi = p.piernas[l], o = rot(LAZO, pi.ang); return G.aPantalla(p, P(pi.tob.x + o.x, pi.tob.y + o.y)); };
    return { c: q("cerca"), l: q("lejos") };
  }
  function cordon(g, t, a, b, vib) {
    const d = Math.hypot(b.x - a.x, b.y - a.y), flojo = Math.max(0, LC - d);
    const mid = P((a.x + b.x) / 2, (a.y + b.y) / 2), sag = Math.min(24, Math.sqrt(flojo * LC) * 0.42);
    const nx = -(b.y - a.y) / (d || 1), ny = (b.x - a.x) / (d || 1), v = vib * Math.sin(t * 90);
    // punto medio de la curva (con la comba y la vibración) y control de la cuadrática que pasa por él
    const m = P(mid.x + nx * v, mid.y + sag + ny * v), k = P(2 * m.x - mid.x, 2 * m.y - mid.y);
    const ruta = () => { g.beginPath(); g.moveTo(a.x, a.y); g.quadraticCurveTo(k.x, k.y, b.x, b.y); };
    g.save(); g.lineCap = "round"; g.lineJoin = "round";
    ruta(); g.strokeStyle = TINTA; g.lineWidth = 5.4; g.stroke();
    ruta(); g.strokeStyle = "#f4f1ea"; g.lineWidth = 2.8; g.stroke();
    // nudo y dos puntas colgando
    g.fillStyle = "#f4f1ea"; g.strokeStyle = TINTA; g.lineWidth = 2;
    g.beginPath(); g.ellipse(m.x, m.y, 5, 4, 0, 0, TAU); g.fill(); g.stroke();
    for (const sg of [-1, 1]) {
      const bb = Math.sin(t * 5 + sg);
      const punta = () => { g.beginPath(); g.moveTo(m.x, m.y + 2); g.quadraticCurveTo(m.x + sg * 5, m.y + 8, m.x + sg * 6 + bb * 2, m.y + 14); };
      punta(); g.strokeStyle = TINTA; g.lineWidth = 4.4; g.stroke();
      punta(); g.strokeStyle = "#f4f1ea"; g.lineWidth = 2.2; g.stroke();
    }
    g.restore();
  }
  // líneas de tensión del cordón (¡tuing!)
  function tuing(g, t, a, b) {
    const k = campana(t, T.tensa - 0.02, T.tensa + 0.3); if (k < 0.01) return;
    const m = P((a.x + b.x) / 2, (a.y + b.y) / 2);
    g.save(); g.globalAlpha = clamp(k * 1.5); g.strokeStyle = TINTA; g.lineWidth = 2.6; g.lineCap = "round";
    for (const c of [-Math.PI / 2, Math.PI / 2]) for (let i = 0; i < 2; i++) {
      const r = 14 + i * 10 + 6 * k;
      g.beginPath(); g.arc(m.x, m.y, r, c - 0.55, c + 0.55); g.stroke();
    }
    g.restore();
  }
  // campanilla de la puerta (en su brazo de hierro): se balancea al cerrarse la puerta
  const CAMPANA = P(XL + 36, FT - 30);
  function dibCampanilla(g, t) {
    const tb = t - T.cierra1, a = tb > 0 ? 0.55 * Math.exp(-tb * 2.6) * Math.sin(tb * 17) : 0.03 * Math.sin(t * 1.3);
    g.save(); g.lineCap = "round"; g.lineJoin = "round";
    // brazo de hierro con voluta
    g.strokeStyle = "#1d1d22"; g.lineWidth = 4;
    g.beginPath(); g.moveTo(CAMPANA.x - 30, CAMPANA.y - 18); g.lineTo(CAMPANA.x, CAMPANA.y - 18); g.stroke();
    g.beginPath(); g.arc(CAMPANA.x - 20, CAMPANA.y - 10, 8, -Math.PI / 2, Math.PI); g.stroke();
    g.translate(CAMPANA.x, CAMPANA.y - 18); g.rotate(a);
    g.lineWidth = 2; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, 8); g.stroke();
    g.fillStyle = "#d9a93a"; g.strokeStyle = TINTA; g.lineWidth = 2.4;
    g.beginPath(); g.moveTo(-4, 8); g.quadraticCurveTo(-6, 18, -13, 26); g.lineTo(13, 26); g.quadraticCurveTo(6, 18, 4, 8); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "rgba(255,240,170,0.8)"; g.fillRect(-3, 12, 2.5, 10);
    g.fillStyle = TINTA; g.beginPath(); g.arc(Math.sin(a * 2) * 6, 28, 3.4, 0, TAU); g.fill();
    g.restore();
    // ondas del tilín
    const k = campana(t, T.cierra1, T.cierra1 + 0.9);
    if (k > 0.01) {
      g.save(); g.strokeStyle = TINTA; g.lineWidth = 2.6; g.lineCap = "round";
      for (let i = 0; i < 3; i++) {
        const u = ((t - T.cierra1) * 2.2 + i / 3) % 1, r = 22 + 30 * u;
        g.globalAlpha = k * (1 - u);
        for (const c of [0, Math.PI]) { g.beginPath(); g.arc(CAMPANA.x, CAMPANA.y + 4, r, c - 0.45, c + 0.45); g.stroke(); }
      }
      g.restore();
    }
  }
  // semáforo de la salida: rojo → ámbar → verde (con destello)
  function dibSemaforo(g, t) {
    const x = XSEM, y0 = 40, pie = 488;
    g.save(); g.lineJoin = "round";
    // poste
    g.fillStyle = "#2d3a33"; g.strokeStyle = TINTA; g.lineWidth = 3;
    g.beginPath(); g.rect(x - 7, y0 + 150, 14, pie - y0 - 150); g.fill(); g.stroke();
    g.fillStyle = "#3d4d44"; g.fillRect(x - 3, y0 + 152, 3, pie - y0 - 156);
    g.fillStyle = "#2d3a33"; g.beginPath(); g.roundRect(x - 14, pie - 14, 28, 16, 4); g.fill(); g.stroke();
    // caja
    g.fillStyle = "#26302b"; g.beginPath(); g.roundRect(x - 26, y0, 52, 150, 10); g.fill(); g.stroke();
    const luces = [["#ff3b2f", "#5a1d18", 1 - tramo(t, T.ambar - 0.04, T.ambar + 0.04)],
      ["#ffb21e", "#5a4216", tramo(t, T.ambar - 0.04, T.ambar + 0.04) * (1 - tramo(t, T.verde - 0.04, T.verde + 0.04))],
      ["#3df07a", "#174a2a", tramo(t, T.verde - 0.04, T.verde + 0.04)]];
    luces.forEach(([on, off, k], i) => {
      const cy = y0 + 28 + i * 47;
      // visera
      g.fillStyle = "#1a201d"; g.beginPath(); g.arc(x, cy, 21, Math.PI * 1.05, Math.PI * 1.95); g.lineTo(x + 18, cy - 4); g.lineTo(x - 18, cy - 4); g.closePath(); g.fill();
      g.fillStyle = off; g.beginPath(); g.arc(x, cy, 15, 0, TAU); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 2.5; g.stroke();
      if (k > 0.01) {
        const gl = g.createRadialGradient(x, cy, 4, x, cy, 54); gl.addColorStop(0, on); gl.addColorStop(1, "rgba(255,255,255,0)");
        g.globalAlpha = 0.45 * k; g.fillStyle = gl; g.beginPath(); g.arc(x, cy, 54, 0, TAU); g.fill();
        g.globalAlpha = k; g.fillStyle = on; g.beginPath(); g.arc(x, cy, 15, 0, TAU); g.fill();
        g.fillStyle = "rgba(255,255,255,0.75)"; g.beginPath(); g.arc(x - 5, cy - 5, 4.5, 0, TAU); g.fill();
        g.globalAlpha = 1;
      }
    });
    // destello del verde
    const kd = campana(t, T.verde, T.verde + 0.5);
    if (kd > 0.01) {
      const cy = y0 + 28 + 2 * 47, u = fase(t, T.verde, T.verde + 0.5);
      g.globalAlpha = kd; g.strokeStyle = "#3df07a"; g.lineWidth = 4; g.lineCap = "round";
      for (let i = 0; i < 10; i++) { const a = i * TAU / 10 + 0.3, r0 = 30 + 40 * u, r1 = r0 + 18; g.beginPath(); g.moveTo(x + Math.cos(a) * r0, cy + Math.sin(a) * r0); g.lineTo(x + Math.cos(a) * r1, cy + Math.sin(a) * r1); g.stroke(); }
    }
    g.restore();
  }
  function sombraEl(g, x, y, rx, a = 0.22, ry = 7) { g.fillStyle = `rgba(60,40,20,${a})`; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, TAU); g.fill(); }

  /* =====================================================================================
   * FONDO (capas con paralaje)
   * ===================================================================================== */
  const Y_FACH = 400, Y_CALZ0 = 410, Y_CALZ1 = 474, Y_PASEO = 484;
  const XC0 = -60, XC1 = 2200;
  let CAPAS = null, FONDO = null, FONDO_CAM = null;
  const COL_TIZA = "rgba(252,252,246,0.86)";
  function creaCapas() {
    const capas = {};
    /* cielo (quieto) */
    {
      const [c, g] = lienzo(W, Y_CALZ0);
      const cg = g.createLinearGradient(0, 0, 0, Y_FACH); cg.addColorStop(0, "#4ea6e3"); cg.addColorStop(0.55, "#8fcbee"); cg.addColorStop(1, "#f6e2c2");
      g.fillStyle = cg; g.fillRect(0, 0, W, Y_CALZ0);
      const sol = g.createRadialGradient(60, 30, 10, 60, 30, 380); sol.addColorStop(0, "rgba(255,248,214,0.9)"); sol.addColorStop(0.3, "rgba(255,240,200,0.35)"); sol.addColorStop(1, "rgba(255,240,200,0)");
      g.fillStyle = sol; g.fillRect(0, 0, W, Y_CALZ0);
      capas.cielo = c;
    }
    /* sierra y campanario (×0,1) */
    {
      const w = 1300, [c, g] = lienzo(w, 260), y0 = 260;
      g.fillStyle = "#a9c4cf";
      g.beginPath(); g.moveTo(0, y0);
      for (let x = 0; x <= w; x += 20) g.lineTo(x, 120 + 40 * Math.sin(x * 0.006) + 26 * Math.sin(x * 0.017 + 1) + 10 * ruido(x * 0.05));
      g.lineTo(w, y0); g.closePath(); g.fill();
      g.fillStyle = "#93b3a6";
      g.beginPath(); g.moveTo(0, y0);
      for (let x = 0; x <= w; x += 20) g.lineTo(x, 168 + 24 * Math.sin(x * 0.009 + 2) + 14 * Math.sin(x * 0.023) + 6 * ruido(x * 0.07 + 3));
      g.lineTo(w, y0); g.closePath(); g.fill();
      // pueblo lejano: tejados y el campanario
      for (let i = 0; i < 40; i++) {
        const x = 30 + i * 32 + 10 * hash(i), hh = 18 + 16 * hash(i * 2.7), ww = 24 + 10 * hash(i * 3.3);
        g.fillStyle = i % 3 ? "#efe6d8" : "#e6d6bf"; g.fillRect(x, y0 - 40 - hh, ww, hh + 40);
        g.fillStyle = "#c98e6c"; g.beginPath(); g.moveTo(x - 2, y0 - 40 - hh); g.lineTo(x + ww / 2, y0 - 48 - hh); g.lineTo(x + ww + 2, y0 - 40 - hh); g.closePath(); g.fill();
      }
      const cx = 700;
      g.fillStyle = "#ecdcc0"; g.fillRect(cx - 16, 110, 32, 150);
      g.fillStyle = "#d9c5a2"; g.fillRect(cx + 6, 110, 10, 150);
      g.fillStyle = "#5c4636"; g.beginPath(); g.arc(cx, 136, 8, Math.PI, TAU); g.fill(); g.fillRect(cx - 8, 136, 16, 14);
      g.fillStyle = "#c46a46"; g.beginPath(); g.moveTo(cx - 20, 110); g.lineTo(cx, 76); g.lineTo(cx + 20, 110); g.closePath(); g.fill();
      g.strokeStyle = "#5c4636"; g.lineWidth = 2; g.beginPath(); g.moveTo(cx, 76); g.lineTo(cx, 62); g.moveTo(cx - 6, 67); g.lineTo(cx + 6, 67); g.stroke();
      capas.sierra = { c, w, y: -46, f: 0.1 };
    }
    /* fachadas al otro lado de la calzada (×0,3) */
    {
      const w = 1500, [c, g] = lienzo(w, Y_CALZ0), base = Y_FACH;
      const CASAS = [
        [0, 210, 150, "#f4efe6", "#3f7d5a"], [210, 360, 196, "#eab969", "#2f5f8a"], [360, 600, 128, "#f6f1e8", "#3a6ea5"],
        [600, 760, 176, "#e89a7a", "#3f7d5a"], [760, 980, 140, "#f2dd95", "#7a4a2a"], [980, 1150, 186, "#bcd8e6", "#2f5f8a"],
        [1150, 1340, 150, "#f4efe6", "#3f7d5a"], [1340, 1500, 170, "#c3dfc0", "#7a4a2a"]
      ];
      for (const [x0, x1, top, col, pers] of CASAS) casaLejos(g, x0, x1, top, base, col, pers);
      // acera de enfrente y bordillo
      g.fillStyle = "#d8cdb9"; g.fillRect(0, base, w, Y_CALZ0 - base);
      g.fillStyle = "#b9ad98"; g.fillRect(0, Y_CALZ0 - 3, w, 3);
      capas.fachadas = { c, w, y: 0, f: 0.3 };
    }
    /* el paseo (×1): farolas, naranjos, banco, semáforo (poste), el bar y la tiza */
    {
      const w = XC1 - XC0, [c, g] = lienzo(w, H);
      g.save(); g.translate(-XC0, 0);
      paseo(g);
      g.restore();
      capas.paseo = { c, w, x0: XC0 };
    }
    return capas;
  }
  function casaLejos(g, x0, x1, top, base, col, pers) {
    const w = x1 - x0;
    g.fillStyle = col; g.fillRect(x0, top, w, base - top);
    // textura de cal
    for (let i = 0; i < w * (base - top) / 260; i++) { const x = x0 + hash(i * 1.3 + x0) * w, y = top + hash(i * 2.9 + x0) * (base - top); g.fillStyle = `rgba(120,100,80,${0.04 + 0.05 * hash(i + x0)})`; g.fillRect(x, y, 2, 2); }
    // zócalo
    g.fillStyle = "rgba(120,96,70,0.28)"; g.fillRect(x0, base - 16, w, 16);
    // alero de teja
    g.fillStyle = "#b85c3a"; g.fillRect(x0 - 4, top - 10, w + 8, 12);
    g.fillStyle = "#cf7048"; for (let x = x0 - 4; x < x1 + 4; x += 9) { g.beginPath(); g.arc(x + 4.5, top + 2, 4.5, 0, Math.PI); g.fill(); }
    g.fillStyle = "rgba(60,40,30,0.22)"; g.fillRect(x0, top + 6, w, 6);
    // ventanas: arriba con balcón o maceteros, abajo puerta y ventanas con reja
    const n = Math.max(2, Math.round(w / 74)), paso = w / n;
    for (let i = 0; i < n; i++) {
      const cx = x0 + paso * (i + 0.5), h = hash(x0 * 0.1 + i);
      // planta alta
      const wy = top + 26, ww = 26, wh = 40;
      if (base - top > 160) {
        g.fillStyle = "#2e3a46"; g.fillRect(cx - ww / 2, wy, ww, wh);
        g.fillStyle = "rgba(170,210,235,0.5)"; g.fillRect(cx - ww / 2 + 3, wy + 3, ww / 2 - 4, wh - 6);
        g.fillStyle = pers; g.fillRect(cx - ww / 2 - 13, wy, 12, wh); g.fillRect(cx + ww / 2 + 1, wy, 12, wh);
        g.fillStyle = "rgba(0,0,0,0.18)"; for (let k = 0; k < 5; k++) { g.fillRect(cx - ww / 2 - 13, wy + 4 + k * 8, 12, 2); g.fillRect(cx + ww / 2 + 1, wy + 4 + k * 8, 12, 2); }
        if (h > 0.45) {         // balcón de hierro con geranios
          g.fillStyle = "#9a8f80"; g.fillRect(cx - 24, wy + wh, 48, 4);
          g.strokeStyle = "#2a2a2a"; g.lineWidth = 1.5; g.strokeRect(cx - 22, wy + wh - 16, 44, 16);
          for (let k = 0; k < 9; k++) { g.beginPath(); g.moveTo(cx - 22 + k * 5.5, wy + wh - 16); g.lineTo(cx - 22 + k * 5.5, wy + wh); g.stroke(); }
          for (let k = 0; k < 5; k++) { g.fillStyle = "#3f7a3a"; g.beginPath(); g.arc(cx - 18 + k * 9, wy + wh - 18, 5, 0, TAU); g.fill(); g.fillStyle = k % 2 ? "#e8364a" : "#ff6b7a"; g.beginPath(); g.arc(cx - 17 + k * 9, wy + wh - 21, 3, 0, TAU); g.fill(); }
        } else {
          g.fillStyle = "#b46a46"; g.fillRect(cx - 17, wy + wh, 34, 7);
          for (let k = 0; k < 4; k++) { g.fillStyle = "#3f7a3a"; g.beginPath(); g.arc(cx - 12 + k * 8, wy + wh - 2, 4.5, 0, TAU); g.fill(); g.fillStyle = "#e8364a"; g.beginPath(); g.arc(cx - 11 + k * 8, wy + wh - 5, 2.6, 0, TAU); g.fill(); }
        }
      }
      // planta baja
      const by = base - 82;
      if (i === (Math.floor(h * 10) % n)) {
        g.fillStyle = "#6b4428"; g.fillRect(cx - 17, by - 6, 34, 88);
        g.fillStyle = "rgba(0,0,0,0.25)"; g.fillRect(cx - 13, by, 12, 76); g.fillRect(cx + 1, by, 12, 76);
        g.fillStyle = "#d9b24a"; g.beginPath(); g.arc(cx + 9, by + 44, 2, 0, TAU); g.fill();
      } else {
        g.fillStyle = "#2e3a46"; g.fillRect(cx - 14, by + 14, 28, 40);
        g.strokeStyle = "#1c1c1c"; g.lineWidth = 2; for (let k = 0; k < 5; k++) { g.beginPath(); g.moveTo(cx - 12 + k * 6, by + 12); g.lineTo(cx - 12 + k * 6, by + 56); g.stroke(); }
        g.beginPath(); g.moveTo(cx - 16, by + 24); g.lineTo(cx + 16, by + 24); g.stroke();
        if (h > 0.3) { g.fillStyle = "#2f63a8"; g.fillRect(cx + 20, by + 34, 10, 12); g.fillStyle = "#3f7a3a"; g.beginPath(); g.arc(cx + 25, by + 30, 7, 0, TAU); g.fill(); g.fillStyle = "#ff6b7a"; g.beginPath(); g.arc(cx + 25, by + 26, 3, 0, TAU); g.fill(); }
      }
    }
    // bajante
    g.fillStyle = "rgba(90,80,70,0.5)"; g.fillRect(x1 - 6, top + 2, 4, base - top - 2);
    g.strokeStyle = "rgba(0,0,0,0.25)"; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x1, top); g.lineTo(x1, base); g.stroke();
  }
  // el paseo en coordenadas del mundo
  function paseo(g) {
    const x0 = XC0, x1 = XC1;
    // bordillo y suelo de losas
    g.fillStyle = "#b8ad9a"; g.fillRect(x0, Y_CALZ1, x1 - x0, Y_PASEO - Y_CALZ1);
    g.fillStyle = "#d3c8b4"; g.fillRect(x0, Y_CALZ1, x1 - x0, 4);
    const gs = g.createLinearGradient(0, Y_PASEO, 0, H); gs.addColorStop(0, "#dccdb1"); gs.addColorStop(1, "#e8dcc4");
    g.fillStyle = gs; g.fillRect(x0, Y_PASEO, x1 - x0, H - Y_PASEO);
    const filas = [Y_PASEO, 500, 520, 546, 578, 616];
    g.strokeStyle = "rgba(150,132,104,0.55)"; g.lineWidth = 1.6;
    for (let r = 0; r < filas.length - 1; r++) {
      const ya = filas[r], yb = filas[r + 1];
      g.beginPath(); g.moveTo(x0, ya); g.lineTo(x1, ya); g.stroke();
      const paso = 52 + r * 16, off = (r % 2) * paso / 2;
      for (let x = x0 - 200 + off; x < x1 + 200; x += paso) { g.beginPath(); g.moveTo(x + (ya - Y_PASEO) * -0.28, ya); g.lineTo(x + (yb - Y_PASEO) * -0.28, yb); g.stroke(); }
    }
    // manchas y desgaste
    for (let i = 0; i < 900; i++) { const x = x0 + hash(i * 1.7) * (x1 - x0), y = Y_PASEO + hash(i * 3.1) * (H - Y_PASEO); g.fillStyle = `rgba(110,90,60,${0.04 + 0.05 * hash(i * 5.3)})`; g.beginPath(); g.ellipse(x, y, 2 + 5 * hash(i), 1 + 2 * hash(i * 2), 0, 0, TAU); g.fill(); }
    // tiza: calles, salida, rayuela, garabatos y la meta
    tiza(g);
    // objetos del paseo (al fondo del paseo, delante de la calzada)
    for (const x of [140, 1330]) farola(g, x);
    for (const x of [-10, 1000]) naranjo(g, x);
    banco(g, 1160);
    bar(g);
  }
  function linTiza(g, pts, ancho = 4, col = COL_TIZA) {
    g.save(); g.strokeStyle = col; g.lineWidth = ancho; g.lineCap = "round"; g.lineJoin = "round";
    g.beginPath(); pts.forEach((q, i) => { const j = P(q.x + (hash(i * 3.3 + q.x) - 0.5) * 1.6, q.y + (hash(i * 7.7 + q.y) - 0.5) * 1.2); i ? g.lineTo(j.x, j.y) : g.moveTo(j.x, j.y); }); g.stroke();
    g.globalAlpha = 0.35; g.lineWidth = ancho * 0.5; g.strokeStyle = "rgba(255,255,255,0.9)"; g.stroke();
    g.restore();
  }
  const oblicua = (x, y) => P(x + (y - Y_PASEO) * -0.28, y);
  function tiza(g) {
    // calles (líneas discontinuas)
    for (const y of [488, 536, 594]) for (let x = XS_G - 40; x < XL - 70; x += 60) linTiza(g, [P(x, y), P(x + 36, y + 0.5)], 3);
    // salida escalonada: una marca doble en cada calle, con su triangulito
    for (const [x, y0, y1] of [[XS_G, 538, 594], [XS_Y, 490, 534]]) {
      for (const dx of [0, 9]) linTiza(g, [oblicua(x + dx, y0), oblicua(x + dx, (y0 + y1) / 2), oblicua(x + dx, y1)], 4.5);
      const c = oblicua(x - 18, (y0 + y1) / 2); linTiza(g, [P(c.x - 8, c.y - 8), P(c.x + 4, c.y), P(c.x - 8, c.y + 8), P(c.x - 8, c.y - 8)], 3);
    }
    // flecha y un sol de tiza
    linTiza(g, [P(XS_G + 520, 566), P(XS_G + 590, 566)], 4, "rgba(255,226,120,0.9)");
    linTiza(g, [P(XS_G + 576, 556), P(XS_G + 592, 566), P(XS_G + 576, 576)], 4, "rgba(255,226,120,0.9)");
    {
      const cx = 840, cy = 512;
      g.save(); g.strokeStyle = "rgba(255,226,120,0.85)"; g.lineWidth = 3.5; g.beginPath(); g.ellipse(cx, cy, 16, 9, 0, 0, TAU); g.stroke();
      for (let i = 0; i < 8; i++) { const a = i * TAU / 8; linTiza(g, [P(cx + Math.cos(a) * 22, cy + Math.sin(a) * 12), P(cx + Math.cos(a) * 31, cy + Math.sin(a) * 17)], 3, "rgba(255,226,120,0.85)"); }
      g.restore();
    }
    // rayuela (sin números)
    {
      const xa = 1080, ya = 540, yb = 598, wC = 46;
      const caja = (x, y0, y1) => { const a = oblicua(x, y0), b = oblicua(x + wC, y0), c = oblicua(x + wC, y1), d = oblicua(x, y1); linTiza(g, [a, b, c, d, a], 3.2, "rgba(255,190,214,0.9)"); };
      caja(xa, ya, yb); caja(xa + wC, ya, yb); caja(xa + 2 * wC, ya, (ya + yb) / 2); caja(xa + 2 * wC, (ya + yb) / 2, yb); caja(xa + 3 * wC, ya, yb);
      caja(xa + 4 * wC, ya, (ya + yb) / 2); caja(xa + 4 * wC, (ya + yb) / 2, yb); caja(xa + 5 * wC, ya, yb);
      const c = oblicua(xa + 6 * wC + 22, (ya + yb) / 2); g.save(); g.strokeStyle = "rgba(255,190,214,0.9)"; g.lineWidth = 3.2; g.beginPath(); g.ellipse(c.x, c.y, 26, 26, 0, -Math.PI / 2, Math.PI / 2); g.stroke(); g.restore();
    }
    // corazón y estrella de tiza azul
    {
      const cx = 1540, cy = 572;
      linTiza(g, [P(cx, cy + 10), P(cx - 14, cy - 2), P(cx - 9, cy - 10), P(cx, cy - 4), P(cx + 9, cy - 10), P(cx + 14, cy - 2), P(cx, cy + 10)], 3, "rgba(160,214,255,0.9)");
    }
    // meta: tablero de tiza delante de la puerta
    {
      const xm = XL - 52, n = 6, h = (598 - 486) / n;
      for (let i = 0; i < n; i++) for (let j = 0; j < 2; j++) {
        if ((i + j) % 2) continue;
        const ya = 486 + i * h, yb = ya + h, a = oblicua(xm + j * 14, ya), b = oblicua(xm + (j + 1) * 14, ya), c = oblicua(xm + (j + 1) * 14, yb), d = oblicua(xm + j * 14, yb);
        g.fillStyle = "rgba(252,252,246,0.72)"; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.lineTo(c.x, c.y); g.lineTo(d.x, d.y); g.closePath(); g.fill();
      }
      linTiza(g, [oblicua(xm, 486), oblicua(xm, 598)], 3); linTiza(g, [oblicua(xm + 28, 486), oblicua(xm + 28, 598)], 3);
    }
  }
  function farola(g, x) {
    const pie = 486;
    g.save(); g.lineJoin = "round";
    g.fillStyle = "#24302b"; g.strokeStyle = TINTA; g.lineWidth = 3;
    // basa con molduras
    g.beginPath(); g.moveTo(x - 24, pie); g.lineTo(x - 20, pie - 18); g.lineTo(x - 14, pie - 22); g.lineTo(x - 14, pie - 90); g.lineTo(x - 18, pie - 98); g.lineTo(x - 10, pie - 110);
    g.lineTo(x + 10, pie - 110); g.lineTo(x + 18, pie - 98); g.lineTo(x + 14, pie - 90); g.lineTo(x + 14, pie - 22); g.lineTo(x + 20, pie - 18); g.lineTo(x + 24, pie); g.closePath(); g.fill(); g.stroke();
    // fuste estriado hasta arriba
    g.beginPath(); g.rect(x - 8, -10, 16, pie - 100); g.fill(); g.stroke();
    g.fillStyle = "rgba(160,190,175,0.25)"; g.fillRect(x - 5, -10, 3, pie - 110); g.fillRect(x - 10, pie - 104, 3, 80);
    g.fillStyle = "#c8a24a"; g.fillRect(x - 15, pie - 62, 30, 5);
    g.restore();
  }
  function naranjo(g, x) {
    const pie = 486;
    g.save();
    // alcorque
    g.fillStyle = "#7a6a52"; g.beginPath(); g.ellipse(x, pie + 2, 46, 8, 0, 0, TAU); g.fill();
    g.fillStyle = "#4a3e30"; g.beginPath(); g.ellipse(x, pie + 1, 38, 6, 0, 0, TAU); g.fill();
    // tronco
    g.fillStyle = "#6b4a32"; g.strokeStyle = TINTA; g.lineWidth = 3;
    g.beginPath(); g.moveTo(x - 16, pie); g.quadraticCurveTo(x - 10, pie - 200, x - 14, pie - 380); g.lineTo(x + 12, pie - 380); g.quadraticCurveTo(x + 8, pie - 200, x + 14, pie); g.closePath(); g.fill(); g.stroke();
    g.strokeStyle = "rgba(40,25,15,0.35)"; g.lineWidth = 2; for (let k = 0; k < 6; k++) { g.beginPath(); g.moveTo(x - 6 + k * 2, pie - 10 - k * 30); g.quadraticCurveTo(x + 2, pie - 30 - k * 30, x - 4 + k, pie - 50 - k * 30); g.stroke(); }
    // copa (la parte de abajo; la de arriba se sale del cuadro)
    const bolas = [[-90, 150, 70], [-30, 180, 80], [50, 160, 78], [110, 130, 60], [0, 120, 76], [-120, 100, 56], [130, 80, 56], [-60, 90, 70], [60, 90, 70]];
    for (const [dx, dy, r] of bolas) { g.fillStyle = "#24502e"; g.beginPath(); g.arc(x + dx, pie - 380 - dy + 150, r, 0, TAU); g.fill(); }
    for (const [dx, dy, r] of bolas) { g.fillStyle = "#2f6a3a"; g.beginPath(); g.arc(x + dx - r * 0.15, pie - 380 - dy + 150 - r * 0.2, r * 0.75, 0, TAU); g.fill(); }
    for (let i = 0; i < 26; i++) { const a = hash(i * 3.7 + x) * TAU, r = 40 + 120 * hash(i * 1.9 + x); const ox = x + Math.cos(a) * r * 1.1, oy = pie - 380 + 40 + Math.sin(a) * r * 0.55;
      if (oy > 10) { g.fillStyle = "#f39a1e"; g.beginPath(); g.arc(ox, oy, 7, 0, TAU); g.fill(); g.strokeStyle = "rgba(90,40,0,0.6)"; g.lineWidth = 1.5; g.stroke(); g.fillStyle = "rgba(255,230,150,0.8)"; g.beginPath(); g.arc(ox - 2, oy - 2, 2, 0, TAU); g.fill(); } }
    g.restore();
  }
  function banco(g, x) {
    const pie = 486;
    g.save(); g.lineJoin = "round"; g.strokeStyle = TINTA; g.lineWidth = 3;
    // patas de hierro
    g.fillStyle = "#24302b";
    for (const dx of [-110, 96]) { g.beginPath(); g.moveTo(x + dx, pie); g.lineTo(x + dx + 6, pie - 78); g.lineTo(x + dx + 16, pie - 78); g.lineTo(x + dx + 12, pie); g.closePath(); g.fill(); g.stroke();
      g.beginPath(); g.moveTo(x + dx + 8, pie - 78); g.quadraticCurveTo(x + dx - 6, pie - 120, x + dx + 4, pie - 170); g.lineWidth = 7; g.stroke(); g.lineWidth = 3; }
    // listones
    g.fillStyle = "#a8683c";
    for (const [y, h] of [[pie - 86, 12], [pie - 74, 10]]) { g.beginPath(); g.rect(x - 128, y, 256, h); g.fill(); g.stroke(); }
    for (const y of [pie - 172, pie - 148, pie - 124]) { g.beginPath(); g.rect(x - 124, y, 248, 16); g.fill(); g.stroke(); }
    g.fillStyle = "rgba(255,220,170,0.3)"; for (const y of [pie - 170, pie - 146, pie - 122, pie - 84]) g.fillRect(x - 120, y, 240, 3);
    g.restore();
  }
  // el bar: quiosco encalado al fondo del paseo, con su puerta, ventanas y la máquina
  const BAR0 = 1380, BAR1 = 2200;
  function bar(g) {
    const top = 26;
    g.save(); g.lineJoin = "round";
    // sombra del alero sobre la pared
    g.fillStyle = "#f6f0e4"; g.fillRect(BAR0, top, BAR1 - BAR0, FB - top);
    for (let i = 0; i < 1400; i++) { const x = BAR0 + hash(i * 1.1) * (BAR1 - BAR0), y = top + hash(i * 2.3) * (FB - top); g.fillStyle = `rgba(130,110,90,${0.03 + 0.05 * hash(i * 4.4)})`; g.fillRect(x, y, 2.5, 2.5); }
    const sa = g.createLinearGradient(0, top, 0, top + 40); sa.addColorStop(0, "rgba(90,60,40,0.35)"); sa.addColorStop(1, "rgba(90,60,40,0)");
    g.fillStyle = sa; g.fillRect(BAR0, top, BAR1 - BAR0, 40);
    // esquina con sombra
    g.fillStyle = "rgba(120,100,80,0.18)"; g.fillRect(BAR0, top, 14, FB - top);
    g.strokeStyle = TINTA; g.lineWidth = 3; g.beginPath(); g.moveTo(BAR0, top); g.lineTo(BAR0, FB); g.stroke();
    // zócalo de azulejos
    const z0 = FB - 64;
    g.fillStyle = "#fbf8f0"; g.fillRect(BAR0, z0, BAR1 - BAR0, FB - z0);
    for (let x = BAR0; x < BAR1; x += 32) for (let y = z0; y < FB; y += 32) {
      g.strokeStyle = "rgba(120,130,150,0.5)"; g.lineWidth = 1; g.strokeRect(x, y, 32, 32);
      g.fillStyle = "#2f63a8"; g.beginPath(); g.moveTo(x + 16, y + 4); g.lineTo(x + 28, y + 16); g.lineTo(x + 16, y + 28); g.lineTo(x + 4, y + 16); g.closePath(); g.fill();
      g.fillStyle = "#f2c14a"; g.beginPath(); g.arc(x + 16, y + 16, 4, 0, TAU); g.fill();
      g.fillStyle = "#2f63a8"; for (const [cx, cy] of [[x, y], [x + 32, y], [x, y + 32], [x + 32, y + 32]]) { g.beginPath(); g.arc(cx, cy, 5, 0, TAU); g.fill(); }
    }
    g.fillStyle = "#2f63a8"; g.fillRect(BAR0, z0 - 6, BAR1 - BAR0, 6);
    g.strokeStyle = TINTA; g.lineWidth = 2.5; g.beginPath(); g.moveTo(BAR0, z0 - 6); g.lineTo(BAR1, z0 - 6); g.stroke();
    // escalón y umbral
    g.fillStyle = "#cfc3ad"; g.fillRect(BAR0, FB, BAR1 - BAR0, 6);
    g.strokeStyle = "rgba(0,0,0,0.35)"; g.lineWidth = 1.5; g.beginPath(); g.moveTo(BAR0, FB + 6); g.lineTo(BAR1, FB + 6); g.stroke();
    // ventanas (con jamones colgados y botellas al trasluz)
    ventanaBar(g, 1410, 1530, 170, 404);
    ventanaBar(g, 2080, 2190, 170, 404);
    // hueco de la puerta: el interior en penumbra cálida
    const gi = g.createLinearGradient(0, FT, 0, FB);
    gi.addColorStop(0, "#1d120c"); gi.addColorStop(0.65, "#3a2416"); gi.addColorStop(1, "#4d311d");
    g.fillStyle = gi; g.fillRect(XL, FT, WD, FB - FT);
    g.save(); g.beginPath(); g.rect(XL, FT, WD, FB - FT); g.clip();
    const lz = g.createRadialGradient(XL + 150, FT + 120, 6, XL + 150, FT + 120, 220); lz.addColorStop(0, "rgba(255,200,120,0.5)"); lz.addColorStop(1, "rgba(255,200,120,0)");
    g.fillStyle = lz; g.fillRect(XL, FT, WD, FB - FT);
    g.fillStyle = "rgba(255,214,140,0.9)"; g.beginPath(); g.arc(XL + 150, FT + 92, 9, 0, TAU); g.fill();
    g.strokeStyle = "rgba(20,10,5,0.8)"; g.lineWidth = 2; g.beginPath(); g.moveTo(XL + 150, FT); g.lineTo(XL + 150, FT + 80); g.stroke();
    g.fillStyle = "#2b1a10"; g.beginPath(); g.moveTo(XL + 136, FT + 82); g.lineTo(XL + 164, FT + 82); g.lineTo(XL + 158, FT + 94); g.lineTo(XL + 142, FT + 94); g.closePath(); g.fill();
    // barra y taburetes al fondo
    g.fillStyle = "rgba(25,14,8,0.85)"; g.fillRect(XL + 20, FB - 150, WD - 20, 18); g.fillRect(XL + 30, FB - 132, WD - 30, 132);
    g.fillStyle = "rgba(190,140,80,0.35)"; g.fillRect(XL + 20, FB - 152, WD - 20, 3);
    for (const sx of [XL + 60, XL + 150]) { g.fillStyle = "rgba(15,8,4,0.9)"; g.beginPath(); g.ellipse(sx, FB - 96, 22, 6, 0, 0, TAU); g.fill(); g.fillRect(sx - 3, FB - 96, 6, 96); g.fillRect(sx - 16, FB - 4, 32, 4); }
    g.restore();
    // marco de la puerta
    const mol = 14;
    g.fillStyle = "#2e6b4f"; g.strokeStyle = TINTA; g.lineWidth = 3;
    g.beginPath(); g.rect(XL - mol, FT - mol, WD + 2 * mol, mol); g.fill(); g.stroke();
    g.beginPath(); g.rect(XL - mol, FT, mol, FB - FT); g.fill(); g.stroke();
    g.beginPath(); g.rect(XR, FT, mol, FB - FT); g.fill(); g.stroke();
    g.fillStyle = "rgba(255,255,255,0.22)"; g.fillRect(XL - mol + 3, FT - mol + 3, WD + 2 * mol - 6, 3); g.fillRect(XL - mol + 3, FT + 2, 3, FB - FT - 4); g.fillRect(XR + 3, FT + 2, 3, FB - FT - 4);
    g.fillStyle = "#b9ad98"; g.fillRect(XL - mol, FB - 2, WD + 2 * mol, 8);
    // farolillo sobre la puerta
    farolillo(g, XL + WD / 2, FT - 34);
    // cartel colgado de su brazo, con la jarra
    cartel(g, 1470, 72);
    // la máquina del alcoholímetro (con sus cifras)
    maquina(g, 2004, 270);
    // maceta azul con geranios junto a la puerta
    for (const mx of [XL - 38]) maceta(g, mx, FB);
    // alero de teja
    g.fillStyle = "#a9512f"; g.fillRect(BAR0 - 20, top - 30, BAR1 - BAR0 + 40, 30);
    for (let x = BAR0 - 20; x < BAR1 + 20; x += 18) { g.fillStyle = "#c8643e"; g.beginPath(); g.moveTo(x, top - 30); g.lineTo(x, top - 4); g.quadraticCurveTo(x + 9, top + 6, x + 18, top - 4); g.lineTo(x + 18, top - 30); g.closePath(); g.fill();
      g.strokeStyle = "rgba(60,20,10,0.55)"; g.lineWidth = 1.5; g.stroke(); g.fillStyle = "rgba(255,190,150,0.35)"; g.fillRect(x + 3, top - 28, 3, 20); }
    g.restore();
  }
  function ventanaBar(g, x0, x1, y0, y1) {
    g.save();
    const gi = g.createLinearGradient(0, y0, 0, y1); gi.addColorStop(0, "#5a3a22"); gi.addColorStop(1, "#7a4e2c");
    g.fillStyle = gi; g.fillRect(x0, y0, x1 - x0, y1 - y0);
    g.beginPath(); g.rect(x0, y0, x1 - x0, y1 - y0); g.clip();
    const lz = g.createRadialGradient((x0 + x1) / 2, y0 + 40, 4, (x0 + x1) / 2, y0 + 40, 200); lz.addColorStop(0, "rgba(255,214,150,0.6)"); lz.addColorStop(1, "rgba(255,214,150,0)");
    g.fillStyle = lz; g.fillRect(x0, y0, x1 - x0, y1 - y0);
    // balda con botellas
    g.fillStyle = "#3a2414"; g.fillRect(x0, y1 - 70, x1 - x0, 6);
    for (let i = 0; i < (x1 - x0) / 18; i++) { const bx = x0 + 8 + i * 18, bh = 34 + 12 * hash(i + x0); g.fillStyle = ["#2f6a3a", "#8a2a1a", "#c98a2a", "#3a4a7a"][i % 4]; g.fillRect(bx, y1 - 70 - bh, 10, bh); g.fillRect(bx + 3, y1 - 70 - bh - 10, 4, 10); g.fillStyle = "rgba(255,255,255,0.35)"; g.fillRect(bx + 2, y1 - 66 - bh, 2, bh - 8); }
    // jamones colgados
    for (let i = 0; i < 2; i++) {
      const jx = x0 + (x1 - x0) * (0.3 + 0.4 * i), jy = y0 + 12;
      g.strokeStyle = "#e8d9b0"; g.lineWidth = 2; g.beginPath(); g.moveTo(jx, y0); g.lineTo(jx, jy + 8); g.stroke();
      g.fillStyle = "#7a3b22"; g.strokeStyle = TINTA; g.lineWidth = 2;
      g.beginPath(); g.moveTo(jx - 3, jy + 6); g.lineTo(jx + 3, jy + 6); g.quadraticCurveTo(jx + 26, jy + 40, jx + 16, jy + 82); g.quadraticCurveTo(jx, jy + 96, jx - 16, jy + 82); g.quadraticCurveTo(jx - 26, jy + 40, jx - 3, jy + 6); g.closePath(); g.fill(); g.stroke();
      g.fillStyle = "#f1e2c8"; g.beginPath(); g.ellipse(jx, jy + 84, 13, 6, 0, 0, TAU); g.fill();
      g.fillStyle = "rgba(255,200,150,0.35)"; g.beginPath(); g.ellipse(jx - 6, jy + 44, 4, 18, 0.1, 0, TAU); g.fill();
    }
    // reflejo del cristal
    g.strokeStyle = "rgba(255,255,255,0.4)"; g.lineWidth = 12; g.beginPath(); g.moveTo(x0 + 20, y1); g.lineTo(x0 + 120, y0); g.stroke();
    g.lineWidth = 5; g.beginPath(); g.moveTo(x0 + 50, y1); g.lineTo(x0 + 150, y0); g.stroke();
    g.restore();
    // marco y cuarterones
    g.strokeStyle = TINTA; g.lineWidth = 3; g.fillStyle = "#2e6b4f";
    g.beginPath(); g.rect(x0 - 10, y0 - 10, x1 - x0 + 20, 10); g.fill(); g.stroke();
    g.beginPath(); g.rect(x0 - 10, y1, x1 - x0 + 20, 12); g.fill(); g.stroke();
    g.beginPath(); g.rect(x0 - 10, y0, 10, y1 - y0); g.fill(); g.stroke();
    g.beginPath(); g.rect(x1, y0, 10, y1 - y0); g.fill(); g.stroke();
    g.beginPath(); g.rect((x0 + x1) / 2 - 3, y0, 6, y1 - y0); g.fill(); g.stroke();
    // maceteros en el alféizar
    for (let i = 0; i < 3; i++) { const mx = x0 + 18 + i * (x1 - x0 - 36) / 2; g.fillStyle = "#b46a46"; g.fillRect(mx - 10, y1 + 1, 20, 9); g.fillStyle = "#3f7a3a"; g.beginPath(); g.arc(mx, y1 - 4, 8, 0, TAU); g.fill(); g.fillStyle = "#e8364a"; g.beginPath(); g.arc(mx - 2, y1 - 8, 3.5, 0, TAU); g.fill(); g.beginPath(); g.arc(mx + 4, y1 - 5, 3, 0, TAU); g.fill(); }
  }
  function farolillo(g, x, y) {
    g.save(); g.strokeStyle = TINTA; g.lineWidth = 2.5; g.fillStyle = "#1d1d22";
    g.beginPath(); g.moveTo(x - 10, y - 4); g.lineTo(x + 10, y - 4); g.lineTo(x + 14, y - 12); g.lineTo(x - 14, y - 12); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#ffe7a6"; g.beginPath(); g.moveTo(x - 9, y - 4); g.lineTo(x + 9, y - 4); g.lineTo(x + 7, y + 12); g.lineTo(x - 7, y + 12); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#1d1d22"; g.fillRect(x - 9, y + 12, 18, 4);
    g.restore();
  }
  function cartel(g, x, y) {
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    g.strokeStyle = "#1d1d22"; g.lineWidth = 4;
    g.beginPath(); g.moveTo(x - 60, y - 20); g.lineTo(x + 60, y - 20); g.stroke();
    g.beginPath(); g.moveTo(x - 60, y - 6); g.quadraticCurveTo(x - 40, y - 22, x - 20, y - 20); g.stroke();
    g.beginPath(); g.arc(x - 48, y - 6, 8, Math.PI, TAU * 0.9); g.stroke();
    g.lineWidth = 2; g.beginPath(); g.moveTo(x - 40, y - 20); g.lineTo(x - 40, y); g.moveTo(x + 40, y - 20); g.lineTo(x + 40, y); g.stroke();
    g.fillStyle = "#2e6b4f"; g.strokeStyle = TINTA; g.lineWidth = 3;
    g.beginPath(); g.roundRect(x - 56, y, 112, 74, 10); g.fill(); g.stroke();
    g.strokeStyle = "#e6be5a"; g.lineWidth = 2; g.beginPath(); g.roundRect(x - 50, y + 6, 100, 62, 7); g.stroke();
    // jarra de cerveza
    const jx = x - 8, jy = y + 14;
    g.fillStyle = "#f5aa1d"; g.strokeStyle = TINTA; g.lineWidth = 2.4;
    g.beginPath(); g.roundRect(jx - 14, jy + 8, 30, 38, 4); g.fill(); g.stroke();
    g.beginPath(); g.arc(jx + 18, jy + 26, 9, -Math.PI / 2, Math.PI / 2); g.lineWidth = 4; g.stroke(); g.strokeStyle = "#f5aa1d"; g.lineWidth = 1.8; g.stroke();
    g.fillStyle = "#fff8e8"; g.strokeStyle = TINTA; g.lineWidth = 2.2;
    g.beginPath(); g.arc(jx - 9, jy + 8, 7, Math.PI, TAU); g.arc(jx + 1, jy + 5, 8, Math.PI, TAU); g.arc(jx + 11, jy + 8, 7, Math.PI, TAU); g.lineTo(jx + 16, jy + 12); g.lineTo(jx - 14, jy + 12); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "rgba(255,255,255,0.6)"; g.fillRect(jx - 9, jy + 16, 3, 24);
    g.restore();
  }
  function maquina(g, x, y) {
    g.save(); g.lineJoin = "round";
    g.fillStyle = "#c0322b"; g.strokeStyle = TINTA; g.lineWidth = 3;
    g.beginPath(); g.roundRect(x, y, 58, 116, 7); g.fill(); g.stroke();
    g.fillStyle = "rgba(255,255,255,0.18)"; g.fillRect(x + 4, y + 4, 5, 108);
    // pantalla con cifras
    g.fillStyle = "#14080a"; g.beginPath(); g.roundRect(x + 8, y + 12, 42, 24, 3); g.fill(); g.stroke();
    g.fillStyle = "#ff3b2f"; g.font = "bold 17px monospace"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("0.00", x + 29, y + 25);
    // ranura de monedas y boquilla
    g.fillStyle = "#e6be5a"; g.beginPath(); g.roundRect(x + 21, y + 48, 16, 20, 3); g.fill(); g.stroke();
    g.fillStyle = TINTA; g.fillRect(x + 28, y + 52, 3, 12);
    g.strokeStyle = TINTA; g.lineWidth = 6; g.lineCap = "round"; g.beginPath(); g.moveTo(x + 50, y + 84); g.quadraticCurveTo(x + 70, y + 92, x + 64, y + 108); g.stroke();
    g.strokeStyle = "#f2f2f2"; g.lineWidth = 3; g.stroke();
    g.fillStyle = "#f2f2f2"; g.strokeStyle = TINTA; g.lineWidth = 2; g.beginPath(); g.roundRect(x + 10, y + 80, 22, 26, 3); g.fill(); g.stroke();
    g.restore();
  }
  function maceta(g, x, pie) {
    g.save(); g.strokeStyle = TINTA; g.lineWidth = 2.5;
    g.fillStyle = "#2f63a8"; g.beginPath(); g.moveTo(x - 20, pie - 46); g.lineTo(x + 20, pie - 46); g.lineTo(x + 15, pie); g.lineTo(x - 15, pie); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "rgba(255,255,255,0.25)"; g.fillRect(x - 14, pie - 42, 4, 36);
    for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i - 3) * 0.42, r = 24 + 8 * hash(i); g.fillStyle = "#3f7a3a"; g.beginPath(); g.arc(x + Math.cos(a) * r * 0.8, pie - 50 + Math.sin(a) * r * 0.7, 11, 0, TAU); g.fill(); }
    for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * 0.55; g.fillStyle = i % 2 ? "#e8364a" : "#ff6b7a"; g.beginPath(); g.arc(x + Math.cos(a) * 20, pie - 54 + Math.sin(a) * 18, 5, 0, TAU); g.fill(); }
    g.restore();
  }
  function dibCapa(g, L, cam) {
    const off = cam * L.f;
    g.drawImage(L.c, -off, L.y);
  }
  // nubes y pájaros (se mueven solos)
  function cielo(g, t, cam) {
    const NB = [[120, 70, 1.1], [520, 46, 0.8], [880, 96, 1.2], [1260, 60, 0.9], [1600, 84, 1]];
    for (const [x0, y, k] of NB) {
      const x = ((x0 - cam * 0.05 + t * 6) % 1700 + 1700) % 1700 - 300;
      g.save(); g.translate(x, y); g.scale(k, k);
      g.fillStyle = "rgba(255,255,255,0.92)";
      for (const [dx, dy, r] of [[0, 0, 30], [32, -12, 36], [70, 0, 28], [36, 8, 30], [-26, 8, 20], [96, 10, 18]]) { g.beginPath(); g.arc(dx, dy, r, 0, TAU); g.fill(); }
      g.fillStyle = "rgba(200,222,240,0.6)"; g.beginPath(); g.ellipse(36, 22, 70, 9, 0, 0, TAU); g.fill();
      g.restore();
    }
    // pájaros
    g.save(); g.strokeStyle = "rgba(40,50,70,0.7)"; g.lineWidth = 2; g.lineCap = "round";
    for (let i = 0; i < 4; i++) {
      const x = ((200 + i * 70 + t * 30 - cam * 0.08) % 1300 + 1300) % 1300 - 100, y = 120 + 14 * Math.sin(i * 2.1) + 6 * Math.sin(t * 1.5 + i), a = 5 * Math.sin(t * 9 + i * 1.7);
      g.beginPath(); g.moveTo(x - 7, y - a * 0.4); g.quadraticCurveTo(x - 3, y - 3 - a * 0.5, x, y); g.quadraticCurveTo(x + 3, y - 3 - a * 0.5, x + 7, y - a * 0.4); g.stroke();
    }
    g.restore();
  }
  function fondo(g, t, cam) {
    if (!CAPAS) CAPAS = creaCapas();
    g.drawImage(CAPAS.cielo, 0, 0);
    cielo(g, t, cam);
    dibCapa(g, CAPAS.sierra, cam);
    dibCapa(g, CAPAS.fachadas, cam);
    // calzada (lisa: el paralaje no se nota más que en las rayas)
    g.fillStyle = "#77706a"; g.fillRect(0, Y_CALZ0, W, Y_CALZ1 - Y_CALZ0);
    g.fillStyle = "rgba(0,0,0,0.08)"; g.fillRect(0, Y_CALZ0, W, 8);
    g.fillStyle = "rgba(245,240,226,0.8)";
    const off = (cam * 0.6) % 120;
    for (let x = -off - 120; x < W + 120; x += 120) g.fillRect(x, (Y_CALZ0 + Y_CALZ1) / 2 - 2, 60, 4);
    g.drawImage(CAPAS.paseo.c, CAPAS.paseo.x0 - cam, 0);
  }

  /* =====================================================================================
   * DIBUJO
   * ===================================================================================== */
  let MUNDO = null;
  const ZOOM_C = P(660, 300);
  function dibujaG(g, Q, t) {
    const { p, giro } = Q;
    g.save();
    if (giro) { g.translate(giro.W.x, giro.W.y); g.rotate(giro.phi); g.translate(-giro.Pp.x, -giro.Pp.y); }
    if (Q.fx !== undefined && Q.fx !== 1) { g.translate(p.x, 0); g.scale(Q.fx, 1); g.translate(-p.x, 0); }
    G.dibujar(g, p, t);
    // el cordón, en el mismo giro
    if (!enRendija(t)) {
      const lz = lazos(p), vib = 5 * Math.exp(-Math.max(0, t - T.tensa) * 14) * (t > T.tensa ? 1 : 0);
      cordon(g, t, lz.c, lz.l, vib);
      if (t < T.choca + 0.2) tuing(g, t, lz.c, lz.l);
    }
    g.restore();
  }
  const aMundo = (Q, q) => Q.giro ? (() => { const d = rot(P(q.x - Q.giro.Pp.x, q.y - Q.giro.Pp.y), Q.giro.phi); return P(Q.giro.W.x + d.x, Q.giro.W.y + d.y); })() : q;
  function sombraG(g, Q, t) {
    const phi = Q.giro ? Q.giro.phi : 0, p = Q.p;
    if (enRendija(t) || enUmbral(t)) return;
    const largo = 52 + 170 * Math.sin(clamp(phi, 0, 1.5));
    const cx = phi > 0 ? Q.giro.W.x + 150 * Math.sin(clamp(phi, 0, 1.5)) - 20 : p.x + 8;
    const alto = Math.max(0, (p.suelo - ALTO_PEL(G, p.s)) - G.aPantalla(p, p.pelvis).y) ;
    sombraEl(g, cx, p.suelo + 2, largo * (1 - Math.min(0.4, alto / 300)), 0.22 * (1 - Math.min(0.6, alto / 120)));
  }
  function sombraY(g, p) { sombraEl(g, p.x + 6, p.suelo + 2, 48, 0.2); }

  class GuillermoYorgiCarrera extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !Y.listo()) return;
      const luz = tramo(t, NEGRO_INICIO, 0.75) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02));
      const cam = camX(t);
      const QG = poseG(t), py = poseY(t);
      g.save();
      // al final la cámara se acerca un poco (risa, pulgares y guiño)
      const zm = 1 + 0.17 * tramo(t, T.rie0 - 0.1, T.yCamara + 0.2);
      if (zm > 1.0001) { g.translate(ZOOM_C.x, ZOOM_C.y); g.scale(zm, zm); g.translate(-ZOOM_C.x, -ZOOM_C.y); }
      fondo(g, t, cam);
      g.save(); g.translate(-cam, 0); MUNDO = g.getTransform();
      const vis = (x, m = 300) => x - cam > -m && x - cam < W + m;
      // atrezo vivo: semáforo, campanilla
      if (vis(XSEM)) dibSemaforo(g, t);
      if (vis(CAMPANA.x)) dibCampanilla(g, t);
      // sombras
      if (vis(py.x)) sombraY(g, py);
      sombraG(g, QG, t);
      dibPolvos(g, t, false);
      // Guillermo dentro del hueco de la puerta (por detrás de la hoja)
      if (QG.clip === "hueco") {
        g.save(); g.beginPath(); g.rect(XL, FT - 40, WD, H - FT + 40); g.clip(); dibujaG(g, QG, t); g.restore();
      } else if (QG.clip === "rendija") {
        const Hj = hojaPuerta(thPuerta(t));
        g.save(); g.beginPath(); g.rect(XL - 2, FT, Hj.xF - XL + 4, FB - FT); g.rect(XL - 160, QG.brazoY - 36, 162, 66); g.clip(); dibujaG(g, QG, t); g.restore();
      }
      // la hoja de la puerta
      if (vis(XL)) dibHoja(g, hojaPuerta(thPuerta(t)));
      // Yorgi (con sus rayas de velocidad detrás)
      if (vis(py.x)) { rayasVel(g, t, py, QG.giro ? QG.giro.W.x + 60 : QG.p.x); Y.dibujar(g, py, t); }
      // Guillermo en el paseo
      if (!QG.clip) dibujaG(g, QG, t);
      dibPolvos(g, t, true);
      // efectos de Guillermo
      if (t > T.choca - 0.1 && t < T.sube0 + 0.2) {
        const c = aMundo(QG, G.aPantalla(QG.p, G.centroCabeza(QG.p)));
        estrellitas(g, t, P(c.x - 20, c.y - 50));
        rayitas(g, t, c, T.ve);
      }
      if (t > T.cierra0 && t < T.cierra1 + 0.5) {
        const Hj = hojaPuerta(thPuerta(t)), D = empujonDatos();
        boing(g, t, P(D.x1 + BUM - 4, FB - 170));
      }
      g.restore();
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00136", nombre: "Guillermo y Yorgi · La carrera", crear: () => new GuillermoYorgiCarrera() });
  window.__A2D_00136 = { pose, T, DUR, camX, xRunY, xSaltoG, poseG, poseY, hojaPuerta, thPuerta, apoyosY, empujonDatos, saltos };
})();
