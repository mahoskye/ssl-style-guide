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

<!-- rules: id=server_script_file_shape,regions_group_related_procedures -->
- Order a nontrivial server script as: file banner; top-level `:PARAMETERS`, contiguous `:DEFAULT` statements and `:DECLARE`; default state initialization; main orchestration; then local procedures grouped into responsibility-based regions.
- Use regions for meaningful groups of related procedures; do not create one region per procedure.
<!-- /rules -->

The main orchestration may sit in a `Main` or role-specific region. A short script with no local procedures does not need regions.

## File And Procedure Documentation

In the file banner:

<!-- rules: id=banner_description_one_sentence,banner_parameters_business_meaning,banner_returns_exact_shape,banner_success_failure_labels,banner_special_result_first,banner_descriptions_operational -->
- Describe the script's single responsibility in one concise sentence on the banner's `Description` line.
- Define every banner parameter by its exact business meaning.
- State the exact result shape on the banner's `Returns......` line; when a script returns an outer envelope, describe the success and failure payloads on separate aligned continuation lines.
- Use `Success:` and `Failure:` labels on the banner's `Returns` line when either description must wrap, and align continuations under the first character after the label.
- Keep a special non-envelope result on its own `Returns` continuation line before the handled success and failure shapes.
- Keep banner descriptions operational; do not restate obvious properties of SSL or SQL.
<!-- /rules -->

<!-- rule: file_banner_required -->Open every server script and class file with the standard file banner, using the dot-leader fields `Description`, `Parameters`, `Returns`, `Author` and `Date`.<!-- /rule --> Start a new file from this template. It uses the field layout of the schema's `documentation.file_banner` template (the same dot-leader fields as `procedure_headers`):

```ssl
/* ********************************************************************************
Description.. : Records a status change for one sample.
Parameters... : sSampleId - Sample to update
                sStatus   - New status value
Returns...... : {.T., NIL} on success
                {.F., {sCode, sMessage}} on failure
Author....... : ABC
Date......... : 2026-10-13
********************************************************************************;
```

<!-- rules: id=file_banner_continuation_alignment,file_banner_modified_entries,generated_banner_omits_author,banner_has_no_semicolon -->
- Continuation lines align under the first character after `: `.
- Record later changes as new lines below `Date`, in the same style: `Modified..... : YYYY-MM-DD ABC - <what changed and why>`.
- Code generated by a tool or agent omits the `Author` line rather than inventing initials. A banner without `Author` is complete in that case, and a review does not report it.
- The banner is one comment, so it ends at the first `;`. Never put `;` anywhere inside it.
<!-- /rules -->

<!-- rule: procedure_doc_block_required -->Document every nontrivial local procedure with a doc block that states its purpose, its parameters, and what it returns.<!-- /rule --> Use this structure:

```ssl
/*
 * Procedure: BuildRequest
 * Description: Validates the request and prepares the operation state.
 * Parameters:
 *   sRequestId - Operation request identifier
 * Returns: aResult - {.T., operation state} or failure envelope
;
```

<!-- rules: id=returns_entry_one_line,doc_block_parameter_alignment,comments_explain_why -->
- Keep each `Returns:` entry of a procedure doc block on one physical line, for hover documentation.
- Align parameter descriptions in a procedure doc block when it improves scanning, but do not force large spacing or fragile visual columns.
- Comments explain purpose, ownership, safety consequences, replay behavior, or a non-obvious ordering requirement; do not narrate assignments or restate syntax.
<!-- /rules -->

A long block is not, by itself, a reason to add a comment.

## Naming And Formatting

