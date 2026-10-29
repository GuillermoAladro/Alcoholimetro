# Alcoholímetro

Diseño de un alcoholímetro de pago desde cero: carcasa, electrónica y software de la interfaz.

## Auditoría eléctrica

[Auditoría de Auditor 6.1-S (21-10-2026)](auditorias/2026-10-21-auditor-6.1-s/AUDITORIA.md), con informe PDF y comprobaciones reproducibles. **Dictamen: diseño no liberado para energización.** Se han corregido las asignaciones peligrosas de bornes de la fuente y sus repeticiones en otras fichas. Las pruebas realizadas son documentales y digitales; no se ha ensayado un montaje físico.

## Descripción

Proyecto personal de ingeniería para diseñar y construir un alcoholímetro completo y robusto. Nace de la experiencia con máquinas de pago comerciales que se averiaban constantemente: la idea es rehacerlo todo desde cero, empezando por la carcasa y avanzando hacia la integración de electrónica, sensor y una pantalla con interfaz propia.

## Características previstas

- Medición de alcohol con sensor dedicado
- Pantalla con interfaz programada a medida
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
- `avatares SVG/` – avatares vectoriales con fondo transparente para la pantalla: hoja completa y una pieza por vista y expresión ([índice](avatares%20SVG/README.md))
- `carcasa/` – diseño y planos de la carcasa
- `hardware/` – esquemas electrónicos
- `firmware/` – código del controlador y la interfaz
- `docs/` – notas de diseño y decisiones

## Estado

En desarrollo. Fase actual: diseño de la carcasa.

## Autor

Guillermo Aladro Abad
