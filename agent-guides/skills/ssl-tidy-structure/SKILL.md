---
name: ssl-tidy-structure
description: Step 3 of 5 of the SSL cleanup sequence. Removes structure nothing needs from one SSL file (unread envelopes and result fields, shallow single-use procedures, state objects in short scripts, unused parameters and variables) using the ssl-tidy-context note. Use only when the user invokes it on a file.
argument-hint: "<file-path>"
user-invocable: true
disable-model-invocation: true
---

# SSL cleanup, step 3 of 5: structure

## Before you start

Use the file named in the argument, or the one open in the editor. Read its
context note, `design/<name>.tidy.md` (the file
name without its extension), including the change log. If there
is no note, stop and ask the user to run `ssl-tidy-context` first.

Read the target whole before judging it. A file read stops at a size
cap (about 50 KB, roughly 1,300 lines of SSL), so keep reading from the
next offset until the tool reports the end of the file. Your report
names the line range you read.

Load the `simplicity` rules with `ssl_context_pack` (category `simplicity`).
The ones this step applies: `return_what_callers_use`,
`no_shallow_single_use_procedure`, `state_object_for_multistep`,
`no_speculative_options`.

## What to change

Inside the file, for procedures whose callers, per the note, are all in
the file. A procedure the note shows no caller for anywhere in the searched
scope is unused and goes.

- **Envelopes nobody branches on.** A local procedure that never returns
  `.F.`, or whose callers never check the flag, returns its value directly;
  update its callers in the same edit.
- **Shallow single-use procedures.** Inline a procedure with one caller whose
  body is a few lines and whose name adds nothing the code does not say.
  Keep one that names a real step of the work.
- **State objects in short scripts.** When one or two steps share a few
  values, plain locals and parameters replace the object.
- **Unused things.** Parameters of local procedures that no caller passes
  meaningfully, result fields nothing reads, variables nothing reads,
  unreachable branches.

## What only gets flagged

Changes that reach other files: the file's `:PARAMETERS`, its return
shape, and any procedure the note shows called from outside. When the note
shows one of these unused or unread, list it as a proposal naming the
callers that would change. Likewise for work the note lists under
"Duplicated elsewhere": propose which file should own it and what the
other one calls instead. This step edits only the target.

## How to edit

One change at a time, in place, matching the file's style. Do not reformat
the file. Keep each procedure's behavior for every input the note says
callers can send. After the last edit, run `ssl_diagnose`: zero errors and no
warning that was not in the baseline. Check that every `DoProc` still names a
procedure that exists.

Append to the note's change log, one line per change:

```text
structure: <what changed> at <procedure> - <reason, citing the note>
```

## Finish

Report the changes, the public-surface proposals, and lines before and
after. Then: "Review the diff, then run `ssl-tidy-comments`."
