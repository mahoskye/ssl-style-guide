# SSL design philosophy

The rules say what to write. This page says why, and which rule gives way when
two of them pull against each other. It is short on purpose: read all of it.

## The order of priorities

Kent Beck's four rules of simple design, in order. An earlier rule always wins.

1. **It works.** It does what was asked when STARLIMS runs it.
2. **It reveals intention.** A maintainer reading it cold sees what it is for.
3. **It says each thing once.** No duplicated logic, no repeated checks.
4. **It has the fewest elements.** No procedure, variable, field, check,
   comment or branch that the first three do not need.

Clarity beats product style. Where STARLIMS's own code does something one way
and a clearer way exists, write the clearer way. Product conventions decide
only what clarity leaves open: naming patterns, banner layout, which built-in
to use.

The foundation is John Ousterhout's *A Philosophy of Software Design*, with
Boswell and Foucher's *The Art of Readable Code* for line-level choices.
The ideas that matter most here:

- **Complexity is the cost.** Every element a reader has to hold in their head
  is paid for on every future read. Code that does the job in fewer elements
  is better code, not riskier code.
- **Define errors out of existence.** Prefer a design where the awkward case
  simply works (an empty list loops zero times, a lookup with a fallback
  returns the fallback) over one that detects it and reports it.
- **Deep, not shallow.** A procedure earns its place by hiding something
  substantial behind a simple call. A procedure that wraps three lines and is
  called once makes the reader jump for nothing.
- **Comments say what the code cannot.** Why this order, who owns this state,
  what breaks if it changes. Never what the next line does.

## What this means in SSL

**Check where the data comes in, then trust it.** Validate a value once, at the
boundary that receives it from something you do not control: a request from a
form or web service, a result from a script deployed separately, a query that
can return nothing. After that, the value is known. Do not check it again in
each procedure it passes through, and do not check results of your own
procedures in the same file.

Two cases come up constantly. A query's SELECT list fixes the shape of its
rows, so check what the database decides (no rows, more rows than you
expect, a NULL) and not the columns you selected. A context object has its
shape checked once, where it is built, reloaded or parsed from text; the
procedures that receive it later trust its properties. Checking that a
reloaded context still belongs to the current run is a different check, and
it stays.

**Do not check for states that cannot happen.** A parameter your own code
always passes, a type SSL already guarantees, an array you just built: none of
these need a guard. A guard for an impossible state is not safety. It is a
claim that the state is possible, and the next reader believes it.

**Let errors you cannot act on propagate.** Catch an error only where you can do
something about it: roll back, return a contract the caller relies on, or add
context that the raw error lacks. A `:TRY` that only turns one failure into
another failure is noise. Transactions are the exception that proves the rule:
their finalization is real work, so it stays.

**Return what the caller uses.** A script whose only caller wants a value
returns the value. Use the `{.T., data}` / `{.F., {sCode, sMessage}}` envelope
when a caller actually branches on success and failure, typically at a service
boundary. Do not add result fields, failure codes or `{.T., NIL}` steps that
nothing reads.

**Add structure when it pays.** A state object, a pipeline helper or a separate
validation procedure is worth it when the script is long enough that
positional parameters or repeated checks are the bigger cost. A short script
stays a short linear script. Wait for the second real use before extracting a
shared helper, and the third before generalising it.

**Document the real contract.** The banner and doc block state what the caller
gets. Describe a failure result or an empty case only when the code has one.
Do not invent failure modes to fill the template.

**Nothing for later.** No parameters, options or branches for a need nobody has
stated.

None of this removes a guard that protects something real: data that can be
empty, input you do not control, a write that must be verified, a transaction
that must finish. The goal is fewer things, each of which matters.

## An example

Both versions below validate clean and do the same job for a caller that always
passes a sample id. The first is what generated code tends to look like.

```ssl
/* ********************************************************************************
Description.. : Returns the owner of a sample.
Parameters... : sSampleId - Sample to look up
Returns...... : {.T., sOwner} on success
                {.F., {sCode, sMessage}} on failure
Date......... : 2026-10-21
********************************************************************************;
:PARAMETERS sSampleId;
:DEFAULT sSampleId, "";

:DECLARE aCheck, oState, sError;

/* Build the state object for the operation;
oState := CreateUdObject();
oState:sSampleId := sSampleId;
oState:sOwner := "";

/* Validate the request;
aCheck := DoProc("ValidateRequest", {oState});

:IF LimsTypeEx(aCheck) != "ARRAY" .OR. ALen(aCheck) < 2;
	:RETURN {.F., {"CONTRACT", "Invalid validation result."}};
:ENDIF;

:IF !aCheck[1];
	:RETURN aCheck;
:ENDIF;

/* Load the owner from the database;
:TRY;
	oState:sOwner := LSearch("SELECT owner FROM samples WHERE sample_id = ?", "",,
	                         {oState:sSampleId});
:CATCH;
	sError := GetLastSSLError():Description;
	:RETURN {.F., {"DB_ERROR", "Could not load the owner."}};
:ENDTRY;

:RETURN {.T., oState:sOwner};

/*
 * Procedure: ValidateRequest
 * Description: Checks that the sample id is a non-empty string.
 * Parameters:
 *   oState - Operation state
 * Returns: {.T., NIL} or failure envelope
;
:PROCEDURE ValidateRequest;
	:PARAMETERS oState;

	:IF LimsTypeEx(oState:sSampleId) != "STRING";
		:RETURN {.F., {"INVALID_INPUT", "Sample id must be a string."}};
	:ENDIF;

	:IF Empty(AllTrim(oState:sSampleId));
		:RETURN {.F., {"INVALID_INPUT", "Sample id is required."}};
	:ENDIF;

	:RETURN {.T., NIL};
:ENDPROC;
```

```ssl
/* ********************************************************************************
Description.. : Returns the owner of a sample.
Parameters... : sSampleId - Sample to look up
Returns...... : The owner's user name, or "" when the sample has none
Date......... : 2026-10-21
********************************************************************************;
:PARAMETERS sSampleId;

:RETURN LSearch("SELECT owner FROM samples WHERE sample_id = ?", "",, {sSampleId});
```

What went, and why:

| Removed | Why it was not needed |
| --- | --- |
| State object | One value passes through one step. |
| `ValidateRequest` and its type check | The caller always passes a string. An empty id finds no row and returns `""`, which is already the right answer: the error is defined out of existence. |
| Shape check on `aCheck` | It checks the result of a procedure in the same file. |
| `:TRY` / `:CATCH` | It turned a database error into a vaguer one and threw the detail away. Nothing here can recover, so the error goes to the caller as it is. |
| Envelope | The only caller wants the owner. |
| Narrating comments | Each one repeated the line below it. |

Had the caller been a web service passing untrusted input, the empty-id check
would stay, at the top, once.

## How this is enforced

- The rules under `rules/` carry this philosophy into checkable statements.
  The reviewer reports excess as findings, citing the rules in the
  `simplicity` category, the same way it reports a missing guard.
- The agents carry a compact form of this page in their instructions, so it
  applies even when this repository is not in the workspace.
- The program-level decision behind it is decision 0002 in the
  `starlims-program` records: clarity and simplicity come before product style.
