# Resistencias de 1 kΩ (dos)

Una en serie en cada hilo de la UART entre la Pi y el ZE29A (W19 y W20). Añadidas el 13-11-2026, cambio E4 de la [revisión](../REVISION-13-11-2026.md).

- **Compra:** sin anuncio elegido. 1 kΩ, 1/4 W, película metálica. Precio estimado: 6 € el lote.
- **Ref. en el CAD:** E27. Dos por máquina.

## Por qué

- Con un fusible por rama puede quedar la Pi encendida y el sensor apagado, o al revés. La resistencia limita a unos 3 mA la corriente que entra por un pin sin alimentar.
- Protege el pin de la Pi si alguien se equivoca de borne.
- A 9600 baudios no afecta.

## Montaje, sin soldar

Una pata en el borne de la [placa de bornes del GPIO](../placa-bornes-gpio/README.md) y la otra, con el hilo del sensor, en una WAGO 221-412.
