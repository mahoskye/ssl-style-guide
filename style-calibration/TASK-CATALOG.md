# Initial purpose-built tasks

These independent tasks represent a range of responsibilities. Scale labels
describe intended complexity; final measured length belongs in the run report.
They are new neutral scenarios, not rewritten snapshot scripts.

| ID | Scale | Family | Responsibility | Review focus |
| --- | --- | --- | --- | --- |
| normalize-key | Focused | Server script | Normalize an optional identifier | How little structure and documentation is sufficient? |
| pending-items | Focused | SQL data source | Parameterized read-only listing | SQL layout, parameter meaning, and empty results |
| owner-workload | Medium | SSL data source | Query and summarize an owner's workload | Boundary checks, query/result contracts, and useful comments |
| result-policy | Medium | SSL class | Evaluate results using configured limits | Fields, cohesive methods, validation ownership, and documentation |
| intake-plan | Substantial | Server script | Validate and plan a multi-row intake | Staged workflow, row failures, duplicates, and helper boundaries |
| reconcile-results | Substantial | Server script | Reconcile expected tests with reported measurements | Multiple responsibilities, grouping, conflicts, and summaries |

Review focused tasks first, then medium tasks, then substantial tasks. For each
substantial task, review the complete contract and design before reviewing
input validation, processing, and result assembly as separate sections.

The snapshot's longest scripts remain part of the survey even if a purpose-built
implementation meets its requirements in fewer lines. Do not add responsibilities
or duplicate code merely to make a pilot hit 1,000 or 2,000 lines.
