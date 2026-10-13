# Language Definition: STARLIMS Scripting Language (SSL v11)

## 0. Agent Quick Start (Read First)

This reference documents the authoritative behavior of the STARLIMS SSL v11 language.
Authoritative rules describe documented language behavior; style recommendations are marked as guidance.

### Authoritative Language Rules

1. **Colon-prefixed keywords are case-sensitive** and must be UPPERCASE (e.g., `:IF`, `:FOR`). **SSL literals/constants** (`NIL`, `.T.`, `.F.`) are case-insensitive. **Class-context forms** (`Me`, `Base`, `Constructor`) are also case-insensitive; `Base` is used in colon-chained member access and `Constructor` is only meaningful as the fixed constructor declaration name inside `:CLASS`. **Identifiers and function names are case-insensitive.**
2. **Semicolons are mandatory** for almost every statement, including comments.
3. **Declare variables before use** with `:DECLARE`. SSL does not enforce this (an undeclared name is looked up in caller scopes and publics, and a write to it can change a caller's variable), so declaring every name is the safe default rather than a language rule. **Do not** use `:DEFAULT` on a `:DECLARE` line.
4. **Declaration ordering.** `:PARAMETERS` must appear before any other statements in a script or procedure body. `:DEFAULT` must immediately follow `:PARAMETERS` (zero or more `:DEFAULT` lines, but only after `:PARAMETERS`). `:DECLARE` and `:PUBLIC` are regular statements and can appear anywhere in the statement flow. `:INCLUDE` is resolved as a textual paste before the rest of the file is read, so its position is technically flexible, but it should appear early to ensure expanded content is available. Recommended conventional order: `:PARAMETERS`, `:DEFAULT`, `:INCLUDE`, `:PUBLIC`, `:DECLARE`. **Data source files use different syntax** — see §4A.
5. **Custom procedures cannot be called directly.** A bare `Name(...)` call always means a built-in function, in scripts and classes alike; any other name stops the script from compiling with `Invalid built-in function: Name`. Use `DoProc("ProcName", {args})` for same-file script procedures and `ExecFunction("Category.Script", {args})` or `ExecFunction("Category.Script.Proc", {args})` for external scripts/procedures. Inside `:CLASS` methods, call sibling/inherited methods with `Me:Method()` / `Base:Method()` — an unqualified `DoProc("ProcName", ...)` is rejected inside class methods, though fully qualified `DoProc("Category.Script.Proc", ...)` calls to deployed script procedures are allowed.
6. **Arrays are 1-based.** The first element is `aArray[1]`.
7. **Object creation rules:** Built-in classes use curly braces only (`Email{}`, `SSLDataset{}`) — they cannot be instantiated via `CreateUdObject`. `CreateUdObject()` creates an empty dynamic object; `CreateUdObject("Category.ClassName")` or `CreateUdObject("Category.ClassName", {args})` instantiates a user-defined `:CLASS` (a bare class name is looked up only among the default categories, so it fails for a class in your own category); `CreateUdObject({{"Prop", value}, ...})` creates an anonymous object with named properties.
8. **SQL parameterization:** `SQLExecute` is the only function that supports `?varName?` substitution. Other DB functions such as `RunSQL`, `LSearch`, `LSelect`, `LSelect1`, `LSelectC`, and `GetDataSet` use positional `?` with explicit parameter arrays. `GetSSLDataset` is the exception: it uses `@name` markers with parallel name and value arrays.
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
    * **No argument type checks before run time:** Whether a built-in function rejects a wrong-typed argument depends on the installation's `CompilerCheckParamType` setting. Where it is off, a string passed for a number reads as `0` and a number passed for a string reads as `""`, so the call quietly returns a wrong answer, and a non-array passed where an array is expected can crash the server process. Pass the documented types and do not rely on the setting.
    * **Re-declaration:** Re-declaring an existing variable with `:DECLARE` is silently ignored — no error is thrown and the existing value is preserved.
    * *Constraint:* `:DEFAULT` cannot be used with `:DECLARE`.

* **Variable Lookup Order:** When a variable is referenced, lookup proceeds as **local scope** (current procedure) → **caller scopes** (up the call stack) → **public variables** (`:PUBLIC`). Accessing a caller's variable works but generates a warning — always declare variables locally with `:DECLARE`.

* **Predefined globals are installation variables, not language constants.** Names such as `CRLF`, `MYUSERNAME`, `UserLang` and `STARLIMSDEPT` are `:PUBLIC` variables that a base installation declares at startup. `CR`, `LF`, `TAB`, `sTab`, `sSQ`, `sDQ`, `MYUSERID`, `MYLANGID`, `MYDEPT` and `MYSITE` are **not** declared on a base installation, and reading one raises `Variable [<name>] is undefined!`. Use `Chr(13)`, `Chr(10)` and `Chr(9)` (or `CRLF` for a line break), `Chr(34)` for a double quote, `MYUSERNAME` for the user, `UserLang` for the language and `STARLIMSDEPT` for the department. Test with `IsDefined` before reading a global your installation may not declare.

* **Parameters & Defaults:**
    * **Placement:** `:PARAMETERS` must appear before any other statements in a script or procedure body. Inside a procedure, `:PARAMETERS` must immediately follow the `:PROCEDURE` line.
    * **Defaults:** `:DEFAULT` must immediately follow `:PARAMETERS` (zero or more `:DEFAULT` lines, but only after `:PARAMETERS`). A `:DEFAULT` applies when the argument is omitted, passed as `NIL`, or left as an empty position (`{a,,c}`), so no extra `NIL` check is needed after it.
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
    * **Authoritative Behavior:** `:BEGINCASE` is not a value-matching switch and requires at least one `:CASE` block (empty `:BEGINCASE;` `:ENDCASE;` is rejected). Each `:CASE` evaluates its own boolean expression. Without `:EXITCASE;`, later `:CASE` expressions are still evaluated and additional matching bodies may execute. `:OTHERWISE` is still skipped once any earlier `:CASE` body has run. `:EXITCASE;` must be the last statement of its `:CASE`/`:OTHERWISE` branch, directly in the branch body; a statement after it, or an `:EXITCASE` nested inside an `:IF`, is a compile error.
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
    * The `Branch` target string must include the word `LABEL`: `:LABEL SKIP;` is targeted as `Branch("LABEL SKIP")` and `:LABELSKIP;` as `Branch("LABELSKIP")`. The match is exact: a target without the word `LABEL`, or with different spacing, matches no label. Labels are visible only within their own procedure or script body. A lowercase `:label` is not a label.
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
      **`:CATCH` does not name the exception.** Use `GetLastSSLError()` inside the `:CATCH` block to retrieve an `SSLError` object. Common `SSLError` members include `:Description` (the error message; `:Message` is an alias), `:Operation`, `:Code` / `:GenCode`, `:FullDescription` / `:FullDescriptionEx` (multi-line diagnostic text with stack details and nested causes), `:InnerException`, and `:NETException`.
      **`:FINALLY` restrictions:** `:RETURN`, `:EXITWHILE`, `:EXITFOR`, and `:LOOP` inside a `:FINALLY` block are **rejected**.
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
    * **Raising errors:** `RaiseError(sMessage[, sLocation[, nErrorCode[, oInnerException]]])` throws immediately. Inside a `:TRY` block, the remaining statements in that block are skipped and `:CATCH` gets control — `GetLastSSLError()` retrieves the raised error (`sLocation` becomes `:Operation`, `nErrorCode` becomes `:Code`) — then execution continues normally after `:ENDTRY`. An uncaught error propagates up the call stack; if nothing catches it, the invocation fails and the end user sees a server error. A `NIL` message itself raises `RaiseError(): error message cannot be null.`
      **Placement doctrine:** Place `RaiseError` directly inside the `:TRY` block whose `:CATCH` handles it, so the raise can never escape. Never call `RaiseError` inside `:CATCH` — the error handler must not become the thing that crashes. Every raise needs a `:TRY`/`:CATCH` (or legacy `:ERROR`/`:RESUME`) boundary somewhere up the call stack. Mark raise-only helper procedures `/*@private;` so callers cannot invoke them without the entry point that catches their errors. After handling an error in `:CATCH`, call `ClearLastSSLError()` so stale error state does not leak into later handling.
    * **Error/Resume (Legacy):** `:ERROR;` starts the **last** section of a procedure and runs to `:ENDPROC`. It protects the statements **before** it; the statements after it are the handler body, which runs only when a protected statement fails, and must contain at least one statement. A handler placed first protects nothing. Without `:RESUME`, the first failure skips the rest of the protected region, runs the handler, and ends the procedure. With `:RESUME;` as the last handler statement, every failing protected statement runs the handler and execution continues at the statement after the one that failed — this has significant performance cost. Prefer `:TRY/:CATCH/:FINALLY` when narrower block-scoped handling fits the code.
      ```ssl
      :PROCEDURE LoadSettings;
          :DECLARE sTitle, oErr;

          /* Protected region - every statement before :ERROR;
          sTitle := ReadText("settings/title.txt");

          :RETURN sTitle;
      :ERROR;
          /* Handler - runs only when a statement above fails;
          oErr := GetLastSSLError();
          UsrMes("Read failed: " + oErr:Description);
      :RESUME;
      :ENDPROC;
      ```
      **Refactoring note:** When narrowing error scope, targeted `:TRY`/`:CATCH`/`:FINALLY` blocks provide more control than blanket resume-mode handling.

### Functions & Procedures

* **Definition:** Starts with `:PROCEDURE Name;` and ends with `:ENDPROC;`. More than 20 parameters on a procedure or method triggers a performance warning; prefer grouping related state into arrays/objects.
* **Return Values:** Use `:RETURN value;` to return a value from a procedure. A procedure, method or script that ends without `:RETURN value;` (no `:RETURN`, or a bare `:RETURN;`) returns the empty string `""`, not `NIL`: `Empty(result)` is `.T.` but `result == NIL` is `.F.`. A `Constructor` returns nothing.
* **Calling Convention (CRITICAL):**
    * **Custom Procedures:** You **cannot** call custom procedures directly (e.g., `MyProc()`).
    * **Same File:** Use `DoProc("ProcedureName", {arg1, arg2});` - second parameter is an array of arguments.
    * **Different File / Entry Point:** Use `ExecFunction("Category.Script", {arg1, arg2});` - second parameter is an array of arguments.
    * **Different File / Specific Procedure:** Use `ExecFunction("Category.Script.ProcedureName", {arg1, arg2});`.
    * **One-segment `ExecFunction("Name")`** looks for a script in the default categories, not a procedure in the current script. Use `DoProc` for same-file procedures.
    * **First segment is never ambiguous:** Applications and server-script categories share a single namespace — a category cannot be created with the name of an existing application. The first segment of a dotted path therefore always resolves to exactly one container; there is no collision or precedence rule to consider.
    * **Skip Parameters:** An empty position passes `NIL`. House style keeps skipped-argument commas adjacent: write
      `DoProc("MyProc", {param1,,param3,,param5});` rather than
      `DoProc("MyProc", {param1, , param3, , param5});`. Both forms are valid and behave the same.
    * **Omit trailing optional parameters** rather than passing empty values. For example, write `DoProc("MyProc")` not `DoProc("MyProc", {})`, and `GetDataSet(sQuery)` not `GetDataSet(sQuery, {})`. The runtime pads missing arguments with NIL.
    * **Built-in Functions:** Can be called directly with standard syntax (e.g., `Len(sString)`).

### Objects & User-Defined Types

* **Object Creation:**
    * **Built-in Class:** `oObject := ClassName{};` — built-in classes cannot be instantiated via `CreateUdObject`. Known built-in classes: `AzureStorage`, `BatchSupport`, `CDataTable`, `Email`, `EnterpriseExporter`, `FtpsClient`, `HtmlConverter`, `PatcherSupport`, `PdfSupport`, `RegSetup`, `SDMS`, `SDMSDocUploader`, `SSLCodeProvider`, `SSLDataset`, `SSLIntDictionary`, `SSLRegex`, `SSLStringDictionary`, `Sequence`, `TablesImport`, `WebServices`.
    * **No direct constructor:** `SSLExpando{}` raises the compile-time error `Invalid built-in class: SSLExpando` — create dynamic objects with `CreateUdObject()`. `SSLBaseDictionary` has no direct constructor — use `SSLStringDictionary{}` or `SSLIntDictionary{}`.
    * **Dynamic Object:** `oExp := CreateUdObject();` (creates an empty `SSLExpando`)
    * **User-Defined Class:** `oCustom := CreateUdObject("Samples.SampleTicket");` or `oCustom := CreateUdObject("Samples.SampleTicket", {arg1, arg2});` — for user-defined `:CLASS` files only. Name the class as `Category.ClassName`: a bare class name is looked up only among the default categories and raises `There is no script with name: <name> among default categories.` for a class in your own category.
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
    * `:INHERIT Category.ClassName;` specifies inheritance (optional, follows `:CLASS`). The parent must be written with its category; a plain name such as `:INHERIT BaseName;` is a compile-time error. Without `:INHERIT`, classes inherit from `SSLObject` by default.
    * Class contains `:DECLARE` statements and `:PROCEDURE` definitions
    * **Constructor:** Define with `:PROCEDURE Constructor;`. This is the fixed reserved name for a class constructor, not a normal method identifier. If omitted, an empty zero-argument constructor is auto-generated. Successful compilation requires class members in this order: `:INHERIT`, `:DECLARE`, regular methods, then `Constructor`. `:RETURN` inside a constructor cannot return a value. When a class inherits, the parent's parameterless `Constructor` runs automatically first; a parent `Constructor` that takes parameters does not run unless the derived `Constructor` calls `Base:Constructor(args)`.
    * **Class method calls:** Inside class methods, use `Me:MethodName()` / `Base:MethodName()` for sibling and inherited method calls. An unqualified `DoProc("ProcName", ...)` is rejected inside class methods; fully qualified `DoProc("Category.Script.Proc", ...)` calls to deployed script procedures are allowed, and `ExecFunction` has no class-method restriction.
    * **Class fields must be qualified with `Me:` / `Base:`.** Inside a class method, a bare identifier resolves to a local variable or `:PARAMETERS` entry — **not** to a `:DECLARE` field on the class. To read or write a class field, write `Me:fieldName` (or `Base:fieldName` for an inherited parent field). A bare name follows normal variable lookup (local, then caller scopes, then publics): a read with nothing of that name in reach raises `Variable [name] is undefined!`, and a write may land on a caller's or a public variable. Neither touches the field.
    * **No script entry point:** A class file contains only the class definition and cannot be run as a script. `ExecFunction("Category.ClassFile")` fails at runtime, and `ExecFunction("Category.ClassFile.MethodName")` does **not** invoke the method. Instantiate with `CreateUdObject("Category.ClassName")` and call methods on the instance.
    * **Underscore-prefixed members:** Methods and fields prefixed with `_` (e.g., `_myHelper`) are excluded from reflection-based access, making them effectively private by convention.
    * **Access modifiers (scripts only):** Place `/*@private;` or `/*@protected;` on the line immediately before `:PROCEDURE` to restrict access. Both block calls from other scripts; procedures in the same script can still call it with `DoProc`. Although they use comment syntax, SSL recognizes them as access modifiers, not regular comments: write them exactly as shown (lowercase, no space between `/*` and `@`), and do not put a blank line between the modifier and `:PROCEDURE`, which breaks the association. **These modifiers have no effect on class methods** (class methods are always Public|Virtual).
      ```ssl
      /*@private;
      :PROCEDURE InternalHelper;
          /* This procedure cannot be called from other scripts;
      :ENDPROC;
      ```
    * **`Me` form:** Self-reference to the current class instance. Use `Me:fieldName` or `Me:MethodName(args)`. Can only be used inside a `:CLASS` definition.
    * **`Base` form:** Reference to the parent class in a `:CLASS` with `:INHERIT`. Must always be followed by `:MemberName` — cannot stand alone. Use `Base:MethodName(args)` to call overridden parent methods, or `Base:fieldName` to access an inherited field.
    * **Terminology:** `:DECLARE` slots on a class are **fields**. Reserve "property" for `SSLExpando` / `AddProperty` / `CreateUdObject` anonymous-object members, which are a separate runtime mechanism.
    * Example:
      ```ssl
      :CLASS MyClass;
          :INHERIT Lab.BaseClass;

      :DECLARE sName, nValue;

      :PROCEDURE Initialize;
          :PARAMETERS sNewName;
          Me:sName := sNewName;       /* writes the class field;
          Base:Initialize(sNewName);  /* call inherited method;
      :ENDPROC;

      :PROCEDURE GetSelf;
          :RETURN Me;
      :ENDPROC;

      :PROCEDURE Constructor;
          :PARAMETERS sNewName;
          Me:sName := sNewName;
          Me:nValue := 0;
      :ENDPROC;
      ```

* **Endpoint ambients (`Request` / `Response`):** Endpoint scripts run with two pre-injected identifiers in scope: `Request` (the incoming HTTP request) and `Response` (the outgoing reply being built). They are not declared with `:DECLARE`, do not need `Me:` qualification, and cannot be reassigned by name — treat them as ambient runtime objects that are meaningful only in scripts wired up as endpoints. Read request data via `Request:` members (URL, headers, body, query/form values) and shape the reply via `Response:` members (status, headers, body). Use them as-is. They only describe an HTTP call inside endpoint scripts, but referencing them elsewhere does not raise an error (in a script run from Designer, `Request:UserAgent` returns the Designer client's user agent and `Response:Write` completes without an error), so neither a successful read nor a `:TRY` guard proves the script is running as an endpoint.

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
* **Multi-line:** the comment ends at the first `;`, so any layout parses. The style layout (schema `comments.examples.multi_line`) puts `/*` and `;` on their own lines:
  ```ssl
  /*
  This is a multi-line comment
  that spans several lines.
  ;
  ```
* **Warning — semicolons inside comments:** Because `;` terminates the comment, any semicolon within the comment text will prematurely end it. For example:
  ```ssl
  /* Set x := 0; then increment;
  ```
  SSL reads this as the complete comment `/* Set x := 0;` followed by `then increment;`, which it then tries to run as a statement (and rejects). Avoid semicolons in comment text, or restructure the comment to work around this limitation.
* **Access modifiers are not comments:** `/*@private;` and `/*@protected;` use comment syntax but are access modifiers (see Objects & User-Defined Types above). Tools and refactors must not respace, recase or move them, or insert a blank line between them and the following `:PROCEDURE`.

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
* **Null/Empty:** `NIL` represents null/empty values. Use `Empty(value)` to check for an empty value: it returns `.T.` for `NIL`, an empty or whitespace-only string (spaces, tabs, line breaks), `0`, `.F.`, an empty date and an empty array. `Nothing(value)` is broader: it is also `.T.` for any value whose string form is `"0"`, such as the string `"0"`. `Empty()` is NIL-safe — it returns `.T.` for `NIL` values. `Empty()` is not a NIL test: `Empty(0)` and `Empty(.F.)` are also `.T.`, so when `0` or `.F.` is a valid value, test for absence with `value == NIL`. Do not call instance methods on a `NIL` value (raises an error).
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
    * **Indexing:** **1-based indexing** (unlike most languages). Exception: collections on .NET objects reached via colon member access (e.g. `dataSet:Tables[0]`) follow .NET semantics and are 0-based.
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
- **Not-equals (`!=`, `<>`, `#`)**: Exact comparison, not the prefix match of `=`
- **Ordering (`<`, `>`, `<=`, `>=`)**: Strings order alphabetically; case only breaks ties, lowercase first (`"a" < "B"` and `"a" < "A"` are both `.T.`). `Max` and `Min` compare strings the same way.
- **Case sensitivity of replacement:** `Replace` matches case-insensitively; `StrTran` matches case-sensitively.

### Number Details

SSL has a single numeric type for whole and fractional values. The underlying native type varies with the value — whole numbers report `System.Int32` and fractions `System.Double` — so the native `:` members available differ between them. Division always produces a floating-point result (`5 / 2` yields `2.5`, not `2`). The `Integer()` function provides explicit truncation to whole numbers. Bitwise built-ins (`_AND`, `_OR`, `_XOR`, `_NOT`) and shift operators (`<<`, `>>`) require integer-valued operands (whole numbers) and raise errors on fractional values.

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
- **Scientific notation** requires a decimal point before the exponent: `1.2e-3`, `9.0E1`, `9.0E+1` are valid; `7e2`, `.5e1`, `9E+1` are not (the sign is fine, the missing decimal point is not)

### Boolean Details

| Operator | SSL Syntax | Description |
|----------|------------|-------------|
| Logical AND | `.AND.` | Returns `.T.` if both operands are true |
| Logical OR | `.OR.` | Returns `.T.` if either operand is true |
| Logical NOT | `.NOT.` | Returns opposite value |

**Key Behaviors:**
- `.AND.` and `.OR.` use **short-circuit evaluation**: if the first operand determines the result, the second operand is not evaluated (e.g., `.F. .AND. SomeFunction()` will not call `SomeFunction()`)
- **No truthy/falsy coercion.** Conditions in `:WHILE` and `:CASE`, and the left operand of `.AND.`/`.OR.`, must be logical values; other types raise an error. The right operand is not converted: `.F. .OR. "x"` returns `"x"`, so keep both operands boolean.
- `Empty()` returns `.T.` if value is `.F.` (false equals empty)
- The native `bFlag:ToString()` returns `"True"` or `"False"`, not `.T.`/`.F.`; use `LimsString(bFlag)` for `.T.`/`.F.` text
- `ToJson(bFlag)` returns `"true"` or `"false"`

### Date Details

| Operator | SSL Syntax | Description |
|----------|------------|-------------|
| Addition | `+` | Adds days (Number) to date |
| Subtraction | `-` | Subtracts days from date, OR calculates difference between two dates (returns Number days) |

**Key Behaviors:**
- `Empty()` returns `.T.` for an empty date
- The native `dDate:ToString()` returns date **and time** in the server's format (such as `9/30/2026 12:00:00 AM`), not a fixed `MM/dd/yyyy`. Pass a format (`dDate:ToString("yyyy-MM-dd")`) or use `DToC(dDate)` when the format matters
- **Any `:` member access on an empty date raises** — guard with `Empty(dDate)` first
- `ToJson(dDate)` returns a quoted timestamp string whose zone suffix depends on the date kind, or `null` for an empty date

### Array Details

| Property | Description |
|----------|-------------|
| **1-based indexing** | First element is at index 1, not 0 |
| Length | Use `ALen(aList)` or `Len(aList)`, or the native `aList:Length`. `aList:Count` raises `Invalid property: Count` |
| Copy | The native `aList:Clone()` (capital C) copies the **top level only** — nested arrays are shared. `aList:clone()` raises `Invalid method: clone` |

Arrays have no SSL-defined `:` members: calls such as `aList:Append(x)`, `aList:IsEmpty()` or `aList:ToJson()` raise. Use the array functions (`AAdd`, `ALen`, `AScan`, ...) instead.

### .NET Method Dispatch on Built-in Types

SSL's built-in scalar and array types are backed by underlying .NET values. Strings, numbers, booleans, dates and arrays have **no SSL-defined members**, so every `:` call on one of them reaches a native .NET member or raises. Native member names are **case-sensitive** (`sText:ToUpper()` works, `sText:toupper()` raises). A string value supports `:Length`, `:ToUpper()`, `:Substring(...)`, `:IndexOf(...)`, etc., a date value supports `:Year`, `:AddDays(...)`, a number value supports `:ToString(...)`, an array value exposes `:Length` and `:Clone()` (no `:Count`), and a boolean value supports `:ToString()` (returning `"True"`/`"False"`). Prefer SSL built-in functions (`Len`, `Upper`, `SubStr`, ...) for ordinary work — the implicit `:` dispatch is useful when the SSL surface does not cover what you need (formatted conversions, culture-aware comparisons, .NET-specific helpers), and it returns whatever the underlying .NET method returns, which may not be an SSL-friendly type. The same mechanism lets `MakeNETObject(value)` produce a wrapped value (`netobject`) that you then call .NET members on with `:`.

### Operators Summary

* **Assignment:** `:=` — the target can be a variable, an object property (`oTask:Status`) or an array element (`aItems[1]`). Assignment has the lowest precedence, is right-associative and evaluates to the assigned value, so `sStatus := sDefault := "PENDING";` is valid. Prefer one assignment per statement unless every target should receive the same value.
* **Compound Assignment:** `+=`, `-=`, `*=`, `/=`, `^=`, `%=` — each evaluates to the updated left-side value, so it can appear inside a condition such as `(nIndex += 1) <= nCount`.
* **Comparison:** `=`, `==`, `!=`, `<>`, `#`, `<`, `>`, `<=`, `>=` — prefer `!=` over `<>` or `#` for not-equals
* **Logical:** `.AND.`, `.OR.`, `.NOT.`, `!` (must include periods for `.AND.`/`.OR.`/`.NOT.`)
* **Arithmetic:** `+`, `-`, `*`, `/`, `^`, `**` (power), `%` (modulo)
* **Unary:** `++` (increment), `--` (decrement) — both prefix (`++i`) and postfix (`i++`) forms are supported. Prefix returns the new value; postfix returns the original value. The target can be a variable, an array element (`aCounts[1]++`) or an object property (`oStats:nHits++`) holding a number or a date (a date steps by one day).
* **String:** `+` (concatenation), `-` (trim+concat), `$` (contains)
* **Bitwise (function call syntax):** `_AND(a, b)`, `_OR(a, b)`, `_XOR(a, b)`, `_NOT(a)`, `<<`, `>>`

---

## 4. Database Operations

### SQLExecute Parameter Substitution

`SQLExecute` is the **only** SSL database function that supports `?VarName?` dynamic variable substitution. There are three placeholder shapes:

- `?name?` — `SQLExecute` only; substitutes the value of an in-scope variable or expression (input only — it never receives an output value).
- Positional `?` with a values array — `RunSQL`, `LSearch`, `LSelect`, `LSelect1`, `LSelectC`, `GetDataSet` and the other database functions. The values array is not always the third argument: `LSearch`, `LSelect` and `LSelectC` take it fourth, and `GetDataSet` second.
- `@name` with a names array and a values array — `GetSSLDataset(sSql,, {"@sStatus"}, {sStatus})`.

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
:DECLARE aResults, oErr, sSQL, sStatus, sSampleID, sSampleName, sXml;
sStatus := "A";
sSampleID := "12345";

/* RunSQL - INSERT/UPDATE/DELETE or DDL, a failure raises by default;
sSQL := "UPDATE Sample SET Status = ? WHERE SampleID = ?";
:TRY;
    RunSQL(sSQL,, {sStatus, sSampleID});
:CATCH;
    oErr := GetLastSSLError();
    ErrorMes("Status update failed: " + oErr:Description);
:ENDTRY;

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
| `RunSQL` | INSERT/UPDATE/DELETE and DDL statements (no rows returned) | `Boolean` — `.T.` on success; under the default settings a SQL failure raises, so wrap the call in `:TRY`/`:CATCH`. It returns `.F.` only after `ShowSqlErrors(.F.)` (with SQL error ignoring still on, its default); then check `GetLastSQLError`. `IgnoreSqlErrors(.T.)` alone does not stop the raise |
| `LSearch` | Single value lookups | Single value with default |
| `LSelect` | Multi-row SELECT queries; skip `aFieldList` (any value raises `fieldList != NULL - Not implemented yet.`) and pass values fourth: `LSelect(sSQL,,, {v})` | 2D Array |
| `LSelect1` | Multi-row SELECT queries | 2D Array |
| `LSelectC` | Multi-row SELECT queries; same argument layout as `LSelect` — skip `aFieldList` | 2D Array |
| `GetDataSet` | XML dataset output | XML String |

### UDObject Array Property Caveat

When using **array expansion** (`IN (?arrayVar?)`) with `SQLExecute`, the array **must be a local variable**. If the array is stored as a UDObject property, passing it directly causes a runtime error: `"The current array has more than 1 dimmension."` Scalar UDObject properties (e.g., `?oObj:ID?`) are not affected — only arrays used for `IN` expansion.

```ssl
/* WRONG - runtime error: "The current array has more than 1 dimmension.";
oFilter:statusCodes := {"A", "P", "C"};
aData := SQLExecute("SELECT * FROM Sample WHERE Status IN (?oFilter:statusCodes?)");

/* CORRECT - copy to a local variable first;
oFilter:statusCodes := {"A", "P", "C"};
aStatusCodes := oFilter:statusCodes;
aData := SQLExecute("SELECT * FROM Sample WHERE Status IN (?aStatusCodes?)");
```

### SQL Guidance (Style/Advisory)

1. **Use simple variables** for best performance
2. **Pre-compute complex expressions** into variables before the SQL
3. **Use array expansion** for dynamic `IN` clauses instead of string building — **always from a local variable, not a UDObject property**
4. **Avoid complex expressions** in production code
5. **Use `RunSQL`** for statements that return no rows (INSERT, UPDATE, DELETE, DDL), inside `:TRY`/`:CATCH`
6. **Use `LSearch`** for single-value lookups with explicit parameters
7. **Inside SQL strings**, use uppercase SQL keywords and functions; preserve
   the author's casing for other SQL identifiers (force-folding is
   dialect-conditional — safe on Oracle, but breaks case-sensitive SQL
   Server collations)

### SQL Formatting Quick Reference (Canonical Compact)

SQL in SSL strings uses **canonical compact** style. Full reference with examples
for every statement type: `ssl-style-guide/sql-canonical-compact-reference.md`

**Layout rules:**
- SQL block indented 4 spaces inside the SSL string literal
- Major clauses (`SELECT`, `FROM`, `WHERE`, `JOIN`, `GROUP BY`, `ORDER BY`, `UNION`, etc.) at column 0 relative to that indent
- `AND`/`OR` indented 2 spaces under their parent clause (`WHERE`, `ON`, `HAVING`)
- `ON` indented 2 spaces under `JOIN` (but column 0 in `MERGE`)
- `HAVING` indented 2 spaces under `GROUP BY`
- `WHEN`/`ELSE` indented 4 spaces under `CASE`; `END` aligned with `CASE`
- `SELECT` continuations aligned to first column (col 7)
- Trailing commas, ~90 char line target

**Casing:** SQL keywords and SQL functions UPPERCASE; preserve the author's
identifier casing (lowercase is an Oracle-only opt-in — see the reference's
Identifier Casing section).

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
- Every parameter **must** have an inline `:=` default. A data source with a parameter that has none fails when it runs, whatever the caller passes: `Incorrect synatx in :PARAMETERS. No default value for one or more parameters.`
- `:PARAMETERS;` with no parameters is an error — a data source that takes no parameters leaves the `:PARAMETERS` line out
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
WHERE status = @sStatus
```

The SQL body references `:PARAMETERS` values as `@name` placeholders (not the `?name?` style used for SQL embedded in SSL strings). Write `@name` regardless of database platform — the preprocessor adapts placeholders to the backend. A `@name` with no matching `:PARAMETERS` declaration is not substituted and fails when the query executes; a declared parameter never referenced in the body is harmless.

The SQL body uses SQL comment syntax — `--` to end of line and `/* ... */` terminated by `*/` — not the SSL comment form. Semicolons inside SQL comments and quoted SQL literals are plain content. Comments may appear anywhere, including a banner before the directives. The SQL body must follow the `:PARAMETERS` block when one is present; SQL text placed before `:PARAMETERS` is discarded during preprocessing.

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

/* Call with parameter overrides, in :PARAMETERS order;
oResult := RunDS("Category.DataSourceName", {"P", 25});

/* Return as SSLDataset;
oDs := RunDS("Category.DataSourceName",, "ssldataset");
```

Parameter values bind by **position**, in the order the data source declares them in `:PARAMETERS`; names are not matched. Trailing values left out take their inline defaults, and extra values are ignored. Passing `{name, value}` pairs does not work: each pair is bound whole to one parameter.

The return-type argument (`"ssldataset"`, `"xml"`, and so on) converts only an `SSLDataset` result. A STARLIMS-mode data source whose body returns an array (for example from `SQLExecute`) returns that array whatever return type the caller asks for; return an `SSLDataset` (for example from `GetSSLDataset`) when callers need the other return types.

Use `GetDSParameters(sDsName)` to get a data source's parameter names in declaration order, which is the order `RunDS` binds them.

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
* Loop counters: `i`, `j`, `k`, `x`, `y`, `z` (single letters allowed) — only when declared, and prefer a script-specific name such as `nSampleIdx` in a script that calls other scripts, because an undeclared counter can collide with a caller's variable
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
    oLogger := CreateUdObject("Sales.OrderLogger");

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
        oLogger:lastError := GetLastSSLError();
    :ENDTRY;

    :RETURN nTotal;
:ENDPROC;
```

### 3. Complete Error Handling Pattern

```ssl
:DECLARE aRows, sComplexQuery, oErr, sErrMsg;
sComplexQuery := "SELECT * FROM Sample";

/* Structured exception handling;
:TRY;
    aRows := SQLExecute(sComplexQuery);
    :IF Len(aRows) == 0;
        RaiseError("No data found for query");
    :ENDIF;
:CATCH;
    oErr := GetLastSSLError();
    sErrMsg := "Error: " + oErr:Description + ". Operation: " + oErr:Operation;
    ErrorMes(sErrMsg);
    ClearLastSSLError();
    :RETURN .F.;
:FINALLY;
    /* Runs on success and on failure;
    UsrMes("Sample query finished");
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
sReplaced := StrTran(sInput, "Hello", "Hi");  /* Replace exact-case text;
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
| **Object Creation** | `oObj := new MyClass();` | `oObj := BuiltInClass{};` or `oObj := CreateUdObject("Category.UserClass", {args});` |
| **Object Property** | `oObj.Property` | `oObj:Property` |
| **DS Parameters** | `:PARAMETERS p1; :DEFAULT p1, "val";` (in data source) | `:PARAMETERS p1 := "val";` (in data source) |
| **DS Parameters** | `:PARAMETERS;` (empty, in data source) | `:PARAMETERS p1 := "default";`, or leave the line out when the data source takes no parameters |

---

## 8. Edge Cases & Gotchas

1.  **Implicit Concatenation Error:** Do not try to put `:DEFAULT` on a `:DECLARE` line. They are separate steps.
2.  **The "DoProc" Rule:** The most common error for agents is calling `MyFunc()` directly. Use `DoProc` or `ExecFunction` for script procedures, but inside `:CLASS` methods use `Me:Method()` / `Base:Method()` — an unqualified `DoProc("ProcName", ...)` is rejected inside class methods (fully qualified `DoProc("Category.Script.Proc", ...)` calls remain valid).
3.  **Case Sensitivity Inversion:** Unlike many languages where keywords are lower (`if`) and vars are sensitive, SSL is the opposite: Keywords are strict (`:IF`), identifiers are loose (`sVar` == `SVAR`).
4.  **Semicolons:** Almost every line (including comments) must end with `;`.
5.  **1-Based Arrays:** SSL arrays are 1-based, not 0-based. First element is `aArray[1]`.
6.  **Logical Operators Must Have Periods:** Use `.AND.`, `.OR.`, `.NOT.` - not `AND`, `OR`, `NOT`.
7.  **:EXITCASE controls multi-match behavior:** `:BEGINCASE` is not a value-matching switch. Each `:CASE` evaluates its own boolean expression. Without `:EXITCASE;`, later `:CASE` expressions are still evaluated and additional matching bodies may execute. `:OTHERWISE` is still skipped once any earlier `:CASE` body has run, even if that earlier case omitted `:EXITCASE;`. Always end each `:CASE`/`:OTHERWISE` with `:EXITCASE;` unless multi-match behavior is intentional.
8.  **Error Handling:** Use `:TRY`/`:CATCH`/`:FINALLY` for structured error handling.
9.  **Object Property Access:** Use colon-chained access (`oObj:Property`, `oObj:Method():Value`), not dot-chained access (`oObj.Property`).
10. **Function Name Casing:** Represent functions in PascalCase where applicable (`CreateUdObject`, `SQLExecute`, `AEval`, `AScan`), while preserving canonical exceptions such as `_AND`, `_OR`, `_XOR`, `_NOT`, `DOW`, `DOY`, and `LIMSDate`.
11. **Object Property Assignment:** Object property assignments (e.g., `oLogger:lastError := value;`) are NOT variable declarations - don't flag as undeclared.
12. **SQL Parameter Case Insensitivity:** SQL parameter names in `?varName?` placeholders are case-insensitive - `?sID?` and `?SID?` reference the same variable.
13. **Multi-line Function Calls:** Function calls and array literals can span multiple lines - proper indentation should be preserved.
14. **Procedure References:** Procedure names should only be matched in execution contexts (`DoProc`, `ExecFunction`), not in comments, strings, or unrelated identifiers.
15. **Comment Toggle:** SSL uses `/* ... ;` comment syntax. Toggling comments should add/remove this pattern, not `//` style comments.
16. **:STEP Keyword Spacing:** The `:STEP` keyword in FOR loops should have a space before it: `:FOR i := 1 :TO 10 :STEP 2;` not `:FOR i := 1 :TO 10:STEP 2;`
17. **:ENDFOR Is Not Valid:** Although `:ENDFOR` is a reserved word, it is **not a usable keyword**. FOR loops must be terminated with `:NEXT`, not `:ENDFOR` — using `:ENDFOR` is rejected as a syntax error.
18. **String Equality:** The `=` operator for strings returns `.T.` if right operand is empty OR left starts with right. Use `==` when you need an exact string match. **`!=` asymmetry:** `!=` negates `==` (exact match), not `=` (prefix match), so `=` and `!=` are **not logical opposites** for strings — e.g., `"Logged" = "Log"` is `.T.` AND `"Logged" != "Log"` is also `.T.`. The `<>` and `#` operators behave identically to `!=` but `!=` is preferred.
19. **Default Variable Value:** All declared variables start as empty string `""`, not `NIL`.
20. **SQLExecute Exclusivity:** Only `SQLExecute` supports `?varName?` syntax. Other database functions such as `RunSQL`, `LSearch`, `LSelect`, `LSelect1`, `LSelectC`, and `GetDataSet` require positional `?` with value arrays; `GetSSLDataset` uses `@name` with name and value arrays.
21. **Complex Expression Warning:** Using expressions like `?sPrefix + sSuffix?` in SQLExecute triggers a performance warning. Pre-compute values instead.
22. **:REGION vs `/* region`:** `:REGION`/`:ENDREGION` is a legacy functional construct that captures body text for later retrieval via `GetRegion()`. For IDE folding and procedure grouping, prefer `/* region` / `/* endregion` comments.
23. **Data source files use different parameter syntax.** In data source files, `:PARAMETERS` uses inline `:=` defaults (`:PARAMETERS p1 := val;`) — not separate `:DEFAULT` statements. Every parameter must have an inline default. See §4A.
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
- `:ERROR` - Legacy error handler; the last section of a procedure, protecting the statements before it. The handler body requires at least one statement.
- `:RESUME` - Last statement of an `:ERROR` handler; execution continues at the statement after the one that failed.

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
- `**` - Exponentiation (exact alias for `^`; identical behavior)
- `%` - Modulo

**Unary Operators (2):**
- `++` - Increment: adds 1 to a number or one day to a date; works on a variable, an array element or an object property
- `--` - Decrement: subtracts 1 from a number or one day from a date; works on a variable, an array element or an object property

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
- Code Block - Lambda literal with syntax `{` `|param1, param2|` `expression` `}` — creates a code block value; at least one bound variable is required and the body is a single expression, not multiple statements

---

## 10. Built-in Function Reference

> Parameter prefixes: `s` = string, `n` = number, `b` = boolean, `d` = date, `a` = array, `o` = object, `v` = any/variant, `fn` = code block. Square brackets mark an optional parameter (`[nCount]`); omit trailing optional arguments instead of passing `NIL` fillers.
> Calling-form note: canonical SSL call forms are `DoProc("ProcName", {args})`, `ExecFunction("Category.Script", {args})` / `ExecFunction("Category.Script.Proc", {args})`, `CreateUdObject()`, `CreateUdObject("Category.ClassName", {args})`, and `CreateUdObject({{"Prop", value}, ...})`.

### Core Functions (Most Used)

| Function | Signature |
|---|---|
| `SQLExecute` | `SQLExecute(sCommandString, [sConnectionName], [bRollbackExistingTransaction], [bNullAsBlank], [aInvariantDateCols], [vReturnType], [sTableName], [bIncludeSchema], [bIncludeHeader])` |
| `Empty` | `Empty(vValue)` |
| `DoProc` | `DoProc(sProcedureName, [aArguments])` |
| `Len` | `Len(vSource)` |
| `LimsString` | `LimsString([vSource])` |
| `ExecFunction` | `ExecFunction(sName, [aParameters])` |
| `ExecUdf` | `ExecUdf(sCode, [aArgs], [bCacheCode])` |
| `ExecInternal` | `ExecInternal(oTarget, sMethodName, [vArg01], [vArg02], [vArg03], [vArg04], [vArg05], [vArg06], [vArg07], [vArg08], [vArg09], [vArg10], [vArg11], [vArg12], [vArg13], [vArg14], [vArg15], [vArg16], [vArg17], [vArg18], [vArg19], [vArg20], [vArg21])` |
| `Eval` | `Eval(fnCode, [vArg1], [vArg2], ...)` |
| `Branch` | `Branch(vTarget)` |
| `UsrMes` | `UsrMes(vCaption, [vMessage])` |
| `ErrorMes` | `ErrorMes(vCaption, [vMessage])` |
| `InfoMes` | `InfoMes(vCaption, [vMessage])` |
| `IIf` | `IIf(bCondition, vTrueValue, vFalseValue)` |
| `CreateUdObject` | `CreateUdObject()` / `CreateUdObject(aPropertyDefs)` / `CreateUdObject(sClassName, [aArgs])` |
| `RaiseError` | `RaiseError(sMessage, [sLocation], [nErrorCode], [oInnerException])` |
| `PrmCount` | `PrmCount()` |

`PrmCount()` works only in a script's top-level code. Inside a `:PROCEDURE` (including one reached with `DoProc`) and in `ExecUdf` code it raises an error; there, give optional parameters `:DEFAULT` values instead.

`UsrMes`, `ErrorMes`, and `InfoMes` all write to the server log with identical formatting: `user / date / time / version / location / process / caption\nmessage`. The only functional difference is that `ErrorMes` writes even when user-message logging is turned off. `UsrMes` and `InfoMes` are suppressed when disabled. `InfoMes` delegates directly to `UsrMes` (identical behavior). Use `ErrorMes` for messages that must always be recorded; use `UsrMes`/`InfoMes` for messages that administrators may suppress. The first argument is the caption and the optional second argument is the message, for example `UsrMes("ImportOrders", "Loaded " + LimsString(nCount) + " rows")`. Each argument is logged through its string form, so build the text you want recorded rather than passing arrays or objects, whose string form is rarely readable.

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
| `SubStr` | `SubStr(sSource, [nStartPos], [nLength])` |
| `At` | `At(sSubString, sSource)` |
| `LimsAt` | `LimsAt(sSubString, sSource, [nOffset])` |
| `Rat` | `Rat(sSubString, sSource)` |
| `StrSrch` | `StrSrch(sSubString, sSource, [nIndexOrOccurrence], [bFlag])` |
| `StrTran` | `StrTran(sSource, sSearchFor, [sReplaceWith])` |
| `Replace` | `Replace(sSource, sSearchFor, sReplaceWith)` |
| `Replicate` | `Replicate(sSource, nCount)` |
| `Chr` | `Chr([nAsciiCode])` |
| `Asc` | `Asc(sSource)` |
| `Str` | `Str(nNumber, [nLength], [nDecimals])` |
| `LStr` | `LStr(vNumber)` |
| `StrZero` | `StrZero(nNumber, [nLength], [nDecimals])` |
| `Val` | `Val(sNumber)` |
| `LFromHex` | `LFromHex(sSource)` |
| `LToHex` | `LToHex(vSource)` |
| `LHex2Dec` | `LHex2Dec(sSource)` |
| `LTransform` | `LTransform(vExpression, sPicture)` |
| `LCase` | `LCase(bCondition, sTrueValue, [sFalseValue])` |
| `AddColDelimiters` | `AddColDelimiters(sDSN, aCols, sTable)` |
| `AddNameDelimiters` | `AddNameDelimiters(sDSN, sName)` |

### Array Functions

| Function | Signature |
|---|---|
| `AAdd` | `AAdd(aTarget, vElement)` |
| `ALen` | `ALen(aTarget)` |
| `AEval` | `AEval(aTarget, fnBlock, [nStart], [nCount])` |
| `AEvalA` | `AEvalA(aTarget, fnBlock, [nStart], [nCount])` |
| `AFill` | `AFill(aTarget, vValue, [nStart], [nCount])` |
| `AScan` | `AScan(aTarget, vValueOrBlock, [nStart], [nCount])` |
| `AScanExact` | `AScanExact(aTarget, vValueOrBlock, [nStart], [nCount])` |
| `ArrayCalc` | `ArrayCalc(aTarget, [sOperation], [vValue], [nStart], [nCount])` |
| `ArrayNew` | `ArrayNew([nDim1], [nDim2], [nDim3])` |
| `ArrayToTVP` | `ArrayToTVP(aValues, [sDataType], [sConnectionName])` |
| `BuildArray` | `BuildArray(sText, [bCrlfOk], [sDelimiter], [bUnique], [bTrimSpaces])` |
| `BuildArray2` | `BuildArray2(sText, [sLineDelimiter], [sColDelimiter], [bCrlfOk], [bTrimSpaces])` |
| `BuildString` | `BuildString(aTarget, [nStart], [nCount], [sDelimiter])` |
| `BuildString2` | `BuildString2(aTarget, [sLineDelimiter], [sColDelimiter])` |
| `BuildStringForIn` | `BuildStringForIn(aTarget)` |
| `CompArray` | `CompArray(a1, a2)` |
| `DelArray` | `DelArray(aTarget, nIndex)` |
| `ExtractCol` | `ExtractCol(aTarget, nColumn)` |
| `PrepareArrayForIn` | `PrepareArrayForIn(aTarget, sItemType)` |
| `SortArray` | `SortArray(aTarget, [vNumeric])` |

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
| `JDay` | `JDay([dDate])` |
| `CMonth` | `CMonth(dDate)` |
| `NoOfDays` | `NoOfDays(dDate)` |
| `DateAdd` | `DateAdd(dDate, nNumber, [sDatepart])` |
| `DateDiff` | `DateDiff(dStartDate, dEndDate, [sDatepart])` |
| `DateDiffEx` | `DateDiffEx(dStartDate, dEndDate)` |
| `DateFormat` | `DateFormat(sNewFormat)` |
| `DateFromNumbers` | `DateFromNumbers([nYear], [nMonth], [nDay], [nHour], [nMinute], [nSecond], [nMillisecond], [bMakeInvariant])` |
| `DateFromString` | `DateFromString(sDateAsString, [vFormat], [bUseLocalCulture], [bMakeInvariant])` |
| `DateToString` | `DateToString(dDate, [sFormat])` |
| `StringToDate` | `StringToDate(sDateString, sDateFormat)` |
| `CToD` | `CToD(sDateString)` |
| `DToC` | `DToC(dDate)` |
| `DToS` | `DToS(dDate)` |
| `LIMSDate` | `LIMSDate(vDate, [sFormat])` |
| `LimsGetDateFormat` | `LimsGetDateFormat()` |
| `ValidateDate` | `ValidateDate(sDateString, [bUseDateFormat])` |
| `IsInvariantDate` | `IsInvariantDate(dDate)` |
| `MakeDateInvariant` | `MakeDateInvariant(vDate, [vColumnsIndex])` |
| `MakeDateLocal` | `MakeDateLocal(vDate, [vColumnsIndex])` |
| `ClientEndOfDay` | `ClientEndOfDay(dDate)` |
| `ClientStartOfDay` | `ClientStartOfDay(dDate)` |
| `ServerEndOfDay` | `ServerEndOfDay(dDate)` |
| `ServerStartOfDay` | `ServerStartOfDay(dDate)` |
| `ServerTimeZone` | `ServerTimeZone()` |
| `UserTimeZone` | `UserTimeZone()` |

### Math & Numeric Functions

| Function | Signature |
|---|---|
| `Abs` | `Abs(nValue)` |
| `_AND` | `_AND(nValue1, nValue2)` |
| `_OR` | `_OR(nValue1, nValue2)` |
| `_XOR` | `_XOR(nValue1, nValue2)` |
| `_NOT` | `_NOT(nOperand)` |
| `Integer` | `Integer(nValue)` |
| `Max` | `Max(vValue1, vValue2)` |
| `Min` | `Min(vValue1, vValue2)` |
| `Round` | `Round(nValue, nDigits, [sMidPointRounding])` |
| `RoundPoint5` | `RoundPoint5(nNumber)` |
| `StdRound` | `StdRound(sStandard, nDigits, nNumber)` |
| `SigFig` | `SigFig(sStandard, nDigits, nValue)` |
| `Sqrt` | `Sqrt(nNumber)` |
| `Rand` | `Rand([nSeed])` |
| `MatFunc` | `MatFunc(sFunctionName, nNumber)` |
| `Scient` | `Scient(nValue)` |
| `ToScientific` | `ToScientific(nNumber, [nDecimalPlaces])` |
| `ToNumeric` | `ToNumeric(sNumber, [bAllowHex])` |
| `IsNumeric` | `IsNumeric(sNumber, [bAllowHex])` |
| `ValidateNumeric` | `ValidateNumeric(sNumber)` |
| `IsHex` | `IsHex(sSource)` |
| `IsGuid` | `IsGuid(sGuid)` |
| `LimsXOr` | `LimsXOr(nVal1, nVal2)` |

### Type & Validation Functions

| Function | Signature |
|---|---|
| `LimsType` | `LimsType(sParam)` |
| `LimsTypeEx` | `LimsTypeEx(vSource)` |
| `IsDefined` | `IsDefined(sVarName)` |
| `Empty` | `Empty(vValue)` |
| `Nothing` | `Nothing(vValue)` |

### Database Functions

| Function | Signature |
|---|---|
| `SQLExecute` | `SQLExecute(sCommandString, [sConnectionName], [bRollbackExistingTransaction], [bNullAsBlank], [aInvariantDateCols], [vReturnType], [sTableName], [bIncludeSchema], [bIncludeHeader])` |
| `RunSQL` | `RunSQL(sCommandString, [sConnectionName], [aValues])` |
| `RunDS` | `RunDS(sDataSourceName, [aParameters], [vReturnType])` |
| `LSearch` | `LSearch(sCommandString, [vDefaultValue], [sConnectionName], [aArrayOfValues])` |
| `LSelect` | `LSelect(sCommandString, [aFieldList], [sConnectionName], [aArrayOfValues], [bNullAsBlank], [aInvariantDateCols])` |
| `LSelect1` | `LSelect1(sCommandString, [sConnectionName], [aArrayOfValues], [bNullAsBlank], [aInvariantDateCols])` |
| `LSelectC` | `LSelectC(sCommandString, [aFieldList], [sConnectionName], [aArrayOfValues], [bNullAsBlank], [aInvariantDateCols])` |
| `GetDataSet` | `GetDataSet(sCommandString, [aValues], [bIncludeSchema], [sTableName], [bNullAsBlank], [aInvariantDateCols])` |
| `GetDataSetEx` | `GetDataSetEx(sCommandString, [sConnectionName], [aValues], [bIncludeSchema], [bIncludeHeader], [sTableName], [bNullAsBlank], [aInvariantDateCols])` |
| `GetDataSetFromArray` | `GetDataSetFromArray(aArrayOfValues, [aArrayFields])` |
| `GetDataSetFromArrayEx` | `GetDataSetFromArrayEx(aArrayOfValues, [aArrayFields], [sTableName], [bIncludeHeader], [bIncludeSchema])` |
| `GetDataSetWithSchemaFromSelect` | `GetDataSetWithSchemaFromSelect(sCommandString, [sConnectionName], [aValues], [aPrimaryKeys], [aUniqueConstraints])` |
| `GetDataSetXMLFromArray` | `GetDataSetXMLFromArray(aArrayOfValues, [aArrayFields], [sTableName], [bIncludeHeader], [bIncludeSchema])` |
| `GetDataSetXMLFromSelect` | `GetDataSetXMLFromSelect(sCommandString, [sConnectionName], [bIncludeHeader], [aValues], [bIncludeSchema], [sTableName], [bNullAsBlank], [aInvariantDateCols])` |
| `GetSSLDataset` | `GetSSLDataset(sSql, [sDsn], [aParamNames], [aParamValues], [sTableName], [bNullAsBlank], [aInvariantDateCols])` |
| `GetNETDataSet` | `GetNETDataSet(sCommandString, [sConnectionName], [aValues], [sTableName], [bReturnXml], [bR1Compatible])` |
| `GetDSParameters` | `GetDSParameters(sDsName)` |
| `BeginLimsTransaction` | `BeginLimsTransaction([sConnectionName], [sIsoLevel])` |
| `EndLimsTransaction` | `EndLimsTransaction([sConnectionName], [bCommit])` |
| `IsInTransaction` | `IsInTransaction([vConnection])` |
| `GetTransactionsCount` | `GetTransactionsCount()` / `GetTransactionsCount(sConnection)` |
| `LimsRecordsAffected` | `LimsRecordsAffected()` |
| `GetLastSQLError` | `GetLastSQLError()` |
| `ReturnLastSQLError` | `ReturnLastSQLError()` |
| `ShowSqlErrors` | `ShowSqlErrors(bEnable)` |
| `IgnoreSqlErrors` | `IgnoreSqlErrors(bEnable)` |
| `DetectSqlInjections` | `DetectSqlInjections(bEnable, [sConnectionName])` |
| `SQLRemoveComments` | `SQLRemoveComments(sStatement)` |
| `SetSqlTimeout` | `SetSqlTimeout([nTimeout], [sConnection])` |
| `LimsSqlConnect` | `LimsSqlConnect(sConnectionName)` |
| `LimsSqlDisconnect` | `LimsSqlDisconnect(sConnectionName)` |
| `IsDBConnected` | `IsDBConnected([sConnectionName])` |
| `GetConnectionByName` | `GetConnectionByName([sConnectionName])` |
| `GetConnectionStrings` | `GetConnectionStrings()` |
| `GetDefaultConnection` | `GetDefaultConnection()` |
| `SetDefaultConnection` | `SetDefaultConnection(sDefaultConnection)` |
| `GetDBMSName` | `GetDBMSName([sConnectionName])` |
| `GetDBMSProviderName` | `GetDBMSProviderName([sConnectionName])` |
| `GetNoLock` | `GetNoLock([sConnectionName])` |
| `GetRdbmsDelimiter` | `GetRdbmsDelimiter([sDSN], bOpen)` |
| `GetTables` | `GetTables([sSql])` |
| `IsTable` | `IsTable(sConnectionName, sTableName)` |
| `IsTableFld` | `IsTableFld(sConnectionName, sTableName, sFieldName)` |
| `TableFldLst` | `TableFldLst([sConnectionName], sTableName)` |
| `LimsSetCounter` | `LimsSetCounter(sTableName, sFieldName, [sPrefix], [aFields], [aValues], [nIncrementWith])` |
| `RetrieveLong` | `RetrieveLong([sConnectionName], sTableName, sColumnName, sWhereCondition, sOutputFilePath, [bIsCompressed])` |
| `UpdLong` | `UpdLong([sConnectionName], sTableName, sColumnName, sWhereCondition, sInputFilePath, [bIsCompressed])` |
| `LimsOleConnect` | `LimsOleConnect(vProgId)` |
| `EndLimsOleConnect` | `EndLimsOleConnect([oConnection])` |
| `LimsExec` | `LimsExec(sApplication, [bShow], [sArguments])` |
| `XmlExportSql` | `XmlExportSql(sSql, sFile, [sDb], [aSqlParams], [sTable])` |

### Object Functions

| Function | Signature |
|---|---|
| `AddProperty` | `AddProperty(oTarget, vPropName)` |
| `HasProperty` | `HasProperty(oTarget, sPropName)` |
| `GetInternal` | `GetInternal(oTarget, sPropName)` |
| `SetInternal` | `SetInternal(oTarget, sPropName, vPropValue)` |
| `GetInternalC` | `GetInternalC(oTarget, sCollectionName, vArg1, [vArg2], [vArg3], [vArg4], [vArg5], [vArg6])` |
| `SetInternalC` | `SetInternalC(oTarget, sCollectionName, vValue, vArg1, [vArg2], [vArg3], [vArg4], [vArg5], [vArg6])` |
| `GetByName` | `GetByName(sName)` |
| `SetByName` | `SetByName(sName, vValue)` |
| `CreateLocal` | `CreateLocal(sVarName, [vVarValue])` |
| `CreatePublic` | `CreatePublic(sVarName, [vVarValue])` |
| `CreateORMSession` | `CreateORMSession()` |
| `LKill` | `LKill(sVarName)` |
| `MakeNETObject` | `MakeNETObject(vValue)` |

### Error Handling Functions

| Function | Signature |
|---|---|
| `GetLastSSLError` | `GetLastSSLError()` |
| `ClearLastSSLError` | `ClearLastSSLError()` |
| `FormatErrorMessage` | `FormatErrorMessage(vError)` |
| `FormatSqlErrorMessage` | `FormatSqlErrorMessage(vError)` |

### File & Directory Functions

| Function | Signature |
|---|---|
| `ReadText` | `ReadText(sFileName, [nCharsToRead], [sEncoding])` |
| `WriteText` | `WriteText(sFileName, sCharsToWrite, [vConfirmRequired], [sAppend], [sEncoding])` |
| `ReadBytesBase64` | `ReadBytesBase64(sFileName)` |
| `WriteBytesBase64` | `WriteBytesBase64(sFileName, sBase64Data)` |
| `Directory` | `Directory(sFilePattern, [sAttributes])` |
| `LDir` | `LDir(sFilePattern, [sAttributes])` |
| `FileSupport` | `FileSupport(vFileIdentifier, sRequest, [vArg1], [sArg2], [sEncoding])` |
| `CombineFiles` | `CombineFiles(aFileNames, sOutFile)` |
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
| `CheckOnFtp` | `CheckOnFtp(sServerNameOrIP, [sRemoteDirectory], sRemoteFileName, sUserName, sPassword, [nPort], [sProxy], [bIsSFTP], [sPrivateKeyFilePath])` |
| `CopyToFtp` | `CopyToFtp(sServerNameOrIP, sRemoteDirectory, aRemoteFileNames, [sFileContents], sUserName, sPassword, [nPort], [sProxy], [bIsSFTP], [sPrivateKeyFilePath])` |
| `DeleteDirOnFtp` | `DeleteDirOnFtp(sServerNameOrIP, sRemoteDirectory, [sUserName], [sPassword], [nPort], [sProxy], [bIsSFTP], [sPrivateKeyFilePath])` |
| `DeleteFromFtp` | `DeleteFromFtp(sServerNameOrIP, [sRemoteDirectory], sRemoteFileName, sUserName, sPassword, [nPort], [sProxy], [bIsSFTP], [sPrivateKeyFilePath])` |
| `GetDirFromFtp` | `GetDirFromFtp(sServerNameOrIP, [sRemoteDirectory], [sFilePattern], [sUserName], [sPassword], [nPort], [sProxy], [bUsePassive], [bIsSFTP], [sPrivateKeyFilePath])` |
| `GetFromFtp` | `GetFromFtp(sServerNameOrIP, [sRemoteDirectory], sRemoteFileName, [sLocalFileName], [sUserName], [sPassword], [nPort], [sProxy], [bIsSFTP], [sPrivateKeyFilePath])` |
| `MakeDirOnFtp` | `MakeDirOnFtp(sServerNameOrIP, sRemoteDirectory, [sUserName], [sPassword], [nPort], [sProxy], [bIsSFTP], [sPrivateKeyFilePath])` |
| `MoveInFtp` | `MoveInFtp(sServerNameOrIP, [sRemoteDirectoryFrom], [sRemoteDirectoryTo], sRemoteFileFrom, [sRemoteFileTo], [sUserName], [sPassword], [nPort], [sProxy], [bIsSFTP], [sPrivateKeyFilePath])` |
| `ReadFromFtp` | `ReadFromFtp(sServerNameOrIP, [sRemoteDirectory], sRemoteFileName, [nMaxSize], [sUserName], [sPassword], [nPort], [sProxy], [bIsSFTP], [sPrivateKeyFilePath])` |
| `RenameOnFtp` | `RenameOnFtp(sServerNameOrIP, [sRemoteDirectory], sFileNameOld, sFileNameNew, [sUserName], [sPassword], [nPort], [sProxy], [bIsSFTP], [sPrivateKeyFilePath])` |
| `SendToFtp` | `SendToFtp(sServerNameOrIP, sRemoteDirectory, [sRemoteFileName], sLocalFileName, sUserName, sPassword, [nPort], [sProxy], [bUsePassive], [bIsSFTP], [sPrivateKeyFilePath])` |
| `WriteToFtp` | `WriteToFtp(sServerNameOrIP, sRemoteDirectory, sRemoteFileName, sFileContents, sUserName, sPassword, [nPort], [sProxy], [bIsSFTP], [sPrivateKeyFilePath])` |

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
| `SetUserData` | `SetUserData(sUserName)` |
| `GetInlineCode` | `GetInlineCode(sValue, [aVariables])` |
| `DeleteInlineCode` | `DeleteInlineCode(sName)` |
| `GetRegion` | `GetRegion(sRegionName, [aSourceValues], [aDestinationValues])` |
| `GetRegionEx` | `GetRegionEx(sRegionName, [aSourceValues], [aDestinationValues], [oLocalRegions])` |
| `IsProductionModeOn` | `IsProductionModeOn()` |

`GetRegionEx` looks up a named region exactly like `GetRegion`, but first checks the caller-supplied local region map `oLocalRegions` when one is passed. Region names match case-insensitively. When both `aSourceValues` and `aDestinationValues` are supplied (parallel arrays of equal length), each replacement pair is applied in order to the retrieved text. A name found in neither the local map nor the current region scope raises an error, so guard the call with `:TRY` when the region may be missing. Prefer `GetRegion` unless you need local overrides.

### Security & Authentication Functions

| Function | Signature |
|---|---|
| `EncryptData` | `EncryptData(sInputData, sPassword, [sAlgorithm], [sKey], [sRetType])` |
| `DecryptData` | `DecryptData(sInputData, sPassword)` |
| `HashData` | `HashData(sInputData, [sAlgorithm])` |
| `VerifySignature` | `VerifySignature(sCertificateString, sData, sSignature)` |
| `MimeEncode` | `MimeEncode(sValue)` |
| `MimeDecode` | `MimeDecode(sValue)` |
| `ChkPassword` | `ChkPassword([sUserName], [sPassword])` |
| `ChkNewPassword` | `ChkNewPassword(sPassword, vPrevPasswords)` |
| `SetUserPassword` | `SetUserPassword(sUserName, sPassword)` |
| `LDAPAuth` | `LDAPAuth(sLdapHost, [nLdapPort], sLdapUserName, sLdapPassword, [sLdapDistinctiveName], [bSecure])` |
| `LDAPAuthEX` | `LDAPAuthEX(sLdapHost, [nLdapPort], sBindUserName, sBindUserPassword, [sSearchUserName], sSearchUserPassword, [sLdapDistinguishedName], sLdapDistinguishedNameStartSearch, [sSearchFilter], [sAuthAttribName], [bSecure])` |
| `SearchLDAPUser` | `SearchLDAPUser(sLdapHost, [nLdapPort], sBindUserName, [sBindUserPassword], [sSearchUserName], sLdapDistinguishedNameStartSearch, [sSearchFilter], [bSecure])` |

### Web, XML & JSON Functions

| Function | Signature |
|---|---|
| `ToXml` | `ToXml(vValue)` / `ToXml(vValue, sTypeName)` |
| `FromXml` | `FromXml(sXml)` |
| `ToJson` | `ToJson(vValue)` |
| `FromJson` | `FromJson(vValue)` |
| `HtmlEncode` | `HtmlEncode(sData)` |
| `HtmlDecode` | `HtmlDecode(sData)` |
| `UrlEncode` | `UrlEncode(sData)` |
| `UrlDecode` | `UrlDecode(sData)` |
| `XmlDomToUdObject` | `XmlDomToUdObject(sXml, [bPreserveWhitespace])` |

### Platform Integration Functions

| Function | Signature |
|---|---|
| `LimsNETConnect` | `LimsNETConnect([sAssembly], [sTypeName], [aArgs], [bAsStatic])` |
| `LimsNETCast` | `LimsNETCast(vVal, sNewType)` |
| `LimsNETTypeOf` | `LimsNETTypeOf(sTypeName)` |

### Email & Messaging Functions

| Function | Signature |
|---|---|
| `SendLimsEmail` | `SendLimsEmail(sSMTP, aRecipients, sFromWho, sSubject, [sMessageBody], [aAttachList], [aCCList], [aBCCList], [sReplyTo], [nPort], [sUName], [sUPass], [bIgnoreErrors], [bUseCDO], [nTimeout], [bUseSSL], [bIsBodyHTML], [sEncryptedData])` |
| `SendToOutbox` | `SendToOutbox(sSMTP, aRecipients, sFromWho, [sSubject], [sMessageBody], [aAttachList], [aCCList], [aBCCList], [sReplyTo], [nPort], [sUName], [sUPass], [bIgnoreErrors], [bUseSSL], [bIsBodyHTML], [sEncryptedData])` |
| `SendFromOutbox` | `SendFromOutbox([bIgnoreErrors], [bUseCDO], [nTimeout])` |
| `SendOutlookReminder` | `SendOutlookReminder(sSMTP, dStart, dEnd, sSubject, sSummary, sLocation, sOrganizerName, sOrganizerEmail, sAttendeeName, sAttendeeEmail, [nPort], [sUName], [sUPass], bIgnoreErrors, [bUseSSL])` |

### Compression & Zip Functions

| Function | Signature |
|---|---|
| `Compress` | `Compress(sSource, [bToFile])` |
| `Decompress` | `Decompress(sSource, [bFromFile])` |
| `CreateZip` | `CreateZip(sZipFileName, sSourceDirectory, [bRecurse], [sFileFilter], [sPassword])` |
| `ExtractZip` | `ExtractZip(sZipFileName, sTargetDirectory, [sFileFilter], [sPassword])` |

### Batch & System Functions

| Function | Signature |
|---|---|
| `SubmitToBatch` | `SubmitToBatch(sCode, [vParameters], [sMode], [sUserName], [sPassword])` |
| `SubmitToBatchEx` | `SubmitToBatchEx(sCode)` |
| `InBatchProcess` | `InBatchProcess()` |
| `DosSupport` | `DosSupport(sCmd, [sPrm], [vDbg])` |
| `RunApp` | `RunApp(sApplication, [sArguments])` |
| `LWait` | `LWait([nSeconds])` |
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
| `DocCreateCabinet` | `DocCreateCabinet(sCabinetName, [sCabinetType], [sAcl])` |
| `DocDeleteCabinet` | `DocDeleteCabinet(sCabinetId, [bDeepDelete])` |
| `DocGetCabinets` | `DocGetCabinets()` |
| `DocCreateFolder` | `DocCreateFolder(sParentPath, sFolderName, [sAcl])` |
| `DocDeleteFolder` | `DocDeleteFolder(sFolderId, [bDeepDelete])` |
| `DocGetFolders` | `DocGetFolders(sParentPath)` |
| `DocImportDocument` | `DocImportDocument(sDocFile, sDestinationPath, [sDocName], [sDocType], [sAppCode], [sAclName])` |
| `DocExportDocument` | `DocExportDocument(sDocumentId, [sFormat])` |
| `DocGetDocuments` | `DocGetDocuments(sFolderPath, [sDocTypes])` |
| `DocExists` | `DocExists(sObjId)` |
| `DocDelete` | `DocDelete(sObjId, [bAllVersions])` |
| `DocCheckinDocument` | `DocCheckinDocument(sFilePath, sDocumentId, [sVersion], [bReplaceContent], [bMajorVersion])` |
| `DocCheckoutDocument` | `DocCheckoutDocument(sDocumentId)` |
| `DocCancelCheckout` | `DocCancelCheckout(sDocumentId)` |
| `DocGetMetadata` | `DocGetMetadata(sObjId, [sAttributes])` |
| `DocSetMetadata` | `DocSetMetadata(sObjId, aAttributes)` |
| `DocGetTypeAttributes` | `DocGetTypeAttributes(sTypeName)` |
| `DocGetTypeAttributesAsDataset` | `DocGetTypeAttributesAsDataset(sTypeName)` |
| `DocCreateACL` | `DocCreateACL(sAclName, [sDescription], [aGroups])` |
| `DocCreateUser` | `DocCreateUser(sLoginName, sPassword, [sUserName], [sEmail], [sDefaultFolder], [sGroupName], [sPermissionSet], [nUserPrivileges])` |
| `DocUpdateUser` | `DocUpdateUser(sLoginName, sPassword, [sUserName], [sEMail], [sDefaultFolder], [sGroupName], [sPermissionSet], [nUserPrivileges])` |
| `DocDeleteUser` | `DocDeleteUser(sLoginName)` |
| `DocExistsUser` | `DocExistsUser(sLoginName, sUserName)` |
| `DocCreateGroup` | `DocCreateGroup(sGroupName, [sDescription])` |
| `DocAddUsersToGroup` | `DocAddUsersToGroup(sGroupName, aUsers)` |
| `DocRemoveUsersFromGroup` | `DocRemoveUsersFromGroup(sGroupName, aUsers)` |
| `DocRemoveAllUsersFromGroup` | `DocRemoveAllUsersFromGroup(sGroupName)` |
| `DocStartWorkflow` | `DocStartWorkflow(sWorkflowId, [aDocumentIds], [sPackageName])` |
| `DocStopWorkflow` | `DocStopWorkflow(sWorkflowId)` |
| `DocPauseWorkflow` | `DocPauseWorkflow(sWorkflowId)` |
| `DocResumeWorkflow` | `DocResumeWorkflow(sWorkflowId)` |
| `DocGetWorkflowStatus` | `DocGetWorkflowStatus(sWorkflowId)` |
| `DocGetTasks` | `DocGetTasks(sWorkflowId)` |
| `DocGetTasksCount` | `DocGetTasksCount()` |
| `DocAcquireWorkitem` | `DocAcquireWorkitem(sWorkitemId)` |
| `DocCompleteWorkitem` | `DocCompleteWorkitem(sWorkitemId, [sSignOffUser], [sSignOffPass], [sSignOffReason])` |
| `DocDelegateWorkitem` | `DocDelegateWorkitem(sWorkitemId, sTargetUser)` |
| `DocRepeatWorkitem` | `DocRepeatWorkitem(sWorkitemId, aUsers, [sSignOffUser], [sSignOffPass], [sSignOffReason])` |
| `DocGetWorkitemProperties` | `DocGetWorkitemProperties(sWorkitemId)` |
| `DocSearchFullText` | `DocSearchFullText(sTextToSearch, [sStartLocation], [nResultSetSize])` |
| `DocSearchAsDataset` | `DocSearchAsDataset([sContains], [sStartLocation], [sObjectType], [sWhere], [bAllVersions], [nResultSetSize])` |
| `DocSearchUsingDql` | `DocSearchUsingDql(sDql, [nResultSetSize])` |

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
| `SSLBaseDictionary` | No direct constructor — use `SSLStringDictionary{}` or `SSLIntDictionary{}` | Base dictionary class |
| `SSLCodeProvider` | `SSLCodeProvider{}` | Code compilation utility |
| `SSLDataset` | `SSLDataset{}` / `SSLDataset{vData, vNullAsBlank}` | Dataset wrapper |
| `SSLError` | Returned by `GetLastSSLError()` | Exception object (`:Message`, `:Description`, `:Code`, `:GenCode`, `:Operation`, `:FullDescription`, `:FullDescriptionEx`, `:InnerException`, `:NETException`) |
| `SSLExpando` | `CreateUdObject()` (`SSLExpando{}` does not compile) | Dynamic object |
| `SSLIntDictionary` | `SSLIntDictionary{}` / `SSLIntDictionary{nLength}` | Numeric-keyed dictionary |
| `SSLRegex` | `SSLRegex{sPattern}` / `SSLRegex{sPattern, bCaseSensitive}` | Regular expressions |
| `SSLStringDictionary` | `SSLStringDictionary{}` / `SSLStringDictionary{bCaseSensitive, nLength}` | String-keyed dictionary |
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
bMatch := oRegex:IsMatch(sInput, [nStartAt]);  → Boolean   /* nStartAt is 1-based;
```

### SSLStringDictionary

String-keyed dictionary with optional case sensitivity.

```ssl
/* Constructors;
oDict := SSLStringDictionary{};
oDict := SSLStringDictionary{bCaseSensitive, nLength};

/* Properties (read-only);
oDict:Count  → Number
oDict:Keys   → Array
oDict:Values → Array

/* Methods;
oDict:Clear()                       → Boolean
oDict:AddValue(sKey, vValue)        → Boolean
oDict:GetValue(sKey, [vDefault])  → Any
oDict:Contains(sKey)              → Boolean
oDict:Remove(sKey)                → Boolean
oDict:TryGetValue(sKey)           → Object   /* {Exists, Value};
```

### SSLIntDictionary

Numeric-keyed dictionary.

```ssl
/* Constructors;
oDict := SSLIntDictionary{};
oDict := SSLIntDictionary{nLength};

/* Properties (read-only);
oDict:Count  → Number
oDict:Keys   → Array
oDict:Values → Array

/* Methods;
oDict:Clear()                       → Boolean
oDict:AddValue(nKey, vValue)        → Boolean
oDict:GetValue(nKey, [vDefault])  → Any
oDict:Contains(nKey)              → Boolean
oDict:Remove(nKey)                → Boolean
oDict:TryGetValue(nKey)           → Object   /* {Exists, Value};
```

### SSLBaseDictionary

Base dictionary class (parent of SSLStringDictionary and SSLIntDictionary). It has no direct constructor: create an `SSLStringDictionary{}` or `SSLIntDictionary{}` and use these shared members on it.

```ssl
/* No direct constructor - create a concrete dictionary;
oDict := SSLStringDictionary{};

/* Properties;
oDict:Keys   → Array
oDict:Values → Array
oDict:Count  → Number (read-only)

/* Methods;
oDict:AddValue(vKey, vValue)      → Boolean
oDict:Clear()                     → Boolean
oDict:Contains(vKey)              → Boolean
oDict:GetValue(vKey, [vDefault])  → Any
oDict:InvokeMethod(sMethodName, aArgs) → Any   /* Invoke() raises, so call by name with InvokeMethod;
oDict:Remove(vKey)                → Boolean
oDict:TryGetValue(vKey)           → Object
```

`Invoke` raises in every form; call the method directly, or use `InvokeMethod(sMethodName, aArgs)` when the method name is only known at run time.

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

Compiles published server scripts and data sources and returns the compilation errors found. Every compile method returns an errors object; inspect it before treating a compile as clean. Single-item methods take a GUID or a full `category.name`; the category methods take category **GUIDs**, not category names.

```ssl
/* Constructor;
oProvider := SSLCodeProvider{};

/* Methods (each returns an errors object);
oProvider:CompileAll()
oProvider:CompileAllServerScripts()
oProvider:CompileAllDataSources()
oProvider:CompileServerScript(sScriptId)
oProvider:CompileServerScripts(aScriptsIds)
oProvider:CompileDataSource(sScriptId)
oProvider:CompileDataSources(aScriptsIds)
oProvider:CompileServerScriptCategory(sCategoryId)
oProvider:CompileServerScriptCategories(aCategoriesIds)
oProvider:CompileDataSourceCategory(sCategoryId)
oProvider:CompileDataSourceCategories(aCategoriesIds)
```

`CompileScript(sCode)` exists but raises `The method or operation is not implemented.` for any non-null input, so it cannot validate ad hoc code text.

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

- **`BatchSupport`** — Properties (read-only): `ActiveBatchesNumber`, `PhysicalMemory`, `VirtualMemory`. Methods: `Dispose()`, `IsRunning(vBatchId)` → Boolean
- **`EnterpriseExporter`** — Properties: `AbortOnError`, `LogFile`, `ErrorMsg`, `IsEnterpriseOnly` (write-only), `FromSQL` (write-only), `NullAsBlank` (write-only), `InvariantDateColumns` (write-only). Method: `DoExport()` → Boolean
- **`HtmlConverter`** — Properties: `OptionsXml` (write-only), `SimplifiedLog` (read-only), `Log` (read-only). Methods: `ClearLog()`, `Convert(sXml, sXfdGuid, sHtmlGuid)` → String
- **`PatcherSupport`** — Properties: `LogFilePath`, `ResultTable` (read-only), `InternalErrors` (read-only), `DiffDataTable` (read-only). Methods: `Compare(oDestinationDataTable)`, `ConnectToExternalSystem(sUrl, sUser, sPassword)`, `GetDataFromWholeDictionary()`, `GetAllFormsFromDictionary_Test()`
- **`RegSetup`** — Methods: `RegOpenKey(sKey, nAccess)` → Boolean, `RegQueryValue(sSubKey, nType)`, `RegCloseKey()` → Boolean
- **`TablesImport`** — Properties: `NullAsBlank`, `IncludeORIGREC`, `ErrMsg` (read-only). Method: `GetTable(sName)` → `CDataTable` (or `NIL` on failure)
- **`WebServices`** — Methods: `CreateHttpClient()`, `CreateSoapClient()`
