---
id: sql_merge_layout
title: Layout of an existing MERGE
domain: sql
status: active
level: style_only
severity: info
applies_to: [embedded_sql, sql_data_source]
rule: >-
  When formatting an existing `MERGE`, put `ON` at column 0 (not indented
  under `USING`), indent the `AND` of a multi-line `ON` condition 4 spaces
  (under the first condition inside the parentheses), indent `UPDATE SET`,
  `INSERT` and `DELETE WHERE` 4 spaces under their `WHEN`, end the
  `UPDATE SET` line at `SET` with each assignment on its own line 4 spaces
  further in (as in a plain `UPDATE`), keep `DELETE WHERE` on one line with
  each `AND`/`OR` of its condition on its own line 4 spaces further in, and
  give the `INSERT` block-style parentheses.
categories: [sql]
related_elements: [RunSQL, SQLExecute]
enforced_by: [lsp:fmt.sql_in_strings]
schema:
  - path: sql.formatting.statement_patterns.merge.on
    form: value
    value: column 0 (not indented under USING)
  - path: sql.formatting.statement_patterns.merge.on_and
    form: value
    value: indented 4 (aligned under first condition inside parens)
  - path: sql.formatting.statement_patterns.merge.update_set
    form: value
    value: indented 4 under WHEN MATCHED; SET ends its line, each assignment on its own line indented 4 under UPDATE SET
  - path: sql.formatting.statement_patterns.merge.insert
    form: value
    value: indented 4 under WHEN NOT MATCHED; block-style parens
  - path: sql.formatting.statement_patterns.merge.delete_where
    form: value
    value: indented 4 under WHEN MATCHED; DELETE WHERE on one line, each AND/OR on its own line indented 4 under DELETE
verification:
  basis: convention
  note: >-
    Merged from the ssl-format skill's four MERGE bullets and the schema's
    merge patterns. #123 set the UPDATE SET layout to match a plain UPDATE.
    starlims-lsp v0.26.0 formats a MERGE in an SSL string this way,
    including the INSERT and VALUES block layout and the UPDATE SET
    assignments. From v0.27.0 it also keeps DELETE WHERE on one line under
    its WHEN, with each AND/OR one level past the DELETE, so the whole layout
    is formatter-applied; the examples include a DELETE WHERE.
issues: ["#123"]
---

## Rationale

In `MERGE`, `ON` is a clause of the statement, not of `USING`, so it starts
at column 0 like the other clauses. The actions under each `WHEN` indent one
level, the way `THEN` values do. `UPDATE SET` lays out like a plain `UPDATE`,
so each assignment is easy to see and to edit.

## Exceptions

Agents do not write `MERGE` (see `sql_basic_sql_only`). This layout is for
formatting `MERGE` statements that already exist.

## Examples

### Good

```ssl
:DECLARE sOrdNo, sStatus;

sOrdNo := "A1001";
sStatus := "Done";
SQLExecute("
    MERGE INTO ordtask t
    USING (
        SELECT ?sOrdNo? AS ordno, ?sStatus? AS status
        FROM dual
    ) s
    ON (t.ordno = s.ordno
        AND t.status <> s.status
        AND t.department_code = s.department_code)
    WHEN MATCHED THEN
        UPDATE SET
            t.status = s.status,
            t.changed_on = SYSDATE
        DELETE WHERE t.status = 'Cancelled'
            AND t.changed_on < SYSDATE - 30
    WHEN NOT MATCHED THEN
        INSERT (
            ordno, status
        )
        VALUES (
            s.ordno, s.status
        )
");
```

### Bad

```ssl
:DECLARE sOrdNo, sStatus;

sOrdNo := "A1001";
sStatus := "Done";
SQLExecute("MERGE INTO ordtask t USING (SELECT ?sOrdNo? AS ordno, ?sStatus? AS status FROM dual) s ON (t.ordno = s.ordno AND t.status <> s.status AND t.department_code = s.department_code) WHEN MATCHED THEN UPDATE SET t.status = s.status, t.changed_on = SYSDATE DELETE WHERE t.status = 'Cancelled' AND t.changed_on < SYSDATE - 30 WHEN NOT MATCHED THEN INSERT (ordno, status) VALUES (s.ordno, s.status)");
```
