/* modelos_herr.js — herrajes, neumática y antena, en el mismo marco local que comp.py / diseno.py (aCAD = identidad). */
const HERR = (() => {
  const { V, MAT, caja, cil, torno, hexa, extruir, rectR, decal, cable, grupo, texEtiqueta, FUENTE } = L3;
  const M = MAT;
  const ident = () => new THREE.Matrix4();
  const UPZ = V(0, 0, 1);
  // orienta un grupo construido a lo largo de +Z para que su eje quede en d (origen fijo)
  function orientar(g, d) { const q = new THREE.Quaternion().setFromUnitVectors(UPZ, V(...d).normalize()); const w = new THREE.Group(); g.quaternion.copy(q); w.add(g); return w; }
  // rosca: anillos finos a lo largo de +Z
  function rosca(r, z0, z1, mat, paso = 0.7) {
    const g = new THREE.Group();
    g.add(cil(r * 0.86, z1 - z0, [0, 0, z0], [0, 0, 1], mat, 18));
    const n = Math.floor((z1 - z0) / paso);
    const geo = new THREE.TorusGeometry(r * 0.9, r * 0.12, 6, 18);
    const im = new THREE.InstancedMesh(geo, mat, Math.max(1, n)), m4 = new THREE.Matrix4();
    for (let i = 0; i < n; i++) { m4.makeTranslation(0, 0, z0 + paso / 2 + i * paso); im.setMatrixAt(i, m4); }
    g.add(im);
    return g;
  }

  // ---------------------------------------------------------------- H01 silentblock M4 10 × 10 macho-macho
  function silentblock() {
    const g = new THREE.Group();
    g.add(torno([[0, 0], [4.7, 0], [5, 0.4], [5, 9.6], [4.7, 10], [0, 10]], [0, 0, 0], [0, 0, 1], M.goma(), 32));
    for (const z of [0, 9.6]) g.add(cil(4.4, 0.45, [0, 0, z - (z ? 0 : 0.05)], [0, 0, 1], M.zinc(), 28));
    g.add(grupo(rosca(2, -10, 0, M.zinc())), grupo(rosca(2, 10, 18, M.zinc())));
    return { g, aCAD: ident(), nombre: "Silentblock M4" };
  }
  // ---------------------------------------------------------------- H02 tope adhesivo transparente Ø10 × 3 (semiesférico)
  function tope(d = [0, 1, 0], e = 3.0) {
    const g = new THREE.Group();
    const pts = [[0, 0]]; for (let i = 0; i <= 10; i++) { const a = i / 10 * Math.PI / 2; pts.push([Math.max(0.001, Math.cos(a) * 5), Math.sin(a) * 3]); }
    g.add(torno(pts, [0, 0, 0], [0, 0, 1], M.tope(), 32));
    if (e > 3) g.add(torno(pts, [0, 0, 3], [0, 0, 1], M.tope(), 32));
    return { g: orientar(g, d), aCAD: ident(), nombre: "Tope de goma" };
  }
  // ---------------------------------------------------------------- H03 cerradura de leva 16 mm (cromada) con su leva
  function cerradura(eje = [0, 1, 0], largoLeva = 32, leva = [0, 0, -1]) {
    const E = V(...eje).normalize(), Lv = V(...leva).normalize(), Q = new THREE.Vector3().crossVectors(Lv, E);
    const g = new THREE.Group();          // construida a lo largo de +Z (= eje), leva hacia +X
    g.add(torno([[0, -2.6], [5.6, -2.6], [9.2, -2.2], [10.4, -1.2], [10.5, 0], [0, 0]], [0, 0, 0], [0, 0, 1], M.cromo(), 40));
    g.add(cil(5.9, 0.4, [0, 0, -2.75], [0, 0, 1], M.laton(), 32));
    g.add(caja(-0.9, 0.9, -3.8, 3.8, -2.9, -2.4, M.negro()));
    g.add(grupo(rosca(8.0, 0, 16, M.cromo(), 1.0)));
    const tu = hexa(19, 3, [0, 0, 4.5], [0, 0, 1], M.cromo(), 8.2); g.add(tu);
    g.add(cil(3.2, 2, [0, 0, 16], [0, 0, 1], M.cromo(), 6));
    g.add(caja(-6, largoLeva - 6, -6, 6, 16, 18, M.inox(), 1.0));
    g.add(hexa(7, 2.6, [0, 0, 18], [0, 0, 1], M.inox(), 2.2));
    const m = new THREE.Matrix4().makeBasis(Lv, Q, E);
    const w = new THREE.Group(); g.applyMatrix4(m); w.add(g);
    return { g: w, aCAD: ident(), nombre: "Cerradura de leva 16 mm" };
  }
  // ---------------------------------------------------------------- H06 / H07 espárrago soldable M4 con brida (inox)
  function esparrago(L = 20, d = [0, 1, 0]) {
    const g = grupo(cil(2.8, 0.9, [0, 0, 0], [0, 0, 1], M.inox(), 24), rosca(2, 0.9, L, M.inox()));
    g.add(cil(0.55, 0.7, [0, 0, -0.7], [0, 0, 1], M.inox(), 10));
    return { g: orientar(g, d), aCAD: ident(), nombre: "Espárrago M4" };
  }
  // ---------------------------------------------------------------- H08 / H09 separador hexagonal de nailon negro
  function separador(L = 6, d = [0, 1, 0], r = 3.5) {
    const s = Math.min(5.0, r * 2 * 0.866);
    const g = grupo(hexa(s, L, [0, 0, 0], [0, 0, 1], M.negro(), Math.min(1.35, s * 0.28)));
    return { g: orientar(g, d), aCAD: ident(), nombre: "Separador de nailon" };
  }
  // ---------------------------------------------------------------- H10 pasacables de goma (con garganta)
  function pasacables(ri = 4.5, re = 7.5, d = [0, 1, 0]) {
    const pts = [[ri, -2.6], [re, -2.6], [re, -1.6], [ri + 1.1, -0.9], [ri + 1.1, 0.9], [re, 1.6], [re, 2.6], [ri, 2.6], [ri, -2.6]];
    const g = grupo(torno(pts, [0, 0, 0], [0, 0, 1], M.goma(), 32));
    return { g: orientar(g, d), aCAD: ident(), nombre: "Pasacables de goma" };
  }
  // ---------------------------------------------------------------- H17 tornillo de seguridad Torx con pin, M4 × 16 avellanado (inox)
  function torx(L = 16, d = [0, 1, 0]) {
    const g = new THREE.Group();
    g.add(torno([[0, 0], [4.0, 0], [4.0, 0.15], [2.0, 2.15], [0, 2.15]], [0, 0, 0], [0, 0, 1], M.inox(), 36));
    g.add(rosca(2, 2.1, L, M.inox()));
    // huella Torx con pin central
    const sh = new THREE.Shape();
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2, r = i % 2 ? 1.2 : 1.9; i ? sh.lineTo(Math.cos(a) * r, Math.sin(a) * r) : sh.moveTo(Math.cos(a) * r, Math.sin(a) * r); }
    const hu = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.05, bevelEnabled: false }), M.negroMate()); hu.position.z = -0.03; g.add(hu);
    g.add(cil(0.45, 0.2, [0, 0, -0.18], [0, 0, 1], M.inox(), 12));
    return { g: orientar(g, d), aCAD: ident(), nombre: "Tornillo Torx de seguridad" };
  }
  // ---------------------------------------------------------------- H12 tuerca M4 (7 mm entre caras, 3,2 mm)
  function tuerca(d = [0, 1, 0]) {
    const g = grupo(hexa(7, 3.2, [0, 0, 0], [0, 0, 1], M.inox(), 2.0));
    return { g: orientar(g, d), aCAD: ident(), nombre: "Tuerca M4" };
  }
  // ---------------------------------------------------------------- H18 candado de latón 30 mm con arco de acero
  function candado(xh, yh, z0, z1) {
    const zc = z0 - 4.0, zp = z1 + 6.0, xo = xh - 20.0;
    const g = new THREE.Group();
    // cuerpo: 30 × 15 × 30 con cantos redondeados y la cara del bombín abajo
    const cu = caja(xh - 25, xh + 5, yh - 7.5, yh + 7.5, zc - 30, zc, M.laton(), 2.2); g.add(cu);
    g.add(cil(4.6, 0.6, [xh - 10, yh, zc - 30.1], [0, 0, -1], M.latonMate(), 28), caja(xh - 10.5, xh - 9.5, yh - 3, yh + 3, zc - 30.8, zc - 30.4, M.negro()));
    // arco Ø5
    const pts = [];
    pts.push([xo, yh, zc - 0.5], [xo, yh, zp - 6]);
    for (let i = 0; i <= 12; i++) { const a = Math.PI - i / 12 * Math.PI; pts.push([(xh + xo) / 2 + Math.cos(a) * 10, yh, zp - 6 + Math.sin(a) * 8.5]); }
    pts.push([xh, yh, zp - 6], [xh, yh, zc - 0.5]);
    g.add(cable(pts, 2.5, M.cromo(), { tipo: "catmullrom", tension: 0.1, lados: 16 }));
    return { g, aCAD: ident(), nombre: "Candado de latón 30 mm" };
  }
  // ---------------------------------------------------------------- E12 pasamuros RP-SMA (alargo RG316) con la antena girada hacia abajo
  // origen: cara exterior de la chapa; +Y local hacia dentro; la antena queda fuera (−Y) y cuelga hacia −Z
  function pasamurosAntena() {
    const g = new THREE.Group();
    g.add(hexa(8, 2.4, [0, -2.4, 0], [0, 1, 0], M.oro(), 3.4), cil(3.25, 14, [0, -1.5, 0], [0, 1, 0], M.oro(), 28));
    g.add(hexa(8, 2.4, [0, 3.0, 0], [0, 1, 0], M.oro(), 3.4), cil(4.6, 0.6, [0, 2.3, 0], [0, 1, 0], M.oro(), 28));
    g.add(cil(3.0, 6, [0, 12.5, 0], [0, 1, 0], M.oro(), 24, 2.4), cil(1.5, 8, [0, 18, 0], [0, 1, 0], M.rg316(), 14));
    // antena: rótula negra con tuerca moleteada dorada, codo, varilla de goma con capuchón
    g.add(cil(4.1, 4.2, [0, -2.4, 0], [0, -1, 0], M.oro(), 28));
    for (let i = 0; i < 12; i++) g.add(cil(4.25, 0.25, [0, -2.7 - i * 0.32, 0], [0, -1, 0], M.oro(), 28));
    g.add(cil(4.5, 9.5, [0, -6.6, 0], [0, -1, 0], M.negroMate(), 28, 4.3));
    g.add(new THREE.Mesh(new THREE.SphereGeometry(4.7, 28, 18), M.negroMate()).translateY(-14).translateZ(0));
    g.add(cil(4.4, 2.0, [0, -14, -3.4], [0, 0, -1], M.negroMate(), 28));
    g.add(torno([[0, 0], [4.9, 0], [5.0, 4], [5.0, 85], [4.6, 90], [3.5, 93.5], [0, 94.5]], [0, -14, -5.4], [0, 0, -1], M.goma(), 32));
    for (let i = 0; i < 3; i++) g.add(cil(5.08, 0.6, [0, -14, -12 - i * 1.4], [0, 0, -1], M.negroMate(), 32));
    const anclas = { coax: { p: [0, 26, 0], d: [0, 1, 0] } };
    return { g, anclas, aCAD: ident(), nombre: "Alargo RP-SMA con antena 2 dBi" };
  }
  // ---------------------------------------------------------------- E14 racor en T para tubo de 6 mm (PP translúcido)
  // centro en el origen; paso por ±X, derivación por +Z
  function te6() {
    const g = new THREE.Group();
    const espiga = (d) => {
      const pts = [[0, 0], [3.6, 0], [3.6, 3], [3.1, 3.2], [3.5, 6.5], [2.9, 6.7], [3.3, 9.5], [2.6, 10], [2.2, 10], [2.2, 0]];
      return torno(pts, [d[0] * 4, d[1] * 4, d[2] * 4], d, M.transparenteMate(), 24);
    };
    g.add(caja(-4.2, 4.2, -4.2, 4.2, -4.2, 4.2, M.transparenteMate(), 1.6));
    g.add(espiga([1, 0, 0]), espiga([-1, 0, 0]), espiga([0, 0, 1]));
    const anclas = { a: { p: [-14, 0, 0], d: [-1, 0, 0] }, b: { p: [14, 0, 0], d: [1, 0, 0] }, c: { p: [0, 0, 14], d: [0, 0, 1] } };
    return { g, anclas, aCAD: ident(), nombre: "Racor en T de 6 mm" };
  }
  // ---------------------------------------------------------------- E15 reductor de latón 6 → 4 mm (espigas a los dos lados y collar)
  // a lo largo de +X: espiga de 6 mm de x = 0 a 16, collar de 16 a 22, espiga de 4 mm de 22 a 40
  function reductor() {
    const g = new THREE.Group();
    const p6 = [[0, 0], [2.4, 0], [3.4, 1.2], [2.9, 4.5], [3.4, 5.5], [2.9, 9], [3.4, 10], [3.0, 16], [0, 16]];
    const p4 = [[0, 0], [2.6, 0], [2.2, 6], [2.5, 7], [2.0, 11], [2.5, 12], [1.6, 18], [0, 18]];
    g.add(torno(p6, [0, 0, 0], [1, 0, 0], M.laton(), 28), hexa(10, 6, [16, 0, 0], [1, 0, 0], M.laton(), 1.6), torno(p4, [22, 0, 0], [1, 0, 0], M.laton(), 28));
    const anclas = { r6: { p: [0, 0, 0], d: [-1, 0, 0] }, r4: { p: [40, 0, 0], d: [1, 0, 0] } };
    return { g, anclas, aCAD: ident(), nombre: "Reductor de latón 6 → 4 mm" };
  }
  // tramo de tubo de silicona de 4 mm (propuesta para la barrera) — lo dibuja el cableado
  // ---------------------------------------------------------------- boquilla del panel (pasacables + tubo)
  const REG = { silentblock, tope_goma: tope, cerradura_leva: cerradura, esparrago_m4: esparrago, separador, arandela_pasacables: pasacables,
    torx_m4: torx, tuerca_m4: tuerca, candado_30: candado, pasamuros_antena: pasamurosAntena, te_6mm: te6, reductor_6_4: reductor };
  return { REG, rosca, orientar };
})();
