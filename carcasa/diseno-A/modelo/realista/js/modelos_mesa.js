/* modelos_mesa.js — piezas auxiliares para la vista de conexiones sobre la mesa (trozos de chapa con su espárrago, boquilla…).
   Marco natural: Z arriba, mm. */
const MESA = (() => {
  const { V, MAT, caja, cil, torno, hexa, grupo, extruir, rectR, decal, texEtiqueta, FUENTE } = L3;
  const M = MAT;
  const ident = () => new THREE.Matrix4();
  // trozo de chapa DC01 con un espárrago M4 soldado (hacia +Z) y sitio para 3 ojales; anclas o1..o3 = centro de cada ojal
  function chapaTierra(L = 20, rotulo = "") {
    const g = new THREE.Group(), acero = L3.phys("chapaMesa", { color: L3.C("#8f959b"), metalness: 0.82, roughness: 0.45 });
    g.add(caja(-30, 30, -22, 22, 0, 1.5, acero, 0.6));
    const e = HERR.REG.esparrago_m4(L, [0, 0, 1]).g; e.position.z = 1.5; g.add(e);
    if (rotulo) {
      const t = texEtiqueta(56, 9, (c, W, H, k) => { c.fillStyle = "#e9edf0"; c.font = `600 ${3.4 * k}px ${FUENTE}`; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(rotulo, W / 2, H / 2); }, 16, null);
      g.add(decal(new THREE.MeshPhysicalMaterial({ map: t, transparent: true, roughness: 0.6, polygonOffset: true, polygonOffsetFactor: -2 }), 56, 9, [0, -15.5, 1.52], [0, 0, 1], [1, 0, 0]));
    }
    const anclas = {};
    [2.4, 8.0, 9.0].forEach((z, i) => { anclas["o" + (i + 1)] = { p: [0, 0, 1.5 + z], d: [0, 0, 1] }; });
    return { g, anclas, aCAD: ident(), nombre: "Chapa con espárrago de tierra" };
  }
  // boquilla del panel: trozo de frente (chapa + policarbonato) de pie, con el pasacables y una pajita
  function boquilla() {
    const g = new THREE.Group(), acero = L3.phys("chapaMesa", { color: L3.C("#8f959b"), metalness: 0.82, roughness: 0.45 });
    const panel = extruir(rectR(-25, 0, 25, 50, 2), 1.5, acero, { agujeros: [{ x: 0, y: 25, r: 5 }] });
    panel.rotation.x = Math.PI / 2; panel.position.y = 0.75; g.add(panel);
    const pc = extruir(rectR(-25, 0, 25, 50, 2), 5, M.policarbonato(), { agujeros: [{ x: 0, y: 25, r: 3.5 }] });
    pc.rotation.x = Math.PI / 2; pc.position.y = -0.75; g.add(pc);
    const pa = HERR.REG.arandela_pasacables(4.5, 7.5, [0, 1, 0]).g; pa.position.set(0, 0, 25); g.add(pa);
    // pajita del bar (de un solo uso), metida en la boquilla
    g.add(cil(2.9, 60, [0, -2, 25], [0, -1, 0], L3.phys("pajita", { color: L3.C("#f3f3ef"), roughness: 0.35, transmission: 0.5, transparent: true }), 24));
    const anclas = { tubo: { p: [0, 4, 25], d: [0, 1, 0] } };
    return { g, anclas, aCAD: ident(), nombre: "Boquilla del panel" };
  }
  // trozo del lateral izquierdo (de pie) con la ventana de la antena 4G: chapa con su hueco, policarbonato de 2 mm detrás
  // y la antena plana pegada encima; el cable sale por arriba
  function ventanaAntena() {
    const g = new THREE.Group(), acero = L3.phys("chapaMesa", { color: L3.C("#8f959b"), metalness: 0.82, roughness: 0.45 });
    const W = 64, H = 140, vx = 18, vz0 = 14, vz1 = 126;                     // trozo de chapa y ventana (36 × 112)
    g.add(caja(-W / 2, -vx, 0, 1.5, 0, H, acero), caja(vx, W / 2, 0, 1.5, 0, H, acero));
    g.add(caja(-vx, vx, 0, 1.5, 0, vz0, acero), caja(-vx, vx, 0, 1.5, vz1, H, acero));
    g.add(caja(-vx - 8, vx + 8, 1.5, 3.5, vz0 - 8, vz1 + 8, M.policarbonato()));          // policarbonato de 2 mm
    const fpc = L3.phys("fpc", { color: L3.C("#1b1c1e"), roughness: 0.55, clearcoat: 0.3 });
    g.add(caja(-7, 7, 3.5, 3.9, 20.5, 119.5, fpc));                                      // antena plana 14 × 99
    g.add(caja(-2.5, 2.5, 3.5, 5.1, 113.5, 121.0, M.oro()));                              // salida del cable
    return { g, anclas: { coax: { p: [0, 4.3, 121.0], d: [0, 0, 1] } }, aCAD: ident(), nombre: "Ventana de la antena 4G" };
  }
  // salida del escape (trozo de lateral con la rejilla)
  function escape() {
    const g = new THREE.Group(), acero = L3.phys("chapaMesa", { color: L3.C("#8f959b"), metalness: 0.82, roughness: 0.45 });
    const ch = extruir(rectR(-20, 0, 20, 40, 2), 1.5, acero, { agujeros: [{ x: 0, y: 20, r: 6 }] });
    ch.rotation.x = Math.PI / 2; ch.position.y = 0.75; g.add(ch);
    const pa = HERR.REG.arandela_pasacables(4.5, 7.5, [0, 1, 0]).g; pa.position.set(0, 0, 20); g.add(pa);
    return { g, anclas: { tubo: { p: [0, 4, 20], d: [0, 1, 0] } }, aCAD: ident(), nombre: "Escape del soplido" };
  }
  const REG = { chapa_tierra: chapaTierra, boquilla_panel: boquilla, ventana_antena: ventanaAntena, escape_panel: escape };
  return { REG };
})();
