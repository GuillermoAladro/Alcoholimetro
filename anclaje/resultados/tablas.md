<!-- generado por anclaje.py; no editar a mano -->

### T1. Resumen por patrón

| Patrón | Cabe | Sep. mín. (mm) | CS macizo | CS perforado | CS hueco doble | Caso que manda (perforado) | Modo de fallo que manda (perforado) | CS con placa rígida (perforado) |
|---|---|---|---|---|---|---|---|---|
| Rejilla 3 × 6 (la del encargo; ya no cabe) | no | 50,0 | 1,04 | 0,64 | 0,10 | Combinación: tirón de 1000 N en la esquina de arriba dcha. + empuje lateral de 1000 N | taco (arrancamiento o cortante) | 0,74 |
| Rejilla 3 × 6 adaptada (x = ±89,5) | sí | 50,0 | 1,06 | 0,65 | 0,11 | Combinación: tirón de 1000 N en la esquina de arriba dcha. + empuje lateral de 1000 N | taco (arrancamiento o cortante) | 0,75 |
| Solo perímetro | sí | 53,0 | 1,17 | 0,80 | 0,11 | Patada lateral (4500 N) en el costado dcho., abajo | taco (arrancamiento o cortante) | 0,81 |
| Perímetro + centro | sí | 53,0 | 0,99 | 0,68 | 0,11 | Patada lateral (4500 N) en el costado dcho., abajo | taco (arrancamiento o cortante) | 0,69 |
| Tresbolillo | sí | 71,5 | 1,13 | 0,63 | 0,08 | Combinación: tirón de 1000 N en la esquina de arriba dcha. + empuje lateral de 1000 N | taco (arrancamiento o cortante) | 0,80 |
| Concentrado arriba y abajo | no | 45,0 | 1,11 | 0,55 | 0,06 | Combinación: tirón de 1000 N en la esquina de arriba izda. + empuje lateral de 1000 N | taco (arrancamiento o cortante) | 0,90 |
| P18-3 (el del CAD, 04-11) | sí | 50,0 | 0,92 | 0,63 | 0,08 | Patada lateral (4500 N) en el costado dcho., abajo | taco (arrancamiento o cortante) | 0,63 |
| P18-4 (óptimo numérico) | sí | 50,0 | 1,37 | 0,94 | 0,11 | Patada lateral (4500 N) en el costado dcho., abajo | taco (arrancamiento o cortante) | 0,93 |

### T2. Carga de fallo por caso · P18-3 (el del CAD, 04-11)

«Carga que agota» = carga supuesta × CS del caso: la que lleva al anclaje más cargado a su carga recomendada.

