# SSL Refactoring Guide for AI Agents

This document provides refactoring instructions for AI agents working with STARLIMS Scripting Language (SSL). Use alongside `ssl_agent_instructions.md` (the language reference).

---

## Quick Reference: Critical Rules

Before starting any refactoring:

1. **Verify before assuming** - Search the codebase to confirm something is missing before adding it
2. **Track your progress** - Use the progress template at the end of this document
3. **Preserve behavior** - Refactoring changes structure, not functionality
4. **Format consistently** - Apply the formatting rules in this document
5. **Complete the work** - No stubs, placeholders, or partial implementations

---

## Part 1: Refactoring Workflow

### 1.1 Pre-Refactoring Checklist

Before modifying any file:

- [ ] Read the entire file to understand current structure and behavior
- [ ] Identify the file type: server script, class, SSL data source, or SQL data source (data sources use different parameter syntax — see §2.4)
- [ ] Identify all procedures and their calling relationships
- [ ] Note any external calls (ExecFunction) and internal calls (DoProc)
- [ ] Search for usages of the file/procedures in other files
- [ ] Document the scope of changes in your progress notes

### 1.2 Refactoring Steps

```
1. STUDY    → Read target file(s), understand structure and dependencies
2. PLAN     → Document what changes you will make and why
3. REFACTOR → Make changes following style/structure rules
4. FORMAT   → Apply formatting rules, verify semicolons and indentation
5. VALIDATE → Verify all procedures are complete, no stubs/placeholders
6. DOCUMENT → Update progress notes with discoveries and completions
```

### 1.3 When to Stop and Reassess

- If you discover the file is significantly more complex than expected
- If changes would affect external callers not in scope
- If you find errors in the existing code that need separate discussion
- If the file has undocumented dependencies

---

## Part 2: Code Structure Standards

### 2.1 Script Layout Schema

Refactored SSL scripts should follow this target structure in order:

```
┌────────────────────────────────────────┐
│ 1. HEADER COMMENT                      │
│    (Description, Parameters, Returns,  │
│     Author, Date, Modification History)│
├────────────────────────────────────────┤
│ 2. PARAMETERS                          │
│    :PARAMETERS param1, param2;         │
├────────────────────────────────────────┤
│ 3. DEFAULTS                            │
│    :DEFAULT param1, "";                │
│    :DEFAULT param2, 0;                 │
├────────────────────────────────────────┤
│ 4. INCLUDES                            │
│    :INCLUDE LibraryName;               │
├────────────────────────────────────────┤
│ 5. PUBLIC / DECLARATIONS               │
│    :PUBLIC sSharedValue;               │
│    :DECLARE nVar1, sVar2;              │
├────────────────────────────────────────┤
│ 6. MAIN SCRIPT LOGIC                   │
│    (Entry point code, procedure calls) │
├────────────────────────────────────────┤
│ 7. PROCEDURE DEFINITIONS               │
│    (Local procedures, grouped by       │
│     region if appropriate)             │
└────────────────────────────────────────┘
```

**Ordering rules:**

<!-- rules: id=parameters_first,default_after_parameters,include_early,script_declaration_order -->
- `:PARAMETERS` must appear before any other statements in a script or procedure body.
- `:DEFAULT` must immediately follow `:PARAMETERS`.
- Place `:INCLUDE` early — it textually includes the referenced source before the script runs.
- Recommended script order is `:PARAMETERS`, `:DEFAULT`, `:INCLUDE`, `:PUBLIC`, `:DECLARE`.
<!-- /rules -->

`:DECLARE` and `:PUBLIC` are regular statements and can appear anywhere.
`:INCLUDE` is resolved as a textual paste before the rest of the file is
read, so its position is technically flexible.

> **Data source files do not follow this layout.** <!-- rule: datasource_not_script_layout -->Do not apply normal script `:PARAMETERS`/`:DEFAULT` layout to data-source files.<!-- /rule --> SSL and SQL data source files are preprocessed before they run and use different parameter syntax (`:PARAMETERS p1 := val;` with inline defaults instead of separate `:DEFAULT` statements). They may also contain preprocessor directives (`:DSN`, `:TABLENAME`, etc.) that are not part of the standard SSL language. See `ssl_agent_instructions.md` §4A for details.

### 2.2 Header Template

```ssl
/* ********************************************************************************
Description.. : Brief description of script purpose
Parameters... : - sParam1 - Description of parameter 1
                - nParam2 - Description of parameter 2
                (Use "-" if no parameters)
Returns...... : - Description of return value
                (Use "-" if no return value)
Author....... : Original author
Date......... : YYYY-MM-DD
Ticket....... : Reference ticket number (if applicable)
********************************************************************************
_______________________________________________________________________________
Ticket....... : Issue reference
Modification. : Change description
Author....... : Modifier name
Date......... : YYYY-MM-DD
_______________________________________________________________________________
********************************************************************************;
```

### 2.3 Procedure Definition

```ssl
/* Brief description of what this procedure does;
:PROCEDURE ProcedureName;
:PARAMETERS sParam1, nParam2;
:DEFAULT sParam1, "";
:DEFAULT nParam2, 0;
:DECLARE nLocalVar, sResult;

    /* Procedure logic here;

    :RETURN sResult;
:ENDPROC;
```

<!-- rule: max_params_warning -->Keep procedures to at most 8 parameters; more than 20 parameters on a procedure or method draws a warning, so group related state into arrays or objects.<!-- /rule --> The wrapper-core pattern (§6.4) is another way to keep a parameter list short.

### 2.4 Data Source File Structure

Data source files have a different structure from scripts and classes. Do not apply the standard script layout (§2.1) to data source files.

