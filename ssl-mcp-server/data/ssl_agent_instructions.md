# Language Definition: STARLIMS Scripting Language (SSL v11)

## 0. Agent Quick Start (Read First)

This reference documents the authoritative behavior of the STARLIMS SSL v11 language.
Authoritative rules describe documented language behavior; style recommendations are marked as guidance.

### Authoritative Language Rules

1. **Colon-prefixed keywords are case-sensitive** and must be UPPERCASE (e.g., `:IF`, `:FOR`). **SSL literals/constants** (`NIL`, `.T.`, `.F.`) are case-insensitive. **Class-context forms** (`Me`, `Base`, `Constructor`) are also case-insensitive; `Base` is used in colon-chained member access and `Constructor` is only meaningful as the fixed constructor declaration name inside `:CLASS`. **Identifiers and function names are case-insensitive.**
2. **Semicolons are mandatory** for almost every statement, including comments.
3. **Declare variables before use** with `:DECLARE`. **Do not** use `:DEFAULT` on a `:DECLARE` line.
4. **Declaration ordering.** `:PARAMETERS` must appear before any other statements in a script or procedure body. `:DEFAULT` must immediately follow `:PARAMETERS` (zero or more `:DEFAULT` lines, but only after `:PARAMETERS`). `:DECLARE` and `:PUBLIC` are regular statements and can appear anywhere in the statement flow. `:INCLUDE` is resolved as a textual paste before the rest of the file is read, so its position is technically flexible, but it should appear early to ensure expanded content is available. Recommended conventional order: `:PARAMETERS`, `:DEFAULT`, `:INCLUDE`, `:PUBLIC`, `:DECLARE`. **Data source files use different syntax** — see §4A.
5. **Custom procedures cannot be called directly.** Use `DoProc("ProcName", {args})` for same-file script procedures and `ExecFunction("Category.Script", {args})` or `ExecFunction("Category.Script.Proc", {args})` for external scripts/procedures. Inside `:CLASS` methods, call sibling/inherited methods with `Me:Method()` / `Base:Method()` — `DoProc` is a rejected inside class methods.
6. **Arrays are 1-based.** The first element is `aArray[1]`.
7. **Object creation rules:** Built-in classes use curly braces only (`Email{}`, `SSLDataset{}`) — they cannot be instantiated via `CreateUdObject`. `CreateUdObject()` creates an empty dynamic object; `CreateUdObject("ClassName")` or `CreateUdObject("ClassName", {args})` instantiates a user-defined `:CLASS`; `CreateUdObject({{"Prop", value}, ...})` creates an anonymous object with named properties.
8. **SQL parameterization:** `SQLExecute` is the only function that supports `?varName?` substitution. Other DB functions such as `RunSQL`, `LSearch`, `LSelect`, `LSelect1`, `LSelectC`, and `GetDataSet` use positional `?` with explicit parameter arrays.
9. **String comparison:** `=` is loose (prefix match for strings); `==` gives exact string equality and generally parallels `=` for other value types. `$` tests containment.
10. **Comments use `/* ...;`** and must end with a semicolon. **A semicolon inside comment text will prematurely end the comment** — never include `;` within comment text as it becomes executable code after the unintended comment boundary.

### Style Guidance for New and Refactored Code

1. **End each `:CASE` / `:OTHERWISE` block with `:EXITCASE;`** unless multi-match behavior is intentional.
2. **Prefer no spaces around `:`** in member access even though SSL accepts spaced forms.
3. **Use `/* region` / `/* endregion` comments for editor grouping** instead of `:REGION` / `:ENDREGION`.
4. **Prefer `:TRY` / `:CATCH` / `:FINALLY` over `:ERROR` / `:RESUME`** in new code.

## 1. High-Level Overview

* **Paradigm:** Imperative, procedural language with object-oriented features and strong database integration.
* **Key Characteristics:**
* **Colon-Prefixed Keywords:** Control structures and declarations use colon-prefixed keywords (e.g., `:IF`, `:PROCEDURE`, `:WHILE`, `:FOR`, `:BEGINCASE`, `:TRY`). Legacy body-capture constructs such as `:REGION` and `:BEGININLINECODE` are also part of the language.
    * **Case Sensitivity (Crucial):**
        * **Colon-Prefixed Keywords:** **CASE SENSITIVE**. You must use UPPERCASE (e.g., `:IF`, `:ENDIF`).
        * **SSL Literals and Class-Context Forms:** **Case Insensitive**. `NIL`, `.T.`, `.F.`, `Me`, `Base`, and `Constructor` accept any casing (e.g., `nil`, `me`, `base`). `Constructor` is reserved for class-constructor declarations.
        * **Identifiers/Functions:** **Case Insensitive**. `sMyVar` is the same as `SMYVAR`.
    * **Universal Termination:** Almost every statement—including comments—must terminate with a semicolon `;`.
    * **Database Centric:** Built-in support for parameterized SQL queries within strings.
* **Execution:** Executed within the STARLIMS application environment.

---

## 2. Core Syntax & Grammar (The "Hard Rules")

### Variable Declaration & Scope

* **Declaration:** Variables must be declared before use using `:DECLARE`.
    * Syntax: `:DECLARE varName1, varName2;`
    * **Default Value:** All declared variables start as empty string `""`.
    * **Dynamic Typing:** Variables are dynamically typed—their type changes when assigned a new value.
    * **Re-declaration:** Re-declaring an existing variable with `:DECLARE` is silently ignored — no error is thrown and the existing value is preserved.
    * *Constraint:* `:DEFAULT` cannot be used with `:DECLARE`.

* **Variable Lookup Order:** When a variable is referenced, lookup proceeds as **local scope** (current procedure) → **caller scopes** (up the call stack) → **public variables** (`:PUBLIC`). Accessing a caller's variable works but generates a warning — always declare variables locally with `:DECLARE`.

* **Parameters & Defaults:**
    * **Placement:** `:PARAMETERS` must appear before any other statements in a script or procedure body. Inside a procedure, `:PARAMETERS` must immediately follow the `:PROCEDURE` line.
    * **Defaults:** `:DEFAULT` must immediately follow `:PARAMETERS` (zero or more `:DEFAULT` lines, but only after `:PARAMETERS`).
    * **`:INCLUDE`** is resolved as a textual paste before the rest of the file is read; it should appear early. **`:DECLARE`** and **`:PUBLIC`** are regular statements and can appear anywhere.
    * **Recommended conventional order:** `:PARAMETERS`, `:DEFAULT`, `:INCLUDE`, `:PUBLIC`, `:DECLARE`.
    * Syntax:
      ```ssl
      :PROCEDURE MyProc;
      :PARAMETERS sName, nAge;
      :DEFAULT sName, "Unknown";
      :DECLARE sLocalVar;
      ```
    * **Data source files use different syntax.** In data source files, parameters use inline `:=` assignment and are preprocessed before the script runs — see §4A for details.

### Control Flow

* **Conditionals:**
    * Syntax: `:IF condition; ... :ELSE; ... :ENDIF;`

* **Loops:**
    * **For:** `:FOR i := 1 :TO 10; ... :NEXT;` (`:STEP` is optional, defaults to 1)
        * With step: `:FOR i := 1 :TO 10 :STEP 2; ... :NEXT;`
        * **Semantics:** The `:TO` limit and `:STEP` expressions are evaluated **once before the loop starts**. The loop continues while `var <= limit` (when step ≥ 0) or `var >= limit` (when step < 0). A `:STEP 0` value produces a non-terminating loop if the initial condition is true. `:NEXT` is the only valid closing keyword — `:ENDFOR` is reserved but not usable, and writing it is rejected as a syntax error.
    * **While:** `:WHILE condition; ... :ENDWHILE;`
    * **Loop Control:** `:EXITFOR;`, `:EXITWHILE;`, `:LOOP;` (continues to next iteration).

* **Case Blocks (Strict Structure):**
    * **Authoritative Behavior:** `:BEGINCASE` is not a value-matching switch and requires at least one `:CASE` block (empty `:BEGINCASE;` `:ENDCASE;` is rejected). Each `:CASE` evaluates its own boolean expression. Without `:EXITCASE;`, later `:CASE` expressions are still evaluated and additional matching bodies may execute. `:OTHERWISE` is still skipped once any earlier `:CASE` body has run.
    * **Style Guidance:** Include `:OTHERWISE` for default handling (advisory — not required by the language). End each `:CASE` and `:OTHERWISE` block with `:EXITCASE;` unless multi-match behavior is intentional.
    * Syntax:
      ```ssl
      :BEGINCASE;
      :CASE nVal == 1;
          /* Do something;
          :EXITCASE;
      :OTHERWISE;
          /* Do default;
          :EXITCASE;
      :ENDCASE;
      ```

* **Labels & Branching (Legacy — prefer `:IF`/`:WHILE`/`:FOR` in new code):**
    * `:LABEL` and `Branch()` are legacy flow control. Prefer structured constructs in new and refactored code.
    * The token text for a label includes the word `LABEL` — so `Branch` must include it. `:LABEL SKIP;` produces token text `"LABEL SKIP"` and `:LABELSKIP;` produces `"LABELSKIP"`. Omitting `LABEL` from the Branch target string causes a runtime error.
    * Example:
      ```ssl
      :IF ! Empty(bSomeVar);
          Branch("LABEL SKIP");
      :ENDIF;

      /* ...;

      :LABEL SKIP;

      /* ...;
      ```

* **Error Handling:**
    * **Try/Catch/Finally:** Structured exception handling (preferred). `:CATCH` and `:FINALLY` are both optional individually, but at least one must be present. Valid forms: `TRY...CATCH...ENDTRY`, `TRY...FINALLY...ENDTRY`, `TRY...CATCH...FINALLY...ENDTRY`. When both are present, **`:CATCH` must precede `:FINALLY`**.
      **Body requirements:** The `:TRY` body requires **at least one statement**. The `:CATCH` body allows **zero or more statements** (an empty `:CATCH` block is valid). The `:FINALLY` body, if present, requires **at least one statement**.
      **Only one `:CATCH` block is allowed per `:TRY`** — there is no multi-catch.
      **`:CATCH` does not name the exception.** Use `GetLastSSLError()` inside the `:CATCH` block to retrieve an `SSLError` object. Common `SSLError` members include `:Message`, `:Description`, `:Operation`, `:Code` / `:GenCode`, `:FullDescription` / `:FullDescriptionEx`, `:InnerException`, and `:NETException`.
      **`:FINALLY` restrictions:** `:RETURN`, `:EXITWHILE`, `:EXITFOR`, and `:LOOP` inside a `:FINALLY` block are **rejecteds**.
      ```ssl
      :TRY;
          /* Code that might error;
      :CATCH;
          oErr := GetLastSSLError();
          UsrMes(oErr:Message);
      :FINALLY;
          /* Cleanup runs here;
      :ENDTRY;
      ```
    * **Error/Resume (Legacy):** `:ERROR` defines a handler for all subsequent code in the current scope and must contain at least one statement. `:RESUME` inside the handler switches execution to resume mode, which wraps each subsequent statement in its own individual try/catch to allow execution to continue after failures — this has significant performance cost. Prefer `:TRY/:CATCH/:FINALLY` when narrower block-scoped handling fits the code.
      ```ssl
      :ERROR;
          /* Handle any error — applies to all code below;
          oErr := GetLastSSLError();
      :RESUME;
      ```
      **Refactoring note:** When narrowing error scope, targeted `:TRY`/`:CATCH`/`:FINALLY` blocks provide more control than blanket resume-mode handling.

### Functions & Procedures

* **Definition:** Starts with `:PROCEDURE Name;` and ends with `:ENDPROC;`. More than 20 parameters on a procedure or method triggers a performance warning; prefer grouping related state into arrays/objects.
* **Return Values:** Use `:RETURN value;` to return a value from a procedure. Without `:RETURN`, procedures return no value / an empty result.
* **Calling Convention (CRITICAL):**
    * **Custom Procedures:** You **cannot** call custom procedures directly (e.g., `MyProc()`).
    * **Same File:** Use `DoProc("ProcedureName", {arg1, arg2});` - second parameter is an array of arguments.
    * **Different File / Entry Point:** Use `ExecFunction("Category.Script", {arg1, arg2});` - second parameter is an array of arguments.
    * **Different File / Specific Procedure:** Use `ExecFunction("Category.Script.ProcedureName", {arg1, arg2});`.
    * **Skip Parameters:** Keep skipped-argument commas adjacent. For example,
      `DoProc("MyProc", {param1,,param3,,param5});` is valid, but
      `DoProc("MyProc", {param1, , param3, , param5});` is not.
    * **Omit trailing optional parameters** rather than passing empty values. For example, write `DoProc("MyProc")` not `DoProc("MyProc", {})`, and `GetDataSet(sQuery)` not `GetDataSet(sQuery, {})`. The runtime pads missing arguments with NIL.
    * **Built-in Functions:** Can be called directly with standard syntax (e.g., `Len(sString)`).

### Objects & User-Defined Types

