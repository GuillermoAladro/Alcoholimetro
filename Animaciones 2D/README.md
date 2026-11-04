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
| 00020.2 | Guillermo y Laura · Piedra, papel o tijera · revisada | 14,95 s | [MP4 60 fps](vista%20previa/00020.2%20Guillermo%20y%20Laura%20-%20piedra%20papel%20o%20tijera.mp4) · [fotogramas](vista%20previa/00020.2%20Guillermo%20y%20Laura%20-%20piedra%20papel%20o%20tijera%20-%20fotogramas.png) · [revisión](revision/00020.2.md) |
| 00021 | Guillermo y Marcos · El chupito en llamas | 14,10 s | [MP4 60 fps](vista%20previa/00021%20Guillermo%20y%20Marcos%20-%20el%20chupito%20en%20llamas.mp4) · [fotogramas](vista%20previa/00021%20Guillermo%20y%20Marcos%20-%20el%20chupito%20en%20llamas%20-%20fotogramas.png) |
| 00021.2 | Guillermo y Marcos · El chupito en llamas · revisada | 14,1 s | [MP4 60 fps](vista%20previa/00021.2%20Guillermo%20y%20Marcos%20-%20el%20chupito%20en%20llamas.mp4) · [fotogramas](vista%20previa/00021.2%20Guillermo%20y%20Marcos%20-%20el%20chupito%20en%20llamas%20-%20fotogramas.png) · [revisión](revision/00021.2.md) |
| 00022 | Guillermo y Marcos · El gato en la farola | 14,50 s | [MP4 60 fps](vista%20previa/00022%20Guillermo%20y%20Marcos%20-%20el%20gato%20en%20la%20farola.mp4) · [fotogramas](vista%20previa/00022%20Guillermo%20y%20Marcos%20-%20el%20gato%20en%20la%20farola%20-%20fotogramas.png) |
| 00022.2 | Guillermo y Marcos · El gato en la farola · revisada | 14,5 s | [MP4 60 fps](vista%20previa/00022.2%20Guillermo%20y%20Marcos%20-%20el%20gato%20en%20la%20farola.mp4) · [fotogramas](vista%20previa/00022.2%20Guillermo%20y%20Marcos%20-%20el%20gato%20en%20la%20farola%20-%20fotogramas.png) · [revisión](revision/00022.2.md) |
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
| 00039 | Guillermo y Ander · El gol | 14,00 s | [MP4 60 fps](vista%20previa/00039%20Guillermo%20y%20Ander%20-%20el%20gol.mp4) · [fotogramas](vista%20previa/00039%20Guillermo%20y%20Ander%20-%20el%20gol%20-%20fotogramas.png) |
| 00040 | Guillermo y Ander · La guitarra | 13,60 s | [MP4 60 fps](vista%20previa/00040%20Guillermo%20y%20Ander%20-%20la%20guitarra.mp4) · [fotogramas](vista%20previa/00040%20Guillermo%20y%20Ander%20-%20la%20guitarra%20-%20fotogramas.png) |
| 00041 | Guillermo y Carla · La pasarela | 14,00 s | [MP4 60 fps](vista%20previa/00041%20Guillermo%20y%20Carla%20-%20la%20pasarela.mp4) · [fotogramas](vista%20previa/00041%20Guillermo%20y%20Carla%20-%20la%20pasarela%20-%20fotogramas.png) |
| 00042 | Guillermo y Carla · El ligue | 14,75 s | [MP4 60 fps](vista%20previa/00042%20Guillermo%20y%20Carla%20-%20el%20ligue.mp4) · [fotogramas](vista%20previa/00042%20Guillermo%20y%20Carla%20-%20el%20ligue%20-%20fotogramas.png) |
| 00043 | Guillermo y Carla · El limbo | 14,40 s | [MP4 60 fps](vista%20previa/00043%20Guillermo%20y%20Carla%20-%20el%20limbo.mp4) · [fotogramas](vista%20previa/00043%20Guillermo%20y%20Carla%20-%20el%20limbo%20-%20fotogramas.png) |
| 00044 | Guillermo y Carla · La melena | 13,60 s | [MP4 60 fps](vista%20previa/00044%20Guillermo%20y%20Carla%20-%20la%20melena.mp4) · [fotogramas](vista%20previa/00044%20Guillermo%20y%20Carla%20-%20la%20melena%20-%20fotogramas.png) |
| 00045 | Guillermo y Carla · El retrato | 14,00 s | [MP4 60 fps](vista%20previa/00045%20Guillermo%20y%20Carla%20-%20el%20retrato.mp4) · [fotogramas](vista%20previa/00045%20Guillermo%20y%20Carla%20-%20el%20retrato%20-%20fotogramas.png) |
| 00046 | Guillermo y Carla · La araña | 13,90 s | [MP4 60 fps](vista%20previa/00046%20Guillermo%20y%20Carla%20-%20la%20arana.mp4) · [fotogramas](vista%20previa/00046%20Guillermo%20y%20Carla%20-%20la%20arana%20-%20fotogramas.png) |
| 00047 | Guillermo y Carla · Las flores | 15,00 s | [MP4 60 fps](vista%20previa/00047%20Guillermo%20y%20Carla%20-%20las%20flores.mp4) · [fotogramas](vista%20previa/00047%20Guillermo%20y%20Carla%20-%20las%20flores%20-%20fotogramas.png) |
| 00048 | Guillermo y Carla · El limón | 13,50 s | [MP4 60 fps](vista%20previa/00048%20Guillermo%20y%20Carla%20-%20el%20limon.mp4) · [fotogramas](vista%20previa/00048%20Guillermo%20y%20Carla%20-%20el%20limon%20-%20fotogramas.png) |
| 00049 | Guillermo y Carla · El helado | 14,40 s | [MP4 60 fps](vista%20previa/00049%20Guillermo%20y%20Carla%20-%20el%20helado.mp4) · [fotogramas](vista%20previa/00049%20Guillermo%20y%20Carla%20-%20el%20helado%20-%20fotogramas.png) |
| 00050 | Guillermo y Carla · Las gafas de sol | 14,50 s | [MP4 60 fps](vista%20previa/00050%20Guillermo%20y%20Carla%20-%20las%20gafas%20de%20sol.mp4) · [fotogramas](vista%20previa/00050%20Guillermo%20y%20Carla%20-%20las%20gafas%20de%20sol%20-%20fotogramas.png) |
| 00051 | Guillermo y Dari · El ajedrez | 13,80 s | [MP4 60 fps](vista%20previa/00051%20Guillermo%20y%20Dari%20-%20el%20ajedrez.mp4) · [fotogramas](vista%20previa/00051%20Guillermo%20y%20Dari%20-%20el%20ajedrez%20-%20fotogramas.png) |
| 00052 | Guillermo y Dari · Las gafas empañadas | 14,70 s | [MP4 60 fps](vista%20previa/00052%20Guillermo%20y%20Dari%20-%20las%20gafas%20empanadas.mp4) · [fotogramas](vista%20previa/00052%20Guillermo%20y%20Dari%20-%20las%20gafas%20empanadas%20-%20fotogramas.png) |
| 00053 | Guillermo y Dari · El cubo de Rubik | 14,65 s | [MP4 60 fps](vista%20previa/00053%20Guillermo%20y%20Dari%20-%20el%20cubo%20de%20rubik.mp4) · [fotogramas](vista%20previa/00053%20Guillermo%20y%20Dari%20-%20el%20cubo%20de%20rubik%20-%20fotogramas.png) |
| 00054 | Guillermo y Dari · El pelo rizado | 14,75 s | [MP4 60 fps](vista%20previa/00054%20Guillermo%20y%20Dari%20-%20el%20pelo%20rizado.mp4) · [fotogramas](vista%20previa/00054%20Guillermo%20y%20Dari%20-%20el%20pelo%20rizado%20-%20fotogramas.png) |
| 00055 | Guillermo y Dari · La máquina recreativa | 14,60 s | [MP4 60 fps](vista%20previa/00055%20Guillermo%20y%20Dari%20-%20la%20maquina%20recreativa.mp4) · [fotogramas](vista%20previa/00055%20Guillermo%20y%20Dari%20-%20la%20maquina%20recreativa%20-%20fotogramas.png) |
| 00056 | Guillermo y Dari · La pizza | 14,20 s | [MP4 60 fps](vista%20previa/00056%20Guillermo%20y%20Dari%20-%20la%20pizza.mp4) · [fotogramas](vista%20previa/00056%20Guillermo%20y%20Dari%20-%20la%20pizza%20-%20fotogramas.png) |
| 00057 | Guillermo y Dari · El dominó | 14,10 s | [MP4 60 fps](vista%20previa/00057%20Guillermo%20y%20Dari%20-%20el%20domino.mp4) · [fotogramas](vista%20previa/00057%20Guillermo%20y%20Dari%20-%20el%20domino%20-%20fotogramas.png) |
| 00058 | Guillermo y Dari · Las palomitas | 14,25 s | [MP4 60 fps](vista%20previa/00058%20Guillermo%20y%20Dari%20-%20las%20palomitas.mp4) · [fotogramas](vista%20previa/00058%20Guillermo%20y%20Dari%20-%20las%20palomitas%20-%20fotogramas.png) |
| 00059 | Guillermo y Dari · El abrigo | 14,60 s | [MP4 60 fps](vista%20previa/00059%20Guillermo%20y%20Dari%20-%20el%20abrigo.mp4) · [fotogramas](vista%20previa/00059%20Guillermo%20y%20Dari%20-%20el%20abrigo%20-%20fotogramas.png) |
| 00060 | Guillermo y Dari · El yoyó | 14,90 s | [MP4 60 fps](vista%20previa/00060%20Guillermo%20y%20Dari%20-%20el%20yoyo.mp4) · [fotogramas](vista%20previa/00060%20Guillermo%20y%20Dari%20-%20el%20yoyo%20-%20fotogramas.png) |
| 00061 | Guillermo y Deivi · El monopatín | 14,15 s | [MP4 60 fps](vista%20previa/00061%20Guillermo%20y%20Deivi%20-%20el%20monopatin.mp4) · [fotogramas](vista%20previa/00061%20Guillermo%20y%20Deivi%20-%20el%20monopatin%20-%20fotogramas.png) |
| 00062 | Guillermo y Deivi · El robot | 15,0 s | [MP4 60 fps](vista%20previa/00062%20Guillermo%20y%20Deivi%20-%20el%20robot.mp4) · [fotogramas](vista%20previa/00062%20Guillermo%20y%20Deivi%20-%20el%20robot%20-%20fotogramas.png) |
| 00063 | Guillermo y Deivi · El balón | 14,3 s | [MP4 60 fps](vista%20previa/00063%20Guillermo%20y%20Deivi%20-%20el%20balon.mp4) · [fotogramas](vista%20previa/00063%20Guillermo%20y%20Deivi%20-%20el%20balon%20-%20fotogramas.png) |
| 00064 | Guillermo y Deivi · El castillo de naipes | 13,8 s | [MP4 60 fps](vista%20previa/00064%20Guillermo%20y%20Deivi%20-%20el%20castillo%20de%20naipes.mp4) · [fotogramas](vista%20previa/00064%20Guillermo%20y%20Deivi%20-%20el%20castillo%20de%20naipes%20-%20fotogramas.png) |
| 00065 | Guillermo y Deivi · Las sillas con ruedas | 14,4 s | [MP4 60 fps](vista%20previa/00065%20Guillermo%20y%20Deivi%20-%20las%20sillas%20con%20ruedas.mp4) · [fotogramas](vista%20previa/00065%20Guillermo%20y%20Deivi%20-%20las%20sillas%20con%20ruedas%20-%20fotogramas.png) |
| 00066 | Guillermo y Deivi · El globo de helio | 14,9 s | [MP4 60 fps](vista%20previa/00066%20Guillermo%20y%20Deivi%20-%20el%20globo%20de%20helio.mp4) · [fotogramas](vista%20previa/00066%20Guillermo%20y%20Deivi%20-%20el%20globo%20de%20helio%20-%20fotogramas.png) |
| 00067 | Guillermo y Deivi · La guerra de almohadas | 14,0 s | [MP4 60 fps](vista%20previa/00067%20Guillermo%20y%20Deivi%20-%20la%20guerra%20de%20almohadas.mp4) · [fotogramas](vista%20previa/00067%20Guillermo%20y%20Deivi%20-%20la%20guerra%20de%20almohadas%20-%20fotogramas.png) |
| 00068 | Guillermo y Deivi · Las cosquillas | 14,9 s | [MP4 60 fps](vista%20previa/00068%20Guillermo%20y%20Deivi%20-%20las%20cosquillas.mp4) · [fotogramas](vista%20previa/00068%20Guillermo%20y%20Deivi%20-%20las%20cosquillas%20-%20fotogramas.png) |
| 00069 | Guillermo y Deivi · La momia | 15,0 s | [MP4 60 fps](vista%20previa/00069%20Guillermo%20y%20Deivi%20-%20la%20momia.mp4) · [fotogramas](vista%20previa/00069%20Guillermo%20y%20Deivi%20-%20la%20momia%20-%20fotogramas.png) |
| 00070 | Guillermo y Deivi · La realidad virtual | 14,8 s | [MP4 60 fps](vista%20previa/00070%20Guillermo%20y%20Deivi%20-%20la%20realidad%20virtual.mp4) · [fotogramas](vista%20previa/00070%20Guillermo%20y%20Deivi%20-%20la%20realidad%20virtual%20-%20fotogramas.png) |
| 00071 | Guillermo y Gabacho · El penalti | 14,4 s | [MP4 60 fps](vista%20previa/00071%20Guillermo%20y%20Gabacho%20-%20el%20penalti.mp4) · [fotogramas](vista%20previa/00071%20Guillermo%20y%20Gabacho%20-%20el%20penalti%20-%20fotogramas.png) |
| 00072 | Guillermo y Gabacho · El cruasán | 14,5 s | [MP4 60 fps](vista%20previa/00072%20Guillermo%20y%20Gabacho%20-%20el%20croissant.mp4) · [fotogramas](vista%20previa/00072%20Guillermo%20y%20Gabacho%20-%20el%20croissant%20-%20fotogramas.png) |
| 00073 | Guillermo y Gabacho · La chilena | 14,3 s | [MP4 60 fps](vista%20previa/00073%20Guillermo%20y%20Gabacho%20-%20la%20chilena.mp4) · [fotogramas](vista%20previa/00073%20Guillermo%20y%20Gabacho%20-%20la%20chilena%20-%20fotogramas.png) |
| 00074 | Guillermo y Gabacho · El queso | 14,95 s | [MP4 60 fps](vista%20previa/00074%20Guillermo%20y%20Gabacho%20-%20el%20queso.mp4) · [fotogramas](vista%20previa/00074%20Guillermo%20y%20Gabacho%20-%20el%20queso%20-%20fotogramas.png) |
| 00075 | Guillermo y Gabacho · El mando | 14,4 s | [MP4 60 fps](vista%20previa/00075%20Guillermo%20y%20Gabacho%20-%20el%20pique%20del%20mando.mp4) · [fotogramas](vista%20previa/00075%20Guillermo%20y%20Gabacho%20-%20el%20pique%20del%20mando%20-%20fotogramas.png) |
| 00076 | Guillermo y Gabacho · La boina | 14,8 s | [MP4 60 fps](vista%20previa/00076%20Guillermo%20y%20Gabacho%20-%20la%20boina.mp4) · [fotogramas](vista%20previa/00076%20Guillermo%20y%20Gabacho%20-%20la%20boina%20-%20fotogramas.png) |
| 00077 | Guillermo y Gabacho · El karaoke | 14,8 s | [MP4 60 fps](vista%20previa/00077%20Guillermo%20y%20Gabacho%20-%20el%20karaoke.mp4) · [fotogramas](vista%20previa/00077%20Guillermo%20y%20Gabacho%20-%20el%20karaoke%20-%20fotogramas.png) |
| 00078 | Guillermo y Gabacho · La ola | 14,25 s | [MP4 60 fps](vista%20previa/00078%20Guillermo%20y%20Gabacho%20-%20la%20ola.mp4) · [fotogramas](vista%20previa/00078%20Guillermo%20y%20Gabacho%20-%20la%20ola%20-%20fotogramas.png) |
| 00079 | Guillermo y Gabacho · El rizo | 14,8 s | [MP4 60 fps](vista%20previa/00079%20Guillermo%20y%20Gabacho%20-%20el%20pelo%20rizado.mp4) · [fotogramas](vista%20previa/00079%20Guillermo%20y%20Gabacho%20-%20el%20pelo%20rizado%20-%20fotogramas.png) |
| 00080 | Guillermo y Gabacho · La celebración | 14,9 s | [MP4 60 fps](vista%20previa/00080%20Guillermo%20y%20Gabacho%20-%20la%20celebracion.mp4) · [fotogramas](vista%20previa/00080%20Guillermo%20y%20Gabacho%20-%20la%20celebracion%20-%20fotogramas.png) |
| 00081 | Guillermo y Kiriku · Las gafas de sol | 14,4 s | [MP4 60 fps](vista%20previa/00081%20Guillermo%20y%20Kiriku%20-%20las%20gafas%20de%20sol.mp4) · [fotogramas](vista%20previa/00081%20Guillermo%20y%20Kiriku%20-%20las%20gafas%20de%20sol%20-%20fotogramas.png) |
| 00081.2 | Guillermo y Kiriku · Las gafas de sol | 14,4 s | [MP4 60 fps](vista%20previa/00081.2%20Guillermo%20y%20Kiriku%20-%20las%20gafas%20de%20sol.mp4) · [fotogramas](vista%20previa/00081.2%20Guillermo%20y%20Kiriku%20-%20las%20gafas%20de%20sol%20-%20fotogramas.png) · [revisión](revision/00081.2-revision.md) |
| 00082 | Guillermo y Kiriku · El postureo | 14,4 s | [MP4 60 fps](vista%20previa/00082%20Guillermo%20y%20Kiriku%20-%20el%20selfie%20de%20postureo.mp4) · [fotogramas](vista%20previa/00082%20Guillermo%20y%20Kiriku%20-%20el%20selfie%20de%20postureo%20-%20fotogramas.png) |
| 00082.2 | Guillermo y Kiriku · El postureo | 14,4 s | [MP4 60 fps](vista%20previa/00082.2%20Guillermo%20y%20Kiriku%20-%20el%20selfie%20de%20postureo.mp4) · [fotogramas](vista%20previa/00082.2%20Guillermo%20y%20Kiriku%20-%20el%20selfie%20de%20postureo%20-%20fotogramas.png) · [revisión](revision/00082.2-revision.md) |
| 00083 | Guillermo y Kiriku · El yate | 14,8 s | [MP4 60 fps](vista%20previa/00083%20Guillermo%20y%20Kiriku%20-%20el%20yate.mp4) · [fotogramas](vista%20previa/00083%20Guillermo%20y%20Kiriku%20-%20el%20yate%20-%20fotogramas.png) |
| 00083.2 | Guillermo y Kiriku · El yate | 14,8 s | [MP4 60 fps](vista%20previa/00083.2%20Guillermo%20y%20Kiriku%20-%20el%20yate.mp4) · [fotogramas](vista%20previa/00083.2%20Guillermo%20y%20Kiriku%20-%20el%20yate%20-%20fotogramas.png) · [revisión](revision/00083.2-revision.md) |
| 00084 | Guillermo y Kiriku · El jersey | 15,0 s | [MP4 60 fps](vista%20previa/00084%20Guillermo%20y%20Kiriku%20-%20el%20jersey.mp4) · [fotogramas](vista%20previa/00084%20Guillermo%20y%20Kiriku%20-%20el%20jersey%20-%20fotogramas.png) |
| 00084.2 | Guillermo y Kiriku · El jersey | 15,0 s | [MP4 60 fps](vista%20previa/00084.2%20Guillermo%20y%20Kiriku%20-%20el%20jersey.mp4) · [fotogramas](vista%20previa/00084.2%20Guillermo%20y%20Kiriku%20-%20el%20jersey%20-%20fotogramas.png) · [revisión](revision/00084.2-revision.md) |
| 00085 | Guillermo y Kiriku · La cata de vino | 14,8 s | [MP4 60 fps](vista%20previa/00085%20Guillermo%20y%20Kiriku%20-%20la%20cata%20de%20vino.mp4) · [fotogramas](vista%20previa/00085%20Guillermo%20y%20Kiriku%20-%20la%20cata%20de%20vino%20-%20fotogramas.png) |
| 00085.2 | Guillermo y Kiriku · La cata de vino | 14,8 s | [MP4 60 fps](vista%20previa/00085.2%20Guillermo%20y%20Kiriku%20-%20la%20cata%20de%20vino.mp4) · [fotogramas](vista%20previa/00085.2%20Guillermo%20y%20Kiriku%20-%20la%20cata%20de%20vino%20-%20fotogramas.png) · [revisión](revision/00085.2-revision.md) |
| 00086 | Guillermo y Kiriku · El peine | 14,6 s | [MP4 60 fps](vista%20previa/00086%20Guillermo%20y%20Kiriku%20-%20el%20peine.mp4) · [fotogramas](vista%20previa/00086%20Guillermo%20y%20Kiriku%20-%20el%20peine%20-%20fotogramas.png) |
| 00086.2 | Guillermo y Kiriku · El peine | 14,6 s | [MP4 60 fps](vista%20previa/00086.2%20Guillermo%20y%20Kiriku%20-%20el%20peine.mp4) · [fotogramas](vista%20previa/00086.2%20Guillermo%20y%20Kiriku%20-%20el%20peine%20-%20fotogramas.png) · [revisión](revision/00086.2-revision.md) |
| 00087 | Guillermo y Kiriku · El baile de salón | 14,75 s | [MP4 60 fps](vista%20previa/00087%20Guillermo%20y%20Kiriku%20-%20el%20baile%20de%20salon.mp4) · [fotogramas](vista%20previa/00087%20Guillermo%20y%20Kiriku%20-%20el%20baile%20de%20salon%20-%20fotogramas.png) |
| 00087.2 | Guillermo y Kiriku · El baile de salón | 14,75 s | [MP4 60 fps](vista%20previa/00087.2%20Guillermo%20y%20Kiriku%20-%20el%20baile%20de%20salon.mp4) · [fotogramas](vista%20previa/00087.2%20Guillermo%20y%20Kiriku%20-%20el%20baile%20de%20salon%20-%20fotogramas.png) · [revisión](revision/00087.2-revision.md) |
| 00088 | Guillermo y Kiriku · El reloj | 14,6 s | [MP4 60 fps](vista%20previa/00088%20Guillermo%20y%20Kiriku%20-%20el%20reloj%20caro.mp4) · [fotogramas](vista%20previa/00088%20Guillermo%20y%20Kiriku%20-%20el%20reloj%20caro%20-%20fotogramas.png) |
| 00088.2 | Guillermo y Kiriku · El reloj | 14,6 s | [MP4 60 fps](vista%20previa/00088.2%20Guillermo%20y%20Kiriku%20-%20el%20reloj%20caro.mp4) · [fotogramas](vista%20previa/00088.2%20Guillermo%20y%20Kiriku%20-%20el%20reloj%20caro%20-%20fotogramas.png) · [revisión](revision/00088.2-revision.md) |
| 00089 | Guillermo y Kiriku · El descapotable | 14,6 s | [MP4 60 fps](vista%20previa/00089%20Guillermo%20y%20Kiriku%20-%20el%20descapotable.mp4) · [fotogramas](vista%20previa/00089%20Guillermo%20y%20Kiriku%20-%20el%20descapotable%20-%20fotogramas.png) |
| 00090 | Guillermo y Kiriku · La foto de grupo | 12,9 s | [MP4 60 fps](vista%20previa/00090%20Guillermo%20y%20Kiriku%20-%20la%20foto%20de%20grupo.mp4) · [fotogramas](vista%20previa/00090%20Guillermo%20y%20Kiriku%20-%20la%20foto%20de%20grupo%20-%20fotogramas.png) |
| 00091 | Guillermo y Marta · El café con arte | 14,8 s | [MP4 60 fps](vista%20previa/00091%20Guillermo%20y%20Marta%20-%20el%20cafe%20con%20arte.mp4) · [fotogramas](vista%20previa/00091%20Guillermo%20y%20Marta%20-%20el%20cafe%20con%20arte%20-%20fotogramas.png) |
| 00092 | Guillermo y Marta · La bufanda | 14,8 s | [MP4 60 fps](vista%20previa/00092%20Guillermo%20y%20Marta%20-%20la%20bufanda.mp4) · [fotogramas](vista%20previa/00092%20Guillermo%20y%20Marta%20-%20la%20bufanda%20-%20fotogramas.png) |
| 00093 | Guillermo y Marta · El libro | 14,6 s | [MP4 60 fps](vista%20previa/00093%20Guillermo%20y%20Marta%20-%20el%20libro.mp4) · [fotogramas](vista%20previa/00093%20Guillermo%20y%20Marta%20-%20el%20libro%20-%20fotogramas.png) |
| 00094 | Guillermo y Marta · La pinza del pelo | 14,6 s | [MP4 60 fps](vista%20previa/00094%20Guillermo%20y%20Marta%20-%20la%20pinza%20del%20pelo.mp4) · [fotogramas](vista%20previa/00094%20Guillermo%20y%20Marta%20-%20la%20pinza%20del%20pelo%20-%20fotogramas.png) |
| 00095 | Guillermo y Marta · El gato | 14,8 s | [MP4 60 fps](vista%20previa/00095%20Guillermo%20y%20Marta%20-%20el%20gato.mp4) · [fotogramas](vista%20previa/00095%20Guillermo%20y%20Marta%20-%20el%20gato%20-%20fotogramas.png) |
| 00096 | Guillermo y Marta · El microondas | 14,9 s | [MP4 60 fps](vista%20previa/00096%20Guillermo%20y%20Marta%20-%20las%20palomitas%20de%20maiz.mp4) · [fotogramas](vista%20previa/00096%20Guillermo%20y%20Marta%20-%20las%20palomitas%20de%20maiz%20-%20fotogramas.png) |
| 00097 | Guillermo y Marta · Bajo la lluvia | 14,4 s | [MP4 60 fps](vista%20previa/00097%20Guillermo%20y%20Marta%20-%20el%20paraguas%20compartido.mp4) · [fotogramas](vista%20previa/00097%20Guillermo%20y%20Marta%20-%20el%20paraguas%20compartido%20-%20fotogramas.png) |
| 00098 | Guillermo y Marta · El puzle | 14,6 s | [MP4 60 fps](vista%20previa/00098%20Guillermo%20y%20Marta%20-%20el%20puzle.mp4) · [fotogramas](vista%20previa/00098%20Guillermo%20y%20Marta%20-%20el%20puzle%20-%20fotogramas.png) |
| 00099 | Guillermo y Marta · El muñeco de nieve | 15,0 s | [MP4 60 fps](vista%20previa/00099%20Guillermo%20y%20Marta%20-%20el%20muneco%20de%20nieve.mp4) · [fotogramas](vista%20previa/00099%20Guillermo%20y%20Marta%20-%20el%20muneco%20de%20nieve%20-%20fotogramas.png) |
| 00100 | Guillermo y Marta · El baile en la cocina | 15,0 s | [MP4 60 fps](vista%20previa/00100%20Guillermo%20y%20Marta%20-%20el%20baile%20en%20la%20cocina.mp4) · [fotogramas](vista%20previa/00100%20Guillermo%20y%20Marta%20-%20el%20baile%20en%20la%20cocina%20-%20fotogramas.png) |
| 00101 | Guillermo y Paradigma · La guitarra invisible | 14,9 s | [MP4 60 fps](vista%20previa/00101%20Guillermo%20y%20Paradigma%20-%20el%20air%20guitar.mp4) · [fotogramas](vista%20previa/00101%20Guillermo%20y%20Paradigma%20-%20el%20air%20guitar%20-%20fotogramas.png) |
| 00102 | Guillermo y Paradigma · La moto | 14,6 s | [MP4 60 fps](vista%20previa/00102%20Guillermo%20y%20Paradigma%20-%20la%20moto.mp4) · [fotogramas](vista%20previa/00102%20Guillermo%20y%20Paradigma%20-%20la%20moto%20-%20fotogramas.png) |
| 00103 | Guillermo y Paradigma · La meditación | 14,6 s | [MP4 60 fps](vista%20previa/00103%20Guillermo%20y%20Paradigma%20-%20la%20meditacion.mp4) · [fotogramas](vista%20previa/00103%20Guillermo%20y%20Paradigma%20-%20la%20meditacion%20-%20fotogramas.png) |
| 00104 | Guillermo y Paradigma · El pelo largo | 14,6 s | [MP4 60 fps](vista%20previa/00104%20Guillermo%20y%20Paradigma%20-%20el%20pelo%20largo.mp4) · [fotogramas](vista%20previa/00104%20Guillermo%20y%20Paradigma%20-%20el%20pelo%20largo%20-%20fotogramas.png) |
| 00105 | Guillermo y Paradigma · El vinilo | 14,6 s | [MP4 60 fps](vista%20previa/00105%20Guillermo%20y%20Paradigma%20-%20el%20vinilo.mp4) · [fotogramas](vista%20previa/00105%20Guillermo%20y%20Paradigma%20-%20el%20vinilo%20-%20fotogramas.png) |
| 00106 | Guillermo y Paradigma · La barbacoa | 14,6 s | [MP4 60 fps](vista%20previa/00106%20Guillermo%20y%20Paradigma%20-%20la%20barbacoa.mp4) · [fotogramas](vista%20previa/00106%20Guillermo%20y%20Paradigma%20-%20la%20barbacoa%20-%20fotogramas.png) |
| 00107 | Guillermo y Paradigma · El espejo | 14,7 s | [MP4 60 fps](vista%20previa/00107%20Guillermo%20y%20Paradigma%20-%20el%20reflejo.mp4) · [fotogramas](vista%20previa/00107%20Guillermo%20y%20Paradigma%20-%20el%20reflejo%20-%20fotogramas.png) |
| 00108 | Guillermo y Paradigma · La partida de cartas | 14,5 s | [MP4 60 fps](vista%20previa/00108%20Guillermo%20y%20Paradigma%20-%20la%20carta.mp4) · [fotogramas](vista%20previa/00108%20Guillermo%20y%20Paradigma%20-%20la%20carta%20-%20fotogramas.png) |
| 00109 | Guillermo y Paradigma · Los globos de agua | 15,0 s | [MP4 60 fps](vista%20previa/00109%20Guillermo%20y%20Paradigma%20-%20el%20globo%20de%20agua.mp4) · [fotogramas](vista%20previa/00109%20Guillermo%20y%20Paradigma%20-%20el%20globo%20de%20agua%20-%20fotogramas.png) |
| 00110 | Guillermo y Paradigma · La puesta de sol | 14,7 s | [MP4 60 fps](vista%20previa/00110%20Guillermo%20y%20Paradigma%20-%20la%20puesta%20de%20sol.mp4) · [fotogramas](vista%20previa/00110%20Guillermo%20y%20Paradigma%20-%20la%20puesta%20de%20sol%20-%20fotogramas.png) |
| 00111 | Guillermo y Rodri · La guerra de pulgares | 14,5 s | [MP4 60 fps](vista%20previa/00111%20Guillermo%20y%20Rodri%20-%20el%20pulso%20de%20dedos.mp4) · [fotogramas](vista%20previa/00111%20Guillermo%20y%20Rodri%20-%20el%20pulso%20de%20dedos%20-%20fotogramas.png) |
| 00112 | Guillermo y Rodri · Las sillas de bar | 14,45 s | [MP4 60 fps](vista%20previa/00112%20Guillermo%20y%20Rodri%20-%20las%20carreras%20de%20sillas.mp4) · [fotogramas](vista%20previa/00112%20Guillermo%20y%20Rodri%20-%20las%20carreras%20de%20sillas%20-%20fotogramas.png) |
| 00113 | Guillermo y Rodri · El concurso de eructos | 14,9 s | [MP4 60 fps](vista%20previa/00113%20Guillermo%20y%20Rodri%20-%20el%20eructo.mp4) · [fotogramas](vista%20previa/00113%20Guillermo%20y%20Rodri%20-%20el%20eructo%20-%20fotogramas.png) |
| 00114 | Guillermo y Rodri · La broma del cubo | 14,85 s | [MP4 60 fps](vista%20previa/00114%20Guillermo%20y%20Rodri%20-%20la%20broma%20del%20cubo.mp4) · [fotogramas](vista%20previa/00114%20Guillermo%20y%20Rodri%20-%20la%20broma%20del%20cubo%20-%20fotogramas.png) |
| 00115 | Guillermo y Rodri · El pino | 14,6 s | [MP4 60 fps](vista%20previa/00115%20Guillermo%20y%20Rodri%20-%20el%20pino.mp4) · [fotogramas](vista%20previa/00115%20Guillermo%20y%20Rodri%20-%20el%20pino%20-%20fotogramas.png) |
| 00116 | Guillermo y Rodri · La aceituna | 14,6 s | [MP4 60 fps](vista%20previa/00116%20Guillermo%20y%20Rodri%20-%20la%20apuesta%20de%20la%20aceituna.mp4) · [fotogramas](vista%20previa/00116%20Guillermo%20y%20Rodri%20-%20la%20apuesta%20de%20la%20aceituna%20-%20fotogramas.png) |
| 00117 | Guillermo y Rodri · Las latas | 14,6 s | [MP4 60 fps](vista%20previa/00117%20Guillermo%20y%20Rodri%20-%20el%20muro%20de%20latas.mp4) · [fotogramas](vista%20previa/00117%20Guillermo%20y%20Rodri%20-%20el%20muro%20de%20latas%20-%20fotogramas.png) |
| 00118 | Guillermo y Rodri · El columpio | 14,8 s | [MP4 60 fps](vista%20previa/00118%20Guillermo%20y%20Rodri%20-%20el%20columpio.mp4) · [fotogramas](vista%20previa/00118%20Guillermo%20y%20Rodri%20-%20el%20columpio%20-%20fotogramas.png) |
| 00119 | Guillermo y Rodri · El chicle | 14,8 s | [MP4 60 fps](vista%20previa/00119%20Guillermo%20y%20Rodri%20-%20el%20chicle.mp4) · [fotogramas](vista%20previa/00119%20Guillermo%20y%20Rodri%20-%20el%20chicle%20-%20fotogramas.png) |
| 00120 | Guillermo y Rodri · El brindis | 14,5 s | [MP4 60 fps](vista%20previa/00120%20Guillermo%20y%20Rodri%20-%20el%20brindis.mp4) · [fotogramas](vista%20previa/00120%20Guillermo%20y%20Rodri%20-%20el%20brindis%20-%20fotogramas.png) |
| 00121 | Guillermo y Sara · El tatuaje | 14,6 s | [MP4 60 fps](vista%20previa/00121%20Guillermo%20y%20Sara%20-%20el%20tatuaje.mp4) · [fotogramas](vista%20previa/00121%20Guillermo%20y%20Sara%20-%20el%20tatuaje%20-%20fotogramas.png) |
| 00122 | Guillermo y Sara · El concierto | 14,6 s | [MP4 60 fps](vista%20previa/00122%20Guillermo%20y%20Sara%20-%20el%20concierto.mp4) · [fotogramas](vista%20previa/00122%20Guillermo%20y%20Sara%20-%20el%20concierto%20-%20fotogramas.png) |
| 00123 | Guillermo y Sara · El delineado | 14,6 s | [MP4 60 fps](vista%20previa/00123%20Guillermo%20y%20Sara%20-%20el%20maquillaje.mp4) · [fotogramas](vista%20previa/00123%20Guillermo%20y%20Sara%20-%20el%20maquillaje%20-%20fotogramas.png) |
| 00124 | Guillermo y Sara · La tormenta | 14,8 s | [MP4 60 fps](vista%20previa/00124%20Guillermo%20y%20Sara%20-%20la%20tormenta.mp4) · [fotogramas](vista%20previa/00124%20Guillermo%20y%20Sara%20-%20la%20tormenta%20-%20fotogramas.png) |
| 00125 | Guillermo y Sara · No te rías | 14,85 s | [MP4 60 fps](vista%20previa/00125%20Guillermo%20y%20Sara%20-%20el%20pulso%20de%20miradas.mp4) · [fotogramas](vista%20previa/00125%20Guillermo%20y%20Sara%20-%20el%20pulso%20de%20miradas%20-%20fotogramas.png) |
| 00126 | Guillermo y Sara · El collar | 14,6 s | [MP4 60 fps](vista%20previa/00126%20Guillermo%20y%20Sara%20-%20la%20cruz%20del%20collar.mp4) · [fotogramas](vista%20previa/00126%20Guillermo%20y%20Sara%20-%20la%20cruz%20del%20collar%20-%20fotogramas.png) |
| 00127 | Guillermo y Sara · El monopatín de noche | 14,55 s | [MP4 60 fps](vista%20previa/00127%20Guillermo%20y%20Sara%20-%20el%20skate%20de%20noche.mp4) · [fotogramas](vista%20previa/00127%20Guillermo%20y%20Sara%20-%20el%20skate%20de%20noche%20-%20fotogramas.png) |
| 00128 | Guillermo y Sara · La salsa picante | 14,6 s | [MP4 60 fps](vista%20previa/00128%20Guillermo%20y%20Sara%20-%20la%20pizza%20picante.mp4) · [fotogramas](vista%20previa/00128%20Guillermo%20y%20Sara%20-%20la%20pizza%20picante%20-%20fotogramas.png) |
| 00129 | Guillermo y Sara · El baile gótico | 14,9 s | [MP4 60 fps](vista%20previa/00129%20Guillermo%20y%20Sara%20-%20el%20baile%20gotico.mp4) · [fotogramas](vista%20previa/00129%20Guillermo%20y%20Sara%20-%20el%20baile%20gotico%20-%20fotogramas.png) |
| 00130 | Guillermo y Sara · La azotea | 14,8 s | [MP4 60 fps](vista%20previa/00130%20Guillermo%20y%20Sara%20-%20el%20atardecer%20en%20la%20azotea.mp4) · [fotogramas](vista%20previa/00130%20Guillermo%20y%20Sara%20-%20el%20atardecer%20en%20la%20azotea%20-%20fotogramas.png) |
| 00131 | Guillermo y Yorgi · El batido de proteínas | 14,8 s | [MP4 60 fps](vista%20previa/00131%20Guillermo%20y%20Yorgi%20-%20el%20desayuno%20de%20campeones.mp4) · [fotogramas](vista%20previa/00131%20Guillermo%20y%20Yorgi%20-%20el%20desayuno%20de%20campeones%20-%20fotogramas.png) |
| 00132 | Guillermo y Yorgi · Las flexiones | 14,6 s | [MP4 60 fps](vista%20previa/00132%20Guillermo%20y%20Yorgi%20-%20las%20flexiones.mp4) · [fotogramas](vista%20previa/00132%20Guillermo%20y%20Yorgi%20-%20las%20flexiones%20-%20fotogramas.png) |
| 00133 | Guillermo y Yorgi · Llegas tarde | 14,4 s | [MP4 60 fps](vista%20previa/00133%20Guillermo%20y%20Yorgi%20-%20el%20reloj.mp4) · [fotogramas](vista%20previa/00133%20Guillermo%20y%20Yorgi%20-%20el%20reloj%20-%20fotogramas.png) |
| 00134 | Guillermo y Yorgi · La hamburguesa gigante | 14,9 s | [MP4 60 fps](vista%20previa/00134%20Guillermo%20y%20Yorgi%20-%20la%20barbacoa.mp4) · [fotogramas](vista%20previa/00134%20Guillermo%20y%20Yorgi%20-%20la%20barbacoa%20-%20fotogramas.png) |
| 00135 | Guillermo y Yorgi · Los pendientes | 14,6 s | [MP4 60 fps](vista%20previa/00135%20Guillermo%20y%20Yorgi%20-%20el%20pendiente.mp4) · [fotogramas](vista%20previa/00135%20Guillermo%20y%20Yorgi%20-%20el%20pendiente%20-%20fotogramas.png) |
| 00136 | Guillermo y Yorgi · La carrera | 14,6 s | [MP4 60 fps](vista%20previa/00136%20Guillermo%20y%20Yorgi%20-%20la%20carrera.mp4) · [fotogramas](vista%20previa/00136%20Guillermo%20y%20Yorgi%20-%20la%20carrera%20-%20fotogramas.png) |
| 00137 | Guillermo y Yorgi · La sorpresa | 14,6 s | [MP4 60 fps](vista%20previa/00137%20Guillermo%20y%20Yorgi%20-%20el%20abrazo%20de%20cumpleanos.mp4) · [fotogramas](vista%20previa/00137%20Guillermo%20y%20Yorgi%20-%20el%20abrazo%20de%20cumpleanos%20-%20fotogramas.png) |
| 00138 | Guillermo y Yorgi · La mancuerna | 14,4 s | [MP4 60 fps](vista%20previa/00138%20Guillermo%20y%20Yorgi%20-%20la%20mancuerna.mp4) · [fotogramas](vista%20previa/00138%20Guillermo%20y%20Yorgi%20-%20la%20mancuerna%20-%20fotogramas.png) |
| 00139 | Guillermo y Yorgi · La siesta | 14,6 s | [MP4 60 fps](vista%20previa/00139%20Guillermo%20y%20Yorgi%20-%20la%20siesta.mp4) · [fotogramas](vista%20previa/00139%20Guillermo%20y%20Yorgi%20-%20la%20siesta%20-%20fotogramas.png) |
| 00140 | Guillermo y Yorgi · El selfie del gimnasio | 14,3 s | [MP4 60 fps](vista%20previa/00140%20Guillermo%20y%20Yorgi%20-%20el%20selfie%20del%20gimnasio.mp4) · [fotogramas](vista%20previa/00140%20Guillermo%20y%20Yorgi%20-%20el%20selfie%20del%20gimnasio%20-%20fotogramas.png) |

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