<!-- rules: id=procedure_class_pascal_case,hungarian_variable_names,prefix_matches_type,declare_locals_at_start,declare_groups_by_purpose,preserve_declaration_groups,declare_group_order,expressions_on_one_line,wrapped_list_alignment,keyword_uppercase,equals_vs_strict_equals,one_statement_per_line,statement_semicolon,indent_tabs_preferred,continuation_indent_shows_structure,alltrim_for_input_normalization,format_for_composed_text,format_arg_not_array,doproc_for_same_file_procedures,execfunction_for_external_scripts,prefer_unannotated_procedures,private_raise_only_helpers,visibility_annotations_script_only -->
- Procedures and classes use PascalCase.
- Variables use Hungarian-style camelCase: a type prefix, then a camelCase body (`sMyVar`, not `s_my_var` or `SMYVAR`).
- Make a variable's prefix match the type of the value it holds: `s` string, `n` numeric, `b` boolean, `d` date, `a` array, `o` object, `fn` code block, `v` variant/any.
- Declare locals at the start of the script or procedure; this is a style preference, because `:DECLARE` is valid anywhere a statement is.
- Separate local variables with distinct responsibilities or lifecycles into purpose-based `:DECLARE` groups, such as request construction, configuration, retry state, response processing, transaction state and diagnostics.
- Preserve intentional declaration groups when editing existing code; do not flatten semantic groups into one declaration or reorganize all variables solely by type or prefix.
- Within each purpose-based `:DECLARE` group, order variables by prefix, then name; keep a single group only when the locals genuinely share one cohesive purpose.
- Keep calls, assignments, conditions and other expressions on one physical line when they fit and remain readable; wrap only when the established line-length limit requires it or the split exposes meaningful structure.
- When a declaration or similar comma-separated statement wraps, indent each hanging line so its first item aligns with the first item after the keyword.
- Colon-prefixed SSL keywords are uppercase and case-sensitive, for example `:IF` and `:BEGINCASE`.
- Use `==` for exact string equality; `=` is prefix-style for strings.
- Use one statement per line.
- Almost every SSL statement, including comments, must end with a semicolon.
- Prefer tabs for indentation; if the file already uses spaces, preserve 4-space indentation.
- Indent continuations to reveal expression or argument structure: outside brackets, one level past the line that opened the statement; inside a bracket, as `bracket_contents_align` says. Do not copy incidental alignment columns from another file.
- Use `AllTrim` when normalizing caller input, route values, settings text or external response text; `Trim` strips trailing whitespace only.
- Declare `sFmt` with the other string locals and use `sFmt:Format(template, {value1, value2, ...})` for messages, paths, setting keys and other composed text.
- Pass `sFmt:Format` one array holding every replacement value, including for a single placeholder.
- Use `DoProc("ProcName", {args})` for same-file script procedures.
- Use `ExecFunction("Category.Script", {args})` or `ExecFunction("Category.Script.Proc", {args})` for external script entry points.
- Prefer procedures without `/*@private;` or `/*@protected;` annotations; the one required exception is a raise-only helper, which is marked `/*@private;`.
- Mark raise-only helper procedures `/*@private;` so callers cannot bypass the entry point that catches their errors.
- Do not put `/*@private;` or `/*@protected;` on class methods; they affect script procedures only, and class methods are always public.
<!-- /rules -->

## Predefined Globals

Server scripts can read names they never declare. The platform provides `Request`, `Response`, `Session`, and `PublicConsts`. The installation's server-start scripts declare the rest as `:PUBLIC` variables: `MYUSERNAME`, `UserLang`, `STARLIMSDEPT`, `STARLIMSSITECODE`, `CRLF`, `PLATFORMA`, `glb_In_Batch`, one public per status (such as `Released`), and more. The published reference's Predefined Globals guide lists the names a base installation declares.

<!-- rules: id=read_globals_undeclared,global_assignment,guard_optional_globals -->
- Read a predefined global by its name, without declaring it; a `:DECLARE`, `:PARAMETERS` entry or caller variable with the same name hides the global.
- Never assign to a global; nothing makes it read-only, and every routine that reads it afterwards sees your value.
- Do not read a name the base installation does not declare (`CR`, `LF`, `TAB`, `sDQ`, `MYUSERID`, ...); use `Chr(...)` or the documented global instead, and guard a name that only some installations declare with `IsDefined("<name>")`.
<!-- /rules -->

Publics are found last in variable lookup, so declaring a global's name is a bug, not a fix for a warning. A name the base installation does not declare raises `Variable [<name>] is undefined!` where it is missing.

- Under the strict agent profile, `ssl_diagnose` reports many globals, such as `CRLF` and `Request`, as `undeclared_variable` warnings, because it checks one document and cannot see the server-start scripts. A warning that names a global the code reads on purpose is expected: leave the read as it is and list the warning in the report with the global it names. An `undeclared_variable` warning for any other name is a defect.

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

