---
name: ssl-tidy-comments
description: Step 4 of 5 of the SSL cleanup sequence. Cuts comments in one SSL file to what the code cannot say, and makes the banner and doc blocks state the contract the code now has. Comment-only edits. Use only when the user invokes it on a file.
argument-hint: "<file-path>"
user-invocable: true
disable-model-invocation: true
metadata:
  opencode/slash: "true"
  opencode/autoinvoke: "false"
---

# SSL cleanup, step 4 of 5: comments

## Before you start

Use the file named in the argument, or the one open in the editor. Read its
context note, `design/<FileName>.tidy.md`, if there is one: the change log
says what steps 2 and 3 removed, which the comments may still describe.

Load `comments_explain_why` and `document_real_outcomes_only` with
`ssl_style_rule`.

## What to change

- **Remove** a comment that says what the next line does, restates a
  procedure or variable name, or labels an obvious block ("Validate the
  request", "Return the result").
- **Remove** commented-out code, unless a nearby comment says why it is
  kept.
- **Keep** a comment that says why: an ordering requirement, who owns some
  state, an SSL trap (`=` versus `==` on strings, `:BEGINCASE`
  fallthrough, `Me:` field access), a business rule the code alone does
  not explain. Shorten it if it rambles.
- **Banner and doc blocks** state what the code now does. `Returns` names
  only the outcomes the code produces: after step 3 an envelope may be
  gone, and a failure result the code never returns comes out. A trivial
  local procedure needs no doc block.
- **Region comments** (`/* region ...;`) stay when they group a long file;
  in a short one they go.

Do not add comments. Do not touch the `Author`, `Date` or `Modified` lines,
except to add one `Modified` line if the project's banners use them.

## How to edit

Comment edits only, no code changes, in place. Every comment still ends at
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
