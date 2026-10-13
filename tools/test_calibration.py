import json
from pathlib import Path
import tempfile
import unittest

import calibration


class RevisionTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.root = Path(self.temporary.name)
        self.task = self.root / 'pilot/neutral-task'
        (self.task / 'draft').mkdir(parents=True)
        (self.task / 'TASK.md').write_text('Return 1.\n', encoding='utf-8')
        (self.task / 'draft/Neutral.srvscr').write_text(':RETURN 1;\n', encoding='utf-8')
        calibration.init(self.root)
        self.working = self.root / 'working/neutral-task'
        self.history = self.root / 'reviews/neutral-task'

    def test_revisions_preserve_initial_draft_and_reason(self):
        code = self.working / 'Neutral.srvscr'
        code.write_text('/* why;\n:RETURN 1;\n', encoding='utf-8')
        calibration.init(self.root)
        self.assertTrue(code.read_text().startswith('/* why'))
        state = calibration.save(self.root, 'neutral-task', 'revise', 'Explain the decision.')
        self.assertEqual(state['status'], 'awaiting_review')
        self.assertEqual((self.history / 'v001/draft/Neutral.srvscr').read_text(), ':RETURN 1;\n')
        state = calibration.save(self.root, 'neutral-task', 'accept', 'Preferred comment.')
        self.assertEqual(state['status'], 'accepted')
        self.assertEqual(len(state['versions'][0]['revisions']), 2)
        self.assertFalse(state['training_eligible'])

    def test_task_changes_require_new_version(self):
        (self.working / 'TASK.md').write_text('Return 2.\n', encoding='utf-8')
        with self.assertRaises(ValueError):
            calibration.save(self.root, 'neutral-task', 'accept', 'Changed task.')
        state = calibration.save(self.root, 'neutral-task', None, 'Return contract changed.', fork=True)
        self.assertEqual(state['current_version'], 2)
        self.assertEqual(state['status'], 'awaiting_review')
        self.assertEqual((self.history / 'v001/draft/TASK.md').read_text(), 'Return 1.\n')
        self.assertEqual((self.history / 'v002/draft/TASK.md').read_text(), 'Return 2.\n')

    def test_tampered_history_is_rejected(self):
        (self.history / 'v001/draft/Neutral.srvscr').write_text(':RETURN 9;\n', encoding='utf-8')
        with self.assertRaises(ValueError):
            calibration.save(self.root, 'neutral-task', 'accept', 'Looks good.')

    def test_agent_revision_cannot_declare_human_acceptance(self):
        with self.assertRaises(ValueError):
            calibration.save(self.root, 'neutral-task', 'accept', 'Agent preference.', actor='agent')
        state = calibration.save(self.root, 'neutral-task', 'revise', 'Requested agent edit.', actor='agent')
        self.assertEqual(state['status'], 'awaiting_review')
        self.assertEqual(state['versions'][0]['revisions'][0]['actor'], 'agent')

    def test_empty_reason_and_unchanged_task_fork_are_rejected(self):
        with self.assertRaises(ValueError):
            calibration.save(self.root, 'neutral-task', 'revise', '   ')
        with self.assertRaises(ValueError):
            calibration.save(self.root, 'neutral-task', None, 'No requirements changed.', fork=True)
        self.assertEqual(json.loads((self.history / 'record.json').read_text())['current_version'], 1)


if __name__ == '__main__':
    unittest.main()