<!-- rules: id=return_early_on_invalid,begincase_for_multiway_choice,ascanexact_for_fixed_sets,prefer_exitcase,exitcase_after_return,exitcase_last_in_branch,no_duplicate_case_branches,prefer_linear_success_path -->
- Return early for invalid requests and failed contracts.
- Use `:BEGINCASE` when choosing among several routes, result shapes, artifact kinds, actions or outcomes.
- Use `AScanExact({...}, value)` when testing membership in a fixed set of exact values; `AScan` matches strings by prefix.
- End each `:CASE` / `:OTHERWISE` block with `:EXITCASE;` unless multi-match behavior is intentional.
- Do not add `:EXITCASE;` after a branch-level `:RETURN`; the return already terminates the procedure.
- `:EXITCASE` must be the last statement of its `:CASE`/`:OTHERWISE` branch, directly in the branch body; one nested inside `:IF`, or followed by another statement, is a compile error.
- Do not duplicate identical outcome branches; keep separate branches only when their behavior differs.
- Prefer a linear success path over nested `:IF` chains.
<!-- /rules -->

Without `:EXITCASE;`, later `:CASE` expressions are still evaluated and their bodies can run. When only part of a branch should end the block, split the branch into separate `:CASE` conditions.

## Validation And Boundary Contracts

Separate three concerns:

- Request validation checks caller-controlled fields and policy constraints.
- Contract predicates check values returned by another procedure or deployed service.
- Mutation guards enforce the persisted state that may be changed.

<!-- rule: one_boundary_per_invariant -->Assign each invariant to one authoritative boundary; repeat a check downstream only when it protects a distinct local use, enforces a stronger invariant, receives independently supplied data, or defends an independently deployed public contract.<!-- /rule --> Name that distinction in the focused test. Do not use repeated validation as a substitute for a clear upstream contract.

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

<!-- rules: id=limstypeex_numeric_not_number,type_check_before_value_check -->
- Check numeric values against `"NUMERIC"` only; `LimsTypeEx` never returns `"NUMBER"`.
- Separate runtime-type validation from value validation when `Len`, `Round`, array indexing or property access requires a specific type, and reject an invalid shape before evaluating the corresponding content predicate.
<!-- /rules -->

Contract rules for results that cross a boundary:

<!-- rules: id=validate_results_before_access,propagate_or_replace_downstream_failure,success_envelope_without_data,no_raw_diagnostics_in_caller_failures -->
- At every procedure or service boundary, validate an outer array, its required length and its success flag before reading an envelope payload, and validate the payload's shape and field types before indexing arrays or accessing object properties.
- When propagating a failure envelope, preserve a valid downstream stable code and sanitized message, and replace a malformed downstream result with a stable contract-failure code owned by the caller.
- Use `{.T., NIL}` for internal command steps that use a standard envelope but have no success data.
- Never return raw SSL diagnostics, exception descriptions, credentials, or payload bodies through caller-safe failures; return a stable code and a sanitized message.
<!-- /rules -->

<!-- rule: envelope_one_line -->Keep a variable-only envelope such as `{.F., {sCode, sMessage}}` on one physical line when it fits.<!-- /rule --> Split an envelope when inline literal text, additional payload fields, or the line-length limit benefits from clearer grouping.

<!-- rule: state_object_for_multistep -->For a multi-step operation, create one descriptive UDObject, initialize every property during request construction, and pass that object through cohesive steps rather than growing long positional parameter lists.<!-- /rule --> Its properties include flags, IDs, counters, the stable failure code and the sanitized failure message.

<!-- rule: pipeline_failure_capture -->Use a pipeline-specific failure-capture helper when several sequential steps return standard envelopes, and keep one contract within the pipeline: either return a boolean or return `{success, state}` consistently.<!-- /rule -->

## External Calls And Error Handling

Decide explicitly whether an external call reports failures by throwing, by returning an envelope, or by both. <!-- rule: wrap_execfunction_for_envelope -->When the current boundary promises a stable failure envelope, wrap `ExecFunction` in `:TRY`/`:CATCH` unless the deployed function has a documented no-throw contract, and validate the returned envelope even when the call is wrapped.<!-- /rule -->