**SSL Data Source layout:**
```
┌────────────────────────────────────────┐
│ 1. HEADER COMMENT (optional)           │
├────────────────────────────────────────┤
│ 2. PARAMETERS (inline := defaults)     │
│    :PARAMETERS p1 := val, p2 := val;   │
├────────────────────────────────────────┤
│ 3. SSL SCRIPT BODY                     │
│    (Standard SSL code)                 │
└────────────────────────────────────────┘
```

**SQL Data Source layout:**
```
┌────────────────────────────────────────┐
│ 1. HEADER COMMENT (optional)           │
├────────────────────────────────────────┤
│ 2. BUILDER DIRECTIVES                  │
│    :DSN := connectionName;             │
│    :TABLENAME := tableName;            │
│    :NULLASBLANK := true;               │
│    :INVARIANTDATECOLUMNS := col1, col2;│
├────────────────────────────────────────┤
│ 3. PARAMETERS (inline := defaults)     │
│    :PARAMETERS p1 := val, p2 := val;   │
├────────────────────────────────────────┤
│ 4. SQL QUERY                           │
│    SELECT ... FROM ... WHERE ...       │
└────────────────────────────────────────┘
```

**Key differences when refactoring data source files:**
<!-- rules: id=no_default_statements_in_datasource,datasource_default_required,no_flag_builder_directives -->
- Data source files use inline `:PARAMETERS` defaults with `:=` instead of separate `:DEFAULT` statements.
- Give every data-source parameter an inline `:=` default; a parameter without one makes the data source fail when it runs.
- SQL data-source builder directives (`:DSN`, `:TABLENAME`, `:NULLASBLANK`, `:INVARIANTDATECOLUMNS`) are preprocessed before compilation and are not normal SSL keywords; do not flag them as unknown keywords.
<!-- /rules -->

For example, `:PARAMETERS sName := "", nCount := 10;`. A parameter without a
default fails with `No default value for one or more parameters.` The
preprocessor rewrites everything into standard SSL before the script runs.

### 2.5 Regions for Organization

<!-- rules: id=regions_group_related_procedures,comment_regions_for_grouping -->
- Use regions for meaningful groups of related procedures; do not create one region per procedure.
- Use `/* region` / `/* endregion` comments for editor grouping instead of `:REGION` / `:ENDREGION`.
<!-- /rules -->

> **Important:** `:REGION`/`:ENDREGION` is a legacy functional construct that captures body text for later retrieval via `GetRegion()`.

```ssl
/* region Data Processing;

:PROCEDURE ValidateData;
    /* ... ;
:ENDPROC;

:PROCEDURE TransformData;
    /* ... ;
:ENDPROC;

/* endregion;

/* region Error Handling;

:PROCEDURE LogError;
    /* ... ;
:ENDPROC;

/* endregion;
```

---

## Part 3: Formatting Rules

These formatting rules are style conventions and match the starlims-lsp formatter defaults.

### 3.1 Indentation

<!-- rules: id=indent_tabs_preferred,consistent_indentation,indent_block_bodies,dedent_closing_keywords,same_level_block_keywords,exitcase_statement_level,class_members_top_level -->
- Prefer tabs for indentation; if the file already uses spaces, preserve 4-space indentation.
- Keep indentation consistent within a file; do not mix tabs and spaces.
- Indent the body of a block one level: `:IF`, `:WHILE`, `:FOR`, `:BEGINCASE`, `:TRY`, `:PROCEDURE`, `:REGION` and `:BEGININLINECODE` open an indented body, and each nested block adds one more level.
- Dedent a closing keyword to the level of the keyword that opened its block: `:ENDIF`, `:ENDWHILE`, `:NEXT`, `:ENDCASE`, `:ENDTRY`, `:ENDPROC`, `:ENDREGION` and `:ENDINLINECODE`.
- Put `:ELSE`, `:CASE`, `:OTHERWISE`, `:CATCH` and `:FINALLY` at the level of the keyword that opened their block, then indent the body that follows them one level.
- Indent `:EXITCASE` at the level of the other statements in its branch; it does not change the indentation.
- Do not indent the class body because of `:CLASS`; class members stay at the file's top indentation level.
<!-- /rules -->

<!-- rule: exitcase_last_in_branch -->`:EXITCASE` must be the last statement of its `:CASE`/`:OTHERWISE` branch, directly in the branch body; one nested inside `:IF`, or followed by another statement, is a compile error.<!-- /rule --> To leave the block from part of a branch, split the branch into separate `:CASE` conditions instead.

`:CLASS` establishes class context, but because it has no closing keyword and a file
contains only one class, class members stay at the file's top indentation level.

### 3.2 Spacing

<!-- rules: id=operator_spacing,comma_spacing,no_space_inside_parens,no_space_before_call_paren,skip_commas_adjacent,member_access_no_spaces,empty_optional_param_array -->
- Use spaces around assignment, arithmetic, comparison, and logical operators.
- Put a space after each comma and none before it.
- Do not put spaces just inside parentheses: `DoProc("Name", {args})`, not `DoProc( "Name", {args} )`.
- Do not put a space between a function name and its `(`: `Len(sValue)`, not `Len (sValue)`.
- Use adjacent commas with no spaces for skipped optional parameters.
- Prefer no spaces around `:` in member access even though SSL accepts spaced forms.
- Do not pass empty trailing optional parameters when they can be omitted.
<!-- /rules -->

| Context | Correct | Incorrect |
|---------|---------|-----------|
| Assignment | `x := 1;` | `x:=1;` |
| Comparison | `a > b` | `a>b` |
| Logical | `a .AND. b` | `a.AND.b` |
| Arithmetic | `x + y * z` | `x+y*z` |
| Commas | `a, b, c` | `a,b,c` or `a ,b ,c` |
| Parentheses | `DoProc("Name", {args})` | `DoProc( "Name" , { args } )` |
| Function calls | `Len(sValue)` | `Len (sValue)` |
| Skipped params | `RunSQL(sSQL,, aVals)` | `RunSQL(sSQL, , aVals)` |
| Trailing optional arguments | `DoProc("Name")`, `GetDataSet(sQuery)` | `DoProc("Name", {})`, `GetDataSet(sQuery, {})` |

