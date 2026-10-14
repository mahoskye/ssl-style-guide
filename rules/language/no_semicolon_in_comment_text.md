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
    (end every comment with ; alone) is no_c_style_comment_closer. Also
    merged: banner_has_no_semicolon (now removed), whose banner example is
    the second Good and Bad fence here, and its schema entry under
    documentation.file_banner.rules, which comments.rules already covers.
    Checked with starlims-lsp v0.27.0, where comment_text_after_terminator
    is an error by default: each Bad fence draws that one error, at the
    comment's first `;`, and nothing else, including the third fence, whose
    stranded line `Parameters: none` parses as code.
---

## Rationale

An SSL comment runs from `/*` to the first `;`, whatever kind of comment it
is: a one-line note, a file banner, a procedure doc block, or a section or
region comment. There is no separate rule for any of them. A semicolon
written as punctuation inside the text ends the comment there, and the rest
of the text is read as code.

Usually that text is not valid SSL, since two bare words in a row never form
a statement, and the script does not compile. Occasionally it reads as valid
code and runs silently: a stranded doc line such as `Parameters: none;` is a
member access on an undeclared variable, so nothing points at the broken
comment.

## Examples

### Good

```ssl
:DECLARE nCount;

/* Set the count, then reset it;
nCount := 0;
```

```ssl
/* ********************************************************************************
Description.. : Records a status change for one sample.
Returns...... : {.T., NIL} on success
Date......... : 2026-10-13
********************************************************************************;
:RETURN {.T., NIL};
```

### Bad

```ssl
:DECLARE nCount;
/* Set the count; then reset it;
nCount := 0;
```

```ssl
/* ********************************************************************************
Description.. : Records a status change; for one sample.
Returns...... : {.T., NIL} on success
Date......... : 2026-10-13
********************************************************************************;
:RETURN {.T., NIL};
```

```ssl
:DECLARE nCount;
/*
Resets the count;
Parameters: none
;
nCount := 0;
```