| Caso | Carga supuesta | CS macizo | CS perforado | CS hueco | Carga que agota (macizo) | Carga que agota (perforado) | Modo que manda (perforado) |
|---|---|---|---|---|---|---|---|
| Peso propio | 18 kg | 53,37 | 34,71 | 6,92 | 961 kg | 625 kg | taco (arrancamiento o cortante) |
| Persona colgada del borde de arriba (se deja caer, ×2) | 120 kg | 2,15 | 1,40 | 0,27 | 258 kg | 168 kg | taco (arrancamiento o cortante) |
| Tirón hacia fuera, arriba o abajo en el centro | 1000 N | 2,51 | 1,26 | 0,10 | 2513 N | 1257 N | cono de ladrillo (tacos juntos) |
| Tirón hacia fuera desde una esquina | 1000 N | 2,19 | 1,09 | 0,08 | 2189 N | 1094 N | cono de ladrillo (tacos juntos) |
| Tirón de un lado, a media altura (torsión) | 1000 N | 3,00 | 1,50 | 0,12 | 2995 N | 1498 N | cono de ladrillo (tacos juntos) |
| Empuje lateral arriba | 1000 N | 3,40 | 2,31 | 0,26 | 3395 N | 2311 N | taco (arrancamiento o cortante) |
| Empuje hacia arriba | 1000 N | 10,20 | 5,51 | 0,44 | 10198 N | 5508 N | taco (arrancamiento o cortante) |
| Patada lateral abajo | 4500 N | 0,92 | 0,63 | 0,11 | 4129 N | 2837 N | taco (arrancamiento o cortante) |
| Puñetazo lateral arriba | 3000 N | 1,35 | 0,93 | 0,17 | 4064 N | 2794 N | taco (arrancamiento o cortante) |
| Patada de abajo arriba | 3000 N | 3,30 | 2,11 | 0,23 | 9893 N | 6332 N | taco (arrancamiento o cortante) |
| Golpe de frente | 5000 N | 4,57 | 2,29 | 0,18 | 22853 N | 11427 N | cono de ladrillo (tacos juntos) |
| Colgado (120 kg, sin golpe) + tirón de 1000 N | 1177 N + 1000 N | 2,32 | 1,16 | 0,14 | las dos × 2,32 | las dos × 1,16 | cono de ladrillo (tacos juntos) |
| Colgado de una esquina + empuje lateral | 1177 N + 1000 N | 4,10 | 2,42 | 0,28 | las dos × 4,10 | las dos × 2,42 | taco (arrancamiento o cortante) |
| Tirón en esquina + empuje lateral | 1000 N + 1000 N | 1,99 | 1,00 | 0,09 | las dos × 1,99 | las dos × 1,00 | cono de ladrillo (tacos juntos) |
| **Mínimo** | | **0,92** | **0,63** | **0,08** | | | |

### T2. Carga de fallo por caso · P18-4 (óptimo numérico)

«Carga que agota» = carga supuesta × CS del caso: la que lleva al anclaje más cargado a su carga recomendada.

| Caso | Carga supuesta | CS macizo | CS perforado | CS hueco | Carga que agota (macizo) | Carga que agota (perforado) | Modo que manda (perforado) |
|---|---|---|---|---|---|---|---|
| Peso propio | 18 kg | 51,91 | 32,49 | 6,00 | 934 kg | 585 kg | taco (arrancamiento o cortante) |
| Persona colgada del borde de arriba (se deja caer, ×2) | 120 kg | 2,41 | 1,45 | 0,24 | 290 kg | 174 kg | taco (arrancamiento o cortante) |
| Tirón hacia fuera, arriba o abajo en el centro | 1000 N | 2,86 | 1,43 | 0,13 | 2862 N | 1431 N | cono de ladrillo (tacos juntos) |
| Tirón hacia fuera desde una esquina | 1000 N | 2,29 | 1,15 | 0,13 | 2294 N | 1147 N | cono de ladrillo (tacos juntos) |
| Tirón de un lado, a media altura (torsión) | 1000 N | 2,81 | 1,40 | 0,19 | 2806 N | 1403 N | taco (arrancamiento o cortante) |
| Empuje lateral arriba | 1000 N | 3,49 | 2,34 | 0,42 | 3490 N | 2337 N | taco (arrancamiento o cortante) |
| Empuje hacia arriba | 1000 N | 10,28 | 5,63 | 0,55 | 10278 N | 5627 N | taco (arrancamiento o cortante) |
| Patada lateral abajo | 4500 N | 1,37 | 0,94 | 0,19 | 6151 N | 4227 N | taco (arrancamiento o cortante) |
| Puñetazo lateral arriba | 3000 N | 1,37 | 0,94 | 0,24 | 4107 N | 2820 N | taco (arrancamiento o cortante) |
| Patada de abajo arriba | 3000 N | 3,31 | 2,13 | 0,29 | 9940 N | 6402 N | taco (arrancamiento o cortante) |
| Golpe de frente | 5000 N | 5,48 | 2,74 | 0,25 | 27380 N | 13690 N | taco (arrancamiento o cortante) |
| Colgado (120 kg, sin golpe) + tirón de 1000 N | 1177 N + 1000 N | 2,14 | 1,07 | 0,12 | las dos × 2,14 | las dos × 1,07 | cono de ladrillo (tacos juntos) |
| Colgado de una esquina + empuje lateral | 1177 N + 1000 N | 3,95 | 2,13 | 0,29 | las dos × 3,95 | las dos × 2,13 | taco (arrancamiento o cortante) |
| Tirón en esquina + empuje lateral | 1000 N + 1000 N | 1,90 | 0,95 | 0,11 | las dos × 1,90 | las dos × 0,95 | taco (arrancamiento o cortante) |
| **Mínimo** | | **1,37** | **0,94** | **0,11** | | | |

