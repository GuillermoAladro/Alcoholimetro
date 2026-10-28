# Guía para hacer animaciones del banco (alcoholímetro)

## El proyecto en 5 líneas
Guillermo diseña un alcoholímetro de bar que se paga con tarjeta (lector SumUp arriba a la derecha de la pantalla), con
boquilla para soplar (arriba a la izquierda), cámara que hace una foto y un ranking top 10 con las tasas (g/L).
La pantalla es de 7" (lienzo 1024 × 600) y la mueve una Raspberry Pi 3B+ con Chromium. En espera (Stand By) da
vueltas: BEBE → TOP 10 → puesto 10 → animación al azar → puesto 9 → animación al azar → … → puesto 1 → animación.
Las animaciones del banco son gags cortos del avatar de Guillermo (estilo 3D tipo Bitmoji) sobre fondo negro: humor
de bar, cerveza, tapas, fiesta, la propia máquina. Todo se dibuja en directo en un <canvas> con JavaScript sin
bibliotecas (nada de vídeos ni imágenes externas).

## Dónde está todo (en esta carpeta)
- `motor/base.js` — todo lo común (léelo si dudas de algo; está comentado)
- `motor/avatar-guillermo.js`, `motor/avatar-rodrigo.js` y `motor/avatar-marcos.js` — piezas de los avatares (no los abras: es base64)
- `motor/pantallas-fijas.js` — BEBE, TOP 10, Puesto (ejemplos de escenas sin avatar); tiene `corona(g, w)`
- `00000 … .js` – `00156 … .js` — las animaciones que ya hay (buenas referencias de estilo y ritmo:
  `00102 La tienda 24H.js`, `00101 Modo leyenda.js`)
- Prueba: `python3 herramientas/probar.py "<archivo.js>" [más archivos] [--en 2.5,4]`
  - comprueba sintaxis, ámbito, registro, errores, negro al principio y al final, duración
  - deja una hoja de 12 capturas en `revision/<ID>.png` y, con `--en`, cuadros a tamaño real en
    `revision/<ID>_t<s>.png`
  - necesita Python con Playwright (`pip install playwright`, `playwright install chromium`)

## Reglas (obligatorias)
1. Un archivo por animación en la carpeta del banco: `IIIII Nombre.js` (ID de 5 cifras + nombre con mayúscula inicial).
2. Todo el código dentro de `"use strict";` + comentario de cabecera + `(() => { ... })();`. Nada global.
   Al final, dentro de la función: `registrar({ id: "IIIII", nombre: "Nombre", crear: () => new MiEscena() });`
3. Empieza y acaba en NEGRO: el primer cuadro (a los 1/60 s) y el último (cuando `terminada` pasa a true) tienen que
   ser negros. Entradas/salidas típicas: entra/sale andando por un lado, se enciende/apaga un foco, iris, telón,
   fundido corto (0,3–0,6 s). Mejor una entrada/salida con gracia que un fundido sin más.
4. Duración 6–12 s (la herramienta acepta 5–14). Ritmo: algo pasa cada segundo; un remate claro al final.
5. Protagonista: el avatar de Guillermo (y en las de dúo, Guillermo con Rodrigo o con Marcos). Otros personajes: solo clones del avatar (con otra cara, gafas, pelo dorado…)
   u objetos/animales dibujados sencillos. Nada de personas reales, marcas, logotipos, personajes o escenas
   famosas (películas, series, videojuegos, canciones con letra real). Nada de conducir bebido como chiste, violencia
   contra personas, contenido sexual, apuestas ni menores.
6. Cada animación tiene SU texto en pantalla (el que viene en la idea), en español: onomatopeya en `FC` (Bangers),
   títulos en `FD` (Big Shoulders Display 900), letras de espuma/redondas en `FB` (Lilita One), texto normal en `FT`.
7. Rendimiento (Pi 3B+): ≤ 500 partículas vivas, ≤ 8 avatares por cuadro, nada de getImageData en cada cuadro,
   textos con glow grandes → mejor pintarlos una vez en un lienzo (`lienzoNuevo`) y copiarlos. Degradados creados
   por cuadro solo los imprescindibles.
8. Cada animación nueva lleva el siguiente ID libre y se añade a `lista.js`.

