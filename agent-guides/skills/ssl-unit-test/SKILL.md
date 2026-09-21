---
name: ssl-unit-test
description: Write unit tests for SSL code as SSL procedures the user runs inside STARLIMS. Use when asked to test, add test coverage for, or verify SSL code.
argument-hint: "<file-or-procedure under test> [cases]"
allowed-tools: Read, Write, Edit, Grep, Glob, mcp__ssl-reference__ssl_lookup, mcp__ssl-reference__ssl_signature, mcp__ssl-reference__ssl_diagnose, mcp__ssl-reference__ssl_format
---

Write unit tests for SSL code. Tests are SSL, they run inside STARLIMS,
and you do not run them.

## The rule that matters most

**Tests for SSL are written in SSL. Never in Python, JavaScript, shell,
or PowerShell.**

This is not a style preference. There is no external database access
from outside STARLIMS, so a script in another language cannot read the
values it would need to check. It also hands the user something they
cannot run where the code lives. Delivering tests in the wrong language
is a failed task, not a partial one.

You also cannot execute what you write. There is no local SSL runtime.
Deliver the tests ready to run and say plainly that they are unexecuted.
`ssl_diagnose` proves a test file parses and conforms; it never proves a
test passes.

## Shape of a test file

One test file per unit under test, named `<UnitName>Tests.ssl`, holding:

1. A file banner naming what is under test and how to run it.
2. `RunTests` — the entry point. Calls each test procedure, collects
   results, reports the tally.
3. One procedure per test case, named `Test<Behavior>`.
4. Assertion helpers at the bottom.

Same-file procedures are called with `DoProc("Name", {args})`. Never
call them bare as `Name()` — that resolves to a built-in if one shares
the name.

## Which cases to write

For each procedure under test, cover:

- **The success path** — normal inputs, expected result.
- **Each failure path the procedure handles** — one test per `:CATCH`
  or validation branch. If a procedure is documented to return `NIL` on
  a bad ID, test that it does.
- **The empty case** — no rows, empty string, empty array. This is the
  case SSL code most often gets wrong, because a procedure that returns
  a declared-but-never-assigned variable looks correct until nothing
  matches.

Test the **return contract**, not the implementation. Assert what the
caller receives; do not reach into internals.

## Database in tests

Prefer tests that need no database. When one genuinely does:

- Read-only where possible. A test that writes data is a test that
  changes the environment it runs in — say so in the banner.
- Basic SQL only: `SELECT` / `INSERT` / `UPDATE` / `DELETE`, ordinary
  joins, `WHERE`, `GROUP BY`, `ORDER BY`. No temp tables, CTEs, window
  functions, cursors, dynamic SQL, or control-flow blocks inside a SQL
  string.
- Parameterize every value.
- If the test needs data that must already exist, state the
  precondition in the banner. The user is the one who sets it up.

## Template

```ssl
/* SampleUtilsTests.ssl;
/* Unit tests for SampleUtils. Run by calling RunTests;
/* No database writes. Requires no preexisting data;

:PROCEDURE RunTests;
	/* Entry point. Runs every test and logs a pass/fail tally.;
	/* Each test returns its own {label, passed} pair, so nothing depends on;
	/* whether an array argument would be shared with the caller;
	:DECLARE aResults;

	aResults := {};

	AAdd(aResults, DoProc("TestFormatIdReturnsPaddedId"));
	AAdd(aResults, DoProc("TestFormatIdRejectsEmptyInput"));
	AAdd(aResults, DoProc("TestFormatIdHandlesNoMatch"));

	DoProc("ReportResults", {aResults});

	:RETURN aResults;
:ENDPROC;

:PROCEDURE TestFormatIdReturnsPaddedId;
	/* Success path: a numeric id is padded to six characters;
	:DECLARE sActual;

	sActual := ExecFunction("SampleUtils.FormatId", {42});

	:RETURN DoProc("CheckEqual", {"FormatId pads to six", "000042", sActual});
:ENDPROC;

:PROCEDURE TestFormatIdRejectsEmptyInput;
	/* Failure path: an empty id returns NIL rather than a formatted blank;
	:DECLARE vActual;

	vActual := ExecFunction("SampleUtils.FormatId", {""});

	:RETURN DoProc("CheckTrue", {"FormatId returns NIL on empty input", vActual == NIL});
:ENDPROC;

:PROCEDURE TestFormatIdHandlesNoMatch;
	/* Empty case: an id with no matching sample returns an empty string,;
	/* not a declared-but-unassigned variable;
	:DECLARE sActual;

	sActual := ExecFunction("SampleUtils.FormatId", {-1});

	:RETURN DoProc("CheckEqual", {"FormatId returns empty on no match", "", sActual});
:ENDPROC;

:PROCEDURE CheckEqual;
	/* Returns {label, passed}. Uses == because = is prefix matching for;
	/* strings and would pass on a partial match. LimsString formats either;
	/* operand for the message - Str would reject a non-numeric value;
	:PARAMETERS sLabel, vExpected, vActual;
	:DECLARE bPassed;

	bPassed := (vExpected == vActual);

	:IF .NOT. bPassed;
		ErrorMes("SSL unit test", sLabel + " - expected [" + LimsString(vExpected)
			+ "] got [" + LimsString(vActual) + "]");
	:ENDIF;

	:RETURN {sLabel, bPassed};
:ENDPROC;

:PROCEDURE CheckTrue;
	/* Returns {label, passed} for a condition the caller already evaluated;
	:PARAMETERS sLabel, bCondition;

	:IF .NOT. bCondition;
		ErrorMes("SSL unit test", sLabel + " - condition was false");
	:ENDIF;

	:RETURN {sLabel, bCondition};
:ENDPROC;

:PROCEDURE ReportResults;
	/* Logs one line per failure plus a tally. Reads aResults only;
	:PARAMETERS aResults;
	:DECLARE i, nPassed, nTotal;

	nPassed := 0;
	nTotal := Len(aResults);

	:FOR i := 1 :TO nTotal;
		:IF aResults[i][2];
			nPassed := nPassed + 1;
		:ENDIF;
	:NEXT;

	InfoMes("SSL unit test", "Passed " + Str(nPassed) + " of " + Str(nTotal));

	:RETURN nPassed;
:ENDPROC;
```

