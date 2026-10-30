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
| 00006.2 | Guillermo y el hipo · revisada | 13,15 s | [MP4 60 fps](vista%20previa/00006.2%20Guillermo%20y%20el%20hipo.mp4) · [fotogramas](vista%20previa/00006.2%20Guillermo%20y%20el%20hipo%20-%20fotogramas.png) · [revisión](revision/00006.2.md) |
| 00007 | Guillermo y el champán | 13,00 s | [MP4 60 fps](vista%20previa/00007%20Guillermo%20y%20el%20champan.mp4) · [fotogramas](vista%20previa/00007%20Guillermo%20y%20el%20champan%20-%20fotogramas.png) |
| 00007.2 | Guillermo y el champán · revisada | 13 s | [MP4 60 fps](vista%20previa/00007.2%20Guillermo%20y%20el%20champan.mp4) · [fotogramas](vista%20previa/00007.2%20Guillermo%20y%20el%20champan%20-%20fotogramas.png) · [revisión](revision/00007.2.md) |
| 00008 | Guillermo y los cacahuetes | 13,45 s | [MP4 60 fps](vista%20previa/00008%20Guillermo%20y%20los%20cacahuetes.mp4) · [fotogramas](vista%20previa/00008%20Guillermo%20y%20los%20cacahuetes%20-%20fotogramas.png) |
| 00008.2 | Guillermo y los cacahuetes · revisada | 13,45 s | [MP4 60 fps](vista%20previa/00008.2%20Guillermo%20y%20los%20cacahuetes.mp4) · [fotogramas](vista%20previa/00008.2%20Guillermo%20y%20los%20cacahuetes%20-%20fotogramas.png) · [revisión](revision/00008.2.md) |
| 00009 | Guillermo y la línea recta | 14,00 s | [MP4 60 fps](vista%20previa/00009%20Guillermo%20y%20la%20linea%20recta.mp4) · [fotogramas](vista%20previa/00009%20Guillermo%20y%20la%20linea%20recta%20-%20fotogramas.png) |
| 00009.2 | Guillermo y la línea recta · revisada | 14 s | [MP4 60 fps](vista%20previa/00009.2%20Guillermo%20y%20la%20linea%20recta.mp4) · [fotogramas](vista%20previa/00009.2%20Guillermo%20y%20la%20linea%20recta%20-%20fotogramas.png) · [revisión](revision/00009.2.md) |
| 00010 | Guillermo en la discoteca | 13,60 s | [MP4 60 fps](vista%20previa/00010%20Guillermo%20en%20la%20discoteca.mp4) · [fotogramas](vista%20previa/00010%20Guillermo%20en%20la%20discoteca%20-%20fotogramas.png) |
| 00010.2 | Guillermo en la discoteca · revisada | 13,6 s | [MP4 60 fps](vista%20previa/00010.2%20Guillermo%20en%20la%20discoteca.mp4) · [fotogramas](vista%20previa/00010.2%20Guillermo%20en%20la%20discoteca%20-%20fotogramas.png) · [revisión](revision/00010.2.md) |
| 00011 | Guillermo y Laura · El pulso | 13,75 s | [MP4 60 fps](vista%20previa/00011%20Guillermo%20y%20Laura%20-%20el%20pulso.mp4) · [fotogramas](vista%20previa/00011%20Guillermo%20y%20Laura%20-%20el%20pulso%20-%20fotogramas.png) |
| 00011.2 | Guillermo y Laura · El pulso · revisada | 13,75 s | [MP4 60 fps](vista%20previa/00011.2%20Guillermo%20y%20Laura%20-%20el%20pulso.mp4) · [fotogramas](vista%20previa/00011.2%20Guillermo%20y%20Laura%20-%20el%20pulso%20-%20fotogramas.png) · [revisión](revision/00011.2.md) |
| 00012 | Guillermo y Laura · El alcoholímetro | 14,00 s | [MP4 60 fps](vista%20previa/00012%20Guillermo%20y%20Laura%20-%20el%20alcoholimetro.mp4) · [fotogramas](vista%20previa/00012%20Guillermo%20y%20Laura%20-%20el%20alcoholimetro%20-%20fotogramas.png) |
| 00012.2 | Guillermo y Laura · El alcoholímetro · revisada | 14 s | [MP4 60 fps](vista%20previa/00012.2%20Guillermo%20y%20Laura%20-%20el%20alcoholimetro.mp4) · [fotogramas](vista%20previa/00012.2%20Guillermo%20y%20Laura%20-%20el%20alcoholimetro%20-%20fotogramas.png) · [revisión](revision/00012.2.md) |
| 00013 | Guillermo y Laura · La pajita | 13,40 s | [MP4 60 fps](vista%20previa/00013%20Guillermo%20y%20Laura%20-%20la%20pajita.mp4) · [fotogramas](vista%20previa/00013%20Guillermo%20y%20Laura%20-%20la%20pajita%20-%20fotogramas.png) |
| 00013.2 | Guillermo y Laura · La pajita · revisada | 13,4 s | [MP4 60 fps](vista%20previa/00013.2%20Guillermo%20y%20Laura%20-%20la%20pajita.mp4) · [fotogramas](vista%20previa/00013.2%20Guillermo%20y%20Laura%20-%20la%20pajita%20-%20fotogramas.png) · [revisión](revision/00013.2.md) |
| 00014 | Guillermo y Laura · El baile lento | 14,20 s | [MP4 60 fps](vista%20previa/00014%20Guillermo%20y%20Laura%20-%20el%20baile%20lento.mp4) · [fotogramas](vista%20previa/00014%20Guillermo%20y%20Laura%20-%20el%20baile%20lento%20-%20fotogramas.png) |
| 00014.2 | Guillermo y Laura · El baile lento · revisada | 14,2 s | [MP4 60 fps](vista%20previa/00014.2%20Guillermo%20y%20Laura%20-%20el%20baile%20lento.mp4) · [fotogramas](vista%20previa/00014.2%20Guillermo%20y%20Laura%20-%20el%20baile%20lento%20-%20fotogramas.png) · [revisión](revision/00014.2.md) |
| 00015 | Guillermo y Laura · La tarta | 14,25 s | [MP4 60 fps](vista%20previa/00015%20Guillermo%20y%20Laura%20-%20la%20tarta.mp4) · [fotogramas](vista%20previa/00015%20Guillermo%20y%20Laura%20-%20la%20tarta%20-%20fotogramas.png) |
| 00015.2 | Guillermo y Laura · La tarta · revisada | 14,25 s | [MP4 60 fps](vista%20previa/00015.2%20Guillermo%20y%20Laura%20-%20la%20tarta.mp4) · [fotogramas](vista%20previa/00015.2%20Guillermo%20y%20Laura%20-%20la%20tarta%20-%20fotogramas.png) · [revisión](revision/00015.2.md) |
| 00016 | Guillermo y Laura · El truco de magia | 14,60 s | [MP4 60 fps](vista%20previa/00016%20Guillermo%20y%20Laura%20-%20el%20truco%20de%20magia.mp4) · [fotogramas](vista%20previa/00016%20Guillermo%20y%20Laura%20-%20el%20truco%20de%20magia%20-%20fotogramas.png) |
| 00016.2 | Guillermo y Laura · El truco de magia · revisada | 14,6 s | [MP4 60 fps](vista%20previa/00016.2%20Guillermo%20y%20Laura%20-%20el%20truco%20de%20magia.mp4) · [fotogramas](vista%20previa/00016.2%20Guillermo%20y%20Laura%20-%20el%20truco%20de%20magia%20-%20fotogramas.png) · [revisión](revision/00016.2.md) |
| 00017 | Guillermo y Laura · Los dardos | 14,45 s | [MP4 60 fps](vista%20previa/00017%20Guillermo%20y%20Laura%20-%20los%20dardos.mp4) · [fotogramas](vista%20previa/00017%20Guillermo%20y%20Laura%20-%20los%20dardos%20-%20fotogramas.png) |
| 00017.2 | Guillermo y Laura · Los dardos · revisada | 14,45 s | [MP4 60 fps](vista%20previa/00017.2%20Guillermo%20y%20Laura%20-%20los%20dardos.mp4) · [fotogramas](vista%20previa/00017.2%20Guillermo%20y%20Laura%20-%20los%20dardos%20-%20fotogramas.png) · [revisión](revision/00017.2.md) |
| 00018 | Guillermo y Laura · El selfie | 13,30 s | [MP4 60 fps](vista%20previa/00018%20Guillermo%20y%20Laura%20-%20el%20selfie.mp4) · [fotogramas](vista%20previa/00018%20Guillermo%20y%20Laura%20-%20el%20selfie%20-%20fotogramas.png) |
| 00018.2 | Guillermo y Laura · El selfie · revisada | 13,3 s | [MP4 60 fps](vista%20previa/00018.2%20Guillermo%20y%20Laura%20-%20el%20selfie.mp4) · [fotogramas](vista%20previa/00018.2%20Guillermo%20y%20Laura%20-%20el%20selfie%20-%20fotogramas.png) · [revisión](revision/00018.2.md) |
| 00019 | Guillermo y Laura · El paraguas | 13,60 s | [MP4 60 fps](vista%20previa/00019%20Guillermo%20y%20Laura%20-%20el%20paraguas.mp4) · [fotogramas](vista%20previa/00019%20Guillermo%20y%20Laura%20-%20el%20paraguas%20-%20fotogramas.png) |
| 00019.2 | Guillermo y Laura · El paraguas · revisada | 13,6 s | [MP4 60 fps](vista%20previa/00019.2%20Guillermo%20y%20Laura%20-%20el%20paraguas.mp4) · [fotogramas](vista%20previa/00019.2%20Guillermo%20y%20Laura%20-%20el%20paraguas%20-%20fotogramas.png) · [revisión](revision/00019.2.md) |
| 00020 | Guillermo y Laura · Piedra, papel o tijera | 14,95 s | [MP4 60 fps](vista%20previa/00020%20Guillermo%20y%20Laura%20-%20piedra%20papel%20o%20tijera.mp4) · [fotogramas](vista%20previa/00020%20Guillermo%20y%20Laura%20-%20piedra%20papel%20o%20tijera%20-%20fotogramas.png) |
| 00021 | Guillermo y Marcos · El chupito en llamas | 14,10 s | [MP4 60 fps](vista%20previa/00021%20Guillermo%20y%20Marcos%20-%20el%20chupito%20en%20llamas.mp4) · [fotogramas](vista%20previa/00021%20Guillermo%20y%20Marcos%20-%20el%20chupito%20en%20llamas%20-%20fotogramas.png) |
| 00022 | Guillermo y Marcos · El gato en la farola | 14,50 s | [MP4 60 fps](vista%20previa/00022%20Guillermo%20y%20Marcos%20-%20el%20gato%20en%20la%20farola.mp4) · [fotogramas](vista%20previa/00022%20Guillermo%20y%20Marcos%20-%20el%20gato%20en%20la%20farola%20-%20fotogramas.png) |
| 00023 | Guillermo y Marcos · La barra de bomberos | 14,45 s | [MP4 60 fps](vista%20previa/00023%20Guillermo%20y%20Marcos%20-%20la%20barra%20de%20bomberos.mp4) · [fotogramas](vista%20previa/00023%20Guillermo%20y%20Marcos%20-%20la%20barra%20de%20bomberos%20-%20fotogramas.png) |
| 00024 | Guillermo y Marcos · La manguera loca | 13,90 s | [MP4 60 fps](vista%20previa/00024%20Guillermo%20y%20Marcos%20-%20la%20manguera%20loca.mp4) · [fotogramas](vista%20previa/00024%20Guillermo%20y%20Marcos%20-%20la%20manguera%20loca%20-%20fotogramas.png) |
| 00025 | Guillermo y Marcos · Las pesas | 14,70 s | [MP4 60 fps](vista%20previa/00025%20Guillermo%20y%20Marcos%20-%20las%20pesas.mp4) · [fotogramas](vista%20previa/00025%20Guillermo%20y%20Marcos%20-%20las%20pesas%20-%20fotogramas.png) |
| 00026 | Guillermo y Marcos · El extintor | 13,20 s | [MP4 60 fps](vista%20previa/00026%20Guillermo%20y%20Marcos%20-%20el%20extintor.mp4) · [fotogramas](vista%20previa/00026%20Guillermo%20y%20Marcos%20-%20el%20extintor%20-%20fotogramas.png) |
| 00027 | Guillermo y Marcos · El casco | 13,50 s | [MP4 60 fps](vista%20previa/00027%20Guillermo%20y%20Marcos%20-%20el%20casco.mp4) · [fotogramas](vista%20previa/00027%20Guillermo%20y%20Marcos%20-%20el%20casco%20-%20fotogramas.png) |
| 00028 | Guillermo y Marcos · Vestirse en tres segundos | 14,20 s | [MP4 60 fps](vista%20previa/00028%20Guillermo%20y%20Marcos%20-%20vestirse%20en%20tres%20segundos.mp4) · [fotogramas](vista%20previa/00028%20Guillermo%20y%20Marcos%20-%20vestirse%20en%20tres%20segundos%20-%20fotogramas.png) |
| 00029 | Guillermo y Marcos · La sirena | 13,50 s | [MP4 60 fps](vista%20previa/00029%20Guillermo%20y%20Marcos%20-%20la%20sirena.mp4) · [fotogramas](vista%20previa/00029%20Guillermo%20y%20Marcos%20-%20la%20sirena%20-%20fotogramas.png) |
| 00030 | Guillermo y Marcos · La lona de salto | 14,40 s | [MP4 60 fps](vista%20previa/00030%20Guillermo%20y%20Marcos%20-%20la%20lona%20de%20salto.mp4) · [fotogramas](vista%20previa/00030%20Guillermo%20y%20Marcos%20-%20la%20lona%20de%20salto%20-%20fotogramas.png) |
| 00031 | Guillermo y Ander · El futbolín | 13,50 s | [MP4 60 fps](vista%20previa/00031%20Guillermo%20y%20Ander%20-%20el%20futbolin.mp4) · [fotogramas](vista%20previa/00031%20Guillermo%20y%20Ander%20-%20el%20futbolin%20-%20fotogramas.png) |
| 00032 | Guillermo y Ander · La guindilla | 14,60 s | [MP4 60 fps](vista%20previa/00032%20Guillermo%20y%20Ander%20-%20la%20guindilla.mp4) · [fotogramas](vista%20previa/00032%20Guillermo%20y%20Ander%20-%20la%20guindilla%20-%20fotogramas.png) |
| 00033 | Guillermo y Ander · El duelo de miradas | 13,95 s | [MP4 60 fps](vista%20previa/00033%20Guillermo%20y%20Ander%20-%20el%20duelo%20de%20miradas.mp4) · [fotogramas](vista%20previa/00033%20Guillermo%20y%20Ander%20-%20el%20duelo%20de%20miradas%20-%20fotogramas.png) |
| 00034 | Guillermo y Ander · El bigote | 14,10 s | [MP4 60 fps](vista%20previa/00034%20Guillermo%20y%20Ander%20-%20el%20bigote.mp4) · [fotogramas](vista%20previa/00034%20Guillermo%20y%20Ander%20-%20el%20bigote%20-%20fotogramas.png) |
| 00035 | Guillermo y Ander · El billar | 14,30 s | [MP4 60 fps](vista%20previa/00035%20Guillermo%20y%20Ander%20-%20el%20billar.mp4) · [fotogramas](vista%20previa/00035%20Guillermo%20y%20Ander%20-%20el%20billar%20-%20fotogramas.png) |
| 00036 | Guillermo y Ander · La máquina del gancho | 15,00 s | [MP4 60 fps](vista%20previa/00036%20Guillermo%20y%20Ander%20-%20la%20maquina%20del%20gancho.mp4) · [fotogramas](vista%20previa/00036%20Guillermo%20y%20Ander%20-%20la%20maquina%20del%20gancho%20-%20fotogramas.png) |
| 00037 | Guillermo y Ander · El abrazo de oso | 13,80 s | [MP4 60 fps](vista%20previa/00037%20Guillermo%20y%20Ander%20-%20el%20abrazo%20de%20oso.mp4) · [fotogramas](vista%20previa/00037%20Guillermo%20y%20Ander%20-%20el%20abrazo%20de%20oso%20-%20fotogramas.png) |
| 00038 | Guillermo y Ander · El beer pong | 14,20 s | [MP4 60 fps](vista%20previa/00038%20Guillermo%20y%20Ander%20-%20el%20beer%20pong.mp4) · [fotogramas](vista%20previa/00038%20Guillermo%20y%20Ander%20-%20el%20beer%20pong%20-%20fotogramas.png) |
| 00040 | Guillermo y Ander · La guitarra | 13,60 s | [MP4 60 fps](vista%20previa/00040%20Guillermo%20y%20Ander%20-%20la%20guitarra.mp4) · [fotogramas](vista%20previa/00040%20Guillermo%20y%20Ander%20-%20la%20guitarra%20-%20fotogramas.png) |
| 00041 | Guillermo y Carla · La pasarela | 14,00 s | [MP4 60 fps](vista%20previa/00041%20Guillermo%20y%20Carla%20-%20la%20pasarela.mp4) · [fotogramas](vista%20previa/00041%20Guillermo%20y%20Carla%20-%20la%20pasarela%20-%20fotogramas.png) |

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


