---
name: ssl-new-procedure
description: Scaffold a new SSL procedure with correct structure, naming conventions, and documentation header. Use when asked to create, scaffold, or add a new SSL procedure.
argument-hint: "<procedure-name> [parameters...]"
allowed-tools: Read, Write, Edit, Grep, Glob, mcp__ssl-reference__ssl_lookup, mcp__ssl-reference__ssl_validate_naming, mcp__ssl-reference__ssl_diagnose
---

Generate a new SSL procedure skeleton using `$ARGUMENTS` (first token is the procedure name, remaining tokens are parameter names).

## Instructions

1. **Parse arguments:**
   - `<procedure-name>` = `$0` — the procedure name (use as-is if already PascalCase; convert if not)
   - `[parameters...]` = remaining tokens — each becomes a `:PARAMETERS` entry

2. **Validate the proposed procedure name against the built-in inventory.**
   Check via MCP `ssl_lookup`/`ssl_validate_naming` when available, else
   `ssl-style-guide/ssl-element-reference.json`, whether `<procedure-name>`
   collides with a built-in function (currently 330). If it does, warn the
   user — calling the user-defined
   procedure via `DoProc("Name", ...)` will work, but a bare `Name(...)`
   call would resolve to the built-in. Suggest a non-colliding alternative
   name unless the user explicitly wants to shadow the built-in.

3. **Use these core SSL rules in the scaffold:**
   <!-- rules: id=keyword_uppercase,statement_semicolon,no_semicolon_in_comment_text,indent_tabs_preferred,one_statement_per_line,equals_vs_strict_equals,parameters_first,default_after_parameters,declare_locals_at_start,doproc_for_same_file_procedures,try_requires_handler,single_catch_per_try,try_and_finally_bodies_not_empty,no_control_exit_in_finally wrap=80 -->
   - Colon-prefixed SSL keywords are uppercase and case-sensitive, for example
     `:IF` and `:BEGINCASE`.
   - Almost every SSL statement, including comments, must end with a semicolon.
   - Never include a semicolon inside comment text; the first semicolon ends the
     comment and the remaining text becomes executable code.
   - Prefer tabs for indentation; if the file already uses spaces, preserve
     4-space indentation.
   - Use one statement per line.
   - Use `==` for exact string equality; `=` is prefix-style for strings.
   - `:PARAMETERS` must appear before any other statements in a script or
     procedure body.
   - `:DEFAULT` must immediately follow `:PARAMETERS`.
   - Declare locals at the start of the script or procedure; this is a style
     preference, because `:DECLARE` is valid anywhere a statement is.
   - Use `DoProc("ProcName", {args})` for same-file script procedures.
   - `:TRY` requires at least one of `:CATCH` or `:FINALLY`; a bare
     `:TRY ... :ENDTRY` is invalid.
   - Only one `:CATCH` block is allowed per `:TRY`; there is no multi-catch.
   - The `:TRY` body requires at least one statement, and so does a `:FINALLY`
     body; a `:CATCH` body may be empty.
   - Do not use `:RETURN`, `:EXITFOR`, `:EXITWHILE`, or `:LOOP` inside
     `:FINALLY`.
   <!-- /rules -->

4. **Infer parameter types from Hungarian notation prefixes:**
   - If a parameter already has a prefix (`sName`, `nQty`, `bFlag`, `dDate`,
     `aItems`, `oObj`, `fnFilter`, `vValue`) — keep it as-is
   - If no prefix is recognizable, default to `s` prefix (string) and note the assumption

5. **Generate the procedure** following this structure:

```ssl
/* =============================================================================;
/* PROCEDURE: ProcedureName;
/* PURPOSE:   [Describe what this procedure does];
/* PARAMS:    paramName — description;
/*            paramName — description;
/* RETURNS:   [Return value description, or "" (empty string) if no value];
/* =============================================================================;
:PROCEDURE ProcedureName;
	:PARAMETERS param1, param2;
	:DEFAULT param1, "";
	:DEFAULT param2, 0;
	:DECLARE sResult;

	:TRY;
		/* Procedure body here;

		:RETURN sResult;
	:CATCH;
		/* Log or handle the error;
		:RETURN NIL;
	:ENDTRY;

:ENDPROC;
```

