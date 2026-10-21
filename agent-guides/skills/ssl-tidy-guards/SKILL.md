---
name: ssl-tidy-guards
description: Step 2 of 5 of the SSL cleanup sequence. Removes guards for states that cannot happen, repeated validation, and catches that cannot act from one SSL file, using the context note from ssl-tidy-context. Use only when the user invokes it on a file.
argument-hint: "<file-path>"
user-invocable: true
disable-model-invocation: true
---

# SSL cleanup, step 2 of 5: guards

## Before you start

Use the file named in the argument, or the one open in the editor. Read its
context note, `design/<name>.tidy.md` (the file
name without its extension). If there is no note, stop and ask
the user to run `ssl-tidy-context` first: this step is only safe with it.

Read the target whole before judging it. A file read stops at a size
cap (about 50 KB, roughly 1,300 lines of SSL), so keep reading from the
next offset until the tool reports the end of the file. Your report
names the line range you read.

Load the `simplicity` rules with `ssl_context_pack` (category `simplicity`).
The ones this step applies: `no_guard_for_impossible_state`,
`one_boundary_per_invariant`, `validate_results_before_access`,
`trust_query_result_shape`, `trust_built_context_shape`,
`catch_only_to_act`.

## What to remove

- A check on a parameter the note marks as guaranteed.
- A check the note's "Already checked" section shows every caller in the
  scope already makes, or makes impossible by how it builds the value.
- A check repeated after the same value was already checked upstream.
- A check on the column count, column types or fields of rows that the
  procedure's own query selects. Checks for no rows, more rows than
  expected, and NULL in a nullable column stay.
- A re-check of a context object's shape in a procedure that receives it
  from the procedure that built and checked it, in the same flow.
- A type or shape check on the result of a procedure in the same file, or of
  a script whose contract the note shows.
- An empty-case branch where the code already does the right thing on empty
  input: a loop over an empty array, `LSearch` with a fallback.
- A `:TRY` / `:CATCH` whose catch only replaces the error with a vaguer
  failure, or logs and carries on as if nothing happened, when nothing in
  the procedure can recover.

## What stays

- Checks on inputs the note marks untrusted: a platform entry point's
  inputs, or a caller outside the searched scope. Keep one, at the entry
  point; remove the repeats.
- A check that a context reloaded from a queue or a saved record still
  belongs to the current run or attempt: that is identity, not shape.
- A success-flag check on any envelope a caller relies on.
- Transaction handling: `:TRY` / `:FINALLY` that finalizes a transaction,
  commit flags, rollback.
- A guarded write's `LimsRecordsAffected()` check.
- A catch that is part of a public failure contract callers branch on.

A test that calls a procedure directly is one of its callers. When a test
exercises a check, removing the check means changing the test, so list it
as a proposal naming the test instead of removing it.

When the note shows the same check made both here and in a caller, and
this file is the boundary that should own it (an entry point, or the
script every caller goes through), keep it here and record the caller's
copy as a proposal for that file. This step edits only the target.

When you are unsure whether a state can happen, keep the code and list it
as a question.

## How to edit

One change at a time, in place, matching the file's existing style. Do not
reformat the file. After the last edit, run `ssl_diagnose`: zero errors and
no warning that was not in the baseline. A removed guard often leaves an
unused variable or an empty branch; remove those too.

Append to the note's change log, one line per removal:

```text
guards: removed <what> at <procedure> - <reason, citing the note>
```

## Finish

Report the removals, the questions you left, and lines before and after.
Then: "Review the diff, then run `ssl-tidy-structure`."