### 00006.2 · Revisión de continuidad

Corrige la muñeca durante la inhalación, las uniones de los hombros, el cálculo temporal de las pompas y el contacto del vaso con la mesa al rebotar. Conserva los hipidos, el cambio de color y el salto gigante. Se conserva la original. [Informe y pruebas](revision/00006.2.md).


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


### 00007.2 · Revisión de continuidad

Corrige la separación del brazo durante el retroceso y el apoyo del corcho al caer. Conserva los intentos de abrir la botella, el chorro, el vuelo y el acercamiento final. Se conserva la original. [Informe y pruebas](revision/00007.2.md).


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


### 00008.2 · Revisión de continuidad

Corrige los brazos al lanzar y celebrar, el apoyo de los cacahuetes y sus sombras, y el encuadre del salto. Conserva los tres intentos, el golpe en la nariz, la captura en la boca y el guiño final. Se conserva la original. [Informe y pruebas](revision/00008.2.md).


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


### 00009.2 · Revisión de continuidad

Corrige la continuidad del brazo al retirar la mano de la cara y ajusta el contacto del índice con el ojo. Conserva el recorrido talón con punta, la prueba de equilibrio, la reverencia, el resbalón y la zapatilla que regresa. Se conserva la original. [Informe y pruebas](revision/00009.2.md).


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


### 00010.2 · Revisión de continuidad

Corrige la continuidad de los brazos y coloca el giro de manos delante del pecho. Conserva la bola de espejos, los pulsos visuales a 120 por minuto, el paso con el dedo levantado, el guiño y la salida en moonwalk. Se conserva la original. [Informe y pruebas](revision/00010.2.md).


### 00011 · Guillermo y Laura · El pulso