### T3. ¿Es rígida la chapa? Tracción del anclaje más cargado (P18-4 (óptimo numérico))

| Caso | Placa rígida (N) | Chapa flexible, FEM (N) | FEM / rígida |
|---|---|---|---|
| Persona de 120 kg colgada del borde de arriba, en el centro (×2) | 89 | 188 | 2,10 |
| Persona de 120 kg colgada de la esquina de arriba dcha. (×2) | 89 | 188 | 2,10 |
| Persona de 120 kg colgada de la esquina de arriba izda. (×2) | 89 | 188 | 2,10 |
| Tirón de 1000 N hacia fuera, arriba en el centro | 165 | 272 | 1,65 |
| Tirón de 1000 N hacia fuera, abajo en el centro | 134 | 232 | 1,73 |
| Tirón de 1000 N hacia fuera, esquina de arriba dcha. | 176 | 339 | 1,93 |
| Tirón de 1000 N hacia fuera, esquina de abajo dcha. | 153 | 245 | 1,60 |
| Tirón de 1000 N de un lado (canto dcho., media altura): torsión | 131 | 189 | 1,44 |
| Empuje lateral de 1000 N arriba, hacia la dcha. | 60 | 130 | 2,19 |
| Patada lateral (4500 N) en el costado izdo., abajo | 134 | 293 | 2,19 |
| Puñetazo lateral (3000 N) en el costado izdo., arriba | 89 | 195 | 2,19 |
| Tirón de 1000 N hacia fuera, esquina de arriba izda. | 176 | 248 | 1,41 |
| Tirón de 1000 N hacia fuera, esquina de abajo izda. | 153 | 336 | 2,19 |
| Tirón de 1000 N de un lado (canto izdo., media altura): torsión | 131 | 285 | 2,17 |
| Empuje lateral de 1000 N arriba, hacia la izda. | 60 | 89 | 1,50 |
| Patada lateral (4500 N) en el costado dcho., abajo | 134 | 200 | 1,49 |
| Puñetazo lateral (3000 N) en el costado dcho., arriba | 89 | 134 | 1,50 |
| Empuje de 1000 N hacia arriba en el borde de abajo | 28 | 54 | 1,94 |
| Patada de abajo arriba (3000 N) en la base | 53 | 103 | 1,94 |
| Combinación: colgado (120 kg, sin golpe) + tirón de 1000 N arriba | 208 | 364 | 1,75 |
| Combinación: colgado de la esquina dcha. (120 kg) + empuje lateral de 1000 N | 61 | 157 | 2,58 |
| Combinación: tirón de 1000 N en la esquina de arriba dcha. + empuje lateral de 1000 N | 202 | 400 | 1,98 |
| Combinación: colgado de la esquina izda. (120 kg) + empuje lateral de 1000 N | 61 | 118 | 1,95 |
| Combinación: tirón de 1000 N en la esquina de arriba izda. + empuje lateral de 1000 N | 202 | 384 | 1,91 |

### T4. Juntas al azar (Monte Carlo)