SSL accepts both `oObj:Prop` and `oObj : Prop`; keep the surrounding style
when preserving it matters. The runtime pads missing arguments with NIL.

### 3.3 Line Length

<!-- rules: id=ssl_max_line_length,continuation_line_breaks -->
- Keep SSL lines to about 90 characters, breaking longer ones at logical points.
- Break a multi-line function call after a comma and a multi-line condition before `.AND.` or `.OR.`, and indent each continuation line one level.
<!-- /rules -->

Multi-line function calls:
```ssl
vResult := DoProc("ProcessData", {
    param1,
    param2,
    param3
});
```

Multi-line conditions:
```ssl
:IF condition1
    .AND. condition2
    .AND. condition3;
```

### 3.4 Statement Termination

<!-- rules: id=statement_semicolon,no_semicolon_on_continuation_lines -->
- Almost every SSL statement, including comments, must end with a semicolon.
- Do not end a continuation line of a multi-line statement with a semicolon; only the line that completes the statement takes one.
<!-- /rules -->

### 3.5 Blank Lines

<!-- rules: id=blank_line_between_procedures,blank_line_between_sections -->
- Put one blank line between procedures.
- Put one blank line between logical sections and between regions: after the declarations, before a control block that follows code and after its closer when more code follows, before a section comment that follows code, and before a procedure's final `:RETURN`; add none at the start or end of a body.
<!-- /rules -->

Inside procedures, use blank lines as readability needs.

### 3.6 SQL String Formatting (Canonical Compact Style)

SQL strings use **canonical compact** formatting. Core rules:

<!-- rules: id=sql_keyword_case,sql_identifier_case,sql_ssl_embedding_indent,sql_major_clause_column,sql_select_continuation,sql_and_or_indent,sql_on_indent,sql_trailing_commas,sql_max_line_length -->
- Inside SQL strings, write SQL keywords and built-in functions in uppercase.
- Preserve the author's casing for table names, column names and aliases; force-folding is dialect-conditional (safe on Oracle, but breaks case-sensitive SQL Server collations), so lowercase only Oracle-only code.
- Indent the whole SQL block 4 spaces inside the SSL string literal.
- Start each major clause at column 0 relative to the 4-space indent: `SELECT`, `FROM`, `WHERE`, `INNER JOIN`, `LEFT OUTER JOIN`, `RIGHT OUTER JOIN`, `FULL OUTER JOIN`, `CROSS JOIN`, `GROUP BY`, `ORDER BY`, `UNION`, `UNION ALL`, `INTERSECT`, `MINUS`, `INSERT INTO`, `VALUES`, `UPDATE`, `DELETE FROM`, `MERGE INTO`, `USING`, `WHEN MATCHED THEN`, `WHEN NOT MATCHED THEN`, `START WITH`, `CONNECT BY`, `PIVOT`, `UNPIVOT`, `FOR UPDATE`, `RETURNING`.
- Align `SELECT` continuation lines to the first column (column 7).
- Start each `AND`/`OR` condition on its own line, indented 2 spaces under `WHERE`; in a join condition it aligns with `ON`, and in a `HAVING` condition with `HAVING`.
- Indent `ON` 2 spaces under its `JOIN` (in `MERGE`, `ON` stays at column 0).
- Put commas at the end of the line (trailing comma style), not at the start of the next line.
- Keep SQL lines to about 90 characters, breaking at logical points.
<!-- /rules -->

```ssl
aResults := SQLExecute("
    SELECT ordno, testcode, status
    FROM ordtask
    WHERE status = ?sStatus?
      AND ordno = ?sOrdNo?
    ORDER BY ordno
");
```

> **Full reference:** See `ssl-style-guide/sql-canonical-compact-reference.md` for
> comprehensive formatting examples covering JOINs, CTEs, MERGE, window functions,
> PIVOT, hierarchical queries, DDL, and SSL embedding patterns.

---

## Part 4: Naming Conventions

### 4.1 Variable Prefixes (Hungarian Notation)

| Type | Prefix | Examples |
|------|--------|----------|
| String | `s` | `sName`, `sOrderNo` |
| Numeric | `n` | `nCount`, `nTotal` |
| Boolean | `b` | `bIsValid`, `bExists` |
| Date | `d` | `dStartDate`, `dExpiry` |
| Array | `a` | `aResults`, `aOrderList` |
| Object | `o` | `oCustomer`, `oDataset` |
| Code Block | `fn` | `fnFilter`, `fnCallback` |
| Any/Variant | `v` | `vResult`, `vParam` |

<!-- rules: id=hungarian_variable_names,prefix_matches_type,identifier_length_limits -->
- Variables use Hungarian-style camelCase: a type prefix, then a camelCase body (`sMyVar`, not `s_my_var` or `SMYVAR`).
- Make a variable's prefix match the type of the value it holds: `s` string, `n` numeric, `b` boolean, `d` date, `a` array, `o` object, `fn` code block, `v` variant/any.
- Keep variable names to 20 characters after the type prefix, and procedure and function names to 30 characters.
<!-- /rules -->

**Exceptions:**

<!-- rules: id=loop_counter_names,constants_upper_snake_case -->
- Loop counters may be `i`, `j`, `k`, `x`, `y` or `z` without a prefix only when declared; in a script that calls other scripts, prefer a script-specific name such as `nSampleIdx`.
- Constants use UPPER_SNAKE_CASE.
<!-- /rules -->

An undeclared loop counter can collide with a caller's variable of the same
name.

