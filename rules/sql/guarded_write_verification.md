---
id: guarded_write_verification
title: Check the rows a guarded write changed
domain: sql
status: active
level: style_only
severity: warning
applies_to: [server_script, class]
rule: >-
  For guarded writes, require `LimsRecordsAffected() == 1`, and perform a
  verification read when later logic depends on the resulting state or state
  version.
categories: [database]
related_elements: [LimsRecordsAffected]
enforced_by: [reviewer]
verification:
  basis: convention
  note: >-
    Kept from the server-script baseline's SQL bullets, which state it word
    for word. Its worked example checks LimsRecordsAffected after the
    guarded UPDATE.
---

## Rationale

A guarded `UPDATE` that matches no row succeeds without changing anything.
Only the affected-row count tells the command that its guard did not hold.

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
	:IF LimsRecordsAffected() != 1;
		:RETURN {.F., {"NOT_UPDATED", "The order was not updated."}};
	:ENDIF;
	:RETURN {.T., NIL};
:ENDPROC;
```

### Bad

```ssl
:PROCEDURE CloseOrder;
	:PARAMETERS sOrdNo;
	SQLExecute("
	    UPDATE ordtask SET
	        status = 'Done'
	    WHERE ordno = ?sOrdNo?
	      AND status = 'Logged'
	");
	:RETURN {.T., NIL};
:ENDPROC;
```
