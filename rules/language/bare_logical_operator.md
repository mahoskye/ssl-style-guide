---
id: bare_logical_operator
title: Logical operators keep their periods
domain: language
status: active
level: authoritative
severity: error
applies_to: [server_script, class, ssl_data_source]
rule: >-
  Write the logical operators with their periods: `.AND.`, `.OR.` and
  `.NOT.`, never bare `AND`, `OR` or `NOT`.
categories: [operators]
enforced_by: [lsp:diag.bare_logical_operator]
verification:
  basis: reference
  note: >-
    Kept from the agent guide's gotcha 6 ("Use .AND., .OR., .NOT. - not AND,
    OR, NOT"). Merged: its anti-pattern table row "Logical Operators" and
    the refactoring guide's quick-reference heading "Logical Operators
    (include periods)". The id is the starlims-lsp diagnostic slug.
---

## Rationale

SSL has no bare `AND`, `OR` or `NOT` operator. A bare word between two
operands is read as an identifier, so the condition does not mean what it
says.

## Examples

### Good

```ssl
:PROCEDURE InRange;
	:PARAMETERS nVal;
	:RETURN nVal > 5 .AND. nVal < 10;
:ENDPROC;
```

### Bad

```ssl
:PROCEDURE InRange;
	:PARAMETERS nVal;
	:RETURN nVal > 5 AND nVal < 10;
:ENDPROC;
```
