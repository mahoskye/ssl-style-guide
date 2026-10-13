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
  `INSERT` and `DELETE WHERE` 4 spaces under their `WHEN`, and give the
  `INSERT` block-style parentheses.
categories: [sql]
related_elements: [RunSQL]
enforced_by: [reviewer]
schema:
  - path: sql.formatting.statement_patterns.merge.on
    form: value
    value: column 0 (not indented under USING)
  - path: sql.formatting.statement_patterns.merge.on_and
    form: value
    value: indented 4 (aligned under first condition inside parens)
  - path: sql.formatting.statement_patterns.merge.update_set
    form: value
    value: indented 4 under WHEN MATCHED
  - path: sql.formatting.statement_patterns.merge.insert
    form: value
    value: indented 4 under WHEN NOT MATCHED; block-style parens
verification:
  basis: convention
  note: >-
    Merged from the ssl-format skill's four MERGE bullets and the schema's
    merge patterns. The formatter at the pinned LSP matches the ON, AND and
    WHEN indents but keeps the INSERT column list inline and puts VALUES at
    column 0, so a reviewer applies the INSERT part.
---

## Rationale

In `MERGE`, `ON` is a clause of the statement, not of `USING`, so it starts
at column 0 like the other clauses. The actions under each `WHEN` indent one
level, the way `THEN` values do.

## Exceptions

Agents do not write `MERGE` (see `sql_basic_sql_only`). This layout is for
formatting `MERGE` statements that already exist.

## Examples

### Good

```text
MERGE INTO ordtask t
USING (
    SELECT ? AS ordno, ? AS status
    FROM dual
) s
ON (t.ordno = s.ordno
    AND t.status <> s.status)
WHEN MATCHED THEN
    UPDATE SET t.status = s.status
WHEN NOT MATCHED THEN
    INSERT (
        ordno, status
    )
    VALUES (
        s.ordno, s.status
    )
```

### Bad

```text
MERGE INTO ordtask t
USING (SELECT ? AS ordno, ? AS status FROM dual) s
  ON (t.ordno = s.ordno AND t.status <> s.status)
WHEN MATCHED THEN UPDATE SET t.status = s.status
WHEN NOT MATCHED THEN INSERT (ordno, status) VALUES (s.ordno, s.status)
```