### 00020.2 · Revisión de continuidad

Corrige las uniones de brazos, el apoyo al arrodillarse, las palmaditas y la continuidad de la tarjeta. Conserva las tres rondas, los bolsillos vacíos y la polilla. Se conserva la original. [Informe y pruebas](revision/00020.2.md).


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


### 00021.2 · Revisión de continuidad

Corrige la continuidad de brazos, vaso y boquilla, el barrido del agua y el encuadre final. Conserva el incendio en cadena y el remate de Guillermo empapado. Se conserva la original. [Informe y pruebas](revision/00021.2.md).


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


### 00022.2 · Revisión de continuidad

Corrige los brazos y los contactos durante el rescate. La escalera permanece sujeta al moverla y el gato enlaza sus saltos y cambios de postura sin giros repentinos. Se conserva la original. [Informe y pruebas](revision/00022.2.md).


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

### 00039 · Guillermo y Ander · El gol

1. Negro.
2. Bar deportivo de noche: pared granate con molduras, neón de balón, camiseta enmarcada, trofeos, bufanda y pizarra de táctica; una tele colgada en lo alto echa un partido de muñequitos (solo el marcador con números). Guillermo y Ander, cara a cara bajo la tele, inclinados hacia delante: Guillermo se muerde las uñas y Ander se queda con la caña a medio camino de la boca.
3. El delantero rojo se queda solo ante el portero: Guillermo se lleva las manos a las mejillas, sudando.
4. **¡GOL!** Fogonazo en la tele y el marcador pasa a 1-0. Guillermo salta tan alto que **se da con la cabeza en la lámpara** (estrella de golpe, estrellitas girando y la lámpara balanceándose). Ander levanta los brazos y **la espuma de su caña sale volando** por encima de la tele… y le aterriza a Guillermo en el pelo, que ni se entera.
5. Corren el uno hacia el otro, se cogen de la mano y **saltan en corro** dando vueltas, Guillermo con el puño en alto y Ander con la caña, mientras cae **confeti de la nada**, que se va quedando en el suelo.
6. En la tele, la repetición: rebobina en azul, cámara lenta y pausa. Aparece la línea de fuera de juego, un círculo marca al delantero, sale el **banderín de fuera de juego** y el marcador vuelve al **0-0**.
7. Lo ven y se quedan **congelados en el aire** en lo alto del salto… y caen al suelo de golpe, con polvareda.
8. Bajan los brazos muy despacio, se sueltan y se miran chafados; se meten las manos en los bolsillos.
9. Una gota de espuma se estira, cae y se queda en la nariz de Guillermo, que la mira bizco. Ander da un sorbo resignado a su caña; Guillermo pone pucheros a cámara y el último confeti se le posa en la espuma de la cabeza.
10. Negro.

![Fotogramas de 00039](vista%20previa/00039%20Guillermo%20y%20Ander%20-%20el%20gol%20-%20fotogramas.png)

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

### 00042 · Guillermo y Carla · El ligue

1. Negro.
2. Coctelería art déco vista desde detrás de la barra: Carla toma un cóctel rosa al otro lado; Guillermo, a la izquierda, la mira embobado y luego mira a cámara como si fuera un espejo.
3. Saca un peine de bolsillo, se repeina el lado con tres pasadas y el pelo le hace un destello; Carla le echa una ojeada y da un sorbo.
4. Se echa el aliento en la mano, lo huele y casi se desmaya (líneas verdes, rodillas que ceden, cabeza que da vueltas); Carla se ríe.
5. Saca bíceps con los dos brazos y le brillan; Carla pone los ojos en blanco.
6. Manos a los bolsillos y paseo a cámara lenta, en plan chulo, con foco y purpurina; la cámara se acerca a la barra.
7. Se planta junto a Carla y le guiña un ojo; ella pestañea, colorada.
8. Apoya el antebrazo en la barra… y el codo sigue bajando: **la barra está más lejos de lo que creía**.
9. Se queda un instante con los brazos en alto mirando a cámara y **se hunde detrás del mostrador**: golpe, polvo y botellas que tiemblan; Carla da un respingo.
10. Carla mira por encima de la barra con la copa en alto; por encima del borde sube la mano de Guillermo con una margarita y la deja tumbada, con el tallo hacia ella.
11. Carla deja la copa, coge la flor, la huele con los ojos cerrados y le salen corazones.
12. Guillermo asoma los ojos por el borde, colorado, agarrado al canto; Carla le mira y le guiña un ojo.
13. Negro.

![Fotogramas de 00042](vista%20previa/00042%20Guillermo%20y%20Carla%20-%20el%20ligue%20-%20fotogramas.png)

### 00043 · Guillermo y Carla · El limbo

1. Negro.
2. Fiesta hawaiana de noche (farolillos, palmera, limbo de bambú): Carla baila con una flor en el pelo; Guillermo, con collar de flores y las manos en los bolsillos, asiente al ritmo. Carla mira a cámara y se echa la melena atrás.
3. Carla se dobla hacia atrás **imposiblemente baja**, rodillas por delante y melena barriendo el suelo, y pasa bajo el listón a pasitos; Guillermo se queda boquiabierto.
4. Se levanta al otro lado, posa con los brazos en alto y guiña un ojo.
5. Se da la vuelta, baja el listón una muesca con un dedo (¡clac!) y le invita con la palma; Guillermo se cruje los dedos y pone cara de chulo.
6. Guillermo se echa atrás, se tambalea moviendo los brazos como aspas, **le cruje la espalda** y se queda congelado a medio camino, temblando, rojo y sudando.
7. Se desploma de espaldas (¡pum!) y suspira aliviado… los postes tiemblan y **el listón le cae en la barriga**: ¡boing!, ojos en espiral y estrellitas.
8. Carla se ríe tapándose la boca, se acerca bailando y planta la bota en el listón como un trofeo; a él se le hinchan los mofletes y levanta una mano rendido; ella guiña a cámara.
9. Negro.

![Fotogramas de 00043](vista%20previa/00043%20Guillermo%20y%20Carla%20-%20el%20limbo%20-%20fotogramas.png)

### 00044 · Guillermo y Carla · La melena

1. Negro.
2. Plató de anuncio de champú: fondo pastel, aro de luz, burbujas, softbox, botes y un ventilador gigante con cintas. Carla posa en el centro; Guillermo, detrás, sujeta un mando.
3. Carla le señala y chasca los dedos («¡acción!»); Guillermo pulsa el mando y el ventilador arranca.
4. Cámara lenta de anuncio: la melena de Carla ondea con destellos mientras ella se pasa la mano por el pelo con los ojos cerrados. Guillermo se guarda el mando, le salen corazones y se acerca de puntillas a olerle el pelo.
5. Carla sonríe a cámara, agacha la cabeza y la echa atrás de golpe: **una ola enorme de melena** barre el plató y le da a Guillermo en toda la cara.
6. Guillermo gira como una peonza y cae sentado, mareado, con estrellitas y pelos de Carla pegados en la cara.
7. Carla, sin enterarse, posa con la mano en la nuca y una sonrisa deslumbrante (destello en los dientes).
8. Guillermo descubre un pelo en el labio, hincha los carrillos y lo sopla; el viento se lo lleva. Mira a cámara resignado; Carla guiña un ojo.
9. Negro.

![Fotogramas de 00044](vista%20previa/00044%20Guillermo%20y%20Carla%20-%20la%20melena%20-%20fotogramas.png)

### 00045 · Guillermo y Carla · El retrato

1. Negro.
2. Estudio de pintor en una buhardilla: Guillermo posa de héroe subido a un taburete (pecho fuera, barbilla arriba, puño en la cadera y el otro brazo señalando al horizonte). Carla, en el caballete, le mide con el pincel guiñando un ojo y él le guiña a cámara.
3. Carla moja el pincel en la paleta y pinta con la lengua fuera. Las salpicaduras asoman por detrás del lienzo.
4. Guillermo aguanta la pose cada vez peor: le tiembla el brazo, suda y se pone rojo.
5. Una mosca le ronda la cabeza y se le posa en la nariz. Él ni se mueve: tic en el ojo, mofletes hinchados y un soplido de lado que no la espanta.
6. Carla se aparta a admirar su obra con la cabeza ladeada, vuelve a pintar a lo loco y remata con una floritura que deja un destello.
7. Guillermo se relaja (la mosca se va) y se frota las manos, ansioso. Carla gira el lienzo: **un muñequito de palotes** con el pelo de pinchos y una sonrisa enorme, subido a un taburete y con un sol en la esquina.
8. A Guillermo se le cae la mandíbula y mira a cámara, serio.
9. Carla, orgullosísima, añade al cuadro un corazoncito rojo y guiña un ojo.
10. Guillermo señala el cuadro, se pone la mano en el pecho («¿yo?»), Carla asiente encantada y él se encoge de hombros con una sonrisa resignada.
11. Negro.

![Fotogramas de 00045](vista%20previa/00045%20Guillermo%20y%20Carla%20-%20el%20retrato%20-%20fotogramas.png)

### 00046 · Guillermo y Carla · La araña

1. Negro.
2. Rincón de cafetería con plantas: pared verde salvia, viga de madera, ventana de arco con luz de mañana y una monstera en su maceta de barro. Guillermo saca bíceps con los ojos cerrados delante de Carla, que le mira con las manos en los bolsillos y una ceja levantada.
3. Una **arañita diminuta y monísima** baja a saltitos por su hilo desde la viga hasta quedarse delante de la nariz de Guillermo y le saluda con una patita.
4. Guillermo abre los ojos, se queda bizco y congelado, suda… y **grita** con la boca enorme y el pelo de punta; la araña sube del susto como un yoyó y se esconde en la viga.
5. **Salta a los brazos de Carla**, que le coge como a una princesa sin inmutarse: dobla las rodillas, le sujeta bajo los muslos y por la espalda, mira a cámara y suspira mientras él tiembla con los puños bajo la barbilla.
6. Le deja en el suelo y Guillermo sale corriendo a esconderse detrás de ella; se asoma agachado por su hombro.
7. Carla saca el índice y llama a la araña, que se columpia en su hilo y aterriza en la punta del dedo; el hilo se suelta y sube.
8. Se la acerca a la cara, le lanza un besito con la mano (un corazón vuela hasta la araña, que se pone colorada) y Guillermo pone cara de asco.
9. Carla baja el dedo hasta una hoja de la monstera y la araña se va andando a la hoja.
10. Guillermo sale de su escondite, se estira la camiseta, se rasca la nuca para aplastar el pelo de punta y se pone a silbar como si nada.
11. La araña le saluda desde la hoja: respingo, pelo de punta otra vez y a silbar más rápido. Carla guiña un ojo a cámara.
12. Negro.

![Fotogramas de 00046](vista%20previa/00046%20Guillermo%20y%20Carla%20-%20la%20arana%20-%20fotogramas.png)

### 00047 · Guillermo y Carla · Las flores

1. Negro.
2. Terraza con pérgola al atardecer: Carla espera, mira el reloj y suspira.
3. Guillermo entra muy chulo con un ramo enorme escondido a la espalda; una abeja le ronda y él guiña a cámara.
4. La abeja le da vueltas a la cabeza y se mete en el ramo; le pica la nariz: «ah… ah…», se aguanta con el dedo bajo la nariz… y se le pasa.
5. Da dos pasos y, con una reverencia, le ofrece el ramo; Carla se lleva la mano a la boca y le salen corazones.
6. La abeja sale del ramo con una nube de polen justo bajo su nariz: «ah… ah…» y **¡ACHÍS!** Todos los pétalos salen volando en una tormenta de colores, la abeja sale despedida y a Carla se le vuela la melena.
7. Una florecilla le cae a él en el pelo y el último pétalo se descuelga y cae al suelo.
8. Carla abre los ojos y coge el ramillete de **tallos pelados**, lo mira y pone cara de póquer a cámara.
9. Se parte de risa mientras él, colorado, se rasca la nuca; ella tira los tallos por encima de la cabeza y acaban plantados en la maceta.
10. Él agacha la cabeza; ella le quita la florecilla del pelo, se la pone detrás de la oreja y guiña a cámara; él se derrite.
11. La abeja vuelve mareada y se le posa en la nariz; Guillermo se queda bizco y Carla se ríe tapándose la boca.
12. Negro.

![Fotogramas de 00047](vista%20previa/00047%20Guillermo%20y%20Carla%20-%20las%20flores%20-%20fotogramas.png)

### 00048 · Guillermo y Carla · El limón

1. Negro.
2. Terraza encalada junto al mar: limonero en maceta, contraventana azul con geranios y guirnalda de bombillas. En una mesita, un plato con dos gajos de limón y un azucarero. Guillermo mira el plato y luego a cámara, muy chulo; Carla levanta una ceja.
3. Carla coge su gajo, le pega un mordisco sin pestañear y lo mastica con elegancia sin quitarle ojo; Guillermo se queda pasmado.
4. Carla deja la cáscara en el plato. Guillermo resopla, coge su gajo, lo enseña a cámara con un guiño y le pega un buen bocado; mastica sobrado…
5. …¡el ácido!: **se le arruga toda la cara** (ojos apretados, morritos, mofletes chupados, cabeza estrujada y tinte verdoso), se le pone el pelo de punta, se le cae la cáscara, que bota en la mesa, y tiembla de la cabeza a los pies con los puños apretados.
6. Carla se parte de risa, coge un terrón de azúcar y se lo ofrece con una sonrisa.
7. Guillermo abre un ojo, alarga la mano temblando, coge el terrón y se lo mete en la boca: crac, con migas.
8. Se le desarruga la cara, se le baja el pelo y suspira aliviado; un último escalofrío, Carla se ríe y guiña un ojo, y él sonríe con el pulgar arriba.
9. Negro.

![Fotogramas de 00048](vista%20previa/00048%20Guillermo%20y%20Carla%20-%20el%20limon%20-%20fotogramas.png)

### 00049 · Guillermo y Carla · El helado

1. Negro.
2. Terraza del paseo marítimo en pleno verano: sol que aprieta, el mar tras la barandilla blanca, un quiosco de helados con toldo de rayas rosas y una sombrilla con su mesita. Carla lame tan tranquila su bola de vainilla con fideos.
3. Guillermo le presume su torre de tres bolas (pistacho, chocolate y fresa con guinda) con cejas de chulito y un meneo; Carla pone los ojos en blanco.
4. Él le da tres lametones cada vez más exagerados con los ojos cerrados y la torre se bambolea. Con el tercero, la bola de fresa resbala, da una vuelta de campana y **se estampa en el suelo**: ¡plaf! Él, sin enterarse, sigue lamiendo el aire y Carla se tapa la boca.
5. Guillermo abre los ojos, mira el cucurucho, se inclina para ver la plasta… y al inclinarse se le caen también la de chocolate y la de pistacho, una encima de otra.
6. Hundido, con el cucurucho vacío y lagrimones. Carla, con pena, mira su helado, sonríe, se lo cambia de mano y se acerca.
7. Se lo ofrece y a él se le iluminan los ojos: el cucurucho pasa de una mano a otra con los dos puños agarrándolo a la vez.
8. Guillermo lo abraza feliz entre corazoncitos mientras Carla da un pasito atrás.
9. Le hace una reverencia de agradecimiento… el cucurucho se vuelca y **la bola de vainilla cae y se chafa encima de su zapato**, con la guinda arriba.
10. Él se queda helado mirándose el zapato y suda. Carla se aguanta la risa con los mofletes hinchados, estalla a carcajadas, le señala el zapato y se seca una lágrima.
11. Guillermo se endereza, mira a cámara muy serio y lame con pena su cucurucho vacío, dos veces.
12. Negro.

![Fotogramas de 00049](vista%20previa/00049%20Guillermo%20y%20Carla%20-%20el%20helado%20-%20fotogramas.png)

### 00050 · Guillermo y Carla · Las gafas de sol

1. Negro.
2. Mediodía de verano a la puerta del bar, en un pueblo blanco junto al mar. Guillermo se hace visera con la mano, deslumbrado; Carla lleva las gafas de sol subidas en el pelo.
3. Carla coge las gafas por la patilla, se las baja, se echa la melena atrás (destello en el cristal) y mira a cámara.
4. Carla se va calle abajo muy chula.
5. Guillermo saca sus gafas del bolsillo, las abre de un golpe de muñeca, mira a cámara y se las pone.
6. **Todo se queda casi negro** a su alrededor: sus gafas son demasiado oscuras.
7. Sale detrás de ella andando a lo guay, con las manos en los bolsillos, se desvía hacia el bordillo y **se da de morros con la farola**: ¡boing!, la farola vibra, gafas torcidas, chichón y estrellitas.
8. Retrocede dando tumbos con los brazos como aspas, choca de culo con la papelera y la tapa sale volando y le cae en la cabeza.
9. Carla vuelve, se sube sus gafas, le sube a él las suyas a la frente y se ríe.
10. Guillermo parpadea, la ve, se rasca la nuca y se pone colorado.
11. Carla da media vuelta, le tiende la mano y se lo lleva calle abajo, esta vez por delante de la farola, guiñando un ojo a cámara.
12. Negro.

![Fotogramas de 00050](vista%20previa/00050%20Guillermo%20y%20Carla%20-%20las%20gafas%20de%20sol%20-%20fotogramas.png)

### 00051 · Guillermo y Dari · El ajedrez

1. Negro.
2. Rincón de un club de ajedrez de noche: papel pintado verde, zócalo de madera, ventana con luna, estantería con un trofeo y una mesita alta con el tablero entre los dos.
3. Dari piensa muchísimo, con el puño en la barbilla, y las gafas le dan un destello; Guillermo tamborilea en la mesa y bosteza.
4. Dari, por fin, adelanta un peón una sola casilla.
5. Guillermo, sin pensar, agarra su dama, cruza el tablero y la planta de golpe (todo salta); se echa atrás y mira a cámara, chulísimo, moviendo las cejas.
6. Dari se sube las gafas (destello) y mueve el caballo con un saltito.
7. El rey de Guillermo se tambalea y cae despacio: **jaque mate**. Guillermo se queda de piedra; Dari, que lo ve venir, coge su taza de té.
8. A Guillermo se le pone la cabeza roja, le late la vena, tiembla, agarra el tablero y **lo lanza por los aires** con los puños en alto.
9. El tablero sale por arriba dando vueltas y cae boca abajo detrás de él; **las piezas le llueven una a una en la cabeza** (estrellitas en cada golpe) y el caballo, el último, se le queda encima del pelo; el rey de Dari cae de pie en la mesa.
10. Dari sorbe el té con los ojos cerrados, tan tranquilo.
11. Guillermo, mareado, con ojos de espiral, estrellas girando y el caballo bamboleándose en la cabeza, mira hacia arriba; Dari mira a cámara, levanta una ceja y vuelve a sorber.
12. Negro.

