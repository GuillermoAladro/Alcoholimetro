# Animaciones Astra — banco separado para revisión

La lista de **500 ideas originales** está en [LISTA-500.md](LISTA-500.md), con IDs `00000`–`00499`. Solo las entradas de [lista.js](lista.js) corresponden a animaciones ya implementadas. Este banco tiene su propio espacio de IDs y no reemplaza el banco anterior.

## Ver las animaciones

Descarga el repositorio y abre **[ver.html](ver.html)** en Chrome, Edge o Firefox. También funciona servido por HTTP local. No requiere internet, Google Fonts, paquetes de JavaScript ni un servidor para la reproducción. El visor permite elegir escena, avanzar, pausar y arrastrar la línea temporal. El contador indica las escenas realmente creadas.

## Formato

- Lienzo: **1024 × 600**, sin audio obligatorio.
- Un archivo `IIIII Título.js` por escena, con `"use strict"`, una función autoejecutable y `registrar({id,nombre,crear})`.
- Contrato de escena: `actualizar(dt)`, `dibujar(ctx)`, `dur`, `t` y `terminada`, como en el banco anterior.
- Motor propio en `motor/base.js`. Para cargar estas escenas se necesitan los archivos de **este** motor; no se deben mezclar IDs ni motores directamente en el banco antiguo.
- Primeros y últimos fotogramas completamente negros. Cada objeto conserva su trayectoria entre fotogramas; el tiempo absoluto permite inspeccionar un instante de manera reproducible.

## Avatares

Se usan las hojas **actuales** de Guillermo Aladro y, en las escenas compartidas, Laura. Los archivos `motor/referencia-guillermo.png` y `motor/referencia-laura.png` son copias binarias idénticas de las referencias del repositorio; sus SHA-256 y regiones utilizadas figuran en [procedencia-avatares.json](motor/procedencia-avatares.json).

La máscara elimina el fondo de la región frontal al dibujar. Los píxeles opacos del personaje mantienen sus valores RGB originales. No hay imágenes generadas de sustitución, retoques de cara, cambios de ropa, deformaciones del cuerpo ni cambios de proporciones. El personaje se coloca mediante traslación, rotación rígida y escala uniforme. Las plataformas y mecanismos explican los desplazamientos del personaje.

## Revisión

[revision/INFORME.md](revision/INFORME.md) detalla las comprobaciones y sus límites. [revision/resultados.json](revision/resultados.json) contiene los resultados por ID. Las hojas de capturas conservan la proporción original de cada cuadro.

Para repetir las comprobaciones de Canvas:

```sh
npm install --no-save @napi-rs/canvas
node herramientas/verificar.cjs
```

Se puede pasar un ID para comprobar solo una escena: `node herramientas/verificar.cjs 00000`.

El nombre **no-verificadas** se conserva según el encargo. Los controles automáticos y la revisión visual por muestras no garantizan la ausencia absoluta de errores. El rendimiento en la Raspberry Pi 3B+, la prueba del visor en navegadores y la integración con el programa de la máquina quedan pendientes.
