/*
 * sumup.js — cliente de la Cloud API de SumUp para el Solo (lector de tarjetas).
 *
 * Rutas y cuerpos sacados de componentes/sumup-solo/README.md, apartado 4 (OpenAPI de SumUp, 20-10-2026).
 * IMPORTANTE: NO están probados contra SumUp de verdad (no hay cuenta ni Solo todavía). La prueba P6.14 del
 * MONTAJE PASO A PASO es la que los valida; si algo no cuadra, se cambia aquí y en ningún otro sitio.
 *
 *   POST /v0.1/merchants/{mc}/readers/{rid}/checkout        crear cobro (201 → data.checkout_id)
 *   GET  /v0.1/merchants/{mc}/readers/{rid}/checkout/{id}   estado: pending | successful | failed | cancelled
 *   POST /v0.1/merchants/{mc}/readers/{rid}/terminate       cancelar lo que espera el lector (202)
 *   GET  /v0.1/merchants/{mc}/readers/{rid}/status          ONLINE/OFFLINE, IDLE/WAITING_FOR_CARD, batería…
 *   GET  /v2.1/merchants/{mc}/transactions?client_transaction_id=… | foreign_transaction_id=…
 *   POST /v1.0/merchants/{mc}/payments/{transaction_id}/refunds   reembolso (sin importe = total)
 *
 * `fetch` se inyecta: en la Pi es el fetch de Node; en la simulación, la nube simulada (sim/sumup_sim.js).
 */
