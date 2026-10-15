---
id: sql_insert_layout
title: INSERT column and VALUES lists use block-style parentheses
domain: sql
status: active
level: style_only
severity: info
applies_to: [embedded_sql, sql_data_source]
rule: >-
  In `INSERT`, put the opening `(` on the `INSERT INTO` line, indent the
  columns 4 spaces, and put the closing `)` on its own line; lay out `VALUES`
  the same way.
categories: [sql]
related_elements: [RunSQL]
enforced_by: [lsp:fmt.sql_in_strings]
schema:
  - path: sql.formatting.statement_patterns.insert.parens
    form: value
    value: opening ( on INSERT INTO line; closing ) on own line
  - path: sql.formatting.statement_patterns.insert.columns
    form: value
    value: indented 4 inside parens
  - path: sql.formatting.statement_patterns.insert.values
    form: value
    value: same block-style parens as column list
verification:
  basis: convention
  note: >-
    Kept from the ssl-format skill's INSERT bullets and the agent guide's
    INSERT paragraph; the schema and the compact reference say the same.
    Matches formatter output at the pinned LSP.
---

## Rationale

Block-style parentheses keep the column list and the value list the same
shape, so the nth column and the nth value line up when you compare them.

## Examples

### Good

```ssl
:DECLARE sOrdNo, sTestCode;

sOrdNo := "A1001";
sTestCode := "PH";
RunSQL("
    INSERT INTO ordtask (
        ordno, testcode, status
    )
    VALUES (
        ?, ?, 'Logged'
    )
",, {sOrdNo, sTestCode});
```

### Bad

```ssl
:DECLARE sOrdNo, sTestCode;
sOrdNo := "A1001";
sTestCode := "PH";
RunSQL("
    INSERT INTO ordtask (ordno, testcode, status)
    VALUES (?, ?, 'Logged')
",, {sOrdNo, sTestCode});
```
