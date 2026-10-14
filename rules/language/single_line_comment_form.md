---
id: single_line_comment_form
title: Single-line comment form
domain: language
status: active
level: authoritative
severity: error
applies_to: [server_script, class, ssl_data_source]
rule: >-
  Write a single-line comment as `/* comment text here;`.
categories: [formatting]
related_elements: [code-organization]
enforced_by: [lsp:diag.comment_termination]
schema:
  - path: comments.rules
    form: rule_text
    message: "Single-line format: /* comment text here;"
verification:
  basis: reference
  note: >-
    Kept from the schema's comments.rules entry. A comment that reaches the
    end of the file without its semicolon is reported as
    comment_termination.
---

## Rationale

The comment opens with `/*` and its own semicolon closes it. Without that
semicolon the comment never ends.

## Examples

### Good

```ssl
:DECLARE nCount;

nCount := 0;

/* Count is reset at the start of each run;
```

### Bad

```ssl
:DECLARE nCount;
nCount := 0;
/* Count is reset at the start of each run
```
