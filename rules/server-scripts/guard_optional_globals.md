---
id: guard_optional_globals
title: Do not read globals a base installation lacks
domain: server-scripts
status: active
level: authoritative
severity: warning
applies_to: [server_script, class]
rule: >-
  Do not read a name the base installation does not declare (`CR`, `LF`,
  `TAB`, `sDQ`, `MYUSERID`, ...); use `Chr(...)` or the documented global
  instead, and guard a name that only some installations declare with
  `IsDefined("<name>")`.
categories: [procedures]
related_elements: [Chr, IsDefined]
enforced_by: [reviewer]
verification:
  basis: reference
  note: >-
    Kept from the server-script baseline's predefined-globals bullets.
    Merged: the agent guide's predefined-globals paragraph ("Use Chr(13),
    Chr(10) and Chr(9) (or CRLF for a line break) ... Test with IsDefined
    before reading a global your installation may not declare") and the
    refactoring guide's global-variables note.
---

## Rationale

Reading an undeclared name raises `Variable [<name>] is undefined!` where it
is missing, so code that works on one installation fails on another.

## Examples

### Good

```ssl
:PROCEDURE TwoLines;
	:PARAMETERS sFirst, sSecond;
	:RETURN sFirst + Chr(13) + Chr(10) + sSecond;
:ENDPROC;
```

### Bad

```text
:PROCEDURE TwoLines;
	:PARAMETERS sFirst, sSecond;
	:RETURN sFirst + CR + LF + sSecond;
:ENDPROC;
```
