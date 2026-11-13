# Condensador electrolítico de 2200 µF

Va entre las regletas de +5 V y GND (W32). Añadido el 13-11-2026, cambio E2 de la [revisión](../REVISION-13-11-2026.md).

- **Compra:** sin anuncio elegido. Precio estimado: 8 € el lote.
- **Ref. en el CAD:** E26 (sin dibujar todavía). Uno por máquina.

## Qué tiene que cumplir

2200 µF (vale de 1000 a 2200), **16 V o más**, **105 °C**, baja ESR, radial. Opcional: uno cerámico de 100 nF en paralelo.

## Por qué

- La nota 7 de la hoja de la fuente dice que, en los modelos de 3,3 y 5 V, con carga entre el 0 y el 50 % trabaja a ráfagas y el rizado se sale de la especificación. La máquina va al 25 %.
- Ayuda con el rizado y con el tirón del electroimán del sensor. En modo ráfaga puede no bajar la amplitud: **hay que medirlo con osciloscopio** (prueba D1).
- El margen es del sensor: con la fuente a 5,10 V su máximo en continua es 5,21 V y el ZE29A admite 5,30 V. El rizado no puede pasar de 186 mVpp. Si pasa de 150 mVpp, la fuente baja a 5,05 V.

## Montaje

Patillas con funda, cada una a un polo libre de la WAGO 221-413 de ampliación; el cuerpo, sujeto con una brida. **Respetar la polaridad.**

Fuentes: [hoja LRS-50](../meanwell-lrs-50-5/datasheets/LRS-50-SPEC.pdf); [`cuentas.py`](../cuentas.py).
