---
id: check_builtin_parameter_types
title: Look up built-in parameter types
domain: language
status: active
level: advisory
severity: warning
applies_to: [server_script, class, ssl_data_source]
rule: >-
  Look up function parameter types before relying on coercion.
categories: [types, dates]
machine: { list: must_follow }
enforced_by: [reviewer]
verification:
  basis: reference
  note: >-
    Kept from the types pack, which states it word for word. Merged: the types
    pack's avoid item "Do not assume every built-in coerces strings, numbers,
    dates, and NIL interchangeably." and the dates pack's avoid item "Do not
    pass arbitrary strings or numbers to date-only functions unless the
    element documentation says they are accepted.". The agent guide notes that
    argument types are not checked before the script runs.
---

## Rationale

Whether a built-in rejects a wrong-typed argument depends on an installation
setting. Where it is off, a string passed for a number reads as `0` and the
call quietly returns a wrong answer, so only the documented signature tells
you what a call accepts.

## Examples

### Good

```ssl
:DECLARE dDue, dNext;

dDue := CToD("3/5/2026");
dNext := DateAdd(dDue, 7);
```

### Bad

```text
dNext := DateAdd("3/5/2026", 7);
```
