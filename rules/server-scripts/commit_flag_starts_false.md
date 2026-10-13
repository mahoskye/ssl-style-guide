---
id: commit_flag_starts_false
title: The commit flag starts .F.
domain: server-scripts
status: active
level: style_only
severity: warning
applies_to: [server_script, class]
rule: >-
  Start the commit flag at `.F.` and set it `.T.` only after the last write
  and verification succeed.
categories: [transactions]
related_elements: [EndLimsTransaction]
enforced_by: [reviewer]
verification:
  basis: convention
  note: >-
    Kept from the server-script baseline's worked example ("The trap: a
    success flag that starts .T."). Merged: its "Track bStarted, bCommit, and
    success state explicitly" and "Set bCommit := .T. only after all required
    writes and verification steps succeed", and the review rubric's "a commit
    flag that starts .T." (warning).
---

## Rationale

A raised error skips the rest of the `:TRY` body, so a flag keeps whatever
value it had. A flag that starts `.T.` and is cleared only by the checks the
code makes commits the writes that ran before an unexpected error.

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
		SQLExecute("
		    INSERT INTO sample_audit (
		        sample_id, status
		    )
		    VALUES (
		        ?sSampleId?, ?sStatus?
		    )
		");
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
	:DECLARE bStarted, bSuccess;

	bStarted := .F.;
	bSuccess := .T.;

	:TRY;
		bStarted := BeginLimsTransaction();
		SQLExecute("UPDATE sample SET status = ?sStatus? WHERE sample_id = ?sSampleId?");
		:IF LimsRecordsAffected() != 1;
			bSuccess := .F.;
		:ENDIF;
		SQLExecute("INSERT INTO sample_audit (sample_id, status) VALUES (?sSampleId?, ?sStatus?)");
	:FINALLY;
		:IF bStarted;
			EndLimsTransaction(, bSuccess);
		:ENDIF;
	:ENDTRY;
:ENDPROC;
```
