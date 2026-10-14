---
id: no_semicolon_on_continuation_lines
title: Continuation lines take no semicolon
domain: language
status: active
level: authoritative
severity: error
applies_to: [server_script, class, ssl_data_source]
rule: >-
  Do not end a continuation line of a multi-line statement with a semicolon;
  only the line that completes the statement takes one.
categories: [formatting]
enforced_by: [reviewer]
verification:
  basis: reference
  note: >-
    Kept from the format skill ("Do NOT add semicolons to continuation lines
    within a multi-line expression"). Merged: the refactoring guide's
    statement-termination note and its checklist item "Continuation lines
    only omit semicolons when they are part of a still-open statement".
---

## Rationale

A semicolon ends the statement wherever it appears, so a semicolon at the end
of a continuation line cuts the statement in two and leaves the rest as an
invalid statement of its own.

## Examples

### Good

```ssl
:DECLARE nTotal;

nTotal := 1
	+ 2;
```

### Bad

```text
:DECLARE nTotal;
nTotal := 1;
	+ 2;
```
