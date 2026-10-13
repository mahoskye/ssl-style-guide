---
id: try_around_transactional_work
title: Protect transactional work with :TRY
domain: server-scripts
status: active
level: style_only
severity: warning
applies_to: [server_script, class]
rule: >-
  Use `:TRY`/`:CATCH` around multi-step transactional database work.
categories: [transactions]
machine: { list: must_follow }
related_elements: [TRY, BeginLimsTransaction, EndLimsTransaction]
enforced_by: [reviewer]
verification:
  basis: convention
  note: >-
    Kept from the transactions pack, which states it word for word. The
    server-script baseline's "Transactional Commands" and its worked example
    show the structure.
---

## Rationale

A failed write raises under the default SQL error settings. Without a `:TRY`
around the writes, nothing ends the transaction on that path, and the
operation cannot report the failure in its own result shape.

## Examples

### Good

```ssl
:PROCEDURE WriteStatus;
	:PARAMETERS sSampleId, sStatus;
	:DECLARE bStarted, bCommit, aResult;

	bStarted := .F.;
	bCommit := .F.;

	:TRY;
		bStarted := BeginLimsTransaction();
		SQLExecute("UPDATE sample SET status = ?sStatus? WHERE sample_id = ?sSampleId?");
		SQLExecute("
		    INSERT INTO sample_audit (
		        sample_id, status
		    )
		    VALUES (
		        ?sSampleId?, ?sStatus?
		    )
		");
		bCommit := .T.;
		aResult := {.T., NIL};
	:CATCH;
		ClearLastSSLError();
		aResult := {.F., {"STATUS_NOT_SAVED", "The status change was not saved."}};
	:FINALLY;
		:IF bStarted;
			EndLimsTransaction(, bCommit);
		:ENDIF;
	:ENDTRY;

	:RETURN aResult;
:ENDPROC;
```

### Bad

```ssl
:PROCEDURE WriteStatus;
	:PARAMETERS sSampleId, sStatus;

	BeginLimsTransaction();
	SQLExecute("UPDATE sample SET status = ?sStatus? WHERE sample_id = ?sSampleId?");
	SQLExecute("INSERT INTO sample_audit (sample_id, status) VALUES (?sSampleId?, ?sStatus?)");
	EndLimsTransaction(, .T.);
:ENDPROC;
```