| Pared | Patrón | Tacos en junta (media / máx.) | CS mediana | CS percentil 5 | CS mínimo | Tacos que ceden (media) |
|---|---|---|---|---|---|---|
| Macizo | P18-3 (el del CAD, 04-11) | 6,5 / 11 | 0,81 | 0,55 | 0,48 | 2,2 |
| Macizo | P18-4 (óptimo numérico) | 6,0 / 12 | 0,94 | 0,57 | 0,56 | 3,6 |
| Macizo | Rejilla 3 × 6 adaptada (x = ±89,5) | 6,4 / 13 | 0,82 | 0,52 | 0,44 | 3,4 |
| Macizo | Solo perímetro | 6,3 / 18 | 0,93 | 0,62 | 0,53 | 2,7 |
| Perforado | P18-3 (el del CAD, 04-11) | 5,1 / 10 | 0,46 | 0,27 | 0,27 | 3,3 |
| Perforado | P18-4 (óptimo numérico) | 5,3 / 13 | 0,59 | 0,36 | 0,28 | 3,6 |
| Perforado | Rejilla 3 × 6 adaptada (x = ±89,5) | 5,1 / 11 | 0,46 | 0,28 | 0,22 | 3,1 |
| Perforado | Solo perímetro | 4,8 / 11 | 0,59 | 0,27 | 0,25 | 3,3 |
| Hueco doble | P18-3 (el del CAD, 04-11) | 3,7 / 9 | 0,08 | 0,06 | 0,05 | 2,4 |
| Hueco doble | P18-4 (óptimo numérico) | 3,7 / 10 | 0,11 | 0,06 | 0,05 | 2,3 |
| Hueco doble | Rejilla 3 × 6 adaptada (x = ±89,5) | 3,9 / 9 | 0,08 | 0,06 | 0,05 | 2,3 |
| Hueco doble | Solo perímetro | 3,8 / 8 | 0,10 | 0,06 | 0,05 | 2,5 |

### T5. Con los peores anclajes fallados

| Patrón | Pared | Intacto | Sin 1 | Sin 2 | Sin 3 | Sin 4 | Anclajes quitados (n.º de plantilla) |
|---|---|---|---|---|---|---|---|
| P18-3 (el del CAD, 04-11) | Macizo | 0,92 | 0,74 | 0,65 | 0,57 | 0,51 | 17, 16, 15, 14 |
| P18-3 (el del CAD, 04-11) | Perforado | 0,63 | 0,51 | 0,45 | 0,39 | 0,35 | 17, 16, 15, 14 |
| P18-4 (óptimo numérico) | Macizo | 1,37 | 1,17 | 0,97 | 0,82 | 0,67 | 1, 3, 4, 5 |
| P18-4 (óptimo numérico) | Perforado | 0,94 | 0,76 | 0,62 | 0,51 | 0,43 | 3, 7, 9, 11 |

### T6. Sensibilidad