![Fotogramas de 00051](vista%20previa/00051%20Guillermo%20y%20Dari%20-%20el%20ajedrez%20-%20fotogramas.png)

### 00052 · Guillermo y Dari · Las gafas empañadas

1. Negro.
2. Noche de nieve: Guillermo y Dari acaban de entrar en un bar calentito; la puerta se cierra de golpe con una ráfaga de copos. Llevan nieve en los hombros y en el pelo, y tiritan.
3. Con el calor, **las gafas de Dari se empañan** de abajo arriba hasta quedarse blancas del todo. Dari se queda quieto, sin ver nada.
4. Se las quita, las frota en la parka y se las vuelve a poner: le brillan, limpias. Guillermo se parte de risa con la mano en la barriga.
5. Guillermo coge una taza de café humeante de la mesita y se la da. Dari la huele a gusto… y el vapor se las vuelve a empañar. Guillermo le señala, muerto de risa.
6. Dari se las quita otra vez y las mira de lejos, entornando los ojos. Guillermo se las birla, les da la vuelta y se las pone.
7. **Todo se ve borroso:** el bar ondula, Guillermo se ve doble y con los ojos en espiral. Da una vuelta sobre sí mismo y ve el perchero, con su abrigo beis y su gorro de pelo rizado: «¡Dari!».
8. Abre los brazos, va dando tumbos y **abraza el perchero**. Se tambalea y el gorro le cae en la cabeza, y ahí se queda. Dari, sin gafas, se toma el café tan tranquilo y levanta una ceja.
9. Dari deja la taza, va hasta Guillermo, le quita las gafas y se las pone: todo vuelve a verse nítido.
10. Guillermo ve lo que estaba abrazando, lo suelta, se pone rojo como un tomate y le sale vapor de la cabeza… que vuelve a empañar las gafas de Dari, que mira a cámara.
11. Negro.

![Fotogramas de 00052](vista%20previa/00052%20Guillermo%20y%20Dari%20-%20las%20gafas%20empanadas%20-%20fotogramas.png)

### 00053 · Guillermo y Dari · El cubo de Rubik

1. Negro.
2. Un bar de juegos de mesa: estantería llena de cajas, neón con forma de cubo, marciano de píxeles, pizarra con el desarrollo de un cubo y una lámpara sobre una mesa alta. Dari mira su cubo desordenado y le brillan las gafas.
3. **Lo resuelve en dos segundos** con los dedos hechos un borrón y lo deja en la mesa: ¡clic! Guillermo se queda con la boca abierta.
4. Guillermo coge su cubo, se lo enseña chulo a cámara y empieza a girar caras: primero despacio y con la lengua fuera, luego cada vez más rápido. Le da la vuelta, suda, se pone rojo y se le ponen los ojos en espiral.
5. Despega una pegatina; se le queda pegada al dedo, sacude la mano y la pegatina acaba en su moflete.
6. Rabia: levanta el cubo y **lo estampa contra la mesa**. Revienta en cubitos que saltan por toda la mesa y el cubo de Dari da un brinco.
7. Dari suspira y, con una mano en el bolsillo, hace saltar los cubitos a su sitio uno a uno hasta montar el cubo resuelto (sin la pegatina).
8. Se lo devuelve; Guillermo lo abraza con los ojos cerrados y le salen corazones. A Dari le brillan las gafas.
9. Negro.

![Fotogramas de 00053](vista%20previa/00053%20Guillermo%20y%20Dari%20-%20el%20cubo%20de%20rubik%20-%20fotogramas.png)

### 00054 · Guillermo y Dari · El pelo rizado

1. Negro.
2. Salita de un café en una tarde de lluvia: Dari, repantingado en un puf, hace un crucigrama y pasa una página; entra Guillermo con las manos en los bolsillos.
3. Guillermo se queda embobado con los rizos de Dari y mira a cámara con cara de pillo.
4. Los toca con un dedo: se le hunde (¡boing!) y le da la risita, tapándose la boca.
5. **Mete la mano hasta la muñeca** y hurga… y se le queda atascada: tira y la cabeza de Dari se va con él, que ni levanta la vista.
6. Apoya el pie en el puf, tira con todo y ¡plop!: sale con un lápiz y la parte de atrás de los rizos queda despeinada.
7. Dari, sin mirar, tiende la mano, se queda el lápiz y rellena una casilla.
8. Guillermo vuelve a meter la mano y saca **un tenedor, un calcetín de rayas y un patito de goma** que pita, y los va tirando por encima del hombro al suelo.
9. Se oye un pío: asoma **un pajarito**, salta a su mano, pía y se va volando.
10. Dari se guarda el lápiz en los rizos (asoma la goma) y se los ahueca con dos palmaditas; a Guillermo le cae una pluma en la nariz.
11. Dari sonríe a cámara.
12. Negro.

![Fotogramas de 00054](vista%20previa/00054%20Guillermo%20y%20Dari%20-%20el%20pelo%20rizado%20-%20fotogramas.png)

### 00055 · Guillermo y Dari · La máquina recreativa

1. Negro.
2. Rincón de recreativas al fondo de un bar (pared verde, zócalo de madera, suelo en damero, póster de un cohete, diana y guirnalda de bombillas). Dari juega al matamarcianos con una sola mano y la otra en el bolsillo: toquecitos mínimos a la palanca y cada disparo es un marciano menos; el marcador sube. Guillermo, al lado, pasa del aburrimiento a la boca abierta.
3. Último marciano: fanfarria (bombillas en cadena, rayos, confeti, arcoíris y una copa de píxeles; la bonificación lleva el marcador a 09990). Dari se sube las gafas con un dedo: destello.
4. Guillermo, picado, mira a Dari, se frota las manos y sonríe chulo a cámara; Dari da un paso atrás y le cede la máquina con la mano abierta.
5. Moneda del bolsillo a la ranura: clin, y aparece una oleada nueva.
6. Guillermo juega con todo el cuerpo: palanca a tirones, botón aporreado, saltos, lengua fuera, rojo y sudando. Acierta de chiripa cinco marcianos (00050) y las bombas le quitan las tres vidas; Dari hace muecas y sube la ceja.
7. Fin de partida: **una calavera de píxeles** parpadea en rojo; Guillermo se queda congelado de horror.
8. Rabia: vena en la frente, zarandea la palanca y la máquina se balancea… **¡crac!** La palanca se le queda en la mano; chispazo, tornillos por el suelo y en la consola queda el muñón con el muelle botando. A Dari se le tuercen las gafas.
9. Guillermo mira la palanca, mira a cámara con cara de culpa y mira a Dari, que le mira sin pestañear.
10. Se la pasa a la otra mano, la esconde despacito detrás de la espalda (la bola roja asoma junto al culo), mete la otra mano en el bolsillo y silba mirando al techo.
11. Dari mira el muñón (el muelle da otro boing), le mira a él, sube una ceja y se recoloca las gafas: destello a cámara.
12. Negro.

![Fotogramas de 00055](vista%20previa/00055%20Guillermo%20y%20Dari%20-%20la%20maquina%20recreativa%20-%20fotogramas.png)

### 00056 · Guillermo y Dari · La pizza

1. Negro.
2. Pizzería de noche: horno de leña encendido, baldas con aceite y tomates, guirnalda de bombillas, pizarra con dibujos, ventana con luna, una columna de mármol y la barra al fondo. En la mesita alta, una pizza recién hecha entre los dos.
3. Se relamen y se miran de reojo.
4. Cogen una porción a la vez, tiran, y entre las dos puntas sale **un hilo de queso**.
5. Se miran; nadie suelta. Echan a andar hacia atrás cada uno por su lado y el hilo se estira por toda la pizzería (la cámara se abre).
6. Dari se da con la espalda en la columna, la rodea por delante y el hilo se queda enganchado.
7. Desde las dos puntas del local intentan cortarlo a mordiscos; el queso aguanta.
8. El hilo se suelta de la columna (deja su mancha) y, **como una goma, los arrastra** por la boca hasta juntarlos cara a cara. Las porciones caen al suelo.
9. El hilo les da tres vueltas y les deja los brazos pegados. Pausa: se miran.
10. Sorben el hilo desde cada punta, a tirones, hasta que se tocan las narices.
11. A Dari se le empañan las gafas y los dos se ponen colorados.
12. Negro.

![Fotogramas de 00056](vista%20previa/00056%20Guillermo%20y%20Dari%20-%20la%20pizza%20-%20fotogramas.png)

### 00057 · Guillermo y Dari · El dominó

1. Negro.
2. Bar de barrio de noche (azulejos, jamones, botellero, caña de Dari): Guillermo y Dari admiran su fila de 36 fichas que serpentea por la barra, sube una rampita y acaba en un balancín con una campanita; Guillermo levanta el pulgar y a Dari le brillan las gafas.
3. A Guillermo le pica la nariz: «ah… ah…», la cabeza hacia atrás.
4. Dari lo ve y, sin decir nada, agita las dos manos: «¡no, no, no!».
5. Guillermo se aguanta con el dedo bajo la nariz; alivio de los dos.
6. Vuelve el picor, más fuerte… **¡achís!** La ráfaga tumba la primera ficha; Dari se queda helado con las manos arriba y Guillermo se tapa la boca.
7. **La cadena funciona:** la cámara sigue a la ficha que cae, que da la vuelta delante de Dari (se agacha a mirarla) y vuelve hacia Guillermo, que se muerde el puño.
8. Sube la rampa cada vez más despacio; la última ficha, negra, se tambalea, se queda en el filo… y cae sobre el balancín.
9. La campanita sale volando, sonando y dando vueltas, y cae boca abajo sobre la cabeza de Guillermo: ¡dong!, estrellitas; se le queda puesta como un sombrero.
10. Guillermo, mareado (ojos en espiral), acaba sonriendo y levanta el pulgar (la campanita vuelve a sonar); Dari aplaude.
11. Negro.

![Fotogramas de 00057](vista%20previa/00057%20Guillermo%20y%20Dari%20-%20el%20domino%20-%20fotogramas.png)

### 00058 · Guillermo y Dari · Las palomitas

1. Negro.
2. Sala de cine a oscuras, con la luz azulada de la pantalla parpadeando en las caras. Dari come palomitas de una en una; Guillermo se embute un puñado.
3. La peli se pone oscura y roja. Guillermo mete la mano en el cubo muy despacio, sudando.
4. **Susto:** fogonazo. Guillermo pega un bote, el cubo brinca y las palomitas salen disparadas por el aire.
5. Lluvia de palomitas: se le quedan en el pelo a los dos y caen en las butacas de delante. Dari ni pestañea y atrapa una con la boca.
6. Guillermo, agarrado a los reposabrazos, tiembla. Dari le ofrece una palomita, él dice que no con la cabeza y Dari se la come.
7. **Segundo susto:** Guillermo se tira de cabeza **a la capucha de Dari**, que se hincha; solo le asoman las piernas, pataleando.
8. Dari sigue comiendo con la pantalla reflejada en las gafas. Llega otro destello y las piernas se agitan; Dari mira a cámara y levanta una ceja.
9. Negro.

![Fotogramas de 00058](vista%20previa/00058%20Guillermo%20y%20Dari%20-%20las%20palomitas%20-%20fotogramas.png)

### 00059 · Guillermo y Dari · El abrigo

1. Negro.
2. Noche helada a la puerta del bar y nevando. Guillermo, en camiseta, tirita abrazado a sí mismo. Dari, tan tranquilo, se sube la cremallera de la parka hasta la barbilla.
3. Dari se pone la capucha, que le pasa por encima de los rizos, y tira del cordón: un tirón, dos, tres… hasta que **solo le asoman las gafas y el bigote**, con los cordones colgando.
4. Guillermo, azulado y castañeteando, se hace el valiente con los brazos en jarras y una sonrisa forzada.
5. Una ráfaga de viento lo deja tieso: más azul, con un montón de nieve en el pelo y **un carámbano en la nariz** («tink»).
6. Le pone ojitos de pena a Dari con las manos juntas. Dari le mira de reojo… y suspira con una nube de vaho.
7. Dari se baja la cremallera y abre la parka de par en par como una tienda de campaña: forro rojo acolchado y calorcito.
8. A Guillermo se le iluminan los ojos, coge impulso y **se tira dentro**.
9. La parka se cierra a su alrededor, Guillermo se da la vuelta y la cremallera sube de golpe: **dos cabezas asoman de un solo abrigo** estirado a reventar.
10. Guillermo se descongela: pasa de azul a mofletes rosas y le sale vapor del pelo. El carámbano se suelta y se clava en la nieve. Dari sonríe bajo el bigote.
11. Se van juntos hacia la izquierda como un bicho de cuatro patas, con las mangas vacías bailando. En la acera quedan las huellas y el carámbano.
12. Negro.

![Fotogramas de 00059](vista%20previa/00059%20Guillermo%20y%20Dari%20-%20el%20abrigo%20-%20fotogramas.png)

### 00060 · Guillermo y Dari · El yoyó

1. Negro.
2. Azotea al atardecer: sol enorme tras los edificios, depósito de agua, guirnalda de bombillas, murete de ladrillo y suelo de barro.
3. Dari lanza su yoyó rojo y lo pasea por el suelo («pasear al perro») hasta el zapato de Guillermo, que levanta la punta del pie.
4. Vuelta al mundo: dos círculos enormes sin mirar el yoyó; Guillermo se echa atrás.
5. Cuna de cuerda entre las dos manos, el yoyó se mece dentro; a Dari le brillan las gafas.
6. Guillermo pide probar; Dari se lo lanza y él lo caza.
7. Mira chulo a cámara y lo deja dormido abajo, zumbando, orgulloso.
8. Vuelta al mundo con demasiada fuerza: cada vez más rápido.
9. La cuerda se le engancha y **el yoyó le ata el cuello, los brazos y las piernas**; se le queda en la barriga como el lazo de un paquete.
10. Mira a cámara resignado, da dos saltitos atado hacia Dari, se tambalea y cae de espaldas tieso como un tablón.
11. Dari se agacha y le quita la punta suelta de la cuerda del zapato.
12. Tira: **Guillermo se levanta girando como una peonza** mientras la cuerda se desenrolla.
13. El yoyó sale disparado y vuelve a la mano de Dari, que lo caza sin mirar.
14. Guillermo, mareado, con ojos en espiral y estrellitas; a Dari le brillan las gafas.
15. Negro.

![Fotogramas de 00060](vista%20previa/00060%20Guillermo%20y%20Dari%20-%20el%20yoyo%20-%20fotogramas.png)

### 00061 · Guillermo y Deivi · El monopatín

1. Negro.
2. Rincón de skate a la puerta del bar, al atardecer (fachada con neón de jarra, muro liso sin pintadas, farola, conos y una rampa): Guillermo espera con las manos en los bolsillos; Deivi aparece rodando por la plataforma y se deja caer por la rampa.
3. Deivi hace un ollie limpio y un **kickflip** (la tabla gira sobre su eje: lija, canto, dibujo) y aterriza; frena pisando la cola, la tabla salta sola hasta su mano y guiña a cámara. Guillermo, boquiabierto, aplaude.
4. Guillermo junta las manos y le suplica con ojos de cachorro; Deivi asiente, se aparta un paso y le lanza la tabla, que cae a sus pies (¡clac!); luego le invita con la mano.
5. Guillermo se frota las manos, mira a cámara muy chulo y pone un pie encima… **la tabla sale disparada** (Deivi la salta sin sacar las manos de los bolsillos) y Guillermo se queda **tumbado en el aire**, en horizontal, mirando a cámara.
6. Cae de espaldas (¡pum!) y suspira aliviado… pero la tabla ha subido la rampa, se tambalea en el borde y vuelve: Deivi la vuelve a saltar, Guillermo levanta la cabeza y la ve llegar.
7. La tabla choca con sus zapatillas, sale volando dando una vuelta y **le cae en la barriga**: ¡boing!, ojos en espiral y estrellitas. Deivi hace una mueca y se ríe tapándose la boca.
8. Deivi se acerca; Guillermo se incorpora con la tabla en el regazo, Deivi le tiende la mano, se la agarra y tira de él; guiño a cámara.
9. Negro.

![Fotogramas de 00061](vista%20previa/00061%20Guillermo%20y%20Deivi%20-%20el%20monopatin%20-%20fotogramas.png)

### 00062 · Guillermo y Deivi · El robot

1. Negro.
2. Pista retro: sol de neón con franjas, rejilla en el suelo y ecualizadores que saltan a 115 pulsaciones por minuto.
3. Deivi «se enciende» (abre los ojos con un destello) y baila el robot perfecto: marioneta, caja, señala, zigzag, con tics de cabeza en cada golpe.
4. Dos ondas le recorren los brazos del hombro al codo y a la muñeca; luego señala a Guillermo: te toca.
5. Guillermo saca las manos de los bolsillos y le copia: la primera le sale, pero cada postura va más a tirones y le crujen los codos y el cuello (rayitas, zigzag y chispas).
6. Al intentar la onda se le atasca en el codo y se queda bloqueado en una postura rarísima, con las rodillas dobladas, temblando y crujiendo.
7. Deivi piensa, se le enciende una bombilla, saca una aceitera roja del bolsillo y se acerca.
8. Le engrasa a chorritos los codos y las rodillas; de cada junta caen gotas al suelo (gota, gota).
9. Guillermo parpadea y se desbloquea con una onda líquida que le recorre todo el cuerpo; se mira las manos, sorprendido.
10. Sigue bailando suavísimo; Deivi guarda la aceitera y se une al baile.
11. En el último golpe los dos se señalan a la vez, ya como dos robots perfectos.
12. Negro.

![Fotogramas de 00062](vista%20previa/00062%20Guillermo%20y%20Deivi%20-%20el%20robot%20-%20fotogramas.png)

### 00063 · Guillermo y Deivi · El balón

1. Negro.
2. A la puerta del bar, al atardecer (fachada ocre, zócalo de azulejos, ventana con toldo, farol de hierro, esquina de piedra). Un balón en la acera; Deivi mete la puntera debajo y lo levanta.
3. Con las manos en los bolsillos hace toques: empeine, empeine, rodilla, cabeza, hombro… y lo caza en la nuca, doblado, mirando de reojo a Guillermo, que se queda boquiabierto.
4. Guillermo pone cara de «bah», se recoloca los hombros y le pide el balón con la mano.
5. Deivi, con un golpe de riñones, hace saltar el balón de la nuca, se endereza y se lo pasa de cabeza.
6. Guillermo, con la lengua fuera, lo recibe con el empeine… y le sale disparado a la cara: ¡pum!, se le queda la marca roja.
7. Aturdido, levanta la rodilla: el balón sube al farol (se balancea y se le raja el cristal), le pasa rozando el pelo, rebota en la esquina de piedra (deja la marca y caen migas) y vuelve para darle un coscorrón.
8. Tres botecitos sobre el pelo de punta… y el balón se queda allí, en equilibrio. Guillermo se congela con los ojos arriba y los brazos abiertos, sudando; la cámara se acerca.
9. Deivi alucina, saca las manos de los bolsillos y aplaude despacio.
10. Guillermo mira a cámara orgulloso, el balón se le va un pelo, lo recupera con la cabeza y vuelve a mirar a cámara con un guiño; Deivi también mira a cámara.
11. Negro.

![Fotogramas de 00063](vista%20previa/00063%20Guillermo%20y%20Deivi%20-%20el%20balon%20-%20fotogramas.png)

### 00064 · Guillermo y Deivi · El castillo de naipes

1. Negro.
2. Un rincón de bar de juegos con una mesa alta de tapete verde bajo una lámpara; el primer piso del castillo de naipes ya está hecho.
3. Deivi, delicadísimo y con el meñique en alto, coge cartas del mazo; cada una se pliega en su mano y se posa justo en su hueco: segundo piso y luego el tercero.
4. Guillermo, con el as de picas colgando de la mano, se encoge cada vez que una carta se posa.
5. Deivi suelta el aire y le cede el honor con la palma abierta.
6. Guillermo, con la lengua fuera y un ojo guiñado, gira la carta, la baja temblando y la deja plana en lo alto.
7. El castillo se bambolea… y aguanta; los dos tienen los mofletes hinchados.
8. ¡Sí! Se chocan los cinco justo encima: las palmas se encuentran y el golpe de aire baja en ondas.
9. El castillo se desmorona en cascada: las cartas revolotean y se quedan en la mesa y en el suelo; la del tejado aterriza en la cabeza de Guillermo.
10. Se miran, aún con las manos juntas, y las bajan.
11. Deivi se saca un mazo nuevo del bolsillo y levanta una ceja; a Guillermo se le ilumina la cara y Deivi guiña a cámara.
12. Negro.

![Fotogramas de 00064](vista%20previa/00064%20Guillermo%20y%20Deivi%20-%20el%20castillo%20de%20naipes%20-%20fotogramas.png)

### 00065 · Guillermo y Deivi · Las sillas con ruedas

1. Negro.
2. Trastienda del bar: pared mostaza con azulejos verdes, suelo de cemento, una cinta a cuadros pegada en el suelo como meta y una torre de cajas de cartón altísima. Guillermo y Deivi, cada uno en una silla de oficina con ruedas, se miden: Guillermo pica con las cejas y Deivi brinda con su refresco y da un sorbo.
3. Se inclinan y ¡salen! Deivi se impulsa con los talones, sin prisa, y se desliza recto hasta la meta, sorbiendo sin derramar ni una gota.
4. Guillermo patalea como loco, la silla se le pone a girar y da vueltas como una peonza por media sala, con los brazos en cruz.
5. Deivi frena con un giro elegante de la silla y se queda mirando. Guillermo, mareado, con los ojos en espiral y estrellitas, sacude la cabeza.
6. Muy decidido, se agarra al asiento, recoge los pies y empuja con todas sus fuerzas… y sale disparado hacia atrás, con cara de horror.
7. Se estampa de espaldas contra la torre: la silla se vuelca y las cajas le caen encima una tras otra entre una nube de polvo.
8. Solo le asoman las piernas, que patalean de vez en cuando, y una rueda de la silla que sigue girando en el aire.
9. Deivi pasa rodando despacito a su lado, sorbe hasta el fondo del vaso vacío y guiña un ojo a cámara.
10. Negro.

![Fotogramas de 00065](vista%20previa/00065%20Guillermo%20y%20Deivi%20-%20las%20sillas%20con%20ruedas%20-%20fotogramas.png)

### 00066 · Guillermo y Deivi · El globo de helio

1. Negro.
2. Salón de fiestas: pared verde azulado con lunares, banderines, serpentinas, una mesa con tarta, regalos y, entre los dos, una bombona de helio con un ramo de globos. Guillermo y Deivi, con las manos en los bolsillos; Deivi le mira con picardía.
3. Deivi da un paso, coge el globo amarillo del ramo, se lleva el cuello del globo a los labios y aspira: el globo se encoge y a él se le hincha el pecho.
4. Lo suelta (vuelve al ramo) y «habla»: de su boca salen notitas agudas que suben bailando. Guillermo se parte de risa, señalándole, con la mano en la barriga y lágrimas.
5. Guillermo levanta el dedo («¡me toca!»), coge el globo rojo, lo arranca de la válvula y, con el globo junto a la cara, mira a cámara muy chulo.
6. Se lo lleva a la boca y se lo traga entero: el globo se vacía mientras a él se le hinchan los carrillos, el pecho y la barriga hasta quedar redondo. Deivi pone cara de «oh, oh».
7. Intenta decir algo y le sale un «pip». Se pone de puntillas, despega, suelta el pellejo del globo (que cae revoloteando al suelo) y sube despacio, pataleando y braceando.
8. Se da con la cabeza en el techo, entre los globos que ya estaban allí, y se queda flotando, cabeceando contra él. Deivi se ríe tapándose la boca.
9. Deivi tiene una idea: se pone de puntillas bajo él, le agarra el tobillo de un brinco y tira hacia abajo como de un globo; Guillermo se queda tumbado de lado en el aire.
10. Deivi saca del bolsillo una cinta rizada, se la ata al tobillo con un lazo y vuelve a meter esa mano en el bolsillo.
11. Suelta el tobillo: Guillermo sube hasta que la cinta se tensa y se queda flotando, meciéndose, atado a la mano de Deivi. Deivi guiña un ojo a cámara y a Guillermo se le escapa otro «pip».
12. Negro.

![Fotogramas de 00066](vista%20previa/00066%20Guillermo%20y%20Deivi%20-%20el%20globo%20de%20helio%20-%20fotogramas.png)

### 00067 · Guillermo y Deivi · La guerra de almohadas

1. Negro.
2. Salón de noche con ambiente de fiesta de pijamas (papel pintado mostaza, ventana con luna, lámpara de pie, guirnalda de bombillitas, sofá de terciopelo, palomitas, cojines y alfombra granate): Guillermo, con su almohada azul de lunares, y Deivi, con la suya verde de rayas al hombro y la otra mano en el bolsillo, se miden dando saltitos; Deivi le reta con la barbilla.
3. Deivi da un paso y le atiza en la cabeza: ¡puf!, se escapan cuatro plumas. Guillermo sacude la cabeza y se enfada (vena).
4. Guillermo prepara un golpe enorme: almohada en alto por detrás, rodilla arriba, temblando de rabia. Deivi pone cara de susto.
5. La suelta con todas sus fuerzas… Deivi se agacha sin sacar la mano del bolsillo y la almohada pasa silbando por encima.
6. La inercia hace **girar a Guillermo sobre sí mismo** y, al frenar, la almohada sigue de largo, da la vuelta y **le cae en la cabeza**: ¡zas!
7. **Revienta**: explosión de plumas que bajan despacio, balanceándose; Guillermo queda cubierto como una gallina (cresta de plumas en el pelo y plumas en los hombros) con la funda rota y vacía en la mano.
8. Deivi lanza su almohada al sofá, le señala y se dobla de risa; Guillermo mira a cámara muy serio y cabecea como una gallina.
9. Una última pluma baja haciendo eses y se le posa en la nariz: bizquea, le pica… ah… ah… ah… ¡**achís**!: estornuda una nube de plumas que va directa a la cara de Deivi, que se había acercado a mirar.
10. Deivi, emplumado, hincha los mofletes y sopla la pluma del labio; Guillermo se limpia la nariz con la muñeca, sonríe a cámara y guiña.
11. Negro.

![Fotogramas de 00067](vista%20previa/00067%20Guillermo%20y%20Deivi%20-%20la%20guerra%20de%20almohadas%20-%20fotogramas.png)

### 00068 · Guillermo y Deivi · Las cosquillas

1. Negro.
2. Salón de casa por la noche (papel pintado verde azulado, sofá de terciopelo teja con cojines, lámpara de pie encendida, ventana con luna, mesita con planta y alfombra de flecos); la tele, fuera de cuadro, les ilumina de azul. Guillermo zapea repantigado; Deivi, sin apartar la vista de la pantalla, busca el mando a tientas… y le clava el dedo en el costado.
3. Guillermo pega un bote (rayitas de susto) y el mando sale volando hasta la alfombra. Deivi le mira, estira el dedo, se lo mira con una ceja levantada y, muy despacio, vuelve a tocarle: otro respingo y una risita.
4. Guillermo se tapa el costado y le suplica que no con la cabeza; Deivi mira a cámara con sonrisa de pillo, sube y baja las cejas y menea los dedos. Guillermo, asustado, levanta las palmas.
5. Deivi se lanza de rodillas sobre el sofá y le ataca: Guillermo se parte de risa (ojos apretados, lágrimas que saltan, boca abierta), se retuerce, patalea y aporrea el cojín.
6. Se escurre hasta el borde y cae de espaldas a la alfombra (Deivi se lleva las manos a la boca); allí sigue revolcándose y pataleando mientras Deivi, inclinado desde el sofá, le hace cosquillas al aire.
7. Deivi para, levanta las manos y se deja caer en su sitio. Guillermo se calma, jadea, se seca una lágrima, se incorpora y se queda de pie con las manos en las rodillas, sudando.
8. Deivi levanta un dedo y lo menea… Guillermo se queda helado, se da media vuelta y sale disparado de cuadro (rayas de velocidad y una nube de polvo).
9. Deivi se ríe solo, tapándose la boca, y guiña un ojo a cámara.
10. Negro.

![Fotogramas de 00068](vista%20previa/00068%20Guillermo%20y%20Deivi%20-%20las%20cosquillas%20-%20fotogramas.png)

### 00069 · Guillermo y Deivi · La momia

1. Negro.
2. Noche de Halloween a la puerta del bar: luna llena, cielo morado, murciélagos a lo lejos, un árbol pelado, telarañas, una araña que sube y baja de su hilo, una guirnalda de bombillas naranjas y moradas, calabazas con la vela temblando y niebla baja.
3. Deivi lanza al aire un rollo de papel higiénico, lo caza y se lo enseña a Guillermo moviendo las cejas; Guillermo lo pilla al vuelo y abre los brazos de un saltito, encantado.
4. Deivi se acerca, se agacha y lanza la punta del papel, que se enrosca en el tobillo de Guillermo; con el dedo le hace «¡gira!».
5. Guillermo gira como una peonza (feliz, con los ojos cerrados) y Deivi, levantándose poco a poco, le envuelve de los zapatos a la cabeza; el rollo adelgaza hasta quedarse en el cartón.
6. Deivi rasga el papel y tira el cartón hacia atrás. Guillermo para: es una momia con tupé de papel y solo se le ven los ojos por una rendija; la punta suelta se queda en el suelo, saliendo del tobillo.
7. Se mira, levanta los brazos rectos y, muy orgulloso, avanza hacia la cámara a pasos tiesos para asustar (la cámara se acerca); Deivi se hace el asustado.
8. Con un paso pisa su propia punta suelta (cruje el papel); con el siguiente la tira se tensa y le deja la pierna clavada en el aire.
9. Mira abajo… y empieza a girar sobre el pie que la pisa: el papel se desenrolla de los pies a la cabeza y se amontona a sus pies en bucles; Deivi se muere de risa tapándose la boca.
10. Salen volando los últimos trocitos de la cabeza: Guillermo, otra vez con su ropa, se tambalea mareado, con los ojos en espiral y estrellitas.
11. Deivi se agacha sobre el montón y lo recoge en una polvareda de papel; se levanta con un rollo gigante y lo sube por encima de la cabeza, moviendo las cejas.
12. Guillermo se despeja, ve el rollo gigante y mira a cámara aterrado, con las manos en la cara; Deivi le guiña un ojo a la cámara.
13. Negro.

