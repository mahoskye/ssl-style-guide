---
id: banner_description_one_sentence
title: Banner description is one sentence
domain: server-scripts
status: active
level: style_only
severity: info
applies_to: [server_script, class]
rule: >-
  Describe the script's single responsibility in one concise sentence on the
  banner's `Description` line.
categories: [module-structure]
enforced_by: [reviewer]
verification:
  basis: convention
  note: >-
    Kept from the server-script baseline's banner bullets ("Describe the
    script's single responsibility in one concise sentence").
---

## Rationale

One sentence is enough to say what a script with one responsibility does;
needing more suggests it does more than one thing.

## Examples

### Good

```text
Description.. : Records a status change for one sample.
```

### Bad

```text
Description.. : Updates samples. Also writes audit rows, sends the
                notification email and refreshes the dashboard cache.
```
