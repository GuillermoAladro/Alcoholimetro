const DATOS = /*DATOS*/;
const ORDEN_GRUPOS = ["Carcasa","Tapa","Policarbonato","Cajón de pajitas","Cajón de componentes","Soportes","Electrónica","Herrajes","Cables y tubos"];
const COL_GRUPO = {"Carcasa":"#9ea8b3","Tapa":"#808c99","Policarbonato":"#bfe0fa","Cajón de pajitas":"#3b73c7","Cajón de componentes":"#e0952f","Soportes":"#b39e4c","Electrónica":"#1a7341","Herrajes":"#c7cacc","Cables y tubos":"#c7261f"};
const $ = s => document.querySelector(s);
const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();

// ---------------------------------------------------------------- escena (render realista: ACES, entorno de estudio, sombras)
const stage = $("#v3d");
let lr = null;
const E = ESC.crear(stage, { sombraTam: 330, exposicion: 0.95, sol: 1.45, hemi: 0.22, near: 5, far: 20000,
  alRedimensionar: (w, h) => lr && lr.setSize(w, h) });
const { renderer, scene, camera, controls } = E;
lr = new THREE.CSS2DRenderer({ element: $("#labels") });
E.tam();
let raiz = null, cur = null, M = null;

function fondo() { scene.background = new THREE.Color(css("--stage")); edgeMat.color.set(css("--edge")); }
const edgeMat = new THREE.LineBasicMaterial({ color: 0x1d2731, transparent: true, opacity: 0.3 });
matchMedia("(prefers-color-scheme: dark)").addEventListener("change", fondo);
new MutationObserver(fondo).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

function geom(m) {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(m.v), 3));
  g.setIndex(m.i); g.computeVertexNormals();
  return g;
}

// ---------------------------------------------------------------- materiales
let modoReal = true;
const lin = c => new THREE.Color(c[0], c[1], c[2]).convertSRGBToLinear();
function matChapa(pz, c) {
  const m = new THREE.MeshPhysicalMaterial({ side: THREE.DoubleSide, envMapIntensity: 0.85 });
  m.userData.colGrupo = lin(c); m.userData.fab = true;
  pintar(m);
  return m;
}
function pintar(m) {
  if (modoReal) { m.color.set(0x8f959b).convertSRGBToLinear(); m.metalness = 0.82; m.roughness = 0.4; m.clearcoat = 0.0; }
  else { m.color.copy(m.userData.colGrupo); m.metalness = 0.15; m.roughness = 0.55; m.clearcoat = 0.15; }
  m.userData.base = m.color.clone(); m.needsUpdate = true;
}
const MATPC = () => { const m = L3.MAT.policarbonato().clone(); m.userData.pc = true; return m; };
// material para las pocas compradas sin modelo detallado (bisagra…): por el color del CAD
function matPorColor(c) {
  const ref = [[[0.78, 0.79, 0.80], "inox"], [[0.80, 0.62, 0.25], "laton"], [[0.85, 0.68, 0.25], "oro"], [[0.10, 0.10, 0.11], "negro"],
    [[0.15, 0.15, 0.15], "goma"], [[0.85, 0.90, 0.95], "tope"], [[0.92, 0.93, 0.94], "blanco"], [[0.95, 0.50, 0.10], "naranjaWago"]];
  let best = "inox", d0 = 9;
  for (const [r, k] of ref) { const d = Math.hypot(r[0] - c[0], r[1] - c[1], r[2] - c[2]); if (d < d0) { d0 = d; best = k; } }
  return L3.MAT[best]();
}
// cables por estilo
const texVA = L3.texRayas("#2c9a3e", "#e8c21c", 0.5), texTr = L3.texTrenzado("#5b6067", "#8d9299");
const MAT_CAB = {
  verdeamarillo: () => L3.phys("cabVA", { map: texVA, roughness: 0.4, clearcoat: 0.3 }),
  hdmi: () => L3.phys("cabHDMI", { color: L3.C("#17181a"), roughness: 0.5 }),
  trenzado: () => L3.phys("cabTrenza", { map: texTr, roughness: 0.75 }),
  coax: () => L3.MAT.rg316(),
  silicona: () => L3.MAT.silicona(),
  ffc: () => L3.phys("cabFFC", { color: L3.C("#eceae2"), roughness: 0.45, side: THREE.DoubleSide }),
};
function matCable(c) {
  if (MAT_CAB[c.estilo]) return MAT_CAB[c.estilo]();
  const k = "pvc" + c.color.join("_");
  return L3.phys(k, { color: lin(c.color), roughness: 0.38, clearcoat: 0.35, clearcoatRoughness: 0.3 });
}

