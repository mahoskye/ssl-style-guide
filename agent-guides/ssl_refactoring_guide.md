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
│ 4. DECLARATIONS                        │
│    :DECLARE nVar1, nVar2;              │
│    :DECLARE sVar1, sVar2;              │
├────────────────────────────────────────┤
│ 5. MAIN SCRIPT LOGIC                   │
│    (Entry point code, procedure calls) │
├────────────────────────────────────────┤
│ 6. PROCEDURE DEFINITIONS               │
│    (Local procedures, grouped by       │
│     region if appropriate)             │
└────────────────────────────────────────┘
```

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

More than 20 parameters on a procedure or method triggers a compiler performance warning; prefer grouping related state into arrays/objects or using wrapper-core patterns.

### 2.4 Regions for Organization

Group related procedures with `/* region` / `/* endregion` comment conventions:

> **Important:** `:REGION`/`:ENDREGION` is a legacy functional construct that captures body text for later retrieval via `GetRegion()`. Prefer comment-based regions for code organization.

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

| Rule | Standard |
|------|----------|
| Indent unit | 1 tab (or 4 spaces if using spaces) |
| Block content | Indent one level inside blocks |
| Nested blocks | Each level adds one indent |
| Class files | Do not indent the class body solely because of `:CLASS` |

**Block keywords that increase indent:**
`:IF`, `:ELSE`, `:WHILE`, `:FOR`, `:BEGINCASE`, `:CASE`, `:OTHERWISE`, `:TRY`, `:CATCH`, `:FINALLY`, `:PROCEDURE`, `:REGION` (functional), `:BEGININLINECODE`

**Block keywords that decrease indent (before the keyword):**
`:ENDIF`, `:ENDWHILE`, `:NEXT`, `:ENDCASE`, `:ENDTRY`, `:ENDPROC`, `:ENDREGION` (functional), `:ENDINLINECODE`

**Same-level keywords (dedent then re-indent):**
`:ELSE`, `:CASE`, `:OTHERWISE`, `:CATCH`, `:FINALLY`

**Regular statement (no indent change):**
`:EXITCASE` - stays at content level, like a `break` statement

`:CLASS` establishes class context, but because it has no closing keyword and a file
contains only one class, class members stay at the file's top indentation level.

### 3.2 Spacing

| Context | Rule | Correct | Incorrect |
|---------|------|---------|-----------|
| Assignment | Space around `:=` | `x := 1;` | `x:=1;` |
| Comparison | Space around operators | `a > b` | `a>b` |
| Logical | Space around `.AND.` etc. | `a .AND. b` | `a.AND.b` |
| Arithmetic | Space around operators | `x + y * z` | `x+y*z` |
| Commas | Space after, not before | `a, b, c` | `a,b,c` or `a ,b ,c` |
| Parentheses | No space inside | `DoProc("Name", {args})` | `DoProc( "Name" , { args } )` |
| Function calls | No space before `(` | `Len(sValue)` | `Len (sValue)` |
| Skipped params | Adjacent commas, no space | `RunSQL(sSQL,, {aVals})` | `RunSQL(sSQL, , {aVals})` |

> **Member access:** SSL accepts both `oObj:Prop` and `oObj : Prop`, but refactoring should normalize to the preferred no-space form unless preserving surrounding style is important.

> **Omit unnecessary arguments:** Do not pass empty arrays or empty strings for trailing optional parameters. Write `DoProc("Name")` not `DoProc("Name", {})`, and `GetDataSet(sQuery)` not `GetDataSet(sQuery, {})`. The runtime pads missing arguments with NIL.

### 3.3 Line Length

- **Maximum:** ~90 characters
- **Multi-line breaks:** At logical points (after commas, before operators)

Multi-line function calls:
```ssl
result := DoProc("ProcessData", {
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

- **Almost every statement, including comments, must end with `;`**
- **Continuation lines within multi-line expressions are not standalone statements** and do not need their own semicolon until the full statement terminates

### 3.5 Blank Lines

| Context | Blank Lines |
|---------|-------------|
| Between procedures | 1 blank line |
| Between logical sections | 1 blank line |
| Between regions | 1 blank line |
| Inside procedures | As needed for readability |

### 3.6 SQL String Formatting (Canonical Compact Style)

SQL strings use **canonical compact** formatting. Core rules:
- SQL keywords and functions in UPPERCASE
- All other SQL identifiers in lowercase unless external schema/object casing
  must be preserved
- Major clauses (SELECT, FROM, WHERE, JOIN, etc.) at column 0 relative to the
  4-space SQL indent
- SELECT continuation columns aligned to first column (col 7 from clause start)
- AND/OR indented 2 spaces under their parent clause
- ON indented 2 spaces under JOIN
- Trailing commas, ~90 char line limit

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

**Length limits:**
- Variable names: maximum 20 characters (excluding prefix)
- Function/procedure names: maximum 30 characters

**Exceptions:**
- Loop counters: `i`, `j`, `k`, `x`, `y`, `z`
- Constants: `ALL_CAPS_WITH_UNDERSCORES`

### 4.2 Procedure Names

- **Format:** PascalCase
- **Pattern:** Verb + Noun
- **Examples:** `ValidateOrder`, `ProcessQCSample`, `CalculateTotal`, `InitializeState`

### 4.3 UDO Properties (User-Defined Objects)

- **Format:** lowerCamelCase (no type prefix)
- **Examples:** `oOrder:orderNo`, `oState:isValid`, `oData:errorMessage`

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

> **Note:** All declared variables initialize to empty string `""` (not `NIL`). Use `Empty(var)` to test for uninitialized/default state — it returns `.T.` for `""`, `0`, `NIL`, and `.F.`.

---

## Part 5: Global Variables

Authoritative predefined globals should be documented conservatively. `MYUSERNAME` is included here as a common example of a predefined global in active use:

| Variable | Type | Description |
|----------|------|-------------|
| `MYUSERNAME` | String | Current user's username |

**Usage examples:**
```ssl
/* Log with current user;
UsrMes("Action performed by: " + MYUSERNAME);

/* Log a message with structured detail payload;
UsrMes("This is the user message.", {{1, 2, 3}, "Treeflower", 245});
/* Produces text similar to:
/* This is the user message.
/* {{1,2,3},Treeflower,245};
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
            :IF DoProc("GetOrderStatus", {sOrderNo}) = "Active";
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

    :IF DoProc("GetOrderStatus", {sOrderNo}) != "Active";
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

> **`:FINALLY` restrictions:** The following statements are **compile errors** inside a `:FINALLY` block: `:RETURN`, `:EXITFOR`, `:EXITWHILE`, `:LOOP`. Keep `:FINALLY` blocks limited to cleanup logic only.

---

## Part 7: Anti-Patterns to Fix

### 7.1 Direct Procedure Calls

```ssl
/* WRONG - SSL does not support direct calls to custom procedures;
result := MyProcedure(arg1, arg2);

/* CORRECT - Use DoProc for same-file procedures;
result := DoProc("MyProcedure", {arg1, arg2});

/* CORRECT - Use ExecFunction for other-file procedures;
result := ExecFunction("Category.Script.Proc", {arg1, arg2});
```

### 7.2 DoProc Inside Class Methods

```ssl
/* WRONG - Simple same-class DoProc("HelperMethod", ...) calls are rejected inside :CLASS methods;
:CLASS MyClass;
:PROCEDURE DoWork;
    DoProc("HelperMethod");
:ENDPROC;

/* CORRECT - Call methods via Me: or Base: inside the class;
:CLASS MyClass;
:PROCEDURE DoWork;
    Me:HelperMethod();
:ENDPROC;
```

### 7.3 Incorrect SQL Parameter Syntax

```ssl
/* WRONG - Only SQLExecute supports ?varName? syntax;
result := RunSQL("UPDATE table SET col = ?sValue? WHERE id = ?nId?");

/* CORRECT - Other functions use positional ? with array;
result := RunSQL("UPDATE table SET col = ? WHERE id = ?",, {sValue, nId});

/* CORRECT - SQLExecute can use named parameters;
result := SQLExecute("UPDATE table SET col = ?sValue? WHERE id = ?nId?");
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

The `:ERROR`/`:RESUME` keywords are legacy scope-based error handling. They remain valid, and `:TRY`/`:CATCH`/`:FINALLY` is often easier to target around specific operations in refactoring work.

**How `:ERROR`/`:RESUME` works:**
- `:ERROR` defines a handler block that applies to all subsequent code in the current scope (no `:ENDERROR` — it runs until scope ends)
- `:RESUME` inside the handler switches to resume mode — each subsequent statement is individually wrapped in a try/catch so execution continues after failures
- This has significant performance cost since every statement becomes its own try/catch

```ssl
/* Scope-based handler example;
:ERROR;
    oErr := GetLastSSLError();
    UsrMes("Error: " + oErr:Description);
:RESUME;

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

> **Key difference:** For strings, `=` returns `.T.` if the left operand *starts with* the right operand (prefix match). `==` returns `.T.` only if both strings are exactly equal. For most other value types, `==` generally parallels `=`. **Always use `==` for string comparisons where exact match is needed.**

> **`!=` asymmetry warning:** The `!=` operator negates `==` (exact match), NOT `=` (prefix match). This means `=` and `!=` are **not logical opposites** for strings. For example, `"Logged" = "Log"` is `.T.` (prefix match) AND `"Logged" != "Log"` is also `.T.` (not an exact match) — both true for the same operands. The `<>` and `#` operators behave identically to `!=`.

### 7.8 Membership Tests

Use `AScan` to test whether a value exists in a list. Build the candidate list as an array literal or variable.

```ssl
/* CORRECT - test whether a value is one of several candidates;
:DECLARE aCandidates, nPos, bFound;

aCandidates := {"SWAP", "ADEL", "COPY"};
nPos := AScan(aCandidates, Upper(sAction));
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
:IF AScan(aValid, Upper(sStatus)) > 0;
    DoProc("ProcessValidStatus", {sStatus});
:ENDIF;
```

`AScan` also accepts a code block for custom comparison logic:

```ssl
/* Code block scan — find first element matching condition;
nIdx := AScan(aResults, {|row| row[3] > nThreshold});
```

---

## Part 8: Validation Checklist

Run through this checklist after refactoring:

### Structure
- [ ] Header comment present and complete
- [ ] Parameters declared at top with defaults
- [ ] All variables declared before use
- [ ] Procedures defined after main logic
- [ ] Related procedures grouped in regions
- [ ] Script-level visibility annotations (`/*@private;` / `/*@protected;`) placed on own line before `:PROCEDURE` if used — note these have **no effect on class methods** (class methods are always Public)

### Formatting
- [ ] Consistent indentation (tabs or 4 spaces)
- [ ] Spaces around operators
- [ ] Spaces after commas
- [ ] Line length ≤ 90 characters
- [ ] Almost every statement, including comments, ends with semicolon
- [ ] Continuation lines only omit semicolons when they are part of a still-open statement

### Naming
- [ ] Variables use Hungarian notation
- [ ] Procedures use PascalCase verb+noun
- [ ] UDO properties use lowerCamelCase
- [ ] Constants use ALL_CAPS

### Logic
- [ ] All script procedure calls use DoProc or ExecFunction; inside classes, sibling/inherited methods use `Me:` / `Base:`
- [ ] :CASE blocks use :EXITCASE unless multiple matching cases are intentional
- [ ] :BEGINCASE includes :OTHERWISE for default handling (advisory — the language only requires at least one :CASE)
- [ ] All blocks properly closed (:IF/:ENDIF, etc.)
- [ ] No stubs or placeholders remain
- [ ] Error handling present where appropriate

### SQL (canonical compact style)
- [ ] SQL keywords and functions in UPPERCASE
- [ ] Other SQL identifiers are lowercase unless external casing must be preserved
- [ ] Multi-line SQL follows canonical compact layout (AND/OR +2, ON +2, HAVING +2)
- [ ] INSERT uses block-style parens (opening on statement line, closing on own line)
- [ ] UPDATE SET on same line as UPDATE
- [ ] Set operations (UNION, etc.) surrounded by blank lines
- [ ] Correct parameter syntax for function used

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
:ERROR / :RESUME                     (legacy scope-based error handling)
```

### Class Rules
- `:CLASS` has **no closing keyword** — the class definition extends to the end of the file.
- **One class per file** — only one `:CLASS` is allowed per file.
- A file is either a class definition or a script, never both.
- `:CLASS` may omit the class name, but new and refactored code should always provide one explicitly.
- **Member order:** Successful class code requires `:INHERIT` first, then `:DECLARE` fields, then regular methods, then `Constructor` last.
- Inside class methods, use `Me:MethodName()` / `Base:MethodName()` instead of simple `DoProc("ProcName", ...)` calls.
- `Constructor` cannot return a value (`:RETURN` without an expression is allowed).

### Procedure Calls
```ssl
DoProc("ProcName", {arg1, arg2});       /* Same file;
ExecFunction("Category.Script", {arg1}); /* Other file entry point;
ExecFunction("Category.Script.Proc", {arg1}); /* Other file specific procedure;
```

### Common Functions
```ssl
Empty(value)                /* True if NIL, "", 0, or .F.;
Len(array or string)        /* Length;
LimsString(value)           /* Convert to string;
CreateUdObject()            /* Create empty dynamic object;
CreateUdObject("MyClass")  /* Create user-defined object;
SQLExecute(sql)             /* Run SQL with ?var? syntax;
DoProc(name, {args})        /* Call procedure in same file;
ExecFunction(name, {args})  /* Call procedure in other file;
```

> **Function naming convention:** Represent built-ins in PascalCase where applicable, while preserving canonical exceptions such as `_AND`, `_OR`, `_XOR`, `_NOT`, `DOW`, `DOY`, and `LIMSDate`.

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

### Comment Syntax
```ssl
/* Single line comment;

/* Multi-line comment
   that spans several lines;
```

> **Warning:** Comments are delimited by `/*` and `;`. A semicolon inside a comment will prematurely end it, potentially causing the remaining text to be interpreted as code. Avoid semicolons within comment text.
