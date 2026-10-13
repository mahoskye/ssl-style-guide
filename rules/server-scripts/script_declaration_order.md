---
id: script_declaration_order
title: Conventional script declaration order
domain: server-scripts
status: active
level: style_only
severity: info
applies_to: [server_script]
rule: >-
  Recommended script order is `:PARAMETERS`, `:DEFAULT`, `:INCLUDE`,
  `:PUBLIC`, `:DECLARE`.
categories: [module-structure]
machine: { list: must_follow }
related_elements: [PARAMETERS, DEFAULT, INCLUDE, PUBLIC, DECLARE]
enforced_by: [reviewer]
verification:
  basis: convention
  note: >-
    Kept from the module-structure pack, which states it word for word. The
    schema's module_structure.standard_order and declaration_ordering_note
    and the agent guide's quick start rule 4 say the same.
---

## Rationale

Only the first two positions are required by the language. The rest is a
convention that puts what the script receives, then what it pulls in, then
what it shares, then its own locals, in the same place in every file.

## Examples

### Good

```ssl
:PARAMETERS sName;
:DEFAULT sName, "";
:INCLUDE Shared.Helpers;
:DECLARE nCount;

nCount := Len(sName);
:RETURN nCount;
```

### Bad

```text
:PARAMETERS sName;
:DEFAULT sName, "";
:DECLARE nCount;
:PUBLIC gSetting;
:INCLUDE Shared.Helpers;
```