## Esqueleto
```js
"use strict";
/*
 * 00012 · DARDOS DE BAR
 *
 * Animación del banco. Empieza y acaba en negro.
 * (2–4 líneas: qué pasa)
 */
(() => {
class Dardos extends Escena {
  constructor() {
    super(8.5);                 // duración en s; this.t avanza solo con actualizar
    this.p = new Parts(300);    // partículas
    this.X = W / 2; this.ESC = 1.55;
  }
  estado() {                    // pose del avatar en el instante this.t (objeto NUEVO cada vez)
    const t = this.t;
    const pose = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [70, 158], manoI: [9, 160] };
    // ... cambia pose según t (tramo, eInOut, mezcla...)
    const m = matAv(this.X, PIES, this.ESC);   // pies del avatar en (X, PIES)
    return { pose, m };
  }
  actualizar(dt) {
    const t = (this.t += dt);
    this.una("golpe", t > 3.2, () => { temblar(12, 0.3); /* chispas */ });
    this.p.actualizar(dt);
  }
  dibujar(g) {
    const t = this.t, e = this.estado();
    fondo(g, "#000");
    pintarAvatar(g, e.m, e.pose, t);
    this.p.dibujar(g);
    // ... textos
    const a = Math.max(1 - tramo(t, 0, 0.35), tramo(t, this.dur - 0.5, this.dur - 0.02));
    if (a > 0) { g.fillStyle = `rgba(0,0,0,${a})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}
