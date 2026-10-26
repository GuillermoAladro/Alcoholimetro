/* lib3d.js — utilidades para modelar componentes reales en milímetros (espacio CAD: X ancho, Y fondo, Z alto).
   Materiales PBR, texturas procedurales (serigrafía de placas, etiquetas, pantallas) y primitivas.
   Requiere three.js r147 (+ RoundedBoxGeometry y BufferGeometryUtils de examples/js). */
const L3 = (() => {
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const UP = V(0, 1, 0);

  // ------------------------------------------------------------------ números aleatorios repetibles
  function rng(seed) {
    let s = seed >>> 0 || 1;
    return () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) % 100000) / 100000; };
  }

  // ------------------------------------------------------------------ materiales
  const cache = {};
  function phys(key, o) {
    if (cache[key]) return cache[key];
    const m = new THREE.MeshPhysicalMaterial(Object.assign({ envMapIntensity: 0.8 }, o));
    m.userData.clave = key;
    cache[key] = m;
    return m;
  }
  const C = c => new THREE.Color(c).convertSRGBToLinear();
  const MAT = {
    pcb: () => phys("pcb", { color: C("#17703a"), roughness: 0.38, metalness: 0, clearcoat: 0.55, clearcoatRoughness: 0.25 }),
    pcbAzul: () => phys("pcbAzul", { color: C("#1c3f8a"), roughness: 0.38, clearcoat: 0.5, clearcoatRoughness: 0.25 }),
    pcbNegro: () => phys("pcbNegro", { color: C("#141716"), roughness: 0.45, clearcoat: 0.4, clearcoatRoughness: 0.3 }),
    canto: () => phys("canto", { color: C("#c9c08a"), roughness: 0.6 }),                      // canto de FR4
    oro: () => phys("oro", { color: C("#e0b354"), metalness: 1, roughness: 0.22 }),
    estano: () => phys("estano", { color: C("#d2d4d6"), metalness: 1, roughness: 0.32 }),
    niquel: () => phys("niquel", { color: C("#cfd1d4"), metalness: 1, roughness: 0.26 }),
    inox: () => phys("inox", { color: C("#c2c5c9"), metalness: 1, roughness: 0.3 }),
    inoxMate: () => phys("inoxMate", { color: C("#b6b9bd"), metalness: 1, roughness: 0.45 }),
    zinc: () => phys("zinc", { color: C("#c6ccd3"), metalness: 1, roughness: 0.38 }),
    galv: () => phys("galv", { color: C("#b9bec4"), metalness: 0.95, roughness: 0.42 }),
    aluminio: () => phys("aluminio", { color: C("#c9ccd0"), metalness: 1, roughness: 0.36 }),
    aluAnod: () => phys("aluAnod", { color: C("#5d6670"), metalness: 0.9, roughness: 0.38 }),
    laton: () => phys("laton", { color: C("#caa04a"), metalness: 1, roughness: 0.28 }),
    latonMate: () => phys("latonMate", { color: C("#b8913f"), metalness: 1, roughness: 0.42 }),
    cobre: () => phys("cobre", { color: C("#c47a45"), metalness: 1, roughness: 0.3 }),
    cromo: () => phys("cromo", { color: C("#e4e6e8"), metalness: 1, roughness: 0.12 }),
    negro: () => phys("negro", { color: C("#161618"), roughness: 0.55 }),
    negroBrillo: () => phys("negroBrillo", { color: C("#0f1011"), roughness: 0.22, clearcoat: 0.6, clearcoatRoughness: 0.15 }),
    negroMate: () => phys("negroMate", { color: C("#1c1d1f"), roughness: 0.8 }),
    grisOsc: () => phys("grisOsc", { color: C("#33363a"), roughness: 0.5 }),
    blanco: () => phys("blanco", { color: C("#f1f1ee"), roughness: 0.42, clearcoat: 0.2 }),
    marfil: () => phys("marfil", { color: C("#ece6d6"), roughness: 0.5 }),               // nailon de conectores XH / Dupont
    beige: () => phys("beige", { color: C("#e3d7bd"), roughness: 0.55 }),                // conectores FFC
    goma: () => phys("goma", { color: C("#191919"), roughness: 0.92 }),
    naranjaWago: () => phys("naranjaWago", { color: C("#f27b00"), roughness: 0.42, clearcoat: 0.2 }),
    verdeBorne: () => phys("verdeBorne", { color: C("#1f9a52"), roughness: 0.45 }),
    azulCelda: () => phys("azulCelda", { color: C("#1f5ed6"), roughness: 0.4, clearcoat: 0.25 }),
    transparente: () => phys("transparente", { color: C("#ffffff"), roughness: 0.06, transmission: 0.92, thickness: 2.0, ior: 1.58, transparent: true }),
    transparenteMate: () => phys("transparenteMate", { color: C("#f4f7f8"), roughness: 0.3, transmission: 0.8, thickness: 1.5, ior: 1.5, transparent: true }),
    silicona: () => phys("silicona", { color: C("#f3f5f2"), roughness: 0.32, transmission: 0.62, thickness: 1.2, ior: 1.41, transparent: true }),
    tope: () => phys("tope", { color: C("#eef3f4"), roughness: 0.18, transmission: 0.85, thickness: 3, ior: 1.5, transparent: true }),
    policarbonato: () => phys("policarbonato", { color: C("#fbfdff"), roughness: 0.02, transmission: 0.98, thickness: 5, ior: 1.586, transparent: true, side: THREE.DoubleSide, envMapIntensity: 0.35, specularIntensity: 0.6 }),
    vidrio: () => phys("vidrio", { color: C("#06080a"), roughness: 0.04, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.02 }),
    // cables
    pvcRojo: () => phys("pvcRojo", { color: C("#b0231c"), roughness: 0.38, clearcoat: 0.3 }),
    pvcNegro: () => phys("pvcNegro", { color: C("#141414"), roughness: 0.42, clearcoat: 0.3 }),
    pvcMarron: () => phys("pvcMarron", { color: C("#5b3a1f"), roughness: 0.42, clearcoat: 0.25 }),
    pvcAzul: () => phys("pvcAzul", { color: C("#1f56b5"), roughness: 0.42, clearcoat: 0.25 }),
    pvcAmarillo: () => phys("pvcAmarillo", { color: C("#e8c21c"), roughness: 0.42, clearcoat: 0.25 }),
    pvcBlanco: () => phys("pvcBlanco", { color: C("#ecebe6"), roughness: 0.42, clearcoat: 0.25 }),
    pvcGris: () => phys("pvcGris", { color: C("#3b3f45"), roughness: 0.5 }),
    rg316: () => phys("rg316", { color: C("#9b6a43"), roughness: 0.3, clearcoat: 0.5 }),
  };

  // ------------------------------------------------------------------ texturas de lienzo
  function lienzo(w, h) {
    const c = document.createElement("canvas"); c.width = w; c.height = h;
    return [c, c.getContext("2d")];
  }
  function tex(c, srgb = true, rep) {
    const t = new THREE.CanvasTexture(c);
    if (srgb) t.encoding = THREE.sRGBEncoding;
    t.anisotropy = 8;
    if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); }
    return t;
  }
  const FUENTE = '"Archivo","Helvetica Neue",Arial,sans-serif';
  const MONO = '"JetBrains Mono",Menlo,Consolas,monospace';

  /* Serigrafía y pistas de una placa: devuelve una textura del tamaño de la placa (mm → px).
     zonas: [{x,y,w,h}] huecos sin pistas (debajo de componentes grandes); textos: [{t,x,y,s,rot,al}];
     marcos: [{x,y,w,h}] contornos de serigrafía. Origen abajo a la izquierda, en mm. */
  function texPlaca(wmm, hmm, op = {}) {
    const k = op.ppm || 12, W = Math.round(wmm * k), H = Math.round(hmm * k);
    const [c, g] = lienzo(W, H);
    const R = rng(op.seed || 7);
    const base = op.base || "#17703a", pista = op.pista || "#1d7d40", seri = op.seri || "#f4f4ee";
    g.fillStyle = base; g.fillRect(0, 0, W, H);
    // ruido muy suave de la máscara
    for (let i = 0; i < W * H / 60; i++) { g.fillStyle = `rgba(255,255,255,${R() * 0.025})`; g.fillRect(R() * W, R() * H, 2, 2); }
    const X = x => x * k, Y = y => H - y * k;
    // pistas en 0/45/90 grados
    g.strokeStyle = pista; g.lineCap = "round"; g.lineJoin = "round";
    const npist = op.pistas ?? Math.round(wmm * hmm / 25);
    for (let i = 0; i < npist; i++) {
      let x = R() * wmm, y = R() * hmm;
      g.lineWidth = (R() < 0.8 ? 0.18 : 0.45) * k;
      g.beginPath(); g.moveTo(X(x), Y(y));
      const n = 2 + Math.floor(R() * 4);
      for (let j = 0; j < n; j++) {
        const a = Math.floor(R() * 8) * Math.PI / 4, L = 2 + R() * 12;
        x = Math.min(wmm - 1, Math.max(1, x + Math.cos(a) * L)); y = Math.min(hmm - 1, Math.max(1, y + Math.sin(a) * L));
        g.lineTo(X(x), Y(y));
      }
      g.stroke();
      // vía al final
      g.fillStyle = "#c9b98a"; g.beginPath(); g.arc(X(x), Y(y), 0.32 * k, 0, 7); g.fill();
      g.fillStyle = "#3a4a3e"; g.beginPath(); g.arc(X(x), Y(y), 0.14 * k, 0, 7); g.fill();
    }
    // planos de masa en los bordes
    if (op.plano) { g.fillStyle = pista; g.globalAlpha = 0.35; g.fillRect(0, 0, W, 2.2 * k); g.fillRect(0, H - 2.2 * k, W, 2.2 * k); g.globalAlpha = 1; }
    // huecos (debajo de piezas grandes la máscara queda lisa)
    for (const z of op.zonas || []) { g.fillStyle = base; g.fillRect(X(z.x), Y(z.y + z.h), z.w * k, z.h * k); }
    // contornos de serigrafía
    g.strokeStyle = seri; g.lineWidth = 0.15 * k;
    for (const m of op.marcos || []) g.strokeRect(X(m.x), Y(m.y + m.h), m.w * k, m.h * k);
    // islas de pads (componentes pasivos pequeños)
    for (const p of op.pads || []) { g.fillStyle = p.c || "#d7d9db"; g.fillRect(X(p.x), Y(p.y + p.h), p.w * k, p.h * k); }
    // textos
    for (const t of op.textos || []) {
      g.save(); g.translate(X(t.x), Y(t.y)); g.rotate(-(t.rot || 0) * Math.PI / 180);
      g.fillStyle = t.c || seri; g.font = `${t.b ? 700 : 500} ${(t.s || 1.2) * k}px ${t.mono ? MONO : FUENTE}`;
      g.textAlign = t.al || "left"; g.textBaseline = "middle"; g.fillText(t.t, 0, 0); g.restore();
    }
    // agujeros de montaje (anillo dorado)
    for (const a of op.agujeros || []) {
      g.fillStyle = op.anillo || "#d9b45a"; g.beginPath(); g.arc(X(a[0]), Y(a[1]), (a[2] || 3) * k, 0, 7); g.fill();
      g.fillStyle = "#20231f"; g.beginPath(); g.arc(X(a[0]), Y(a[1]), (a[3] || 1.375) * k, 0, 7); g.fill();
    }
    return tex(c);
  }

  // etiqueta rectangular (adhesivo, serigrafía de carcasa, rótulos)
  function texEtiqueta(wmm, hmm, dibujar, ppm = 14, fondo = "#ffffff") {
    const W = Math.round(wmm * ppm), H = Math.round(hmm * ppm);
    const [c, g] = lienzo(W, H);
    if (fondo) { g.fillStyle = fondo; g.fillRect(0, 0, W, H); }
    dibujar(g, W, H, ppm);
    return tex(c);
  }

  // patrón de nido de abeja (perforado de chapa): textura alfa (blanco = chapa, negro = agujero)
  function texPanal(wmm, hmm, paso = 6.2, dhueco = 5.2, ppm = 8, margen = 4) {
    const W = Math.round(wmm * ppm), H = Math.round(hmm * ppm);
    const [c, g] = lienzo(W, H);
    g.fillStyle = "#fff"; g.fillRect(0, 0, W, H);
    g.fillStyle = "#000";
    const dy = paso * Math.sqrt(3) / 2;
    for (let j = 0, y = margen + dhueco / 2; y < hmm - margen - dhueco / 2 + 0.01; j++, y += dy) {
      for (let x = margen + dhueco / 2 + (j % 2 ? paso / 2 : 0); x < wmm - margen - dhueco / 2 + 0.01; x += paso) {
        g.beginPath();
        for (let a = 0; a < 6; a++) {
          const t = Math.PI / 6 + a * Math.PI / 3, r = dhueco / 2 / Math.cos(Math.PI / 6);
          const px = (x + Math.cos(t) * r) * ppm, py = (y + Math.sin(t) * r) * ppm;
          a ? g.lineTo(px, py) : g.moveTo(px, py);
        }
        g.closePath(); g.fill();
      }
    }
    const t = tex(c, false); return t;
  }

  // rayas para cables (verde-amarillo, malla trenzada…): textura que se repite a lo largo del cable
  function texRayas(c1, c2, ancho = 0.5) {
    const [c, g] = lienzo(64, 64);
    g.fillStyle = c1; g.fillRect(0, 0, 64, 64);
    g.fillStyle = c2;
    g.beginPath(); g.moveTo(0, 0); g.lineTo(64 * ancho, 0); g.lineTo(64, 64 * (1 - ancho)); g.lineTo(64, 64); g.lineTo(64 * (1 - ancho), 64); g.lineTo(0, 64 * ancho); g.closePath(); g.fill();
    const t = tex(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
  }
  function texTrenzado(base = "#5a5f66", hilo = "#8b9097") {
    const [c, g] = lienzo(64, 64);
    g.fillStyle = base; g.fillRect(0, 0, 64, 64);
    for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) {
      g.fillStyle = (i + j) % 2 ? hilo : base;
      g.save(); g.translate(i * 8 + 4, j * 8 + 4); g.rotate(((i + j) % 2 ? 1 : -1) * Math.PI / 4);
      g.fillRect(-5, -2, 10, 4); g.restore();
    }
    const t = tex(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
  }

  // ------------------------------------------------------------------ primitivas (coordenadas CAD, mm)
  function caja(x0, x1, y0, y1, z0, z1, mat, r = 0, seg = 2) {
    const w = x1 - x0, h = y1 - y0, d = z1 - z0;
    let geo;
    if (r > 0) {
      const rr = Math.min(r, w / 2 - 1e-3, h / 2 - 1e-3, d / 2 - 1e-3);
      geo = new THREE.RoundedBoxGeometry(w, h, d, seg, Math.max(rr, 0.01));
    } else geo = new THREE.BoxGeometry(w, h, d);
    const m = new THREE.Mesh(geo, mat);
    m.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
    return m;
  }
  // cilindro con la base en p y eje d; r2 = radio del extremo final (cono si difiere)
  function cil(r, h, p, d, mat, seg = 28, r2 = null, abierto = false) {
    const geo = new THREE.CylinderGeometry(r2 ?? r, r, h, seg, 1, abierto);
    geo.translate(0, h / 2, 0);
    const m = new THREE.Mesh(geo, mat);
    m.quaternion.setFromUnitVectors(UP, V(...d).normalize());
    m.position.set(...p);
    return m;
  }
  // perfil de revolución: pts [[r, h], ...] alrededor del eje d desde p
  function torno(pts, p, d, mat, seg = 32) {
    const geo = new THREE.LatheGeometry(pts.map(q => new THREE.Vector2(q[0], q[1])), seg);
    const m = new THREE.Mesh(geo, mat);
    m.quaternion.setFromUnitVectors(UP, V(...d).normalize());
    m.position.set(...p);
    return m;
  }
  // prisma hexagonal (tuercas, separadores): entre caras planas s, alto h
  function hexa(s, h, p, d, mat, agujero = 0) {
    const r = s / 2 / Math.cos(Math.PI / 6);
    let geo;
    if (agujero > 0) {
      const sh = new THREE.Shape();
      for (let a = 0; a < 6; a++) { const t = a * Math.PI / 3; a ? sh.lineTo(Math.cos(t) * r, Math.sin(t) * r) : sh.moveTo(Math.cos(t) * r, Math.sin(t) * r); }
      const ho = new THREE.Path(); ho.absarc(0, 0, agujero, 0, Math.PI * 2, true); sh.holes.push(ho);
      geo = new THREE.ExtrudeGeometry(sh, { depth: h, bevelEnabled: true, bevelSize: Math.min(0.25, s * 0.03), bevelThickness: Math.min(0.25, h * 0.05), bevelSegments: 1, curveSegments: 16 });
      geo.rotateX(-Math.PI / 2);                 // extrusión en +Y
    } else {
      geo = new THREE.CylinderGeometry(r, r, h, 6); geo.translate(0, h / 2, 0);
    }
    const m = new THREE.Mesh(geo, mat);
    m.quaternion.setFromUnitVectors(UP, V(...d).normalize());
    m.position.set(...p);
    return m;
  }
  // extrusión de un contorno 2D (en el plano XY local) a lo largo de +Z local, luego colocado
  function extruir(contorno, prof, mat, op = {}) {
    const sh = new THREE.Shape(contorno.map(q => new THREE.Vector2(q[0], q[1])));
    for (const h of op.agujeros || []) {
      const pa = new THREE.Path();
      if (h.r) pa.absarc(h.x, h.y, h.r, 0, Math.PI * 2, true);
      else { pa.moveTo(h[0][0], h[0][1]); for (const q of h.slice(1)) pa.lineTo(q[0], q[1]); }
      sh.holes.push(pa);
    }
    const geo = new THREE.ExtrudeGeometry(sh, { depth: prof, bevelEnabled: !!op.bisel, bevelSize: op.bisel || 0, bevelThickness: op.bisel || 0, bevelSegments: 2, curveSegments: op.curvas || 18 });
    return new THREE.Mesh(geo, mat);
  }
  // rectángulo redondeado como contorno
  function rectR(x0, y0, x1, y1, r, n = 6) {
    const pts = [];
    const esq = [[x1 - r, y0 + r, -90], [x1 - r, y1 - r, 0], [x0 + r, y1 - r, 90], [x0 + r, y0 + r, 180]];
    for (const [cx, cy, a0] of esq) for (let i = 0; i <= n; i++) {
      const a = (a0 + 90 * i / n) * Math.PI / 180; pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
    }
    return pts;
  }
  // plano con textura (decal) en el plano de una cara: centro c, normal n, eje u (ancho) — mm
  function decal(texOMat, w, h, c, n, u, op = {}) {
    const mat = texOMat.isMaterial ? texOMat : new THREE.MeshPhysicalMaterial({ map: texOMat, roughness: op.rough ?? 0.5, metalness: op.metal ?? 0,
      transparent: !!op.transp, alphaTest: op.alphaTest || 0, clearcoat: op.clearcoat || 0, polygonOffset: true, polygonOffsetFactor: -2 });
    const geo = new THREE.PlaneGeometry(w, h);
    const m = new THREE.Mesh(geo, mat);
    const N = V(...n).normalize(), U = V(...u).normalize(), W = new THREE.Vector3().crossVectors(N, U);
    m.matrix.makeBasis(U, W, N); m.matrix.setPosition(V(...c)); m.matrix.decompose(m.position, m.quaternion, m.scale);
    return m;
  }
  // tubo (cable) por puntos
  function cable(pts, r, mat, op = {}) {
    const curva = new THREE.CatmullRomCurve3(pts.map(p => p.isVector3 ? p : V(...p)), false, op.tipo || "centripetal", op.tension ?? 0.5);
    const L = curva.getLength();
    const geo = new THREE.TubeGeometry(curva, Math.max(12, Math.round(L / (op.paso || 2.5))), r, op.lados || 12, false);
    if (op.rep) { const uv = geo.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setX(i, uv.getX(i) * L / op.rep); }
    const m = new THREE.Mesh(geo, mat); m.userData.curva = curva; m.userData.L = L;
    return m;
  }
  // cinta plana (FFC) por puntos con la normal "arriba" n
  function cinta(pts, ancho, esp, mat, n = [0, 0, 1], n1 = null) {
    const curva = new THREE.CatmullRomCurve3(pts.map(p => p.isVector3 ? p : V(...p)), false, "centripetal");
    const N = Math.max(24, Math.round(curva.getLength() / 2));
    const pos = [], idx = [], uvs = [];
    const nA = V(...n).normalize(), nB = n1 ? V(...n1).normalize() : nA;
    let prevSide = null;
    for (let i = 0; i <= N; i++) {
      const t = i / N, p = curva.getPointAt(t), tg = curva.getTangentAt(t);
      const s = t * t * (3 - 2 * t);
      const nUp = nA.clone().multiplyScalar(1 - s).addScaledVector(nB, s).normalize();
      let side = new THREE.Vector3().crossVectors(tg, nUp);
      if (side.lengthSq() < 1e-6) side = prevSide ? prevSide.clone() : V(1, 0, 0);
      side.normalize(); if (prevSide && side.dot(prevSide) < 0) side.negate(); prevSide = side;
      const up = new THREE.Vector3().crossVectors(side, tg).normalize();
      for (const [a, b] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
        const q = p.clone().addScaledVector(side, a * ancho / 2).addScaledVector(up, b * esp / 2);
        pos.push(q.x, q.y, q.z); uvs.push(t, (a + 1) / 2);
      }
    }
    for (let i = 0; i < N; i++) for (let f = 0; f < 4; f++) {
      const a = i * 4 + f, b = i * 4 + (f + 1) % 4, c2 = a + 4, d = b + 4;
      idx.push(a, b, d, a, d, c2);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    g.setIndex(idx); g.computeVertexNormals();
    return new THREE.Mesh(g, mat);
  }

  // ------------------------------------------------------------------ grupos
  function grupo(...hijos) { const g = new THREE.Group(); hijos.flat().forEach(h => h && g.add(h)); return g; }
  // matriz de colocación con ejes (como geo.place en Python)
  function matriz(ex = [1, 0, 0], ey = [0, 1, 0], ez = [0, 0, 1], at = [0, 0, 0]) {
    const m = new THREE.Matrix4();
    m.set(ex[0], ey[0], ez[0], at[0], ex[1], ey[1], ez[1], at[1], ex[2], ey[2], ez[2], at[2], 0, 0, 0, 1);
    return m;
  }
  function colocar(obj, tf) {
    const m = tf.isMatrix4 ? tf : matriz(tf.ex, tf.ey, tf.ez, tf.at);
    obj.matrixAutoUpdate = false; obj.matrix.copy(m).multiply(obj.matrix); obj.updateMatrixWorld(true);
    return obj;
  }
  // natural (sobre la mesa, Z arriba) → convenio de comp.py (placa en XZ, componentes hacia −Y)
  const RX90 = new THREE.Matrix4().makeRotationX(Math.PI / 2);

  /* Junta en una malla por material todas las mallas sin textura propia de un grupo (menos llamadas de dibujo).
     Las mallas con map (decals, pantallas) se dejan sueltas. */
  function compactar(raiz) {
    raiz.updateMatrixWorld(true);
    const inv = new THREE.Matrix4().copy(raiz.matrixWorld).invert();
    const porMat = new Map(), sueltas = [];
    raiz.traverse(o => {
      if (!o.isMesh) return;
      if (o.isInstancedMesh || o.material.map || o.material.alphaMap || o.material.emissiveMap || o.userData.suelta || o.material.transmission > 0) { sueltas.push(o); return; }
      const g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone();
      for (const k of Object.keys(g.attributes)) if (!["position", "normal", "uv"].includes(k)) g.deleteAttribute(k);
      if (!g.attributes.uv) g.setAttribute("uv", new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
      if (!g.attributes.normal) g.computeVertexNormals();
      g.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv, o.matrixWorld));
      const k = o.material.uuid;
      if (!porMat.has(k)) porMat.set(k, { mat: o.material, geos: [] });
      porMat.get(k).geos.push(g);
    });
    const out = new THREE.Group();
    out.matrixAutoUpdate = raiz.matrixAutoUpdate; out.matrix.copy(raiz.matrix); out.position.copy(raiz.position); out.quaternion.copy(raiz.quaternion);
    out.userData = raiz.userData;
    for (const { mat, geos } of porMat.values()) {
      const g = THREE.BufferGeometryUtils.mergeBufferGeometries(geos, false);
      if (g) out.add(new THREE.Mesh(g, mat));
    }
    for (const o of sueltas) {
      const c = o.clone(); c.matrixAutoUpdate = false;
      c.matrix.multiplyMatrices(inv, o.matrixWorld); out.add(c);
    }
    return out;
  }

  return { V, rng, MAT, phys, C, lienzo, tex, texPlaca, texEtiqueta, texPanal, texRayas, texTrenzado, FUENTE, MONO,
           caja, cil, torno, hexa, extruir, rectR, decal, cable, cinta, grupo, matriz, colocar, RX90, compactar };
})();
