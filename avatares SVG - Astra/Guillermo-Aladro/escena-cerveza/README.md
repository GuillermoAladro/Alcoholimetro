# Guillermo Aladro · Una cerveza en la barra

Escena animada de 12 segundos realizada a partir de `../03-perfil.svg`. Guillermo levanta el vaso desde la barra, lo acerca a los labios, lo inclina para beber y vuelve a apoyarlo. El movimiento se repite.

## Archivos

- **Guillermo-Aladro-cerveza.svg**: animación vectorial autónoma; descargar y abrir directamente en un navegador. GitHub puede mostrar únicamente una vista estática.
- **Guillermo-Aladro-cerveza.mp4**: vista de la misma animación, 1280 × 900, 24 fps y sin sonido.
- **Guillermo-Aladro-cerveza-preview.png**: fotograma del sorbo.
- **generar_escena.py**: construcción de la escena y articulación del brazo.
- **renderizar_video.cjs**: exportación del vídeo desde la línea de tiempo real del SVG.
- **control-calidad.json**: procedencia, dimensiones y comprobaciones.

El rostro, el pelo, la camiseta y los detalles del brazo proceden de los trazados originales. Se han añadido el bar, el vaso, la espuma y una mano adaptada al agarre. La zona de camiseta oculta en la pose inicial se reconstruye al mover el brazo. Es una animación por piezas en 2D.

El hombro, el codo y la muñeca comparten una articulación calculada para que el vaso siga la mano. El borde del vaso permanece en contacto con los labios durante el sorbo, y el líquido contrarresta la inclinación del recipiente. Se ha ajustado el contorno del personaje para eliminar el borde blanco de la hoja original.

El SVG conserva los trazados visibles de la referencia sin simplificarlos. Se eliminan de cada pieza los trazados situados fuera de su zona de movimiento y los gradientes que no se usan. No contiene imágenes incrustadas, recursos remotos ni JavaScript. La animación utiliza SMIL.

## Reproducir la exportación

Python utiliza las dependencias de `../../herramientas/requirements.txt`. El vídeo requiere Node.js, Playwright, Chromium y FFmpeg.

```bash
python generar_escena.py
npm install playwright
npx playwright install chromium
node renderizar_video.cjs
```

Si Chromium ya está instalado, puede indicarse mediante `CHROMIUM_EXECUTABLE_PATH`. Los originales de la colección no se modifican.
