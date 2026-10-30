"use strict";
/* 00070 · Guillermo y Deivi · La realidad virtual
 *
 * Negro → salón de noche con luz de neón: pared morada, tira de LED, una tele en la pared con un
 * videojuego retro, ventana con la ciudad, alfombra redonda y una lámpara colgante de pantalla
 * metálica. Deivi, repantingado en su sillón mostaza, agita dos mandos de realidad virtual →
 * Guillermo saca las manos de los bolsillos y los coge, encantado → Deivi le enseña las gafas
 * de realidad virtual; Guillermo se da la vuelta y se agacha delante del sillón → Deivi se las
 * baja por encima de la cabeza y se las encaja desde atrás (¡clic!) y le da dos toquecitos en la
 * cabeza → las gafas se encienden y Guillermo se pone a jugar: esquiva, lanza puñetazos, se
 * agacha, retrocede y suelta un revés que le pasa a Deivi rozando el pelo → da un paso, carga y
 * suelta un gancho de abajo arriba que le da de lleno a la lámpara → celebra mientras la lámpara
 * se va… y vuelve: ¡bonk! en toda la frente (estrellas, chichón, gafas torcidas) → Deivi se parte
 * de risa → Guillermo se recoloca las gafas, se agazapa y salta hacia atrás para esquivar un
 * láser… y aterriza sentado en el regazo de Deivi (la tele se va a ruido y se queda en pausa) →
 * Deivi, sin aire, le tira de la correa por detrás y le sube las gafas a la frente → Guillermo
 * parpadea con las marcas rojas de las gafas alrededor de los ojos, mira a todos lados, a Deivi y
 * a cámara; Deivi, sin soltar la correa, guiña un ojo → negro.
 *
 * Sin textos. La tele enseña lo que ve Guillermo (un cubo que viene, dianas que estallan, una
 * barra, un murciélago, un jefe y un láser a ras de suelo). Las gafas se dibujan en la capa de la
 * cara de Guillermo (capaCabeza), en coordenadas de su retrato; los mandos son atrezo con posición
 * propia en pantalla y la mano que los sujeta los dibuja en su gancho. Cuando la mano de Deivi
 * tiene que quedar por delante de la cabeza de Guillermo, se repinta solo su antebrazo con un
 * recorte. La lámpara es un péndulo amortiguado escrito a mano y sus luces son sprites
 * precalculados. Todo depende solo de `t`.
 */
