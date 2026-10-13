---
id: invariant_date_handling
title: Be explicit about invariant date columns
domain: language
status: active
level: advisory
severity: info
applies_to: [server_script, class]
rule: >-
  Be explicit about invariant/local date handling when database result
  materialization depends on it.
categories: [dates]
machine: { list: must_follow }
related_elements: [SQLExecute, GetDataSet, LSelect1]
enforced_by: [reviewer]
verification:
  basis: convention
  note: Kept from the dates pack, which states it word for word.
---

## Rationale

The database functions take an `aInvariantDateCols` argument that decides how
date columns come back. Leaving it to the default makes the result depend on
server settings the reader cannot see.

## Examples

### Good

```ssl
:DECLARE aRows;
/* LOGDATE is compared across sites, so read it as an invariant date;
aRows := SQLExecute("SELECT ordno, logdate FROM orders",,,, {"LOGDATE"});
```

### Bad

```text
aRows := SQLExecute("SELECT ordno, logdate FROM orders");
```

The caller then compares `LOGDATE` across sites without saying which date
handling it relies on.
