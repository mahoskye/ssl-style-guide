---
id: keywords_colon_prefixed
title: Keywords always carry the colon prefix
domain: language
status: active
level: authoritative
severity: error
applies_to: [server_script, class, ssl_data_source]
rule: >-
  Bare `If`/`Else`/`EndIf`/`While`/`EndWhile` keywords: SSL keywords are
  colon-prefixed uppercase only (`:IF`/`:ELSE`/`:ENDIF`/`:WHILE`/`:ENDWHILE`)
  — a bare form is an identifier, not a keyword.
categories: [control-flow]
machine: { foundation: does_not_have }
related_elements: [IF, ELSE, ENDIF, WHILE, ENDWHILE]
enforced_by: [reviewer]
schema:
  - path: keywords.require_colon_prefix
    form: value
    value: true
verification:
  basis: reference
  note: >-
    Kept from the foundation's "SSL Does Not Have" list, which states it word
    for word. The schema's keywords.require_colon_prefix says the same.
    starlims-lsp reports a bare keyword only as a generic unexpected-token
    error, so the record is reviewer-enforced.
---

## Rationale

Authors coming from Visual Basic or xBase write `If`, `Else` and `EndIf`.
Without the colon these are ordinary identifiers, so the line does not parse
as the statement that was meant.

## Examples

### Good

```ssl
:DECLARE nCount;
nCount := 0;
:WHILE nCount < 3;
	nCount += 1;
:ENDWHILE;
```

### Bad

```text
If nCount > 0;
	nCount := 1;
EndIf;
```