![Fotogramas de 00069](vista%20previa/00069%20Guillermo%20y%20Deivi%20-%20la%20momia%20-%20fotogramas.png)

### 00070 · Guillermo y Deivi · La realidad virtual

1. Negro.
2. Salón de noche con luz de neón: pared morada con una tira de LED, una tele en la pared con un videojuego retro, ventana con la ciudad, alfombra redonda y una lámpara colgante de pantalla metálica. Deivi, repantingado en su sillón mostaza, agita dos mandos de realidad virtual con lucecitas.
3. Guillermo saca las manos de los bolsillos, da un paso y se los coge, encantado; Deivi recoge del regazo unas gafas de realidad virtual enormes y se las enseña.
4. Guillermo se da la vuelta y se agacha delante del sillón; Deivi le baja las gafas por encima de la cabeza y se las encaja desde atrás (¡clic!), con dos toquecitos en la cabeza. Las gafas se encienden con una banda de colores y Guillermo se levanta de un salto.
5. Juega: esquiva un cubo, lanza puñetazos a unas dianas que estallan en la tele, se agacha, retrocede y suelta un revés que le pasa a Deivi rozando el pelo; Deivi se echa atrás con las manos en alto.
6. Da un paso, carga y suelta un gancho de abajo arriba al jefe del juego… y le da de lleno a la lámpara, que sale disparada.
7. Celebra con el puño en alto mientras la lámpara se va… y vuelve: ¡bonk! en toda la frente (estrellas, chichón y gafas torcidas). Deivi se parte de risa.
8. Guillermo sacude la cabeza, se recoloca las gafas, se agazapa y salta hacia atrás para esquivar un láser… y aterriza sentado en el regazo de Deivi, con las piernas en alto; el cojín se hunde y la tele se va a ruido y se queda en pausa.
9. Deivi, sin aire, le tira de la correa por detrás y le sube las gafas a la frente: Guillermo parpadea deslumbrado, con las marcas rojas de las gafas alrededor de los ojos, mira a todos lados, se gira hacia Deivi y mira a cámara sin entender nada; Deivi, sin soltar la correa, guiña un ojo.
10. Negro.

![Fotogramas de 00070](vista%20previa/00070%20Guillermo%20y%20Deivi%20-%20la%20realidad%20virtual%20-%20fotogramas.png)

### 00071 · Guillermo y Gabacho · El penalti

1. Negro.
2. Patio trasero del bar a la hora azul: tapia de ladrillo, la puerta de atrás con su aplique, cajas de cerveza, un barril, una guirnalda de bombillas y, sobre un trozo de césped artificial, una portería pequeñita (más baja que el portero) con la red abombada.
3. Gabacho, de portero, calienta muy teatral: círculos con los brazos en cruz, zancadas con las manos en la rodilla, sacude brazos y piernas, dos palmadas… y se pone en guardia.
4. Guillermo suelta el balón con mimo, lo para con la suela y lo coloca en el punto rodándolo a un lado y a otro; levanta el pie despacito («quieto, quieto…») y asiente.
5. Retrocede contando los pasos con los dedos (uno, dos, tres), mide la portería, decide que no es bastante y recula hasta salir de plano por la izquierda.
6. Gabacho se queda solo: se asoma con los brazos en jarras, mira a cámara y se encoge de hombros («bof»). De pronto, una polvareda: se pone en guardia de un brinco.
7. Guillermo vuelve a toda carrera, frena derrapando y hace unos pasitos de bailarín con amagos que Gabacho sigue con el cuerpo.
8. Arma la pierna… y la puntera se clava en el césped: ¡crac!, terrones, polvo y una marca que se queda. El balón, apenas rozado, rueda despacito, despacito, y se para justo delante de la bota de Gabacho.
9. Guillermo se queda congelado, se pone rojo, se agarra la pierna y salta a la pata coja llorando a chorros mientras a la bota le late la puntera. Gabacho, con los brazos en jarras, mira a cámara aburrido.
10. Gabacho, sin agacharse, se sube el balón con la puntera a las manos, se lo pone en la cadera y bosteza tapándose la boca.
11. Lo lanza hacia arriba y lo recoge en la punta del índice, donde lo hace girar; guiña un ojo a cámara. Guillermo, a la pata coja, mira a cámara haciendo pucheros.
12. Negro.

![Fotogramas de 00071](vista%20previa/00071%20Guillermo%20y%20Gabacho%20-%20el%20penalti%20-%20fotogramas.png)

### 00072 · Guillermo y Gabacho · El cruasán

1. Negro.
2. Terraza de un café por la mañana (fachada crema, toldo de rayas verdes, escaparate con la barra y la cafetera, geranios, farol, pizarra con dibujos de tiza y rayos de sol en diagonal): Guillermo y Gabacho, sentados en sillas de mimbre a los lados de una mesita de mármol, cada uno con su café humeante y su cruasán; en medio, una cestita con más cruasanes y un jarroncito con una margarita.
3. Gabacho coge su cruasán con el meñique en alto, lo admira, lo moja un instante en el café (sale con la punta oscura y gotea) y le da un mordisco con los ojos cerrados, en la gloria: migas, corazoncitos y un pie que se balancea de gusto.
4. Guillermo, impresionado, le imita: meñique en alto, mirada de «mira esto»… lo moja y lo deja dentro mientras mira a cámara muy chulo, con las cejas bailando y burbujitas en la taza. Gabacho levanta la mano: ¡para!
5. Guillermo lo saca: está empapado, se dobla y cuelga, el cuello se estira con hilos de masa… y la punta se rompe y cae en la taza: ¡plof!, corona de café y gotas que le salpican la cara (las manchas se quedan y una gotea).
6. Mirada muy seria a cámara. Deja el muñón en el plato, pesca el trozo con dos dedos y se quema: ¡ay!, vapor, lagrimitas y la mano temblando; se sopla los dedos con los mofletes hinchados.
7. Gabacho coge un cruasán nuevo de la cesta y se lo ofrece con una pequeña reverencia; Guillermo lo coge por el otro cuerno.
8. Lo mira, mira la taza con desconfianza, mira a cámara… y se lo mete en la boca tal cual, en seco: un bocado enorme, los dos mofletes llenos, masticando muy digno entre migas. Gabacho se ríe dando palmaditas en la mesa.
9. Negro.

![Fotogramas de 00072](vista%20previa/00072%20Guillermo%20y%20Gabacho%20-%20el%20croissant%20-%20fotogramas.png)

### 00073 · Guillermo y Gabacho · La chilena

1. Negro.
2. Una placita tranquila por la tarde, con aire parisino: fachadas de piedra con balcones de hierro y tejados de zinc, dos plátanos, una farola, un banco verde, una mesita de café y, al otro lado de la calle, una papelera verde con tapa basculante. Guillermo espera con un pie encima de su balón; Gabacho le levanta una ceja.
3. Gabacho saca las manos, levanta su balón de puntera y hace toques: empeine, rodilla… y lo manda bien alto.
4. **Cámara lenta**: se agacha, salta, se tumba hacia atrás en el aire con las piernas en tijera (rastro de fantasmas y líneas de foco) y… ¡**chilena**!
5. El tiempo vuelve de golpe: el balón cruza la calle en un arco perfecto y entra en la papelera (la tapa bascula, sale una nubecilla y una hoja seca). Gabacho cae agachado, se levanta y abre los brazos: «voilà».
6. Guillermo, boquiabierto, mira a cámara, se pica (vena) y Gabacho le cede el turno con la mano.
7. Guillermo rueda su balón hacia atrás con la suela y lo levanta de cuchara… tan fuerte que se va al cielo. Mira a cámara muy chulo y salta.
8. Se tumba solo a medias y se queda **suspendido en horizontal**, mirando a cámara y buscando el balón con la mirada… y cae de espaldas: ¡pum!
9. Suspira aliviado… hasta que ve llegar el balón del cielo: le cae en la barriga (¡boing!), rebota y le cae en la cara, donde se queda un momento antes de rodar a los adoquines (le deja la marca roja).
10. Ojos en espiral y estrellitas; Guillermo levanta la mano, flojito. Gabacho aplaude despacio y mira a cámara.
11. Negro.

![Fotogramas de 00073](vista%20previa/00073%20Guillermo%20y%20Gabacho%20-%20la%20chilena%20-%20fotogramas.png)

### 00074 · Guillermo y Gabacho · El queso

1. Negro.
2. Rincón de una quesería por la tarde: pared encalada con zócalo verde, pizarra con dibujitos de tiza (una cuña de queso, una vaca, estrellas), un cuadrito con una vaca en el prado, lámpara de esmalte, estantería de quesos con embutidos colgados sobre el mostrador y una silla de café de madera curvada. Gabacho sostiene una cajita redonda de madera como si fuera una joya y mira a cámara muy orgulloso; Guillermo espera con las manos en los bolsillos.
3. Gabacho levanta la tapa: ¡plop!, sale un tufo verde y dos moscas se ponen a dar vueltas. Lanza la tapa hacia atrás sin mirar y cae en el mostrador.
4. Se abanica el olor hacia la nariz, se acerca la caja y aspira con los ojos cerrados; se mece en éxtasis, con la mano en el corazón y corazoncitos.
5. Se la ofrece a Guillermo, que se acerca curioso y olfatea (snif, snif, ¡sniiif!): el tufo le entra por la nariz.
6. Se queda tieso: el pelo de punta se le marchita y le cae lacio, le lloran los ojos, se pone verde y se le hinchan los carrillos; se tapa la boca mientras la peste le da vueltas a la cabeza.
7. Retrocede tambaleándose, con los ojos en espiral, y se desmaya en la silla: despatarrado, la cabeza hacia atrás, los ojos en X y la lengua fuera. Una mosca le ronda la cabeza.
8. Gabacho se encoge de hombros («bof»), se pasa la caja a la otra mano, pellizca un trocito de queso, se acerca y se lo pasea por debajo de la nariz.
9. Guillermo se despierta de golpe y salta de la silla: el pelo se le vuelve a poner de punta y le vuelve el color. Ve el queso, se da la vuelta y sale disparado de cuadro; la silla gira con el rebufo.
10. Gabacho se encoge de hombros otra vez, deja caer el trocito en la boca, lo saborea con corazoncitos, hace el beso de chef y guiña un ojo a cámara.
11. Negro.

![Fotogramas de 00074](vista%20previa/00074%20Guillermo%20y%20Gabacho%20-%20el%20queso%20-%20fotogramas.png)

### 00075 · Guillermo y Gabacho · El mando

1. Negro.
2. Salón de un piso pequeño, de noche: pared verde salvia con zócalo de madera, una lámina con un balón, una balda con una copa, lámpara de pie, mesita con un cuenco de patatas y un sofá de pana mostaza. A la derecha, una tele plana sobre un mueble bajo, vista de tres cuartos, con el partido (césped a franjas y puntitos que corren). Gabacho y Guillermo lo ven sentados; el mando está en el cojín, entre los dos.
3. Los dos miran el mando, se miran con los ojos entornados… y se lanzan: Gabacho lo pilla primero y Guillermo palmea el cojín vacío (¡plaf!).
4. Gabacho, con sonrisa de pillo, se lo pasa a la otra mano y lo sube bien lejos, por detrás de la cabeza. Guillermo se pone rojo, salta al cojín y se gira hacia él.
5. Gabacho se levanta también y le sujeta por la cabeza con el brazo estirado mientras Guillermo da molinetes y brincos sin llegar; Gabacho le saca la lengua.
6. Chulito, se lo enseña de cerca, meneándolo… y Guillermo lo agarra: tira y afloja sobre los cojines, los dos echados hacia atrás, el mando temblando, dientes apretados, caras rojas y sudor.
7. El mando se escurre y sale disparado hacia arriba dando vueltas; los dos trastabillan, lo ven, saltan a por él de cabeza… y se dan un cabezazo: ¡bonk!, estrellas y chichones.
8. Caen en montón: Guillermo tumbado boca arriba con la cabeza contra el brazo del sofá y Gabacho sentado encima. Siguen peleando: Gabacho le aparta la cara y Guillermo le agarra la camiseta.
9. El mando cae en el brazo del sofá, se aprieta un botón (clic) y la tele cambia de canal: estática… y dibujos animados, con una pelota roja que bota entre colinas, un sol sonriente y notas musicales.
10. Se quedan congelados, miran la pantalla y se sueltan despacio; embobados, ladean la cabeza a la vez al ritmo de la pelota.
11. Miran a cámara a la vez: Gabacho guiña un ojo y levanta el pulgar, y vuelven a la tele.
12. Negro.

![Fotogramas de 00075](vista%20previa/00075%20Guillermo%20y%20Gabacho%20-%20el%20pique%20del%20mando%20-%20fotogramas.png)

### 00076 · Guillermo y Gabacho · La boina

1. Negro.
2. Un rincón de Montmartre a la hora dorada: fachada de piedra con balcones de hierro y geranios, el café con su toldo de rayas, una mesita de mármol con su silla de bistró, una farola, la escalinata con su farol, un plátano dorado, adoquines, el caballete de Gabacho con un lienzo de manchas de colores y dos palomas picoteando.
3. Gabacho lanza al aire una boina negra, que da una vuelta y le cae en los rizos; se la ladea con dos dedos, muy satisfecho.
4. Pose de pintor: brazo estirado, pincel en vertical y pulgar arriba, un ojo cerrado, midiendo a Guillermo, que saca pecho y posa con la mano en la cadera. Después se retuerce un bigote imaginario.
5. Guillermo señala la boina, junta las manos y le pone ojitos.
6. Gabacho se ríe, se pone el pincel entre los dientes, se saca otra boina del bolsillo y la abre de un sacudón. Guillermo hinca una rodilla, muy solemne, como si le fueran a armar caballero.
7. Gabacho se acerca y se la pone… pero los pinchos del pelo la atraviesan (¡pic, pic, pic!) y se queda pinchada en lo alto, como un gorrito en un erizo.
8. Guillermo se levanta orgullosísimo y se la presenta a cámara; Gabacho aguanta la risa con los mofletes hinchados.
9. Guillermo la nota, echa la cabeza atrás y la baja tirando del borde: los pinchos asoman todavía más… la suelta y ¡boing!, la boina sale volando y vuelve a caer pinchada. Gabacho se tapa la boca.
10. Segundo intento, con rabia y con todas sus fuerzas: rojo, temblando, se la hunde hasta las cejas… y ¡BOING!: la boina sale disparada dando vueltas por el aire y aterriza encima de la de Gabacho.
11. Dos boinas apiladas: Gabacho, con el pincel en los dientes, posa orgullosísimo retorciéndose el bigote; Guillermo, sin boina, hace pucheros a cámara.
12. Negro.

![Fotogramas de 00076](vista%20previa/00076%20Guillermo%20y%20Gabacho%20-%20la%20boina%20-%20fotogramas.png)

### 00077 · Guillermo y Gabacho · El karaoke

1. Negro.
2. El escenario pequeño de un bar, de noche: telón de terciopelo granate con bambalina de flecos dorados, tarima de madera, un foco con motas de polvo, un amplificador al fondo, una banqueta con una guitarra, una pantalla de karaoke con barras de colores y, delante, las siluetas de las mesitas con sus velas.
3. Gabacho canta una balada en el micro del pie de jirafa: ojos cerrados, mano en el corazón, se mece; de su boca salen notas redondas y suaves.
4. Baja la jirafa y se arrodilla con el brazo abierto, muy dramático.
5. Guillermo entra corriendo por la izquierda y aterriza de un salto («¡tachán!»); Gabacho abre un ojo y se levanta.
6. Guillermo le roba el micro tirando de la jirafa y desafina a pleno pulmón: notas con pinchos, torcidas, que salen disparadas. Gabacho lo recupera; Guillermo se lo vuelve a quitar.
7. Las notas redondas y las de pinchos chocan en el aire entre los dos y revientan como pompas.
8. Se miran mal (vena en la frente), agarran los dos lo alto del pie y tiran: el pie se tambalea a un lado y a otro mientras sudan.
9. Las manos resbalan y salen despedidos hacia atrás, braceando; el pie, suelto, se balancea y cae de lado contra el amplificador, con el micro colgando delante del altavoz.
10. ¡Acople! Ondas de sonido en zigzag, el foco parpadea y la pantalla se llena de nieve: a los dos se les va el pelo hacia atrás y aprietan los ojos tapándose con la mano.
11. Silencio y un hilo de humo: se quedan tiesos, despeinados para siempre.
12. Se miran… y se parten de risa señalándose el pelo.
13. Los dos miran a cámara y Gabacho guiña un ojo.
14. Negro.

![Fotogramas de 00077](vista%20previa/00077%20Guillermo%20y%20Gabacho%20-%20el%20karaoke%20-%20fotogramas.png)

### 00078 · Guillermo y Gabacho · La ola

1. Negro.
2. Un bar de fútbol de noche: barra de madera con grifos de cerveza, estantes de botellas con espejo, bufandas a rayas, banderines, una diana, lámparas verdes y, colgada arriba a la derecha, una tele que solo enseña el verde del campo con puntitos que corren. Una fila de taburetes altos, casi todos vacíos; en dos de ellos, Guillermo (con su pinta) y Gabacho, que apura su cerveza y deja el vaso vacío en la barra.
3. Gabacho empieza él solo una ola: se levanta con los brazos arriba y se sienta. La ola sigue por los taburetes vacíos (rayas que suben, el asiento salta y suelta polvito, como si la hiciera un público invisible), da la vuelta… y muere en Guillermo, que está bebiendo sin enterarse y se queda con bigote de espuma.
4. Gabacho le mira con reproche y le anima con la mano: ¡arriba, arriba! Guillermo asiente con ganas.
5. Segunda ola: da la vuelta otra vez y a Guillermo le pilla mirando la tele; se levanta tarde y sus brazos suben justo cuando bajan los de Gabacho: ¡bonk!, estrella. Se sientan sacudiéndose la mano.
6. Se miran y cuentan con la cabeza: uno, dos, tres (a cada cabezada aparece un puntito entre los dos, y en el tres se encienden).
7. Tercera ola, juntos: Guillermo se levanta tan deprisa que pega un brinco y la pinta le sale disparada de la mano; sube dando vueltas soltando una cinta de cerveza y baja boca abajo con la cerveza por delante…
8. …y cae en el pelo rizado de Gabacho, que sigue con los brazos arriba y los ojos cerrados: ¡chof!, corona de cerveza. El pelo se lo bebe como una esponja: se oscurece, se aplasta, gotea y se queda con un copete de espuma; el vaso rebota por encima de su cabeza y aterriza de pie en la barra (¡clinc!). Guillermo, horrorizado, se tapa la cara.
9. Gabacho, impasible, se sienta y mira a cámara; luego se inclina sobre su vaso vacío y se escurre el pelo con las dos manos: un chorro de cerveza llena el vaso y los rizos vuelven a su sitio de golpe (¡boing!).
10. Brinda hacia Guillermo y se lo bebe con los ojos cerrados, en la gloria: «¡ahh!», bigote de espuma y chispitas.
11. Guillermo, verde, con la mano en la boca, saca la lengua y mira a cámara con asco.
12. Negro.

![Fotogramas de 00078](vista%20previa/00078%20Guillermo%20y%20Gabacho%20-%20la%20ola%20-%20fotogramas.png)

### 00079 · Guillermo y Gabacho · El rizo

1. Negro.
2. Rincón de barbería por la tarde: pared verde botella con filete dorado, zócalo de azulejos blancos, suelo de damero, un pilar alicatado con su toalla de rayas, un reloj sin números, una lámpara de pantalla y el tocador con encimera de mármol, lavabo, frascos sin etiquetas, el bote de los peines y un espejo redondo con marco de latón. Gabacho, sentado en un taburete rojo, se peina los rizos con una púa; Guillermo lo mira con las manos en los bolsillos.
3. Mete la púa, la levanta, la vuelve a meter… y a la tercera se le queda clavada. Tira dos veces y la cabeza se le va detrás; Guillermo aguanta la risa y mira a cámara.
4. Gabacho se encoge de hombros, la deja ahí como un adorno y, muy orgulloso, se guiña en el espejo y se señala.
5. Guillermo va a ayudarle: agarra la púa y tira; Gabacho se agarra a la encimera y el taburete se inclina, pero la púa no sale.
6. Guillermo se enfada (vena), le planta el pie en los riñones y tira con todas sus fuerzas: rojo, temblando, el cuello de Gabacho se estira y los rizos se tensan…
7. ¡Pop!: la púa sale de golpe, con una lluvia de rizos sueltos, y Guillermo sale volando hacia atrás hasta estamparse contra el pilar: se raja un azulejo (cae un trozo al suelo y la grieta se queda) y resbala hasta quedarse sentado, mareado, con los ojos en espiral y estrellitas.
8. La púa sigue en el aire, da la vuelta por todo lo alto como un bumerán (Gabacho la sigue con la mirada) y ¡zas!: se clava en los pinchos de Guillermo.
9. Gabacho se toca el hueco del rizo, saca una púa de repuesto lila del bolsillo y se la clava un poco más arriba, muy satisfecho.
10. Gira el taburete hacia Guillermo: cada uno con su púa clavada, se miran y asienten con aprobación (Guillermo, con el pulgar arriba) y miran a cámara.
11. Negro.

![Fotogramas de 00079](vista%20previa/00079%20Guillermo%20y%20Gabacho%20-%20el%20pelo%20rizado%20-%20fotogramas.png)

### 00080 · Guillermo y Gabacho · La celebración

1. Negro.
2. Un salón-bar de noche con una tarima larguísima y recién encerada: pared granate con zócalo crema, banderines azules, blancos y rojos, una bufanda de rayas colgada, un cuadro con un balón, la tele sobre un mueble bajo, el sofá de terciopelo verde empujado contra la pared, una lámpara de pie y la ventana con la ciudad. Guillermo y Gabacho, de pie y en tensión, miran el partido.
3. ¡Gol! La tele estalla en focos y confeti y el salón se ilumina: los dos saltan con los puños en alto, gritando.
4. Gabacho coge carrerilla y se tira de rodillas: se desliza por la tarima, echado hacia atrás, con los brazos abiertos, y se para justo delante de la cámara rugiendo con los puños apretados (la cámara se acerca). Guillermo, boquiabierto, se acerca a mirar.
5. Guillermo se frota las manos, mira a cámara muy chulo, da dos pasitos y se tira… y se para a los dos palmos. Se queda congelado y mira a cámara muerto de vergüenza (colorado y sudando) mientras Gabacho se parte de risa.
6. Picado (vena), se levanta de un brinco, se da la vuelta y se va corriendo de cuadro para coger carrerilla.
7. Vuelve a toda mecha y se tira: pasa deslizándose por delante de Gabacho, que da un saltito para apartarse, y sigue, y sigue… mira a cámara con cara de pánico y sale de cuadro por la izquierda.
8. ¡Crac! Tiembla todo, entra una polvareda, el cuadro de la pared se descuelga y se queda torcido en el suelo, sale rodando un balón y la tele se queda torcida. Gabacho se encoge y luego se asoma con la mano de visera.
9. Guillermo vuelve a entrar trotando con la camiseta subida por la cabeza, como los futbolistas, los pelos de punta asomando por el cuello y los brazos abiertos. Gabacho le señala muerto de risa, recula… y Guillermo se le da de morros (¡bonk!, estrellitas).
10. Se abrazan y saltan juntos con el puño en alto. Guillermo se baja la camiseta, el pelo le rebota y sonríe a cámara; Gabacho le guiña un ojo a la cámara.
11. Negro.

![Fotogramas de 00080](vista%20previa/00080%20Guillermo%20y%20Gabacho%20-%20la%20celebracion%20-%20fotogramas.png)

### 00081 · Guillermo y Kiriku · Las gafas de sol

1. Negro.
2. Terraza al sol de mediodía junto al mar: cielo azul con un sol que deslumbra (con sus reflejos de lente), una isla con su pueblo blanco y un velero, la balaustrada blanca, buganvilla, un limonero en su maceta, un parasol de rayas turquesa con una mesita y dos limonadas, y suelo de barro. Guillermo y Kiriku entornan los ojos al sol.
3. Kiriku coge las gafas de aviador que lleva colgadas del cuello del polo, las abre de un golpe de muñeca con el brazo estirado y se las pone; echa la cabeza atrás y ¡ting!: un destello en el cristal deslumbra a Guillermo. Se pasa la mano por el pelo y mira a cámara, chulísimo.
4. Guillermo, decidido, saca del bolsillo sus gafas de plástico naranja, las abre, se las pone, se pasa la mano por el pelo y echa la cabeza atrás como Kiriku… y las gafas salen volando dando vueltas.
5. Las bate con una mano, con la otra, dando saltitos, y las caza al vuelo… del revés. Se las pone así (la barra gruesa abajo) y posa orgullosísimo con la mano en la cadera; Kiriku ladea la cabeza.
6. Guillermo nota algo raro: se las quita, las mira con el brazo estirado, les da la vuelta y las lanza al aire para «cazarlas» con la cara… y le caen torcidas en la punta de la nariz.
7. Kiriku se baja las suyas despacio por la patilla y le mira por encima, con la ceja levantada.
8. Guillermo se las sube por la patilla muy seguro, sonríe a cámara… y se le vuelven a resbalar, torcidas; se pone colorado.
9. Kiriku se ríe por lo bajo, se sube las suyas (¡ting!) y los dos miran a cámara.
10. Negro.

![Fotogramas de 00081](vista%20previa/00081%20Guillermo%20y%20Kiriku%20-%20las%20gafas%20de%20sol%20-%20fotogramas.png)

### 00082 · Guillermo y Kiriku · El postureo

1. Negro.
2. Terraza de un local de brunch a media mañana: un muro de flores con unas alas de neón detrás de Kiriku, un aro de luz de influencer, un banco blanco con cojines pastel, suelo de terrazo, pérgola con guirnalda de bombillas y, a la derecha, el pretil con lavanda, la ciudad al fondo, una costilla de Adán y una mesa alta de mármol con un cóctel rosa en copa de balón y un dónut. Kiriku posa con el móvil en un palo de selfie: se recoloca, barbilla arriba… ¡flash! Guillermo, al lado, levanta una ceja… y se le ocurre algo.
3. Kiriku pone morritos; Guillermo se asoma por detrás con la lengua fuera y los ojos apretados: ¡flash! Kiriku sospecha, baja el palo y se da la vuelta: Guillermo ya está en su sitio, mirando al cielo y silbando (notas redondas). Kiriku vuelve a posar.
4. Kiriku se ajusta el jersey sobre los hombros; Guillermo se asoma con el moflete hinchado como un pez globo, meneando los dedos junto a la oreja, y en la foto suelta una pedorreta: ¡flash! Media vuelta de Kiriku… Guillermo silba, sudando.
5. Tercera: Guillermo se pone unas gafas de broma con nariz y bigote: ¡flash! Esta vez Kiriku se gira como un látigo y le pilla con las gafas puestas; Guillermo sonríe, se las quita muy despacio, se las guarda y retrocede silbando.
6. La foto definitiva: Kiriku sube el palo y pone su mejor pose; Guillermo se agacha a escondidas detrás de él… y salta como un muelle por encima de su cabeza, bizco y con la lengua fuera: ¡flash! Con la mano le da al palo (¡clac!) y el móvil sale volando dando vueltas…
7. …y cae dentro del cóctel: ¡plof!, corona rosa, gotas por todas partes y un charquito en la mesa. Guillermo, horrorizado, se tapa la cara.
8. Kiriku, impasible, suelta el palo (rebota en el suelo), da un paso hacia la mesa y pesca el móvil con dos dedos, chorreando; mientras, Guillermo se da la vuelta y se va de puntillas, a zancadas exageradas, hasta salir de cuadro.
9. Kiriku mira el móvil, mira a cámara muy serio… y, por si acaso, lo levanta y vuelve a poner morritos: el móvil suelta un flash raquítico, chispas y una nubecilla de humo. Kiriku cierra los ojos.
10. Negro.

![Fotogramas de 00082](vista%20previa/00082%20Guillermo%20y%20Kiriku%20-%20el%20selfie%20de%20postureo%20-%20fotogramas.png)

### 00083 · Guillermo y Kiriku · El yate

1. Negro.
2. Alta mar a pleno sol: cielo azul con nubes, el sol con su estela de brillos en el agua, una isla lejana, un velero en el horizonte y gaviotas que planean. En la cubierta de teca de un barquito blanco (barandilla de acero, cabina con ojo de buey, salvavidas y un mástil con banderín) que se mece con la mar de fondo, Guillermo respira hondo el aire del mar mientras Kiriku, impecable, sorbe su cóctel con pajita y sombrillita de papel.
3. Kiriku acompaña el vaivén con el cuerpo y el vaso no se mueve ni un milímetro. Guillermo, en cambio, empieza a balancearse a destiempo: se pone verde poco a poco, abre los brazos como un surfista, se le ponen los ojos en espiral, se le hinchan los carrillos y se tapa la boca.
4. Se tambalea hasta la barandilla y se agarra. Traga… y suspira aliviado, con los ojos cerrados.
5. A su espalda se levanta una ola enorme. Kiriku la ve, da un pasito a un lado y pone el vaso a salvo; la cresta de espuma se viene encima…
6. ¡Chof!: la ola le cae entera encima a Guillermo, y solo a él. El agua corre por la cubierta y frena justo antes de las zapatillas de Kiriku, que levanta la puntera.
7. Guillermo se queda empapado, verde y tiritando: el pelo aplastado y chorreando, gotas por todas partes y un charco a sus pies. De entre los mechones se revuelve un pececillo que salta y vuelve al mar por encima de la barandilla.
8. Una gaviota baja planeando, frena aleteando y se le posa en la cabeza; mira a un lado y a otro, muy tranquila.
9. Kiriku, seco y sin despeinarse, cruza de puntillas lo mojado, saca la sombrillita del cóctel y se la ofrece con una reverencia.
10. Guillermo la coge y la levanta sobre la cabeza… y a cubierto se queda la gaviota. Mira a cámara, resignado; Kiriku da un sorbo y guiña un ojo.
11. Negro.

