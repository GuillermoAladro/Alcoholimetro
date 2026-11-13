# Alcoholímetro

Alcoholímetro de pago con tarjeta para bares, diseñado desde cero para aguantar dos años anclado en un local sin que nadie tenga que ir a arreglarlo.

**Estado (13-11-2026): en desarrollo. No hay ninguna máquina montada.** Todo lo que hay aquí es diseño, cálculo y simulación; nada está probado con piezas reales.

## Qué es

- **Para el cliente:** acerca la tarjeta o el móvil a un lector que está siempre esperando (2,00 €), coge una pajita, sopla, la máquina le hace una foto y le dice su resultado y su puesto en el ranking. No hay botón, ni pantalla táctil, ni interruptor.
- **La máquina (diseño A, «Compacta»):** caja de chapa cortada por láser y plegada, de 220 × 100 × 442,5 mm, sujeta a la pared con 18 tirafondos que solo se quitan desde dentro. Nada sobresale. La electrónica va en un cajón que entra por arriba.
- **Electrónica:** Raspberry Pi 3B+, pantalla de 7", cámara, sensor de alcohol Winsen ZE29A, lector SumUp Solo gobernado por la Cloud API, módem 4G y una fuente de 5 V.
- **Programa:** Node y Chromium en modo kiosco, sin bibliotecas externas. Cobro continuo, sensor, cámara, ranking, reembolsos y recuperación tras un apagón, con 76 pruebas automáticas sobre hardware simulado.

## Dónde está cada cosa

| Qué | Dónde |
|---|---|
| Decisiones, con fecha y motivo. **Si otro documento dice otra cosa, manda este** | [DECISIONES.md](DECISIONES.md) |
| Cableado: de qué borne sale cada cable, adónde llega y qué fusible lo protege | [CABLEADO.md](CABLEADO.md) |
| Lista de compra | [LISTA-DE-COMPRA.md](LISTA-DE-COMPRA.md) |
| Una ficha por componente, con sus hojas de datos, y la revisión de todos ellos del 13-11-2026 | [`componentes/`](componentes/README.md) · [revisión](componentes/REVISION-13-11-2026.md) |
| Carcasa: CAD paramétrico, STEP, DXF, planos de chapa plegada, lista de piezas, visor 3D, banco «Conexiones 3D» y cálculo del anclaje a la pared | [`carcasa/diseno-A/`](carcasa/diseno-A/README.md) |
| Programa de la Raspberry Pi, sus simuladores y sus pruebas | [`programa/`](programa/README.md) |
| Las 140 animaciones de la pantalla, con su vista previa | [`Animaciones 2D/`](Animaciones%202D/README.md) |
| Los 14 personajes: recortables, vectoriales y hojas de personaje | `Avatares 2D/` · [`avatares SVG - Astra/`](avatares%20SVG%20-%20Astra/README.md) · `animaciones/` |
| Auditorías externas del diseño eléctrico (21-10-2026) | [`auditorias/`](auditorias/) |
| Documentos que ya no mandan | [`historico/`](historico/README.md) |

## Reglas del proyecto

- **A prueba de balas.** Entre barato y fiable gana fiable, diciendo cuánto cuesta.
- **Todos los componentes se piden en Amazon.es.** Lo que no se pueda, se dice con el motivo y lo decide Guillermo.
- **Sin botón y sin interruptor, y nada sobresale de la carcasa.**
- **Cada dato dice de dónde sale:** leído en una hoja de datos, calculado, estimado o supuesto. Nada se da por verificado con hardware.
- **Los 230 V y la tierra los revisa un electricista** antes de enchufar nada.

## Lo que falta

- **Pruebas con piezas reales.** La primera, antes de pedir chapa: que el SumUp Solo arranque solo tras un corte de luz y cobre a través de los dos policarbonatos. Están en la [revisión de componentes](componentes/REVISION-13-11-2026.md), apartado 9.
- **Carcasa:** pasar al CAD los cambios eléctricos del 13-11-2026 (ventiladores, seis portafusibles, placa de bornes), sustituir el acero DC01 por un material que no se oxide y cerrar el paquete para el taller.
- **Anclaje:** comprobar con un modelo aparte el patrón de 18 agujeros y rehacerlo con el material definitivo.
- **Programa:** meter en el repositorio la pantalla v3 (12-11-2026), y hacer la subida a una web y los dos rankings (el del bar y el de todas las máquinas).
- **Presupuesto** de una máquina.
- Fuera de este repositorio: la respuesta de SumUp por escrito sobre el uso sin personal, el marcado del producto y la protección de datos de las fotos.

## Autor

Guillermo Aladro Abad
