---
id: comment_sentence_case
title: Comments are sentence-case and concise
domain: language
status: active
level: style_only
severity: info
applies_to: [server_script, class, ssl_data_source]
rule: >-
  Use sentence-case and keep comments concise.
categories: [formatting]
enforced_by: [reviewer]
schema:
  - path: comments.rules
    form: rule_text
  - path: documentation.code_comments.rules
    form: text
    message: Use sentence case
verification:
  basis: convention
  note: >-
    Kept from the schema's comments.rules entry, which states it word for
    word. Merged: documentation.code_comments.rules "Use sentence case". Its
    neighbor "Keep concise" is the same statement but cannot take a second
    placement on the same list; it stays hand-written in the schema.
---

## Rationale

Short, sentence-case comments read as prose and do not compete with the code
for attention.

## Examples

### Good

```ssl
:DECLARE nCount;
/* Retry once before reporting the failure;
nCount := 1;
```

### Bad

```ssl
:DECLARE nCount;
/* NOW WE SET THE COUNT TO ONE BECAUSE WE WANT TO TRY AGAIN AND THEN IF THAT FAILS WE REPORT IT TO THE CALLER;
nCount := 1;
```
