---
id: end_transaction_in_finally_when_started
title: End the transaction from :FINALLY when it started
domain: server-scripts
status: active
level: style_only
severity: warning
applies_to: [server_script, class]
rule: >-
  From `:FINALLY`, call `EndLimsTransaction(, bCommit)` only when the
  transaction started.
categories: [transactions]
related_elements: [EndLimsTransaction, BeginLimsTransaction, FINALLY]
enforced_by: [reviewer]
verification:
  basis: convention
  note: >-
    Kept from the server-script baseline ("Transactional Commands"), whose
    worked example takes bStarted from BeginLimsTransaction.
---

## Rationale

`:FINALLY` runs on success and on error, so it is the one place that always
closes the transaction. Guarding the call with the started flag means an
error raised before `BeginLimsTransaction` does not end a transaction this
command never began.

## Examples

### Good

```ssl
:PROCEDURE WriteStatus;
	:PARAMETERS sSampleId, sStatus;
	:DECLARE bStarted, bCommit;

	bStarted := .F.;
	bCommit := .F.;

	:TRY;
		bStarted := BeginLimsTransaction();
		SQLExecute("UPDATE sample SET status = ?sStatus? WHERE sample_id = ?sSampleId?");
		bCommit := .T.;
	:FINALLY;
		:IF bStarted;
			EndLimsTransaction(, bCommit);
		:ENDIF;
	:ENDTRY;
:ENDPROC;
```

### Bad

```ssl
:PROCEDURE WriteStatus;
	:PARAMETERS sSampleId, sStatus;
	:DECLARE bCommit;

	bCommit := .F.;

	:TRY;
		BeginLimsTransaction();
		SQLExecute("UPDATE sample SET status = ?sStatus? WHERE sample_id = ?sSampleId?");
		bCommit := .T.;
		EndLimsTransaction(, bCommit);
	:CATCH;
		ClearLastSSLError();
	:ENDTRY;
:ENDPROC;
```