1. Negro.
2. En una mesa alta de un bar azul noche, con un neón de un bíceps y estantería de trofeos, Guillermo saca bíceps y mira a cámara chulito. Laura, al otro lado, levanta una ceja.
3. Él planta el codo y la invita con los dedos; ella se encoge de hombros y le agarra la mano.
4. Cuenta atrás con los dedos: 3, 2, 1… ¡ya!
5. **Guillermo aprieta con todo:** se pone rojo, suda, le sale la vena, tiembla entero y se agarra al borde de la mesa.
6. **Laura, como si nada:** coge su vaso y sorbe por la pajita, lo deja, se mira las uñas y bosteza… y las manos ni se mueven.
7. Le mira con lástima, sonríe y, con un giro de muñeca, **le estampa la mano contra la mesa**.
8. Guillermo sale disparado hacia arriba hasta salir de plano… y cae del techo de espaldas, con las piernas en alto, estrellitas y los ojos en espiral.
9. Laura se sopla las yemas de los dedos, sorbe de su vaso mirando a cámara y guiña un ojo; él levanta una mano temblorosa: se rinde.
10. Negro.

![Fotogramas de 00011](vista%20previa/00011%20Guillermo%20y%20Laura%20-%20el%20pulso%20-%20fotogramas.png)


### 00011.2 · Revisión de continuidad

Corrige los cuatro brazos, el apoyo de los codos en la mesa, el giro y la liberación del agarre compartido, el alcance de la copa y el contacto con el suelo tras la caída. Añade el guiño final de Laura anunciado en el guion. Se conserva la original. [Informe y pruebas](revision/00011.2.md).


### 00012 · Guillermo y Laura · El alcoholímetro

1. Negro.
2. Rincón del bar: entre Guillermo y Laura, cara a cara, hay un alcoholímetro de monedas con su esfera de aguja, la pantalla de números y la boquilla con cable en espiral. A Guillermo le asoman las llaves del coche del bolsillo.
3. Laura se acerca, le enseña una moneda con un guiño y la mete: la máquina se enciende y se prueba.
4. Coge la boquilla y sopla tranquila con los ojos cerrados: la aguja ni se mueve, **0.00**, luz verde y lucecitas de alegría.
5. Deja la boquilla, da un paso atrás y le cede el turno con la mano abierta.
6. Guillermo se acerca muy chulo, lanza su moneda con el pulgar directa a la ranura, coge aire hasta hincharse y **sopla con todas sus fuerzas**, rojo y sudando:
   - la aguja se clava al final y los números se disparan;
   - sale la sirena roja girando;
   - la máquina tiembla, parpadea y echa humo.
7. Suelta la boquilla (vuelve sola a su sitio con el cable) y levanta el pulgar a cámara, orgulloso.
8. Laura arquea una ceja con la mano en la cadera. Él saca las llaves del coche y las hace tintinear… y ella se las quita de la mano.
9. Laura las hace girar en el dedo, guiña a cámara y se va. Guillermo se queda haciendo pucheros y da una patadita al suelo.
10. Negro.

![Fotogramas de 00012](vista%20previa/00012%20Guillermo%20y%20Laura%20-%20el%20alcoholimetro%20-%20fotogramas.png)


### 00012.2 · Revisión de continuidad

Corrige la continuidad de los brazos, la trayectoria de la boquilla, el lanzamiento de la moneda y el traspaso de las llaves. Mantiene la lectura cero de Laura y la sobrecarga de Guillermo. Se conserva la original. [Informe y pruebas](revision/00012.2.md).


### 00013 · Guillermo y Laura · La pajita

1. Negro.
2. Bar tiki al atardecer: tejadillo de paja, farolillos, antorchas y el sol sobre el mar. Guillermo y Laura, cada uno a un lado de una mesita alta con un cóctel gigante en pecera, con sombrilla, rodaja de naranja, guinda y dos pajitas.
3. Se miran con ojitos: ella le hace caídas de pestañas, a él se le suben los colores y salen corazones.
4. Se acercan a la vez a las pajitas con los ojos cerrados y sorben despacito.
5. Guillermo abre un ojo, la mira de reojo… y **sorbe con todas sus fuerzas**: el cóctel baja de golpe en remolino, la sombrilla gira y a él se le hinchan los mofletes.
6. A Laura solo le llega el **borboteo del fondo**: burbujas, hielos que tintinean. Abre los ojos, mira la pecera vacía y luego a él, muy seria.
7. Él traga con los carrillos llenos, le sube un eructo, se tapa la boca… y se le escapa: a Laura se le vuela la melena.
8. Él se rasca la nuca con cara de culpa.
9. Laura coge la **guinda** por el rabito y se la enseña balanceándola; Guillermo estira la mano para pedírsela… y ella se la come con mucha chulería.
10. Guillermo hace pucheros y mira a cámara; Laura tira el rabito a la pecera y guiña un ojo.
11. Negro.

![Fotogramas de 00013](vista%20previa/00013%20Guillermo%20y%20Laura%20-%20la%20pajita%20-%20fotogramas.png)


### 00013.2 · Revisión de continuidad

Corrige el alcance de los brazos al pedir, coger y soltar la guinda; fija los pies al inclinarse y mantiene el rabito dentro del fondo de la copa. Se conserva la original. [Informe y pruebas](revision/00013.2.md).


### 00014 · Guillermo y Laura · El baile lento

1. Negro.
2. Salón de baile de noche: ventanal con luna, cortinas de terciopelo granate y un foco cálido sobre la pareja.
3. Bailan agarrados y se balancean: él con la mano en la cintura de ella, la otra en el corazón y una rosa roja entre los dientes; ella con la mano en su hombro. Suben corazones.
4. **Primer pisotón:** él le pisa el pie sin enterarse (estrellitas); ella hace una mueca de dolor y sigue con una sonrisa forzada.
5. **Segundo pisotón,** más fuerte: un corazón se parte en dos.
6. Laura mira a cámara harta, levanta el dedo («no, no») y **toma el mando**: la luz se vuelve roja de tango.
7. Lo lleva como a un muñeco:
   - lo empuja hacia atrás;
   - lo lanza a la distancia de los brazos, con la otra mano en la cadera;
   - lo recoge.
8. **Paso de tango** al revés: Laura, en zancada, lo sujeta por la cintura con un brazo y levanta el otro; él queda inclinado hacia atrás en diagonal, desmayado con la mano en la frente. Se le cae la rosa al suelo.
9. Se pone colorado, se le ponen los ojos de corazón y estallan los corazones.
10. Ella guiña un ojo a cámara.
11. Negro.

![Fotogramas de 00014](vista%20previa/00014%20Guillermo%20y%20Laura%20-%20el%20baile%20lento%20-%20fotogramas.png)


### 00014.2 · Revisión de continuidad

Coordina los agarres del tango y el apoyo de Laura con las posturas de ambos. Corrige las muñecas, la retirada del pie tras los pisotones y el contacto de la rosa con el suelo. Se conserva la original. [Informe y pruebas](revision/00014.2.md).


### 00015 · Guillermo y Laura · La tarta

1. Negro.
2. Fiesta de cumpleaños con la luz apagada. Guillermo, con gorro de fiesta, espera con las manos en los bolsillos.
3. Laura entra por la derecha con una tarta con las velas encendidas: su luz cálida los ilumina a los dos. Guillermo se frota las manos y ella deja la tarta en la mesa alta.
4. **Primer soplido:** se apagan las velas, sale humo y la sala se queda a oscuras. Guillermo mira a cámara muy chulo…
5. …y las velas se vuelven a encender solas con chispitas (son trucadas). Laura se tapa la boca para no reírse.
6. **Segundo soplido**, más fuerte, con los brazos hacia atrás, rojo y sudando: se apagan… y se vuelven a encender. Guillermo se enfada.
7. Coge muchísimo aire de puntillas, se inclina demasiado, mueve los brazos como aspas y **planta la cara en la tarta**: la nata salpica la mesa y el suelo, y en la tarta queda la huella de su cara.
8. Saca la cara cubierta de nata, con los brazos colgando y una vela clavada en la nariz que se vuelve a encender. Parpadea entre la nata.
9. Laura se parte de risa. Luego se acerca, le quita un poco de nata de la mejilla con el dedo y la prueba. Él se relame.
10. Guillermo sopla hacia arriba la vela de la nariz: se apaga… y se vuelve a encender. Se rinde y Laura guiña un ojo a cámara.
11. Negro.

![Fotogramas de 00015](vista%20previa/00015%20Guillermo%20y%20Laura%20-%20la%20tarta%20-%20fotogramas.png)


### 00015.2 · Revisión de continuidad

Corrige las muñecas y los recorridos de los brazos, el apoyo de los pies al ponerse de puntillas, el agarre del plato y el encuadre del gorro. Añade el guiño final de Laura. Se conserva la original. [Informe y pruebas](revision/00015.2.md).


### 00016 · Guillermo y Laura · El truco de magia

1. Negro.
2. Rincón de magia de un bar: papel pintado verde con estrellitas doradas, carteles de una chistera con conejo y de un abanico de cartas, y una mesita con chistera y varita. Guillermo, muy chulo, hace de mago para Laura.
3. Mueve los dedos, saca una moneda de la nada, la tapa con la otra mano, sacude los puños… y al abrirlos ha desaparecido entre una nubecilla de magia. Laura levanta el pulgar y él le guiña un ojo a cámara.
4. Se acerca y le hurga junto a la oreja para sacársela de ahí… pero abre la mano y no hay nada. Mira a cámara muerto de vergüenza mientras Laura se tapa la boca para no reírse.
5. Se mira la manga: asoma la punta de un pañuelo. Tira… y sale otro, y otro: una **ristra infinita de pañuelos de colores** anudados que se amontona a sus pies. Cada tirón es más rápido y él se pone rojo; Laura ya no puede más y se parte de risa.
6. Por fin sale la cola, un pañuelo de lunares; la sostiene en alto, mira el montón y se rinde.
7. Laura se le acerca de puntillas y le saca la moneda de detrás de la oreja… y, ¡pop!, **una paloma blanca le sale del pelo** y se va volando.
8. Guillermo se queda boquiabierto mirando a cámara; Laura lanza la moneda al aire con el pulgar, la caza y guiña un ojo.
9. Negro.

