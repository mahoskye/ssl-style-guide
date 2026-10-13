---
id: no_c_style_comment_closer
title: An SSL comment has no */ closer
domain: language
status: active
level: authoritative
severity: warning
applies_to: [server_script, class, ssl_data_source]
rule: >-
  `*/` comment closers: an SSL comment opens with `/*` and ends at the first
  `;`. End every comment with `;` alone — the form `; */` leaves an inert
  `*/` outside the comment and draws a diagnostic.
categories: [formatting]
machine: { foundation: does_not_have }
enforced_by: [lsp:diag.comment_swallows_code]
verification:
  basis: reference
  note: >-
    Kept from the foundation's "SSL Does Not Have" entry, with the second
    sentence of its Non-Negotiable comment bullet merged in, since both say
    that `*/` closes nothing. The quality bar's "Every comment ends with ;
    alone" says the same.
---

## Rationale

A C-style `*/` is ordinary comment text in SSL. A comment written as
`/* text */` with no semicolon runs on through the following lines until the
next `;`, so the code it swallows never runs.

## Examples

### Good

```ssl
:DECLARE nCount;
/* Reset the count;
nCount := 0;
```

### Bad

```ssl
:DECLARE nCount;
/* Reset the count */
nCount := 0;
```
