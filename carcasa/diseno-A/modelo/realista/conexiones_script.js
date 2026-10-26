const D = /*DATOS*/;
const $ = s => document.querySelector(s);
const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const v3 = a => V(a[0], a[1], a[2]);

// ---------------------------------------------------------------- escena: mesa plana, luz de estudio con sombras
let lr = null;
const E = ESC.crear($("#v3d"), { sombraTam: 700, sombraRes: 4096, exposicion: 0.95, sol: 1.5, hemi: 0.22, solPos: [250, 950, 450], near: 5, far: 20000,
  alRedimensionar: (w, h) => lr && lr.setSize(w, h) });
const { renderer, scene, camera, controls } = E;
lr = new THREE.CSS2DRenderer({ element: $("#labels") }); E.tam();
controls.maxPolarAngle = Math.PI * 0.49;
const texMesa = (() => {
  const [c, g] = L3.lienzo(512, 512), R = L3.rng(11);
  g.fillStyle = "#808080"; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 26000; i++) { const v = 118 + Math.floor(R() * 20); g.fillStyle = `rgb(${v},${v},${v})`; g.fillRect(R() * 512, R() * 512, 1.5, 1.5); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(10, 10); return t;
})();
const matMesa = new THREE.MeshPhysicalMaterial({ color: 0xd9dcdf, roughness: 0.93, roughnessMap: texMesa, envMapIntensity: 0.5 });
const mesa = new THREE.Mesh(new THREE.PlaneGeometry(6000, 6000), matMesa);
mesa.rotation.x = -Math.PI / 2; mesa.receiveShadow = true; scene.add(mesa);
function fondo() { const c = new THREE.Color(css("--mesa")); scene.background = c; matMesa.color.copy(c).convertSRGBToLinear(); }
matchMedia("(prefers-color-scheme: dark)").addEventListener("change", fondo);
new MutationObserver(fondo).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
fondo();
const raiz = new THREE.Group(); raiz.rotation.x = -Math.PI / 2; scene.add(raiz);      // mesa: X derecha, Y hacia el fondo, Z arriba
raiz.updateMatrixWorld(true);

// ---------------------------------------------------------------- piezas
const P = {};
function colocar(id, c, M) {
  const g0 = ESC.modelo(c.modelo, c.args || [], "natural");
  if (!g0) { console.warn("falta modelo", c.modelo); return; }
  const anclas = g0.userData.anclas || {};
  const g = L3.compactar(g0);
  g.applyMatrix4(M);
  raiz.add(g); raiz.updateMatrixWorld(true);
  P[id] = { g, M: M.clone(), anclas, c };
}
function apoyar(id) {          // baja o sube la pieza hasta que apoya en la mesa
  const p = P[id]; const b = new THREE.Box3().setFromObject(p.g);
  const lo = b.min.y;          // en el mundo de three, la mesa es y = 0
  const dz = -lo + (p.c.pose && p.c.pose.elevar || 0);
  const T = new THREE.Matrix4().makeTranslation(0, 0, dz);
  p.g.applyMatrix4(T); p.M.premultiply(T); raiz.updateMatrixWorld(true);
}
const matDe = pose => L3.matriz(pose.ex, pose.ey, pose.ez, [pose.at[0], pose.at[1], 0]);
for (const [id, c] of Object.entries(D.componentes)) {
  if (c.nodo) { P[id] = { nodo: v3(c.nodo), c, anclas: { x: { p: c.nodo, d: [0, 0, 1] } }, M: new THREE.Matrix4() }; continue; }
  if (!c.pose) continue;
  colocar(id, c, matDe(c.pose)); apoyar(id);
}
// AR9271 enchufado en el USB de abajo de la Pi (mismo marco que la Pi, clavija 12 mm dentro)
function ancla(id, nom) {
  const p = P[id]; if (!p) return null;
  if (p.nodo) return { p: p.nodo.clone(), d: V(0, 0, 1) };
  const a = p.anclas[nom]; if (!a) { console.warn("falta ancla", id, nom); return null; }
  return { p: v3(a.p).applyMatrix4(p.M), d: v3(a.d).transformDirection(p.M) };
}
{
  const a = ancla("pi", "usb_bajo"), pi = P.pi;
  const M = pi.M.clone(); M.setPosition(0, 0, 0);
  const at = a.p.clone().addScaledVector(a.d, -12.2);
  M.setPosition(at); colocar("wifi", D.componentes.wifi, M);
}
// ojo: en «ESC.modelo» del marco natural no se aplica aCAD