### 4.2 Procedure Names

<!-- rules: id=procedure_class_pascal_case,procedure_verb_noun_names -->
- Procedures and classes use PascalCase.
- Name procedures as a verb followed by a noun, for example `ValidateOrder`, `ProcessQCSample` or `CalculateTotal`.
<!-- /rules -->

### 4.3 UDO Properties (User-Defined Objects)

<!-- rules: id=udo_property_lower_camel_case -->
- Name user-defined object properties in lowerCamelCase with no type prefix, for example `oOrder:orderNo`.
<!-- /rules -->

More examples: `oState:isValid`, `oData:errorMessage`.

### 4.4 Built-in/System Object Properties

- **Format:** PascalCase (defined by STARLIMS)
- **Examples:** `oError:Description`, `oSeq:SequenceName`

### 4.5 Constants

```ssl
:DECLARE LOGGED_STATUS, MAX_ATTEMPTS, DEFAULT_TIMEOUT;

LOGGED_STATUS := "Logged";
MAX_ATTEMPTS := 3;
DEFAULT_TIMEOUT := 30;
```

> **Note:** All declared variables initialize to empty string `""` (not `NIL`), so a declared-but-unassigned variable is never `NIL` and `var == NIL` stays `.F.` until something assigns `NIL`. Use `Empty(var)` to test for uninitialized/default state — it returns `.T.` for `NIL`, an empty or whitespace-only string, `0`, `.F.`, an empty date and an empty array. `Empty()` is not a NIL test, though: when `0` or `.F.` is a valid value, use `var == NIL` to detect an omitted or explicitly `NIL` argument, or a `NIL` value returned by an API, and compare an unassigned declared variable with `== ""`. <!-- rule: nil_in_operations -->Check for `NIL` before using a value in arithmetic or string operations; test `v == NIL` when `0`, `.F.` or an empty string is a valid value, because `Empty()` is also `.T.` for those.<!-- /rule -->

---

## Part 5: Global Variables

Predefined globals are not part of the language. They are `:PUBLIC` variables that a base installation declares at startup, and installations can add, drop or change them. `MYUSERNAME` (equal to `GetUserData()`) is a common example. <!-- rule: guard_optional_globals -->Do not read a name the base installation does not declare (`CR`, `LF`, `TAB`, `sDQ`, `MYUSERID`, ...); use `Chr(...)` or the documented global instead, and guard a name that only some installations declare with `IsDefined("<name>")`.<!-- /rule --> For example, use `Chr(13)`, `Chr(10)`, `Chr(9)` (or `CRLF`), `MYUSERNAME` and `STARLIMSDEPT` in place of `CR`, `LF`, `TAB`, `sTab`, `MYUSERID` and `MYDEPT`.

| Variable | Type | Description |
|----------|------|-------------|
| `MYUSERNAME` | String | Current user's username |

**Usage examples:**
```ssl
/* Log with current user;
UsrMes("Action performed by: " + MYUSERNAME);

/* Log a caption and a message built from the values you want recorded;
UsrMes("ImportOrders", "Loaded " + LimsString(nCount) + " rows for " + sSiteCode);
```

---

## Part 6: Common Refactoring Patterns

### 6.1 Extract Procedure

**Before:**
```ssl
/* Long inline logic;
:IF !Empty(sOrderNo);
    aData := SQLExecute("SELECT * FROM orders WHERE ordno = ?sOrderNo?");
    :IF Len(aData) > 0;
        nTotal := 0;
        :FOR i := 1 :TO Len(aData);
            nTotal += aData[i, 3];
        :NEXT;
    :ENDIF;
:ENDIF;
```

**After:**
```ssl
/* Clean main logic;
:IF !Empty(sOrderNo);
    nTotal := DoProc("CalculateOrderTotal", {sOrderNo});
:ENDIF;

/* Extracted procedure;
:PROCEDURE CalculateOrderTotal;
:PARAMETERS sOrderNo;
:DECLARE aData, nTotal, i;

    aData := SQLExecute("
        SELECT *
        FROM orders
        WHERE ordno = ?sOrderNo?
    ");
    
    :IF Len(aData) = 0;
        :RETURN 0;
    :ENDIF;
    
    nTotal := 0;
    :FOR i := 1 :TO Len(aData);
        nTotal += aData[i, 3];
    :NEXT;
    
    :RETURN nTotal;
:ENDPROC;
```

### 6.2 Early Exit Pattern

**Before:**
```ssl
:PROCEDURE ProcessOrder;
:PARAMETERS sOrderNo;
:DECLARE bValid;

    bValid := .T.;
    :IF !Empty(sOrderNo);
        :IF DoProc("OrderExists", {sOrderNo});
            :IF DoProc("GetOrderStatus", {sOrderNo}) == "Active";
                /* Long processing logic here;
            :ELSE;
                bValid := .F.;
            :ENDIF;
        :ELSE;
            bValid := .F.;
        :ENDIF;
    :ELSE;
        bValid := .F.;
    :ENDIF;
    :RETURN bValid;
:ENDPROC;
```

**After:**
```ssl
:PROCEDURE ProcessOrder;
:PARAMETERS sOrderNo;

    /* Early exit for invalid inputs;
    :IF Empty(sOrderNo);
        :RETURN .F.;
    :ENDIF;
    
    :IF !DoProc("OrderExists", {sOrderNo});
        :RETURN .F.;
    :ENDIF;

    :IF !(DoProc("GetOrderStatus", {sOrderNo}) == "Active");
        :RETURN .F.;
    :ENDIF;
    
    /* Main processing logic (validation passed);
    /* ... ;
    
    :RETURN .T.;
:ENDPROC;
```

### 6.3 State Object Pattern

