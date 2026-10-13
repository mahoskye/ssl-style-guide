---
id: include_early
title: Place :INCLUDE early
domain: server-scripts
status: active
level: style_only
severity: info
applies_to: [server_script]
rule: >-
  Place `:INCLUDE` early — it textually includes the referenced source before
  the script runs.
categories: [module-structure]
machine: { list: must_follow }
related_elements: [INCLUDE]
enforced_by: [lsp:diag.include_early]
schema:
  - path: lints.coding_standards
    form: lint
    message: >-
      :INCLUDE is resolved as a textual paste before the rest of the file is
      read, so its position is technically flexible, but it should appear
      early to ensure expanded content is available.
verification:
  basis: reference
  note: >-
    Kept from the module-structure pack, which states it word for word. The
    schema lint include_early, its declaration_ordering_note, and the agent
    guide's quick start rule 4 and "Code Organization" say the same.
---

## Rationale

The included script is pasted in full, so everything it declares is in scope
for the rest of the file. Placing it after `:PARAMETERS` and `:DEFAULT` and
before other statements makes that visible to a reader.

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

```ssl
:PARAMETERS sName;
:DEFAULT sName, "";
:DECLARE nCount;
:INCLUDE Shared.Helpers;

nCount := Len(sName);
:RETURN nCount;
```
