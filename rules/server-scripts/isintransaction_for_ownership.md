---
id: isintransaction_for_ownership
title: IsInTransaction decides ownership
domain: server-scripts
status: active
level: style_only
severity: warning
applies_to: [server_script, class]
rule: >-
  Use `IsInTransaction` to establish transaction ownership or to require an
  existing transaction when that is part of the procedure contract; do not
  reject an ambient transaction merely because nesting is possible.
categories: [transactions]
related_elements: [IsInTransaction, BeginLimsTransaction]
enforced_by: [reviewer]
verification:
  basis: convention
  note: >-
    Kept from the server-script baseline ("Transactional Commands"), which
    states it in two sentences, joined here. Its conditional-ownership
    pattern sets the ownership flag from !IsInTransaction(connection).
---

## Rationale

A command that runs inside a caller's transaction takes part in it; refusing
to run there breaks callers that compose commands.

## Examples

### Good

```ssl
:PROCEDURE WriteStatus;
	:PARAMETERS sSampleId, sStatus;
	:DECLARE bOwner, bCommit;

	bOwner := !IsInTransaction();
	bCommit := .F.;

	:TRY;
		:IF bOwner;
			BeginLimsTransaction();
		:ENDIF;

		SQLExecute("UPDATE sample SET status = ?sStatus? WHERE sample_id = ?sSampleId?");
		bCommit := .T.;
	:FINALLY;
		:IF bOwner;
			EndLimsTransaction(, bCommit);
		:ENDIF;
	:ENDTRY;
:ENDPROC;
```

### Bad

```ssl
:PROCEDURE WriteStatus;
	:PARAMETERS sSampleId, sStatus;
	:IF IsInTransaction();
		RaiseError("WriteStatus cannot run inside a transaction");
	:ENDIF;

	SQLExecute("UPDATE sample SET status = ?sStatus? WHERE sample_id = ?sSampleId?");
:ENDPROC;
```