**Before:** (scattered related variables)
```ssl
:DECLARE sOrdNo, nTestCode, bIsValid, nErrorCode, sErrorMsg, bProcessed;
```

**After:** (state encapsulated in UDO)
```ssl
:DECLARE oState;
oState := DoProc("InitializeState", {sOrdNo, nTestCode});

:PROCEDURE InitializeState;
:PARAMETERS sOrdNo, nTestCode;
:DECLARE oStateObj;

    oStateObj := CreateUdObject();
    
    /* Input parameters;
    oStateObj:orderNo := sOrdNo;
    oStateObj:testCode := nTestCode;
    
    /* Status tracking;
    oStateObj:isValid := .T.;
    oStateObj:errorCode := 0;
    oStateObj:errorMessage := "";
    oStateObj:processed := .F.;
    
    :RETURN oStateObj;
:ENDPROC;
```

### 6.4 Wrapper-Core Pattern

For operations that need multiple entry points:

```ssl
/* Core implementation (contains the actual logic);
:PROCEDURE ProcessOrders_Core;
:PARAMETERS aOrderNoList;
:DECLARE i;
    /* Process each order in the list;
    :FOR i := 1 :TO Len(aOrderNoList);
        DoProc("ProcessSingleOrder", {aOrderNoList[i]});
    :NEXT;
:ENDPROC;

/* Wrapper for single order;
:PROCEDURE ProcessOrders_Order;
:PARAMETERS sOrderNo;
    DoProc("ProcessOrders_Core", {{sOrderNo}});
:ENDPROC;

/* Wrapper for ASR;
:PROCEDURE ProcessOrders_Asr;
:PARAMETERS sAsrNo;
:DECLARE aOrderNoList;
    aOrderNoList := SQLExecute("
        SELECT ordno
        FROM orders
        WHERE usgs_asrno = ?sAsrNo?
    ");
    :IF Len(aOrderNoList) > 0;
        aOrderNoList := ExtractCol(aOrderNoList, 1);
        DoProc("ProcessOrders_Core", {aOrderNoList});
    :ENDIF;
:ENDPROC;
```

### 6.5 Error Handling Pattern

```ssl
:PROCEDURE ProcessWithErrorHandling;
:PARAMETERS sInput;
:DECLARE oResult, oErr;

    oResult := CreateUdObject();
    oResult:success := .F.;
    oResult:message := "";
    
    :TRY;
        /* Risky operation;
        DoProc("RiskyOperation", {sInput});
        oResult:success := .T.;
        oResult:message := "Completed successfully";
        
    :CATCH;
        oErr := GetLastSSLError();
        oResult:success := .F.;
        oResult:message := "Error: " + oErr:Description;
        UsrMes("Error in ProcessWithErrorHandling", oErr:FullDescription);
        
    :FINALLY;
        /* Cleanup always runs;
        DoProc("CleanupResources");
        
    :ENDTRY;
    
    :RETURN oResult;
:ENDPROC;
```

> **`:FINALLY` restrictions:** The following statements are **rejected** inside a `:FINALLY` block: `:RETURN`, `:EXITFOR`, `:EXITWHILE`, `:LOOP`. Keep `:FINALLY` blocks limited to cleanup logic only.

---

## Part 7: Anti-Patterns to Fix

### 7.1 Direct Procedure Calls

```ssl
/* WRONG - SSL does not support direct calls to custom procedures;
vResult := MyProcedure(arg1, arg2);

/* CORRECT - Use DoProc for same-file procedures;
vResult := DoProc("MyProcedure", {arg1, arg2});

/* CORRECT - Use ExecFunction for other-file procedures;
vResult := ExecFunction("Category.Script.Proc", {arg1, arg2});
```

### 7.2 DoProc Inside Class Methods

```ssl
/* WRONG - An unqualified DoProc target is rejected inside :CLASS methods;
:CLASS MyClass;
:PROCEDURE DoWork;
    DoProc("HelperMethod");
:ENDPROC;

/* CORRECT - Call methods via Me: or Base: inside the class;
:CLASS MyClass;
:PROCEDURE DoWork;
    Me:HelperMethod();
:ENDPROC;

/* ALSO VALID - Fully qualified deployed script procedures may be called via DoProc;
:CLASS MyClass;
:PROCEDURE DoWork;
    DoProc("Category.Script.Procedure", {Me:sFolderNo});
:ENDPROC;
```

### 7.2a Unqualified Class Field Access

```ssl
/* WRONG - a bare identifier never refers to the :DECLARE field;
:CLASS Customer;
:DECLARE sName, nBalance;

:PROCEDURE Initialize;
    :PARAMETERS sNewName;
    sName := sNewName;    /* never writes the field, may update a caller sName;
    nBalance := 0;        /* same problem, the field is untouched;
:ENDPROC;

/* CORRECT - qualify class fields with Me: (or Base: for inherited fields);
:CLASS Customer;
:DECLARE sName, nBalance;

:PROCEDURE Initialize;
    :PARAMETERS sNewName;
    Me:sName := sNewName;
    Me:nBalance := 0;
:ENDPROC;
```

### 7.3 Incorrect SQL Parameter Syntax

```ssl
/* WRONG - Only SQLExecute supports ?varName? syntax;
vResult := RunSQL("UPDATE table SET col = ?sValue? WHERE id = ?nId?");

/* CORRECT - Other functions use positional ? with array;
vResult := RunSQL("UPDATE table SET col = ? WHERE id = ?",, {sValue, nId});

/* CORRECT - SQLExecute can use named parameters;
vResult := SQLExecute("UPDATE table SET col = ?sValue? WHERE id = ?nId?");
```

### 7.3a UDObject Array Property in IN Clause

