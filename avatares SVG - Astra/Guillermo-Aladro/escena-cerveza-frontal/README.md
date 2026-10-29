# Guillermo Aladro · Cerveza de frente

Versión frontal de la escena de la barra: Guillermo levanta la cerveza, bebe y la vuelve a apoyar. Bucle de 12 segundos, sin sonido. Basada en los trazados de `../01-frontal.svg`.

- `Guillermo-Aladro-cerveza-frontal.svg`: animación vectorial autónoma. Descargar y abrir en un navegador para reproducirla; GitHub puede mostrar una imagen estática.
- `Guillermo-Aladro-cerveza-frontal.mp4`: vídeo de la misma animación, 1280 × 900 y 24 fps.
- `Guillermo-Aladro-cerveza-frontal-preview.png`: fotograma del sorbo.
- `generar_escena.py`: composición y articulación de la escena.
- `renderizar_video.cjs`: captura de la línea de tiempo del SVG para generar el vídeo.
- `control-calidad.json`: procedencia y validaciones.

La cara, el pelo y la ropa proceden de la vista frontal original. El brazo derecho se articula con cambios de longitud proyectada para representar su movimiento hacia delante. Mano y vaso comparten la transformación; el vaso se acorta en perspectiva y su boca se hace más elíptica cuando se inclina hacia el personaje. El centro del borde se mantiene sobre los labios durante el sorbo.

El fondo, la mano adaptada al agarre y el vaso son elementos vectoriales añadidos. Se reconstruye la zona de camiseta que queda expuesta al mover el brazo, y se eliminan restos del fondo blanco original. La escena es una animación 2D por piezas, con perspectiva aproximada en profundidad.

No contiene imágenes incrustadas, recursos remotos ni JavaScript. Utiliza animaciones SVG SMIL. La versión de perfil se conserva en la carpeta hermana `escena-cerveza`.

## Reproducir

Python utiliza las dependencias de `../../herramientas/requirements.txt`. El vídeo requiere Node.js, Playwright, Chromium y FFmpeg.

```bash
python generar_escena.py
npm install playwright
npx playwright install chromium
node renderizar_video.cjs
```

Puede indicarse un Chromium ya instalado mediante `CHROMIUM_EXECUTABLE_PATH`.