6. **Apply these rules:**
   <!-- rules: id=procedure_class_pascal_case,hungarian_variable_names,default_after_parameters,default_value_by_type,statement_semicolon,indent_tabs_preferred wrap=80 -->
   - Procedures and classes use PascalCase.
   - Variables use Hungarian-style camelCase: a type prefix, then a camelCase
     body (`sMyVar`, not `s_my_var` or `SMYVAR`).
   - `:DEFAULT` must immediately follow `:PARAMETERS`.
   - Default a parameter to the empty value of its prefix type: `""` for
     strings, `0` for numbers, `.F.` for booleans, `{}` for arrays, and `NIL`
     for dates, objects, code blocks and variants.
   - Almost every SSL statement, including comments, must end with a semicolon.
   - Prefer tabs for indentation; if the file already uses spaces, preserve
     4-space indentation.
   <!-- /rules -->
   - Write one `:DEFAULT` line per parameter.
   - `:DECLARE` line: declare local variables, including an appropriately typed
     result variable when the procedure returns a value
   - Include `:TRY` / `:CATCH` / `:ENDTRY` skeleton around the body
   <!-- rules: id=get_last_ssl_error_in_catch,clear_last_ssl_error_after_handling,raise_error_inside_handling_try,no_raise_error_in_catch,every_raise_has_handler_boundary wrap=80 -->
   - Use `GetLastSSLError()` inside `:CATCH` to retrieve error details.
   - Call `ClearLastSSLError()` after handling an error in `:CATCH`, so stale
     error state does not leak into later handling.
   - Place `RaiseError` directly inside the `:TRY` block whose `:CATCH` handles
     it, so the raise can never escape.
   - Never call `RaiseError` inside `:CATCH` — the error handler must not become
     the thing that crashes.
   - Every raise needs a `:TRY`/`:CATCH` (or legacy `:ERROR`/`:RESUME`) boundary
     somewhere up the call stack; an uncaught error fails the invocation and
     surfaces to the end user as a server error.
   <!-- /rules -->
   - Include `:RETURN` at end of try body
   - If the user says the procedure is an internal helper, add `/*@private;`,
     which hides it from external dispatch:
     <!-- rules: id=visibility_annotation_form,visibility_annotations_script_only wrap=80 -->
     - Put an access modifier on its own line immediately before `:PROCEDURE`,
       with no blank line between them.
     - Do not put `/*@private;` or `/*@protected;` on class methods; they affect
       script procedures only, and class methods are always public.
     <!-- /rules -->

7. **If no parameters are provided:** <!-- rule: omit_parameters_when_none -->Leave out `:PARAMETERS` and `:DEFAULT` when a procedure or method takes no parameters.<!-- /rule -->

8. **Output:** Present the generated procedure as an SSL code block. If the user
   provided a target file path, write it there; otherwise return the scaffold
   directly.

9. **Verify:** if the scaffold was written to a file and MCP `ssl_diagnose` is
   available, run it and confirm the scaffold parses with zero errors before
   reporting done. Without MCP, state that the scaffold has not been
   machine-validated.

---

## Example

Input: `/ssl-new-procedure CalculateTotal nQty nPrice`

Output:
```ssl
/* =============================================================================;
/* PROCEDURE: CalculateTotal;
/* PURPOSE:   [Describe what this procedure does];
/* PARAMS:    nQty   — quantity;
/*            nPrice — unit price;
/* RETURNS:   Numeric total;
/* =============================================================================;
:PROCEDURE CalculateTotal;
	:PARAMETERS nQty, nPrice;
	:DEFAULT nQty, 0;
	:DEFAULT nPrice, 0;
	:DECLARE nTotal;

	:TRY;
		nTotal := nQty * nPrice;

		:RETURN nTotal;
	:CATCH;
		/* Log or handle the error;
		:RETURN 0;
	:ENDTRY;

:ENDPROC;
```

---

## Output

Present the generated procedure as an SSL code block. If the user provided a
target file path, write it there.