```ssl
/* WRONG - runtime error: "The current array has more than 1 dimmension.";
oFilter:statusCodes := {"A", "P", "C"};
aData := SQLExecute("SELECT * FROM Sample WHERE Status IN (?oFilter:statusCodes?)");

/* CORRECT - copy UDObject array property to a local variable first;
aStatusCodes := oFilter:statusCodes;
aData := SQLExecute("SELECT * FROM Sample WHERE Status IN (?aStatusCodes?)");
```

### 7.4 Missing EXITCASE

```ssl
/* WRONG - Missing :EXITCASE keeps evaluating later :CASE expressions;
/* Without :EXITCASE, subsequent :CASE expressions are still evaluated and multiple cases may execute;
:BEGINCASE;
:CASE nVal = 1;
    DoProc("DoSomething");
:CASE nVal = 2;
    DoProc("DoSomethingElse");
:ENDCASE;

/* CORRECT - Use :EXITCASE unless multiple matching cases are intentional;
:BEGINCASE;
:CASE nVal = 1;
    DoProc("DoSomething");
    :EXITCASE;
:CASE nVal = 2;
    DoProc("DoSomethingElse");
    :EXITCASE;
:ENDCASE;
```

<!-- rule: exitcase_last_in_branch -->`:EXITCASE` must be the last statement of its `:CASE`/`:OTHERWISE` branch, directly in the branch body; one nested inside `:IF`, or followed by another statement, is a compile error.<!-- /rule --> It cannot be made conditional. When only part of a branch should end the block, split the branch into separate `:CASE` conditions.

### 7.5 Incomplete Refactoring

```ssl
/* WRONG - Placeholder/stub that wastes future effort;
:PROCEDURE ProcessData;
:PARAMETERS oData;
    /* TODO: Implement this later;
    :RETURN NIL;
:ENDPROC;

/* CORRECT - Complete implementation or don't create it;
:PROCEDURE ProcessData;
:PARAMETERS oData;
:DECLARE sResult;
    /* Actual implementation;
    sResult := DoProc("TransformData", {oData});
    :RETURN sResult;
:ENDPROC;
```

### 7.6 Legacy Error Handling (:ERROR/:RESUME)

The `:ERROR`/`:RESUME` keywords are legacy procedure-level error handling. They remain valid, and `:TRY`/`:CATCH`/`:FINALLY` is often easier to target around specific operations in refactoring work.

**How `:ERROR`/`:RESUME` works:**
- `:ERROR;` starts the last section of a procedure (no `:ENDERROR` — the handler runs to `:ENDPROC`). It protects the statements **before** it; the statements after it are the handler body, which must contain at least one statement and runs only when a protected statement fails. A handler placed first protects nothing.
- Without `:RESUME`, the first failure skips the rest of the protected region, runs the handler, and ends the procedure
- With `:RESUME;` as the last handler statement, every failing protected statement runs the handler and execution continues at the statement after the one that failed
- Resume mode has significant performance cost since every protected statement is handled individually

```ssl
/* Legacy handler example;
:PROCEDURE ProcessBatch;
    :DECLARE oErr;

    DoProc("StepOne");
    DoProc("StepTwo");
:ERROR;
    oErr := GetLastSSLError();
    UsrMes("Error: " + oErr:Description);
:RESUME;
:ENDPROC;

/* Structured handler example;
:TRY;
    /* Code that might error;
:CATCH;
    oErr := GetLastSSLError();
    UsrMes("Error: " + oErr:Description);
:FINALLY;
    /* Cleanup;
:ENDTRY;
```

**Refactoring approach:** Identify which statements the `:ERROR`/`:RESUME` was protecting, then decide whether that broader scope is intentional or whether targeted `:TRY`/`:CATCH`/`:FINALLY` blocks would express the behavior more clearly.

### 7.7 String Comparison: `=` vs `==`

```ssl
/* WRONG - = does PREFIX matching for strings;
:IF sStatus = "Log";
    /* This is TRUE when sStatus is "Logged" — probably not intended;
:ENDIF;

/* CORRECT - == does EXACT matching for strings;
:IF sStatus == "Logged";
    /* This is only TRUE when sStatus is exactly "Logged";
:ENDIF;
```

> **Key difference:** For strings, `=` returns `.T.` if the right operand is empty string OR if the left operand *starts with* the right operand (prefix match). `==` returns `.T.` only if both strings are exactly equal. For most other value types, `==` generally parallels `=`. <!-- rule: equals_vs_strict_equals -->Use `==` for exact string equality; `=` is prefix-style for strings.<!-- /rule -->

> **`!=` asymmetry warning:** The `!=` operator negates `==` (exact match), NOT `=` (prefix match). This means `=` and `!=` are **not logical opposites** for strings. For example, `"Logged" = "Log"` is `.T.` (prefix match) AND `"Logged" != "Log"` is also `.T.` (not an exact match) — both true for the same operands. The `<>` and `#` operators behave identically to `!=`. <!-- rule: not_preferred_operator -->Prefer `!=` over `<>` or `#` for not-equals.<!-- /rule -->

### 7.8 Membership Tests

<!-- rule: ascanexact_for_fixed_sets -->Use `AScanExact({...}, value)` when testing membership in a fixed set of exact values; `AScan` matches strings by prefix.<!-- /rule --> Build the candidate list as an array literal or variable. Because of the prefix match, `AScan({"APPROVED"}, "APP")` finds a match, and an empty search string matches the first string element.

```ssl
/* CORRECT - test whether a value is one of several candidates;
:DECLARE aCandidates, nPos, bFound;

aCandidates := {"SWAP", "ADEL", "COPY"};
nPos := AScanExact(aCandidates, Upper(sAction));
bFound := nPos > 0;

:IF bFound;
    DoProc("HandleAction", {sAction});
:ENDIF;
```

For case-insensitive membership tests, normalize before scanning:

