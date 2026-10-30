# Animaciones 2D

Animaciones para la pantalla de la máquina hechas con los **avatares 2D** de [`Avatares 2D/`](../Avatares%202D/). Cada personaje se trocea en piezas (recortables) a partir de su PNG y se anima en vivo con Canvas 2D, sin bibliotecas.

## Reglas de la carpeta

- **Empiezan y acaban en negro.** Los primeros y los últimos 0,12 s son negro absoluto (todos los píxeles a 0). `herramientas/comprobar.py` lo verifica fotograma a fotograma.
- **Sin títulos ni textos** dentro de la animación. La única excepción es lo impreso en un objeto cuando el guion lo pide: el globo de la 00003 y los números del marcador de la 00004.
- **Personajes sacados del avatar 2D.** No se dibujan muñecos aparte. Solo se añade, con el mismo trazo, lo que el avatar no trae (por ejemplo, la mano que agarra algo) y los gestos de la cara.
- **Fluidez.** Cada escena se calcula a partir del tiempo absoluto `t`. Se ve igual a 30, 60 o 120 fps, y se puede rebobinar o grabar sin saltos. `comprobar.py` busca cortes bruscos entre fotogramas; solo se admiten los golpes a propósito, como un estallido o un globo que revienta.
- **Formato.** Lienzo de 1024 × 600 (la pantalla de 7"). IDs de cinco cifras (`00001`, `00002`…), con sufijo para revisiones (`00001.2`). Un archivo por escena en `escenas/`.

## Animaciones

| ID | Nombre | Duración | Vista previa |
|---|---|---|---|
| 00001 | Guillermo y la jarra | 15,45 s | [MP4 60 fps](vista%20previa/00001%20Guillermo%20y%20la%20jarra.mp4) · [fotogramas](vista%20previa/00001%20Guillermo%20y%20la%20jarra%20-%20fotogramas.png) |
| 00001.2 | Guillermo y la jarra · revisada | 15,45 s | [MP4 60 fps](vista%20previa/00001.2%20Guillermo%20y%20la%20jarra.mp4) · [fotogramas](vista%20previa/00001.2%20Guillermo%20y%20la%20jarra%20-%20fotogramas.png) · [revisión](revision/00001.2.md) |
| 00002 | Guillermo se transforma | 12,45 s | [MP4 60 fps](vista%20previa/00002%20Guillermo%20se%20transforma.mp4) · [fotogramas](vista%20previa/00002%20Guillermo%20se%20transforma%20-%20fotogramas.png) |
| 00002.2 | Guillermo se transforma · revisada | 12,45 s | [MP4 60 fps](vista%20previa/00002.2%20Guillermo%20se%20transforma.mp4) · [fotogramas](vista%20previa/00002.2%20Guillermo%20se%20transforma%20-%20fotogramas.png) · [revisión](revision/00002.2.md) |
| 00003 | Guillermo y el globo | 12,45 s | [MP4 60 fps](vista%20previa/00003%20Guillermo%20y%20el%20globo.mp4) · [fotogramas](vista%20previa/00003%20Guillermo%20y%20el%20globo%20-%20fotogramas.png) |
| 00003.2 | Guillermo y el globo · revisada | 12,45 s | [MP4 60 fps](vista%20previa/00003.2%20Guillermo%20y%20el%20globo.mp4) · [fotogramas](vista%20previa/00003.2%20Guillermo%20y%20el%20globo%20-%20fotogramas.png) · [revisión](revision/00003.2.md) |
| 00004 | Guillermo contra la máquina | 13,25 s | [MP4 60 fps](vista%20previa/00004%20Guillermo%20contra%20la%20maquina.mp4) · [fotogramas](vista%20previa/00004%20Guillermo%20contra%20la%20maquina%20-%20fotogramas.png) |
| 00010 | Guillermo en la discoteca | 13,60 s | [MP4 60 fps](vista%20previa/00010%20Guillermo%20en%20la%20discoteca.mp4) · [fotogramas](vista%20previa/00010%20Guillermo%20en%20la%20discoteca%20-%20fotogramas.png) |

### 00001 · Guillermo y la jarra

Negro → Guillermo Aladro entra andando desde la izquierda con una jarra llena → se para en el centro → se la bebe entera en cuatro tragos (la cerveza queda horizontal y llega justo al borde) → «aaah» con bigote de espuma → aguanta el eructo con los mofletes hinchados → eructo con onda expansiva → mira a cámara, brinda y guiña un ojo → sale andando por la derecha → negro.

![Fotogramas de 00001](vista%20previa/00001%20Guillermo%20y%20la%20jarra%20-%20fotogramas.png)

### 00001.2 · Revisión de continuidad

Conserva el guion y el avatar de 00001. Corrige la unión del brazo con la mano, el codo al doblarse, el contacto jarra–boca y el volumen de cerveza durante los tragos. El zoom mantiene completos el pelo y los zapatos; el temblor del eructo entra y sale suavemente. La 00001 original se conserva.

![Fotogramas de 00001.2](vista%20previa/00001.2%20Guillermo%20y%20la%20jarra%20-%20fotogramas.png)

Para verla, elige **00001.2** en `ver.html` o abre `ver.html?id=00001.2`. [Informe y comprobaciones reproducibles](revision/00001.2.md).

### 00002 · Guillermo se transforma

1. Negro.
2. Con la mano en el bolsillo, se bebe una copa de balón de un trago.
3. Le da una sacudida, saca el puño y se lo mira.
4. **Carga gradual:**
   - abre las piernas, se agacha y aprieta los puños;
   - la copa vacía se agrieta en la mano;
   - chispas, piedrecitas que suben y grietas en el suelo;
   - destellos dorados en el pelo cada vez más seguidos.
5. Grita y **estalla:**
   - destello y onda expansiva;
   - la copa revienta;
   - la camiseta se rasga y deja ver un torso muy musculado;
   - pelo rubio de punta y ojos azules;
   - aura dorada con rayos.
6. Mira arriba, se agacha y sale volando hasta salir por arriba.
7. Negro.

![Fotogramas de 00002](vista%20previa/00002%20Guillermo%20se%20transforma%20-%20fotogramas.png)

### 00002.2 · Revisión de continuidad

Mantiene el guion, el avatar y los 12,45 s de la original. Corrige las muñecas y el giro del codo, el contacto y volumen de la copa, el encuadre durante la carga y el origen de los cristales. La explosión y los efectos se calculan con el tiempo absoluto: reproducir, buscar y rebobinar dan el mismo fotograma.

[Informe y pruebas](revision/00002.2.md). Selecciona **00002.2** en `ver.html` o abre `ver.html?id=00002.2`.

### 00003 · Guillermo y el globo

1. Negro.
2. Con las manos en los bolsillos, saca un globo rojo desinflado y lo mira.
3. Lo hincha en **cuatro soplidos**, cogiendo aire entre medias.
4. Lo que pone en el globo:
   - «Alcohol Tester» en blanco con sombra negra;
   - una lectura en g/cl3 que sube con cada soplido (0,0 → 2,5) y pasa de verde a rojo, con una barra de nivel debajo;
   - el texto crece con el globo y se curva con su forma.
5. Mientras sopla se le pone la cara roja del esfuerzo (mofletes hinchados y sudor).
6. El globo le **explota en la cara** y se queda pasmado, con trozos de goma pegados.
7. Mira a cámara enfadado: vena en la frente, humo, dientes apretados y puño amenazante.
8. Negro.

![Fotogramas de 00003](vista%20previa/00003%20Guillermo%20y%20el%20globo%20-%20fotogramas.png)

### 00003.2 · Revisión de continuidad

Conserva los cuatro soplidos, el estallido y el enfado. Corrige la unión brazo–mano, el contacto de la boquilla y la separación al coger aire, el encuadre del globo completo y la unidad impresa (g/L). La explosión ya no depende de lo que se haya reproducido antes.

[Informe y pruebas](revision/00003.2.md). Selecciona **00003.2** en `ver.html` o abre `ver.html?id=00003.2`.

### 00004 · Guillermo contra la máquina

1. Negro.
2. Junto a Guillermo hay una máquina de puñetazos apagada. Él, con las manos en los bolsillos, la mira de reojo.
3. Lanza una moneda con el pulgar a la ranura: la máquina se enciende y baja el saco.
4. **Calentamiento:**
   - se cruje el cuello;
   - se pone en guardia dando saltitos;
   - tira dos directos al aire;
   - amaga y mira a cámara con chulería.
5. Echa el brazo atrás y suelta el **puñetazo**.
6. La máquina se vuelve loca:
   - el marcador sube hasta 999 y parpadea;
   - las luces se descontrolan;
   - salen chispas y humo.
7. Se acerca a leer el marcador. El saco, que seguía girando, le da un **coscorrón**: se parte el brazo y la bola sale botando por el suelo.
8. Se tambalea con estrellitas y le sale un chichón.
9. Cae sentado con los ojos en espiral y levanta el pulgar a cámara.
10. La máquina se apaga echando humo.
11. Negro.

![Fotogramas de 00004](vista%20previa/00004%20Guillermo%20contra%20la%20maquina%20-%20fotogramas.png)

### 00010 · Guillermo en la discoteca

1. Negro.
2. Sala a oscuras. Baja una bola de espejos y Guillermo, con las manos en los bolsillos, la sigue con la mirada.
3. Un foco la ilumina, la bola empieza a girar y suelta puntitos de luz que le pasan también por encima.
4. Arranca la música (120 golpes por minuto: todo va a ese ritmo):
   - se encienden la pista de baldosas, los haces de colores y los altavoces, y salen notas musicales;
   - marca el ritmo con el pie y cabecea;
   - flexiona las rodillas a cada golpe alternando los puños.
5. **Paso de «Fiebre del sábado noche»:** mano en la cadera y el dedo índice al cielo y al suelo en cada golpe.
6. Cadera de lado a lado haciendo rodar las manos, guiño a cámara y brillo en la sonrisa.
7. Sale de plano haciendo el **moonwalk** hacia la izquierda.
8. La bola sigue girando, se apagan las luces → negro.

![Fotogramas de 00010](vista%20previa/00010%20Guillermo%20en%20la%20discoteca%20-%20fotogramas.png)

## Ver y grabar

- **Ver.** Abre `ver.html` en Chromium.
  - Teclas: espacio = pausa, ← → = fotograma a fotograma, R = reiniciar, F = pantalla completa.
  - Parámetros de la dirección: `?id=00001` elige la escena; `?kiosco` la muestra a pantalla completa, sin mandos y en bucle.
- **Comprobar.** `python3 herramientas/comprobar.py 00001` revisa el negro inicial y final, los errores y los saltos.
- **Grabar.** `python3 herramientas/grabar.py 00001` saca un MP4 a 60 fps en `vista previa/`.

Las herramientas usan Playwright (Chromium) y ffmpeg.

La revisión 00001.2 incluye además `node herramientas/validar-00001.2.cjs [ruta-a-chromium]` (Playwright para Node). Comprueba el líquido, los contactos, el encuadre completo, los controles y el determinismo a 30/60/120 fps. Guarda el resultado en `revision/00001.2-resultados.json`.

## Estructura

```
Animaciones 2D/
├─ ver.html                      visor (lista de escenas, línea de tiempo, modo kiosco)
├─ motor/
│  ├─ base2d.js                  contrato de escena, utilidades y regla del negro
│  └─ recortes.js                piezas rígidas y extremidades que se doblan (rodajas sobre una curva + IK)
├─ personajes/guillermo-aladro/
│  ├─ preparar_piezas.py         trocea Avatares 2D/Guillermo-Aladro/Guillermo-Aladro-2D.png
│  ├─ piezas.png · piezas.js     atlas generado (piezas originales) y posiciones de cada pieza
│  ├─ piezas_extra.png           piezas añadidas: brazo libre, torso sin brazos, pelo dorado y cara roja
│  └─ guillermo.js               montaje del personaje: cuerpo, cara, manos, jarra, copa y transformación
├─ escenas/                     una escena por archivo (00001, 00001.2, 00002, 00003, 00004)
├─ herramientas/                 comprobar.py y grabar.py
└─ vista previa/                 vídeos y fotogramas de cada animación
```

## Cómo están hechos los personajes

`preparar_piezas.py` recorta el PNG del avatar en piezas:

- la cabeza del retrato, con los huecos de los ojos;
- las dos cejas y la boca, para mover los gestos;
- el torso con la mano en el bolsillo;
- el brazo de la jarra;
- las dos piernas del vaquero;
- la zapatilla (en dos tonos, para el pie de delante y el de detrás);
- en `piezas_extra.png`:
  - el otro brazo, enderezado para poder sacarlo del bolsillo;
  - el torso sin las dos manos;
  - la cabeza y las cejas con el pelo dorado;
  - la cabeza con la cara roja.

`piezas.png` no cambia al añadir piezas nuevas, así que 00001 y 00001.2 se siguen viendo idénticas píxel a píxel.

Lo que el avatar no tiene se dibuja en el mismo estilo:
- puños, copa, jarra, globo y máquina de puñetazos;
- el torso musculado bajo la camiseta rota;
- las púas extra del pelo dorado, los ojos azules, el sudor y la vena de enfado;
- los ojos en espiral, el chichón y el pulgar arriba.

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