(() => {
  const { clamp, lerp, fase, suave, suave5, salida, entrada, tramo, mezcla, ruido, hash, campana } = M2;
  const G = Guillermo, DV = Deivi;
  const DUR = 14.8, S = 0.3, SUELO = 562, TINTA = "#0b0a0e";
  const T = {
    agita0: 0.35, agita1: 0.95, sacaG0: 0.8, sacaG1: 1.1, paso0: 0.9, paso1: 1.3, entrega: 1.55,
    atras0: 1.65, atras1: 1.95, cogeV0: 1.72, cogeV1: 1.92, muestra0: 2.05, muestra1: 2.35,
    gira0: 2.45, gira1: 2.8, agacha0: 2.75, agacha1: 3.15, sube0: 2.5, sube1: 3.15, pone0: 3.15, pone1: 3.66, clic: 3.68,
    palmada0: 3.78, palmada1: 4.02, arranca: 3.9, levanta0: 4.12, levanta1: 4.42, avanza0: 4.32, avanza1: 4.82,
    esquiva0: 4.98, esquiva1: 5.48, jab1: 5.62, jab2: 5.86, jab3: 6.1, agachon0: 6.28, agachon1: 6.74,
    retro0: 6.78, retro1: 7.12, reves: 7.3, avanzaB0: 7.45, avanzaB1: 7.82, carga: 7.84, golpe: 8.04,
    victoria0: 8.2, bonk: 8.92, mareo1: 9.85, ajusta0: 9.92, ajusta1: 10.28, agazapa0: 10.3, salto: 10.56, aterriza: 11.08,
    quita0: 11.8, quita1: 12.1, quita2: 12.42, suelta: 12.58, mira0: 12.55, camara: 13.35, guino: 13.62, fin: 14.02
  };

  /* ---------- utilidades ---------- */
  // pista de claves [[t, v, f?], …]: interpola entre claves con la función de la clave de destino
  function pista(t, K) {
    if (t <= K[0][0]) return K[0][1];
    for (let i = 1; i < K.length; i++) if (t <= K[i][0]) { const [t0, v0] = K[i - 1], [t1, v1, f] = K[i]; return lerp(v0, v1, (f || suave)(fase(t, t0, t1))); }
    return K[K.length - 1][1];
  }
  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n] ?? a[n], k); return o; };
  const guion = (lista, dic, base, t) => {
    let c = dic[base];
    for (const [t0, t1, nom, f] of lista) { if (t <= t0) break; c = mezclaE(c, dic[nom], (f || suave)(fase(t, t0, t1))); }
    return Object.assign({}, c);
  };
  const dentro = (t, a0, a1, b0, b1) => tramo(t, a0, a1) * (1 - tramo(t, b0, b1));
  const DED = ["pulgar", "indice", "medio", "anular", "menique"];
  const D = (pu, i, m, a, me) => ({ pulgar: pu, indice: i, medio: m ?? i, anular: a ?? i, menique: me ?? i });
  const mezclaD = (a, b, k) => { const o = {}; for (const n of DED) o[n] = lerp(a[n] ?? 0, b[n] ?? 0, k); return o; };
  const ABIERTA = D(1, 1), AGARRA = D(0.3, 0.14, 0.12, 0.12, 0.14), RELAJADA = D(0.55, 0.6, 0.55, 0.5, 0.45),
    MUSLO = D(0.7, 0.8, 0.78, 0.74, 0.7), PINZA = D(0.55, 0.4, 0.3, 0.25, 0.2), PALMA = D(0.9, 0.95, 0.95, 0.9, 0.85);
  // pasos de un pie en pantalla: [[t0, t1, xDestino, alto?], …] (antes del primero, x0)
  function pie(x0, pasos, t) {
    let x = x0, alza = 0, u = 0;
    for (const [a, b, xb, h] of pasos) {
      if (t >= b) { x = xb; continue; }
      if (t > a) { u = fase(t, a, b); x = lerp(x, xb, suave(u)); alza = (h ?? 20) * Math.sin(Math.PI * u); }
      break;
    }
    return { x, alza, u };
  }

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

  /* =====================================================================================
   * EL SILLÓN Y DEIVI (sentado, mira a la izquierda)
   * ===================================================================================== */
  const XD = 722;                                         // pelvis de Deivi en pantalla
  const ASIENTO = SUELO - 108;                            // parte de arriba del cojín
  const Y_PEL_D = ASIENTO - 14;                           // pelvis de Deivi sentado (pantalla)
  const hojaY = (rig, y) => rig.SUELO + (y - SUELO) / (S * rig.K);
  const PEL_D = hojaY(DV, Y_PEL_D) - DV.PELVIS.y;
  const TOB_D = DV.SUELO - DV.TOBILLO_ALTO;
  // hundimiento del cojín al caerle Guillermo encima
  function hunde(t) {
    if (t < T.aterriza) return 0;
    const u = t - T.aterriza;
    return 16 * Math.exp(-u * 5) * Math.cos(u * 15) * suave(fase(u, 0, 0.04)) + 7 * suave(fase(u, 0, 0.12));
  }

  /* =====================================================================================
   * LA LÁMPARA: péndulo (θ > 0 hacia la derecha). Golpe de Guillermo → se va a la izquierda →
   * vuelve y le da en la frente (rebota) → oscilación amortiguada
   * ===================================================================================== */
  const LX = 340, LPY = -80, LC = 258;                    // anclaje en el techo y largo del cable (hasta el centro de la pantalla)
  const AMP = 0.5, TH_C = 0.26;                            // amplitud y ángulo del choque con la frente
  const OM = (Math.PI + Math.asin(TH_C / AMP)) / (T.bonk - T.golpe);   // pulsación: vuelve justo a tiempo del coscorrón
  const T_BONK = T.bonk;
  const V_BONK = -AMP * OM * Math.cos(OM * (T_BONK - T.golpe));   // velocidad angular justo antes del choque (> 0)
  const GAM = 0.9;
  function anguloLampara(t) {
    if (t < T.golpe) return 0.012 * Math.sin(t * 2.1) * tramo(t, 5.0, 6.0);       // se mece un poco con el aire de los golpes
    if (t < T_BONK) return -AMP * Math.sin(OM * (t - T.golpe)) * (1 + 0.05 * Math.sin(Math.PI * fase(t, T.golpe, T_BONK)));
    const u = t - T_BONK, v0 = -0.42 * V_BONK, a = TH_C, b = (v0 + GAM * a) / OM;
    return Math.exp(-GAM * u) * (a * Math.cos(OM * u) + b * Math.sin(OM * u));
  }
  const pantallaLampara = th => ({ x: LX + LC * Math.sin(th), y: LPY + LC * Math.cos(th) });

  /* =====================================================================================
   * GUILLERMO
   * ===================================================================================== */
  const R_M = G.MUNECA_R * G.JK;
  const manoDesde = (m, ang, mu) => { const o = G.rotP({ x: Math.cos(mu) * R_M, y: Math.sin(mu) * R_M }, ang); return { x: m.x - o.x, y: m.y - o.y }; };
  const BOLS_GC = manoDesde({ x: 131, y: 652 }, 0, -1.75), BOLS_GL = manoDesde({ x: 372, y: 648 }, 0, -1.75);
  const TOB_G = G.SUELO - G.TOBILLO_ALTO;
  const T_GIRO = (T.gira0 + T.gira1) / 2;
  const mira = t => (t < T_GIRO ? 1 : -1);               // 1: a la derecha; −1: a la izquierda (espejo)
  const giroEsc = t => { const u = fase(t, T.gira0, T.gira1); return u <= 0 || u >= 1 ? 1 : Math.max(0.02, Math.abs(Math.cos(Math.PI * u))); };

  const X_G = [[0, 470], [T.paso0, 470], [T.paso1, 522], [T.atras0, 522], [T.atras1, 494], [T.agacha0, 494], [T.agacha1, 600],
    [T.levanta1, 600], [T.avanza1, 466], [T.esquiva0, 466], [T.esquiva0 + 0.18, 474, salida], [T.esquiva1, 466], [T.retro0, 464],
    [T.retro1, 548], [T.avanzaB0, 548], [T.avanzaB1, 470], [T.carga, 470], [T.golpe + 0.04, 462, salida], [T.victoria0 + 0.2, 470], [T.bonk, 472],
    [T.bonk + 0.25, 492, salida], [9.4, 506], [9.85, 518], [T.salto, 520]];
  const BAJA_G = [[0, 0], [T.agacha0, 0], [T.agacha1, 114, salida], [T.levanta0, 114], [T.levanta0 + 0.08, 124], [T.levanta1, -6, salida], [T.levanta1 + 0.12, 0],
    [T.esquiva0, 0], [T.esquiva0 + 0.15, 14, salida], [T.esquiva1, 0], [T.jab1 - 0.1, 8], [T.agachon0, 8], [T.agachon0 + 0.14, 74, salida], [T.agachon1 - 0.1, 70], [T.agachon1, 6],
    [T.retro1, 6], [T.reves, 16], [T.avanzaB0 + 0.1, 4], [T.carga, -6], [T.golpe, 12, entrada], [T.golpe + 0.18, 14], [T.victoria0 + 0.05, 2],
    [T.victoria0 + 0.2, -30, salida], [T.victoria0 + 0.38, 2, entrada], [T.victoria0 + 0.48, 6], [T.bonk, 0], [T.bonk + 0.12, 18, salida], [9.5, 14], [9.85, 4],
    [T.agazapa0, 4], [T.salto - 0.05, 58, salida], [T.salto, 52]];
  const TORSO_G = [[0, 0.02], [T.paso0, 0.02], [T.paso1, 0.16], [T.entrega + 0.05, 0.16], [T.atras1, 0.06], [T.gira0, 0.06], [T.agacha1, 0.2], [T.levanta0, 0.2], [T.levanta1, 0.02],
    [T.avanza1, 0.12], [T.esquiva0, 0.12], [T.esquiva0 + 0.14, -0.42, salida], [T.esquiva0 + 0.32, -0.36], [T.esquiva1, 0.1], [T.jab1, 0.22], [T.jab2, 0.12], [T.jab3, 0.24], [T.agachon0, 0.14],
    [T.agachon0 + 0.14, 0.42, salida], [T.agachon1 - 0.1, 0.4], [T.agachon1, 0.06], [T.retro1, -0.08], [T.reves, -0.2, salida], [T.avanzaB0 + 0.1, 0.02],
    [T.carga, 0.16], [T.golpe, -0.14, entrada], [T.golpe + 0.2, -0.1], [T.victoria0 + 0.2, -0.12], [T.bonk, -0.06], [T.bonk + 0.08, -0.36, salida],
    [9.4, -0.1], [9.85, 0.0], [T.agazapa0, 0.04], [T.salto - 0.05, 0.36, salida], [T.salto, 0.3]];
  const CAB_G = [[0, 0.02], [T.paso1, -0.06], [T.entrega, -0.06], [T.atras1, 0.12], [T.muestra1, 0.02], [T.gira0, 0.0], [T.agacha1, -0.12], [T.pone1, -0.12],
    [T.levanta1, -0.02], [T.esquiva0 + 0.14, 0.22], [T.esquiva1, -0.04], [T.agachon0 + 0.14, 0.1], [T.agachon1, -0.04], [T.reves, 0.08], [T.carga, -0.16], [T.golpe, 0.1, entrada],
    [T.victoria0 + 0.2, -0.22], [T.bonk, -0.18], [T.bonk + 0.07, -0.42, salida], [9.4, -0.02], [9.85, 0], [T.salto - 0.05, -0.2], [T.salto, -0.2]];

  // pies (pantalla). Mirando a la derecha la pierna cercana va detrás (a la izquierda); al girar se cambian.
  const PASOS_GC = [[T.paso0, T.paso0 + 0.3, 508], [T.atras0, T.atras0 + 0.28, 480], [T.gira0 + 0.02, T.gira1 - 0.02, 508, 14], [T.agacha0 + 0.14, T.agacha1 - 0.02, 610, 18],
    [T.avanza0 + 0.22, T.avanza1, 482], [T.retro0, T.retro0 + 0.2, 568, 26], [T.avanzaB0 + 0.15, T.avanzaB1, 490, 24],
    [T.bonk + 0.05, T.bonk + 0.25, 516, 16], [9.45, 9.65, 536, 18]];
  const PASOS_GL = [[T.paso0 + 0.12, T.paso1, 538], [T.atras0 + 0.12, T.atras1, 510], [T.gira0 + 0.08, T.gira1, 478, 14], [T.gira1 + 0.02, T.agacha1 - 0.12, 588, 18],
    [T.avanza0, T.avanza0 + 0.25, 446], [T.jab1 - 0.2, T.jab1 - 0.05, 436, 10], [T.retro0 + 0.14, T.retro1, 532, 26], [T.avanzaB0, T.avanzaB0 + 0.26, 436, 30],
    [T.bonk + 0.15, T.bonk + 0.35, 484, 16], [9.6, 9.8, 502, 18]];
  const X0_GC = 456, X0_GL = 486;

  /* ---------- salto hacia atrás y regazo ---------- */
  const LAP = { x: XD - 70, y: Y_PEL_D - 44 };            // pelvis de Guillermo sentado encima de Deivi (pantalla)
  function vuelo(t, x0, y0) {
    const u = fase(t, T.salto, T.aterriza);
    const x = lerp(x0, LAP.x, suave(u * 0.6 + 0.4 * u)), y = lerp(y0, LAP.y, u * u) - 150 * 4 * u * (1 - u) * 0.85;
    return { x, y, u };
  }

  /* =====================================================================================
   * MANDOS (atrezo; posición propia en pantalla)
   * ===================================================================================== */
  // mando en «unidades de jarra»: el mango atraviesa el puño a lo largo de x (anillo en el lado del pulgar, +x)
  function dibMando(g, color, luz, t) {
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    // anillo de seguimiento
    g.lineWidth = 7.5; g.strokeStyle = TINTA; g.beginPath(); g.ellipse(32, -1, 15, 13, 0.25, 0, Math.PI * 2); g.stroke();
    g.lineWidth = 4.6; g.strokeStyle = "#dfe3ec"; g.stroke();
    g.lineWidth = 1.4; g.strokeStyle = "rgba(120,130,150,0.9)"; g.beginPath(); g.ellipse(32, -1, 13, 11, 0.25, Math.PI * 0.9, Math.PI * 1.6); g.stroke();
    // mango
    g.beginPath(); g.moveTo(-26, -5); g.quadraticCurveTo(-28, 0, -25, 6); g.lineTo(14, 8); g.quadraticCurveTo(24, 8, 26, 0); g.quadraticCurveTo(24, -9, 14, -8); g.closePath();
    g.fillStyle = "#30323c"; g.fill(); g.lineWidth = 2.2; g.strokeStyle = TINTA; g.stroke();
    g.fillStyle = "rgba(255,255,255,0.18)"; g.fillRect(-22, -5, 36, 2.5);
    // botón y luz
    g.fillStyle = "#585c69"; g.beginPath(); g.arc(19, -2, 3, 0, Math.PI * 2); g.fill(); g.lineWidth = 1; g.stroke();
    if (luz > 0.01) {
      const pul = 0.75 + 0.25 * Math.sin(t * 9);
      g.save(); g.globalAlpha = luz * 0.55 * pul; g.fillStyle = color; g.beginPath(); g.arc(-22, 1, 7, 0, Math.PI * 2); g.fill(); g.restore();
      g.fillStyle = color; g.globalAlpha = 0.4 + 0.6 * luz; g.beginPath(); g.arc(-22, 1, 2.8, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1;
    }
    g.restore();
  }
  const COL_MANDO = { c: "#33e6ff", l: "#ff4fd8" };

  /* =====================================================================================
   * GAFAS DE REALIDAD VIRTUAL (coordenadas de su marco: px del retrato; +x hacia la cara de delante)
   * ===================================================================================== */
  const GAF = { atras: [-170, 124, -78, 74], delante: [-128, 170, -70, 86] };
  const P_CARA = { x: 830, y: 590, ang: 0.36, sx: 1, sy: 1 };          // puestas (retrato de Guillermo)
  const P_TORCIDA = { x: 846, y: 616, ang: 0.66, sx: 1, sy: 1 };       // tras el coscorrón
  const P_FRENTE = { x: 796, y: 418, ang: 0.16, sx: 0.96, sy: 0.9 };   // subidas a la frente
  const P_ARRIBA = { x: 640, y: 150, ang: 0.2, sx: 1, sy: 1 };         // encima de la cabeza, a punto de bajarlas
  const AGARRE = { lado: { x: -178, y: 4 }, frente: { x: 172, y: 8 }, arriba: { x: 10, y: -78 } };
  const ESC_RET = 0.6 * S;                                             // retrato → pantalla
  function rrect(g, x0, x1, y0, y1, r) {
    g.beginPath(); g.moveTo(x0 + r, y0); g.lineTo(x1 - r, y0); g.arcTo(x1, y0, x1, y0 + r, r); g.lineTo(x1, y1 - r); g.arcTo(x1, y1, x1 - r, y1, r);
    g.lineTo(x0 + r, y1); g.arcTo(x0, y1, x0, y1 - r, r); g.lineTo(x0, y0 + r); g.arcTo(x0, y0, x0 + r, y0, r); g.closePath();
  }
  // on: 0 apagadas … 1 encendidas; suelta: correa colgando (fuera de la cabeza)
  function dibGafas(g, t, on, suelta) {
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    const [bx0, bx1, by0, by1] = GAF.atras, [fx0, fx1, fy0, fy1] = GAF.delante;
    if (suelta > 0.01) {      // correa suelta: un lazo que cuelga por detrás
      g.save(); g.globalAlpha *= suelta;
      g.beginPath(); g.moveTo(bx0 + 6, -26); g.bezierCurveTo(bx0 - 120, 10, bx0 - 120, 150, bx0 - 10, 120); g.bezierCurveTo(bx0 + 60, 96, -40, 10, -30, by0 + 2);
      g.lineWidth = 34; g.strokeStyle = TINTA; g.stroke(); g.lineWidth = 24; g.strokeStyle = "#3b3e4a"; g.stroke();
      g.lineWidth = 3; g.strokeStyle = "rgba(160,170,190,0.6)"; g.setLineDash([10, 9]); g.stroke(); g.setLineDash([]);
      g.restore();
    }
    // espuma que toca la cara (asoma por detrás)
    rrect(g, bx0 - 8, bx1 - 30, by0 + 4, by1 - 2, 30); g.fillStyle = "#6c6f7c"; g.fill(); g.lineWidth = 9; g.strokeStyle = TINTA; g.stroke();
    // costado (lo que se ve de la caja por el lado cercano)
    g.beginPath(); g.moveTo(bx0, by0 + 16); g.quadraticCurveTo(bx0 + 2, by0 + 2, bx0 + 20, by0 + 2); g.lineTo(fx0 + 30, fy0); g.lineTo(fx0 + 30, fy1);
    g.lineTo(bx0 + 20, by1 - 2); g.quadraticCurveTo(bx0 + 2, by1 - 2, bx0, by1 - 18); g.closePath();
    g.fillStyle = "#23252e"; g.fill(); g.lineWidth = 9; g.strokeStyle = TINTA; g.stroke();
    g.fillStyle = "rgba(255,255,255,0.08)"; g.beginPath(); g.moveTo(bx0 + 14, by0 + 14); g.lineTo(fx0 + 22, fy0 + 10); g.lineTo(fx0 + 22, fy0 + 22); g.lineTo(bx0 + 14, by0 + 26); g.closePath(); g.fill();
    // frontal
    const fr = g.createLinearGradient(0, fy0, 0, fy1); fr.addColorStop(0, "#3c3f4c"); fr.addColorStop(1, "#16171d");
    rrect(g, fx0, fx1, fy0, fy1, 36); g.fillStyle = fr; g.fill();
    // cristal: banda de colores que corre cuando está encendida
    g.save(); rrect(g, fx0 + 16, fx1 - 16, fy0 + 22, fy1 - 24, 24); g.clip();
    g.fillStyle = "#0d0e14"; g.fillRect(fx0, fy0, fx1 - fx0, fy1 - fy0);
    if (on > 0.01) {
      const d = (t * 160) % 300;
      const gr = g.createLinearGradient(fx0 - 300 + d, 0, fx1 + d, 0);
      gr.addColorStop(0, "#2ef2ff"); gr.addColorStop(0.25, "#8a5bff"); gr.addColorStop(0.5, "#ff3fd0"); gr.addColorStop(0.75, "#2ef2ff"); gr.addColorStop(1, "#8a5bff");
      g.globalAlpha = on; g.fillStyle = gr; g.fillRect(fx0, fy0, fx1 - fx0 + 40, fy1 - fy0);
      g.globalAlpha = on * 0.55; g.fillStyle = "#ffffff";
      for (let i = 0; i < 3; i++) { const yy = fy0 + 34 + i * 22, w = 40 + 30 * Math.sin(t * 3 + i * 2); g.fillRect(fx0 + 30 + ((t * 120 + i * 70) % (fx1 - fx0)), yy, w, 4); }
      g.globalAlpha = 1;
    }
    // reflejo
    g.fillStyle = "rgba(255,255,255,0.22)"; g.beginPath(); g.moveTo(fx0 + 50, fy0); g.lineTo(fx0 + 90, fy0); g.lineTo(fx0 + 30, fy1); g.lineTo(fx0 - 10, fy1); g.closePath(); g.fill();
    g.restore();
    rrect(g, fx0 + 16, fx1 - 16, fy0 + 22, fy1 - 24, 24); g.lineWidth = 5; g.strokeStyle = "#07070a"; g.stroke();
    rrect(g, fx0, fx1, fy0, fy1, 36); g.lineWidth = 10; g.strokeStyle = TINTA; g.stroke();
    g.strokeStyle = "rgba(255,255,255,0.22)"; g.lineWidth = 4; g.beginPath(); g.moveTo(fx0 + 40, fy0 + 8); g.lineTo(fx1 - 40, fy0 + 8); g.stroke();
    // lucecitas
    for (let i = 0; i < 3; i++) {
      const enc = on > 0.5 ? 0.5 + 0.5 * Math.sin(t * 6 + i * 1.7) : 0.15;
      g.fillStyle = i === 1 ? `rgba(255,80,200,${enc})` : `rgba(60,240,255,${enc})`;
      g.beginPath(); g.arc(fx1 - 66 + i * 16, fy0 + 12, 4.5, 0, Math.PI * 2); g.fill();
    }
    g.restore();
  }
  // correas de las gafas puestas (retrato de Guillermo): por encima de la oreja hacia la nuca y por la coronilla
  function correas(g, M, k, fin) {
    if (k <= 0.01) return;
    const lado = aplicaP(M, AGARRE.lado);
    g.save(); g.globalAlpha *= k; g.lineCap = "round"; g.lineJoin = "round";
    const banda = (pts, w) => {
      g.beginPath(); g.moveTo(pts[0].x, pts[0].y); g.bezierCurveTo(pts[1].x, pts[1].y, pts[2].x, pts[2].y, pts[3].x, pts[3].y);
      g.lineWidth = w + 12; g.strokeStyle = TINTA; g.stroke(); g.lineWidth = w; g.strokeStyle = "#3b3e4a"; g.stroke();
      g.lineWidth = 3; g.strokeStyle = "rgba(170,180,200,0.55)"; g.setLineDash([12, 10]); g.stroke(); g.setLineDash([]);
    };
    if (fin) banda([lado, { x: lado.x - 50, y: lado.y - 20 }, { x: fin.x + 40, y: fin.y + 16 }, fin], 40);      // estirada por la mano de Deivi
    else banda([lado, { x: lado.x - 60, y: lado.y - 30 }, { x: 590, y: 470 }, { x: 512, y: 432 }], 40);
    g.restore();
  }
  // marcas rojas que dejan las gafas alrededor de los ojos (retrato), recortadas a la piel
  const PIEL_CARA = [[600, 540], [650, 500], [700, 455], [760, 470], [820, 460], [840, 515], [900, 553], [945, 580], [958, 640], [930, 700], [880, 760], [830, 840], [760, 830], [690, 790], [630, 740], [605, 660]];
  function marcas(g, k) {
    if (k <= 0.01) return;
    g.save(); g.beginPath(); PIEL_CARA.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.clip();
    const M = colocar(P_CARA); g.transform(M.a, M.b, M.c, M.d, M.e, M.f);
    g.globalAlpha = 0.5 * k; rrect(g, GAF.atras[0] - 2, GAF.atras[1] - 22, GAF.atras[2] + 8, GAF.atras[3] - 4, 30);
    g.lineWidth = 26; g.strokeStyle = "#ff6f6a"; g.stroke();
    g.globalAlpha = 0.35 * k; g.lineWidth = 8; g.strokeStyle = "#e0463e"; g.stroke();
    g.restore();
  }
  // brillo de colores sobre la cara (por debajo de las gafas encendidas)
  function brilloCara(g, M, on, t) {
    if (on <= 0.01) return;
    const c = aplicaP(M, { x: 20, y: 90 });
    g.save(); g.beginPath(); PIEL_CARA.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.clip();
    const gr = g.createRadialGradient(c.x, c.y, 10, c.x, c.y, 170);
    const col = Math.sin(t * 2.3) > 0 ? "120,90,255" : "60,230,255";
    gr.addColorStop(0, `rgba(${col},${0.28 * on})`); gr.addColorStop(1, `rgba(${col},0)`);
    g.fillStyle = gr; g.fillRect(c.x - 180, c.y - 180, 360, 360);
    g.restore();
  }

  /* ---------- matrices ---------- */
  const colocar = q => new DOMMatrix().translateSelf(q.x, q.y).rotateSelf(q.ang * 180 / Math.PI).scaleSelf(q.sx, q.sy);
  const aplicaP = (M, q) => ({ x: M.a * q.x + M.c * q.y + M.e, y: M.b * q.x + M.d * q.y + M.f });
  const mezP = (a, b, k) => ({ x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), ang: lerp(a.ang, b.ang, k), sx: lerp(a.sx, b.sx, k), sy: lerp(a.sy, b.sy, k) });
  // retrato → pantalla (con la escala de la cabeza, su giro y el espejo; sin el aplastado del giro)
  function matRetrato(R, p) {
    const H = R.cabeza(p);
    const o = R.aPantalla(p, H.a({ x: 0, y: 0 })), ax = R.aPantalla(p, H.a({ x: 1, y: 0 })), ay = R.aPantalla(p, H.a({ x: 0, y: 1 }));
    return new DOMMatrix([ax.x - o.x, ax.y - o.y, ay.x - o.x, ay.y - o.y, o.x, o.y]);
  }
  // descompone (con espejo): M = T·R(ang)·S(sx, sy), sy > 0
  function descompon(M) { const ang = Math.atan2(-M.c, M.d), sy = Math.hypot(M.c, M.d); return { x: M.e, y: M.f, ang, sx: M.a * Math.cos(ang) + M.b * Math.sin(ang), sy }; }
  const desenvuelve = (a, ref) => a + Math.round((ref - a) / (2 * Math.PI)) * 2 * Math.PI;

  /* ---------- manos: dirección hacia el codo ---------- */
  const muHacia = (R, p, q, lado, extra = 0) => { const sh = R.tronco(p)(lado === "cerca" ? R.HOMBRO_C : R.HOMBRO); return Math.atan2(sh.y - q.y, sh.x - q.x) + extra; };

  /* =====================================================================================
   * POSTURA DE DEIVI
   * ===================================================================================== */
  const CARAS_D = {
    inicio: E({ mx: 0.85, my: 0.05, c: 0.3, sd: 8, gd: 0.04, si: 10, gi: 0.06, sonr: 0.55, ancho: 0.95 }),
    invita: E({ mx: 0.9, my: 0.05, c: 0.2, sd: 22, gd: 0.12, si: 20, gi: 0.12, abre: 12, sonr: 0.85, ancho: 1.05 }),
    tierno: E({ mx: 0.9, my: 0.1, c: 0.35, h: 0.3, sd: 10, gd: 0.04, si: 10, gi: 0.04, abre: 4, sonr: 0.75, ancho: 0.95 }),
    muestra: E({ mx: 0.6, my: -0.1, c: 0.15, sd: 26, gd: 0.16, si: 24, gi: 0.14, abre: 16, sonr: 0.9, ancho: 1.05 }),
    concentra: E({ mx: 0.9, my: 0.35, c: 0.45, sd: 2, gd: -0.04, si: 4, gi: -0.02, abre: 2, ancho: 0.7, sonr: 0.25, lengua: 0.6 }),
    satisfecho: E({ mx: 0.9, my: 0.1, c: 0.35, h: 0.4, sd: 8, gd: 0.04, si: 8, gi: 0.04, abre: 6, sonr: 0.85, ancho: 1 }),
    mira: E({ mx: 0.9, my: 0.0, c: 0.25, sd: 10, gd: 0.04, si: 12, gi: 0.06, abre: 0, sonr: 0.5, ancho: 0.9 }),
    risita: E({ mx: 0.9, my: 0.05, c: 0.8, h: 1, sd: 12, gd: 0.06, si: 12, gi: 0.06, abre: 14, sonr: 0.85, ancho: 1.05 }),
    susto: E({ mx: 0.4, my: -0.4, iris: 0.8, c: 0, sd: 26, gd: 0.16, si: 26, gi: 0.16, abre: 22, ancho: 0.7, sonr: -0.2 }),
    alivio: E({ mx: 0.85, my: 0.05, c: 0.5, sd: 6, gd: -0.04, si: 6, gi: -0.04, abre: 8, ancho: 0.9, sonr: 0.35 }),
    sigue: E({ mx: 0.5, my: -0.55, c: 0.15, sd: 16, gd: 0.08, si: 16, gi: 0.08, abre: 6, sonr: 0.3, ancho: 0.8 }),
    carcajada: E({ mx: 0.9, my: 0, c: 1, h: 1, sd: 18, gd: 0.1, si: 18, gi: 0.1, abre: 34, sonr: 0.95, ancho: 1.12 }),
    alarma: E({ mx: 0.95, my: 0.1, iris: 0.78, c: 0, sd: 30, gd: 0.2, si: 30, gi: 0.2, abre: 26, ancho: 0.72, sonr: -0.3 }),
    uf: E({ mx: 0.6, my: 0.2, iris: 0.7, c: 0.1, sd: 24, gd: 0.18, si: 24, gi: 0.18, abre: 0, ancho: 0.55, sonr: -0.1, mof: 1 }),
    mueca: E({ mx: 0.9, my: 0.25, c: 0.4, sd: 4, gd: -0.06, si: 14, gi: 0.08, abre: 6, ancho: 0.95, sonr: 0.2 }),
    picaro: E({ mx: 0.7, my: -0.1, c: 0.35, sd: 16, gd: 0.08, si: 6, gi: 0.02, abre: 6, sonr: 0.8, ancho: 1 }),
    camara: E({ mx: -0.85, my: 0, c: 0.3, sd: 12, gd: 0.06, si: 8, gi: 0.04, abre: 6, ancho: 1, sonr: 0.8 }),
    guino: E({ mx: -0.85, my: 0, c: 0.25, wi: 0.75, sd: 14, gd: 0.08, si: -2, gi: -0.04, abre: 8, ancho: 1.05, sonr: 0.95 })
  };
  const GUION_CARA_D = [
    [T.agita0 - 0.1, T.agita0 + 0.15, "invita"], [T.entrega - 0.1, T.entrega + 0.1, "tierno"], [T.muestra0, T.muestra0 + 0.2, "muestra"],
    [T.sube0 + 0.3, T.sube0 + 0.5, "concentra"], [T.clic, T.clic + 0.1, "satisfecho"], [T.levanta1, T.levanta1 + 0.3, "mira"],
    [T.esquiva0 + 0.15, T.esquiva0 + 0.3, "risita"], [T.esquiva1 + 0.1, T.esquiva1 + 0.3, "mira"], [T.agachon0 + 0.12, T.agachon0 + 0.25, "risita"],
    [T.retro0 + 0.05, T.retro0 + 0.2, "mira"], [T.reves - 0.2, T.reves - 0.08, "susto"], [T.reves + 0.25, T.reves + 0.45, "alivio"],
    [T.golpe, T.golpe + 0.12, "sigue"], [T.bonk - 0.02, T.bonk + 0.08, "susto"], [T.bonk + 0.2, T.bonk + 0.35, "carcajada"],
    [10.25, 10.45, "mira"], [T.salto + 0.05, T.salto + 0.2, "alarma"], [T.aterriza - 0.02, T.aterriza + 0.05, "uf"],
    [T.aterriza + 0.55, T.aterriza + 0.75, "mueca"], [T.quita1, T.quita1 + 0.2, "picaro"], [T.camara - 0.15, T.camara + 0.1, "camara"], [T.guino, T.guino + 0.12, "guino"]
  ];
  function poseD(t) {
    const respira = Math.sin(t * 2.0 + 0.6);
    // risa: sacudidas
    const risa = Math.max(dentro(t, T.esquiva0 + 0.15, T.esquiva0 + 0.25, T.esquiva1, T.esquiva1 + 0.15), dentro(t, T.agachon0 + 0.1, T.agachon0 + 0.2, T.retro0, T.retro0 + 0.15),
      dentro(t, T.bonk + 0.2, T.bonk + 0.35, 10.15, 10.35));
    const sac = risa * Math.abs(Math.sin(t * 17));
    const torso = pista(t, [[0, -0.06], [T.agita0, 0.04], [T.agita1, 0.0], [T.paso1, 0.12], [T.entrega + 0.05, 0.14], [T.cogeV0 + 0.1, 0.08], [T.muestra1, 0.04],
      [T.sube0 + 0.25, 0.06], [T.sube1, 0.12], [T.pone1, 0.14], [T.palmada1, 0.14], [T.levanta1, -0.08], [T.reves - 0.25, -0.08], [T.reves - 0.05, -0.42, salida],
      [T.reves + 0.35, -0.3], [T.golpe, -0.08], [T.bonk + 0.25, -0.02], [T.bonk + 0.45, 0.16], [10.3, 0.06], [T.salto + 0.1, -0.1],
      [T.aterriza, -0.14], [T.aterriza + 0.06, -0.34, salida], [T.aterriza + 0.6, -0.26], [T.quita0, -0.16], [T.quita1, -0.1], [T.quita2, -0.14], [T.suelta + 0.3, -0.24], [13.2, -0.28]]);
    const cab = pista(t, [[0, -0.04], [T.agita1, 0.02], [T.muestra1, -0.04], [T.sube1, 0.1], [T.pone1, 0.14], [T.levanta1, -0.02], [T.reves - 0.05, -0.28, salida],
      [T.reves + 0.4, -0.06], [T.golpe + 0.1, -0.18], [T.bonk, -0.12], [T.bonk + 0.4, 0.06], [10.3, 0], [T.aterriza, 0], [T.aterriza + 0.06, -0.24, salida],
      [T.aterriza + 0.6, -0.12], [T.quita1, -0.06], [T.suelta + 0.3, -0.26], [13.2, -0.3]]);
    const xd = XD - 14 * dentro(t, T.sube0 + 0.2, T.sube1, T.palmada1, T.levanta1 + 0.2);       // se asoma al borde del cojín
    const p = {
      x: xd, suelo: SUELO, s: S, espejo: true, tirasLimpias: true, ikContinuo: false,
      pelvis: { x: DV.PELVIS.x, y: DV.PELVIS.y + PEL_D + respira * 1.2 + hunde(t) / (S * DV.K) },
      torso: torso + 0.04 * sac, torsoEsc: { x: 1, y: 1 + respira * 0.004 }, piernas: {},
      cabeza: { ang: cab + 0.05 * sac, dx: 0, dy: 0, esc: { x: 1, y: 1 } }
    };
    // ¡uf!: le cae Guillermo encima → aplastado
    const uf = t >= T.aterriza ? Math.exp(-(t - T.aterriza) * 6) * suave(fase(t, T.aterriza, T.aterriza + 0.04)) : 0;
    p.torsoEsc.y -= 0.06 * uf; p.cabeza.esc = { x: 1 + 0.04 * uf, y: 1 - 0.05 * uf };
    // piernas: tobillos en el suelo por delante; con el peso encima, las rodillas bajan un poco
    for (const [lado, dx, dy] of [["cerca", 262, 0], ["lejos", 300, -8]]) {
      const pat = lado === "cerca" ? 0 : 0;
      p.piernas[lado] = { tob: { x: DV.PELVIS.x + dx + pat - (XD - xd) / S, y: TOB_D + dy }, ang: 0 };
    }
    const ex = guion(GUION_CARA_D, CARAS_D, "inicio", t);
    p.cara = cara(ex, parpadeo(t, [1.25, 2.9, 4.6, 6.0, 8.45, 10.2, 11.6, 12.9]));
    p.sudor = 0.8 * dentro(t, T.reves - 0.1, T.reves, T.reves + 0.5, T.reves + 0.8) + 0.7 * dentro(t, T.aterriza, T.aterriza + 0.1, T.aterriza + 0.8, T.aterriza + 1.2);
    return p;
  }

  /* =====================================================================================
   * POSTURA DE GUILLERMO
   * ===================================================================================== */
  const CARAS_G = {
    inicio: E({ mx: 0.85, my: 0, c: 0.25, sd: 8, gd: 0.04, si: 6, gi: 0.04, sonr: 0.35, ancho: 0.9 }),
    curioso: E({ mx: 0.9, my: 0.15, c: 0.1, sd: 22, gd: 0.12, si: 18, gi: 0.12, abre: 6, sonr: 0.45, ancho: 0.85 }),
    ilusion: E({ mx: 0.85, my: 0.1, c: 0.1, sd: 24, gd: 0.14, si: 22, gi: 0.14, abre: 22, sonr: 0.95, ancho: 1.1 }),
    mandos: E({ mx: 0.6, my: 0.55, c: 0.2, h: 0.4, sd: 16, gd: 0.08, si: 16, gi: 0.08, abre: 14, sonr: 0.95, ancho: 1.08 }),
    oh: E({ mx: 0.9, my: 0.05, iris: 0.85, c: 0, sd: 28, gd: 0.18, si: 28, gi: 0.18, abre: 26, ancho: 0.55, sonr: 0.1 }),
    agachado: E({ mx: 0.85, my: -0.3, c: 0.3, sd: 14, gd: 0.06, si: 14, gi: 0.06, abre: 10, sonr: 0.85, ancho: 1 }),
    guau: E({ mx: 0.9, my: 0, c: 0, sd: 26, gd: 0.16, si: 26, gi: 0.16, abre: 30, ancho: 0.8, sonr: 0.6 }),
    juega: E({ mx: 0.9, my: 0, c: 0.3, sd: 0, gd: -0.1, si: 0, gi: -0.1, abre: 14, ancho: 1.05, sonr: 0.5, lengua: 0.5 }),
    esquiva: E({ mx: 0.9, my: 0, c: 0, sd: 26, gd: 0.2, si: 26, gi: 0.2, abre: 26, ancho: 0.7, sonr: -0.3 }),
    grito: E({ mx: 0.9, my: 0, c: 1, z: 1, sd: 4, gd: -0.14, si: 4, gi: -0.14, abre: 30, ancho: 1.1, sonr: 0.1 }),
    victoria: E({ mx: 0.9, my: -0.2, c: 1, h: 1, sd: 22, gd: 0.12, si: 22, gi: 0.12, abre: 36, ancho: 1.15, sonr: 1 }),
    bonk: E({ mx: 0, my: 0, c: 1, z: 1, sd: 14, gd: 0.2, si: 14, gi: 0.2, abre: 30, ancho: 0.9, sonr: -0.55, lengua: 0.5 }),
    mareo: E({ mx: 0, my: 0, esp: 1, sd: 12, gd: 0.2, si: -6, gi: -0.1, abre: 16, ancho: 0.85, sonr: -0.1, lengua: 0.9 }),
    listo: E({ mx: 0.9, my: 0.1, c: 0.4, sd: -4, gd: -0.2, si: -4, gi: -0.2, abre: 8, ancho: 1, sonr: 0.3 }),
    salta: E({ mx: 0.9, my: 0, c: 0, sd: 20, gd: 0.12, si: 20, gi: 0.12, abre: 28, ancho: 0.85, sonr: 0.3 }),
    sentado: E({ mx: 0.5, my: 0.2, c: 0.2, sd: 18, gd: 0.1, si: 6, gi: 0.02, abre: 8, ancho: 0.8, sonr: -0.05 }),
    luz: E({ mx: 0.9, my: 0, c: 0.75, z: 0.6, sd: -2, gd: -0.06, si: -2, gi: -0.06, abre: 4, ancho: 0.8, sonr: -0.15 }),
    busca: E({ mx: 0.95, my: 0.1, c: 0.15, sd: 16, gd: 0.08, si: 4, gi: -0.02, abre: 6, ancho: 0.75, sonr: -0.1 }),
    atras: E({ mx: -0.95, my: -0.05, c: 0.1, sd: 26, gd: 0.16, si: 20, gi: 0.14, abre: 10, ancho: 0.7, sonr: -0.05 }),
    camara: E({ mx: -0.85, my: 0, c: 0.25, sd: 28, gd: 0.18, si: 4, gi: -0.04, abre: 6, ancho: 0.8, sonr: -0.15 })
  };
  const GUION_CARA_G = [
    [0.45, 0.65, "curioso"], [T.sacaG0, T.sacaG0 + 0.2, "ilusion"], [T.entrega + 0.05, T.entrega + 0.25, "mandos"], [T.muestra0 + 0.1, T.muestra0 + 0.3, "oh"],
    [T.gira0 + 0.1, T.gira0 + 0.3, "agachado"], [T.arranca, T.arranca + 0.12, "guau"], [T.avanza0, T.avanza0 + 0.3, "juega"],
    [T.esquiva0 + 0.02, T.esquiva0 + 0.1, "esquiva"], [T.esquiva1 - 0.1, T.esquiva1 + 0.05, "juega"], [T.jab1 - 0.12, T.jab1 - 0.02, "grito"], [T.jab3 + 0.15, T.jab3 + 0.3, "juega"],
    [T.agachon0, T.agachon0 + 0.08, "esquiva"], [T.agachon1, T.agachon1 + 0.1, "juega"], [T.reves - 0.12, T.reves - 0.02, "grito"], [T.reves + 0.25, T.reves + 0.4, "juega"],
    [T.carga - 0.15, T.carga, "grito"], [T.victoria0, T.victoria0 + 0.1, "victoria"], [T.bonk - 0.02, T.bonk + 0.03, "bonk"], [T.bonk + 0.3, T.bonk + 0.5, "mareo"],
    [T.ajusta0, T.ajusta0 + 0.15, "listo"], [T.salto - 0.1, T.salto, "salta"], [T.aterriza, T.aterriza + 0.1, "bonk"], [T.aterriza + 0.25, T.aterriza + 0.45, "sentado"],
    [T.quita2 - 0.05, T.quita2 + 0.08, "luz"], [T.mira0 + 0.15, T.mira0 + 0.3, "busca"], [12.95, 13.1, "atras"], [T.camara, T.camara + 0.18, "camara"]
  ];
  // posturas de manos de Guillermo (hoja, en el marco del torso). mu: null = hacia el hombro
  const MANOS_G = {
    bols: { c: { ...BOLS_GC, pu: 0, d: RELAJADA, mu: -1.75 }, l: { ...BOLS_GL, pu: 0, d: RELAJADA, mu: -1.75 } },
    pide: { c: { x: 300, y: 420, pu: 1, d: PALMA, mu: 2.7 }, l: { x: 560, y: 410, pu: 1, d: PALMA, mu: 2.9 } },
    mira: { c: { x: 300, y: 470, pu: 1, d: AGARRA, mu: 2.5 }, l: { x: 520, y: 450, pu: 1, d: AGARRA, mu: 2.6 } },
    rodillas: { c: { x: 330, y: 650, pu: 1, d: AGARRA, mu: 2.2 }, l: { x: 470, y: 640, pu: 1, d: AGARRA, mu: 2.2 } },
    guardia: { c: { x: 300, y: 330, pu: 1, d: AGARRA, mu: 2.1 }, l: { x: 480, y: 300, pu: 1, d: AGARRA, mu: 2.0 } },
    jabL: { c: { x: 280, y: 350, pu: 1, d: AGARRA, mu: 2.2 }, l: { x: 690, y: 345, pu: 1, d: AGARRA, mu: 3.1 } },
    jabC: { c: { x: 445, y: 370, pu: 1, d: AGARRA, mu: 3.0 }, l: { x: 450, y: 300, pu: 1, d: AGARRA, mu: 1.9 } },
    cubre: { c: { x: 170, y: 170, pu: 1, d: AGARRA, mu: 1.5 }, l: { x: 400, y: 140, pu: 1, d: AGARRA, mu: 1.6 } },
    reves: { c: { x: -150, y: 50, pu: 1, d: AGARRA, mu: -0.4 }, l: { x: 470, y: 360, pu: 1, d: AGARRA, mu: 2.3 } },
    carga: { c: { x: 200, y: 330, pu: 1, d: AGARRA, mu: 1.6 }, l: { x: 290, y: 650, pu: 1, d: AGARRA, mu: -1.4 } },
    golpe: { c: { x: 150, y: 500, pu: 1, d: AGARRA, mu: 1.0 }, l: { x: 610, y: 210, pu: 1, d: AGARRA, mu: 2.5 } },
    remata: { c: { x: 170, y: 520, pu: 1, d: AGARRA, mu: 1.1 }, l: { x: 560, y: 520, pu: 1, d: AGARRA, mu: 2.2 } },
    victoria: { c: { x: 70, y: 80, pu: 1, d: AGARRA, mu: 1.4 }, l: { x: 470, y: 470, pu: 1, d: AGARRA, mu: 2.6 } },
    lacio: { c: { x: 110, y: 650, pu: 1, d: AGARRA, mu: -1.6 }, l: { x: 370, y: 640, pu: 1, d: AGARRA, mu: -1.7 } },
    listo: { c: { x: 300, y: 420, pu: 1, d: AGARRA, mu: 2.2 }, l: { x: 520, y: 400, pu: 1, d: AGARRA, mu: 2.3 } },
    vuela: { c: { x: 330, y: 170, pu: 1, d: AGARRA, mu: 1.9 }, l: { x: 640, y: 320, pu: 1, d: AGARRA, mu: 2.9 } },
    regazo: { c: { x: 330, y: 560, pu: 1, d: AGARRA, mu: 2.4 }, l: { x: 470, y: 540, pu: 1, d: AGARRA, mu: 2.5 } },
    confuso: { c: { x: 230, y: 540, pu: 1, d: AGARRA, mu: 2.4 }, l: { x: 560, y: 360, pu: 1, d: AGARRA, mu: 1.9 } }
  };
  const GUION_MANOS_G = [
    [T.sacaG0, T.sacaG1 + 0.15, "pide"], [T.entrega, T.entrega + 0.2, "mira"], [T.agacha0 + 0.05, T.agacha1, "rodillas"],
    [T.levanta0, T.levanta1, "guardia"], [T.esquiva0, T.esquiva0 + 0.12, "cubre"], [T.esquiva0 + 0.3, T.esquiva1, "guardia"],
    [T.jab1 - 0.12, T.jab1, "jabL", salida], [T.jab1 + 0.04, T.jab2 - 0.1, "guardia"], [T.jab2 - 0.1, T.jab2, "jabC", salida], [T.jab2 + 0.04, T.jab3 - 0.1, "guardia"],
    [T.jab3 - 0.1, T.jab3, "jabL", salida], [T.jab3 + 0.04, T.agachon0, "guardia"], [T.agachon0, T.agachon0 + 0.12, "cubre", salida], [T.agachon1 - 0.08, T.agachon1 + 0.06, "guardia"],
    [T.retro1 - 0.05, T.reves, "reves", salida], [T.reves + 0.1, T.avanzaB0 + 0.1, "guardia"], [T.avanzaB0 + 0.1, T.carga, "carga"],
    [T.carga, T.golpe, "golpe", entrada], [T.golpe, T.golpe + 0.14, "remata", salida], [T.victoria0 - 0.02, T.victoria0 + 0.16, "victoria", salida],
    [T.bonk + 0.02, T.bonk + 0.3, "lacio", salida], [T.ajusta1, T.agazapa0 + 0.1, "listo"], [T.salto - 0.05, T.salto + 0.15, "vuela"],
    [T.aterriza, T.aterriza + 0.3, "regazo", salida], [T.mira0 + 0.3, T.mira0 + 0.6, "confuso"]
  ];
  const mezclaMano = (a, b, k) => ({ x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), pu: lerp(a.pu, b.pu, k), mu: lerp(a.mu, b.mu, k), d: mezclaD(a.d, b.d, k) });
  function manosGuion(lista, dic, base, t) {
    let c = dic[base].c, l = dic[base].l;
    for (const [t0, t1, nom, f] of lista) { if (t <= t0) break; const k = (f || suave)(fase(t, t0, t1)); c = mezclaMano(c, dic[nom].c, k); l = mezclaMano(l, dic[nom].l, k); }
    return { c: Object.assign({}, c), l: Object.assign({}, l) };
  }

  function poseG(t) {
    const dir = mira(t), respira = Math.sin(t * 2.4);
    let x = pista(t, X_G), baja = pista(t, BAJA_G) + respira * 1.2;
    const p = {
      x, suelo: SUELO, s: S, espejo: dir < 0, tirasLimpias: true, ikContinuo: false,
      pelvis: { x: G.PELVIS.x, y: G.PELVIS.y + baja / S },
      torso: pista(t, TORSO_G), torsoEsc: { x: 1, y: 1 + respira * 0.005 }, piernas: {},
      cabeza: { ang: pista(t, CAB_G), dx: 0, dy: 0, esc: { x: 1, y: 1 } }
    };
    // mareo tras el coscorrón: bamboleo
    const mareo = dentro(t, T.bonk + 0.15, T.bonk + 0.35, T.mareo1 - 0.2, T.mareo1);
    p.torso += 0.07 * Math.sin((t - T.bonk) * 5.5) * mareo; p.cabeza.ang += 0.1 * Math.sin((t - T.bonk) * 5.5 + 1) * mareo;
    p.cabeza.dx += 25 * Math.cos((t - T.bonk) * 5.5) * mareo;
    // sacude la cabeza antes de volver a jugar
    const sac = fase(t, T.mareo1 - 0.25, T.ajusta0);
    if (sac > 0 && sac < 1) p.cabeza.ang += 0.16 * Math.sin(sac * Math.PI * 5) * Math.sin(Math.PI * sac);
    // victoria: botecitos
    const vic = dentro(t, T.victoria0 + 0.4, T.victoria0 + 0.5, T.bonk - 0.1, T.bonk);
    p.pelvis.y -= 10 / S * Math.abs(Math.sin((t - T.victoria0) * 11)) * vic;
    // pies
    const fc = pie(X0_GC, PASOS_GC, t), fl = pie(X0_GL, PASOS_GL, t);
    for (const [lado, f, dy] of [["cerca", fc, 0], ["lejos", fl, -12]]) {
      p.piernas[lado] = { tob: { x: G.PELVIS.x + dir * (f.x - x) / S, y: TOB_G + dy - f.alza / S }, ang: -0.25 * Math.sin(Math.PI * f.u) * (f.alza > 1 ? 1 : 0) };
    }
    // salto hacia atrás y regazo
    if (t >= T.salto) {
      const Y_PIE = SUELO - (G.SUELO - G.PELVIS.y) * S, bs = pista(T.salto, BAJA_G), xs = pista(T.salto, X_G);
      const v = vuelo(t, xs, Y_PIE + bs);
      const sentado = t >= T.aterriza;
      p.x = v.x; p.pelvis.y = G.PELVIS.y + (v.y - Y_PIE) / S;
      // pies en el despegue (relativos a la pelvis)
      const pieS = { cerca: pie(X0_GC, PASOS_GC, T.salto), lejos: pie(X0_GL, PASOS_GL, T.salto) }, dPel = p.pelvis.y - (G.PELVIS.y + bs / S);
      if (sentado) p.pelvis.y += hunde(t) / S + respira * 1.2 / S;
      const ka = salida(fase(t, T.salto, T.salto + 0.25)), kb = suave(fase(t, T.aterriza - 0.15, T.aterriza + 0.05));
      p.torso = lerp(lerp(0.3, -0.18, ka), -0.06, kb) + (sentado ? -0.1 * Math.exp(-(t - T.aterriza) * 6) * Math.sin((t - T.aterriza) * 14) : 0);
      p.cabeza.ang = lerp(lerp(-0.2, 0.06, ka), -0.04, kb);
      // piernas: encogidas en el aire, colgando sentado (con pataditas)
      for (const [lado, ox, oy] of [["cerca", 0, 0], ["lejos", 40, -14]]) {
        const enc = { x: G.PELVIS.x + 170 + ox, y: p.pelvis.y + 300 + oy };
        const cuelga = { x: G.PELVIS.x + 280 + ox, y: p.pelvis.y + 320 + oy };
        const desde = { x: G.PELVIS.x + dir * (pieS[lado].x - xs) / S, y: TOB_G + (lado === "lejos" ? -12 : 0) + dPel };
        const arriba = { x: G.PELVIS.x + 290 + ox * 0.5, y: p.pelvis.y + 90 + oy };       // al caer, las piernas arriba
        let q = mezcla(desde, enc, salida(fase(t, T.salto - 0.02, T.salto + 0.2)));
        q = mezcla(q, arriba, suave(fase(t, T.aterriza - 0.14, T.aterriza + 0.04)));
        q = mezcla(q, cuelga, suave(fase(t, T.aterriza + 0.4, T.aterriza + 0.85)));
        if (sentado) { const w = Math.sin((t - T.aterriza) * 7 + (lado === "cerca" ? 0 : 2)) * dentro(t, T.aterriza + 0.3, T.aterriza + 0.6, 12.2, 12.6); q.x += 40 * w; q.y -= 20 * Math.max(0, w); }
        const alto = dentro(t, T.aterriza - 0.14, T.aterriza + 0.04, T.aterriza + 0.4, T.aterriza + 0.85);
        p.piernas[lado] = { tob: q, ang: lerp(0.0, 0.5, fase(t, T.salto, T.salto + 0.2)) - 0.3 * kb - 0.7 * alto };
      }
    }
    // cara
    const ex = guion(GUION_CARA_G, CARAS_G, "inicio", t);
    // parpadeos rápidos al ver la luz
    const pp = dentro(t, T.quita2 - 0.02, T.quita2 + 0.05, 12.95, 13.1);
    const rapido = pp * Math.max(0, Math.sin((t - T.quita2) * 26));
    p.cara = cara(ex, Math.max(parpadeo(t, [1.0, 2.2, 13.9]), rapido));
    p.rojo = 0.25 * dentro(t, T.carga - 0.2, T.carga, T.golpe + 0.1, T.golpe + 0.3);
    p.chichon = tramo(t, T.bonk + 0.02, T.bonk + 0.2, salida) * (1 - 0.15 * tramo(t, 10, 11));
    p.chichonEn = { x: 760, y: 420 };
    p.sudor = 0.7 * dentro(t, T.aterriza, T.aterriza + 0.15, 12.0, 12.4);
    return p;
  }

  /* =====================================================================================
   * POSTURA CONJUNTA: manos (contactos), mandos y gafas
   * ===================================================================================== */
  let CAM = null;                                          // matriz de cámara del fotograma (para dibujar en pantalla desde los ganchos)
  const enPantalla = (g, M) => { g.setTransform(CAM); g.transform(M.a, M.b, M.c, M.d, M.e, M.f); };
  // marco de un objeto en la mano: pantalla ← (unidades de jarra con el mango en x)
  function marcoMano(R, p, m) {
    const muL = m.mu, w = R.aPantalla(p, { x: m.x, y: m.y });
    const sg = p.espejo ? -1 : 1, k = p.s * (R.K || 1) * R.JK;
    // en la hoja: rotate(ang)·scale(JK)·rotate(mu + π/2); en pantalla se añade el espejo
    return new DOMMatrix().translateSelf(w.x, w.y).scaleSelf(sg, 1).rotateSelf(((m.ang || 0) + muL + Math.PI / 2) * 180 / Math.PI).scaleSelf(k, k);
  }
  function poses(t) {
    const pD = poseD(t), pG = poseG(t);
    const dirG = mira(t);
    const TrG = G.tronco(pG), TrD = DV.tronco(pD);
    const out = { g: pG, d: pD };

    /* ---------- manos de Guillermo (guion) ---------- */
    const mg = manosGuion(GUION_MANOS_G, MANOS_G, "bols", t);
    const aHojaG = q => TrG(q);
    let cG = Object.assign({}, mg.c, aHojaG(mg.c)), lG = Object.assign({}, mg.l, aHojaG(mg.l));
    // al sacar las manos de los bolsillos (las de los bolsillos ya están en la hoja)
    // golpe por encima de la cabeza: la mano lejana describe un arco alrededor del hombro que pasa por la lámpara justo en T.golpe
    const arcoK = dentro(t, T.carga - 0.14, T.carga, T.golpe + 0.08, T.golpe + 0.3);
    if (arcoK > 0) {
      const hs = G.aPantalla(pG, TrG(G.HOMBRO)), hit = { x: LX + 30, y: LPY + LC + 6 };
      const r = Math.min(Math.hypot(hit.x - hs.x, hit.y - hs.y), 94), fHit = Math.atan2(hit.y - hs.y, hit.x - hs.x);
      // gancho de abajo arriba: de atrás y abajo (cargado) pasa por delante y sube hasta la lámpara
      const fH = fHit < 0 ? fHit + 2 * Math.PI : fHit;
      const f = t < T.golpe ? lerp(1.35, fH, entrada(fase(t, T.carga, T.golpe))) : lerp(fH, fH + 0.5, salida(fase(t, T.golpe, T.golpe + 0.16)));
      const h = G.aHoja(pG, { x: hs.x + Math.cos(f) * r, y: hs.y + Math.sin(f) * r });
      lG = { ...lG, x: lerp(lG.x, h.x, arcoK), y: lerp(lG.y, h.y, arcoK), mu: lerp(lG.mu, muHacia(G, pG, h, "lejos"), arcoK) };
    }
    // los mandos tiemblan de ilusión
    const ilu = dentro(t, T.entrega + 0.1, T.entrega + 0.2, T.muestra0, T.muestra0 + 0.15);
    cG.y += 10 * Math.sin(t * 30) * ilu; lG.y -= 10 * Math.sin(t * 30) * ilu;
    // en el aire: brazos que se agitan
    const agita = dentro(t, T.salto, T.salto + 0.1, T.aterriza - 0.05, T.aterriza + 0.1);
    cG.x += 50 * Math.sin(t * 22) * agita; cG.y += 40 * Math.cos(t * 19) * agita; lG.x += 46 * Math.sin(t * 20 + 1) * agita; lG.y += 40 * Math.cos(t * 17 + 2) * agita;

    /* ---------- manos de Deivi ---------- */
    const P0 = (dx, dy) => ({ x: DV.PELVIS.x + dx, y: pD.pelvis.y + dy });
    let cD = { ...P0(180, -60), mu: -2.3, d: MUSLO, pu: 1, ang: 0 }, lD = { ...P0(260, -70), mu: -2.4, d: MUSLO, pu: 1, ang: 0 };
    const poneD = (w, cc, ll) => {
      if (w <= 0) return;
      if (cc) { const q = mezcla(cD, cc.q, w); cD = { ...cD, ...q, mu: lerp(cD.mu, cc.mu, w), d: mezclaD(cD.d, cc.d, w), ang: lerp(cD.ang, cc.ang || 0, w) }; }
      if (ll) { const q = mezcla(lD, ll.q, w); lD = { ...lD, ...q, mu: lerp(lD.mu, ll.mu, w), d: mezclaD(lD.d, ll.d, w), ang: lerp(lD.ang, ll.ang || 0, w) }; }
    };
    // mandos: en las manos (encima de los muslos) → los agita → los ofrece
    const conMandos = 1 - tramo(t, T.entrega, T.entrega + 0.12);
    poneD(conMandos, { q: TrD({ x: 330, y: 620 }), mu: 2.4, d: AGARRA }, { q: TrD({ x: 430, y: 610 }), mu: 2.5, d: AGARRA });
    const ag = dentro(t, T.agita0, T.agita0 + 0.2, T.agita1, T.agita1 + 0.15);
    poneD(ag, { q: TrD({ x: 400 + 20 * Math.sin(t * 24), y: 420 + 18 * Math.cos(t * 24) }), mu: 2.3, d: AGARRA }, { q: TrD({ x: 520 + 18 * Math.sin(t * 24 + 1.5), y: 380 + 18 * Math.cos(t * 24 + 1.5) }), mu: 2.4, d: AGARRA });
    // punto de encuentro de los mandos (pantalla): entre las manos de los dos
    const encuentro = { c: { x: 598, y: 352 }, l: { x: 616, y: 334 } };
    const ofrece = dentro(t, T.paso0, T.paso1 + 0.1, T.entrega + 0.02, T.entrega + 0.3);
    if (ofrece > 0) {
      poneD(ofrece, { q: DV.aHoja(pD, { x: encuentro.c.x + 8, y: encuentro.c.y + 2 }), mu: 2.85, d: AGARRA }, { q: DV.aHoja(pD, { x: encuentro.l.x + 8, y: encuentro.l.y }), mu: 2.95, d: AGARRA });
    }
    // Guillermo va a por ellos
    const coge = dentro(t, T.paso0 + 0.1, T.entrega - 0.05, T.entrega + 0.05, T.atras1);
    if (coge > 0) {
      const qc = G.aHoja(pG, { x: encuentro.c.x - 14, y: encuentro.c.y + 4 }), ql = G.aHoja(pG, { x: encuentro.l.x - 12, y: encuentro.l.y + 2 });
      const kd = tramo(t, T.entrega - 0.1, T.entrega);
      cG = { ...cG, ...mezcla(cG, qc, coge), mu: lerp(cG.mu, 2.9, coge), d: mezclaD(cG.d, mezclaD(PALMA, AGARRA, kd), coge), pu: 1 };
      lG = { ...lG, ...mezcla(lG, ql, coge), mu: lerp(lG.mu, 2.9, coge), d: mezclaD(lG.d, mezclaD(PALMA, AGARRA, kd), coge), pu: 1 };
    }
    const vis = estadoGafas(t, pG, pD);
    out.gafas = vis;
    // relajado, mirando: manos en la barriga; risa: una mano a la boca
    const relax = dentro(t, T.levanta1 - 0.1, T.avanza1, T.reves - 0.3, T.reves - 0.18);
    poneD(relax, { q: P0(150, -46), mu: -2.5, d: MUSLO }, { q: P0(250, -56), mu: -2.6, d: MUSLO });
    const boca = Math.max(dentro(t, T.esquiva0 + 0.15, T.esquiva0 + 0.3, T.esquiva1, T.esquiva1 + 0.15), dentro(t, T.agachon0 + 0.1, T.agachon0 + 0.25, T.retro0, T.retro0 + 0.15));
    if (boca > 0) { const b = DV.aPantalla(pD, DV.boca(pD)); poneD(boca, null, { q: DV.aHoja(pD, { x: b.x - 4, y: b.y + 14 }), mu: -2.4, d: D(0.6, 0.85, 0.85, 0.8, 0.75) }); }
    // ¡que me da!: se echa atrás con las manos en alto
    const susto = dentro(t, T.reves - 0.25, T.reves - 0.1, T.reves + 0.3, T.reves + 0.55);
    poneD(susto, { q: TrD({ x: 320, y: 440 }), mu: 2.2, d: ABIERTA }, { q: TrD({ x: 450, y: 420 }), mu: 2.3, d: ABIERTA });
    // alivio: mano al pecho
    const alivio = dentro(t, T.reves + 0.3, T.reves + 0.5, T.bonk + 0.1, T.bonk + 0.3);
    poneD(alivio, { q: P0(150, -46), mu: -2.5, d: MUSLO }, { q: TrD({ x: 330, y: 420 }), mu: 2.4, d: PALMA });
    // carcajada: las dos manos a la barriga, meciéndose
    const carc = dentro(t, T.bonk + 0.2, T.bonk + 0.4, 10.2, 10.45);
    poneD(carc, { q: TrD({ x: 300, y: 590 }), mu: 2.6, d: RELAJADA }, { q: TrD({ x: 420, y: 570 }), mu: 2.8, d: RELAJADA });
    // ¡no, no, no!: manos delante
    const alarma = dentro(t, T.salto + 0.05, T.salto + 0.2, T.aterriza - 0.02, T.aterriza + 0.02);
    poneD(alarma, { q: TrD({ x: 370, y: 380 }), mu: 2.4, d: ABIERTA }, { q: TrD({ x: 520, y: 340 }), mu: 2.5, d: ABIERTA });
    // ¡uf!: brazos arriba de golpe y luego abajo (la cercana al reposabrazos)
    const uf = t >= T.aterriza ? Math.exp(-(t - T.aterriza) * 3.5) * suave(fase(t, T.aterriza, T.aterriza + 0.05)) : 0;
    poneD(uf, { q: DV.aHoja(pD, { x: XD + 96, y: 318 }), mu: 0.9, d: ABIERTA }, { q: P0(200, -40), mu: -2.4, d: ABIERTA });
    // después: la cercana en su muslo y la lejana en el pecho (luego tira de la correa de las gafas)
    const brazo = tramo(t, T.aterriza + 0.3, T.aterriza + 0.7);
    poneD(brazo, { q: P0(70, -44), mu: -2.3, d: MUSLO }, { q: DV.aHoja(pD, { x: XD + 10, y: 376 }), mu: 2.2, d: RELAJADA });
    // las gafas: recogerlas del regazo, enseñarlas, subirlas encima de Guillermo, encajárselas y, al final, subírselas a la frente
    if (vis.manos) {
      const k = vis.manos.k;
      if (vis.manos.c) poneD(k * vis.manos.kc, { q: DV.aHoja(pD, vis.manos.c), mu: vis.manos.cmu ?? 2.6, d: PINZA }, null);
      if (vis.manos.l) poneD(k, null, { q: DV.aHoja(pD, vis.manos.l), mu: vis.manos.lmu ?? 2.2, d: vis.manos.ld || PINZA });
    }
    // palmaditas en la cabeza
    const pal = dentro(t, T.palmada0 - 0.06, T.palmada0 + 0.04, T.palmada1 - 0.04, T.palmada1 + 0.12);
    if (pal > 0) {
      const top = G.aPantalla(pG, G.cabeza(pG).a({ x: 700, y: 250 }));
      const bote = 12 * Math.abs(Math.sin((t - T.palmada0) * Math.PI / 0.12));
      poneD(pal, null, { q: DV.aHoja(pD, { x: top.x + 4, y: top.y + 2 - bote }), mu: 2.2, d: D(0.3, 0.2, 0.15, 0.15, 0.2) });
    }

    /* ---------- los mandos ---------- */
    // en las manos de Deivi o de Guillermo; en el traspaso se mezclan los dos marcos
    pD.manoCerca = { x: cD.x, y: cD.y, ang: cD.ang, mu: cD.mu, dobla: -1, puno: 1, dedos: cD.d };
    pD.manoLejos = { x: lD.x, y: lD.y, ang: lD.ang, mu: lD.mu, dobla: -1, puno: 1, dedos: lD.d };
    pG.manoCerca = { x: cG.x, y: cG.y, ang: 0, mu: cG.mu, dobla: -1, puno: cG.pu, dedos: cG.d };
    pG.manoLejos = { x: lG.x, y: lG.y, ang: 0, mu: lG.mu, dobla: -1, puno: lG.pu, dedos: lG.d };
    // Guillermo se recoloca las gafas con la mano cercana
    const aj = dentro(t, T.ajusta0, T.ajusta0 + 0.12, T.ajusta1 - 0.06, T.ajusta1 + 0.06);
    if (aj > 0) {
      const M = matRetrato(G, pG).multiply(colocar(vis.P || P_CARA));
      const q = aplicaP(M, AGARRE.lado);
      const h = G.aHoja(pG, q), m = pG.manoCerca;
      pG.manoCerca = { ...m, x: lerp(m.x, h.x - 10, aj), y: lerp(m.y, h.y + 26, aj), mu: lerp(m.mu, 1.0, aj), dedos: mezclaD(m.dedos, PINZA, aj) };
    }
    const mandoD = t < T.entrega, kb = tramo(t, T.entrega - 0.04, T.entrega + 0.1);
    for (const lado of ["c", "l"]) {
      const mD = lado === "c" ? pD.manoCerca : pD.manoLejos, mG = lado === "c" ? pG.manoCerca : pG.manoLejos;
      const MD = marcoMano(DV, pD, mD).scaleSelf(1, -1), MG = marcoMano(G, pG, mG);    // en Deivi (en espejo) se invierte el mando para que no gire al pasarlo
      let M = MG;
      if (kb < 1) { const a = descompon(MD), b = descompon(MG); b.ang = desenvuelve(b.ang, a.ang); M = colocar(mezP(a, b, kb)); }
      const luz = mandoD ? 0.5 + 0.5 * dentro(t, T.agita0, T.agita0 + 0.1, T.agita1, T.agita1 + 0.2) : 1;
      const dib = g => { if (!CAM) return; g.save(); enPantalla(g, M); dibMando(g, COL_MANDO[lado], luz, t); g.restore(); };
      const mano = mandoD ? mD : mG;
      const prev = mano.objeto; mano.objeto = prev ? (g, tt) => { prev(g, tt); dib(g); } : dib;
    }
    // gafas en las manos de Deivi (gancho de su mano lejana) o en el regazo (encima del tronco)
    if (vis.capa === "manoD") { const prev = pD.manoLejos.objeto; pD.manoLejos.objeto = g => { if (prev) prev(g); if (!CAM) return; g.save(); enPantalla(g, vis.M); dibGafas(g, t, vis.on, vis.suelta); g.restore(); }; }
    if (vis.capa === "regazo") pD.capaTronco = g => { if (!CAM) return; g.save(); enPantalla(g, vis.M); dibGafas(g, t, vis.on, 1); g.restore(); };
    if (vis.capa === "cara") {
      const P = colocar(vis.P), ks = vis.correas, on = vis.on, mk = vis.marcas, cf = vis.correaFin;
      pG.capaCabeza = g => { marcas(g, mk); brilloCara(g, P, tramo(t, T.arranca, T.arranca + 0.3) * on * (1 - vis.subidas), t); correas(g, P, ks, cf); g.save(); g.transform(P.a, P.b, P.c, P.d, P.e, P.f); dibGafas(g, t, on, vis.suelta || 0); g.restore(); };
    } else if (vis.marcas > 0) pG.capaCabeza = g => marcas(g, vis.marcas);
    out.antebrazo = vis.antebrazo || pal > 0.02;      // la mano de Deivi va por delante de la cabeza de Guillermo
    return out;
  }

  /* ---------- las gafas: dónde están y quién las lleva ---------- */
  const P_REGAZO = { x: XD - 40, y: Y_PEL_D - 10, ang: -0.12, sx: -1, sy: 1 };      // en el regazo de Deivi (pantalla, escala de retrato aparte)
  function estadoGafas(t, pG, pD) {
    const sc = ESC_RET;
    const pantalla = q => colocar({ x: q.x, y: q.y, ang: q.ang, sx: q.sx * sc, sy: q.sy * sc });
    const on = lerp(0.15, 1, tramo(t, T.arranca, T.arranca + 0.3)) * (1 - 0.55 * dentro(t, T.bonk, T.bonk + 0.05, T.ajusta1 - 0.1, T.ajusta1)) * (1 - tramo(t, T.quita1, T.quita2));
    // 1) en el regazo; 2) en las manos de Deivi: las coge, las enseña (cristal hacia Guillermo) y las sube encima de su cabeza.
    //    La cercana agarra el costado (el extremo de su lado) y la lejana el frontal; luego solo la lejana, por arriba.
    const Mret = matRetrato(G, pG);
    if (t < T.pone0) {
      const muestra = { x: XD - 100, y: 268, ang: 0.1 + 0.08 * Math.sin((t - T.muestra0) * 9) * dentro(t, T.muestra0 + 0.05, T.muestra0 + 0.15, T.muestra1, T.muestra1 + 0.1), sx: -1, sy: 1 };
      let q = mezP(P_REGAZO, muestra, tramo(t, T.cogeV1, T.muestra0 + 0.05));
      if (t > T_GIRO) {
        const arriba = descompon(Mret.multiply(colocar(P_ARRIBA)));
        arriba.sx /= sc; arriba.sy /= sc; arriba.ang = desenvuelve(arriba.ang, q.ang);
        q = mezP(q, arriba, tramo(t, T.sube0 + 0.2, T.pone0, suave5));
      }
      const M = pantalla(q);
      return { capa: t < T.cogeV1 ? "regazo" : "manoD", M, suelta: 1 - tramo(t, T.sube0 + 0.3, T.pone0 - 0.03), on: 0.15 + 0.55 * dentro(t, T.muestra0 + 0.05, T.muestra0 + 0.15, T.muestra1, T.muestra1 + 0.25),
        manos: { k: tramo(t, T.cogeV0, T.cogeV1), kc: 0, l: aplicaP(M, AGARRE.lado), lmu: 2.0, ld: PINZA } };
    }
    // 3) en la cabeza de Guillermo (retrato): bajan, encajan; coscorrón; las recoloca; Deivi se las sube a la frente
    let P = mezP(P_ARRIBA, P_CARA, tramo(t, T.pone0, T.pone1, suave5));
    P.y += 6 * Math.exp(-(t - T.clic) * 14) * Math.sin((t - T.clic) * 40) * (t > T.clic ? 1 : 0);
    P = mezP(P, P_TORCIDA, dentro(t, T.bonk, T.bonk + 0.06, T.ajusta0 + 0.08, T.ajusta1));
    const sube = tramo(t, T.quita1, T.quita2, suave5);
    P = mezP(P, P_FRENTE, sube);
    P.y += 5 * Math.exp(-(t - T.quita2) * 12) * Math.sin((t - T.quita2) * 35) * (t > T.quita2 ? 1 : 0);
    const M = Mret.multiply(colocar(P));
    const res = { capa: "cara", P, on, correas: tramo(t, T.pone0, T.pone0 + 0.25), subidas: sube, marcas: tramo(t, T.quita1 + 0.1, T.quita2) };
    // la mano de Deivi baja las gafas (agarradas por el costado) y luego se las sube a la frente (por arriba)
    const baja = 1 - tramo(t, T.clic + 0.02, T.clic + 0.14);
    if (baja > 0) res.manos = { k: baja, kc: 0, l: aplicaP(M, AGARRE.lado), lmu: 2.0, ld: PINZA };
    // …tirando de la correa por detrás de la cabeza: las gafas suben por la cara hasta la frente
    // (no la suelta: se queda sujetando la correa, con las gafas tirantes en la frente)
    const quita = tramo(t, T.quita0, T.quita1 - 0.04);
    if (quita > 0) {
      const fin = mezcla({ x: 578, y: 474 }, { x: 452, y: 446 }, sube);
      fin.x += 6 * Math.sin((t - T.quita2) * 2.3) * tramo(t, T.quita2, T.quita2 + 0.3); fin.y -= 8 * dentro(t, T.guino - 0.2, T.guino, T.guino + 0.3, T.guino + 0.5);
      if (t > T.quita1 - 0.06) res.correaFin = fin;
      res.manos = { k: quita, kc: 0, l: aplicaP(Mret, fin), lmu: 1.85, ld: PINZA };
    }
    if (baja > 0.02 || quita > 0.02) res.antebrazo = true;
    return res;
  }

  /* =====================================================================================
   * DECORADO: salón de noche
   * ===================================================================================== */
  const PARED = 430;
  const TV = { x: 64, y: 160, w: 200, h: 122 };
  let fondo = null;
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W + 120; c.height = H + 100; const g = c.getContext("2d");
    g.translate(60, 50); g.lineJoin = "round"; g.lineCap = "round";
    // pared
    const gp = g.createLinearGradient(0, -50, 0, PARED); gp.addColorStop(0, "#1c1530"); gp.addColorStop(0.5, "#2c2146"); gp.addColorStop(1, "#382a52");
    g.fillStyle = gp; g.fillRect(-60, -50, W + 120, PARED + 50);
    // textura suave de la pared (paneles verticales)
    g.strokeStyle = "rgba(255,255,255,0.035)"; g.lineWidth = 2; for (let x = -40; x < W + 60; x += 64) { g.beginPath(); g.moveTo(x, -50); g.lineTo(x, PARED); g.stroke(); }
    // tira de LED en lo alto de la pared
    const led = g.createLinearGradient(0, 0, W, 0); led.addColorStop(0, "#ff3fd0"); led.addColorStop(0.5, "#8a5bff"); led.addColorStop(1, "#2ef2ff");
    const brilloLed = g.createLinearGradient(0, 8, 0, 120); brilloLed.addColorStop(0, "rgba(160,90,255,0.35)"); brilloLed.addColorStop(1, "rgba(160,90,255,0)");
    g.fillStyle = brilloLed; g.fillRect(-60, 8, W + 120, 112);
    g.fillStyle = "#0e0b16"; g.fillRect(-60, -50, W + 120, 56);
    g.fillStyle = led; g.fillRect(-60, 4, W + 120, 5);
    g.fillStyle = "rgba(255,255,255,0.7)"; g.fillRect(-60, 5, W + 120, 1.5);
    // ventana con la ciudad de noche (derecha)
    const VX = 846, VY = 64, VW = 150, VH = 270;
    const cielo = g.createLinearGradient(0, VY, 0, VY + VH); cielo.addColorStop(0, "#0b1030"); cielo.addColorStop(1, "#33285a");
    g.fillStyle = cielo; g.fillRect(VX, VY, VW, VH);
    g.fillStyle = "#f4eecf"; g.beginPath(); g.arc(VX + 108, VY + 46, 15, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#33285a"; g.beginPath(); g.arc(VX + 101, VY + 41, 13, 0, Math.PI * 2); g.fill();
    for (let i = 0; i < 9; i++) { const bx = VX + i * 18 - 4, bh = 60 + hash(i + 3) * 110, by = VY + VH - bh;
      g.fillStyle = i % 2 ? "#161634" : "#1d1b40"; g.fillRect(bx, by, 17, bh);
      for (let j = 0; j < 12; j++) if (hash(i * 13 + j) > 0.55) { g.fillStyle = hash(j + i) > 0.5 ? "#ffd27a" : "#9fe8ff"; g.fillRect(bx + 3 + (j % 2) * 7, by + 8 + Math.floor(j / 2) * 13, 4, 5); } }
    for (let i = 0; i < 14; i++) { g.fillStyle = "rgba(255,255,255,0.8)"; g.fillRect(VX + hash(i + 50) * VW, VY + hash(i + 60) * 90, 1.6, 1.6); }
    g.strokeStyle = "#141020"; g.lineWidth = 6; g.strokeRect(VX, VY, VW, VH); g.beginPath(); g.moveTo(VX + VW / 2, VY); g.lineTo(VX + VW / 2, VY + VH); g.moveTo(VX, VY + VH * 0.45); g.lineTo(VX + VW, VY + VH * 0.45); g.stroke();
    g.fillStyle = "#4a3b63"; g.fillRect(VX - 10, VY + VH, VW + 20, 10); g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(VX - 10, VY + VH, VW + 20, 10);
    // cortinas
    for (const [x0, sg] of [[VX - 26, 1], [VX + VW + 26, -1]]) {
      g.fillStyle = "#5b2f6e"; g.beginPath(); g.moveTo(x0, VY - 20); g.lineTo(x0 + sg * 40, VY - 20); g.quadraticCurveTo(x0 + sg * 20, VY + VH * 0.5, x0 + sg * 34, VY + VH + 50); g.lineTo(x0, VY + VH + 50); g.closePath(); g.fill();
      g.strokeStyle = "rgba(0,0,0,0.35)"; g.lineWidth = 3; for (let k = 1; k < 3; k++) { g.beginPath(); g.moveTo(x0 + sg * 12 * k, VY - 18); g.quadraticCurveTo(x0 + sg * 8 * k, VY + VH * 0.5, x0 + sg * 12 * k, VY + VH + 48); g.stroke(); }
    }
    g.fillStyle = "#2a2234"; g.fillRect(VX - 40, VY - 26, VW + 80, 8);
    // cuadro abstracto sobre el sillón (montañas y luna, sin letras)
    const CX = 610, CY = 70;
    g.fillStyle = "#e9dcc6"; g.fillRect(CX, CY, 120, 92); g.strokeStyle = "#1a1420"; g.lineWidth = 6; g.strokeRect(CX, CY, 120, 92);
    g.fillStyle = "#ff8a5c"; g.fillRect(CX + 10, CY + 10, 100, 72);
    g.fillStyle = "#ffd36b"; g.beginPath(); g.arc(CX + 74, CY + 36, 14, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#6b3f8f"; g.beginPath(); g.moveTo(CX + 10, CY + 82); g.lineTo(CX + 42, CY + 40); g.lineTo(CX + 64, CY + 66); g.lineTo(CX + 82, CY + 50); g.lineTo(CX + 110, CY + 82); g.closePath(); g.fill();
    g.fillStyle = "#3b2457"; g.beginPath(); g.moveTo(CX + 10, CY + 82); g.lineTo(CX + 30, CY + 62); g.lineTo(CX + 52, CY + 82); g.closePath(); g.fill();
    // estantería de pared con plantas y figuras (entre la tele y la lámpara)
    g.fillStyle = "#4a3448"; g.fillRect(70, 92, 186, 9); g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(70, 92, 186, 9);
    const maceta = (x, y, col) => { g.fillStyle = col; g.beginPath(); g.moveTo(x - 12, y - 22); g.lineTo(x + 12, y - 22); g.lineTo(x + 9, y); g.lineTo(x - 9, y); g.closePath(); g.fill(); g.lineWidth = 2; g.strokeStyle = TINTA; g.stroke();
      g.fillStyle = "#3f8f5a"; for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * 0.45; g.beginPath(); g.ellipse(x + Math.cos(a) * 14, y - 26 + Math.sin(a) * 12, 10, 5, a, 0, Math.PI * 2); g.fill(); g.stroke(); } };
    maceta(92, 92, "#d9734a"); maceta(236, 92, "#3e8fc0");
    g.fillStyle = "#e7e2ef"; g.fillRect(140, 64, 14, 28); g.fillRect(160, 72, 34, 20); g.strokeRect(140, 64, 14, 28); g.strokeRect(160, 72, 34, 20);
    g.fillStyle = "#ff4fd8"; g.beginPath(); g.arc(177, 82, 4, 0, Math.PI * 2); g.fill();
    // tele: marco (la pantalla se pinta en cada fotograma)
    g.fillStyle = "#08080c"; g.fillRect(TV.x - 10, TV.y - 10, TV.w + 20, TV.h + 20); g.strokeStyle = "#2b2b35"; g.lineWidth = 2; g.strokeRect(TV.x - 10, TV.y - 10, TV.w + 20, TV.h + 20);
    g.fillStyle = "#1a1a22"; g.fillRect(TV.x + TV.w / 2 - 4, TV.y + TV.h + 10, 8, 8);
    // suelo de tarima oscura
    const gs = g.createLinearGradient(0, PARED, 0, H + 50); gs.addColorStop(0, "#3a2620"); gs.addColorStop(1, "#5a3a2c");
    g.fillStyle = gs; g.fillRect(-60, PARED, W + 120, H + 50 - PARED);
    g.strokeStyle = "rgba(0,0,0,0.3)"; g.lineWidth = 2;
    for (let i = 0; i < 6; i++) { const y = PARED + 12 + i * i * 6 + i * 14; g.beginPath(); g.moveTo(-60, y); g.lineTo(W + 60, y); g.stroke();
      for (let j = 0; j < 7; j++) { const x = -40 + j * 170 + (i % 2) * 85 + hash(i * 7 + j) * 30; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 12 + i * 8); g.stroke(); } }
    g.fillStyle = "#1a1220"; g.fillRect(-60, PARED - 6, W + 120, 8);
    // mueble bajo de la tele con la consola
    const MB = { x: 40, y: PARED - 8, w: 250, h: 58 };
    g.fillStyle = "#3a2a3f"; g.fillRect(MB.x, MB.y, MB.w, MB.h); g.strokeStyle = TINTA; g.lineWidth = 3; g.strokeRect(MB.x, MB.y, MB.w, MB.h);
    g.fillStyle = "#4b3752"; g.fillRect(MB.x, MB.y, MB.w, 8);
    g.strokeStyle = "rgba(0,0,0,0.45)"; g.lineWidth = 2; for (const x of [MB.x + 83, MB.x + 166]) { g.beginPath(); g.moveTo(x, MB.y + 10); g.lineTo(x, MB.y + MB.h - 4); g.stroke(); }
    g.fillStyle = "#c9b8d6"; for (const x of [MB.x + 70, MB.x + 96, MB.x + 153, MB.x + 179]) { g.beginPath(); g.arc(x, MB.y + 32, 3, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = "#eceaf2"; g.fillRect(MB.x + 150, MB.y - 18, 60, 18); g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(MB.x + 150, MB.y - 18, 60, 18);
    g.fillStyle = "#2ef2ff"; g.fillRect(MB.x + 156, MB.y - 7, 12, 2);
    // alfombra redonda
    const AX = 470, AY = 548;
    g.fillStyle = "#1f6f78"; g.beginPath(); g.ellipse(AX, AY, 270, 42, 0, 0, Math.PI * 2); g.fill(); g.lineWidth = 3; g.strokeStyle = TINTA; g.stroke();
    g.strokeStyle = "#f2a64a"; g.lineWidth = 5; g.beginPath(); g.ellipse(AX, AY, 230, 34, 0, 0, Math.PI * 2); g.stroke();
    g.strokeStyle = "#e66a8a"; g.lineWidth = 3; g.beginPath(); g.ellipse(AX, AY, 175, 25, 0, 0, Math.PI * 2); g.stroke();
    g.strokeStyle = "#f2a64a"; g.lineWidth = 2; g.beginPath(); g.ellipse(AX, AY, 110, 15, 0, 0, Math.PI * 2); g.stroke();
    // planta grande en una maceta (derecha, delante de la cortina)
    const PX = 990, PY = SUELO + 6;
    g.fillStyle = "#c9654a"; g.beginPath(); g.moveTo(PX - 30, PY - 56); g.lineTo(PX + 30, PY - 56); g.lineTo(PX + 22, PY); g.lineTo(PX - 22, PY); g.closePath(); g.fill(); g.lineWidth = 3; g.strokeStyle = TINTA; g.stroke();
    for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i - 3) * 0.32, L = 90 + 40 * hash(i + 70);
      g.strokeStyle = "#2f6b44"; g.lineWidth = 3; g.beginPath(); g.moveTo(PX, PY - 56); g.quadraticCurveTo(PX + Math.cos(a) * L * 0.5, PY - 56 + Math.sin(a) * L * 0.6, PX + Math.cos(a) * L, PY - 56 + Math.sin(a) * L); g.stroke();
      g.fillStyle = "#3f9a5e"; g.beginPath(); g.ellipse(PX + Math.cos(a) * L, PY - 56 + Math.sin(a) * L, 22, 9, a, 0, Math.PI * 2); g.fill(); g.lineWidth = 2; g.strokeStyle = TINTA; g.stroke(); }
    // viñeta
    const v = g.createRadialGradient(512, 320, 300, 512, 320, 720); v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(5,0,15,0.5)");
    g.fillStyle = v; g.fillRect(-60, -50, W + 120, H + 100);
    return c;
  }

  /* ---------- el sillón ---------- */
  const SIL = { base: "#d9902e", sombra: "#9e5f19", luz: "#f6c062", tinta: TINTA };
  function sillonDetras(g, t) {
    const h = hunde(t), x = XD;
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    // respaldo (alto y redondeado, un poco reclinado)
    const forma = () => { g.beginPath(); g.moveTo(x + 40, ASIENTO + 20); g.bezierCurveTo(x + 30, ASIENTO - 120, x + 36, SUELO - 320, x + 64, SUELO - 330);
      g.quadraticCurveTo(x + 104, SUELO - 336, x + 112, SUELO - 300); g.bezierCurveTo(x + 116, SUELO - 220, x + 112, ASIENTO - 40, x + 108, SUELO - 20); g.lineTo(x + 50, SUELO - 20); g.closePath(); };
    forma(); g.fillStyle = SIL.base; g.fill();
    g.save(); forma(); g.clip(); g.fillStyle = SIL.sombra; g.fillRect(x + 84, SUELO - 340, 40, 340); g.fillStyle = SIL.luz; g.fillRect(x + 44, SUELO - 300, 8, 200); g.restore();
    forma(); g.lineWidth = 3; g.strokeStyle = SIL.tinta; g.stroke();
    // botones capitoné
    g.fillStyle = SIL.sombra; for (const [dx, dy] of [[62, -280], [74, -230], [66, -180]]) { g.beginPath(); g.arc(x + dx, SUELO + dy, 3, 0, Math.PI * 2); g.fill(); }
    // reposabrazos lejano (por detrás de Deivi)
    const ry = ASIENTO - 58 + h * 0.3;
    g.beginPath(); g.moveTo(x - 118, ASIENTO + 10); g.lineTo(x - 118, ry + 14); g.quadraticCurveTo(x - 124, ry - 10, x - 98, ry - 12); g.lineTo(x + 60, ry - 8); g.lineTo(x + 60, ASIENTO + 10); g.closePath();
    g.fillStyle = SIL.sombra; g.fill(); g.lineWidth = 3; g.stroke();
    g.fillStyle = SIL.base; g.beginPath(); g.ellipse(x - 106, ry + 2, 16, 15, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    g.strokeStyle = SIL.sombra; g.lineWidth = 2; g.beginPath(); g.arc(x - 106, ry + 2, 7, 0.5, Math.PI * 2); g.stroke();
    // faldón y patas
    g.fillStyle = "#3a2418"; for (const dx of [-112, 92]) { g.beginPath(); g.moveTo(x + dx - 5, SUELO - 22); g.lineTo(x + dx + 5, SUELO - 22); g.lineTo(x + dx + 3, SUELO); g.lineTo(x + dx - 2, SUELO); g.closePath(); g.fill(); g.lineWidth = 2; g.strokeStyle = SIL.tinta; g.stroke(); }
    g.beginPath(); g.moveTo(x - 124, ASIENTO + 22 + h); g.lineTo(x + 104, ASIENTO + 22 + h * 0.5); g.lineTo(x + 104, SUELO - 20); g.lineTo(x - 124, SUELO - 20); g.closePath();
    g.fillStyle = SIL.base; g.fill(); g.lineWidth = 3; g.strokeStyle = SIL.tinta; g.stroke();
    g.fillStyle = SIL.sombra; g.fillRect(x - 122, SUELO - 34, 224, 12);
    // cojín del asiento (se hunde)
    const cf = () => { g.beginPath(); g.moveTo(x - 128, ASIENTO + 8 + h); g.quadraticCurveTo(x - 132, ASIENTO - 4 + h, x - 112, ASIENTO - 6 + h * 0.9); g.lineTo(x + 70, ASIENTO - 4 + h * 0.4);
      g.lineTo(x + 70, ASIENTO + 26); g.lineTo(x - 112, ASIENTO + 28 + h); g.quadraticCurveTo(x - 130, ASIENTO + 26 + h, x - 128, ASIENTO + 8 + h); g.closePath(); };
    cf(); g.fillStyle = SIL.base; g.fill(); g.save(); cf(); g.clip(); g.fillStyle = SIL.luz; g.fillRect(x - 120, ASIENTO - 6 + h, 180, 4); g.fillStyle = SIL.sombra; g.fillRect(x - 130, ASIENTO + 18 + h, 210, 12); g.restore();
    cf(); g.lineWidth = 3; g.strokeStyle = SIL.tinta; g.stroke();
    g.restore();
  }

  /* ---------- la tele: lo que ve Guillermo ---------- */
  // objetos del juego: [t aparece, t llega, tipo, x final (−1…1), y final (−1…1), estalla]
  const JUEGO = [[4.4, 5.06, "cubo", 0.1, -0.1, false], [5.1, 5.62, "diana", -0.3, 0, true], [5.35, 5.86, "diana", 0.35, 0.1, true], [5.6, 6.1, "diana", -0.1, -0.2, true],
    [5.85, 6.36, "barra", 0, -0.55, false], [6.55, 7.32, "murcielago", 0.9, -0.3, true], [7.2, 8.04, "jefe", 0, -0.1, true], [9.95, 10.62, "laser", 0, 0.75, false]];
  function pintaTele(g, t) {
    const { x, y, w, h } = TV;
    g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
    const enc = tramo(t, 0.2, 0.6);
    if (t < T.arranca) {
      // espera: rueda de carga
      g.fillStyle = "#0b0a1e"; g.fillRect(x, y, w, h);
      g.strokeStyle = "rgba(120,200,255,0.25)"; g.lineWidth = 5; g.beginPath(); g.arc(x + w / 2, y + h / 2, 18, 0, Math.PI * 2); g.stroke();
      g.strokeStyle = "#5fe0ff"; g.beginPath(); g.arc(x + w / 2, y + h / 2, 18, t * 5, t * 5 + 1.6); g.stroke();
    } else {
      const fx = x + w / 2, fy = y + h * 0.42;
      const cielo = g.createLinearGradient(0, y, 0, fy); cielo.addColorStop(0, "#09051c"); cielo.addColorStop(1, "#3a0d4a");
      g.fillStyle = cielo; g.fillRect(x, y, w, fy - y);
      g.fillStyle = "#07041a"; g.fillRect(x, fy, w, y + h - fy);
      // estrellas que vienen
      for (let i = 0; i < 18; i++) { const ph = (t * 0.6 + hash(i)) % 1, a = hash(i + 20) * Math.PI * 2, r = ph * ph * w * 0.6;
        g.fillStyle = `rgba(255,255,255,${ph})`; g.fillRect(fx + Math.cos(a) * r, fy + Math.sin(a) * r * 0.6 - 10, 1.5, 1.5); }
      // rejilla en perspectiva
      g.strokeStyle = "rgba(255,63,208,0.8)"; g.lineWidth = 1;
      for (let i = -6; i <= 6; i++) { g.beginPath(); g.moveTo(fx + i * 6, fy); g.lineTo(fx + i * 60, y + h); g.stroke(); }
      for (let i = 0; i < 7; i++) { const ph = ((t * 1.4 + i / 7) % 1), yy = fy + (y + h - fy) * ph * ph; g.globalAlpha = 0.3 + 0.7 * ph; g.beginPath(); g.moveTo(x, yy); g.lineTo(x + w, yy); g.stroke(); }
      g.globalAlpha = 1;
      g.fillStyle = "rgba(46,242,255,0.6)"; g.fillRect(x, fy - 1, w, 2);
      // objetos
      for (const [t0, t1, tipo, ox, oy, estalla] of JUEGO) {
        if (t < t0) continue;
        const u = fase(t, t0, t1), k = 0.08 + 0.92 * u * u;
        const px = fx + ox * w * 0.45 * u, py = fy + oy * h * 0.5 * u, s = 34 * k;
        if (t <= t1) {
          g.save(); g.translate(px, py);
          if (tipo === "cubo") { g.rotate(t * 3); g.fillStyle = "#2ef2ff"; g.fillRect(-s / 2, -s / 2, s, s); g.strokeStyle = "#ffffff"; g.lineWidth = 1.5; g.strokeRect(-s / 2, -s / 2, s, s); }
          else if (tipo === "diana") { for (let r = 3; r >= 1; r--) { g.fillStyle = r % 2 ? "#ff3f6c" : "#ffffff"; g.beginPath(); g.arc(0, 0, s * 0.5 * r / 3, 0, Math.PI * 2); g.fill(); } }
          else if (tipo === "barra") { g.fillStyle = "#ffd23f"; g.fillRect(-w, -s * 0.15, 2 * w, s * 0.3); }
          else if (tipo === "murcielago") { g.fillStyle = "#b07bff"; g.beginPath(); g.moveTo(-s * 0.6, 0); g.quadraticCurveTo(-s * 0.3, -s * 0.5 * (0.6 + 0.4 * Math.sin(t * 30)), 0, 0); g.quadraticCurveTo(s * 0.3, -s * 0.5 * (0.6 + 0.4 * Math.sin(t * 30)), s * 0.6, 0); g.quadraticCurveTo(0, s * 0.35, -s * 0.6, 0); g.fill(); }
          else if (tipo === "jefe") { const S2 = s * 1.6; g.fillStyle = "#ff4fd8"; g.beginPath(); g.arc(0, 0, S2 * 0.5, 0, Math.PI * 2); g.fill(); g.fillStyle = "#ffffff"; g.beginPath(); g.arc(-S2 * 0.18, -S2 * 0.08, S2 * 0.1, 0, Math.PI * 2); g.arc(S2 * 0.18, -S2 * 0.08, S2 * 0.1, 0, Math.PI * 2); g.fill(); }
          else if (tipo === "laser") { g.fillStyle = "#ff2a2a"; g.fillRect(-w, -2 - 3 * u, 2 * w, 4 + 6 * u); g.fillStyle = "rgba(255,120,120,0.5)"; g.fillRect(-w, -6 - 8 * u, 2 * w, 12 + 16 * u); }
          g.restore();
        } else if (estalla) {
          const e = fase(t, t1, t1 + 0.45); if (e >= 1) continue;
          for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2 + hash(i + t0) * 0.5, r = (tipo === "jefe" ? 70 : 40) * salida(e);
            g.fillStyle = i % 2 ? "#ffd23f" : "#ff4fd8"; g.globalAlpha = 1 - e; g.fillRect(px + Math.cos(a) * r - 2, py + Math.sin(a) * r - 2, 4, 4); }
          g.globalAlpha = 1;
        }
      }
      // ¡pum! contra el regazo: la imagen se va a ruido y se queda en pausa
      const ruidoK = dentro(t, T.aterriza, T.aterriza + 0.02, T.aterriza + 0.4, T.aterriza + 0.6);
      if (ruidoK > 0.01) for (let i = 0; i < 26; i++) { g.fillStyle = `rgba(${200 + 55 * hash(i + t * 30 | 0)},${200 * hash(i + 3)},255,${0.7 * ruidoK})`; g.fillRect(x, y + hash(i + Math.floor(t * 40)) * h, w, 2 + 4 * hash(i + 9)); }
      const pausa = tramo(t, T.aterriza + 0.3, T.aterriza + 0.6);
      if (pausa > 0) { g.fillStyle = `rgba(8,6,20,${0.6 * pausa})`; g.fillRect(x, y, w, h); g.fillStyle = `rgba(255,255,255,${0.9 * pausa})`; g.fillRect(fx - 12, fy, 8, 30); g.fillRect(fx + 4, fy, 8, 30); }
    }
    // reflejo del cristal
    g.fillStyle = "rgba(255,255,255,0.06)"; g.beginPath(); g.moveTo(x, y); g.lineTo(x + w * 0.4, y); g.lineTo(x, y + h * 0.7); g.closePath(); g.fill();
    g.restore();
    g.globalAlpha = 1 - enc; g.fillStyle = "#000"; g.fillRect(x, y, w, h); g.globalAlpha = 1;
  }
  // resplandor de la tele en la pared y el suelo
  // luces precalculadas (sprites): degradados caros que solo se dibujan con drawImage
  let SPR = null;
  function sprites() {
    const mk = (w, h, f) => { const c = document.createElement("canvas"); c.width = w; c.height = h; f(c.getContext("2d")); return c; };
    const radial = (r, col, a0, r0 = 0.05) => mk(2 * r, 2 * r, g => { const gr = g.createRadialGradient(r, r, r * r0, r, r, r); gr.addColorStop(0, `rgba(${col},${a0})`); gr.addColorStop(1, `rgba(${col},0)`); g.fillStyle = gr; g.fillRect(0, 0, 2 * r, 2 * r); });
    return {
      halo: radial(200, "255,190,110", 0.24), charco: radial(180, "255,200,120", 0.32), tele: radial(260, "110,60,200", 1, 0.15),
      cono: mk(300, 420, g => { const gr = g.createLinearGradient(0, 0, 0, 420); gr.addColorStop(0, "rgba(255,200,120,0.2)"); gr.addColorStop(1, "rgba(255,200,120,0.03)");
        g.fillStyle = gr; g.beginPath(); g.moveTo(124, 0); g.lineTo(176, 0); g.lineTo(300, 420); g.lineTo(0, 420); g.closePath(); g.fill(); })
    };
  }
  // resplandor de la tele en la pared y el suelo
  function brilloTele(g, t) {
    const k = t < T.arranca ? 0.5 : 0.8 + 0.2 * Math.sin(t * 7);
    const flash = JUEGO.reduce((m, j) => Math.max(m, j[5] ? campana(t, j[1], j[1] + 0.3) : 0), 0);
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = Math.min(1, 0.22 * k + 0.2 * flash);
    g.drawImage(SPR.tele, TV.x + TV.w / 2 - 260, TV.y + TV.h / 2 - 260);
    g.restore();
  }

  /* ---------- la lámpara colgante ---------- */
  function luzLampara(g, t) {
    const th = anguloLampara(t), c = pantallaLampara(th);
    const dx = Math.sin(th), dy = Math.cos(th);            // hacia abajo, siguiendo el cable
    g.save(); g.globalCompositeOperation = "lighter";
    g.drawImage(SPR.halo, c.x - 200, c.y - 200);           // halo en la pared
    // cono de luz hasta el suelo
    const bx = c.x + dx * 26, by = c.y + dy * 26, L = (SUELO + 10 - by) / Math.max(0.3, dy), fx = bx + dx * L;
    g.save(); g.translate(bx, by); g.rotate(-th); g.drawImage(SPR.cono, -150, 0, 300, L); g.restore();
    g.drawImage(SPR.charco, fx - 180, SUELO - 40, 360, 68); // charco en el suelo
    g.restore();
  }
  function dibLampara(g, t) {
    const th = anguloLampara(t), c = pantallaLampara(th);
    g.save(); g.lineCap = "round"; g.lineJoin = "round";
    // cable
    g.strokeStyle = "#0d0c12"; g.lineWidth = 3; g.beginPath(); g.moveTo(LX, LPY); g.lineTo(c.x - Math.sin(th) * 26, c.y - Math.cos(th) * 26); g.stroke();
    g.translate(c.x, c.y); g.rotate(-th);
    // bombilla (asoma por debajo)
    const gb = g.createRadialGradient(0, 22, 2, 0, 22, 20); gb.addColorStop(0, "#fffbe8"); gb.addColorStop(1, "#ffd27a");
    g.fillStyle = gb; g.beginPath(); g.arc(0, 22, 11, 0, Math.PI * 2); g.fill(); g.lineWidth = 2; g.strokeStyle = "#a07a3a"; g.stroke();
    // pantalla metálica (cúpula)
    const forma = () => { g.beginPath(); g.moveTo(-8, -24); g.lineTo(8, -24); g.bezierCurveTo(14, -10, 30, 6, 34, 20); g.lineTo(-34, 20); g.bezierCurveTo(-30, 6, -14, -10, -8, -24); g.closePath(); };
    const gm = g.createLinearGradient(-34, 0, 34, 0); gm.addColorStop(0, "#1f6f78"); gm.addColorStop(0.35, "#3fb6b0"); gm.addColorStop(1, "#164e57");
    forma(); g.fillStyle = gm; g.fill(); g.lineWidth = 2.8; g.strokeStyle = TINTA; g.stroke();
    g.fillStyle = "#ffe9b0"; g.beginPath(); g.ellipse(0, 20, 33, 5, 0, 0, Math.PI); g.fill(); g.lineWidth = 2; g.stroke();
    g.fillStyle = "rgba(255,255,255,0.4)"; g.beginPath(); g.moveTo(-6, -20); g.bezierCurveTo(-12, -6, -22, 6, -24, 14); g.lineTo(-18, 14); g.bezierCurveTo(-14, 4, -8, -8, -3, -20); g.closePath(); g.fill();
    g.fillStyle = "#2b2b33"; g.fillRect(-9, -30, 18, 8); g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(-9, -30, 18, 8);
    g.restore();
  }

  /* ---------- efectos ---------- */
  function estrella(g, x, y, r, n, rot, ri) { g.beginPath(); for (let i = 0; i < n * 2; i++) { const a = rot + i * Math.PI / n, rr = i % 2 ? r * ri : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath(); }
  function impacto(g, t, t0, x, y, R, col) {
    const k = fase(t, t0, t0 + 0.28); if (k <= 0 || k >= 1) return;
    const r = R * salida(k), s = Math.sin(Math.PI * Math.min(1, k * 1.6));
    g.save(); g.globalAlpha = 1 - k * k;
    estrella(g, x, y, r, 9, 0.3, 0.55); g.fillStyle = col; g.fill(); g.lineWidth = 2.5; g.strokeStyle = TINTA; g.stroke();
    g.lineCap = "round"; for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + 0.2, r0 = r * 1.05 + 5, r1 = r0 + 20 * s; g.beginPath(); g.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0); g.lineTo(x + Math.cos(a) * r1, y + Math.sin(a) * r1); g.stroke(); }
    g.restore();
  }
  function estrellitas(g, t, pG) {
    const k = dentro(t, T.bonk + 0.05, T.bonk + 0.25, T.mareo1 - 0.3, T.mareo1); if (k <= 0.01) return;
    const c = G.aPantalla(pG, G.cabeza(pG).a({ x: 740, y: 300 }));
    const pts = [];
    for (let i = 0; i < 5; i++) { const a = t * 4.2 + i * Math.PI * 2 / 5; pts.push({ a, x: c.x + Math.cos(a) * 52, y: c.y - 24 + Math.sin(a) * 12, z: Math.sin(a) }); }
    pts.sort((u, v) => u.z - v.z);
    g.save();
    for (const q of pts) { const r = (8 + 3 * q.z) * k; estrella(g, q.x, q.y, r, 5, t * 3 + q.a, 0.45); g.fillStyle = "#ffe14d"; g.fill(); g.lineWidth = 2; g.strokeStyle = TINTA; g.stroke(); }
    g.restore();
  }
  // estela de un golpe: arco de rayas detrás de la mano
  function estela(g, pts, k) {
    if (k <= 0.01 || pts.length < 2) return;
    g.save(); g.lineCap = "round"; g.strokeStyle = `rgba(255,255,255,${0.8 * k})`;
    for (let j = 0; j < 3; j++) {
      g.lineWidth = 3.2 - j; g.beginPath();
      pts.forEach((q, i) => { const o = (j - 1) * 9; const x = q.x + q.nx * o, y = q.y + q.ny * o; if (i) g.lineTo(x, y); else g.moveTo(x, y); });
      g.stroke();
    }
    g.restore();
  }
  function rastroMano(t, lado, d0, d1, n) {
    const out = [];
    for (let i = 0; i <= n; i++) {
      const tt = t - lerp(d1, d0, i / n), P = poses(tt), p = P.g, m = lado === "c" ? p.manoCerca : p.manoLejos;
      out.push(G.aPantalla(p, m));
    }
    for (let i = 0; i < out.length; i++) { const a = out[Math.max(0, i - 1)], b = out[Math.min(out.length - 1, i + 1)], L = Math.hypot(b.x - a.x, b.y - a.y) || 1; out[i].nx = -(b.y - a.y) / L; out[i].ny = (b.x - a.x) / L; }
    return out;
  }
  function nube(g, x, y, r, a) {
    if (a <= 0.01 || r <= 0.5) return;
    g.save(); g.globalAlpha = a; g.fillStyle = "#e8dccb"; g.strokeStyle = "rgba(90,70,60,0.5)"; g.lineWidth = 1.5;
    g.beginPath(); for (let i = 0; i < 5; i++) { const an = i * Math.PI * 2 / 5; g.moveTo(x + Math.cos(an) * r * 0.5 + r * 0.6, y + Math.sin(an) * r * 0.4); g.arc(x + Math.cos(an) * r * 0.5, y + Math.sin(an) * r * 0.4, r * 0.6, 0, Math.PI * 2); }
    g.fill(); g.stroke(); g.restore();
  }
  function polvoSillon(g, t) {
    const u = fase(t, T.aterriza, T.aterriza + 0.9); if (u <= 0 || u >= 1) return;
    for (let i = 0; i < 8; i++) { const lado = i % 2 ? 1 : -1, d = (30 + 70 * hash(i + 80)) * salida(u);
      nube(g, XD - 20 + lado * (90 + d), ASIENTO + 6 - 30 * u * hash(i + 81), (8 + 10 * hash(i + 82)) * (0.6 + u), 0.75 * (1 - u) * (1 - u)); }
  }
  // líneas de «clic» alrededor de las gafas
  function clicLineas(g, t, pG, P) {
    const k = fase(t, T.clic, T.clic + 0.25); if (k <= 0 || k >= 1) return;
    const M = matRetrato(G, pG).multiply(colocar(P)), c = aplicaP(M, AGARRE.lado);
    g.save(); g.strokeStyle = TINTA; g.lineWidth = 2.2; g.lineCap = "round"; g.globalAlpha = 1 - k;
    for (let i = 0; i < 3; i++) { const a = -1.2 + i * 0.5, r0 = 12 + 10 * k, r1 = r0 + 9; g.beginPath(); g.moveTo(c.x + Math.cos(a) * r0, c.y + Math.sin(a) * r0); g.lineTo(c.x + Math.cos(a) * r1, c.y + Math.sin(a) * r1); g.stroke(); }
    g.restore();
  }
  // «¡uf!»: rayitas de sacudida alrededor de los dos al aterrizar
  function sacudida(g, t) {
    const k = fase(t, T.aterriza, T.aterriza + 0.35); if (k <= 0 || k >= 1) return;
    g.save(); g.strokeStyle = TINTA; g.lineWidth = 2.5; g.lineCap = "round"; g.globalAlpha = 1 - k;
    for (const [x, y, a] of [[XD - 160, ASIENTO - 40, 3.4], [XD - 150, ASIENTO + 10, 2.9], [XD + 120, ASIENTO - 80, -0.2], [XD + 125, ASIENTO - 20, 0.3]]) {
      const r0 = 6 + 14 * k; g.beginPath(); g.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0); g.lineTo(x + Math.cos(a) * (r0 + 14), y + Math.sin(a) * (r0 + 14)); g.stroke(); }
    g.restore();
  }

  /* ---------- antebrazo de Deivi por delante: segunda pasada recortada ---------- */
  function antebrazoDeivi(g, t, pD) {
    const m = pD.manoLejos, mu = m.mu ?? -1.75, T2 = DV.tronco(pD), h = T2(DV.HOMBRO);
    const o = DV.rotP({ x: Math.cos(mu) * DV.MUNECA_R * DV.JK, y: Math.sin(mu) * DV.MUNECA_R * DV.JK }, m.ang || 0);
    const pz = DV.A.datos.piezas.brazo, L = DV.BRAZO_L, sj = pz.codo;
    const c = (pD.ikContinuo ? Recortes.ikContinuo : Recortes.ik)(h, { x: m.x + o.x, y: m.y + o.y }, L, sj, 42, m.dobla ?? -1, 1.08);
    const pts = Recortes.muestras(c, 20).map(q => DV.aPantalla(pD, q));
    const i0 = Math.round(20 * (sj + 30) / L);
    const eje = pts.slice(i0);
    // prolonga hasta la punta de los dedos
    const mano = DV.aPantalla(pD, m), ult = eje[eje.length - 1], dx = mano.x - ult.x, dy = mano.y - ult.y, dl = Math.hypot(dx, dy) || 1;
    eje.push({ x: mano.x + dx / dl * 14, y: mano.y + dy / dl * 14 });
    const R = 13, izq = [], der = [];
    for (let i = 0; i < eje.length; i++) {
      const a = eje[Math.max(0, i - 1)], b = eje[Math.min(eje.length - 1, i + 1)], l = Math.hypot(b.x - a.x, b.y - a.y) || 1, nx = -(b.y - a.y) / l, ny = (b.x - a.x) / l;
      const r = i === eje.length - 1 ? R + 4 : R;
      izq.push({ x: eje[i].x + nx * r, y: eje[i].y + ny * r }); der.push({ x: eje[i].x - nx * r, y: eje[i].y - ny * r });
    }
    g.save(); g.beginPath(); izq.forEach((q, i) => (i ? g.lineTo(q.x, q.y) : g.moveTo(q.x, q.y)));
    const fin = eje[eje.length - 1]; g.arc(fin.x, fin.y, R + 4, Math.atan2(izq[izq.length - 1].y - fin.y, izq[izq.length - 1].x - fin.x), Math.atan2(der[der.length - 1].y - fin.y, der[der.length - 1].x - fin.x), false);
    for (let i = der.length - 1; i >= 0; i--) g.lineTo(der[i].x, der[i].y);
    g.closePath(); g.clip();
    DV.dibujar(g, pD, t);
    g.restore();
  }

  /* ---------- cámara ---------- */
  function camara(t) {
    const k = tramo(t, T.quita0 - 0.2, T.camara + 0.3);
    return { k: 1 + 0.12 * k, x: lerp(512, 618, k), y: lerp(300, 290, k) };
  }

  class RealidadVirtual extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !DV.listo()) return;
      if (!fondo) { fondo = creaFondo(); SPR = sprites(); }
      const cam = camara(t);
      const luz = tramo(t, NEGRO_INICIO, 0.8, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      // temblor del coscorrón y del aterrizaje
      const tb = (t >= T_BONK ? 5 * Math.exp(-(t - T_BONK) * 7) : 0) + (t >= T.aterriza ? 4 * Math.exp(-(t - T.aterriza) * 8) : 0);
      if (tb > 0.05) g.translate(ruido(t * 45) * tb, ruido(t * 45 + 13) * tb * 0.7);
      CAM = g.getTransform();
      g.drawImage(fondo, -60, -50);
      pintaTele(g, t);
      brilloTele(g, t);
      luzLampara(g, t);
      const P = poses(t), pG = P.g, pD = P.d;
      // sombras
      g.save(); g.fillStyle = "rgba(10,5,20,0.4)";
      g.beginPath(); g.ellipse(XD - 10, SUELO + 2, 130, 10, 0, 0, Math.PI * 2); g.fill();
      if (t < T.salto + 0.2) { g.beginPath(); g.ellipse(pG.x, SUELO + 2, 62, 8, 0, 0, Math.PI * 2); g.fill(); }
      g.restore();
      // sillón y Deivi
      sillonDetras(g, t);
      DV.dibujar(g, pD, t);
      polvoSillon(g, t);
      // Guillermo (con el aplastado del giro)
      const sx = giroEsc(t);
      g.save(); if (sx < 0.999) { g.translate(pG.x, 0); g.scale(sx, 1); g.translate(-pG.x, 0); }
      G.dibujar(g, pG, t);
      g.restore();
      if (P.antebrazo) antebrazoDeivi(g, t, pD);
      clicLineas(g, t, pG, P.gafas.P || P_CARA);
      // estelas de los golpes
      const est = (lado, a, b, k) => { if (k > 0.01) estela(g, rastroMano(t, lado, 0.01, 0.07, 5), k); };
      est("l", 0, 0, campana(t, T.jab1 - 0.1, T.jab1 + 0.04) + campana(t, T.jab3 - 0.1, T.jab3 + 0.04));
      est("c", 0, 0, campana(t, T.jab2 - 0.1, T.jab2 + 0.04) + campana(t, T.retro1 - 0.05, T.reves + 0.05));
      est("l", 0, 0, campana(t, T.carga, T.golpe + 0.1));
      dibLampara(g, t);
      // chispazo al darle a la lámpara y coscorrón
      const cl = pantallaLampara(anguloLampara(T.golpe));
      impacto(g, t, T.golpe, cl.x + 22, cl.y - 4, 26, "#fff3b0");
      const cb = pantallaLampara(anguloLampara(T_BONK));
      impacto(g, t, T_BONK, cb.x + 30, cb.y - 2, 30, "#ffffff");
      estrellitas(g, t, pG);
      sacudida(g, t);
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00070", nombre: "Guillermo y Deivi · La realidad virtual", crear: () => new RealidadVirtual() });
  window.__A2D_00070 = { pose: poses, poseG, poseD, T, DUR, T_BONK };
})();
