"""ZE29A mínimo detrás de un pseudoterminal, para probar pi/uart.js con un tty de verdad (stty, lecturas…).
Imprime la ruta del tty esclavo y contesta a 0x85 (estado reposo), 0x88 (4 s) y 0x92 (umbral 8)."""
import os, pty, sys, select

def cs(b):
    return (-sum(b[1:8])) & 0xFF

def resp(cmd, *d):
    b = [0xFF, cmd] + list(d) + [0] * (6 - len(d))
    return bytes(b + [cs(b)])

maestro, esclavo = pty.openpty()
print(os.ttyname(esclavo), flush=True)
buf = b""
while True:
    r, _, _ = select.select([maestro, sys.stdin], [], [], 1.0)
    if sys.stdin in r:
        if not sys.stdin.readline():
            break
    if maestro in r:
        try:
            buf += os.read(maestro, 64)
        except OSError:
            break
        while len(buf) >= 9:
            i = buf.find(b"\xff")
            if i < 0:
                buf = b""
                break
            buf = buf[i:]
            if len(buf) < 9:
                break
            f, buf = buf[:9], buf[9:]
            if f[1] != 0x01 or cs(f) != f[8]:
                continue
            cmd = f[2]
            if cmd == 0x85:
                # se contesta en dos trozos, como una UART lenta
                r1 = resp(0x85, 0x31)
                os.write(maestro, r1[:4]); os.write(maestro, r1[4:])
            elif cmd == 0x88:
                os.write(maestro, resp(0x88, 4))
            elif cmd == 0x92:
                os.write(maestro, resp(0x92, 8))
