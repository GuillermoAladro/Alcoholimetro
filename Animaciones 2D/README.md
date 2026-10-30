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
| 00002.3 | Guillermo se transforma · camiseta completa | 12,45 s | [MP4 60 fps](vista%20previa/00002.3%20Guillermo%20se%20transforma.mp4) · [fotogramas](vista%20previa/00002.3%20Guillermo%20se%20transforma%20-%20fotogramas.png) · [revisión](revision/00002.3.md) |
| 00003 | Guillermo y el globo | 12,45 s | [MP4 60 fps](vista%20previa/00003%20Guillermo%20y%20el%20globo.mp4) · [fotogramas](vista%20previa/00003%20Guillermo%20y%20el%20globo%20-%20fotogramas.png) |
| 00003.2 | Guillermo y el globo · revisada | 12,45 s | [MP4 60 fps](vista%20previa/00003.2%20Guillermo%20y%20el%20globo.mp4) · [fotogramas](vista%20previa/00003.2%20Guillermo%20y%20el%20globo%20-%20fotogramas.png) · [revisión](revision/00003.2.md) |
| 00004 | Guillermo contra la máquina | 13,25 s | [MP4 60 fps](vista%20previa/00004%20Guillermo%20contra%20la%20maquina.mp4) · [fotogramas](vista%20previa/00004%20Guillermo%20contra%20la%20maquina%20-%20fotogramas.png) |
| 00004.2 | Guillermo contra la máquina · revisada | 13,25 s | [MP4 60 fps](vista%20previa/00004.2%20Guillermo%20contra%20la%20maquina.mp4) · [fotogramas](vista%20previa/00004.2%20Guillermo%20contra%20la%20maquina%20-%20fotogramas.png) · [revisión](revision/00004.2.md) |
| 00005 | Guillermo y el chupito de fuego | 13,45 s | [MP4 60 fps](vista%20previa/00005%20Guillermo%20y%20el%20chupito%20de%20fuego.mp4) · [fotogramas](vista%20previa/00005%20Guillermo%20y%20el%20chupito%20de%20fuego%20-%20fotogramas.png) |
| 00005.2 | Guillermo y el chupito de fuego · revisada | 13,45 s | [MP4 60 fps](vista%20previa/00005.2%20Guillermo%20y%20el%20chupito%20de%20fuego.mp4) · [fotogramas](vista%20previa/00005.2%20Guillermo%20y%20el%20chupito%20de%20fuego%20-%20fotogramas.png) · [revisión](revision/00005.2.md) |
| 00006 | Guillermo y el hipo | 13,15 s | [MP4 60 fps](vista%20previa/00006%20Guillermo%20y%20el%20hipo.mp4) · [fotogramas](vista%20previa/00006%20Guillermo%20y%20el%20hipo%20-%20fotogramas.png) |
| 00007 | Guillermo y el champán | 13,00 s | [MP4 60 fps](vista%20previa/00007%20Guillermo%20y%20el%20champan.mp4) · [fotogramas](vista%20previa/00007%20Guillermo%20y%20el%20champan%20-%20fotogramas.png) |
| 00008 | Guillermo y los cacahuetes | 13,45 s | [MP4 60 fps](vista%20previa/00008%20Guillermo%20y%20los%20cacahuetes.mp4) · [fotogramas](vista%20previa/00008%20Guillermo%20y%20los%20cacahuetes%20-%20fotogramas.png) |
| 00009 | Guillermo y la línea recta | 14,00 s | [MP4 60 fps](vista%20previa/00009%20Guillermo%20y%20la%20linea%20recta.mp4) · [fotogramas](vista%20previa/00009%20Guillermo%20y%20la%20linea%20recta%20-%20fotogramas.png) |
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

### 00002.3 · Camiseta que estalla completa

La prenda permanece completa hasta el estallido y sale despedida entera: cuello, mangas y cintura. Torso y brazos quedan al descubierto, con hombros continuos y sin restos de tela pegados. Los fragmentos se extinguen en 1,3 s. Conserva las correcciones de la 00002.2.