`RaiseError` does not return normally. Inside `:TRY`, it skips the remaining protected statements and transfers control to `:CATCH`. When the catch completes, execution continues after `:ENDTRY`; the current script invocation is not terminated. Outside a matching `:TRY/:CATCH`, the error propagates to the caller and fails the invocation only if no caller handles it. <!-- rule: raise_error_inside_handling_try -->Place `RaiseError` directly inside the `:TRY` block whose `:CATCH` handles it, so the raise can never escape.<!-- /rule --> <!-- rule: no_raise_error_in_catch -->Never call `RaiseError` inside `:CATCH` — the error handler must not become the thing that crashes.<!-- /rule --> Do not describe `RaiseError` as terminating the STARLIMS service or host worker process without separate runtime evidence.

<!-- rule: no_mixed_error_handling_families -->Do not combine legacy `:ERROR`/`:RESUME` handling with `:TRY`/`:CATCH` in the same procedure.<!-- /rule --> An `:ERROR` handler is the last section of a procedure and protects the statements before it, including any `:TRY` block there. When the handler ends with `:RESUME`, it takes an error raised inside the `:TRY` body before the `:CATCH` sees it, `:CATCH` never runs, and execution continues inside the `:TRY` body, bypassing the expected structured-error flow.

When a catch retains or logs runtime diagnostics, take these steps in order:

<!-- rules: id=read_last_ssl_error_first,bound_retained_diagnostics,log_at_owning_boundary,no_raw_diagnostics_in_caller_failures,clear_last_ssl_error_after_handling -->
- In a `:CATCH` that keeps or logs diagnostics, read `GetLastSSLError()` before anything changes the SSL error state.
- Bound diagnostic text that a `:CATCH` keeps or logs, normally with `Left(..., 2000)`.
- Log a diagnostic only at the boundary that owns the failed operation.
- Never return raw SSL diagnostics, exception descriptions, credentials, or payload bodies through caller-safe failures; return a stable code and a sanitized message.
- Call `ClearLastSSLError()` after handling an error in `:CATCH`, so stale error state does not leak into later handling.
<!-- /rules -->

An envelope-only catch may translate the exception directly into a stable failure without reading or logging the diagnostic, but it still calls `ClearLastSSLError()` so stale error state does not leak into later handling. Do not add diagnostic handling when the boundary intentionally delegates logging or has no useful context to add.

<!-- rule: log_caption_tags -->Use `InfoMes` and `ErrorMes` for retained server-log diagnostics, and prefix captions with scan-friendly tags such as `[INFO]`, `[SUCCESS]`, or `[ERROR]`.<!-- /rule --> Server logs are diagnostic evidence, not workflow state.

<!-- rule: no_error_logs_for_expected_rejections -->Do not log expected guard rejections, replay conflicts, or caller validation failures as infrastructure errors unless the operation specifically requires that audit signal.<!-- /rule -->

## SQL And Database Calls

<!-- rules: id=parse_delimited_input_locally,sql_keyword_case,sql_identifier_case,named_sql_param_unsupported,sql_properties_to_typed_locals,sql_in_clause_array_expansion,empty_in_array_fallback,sql_positional_placeholders,unicode_literal_prefix,unjustified_collate,omit_default_connection_argument,skip_commas_adjacent,sql_structure_exposes_guards,sql_lock_hints_deliberate,guarded_write_verification -->
- Parse simple delimited input locally with helpers such as `BuildArray` when the rules depend only on element count, emptiness, length or exact text; normalize entries before validating and keeping the canonical list, and treat empty input or a normalization failure as no preference when the list is only an optional selection hint. Do not add a database dependency solely to split or validate text.
- Inside SQL strings, write SQL keywords and built-in functions in uppercase.
- Preserve the author's casing for table names, column names and aliases; force-folding is dialect-conditional (safe on Oracle, but breaks case-sensitive SQL Server collations), so lowercase only Oracle-only code.
- `SQLExecute` is the only database API that supports named `?param?` substitution; do not use `?param?` markers with other database functions. Its markers reference in-scope SSL variables by name. Canonical shape: `SQLExecute("UPDATE T SET COL = ?sValue? WHERE ID = ?nId?");`
- Copy object properties into typed locals before embedding them in SQL.
- Use `PrepareArrayForIn` or `SQLExecute` array expansion for dynamic `IN` clauses when appropriate; do not build an `IN` clause by hand when a safer array helper or parameter array is available.
- When the array for an `IN (?aValues?)` predicate is empty, skip that query or choose the appropriate fallback.
- `RunSQL`, `LSearch`, `LSelect`, `LSelect1`, `LSelectC`, and `GetDataSet` use positional `?` markers with a value array in a later argument slot: fourth for `LSearch`, `LSelect` and `LSelectC`, second for `GetDataSet`, and third for `RunSQL` and `LSelect1`. Check `ssl_signature` for the slot and skip unused optionals with adjacent commas. Canonical shape: `aRows := LSelect("SELECT ID FROM T WHERE STATUS = ?",,, {sStatus});`
- Use ordinary SQL string literals; add the `N` prefix only when the target explicitly requires Unicode literal semantics.
- Let ordinary text comparisons use the schema or database collation; force `COLLATE` only for a documented comparison contract, and explain why the schema collation is insufficient immediately before the query.
- Omit the connection argument for calls to the default database.
- Use adjacent commas with no spaces for skipped optional parameters.
- Use structured SQL with clause-per-line formatting and indentation that exposes lock and guard conditions.
- Apply lock hints deliberately for the operation's concurrency contract.
- For guarded writes, require `LimsRecordsAffected() == 1`, and perform a verification read when later logic depends on the resulting state or state version.
<!-- /rules -->