![Fotogramas de 00016](vista%20previa/00016%20Guillermo%20y%20Laura%20-%20el%20truco%20de%20magia%20-%20fotogramas.png)


### 00016.2 · Revisión de continuidad

Corrige la continuidad de brazos y hombros, las puntillas de Laura, los agarres de los pañuelos y el lanzamiento de la moneda. La aparición de la paloma ya funciona al buscar directamente cualquier instante. Se conserva la original. [Informe y pruebas](revision/00016.2.md).


### 00017 · Guillermo y Laura · Los dardos

1. Negro.
2. Rincón de dardos de un pub inglés: pared verde botella con zócalo de caoba, la diana en su armario con una pizarra de rayitas y una lámpara de latón colgando del techo. Laura, en la línea de tiro, con tres dardos; Guillermo detrás, con las manos en los bolsillos y cara de chulo.
3. **Laura lanza tres dardos: diana, diana y diana.** La diana tiembla a cada golpe y el último lo tira mirando a cámara. Guillermo pasa de la chulería a quedarse con la boca abierta.
4. Laura sacude la melena, se pone en jarras y le invita a tirar.
5. **Guillermo se hace el sobrado:**
   - sacude las manos;
   - se chupa el dedo y lo levanta para ver el viento;
   - mide con el pulgar guiñando un ojo;
   - saca un dardo del bolsillo y le echa el aliento;
   - apunta con la lengua fuera, a la pata coja, y hace tres amagos.
6. Laura, que espera dando golpecitos con el pie, se da cuenta de que está en medio y se agacha tapándose la cabeza.
7. Él lanza con todas sus fuerzas: el dardo pasa por encima de Laura, **da en la lámpara**, rebota y vuelve dando vueltas a **clavársele en el pelo**, temblando.
8. Guillermo mira arriba sin moverse; Laura se asoma, lo ve y se tapa la boca muerta de risa.
9. Él sonríe a cámara avergonzado y levanta el pulgar.
10. Negro.

![Fotogramas de 00017](vista%20previa/00017%20Guillermo%20y%20Laura%20-%20los%20dardos%20-%20fotogramas.png)


### 00017.2 · Revisión de continuidad

Corrige los brazos de Laura al protegerse, el apoyo de los pies, la recogida de los dardos y el contacto del índice con la boca. El rebote del dardo mantiene su orientación continua. Se conserva la original. [Informe y pruebas](revision/00017.2.md).


### 00018 · Guillermo y Laura · El selfie

1. Negro.
2. Azotea de un bar a la hora azul: ciudad con las ventanas encendidas, guirnalda de bombillas, barandilla de cristal y una mesita con una vela. Laura saca el móvil del bolsillo, mira a Guillermo y él se arrima.
3. Ella levanta el móvil para hacerse un selfie y sonríen los dos.
4. **Flash 1:** Guillermo parpadea justo en el fogonazo. La foto sale en una esquina, con él con los ojos cerrados. Laura le mira de reojo y él se rasca la cabeza.
5. **Flash 2:** a Guillermo le pica la nariz… y estornuda en pleno flash. La foto sale movida y salpicada; a Laura se le vuela la melena y se limpia la mejilla con asco, y él se frota la nariz.
6. **Flash 3:** Laura pone morritos y Guillermo, a escondidas, le hace orejas de conejo detrás de la cabeza. La foto le pilla.
7. Laura mira el móvil, abre mucho los ojos y se gira hacia él. Guillermo esconde la mano y silba disimulando. Ella niega con la cabeza y sonríe.
8. **Foto final:** él guiña un ojo y ella sonríe con los ojos cerrados, los dos con la uve bajo la barbilla. Con el flash la imagen se congela y se convierte en una foto con marco blanco, un poco torcida.
9. Negro.

![Fotogramas de 00018](vista%20previa/00018%20Guillermo%20y%20Laura%20-%20el%20selfie%20-%20fotogramas.png)


### 00018.2 · Revisión de continuidad

Corrige el brazo del gesto de las orejas de conejo, los apoyos y los hombros de Guillermo. Amplía el encuadre de las miniaturas y ajusta el seguimiento del móvil. Se conserva la original. [Informe y pruebas](revision/00018.2.md).


### 00019 · Guillermo y Laura · El paraguas

1. Negro.
2. Noche de lluvia a la salida del bar: portal con luz cálida, toldo que gotea, acera mojada con charcos, farola y luna. Laura se tapa la cabeza con la mano; Guillermo lleva un paraguas grande cerrado como si fuera un bastón.
3. Guillermo mira a cámara muy galán, lanza el paraguas al aire dando vueltas y lo coge por el mango.
4. Lo abre de golpe y **la cubre**: ella baja la mano, sonríe encantada y le sale un corazón; él saca pecho mirando a cámara.
5. Se levanta viento: la lluvia se inclina, vuelan hojas, a Laura se le alborota la melena y el paraguas cabecea. Guillermo mira arriba preocupado.
6. **Una racha le da la vuelta al paraguas**: tirón, se queda de puntillas y sale volando agarrado a él, pataleando, como Mary Poppins.
7. Desde arriba mira a Laura con cara de apuro, le dice adiós con la mano y desaparece por arriba. Ella se tapa la boca.
8. Laura, otra vez bajo la lluvia, se encoge de hombros, saca un paraguas plegable de lunares y lo abre.
9. Dice adiós al cielo: Guillermo, chiquitito, cruza por delante de la luna colgado del paraguas.
10. Laura guiña un ojo a cámara.
11. Negro.

![Fotogramas de 00019](vista%20previa/00019%20Guillermo%20y%20Laura%20-%20el%20paraguas%20-%20fotogramas.png)


### 00019.2 · Revisión de continuidad

Corrige los brazos, los apoyos y los contactos con los paraguas. Mantiene completos en el encuadre el molinete, la inversión con el viento y el cruce delante de la luna. Se conserva la original. [Informe y pruebas](revision/00019.2.md).


### 00020 · Guillermo y Laura · Piedra, papel o tijera

1. Negro.
2. Taberna verde esmeralda: barra de caoba con barandilla de latón, espejo con botellas, caja registradora y farolillos verdes. Entre Guillermo y Laura, la cuenta en una bandejita.
3. Miran la cuenta, se miran… y Guillermo la reta con el puño: ¿quién paga? Laura levanta una ceja y acepta.
4. **Primera ronda:** los puños botan tres veces y la cámara se acerca a las manos. Él saca tijera, ella piedra… y le aplasta los dedos. Él sacude la mano y se la sopla; ella se sopla los nudillos.
5. **Segunda ronda:** él saca papel, muy chulo; ella tijera: «tris, tras», le corta las puntas. Él se mira la mano y se cuenta los dedos.
6. **Tercera ronda:** rojo, sudando y con la vena, él saca piedra; ella papel y le envuelve el puño con la palma.
7. Guillermo cae de rodillas y se saca los bolsillos del revés: vacíos. Sale volando una polilla y él la sigue con la mirada.
8. Laura se parte de risa, saca su tarjeta, la lanza con un giro de muñeca y aterriza justo en la bandeja.
9. Va hasta él y le da unas palmaditas en la cabeza; él la mira desde abajo con ojitos y se sonroja. Ella guiña un ojo a cámara.
10. Negro.

![Fotogramas de 00020](vista%20previa/00020%20Guillermo%20y%20Laura%20-%20piedra%20papel%20o%20tijera%20-%20fotogramas.png)

### 00021 · Guillermo y Marcos · El chupito en llamas

1. Negro.
2. Saloon del oeste: puertas batientes, espejo con botellas, quinqués y un cactus. Guillermo y Marcos, cada uno en una punta de la barra; encima, cinco chupitos en fila, una servilleta y un cóctel con sombrillita. Marcos, con la lanza de la manguera colgando de la mano, se toma tranquilamente un vaso de leche.
3. Guillermo, muy chulo, saca el mechero, prende el primer chupito y el segundo, y guiña a cámara…
4. …y la llama salta sola de chupito en chupito hasta el último, a la servilleta y a la sombrilla: **fuego en la barra** y humo.
5. Guillermo, en pánico, se lleva las manos a la cara, sopla y abanica: las llamas crecen todavía más.
6. Marcos, sin inmutarse, se acaba la leche de un trago (le queda bigote blanco), deja el vaso en la barra y levanta la lanza.
7. **Apaga el fuego con un chorro preciso**, llama a llama y de derecha a izquierda, con una nubecita de vapor en cada una…
8. …y sigue hasta Guillermo, que acaba **empapado**: el pelo aplastado, chorreando y con un charco a sus pies.
9. Marcos sopla la boca de la lanza como un pistolero y levanta el pulgar guiñando un ojo; a Guillermo le sale agua por la oreja y escupe un chorrito.
10. Negro.

![Fotogramas de 00021](vista%20previa/00021%20Guillermo%20y%20Marcos%20-%20el%20chupito%20en%20llamas%20-%20fotogramas.png)

### 00022 · Guillermo y Marcos · El gato en la farola

