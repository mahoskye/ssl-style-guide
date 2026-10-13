---
id: no_control_exit_in_finally
title: No control-flow exits inside :FINALLY
domain: server-scripts
status: active
level: authoritative
severity: error
applies_to: [server_script, class]
rule: >-
  Do not use `:RETURN`, `:EXITFOR`, `:EXITWHILE`, or `:LOOP` inside
  `:FINALLY`.
categories: [error-handling, transactions, loops]
machine: { list: must_follow, foundation: non_negotiable }
related_elements: [FINALLY, RETURN, EXITFOR, EXITWHILE, LOOP]
enforced_by:
  - lsp:diag.return_in_finally
  - lsp:diag.exitfor_in_finally
  - lsp:diag.exitwhile_in_finally
  - lsp:diag.loop_in_finally
schema:
  - path: lints.compile_errors.rules.exitfor_in_finally.message
    form: text
    message: ":EXITFOR inside a :FINALLY block is rejected."
  - path: lints.compile_errors.rules.exitwhile_in_finally.message
    form: text
    message: ":EXITWHILE inside a :FINALLY block is rejected."
  - path: lints.compile_errors.rules.loop_in_finally.message
    form: text
    message: ":LOOP inside a :FINALLY block is rejected."
  - path: lints.compile_errors.rules.return_in_finally.message
    form: text
    message: ":RETURN inside a :FINALLY block is rejected."
verification:
  basis: reference
  note: >-
    Kept from the loops pack, which states it word for word. Merged: the
    error-handling pack's "Do not place ... inside :FINALLY.", the
    transactions pack's "Do not put control-flow exits inside :FINALLY.", the
    foundation bullet, the schema's four compile_errors entries
    (return_in_finally, exitfor_in_finally, exitwhile_in_finally,
    loop_in_finally), and the skills' rule lists.
---

## Rationale

`:FINALLY` always runs to its end, whether the protected statements finished
or raised. Each of these statements would leave it early, so each is a
compile-time error inside `:FINALLY`.

## Examples

### Good

```ssl
:PROCEDURE SumRows;
	:PARAMETERS aRows;
	:DECLARE i, nTotal, bDone;

	nTotal := 0;
	bDone := .F.;
	:FOR i := 1 :TO ALen(aRows);
		:TRY;
			nTotal += aRows[i];
		:FINALLY;
			bDone := nTotal > 100;
		:ENDTRY;

		:IF bDone;
			:EXITFOR;
		:ENDIF;
	:NEXT;

	:RETURN nTotal;
:ENDPROC;
```

### Bad

```ssl
:PROCEDURE SumRows;
	:PARAMETERS aRows;
	:DECLARE i, nTotal;

	nTotal := 0;
	:FOR i := 1 :TO ALen(aRows);
		:TRY;
			nTotal += aRows[i];
		:FINALLY;
			:IF nTotal > 100;
				:EXITFOR;
			:ENDIF;
			:LOOP;
		:ENDTRY;
	:NEXT;

	:WHILE nTotal > 0;
		:TRY;
			nTotal -= 1;
		:FINALLY;
			:EXITWHILE;
		:ENDTRY;
	:ENDWHILE;

	:TRY;
		nTotal += 1;
	:FINALLY;
		:RETURN nTotal;
	:ENDTRY;
:ENDPROC;
```

## Notes

The schema states this as four `lints.compile_errors` entries, one per
keyword. Their slugs are not this record's id, so the record supplies only
each entry's message; the slugs stay in `rules/schema-base.yaml`.
