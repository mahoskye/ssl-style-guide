---
id: message_functions_write_server_log
title: UsrMes, ErrorMes and InfoMes write the server log
domain: server-scripts
status: active
level: authoritative
severity: warning
applies_to: [server_script, class]
rule: >-
  Do not assume `UsrMes`, `ErrorMes`, or `InfoMes` displays messages to
  users; they are server log functions.
categories: [error-handling, logging]
machine: { list: avoid }
related_elements: [UsrMes, ErrorMes, InfoMes]
enforced_by: [reviewer]
verification:
  basis: reference
  note: >-
    Kept from the error-handling pack, which states it word for word. Merged:
    the logging pack's "Treat UsrMes, ErrorMes, and InfoMes as server log
    functions, not UI display functions." and "Do not claim UsrMes displays a
    message to the end user."
---

## Rationale

Server scripts have no user interface. These functions write to the server
log; a message meant for the user goes back to the caller in the script's
result.

## Examples

### Good

```ssl
:PROCEDURE CheckSample;
	:PARAMETERS sSampleId;

	:IF Empty(sSampleId);
		InfoMes("[INFO] CheckSample", "Rejected an empty sample id");
		:RETURN {.F., {"SAMPLE_REQUIRED", "Enter a sample id."}};
	:ENDIF;

	:RETURN {.T., NIL};
:ENDPROC;
```

### Bad

```ssl
:PROCEDURE CheckSample;
	:PARAMETERS sSampleId;

	:IF Empty(sSampleId);
		UsrMes("Enter a sample id.");
		:RETURN .F.;
	:ENDIF;

	:RETURN .T.;
:ENDPROC;
```