![Fotogramas de 00083](vista%20previa/00083%20Guillermo%20y%20Kiriku%20-%20el%20yate%20-%20fotogramas.png)

### 00084 · Guillermo y Kiriku · El jersey

1. Negro.
2. Césped de un club náutico a media mañana: cielo limpio, el mar con veleros y un faro en el cabo, valla blanca con hortensias, un salvavidas colgado, dos tumbonas de rayas, una mesita con limonada y el mástil con un gallardete que ondea. Kiriku posa mirando al mar, con su jersey anudado sobre los hombros y otro de repuesto, rosa salmón, doblado sobre la palma como un camarero.
3. Guillermo lo estudia con el puño en la barbilla, le rodea por detrás y se planta delante: se inclina, asiente impresionado, señala el nudo y se da en el pecho: «yo quiero».
4. Kiriku se lo ofrece con una pequeña reverencia; Guillermo lo coge por los extremos, lo alza y se le despliega delante, con chispas de ilusión en los ojos.
5. Lo lanza al aire y le cae sobre los hombros con las mangas colgando por delante. Cruza los puños, tira de las mangas hacia fuera con todas sus fuerzas… y el nudo se le sube al cuello: se ahoga (rojo, ojos fuera, saltitos), con las dos mangas tirantes del nudo a los puños. Kiriku se divierte.
6. Lo afloja de un tirón y respira. Segundo intento: abre los brazos, da un latigazo con las mangas… y se queda con los brazos atados al cuerpo; forcejea mientras Kiriku se ríe con los hombros.
7. Al girar para arreglarlo acaba envuelto como un paquete, con el jersey por la cabeza y solo los pinchos del pelo asomando por el cuello; da saltitos a ciegas hasta chocar con la palma de Kiriku.
8. Kiriku, sin inmutarse, pellizca la manga que cuelga y de un tirón elegante desenrolla el paquete: Guillermo sale girando como una peonza y el jersey cae doblado sobre el antebrazo de Kiriku.
9. Guillermo se tambalea mareado, con los ojos en espiral y estrellitas. Kiriku, con un golpe de muñeca, le devuelve el jersey por encima de la cabeza, le cae en los hombros y le hace un nudo perfecto con una sola mano: ¡destello!
10. Guillermo, encantado, posa como Kiriku, con las manos en los bolsillos y la barbilla arriba… y el jersey se le desata, resbala por la espalda y cae al césped.
11. Guillermo mira el montón y luego a cámara, muy serio; Kiriku cierra los ojos, niega despacio con la cabeza y mira a cámara con una ceja levantada.
12. Negro.

![Fotogramas de 00084](vista%20previa/00084%20Guillermo%20y%20Kiriku%20-%20el%20jersey%20-%20fotogramas.png)

### 00085 · Guillermo y Kiriku · La cata de vino

1. Negro.
2. Una vinoteca elegante de noche: pared granate con damasco, zócalo de nogal, barricas apiladas, un botellero de rombos con botellas sin etiqueta y copas colgadas, un cuadro de viñedo al atardecer, apliques con velas y, bajo una lámpara de latón, una mesa alta con mantel blanco, un decantador, una vela y un platito de uvas y queso. Guillermo y Kiriku, de pie a los lados, cada uno con su copa de tinto.
3. Kiriku coge su copa por el tallo, con el meñique fuera, y la hace girar con suavidad: el vino sube por las paredes y deja lágrimas. Guillermo no le quita ojo.
4. La huele con los ojos cerrados (volutas de aroma), da un sorbito y pone cara de gloria: «mm».
5. Guillermo, impresionado, coge la suya con el meñique tiesísimo, mira a cámara muy chulo y la hace girar… cada vez más rápido, más fuerte, más alto.
6. El vino sale de la copa en un anillo que da la vuelta por el aire y se le estampa en la cara: ¡chof! Se queda con la cara llena de manchas que gotean; Kiriku levanta una ceja y aguanta la risa. Mirada muy seria a cámara.
7. Vuelve a imitarle: ojos cerrados, la nariz bien dentro de la copa… y sorbe: ¡el vino se le mete por la nariz! Se pone rojo, le lloran los ojos…
8. Ah… ah… ah… Kiriku se lleva su copa al pecho para protegerla… ¡achís!: una rociada de vino que deja el mantel lleno de lunares.
9. Guillermo se limpia la nariz con la muñeca, mira la copa con decisión y se la bebe de un trago, con la cabeza hacia atrás (glu, glu), y hace gárgaras: burbujas, mofletes temblando.
10. Kiriku deja su copa en la mesa, se pellizca el puente de la nariz con los ojos cerrados y suspira, negando despacio con la cabeza.
11. Guillermo traga, sonríe a cámara con bigote de vino, le da hipo (sale una burbujita) y brinda con la copa vacía; Kiriku abre un ojo hacia la cámara.
12. Negro.

![Fotogramas de 00085](vista%20previa/00085%20Guillermo%20y%20Kiriku%20-%20la%20cata%20de%20vino%20-%20fotogramas.png)

### 00086 · Guillermo y Kiriku · El peine

1. Negro.
2. Un camerino elegante: papel pintado a rayas rosa, zócalo crema, suelo de espiga, un cuadro abstracto, una planta, un aplique redondo, un toallero con su toalla y un tocador con espejo de bombillas y encimera de mármol (bote de gomina, perfume, brochas y toallas dobladas).
3. Kiriku, con un espejito de mano en alto, se peina con un peine negro: tres pasadas, y en cada una un pelo rebelde se coloca en su sitio con un destello. Se admira en el espejo: ¡ting!
4. Guillermo le pide el peine con la palma tendida; Kiriku suspira y se lo lanza dando una vuelta en el aire.
5. Guillermo se peina los pinchos hacia atrás de una pasada y mira a cámara muy chulo… y los pinchos vuelven a saltar uno a uno: ¡boing, boing, boing! Kiriku se ríe por lo bajo.
6. Picado (vena), Guillermo clava el peine en la coronilla y va a por la gomina: coge el bote, moja dos dedos y ¡plas!, se la planta con la palma (salpican gotitas azules) y se alisa el pelo, pegado y brillante, con el peine encima. Mira a cámara orgullosísimo.
7. Los pinchos empiezan a levantarse despacio, temblando y crujiendo; Guillermo suda… y el último sale disparado y lanza el peine por los aires, dando vueltas.
8. El peine cruza la habitación y se clava en el pelo de Kiriku, que se alborota entero en mechones de punta.
9. Kiriku se queda helado, se mira en el espejito y se horroriza, con la mano en el pelo.
10. Guillermo deja el bote en la encimera, se mete las manos en los bolsillos y silba mirando al techo; mira de reojo a Kiriku y sigue silbando.
11. Guillermo sonríe a cámara, colorado; Kiriku, horrorizado, también mira a cámara.
12. Negro.

![Fotogramas de 00086](vista%20previa/00086%20Guillermo%20y%20Kiriku%20-%20el%20peine%20-%20fotogramas.png)

### 00087 · Guillermo y Kiriku · El baile de salón

1. Negro.
2. Un salón de baile de noche: paredes de marfil con molduras doradas, dos ventanales en arco con el jardín y la luna, cortinas de terciopelo granate con alzapaños y flecos, un espejo dorado sobre una consola con flores, apliques de velas, una lámpara de araña de cristal que se mece y destella, parqué encerado y, en el rincón, un gramófono del que salen notas al compás de un vals.
3. Kiriku, muy erguido y con la barbilla alta, se pone en posición (una mano en el aire y la otra a la espalda) y baila el vals él solo: adelante, a un lado, junta, con su subida y bajada, y una vuelta entera, suavísimo. Guillermo lo mira boquiabierto.
4. Kiriku le cede el turno con la palma hacia arriba; Guillermo se señala («¿yo?»), asiente decidido… y lo imita tieso como un soldadito de madera: brazos rígidos, patadas con la pierna recta, la lengua fuera de concentración.
5. La vuelta le sale a golpes y acaba tambaleándose, agitando los brazos como un pájaro. Kiriku hace una mueca, suspira, se acerca y le caza la mano al vuelo.
6. Guillermo se pone colorado y bailan juntos, Kiriku llevando: dos compases de vals por el salón, inclinándose a un lado y a otro; Guillermo, en la gloria, con el brazo de fuera en floritura.
7. Kiriku sube las manos, le da cuerda con un floreo y lo suelta: Guillermo sale girando solo como una peonza por el parqué, entre rayas de giro y polvo, hasta salir de cuadro.
8. ¡Crac!, fuera de plano: tiembla todo, la aguja del gramófono salta, entra una polvareda, la cortina del borde desaparece de un tirón y entran rodando un cuadro dorado y unas anillas. Kiriku se encoge y luego se asoma.
9. Guillermo vuelve a entrar tambaleándose, con los ojos en espiral, envuelto en la cortina como en una capa de rey y con la barra de latón en la mano como un cetro.
10. Kiriku hace una reverencia a cámara con un brazo cruzado en la cintura; Guillermo la imita tambaleándose y Kiriku mira a cámara, muy satisfecho.
11. Negro.

![Fotogramas de 00087](vista%20previa/00087%20Guillermo%20y%20Kiriku%20-%20el%20baile%20de%20salon%20-%20fotogramas.png)

### 00088 · Guillermo y Kiriku · El reloj

1. Negro.
2. Vestíbulo de un hotel elegante al anochecer: suelo de mármol pulido que refleja la pared, pared verde azulado con filete de latón y zócalo de nogal, dos apliques, un gran reloj de pared sin números con sus agujas, una palmera en macetero de latón y, al fondo, una puerta giratoria de cristal y latón que gira despacio, con la calle azul detrás y una alfombra granate. Guillermo y Kiriku esperan con las manos en los bolsillos.
3. Kiriku saca la mano, da un golpe de muñeca y se mira el reloj de pulsera dorado, muy chulo: ¡ting!, un destello y un rayo de luz que deslumbra a Guillermo, que se hace visera con la mano.
4. Guillermo se pica (vena), rebusca en el bolsillo y saca… un despertador gigante de dos campanas. Se lo planta sobre la muñeca como si fuera un reloj de pulsera, lo mira muy chulo y mira a Kiriku, que levanta una ceja.
5. Le da cuerda a la llave de atrás con los mofletes hinchados, vuelta a vuelta… y ¡RIIING!: el martillo vibra entre las campanas, salen ondas en zigzag y el despertador le sacude los brazos y le pone los pelos de punta.
6. Lo bate de una mano a otra sin poder pararlo hasta que se le escapa: cae al suelo y sigue dando saltitos sonando, ¡clac, clac!, hacia Kiriku.
7. Guillermo lo persigue agachado e intenta cazarlo dos veces, pero se le escapa de entre las manos.
8. Kiriku, sin sacar la otra mano del bolsillo, levanta el pie y lo pisa por arriba: un último «ding» y silencio.
9. Impasible, con el pie encima del despertador, se vuelve a mirar el reloj (otro destello que deslumbra a Guillermo, agachado a sus pies). Guillermo mira a cámara colorado y sudando; Kiriku guiña un ojo.
10. Negro.

![Fotogramas de 00088](vista%20previa/00088%20Guillermo%20y%20Kiriku%20-%20el%20reloj%20caro%20-%20fotogramas.png)

### 00089 · Guillermo y Kiriku · El descapotable

1. Negro.
2. Carretera de la costa a media tarde, vista de lado: un descapotable rojo de los de antes (capó largo, parabrisas con marco cromado, asientos de piel color tabaco, salpicadero de madera) corre hacia la derecha mientras pasan el mar con sus brillos, un cabo con un pueblo blanco, palmeras, farolas y el quitamiedos. Kiriku conduce con las gafas de sol puestas y una mano en el volante; Guillermo, de copiloto, levanta los brazos encantado.
3. Kiriku acelera: todo pasa más deprisa y el viento le dobla a Guillermo los pinchos del pelo hacia atrás, uno a uno, hasta dejarlos ondeando. Guillermo se agarra a la puerta.
4. El viento le hincha los carrillos y se los sacude como a un perro asomado a la ventanilla: labios al aire, ojos apretados y lagrimones que salen volando hacia atrás. Kiriku le echa una mirada, impasible; a él solo se le levanta un mechón, que vuelve a su sitio.
5. ¡Plaf!: un bicho se le estampa en los dientes. Guillermo se queda helado, lo pesca con dos dedos, lo mira, lo suelta al viento y saca la lengua con asco, verde.
6. Se le ocurre algo: abre la guantera y saca, cogido por la coronilla, un casco de aviador de cuero con gafas (sale arrugado y se infla). Coge impulso y lo lanza hacia arriba (Kiriku echa la cabeza atrás); el casco da una vuelta en el aire y le cae encajado en la cabeza, con los pinchos asomando por detrás.
7. Se abrocha la orejera, se baja las gafas y posa como un héroe, señalando la carretera.
8. Kiriku se baja las gafas de sol tirando de la patilla y mira a cámara por encima, con la ceja levantada. A Guillermo se le estampa otro bicho… en las gafas, y ni se inmuta. Kiriku se sube las gafas.
9. Negro.

![Fotogramas de 00089](vista%20previa/00089%20Guillermo%20y%20Kiriku%20-%20el%20descapotable%20-%20fotogramas.png)

### 00090 · Guillermo y Kiriku · La foto de grupo

1. Negro.
2. Un mirador del parque a la hora dorada: el sol bajando sobre la bahía, la ciudad al otro lado con las primeras ventanas encendidas, nubes rosadas, pájaros a lo lejos, una barandilla de hierro sobre un murete de piedra, una farola recién encendida, un banco verde y un árbol enorme. En primer plano, una cámara de fotos sobre su trípode; Guillermo, detrás, encuadra subiéndola y bajándola mientras Kiriku espera con las manos en los bolsillos.
3. Guillermo le hace señas para que se corra un poco; Kiriku da un paso a un lado y asiente. Guillermo aprieta el disparador: una lucecita roja empieza a parpadear, cada vez más deprisa.
4. Kiriku se pone en pose: pie adelantado, mano en la cadera y barbilla arriba. Guillermo sale corriendo… se engancha con la pata del trípode (la cámara se queda mirando al suelo, temblando) y sale dando traspiés, braceando como un molino, hasta que recupera el equilibrio y suspira aliviado.
5. Se da la vuelta, ve la cámara torcida y se lleva las manos a la cabeza. Vuelve, pasa la pata con muchísimo cuidado, endereza la cámara y le da dos palmaditas; Kiriku, mientras, pone los ojos en blanco y da golpecitos con el pie.
6. Guillermo salta la pata con una zancada exagerada, mira a cámara muy chulo y esprinta; Kiriku le mira de reojo y adelanta el pie un pelín… y Guillermo tropieza con él.
7. ¡Flash! La imagen se congela y se funde a blanco; del blanco sale la foto impresa, con su borde blanco, un poco torcida: Kiriku perfecto, con un destello en la sonrisa, y Guillermo en horizontal en el aire, con cara de susto.
8. Negro.

![Fotogramas de 00090](vista%20previa/00090%20Guillermo%20y%20Kiriku%20-%20la%20foto%20de%20grupo%20-%20fotogramas.png)

### 00091 · Guillermo y Marta · El café con arte

1. Negro.
2. Un café acogedor por la mañana: pared rosa teja con azulejos blancos, una pizarra con dibujos de tiza (una taza humeante, un corazón, una hoja, granos y estrellas), una balda con tarros de café, un potos colgando, lámparas de latón, rayos de sol y, al fondo, la barra de madera con la cafetera de dos brazos, el molinillo y una campana con bizcochos. En una mesa alta, dos cafés, una jarrita de leche y un tarro de palillos; Guillermo a un lado y Marta al otro.
3. Marta le mira con picardía, coge la jarrita y vierte la leche con mimo, meneándola: en un globo se ve la taza desde arriba, la mancha blanca crece y, al cortar, se convierte en un corazón perfecto (¡ting!). Guillermo se queda boquiabierto.
4. Marta le cede el turno con la palma hacia arriba («¿yo?») y le desliza la jarrita por la mesa; la jarrita gira por el camino y llega con el asa hacia él.
5. Guillermo la coge, mira a cámara muy chulo y vierte a lo bruto: un chorro gordo, la espuma sube, rebosa y chorrea por la taza; en el globo, un borrón sin forma que se sale por el borde. Marta se alarma.
6. Orgullosísimo, deja la jarrita, coge la taza, da un paso atrás y la inclina hacia Marta para enseñársela… y la espuma se le cae encima de la zapatilla: ¡plaf!, mancha que humea y saltitos a la pata coja. Marta se parte de risa. Mirada muy seria a cámara.
7. Marta coge un palillo, se acerca, Guillermo le tiende la taza y ella le dibuja en el borrón una carita sonriente: ojo, ojo y sonrisa.
8. Guillermo se ilumina (colorado, entre chispitas) y levanta la taza; los dos miran a cámara y Marta guiña un ojo.
9. Negro.

![Fotogramas de 00091](vista%20previa/00091%20Guillermo%20y%20Marta%20-%20el%20cafe%20con%20arte%20-%20fotogramas.png)

### 00092 · Guillermo y Marta · La bufanda

1. Negro.
2. Una noche de nieve a la puerta del bar: cielo de hora azul, casas nevadas al fondo con las ventanas encendidas, la fachada verde del bar con su ventanal dorado (toldo nevado con carámbanos y escarcha en los cristales), la puerta con su corona de abeto, un cartel con una jarra, un abetito con lucecitas, una farola con su halo, un banco nevado y huellas en la acera; nieva sin parar.
3. Guillermo tirita abrazado a sí mismo, castañeteando los dientes y echando vaho. A su lado, Marta teje una bufanda de rayas rojas y crema a una velocidad increíble: las agujas son un borrón, saltan pelusillas, los ovillos giran en su cesta y la bufanda baja y se amontona a sus pies. Guillermo alucina.
4. Marta guarda las agujas en el bolsillo, levanta la punta de la bufanda y le pregunta con las cejas; Guillermo asiente como loco.
5. Se la lanza y la punta, con sus flecos, le cae sobre el hombro; con el dedo, Marta le hace «¡gira!».
6. Guillermo gira como una peonza, en la gloria, mientras Marta le va dando bufanda: el cuello… la boca… la nariz… la frente… y luego el pecho, la tripa y las piernas.
7. Se queda hecho un capullo de rayas del que solo asoman los ojos, los pinchos del pelo y las zapatillas (la cámara se acerca). Se mira, mira a cámara y se aleja a saltitos, «mmf, mmf»; Marta se ríe tapándose la boca sin soltar la punta.
8. Marta agarra la punta con las dos manos, carga… y ¡tirón!: Guillermo sale girando como una peonza por la nieve mientras la bufanda se desenrolla y Marta la recoge mano sobre mano hasta el montón.
9. Le queda solo la vuelta del cuello. Mareado, con los ojos en espiral y estrellitas, no se entera de que Marta saca unas tijeritas y ¡zis, zis!: corta la bufanda junto a su cuello.
10. Guillermo se despeja con una bufanda corta y perfecta, hunde la barbilla en ella con los ojos cerrados, calentito y colorado (le sale un corazón), y mira a cámara; Marta, con las tijeras en la mano, guiña un ojo a la cámara.
11. Negro.

![Fotogramas de 00092](vista%20previa/00092%20Guillermo%20y%20Marta%20-%20la%20bufanda%20-%20fotogramas.png)

### 00093 · Guillermo y Marta · El libro

1. Negro.
2. El rincón de lectura del bar, de noche: pared color miel con papel de hojitas, zócalo de nogal, una estantería altísima llena de libros de colores, una lámpara de pie, una alfombra persa, una mesita con una taza que humea, una planta grande y un cuadrito. Marta, en un taburete junto a la lámpara, lee un libro gordo muy tranquila: pasa una página y sonríe con lo que lee.
3. Guillermo, al lado de la estantería, se aburre: suspira, da golpecitos con el pie, mira a un lado y a otro… y mira arriba: en el estante de arriba brilla un tomo gigantesco.
4. Se le ocurre algo; se pone de puntillas, lo saca tirando del lomo… y el tomo le cae en los brazos: ¡zas!, se le doblan las rodillas.
5. Se tambalea de un lado a otro con él, rojo y sudando (Marta pasa otra página), hasta que se da de espaldas contra la estantería: ¡pum! La estantería tiembla… y aguanta. Suspira aliviado.
6. Pero en el hueco del tomo los libros empiezan a caer unos sobre otros como fichas de dominó (¡tac, tac, tac!). Guillermo mira arriba, horrorizado.
7. Todo se viene abajo: dos libros le dan en la cabeza, suelta el tomo, se encoge… y una lluvia de libros lo entierra en una montaña, entre una nube de polvo.
8. Solo le asoman las zapatillas; de lo alto sale una mano que se agita sin fuerzas y se rinde. Marta pasa una página sin levantar la vista.
9. El último libro, que se tambaleaba en el borde del estante, se vuelca, se abre y se posa en lo alto de la montaña como un tejadito. Las zapatillas se meten dentro y ¡pop!: Guillermo asoma la cabeza por arriba con el libro puesto de tejado, mareado, entre estrellitas.
10. Marta sube su libro hasta la nariz y le mira por encima, solo con los ojos; lo baja un poco, sonríe y guiña un ojo a cámara. Guillermo la mira y sonríe a cámara.
11. Negro.

![Fotogramas de 00093](vista%20previa/00093%20Guillermo%20y%20Marta%20-%20el%20libro%20-%20fotogramas.png)

### 00094 · Guillermo y Marta · La pinza del pelo

1. Negro.
2. Un rincón de dormitorio a media mañana: papel pintado crema con ramitas, una ventana con visillos por la que entra el sol en rayos, una balda con libros, una planta grande, un tocador blanco con su espejo redondo y una alfombra redonda. Guillermo y Marta, con las manos en los bolsillos.
3. Marta se lleva la mano a la nuca y se quita la pinza de carey: la melena se le suelta, cae despacio, rebota y se mece; ella la sacude con los ojos cerrados, entre destellos. Guillermo se queda embobado (corazones).
4. Guillermo señala la pinza, junta las manos y le pone ojitos; Marta sonríe, se la pasa a la otra mano y se la da.
5. Guillermo agacha la cabeza y se la engancha en un pincho de delante… el pincho se dobla con el peso y la pinza se le queda colgando delante de los ojos, balanceándose. Él la mira con los ojos en blanco y Marta aguanta la risa con los mofletes hinchados.
6. La quita (¡boing!, el pincho vuelve a su sitio), se la pasa a la otra mano, echa la cabeza atrás, se pone de puntillas y la cierra en la coronilla: ¡clac!, se le recogen todos los pinchos en una palmerita de pelo tiesa que se abre y se bambolea.
7. La mira con los ojos hacia arriba y posa orgullosísimo, con los brazos en jarras. Marta se tapa la boca de risa.
8. Marta le hace una «foto» con los dedos (dos «L» y un ojo guiñado): ¡flash! Guillermo le guiña un ojo.
9. Marta se recoge el pelo con un par de vueltas y se pone la goma rosa de la muñeca en el moño; Guillermo menea la cabeza y la palmera se le balancea.
10. Los dos miran a cámara; Marta guiña un ojo y a Guillermo le bota la palmera.
11. Negro.

![Fotogramas de 00094](vista%20previa/00094%20Guillermo%20y%20Marta%20-%20la%20pinza%20del%20pelo%20-%20fotogramas.png)

### 00095 · Guillermo y Marta · El gato

1. Negro.
2. Un salón acogedor a la hora dorada: pared verde salvia con zócalo de cuarterones, una librería llena de libros de colores, un cuadro con un sol, una alfombra redonda trenzada y, a la derecha, un mirador con el sol de la tarde sobre los tejados, cortina recogida, macetas, un banco con cojín mostaza, cojines y una manta de punto; por la ventana entran haces de luz con motas de polvo. Marta, sentada en el banco, tiene en el regazo un gato naranja atigrado hecho una bola, dormido.
3. Marta lo acaricia de la cabeza a la cola y el gato ronronea (rayitas que vibran sobre el lomo). Guillermo se derrite al verlo: corazoncitos.
4. Se acerca, se agacha y alarga la mano muy despacio, con la lengua fuera… el gato abre un ojo, luego los dos y ¡se eriza!: lomo arqueado, pelo de punta, cola de escobilla y bufido con colmillos. Guillermo da un brinco hacia atrás con las manos en alto y se queda temblando.
5. Marta se ríe tapándose la boca; el gato se calma, se sienta y se lame la pata, muy digno.
6. Marta llama a Guillermo con el dedo y le susurra algo al oído; él asiente, encantado. Marta saca del bolsillo una caña con una pluma de colores y un cascabel, y se la da.
7. Guillermo se agacha y la menea: el gato se agazapa, menea el culete, salta al suelo y caza la pluma a zarpazos… Guillermo la levanta de un tirón y el gato se le abalanza: le trepa por la pierna, el pecho y el hombro, donde le frota la mejilla, y desde allí sigue dándole zarpazos a la pluma.
8. Guillermo baja la caña y el gato le salta a la cabeza: da una vuelta, amasa y se enrosca encima de sus pinchos como un gorro, ronroneando.
9. Guillermo, colorado, no se atreve ni a respirar; mira a cámara feliz mientras Marta se ríe, y el gato abre un ojo.
10. Negro.

![Fotogramas de 00095](vista%20previa/00095%20Guillermo%20y%20Marta%20-%20el%20gato%20-%20fotogramas.png)

### 00096 · Guillermo y Marta · El microondas

1. Negro.
2. La cocinita de detrás de la barra, al anochecer: pared crema, azulejo verde agua, una ventana con la ciudad y la luna y una cortina de cuadros, una balda con tarros sin etiqueta y tazas colgadas, una lámpara colgante, la encimera de madera con el hervidor, el frutero y el bote de cucharones, una nevera con imanes y un dibujo, y suelo de barro. En la encimera, un microondas plateado con la puerta entreabierta y la hora en su pantalla.
3. Guillermo sacude muy chulo un sobre de palomitas, mira a cámara y lo encesta de un lanzamiento dentro del microondas: ¡sí!, puño en alto.
4. Se acerca, cierra la puerta de un empujón (¡clac!), da un paso atrás y teclea con el índice: 9… 99… 9:99… 99:99… y ¡arrancar! (pitidos). El plato gira, se enciende la luz y zumba.
5. Se aparta, se pone chulo y golpea el suelo con el pie… ¡pop!, ¡pop, pop!: el sobre se hincha a tirones y Guillermo se ilusiona con saltitos.
6. El sobre llena todo el microondas y aprieta el cristal; la puerta se abomba y echa vapor, el microondas tiembla y la pantalla parpadea. Guillermo, sudando, alarga el dedo hacia el botón… y lo retira.
7. ¡BUM!: la puerta sale despedida, el sobre revienta y una ola de palomitas se le viene encima. Guillermo bracea y grita mientras la montaña sube… hasta dejarle enterrado hasta el cuello, con palomitas en el pelo. Una última sale disparada del microondas y le da en la cabeza. Mirada muy seria a cámara.
8. Marta entra por la derecha, pasa con zancadas por encima de las palomitas del suelo, mira la montaña y a Guillermo y levanta una ceja.
9. Coge un puñado del montón (deja un hoyo) y se las va comiendo una a una, tranquilísima, mientras Guillermo se relame.
10. Marta le lanza una sola palomita: Guillermo la caza al vuelo con la boca y mastica feliz, colorado. Los dos miran a cámara y Marta guiña un ojo.
11. Negro.

![Fotogramas de 00096](vista%20previa/00096%20Guillermo%20y%20Marta%20-%20las%20palomitas%20de%20maiz%20-%20fotogramas.png)

### 00097 · Guillermo y Marta · Bajo la lluvia

1. Negro.
2. Una calle de la ciudad al anochecer, lloviendo: una floristería con su toldo de rayas que gotea y cubos de flores en la acera, una librería con el escaparate encendido lleno de libros, un portal con arco, ventanas encendidas, una farola con su halo, un canalón que chorrea y la acera mojada con charcos que reflejan las luces.
3. Marta tiende la palma, mira al cielo y abre de golpe su paraguas pequeñito de gajos mostaza y crema (¡pop!, con rebote).
4. Guillermo entra corriendo por la izquierda, empapado, con el pelo aplastado y haciéndose visera con la mano; chapotea en cada paso y frena patinando junto a ella. Mira arriba y le pone ojitos con las manos juntas.
5. Marta sonríe, le invita con la mano y le cede medio paraguas; Guillermo se mete debajo encogido.
6. Pero el paraguas es pequeño: a cada uno le cae la lluvia en el hombro de fuera. Se miran el hombro, se miran… y se arriman un poco… y otro poco… hasta quedarse mejilla con mejilla, apretujados y colorados, mirando a cámara (sale un corazoncito).
7. Llega una racha de viento: la lluvia se tuerce, a Marta se le vuela la melena, el paraguas cabecea… y ¡plof!, se da la vuelta. Les cae la lluvia encima a los dos.
8. Miran arriba, se miran muy serios, chorreando… y se parten de risa.
9. Se dan la mano, cogen impulso y saltan juntos al charco: ¡chof!, una corona de agua, gotas por todas partes y anillos que se abren.
10. Siguen riéndose y miran a cámara; Marta guiña un ojo.
11. Negro.

![Fotogramas de 00097](vista%20previa/00097%20Guillermo%20y%20Marta%20-%20el%20paraguas%20compartido%20-%20fotogramas.png)

### 00098 · Guillermo y Marta · El puzle

