"use strict";
/*
 * Banco de animaciones generales: cuáles hay y cómo se eligen
 *
 * Una vuelta de Stand By:
 *   BEBE → TOP 10 en llamas → [Puesto 10 → animación] → [Puesto 9 → animación] → … → [Puesto 1 → animación]
 * Las animaciones salen del banco al azar, como una baraja: no se repite ninguna hasta que han salido todas, y las 3
 * últimas que han salido no vuelven al principio de la baraja siguiente.
 *
 * Para añadir una animación: un archivo nuevo en esta carpeta con una clase que tenga actualizar(dt), dibujar(g) y
 * terminada (que empiece y acabe en negro), una línea más en BANCO y su <script> en ver.html.
 */

const BANCO = [
  { nombre: "El borracho", crear: () => new EscenaBorracho() },
  { nombre: "Modo leyenda", crear: () => new EscenaLeyenda() },
  { nombre: "La tienda 24H", crear: () => new EscenaTienda() },
  { nombre: "Monumentos de latas", crear: () => new EscenaMonumentos() },
  { nombre: "El eructo", crear: () => new EscenaEructo() },
  { nombre: "Cohete de espuma", crear: () => new EscenaCohete() },
  { nombre: "El reto", crear: () => new EscenaReto() },
];
const baraja = {
  mazo: [], recientes: [],
  sacar() {
    if (!this.mazo.length) {
      const m = BANCO.map((_, i) => i);
      for (let i = m.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [m[i], m[j]] = [m[j], m[i]]; }
      // al barajar de nuevo, las que acaban de salir no van al principio (así no se repiten casi seguidas)
      const k = Math.min(3, m.length - 1);
      for (let p = 0; p < k; p++) {
        if (!this.recientes.includes(m[p])) continue;
        const q = m.findIndex((x, i) => i >= k && !this.recientes.includes(x));
        if (q >= 0) [m[p], m[q]] = [m[q], m[p]];
      }
      this.mazo = m;
    }
    const i = this.mazo.shift();
    this.recientes = [i, ...this.recientes].slice(0, 3);
    return Object.assign({ tipo: "animacion" }, BANCO[i]);
  },
};
function vueltaNueva() {
  const v = [
    { tipo: "fija", nombre: "BEBE", crear: () => new EscenaBebe() },
    { tipo: "fija", nombre: "TOP 10 en llamas", crear: () => new EscenaTop10() },
  ];
  for (let n = 10; n >= 1; n--) {
    v.push({ tipo: "puesto", nombre: `Puesto ${n}`, crear: () => new EscenaPuesto(n) });
    v.push(baraja.sacar());
  }
  return v;
}
