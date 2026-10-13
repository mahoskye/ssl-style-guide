---
id: nil_in_operations
title: Check for NIL before arithmetic or string operations
domain: language
status: active
level: authoritative
severity: warning
applies_to: [server_script, class, ssl_data_source]
rule: >-
  Check for `NIL` before using a value in arithmetic or string operations;
  test `v == NIL` when `0`, `.F.` or an empty string is a valid value, because
  `Empty()` is also `.T.` for those.
categories: [types]
related_elements: [nil, Empty]
enforced_by: [lsp:diag.nil_in_operations]
schema:
  - path: lints.type_safety
    form: lint
    message: >-
      Using NIL in arithmetic or string operations causes error. Check for NIL
      first: v == NIL when 0, .F., or an empty string is a valid value,
      because Empty() is also .T. for those. Use Empty() only when every empty
      value means the same as missing.
verification:
  basis: reference
  note: >-
    Kept from the schema lint nil_in_operations, whose message stays word for
    word. The agent guide's primitive-types section says the same about
    Empty().
---

## Rationale

`NIL + 1` and `NIL + "x"` raise. `Empty()` is `.T.` for `NIL` but also for `0`,
`.F.` and `""`, so it is not a `NIL` test when those are valid values.

## Examples

### Good

```ssl
:PROCEDURE AddOne;
	:PARAMETERS nValue;
	:IF nValue == NIL;
		:RETURN 1;
	:ENDIF;
	:RETURN nValue + 1;
:ENDPROC;
```

### Bad

```ssl
:DECLARE nCount;
nCount := NIL + 1;
```
