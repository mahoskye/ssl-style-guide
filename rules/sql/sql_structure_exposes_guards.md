---
id: sql_structure_exposes_guards
title: SQL layout shows lock and guard conditions
domain: sql
status: active
level: style_only
severity: info
applies_to: [embedded_sql, sql_data_source]
rule: >-
  Use structured SQL with clause-per-line formatting and indentation that
  exposes lock and guard conditions.
categories: [sql]
enforced_by: [reviewer]
verification:
  basis: convention
  note: >-
    Kept from the server-script baseline's SQL bullets, which state it word
    for word. sql_multiline_strings asks for major clauses on separate lines
    for any non-trivial query; this rule asks that the layout of a guarded
    write or locking read make its conditions visible.
---

## Rationale

The guard and lock conditions decide whether a write is safe, so they belong
where a reviewer sees them, each on its own line.

## Examples

### Good

```ssl
:PROCEDURE CloseOrder;
	:PARAMETERS sOrdNo;
	SQLExecute("
	    UPDATE ordtask SET
	        status = 'Done'
	    WHERE ordno = ?sOrdNo?
	      AND status = 'Logged'
	");
	:RETURN LimsRecordsAffected() == 1;
:ENDPROC;
```

### Bad

```text
:PROCEDURE CloseOrder;
	:PARAMETERS sOrdNo;
	SQLExecute("UPDATE ordtask SET status = 'Done' WHERE ordno = ?sOrdNo? AND status = 'Logged'");
	:RETURN LimsRecordsAffected() == 1;
:ENDPROC;
```
