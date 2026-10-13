---
id: no_secrets_in_logs
title: No secrets in logs
domain: server-scripts
status: active
level: advisory
severity: warning
applies_to: [server_script, class]
rule: >-
  Avoid logging secrets, connection strings, passwords, or tokens.
categories: [logging, security]
machine: { list: must_follow }
related_elements: [UsrMes, ErrorMes, InfoMes]
enforced_by: [reviewer]
verification:
  basis: convention
  note: >-
    Kept from the security pack, which states it word for word. Merged: the
    logging pack's "Avoid logging secrets or sensitive runtime values."
---

## Rationale

Server logs are read by more people, and kept longer, than the systems the
secrets protect. A value written to a log has to be treated as disclosed.

## Examples

### Good

```ssl
:PROCEDURE Connect;
	:PARAMETERS sUser, sPassword;
	:DECLARE aResult;

	aResult := ExecFunction("Integration.Connect", {sUser, sPassword});
	InfoMes("[INFO] Connect", "Connected as " + sUser);
	:RETURN aResult;
:ENDPROC;
```

### Bad

```ssl
:PROCEDURE Connect;
	:PARAMETERS sUser, sPassword;
	:DECLARE aResult;

	aResult := ExecFunction("Integration.Connect", {sUser, sPassword});
	InfoMes("[INFO] Connect", "Connected as " + sUser + " with " + sPassword);
	:RETURN aResult;
:ENDPROC;
```
