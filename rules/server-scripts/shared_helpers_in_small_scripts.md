---
id: shared_helpers_in_small_scripts
title: Procedures other scripts call live in small scripts
domain: server-scripts
status: active
level: style_only
severity: warning
applies_to: [server_script, class]
rule: >-
  Put a procedure that other scripts call in a script small enough for that
  use; never make callers load a large script to run a few lines, and move a
  shared helper out of a large script into a small one of its own.
categories: [module-structure, simplicity]
machine: { list: must_follow }
related_elements: [ExecFunction, DoProc]
enforced_by: [reviewer]
verification:
  basis: observed
  note: >-
    Program decision 0006 (2026-10-22). In the sequencing sample, other
    scripts call 4- to 9-line helpers inside a 225 KB script; STARLIMS loads
    and compiles a script whole, so each such call site makes all of it load.
---

## Rationale

Calling `ExecFunction("Category.Script.Procedure")` loads and compiles the
whole script, however small the procedure. A helper other scripts use is a
reason for them to load its script, so its script should be no bigger than
what callers need.

## Examples

### Good

```text
IsRunPathComponent (9 lines) lives in QCCPaths (40 lines), which
QCCPrepareIngestionSource and subrouter_qcc both call.
```

### Bad

```text
QCCPrepareIngestionSource calls subrouter_qcc.IsRunPathComponent, a 9-line
check inside a 6,249-line script.
```
