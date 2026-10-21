---
name: ssl-tidy-comments
description: Step 4 of 5 of the SSL cleanup sequence. Cuts comments in one SSL file to what the code cannot say, and makes the banner and doc blocks state the contract the code now has. Comment-only edits. Use only when the user invokes it on a file.
argument-hint: "<file-path>"
user-invocable: true
disable-model-invocation: true
---

# SSL cleanup, step 4 of 5: comments

## Before you start

Use the file named in the argument, or the one open in the editor. Read its
context note, `design/<name>.tidy.md` (the file
name without its extension), if there is one: the change log
says what steps 2 and 3 removed, which the comments may still describe.

Read the target whole before judging it. A file read stops at a size
cap (about 50 KB, roughly 1,300 lines of SSL), so keep reading from the
next offset until the tool reports the end of the file. Your report
names the line range you read.

Load `comments_explain_why` and `document_real_outcomes_only` with
`ssl_style_rule`.

## What to change

- **Remove** a comment in the body that says what the next line does or
  labels an obvious block ("Validate the request", "Return the result").
- **Remove** commented-out code, unless a nearby comment says why it is
  kept.
- **Keep** a comment that says why: an ordering requirement, who owns some
  state, a retry or repeat-safety requirement, an SSL trap (`=` versus
  `==` on strings, `:BEGINCASE` fallthrough, `Me:` field access), a
  business rule the code alone does not explain. Shorten it if it
  rambles. When such a comment is also stale (an "add work here" note
  where work now exists), rewrite the stale part and keep the
  requirement.
- **Keep** an open `TODO` and every ticket reference (`SL-810-12`) word
  for word: they point at tracked work the code cannot describe.
- **Banner and doc blocks** keep the project's template, including the
  `Procedure:` line, and state what the code now does. `Returns` names
  only the outcomes the code produces: after step 3 an envelope may be
  gone, and a failure result the code never returns comes out. Remove a
  doc block only from a procedure of a few lines whose name and
  parameters already say everything it would; a procedure with several
  parameters keeps its block.
- **Region comments** (`/* region ...;`) stay when they group a long file;
  in a short one they go.

Do not add comments. Do not touch the `Author`, `Date` or `Modified` lines,
except to add one `Modified` line if the project's banners use them.

## How to edit

Comment edits only, no code changes, in place. Keep the file's
line endings: in a CRLF file, every line you write ends in CRLF too. Every comment still ends at
its first `;`, so never leave a semicolon inside comment text. Run
`ssl_diagnose` after the last edit: zero errors and no warning that was not
in the baseline.

Append one line to the note's change log:

```text
comments: removed <n>, rewrote <n> (banner/doc blocks: <what changed>)
```

## Finish

Report what changed and lines before and after. Then: "Review the diff,
then run `ssl-tidy-verify`."
