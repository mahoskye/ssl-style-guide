# Reconcile expected tests with reported measurements

Version: 1. Responsibility: workflow and reporting. Family: server script.

Inputs are `aExpected` and `aReported`, defaulting to empty arrays.

Expected rows: `{sampleKey, testKey, unit, minimum, maximum}`. Require five
columns, nonblank string keys/unit, numeric ordered bounds, and unique
normalized sample/test pairs. Invalid expectation configuration or a wrong
outer input type fails the request as `{.F., code}` before reconciliation.

Reported rows: `{sampleKey, testKey, value, unit, attempt, status}`. Require six
columns, nonblank string keys, string unit/status, and positive integral
attempts. Normalize keys, unit, and status using Upper(AllTrim). Status is
COMPLETE or VOID. COMPLETE needs a numeric value and nonblank unit. VOID's
value may be anything and unit may be blank: it withdraws an earlier result.
Malformed rows produce `{inputRow, code}` issues and do not participate.
Well-formed reports for an unexpected sample/test pair produce UNKNOWN_PAIR.

For each expected pair, choose the highest valid reported attempt. Any second
valid report with that same highest attempt makes the item CONFLICT, even when
values match. Lower-attempt conflicts do not affect a higher unique attempt.
Return items in expectation order with classifications:

- MISSING: no participating report.
- CONFLICT: highest attempt appears more than once.
- WITHDRAWN: highest unique attempt is VOID.
- UNIT_MISMATCH: latest COMPLETE unit differs from the configured unit.
- LOW/HIGH/PASS: compare the original numeric value to inclusive bounds.

Return `{.T., oReport}` with `items`, `issues`, `samples`, and `summary`:

- items: `{sample, test, classification, value, unit, attempt, sourceRow}`.
  Missing/conflict/withdrawn values are NIL. Missing/conflict units use the
  expected unit. Conflicts retain the highest attempt but sourceRow is zero.
  Missing attempt/sourceRow are zero. Withdrawn sourceRow is its VOID row.
- samples: `{sample, pass, low, high, missing, withdrawn, conflict, unitMismatch, total}`
  in first-expected-sample order.
- summary: `{expectedCount, reportedCount, participatingReportCount, pass, low,
  high, missing, withdrawn, conflict, unitMismatch, issueCount}`.

No writes, database reads, clocks, logging, or external scripts. Empty
expectations with reports return only UNKNOWN_PAIR/shape issues; both arrays
empty produce complete zero-count structures.

Acceptance covers inclusive bounds, higher-attempt replacement, withdrawal,
conflicts, irrelevant lower conflicts, unit mismatch, unknown pairs, malformed
rows, duplicate normalized expectations, empty inputs, and prefix-distinct keys.

Staged review: complete contract; expectation validation; report preparation;
selection/conflict rules; classification; per-sample and overall summaries.
