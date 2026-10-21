---
name: ssl-tidy-verify
description: Step 5 of 5 of the SSL cleanup sequence. Validates one cleaned-up SSL file against its baseline, re-reads it whole, and summarizes every change and its risk for the user's review. Read-only unless a check fails. Use only when the user invokes it on a file.
argument-hint: "<file-path>"
user-invocable: true
disable-model-invocation: true
---

# SSL cleanup, step 5 of 5: verify

## Before you start

Use the file named in the argument, or the one open in the editor. Read its
context note, `design/<FileName>.tidy.md`: the baseline and the change log
are what this step checks against.

## Checks

1. **Diagnostics.** Run `ssl_diagnose`. Zero errors, and no warning that was
   not in the baseline. If either fails, fix it with the smallest edit and
   say so.
2. **Call targets.** Every `DoProc` names a procedure in the file; no
   procedure is left uncalled unless something outside calls it, per the
   note.
3. **Public surface.** The file's `:PARAMETERS` and return shape match the
   baseline, unless the user approved a change.
4. **Read it whole**, top to bottom, as the next maintainer would. Name
   anything still unclear, and anything the earlier steps made worse, such
   as a procedure now too long to follow.

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
   the input, and why the note says no caller sends it>

Safe changes:
  <count by step: guards n, structure n, comments n>

Left as proposals:
  <public-surface changes and open questions from steps 2-3>
```

Then suggest unit tests for the behavior changes (the `ssl-unit-test` skill),
and, for a large cleanup, an `ssl-reviewer` pass on the result.
