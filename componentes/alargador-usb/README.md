# Alargador USB 2.0, A macho → A hembra

Para colocar el módem 4G detrás de la ventana del lateral izquierdo, en vez de pinchado en la Pi. Añadido el 13-11-2026 para la prueba de cobertura ([revisión](../REVISION-13-11-2026.md), apartado 6.3).

- **Compra:** sin anuncio elegido. USB 2.0, apantallado, de 15 a 30 cm. Precio estimado: 6 €.
- **Ref. en el CAD:** E28. Uno, y solo si la prueba C3 elige este montaje.

## Para qué

El módem mide 88 × 28 mm y la ventana del cajón 32 × 108: cabe. Detrás de la ventana usa sus dos antenas internas y **se elimina la toma CRC9**, que entra a presión y es mala compañera de los golpes. Se compara en la misma prueba con la [antena plana](../antena-4g-plana-fpc/README.md) y se queda el montaje que mida mejor.

La alimentación del módem sigue viniendo del USB de la Pi, así que la Pi puede cortársela con `uhubctl`.
