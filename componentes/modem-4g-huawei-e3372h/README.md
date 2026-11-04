# Módem 4G USB Huawei E3372h-320 (HiLink)

Da internet a la Raspberry Pi con una SIM de datos. Sustituye desde el 01-11-2026 al adaptador Wi-Fi AR9271 (ahora en [retirados](../retirados/adaptador-wifi-ar9271/README.md)). Va enchufado en el USB de abajo de la Pi, dentro del cajón de componentes, y su antena es la [antena plana](../antena-4g-plana-fpc/README.md) pegada en el lateral izquierdo del cajón.

- **Compra:** sin anuncio elegido. Buscar «Huawei E3372h-320» en Amazon; precio orientativo en la lista, unos 40 €.
- **Ref. en el CAD:** E05 (`A-E05.1`).
- **SIM:** de datos, tamaño mini-SIM. No se compra en Amazon.

## 1. Datos de la ficha de Huawei

| | |
|---|---|
| Medidas | 88 × 28 × 11,5 mm |
| Peso | menos de 35 g |
| Bandas LTE (FDD) | B1, B3, B7, B8, B20 y B28 |
| Conexión | USB 2.0, clavija tipo A |
| Software | HiLink, con página web de configuración |
| Consumo | menos de 3,5 W (unos 0,7 A a 5 V) |
| Temperatura de trabajo | de −10 °C a +40 °C |
| SIM | mini-SIM |

Las bandas cubren las de España y Alemania, incluida la B20 (800 MHz), que es la que mejor entra en interiores.

## 2. En el alcoholímetro

- **Sin instalar nada:** en modo HiLink la Pi lo ve como una tarjeta de red USB (`eth1`) y le pide la dirección por DHCP. La página del módem está en http://192.168.8.1. Ahí se mete el PIN de la SIM, si lo tiene, y se ve la señal.
- **Si llega en modo «stick»** (la Pi lo ve como módem serie, `ttyUSB`), hay que pasarlo a HiLink antes de montarlo.
- **Antena:** se quita la tapa y, en la toma principal, se enchufa el latiguillo CRC9 → SMA hembra (E23). Al conectar una antena externa, el módem deja de usar la interna.
  - La toma entra a presión: sujetar el latiguillo con una brida o cinta para que no se salga.
  - La ficha leída no deja claro el tipo de toma. La mayoría de anuncios dicen CRC9; si el que llega trae TS9, el latiguillo es TS9 → SMA hembra.
- **Vigía de red:** `programa/sistema/vigia-red.sh` vigila `eth1`. Si la red no responde en 5 minutos, desconecta y vuelve a conectar el módem por software, como mucho una vez cada 10 minutos.
- **Consumo:** con el módem, la rama de la Pi llega a unos 2,8 A de pico (estimado) con fusible de 3 A. Medirlo al montar.
- **Temperatura:** la ficha da 40 °C como máximo. Vigilar la temperatura dentro del cajón en verano.

## 3. Pendiente al recibirlo

1. Comprobar que es la versión HiLink y que la Pi lo ve como `eth1`.
2. Ver qué tomas de antena trae: CRC9 o TS9.
3. Medirlo: en el CAD va con 88 × 28 × 11,5 mm y la toma principal a 74 mm de la punta de la clavija.
4. Probar la cobertura con todo cerrado (README del diseño A, aviso 6).

Fuentes: [ficha de Huawei E3372h-320 (PDF)](https://cdn.shopify.com/s/files/1/0501/6587/4851/files/huawei_e3372h-320_data_sheet.pdf).
