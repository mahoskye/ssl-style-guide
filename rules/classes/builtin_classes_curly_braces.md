---
id: builtin_classes_curly_braces
title: Built-in classes instantiate with curly braces
domain: classes
status: active
level: authoritative
severity: error
applies_to: [server_script, class]
rule: >-
  Instantiate directly creatable built-in classes with curly braces, for
  example `Email{}`.
categories: [objects]
machine: { list: must_follow, foundation: non_negotiable }
related_elements: [Email, SSLDataset, SSLStringDictionary]
enforced_by: [lsp:diag.class_instantiation_curly]
schema:
  - path: object_oriented.object_creation.builtin_classes.syntax
    form: value
    value: ClassName{parameters}
verification:
  basis: reference
  note: >-
    Kept from the objects pack, which states it word for word. Merged: the
    foundation's "Built-in classes instantiate with curly braces, for example
    Email{}.", the new-class skill, the agent guide's quick start rule 7, and
    the schema's builtin_classes.syntax.
---

## Rationale

Built-in classes are constructed with `ClassName{args}`. Parentheses make a
function call, and there is no function by that name.

## Exceptions

`SSLExpando` and `SSLBaseDictionary` have no direct constructor; see the
schema's `no_direct_constructor`.

## Examples

### Good

```ssl
:DECLARE oEmail;

oEmail := Email{};
```

### Bad

```ssl
:DECLARE oEmail;
oEmail := Email();
```