1. Negro.
2. De noche, en una plazuela delante del bar (toldo de rayas, ventana encendida, tejados con chimeneas y luna llena): un gato naranja, erizado de miedo, maúlla subido en lo alto de una farola.
3. Guillermo llega andando, lo oye, se pone en jarras de héroe mirando a cámara y se lanza a la farola.
4. **Trepa** abrazado a ella a tirones, con la lengua fuera y sudando.
5. Arriba le pone morritos al gato y le llama con el dedo… el gato le **bufa** y salta por encima de su cabeza hasta el farol, que se balancea.
6. Guillermo mira abajo, ve la altura y se queda **agarrado a la farola**, temblando, con los ojos apretados y castañeteando los dientes; de vez en cuando abre un ojo.
7. Llega **Marcos** con una escalera al hombro. Guillermo, esperanzado, le saluda pidiendo ayuda, pero Marcos apoya la escalera en el farol y sube tranquilo, peldaño a peldaño.
8. El gato le salta a los brazos; Marcos lo achucha y el gato se le sube al casco, ronroneando. Guillermo pone cara de celos.
9. Marcos baja deslizándose por la escalera, se da la vuelta, recoge la escalera y se va con el gato moviendo la cola desde el casco. Guillermo estira la mano hacia la escalera que se aleja.
10. Guillermo **resbala poco a poco** por la farola, entre chirridos, y acaba hecho un ovillo al pie, mirando a cámara con pucheros.
11. Negro.

![Fotogramas de 00022](vista%20previa/00022%20Guillermo%20y%20Marcos%20-%20el%20gato%20en%20la%20farola%20-%20fotogramas.png)

### 00023 · Guillermo y Marcos · La barra de bomberos

1. Negro.
2. Parque de bomberos: pared de ladrillo rojo, taquillas, campana de latón y una barra que sube hasta el agujero del techo. Guillermo, con las manos en los bolsillos, mira arriba.
3. **Marcos baja deslizándose por la barra** con una sola mano y una pierna enroscada, frena y aterriza con una flexión perfecta. Da dos pasos atrás y posa con los puños en la cintura y un guiño.
4. Guillermo, boquiabierto, mira a cámara decidido, se sacude las manos y va a la barra.
5. **Trepa mano sobre mano**, rojo y sudando; la cámara sube con él hasta que se mete por el agujero del techo.
6. Abajo, cae polvo del agujero, la barra tiembla y Marcos levanta una ceja a cámara.
7. **Guillermo baja girando alrededor de la barra como una broca**, demasiado rápido y con las piernas al aire… y se estampa de culo: polvo, estrellitas y ojos en espiral.
8. Del agujero cae un casco que se le encaja hasta los ojos; Marcos se tapa la boca para no reírse y Guillermo tantea a ciegas.
9. Marcos se acerca, le levanta el casco con un dedo y guiña a cámara; Guillermo sonríe avergonzado y saluda.
10. Negro.

![Fotogramas de 00023](vista%20previa/00023%20Guillermo%20y%20Marcos%20-%20la%20barra%20de%20bomberos%20-%20fotogramas.png)

### 00024 · Guillermo y Marcos · La manguera loca

1. Negro.
2. Patio de maniobras del parque de bomberos a pleno sol: fachada de ladrillo con portones rojos y escudo de llama, torre de prácticas, conos y una columna roja con la rueda de la válvula. Marcos sujeta la lanza; Guillermo le suplica con las palmas juntas dando saltitos.
3. Marcos levanta una ceja, suspira y se la da. Guillermo la coge con las dos manos, recula y apunta mirando a cámara muy chulo.
4. Marcos, sin mirar, abre la válvula: un **bulto de agua** recorre la manguera hasta la lanza… y ¡chorro!
5. El retroceso empuja a Guillermo y **la manguera se vuelve loca**: lo zarandea arriba y abajo mientras Marcos salta la manguera como a la comba.
6. La manguera le barre los pies, cae sentado encima y el chorro lo **arrastra de culo** por el patio hasta llevarse los conos por delante.
7. La manguera se encabrita y lo levanta por los aires: **la monta como un toro mecánico** y, a la tercera sacudida, agita la mano encantado.
8. Marcos, aburrido, mira a cámara y cierra la válvula: la manguera se desinfla y Guillermo cae de culo en el charco.
9. Mareado, se asoma a la boca de la lanza… y le cae el último chorrito en la cara. Marcos se encoge de hombros a cámara.
10. Negro.

![Fotogramas de 00024](vista%20previa/00024%20Guillermo%20y%20Marcos%20-%20la%20manguera%20loca%20-%20fotogramas.png)

### 00025 · Guillermo y Marcos · Las pesas

1. Negro.
2. Gimnasio del parque de bomberos: pared de bloques con una franja roja y cinta de peligro, ventanas con rayos de luz, reloj, escudo con una llama, mancuernas y pesas rusas. Guillermo, en la jaula de sentadillas, mira a cámara muy chulo y se frota las manos (sale una nubecita de magnesio). Marcos, al fondo, bebe de su botella.
3. **Guillermo tira de la barra con todo:** se pone rojo, suda, le sale la vena… la barra se dobla por el medio, pero los discos ni se mueven de los ganchos.
4. La suelta (la barra vibra y saltan chispas de los ganchos) y retrocede jadeando con las manos en las rodillas.
5. Marcos se acerca, le coge por la cinturilla del vaquero con una mano y **lo levanta del suelo**.
6. **Hace curl de bíceps con Guillermo** como si fuera una mancuerna, mientras bebe tan tranquilo. Guillermo, subiendo y bajando, se cruza de brazos muy digno… y acaba mareado, con los ojos en espiral y estrellitas.
7. Marcos lo deja en el suelo y lo suelta. Guillermo se tambalea, sacude la cabeza, se enfada y se da la vuelta de un salto.
8. Agachado como en un peso muerto, agarra a Marcos por el chaquetón y tira… Marcos ni se inmuta: bebe, le mira aburrido y mira a cámara.
9. Le apoya la mano en la cabeza, se deja caer encima con desgana y **Guillermo se queda aplastado como una tortita**, con estrellitas.
10. Marcos guiña un ojo a cámara.
11. Negro.

![Fotogramas de 00025](vista%20previa/00025%20Guillermo%20y%20Marcos%20-%20las%20pesas%20-%20fotogramas.png)

### 00026 · Guillermo y Marcos · El extintor

1. Negro.
2. Cafetería-pastelería de paredes coral, con tartas bajo campana, lámpara verde y un extintor colgado en la pared. Entre Guillermo y Marcos, una mesita con una magdalena de cumpleaños y una bengala encendida.
3. Marcos se la ofrece con la mano abierta; Guillermo se emociona y se lleva la mano al pecho.
4. La bengala chisporrotea fuerte y a Guillermo le entra el pánico: se lleva las manos a la cara, mira el extintor, lo descuelga, tira de la anilla, saca la boquilla y apunta. Marcos levanta la mano: «¡quieto!».
5. **¡Fuuush!** El chorro de polvo lo llena todo hasta dejar la pantalla en blanco.
6. Al posarse el polvo, los dos se han quedado **blancos como estatuas de yeso**: solo se les mueven los ojos, que parpadean, se miran y miran la bengala… que sigue chisporroteando.
7. Marcos se inclina despacio y la apaga con un soplidito de polvo.
8. A Guillermo le pica la nariz: «aah… aah…» **¡achís!** El estornudo le sacude todo el polvo y vuelve a tener color.
9. Marcos, todavía de yeso, mira a cámara con cara de póquer; Guillermo sonríe culpable.
10. Negro.

![Fotogramas de 00026](vista%20previa/00026%20Guillermo%20y%20Marcos%20-%20el%20extintor%20-%20fotogramas.png)

### 00027 · Guillermo y Marcos · El casco

1. Negro.
2. Vestuario del parque de bomberos: taquillas rojas, azulejos con la franja roja, un perchero con una chaqueta de intervención y un casco de repuesto colgado, un banco y el reloj.
3. Guillermo mira el casco de Marcos embobado, lo señala y le pide uno dando saltitos y poniendo ojitos. Marcos arquea una ceja.
4. Marcos descuelga el casco de repuesto y se lo lanza. Guillermo lo caza al vuelo… y pesa tanto que se le doblan las rodillas.
5. Lo admira, mira a cámara muy chulo y se lo echa a la cabeza: **el casco se lo traga hasta la barbilla**.
6. A ciegas, lo zarandea, se da la vuelta y anda a tientas con los brazos por delante hasta **darse de morros con las taquillas**: clonc, abolladura y estrellitas. Marcos se tapa la boca aguantando la risa.
7. Guillermo se tambalea, se gira y llega dando traspiés hasta Marcos, que agarra el casco por arriba y tira: plop.
8. Guillermo sale con el **pelo aplastado de casco**, con el surco del borde y un pelillo rebelde. Marcos suelta el casco, que cae al suelo. Guillermo se toca el pelo preocupado…
9. …y, ¡boing!, las púas vuelven a saltar de golpe.
10. Marcos se parte de risa señalándole; Guillermo se mete las manos en los bolsillos y guiña un ojo a cámara.
11. Negro.

![Fotogramas de 00027](vista%20previa/00027%20Guillermo%20y%20Marcos%20-%20el%20casco%20-%20fotogramas.png)

### 00028 · Guillermo y Marcos · Vestirse en tres segundos

