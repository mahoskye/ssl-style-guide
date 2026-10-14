---
id: omit_default_connection_argument
title: No connection argument for the default database
domain: sql
status: active
level: style_only
severity: info
applies_to: [server_script, class]
rule: >-
  Omit the connection argument for calls to the default database.
categories: [database]
enforced_by: [reviewer]
verification:
  basis: convention
  note: >-
    Kept from the server-script baseline ("Omit the connection argument for
    standard default-database calls"); its second sentence, on blank earlier
    slots, is skip_commas_adjacent. The review rubric's Not findings say
    that a connection the brief names does not deviate from this rule.
---

## Rationale

The default database is what a call without a connection argument uses, so
naming it adds an argument that can only go stale.

## Exceptions

A call to a named connection passes that connection.

## Examples

### Good

```ssl
:DECLARE aRows;

aRows := SQLExecute("SELECT ordno FROM ordtask");
```

### Bad

```text
:DECLARE aRows;
aRows := SQLExecute("SELECT ordno FROM ordtask", "DEFAULT");
```
