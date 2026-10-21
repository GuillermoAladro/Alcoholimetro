# SumUp Solo con base de carga (lector de tarjetas con pantalla)

Lector que cobra el test. La Raspberry Pi crea el cobro por internet con la Cloud API de SumUp; el cliente apoya la tarjeta o el móvil en el lector, que queda detrás de una ventana del panel. **El Solo no se conecta a la Pi**: recibe 5 V de la regleta por un cable USB-A a USB-C acodado y habla con SumUp por Wi-Fi.

- **Compra:** ASIN B0C9V3LXTF, 72,18 € (precio de la hoja de componentes del 19-20-10-2026; la hoja anota "quedaba 1 en stock").
- **Papel en el proyecto:** terminal de pago contactless. Chip y PIN no se usan (la ranura de chip queda tapada en el diseño).

> Investigación hecha el 21-10-2026. Cada dato indica de dónde sale. Lo que no he podido comprobar está marcado como **sin verificar**. Amazon bloquea el acceso a mi herramienta, así que no he podido ver el anuncio concreto: el precio y la referencia son los de tu hoja. **Esta pieza tiene riesgo de negocio**: separo lo que dicen los textos de SumUp de lo que deduzco yo. Para no copiar texto ajeno, casi todo está parafraseado; los números de cláusula te llevan al literal.

> **Actualización 21-10-2026 (anuncio de Amazon.es leído).** Después de escribir esta ficha pude abrir el anuncio con el navegador integrado, así que lo que dice arriba de que Amazon bloquea el acceso ya no vale para esta pieza. Lo que cambia: en las fotos del anuncio el USB-C del lector está en el **canto de abajo**, hacia el centro, y el botón de encendido en el canto derecho (es lo que se ve en una foto, no una medida). El cable que trae es USB-C a USB-C (reseña con compra verificada). Con esto queda resuelto el pendiente de la posición del USB-C. Ver el [detalle y origen de cada dato](../../montaje-general/anuncios-amazon-21-10-2026.md).

## Índice

