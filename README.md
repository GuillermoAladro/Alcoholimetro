# Alcoholímetro

Diseño de un alcoholímetro de pago desde cero: carcasa, electrónica y software de la interfaz.

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

- `MONTAJE-GENERAL.md` – esquema de conexión de todos los componentes: puerto, borne o pin exacto de cada cable (figuras en `montaje-general/`)
- `componentes/` – ficha de cada uno de los 31 componentes de la hoja de compra: datasheets, problemas conocidos y notas de uso ([índice](componentes/README.md))
- `carcasa/` – diseño y planos de la carcasa
- `hardware/` – esquemas electrónicos
- `firmware/` – código del controlador y la interfaz
- `docs/` – notas de diseño y decisiones

## Estado

En desarrollo. Fase actual: diseño de la carcasa.

## Autor

Guillermo Aladro Abad
