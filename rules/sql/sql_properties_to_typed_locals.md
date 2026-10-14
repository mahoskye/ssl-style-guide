---
id: sql_properties_to_typed_locals
title: Copy object properties into locals for SQL
domain: sql
status: active
level: style_only
severity: info
applies_to: [server_script, class]
rule: >-
  Copy object properties into typed locals before embedding them in SQL.
categories: [database]
related_elements: [SQLExecute]
enforced_by: [reviewer]
verification:
  basis: convention
  note: >-
    Kept from the server-script baseline ("For SQLExecute, use named
    ?localVariable? substitution. Copy object properties into typed locals
    before embedding them in SQL."); the first sentence is
    named_sql_param_unsupported. An array property used for IN expansion
    must be copied for a different reason, udobject_array_in_clause.
---

## Rationale

A typed local names the value the query binds, and its prefix says what type
the placeholder receives.

## Examples

### Good

```ssl
:PROCEDURE OrderRows;
	:PARAMETERS oRequest;
	:DECLARE sOrdNo, aRows;

	sOrdNo := oRequest:ordNo;
	aRows := SQLExecute("SELECT testcode FROM ordtask WHERE ordno = ?sOrdNo?");

	:RETURN aRows;
:ENDPROC;
```

### Bad

```ssl
:PROCEDURE OrderRows;
	:PARAMETERS oRequest;
	:DECLARE aRows;
	aRows := SQLExecute("SELECT testcode FROM ordtask WHERE ordno = ?oRequest:ordNo?");
	:RETURN aRows;
:ENDPROC;
```
