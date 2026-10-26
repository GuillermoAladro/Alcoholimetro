/* escena.js — render realista común: tono ACES, sRGB, entorno de estudio (RoomEnvironment), luz principal con sombras suaves. */
const ESC = (() => {
  function crear(contenedor, op = {}) {
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, preserveDrawingBuffer: !!op.captura });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, op.maxDPR || 2));
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = op.exposicion ?? 1.0;
    renderer.shadowMap.enabled = op.sombras !== false;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.physicallyCorrectLights = false;
    contenedor.prepend(renderer.domElement);
    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const env = pmrem.fromScene(new THREE.RoomEnvironment(), 0.035).texture;
    scene.environment = env;
    const camera = new THREE.PerspectiveCamera(op.fov || 30, 1, op.near || 2, op.far || 30000);
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; controls.dampingFactor = 0.12;
    // luz principal (sombras) + relleno suave
    const sol = new THREE.DirectionalLight(0xfff4e6, op.sol ?? 1.6);
    sol.position.set(...(op.solPos || [500, 900, 650]));
    sol.castShadow = renderer.shadowMap.enabled;
    sol.shadow.mapSize.set(op.sombraRes || 2048, op.sombraRes || 2048);
    const S = op.sombraTam || 400;
    Object.assign(sol.shadow.camera, { left: -S, right: S, top: S, bottom: -S, near: 10, far: 4000 });
    sol.shadow.bias = -0.0008; sol.shadow.normalBias = 1.2; sol.shadow.radius = 4;
    scene.add(sol, sol.target);
    const hemi = new THREE.HemisphereLight(0xffffff, 0x50555c, op.hemi ?? 0.25);
    scene.add(hemi);
    function tam() {
      const w = contenedor.clientWidth || 800, h = contenedor.clientHeight || 600;
      renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix();
      if (op.alRedimensionar) op.alRedimensionar(w, h);
    }
    new ResizeObserver(tam).observe(contenedor); tam();
    return { renderer, scene, camera, controls, sol, hemi, env, tam };
  }
  // marca sombras en todo lo que cuelga de un objeto
  function sombras(obj, emite = true, recibe = true) {
    obj.traverse(o => { if (o.isMesh) { o.castShadow = emite && !(o.material && o.material.transmission > 0.5); o.receiveShadow = recibe; } });
  }
  // suelo/fondo que solo recibe sombra (o con material propio)
  function suelo(tam, z, mat) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(tam, tam), mat || new THREE.ShadowMaterial({ opacity: 0.22 }));
    m.rotation.x = -Math.PI / 2; m.position.y = z; m.receiveShadow = true;
    return m;
  }
  // instancia un modelo de MOD/HERR: devuelve el grupo ya llevado al marco pedido
  //   marco = "cad" → marco local de comp.py; "natural" → tal cual
  function modelo(nombre, args = [], marco = "cad") {
    const f = (MOD.REG[nombre] || HERR.REG[nombre] || (typeof MESA !== "undefined" ? MESA.REG[nombre] : null));
    if (!f) return null;
    const r = f(...(Array.isArray(args) ? args : [args]));
    const g = new THREE.Group(); g.add(r.g);
    if (marco === "cad" && r.aCAD) { r.g.applyMatrix4(r.aCAD); }
    g.userData.anclas = r.anclas || {}; g.userData.aCAD = r.aCAD; g.userData.nombre = r.nombre;
    return g;
  }
  return { crear, sombras, suelo, modelo };
})();
