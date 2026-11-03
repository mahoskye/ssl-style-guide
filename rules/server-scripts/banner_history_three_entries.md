---
id: banner_history_three_entries
title: Keep the three most recent modification entries
domain: server-scripts
status: active
level: style_only
severity: info
applies_to: [server_script, class, ssl_data_source, sql_data_source]
rule: >-
  Keep the banner's modification history to the three most recent entries;
  delete older entries rather than rewriting them, since source control
  keeps the full history.
categories: [module-structure]
enforced_by: [reviewer]
verification:
  basis: convention
  note: >-
    Program decision 0006 (2026-10-22). The two largest scripts in the
    sequencing sample open with 178 and 170 lines of change history, loaded
    and compiled with the script every time it loads.
---

## Rationale

A change history in the banner grows with every edit and is loaded with the
script each time it loads. The latest few entries tell a maintainer what
changed recently; the rest belongs in source control.

## Examples

### Good

```text
The banner's three latest modification blocks (ticket, change, author,
date), newest last.
```

### Bad

```text
A banner with 30 modification blocks covering three years of changes.
```