* **Object Creation:**
    * **Built-in Class:** `oObject := ClassName{};` — built-in classes cannot be instantiated via `CreateUdObject`. Known built-in classes: `AzureStorage`, `BatchSupport`, `CDataTable`, `Email`, `EnterpriseExporter`, `FtpsClient`, `HtmlConverter`, `PatcherSupport`, `PdfSupport`, `RegSetup`, `SDMS`, `SDMSDocUploader`, `SSLBaseDictionary`, `SSLCodeProvider`, `SSLDataset`, `SSLExpando`, `SSLIntDictionary`, `SSLRegex`, `SSLStringDictionary`, `Sequence`, `TablesImport`, `WebServices`.
    * **Dynamic Object:** `oExp := CreateUdObject();` (creates an empty `SSLExpando`)
    * **User-Defined Class:** `oCustom := CreateUdObject("MyClass");` or `oCustom := CreateUdObject("MyClass", {arg1, arg2});` — for user-defined `:CLASS` files only
    * **Anonymous Object:** `oAnon := CreateUdObject({{"PropName", value}, ...});` (creates `SSLExpando` with properties)

* **Property Access:** Use colon notation: `oObject:PropertyName := value;`
    * SSL also accepts spaced member access (`oObject : PropertyName` / `oObject : Method()`), but style should prefer no spaces around `:`.
    * Example:
      ```ssl
      oEmail:To := {"user@example.com"};
      oEmail:Subject := "Test Message";
      oSeq:StartWith := 1000;
      nNextValue := oSeq:NextValue;
      ```

* **Class Definition:**
    * `:CLASS [ClassName];` defines a class and continues until end of file (no end keyword). The class name is syntactically optional, but new and refactored code should always provide an explicit class name.
    * `:INHERIT BaseName;` or `:INHERIT Category.ScriptName;` specifies inheritance (optional, follows `:CLASS`). Without `:INHERIT`, classes inherit from `SSLObject` by default.
    * Class contains `:DECLARE` statements and `:PROCEDURE` definitions
    * **Constructor:** Define with `:PROCEDURE Constructor;`. This is the fixed reserved name for a class constructor, not a normal method identifier. If omitted, an empty zero-argument constructor is auto-generated. Successful compilation requires class members in this order: `:INHERIT`, `:DECLARE`, regular methods, then `Constructor`. `:RETURN` inside a constructor cannot return a value.
    * **Class method calls:** Inside class methods, use `Me:MethodName()` / `Base:MethodName()` for sibling and inherited method calls. `DoProc` is a rejected inside class methods — all forms are rejected, not just same-class calls.
    * **Underscore-prefixed members:** Methods and fields prefixed with `_` (e.g., `_myHelper`) are excluded from reflection-based access, making them effectively private by convention.
    * **Visibility annotations (scripts only):** Place `/*@private;` or `/*@protected;` on its own line immediately before `:PROCEDURE` to restrict access. Both make the procedure inaccessible via `DoProc`/`ExecFunction`. **These annotations have no effect on class methods** (class methods are always Public|Virtual).
      ```ssl
      /*@private;
      :PROCEDURE InternalHelper;
          /* This procedure cannot be called from other scripts;
      :ENDPROC;
      ```
    * **`Me` form:** Self-reference to the current class instance. Use `Me:PropertyName` or `Me:MethodName(args)`. Can only be used inside a `:CLASS` definition.
    * **`Base` form:** Reference to the parent class in a `:CLASS` with `:INHERIT`. Must always be followed by `:MemberName` — cannot stand alone. Use `Base:MethodName(args)` to call overridden parent methods.
    * Example:
      ```ssl
      :CLASS MyClass;
          :INHERIT Lab.BaseClass;

      :DECLARE sProperty, nValue;

      :PROCEDURE Initialize;
          :PARAMETERS sName;
          sProperty := sName;
          Base:Initialize(sName);
      :ENDPROC;

      :PROCEDURE GetSelf;
          :RETURN Me;
      :ENDPROC;

      :PROCEDURE Constructor;
          :PARAMETERS sName;
          sProperty := sName;
          nValue := 0;
      :ENDPROC;
      ```

### Code Organization

* **Code Folding (Comment Style):** Use `/* region` and `/* endregion` comments for IDE code folding.
  ```ssl
  /* region Database Operations;
      /* Code here;
  /* endregion;
  ```
* **Includes:** `:INCLUDE LibraryName;` or `:INCLUDE Category.ScriptName;` to include external SSL files. Resolved as a textual paste; place early in the file after `:PARAMETERS`/`:DEFAULT`.
* **Public Variables:** `:PUBLIC varName1, varName2;` to declare global/public variables. Can appear anywhere in the statement flow.

### Inline Code & Regions (Functional Constructs)

* **Inline Code Blocks (Legacy):** `:BEGININLINECODE Name;` / `:BEGININLINECODE "Name";` ... `:ENDINLINECODE;` defines a named block whose body is captured as raw text, re-parsed as a complete SSL compilation unit for validation, and stored for later retrieval via `GetInlineCode(sValue, aVariables)`.
  ```ssl
  :BEGININLINECODE "MyInlineCode";
  :DECLARE a;
  a := 2;
  :RETURN a;
  :ENDINLINECODE;

  code := GetInlineCode("MyInlineCode", {});
  ret := ExecUdf(code, {}, .F.);
  DeleteInlineCode("MyInlineCode");
  :RETURN ret;
  ```
* **Preferred Alternative:** `:PROCEDURE` + `DoProc`/`ExecFunction` (or `Me:` / `Base:` inside classes) provides normal callable SSL units when that structure fits the task.
* **Named Regions (Legacy Functional Text Blocks):** `:REGION <name>;` ... `:ENDREGION;` defines a named block whose body is stored as raw text. Unlike `:BEGININLINECODE`, the body is not validated as SSL code. The content is stored and retrieved later via `GetRegion(sValue, vSrc, vDst)`.
* **Code Organization:** For organizing and grouping procedures in the IDE, use `/* region` / `/* endregion` comment conventions instead (see the **Code Organization** section above).

### Comments

* **Syntax:** Starts with `/*` and **must end with a semicolon `;`**.
* **Single-line:** `/* This is a comment;`
* **Multi-line:**
  ```ssl
  /* This is a
     multi-line comment
     that spans several lines;
  ```
* **Warning — semicolons inside comments:** Because `;` terminates the comment, any semicolon within the comment text will prematurely end it. For example:
  ```ssl
  /* Set x := 0; then increment;
  ```
  This is actually **two** tokens: the comment `/* Set x := 0;` followed by the executable statement `then increment;` (which is rejected). Avoid semicolons in comment text, or restructure the comment to work around this limitation.

---

## 3. The Type System

### Public Type Names (LimsTypeEx)

Use `LimsTypeEx(value)` to identify the public type at execution time. These are the **public type names** an agent should rely on:

| Public Type | `LimsTypeEx` Returns | Prefix | Literal Example |
|-------------|----------------------|--------|-----------------|
| String | `"STRING"` | `s` | `"text"` or `'text'` or `[text]` |
| Number | `"NUMERIC"` | `n` | `42` or `3.14` |
| Boolean | `"LOGIC"` | `b` | `.T.` or `.F.` |
| Date | `"DATE"` | `d` | `CToD("01/15/2024")` |
| Array | `"ARRAY"` | `a` | `{1, 2, 3}` |
| Code Block | `"CODEBLOCK"` | `fn` | `{|v| v * 2}` |
| Object | `"OBJECT"` | `o` | `Email{}` or `CreateUdObject(...)` |
| Null | `"NIL"` | — | `NIL` |
| Any/Variant | *(varies)* | `v` | Variable whose type may change or is not known at declaration |

**Signatures in this document use the public type names above.** If a return type is listed as **Any**, it means the value can be any `LimsTypeEx` type at execution time.

### Primitive Types & Literals

* **Boolean:** `.T.` (True) and `.F.` (False).
* **Null/Empty:** `NIL` represents null/empty values. Use `Empty(value)` function to check if a value is null, empty string, zero, or `.F.`. `Empty()` is NIL-safe — it returns `.T.` for `NIL` values. Do not call instance methods on a `NIL` value (raises an error).
* **Strings:**
    * Double quotes: `"Text"`
    * Single quotes: `'Text'`
    * Brackets: `[Text]` (useful for SQL strings containing quotes).
    * **Multi-line strings:** Strings can span multiple lines without escape sequences. Backslashes are literal.
      ```ssl
      sSQL := "
          SELECT *
          FROM sample
          WHERE id = 1
      ";
      ```
* **Arrays:**
    * Literal Syntax: `{val1, val2}`.
    * **Indexing:** **1-based indexing** (unlike most languages).
    * **Array Length:** Use `Len(aArray)` or `ALen(aArray)` to get length.

### String Details

| Operator | SSL Syntax | Description |
|----------|------------|-------------|
| Addition | `+` | Concatenates two strings |
| Subtraction | `-` | Trims trailing spaces from left operand, then concatenates |
| Contains | `$` | Returns `.T.` if left string is found in right string |
| Equality | `=` | Returns `.T.` if right is empty, or if left starts with right |
| Exact Equality | `==` | Returns `.T.` only if strings are exactly equal |
| Index | `[]` | Returns character at position (1-based) |

**Key Behaviors:**
- **Equality (`=`)**: Returns `.T.` if the right operand is empty string OR if the left operand starts with the right operand
- **Exact Equality (`==`)**: Returns `.T.` only if strings are exactly equal

### Number Details

SSL has a single numeric type — all numbers are stored as 64-bit floating-point (`double`). There is no separate integer type. Division always produces a floating-point result (`5 / 2` yields `2.5`, not `2`). The `Integer()` function provides explicit truncation to whole numbers. Bitwise built-ins (`_AND`, `_OR`, `_XOR`, `_NOT`) and shift operators (`<<`, `>>`) require integer-valued operands (whole numbers) and raise errors on fractional values.

| Operator | SSL Syntax | Description |
|----------|------------|-------------|
| Addition | `+` | Adds two numbers |
| Subtraction | `-` | Subtracts right from left |
| Multiplication | `*` | Multiplies two numbers |
| Division | `/` | Divides left by right (throws DivideByZeroException if right is 0) |
| Modulo | `%` | Returns remainder of division |
| Power | `^` | Raises left to power of right |
| Bitwise AND | `_AND(a, b)` | Bitwise AND — function call syntax (integer operands only) |
| Bitwise OR | `_OR(a, b)` | Bitwise OR — function call syntax (integer operands only) |
| Bitwise XOR | `_XOR(a, b)` | Bitwise XOR — function call syntax (integer operands only). `LimsXOr(a, b)` is also available. |
| Bitwise NOT | `_NOT(a)` | Bitwise complement — function call syntax (integer operands only) |
| Left Shift | `<<` | Shifts bits left |
| Right Shift | `>>` | Shifts bits right |

**Key Behaviors:**
- `Empty()` returns `.T.` if value equals 0
- `_AND`, `_OR`, `_XOR`, `_NOT` use function call syntax, not infix: `_AND(a, b)` not `a _AND b`
- Bitwise functions require integer operands; fractional values raise errors
- **Scientific notation** requires a decimal point before the exponent: `1.2e-3`, `9.0E1` are valid; `7e2`, `.5e1`, `9E+1` are not

### Boolean Details

| Operator | SSL Syntax | Description |
|----------|------------|-------------|
| Logical AND | `.AND.` | Returns `.T.` if both operands are true |
| Logical OR | `.OR.` | Returns `.T.` if either operand is true |
| Logical NOT | `.NOT.` | Returns opposite value |

**Key Behaviors:**
- `.AND.` and `.OR.` use **short-circuit evaluation**: if the first operand determines the result, the second operand is not evaluated (e.g., `.F. .AND. SomeFunction()` will not call `SomeFunction()`)
- `Empty()` returns `.T.` if value is `.F.` (false equals empty)
- `ToString()` returns `.T.` or `.F.`
- `ToJson()` returns `"true"` or `"false"`

### Date Details

| Operator | SSL Syntax | Description |
|----------|------------|-------------|
| Addition | `+` | Adds days (Number) to date |
| Subtraction | `-` | Subtracts days from date, OR calculates difference between two dates (returns Number days) |

**Key Behaviors:**
- `Empty()` returns `.T.` if date equals `DateTime.MinValue`
- `ToString()` returns date in `MM/dd/yyyy` format, or `"  /  /    "` if empty
- `ToJson()` returns ISO 8601 formatted date string based on DateTimeKind

### Array Details

| Property | Description |
|----------|-------------|
| **1-based indexing** | First element is at index 1, not 0 |
| `Count` | Returns the number of elements |
| Deep clone | The `clone()` method recursively clones all elements |

### Operators Summary

* **Assignment:** `:=`
* **Compound Assignment:** `+=`, `-=`, `*=`, `/=`, `^=`, `%=`
* **Comparison:** `=`, `==`, `!=`, `<>`, `#`, `<`, `>`, `<=`, `>=` — prefer `!=` over `<>` or `#` for not-equals
* **Logical:** `.AND.`, `.OR.`, `.NOT.`, `!` (must include periods for `.AND.`/`.OR.`/`.NOT.`)
* **Arithmetic:** `+`, `-`, `*`, `/`, `^`, `**` (power), `%` (modulo)
* **Unary:** `++` (increment), `--` (decrement) — both prefix (`++i`) and postfix (`i++`) forms are supported. Prefix returns the new value; postfix returns the original value.
* **String:** `+` (concatenation), `-` (trim+concat), `$` (contains)
* **Bitwise (function call syntax):** `_AND(a, b)`, `_OR(a, b)`, `_XOR(a, b)`, `_NOT(a)`, `<<`, `>>`

---

## 4. Database Operations

### SQLExecute Parameter Substitution

