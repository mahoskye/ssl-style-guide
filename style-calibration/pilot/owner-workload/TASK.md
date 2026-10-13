# Summarize an owner's workload

Version: 1. Responsibility: read and transform. Family: SSL data source.

Input `sOwner` defaults to `""`. Require a nonblank string, trimmed and
uppercased before querying. Invalid input returns NIL without a query.

Read the synthetic `calibration_item` table: `owner_key`, `status`, and
`priority`. Query grouped row counts by status and priority for exactly one
owner. The query returns columns `{status, priority, item_count}`; status is
a non-null string and counts/priority are non-null numeric values.

Return one object with properties `owner`, `pending`, `active`, `complete`,
`other`, `highPriority`, and `total`. Recognized statuses are PENDING, ACTIVE,
and COMPLETE. Count every other status in `other`. `highPriority` counts
pending/active items with priority >= 5. Empty results produce zero counts.
Database exceptions propagate; this read-only boundary cannot recover them.

Acceptance fixture for A: two PENDING at priority 5, one PENDING at priority 1,
one ACTIVE at priority 6, three COMPLETE, and one HOLD. Expect pending=3,
active=1, complete=3, other=1, highPriority=3, total=8. Owner with no rows
returns a populated object containing zeros. Invalid owner returns NIL.

Review: inline transformation versus helpers, result ownership, exact matching,
and how much validation a documented query result contract warrants.
