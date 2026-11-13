# Cobrar sin el SumUp Solo

**20 alternativas con precios, opinión y orden de recomendación** · Proyecto Alcoholímetro · 13-11-2026

Versión para imprimir: [ALTERNATIVAS-COBRO-13-11-2026.pdf](ALTERNATIVAS-COBRO-13-11-2026.pdf). Las cuentas salen de [`datos.py`](datos.py).

## En corto

- **El problema no es la empresa SumUp, es el tipo de aparato.** El Solo es un datáfono de mostrador con batería. Cambiarlo por otro de mostrador (Square, Stripe S700, Revolut, PayPal) deja la máquina igual.
- **Lo que lo arregla es un terminal para máquinas sin personal:** sin batería, alimentado por la máquina, con su propia SIM, enrasado en el frente y con cristal antivandálico. Varios cobran solos y avisan a la Pi con un pulso, como un monedero de monedas.
- **Mis tres primeras:** Payter Apollo, Nayax VPOS Touch y myPOS Sigma. La cuarta, Viva.com con un PAX IM30, es la que menos comisión se lleva.
- **Cuestan más que SumUp, pero poco:** con 5.000 pruebas al año, entre 20 y 345 € más por máquina y año **[cálculo]**. Un solo viaje a reparar una máquina cuesta más.
- **Pondría además un QR en la pantalla** como segundo cobro: si el terminal cae, la máquina sigue vendiendo.
- **La decisión es tuya** (te la reservaste) y toca otra regla tuya: no he visto ninguna de las cinco primeras en Amazon **[sin confirmar: Amazon no se deja leer desde aquí]**.

> Trabajo de papel: nada está probado con aparatos y no he hablado con ningún proveedor. Los precios son los públicos del 13-11-2026. Cada dato lleva su origen: **[web]** leído hoy en la página que se cita, **[hoja]** documentación del fabricante, **[cálculo]** sale de `datos.py`, **[estimación]** cifra razonada, **[de memoria]** lo sé pero no lo he verificado hoy y **[sin confirmar]** hay que preguntarlo.

## 1. Seis cosas que cambian el planteamiento

**1. Datáfono de mostrador o terminal de máquina.** El Solo trabaja de 0 a 40 °C, lleva batería y se puede bloquear para siempre con golpes o calor (ficha del repositorio). Un terminal de máquina no tiene batería, se alimenta de la máquina y está hecho para ir en un frente: el myPOS Sigma trabaja de −20 a 70 °C con IP65 e IK08, el Payter Apollo es IK09 y el Castles S1U2, IK10 **[hoja]**.

**2. Cobro por pulsos: el terminal cobra solo.** Payter, Nayax y myPOS pueden fijar el importe en el terminal, cobrar con su propia conexión y mandar un pulso eléctrico cuando el pago está hecho **[web]**. La Pi solo lee ese pulso. Sobran la Cloud API, la consulta cada 3 segundos (del orden de 1 GB al mes, según el bloque 1) y la Wi-Fi entre la Pi y el lector. Si el módem de la Pi se cae, la máquina sigue cobrando y midiendo, y las fotos se suben cuando vuelva. Nayax y myPOS tienen además una entrada de inhibición **[hoja]**: en principio, la Pi puede decirle al terminal que no cobre si el sensor no responde **[sin confirmar]**.

**3. Con 2 €, el fijo por operación manda.** Cada 0,05 € fijos son 2,5 puntos de comisión. Por eso Stripe (0,10 €), Adyen (0,11 €) y las pasarelas online (0,25 €) salen mal, y las de solo porcentaje salen bien **[cálculo]**.

**4. El PIN.** La norma europea deja pagar por contactless sin PIN hasta 50 €, pero solo mientras no se pasen cinco pagos seguidos o 150 € acumulados desde la última vez que se pidió; la excepción para terminales sin personal solo cubre transporte y aparcamiento **[web: Reglamento 2018/389 y EBA]**. Con el Solo detrás de los policarbonatos nadie puede teclear el PIN, así que esos pagos con tarjeta física fallan. Con el móvil no suele pasar, porque Apple Pay y Google Pay ya identifican al cliente en cada pago **[de memoria]**. Un terminal con PIN en pantalla y el frente al alcance lo resuelve.

**5. Bizum en el datáfono.** Desde el 18-05-2026 se puede pagar con Bizum por NFC en comercios. El despliegue es gradual y depende del banco y del comercio; los TPV Android de Redsys y Cecabank no necesitan cambiar de aparato **[web]**. Es un punto a favor de la vía con adquirente español (Paytef, Wipay, banco). Si SumUp, myPOS o Viva lo aceptan **[sin confirmar]**.

**6. El frente de la máquina cambia.** Un terminal de máquina no va detrás de un policarbonato: va en un hueco del frente, con su propio cristal. Obliga a tocar el CAD, pero quita la duda mayor del bloque 1: si el pago sin contacto atraviesa dos policarbonatos y un marco de chapa (prueba A2). A cambio queda una pieza a la vista, y hay que elegirla por su resistencia a golpes.

**Sobre el servicio de SumUp:** los monitores externos recogen varias incidencias en 2026, casi todas de minutos u horas: por ejemplo, 42 minutos de fallos con Mastercard el 15-08 y unas dos horas de pagos fallando el 27-06 según su página de estado de Estados Unidos **[web]**. No tengo datos para decir que sea peor que el de otros. El riesgo está en el aparato y en que su contrato no menciona el uso sin personal (ficha del repositorio).

## 2. Cómo las he ordenado

Siete criterios con su peso. Las notas son mías **[estimación]**: sirven para ordenar, no para medir. Entre dos opciones separadas por dos décimas manda el presupuesto que te den. La nota de cada criterio está en el anexo.

| | Criterio | Peso | Qué mira |
|---|---|---|---|
| A | Fiabilidad 24/7 y autonomía | 30 % | Aparato sin batería que arranca solo, conexión propia, cobra aunque falle lo demás, historial del proveedor. |
| B | Robustez física y diseño para máquina | 15 % | Hecho para ir enrasado en un frente sin personal: golpes (IK), agua (IP), temperatura. |
| C | Coste con una prueba de 2 € | 15 % | Comisión, fijo por operación y cuotas. Con 2 € el fijo manda. |
| D | Integración con la Raspberry Pi | 10 % | Cuánto hay que cambiar en el programa y en el cableado, y cuánto puede fallar. |
| E | Contratar en España y empezar con una unidad | 10 % | Precio público, alta por internet, sin mínimos ni permanencia. |
| F | Gestión remota y flota | 5 % | Ver desde lejos el estado de cada terminal, alertas, recambios. |
| G | Facilidad de pago para el cliente | 15 % | Acercar la tarjeta o el móvil y listo, frente a sacar el móvil y escanear. |

## 3. Las 20, de un vistazo

**1 a 5:** las probaría. **6 a 13:** válidas, a falta de presupuesto. **14 a 20:** no resuelven el problema o solo sirven de respaldo. El SumUp Solo, puntuado igual, saca un 6,7: cualquier datáfono de mostrador queda por debajo de lo que ya tienes.