`SQLExecute` is the **only** SSL database function that supports `?VarName?` dynamic variable substitution. All other database functions (`RunSQL`, `LSearch`, `LSelect`, `GetDataSet`) use positional `?` parameters with explicit value arrays.

#### Expression Types Supported

| Type | Pattern | Example |
|------|---------|---------|
| Local Variable | `?varName?` | `?sStatus?` |
| Array Expansion | `?arrayVar?` | `?aStatusCodes?` becomes `?,?,?` for 3-element array (local variables only — see caveat below) |
| Array Index | `?arr[i]?` or `?arr[i,j]?` | `?aMatrix[nRow, 1]?` |
| Object Property | `?obj:prop?` | `?oUser:ID?` |
| Object Method | `?obj:method()?` | `?oUser:GetID()?` (parameterless only) |
| Function Call | `?FuncName()?` | `?Today()?` (parameterless only) |
| Constant | `?'value'?` or `?123?` | `?'A'?` |
| Complex Expression | `?expr + expr?` | `?sPrefix + sSuffix?` (triggers warning) |

#### SQLExecute Examples

```ssl
:DECLARE sStatus, aStatusCodes, oUser, aMatrix, nRow;
sStatus := "A";
aStatusCodes := {"A", "P", "C"};
nRow := 2;

/* 1. Simple variable substitution;
sSQL := "SELECT * FROM Sample WHERE Status = ?sStatus?";

/* 2. Array expansion - ?aArray? becomes ?,?,? for 3-element array;
/* IMPORTANT: array must be a local variable, not a UDObject property (see caveat below);
sSQL := "SELECT * FROM Sample WHERE Status IN (?aStatusCodes?)";

/* 3. Object property access;
sSQL := "SELECT * FROM Users WHERE UserID = ?oUser:ID?";

/* 4. Object method calls (parameterless only);
sSQL := "SELECT * FROM Users WHERE UserID = ?oUser:GetID()?";

/* 5. Array indexing (variable or literal index);
sSQL := "SELECT * FROM Sample WHERE Type = ?aMatrix[nRow, 1]?";

/* 6. Built-in function calls (parameterless only);
sSQL := "SELECT * FROM Sample WHERE CreateDate < ?Today()?";

/* 7. Inline constants (unusual but valid);
sSQL := "SELECT * FROM Sample WHERE Status = ?'A'?";
```

### Other Database Functions

These functions use positional `?` placeholders with explicit value arrays:

```ssl
:DECLARE aResults, bSuccess, sSQL, sStatus, sSampleID, sSampleName;
sStatus := "A";
sSampleID := "12345";

/* RunSQL - DML only (INSERT/UPDATE/DELETE), returns Boolean;
sSQL := "UPDATE Sample SET Status = ? WHERE SampleID = ?";
bSuccess := RunSQL(sSQL,, {sStatus, sSampleID});

/* LSearch - Single value lookup with default;
sSampleName := LSearch("SELECT SampleName FROM Sample WHERE SampleID = ?", "DefaultName",, {sSampleID});

/* LSelect1 - Multi-row SELECT returning 2D array;
aResults := LSelect1("SELECT * FROM Sample WHERE Status = ?",, {sStatus});

/* GetDataSet - SELECT returning XML dataset;
sXml := GetDataSet("SELECT * FROM Sample WHERE Status = ?", {sStatus});
```

### Database Function Comparison

| Feature | SQLExecute | RunSQL / LSearch / LSelect / LSelect1 / LSelectC / GetDataSet |
|---------|------------|---------------------------------------------------------------|
| Parameter syntax | `?varName?` | `?` (positional) |
| Value binding | Automatic from scope | Explicit array parameter |
| Array expansion | Automatic | Manual |
| Object access | Supported | Not supported |
| Function calls | Supported (no params) | Not supported |
| Complex expressions | Supported (with warning) | Not supported |

### When to Use Each Function

| Function | Purpose | Returns |
|----------|---------|---------|
| `SQLExecute` | Universal - routes automatically | Array, XML String, Object (dataset wrapper), or Bool |
| `RunSQL` | **DML only** (INSERT/UPDATE/DELETE) | `Boolean` (success/failure) |
| `LSearch` | Single value lookups | Single value with default |
| `LSelect` | Multi-row SELECT queries (behaves like `LSelect1` when `aFieldList` is omitted) | 2D Array |
| `LSelect1` | Multi-row SELECT queries | 2D Array |
| `LSelectC` | Multi-row SELECT queries (delegates to `LSelect`) | 2D Array |
| `GetDataSet` | XML dataset output | XML String |

### UDObject Array Property Caveat

When using **array expansion** (`IN (?arrayVar?)`) with `SQLExecute`, the array **must be a local variable**. If the array is stored as a UDObject property, passing it directly causes a runtime error: `"The current array has more than 1 dimmension."` Scalar UDObject properties (e.g., `?oObj:ID?`) are not affected — only arrays used for `IN` expansion.

```ssl
/* WRONG - runtime error: "The current array has more than 1 dimmension.";
oFilter:StatusCodes := {"A", "P", "C"};
aData := SQLExecute("SELECT * FROM Sample WHERE Status IN (?oFilter:StatusCodes?)");

/* CORRECT - copy to a local variable first;
oFilter:StatusCodes := {"A", "P", "C"};
aStatusCodes := oFilter:StatusCodes;
aData := SQLExecute("SELECT * FROM Sample WHERE Status IN (?aStatusCodes?)");
```

### SQL Guidance (Style/Advisory)

1. **Use simple variables** for best performance
2. **Pre-compute complex expressions** into variables before the SQL
3. **Use array expansion** for dynamic `IN` clauses instead of string building — **always from a local variable, not a UDObject property**
4. **Avoid complex expressions** in production code
5. **Use `RunSQL`** for DML statements (INSERT, UPDATE, DELETE)
6. **Use `LSearch`** for single-value lookups with explicit parameters
7. **Inside SQL strings**, use uppercase SQL keywords and functions; keep all
   other SQL identifiers lowercase unless an external schema/object name
   requires preserved casing

### SQL Formatting Quick Reference (Canonical Compact)

SQL in SSL strings uses **canonical compact** style. Full reference with examples
for every statement type: `ssl-style-guide/sql-canonical-compact-reference.md`

**Layout rules:**
- SQL block indented 4 spaces inside the SSL string literal
- Major clauses (`SELECT`, `FROM`, `WHERE`, `JOIN`, `GROUP BY`, `ORDER BY`, `UNION`, etc.) at column 0 relative to that indent
- `AND`/`OR` indented 2 spaces under their parent clause (`WHERE`, `ON`, `HAVING`)
- `ON` indented 2 spaces under `JOIN` (but column 0 in `MERGE`)
- `HAVING` indented 2 spaces under `GROUP BY`
- `WHEN`/`ELSE` indented 2 spaces under `CASE`
- `SELECT` continuations aligned to first column (col 7)
- Trailing commas, ~90 char line target

**Casing:** SQL keywords and SQL functions UPPERCASE; identifiers lowercase;
preserve external casing when required.

**INSERT:** Opening `(` on the `INSERT INTO` line, columns indented 4 spaces, closing `)` on its own line. Same pattern for `VALUES`.

**UPDATE:** `SET` on same line as `UPDATE`, assignments indented 4 spaces below.

**Set operations:** Blank line before and after `UNION`/`INTERSECT`/`MINUS`.

**SELECT list packing:** Pack short items on one line up to ~90 chars. Break complex expressions (CASE, nested functions) to their own line.

**CASE consistency:** Within one CASE block, either all branches inline or all broken — don't mix. `ELSE` may stay inline when short.

**Optimizer hints:** `/*+ HINT */` after the action keyword — never strip without understanding the purpose.

**Example:**
```ssl
aData := SQLExecute("
    SELECT o.ordno, t.testcode, t.status
    FROM orders o
    INNER JOIN ordtask t
      ON t.ordno = o.ordno
    WHERE o.status = ?sStatus?
      AND o.logdate > ?dCutoff?
    ORDER BY o.ordno
");
```

---

## 4A. Data Source Files (Preprocessed Syntax)

Data source files are **not executed directly**. They are preprocessed server-side and rewritten into standard SSL before they run. This means data source files use syntax that does not exist in the standard SSL language.

### File Types

STARLIMS has three kinds of executable SSL files:

| File Type | Runs Directly | Parameter Syntax | Notes |
|-----------|-----------------|------------------|-------|
| **Server Script** | Yes | `:PARAMETERS p1, p2;` + `:DEFAULT p1, val;` | Standard SSL — all language rules apply |
| **SSL Data Source** | Preprocessed first | `:PARAMETERS p1 := val1, p2 := val2;` | Preprocessor rewrites to script form |
| **SQL Data Source** | Preprocessed first | `:PARAMETERS p1 := val1, p2 := val2;` | Preprocessor rewrites to a `GetSSLDataset()` call |

### SSL Data Source Parameter Syntax

In SSL data source files, `:PARAMETERS` uses inline `:=` assignment for defaults:

```ssl
:PARAMETERS sStatus := "A", nMaxRows := 100;
```

**Rules:**
- Every parameter **must** have a default value (the builder throws an error otherwise)
- `:PARAMETERS;` with no parameters is an error
- There is no separate `:DEFAULT` statement — defaults are inline
- The preprocessor rewrites the above into standard form before the script runs:
  ```ssl
  :PARAMETERS sStatus, nMaxRows;
  :DEFAULT sStatus, "A";
  :DEFAULT nMaxRows, 100;
  ```

### SQL Data Source Directives

SQL data source files support additional directives that are also preprocessed (not part of the SSL grammar):

```ssl
:DSN := connectionName;
:TABLENAME := tableName;
:NULLASBLANK := true;
:INVARIANTDATECOLUMNS := col1, col2;
:PARAMETERS sStatus := "A", nLimit := 50;

SELECT *
FROM sample
WHERE status = ?sStatus?
```

| Directive | Purpose |
|-----------|---------|
| `:DSN := name;` | Specifies the database connection to use |
| `:TABLENAME := name;` | Specifies the table name for the resulting dataset |
| `:NULLASBLANK := true;` | Controls null-to-blank conversion |
| `:INVARIANTDATECOLUMNS := col1, col2;` | Columns treated as invariant dates |

The SQL data source preprocessor rewrites the entire file into an SSL script that calls `GetSSLDataset()` with the appropriate arguments.

### Calling Data Sources

Data sources are invoked at runtime via `RunDS`:

```ssl
/* Call with default parameters;
oResult := RunDS("Category.DataSourceName");

/* Call with parameter overrides (array of {name, value} pairs);
oResult := RunDS("Category.DataSourceName", {{"sStatus", "P"}, {"nLimit", 25}});

/* Return as SSLDataset;
oDs := RunDS("Category.DataSourceName",, "ssldataset");
```

Use `GetDSParameters(sDsName)` to introspect a data source's parameter metadata at runtime.

### Key Takeaways for Agents

1. **Do not flag `:=` parameter syntax as incorrect** in data source files — it is the required form
2. **Do not flag builder directives** (`:DSN`, `:TABLENAME`, etc.) as unknown keywords — they are preprocessed
3. **Do not use `:DEFAULT` statements** in data source files — use inline `:=` syntax instead
4. **Do not apply standard script layout rules** to data source files — they have different structure
5. **The tree-sitter grammar and TextMate grammar do not cover data source syntax** — these constructs exist only in the preprocessing layer

---

## 5. Style Guidance for New and Refactored Code

### Hungarian Notation

Variables must be prefixed to indicate type:

| Prefix | Type | Examples |
|--------|------|----------|
| `s` | String | `sName`, `sMessage` |
| `n` | Numeric | `nCount`, `nValue` |
| `b` | Boolean | `bIsValid`, `bProcessed` |
| `d` | Date | `dStartDate`, `dExpiry` |
| `a` | Array | `aResults`, `aItems` |
| `o` | Object | `oHandler`, `oDataset` |
| `fn` | Code Block | `fnFilter`, `fnTransform` |
| `v` | Any/Variant | `vResult`, `vParam` |

**Length limits:**
- Variable names: maximum 20 characters (excluding prefix)
- Function/procedure names: maximum 30 characters

**Exceptions to Hungarian Notation:**
* Loop counters: `i`, `j`, `k`, `x`, `y`, `z` (single letters allowed)
* Global constants: `ALL_CAPS_NAMING` (e.g., `MAX_COUNT`, `DEFAULT_PATH`)
* Special SSL literals/constants: `NIL`, `.T.`, `.F.`
* Preserve established acronym casing only when it already exists in the surrounding codebase or required external names

### Style Guidelines

* Use consistent indentation (tabs preferred, or 4 spaces if the file already uses spaces)
* Align related elements (parameters, SQL statements) for readability
* Limit line lengths to approximately 90 characters, breaking logically
* Include meaningful comments using SSL comment syntax (`/* comment;`)
* Use proper SSL keywords with colon prefix (`:DECLARE`, `:IF`, `:PROCEDURE`, etc.)

---

## 6. "Rosetta Stone" (Examples)

### 1. Hello World (Procedure)

```ssl
:PROCEDURE HelloWorld;
    :DECLARE sMessage;
    sMessage := "Hello, World";
    /* Log message;
    UsrMes(sMessage);
:ENDPROC;
```

### 2. The "Kitchen Sink" (Correct Logic & Calling)