// ---------------------------------------------------------------- terminales y cables
const MAT_CAB = {
  verdeamarillo: () => new THREE.MeshPhysicalMaterial({ map: L3.texRayas("#2c9a3e", "#e8c21c", 0.5), roughness: 0.4, clearcoat: 0.3, envMapIntensity: 0.8 }),
  hdmi: () => new THREE.MeshPhysicalMaterial({ color: L3.C("#17181a"), roughness: 0.5, envMapIntensity: 0.8 }),
  trenzado: () => new THREE.MeshPhysicalMaterial({ map: L3.texTrenzado("#5b6067", "#8d9299"), roughness: 0.75, envMapIntensity: 0.8 }),
  coax: () => new THREE.MeshPhysicalMaterial({ color: L3.C("#9b6a43"), roughness: 0.3, clearcoat: 0.5, envMapIntensity: 0.8 }),
  silicona: () => new THREE.MeshPhysicalMaterial({ color: L3.C("#f3f5f2"), roughness: 0.32, transmission: 0.62, thickness: 1.2, ior: 1.41, transparent: true, envMapIntensity: 0.8 }),
  ffc: () => new THREE.MeshPhysicalMaterial({ color: L3.C("#eceae2"), roughness: 0.45, side: THREE.DoubleSide, envMapIntensity: 0.8 }),
};
const matCable = c => (MAT_CAB[c.estilo] ? MAT_CAB[c.estilo]() : new THREE.MeshPhysicalMaterial({ color: L3.C(c.color), roughness: 0.38, clearcoat: 0.35, clearcoatRoughness: 0.3, envMapIntensity: 0.8 }));
const UPZ = V(0, 0, 1);
const perp = (d, pref = UPZ) => { const s = new THREE.Vector3().crossVectors(pref, d); if (s.lengthSq() < 1e-6) s.crossVectors(V(1, 0, 0), d); return s.normalize(); };
// dirección S (hacia dónde sale el cable) de las clavijas acodadas, en el marco natural de la pieza
const S_NAT = { "pant.hdmi": [0, 0, -1], "pant.usbc": [0, 0, -1], "solo.usbc": [0, 0, 1] };
const accesorios = new THREE.Group(); raiz.add(accesorios);
const sal = o => ({ p: v3(o.userData.salida.p), d: v3(o.userData.salida.d) });
const plano = o => (o.updateMatrixWorld(true), o);
let xhPuesto = {};
/* Devuelve {p, d, conLado} donde empieza el cable en ese extremo; coloca el terminal si hace falta.
   d sale del terminal hacia el cable. «otro» es el siguiente punto del recorrido (para orientar ojales). */
