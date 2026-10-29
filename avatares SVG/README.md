# Avatares SVG

Versiones vectoriales de las hojas de personaje de `animaciones/`, con fondo transparente y listas para la pantalla de la máquina.

| Avatar | Hoja completa | Piezas sueltas | Estado |
|---|---|---|---|
| Guillermo Aladro | [Avatar Guillermo Aladro.svg](Avatar%20Guillermo%20Aladro.svg) | [Guillermo Aladro/](Guillermo%20Aladro/) | Hecho |
| Ander, Carla, Dari, Deivi, Gabacho, Kiriku, Laura, Marcos Bombero, Marta, Paradigma, Rodri, Sara Saez, Yorgi | — | — | Pendiente |

![Original frente a SVG](revision/Guillermo%20Aladro%20-%20original%20vs%20SVG.jpg)

## Qué hay en cada avatar

**Hoja completa** (`Avatar <Nombre>.svg`): mismas medidas y posiciones que el PNG original (1122 × 1402), sin fondo. Está organizada en grupos con `id`:

| Grupo | Contenido |
|---|---|
| `<slug>-firma` | Firma manuscrita del nombre |
| `<slug>-vista-frontal`, `-tres-cuartos`, `-perfil`, `-espalda` | Las cuatro vistas de cuerpo entero |
| `<slug>-cara-neutral`, `-risa`, `-sorpresa`, `-dormido`, `-ojos-cerrados`, `-mirada-de-lado` | Las seis expresiones |

Cada grupo lleva `data-caja="x y ancho alto"` con el contorno exacto del personaje. Ese valor sirve directamente como `viewBox` para recortar una sola pieza. El slug de Guillermo es `guillermo-aladro`.

**Piezas sueltas** (`<Nombre>/vista-*.svg` y `<Nombre>/cara-*.svg`): un SVG por vista y por expresión, ya recortado al personaje. Llevan los mismos trazos que la hoja, sin volver a vectorizar. Son lo más práctico para las animaciones:

```html
<img src="avatares SVG/Guillermo Aladro/vista-frontal.svg" height="350">
```

## Uso en la máquina (Raspberry Pi 3B+)

- Un SVG tan detallado tarda en dibujarse. **Hay que rasterizarlo una vez al cargar**, al tamaño en que se va a mostrar, y en cada fotograma pintar ese bitmap:

  ```js
  const img = new Image();
  img.src = 'avatares SVG/Guillermo Aladro/vista-frontal.svg';
  await img.decode();
  const h = 350, w = Math.round(h * img.naturalWidth / img.naturalHeight);
  const sprite = new OffscreenCanvas(w, h);          // o un <canvas> oculto
  sprite.getContext('2d').drawImage(img, 0, 0, w, h);
  // En cada fotograma: ctx.drawImage(sprite, x, y);
  ```

- Al estar en vectorial, se puede rasterizar a cualquier tamaño (por ejemplo, la cara a pantalla completa) sin que se pixele el contorno.
- La firma conserva la tinta oscura del original, así que sobre negro apenas se ve. Para ponerla en blanco, cambia `fill="#23222b"` por `fill="#fff"` en el grupo `guillermo-aladro-firma` (o, si el SVG va incrustado en la página, usa el CSS `#guillermo-aladro-firma { fill: #fff }`).
- Los archivos no dependen de nada externo: no llevan imágenes incrustadas, scripts ni fuentes.

## Fidelidad (Guillermo Aladro)

Comparación del SVG renderizado con el PNG original. Las métricas cubren las zonas de cada parte; el MAE mide la diferencia media de color en 0–255 dentro del personaje.

| Parte | SSIM | MAE | Trazos |
|---|---|---|---|
| Vista frontal | 0,940 | 3,7 | 15 739 |
| Vista tres cuartos | 0,929 | 4,5 | 14 575 |
| Vista perfil | 0,933 | 4,6 | 11 445 |
| Vista espalda | 0,943 | 3,5 | 14 664 |
| Cara neutral | 0,930 | 4,3 | 4 497 |
| Cara risa | 0,922 | 4,8 | 4 515 |
| Cara sorpresa | 0,917 | 4,9 | 4 210 |
| Cara dormido | 0,922 | 4,7 | 4 711 |
| Cara ojos cerrados | 0,926 | 4,6 | 3 920 |
| Cara mirada de lado | 0,930 | 4,3 | 4 812 |
| **Hoja completa** | **0,942** | **4,1** | **≈ 84 000** |

Comprobado con resvg y con Chromium (el navegador del kiosco), sobre blanco y sobre negro: sin halos en el contorno, con las zapatillas blancas completas, sin sombras del suelo, sin filos entre paneles de cara y con el pelo del panel vecino separado. El informe con las cajas y los ajustes está en [revision/](revision/).

Se trata de una vectorización fiel de la hoja (miles de manchas de color con curvas), no de un dibujo de línea simplificado. Los pelos sueltos más finos del contorno quedan algo simplificados.

## Cómo se ha hecho y cómo repetirlo con otro avatar

Las herramientas están en [herramientas/](herramientas/):

1. `vectorizar_avatar.py`: recorta el fondo con un modelo de segmentación (isnet), separa las cuatro figuras y las seis caras, limpia el contorno del pelo y el halo blanco, y traza cada parte ampliada ×2 con vtracer. Sobre la ropa negra añade una segunda capa trazada con los oscuros expandidos, para que la camiseta tenga sombreado continuo y no manchas.
2. `svgo.config.mjs`: optimiza el SVG (pasa de ~29 MB a ~11 MB) sin tocar `id`, `data-caja`, título ni descripción.
3. `partir_svg.py`: genera las piezas sueltas a partir de la hoja.

```sh
pip install "rembg[cpu]" vtracer numpy pillow opencv-python-headless scipy scikit-image
cd "avatares SVG"
python3 herramientas/vectorizar_avatar.py "../animaciones/Avatar Laura.png" /tmp/bruto.svg \
    --nombre "Laura" --slug laura --fuente-repo "animaciones/Avatar Laura.png" \
    --informe "revision/Laura - informe.json"
npx svgo@4 --config herramientas/svgo.config.mjs -i /tmp/bruto.svg -o "Avatar Laura.svg"
python3 herramientas/partir_svg.py "Avatar Laura.svg" "Laura"
```

Los valores por defecto son los ajustes elegidos para Guillermo. El proceso es determinista: con la misma hoja produce el mismo trazado. Cada hoja nueva hay que revisarla a ojo, porque el pelo, la ropa clara o una hoja con otra composición pueden necesitar ajustes.
