# STARLIMS style calibration

This is a review exercise for developing good practices across different kinds
and scales of SSL work. The purpose-built code here is an initial draft for
review, not an approved style exemplar or a training release.

The snapshot supplies initial guidance about scale and structural variety.
Practices develop through the user's edits, comparisons, and explanations.
Line counts describe the examples; they are not quality scores or generation
targets. A large script can be appropriate when its responsibilities justify it.

## Start here

Read [STATUS.md](STATUS.md), then [TASK-CATALOG.md](TASK-CATALOG.md).
Open [FIRST-REVIEW.md](FIRST-REVIEW.md) for the first editable examples.
The first review batch is the two focused examples. Review complete designs
before individual sections of the substantial examples.

Each task has a requirement specification, a design/vocabulary record, an
immutable initial draft, and a review worksheet. Edit a working copy rather
than overwriting the draft. The local revision tool retains the request,
implementation, decision, and reason together:

```bash
python3 tools/calibration.py init
python3 tools/calibration.py save --task normalize-key --decision revise \
  --reason 'Describe what changed and why'
python3 tools/calibration.py save --task normalize-key --decision accept \
  --reason 'Explain why this now represents the preferred implementation'
```

Run commands from the repository root. `init` prints the working directory.
It never overwrites an existing working copy. Review history is local and
gitignored; initial purpose-built drafts and specifications are tracked.
Chat-assisted revisions use the same save operation as direct edits.
Record them with `--actor agent`; agent revisions cannot declare human acceptance.
If the request changes, edit the working `TASK.md`, then use `fork-task`
with the task ID and a reason. The previous version remains intact.

## Snapshot survey

The initial guidance about scale and structural variety came from a structural
survey of a private snapshot of production SSL. The survey tool and its runs
live with that snapshot, outside this public repository. They record
aggregate measurements only, never source excerpts. Nothing from the snapshot
is copied here or placed in model prompts.

## How calibration feeds the guide

- **One scorer.** The schema, enforced through the LSP and the reviewer, is the
  only place style is scored. Calibration does not ship a scorer of its own:
  an accepted practice becomes a schema rule (or a guide section), and the
  existing checks enforce it.
- **Your preference wins; product style is noted.** A measured profile of how
  STARLIMS's own engineers write SSL may be compared against these practices.
  Where they disagree, the guide records the preference accepted here. The
  product convention is noted next to the rule, so agents working to a task
  brief that requires product style can follow it.
- **Intake.** Accepted practices and profile findings arrive as issues using
  the *Rule proposal* template: aggregate evidence only, sorted as agrees /
  differs / not covered against the current rules. A rule changes only after
  your explicit decision.

## From review to reinforcement

Use [PRACTICES.md](PRACTICES.md) to record a candidate's rationale, context,
preferred example, counterexample, exceptions, and enforcement owner. An agent
may propose a practice; only an explicit user decision promotes it to accepted.
The existing canonical guide remains the baseline until that decision.

Mechanical practices map first to existing LSP formatting/diagnostic behavior.
New rules require a completed trigger, exceptions, severity, and expected-output
specification. Design judgments remain planning/review criteria. After accepted
practices are incorporated, create three fresh transfer tasks, one per scale,
to evaluate whether the guidance works beyond these examples.

## Provenance and validation

Examples use new neutral scenarios and identifiers. Their connection to the
snapshot is its aggregate scale and structural patterns; no exported source
or organization-specific behavior was adapted. All examples remain unclassified
for training and must pass the flywheel's explicit source-admission gate before
any dataset release. Acceptance for style does not grant training eligibility.

SSL tests are supplied for execution by the user in STARLIMS. Local checks are
static only. Data-source database fixtures are synthetic preconditions, not
claims about any deployed schema. No examples are deployed by this workflow.
