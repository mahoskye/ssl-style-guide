---
id: prevent_sql_injection
title: Bind values with placeholders, never concatenate them into SQL
domain: sql
status: active
level: advisory
severity: warning
applies_to: [server_script, class, ssl_data_source]
rule: >-
  Prefer parameterized database calls; do not concatenate user or runtime
  values into SQL when placeholders can bind them.
categories: [database, strings]
machine: { list: must_follow }
related_elements: [SQLExecute, RunSQL, LSearch, LSelect1, GetDataSet]
enforced_by: [lsp:diag.sql_injection]
schema:
  - path: lints.security.prevent_sql_injection
    form: value
    value: true
  - path: lints.security.parameterized_queries_required
    form: value
    value: true
  - path: security_best_practices.sql_injection_prevention.always_use_parameters
    form: value
    value: true
verification:
  basis: reference
  note: >-
    Kept from the database pack, which stated it as a must-follow item
    ("Prefer parameterized database calls.") and again as an avoid item
    ("Do not concatenate user or runtime values into SQL when placeholders
    can bind them."); merged here. The agent boundaries say the same
    ("Parameterize every value"). The schema's security flags are verified.
    Also merged: the strings pack's avoid item "Do not use string
    concatenation for SQL values when parameterization is available.".
---

## Rationale

A value concatenated into SQL text becomes part of the statement, so a quote
in the value changes what the statement does. A placeholder passes the value
separately and the database never parses it as SQL. Placeholders also keep the
statement text stable, which the formatter and the parameter checks rely on.

## Exceptions

Fixed fragments chosen by the code itself (a column name picked from a closed
list, for example) are not values and may be concatenated. Never concatenate
anything a user or another system supplied.

## Examples

### Good

```ssl
:DECLARE sOrdNo, aRows;

sOrdNo := "A1001";
aRows := SQLExecute("SELECT testcode FROM ordtask WHERE ordno = ?sOrdNo?");
```

### Bad

```ssl
:DECLARE sOrdNo, aRows;
sOrdNo := "A1001";
aRows := SQLExecute("SELECT testcode FROM ordtask WHERE ordno = '" + sOrdNo + "'");
```

## Notes

The strings pack ("Do not use string concatenation for SQL values when
parameterization is available.") and the security pack ("Prefer parameterized
SQL over string concatenation.") restate this rule. Those packs are not
generated yet, so their wording stays until they are migrated.
