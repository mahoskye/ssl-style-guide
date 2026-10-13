# User-run SSL test fixtures

All SSL tests are locally unexecuted. Static validation establishes syntax and
diagnostic conformance, not behavior. Install the draft implementations and
their test scripts in a disposable STARLIMS development category named
`Calibration`, then invoke each test script or its `RunTests` procedure.
Installation and execution are performed by the user.

NormalizeKey, ResultPolicy, IntakePlan, and ReconcileResults tests use only
in-memory values. They need no database records. Each returns `{label, passed}`
case results and logs the total. The array comparator uses exact equality and
checks shape/type before recursion.

PendingItems and OwnerWorkload require the following synthetic fixture. Do not
point them at an unrelated deployment table. The tests read this table and do
not create, insert, update, or delete fixture records.

Table `calibration_item`:

| Column | Contract |
| --- | --- |
| item_id | Unique non-null string |
| owner_key | Non-null string, normalized uppercase |
| status | Non-null string |
| priority | Non-null numeric value |

Use exactly these rows for the supplied tests:

| item_id | owner_key | status | priority |
| --- | --- | --- | ---: |
| A1 | A | PENDING | 5 |
| A2 | A | PENDING | 5 |
| A3 | A | PENDING | 1 |
| A4 | A | ACTIVE | 6 |
| A5 | A | COMPLETE | 4 |
| A6 | A | COMPLETE | 4 |
| A7 | A | COMPLETE | 4 |
| A8 | A | HOLD | 2 |

There must be no rows for owner `EMPTY` or an empty owner. The query-only tests
also assume the test connection can read this table. A database/configuration
failure remains an execution failure and must not be mistaken for an empty
result. The samples deliberately do not suppress such failures.
