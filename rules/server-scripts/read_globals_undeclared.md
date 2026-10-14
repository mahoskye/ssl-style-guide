---
id: read_globals_undeclared
title: Read a global without declaring it
domain: server-scripts
status: active
level: authoritative
severity: warning
applies_to: [server_script, class]
rule: >-
  Read a predefined global by its name, without declaring it; a `:DECLARE`,
  `:PARAMETERS` entry or caller variable with the same name hides the
  global.
categories: [procedures]
enforced_by: [reviewer]
verification:
  basis: reference
  note: >-
    Kept from the server-script baseline's predefined-globals bullets ("Read
    a global by its name, without declaring it. Publics are found last, so a
    :DECLARE, :PARAMETERS entry, or caller variable with the same name hides
    the global. Declaring the name is a bug, not a fix for a warning."). The
    quality bar says the same of undeclared_variable warnings on a global.
---

## Rationale

Globals are `:PUBLIC` variables, and publics are found last in variable
lookup. Declaring the name creates a local that hides the global, so the code
reads an empty string instead.

## Examples

### Good

```ssl
:PROCEDURE CurrentUser;
	:DECLARE sUser;

	sUser := MYUSERNAME;

	:RETURN sUser;
:ENDPROC;
```

### Bad

```ssl
:PROCEDURE CurrentUser;
	:DECLARE MYUSERNAME;
	:RETURN MYUSERNAME;
:ENDPROC;
```
