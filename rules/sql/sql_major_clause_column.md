---
id: sql_major_clause_column
title: Major clauses start at column 0 of the SQL block
domain: sql
status: active
level: style_only
severity: info
applies_to: [embedded_sql, sql_data_source]
rule: >-
  Start each major clause at column 0 relative to the 4-space indent:
  `SELECT`, `FROM`, `WHERE`, `INNER JOIN`, `LEFT OUTER JOIN`,
  `RIGHT OUTER JOIN`, `FULL OUTER JOIN`, `CROSS JOIN`, `GROUP BY`, `ORDER BY`,
  `UNION`, `UNION ALL`, `INTERSECT`, `MINUS`, `INSERT INTO`, `VALUES`,
  `UPDATE`, `DELETE FROM`, `MERGE INTO`, `USING`, `WHEN MATCHED THEN`,
  `WHEN NOT MATCHED THEN`, `START WITH`, `CONNECT BY`, `PIVOT`, `UNPIVOT`,
  `FOR UPDATE`, `RETURNING`.
categories: [sql]
related_elements: [SQLExecute, RunSQL]
enforced_by: [lsp:fmt.sql_in_strings]
schema:
  - path: sql.formatting.indentation.major_clauses
    form: value
    value: 0
verification:
  basis: convention
  note: >-
    Kept from the ssl-format skill's clause list, with the set operators
    (UNION, UNION ALL, INTERSECT, MINUS) added from the schema's
    major_clause_list and the agent guide's quick reference, which names
    UNION. Matches formatter output at the pinned LSP.
---

## Rationale

Clauses at a fixed column make a query's shape visible at a glance: each line
that starts at column 0 begins a new clause, and everything indented belongs
to the clause above it.

## Examples

### Good

```ssl
:DECLARE sStatus, aRows;
sStatus := "Logged";
aRows := SQLExecute("
    SELECT ordno, testcode
    FROM ordtask
    WHERE status = ?sStatus?
    ORDER BY ordno
");
```

### Bad

```ssl
:DECLARE sStatus, aRows;
sStatus := "Logged";
aRows := SQLExecute("
    SELECT ordno, testcode
      FROM ordtask
     WHERE status = ?sStatus?
     ORDER BY ordno
");
```

## Notes

The schema's `major_clause_list` (reference data, not generated from this
record) also lists `ORDER SIBLINGS BY`.