// ---------------------------------------------------------------- construir un diseño
let piezas = [], cables = [], grupos = {}, pivTapa = null, gTapa = null, gCaj = null, gPaj = null, gFijo = null, gCab = null, gTI = null;
let selId = null, verNum = false, verElec = true, verCab = true, opac = 0, opacK = 0;
const tfMat = tf => L3.matriz(tf.ex, tf.ey, tf.ez, tf.at);

function modeloDe(mod) {
  const g = ESC.modelo(mod.n, mod.a || [], "cad");
  if (!g) return null;
  const c = L3.compactar(g);
  c.applyMatrix4(tfMat(mod.tf));
  return c;
}

function construir(letra) {
  if (raiz) { scene.remove(raiz); raiz.traverse(o => { if (o.geometry) o.geometry.dispose(); }); }
  $("#labels").innerHTML = "";
  cur = letra; M = DATOS[letra];
  M.D = M.cotas.D; M.H = M.cotas.H;
  raiz = new THREE.Group(); scene.add(raiz);
  const cad = new THREE.Group(); cad.rotation.x = -Math.PI / 2; cad.position.set(0, -M.H / 2, M.D / 2); raiz.add(cad);
  gFijo = new THREE.Group(); gPaj = new THREE.Group(); gCaj = new THREE.Group();
  gTapa = new THREE.Group(); pivTapa = new THREE.Group(); pivTapa.add(gTapa);
  gTI = new THREE.Group();
  cad.add(gFijo, gPaj, gCaj, pivTapa, gTI);
  const mt = M.movil.tapa;
  if (mt.tipo === "giro") {
    const [p, d] = mt.eje;
    pivTapa.position.set(p[0], p[1], p[2]); gTapa.position.set(-p[0], -p[1], -p[2]);
    pivTapa.userData.eje = new THREE.Vector3(d[0], d[1], d[2]).normalize();
  }
  const padreDe = mv => mv === "cajon_componentes" ? gCaj : mv === "cajon_pajitas" ? gPaj : mv === "tapa" ? gTapa : mv === "tapa_interior" ? gTI : gFijo;
  piezas = []; grupos = {};
  for (const pz of M.piezas) {
    let g;
    const fab = pz.tipo === "fabricada", pc = pz.grupo === "Policarbonato";
    if (pz.modelo) {
      g = modeloDe(pz.modelo) || new THREE.Group();
      g.traverse(o => { if (o.isMesh) o.userData.pid = pz.id; });
    } else {
      g = new THREE.Group();
      for (const mm of pz.mallas) {
        const geo = geom(mm);
        const mat = pc ? MATPC() : fab ? matChapa(pz, mm.c) : matPorColor(mm.c);
        const me = new THREE.Mesh(geo, mat); me.userData.pid = pz.id; g.add(me);
        if (fab && !pc) { const e = new THREE.LineSegments(new THREE.EdgesGeometry(geo, 28), edgeMat); e.userData.arista = true; e.visible = !modoReal; g.add(e); }
      }
    }
    g.userData.p = pz;
    padreDe(pz.movil).add(g);
    const b = pz.bb;
    const el = document.createElement("div"); el.className = "lbl" + (pz.grupo === "Cajón de componentes" ? " k" : ""); el.textContent = pz.id.slice(2);
    const lab = new THREE.CSS2DObject(el); lab.position.set((b[0] + b[3]) / 2, (b[1] + b[4]) / 2, (b[2] + b[5]) / 2);
    (pz.modelo ? padreDe(pz.movil) : g).add(lab); lab.visible = false;
    pz._g = g; pz._lab = lab; pz._on = true;
    piezas.push(pz);
    (grupos[pz.grupo] = grupos[pz.grupo] || []).push(pz);
  }
  // accesorios pequeños (faston, punteras, ojales, Dupont…): sin número de pieza, se mueven con su grupo
  for (const a of M.accesorios || []) {
    const g = modeloDe(a); if (!g) continue;
    g.userData.accesorio = true;
    padreDe(a.movil).add(g);
  }
  // cables y tubos
  gCab = new THREE.Group(); gCaj.add(gCab);
  cables = M.cables.map((c, k) => {
    const pts = c.puntos.map(p => new THREE.Vector3(p[0], p[1], p[2]));
    const mat = matCable(c);
    let me;
    if (c.estilo === "ffc") me = L3.cinta(pts, c.radio * 2, 0.3, mat, c.n0 || [0, 0, 1], c.n1 || null);
    else {
      const L = new THREE.CatmullRomCurve3(pts, false, "centripetal").getLength();
      me = L3.cable(pts, c.radio, mat, { lados: c.radio > 1.6 ? 14 : 10, paso: 2.0, rep: c.estilo === "verdeamarillo" ? 9 : c.estilo === "trenzado" ? 4 : 0 });
    }
    me.castShadow = true; me.receiveShadow = true;
    const id = cur + "-W" + String(k + 1).padStart(2, "0");
    const pz = { id, nombre: c.nombre, grupo: "Cables y tubos", tipo: "cable", electrico: c.tipo !== "tubo", _g: me, _on: true, cab: c };
    me.userData.pid = id; me.userData.p = pz; gCab.add(me);
    return pz;
  });
  grupos["Cables y tubos"] = cables;
  ESC.sombras(cad);
  // sliders
  $("#sPaj").max = Math.round(M.movil.cajon_pajitas.recorrido); $("#sPaj").value = 0;
  $("#sCaj").max = Math.round(M.movil.cajon_componentes.recorrido); $("#sCaj").value = 0;
  $("#sTap").value = 0;
  $("#sTI").max = Math.round(M.cotas.W + 10); $("#sTI").value = 0;
  lista(); mover(); aplicarVis(); medidas(); leyenda(); info(null); vista("iso");
  try { localStorage.setItem("alc-diseno", letra); } catch (e) {}
}

