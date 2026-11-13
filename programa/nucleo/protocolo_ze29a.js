/*
 * protocolo_ze29a.js — tramas del sensor de alcohol Winsen ZE29A-C2H5OH (manual V1.1).
 *
 * Fuente: componentes/winsen-ze29a/README.md, apartado 5 (las 18 tramas de ejemplo del manual cuadran
 * con este código: ver pruebas/protocolo.test.js).
 *
 *   UART 9600 8N1, 3,3 V. Tramas de 9 bytes, enteros con el byte alto primero.
 *   petición:  FF 01 CMD d0 d1 d2 d3 d4 CS
 *   respuesta: FF CMD r2 r3 r4 r5 r6 r7 CS
 *   CS = (−(b1 + … + b7)) & 0xFF   (complemento a dos; no incluye los bytes 0 y 8)
 *
 * Lector de tramas (auditorías 6.1-S F13 y 6-A A6A-09): búfer persistente, busca 0xFF, valida longitud y
 * checksum, y si una ventana de 9 bytes no vale descarta UN solo byte y vuelve a buscar (así un 0xFF espurio
 * o basura delante de una trama buena no hacen perderla). Los fragmentos se guardan hasta completar la trama.
 */
(function (raiz, fabrica) {
  "use strict";
  const enNode = typeof module === "object" && module.exports;
  const m = fabrica();
  if (enNode) module.exports = m;
  else {
    const A = (raiz.ALC = raiz.ALC || {});
    A.protocolo = A.protocolo_ze29a = m; // mismo nombre que el archivo, como en Node
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const CMD = {
    ESTADO: 0x85, // leer estado
    RESULTADO: 0x86, // leer resultado (solo vale en 0x37)
    CAMBIAR: 0x87, // cambiar estado (31→32, 37→31, 37→32)
    LEER_SOPLIDO: 0x88, // segundos de soplido (1–10)
    FIJAR_SOPLIDO: 0x89,
    LEER_UMBRALES: 0x90, // bebido / ebrio (mg/100 mL)
    FIJAR_UMBRALES: 0x91,
    LEER_PRESION: 0x92, // umbral de presión (5–200, sin unidades)
    FIJAR_PRESION: 0x93,
  };

  const EST = {
    REPOSO: 0x31,
    PRECALENTANDO: 0x32, // 10 s y pasa a 0x33
    ESPERANDO_SOPLIDO: 0x33, // 1 min sin soplido → 0x31
    SOPLANDO: 0x34, // N s seguidos → 0x36; si se corta → 0x35
    SOPLIDO_CORTADO: 0x35, // a los 3 s → 0x32
    CALCULANDO: 0x36, // 2–5 s → 0x37
    RESULTADO_LISTO: 0x37, // se lee con 0x86; a los 20 s → 0x31
  };

  const NOMBRE_ESTADO = {
    0x31: "reposo",
    0x32: "precalentando",
    0x33: "esperando soplido",
    0x34: "soplando",
    0x35: "soplido cortado",
    0x36: "calculando",
    0x37: "resultado listo",
  };

  /** Tiempos del manual (ms). Los usa la simulación y la pantalla para dibujar progresos. */
  const TIEMPOS = {
    precalentar: 10000,
    esperaSoplido: 60000,
    cortadoAPrecalentar: 3000,
    calcularMin: 2000,
    calcularMax: 5000,
    resultadoVigente: 20000,
  };

  /**
   * Fondo de escala del manual: 1,0 mg/L de aire. En mg/100 mL no hay cifra oficial; el rango de los umbrales
   * (15–220) apunta a 220. Por encima se marca "saturado". Más de 500 mg/100 mL (5 g/L) no es creíble:
   * se trata como trama corrupta, nunca como resultado.
   */
  const VALOR_MAXIMO_CREIBLE = 500;
  const FONDO_ESCALA = 220;

  function checksum(b) {
    let s = 0;
    for (let i = 1; i <= 7; i++) s += b[i] | 0;
    return -s & 0xff;
  }

  /** Petición de 9 bytes: FF 01 cmd d0..d4 cs. */
  function peticion(cmd, ...datos) {
    if (datos.length > 5) throw new Error("como mucho 5 bytes de datos");
    const b = new Uint8Array(9);
    b[0] = 0xff;
    b[1] = 0x01;
    b[2] = cmd & 0xff;
    for (let i = 0; i < datos.length; i++) {
      const v = datos[i];
      if (!Number.isInteger(v) || v < 0 || v > 255) throw new Error("dato fuera de byte: " + v);
      b[3 + i] = v;
    }
    b[8] = checksum(b);
    return b;
  }

  /** Respuesta de 9 bytes: FF cmd r2..r7 cs (la usa la simulación del sensor). */
  function respuesta(cmd, ...datos) {
    const b = new Uint8Array(9);
    b[0] = 0xff;
    b[1] = cmd & 0xff;
    for (let i = 0; i < Math.min(6, datos.length); i++) b[2 + i] = datos[i] & 0xff;
    b[8] = checksum(b);
    return b;
  }

  function tramaValida(b) {
    return b && b.length === 9 && b[0] === 0xff && checksum(b) === b[8];
  }

  /**
   * Lector incremental de tramas. alimentar(bytes) devuelve las tramas completas y válidas que haya.
   * Guarda estadísticas de bytes descartados para el registro (prueba de sacudir cables, P8.6).
   */
  class LectorTramas {
    constructor() {
      this.buf = new Uint8Array(64);
      this.n = 0;
      this.descartados = 0;
      this.malas = 0;
    }
    reiniciar() {
      this.n = 0;
    }
    alimentar(bytes) {
      const salida = [];
      for (let i = 0; i < bytes.length; i++) {
        if (this.n === this.buf.length) {
          // nunca debería pasar (se procesa en cada byte), pero el búfer no puede crecer sin límite
          this._quitar(1);
          this.descartados++;
        }
        this.buf[this.n++] = bytes[i];
        this._procesar(salida);
      }
      return salida;
    }
    _quitar(k) {
      this.buf.copyWithin(0, k, this.n);
      this.n -= k;
    }
    _procesar(salida) {
      for (;;) {
        // descarta todo lo que hay antes del primer 0xFF
        let i = 0;
        while (i < this.n && this.buf[i] !== 0xff) i++;
        if (i > 0) {
          this.descartados += i;
          this._quitar(i);
        }
        if (this.n < 9) return; // falta trama: se espera a más bytes
        const v = this.buf.slice(0, 9);
        if (checksum(v) === v[8]) {
          salida.push(v);
          this._quitar(9);
        } else {
          // ventana mala: se quita SOLO el 0xFF inicial y se vuelve a buscar
          this.malas++;
          this.descartados++;
          this._quitar(1);
        }
      }
    }
  }

  // ------------------------------------------------------------------ interpretación de respuestas
  /** Estado (0x31–0x37) o lanza Error. Avisa (no rechaza) si los bytes 3–7 no son cero. */
  function interpretarEstado(f) {
    if (!tramaValida(f) || f[1] !== CMD.ESTADO) throw new Error("respuesta de estado no válida");
    const e = f[2];
    if (e < 0x31 || e > 0x37) throw new Error("estado desconocido 0x" + e.toString(16));
    let extra = false;
    for (let i = 3; i <= 7; i++) if (f[i] !== 0) extra = true;
    return { estado: e, extra };
  }

  /**
   * Resultado de 0x86: valor (mg/100 mL, entero, bytes 2–3) y alarma (byte 7: 0, 1 o 2).
   * Comprueba rango creíble. NO decide si el ciclo es nuevo: eso lo hace quien llama (sensor_ze29a.js).
   */
  function interpretarResultado(f) {
    if (!tramaValida(f) || f[1] !== CMD.RESULTADO) throw new Error("respuesta de resultado no válida");
    const valor = (f[2] << 8) | f[3];
    if (valor > VALOR_MAXIMO_CREIBLE) throw new Error(`valor fuera de rango: ${valor} mg/100 mL`);
    const alarma = f[7] <= 2 ? f[7] : null;
    let extra = false;
    for (let i = 4; i <= 6; i++) if (f[i] !== 0) extra = true;
    if (f[7] > 2) extra = true;
    return { valor, alarma, extra, saturado: valor > FONDO_ESCALA };
  }

  /** Respuesta de 0x87/0x89/0x91/0x93: byte 2 = 0x01 bien, 0x02 fallo. */
  function interpretarAcuse(f, cmd) {
    if (!tramaValida(f) || f[1] !== cmd) throw new Error("acuse no válido");
    return f[2] === 0x01;
  }

  return {
    CMD,
    EST,
    NOMBRE_ESTADO,
    TIEMPOS,
    VALOR_MAXIMO_CREIBLE,
    FONDO_ESCALA,
    checksum,
    peticion,
    respuesta,
    tramaValida,
    LectorTramas,
    interpretarEstado,
    interpretarResultado,
    interpretarAcuse,
  };
});