```ssl
:PROCEDURE ProcessOrders;
    :PARAMETERS sCustomerID;
    :DEFAULT sCustomerID, "CUST001";
    :DECLARE nTotal, i, aOrders, sSQL, oLogger;

    nTotal := 0;

    /* Create logger object;
    oLogger := CreateUdObject("OrderLogger");

    :TRY;
        /* Use ?param? syntax for SQLExecute - variable must be in scope;
        sSQL := "SELECT OrderAmount FROM Orders WHERE CustomerID = ?sCustomerID?";
        aOrders := SQLExecute(sSQL);

        :IF Len(aOrders) > 0;
            /* Arrays are 1-based;
            :FOR i := 1 :TO Len(aOrders);
                nTotal += aOrders[i, 1];
            :NEXT;

            :BEGINCASE;
            :CASE nTotal > 1000;
                /* Call internal procedure using DoProc;
                DoProc("HandleVIP", {sCustomerID});
                :EXITCASE;
            :OTHERWISE;
                /* Call external function using ExecFunction;
                ExecFunction("Log.Write", {"Standard Order"});
                :EXITCASE;
            :ENDCASE;
        :ENDIF;
    :CATCH;
        /* Handle errors;
        oLogger:LogError := GetLastSSLError();
    :ENDTRY;

    :RETURN nTotal;
:ENDPROC;
```

### 3. Complete Error Handling Pattern

```ssl
:DECLARE sDatasetXml, sComplexQuery, oErr, sErrMsg;
sComplexQuery := "SELECT * FROM Sample";

/* Structured exception handling;
:TRY;
    sDatasetXml := GetDataSet(sComplexQuery);
    :IF Empty(sDatasetXml);
        RaiseError("No data found for query");
    :ENDIF;
:CATCH;
    oErr := GetLastSSLError();
    sErrMsg := "Error: " + oErr:Description + ". Operation: " + oErr:Operation;
    ErrorMes(sErrMsg);
    :RETURN .F.;
:FINALLY;
    /* Cleanup resources;
    :IF IsDefined("sDatasetXml");
        sDatasetXml := "";
    :ENDIF;
:ENDTRY;
```

### 4. Array Operations

```ssl
:DECLARE aNumbers, aFiltered, nSum, nCount, nPosition, aMatrix, nValue;

/* Create and populate arrays;
aNumbers := {10, 25, 5, 30, 15};

/* Array functions;
nCount := ALen(aNumbers);                    /* Get array length;
AAdd(aNumbers, 40);                          /* Add element;
nPosition := AScan(aNumbers, 25);            /* Find element position;

/* Multi-dimensional arrays;
aMatrix := {{1, 2}, {3, 4}, {5, 6}};
nValue := aMatrix[2,1];             /* Access element: 3;
nValue := aMatrix[2][1];            /* Alternative syntax;
```

### 5. String Manipulation

```ssl
:DECLARE sInput, sClean, sFormatted, nLength, sSubstring, nPosition, sReplaced;

sInput := "  Hello STARLIMS  ";
sClean := AllTrim(sInput);          /* Remove leading/trailing spaces;
sFormatted := Upper(sClean);        /* Convert to uppercase;

/* String functions;
nLength := Len(sInput);             /* Get string length;
sSubstring := Left(sInput, 5);      /* Get leftmost characters;
nPosition := At("STAR", sInput);    /* Find substring position;
sReplaced := StrTran(sInput, "Hello", "Hi");  /* Replace text;
```

---

## 7. Anti-Patterns (Do vs. Don't)

| Feature | ❌ Do NOT Do This | ✅ DO This Instead |
| :--- | :--- | :--- |
| **Procedure Call** | `CalculateTotal(5, 10);` | `DoProc("CalculateTotal", {5, 10});` |
| **Parameters** | `:DECLARE sName; :DEFAULT sName, "";` | `:PARAMETERS sName; :DEFAULT sName, "";` |
| **Switch** | `:CASE x=1; /* handle; :CASE x=2;` | `:CASE x=1; /* handle; :EXITCASE; :CASE x=2;` |
| **Case Sensitivity** | `:if condition;` | `:IF condition;` |
| **SQL Parameters** | `RunSQL("INSERT VALUES(?sVal?)")` | `RunSQL("INSERT INTO T VALUES(?)",, {sVal})` |
| **Logical Operators** | `IF x > 5 AND y < 10;` | `:IF x > 5 .AND. y < 10;` |
| **Array Indexing** | `aItems[0]` (0-based) | `aItems[1]` (1-based, first element) |
| **Object Creation** | `oObj := new MyClass();` | `oObj := BuiltInClass{};` or `oObj := CreateUdObject("UserClass", {args});` |
| **Object Property** | `oObj.Property` | `oObj:Property` |
| **DS Parameters** | `:PARAMETERS p1; :DEFAULT p1, "val";` (in data source) | `:PARAMETERS p1 := "val";` (in data source) |
| **DS Parameters** | `:PARAMETERS;` (empty, in data source) | `:PARAMETERS p1 := "default";` (at least one required) |

---

## 8. Edge Cases & Gotchas

1.  **Implicit Concatenation Error:** Do not try to put `:DEFAULT` on a `:DECLARE` line. They are separate steps.
2.  **The "DoProc" Rule:** The most common error for agents is calling `MyFunc()` directly. Use `DoProc` or `ExecFunction` for script procedures, but inside `:CLASS` methods use `Me:Method()` / `Base:Method()` — `DoProc` is a rejected inside class methods (all forms, not just same-class calls).
3.  **Case Sensitivity Inversion:** Unlike many languages where keywords are lower (`if`) and vars are sensitive, SSL is the opposite: Keywords are strict (`:IF`), identifiers are loose (`sVar` == `SVAR`).
4.  **Semicolons:** Almost every line (including comments) must end with `;`.
5.  **1-Based Arrays:** SSL arrays are 1-based, not 0-based. First element is `aArray[1]`.
6.  **Logical Operators Must Have Periods:** Use `.AND.`, `.OR.`, `.NOT.` - not `AND`, `OR`, `NOT`.
7.  **:EXITCASE controls multi-match behavior:** `:BEGINCASE` is not a value-matching switch. Each `:CASE` evaluates its own boolean expression. Without `:EXITCASE;`, later `:CASE` expressions are still evaluated and additional matching bodies may execute. `:OTHERWISE` is still skipped once any earlier `:CASE` body has run, even if that earlier case omitted `:EXITCASE;`. Always end each `:CASE`/`:OTHERWISE` with `:EXITCASE;` unless multi-match behavior is intentional.
8.  **Error Handling:** Use `:TRY`/`:CATCH`/`:FINALLY` for structured error handling.
9.  **Object Property Access:** Use colon-chained access (`oObj:Property`, `oObj:Method():Value`), not dot-chained access (`oObj.Property`).
10. **Function Name Casing:** Represent functions in PascalCase where applicable (`CreateUdObject`, `SQLExecute`, `AEval`, `AScan`), while preserving canonical exceptions such as `_AND`, `_OR`, `_XOR`, `_NOT`, `DOW`, `DOY`, and `LIMSDate`.
11. **Object Property Assignment:** Object property assignments (e.g., `oLogger:LogError := value;`) are NOT variable declarations - don't flag as undeclared.
12. **SQL Parameter Case Insensitivity:** SQL parameter names in `?varName?` placeholders are case-insensitive - `?sID?` and `?SID?` reference the same variable.
13. **Multi-line Function Calls:** Function calls and array literals can span multiple lines - proper indentation should be preserved.
14. **Procedure References:** Procedure names should only be matched in execution contexts (`DoProc`, `ExecFunction`), not in comments, strings, or unrelated identifiers.
15. **Comment Toggle:** SSL uses `/* ... ;` comment syntax. Toggling comments should add/remove this pattern, not `//` style comments.
16. **:STEP Keyword Spacing:** The `:STEP` keyword in FOR loops should have a space before it: `:FOR i := 1 :TO 10 :STEP 2;` not `:FOR i := 1 :TO 10:STEP 2;`
17. **:ENDFOR Is Not Valid:** Although `:ENDFOR` is a reserved word, it is **not a usable keyword**. FOR loops must be terminated with `:NEXT`, not `:ENDFOR` — using `:ENDFOR` is rejected as a syntax error.
18. **String Equality:** The `=` operator for strings returns `.T.` if right operand is empty OR left starts with right. Use `==` when you need an exact string match. **`!=` asymmetry:** `!=` negates `==` (exact match), not `=` (prefix match), so `=` and `!=` are **not logical opposites** for strings — e.g., `"Logged" = "Log"` is `.T.` AND `"Logged" != "Log"` is also `.T.`. The `<>` and `#` operators behave identically to `!=` but `!=` is preferred.
19. **Default Variable Value:** All declared variables start as empty string `""`, not `NIL`.
20. **SQLExecute Exclusivity:** Only `SQLExecute` supports `?varName?` syntax. Other database functions such as `RunSQL`, `LSearch`, `LSelect`, `LSelect1`, `LSelectC`, and `GetDataSet` require positional `?` with value arrays.
21. **Complex Expression Warning:** Using expressions like `?sPrefix + sSuffix?` in SQLExecute triggers a performance warning. Pre-compute values instead.
22. **:REGION vs `/* region`:** `:REGION`/`:ENDREGION` is a legacy functional construct that captures body text for later retrieval via `GetRegion()`. For IDE folding and procedure grouping, prefer `/* region` / `/* endregion` comments.
23. **Data source files use different parameter syntax.** In data source files, `:PARAMETERS` uses inline `:=` defaults (`:PARAMETERS p1 := val;`) — not separate `:DEFAULT` statements. Every parameter must have a default. See §4A.
24. **Data source directives are not SSL keywords.** `:DSN`, `:TABLENAME`, `:NULLASBLANK`, and `:INVARIANTDATECOLUMNS` only exist in SQL data source files and are handled by the data source preprocessor before the script runs. Do not flag them as unknown keywords.
25. **Data source parameter syntax is preprocessed.** The `:=` inline syntax in data source `:PARAMETERS` is rewritten by the preprocessor into standard `:PARAMETERS` + `:DEFAULT` before the script runs. The runtime never sees the `:=` form.

---

## 9. Complete Language Reference

### Complete Keyword List

All keywords must be prefixed with `:` and are case-sensitive (UPPERCASE only):

**Conditional:**
- `:IF`, `:ELSE`, `:ENDIF`

**Loops:**
- `:FOR`, `:NEXT`, `:TO`, `:STEP`
- `:WHILE`, `:ENDWHILE`
- `:EXITFOR`, `:EXITWHILE`, `:LOOP`

**Case Blocks:**
- `:BEGINCASE`, `:CASE`, `:ENDCASE`, `:OTHERWISE`, `:EXITCASE`

**Exception Handling:**
- `:TRY`, `:CATCH`, `:FINALLY`, `:ENDTRY`

**Error Handling (Legacy Form):**
- `:ERROR` - Legacy error handler; applies to all subsequent code in scope. Requires at least one statement.
- `:RESUME` - Used within `:ERROR` to continue execution at the next statement after a failure.

Note: `:TRY`/`:CATCH`/`:FINALLY` is generally preferred when block-scoped handling is appropriate.

**Procedures:**
- `:PROCEDURE`, `:ENDPROC`
- `:RETURN`

**Declarations:**
- `:DECLARE`, `:PARAMETERS`, `:DEFAULT`, `:PUBLIC`

**Code Organization:**
- `:LABEL`, `:INCLUDE`

**Inline Code & Regions (Functional Constructs):**
- `:BEGININLINECODE`, `:ENDINLINECODE`
- `:REGION`, `:ENDREGION`

Note: These are legacy functional body-capture constructs. They store content for later retrieval via `GetInlineCode()`/`GetRegion()`. For IDE code folding and grouping, prefer `/* region` / `/* endregion` comments.

**Object-Oriented:**
- `:CLASS`, `:INHERIT`

### Complete Operator List (32 Operators + 4 Bitwise Functions)

**Assignment Operators (7):**
- `:=` - Assignment
- `+=`, `-=`, `*=`, `/=`, `^=`, `%=` - Compound assignment

**Comparison Operators (9):**
- `=` - Equality (for strings: true if right is empty OR left starts with right)
- `==` - Exact string equality; otherwise generally parallels `=`
- `!=` - Not equal (preferred); `<>`, `#` are equivalent but not preferred
- `<`, `>`, `<=`, `>=` - Relational operators

**Logical Operators (4):**
- `.AND.` - Logical AND (must include periods)
- `.OR.` - Logical OR (must include periods)
- `.NOT.` - Logical NOT (must include periods)
- `!` - Negation

**Arithmetic Operators (7):**
- `+` - Addition / String concatenation
- `-` - Subtraction / String trim+concat
- `*` - Multiplication
- `/` - Division
- `^` - Exponentiation (power)
- `**` - Exponentiation (alias for `^`; both produce the same POWER token)
- `%` - Modulo

**Unary Operators (2):**
- `++` - Increment (numeric only)
- `--` - Decrement (numeric only)

**String Operators (1):**
- `$` - Contains (returns `.T.` if left string is found in right string)

**Shift Operators (2, integer operands only):**
- `<<`, `>>` - Shift operators

**Bitwise Built-ins (4 functions, integer operands only):**
- `_AND(a, b)`, `_OR(a, b)`, `_XOR(a, b)`, `_NOT(a)` - Bitwise operations (function call syntax, not infix). `LimsXOr(a, b)` is also available as an XOR function.

### Structural Syntax