// ---------------------------------------------------------------- UI
function tabs() {
  const t = $("#tabs");
  if (Object.keys(DATOS).length < 2) t.hidden = true;
  for (const L of Object.keys(DATOS)) {
    const d = DATOS[L];
    const b = document.createElement("button"); b.className = "tab"; b.role = "tab"; b.id = "tab" + L;
    b.innerHTML = `<span class="l">${L}</span><span>${d.nombre}</span>`;
    b.onclick = () => construir(L); t.appendChild(b);
  }
}
function medidas() {
  for (const b of document.querySelectorAll(".tab")) b.setAttribute("aria-selected", b.id === "tab" + cur);
  const c = M.cotas, nf = M.piezas.filter(p => p.tipo === "fabricada").length, nc = M.piezas.length - nf;
  $("#medidas").innerHTML = `<span>Ancho <b>${Math.round(c.W)}</b></span><span>Fondo <b>${Math.round(c.D)}</b></span><span>Alto <b>${Math.round(c.H)}</b> mm</span><span><b>${nf}</b> piezas a fabricar · <b>${nc}</b> compradas</span>`;
  $("#desc").innerHTML = `<b>${cur} · ${M.nombre}.</b> ${M.descripcion}`;
}
function leyenda() {
  $("#leyenda").innerHTML = ORDEN_GRUPOS.filter(g => grupos[g]).map(g => `<span><i style="background:${COL_GRUPO[g]}"></i>${g}</span>`).join("");
}
const OJO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>';
const OJO_NO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3l18 18"/><path d="M10.6 5.1A10.9 10.9 0 0 1 12 5c7 0 11 7 11 7a18.6 18.6 0 0 1-3.2 4.2M6.2 6.2C3 8.3 1 12 1 12s4 7 11 7a10.6 10.6 0 0 0 5.8-1.8"/></svg>';
function lista() {
  const L = $("#lista"); L.innerHTML = "";
  for (const g of ORDEN_GRUPOS) {
    const arr = grupos[g]; if (!arr || !arr.length) continue;
    const det = document.createElement("details"); det.className = "grp"; det.open = ["Cajón de componentes", "Carcasa"].includes(g);
    const s = document.createElement("summary");
    s.innerHTML = `<span class="car">▶</span><span>${g}</span><span class="n">${arr.length}</span>`;
    const e = document.createElement("button"); e.className = "eye"; e.title = "Ocultar o mostrar el grupo"; e.innerHTML = OJO;
    e.onclick = ev => { ev.preventDefault(); const on = !arr.every(p => p._on); arr.forEach(p => p._on = on); aplicarVis(); };
    s.appendChild(e); det.appendChild(s);
    for (const p of arr) {
      const r = document.createElement("div"); r.className = "it"; r.dataset.id = p.id;
      const col = p.mallas && p.mallas.length ? p.mallas[0].c : p.cab ? p.cab.color : [0.55, 0.57, 0.6];
      r.innerHTML = `<span class="sw" style="background:rgb(${col.map(x => Math.round(x * 255)).join(",")})"></span><span class="id">${p.id.slice(2)}</span><span class="nm" title="${p.nombre}">${p.nombre}</span>`;
      const b = document.createElement("button"); b.className = "eye"; b.title = "Ocultar o mostrar"; b.innerHTML = OJO;
      b.onclick = ev => { ev.stopPropagation(); p._on = !p._on; aplicarVis(); };
      r.appendChild(b); r.onclick = () => seleccionar(p.id, true); det.appendChild(r);
    }
    L.appendChild(det);
  }
}
function visible(p) {
  if (!p._on) return false;
  if (!verElec && p.electrico) return false;
  if (p.grupo === "Cables y tubos") {
    if (!verCab) return false;
    if (p.cab.tipo === "puente" && +$("#sCaj").value > 0) return false;
  }
  if (p.movil === "candado" && +$("#sPaj").value > 0) return false;
  return true;
}
function aplicarVis() {
  for (const p of piezas.concat(cables)) {
    const v = visible(p); p._g.visible = v;
    if (p._lab) p._lab.visible = v && verNum && p.tipo === "fabricada";
    const r = document.querySelector(`.it[data-id="${p.id}"]`);
    if (r) { r.classList.toggle("off", !p._on); r.querySelector(".eye").innerHTML = p._on ? OJO : OJO_NO; }
  }
  // accesorios: se ven si se ven los cables y la electrónica; los del puente de tierra se esconden al subir el cajón
  raiz && raiz.traverse(o => { if (o.userData && o.userData.accesorio) o.visible = verCab && verElec; });
  for (const d of document.querySelectorAll(".grp")) {
    const arr = grupos[d.querySelector("summary span:nth-child(2)").textContent];
    d.querySelector("summary .eye").innerHTML = arr.some(p => p._on) ? OJO : OJO_NO;
  }
  transparencia();
}
function transparencia() {
  for (const p of piezas) {
    const k = p.grupo === "Cajón de componentes";
    if (!["Carcasa", "Tapa"].includes(p.grupo) && !k) continue;
    const t = (k ? opacK : opac) / 100;
    p._g.traverse(o => { if (o.isMesh && o.material.userData.fab) { o.material.transparent = t > 0; o.material.opacity = 1 - t; o.material.depthWrite = t < 0.5; o.castShadow = t < 0.5; o.material.needsUpdate = true; } });
  }
}
function acabado(real) {
  modoReal = real;
  $("#bReal").setAttribute("aria-pressed", real); $("#bGrupo").setAttribute("aria-pressed", !real);
  for (const p of piezas) p._g.traverse(o => {
    if (o.isMesh && o.material.userData.fab) pintar(o.material);
    if (o.userData.arista) o.visible = !real;
  });
  resaltar(selId); transparencia();
  try { localStorage.setItem("alc-acabado", real ? "real" : "grupo"); } catch (e) {}
}
$("#bReal").onclick = () => acabado(true);
$("#bGrupo").onclick = () => acabado(false);
function mover() {
  const pj = +$("#sPaj").value, kj = +$("#sCaj").value, tiMax = +$("#sTI").max;
  let tp = +$("#sTap").value, ti = +$("#sTI").value;
  // orden obligado: tapa abierta → tapa interior fuera (hacia la derecha, por su ranura) → subir el cajón
  if (kj > 0 && ti < tiMax) { ti = tiMax; $("#sTI").value = ti; }
  if (ti > 0 && tp < 100) { tp = 100; $("#sTap").value = 100; }
  gPaj.position.x = -pj; gCaj.position.z = kj;
  gTI.position.set(ti, 0, 0);
  $("#oTI").textContent = ti === 0 ? "puesta" : ti >= tiMax ? "fuera" : ti + " mm";
  const mt = M.movil.tapa;
  if (mt.tipo === "giro") { pivTapa.quaternion.setFromAxisAngle(pivTapa.userData.eje, THREE.MathUtils.degToRad(mt.angulo * tp / 100)); }
  else {
    const ruta = [[0, 0, 0]].concat(mt.ruta), t = tp / 100 * (ruta.length - 1);
    const i = Math.min(Math.floor(t), ruta.length - 2), u = t - i, a = ruta[i], b = ruta[i + 1];
    const v = [0, 1, 2].map(j => a[j] + (b[j] - a[j]) * u);
    pivTapa.position.set(v[0], v[1], v[2]);
  }
  $("#oPaj").textContent = pj + " mm"; $("#oCaj").textContent = kj + " mm";
  $("#oTap").textContent = tp === 0 ? "cerrada" : tp === 100 ? (mt.tipo === "giro" ? "abierta" : "quitada") : tp + " %";
  aplicarVis();
}
["sPaj", "sCaj", "sTap", "sTI"].forEach(id => $("#" + id).addEventListener("input", mover));
let anim = null;
function animar(destino) {
  if (anim) cancelAnimationFrame(anim);
  const ids = ["sTap", "sTI", "sCaj", "sPaj"], ini = ids.map(id => +$("#" + id).value);
  const fin = destino ? [100, +$("#sTI").max, +$("#sCaj").max, +$("#sPaj").max] : [0, 0, 0, 0];
  const orden = destino ? [0, 1, 2, 3] : [3, 2, 1, 0];
  const T = 900; let t0 = null;
  function paso(t) {
    if (t0 === null) t0 = t;
    const e = (t - t0) / T;
    orden.forEach((k, n) => { const f = Math.min(1, Math.max(0, e - n)); const s = f * f * (3 - 2 * f);
      $("#" + ids[k]).value = Math.round(ini[k] + (fin[k] - ini[k]) * s); });
    if (!destino && (+$("#sCaj").value > 0 || +$("#sTI").value > 0)) $("#sTap").value = 100;
    mover();
    if (e < orden.length) anim = requestAnimationFrame(paso); else { anim = null; encuadrar(); }
  }
  anim = requestAnimationFrame(paso);
}
function encuadrar() {
  raiz.updateMatrixWorld(true);
  const b = new THREE.Box3();
  raiz.traverse(o => { if (o.isMesh && vis(o)) b.expandByObject(o); });
  if (b.isEmpty()) return;
  const c = b.getCenter(new THREE.Vector3()), s = b.getSize(new THREE.Vector3());
  const dir = camera.position.clone().sub(controls.target).normalize();
  const t = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  const r = s.length() / 2;
  const d = Math.max(r / t, r / (t * camera.aspect)) * 1.05;
  controls.target.copy(c); camera.position.copy(c).add(dir.multiplyScalar(d)); controls.update();
}
$("#bAbrir").onclick = () => animar(true);
$("#bCerrar").onclick = () => animar(false);
$("#sTr").addEventListener("input", e => { opac = +e.target.value; $("#oTr").textContent = opac + " %"; transparencia(); });
$("#sTrK").addEventListener("input", e => { opacK = +e.target.value; $("#oTrK").textContent = opacK + " %"; transparencia(); });
function toggle(btn, fn) { $(btn).onclick = () => { const v = fn(); $(btn).setAttribute("aria-pressed", v); aplicarVis(); }; }
toggle("#bElec", () => (verElec = !verElec));
toggle("#bCab", () => (verCab = !verCab));
toggle("#bNum", () => (verNum = !verNum));
$("#bTodo").onclick = () => { piezas.concat(cables).forEach(p => p._on = true); verElec = verCab = true; $("#bElec").setAttribute("aria-pressed", true); $("#bCab").setAttribute("aria-pressed", true); aplicarVis(); };