[Informe y pruebas](revision/00002.3.md). Selecciona **00002.3** en `ver.html`.

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

### 00004.2 · Revisión de continuidad

Corrige la moneda duplicada y su salida de la mano, las uniones de brazos, el contacto del puñetazo, el encuadre del saco al desplegarse y girar, y la continuidad de la bola y la varilla al romperse. El marcador mantiene 999 mientras Guillermo lo lee. Se conserva la original. [Informe y pruebas](revision/00004.2.md).

### 00005 · Guillermo y el chupito de fuego

1. Negro.
2. Chupitería de ladrillo con un neón en forma de llama, botellero, barra con taburetes y suelo de ajedrez. Guillermo mira el chupito de reojo y lo coge.
3. Saca un mechero del bolsillo: la primera chispa falla y a la segunda prende el chupito (llama azul y naranja).
4. Lo levanta y mira a cámara con chulería.
5. Coge aire y **sopla**… la llama se tumba y le vuelve a la cara: **bola de fuego**, destello y temblor.
6. Se disipa el humo: tiene la cara **tiznada de hollín**, con los ojos muy blancos, y el pelo humeando con ascuas.
7. Parpadea dos veces y tose un **anillo de humo**.
8. Se encoge de hombros, se bebe el chupito de un trago y lo deja en la barra.
9. Pulgar arriba y sonrisa con los dientes blancos y un destello.
10. Negro.

![Fotogramas de 00005](vista%20previa/00005%20Guillermo%20y%20el%20chupito%20de%20fuego%20-%20fotogramas.png)


### 00005.2 · Revisión de continuidad

Corrige el apoyo del chupito en la barra, el contacto con los labios, el volumen al inclinarlo y el borde lateral del encuadre, conservando las chispas, la llamarada, el hollín y el remate de la sonrisa. Se conserva la original. [Informe y pruebas](revision/00005.2.md).


### 00006 · Guillermo y el hipo

1. Negro.
2. Taberna con papel pintado granate, azulejos, diana y una mesa alta con una pinta vacía. Guillermo, satisfecho, con las manos en los bolsillos.
3. **Hipo:** cada hipido le pega un bote, abre mucho los ojos, hincha los mofletes y le sale una pompa que sube y explota. Cada vez son más fuertes y se va mosqueando.
4. Harto, mira a cámara, aprieta los puños y coge muchísimo aire (se le hincha el pecho).
5. **Aguanta la respiración:**
   - con los mofletes hinchados y los ojos apretados;
   - se pone rojo y luego morado, cuello incluido;
   - suda y tiembla cada vez más;
   - se le escapan dos hipidos por dentro y le sale vapor por la oreja.
6. **Hipido gigante:** sale volando con los brazos al aire, suelta una pompa enorme y aterriza aplastado. La pinta da un saltito en la mesa.
7. Alivio: mira cómo se va la pompa, se da dos palmaditas en el pecho y vuelve a meterse las manos en los bolsillos.
8. Un último hipido pequeñito… y mira a cámara resignado.
9. Negro.

![Fotogramas de 00006](vista%20previa/00006%20Guillermo%20y%20el%20hipo%20-%20fotogramas.png)

### 00007 · Guillermo y el champán

1. Negro.
2. Fiesta: banderines, guirnalda de bombillas, globos y una torre de copas. Guillermo mira a cámara, levanta la botella y guiña un ojo.
3. **La agita con todas sus fuerzas:** le tiembla todo el cuerpo y la espuma sube dentro de la botella.
4. Apunta a un lado y empuja el corcho con el pulgar, dos veces:
   - aguanta la respiración y aprieta los dientes;
   - se pone rojo y suda;
   - la botella se abomba y el corcho tiembla, pero no sale.
5. Extrañado, mira por el cuello de la botella con un ojo cerrado… la vuelve a apuntar y mira a cámara muy chulo.
6. Un toquecito y **¡pum!:** el corcho sale disparado, estalla el confeti y un chorro enorme de espuma lo propulsa como un cohete hasta sacarlo de la escena por arriba, con las piernas colgando y agitando la mano como en un rodeo.
7. Cae la espuma. Al rato el corcho vuelve a caer en plano, bota tres veces y se queda balanceándose en el suelo.
8. Negro.