function extremo(id, an, tipo, otro, color) {
  const a = ancla(id, an); if (!a) return null;
  const add = o => { accesorios.add(o); return o; };
  switch (tipo) {
    case "faston": { const o = add(MOD.faston(a.p.toArray(), a.d.toArray(), perp(a.d).toArray(), "#2257b8")); return sal(o); }
    case "puntera": { const o = add(MOD.puntera(a.p.toArray(), a.d.toArray(), perp(a.d).toArray(), color === "#b0231c" ? "#d22b25" : color === "#1f56b5" ? "#1f56b5" : "#1a1a1a")); return sal(o); }
    case "ojal": {
      const radial = otro.clone().sub(a.p); radial.addScaledVector(a.d, -radial.dot(a.d)); radial.normalize();
      const o = add(MOD.ojalM4(a.p.toArray(), radial.toArray(), a.d.toArray()));
      // tuerca encima del ojal
      const t = HERR.REG.tuerca_m4(a.d.toArray()).g; t.position.copy(a.p.clone().addScaledVector(a.d, 0.9)); accesorios.add(t);
      return sal(o);
    }
    case "dupont": { const p = a.p.clone().addScaledVector(a.d, 8); const o = add(MOD.dupont(p.toArray(), a.d.toArray(), V(1, 0, 0).toArray(), color)); return sal(o); }
    case "xh": {
      const k = id + "." + an.slice(0, 2);
      if (!xhPuesto[k]) {
        const a2 = ancla(id, "j1_2"), a3 = ancla(id, "j1_3");
        const pm = a2.p.clone().add(a3.p).multiplyScalar(0.5).addScaledVector(a.d, 7.4);
        const vias = a2.p.clone().sub(a3.p).normalize();
        add(MOD.clavijaXH(pm.toArray(), a.d.toArray(), new THREE.Vector3().crossVectors(vias, a.d).toArray()));
        xhPuesto[k] = true;
      }
      return { p: a.p.clone().addScaledVector(a.d, 7.6), d: a.d };
    }
    case "usbA": { const o = add(MOD.clavijaUSBA(a.p.toArray(), a.d.toArray(), perp(a.d).negate().toArray())); return sal(o); }
    case "usbc90": case "hdmi90": {
      const s = v3(S_NAT[id + "." + an] || [0, 0, 1]).transformDirection(P[id].M);
      const f = tipo === "usbc90" ? MOD.clavijaUSBC90 : MOD.clavijaHDMI90;
      const o = add(f(a.p.toArray(), a.d.toArray(), s.toArray())); return sal(o);
    }
    case "hdmiRecta": case "microusb": {
      const s = new THREE.Vector3().crossVectors(UPZ, a.d).normalize();     // ancho a lo largo del canto
      const f = tipo === "hdmiRecta" ? MOD.clavijaHDMIrecta : MOD.clavijaMicroUSB;
      const o = add(f(a.p.toArray(), a.d.toArray(), s.negate().toArray())); return sal(o);
    }
    case "c13": { const s = V(0, 1, 0); const o = add(MOD.clavijaC13(a.p.toArray(), a.d.toArray(), s.toArray())); return sal(o); }
    case "rpsma": { const o = add(MOD.rpsmaMacho(a.p.toArray(), a.d.toArray(), perp(a.d).toArray())); return sal(o); }
    case "tubo": return { p: a.p.clone().addScaledVector(a.d, -7), d: a.d, dentro: 7 };
    case "tubo_fino": return { p: a.p.clone().addScaledVector(a.d, -3), d: a.d, dentro: 3 };
    case "directo": return { p: a.p.clone().addScaledVector(a.d, -2.5), d: a.d, dentro: 2.5 };
    case "nodo": return { p: a.p.clone(), d: V(0, 0, 0) };
    default: return { p: a.p.clone(), d: a.d };
  }
}
function recorrido(c, A0, A1) {
  const r = Math.max(c.radio, 0.6), alto = c.alto || 0;
  const pts = [];
  const lead = x => (x.dentro ? x.dentro + 6 : 9);
  const push = p => { if (!pts.length || pts[pts.length - 1].distanceTo(p) > 0.6) pts.push(p); };
  push(A0.p);
  if (A0.d.lengthSq() > 0) push(A0.p.clone().addScaledVector(A0.d, lead(A0)));
  const suelo = (x, y) => V(x, y, alto > 0 ? alto : r);
  const q0 = A0.p.clone().addScaledVector(A0.d, lead(A0) + 10), q1 = A1.p.clone().addScaledVector(A1.d, lead(A1) + 10);
  if (A0.d.lengthSq() > 0 && A0.p.z > r + 6) push(suelo(q0.x, q0.y));
  for (const v of c.por) push(suelo(v[0], v[1]));
  if (A1.d.lengthSq() > 0 && A1.p.z > r + 6) push(suelo(q1.x, q1.y));
  if (A1.d.lengthSq() > 0) push(A1.p.clone().addScaledVector(A1.d, lead(A1)));
  push(A1.p);
  return pts;
}
const CAB = [];
const VER = D.verificacion;
const estadoDe = id => { const v = VER[id] || []; return v.some(x => x.estado === "error") ? "error" : v.some(x => x.estado === "aviso") ? "aviso" : "ok"; };
for (const c of D.conexiones) {
  if (c.estilo === "ninguno") { CAB.push({ c, me: null, pts: [], estado: estadoDe(c.id) }); continue; }
  // orientar ojales: punto «otro» = primer punto de paso o el otro extremo
  const a1 = ancla(c.a[0], c.a[1]), a0 = ancla(c.de[0], c.de[1]);
  const otro0 = c.por.length ? V(c.por[0][0], c.por[0][1], 0) : a1 ? a1.p : V();
  const otro1 = c.por.length ? V(c.por[c.por.length - 1][0], c.por[c.por.length - 1][1], 0) : a0 ? a0.p : V();
  const A0 = extremo(c.de[0], c.de[1], c.de[2], otro0, c.color), A1 = extremo(c.a[0], c.a[1], c.a[2], otro1, c.color);
  if (!A0 || !A1) { console.warn("conexión incompleta", c.id); continue; }
  const pts = recorrido(c, A0, A1);
  const mat = matCable(c);
  let me;
  if (c.estilo === "ffc") me = L3.cinta(pts, 16, 0.3, mat, [0, 1, 0], [1, 0, 0]);
  else me = L3.cable(pts, c.radio, mat, { lados: c.radio > 1.6 ? 14 : 10, paso: 2.0, rep: c.estilo === "verdeamarillo" ? 9 : c.estilo === "trenzado" ? 4 : 0 });
  me.castShadow = true; me.receiveShadow = true; me.userData.cid = c.id;
  raiz.add(me);
  const L = c.estilo === "ffc" ? 0 : me.userData.L;
  CAB.push({ c, me, pts, estado: estadoDe(c.id), L });
}
ESC.sombras(raiz);
raiz.traverse(o => { if (o.isMesh && o.material && o.material.transmission > 0.5) o.castShadow = false; });
// la mesa no se mueve: el mapa de sombras se calcula una vez y no en cada cuadro (las pantallas animadas sí)
renderer.shadowMap.autoUpdate = false;
renderer.shadowMap.needsUpdate = true;

