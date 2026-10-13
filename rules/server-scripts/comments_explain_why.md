---
id: comments_explain_why
title: Comments explain why, not what
domain: server-scripts
status: active
level: style_only
severity: info
applies_to: [server_script, class]
rule: >-
  Comments explain purpose, ownership, safety consequences, replay behavior,
  or a non-obvious ordering requirement; do not narrate assignments or
  restate syntax.
categories: [formatting]
enforced_by: [reviewer]
schema:
  - path: documentation.code_comments.rules
    form: text
    message: Explain "why" not "what"
verification:
  basis: convention
  note: >-
    Kept from the server-script baseline ("File And Procedure
    Documentation"). Merged: the schema's documentation.code_comments.rules
    entry and the quality bar ("comment the why wherever the logic is
    non-obvious ... not a restatement of the line below").
---

## Rationale

The code already says what it does. A comment earns its place by saying what
the code cannot: why this order, who owns this state, what breaks if it
changes.

## Examples

### Good

```ssl
:PROCEDURE Finish;
	:PARAMETERS bStarted, bCommit;

	/* Commit only when every write above succeeded, so a failure rolls back both rows;
	:IF bStarted;
		EndLimsTransaction(, bCommit);
	:ENDIF;
:ENDPROC;
```

### Bad

```ssl
:PROCEDURE Finish;
	:PARAMETERS bStarted, bCommit;

	/* If bStarted is true, call EndLimsTransaction;
	:IF bStarted;
		EndLimsTransaction(, bCommit);
	:ENDIF;
:ENDPROC;
```