| Suposición | Patrón | CS macizo (modo) | CS perforado (modo) | CS hueco (modo) |
|---|---|---|---|---|
| Base | P18-3 | 0,92 (tornillo) | 0,63 (taco) | 0,08 (cono de ladrillo) |
| Base | P18-4 | 1,37 (tornillo) | 0,94 (taco) | 0,11 (cono de ladrillo) |
| Ladrillo un 50 % más flojo | P18-3 | 0,63 (taco) | 0,32 (taco) | 0,04 (cono de ladrillo) |
| Ladrillo un 50 % más flojo | P18-4 | 0,94 (taco) | 0,47 (taco) | 0,06 (cono de ladrillo) |
| Ladrillo un 50 % más fuerte | P18-3 | 0,92 (tornillo) | 0,92 (tornillo) | 0,12 (cono de ladrillo) |
| Ladrillo un 50 % más fuerte | P18-4 | 1,37 (tornillo) | 1,37 (tornillo) | 0,17 (cono de ladrillo) |
| Cono de ladrillo un 50 % más flojo (κ × 0,5) | P18-3 | 0,92 (tornillo) | 0,49 (cono de ladrillo) | 0,04 (cono de ladrillo) |
| Cono de ladrillo un 50 % más flojo (κ × 0,5) | P18-4 | 0,96 (cono de ladrillo) | 0,48 (cono de ladrillo) | 0,06 (cono de ladrillo) |
| Cono de ladrillo un 50 % más fuerte (κ × 1,5) | P18-3 | 0,92 (tornillo) | 0,63 (taco) | 0,12 (cono de ladrillo) |
| Cono de ladrillo un 50 % más fuerte (κ × 1,5) | P18-4 | 1,37 (tornillo) | 0,94 (taco) | 0,17 (cono de ladrillo) |
| Enlucido de 10 mm en vez de 15 | P18-3 | 1,22 (tornillo) | 0,63 (taco) | 0,08 (cono de ladrillo) |
| Enlucido de 10 mm en vez de 15 | P18-4 | 1,81 (tornillo) | 0,94 (taco) | 0,11 (cono de ladrillo) |
| Si el yeso sí sujetara el tornillo (sin flexión) | P18-3 | 1,26 (taco) | 0,63 (taco) | 0,08 (cono de ladrillo) |
| Si el yeso sí sujetara el tornillo (sin flexión) | P18-4 | 1,88 (taco) | 0,94 (taco) | 0,11 (cono de ladrillo) |
| Sin el caso de la patada lateral baja | P18-3 | 1,36 (tornillo) | 0,93 (taco) | 0,08 (cono de ladrillo) |
| Sin el caso de la patada lateral baja | P18-4 | 1,37 (tornillo) | 0,94 (taco) | 0,11 (cono de ladrillo) |
| Sin patada lateral baja y sin efecto de cono (κ × 3) | P18-3 | 1,36 (tornillo) | 0,93 (taco) | 0,23 (taco) |
| Sin patada lateral baja y sin efecto de cono (κ × 3) | P18-4 | 1,37 (tornillo) | 0,94 (taco) | 0,24 (taco) |

### T7. Número de anclajes

| N.º | CS macizo | CS perforado | CS hueco | Respecto a 18 (perforado) |
|---|---|---|---|---|
| 12 | 0,95 | 0,65 | 0,12 | -30 % |
| 18 | 1,37 | 0,94 | 0,11 | 0 % |
| 24 | 1,49 | 0,96 | 0,09 | 2 % |

### T8. Coordenadas de los 18 taladros (P18-4 (óptimo numérico))

Mirando a la pared. X desde la esquina inferior izquierda de la trasera, Z desde la base. x del CAD = X − 110.

| N.º | X (mm) | Z (mm) | x CAD (mm) | | N.º | X (mm) | Z (mm) | x CAD (mm) |
|---|---|---|---|---|---|---|---|---|
| 1 | 110,0 | 429,5 | 0,0 | | 10 | 17,0 | 174,5 | -93,0 |
| 2 | 26,0 | 420,5 | -84,0 | | 11 | 203,0 | 174,5 | 93,0 |
| 3 | 194,0 | 420,5 | 84,0 | | 12 | 17,0 | 96,5 | -93,0 |
| 4 | 17,0 | 363,5 | -93,0 | | 13 | 203,0 | 96,5 | 93,0 |
| 5 | 203,0 | 363,5 | 93,0 | | 14 | 17,0 | 46,0 | -93,0 |
| 6 | 17,0 | 300,0 | -93,0 | | 15 | 203,0 | 46,0 | 93,0 |
| 7 | 203,0 | 300,0 | 93,0 | | 16 | 60,0 | 20,0 | -50,0 |
| 8 | 17,0 | 236,0 | -93,0 | | 17 | 110,0 | 20,0 | 0,0 |
| 9 | 203,0 | 236,0 | 93,0 | | 18 | 160,0 | 20,0 | 50,0 |

### T10. Coeficiente de seguridad por caso y por patrón (ladrillo perforado)

