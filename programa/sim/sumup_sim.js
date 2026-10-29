/*
 * sumup_sim.js — SumUp simulado: la nube (Cloud API) y el lector Solo con su pantalla.
 *
 * Da un `fetch` que entiende las mismas rutas que nucleo/sumup.js y contesta con las formas del OpenAPI
 * (componentes/sumup-solo/README.md, apartado 4). El lector simulado:
 *   - con un cobro abierto enseña el importe y espera tarjeta; el cobro caduca a los 60 s (valid_until);
 *   - pasarTarjeta(true|false) imita acercar una tarjeta: "procesando" ~1,8 s y aprobado o rechazado;
 *   - terminate cancela lo que espera; READER_BUSY si se pide otro cobro con uno abierto.
 * Fallos que se pueden provocar: sin internet, lector apagado, errores 500, lentitud.
 */
(function (raiz, fabrica) {
  "use strict";
  const enNode = typeof module === "object" && module.exports;
  const dep = (n) => (enNode ? require("../nucleo/" + n) : raiz.ALC[n]);
  const m = fabrica(dep("util"));
  if (enNode) module.exports = m;
  else (raiz.ALC_SIM = raiz.ALC_SIM || {}).sumup = m;
})(typeof globalThis !== "undefined" ? globalThis : this, function (U) {
  "use strict";

  const VIDA_COBRO_MS = 60000;

  function respuesta(status, cuerpo) {
    const texto = cuerpo === undefined ? "" : typeof cuerpo === "string" ? cuerpo : JSON.stringify(cuerpo);
    return { ok: status >= 200 && status < 300, status, text: async () => texto, json: async () => JSON.parse(texto || "null") };
  }

  function problema(status, codigo, detalle) {
    return respuesta(status, { type: "https://developer.sumup.com/problem/" + codigo.toLowerCase(), title: codigo, status, detail: detalle || codigo });
  }

  class NubeSumUp {
    /** @param {object} o { reloj, api_key, merchant_code, reader_id } */
    constructor(o) {
      this.reloj = o.reloj;
      this.clave = o.api_key || "sim-clave";
      this.comercio = o.merchant_code || "MSIM0001";
      this.lector = o.reader_id || "rdr_sim_solo";
      this.cobros = new Map(); // checkout_id → cobro
      this.transacciones = new Map(); // id → transacción
      this.actual = null; // cobro que el lector tiene en pantalla
      this.pantalla = { modo: "inicio" }; // lo que enseña el Solo: inicio | esperando | procesando | aprobado | rechazado | cancelado | apagado
      // sinInternet: la petición no sale (como Node sin red: EAI_AGAIN). cortarRespuesta: la petición llega y se
      // atiende, pero la respuesta se pierde (ECONNRESET): el caso en que no se sabe si el cobro existe.
      this.fallos = { sinInternet: false, cortarRespuesta: 0, lectorApagado: false, error500: 0, latenciaMs: 120 };
      this.bateria = 87;
      this.em = U.crearEmisor();
      this.grupoPantalla = this.reloj.grupo();
      this.fetch = this.fetch.bind(this);
    }

    on(ev, fn) {
      return this.em.on(ev, fn);
    }

    _pantalla(modo, extra) {
      this.pantalla = Object.assign({ modo }, extra || {});
      this.em.emit("pantalla", this.pantalla);
    }

    _caducar() {
      const c = this.actual;
      if (c && c.status === "pending" && !c.procesando && this.reloj.ahora() >= c.validoHasta) {
        c.status = "cancelled";
        this.actual = null;
        this._pantalla("inicio");
      }
    }

    // ---------------------------------------------------------------- lo que hace la persona en el lector
    /**
     * Acerca una tarjeta. Devuelve false si el lector no está pidiendo tarjeta. procesoMs: lo que tarda en
     * aprobarse (1,8 s; con PIN o una autorización lenta puede ser medio minuto o más).
     */
    pasarTarjeta(aceptada = true, procesoMs = 1800) {
      this._caducar();
      const c = this.actual;
      if (!c || c.status !== "pending" || c.procesando || this.fallos.lectorApagado) return false;
      c.procesando = true;
      this._pantalla("procesando", { importe: c.importe });
      this.grupoPantalla.cancelar();
      this.grupoPantalla = this.reloj.grupo();
      this.grupoPantalla.temporizador(procesoMs, () => {
        c.procesando = false;
        if (aceptada) {
          c.status = "successful";
          const tid = "TX" + U.hex(10).toUpperCase();
          c.transaction_id = tid;
          this.transacciones.set(tid, {
            id: tid,
            transaction_code: "T" + U.hex(8).toUpperCase(),
            status: "SUCCESSFUL",
            amount: c.importe / 100,
            currency: "EUR",
            client_transaction_id: c.client_transaction_id,
            foreign_transaction_id: c.foreign_transaction_id,
            refunded: false,
          });
          this._pantalla("aprobado", { importe: c.importe });
        } else {
          c.status = "failed";
          c.fallo = "Tarjeta rechazada";
          this._pantalla("rechazado", { importe: c.importe });
        }
        this.actual = null;
        this.grupoPantalla.temporizador(2500, () => this._pantalla("inicio"));
      });
      return true;
    }

    // ---------------------------------------------------------------- la API
    async fetch(url, op = {}) {
      if (this.fallos.sinInternet) {
        await this.reloj.esperar(400);
        const e = new TypeError("fetch failed");
        e.cause = { code: "EAI_AGAIN", message: "getaddrinfo EAI_AGAIN api.sumup.com" };
        throw e;
      }
      if (this.fallos.cortarRespuesta && Math.random() < this.fallos.cortarRespuesta) {
        // se atiende de verdad y la respuesta no llega
        await this._atender(url, op);
        const e = new TypeError("fetch failed");
        e.cause = { code: "ECONNRESET", message: "socket hang up" };
        throw e;
      }
      return this._atender(url, op);
    }

    async _atender(url, op) {
      const metodo = (op.method || "GET").toUpperCase();
      const u = new URL(url);
      const ruta = u.pathname;
      await this.reloj.esperar(this.fallos.latenciaMs * (0.6 + Math.random() * 0.8));
      const auth = (op.headers && (op.headers.Authorization || op.headers.authorization)) || "";
      if (auth !== "Bearer " + this.clave) return problema(401, "UNAUTHORIZED", "invalid api key");
      if (this.fallos.error500 && Math.random() < this.fallos.error500) return problema(503, "SERVICE_UNAVAILABLE");
      const cuerpo = op.body ? U.jsonSeguro(op.body) : undefined;
      this._caducar();

      const baseLector = `/v0.1/merchants/${this.comercio}/readers/${this.lector}`;
      if (ruta === baseLector + "/checkout" && metodo === "POST") return this._crear(cuerpo);
      if (ruta.startsWith(baseLector + "/checkout/") && metodo === "GET") {
        const c = this.cobros.get(decodeURIComponent(ruta.slice((baseLector + "/checkout/").length)));
        if (!c) return problema(404, "NOT_FOUND");
        return respuesta(200, {
          data: {
            id: c.id,
            status: c.status,
            payment_status: c.status.toUpperCase(),
            payment_failure_reason: c.fallo || undefined,
            client_transaction_id: c.client_transaction_id,
            valid_until: new Date(c.validoHasta).toISOString(),
            created_at: new Date(c.creado).toISOString(),
          },
        });
      }
      if (ruta === baseLector + "/terminate" && metodo === "POST") {
        if (this.fallos.lectorApagado) return problema(422, "READER_OFFLINE");
        const c = this.actual;
        if (c && c.status === "pending" && !c.procesando) {
          c.status = "cancelled";
          this.actual = null;
          this._pantalla("cancelado");
          this.grupoPantalla.temporizador(1200, () => this._pantalla("inicio"));
        }
        return respuesta(202, "");
      }
      if (ruta === baseLector + "/status" && metodo === "GET") {
        const c = this.actual;
        return respuesta(200, {
          data: {
            status: this.fallos.lectorApagado ? "OFFLINE" : "ONLINE",
            state: c && c.status === "pending" ? "WAITING_FOR_CARD" : "IDLE",
            battery_level: this.bateria,
            battery_temperature: 31,
            connection_type: "Wi-Fi",
            firmware_version: "3.3.41.0",
            last_activity: new Date(this.reloj.ahora()).toISOString(),
          },
        });
      }
      if (ruta === `/v2.1/merchants/${this.comercio}/transactions` && metodo === "GET") {
        const ctid = u.searchParams.get("client_transaction_id");
        const ftid = u.searchParams.get("foreign_transaction_id");
        for (const t of this.transacciones.values()) {
          if ((ctid && t.client_transaction_id === ctid) || (ftid && t.foreign_transaction_id === ftid)) return respuesta(200, t);
        }
        return problema(404, "NOT_FOUND");
      }
      const mr = new RegExp(`^/v1\\.0/merchants/${this.comercio}/payments/([^/]+)/refunds$`).exec(ruta);
      if (mr && metodo === "POST") {
        const t = this.transacciones.get(decodeURIComponent(mr[1]));
        if (!t) return problema(404, "NOT_FOUND");
        if (t.refunded) return problema(409, "CONFLICT", "already refunded");
        t.refunded = true;
        t.status = "REFUNDED";
        this.em.emit("reembolso", t);
        return respuesta(204, "");
      }
      return problema(404, "NOT_FOUND", metodo + " " + ruta);
    }

    _crear(cuerpo) {
      if (this.fallos.lectorApagado) return problema(422, "READER_OFFLINE", "reader is offline");
      if (!cuerpo || !cuerpo.total_amount || !Number.isInteger(cuerpo.total_amount.value) || cuerpo.total_amount.value < 100) {
        return problema(422, "INVALID_AMOUNT");
      }
      if (this.actual && this.actual.status === "pending") return problema(422, "READER_BUSY", "reader has an ongoing checkout");
      const id = "co_" + U.hex(16);
      const c = {
        id,
        status: "pending",
        importe: cuerpo.total_amount.value,
        client_transaction_id: "ctx-" + U.hex(12),
        foreign_transaction_id: cuerpo.affiliate ? cuerpo.affiliate.foreign_transaction_id : null,
        creado: this.reloj.ahora(),
        validoHasta: this.reloj.ahora() + VIDA_COBRO_MS,
      };
      this.cobros.set(id, c);
      // la pantalla del Solo pasa a pedir tarjeta: lo que tuviera programado (volver a "inicio") ya no vale
      this.grupoPantalla.cancelar();
      this.grupoPantalla = this.reloj.grupo();
      // la nube no necesita guardar más que los últimos cobros
      if (this.cobros.size > 300) this.cobros.delete(this.cobros.keys().next().value);
      this.actual = c;
      this._pantalla("esperando", { importe: c.importe });
      return respuesta(201, { data: { checkout_id: id, client_transaction_id: c.client_transaction_id } });
    }

    /** Estado de la nube para guardarlo (la simulación lo guarda en IndexedDB con la tarjeta SD simulada). */
    volcar() {
      return { cobros: Array.from(this.cobros.values()).slice(-120), transacciones: Array.from(this.transacciones.values()).slice(-300) };
    }

    cargar(v) {
      if (!v || !Array.isArray(v.cobros)) return;
      this.cobros = new Map(v.cobros.map((c) => [c.id, Object.assign({}, c, c.status === "pending" ? { status: "cancelled" } : {})]));
      this.transacciones = new Map((v.transacciones || []).map((t) => [t.id, t]));
    }

    /** Para la simulación: ¿el lector está pidiendo tarjeta ahora mismo? */
    pidiendoTarjeta() {
      this._caducar();
      return !!(this.actual && this.actual.status === "pending" && !this.actual.procesando);
    }

    /** Llama a esto cada segundo para que un cobro caduque aunque nadie consulte. */
    tic() {
      this._caducar();
    }
  }

  return { NubeSumUp };
});