```ssl
/* Case-insensitive membership test;
:DECLARE aValid;
aValid := {"ACTIVE", "PENDING", "COMPLETE"};
:IF AScanExact(aValid, Upper(sStatus)) > 0;
    DoProc("ProcessValidStatus", {sStatus});
:ENDIF;
```

`AScan` and `AScanExact` also accept a code block for custom comparison logic:

```ssl
/* Code block scan — find first element matching condition;
nIdx := AScan(aResults, {|row| row[3] > nThreshold});
```

---

## Part 8: Validation Checklist

Run through this checklist after refactoring:

### Structure
<!-- rules: id=file_banner_required,parameters_first,default_after_parameters,declare_before_use,server_script_file_shape,regions_group_related_procedures,visibility_annotation_form,visibility_annotations_script_only format=checklist -->
- [ ] Open every server script and class file with the standard file banner, using the dot-leader fields `Description`, `Parameters`, `Returns`, `Author` and `Date`.
- [ ] `:PARAMETERS` must appear before any other statements in a script or procedure body.
- [ ] `:DEFAULT` must immediately follow `:PARAMETERS`.
- [ ] Declare variables before use with `:DECLARE`.
- [ ] Order a nontrivial server script as: file banner; top-level `:PARAMETERS`, contiguous `:DEFAULT` statements and `:DECLARE`; default state initialization; main orchestration; then local procedures grouped into responsibility-based regions.
- [ ] Use regions for meaningful groups of related procedures; do not create one region per procedure.
- [ ] Put an access modifier on its own line immediately before `:PROCEDURE`, with no blank line between them.
- [ ] Do not put `/*@private;` or `/*@protected;` on class methods; they affect script procedures only, and class methods are always public.
<!-- /rules -->

### Formatting
<!-- rules: id=consistent_indentation,operator_spacing,comma_spacing,ssl_max_line_length,statement_semicolon,no_semicolon_on_continuation_lines format=checklist -->
- [ ] Keep indentation consistent within a file; do not mix tabs and spaces.
- [ ] Use spaces around assignment, arithmetic, comparison, and logical operators.
- [ ] Put a space after each comma and none before it.
- [ ] Keep SSL lines to about 90 characters, breaking longer ones at logical points.
- [ ] Almost every SSL statement, including comments, must end with a semicolon.
- [ ] Do not end a continuation line of a multi-line statement with a semicolon; only the line that completes the statement takes one.
<!-- /rules -->

### Naming
<!-- rules: id=hungarian_variable_names,procedure_class_pascal_case,procedure_verb_noun_names,udo_property_lower_camel_case,constants_upper_snake_case format=checklist -->
- [ ] Variables use Hungarian-style camelCase: a type prefix, then a camelCase body (`sMyVar`, not `s_my_var` or `SMYVAR`).
- [ ] Procedures and classes use PascalCase.
- [ ] Name procedures as a verb followed by a noun, for example `ValidateOrder`, `ProcessQCSample` or `CalculateTotal`.
- [ ] Name user-defined object properties in lowerCamelCase with no type prefix, for example `oOrder:orderNo`.
- [ ] Constants use UPPER_SNAKE_CASE.
<!-- /rules -->

### Logic
<!-- rules: id=no_direct_procedure_calls,me_base_for_method_calls,field_access_via_me,prefer_exitcase,otherwise_for_default_handling format=checklist -->
- [ ] Do not call custom script procedures directly as `MyProc()`.
- [ ] Call sibling or inherited methods with `Me:Method()` and `Base:Method()`.
- [ ] Inside class methods, access fields through `Me:fieldName` or `Base:fieldName`.
- [ ] End each `:CASE` / `:OTHERWISE` block with `:EXITCASE;` unless multi-match behavior is intentional.
- [ ] Include `:OTHERWISE` for default handling; the language does not require it.
<!-- /rules -->
- [ ] All blocks properly closed (:IF/:ENDIF, etc.)
- [ ] No stubs or placeholders remain
- [ ] Error handling present where appropriate

### SQL (canonical compact style)
<!-- rules: id=sql_keyword_case,sql_identifier_case,sql_and_or_indent,sql_on_indent,sql_having_indent,sql_insert_layout,sql_update_layout,sql_set_operation_spacing,named_sql_param_unsupported,sql_positional_placeholders,getssldataset_at_name_markers format=checklist -->
- [ ] Inside SQL strings, write SQL keywords and built-in functions in uppercase.
- [ ] Preserve the author's casing for table names, column names and aliases; force-folding is dialect-conditional (safe on Oracle, but breaks case-sensitive SQL Server collations), so lowercase only Oracle-only code.
- [ ] Start each `AND`/`OR` condition on its own line, indented 2 spaces under `WHERE`; in a join condition it aligns with `ON`, and in a `HAVING` condition with `HAVING`.
- [ ] Indent `ON` 2 spaces under its `JOIN` (in `MERGE`, `ON` stays at column 0).
- [ ] Indent `HAVING` 2 spaces under `GROUP BY`.
- [ ] In `INSERT`, put the opening `(` on the `INSERT INTO` line, indent the columns 4 spaces, and put the closing `)` on its own line; lay out `VALUES` the same way.
- [ ] In `UPDATE`, keep `SET` on the `UPDATE` line and indent the assignments 4 spaces below it.
- [ ] Put a blank line before and after `UNION`, `UNION ALL`, `INTERSECT` and `MINUS`.
- [ ] `SQLExecute` is the only database API that supports named `?param?` substitution; do not use `?param?` markers with other database functions. Its markers reference in-scope SSL variables by name. Canonical shape: `SQLExecute("UPDATE T SET COL = ?sValue? WHERE ID = ?nId?");`
- [ ] `RunSQL`, `LSearch`, `LSelect`, `LSelect1`, `LSelectC`, and `GetDataSet` use positional `?` markers with a value array in a later argument slot: fourth for `LSearch`, `LSelect` and `LSelectC`, second for `GetDataSet`, and third for `RunSQL` and `LSelect1`. Check `ssl_signature` for the slot and skip unused optionals with adjacent commas. Canonical shape: `aRows := LSelect("SELECT ID FROM T WHERE STATUS = ?",,, {sStatus});`
- [ ] `GetSSLDataset` uses `@name` markers with parallel name and value arrays.
<!-- /rules -->

