---
id: sql_lock_hints_deliberate
title: Lock hints follow the concurrency contract
domain: sql
status: active
level: advisory
severity: info
applies_to: [embedded_sql, sql_data_source]
rule: >-
  Apply lock hints deliberately for the operation's concurrency contract.
categories: [sql]
enforced_by: [reviewer]
verification:
  basis: convention
  note: >-
    Kept from the server-script baseline's SQL bullets, which state it word
    for word.
---

## Rationale

A lock hint changes what concurrent commands can see and do. One added by
habit blocks other work; one left out lets two commands act on the same row.

## Examples

### Good

```ssl
:PROCEDURE ClaimOrder;
	:PARAMETERS sOrdNo;
	:DECLARE aRows;
	/* Lock the row so a second claim waits for this one;
	aRows := SQLExecute("
	    SELECT ordno, status
	    FROM ordtask
	    WHERE ordno = ?sOrdNo?
	    FOR UPDATE
	");
	:RETURN aRows;
:ENDPROC;
```

### Bad

```text
/* Every read takes a lock, whether or not anything is written;
aRows := SQLExecute("
    SELECT ordno, status
    FROM ordtask
    FOR UPDATE
");
```
