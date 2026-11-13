# Módem 4G USB Huawei E3372h-320 (HiLink)

Da internet a la Raspberry Pi con una SIM de datos. Sustituye desde el 01-11-2026 al adaptador Wi-Fi AR9271 (ahora en [retirados](../retirados/adaptador-wifi-ar9271/README.md)). Va en el USB de abajo de la Pi, dentro del cajón de componentes. Revisado el 13-11-2026 ([revisión de componentes](../REVISION-13-11-2026.md)).

- **Compra:** ASIN [**B085RDTZMP**](https://www.amazon.es/dp/B085RDTZMP) («HUAWEI E3372h-320 – LTE Stick, White», modelo 51071SMK). Unos 48 €: 47,99 € en Amazon.nl el 13-11-2026; el precio de Amazon.es no se pudo leer.
- **Ref. en el CAD:** E05 (`A-E05.1`).
- **SIM:** de datos, tamaño mini-SIM, sin PIN. No se compra en Amazon. De varios gigas al mes: solo las consultas a SumUp son del orden de 1 GB (estimación).

## 1. Dos avisos de compra

1. **Que no llegue el E3372-325.** Es el modelo que lo sustituye (marca «Brovi»). En Linux no funciona sin ajustes y hay compradores a los que les llegó el 325 habiendo pedido el 320. Al recibirlo, mirar la etiqueta: tiene que poner **E3372h-320**. Si no, se devuelve.
2. **El 320 se está dejando de vender.** Para una serie de máquinas conviene comprar repuestos ya, y que el programa no dependa del modelo: cualquier módem que la Pi vea como tarjeta de red USB tiene que valer.

## 2. Datos de la ficha de Huawei

| | |
|---|---|
| Medidas | 88 × 28 × 11,5 mm |
| Peso | menos de 35 g |
| Bandas LTE (FDD) | B1, B3, B7, B8, B20 y B28 |
| Conexión | USB 2.0, clavija tipo A |
| Antena exterior | dos tomas CRC9 (dato de una tienda) |
| Software | HiLink, con página web de configuración |
| Consumo | menos de 3,5 W (unos 0,7 A a 5 V) |
| Temperatura de trabajo | de −10 °C a +40 °C |

## 3. En el alcoholímetro

- **Sin instalar nada:** en modo HiLink la Pi lo ve como una tarjeta de red USB y le pide la dirección por DHCP. La interfaz puede llamarse `eth1` o `usb0` según el sistema: el vigía de red no debe darlo por hecho. La página del módem está en http://192.168.8.1.
- **Fijar «solo 4G»** en esa página. Así no cae a 2G, que es donde están los picos de consumo más altos.
- **Alimentación: del USB de la Pi** (decidido el 13-11-2026). La verificación del 12-11 proponía darle rama propia; se descarta porque la Pi entra ahora por la [placa de bornes](../placa-bornes-gpio/README.md) y aguanta su pico con margen (4,98 V en la Pi con el módem a 0,7 A), y porque así la Pi puede cortarle la alimentación.
- **Recuperación cuando se cuelga**, por este orden: reconectar por software (lo que ya hace `vigia-red.sh`); cortar la alimentación del USB con `uhubctl -l 1-1 -p 2 -a cycle`, que en la 3B+ apaga los cuatro puertos a la vez; reiniciar la Pi. El segundo paso falta en el programa.
- **Temperatura:** límite de 40 °C. Depende de los [ventiladores](../ventilador-noctua-nf-a4x10-5v/README.md).

## 4. Dónde va: lo decide la prueba de cobertura

Dos montajes, que se comparan con la caja cerrada (prueba C3 de la revisión):

- **(a) Pinchado en la Pi, con la [antena plana](../antena-4g-plana-fpc/README.md)** y un latiguillo CRC9 → SMA. Al conectar una antena exterior deja de usar la interna de esa toma. La CRC9 entra a presión: hay que sujetarla.
- **(b) El propio módem detrás de la ventana**, con un [alargador USB](../alargador-usb/README.md). Cabe (88 × 28 mm en una ventana de 32 × 108), usa sus dos antenas internas y no lleva la CRC9.

## 5. Pendiente al recibirlo

1. Mirar la etiqueta (320, no 325) y que la Pi lo ve como red USB; apuntar el nombre de la interfaz.
2. Ver qué tomas de antena trae: CRC9 o TS9.
3. Medirlo: en el CAD va con 88 × 28 × 11,5 mm y la toma principal a 74 mm de la punta de la clavija.
4. Prueba C2: que `uhubctl` lo apaga y vuelve solo con internet.
5. Prueba C3: cobertura por bandas con todo cerrado.

Fuentes: [ficha de Huawei E3372h-320 (PDF)](https://cdn.shopify.com/s/files/1/0501/6587/4851/files/huawei_e3372h-320_data_sheet.pdf); [Amazon.es](https://www.amazon.es/HUAWEI-51071SMK-E3372h-320-LTE-Stick-White/dp/B085RDTZMP); [opiniones del E3372-325 en Galaxus](https://galaxus.de/en/s1/product/ratings/huawei-e3372-325-routers-24422582) y [foro de GL.iNet](https://forum.gl-inet.com/t/gl-mt1300-beryl-and-huawei-e3372-lte-stick/19785) (problemas en Linux y envíos del 325 por el 320); [LowcostMobile](https://lowcostmobile.es/products/huawei-e3372h-320-blanc-cle-4g-usb) (sustituido por el 325; dos tomas CRC9); [hilo sobre `uhubctl` en la Pi 3B+](https://community.octoprint.org/t/octoprint-usbcontrol/7659/3).
