---
id: condition_keyword_semicolon
title: Condition-bearing keyword lines end with a semicolon
domain: language
status: active
level: authoritative
severity: error
applies_to: [server_script, class, ssl_data_source]
rule: >-
  Condition-bearing keyword lines are statements and end with a semicolon:
  `:IF condition;`, `:WHILE condition;`, `:FOR i := 1 :TO n;`. Omitting it
  absorbs the next line into the condition.
categories: [control-flow]
machine: { foundation: non_negotiable }
related_elements: [IF, WHILE, FOR, CASE]
enforced_by: [lsp:fmt.semicolon_enforcement]
verification:
  basis: observed
  note: >-
    Kept from the foundation bullet, with its last sentence reworded to say
    only what happens to the next line. A missing semicolon after
    the condition is reported as an unexpected token on the following line,
    and the formatter adds it.
---

## Rationale

`:IF`, `:WHILE`, `:FOR` and `:CASE` lines are statements like any other. Authors
from C-family languages leave the semicolon off a line that opens a block,
and the next line is then read as part of the condition.

## Examples

### Good

```ssl
:DECLARE nCount;
nCount := 0;
:IF nCount > 0;
	nCount := 1;
:ENDIF;
```

### Bad

```ssl
:DECLARE nCount;
nCount := 0;
:IF nCount > 0
	nCount := 1;
:ENDIF;
```
