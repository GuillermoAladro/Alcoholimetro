/* modelos_elec.js — electrónica del alcoholímetro modelada a partir de las fichas y de las fotos de referencia.
   Cada modelo se construye en su marco «natural» (como apoyado en la mesa, Z arriba, mm) y declara:
     g      → THREE.Group en el marco natural
     anclas → puntos de conexión {p:[x,y,z], d:[dx,dy,dz]} en el marco natural (d = hacia dónde sale el cable)
     aCAD   → matriz del marco natural al marco local de comp.py (el que usa el CAD para colocar la pieza)
   No se dibujan logotipos ni marcas: solo serigrafía técnica, referencias y textos de pantalla. */
const MOD = (() => {
  const { V, MAT, caja, cil, torno, hexa, extruir, rectR, decal, cable, cinta, grupo, texPlaca, texEtiqueta, texPanal, rng, RX90, FUENTE, MONO, lienzo, tex } = L3;
  const M = MAT;
  const ident = () => new THREE.Matrix4();
  const anc = (p, d) => ({ p, d });

  // ---------------------------------------------------------------- piezas pequeñas reutilizables
  // placa de circuito con contorno redondeado y agujeros; cara superior en z=0
  function placa(w, h, esp, r, agujeros, mat = M.pcb(), texSup = null, texInf = null) {
    const cont = r > 0 ? rectR(0, 0, w, h, r) : [[0, 0], [w, 0], [w, h], [0, h]];
    const me = extruir(cont, esp, mat, { agujeros: agujeros.map(a => ({ x: a[0], y: a[1], r: a[2] })), curvas: 20 });
    me.position.z = -esp;
    const g = grupo(me);
    if (texSup) { const d = decal(texSup.isTexture ? new THREE.MeshPhysicalMaterial({ map: texSup, roughness: 0.4, clearcoat: 0.5, clearcoatRoughness: 0.25, transparent: true, alphaTest: 0.5, polygonOffset: true, polygonOffsetFactor: -2 }) : texSup, w, h, [w / 2, h / 2, 0.012], [0, 0, 1], [1, 0, 0]); g.add(d); }
    if (texInf) g.add(decal(new THREE.MeshPhysicalMaterial({ map: texInf, roughness: 0.4, clearcoat: 0.5, transparent: true, alphaTest: 0.5, polygonOffset: true, polygonOffsetFactor: -2 }), w, h, [w / 2, h / 2, -esp - 0.012], [0, 0, -1], [1, 0, 0]));
    return g;
  }
  // recorta agujeros redondos en el canal alfa de una textura de placa (para que la serigrafía no tape los taladros)
  function alfaAgujeros(t, w, h, agujeros) {
    const c = t.image, g = c.getContext("2d"), k = c.width / w;
    g.save(); g.globalCompositeOperation = "destination-out";
    for (const a of agujeros) { g.beginPath(); g.arc(a[0] * k, c.height - a[1] * k, a[2] * k, 0, 7); g.fill(); }
    g.restore(); t.needsUpdate = true; return t;
  }
  // componentes SMD diminutos repartidos (resistencias, condensadores) — una sola malla instanciada por material
  function smd(zonas, n, seed, escala = 1) {
    const R = rng(seed), g = new THREE.Group();
    const tipos = [[1.0, 0.5, 0.35, M.beige()], [1.6, 0.8, 0.45, M.grisOsc()], [1.0, 0.5, 0.3, M.negro()], [2.0, 1.25, 0.6, M.beige()]];
    const geo = new THREE.BoxGeometry(1, 1, 1);
    const porTipo = tipos.map(() => []);
    for (let i = 0; i < n; i++) {
      const z = zonas[Math.floor(R() * zonas.length)];
      porTipo[Math.floor(R() * tipos.length)].push([z.x + R() * z.w, z.y + R() * z.h, R() < 0.5]);
    }
    const m4 = new THREE.Matrix4(), q0 = new THREE.Quaternion(), q90 = new THREE.Quaternion().setFromAxisAngle(V(0, 0, 1), Math.PI / 2);
    tipos.forEach(([L, W, H, mat], t) => {
      const lista = porTipo[t]; if (!lista.length) return;
      const h = H * escala;
      const im = new THREE.InstancedMesh(geo, mat, lista.length), im2 = new THREE.InstancedMesh(geo, M.estano(), lista.length * 2);
      lista.forEach(([x, y, rot], i) => {
        m4.compose(V(x, y, h / 2), rot ? q90 : q0, V(L - 0.5, W, h)); im.setMatrixAt(i, m4);
        [-1, 1].forEach((s, j) => {
          const dx = rot ? 0 : s * (L / 2 - 0.13), dy = rot ? s * (L / 2 - 0.13) : 0;
          m4.compose(V(x + dx, y + dy, h / 2), rot ? q90 : q0, V(0.26, W * 1.02, h * 1.02)); im2.setMatrixAt(i * 2 + j, m4);
        });
      });
      g.add(im, im2);
    });
    return g;
  }
  // circuito integrado (cuerpo negro con patillas a los lados)
  function chip(x, y, w, h, alto, pat = "qfn", mat = M.negro()) {
    const g = grupo(caja(x, x + w, y, y + h, 0, alto, mat, 0.15));
    if (pat === "so") {
      const n = Math.max(2, Math.floor(w / 1.27));
      for (let i = 0; i < n; i++) {
        const px = x + (w - (n - 1) * 1.27) / 2 + i * 1.27;
        g.add(caja(px - 0.2, px + 0.2, y - 0.9, y, 0, 0.25, M.estano()), caja(px - 0.2, px + 0.2, y + h, y + h + 0.9, 0, 0.25, M.estano()));
      }
    }
    return g;
  }
  // manguito rectangular hueco (bocas de USB, HDMI, RJ45): eje +X, abierto en x1; pared e
  // abre = +1: boca en x1 (fondo en x0); abre = −1: boca en x0 (fondo en x1)
  function manguito(x0, x1, y0, y1, z0, z1, e, mat, fondo = M.negro(), abre = 1) {
    const f = abre > 0 ? caja(x0, x0 + 0.8, y0 + e, y1 - e, z0 + e, z1 - e, fondo) : caja(x1 - 0.8, x1, y0 + e, y1 - e, z0 + e, z1 - e, fondo);
    return grupo(
      caja(x0, x1, y0, y1, z0, z0 + e, mat), caja(x0, x1, y0, y1, z1 - e, z1, mat),
      caja(x0, x1, y0, y0 + e, z0, z1, mat), caja(x0, x1, y1 - e, y1, z0, z1, mat), f);
  }
  const ledMat = color => new THREE.MeshPhysicalMaterial({ color: new THREE.Color(color), emissive: new THREE.Color(color), emissiveIntensity: 0.15, roughness: 0.3 });
  // losa de contorno redondeado entre z0 y z1, con bisel b (el contorno final queda dentro del rectángulo dado)
  function losaR(x0, y0, x1, y1, r, z0, z1, mat, b = 0) {
    const me = extruir(rectR(x0 + b, y0 + b, x1 - b, y1 - b, Math.max(0.2, r - b)), Math.max(0.05, z1 - z0 - 2 * b), mat, { bisel: b, curvas: 24 });
    me.position.z = z0 + b;
    return me;
  }
  function ledSmd(x, y, color) {
    const m = new THREE.MeshPhysicalMaterial({ color: new THREE.Color(color), emissive: new THREE.Color(color), emissiveIntensity: 0.0, roughness: 0.3, transmission: 0.3, transparent: true });
    return grupo(caja(x - 0.8, x + 0.8, y - 0.4, y + 0.4, 0, 0.5, m), caja(x - 0.8, x - 0.55, y - 0.4, y + 0.4, 0, 0.5, M.estano()), caja(x + 0.55, x + 0.8, y - 0.4, y + 0.4, 0, 0.5, M.estano()));
  }
  // tornillo de cabeza cilíndrica con ranura cruzada (bornes) — cabeza en p, eje d hacia fuera
  function tornilloBorne(p, d, r = 1.75, alto = 1.2) {
    const g = grupo(cil(r, alto, p, d, M.niquel(), 24));
    const n = V(...d).normalize(), top = V(...p).addScaledVector(n, alto + 0.01);
    const a = Math.abs(n.z) > 0.9 ? V(1, 0, 0) : V(0, 0, 1), b = new THREE.Vector3().crossVectors(n, a);
    for (const u of [a, b]) {
      const m = caja(-r * 0.8, r * 0.8, -0.25, 0.25, -0.35, 0.02, M.grisOsc());
      const mtx = new THREE.Matrix4().makeBasis(u, new THREE.Vector3().crossVectors(n, u), n); mtx.setPosition(top);
      m.applyMatrix4(mtx); g.add(m);
    }
    return g;
  }

  // ================================================================ E04 · Raspberry Pi 3 Model B+ (plano RP-008337)
  function raspberry(op = {}) {
    const W = 85, H = 56, E = 1.4;
    const AG = [[3.5, 3.5], [61.5, 3.5], [3.5, 52.5], [61.5, 52.5]];
    const t = texPlaca(W, H, { seed: 31, ppm: 14, plano: true,
      zonas: [{ x: 6, y: 49, w: 53, h: 7 }, { x: 22, y: 22, w: 18, h: 18 }, { x: 64, y: 1, w: 21, h: 54 }],
      marcos: [{ x: 7.1, y: 50, w: 50.8, h: 5.08 }, { x: 42.6, y: 0.6, w: 4.8, h: 22.8 }, { x: 0.6, y: 15.6, w: 4.8, h: 22.8 }, { x: 52.3, y: 22, w: 10, h: 10 }],
      textos: [
        { t: "J8", x: 4.6, y: 52.5, s: 1.3, b: 1 }, { t: "GPIO", x: 32, y: 47.6, s: 1.3, al: "center", b: 1 },
        { t: "CAMERA", x: 48.6, y: 12, s: 1.25, rot: 90, al: "center", b: 1 }, { t: "DISPLAY", x: 6.4, y: 27, s: 1.25, rot: 90, al: "center", b: 1 },
        { t: "HDMI", x: 32, y: 12.8, s: 1.25, al: "center", b: 1 }, { t: "PWR IN", x: 10.6, y: 6.2, s: 1.1, al: "center", b: 1 },
        { t: "3 Model B+", x: 44, y: 41.5, s: 1.9, b: 1 }, { t: "© 2017", x: 44, y: 39, s: 1.1 },
        { t: "PoE", x: 64.2, y: 46.8, s: 1.0, b: 1 }, { t: "ACT", x: 4.2, y: 10.4, s: 0.9 }, { t: "PWR", x: 4.2, y: 7.6, s: 0.9 },
        { t: "U1", x: 31, y: 21.2, s: 1 }, { t: "U2", x: 56, y: 33.4, s: 1 }, { t: "PP1", x: 9, y: 16.5, s: 0.9 }],
      agujeros: AG.map(a => [a[0], a[1], 3.1, 1.375]) });
    alfaAgujeros(t, W, H, AG.map(a => [a[0], a[1], 1.375]));
    const tInf = texPlaca(W, H, { seed: 77, ppm: 8, pistas: 140, zonas: [{ x: 23, y: 23, w: 16, h: 16 }], agujeros: AG.map(a => [a[0], a[1], 3.1, 1.375]) });
    alfaAgujeros(tInf, W, H, AG.map(a => [a[0], a[1], 1.375]));
    const g = grupo(placa(W, H, E, 3, AG.map(a => [a[0], a[1], 1.375]), M.pcb(), t, tInf));
    // GPIO 2 × 20 (J8): pines de 0,64 mm dorados sobre base negra de 2,5 mm
    g.add(caja(7.1, 57.9, 50.0, 55.08, 0, 2.5, M.negro(), 0.2));
    const pinGeo = new THREE.BoxGeometry(0.64, 0.64, 11.5); pinGeo.translate(0, 0, 11.5 / 2 - 3);
    const ip = new THREE.InstancedMesh(pinGeo, M.oro(), 44), m4 = new THREE.Matrix4();
    let k = 0;
    for (let i = 0; i < 20; i++) for (const yy of [51.27, 53.81]) { m4.makeTranslation(8.37 + 2.54 * i, yy, 0); ip.setMatrixAt(k++, m4); }
    // PoE (J14), 2 × 2
    for (const [xx, yy] of [[59.8, 45.6], [62.34, 45.6], [59.8, 48.14], [62.34, 48.14]]) { m4.makeTranslation(xx, yy, 0); ip.setMatrixAt(k++, m4); }
    g.add(ip, caja(58.5, 63.6, 44.3, 49.4, 0, 2.5, M.negro(), 0.2));
    // USB 2.0 dobles (dos bloques apilados) y RJ45
    for (const y0 of [40.45, 22.45]) {
      g.add(manguito(69.6, 87.1, y0, y0 + 13.1, 0, 7.7, 0.32, M.niquel()), manguito(69.6, 87.1, y0, y0 + 13.1, 7.9, 15.6, 0.32, M.niquel()));
      g.add(caja(69.6, 87.1, y0, y0 + 13.1, 7.65, 7.95, M.niquel()));
      for (const z0 of [0, 7.9]) g.add(caja(70.5, 86.4, y0 + 1, y0 + 12.1, z0 + 4.6, z0 + 6.4, M.negro()));   // lengüeta
      for (const z0 of [0, 7.9]) for (const s of [3.5, 9.6]) g.add(caja(87.0, 87.12, y0 + s, y0 + s + 1.2, z0 + 1.2, z0 + 1.9, M.niquel()));
    }
    g.add(manguito(65.5, 87.6, 2.25, 18.25, 0, 13.5, 0.35, M.niquel()));
    g.add(caja(66, 86.8, 4.4, 16.1, 1.6, 9.4, M.negro()));                      // cuerpo del RJ45 por dentro
    g.add(caja(86.0, 87.3, 6.8, 13.7, 9.4, 11.9, M.negro()));                    // pestaña
    g.add(caja(87.55, 87.75, 3.0, 5.0, 10.6, 12.4, ledMat("#2bd65b")), caja(87.55, 87.75, 15.5, 17.5, 10.6, 12.4, ledMat("#f2b315")));
    for (let i = 0; i < 8; i++) g.add(caja(85.4, 86.2, 6.2 + i * 1.02, 6.6 + i * 1.02, 8.6, 9.0, M.oro()));
    // HDMI tipo A
    const hd = new THREE.Group();
    hd.add(caja(24.5, 39.5, -1.0, 11.5, 0, 6.2, M.niquel(), 0.4));
    hd.add(caja(25.3, 38.7, -1.05, 10, 0.6, 5.0, M.negro()));
    hd.add(caja(26.6, 37.4, -1.1, 9, 2.1, 3.5, M.grisOsc()));
    g.add(hd);
    // micro-USB
    g.add(caja(6.6, 14.6, -1.0, 4.6, 0, 3.0, M.niquel(), 0.35), caja(7.25, 13.95, -1.05, 3.6, 0.55, 2.4, M.negro()), caja(8, 13.2, -1.1, 3, 1.2, 1.75, M.grisOsc()));
    // jack de audio 3,5 mm
    g.add(caja(50.5, 56.5, 0, 12.0, 0, 6.0, M.negro(), 0.4), cil(2.95, 2.6, [53.5, 0.2, 3.0], [0, -1, 0], M.negro(), 28), cil(1.8, 0.05, [53.5, -2.42, 3.0], [0, -1, 0], M.grisOsc()));
    // CSI (CAMERA) y DSI (DISPLAY): cuerpo beige con pestaña negra
    for (const [x0, y0] of [[43, 1], [1, 16]]) {
      g.add(caja(x0, x0 + 4, y0, y0 + 22, 0, 4.6, M.beige(), 0.2));
      g.add(caja(x0 - 0.2, x0 + 4.2, y0 - 0.2, y0 + 22.2, 4.4, 5.5, M.negro(), 0.2));
      g.add(caja(x0 + 1.3, x0 + 2.7, y0 + 1.2, y0 + 20.8, 4.0, 5.6, M.grisOsc()));
    }
    // SoC BCM2837B0 con tapa metálica, LAN7515, PMIC, módulo Wi-Fi blindado, cristal
    g.add(caja(23.5, 38.5, 23.5, 38.5, 0, 0.5, M.pcbNegro()), caja(24.5, 37.5, 24.5, 37.5, 0.5, 1.25, M.aluminio(), 0.4));
    g.add(chip(53, 23, 9, 9, 0.9), chip(13, 8, 6, 6, 0.9), chip(46, 30, 4, 4, 0.8));
    g.add(caja(7.5, 19.5, 33.5, 45.5, 0, 1.9, M.niquel(), 0.3));
    const tShield = texEtiqueta(12, 12, (g2, Wc, Hc, k2) => {
      g2.strokeStyle = "rgba(90,95,100,0.55)"; g2.lineWidth = 0.5 * k2; g2.strokeRect(1.2 * k2, 1.2 * k2, Wc - 2.4 * k2, Hc - 2.4 * k2);
      g2.fillStyle = "rgba(60,64,68,0.75)"; g2.font = `600 ${1.05 * k2}px ${MONO}`; g2.textAlign = "center"; g2.fillText("CYW43455", Wc / 2, Hc / 2); g2.fillText("FCC ID 2ABCB", Wc / 2, Hc / 2 + 1.6 * k2);
    }, 20, null);
    g.add(decal(new THREE.MeshPhysicalMaterial({ map: tShield, transparent: true, metalness: 1, roughness: 0.3, color: 0xcfd1d4, polygonOffset: true, polygonOffsetFactor: -2 }), 12, 12, [13.5, 39.5, 1.91], [0, 0, 1], [1, 0, 0]));
    g.add(caja(20.5, 23.5, 40, 42, 0, 0.8, M.niquel(), 0.3));
    // bobinas y condensadores grandes
    for (const [x, y] of [[17.5, 11.5], [21, 11.5], [17.5, 15], [44, 13]]) g.add(caja(x, x + 2.6, y, y + 2.6, 0, 1.2, M.grisOsc(), 0.3));
    g.add(ledSmd(2.6, 10.3, "#2bd65b"), ledSmd(2.6, 7.7, "#e5281e"));
    g.add(smd([{ x: 8, y: 4, w: 14, h: 26 }, { x: 40, y: 25, w: 12, h: 15 }, { x: 20, y: 14, w: 22, h: 8 }, { x: 44, y: 41, w: 18, h: 6 }, { x: 52, y: 14, w: 11, h: 7 }], 140, 5));
    // por debajo: LPDDR2, zócalo microSD y tarjeta (E21) asomando 2,5 mm
    g.add(caja(24, 38, 24, 38, -E - 1.0, -E, M.negro(), 0.2));
    g.add(caja(0.8, 15.8, 20.5, 35.5, -E - 1.6, -E, M.niquel(), 0.2));
    // tarjeta: ancho (x de la tarjeta) → y de la Pi; largo (y de la tarjeta, contactos al final) → +x de la Pi; etiqueta hacia abajo
    const sd = microSD(); sd.applyMatrix4(new THREE.Matrix4().makeBasis(V(0, 1, 0), V(1, 0, 0), V(0, 0, -1)).setPosition(V(-2.5, 22.5, -E - 0.4))); g.add(sd);
    if (op.separadores) for (const [ax, ay] of AG) g.add(hexa(5.0, op.separadores, [ax, ay, -E - op.separadores], [0, 0, 1], M.negro(), 1.35));
    const anclas = {
      pwr: anc([10.6, -1.2, 1.5], [0, -1, 0]), hdmi: anc([32, -1.2, 3.1], [0, -1, 0]), csi: anc([45, 12, 5.6], [0, 0, 1]),
      usb_bajo: anc([87.2, 29, 3.85], [1, 0, 0]), usb_alto: anc([87.2, 47, 3.85], [1, 0, 0]),
      gpio1: anc([8.37, 51.27, 8.5], [0, 0, 1]), gpio6: anc([13.45, 53.81, 8.5], [0, 0, 1]), gpio8: anc([15.99, 53.81, 8.5], [0, 0, 1]), gpio10: anc([18.53, 53.81, 8.5], [0, 0, 1]),
      sd: anc([-2.5, 28, -E - 0.6], [-1, 0, 0]) };
    return { g, anclas, aCAD: RX90.clone(), nombre: "Raspberry Pi 3 Model B+" };
  }

  // ================================================================ E21 · microSD 32 GB (11 × 15 × 1 mm)
  function microSD() {
    const t = texEtiqueta(11, 15, (g, W, H, k) => {
      g.fillStyle = "#f6f6f4"; g.fillRect(0, 0, W, H);
      g.fillStyle = "#1b1b1b"; g.font = `800 ${4.6 * k}px ${FUENTE}`; g.fillText("32", 1.1 * k, 10.6 * k);
      g.font = `700 ${1.15 * k}px ${FUENTE}`; g.fillText("HIGH ENDURANCE", 1.1 * k, 4.2 * k);
      g.fillStyle = "#9b7a3c"; g.fillRect(1.1 * k, 4.8 * k, 7 * k, 0.25 * k);
      g.fillStyle = "#1b1b1b"; g.font = `700 ${1.2 * k}px ${FUENTE}`; g.fillText("GB  U3 V30", 1.1 * k, 12.8 * k);
    }, 30);
    const cont = [[0, 0], [11, 0], [11, 15], [3.2, 15], [3.2, 13.8], [2.4, 13.4], [0.6, 10.2], [0, 9.2]];
    const cuerpo = extruir(cont, 0.8, M.blanco()); cuerpo.position.z = 0;
    const g = grupo(cuerpo, decal(new THREE.MeshPhysicalMaterial({ map: t, roughness: 0.5, polygonOffset: true, polygonOffsetFactor: -2 }), 11, 15, [5.5, 7.5, 0.81], [0, 0, 1], [1, 0, 0]));
    for (let i = 0; i < 8; i++) g.add(caja(1.0 + i * 1.1, 1.75 + i * 1.1, 11.4, 14.2, -0.01, 0, M.oro()));
    return g;
  }

  // ================================================================ E03 · Raspberry Pi Camera Module 3 (25 × 24 × 11,5)
  function camara(op = {}) {
    const W = 25, H = 24, E = 1.0, AG = [[2, 2], [23, 2], [2, 14.5], [23, 14.5]];
    const lx = 12.5, ly = 24 - 9.462;
    const t = texPlaca(W, H, { seed: 12, ppm: 24, pistas: 26,
      zonas: [{ x: 6.5, y: 8.5, w: 12, h: 12 }],
      textos: [{ t: "Camera Module 3", x: 12.5, y: 6.4, s: 1.45, al: "center" }, { t: "7.1", x: 3.2, y: 9.5, s: 1.0 }, { t: "©", x: 3.0, y: 21.8, s: 1.2 }],
      agujeros: AG.map(a => [a[0], a[1], 2.15, 1.1]), anillo: "#d6b257" });
    alfaAgujeros(t, W, H, AG.map(a => [a[0], a[1], 1.1]));
    const g = grupo(placa(W, H, E, 1.0, AG.map(a => [a[0], a[1], 1.1]), M.pcb(), t));
    // módulo de la lente: carcasa metálica cuadrada (VCM) + barril negro + vidrio
    const vcm = L3.phys("vcm", { color: L3.C("#7c8187"), metalness: 1, roughness: 0.42 });
    g.add(caja(lx - 5.7, lx + 5.7, ly - 5.7, ly + 5.7, 0, 5.2, vcm, 0.5));
    g.add(caja(lx - 5.2, lx + 5.2, ly - 5.2, ly + 5.2, 5.2, 5.6, L3.phys("vcmTapa", { color: L3.C("#3a3d41"), metalness: 0.8, roughness: 0.5 }), 0.6));
    g.add(torno([[0, 0], [3.9, 0], [3.9, 1.6], [3.6, 2.1], [3.6, 3.6], [3.1, 3.9], [0, 3.9]], [lx, ly, 5.6], [0, 0, 1], M.negroMate(), 40));
    const vidrio = cil(2.4, 0.15, [lx, ly, 9.42], [0, 0, 1], new THREE.MeshPhysicalMaterial({ color: 0x0a1426, roughness: 0.02, metalness: 0.3, clearcoat: 1, iridescence: 0.6, iridescenceIOR: 1.6 }), 40);
    g.add(vidrio, cil(3.25, 0.25, [lx, ly, 9.3], [0, 0, 1], M.negroBrillo(), 40));
    // tira flexible del sensor (a la derecha de la lente)
    g.add(caja(18.6, 21.6, 9.0, 20.0, 0, 0.45, M.negroBrillo()), caja(18.9, 21.3, 15.5, 19.6, 0.45, 0.6, M.oro()));
    g.add(smd([{ x: 3.5, y: 3.5, w: 18, h: 3.5 }, { x: 3, y: 17, w: 4, h: 5 }], 22, 9, 0.7));
    // conector FPC de 15 vías por detrás, en el canto de abajo
    g.add(caja(1.5, 23.5, 0, 5.5, -E - 2.4, -E, M.negro(), 0.15), caja(1.8, 23.2, 0, 1.6, -E - 3.0, -E - 2.0, M.beige(), 0.1));
    if (op.separadores) for (const [ax, ay] of AG) g.add(hexa(3.2, op.separadores, [ax, ay, 0], [0, 0, 1], M.negro(), 1.1));
    const anclas = { fpc: anc([12.5, -0.2, -E - 1.4], [0, -1, 0]) };
    return { g, anclas, aCAD: RX90.clone(), nombre: "Camera Module 3" };
  }

  // ---------------------------------------------------------------- pantallas (texturas emisivas)
  function texLCD() {
    const [c, g] = lienzo(1024, 600);
    // vista previa de la cámara: bar en penumbra, desenfocado
    const gr = g.createLinearGradient(0, 0, 0, 600); gr.addColorStop(0, "#2b2118"); gr.addColorStop(0.55, "#3e2c1d"); gr.addColorStop(1, "#1a140f");
    g.fillStyle = gr; g.fillRect(0, 0, 1024, 600);
    const R = rng(4);
    for (let i = 0; i < 70; i++) {
      const x = R() * 1024, y = R() * 330, r = 8 + R() * 38;
      const rg = g.createRadialGradient(x, y, 0, x, y, r);
      const col = R() < 0.6 ? "255,190,110" : R() < 0.5 ? "255,120,60" : "140,190,255";
      rg.addColorStop(0, `rgba(${col},${0.55 * R() + 0.15})`); rg.addColorStop(1, `rgba(${col},0)`);
      g.fillStyle = rg; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
    }
    // silueta difusa de una persona delante de la cámara
    const ps = g.createRadialGradient(512, 300, 30, 512, 330, 300); ps.addColorStop(0, "rgba(120,86,64,0.75)"); ps.addColorStop(1, "rgba(60,40,30,0)");
    g.fillStyle = ps; g.beginPath(); g.ellipse(512, 270, 120, 150, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(512, 560, 300, 200, 0, 0, 7); g.fill();
    // franja de mensajes del programa (main.py, Pantalla.mensaje)
    g.fillStyle = "rgba(0,0,0,0.67)"; g.fillRect(0, 600 - 170, 1024, 170);
    g.fillStyle = "#fff"; g.textAlign = "center"; g.textBaseline = "middle";
    g.font = `700 44px ${FUENTE}`; g.fillText("Acerca tu tarjeta o el móvil al lector", 512, 600 - 118);
    g.fillStyle = "#dcdcdc"; g.font = `400 28px ${FUENTE}`; g.fillText("prueba 2,00 € · resultado orientativo", 512, 600 - 45);
    return tex(c);
  }
  function texSolo() {
    const [c, g] = lienzo(640, 640);
    g.fillStyle = "#fbfbfa"; g.fillRect(0, 0, 640, 640);
    g.fillStyle = "#1c1c1c"; g.font = `600 22px ${FUENTE}`; g.textAlign = "right"; g.fillText("100%", 590, 36);
    g.fillRect(598, 22, 26, 14); g.fillStyle = "#fbfbfa"; g.fillRect(600, 24, 22, 10); g.fillStyle = "#1c1c1c"; g.fillRect(601, 25, 20, 8);
    for (let i = 0; i < 4; i++) g.fillRect(500 + i * 7, 36 - (i + 1) * 4, 4, (i + 1) * 4);
    g.textAlign = "center"; g.font = `600 34px ${FUENTE}`; g.fillText("Acerca la tarjeta", 320, 130);
    g.font = `800 64px ${FUENTE}`; g.fillText("2,00 €", 320, 210);
    // símbolo sin contacto genérico (ondas + tarjeta)
    g.strokeStyle = "#1c1c1c"; g.lineWidth = 5;
    g.beginPath(); g.ellipse(320, 380, 120, 75, 0, 0, 7); g.stroke();
    g.lineWidth = 9; g.lineCap = "round";
    for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(250 - i * 0, 380, 18 + i * 14, -0.75, 0.75); g.stroke(); }
    g.lineWidth = 6; g.strokeRect(330, 345, 70, 48);
    for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(250 + i * 45, 545, 7, 0, 7); i ? g.stroke() : g.fill(); }
    return tex(c);
  }

  // ================================================================ E01 · pantalla GeeekPi EP-0170 7" 1024 × 600, sin táctil
  function pantalla(op = {}) {
    const w = 165, h = 100, aw = 154.21, ah = 85.92, ax0 = (w - aw) / 2, ay0 = (h - ah) / 2;
    const g = new THREE.Group();
    // vidrio frontal negro con borde
    const vid = caja(0, w, 0, h, -1.1, 0, M.vidrio(), 0.6);
    g.add(vid);
    const lcd = new THREE.MeshPhysicalMaterial({ color: 0x000000, emissive: 0xffffff, emissiveMap: texLCD(), emissiveIntensity: op.encendida === false ? 0 : 1.35, roughness: 0.08, clearcoat: 0.5, clearcoatRoughness: 0.05, envMapIntensity: 0.35 });
    lcd.emissiveMap.encoding = THREE.sRGBEncoding;
    g.add(decal(lcd, aw, ah, [ax0 + aw / 2, ay0 + ah / 2, 0.02], [0, 0, 1], [1, 0, 0]));
    // módulo LCD (marco metálico trasero)
    g.add(caja(2.5, w - 2.5, 2, h - 2, -6, -1.1, M.galv(), 0.6));
    // placa controladora negra en la parte izquierda, con los conectores en el canto
    const tPl = texPlaca(96, 52, { seed: 23, base: "#121514", pista: "#1d2421", ppm: 8, pistas: 90, textos: [{ t: "EP-0170", x: 60, y: 44, s: 2.2, b: 1 }, { t: "HDMI", x: 14, y: 8, s: 1.6, b: 1 }, { t: "5V IN", x: 14, y: 36.5, s: 1.5, b: 1 }, { t: "BL", x: 8, y: 47.5, s: 1.5, b: 1 }] });
    const pl = placa(96, 52, 1.6, 1.5, [[3, 3, 1.4], [93, 3, 1.4], [3, 49, 1.4], [93, 49, 1.4]], M.pcbNegro(), tPl);
    pl.rotation.x = Math.PI; pl.position.set(0, 12 + 52, -7.65);
    g.add(pl);
    const zb = -7.65;    // cara de componentes de la controladora (mira hacia −Z)
    // HDMI hembra tipo A en el canto izquierdo
    g.add(caja(-0.5, 12, 18, 33, zb - 6.0, zb, M.niquel(), 0.35), caja(-0.55, 10, 18.8, 32.2, zb - 5.1, zb - 0.9, M.negro()), caja(-0.6, 9, 20, 31, zb - 3.6, zb - 2.4, M.grisOsc()));
    // USB-C hembra
    g.add(caja(-0.5, 7.5, 42.5, 51.5, zb - 3.4, zb, M.niquel(), 1.4), caja(-0.55, 6.5, 43.2, 50.8, zb - 2.7, zb - 0.7, M.negro(), 0.9), caja(-0.6, 5.5, 44.2, 49.8, zb - 1.95, zb - 1.45, M.grisOsc()));
    // ruleta del brillo
    const ru = cil(3.0, 2.6, [-0.6, 70, zb - 3.0], [-1, 0, 0], M.negro(), 32); g.add(ru, caja(0, 6, 66.5, 73.5, zb - 4.6, zb, M.negro()));
    for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2; g.add(caja(-3.2, -0.6, 70 + Math.cos(a) * 3 - 0.18, 70 + Math.cos(a) * 3 + 0.18, zb - 3 + Math.sin(a) * 3 - 0.18, zb - 3 + Math.sin(a) * 3 + 0.18, M.negro())); }
    // chips de la controladora y la cinta naranja al panel
    const cps = [[30, 22, 12, 12], [50, 30, 7, 7], [70, 18, 5, 5], [20, 40, 6, 4]];
    for (const [x, y, ww, hh] of cps) g.add(caja(x, x + ww, y, y + hh, zb - 1.1, zb, M.negro(), 0.15));
    g.add(caja(96, 112, 30, 70, -6.2, -6.0, new THREE.MeshPhysicalMaterial({ color: 0xc9792a, roughness: 0.35, clearcoat: 0.6 })));
    if (op.clavijas) {
      g.add(clavijaHDMI90([-0.5, 25.5, zb - 3.0], [-1, 0, 0], [0, 0, -1]));
      g.add(clavijaUSBC90([-0.5, 47, zb - 1.7], [-1, 0, 0], [0, 0, -1]));
    }
    const anclas = { hdmi: anc([-0.6, 25.5, zb - 3.0], [-1, 0, 0]), usbc: anc([-0.6, 47, zb - 1.7], [-1, 0, 0]) };
    return { g, anclas, aCAD: RX90.clone(), nombre: "Pantalla 7\" EP-0170" };
  }

  // ================================================================ E02 · SumUp Solo (83,16 × 83,02 × 17,6), sin base
  function solo(op = {}) {
    const w = 83.16, h = 83.02, t = 17.6;
    const g = new THREE.Group();
    g.add(losaR(0, 0, w, h, 11, -7.2, 0, M.blanco(), 1.6));                                   // marco blanco del frente
    g.add(losaR(0.9, 0.9, w - 0.9, h - 0.9, 10.2, -t, -6.2, L3.phys("grisSolo", { color: L3.C("#cdd0d4"), roughness: 0.55 }), 1.8));
    g.add(losaR(4.6, 4.6, w - 4.6, h - 4.6, 7.2, -0.6, 0.05, M.vidrio(), 0.3));            // cristal
    const scr = new THREE.MeshPhysicalMaterial({ color: 0x000000, emissive: 0xffffff, emissiveMap: texSolo(), emissiveIntensity: op.encendido === false ? 0 : 1.7, roughness: 0.08, clearcoat: 0.5, clearcoatRoughness: 0.05, envMapIntensity: 0.35 });
    scr.emissiveMap.encoding = THREE.sRGBEncoding;
    g.add(decal(scr, 64, 64, [w / 2, h / 2 + 0.5, 0.09], [0, 0, 1], [1, 0, 0]));
    // USB-C en el canto de abajo, centrado; tecla en el lateral derecho
    g.add(caja(w / 2 - 4.6, w / 2 + 4.6, -0.05, 6, -t / 2 - 1.75, -t / 2 + 1.75, M.negro(), 1.2));
    g.add(caja(w / 2 - 3.6, w / 2 + 3.6, -0.1, 5, -t / 2 - 0.9, -t / 2 + 0.9, M.grisOsc(), 0.8));
    g.add(caja(w - 0.2, w + 0.5, 56, 68, -12, -6, L3.phys("teclaSolo", { color: L3.C("#bfc3c8"), roughness: 0.45 }), 0.3));
    if (op.clavija) g.add(clavijaUSBC90([w / 2, -0.1, -t / 2], [0, -1, 0], [0, 0, -1]));
    const anclas = { usbc: anc([w / 2, -0.2, -t / 2], [0, -1, 0]) };
    return { g, anclas, aCAD: RX90.clone(), nombre: "SumUp Solo" };
  }

  // ---------------------------------------------------------------- clavijas acodadas (cable HDMI 90° y USB-C 90°)
  // p: centro de la punta en la boca; d: dirección de inserción hacia FUERA del aparato (de donde viene la clavija); s: hacia dónde sale el cable
  /* Marco local de una clavija: X = hacia fuera de la boca (la punta queda en x < 0, dentro del conector),
     Y = hacia donde sale el cable en las acodadas, Z = transversal. p = centro de la boca; d = X; s = Y.
     userData.salida = {p, d} en coordenadas del padre: donde empieza el cable. */
  function base3(d, s) { const D = V(...d).normalize(), S = V(...s).normalize(), T = new THREE.Vector3().crossVectors(D, S); return [D, S, T]; }
  function enMarco(obj, p, D, S, T, salida) {
    const m = new THREE.Matrix4().makeBasis(D, S, T); m.setPosition(V(...p)); obj.applyMatrix4(m);
    if (salida) {
      const sp = V(...salida.p).applyMatrix4(m), sd = V(...salida.d).transformDirection(m);
      obj.userData.salida = { p: [sp.x, sp.y, sp.z], d: [sd.x, sd.y, sd.z] };
    }
    return obj;
  }
  const trenza = () => L3.phys("trenzaGris", { color: L3.C("#6b7078"), roughness: 0.75 });
  function clavijaHDMI90(p, d, s) {
    const g = new THREE.Group();
    g.add(caja(-9.6, 0.4, -2.2, 2.2, -6.95, 6.95, M.niquel(), 0.3), caja(-9.7, -1, -1.4, 1.4, -5.6, 5.6, M.oro()));   // punta 13,9 × 4,45 (casi toda dentro)
    g.add(caja(0.4, 12.4, -5.0, 8.0, -10.2, 10.2, M.aluAnod(), 2.2));              // carcasa acodada gris azulada
    g.add(caja(1.6, 11.2, 8.0, 15.0, -6.0, 6.0, M.aluAnod(), 1.8));
    g.add(cil(3.2, 6, [6.4, 15.0, 0], [0, 1, 0], M.pvcNegro(), 20, 2.6));
    return enMarco(g, p, ...base3(d, s), { p: [6.4, 21, 0], d: [0, 1, 0] });
  }
  function clavijaUSBC90(p, d, s) {
    const g = new THREE.Group();
    g.add(caja(-6.6, 0.4, -1.25, 1.25, -4.2, 4.2, M.niquel(), 1.2));                // punta 8,4 × 2,5
    g.add(caja(0.4, 8.8, -3.6, 6.0, -6.2, 6.2, M.aluAnod(), 2.4));
    g.add(caja(1.6, 7.6, 6.0, 12.5, -3.6, 3.6, M.aluAnod(), 1.8));
    g.add(cil(2.2, 5, [4.6, 12.5, 0], [0, 1, 0], trenza(), 18, 1.9));
    return enMarco(g, p, ...base3(d, s), { p: [4.6, 17.5, 0], d: [0, 1, 0] });
  }
  function clavijaUSBA(p, d, s) {
    const g = new THREE.Group();
    g.add(manguito(-12, 0.3, -6, 6, -2.25, 2.25, 0.3, M.niquel(), M.blanco(), -1));    // punta USB-A macho
    g.add(caja(-11.6, 0, -5.4, 5.4, -1.95, -0.25, M.blanco()));
    g.add(caja(0.3, 15, -7.4, 7.4, -3.8, 3.8, M.aluAnod(), 2.0));
    g.add(cil(2.3, 7, [15, 0, 0], [1, 0, 0], trenza(), 18, 1.9));
    return enMarco(g, p, ...base3(d, s), { p: [22, 0, 0], d: [1, 0, 0] });
  }
  function clavijaMicroUSB(p, d, s) {
    // la cara ancha (6,9 mm) va a lo largo de Y local
    const g = new THREE.Group();
    g.add(caja(-5.6, 0.3, -3.45, 3.45, -0.95, 0.95, M.niquel(), 0.3));
    g.add(caja(0.3, 14, -5.3, 5.3, -2.9, 2.9, M.negro(), 1.6));
    g.add(cil(2.0, 7, [14, 0, 0], [1, 0, 0], M.pvcNegro(), 16, 1.7));
    return enMarco(g, p, ...base3(d, s), { p: [21, 0, 0], d: [1, 0, 0] });
  }
  // HDMI recto (extremo del cable que va a la Pi): 21 × 11 × 36 + manguito
  function clavijaHDMIrecta(p, d, s) {
    const g = new THREE.Group();
    g.add(caja(-9.6, 0.4, -6.95, 6.95, -2.2, 2.2, M.niquel(), 0.3), caja(-9.7, -1, -5.6, 5.6, -1.4, 1.4, M.oro()));
    g.add(caja(0.4, 36, -10.5, 10.5, -5.5, 5.5, M.aluAnod(), 2.4));
    g.add(cil(3.4, 8, [36, 0, 0], [1, 0, 0], M.pvcNegro(), 20, 2.6));
    return enMarco(g, p, ...base3(d, s), { p: [44, 0, 0], d: [1, 0, 0] });
  }
  // RP-SMA macho del alargo (tuerca moleteada dorada) que se enrosca en el AR9271
  function rpsmaMacho(p, d, s) {
    const g = new THREE.Group();
    g.add(cil(4.0, 7.5, [-0.5, 0, 0], [1, 0, 0], M.oro(), 28));
    for (let i = 0; i < 14; i++) g.add(cil(4.15, 0.25, [-0.2 + i * 0.5, 0, 0], [1, 0, 0], M.oro(), 28));
    g.add(cil(3.0, 4.5, [7, 0, 0], [1, 0, 0], M.oro(), 24, 2.2), cil(1.6, 1.5, [11, 0, 0], [1, 0, 0], M.negro(), 16, 1.3));
    return enMarco(g, p, ...base3(d, s), { p: [12, 0, 0], d: [1, 0, 0] });
  }
  // pareja de faston (hembra + macho) para soltar el puente de tierra
  function fastonPar(p, d, s, color = "#2257b8") {
    const g = new THREE.Group(), mat = L3.phys("faston" + color, { color: L3.C(color), roughness: 0.35, transmission: 0.35, transparent: true });
    g.add(caja(-8, 0, -3.0, 3.0, -2.2, 2.2, mat, 1.0), caja(0, 8, -3.2, 3.2, -1.9, 1.9, mat, 0.8), caja(-2, 2, -2.4, 2.4, -0.4, 0.4, M.estano()));
    g.add(cil(1.9, 4, [-12, 0, 0], [1, 0, 0], mat, 14, 2.6), cil(1.9, 4, [8, 0, 0], [1, 0, 0], mat, 14, 2.6));
    return enMarco(g, p, ...base3(d, s));
  }
  // conector hembra C13 (cordón Schuko → C13)
  function clavijaC13(p, d, s) {
    const g = new THREE.Group();
    g.add(caja(-9, 0.3, -12.0, 12.0, -7.8, 5.6, M.negro(), 1.2));                     // parte que entra en el hueco
    g.add(caja(0.3, 32, -14.5, 14.5, -10.5, 8.5, M.negro(), 3.0));
    for (let i = 0; i < 4; i++) g.add(caja(8 + i * 5, 10 + i * 5, -14.6, 14.6, -10.6, 8.6, M.negroMate()));
    g.add(cil(4.6, 14, [32, 0, -1], [1, 0, 0], M.negro(), 22, 3.6));
    return enMarco(g, p, ...base3(d, s), { p: [46, 0, -1], d: [1, 0, 0] });
  }
  // clavija Schuko (cordón)
  function clavijaSchuko(p, d, s) {
    const g = new THREE.Group();
    g.add(cil(18.5, 4, [0, 0, 0], [-1, 0, 0], M.negro(), 40));
    g.add(cil(17.5, 26, [0, 0, 0], [1, 0, 0], M.negro(), 40, 14));
    for (const z of [-9.5, 9.5]) g.add(cil(2.4, 19, [-4, 0, z], [-1, 0, 0], M.niquel(), 20));
    for (const yy of [-18.6, 18.6]) g.add(caja(-3.6, -0.2, yy - 0.5, yy + 0.5, -2.5, 2.5, M.niquel()));
    g.add(caja(24, 42, -9, 9, -7, 7, M.negro(), 3));
    return enMarco(g, p, ...base3(d, s), { p: [42, 0, 0], d: [1, 0, 0] });
  }
  // faston hembra aislado (4,8 mm, azul 1,5–2,5 mm²) — X hacia el cable, la lengüeta entra por x < 0
  function faston(p, d, s, color = "#2257b8") {
    const g = new THREE.Group(), mat = L3.phys("faston" + color, { color: L3.C(color), roughness: 0.35, transmission: 0.35, transparent: true });
    g.add(caja(-8, 0, -3.2, 3.2, -1.9, 1.9, mat, 0.8), caja(0, 8, -2.6, 2.6, -2.3, 2.3, mat, 1.2), caja(-7.5, -0.5, -2.6, 2.6, -1.0, 1.0, M.estano()));
    return enMarco(g, p, ...base3(d, s), { p: [8, 0, 0], d: [1, 0, 0] });
  }
  // terminal de ojal M4 estañado (sin funda): p = centro del ojal, d = hacia el cable, s = normal de la cara
  function ojalM4(p, d, s) {
    const g = new THREE.Group();
    const a = new THREE.Shape(); a.absarc(0, 0, 4.0, 0, Math.PI * 2); const h = new THREE.Path(); h.absarc(0, 0, 2.15, 0, Math.PI * 2, true); a.holes.push(h);
    // el ojal queda en el plano XZ local (normal = Y local = s)
    const ring = new THREE.Mesh(new THREE.ExtrudeGeometry(a, { depth: 0.8, bevelEnabled: false, curveSegments: 24 }), M.estano()); ring.rotation.x = -Math.PI / 2;
    g.add(ring, caja(3.2, 8, 0, 0.8, -1.8, 1.8, M.estano()), cil(1.9, 6.5, [7.5, 0.4, 0], [1, 0, 0], M.estano(), 16, 1.6));
    return enMarco(g, p, ...base3(d, s), { p: [14, 0.4, 0], d: [1, 0, 0] });
  }
  // puntera (casquillo) para hilo fino: X hacia el cable
  function puntera(p, d, s, color = "#d22b25") {
    const g = new THREE.Group();
    g.add(cil(0.75, 8, [-8, 0, 0], [1, 0, 0], M.estano(), 14), cil(1.6, 6, [0, 0, 0], [1, 0, 0], L3.phys("puntera" + color, { color: L3.C(color), roughness: 0.4 }), 16, 1.25));
    return enMarco(g, p, ...base3(d, s), { p: [6, 0, 0], d: [1, 0, 0] });
  }
  // alojamiento Dupont hembra de 1 vía (2,54 mm): entra por z < 0 en el pin; X = hacia el cable (hacia arriba)
  function dupont(p, d, s, color = "#141414") {
    const g = new THREE.Group();
    g.add(caja(-14, 0, -1.25, 1.25, -1.25, 1.25, M.negro(), 0.2), cil(0.7, 5, [0, 0, 0], [1, 0, 0], L3.phys("dup" + color, { color: L3.C(color), roughness: 0.4 }), 12));
    return enMarco(g, p, ...base3(d, s), { p: [5, 0, 0], d: [1, 0, 0] });
  }
  // clavija XH hembra de 4 vías (paso 2,5): X = hacia los cables; las vías van a lo largo de Z
  function clavijaXH(p, d, s) {
    const g = new THREE.Group();
    g.add(caja(-7.2, 0, -2.4, 2.4, -6.2, 6.2, M.marfil(), 0.3), caja(-7.2, -5.5, 2.4, 3.4, -3.0, 3.0, M.marfil(), 0.3));
    return enMarco(g, p, ...base3(d, s), { p: [0, 0, 0], d: [1, 0, 0] });
  }

  // ================================================================ E06 · Mean Well LRS-50-5 (99 × 82 × 30), caso 239A
  function fuente() {
    const L = 99, W = 82, H = 30, g = new THREE.Group();
    // base de aluminio
    g.add(caja(0, L, 0, W, 0, 1.2, M.aluminio()));
    // tapa de chapa galvanizada en U, con nido de abeja
    const panalTop = texPanal(L - 15, W, 6.4, 5.4, 8, 3.2);
    const matTop = new THREE.MeshPhysicalMaterial({ color: L3.C("#c3c8ce"), metalness: 0.95, roughness: 0.4, alphaMap: panalTop, alphaTest: 0.5, side: THREE.DoubleSide });
    const top = new THREE.Mesh(new THREE.PlaneGeometry(L - 15, W), matTop); top.position.set(15 + (L - 15) / 2, W / 2, H); top.userData.suelta = true;
    const top2 = top.clone(); top2.position.z = H - 0.6;
    g.add(top, top2, caja(15, 15.6, 0, W, 18, H, M.galv()));
    const panalLado = texPanal(L - 15, H - 2, 6.4, 5.4, 8, 3.2);
    for (const [y, s] of [[0, 1], [W, -1]]) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(L - 15, H - 1.2), new THREE.MeshPhysicalMaterial({ color: L3.C("#c3c8ce"), metalness: 0.95, roughness: 0.42, alphaMap: panalLado, alphaTest: 0.5, side: THREE.DoubleSide }));
      m.rotation.x = Math.PI / 2; m.position.set(15 + (L - 15) / 2, y, 1.2 + (H - 1.2) / 2); m.userData.suelta = true; g.add(m);
      g.add(caja(0, 15, y - (s > 0 ? 0 : 0.6), y + (s > 0 ? 0.6 : 0), 1.2, H, M.galv()));
    }
    g.add(caja(L - 0.6, L, 0, W, 1.2, H, M.galv()));
    // interior que se ve por los agujeros
    g.add(caja(1, L - 1, 1, W - 1, 1.2, 2.8, M.pcb()));
    g.add(caja(46, 72, 28, 52, 2.8, 24, L3.phys("trafo", { color: L3.C("#e8c330"), roughness: 0.5 })), caja(50, 68, 26.5, 53.5, 6, 21, M.cobre()));
    for (const [x, y, r, hh] of [[82, 18, 6.3, 20], [82, 62, 4, 14], [30, 64, 6.3, 22], [28, 18, 4, 16]]) g.add(cil(r, hh, [x, y, 2.8], [0, 0, 1], L3.phys("condAzul", { color: L3.C("#1d1f24"), roughness: 0.35, clearcoat: 0.6 }), 24));
    g.add(caja(36, 39, 6, 76, 2.8, 26, M.aluminio()));                   // disipador
    // regleta de bornes de 5 posiciones (paso 9,5) en el extremo x = 0
    g.add(caja(0.5, 13, 13, 69, 18, H, M.negro(), 0.4));
    for (let i = 0; i <= 5; i++) g.add(caja(0.2, 13, 12.6 + i * 9.5 + 0.4, 13.4 + i * 9.5 + 0.4, 18, H + 1.4, M.negro(), 0.3));
    const bornes = ["L", "N", "FG", "-V", "+V"];
    const anclas = {};
    bornes.forEach((nm, i) => {
      const y = 17.5 + 9.5 * i;
      g.add(caja(3.2, 10.8, y - 3.5, y + 3.5, H - 1.0, H - 0.2, M.niquel()));        // arandela cuadrada
      g.add(tornilloBorne([7, y, H - 0.2], [0, 0, 1], 2.6, 1.3));
      g.add(caja(-0.05, 0.5, y - 2.6, y + 2.6, 19.6, 25.4, M.negroMate()));        // boca del cable
      anclas[nm] = anc([-0.2, y, 22.5], [-1, 0, 0]);
    });
    // rótulos de los bornes y etiqueta (sin marcas)
    const tR = texEtiqueta(14, 58, (g2, Wc, Hc, k) => {
      g2.fillStyle = "#f2f2f2"; g2.font = `700 ${3.2 * k}px ${FUENTE}`; g2.textAlign = "center"; g2.textBaseline = "middle";
      bornes.forEach((nm, i) => { g2.fillText(nm === "FG" ? "⏚" : nm, Wc / 2, Hc - (17.5 - 13 + 9.5 * i + 2.9) * k); });
    }, 16, "#16171a");
    g.add(decal(new THREE.MeshPhysicalMaterial({ map: tR, roughness: 0.5, polygonOffset: true, polygonOffsetFactor: -2 }), 6, 58, [16.6, 41, H + 0.03], [0, 0, 1], [1, 0, 0]));
    const tE = texEtiqueta(42, 30, (g2, Wc, Hc, k) => {
      g2.fillStyle = "#121212"; g2.font = `800 ${4.2 * k}px ${FUENTE}`; g2.fillText("LRS-50-5", 2.4 * k, 6 * k);
      g2.font = `500 ${1.9 * k}px ${FUENTE}`;
      ["INPUT: 100-240V~ 1.2A 50/60Hz", "OUTPUT: +5V ⎓ 10A  50W", "SWITCHING POWER SUPPLY", "Ta: 70°C   IP20"].forEach((s, i) => g2.fillText(s, 2.4 * k, (11 + i * 3.3) * k));
      g2.strokeStyle = "#121212"; g2.lineWidth = 0.3 * k; g2.strokeRect(1.2 * k, 1.2 * k, Wc - 2.4 * k, Hc - 2.4 * k);
      g2.font = `700 ${2.2 * k}px ${FUENTE}`; g2.fillText("CE   UKCA   EAC", 2.4 * k, 26.5 * k);
    }, 16, "#f4f4ee");
    g.add(decal(new THREE.MeshPhysicalMaterial({ map: tE, roughness: 0.6, polygonOffset: true, polygonOffsetFactor: -3 }), 42, 30, [44, 20, H + 0.04], [0, 0, 1], [1, 0, 0]));
    // ajuste +V ADJ y LED
    g.add(cil(1.6, 1.2, [20, 72, H - 2.4], [0, 0, 1], L3.phys("trimmer", { color: L3.C("#2f5fd0"), roughness: 0.4 })), caja(19.2, 20.8, 71.75, 72.25, H - 1.2, H - 1.0, M.blanco()));
    g.add(ledSmd(20, 77, "#25d45a").translateZ(H - 1.6));
    return { g, anclas, aCAD: new THREE.Matrix4().makeTranslation(0, 30, 0).multiply(RX90.clone()), nombre: "Mean Well LRS-50-5" };
  }

  // ================================================================ E07 · toma C14 con portafusibles, sin interruptor
  function tomaC14() {
    // marco natural: X = eje de los tornillos (36 mm), Y = enchufe (−) y cajón del fusible (+), Z = hacia fuera (cara en z = 0)
    const g = new THREE.Group();
    const brida = [[-22.35, -6], [-19, -16.55], [19, -16.55], [22.35, -6], [22.35, 6], [19, 16.55], [-19, 16.55], [-22.35, 6]];
    // hueco del C14: 24,5 × 16,5 con chaflanes en el lado de la tierra (−Y); atraviesa la cara y la brida hasta el cuerpo
    const hueco = [[-12.25, 1.6], [-12.25, -10.9], [-8.4, -14.9], [8.4, -14.9], [12.25, -10.9], [12.25, 1.6]];
    const b = extruir(brida, 3, M.negro(), { agujeros: [{ x: -18, y: 0, r: 1.65 }, { x: 18, y: 0, r: 1.65 }, hueco] }); b.position.z = -3; g.add(b);
    g.add(caja(-13.6, 13.6, -15.7, 15.7, -28, -3, M.negro(), 0.6));            // cuerpo 27,25 × 31,5 × 25
    const cara = extruir(rectR(-14.6, -16.2, 14.6, 16.2, 1.2), 1.2, M.negroMate(), { agujeros: [hueco] }); cara.position.z = -0.3; g.add(cara);
    g.add(caja(-12.3, 12.3, -15.0, 1.7, -3.05, -2.95, L3.phys("fondoC14", { color: L3.C("#0b0b0b"), roughness: 0.9 })));
    // los tres pines (cuchillas de 2 × 4) que asoman dentro del hueco
    for (const [x, y] of [[-7, -4.6], [7, -4.6], [0, -8.6]]) g.add(caja(x - 1, x + 1, y - 2, y + 2, -3, -0.6, M.niquel(), 0.2));
    // cajón del fusible con su símbolo
    g.add(caja(-11.5, 11.5, 3.2, 15.2, 0.8, 1.15, M.negroMate(), 0.4));
    const tF = texEtiqueta(23, 12, (g2, Wc, Hc, k) => {
      g2.strokeStyle = "#6c6c6c"; g2.lineWidth = 0.35 * k; const cx = Wc / 2, cy = 4.6 * k;
      g2.beginPath(); g2.roundRect ? g2.roundRect(cx - 5.5 * k, cy - 1.5 * k, 11 * k, 3 * k, 1.4 * k) : g2.rect(cx - 5.5 * k, cy - 1.5 * k, 11 * k, 3 * k); g2.stroke();
      g2.beginPath(); g2.moveTo(cx - 3.2 * k, cy); g2.lineTo(cx + 3.2 * k, cy); g2.stroke();
      g2.fillStyle = "#6c6c6c"; g2.font = `600 ${1.45 * k}px ${FUENTE}`; g2.textAlign = "center"; g2.fillText("USE ONLY WITH A 250V FUSE", cx, 9.6 * k);
    }, 24, null);
    g.add(decal(new THREE.MeshPhysicalMaterial({ map: tF, transparent: true, roughness: 0.7, polygonOffset: true, polygonOffsetFactor: -2 }), 23, 12, [0, 9.2, 1.16], [0, 0, 1], [1, 0, 0]));
    // lengüetas faston de 4,8 mm por detrás: L (con fusible), N y tierra
    const tab = (x, y, rot) => { const t = caja(-2.4, 2.4, -0.4, 0.4, -36, -27.5, M.estano()); t.position.x += x; t.position.y += y; t.rotation.z = rot; return t; };
    g.add(tab(-7, -4.6, 0), tab(7, -4.6, 0), tab(0, -11, Math.PI / 2), tab(0, 9.5, 0));
    g.add(caja(-8, 8, 8.6, 10.4, -28.5, -27.6, M.estano()));                   // puente al portafusibles
    const anclas = { F: anc([-7, -4.6, -35], [0, 0, -1]), N: anc([7, -4.6, -35], [0, 0, -1]), PE: anc([0, -11, -35], [0, 0, -1]), C13: anc([0, -6, 0.9], [0, 0, 1]) };
    return { g, anclas, aCAD: RX90.clone(), nombre: "Toma C14 con portafusibles" };
  }

  // ================================================================ E08 · WAGO 221-415 (29,9 × 18,6 × 8,3)
  function wago415() {
    const g = new THREE.Group();
    g.add(caja(0, 29.9, 0, 18.6, 0, 8.3, M.transparente(), 1.0));
    g.add(caja(0.6, 29.3, 1.2, 15.5, 1.6, 2.4, M.estano()));                    // barra de contacto
    const anclas = {};
    for (let i = 0; i < 5; i++) {
      const x = 3.0 + i * 5.98;
      g.add(caja(x - 2.2, x + 2.2, 4, 12, 2.4, 5.8, M.inox()));                 // muelle de apriete
      // palanca naranja, con el saliente para la uña en el extremo de atrás
      g.add(caja(x - 2.5, x + 2.5, 2.4, 18.4, 8.3, 9.4, M.naranjaWago(), 0.45));
      g.add(caja(x - 2.5, x + 2.5, 16.6, 18.9, 8.8, 10.6, M.naranjaWago(), 0.5));
      for (let r = 0; r < 3; r++) g.add(caja(x - 2.2, x + 2.2, 13.2 + r * 1.1, 13.6 + r * 1.1, 9.35, 9.6, M.naranjaWago()));
      g.add(cil(1.75, 0.6, [x, -0.05, 3.9], [0, 1, 0], new THREE.MeshPhysicalMaterial({ color: 0x9aa3a8, roughness: 0.2, transmission: 0.6, transparent: true })));
      anclas["p" + (i + 1)] = anc([x, -0.2, 3.9], [0, -1, 0]);
    }
    const tW = texEtiqueta(29.9, 8, (g2, Wc, Hc, k) => { g2.fillStyle = "#7a3f00"; g2.font = `700 ${2.0 * k}px ${FUENTE}`; g2.textAlign = "center"; g2.fillText("221-415", Wc / 2, 3 * k); g2.font = `500 ${1.3 * k}px ${FUENTE}`; g2.fillText("0.2-4mm²  32A 450V", Wc / 2, 6 * k); }, 20, null);
    g.add(decal(new THREE.MeshPhysicalMaterial({ map: tW, transparent: true, roughness: 0.5, polygonOffset: true, polygonOffsetFactor: -3 }), 29.9, 8, [14.95, 7.5, 9.42], [0, 0, 1], [1, 0, 0]));
    return { g, anclas, aCAD: ident(), nombre: "WAGO 221-415" };
  }
  // WAGO 221-412 (empalme de 2 vías: 13,1 × 18,6 × 8,3)
  function wago412() {
    const g = new THREE.Group();
    g.add(caja(0, 13.1, 0, 18.6, 0, 8.3, M.transparente(), 1.0), caja(0.6, 12.5, 1.2, 15.5, 1.6, 2.4, M.estano()));
    const anclas = {};
    for (let i = 0; i < 2; i++) {
      const x = 3.3 + i * 6.5;
      g.add(caja(x - 2.2, x + 2.2, 4, 12, 2.4, 5.8, M.inox()), caja(x - 2.5, x + 2.5, 2.4, 18.4, 8.3, 9.4, M.naranjaWago(), 0.45), caja(x - 2.5, x + 2.5, 16.6, 18.9, 8.8, 10.6, M.naranjaWago(), 0.5));
      anclas["p" + (i + 1)] = anc([x, -0.2, 3.9], [0, -1, 0]);
    }
    return { g, anclas, aCAD: ident(), nombre: "WAGO 221-412" };
  }

  // ================================================================ E09 · USB-A hembra a bornes de tornillo (50 × 21 × 12)
  function borneUSB() {
    const g = new THREE.Group();
    // boca USB-A hembra de chapa en x = 0
    g.add(manguito(-0.5, 14, 3.95, 17.05, 3.2, 8.8, 0.3, M.niquel(), M.negro(), -1));
    g.add(caja(0.5, 13, 5.0, 16.0, 5.7, 7.6, M.negro()));                       // lengüeta
    for (let i = 0; i < 4; i++) g.add(caja(1.2, 9, 6.2 + i * 2.5, 7.2 + i * 2.5, 5.62, 5.72, M.oro()));
    g.add(caja(14, 35, 1.0, 20.0, 0, 12, M.negro(), 1.2));                      // cuerpo moldeado negro
    // bloque de bornes enchufable verde (5 × 3,81 mm) con tornillos arriba y bocas en x = 50
    g.add(caja(34.5, 50, 0, 21, 0.5, 11.5, M.verdeBorne(), 0.5));
    const rot = ["S", "+", "D-", "D+", "-"], anclas = {};
    rot.forEach((nm, i) => {
      const y = 2.88 + i * 3.81;
      g.add(caja(36, 49, y - 1.75, y + 1.75, 11.5, 11.55, M.verdeBorne()));
      g.add(tornilloBorne([41.5, y, 11.2], [0, 0, 1], 1.35, 0.6));
      g.add(caja(49.95, 50.05, y - 1.4, y + 1.4, 3.0, 6.6, M.negroMate()));
      anclas[nm] = anc([50.2, y, 4.8], [1, 0, 0]);
    });
    const tB = texEtiqueta(18, 21, (g2, Wc, Hc, k) => { g2.fillStyle = "#e9e9e9"; g2.font = `700 ${2.2 * k}px ${FUENTE}`; g2.textAlign = "center"; g2.textBaseline = "middle";
      rot.forEach((nm, i) => g2.fillText(nm, Wc - 2.5 * k, Hc - (2.88 + i * 3.81) * k)); }, 20, null);
    g.add(decal(new THREE.MeshPhysicalMaterial({ map: tB, transparent: true, roughness: 0.6, polygonOffset: true, polygonOffsetFactor: -2 }), 18, 21, [25, 10.5, 12.02], [0, 0, 1], [1, 0, 0]));
    anclas.usb = anc([-0.6, 10.5, 6], [-1, 0, 0]);
    return { g, anclas, aCAD: ident(), nombre: "USB-A hembra a bornes" };
  }

  // ================================================================ E10 + E20 · portafusibles en línea para fusible MINI, con fusible
  function portafusible(op = {}) {
    // cuerpo 23,5 × 12,5 × 13 con tapa; manguitos de goma hacia los dos hilos de 16 AWG (por x)
    const g = new THREE.Group(), a = op.amperios || 3;
    const col = { 1: "#111111", 2: "#9ea2a6", 3: "#8a3fc0", 4: "#e58bb8", 5: "#c9a46a", 7.5: "#7a4a2a", 10: "#c3241e" }[a] || "#8a3fc0";
    g.add(caja(10.75, 34.25, 0.75, 13.25, 0, 9.2, M.negro(), 1.6));
    g.add(caja(11.5, 33.5, 1.25, 12.75, 9.2, 12.6, M.negroBrillo(), 1.8));      // tapa
    g.add(caja(33, 36.5, 5.0, 9.0, 5.5, 13.3, M.negroBrillo(), 0.8));          // correa de la tapa
    for (const [x0, x1, s] of [[0, 10.75, -1], [34.25, 45, 1]]) {
      g.add(torno([[1.7, 0], [3.0, 3.5], [4.2, 7.5], [4.2, 10.75]].map(([r, hh]) => [r, hh]), [s < 0 ? 0 : 45, 7, 4.6], [-s, 0, 0], M.negro(), 24));
    }
    // fusible MINI visible solo por la ranura de prueba
    g.add(caja(19.5, 25.5, 6.2, 7.8, 12.0, 12.62, L3.phys("fus" + a, { color: L3.C(col), roughness: 0.25, transmission: 0.4, transparent: true })));
    const anclas = { a: anc([-0.2, 7, 4.6], [-1, 0, 0]), b: anc([45.2, 7, 4.6], [1, 0, 0]) };
    return { g, anclas, aCAD: ident(), nombre: `Portafusibles MINI con fusible ${a} A`, color: col };
  }

  // ================================================================ E11 · Winsen ZE29A (85 × 33 × 18), según las fotos del anuncio
  // Origen: esquina inferior izquierda de la placa, cara de componentes en z = 0. J1 a la derecha; celda azul a la izquierda.
  const ZE = { tomaPresion: [18.5, 28.3, 7.4], tomaAlcohol: [-6.8, 13.0, 5.6], celda: [3.6, 14.3] };
  function ze29a() {
    const W = 85, H = 33, E = 1.6, AG = [[2.5, 2.5], [82.5, 2.5], [2.5, 30.5], [82.5, 30.5]];
    const t = texPlaca(W, H, { seed: 41, ppm: 12, pistas: 70, base: "#14a33c", pista: "#22b54c",
      zonas: [{ x: 26, y: 5, w: 46, h: 14 }, { x: 42, y: 20, w: 25, h: 13 }],
      textos: [{ t: "ZE29A-D1A-0W12065", x: 14, y: 31.6, s: 1.0, rot: 0 }, { t: "J1", x: 76.4, y: 21.3, s: 1.1, b: 1 }, { t: "Rx Tx GND 5V", x: 75.6, y: 11.6, s: 0.95, rot: 90, al: "center", b: 1 },
        { t: "U1", x: 13.2, y: 24.3, s: 1.0 }, { t: "Q4", x: 74.8, y: 19.0, s: 0.9 }, { t: "C3", x: 41, y: 31.4, s: 0.9 }, { t: "J4", x: 63.4, y: 2.0, s: 0.9 }],
      marcos: [{ x: 13.9, y: 24.5, w: 9.2, h: 7.6 }], agujeros: AG.map(a => [a[0], a[1], 1.9, 1.25]), anillo: "#f1f1ec" });
    alfaAgujeros(t, W, H, AG.map(a => [a[0], a[1], 1.25]));
    const g = grupo(placa(W, H, E, 0.6, AG.map(a => [a[0], a[1], 1.25]), L3.phys("pcbZE", { color: L3.C("#14a33c"), roughness: 0.36, clearcoat: 0.55, clearcoatRoughness: 0.2 }), t));
    // celda electroquímica azul (Ø16, con orejas) y su boquilla de muestra
    const [cx, cy] = ZE.celda;
    g.add(cil(8.0, 3.2, [cx, cy, 0], [0, 0, 1], M.azulCelda(), 36));
    g.add(cil(6.8, 7.6, [cx, cy, 3.2], [0, 0, 1], M.azulCelda(), 36), cil(6.5, 0.6, [cx, cy, 10.8], [0, 0, 1], L3.phys("azulCeldaO", { color: L3.C("#1a4fb8"), roughness: 0.35 }), 36));
    for (let i = 0; i < 4; i++) { const a = Math.PI / 4 + i * Math.PI / 2; g.add(caja(cx + Math.cos(a) * 7.5 - 1.6, cx + Math.cos(a) * 7.5 + 1.6, cy + Math.sin(a) * 7.5 - 1.6, cy + Math.sin(a) * 7.5 + 1.6, 0, 2.2, M.azulCelda(), 0.5)); }
    g.add(cil(1.1, 6.0, [cx - 4.4, 13.0, 5.6], [-1, 0, 0], L3.phys("boquillaZE", { color: L3.C("#2a6ae0"), roughness: 0.3 }), 18));
    // tubito transparente de la celda a la bomba y bomba de solenoide (cuerpo transparente con muelle + caja metálica)
    g.add(cable([[cx + 7, 12.2, 4.2], [18, 12.2, 4.2], [27, 12.2, 4.2]], 1.5, M.silicona()));
    g.add(cil(4.6, 10, [27, 12.2, 5.8], [1, 0, 0], M.transparenteMate(), 28), cil(5.4, 1.6, [30.5, 12.2, 5.8], [1, 0, 0], M.transparenteMate(), 28));
    for (let i = 0; i < 9; i++) g.add(cil(3.2, 0.35, [37.5 + i * 1.3, 12.2, 5.8], [1, 0, 0], M.inox(), 20));
    g.add(cil(1.4, 12, [37, 12.2, 5.8], [1, 0, 0], M.inox(), 16));
    g.add(caja(49.7, 71.3, 5.7, 18.7, 0, 12, L3.phys("solenoide", { color: L3.C("#c9ccd0"), metalness: 1, roughness: 0.32 }), 0.5));
    const tS = texEtiqueta(21.6, 13, (g2, Wc, Hc, k) => { g2.fillStyle = "#3d4247"; g2.font = `600 ${1.6 * k}px ${MONO}`; g2.textAlign = "center"; g2.fillText("SDO-0420L-06B16", Wc / 2, 6.4 * k); g2.fillText("1831078", Wc / 2, 9.2 * k); }, 20, null);
    g.add(decal(new THREE.MeshPhysicalMaterial({ map: tS, transparent: true, metalness: 1, roughness: 0.3, color: 0xc9ccd0, polygonOffset: true, polygonOffsetFactor: -2 }), 21.6, 13, [60.5, 12.2, 12.02], [0, 0, 1], [1, 0, 0]));
    // condensador electrolítico tumbado (Ø14 × 24,5), asoma 1,4 mm por arriba
    g.add(cil(7, 24.5, [42.5, 27.4, 7.2], [1, 0, 0], L3.phys("electro", { color: L3.C("#121315"), roughness: 0.35, clearcoat: 0.7 }), 36));
    g.add(cil(6.6, 0.4, [67.0, 27.4, 7.2], [1, 0, 0], M.aluminio(), 36));
    for (const yy of [24.5, 30.3]) g.add(caja(68, 72, yy - 0.3, yy + 0.3, 0, 0.6, M.estano()));
    // sensor de presión (DIP-6) con su boquilla de presión
    g.add(caja(14.4, 22.6, 24.8, 31.8, 0, 3.4, M.negro(), 0.3));
    for (let i = 0; i < 3; i++) for (const yy of [24.3, 32.3]) g.add(caja(15.6 + i * 2.54 - 0.3, 15.6 + i * 2.54 + 0.3, yy - 0.5, yy + 0.5, 0, 1.6, M.estano()));
    g.add(cil(1.3, 4.0, [18.5, 28.3, 3.4], [0, 0, 1], M.negro(), 24), cil(0.55, 0.05, [18.5, 28.3, 7.42], [0, 0, 1], M.grisOsc(), 16));
    // transistor TO-92
    g.add(torno([[0, 0], [2.3, 0], [2.3, 4.6], [0, 4.6]], [78.5, 22.2, 0], [0, 0, 1], M.negro(), 24));
    // J1: XH de 4 vías de entrada lateral (abre hacia +X, sobresale 0,7 mm del canto)
    g.add(caja(77.8, 85.7, 5.0, 17.4, 0, 6.0, M.marfil(), 0.3));
    for (let i = 0; i < 4; i++) {
      const y = 7.45 + i * 2.5;
      g.add(caja(81, 85.75, y - 1.0, y + 1.0, 1.4, 4.6, M.negroMate()), caja(80.8, 85.2, y - 0.32, y + 0.32, 2.7, 3.3, M.estano()));
    }
    g.add(smd([{ x: 4, y: 22, w: 8, h: 8 }, { x: 24, y: 22, w: 15, h: 8 }, { x: 70, y: 4, w: 6, h: 14 }], 26, 3));
    // pines de J1: 1 = 5V (arriba), 2 = GND, 3 = TX, 4 = RX (serigrafía «Rx Tx GND 5V» de abajo arriba)
    const anclas = { j1_1: anc([86, 14.95, 3], [1, 0, 0]), j1_2: anc([86, 12.45, 3], [1, 0, 0]), j1_3: anc([86, 9.95, 3], [1, 0, 0]), j1_4: anc([86, 7.45, 3], [1, 0, 0]),
      presion: anc([18.5, 28.3, 7.4], [0, 0, 1]), alcohol: anc([cx - 10.4, 13.0, 5.6], [-1, 0, 0]) };
    return { g, anclas, aCAD: RX90.clone(), nombre: "Winsen ZE29A" };
  }

  // ================================================================ E05 · adaptador Wi-Fi USB AR9271
  function wifiAR9271() {
    // natural: tumbado; x = largo (clavija en x = 0), y = ancho 22, z = grosor 11 (centrado)
    const g = new THREE.Group();
    g.add(manguito(0, 12.3, -6, 6, -2.25, 2.25, 0.3, M.niquel(), M.negro(), -1));
    g.add(caja(0.3, 11.7, -5.4, 5.4, -1.95, -0.25, M.blanco()));
    // cuerpo negro facetado (contorno metido 0,8 por el bisel)
    const perfil = [[12.8, -9.2], [20.6, -10.2], [79.6, -10.2], [83.2, -7.6], [83.2, 7.6], [79.6, 10.2], [20.6, 10.2], [12.8, 9.2]];
    const cuerpo = extruir(perfil, 11 - 1.6, M.negroBrillo(), { bisel: 0.8 }); cuerpo.position.z = -5.5 + 0.8; g.add(cuerpo);
    for (let i = 0; i < 6; i++) g.add(caja(28 + i * 8, 33 + i * 8, -11.85, -11.4, -1.5, 1.5, M.negroMate()));
    for (let i = 0; i < 5; i++) {   // relieve de rombos
      const x = 26 + i * 11; const r = new THREE.Mesh(new THREE.OctahedronGeometry(4.2, 0), M.negro()); r.scale.set(1.2, 1.6, 0.18); r.position.set(x, 0, 6.3); g.add(r);
    }
    // RP-SMA hembra dorado en x = 84
    g.add(cil(3.1, 9, [84, 0, 0], [1, 0, 0], M.oro(), 28), hexa(6.4, 2.2, [84.3, 0, 0], [1, 0, 0], M.oro()));
    for (let i = 0; i < 10; i++) g.add(cil(3.2, 0.3, [87 + i * 0.55, 0, 0], [1, 0, 0], M.oro(), 28));
    const anclas = { usb: anc([-0.2, 0, 0], [-1, 0, 0]), rpsma: anc([93.2, 0, 0], [1, 0, 0]) };
    // al CAD: grosor en Y local de comp.py, ancho en Z
    return { g, anclas, aCAD: RX90.clone(), nombre: "Adaptador Wi-Fi AR9271" };
  }

  // ---------------------------------------------------------------- registro
  // envoltorios para usar las clavijas y terminales como modelos sueltos (marco: X = hacia el cable, Y = S de la clavija)
  const O = [0, 0, 0], EX = [1, 0, 0], EY = [0, 1, 0];
  const suelto = (nombre, f) => (...a) => ({ g: f(...a), anclas: {}, aCAD: ident(), nombre });
  const REG = { raspberry, camara, pantalla, solo, fuente, toma_c14: tomaC14, wago_415: wago415, wago_412: wago412, borne_usb: borneUSB,
    portafusible, ze29a, wifi_ar9271: wifiAR9271, microsd: () => ({ g: microSD(), anclas: {}, aCAD: ident(), nombre: "microSD" }),
    clavija_hdmi90_pantalla: () => ({ g: clavijaHDMI90([-0.5, 25.5, -10.65], [-1, 0, 0], [0, 0, -1]), anclas: {}, aCAD: RX90.clone(), nombre: "Clavija HDMI acodada" }),
    clavija_usbc90_pantalla: () => ({ g: clavijaUSBC90([-0.5, 47, -9.35], [-1, 0, 0], [0, 0, -1]), anclas: {}, aCAD: RX90.clone(), nombre: "Clavija USB-C acodada" }),
    clavija_hdmi_recta: suelto("Clavija HDMI recta", () => clavijaHDMIrecta(O, EX, EY)),
    clavija_usba: suelto("Clavija USB-A", () => clavijaUSBA(O, EX, EY)),
    clavija_microusb: suelto("Clavija micro-USB", () => clavijaMicroUSB(O, EX, EY)),
    clavija_usbc90: suelto("Clavija USB-C acodada", () => clavijaUSBC90(O, EX, EY)),
    clavija_hdmi90: suelto("Clavija HDMI acodada", () => clavijaHDMI90(O, EX, EY)),
    clavija_xh: suelto("Clavija XH 4 vías", () => clavijaXH(O, EX, EY)),
    clavija_c13: suelto("Conector C13", () => clavijaC13(O, EX, EY)),
    clavija_schuko: () => ({ g: clavijaSchuko(O, EX, EY), anclas: { fin: { p: [42, 0, 0], d: [1, 0, 0] } }, aCAD: ident(), nombre: "Clavija Schuko" }),
    faston: suelto("Faston hembra aislado", (c) => faston(O, EX, EY, c)),
    faston_par: suelto("Faston hembra + macho", (c) => fastonPar(O, EX, EY, c)),
    puntera: suelto("Puntera", (c) => puntera(O, EX, EY, c)),
    ojal_m4: suelto("Terminal de ojal M4", () => ojalM4(O, EX, EY)),
    dupont: suelto("Alojamiento Dupont", (c) => dupont(O, EX, EY, c)),
    rpsma_macho: suelto("RP-SMA macho", () => rpsmaMacho(O, EX, EY)) };
  return { REG, ZE, clavijaHDMI90, clavijaUSBC90, clavijaUSBA, clavijaMicroUSB, clavijaHDMIrecta, clavijaC13, clavijaSchuko, clavijaXH, faston, fastonPar, puntera, ojalM4, dupont, rpsmaMacho,
           manguito, tornilloBorne, smd, chip, anc, texLCD, texSolo };
})();
