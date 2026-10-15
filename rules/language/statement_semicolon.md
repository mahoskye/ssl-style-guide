---
id: statement_semicolon
title: Statements and comments end with a semicolon
domain: language
status: active
level: authoritative
severity: error
applies_to: [server_script, class, ssl_data_source]
rule: >-
  Almost every SSL statement, including comments, must end with a semicolon.
categories: [formatting, control-flow]
machine: { list: must_follow, foundation: non_negotiable }
enforced_by: [lsp:fmt.semicolon_enforcement]
schema:
  - path: comments.rules
    form: rule_text
    message: All comments must end with semicolon (SSL requirement).
  - path: formatting.statement_terminator
    form: value
    value: ";"
  - path: language_features.statement_termination.all_statements
    form: value
    value: require_semicolon
  - path: language_features.statement_termination.comments
    form: value
    value: terminate_with_semicolon
  - path: documentation.code_comments.rules
    form: text
    message: Terminate with semicolon when the comment itself is a complete SSL comment statement
verification:
  basis: reference
  note: >-
    Kept from the foundation and the formatting pack, which state it word for
    word. Merged: the second half of the control-flow pack's "Keep one
    statement per line and terminate every statement with a semicolon.", the
    skills' "Almost every statement, including comments, must end with ;",
    the agent guide's quick start rule 2 and gotcha 4, the schema's
    comments.rules entry "All comments must end with semicolon", and the
    termination values under formatting, language_features and
    documentation.code_comments.
---

## Rationale

The semicolon is the statement terminator, and it is also what closes a
comment. A missing semicolon joins two statements into one that does not
parse.

## Examples

### Good

```ssl
:DECLARE nCount;

/* Start from zero;
nCount := 0;
nCount := 1;
```

### Bad

```ssl
:DECLARE nCount;
nCount := 0
nCount := 1;
```
