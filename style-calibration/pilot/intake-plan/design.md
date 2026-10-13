# IntakePlan design, task version 1

## Logic

Entry point: validate outer inputs, build a request with normalized material,
test, and existing-key registries, then process input rows in order. For each
row, prepare a validated normalized candidate or append its issue. Check
cross-row uniqueness and container invariants before accepting the candidate.
Finally expose accepted rows, issues, container allocations, owner workload,
and aggregate counts. All state belongs to one request object.

BuildRequest: allocate empty request collections. Validate material rules,
then test rules against installed materials, then existing records. Return a
stable request-level code on failure; discard partial state by not returning it.

LoadMaterials: validate each rule's shape, key, types, bounds, and uniqueness.
LoadTests: validate shape, key, material, volume, uniqueness, and material lookup.
LoadExisting: validate pair shape and normalize sample/container keys. Duplicate
existing keys are harmless and remain evidence of occupancy.

PrepareRow: establish shape and all column types before indexing/operations.
Normalize strings, require material and volume bounds, and validate priority.
PrepareTests: normalize requested tests, reject duplicates and incompatible or
missing rules, and accumulate required volume. Produce a candidate object.

CheckCandidate: reject existing/accepted sample keys and occupied containers.
For a new request-local container, require demand <= supplied volume. For an
existing request-local container, also require identical material/volume and
combined demand <= available volume. Rejected candidates do not mutate state.

AcceptCandidate: append the normalized accepted row, update its container
allocation, then update owner workload. AddContainer/AddOwner initialize all
fields. FindRule/FindContainer/FindOwner return a 1-based index or zero. They
operate only on prepared internal structures and do not repeat caller checks.

BuildPlan: expose the requested collections and calculate summary from them.
No transaction or error catch is required for this deterministic planning task.

## SSL Vocabulary

Verified using ssl-reference MCP signatures:

- `LimsTypeEx(vSource)`
- `Len(vSource)`
- `AllTrim(sSource)`
- `Upper(sSource)`
- `AAdd(aTarget, vElement)`
- `AScanExact(aTarget, vValueOrBlock, [nStart], [nCount])`
- `Round(nValue, nDigits, [sMidPointRounding])`
- `CreateUdObject()`

Constructs: PARAMETERS, DEFAULT, DECLARE, PROCEDURE, IF/ELSE/ENDIF, FOR/TO/NEXT,
RETURN, ENDPROC, exact ==, NIL, object colon properties, arrays, and 1-based
indexing. Local procedure dispatch is DoProc with an argument array; its
verified signature is retained in the shared vocabulary record.
