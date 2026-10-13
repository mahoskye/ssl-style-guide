---
id: loop_control_inside_loop
title: Loop-control statements only inside their loop
domain: language
status: active
level: authoritative
severity: error
applies_to: [server_script, class, ssl_data_source]
rule: >-
  Use `:EXITFOR` only inside a `:FOR` loop, `:EXITWHILE` only inside a
  `:WHILE` loop, and `:LOOP` only inside a `:WHILE` or `:FOR` loop.
categories: [loops]
related_elements: [EXITFOR, EXITWHILE, LOOP]
enforced_by:
  - lsp:diag.exitfor_outside_loop
  - lsp:diag.exitwhile_outside_loop
  - lsp:diag.loop_outside_loop
schema:
  - path: lints.compile_errors.rules.exitfor_outside_loop.message
    form: text
    message: ":EXITFOR must be inside a :FOR loop."
  - path: lints.compile_errors.rules.exitwhile_outside_loop.message
    form: text
    message: ":EXITWHILE must be inside a :WHILE loop."
  - path: lints.compile_errors.rules.loop_outside_loop.message
    form: text
    message: ":LOOP must be inside a :WHILE or :FOR loop."
verification:
  basis: reference
  note: >-
    Merged from the schema's three compile_errors entries
    (exitfor_outside_loop, exitwhile_outside_loop, loop_outside_loop), whose
    messages stay word for word in the schema.
---

## Rationale

Each statement leaves or restarts its own kind of loop. Outside that loop
there is nothing for it to act on, so it is rejected when the script
compiles.

## Examples

### Good

```ssl
:DECLARE i, nTotal;
nTotal := 0;
:FOR i := 1 :TO 9;
	:IF nTotal > 10;
		:EXITFOR;
	:ENDIF;
	nTotal += i;
:NEXT;
```

### Bad

```ssl
:DECLARE nTotal;
nTotal := 0;
:EXITFOR;
:EXITWHILE;
:LOOP;
```
