---
id: multi_line_comment_layout
title: Multi-line comment layout
domain: language
status: active
level: style_only
severity: info
applies_to: [server_script, class, ssl_data_source]
rule: >-
  Lay out a multi-line comment with `/*` alone on the first line, then the
  text lines, then `;` alone on the last line.
categories: [formatting]
enforced_by: [reviewer]
schema:
  - path: comments.rules
    form: rule_text
    message: >-
      Multi-line layout: /* alone on the first line, the text lines, then ;
      alone on the last line (examples.multi_line). The language accepts any
      layout, since the comment simply ends at the first semicolon, but use
      this one for new comments. The documentation_header form follows it,
      with ' * ' line prefixes. The file banner and procedure_headers
      templates carry the delimiters on their star rules instead.
verification:
  basis: convention
  note: Kept from the schema's comments.rules entry, shortened to its rule; the schema keeps the full text.
---

## Rationale

The language accepts any layout, because the comment ends at the first
semicolon. Putting the delimiters on their own lines makes the start and end
of a long comment easy to find.

## Exceptions

The file banner and procedure header templates carry the delimiters on their
star rules.

## Examples

### Good

```ssl
/*
Recalculate the totals before the report runs.
The report reads them without checking.
;
:DECLARE nTotal;
nTotal := 0;
```

### Bad

```ssl
/* Recalculate the totals before the report runs.
The report reads them without checking.;
:DECLARE nTotal;
nTotal := 0;
```
