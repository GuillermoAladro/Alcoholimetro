# Decisiones y cambios de diseño

Decisiones que afectan a todo el proyecto. Lo más nuevo va arriba. Si un documento del repositorio dice otra cosa, manda lo que pone aquí.

## 26-10-2026

### Componentes a tamaño real en el CAD y conexiones comprobadas una a una

- **Visor 3D:**
  - Cada pieza comprada se dibuja con su forma real: Pi 3B+, Camera Module 3, pantalla 7", SumUp Solo, LRS-50-5, C14, WAGO, portafusibles, bornes USB, ZE29A, AR9271, T y reductores.
  - Las medidas salen de las fichas. No se dibujan logotipos ni marcas.
  - La chapa se ve como acero sin pintar o con colores por grupo.
- **Nuevo `Conexiones_3D.html`.** Todas las piezas sobre una mesa con las 38 conexiones (W1…W28). Cada una lleva su terminal y su verificación.
  - Resultado: 0 errores y 19 conexiones con aviso.
- **Cambios en la colocación**, encontrados al modelar a tamaño real:
  - La celda del ZE29A chocaba con la pared del cajón.
  - Entre la C14 y la fuente no cabían faston y puntera.
  - Las entradas de las WAGO quedaban debajo de la pantalla.
  - Las bornas de los USB miraban al suelo.
  - Todo corregido en `specs.py`: 0 choques, los 6 barridos limpios y ningún cable atraviesa una pieza.
- **Abiertos** (no se cambian sin decidirlo):
  - El troncal de 5 V no lleva fusible.
  - Hay que confirmar los 5,20 V de la fuente frente al máximo de 5,3 V del ZE29A.
  - La Pi cuelga del troncal y no va directa a la fuente.
  - Los bornes USB van detrás de fusibles de 3 A.
  - El −V va a tierra a través del coaxial.
  - El fusible de la C14 está en un solo polo.
- **Faltan en la lista:**
  - Tubo de 4 mm.
  - Tubo fino de 2 × 4.
  - Reductores 6 → 2,5 para las tomas del ZE29A.

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

### Sin interruptor de red: la toma C14 ya no lleva el interruptor rojo

- **Por qué:** el módulo C14 de antes (B08Z6FCR5Z) llevaba un interruptor basculante rojo con luz, y se veía por la ventana del lateral derecho. Era el único «botón» que quedaba en la máquina.
- **Qué se pone:** una toma C14 con portafusibles y sin interruptor (Cablepelado, [B07CQ54BY4](https://www.amazon.es/dp/B07CQ54BY4)).
  - Precio: 8,03 € en la tienda de Cablepelado; el de Amazon no lo he podido leer.
  - No trae fusible: se pone el T2,5A (#16).
- **Cómo se apaga:** la máquina se enciende al enchufarla y se apaga desenchufándola. Para sacar el cajón ya había que desenchufarla. **El enchufe de la pared tiene que quedar a mano, o el bar tiene que poder cortar esa toma:** que lo confirme el electricista.
- **Cableado:** W2 y W3 van directos de la toma a los bornes 1 y 2 de la fuente; W4 y W5 desaparecen.
- **En el CAD:**
  - La toma se monta girada: tornillos M3 a 36 mm, uno encima de otro.
  - Recorte de 31,9 × 27,65 mm en el lateral del cajón.
  - La ventana de la carcasa pasa de 38 × 56 a 38 × 46.
  - Sigue sin chocar nada y sin roces.
  - Las medidas de la toma son las típicas de ese formato, no las del anuncio: se miden al recibirla.
- **Sigue abierto:** el fusible está en un solo polo y el Schuko entra de las dos maneras, así que puede quedar en el neutro. Las auditorías piden una entrada con portafusibles de dos polos documentada ([pendientes](componentes/pendientes.md), n.º 13).

### El botón, fuera de todo el repositorio

| Dónde | Qué ha cambiado |
|---|---|
| [LISTA DE COMPRA](LISTA-DE-COMPRA.md) | Fuera la línea 11 (pulsador, 10,88 €). Quedan 31 componentes y el primer pedido baja a 635,69 € (636,02 € con la toma C14 nueva) |
| [`componentes/`](componentes/README.md) | Borrada la ficha del pulsador (sigue en el historial de git, commit `dca2723`). El índice explica el hueco del número 11 |
| Fichas de componentes | **Cables Dupont:** solo pines 8 y 10, con un alojamiento de 1 × 2. **Kit faston:** solo para 230 V. También limpias las fichas de la crimpadora, el C14, los pasacables y la pantalla |
| [Pendientes](componentes/pendientes.md) | Revisados el 7 y el 18. Fuera la medida de los faston del pulsador; las medidas siguientes se renumeran |
| [MONTAJE GENERAL](MONTAJE-GENERAL.md) | Fuera W21, W22, la pieza 11, el agujero de Ø30 del panel y el pull-up. El punto 10 del apartado 4 pasa a ser la comprobación del cobro continuo. Figuras 2, 3 y 4 rehechas |
| [MONTAJE PASO A PASO](MONTAJE-PASO-A-PASO.md) | Fuera la prueba P1.11 y la fase 3.3; las pruebas y apartados siguientes se renumeran. Nueva prueba P6.14 de cobro continuo |
| [Anuncios de Amazon.es](montaje-general/anuncios-amazon-21-10-2026.md) | Fuera el anuncio del pulsador |
| [CAD del diseño A](carcasa/diseno-A/README.md) | No tenía pulsador. Tenía el interruptor rojo de la toma C14, que se quita (apartado anterior). La cerradura de la tapa se dibuja con su llave para que no parezca un botón |

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
