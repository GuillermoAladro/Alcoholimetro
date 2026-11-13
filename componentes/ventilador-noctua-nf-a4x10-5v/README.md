# Ventilador Noctua NF-A4x10 5V (dos)

Mueven el aire por el cajón de componentes: uno mete el aire del bar junto al SumUp Solo y el sensor, y el otro lo saca por la caja de red, donde está la fuente. Añadidos el 13-11-2026: sin ellos el cálculo da de 17 a 24 °C por encima del bar, y el Solo, el sensor y el módem tienen el límite en 40 °C ([revisión](../REVISION-13-11-2026.md), apartado 3.3).

- **Compra:** ASIN [B00NEMGCIA](https://www.amazon.es/dp/B00NEMGCIA). Unos 16 € cada uno (16,95 € en Coolmod el 13-11-2026; el precio de Amazon.es no se pudo leer).
- **Ref. en el CAD:** E25 (sin dibujar todavía). Dos por máquina.

## Datos del fabricante

| | |
|---|---|
| Medidas | 40 × 40 × 10 mm; taladros a 32 mm |
| Tensión | 5 V (arranca desde 4 V; máximo 5,5 V) |
| Consumo | 0,044 A típico, 0,05 A máximo (0,25 W) |
| Velocidad | 4500 rpm |
| Caudal libre | 8,2 m³/h |
| Presión estática | 1,78 mm H₂O (17,5 Pa) |
| Ruido | 17,9 dB(A) |
| Conector | 3 pines: negro masa, rojo +5 V, amarillo tacómetro |
| Temperatura de trabajo | −10 a +70 °C |
| Vida media (MTTF) | más de 150 000 h |
| Garantía | 6 años |

Dos años encendido son 17 520 horas.

## En el alcoholímetro

- **Alimentación:** los dos en una rama propia con fusible MINI de 2 A (W31). Siempre encendidos; no se regulan.
- **Tacómetro:** el hilo amarillo de cada uno a un GPIO (22 y 23) con la resistencia interna de la Pi a 3,3 V (W33). Si uno se para, el programa avisa y baja el consumo de la máquina.
- **Sentido del aire:** entra arriba, junto al Solo y el sensor, y sale abajo por la caja de red. El empuje del aire caliente (0,1 Pa) es despreciable frente al ventilador, así que el sentido se elige.
- **Sin filtro de espuma:** rejilla metálica con malla. Un filtro fino se atasca y obliga a ir.
- **En la chapa:** abertura de Ø38 y cuatro taladros a 32 mm por ventilador, y un burlete de espuma entre el cajón y la carcasa para que el aire no recircule por el hueco. Entra en el CAD con la carcasa.

## Estimación del resultado

Con los dos, unos 8 °C en el aire de salida sobre el del bar, suponiendo un caudal real del 55 % del libre. El Solo y el sensor, en la entrada, ven 2 o 3 °C. Si en el CAD cabe uno de 60 mm a la salida, mejor (unos 3 °C). **Es cálculo: lo dirá la prueba E1.**

## Pendiente

1. Leer el anuncio de Amazon.es y su precio.
2. Comprobar que el tacómetro da pulsos con la resistencia interna de la Pi.
3. Prueba E1: temperatura con la caja cerrada.

Fuentes: [Noctua, especificaciones del NF-A4x10 5V](https://noctua.at/en/nf-a4x10-5v/specification); [`cuentas.py`](../cuentas.py).
