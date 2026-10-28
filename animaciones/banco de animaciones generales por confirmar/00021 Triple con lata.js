"use strict";
/*
 * 00021 · TRIPLE CON LATA
 *
 * Animación del banco. Empieza y acaba en negro.
 * Se enciende el marcador (GUILLERMO 97 · BAR 99, quedan 3 segundos) y luego la pista. Agita la lata: vacía. Desde
 * detrás de la línea de triple la lanza a una papelera con aro de canasta; suena la bocina con la lata en el aire y
 * vuela a cámara lenta, baila en el aro mientras él reza… y entra. El marcador suma 3 (100–99). ¡TRIPLE!
 */
(() => {
const CACHE = cacheTexto();
function cartel(clave, s, o) {
  let c = CACHE.get(clave);
  if (c) return c;
  const m = lienzoNuevo(1, 1).getContext("2d");
  m.font = `${o.peso || 400} ${o.tam}px ${o.fam}`;
  if ("letterSpacing" in m) m.letterSpacing = (o.esp || 0) + "px";
  const pad = (o.glowTam || 0) + (o.bordeAncho || 0) + 14;
  c = lienzoNuevo(m.measureText(s).width + pad * 2, o.tam * 1.3 + pad * 2);
  const g = c.getContext("2d");
  const col = typeof o.color === "function" ? o.color(g, c) : o.color;
  txt(g, s, c.width / 2, c.height / 2 + o.tam * 0.36, Object.assign({}, o, { color: col }));
  CACHE.set(clave, c);
  return c;
}
function ponCartel(g, c, x, y, s, a = 1, rot = 0) {
  if (a <= 0 || s <= 0) return;
  g.save(); g.globalAlpha *= a; g.translate(x, y); g.rotate(rot); g.scale(s, s);
  g.drawImage(c, -c.width / 2, -c.height / 2); g.restore();
}
const led = (s, tam, col, glow) => cartel(`led${s}|${tam}|${col}`, s, { tam, peso: 900, fam: FD, color: col, glow, glowTam: 14, esp: 3 });

const ARO = [872, 436], ARO_R = 46; // centro del aro
const ESC_LATA = 1.7;

class EscenaTriple extends Escena {
  constructor() {
    super(10.3);
    this.p = new Parts(420);
    this.p.suelo = () => PIES - 2;
    this.ESC = 1.45; this.X = 178;
    this.tSuelta = 2.78; this.tAro = 5.7; this.tDentro = 6.45; this.tBocina = 3.55;
    this.suelta = null; this.historia = [];
  }
  marcadorLuz() {
    const t = this.t;
    const on = t < 0.12 ? 0 : t < 0.5 ? [1, 0, 0.6, 0, 1, 0.3, 1, 1][Math.min(7, Math.floor((t - 0.12) / 0.05))] : 1;
    const off = t < 9.55 ? 1 : t < 9.8 ? [0.2, 1, 0.1, 0, 0][Math.min(4, Math.floor((t - 9.55) / 0.05))] : 0;
    return on * off;
  }
  pista() { return tramo(this.t, 0.55, 0.75) * (1 - tramo(this.t, 9.0, 9.5)); }
  reloj() { return clamp(3 - Math.max(0, this.t - 2.0) * (3 / (this.tBocina - 2.0)) * 0.999, 0, 3); }
  lenta() { return eInOut(tramo(this.t, 3.0, 3.35)) * (1 - eInOut(tramo(this.t, 6.45, 6.8))); }
  estado() {
    const t = this.t, ESC = this.ESC;
    const pose = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0] };
    let manoD = [70, 158], manoI = [9, 160], sx = 1, sy = 1, y = PIES, ang = 0, conLata = t < this.tSuelta;
    // agita la lata junto a la oreja: vacía
    const kOreja = eInOut(tramo(t, 0.9, 1.15)) * (1 - eInOut(tramo(t, 1.85, 2.1)));
    manoD = mezcla([62, 120], [82, 44], kOreja);
    if (t > 1.15 && t < 1.85) { manoD[0] += 3 * Math.sin(t * 50); manoD[1] += 2 * Math.sin(t * 50 + 1); ang = 0.25 * Math.sin(t * 50); }
    pose.rc = 0.14 * kOreja;
    if (t > 1.1 && t < 1.55) pose.cara = "sorpresa";
    else if (t >= 1.55 && t < 2.2) { pose.cara = "guino"; pose.rc = 0.06; }
    // se agacha y lanza en suspensión
    const kAg = eInOut(tramo(t, 2.1, 2.45));
    const kSube = tramo(t, 2.45, 2.8);
    if (t > 2.1) {
      manoD = mezcla(manoD, [64, 92], kAg);
      manoI = mezcla(manoI, [22, 96], kAg);
      pose.brazoIDelante = kAg > 0.2;
      sy = 1 - 0.12 * kAg * (1 - eOut(kSube));
      pose.cara = "guino";
    }
    if (t > 2.45) {
      manoD = mezcla(manoD, [76, 6], eOut(kSube));
      manoI = mezcla(manoI, [-2, 36], eOut(kSube));
      pose.brazoIDelante = kSube < 0.25;
      // el salto, más lento a cámara lenta
      const s = t < 3.1 ? tramo(t, 2.45, 3.1) * 0.5 : 0.5 + 0.5 * tramo(t, 3.1, 6.2);
      y -= 95 * Math.sin(Math.PI * clamp(s, 0, 1));
      if (s > 0.02 && s < 0.98) { pose.piernaI = [-6, 0.06]; pose.piernaD = [-10, -0.04]; }
      ang = -0.2;
      if (t > this.tSuelta) { manoD = [78 + 4 * tramo(t, 2.8, 3.2), 8 - 10 * tramo(t, 2.8, 3.2)]; pose.cara = "sorpresa"; }
      pose.rc = -0.1 * tramo(t, 2.8, 3.6);
    }
    // reza mientras la lata baila en el aro
    if (t > 5.35) {
      const k = eInOut(tramo(t, 5.35, 5.65)) * (1 - eOut(tramo(t, this.tDentro, this.tDentro + 0.2)));
      manoD = mezcla(manoD, [50, 80], k); manoI = mezcla(manoI, [29, 80], k);
      pose.brazoIDelante = true;
      if (k > 0.5) { pose.cara = "dormido"; pose.rc = 0.04 * Math.sin(t * 20); }
    }
    // ¡TRIPLE!: lo celebra
    if (t > this.tDentro) {
      const k = eOut(tramo(t, this.tDentro, this.tDentro + 0.2));
      pose.cara = "risa"; pose.brazoIDelante = false;
      const bote = Math.abs(Math.sin((t - this.tDentro) * 7));
      manoD = mezcla(manoD, [100, 12 + 16 * bote], k); manoI = mezcla(manoI, [-22, 12 + 16 * (1 - bote)], k);
      y -= 26 * bote * k * (1 - tramo(t, 8.0, 8.3));
      if (t > 8.2) {
        const k2 = eInOut(tramo(t, 8.2, 8.5));
        manoD = mezcla(manoD, [118, 96], k2); manoI = mezcla(manoI, [9, 160], k2);
        pose.cara = t > 8.35 ? "guino" : "risa";
        pose.rc = 0.06 * k2;
      }
    }
    pose.manoD = manoD; pose.manoI = manoI;
    if (conLata) pose.objD = (g, m, a) => dibujarLata(g, m[0] + 2, m[1] - 4, ang, { abierta: true });
    const m = matAv(this.X, y, ESC, 0, sx, sy);
    return { pose, m, y };
  }
  lata() {
    // vuelo: rápido al principio, luego a cámara lenta hasta el aro; baila en el aro y cae dentro
    const t = this.t, S = this.suelta;
    if (!S) return null;
    const A = [ARO[0] - ARO_R * 0.55, ARO[1] - 14];
    if (t < this.tAro) {
      const u = t < 3.1 ? 0.2 * tramo(t, this.tSuelta, 3.1) : 0.2 + 0.8 * tramo(t, 3.1, this.tAro);
      const x = lerp(S[0], A[0], u), y = lerp(S[1], A[1], u) - 190 * 4 * u * (1 - u) * (1 - 0.15 * u);
      return { x, y, r: -0.4 + u * 5.2, s: 1, rebote: false };
    }
    // botes en el aro
    const saltos = [[this.tAro, 5.98, A, [ARO[0] + ARO_R * 0.5, ARO[1] - 14], 46], [5.98, 6.2, [ARO[0] + ARO_R * 0.5, ARO[1] - 14], [ARO[0] - 6, ARO[1] - 12], 22], [6.2, this.tDentro, [ARO[0] - 6, ARO[1] - 12], [ARO[0], ARO[1] + 70], 6]];
    for (const [t0, t1, a, b, h] of saltos) {
      if (t > t1) continue;
      const u = (t - t0) / (t1 - t0);
      return { x: lerp(a[0], b[0], u), y: lerp(a[1], b[1], u) - h * 4 * u * (1 - u), r: 4.8 + (t - this.tAro) * 6, s: 1, rebote: true };
    }
    return null;
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    const e = this.estado();
    this.una("suelta", t > this.tSuelta, () => { this.suelta = aPant(e.m, [76, 0]); });
    const L = this.lata();
    if (L && t < this.tAro) { this.historia.push([L.x, L.y, L.r]); if (this.historia.length > 16) this.historia.shift(); }
    else if (this.historia.length) this.historia.shift();
    this.una("bocina", t > this.tBocina, () => temblar(8, 0.3));
    for (const [k, tc] of [["clank1", this.tAro], ["clank2", 5.98], ["clank3", 6.2]]) this.una(k, t > tc, () => {
      temblar(k === "clank1" ? 8 : 4, 0.15);
      const q = this.lata() || { x: ARO[0], y: ARO[1] };
      for (let i = 0; i < 8; i++) { const a = azar(-Math.PI, 0), v = azar(120, 300); p.nueva(P.CHISPA, q.x, q.y + 14, Math.cos(a) * v, Math.sin(a) * v, azar(0.2, 0.4), azar(6, 9)); }
    });
    this.una("dentro", t > this.tDentro, () => {
      temblar(20, 0.55);
      for (let i = 0; i < 150; i++) p.nueva(P.CONFETI, azar(0, W), azar(-220, -10), azar(-60, 60), azar(20, 120), azar(4, 6), azar(8, 14), (Math.random() * 5) | 0);
      for (let i = 0; i < 26; i++) { const a = azar(-Math.PI, 0), v = azar(250, 650); p.nueva(P.CHISPA, ARO[0], ARO[1] + 20, Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.7), azar(8, 14)); }
      p.nueva(P.DESTELLO, ARO[0], ARO[1] + 10, 0, 0, 0.35, 160);
    });
    if (t > 6.8 && t < 8.8 && Math.random() < 25 * dt) p.nueva(P.CONFETI, azar(0, W), -10, azar(-40, 40), azar(40, 100), 5, azar(8, 14), (Math.random() * 5) | 0);
    p.alfa = Math.max(this.pista(), 0);
    p.actualizar(dt);
  }
  marcador(g, a, t) {
    if (a <= 0) return;
    g.save(); g.globalAlpha = a;
    const cx = W / 2, cy = 94;
    g.fillStyle = "#3a3f47"; g.fillRect(cx - 120, 0, 8, cy - 50); g.fillRect(cx + 112, 0, 8, cy - 50);
    rectR(g, cx - 230, cy - 62, 460, 124, 14);
    const gr = g.createLinearGradient(0, cy - 62, 0, cy + 62);
    gr.addColorStop(0, "#1c1f25"); gr.addColorStop(1, "#0b0c0f");
    g.fillStyle = gr; g.fill(); g.strokeStyle = "#555d68"; g.lineWidth = 4; g.stroke();
    for (const x of [cx - 160, cx + 160]) { g.fillStyle = "#050607"; rectR(g, x - 58, cy - 30, 116, 74, 8); g.fill(); }
    g.fillStyle = "#050607"; rectR(g, cx - 82, cy - 46, 164, 62, 8); g.fill();
    txt(g, "GUILLERMO", cx - 160, cy - 38, { tam: 17, peso: 800, color: "#fffdf5", esp: 2 });
    txt(g, "BAR", cx + 160, cy - 38, { tam: 17, peso: 800, color: "#fffdf5", esp: 2 });
    const suma = t > this.tDentro + 0.25;
    const parpadeo = suma && t < this.tDentro + 1.4 ? (Math.sin(t * 30) > -0.3 ? 1 : 0.25) : 1;
    g.save(); g.globalAlpha *= parpadeo;
    const cl = led(suma ? "100" : "97", 52, "#ffcf3a", "rgba(255,170,30,.9)");
    ponCartel(g, cl, cx - 160, cy + 9, suma ? 0.86 : 1);
    g.restore();
    ponCartel(g, led("99", 52, "#ffcf3a", "rgba(255,170,30,.9)"), cx + 160, cy + 9, 1);
    const r = this.reloj();
    const fin = r <= 0;
    const rs = fin ? "0.0" : r.toFixed(1);
    const parp = fin && t < this.tBocina + 1.2 ? (Math.sin(t * 26) > 0 ? 1 : 0.3) : 1;
    g.save(); g.globalAlpha *= parp;
    ponCartel(g, led(rs, 46, "#ff4a3a", "rgba(255,40,30,.9)"), cx, cy - 15, 1);
    g.restore();
    txt(g, "4.º CUARTO", cx, cy + 38, { tam: 14, peso: 800, color: "rgba(255,253,245,.6)", esp: 3 });
    g.restore();
  }
  suelo(g, a) {
    if (a <= 0) return;
    g.save(); g.globalAlpha = a;
    const gr = g.createLinearGradient(0, 455, 0, H);
    gr.addColorStop(0, "#3a210c"); gr.addColorStop(0.35, "#8a5226"); gr.addColorStop(1, "#c07a3c");
    g.fillStyle = gr; g.fillRect(-60, 455, W + 120, H);
    g.strokeStyle = "rgba(60,30,8,.35)"; g.lineWidth = 1.5;
    for (let i = 0; i < 7; i++) { const y = 462 + i * i * 3.2 + i * 6; g.beginPath(); g.moveTo(-60, y); g.lineTo(W + 60, y); g.stroke(); }
    for (let i = -6; i < 20; i++) { const x = i * 80; g.beginPath(); g.moveTo(x + (i % 2) * 30, 470); g.lineTo(x * 1.25 - 120 + (i % 2) * 30, H + 40); g.stroke(); }
    // brillo del suelo (focos)
    g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.25 * a;
    g.drawImage(BLOB.amarillo, 40, 500, 420, 120); g.drawImage(BLOB.amarillo, 660, 500, 420, 120);
    g.globalCompositeOperation = "source-over"; g.globalAlpha = a;
    // la línea de triple (arco alrededor de la papelera)
    g.strokeStyle = "rgba(255,253,245,.85)"; g.lineWidth = 5;
    g.beginPath(); g.ellipse(ARO[0], 548, 610, 52, 0, Math.PI * 0.5, Math.PI * 1.5); g.stroke();
    // oscuridad del fondo
    const gn = g.createLinearGradient(0, 440, 0, 500);
    gn.addColorStop(0, "rgba(0,0,0,1)"); gn.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = gn; g.fillRect(-60, 440, W + 120, 60);
    g.restore();
  }
  papelera(g, parte, t) {
    const x0 = 820, x1 = 924, top = 452, cx = (x0 + x1) / 2;
    if (parte === "fondo") {
      // tablero sujeto a la papelera
      g.fillStyle = "#5c636c"; g.fillRect(cx - 5, 330, 10, top - 330);
      g.save(); g.translate(cx, 316);
      rectR(g, -66, -50, 132, 92, 6); g.fillStyle = "#f4f6f8"; g.fill();
      g.strokeStyle = "#c9ced4"; g.lineWidth = 3; g.stroke();
      g.strokeStyle = "#ff6a1a"; g.lineWidth = 4; g.strokeRect(-24, -6, 48, 36);
      g.strokeStyle = "#ff6a1a"; g.lineWidth = 3; rectR(g, -62, -46, 124, 84, 4); g.stroke();
      g.restore();
      g.fillStyle = "#7a838d"; g.fillRect(cx - 18, 352, 36, 8);
      // cuerpo de la papelera (detrás del aro)
      const gr = g.createLinearGradient(x0, 0, x1, 0);
      gr.addColorStop(0, "#2a2f35"); gr.addColorStop(0.4, "#8c96a0"); gr.addColorStop(0.6, "#b4bdc6"); gr.addColorStop(1, "#30363d");
      g.fillStyle = gr; g.beginPath(); g.moveTo(x0, top); g.lineTo(x1, top); g.lineTo(x1 - 8, PIES); g.lineTo(x0 + 8, PIES); g.closePath(); g.fill();
      g.strokeStyle = "rgba(0,0,0,.35)"; g.lineWidth = 2;
      for (let i = 1; i < 9; i++) { const x = lerp(x0, x1, i / 9); g.beginPath(); g.moveTo(x, top + 8); g.lineTo(lerp(x0 + 8, x1 - 8, i / 9), PIES - 6); g.stroke(); }
      g.fillStyle = "#14171b"; g.beginPath(); g.ellipse(cx, top, (x1 - x0) / 2, 9, 0, 0, 6.283); g.fill();
      g.strokeStyle = "#c8d0d8"; g.lineWidth = 3; g.stroke();
      // mitad de atrás del aro
      g.strokeStyle = "#c2410c"; g.lineWidth = 5;
      g.beginPath(); g.ellipse(ARO[0], ARO[1], ARO_R, 10, 0, Math.PI, 2 * Math.PI); g.stroke();
      return;
    }
    // red y mitad de delante del aro
    const kD = t > this.tDentro - 0.1 ? Math.exp(-(t - this.tDentro + 0.1) * 4) : 0;
    const ond = (i) => kD * 6 * Math.sin(t * 30 + i);
    g.strokeStyle = "rgba(255,255,255,.85)"; g.lineWidth = 1.6; g.beginPath();
    const n = 8;
    for (let i = 0; i <= n; i++) {
      const a = Math.PI * (i / n);
      const xa = ARO[0] - Math.cos(a) * ARO_R, ya = ARO[1] + Math.sin(a) * 9;
      const xb = ARO[0] - Math.cos(a) * ARO_R * 0.55 + ond(i), yb = ARO[1] + 46 + Math.sin(a) * 5 + kD * 10;
      const xc = ARO[0] - Math.cos(a + 0.35) * ARO_R * 0.55 + ond(i + 1);
      g.moveTo(xa, ya); g.lineTo(xb, yb); g.moveTo(xa, ya); g.lineTo(xc, yb);
    }
    g.moveTo(ARO[0] - ARO_R * 0.78, ARO[1] + 22); g.lineTo(ARO[0] + ARO_R * 0.78, ARO[1] + 22);
    g.stroke();
    g.strokeStyle = "#ff6a1a"; g.lineWidth = 6;
    g.beginPath(); g.ellipse(ARO[0], ARO[1], ARO_R, 10, 0, 0, Math.PI); g.stroke();
    g.strokeStyle = "rgba(255,220,180,.7)"; g.lineWidth = 2;
    g.beginPath(); g.ellipse(ARO[0], ARO[1] - 1, ARO_R - 2, 8, 0, 0.3, Math.PI - 0.3); g.stroke();
  }
  dibujar(g) {
    const t = this.t, e = this.estado(), aP = this.pista(), lenta = this.lenta();
    fondo(g, "#000");
    this.suelo(g, aP);
    this.marcador(g, this.marcadorLuz(), t);
    g.save(); g.globalAlpha = aP;
    // focos que iluminan la pista
    foco(g, 200, 200, PIES, 170, 0.9); foco(g, 860, 860, PIES, 150, 0.6);
    this.papelera(g, "fondo", t);
    g.fillStyle = "rgba(0,0,0,.45)"; g.beginPath(); g.ellipse(this.X, PIES - 1, 66, 9, 0, 0, 6.283); g.fill();
    pintarAvatar(g, e.m, e.pose, t);
    // la lata: estela a cámara lenta, y cae dentro de la papelera (detrás de la red)
    const L = this.lata();
    if (L) {
      for (let i = 0; i < this.historia.length; i += 2) {
        const [hx, hy, hr] = this.historia[i];
        g.save(); g.globalAlpha = aP * 0.25 * (i / this.historia.length) * lenta; lataSuelta(g, hx, hy, hr, ESC_LATA); g.restore();
      }
      if (L.rebote && t > 6.25) {
        g.save(); g.beginPath(); g.rect(0, 0, W, ARO[1] + 50); g.clip(); lataSuelta(g, L.x, L.y, L.r, ESC_LATA); g.restore();
      } else lataSuelta(g, L.x, L.y, L.r, ESC_LATA);
    }
    this.papelera(g, "delante", t);
    g.restore();
    this.p.dibujar(g);
    // cámara lenta: bandas negras y rótulo
    if (lenta > 0) {
      const b = 30 * lenta;
      g.fillStyle = "#000"; g.fillRect(-60, -60, W + 120, b + 60); g.fillRect(-60, H - b, W + 120, b + 60);
      if (t > 3.3 && t < 6.4) txt(g, "● CÁMARA LENTA", 26, H - 14, { tam: 18, peso: 800, color: "#ff4a3a", alin: "left", esp: 3, alfa: (Math.sin(t * 6) > -0.5 ? 1 : 0.35) * lenta });
    }
    // +3 vuela de la papelera al marcador
    if (t > this.tDentro && t < this.tDentro + 1.2) {
      const k = tramo(t, this.tDentro, this.tDentro + 1.2);
      const c = cartel("mas3", "+3", { tam: 64, fam: FC, color: "#2bff5b", borde: "#04310f", bordeAncho: 8 });
      ponCartel(g, c, lerp(ARO[0] - 40, W / 2 - 160, eInOut(k)), lerp(ARO[1] - 60, 124, eInOut(k)) - 60 * Math.sin(Math.PI * k), lerp(0.6, 1.2, Math.sin(Math.PI * k)), 1 - tramo(k, 0.85, 1));
    }
    // ¡BZZZ! de la bocina
    if (t > this.tBocina && t < this.tBocina + 1.1) {
      const k = tramo(t, this.tBocina, this.tBocina + 0.12), a = 1 - tramo(t, this.tBocina + 0.8, this.tBocina + 1.1);
      const c = cartel("bzz", "¡BZZZ!", { tam: 54, fam: FC, color: "#ff4a3a", borde: "#2a0400", bordeAncho: 8, esp: 2 });
      ponCartel(g, c, W / 2 + 310 + azar(-3, 3), 84 + azar(-3, 3), eBack(k), a, 0.12);
    }
    // ¡TRIPLE!
    if (t > this.tDentro + 0.05) {
      const k = tramo(t, this.tDentro + 0.05, this.tDentro + 0.25);
      const c = cartel("triple", "¡TRIPLE!", {
        tam: 150, peso: 900, fam: FD, borde: "#3a1d00", bordeAncho: 12, esp: 4, glow: "rgba(255,150,30,.8)", glowTam: 26,
        color: (gg, cv) => { const gr = gg.createLinearGradient(0, cv.height * 0.2, 0, cv.height * 0.8); gr.addColorStop(0, "#fff9c8"); gr.addColorStop(0.55, "#ffb21a"); gr.addColorStop(1, "#ff6a00"); return gr; },
      });
      const a = Math.min(1, k * 3) * (1 - tramo(t, 9.0, 9.5));
      ponCartel(g, c, W / 2 + 40, 290, lerp(2.8, 1, eIn(k)) * (1 + 0.03 * Math.sin(t * 10)), a, -0.04);
    }
  }
}

registrar({ id: "00021", nombre: "Triple con lata", crear: () => new EscenaTriple() });
})();
