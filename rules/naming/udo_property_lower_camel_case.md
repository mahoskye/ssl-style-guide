---
id: udo_property_lower_camel_case
title: User-defined object properties are lowerCamelCase
domain: naming
status: active
level: style_only
severity: info
applies_to: [server_script, class]
rule: >-
  Name user-defined object properties in lowerCamelCase with no type prefix,
  for example `oOrder:orderNo`.
categories: [naming]
related_elements: [CreateUdObject, AddProperty]
enforced_by: [reviewer]
verification:
  basis: convention
  note: >-
    Kept from the refactoring guide's UDO properties section ("lowerCamelCase
    (no type prefix)") and its checklist item. Built-in object properties keep
    the PascalCase the platform defines.
---

## Rationale

Property names read as part of the object expression, and the object variable
already carries the type prefix.

## Examples

### Good

```ssl
:DECLARE oOrder;
oOrder := CreateUdObject();
oOrder:orderNo := "A1";
oOrder:isValid := .T.;
```

### Bad

```ssl
:DECLARE oOrder;
oOrder := CreateUdObject();
oOrder:sOrderNo := "A1";
oOrder:IS_VALID := .T.;
```
