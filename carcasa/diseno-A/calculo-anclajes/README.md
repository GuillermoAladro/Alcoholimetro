# Cálculo del patrón de anclaje a pared · cómo se ha hecho

04-11-2026 · diseño A (Compacta) · trasera de chapa DC01 de **3 mm** (cajón de componentes y tapa interior de 1,5 mm), 18 tacos fischer SX Plus 8×65 con tirafondo DIN 571 6×80 y arandela DIN 9021 M6.

Este documento explica **paso a paso cómo se calculó** el patrón de agujeros de la trasera (**P18-3**): de dónde salen los datos, qué modelo mecánico se usó, cómo se buscó el patrón, cómo se comprobó y qué queda sin verificar. Los resultados completos están en el [informe técnico en PDF](Informe_anclajes_alcoholimetro.pdf) y las coordenadas en [`patron_ganador.csv`](patron_ganador.csv).

> **Estado:** aplicado al CAD el 04-11-2026 (`modelo/diseno.py` → `FIJACIONES_PARED`, DXF y STEP de A-C02, planos y lista). El cálculo anterior, con la trasera de 2 mm y el patrón P18-O, está en [`historico-2mm/`](historico-2mm/README.md): el método es el mismo.

## Índice

0. [Qué cambia respecto al cálculo con 2 mm](#0-qué-cambia-respecto-al-cálculo-con-2-mm)
1. [Resumen del método](#1-resumen-del-método)
2. [Qué se quiere maximizar](#2-qué-se-quiere-maximizar)
3. [Datos de partida](#3-datos-de-partida)
4. [Geometría y zonas donde se puede taladrar](#4-geometría-y-zonas-donde-se-puede-taladrar)
5. [Cargas](#5-cargas)
6. [Modelo de la chapa trasera (elementos finitos)](#6-modelo-de-la-chapa-trasera-elementos-finitos)
7. [Modelos de contraste: chapa rígida y método clásico](#7-modelos-de-contraste-chapa-rígida-y-método-clásico)
8. [Verificación del modelo](#8-verificación-del-modelo)
9. [Optimización](#9-optimización)
10. [Patrón resultante](#10-patrón-resultante)
11. [Cuánto aguanta](#11-cuánto-aguanta)
12. [Análisis complementarios](#12-análisis-complementarios)
13. [Limitaciones](#13-limitaciones)
14. [Cómo reproducirlo](#14-cómo-reproducirlo)
15. [Fuentes](#15-fuentes)

---

## 0. Qué cambia respecto al cálculo con 2 mm

| | Con 2 mm (03-11-2026) | Con 3 mm (04-11-2026) |
|---|---|---|
| Trasera | 2 mm, rigidez a flexión D = 153 846 N·mm | 3 mm, D = 519 231 N·mm (× 3,4) |
| Masa de cálculo | 15 kg | 18 kg (12,5 kg de acero; ≈ 15,5 kg estimados con todo) |
| Guías traseras | angulares, ala soldada en x = ±61…71 | pletinas planas de 12 mm en x = ±64…76 |
| Apoyo de la tapa interior | angular con ala de 12 mm hacia arriba (z = 405,5–417,5) | pletina plana soldada con MIG por su canto (z = 404,5–407,5) |
| Zona Z3 (franja de arriba) | z = 427,5–430,5 | z = 420,5–429,5 (más ancha: el apoyo ya no tiene ala) |
| Búsqueda | n = 6…18 | sólo n = 18, con el P18-O como candidato |
| Ganador | P18-O, libre (asimétrico) | **P18-3, simétrico** (llega al 96 % del mejor libre) |
| λ del ganador / del patrón C | 10,62 / 5,12 | **10,56** / 5,79 |
| Tirón admisible en la esquina, hormigón (ganador) | 5.961 N | 5.997 N |
| Tirón con la primera plastificación local de la chapa (ganador) | 902 N | 1.775 N |

Los patrones A, B y C de 3 × 6 o 4 columnas tienen agujeros en x = ±85, que con las guías nuevas quedan pegados a ellas (la arandela toca su canto): **ya no se podrían taladrar tal cual**. Se siguen calculando sólo como referencia.

## 1. Resumen del método

```mermaid
flowchart TD
    A["Geometría real de diseno.py<br/>+ zonas libres para taladrar"] --> D
    B["Datos fischer SX Plus 8x65<br/>carga recomendada por pared"] --> F
    C["Cargas: peso, tirones, cuelgue, golpes<br/>→ fuerzas y momentos"] --> D
    D["Modelo FEM: chapa flexible<br/>+ caja rígida + tacos + contacto"] --> E
    E["Fuerza en cada tornillo<br/>F = √(N² + V²)"] --> F
    F["Factor de carga λ = F_rec / F_máx<br/>del peor caso"] --> G
    G["Recocido simulado: mueve los agujeros<br/>miles de veces y se queda con el mayor λ"] --> H
    H["Redondeo a 0,5 mm y verificación:<br/>malla fina, sensibilidad, paredes"]
```

1. Se sacan del CAD las medidas reales de la trasera y todo lo que va soldado o atornillado a ella, y se definen las zonas donde el centro de un agujero cabe sin tocar nada.
2. Cada situación (peso, tirones, una persona colgada, golpes) se convierte en fuerzas y momentos sobre la caja.
3. Un modelo de elementos finitos calcula cuánto se lleva cada tornillo, teniendo en cuenta que la chapa de 3 mm se dobla y que la pared solo empuja.
4. Se compara el tornillo más cargado con la carga recomendada de fischer → factor de carga λ.
5. Un algoritmo de búsqueda mueve los agujeros dentro de las zonas para hacer λ lo más grande posible en el peor caso.
6. El mejor patrón se redondea, se recalcula con un modelo más fino y se somete a todas las comprobaciones.

## 2. Qué se quiere maximizar

Para cada patrón y cada caso de carga:

$$\lambda = \frac{F_{rec}}{F_{\max}}$$

- $F_{rec}$: carga recomendada de **un** taco SX Plus 8×65 según fischer (1500 N en hormigón ≥ C20/25; ya incluye los coeficientes de seguridad del fabricante y vale para tracción, cortante y combinada).
- $F_{\max}$: fuerza resultante en el tornillo más cargado.

El patrón se valora por el **peor** de todos los casos de carga (y de las dos hipótesis de borde, §6.7):

$$\lambda_{patrón} = \min_{casos,\ bordes} \lambda$$

**Ejemplo** (tirón de 500 N en la esquina superior derecha + peso propio):

| | $F_{\max}$ | $\lambda = F_{rec}/F_{\max}$ |
|---|---|---|
| Patrón anterior (C) | 259 N | 1500 / 259 = **5,8** |
| P18-3 | 138 N | 1500 / 138 = **10,9** |

En el P18-3 el caso que manda no es éste sino la persona colgada del borde (142 N → λ = 10,56). λ = 10,6 significa que esa situación podría multiplicarse por 10,6 antes de que el primer taco llegue a su carga recomendada. **No** se multiplica la carga de un taco por 18: el reparto lo da el modelo y manda el más cargado.

## 3. Datos de partida

Se separa lo comprobado de lo supuesto:

| Dato | Valor | Origen |
|---|---|---|
| Carcasa | 220 × 100 × 442,5 mm; trasera de 439,5 mm de alto | **Comprobado** en `diseno.py` / `specs.py` (W, D; Hw = 407,5 + 1,5 + 30,5) |
| Chapa | DC01 3 mm (trasera, caja y tapa) y 1,5 mm (cajón de componentes y tapa interior), pliegues a 90°, radio interior = espesor | **Comprobado** (`T = 3.0`, `TK = 1.5`, lista de piezas) |
| Masa de chapa | 12,52 kg | **Calculado**: suma de las 29 piezas de acero de `Lista_de_piezas.xlsx` (24 de 3 mm y 5 de 1,5 mm) |
| Chapa + policarbonato | 13,09 kg | **Calculado**: + 0,57 kg de las 4 piezas de PC |
| Masa con electrónica | ≈ 15,5 kg → se calcula con **18 kg** | **Estimado** por componentes (pantalla, Solo, Pi, fuente, sensor, cables, herrajes, pintura, pajitas) |
| Centro de gravedad | x ≈ 0, z ≈ 210 mm, a unos 50 mm de la pared → se usa **55 mm** | **Estimado** por reparto de masas (sensibilidad 45–65 mm) |
| Patrón anterior (C) | x = −85, 0, 85; z = 25, 75, 125, 205, 295, 391,5 | **Comprobado**: el que llevaba `fijaciones_pared` hasta el 03-11-2026 |
| SX Plus 8×65 | taladro Ø8, h1 ≥ 75 mm, h_ef = 65 mm, tornillo Ø4,5–6 | **Fabricante** (ficha técnica fischer, 16/05/2023) |
| Distancia mínima al borde (hormigón) | c_min = 50 mm | **Fabricante** (tabla de cargas) |
| Distancia mínima entre tacos | no publicada → **50 mm** | **Hipótesis** (= c_min) |
| Carga recomendada F_rec | hormigón 1,50 kN · ladrillo macizo Mz 12 0,80 · KS 12 1,50 · KSL 12 0,80 · HLz 12 0,40 · bloque hueco 0,30 · AAC 4 0,40 · AAC 2 0,15 · ladrillo hueco horizontal y placa de yeso: sin valor | **Fabricante** |
| Rigidez axial de un taco k_a | 2000 N/mm (se prueba 500–10 000) | **Hipótesis**: fischer no la publica |
| Rigidez de contacto con la pared k_w | 50 N/mm³ (se prueba 5–500) | **Hipótesis** (modelo de Winkler) |
| Límite elástico DC01 | Re ≤ 280 MPa; 140 MPa como mínimo de cálculo | Hoja de material (EN 10130) |

## 4. Geometría y zonas donde se puede taladrar

Se recorrió `diseno.py` buscando todo lo que toca la cara interior de la trasera:

| Elemento | Posición (x, z en mm) | Efecto |
|---|---|---|
| Pliegue al lateral derecho | x = +110, z = 6 … 438 | Línea rígida |
| Pliegue al lateral izquierdo | x = −110, **solo** z = 150 … 439,5 (debajo está el hueco del cajón de pajitas) | Línea rígida; canto libre por debajo |
| Pliegue al suelo | z = 0, x = −104 … 104 | Viga rígida en su plano |
| Pestaña trasera de la bandeja, soldada | z = 150,5 … 163,5 | Franja rígida; no se puede taladrar |
| Apoyo de la tapa interior: pletina de 3 mm soldada con MIG por su canto | z = 404,5 … 407,5 (cordón por arriba) | No se puede taladrar |
| Guías traseras: pletinas planas de 12 mm soldadas por puntos | x = ±64 … ±76, z = 173,5 … 391,5 | No se puede taladrar |
| Espárrago de tierra M4 | (50; 376,5) | No se puede taladrar |

El centro de cada agujero debe quedar a ≥ 11 mm (radio de la arandela de Ø18 + 2 mm) de pestañas y soldaduras (10 mm del canto de las guías), y a |x| ≤ 93 mm para que la arandela apoye en la parte plana (la cara interior del lateral está en ±107 y el pliegue, de radio 3, termina en ±104) y quepa la llave de 10 mm. Resultan tres zonas:

- **Z1** (detrás del cajón de pajitas): x ∈ [−93, 93], z ∈ [20, 139,5].
- **Z2** (detrás del cajón de componentes): x ∈ [−93, 93], z ∈ [174,5, 393,5], excepto |x| ∈ (54, 86) a la altura de las guías y un círculo de 16 mm alrededor del espárrago.
- **Z3** (franja superior, encima del cordón del apoyo de la tapa interior): z ∈ [420,5, 429,5]. Accesible con la tapa abierta; queda a ≥ 10 mm del canto.

Las cabezas de los tirafondos (≈ 5,6 mm con la arandela) caben en los 8 mm libres detrás del cajón de pajitas (quedan 3,4 mm) y en los 9,5 mm detrás del de componentes (quedan 3,9 mm).

![Los cuatro patrones a la misma escala](figuras/fig1_patrones.png)

## 5. Cargas

### 5.1 Ejes y unidades

- x horizontal en la pared (+ derecha mirando la máquina), z vertical desde la base, n normal a la pared (+ hacia fuera).
- Todo en newtons y milímetros. Una masa m produce $F = m \cdot g = m \cdot 9{,}81$ N.

### 5.2 De fuerzas a acciones sobre la caja

Cada fuerza $(F_x, F_n, F_z)$ aplicada en un punto $(x, n, z)$ se reduce a:

- **Fuera del plano de la pared** (lo que despega la caja y tira de los tacos):

$$Q_n = \sum F_n \qquad M_{vuelco} = \sum (z F_n - n F_z) \qquad M_{vertical} = \sum (x F_n - n F_x)$$

- **En el plano de la pared** (cortante en los tornillos):

$$V_x = \sum F_x \qquad V_z = \sum F_z \qquad T = \sum (z F_x - x F_z)$$

**Ejemplo, peso propio de cálculo:**

$$F = m g = 18 \times 9{,}81 = 177 \text{ N} \qquad M = F \cdot e = 177 \times 0{,}055 = 9{,}7 \text{ N·m}$$

Ese momento tira de los tornillos de arriba y aprieta la parte de abajo contra la pared.

### 5.3 Casos de la envolvente de diseño

Todos llevan el peso propio de 18 kg en el centro de gravedad. Son los casos con los que se optimizó:

| Caso | Fuerza | Punto de aplicación |
|---|---|---|
| Tirón normal | 500 N hacia fuera | Esquina superior izquierda, esquina superior derecha, centro, abajo |
| Tirón oblicuo | 500 N a 45° (fuera + lateral) | Cada esquina superior |
| Tirón lateral | 500 N paralelo a la pared, a cada lado | Borde superior delantero (n = 100 mm) |
| Persona colgada | 80 kg × factor dinámico 2 = 1570 N hacia abajo | Borde superior delantero |

El factor 2 es el de una carga aplicada de golpe sobre un sistema elástico (la persona se deja caer). Después se evaluaron además cargas verticales de 15 a 100 kg, tirones de 100 a 500 N, una persona apoyada, golpes frontales y laterales y pérdidas de tacos (§12).

## 6. Modelo de la chapa trasera (elementos finitos)

### 6.1 La chapa

Placa delgada de Kirchhoff de 3 mm de acero ($E$ = 210 000 MPa, ν = 0,3):

$$D = \frac{E t^3}{12(1-\nu^2)} = \frac{210\,000 \times 3^3}{12 \times (1 - 0{,}09)} = 519\,231 \text{ N·mm}$$

Es 3,4 veces la rigidez de la de 2 mm (3³/2³). Se discretiza con elementos rectangulares **ACM** (Adini–Clough–Melosh) de 12 grados de libertad: en cada nudo, el desplazamiento normal $w$ y sus dos pendientes $\partial w/\partial x$, $\partial w/\partial z$. Dentro de cada elemento, $w$ es un polinomio de 12 términos ($1, x, z, x^2, xz, z^2, x^3, x^2z, xz^2, z^3, x^3z, xz^3$) y la rigidez se integra con 4×4 puntos de Gauss (exacto para estos polinomios). La malla incluye siempre líneas en las cotas de los pliegues, la bandeja y el apoyo. Se usaron mallas de 20, 10, 5 y 2,5 mm.

### 6.2 Unión con la caja

Los laterales, el frontal, la bandeja y la tapa forman una caja muy rígida comparada con la chapa trasera. Se modelan como **un sólido rígido** con tres movimientos fuera del plano de la pared: separarse ($a$), volcar alrededor de un eje horizontal ($b$) y girar alrededor de un eje vertical ($c$):

$$u_{caja}(x, z) = a + b\,z + c\,x$$

Las líneas de la chapa que están unidas a la caja (pliegues laterales y franja soldada de la bandeja) se obligan a moverse con ella. El suelo plegado es una viga muy rígida en su plano pero solo está unido a la caja por la esquina derecha, así que puede girar: $w = u_{caja}(104, 0) + \varphi\,(x - 104)$. El canto superior y el canto izquierdo por debajo de z = 150 quedan libres. Estas ligaduras se imponen por penalización ($k_p = 10^8$ N/mm). Las guías y el apoyo de la tapa interior, que son pletinas, no se cuentan como rigidizadores (del lado de la seguridad).

### 6.3 Tornillos

Cada tornillo es un muelle axial de rigidez $k_a$ que **solo trabaja a tracción** (un tirafondo no empuja la chapa contra la pared; eso lo hace la propia pared). El muelle se une a una **arandela rígida de Ø18**: 9 puntos de la chapa (centro y 8 en el borde) se obligan a moverse como un disco rígido.

### 6.4 Contacto con la pared

La pared es un apoyo de Winkler que **solo empuja**: en cada nudo, un muelle $k_w \cdot A_{trib}$ que actúa únicamente si la chapa intenta entrar en la pared ($w < 0$). Como no se sabe de antemano qué zonas apoyan, se resuelve por iteración de conjunto activo:

1. Se activan todos los tornillos y ningún contacto.
2. Se resuelve el sistema lineal $K u = f$.
3. Se desactivan los tornillos con $w < 0$ y se activan los nudos con $w < 0$; se desactivan los contactos que tiran.
4. Se repite hasta que no cambia ningún estado (normalmente 2–12 iteraciones).

El resultado es la tracción de cada tornillo $N_i = k_a \cdot w_i$ y el reparto de presiones contra la pared. Se comprueba siempre el equilibrio: $\sum N_i - \sum F_{contacto} = Q_n$ (error < 10⁻⁴ N).

### 6.5 Cortante en el plano

En su plano, la chapa es prácticamente indeformable. El cortante se reparte entre todos los tornillos como en una unión rígida: traslación igual para todos más un giro alrededor del centroide de los tornillos:

$$V_{x,i} = \frac{V_x}{n} + \frac{T (z_i - z_0)}{J} \qquad V_{z,i} = \frac{V_z}{n} - \frac{T (x_i - x_0)}{J} \qquad J = \sum \left[(x_i - x_0)^2 + (z_i - z_0)^2\right]$$

Se supone que todos colaboran (holgura del agujero 6,5 − 6 = 0,5 mm) y se desprecia el rozamiento con la pared y la precarga del apriete, lo que queda del lado de la seguridad.

### 6.6 Comprobación de cada tornillo

Fischer da un único valor para cualquier dirección, así que se usa la resultante:

$$F_i = \sqrt{N_i^2 + V_{x,i}^2 + V_{z,i}^2} \le F_{rec}$$

### 6.7 Dos hipótesis de borde

No se sabe exactamente cuánto impide el lateral (soldado al frontal) que gire el pliegue. Se calculan los dos extremos y se toma **el peor**:

- **Apoyado:** el pliegue gira libremente.
- **Empotrado:** la pendiente de la chapa en el pliegue es la de la caja.

### 6.8 Por qué importa que la chapa sea flexible

Al tirar, la caja arrastra la chapa por los pliegues. La chapa se curva entre los pliegues y los tornillos, y el trozo que queda más allá de cada tornillo se clava contra la pared, como una palanca. Con 500 N en la esquina superior derecha:

| | Suma de tracciones ΣN | Tornillo más cargado |
|---|---|---|
| Patrón anterior (C) | 1.201 N (2,4 veces la fuerza aplicada) | 259 N |
| P18-3 | 1.105 N | 138 N |

La diferencia entre la suma de tracciones y los 500 N la devuelve la pared en compresión. En el patrón C, los tornillos del centro (x = 0) casi no trabajan porque la chapa ahí aprieta contra la pared, y los que están junto al pliegue derecho se lo llevan todo. Con 3 mm la palanca es algo menor que con 2 mm (ΣN = 1.382 N en C), pero sigue mandando.

## 7. Modelos de contraste: chapa rígida y método clásico

Para saber cuánto importa la flexibilidad, se calcularon también:

- **Chapa rígida:** la misma física (tornillos solo a tracción, pared solo a compresión), pero con la chapa indeformable: 3 incógnitas ($a, b, c$). Es la generalización correcta de la fórmula de libro.
- **Clásico:** las fórmulas que se usan a mano: pivote en el canto inferior, pivote en el canto inferior + lateral opuesto, y Navier biaxial respecto al centroide de los tornillos.

Tirón de 300 N sin peso propio, tracción máxima en un tornillo (N):

| Esquina | Patrón | FEM (peor borde) | Rígido | Pivote inferior | Pivote inf. + lateral | Navier |
|---|---|---|---|---|---|---|
| Sup. derecha | C | **149** | 68 | 57 | 99 | 104 |
| Sup. derecha | A | **136** | 54 | 40 | 83 | 80 |
| Sup. derecha | B | **143** | 57 | 43 | 87 | 84 |
| Sup. derecha | P18-3 | **79** | 54 | 43 | 83 | 87 |

La tracción máxima del FEM es entre 1,0 y 2,5 veces la del modelo rígido (con 2 mm, entre 1,4 y 3).

**Consecuencia importante:** con chapa rígida los cuatro patrones serían parecidos (λ: C 12,1 · A 13,6 · B 13,3 · P18-3 13,2). La ventaja del P18-3 sale de tener en cuenta que la chapa se dobla, también con 3 mm. Por eso el ensayo de la máquina montada (§13) es la verificación que más importa.

## 8. Verificación del modelo

| Comprobación | Resultado |
|---|---|
| Elemento de placa: placa cuadrada simplemente apoyada de 200 mm con 1000 N en el centro, frente a Timoshenko ($w = 0{,}0116\,P a^2/D$) | Error 0,2 % con 32×32 elementos (el error relativo no depende del espesor; ver el [estudio de 2 mm](historico-2mm/README.md#8-verificación-del-modelo)) |
| Límite rígido: FEM con la chapa 10⁴ veces más rígida frente al modelo rígido | Diferencias ≈ 1 % en los tornillos más cargados (comprobado con el mismo código en el estudio de 2 mm) |
| Equilibrio en cada solución | Error < 10⁻⁴ N |
| Convergencia de malla (caso gobernante, con arandela) | Tabla siguiente |

| Malla | C apoyado / empotrado (N) | P18-3 apoyado / empotrado (N) |
|---|---|---|
| 20 mm | 260,5 / 218,6 | 140,2 / 128,9 |
| 10 mm | 259,0 / 219,2 | 142,1 / 132,3 |
| 5 mm | 258,7 / 219,1 | 142,1 / 133,1 |
| 2,5 mm (≈ 49.471 incógnitas) | 257,9 / 218,8 | 141,9 / 133,3 |

Entre 5 y 2,5 mm la diferencia es del 0,2 % en el ganador. Los valores de diseño se dan con la malla de 10 mm; la búsqueda usó la de 20 mm sin arandela.

![Convergencia de malla](figuras/fig8_convergencia.png)

**Sensibilidad a las hipótesis** (λ de la envolvente, malla de 10 mm):

| Variante | C | A | B | P18-3 |
|---|---|---|---|---|
| ka = 500 N/mm | 7,35 | 8,44 | 7,93 | **11,48** |
| ka = 2000 N/mm (base) | 5,79 | 6,33 | 6,00 | **10,56** |
| ka = 10000 N/mm | 4,66 | 4,82 | 4,69 | **9,22** |
| kw = 5 N/mm³ | 5,37 | 6,03 | 5,68 | **9,69** |
| kw = 500 N/mm³ | 6,00 | 6,47 | 6,16 | **10,96** |
| CdG a 45 mm de la pared | 5,84 | 6,38 | 6,05 | **10,62** |
| CdG a 65 mm de la pared | 5,75 | 6,28 | 5,96 | **10,50** |

La rigidez de los tacos es la hipótesis que más influye, pero el P18-3 es el mejor en todas las variantes (entre 1,4 y 1,9 veces el mejor de los otros tres).

## 9. Optimización

### 9.1 Variables y restricciones

- Variables: las coordenadas $(x_i, z_i)$ de cada agujero, continuas.
- Cada vez que se mueve un agujero se **proyecta** al punto admisible más cercano de las zonas Z1–Z3 (fuera de guías, espárrago y soldaduras).
- La separación mínima entre agujeros (50 mm) entra como penalización:

$$J = \lambda_{patrón} - 20 \sum_{i<j} \frac{\max(0,\ 50 - d_{ij})}{50}$$

- Se probaron patrones **libres** (asimétricos) y **simétricos** respecto a x = 0, con 18 agujeros (el número no cambia).

### 9.2 Función objetivo

$\lambda_{patrón}$ = mínimo de λ sobre los 9 casos de §5.3 × las 2 hipótesis de borde (18 problemas de contacto por evaluación). No se optimiza solo la tracción: la resultante incluye el cortante y entran el cuelgue y los tirones laterales.

### 9.3 Resolución rápida

Para poder evaluar miles de patrones, el modelo de búsqueda (malla de 20 mm) ordena las incógnitas de la chapa por filas, de modo que su matriz es de banda (ancho 50). Las 4 incógnitas de la caja y el suelo se separan por complemento de Schur:

$$K = \begin{bmatrix} A & B \\ B^T & C \end{bmatrix} \quad\Rightarrow\quad S = C - B^T A^{-1} B, \qquad u_{caja} = S^{-1} f, \qquad u_{chapa} = -A^{-1} B\, u_{caja}$$

$A$ se factoriza con Cholesky en banda. Además, cada caso arranca con el conjunto de contacto de la evaluación anterior. Así, los 9 casos de un patrón se resuelven en ≈ 15 ms, con el mismo resultado que un solver disperso genérico.

### 9.4 Recocido simulado

En cada iteración se elige un agujero al azar y:

- con probabilidad 0,85 se desplaza una distancia aleatoria normal de desviación σ, que baja de 45 a 1,5 mm a lo largo de la búsqueda;
- con probabilidad 0,15 salta a un punto aleatorio de las zonas.

El cambio se acepta si mejora $J$ o, si empeora, con probabilidad $e^{\Delta J / T}$, con una temperatura $T$ que baja geométricamente de 0,6 a 0,004. Así se puede salir de óptimos locales al principio y afinar al final. Al acabar, un **pulido por coordenadas** prueba a mover cada agujero ±3 mm y ±1 mm en x y en z.

### 9.5 Arranques realizados

Primera fase: 2 arranques libres y 1 simétrico de 2000 iteraciones. Se añadió como candidato el P18-O de 2 mm llevado a las zonas nuevas. Segunda fase: 4 recocidos de 4000 iteraciones, 2 desde las mejores soluciones (libre y simétrica, T₀ = 0,15) y 2 desde cero.

| Arranque | Iteraciones | λ (malla de búsqueda) |
|---|---|---|
| Fase 2 · libre · desde el mejor de la fase 1 | 4000 | 11,41 |
| P18-O de 2 mm llevado a las zonas nuevas | — | 11,17 (no cumple s ≥ 50 mm) |
| Fase 2 · simétrico · desde el mejor de la fase 1 | 4000 | 11,08 |
| Fase 1 · simétrico · semilla 318 | 2000 | 11,06 |
| Fase 2 · simétrico · arranque nuevo | 4000 | 11,05 |
| Fase 1 · libre · semilla 218 | 2000 | 10,86 |
| Fase 2 · libre · arranque nuevo | 4000 | 10,84 |
| Fase 1 · libre · semilla 118 | 2000 | 9,69 |
| Patrón anterior C (referencia) | — | 5,77 |

**El método es heurístico.** Los arranques libres dieron entre 9,69 y 11,41: hay varios óptimos locales y **no se puede afirmar que el resultado sea el óptimo global**. Sí que es claramente mejor que los tres candidatos previos con todas las hipótesis probadas. Los tres simétricos llegaron casi al mismo valor (11,05–11,08), lo que sugiere que en el subespacio simétrico la búsqueda está cerca de su mejor valor.

![λ de cada arranque](figuras/fig3_lambda_n.png)

### 9.6 Selección y redondeo

Los dos mejores patrones libres y los dos mejores simétricos se redondearon a 0,5 mm (comprobando que siguen dentro de las zonas) y se recalcularon con la malla de 10 mm y arandela:

| Patrón | λ búsqueda | λ redondeado (malla 20) | λ final (malla 10, arandela) | Separación mín. |
|---|---|---|---|---|
| Libre 1 (fase 2, desde el mejor) → alternativa libre | 11,41 | 11,39 | 10,94 | 50,0 mm |
| Libre 2 (fase 1, semilla 218) | 10,86 | 10,83 | 10,15 | 50,0 mm |
| Simétrico 1 (fase 2, desde el mejor) → **P18-3** | 11,08 | 11,07 | **10,56** | 50,0 mm |
| Simétrico 2 (fase 1, semilla 318) | 11,06 | 11,04 | 10,52 | 51,0 mm |

Regla: se prefiere el simétrico si llega al 95 % del libre, porque es más fácil de replantear y de comprobar. Llega al 96 % (10,56 / 10,94), así que **gana el simétrico**. Con 2 mm se quedó en el 90 % y ganó el libre.

### 9.7 Lo que aprendió la búsqueda

- Los tornillos útiles están **pegados a las partes rígidas**: columnas a ±87…93 mm junto a los pliegues laterales, filas justo encima y debajo de la pestaña de la bandeja (z = 175,5 y 139,5) y la franja superior Z3 (z = 428,5, mayor brazo de palanca y menos chapa en voladizo). Es la misma lección que con 2 mm.
- La columna central x = 0 del patrón C apenas trabaja en los tirones.
- El límite |x| ≤ 93 está activo: la búsqueda pedía ir aún más cerca de los pliegues.

## 10. Patrón resultante

P18-3, agujeros Ø6,5 (x desde el eje de la máquina, z desde la cara inferior, trasera vista desde delante). Es simétrico: cada agujero tiene su pareja en −x.

| Nº | x (mm) | z (mm) | Zona | | Nº | x (mm) | z (mm) | Zona |
|---|---|---|---|---|---|---|---|---|
| 1 | -87,5 | 428,5 | Z3 | | 10 | 93,0 | 224,5 | Z2 |
| 2 | 87,5 | 428,5 | Z3 | | 11 | -38,5 | 223,5 | Z2 |
| 3 | -87,0 | 376,5 | Z2 | | 12 | 38,5 | 223,5 | Z2 |
| 4 | 87,0 | 376,5 | Z2 | | 13 | -54,0 | 175,5 | Z2 |
| 5 | -91,5 | 325,5 | Z2 | | 14 | 54,0 | 175,5 | Z2 |
| 6 | 91,5 | 325,5 | Z2 | | 15 | -93,0 | 139,5 | Z1 |
| 7 | -93,0 | 275,5 | Z2 | | 16 | 93,0 | 139,5 | Z1 |
| 8 | 93,0 | 275,5 | Z2 | | 17 | -47,5 | 22,0 | Z1 |
| 9 | -93,0 | 224,5 | Z2 | | 18 | 47,5 | 22,0 | Z1 |

Separación mínima entre agujeros: 50,0 mm. Está en `modelo/diseno.py` (`FIJACIONES_PARED`) y en el DXF de A-C02.

![Tracción por tornillo con el tirón que gobierna](figuras/fig2_fuerzas.png)

![Desplazamiento de la chapa](figuras/fig9_deformada.png)

## 11. Cuánto aguanta

Acción admisible con el peso propio de 18 kg fijo, hasta que el tornillo más cargado llega a la carga recomendada de fischer para cada pared (la carga recomendada ya lleva el coeficiente de seguridad del fabricante):

| Pared | F_rec de un taco (kN) | Tirón en la esquina sup. dcha., P18-3 (N; entre paréntesis, en kilos de fuerza) | Ídem, patrón C (N) | Peso colgado del borde delantero, P18-3 (N) |
|---|---|---|---|---|
| Hormigón ≥ C20/25 | 1,50 | **5.997** (611 kg) | 3.020 | **18.376** (1.873 kg) |
| Ladrillo macizo ≥ Mz 12 | 0,80 | **3.187** (325 kg) | 1.600 | **9.738** (993 kg) |
| Silicocalcáreo macizo ≥ KS 12 | 1,50 | **5.997** (611 kg) | 3.020 | **18.376** (1.873 kg) |
| Silicocalcáreo perforado ≥ KSL 12 | 0,80 | **3.187** (325 kg) | 1.600 | **9.738** (993 kg) |
| Ladrillo perforado vertical ≥ HLz 12 | 0,40 | **1.582** (161 kg) | 789 | **4.802** (489 kg) |
| Bloque hueco de hormigón ligero (enlucido) | 0,30 | **1.180** (120 kg) | 586 | **3.567** (364 kg) |
| Hormigón celular ≥ AAC 4 | 0,40 | **1.582** (161 kg) | 789 | **4.802** (489 kg) |
| Hormigón celular ≥ AAC 2 | 0,15 | **578** (59 kg) | 281 | **1.716** (175 kg) |

- Una persona de 80 kg que se deja caer colgada del borde (1570 N con factor 2) queda cubierta en todas las paredes con dato de fischer.
- **La chapa pone el límite antes que los tacos en hormigón y ladrillo macizo:** con el P18-3 empieza a deformarse de forma permanente junto a las arandelas de arriba a partir de unos 1.775 N de tirón en la esquina (con 2 mm era a unos 902 N). No es una rotura (arrancar la arandela de Ø18 a través de 3 mm exige del orden de 27 kN), pero queda marcada. En ladrillo perforado, bloque y hormigón celular mandan los tacos.
- En ladrillo hueco horizontal y en pladur fischer no da carga para este taco: **no** son soportes válidos con estos tacos.
- Las cifras de peso colgado sólo miran los tacos. Con cargas tan grandes mandarían antes la chapa, las soldaduras y la propia caja, que no se han calculado para eso: no hay que leerlas como «aguanta 1,8 toneladas».
- No son cargas certificadas del conjunto: son el reparto que da el modelo frente a la carga recomendada de un taco aislado.

## 12. Análisis complementarios

Cada uno se calculó así (los resultados están en el PDF):

| Análisis | Cómo |
|---|---|
| **Carga admisible con el peso fijo** | Bisección (30 pasos) sobre la acción variable F, con el peso fijo en 18 kg, hasta que el tornillo más cargado llega a F_rec de cada tipo de pared. Por eso no coincide con λ × 500 N, que escala también el peso. |
| **Cargas verticales 15–100 kg** | En el centro de gravedad (máquina más pesada) y colgadas del borde delantero superior con los 18 kg propios. |
| **Golpe frontal** | 2000 N hacia la pared, en el centro y en una esquina. |
| **Golpe lateral** | Método energético: toda la energía E (10 y 30 J) se almacena elásticamente, $F_{eq} = \sqrt{2 E k_{ef}}$, con $1/k_{ef}$ = flexibilidad del vuelco (del FEM) + cortante de los tacos (1000 N/mm por taco, hipótesis) + cuerpo que golpea (50 N/mm, hipótesis). Con impactador rígido la fuerza sale varias veces mayor, lo que no es realista para un pie o un puño. |
| **Pérdida de 1, 2, 4 y 6 tacos** | Peor caso por eliminación voraz (cada vez se quita el taco cuya falta más baja λ) y 40 combinaciones al azar. Sin los 2 peores, el P18-3 conserva el 67 % (λ ≈ 7,4), más en valor absoluto que C intacto. |
| **Fallo progresivo** | Cada paso rompe el tornillo más cargado y se recalcula; colapso = máximo de los multiplicadores de la secuencia. En los cuatro patrones sale rotura en cadena (colapso = primera rotura). |
| **Juntas de ladrillo** | Monte Carlo: aparejo a soga con junta de 10 mm (ladrillo 24×11,5×5, ×7, hueco doble 24×11,5×8 y bloque 40×20×20) desplazado al azar respecto a la máquina, 120 posiciones. Un taco cuenta como «en junta» si el taladro de Ø8 la toca, y se omite. Variante «con ajuste»: el instalador sube o baja la máquina dentro de una hilada (pasos de 10 mm) hasta la posición con más capacidad. |
| **Tensión en la chapa** | $\sigma = 6M/t^2$ en cada cara (von Mises) en los centros de los elementos y en 16 puntos alrededor de cada arandela (r = 9,5 mm). Se busca el tirón con la primera plastificación local (Re = 140 y 280 MPa). |
| **Variantes** | Alternativa libre (§9.6, λ = 10,94) y versión para mampostería con separación ≥ 100 mm, con la misma búsqueda y `S_MIN=100`. Con separación mínima de 100 mm (mampostería) sólo caben 12 tornillos en las zonas sin penalización: λ = 6,24 y 3.236 N de tirón admisible en hormigón. Sólo compensa si la pared obliga a separar los tacos. |

## 13. Limitaciones

- La carga de los tacos es la **recomendada por fischer para un taco aislado**; el reparto entre tacos sale del modelo. Nada de esto es una resistencia certificada del conjunto.
- La **rigidez de los tacos** y la **separación mínima** entre ellos son hipótesis: fischer no las publica.
- La ventaja del P18-3 depende de que la chapa se doble como predice el FEM (§7). Antes de fabricar en serie conviene un **ensayo de la máquina montada** (tirón lateral y en esquina) y ensayos de arrancamiento en la pared real.
- Masa y centro de gravedad son estimados: hay que pesar el prototipo (repetir el cálculo si pasa de 18 kg).
- La caja se supone rígida y la pestaña de la bandeja, una unión rígida; conviene confirmar la soldadura con el taller.
- No se considera la precarga del apriete ni el rozamiento con la pared (ambos ayudarían).
- La búsqueda es heurística (§9.5) y con 3 mm sólo se ha hecho para n = 18.
- En hormigón, la chapa plastifica localmente junto a las arandelas superiores antes de que los tacos lleguen a su carga recomendada (≈ 1,8 kN de tirón en esquina con el P18-3; ≈ 1,26 kN con C).

## 14. Cómo reproducirlo

El código está en [`codigo/`](codigo/) y los resultados de esta ejecución en [`resultados/`](resultados/). Hace falta Python ≥ 3.10 con `numpy`, `scipy`, `matplotlib`, `reportlab` y `pillow`. Las semillas aleatorias están fijadas.

| Archivo | Qué hace |
|---|---|
| `nucleo.py` | Geometría y zonas de la trasera de 3 mm, elemento ACM, modelo FEM con contacto, versión rápida en banda, modelo rígido y cortante |
| `evaluacion.py` | Datos de fischer, masas, casos de carga, patrones A, B y C, cálculo de λ |
| `optimizar.py`, `fase_18.py`, `intensificar.py`, `mamposteria.py` | Búsqueda (recocido simulado + pulido) |
| `seleccionar.py`, `seleccionar_util.py` | Redondeo, comprobación de zonas y elección del ganador |
| `analisis.py`, `variantes.py`, `juntas_ajuste.py` | Verificación, escenarios, pérdidas, paredes, juntas, golpes |
| `figuras.py`, `informe.py`, `preparar_extra.py` | Figuras, CSV e informe PDF |

El orden de ejecución está en [`codigo/LEEME.md`](codigo/LEEME.md). Con 2 núcleos, la búsqueda y los análisis tardan unos 45 minutos; con los JSON de `resultados/` se regeneran figuras e informe en un par de minutos.

## 15. Fuentes

- fischer, tabla de cargas del taco SX Plus (cargas recomendadas, c_min, notas): [LT_SX-PLUS_EN_T1.pdf](https://fiproductmedia.azureedge.net/media/Load%20Tables/Load%20Tables%20fischer/LT_SX-PLUS_EN_T1.pdf)
- fischer, ficha técnica Cheville SX PLUS (16/05/2023): taladro, h1, h_ef, tornillo, no anclar en juntas.
- fischer España, [taco SX Plus 8×65](https://www.fischer.es/es-es/productos/fijaciones-estandar/fijaciones-de-nylon/taco-de-expansion-sx-plus/567857-taco-sx-plus-8x65-k-nv-antes-532677): Ø8, h1 ≥ 75 mm, tornillo Ø4,5–6,0.
- thyssenkrupp Materials Services, hoja de material DC01–DC07 (EN 10130): Re ≤ 280 MPa, Rm 270–410 MPa, 140 MPa como mínimo de cálculo.
- S. Timoshenko, S. Woinowsky-Krieger, *Theory of Plates and Shells* (verificación del elemento de placa).
- Este repositorio (04-11-2026): `modelo/diseno.py`, `modelo/specs.py`, `Lista_de_piezas.xlsx`, `ANCLAJE-PARED-8x65.md`.
