---
id: sql_optimizer_hints
title: Optimizer hints stay after their action keyword
domain: sql
status: active
level: style_only
severity: warning
applies_to: [embedded_sql, sql_data_source]
rule: >-
  Keep an optimizer hint (`/*+ HINT */`) immediately after its action keyword;
  never remove or reformat a hint without understanding its purpose.
categories: [sql]
related_elements: [SQLExecute]
enforced_by: [reviewer]
schema:
  - path: sql.formatting.statement_patterns.optimizer_hints.position
    form: value
    value: immediately after action keyword
  - path: sql.formatting.statement_patterns.optimizer_hints.note
    form: value
    value: never strip without understanding purpose
verification:
  basis: convention
  note: >-
    Merged from the ssl-format skill ("stays immediately after the action
    keyword"; "Never remove or reformat hints") and the agent guide and
    schema ("never strip without understanding the purpose"). The formatter
    at the pinned LSP keeps a hint in place.
---

## Rationale

A hint only works directly after `SELECT`, `INSERT`, `UPDATE`, `DELETE` or
`MERGE`; anywhere else it is an ordinary comment. Hints are usually there to
fix a measured performance problem, so removing one can bring that problem
back.

## Examples

### Good

```ssl
:DECLARE sStatus, aRows;

sStatus := "Logged";
aRows := SQLExecute("
    SELECT /*+ INDEX(t ix_status) */ ordno
    FROM ordtask t
    WHERE status = ?sStatus?
");
```

### Bad

```ssl
:DECLARE sStatus, aRows;
sStatus := "Logged";
aRows := SQLExecute("
    SELECT ordno /*+ INDEX(t ix_status) */
    FROM ordtask t
    WHERE status = ?sStatus?
");
```
