# SSL Server Script Style (production baseline)

Adopted 2026-08-10 from the stakeholder's working server-script style
instructions (issue #56). This is the shared baseline for STARLIMS SSL
server scripts (`*.srvscr`): style, validation, boundary, SQL,
transaction, and evidence practices. Class files follow the class rules
in the schema and `ssl_agent_instructions.md`; this file's procedure,
SQL, transaction, and error-handling sections apply to class methods as
well unless a class rule overrides them.

Scope note: `sFmt:Format(template, {values})` works because SSL values
expose the underlying .NET instance methods through colon member access —
any string-typed variable has `:Format(...)` natively (the same
passthrough that makes .NET collections 0-based). `sFmt` is simply a
declared string local by convention. These per-type native methods are
not individually listed in the element reference; verify unfamiliar ones
before relying on them.


## Purpose

Use this guide as the shared baseline for STARLIMS SSL server scripts. Preserve each script's public contract and business behavior unless the task explicitly changes them. More narrowly scoped instruction files may add domain-specific contracts and preferred reference implementations.

## Necessity And Proportionality

For every nontrivial procedure, result field, validation layer, side effect, or external dependency added during implementation or review, answer these questions before editing:

1. What current caller, approved requirement, demonstrated failure mode, or operational control needs it?
2. Which boundary owns the behavior?
3. Who consumes its result or evidence?
4. What focused check will prove it works and detect its removal?

A valid finding does not automatically justify a new abstraction in the file where the finding appears. Fix the issue at the owning boundary, and prefer the smallest cohesive change that passes the focused check. Do not add speculative result fields, generalized failure taxonomies, compatibility layers, or validation frameworks without an identified consumer and a coordinated contract change.

Do not validate merely because another predicate can be added. For each validation, identify the unsafe operation, demonstrated failure, or explicit contract it protects and the first authoritative boundary that can establish the invariant. Before repeating a check downstream, ask whether the same value has already been validated and whether it can change, be bypassed, arrive through another entry point, or require a stronger local invariant. Remove the repeated check when none applies. Independently deployed consumers may validate another script's public result contract, but they should not duplicate that script's internal input validation.

Treat material growth in responsibilities, public result shapes, local procedures, or dependencies as a signal to stop and reassess ownership. Compare the proposed design with the nearest working implementation and explain which required behavior justifies each added concern. Line count and procedure count are review triggers, not acceptance limits; do not remove demonstrated guards or collapse distinct responsibilities merely to make a file shorter.

When reducing an expanded implementation, establish characterization checks first. Classify each concern as keep, move, remove, or defer, and preserve the behavior required by current callers while moving policy and workflow-specific validation to their owning services.

## File Shape

Order a nontrivial server script as follows:

1. Standard STARLIMS file banner.
2. Top-level `:PARAMETERS`, contiguous `:DEFAULT` statements, and `:DECLARE`.
3. Default state initialization.
4. Main orchestration, optionally in a `Main` or role-specific region.
5. Local procedures grouped into responsibility-based regions.

Use regions for meaningful groups of related procedures. Do not create one region per procedure. A short script with no local procedures does not need regions.

Keep top-level parameters and declarations before the first region.

## File And Procedure Documentation

In the file banner:

- Describe the script's single responsibility in one concise sentence.
- Define every parameter by its exact business meaning.
- State the exact result shape on the `Returns......` line. When a script returns an outer envelope, describe success and failure payloads on separate aligned continuation lines. Use `Success:` and `Failure:` labels when either description must wrap, and align continuations under the first character after the label.
- Keep a special non-envelope result on its own continuation line before handled success and failure shapes.
- Keep descriptions operational; do not restate obvious properties of SSL or SQL.
- Preserve existing ticket, modification, author, and date entries as historical records. Do not rewrite an earlier entry to describe current work; append a new dated entry for the new change.

Document every nontrivial local procedure with this structure:

```ssl
/*
 * Procedure: BuildRequest
 * Description: Validates the request and prepares the operation state.
 * Parameters:
 *   sRequestId - Operation request identifier
 * Returns: aResult - {.T., operation state} or failure envelope
;
```

Keep each `Returns:` entry on one physical line for hover documentation. Align parameter descriptions when it improves scanning, but do not force large spacing or fragile visual columns.

Comments should explain purpose, ownership, safety consequences, replay behavior, or a non-obvious ordering requirement. Do not narrate assignments, restate syntax, or add comments merely because a block is long.

## Naming And Formatting

- Use PascalCase procedure names.
- Use descriptive Hungarian-prefixed locals: `a` for arrays and results, `b` for logic, `d` for dates, `fn` for code blocks, `n` for numbers, `o` for objects, `s` for strings, and `v` for values of varying type.
- Declare locals at the start of the script or procedure.
- Actively identify distinct responsibilities or lifecycles among local variables and separate them into purpose-based `:DECLARE` groups. Use declaration grouping to expose concerns such as request construction, configuration, retry state, response processing, transaction state, and diagnostics.
- Preserve intentional declaration groups when editing existing code. Do not flatten semantic groups into one declaration or reorganize all variables solely by type or prefix.
- Within each purpose-based group, order variables by prefix, then name. Keep a single group only when the locals genuinely share one cohesive purpose.
- Keep calls, assignments, conditions, and other expressions on one physical line when they fit and remain readable. Wrap only when required by the established line-length limit or when the split exposes meaningful structure.
- When a declaration or similar comma-separated statement wraps, indent each hanging line so its first item aligns with the first item after the keyword.
- Use uppercase colon keywords, exact `==` comparisons, one statement per line, and semicolon-terminated SSL statements and comments.
- Indent blocks with tabs. Indent continuations to reveal expression or argument structure; do not copy incidental alignment columns from another file.
- Use `AllTrim` when normalizing caller input, route values, settings text, or external response text (`Trim` strips trailing whitespace only; `AllTrim` strips both ends).
- Declare `sFmt` with other string locals and use `sFmt:Format(template, {value1, value2, ...})` for messages, paths, setting keys, and other composed text. The second argument is one array containing every replacement value, including for a single placeholder.
- Use `DoProc("ProcedureName", {...})` for same-file procedures and `ExecFunction("Namespace.Script", {...})` for deployed scripts.
- Prefer procedures without `/*@private;` or `/*@protected;` annotations. The one required exception is the RaiseError doctrine: mark raise-only helper procedures `/*@private;` so callers cannot bypass the entry point that catches their errors. (The annotations affect script procedures only; they are inert on class methods.)

## Main Orchestration

Make the top-level flow read as the business sequence:

1. Build and validate the request.
2. Return immediately on rejected input.
3. Resolve required policy or settings.
4. Execute coordination or mutation steps in order.
5. Normalize the result at the owning boundary.
6. Return the public result shape.

Keep mechanics out of the orchestration path. Extract a helper when a condition requires several `LimsTypeEx`, `HasProperty`, `ALen`, length, or non-empty checks. The caller should read like the decision being made, while the helper holds the shape validation.

When a condition contains more than three clauses, either decompose it into a named predicate or place a short explanatory comment immediately before the block. State the business rule represented by the combined checks rather than narrating each operator.

Do not overextract a short condition that is already clear. Prefer a small number of cohesive procedures over one procedure per statement.

Do not force regions, state objects, or helper procedures into a script that remains clearer as a short linear service.

## Control Flow

- Return early for invalid requests and failed contracts.
- Use `:BEGINCASE` when choosing among several routes, result shapes, artifact kinds, actions, or outcomes.
- Use `AScan({...}, value)` when testing membership in a fixed set of exact values.
- Use `:EXITCASE;` when a case assigns a value and execution continues after `:ENDCASE`.
- Do not add `:EXITCASE;` after a branch-level `:RETURN`; the return already terminates the procedure.
- Do not duplicate identical outcome branches; keep separate branches only when their behavior differs.
- Prefer a linear success path over nested `:IF` chains.

## Validation And Boundary Contracts

Separate three concerns:

- Request validation checks caller-controlled fields and policy constraints.
- Contract predicates check values returned by another procedure or deployed service.
- Mutation guards enforce the persisted state that may be changed.

Assign each invariant to one authoritative boundary. A later boundary may check a related value only when it protects a distinct local use, enforces a stronger invariant, receives independently supplied data, or defends an independently deployed public contract. Name that distinction in the focused test. Do not use repeated validation as a substitute for a clear upstream contract.

Use these exact `LimsTypeEx` return values when validating runtime types:

| Input value | `LimsTypeEx` result |
| --- | --- |
| `NIL` | `NIL` |
| String | `STRING` |
| Number | `NUMERIC` |
| Boolean | `LOGIC` |
| Date | `DATE` |
| Array | `ARRAY` |
| Code block | `CODEBLOCK` |
| Object values exposed as SSL objects | `OBJECT` |
| Other unsupported or custom values | `SSLVALUE` |

Check numeric values against `"NUMERIC"` only. Do not use or accept `"NUMBER"` as a `LimsTypeEx` result.

Separate runtime-type validation from value validation when `Len`, `Round`, array indexing, or property access requires a specific type. Reject an invalid shape before evaluating the corresponding content predicate.

At every procedure or service boundary:

- Validate an outer array, its required length, and its success flag before reading an envelope payload.
- Validate payload shape and field types before indexing arrays or accessing object properties.
- Preserve a valid downstream stable code and sanitized message when propagating a failure envelope.
- Replace malformed downstream results with a stable contract-failure code owned by the caller.
- Use `{.T., NIL}` for internal command steps that use a standard envelope but have no success data.
- Never return raw SSL diagnostics, exception descriptions, credentials, or payload bodies through caller-safe failures.

Keep a variable-only envelope such as `{.F., {sCode, sMessage}}` on one physical line when it fits. Split an envelope when inline literal text, additional payload fields, or the line-length limit benefits from clearer grouping.

For a multi-step operation, create one descriptive UDObject and initialize every property during request construction, including flags, IDs, counters, stable failure code, and sanitized failure message. Pass that object through cohesive steps rather than growing long positional parameter lists.

Use a pipeline-specific failure-capture helper when several sequential steps return standard envelopes. Keep one contract within the pipeline: either return a boolean or return `{success, state}` consistently.

## External Calls And Error Handling

Decide explicitly whether an external call reports failures by throwing, by returning an envelope, or by both. When the current boundary promises a stable failure envelope, wrap `ExecFunction` in `:TRY/:CATCH` unless the deployed function has a documented no-throw contract. Validate returned envelopes even when the call is wrapped.

`RaiseError` does not return normally. Inside `:TRY`, it skips the remaining protected statements and transfers control to `:CATCH`. When the catch completes without re-raising, execution continues after `:ENDTRY`; the current script invocation is not terminated. Outside a matching `:TRY/:CATCH`, or when re-raised from the catch, the error propagates to the caller and fails the invocation only if no caller handles it. Do not describe `RaiseError` as terminating the STARLIMS service or host worker process without separate runtime evidence.

Do not combine legacy `:ERROR/:RESUME` handling with `:TRY/:CATCH` in the same procedure unless that interaction is intentional and runtime-tested. An `:ERROR` handler governs the statements that follow it, so a handler established before a `:TRY` can intercept a raised error before the `:CATCH` sees it, bypassing the expected structured-error flow.

When a catch retains or logs runtime diagnostics:

1. Read `GetLastSSLError()` before changing the SSL error state.
2. Bound retained diagnostic text, normally with `Left(..., 2000)`.
3. Log the diagnostic only at the boundary that owns the failed operation.
4. Return a stable code and sanitized message.
5. Call `ClearLastSSLError()` only after the error has actually been read or handled.

An envelope-only catch may translate the exception directly into a stable failure without reading or logging the diagnostic, but it still calls `ClearLastSSLError()` so stale error state does not leak into later handling. Do not add diagnostic handling when the boundary intentionally delegates logging or has no useful context to add.

Use `InfoMes` and `ErrorMes` for retained server-log diagnostics. Prefix captions with scan-friendly tags such as `[INFO]`, `[SUCCESS]`, or `[ERROR]`. Server logs are diagnostic evidence, not workflow state.

Do not log expected guard rejections, replay conflicts, or caller validation failures as infrastructure errors unless the operation specifically requires that audit signal.

## SQL And Database Calls

- Parse simple delimited input locally with helpers such as `BuildArray` when the rules depend only on element count, emptiness, length, or exact text. Normalize entries before validating and retaining the canonical list. When the list is only an optional selection hint, treat empty input or normalization failure as no preference rather than blocking the operation. Do not add a database dependency solely to split or validate text.
- Use uppercase SQL keywords. Preserve the established identifier casing of
  the schema and surrounding code; never force-fold identifiers (casing is
  significant on case-sensitive SQL Server collations — see
  `sql-canonical-compact-reference.md`, Identifier Casing).
- For `SQLExecute`, use named `?localVariable?` substitution. Copy object properties into typed locals before embedding them in SQL.
- For a parameterized `IN` predicate, retain normalized values as an SSL array and use `IN (?aValues?)`; `SQLExecute` expands the array into individual bound parameters. Skip that query or choose the appropriate fallback when the array is empty.
- For database APIs that use positional `?` placeholders and an explicit values array, follow that API's documented signature rather than applying `SQLExecute` substitution syntax.
- Use ordinary SQL string literals by default. Add the `N` prefix only when the target explicitly requires Unicode literal semantics.
- Let ordinary text comparisons use the schema or database collation. Force `COLLATE` only for a documented comparison contract, and explain why the schema collation is insufficient immediately before the query.
- Omit the connection argument for standard default-database calls. When a later optional argument must be supplied, leave the earlier optional slots blank with adjacent commas (`Fn(, vLater)`) — the standard style. Explicit `NIL` in a skipped slot is valid and equivalent at runtime (omitted arguments are NIL-padded); it is just not the convention.
- Use structured SQL with clause-per-line formatting and indentation that exposes lock and guard conditions.
- Apply lock hints deliberately for the operation's concurrency contract.
- For guarded writes, require `LimsRecordsAffected() == 1` and perform a verification read when later logic depends on the resulting state or state version.

## Transactional Commands

The service that owns a related set of writes owns the transaction. Coordinators should delegate mutations rather than wrap an entire workflow in a broad transaction.

For a transaction-owning command:

- Choose the transaction pattern deliberately:
	- **Nested scope:** Always call `BeginLimsTransaction`; each successful call increases transaction depth and must be matched with exactly one `EndLimsTransaction` for the same connection.
	- **Conditional ownership:** Set an ownership flag from `!IsInTransaction(connection)`, begin only when the flag is true, and end only the transaction the command started. Otherwise participate in the caller's transaction and leave finalization to the caller.
- Use `IsInTransaction` to establish transaction ownership or require an existing transaction when that is part of the procedure contract. Do not reject an ambient transaction merely because nesting is possible.
- Track `bStarted`, `bCommit`, and success state explicitly.
- Set `bCommit := .T.` only after all required writes and verification steps succeed.
- From `:FINALLY`, call `EndLimsTransaction(, bCommit)` only when the transaction started, and protect that call with a nested `:TRY/:CATCH` because finalization failures raise rather than returning `.F.`.
- On finalization failure, force the public operation to fail, capture bounded diagnostics, and return a distinct stable code and sanitized message. Do not report success when the command's transaction scope did not close successfully.
- Keep writes that form one atomic command in the same transaction.

Replay-aware mutations should lock the candidate row, distinguish fresh work from exact replay, validate a versioned receipt fingerprint, and reject changed requests as conflicts. Preserve canonical receipt serialization byte for byte.

## Continuous Improvement Loop

Use repository memory as the provisional learning layer and this instruction file as the stable shared baseline.

Before editing or reviewing a server script:

1. Consult relevant repository memory notes (this repo: the agent-quality-lab judgments and MEMORY layer) when the task touches a documented SSL behavior, known tool limitation, or established repository convention.
2. Apply a memory note only within its stated scope. When a note conflicts with the authoritative SSL reference, a reproducible runtime result, or a more specific instruction, stop and resolve the conflict rather than choosing silently.

During implementation and validation, treat these as learning candidates:

- A reproducible runtime result disproves an assumed SSL behavior.
- A formatter, linter, or language-server diagnostic is confirmed as correct or as a false positive by authoritative syntax or a focused runtime check.
- Review feedback corrects a pattern likely to recur across server scripts.
- The same maintainability problem appears in more than one independently implemented script.

Before retaining a candidate lesson:

1. Reduce it to one falsifiable claim.
2. Verify language and API claims against the SSL reference tools when documentation exists.
3. Prefer a focused runtime reproduction for execution semantics, transaction behavior, error handling, and integration boundaries.
4. Separate general SSL behavior from application-specific policy and one-script workarounds.

Record a verified reusable lesson as a concise repository-memory note in the repository memory layer. Include the observed rule, its scope, and any known tool discrepancy or runtime precondition. Update or remove a note when later evidence refutes it; do not accumulate contradictory notes.

Promote a memory lesson into this instruction file only when it is broadly applicable, stable, and actionable for future server-script work. Keep workflow- or application-specific lessons in the corresponding scoped instruction file. Do not modify instructions merely to mirror one implementation, one review preference, or an unverified diagnostic.

## Agent Completion Check

Before finishing an edit, verify:

- Every added responsibility has a current need, owning boundary, consumer, and focused check.
- Material complexity growth was reassessed against the nearest working implementation.
- Reduction preserved demonstrated failure guards and caller-required behavior.
- The public parameters and result shapes are documented and preserved.
- The top-level path reads as business orchestration rather than mechanical validation.
- Dense shape checks have descriptive helpers, while trivial checks remain local.
- Every external result is validated before payload access.
- Caller-safe failures contain stable codes and sanitized messages where the public contract uses them.
- Logging contains useful bounded context without becoming persisted workflow state.
- SQL uses local substitutions, default-connection conventions, and guarded mutation checks.
- Transaction ownership, commit timing, replay behavior, and related writes remain coherent.
- Transaction finalization exceptions remain inside the script's stable result contract.
- Procedure comments use the standard block and one-line `Returns:` entry.
- New reusable SSL lessons are verified and recorded at the narrowest appropriate scope.