(function (raiz, fabrica) {
  "use strict";
  const enNode = typeof module === "object" && module.exports;
  const dep = (n) => (enNode ? require("./" + n) : raiz.ALC[n]);
  const m = fabrica(dep("util"));
  if (enNode) module.exports = m;
  else (raiz.ALC = raiz.ALC || {}).sumup = m;
})(typeof globalThis !== "undefined" ? globalThis : this, function (U) {
  "use strict";

  // errores de red en los que la petición no llegó a salir de la Pi (no hay conexión, DNS, conexión rechazada):
  // un cobro así no puede existir. Con cualquier otro (corte a mitad, tiempo agotado) puede que sí.
  const NO_ENVIADA = ["ENOTFOUND", "EAI_AGAIN", "ECONNREFUSED", "ENETUNREACH", "EHOSTUNREACH", "ENETDOWN", "EADDRNOTAVAIL", "UND_ERR_CONNECT_TIMEOUT"];

  // fallos de TLS (certificado, portal cautivo del Wi-Fi, versión): la petición HTTP va DESPUÉS del saludo TLS,
  // así que tampoco llegó a salir
  // (solo los del saludo: un error de TLS a mitad de conexión, después de mandar la petición, no cuenta)
  const RE_TLS = /^(CERT_|UNABLE_TO_|SELF_SIGNED|DEPTH_ZERO|ERR_TLS_CERT_|ERR_SSL_WRONG_VERSION_NUMBER$|ERR_SSL_UNSUPPORTED_PROTOCOL$)|_CERT_/;
  const noSalio = (cod) => NO_ENVIADA.includes(cod) || RE_TLS.test(cod);

  function codigoDeRed(e) {
    for (let x = e, i = 0; x && i < 4; x = x.cause, i++) {
      if (x.code) return String(x.code);
      // varias direcciones (IPv4 e IPv6) fallan a la vez: AggregateError con un error por dirección
      if (Array.isArray(x.errors) && x.errors.length) {
        const cods = x.errors.map((y) => (y && y.code ? String(y.code) : ""));
        if (cods.every((c) => c && noSalio(c))) return cods[0];
        return cods.find((c) => c && !noSalio(c)) || "";
      }
    }
    return "";
  }

  const CODIGOS = ["READER_BUSY", "READER_OFFLINE", "READER_NOT_FOUND", "INVALID_AMOUNT", "UNAUTHORIZED", "NOT_FOUND"];

  class ErrorSumUp extends Error {
    /** http: código HTTP (0 = sin respuesta: red caída o tiempo agotado); codigo: READER_BUSY, … o null */
    constructor(http, codigo, detalle) {
      super(`SumUp ${http || "sin respuesta"}${codigo ? " " + codigo : ""}${detalle ? ": " + detalle : ""}`);
      this.http = http;
      this.codigo = codigo;
      this.detalle = detalle;
      this.red = http === 0;
      this.noEnviada = false;
    }
  }

  class ClienteSumUp {
    /**
     * @param {object} o { fetch, reloj, registro, config: { api_key, merchant_code, reader_id, app_id,
     *                     affiliate_key, base_url, timeout_ms } }
     */
    constructor(o) {
      this.fetch = o.fetch;
      this.reloj = o.reloj;
      this.log = o.registro || { depurar() {}, info() {}, aviso() {}, error() {} };
      const c = o.config || {};
      this.clave = c.api_key || "";
      this.comercio = c.merchant_code || "";
      this.lector = c.reader_id || "";
      this.appId = c.app_id || "";
      this.claveAfiliado = c.affiliate_key || "";
      this.base = (c.base_url || "https://api.sumup.com").replace(/\/+$/, "");
      this.timeoutMs = c.timeout_ms || 15000;
      this.em = U.crearEmisor();
    }

    on(ev, fn) {
      return this.em.on(ev, fn);
    }

    /** La Affiliate Key es obligatoria (ficha #9): sin foreign_transaction_id no se puede buscar un pago perdido. */
    configurado() {
      return !!(this.clave && this.comercio && this.lector && this.appId && this.claveAfiliado);
    }

    get rutaLector() {
      return `/v0.1/merchants/${encodeURIComponent(this.comercio)}/readers/${encodeURIComponent(this.lector)}`;
    }

    async _peticion(metodo, ruta, cuerpo) {
      const ctl = typeof AbortController !== "undefined" ? new AbortController() : null;
      let vencido = false;
      const t = this.reloj.temporizador(this.timeoutMs, () => {
        vencido = true;
        if (ctl) ctl.abort();
      });
      const t0 = this.reloj.mono();
      let res;
      let texto = "";
      try {
        res = await this.fetch(this.base + ruta, {
          method: metodo,
          headers: {
            Authorization: "Bearer " + this.clave,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
          signal: ctl ? ctl.signal : undefined,
        });
        texto = await res.text();
      } catch (e) {
        t.cancelar();
        const cod = vencido ? "" : codigoDeRed(e);
        const err = new ErrorSumUp(0, vencido ? "TIEMPO" : null, vencido ? "sin respuesta en " + this.timeoutMs + " ms" : (e.message || String(e)) + (cod ? " (" + cod + ")" : ""));
        err.noEnviada = !vencido && !!cod && noSalio(cod);
        this.em.emit("peticion", { metodo, ruta, http: 0, ms: Math.round(this.reloj.mono() - t0), error: err.detalle });
        throw err;
      }
      t.cancelar();
      const json = texto ? U.jsonSeguro(texto) : {};
      this.em.emit("peticion", { metodo, ruta, http: res.status, ms: Math.round(this.reloj.mono() - t0), cuerpo: cuerpo, respuesta: texto.slice(0, 400) });
      if (!res.ok) {
        let codigo = null;
        const busca = texto.toUpperCase();
        for (const c of CODIGOS) if (busca.includes(c)) codigo = c;
        if (!codigo && res.status === 401) codigo = "UNAUTHORIZED";
        throw new ErrorSumUp(res.status, codigo, texto.slice(0, 200));
      }
      return json === undefined ? {} : json;
    }

    static _datos(j) {
      return j && typeof j === "object" && j.data && typeof j.data === "object" ? j.data : j || {};
    }

    /**
     * Crea un cobro en el lector. `ref` es nuestra referencia única (va como foreign_transaction_id para poder
     * buscar el pago si se pierde la respuesta). Devuelve { checkout_id, client_transaction_id }.
     */
    async crearCobro(ref, centimos, moneda, descripcion) {
      const cuerpo = {
        total_amount: { currency: moneda || "EUR", minor_unit: 2, value: centimos },
        description: descripcion || "Alcoholimetro",
      };
      if (this.appId && this.claveAfiliado) {
        cuerpo.affiliate = { app_id: this.appId, key: this.claveAfiliado, foreign_transaction_id: ref };
      }
      const d = ClienteSumUp._datos(await this._peticion("POST", this.rutaLector + "/checkout", cuerpo));
      if (!d.checkout_id) throw new ErrorSumUp(201, "SIN_ID", "respuesta sin checkout_id");
      return { checkout_id: String(d.checkout_id), client_transaction_id: d.client_transaction_id || null };
    }

    /** Estado de un cobro: { status: pending|successful|failed|cancelled, client_transaction_id, … } */
    async estadoCobro(checkoutId) {
      const d = ClienteSumUp._datos(await this._peticion("GET", `${this.rutaLector}/checkout/${encodeURIComponent(checkoutId)}`));
      const status = String(d.status || "pending").toLowerCase();
      return {
        status,
        client_transaction_id: d.client_transaction_id || null,
        fallo: d.payment_failure_reason || null,
        valid_until: d.valid_until || null,
      };
    }

    /** Cancela lo que el lector esté esperando. Si no espera nada, SumUp puede dar error: no importa. */
    async terminar() {
      try {
        await this._peticion("POST", this.rutaLector + "/terminate");
        return true;
      } catch (e) {
        this.log.depurar("terminate: " + e.message);
        return false;
      }
    }

    /** { status: ONLINE|OFFLINE, state: IDLE|WAITING_FOR_CARD|…, battery_level, battery_temperature, firmware_version } */
    async estadoLector() {
      return ClienteSumUp._datos(await this._peticion("GET", this.rutaLector + "/status"));
    }

    /** Busca una transacción por client_transaction_id o foreign_transaction_id. null si no existe. */
    async buscarTransaccion(campo, valor) {
      try {
        const j = await this._peticion("GET", `/v2.1/merchants/${encodeURIComponent(this.comercio)}/transactions?${campo}=${encodeURIComponent(valor)}`);
        const d = ClienteSumUp._datos(j);
        if (Array.isArray(d.items)) return d.items.find(transaccionPagada) || d.items[0] || null;
        return d && (d.id || d.transaction_code) ? d : null;
      } catch (e) {
        if (e.http === 404) return null;
        throw e;
      }
    }

    /** Reembolso total de una transacción (id de transacción, no de cobro). */
    async reembolsar(transactionId) {
      await this._peticion("POST", `/v1.0/merchants/${encodeURIComponent(this.comercio)}/payments/${encodeURIComponent(transactionId)}/refunds`, {});
      return true;
    }
  }

  /** ¿La transacción encontrada es un pago cobrado? (SumUp usa SUCCESSFUL en transacciones) */
  function transaccionPagada(t) {
    if (!t) return false;
    const s = String(t.status || t.simple_status || "").toUpperCase();
    return s === "SUCCESSFUL" || s === "PAID";
  }

  return { ClienteSumUp, ErrorSumUp, transaccionPagada };
});
