---
name: ssl-tidy-context
description: Step 1 of 6 of the SSL cleanup sequence. Maps how one SSL file fits the project (its callers and what they already check, what they read back, work duplicated elsewhere, and the file's responsibilities) and writes a context note the later steps rely on. Changes no code. Use only when the user invokes it on a file.
argument-hint: "<file-path>"
user-invocable: true
disable-model-invocation: true
---

# SSL cleanup, step 1 of 6: context

The cleanup sequence makes one SSL file simpler without changing what its
callers see. Each step does one kind of change, so you can review it in the
diff before running the next:

1. `ssl-tidy-context`: map the file's place in the project (this step).
2. `ssl-tidy-guards`: remove checks and catches that cannot matter.
3. `ssl-tidy-structure`: remove structure nothing needs.
4. `ssl-tidy-clarity`: name values, flatten nesting, name conditions.
5. `ssl-tidy-comments`: cut comments to what the code cannot say.
6. `ssl-tidy-verify`: re-prove every change, check the tests, and
   propose a split when the file does several jobs.

The later steps can only remove what this note shows is unneeded, so its
accuracy is what makes them safe.

## Target

The file is the argument. Without one, use the file open in the editor, and
name it in your first line. If neither is clear, ask.

## Search scope

Search the project the file belongs to: its folder and the folders beside
it. When the workspace also holds a larger codebase, search that too if the
user asked for the codebase, or before calling a procedure unused. Record
the scope you searched in the note.

The callers you find in that scope are the callers. A script or procedure
with no caller there is internal to it, and the later steps may change it.
The exception is an entry point the platform reaches without a script
calling it: a web service, a form or client event, a scheduled job. Its
inputs stay untrusted at the entry, and only there.

Tests are not callers. A test shows the code works; what it passes says
nothing about what production sends, and it is never a reason to keep
code. Record the tests separately, so the later steps can update them.

## What to find

Read the whole file once: a file read stops at a size cap (about 50 KB,
roughly 1,300 lines of SSL), so keep reading from the next offset until
the tool reports the end of the file. Then find, with searches scoped as
above (stop at about twenty-five searches, and say what you did not
search):

- **How it is called.** Its call name, usually `Category.ScriptName` from its
  folder and file name. Search for that name in `ExecFunction`, `DoProc` and
  data-source calls, and in forms and client scripts if the workspace has
  them. Classify the entry point: web service or other external request,
  form or client event, scheduled job, or internal call from other scripts.
- **What callers pass.** For each parameter: always passed, sometimes
  omitted, and whether its type and emptiness are guaranteed by the callers
  you found or come from outside (user input, a request body, another system).
- **What callers already check.** For each check the file makes on an
  input, read the callers just before the call: did they already check the
  same thing, or build the value in a way that guarantees it? Record each
  one with the caller's file and line. Do the same in the other direction:
  which callers re-check what this file returns.
- **What callers read back.** Do they branch on a success flag? Which result
  fields or array positions do they use? A field no caller reads is a
  candidate for step 3.
- **What it calls.** Each `ExecFunction` target: in this workspace (its
  contract is readable) or not. Each query: can it return no rows? For a
  built-in's behavior, such as what `LSearch` returns when nothing
  matches, look it up with `ssl_lookup` or `ssl_signature` and record
  the answer: questions in the note are for facts about the project, not
  the language.
- **Local procedures.** For each: its callers inside the file, and whether
  anything outside calls it by a three-part name. Calls from tests do not
  count; list them under Tests.
- **Tests.** The test procedures that call this file or its procedures,
  with file and line, and which check or result each one covers.
- **Work done elsewhere.** The same lookup (same table and key), the same
  validation or the same helper existing in another file in the scope.
  Record both places: one of them should own it.
- **Responsibilities.** The separate jobs the file does, one line each,
  with the procedures that do each. Count its code lines (blank and comment
  lines excluded) and procedures, give its size in KB, and name every
  procedure over 80 code lines. List the procedures other scripts call,
  with their length: a short helper others load a large script for is a
  candidate to move into a small script.

Run `ssl_diagnose` on the file and keep the result as the baseline. Record
its line count.

## The note

Write it to `design/<name>.tidy.md`, where `<name>` is the file name
without its extension: `design/OwnerLookup.tidy.md` for
`OwnerLookup.srvscr`. Create `design/` if needed.

```text
# Tidy context: <file path>

Entry point:  <kind> - <evidence>
Scope:        <folders searched; codebase searched: yes/no>
Callers:      <file:line, what it passes, what it reads back> ...
Not searched: <places you could not see, or "none">

## Inputs
<param> - guaranteed by callers | untrusted - <why>

## Already checked
<check in this file> - already checked by <file:line> | not checked upstream
<result this file returns> - re-checked by <file:line>

## Results
<what callers use; fields nobody reads>

## Calls out
<target> - in workspace | external - <contract known or not>

## Local procedures
<name> - <callers in file> - <called from outside: file:line, or no>

## Tests
<test file:line> - calls <script or procedure> - covers <check or result>

## Duplicated elsewhere
<work> - here at <procedure> and at <file:line>

## Responsibilities
Code lines: <n>  Procedures: <n>  Size: <n> KB  Over 80 code lines: <names, or none>
Called from other scripts: <procedure> (<n> lines) - <callers>
<responsibility> - <procedures>

## Baseline
Lines: <n>
ssl_diagnose: <result, verbatim>

## Change log
(steps 2-4 append here)
```

The later steps treat the scope you searched as complete. Anything you
could not search goes under "Not searched", and what depends on it stays
as it is.

## Files and the note

Write nothing except the target, the tests the note lists, and the
note. The change log holds only the one-line entries this step
defines; your reasoning goes in your report, not the note.

## Finish

Report the entry point, the inputs you could establish as guaranteed, the
checks already made upstream, any duplicated work, the responsibilities,
any gaps, and the note's path. Then: "Next: `ssl-tidy-guards`."
