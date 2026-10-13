# OwnerWorkload design, task version 1

## Logic

Validate the owner's string type before normalization, then reject blank text.
Initialize every summary property to its empty-result value. Query grouped
counts for the normalized owner using named bound values. Accumulate status
counts, all-row total, and high-priority pending/active demand. Return the same
complete object for an empty query. Database failures propagate.

The query's output shape is established by its SELECT and synthetic table
contract. The loop consumes that internal contract without repeating validation
for each selected field. No helpers or catches are introduced solely for shape.

## SSL Vocabulary

Verified MCP signatures:

- `LimsTypeEx(vSource)`
- `AllTrim(sSource)`
- `Upper(sSource)`
- `CreateUdObject()`
- `Len(vSource)`
- `SQLExecute(sCommandString, [sConnectionName], [bRollbackExistingTransaction], [bNullAsBlank], [aInvariantDateCols], [vReturnType], [sTableName], [bIncludeSchema], [bIncludeHeader])`

Constructs: inline data-source PARAMETERS defaults, DECLARE, IF/ENDIF,
FOR/TO/NEXT, BEGINCASE/CASE/OTHERWISE/EXITCASE/ENDCASE, RETURN, exact string
comparison, 1-based arrays, and object colon properties. SQL uses SELECT,
COUNT, FROM, WHERE, GROUP BY, and a ?sOwner? value bound by SQLExecute.
