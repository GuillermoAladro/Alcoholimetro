/* Vistas de ejemplo para revisar cada pantalla. window.escena(nombre, ms) deja la pantalla en ese instante. */
(async function () {
  const { Pantalla } = ALC.pantalla;
  const cam = new ALC_SIM.camara.CamaraSimulada();
  cam.encendida = true;
  let T = 100000;
  const p = new Pantalla(document.getElementById("cv"), { fuenteCamara: cam, calidad: "alta" });
  p.ahora = () => T;
  window.__p = p;
  const urls = [];
  for (let i = 0; i < 10; i++) urls.push(URL.createObjectURL(new Blob([await cam.retrato(1000 + i * 77)], { type: "image/jpeg" })));
  const vals = ["1,46", "1,31", "1,22", "1,18", "1,02", "0,97", "0,93", "0,88", "0,85", "0,81"];
  const fechas = ["hoy", "ayer", "hace 3 días", "12 oct", "hoy", "hace 5 días", "2 oct", "ayer", "28 sept", "hoy"];
  const top = vals.map((v, i) => ({ puesto: i + 1, id: "x" + i, valor: v, fecha: fechas[i], foto: i === 6 ? null : urls[i] }));
  const comunes = { precio: "2,00 €", unidad: "g/L", total: 362, top, record: "1,46 g/L", pago: { estado: "esperando_tarjeta" }, pausa_ms: 0, gratis: false, posiciones: { lector: "arriba-derecha", boquilla: "arriba-izquierda", camara: "arriba-izquierda" } };
  const fotoRes = URL.createObjectURL(new Blob([await cam.retrato(4242)], { type: "image/jpeg" }));
  // las fuentes del lienzo no se cargan solas hasta que se usan: se piden antes
  await Promise.all(["700 20px \"Big Shoulders Display\"", "800 20px \"Big Shoulders Display\"", "900 20px \"Big Shoulders Display\"", "400 20px Archivo", "600 20px Archivo", "800 20px Archivo"].map((f) => document.fonts.load(f)));
  // precarga: la caché de la pantalla las tendrá listas
  for (const u of urls.concat([fotoRes])) p.img.obtener(u);
  await new Promise((r) => setTimeout(r, 400));
  const V = {
    espera: { fase: "espera", d: {} },
    espera_vacia: { fase: "espera", d: {}, top: [], total: 0, record: null },
    espera_sin_pago: { fase: "espera", d: {}, pago: { estado: "no_disponible", motivo: "sin conexión con el sistema de pago" } },
    fuera: { fase: "fuera_servicio", d: { motivo: "el sensor no responde" } },
    pagado: { fase: "pagado", d: {} },
    preparando: { fase: "preparando", d: { duracion_ms: 10000, transcurrido_ms: 0 } },
    sopla: { fase: "sopla", d: { limite_ms: 60000, transcurrido_ms: 0, segundos: 4, cortes: 0, max_cortes: 3 } },
    soplando: { fase: "soplando", d: { duracion_ms: 4000, transcurrido_ms: 0 } },
    cortado: { fase: "cortado", d: { espera_ms: 13000, transcurrido_ms: 0, cortes: 1, max_cortes: 3, segundos: 4 } },
    analizando: { fase: "analizando", d: { cuenta_ms: 5000, transcurrido_ms: 0, camara: true } },
    foto: { fase: "analizando", d: { cuenta_ms: 5000, transcurrido_ms: 5000, camara: false, foto: fotoRes, flash: true } },
    resultado_top: { fase: "resultado", d: { valor: "1,24", unidad: "g/L", puesto: 3, total: 363, top_pct: 1, puesto_top: 3, record: false, foto: fotoRes, foto_estado: "top", titular: "¡ENTRAS EN EL TOP 10!", frase: "Puesto 3 de los diez mejores. Tu foto se queda en la pantalla", celebracion: "top10", duracion_ms: 20000 } },
    resultado_medio: { fase: "resultado", d: { valor: "0,41", unidad: "g/L", puesto: 120, total: 360, top_pct: 34, puesto_top: null, foto: fotoRes, foto_estado: "24h", titular: "¡POR ENCIMA DE LA MEDIA!", frase: "Más que la mitad del local", celebracion: "medio", duracion_ms: 20000 } },
    resultado_cero: { fase: "resultado", d: { valor: "0,00", unidad: "g/L", puesto: 290, total: 361, top_pct: 81, foto: null, foto_estado: "tapada", titular: "¡CERO PATATERO!", frase: "Limpio como el agua", celebracion: "cero", duracion_ms: 20000 } },
    aviso: { fase: "aviso", d: { tipo: "error", titulo: "No has soplado", texto: "Te devolvemos el dinero a la tarjeta", detalle: "Cuando quieras, vuelve a pagar y sopla al ver la señal", duracion_ms: 9000 } },
  };
  let n = 0;
  window.escena = (nombre, ms) => {
    const v = Object.assign({ n: ++n, edad_ms: 0 }, comunes, V[nombre]);
    v.d = Object.assign({}, V[nombre].d);
    p.vista = null;
    p.anterior = null;
    p.p.vaciar();
    T += 100000;
    p.mostrar(v);
    p.tTrans = T - 1000;
    // avanza a pasos de 33 ms hasta `ms` (las partículas y animaciones evolucionan como en la máquina)
    const fin = T + ms;
    while (T < fin) {
      T += 33;
      p.cuadro(0.033);
    }
    return p.msMedio || 0;
  };
  window.listo = true;
})();