`SQLExecute` expands an `IN (?aValues?)` array into individual bound parameters. An explicit `NIL` in a skipped argument slot is valid and equivalent at run time (omitted arguments are NIL-padded); it is just not the convention. Identifier casing is significant on case-sensitive SQL Server collations — see `sql-canonical-compact-reference.md`, Identifier Casing.

## Transactional Commands

<!-- rule: transaction_owned_by_write_service -->The service that owns a related set of writes owns the transaction; coordinators delegate mutations rather than wrap an entire workflow in one broad transaction.<!-- /rule -->

For a transaction-owning command:

- Choose the transaction pattern deliberately:
	- **Nested scope:** Always call `BeginLimsTransaction`; each successful call increases transaction depth and must be matched with exactly one `EndLimsTransaction` for the same connection.
	- **Conditional ownership:** Set an ownership flag from `!IsInTransaction(connection)`, begin only when the flag is true, and end only the transaction the command started. Otherwise participate in the caller's transaction and leave finalization to the caller.
<!-- rules: id=match_begin_with_end_transaction,isintransaction_for_ownership,commit_flag_starts_false,end_transaction_in_finally_when_started,guard_transaction_finalization,atomic_writes_one_transaction -->
- Match each successful `BeginLimsTransaction` with exactly one `EndLimsTransaction` for the same connection, and end only a transaction the command started.
- Use `IsInTransaction` to establish transaction ownership or to require an existing transaction when that is part of the procedure contract; do not reject an ambient transaction merely because nesting is possible.
- Start the commit flag at `.F.` and set it `.T.` only after the last write and verification succeed.
- From `:FINALLY`, call `EndLimsTransaction(, bCommit)` only when the transaction started.
- In a command that returns its own failure envelope, protect the `EndLimsTransaction` call in `:FINALLY` with a nested `:TRY`/`:CATCH`, because finalization failures raise rather than returning `.F.`; on a finalization failure, fail the operation with a distinct stable code.
- Keep writes that form one atomic command in the same transaction.
<!-- /rules -->

<!-- rule: replay_aware_mutations -->In a replay-aware mutation, lock the candidate row, distinguish fresh work from an exact replay, validate a versioned receipt fingerprint, reject changed requests as conflicts, and preserve the canonical receipt serialization byte for byte.<!-- /rule -->

### Worked Example: Error Propagation Still Runs Cleanup

A procedure that lets errors propagate still owns the cleanup for what it started. Use `:TRY` with `:FINALLY` and no `:CATCH`: `:FINALLY` runs whether the body finishes or raises, and when there is no `:CATCH` the original error continues to the caller once `:FINALLY` finishes. The transaction closes and the caller still sees the failure.

Here the entry point owns the failure envelope. The raise-only helper owns the transaction:

