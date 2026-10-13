---
id: banner_descriptions_operational
title: Banner descriptions stay operational
domain: server-scripts
status: active
level: style_only
severity: info
applies_to: [server_script, class]
rule: >-
  Keep banner descriptions operational; do not restate obvious properties of
  SSL or SQL.
categories: [module-structure]
enforced_by: [reviewer]
verification:
  basis: convention
  note: >-
    Kept from the server-script baseline's banner bullets, which state it
    word for word.
---

## Rationale

The banner says what this script does for its callers; how SSL or SQL behave
in general is in the reference.

## Examples

### Good

```text
Description.. : Records a status change for one sample.
```

### Bad

```text
Description.. : Uses SQLExecute, which binds ?name? markers, to run an
                UPDATE statement.
```
