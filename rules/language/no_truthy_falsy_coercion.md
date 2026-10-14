---
id: no_truthy_falsy_coercion
title: Conditions are logical values
domain: language
status: active
level: authoritative
severity: error
applies_to: [server_script, class, ssl_data_source]
rule: >-
  Conditions in `:IF`, `:WHILE` and `:CASE`, and the left operand of
  `.AND.`/`.OR.`, must be logical values; there is no truthy/falsy coercion,
  and other types, including `NIL`, raise an error.
categories: [control-flow, types]
related_elements: [IF, WHILE, CASE, and, or]
enforced_by: [lsp:diag.non_logical_condition, reviewer]
schema:
  - path: expressions.logical_evaluation.nil_evaluates
    form: value
    value: error
verification:
  basis: reference
  note: >-
    Kept from the agent guide's Boolean details ("No truthy/falsy coercion"),
    with the schema comment on expressions.logical_evaluation.nil_evaluates
    ("including NIL ... is not coerced to .F.") merged in. Checked on
    STARLIMS 12: a string or number condition in :IF raises the same error
    as in :WHILE and :CASE, :IF NIL raises, and a non-logical left operand of
    .AND. or .OR. raises. starlims-lsp v0.27.0 reports a literal string,
    number, NIL, array or code-block condition, and such a literal as the
    left operand of .AND./.OR., as non_logical_condition (error). It judges
    literals only, since the type of a variable or call is not known before
    run time, so a reviewer applies the rule to every other condition.
---

## Rationale

SSL does not treat `0`, `""` or `NIL` as false. A number, string or `NIL` in
a condition raises an error when the condition runs.

`.AND.` and `.OR.` check only their left operand. When the left operand does
not decide the result, the right operand is returned unchanged:
`.T. .AND. 5` is `5` and `.F. .OR. "x"` is `"x"`. Such a result then raises
when a condition tests it, far from the expression that produced it, so keep
both operands logical.

## Examples

### Good

```ssl
:DECLARE nCount;

nCount := 3;

:WHILE nCount > 0;
	nCount -= 1;
:ENDWHILE;
```

### Bad

```ssl
:DECLARE nCount;

nCount := 3;

:WHILE 1;
	nCount -= 1;

	:IF nCount = 0;
		:EXITWHILE;
	:ENDIF;
:ENDWHILE;
```

```ssl
:DECLARE bReady;

bReady := .T.;

:IF "Y" .AND. bReady;
	bReady := .F.;
:ENDIF;
```

```text
:DECLARE nCount;
nCount := 3;
:WHILE nCount;
	nCount -= 1;
:ENDWHILE;
```

The diagnostic covers a literal condition or left operand only. A variable
such as `nCount` above has no type known before run time, so a reviewer flags
it.