1. Negro.
2. El rincón de juegos de casa al anochecer: pared azul petróleo con papel de rombitos dorados, zócalo crema, una ventana con la hora azul (luna, tejados con ventanas encendidas) entre cortinas de terciopelo mostaza, una estantería con cajas de juegos, un reloj sin números, una lámpara de esmalte verde colgando y una alfombra. En la mesa, sobre un tapete verde, un puzle casi terminado de una puesta de sol (sol, mar, velero, gaviotas y palmera), la tapa de la caja apoyada detrás con el mismo dibujo y dos tazas que humean.
3. Marta coloca piezas con calma, una y otra: ¡clic!, chispita. Coge la última y le da vueltecitas. Guillermo, con una pieza en la mano, la gira y la remira; mira lo bien que encajan las de Marta («ooh») y asiente, decidido.
4. Planta su pieza en un hueco… y no entra: se queda montada y torcida. La aprieta con el dedo, sacando la lengua (¡boing!, rebota); vuelve a apretar; prueba con el puño, rojo y temblando. Marta levanta una ceja y niega con la cabeza.
5. Guillermo carga el puño bien arriba y ¡PUM!: tiembla la mesa, saltan las tazas… y todo el puzle sale volando. Marta se protege su pieza contra el pecho.
6. Las piezas suben girando y dando vueltas (algunas enseñan el cartón de detrás) y se quedan flotando bajo la lámpara mientras los dos miran arriba con la boca abierta.
7. Empiezan a caer, una tras otra, cada una a su sitio (clic, clic, clic…), hasta que el puzle queda montado entero… salvo un hueco: el del sol. Los dos se quedan pasmados y miran a cámara.
8. Marta, que no había soltado su pieza, la pone en el hueco: ¡clic!, el sol se enciende y un brillo recorre todo el puzle entre chispitas.
9. Guillermo saca pecho como si hubiera sido cosa suya… nota algo en el bolsillo, rebusca y saca otra pieza: la mira, mira el puzle terminado, mira a cámara y se encoge de hombros con las palmas hacia arriba.
10. Marta levanta una ceja, se ríe tapándose la boca y guiña un ojo a cámara.
11. Negro.

![Fotogramas de 00098](vista%20previa/00098%20Guillermo%20y%20Marta%20-%20el%20puzle%20-%20fotogramas.png)

### 00099 · Guillermo y Marta · El muñeco de nieve

1. Negro.
2. Un parque nevado a media mañana, en lo alto de una loma: cielo azul con un sol pálido, montañas nevadas al fondo, un bosquecillo de pinos, una farola, un banco con nieve y, a la derecha, el borde de la loma que cae a una vaguada, con la colina de enfrente y su cerca al otro lado; caen copos sueltos. Marta palmea la cabeza de su muñeco de nieve (los rastros de las bolas siguen en la nieve) mientras Guillermo la mira, boquiabierto.
3. Marta le pone la cabeza, saca del bolsillo una zanahoria y se la clava de nariz, le pone dos ramitas de brazos, se quita su bufanda de rayas y se la anuda y le corona con un gorro rojo de pompón. Se aparta y lo admira: ¡ting!
4. Guillermo se pica, se frota las manos y se pone manos a la obra: rasca la nieve con la puntera y empuja una bolita con el pie, que crece a cada empujón y deja su rastro. Se planta en jarras, orgullosísimo.
5. Coge impulso y le da un buen puntapié… y la bola se le escapa: rueda sola hasta el borde y se va cuesta abajo. Guillermo corre detrás y se queda en el borde haciendo el molinillo con los brazos; Marta se tapa la boca.
6. En la colina de enfrente aparece su bola, más gorda, subiendo la ladera; se para arriba. Guillermo suspira aliviado, se encoge de hombros a cámara y vuelve silbando… mientras, a su espalda, la bola rueda otra vez hacia la vaguada.
7. El suelo retumba y cae nieve del pino: Guillermo se queda helado a media zancada, mira atrás y se da la vuelta… por el borde sube una bola de nieve GIGANTE que se le viene encima.
8. ¡Pum!: una nube de nieve. La bola se lo traga y frena derrapando justo al lado del muñeco de Marta, que aprieta los ojos tapándose la boca.
9. Guillermo se ha quedado metido dentro: solo le asoman la cabeza, los brazos en alto y las zapatillas, como un muñeco de nieve más. Se mira, menea los brazos y mira a cámara, resignado.
10. Marta se parte de risa, saca otra zanahoria del bolsillo y se la lanza: se le clava en la nariz. Luego le quita el gorro a su muñeco, se lo lanza a la cabeza y aplaude.
11. A Guillermo le pica la nariz… ah… ah… ¡achís!: el gorro sale volando y vuelve a caer en la cabeza del muñeco de Marta. Marta le guiña un ojo a la cámara.
12. Negro.

![Fotogramas de 00099](vista%20previa/00099%20Guillermo%20y%20Marta%20-%20el%20muneco%20de%20nieve%20-%20fotogramas.png)

### 00100 · Guillermo y Marta · El baile en la cocina

1. Negro.
2. Una cocina acogedora de noche: pared verde salvia, azulejo blanco con cenefa de colores, una encimera de madera a la izquierda con una balda alta (tarros, cuencos y un saco de harina en la punta), una ventana con la luna y la ciudad, una barra de cacharros con una sartén, una cocina de esmalte crema con una olla roja que hierve, una radio antigua de la que salen notas, una lámpara de cobre y un suelo de damero.
3. Marta baila removiendo la olla al compás, saca la cuchara de palo, da un toque en el borde, la lanza al aire, la caza con la otra mano y canta con ella de micrófono, con los ojos cerrados.
4. Guillermo entra deslizándose por el suelo con los brazos abiertos y frena con un «¡tachán!»; Marta le guiña un ojo sin dejar de cantar.
5. Se lanza a un baile exageradísimo (hombros, la rueda con los puños, pose), descuelga la sartén y la toca como una guitarra eléctrica: rasgueos, cabezazos y notas a cada golpe. Marta se le acerca bailando y le canta.
6. Molino con el brazo, salto… y sale girando como una peonza hacia atrás por todo el suelo hasta estamparse contra la encimera (¡pum!). Marta se tapa la boca y corre a ver si está bien.
7. En la balda, el saco de harina se tambalea, se vuelca… los dos miran arriba… y le cae a Guillermo en la cabeza: ¡PUF!, una nube de harina los envuelve a los dos.
8. Cuando se aclara, están blancos de arriba abajo; parpadean (se les quedan los ojos limpios) y se miran muy serios.
9. Se parten de risa, soltando harina con cada sacudida, y siguen bailando: Guillermo vuelve a tocar la sartén enharinada y a cada paso sale una nubecilla de los pies.
10. Pose final a cámara; Marta guiña un ojo.
11. Negro.

![Fotogramas de 00100](vista%20previa/00100%20Guillermo%20y%20Marta%20-%20el%20baile%20en%20la%20cocina%20-%20fotogramas.png)

### 00101 · Guillermo y Paradigma · La guitarra invisible

1. Negro.
2. El escenario pequeño de un bar, de noche: pared de ladrillo oscuro con luz cálida y magenta, dos focos, guirnaldas de bombillas de colores, una tarima de madera con marcas de cinta, un cable y una fila de bombillitas en el canto, una tarima de batería vacía, un amplificador grande y otro pequeño, una lámpara roja colgando sobre el escenario y, a la izquierda, la pista de baile vacía con sus taburetes.
3. Paradigma, con los ojos cerrados, toca una guitarra invisible: rasguea a compás, los dedos corren por un mástil que no existe y le salen notas de colores. Guillermo le mira boquiabierto.
4. A Guillermo se le enciende la bombilla: saca dos baquetas invisibles, las hace girar, cuenta chocándolas (uno, dos, tres)… y se lanza a una batería invisible, frenético, con la lengua fuera y un destello en cada parche que no está. Paradigma cabecea y se arranca con un solo.
5. Redoble… ¡y el platillo! Pero el «platillo» es la lámpara: ¡clang!, sale disparada, se balancea y vuelve para darle un coscorrón en toda la cabeza (estrella y chichón).
6. Mareado, con los ojos en espiral y estrellitas, Guillermo sigue tocando a destiempo. Paradigma abre un ojo, sonríe y va a por el final: dos zancadas, se tira de rodillas, se desliza por la tarima y se para justo en el borde con el último acorde, rugiendo con el brazo en alto.
7. Guillermo, impresionado, lo intenta: dos pasitos, se tira de rodillas… y se pasa del borde. Se queda un instante en el aire, mira a cámara con cara de pánico… y cae del escenario: ¡pum!, polvareda.
8. Asoma por el borde, mareado y con el chichón, y levanta el pulgar; Paradigma le mira, mira a cámara y guiña un ojo.
9. Negro.

![Fotogramas de 00101](vista%20previa/00101%20Guillermo%20y%20Paradigma%20-%20el%20air%20guitar%20-%20fotogramas.png)

### 00102 · Guillermo y Paradigma · La moto

1. Negro.
2. La puerta del bar a media tarde: fachada ocre con contraventanas verdes, el escaparate del bar encendido bajo su toldo de rayas, la puerta verde con su farol, una farola, la acera de losas y, a la izquierda, un seto de boj recortado en su jardinera. Paradigma, sentado en una moto clásica (depósito granate con franja crema, cromados, faro redondo y ruedas de radios), con una mano en el puño; Guillermo, de pie detrás, admira la moto.
3. Paradigma saca de la cazadora unas gafas de sol, las abre de un golpe de muñeca, se las pone, echa la melena hacia atrás de un cabezazo y ¡ting!, destello. Guillermo, boquiabierto.
4. Acelera en vacío: la moto tiembla y el tubo echa humo. Guillermo se asoma a curiosear el tubo de escape… y el segundo acelerón le suelta en la cara una nube negra que le envuelve entero. Sale tiznado, tosiendo humo y abanicándose.
5. Paradigma le dice con la cabeza que suba. Guillermo, tiznado pero encantado, levanta el puño, coge carrerilla y se sube de un salto al asiento de atrás, agarrándose a la cazadora y al asa.
6. Con su peso, la moto se encabrita: hace un amago… y la rueda de delante sube del todo. Se quedan en equilibrio sobre la de atrás, tambaleándose: Guillermo, aterrado y sudando, mira a cámara; Paradigma, tan tranquilo, también.
7. Paradigma se inclina hacia delante, sin prisa: la rueda de delante cae de golpe (¡pam!, polvo) y Guillermo sale catapultado hacia atrás, por el aire, braceando.
8. Se clava de cabeza en el seto: solo le asoman las piernas, pataleando entre una lluvia de hojas.
9. Paradigma mira hacia atrás, se baja las gafas por la patilla, mira a cámara por encima con la ceja levantada y se las vuelve a subir: ¡ting!
10. Negro.

![Fotogramas de 00102](vista%20previa/00102%20Guillermo%20y%20Paradigma%20-%20la%20moto%20-%20fotogramas.png)

### 00103 · Guillermo y Paradigma · La meditación

1. Negro.
2. Una azotea tranquila al anochecer: cielo de morado a naranja con las primeras estrellas y una luna fina, la ciudad recortada con sus ventanas encendidas, un murete de estuco, bambú en macetas de barro, una guirnalda de farolillos de papel, tarima de madera, una varilla de incienso que humea y, en el rincón, una caña de bambú que se llena de agua y bascula (¡toc!). Paradigma medita con las piernas cruzadas, las manos en las rodillas y los ojos cerrados, flotando un palmo por encima de su cojín entre un halo dorado.
3. Guillermo lo mira boquiabierto, mira a cámara, asiente muy decidido y se sienta en su cojín.
4. Intenta cruzar las piernas… y se le va el pie detrás de la cabeza: se queda enganchado, bracea como un molino, se tambalea y se cae de lado (¡pum!, polvo y estrellitas). Mira a cámara desde el suelo, colorado, y se levanta de un rebote, ya con las piernas cruzadas.
5. Segundo intento: manos en las rodillas, ojos cerrados… y una mosca se pone a darle vueltas a la cabeza. Le tiembla un ojo, otro tic… abre los ojos con la vena hinchada, carga el brazo y le suelta un manotazo enorme.
6. Falla: la mosca se escapa, rebota en el halo de Paradigma y se va; Guillermo se va de espaldas y se queda meciéndose sobre el cojín con las piernas pataleando en el aire.
7. Se incorpora, resopla con los mofletes hinchados y lo intenta otra vez: por fin se queda quieto, respira despacio y sonríe en paz…
8. …y se duerme: cabecea, se le resbalan las manos de las rodillas y le sale un globo de moco que crece y mengua con cada ronquido.
9. Paradigma abre un ojo, le mira, sonríe y mira a cámara.
10. ¡Toc!: la caña de bambú bascula, el globo revienta y Guillermo se despierta de un brinco; se recoloca y mira a cámara con cara de «no estaba dormido».
11. Negro.

![Fotogramas de 00103](vista%20previa/00103%20Guillermo%20y%20Paradigma%20-%20la%20meditacion%20-%20fotogramas.png)

### 00104 · Guillermo y Paradigma · El pelo largo

1. Negro.
2. A la puerta de una tienda de discos, a la hora dorada: pared de ladrillo, el escaparate iluminado con discos de colores y una guitarra eléctrica colgada, un letrero con lunares de colores (sin letras), un cartel con una guitarra, una pila de cajas de discos con una caja de cartón encima y una puerta de cristal oscuro con marco de latón; por la acera cruzan hojas secas.
3. Paradigma mira a cámara, baja la cabeza… y a cámara lenta se echa la melena atrás como una estrella del rock: el mechón de delante vuela por encima de la cabeza, la nuca se abre al viento, destellos y un reflejo del sol. Guillermo se queda alucinado, con brillos en los ojos.
4. Guillermo lo intenta: cabeza abajo y latigazo… y no se le mueve ni un pincho; solo le salta de la coronilla un pelo suelto que hace «boing». Otra vez, con los puños apretados y más fuerza: otro «boing». Se enfada; Paradigma aguanta la risa.
5. A Guillermo se le enciende la bombilla: se da la vuelta, va hasta la caja de cartón y saca, cogida por la coronilla, una peluca rubia larguísima. La sacude, la lanza al aire y la caza con la cabeza. Pose.
6. Melenazo a cámara lenta como Paradigma… y la peluca se le despega, da media voltereta por el aire y cae, ¡plof!, encima de la melena de Paradigma: dos melenas, una sobre otra. A Guillermo le vuelve a saltar el pelo suelto.
7. Paradigma parpadea y mira hacia arriba. Los dos se giran a la vez: Paradigma se mira en el cristal de la puerta, ladea la cabeza y da el visto bueno con el pulgar; su reflejo también.
8. Guillermo, otra vez con sus pinchos, mira a cámara («boing»); Paradigma mira a cámara y guiña un ojo.
9. Negro.

![Fotogramas de 00104](vista%20previa/00104%20Guillermo%20y%20Paradigma%20-%20el%20pelo%20largo%20-%20fotogramas.png)

### 00105 · Guillermo y Paradigma · El vinilo

1. Negro.
2. Un rincón de discos del bar, de noche: pared azul petróleo con rayas finas, una estantería llena de discos de colores, dos láminas (una puesta de sol sobre las olas y un disco con una guitarra), una ventana con la ciudad y la luna entre cortinas, una lámpara verde colgando, dos altavoces de pie, una alfombra redonda y un aparador de nogal con un tocadiscos antiguo.
3. Paradigma saca un vinilo de su funda con la yema de los dedos, le sopla el polvo, deja la funda en el aparador y lo posa en el plato; baja la aguja y de los altavoces salen notas redondas. Se mece con los ojos cerrados mientras Guillermo cabecea.
4. A Guillermo se le enciende la bombilla: se cruje los nudillos, se planta en el tocadiscos, se lleva la mano a unos cascos invisibles… y rasca el disco adelante y atrás como un DJ, con la lengua fuera: las notas salen rotas, en zigzag.
5. Paradigma abre los ojos de golpe, se tapa la oreja y le hace «¡para!» con la palma.
6. Último rascado con todas sus fuerzas… y el disco sale volando como un frisbi: le pasa por delante de la cara, da en la lámpara (que se queda columpiándose y abollada), le pasa rozando la cabeza mientras se agacha, tuerce la lámina y tumba un disco de la estantería.
7. Sube en un arco altísimo y vuelve… y Paradigma, sin inmutarse, levanta un dedo y lo caza por el agujero: el disco gira en su dedo hasta pararse.
8. Lo coge por el canto, lo vuelve a poner en el plato y baja la aguja: las notas vuelven a ser redondas.
9. Guillermo, cortado, se rasca la nuca y se mece con la música; los dos miran a cámara y guiñan un ojo.
10. Negro.

![Fotogramas de 00105](vista%20previa/00105%20Guillermo%20y%20Paradigma%20-%20el%20vinilo%20-%20fotogramas.png)

### 00106 · Guillermo y Paradigma · La barbacoa

1. Negro.
2. El jardín de atrás en una tarde de verano: el sol bajando tras una valla de madera, árboles, la pared de la casa con su ventana encendida y geranios, una guirnalda de bombillas, el césped, unas losas, una tumbona y, en medio, una barbacoa de bola con las brasas encendidas y cinco salchichas en la parrilla; a la izquierda, un carrito de madera con panecillos, kétchup, mostaza y un bote de líquido encendedor.
3. Paradigma, muy tranquilo, da la vuelta a las salchichas con las pinzas, una a una (chisporroteo y marcas de la parrilla), cabeceando con calma. Guillermo huele el humo con los ojos cerrados, se relame y asiente.
4. Guillermo se frota las manos y le pide las pinzas con la mano; Paradigma se encoge de hombros, lanza las pinzas al aire, las caza por la mitad y se las da por el mango.
5. Guillermo hace «clac, clac» con ellas y mira a cámara muy chulo. Mira las brasas, no le convencen… se le ocurre algo y coge del carrito el bote de líquido encendedor.
6. Paradigma levanta una ceja y se aparta un paso. Guillermo echa dos chorros a las brasas… no pasa nada. Se asoma a mirar…
7. ¡FUUUM!: una bola de fuego enorme. Las salchichas salen volando dando vueltas.
8. Guillermo se queda congelado, con las pinzas en alto: manchas de hollín en la frente, la mejilla y la punta de la nariz, sin cejas (solo unos ricitos chamuscados) y con las puntas de los pinchos negras y echando humo.
9. Las salchichas caen otra vez a la parrilla, doraditas y con sus marcas; una cae justo entre los dedos de Paradigma, que la sopla, le da un bocado y asiente con los ojos cerrados: «mm».
10. Guillermo parpadea y mira a cámara; a un pincho le sale una llamita que se apaga con un anillo de humo. Él lo mira y vuelve a mirar a cámara; Paradigma levanta la salchicha y guiña un ojo.
11. Negro.

![Fotogramas de 00106](vista%20previa/00106%20Guillermo%20y%20Paradigma%20-%20la%20barbacoa%20-%20fotogramas.png)

### 00107 · Guillermo y Paradigma · El espejo

1. Negro.
2. El recibidor de un piso antiguo, de noche, simétrico como si fuera su propio reflejo: papel pintado de damasco verde, zócalo de nogal, suelo de tablillas, una alfombra persa, y a cada lado una lámpara de pie, una consola con un jarrón de flores y un cuadro con un velero (cada uno navega hacia un lado). En medio, un marco de espejo dorado enorme, con su concha arriba… y sin cristal.
3. A un lado, Paradigma se arregla el cuello de la cazadora delante del «espejo»; al otro, Guillermo hace de su reflejo y le copia cada gesto en espejo, hasta las caras y los parpadeos.
4. Paradigma sospecha: se acerca, entorna los ojos, levanta una ceja, ladea la cabeza a un lado y al otro, saluda despacio con la mano… se agacha de golpe y se asoma muy despacio. Guillermo, igual, en espejo.
5. Paradigma pone la palma contra el «cristal», a la altura de la cara: las dos manos casi se tocan en medio del marco. Menea los dedos y Guillermo los menea igual; ya empieza a sudar.
6. Paradigma sonríe de pillo y acelera: manos arriba, brazos en cruz, señala con la mano en la cadera, sentadilla con los mofletes hinchados, salto, brazo en diagonal, brazos cruzados… Guillermo va cada vez más tarde y en una se equivoca de brazo: lo cambia en el acto, colorado.
7. El remate: Paradigma da una vuelta entera y cae a la pata coja con el brazo en alto (¡ting!). Guillermo lo intenta tarde, se pasa de vuelta y se queda hecho un lío: la pierna que no es enganchada detrás de la rodilla, los brazos cruzados al revés y la lengua fuera.
8. Se tambalea, da tres saltitos a la pata coja hacia el marco, lo cruza dando vueltas y cae sentado de culo al otro lado: ¡pum!, polvareda y el marco se bambolea. Paradigma se aparta de un salto.
9. Guillermo se queda mareado, con los ojos en espiral y estrellitas; Paradigma se tapa la boca de risa.
10. Paradigma se acerca, le tiende la mano, Guillermo se la agarra y tira de él hasta levantarlo; se dan un buen apretón de manos.
11. Cada uno vuelve a su lado (Guillermo cruza el marco andando hacia atrás) y, por fin perfectamente sincronizados, se ponen los dos en jarras mirando a cámara y guiñan un ojo a la vez, en espejo.
12. Negro.

![Fotogramas de 00107](vista%20previa/00107%20Guillermo%20y%20Paradigma%20-%20el%20reflejo%20-%20fotogramas.png)

### 00108 · Guillermo y Paradigma · La partida de cartas

1. Negro.
2. Noche de póquer en el cuarto de atrás del bar: pared forrada de tablones oscuros con su zócalo, un cuadro con un velero al atardecer, un aplique, un reloj sin números, un aparador con una licorera y una puerta entornada por la que se cuela la luz del bar. En medio, una mesa redonda de tapete verde con borde acolchado, bajo una lámpara baja de pantalla verde que hace un cono de luz con motas de polvo. Guillermo y Paradigma, sentados frente a frente con sus pilas de fichas; las cartas de los dos, boca abajo, y un vaso de whisky con hielo junto a Paradigma.
3. Guillermo coge sus dos cartas y las mira… y se le ilumina la cara: rayitas, estrellas en los ojos, colorado. Paradigma, con los párpados a media asta, da un sorbo a su whisky sin inmutarse.
4. Guillermo intenta disimular con los labios apretados y los mofletes hinchados, sudando; no puede: mira a cámara moviendo las cejas y se marca un bailecito en la silla, tamborileando en el muslo. Paradigma parpadea despacio y levanta una ceja, nada más.
5. Guillermo deja las cartas boca abajo, coge impulso, se levanta medio cuerpo y empuja todas sus fichas al centro con los dos brazos: las pilas se deslizan por el tapete y se desmoronan, con fichas que ruedan y tintinean. Se sienta muy chulo.
6. Paradigma, tranquilo, empuja una pila al bote: va.
7. Guillermo da la vuelta a sus cartas de un manotazo (¡zas!): dos cartas flojísimas, un dos y un tres. Las presenta con la palma, sonriendo a cámara.
8. Paradigma, sin prisa, va sacando cartas de su montón y dejándolas boca arriba una a una: un as, otro as, otro as… y otro (cada una con su clic y su brillo). A Guillermo se le congela la sonrisa, le da un tic en el ojo y se le cae la mandíbula.
9. Paradigma se inclina sobre la mesa y recoge el bote con el antebrazo. Guillermo se queda tieso… y cae de cara sobre el tapete: ¡pum!, la lámpara se balancea y una ficha salta y se le queda encima de la cabeza.
10. Paradigma le mira, coge su vaso y mira a cámara con media sonrisa, levantándolo un poquito.
11. Negro.

![Fotogramas de 00108](vista%20previa/00108%20Guillermo%20y%20Paradigma%20-%20la%20carta%20-%20fotogramas.png)

### 00109 · Guillermo y Paradigma · Los globos de agua

1. Negro.
2. Patio trasero en pleno verano: tapia encalada, buganvilla, tendedero, piscinita con patito, girasol y pilar de ladrillo con la manguera. Paradigma toma el sol con los ojos cerrados y da un sorbo de limonada. Guillermo rebusca en un cubo, saca un globo rosa, se da la vuelta y mira a cámara con picardía.
3. Guillermo se acerca a Paradigma por detrás, de puntillas, con el globo bamboleándose en la mano.
4. Carga como un lanzador, con la rodilla arriba, y lanza. Justo antes, Paradigma se ha inclinado sin mirar a oler el girasol: el globo pasa por donde estaba su cabeza y revienta contra el pilar. La mancha mojada se queda.
5. Guillermo salta de alegría, pero ve que el agua vuelve por el aire y le cae entera encima: pelo aplastado, camiseta empapada, gotas y charco.
6. Escupe un chorrito, mira a cámara con cara de nada y se enfada: vena y cara roja.
7. Vuelve al cubo, saca un globo naranja enorme colgando del nudo, lo abraza con cara malvada, se agacha y lo lanza a dos manos por todo lo alto.
8. Paradigma, sin abrir los ojos, saca la mano del bolsillo y lo caza con la palma sin que reviente. Guillermo se queda pasmado. Paradigma abre los ojos, lo gira, lo aprieta y levanta una ceja.
9. Se da la vuelta y va hacia Guillermo con el globo en alto. Guillermo se encoge esperando el golpe. Paradigma se lo deja con cuidado encima de la cabeza.
10. Paradigma se aparta un paso y se vuelve al sol. Guillermo abre un ojo, mira arriba, se incorpora despacio haciendo equilibrio y sonríe aliviado.
11. ¡Plof!: el globo revienta, salen trocitos de goma y otra cortina de agua le cae encima.
12. Guillermo, chorreando y con el charco creciendo, mira a cámara mientras Paradigma da un sorbo de limonada al sol.
13. Negro.

![Fotogramas de 00109](vista%20previa/00109%20Guillermo%20y%20Paradigma%20-%20el%20globo%20de%20agua%20-%20fotogramas.png)

### 00110 · Guillermo y Paradigma · La puesta de sol

1. Negro.
2. Una azotea al atardecer: Guillermo y Paradigma sentados en el pretil de ladrillo con las piernas colgando y, entre los dos, un sol enorme bajando sobre la ciudad. Cielo naranja, nubes rosadas y pájaros a lo lejos. Paradigma tiene un botellín y Guillermo una bolsa de patatas fritas en el regazo y su botellín al lado.
3. Paradigma da un trago tranquilo: «ahh». Guillermo tira una patata al aire, la caza con la boca, la cruje y pone cara de chulo.
4. Paradigma señala el sol con el gollete del botellín y filosofa con calma. Guillermo se acaricia la barbilla, entorna los ojos y asiente muy hondo, una y otra vez.
5. Una paloma cruza por delante del sol, frena con las alas abiertas y se posa en la cabeza de Guillermo, que ni se entera. La paloma se da la vuelta y arrulla.
6. Paradigma la ve, mira dos veces, hincha los carrillos y se tapa la boca para aguantarse la risa, con los hombros temblando.
7. Guillermo saca otra patata, la admira a contraluz con los ojos cerrados y la lanza. La paloma estira el cuello y se la roba en el aire, y Guillermo da un mordisco al vacío: «¡ñac!».
8. Guillermo abre los ojos, se mira la mano vacía, mira a la izquierda y a la derecha, y mira con sospecha a Paradigma, que silba mirando al cielo.
9. Encima de su cabeza, la paloma cruje la patata y le llueven migas en la nariz. Guillermo mira hacia arriba; la paloma se asoma por su frente, se miran fijamente, ella traga y arrulla.
10. Guillermo suspira y se encoge de hombros, y se le caen las migas. Paradigma suelta la risa.
11. Ya en paz, los tres miran cómo el sol se hunde tras la ciudad, con la cabeza ladeada hacia el mismo lado, mientras se encienden las ventanas y salen las estrellas.
12. Negro.

![Fotogramas de 00110](vista%20previa/00110%20Guillermo%20y%20Paradigma%20-%20la%20puesta%20de%20sol%20-%20fotogramas.png)

### 00111 · Guillermo y Rodri · La guerra de pulgares

1. Negro.
2. Un rincón del bar de noche: papel pintado ocre con rombos, zócalo de azulejo verde, un espejo dorado, estantes con botellas, apliques y una lámpara de globo colgando. Una mesita redonda de madera con dos cañas sobre sus posavasos y una vela en un tarro rojo; Guillermo a la izquierda y Rodri a la derecha, sentados frente a frente en sillas de café de madera curvada.
3. Rodri le reta: levanta el puño y menea el pulgar. Guillermo le mira, entorna los ojos, sonríe con picardía, suelta la caña y le contesta con el pulgar arriba, con el antebrazo apoyado en la mesa.
4. Se inclinan sobre la mesa y se agarran las manos: ¡clac! Miradas de duelo… y la cámara se lanza hacia las manos hasta fundirse con el primer plano.
5. Primer plano de las dos manos enganchadas. Los pulgares se hacen una reverencia y chocan las puntas tres veces (uno, dos, tres, con sus puntitos).
6. ¡A pelear! Los pulgares dan vueltas, amagan y esquivan, estirándose y aplastándose; gotas de sudor en los nudillos. Guillermo se lanza y falla; Rodri aprovecha y le pisa el pulgar, que se retuerce debajo.
7. Por la izquierda entra a escondidas la otra mano de Guillermo y le pisa a Rodri el pulgar con el índice: trampa. El pulgar de Rodri se queda helado.
8. La cámara se aleja y vuelve al bar: Guillermo silba mirando al techo, muy inocente, con notitas. Rodri mira la mano tramposa, mira a Guillermo… y Guillermo le echa un ojo de reojo.
9. Rodri suelta, se levanta un poco por encima de la mesa y carga el índice en el pulgar delante de la frente de Guillermo, que lo ve venir. ¡TOC! Guillermo echa la cabeza atrás con las manos al aire: marca roja y estrellitas.
10. Rodri se vuelve a sentar y se sopla el dedo como un pistolero, con su humito. Guillermo se frota la frente haciendo pucheros.
11. Los dos miran a cámara y Rodri guiña un ojo.
12. Negro.

![Fotogramas de 00111](vista%20previa/00111%20Guillermo%20y%20Rodri%20-%20el%20pulso%20de%20dedos%20-%20fotogramas.png)

### 00112 · Guillermo y Rodri · Las sillas de bar

