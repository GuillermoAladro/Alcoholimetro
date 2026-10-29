/*
 * kiosco.js — la página de Chromium en la Pi: recibe las vistas por SSE y las pinta con nucleo/pantalla.js.
 *
 * - Si se corta la conexión con el programa (por ejemplo, porque se está reiniciando), EventSource vuelve a
 *   conectar solo; mientras tanto se sigue viendo la última vista.
 * - Cada 10 s manda un latido con los ms por cuadro y la memoria. Si los latidos dejan de llegar, el programa
 *   reinicia Chromium (pi/sistema.js).
 * - Si la página lleva 60 s sin noticias del programa o acumula errores, se recarga sola.
 */
(function () {
  "use strict";
  const { Pantalla } = ALC.pantalla;
  const cv = document.getElementById("pantalla");

  // cámara en directo: solo se pide /camara.mjpg mientras la vista lo necesita
  const img = new Image();
  let pedida = false;
  const camara = {
    lista: () => pedida && img.complete && img.naturalWidth > 0,
    dibujar(ctx, x, y, w, h) {
      if (!this.lista()) return false;
      const iw = img.naturalWidth;
      const ih = img.naturalHeight;
      const k = Math.max(w / iw, h / ih);
      const sw = w / k;
      const sh = h / k;
      ctx.drawImage(img, (iw - sw) / 2, (ih - sh) / 2.6, sw, sh, x, y, w, h);
      return true;
    },
  };
  function camaraVista(si) {
    if (si && !pedida) {
      pedida = true;
      img.src = "/camara.mjpg?" + Date.now();
    } else if (!si && pedida) {
      pedida = false;
      img.src = ""; // cierra la conexión
    }
  }

  const p = new Pantalla(cv, { fuenteCamara: camara, fps: 30 });
  let errores = 0;
  let ultimoError = "";
  let ultimaNoticia = Date.now();

  window.addEventListener("error", (e) => {
    errores++;
    ultimoError = String(e.message || e.error || "error").slice(0, 300);
    if (errores > 50) location.reload();
  });

  function conectar() {
    const es = new EventSource("/eventos");
    es.addEventListener("vista", (ev) => {
      ultimaNoticia = Date.now();
      let v;
      try {
        v = JSON.parse(ev.data);
      } catch (e) {
        return;
      }
      camaraVista(v.fase === "analizando" && v.d && v.d.camara);
      p.mostrar(v);
    });
    es.addEventListener("latido", () => (ultimaNoticia = Date.now()));
    es.addEventListener("recargar", () => location.reload());
  }

  setInterval(() => {
    if (Date.now() - ultimaNoticia > 60000) location.reload();
    const m = performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) : null;
    fetch("/latido", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ms: p.msMedio || 0, calidad: p.calidad, memoria_mb: m, errores, error: ultimoError || undefined }),
    }).catch(() => {});
    ultimoError = "";
  }, 10000);

  // se espera a las tipografías (son locales: tarda milisegundos) antes de pintar
  const fuentes = ["700 20px \"Big Shoulders Display\"", "800 20px \"Big Shoulders Display\"", "900 20px \"Big Shoulders Display\"", "400 20px Archivo", "600 20px Archivo", "800 20px Archivo"];
  Promise.race([Promise.all(fuentes.map((f) => document.fonts.load(f))), new Promise((r) => setTimeout(r, 3000))]).finally(() => {
    p.arrancar();
    conectar();
  });
})();
