# Decisiones y cambios de diseño

Decisiones que afectan a todo el proyecto. Lo más nuevo va arriba. Si un documento del repositorio dice otra cosa, manda lo que pone aquí.

## 22-10-2026

### Sin botón en todo el proyecto

La máquina **no lleva pulsador ni ningún otro botón**. La pantalla no es táctil, así que la prueba arranca cuando la cámara detecta a alguien delante. Después se cobra con el SumUp Solo y se sopla.

| Qué | Dónde estaba | Qué pasa ahora |
|---|---|---|
| Pulsador arcade EG STARTS de 30 mm (#11, B01N11BDX9, 10,88 €) | [LISTA DE COMPRA](LISTA-DE-COMPRA.md) | **No se compra** |
| Cables W21 y W22, pines 9 y 11 de la Pi (GPIO17) | [MONTAJE GENERAL](MONTAJE-GENERAL.md) | No se cablean. Los pines 9 y 11 quedan libres |
| Pull-up de 1 kΩ del pulsador | MONTAJE GENERAL, pendientes #18 | No hace falta (la resistencia de la UART sigue pendiente) |
| Agujero de Ø30 mm en el panel | MONTAJE GENERAL, apartado de colocación | No se taladra |
| Prueba P1.11 y fase 3.3 | [MONTAJE PASO A PASO](MONTAJE-PASO-A-PASO.md) | Se saltan |
| Clase `Pulsador`, `gpiozero` y grupo `gpio` | `programa/main.py` e `instalar.sh` (Project) | **Ya cambiado:** `main.py` espera a que la cámara detecte presencia (flujo pequeño de 320 × 240 comparado con un fondo que sigue a la luz) y no usa ningún GPIO |

**Qué se queda:** el kit de faston (#27) sigue haciendo falta para la toma C14.

**Pendiente:** ajustar en el bar, con la luz real, los umbrales de presencia de `main.py` (`DIF_PIXEL`, `FRACCION_PRESENCIA`, `VECES_SEGUIDAS`).

### Diseño actualizado: manda el diseño A (cajón de componentes)

Cierra el pendiente 12 de [`componentes/pendientes.md`](componentes/pendientes.md). La máquina es el **diseño A, Compacta**:
- Carcasa de 220 × 103 × 443 mm.
- Un cajón de componentes que entra por arriba.
- Cajón de pajitas con dos candados.
- Dos policarbonatos en el frente.

El CAD está en [`carcasa/diseno-A/`](carcasa/diseno-A/README.md): visor 3D, STEP, DXF de corte, lista de piezas y los scripts que lo generan.

**Cambios de hoy en el CAD:**
- **Tapa interior plana deslizante.**
  - Entra por una **ranura de 2,1 × 90 mm en el lateral derecho**, justo debajo del borde del panel, y desliza hasta el lateral izquierdo.
  - Corre sobre un saliente delantero (5 mm) y uno trasero (12,5 mm), soldados por dentro.
  - Ya no lleva silicona.
  - Encima de la ranura hay una muesca R8 para arrastrarla con el dedo.
  - Para sacarla hacen falta unos 23 cm libres a la derecha de la máquina.
- **Faldón derecho en la tapa abatible.** Con la tapa cerrada tapa la ranura: la tapa interior no se puede sacar sin abrir con llave.
- **Antena girada hacia abajo**, porque hacia arriba cortaba el paso de la tapa interior.
- **Puente de tierra y coaxial** pasan por debajo del saliente trasero, para que la tapa interior no los pise.
- **Un tope de goma** sobre cada asidero, en vez de dos.
- **46 piezas a fabricar.** El modelo da 0 choques. También se ha comprobado sin roces el movimiento de:
  - la tapa;
  - la tapa interior al salir;
  - el cajón de componentes al subir;
  - el cajón de pajitas al salir.

**Pendiente:** [MONTAJE GENERAL](MONTAJE-GENERAL.md), [MONTAJE PASO A PASO](MONTAJE-PASO-A-PASO.md) y la [LISTA DE COMPRA](LISTA-DE-COMPRA.md) todavía siguen el diseño anterior (19 y 20 de octubre). Ya llevan el aviso de que no hay pulsador, pero falta pasarlos al diseño A. Cambian sobre todo:
- la colocación;
- la tierra;
- los fusibles por rama;
- el Wi-Fi.
