---
id: empty_in_array_fallback
title: Decide what an empty IN array means
domain: sql
status: active
level: advisory
severity: warning
applies_to: [server_script, class]
rule: >-
  When the array for an `IN (?aValues?)` predicate is empty, skip that query
  or choose the appropriate fallback.
categories: [database]
related_elements: [SQLExecute]
enforced_by: [reviewer]
verification:
  basis: convention
  note: >-
    Kept from the server-script baseline's IN-predicate bullet ("Skip that
    query or choose the appropriate fallback when the array is empty"). Its
    first half is sql_in_clause_array_expansion.
---

## Rationale

An empty selection can mean "no rows" or "no filter". The query cannot tell
which, so the code decides before it runs.

## Examples

### Good

```ssl
:PROCEDURE ReadByStatus;
	:PARAMETERS aStatuses;
	:DECLARE aRows;

	aRows := {};

	:IF ALen(aStatuses) > 0;
		aRows := SQLExecute("SELECT ordno FROM ordtask WHERE status IN (?aStatuses?)");
	:ENDIF;

	:RETURN aRows;
:ENDPROC;
```

### Bad

```ssl
:PROCEDURE ReadByStatus;
	:PARAMETERS aStatuses;
	:DECLARE aRows;
	aRows := SQLExecute("SELECT ordno FROM ordtask WHERE status IN (?aStatuses?)");
	:RETURN aRows;
:ENDPROC;
```
