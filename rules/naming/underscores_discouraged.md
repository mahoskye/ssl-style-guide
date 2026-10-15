---
id: underscores_discouraged
title: Avoid underscores in variable and procedure names
domain: naming
status: active
level: style_only
severity: info
applies_to: [server_script, class, ssl_data_source]
rule: >-
  Avoid underscores in variable and procedure names; file-level suffixes such
  as `_Core` and `_Batch` are standard.
categories: [naming]
enforced_by: [reviewer]
schema:
  - path: naming.use_underscores
    form: value
    value: discouraged
verification:
  basis: convention
  note: >-
    Kept from the schema's naming.use_underscores comment ("in
    variable/procedure names; file-level suffixes (_Core, _Batch, etc.) are
    standard").
---

## Rationale

The naming convention separates words with case, not underscores. Constants
and the `_` private-member prefix are the exceptions.

## Examples

### Good

```ssl
:PROCEDURE LoadOrders;
	:DECLARE nRowCount;

	nRowCount := 0;

	:RETURN nRowCount;
:ENDPROC;
```

### Bad

```ssl
:PROCEDURE Load_Orders;
	:DECLARE nRow_Count;
	nRow_Count := 0;
	:RETURN nRow_Count;
:ENDPROC;
```
