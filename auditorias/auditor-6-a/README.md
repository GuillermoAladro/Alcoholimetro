# Auditoría eléctrica — Auditor 6-A

21 de octubre de 2026. Base examinada: `84be97669a9efec43e79b3dadc4af5e87458c41a`.

**Dictamen: no apto para montar y dar por validado con la documentación actual.** Hay 16 hallazgos principales en la base auditada, incluida una numeración de la fuente capaz de inducir una conexión de red a la salida DC. Durante la entrega, Auditor 6.1-S corrigió ese orden de bornes en el commit `73265933dc0953665b8d8ea4e7f5619c7a8e5619`; la corrección documental se ha comprobado y se reconoce en §1. Los restantes cierres y ensayos físicos siguen pendientes. Los originales de la base se conservan en el historial; publicar este informe no libera el montaje.

- [Informe completo](AUDITORIA-AUDITOR-6-A.md) y [PDF](Auditoria-Auditor-6-A.pdf).
- [Arquitectura propuesta R1](esquema-r1.svg), conceptual y pendiente de liberación.
- [Resultados eléctricos](resultados_dc.json): 112 escenarios de estrella más 6 con retorno HDMI; 51/108 del barrido salen de la ventana de ingeniería elegida. No es probabilidad de fallo ni medida física.
- [Resultados UART](resultados_uart.json): 18 checksums correctos; ejemplo original 5/8 escenarios, receptor de referencia 8/8.
- [Inventario canónico](inventario_archivos.json), [CSV](inventario_archivos.csv) y [conexiones W1-W29](conexiones_originales.csv).
- Anexos: [red y tierra](anexos/red-fuente-tierra.md), [señales y medida](anexos/senales-medida.md), [USB y masas](anexos/usb-perifericos-masas.md), [mecánica](anexos/mecanica-conexiones.md).

La cobertura comprende los 234 archivos de la base y extracción de sus documentos; la lectura técnica de manuales extensos fue selectiva. El informe detalla los límites. No se montó ni midió hardware. Las pruebas físicas, la aplicación integral y la metrología siguen pendientes.

## Reproducir los ensayos

Python 3, solo biblioteca estándar. Desde la raíz del repositorio, con los documentos de la base auditada sin cambios:

```sh
python auditorias/auditor-6-a/modelo_dc.py --repo . --output resultados-dc-local.json
python auditorias/auditor-6-a/pruebas_uart.py --repo . --output resultados-uart-local.json
```

El primer comando escribe además `conexiones_originales.csv` junto al JSON de salida. No conecta hardware ni ejecuta `descargar.sh`. El segundo extrae por AST las funciones del ejemplo de sensor y usa un puerto simulado; no instala ni ejecuta una aplicación de la Pi. El parser es referencia para integración y no cubre por sí solo la máquina de estados del sensor.

Para comprobar archivos de la base, usar los hashes canónicos de `inventario_archivos.json`; Git puede convertir LF a CRLF en Windows. Los hashes internos de ZIP se refieren a sus miembros descomprimidos. `SHA256SUMS.txt` identifica los entregables de esta auditoría, excluyéndose a sí mismo.

Los cálculos de contacto, longitudes y corrientes incluyen hipótesis explícitas. La propuesta de 5,10 V y sus protecciones requiere medidas y selección de componentes exactos. El modelo no sustituye ensayos de seguridad, transitorios, USB o precisión de alcohol.

Firma documental: **Auditor 6-A**.