// ---------------------------------------------------------------- etiquetas
const tags = [];
function punto(cab) { if (!cab.me) { const a = ancla(cab.c.a[0], cab.c.a[1]); return a ? a.p : V(); } const pts = cab.pts; const curva = cab.me.userData.curva; return curva ? curva.getPointAt(0.5) : pts[Math.floor(pts.length / 2)]; }
for (const cab of CAB) {
  const el = document.createElement("div"); el.className = "tag " + cab.estado; el.textContent = cab.c.id;
  el.onclick = ev => { ev.stopPropagation(); elegir(cab.c.id, false); };
  const o = new THREE.CSS2DObject(el); o.position.copy(punto(cab)).add(V(0, 0, 6)); raiz.add(o);
  tags.push({ o, el, cab });
}
const tagsPz = [];
for (const [id, p] of Object.entries(P)) {
  if (!p.g) continue;
  const b = new THREE.Box3().setFromObject(p.g); const c = b.getCenter(V()), top = b.max.y;
  const el = document.createElement("div"); el.className = "tag pz"; el.textContent = p.c.n.split(" (")[0];
  const o = new THREE.CSS2DObject(el);
  const loc = raiz.worldToLocal(V(c.x, top + 8, c.z)); o.position.copy(loc); raiz.add(o); o.visible = false; tagsPz.push(o);
}

