---
id: no_guard_for_impossible_state
title: No guard for a state that cannot happen
domain: server-scripts
status: active
level: style_only
severity: warning
applies_to: [server_script, class]
rule: >-
  Do not check for a state the code already rules out: a parameter every
  caller passes, a type SSL or the producer guarantees, a value already
  checked upstream, or the result of a procedure in the same file.
categories: [simplicity, error-handling]
machine: { list: avoid }
related_elements: [LimsTypeEx, Empty, ALen, HasProperty]
enforced_by: [reviewer]
verification:
  basis: convention
  note: >-
    From the design philosophy (agent-guides/ssl_design_philosophy.md) and
    program decision 0002, which excludes "defensive checks for impossible
    states". Complements one_boundary_per_invariant, which covers checks
    repeated across boundaries.
---

## Rationale

A guard is a claim that the state it checks can occur. When it cannot, the
guard costs a branch, a failure result nobody will see, and a reader who now
believes the state is possible and goes looking for where it comes from.

## Exceptions

Keep a check on input the code does not control: a request from a form or web
service, a result from a script deployed separately without a documented
contract, a query that can return no rows.

## Examples

### Good

```ssl
:PROCEDURE CountOpenTests;
	:PARAMETERS aTests;
	:DECLARE nOpen, i;

	nOpen := 0;

	:FOR i := 1 :TO ALen(aTests);
		:IF aTests[i, 2] == "OPEN";
			nOpen += 1;
		:ENDIF;
	:NEXT;

	:RETURN nOpen;
:ENDPROC;
```

### Bad

```ssl
:PROCEDURE CountOpenTests;
	:PARAMETERS aTests;
	:DECLARE nOpen, i;

	:IF LimsTypeEx(aTests) != "ARRAY";
		:RETURN 0;
	:ENDIF;

	:IF ALen(aTests) == 0;
		:RETURN 0;
	:ENDIF;

	nOpen := 0;

	:FOR i := 1 :TO ALen(aTests);
		:IF aTests[i, 2] == "OPEN";
			nOpen += 1;
		:ENDIF;
	:NEXT;

	:RETURN nOpen;
:ENDPROC;
```

## Notes

In the Bad example the only caller builds `aTests` itself, so the type check
cannot fail, and an empty array already loops zero times and returns 0.