- `:` - Member access (object property or method)
- `/*` - Comment delimiter (must run until `;`)

### Literal Values and Class-Context Forms

**Literal values:**
- `.T.` - Boolean True
- `.F.` - Boolean False
- `NIL` - Null/empty value (`NIL = NIL` is `.T.`, `NIL = ""` is `.F.`)

**Class-context forms:**
- `Me` - Self-reference to the current class instance; only valid inside `:CLASS` definitions
- `Base` - Parent class reference used in colon-chained access; write `Base:MemberName` (for example `Base:Initialize()`); only valid inside `:CLASS` with `:INHERIT`
- `Constructor` - Reserved constructor declaration name inside `:CLASS` (`:PROCEDURE Constructor; ... :ENDPROC`); not a normal method identifier or standalone value

**Other special forms:**
- Code Block - Lambda literal with syntax `{` `|param1, param2|` `expression` `}` — creates an SSLFunction object; at least one bound variable is required and the body is a single expression, not multiple statements

---

## 10. Built-in Function Reference

> Parameter prefixes: `s` = string, `n` = number, `b` = boolean, `d` = date, `a` = array, `o` = object, `v` = any/variant, `fn` = code block.
> Calling-form note: canonical SSL call forms are `DoProc("ProcName", {args})`, `ExecFunction("Category.Script", {args})` / `ExecFunction("Category.Script.Proc", {args})`, `CreateUdObject()`, `CreateUdObject("ClassName", {args})`, and `CreateUdObject({{"Prop", value}, ...})`.

### Core Functions (Most Used)

| Function | Signature |
|---|---|
| `SQLExecute` | `SQLExecute(vCommandString[, vFriendlyName[, vRollbackExistingTransaction[, vNullAsBlank[, vInvariantDateColumns[, vReturnType[, sTableName[, vIncludeSchema[, vIncludeHeader]]]]]]]])` |
| `Empty` | `Empty(vValue)` |
| `DoProc` | `DoProc(sProcedureName, aArguments)` |
| `Len` | `Len(vSource)` |
| `LimsString` | `LimsString(vSource)` |
| `ExecFunction` | `ExecFunction(sName[, aParameters])` |
| `ExecUdf` | `ExecUdf(vCode[, aArgs[, bCacheCode]])` |
| `ExecInternal` | `ExecInternal(vO, sMethodName, vArg01, vArg02, vArg03, vArg04, vArg05, vArg06, vArg07, vArg08, vArg09, vArg10, vArg11, vArg12, vArg13, vArg14, vArg15, vArg16, vArg17, vArg18, vArg19, vArg20, vArg21)` |
| `Eval` | `Eval(vCode[, vArg1[, vArg2 ...]])` |
| `Branch` | `Branch(vTarget)` |
| `UsrMes` | `UsrMes(vArg1[, vArg2])` |
| `ErrorMes` | `ErrorMes(vArg1[, vArg2])` |
| `InfoMes` | `InfoMes(vArg1[, vArg2])` |
| `IIf` | `IIf(bCondition, vTrueValue, vFalseValue)` |
| `CreateUdObject` | `CreateUdObject()` / `CreateUdObject(sClassName)` / `CreateUdObject(sClassName, aArgs)` / `CreateUdObject(aPropertyDefs)` |
| `RaiseError` | `RaiseError(sMessage[, sLocation[, nErrorCode[, oInnerException]]])` |
| `PrmCount` | `PrmCount()` |

`UsrMes`, `ErrorMes`, and `InfoMes` all write to the server log via `UserLog.WriteInfo` with identical formatting: `user / date / time / version / location / process / caption\nmessage`. The only functional difference is the `forceWrite` flag: `ErrorMes` passes `forceWrite=true`, so it writes even when `UsrMes` logging is globally disabled (`GlobalSettings.UsrmesDisabled`). `UsrMes` and `InfoMes` are suppressed when disabled. `InfoMes` delegates directly to `UsrMes` (identical behavior). Use `ErrorMes` for messages that must always be recorded; use `UsrMes`/`InfoMes` for messages that administrators may suppress. They accept fluid stringified inputs — commonly called with just one argument, or with an array in the second argument so it is stringified into the log entry, for example `UsrMes(sMessage, {aVar, sVar, nVar})`.

### String Functions

| Function | Signature |
|---|---|
| `AllTrim` | `AllTrim(sSource)` |
| `Trim` | `Trim(sSource)` |
| `LTrim` | `LTrim(sSource)` |
| `Upper` | `Upper(sSource)` |
| `Lower` | `Lower(sSource)` |
| `LLower` | `LLower(sSource)` |
| `Left` | `Left(sSource, nLength)` |
| `Right` | `Right(sSource, nLength)` |
| `SubStr` | `SubStr(sSource, nStart, nLength)` |
| `At` | `At(sSubString, sSource)` |
| `LimsAt` | `LimsAt(sSubString, sSource, nOffset)` |
| `Rat` | `Rat(sSubStr, sSource)` |
| `StrSrch` | `StrSrch(sSubStr, sSource, nIndexOrOccurence, bFlag)` |
| `StrTran` | `StrTran(sSource, sSearchFor, sReplaceWith)` |
| `Replace` | `Replace(sSource, sSearchFor, sReplaceWith)` |
| `Replicate` | `Replicate(sSource, nCount)` |
| `Chr` | `Chr(nAsciiCode)` |
| `Asc` | `Asc(sSource)` |
| `Str` | `Str(nNumber, nLength, nDecimals)` |
| `LStr` | `LStr(vNumber)` |
| `StrZero` | `StrZero(nNumber, nLength, nDecimals)` |
| `Val` | `Val(sSNumber)` |
| `LFromHex` | `LFromHex(sSource)` |
| `LToHex` | `LToHex(sSource)` |
| `LHex2Dec` | `LHex2Dec(sSource)` |
| `LTransform` | `LTransform(vExpression, sPicture)` |
| `LCase` | `LCase(bCondition, sTrueValue, sFalseValue)` |
| `AddColDelimiters` | `AddColDelimiters(sDSN, aCols, sTable)` |
| `AddNameDelimiters` | `AddNameDelimiters([sDSN[, sName]])` |

### Array Functions

| Function | Signature |
|---|---|
| `AAdd` | `AAdd(aTarget, vElement)` |
| `ALen` | `ALen(aTarget)` |
| `AEval` | `AEval(aTarget, fnBlock[, nStart[, nCount]])` |
| `AEvalA` | `AEvalA(aTarget, fnBlock[, nStart[, nCount]])` |
| `AFill` | `AFill(aTarget, vValue[, nStart[, nCount]])` |
| `AScan` | `AScan(aTarget, vValueOrBlock[, nStart[, nCount]])` |
| `AScanExact` | `AScanExact(aTarget, vValueOrBlock[, nStart[, nCount]])` |
| `ArrayCalc` | `ArrayCalc(aTarget[, sOperation[, vValue[, nStart[, nCount]]]])` |
| `ArrayNew` | `ArrayNew([nDim1[, nDim2[, nDim3]]])` |
| `ArrayToTVP` | `ArrayToTVP(vValues, vDataType, sConnectionName)` |
| `BuildArray` | `BuildArray(sText[, bCrlfOk[, sDelimiter[, bUnique[, bTrimSpaces]]]])` |
| `BuildArray2` | `BuildArray2(sText[, sLineDelimiter[, sColDelimiter[, bCrlfOk[, bTrimSpaces]]]])` |
| `BuildString` | `BuildString(aTarget[, nStart[, nCount[, sDelimiter]]])` |
| `BuildString2` | `BuildString2(aTarget[, sLineDelimiter[, sColDelimiter]])` |
| `BuildStringForIn` | `BuildStringForIn(aTarget)` |
| `CompArray` | `CompArray(aA1, aA2)` |
| `DelArray` | `DelArray(aTarget, nIndex)` |
| `ExtractCol` | `ExtractCol(aTarget, nColumn)` |
| `PrepareArrayForIn` | `PrepareArrayForIn(vArray, vItemType)` |
| `SortArray` | `SortArray(aTarget, vNumeric)` |

### Date & Time Functions

| Function | Signature |
|---|---|
| `Now` | `Now()` |
| `Today` | `Today()` |
| `Time` | `Time()` |
| `LimsTime` | `LimsTime()` |
| `Year` | `Year(dDate)` |
| `Month` | `Month(dDate)` |
| `Day` | `Day(dDate)` |
| `Hour` | `Hour(dDate)` |
| `Minute` | `Minute(dDate)` |
| `Second` | `Second(dDate)` |
| `Seconds` | `Seconds()` |
| `DOW` | `DOW(dDate)` |
| `DOY` | `DOY(dDate)` |
| `JDay` | `JDay(vDate)` |
| `CMonth` | `CMonth(dDate)` |
| `NoOfDays` | `NoOfDays(dDate)` |
| `DateAdd` | `DateAdd(vDate, vNumber, vDatepart)` |
| `DateDiff` | `DateDiff(vStartDate, vEndDate, vDatepart)` |
| `DateDiffEx` | `DateDiffEx(vStartDate, vEndDate)` |
| `DateFormat` | `DateFormat(sNewFormat)` |
| `DateFromNumbers` | `DateFromNumbers([vYear[, vMonth[, vDay[, vHour[, vMinute[, vSecond[, vMillisecond[, vMakeInvariant]]]]]]]])` |
| `DateFromString` | `DateFromString(vDateAsString[, vFormat[, vUseLocalCulture[, vMakeInvariant]]])` |
| `DateToString` | `DateToString(vDate, sFormat)` |
| `StringToDate` | `StringToDate(sDateString, sDateFormat)` |
| `CToD` | `CToD(sDateString)` |
| `DToC` | `DToC(dDate)` |
| `DToS` | `DToS(dDate)` |
| `LIMSDate` | `LIMSDate(vDate, sFormat)` |
| `LimsGetDateFormat` | `LimsGetDateFormat()` |
| `ValidateDate` | `ValidateDate(sStringDate, vUseDateFormat)` |
| `IsInvariantDate` | `IsInvariantDate(vDateValue)` |
| `MakeDateInvariant` | `MakeDateInvariant(vDateValue, vColumnsIndex)` |
| `MakeDateLocal` | `MakeDateLocal(vDateValue, vColumnsIndex)` |
| `ClientEndOfDay` | `ClientEndOfDay(vDate)` |
| `ClientStartOfDay` | `ClientStartOfDay(vDate)` |
| `ServerEndOfDay` | `ServerEndOfDay(vDate)` |
| `ServerStartOfDay` | `ServerStartOfDay(vDate)` |
| `ServerTimeZone` | `ServerTimeZone()` |
| `UserTimeZone` | `UserTimeZone()` |

### Math & Numeric Functions

| Function | Signature |
|---|---|
| `Abs` | `Abs(nValue)` |
| `_AND` | `_AND(nValue1, nValue2)` |
| `_OR` | `_OR(nValue1, nValue2)` |
| `_XOR` | `_XOR(nValue1, nValue2)` |
| `_NOT` | `_NOT(nValue)` |
| `Integer` | `Integer(nDecimalValue)` |
| `Max` | `Max(vValue1, vValue2)` |
| `Min` | `Min(vValue1, vValue2)` |
| `Round` | `Round(vValue, vDigits[, sMidPointRounding])` |
| `RoundPoint5` | `RoundPoint5(nNumber)` |
| `StdRound` | `StdRound(sStandard, nNrDigits, nNumber)` |
| `SigFig` | `SigFig(sStandard, nNrDigits, nNumber)` |
| `Sqrt` | `Sqrt(nNumber)` |
| `Rand` | `Rand([nSeed])` |
| `MatFunc` | `MatFunc(sFunctionName, nNumber)` |
| `Scient` | `Scient(nDoubleValue)` |
| `ToScientific` | `ToScientific(vNumber, vDecimalPlaces)` |
| `ToNumeric` | `ToNumeric(vSNumber, vAllowHex)` |
| `IsNumeric` | `IsNumeric(vSNumber, vAllowHex)` |
| `ValidateNumeric` | `ValidateNumeric(sSNumber)` |
| `IsHex` | `IsHex(sSource)` |
| `IsGuid` | `IsGuid(sGuid)` |
| `LimsXOr` | `LimsXOr(nVal1, nVal2)` |

### Type & Validation Functions

| Function | Signature |
|---|---|
| `LimsType` | `LimsType(vParam)` |
| `LimsTypeEx` | `LimsTypeEx(vValue)` |
| `IsDefined` | `IsDefined(vVarName)` |
| `Empty` | `Empty(vValue)` |
| `Nothing` | `Nothing(vValue)` |

### Database Functions

