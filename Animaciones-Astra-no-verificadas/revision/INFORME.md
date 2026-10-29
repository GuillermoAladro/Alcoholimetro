# Revisión de la primera tanda

**8 escenas, IDs 00000–00007. 2525 fotogramas renderizados con Canvas Skia.**

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

## Límites

Las capturas representan 8 instantes por escena y mantienen la relación 1024:600. La revisión por muestras puede no detectar todos los errores entre fotogramas. Los controles de píxeles no certifican por sí solos perspectiva o raccord.

La comprobación se ha ejecutado con Canvas Skia en Node. No se ha completado una prueba en navegador: Chromium no estaba disponible y su descarga devolvió una página de sitio no disponible. El JavaScript del visor ha pasado la comprobación de sintaxis. Rendimiento en Raspberry Pi 3B+, reproducción del visor en navegador e integración con el programa del alcoholímetro: pendientes. El máximo de tiempo de render registrado es de este entorno, no una medida de la Pi.

Las escenas mantienen el estado de banco **no-verificado** solicitado por el usuario; las pruebas no afirman ausencia absoluta de fallos.
