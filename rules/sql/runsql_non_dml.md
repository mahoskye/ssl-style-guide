---
id: runsql_non_dml
title: RunSQL is for statements that return no rows
domain: sql
status: active
level: advisory
severity: warning
applies_to: [server_script, class]
rule: >-
  Use `RunSQL` for statements that return no rows (`INSERT`, `UPDATE`,
  `DELETE`, DDL), inside `:TRY`/`:CATCH`.
categories: [database]
related_elements: [RunSQL]
enforced_by: [lsp:diag.runsql_non_dml]
verification:
  basis: reference
  note: >-
    Kept from the agent guide's SQL guidance #5. The id is the starlims-lsp
    diagnostic slug, which reports a RunSQL call whose statement is a
    SELECT.
---

## Rationale

`RunSQL` reports whether the statement ran and discards any rows, so a query
needs a result-returning function such as `LSearch`, `LSelect` or
`SQLExecute`.

## Examples

### Good

```ssl
:PROCEDURE CloseOrder;
	:PARAMETERS sOrdNo;
	:DECLARE bDone, oErr;

	bDone := .F.;

	:TRY;
		bDone := RunSQL("UPDATE ordtask SET status = 'Done' WHERE ordno = ?",, {sOrdNo});
	:CATCH;
		oErr := GetLastSSLError();
		ErrorMes("[ERROR] CloseOrder " + sOrdNo, Left(oErr:Description, 2000));
		ClearLastSSLError();
	:ENDTRY;

	:RETURN bDone;
:ENDPROC;
```

### Bad

```ssl
:PROCEDURE ReadOrders;
	:DECLARE bDone;
	bDone := RunSQL("SELECT ordno FROM ordtask");
	:RETURN bDone;
:ENDPROC;
```