1. Negro.
2. Vestuario del parque de bomberos: taquillas rojas, un cronómetro gigante en la pared, el timbre de alarma y una percha con un equipo de repuesto (dos botas y un pantalón de intervención con tirantes). Marcos se toma un café junto a Guillermo.
3. **Suena la alarma:** los dos dan un respingo, el café salpica y el cronómetro arranca.
4. Marcos mira a cámara y se convierte en un **torbellino**: sale equipado con la botella de aire a la espalda, las correas, la máscara y el hacha al hombro, en pose de héroe. El cronómetro apenas se ha movido.
5. Mira el reloj, orgulloso, y le cede el turno a Guillermo con la mano.
6. Guillermo, picado, se frota las manos y va a la percha: **mete la mano en una bota** y se le queda puesta. La mira, la sacude… nada.
7. Engancha el pantalón con la bota y **salta a la pata coja** intentando meter el pie, cada vez más rojo; Marcos se tapa la boca para no reírse.
8. Tira con tanta fuerza que el pantalón sale volando y **le cae en la cabeza**, con las perneras tiesas como orejas.
9. A ciegas, **los tirantes se le enrollan** y le atan los brazos: se cae de culo y la otra bota se suelta de la percha y le da en la cabeza.
10. Marcos mira el cronómetro, mira a Guillermo y niega con la cabeza; Guillermo, sonrojado, menea la bota de la mano con una sonrisa de circunstancias.
11. Negro.

![Fotogramas de 00028](vista%20previa/00028%20Guillermo%20y%20Marcos%20-%20vestirse%20en%20tres%20segundos%20-%20fotogramas.png)

### 00029 · Guillermo y Marcos · La sirena

1. Negro.
2. Cochera del parque de bomberos al atardecer: azulejos verdes, ventanales con el cielo naranja, cascos colgados y el frontal de un camión de bomberos con una bocina de sirena cromada, un botón rojo y los rotativos en el techo. Guillermo, con las manos en los bolsillos, mira embobado la bocina.
3. Señala el botón y mira a Marcos; Marcos le invita con la mano abierta.
4. Mientras Guillermo se acerca frotándose las manos, Marcos se pone tranquilamente un tapón en el oído.
5. Guillermo pulsa el botón: los rotativos empiezan a girar y la bocina tiembla… y él se asoma a mirar dentro.
6. **¡La sirena le revienta en la cara!** El pelo se le va de golpe hacia atrás, los mofletes le flamean como en un túnel de viento, le saltan las lágrimas y el chorro de sonido lo arrastra de espaldas por el suelo.
7. Pelea contra el viento, rojo y dando pasitos en el sitio… y lo vuelve a empujar. Marcos, aburrido, se mira las uñas y mira a cámara.
8. Marcos se acerca y apaga la sirena: silencio. Guillermo se queda congelado, inclinado, con el pelo tieso hacia atrás y los oídos pitando.
9. Se tambalea. Marcos se quita el tapón y le pregunta si está bien; Guillermo se pone la mano en la oreja: «¿qué?».
10. Marcos, mirando a cámara, le ofrece el tapón.
11. Negro.

![Fotogramas de 00029](vista%20previa/00029%20Guillermo%20y%20Marcos%20-%20la%20sirena%20-%20fotogramas.png)

### 00030 · Guillermo y Marcos · La lona de salto

1. Negro.
2. Calle soleada delante del bar: fachada ocre con contraventanas verdes, escaparate con toldo de rayas y edificios de colores al fondo. Guillermo, asomado a la ventana del primer piso, saluda; abajo, Marcos sujeta una lona de salto redonda y le llama con la mano.
3. Guillermo mira abajo, se asusta y niega con la cabeza; Marcos sacude la lona para enseñarle lo blandita que está.
4. Se sube al alféizar, se agacha temblando y sudando, se tapa la nariz como si se tirara a una piscina… y **salta**.
5. Cae en la lona, que se hunde… y **lo lanza muchísimo más alto**: sale por arriba de la escena. Marcos lo sigue con la mirada, se hace visera con la mano y levanta una ceja a cámara.
6. Vuelve a caer y **rebota todavía más alto**; esta vez lo disfruta, con los brazos en alto. Marcos se encoge de hombros.
7. El tercer bote lo lanza de lado: Marcos suelta la lona, corre debajo y **lo coge en brazos como a una princesa**.
8. Guillermo, en brazos, se pone colorado y le salen corazones; Marcos guiña un ojo a cámara.
9. Negro.

![Fotogramas de 00030](vista%20previa/00030%20Guillermo%20y%20Marcos%20-%20la%20lona%20de%20salto%20-%20fotogramas.png)

### 00031 · Guillermo y Ander · El futbolín

1. Negro.
2. Sala de juegos retro: pared con rayas setenteras, banderines de colores, un póster con un balón, una bufanda colgada y una lámpara alargada de billar sobre el futbolín. Guillermo (rojos) y Ander (azules), cada uno a un lado. Guillermo, agachado en sus barras, mira a cámara muy chulo; Ander levanta una ceja y da un sorbo a su vaso.
3. **Primer saque:** Guillermo hace girar sus barras como un loco (los muñequitos dan vueltas y la mesa tiembla). Ander, con un golpecito de muñeca, pisa la bola con su delantero, carga… y **¡gol!** Guillermo se queda pasmado y Ander corre una bolita del marcador con un dedo.
4. **Segundo saque:** Guillermo, rojo y sudando, gira todavía más rápido mientras Ander bebe tan tranquilo y mira a cámara… **otro gol.** Segunda bolita.
5. Furioso y con la vena hinchada, Guillermo coge aire y gira con todo el cuerpo: los mangos echan humo… y uno de sus muñecos le da a la bola tan fuerte que sale disparada por los aires.
6. Los dos la siguen con la mirada… y cae, **¡plof!**, justo en la jarra de cerveza de Guillermo, que le salpica toda la cara.
7. Guillermo se queda helado, chorreando espuma. Ander, sin inmutarse, corre la tercera bolita con un dedo.
8. Guillermo se limpia los ojos y hace pucheros a cámara; Ander da un sorbo y mira a cámara con media sonrisa.
9. Negro.

![Fotogramas de 00031](vista%20previa/00031%20Guillermo%20y%20Ander%20-%20el%20futbolin%20-%20fotogramas.png)

### 00032 · Guillermo y Ander · La guindilla

1. Negro.
2. Cantina mexicana al atardecer: pared de barro con papel picado, ventana con contraventanas azules y un cactus al sol, ristras de guindillas, un sombrero colgado y zócalo de talavera. Entre Guillermo y Ander, una mesa alta con un plato de dos guindillas rojas, una jarra de agua y un vaso de leche.
3. Ander levanta una ceja: reto aceptado. Coge su guindilla, le da dos mordiscos, mastica tan tranquilo mirando a cámara, deja el rabito en el plato y se encoge de hombros.
4. Guillermo, muy chulo, coge la suya, la enseña a cámara con un guiño y **se la mete entera**. Mastica sobrado con la mano en la cadera… y se hace el silencio.
5. Le tiembla un ojo y **se pone rojo desde el cuello hasta la frente**, como el mercurio de un termómetro: se agarra el cuello, suda, le silba vapor por la oreja y le humea el pelo.
6. **Echa una llamarada por la boca**; Ander se echa hacia atrás.
7. Agarra la jarra de agua y se la bebe entera a tragos, con los carrillos hinchados y lagrimones. La deja de golpe y jadea con la lengua fuera.
8. Ander, sin inmutarse, le desliza el vaso de leche por la mesa. Guillermo se la bebe de un trago: el rojo baja, le queda bigote blanco y suspira una nubecilla de humo.
9. Ander se saca otra guindilla del bolsillo y le da un mordisco crujiente, como quien se come una zanahoria; a Guillermo le vuelve a temblar el ojo.
10. Negro.

![Fotogramas de 00032](vista%20previa/00032%20Guillermo%20y%20Ander%20-%20la%20guindilla%20-%20fotogramas.png)

### 00033 · Guillermo y Ander · El duelo de miradas

1. Negro.
2. Cantina al atardecer: pared de adobe, herradura y lazo colgados, y un ventanal en arco con el sol poniéndose sobre el desierto. Guillermo, en una mesa alta, entorna los ojos y señala a Ander retándole; Ander, con un palillo en la boca, se encoge de hombros.
3. Los dos apoyan los puños en la mesa y se inclinan cara a cara: **empieza el duelo de miradas**. Bandas negras de cine, un rayo entre los ojos y primeros planos de las miradas de uno y otro, mientras una bola de paja cruza el desierto por la ventana.
4. A Guillermo se le secan los ojos: se le ponen rojos, le salen venitas, le tiemblan los párpados, suda y se le saltan las lágrimas. Ander, impasible, mueve el palillo.
5. Una mosca revolotea y **se le posa a Guillermo en la nariz**: se pone bizco mirándola, hincha los mofletes, tiembla… y **parpadea**.
6. La mosca se va volando a la nariz de Ander, que ni se inmuta y **levanta una ceja muy despacio**.
7. Guillermo, horrorizado, mira a cámara y **se da un cabezazo contra la mesa**: estrellitas. Desde ahí levanta una mano sin fuerzas para rendirse.
8. Ander por fin parpadea, satisfecho, mira a cámara y guiña un ojo.
9. Negro.

![Fotogramas de 00033](vista%20previa/00033%20Guillermo%20y%20Ander%20-%20el%20duelo%20de%20miradas%20-%20fotogramas.png)

### 00034 · Guillermo y Ander · El bigote

1. Negro.
2. Bar de madrugada: Ander duerme en un taburete con la cabeza sobre el brazo estirado en la mesa, y una pompa crece y se deshincha con cada ronquido.
3. Guillermo entra de puntillas con gafas de sol de espía y un rotulador negro en alto, aguantándose la risa.
4. Se planta junto a la mesa, quita el capuchón con los dientes y empieza a dibujarle a Ander un **bigote retorcido**, trazo a trazo.
5. Ander se remueve, la pompa revienta y Guillermo se queda helado con el rotulador en el aire; Ander vuelve a roncar.
6. Guillermo acaba el bigote con un lunar, se aparta muerto de risa, tapa el rotulador y se lo guarda.
7. Se da media vuelta y se sube las gafas muy orgulloso: **tiene un monóculo y una ceja única pintados** (Ander se le había adelantado).
8. Ander levanta la cabeza, abre un ojo, sonríe y le enseña su propio rotulador.
9. Guillermo se ve en el espejo de la pared y se queda de piedra; mira a Ander, que cierra el ojo y vuelve a «roncar».
10. Negro.