| N.º | Solución | Tipo | Nota | Por prueba de 2 € | En una frase |
|---|---|---|---|---|---|
| 1 | **Payter Apollo** | Terminal desatendido | 8,6 | 0,040 € (2,0 %) | El más robusto y el más barato de los «de verdad» |
| 2 | **Nayax VPOS Touch** | Terminal desatendido | 8,3 | 0,070 € (3,5 %) | La apuesta segura; la más cara por uso |
| 3 | **myPOS Sigma** | Terminal desatendido | 8,2 | 0,084 € (4,2 %) | Sin cuotas y se compra hoy; ideal para el prototipo |
| 4 | **Viva.com + PAX IM30** | Terminal desatendido + API | 8,1 | 0,034 € (1,7 %) | La que menos comisión se lleva |
| 5 | **Paytef + banco** | Pasarela española + terminal desatendido | 8,0 | a presupuesto | La vía seria cuando haya muchas máquinas |
| 6 | **Wipay** | Adquirente español + terminal desatendido | 7,7 | a presupuesto | Un solo proveedor español con experiencia en vending |
| 7 | **Worldline Vending Suite** | Terminal desatendido + pasarela | 7,6 | a presupuesto | Hardware excelente, trato de gran cuenta |
| 8 | **QR + MONEI** | Sin terminal: paga con el móvil | 7,4 | 0,018 € (0,9 %) | Como segundo canal, sí; como único cobro, no |
| 9 | **Mollie + PAX IM30** | Terminal desatendido + API | 7,4 | a presupuesto | Buena API; falta confirmar España y tarifa |
| 10 | **Banco directo** | Banco + terminal de vending | 7,3 | 0,009 € (0,4 %) | Barato por operación, difícil de integrar |
| 11 | **Adyen + Castles S1U2** | Terminal desatendido + API | 7,3 | 0,128 € (6,4 %) | Lo mejor técnicamente; solo para empresas grandes |
| 12 | **Orain** | Sistema de pago para vending por suscripción | 7,3 | a presupuesto | Cuota fija sin comisión: puede salir muy bien o muy mal |
| 13 | **Sipay** | Pasarela española + terminal | 7,2 | a presupuesto | Otra española a la que pedir precio |
| 14 | **QR + Stripe** | Sin terminal: paga con el móvil | 6,7 | 0,280 € (14,0 %) | Se monta en un día, pero se lleva el 14 % |
| 15 | **Stripe S700 / S710** | Datáfono de mostrador con API | 6,6 | 0,128 € (6,4 %) | Mejor API, mismo problema físico y 4 veces más caro |
| 16 | **Square Terminal** | Datáfono de mostrador con API | 6,4 | 0,075 € (3,8 %) | Otro datáfono de mostrador |
| 17 | **Revolut Terminal** | Datáfono de mostrador | 6,1 | 0,036 € (1,8 %) | Comisión muy baja, sin forma de mandarle cobros |
| 18 | **Android con Tap to Pay** | SoftPOS | 5,7 | 0,034 € (1,7 %) | Todo de Amazon, pero no está pensado para esto |
| 19 | **PayPal / Zettle** | Lector de mostrador | 5,6 | 0,035 € (1,8 %) | Peor que lo que ya tienes |
| 20 | **Monedero de monedas** | Efectivo | 5,4 | 0 € | Lo que querías dejar atrás |

## 4. Presupuestos

Precios públicos leídos el 13-11-2026, sin IVA salvo que se diga. No son ofertas en firme: la oferta de verdad la da cada proveedor cuando se le pide, y varios no publican nada.

### Lo que publica cada uno

| N.º | Solución | Aparato | Alta | Cuota al mes | Comisión |
|---|---|---|---|---|---|
| — | *SumUp Solo (hoy)* | 79 € + IVA | — | 0 € | 1,49 % |
| 1 | **Payter Apollo** | 627 € + IVA | 12,50 € | 11,50 € (6,50 sin su SIM) | 2,00 %, mínimo 5 €/mes |
| 2 | **Nayax VPOS Touch** | 430 a 975 € según tienda | 45 € | 12 € | 3,5 % (4 % por debajo de 2 €) |
| 3 | **myPOS Sigma** | 399 a 499 € + IVA | 0 € | 0 € | 1,69 % + 0,05 € |
| 4 | **Viva.com + PAX IM30** | ≈ 500 € [estimación] | 0 € | 0 € | 1,69 % (mín. 0,03 €); packs desde 0,84 % |
| 5 | **Paytef + banco** | a presupuesto | a presupuesto | cuota (soporte 24×7 incluido) | la tasa de tu banco |
| 6 | **Wipay** | a presupuesto | a presupuesto | a presupuesto | a medida |
| 7 | **Worldline Vending Suite** | a presupuesto | a presupuesto | a presupuesto | a medida |
| 8 | **QR + MONEI** | 0 € | 0 € | 0,03 €/día por cuenta | 0,45 % tarjeta nacional · 0,9 % Bizum |
| 9 | **Mollie + PAX IM30** | a consultar | 0 € | 0 € | sin publicar para España |
| 10 | **Banco directo** | alquiler | 49 € (ejemplo) | 19 € (ejemplo) | 0,35 % débito · 0,50 % crédito (ejemplo) |
| 11 | **Adyen + Castles S1U2** | a presupuesto | 0 € | factura mínima | ≈ 0,11 € + intercambio + 0,60 % |
| 12 | **Orain** | sin inversión inicial | 0 € | suscripción (a presupuesto) | sin comisión por operación |
| 13 | **Sipay** | a presupuesto | a presupuesto | a presupuesto | a medida |
| 14 | **QR + Stripe** | 0 € | 0 € | 0 € | 1,5 % + 0,25 € |
| 15 | **Stripe S700 / S710** | 259 € + IVA | 0 € | 0 € | 1,4 % + 0,10 € |
| 16 | **Square Terminal** | 165 € + IVA | 0 € | 0 € | 1,25 % + 0,05 € |
| 17 | **Revolut Terminal** | 189 € + IVA | 0 € | plan de cuenta (10 €) | 0,8 % + 0,02 € |
| 18 | **Android con Tap to Pay** | ≈ 150 € [estimación] | 0 € | 0 € | la del proveedor (p. ej. Viva) |
| 19 | **PayPal / Zettle** | sin precio español a mano | 0 € | 0 € | 1,75 % |
| 20 | **Monedero de monedas** | ≈ 30 € [estimación] | 0 € | 0 € | 0 % |

### Lo que sale al año por máquina **[cálculo]**

| Solución | Por prueba | 1.500 pruebas | 5.000 pruebas | 10.000 pruebas | Aparato y alta + 2 años a 5.000 |
|---|---:|---:|---:|---:|---:|
| *SumUp Solo (lo que hay hoy)* | 0,030 € | 45 € | 149 € | 298 € | 377 € |
| Payter Apollo | 0,040 € | 198 € | 338 € | 538 € | 1.316 € |
| Nayax VPOS Touch | 0,070 € | 249 € | 494 € | 844 € | 1.611 € |
| myPOS Sigma | 0,084 € | 126 € | 419 € | 838 € | 1.287 € |
| Viva.com + PAX IM30 | 0,034 € | 51 € | 169 € | 338 € | 838 € |
| QR + MONEI | 0,018 € | 27 € | 90 € | 180 € | — |
| Banco directo | 0,009 € | 242 € | 273 € | 318 € | — |
| Adyen + Castles S1U2 | 0,128 € | 192 € | 640 € | 1.280 € | — |
| QR + Stripe | 0,280 € | 420 € | 1.400 € | 2.800 € | — |
| Stripe S700 / S710 | 0,128 € | 192 € | 640 € | 1.280 € | 1.539 € |
| Square Terminal | 0,075 € | 113 € | 375 € | 750 € | 915 € |
| Revolut Terminal | 0,036 € | 54 € | 180 € | 360 € | 549 € |
| Android con Tap to Pay | 0,034 € | 51 € | 169 € | 338 € | 488 € |
| PayPal / Zettle | 0,035 € | 53 € | 175 € | 350 € | — |
| Monedero de monedas | 0 € | 0 € | 0 € | 0 € | 30 € |

- Los volúmenes son supuestos míos, no datos: 1.500 pruebas al año son unas 4 al día y 10.000, unas 27.
- Nayax: cuota y comisiones de una tienda alemana; en España pueden ser otras. Aparato a 578 € (699 € con IVA).
- Viva: con el 1,69 % público y su mínimo de 0,03 €. Con un pack del 0,84 % quedaría en 0,03 € por prueba.
- Banco directo: ejemplo de oferta integrada publicada; el terminal suele ir en alquiler.
- MONEI: como si todo se pagara por Bizum (0,9 %); con tarjeta nacional sería la mitad. Aparte, 0,03 € al día por cuenta.
- Revolut: aparte, el plan de la cuenta (10 € al mes, uno para toda la flota).
- Adyen: sin contar su factura mínima mensual.

## 5. Ficha y opinión de cada una

### Las probaría

#### 1. Payter Apollo + adquirente (Elavon / Excell Pay) — 8,6

*Terminal desatendido · El más robusto y el más barato de los «de verdad»*

