"""Digital protocol checks for ZE29A V1.1, Auditor 6.1-S, 2026-10-21.

Pure software: no UART device is opened and no electrical behaviour is simulated.
Source: repository componentes/winsen-ze29a/datasheets/ze29a-c2h5oh.pdf,
physical PDF pages 4-10. read_result requires a caller-supplied current state;
the caller must additionally establish a fresh measurement cycle and timeout.
No blood/breath conversion is inferred from the raw mg/100mL result.
Run: python uart_checks.py [--json]
"""
from __future__ import annotations
import json
import sys
import unittest


class ProtocolError(ValueError):
    """Missing, truncated, malformed or contextually invalid sensor response."""


def checksum(frame: bytes) -> int:
    if len(frame) < 8:
        raise ProtocolError('checksum requires at least 8 bytes')
    return (-sum(frame[1:8])) & 0xFF


def command(code: int, *data: int) -> bytes:
    if len(data) > 5:
        raise ProtocolError('a request contains at most 5 data bytes')
    if any(type(x) is not int or not 0 <= x <= 255 for x in (code, *data)):
        raise ProtocolError('command and data must be unsigned bytes')
    body = bytes((0xFF, 0x01, code, *data, *([0] * (5 - len(data)))))
    return body + bytes((checksum(body),))


def response(frame: bytes | None, expected_command: int) -> bytes:
    if frame is None:
        raise ProtocolError('sensor timeout: no measurement')
    if not isinstance(frame, bytes) or len(frame) != 9:
        raise ProtocolError('a response must contain exactly 9 bytes')
    if frame[0] != 0xFF:
        raise ProtocolError('invalid start byte')
    if frame[1] != expected_command:
        raise ProtocolError('unexpected response command')
    if checksum(frame) != frame[8]:
        raise ProtocolError('invalid checksum')
    return frame


def read_state(frame: bytes | None) -> int:
    f = response(frame, 0x85)
    if f[2] not in range(0x31, 0x38) or any(f[3:8]):
        raise ProtocolError('invalid status response')
    return f[2]


def read_result(frame: bytes | None, current_state: int | None) -> dict[str, int | str]:
    if current_state != 0x37:
        raise ProtocolError('result requires current sensor state 0x37')
    f = response(frame, 0x86)
    if any(f[4:7]) or f[7] not in (0, 1, 2):
        raise ProtocolError('invalid result fields')
    return {'raw': (f[2] << 8) | f[3], 'unit': 'mg/100mL', 'alarm': f[7]}


# All 9 request/response examples printed as EXP in the V1.1 manual.
MANUAL_PAIRS = [
    ('FF 01 85 00 00 00 00 00 7A', 'FF 85 31 00 00 00 00 00 4A'),
    ('FF 01 86 00 00 00 00 00 79', 'FF 86 00 5A 00 00 00 02 1E'),
    ('FF 01 87 31 00 00 00 00 47', 'FF 87 01 00 00 00 00 00 78'),
    ('FF 01 88 00 00 00 00 00 77', 'FF 88 04 00 00 00 00 00 74'),
    ('FF 01 89 04 00 00 00 00 72', 'FF 89 01 00 00 00 00 00 76'),
    ('FF 01 90 00 00 00 00 00 6F', 'FF 90 14 50 00 00 00 00 0C'),
    ('FF 01 91 14 50 00 00 00 0A', 'FF 91 01 00 00 00 00 00 6E'),
    ('FF 01 92 00 00 00 00 00 6D', 'FF 92 08 00 00 00 00 00 66'),
    ('FF 01 93 08 00 00 00 00 64', 'FF 93 01 00 00 00 00 00 6C'),
]


def _reply(code: int, *data: int) -> bytes:
    body = bytes((0xFF, code, *data, *([0] * (6 - len(data)))))
    return body + bytes((checksum(body),))


