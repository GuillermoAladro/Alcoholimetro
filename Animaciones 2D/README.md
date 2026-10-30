# Animaciones 2D

Animaciones para la pantalla de la máquina hechas con los **avatares 2D** de [`Avatares 2D/`](../Avatares%202D/). Cada personaje se trocea en piezas (recortables) a partir de su PNG y se anima en vivo con Canvas 2D, sin bibliotecas.

## Reglas de la carpeta

- **Empiezan y acaban en negro.** Los primeros y los últimos 0,12 s son negro absoluto (todos los píxeles a 0). `herramientas/comprobar.py` lo verifica fotograma a fotograma.
- **Sin títulos ni textos** dentro de la animación.
- **Personajes sacados del avatar 2D.** No se dibujan muñecos aparte. Solo se añade, con el mismo trazo, lo que el avatar no trae (por ejemplo, la mano que agarra algo) y los gestos de la cara.
- **Fluidez.** Cada escena se calcula a partir del tiempo absoluto `t`. Se ve igual a 30, 60 o 120 fps, y se puede rebobinar o grabar sin saltos. `comprobar.py` busca cortes bruscos entre fotogramas.
- **Formato.** Lienzo de 1024 × 600 (la pantalla de 7"). IDs de cinco cifras (`00001`, `00002`…). Un archivo por escena en `escenas/`.

## Animaciones

| ID | Nombre | Duración | Vista previa |
|---|---|---|---|
| 00001 | Guillermo y la jarra | 15,45 s | [MP4 60 fps](vista%20previa/00001%20Guillermo%20y%20la%20jarra.mp4) · [fotogramas](vista%20previa/00001%20Guillermo%20y%20la%20jarra%20-%20fotogramas.png) |

### 00001 · Guillermo y la jarra

Negro → Guillermo Aladro entra andando desde la izquierda con una jarra llena → se para en el centro → se la bebe entera en cuatro tragos (la cerveza queda horizontal y llega justo al borde) → «aaah» con bigote de espuma → aguanta el eructo con los mofletes hinchados → eructo con onda expansiva → mira a cámara, brinda y guiña un ojo → sale andando por la derecha → negro.

![Fotogramas de 00001](vista%20previa/00001%20Guillermo%20y%20la%20jarra%20-%20fotogramas.png)

## Ver y grabar

- **Ver.** Abre `ver.html` en Chromium.
  - Teclas: espacio = pausa, ← → = fotograma a fotograma, R = reiniciar, F = pantalla completa.
  - Parámetros de la dirección: `?id=00001` elige la escena; `?kiosco` la muestra a pantalla completa, sin mandos y en bucle.
- **Comprobar.** `python3 herramientas/comprobar.py 00001` revisa el negro inicial y final, los errores y los saltos.
- **Grabar.** `python3 herramientas/grabar.py 00001` saca un MP4 a 60 fps en `vista previa/`.

Las herramientas usan Playwright (Chromium) y ffmpeg.

## Estructura

```
Animaciones 2D/
├─ ver.html                      visor (lista de escenas, línea de tiempo, modo kiosco)
├─ motor/
│  ├─ base2d.js                  contrato de escena, utilidades y regla del negro
│  └─ recortes.js                piezas rígidas y extremidades que se doblan (rodajas sobre una curva + IK)
├─ personajes/guillermo-aladro/
│  ├─ preparar_piezas.py         trocea Avatares 2D/Guillermo-Aladro/Guillermo-Aladro-2D.png
│  ├─ piezas.png · piezas.js     atlas generado y posiciones de cada pieza
│  └─ guillermo.js               montaje del personaje: cuerpo, cara, puño y jarra
├─ escenas/00001 Guillermo y la jarra.js
├─ herramientas/                 comprobar.py y grabar.py
└─ vista previa/                 vídeos y fotogramas de cada animación
```

## Cómo están hechos los personajes

`preparar_piezas.py` recorta el PNG del avatar en 10 piezas:

- la cabeza del retrato, con los huecos de los ojos;
- las dos cejas y la boca, para mover los gestos;
- el torso con la mano en el bolsillo;
- el brazo de la jarra;
- las dos piernas del vaquero;
- la zapatilla (en dos tonos, para el pie de delante y el de detrás).

El script también rellena lo que el brazo tapaba en el torso y el bolsillo donde estaba la mano. Si el avatar cambia, se vuelve a ejecutar y sale el mismo atlas.

La cabeza va algo más grande que en el avatar, como en una caricatura. Brazos y piernas se doblan como una manguera: la pieza se corta en rodajas que siguen una curva calculada con cinemática inversa. Así los pies quedan clavados al suelo y la mano llega justo al asa.

## Añadir una animación

1. Crea `escenas/NNNNN Nombre.js`.
   - Dentro, define una clase que extienda `Escena2D(duración)` con un método `pintar(g, t)`.
   - Al final, llama a `registrar({ id, nombre, crear })`.
   - La base ya pinta el negro del principio y del final.
2. Añade su `<script>` en `ver.html`.
3. Si sale un personaje nuevo, crea su carpeta en `personajes/` con su propio `preparar_piezas.py`.
4. Pasa `comprobar.py` y graba la vista previa con `grabar.py`.
