# Revisión del banco Astra

**25 escenas, IDs 00000–00024. 8074 fotogramas renderizados con Canvas Skia.**

Controles por escena: registro e ID únicos, sintaxis y ejecución JavaScript, negro exacto al inicio (incluido 1/60 s) y al final, Guillermo dentro del cuadro durante la acción, contenido visible y render determinista al volver a un instante.

La referencia de Guillermo se conserva byte a byte. Los valores RGB opacos del recorte coinciden con los de la región original; el motor solo aplica transformaciones rígidas y escala uniforme.

## Revisión visual por muestras

| ID | Continuidad revisada | Capturas |
|---|---|---|
| 00000 | Oclusión delante/detrás en la órbita; aterrizaje antes del descenso del vaso. | [00000.jpg](00000.jpg) |
| 00001 | Pies apoyados durante el recorrido; ascensores separados y escala constante. | [00001.jpg](00001.jpg) |
| 00002 | Cubitos conservados; arco de entrada por la boca del vaso; pirámide final. | [00002.jpg](00002.jpg) |
| 00003 | Aceituna presente desde el inicio, oculta por el pliegue y revelada al abrirse. | [00003.jpg](00003.jpg) |
| 00004 | Trayectoria cerrada con salida y regreso al mismo cuello de botella. | [00004.jpg](00004.jpg) |
| 00005 | Golpes con retorno a la base; respuesta de la campana pequeña desde su cajón. | [00005.jpg](00005.jpg) |
| 00006 | Guillermo se desplaza sobre un carrito visible; tramos de la pajita conectados. | [00006.jpg](00006.jpg) |
| 00007 | Gota continua desde el borde hasta la mancha; llegada del posavasos antes del impacto. | [00007.jpg](00007.jpg) |
| 00008 | Tres platos con puestos y trayectos separados; el mantel se enrolla y vuelve a extenderse. | [00008.jpg](00008.jpg) |
| 00009 | Secuencia rojo-ámbar-verde; tres gotas conservadas como tres manchas. | [00009.jpg](00009.jpg) |
| 00010 | Vaso oculto por el servilletero; salida continua por su carril y foco propio. | [00010.jpg](00010.jpg) |
| 00011 | Vasos y líquidos verticales durante el ajuste de las patas. | [00011.jpg](00011.jpg) |
| 00012 | Pivote de cucharilla fijo; cortina descubre la taza ya situada detrás. | [00012.jpg](00012.jpg) |
| 00013 | Azucarillo sigue el canal y entra por encima de la taza. | [00013.jpg](00013.jpg) |
| 00014 | Ocho gajos conservan centro, orden y color durante apertura y cierre. | [00014.jpg](00014.jpg) |
| 00015 | Contacto, compresión y rebote enlazados; entrada de la gota por encima del vaso. | [00015.jpg](00015.jpg) |
| 00016 | Botella articulada sobre pivote fijo; oscilación amortiguada y remate de cucharilla. | [00016.jpg](00016.jpg) |
| 00017 | Cuatro aceitunas conservan orden al girar; la quinta desciende sobre la plaza libre. | [00017.jpg](00017.jpg) |
| 00018 | Cinco burbujas cambian de contorno al cruzar el aro y salen por el mismo lado. | [00018.jpg](00018.jpg) |
| 00019 | Corregido el recorrido: saltos con contactos en los peldaños, arco sobre el borde y cubito parcialmente sumergido. | [00019.jpg](00019.jpg) |
| 00020 | Carta desplegable, puerta ascendente y plato que sale en un recorrido continuo sobre la mesa. | [00020.jpg](00020.jpg) |
| 00021 | Corregidos el solapamiento inicial de carros y el apoyo del carril; frenado separado. | [00021.jpg](00021.jpg) |
| 00022 | Tapa articulada y servilleta conservan sus posiciones; cierre con la tela colgando delante. | [00022.jpg](00022.jpg) |
| 00023 | La lámpara explica el cambio de longitud de la sombra; vaso y mesa fijos. | [00023.jpg](00023.jpg) |
| 00024 | Guillermo y Laura reconocibles y completos; vasos se acercan hasta tocar bordes y regresan. Máscara de Laura revisada sobre fondo oscuro. | [00024.jpg](00024.jpg) |

## Límites

Las capturas representan 8 instantes por escena y mantienen la relación 1024:600. La revisión por muestras puede no detectar todos los errores entre fotogramas. Los controles de píxeles no certifican por sí solos perspectiva o raccord.

La comprobación se ha ejecutado con Canvas Skia en Node. No se ha completado una prueba en navegador: Chromium no estaba disponible y su descarga devolvió una página de sitio no disponible. El JavaScript del visor ha pasado la comprobación de sintaxis. Rendimiento en Raspberry Pi 3B+, reproducción del visor en navegador e integración con el programa del alcoholímetro: pendientes. El máximo de tiempo de render registrado es de este entorno, no una medida de la Pi.

Las escenas mantienen el estado de banco **no-verificado** solicitado por el usuario; las pruebas no afirman ausencia absoluta de fallos.
