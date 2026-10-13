---
id: bracket_strings_for_quotes
title: Bracket strings for text with many quotes
domain: language
status: active
level: style_only
severity: info
applies_to: [server_script, class, ssl_data_source]
rule: >-
  Use bracket strings when SQL or text contains many quotes.
categories: [strings]
machine: { list: must_follow }
enforced_by: [reviewer]
verification:
  basis: convention
  note: >-
    Kept from the strings pack, which states it word for word. The agent
    guide's string literal list says the same ("useful for SQL strings
    containing quotes").
---

## Rationale

SSL strings have no escape sequences. A `[text]` literal can hold both single
and double quotes without splitting the string.

## Examples

### Good

```ssl
:DECLARE sNote;
sNote := [He said "it's ready"];
```

### Bad

```ssl
:DECLARE sNote;
sNote := "He said " + Chr(34) + "it's ready" + Chr(34);
```
