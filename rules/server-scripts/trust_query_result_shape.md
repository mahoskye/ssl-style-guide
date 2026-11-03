---
id: trust_query_result_shape
title: Trust the shape your own query defines
domain: server-scripts
status: active
level: style_only
severity: warning
applies_to: [server_script, class]
rule: >-
  Do not check the column count, the column types or the presence of fields
  that your own query selects; check only what the database can vary: no
  rows, more rows than the code assumes, and NULL in a nullable column.
categories: [simplicity, database]
machine: { list: must_follow }
related_elements: [SQLExecute, LSearch, LSelect, GetDataSet, ALen, LimsTypeEx]
enforced_by: [reviewer]
verification:
  basis: convention
  note: >-
    From program decision 0002 and the user's review of the ssl-tidy runs on
    a sequencing project (2026-10-21), where checks on the shape of rows
    selected by the same procedure were common.
---

## Rationale

The SELECT list fixes how many columns each row has and what they hold. A
check that a row from `SELECT plate_id FROM ...` has one column checks the
query against itself. What the database decides at run time is how many rows
come back and whether a nullable column holds a value; those are worth
handling.

## Exceptions

A result whose columns are not fixed by the code that reads it, such as
`SELECT *` or a query built elsewhere and passed in, is input from outside
and is checked once where it is received.

## Examples

### Good

```ssl
:PROCEDURE LoadPlateIds;
	:PARAMETERS nRunId;
	:DECLARE aIds, aRows, i;

	aRows := SQLExecute("SELECT plate_id FROM run_plates WHERE run_id = ?nRunId?");
	aIds := {};

	:FOR i := 1 :TO ALen(aRows);
		AAdd(aIds, aRows[i, 1]);
	:NEXT;

	:RETURN aIds;
:ENDPROC;
```

### Bad

```ssl
:PROCEDURE LoadPlateIds;
	:PARAMETERS nRunId;
	:DECLARE aIds, aRows, i;

	aRows := SQLExecute("SELECT plate_id FROM run_plates WHERE run_id = ?nRunId?");
	aIds := {};

	:IF LimsTypeEx(aRows) != "ARRAY";
		:RETURN aIds;
	:ENDIF;

	:FOR i := 1 :TO ALen(aRows);
		:IF LimsTypeEx(aRows[i]) == "ARRAY" .AND. ALen(aRows[i]) >= 1;
			AAdd(aIds, aRows[i, 1]);
		:ENDIF;
	:NEXT;

	:RETURN aIds;
:ENDPROC;
```

## Notes

In the Bad example both checks restate the query: a SELECT returns an array
of rows, and each row has the one column it selected. An empty result
already loops zero times.
