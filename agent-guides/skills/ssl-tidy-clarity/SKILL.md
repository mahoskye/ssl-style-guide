---
name: ssl-tidy-clarity
description: Step 4 of 6 of the SSL cleanup sequence. Makes one SSL file read better without changing what it does - names positional values, returns early instead of nesting, names long conditions - using the ssl-tidy-context note. Use only when the user invokes it on a file.
argument-hint: "<file-path>"
user-invocable: true
disable-model-invocation: true
---

# SSL cleanup, step 4 of 6: clarity

## Before you start

Use the file named in the argument, or the one open in the editor. Read its
context note, `design/<name>.tidy.md` (the file name without its
extension), including the change log. If there is no note, stop and ask the
user to run `ssl-tidy-context` first.

Read the target whole before judging it. A file read stops at a size cap
(about 50 KB, roughly 1,300 lines of SSL), so keep reading from the next
offset until the tool reports the end of the file. Your report names the
line range you read.

## What to change

The goal is code a maintainer reads once and understands. Each change keeps
behavior exactly as it is. Work through every procedure, top to bottom,
and report the ones you looked at and left as they were.

- **Positional values.** Where a procedure reads the same array position
  more than once, or a position whose meaning is not obvious
  (`aRow[10]`, `aCandidate[5]`), assign it once to a named local
  (`nResultId := aRow[10];`) and use the name. Declare the local with the
  others, following the file's Hungarian prefixes. Name a position the
  code compares, tests or computes with; a value only copied from one
  tuple into another keeps its index, since a name used once to rebuild
  the same structure adds lines without explaining anything.
- **Nesting.** Turn an `:IF` that wraps the rest of a procedure into an
  early `:RETURN` for the other case. Merge an `:IF` whose only statement
  is another `:IF` into one condition, clauses one per line.
- **Long conditions.** Name a condition only when the name says something
  the clauses do not: the business rule behind them, used in more than one
  place or buried inside a larger expression. An `:IF` whose whole
  condition you would lift into a boolean used once, on the next line,
  gains nothing: leave it, or break its clauses one per line instead.
- **Repetition.** The same expression computed several times in one
  procedure becomes one local.

## What stays

- Anything that crosses a procedure boundary: parameters, the order and
  shape of arrays passed to or returned from other procedures, and
  procedures called from outside. A tuple whose positions would read
  better as named properties is a proposal, naming the procedures that
  build and read it.
- The file's formatting style: indentation, line breaks, keyword case.
  Do not reformat code you did not change. Lines you write stay within
  the file's width (90 columns unless the file is wider): break a long
  expression one clause per line, continuation indented as the file does.
  A new local joins the existing `:DECLARE` line of its group, in the
  group's order, rather than starting another `:DECLARE`.
- Order of evaluation. Naming a value must not move a read before a check
  that guards it, or a query before a lock.

## How to edit

One change at a time, in place. After the last edit, run `ssl_diagnose`:
zero errors and no warning that was not in the baseline. A new local must
pass `ssl_validate_naming`.

**Format what you changed.** For each procedure you edited, pass it to
`ssl_format` as `code` (the whole procedure, from its doc block through
`:ENDPROC;`; for the script's top-level code, from `:PARAMETERS` to the
first procedure) and read how the formatter lays out the lines you
changed. Make those lines match it: indentation, wrapping, spacing,
continuation alignment. Leave every line you did not change as it is,
even where the formatter would change it. Never write the formatter's
output over the file.

Append to the note's change log, one line per change:

```text
clarity: <what changed> at <procedure> - <how it reads better>
```

## Files and the note

Write nothing except the target, the tests the note lists, and the
note. The change log holds only the one-line entries this step
defines; your reasoning goes in your report, not the note.

## Finish

Report the changes, the proposals, and lines before and after. Then:
"Review the diff, then run `ssl-tidy-comments`."