| Function | Signature |
|---|---|
| `SQLExecute` | `SQLExecute(vCommandString[, vFriendlyName[, vRollbackExistingTransaction[, vNullAsBlank[, vInvariantDateColumns[, vReturnType[, sTableName[, vIncludeSchema[, vIncludeHeader]]]]]]]])` |
| `RunSQL` | `RunSQL(sCommandString[, sFriendlyName[, vValues]])` |
| `RunDS` | `RunDS(vDataSourceName[, vParameters[, vReturnType]])` |
| `LSearch` | `LSearch(sCommandString, vDefaultValue[, sFriendlyName[, aArrayOfValues]])` |
| `LSelect` | `LSelect(sCommandString[, aFieldList[, sFriendlyName[, aArrayOfValues[, bNullAsBlank[, aInvariantDateColumns]]]]])` |
| `LSelect1` | `LSelect1(sCommandString[, sFriendlyName[, aArrayOfValues[, bNullAsBlank[, aInvariantDateColumns]]]])` |
| `LSelectC` | `LSelectC(sCommandString[, aFieldList[, sFriendlyName[, aArrayOfValues[, bNullAsBlank[, aInvariantDateColumns]]]]])` |
| `GetDataSet` | `GetDataSet(sCommandString[, aArrayOfValues[, bIncludeSchema[, sTableName[, bNullAsBlank[, aInvariantDateColumns]]]]])` |
| `GetDataSetEx` | `GetDataSetEx(sCommandString[, sFriendlyName[, aArrayOfValues[, bIncludeSchema[, bIncludeHeader[, sTableName[, bNullAsBlank[, aInvariantDateColumns]]]]]]])` |
| `GetDataSetFromArray` | `GetDataSetFromArray(aArrayOfValues, aArrayFields)` |
| `GetDataSetFromArrayEx` | `GetDataSetFromArrayEx(aArrayOfValues[, aArrayFields[, sTableName[, bIncludeHeader[, bIncludeSchema]]]])` |
| `GetDataSetWithSchemaFromSelect` | `GetDataSetWithSchemaFromSelect(sCommandString, sFriendlyName, aArrayOfValues, aArrayOfPrimaryKeys, aArrayOfUniqueConstraints)` |
| `GetDataSetXMLFromArray` | `GetDataSetXMLFromArray(aArrayOfValues, aArrayFields, sTableName, bIncludeHeader, bIncludeSchema)` |
| `GetDataSetXMLFromSelect` | `GetDataSetXMLFromSelect(sCommandString[, sFriendlyName[, bIncludeHeader[, aArrayOfValues[, bIncludeSchema[, sTableName[, bNullAsBlank[, aInvariantDateColumns]]]]]]])` |
| `GetSSLDataset` | `GetSSLDataset(sSql[, sDSN[, aParamNames[, aParamValues[, sTableName[, bNullAsBlank[, aInvariantDateColumns]]]]]])` |
| `GetNETDataSet` | `GetNETDataSet(vCommandString, vFriendlyName, vArrayOfValues, sTableName, vReturnXml, vR1Compatible)` |
| `GetDSParameters` | `GetDSParameters(sDsName)` |
| `BeginLimsTransaction` | `BeginLimsTransaction(vFriendlyName, vIsoLevel)` |
| `EndLimsTransaction` | `EndLimsTransaction(sFriendlyName, bCommit)` |
| `IsInTransaction` | `IsInTransaction(vConnection)` |
| `GetTransactionsCount` | `GetTransactionsCount(vConnection)` |
| `LimsRecordsAffected` | `LimsRecordsAffected()` |
| `GetLastSQLError` | `GetLastSQLError()` |
| `ReturnLastSQLError` | `ReturnLastSQLError()` |
| `ShowSqlErrors` | `ShowSqlErrors(bFlag)` |
| `IgnoreSqlErrors` | `IgnoreSqlErrors(bFlag)` |
| `DetectSqlInjections` | `DetectSqlInjections(vOnOff, sConnectionName)` |
| `SQLRemoveComments` | `SQLRemoveComments(vStatement)` |
| `SetSqlTimeout` | `SetSqlTimeout(nTimeout, vConnection)` |
| `LimsSqlConnect` | `LimsSqlConnect(sFriendlyName)` |
| `LimsSqlDisconnect` | `LimsSqlDisconnect(sFriendlyName)` |
| `IsDBConnected` | `IsDBConnected(vFriendlyName)` |
| `GetConnectionByName` | `GetConnectionByName(sFriendlyName)` |
| `GetConnectionStrings` | `GetConnectionStrings()` |
| `GetDefaultConnection` | `GetDefaultConnection()` |
| `SetDefaultConnection` | `SetDefaultConnection(vDefaultConnection)` |
| `GetDBMSName` | `GetDBMSName(sFriendlyName)` |
| `GetDBMSProviderName` | `GetDBMSProviderName(sFriendlyName)` |
| `GetNoLock` | `GetNoLock(sConnectionName)` |
| `GetRdbmsDelimiter` | `GetRdbmsDelimiter(sDSN, bOpen)` |
| `GetTables` | `GetTables(sSql)` |
| `IsTable` | `IsTable(sFriendlyName, sTableName)` |
| `IsTableFld` | `IsTableFld(sFriendlyName, sTableName, sFieldName)` |
| `TableFldLst` | `TableFldLst(sFriendlyName, sTableName)` |
| `LimsSetCounter` | `LimsSetCounter(sTableName, sFieldName, sPrefix, aArrayOfFields, aArrayOfValues, vNull)` |
| `RetrieveLong` | `RetrieveLong(sFriendlyName, sTableName, sColumnName, sWhereCondition, sOutputFilePath, bIsCompressed)` |
| `UpdLong` | `UpdLong(sFriendlyName, sTableName, sColumnName, sWhereCondition, sInputFilePath, bIsCompressed)` |
| `LimsOleConnect` | `LimsOleConnect(vV)` |
| `EndLimsOleConnect` | `EndLimsOleConnect(vV)` |
| `LimsExec` | `LimsExec(sApplication, bShow, sArguments)` |
| `XmlExportSql` | `XmlExportSql(sSql, sFile[, sDb[, aSqlParams[, sTable]]])` |

### Object Functions

| Function | Signature |
|---|---|
| `AddProperty` | `AddProperty(oO, vPropName)` |
| `HasProperty` | `HasProperty(vO, sPropName)` |
| `GetInternal` | `GetInternal(vO, sPropName)` |
| `SetInternal` | `SetInternal(vO, sPropName, vPropValue)` |
| `GetInternalC` | `GetInternalC(vO, sCollectionName, vArg1, vArg2, vArg3, vArg4, vArg5, vArg6)` |
| `SetInternalC` | `SetInternalC(vO, sCollectionName, vValue, vArg1, vArg2, vArg3, vArg4, vArg5, vArg6)` |
| `GetByName` | `GetByName(sName)` |
| `SetByName` | `SetByName(sName, vValue)` |
| `CreateLocal` | `CreateLocal(vVarName, vVarValue)` |
| `CreatePublic` | `CreatePublic(vVarName, vVarValue)` |
| `CreateORMSession` | `CreateORMSession()` |
| `LKill` | `LKill(sVarName)` |
| `MakeNETObject` | `MakeNETObject(vValue)` |

### Error Handling Functions

| Function | Signature |
|---|---|
| `GetLastSSLError` | `GetLastSSLError()` |
| `ClearLastSSLError` | `ClearLastSSLError()` |
| `FormatErrorMessage` | `FormatErrorMessage(vV)` |
| `FormatSqlErrorMessage` | `FormatSqlErrorMessage(vV)` |

### File & Directory Functions

| Function | Signature |
|---|---|
| `ReadText` | `ReadText(sFileName[, nCharsToRead[, sEncoding]])` |
| `WriteText` | `WriteText(sFileName, sCharsToWrite, sConfirmRequired[, sAppend[, sEncoding]])` |
| `ReadBytesBase64` | `ReadBytesBase64(sFileName)` |
| `WriteBytesBase64` | `WriteBytesBase64(sFileName, sBase64Data)` |
| `Directory` | `Directory(sFilePattern, oAttributes)` |
| `LDir` | `LDir(sFilePattern, oAttributes)` |
| `FileSupport` | `FileSupport(vFileIdentifier, vRequest, vArg1, vArg2, sEncoding)` |
| `CombineFiles` | `CombineFiles(aArFileNames, sSOutFile)` |
| `GetFileVersion` | `GetFileVersion(sFileName)` |
| `GetPrinters` | `GetPrinters()` |
| `ConvertReport` | `ConvertReport(sFile)` |
| `GetAppBaseFolder` | `GetAppBaseFolder()` |
| `GetAppWorkPathFolder` | `GetAppWorkPathFolder()` |
| `GetLogsFolder` | `GetLogsFolder()` |
| `GetWebFolder` | `GetWebFolder()` |

### FTP Functions

| Function | Signature |
|---|---|
| `CheckOnFtp` | `CheckOnFtp(sServerNameOrIP, sRemoteDirectory, sRemoteFileName, sUserName, sPassword, nPort, sProxy, bIsSFTP, sPrivateKeyFilePath)` |
| `CopyToFtp` | `CopyToFtp(sServerNameOrIP, sRemoteDirectory, aRemoteFileNames, sFileContents, sUserName, sPassword, nPort, sProxy, bIsSFTP, sPrivateKeyFilePath)` |
| `DeleteDirOnFtp` | `DeleteDirOnFtp(sServerNameOrIP, sRemoteDirectory, sUserName, sPassword, nPort, sProxy, bIsSFTP, sPrivateKeyFilePath)` |
| `DeleteFromFtp` | `DeleteFromFtp(sServerNameOrIP, sRemoteDirectory, sRemoteFileName, sUserName, sPassword, nPort, sProxy, bIsSFTP, sPrivateKeyFilePath)` |
| `GetDirFromFtp` | `GetDirFromFtp(sServerNameOrIP, sRemoteDirectory, sFilePattern, sUserName, sPassword, nPort, sProxy, bUsePassive, bIsSFTP, sPrivateKeyFilePath)` |
| `GetFromFtp` | `GetFromFtp(sServerNameOrIP, sRemoteDirectory, sRemoteFileName, sLocalFileName, sUserName, sPassword, nPort, sProxy, bIsSFTP, sPrivateKeyFilePath)` |
| `MakeDirOnFtp` | `MakeDirOnFtp(sServerNameOrIP, sRemoteDirectory, sUserName, sPassword, nPort, sProxy, bIsSFTP, sPrivateKeyFilePath)` |
| `MoveInFtp` | `MoveInFtp(sServerNameOrIP, sRemoteDirectoryFrom, sRemoteDirectoryTo, sRemoteFileFrom, sRemoteFileTo, sUserName, sPassword, nPort, sProxy, bIsSFTP, sPrivateKeyFilePath)` |
| `ReadFromFtp` | `ReadFromFtp(sServerNameOrIP, sRemoteDirectory, sRemoteFileName, nMaxSize, sUserName, sPassword, nPort, sProxy, bIsSFTP, sPrivateKeyFilePath)` |
| `RenameOnFtp` | `RenameOnFtp(sServerNameOrIP, sRemoteDirectory, sFileNameOld, sFileNameNew, sUserName, sPassword, nPort, sProxy, bIsSFTP, sPrivateKeyFilePath)` |
| `SendToFtp` | `SendToFtp(sServerNameOrIP, sRemoteDirectory, sRemoteFileName, sLocalFileName, sUserName, sPassword, nPort, sProxy, bUsePassive, bIsSFTP, sPrivateKeyFilePath)` |
| `WriteToFtp` | `WriteToFtp(sServerNameOrIP, sRemoteDirectory, sRemoteFileName, sFileContents, sUserName, sPassword, nPort, sProxy, bIsSFTP, sPrivateKeyFilePath)` |

### Session & Application Functions

| Function | Signature |
|---|---|
| `AddToSession` | `AddToSession(sKey, vValue)` |
| `GetFromSession` | `GetFromSession(sKey)` |
| `ClearSession` | `ClearSession()` |
| `GetFromApplication` | `GetFromApplication(sKey)` |
| `GetSetting` | `GetSetting(sName)` |
| `GetSettings` | `GetSettings(aNames)` |
| `GetUserData` | `GetUserData()` |
| `SetUserData` | `SetUserData(vUserName)` |
| `GetInlineCode` | `GetInlineCode(sValue, aVariables)` |
| `DeleteInlineCode` | `DeleteInlineCode(sValue)` |
| `GetRegion` | `GetRegion(sValue, vSrc, vDst)` |
| `GetRegionEx` | `GetRegionEx(vValue, vSrc, vDst, vLocalRegions)` |
| `IsProductionModeOn` | `IsProductionModeOn()` |

`GetRegionEx(vValue, vSrc, vDst, vLocalRegions)` extracts text between two marker strings in an arbitrary string. It is a pure string utility — it does not require a compiled `:REGION` block. Use it in preference to `GetRegion` when working with string content rather than named code regions.

### Security & Authentication Functions

| Function | Signature |
|---|---|
| `EncryptData` | `EncryptData(sInputData, sPassword, sAlgorithm, sKey, sRetType)` |
| `DecryptData` | `DecryptData(sInputData, sPassword)` |
| `HashData` | `HashData(sInputData, sAlgorithm)` |
| `VerifySignature` | `VerifySignature(sCertificateString, vData, sSignature)` |
| `MimeEncode` | `MimeEncode(vV)` |
| `MimeDecode` | `MimeDecode(vV)` |
| `ChkPassword` | `ChkPassword(sUserName, sPassword)` |
| `ChkNewPassword` | `ChkNewPassword(sPassword, vPrevPasswords)` |
| `SetUserPassword` | `SetUserPassword(sUserName, sPassword)` |
| `LDAPAuth` | `LDAPAuth(sLdapHost, nLdapPort, sLdapUserName, sLdapPassword, sLdapDistinctiveName, bSecure)` |
| `LDAPAuthEX` | `LDAPAuthEX(sLdapHost, nLdapPort, sBindUserName, sBindUserPassword, sSearchUserName, sSearchUserPassword, sLdapDistinguishedName, sLdapDistinguishedNameStartSearch, sSearchFilter, sAuthAttribName, bSecure)` |
| `SearchLDAPUser` | `SearchLDAPUser(sLdapHost, nLdapPort, sBindUserName, sBindUserPassword, sSearchUserName, sLdapDistinguishedNameStartSearch, sSearchFilter, bSecure)` |

