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
  // trozo de lateral con el pasamuros RP-SMA y la antena (de pie)
  function chapaAntena() {
    const g = new THREE.Group(), acero = L3.phys("chapaMesa", { color: L3.C("#8f959b"), metalness: 0.82, roughness: 0.45 });
    const ch = extruir(rectR(-22, 0, 22, 60, 2), 1.5, acero, { agujeros: [{ x: 0, y: 30, r: 3.25 }] });
    ch.rotation.x = Math.PI / 2; ch.position.y = 1.5; g.add(ch);
    const pa = HERR.REG.pasamuros_antena(); const pg = pa.g; pg.position.set(0, 0, 30);
    // la antena cuelga hacia −Z en el modelo; aquí se gira hacia arriba (+Z)
    pg.rotation.y = Math.PI; g.add(pg);
    const c = pa.anclas.coax; const p = V(...c.p).applyEuler(pg.rotation).add(pg.position), d = V(...c.d).applyEuler(pg.rotation);
    return { g, anclas: { coax: { p: [p.x, p.y, p.z], d: [d.x, d.y, d.z] } }, aCAD: ident(), nombre: "Pasamuros RP-SMA y antena" };
  }
  // salida del escape (trozo de lateral con la rejilla)
  function escape() {
    const g = new THREE.Group(), acero = L3.phys("chapaMesa", { color: L3.C("#8f959b"), metalness: 0.82, roughness: 0.45 });
    const ch = extruir(rectR(-20, 0, 20, 40, 2), 1.5, acero, { agujeros: [{ x: 0, y: 20, r: 6 }] });
    ch.rotation.x = Math.PI / 2; ch.position.y = 0.75; g.add(ch);
    const pa = HERR.REG.arandela_pasacables(4.5, 7.5, [0, 1, 0]).g; pa.position.set(0, 0, 20); g.add(pa);
    return { g, anclas: { tubo: { p: [0, 4, 20], d: [0, 1, 0] } }, aCAD: ident(), nombre: "Escape del soplido" };
  }
  const REG = { chapa_tierra: chapaTierra, boquilla_panel: boquilla, chapa_antena: chapaAntena, escape_panel: escape };
  return { REG };
})();
