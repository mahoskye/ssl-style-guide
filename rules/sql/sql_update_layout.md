---
id: sql_update_layout
title: UPDATE keeps SET on its line and indents the assignments
domain: sql
status: active
level: style_only
severity: info
applies_to: [embedded_sql, sql_data_source]
rule: >-
  In `UPDATE`, keep `SET` on the `UPDATE` line and indent the assignments 4
  spaces below it.
categories: [sql]
related_elements: [RunSQL]
enforced_by: [lsp:fmt.sql_in_strings]
schema:
  - path: sql.formatting.statement_patterns.update.set
    form: value
    value: on same line as UPDATE
  - path: sql.formatting.statement_patterns.update.assignments
    form: value
    value: indented 4 under UPDATE SET
verification:
  basis: convention
  note: >-
    Kept from the ssl-format skill's UPDATE bullets and the agent guide's
    UPDATE paragraph; the schema and the compact reference say the same.
    Matches formatter output at the pinned LSP.
---

## Rationale

One assignment per line, indented under `UPDATE ... SET`, makes the list of
changed columns easy to scan and to diff.

## Examples

### Good

```ssl
:DECLARE sOrdNo, sStatus;

sOrdNo := "A1001";
sStatus := "Done";
RunSQL("
    UPDATE ordtask SET
        status = ?,
        testcode = 'PH'
    WHERE ordno = ?
",, {sStatus, sOrdNo});
```

### Bad

```ssl
:DECLARE sOrdNo, sStatus;
sOrdNo := "A1001";
sStatus := "Done";
RunSQL("
    UPDATE ordtask
    SET status = ?, testcode = 'PH'
    WHERE ordno = ?
",, {sStatus, sOrdNo});
```
