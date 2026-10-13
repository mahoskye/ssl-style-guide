---
id: guard_transaction_finalization
title: Guard transaction finalization in envelope commands
domain: server-scripts
status: active
level: style_only
severity: warning
applies_to: [server_script, class]
rule: >-
  In a command that returns its own failure envelope, protect the
  `EndLimsTransaction` call in `:FINALLY` with a nested `:TRY`/`:CATCH`,
  because finalization failures raise rather than returning `.F.`; on a
  finalization failure, fail the operation with a distinct stable code.
categories: [transactions]
related_elements: [EndLimsTransaction, FINALLY, TRY, CATCH]
enforced_by: [reviewer]
verification:
  basis: convention
  note: >-
    Merged: the server-script baseline's finalization bullets ("protect that
    call with a nested :TRY/:CATCH because finalization failures raise" and
    "On finalization failure, force the public operation to fail ... Do not
    report success when the command's transaction scope did not close
    successfully") and its completion check. The worked example notes that a
    raise-only helper does not need the nested guard.
---

## Rationale

A commit can fail after every write succeeded. That raises from inside
`:FINALLY`, escaping the command's own `:CATCH`, so a command that promises a
result envelope has to catch it there and report the operation as failed.

## Exceptions

A raise-only helper that lets every failure propagate does not need the
nested guard; the finalization error reaches its caller's `:CATCH` like any
other.

## Examples

### Good

```ssl
:PROCEDURE WriteStatus;
	:PARAMETERS sSampleId, sStatus;
	:DECLARE bStarted, bCommit, aResult;

	bStarted := .F.;
	bCommit := .F.;
	aResult := {.F., {"STATUS_NOT_SAVED", "The status change was not saved."}};

	:TRY;
		bStarted := BeginLimsTransaction();
		SQLExecute("UPDATE sample SET status = ?sStatus? WHERE sample_id = ?sSampleId?");
		bCommit := .T.;
		aResult := {.T., NIL};
	:CATCH;
		ClearLastSSLError();
	:FINALLY;
		:IF bStarted;
			:TRY;
				EndLimsTransaction(, bCommit);
			:CATCH;
				ClearLastSSLError();
				aResult := {.F., {"STATUS_NOT_CLOSED", "The change did not complete."}};
			:ENDTRY;
		:ENDIF;
	:ENDTRY;

	:RETURN aResult;
:ENDPROC;
```

### Bad

```ssl
:PROCEDURE WriteStatus;
	:PARAMETERS sSampleId, sStatus;
	:DECLARE bStarted, bCommit, aResult;

	bStarted := .F.;
	bCommit := .F.;
	aResult := {.F., {"STATUS_NOT_SAVED", "The status change was not saved."}};

	:TRY;
		bStarted := BeginLimsTransaction();
		SQLExecute("UPDATE sample SET status = ?sStatus? WHERE sample_id = ?sSampleId?");
		bCommit := .T.;
		aResult := {.T., NIL};
	:CATCH;
		ClearLastSSLError();
	:FINALLY;
		:IF bStarted;
			EndLimsTransaction(, bCommit);
		:ENDIF;
	:ENDTRY;

	:RETURN aResult;
:ENDPROC;
```
