---
name: ssl-tidy-context
description: Step 1 of 5 of the SSL cleanup sequence. Maps how one SSL file fits the project (its callers, what they pass, what they read back, what it calls) and writes a context note the later steps rely on. Changes no code. Use only when the user invokes it on a file.
argument-hint: "<file-path>"
user-invocable: true
disable-model-invocation: true
---

# SSL cleanup, step 1 of 5: context

The cleanup sequence makes one SSL file simpler without changing what its
callers see. Each step does one kind of change, so you can review it in the
diff before running the next:

1. `ssl-tidy-context`: map the file's place in the project (this step).
2. `ssl-tidy-guards`: remove checks and catches that cannot matter.
3. `ssl-tidy-structure`: remove structure nothing needs.
4. `ssl-tidy-comments`: cut comments to what the code cannot say.
5. `ssl-tidy-verify`: validate, and summarize every change for review.

The later steps can only remove what this note shows is unneeded, so its
accuracy is what makes them safe.

## Target

The file is the argument. Without one, use the file open in the editor, and
name it in your first line. If neither is clear, ask.

## What to find

Read the whole file once. Then find, with searches scoped to the project's
SSL folders (stop at about ten searches, and say what you did not search):

- **How it is called.** Its call name, usually `Category.ScriptName` from its
  folder and file name. Search for that name in `ExecFunction`, `DoProc` and
  data-source calls, and in forms and client scripts if the workspace has
  them. Classify the entry point: web service or other external request,
  form or client event, scheduled job, or internal call from other scripts.
- **What callers pass.** For each parameter: always passed, sometimes
  omitted, and whether its type and emptiness are guaranteed by the callers
  you found or come from outside (user input, a request body, another system).
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
  anything outside calls it by a three-part name.

Run `ssl_diagnose` on the file and keep the result as the baseline. Record
its line count.

## The note

Write it to `design/<name>.tidy.md`, where `<name>` is the file name
without its extension: `design/OwnerLookup.tidy.md` for
`OwnerLookup.srvscr`. Create `design/` if needed.

```text
# Tidy context: <file path>

Entry point:  <kind> - <evidence>
Callers:      <file:line, what it passes, what it reads back> ...
Not searched: <places you could not see, or "none">

## Inputs
<param> - guaranteed by callers | untrusted - <why>

## Results
<what callers use; fields nobody reads>

## Calls out
<target> - in workspace | external - <contract known or not>

## Local procedures
<name> - <callers in file> - <called from outside: yes/no>

## Baseline
Lines: <n>
ssl_diagnose: <result, verbatim>

## Change log
(steps 2-4 append here)
```

When callers sit outside what you could search, say so under "Not searched".
The later steps treat anything that depends on unseen callers as untrusted,
so a gap here costs simplicity, never correctness.

## Finish

Report the entry point, the inputs you could establish as guaranteed, any
gaps, and the note's path. Then: "Next: `ssl-tidy-guards`."