1. [Resumen para el proyecto](#1-resumen-para-el-proyecto)
2. [Especificaciones](#2-especificaciones)
3. [Documentos oficiales](#3-documentos-oficiales)
4. [Cloud API e integración](#4-cloud-api-e-integración)
5. [Condiciones de uso y uso desatendido](#5-condiciones-de-uso-y-uso-desatendido)
6. [Fallos, bugs y problemas conocidos](#6-fallos-bugs-y-problemas-conocidos)
7. [Recomendaciones para el alcoholímetro](#7-recomendaciones-para-el-alcoholímetro)
8. [Lo que no he podido verificar](#8-lo-que-no-he-podido-verificar)
9. [Fuentes](#9-fuentes)

---

## 1. Resumen para el proyecto

- **Sí hay webhooks para el cobro del Solo, pero no hacen falta.** Cada cobro admite un `return_url` HTTPS público; SumUp le envía `solo.transaction.updated` con estado `successful` o `failed` ([Cloud API](https://developer.sumup.com/terminal-payments/cloud-api/)). Sin IP pública, la Pi puede preguntar con `GET .../checkout/{checkout_id}`, que devuelve `pending`, `successful`, `failed` o `cancelled` ([OpenAPI de SumUp](https://github.com/sumup/sumup-py)). SumUp no documenta ni intervalo de consulta ni límite de peticiones.
- **SumUp no dice nada del uso desatendido, ni a favor ni en contra.** Ni los términos generales, de pago, de API y de compra, ni el contrato de comerciante, ni el centro de ayuda lo mencionan (ver [§5](#5-condiciones-de-uso-y-uso-desatendido)). Hay cláusulas que se pueden leer en contra (tarjeta presente, terceros que usan el equipo) y un producto propio de autoservicio, pero con personal. **No está claro**: hay que pedirlo por escrito.
- **El calor y los golpes pueden bloquear el lector para siempre.** SumUp dice que el Solo tiene un bloqueo de seguridad permanente que salta por condiciones extremas o impactos, y que hay que evitar más de 40 °C y menos de 0 °C ([ayuda: dispositivo bloqueado](https://help.sumup.com/es-ES/articles/1fH1DQy2SCfsXvrdb76MS0-dispositivo-bloqueado)). La guía lo presenta como "admite hasta 40 °C"; en realidad **40 °C es el umbral que SumUp cita para evitar el bloqueo**. SumUp solo menciona la sustitución gratuita de lectores bloqueados dentro de garantía (12 meses según sus condiciones de compra); qué pasa fuera de garantía: **sin verificar**.
- **Cargar 24/7: las fuentes de SumUp se contradicen.** La doc de la Cloud API recomienda mantenerlo enchufado; la guía de usuario v4 prohíbe cargar más de 12 h y usarlo mientras carga; el centro de ayuda dice que sigue cobrando mientras carga. No encontré nada que diga que sea seguro dejarlo siempre cargando en una caja caliente ([§6.2](#62-carga-permanente-y-batería)).
- **Contactless tras acero y Wi-Fi del propio Solo: sin datos de SumUp.** El alcance NFC es de 3-4 cm y el metal lo amortigua. La guía resuelve la antena Wi-Fi de la Pi, pero **no la del Solo**, que también queda dentro de la chapa. Con la ranura de chip tapada, un pago que el banco pida confirmar con chip y PIN fallará ([§6.4](#64-contactless-detrás-del-marco-de-acero-y-ranura-de-chip-tapada)).
- **Varias cifras de la guía no cuadran con las fuentes** ([§2.2](#22-comprobación-de-la-guía-de-montaje-25)): la pantalla es de 3,62" según el manual (3" según la web), el cuerpo de la petición `POST` de la guía está incompleto (falta `total_amount` y `affiliate`), la temperatura mínima es 0 °C o -10 °C según la sección del manual, hay una versión nueva con Wi-Fi de 5 GHz y el Solo tiene SIM propia (el Plan B del router 4G puede no hacer falta para el lector, sí para la Pi).

## 2. Especificaciones

### 2.1 Qué es exactamente el "Solo con base"

- Es el **paquete Solo estándar**: la estación de carga va incluida de serie ([SumUp ES: datáfonos](https://www.sumup.com/es-es/datafonos/), [ayuda: ¿Qué es el Solo?](https://help.sumup.com/es-ES/articles/5eKFr2wp9MhrmRPmvXl8lY-resumen-solo)). Según la guía v4 (§4.1.1), la caja trae la base (dos piezas: tapa y base), el lector y un cable USB 2.0 tipo C, además de la guía de usuario y la hoja de seguridad ([guía v4](https://manuals.plus/sumup/solo-card-reader-manual)); la página de SumUp España no menciona el cable.
- **Otras versiones de la gama** (precios sin IVA en SumUp España, consulta del 21-10-2026): Solo Lite, 34 € (se vincula a un móvil; **no compatible con la Cloud API**); Solo, 79 €; Terminal, 169 € ([SumUp ES: datáfonos](https://www.sumup.com/es-es/datafonos/)). SumUp ofrece además impresora de mostrador o portátil para el Solo ([SumUp ES: datáfonos](https://www.sumup.com/es-es/datafonos/)); en el paquete con impresora portátil la impresora también carga el lector ([SumUp IE](https://www.sumup.com/en-ie/solo-card-reader/shopping/)).
- **La base** sirve a la vez de cargador y de soporte de exposición, con una tapa de protección sobre la pantalla y un compartimento inferior que se abre para guardar el cable USB ([iF Design](https://ifdesign.com/en/winner-ranking/project/sumup-solo-charging-station-cradle/297222)). Una reseña la describe con tapa transparente y dice que cargar de 0 a 100 % en la base de sobremesa tarda unas horas ([reseña](https://mobiletransaction.org/sumup-solo-review)). El manual permite cargar con la base o con el cable USB-C directo al lector, así que **tu diseño (cable directo) es válido y la base te sobra**: sirve de repuesto o para el banco de pruebas.
- **Base con contactos o inductiva: sin verificar.** SumUp no lo dice. Una ficha de retailer escribe "supports wireless charging" ([ficha del retailer](https://ik.imagekit.io/pimberly/595e406f0f15f30010780448/cd32c72b/62ea63129b3cd64ff4000200/BRI42258_TECH.pdf) ([copia local](datasheets/BRI42258_TECH.pdf))); no es fuente de SumUp.
- **Ethernet:** ninguna fuente de SumUp lo menciona para el Solo ni para la base. Sin verificar.
- **Dos revisiones de hardware con identificador FCC propio**: `2A39U-SOLO002` (concesión del 6-6-2022, Wi-Fi solo 2,4 GHz) y `2A39U-REG001` (concesión del 7-8-2023, Wi-Fi 2,4 y 5 GHz) ([FCC SOLO002](https://fccid.io/2A39U-SOLO002), [FCC REG001](https://fccid.io/2A39U-REG001)). **No sé cuál vende ese ASIN.** FCC llama al REG001 "Solo Register"; que sea el mismo producto que SumUp vende hoy como Solo es una deducción mía, sin confirmar.

### 2.2 Comprobación de la guía de montaje (§2.5)

| Afirmación de la guía | Resultado | Fuente y comentario |
|---|---|---|
| 83,16 × 83,02 × 17,6 mm, 147 g | **Coincide** | [Guía de usuario v4](https://manuals.plus/sumup/solo-card-reader-manual) (la tabla rotula "I x h x w", orden de ejes dudoso). La [web de SumUp UK](https://www.sumup.com/en-gb/solo-card-reader/) da 83 × 83 mm y 147 g. |
| Pantalla táctil de 3" | **Discrepancia entre fuentes de SumUp** | Web SumUp UK: 3". Guía de usuario v4: 3,62", 480 × 480 px, color de 24 bits. Una reseña la describe en escala de grises ([reseña](https://mobiletransaction.org/sumup-solo-review)). Para una pantalla cuadrada de 3,62" la zona útil sería de unos 65 × 65 mm (cálculo mío), así que cabe en la ventana de 78 × 78. |
| Batería Li-Po de 6,16 Wh | **Coincide** | Guía de usuario v4. Una ficha de retailer da 1,6 Ah, 3,8 V/4,35 V (1,6 Ah × 3,85 V = 6,16 Wh, cálculo mío): sería una celda de alto voltaje. |
| Se carga a 5 V por USB-C del canto de abajo | **5 V y USB-C coinciden; "canto de abajo" sin verificar** | Guía de usuario v4 (5 V por USB-C o por la base). La copia de texto no incluye los dibujos, así que no he podido ver dónde está el puerto. |
| Wi-Fi b/g/n solo a 2,4 GHz | **Cierto para SOLO002, no para REG001** | SOLO002: 2412-2462 MHz ([FCC](https://fccid.io/2A39U-SOLO002)). REG001: también 5 GHz ([FCC](https://fccid.io/2A39U-REG001), [hoja REG001](https://manuals.plus/sumup/reg001-solo-card-reader-manual)). Además **el Solo tiene SIM integrada** con datos ilimitados ([guía v4 §4.2.2](https://manuals.plus/sumup/solo-card-reader-manual), [ayuda: internet](https://help.sumup.com/es-ES/articles/5poYpJSwehH3dwowMiZoTt-conexion-a-internet)). |
| Funciona entre 0 y 40 °C | **Coincide con la sección de seguridad, no con la tabla** | La sección de seguridad del manual, la hoja REG001 y la ayuda dicen 0-40 °C. La tabla de especificaciones del mismo manual dice -10 a +40 °C (almacenamiento -10 a +45 °C, humedad 5-90 %). El manual no explica la diferencia. Tomar 0 °C. |
| Admite 40 °C con la batería cargando siempre | **No respaldado** | Ninguna fuente dice que los 40 °C valgan cargando. SumUp cita 40 °C como umbral a evitar para no provocar el bloqueo permanente. |
| Ranura de chip arriba, botón de encendido a la derecha | **Coincide** | [Guía v4 §4.3](https://manuals.plus/sumup/solo-card-reader-manual). |
| API key y Affiliate Key obligatoria | **Coincide, con un matiz** | La [doc de Affiliate Keys](https://developer.sumup.com/tools/authorization/affiliate-keys/) la llama obligatoria para la Cloud API. Pero el OpenAPI marca `affiliate` como opcional y el [ejemplo oficial de sumup-py](https://github.com/sumup/sumup-py/blob/main/examples/card_reader_checkout.py) no la envía. Qué hace el servidor sin ella: sin verificar. Enviarla siempre. |
| `POST /readers/{id}/checkout` con `{"currency":"EUR","minor_unit":2,"value":200}` | **Cuerpo incompleto** | Esos tres campos van dentro de `total_amount`, y falta `affiliate` ([§4.2](#42-crear-un-cobro)). Ruta completa: `/v0.1/merchants/{merchant_code}/readers/{reader_id}/checkout`. |
| `GET /readers/{id}/checkout/{checkout_id}` cada 2-3 s | **El endpoint existe** | [Referencia de la API](https://developer.sumup.com/api/readers). Sin intervalo ni límite documentados; los términos de API prohíben volúmenes de peticiones "no razonables" ([términos de API](https://www.sumup.com/es-es/terminos/api/), cl. 3). Mi propuesta: probar con 3-5 s y no bajar de ahí. |
| No hace falta webhook ni IP pública | **Correcto** | `return_url` es opcional. Pero la premisa "no hay webhook" **no es cierta**: existe. |
| Sin conexión no se puede cobrar | **Coincide** | La tabla de [developer.sumup.com](https://developer.sumup.com/terminal-payments) marca sin soporte las transacciones offline en la Cloud API. El modo offline del Solo está en pruebas para pocos comercios y solo con la app ([ayuda: offline](https://help.sumup.com/es-ES/articles/7F43YXo1ujLDt9cUm77zfe-articulo-que-son-las-transacciones-offline)). |
| Un cobro bloquea el lector 60 s | **Matiz** | Tras aceptar el cobro, el sistema tiene 60 s para iniciar el pago en el lector, y en ese tiempo rechaza otros cobros del mismo lector ([Cloud API](https://developer.sumup.com/terminal-payments/cloud-api/)). El OpenAPI lo llama `READER_BUSY`. No dice que bloquee 60 s tras terminar. |
| Bloqueo por país con la primera transacción | **Matiz** | SumUp habla del país del **primer uso**, que descarga los ajustes del país al lector; es irreversible y vale para todos los lectores ([ayuda](https://help.sumup.com/es-ES/articles/2n9E8TrLMelcCE5Z9RR2tI-datafonos-sumup-con-bloqueo-por-restriccion-geografica)). El texto mezcla "país de primer uso" y "perfil de tu país de origen" sin aclarar cuál manda. |
| Reposo de pantalla en "nunca", y probar si un cobro de la API la enciende | **Sin verificar ninguna de las dos cosas** | La ayuda de SumUp habla de "Auto-lock" y de cambiar el tiempo de espera de la pantalla ([ayuda: batería](https://help.sumup.com/en-GB/articles/37GnITqs6Bj4501z24ENy0-article-solve-card-reader-battery-issues)), sin decir si hay opción "nunca". Un integrador cita 30 s por defecto y sugiere 1 min ([EasyEats](https://easyeats.com/support/help/article/id/sumupSolo)). Que un cobro por API despierte la pantalla no está documentado. |
| SumUp recomienda tenerlo siempre enchufado; el manual dice no más de 12 h | **Ambas cosas son ciertas y se contradicen** | Cloud API (enchufado) frente a guía v4 (12 h, y no usarlo cargando). Ver [§6.2](#62-carga-permanente-y-batería). La hoja REG001 (2024) no incluye la frase de las 12 h. |
| `battery_temperature` en `GET /status` | **Existe** | Entero en °C, junto a `battery_level`, `connection_type` y `firmware_version`. Exige firmware 3.3.39.0 o superior y devuelve el último estado conocido según la referencia ([referencia](https://developer.sumup.com/api/readers)); el registro de cambios del 22-12-2025 lo presenta como actualizaciones "en tiempo real" ([cambios](https://developer.sumup.com/changelog/cloud-api/)). Qué sensor mide y con qué precisión: sin verificar. |
| La antena está debajo de la pantalla | **Sin fuente** | Las fotos internas del FCC están tras un aviso de cookies que no acepté. Sin verificar. |
| Ventana de 78 × 78 y marco de 2,6 mm | **El cálculo es correcto** | (83,16 - 78)/2 = 2,58 mm por lado. Depende de dónde esté la antena (arriba). |
| Si el banco pide PIN, se teclea en el Solo | **Incompleto** | El manual dice que algunos pagos piden PIN. SumUp avisa de que el banco puede pedirlo por importe o "tras varios pagos seguidos" ([contactless](https://www.sumup.com/es-es/pagos-contactless/)). Si lo que pide es insertar el chip, la ranura tapada lo impide (deducción mía). |
| Precio con tarjeta igual al de efectivo | **Coincide** | Contrato de comerciante cl. 5.4(b) y 5.6; términos de pago cl. 16. La norma dice "no superior": si hay dos precios, hay que comunicarlo antes. |
| No se puede abrir ni modificar el Solo | **Coincide (técnico)** | El manual dice que abrirlo lo bloquea. Una cláusula contractual específica no la encontré. |
| 1,49 % por operación, sin cuota | **Coincide** | Plan Pago por uso en [precios ES](https://www.sumup.com/es-es/precios/), consultada el 21-10-2026. Ver [§2.3](#23-tabla-de-especificaciones). |
| Plan B: router 4G para el Solo | **Matiz** | El Solo puede usar su SIM, pero para la Cloud API los datos móviles los activa SumUp a mano y con Wi-Fi disponible usa siempre el Wi-Fi ([Cloud API](https://developer.sumup.com/terminal-payments/cloud-api/)). La Pi seguirá necesitando su propia conexión. |
| Consumo 0,8 A típico / 2,0 A pico | **Sin dato oficial** | No encontré corriente de carga. La hoja REG001 lista un cargador con salidas de 5 V/3 A hasta 20 V/3,25 A y modos PPS, pero eso es lo que el cargador puede dar, no lo que pide el lector. |
| Borne USB-A con D+ y D- unidos | **Sin verificar** | Ninguna fuente dice cómo identifica el Solo la fuente. El manual pide cargar solo con cable y cargador incluidos o autorizados. |

### 2.3 Tabla de especificaciones

| Característica | Valor | Fuente |
|---|---|---|
| Tipo | Datáfono independiente con pantalla táctil, ranura de chip y NFC | [Guía v4](https://manuals.plus/sumup/solo-card-reader-manual) |
| Dimensiones y peso | 83,16 × 83,02 × 17,6 mm; 147 g (solo el lector) | Guía v4; [web UK](https://www.sumup.com/en-gb/solo-card-reader/) |
| Pantalla | 3,62", 480 × 480, 24 bits, 78° (manual); "3 pulgadas" (web) | Guía v4; web UK |
| Procesador y memoria | ARM de 32 bits a 600 MHz; 256 MB LPDDR2; 4 GB integrados | Guía v4 |
| Batería | Li-Po recargable de 6,16 Wh | Guía v4 |
| Autonomía | 300 operaciones por carga (SumUp España). Otras fuentes: 100 (ficha de retailer y una reseña que lo atribuye a SumUp). Son operaciones, no horas | [SumUp ES](https://www.sumup.com/es-es/datafonos/); [retailer](https://ik.imagekit.io/pimberly/595e406f0f15f30010780448/cd32c72b/62ea63129b3cd64ff4000200/BRI42258_TECH.pdf) ([copia local](datasheets/BRI42258_TECH.pdf)); [reseña](https://mobiletransaction.org/sumup-solo-review) |
| Carga | 5 V por USB-C (cable USB 2.0 tipo C incluido) o por la base. Una reseña dice que 0 a 100 % en la base de sobremesa tarda unas horas | Guía v4 (§4.1.1); [ayuda: consejos](https://help.sumup.com/en-GB/articles/5O4zuxJ7i8LBXcGMFXj11G-card-reader-advice); [reseña](https://mobiletransaction.org/sumup-solo-review) |
| Wi-Fi | 802.11 b/g/n (SOLO002, solo 2,4 GHz); REG001 añade 5 GHz | Guía v4; FCC; hoja REG001 |
| Datos móviles | SIM integrada con datos ilimitados | Guía v4 §4.2.2; [ayuda: internet](https://help.sumup.com/es-ES/articles/5poYpJSwehH3dwowMiZoTt-conexion-a-internet) |
| Bluetooth | La declaración CE y la tabla de bandas de la hoja REG001 lo incluyen; la guía v4 lo lista como "BLE (not active yet)". Irrelevante para la Cloud API | [Declaración CE](https://assets.ctfassets.net/txhaodyqr481/69X8uFuoC14J77oE7y0ga8/6a87808687c1ab91894566478f0f1ace/SumUp_Solo_CE_Declaration_of_Conformity_Access__signed.pdf) ([copia local](datasheets/SumUp_Solo_CE_Declaration_of_Conformity_Access__signed.pdf)); [hoja REG001](https://manuals.plus/sumup/reg001-solo-card-reader-manual); guía v4 |
| NFC | 13,56 MHz; alcance de 3-4 cm según SumUp | [FCC](https://fccid.io/2A39U-SOLO002); [contactless](https://www.sumup.com/es-es/pagos-contactless/) |
| Temperatura | Operación 0-40 °C (seguridad) o -10 a +40 °C (tabla); almacenamiento -10 a +45 °C; 5-90 % HR | Guía v4; hoja REG001 |
| Certificaciones (según la guía v4) | CE, UKCA, ANATEL, TQM, EMVCo L1 y L2, PCI PTS 5.x. Números y caducidades: **sin verificar** | Guía v4 |
| Garantía | 12 meses desde la entrega (cl. 8.1 de las condiciones de compra). La web de SumUp España habla de "garantía de 1 año" para el hardware, en una tabla que no incluye el Solo, y de 30 días de devolución desde la entrega | [Condiciones de compra](https://www.sumup.com/es-es/condiciones/compra/) (vigor 08/09/2025); [SumUp ES](https://www.sumup.com/es-es/datafonos/) |
| Firmware mínimo para la API | Crear cobro: 3.3.24.3. Cancelar: 3.3.28.0. Estado del lector: 3.3.39.0 | [Referencia de la API](https://developer.sumup.com/api/readers) |
| Compatible con la Cloud API | Solo: sí. Solo Lite: no | [developer.sumup.com](https://developer.sumup.com/terminal-payments) (la tabla pierde los símbolos al extraer el texto; lo leo por los guiones) |
| Comisión en España | Pago por uso: 1,49 % por operación, 0 € al mes. Pagos Plus: 0,75 % más 19 € al mes (pensado para 3.200 € o más al mes). La página no muestra cuota fija por operación ni fecha de vigencia | [Precios ES](https://www.sumup.com/es-es/precios/), consulta 21-10-2026 |
| Importe mínimo | 1,00 € en el uso con la app; para la Cloud API: sin verificar | Guía v4 §4.3 |
| Precio en SumUp España | 79 € sin IVA (95,59 € con IVA del 21 %, cálculo mío) | [SumUp ES](https://www.sumup.com/es-es/datafonos/) |

**Sobre el precio de tu hoja:** 72,18 € está un 24,5 % por debajo de 95,59 € (cálculo mío), así que o es una oferta o la unidad no es nueva, no es la misma versión o la vende un tercero con otras condiciones (hipótesis mías). Sin verificar: mira el vendedor y que sea nueva y sin uso (ver [§6.9](#69-bloqueo-por-país-y-origen-del-lector)).

## 3. Documentos oficiales

| Documento | Referencia | Formato | Enlace |
|---|---|---|---|
| Guía de usuario del Solo (SOLO002), copia de terceros | Versión 4, 18-5-2022 | HTML (no encontré PDF original de SumUp) | [manuals.plus](https://manuals.plus/sumup/solo-card-reader-manual) |
| La misma guía como PDF (anexo FCC "Users Manual"), 13 págs., 558.567 bytes | SHA-256 `c5926edc…` | PDF, se descarga desde la página | [fccid.io](https://fccid.io/2A39U-SOLO002/User-Manual/Users-Manual-5919604) |
| Hoja de seguridad y normativa REG001 (UE, GB, FCC), copia de terceros | Publicada 19-2-2024 | HTML | [manuals.plus](https://manuals.plus/sumup/reg001-solo-card-reader-manual) |
| Declaración CE de conformidad del Solo | Sin código visible | PDF | [descargar](https://assets.ctfassets.net/txhaodyqr481/69X8uFuoC14J77oE7y0ga8/6a87808687c1ab91894566478f0f1ace/SumUp_Solo_CE_Declaration_of_Conformity_Access__signed.pdf) ([copia local](datasheets/SumUp_Solo_CE_Declaration_of_Conformity_Access__signed.pdf)) |
| Declaración CE de conformidad de la base (Solo y Solo Lite) | Sin código visible | PDF | [descargar](https://assets.ctfassets.net/txhaodyqr481/5kKlBQRnxozVjiYJb7IpEL/7e57d2de1f1d77dfb51708a08b397d08/Solo___Solo_Lite_Cradle_CE_Declaration_of_conformity_.pdf) ([copia local](datasheets/Solo___Solo_Lite_Cradle_CE_Declaration_of_conformity_.pdf)) |
| Certificados EMV nivel 1 y nivel 2 | Sin código visible | PDF | [descargar](https://assets.ctfassets.net/txhaodyqr481/1YhCykQLzZ9UZ6k7RlUMsF/df72479f9ff162a8e0d6a377f20d991d/EMV_Level_1_and_Level_2_certificates.pdf) ([copia local](datasheets/EMV_Level_1_and_Level_2_certificates.pdf)) |
| Certificado Mastercard TQM | TQM5064 (por el nombre del archivo) | PDF | [descargar](https://images.ctfassets.net/txhaodyqr481/OBCr86lqISJTuYM4ETM2P/1f35b8a36e3eb18e7c67ad90b881fba3/211025_-_TQM_SoC_Labels__Sum_Up__TQM5064__3_.pdf) ([copia local](datasheets/211025_-_TQM_SoC_Labels__Sum_Up__TQM5064__3_.pdf)) |
| Expediente FCC del SOLO002 (lista manual de usuario, informes de ensayo, informes SAR, etiqueta, carta de autorización y fotos; solo abrí el "Users Manual") | `2A39U-SOLO002` | PDF en fccid.io | [fccid.io](https://fccid.io/2A39U-SOLO002) |
| Expediente FCC del REG001 (manual, declaración, etiqueta, fotos externas e internas; no abrí las fotos) | `2A39U-REG001` | PDF en fccid.io | [fccid.io](https://fccid.io/2A39U-REG001) |
| Documentación de la Cloud API | Actualizada el 20-10-2026 | HTML | [developer.sumup.com](https://developer.sumup.com/terminal-payments/cloud-api/) |
| Referencia de la Readers API | `/v0.1/merchants/...` | HTML | [developer.sumup.com](https://developer.sumup.com/api/readers) |
| Especificación OpenAPI (`openapi.json`) | Commit `83509e66…` del 20-10-2026 | JSON, en la raíz del repo | [sumup-py](https://github.com/sumup/sumup-py) |
| Ficha técnica de un retailer ("BRI42258") | Sin versión | PDF (no es de SumUp) | [descargar](https://ik.imagekit.io/pimberly/595e406f0f15f30010780448/cd32c72b/62ea63129b3cd64ff4000200/BRI42258_TECH.pdf) ([copia local](datasheets/BRI42258_TECH.pdf)) |
| Términos Generales | Vigor 10/12/2024 | HTML | [sumup.com](https://www.sumup.com/es-es/terminos-y-condiciones/) |
| Términos de Pago | Vigor 10/12/2024 | HTML | [sumup.com](https://www.sumup.com/es-es/terminos/pago/) |
| Contrato de Servicios para Comerciantes (adquirente Fiserv) | Sin fecha visible | HTML | [sumup.com](https://www.sumup.com/es-es/contrato-de-servicios-para-comerciantes/) |
| Términos de licencia de las API | Vigor 02/08/2021 | HTML | [sumup.com](https://www.sumup.com/es-es/terminos/api/) |
| Condiciones de compra de hardware | Vigor 08/09/2025 | HTML | [sumup.com](https://www.sumup.com/es-es/condiciones/compra/) |

**Hoja de datos de seguridad (SDS) de la batería e informe UN 38.3: no los encontré.** Lo más cercano son las secciones de seguridad del manual y de la hoja REG001.

### Qué dicen los documentos más relevantes

- **Guía de usuario v4 (SOLO002):**
  - Cargar solo con el cable y cargador incluidos o autorizados; los no autorizados pueden causar incendio o explosión.
  - Desconectar al terminar la carga y no cargar más de 12 horas.
  - No usar el dispositivo mientras se carga.
  - Si la batería se deforma, dejar de usarla.
  - La batería la cambia SumUp; no abrir el aparato, porque se bloquea por seguridad.
  - Mantenerlo seco y no usarlo en sitios con mucha humedad.
  - No encontré ningún grado de protección IP en el texto.
  - El Solo se enciende y apaga con el botón del lateral derecho.
- **Hoja REG001 (2024):**
  - Temperatura de trabajo 0-40 °C.
  - Tabla de bandas y potencias en la UE: Bluetooth, Bluetooth LE, Wi-Fi de 2,4 GHz y de 5 GHz (802.11a/n/ac). La tabla no lista NFC.
  - Declara conformidad con la directiva de equipos radioeléctricos 2014/53/UE y con RoHS 2011/65/UE, y remite al texto completo en la web legal de SumUp.
  - En "Power Rating" lista un cargador de red de 100-240 V con salidas de 5 V a 20 V (modelo CXX012WT2E.00).
  - Pide alimentar el aparato solo con el cable y el adaptador incluidos o autorizados.
  - Su aviso FCC para uso móvil pide una distancia mínima de 20 cm entre el radiador y el cuerpo. Es un texto regulatorio estándar; no he comprobado cómo se aplica a un lector que el cliente toca con la tarjeta.
  - No repite la frase de las 12 horas.
- **Declaración CE del Solo:** solo pude leer la primera página. Dice "Mobile Payment Terminal" con LTE, Bluetooth, Wi-Fi y NFC, marca SumUp Solo, modelo Solo, directivas 2014/30/UE (compatibilidad electromagnética) y 2014/53/UE (radio), emitida por SumUp Limited, Dublín. Las normas armonizadas y las bandas: **sin leer**.
- **FCC SOLO002:** concesión del 6-6-2022, Wi-Fi 2412-2462 MHz (b/g/n20), NFC 13,56 MHz y bandas celulares ([fccid.io](https://fccid.io/2A39U-SOLO002)). **FCC REG001:** concesión del 7-8-2023, Wi-Fi de 2,4 y 5 GHz (5180-5825 MHz) ([fccid.io](https://fccid.io/2A39U-REG001)).
- **Mi deducción:** el hash SHA-256 del anexo FCC "Users Manual" (`c5926edc…`) coincide con el identificador del enlace interno de la copia de manuals.plus, así que esa copia procede del mismo PDF. No lo he comparado byte a byte.

## 4. Cloud API e integración

Fuentes: [Cloud API](https://developer.sumup.com/terminal-payments/cloud-api/), [referencia de la Readers API](https://developer.sumup.com/api/readers) y el `openapi.json` de [sumup-py](https://github.com/sumup/sumup-py) (leído en un clon local, commit del 20-10-2026). No pude abrir la página de referencia de "Get a Reader Checkout"; su contenido sale del OpenAPI.

### 4.1 Requisitos y emparejamiento

1. **Cuenta SumUp** del país del lector. Los términos de API dicen que todo procesamiento de pagos por API exige una cuenta ([términos de API](https://www.sumup.com/es-es/terminos/api/), cl. 1). Requisitos de verificación o límites de una cuenta nueva: no los encontré.
2. **API key** (Ajustes, Para desarrolladores, Toolkit, API Keys). Da acceso amplio a la cuenta y no se puede limitar a permisos concretos; SumUp no la guarda. Recomienda guardarla en un almacén de secretos, rotarla y revocarla si hay sospecha ([API keys](https://developer.sumup.com/tools/authorization/api-keys/)). Alternativa: OAuth 2.0 con permisos (`readers.read`, `readers.write`, `transactions.read`, `refunds.write`…), pensado para otros comerciantes ([autorización](https://developer.sumup.com/tools/authorization/)).
3. **Affiliate Key** (Ajustes, Para desarrolladores, Toolkit, Affiliate Keys), asociada a un identificador de aplicación (`app_id`). La clave es inmutable ([Affiliate Keys](https://developer.sumup.com/tools/authorization/affiliate-keys/)). No es un mecanismo de autorización.
4. **Emparejar el lector:** cerrar sesión en el Solo (Ajustes, Acerca de) porque solo se empareja sin sesión; en el Solo, Conexiones, API, Conectar; sale un código de 8 o 9 caracteres que caduca a los 5 minutos; enviarlo con `POST /v0.1/merchants/{merchant_code}/readers` y un `name`. **Hace falta pantalla del lector en mano** para emparejar y para desemparejar (borrar el lector en la API y pulsar Desconectar en el Solo).
5. Un lector se puede emparejar a una cuenta con otros lectores; la Cloud API admite varios a la vez. La Pi y el Solo deben tener internet; que no tengan que estar en la misma red es deducción mía (la API va por internet), no lo he visto escrito.
6. **Solo Lite no vale.** Los modelos de lector que aparecen son `solo` y `virtual-solo`. Hay un Solo virtual para pruebas con cuenta sandbox, sin tap, sin PIN real y sin pago real.

### 4.2 Crear un cobro

Petición (construida a partir del esquema del OpenAPI, **no probada**):

```
POST https://api.sumup.com/v0.1/merchants/{merchant_code}/readers/{reader_id}/checkout
Authorization: Bearer <API key>

{
  "total_amount": {"currency": "EUR", "minor_unit": 2, "value": 200},
  "description": "<texto corto>",
  "affiliate": {"app_id": "<tu app_id>", "key": "<tu affiliate key>", "foreign_transaction_id": "<id propio único>"},
  "return_url": "https://..."   (opcional; HTTPS público)
}
```

- Solo `total_amount` es obligatorio en el esquema. Si se manda `affiliate`, sus tres campos (`app_id`, `key`, `foreign_transaction_id`) son obligatorios. Importe en unidades menores: 200 con `minor_unit` 2 son 2,00 €.
- Respuesta 201 con `data.checkout_id` y `data.client_transaction_id`. **Solo confirma que el cobro se aceptó, no que se haya pagado.**
- El lector debe estar online. Una vez aceptado, hay 60 s para iniciar el pago en el lector; mientras tanto se rechazan otros cobros del mismo lector.
- Opcionales: `card_type`, `installments` (según país), `tip_rates` y `tip_timeout` (propinas; el Solo necesita 3.3.38.0), `aade` (solo Grecia).

### 4.3 Estados, errores, cancelación y límites

| Tema | Qué dice la fuente |
|---|---|
| Estado del cobro | `GET /v0.1/merchants/{merchant_code}/readers/{reader_id}/checkout/{checkout_id}` devuelve `status`: `pending`, `successful`, `failed`, `cancelled`. También `payment_status`, `payment_failure_reason` (opcional), `valid_until`, `created_at`, `updated_at`, `reader_serial_number`, `reader_firmware_version` y `client_transaction_id`. |
| Caducidad | `valid_until`: pasada esa hora, el cobro se cancela solo. **Cuánto tiempo dura no está documentado.** Sin verificar. |
| Estado del lector | `GET .../readers/{reader_id}/status`: `state` (`IDLE`, `SELECTING_TIP`, `WAITING_FOR_CARD`, `WAITING_FOR_PIN`, `WAITING_FOR_SIGNATURE`, `UPDATING_FIRMWARE`), `status` (`ONLINE` u `OFFLINE`), `battery_level` (0-100), `battery_temperature` (°C), `connection_type` (`Wi-Fi`, `lte`, `umts`, `edge`, `gprs`, `btle`, `usb`), `firmware_version`, `last_activity`. Es el último estado conocido; si el lector está offline, conserva el último. |
| Webhook (`return_url`) | HTTPS público; evento `solo.transaction.updated`; carga con `client_transaction_id`, `merchant_code`, `status` (`successful` o `failed`) y `failure_reason` solo si falló (texto libre, no comparar). `transaction_id` está obsoleto. **No encontré firma ni reintentos documentados para este aviso.** El OpenAPI sí tiene otro sistema de eventos firmados (cobros online y alta de lectores), pero no incluye el estado de un cobro de lector. |
| Cancelar | `POST .../readers/{reader_id}/terminate` (respuesta 202). Solo funciona si el lector espera una acción del cliente (tarjeta, PIN). Sin confirmación; si había `return_url`, llega `failed`. Firmware 3.3.28.0 o superior. |
| Errores | La Readers API lista en conjunto 400, 401, 403, 404, 409 y 422; el 422 corresponde a los endpoints de cobro. Formato `application/problem+json` (`type`, `title`, `status`, `detail`, `instance`). Los 422 incluyen `READER_BUSY` (hay un cobro en curso), `READER_OFFLINE` y errores de validación (importe, `return_url`, propinas). Qué código sale en cada endpoint: sin verificar. |
| Límites de peticiones | **No hay cifras.** Los términos de API (cl. 3) prohíben volúmenes de peticiones no razonables y permiten a SumUp restringir o bloquear el acceso (cl. 5). |
| Idempotencia | El cobro del Solo **no tiene clave de idempotencia** en la doc (sí la tiene el cobro de los terminales Go). Usar `foreign_transaction_id` para reconciliar. |
| Reembolsos | `POST /v1.0/merchants/{merchant_code}/payments/{transaction_id}/refunds`; importe opcional (sin importe, total). Permisos OAuth `payments` o `refunds.write`; vale la API key. Errores 400, 403, 404, 409 (no reembolsable) y 422. No dice plazos ([referencia](https://developer.sumup.com/api/transactions/refund)). |
| Búsqueda de una transacción | `GET /v2.1/merchants/{merchant_code}/transactions` con `client_transaction_id` o `foreign_transaction_id`. |
| Pago offline | No disponible en la Cloud API. |
| Datos móviles | Los activa SumUp a mano; con Wi-Fi disponible el lector usa siempre el Wi-Fi. |
| Cambios de la API | El registro de cambios de la Cloud API tiene una sola entrada (22-12-2025: endpoint de estado del lector). Las rutas de lectores son `/v0.1/`. |

### 4.4 Qué hay que montar en la Pi (resumen)

Flujo mínimo (propuesta mía, no probada): comprobar `status` del lector (`ONLINE` e `IDLE`) antes de dejar pagar, crear el cobro, consultar hasta `successful`, `failed` o `cancelled` (o recibir el aviso), y solo entonces dejar soplar. Si el sensor falla después de cobrar, reembolsar por API. Los detalles de diseño están en [§7](#7-recomendaciones-para-el-alcoholímetro).

## 5. Condiciones de uso y uso desatendido

**Respuesta corta: no está claro.** Los textos que he leído no permiten ni prohíben el uso desatendido. Tampoco dicen qué pasa si el cliente toca el lector sin personal delante.

| Documento | ¿Menciona uso desatendido, autoservicio o máquinas? | Lo relevante |
|---|---|---|
| [Términos Generales](https://www.sumup.com/es-es/terminos-y-condiciones/) (10/12/2024) | No | Una sola cuenta SumUp, salvo aprobación expresa; subcuentas para empleados y usuarios autorizados; cl. 12 "Restricciones": no usar los servicios, ni dejar que otro los use, para un negocio clasificado en la web de SumUp como "Negocio Restringido". |
| [Términos de Pago](https://www.sumup.com/es-es/terminos/pago/) (10/12/2024) | No | Los pagos con datáfono son pagos con tarjeta presente (cl. 5); no cobrar recargos al titular (cl. 16); SumUp puede suspender la cuenta si sospecha una infracción (cl. 15) y retener depósitos o crear una reserva (cl. 17). |
| [Contrato de comerciante](https://www.sumup.com/es-es/contrato-de-servicios-para-comerciantes/) | No | Hay que poder probar la presencia de la tarjeta en cada operación (cl. 5.3); el precio con tarjeta no puede superar el de efectivo (5.4(b)); no imponer importes mínimos o máximos (5.5(b)); no operaciones ajenas a la descripción del negocio sin aprobación (5.5(e)); **no permitir que un tercero use un equipo que le permita hacer transacciones** (6.3); SumUp puede retener o suspender pagos si el número o el importe son muy superiores a lo previsto (11.3 y 11.4). |
| [Términos de API](https://www.sumup.com/es-es/terminos/api/) (02/08/2021) | No | Licencia no transferible ni sublicenciable para aplicaciones que operes tú; tú eres responsable de la seguridad de tus datos; responsabilidad máxima de SumUp: 100 €. |
| [Condiciones de compra](https://www.sumup.com/es-es/condiciones/compra/) (08/09/2025) | No | Solo uso comercial; sin derecho a reventa (cl. 7.2); garantía de 12 meses (8.1), con presunción de mal uso a partir del tercer mes (8.1.2); excluye mal uso y "sin problema encontrado" (8.2). |
| Centro de ayuda de SumUp | No | Búsquedas de "desatendido" y "expendedora": 0 resultados. "Autoservicio": 2 resultados, ambos de SumUp Kiosco. "Vending": 3 resultados sin relación. |
| [Lista de negocios incompatibles](https://help.sumup.com/es-ES/articles/3G8ZHjdgFZjmKWOmDWS52m-negocios-incompatibles) | No | No aparece nada parecido a un alcoholímetro. Las categorías más cercanas serían juegos de pago con premios en metálico (no aplica) y dispositivos médicos no aprobados. La guía (§0, riesgo 4) ya anota que el ZE29A no es un etilómetro homologado y que el resultado se muestra como orientativo. Cómo clasifica SumUp esta actividad: **sin verificar**. |

- **Lo más cercano a "desatendido" en SumUp:** la tabla de [developer.sumup.com](https://developer.sumup.com/terminal-payments) describe la Cloud API como apta para "Kiosk, POS, or web-based systems where the reader operates independently". Y SumUp vende **SumUp Kiosco**, un punto de venta de autoservicio donde el cliente pide y paga con un datáfono conectado ([ayuda](https://help.sumup.com/es-ES/articles/3o25VqKu1Y6DxOT0Ysv34M-que-es-sumup-kiosco)); la propia ayuda describe un local con personal que prepara el pedido, así que no prueba que se acepte sin nadie delante.
- **Lectura en contra (mía):** las cláusulas 5.3 y 6.3 del contrato podrían usarse para negarlo en una disputa. Una operación contactless en tu máquina sí es con tarjeta presente (el cliente apoya su tarjeta), así que 5.3 no debería ser problema; 6.3 habla de terceros que usan el equipo para hacer transacciones por su cuenta, que no es tu caso. Es una interpretación mía, no de SumUp.
- **Riesgo real:** el contrato permite a SumUp suspender, retener o crear reservas con criterios amplios. Un volumen distinto del declarado o un negocio raro invitan a una revisión. Declarar la actividad y el volumen esperado ayuda (mío).
- **Lo que no he leído:** el contrato firmado de tu cuenta concreta (puede diferir de las páginas públicas) y los términos de otros países.

### Alternativas pensadas para desatendido

**No he podido consultar las páginas de los otros proveedores** (permiso de acceso no concedido a tiempo) y se agotó el presupuesto de búsquedas. Esta tabla es una lista de comprobación, no una comparación: lo que pone en la segunda columna es lo que recuerdo, **sin verificar hoy**.

| Proveedor | Para qué se usa (de memoria, sin verificar) | Qué preguntar | Fuente consultada |
|---|---|---|---|
| SumUp Kiosco | Autoservicio de pedidos con datáfono SumUp, con personal | ¿Admite una máquina sin personal y un Solo con la Cloud API? | [ayuda de SumUp](https://help.sumup.com/es-ES/articles/3o25VqKu1Y6DxOT0Ysv34M-que-es-sumup-kiosco) (solo esto) |
| Nayax | Pagos en máquinas desatendidas (vending, lavandería, juegos) con lectores para integrar en máquinas | Interfaz con tu máquina (serie, pulsos, MDB), certificaciones, contrato, precios | Ninguna. [nayax.com](https://www.nayax.com/): no se abrió |
| Adyen | Plataforma de pagos con terminales y API; hay terminales para desatendido | Mínimos de volumen y alta; qué terminal; integración desde una Pi | Ninguna. No se abrió |
| Stripe Terminal | Lectores con SDK y API; algunos modelos sirven en quioscos | Qué lector admite uso desatendido en España; certificación; coste | Ninguna. [docs.stripe.com](https://docs.stripe.com/terminal/readers): no se abrió |

## 6. Fallos, bugs y problemas conocidos

Hay pocos informes técnicos independientes del Solo. Lo que sigue mezcla texto oficial, reseñas sueltas y deducciones mías, y cada punto lo indica.

| # | Problema | Gravedad para el proyecto |
|---|---|---|
| 1 | Bloqueo permanente antimanipulación por calor, frío o golpes | Alta |
| 2 | Carga permanente y batería de litio: instrucciones contradictorias | Alta |
| 3 | Sin internet no hay cobro; el Wi-Fi del Solo dentro de la chapa | Alta |
| 4 | Contactless tras el marco de acero y ranura de chip tapada | Alta, sin datos |
| 5 | Suspensión o retención de fondos de la cuenta | Alta (negocio) |
| 6 | Actualizaciones automáticas que pueden dejar al lector sin cobrar | Media-alta |
| 7 | Cuelgues, reinicio solo con el botón y apagado a las 2 h en reposo | Media-alta |
| 8 | Menús del Solo al alcance del público | Media-alta, sin verificar |
| 9 | Bloqueo por país y origen del lector | Media |
| 10 | Garantía de 12 meses | Media |
| 11 | Caídas del servicio de SumUp | Media |
| 12 | Alimentación no original | Media |
| 13 | Pagos duplicados | Media-baja, sin informes |
| 14 | Baterías hinchadas y falsificaciones | Sin informes encontrados |
| 15 | Versión de hardware desconocida | Baja-media |
| 16 | Cifras contradictorias en la documentación de SumUp | Baja |

### 6.1 Bloqueo permanente antimanipulación

SumUp explica que sus datáfonos tienen bloqueos de seguridad automáticos y permanentes contra la manipulación, que pueden saltar por condiciones extremas o impactos fuertes. Para evitarlo recomienda no pasar de 40 °C ni bajar de 0 °C y no dejar caer el lector. Un lector bloqueado en garantía se sustituye gratis; la web sugiere mientras tanto Tap to Pay en el móvil ([ayuda](https://help.sumup.com/es-ES/articles/1fH1DQy2SCfsXvrdb76MS0-dispositivo-bloqueado)). Un usuario del foro UK Business Forums (10-7-2023) cuenta que su Solo mostró un aviso de llamar a SumUp y que le dijeron que, por tener más de un año, había que cambiarlo; asegura que lo había usado como mucho 4 horas en 2022 y que estuvo un año en un cajón. Otro usuario sospecha que saltó el bloqueo antimanipulación y comenta que, fuera de garantía, suele tocar un reemplazo; es una suposición suya, no de SumUp. Otros dos usuarios del mismo hilo dicen que sus lectores llevan más de dos y más de tres años sin problemas ([hilo](https://www.ukbusinessforums.co.uk/threads/card-readers.423054/post-3198566)). Es una sola anécdota de 2023: no prueba que el bloqueo venga del calor.
**Para este proyecto (conclusión mía):** una máquina de bar con fuente de alimentación dentro y sol de ventana puede pasar de 40 °C, y recibirá empujones y golpes. Tu antecedente con máquinas de puñetazos hace el riesgo de impacto más real. Según la guía (§4), la caja interior suspendida con muelles lleva la Pi y el sensor; **el Solo va en la caja de arriba, fijo a la carcasa**, sin suspensión.

### 6.2 Carga permanente y batería

- **SumUp, tres versiones:**
  - La Cloud API recomienda con fuerza mantener el Solo enchufado ([Cloud API](https://developer.sumup.com/terminal-payments/cloud-api/)).
  - La guía de usuario v4 manda desconectar al terminar la carga, no cargar más de 12 horas y no usarlo mientras carga ([guía v4](https://manuals.plus/sumup/solo-card-reader-manual)).
  - La ayuda en inglés dice que puede seguir aceptando operaciones mientras carga ([ayuda](https://help.sumup.com/en-GB/articles/5O4zuxJ7i8LBXcGMFXj11G-card-reader-advice)).
  - La hoja REG001 (2024) no repite la regla de las 12 horas. **No sé cuál prevalece.**
- **La batería:** Li-Po de 6,16 Wh, que un retailer describe como celda de 1,6 Ah y 4,35 V. Battery University explica que mantener una celda de iones de litio cargada al máximo y con calor la envejece más que ciclarla, que a 4,35 V la vida en ciclos de una celda normal se reduce a la mitad y que lo más dañino es tenerla llena a temperatura elevada ([BU-808](https://batteryuniversity.com/article/bu-808-how-to-prolong-lithium-based-batteries)). No sé cómo gestiona la carga el firmware del Solo.
- **Si se deforma,** el manual manda dejar de usarla. No encontré ningún informe concreto de Solo con batería hinchada (las búsquedas solo devolvieron páginas de producto), lo que no prueba que no existan. La batería solo la cambia SumUp.
- **Apagado:** el Solo se apaga solo tras 2 horas en reposo sin uso ([ayuda: batería](https://help.sumup.com/en-GB/articles/37GnITqs6Bj4501z24ENy0-article-solve-card-reader-battery-issues)). Si también ocurre cargando: **sin verificar**. Si se apaga, supongo (deducción mía) que hará falta pulsar el botón del lateral, que queda dentro de la caja. La misma ayuda recomienda activar "Auto-lock" (tiempo de espera de la pantalla) para ahorrar batería.
- **Si la carga falla,** la misma ayuda manda reiniciar, comprobar la versión de software, desconectar el lector de la base (o de la impresora) y enchufar el cable directamente, y probar otro cable USB-C compatible. Si sigue sin cargar y está en garantía, se sustituye.

### 6.3 Conexión: Wi-Fi, SIM y la radio dentro de la chapa

- **Sin conexión no hay cobro** con la Cloud API (ver [§4.3](#43-estados-errores-cancelación-y-límites)).
- **Datos móviles:** la Cloud API los admite solo si SumUp los activa a mano, y con Wi-Fi disponible el lector prefiere el Wi-Fi. SumUp tuvo una incidencia el 26-3-2025: un proveedor de datos móviles falló unas 12 horas y bloqueó lectores europeos con LTE; el aviso decía que se siguiera cobrando por Wi-Fi o Bluetooth ([status.sumup.com](https://status.sumup.com/usa/incidents/01JQ8VNKHBZFB08Z5NNJVTN8YX)). Es un caso, no una estadística.
- **Wi-Fi públicos o con portal:** un cliente de Coolblue cuenta que el lector no se unió al Wi-Fi público de una feria (octubre de 2024), y sugiere un punto de acceso personal o un router; SumUp sugiere esa misma salida para el primer pago ([Coolblue](https://www.coolblue.de/en/productreviews/894205), [ayuda](https://help.sumup.com/es-ES/articles/4tgJAevloxAxQn0YNlHygd-articulo-solucionar-problemas-mi-datafono-solo)). Reseña de 2022 del mismo sitio: el modo API solo funciona con Wi-Fi, queja que la doc de hoy ya no sostiene (admite datos móviles activados por SumUp).
- **Dentro de la chapa:** la guía evita el problema para la Pi (antena fuera), pero **la antena del Solo queda en el mismo recinto metálico** y la ventana de 78 × 78 es su única abertura. No hay doc de SumUp sobre ubicación ni materiales. Es una deducción mía; pide una prueba con la caja cerrada.

### 6.4 Contactless detrás del marco de acero y ranura de chip tapada

- **Alcance:** SumUp dice que se acerque la tarjeta a 3-4 cm del terminal; el límite sin contacto es de 50 € por operación y el banco puede poner menos ([SumUp: contactless](https://www.sumup.com/es-es/pagos-contactless/)). La página no habla de metal ni de interferencias.
- **Metal:** Wikipedia explica que un metal cercano amortigua la antena del lector por corrientes parásitas y que una etiqueta puede necesitar una separación mínima; el alcance práctico no pasa de 10 cm ([NFC](https://en.wikipedia.org/wiki/Near-field_communication)). Es información general. **No hay ensayo de SumUp ni cifras para una ventana de 78 × 78 con 2,6 mm de acero encima.**
- **Dónde está la antena del Solo:** sin verificar. Si estuviera bajo el borde de la pantalla, el marco taparía justo esa zona. Por eso conviene una ventana mayor que el cuerpo (ver [§7](#7-recomendaciones-para-el-alcoholímetro)).
- **Chip tapado:** si el banco pide chip y PIN tras varios pagos seguidos o por importe, el cliente no podrá insertar la tarjeta. Las reglas exactas las ponen los bancos emisores y no las he consultado. Con importes pequeños supongo que será raro (deducción mía), pero puede ocurrir. El móvil o el reloj (Apple Pay, Google Pay) no tienen este problema.
- **Antes de que el cliente apoye:** una reseña dice que el Solo puede tardar varios segundos en estar listo para aceptar una tarjeta ([reseña](https://mobiletransaction.org/sumup-solo-review)).

### 6.5 Suspensión o retención de fondos

El contrato permite retener liquidaciones y suspender pagos si el número o el importe de las operaciones es muy superior al previsto o no encaja con la actividad habitual (cl. 11.3 y 11.4) y compensar deudas sin aviso (18.7). Los términos de pago permiten suspender o cerrar la cuenta si SumUp considera que hay infracción (cl. 15) y crear una reserva a su criterio (cl. 17). No encontré informes de bloqueos de cuenta por uso desatendido: tampoco encontré que nadie lo haya probado. Los fondos retenidos no generan intereses.

### 6.6 Actualizaciones automáticas

El Solo busca actualizaciones solo, después de cada operación según la ayuda en inglés, y no he visto forma de aplazarlas ([ayuda: actualizar](https://help.sumup.com/es-ES/articles/352FZ2npYNpAVMzJLxFZnE-actualizacion-firmware), [ayuda: consejos](https://help.sumup.com/en-GB/articles/5O4zuxJ7i8LBXcGMFXj11G-card-reader-advice)). El propio centro de ayuda reconoce que tras una actualización importante el lector puede dejar de aceptar pagos o rechazar un pago antes de presentar la tarjeta; propone cobrar 1 € por el punto de acceso de un móvil, o desactivar el ajuste de IVA del lector ([solucionar problemas del Solo](https://help.sumup.com/es-ES/articles/4tgJAevloxAxQn0YNlHygd-articulo-solucionar-problemas-mi-datafono-solo)). Esos arreglos exigen tocar el lector. Durante una actualización el estado es `UPDATING_FIRMWARE`.

### 6.7 Cuelgues y reinicio

Si el Solo se congela o la pantalla no responde, el remedio oficial es mantener pulsado el botón de encendido 8 segundos, con el lector cargando. **El botón queda en el lateral derecho, dentro de la caja.** Tu diseño debe dejarlo accesible a un técnico sin desmontar el panel.

### 6.8 Menús del Solo al alcance del público

Según la ayuda de SumUp, los ajustes se abren tocando o arrastrando hacia abajo una flecha en la parte superior de la pantalla (Conexiones, Wi-Fi, datos móviles) ([ayuda: internet](https://help.sumup.com/en-GB/articles/5poYpJSwehH3dwowMiZoTt-internet-connection)). La ventana deja la pantalla a la vista y al tacto. **Sin verificar:** si en modo Cloud API el Solo tiene bloqueo de pantalla o PIN de operador, y qué puede cambiar un cliente. Un vándalo podría apagar el Wi-Fi o salir del modo API.

### 6.9 Bloqueo por país y origen del lector

El lector queda ligado al país de su primer uso y no se puede cambiar; vale para todos los datáfonos de SumUp. SumUp cita como causa comprar uno de segunda mano ([ayuda](https://help.sumup.com/es-ES/articles/2n9E8TrLMelcCE5Z9RR2tI-datafonos-sumup-con-bloqueo-por-restriccion-geografica)). **El precio de tu hoja es bastante inferior al de SumUp ([§2.3](#23-tabla-de-especificaciones)): comprueba el vendedor y que sea nueva y precintada.** Lo que SumUp hará si ese Solo ya se usó en otro país: sin verificar.

### 6.10 Garantía

12 meses desde la entrega y reposición con un reacondicionado equivalente o mejor (cl. 8.1 y 8.3 de las [condiciones de compra](https://www.sumup.com/es-es/condiciones/compra/)). Pasados 3 meses, un fallo se presume por mal uso del comerciante salvo prueba en contra. **Si lo compras en Amazon, esas condiciones pueden no aplicar** (sin verificar); entonces la garantía es la del vendedor.

### 6.11 Caídas del servicio de SumUp

StatusGator (terceros) lista, entre otras, una caída de 5 h 29 min el 11-6-2026 (inicios de sesión) y un fallo de pagos el 27-6-2026; dice haber registrado más de 752 caídas desde septiembre de 2022, un recuento propio que no he podido comprobar ([StatusGator](https://statusgator.com/services/sumup/card-readers-solo)). Mi herramienta no pudo abrir status.sumup.com.

### 6.12 Alimentación no original

El manual avisa de que cargadores o cables no autorizados pueden causar incendio o explosión, y pide solo los incluidos o autorizados. Tu diseño usa una fuente de 5,20 V con un cable de terceros (#10). Alimentar por USB desde una fuente de 5 V es corriente, pero **va contra la letra del manual** y SumUp podría usarlo para rechazar una garantía. No sé qué corriente pide el lector (sin verificar).

### 6.13 Pagos duplicados

No encontré informes. El riesgo teórico viene de los reintentos: el cobro del Solo no tiene clave de idempotencia. SumUp rechaza un segundo cobro mientras haya uno pendiente (60 s), pero un reintento posterior podría crear un cobro nuevo. Se evita reconciliando antes de reintentar (ver [§7](#7-recomendaciones-para-el-alcoholímetro)).

### 6.14 Baterías hinchadas y falsificaciones

No encontré informes de ninguna de las dos cosas para el Solo (búsqueda hecha, resultados pobres). Lo más cercano es el riesgo de la unidad de segunda mano ([§6.9](#69-bloqueo-por-país-y-origen-del-lector)).

### 6.15 Versión de hardware desconocida

SOLO002 (2022, 2,4 GHz) y REG001 (2023-2024, 2,4 y 5 GHz). La doc de la Cloud API no distingue entre ellas (deducción mía: se comportan igual), pero cambian el Wi-Fi, el cargador de la hoja y la hoja de seguridad. Comprueba el identificador FCC en el propio lector (Ajustes, Acerca de), que el manual dice que muestra la etiqueta electrónica.

### 6.16 Cifras contradictorias de SumUp

Pantalla 3" frente a 3,62"; temperatura -10 °C frente a 0 °C; autonomía de 100 (retailer y reseña), 300 (SumUp España) o más de 500 operaciones (Currys, probablemente confundido con el Air, mi suposición). La página de datáfonos de SumUp España cita una "Tarifa Plana" de 25 € al mes que no aparece en la de precios, donde Pagos Plus cuesta 19 € al mes; no sé si son el mismo plan ([datáfonos](https://www.sumup.com/es-es/datafonos/), [precios](https://www.sumup.com/es-es/precios/)). Trata las cifras sueltas con cautela.

## 7. Recomendaciones para el alcoholímetro

Son conclusiones mías, no afirmaciones de las fuentes.

1. **Pide a SumUp por escrito (amplía el texto de §9 de la guía)** y no fabriques en serie sin respuesta:
   - Si aceptan un Solo con la Cloud API en una máquina sin personal, y bajo qué condiciones.
   - Cómo clasifican la actividad (máquina recreativa de medición de alcohol) y qué volumen de operaciones pequeñas consideran normal.
   - Si se puede dejar el Solo cargando de forma permanente, y a qué temperatura máxima (cargando).
   - Si los datos móviles de la Cloud API se pueden activar en tu cuenta, y si cae al móvil cuando falla el Wi-Fi.
   - Qué importe mínimo admite el cobro por API.
   - Qué cubre la garantía si el lector se bloquea por temperatura o por un golpe.
   Guarda la respuesta con fecha.
2. **Compra nuevo y precintado, y comprueba el vendedor.** No uses un Solo ya activado. Al recibirlo anota número de serie, versión (SOLO002 o REG001), firmware y, si puedes, quién lo vende.
3. **Haz el primer uso con el perfil español.** Si lo pruebas fuera de España, usa siempre el perfil español (SumUp mezcla "país de primer uso" y "perfil de origen"). Antes de instalarlo, empareja y haz un cobro de prueba de 1 € en el taller.
4. **Calor:**
   - Mide la temperatura junto al Solo con la máquina cerrada y en carga, y ponle un margen: yo exigiría que no pase de 35 °C (criterio mío). La guía (§0, riesgo 5) activa el ventilador cuando la caja pasa de 40 °C, que es justo el umbral que SumUp da para evitar el bloqueo: no deja margen.
   - Aleja el Solo de la fuente y deja que el aire frío le llegue primero.
   - En pruebas, registra `battery_temperature` y `battery_level` con `GET .../status` cada pocos minutos. Es el último estado conocido y puede ir con retraso.
5. **Carga continua:** si SumUp no lo confirma, hay una opción a evaluar, no probada: que la Pi corte la alimentación del Solo con un relé cuando `battery_level` llegue al 90 % y la reponga al 40 %. Evita el estado de carga completa permanente, pero añade una pieza, contradice la recomendación de SumUp de tenerlo enchufado y no sé si el lector se apaga solo a las 2 h. Decide con la respuesta de SumUp.
6. **Golpes:** monta el Solo sobre gomas o espuma y no en contacto rígido con la chapa; reserva espacio para que el panel no lo presione. SumUp dice que no se deje caer y que los impactos pueden bloquearlo.
7. **Contactless, protocolo de prueba antes de cerrar el panel:**
   - Haz el hueco desde el principio de al menos 85 × 85 (el plan B de la guía, §2.5), con el Solo a ras del panel y un marco de plástico, no de acero, alrededor.
   - Usa policarbonato o plástico de 1-2 mm delante, sin lámina metalizada, y con la menor separación posible (el alcance es de 3-4 cm).
   - Prueba con tarjetas de varios bancos y redes (Visa y Mastercard), móvil, reloj y una tarjeta de plástico duro; 50 pagos por prueba y anota la tasa de éxito y la distancia.
8. **Chip y PIN:** o dejas accesible la ranura de chip (hueco pequeño en el panel), o aceptas que algunos pagos fallen y lo indicas en pantalla ("pague con móvil o tarjeta sin contacto"). Con el ticket por debajo de 50 € el pago normal es contactless.
9. **Conexión:**
   - Mide la intensidad de Wi-Fi del Solo con la caja cerrada (pantalla Conexiones).
   - No dependas del Wi-Fi de invitados del bar: portal cautivo y filtros. Usa un router propio con SIM dentro de la máquina (tu Plan B) o pide a SumUp activar los datos móviles del lector como segunda vía. La Pi necesitará internet en cualquier caso.
   - Con el router dentro de la máquina, el punto de acceso queda a pocos centímetros del Solo, lo que debería mejorar la señal; la antena del Solo sigue dentro de la chapa, así que hay que medirlo igualmente (deducción mía).
10. **Integración (módulo de pago aislado):**
    - No guardes la API key en la Pi del bar. Pon un servidor intermedio (la guía, §9, apunta esta opción o cifrar la clave) que guarde la clave y solo permita "cobrar X € en el lector de esta máquina", con un token por máquina.
    - Antes de aceptar el pago, mira `status`: `ONLINE` e `IDLE`. Si no, muestra "fuera de servicio" y no dejes soplar.
    - Crea cada cobro con un `foreign_transaction_id` propio y único. Si hay un fallo de red, **no reintentes a ciegas**: consulta antes el estado del cobro o la transacción con ese identificador.
    - Consulta cada 3-5 s y para tras un tope (por ejemplo, 90 s): llama a `terminate` y trátalo como no pagado.
    - Maneja 422 `READER_BUSY` (espera) y `READER_OFFLINE` (fuera de servicio).
    - Si el sensor falla tras cobrar, reembolsa por API y guarda la traza.
    - Sé cuidadoso con la API key de reembolsos: da acceso amplio.
11. **Flota:** nombra cada lector por máquina, vigila `firmware_version`, `battery_level`, `battery_temperature`, `connection_type` y `last_activity` con alertas, y ten un Solo de repuesto por tanda. El bloqueo de uno deja una máquina fuera de servicio hasta que llegue otro.
12. **Prepara la salida:** si SumUp dice que no, necesitarás otro lector. Mantén el módulo de pago separado del resto del programa para cambiarlo sin tocar el sensor ni la pantalla.
13. **Normativa:** el Solo es un equipo radioeléctrico con su propia declaración CE ([enlace](https://assets.ctfassets.net/txhaodyqr481/69X8uFuoC14J77oE7y0ga8/6a87808687c1ab91894566478f0f1ace/SumUp_Solo_CE_Declaration_of_Conformity_Access__signed.pdf) ([copia local](datasheets/SumUp_Solo_CE_Declaration_of_Conformity_Access__signed.pdf))). Guárdala en el expediente técnico de la máquina y no lo modifiques (ni antena ni carcasa del lector).
14. **Otras piezas:** el Plan B (router 4G ZTE MF79N) afecta a su propia ficha; el cable USB-A a USB-C (#10) y el borne USB-A (#18) son también las piezas de esta alimentación.

## 8. Lo que no he podido verificar

- **El anuncio de Amazon:** vendedor, si es nuevo, versión del hardware (SOLO002 o REG001) y qué lleva en la caja.
- **Si el precio de 72,18 € incluye IVA** y por qué está un 24,5 % por debajo del precio de SumUp.
- **Posición del USB-C y de la antena NFC** (dibujos del manual y fotos internas del FCC; estas últimas tras un aviso de cookies que no acepté).
- **Si la base carga por contactos o por inducción**, y la corriente de carga y consumo del lector.
- **Aprobación PCI PTS:** número, versión y caducidad (no pude abrir la página del consejo PCI). Tampoco los certificados EMV, el certificado TQM y la declaración de la base: solo pude abrir la primera página de la declaración CE del Solo.
- **Alternativas (Nayax, Adyen, Stripe Terminal):** no abrí ninguna de sus páginas; la tabla es de memoria.
- **status.sumup.com:** no se abrió (permiso no concedido a tiempo).
- **La página de referencia "Get a Reader Checkout"** (error de la herramienta). Uso el OpenAPI.
- **Cuánto dura un cobro antes de cancelarse** (`valid_until`) y qué pasa con un cobro pendiente si la Pi se queda sin red.
- **Si el modo de pantalla "nunca" existe**, y si el Solo se apaga a las 2 h estando cargando.
- **Qué pantallas puede tocar el público** y si hay bloqueo de operador en modo API.
- **NFC a través de acero:** no hay ensayo de SumUp ni otra fuente concreta.
- **Si el Solo cae solo a datos móviles cuando falla el Wi-Fi** en modo Cloud API (la doc dice que con ambos disponibles usa siempre el Wi-Fi, pero no qué hace si el Wi-Fi se pierde).
- **Reglas de los bancos** para chip y PIN tras varios pagos contactless.
- **Condiciones de garantía de una compra en Amazon.**
- **Reseñas y foros:** Galaxus y Argos no cargaron el texto de las reseñas. No encontré informes de baterías hinchadas, pagos duplicados ni clones. El único informe de bloqueo es el del hilo de UK Business Forums, de 2023 y de una sola persona.
- **Requisitos de verificación (KYC) de la cuenta y límites para cuentas nuevas.**
- **Fiscalidad:** la ayuda de SumUp tiene un artículo sobre VeriFactu y TicketBAI en la sección del Solo ([enlace](https://help.sumup.com/es-ES/articles/j69uUWh4ivo3zGm7te0nm-conectar-sumup-verifactu-ticketbai)). No lo leí; conviene que lo mires con tu gestor.
- **El contrato vigente de tu cuenta:** las páginas públicas pueden no ser la versión que aceptes.

## 9. Fuentes

Copias locales de los documentos descargados: [lista en enlaces.md](enlaces.md#copias-locales-de-los-documentos) y carpeta [`datasheets/`](datasheets/).

Todos los enlaces, ordenados por tipo, con nota de los que no pude abrir, en [`enlaces.md`](enlaces.md).