1. Negro.
2. Bar con gramola, luces de colores, neón de cóctel y dos taburetes rojos bajo el foco. Guillermo y Rodri esperan con las manos en los bolsillos.
3. Rodri sonríe, agarra uno de los taburetes, lo arrastra hacia atrás y lo lanza de un latigazo; sale rodando de cuadro.
4. Rodri da una palmada y guiña; Guillermo levanta la ceja, pícaro, y sube los puños.
5. Suena la gramola y las notas salen flotando. Los dos dan una vuelta entera alrededor del único taburete con pasitos de baile al ritmo, cruzándose por delante y por detrás.
6. Rayajo de aguja: la música se corta y las notas caen grises. Se quedan congelados, se miran y se agachan.
7. Se tiran a la vez y caen medio cada uno en el asiento, espalda con espalda, con un golpe y una estrella.
8. El taburete empieza a girar como loco con los dos encima, con caras de pánico.
9. El taburete los despide en direcciones opuestas: vuelan en arco y caen sentados en el suelo con polvo y estrellitas.
10. El taburete sigue girando solo, frena poco a poco y se para vacío, con la estrella mirando a cámara.
11. Sacuden la cabeza, miran el taburete, se miran entre ellos y se echan a reír. Guillermo mira a cámara y Rodri guiña.
12. Negro.

![Fotogramas de 00112](vista%20previa/00112%20Guillermo%20y%20Rodri%20-%20las%20carreras%20de%20sillas%20-%20fotogramas.png)

### 00113 · Guillermo y Rodri · El concurso de eructos

1. Negro.
2. Un bar de noche: a la izquierda, la barra con su espejo, baldas de botellas sin etiqueta y un colgador de copas boca abajo; a la derecha, pared azul noche con rayas doradas, zócalo de caoba, un aplique, una planta y un cuadro antiguo de una gaseosa colgado de un clavo. En medio, un barril de mesa alta con una cubitera llena de botellines; en el suelo, una caja de cascos. Guillermo y Rodri brindan con sus gaseosas (¡clinc!), se las beben de un trago y plantan los cascos vacíos en el barril.
3. Rodri, con sonrisa de reto, se da dos golpes en el pecho, se hincha… y suelta un eructo enorme: ondas que tiemblan, una nubecilla y burbujas. Le vibran los carrillos, las copas del colgador tintinean y a Guillermo le llega el aire con los ojos cerrados. Rodri, muy chulo, mira a cámara.
4. Guillermo se palmea la tripa, se concentra, se pone colorado… y le sale un «pío»: una ondita de nada y una burbuja que sube y explota. Mira a cámara, avergonzado.
5. Rodri se parte de risa, señalándole con el brazo estirado y con lágrimas de risa.
6. Guillermo se pica (vena en la frente) y se lanza a la cubitera: un botellín, otro y otro, de un trago y lanzando cada casco por encima de la cabeza a la caja. Se va hinchando: tripa, carrillos, colorado, ojos llorosos. Rodri deja de reír y se preocupa.
7. Guillermo aguanta, sujetándose la tripa, temblando y sudando; la cámara se acerca y Rodri se inclina a mirar.
8. ¡EL ERUCTO!: una onda gigante, una nube y ráfagas de viento; la cámara se sacude. A Rodri se le va el pelo hacia atrás (frente al aire, cejas por las nubes) y se queda despeinado. Tintinean las copas, las botellas y los cascos; el cuadro se columpia, salta del clavo y cae al suelo, apoyado de lado y con el cristal rajado.
9. Silencio. Guillermo se deshincha, en la gloria, acariciándose la tripa con un suspiro. Rodri, despeinado y pasmado, parpadea, mira el cuadro y mira a Guillermo.
10. Rodri aplaude despacio (tres palmadas) y levanta el pulgar con el antebrazo horizontal. Guillermo mira a cámara, orgulloso, y guiña un ojo; Rodri también mira a cámara.
11. Negro.

![Fotogramas de 00113](vista%20previa/00113%20Guillermo%20y%20Rodri%20-%20el%20eructo%20-%20fotogramas.png)

### 00114 · Guillermo y Rodri · La broma del cubo

1. Negro.
2. El pasillo de atrás del bar, de noche: alicatado verde, tubería, bombilla, cuadro de luces, extintor y perchero con delantal. La puerta del almacén está entornada y al fondo se ve oscuro. Hay una torre de cajas de botellas, un barril y una silla con un cubo de agua encima.
3. Guillermo mira la puerta, mira a cámara con cara de pillo y se frota las manos entre risitas.
4. Da un paso, coge el cubo por el asa, se sube a la silla y lo deja en equilibrio sobre el canto de la puerta. El cubo se bambolea… y se queda. Guillermo guiña un ojo.
5. Baja de la silla y se va de puntillas a esconderse detrás de las cajas. Asoma la cabeza tapándose la risa.
6. Del almacén oscuro sale Rodri silbando, con las manos en los bolsillos, y pasa justo por debajo del cubo… pero lleva el cordón desatado.
7. Sube el pie al barril para atárselo y, al agacharse, le da a la puerta con el trasero. La puerta cruje, el cubo se tambalea y salpica, y una gota le cae a Rodri en la cabeza. Guillermo se tapa los ojos. El cubo se queda.
8. Rodri se hace el lazo y se va silbando hacia la derecha.
9. Guillermo sale extrañado, rascándose la cabeza, va hasta la puerta, mira el cubo y le da un toquecito con el dedo.
10. El cubo se vuelca y le cae en la cabeza boca abajo, ¡clonc! El agua le empapa entero y le deja un charco a los pies.
11. Rodri da un respingo, se da la vuelta y se parte de risa señalándole.
12. Guillermo levanta el borde del cubo y asoma un ojo a cámara, chorreando. Rodri guiña un ojo.
13. Negro.

![Fotogramas de 00114](vista%20previa/00114%20Guillermo%20y%20Rodri%20-%20la%20broma%20del%20cubo%20-%20fotogramas.png)

### 00115 · Guillermo y Rodri · El pino

1. Negro.
2. Una taberna de noche: papel pintado verde botella con lunarcitos dorados, zócalo de madera oscura, una ventana con la calle y la luna, un reloj de pared sin números, un cuadro con un velero, dos lámparas colgantes, suelo de baldosas de barro y crema y, a la derecha, el extremo de la barra de caoba con su barra de latón, los grifos, una caña servida y, detrás, el espejo y las baldas de botellas. Rodri y Guillermo se miran con las manos en los bolsillos.
3. Rodri mira a cámara con cara de pillo, estira los brazos con los dedos entrelazados, da una zancada, planta las manos y patada: un pino perfecto, con el cuerpo recto, las piernas juntas y pequeños ajustes de equilibrio.
4. Mira a cámara, chulísimo, levanta una mano y saluda: ¡a una mano! Guillermo, boquiabierto.
5. Guillermo se pica (rojo, vena), se frota las manos y lo intenta: patada floja, se queda a medias pataleando y cae de pie, trastabillando. Rodri, boca abajo, se parte de risa, y luego baja del pino.
6. Segundo intento, con todas sus fuerzas: se pasa, se tambalea con las piernas en tijera, rojo y sudando, y echa a andar con las manos, cada vez más deprisa, hacia la barra. Rodri va detrás con las manos preparadas.
7. Al llegar a la barra las piernas se le vencen por encima: ¡pum!, quedan sobre la barra, la caña se vuelca y la cerveza gotea por el frente.
8. Guillermo se queda colgado boca abajo, doblado sobre el canto, con las manos colgando y estrellitas: patalea, bracea y se rinde.
9. Rodri se acerca, ladea la cabeza para verle del derecho y se parte de risa señalándole. Guillermo sonríe, colorado, y saluda a cámara con la manita; Rodri guiña un ojo.
10. Negro.

![Fotogramas de 00115](vista%20previa/00115%20Guillermo%20y%20Rodri%20-%20el%20pino%20-%20fotogramas.png)

### 00116 · Guillermo y Rodri · La aceituna

1. Negro.
2. Una taberna de tapas al anochecer: zócalo de azulejos, jamones, vitrina de tapas y una ventana en arco a la calle. Guillermo y Rodri, de pie a los lados de un barril. En el plato queda UNA aceituna en su aceite, junto a dos vermús, pan, palillos y un servilletero.
3. Miran la última aceituna, se miran y se retan.
4. Sacan un palillo cada uno y los cruzan como espadas (¡tin!). La cámara se acerca.
5. Duelo a palillazos, cada vez más rápido, con lengua fuera y sudor. En cada pinchazo la aceituna sale disparada y rebota por el tablero (contra los vasos, por encima del pan, contra el servilletero y el vaso de palillos), dejando un reguero de aceite, y vuelve al plato.
6. Rodri se rinde y tira su palillo por encima del hombro. Coge la aceituna con los dedos, la lanza al aire y se la zampa al vuelo, en la gloria.
7. Guillermo, con los ojos cerrados de pura concentración, carga… y le clava el palillo en la manga del plumífero. Sale una nubecilla de plumón.
8. Rodri levanta el brazo, mira la manga, mira a Guillermo y traga. Guillermo pide perdón con la palma, colorado.
9. Rodri sopla muy serio: el plumón vuela a la nariz de Guillermo, que estornuda.
10. Los dos miran a cámara y Rodri guiña.
11. Negro.

![Fotogramas de 00116](vista%20previa/00116%20Guillermo%20y%20Rodri%20-%20la%20apuesta%20de%20la%20aceituna%20-%20fotogramas.png)

### 00117 · Guillermo y Rodri · Las latas

1. Negro.
2. Feria de noche: noria encendida, luces desenfocadas y la caseta de las latas (toldo festoneado, lona a rayas, dos pirámides de latas, cesta de pelotas y un peluche gigante rosa en la repisa del poste). Rodri juega lanzando una pelota al aire; Guillermo espera en el mostrador y le mira de reojo.
3. Rodri apunta guiñando un ojo, carga y lanza por arriba: la pelota pasa rozando a Guillermo, que se agacha de golpe… ¡crash! La pirámide grande salta por los aires y las latas caen detrás del mostrador.
4. Rodri se sacude las manos, se las mete en los bolsillos y guiña a cámara. Guillermo, boquiabierto, se pica.
5. Guillermo coge una pelota de la cesta, se la pasa de mano, apunta a la pirámide pequeña con la lengua fuera y lanza: demasiado alta, da en la lona, que se abomba, y vuelve recta a su frente. ¡Bonk!: marca roja, estrellitas y ojos en espiral.
6. Rodri se dobla de risa, llorando y señalándole.
7. Guillermo, rojo de rabia, coge otra pelota, hace un molinillo enorme con la rodilla arriba, tiembla… y se le escapa hacia arriba. Rodri se aparta.
8. Mira las latas (nada) y luego arriba: la pelota cae sobre el peluche gigante, que se tambalea, se vuelca de la repisa y le cae en la cabeza. ¡Ploof!
9. Guillermo, con el peluche de gorro, mira a cámara resignado; Rodri, entre carcajadas, le levanta el pulgar («¡premio!») y guiña un ojo.
10. Negro.

![Fotogramas de 00117](vista%20previa/00117%20Guillermo%20y%20Rodri%20-%20el%20muro%20de%20latas%20-%20fotogramas.png)

### 00118 · Guillermo y Rodri · El columpio

1. Negro.
2. Parque de noche, luna y ciudad al fondo. Rodri se columpia alto y chulo, con la cabeza echada atrás; Guillermo le ve, se pica y empieza a bombear con todas sus fuerzas.
3. Guillermo sube cada vez más alto, rojo y sudando; Rodri se da cuenta, frena arrastrando los pies y se queda con la boca abierta.
4. Guillermo da la vuelta completa por encima de la barra: las cadenas se enrollan, el columpio se encaja contra el tubo con un golpe seco y él se queda allí arriba, torcido, con chichón y los ojos en espiral.
5. Rodri se parte de risa en su columpio, se levanta y va andando hasta debajo de él, con las manos en los bolsillos.
6. Guillermo, colgado con las piernas a plomo, le mira suplicando; Rodri se ríe otra vez, se estira y le da un empujón en la suela.
7. Guillermo se desenrolla dando otra vuelta entera hacia atrás por encima de la barra y pasa volando sobre Rodri, que se agacha justo a tiempo.
8. El columpio va frenando; Guillermo, mareado con estrellitas, acaba sentado. Rodri se levanta riéndose.
9. Los dos miran a cámara: Guillermo con sonrisa mareada y Rodri guiña un ojo.
10. Negro.

![Fotogramas de 00118](vista%20previa/00118%20Guillermo%20y%20Rodri%20-%20el%20columpio%20-%20fotogramas.png)

### 00119 · Guillermo y Rodri · El chicle

1. Negro.
2. La puerta de una tienda de chucherías por la tarde: fachada verde menta con molduras crema, toldo de rayas rosas y blancas con el borde festoneado, un escaparate lleno de tarros de caramelos, piruletas y bastones, la puerta rosa con su ojo de buey, una máquina de chicles de bola, un banco y una piruleta gigante de cartel. Guillermo y Rodri, con las manos en los bolsillos.
3. Rodri saca un paquete de chicles y lo sacude: salen dos chicles volando; uno lo caza él con la boca y el otro va derecho a la boca de Guillermo (¡ñam!). Mascan los dos.
4. Rodri coge aire y hace un globo grande y perfecto, lo aguanta… y lo sorbe de golpe (¡chas!); mira a cámara muy chulo y guiña un ojo. Guillermo, boquiabierto: «ooh».
5. Guillermo se pica, masca a lo bruto, coge aire y sopla: el globo crece a empujones… y crece… más grande que su cabeza. Se pone de puntillas y el globo le levanta del suelo, con los pies colgando y braceando para no caerse, mientras Rodri recula alucinado.
6. ¡PAF!: el globo revienta y le tapa la cara entera (y los pinchos) con una capa de chicle; cae al suelo y bracea a ciegas («mmf, mmf»).
7. Rodri se parte de risa, se acerca, le pellizca la punta que le cuelga de la barbilla y se la arranca hacia arriba de un tirón, como una careta, entre hilos de chicle que se estiran.
8. Guillermo se queda pasmado, con pegotes de chicle en los pinchos; Rodri mira la careta, con la cara de Guillermo marcada.
9. Guillermo, muy digno, masca lo que le queda y hace un globito diminuto que le explota en la nariz; mira a cámara y Rodri guiña un ojo.
10. Negro.

![Fotogramas de 00119](vista%20previa/00119%20Guillermo%20y%20Rodri%20-%20el%20chicle%20-%20fotogramas.png)

### 00120 · Guillermo y Rodri · El brindis

1. Negro.
2. Una cervecería de noche: pared encalada con vigas, ventanas en arco con la luna, banderines azules y blancos, reloj de cuco, lámparas de hierro con velas, una mesa larga con jarras y un pretzel, y un barril con su grifo. Guillermo y Rodri, cada uno con una jarra de cristal enorme llena de cerveza y con su corona de espuma, se miran y alzan las jarras muy solemnes.
3. Cogen carrerilla: bajan la jarra a la cadera, se echan atrás, aprietan los dientes… y brindan con todas sus fuerzas.
4. ¡Pof! Las dos jarras revientan en una nube de espuma que los envuelve. Vuelan pegotes que se estampan en la pared, la mesa, las ventanas y el suelo, se balancean las lámparas y el cuco sale del susto.
5. La nube se posa sobre ellos. Quedan quietos, con los ojos cerrados, cubiertos de espuma de la cabeza a los hombros: corona blanca en el pelo, la barba de Rodri blanca y goterones por el pecho. A Guillermo le cuelga una gota de la nariz que acaba cayendo.
6. Parpadean (los ojos quedan limpios) y se miran muy serios… Se les escapa un «pff» y acaban partiéndose de risa, con lágrimas y soltando espuma a cada sacudida.
7. Se relamen el bigote de espuma, primero Guillermo y luego Rodri: la lengua lo barre de lado a lado. «Mmm».
8. Con el culito que les queda en las jarras, brindan otra vez, ahora con suavidad (¡tin!), miran a cámara y Rodri guiña un ojo.
9. Negro.

![Fotogramas de 00120](vista%20previa/00120%20Guillermo%20y%20Rodri%20-%20el%20brindis%20-%20fotogramas.png)

### 00121 · Guillermo y Sara · El tatuaje

1. Negro.
2. De noche, en el rincón de un estudio de tatuajes: pared ciruela con hojas de flash (corazón, golondrina, ancla, estrella, rosa, calavera simpática), neón de corazón con alas, balda de tintas, planta colgante, suelo de damero, sillón de tatuar con reposacabezas, reposabrazos, carrito y lámpara colgante. Sara prueba la máquina de tatuar (bzzz). Guillermo traga saliva y se hace el valiente.
3. Se sube la manga de dos tirones, pone el brazo en el reposabrazos y aparta la cara apretando los ojos, sudando y temblando.
4. Sara se acerca rodando en su taburete y arranca la máquina. Al primer bzzz, antes de que le toque, Guillermo se pone tieso y se desmaya: ojos en blanco, cabeza atrás contra el reposacabezas, lengua fuera y el otro brazo colgando.
5. Sara le mira sin inmutarse, mira a cámara, deja la máquina en el carrito, coge un rotulador y le quita el capuchón de un golpe de pulgar (¡pop!).
6. La cámara se acerca al antebrazo. Sara le dibuja un corazoncito trazo a trazo, sopla la tinta y deja el rotulador.
7. Espera mirándose las uñas y dando golpecitos con el pie.
8. Guillermo se despierta de un respingo, mira a todos lados, se mira el brazo y ve el corazón entre chispitas.
9. Se hincha de orgullo y saca bíceps con el corazón a la vista; el corazón late una vez y él mira a cámara. Sara sonríe de lado y mira a cámara.
10. Negro.

![Fotogramas de 00121](vista%20previa/00121%20Guillermo%20y%20Sara%20-%20el%20tatuaje%20-%20fotogramas.png)

### 00122 · Guillermo y Sara · El concierto

1. Negro.
2. Concierto de rock de noche, entre el público: al fondo a la derecha, el escenario con el truss de focos, la pantalla que late, torres de amplificadores y batería en silueta; haces de colores que barren despacio por encima de las cabezas, humo y siluetas del público que botan al compás (algunas con los cuernos en alto).
3. Sara cabecea a la perfección a 120 pulsaciones: la melena negra vuela en grandes arcos con estela y la cruz del collar se columpia. Guillermo la mira, alucina y se decide.
4. Guillermo cabecea… y sus pinchos no se mueven ni un pelo. Se mira el pelo, se pica (vena, cara roja) y lo intenta al doble de velocidad, sudando.
5. Se marea: ojos en espiral, estrellitas y tambaleo; y ¡crac!, le cruje el cuello: zigzags y la mano al cuello.
6. Con la mano en el cuello da un paso para asomarse; Sara carga un cabezazo enorme, la melena cae por delante… y con el latigazo sale por encima y le cruza la cara a Guillermo: ¡zas! Sale despedido un paso atrás, con mechones pegados, estrellitas y tres verdugones rojos que se le quedan.
7. Guillermo se frota la mejilla. Sara para, le mira de reojo, impasible, y le enseña los cuernos (índice y meñique).
8. Guillermo, encantado, los hace… con tres dedos. Sara, sin cambiar la cara, le apoya el índice en el dedo corazón y se lo dobla.
9. Él mira su mano corregida y se ilumina (destellos).
10. Los dos levantan los cuernos hacia el escenario botando al compás, miran a cámara y Sara guiña un ojo.
11. Negro.

![Fotogramas de 00122](vista%20previa/00122%20Guillermo%20y%20Sara%20-%20el%20concierto%20-%20fotogramas.png)

### 00123 · Guillermo y Sara · El delineado

1. Negro.
2. Un camerino de sala de conciertos, de noche: pared de ladrillo oscuro con carteles sin letras (un rayo, una estrella, una guitarra) y pegatinas, una guirnalda de bombillas, una guitarra eléctrica roja en su soporte, un amplificador y la puerta del camerino con su estrella dorada; en la pared de la izquierda, un espejo de camerino rodeado de bombillas y una repisa con brochas, laca, polvera, pintalabios y perfume. Sara se pinta la raya delante del espejo (también la vemos reflejada), con la boca entreabierta de concentración: el lápiz recorre el párpado y, de un solo golpe de muñeca, le sale un rabillo perfecto (¡ting!). Guillermo, detrás, con el puño en la barbilla, alucina: «ooh».
3. Guillermo se acerca, señala el lápiz y pone ojitos de cachorro con las manos juntas. Sara se gira, se encoge de hombros, le llama con el dedo y se pasa el lápiz a la otra mano.
4. Guillermo se agacha delante de ella, cierra un ojo y Sara empieza a pintarle la raya.
5. Le pica la nariz: «ah…», «ah…», ¡ACHÍS! Con el latigazo, el lápiz le cruza la mejilla de una raya hasta la oreja; las gotitas acaban en la cara de Sara y le echan el pelo atrás. Silencio. Guillermo se limpia la nariz; Sara mira la raya.
6. Sara intenta arreglarlo: garabatea alrededor de un ojo, duda, garabatea el otro para igualarlo y difumina la raya… y le deja unos ojos de mapache. Él abre los ojos sonriendo, muy contento; ella mira a cámara.
7. Sara le señala el espejo: Guillermo se ve, se lleva un susto, se enamora de su nuevo look y posa de rockero: cuernos con las dos manos, lengua fuera y cabeceando. Su reflejo hace lo mismo.
8. Sara mira a cámara impasible y sonríe de lado.
9. Negro.

![Fotogramas de 00123](vista%20previa/00123%20Guillermo%20y%20Sara%20-%20el%20maquillaje%20-%20fotogramas.png)

### 00124 · Guillermo y Sara · La tormenta

1. Negro.
2. Buhardilla de noche: ventana grande con cortinas de terciopelo mostaza, sillón orejero con una manta de cuadros, estantería y lámpara de pie. Fuera llueve sobre la ciudad.
3. Sara quita el pestillo y abre la ventana de par en par: entra el viento con lluvia, la melena le vuela hacia atrás y ella cierra los ojos y sonríe con los brazos abiertos. Guillermo tirita con las manos en los bolsillos.
4. Primer trueno (relámpago en rampa suave y retumbo): Guillermo da un respingo y corre a esconderse detrás de la cortina; solo asoman los ojos, los pinchos, los puños y las zapatillas, temblando. Sara le mira de reojo y levanta una ceja.
5. Segundo trueno, más fuerte: sale de la cortina de un salto más alto, se da la vuelta, corre al sillón, coge la manta y se la echa por encima. Un fantasma con agujeros para los ojos se acerca a saltitos; Sara sonríe de lado.
6. Tercer trueno, el más gordo: el fantasma pega un salto enorme, la manta sale disparada hacia arriba, cuelga vacía y cae arrugada al suelo, y Guillermo aterriza en brazos de Sara, que le coge sin apartar la vista de la tormenta.
7. Sara le sostiene como a un gato y sigue mirando los relámpagos; él se agarra a su camiseta con las piernas colgando. Ella le rasca debajo de la barbilla y él ronronea, hasta que un último relámpago le hace dar un respingo.
8. Guillermo mira a cámara colorado; Sara, impasible, también mira a cámara con media sonrisa.
9. Negro.

![Fotogramas de 00124](vista%20previa/00124%20Guillermo%20y%20Sara%20-%20la%20tormenta%20-%20fotogramas.png)

### 00125 · Guillermo y Sara · No te rías

1. Negro.
2. De noche, en un rincón tranquilo de un bar: pared azul tinta con friso de madera, ventana con la luna y la ciudad, diana con dos dardos, reloj sin números, balda con cajas de juegos de mesa y un cuadrito, guirnalda de bombillas, suelo de tablas, una mesita redonda con una vela, un refresco y una copa de vino, una lámpara de latón encima y dos sillas de madera. En la de Guillermo, bien a la vista, un cojín de broma rosa.
3. Reto de «el primero que se ría pierde»: Guillermo, de pie, señala a Sara, se cruje el cuello y se inclina sobre la mesa. Sara, sentada con una mano en la mesa, es un muro: cara de nada y parpadeos lentos. La cámara se acerca a las caras.
4. Primera mueca: aprieta los ojos… y saca la lengua bizco, meneando la cabeza. La cámara va despacio hasta Sara: nada.
5. Segunda: coge aire, hincha los dos mofletes y suelta una pedorreta; una gota de saliva vuela y le cae a Sara en la mejilla. Ella parpadea, muy despacio.
6. Tercera: arruga la nariz y abre las aletas una y otra vez, con las cejas subiendo y bajando a destiempo.
7. Cuarta: mueve la oreja, que aletea. A Sara le da un tic en un ojo, una sola vez, y vuelve a ser de piedra.
8. Guillermo se rinde: se endereza, se mete las manos en los bolsillos, suspira (una nubecilla) y se deja caer en su silla… encima del cojín, que se aplasta y suelta una pedorretita (ondas de sonido y una nube de aire por la boquilla).
9. Silencio. Sara aguanta con los mofletes hinchados, temblando… y revienta de risa: cabeza atrás, lágrimas que saltan, mano en la tripa, hombros temblando y la melena botando. La silla se le va hacia atrás con los pies en el aire, casi se cae, vuelve y da palmadas en la mesa.
10. Guillermo la mira, mira a cámara sorprendido, sonríe encantado y guiña un ojo con un destello.
11. Negro.

![Fotogramas de 00125](vista%20previa/00125%20Guillermo%20y%20Sara%20-%20el%20pulso%20de%20miradas%20-%20fotogramas.png)

### 00126 · Guillermo y Sara · El collar

1. Negro.
2. Paseo marítimo a media tarde y con mucho sol (mar con chispitas, palmera, barandilla blanca, maceta de geranios, baldosas en ondas). Guillermo le cuenta algo a Sara muy animado; ella escucha sin inmutarse.
3. Sara cambia el peso de pie, la cruz del collar pilla el sol y ¡ting!: un destello directo a los ojos de Guillermo, que se deslumbra y da un paso atrás, mareado.
4. Se hace visera con la mano, muy listo… Sara ladea la cabeza y el destello le entra por debajo de la mano.
5. Se agacha del todo y sonríe a cámara: el destello le pasa por encima… y se dobla como una manguera hasta sus ojos. Guillermo salta, se frota los ojos y frunce el ceño.
6. Saca unas gafas de sol rojas del bolsillo, las abre de un golpe de muñeca, se las pone y posa triunfal mirando a cámara.
7. Sara pone los ojos en blanco y aparta la cabeza con un golpe de melena: el aro de la nariz lanza un destello enorme contra los cristales y Guillermo sale despedido y cae de culo, con las gafas torcidas.
8. Hundido en el suelo, se rinde: saca un pañuelo blanco y lo ondea.
9. Sara, que nunca se ríe, se parte de risa; luego coge la cruz, se la mete por dentro del top y da una palmadita.
10. Guillermo suspira aliviado y los dos miran a cámara.
11. Negro.

![Fotogramas de 00126](vista%20previa/00126%20Guillermo%20y%20Sara%20-%20la%20cruz%20del%20collar%20-%20fotogramas.png)

### 00127 · Guillermo y Sara · El monopatín de noche

1. Negro.
2. Calle de noche con la cámara viajando a su lado: farolas con conos de luz anaranjada, fachadas con ventanas encendidas, persianas con pintadas, bicis aparcadas y el asfalto liso; la luna menguante al fondo.
3. Sara patina sin esfuerzo, con la melena negra al viento: empuja, se desliza y traza una curva (la tabla se inclina y enseña la lija y luego el dibujo de la luna, dejando dos surcos de luz). Guillermo corre detrás para no quedarse atrás, con la lengua fuera y sudando a chorros.
4. Sara le mira de reojo, sonríe y se escapa con otro empujón.
5. Frena de cola (saltan chispas) y se queda de pie en la tabla mirándole, impasible. Guillermo llega reventado y se apoya en las rodillas, jadeando y echando vaho.
6. Se le ocurre algo: señala la tabla con cara de pillo (Sara levanta una ceja), retrocede, coge carrerilla y salta en bomba a la cola, detrás de ella.
7. La tabla sale disparada con los dos: se tambalean con los brazos como aspas, él se agarra al hombro de Sara y, de otro tirón, salen de cuadro por la derecha.
8. Un instante de calma… ¡crash! fuera de cuadro: tiembla todo, un estallido en el borde, polvo y hojas por el aire; entra rodando una tapa de cubo de basura que se tambalea hasta quedarse plana, y un gato negro sale escopetado, erizado, con un maullido.
9. La tabla vuelve sola rodando, pilla un bache, da media vuelta en el aire y se queda boca arriba con las ruedas girando.
10. Vuelven los dos cojeando, con polvo y hojas en el pelo: Sara, con las manos en los bolsillos, levanta la tabla con un toque del pie y la recoge al vuelo; Guillermo, frotándose la cabeza, levanta el pulgar.
11. Miran a cámara y Sara sonríe de medio lado.
12. Negro.

![Fotogramas de 00127](vista%20previa/00127%20Guillermo%20y%20Sara%20-%20el%20skate%20de%20noche%20-%20fotogramas.png)

### 00128 · Guillermo y Sara · La salsa picante

1. Negro.
2. Pizzería de porciones de madrugada: azulejo blanco, ventanal a la calle de noche, horno de acero encendido con cajas encima, neones de una porción y de una guindilla (sin letras) y un reloj sin números a las dos y diez. Guillermo y Sara de pie en una mesita alta con mantel de cuadros, cada uno con su porción; en medio, un bote de salsa picante con una calavera en la etiqueta y, junto a Sara, un cartón de leche con manchas de vaca.
3. Sara coge el bote, lo pone boca abajo y empapa su porción a sacudidas (siete gotas que salpican); Guillermo se queda con la boca abierta.
4. Le deja el bote delante, levanta una ceja y le da un mordisco enorme (hilo de queso); mastica sin inmutarse y sin pestañear.
5. Guillermo, chulo, coge el bote y con la lengua fuera lo inclina despacísimo: en primer plano cae UNA gota en su porción (¡plip!). Lo deja y mira a cámara orgulloso.
6. Muerde y mastica sobrado mirando a cámara… para. Ojos como platos.
7. El rojo le sube del cuello a la frente como un termómetro; suelta la porción, le sale vapor por la oreja, humo por los pinchos y lágrimas a chorro.
8. Echa la cabeza atrás y lanza una llamarada hacia arriba; a Sara solo se le mueve el pelo.
9. Se abanica la boca dando saltitos con la lengua fuera. Sara deja su porción, le desliza el cartón de leche por la mesa y vuelve a morder la suya.
10. Guillermo se bebe el cartón entero de un trago, cabeza atrás, y lo aplasta; el rojo baja, suspira aliviado con un bigote de leche.
11. Sara le ofrece otra vez el bote; él dice que no con la cabeza y la mano, y mira a cámara.
12. Sara se encoge de hombros, le echa dos sacudidas más a su porción y mira a cámara con media sonrisa.
13. Negro.