class Checks(unittest.TestCase):
    def test_18_manual_checksums(self):
        for pair in MANUAL_PAIRS:
            for hexframe in pair:
                with self.subTest(frame=hexframe):
                    f = bytes.fromhex(hexframe)
                    self.assertEqual(checksum(f), f[8])

    def test_9_manual_request_builds(self):
        for hexrequest, hexresponse in MANUAL_PAIRS:
            with self.subTest(request=hexrequest):
                req = bytes.fromhex(hexrequest)
                self.assertEqual(command(req[2], *req[3:8]), req)
                self.assertEqual(response(bytes.fromhex(hexresponse), req[2]), bytes.fromhex(hexresponse))

    def test_start_command_46(self):
        self.assertEqual(command(0x87, 0x32).hex(' ').upper(), 'FF 01 87 32 00 00 00 00 46')
        with self.assertRaises(ProtocolError):
            response(bytes.fromhex('FF 87 01 00 00 00 00 00 48'), 0x87)

    def test_manual_result_90_not_zero(self):
        result = read_result(bytes.fromhex(MANUAL_PAIRS[1][1]), 0x37)
        self.assertEqual(result, {'raw': 90, 'unit': 'mg/100mL', 'alarm': 2})

    def test_big_endian_result(self):
        self.assertEqual(read_result(_reply(0x86, 1, 2, 0, 0, 0, 2), 0x37)['raw'], 258)

    def test_none_is_error_not_zero(self):
        with self.assertRaises(ProtocolError):
            read_result(None, 0x37)

    def test_every_truncated_length_rejected(self):
        good = bytes.fromhex(MANUAL_PAIRS[1][1])
        for n in range(9):
            with self.subTest(length=n), self.assertRaises(ProtocolError):
                read_result(good[:n], 0x37)
        with self.assertRaises(ProtocolError):
            read_result(good + b'\x00', 0x37)

    def test_checksum_corruption_rejected(self):
        good = bytes.fromhex(MANUAL_PAIRS[1][1])
        for index in range(1, 9):
            bad = bytearray(good)
            bad[index] ^= 1
            with self.subTest(index=index), self.assertRaises(ProtocolError):
                read_result(bytes(bad), 0x37)

    def test_wrong_header_rejected(self):
        bad = bytearray(bytes.fromhex(MANUAL_PAIRS[1][1]))
        bad[0] = 0
        with self.assertRaises(ProtocolError):
            read_result(bytes(bad), 0x37)

    def test_wrong_command_rejected_even_with_valid_checksum(self):
        with self.assertRaises(ProtocolError):
            read_result(_reply(0x85, 0x37), 0x37)

    def test_no_result_before_read_state(self):
        for state in [None, *range(0x31, 0x37), 0, 0x38]:
            with self.subTest(state=state), self.assertRaises(ProtocolError):
                read_result(bytes.fromhex(MANUAL_PAIRS[1][1]), state)

    def test_status_states_and_reserved_bytes(self):
        for state in range(0x31, 0x38):
            self.assertEqual(read_state(_reply(0x85, state)), state)
        for f in [_reply(0x85, 0), _reply(0x85, 0x37, 1)]:
            with self.assertRaises(ProtocolError):
                read_state(f)

    def test_invalid_result_fields(self):
        for f in [_reply(0x86, 0, 90, 1, 0, 0, 2), _reply(0x86, 0, 90, 0, 0, 0, 3)]:
            with self.assertRaises(ProtocolError):
                read_result(f, 0x37)

    def test_invalid_request_data(self):
        for args in [(0x87, -1), (0x87, 256), (0x87, 0, 0, 0, 0, 0, 0), (True,)]:
            with self.assertRaises(ProtocolError):
                command(*args)


if __name__ == '__main__':
    if '--json' in sys.argv:
        result = unittest.TestResult()
        unittest.defaultTestLoader.loadTestsFromTestCase(Checks).run(result)
        print(json.dumps({'author': 'Auditor 6.1-S', 'type': 'digital_protocol_checks',
                          'manual_frames': 18, 'test_methods': result.testsRun,
                          'failures': len(result.failures), 'errors': len(result.errors),
                          'successful': result.wasSuccessful(),
                          'hardware_tested': False}, indent=2))
        sys.exit(0 if result.wasSuccessful() else 1)
    unittest.main()
