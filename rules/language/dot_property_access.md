---
id: dot_property_access
title: Member access uses a colon, not a dot
domain: language
status: active
level: authoritative
severity: error
applies_to: [server_script, class, ssl_data_source]
rule: >-
  Use colon-chained member access (`oObj:Property`, `oObj:Method():Value`),
  not dot-chained access (`oObj.Property`).
categories: [objects, operators]
enforced_by: [lsp:diag.dot_property_access]
verification:
  basis: reference
  note: >-
    Kept from the agent guide's gotcha 9, which states it word for word.
    Merged: its anti-pattern table row "Object Property" (`oObj.Property`
    versus `oObj:Property`). The id is the starlims-lsp diagnostic slug.
---

## Rationale

The colon is SSL's member-access operator. A dot after an object is not member
access, so `oObj.Property` does not reach the property.

## Exceptions

Dots inside an `:INCLUDE` path and inside SQL text (`table.column`) are not
member access.

## Examples

### Good

```ssl
:PROCEDURE OrderName;
	:PARAMETERS oOrder;

	:RETURN oOrder:Name;
:ENDPROC;
```

### Bad

```ssl
:PROCEDURE OrderName;
	:PARAMETERS oOrder;
	:RETURN oOrder.Name;
:ENDPROC;
```
