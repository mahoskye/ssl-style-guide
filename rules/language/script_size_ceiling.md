---
id: script_size_ceiling
title: Keep every script under 50 KB
domain: language
status: active
level: style_only
severity: warning
applies_to: [server_script, class, ssl_data_source, sql_data_source]
rule: >-
  Keep every server script, class and data source under 50 KB, test scripts
  included; split a larger one by responsibility until each part fits.
categories: [module-structure]
related_elements: [ExecFunction, INCLUDE]
enforced_by: [lsp:diag.script_size_ceiling]
schema:
  - path: lints.style_rules.script_size_ceiling
    form: value
    value:
      max_script_bytes: 51200
verification:
  basis: observed
  note: >-
    Program decision 0006 (2026-10-22). The server compiles each script as a
    whole and keeps it loaded; the cost falls on first use, on every script
    after a production check-in resets the application, and on every save
    during development. The 50 KB figure matches the agents' read limit.
    starlims-lsp v0.29.0 reports a file over ssl.diagnostics.maxScriptBytes
    bytes (default 51,200, which is 50 KB; 0 disables the check) as
    script_size_ceiling (warning), once per file on line 1. Every file type
    is measured, data sources included, as the server receives it with its
    line endings, so a CRLF file counts one byte more per line than the same
    file with LF. How to split a file that is over the limit stays a
    reviewer's judgment.
---

## Rationale

STARLIMS compiles a script as one unit, with its `:INCLUDE`d code, even when
a caller needs a single procedure. A loaded script stays in memory, so the
size shows up whenever it must be loaded again: the first use after a start,
every script after a check-in in production mode, which resets the
application, and the saved script on every save during development. A large
script makes each of those slow. The agents that write and review SSL read
at most about 50 KB at a time, so a larger script is never seen whole, and a
change judged from part of a file can break what the rest depends on.

## Exceptions

None for size alone. A script that is large because it repeats code another
script has shrinks by moving that code to its owner first; one that is large
because it does several jobs splits by job.

## Examples

### Good

```text
subrouter_qcc split by job: routing and stage handlers 70 KB -> 45 KB after
cleanup; run context 31 KB; branch submission 14 KB; primer ordering 22 KB.
```

### Bad

```text
subrouter_qcc: 225 KB in one script; every production check-in makes the
next QCC job load and compile all of it.
```