![Fotogramas de 00034](vista%20previa/00034%20Guillermo%20y%20Ander%20-%20el%20bigote%20-%20fotogramas.png)

### 00035 · Guillermo y Ander · El billar

1. Negro.
2. Billar antiguo: pared granate, lámpara verde sobre la mesa. Ander da tiza a su taco y sopla el polvillo; Guillermo espera apoyado en el suyo, escéptico.
3. Ander se inclina, hace dos tiros de ensayo y tira: la blanca hace una **curva imposible** alrededor de la roja, toca la amarilla, que entra en la tronera del fondo, y se para delante de Guillermo, que mira a cámara boquiabierto.
4. Ander le cede el turno con la palma abierta. Guillermo da tiza a lo bestia (nube azul y tos), se coloca meneando la cadera, apunta con la lengua fuera y un ojo cerrado, ensaya mil veces y guiña a cámara.
5. Echa el taco muy atrás y le da demasiado fuerte: la blanca salta, ¡clonc! contra la lámpara (se balancea y se abolla), ¡pum! contra el techo (grieta y polvillo)… y **le cae en la coronilla**. Rebota y entra limpiamente en la tronera del centro.
6. Chichón, estrellitas y ojos en espiral; Guillermo se soba la cabeza.
7. Ander rodea la mesa con el taco de bastón, le da dos palmaditas en el hombro y guiña a cámara; Guillermo sonríe avergonzado.
8. Negro.

![Fotogramas de 00035](vista%20previa/00035%20Guillermo%20y%20Ander%20-%20el%20billar%20-%20fotogramas.png)

### 00036 · Guillermo y Ander · La máquina del gancho

1. Negro.
2. Recreativos de noche: neones, máquinas al fondo y, en el centro, una máquina del gancho turquesa y rosa llena de peluches redondos. Guillermo está en la consola y Ander, a la derecha, con las manos en los bolsillos.
3. Guillermo besa una moneda, la mete y maneja la palanca con la lengua fuera. Aporrea el botón y el gancho coge un gatito rosa… que **se escurre** justo encima de la rampa, rebota en el borde y vuelve al montón. Guillermo se lleva las manos a la cabeza.
4. Segunda moneda, rojo de rabia: el pollito se le escapa nada más subir. Zarandea la palanca y Ander se tapa la boca para no reírse.
5. Tercera moneda, con un solo dedo: el gancho se cierra en el aire y abre y cierra las pinzas como burlándose. Guillermo apoya la frente en el cristal.
6. Ander, sin mirar, lanza una moneda con el pulgar por encima de Guillermo directa a la ranura y da un golpe de cadera a la máquina. El gancho baja y saca **un gatito gigante**.
7. El gigante entra a presión por la rampa y sale disparado por la trampilla. Ander lo caza con una mano y se lo lanza a Guillermo, que lo abraza haciendo pucheros.
8. Negro.

![Fotogramas de 00036](vista%20previa/00036%20Guillermo%20y%20Ander%20-%20la%20maquina%20del%20gancho%20-%20fotogramas.png)

### 00037 · Guillermo y Ander · El abrazo de oso

1. Negro.
2. Sidrería de piedra con dos barricas gigantes, vigas de madera, faroles de hierro y un estante de botellas de sidra. Guillermo espera aburrido dando golpecitos con el pie.
3. Ander entra por la puerta con las manos en los bolsillos. Se ven, se reconocen y se señalan con el dedo: ¡chispa!
4. Abren los brazos de par en par y corren el uno hacia el otro.
5. **Abrazo de oso:** Ander se agacha, lo rodea por la cintura y **lo levanta del suelo**.
6. Lo mece feliz, con los ojos cerrados y corazoncitos, mientras Guillermo, con **los ojos fuera de las órbitas**, los mofletes hinchados y cada vez más rojo, patalea en el aire. A cada apretón le crujen las costillas: rayitas y estrellas en la espalda. Guillermo mira a cámara desesperado.
7. Ander lo deja en el suelo y se aparta tan contento. Guillermo se queda **estrujado**, estrecho y estirado como un tubo de pasta de dientes, con los brazos pegados al cuerpo y parpadeando; Ander lo mira extrañado.
8. **¡Boing!** Recupera la forma de golpe con un rebote, se tambalea con estrellitas y levanta el pulgar, tembloroso, con una sonrisa forzada. Ander se parte de risa.
9. Ander vuelve a abrir los brazos para otro abrazo… y Guillermo se echa atrás con las palmas en alto, aterrado.
10. Negro.

![Fotogramas de 00037](vista%20previa/00037%20Guillermo%20y%20Ander%20-%20el%20abrazo%20de%20oso%20-%20fotogramas.png)

### 00038 · Guillermo y Ander · El beer pong

1. Negro.
2. Sótano de fiesta: pared índigo con franjas de colores pintadas, guirnalda de bombillas, un neón con un vaso y una bola, un cuadro con un trofeo y una lámpara colgada sobre la mesa de beer pong, con un triángulo de vasos rojos en cada punta y una botella en medio. Guillermo y Ander, cada uno en un extremo.
3. **Ander, sin despeinarse:** con un golpecito de muñeca mete la bola en un vaso de Guillermo (¡plop!), saca otra del bolsillo y la vuelve a meter sin mirar, mirando a cámara. Guillermo se queda pasmado y se le hincha la vena.
4. Ander le cede el turno con la mano abierta y se pone a hacer malabares con otra bola, aburrido.
5. **Guillermo se prepara a lo grande:** pesca la bola del vaso, la sacude, le sopla, mira a cámara muy chulo, apunta guiñando un ojo con la lengua fuera, hace dos amagos, se agacha… y lanza con todas sus fuerzas.
6. La bola da en la lámpara (que se balancea), en la botella (que se cae y derrama la cerveza), en la cabeza de Ander (que ni se inmuta y sigue con sus malabares) y en el cuadro de la pared, que se queda torcido.
7. Guillermo, desesperado, abre los brazos y grita al cielo… y **la bola le cae justo en la boca**.
8. Se queda congelado con la bola en la boca. Ander se guarda su bola y **aplaude muy despacio**.
9. Guillermo hincha los carrillos y **escupe la bola**, que cruza la mesa y cae en un vaso de Ander: ¡plop!
10. Guillermo lo celebra con los puños en alto y guiña un ojo a cámara; Ander se queda con las manos a medio aplauso y levanta una ceja.
11. Negro.

![Fotogramas de 00038](vista%20previa/00038%20Guillermo%20y%20Ander%20-%20el%20beer%20pong%20-%20fotogramas.png)

### 00040 · Guillermo y Ander · La guitarra

1. Negro.
2. Rincón acogedor del bar con guirnalda de bombillas, un vinilo y un cuadro de una guitarra. Ander, sentado en un taburete, toca la guitarra tranquilo; salen notas redondas y suaves.
3. Guillermo coge aire y se pone a **cantar fatal**: le salen notas con pinchos; Ander guiña un ojo y tuerce la boca.
4. Las copas de la balda empiezan a agrietarse y un perro asoma por la ventana y se pone a aullar.
5. Ander, harto, toca más rápido y más fuerte para taparlo; Guillermo da un paso y canta todavía más alto. El perro se tapa las orejas y se esconde.
6. Los dos a tope: Guillermo grita y se agrieta la última copa.
7. **Una cuerda se rompe**, sale disparada y le da a Guillermo en la nariz.
8. Silencio. Guillermo, aturdido y con la nariz roja, se la frota mientras el perro vuelve a asomarse.
9. Ander se calma, toca un último acorde suave y le guiña un ojo; Guillermo hace pucheros.
10. Negro.

![Fotogramas de 00040](vista%20previa/00040%20Guillermo%20y%20Ander%20-%20la%20guitarra%20-%20fotogramas.png)

### 00041 · Guillermo y Carla · La pasarela

1. Negro.
2. Bar convertido en pasarela: pared morada, cortina de espumillón, marco de bombillas, espejo dorado y una franja de luz en el suelo con siluetas de público y sus cámaras. En medio, un charco y una señal amarilla de suelo mojado. Guillermo espera a la izquierda.
3. Carla entra desfilando desde la derecha como una modelo: cadera de lado a lado, melena botando y flashes de los fotógrafos. Guillermo se queda con la boca abierta y le salen corazones.
4. Carla se planta con un taconazo, manos en las caderas, mira a cámara y da una vuelta sobre sí misma.
5. Pose final: una mano en el pelo y un guiño a cámara. Guillermo se abanica la cara con la mano.
6. Carla mira a Guillermo y, con la palma hacia arriba, le cede la pasarela. Él sonríe a cámara con chulería y se sacude como un atleta.
7. Guillermo desfila exagerando las caderas, con morritos de pato y una mano en la cadera. Carla se tapa la boca para no reírse.
8. **Pisa el charco:** resbala, abre las piernas en un espagat completo (un flash lo pilla en pleno vuelo) y la señal se tambalea.
9. Sale deslizándose por el suelo mojado haciendo «¡tachán!» con los brazos y se para justo con el talón en la bota de Carla.
10. Recostado sobre una mano, la pose: guiño, morritos y pistola con los dedos apuntando a Carla.
11. Carla se ríe a carcajadas, hace un marco de foto con las manos y **¡clic!**: flash y esquinas de visor alrededor de Guillermo.
12. Guillermo sonríe forzado y sudando; Carla le guiña un ojo a cámara.
13. Negro.