// ---------------------------------------------------------------- selección (material resaltado aparte: los materiales se comparten)
const resaltados = [];
function resaltar(id) {
  while (resaltados.length) { const o = resaltados.pop(); o.material = o.userData.matOrig; delete o.userData.matOrig; }
  if (!id) return;
  const p = piezas.concat(cables).find(x => x.id === id); if (!p) return;
  const col = new THREE.Color(css("--sel"));
  p._g.traverse(o => {
    if (!o.isMesh || o.isInstancedMesh) return;
    const m = o.material.clone();
    if (m.emissive) { m.emissive.copy(col); m.emissiveIntensity = 0.45; }
    o.userData.matOrig = o.material; o.material = m; resaltados.push(o);
  });
}
function seleccionar(id, desdeLista) {
  selId = id; resaltar(id);
  document.querySelectorAll(".it").forEach(r => r.classList.toggle("sel", r.dataset.id === id));
  const p = piezas.concat(cables).find(x => x.id === id); info(p);
  if (!desdeLista) { const r = document.querySelector(`.it[data-id="${id}"]`); if (r) { r.closest("details").open = true; r.scrollIntoView({ block: "nearest" }); } }
}
function info(p) {
  const I = $("#info");
  if (!p) { I.innerHTML = '<h2>Pieza</h2><p class="nota">Toca una pieza en el 3D o en la lista para ver su número, medidas, material y archivo de fabricación.</p>'; return; }
  let filas = `<dt>Grupo</dt><dd>${p.grupo}</dd>`;
  if (p.tipo === "fabricada") {
    const m = p.medidas;
    filas += `<dt>Material</dt><dd>${p.material}</dd><dt>Proceso</dt><dd>${p.proceso}</dd>
      <dt>Medidas</dt><dd class="mono">${m[0]} × ${m[1]} × ${m[2]} mm</dd><dt>Masa</dt><dd class="mono">${Math.round(p.masa)} g</dd>
      <dt>Archivos</dt><dd class="mono">STEP_piezas/${p.id}.step<br>DXF_corte/${p.id}.dxf</dd>`;
  } else if (p.tipo === "comprada") {
    filas += `<dt>Compra</dt><dd>${p.ref} · ${p.compra}</dd>` + (p.asin ? `<dt>Amazon</dt><dd><a href="https://www.amazon.es/dp/${p.asin}" target="_blank" rel="noopener">${p.asin}</a></dd>` : "");
    if (p.modelo) filas += `<dt>Dibujo</dt><dd>Modelo detallado (fotos de referencia + ficha)</dd>`;
  } else {
    const c = p.cab;
    filas += `<dt>Tipo</dt><dd>${c.tipo === "puente" ? "Se desconecta antes de sacar el cajón" : c.tipo === "tubo" ? "Tubo de silicona (aire del soplido)" : c.tipo === "cinta" ? "Cable plano FFC" : "Cable"}</dd>`;
    if (c.de) filas += `<dt>De</dt><dd>${c.de}</dd>`;
    if (c.a) filas += `<dt>A</dt><dd>${c.a}</dd>`;
  }
  if (p.notas) filas += `<dt>Notas</dt><dd>${p.notas}</dd>`;
  I.innerHTML = `<h2>Pieza</h2><div><div class="id">${p.id}</div><div class="nom">${p.nombre}</div><dl>${filas}</dl></div>
    <div class="btns"><button class="btn" id="bOc">Ocultar</button><button class="btn" id="bSolo">Ver solo esta</button><button class="btn" id="bDes">Quitar selección</button></div>`;
  $("#bOc").onclick = () => { p._on = false; aplicarVis(); };
  $("#bSolo").onclick = () => { piezas.concat(cables).forEach(q => q._on = q === p); aplicarVis(); };
  $("#bDes").onclick = () => { selId = null; resaltar(null); info(null); document.querySelectorAll(".it.sel").forEach(r => r.classList.remove("sel")); };
}
const ray = new THREE.Raycaster(); let down = null;
renderer.domElement.addEventListener("pointerdown", e => { down = [e.clientX, e.clientY]; });
renderer.domElement.addEventListener("pointerup", e => {
  if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 5) return;
  const r = renderer.domElement.getBoundingClientRect();
  ray.setFromCamera({ x: ((e.clientX - r.left) / r.width) * 2 - 1, y: -((e.clientY - r.top) / r.height) * 2 + 1 }, camera);
  const hits = ray.intersectObjects(raiz.children, true).filter(h => h.object.isMesh && h.object.userData.pid && vis(h.object));
  if (hits.length) seleccionar(hits[0].object.userData.pid);
});
function vis(o) { while (o) { if (!o.visible) return false; o = o.parent; } return true; }