// ---------------------------------------------------------------- panel
const nombre = (id) => (D.componentes[id] ? D.componentes[id].n : id);
const desc = (id, a) => D.desc[id + "." + a] || a;
function cuenta() {
  const n = { ok: 0, aviso: 0, error: 0 };
  for (const cab of CAB) n[cab.estado]++;
  $("#cuenta").innerHTML = `<span class="pill ok">${n.ok} correctas</span><span class="pill aviso">${n.aviso} con aviso</span><span class="pill error">${n.error} con error</span>`;
}
function globales() {
  $("#glob").innerHTML = D.globales.map(g => `<div class="g"><span class="dot ${g.estado}"></span><div><b>${g.titulo}.</b> ${g.texto}</div></div>`).join("");
}
const GRUPOS = ["230 V", "Tierra", "5 V", "Sensor (UART y 5 V)", "Datos y USB", "Aire del soplido"];
function lista() {
  const L = $("#lista"); L.innerHTML = "";
  for (const g of GRUPOS) {
    const arr = CAB.filter(c => c.c.grupo === g); if (!arr.length) continue;
    const det = document.createElement("details"); det.className = "grp"; det.open = true;
    const av = arr.filter(c => c.estado !== "ok").length;
    det.innerHTML = `<summary><span class="car">▶</span><span>${g}</span><span class="n">${arr.length}${av ? ` · ${av} aviso${av > 1 ? "s" : ""}` : ""}</span></summary>`;
    for (const cab of arr) {
      const c = cab.c;
      const r = document.createElement("div"); r.className = "con"; r.dataset.id = c.id; r.tabIndex = 0;
      r.innerHTML = `<span class="w"><i class="${cab.estado}"></i>${c.id}</span><span class="de">${nombre(c.de[0])} · ${desc(c.de[0], c.de[1])} → ${nombre(c.a[0])} · ${desc(c.a[0], c.a[1])}</span><span class="cab">${c.cable}</span>`;
      r.onclick = () => elegir(c.id, true);
      r.onkeydown = e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); elegir(c.id, true); } };
      det.appendChild(r);
    }
    L.appendChild(det);
  }
}
let sel = null, soloSel = false;
const resaltados = [];
function resaltar(id) {
  while (resaltados.length) { const o = resaltados.pop(); o.material.emissive.set(0x000000); o.material.emissiveIntensity = 1; }
  for (const t of tags) t.el.classList.toggle("sel", t.cab.c.id === id);
  for (const cab of CAB) if (cab.me) cab.me.visible = !soloSel || !id || cab.c.id === id;
  renderer.shadowMap.needsUpdate = true;
  if (!id) return;
  const cab = CAB.find(c => c.c.id === id);
  if (cab && cab.me && cab.me.material.emissive) { cab.me.material.emissive.set(css("--sel")); cab.me.material.emissiveIntensity = 0.55; resaltados.push(cab.me); }
}
function elegir(id, desdeLista) {
  if (!desdeLista && window.irAConexiones) window.irAConexiones();
  sel = id; resaltar(id);
  document.querySelectorAll(".con").forEach(r => r.classList.toggle("sel", r.dataset.id === id));
  const cab = CAB.find(c => c.c.id === id); if (!cab) return;
  const c = cab.c, v = VER[id] || [];
  const filas = `<dt>De</dt><dd>${nombre(c.de[0])} · ${desc(c.de[0], c.de[1])}</dd><dt>A</dt><dd>${nombre(c.a[0])} · ${desc(c.a[0], c.a[1])}</dd>
    <dt>Cable</dt><dd>${c.cable}</dd><dt>Esquema</dt><dd>${c.w} (MONTAJE GENERAL)</dd>` + (c.nota ? `<dt>Nota</dt><dd>${c.nota}</dd>` : "");
  const vs = (v.length ? v : [{ estado: "ok", texto: "Sin observaciones.", fuente: "" }]).map(x =>
    `<div class="v ${x.estado}"><span class="dot ${x.estado}"></span><div>${x.texto}${x.fuente ? `<small>${x.fuente}</small>` : ""}</div></div>`).join("");
  $("#det").innerHTML = `<h2>Conexión ${c.id}</h2><div class="t">${c.cable.split(",")[0]}</div><dl>${filas}</dl><h2>Verificación</h2>${vs}`;
  if (!desdeLista) { const r = document.querySelector(`.con[data-id="${id}"]`); if (r) r.scrollIntoView({ block: "nearest" }); }
  else enfocarCable(cab);
}
function enfocar(b, k = 1.25, dir = V(0, 0.9, 0.75)) {
  if (b.isEmpty()) return;
  const c = b.getCenter(V()), r = Math.max(b.getSize(V()).length() / 2, 60);
  const t = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  const d = Math.max(r / t, r / (t * camera.aspect)) * k;
  controls.target.copy(c); camera.position.copy(c).add(dir.clone().normalize().multiplyScalar(d)); controls.update();
}
function enfocarCable(cab) {
  const b = new THREE.Box3();
  if (cab.me) b.expandByObject(cab.me);
  for (const e of [cab.c.de[0], cab.c.a[0]]) if (P[e] && P[e].g) b.expandByObject(P[e].g);
  const dir = camera.position.clone().sub(controls.target);
  enfocar(b, 1.1, dir.y > 50 ? dir : V(0, 0.9, 0.75));
}
const ZONAS = [["Todo", null], ["Pantalla y lector", "pantalla"], ["230 V y tierra", "230 V y tierra"], ["Reparto de 5 V", "Reparto de 5 V"], ["Pi y periféricos", "Pi y periféricos"], ["Sensor y soplido", "Sensor y soplido"]];
function zona(g) {
  document.querySelectorAll("#zonas .chip").forEach(b => b.setAttribute("aria-pressed", b.dataset.g === String(g)));
  const b = new THREE.Box3();
  if (g === "pantalla") {
    // la pantalla, el lector y la cámara de frente: para ver el programa en marcha
    for (const id of ["pant", "solo", "cam"]) if (P[id] && P[id].g) b.expandByObject(P[id].g);
    return enfocar(b, 0.92, V(0.05, 0.62, 1));
  }
  for (const p of Object.values(P)) if (p.g && (!g || p.c.grupo === g)) b.expandByObject(p.g);
  enfocar(b, g ? 0.82 : 0.8, g ? V(0, 1.0, 0.72) : V(0, 1.05, 0.8));
}
$("#zonas").innerHTML = ZONAS.map(([t, g]) => `<button class="chip" data-g="${g}" aria-pressed="false">${t}</button>`).join("");
document.querySelectorAll("#zonas .chip").forEach(b => b.onclick = () => zona(b.dataset.g === "null" ? null : b.dataset.g));
$("#bTags").onclick = () => { const v = $("#bTags").getAttribute("aria-pressed") !== "true"; $("#bTags").setAttribute("aria-pressed", v); tags.forEach(t => t.o.visible = v); };
$("#bNom").onclick = () => { const v = $("#bNom").getAttribute("aria-pressed") !== "true"; $("#bNom").setAttribute("aria-pressed", v); tagsPz.forEach(o => o.visible = v); };
$("#bSolo").onclick = () => { soloSel = !soloSel; $("#bSolo").setAttribute("aria-pressed", soloSel); resaltar(sel); };
// tocar un cable en 3D
const ray = new THREE.Raycaster(); let down = null;
renderer.domElement.addEventListener("pointerdown", e => { down = [e.clientX, e.clientY]; });
renderer.domElement.addEventListener("pointerup", e => {
  if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 5) return;
  const r = renderer.domElement.getBoundingClientRect();
  ray.setFromCamera({ x: ((e.clientX - r.left) / r.width) * 2 - 1, y: -((e.clientY - r.top) / r.height) * 2 + 1 }, camera);
  ray.params.Mesh = {};
  const hits = ray.intersectObjects(CAB.filter(c => c.me && c.me.visible).map(c => c.me), false);
  if (hits.length) elegir(hits[0].object.userData.cid, false);
});

// ---------------------------------------------------------------- arranque
cuenta(); globales(); lista(); zona(null);
let ini = null; try { ini = location.hash.slice(1) || null; } catch (e) {}
if (ini && CAB.find(c => c.c.id === ini)) elegir(ini, true);
// antesDeRender: la simulación del programa actualiza ahí las pantallas (texturas) y los cables que se iluminan
let tUltimo = 0;
const bucle = (t) => {
  if (t - tUltimo < 30) return;          // como mucho ~33 cuadros por segundo: de sobra para la mesa
  tUltimo = t;
  if (window.antesDeRender) window.antesDeRender();
  if (window.ocultar3D) return;
  controls.update(); renderer.render(scene, camera); lr.render(scene, camera);
};
renderer.setAnimationLoop(bucle);
window.pausar = () => renderer.setAnimationLoop(null);
window.cuadro = () => { if (window.antesDeRender) window.antesDeRender(); controls.update(); renderer.render(scene, camera); lr.render(scene, camera); return 0; };
window.zona = zona; window.elegir = elegir; window.P = P; window.CAB = CAB; window.ESCENA = { scene, camera, renderer, controls, raiz };
window.listo = true;
