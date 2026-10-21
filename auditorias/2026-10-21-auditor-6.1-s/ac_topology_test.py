#!/usr/bin/env python3
"""Ideal connectivity checks only. No mains current/thermal/dielectric simulation.

Run with Python 3. Writes JSON to stdout. No third-party dependencies.
"""
import argparse
import json
from collections import defaultdict
from pathlib import Path


def connected(edges, source, destination):
    graph = defaultdict(set)
    for a, b in edges:
        graph[a].add(b)
        graph[b].add(a)
    frontier, seen = [source], set()
    while frontier:
        node = frontier.pop()
        if node == destination:
            return True
        if node not in seen:
            seen.add(node)
            frontier.extend(graph[node] - seen)
    return False


def case(poles, orientation, on, open_fuse=None):
    # Both active-conductor fuses shown in candidate, only X in original.
    edges = [('WALL_PE', 'C14_PE'), ('C14_PE', 'PE_DISTRIBUTION')]
    edges += [('PE_DISTRIBUTION', p) for p in
              ('LRS_FG', 'CHASSIS', 'FRONT_PANEL', 'DRAWER', 'INNER_BOX')]
    edges += [('WALL_L', 'C14_X' if orientation == 'normal' else 'C14_Y'),
              ('WALL_N', 'C14_Y' if orientation == 'normal' else 'C14_X')]
    if open_fuse != 'X':
        edges += [('C14_X', 'SWITCH_X_IN')]
    if poles == 1 or open_fuse != 'Y':
        edges += [('C14_Y', 'SWITCH_Y_IN')]
    if on:
        edges += [('SWITCH_X_IN', 'LRS_L')]
    if on or poles == 1:
        edges += [('SWITCH_Y_IN', 'LRS_N')]
    return {
        'topology': 'SPST_single_fuse' if poles == 1 else 'DPST_two_fuses_candidate',
        'orientation': orientation,
        'switch': 'ON' if on else 'OFF',
        'open_fuse': open_fuse,
        'line_reaches_LRS_L': connected(edges, 'WALL_L', 'LRS_L'),
        'line_reaches_LRS_N': connected(edges, 'WALL_L', 'LRS_N'),
        'line_reaches_C14_primary': connected(edges, 'WALL_L', 'C14_X') or
                                    connected(edges, 'WALL_L', 'C14_Y'),
        'pe_paths': {p: connected(edges, 'WALL_PE', p) for p in
                     ('LRS_FG', 'CHASSIS', 'FRONT_PANEL', 'DRAWER', 'INNER_BOX')},
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--json', type=Path, metavar='PATH',
                        help='write complete result as UTF-8 JSON to PATH')
    args = parser.parse_args()
    rows = []
    checks = []
    for poles in (1, 2):
        for orientation in ('normal', 'reversed'):
            for on in (False, True):
                for open_fuse in ((None, 'X') if poles == 1 else (None, 'X', 'Y')):
                    row = case(poles, orientation, on, open_fuse)
                    rows.append(row)
                    checks.append(('PE continuous for every switch/fuse state',
                                   all(row['pe_paths'].values())))
                    checks.append(('Primary remains connected while cord inserted',
                                   row['line_reaches_C14_primary']))
                    if poles == 2 and not on:
                        checks.append(('DPST OFF removes line path to both LRS terminals',
                                       not row['line_reaches_LRS_L'] and
                                       not row['line_reaches_LRS_N']))
    spst_r_off = case(1, 'reversed', False)
    checks.append(('Counterexample: SPST OFF reversed keeps line at LRS_N',
                   spst_r_off['line_reaches_LRS_N']))
    two_fuses_open_neutral = case(2, 'normal', True, 'Y')
    checks.append(('Counterexample: one blown fuse does not provide full isolation',
                   two_fuses_open_neutral['line_reaches_LRS_L']))
    result = {
        'author': 'Auditor 6.1-S',
        'method': 'ideal graph reachability; no parasitic, internal PSU or lamp model',
        'scope': 'Conditional topology, not physical assembly or product certification',
        'case_count': len(rows),
        'assertion_count': len(checks),
        'cases': rows,
        'assertions': [{'name': name, 'passed': ok} for name, ok in checks],
        'passed': all(ok for _, ok in checks),
        'limitations': [
            'Actual generic C14 contact map is unknown.',
            'No prospective fault current, protective-trip time, insulation or thermal result.',
            'An ideal PE edge does not prove the actual bond has low resistance.',
            'PSU internal coupling and all leakage/EMI paths are deliberately not modeled.',
        ],
    }
    serialized = json.dumps(result, ensure_ascii=False, indent=2) + '\n'
    if args.json:
        args.json.write_text(serialized, encoding='utf-8')
        print(f'{len(rows)} cases; {len(checks)} assertions; passed={result["passed"]}')
    else:
        print(serialized, end='')
    return 0 if result['passed'] else 1


if __name__ == '__main__':
    raise SystemExit(main())
