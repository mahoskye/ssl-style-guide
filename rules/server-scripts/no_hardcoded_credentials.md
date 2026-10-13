---
id: no_hardcoded_credentials
title: No credentials in code
domain: server-scripts
status: active
level: advisory
severity: warning
applies_to: [server_script, class]
rule: >-
  Do not hard-code credentials, passwords or connection strings in SSL code.
categories: [security]
enforced_by: [reviewer]
verification:
  basis: convention
  note: >-
    Kept from the review skill's security check ("Hardcoded credentials,
    passwords, or connection strings").
---

## Rationale

A credential in source is copied with every copy of the script and cannot be
changed without changing the code.

## Examples

### Good

```ssl
:PROCEDURE ReadRows;
	:DECLARE aRows;
	aRows := SQLExecute("SELECT ordno FROM ordtask");
	:RETURN aRows;
:ENDPROC;
```

### Bad

```text
:PROCEDURE ReadRows;
	:DECLARE sPassword, aRows;
	sPassword := "Secret123";
	aRows := SQLExecute("SELECT ordno FROM ordtask", "Server=db;User=lims;Password=" + sPassword);
	:RETURN aRows;
:ENDPROC;
```
