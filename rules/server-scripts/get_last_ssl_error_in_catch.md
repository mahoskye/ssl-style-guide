---
id: get_last_ssl_error_in_catch
title: Read error details with GetLastSSLError
domain: server-scripts
status: active
level: authoritative
severity: info
applies_to: [server_script, class]
rule: >-
  Use `GetLastSSLError()` inside `:CATCH` to retrieve error details.
categories: [error-handling, transactions]
machine: { list: must_follow }
related_elements: [GetLastSSLError, CATCH]
enforced_by: [reviewer]
verification:
  basis: reference
  note: >-
    Kept from the error-handling pack, which states it word for word. Merged:
    the transactions pack's "Call GetLastSSLError() inside :CATCH when error
    details are needed.", the schema comment ":CATCH does not name the
    exception", and the new-procedure skill.
---

## Rationale

`:CATCH` does not bind the error to a name. `GetLastSSLError()` returns the
`SSLError` object, with `:Description`, `:Code`, `:Operation` and the full
diagnostic text.

## Examples

### Good

```ssl
:PROCEDURE ReadTitle;
	:DECLARE sTitle, oErr;

	:TRY;
		sTitle := ReadText("settings/title.txt");
	:CATCH;
		oErr := GetLastSSLError();
		ErrorMes("[ERROR] ReadTitle", Left(oErr:Description, 2000));
		ClearLastSSLError();
		sTitle := "";
	:ENDTRY;

	:RETURN sTitle;
:ENDPROC;
```

### Bad

```text
:CATCH oErr;
```

`:CATCH` takes no name; the line above is not SSL.
