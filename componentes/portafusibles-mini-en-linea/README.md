# Portafusibles MINI en línea y fusibles MINI de cuchilla

Un fusible en el +5 V del troncal y de cada rama. Desde el 13-11-2026 son el único tipo de fusible de 5 V: sustituyen al [kit de vidrio de 5 × 20](../retirados/portafusibles-en-linea-5x20/README.md). Es lo que ya dibujaba el CAD.

- **Compra:** portafusibles, ASIN [B07Q495GQG](https://www.amazon.es/dp/B07Q495GQG), 9,49 €; kit de fusibles, ASIN [B0BMGBBPTT](https://www.amazon.es/dp/B0BMGBBPTT), 15,99 € (precios del modelo del CAD, octubre de 2026).
- **Ref. en el CAD:** E10 (portafusibles) y E20 (fusibles). **Seis portafusibles por máquina; el CAD lleva cuatro.**

## Qué fusible va en cada sitio

| Rama | Fusible | Pico de la rama | Pico sobre fusible |
|---|---|---|---|
| Troncal | 5 A | 3,1 A | 62 % |
| Pi, con cámara y módem | 3 A | 2,1 A | 70 % |
| Pantalla | 2 A | 1,0 A | 50 % |
| SumUp Solo | 2 A | 1,5 A | 75 % |
| ZE29A | 2 A | 0,5 A | 25 % |
| Ventiladores | 2 A | 0,1 A | 5 % |

## Por qué de cuchilla

- Están hechos para la vibración de un coche; el vidrio de un 5 × 20 se puede romper con un golpe.
- La serie MINI de Littelfuse empieza en 2 A. Por eso el sensor pasa de 1 a 2 A: protege igual su cable de 22 AWG.
- **Van holgados a propósito.** Un fusible fundido es una visita. Los picos de arranque supuestos quedan por debajo del 10 % de la energía de fusión de cada uno (cálculo sobre supuestos, a medir).

## Datos de la serie MINI de Littelfuse (referencia)

| Calibre | Resistencia en frío | Energía de fusión |
|---|---|---|
| 2 A | 55,6 mΩ | 2,8 A²s |
| 3 A | 33,75 mΩ | 9,4 A²s |
| 5 A | 17,75 mΩ | 25 A²s |

32 V, rápidos, capacidad de corte de 1000 A. Los del kit de Amazon son genéricos: estas cifras son las de Littelfuse y sirven de referencia.

## Pendiente

1. Mirar cuántos portafusibles trae el paquete y que el kit tenga fusibles de 5 A.
2. Medir con pinza la corriente normal y la de arranque de cada rama.

Fuentes: [Littelfuse, fusibles MINI serie 297](https://www.mouser.com/datasheet/2/240/media-3322397.pdf); [CABLEADO](../../CABLEADO.md).