### Web, XML & JSON Functions

| Function | Signature |
|---|---|
| `ToXml` | `ToXml(vO, sTypeName)` |
| `FromXml` | `FromXml(sXml)` |
| `ToJson` | `ToJson(vValue)` |
| `FromJson` | `FromJson(vValue)` |
| `HtmlEncode` | `HtmlEncode(vData)` |
| `HtmlDecode` | `HtmlDecode(vData)` |
| `UrlEncode` | `UrlEncode(vData)` |
| `UrlDecode` | `UrlDecode(vData)` |
| `XmlDomToUdObject` | `XmlDomToUdObject(vXml, vPreserveWhitespace)` |

### Platform Integration Functions

| Function | Signature |
|---|---|
| `LimsNETConnect` | `LimsNETConnect(sAssembly, sTypeName, aArgs, vAsStatic)` |
| `LimsNETCast` | `LimsNETCast(vValue, sNewType)` |
| `LimsNETTypeOf` | `LimsNETTypeOf(vTypeName)` |

### Email & Messaging Functions

| Function | Signature |
|---|---|
| `SendLimsEmail` | `SendLimsEmail(sSMTP, aRecipients, sFromWho, sSubject, sMessageBody, aAttachList, aCClist, aBCClist, sReplyTo, nNPort, sUName, sUPass, bIgnoreErrors, bUseCDO, nTimeout, bUseSSL, bIsBodyHTML, sEncryptedData)` |
| `SendToOutbox` | `SendToOutbox(sSMTP, aRecipients, sFromWho, sSubject, sMessageBody, aAttachList, aCClist, aBCClist, sReplyTo, nNPort, sUName, sUPass, bIgnoreErrors, bUseSSL, bIsBodyHTML, sEncryptedData)` |
| `SendFromOutbox` | `SendFromOutbox(bIgnoreErrors, bUseCDO, nTimeout)` |
| `SendOutlookReminder` | `SendOutlookReminder(sSMTP, nStart, dEnd, sSubject, sSummary, sLocation, sOrganizerName, sOrganizerEmail, sAttendeeName, sAttendeeEmail, nNPort, sUName, sUPass, bIgnoreErrors, bUseSSL)` |

### Compression & Zip Functions

| Function | Signature |
|---|---|
| `Compress` | `Compress(sSource, vToFile)` |
| `Decompress` | `Decompress(sSource, vFromFile)` |
| `CreateZip` | `CreateZip(sZipFileName, sSourceDirectory, bRecurse, sFileFilter, sPassword)` |
| `ExtractZip` | `ExtractZip(sZipFileName, sTargetDirectory, sFileFilter, sPassword)` |

### Batch & System Functions

| Function | Signature |
|---|---|
| `SubmitToBatch` | `SubmitToBatch(sCode, vParameters, sMode, sUserName, sPassword)` |
| `SubmitToBatchEx` | `SubmitToBatchEx(sCode)` |
| `InBatchProcess` | `InBatchProcess()` |
| `DosSupport` | `DosSupport(sCmd, sPrm, vDbg)` |
| `RunApp` | `RunApp(sApplication, sArguments)` |
| `LWait` | `LWait(nSeconds)` |
| `CreateGUID` | `CreateGUID()` |
| `SetDecimalSeparator` | `SetDecimalSeparator(sDecimalSep)` |
| `GetDecimalSep` | `GetDecimalSep()` |
| `GetDecimalSeparator` | `GetDecimalSeparator()` |
| `SetGroupSeparator` | `SetGroupSeparator(sGroupSep)` |
| `GetGroupSeparator` | `GetGroupSeparator()` |

### Documentum (DMS) Functions

| Function | Signature |
|---|---|
| `DocInitDocumentumInterface` | `DocInitDocumentumInterface()` |
| `DocEndDocumentumInterface` | `DocEndDocumentumInterface()` |
| `DocLoginToDocumentum` | `DocLoginToDocumentum(sDocBase, sUser, sPassword)` |
| `DocCommandFailed` | `DocCommandFailed()` |
| `DocGetErrorMessage` | `DocGetErrorMessage()` |
| `DocCreateCabinet` | `DocCreateCabinet(sName, sCabinetType, sAcl)` |
| `DocDeleteCabinet` | `DocDeleteCabinet(sCabinetId, bDeepDelete)` |
| `DocGetCabinets` | `DocGetCabinets()` |
| `DocCreateFolder` | `DocCreateFolder(sPath, sName, sAcl)` |
| `DocDeleteFolder` | `DocDeleteFolder(sFolderId, bDeepDelete)` |
| `DocGetFolders` | `DocGetFolders(sParentPath)` |
| `DocImportDocument` | `DocImportDocument(sDocFile, sDestinationPath, sDocName, sDocType, sAppCode, sAclName)` |
| `DocExportDocument` | `DocExportDocument(sDocumentId, sFormat)` |
| `DocGetDocuments` | `DocGetDocuments(sFolderPath, sDocTypes)` |
| `DocExists` | `DocExists(sObjId)` |
| `DocDelete` | `DocDelete(sObjId, bAllVersions)` |
| `DocCheckinDocument` | `DocCheckinDocument(sFilePath, sDocumentId, sVersion, bReplaceContent, bMajorVersion)` |
| `DocCheckoutDocument` | `DocCheckoutDocument(sDocumentId)` |
| `DocCancelCheckout` | `DocCancelCheckout(sDocumentId)` |
| `DocGetMetadata` | `DocGetMetadata(sObjId, oAttributes)` |
| `DocSetMetadata` | `DocSetMetadata(sObjId, oAttributes)` |
| `DocGetTypeAttributes` | `DocGetTypeAttributes(sTypeName)` |
| `DocGetTypeAttributesAsDataset` | `DocGetTypeAttributesAsDataset(sTypeName)` |
| `DocCreateACL` | `DocCreateACL(sName, sDescription, aGroups)` |
| `DocCreateUser` | `DocCreateUser(sLoginName, sPassword, sUserName, sEMail, sDefaultFolder, sGroupName, sPermissionSet, nUserPrivileges)` |
| `DocUpdateUser` | `DocUpdateUser(sLoginName, sPassword, sUserName, sEMail, sDefaultFolder, sGroupName, sPermissionSet, nUserPrivileges)` |
| `DocDeleteUser` | `DocDeleteUser(sName)` |
| `DocExistsUser` | `DocExistsUser(sLoginName, sUserName)` |
| `DocCreateGroup` | `DocCreateGroup(sName, sDescription)` |
| `DocAddUsersToGroup` | `DocAddUsersToGroup(sGroupName, aUsers)` |
| `DocRemoveUsersFromGroup` | `DocRemoveUsersFromGroup(sGroupName, aUsers)` |
| `DocRemoveAllUsersFromGroup` | `DocRemoveAllUsersFromGroup(sGroupName)` |
| `DocStartWorkflow` | `DocStartWorkflow(sWorkflowId, aDocumentIds, sPackageName)` |
| `DocStopWorkflow` | `DocStopWorkflow(sWorkflowId)` |
| `DocPauseWorkflow` | `DocPauseWorkflow(sWorkflowId)` |
| `DocResumeWorkflow` | `DocResumeWorkflow(sWorkflowId)` |
| `DocGetWorkflowStatus` | `DocGetWorkflowStatus(sWorkflowId)` |
| `DocGetTasks` | `DocGetTasks(sWorkflowId)` |
| `DocGetTasksCount` | `DocGetTasksCount()` |
| `DocAcquireWorkitem` | `DocAcquireWorkitem(sWorkitemId)` |
| `DocCompleteWorkitem` | `DocCompleteWorkitem(sWorkitemId, sSignOffUser, sSignOffPass, sSignOffReason)` |
| `DocDelegateWorkitem` | `DocDelegateWorkitem(sWorkitemId, sUser)` |
| `DocRepeatWorkitem` | `DocRepeatWorkitem(sWorkitemId, aUsers, sSignOffUser, sSignOffPass, sSignOffReason)` |
| `DocGetWorkitemProperties` | `DocGetWorkitemProperties(sWorkitemId)` |
| `DocSearchFullText` | `DocSearchFullText(sTextToSearch, sStartLocation, nResultSetSize)` |
| `DocSearchAsDataset` | `DocSearchAsDataset(sContains, sStartLocation, sObjectType, sWhere, bAllVersions, nResultSetSize)` |
| `DocSearchUsingDql` | `DocSearchUsingDql(sDql, nResultSetSize)` |

---

## 11. Built-in Classes Reference

Directly instantiable built-in classes use curly brace syntax only:
`oObject := ClassName{args};`. They cannot be instantiated via
`CreateUdObject`.

This public reference includes both directly instantiable classes and
developer-accessible classes that are only reached indirectly as return values
(such as the `CData*` family and `SSLError`).

### Quick Reference: All Classes

| Class | Constructor | Description |
|---|---|---|
| `AzureStorage` | `AzureStorage{}` / `AzureStorage{sConnectionName}` / `AzureStorage{sAccountName, sAccountKey}` / `AzureStorage{sAccountName, sAccountKey, bUseHttps}` | Azure cloud storage |
| `BatchSupport` | `BatchSupport{}` | Batch processing helper |
| `CDataColumn` | Returned by `CDataColumns:Get()` | Data table column metadata wrapper |
| `CDataColumns` | Returned by `CDataTable:Columns` | Data table column collection |
| `CDataField` | Returned by `CDataRow:GetField()` | Data field value wrapper |
| `CDataRow` | Returned by `CDataTable:Rows` / `CDataTable:Select()` | Data row wrapper |
| `CDataTable` | `CDataTable{}` / returned by `TablesImport:GetTable()` | Data table wrapper |
| `Email` | `Email{}` / `Email{bIgnoreExceptions}` | SMTP email sender |
| `EnterpriseExporter` | `EnterpriseExporter{aTables, bSysTables, sPath}` | Table export utility |
| `FtpsClient` | `FtpsClient{}` | Secure FTP client |
| `HtmlConverter` | `HtmlConverter{}` | HTML conversion |
| `PatcherSupport` | `PatcherSupport{}` | System comparison/patching |
| `PdfSupport` | `PdfSupport{}` | PDF manipulation |
| `RegSetup` | `RegSetup{}` | Registry operations |
| `SDMS` | `SDMS{}` / `SDMS{oCredentials}` | SDMS client |
| `SDMSDocUploader` | `SDMSDocUploader{}` / `SDMSDocUploader{oCredentials}` | SDMS document uploader |
| `Sequence` | `Sequence{sPlatforma, sTableName, sFieldName, sPrefix}` | Database sequence helper |
| `SSLBaseDictionary` | `SSLBaseDictionary{}` | Base dictionary class |
| `SSLCodeProvider` | `SSLCodeProvider{}` | Code compilation utility |
| `SSLDataset` | `SSLDataset{}` / `SSLDataset{vData, vNullAsBlank}` | Dataset wrapper |
| `SSLError` | Returned by `GetLastSSLError()` | Exception object (`:Message`, `:Description`, `:Code`, `:GenCode`, `:Operation`, `:FullDescription`, `:FullDescriptionEx`, `:InnerException`, `:NETException`) |
| `SSLExpando` | `SSLExpando{}` | Dynamic object |
| `SSLIntDictionary` | `SSLIntDictionary{}` / `SSLIntDictionary{nLength}` | Numeric-keyed dictionary |
| `SSLRegex` | `SSLRegex{sPattern}` / `SSLRegex{sPattern, bCaseSensitive}` | Regular expressions |
| `SSLStringDictionary` | `SSLStringDictionary{}` / `SSLStringDictionary{vCaseSensitive, nLength}` | String-keyed dictionary |
| `TablesImport` | `TablesImport{sFolder}` | Table import utility |
| `WebServices` | `WebServices{}` | HTTP/SOAP client factory |

### CDataTable Family

Developer scripts can access the `CData*` classes indirectly through
`TablesImport:GetTable()` and related member calls, even though most of them are
not directly instantiable.

```ssl
/* Direct constructor or producer;
oTable := CDataTable{};
oTable := oTablesImport:GetTable("limsusers");

/* Indirectly accessible related classes;
oColumns := oTable:Columns;          /* CDataColumns;
oColumn := oColumns:Get(1);          /* CDataColumn;
oRows := oTable:Rows;
oRow := oRows[1];                    /* CDataRow;
oField := oRow:GetField("user_name"); /* CDataField;
```

### Email

SMTP email sender with TLS options, attachments, and certificate support.

```ssl
/* Constructors;
oEmail := Email{};
oEmail := Email{bIgnoreExceptions};

/* Properties (read/write unless noted);
oEmail:LogSMTP                → Boolean
oEmail:From                  → String
oEmail:To                    → Array
 oEmail:CC                   → Array
 oEmail:BCC                  → Array
 oEmail:IgnoreExceptions     → Boolean
oEmail:Subject               → String
oEmail:Body                  → String
oEmail:IsHTMLBody            → Boolean
oEmail:Attachments           → Array
oEmail:SMTPServerName        → String
oEmail:SMTPServerPort        → Number
oEmail:SMTPTimeout           → Number
oEmail:SMTPSecureConnection  → Boolean
oEmail:SMTPServerUserName    → String
oEmail:SMTPServerUserPassword → String
oEmail:Exception             → Object (read-only)

/* Methods;
oEmail:SetSignCertificateFromStore(sEmail, sStoreName)   → Boolean
oEmail:SetEncryptCertificateFromStore(sEmail, sStoreName) → Boolean
oEmail:SetSignCertificateFromPath(sCertPath, sPassword)   → Boolean
oEmail:SetEncryptCertificateFromPath(sCertPath, sPassword) → Boolean
oEmail:Send()                                            → Boolean
oEmail:SaveMessage(sPath)                                → Boolean
oEmail:LoadMessage(sPath)                                → Boolean
oEmail:SendToOutbox()                                    → Boolean
```