```ssl
:PROCEDURE ChangeStatus;
	:PARAMETERS sSampleId, sStatus;
	:DECLARE oErr, sDiag;

	:TRY;
		DoProc("WriteStatusChange", {sSampleId, sStatus});
	:CATCH;
		oErr := GetLastSSLError();
		sDiag := Left(oErr:Description, 2000);
		ErrorMes("[ERROR] ChangeStatus", sDiag);
		ClearLastSSLError();
		:RETURN {.F., {"STATUS_NOT_SAVED", "The status change was not saved."}};
	:ENDTRY;

	:RETURN {.T., NIL};
:ENDPROC;

/*
 * Procedure: WriteStatusChange
 * Description: Updates the status and writes its audit row in one transaction.
 * Parameters:
 *   sSampleId - Sample to update
 *   sStatus   - New status value
 * Returns: nothing - raises on any failure, after rolling back
;
/*@private;
:PROCEDURE WriteStatusChange;
	:PARAMETERS sSampleId, sStatus;
	:DECLARE bCommit, bStarted;

	bStarted := .F.;
	bCommit := .F.;

	:TRY;
		bStarted := BeginLimsTransaction();

		SQLExecute("
		    UPDATE sample SET
		        status = ?sStatus?
		    WHERE sample_id = ?sSampleId?
		");

		:IF LimsRecordsAffected() != 1;
			RaiseError("Sample " + sSampleId + " was not updated");
		:ENDIF;

		SQLExecute("
		    INSERT INTO sample_audit (
		        sample_id, status
		    )
		    VALUES (
		        ?sSampleId?, ?sStatus?
		    )
		");

		/* Reached only when every write above succeeded;
		bCommit := .T.;
	:FINALLY;
		/* Always runs. After an error bCommit is still .F., so this rolls back;
		:IF bStarted;
			EndLimsTransaction(, bCommit);
		:ENDIF;
	:ENDTRY;
:ENDPROC;
```

What makes it correct:

- `bCommit` starts `.F.` and becomes `.T.` as the last statement of the `:TRY` body, so it can only be `.T.` when every write ran. Any error before that line, whether from `RaiseError` or from a failed write (under the default SQL error settings a failed statement raises), leaves it `.F.`, and `:FINALLY` rolls back.
- `bStarted` comes from `BeginLimsTransaction`, so `:FINALLY` never ends a transaction this procedure did not begin.
- There is no `:CATCH`, so the helper neither swallows the error nor needs to re-raise it. `:RETURN` is not allowed in `:FINALLY`, and none is needed.
- The helper is raise-only, so it is marked `/*@private;` and called only from an entry point whose `:CATCH` turns the error into the stable failure envelope.
- `EndLimsTransaction` is not wrapped in a nested `:TRY/:CATCH` here, because this helper propagates every failure and a finalization error reaches the entry point's `:CATCH` like any other. The nested guard described above belongs in a command that returns its own failure envelope instead of raising.

**The trap: a success flag that starts `.T.`.** This version looks equivalent and is not:

```ssl
	bStarted := .F.;
	/* Wrong. The flag starts as success and only the checks below clear it;
	bSuccess := .T.;

	:TRY;
		bStarted := BeginLimsTransaction();

		SQLExecute("
		    UPDATE sample SET
		        status = ?sStatus?
		    WHERE sample_id = ?sSampleId?
		");

		:IF LimsRecordsAffected() != 1;
			bSuccess := .F.;
		:ENDIF;

		/* If this insert raises, bSuccess is still .T.;
		SQLExecute("
		    INSERT INTO sample_audit (
		        sample_id, status
		    )
		    VALUES (
		        ?sSampleId?, ?sStatus?
		    )
		");
	:FINALLY;
		/* So this commits the UPDATE that ran before the failed INSERT;
		:IF bStarted;
			EndLimsTransaction(, bSuccess);
		:ENDIF;
	:ENDTRY;
```

The flag records only the failures the code checks for. A raised error skips the rest of the `:TRY` body, so the flag keeps its starting value, and `:FINALLY` commits the writes that completed before the error. The error still propagates, so the caller is told the operation failed while half of it is committed. <!-- rule: commit_flag_starts_false -->Start the commit flag at `.F.` and set it `.T.` only after the last write and verification succeed.<!-- /rule -->

## Continuous Improvement Loop

Use repository memory as the provisional learning layer and this instruction file as the stable shared baseline.

Before editing or reviewing a server script:

1. Consult relevant repository memory notes (for example, notes kept by your agent tooling) when the task touches a documented SSL behavior, known tool limitation, or established repository convention.
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


