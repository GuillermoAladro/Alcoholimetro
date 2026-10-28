# Banco de animaciones generales (por confirmar)

Animaciones de la pantalla del alcoholímetro (1024 × 600, la de 7") para la espera (Stand By). Salen al azar entre los puestos del top 10. Todo está dibujado en directo con JavaScript, sin vídeos, para que pueda llevar las fotos y las tasas reales del ranking.

**Para verlas:** abre `ver.html` en Chrome o Edge.
- Los botones lanzan cada animación al momento.
- ↺ empieza una vuelta nueva.
- <kbd>P</kbd> simula un pago y <kbd>N</kbd> pasa a lo siguiente.

## Una vuelta de Stand By

BEBE → TOP 10 en llamas → Puesto 10 → *animación* → Puesto 9 → *animación* → … → Puesto 1 → *animación* → otra vuelta (unos 3 minutos).

Las animaciones salen del banco como una baraja:
- No se repite ninguna hasta que han salido todas.
- Las 3 últimas que han salido no vuelven al principio de la baraja siguiente.

Todas empiezan y acaban en negro, así que cualquiera encaja detrás de cualquier otra.

## Animaciones del banco

| Animación | Duración | Qué pasa |
|---|---|---|
| El borracho | 9,5 s | Entra dando tumbos con una jarra, se la bebe de un trago, le da hipo, tropieza y se va |
| Modo leyenda | 10,2 s | Se bebe una lata, la aplasta y se transforma: aura, pelo dorado, rayos, rocas. Sale volando hacia arriba |
| La tienda 24H | 9,3 s | Cae del cielo delante de la tienda, se pone gafas de sol, paga con un fajo de billetes y se lleva las litronas |
| Monumentos de latas | 12,5 s | Bebe lata tras lata y con ellas monta una pirámide, la torre de Pisa y la Eiffel mientras crece |
| El eructo | 7,4 s | Gigante entre los monumentos: un eructo los tumba, se deshincha y atrapa una lata |
| Cohete de espuma | 10,0 s | Agita una lata, sale volando con la espuma, escribe ¡SALUD! y se estampa contra la pantalla |
| El reto | 6,9 s | Podio con trofeo, el récord del bar y ¡PAGA AQUÍ! con una flecha al lector. Grita ¡BEBE! |

Si El eructo sale justo después de Monumentos de latas, las dos encajan como una sola historia.

## Cómo añadir una animación

1. Crea un archivo `Nombre.js` en esta carpeta con una clase que extienda `Escena`. Tiene que tener `actualizar(dt)`, `dibujar(g)` y `terminada`.
2. El primer y el último cuadro tienen que ser negros.
3. El lienzo mide 1024 × 600 y el suelo está en `PIES` (y = 575). El avatar se pinta con `pintarAvatar(g, matAv(x, PIES, escala), pose, t)`.
4. Añade una línea en `BANCO`, dentro de `banco.js`, y su `<script>` en `ver.html`.

## Archivos

| Archivo | Qué es |
|---|---|
| `El borracho.js` … `El reto.js` | Una animación por archivo |
| `banco.js` | Lista del banco, la baraja y el orden de cada vuelta |
| `motor/base.js` | Todo lo común: textos, temblor, partículas, el avatar (esqueleto, caras, pelo dorado, gafas), objetos (lata, jarra, bolsa, billetes, trofeo), aura, rayos, rocas, bocadillos, focos y datos de ejemplo del ranking |
| `motor/pantallas-fijas.js` | BEBE, TOP 10 en llamas y Puesto (del 10 al 1). Al final van las pantallas provisionales del pago: Processing, Analyzing y Ranking |
| `motor/avatar-guillermo.js` | El avatar de Guillermo troceado: piezas del cuerpo, 6 caras y su pelo dorado, en PNG base64 |
| `ver.html` | Página de prueba con Stand By en bucle y el pago simulado |

## Pendiente

- **Raspberry Pi 3B+:** no está probado en la Pi; en un ordenador va a 60 cuadros por segundo. Modo leyenda y El eructo son las más pesadas.
- **Programa de la Pi:** todavía no está metido en el programa (rama `programa-raspberry`), que tiene su propia pantalla en `programa/nucleo/pantalla.js`.
- **Datos del ranking:** las fotos del top 10 son de ejemplo (el avatar) y los datos están en `datos`, dentro de `motor/base.js`. En la máquina los pondrá el programa.
- **El reto:** el precio (2,00 €) está escrito en la escena. En la máquina tendría que salir de la configuración.
- **Tipografías:** usa Big Shoulders Display, Archivo, Bangers y Lilita One, que ahora se cargan de Google Fonts (licencia OFL). En la Pi tienen que ir en local, como las del kiosco.
