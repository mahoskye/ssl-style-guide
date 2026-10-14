---
id: no_semicolon_in_comment_text
title: No semicolon inside comment text
domain: language
status: active
level: authoritative
severity: error
applies_to: [server_script, class, ssl_data_source]
rule: >-
  Never include a semicolon inside comment text; the first semicolon ends the
  comment and the remaining text becomes executable code.
categories: [formatting, control-flow]
machine: { list: must_follow, foundation: non_negotiable }
enforced_by: [lsp:diag.comment_text_after_terminator]
schema:
  - path: comments.rules
    form: rule_text
    message: >-
      Never include a semicolon inside comment text — it prematurely ends the
      comment, causing the remaining text to be parsed as executable code.
verification:
  basis: reference
  note: >-
    Kept from the first sentence of the foundation bullet. Merged: the
    formatting pack's "Never include a semicolon inside comment text.", the
    control-flow pack's avoid item "Do not put semicolons inside comment
    text; the first semicolon ends the comment.", the skills' "Never place ;
    inside comment body text", the agent guide's quick start rule 10, and the
    schema's comments.rules entry. The foundation bullet's second sentence
    (end every comment with ; alone) is no_c_style_comment_closer.
---

## Rationale

An SSL comment runs from `/*` to the first `;`. A semicolon written as
punctuation inside the comment ends it there, and the rest of the line runs
as code.

## Examples

### Good

```ssl
:DECLARE nCount;

/* Set the count, then reset it;
nCount := 0;
```

### Bad

```ssl
:DECLARE nCount;
/* Set the count; then reset it;
nCount := 0;
```
