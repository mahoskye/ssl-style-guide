#!/usr/bin/env python3
"""Retain local human/agent revisions without admitting examples to training."""

import argparse
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import re
import shutil

DEFAULT_ROOT = Path(__file__).resolve().parents[1] / 'style-calibration'


def hashes(folder):
    return {p.relative_to(folder).as_posix(): hashlib.sha256(p.read_bytes()).hexdigest()
            for p in sorted(folder.rglob('*')) if p.is_file()}


def timestamp():
    return datetime.now(timezone.utc).isoformat()


def write_state(path, state):
    temporary = path.with_suffix('.tmp')
    temporary.write_text(json.dumps(state, indent=2) + '\n', encoding='utf-8')
    temporary.replace(path)


def task_paths(root, task):
    if not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', task):
        raise ValueError('Task ID must contain lowercase words separated by hyphens.')
    return root / 'working' / task, root / 'reviews' / task


def snapshot(working, target):
    if any(p.is_symlink() for p in working.rglob('*')):
        raise ValueError('Symlinks are not supported in review working copies.')
    shutil.copytree(working, target)
    return hashes(target)


def verify_history(history, state):
    for version in state['versions']:
        for record in [version['draft'], *version['revisions']]:
            if hashes(history / record['path']) != record['hashes']:
                raise ValueError('A retained snapshot was changed; restore it before saving.')


def init(root):
    tasks = sorted(p for p in (root / 'pilot').iterdir() if p.is_dir())
    if not tasks:
        raise ValueError('No pilot tasks found.')
    for task in tasks:
        working, history = task_paths(root, task.name)
        state_path = history / 'record.json'
        if state_path.exists():
            verify_history(history, json.loads(state_path.read_text(encoding='utf-8')))
            continue
        if working.exists() or history.exists():
            raise ValueError(f'Uninitialized files already exist for {task.name}; not overwriting.')
        working.parent.mkdir(parents=True, exist_ok=True)
        shutil.copytree(task / 'draft', working)
        shutil.copyfile(task / 'TASK.md', working / 'TASK.md')
        draft_path = Path('v001/draft')
        initial_hashes = snapshot(working, history / draft_path)
        state = {'format_version': 1, 'task': task.name, 'current_version': 1,
                 'status': 'awaiting_review', 'training_eligible': False,
                 'training_classification': 'unclassified',
                 'versions': [{'number': 1, 'reason': 'Initial purpose-built draft.',
                               'draft': {'path': draft_path.as_posix(), 'hashes': initial_hashes,
                                         'created_at_utc': timestamp(), 'actor': 'agent'},
                               'revisions': []}]}
        write_state(state_path, state)
    return root / 'working'


def save(root, task, decision, reason, fork=False, actor='human'):
    if not reason.strip():
        raise ValueError('A nonblank reason is required.')
    if decision == 'accept' and actor != 'human':
        raise ValueError('Agent revisions cannot declare human acceptance.')
    working, history = task_paths(root, task)
    state_path = history / 'record.json'
    state = json.loads(state_path.read_text(encoding='utf-8'))
    verify_history(history, state)
    current = state['versions'][-1]
    current_hashes = hashes(working)
    if 'TASK.md' not in current_hashes:
        raise ValueError('Working TASK.md is missing.')
    changed_task = current_hashes['TASK.md'] != current['draft']['hashes']['TASK.md']
    if changed_task and not fork:
        raise ValueError('Requirements changed; use fork-task before recording a code revision.')
    if fork:
        if not changed_task:
            raise ValueError('fork-task requires a changed working TASK.md.')
        number = state['current_version'] + 1
        draft_path = Path(f'v{number:03d}/draft')
        initial_hashes = snapshot(working, history / draft_path)
        state['versions'].append({'number': number, 'reason': reason,
                                  'draft': {'path': draft_path.as_posix(), 'hashes': initial_hashes,
                                            'created_at_utc': timestamp(), 'actor': actor},
                                  'revisions': []})
        state['current_version'] = number
        state['status'] = 'awaiting_review'
    else:
        if decision not in {'revise', 'accept', 'reject'}:
            raise ValueError('Decision must be revise, accept, or reject.')
        number = len(current['revisions']) + 1
        revision_path = Path(f"v{current['number']:03d}/r{number:03d}")
        revision_hashes = snapshot(working, history / revision_path)
        current['revisions'].append({'path': revision_path.as_posix(), 'hashes': revision_hashes,
                                     'decision': decision, 'reason': reason,
                                     'created_at_utc': timestamp(), 'actor': actor})
        state['status'] = {'accept': 'accepted', 'reject': 'rejected',
                           'revise': 'awaiting_review'}[decision]
    write_state(state_path, state)
    return state


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, default=DEFAULT_ROOT)
    commands = parser.add_subparsers(dest='command', required=True)
    commands.add_parser('init')
    for command in ['save', 'fork-task']:
        child = commands.add_parser(command)
        child.add_argument('--task', required=True)
        child.add_argument('--reason', required=True)
        child.add_argument('--actor', choices=['human', 'agent'], default='human')
        if command == 'save':
            child.add_argument('--decision', choices=['revise', 'accept', 'reject'], required=True)
    args = parser.parse_args()
    try:
        if args.command == 'init':
            print(init(args.root))
        else:
            result = save(args.root, args.task, getattr(args, 'decision', None), args.reason,
                          fork=args.command == 'fork-task', actor=args.actor)
            print(json.dumps({'task': result['task'], 'version': result['current_version'],
                              'status': result['status'], 'training_eligible': False}))
    except (ValueError, OSError, KeyError, json.JSONDecodeError) as error:
        parser.exit(1, f'Calibration record failed: {error}\n')


if __name__ == '__main__':
    main()
