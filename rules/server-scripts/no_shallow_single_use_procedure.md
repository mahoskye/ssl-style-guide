---
id: no_shallow_single_use_procedure
title: No shallow procedure with a single caller
domain: server-scripts
status: active
level: style_only
severity: info
applies_to: [server_script, class]
rule: >-
  Inline a local procedure that has one caller and hides less than its call
  costs to read; extract a procedure when it names a real step of the work or
  has a second caller.
categories: [simplicity, procedures]
machine: { list: must_follow }
related_elements: [DoProc, PROCEDURE]
enforced_by: [reviewer]
verification:
  basis: convention
  note: >-
    From the design philosophy (agent-guides/ssl_design_philosophy.md) and
    program decision 0002, which excludes tiny-function rules. The
    server-script baseline already says "Prefer a small number of cohesive
    procedures over one procedure per statement."
---

## Rationale

Each `DoProc` sends the reader to another place in the file. That jump pays
off when the procedure hides real work behind a clear name, and costs more
than it saves when the body is two or three lines the caller could show
directly.

## Examples

### Good

```text
Main reads the request, then calls DoProc("ApplyStatusChange", {...}), a
40-line procedure that locks the row, checks the transition and writes it.
```

### Bad

```text
Main calls DoProc("IsBlank", {sValue}), a procedure whose body is
:RETURN Empty(AllTrim(sValue)); and which nothing else calls.
```
