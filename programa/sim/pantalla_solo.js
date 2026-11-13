/*
 * pantalla_solo.js — lo que enseña el lector de tarjetas simulado en su pantalla (480 × 480).
 * Sin logotipos ni marcas: solo importe, instrucciones y el símbolo genérico de pago sin contacto.
 */
(function (raiz, fabrica) {
  "use strict";
  const m = fabrica();
  if (typeof module === "object" && module.exports) module.exports = m;
  else (raiz.ALC_SIM = raiz.ALC_SIM || {}).pantallaSolo = m;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  const F = '"Archivo", "Helvetica Neue", Arial, sans-serif';

  function sinContacto(g, x, y, s, color) {
    g.strokeStyle = color;
    g.lineCap = "round";
    g.lineWidth = 7 * s;
    for (let i = 0; i < 4; i++) {
      g.beginPath();
      g.arc(x - 40 * s, y, (16 + i * 15) * s, -0.75, 0.75);
      g.stroke();
    }
  }

  class PantallaSolo {
    constructor(canvas) {
      this.cv = canvas;
      canvas.width = 480;
      canvas.height = 480;
      this.g = canvas.getContext("2d");
      this.estado = { modo: "inicio" };
      this.desde = 0;
    }
    mostrar(e) {
      this.estado = e || { modo: "inicio" };
      this.desde = performance.now();
    }
    pintar(t) {
      const g = this.g;
      const e = this.estado;
      const k = (t - this.desde) / 1000;
      g.setTransform(1, 0, 0, 1, 0, 0);
      if (e.modo === "apagado") {
        g.fillStyle = "#000";
        g.fillRect(0, 0, 480, 480);
        return;
      }
      g.fillStyle = "#fbfbf9";
      g.fillRect(0, 0, 480, 480);
      // barra de estado: hora, wifi y batería
      const d = new Date();
      g.fillStyle = "#1c1c1c";
      g.font = `600 18px ${F}`;
      g.textAlign = "left";
      g.fillText(`${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`, 22, 32);
      g.textAlign = "right";
      g.fillText("87 %", 438, 32);
      g.strokeStyle = "#1c1c1c";
      g.lineWidth = 2;
      g.strokeRect(442, 19, 22, 13);
      g.fillRect(444, 21, 16, 9);
      for (let i = 0; i < 3; i++) {
        g.beginPath();
        g.arc(372, 34, 6 + i * 6, -2.4, -0.74);
        g.stroke();
      }
      const imp = e.importe ? (e.importe / 100).toFixed(2).replace(".", ",") + " €" : "";
      g.textAlign = "center";
      if (e.modo === "esperando") {
        g.fillStyle = "#1c1c1c";
        g.font = `800 64px ${F}`;
        g.fillText(imp, 240, 132);
        g.font = `600 28px ${F}`;
        g.fillText("Acerca la tarjeta", 240, 184);
        g.fillText("o el móvil", 240, 218);
        const pul = 1 + 0.06 * Math.sin(k * 5);
        g.save();
        g.translate(240, 330);
        g.scale(pul, pul);
        g.strokeStyle = "#1c1c1c";
        g.lineWidth = 6;
        g.beginPath();
        g.roundRect ? g.roundRect(-20, -50, 110, 72, 10) : g.rect(-20, -50, 110, 72);
        g.stroke();
        sinContacto(g, 0, -14, 1, "#1c1c1c");
        g.restore();
        g.fillStyle = "#6b6b6b";
        g.font = `500 18px ${F}`;
        g.fillText("Tarjeta, móvil o reloj", 240, 440);
      } else if (e.modo === "procesando") {
        g.fillStyle = "#1c1c1c";
        g.font = `800 56px ${F}`;
        g.fillText(imp, 240, 132);
        g.save();
        g.translate(240, 280);
        g.rotate(k * 6);
        g.strokeStyle = "#1c1c1c";
        g.lineWidth = 10;
        g.lineCap = "round";
        g.beginPath();
        g.arc(0, 0, 54, 0, Math.PI * 1.4);
        g.stroke();
        g.restore();
        g.font = `600 28px ${F}`;
        g.fillText("Procesando…", 240, 400);
      } else if (e.modo === "aprobado" || e.modo === "rechazado") {
        const ok = e.modo === "aprobado";
        g.fillStyle = ok ? "#1f9d55" : "#d93a2e";
        g.beginPath();
        g.arc(240, 220, 82 * Math.min(1, k * 4), 0, Math.PI * 2);
        g.fill();
        g.strokeStyle = "#fff";
        g.lineWidth = 14;
        g.lineCap = "round";
        g.beginPath();
        if (ok) {
          g.moveTo(200, 222);
          g.lineTo(230, 252);
          g.lineTo(284, 194);
        } else {
          g.moveTo(208, 188);
          g.lineTo(272, 252);
          g.moveTo(272, 188);
          g.lineTo(208, 252);
        }
        g.stroke();
        g.fillStyle = "#1c1c1c";
        g.font = `700 32px ${F}`;
        g.fillText(ok ? "Pago aceptado" : "Tarjeta rechazada", 240, 370);
        g.font = `500 22px ${F}`;
        g.fillStyle = "#555";
        g.fillText(ok ? imp : "Prueba con otra tarjeta", 240, 410);
      } else if (e.modo === "cancelado") {
        g.fillStyle = "#555";
        g.font = `600 30px ${F}`;
        g.fillText("Cobro cancelado", 240, 250);
      } else {
        // en reposo, sin cobro abierto
        g.fillStyle = "#1c1c1c";
        g.font = `700 34px ${F}`;
        g.fillText("Listo", 240, 230);
        g.fillStyle = "#7a7a7a";
        g.font = `500 20px ${F}`;
        g.fillText("Esperando un cobro", 240, 270);
      }
    }
  }
  return { PantallaSolo };
});