![Fotogramas de 00007](vista%20previa/00007%20Guillermo%20y%20el%20champan%20-%20fotogramas.png)

### 00008 · Guillermo y los cacahuetes

1. Negro.
2. Taberna granate con estantería de botellas, lámpara verde, un neón con forma de cacahuete y una mesa alta con un cuenco de cacahuetes y una caña. Guillermo mira el cuenco con antojo y coge uno.
3. **Primer intento:** lo lanza y lo sigue con los ojos y la boca abierta… le rebota en la nariz. Se queda bizco, con la nariz roja, parpadea dos veces y sacude la cabeza.
4. Mira a cámara con chulería.
5. **Segundo intento:** un tiro muy alto. Recula con la boca abierta, pero el cacahuete le pasa por detrás y cae al suelo. Lo busca a un lado y a otro, lo encuentra y se mosquea.
6. **Tercer intento:** apunta con un ojo cerrado y la lengua fuera y lo lanza tan alto que sale de la escena. Espera echado hacia atrás como en el limbo, con una mirada impaciente a cámara…
7. …y le cae justo en la boca. Mastica con el carrillo hinchado, pega un salto con los brazos arriba y guiña un ojo a cámara con el pulgar arriba.
8. Negro.

![Fotogramas de 00008](vista%20previa/00008%20Guillermo%20y%20los%20cacahuetes%20-%20fotogramas.png)

### 00009 · Guillermo y la línea recta

1. Negro.
2. De noche, en la calle, delante del bar: fachada de ladrillo, escaparate con botellas, neón de una jarra y una farola con polillas. Hay una línea blanca pintada en el suelo.
3. Guillermo entra andando por la izquierda y mira la línea.
4. Se prepara: sacude las manos, coge aire con los mofletes hinchados y echa el vaho.
5. **La prueba de la línea:** con los brazos en cruz y la puntita de la lengua fuera, da seis pasos punta-talón. Se tambalea cada vez más y una vez se queda con el pie en el aire.
6. **A la pata coja:** casi se cae de espaldas, mueve los brazos como un molino, suda… y se recupera resoplando.
7. **El dedo a la nariz:** con los ojos cerrados acerca el dedo índice… y se lo mete en el ojo. Ojo rojo, lagrimita y se lo frota.
8. Hace una reverencia muy orgulloso y mira a cámara satisfecho.
9. Da un paso, **resbala en la línea**, sale volando con las piernas por delante, cae de culo y sale deslizándose por la derecha.
10. Se oye el golpe fuera de plano (estrellitas y polvo) y una de sus zapatillas vuelve rebotando y se queda en la línea.
11. Negro.

![Fotogramas de 00009](vista%20previa/00009%20Guillermo%20y%20la%20linea%20recta%20-%20fotogramas.png)

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
├─ escenas/                     una escena por archivo (00001 … 00010 y sus revisiones)
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

Opciones del montaje que usan las escenas nuevas (las anteriores no las activan y se ven igual):
- `p.tirasLimpias`: cada rodaja de brazo o pierna se recorta en cuña por sus juntas, así las rodillas y los codos muy doblados no dejan dientes de sierra;
- `p.capaCabeza(g, t)` y `p.capaTronco(g, t)`: la escena dibuja encima de la cara o del torso con las coordenadas del retrato o de la hoja (hollín, cara morada, lengua, lágrima…).

## Añadir una animación

1. Crea `escenas/NNNNN Nombre.js`.
   - Dentro, define una clase que extienda `Escena2D(duración)` con un método `pintar(g, t)`.
   - Al final, llama a `registrar({ id, nombre, crear })`.
   - La base ya pinta el negro del principio y del final.
2. Añade su `<script>` en `ver.html`.
3. Si sale un personaje nuevo, crea su carpeta en `personajes/` con su propio `preparar_piezas.py`.
4. Pasa `comprobar.py` y graba la vista previa con `grabar.py`.