| Caso · carga supuesta | Rejilla 3 × 6 | Rejilla 3 × 6 adaptada | Solo perímetro | Perímetro + centro | Tresbolillo | Concentrado arriba y abajo | P18-3 | P18-4 |
|---|---|---|---|---|---|---|---|---|
| Peso propio · 18 kg | 26,87 | 27,06 | 33,20 | 32,00 | 26,43 | 27,75 | 34,71 | 32,49 |
| Persona colgada del borde de arriba (se deja caer, ×2) · 120 kg | 1,07 | 1,08 | 1,44 | 1,36 | 1,06 | 1,21 | 1,40 | 1,45 |
| Tirón hacia fuera, arriba o abajo en el centro · 1000 N | 0,97 | 0,99 | 1,41 | 1,29 | 0,94 | 1,05 | 1,26 | 1,43 |
| Tirón hacia fuera desde una esquina · 1000 N | 0,79 | 0,80 | 1,13 | 1,02 | 0,77 | 0,79 | 1,09 | 1,15 |
| Tirón de un lado, a media altura (torsión) · 1000 N | 1,27 | 1,39 | 1,47 | 1,41 | 1,24 | 0,83 | 1,50 | 1,40 |
| Empuje lateral arriba · 1000 N | 1,75 | 1,76 | 2,43 | 2,42 | 1,86 | 1,62 | 2,31 | 2,34 |
| Empuje hacia arriba · 1000 N | 5,75 | 5,68 | 5,40 | 4,83 | 4,94 | 4,17 | 5,51 | 5,63 |
| Patada lateral abajo · 4500 N | 0,91 | 0,92 | 0,80 | 0,68 | 0,79 | 0,76 | 0,63 | 0,94 |
| Puñetazo lateral arriba · 3000 N | 0,72 | 0,72 | 0,99 | 1,01 | 0,77 | 0,90 | 0,93 | 0,94 |
| Patada de abajo arriba · 3000 N | 2,16 | 2,14 | 2,09 | 1,96 | 2,10 | 1,79 | 2,11 | 2,13 |
| Golpe de frente · 5000 N | 2,64 | 2,68 | 2,32 | 2,40 | 2,14 | 1,89 | 2,29 | 2,74 |
| Colgado (120 kg, sin golpe) + tirón de 1000 N · 1177 N + 1000 N | 0,72 | 0,73 | 1,05 | 0,96 | 0,70 | 0,76 | 1,16 | 1,07 |
| Colgado de una esquina + empuje lateral · 1177 N + 1000 N | 1,50 | 1,52 | 2,21 | 2,08 | 1,49 | 1,60 | 2,42 | 2,13 |
| Tirón en esquina + empuje lateral · 1000 N + 1000 N | 0,64 | 0,65 | 0,96 | 0,87 | 0,63 | 0,55 | 1,00 | 0,95 |
| **Mínimo** | **0,64** | **0,65** | **0,80** | **0,68** | **0,63** | **0,55** | **0,63** | **0,94** |

### T9. Contraste a mano (modelo de placa rígida)

| Caso | Fórmula | Sustitución | A mano | Código |
|---|---|---|---|---|
| Tirón de 1000 N arriba en el centro (tracción del anclaje más alto) | N = M·z_max / Σz²,  M = F·H + m·g·e | M = 1000·442,5 + 18·9,81·55 = 452212 N·mm;  N = 452212·429,5 / 1178724 | 164,8 N | 164,8 N |
| Persona colgada en el centro (cortante de cada anclaje) | V = (P·DAF + m·g) / n | V = (120·9,81·2 + 18·9,81) / 18 = 2531 / 18 | 140,6 N | 140,6 N |
| Patada lateral de 4500 N a 110 mm de la base (cortante del anclaje más bajo, x = -50, z = 20) | V_x = F/n + T·(z0 − z_i)/J;  V_z = −m·g/n + T·(x_i − x0)/J;  V = √(V_x² + V_z²);  T = F·(z0 − 110);  J = Σ[(x−x0)² + (z−z0)²] | z0 = 209,1; J = 514739 mm²; T = 4500·(209,1 − 110) = 445875 N·mm; V_x = 250,0 + 163,8 = 413,8; V_z = -9,8 + (-43,3) = -53,1 | 417,2 N | 417,2 N |
