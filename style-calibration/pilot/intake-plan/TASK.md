# Plan a multi-row intake without changing persisted records

Version: 1. Responsibility: workflow coordination. Family: server script.

Inputs:

- `aRows`: rows `{sampleKey, containerKey, material, volume, priority, owner, tests}`.
- `aMaterials`: rules `{material, minimumVolume, maximumVolume}`.
- `aTests`: rules `{testKey, material, requiredVolume}`.
- `aExisting`: previously registered `{sampleKey, containerKey}` pairs.

Configuration and existing-record inputs must be arrays. Rules require unique
normalized keys, nonblank strings, numeric nonnegative volumes, and ordered
material bounds. Test rules must refer to a configured material. Invalid
configuration fails the entire request with `{.F., code}` before row processing.
An invalid outer aRows type also fails the request. Defaults are empty arrays.

Each input row is independent except for shared containers and uniqueness:

- Require exactly seven columns. Keys/material/owner are nonblank strings,
  normalized with Upper(AllTrim). Volume is numeric and within material bounds.
- Priority is an integer 0..9. Tests are a nonempty array of nonblank strings.
  Normalize tests, reject duplicates, and require configured tests compatible
  with the material. Sum their required volumes.
- Reject sample keys already registered or already accepted in this request.
  Reject previously registered containers. A rejected row does not reserve keys.
- A new container can be shared only with the same material and declared volume.
  Total required volume of accepted rows cannot exceed its declared volume.
- Continue after rejected rows, retaining original input order and row indexes.

Return `{.T., oPlan}` even when individual rows fail. The plan has `accepted`,
`issues`, `containers`, `owners`, and `summary` properties:

- accepted: normalized seven-column rows, prefixed with source row index.
- issues: `{rowIndex, stableCode}` pairs.
- containers: `{containerKey, material, availableVolume, requiredVolume, sampleKeys}`.
- owners: `{ownerKey, totalSamples, urgentSamples, sampleKeys}`, urgent priority >= 5.
- summary: `{inputCount, acceptedCount, rejectedCount, containerCount, ownerCount}`.

No database calls, logs, clocks, writes, random values, or external scripts.
Return complete zero-count structures for empty rows. Determinism permits
direct user-run SSL tests and makes the complete script reviewable in isolation.

Acceptance scenarios: compatible shared containers; volume exhaustion;
duplicate keys/tests; unknown/incompatible tests; invalid config; malformed
rows; first rejected row followed by a valid row with its key; existing sample
or container conflicts; owner/urgent totals; and empty input.

Staged review: overall result contract; configuration ownership; row preparation;
cross-row checks; plan assembly and summaries. Determine which helper boundaries
help a maintainer and which could be reduced.
