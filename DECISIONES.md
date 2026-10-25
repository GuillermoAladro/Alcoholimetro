# Decisiones y cambios de diseño

Decisiones que afectan a todo el proyecto. Lo más nuevo va arriba. Si un documento del repositorio dice otra cosa, manda lo que pone aquí.

## 25-10-2026

### Sin botón: el SumUp Solo está siempre esperando tarjeta

- **La máquina no lleva botón en ningún sitio.** El Solo está todo el rato esperando tarjeta:
  - La Pi le deja un cobro abierto por la Cloud API.
  - Cuando caduca sin pago (unos 60 s), abre otro.
  - En cuanto alguien paga, empieza la prueba.
- **No se cobra si la máquina no puede medir.** Antes de abrir cada cobro, la Pi comprueba que el sensor responde y que queda sitio para las fotos. Si algo falla, la pantalla dice «Fuera de servicio» y el Solo no pide tarjeta.
- **La cámara ya no arranca nada.** Esto sustituye a lo del 22-10, que arrancaba la prueba al detectar a alguien con la cámara. Ahora la cámara solo hace la foto.
- **Programa:** `programa/main.py` del Project ya funciona así.
  - Los datos de SumUp van en `~/.config/alcoholimetro/sumup.json`; `instalar.sh` deja la plantilla.
  - `--gratis` arranca pruebas sin cobrar, para el banco.
  - Probado con un lector simulado; con el Solo real, no.
- **Pendiente con el Solo real** (prueba P6.14 del [PASO A PASO](MONTAJE-PASO-A-PASO.md)):
  - Cuánto dura de verdad un cobro abierto.
  - Que SumUp acepta consultar el estado cada 3 s; no publica límites.
  - Qué hacer si el sensor falla después de cobrar (reembolso).

### El botón, fuera de todo el repositorio

| Dónde | Qué ha cambiado |
|---|---|
| [LISTA DE COMPRA](LISTA-DE-COMPRA.md) | Fuera la línea 11 (pulsador, 10,88 €). Quedan 31 componentes y el primer pedido baja a 635,69 € |
| [`componentes/`](componentes/README.md) | Borrada la ficha del pulsador (sigue en el historial de git, commit `dca2723`). El índice explica el hueco del número 11 |
| Fichas de componentes | **Cables Dupont:** solo pines 8 y 10, con un alojamiento de 1 × 2. **Kit faston:** solo para 230 V. También limpias las fichas de la crimpadora, el C14, los pasacables y la pantalla |
| [Pendientes](componentes/pendientes.md) | Revisados el 7 y el 18. Fuera la medida de los faston del pulsador; las medidas siguientes se renumeran |
| [MONTAJE GENERAL](MONTAJE-GENERAL.md) | Fuera W21, W22, la pieza 11, el agujero de Ø30 del panel y el pull-up. El punto 10 del apartado 4 pasa a ser la comprobación del cobro continuo. Figuras 2, 3 y 4 rehechas |
| [MONTAJE PASO A PASO](MONTAJE-PASO-A-PASO.md) | Fuera la prueba P1.11 y la fase 3.3; las pruebas y apartados siguientes se renumeran. Nueva prueba P6.14 de cobro continuo |
| [Anuncios de Amazon.es](montaje-general/anuncios-amazon-21-10-2026.md) | Fuera el anuncio del pulsador |
| [CAD del diseño A](carcasa/diseno-A/README.md) | Nunca tuvo botón; el texto explica cómo arranca la prueba |

**No se tocan las auditorías** (`auditorias/` y los zips de la raíz): son informes de terceros con su fecha y hablan del pulsador porque entonces existía.

## 22-10-2026

### Sin botón en todo el proyecto

Se decide que la máquina no lleva botón. Cómo arranca la prueba sin él está en la entrada del 25-10.

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

**Pendiente:** [MONTAJE GENERAL](MONTAJE-GENERAL.md), [MONTAJE PASO A PASO](MONTAJE-PASO-A-PASO.md) y la [LISTA DE COMPRA](LISTA-DE-COMPRA.md) todavía siguen el diseño anterior (19 y 20 de octubre). Ya no tienen el pulsador, pero falta pasarlos al diseño A. Cambian sobre todo:
- la colocación;
- la tierra;
- los fusibles por rama;
- el Wi-Fi.