## Things this template is doing on purpose

- **Each test returns its result; nothing is accumulated through an
  argument.** Whether SSL passes an array to a procedure by reference or
  by value is not documented in the reference, and a harness that
  depends on the answer fails *silently* if the answer turns out to be
  "by value" — every test would pass, because no result was ever
  recorded. Returning `{label, passed}` and letting `RunTests` do the
  `AAdd` sidesteps the question entirely. Prefer a return value over a
  mutated argument in any SSL you write, for the same reason.
- `==` in `CheckEqual`, never `=`. For strings `=` is a prefix match,
  so `"000042" = "0"` is true and the assertion would pass on a wrong
  value.
- `LimsString` builds the failure message, not `Str`. `Str` takes a
  **number**; passing it a string is a type error that `ssl_diagnose`
  does not catch, because the validator does not check built-in
  argument types. `LimsString` accepts any value and renders NIL as
  `"NIL"`. `Str` is correct in `ReportResults`, where the arguments
  really are numbers.
- Arrays are 1-based: `aResults[i][2]` is the boolean of the `i`th
  result.
- `ErrorMes` and `InfoMes` are server **log** functions, not display
  functions. The user reads the results in the server log.
- `DoProc("TestX")` with no argument array — omit a trailing optional
  parameter rather than passing an empty one.
- Every comment ends with `;` alone. A `;` inside comment text ends the
  comment early and turns the rest of the line into code — note how the
  two-line comment in `TestFormatIdHandlesNoMatch` ends its first line
  with `,;` to carry the sentence onto a new comment line.
- `DoProc` for same-file procedures, `ExecFunction` for the external
  entry point under test.
- The template is shown **as the formatter produces it**, with
  tab-indented procedure bodies. Copy that shape; do not hand back a
  flat block.

## Testing a class

A class file has no script entry point, so a test file for a class
creates an instance and exercises it:

```ssl
:PROCEDURE TestApproverAcceptsValidSample;
	/* Creates the class under test and exercises one method;
	:DECLARE oApprover, bActual;

	oApprover := CreateUdObject("SampleApprover");
	bActual := oApprover:CanApprove(42);

	:RETURN DoProc("CheckTrue", {"CanApprove accepts a valid sample", bActual});
:ENDPROC;
```

`DoProc` is a compile error inside class methods, so assertion helpers
live in the test script, never in the class under test.

Verify the exact class-name string with `ssl_lookup` rather than
assuming a dotted path resolves. Built-in classes are never created this
way — they use brace construction such as `Email{}`.

## Before you deliver

1. Run `ssl_format` on the test file.
2. Run `ssl_diagnose` — zero errors and zero warnings.
3. Verify every built-in you used via `ssl_lookup` or `ssl_signature`.
4. Report: the test file path, which procedures and cases are covered,
   any precondition the user must set up, and **that the tests are
   unexecuted**.
