---
name: ssl-tidy-verify
description: Step 5 of 5 of the SSL cleanup sequence. Validates one cleaned-up SSL file against its baseline, re-reads it whole, checks that its concerns are separated, and summarizes every change and its risk for the user's review. Read-only unless a check fails. Use only when the user invokes it on a file.
argument-hint: "<file-path>"
user-invocable: true
disable-model-invocation: true
---

# SSL cleanup, step 5 of 5: verify

## Before you start

Use the file named in the argument, or the one open in the editor. Read its
context note, `design/<name>.tidy.md` (the file
name without its extension): the baseline and the change log
are what this step checks against.

Read the target whole before judging it. A file read stops at a size
cap (about 50 KB, roughly 1,300 lines of SSL), so keep reading from the
next offset until the tool reports the end of the file. Your report
names the line range you read.

## Checks

1. **Diagnostics.** Run `ssl_diagnose`. Zero errors, and no warning that was
   not in the baseline. If either fails, fix it with the smallest edit and
   say so.
2. **Call targets.** Every `DoProc` names a procedure in the file; no
   procedure is left uncalled unless something outside calls it, per the
   note.
3. **Public surface.** The file's `:PARAMETERS` and return shape match the
   baseline, unless the user approved a change.
4. **Tests.** Every test the note lists for a removed or changed check or
   procedure was updated, per the `tests:` lines in the log. A test that
   still feeds a removed check is fixed by changing the test, never by
   restoring the check.
5. **Read it whole**, top to bottom, as the next maintainer would. Name
   anything still unclear, and anything the earlier steps made worse, such
   as a procedure now too long to follow.
6. **Separation of concerns.** Use the note's "Responsibilities" section,
   updated for what the earlier steps removed, and the rules
   `script_size_review` and `procedure_length_review`. When the file has
   more than about 400 code lines or 12 procedures, or a procedure over 80
   code lines, and does more than one job, propose a split: which
   responsibilities move, to a new script or to the file the note shows
   already doing that work, which procedures go with each, and which
   callers' three-part names change. A long file with one job, or a long
   procedure that is one step, gets a sentence saying so. Propose only:
   moving procedures changes names other files call, so the split is a
   plan for `ssl-planner`, not an edit here.

Do not reformat the file as part of this step. Running `ssl_format` over a
file that already existed rewrites lines nobody changed; offer it as a
separate step if the user wants it.

## Report

```text
File:        <path>
Lines:       <baseline> -> <now>
Diagnostics: <final result, verbatim>, <new findings vs baseline, or none>

Behavior changes to review:
  <each change from the log that alters what happens on some input,
   the input, and why the note says no caller sends it. A removed check
   whose failure is still reported later counts when other work now runs
   first: name what runs and which failure the caller now sees first.>

Safe changes:
  <count by step: guards n, structure n, comments n>

Left as proposals:
  <public-surface changes, cross-file duplicates and open questions
   from steps 2-3>

Separation of concerns:
  <code lines, procedures, procedures over 80 code lines; then the
   proposed split, or why the file is one job>
```

Then suggest unit tests for the behavior changes (the `ssl-unit-test` skill),
and, for a large cleanup, an `ssl-reviewer` pass on the result.