registrar({ id: "00012", nombre: "Dardos de bar", crear: () => new Dardos() });
})();
```

## El avatar
Unidades de avatar (las del recorte de frente): 78 de ancho × 232 de alto, pies en y = 232, punta del pelo ≈ y −5.
- `matAv(x, y, esc, giro = 0, sx = 1, sy = 1, piv = [39, 232])` → DOMMatrix: el punto `piv` del avatar va a (x, y)
  de la pantalla, girado `giro` rad y escalado. Para girar sobre el centro del cuerpo usa `piv = [39, 116]`.
  Escala típica 1,4–1,7 (mide 330–400 px). Suelo de la pantalla: `PIES` = 575.
- `pintarAvatar(g, m, pose, t)`; `aPant(m, [ax, ay])` → punto de la pantalla (para partículas, bocadillos…).
- Puntos útiles: ojos (27, 40) y (50, 40); boca `boca(rc)` ≈ (39, 55); frente (39, 22); cuello (39, 72);
  hombro derecho de la pantalla [69, 86], izquierdo [9, 86]; manos en reposo [70, 158] y [9, 160]; caderas
  [27, 146] y [51, 146]. Un brazo llega como mucho a ~74 unidades del hombro (si apuntas más lejos, se estira recto).
- `pose`:
  - `cara`: "sonrisa" | "risa" | "guino" | "sorpresa" | "borracho" | "dormido"; `rc`: giro de la cabeza (rad, ±0,4)
  - `manoD` / `manoI`: punto [x, y] al que llega cada mano (cinemática inversa, codo hacia abajo y fuera).
    El brazo derecho de la pantalla va por delante del cuerpo; el izquierdo por detrás (`brazoIDelante: true`
    para ponerlo delante). Sin `manoI` el brazo izquierdo es una pieza rígida que gira `brazoI` rad.
  - `piernaI` / `piernaD`: [dy, ángulo] (dy negativo levanta el pie). `andar(fase, f)` → { piernaI, piernaD, bote }
    para andar (sube `fase` ~9 rad/s); el avatar siempre mira de frente aunque se desplace de lado.
  - `objD(g, mano, angAntebrazo, t)`: dibuja algo en la mano derecha (por detrás de los dedos); `objD2` por delante.
    Igual `objI` / `objI2`. Ej.: `pose.objD = (g, m) => dibujarLata(g, m[0], m[1], ang, { abierta: true })`.
  - `oro` (0–1, pelo dorado), `puntas` (0–1, pelo de punta), `gafas` (true: gafas de sol).
  - `jarra: { inc, nivel }` (atajo: jarra de cristal en la mano derecha que se vacía con `nivel` 1→0).
- Beber de lo que tenga en la mano derecha (ver `00101 Modo leyenda.js`, método estado()):
  `const b = boca(rc), tope = rot2([1.5, -13], angLata); manoD = [b[0] - tope[0] + 2, b[1] - tope[1] + 1];`
  con `rc` ≈ −0,35 (cabeza atrás) y `angLata` ≈ −1,6…−1,9.
- Clones: llama a `pintarAvatar` varias veces con otras matrices y otras poses (otra cara, gafas, oro…).
- Agacharse/aplastarse: `sy` < 1 en matAv; tumbado: `giro` ±π/2; de espaldas o de perfil NO hay.

## Rodrigo (segundo avatar)
- Se pinta igual que Guillermo con `quien: "rodrigo"` en la pose: `pintarAvatar(g, matAv(x, PIES, esc), { quien: "rodrigo", cara: "risa", ... }, t)`.
  Mismas 6 caras, `oro`, `puntas`, `gafas`, objetos en las manos, `andar`, etc.
- Aspecto: pelo castaño claro ondulado y más largo, barba corta, cazadora negra con camiseta blanca, vaqueros.
  Guillermo: pelo corto oscuro, camisa negra. Se distinguen bien; no hace falta rotularlos (si un marcador o un cartel
  pone sus nombres, «GUILLERMO» y «RODRIGO»).
- Sus puntos (unidades de avatar) están en `avatar("rodrigo").rig`: `ojos` [[28, 47], [48, 47]], `bocaPos` [37, 64.5],
  `frente` [38, 32], `cuello` [38, 80], hombros `hombroD` [66, 94] / `hombroI2` [10, 94], manos en reposo
  `manoD` [68, 157] / `manoI` [9, 157], caderas [27, 152] / [50, 152]. Mide casi lo mismo (pies en y = 232, pelo ≈ y 6).
  Para Guillermo, `avatar().rig` (o `RIG`). Para beber: `boca(rc, "rodrigo")`.
- Dúo: lo normal es ponerlos a los lados (x ≈ 330 y 690, escala 1,4–1,6) para que la acción ocurra entre los dos.
  Que los dos tengan papel y caras que reaccionen a lo que hace el otro; el remate puede ser para cualquiera de los dos.

## Marcos (tercer avatar)
- Igual que Rodrigo, con `quien: "marcos"` en la pose. Mismas 6 caras, `oro`, `puntas`, `gafas`, objetos, `andar`…
- Aspecto: pelo rizado oscuro, camiseta negra de manga corta (brazos al aire), pantalón cargo beige y zapatillas
  blancas. Se distingue bien de Guillermo (camisa negra de manga larga, vaqueros); si un cartel pone nombres:
  «GUILLERMO» y «MARCOS».
- Sus puntos en `avatar("marcos").rig`: `ojos` [[27, 47], [47, 47]], `bocaPos` [37, 62], `frente` [37, 26],
  `cuello` [37, 74], hombros `hombroD` [63, 93] / `hombroI2` [11, 93], manos en reposo `manoD` [67, 152] /
  `manoI` [6, 152], caderas [26, 142] / [49, 142]. Pies en y = 232, pelo ≈ y 6. Para beber: `boca(rc, "marcos")`.
- Sus brazos son más cortos: la mano llega como mucho a ~59 unidades del hombro (Guillermo ~74). En choques de
  manos, brindis o cuando cogen algo entre los dos, acércalos más.

## Trucos que han salido en las tandas anteriores
- No hay vista de espaldas ni de perfil: «se gira» → se despista (cierra los ojos, bosteza, mira arriba con `rc`).
- `fotoDe()` solo hace fotos de Guillermo. Para una foto o polaroid de Marcos (o de los dos), píntala tú en un
  lienzo una vez (`lienzoNuevo` + `dibujarAvatar` con `quien`) y luego cópiala.
- Para pintar algo sobre la cara (espuma, un bigote) que quede por detrás de la mano derecha, usa `pose.objD`
  (se pinta justo antes del brazo derecho) en coordenadas de avatar.
- A escala muy grande (> 2,4) se notan los círculos que tapan hombros y codos; mejor quedarse en 1,4–2,2.
- Textos con brillo, marcadores y fondos complicados: pintarlos una vez (en el primer cuadro, que es negro) y copiarlos.

## Utilidades (motor/base.js)
- Matemáticas: `clamp, lerp, mezcla(a,b,k)` (puntos), `tramo(t, a, b)` (0→1 entre a y b), `eIn, eOut, eInOut,
  eBack, eElastico`, `azar(a, b)`, `semilla(n)` → función aleatoria repetible, `rot2(p, ang)`, `fmt(2.84)` → "2,84".
- Dibujo: `fondo(g, color)`, `rectR(g, x, y, w, h, r)` (ruta), `lienzoNuevo(w, h)`,
  `txt(g, s, x, y, { tam, peso, fam, color, alin, base, esp, alfa, glow, glowTam, borde, bordeAncho, max })`
  (alin por defecto "center"; `borde` = contorno; `max` = ancho máximo, encoge si no cabe),
  `sprite3D(texto, tam, { cara, lado, borde })` → lienzo con letras con relieve (como BEBE),
  `bocadillo(g, cx, cy, texto, px, py, k, tam)` (bocadillo de cómic que apunta a (px, py); k 0→1 lo hace aparecer),
  `brillo(g, x, y, r, a)` (estrellita), `foco(g, xArriba, x, suelo, ancho, a)` (foco de teatro), `estrella(...)`,
  `temblar(fuerza, dur)` (tiembla la pantalla), `cacheTexto()` (Map que se vacía al cargar las fuentes).
- Fuentes: `FD` (títulos), `FT` (texto), `FC` (cómic), `FB` (redonda).
- Partículas: `const p = new Parts(max)`; `p.nueva(P.TIPO, x, y, vx, vy, vida, tam, c)`; `p.actualizar(dt)`;
  `p.dibujar(g)`; `p.alfa` (transparencia de todas); `p.suelo = (x) => y` (dónde se posan billetes y confeti).
  Tipos: `P.LLAMA` (llama dorada que sube; c=1 más clara), `P.HUMO`, `P.CHISPA` (chispa dorada con gravedad),
  `P.DESTELLO` (fogonazo blanco), `P.POLVO`, `P.BILLETE`, `P.ESPUMA` (burbuja de espuma), `P.CONFETI` (c = color
  0–4), `P.ELECTRICA` (cian), `P.VAPOR`, `P.PURPURINA` (dorada que cae), `P.GOTA` (gota de cerveza).
- Objetos: `dibujarLata(g, x, y, ang, { aplast, abierta, esc, bulto })` (unidades de avatar, 13 × 24),
  `lataSuelta(g, x, y, ang, esc)` (lata a tamaño de pantalla), `dibujarJarra(...)`, `dibujarBolsa(g, x, y, ang)`
  (bolsa de litronas), `dibujarFajo(g, x, y, ang)` (billetes), `dibujarTrofeo(g, x, y, ang, t)`,
  `gafasSol(g, ox, oy, esc)`, `dibujarAura(g, cx, cy, ancho, alto, k, t)`, `nuevoRayo / dibujarRayos`,
  `nuevaRoca / dibujarRoca`, `fotoDe(cara)` (foto de ejemplo 300 × 300), `polaroid(g, foto, cx, cy, w, rot, pie)`,
  `pegatinaTop10()`, `corona(g, w)`, sprites `SPR.espuma`, `SPR.billete`, brillos `BLOB.*` y `BLOB2.*`
  (círculos difuminados de 64 px: amarillo, naranja, rojo, humo, blanco, verde / oro, oroClaro, cian, polvo, vapor,
  gota; para luces: `g.globalCompositeOperation = "lighter"` y `drawImage` escalado).
- Datos del ranking (ejemplo; en la máquina son los reales): `datos.top[0..9] = { valor, cara, fecha }`,
  `datos.unidad` = "g/L", `datos.total`. Récord: `fmt(datos.top[0].valor) + " " + datos.unidad`.
- Colores de la casa: verde máquina `#2bff5b`, oro `#ffd34d`, blanco roto `#fffdf5`, rosa `#ff3d84`, cian `#2fe3e8`.
- `Escena`: clase base con `t`, `dur`, `terminada` y `una(clave, condición, fn)` (hace fn una sola vez).

## Calidad que se espera
Como las 7 que ya hay: una idea clara y graciosa que se entienda sin sonido en 1–2 segundos de mirar, el avatar
bien colocado y expresivo (cambia de cara según lo que pasa), objetos dibujados con volumen (degradados, brillos,
contorno), efectos con fuerza (temblor, chispas, destellos) en el momento clave, y el texto grande en el remate.
Revisa SIEMPRE la hoja de capturas: nada cortado sin querer, nada tapando la cara, textos legibles.