- **Qué es.** Terminal holandés hecho solo para máquinas sin personal (vending, recreativas, cargadores de coche). Pantalla táctil de 3,5", 4G, Wi-Fi y LAN, lector de QR, sensor de proximidad, IK09 antivandálico y PIN en pantalla **[hoja: folleto SuzoHapp]**. En España lo vende Eurocoin Components.
- **Precio.** **627 € + IVA** en Eurocoin, hoy sin stock **[web]**. Alta 12,50 €. Al mes: 2,50 € de servicio, 4 € de pasarela y 5 € de SIM (opcional). Comisión del **2,00 % con un mínimo de 5 € al mes**, con Elavon / Excell Pay; se puede usar otro adquirente compatible **[web]**. En el Reino Unido se vende a 585 £ con cuotas de 7 a 11 £ y 12 meses de permanencia **[web]**.
- **Conexión con la Pi.** Tres vías **[web: Eurocoin]**: **pulsos** (importe fijo: cobra y manda un pulso, que la Pi lee por un GPIO con optoacoplador), **MDB** (la máquina pide el importe y recibe la confirmación) o librerías para integrarlo por programa.
- **A favor.** Sin batería. Pensado para ir enrasado en el frente. Panel MyPayter con el estado de cada terminal. Es la opción barata entre las que están hechas para esto.
- **En contra.** Dos contratos (Payter y el adquirente) y alta de hasta 10 días **[web: Monta]**. La ficha de Eurocoin lo describe como contactless sin PIN: hay que confirmar que la versión trae PIN. Alimentación (lo normal son 12–24 V) y permanencia en España **[sin confirmar]**.
- **Mi opinión.** Es la que probaría primero. Junta lo que pides: aguanta golpes, cobra sola con su SIM y se conecta a la Pi como un monedero. Con 5.000 pruebas al año sale unos 190 € más cara que SumUp **[cálculo]**. La pega es el papeleo con el adquirente; si Elavon pone problemas con la actividad, pasa a la siguiente.
- Fuentes: [Eurocoin Components](https://eurocoin.es/en/producto/payter-apollo/) · [SuzoHapp](https://oem.suzohapp.com/wp-content/uploads/2023/12/SH-PayterApollo-flyer-A4-EN.pdf) · [TOB International](https://tobinternational.co.uk/product/payter-apollo-modem/) · [Monta](https://monta.com/en/help-center/set-up-payter-terminal/)

#### 2. Nayax VPOS Touch — 8,3

*Terminal desatendido · La apuesta segura; la más cara por uso*

- **Qué es.** El nombre más conocido en máquinas sin personal: vending, lavanderías, sillones de masaje, fotomatones. Un solo proveedor pone el terminal, la adquirencia y el panel con telemetría y alertas. 3G/4G y Ethernet **[web]**, cristal Gorilla antivandálico y sensores de puerta abierta y de temperatura **[hoja: manual VPOS Touch]**.
- **Precio.** Terminal: 652,50 € (Grupo Innovaly), 699 € con IVA (Eurochip), 975 € + IVA con cable y alta (Hostelería10); 430 € en una tienda alemana **[web]**. Esa tienda alemana publica las cuotas: **12 € al mes**, alta de 45 € y comisión por tramos: **4 % por debajo de 2 €, 3,5 % de 2 a 5 €** y 2,95 % por encima **[web; en España sin confirmar]**. Nayax dice que no hay permanencia **[web]**.
- **Conexión con la Pi.** **Pulsos**: 6 entradas/salidas y una entrada de inhibición **[hoja]**, que en principio sirve para que la máquina le diga «no cobres» **[sin confirmar]**. También MDB, o **Marshall** (RS-232 con SDK en C para Linux), en el que la máquina confirma si la venta se entregó, pero que obliga a certificar la integración con Nayax **[web: Nayax DevZone]**.
- **A favor.** Trabaja justo tu tipo de máquina: su tienda lista atracciones infantiles, fotomatones y sillones de masaje, y dice tener más de 95.000 operadores **[web]**. Alertas en tiempo real y ventas de cada máquina en el panel **[web]**. Distribuidor en España (Nayaxvend Ibérica).
- **En contra.** El más caro: con 2 € se lleva 7 céntimos por prueba más la cuota. Un anuncio español dice que no incluye SIM ni alta: confirmarlo. PIN en su pantalla de 2,4" **[sin confirmar]**. Hay alguna opinión de cliente muy mala **[web]**.
- **Mi opinión.** Si prefieres pagar más a cambio de no pensar, es esta: un contrato, un panel y un teléfono al que llamar. Con 5.000 pruebas al año son unos 345 € más que SumUp **[cálculo]**. Pediría su presupuesto a la vez que el de Payter y decidiría con los dos en la mano.
- Fuentes: [Grupo Innovaly](https://www.grupoinnovaly.com/tienda/electronica-e-informatica/127-nayax-vpos-touch-amarillo.html) · [Eurochip](https://eurochip.es/inicio/265-nayax-pos-vpos-touch.html) · [Hostelería10](https://hosteleria10.com/lavado/lavadoras/nayax-lector-tarjetas-vpos-touch.html) · [Vapemaxx (Alemania)](https://www.vapemaxx.de/en/products/nayax-vpos-touch-kartenterminal) · [Manual del VPOS Touch (copia en FCC)](https://fcc.report/FCC-ID/2AK6L-VPOST/3770077.pdf) · [Nayax DevZone](https://devzone.nayax.com/docs/integrate-pos-device/marshall/get-started/c-sdk-integration) · [Tienda de Nayax para España](https://shop.nayax.com/es_es) · [Hostelearte](https://hostelearte.com/limpieza-higiene-para-bares-y-restaurantes/lavadoras-industriales-y-profesionales/lavadoras-autoservicio-industriales/lector-nayax-vpos-touch-tarjeta-nfc-qr) · [VMFS](https://vmfsusa.com/blogs/business/nayax-vending-card-reader-guide) · [SourceForge](https://sourceforge.net/software/product/Nayax)

#### 3. myPOS Sigma — 8,2

*Terminal desatendido · Sin cuotas y se compra hoy; ideal para el prototipo*

- **Qué es.** Terminal desatendido de myPOS, proveedor europeo de datáfonos con cuenta propia. Android 11, pantalla de 5", **IP65 e IK08, de −20 a 70 °C**, 4G, Wi-Fi, LAN y Bluetooth; se alimenta a 12–48 V en continua **[hoja: ficha myPOS]**.
- **Precio.** **399 a 499 € + IVA** según la tienda **[web: tiendas y comparativas francesas; la ficha española no da precio]**. Sin cuota mensual. **1,69 % + 0,05 €** con tarjetas de particulares del EEE; una comparativa española habla de 1,45 % + 0,05 € **[web]**. El dinero entra al momento en la cuenta myPOS; pasarlo a tu banco cuesta 3–4 € por transferencia **[web: comparativas]**.
- **Conexión con la Pi.** App **myPOS Pulse**: importe fijo y pulso de 30, 50 o 100 ms por un pin de salida; tiene pines de entrada y opciones de inhibición **[hoja: documentación myPOS]**. También MDB y RS-232, USB o TCP/IP con SDK.
- **A favor.** Alta por internet, sin contrato ni mínimos. Rango térmico de sobra para tu caja. Es la forma más rápida de tener un cobro desatendido funcionando.
- **En contra.** Los 5 céntimos fijos pesan: 4,2 % efectivo sobre 2 € **[cálculo]**. Hay quejas de cuentas bloqueadas en opiniones de usuarios **[web]**. Panel de flota básico. Necesita 12 V (tu fuente da 5 V). SIM incluida **[sin confirmar]**.
- **Mi opinión.** Para el banco de pruebas es la mejor: se compra por internet y no te ata a nada. Para la flota me fío algo menos que de Payter o Nayax, que solo viven de máquinas. Con pocas pruebas al año es la más barata de las tres porque no tiene cuota.
- Fuentes: [myPOS España](https://www.mypos.com/es-es/comprar-datafono/unattended-payment-solution) · [myPOS Developers](https://developers.mypos.com/in-person-payments/unattended-solutions/pulse-communication) · [myPOS Developers](https://developers.mypos.com/in-person-payments/unattended-solutions) · [Mon Petit Paiement](https://mon-petit-paiement.com/mypos-sigma-avis/) · [TPE Carte Bancaire](https://tpecartebancaire.fr/es/content/10-tarifas-terminal-mypos) · [Sincomisiones](https://sincomisiones.org/mypos-opinion) · [MoneyRadar](https://moneyradar.org/banque/mypos/)

#### 4. Viva.com + PAX IM30 — 8,1

*Terminal desatendido + API · La que menos comisión se lleva*

- **Qué es.** Viva.com (entidad de pagos europea con sucursal en España) con su app de terminal sobre un **PAX IM30**, un terminal Android para máquinas: Ethernet, Wi-Fi y 4G, montable, IP54 e IK08 **[web: Viva y PAX]**.
- **Precio.** Comisión orientativa del **1,69 %** para tarjetas de particulares del EEE en sus webs de Francia, Portugal e Italia, con un **mínimo de 0,03 € por operación**; la web española anuncia «packs desde el 0,84 %» al registrarse y devolución de comisiones si gastas con su tarjeta **[web]**. Sin cuota publicada. El IM30 ronda los 500–575 € en tiendas; con Viva, a consultar **[estimación]**.
- **Conexión con la Pi.** **Cloud Terminal API** (como ahora con SumUp: la Pi pide el cobro por internet) o **Local Terminal API** (por la red local, sin pasar por la nube para hablar con el terminal) **[web]**. La app tiene un modo desatendido **[web: guía de Ventrata]**. Anuncian pagos sin conexión.
- **A favor.** Coste por prueba casi igual al de SumUp, pero con un terminal hecho para máquinas. El cambio en el programa es pequeño: sustituir `sumup.js` por otro cliente.
- **En contra.** Con la API en la nube el cobro sigue dependiendo del internet de la Pi. Android: más cosas que se pueden colgar. Hay que hablar con ventas para el IM30 y para el uso sin personal.
- **Mi opinión.** Si acabas con muchas máquinas es la que deja más margen: unos 170 € al año con 5.000 pruebas, 20 € más que SumUp **[cálculo]**. La pongo cuarta porque no cobra sola por pulsos y porque me falta confirmar con Viva el suministro del terminal.
- Fuentes: [Viva.com España](https://www.viva.com/es-es/vendor-solutions/integrations) · [Viva.com España](https://www.viva.com/es-es/vendor-solutions/supported-devices) · [Viva.com España](https://www.viva.com/es-es/payments) · [Viva.com Portugal](https://www.viva.com/pt-pt/pricing) · [Ventrata](https://support.ventrata.com/en/articles/10130788-how-to-set-up-the-im30-payment-terminal) · [PAX](https://www.paxtechnology.com/im30) · [eBay](https://www.ebay.de/itm/176681789622)

#### 5. Paytef + tu banco (Redsys) — 8,0

*Pasarela española + terminal desatendido · La vía seria cuando haya muchas máquinas*

- **Qué es.** Pasarela presencial española. Tú eliges banco adquirente (uno o varios) y Paytef pone el puente y la API entre tu programa y el terminal. Trabaja con terminales atendidos y desatendidos; está certificada con Redsys para la gama PAX, incluido el IM30, y con el pinpad desatendido de Ingenico **[web]**.
- **Precio.** No publica tarifas: cuota por terminal con soporte 24 horas incluido **[web]**, más la tasa del banco. Como referencia de tasa bancaria integrada: **0,35 % en débito y 0,50 % en crédito, 19 € al mes y 49 € de alta** (oferta de Comercia con TPVOnline) **[web]**. En general los bancos cobran del 0,3 al 1,5 % y de 5 a 40 € al mes **[web: comparativas]**.
- **Conexión con la Pi.** API REST con JSON y SDK; también MDB y Executive para vending **[web]**. Hay que integrar y pasar su puesta en marcha.
- **A favor.** Porcentaje bajo y sin fijo por operación. Si un banco falla o sube precios, cambias de banco sin tocar la máquina. Al ser adquirencia española, es la vía natural para Bizum por NFC **[estimación]**.
- **En contra.** Dos contratos y más papeleo. Cuotas fijas cada mes, vendas o no. Nada de precios públicos: todo con presupuesto.
- **Mi opinión.** Con una máquina no compensa. Con veinte, probablemente sí. Pediría presupuesto ya para saber el número, aunque el prototipo se haga con otra.
- Fuentes: [Paytef](https://paytef.es/presencial/) · [PAX](https://www.paxtechnology.es/blog/paytef-despliega-innovadoras-soluciones-de-terminales-de-pago-pax-android-en) · [Paytef](https://paytef.es/noticias/pin-pad-desatendido-iun-iself-series/) · [Paytef](https://paytef.es/en/) · [TPVOnline](https://www.tpvonline.es/comercia-global-payments-cms-112-50-1821-1844/) · [Rankia](https://rankiabusiness.com/comisiones-tpv/) · [Batemat](https://batemat.es/comisiones-tpv-cuanto-cobran-los-bancos-tipos-de-tarifa-y-como-reducir-el-coste/)

### Válidas, a falta de presupuesto

#### 6. Wipay (terminal Android QPayPos) — 7,7

*Adquirente español + terminal desatendido · Un solo proveedor español con experiencia en vending*

- **Qué es.** Marca de Global Payment Systems S.L. (Jaén), entidad de pago autorizada por el Banco de España, con adquirencia propia de Visa y Mastercard y terminales Android QPayPos para vending, parking, lavandería y carga de coches **[web]**.
- **Precio.** Precio a medida; no publican tarifas **[web]**.
- **Conexión con la Pi.** Su integración del terminal Q5000 en neveras inteligentes se hizo entera en la nube y por API **[web: nota de prensa]**.
- **A favor.** Terminal y adquirencia con la misma empresa, española y centrada en máquinas sin personal. Llevan todo el parque del operador Arbitrade **[web]**.
- **En contra.** Empresa pequeña. Sin precios ni documentación técnica públicos.
- **Mi opinión.** Merece un correo pidiendo presupuesto junto al de Paytef: si su comisión no lleva fijo, puede competir con las cuatro primeras.
- Fuentes: [4YFN](https://www.4yfn.com/exhibitors/28157-wipay) · [Forbes España](https://forbes.es/?p=876295) · [Diario Estrategia](https://www.diarioestrategia.cl/texto-diario/mostrar/5324829/wipay-impulsa-tecnologia-retail-integracion-pago-tarjeta-neveras-inteligentes) · [PaymentProviders](https://paymentproviders.io/providers/wipay)

#### 7. Worldline WL Vending Suite (Valina, Self/2000 LE, Castles S1U2) — 7,6

*Terminal desatendido + pasarela · Hardware excelente, trato de gran cuenta*

- **Qué es.** La oferta de Worldline para vending en España: terminales desatendidos con PIN, de hasta IK10 e IP65, más pasarela, con adquirencia propia o de terceros «a la carta» **[web: folleto español]**.
- **Precio.** Solo con presupuesto.
- **Conexión con la Pi.** Protocolos de vending y las interfaces de Worldline; en su web suiza piden certificar la máquina completa **[web]**. En España **[sin confirmar]**.
- **A favor.** Terminales de los más duros (hasta IK10) y un grupo enorme detrás.
- **En contra.** Pensado para operadores con volumen e integradores; lento y caro para empezar con una unidad.
- **Mi opinión.** Para dentro de dos años, si la flota crece. Hoy no perdería tiempo aquí.
- Fuentes: [Worldline España](https://worldline.com/content/dam/worldline/local/es-es/documents/brochures/brochure-vending-suite-es.pdf) · [Worldline](https://worldline.com/en-ch/home/main-navigation/solutions/merchants/solutions-and-services/terminals/unattended-payment-terminals)

#### 8. QR en la pantalla con MONEI (Bizum, Apple Pay, Google Pay, tarjeta) — 7,4

*Sin terminal: paga con el móvil · Como segundo canal, sí; como único cobro, no*

- **Qué es.** La pantalla enseña un QR, el cliente paga en su móvil y la Pi recibe la confirmación. MONEI es una pasarela española con licencia del Banco de España y Bizum **[web]**.
- **Precio.** Plan **MONEI Pay** (tienda física): 0,45 % con tarjeta nacional, 1,65 % de la UE, 2,95 % de empresa o de fuera, **0,9 % con Bizum** y 0,03 € al día **[web: soporte de MONEI]**. Ojo: su plan online lleva fijo (0,90 % + 0,25 € más intercambio; Bizum 1,29 % + 0,25 € + 0,17 €) **[web]**, y con 2 € eso no sale. Hay que confirmar que un cobro creado por API desde una máquina entra en MONEI Pay **[sin confirmar]**.
- **Conexión con la Pi.** API de pagos: crear el cobro, pintar el QR y esperar la confirmación.
- **A favor.** No hay lector que romper ni ventana que atravesar. Coste de aparato cero. Bizum tiene más de 30 millones de usuarios **[web]**.
- **En contra.** Sacar el móvil, escanear y confirmar: de madrugada se pierde venta. Depende del internet de la Pi y de que el cliente tenga cobertura dentro del bar.
- **Mi opinión.** Lo añadiría sea cual sea el terminal: si el terminal cae, la máquina sigue vendiendo. Como único cobro no lo pondría.
- Fuentes: [MONEI](https://support.monei.com/hc/en-us/articles/360017954318-MONEI-fees) · [MONEI](https://monei.com/payment-methods/bizum/) · [MONEI frente a Stripe](https://monei.com/stripe-alternative/) · [Ecosistema Startup](https://ecosistemastartup.com/?p=81625)

#### 9. Mollie + PAX IM30 — 7,4

*Terminal desatendido + API · Buena API; falta confirmar España y tarifa*

- **Qué es.** Pasarela holandesa. Su documentación recoge el PAX IM30 como terminal para cobro desatendido, por Ethernet o Wi-Fi y sin 4G **[web: docs de Mollie]**.
- **Precio.** En España vende pagos presenciales con otros terminales (A920 Pro y A35) **[web]**; la tarifa presencial y si sirven aquí el IM30 **[sin confirmar]**.
- **Conexión con la Pi.** Una sola API: se crea el pago con el identificador del terminal y se consulta su estado **[web]**. Es casi lo mismo que hace hoy `sumup.js`.
- **A favor.** Integración sencilla y bien documentada. Sin cuotas ni permanencia en sus tarifas estándar.
- **En contra.** Sin 4G propio en el IM30 de Mollie: dependería siempre de la red de la Pi. Faltan datos de España.
- **Mi opinión.** Solo la miraría si Viva no da el IM30: es el mismo aparato con otra pasarela.
- Fuentes: [Mollie](https://docs.mollie.com/docs/im30-terminal) · [Mollie](https://docs.mollie.com/docs/integrating-mollie-terminals) · [Mollie España](https://www.mollie.com/es/growth/payment-terminal-eol-pci-compliance-guide)

#### 10. Banco directo con TPV desatendido (Comercia/CaixaBank, Sabadell, BBVA, Santander) — 7,3

*Banco + terminal de vending · Barato por operación, difícil de integrar*

- **Qué es.** Contratar el TPV con el banco y que ponga un terminal de vending como el Ingenico Self/2000: solo contactless, IK09, PIN en pantalla y 4G opcional **[hoja: Ingenico]**.
- **Precio.** Tasas del 0,3 al 1,5 % y cuota de 5 a 40 € al mes **[web: comparativas]**. Ejemplo publicado: 0,35 % / 0,50 %, 19 € al mes y 49 € de alta **[web]**. CaixaBank tiene tarifa plana desde 12 € al mes hasta 2.000 € de facturación, pero es para su TPV de mostrador **[web]**.
- **Conexión con la Pi.** Aquí está el problema: el banco no te da una API web, sino su protocolo de TPV integrado, con homologación **[de memoria, sin verificar hoy]**. Para eso existen Paytef y similares.
- **A favor.** La comisión más baja y Bizum por NFC en cuanto el banco lo active.
- **En contra.** Integración pesada, alta lenta, cuotas fijas y un gestor de banco que no sabe de máquinas.
- **Mi opinión.** No iría directo al banco: iría con Paytef o Wipay y que ellos traigan el banco.
- Fuentes: [Ingenico](https://ingenico.com/sites/default/files/resource-document/2023-10/SELF%202000%20datasheet_OCT23.pdf) · [TPVOnline](https://www.tpvonline.es/comercia-global-payments-cms-112-50-1821-1844/) · [Rankia](https://rankiabusiness.com/comisiones-tpv/) · [Batemat](https://batemat.es/comisiones-tpv-cuanto-cobran-los-bancos-tipos-de-tarifa-y-como-reducir-el-coste/) · [CaixaBank](https://www.caixabank.es/empresa/negocios/tpv-mini.html)

#### 11. Adyen + Castles S1U2 — 7,3

*Terminal desatendido + API · Lo mejor técnicamente; solo para empresas grandes*

- **Qué es.** El S1U2 es un terminal Android desatendido de exterior con eSIM de serie: si falla la red pasa solo a 4G, y tiene modo quiosco **[hoja: manual de Adyen]**; el fabricante lo da como IK10 e IP65 **[hoja]**.
- **Precio.** Unos 0,11 € fijos por operación más intercambio y un 0,60 %: cerca de **0,13 € por prueba** **[cálculo]**. Además hay una factura mínima mensual que Adyen no publica; terceros hablan de 100 a 1.000 € al mes **[web]**.
- **Conexión con la Pi.** Terminal API, por la nube o en local. Muy buena.
- **A favor.** El terminal más duro de la lista (IK10), con 4G de respaldo de serie, y una plataforma de pagos de primera fila.
- **En contra.** El fijo de 0,11 € se come el 5,5 % de cada prueba y la factura mínima lo descarta con pocas máquinas.
- **Mi opinión.** Descartada hoy. Tenla en mente si algún día hay cientos de máquinas y negocias precio.
- Fuentes: [Adyen](https://docs.adyen.com/point-of-sale/user-manuals/s1u2-user-manual) · [Castles Technology](https://cdn-assets.inwink.com/0b61be1d-c656-4312-87f7-eaf7cbc154b7/be2e9770-21fa-4cbc-9c7c-af7a890230d2) · [Adyen España](https://www.adyen.com/es_ES/dispositivos-tpv/castles-s1u2) · [NerdWallet](https://www.nerdwallet.com/business/software/learn/adyen) · [EightX](https://eightx.co/blog/compare/how-much-does-adyen-cost) · [Merchant Maverick](https://www.merchantmaverick.com/reviews/adyen-review/)

#### 12. Orain (Barcelona) — 7,3

*Sistema de pago para vending por suscripción · Cuota fija sin comisión: puede salir muy bien o muy mal*

- **Qué es.** Empresa de Barcelona con sistemas de pago para vending, lavanderías, parkings y lavado de coches: tarjeta contactless, Apple Pay, Google Pay y su propia app **[web]**.
- **Precio.** Cuota mensual o anual, **sin costes de integración, sin negociar con bancos y sin comisión por operación** **[web: preguntas frecuentes de Orain]**; modelo de suscripción sin inversión inicial **[web: prensa]**. La cifra, a presupuesto.
- **Conexión con la Pi.** Va cableado al sistema de cobro de la máquina **[web]**; con una máquina propia, MDB o pulsos **[sin confirmar]**.
- **A favor.** Con pruebas de 2 €, una cuota fija sin porcentaje puede ser lo más barato si la máquina trabaja.
- **En contra.** Con una máquina que venda poco, la cuota se lo come. Empuja a usar su app. Poca información técnica.
- **Mi opinión.** Pediría el precio de la cuota: si son menos de 15 € al mes por máquina, sube varios puestos.
- Fuentes: [Orain](https://www.orain.io/en/faqs/) · [Hostelvending](https://www.hostelvending.com/noticias-vending/orain-consigue-3-millones-de-euros-para-rentabilizar-los-micropagos-digitales) · [Orain](https://www.orain.io/es/blog/sistemas-de-pago-para-maquinas-expendedoras)

#### 13. Sipay — 7,2

*Pasarela española + terminal · Otra española a la que pedir precio*

- **Qué es.** Fintech española de pagos con más de 30 años. Ofrece terminales certificados de mano, de mostrador y desatendidos, con su app sobre Android y modo sin conexión **[web]**.
- **Precio.** Solo con presupuesto.
- **Conexión con la Pi.** Terminal integrado con tu sistema o independiente **[web]**; detalles **[sin confirmar]**.
- **A favor.** Española, con soporte aquí y cobro sin conexión.
- **En contra.** Orientada a comercio y hostelería más que a máquinas. Sin precios públicos.
- **Mi opinión.** Tercera en la lista de correos a pasarelas españolas, después de Paytef y Wipay.
- Fuentes: [Sipay](https://sipay.es/en/products/in-person-payments/)

### No resuelven el problema o solo sirven de respaldo

#### 14. QR en la pantalla con Stripe (Payment Links o Checkout) — 6,7

*Sin terminal: paga con el móvil · Se monta en un día, pero se lleva el 14 %*

- **Qué es.** Igual que el anterior, con Stripe: QR, página de pago con Apple Pay y Google Pay, y confirmación a la Pi.
- **Precio.** **1,5 % + 0,25 €** con tarjetas europeas estándar **[web: Stripe España]**: 0,28 € de cada prueba de 2 € **[cálculo]**.
- **Conexión con la Pi.** Para mí, la mejor documentada. Los enlaces de pago se convierten en QR **[web]**.
- **A favor.** Nada que romper, alta en minutos, sin cuotas.
- **En contra.** El fijo de 0,25 € lo hace carísimo con 2 €. La misma fricción de móvil que el otro QR.
- **Mi opinión.** Solo como respaldo de emergencia mientras no esté MONEI: mejor cobrar 1,72 € que nada.
- Fuentes: [Stripe España](https://stripe.com/es/pricing) · [Stripe España](https://stripe.com/es/lp/payments/payments-platform)

#### 15. Stripe Terminal (Reader S700 / S710) — 6,6

*Datáfono de mostrador con API · Mejor API, mismo problema físico y 4 veces más caro*

- **Qué es.** Lector Android de Stripe para mostrador o mano. El S710 añade 4G de respaldo y está disponible en España **[web]**.
- **Precio.** **259 € + IVA** el S700 y **1,4 % + 0,10 €** por cobro con tarjetas del EEE **[web]**: 0,128 € por prueba **[cálculo]**.
- **Conexión con la Pi.** Integración por servidor, muy parecida a la de SumUp. El modo sin conexión solo funciona con sus SDK, no con la integración por servidor **[web: docs de Stripe]**.
- **A favor.** Plataforma muy sólida y gestión de lectores a distancia.
- **En contra.** El único lector desatendido de Stripe, el Verifone UX700, solo se ofrece en Estados Unidos **[web]**. El S700 es otro aparato de mostrador con batería, y el fijo de 0,10 € pesa mucho.
- **Mi opinión.** No cambia nada de lo que te preocupa y cuesta cuatro veces más por prueba. Fuera.
- Fuentes: [Stripe España](https://stripe.com/es/pricing) · [Stripe Terminal en España](https://stripe.com/en-es/terminal) · [Stripe](https://support.stripe.com/questions/using-terminal-in-attended-semi-attended-and-unattended-retail-environments) · [Stripe](https://docs.stripe.com/extensibility/terminal-for-pos-partners) · [Stripe](https://stripe.com/en-ch/terminal/s710)

#### 16. Square Terminal + Terminal API — 6,4

*Datáfono de mostrador con API · Otro datáfono de mostrador*

- **Qué es.** Datáfono todo en uno con impresora. Su Terminal API está disponible en España desde el lanzamiento **[web]**.
- **Precio.** **165 € + IVA** (el hub para Ethernet, 59 €) y **1,25 % + 0,05 €** **[web]**: 0,075 € por prueba **[cálculo]**.
- **Conexión con la Pi.** La Pi manda el cobro al terminal por la API de Square.
- **A favor.** Barato de comprar y fácil de dar de alta.
- **En contra.** Aparato de mostrador con batería e impresora; necesita Wi-Fi o Ethernet. Más caro que SumUp por prueba.
- **Mi opinión.** Es cambiar un Solo por otro Solo más grande. No.
- Fuentes: [Square España](https://squareup.com/es/es/hardware/terminal) · [Square](https://developer.squareup.com/blog/square-launches-in-spain/) · [SumUp](https://www.sumup.com/es-es/compare/sumup-vs-square/)

#### 17. Revolut Terminal — 6,1

*Datáfono de mostrador · Comisión muy baja, sin forma de mandarle cobros*

- **Qué es.** Datáfono de Revolut Business con eSIM integrada **[web]**.
- **Precio.** **189 € + IVA** y **0,8 % + 0,02 €** con tarjetas de particulares nacionales y europeas **[web]**: 0,036 € por prueba **[cálculo]**. Hace falta cuenta Revolut Business; el plan básico figura a 10 € **[web: prensa]**.
- **Conexión con la Pi.** No he encontrado una API para lanzar cobros a un terminal desde un servidor, sin su app **[sin confirmar]**.
- **A favor.** La comisión con fijo más baja de la lista.
- **En contra.** Aparato de mostrador y, hasta donde he visto, sin integración posible con la Pi.
- **Mi opinión.** Descartada mientras no haya API. Aunque la hubiera, es otro datáfono de mostrador.
- Fuentes: [Revolut España](https://revolut.com/es-ES/business/accept-payments-pricing) · [Revolut España](https://revolut.com/es-ES/business/revolut-terminal) · [Revolut](https://www.revolut.com/ca-ES/business/in-person-payments-comparison/) · [Finantres](https://finantresnoticias.com/negocios-y-autonomos/revolut-business-cobrar-tarjeta-comisiones-liquidacion/)

#### 18. Cobro en un móvil Android dentro de la caja (Tap to Pay) — 5,7

*SoftPOS · Todo de Amazon, pero no está pensado para esto*

- **Qué es.** Un Android con NFC detrás de la ventana, con la app de un proveedor que cobre sin lector. Viva dice que su app va en cualquier Android 8.1 o superior con NFC y anuncia Tap to Pay para cobro desatendido **[web]**.
- **Precio.** El móvil y la comisión del proveedor.
- **Conexión con la Pi.** Con Viva, la misma API que con el IM30.
- **A favor.** Es la única alternativa que se compra entera en Amazon.
- **En contra.** El estándar de cobro en móvil está pensado para cobros con personal; para máquinas se siguen usando terminales específicos **[web: Paytef]**. Un móvil de consumo siempre cargando tiene el mismo problema de batería y calor que el Solo.
- **Mi opinión.** No la recomiendo: cambia un aparato de consumo por otro.
- Fuentes: [Viva.com](https://intercom.help/vivacomeu/es/articles/10210826-guia-para-elegir-dispositivos-de-viva-com) · [Viva.com](https://viva.com/en-eu/businesses/unattended-payment-solutions) · [Paytef](https://paytef.es/que-es-el-softpos/)

#### 19. PayPal Reader (Zettle) — 5,6

*Lector de mostrador · Peor que lo que ya tienes*

- **Qué es.** El lector de PayPal, antes Zettle.
- **Precio.** **1,75 %** por cobro en sus tarifas europeas **[web]**; precio del lector en España **[sin confirmar]**.
- **Conexión con la Pi.** Existe una API para manejar el lector (Reader Connect), pero solo para socios aprobados **[web]**.
- **A favor.** Sin cuotas.
- **En contra.** Lector con batería, integración cerrada y más caro que SumUp.
- **Mi opinión.** Descartada.
- Fuentes: [Supergood](https://supergood.ai/api-report-card/zettle) · [Spendways](https://www.spendways.com/produit/paypal-pos/)

#### 20. Monedero de monedas como respaldo — 5,4

*Efectivo · Lo que querías dejar atrás*

- **Qué es.** Un selector de monedas con salida de pulsos, en paralelo con el cobro con tarjeta.
- **Precio.** Unos 20–40 € el selector **[estimación]** y ninguna comisión.
- **Conexión con la Pi.** Un pulso a un GPIO, igual que un terminal por pulsos.
- **A favor.** Cobra aunque no haya internet ni proveedor de pagos.
- **En contra.** Se atasca, invita a forzar la máquina y obliga a ir a recaudar: lo contrario de «no ir nunca».
- **Mi opinión.** Solo si un local lo exige. Va en contra de la razón por la que rediseñas la máquina.

## 6. Qué haría yo ahora

1. **Pedir cuatro presupuestos en firme:** Payter (por Eurocoin), Nayax (Nayaxvend Ibérica), Paytef y Wipay. Puedo mandar yo los correos desde tu Gmail, como con los fabricantes de chapa.
2. **Comprar un myPOS Sigma para el banco de pruebas** (399–499 € + IVA): no ata a nada y sirve para validar el cobro por pulsos, el hueco del frente y la alimentación mientras llegan los presupuestos.
3. **Elegir el terminal de la serie** con los presupuestos y esa prueba delante.
4. **Añadir el QR** como segundo cobro cuando el primero funcione.

### Qué preguntar a cada proveedor

- Comisión exacta para operaciones de 2 €, y si hay fijo o mínimo por operación o por mes.
- Cuotas, alta, permanencia y qué pasa al dar de baja un terminal.
- Si admiten la actividad (alcoholímetro recreativo en bares, sin personal), por escrito.
- Modo de importe fijo con salida de pulsos y entrada de inhibición: tensiones y esquema.
- Alimentación (5, 12 o 24 V) y consumo.
- Si la SIM va incluida, con qué operadores, y qué hace sin cobertura.
- PIN en pantalla y Bizum por NFC.
- IK, IP y temperatura de trabajo; medidas del hueco y cuánto sobresale del frente.
- Reembolso por API desde la Pi, o solo a mano desde el panel.
- Plazo de alta, garantía y cambio de un terminal averiado.

### Qué cambia en la máquina con un terminal por pulsos

- **Chapa (bloque 3):** un hueco en el frente para el terminal en lugar de la ventana del Solo. El terminal sobresale unos milímetros o queda enrasado, según el modelo y el montaje.
- **Eléctrico (bloque 1):** una rama con la tensión del terminal (la LRS-50-5 solo da 5 V y el Sigma pide de 12 a 48 V) y dos optoacopladores, uno para el pulso y otro para la inhibición. Sobran la rama USB del Solo, el punto de acceso Wi-Fi de la Pi y el servo del plan B.
- **Programa (bloque 4):** un módulo de cobro nuevo y mucho más corto: pulso recibido, prueba pagada. El diario de cobros y la prueba pendiente tras un apagón se mantienen; el reembolso automático depende de lo que ofrezca el proveedor.
- **Datos:** la SIM de la Pi deja de gastar del orden de 1 GB al mes en preguntar por el cobro.

No he tocado `DECISIONES.md` ni el programa. Cambiar de sistema de cobro y comprar fuera de Amazon son dos decisiones que te reservaste.

## 7. Lo que no he podido comprobar

- No he hablado con ningún proveedor: todo sale de páginas públicas.
- Tarifas de Nayax en España, precio español del myPOS Sigma y precio del IM30 con Viva.
- Cuotas de Paytef, Wipay, Worldline, Sipay y Orain: no publican nada.
- Que el Payter de Eurocoin lleve PIN; alimentación de Payter y Nayax; si la SIM va incluida en Nayax y myPOS.
- Que el plan MONEI Pay valga para cobros creados por API desde una máquina.
- Si alguno de estos aparatos se vende en Amazon.
- Nada está probado con hardware.

## Anexo. Nota por criterio

| N.º | Solución | A | B | C | D | E | F | G | Nota |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Payter Apollo | 9 | 9,5 | 6,5 | 9 | 6,5 | 8,5 | 10 | **8,6** |
| 2 | Nayax VPOS Touch | 9,5 | 8 | 4 | 9 | 8 | 10 | 9,5 | **8,3** |
| 3 | myPOS Sigma | 8 | 8,5 | 6 | 8,5 | 9,5 | 6 | 10 | **8,2** |
| 4 | Viva.com + PAX IM30 | 7,5 | 8 | 9,5 | 8 | 6 | 7 | 10 | **8,1** |
| 5 | Paytef + banco | 8,5 | 8 | 8,5 | 6 | 5 | 8 | 10 | **8,0** |
| 6 | Wipay | 8 | 7,5 | 7 | 7 | 5,5 | 8 | 10 | **7,7** |
| 7 | Worldline Vending Suite | 8,5 | 9 | 5,5 | 6 | 4 | 8 | 10 | **7,6** |
| 8 | QR + MONEI | 7,5 | 10 | 8 | 7 | 8,5 | 8 | 3,5 | **7,4** |
| 9 | Mollie + PAX IM30 | 7,5 | 8 | 5 | 8,5 | 5 | 7 | 10 | **7,4** |
| 10 | Banco directo | 8 | 8 | 8 | 3,5 | 4 | 6 | 10 | **7,3** |
| 11 | Adyen + Castles S1U2 | 9 | 10 | 1,5 | 8 | 1,5 | 9 | 10 | **7,3** |
| 12 | Orain | 7,5 | 7 | 7 | 6,5 | 6 | 7 | 9 | **7,3** |
| 13 | Sipay | 7,5 | 8 | 6 | 6 | 4,5 | 7 | 10 | **7,2** |
| 14 | QR + Stripe | 7,5 | 10 | 1 | 9 | 9,5 | 8 | 3,5 | **6,7** |
| 15 | Stripe S700 / S710 | 6,5 | 4,5 | 2,5 | 9,5 | 9 | 8 | 9 | **6,6** |
| 16 | Square Terminal | 5,5 | 3,5 | 6 | 8,5 | 8,5 | 6 | 9 | **6,4** |
| 17 | Revolut Terminal | 5 | 3,5 | 9 | 3 | 8 | 5 | 9 | **6,1** |
| 18 | Android con Tap to Pay | 4 | 3 | 9,5 | 6 | 5 | 5 | 8,5 | **5,7** |
| 19 | PayPal / Zettle | 4,5 | 3 | 9 | 3 | 6 | 4 | 9 | **5,6** |
| 20 | Monedero de monedas | 3 | 5 | 7 | 9 | 10 | 1 | 5 | **5,4** |
| — | *SumUp Solo (hoy)* | 4,5 | 3 | 9,5 | 10 | 10 | 5,5 | 8 | **6,7** |

A fiabilidad · B robustez · C coste · D integración · E contratación · F flota · G facilidad para el cliente.


## Fuentes

Consultadas el 13-11-2026. Los datos del SumUp Solo y de la máquina salen del repositorio ([ficha del SumUp Solo](../sumup-solo/README.md) y el bloque 1 de componentes).

**Norma, Bizum y SumUp**

- [Reglamento Delegado (UE) 2018/389, artículos 11 y 12](https://www.legislation.gov.uk/eur/2018/389/chapter/III/data.xht)
- [EBA, pregunta 2018_4038: contactless y límites sin autenticación reforzada](https://eba.europa.eu/single-rule-book-qa/qna/view/publicId/2018_4038)
- [EBA, pregunta 2020_5288: lector solo contactless en máquinas de vending](https://eba.europa.eu/single-rule-book-qa/qna/view/publicId/2020_5288)
- [Legálitas: Bizum en comercios físicos (04-09-2026)](https://www.legalitas.com/actualidad/bizum-en-comercios)
- [Ecosistema Startup: Bizum por NFC y TPV Android de Redsys y Cecabank](https://ecosistemastartup.com/?p=81625)
- [StatusGator: historial de incidencias de SumUp](https://statusgator.com/services/sumup)
- [IsDown: incidencias de SumUp](https://isdown.app/status/sumup)
- [IsDown: fallos con Mastercard y Maestro en SumUp (15-08-2026)](https://isdown.app/status/sumup/incidents/638878-elevated-card-payment-failures-mastercard-maestro)
- [SumUp, página de estado (EE. UU.): pagos fallando (27-06-2026)](https://status.sumup.com/usa/incidents/01KW4PXNYDDPRXZQ3GS5ZQA6CY)
- [SumUp: comparación con Stripe (1,49 %, Solo a 79 € sin IVA)](https://www.sumup.com/es-es/compare/sumup-vs-stripe/)

**1. Payter Apollo**

- [Eurocoin Components: Payter Apollo, precio y cuotas](https://eurocoin.es/en/producto/payter-apollo/)
- [SuzoHapp: folleto del Payter Apollo](https://oem.suzohapp.com/wp-content/uploads/2023/12/SH-PayterApollo-flyer-A4-EN.pdf)
- [TOB International: Payter Apollo en el Reino Unido](https://tobinternational.co.uk/product/payter-apollo-modem/)
- [Monta: alta de un terminal Payter](https://monta.com/en/help-center/set-up-payter-terminal/)

**2. Nayax VPOS Touch**

- [Grupo Innovaly: Nayax VPOS Touch](https://www.grupoinnovaly.com/tienda/electronica-e-informatica/127-nayax-vpos-touch-amarillo.html)
- [Eurochip: Nayax VPOS Touch](https://eurochip.es/inicio/265-nayax-pos-vpos-touch.html)
- [Hostelería10: Nayax VPOS Touch con cable y alta](https://hosteleria10.com/lavado/lavadoras/nayax-lector-tarjetas-vpos-touch.html)
- [Vapemaxx (Alemania): Nayax VPOS Touch, cuotas y comisiones](https://www.vapemaxx.de/en/products/nayax-vpos-touch-kartenterminal)
- [Manual del VPOS Touch (copia en FCC)](https://fcc.report/FCC-ID/2AK6L-VPOST/3770077.pdf)
- [Nayax DevZone: SDK Marshall en C](https://devzone.nayax.com/docs/integrate-pos-device/marshall/get-started/c-sdk-integration)
- [Tienda de Nayax para España](https://shop.nayax.com/es_es)
- [Hostelearte: Nayax VPOS Touch, conectividad](https://hostelearte.com/limpieza-higiene-para-bares-y-restaurantes/lavadoras-industriales-y-profesionales/lavadoras-autoservicio-industriales/lector-nayax-vpos-touch-tarjeta-nfc-qr)
- [VMFS: guía de lectores Nayax (pantalla de 2,4 pulgadas)](https://vmfsusa.com/blogs/business/nayax-vending-card-reader-guide)
- [SourceForge: opiniones sobre Nayax](https://sourceforge.net/software/product/Nayax)

**3. myPOS Sigma**

- [myPOS España: solución de pago sin supervisión (Sigma)](https://www.mypos.com/es-es/comprar-datafono/unattended-payment-solution)
- [myPOS Developers: comunicación por pulsos](https://developers.mypos.com/in-person-payments/unattended-solutions/pulse-communication)
- [myPOS Developers: soluciones desatendidas](https://developers.mypos.com/in-person-payments/unattended-solutions)
- [Mon Petit Paiement: myPOS Sigma, precio y comisión](https://mon-petit-paiement.com/mypos-sigma-avis/)
- [TPE Carte Bancaire: tarifas de myPOS y precio del Sigma](https://tpecartebancaire.fr/es/content/10-tarifas-terminal-mypos)
- [Sincomisiones: opinión y comisiones de myPOS en España](https://sincomisiones.org/mypos-opinion)
- [MoneyRadar: tarifas de myPOS y coste de las transferencias](https://moneyradar.org/banque/mypos/)

**4. Viva.com + PAX IM30**

- [Viva.com España: formas de integración del terminal](https://www.viva.com/es-es/vendor-solutions/integrations)
- [Viva.com España: dispositivos compatibles (PAX IM30)](https://www.viva.com/es-es/vendor-solutions/supported-devices)
- [Viva.com España: pagos y precios](https://www.viva.com/es-es/payments)
- [Viva.com Portugal: tabla de precios](https://www.viva.com/pt-pt/pricing)
- [Ventrata: puesta en marcha del IM30 con Viva](https://support.ventrata.com/en/articles/10130788-how-to-set-up-the-im30-payment-terminal)
- [PAX: IM30](https://www.paxtechnology.com/im30)
- [eBay: PAX IM30 nuevo (499,99 £)](https://www.ebay.de/itm/176681789622)

**5. Paytef + banco**

- [Paytef: pagos presenciales](https://paytef.es/presencial/)
- [PAX: Paytef y la certificación Redsys de la gama PAX](https://www.paxtechnology.es/blog/paytef-despliega-innovadoras-soluciones-de-terminales-de-pago-pax-android-en)
- [Paytef: pinpad desatendido de Ingenico](https://paytef.es/noticias/pin-pad-desatendido-iun-iself-series/)
- [Paytef: preguntas frecuentes](https://paytef.es/en/)
- [TPVOnline: oferta integrada con Comercia Global Payments](https://www.tpvonline.es/comercia-global-payments-cms-112-50-1821-1844/)
- [Rankia: comisiones de TPV en España en 2026](https://rankiabusiness.com/comisiones-tpv/)
- [Batemat: comisiones y cuotas de TPV de los bancos](https://batemat.es/comisiones-tpv-cuanto-cobran-los-bancos-tipos-de-tarifa-y-como-reducir-el-coste/)

**6. Wipay**

- [4YFN: ficha de Wipay](https://www.4yfn.com/exhibitors/28157-wipay)
- [Forbes España: Arbitrade y Wipay](https://forbes.es/?p=876295)
- [Diario Estrategia: Wipay y el terminal Q5000 en neveras inteligentes](https://www.diarioestrategia.cl/texto-diario/mostrar/5324829/wipay-impulsa-tecnologia-retail-integracion-pago-tarjeta-neveras-inteligentes)
- [PaymentProviders: ficha de Wipay](https://paymentproviders.io/providers/wipay)

**7. Worldline Vending Suite**

- [Worldline España: folleto de WL Vending Suite](https://worldline.com/content/dam/worldline/local/es-es/documents/brochures/brochure-vending-suite-es.pdf)
- [Worldline: terminales desatendidos](https://worldline.com/en-ch/home/main-navigation/solutions/merchants/solutions-and-services/terminals/unattended-payment-terminals)

**8. QR + MONEI**

- [MONEI: tarifas](https://support.monei.com/hc/en-us/articles/360017954318-MONEI-fees)
- [MONEI: Bizum](https://monei.com/payment-methods/bizum/)
- [MONEI frente a Stripe](https://monei.com/stripe-alternative/)

**9. Mollie + PAX IM30**

- [Mollie: terminal PAX IM30](https://docs.mollie.com/docs/im30-terminal)
- [Mollie: integrar terminales](https://docs.mollie.com/docs/integrating-mollie-terminals)
- [Mollie España: terminales de pago](https://www.mollie.com/es/growth/payment-terminal-eol-pci-compliance-guide)

**10. Banco directo**

- [Ingenico: hoja del Self/2000](https://ingenico.com/sites/default/files/resource-document/2023-10/SELF%202000%20datasheet_OCT23.pdf)
- [CaixaBank: tarifas MyCommerce+](https://www.caixabank.es/empresa/negocios/tpv-mini.html)

**11. Adyen + Castles S1U2**

- [Adyen: manual del S1U2](https://docs.adyen.com/point-of-sale/user-manuals/s1u2-user-manual)
- [Castles Technology: hoja del S1U2](https://cdn-assets.inwink.com/0b61be1d-c656-4312-87f7-eaf7cbc154b7/be2e9770-21fa-4cbc-9c7c-af7a890230d2)
- [Adyen España: Castles S1U2](https://www.adyen.com/es_ES/dispositivos-tpv/castles-s1u2)
- [NerdWallet: precios de Adyen](https://www.nerdwallet.com/business/software/learn/adyen)
- [EightX: cuánto cuesta Adyen](https://eightx.co/blog/compare/how-much-does-adyen-cost)
- [Merchant Maverick: Adyen](https://www.merchantmaverick.com/reviews/adyen-review/)

**12. Orain**

- [Orain: preguntas frecuentes](https://www.orain.io/en/faqs/)
- [Hostelvending: Orain y su modelo de suscripción](https://www.hostelvending.com/noticias-vending/orain-consigue-3-millones-de-euros-para-rentabilizar-los-micropagos-digitales)
- [Orain: sistemas de pago para máquinas expendedoras](https://www.orain.io/es/blog/sistemas-de-pago-para-maquinas-expendedoras)

**13. Sipay**

- [Sipay: pagos presenciales](https://sipay.es/en/products/in-person-payments/)

**14. QR + Stripe**

- [Stripe España: tarifas](https://stripe.com/es/pricing)
- [Stripe España: plataforma de pagos y enlaces con QR](https://stripe.com/es/lp/payments/payments-platform)

**15. Stripe S700 / S710**

- [Stripe Terminal en España: lectores y precio](https://stripe.com/en-es/terminal)
- [Stripe: Terminal en entornos con y sin personal](https://support.stripe.com/questions/using-terminal-in-attended-semi-attended-and-unattended-retail-environments)
- [Stripe: guía de integración de Terminal (modo sin conexión)](https://docs.stripe.com/extensibility/terminal-for-pos-partners)
- [Stripe: Reader S710 y países](https://stripe.com/en-ch/terminal/s710)

**16. Square Terminal**

- [Square España: Square Terminal](https://squareup.com/es/es/hardware/terminal)
- [Square: lanzamiento en España y Terminal API](https://developer.squareup.com/blog/square-launches-in-spain/)
- [SumUp: comparación con Square (comisiones)](https://www.sumup.com/es-es/compare/sumup-vs-square/)

**17. Revolut Terminal**

- [Revolut España: precios de aceptación de pagos](https://revolut.com/es-ES/business/accept-payments-pricing)
- [Revolut España: Terminal](https://revolut.com/es-ES/business/revolut-terminal)
- [Revolut: comparación de terminales y precio](https://www.revolut.com/ca-ES/business/in-person-payments-comparison/)
- [Finantres: Revolut Business para cobrar con tarjeta](https://finantresnoticias.com/negocios-y-autonomos/revolut-business-cobrar-tarjeta-comisiones-liquidacion/)

**18. Android con Tap to Pay**

- [Viva.com: guía para elegir dispositivos](https://intercom.help/vivacomeu/es/articles/10210826-guia-para-elegir-dispositivos-de-viva-com)
- [Viva.com: soluciones de cobro desatendido](https://viva.com/en-eu/businesses/unattended-payment-solutions)
- [Paytef: qué es el SoftPOS y sus límites](https://paytef.es/que-es-el-softpos/)

**19. PayPal / Zettle**

- [Supergood: la API de Zettle](https://supergood.ai/api-report-card/zettle)
- [Spendways: PayPal POS, comisiones](https://www.spendways.com/produit/paypal-pos/)
