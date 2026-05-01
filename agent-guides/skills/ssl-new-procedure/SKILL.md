---
name: ssl-new-procedure
description: Scaffold a new SSL procedure with correct structure, naming conventions, and documentation header.
argument-hint: "<procedure-name> [parameters...]"
allowed-tools: Read, Write, Edit, Grep, Glob
---

Generate a new SSL procedure skeleton using `$ARGUMENTS` (first token is the procedure name, remaining tokens are parameter names).

## Instructions

1. **Parse arguments:**
   - `<procedure-name>` = `$0` — the procedure name (use as-is if already PascalCase; convert if not)
   - `[parameters...]` = remaining tokens — each becomes a `:PARAMETERS` entry

2. **Validate the proposed procedure name against the built-in inventory.**
   Check `ssl-style-guide/ssl-element-reference.json` (or MCP `ssl_lookup`)
   to see whether `<procedure-name>` collides with one of the 330 built-in
   functions. If it does, warn the user — calling the user-defined
   procedure via `DoProc("Name", ...)` will work, but a bare `Name(...)`
   call would resolve to the built-in. Suggest a non-colliding alternative
   name unless the user explicitly wants to shadow the built-in.

3. **Use these core SSL rules in the scaffold:**
   - Colon-prefixed keywords must be UPPERCASE
   - Almost every statement, including comments, must end with `;`
   - Never place `;` inside comment body text
   - `:PARAMETERS` must come immediately after `:PROCEDURE`
   - `:DEFAULT` must come immediately after `:PARAMETERS`
   - `:DECLARE` must appear before body statements
   - Prefer tabs for indentation; if adapting to an existing space-indented file,
     preserve 4-space indentation
   - Use one statement per line
   - Use `==` for exact string equality
   - Use `DoProc("ProcName", {args})` for same-file script procedure calls
   - `:TRY` requires at least one `:CATCH` or `:FINALLY`; only one `:CATCH` per `:TRY`
   - `:TRY` body requires at least one statement; `:FINALLY` body (if present) requires at least one statement
   - `:RETURN`, `:EXITFOR`, `:EXITWHILE`, and `:LOOP` inside a `:FINALLY` block are compile errors

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
/* RETURNS:   [Return value description or "Nothing"];
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
   - Procedure name: PascalCase (e.g., `CalculateTotal`, `GetInvoiceData`)
   - Parameter names: Hungarian notation (`sName`, `nQty`, `bFlag`, `dDate`,
     `aItems`, `oObj`, `fnFilter`, `vValue`)
   - `:DEFAULT` lines: one per parameter, placed immediately after `:PARAMETERS`
     - String params default to `""`
     - Numeric params default to `0`
     - Boolean params default to `.F.`
     - Date params default to `NIL`
     - Array params default to `{}`
     - Object params default to `NIL`
     - Code block params default to `NIL`
     - Variant params default to `NIL`
   - `:DECLARE` line: declare local variables, including an appropriately typed
     result variable when the procedure returns a value
   - Include `:TRY` / `:CATCH` / `:ENDTRY` skeleton around the body
   - Inside `:CATCH`, use `GetLastSSLError()` if you need error details
   - Include `:RETURN` at end of try body
   - All statements must end with `;`
   - Indentation: use tabs by default

7. **If no parameters are provided:** omit `:PARAMETERS` and `:DEFAULT` blocks entirely.

8. **Output:** Present the generated procedure as an SSL code block. If the user
   provided a target file path, write it there; otherwise return the scaffold
   directly.

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
