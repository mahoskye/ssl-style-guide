---
name: ssl-new-procedure
description: Scaffold a new SSL procedure with correct structure, naming conventions, and documentation header.
argument-hint: "<procedure-name> [parameters...]"
---

Generate a new SSL procedure skeleton using `$ARGUMENTS` (first token is the procedure name, remaining tokens are parameter names).

## Instructions

1. **Parse arguments:**
   - `<procedure-name>` = `$0` — the procedure name (use as-is if already PascalCase; convert if not)
   - `[parameters...]` = remaining tokens — each becomes a `:PARAMETERS` entry

2. **Use these core SSL rules in the scaffold:**
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

3. **Infer parameter types from Hungarian notation prefixes:**
   - If a parameter already has a prefix (`sName`, `nQty`, `bFlag`, `dDate`,
     `aItems`, `oObj`, `fnFilter`, `vValue`) — keep it as-is
   - If no prefix is recognizable, default to `s` prefix (string) and note the assumption

4. **Generate the procedure** following this structure:

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

5. **Apply these rules:**
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

6. **If no parameters are provided:** omit `:PARAMETERS` and `:DEFAULT` blocks entirely.

7. **Output:** Present the generated procedure as an SSL code block. Ask the user if they want it written to a file.

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
