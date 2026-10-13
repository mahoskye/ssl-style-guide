---
id: match_begin_with_end_transaction
title: End only the transaction you began
domain: server-scripts
status: active
level: style_only
severity: warning
applies_to: [server_script, class]
rule: >-
  Match each successful `BeginLimsTransaction` with exactly one
  `EndLimsTransaction` for the same connection, and end only a transaction
  the command started.
categories: [transactions]
related_elements: [BeginLimsTransaction, EndLimsTransaction, IsInTransaction]
enforced_by: [reviewer]
verification:
  basis: convention
  note: >-
    Merged: the server-script baseline's nested-scope pattern ("each
    successful call increases transaction depth and must be matched with
    exactly one EndLimsTransaction for the same connection") and its
    conditional-ownership pattern ("end only the transaction the command
    started"). The review rubric lists ending a transaction the code did not
    begin as a warning.
---

## Rationale

Each successful `BeginLimsTransaction` adds a level of depth. An extra
`EndLimsTransaction` closes the caller's transaction, and a missing one
leaves a level open after the command returns.

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
		SQLExecute("UPDATE sample SET status = ?sStatus? WHERE sample_id = ?sSampleId?");
		bCommit := .T.;
	:FINALLY;
		EndLimsTransaction(, bCommit);
	:ENDTRY;
:ENDPROC;
```
