# Alcoholímetro

Diseño de un alcoholímetro de pago desde cero: carcasa, electrónica y software de la interfaz.

## Auditoría eléctrica

[Auditoría de Auditor 6.1-S (21-10-2026)](auditorias/2026-10-21-auditor-6.1-s/AUDITORIA.md), con informe PDF y comprobaciones reproducibles. **Dictamen: diseño no liberado para energización.** Se han corregido las asignaciones peligrosas de bornes de la fuente y sus repeticiones en otras fichas. Las pruebas realizadas son documentales y digitales; no se ha ensayado un montaje físico.

## Decisiones

[DECISIONES.md](DECISIONES.md) recoge lo que afecta a todo el proyecto. Lo último (22-10-2026):
- **Sin botón en todo el proyecto:** la prueba arranca cuando la cámara detecta a alguien.
- **Diseño actualizado:** manda el diseño A (cajón de componentes), con la tapa interior deslizante por el lateral derecho. CAD en [`carcasa/diseno-A/`](carcasa/diseno-A/README.md).

## Descripción

Proyecto personal de ingeniería para diseñar y construir un alcoholímetro completo y robusto. Nace de la experiencia con máquinas de pago comerciales que se averiaban constantemente: la idea es rehacerlo todo desde cero, empezando por la carcasa y avanzando hacia la integración de electrónica, sensor y una pantalla con interfaz propia.

## Características previstas

- Medición de alcohol con sensor dedicado
- Pantalla con interfaz programada a medida
- Sin botón: la prueba arranca cuando la cámara detecta a alguien
- Cámara para hacer fotos y mostrarlas en pantalla
- Pago con tarjeta integrado
- Microcontrolador de bajo coste (alternativa económica a una Raspberry Pi)
- Componentes accesibles: todo el material se puede conseguir en Amazon
- Diseño pensado para durar y facilitar el mantenimiento

## Estructura del repositorio

- `LISTA-DE-COMPRA.md` – los 31 componentes con su enlace de Amazon.es, precio y ficha
- `MONTAJE-PASO-A-PASO.md` – cómo montar el circuito por fases, con las piezas de cada fase y las pruebas (con criterio) que hay que pasar antes de seguir
- `MONTAJE-GENERAL.md` – esquema de conexión de todos los componentes: puerto, borne o pin exacto de cada cable (figuras en `montaje-general/`)
- `componentes/` – ficha de cada uno de los 31 componentes de la hoja de compra: datasheets, problemas conocidos y notas de uso ([índice](componentes/README.md))
- `DECISIONES.md` – decisiones que afectan a todo el proyecto, con fecha
- `carcasa/diseno-A/` – CAD del diseño A: visor 3D, STEP, DXF de corte, lista de piezas y scripts que lo generan
- `hardware/` – esquemas electrónicos
- `firmware/` – código del controlador y la interfaz
- `docs/` – notas de diseño y decisiones

## Estado

En desarrollo. Fase actual: diseño de la carcasa (diseño A, actualizado el 22-10-2026).

## Autor

Guillermo Aladro Abad
