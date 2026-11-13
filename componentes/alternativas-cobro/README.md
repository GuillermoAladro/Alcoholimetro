# Alternativas al SumUp Solo para el cobro

Investigación del 13-11-2026: 20 formas de cobrar la prueba sin el SumUp Solo, con precios públicos, opinión de cada una y orden de recomendación.

**Es trabajo de papel.** No hay nada probado con aparatos y no se ha hablado con ningún proveedor. No cambia ninguna decisión del proyecto: cambiar de sistema de cobro y comprar fuera de Amazon son decisiones reservadas (ver [DECISIONES](../../DECISIONES.md)).

| Archivo | Qué es |
|---|---|
| [ALTERNATIVAS-COBRO-13-11-2026.pdf](ALTERNATIVAS-COBRO-13-11-2026.pdf) | El informe, para leer o imprimir (17 páginas) |
| [ALTERNATIVAS-COBRO-13-11-2026.md](ALTERNATIVAS-COBRO-13-11-2026.md) | El mismo informe en Markdown, para leerlo aquí |
| [datos.py](datos.py) | Datos, notas y cuentas de coste. `python3 datos.py` repite las cuentas |
| [generar.py](generar.py) | Genera el PDF y el Markdown a partir de `datos.py` (necesita `reportlab`) |

## Resumen

- El problema no es SumUp como empresa, sino que el Solo es un datáfono de mostrador con batería. Otro datáfono de mostrador no lo arregla.
- Lo que lo arregla es un terminal para máquinas sin personal, que cobra con su propia conexión y avisa a la Pi con un pulso.
- Las cinco primeras: Payter Apollo, Nayax VPOS Touch, myPOS Sigma, Viva.com con PAX IM30 y Paytef con un banco.
- Siguiente paso propuesto: pedir presupuesto en firme a Payter (Eurocoin), Nayax, Paytef y Wipay.

La ficha del lector actual sigue en [sumup-solo](../sumup-solo/README.md).