// ---------------------------------------------------------------- vistas
function vista(v) {
  document.querySelectorAll("#vistas .chip").forEach(b => b.setAttribute("aria-pressed", b.dataset.v === v));
  const R = Math.max(M.cotas.W, M.H) * 2.6;
  const dirs = { iso: [0.9, 0.55, 1.1], frente: [0, 0.08, 1], lado: [1, 0.08, 0.02], arriba: [0.02, 1, 0.25], atras: [-0.7, 0.4, -1] };
  const d = new THREE.Vector3(...dirs[v]).normalize().multiplyScalar(R);
  controls.target.set(0, 0, 0); camera.position.copy(d); controls.update();
}
document.querySelectorAll("#vistas .chip").forEach(b => b.onclick = () => vista(b.dataset.v));
// para capturas y para enfocar una pieza desde fuera
window.enfocarPieza = (id, dir = [0.6, 0.5, 1], k = 1.6) => {
  const p = piezas.concat(cables).find(x => x.id === id); if (!p) return false;
  raiz.updateMatrixWorld(true);
  const b = new THREE.Box3().setFromObject(p._g); const c = b.getCenter(new THREE.Vector3()), s = b.getSize(new THREE.Vector3()).length();
  controls.target.copy(c); camera.position.copy(c).add(new THREE.Vector3(...dir).normalize().multiplyScalar(Math.max(s, 60) * k)); controls.update(); return true;
};

// ---------------------------------------------------------------- arranque
tabs(); fondo();
try { if (localStorage.getItem("alc-acabado") === "grupo") modoReal = false; } catch (e) {}
$("#bReal").setAttribute("aria-pressed", modoReal); $("#bGrupo").setAttribute("aria-pressed", !modoReal);
let ini = "A"; try { const s = localStorage.getItem("alc-diseno"); if (s && DATOS[s]) ini = s; } catch (e) {}
construir(ini);
window.listo = true;
const bucle = () => { controls.update(); renderer.render(scene, camera); lr.render(scene, camera); };
renderer.setAnimationLoop(bucle);
// para capturas automáticas: parar el bucle y dibujar un solo cuadro
window.pausar = () => renderer.setAnimationLoop(null);
window.cuadro = () => { const t = performance.now(); controls.update(); renderer.render(scene, camera); lr.render(scene, camera); return performance.now() - t; };