![Fotogramas de 00041](vista%20previa/00041%20Guillermo%20y%20Carla%20-%20la%20pasarela%20-%20fotogramas.png)

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
├─ personajes/comun/            recortador común, visor de hoja con rejilla y Personaje2D.crear
├─ personajes/laura/            coordenadas de Laura, su atlas y laura.js
├─ personajes/marcos-bombero/   coordenadas de Marcos Bombero, su atlas, la manguera y el chorro
├─ personajes/ander/            coordenadas de Ander y su atlas
├─ personajes/carla/            coordenadas de Carla, su atlas, aros y collar
├─ personajes/dari/             coordenadas de Dari, su atlas y las gafas
├─ personajes/deivi/            coordenadas de Deivi y su atlas
├─ personajes/gabacho/          coordenadas de Gabacho y su atlas
├─ personajes/kiriku/           coordenadas de Kiriku y su atlas
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

### Laura y el montaje común

**Laura** (`personajes/laura/`) sale de `Avatares 2D/Laura/Laura-2D.png` con el recortador común `personajes/comun/preparar.py`; su `preparar_piezas.py` solo trae coordenadas.

- **Piezas:** la cabeza del retrato (cuencas vacías, sin cejas, boca ni aros), la cara roja, las cejas, la boca, la melena que cuelga por detrás (dos tiras que se balancean), el torso con y sin brazos, los dos brazos enderezados, las piernas y la zapatilla con la suela nivelada. Se rellena el pelo que le tapaba un hombro, los bolsillos y los costados.
- **En pantalla** la monta `personajes/comun/personaje.js` (`Personaje2D.crear`), con la misma postura que Guillermo y además:
  - mirar a la izquierda (`p.espejo`, también disponible para Guillermo);
  - manos con dedos (`mano.dedos`, de puño a mano abierta, señalar, uve o pulgar; también para Guillermo);
  - melena con viento e inercia (`p.pelo`) y aros que se mecen.
- **Altura:** con el mismo `p.s` mide un 93 % de Guillermo.
- **Otra persona:** `personajes/comun/ver_hoja.py` pinta su hoja con rejilla y sus coordenadas encima; se copia `laura/preparar_piezas.py`, se ajustan los números y se crea su `<id>.js` con `Personaje2D.crear`.

**Marcos Bombero** (`personajes/marcos-bombero/`) sale de `Avatares 2D/Marcos-Bombero/Marcos-Bombero-2D.png` con el mismo recortador común.

- **Limpieza previa:** antes de trocear, su `preparar_piezas.py` quita la manguera, la lanza y la mano que la agarraba, y repinta el muslo, el puño de la manga y el bajo de la chaqueta que tapaban.
- **Piezas:** la cabeza del retrato con el casco y la cogotera (cuencas vacías y cara roja solo en la piel, no en el casco), cejas, boca, el torso sin brazos con las bandas reflectantes que siguen bajo las mangas, los dos brazos enderezados, las piernas del pantalón de intervención y la bota de perfil con la suela nivelada.
- **En pantalla** lleva siempre los brazos sueltos: la mano cercana cuelga relajada y la lejana va al bolsillo.
- **Accesorios aparte:** la lanza, la manguera, el rollo y el chorro de agua (`MarcosBombero.lanza`, `manguera`, `rollo`, `chorro`), para que cada escena decida si los lleva, los suelta o los usa.
- **Altura:** con el mismo `p.s` mide lo mismo que Guillermo, casco incluido.

**Ander** (`personajes/ander/`) sale de `Avatares 2D/Ander/Ander-2D.png` con el recortador común.

- **Limpieza previa:** antes de trocear, su `preparar_piezas.py` quita de la hoja las manos que asomaban de los bolsillos y repinta el bajo de la sudadera y los bolsillos del vaquero.
- **Piezas:** la cabeza del retrato con el pelo corto y la barba, cejas, boca, el torso con la capucha detrás del cuello, las dos mangas de la sudadera enderezadas, las piernas del vaquero y la zapatilla con la suela nivelada. La mandíbula se busca con una ventana estrecha para que los pelos de la barba no la desvíen.
- **En pantalla:** los hombros son azules y la mano se dibuja aparte al sacarla del bolsillo.
- **Altura:** con el mismo `p.s` mide prácticamente lo mismo que Guillermo.

**Carla** (`personajes/carla/`) sale de `Avatares 2D/Carla/Carla-2D.png` con el recortador común.

- **Limpieza previa:** antes de trocear, su `preparar_piezas.py` quita la melena que le caía por delante del cuerpo y el collar. Repinta lo que tapaban: la piel del pecho y del hombro, los tirantes y el top negro, la cara de dentro de los brazos y los huecos entre brazos y torso.
- **Piezas:** la cabeza del retrato (cuencas vacías y sin aros), la cara roja, las cejas, la boca, la melena ondulada que cuelga por detrás (dos tiras con puntas que se balancean con viento e inercia), el torso con y sin brazos, los dos brazos enderezados, las piernas del vaquero y el botín negro de tacón con la suela nivelada.
- **Accesorios:** los aros y el collar se dibujan aparte y se mecen con la cabeza y el torso.
- **Altura:** con el mismo `p.s` mide un 93 % de Guillermo.

**Dari** (`personajes/dari/`) sale de `Avatares 2D/Dari/Dari-2D.png` con el recortador común.

- **Limpieza previa:** antes de trocear, su `preparar_piezas.py` borra las gafas del retrato (la montura y los brillos se rellenan con la piel y el pelo de alrededor, sin tocar ojos ni cejas). También quita las manos que asomaban de los bolsillos y repinta el bajo de la parka y la cadera del vaquero.
- **Piezas:** la cabeza del retrato con el pelo rizado, el bigote y la perilla (cuencas vacías), la cara roja, las cejas, la boca, el torso con la capucha detrás del cuello, las dos mangas de la parka enderezadas, las piernas del vaquero y la zapatilla con la suela nivelada.
- **Gafas:** se dibujan aparte encima de los ojos, así párpados, iris y cejas se mueven por debajo; cada escena puede moverlas o quitárselas (`p.gafas`).
- **Altura:** con el mismo `p.s` mide como Guillermo (el pelo le saca un poco).

**Deivi** (`personajes/deivi/`) sale de `Avatares 2D/Deivi/Deivi-2D.png` con el recortador común.

- **Piezas:** la cabeza del retrato con el pelo ondulado (cuencas vacías y sin el cuello del retrato), la cara roja, las cejas, la boca, el torso de la camiseta lila hasta la cintura del vaquero, los dos brazos (manga corta y brazo) enderezados, las piernas del vaquero y la zapatilla con la suela nivelada.
- **Limpieza:** las muñecas metidas en los bolsillos se quitan del torso y se repinta lo que tapaban: el costado y el bajo de la camiseta y la cintura del vaquero, con sus costuras.
- **En pantalla:** los hombros son lilas y la mano se dibuja aparte al sacarla del bolsillo.
- **Altura:** con el mismo `p.s` mide prácticamente lo mismo que Guillermo.

**Gabacho** (`personajes/gabacho/`) sale de `Avatares 2D/Gabacho/Gabacho-2D.png` con el recortador común.

- **Piezas:** la cabeza del retrato con el pelo muy rizado (los huecos blancos entre rizos se quitan como fondo, con cuencas vacías y sin el cuello del retrato), la cara roja, las cejas, la boca, el torso de la camiseta de fútbol azul marino hasta la cintura del vaquero, los dos brazos (manga corta con su puño de rayas y brazo) enderezados, las piernas del vaquero y la zapatilla con la suela nivelada.
- **Limpieza:** las muñecas metidas en los bolsillos se quitan del torso y se repinta lo que tapaban: el costado y el bajo de la camiseta y la cintura del vaquero, con sus costuras. Lo estampado en la camiseta es el del avatar, tal cual.
- **En pantalla:** los hombros son azul marino y la mano se dibuja aparte al sacarla del bolsillo.
- **Altura:** con el mismo `p.s` mide lo mismo que Guillermo.

**Kiriku** (`personajes/kiriku/`) sale de `Avatares 2D/Kiriku/Kiriku-2D.png` con el recortador común.

- **Piezas:** la cabeza del retrato con el pelo corto ladeado y la barba de tres días (cuencas vacías y sin el cuello del retrato), la cara roja, las cejas, la boca, el torso del polo negro con el jersey echado sobre los hombros y las gafas de sol colgadas, hasta la cintura del vaquero, los dos brazos (manga corta y brazo) enderezados, las piernas del vaquero y la zapatilla con la suela nivelada.
- **Limpieza:** las muñecas metidas en los bolsillos se quitan del torso y se repinta lo que tapaban: el costado y el bajo del polo y la cintura del vaquero, con sus costuras. Jersey y gafas son los del avatar, tal cual.
- **En pantalla:** los hombros son negros y la mano se dibuja aparte al sacarla del bolsillo.
- **Altura:** con el mismo `p.s` mide lo mismo que Guillermo.

## Añadir una animación

1. Crea `escenas/NNNNN Nombre.js`.
   - Dentro, define una clase que extienda `Escena2D(duración)` con un método `pintar(g, t)`.
   - Al final, llama a `registrar({ id, nombre, crear })`.
   - La base ya pinta el negro del principio y del final.
2. Añade su `<script>` en `ver.html`.
3. Si sale un personaje nuevo, crea su carpeta en `personajes/` con su propio `preparar_piezas.py`.
4. Pasa `comprobar.py` y graba la vista previa con `grabar.py`.
