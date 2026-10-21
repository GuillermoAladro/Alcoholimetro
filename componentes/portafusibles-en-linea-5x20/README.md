# Portafusibles en línea de 5 × 20 mm con fusibles rápidos de vidrio (kit)

Pieza nueva del 21-10-2026. Sale del hallazgo H04 de la auditoría técnica 1.0 (y P0 en la 2.0): el raíl de 5 V no tenía protección por rama. La fuente LRS-50-5 solo se protege a sí misma (sobrecarga por hipo a partir de 11 A) y un cortocircuito en un latiguillo de 22 AWG o en un borne USB dejaría pasar esos 11 a 15 A por un hilo dado para unos 3 A.

**Esta ficha es corta.** A diferencia de las otras 31, no tiene todavía una investigación exhaustiva: recoge lo que dice el anuncio, cómo se usa en el MONTAJE GENERAL y qué comprobar al recibirlo. Si se hace la investigación completa, va aquí.

> Anuncio de Amazon.es leído el 21-10-2026 con el navegador integrado. Cada dato indica de dónde sale. Lo que no he podido comprobar está marcado como **sin verificar**.

## 1. Resumen para el proyecto

- **Qué es:** un kit con 5 portafusibles en línea para fusible de 5 × 20 mm (cuerpo de rosca con dos hilos) y 150 fusibles rápidos de vidrio, 15 de cada valor: 0,5, 1, 2, 3, 4, 5, 8, 10, 15 y 20 A.
- **Para qué:** un portafusibles en el troncal de +5 V, pegado a la fuente (F 8 A), y uno en el +5 V de cada una de las cuatro ramas: Pi (F 3 A), SumUp Solo (F 2 A), pantalla (F 2 A) y ZE29A (F 1 A). Se usan los cinco; sobran fusibles de todos los valores. Las cuatro auditorías del repositorio (6.1-S F04, 6-A A6A-03, P H2, 5.6 C-03) piden protección del troncal además de la de cada rama.
- **Dónde va:** el del troncal entre el borne 5 de la fuente y el polo 1 de la WAGO «+5 V» (W11); los de rama entre el polo 2 a 5 de la WAGO «+5 V» y la carga, lo más cerca posible de la WAGO ([MONTAJE GENERAL](../../MONTAJE-GENERAL.md), W13, W14, W16 y W18). Solo en el +5 V, nunca en el GND.
- **Compra:** [B07KQ46H6K](https://www.amazon.es/dp/B07KQ46H6K), 9,99 € el 21-10-2026.

## 2. Lo que dice el anuncio

| Dato | Valor | Origen |
|---|---|---|
| Contenido | 5 portafusibles en línea AGC de 5 × 20 mm + 150 fusibles de vidrio de 5 × 20 mm | Texto |
| Valores de los fusibles | 0,5 A, 1 A, 2 A, 3 A, 4 A, 5 A, 8 A, 10 A, 15 A y 20 A, 15 de cada | Texto |
| Tipo de fusible | Rápido («fast-blow»), de vidrio, 250 V | Texto |
| Hilos del portafusibles | 16 AWG (1,3 mm²), 25 cm | Texto |
| Portafusibles | «Tipo tornillo» (de rosca), 20 A, «hermético» según el vendedor | Texto |
| Valoración | 4,5 de 5 con 684 valoraciones; en stock | Página |
| Reseñas | Un cliente dice que el valor grabado en el cristal se lee mal: fiarse de la etiqueta de la caja. Otro, que lleva un mes instalados sin fallo | Reseñas |

## 3. Uso en el alcoholímetro

| Rama | Corriente típica | Pico estimado | Fusible | Por qué |
|---|---|---|---|---|
| Troncal (las cuatro ramas) | 2,3 a 2,9 A | 5 A (5,5 A si el Solo llega a 2 A) | **F 8 A** | Protege el cable de 0,75 mm² entre la fuente y la WAGO; la fuente solo entra en hipo a partir de 11 A. Un fusible no limita al instante y el hipo puede retrasar la fusión (auditoría 6.1-S F04): se ensaya en banco con cargas ficticias |
| Raspberry Pi 3B+ + cámara + AR9271 | 0,9 A | 2,0 A | **F 3 A** | La Pi lleva su propio polifusible de 2,5 A; el de la rama protege el latiguillo de 22 AWG |
| SumUp Solo cargando | 0,5 A | 1,5 A | **F 2 A** | Con cable A → C el Solo ve una fuente de 500 mA; si reconoce el puente D+/D−, hasta 1,5 A |
| Pantalla 7" | 1 A (5 W, anuncio) | 1 A | **F 2 A** | Arranque de la retroiluminación sin dato |
| ZE29A | < 0,5 A (manual) | < 0,5 A | **F 1 A** | El electroimán de la toma de muestra no tiene corriente publicada |

Los calibres son de papel: **se confirman midiendo cada rama con una pinza amperimétrica** (MONTAJE GENERAL, apartado 4, punto 8). Si un fusible funde al arrancar, se sube un escalón.

Los hilos de 16 AWG entran en la WAGO 221 (admite de 0,14 a 4 mm²) sin puntera, pelados a 11 mm; en W13 y W18 el otro extremo se empalma con el latiguillo de 22 AWG o con el hilo de la clavija en una WAGO 221-412 del surtido (#20); en W14 y W16 entra directo en el tornillo del borne USB-A (admite AWG 28 a 16); en W11 lleva puntera en el borne 5 de la fuente. Los 25 cm de hilo se acortan.

## 4. Qué comprobar al recibirlo

1. Que los cinco portafusibles cierran y abren bien: continuidad con un fusible puesto, ninguna sin él, y que la rosca no se afloja con una sacudida (va en la carcasa, no en la caja suspendida; si va en la caja suspendida, brida).
2. Que los fusibles de 1, 2 y 3 A existen en el kit y que su valor coincide con la etiqueta de la caja (el grabado del cristal se lee mal).
3. Resistencia de un fusible de 1 A con el polímetro en Ω: tiene que dar unas décimas de ohmio, no abierto.
4. Que el hilo es de cobre y no de aluminio cobreado: rasca un extremo; si debajo del cobre hay gris claro, es CCA (misma comprobación que en la ficha #19).

## 5. Lo que no he podido verificar

- Marca de los fusibles, su poder de corte y su curva de fusión: el anuncio no da hoja de datos. Para 5 V y menos de 15 A de cortocircuito no importa; sí importaría a 230 V.
- Si el «hermético» del vendedor es una junta tórica real. Da igual dentro de la máquina.
- Que el hilo sea de 16 AWG de cobre.

## 6. Fuentes

- Anuncio B07KQ46H6K de Amazon.es, leído el 21-10-2026 (texto, ficha técnica y reseñas con compra verificada).
- `analisis-auditoria.md` y `analisis-auditoria-2.md` (Project): hallazgo H04.
- Datasheet LRS-50 de Mean Well ([copia local](../meanwell-lrs-50-5/datasheets/LRS-50-SPEC.pdf)): sobrecarga 110–150 % en modo hipo.
