---
id: parse_delimited_input_locally
title: Parse simple delimited input in SSL
domain: server-scripts
status: active
level: style_only
severity: info
applies_to: [server_script, class]
rule: >-
  Parse simple delimited input locally with helpers such as `BuildArray`
  when the rules depend only on element count, emptiness, length or exact
  text; normalize entries before validating and keeping the canonical list,
  and treat empty input or a normalization failure as no preference when the
  list is only an optional selection hint. Do not add a database dependency
  solely to split or validate text.
categories: [strings]
related_elements: [BuildArray]
enforced_by: [reviewer]
verification:
  basis: convention
  note: >-
    Kept from the server-script baseline's first SQL bullet, joined into one
    statement.
---

## Rationale

Splitting and checking text needs nothing from the database. A query used only
for that adds a dependency, a round trip and a failure mode.

## Examples

### Good

```ssl
:PROCEDURE ParseCodes;
	:PARAMETERS sCodes;
	:DECLARE aCodes;
	aCodes := BuildArray(AllTrim(sCodes));
	:RETURN aCodes;
:ENDPROC;
```

### Bad

```text
:PROCEDURE ParseCodes;
	:PARAMETERS sCodes;
	:RETURN SQLExecute("SELECT value FROM STRING_SPLIT(?sCodes?, ',')");
:ENDPROC;
```
