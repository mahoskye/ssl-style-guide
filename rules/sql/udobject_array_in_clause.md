---
id: udobject_array_in_clause
title: Expand only a local array in IN
domain: sql
status: active
level: authoritative
severity: warning
applies_to: [server_script, class, ssl_data_source]
rule: >-
  Expand only a local array in `IN (?aValues?)`: a UDObject array property
  expanded directly raises a runtime error, so copy it to a local first.
categories: [database]
related_elements: [SQLExecute]
enforced_by: [lsp:diag.udobject_array_in_clause]
verification:
  basis: reference
  note: >-
    Kept from the agent guide's UDObject array property caveat and the
    refactor skill ("ensure the array is a local variable - UDObject array
    properties cause a runtime error and must be copied to a local first").
    Merged: the review skill's sql check, the agent guide's SQL guidance #3,
    and the exception noted on sql_in_clause_array_expansion. Scalar
    UDObject properties are not affected.
---

## Rationale

`SQLExecute` expands a local array into one bound value per element. An array
reached through a UDObject property fails with "The current array has more
than 1 dimmension." when it runs.

## Exceptions

A scalar property such as `?oUser:ID?` binds normally.

## Examples

### Good

```ssl
:PROCEDURE ReadSamples;
	:PARAMETERS oFilter;
	:DECLARE aStatusCodes, aRows;

	aStatusCodes := oFilter:statusCodes;
	aRows := SQLExecute("SELECT ordno FROM ordtask WHERE status IN (?aStatusCodes?)");

	:RETURN aRows;
:ENDPROC;
```

### Bad

```ssl
:PROCEDURE ReadSamples;
	:PARAMETERS oFilter;
	:DECLARE aRows;
	aRows := SQLExecute("SELECT ordno FROM ordtask WHERE status IN (?oFilter:statusCodes?)");
	:RETURN aRows;
:ENDPROC;
```
