---
id: field_vs_property_terminology
title: Fields and properties are different things
domain: classes
status: active
level: advisory
severity: info
applies_to: [class]
rule: >-
  Use field for `:DECLARE` slots on classes, and reserve property for
  dynamic-object members, `SSLExpando` members, and `AddProperty`-created
  members.
categories: [objects]
machine: { list: must_follow }
related_elements: [DECLARE, AddProperty, SSLExpando, CreateUdObject]
enforced_by: [reviewer]
schema:
  - path: classes.fields.terminology_note
    form: text
    message: |
      :DECLARE slots on a class are fields. Reserve "property" for
      SSLExpando / AddProperty / CreateUdObject anonymous-object members,
      which are a separate runtime mechanism.
verification:
  basis: reference
  note: >-
    Merged from the objects pack's "Reserve property for dynamic-object
    members, SSLExpando members, and AddProperty-created members.", "Use
    field for :DECLARE slots on classes." and its avoid item "Do not blur
    class fields and dynamic object properties in documentation or
    reviews.", the schema's classes.fields.terminology_note and the agent
    guide's terminology note.
---

## Rationale

Class fields and dynamic-object properties are separate runtime mechanisms.
Calling both "properties" in a review or a spec hides which one the code
uses.

## Examples

### Good

```text
Counter keeps its total in the field nCount (Me:nCount).
The request object carries the property orderNo, added with AddProperty.
```

### Bad

```text
Counter keeps its total in the property nCount.
```