---

## Part 9: Progress Tracking Template

When refactoring, maintain a progress block in your notes:

```markdown
## Refactoring Progress: [Script Name]

### Scope
- Target file: [filename.ssl]
- Reason: [why refactoring]
- External dependencies: [files that call this, files this calls]

### Checklist
- [ ] Read and understand entire file
- [ ] Identified all procedures and relationships
- [ ] Checked for external usages
- [ ] Apply structure changes
- [ ] Apply formatting
- [ ] Apply naming conventions
- [ ] Validate all rules
- [ ] Document discoveries

### Work Log
- [timestamp] Started analysis...
- [timestamp] Found: [discovery]
- [timestamp] Changed: [what was changed and why]
- [timestamp] Completed validation

### Discoveries
- [Note any issues, edge cases, or things to discuss]
```

---

## Appendix A: File Naming Conventions

| Type | Format | Example |
|------|--------|---------|
| Entry point scripts (UI-called) | UPPERCASE | `PROCESSRECORD.ssl` |
| Data modification scripts | PascalCase | `UpdateRecordStatus.ssl` |
| Core implementation | PascalCase + `_Core` | `ProcessData_Core.ssl` |
| Order-level wrapper | PascalCase + `_Order` | `ProcessData_Order.ssl` |
| Batch-level wrapper | PascalCase + `_Batch` | `ProcessData_Batch.ssl` |
| Validation scripts | PascalCase + `_Check` | `ValidateData_Check.ssl` |

---

## Appendix B: Quick Reference Card

### Block Keywords (case-sensitive, must be uppercase)
```
:IF / :ELSE / :ENDIF
:WHILE / :ENDWHILE
:FOR / :TO / :STEP / :NEXT
:BEGINCASE / :CASE / :OTHERWISE / :EXITCASE / :ENDCASE
:TRY / :CATCH / :FINALLY / :ENDTRY
:PROCEDURE / :ENDPROC
:REGION / :ENDREGION                 (legacy functional body-capture; prefer comment regions for organization)
:DECLARE / :PARAMETERS / :DEFAULT / :PUBLIC
:RETURN / :LABEL / :INCLUDE
:BEGININLINECODE / :ENDINLINECODE    (legacy named code storage)
:EXITFOR / :EXITWHILE / :LOOP
:CLASS / :INHERIT
:ERROR / :RESUME                     (legacy trailing error handler)
```

### Class Rules
<!-- rules: id=class_ends_at_eof,one_class_per_file,one_class_or_script_per_file,explicit_class_name,class_member_order,constructor_after_methods,me_base_for_method_calls,doproc_in_class,constructor_return_value -->
- `:CLASS` continues to end of file; there is no `:ENDCLASS`.
- Define only one `:CLASS` per file.
- One file should represent either a class definition, a script, or a data source.
- Give every class an explicit name in `:CLASS`; the name is syntactically optional.
- Order class members as `:INHERIT`, then the class-level `:DECLARE` fields, then the methods.
- By convention, declare `Constructor` after the regular methods, as the last method of the class; a class that declares it first compiles and runs the same way.
- Call sibling or inherited methods with `Me:Method()` and `Base:Method()`.
- Do not call `DoProc` with a bare procedure name inside class methods; it is a compile-time error. Use `Me:Method()` or `Base:Method()`.
- `:RETURN` inside a `Constructor` cannot return a value.
<!-- /rules -->

A `:RETURN` without an expression is allowed in a `Constructor`.

### Procedure Calls
```ssl
DoProc("ProcName", {arg1, arg2});       /* Same file;
ExecFunction("Category.Script", {arg1}); /* Other file entry point;
ExecFunction("Category.Script.Proc", {arg1}); /* Other file specific procedure;
```

### Common Functions
```ssl
Empty(value)                /* True if NIL, blank string, 0, .F., empty date or array;
Len(array or string)        /* Length;
LimsString(value)           /* Convert to string;
CreateUdObject()            /* Create empty dynamic object;
CreateUdObject("Cat.MyClass")  /* Create user-defined object;
SQLExecute(sql)             /* Run SQL with ?var? syntax;
DoProc(name, {args})        /* Call procedure in same file;
ExecFunction(name, {args})  /* Call procedure in other file;
```

> **Function naming convention:** <!-- rule: builtin_function_canonical_casing -->Represent functions in PascalCase where applicable, while preserving canonical exceptions such as `_AND`, `_OR`, `_XOR`, `_NOT`, `DOW`, `DOY`, and `LIMSDate`.<!-- /rule -->

### Boolean Literals
```ssl
.T.  /* True;
.F.  /* False;
NIL  /* Null (not the same as empty string);
```

### Logical Operators (include periods)
```ssl
.AND.   .OR.   .NOT.   !
```

<!-- rule: bare_logical_operator -->Write the logical operators with their periods: `.AND.`, `.OR.` and `.NOT.`, never bare `AND`, `OR` or `NOT`.<!-- /rule -->

### Comment Syntax
```ssl
/* Single line comment;

/*
Multi-line comment
that spans several lines.
;
```

> **Warning:** Comments are delimited by `/*` and `;`. <!-- rule: no_semicolon_in_comment_text -->Never include a semicolon inside comment text; the first semicolon ends the comment and the remaining text becomes executable code.<!-- /rule -->
