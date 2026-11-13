# Placa de bornes para el GPIO de 40 pines

Placa que se enchufa en los 40 pines de la Raspberry Pi, se atornilla a sus cuatro taladros y saca cada pin a un borne de tornillo. **Por ella entra la alimentación de la Pi** (bornes «5V» y «GND») y a ella llegan la UART del sensor y los tacómetros de los ventiladores. Añadida el 13-11-2026 ([revisión](../REVISION-13-11-2026.md), apartado 2, E1). Sustituye al [latiguillo micro-USB](../retirados/latiguillo-micro-usb-22awg/README.md) y a los [cables Dupont](../retirados/cables-dupont-elegoo-120/README.md).

- **Compra:** sin anuncio elegido (el 13-11-2026 no se pudo leer Amazon.es). Buscar «placa de bornes GPIO Raspberry Pi» o «GPIO terminal block breakout HAT». Precio estimado: 14 €.
- **Ref. en el CAD:** E24 (sin dibujar todavía).

## Qué tiene que cumplir

- Bornes de tornillo para **todos** los pines, incluidos los de 5 V (pines 2 y 4) y los de masa.
- Cuatro taladros que coincidan con los de la Pi (58 × 49 mm), para atornillarla con separadores M2,5. Sin esto no vale: lo que se busca es que no dependa de la fricción de los pines.
- Paso para la cinta de la cámara.
- Bornes que admitan hilo de 0,75 mm² (18 AWG).

## Por qué

- La Pi 3B+ admite 5 V por el conector GPIO según su ficha de producto (junto al micro-USB y al PoE).
- Quita de la rama de la Pi el contacto micro-USB y el polifusible de la placa. La resistencia de la rama baja de 115 a 59 mΩ y en el pico, con el módem, quedan 4,98 V en vez de 4,86 V (cálculo, [`cuentas.py`](../cuentas.py)).
- La alimentación va por dos pines en paralelo y la masa por ocho: si un contacto falla, quedan los demás.
- **Lo que se pierde:** el polifusible de la Pi. Su papel lo hace el fusible MINI de 3 A de la rama. Dos auditorías del 21-10-2026 pedían no saltárselo; se asume con ese fusible.

## En el alcoholímetro

| Borne | Va a | Conexión |
|---|---|---|
| 5V | Fuente, borne 5, por el portafusibles de 3 A | W13 |
| GND | Fuente, borne 4 | W13 |
| GPIO14 (pin 8) | ZE29A, pin 4, con 1 kΩ en serie | W19 |
| GPIO15 (pin 10) | ZE29A, pin 3, con 1 kΩ en serie | W20 |
| GPIO22 (pin 15) | Tacómetro del ventilador 1 | W33 |
| GPIO23 (pin 16) | Tacómetro del ventilador 2 | W33 |

## Pendiente

1. Elegir anuncio y medir la altura total sobre la Pi: tiene que caber en el cajón (se comprueba en el CAD).
2. Con todo encendido, medir entre el pin 4 y el pin 6: 4,90 V o más (prueba C1).
3. Si el borne «5V» no admite el hilo de 16 AWG del portafusibles, empalmar a 0,75 mm² con una WAGO 221-412.

Fuentes: [ficha de producto de la Raspberry Pi 3B+](../raspberry-pi-3b-plus/README.md); [CABLEADO](../../CABLEADO.md).
