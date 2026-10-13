---
id: sql_basic_sql_only
title: SQL written by agents stays basic
domain: sql
status: active
level: advisory
severity: warning
applies_to: [embedded_sql, sql_data_source]
rule: >-
  Keep SQL you write basic: plain `SELECT`, `INSERT`, `UPDATE` and `DELETE`
  with ordinary joins, `WHERE`, `GROUP BY` and `ORDER BY`. Do not write temp
  tables, table variables, CTEs, window functions, cursors, dynamic SQL
  assembled at runtime, `MERGE`, stored-procedure definitions, or
  control-flow blocks (`IF`, `WHILE`, `BEGIN…END`) inside a SQL string; when a
  result needs that shape, compute it in SSL across simpler queries.
categories: [sql]
related_elements: [SQLExecute, RunSQL]
enforced_by: [reviewer]
verification:
  basis: convention
  note: >-
    Kept from the "Keep SQL basic" boundary that every SSL agent includes.
    The ssl-format skill points to it from its MERGE section. The compact
    reference still lays out CTEs, window functions and MERGE, because
    existing code contains them.
---

## Rationale

STARLIMS struggles with programmatic SQL. Splitting a complex shape into
simple queries combined in SSL keeps each query easy to read, bind and check.

## Exceptions

Existing code may contain these constructs. Formatting or reviewing it is
fine; rewriting it is a separate decision.

## Examples

### Good

```ssl
:DECLARE sStatus, aRows;
sStatus := "Logged";
aRows := SQLExecute("
    SELECT ordno, COUNT(*) AS ntests
    FROM ordtask
    WHERE status = ?sStatus?
    GROUP BY ordno
");
```

### Bad

```ssl
:DECLARE sStatus, aRows;
sStatus := "Logged";
aRows := SQLExecute("
    WITH t AS (
        SELECT ordno
        FROM ordtask
        WHERE status = ?sStatus?
    )
    SELECT ordno, COUNT(*) AS ntests
    FROM t
    GROUP BY ordno
");
```

## Notes

The boundary text lives in the shared agent partial and is not a generated
region yet: the partial is expanded into every agent adapter, so a region
there would change every adapter's output.
