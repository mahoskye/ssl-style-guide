# ReconcileResults design, task version 1

## Logic

Entry point: reject non-array outer inputs. Build a request with validated
normalized expectations. Process reported rows: prepare a validated candidate,
find its expected pair, and append it to that pair's candidates or append an
issue. Reconcile each expectation, classify the highest-attempt selection,
append its output item, and update sample and total counts. Return report.

BuildRequest / LoadExpectations: initialize every collection/count, validate
five-column rows before indexing, normalize strings, check numeric ordered
bounds and exact pair uniqueness. Maintain one candidate list per expectation.

PrepareReport: establish six-column shape, key/unit/status types, positive
integral attempt, known status, and COMPLETE-only value/unit requirements.
Return a candidate or row issue. VOID deliberately skips measurement checks.

FindExpectation: compare sample and test independently with exact equality.
No concatenated composite key that could collide on a delimiter.

SelectLatest: scan all candidates, replace the selection when an attempt is
higher, and mark a conflict on an equal highest attempt. A still-higher unique
attempt clears an earlier conflict. Preserve the original input row.

ClassifySelection: missing first, then highest-attempt conflict, then VOID,
then unit mismatch, then compare numeric value to inclusive bounds. Produce
the requested seven-column item with stable NIL/zero conventions.

RecordClassification: update counts on one request-owned summary and on the
appropriate per-sample object. BuildReport projects internal state into the
specified arrays. Helpers receive internal validated contracts and do not
repeat input validation.

No catches or transaction boundaries are needed for this pure reconciliation.
The complete implementation is a review draft, not an accepted profile.

## SSL Vocabulary

Verified using ssl-reference MCP signatures:

- `LimsTypeEx(vSource)`
- `Len(vSource)`
- `AllTrim(sSource)`
- `Upper(sSource)`
- `Round(nValue, nDigits, [sMidPointRounding])`
- `AAdd(aTarget, vElement)`
- `CreateUdObject()`
- `DoProc(sProcedureName, [aArguments])`

Constructs: PARAMETERS, DEFAULT, DECLARE, PROCEDURE, IF/ELSE/ENDIF,
BEGINCASE/CASE/OTHERWISE/EXITCASE/ENDCASE, FOR/TO/NEXT, RETURN, ENDPROC,
NIL, exact ==, object colon properties, and 1-based array indexing.
