# First review batch

Working copies are ready. Edit them directly or describe the changes you want
in chat. Their initial drafts and requirements are retained separately.

Start with [NormalizeKey](working/normalize-key/NormalizeKey.srvscr), an 18-line
utility. Its [task](pilot/normalize-key/TASK.md) defines the intended behavior.
Consider the file banner, guards, naming, spacing, and whether the implementation
contains exactly the responsibilities you expect for a utility of this kind.

Then review [PendingItems](working/pending-items/PendingItems.ds), a nine-line SQL
data source, against its [task](pilot/pending-items/TASK.md). Consider SQL layout,
parameter defaults, and what documentation makes this easy to maintain.

Use the corresponding review worksheets under `pilot/` to retain explanations.
The unit tests are in each working directory; they check behavior and are not
part of the implementation's size measurement. They have not run in STARLIMS.

After editing, save a revision from the repository root:

```bash
python3 tools/calibration.py save --task normalize-key --decision revise \
  --reason 'Explain the formatting or design choices you changed'
```

When you explicitly accept an implementation, save with `--decision accept`.
Agent-assisted edits use `--actor agent --decision revise`. If the request itself
changes, edit the working `TASK.md` and use `fork-task --task ... --reason ...`.

An accepted example supplies evidence for a practice; it does not automatically
rewrite the canonical guide. Discuss the rationale and exceptions before
recording a practice in [PRACTICES.md](PRACTICES.md).