![Fotogramas de 00128](vista%20previa/00128%20Guillermo%20y%20Sara%20-%20la%20pizza%20picante%20-%20fotogramas.png)

### 00129 · Guillermo y Sara · El baile gótico

1. Negro.
2. Un club gótico de noche: pared de piedra violeta, tres ventanales ojivales de vidriera que brillan, cortinas de terciopelo, candelabros con velas que titilan, una bola de espejos que salpica destellos y niebla baja arrastrándose por el suelo de baldosas.
3. Sara baila un baile gótico lento y dramático: brazos que ondulan como humo, muñecas que giran, pasos que flotan, la melena que fluye y los ojos entornados.
4. Guillermo la mira, asiente al ritmo, mira a cámara muy seguro de sí mismo y la imita con unos brazos de fantasma exagerados: estirados, las manos colgando, los dedos retorciéndose y la boca en «uuuh».
5. Prueba el giro de muñecas y se lía: un brazo sobre la barriga, la otra mano en la frente, las piernas cruzadas; se tambalea.
6. Da un saltito atrás y le da con el talón a la máquina de humo: se enciende el piloto verde y sisea. Él mira atrás…
7. ¡Fuuush!: un chorro de niebla sube desde el suelo, Guillermo levanta los brazos del susto y se hunde; el banco de niebla se lo traga entero.
8. Del banco solo asoman sus pinchos: se deslizan a la izquierda y a la derecha como una aleta de tiburón, miran alrededor como un periscopio, dan una vuelta sobre sí mismos y botan.
9. Sara abre un ojo, deja de bailar y, sin cambiar la cara, va hasta la niebla.
10. Le pinza el tupé y tira: Guillermo sale de un tirón y la niebla estalla en bocanadas y se deshace.
11. Guillermo se queda tosiendo nubecitas, con los ojos en espiral y estrellitas; Sara da unos pasos atrás.
12. Sara vuelve a bailar; él prueba un solo brazo de fantasma, muy serio, y ella le da el visto bueno con un levísimo gesto de cabeza. Él se ilumina.
13. Los dos miran a cámara.
14. Negro.

![Fotogramas de 00129](vista%20previa/00129%20Guillermo%20y%20Sara%20-%20el%20baile%20gotico%20-%20fotogramas.png)

### 00130 · Guillermo y Sara · La azotea

1. Negro.
2. Noche en el pretil de una azotea: ciudad encendida, un puente lleno de luces, estrellas, luna y una guirnalda de bombillas. Sara y Guillermo, sentados con las piernas colgando, comparten auriculares de cable: el móvil en el pretil y el cable en Y hasta la oreja de cada uno. Cabecean al ritmo con los ojos cerrados.
3. Guillermo toma aire y se arranca a cantar a pleno pulmón: ojos cerrados, bocaza, puño en alto y notas con pinchos desafinadas.
4. Sara abre un ojo, aprieta los dos con el agudo y se quita su auricular, que queda colgando y balanceándose. Él ni se entera.
5. Sara mira la oreja de Guillermo, levanta una ceja, se inclina y, con dos dedos, le quita su auricular y se lo pone en su otra oreja.
6. Recoge el auricular que colgaba y se lo vuelve a poner: los dos para ella. Cabecea feliz con los ojos cerrados.
7. Guillermo sigue cantando solo, sin música: se queda colgado con la boca abierta en los silencios, y la última nota le sale rota y se cae.
8. Abre los ojos, se toca la oreja vacía y mira a Sara con los dos auriculares puestos.
9. Se pone como un tomate, se rasca la nuca y le cae una gota de sudor.
10. Sara abre los ojos, sonríe, se saca un auricular y se lo ofrece; él lo coge y se lo pone.
11. Cabecean juntos al mismo ritmo.
12. Cruza una estrella fugaz; la miran y luego miran a cámara.
13. Negro.

![Fotogramas de 00130](vista%20previa/00130%20Guillermo%20y%20Sara%20-%20el%20atardecer%20en%20la%20azotea%20-%20fotogramas.png)

### 00131 · Guillermo y Yorgi · El batido de proteínas

1. Negro.
2. Una cocina luminosa por la mañana: pared amarilla, una ventana con el sol recién salido y rayos de luz con motas de polvo, azulejos blancos con flores azules, muebles verde salvia, una toalla de gimnasio colgada y una pesa rusa en el suelo. En la encimera, una batidora roja con jarra de cristal, un frutero, un tarro de avena, un bote de proteína con una mancuerna dibujada… y la tapa de la batidora, olvidada a un lado.
3. Yorgi echa los ingredientes con mucho arte: coge un plátano, lo pela de un golpe de muñeca y la fruta sale volando por encima de su cabeza hasta la jarra. Repite con otro, más rápido, y tira las pieles a la encimera. Luego, una cucharada de avena.
4. Saca un cacillo ENORME de proteína, lo enseña orgulloso y lo vuelca: ¡puf!, nube de polvo, y Guillermo tose.
5. Aprieta el botón: giran las cuchillas y todo da vueltas. Guillermo se acerca a mirar, apoyado en la encimera.
6. ¡No tiene tapa! El batido sube por las paredes y sale disparado: una fuente hasta el techo, que se estampa y gotea, y un chorro por el pico directo a la cara de Guillermo.
7. Guillermo se queda quieto, cubierto de batido beige: pelo, cara y hombros, con chorretones por el pecho. Una gota del techo le cae en la cabeza. Abre los ojos (limpios) y mira a Yorgi muy serio.
8. Yorgi, tan tranquilo, coge la jarra y se bebe lo que queda de un trago, cabeza atrás («glu, glu»). Se limpia la boca con el dorso de la mano y saca bíceps (destello).
9. A Guillermo le cuelga una gota de la nariz: la mira, saca la lengua hacia arriba y se la lleva… «mmm»… ¡está buenísimo! Pulgar arriba.
10. Los dos miran a cámara: Yorgi vuelve a sacar bíceps y guiña un ojo.
11. Negro.

![Fotogramas de 00131](vista%20previa/00131%20Guillermo%20y%20Yorgi%20-%20el%20desayuno%20de%20campeones%20-%20fotogramas.png)

### 00132 · Guillermo y Yorgi · Las flexiones

1. Negro.
2. El bar ya cerrado, de noche: papel pintado burdeos con rayas, zócalo de nogal, dos apliques encendidos, una lámpara colgante que deja un charco de luz en el suelo de tablas, una mesa arrimada a la pared con las sillas patas arriba, la máquina del alcoholímetro con sus cifras rojas y el extremo de la barra con las botellas. Yorgi y Guillermo, de perfil y cabeza con cabeza, en plancha. Yorgi le reta levantando una ceja.
3. Yorgi hace dos flexiones con palmada: se impulsa, despega las manos, da la palmada bajo el pecho (con rayitas de golpe) y vuelve a apoyar, tan tranquilo. Guillermo, boquiabierto.
4. Yorgi pasa a una mano, con la otra a la espalda, hace dos y, abajo del todo, guiña un ojo a cámara. Guillermo se pica (vena).
5. Guillermo mira a cámara decidido, hincha los mofletes y baja temblando… se queda atascado a medio camino: brazos temblorosos, colorado, sudando, dientes apretados. Intenta subir y no puede.
6. Se desploma: ¡plaf!, la cara aplastada contra el suelo, nube de polvo y estrellitas. Yorgi se ríe.
7. Yorgi le señala su espalda con el pulgar: «súbete». Guillermo levanta la cabeza, encantado, se impulsa, da un saltito encogido y cae sentado en lo alto de la espalda de Yorgi, como un jinete, con las piernas colgando por el otro lado.
8. Yorgi hace tres flexiones con él encima: Guillermo, con una mano en jarra, rebota con un poco de retraso, primero mareado y luego a gusto, y saca el pulgar delante del pecho con el antebrazo bien horizontal.
9. La cámara se acerca y los dos miran a cámara, sonrientes.
10. Negro.

![Fotogramas de 00132](vista%20previa/00132%20Guillermo%20y%20Yorgi%20-%20las%20flexiones%20-%20fotogramas.png)

### 00133 · Guillermo y Yorgi · Llegas tarde

1. Negro.
2. Mediodía a la puerta de un bar de esquina (azulejo verde, toldo de rayas, banco, farola de forja, mucho cielo). Yorgi espera: toquecitos con el índice en el reloj, mira calle abajo, resopla y da golpecitos con el pie.
3. El tiempo vuela: el sol cruza el cielo y baja hacia los tejados, las nubes pasan a toda prisa, las sombras giran alrededor de los pies y se alargan, la luz se vuelve de media tarde y la farola se enciende. Yorgi, a cámara rápida: se sienta aburrido en el banco, mira el reloj, hace sentadillas, se pone en jarras y vuelve a mirar el reloj.
4. Guillermo llega corriendo (su sombra larga llega antes que él), derrapa y se dobla jadeando con las manos en las rodillas, sudando.
5. Se yergue tan ancho y se da toquecitos en la muñeca («¡llego a la hora!»)… se la mira: no lleva reloj.
6. Yorgi le acerca su reloj; Guillermo se inclina a mirarlo de muy cerca, casi con la nariz encima.
7. ¡Pi-pi-pi!: suena la alarma (ondas en zigzag, el reloj vibra y late en rojo); Guillermo da un respingo, salta y cae sentado de culo con una polvareda.
8. Yorgi apaga la alarma y se parte de risa sujetándose la barriga.
9. Da un paso, le tiende la mano y le levanta de un tirón.
10. Le da unas palmadas amistosas en el hombro y deja la mano ahí, de colegas.
11. Los dos miran a cámara: pulgar arriba de Guillermo y guiño de Yorgi.
12. Negro.

![Fotogramas de 00133](vista%20previa/00133%20Guillermo%20y%20Yorgi%20-%20el%20reloj%20-%20fotogramas.png)

### 00134 · Guillermo y Yorgi · La hamburguesa gigante

1. Negro.
2. Una hamburguesería de las de antes: pared verde menta, neón con forma de hamburguesa, pizarras de menú solo con dibujos y suelo de cuadros. Guillermo y Yorgi, en taburetes de cromo, uno a cada lado de la barra.
3. ¡Ding! Por la ventanilla de la cocina salen deslizándose dos torres de hamburguesa con su banderita y se paran delante de cada uno, bamboleándose como un flan. Guillermo se queda con la boca abierta.
4. Yorgi se frota las manos, coge la suya con las dos manos y desencaja la mandíbula hasta el pecho: se la come en tres bocados (cada uno deja la marca de los dientes, el último con palillo y todo), mastica con la cara hinchada, traga y se da palmaditas en la barriga.
5. Guillermo traga saliva mirando a cámara, se arma de valor y lo intenta: abre la boca todo lo que puede, tiembla y se pone rojo, pero no cabe.
6. La aplasta entre las manos: la torre se comprime y el kétchup y la mostaza salen a chorro por los dos lados y le dejan la cara llena de manchas.
7. Aparta la mano de abajo del susto y la torre, colgando del pan de arriba, se desmorona: las capas caen de una en una a su regazo, cada una con su botecito, mientras él las sigue con la mirada y Yorgi aguanta la risa.
8. Le queda solo la tapa. Yorgi, sonriendo, le ofrece una servilleta; Guillermo deja la tapa en el plato y se la remete en el cuello como babero (tarde).
9. Recoge la tapa, le da un mordisquito diminuto con toda la dignidad del mundo y los dos miran a cámara; Yorgi, con el pulgar arriba.
10. Negro.

![Fotogramas de 00134](vista%20previa/00134%20Guillermo%20y%20Yorgi%20-%20la%20barbacoa%20-%20fotogramas.png)

### 00135 · Guillermo y Yorgi · Los pendientes

1. Negro.
2. Un salón con luz de mañana: ventana con la casa de enfrente al sol, cortinilla de cuadros rojos colgada de una barra con anillas grandes de madera y un espejo de pie. Yorgi cuenta algo, se ríe y sus aritos pillan la luz (¡ting!).
3. Guillermo se queda embobado y se toca el lóbulo vacío. Mira alrededor y se le ocurre una idea.
4. Saca dos anillas de la barra y la esquina de la cortina se descuelga. Les da la vuelta: son enormes. Se las cuelga de las orejas. ¡Tachán!
5. Presume moviendo la cabeza, pero el aro va y viene como un péndulo y le da en la mejilla (¡toc!). Lo vuelve a intentar: ¡toc, toc! Se pica.
6. Gira cada vez más rápido hasta dar vueltas sobre sí mismo. Los aros salen hacia fuera y uno sale disparado… Yorgi lo caza al vuelo y le da dos vueltas en el dedo.
7. Guillermo se queda mareado, con los ojos en espiral y el otro aro dando bandazos (¡toc!). Yorgi se acerca por detrás, sujeta el aro y se lo quita con cuidado mientras Guillermo le ofrece la oreja.
8. Yorgi saca del bolsillo un aro de clip diminuto y se lo pone (¡tic!).
9. Guillermo se ve en el espejo, se gira de perfil con la barbilla alta y los puños en las caderas, y el aro nuevo brilla.
10. Guillermo mira a cámara orgulloso y Yorgi levanta el pulgar. Brillan los aros de los dos.
11. Negro.

![Fotogramas de 00135](vista%20previa/00135%20Guillermo%20y%20Yorgi%20-%20el%20pendiente%20-%20fotogramas.png)

### 00136 · Guillermo y Yorgi · La carrera

Un paseo peatonal de un pueblo blanco, una tarde de sol (fachadas de colores al otro lado de la calzada, naranjos, farolas, un banco). Al fondo del paseo, el bar: quiosco encalado con zócalo de azulejos, jamones en la ventana, cartel de la jarra, la máquina del alcoholímetro y la puerta verde con campanilla. En el suelo hay dibujos de tiza: la salida escalonada, las calles, una rayuela y la meta a cuadros. Un cordón corto une las zapatillas de Guillermo desde el principio.

1. Negro.
2. Preparados (semáforo en rojo): Yorgi calienta con botecitos y sacude las manos; Guillermo le copia con los pies juntos.
3. Listos (ámbar): Yorgi en posición de salida de pie, de atleta; Guillermo con las manos en las rodillas. Se miran de reojo.
4. ¡Ya! (verde con destello): Yorgi sale disparado, perfecto, con nube de polvo y rayas de velocidad.
5. Guillermo da la zancada, el cordón se tensa (¡tuing!) y se cae de bruces, tieso como una tabla: ¡plaf!, polvo y estrellitas.
6. Levanta la cabeza, se mira los pies, ve el cordón y pone cara de decidido. Se levanta de golpe, como un resorte.
7. Saltitos de conejo por todo el paseo, pies juntos, puños y lengua fuera; la cámara le sigue.
8. Yorgi sujeta la puerta del bar abierta por la barra, a la derecha del hueco y de cara a la calle, y se ríe al verle llegar. Le hace una reverencia de caballero (mano al corazón) y le indica la puerta con la palma arriba.
9. Guillermo salta al umbral sin pasar por delante de Yorgi, le devuelve una reverencia torpe y se da media vuelta para celebrarlo de cara a la calle. Yorgi, con la floritura final, suelta la puerta: se cierra de golpe desde la derecha y le da en el trasero (¡boing!). Guillermo entra trastabillando. Tilín de la campanilla.
10. Yorgi, tapándose la boca, se parte de risa (la cámara se acerca).
11. Por la rendija de la puerta sale el brazo de Guillermo con el pulgar arriba. Yorgi le contesta con otro pulgar, mira a cámara y guiña un ojo.
12. Negro.

![Fotogramas de 00136](vista%20previa/00136%20Guillermo%20y%20Yorgi%20-%20la%20carrera%20-%20fotogramas.png)

### 00137 · Guillermo y Yorgi · La sorpresa
1. Negro.
2. El bar a oscuras: solo la raya de luz de la puerta y, por encima de la barra, dos ojitos que parpadean y se esconden.
3. Se abre la puerta: la luz de la calle entra en abanico y la silueta de Guillermo entra a tientas, una mano en el marco y la otra palpando la pared.
4. ¡Clic! Las luces suben en una rampa suave: banderines con estrellas, globos, bombillas y una tarta con cinco velas encendidas.
5. Yorgi salta de detrás de la barra soplando un matasuegras entre una lluvia de confeti; Guillermo da un respingo con las manos arriba.
6. Guillermo avanza mirándolo todo (ve la tarta); Yorgi sale de la barra y le recibe con un «¡tachán!» y otro soplido.
7. A Guillermo le tiembla el labio… y rompe a llorar: dos chorros de lágrimas en arco. A Yorgi se le cae el matasuegras de la boca.
8. Yorgi abre los brazos, Guillermo se le lanza y Yorgi le recoge en un abrazo de oso y le iza en el aire, con los pies colgando.
9. Desde arriba, el chorro de lágrimas llega a la tarta y apaga las velas una a una (vapor, siseo y humito).
10. Se miran la tarta, se miran ellos y se parten de risa; Yorgi le zarandea de la risa.
11. Los dos miran a cámara (Guillermo aún en volandas); Yorgi guiña un ojo. Quedan las velas humeando, la tarta mojada, los charcos y el confeti.
12. Negro.

![Fotogramas de 00137](vista%20previa/00137%20Guillermo%20y%20Yorgi%20-%20el%20abrazo%20de%20cumpleanos%20-%20fotogramas.png)

### 00138 · Guillermo y Yorgi · La mancuerna

1. Negro.
2. El rincón de pesas de un gimnasio: pared de espejos, el mueble de mancuernas (falta una), carteles con iconos, un banco y kettlebells. Yorgi se pasa una mancuerna enorme de una mano a otra, dando una vuelta en el aire cada vez, y Guillermo la sigue con los ojos, alucinando.
3. Yorgi le levanta una ceja («¿quieres?»). Guillermo asiente y saca las manos, y Yorgi coge impulso y se la lanza.
4. Guillermo la caza al vuelo y pone cara de chulo… y el peso le arrastra: primero caen los brazos y luego el cuerpo, con las rodillas dobladas.
5. Colorado y temblando, la sube hasta el pecho, se tambalea hacia atrás y cae de espaldas como un tablón. ¡Pum!, nube de polvo, y la mancuerna rebota y se queda encima de su pecho.
6. Atrapado, solo se le mueven los brazos y la cabeza: estrellitas, empuja un disco sin conseguir nada, boquea, sacude el brazo en el aire y da tres palmadas en el suelo.
7. Yorgi, que se ha apartado un par de pasos al verle caer, se aguanta la risa con la mano en la boca. Luego pasa por detrás de él con las manos en los bolsillos, se da la vuelta junto a su cabeza, se agacha y la levanta con un dedo debajo de la barra.
8. La hace botar en el dedo mientras da un pasito, la caza por un disco y la aprieta: el disco se aplasta y chirría, era de gomaespuma. Otra vez: ¡ñic!
9. Guillermo la mira inexpresivo, con un tic en el ojo… y se levanta tieso como una tabla, girando sobre los talones.
10. Se da la vuelta, se sacude la camiseta y el hombro y saca bíceps con la barbilla alta, como si nada (brillito en el bracito). Yorgi se parte de risa.
11. Los dos miran a cámara y Yorgi guiña un ojo y aprieta la mancuerna una última vez.
12. Negro.

![Fotogramas de 00138](vista%20previa/00138%20Guillermo%20y%20Yorgi%20-%20la%20mancuerna%20-%20fotogramas.png)

### 00139 · Guillermo y Yorgi · La siesta
1. Negro.
2. La terraza de un bar en la sobremesa, con sol de media tarde. Hay una sombrilla grande de rayas sobre una mesita con los restos de la comida (la raspa del pescado, una caña, un tinto de verano) y, al fondo, un pueblo blanco entre olivos. Guillermo y Yorgi están en dos tumbonas de lona de rayas, una frente a otra. Yorgi se da palmaditas en la barriga, se estira a lo grande, bosteza… y se queda frito en el acto: la cabeza cae contra la lona, la boca abierta y un brazo colgando. Ronca con pompitas en la nariz.
3. Guillermo alucina, se ríe y se tumba. Una mosca le ronda y se le posa en la nariz. Abre un ojo y ¡zas!: se da en la frente, y la mosca se va al plato de la raspa.
4. La tarde avanza: el sol sale por debajo de la sombrilla y les da en la cara. Guillermo se hace visera y coge las gafas de sol que lleva colgadas de la camiseta. A Yorgi, dormido, se le frunce el ceño.
5. Yorgi coge muchísimo aire y suelta un ronquido gordo: las ondas cruzan la terraza, la mosca sale volando, los flecos de la sombrilla se agitan y a Guillermo se le va el pelo hacia atrás. Luego el pelo vuelve a su sitio con rebote.
6. Guillermo le mira fatal… suspira, mira las gafas, apunta con la lengua fuera y se las lanza. Vuelan dando vueltas por encima de la mesa y le caen a Yorgi en la cara, perfectas (¡clic!, destello).
7. Yorgi sonríe en sueños y ronca bajito. Guillermo, pasmado, se viene arriba y hace «¡sí!» con el puño.
8. Sin gafas, Guillermo coge la servilleta de cuadros del regazo, la sacude y se la echa por la cara.
9. Roncan los dos, primero a destiempo y luego a la vez; la servilleta se infla cada vez que suelta el aire. Las pompas crecen, se sueltan, vuelan hasta el centro y se funden en una gorda que tiembla… ¡plof! Los dos dan un respingo y siguen durmiendo.
10. La mosca vuelve y se posa en las gafas de Yorgi, frotándose las patas.
11. Negro.

![Fotogramas de 00139](vista%20previa/00139%20Guillermo%20y%20Yorgi%20-%20la%20siesta%20-%20fotogramas.png)

### 00140 · Guillermo y Yorgi · El selfie del gimnasio
1. Negro.
2. Un gimnasio muy luminoso: barras de LED colgadas, pared gris claro con una franja naranja y zócalo verde petróleo, carteles solo con iconos (rayo, brazo, mancuerna), un reloj sin números, un árbol de discos de colores, kettlebells, un banco, cajones de salto y una esterilla morada sobre el suelo de caucho. A la derecha, toda la pared es un espejo en el que se ven la sala y los dos, reflejados.
3. Yorgi se hace un selfie en el espejo: móvil en alto, saca bíceps con el otro brazo, dos bombeos y ¡ting!. Levanta una ceja, pone morritos y se echa un pelín atrás para buscar el ángulo.
4. Guillermo entra de un salto por la izquierda, sacando bíceps y con el otro puño en alto. Aterriza con un aplastón a su lado y se planta: bíceps y puño en la cadera. Yorgi le mira de reojo.
5. A Guillermo le tiembla el brazo. Mira el bíceps de Yorgi, mira el suyo… y decide hinchar el pecho: coge aire, moflete hinchado, cara roja y todo le tiembla. Yorgi le mira otra vez y aguanta la risa.
6. Yorgi dispara. Guillermo pone cara de orgullo y la costura del hombro cede: un rasgoncito, la manga aletea y… ¡FLASH! La manga sale disparada como un corcho, dando vueltas.
7. Guillermo nota el aire y se mira el hombro: el brazo, blanquísimo, con la marca del moreno. La manga cae sobre la esterilla (¡plof!).
8. Yorgi mira la foto en el móvil y se parte de risa, con la mano en la barriga.
9. Guillermo se encoge de hombros y vuelve a sacar bíceps con el brazo pálido, más orgulloso que nunca (¡ting!). Yorgi, aún riéndose, mira otra vez la foto.
10. La escena se oscurece y aparece la foto del espejo, con su borde blanco, un poco torcida y con sombra: los dos sacando bíceps, el destello del flash en el móvil y la manga volando.
11. Negro.

![Fotogramas de 00140](vista%20previa/00140%20Guillermo%20y%20Yorgi%20-%20el%20selfie%20del%20gimnasio%20-%20fotogramas.png)

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
├─ personajes/marta/            coordenadas de Marta y su atlas
├─ personajes/paradigma/        coordenadas de Paradigma y su atlas
├─ personajes/rodri/            coordenadas de Rodri y su atlas
├─ personajes/sara-saez/        coordenadas de Sara Sáez, su atlas y el collar
├─ personajes/yorgi/            coordenadas de Yorgi y su atlas
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

**Marta** (`personajes/marta/`) sale de `Avatares 2D/Marta/Marta-2D.png` con el recortador común. Su avatar mira a la izquierda, así que la hoja se refleja antes de trocearla («espejar»).

- **Piezas:** la cabeza del retrato con su pinza de carey (cuencas vacías y sin el cuello del retrato), la cara roja, las cejas, la boca con labios, el torso de la chaqueta de punto gris hasta la cintura del vaquero, las dos mangas enderezadas, las piernas del vaquero, la zapatilla con la suela nivelada y la melena larga en dos tiras que se balancean (una detrás, reflejada).
- **Limpieza:** la melena que caía por delante se quita y lo que tapaba se rehace con el punto de la chaqueta (mosaico) y la piel del escote. Las manos de los bolsillos se quitan y se copia el vaquero de debajo, con la abertura del bolsillo. El cuello lo pone el cuerpo, con pelo en sombra detrás.
- **En pantalla:** los hombros los trae el torso con su punto y la mano se dibuja aparte al sacarla del bolsillo.
- **Altura:** con el mismo `p.s` mide ≈ 93 % de Guillermo, como Laura y Carla.

**Paradigma** (`personajes/paradigma/`) sale de `Avatares 2D/Paradigma/Paradigma-2D.png` con el recortador común.

- **Piezas:** la cabeza del retrato con el pelo ondulado, bigote, perilla y barba de tres días (sin el cuello ni la cazadora del retrato, y con los huecos entre mechones sueltos como fondo), la cara roja, las cejas, la boca, el torso de la cazadora negra abierta con la camiseta blanca hasta la cintura del vaquero, las dos mangas enderezadas, las piernas del vaquero y la zapatilla con la suela nivelada.
- **Limpieza:** se quitan las manos que asomaban de los bolsillos (solo la piel y su contorno) y se repintan el bajo de la cazadora, el borde del puño y la abertura del bolsillo.
- **En pantalla:** los hombros son negros y la mano se dibuja aparte al sacarla del bolsillo.
- **Altura:** con el mismo `p.s` mide prácticamente lo mismo que Guillermo.

**Rodri** (`personajes/rodri/`) sale de `Avatares 2D/Rodri/Rodri-2D.png` con el recortador común.

- **Piezas:** la cabeza del retrato con el pelo alborotado, el flequillo y la barba poblada (cuencas vacías y sin el cuello ni el plumífero del retrato), la cara roja, las cejas, la boca, el torso del plumífero negro abierto con la camiseta negra hasta la cintura del vaquero, las dos mangas acolchadas enderezadas, las piernas del vaquero y la zapatilla con la suela nivelada.
- **Limpieza:** se quitan las manos que asomaban de los bolsillos (solo la piel y su contorno) y se repintan la camiseta, la cintura del vaquero, la abertura del bolsillo y el borde del puño.
- **En pantalla:** los hombros son negros y la mano se dibuja aparte al sacarla del bolsillo.
- **Altura:** con el mismo `p.s` mide prácticamente lo mismo que Guillermo.

**Sara Sáez** (`personajes/sara-saez/`) sale de `Avatares 2D/Sara-Saez/Sara-Saez-2D.png` con el recortador común.

- **Piezas:** la cabeza del retrato con los pendientes de perla y el aro de la nariz (sin el cuello ni el collar), la cara roja, las cejas, la boca, la melena larga en dos tiras (delante y, reflejada y más oscura, detrás), el torso con el top negro de manga larga y escote, los brazos, las piernas del cargo negro y la zapatilla blanca y gris con la suela nivelada.
- **Limpieza:** se quita la melena que caía por delante de los hombros y se rehacen el escote, el top, las mangas, el hueco entre el brazo y la cintura y los contornos. Se quitan las manos de los bolsillos y el collar, que lo dibuja `sara-saez.js` y se mece con el torso.
- **Altura:** con el mismo `p.s` mide un 93 % de Guillermo, como Laura, Carla y Marta.

**Yorgi** (`personajes/yorgi/`) sale de `Avatares 2D/Yorgi/Yorgi-2D.png` con el recortador común.

- **Piezas:** la cabeza del retrato cortada por debajo de la barba, con los aros de las orejas (el cuello lo pone el cuerpo), las cejas, la boca, el torso de la camiseta marino hasta la cintura del vaquero, los dos brazos (manga corta y brazo; el lejano con el reloj) y la zapatilla con la suela nivelada.
- **Limpieza:** se blanquean las sombras grises del suelo junto a las zapatillas y se repinta lo que tapaban los antebrazos (camiseta, bajo, cintura del vaquero y sus contornos).
- **En pantalla:** los hombros son marino, los labios se dibujan sobre la barba y la mano se dibuja aparte al sacarla del bolsillo.
- **Altura:** con el mismo `p.s` mide un 2 % más que Guillermo.

## Añadir una animación

1. Crea `escenas/NNNNN Nombre.js`.
   - Dentro, define una clase que extienda `Escena2D(duración)` con un método `pintar(g, t)`.
   - Al final, llama a `registrar({ id, nombre, crear })`.
   - La base ya pinta el negro del principio y del final.
2. Añade su `<script>` en `ver.html`.
3. Si sale un personaje nuevo, crea su carpeta en `personajes/` con su propio `preparar_piezas.py`.
4. Pasa `comprobar.py` y graba la vista previa con `grabar.py`.
