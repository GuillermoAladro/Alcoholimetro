"use strict";
/*
 * 00000 · SOPLIDO HURACÁN
 *
 * Animación del banco. Empieza y acaba en negro.
 * Baja del techo una boquilla gigante del alcoholímetro. Se la pone en la boca, coge aire (se hincha) y sopla: un
 * vendaval cruza la pantalla y se lleva servilletas, posavasos, una maceta, el cartel del WC y hasta el ¡FUUUUUH!.
 * La boquilla le devuelve el soplido: se queda con el pelo de punta y cara de susto, y le cae una servilleta encima.
 */
(() => {
const X0 = 300, ESC = 1.55;
const VIENTO0 = 3.0, VIENTO1 = 5.35; // sopla entre estos dos instantes
const LT = 300, RT = 36; // largo y radio de la boquilla gigante

class EscenaSoplido extends Escena {
  constructor() {
    super(9.4);
    this.p = new Parts(420);
    this.estelas = []; this.hojas = [];
    this.x = X0;
    const r = semilla(5);
    // objetos que se lleva el viento (x, y en pantalla)
    this.cosas = [];
    for (let i = 0; i < 9; i++) this.cosas.push({ tipo: "servilleta", x: 668 + (i % 3) * 9, y: 418 - (i % 4) * 3, r: -0.3 + r() * 0.6, ret: 0.02 + i * 0.045, vida: 0 });
    for (let i = 0; i < 5; i++) this.cosas.push({ tipo: "posavasos", x: 742, y: 445 - i * 4, r: 0, ret: 0.1 + i * 0.07, vida: 0, c: i % 2 });
    this.cosas.push({ tipo: "maceta", x: 915, y: PIES, r: 0, ret: 0.3, vida: 0 });
    this.cosas.push({ tipo: "wc", x: 850, y: 170, r: 0, ret: 0.18, vida: 0 });
    for (const c of this.cosas) { c.vx = 0; c.vy = 0; c.vr = 0; c.suelta = false; }
    this.servilletaFinal = { x: 0, y: -60 };
  }
  /** Boquilla: punto donde está su extremo de la boca (pantalla) y si está puesta. */
  boquilla(e) {
    const t = this.t, b = aPant(e.m, boca(e.pose.rc));
    const fin = [b[0] - 6, b[1] + 2];
    if (t < 1.55) {
      const k = eBack(tramo(t, 0.35, 1.35));
      return { x: fin[0] + 40 * (1 - tramo(t, 1.2, 1.55)), y: lerp(-170, fin[1] - 26, k) + 26 * tramo(t, 1.25, 1.55), puesta: false, tiembla: 0 };
    }
    if (t < 5.45) {
      const sopla = t > VIENTO0 && t < VIENTO1 ? 1 : 0;
      return { x: fin[0], y: fin[1], puesta: true, tiembla: sopla };
    }
    // la boquilla escupe el aire de vuelta y se la lleva su tubo hacia arriba
    const k = tramo(t, 5.5, 6.25);
    return { x: fin[0] + 30 * eOut(tramo(t, 5.45, 5.6)) + 60 * k, y: fin[1] - 900 * eIn(k), puesta: false, tiembla: 0 };
  }
  /** Al final la cámara se acerca a su cara. */
  camara(e) {
    const k = eInOut(tramo(this.t, 6.0, 8.0)), c = aPant(e.m, [39, 70]);
    return { Z: lerp(1, 1.38, k), cx: lerp(W / 2, c[0], k), cy: lerp(H / 2, c[1], k) };
  }
  estado() {
    const t = this.t;
    const pose = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0] };
    let manoD = [70, 158], manoI = [9, 160], sx = 1, sy = 1;
    // mira cómo baja la boquilla
    if (t > 0.45 && t < 1.25) { pose.cara = "sorpresa"; pose.rc = -0.08 * eInOut(tramo(t, 0.45, 0.8)); }
    if (t >= 1.25 && t < 1.9) pose.cara = "guino";
    // la coge con la mano derecha (por debajo del tubo)
    const kCoge = eInOut(tramo(t, 1.25, 1.6)) * (1 - eInOut(tramo(t, 5.45, 5.75)));
    manoD = mezcla(manoD, [80, 70], kCoge);
    // coge aire: se hincha
    const kAire = eInOut(tramo(t, 1.95, VIENTO0));
    const kDesinfla = eOut(tramo(t, VIENTO0, VIENTO0 + 0.5));
    let hinchado = kAire * (1 - kDesinfla);
    if (t > 1.95 && t < VIENTO0) { pose.cara = "sorpresa"; pose.rc = -0.05 * kAire; }
    sx = 1 + 0.22 * hinchado - 0.07 * kDesinfla * (1 - tramo(t, VIENTO1, VIENTO1 + 0.3));
    sy = 1 + 0.05 * hinchado;
    // sopla con todas sus fuerzas
    if (t >= VIENTO0 && t < 5.45) {
      pose.cara = "dormido";
      pose.rc = 0.025 * Math.sin(t * 47);
      manoI = [-4, 140]; // mano en la cadera
      pose.piernaI = [0, 0.06]; pose.piernaD = [0, -0.06];
    }
    // ¡pfff! le vuelve el aire a la cara: pelo de punta y cara de susto
    if (t >= 5.45) {
      pose.cara = t > 7.62 && t < 7.8 ? "dormido" : "sorpresa";
      pose.puntas = eBack(tramo(t, 5.45, 5.68));
      manoI = mezcla([-4, 140], [9, 160], eInOut(tramo(t, 5.45, 5.8)));
      const sacude = 1 - tramo(t, 5.45, 6.1);
      pose.rc = 0.06 * Math.sin(t * 40) * sacude;
      sy *= 1 + 0.06 * Math.sin((t - 5.45) * 30) * sacude;
    }
    pose.manoD = manoD; pose.manoI = manoI;
    const m = matAv(this.x, PIES, ESC, 0, sx, sy);
    return { pose, m };
  }
  frenteViento() { return this.t < VIENTO0 ? -1 : 560 + 2400 * (this.t - VIENTO0); }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    // retroceso al soplar
    if (t > VIENTO0 && t < VIENTO1) this.x = Math.max(X0 - 26, this.x - 22 * dt);
    const e = this.estado(), B = this.boquilla(e);
    const xFin = B.x + LT, yB = B.y; // la boca de salida de la boquilla
    // coge aire: el aire entra por la boquilla
    if (t > 1.95 && t < VIENTO0 && Math.random() < 30 * dt) {
      const y = yB + azar(-110, 110);
      this.estelas.push({ x: azar(820, 1000), y, y0: y, vx: -azar(700, 1000), largo: azar(40, 110), a: azar(0.15, 0.35), ancho: azar(1.5, 2.5), entra: true, ex: xFin });
    }
    this.una("sopla", t > VIENTO0, () => {
      temblar(22, 0.7);
      for (let i = 0; i < 30; i++) p.nueva(P.VAPOR, xFin + azar(0, 30), yB + azar(-20, 20), azar(500, 1200), azar(-160, 160), azar(0.4, 0.8), azar(30, 60));
    });
    if (t > VIENTO0 && t < VIENTO1) {
      if (Math.random() < 0.5) temblar(5, 0.15);
      const n = Math.round(150 * dt) + 1;
      for (let i = 0; i < n; i++) {
        const y = yB + azar(-30, 30);
        this.estelas.push({ x: xFin + azar(-10, 40), y, y0: y, vx: azar(1700, 2700), abre: azar(-0.5, 0.5), largo: azar(70, 230), a: azar(0.25, 0.6), ancho: azar(1.5, 4) });
      }
      if (Math.random() < 25 * dt) p.nueva(P.VAPOR, xFin + 10, yB + azar(-15, 15), azar(900, 1500), azar(-200, 200), azar(0.3, 0.6), azar(26, 50));
      if (Math.random() < 14 * dt) p.nueva(P.POLVO, azar(500, 1000), PIES - azar(0, 10), azar(700, 1300), azar(-60, 0), azar(0.4, 0.8), azar(30, 60));
      if (Math.random() < 10 * dt) p.nueva(P.POLVO, this.x + azar(-30, 30), PIES - 4, azar(-200, -60), azar(-40, 0), azar(0.4, 0.7), azar(20, 34));
    }
    for (const s of this.estelas) {
      s.x += s.vx * dt;
      if (s.entra) { s.y = lerp(s.y0, yB, clamp(1 - (s.x - s.ex) / 300, 0, 1)); }
      else s.y += s.abre * s.vx * dt * 0.35;
    }
    this.estelas = this.estelas.filter((s) => (s.entra ? s.x > s.ex : s.x - s.largo < W + 40)).slice(-260);
    // el viento se lo lleva todo
    const F = this.frenteViento();
    for (const c of this.cosas) {
      if (!c.suelta && F > 0 && t < VIENTO1 && F > c.x) {
        if (c.tHit == null) c.tHit = t;
        if (t - c.tHit >= c.ret) {
          c.suelta = true;
          if (c.tipo === "servilleta") { c.vx = azar(400, 700); c.vy = azar(-500, -150); c.vr = azar(-14, 14); }
          else if (c.tipo === "posavasos") { c.vx = azar(500, 800); c.vy = azar(-380, -120); c.vr = azar(8, 16); }
          else if (c.tipo === "maceta") { c.vx = 260; c.vy = -380; c.vr = 5; temblar(10, 0.25); for (let i = 0; i < 8; i++) this.hojas.push({ x: c.x + azar(-25, 25), y: c.y - azar(70, 130), vx: azar(500, 900), vy: azar(-300, 0), r: azar(0, 6), vr: azar(-12, 12) }); }
          else { c.vx = 380; c.vy = -260; c.vr = 7; }
        }
      }
      if (c.suelta) {
        const ligero = c.tipo === "servilleta" ? 1 : c.tipo === "posavasos" ? 0.8 : 0.55;
        c.vx += 2200 * ligero * dt; c.vy += (c.tipo === "servilleta" ? 60 : 300) * dt;
        c.vy += Math.sin(t * 9 + c.ret * 30) * 900 * ligero * dt;
        c.x += c.vx * dt; c.y += c.vy * dt; c.r += c.vr * dt;
      }
    }
    for (const h of this.hojas) { h.vx += 1800 * dt; h.vy += Math.sin(t * 8 + h.r) * 500 * dt; h.x += h.vx * dt; h.y += h.vy * dt; h.r += h.vr * dt; }
    // la boquilla le devuelve el aire
    this.una("pfff", t > 5.45, () => {
      temblar(14, 0.4);
      const q = aPant(e.m, [39, 40]);
      for (let i = 0; i < 26; i++) { const a = azar(0, 6.283), v = azar(120, 420); p.nueva(P.VAPOR, q[0] + 30, q[1] + 10, Math.cos(a) * v - 120, Math.sin(a) * v, azar(0.4, 0.8), azar(30, 56)); }
    });
    p.actualizar(dt);
  }
  // ----------------------------------------------------------------- dibujo de las cosas
  dibujarVelador(g) {
    const x = 705;
    g.fillStyle = "#3b3f46"; g.fillRect(x - 6, 456, 12, PIES - 462);
    g.fillStyle = "#2a2d33"; g.beginPath(); g.ellipse(x, PIES - 3, 48, 8, 0, 0, 6.283); g.fill();
    const gr = g.createLinearGradient(0, 440, 0, 466);
    gr.addColorStop(0, "#8a5a34"); gr.addColorStop(1, "#3c2412");
    g.fillStyle = "#2c1a0d"; g.beginPath(); g.ellipse(x, 458, 92, 15, 0, 0, 6.283); g.fill();
    g.fillStyle = gr; g.beginPath(); g.ellipse(x, 452, 92, 15, 0, 0, 6.283); g.fill();
    g.strokeStyle = "rgba(255,220,170,.25)"; g.lineWidth = 2; g.beginPath(); g.ellipse(x, 451, 84, 11, 0, Math.PI * 1.1, Math.PI * 1.9); g.stroke();
  }
  dibujarServilletero(g) {
    const gs = g.createLinearGradient(652, 0, 708, 0);
    gs.addColorStop(0, "#7d858e"); gs.addColorStop(0.4, "#e6ebef"); gs.addColorStop(1, "#6b737c");
    g.fillStyle = gs; rectR(g, 652, 410, 56, 38, 5); g.fill();
    g.fillStyle = "rgba(0,0,0,.35)"; g.fillRect(658, 424, 44, 3);
  }
  dibujarServilleta(g, x, y, r, s = 1) {
    g.save(); g.translate(x, y); g.rotate(r); g.scale(s * Math.max(0.2, Math.abs(Math.cos(r * 1.7))), s);
    g.fillStyle = "#fbfaf4"; g.strokeStyle = "#cfcabb"; g.lineWidth = 1.5;
    g.beginPath(); g.moveTo(-17, -17); g.lineTo(17, -15); g.lineTo(16, 17); g.lineTo(-16, 16); g.closePath(); g.fill(); g.stroke();
    g.strokeStyle = "rgba(160,150,130,.5)"; g.beginPath(); g.moveTo(-16, 0); g.lineTo(16, 1); g.stroke();
    g.restore();
  }
  dibujarPosavasos(g, x, y, r, c, plano) {
    g.save(); g.translate(x, y); g.rotate(r);
    const ry = plano ? 5 : 22 * Math.max(0.12, Math.abs(Math.sin(r * 1.3)));
    g.fillStyle = c ? "#d8263a" : "#f2e6c8"; g.beginPath(); g.ellipse(0, 0, 22, ry, 0, 0, 6.283); g.fill();
    g.strokeStyle = c ? "#f7e9d0" : "#c22035"; g.lineWidth = 2.5; g.beginPath(); g.ellipse(0, 0, 15, ry * 0.68, 0, 0, 6.283); g.stroke();
    g.restore();
  }
  dibujarMaceta(g, x, y, r, conHojas) {
    g.save(); g.translate(x, y - 34); g.rotate(r);
    if (conHojas) {
      g.fillStyle = "#2f8a3a";
      for (let i = 0; i < 7; i++) {
        const a = -Math.PI / 2 + (i - 3) * 0.33 + 0.04 * Math.sin(this.t * 5 + i);
        g.save(); g.rotate(a + Math.PI / 2); g.fillStyle = i % 2 ? "#2f8a3a" : "#3fae4a";
        g.beginPath(); g.ellipse(0, -62 - (i % 3) * 8, 11, 36 + (i % 3) * 6, 0, 0, 6.283); g.fill();
        g.restore();
      }
    }
    const gr = g.createLinearGradient(-36, 0, 36, 0);
    gr.addColorStop(0, "#8a3d1a"); gr.addColorStop(0.45, "#e07b45"); gr.addColorStop(1, "#7a3414");
    g.fillStyle = gr; g.beginPath(); g.moveTo(-34, -26); g.lineTo(34, -26); g.lineTo(26, 34); g.lineTo(-26, 34); g.closePath(); g.fill();
    g.fillStyle = "#c9663a"; rectR(g, -39, -34, 78, 13, 3); g.fill();
    g.restore();
  }
  dibujarWC(g, x, y, r) {
    g.save(); g.translate(x, y); g.rotate(r);
    g.shadowColor = "rgba(0,0,0,.5)"; g.shadowBlur = 8;
    rectR(g, -64, -40, 128, 80, 10); g.fillStyle = "#f5f7fa"; g.fill();
    g.shadowBlur = 0; g.shadowColor = "transparent";
    rectR(g, -58, -34, 116, 68, 7); g.fillStyle = "#1b6fd1"; g.fill();
    txt(g, "WC", -10, 20, { tam: 56, peso: 900, fam: FD, color: "#fff", esp: 2 });
    g.fillStyle = "#fff"; g.beginPath(); g.moveTo(30, -10); g.lineTo(48, 4); g.lineTo(30, 18); g.closePath(); g.fill();
    g.fillStyle = "#9aa3ad"; for (const sx of [-50, 50]) { g.beginPath(); g.arc(sx, -28, 3, 0, 6.283); g.fill(); }
    g.restore();
  }
  dibujarBoquilla(g, B) {
    const x0 = B.x, y = B.y + (B.tiembla ? azar(-2, 2) : 0), L = LT, R = RT;
    // tubo de goma que la sujeta desde el techo
    const xh = x0 + 190;
    g.strokeStyle = "#16181c"; g.lineWidth = 18; g.lineCap = "round";
    g.beginPath(); g.moveTo(xh, y - R + 4); g.bezierCurveTo(xh + 10, y - 120, xh - 40, y - 220, xh - 10, -60); g.stroke();
    g.strokeStyle = "#2c3038"; g.lineWidth = 3;
    for (let k = 0.04; k < 1; k += 0.05) {
      const u = k, a = 1 - u;
      const px = a * a * a * xh + 3 * a * a * u * (xh + 10) + 3 * a * u * u * (xh - 40) + u * u * u * (xh - 10);
      const py = a * a * a * (y - R + 4) + 3 * a * a * u * (y - 120) + 3 * a * u * u * (y - 220) + u * u * u * -60;
      g.beginPath(); g.moveTo(px - 9, py); g.lineTo(px + 9, py); g.stroke();
    }
    g.lineCap = "butt";
    // pieza de la boca (más estrecha)
    const gm = g.createLinearGradient(0, y - 16, 0, y + 16);
    gm.addColorStop(0, "#ffffff"); gm.addColorStop(0.5, "#d9e0e6"); gm.addColorStop(1, "#8e99a4");
    g.fillStyle = gm; rectR(g, x0, y - 17, 48, 34, 9); g.fill();
    // cuerpo del tubo
    const gr = g.createLinearGradient(0, y - R, 0, y + R);
    gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.25, "#f1f4f7"); gr.addColorStop(0.7, "#c3ccd5"); gr.addColorStop(1, "#7f8a96");
    g.fillStyle = gr; g.fillRect(x0 + 40, y - R, L - 40, 2 * R);
    g.fillStyle = "#e9eef2"; g.beginPath(); g.ellipse(x0 + 40, y, 11, R, 0, Math.PI / 2, Math.PI * 1.5); g.fill();
    // anillo verde de la máquina
    const gv = g.createLinearGradient(0, y - R, 0, y + R);
    gv.addColorStop(0, "#b6ffc8"); gv.addColorStop(0.4, "#2bff5b"); gv.addColorStop(1, "#0b7a2a");
    g.fillStyle = gv; g.fillRect(x0 + 110, y - R - 1, 26, 2 * R + 2);
    g.fillStyle = "rgba(255,255,255,.7)"; g.fillRect(x0 + 50, y - R + 7, L - 64, 5);
    // boca de salida
    g.fillStyle = "#cfd6dd"; g.beginPath(); g.ellipse(x0 + L, y, 13, R, 0, 0, 6.283); g.fill();
    g.fillStyle = "#1a1d22"; g.beginPath(); g.ellipse(x0 + L + 1, y, 8, R - 6, 0, 0, 6.283); g.fill();
  }
  dibujarFuuh(g, t, B) {
    if (t < VIENTO0 + 0.08) return;
    const S = "¡FUUUUUH!", tam = 118;
    g.font = `400 ${tam}px ${FC}`;
    if ("letterSpacing" in g) g.letterSpacing = "0px";
    const anchos = [...S].map((c) => g.measureText(c).width + 4), total = anchos.reduce((a, b) => a + b, 0);
    const k = eBack(tramo(t, VIENTO0 + 0.08, VIENTO0 + 0.45));
    const cx = lerp(B.x + LT, 720, eOut(tramo(t, VIENTO0 + 0.08, VIENTO0 + 0.5))), cy = 168;
    let x = cx - (total / 2) * k;
    for (let i = 0; i < S.length; i++) {
      const w = anchos[i] * k;
      // se las lleva el viento, de la última a la primera
      const t0 = 4.55 + (S.length - 1 - i) * 0.07, s = Math.max(0, t - t0);
      const dx = 1500 * s * s + 300 * s, dy = -60 * s + 30 * Math.sin(s * 9 + i);
      const vib = t < VIENTO1 ? azar(-2, 2) : 0;
      g.save(); g.translate(x + w / 2 + dx + vib, cy + dy + vib + Math.sin(t * 12 + i) * 4); g.rotate(s * (3 + i * 0.6) - 0.06); g.scale(k, k);
      txt(g, S[i], 0, 0, { tam, peso: 400, fam: FC, color: "#ffffff", borde: "#0e5c8f", bordeAncho: 10 });
      g.restore();
      x += w;
    }
  }
  dibujar(g) {
    const t = this.t, e = this.estado(), B = this.boquilla(e), cam = this.camara(e);
    fondo(g, "#000");
    g.save();
    g.translate(W / 2, H / 2); g.scale(cam.Z, cam.Z); g.translate(-cam.cx, -cam.cy);
    // suelo y pared muy oscuros
    const gs = g.createLinearGradient(0, PIES - 6, 0, H);
    gs.addColorStop(0, "#1c1c20"); gs.addColorStop(1, "#060607");
    g.fillStyle = gs; g.fillRect(-60, PIES - 2, W + 120, H - PIES + 62);
    // las cosas del bar
    this.dibujarVelador(g);
    for (const c of this.cosas) if (c.tipo === "servilleta" && !c.suelta) this.dibujarServilleta(g, c.x, c.y, c.r + (c.tHit != null ? Math.sin(t * 50) * 0.16 : 0));
    this.dibujarServilletero(g);
    for (const c of this.cosas) {
      if (c.x > W + 220 || (c.tipo === "servilleta" && !c.suelta)) continue;
      const tiem = !c.suelta && c.tHit != null ? Math.sin(t * 50) * 0.08 : 0;
      if (c.tipo === "servilleta") this.dibujarServilleta(g, c.x, c.y, c.r + tiem * 2);
      else if (c.tipo === "posavasos") this.dibujarPosavasos(g, c.x, c.y, c.r, c.c, !c.suelta);
      else if (c.tipo === "maceta") this.dibujarMaceta(g, c.x + (c.suelta ? 0 : tiem * 20), c.y, c.r + tiem, true);
      else this.dibujarWC(g, c.x, c.y, c.r + tiem * 3);
    }
    for (const h of this.hojas) { g.save(); g.translate(h.x, h.y); g.rotate(h.r); g.fillStyle = "#3fae4a"; g.beginPath(); g.ellipse(0, 0, 8, 22, 0, 0, 6.283); g.fill(); g.restore(); }
    // cono del vendaval
    if (t > VIENTO0 && t < VIENTO1 + 0.3) {
      const a = Math.min(1, (t - VIENTO0) * 5) * (1 - tramo(t, VIENTO1, VIENTO1 + 0.3));
      const xF = B.x + LT, F = Math.min(W + 60, this.frenteViento());
      g.save(); g.globalAlpha = 0.14 * a;
      const gr = g.createLinearGradient(xF, 0, W, 0);
      gr.addColorStop(0, "rgba(220,240,255,1)"); gr.addColorStop(1, "rgba(220,240,255,0.15)");
      g.fillStyle = gr;
      g.beginPath(); g.moveTo(xF, B.y - 28); g.lineTo(F, B.y - 28 - (F - xF) * 0.42); g.lineTo(F, B.y + 28 + (F - xF) * 0.5); g.lineTo(xF, B.y + 28); g.closePath(); g.fill();
      g.restore();
    }
    pintarAvatar(g, e.m, e.pose, t);
    if (B.y > -400) this.dibujarBoquilla(g, B);
    // estelas de viento
    g.save(); g.lineCap = "round";
    for (const s of this.estelas) {
      g.strokeStyle = `rgba(235,245,255,${s.a})`; g.lineWidth = s.ancho;
      g.beginPath(); g.moveTo(s.x, s.y);
      if (s.entra) g.lineTo(s.x + s.largo, s.y);
      else g.quadraticCurveTo(s.x - s.largo * 0.5, s.y + 6 * Math.sin(s.x * 0.02), s.x - s.largo, s.y);
      g.stroke();
    }
    g.restore();
    this.p.dibujar(g);
    this.dibujarFuuh(g, t, B);
    // la última servilleta cae flotando y se le queda en la cabeza
    if (t > 6.3) {
      const k = tramo(t, 6.3, 7.6), cab = aPant(e.m, [39, -24]);
      const x = cab[0] + 70 * (1 - k) * Math.sin(k * 11), y = lerp(-40, cab[1], k);
      this.dibujarServilleta(g, x, y, k < 1 ? 0.5 * Math.sin(k * 11) : 0.12, 1.1);
    }
    g.restore();
    // empieza en negro y acaba cerrando un círculo sobre su cara
    const aIn = 1 - tramo(t, 0, 0.4);
    if (aIn > 0) { g.fillStyle = `rgba(0,0,0,${aIn})`; g.fillRect(-60, -60, W + 120, H + 120); }
    const kIris = tramo(t, 8.3, 9.3);
    if (kIris > 0) {
      const c0 = aPant(e.m, [39, 30]), c = [(c0[0] - cam.cx) * cam.Z + W / 2, (c0[1] - cam.cy) * cam.Z + H / 2], R = Math.max(0.1, 820 * Math.pow(1 - kIris, 1.7));
      g.save(); g.beginPath(); g.rect(-60, -60, W + 120, H + 120); g.moveTo(c[0] + R, c[1]); g.arc(c[0], c[1], R, 0, 6.283);
      g.fillStyle = "#000"; g.fill("evenodd"); g.restore();
    }
  }
}

registrar({ id: "00000", nombre: "Soplido huracán", crear: () => new EscenaSoplido() });
})();
