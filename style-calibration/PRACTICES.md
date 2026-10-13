# Practice decisions

No practices have been accepted through this exercise yet. Existing schema and
agent guidance remain authoritative. Candidate topics below are review prompts,
not new rules.

| Candidate | Question to resolve | Potential enforcement |
| --- | --- | --- |
| Proportional structure | When does a helper improve ownership or readability? | Planner and reviewer |
| Boundary validation | Which checks establish a contract, and which repeat it? | Planner and reviewer |
| Error handling | Which failure can this boundary meaningfully handle? | Reviewer; narrow diagnostics only if deterministic |
| Documentation size | What information does a future maintainer need here? | Reviewer; formatting for accepted layout |
| Visual grouping | When do regions or blank lines aid navigation? | Formatter where mechanically specified |
| Names and result shape | What does the caller need to understand or consume? | Reviewer and existing naming diagnostics |

## Record one decision

- ID and state: proposed / accepted / rejected / superseded.
- User decision and revision record:
- Principle and rationale:
- Applicable file kinds, responsibilities, and scales:
- Preferred purpose-built example and version:
- Counterexample and explanation:
- Legitimate exceptions:
- Enforcement owner: formatter / diagnostic / agent workflow / human review.
- For LSP changes: trigger, expected output, exceptions, rule code, severity,
  configuration, and positive/negative tests.
- Canonical guidance affected:
- Verification and transfer-task results:

Keep language requirements distinct from configurable style and contextual
design judgments. A reviewer must not convert a line-count observation into a
hard acceptance limit. Style acceptance and training admission are independent.
