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
`catch_only_to_act`.

## What to remove

- A check on a parameter the note marks as guaranteed.
- A check repeated after the same value was already checked upstream.
- A type or shape check on the result of a procedure in the same file, or of
  a script whose contract the note shows.
- An empty-case branch where the code already does the right thing on empty
  input: a loop over an empty array, `LSearch` with a fallback.
- A `:TRY` / `:CATCH` whose catch only replaces the error with a vaguer
  failure, or logs and carries on as if nothing happened, when nothing in
  the procedure can recover.

## What stays

- Checks on inputs the note marks untrusted, or that depend on callers it
  could not see. Keep one, at the entry point; remove the repeats.
- A success-flag check on any envelope a caller relies on.
- Transaction handling: `:TRY` / `:FINALLY` that finalizes a transaction,
  commit flags, rollback.
- A guarded write's `LimsRecordsAffected()` check.
- A catch that is part of a public failure contract callers branch on.

A test that calls a procedure directly is one of its callers. When a test
exercises a check, removing the check means changing the test, so list it
as a proposal naming the test instead of removing it.

When you are unsure whether a state can happen, keep the code and list it
as a question.

## How to edit

One change at a time, in place, matching the file's existing style. Keep the file's
line endings: in a CRLF file, every line you write ends in CRLF too. Do not
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
