#!/usr/bin/env python3
"""Check immutable pilot drafts and static SSL diagnostics; never execute SSL."""

import argparse
import hashlib
import json
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[1]


def main():
    args = argparse.ArgumentParser(description=__doc__)
    args.add_argument('--lsp', type=Path, required=True,
                      help='Explicit local validator binary, including any source fixes.')
    options = args.parse_args()
    area = ROOT / 'style-calibration'
    manifest = json.loads((area / 'INITIAL-MANIFEST.json').read_text(encoding='utf-8'))
    files = []
    for task in manifest['tasks']:
        folder = area / 'pilot' / task['id']
        expected = {'TASK.md': task['task_sha256'], 'design.md': task['design_sha256']}
        expected.update({f'draft/{name}': sha for name, sha in task['draft_sha256'].items()})
        for name, sha in expected.items():
            path = folder / name
            if hashlib.sha256(path.read_bytes()).hexdigest() != sha:
                args.exit(1, f'Initial draft changed: {path}\nEdit the working copy instead.\n')
        files.extend(folder / 'draft' / name for name in task['draft_sha256'])
    binary = options.lsp.resolve(strict=True)
    run = subprocess.run([str(binary), '--validate', '--info', '--hungarian-types',
                          '--strict', *map(str, files)], capture_output=True, text=True)
    entries = json.loads(run.stdout)
    if len(entries) != len(files):
        args.exit(1, 'Validator did not report every draft.\n')
    actionable = [d for e in entries for d in e['diagnostics']
                  if d['severity'] in {'error', 'warning'}]
    if actionable or run.returncode:
        print(run.stdout)
        args.exit(1, 'Static validation failed.\n')
    for path in files:
        if path.suffix == '.ds':
            continue
        formatted = subprocess.run([str(binary), '--format', '--check', str(path)],
                                   capture_output=True, text=True)
        if formatted.returncode:
            args.exit(1, f'Formatter check failed: {path}\n{formatted.stdout}{formatted.stderr}')
    print(f'{len(files)} immutable drafts pass strict static validation and formatter checks. '
          'SSL runtime tests remain unexecuted.')


if __name__ == '__main__':
    main()