### SSLRegex

Regular expression matching.

```ssl
/* Constructors;
oRegex := SSLRegex{sPattern};
oRegex := SSLRegex{sPattern, bCaseSensitive};

/* Properties (read-only);
oRegex:CaseSensitive → Boolean

/* Methods;
bMatch := oRegex:IsMatch(sInput, nStartAt);  → Boolean
```

### SSLStringDictionary

String-keyed dictionary with optional case sensitivity.

```ssl
/* Constructors;
oDict := SSLStringDictionary{};
oDict := SSLStringDictionary{vCaseSensitive, nLength};

/* Methods;
oDict:AddValue(sKey, vValue)        → Any
oDict:GetValue(sKey, vDefault)    → Any
oDict:Contains(sKey)              → Boolean
oDict:Remove(sKey)                → Any
oDict:TryGetValue(sKey)           → Object   /* {Exists, Value};
```

### SSLIntDictionary

Numeric-keyed dictionary.

```ssl
/* Constructors;
oDict := SSLIntDictionary{};
oDict := SSLIntDictionary{nInitialLength};

/* Methods;
oDict:AddValue(nKey, vValue)        → Any
oDict:GetValue(nKey, vDefault)    → Any
oDict:Contains(nKey)              → Boolean
oDict:Remove(nKey)                → Any
oDict:TryGetValue(nKey)           → Object   /* {Exists, Value};
```

### SSLBaseDictionary

Base dictionary class (parent of SSLStringDictionary and SSLIntDictionary).

```ssl
/* Constructor;
oDict := SSLBaseDictionary{};

/* Properties;
oDict:Keys   → Array
oDict:Values → Array
oDict:Count  → Number (read-only)

/* Methods;
oDict:AddValue(vKey, vValue)
oDict:Clear()
oDict:Contains(vKey)              → Boolean
oDict:GetValue(vKey, vDefault)    → Any
oDict:Invoke(vKey, aArgs)         → Any
oDict:Remove(vKey)                → Any
oDict:TryGetValue(vKey)           → Object
```

### SSLExpando

Dynamic object returned by `CreateUdObject()`.

```ssl
/* Create via CreateUdObject();
oExp := CreateUdObject();

/* Properties;
oExp:XmlType → String

/* Methods;
oExp:AddProperty(sPropName)
oExp:GetProperty(sPropName) → Any
oExp:SetProperty(sPropName, vValue)
oExp:IsProperty(sPropName)   → Boolean
oExp:IsMethod(sMethodName)   → Boolean
oExp:GetPropList()           → Array
oExp:GetDynPropList()        → Array
oExp:GetProperties()         → Array
oExp:GetMethods()            → Array
oExp:InvokeMethod(sMethodName, aArgs) → Any
oExp:IsEmpty()               → Boolean
oExp:clone()                 → Any
oExp:Serialize()             → String
oExp:Deserialize(sData)
oExp:Destroy()
oExp:ToJson()                → String
```

### SSLDataset

Dataset wrapper for query results. Obtain via `GetSSLDataset(...)` or `RunDS(..., "ssldataset")`.

```ssl
/* Constructors;
oDataset := SSLDataset{};
oDataset := SSLDataset{vData, vNullAsBlank};

/* Methods;
oDataset:ToXml()      → String
oDataset:ToArray()    → Array
oDataset:ToDataSet()  → Object
```

### SSLCodeProvider

Code compilation utility.

```ssl
/* Constructor;
oProvider := SSLCodeProvider{};

/* Methods;
oProvider:CompileScript(sScript)
oProvider:CompileAll()
oProvider:CompileServerScript(sScript)
oProvider:CompileAllServerScripts()
oProvider:CompileDataSource(sDataSource)
oProvider:CompileAllDataSources()
oProvider:CompileServerScripts(aScripts)
oProvider:CompileDataSources(aDataSources)
oProvider:CompileServerScriptCategory(sCategory)
oProvider:CompileServerScriptCategories(aCategories)
oProvider:CompileDataSourceCategory(sCategory)
oProvider:CompileDataSourceCategories(aCategories)
```

### PdfSupport

PDF document manipulation.

```ssl
/* Constructor;
oPdf := PdfSupport{};

/* Properties;
oPdf:UserPassword              → String (write-only)
oPdf:OwnerPassword             → String (write-only)
oPdf:DocumentSecurityLevel     → String
oPdf:PermitAccessibilityExtractContent → Boolean
oPdf:PermitAnnotations         → Boolean
oPdf:PermitAssembleDocument    → Boolean
oPdf:PermitExtractContent      → Boolean
oPdf:PermitFormsFill           → Boolean
oPdf:PermitFullQualityPrint    → Boolean
oPdf:PermitModifyDocument      → Boolean
oPdf:PermitPrint               → Boolean
oPdf:PageCount                 → Number (read-only)

/* Methods;
oPdf:Open(sFileName)
oPdf:OpenProtectedDocument(sFileName, sPassword)
oPdf:Save(sFileName)
oPdf:AddPageFromImage(sImagePath)
oPdf:AddPDFDocument(sPdfPath)
oPdf:SetTextStyle(sFontName, nFontSize, sFontStyle, sFontColor)
oPdf:AddTextOnPage(sText, nPageNum, nX, nY)
oPdf:Print(sAdobePath, sFileName, sPrinterName)
oPdf:Protect(sPassword)
```

### FtpsClient

Secure FTP client.

```ssl
/* Constructor;
oFtp := FtpsClient{};

/* Methods;
oFtp:SetFtpsProxy(sProxyType, sProxy, nPort, sUser, sPassword)
oFtp:SetTlsParameters(sAllowedSuites, sCommonName, sVersion, sCertLocation, sCertPath, sCertPassword)
oFtp:Connect(sServer, nPort, sSecurity)                → String
oFtp:Disconnect()                                      → String
oFtp:Login(sUserName, sPassword, sAccount)             → String
oFtp:Secure()
oFtp:CheckOnFtps(sRemoteDir, sFileName)                → Boolean
oFtp:CopyToFtps(sRemoteDir, aRemoteFileNames, sContents) → Boolean
oFtp:DeleteDirOnFtps(sRemoteDir)                       → Boolean
oFtp:DeleteFromFtps(sRemoteDir, sFileName)             → Boolean
oFtp:GetDirFromFtps(sRemoteDir)                        → Array
oFtp:GetDirNamesFromFtps(sRemoteDir)                   → Array
oFtp:GetFromFtps(sRemoteDir, sRemoteFile, sLocalFile)  → Boolean
oFtp:MakeDirOnFtps(sRemoteDir)                         → Boolean
oFtp:MoveInFtps(sFromDir, sToDir, sFromFile, sToFile)   → Boolean
oFtp:ReadFromFtps(sRemoteDir, sFileName, nMaxSize)      → String
oFtp:RenameOnFtps(sRemoteDir, sOldName, sNewName)       → Boolean
oFtp:SendToFtps(sRemoteDir, sRemoteFile, sLocalFile)    → Boolean
oFtp:WriteToFtps(sRemoteDir, sRemoteFile, sContents)    → Boolean
```

### AzureStorage

Azure cloud storage operations.

```ssl
/* Constructors;
oAzure := AzureStorage{};
oAzure := AzureStorage{sConnectionName};
oAzure := AzureStorage{sAccountName, sAccountKey};
oAzure := AzureStorage{sAccountName, sAccountKey, bUseHttps};

/* Table operations;
oAzure:CreateTable(sTableName)
oAzure:DeleteTable(sTableName)
oAzure:InsertEntity(sTableName, oEntity)
oAzure:InsertEntities(sTableName, aEntities)
oEntity := oAzure:SelectEntity(sTableName, sPartitionKey, sRowKey)  → Object
aEntities := oAzure:SelectEntities(sTableName, oAttributes)         → Array
oAzure:DeleteEntity(sTableName, sPartitionKey, sRowKey)
oAzure:DeleteEntities(sTableName, aEntities)
bSuccess := oAzure:UpdateEntity(sTableName, oEntity)                → Boolean

/* Blob operations;
oAzure:CreateContainer(sContainerName)
oAzure:DeleteContainer(sContainerName)
oAzure:PutBlob(sContainerName, sLocalPath, sBlobName)
sPath := oAzure:GetBlob(sContainerName, sBlobName, sDestPath)       → String
oAzure:DeleteBlob(sContainerName, sBlobName)
sText := oAzure:ReadBlobAsText(sContainerName, sBlobName)           → String
```

### Sequence

Database sequence helper.

```ssl
/* Constructor;
oSeq := Sequence{sPlatforma, sTableName, sFieldName, sPrefix};

/* Properties;
oSeq:StartWith    → Number
oSeq:CacheSize    → Number
oSeq:SequenceName → String (read-only)
oSeq:Exists       → Boolean (read-only)
oSeq:NextValue    → Number (read-only)

/* Methods;
oSeq:Create()
oSeq:Reset(nNewValue)
oSeq:Drop()
oSeq:SetDatabase(sDatabase)
```

### SDMS

SDMS client.

```ssl
/* Constructors;
oSdms := SDMS{};
oSdms := SDMS{oCredentials};

/* Properties;
oSdms:SessionId        → String
oSdms:ErrorMessage     → String (read-only)
oSdms:IsSessionExpired → Boolean (read-only)

/* Methods;
oSdms:CreateUnifiedXmlDOM() → Object
oSdms:GetSoapPassHash(sDictPass)  → String
oSdms:GetHttpPassHash(sDictPass)  → String
oUploader := oSdms:CreateDocUploader(oCredentials) → SDMSDocUploader
bOk := oSdms:DownloadDocument2(sDocId, sDocType, sPath)         → Boolean
bOk := oSdms:DownloadOriginalDocument2(sDocId, sPath)     → Boolean
bOk := oSdms:DownloadUnifiedXmlDocument2(sDocId, sPath)   → Boolean
bOk := oSdms:DownloadUnifiedXmlTemplate(sTemplateId, sPath) → Boolean
bOk := oSdms:CheckOutDocument(sDocId, sPath)              → Boolean
```

### SDMSDocUploader

SDMS document upload helper.

```ssl
/* Constructors;
oUploader := SDMSDocUploader{};
oUploader := SDMSDocUploader{oCredentials};

/* Properties;
oUploader:FilePath     → String
oUploader:DocName      → String
oUploader:DocId        → Number
oUploader:FileType     → String
oUploader:ProjectName  → String
oUploader:WorkflowId   → Number
oUploader:StageId      → Number
oUploader:ActionId     → Number
oUploader:Metadata     → Array
oUploader:UXmlTemplate → String

/* Methods;
bOk := oUploader:UploadOriginalDoc()                    → Boolean
bOk := oUploader:AttachDocToWorkflow()                  → Boolean
bOk := oUploader:CheckInDocument(sRevision, sStatus)    → Boolean
bOk := oUploader:AttachFileToDocument()                 → Boolean
bOk := oUploader:UploadOfficeTemplate()                 → Boolean
bOk := oUploader:UploadELNDocument()                    → Boolean
oUploader:AddHeader(sKey, sValue)
oUploader:RemoveHeader(sKey)
nResult := oUploader:DoUpload(sFilePath, sSdmsUrl)      → Number
bOk := oUploader:CheckInWorkflowDocument(sRevision, sStatus, nEntryPoint) → Boolean
bOk := oUploader:UploadNewRevisionForWorkflowDocument(sMessage) → Boolean
```

### Remaining Classes (Brief)

These classes are available but less commonly used:

- **`BatchSupport`** — Properties (read-only): `ActiveBatchesNumber`, `PhysicalMemory`, `VirtualMemory`. Methods: `Dispose()`, `IsRunning()`
- **`EnterpriseExporter`** — Properties: `AbortOnError`, `LogFile`, `IsEnterpriseOnly`, `FromSQL`, `NullAsBlank`, `InvariantDateColumns`. Method: `DoExport()`
- **`HtmlConverter`** — Properties: `OptionsXml` (write-only), `SimplifiedLog` (read-only), `Log` (read-only). Methods: `ClearLog()`, `Convert()`
- **`PatcherSupport`** — Properties: `LogFilePath`, `ResultTable` (read-only), `InternalErrors` (read-only), `DiffDataTable` (read-only). Methods: `Compare()`, `ConnectToExternalSystem()`, `GetDataFromWholeDictionary()`, `GetAllFormsFromDictionary_Test()`
- **`RegSetup`** — Methods: `RegCloseKey()`, `RegOpenKey()`, `RegQueryValue()`
- **`TablesImport`** — Properties: `NullAsBlank`, `IncludeORIGREC`, `ErrMsg` (read-only). Method: `GetTable()`
- **`WebServices`** — Methods: `CreateHttpClient()`, `CreateSoapClient()`
