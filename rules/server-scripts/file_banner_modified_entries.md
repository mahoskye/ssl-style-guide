---
id: file_banner_modified_entries
title: Record changes as new Modified lines
domain: server-scripts
status: active
level: style_only
severity: info
applies_to: [server_script, class]
rule: >-
  Record later changes as new lines below `Date`, in the same style:
  `Modified..... : YYYY-MM-DD ABC - <what changed and why>`.
categories: [module-structure]
enforced_by: [reviewer]
schema:
  - path: documentation.file_banner.rules
    form: text
    message: >-
      Record later changes as new lines below Date in the same style:
      Modified..... : YYYY-MM-DD [initials] - [change]. Never rewrite an
      earlier entry.
verification:
  basis: convention
  note: >-
    Kept from the server-script baseline's banner bullets. Merged: the
    schema's documentation.file_banner.rules entry, which adds "Never rewrite
    an earlier entry", and the baseline's "Preserve existing ticket,
    modification, author, and date entries as historical records".
---

## Rationale

The banner's dated entries are the file's change history. Rewriting an
earlier entry to describe current work loses that history; a new line keeps
it.

## Examples

### Good

```text
Date......... : 2026-03-02
Modified..... : 2026-10-13 ABC - Return a failure envelope when the write fails
```

### Bad

```text
Date......... : 2026-10-13
```

The bad banner overwrote the original date instead of adding a line.
