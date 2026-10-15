---
id: sql_in_clause_array_expansion
title: Build dynamic IN clauses from arrays, not by hand
domain: sql
status: active
level: advisory
severity: warning
applies_to: [server_script, class, ssl_data_source]
rule: >-
  Use `PrepareArrayForIn` or `SQLExecute` array expansion for dynamic `IN`
  clauses when appropriate; do not build an `IN` clause by hand when a safer
  array helper or parameter array is available.
categories: [sql]
machine: { list: must_follow }
related_elements: [SQLExecute, PrepareArrayForIn, BuildStringForIn]
enforced_by: [reviewer]
verification:
  basis: reference
  note: >-
    Kept from the sql pack, which stated it as a must-follow item and again
    as an avoid item ("Do not build an IN clause by hand when a safer array
    helper or parameter array is available."); merged here. The agent
    guide's SQL guidance #3 says the same.
---

## Rationale

`SQLExecute` expands an array in an `IN (?aValues?)` marker into one bound
value per element, so the values never become SQL text. A hand-built list
concatenates values into the statement, with the same injection and quoting
problems as any other concatenation.

## Exceptions

Expand only a local variable. A UDObject array property used directly in the
marker raises a runtime error; copy it to a local first.

## Examples

### Good

```ssl
:DECLARE aStatuses, aRows;

aStatuses := {"Logged", "Done"};
aRows := SQLExecute("SELECT ordno FROM ordtask WHERE status IN (?aStatuses?)");
```

### Bad

```ssl
:DECLARE aStatuses, sList, aRows;
aStatuses := {"Logged", "Done"};
sList := "'" + aStatuses[1] + "','" + aStatuses[2] + "'";
aRows := SQLExecute("SELECT ordno FROM ordtask WHERE status IN (" + sList + ")");
```
