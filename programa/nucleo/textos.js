/*
 * textos.js — todo lo que se lee en la pantalla, en un solo sitio para cambiarlo sin tocar la lógica.
 *
 * Reglas (auditoría 1.0, H01 y H02; auditoría 6.1-S F14; ficha del ZE29A, apartado 8):
 * - El valor se muestra en la unidad que da el propio sensor (mg/100 mL de sangre equivalente) pasada a g/L
 *   (÷100, un simple cambio de unidad). No se convierte a mg/L de aire: el ÷220 no lo confirma Winsen.
 * - Nada de "por encima / por debajo del límite para conducir" ni semáforos: siempre "orientativo, no sirve
 *   para saber si puedes conducir".
 * - Aviso de la foto a la vista (dato personal, H17–H18): qué se guarda, cuánto y cómo evitarla.
 */
(function (raiz, fabrica) {
  "use strict";
  const enNode = typeof module === "object" && module.exports;
  const dep = (n) => (enNode ? require("./" + n) : raiz.ALC[n]);
  const m = fabrica(dep("util"));
  if (enNode) module.exports = m;
  else (raiz.ALC = raiz.ALC || {}).textos = m;
})(typeof globalThis !== "undefined" ? globalThis : this, function (U) {
  "use strict";

  /** Valor bruto del sensor (mg/100 mL) → texto en la unidad configurada. */
  function formatoValor(v, unidad, factorMgL) {
    if (!Number.isInteger(v)) return { texto: "—", unidad: "", corto: "—" };
    if (unidad === "mg/100mL") return { texto: String(v), unidad: "mg/100 mL", corto: String(v) };
    if (unidad === "mg/L") {
      const f = factorMgL || 220;
      return { texto: U.numES(v / f, 2), unidad: "mg/L", corto: U.numES(v / f, 2) };
    }
    return { texto: U.numES(v / 100, 2), unidad: "g/L", corto: U.numES(v / 100, 2) };
  }

  const LEGAL = "Resultado orientativo, no homologado · No sirve para saber si puedes conducir · Si bebes, no conduzcas";
  const AVISO_FOTO =
    "Al jugar se hace una foto. Si entras en el top 10 se queda en esta pantalla; si no, se borra en 24 h. ¿Sin foto? Tapa la cámara en la cuenta atrás.";

  /** Frases de la pantalla de espera. {record}, {total} y {precio} se rellenan; las que no tienen datos se saltan. */
  const FRASES_ESPERA = [
    "¿Quién de tu mesa sopla más?",
    "Pide una pajita en la barra y reta a tus amigos",
    "El récord del local está en {record}. ¿Alguien se atreve?",
    "Ya han soplado {total} personas en esta máquina",
    "Entra en el top 10 y tu foto se queda aquí",
    "Paga con tarjeta, móvil o reloj · {precio}",
    "Tu resultado y tu puesto en menos de un minuto",
  ];

  function frasesEspera(d) {
    const out = [];
    for (const f of FRASES_ESPERA) {
      if (f.includes("{record}") && !d.record) continue;
      if (f.includes("{total}") && !(d.total >= 10)) continue;
      out.push(f.replace("{record}", d.record).replace("{total}", U.enteroES(d.total)).replace("{precio}", d.precio));
    }
    return out;
  }

  /**
   * Titular y frase del resultado según el puesto. Nunca compara con límites legales.
   * celebracion: record | top10 | alto | medio | bajo | cero (la pantalla elige animación con esto).
   */
  function mensajeResultado(r) {
    if (r.total === 1) return { celebracion: r.valor === 0 ? "cero" : "top10", titular: "¡ESTRENAS EL RANKING!", frase: "Eres la primera persona en soplar en esta máquina" };
    if (r.valor === 0) return { celebracion: "cero", titular: "¡CERO PATATERO!", frase: "Limpio como el agua" };
    if (r.record) return { celebracion: "record", titular: "¡NUEVO RÉCORD DEL LOCAL!", frase: "Nadie había llegado tan alto en esta máquina" };
    if (r.puestoTop) return { celebracion: "top10", titular: `¡ENTRAS EN EL TOP 10!`, frase: `Puesto ${r.puestoTop} de los diez mejores. Tu foto se queda en la pantalla` };
    const p = r.topPct;
    if (p != null && p <= 10) return { celebracion: "alto", titular: "¡DE LOS QUE MÁS!", frase: `Estás en el ${p} % que más ha soplado aquí` };
    if (p != null && p <= 25) return { celebracion: "alto", titular: "¡MUY ARRIBA!", frase: "Por encima de 3 de cada 4 personas" };
    if (p != null && p <= 50) return { celebracion: "medio", titular: "¡POR ENCIMA DE LA MEDIA!", frase: "Más que la mitad del local" };
    if (p != null) return { celebracion: "bajo", titular: "MÁS TRANQUI QUE LA MEDIA", frase: "La mitad del local ha soplado más que tú" };
    return { celebracion: "medio", titular: "¡YA ESTÁS EN EL RANKING!", frase: "De las primeras personas en probar la máquina" };
  }

  /** Textos de los avisos que cortan una prueba. */
  function aviso(codigo, o = {}) {
    const dinero = o.gratis ? "Prueba anulada" : o.reembolso === false ? "Te devolveremos el dinero a la tarjeta" : "Te devolvemos el dinero a la tarjeta";
    switch (codigo) {
      case "SIN_SOPLIDO":
        return { titulo: "No has soplado", texto: dinero, detalle: "Cuando quieras, vuelve a pagar y sopla al ver la señal" };
      case "CORTES":
        return { titulo: "No has soplado seguido", texto: dinero, detalle: `Hay que soplar ${o.segundos || 4} segundos sin parar` };
      case "SENSOR_NO_RESPONDE":
      case "SENSOR":
      case "SENSOR_NO_ARRANCA":
      case "RESULTADO_INCOHERENTE":
      case "SIN_RESULTADO":
      case "TIEMPO_SESION":
        return { titulo: "Algo ha fallado", texto: dinero, detalle: "Perdona las molestias" };
      default:
        return { titulo: "Algo ha fallado", texto: dinero, detalle: "Perdona las molestias" };
    }
  }

  return {
    formatoValor,
    frasesEspera,
    mensajeResultado,
    aviso,
    LEGAL,
    AVISO_FOTO,
    CTA_PAGO: "Acerca tu tarjeta o el móvil al lector",
    PAGO_NO_DISPONIBLE: "Ahora mismo no se puede pagar",
    PREPARANDO: { titulo: "PREPARANDO EL SENSOR", pasos: ["Coge una pajita nueva en la barra", "Métela en la boquilla", "Espera a la señal y sopla"], nota: "No soples todavía" },
    SOPLA: { titulo: "¡SOPLA!", sub: "Fuerte y sin parar" },
    SOPLANDO: ["¡SIGUE!", "¡SIGUE, SIGUE!", "¡NO PARES!", "¡YA CASI!"],
    CORTADO: { titulo: "¡HAS PARADO!", sub: "Hay que soplar seguido. Prepárate otra vez" },
    ANALIZANDO: { titulo: "¡MIRA A LA CÁMARA!", sub: "Analizando tu soplido…", tapa: "¿Sin foto? Tapa la cámara" },
    PAGADO: { titulo: "¡PAGO ACEPTADO!", sub: "Vamos allá", credito: "Tenías una prueba pagada. ¡Vamos!" },
    FUERA: { titulo: "FUERA DE SERVICIO", sub: "Volvemos enseguida" },
  };
});
