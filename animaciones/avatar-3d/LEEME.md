# Avatar 3D

El avatar de Guillermo (`../Avatar GuillermoAladro.jpg`) convertido en 3D.

- `avatar.glb`: la malla, en formato estándar (glTF binario). Se abre en Blender, en el visor 3D de Windows,
  en three.js… Lleva la jerarquía de nodos para animarlo: `torso` → `cuello` (cabeza), `hombro_L/R` → `codo_L/R`
  → `muneca_L/R` (manga, antebrazo y cuatro manos por lado: `mano_abierta_*`, `mano_puno_*`, `mano_pulgar_*`,
  `mano_movil_*`; se enseña una y se ocultan las otras). Unidades: píxeles del dibujo; (0, 0, 0) es el centro de
  la cintura, y hacia arriba, z hacia quien mira.
- `visor.html`: visor con three.js incrustado (funciona sin conexión): las posturas de la máquina, las nueve caras
  (se cambia la textura de la cara), giro y zoom con el ratón.
- `construir.py`, `inflar.py`, `visor.py`, `visor_plantilla.html`: cómo se generó (necesita las piezas recortadas
  del dibujo, que salen del programa de la pantalla).

Cómo está hecho: cada pieza del dibujo (cabeza, torso, piernas, manga, antebrazo, manos) se triangula por su
silueta y cada vértice se levanta según lo lejos que está del borde, con sección redondeada, por delante y por
detrás (la clásica técnica de "hinchar" un dibujo). La cara lleva además relieve de nariz, cejas, pómulos y
barbilla a partir de los puntos de la cara. Queda bien de frente y hasta unos 60° de giro; de perfil o de
espaldas se nota que viene de un dibujo plano (la nuca es pelo liso).
