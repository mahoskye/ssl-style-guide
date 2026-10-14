# Language Definition: STARLIMS Scripting Language (SSL v11)

## 0. Agent Quick Start (Read First)

This reference documents the authoritative behavior of the STARLIMS SSL v11 language.
Authoritative rules describe documented language behavior; style recommendations are marked as guidance.

### Authoritative Language Rules

Each item states the rules for one topic, with the facts that explain them.

1. **Case.** <!-- rule: keyword_uppercase -->Colon-prefixed SSL keywords are uppercase and case-sensitive, for example `:IF` and `:BEGINCASE`.<!-- /rule --> **SSL literals/constants** (`NIL`, `.T.`, `.F.`) are case-insensitive. **Class-context forms** (`Me`, `Base`, `Constructor`) are also case-insensitive; `Base` is used in colon-chained member access and `Constructor` is only meaningful as the fixed constructor declaration name inside `:CLASS`. **Identifiers and function names are case-insensitive.**
2. **Semicolons.** <!-- rule: statement_semicolon -->Almost every SSL statement, including comments, must end with a semicolon.<!-- /rule -->
3. **Declarations.** <!-- rule: declare_before_use -->Declare variables before use with `:DECLARE`.<!-- /rule --> SSL does not enforce this (an undeclared name is looked up in caller scopes and publics, and a write to it can change a caller's variable), so declaring every name is the safe default rather than a language rule. <!-- rule: no_default_on_declare_line -->Do not put `:DEFAULT` on a `:DECLARE` line.<!-- /rule -->
4. **Declaration ordering.** <!-- rule: parameters_first -->`:PARAMETERS` must appear before any other statements in a script or procedure body.<!-- /rule --> <!-- rule: default_after_parameters -->`:DEFAULT` must immediately follow `:PARAMETERS`.<!-- /rule --> Zero or more `:DEFAULT` lines may follow, but only after `:PARAMETERS`. `:DECLARE` and `:PUBLIC` are regular statements and can appear anywhere in the statement flow. `:INCLUDE` is resolved as a textual paste before the rest of the file is read, so its position is technically flexible. <!-- rule: include_early -->Place `:INCLUDE` early — it textually includes the referenced source before the script runs.<!-- /rule --> <!-- rule: script_declaration_order -->Recommended script order is `:PARAMETERS`, `:DEFAULT`, `:INCLUDE`, `:PUBLIC`, `:DECLARE`.<!-- /rule --> **Data source files use different syntax** — see §4A.
5. **Calling procedures.** <!-- rule: no_direct_procedure_calls -->Do not call custom script procedures directly as `MyProc()`.<!-- /rule --> <!-- rule: bare_calls_are_builtins -->A bare `Name(...)` call always means a built-in function, in scripts and classes alike; any other name stops the script from compiling with `Invalid built-in function: Name`.<!-- /rule --> <!-- rule: doproc_for_same_file_procedures -->Use `DoProc("ProcName", {args})` for same-file script procedures.<!-- /rule --> <!-- rule: execfunction_for_external_scripts -->Use `ExecFunction("Category.Script", {args})` or `ExecFunction("Category.Script.Proc", {args})` for external script entry points.<!-- /rule --> <!-- rule: doproc_in_class -->Do not call `DoProc` with a bare procedure name inside class methods; it is a compile-time error. Use `Me:Method()` or `Base:Method()`.<!-- /rule --> Fully qualified `DoProc("Category.Script.Proc", ...)` calls to deployed script procedures are allowed inside class methods.
6. **Arrays.** <!-- rule: arrays_one_based -->SSL arrays are 1-based; loop over arrays from 1 through `ALen(aArray)`.<!-- /rule --> The first element is `aArray[1]`.
7. **Object creation.** <!-- rule: builtin_classes_curly_braces -->Instantiate directly creatable built-in classes with curly braces, for example `Email{}`.<!-- /rule --> <!-- rule: no_createudobject_for_builtins -->Do not instantiate built-in classes with `CreateUdObject`.<!-- /rule --> <!-- rule: createudobject_category_qualified -->Use `CreateUdObject("Category.ClassName")` for user-defined classes; a bare class name is looked up only among the default categories.<!-- /rule --> `CreateUdObject("Category.ClassName", {args})` passes constructor arguments, `CreateUdObject()` creates an empty dynamic object, and `CreateUdObject({{"Prop", value}, ...})` creates an anonymous object with named properties.
8. **SQL parameterization.** <!-- rule: named_sql_param_unsupported -->`SQLExecute` is the only database API that supports named `?param?` substitution; do not use `?param?` markers with other database functions. Its markers reference in-scope SSL variables by name. Canonical shape: `SQLExecute("UPDATE T SET COL = ?sValue? WHERE ID = ?nId?");`<!-- /rule --> <!-- rule: sql_positional_placeholders -->`RunSQL`, `LSearch`, `LSelect`, `LSelect1`, `LSelectC`, and `GetDataSet` use positional `?` markers with a value array in a later argument slot: fourth for `LSearch`, `LSelect` and `LSelectC`, second for `GetDataSet`, and third for `RunSQL` and `LSelect1`. Check `ssl_signature` for the slot and skip unused optionals with adjacent commas. Canonical shape: `aRows := LSelect("SELECT ID FROM T WHERE STATUS = ?",,, {sStatus});`<!-- /rule --> <!-- rule: getssldataset_at_name_markers -->`GetSSLDataset` uses `@name` markers with parallel name and value arrays.<!-- /rule -->
9. **String comparison.** <!-- rule: equals_vs_strict_equals -->Use `==` for exact string equality; `=` is prefix-style for strings.<!-- /rule --> `==` generally parallels `=` for other value types. <!-- rule: dollar_for_containment -->Use `$` for containment tests.<!-- /rule -->
10. **Comments.** <!-- rule: single_line_comment_form -->Write a single-line comment as `/* comment text here;`.<!-- /rule --> <!-- rule: no_semicolon_in_comment_text -->Never include a semicolon inside comment text; the first semicolon ends the comment and the remaining text becomes executable code.<!-- /rule -->

### Style Guidance for New and Refactored Code

<!-- rules: id=prefer_exitcase,member_access_no_spaces,comment_regions_for_grouping,prefer_try_over_error_resume -->
- End each `:CASE` / `:OTHERWISE` block with `:EXITCASE;` unless multi-match behavior is intentional.
- Prefer no spaces around `:` in member access even though SSL accepts spaced forms.
- Use `/* region` / `/* endregion` comments for editor grouping instead of `:REGION` / `:ENDREGION`.
- Prefer `:TRY`/`:CATCH`/`:FINALLY` over legacy `:ERROR`/`:RESUME`.
<!-- /rules -->

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

* **Declaration:** <!-- rule: declare_before_use -->Declare variables before use with `:DECLARE`.<!-- /rule --> This is a style rule, not a language rule: SSL does not enforce it (see §0, item 3).
    * Syntax: `:DECLARE varName1, varName2;`
    * **Default Value:** All declared variables start as empty string `""`.
    * **Dynamic Typing:** Variables are dynamically typed—their type changes when assigned a new value.
    * **No argument type checks before run time:** Whether a built-in function rejects a wrong-typed argument depends on the installation's `CompilerCheckParamType` setting. Where it is off, a string passed for a number reads as `0` and a number passed for a string reads as `""`, so the call quietly returns a wrong answer, and a non-array passed where an array is expected can crash the server process. Pass the documented types and do not rely on the setting.
    * **Re-declaration:** <!-- rule: redeclare_is_noop -->Re-declaring an existing variable with `:DECLARE` is silently ignored — no error, existing value preserved.<!-- /rule -->
    * *Constraint:* <!-- rule: no_default_on_declare_line -->Do not put `:DEFAULT` on a `:DECLARE` line.<!-- /rule -->

* **Variable scope:** <!-- rule: variable_lookup_order -->Variable lookup: local scope → caller scopes (up call stack) → public variables (`:PUBLIC`).<!-- /rule --> Accessing a caller's variable works but generates a warning — always declare variables locally with `:DECLARE`.

* **Predefined globals are installation variables, not language constants.** Names such as `CRLF`, `MYUSERNAME`, `UserLang` and `STARLIMSDEPT` are `:PUBLIC` variables that a base installation declares at startup. `CR`, `LF`, `TAB`, `sTab`, `sSQ`, `sDQ`, `MYUSERID`, `MYLANGID`, `MYDEPT` and `MYSITE` are **not** declared on a base installation, and reading one raises `Variable [<name>] is undefined!`. <!-- rule: guard_optional_globals -->Do not read a name the base installation does not declare (`CR`, `LF`, `TAB`, `sDQ`, `MYUSERID`, ...); use `Chr(...)` or the documented global instead, and guard a name that only some installations declare with `IsDefined("<name>")`.<!-- /rule --> Use `Chr(13)`, `Chr(10)` and `Chr(9)` (or `CRLF` for a line break), `Chr(34)` for a double quote, `MYUSERNAME` for the user, `UserLang` for the language and `STARLIMSDEPT` for the department.

* **Parameters & Defaults:**
    * **Placement:** <!-- rule: parameters_first -->`:PARAMETERS` must appear before any other statements in a script or procedure body.<!-- /rule --> Inside a procedure, that puts `:PARAMETERS` immediately after the `:PROCEDURE` line.
    * **Defaults:** <!-- rule: default_after_parameters -->`:DEFAULT` must immediately follow `:PARAMETERS`.<!-- /rule --> Zero or more `:DEFAULT` lines may follow, but only after `:PARAMETERS`. A `:DEFAULT` applies when the argument is omitted, passed as `NIL`, or left as an empty position (`{a,,c}`), so no extra `NIL` check is needed after it.
    * **`:INCLUDE`** is resolved as a textual paste before the rest of the file is read. <!-- rule: include_early -->Place `:INCLUDE` early — it textually includes the referenced source before the script runs.<!-- /rule --> **`:DECLARE`** and **`:PUBLIC`** are regular statements and can appear anywhere.
    * **Order:** <!-- rule: script_declaration_order -->Recommended script order is `:PARAMETERS`, `:DEFAULT`, `:INCLUDE`, `:PUBLIC`, `:DECLARE`.<!-- /rule -->
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
    * **Authoritative Behavior:** `:BEGINCASE` is not a value-matching switch. <!-- rule: begincase_requires_case -->`:BEGINCASE` requires at least one `:CASE` block.<!-- /rule --> An empty `:BEGINCASE;` `:ENDCASE;` is rejected. Each `:CASE` evaluates its own boolean expression. Without `:EXITCASE;`, later `:CASE` expressions are still evaluated and additional matching bodies may execute. `:OTHERWISE` is still skipped once any earlier `:CASE` body has run. <!-- rule: exitcase_last_in_branch -->`:EXITCASE` must be the last statement of its `:CASE`/`:OTHERWISE` branch, directly in the branch body; one nested inside `:IF`, or followed by another statement, is a compile error.<!-- /rule -->
    * **Style Guidance:** <!-- rule: otherwise_for_default_handling -->Include `:OTHERWISE` for default handling; the language does not require it.<!-- /rule --> <!-- rule: prefer_exitcase -->End each `:CASE` / `:OTHERWISE` block with `:EXITCASE;` unless multi-match behavior is intentional.<!-- /rule -->
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
    * `:LABEL` and `Branch()` are legacy flow control. <!-- rule: label_is_legacy -->Prefer structured constructs (`:IF`/`:WHILE`/`:FOR`) over legacy `:LABEL` and `Branch()` in new code.<!-- /rule -->
    * <!-- rule: branch_target_label -->Include the word `LABEL` in a `Branch()` target: `:LABEL SKIP;` is targeted as `Branch("LABEL SKIP")`, and the match is exact, including case.<!-- /rule --> Likewise, `:LABELSKIP;` is targeted as `Branch("LABELSKIP")`. A target without the word `LABEL`, or with different spacing or case, matches no label. Labels are visible only within their own procedure or script body. A lowercase `:label` is not a label.
    * A literal target is resolved when the code compiles: one that matches no label (a typo, or a difference only in case) is a compile error, not a run-time failure. <!-- rule: branch_literal_target -->Pass `Branch()` its target as a string literal. A computed target (a variable, parameter or expression) never jumps: it falls through to the next statement without an error, even when its text matches the label exactly.<!-- /rule --> A computed target never jumps, even when its text matches the label exactly: the call silently falls through. To choose a target at run time, pick among literal `Branch()` calls with `:IF` or `:BEGINCASE`.
    * An `:ERROR` handler can `Branch()` back to a label in the body, for example to retry. Branching from the body to a label inside the `:ERROR` handler raises at run time.
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
    * **Try/Catch/Finally:** Structured exception handling (preferred). <!-- rule: try_requires_handler -->`:TRY` requires at least one of `:CATCH` or `:FINALLY`; a bare `:TRY ... :ENDTRY` is invalid.<!-- /rule --> Valid forms: `TRY...CATCH...ENDTRY`, `TRY...FINALLY...ENDTRY`, `TRY...CATCH...FINALLY...ENDTRY`. <!-- rule: catch_before_finally -->When a `:TRY` has both handlers, `:CATCH` must precede `:FINALLY`.<!-- /rule -->
      **Body requirements:** <!-- rule: try_and_finally_bodies_not_empty -->The `:TRY` body requires at least one statement, and so does a `:FINALLY` body; a `:CATCH` body may be empty.<!-- /rule -->
      **One handler:** <!-- rule: single_catch_per_try -->Only one `:CATCH` block is allowed per `:TRY`; there is no multi-catch.<!-- /rule -->
      **`:CATCH` does not name the exception.** <!-- rule: get_last_ssl_error_in_catch -->Use `GetLastSSLError()` inside `:CATCH` to retrieve error details.<!-- /rule --> It returns an `SSLError` object. Common `SSLError` members include `:Description` (the error message; `:Message` is an alias), `:Operation`, `:Code` / `:GenCode`, `:FullDescription` / `:FullDescriptionEx` (multi-line diagnostic text with stack details and nested causes), `:InnerException`, and `:NETException`.
      **`:FINALLY` restrictions:** <!-- rule: no_control_exit_in_finally -->Do not use `:RETURN`, `:EXITFOR`, `:EXITWHILE`, or `:LOOP` inside `:FINALLY`.<!-- /rule --> They are rejected.
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
      **Placement doctrine:** <!-- rule: raise_error_inside_handling_try -->Place `RaiseError` directly inside the `:TRY` block whose `:CATCH` handles it, so the raise can never escape.<!-- /rule --> <!-- rule: no_raise_error_in_catch -->Never call `RaiseError` inside `:CATCH` — the error handler must not become the thing that crashes.<!-- /rule --> <!-- rule: every_raise_has_handler_boundary -->Every raise needs a `:TRY`/`:CATCH` (or legacy `:ERROR`/`:RESUME`) boundary somewhere up the call stack; an uncaught error fails the invocation and surfaces to the end user as a server error.<!-- /rule --> <!-- rule: private_raise_only_helpers -->Mark raise-only helper procedures `/*@private;` so callers cannot bypass the entry point that catches their errors.<!-- /rule --> <!-- rule: clear_last_ssl_error_after_handling -->Call `ClearLastSSLError()` after handling an error in `:CATCH`, so stale error state does not leak into later handling.<!-- /rule -->
    * **Error/Resume (Legacy):** `:ERROR;` starts the **last** section of a procedure and runs to `:ENDPROC`. It protects the statements **before** it; the statements after it are the handler body, which runs only when a protected statement fails, and must contain at least one statement. A handler placed first protects nothing. Without `:RESUME`, the first failure skips the rest of the protected region, runs the handler, and ends the procedure. With `:RESUME;` as the last handler statement, every failing protected statement runs the handler and execution continues at the statement after the one that failed — this has significant performance cost. <!-- rule: prefer_try_over_error_resume -->Prefer `:TRY`/`:CATCH`/`:FINALLY` over legacy `:ERROR`/`:RESUME`.<!-- /rule -->
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

* **Definition:** Starts with `:PROCEDURE Name;` and ends with `:ENDPROC;`. <!-- rule: max_params_warning -->Keep procedures to at most 8 parameters; more than 20 parameters on a procedure or method draws a warning, so group related state into arrays or objects.<!-- /rule -->
* **Return Values:** Use `:RETURN value;` to return a value from a procedure. A procedure, method or script that ends without `:RETURN value;` (no `:RETURN`, or a bare `:RETURN;`) returns the empty string `""`, not `NIL`: `Empty(result)` is `.T.` but `result == NIL` is `.F.`. A `Constructor` returns nothing.
* **Calling Convention (CRITICAL):**
    * **Custom Procedures:** <!-- rule: no_direct_procedure_calls -->Do not call custom script procedures directly as `MyProc()`.<!-- /rule -->
    * **Same File:** <!-- rule: doproc_for_same_file_procedures -->Use `DoProc("ProcName", {args})` for same-file script procedures.<!-- /rule --> The second parameter is an array of arguments.
    * **Different File:** <!-- rule: execfunction_for_external_scripts -->Use `ExecFunction("Category.Script", {args})` or `ExecFunction("Category.Script.Proc", {args})` for external script entry points.<!-- /rule --> The second parameter is an array of arguments; the three-segment form calls one procedure of the script.
    * **One-segment `ExecFunction("Name")`** looks for a script in the default categories, not a procedure in the current script. Use `DoProc` for same-file procedures.
    * **First segment is never ambiguous:** Applications and server-script categories share a single namespace — a category cannot be created with the name of an existing application. The first segment of a dotted path therefore always resolves to exactly one container; there is no collision or precedence rule to consider.
    * **Skip Parameters:** An empty position passes `NIL`. <!-- rule: skip_commas_adjacent -->Use adjacent commas with no spaces for skipped optional parameters.<!-- /rule --> Write
      `DoProc("MyProc", {param1,,param3,,param5});` rather than
      `DoProc("MyProc", {param1, , param3, , param5});`. Both forms are valid and behave the same.
    * **Trailing optional parameters:** <!-- rule: empty_optional_param_array -->Do not pass empty trailing optional parameters when they can be omitted.<!-- /rule --> For example, write `DoProc("MyProc")` not `DoProc("MyProc", {})`, and `GetDataSet(sQuery)` not `GetDataSet(sQuery, {})`. The runtime pads missing arguments with NIL.
    * **Built-in Functions:** Can be called directly with standard syntax (e.g., `Len(sString)`).

### Objects & User-Defined Types

* **Object Creation:**
    * **Built-in Class:** `oObject := ClassName{};`. <!-- rule: builtin_classes_curly_braces -->Instantiate directly creatable built-in classes with curly braces, for example `Email{}`.<!-- /rule --> <!-- rule: no_createudobject_for_builtins -->Do not instantiate built-in classes with `CreateUdObject`.<!-- /rule --> Known built-in classes: `AzureStorage`, `BatchSupport`, `CDataTable`, `Email`, `EnterpriseExporter`, `FtpsClient`, `HtmlConverter`, `PatcherSupport`, `PdfSupport`, `RegSetup`, `SDMS`, `SDMSDocUploader`, `SSLCodeProvider`, `SSLDataset`, `SSLIntDictionary`, `SSLRegex`, `SSLStringDictionary`, `Sequence`, `TablesImport`, `WebServices`.
    * **No direct constructor:** `SSLExpando{}` raises the compile-time error `Invalid built-in class: SSLExpando` — create dynamic objects with `CreateUdObject()`. `SSLBaseDictionary` has no direct constructor — use `SSLStringDictionary{}` or `SSLIntDictionary{}`.
    * **Dynamic Object:** `oExp := CreateUdObject();` (creates an empty `SSLExpando`)
    * **User-Defined Class:** `oCustom := CreateUdObject("Samples.SampleTicket");` or `oCustom := CreateUdObject("Samples.SampleTicket", {arg1, arg2});` — for user-defined `:CLASS` files only. <!-- rule: createudobject_category_qualified -->Use `CreateUdObject("Category.ClassName")` for user-defined classes; a bare class name is looked up only among the default categories.<!-- /rule --> A bare name raises `There is no script with name: <name> among default categories.` for a class in your own category. The arguments array is passed to `Constructor`: an argument that is missing (no array, `{}`, or fewer elements than `Constructor` declares) arrives as `NIL`, and extra elements are ignored.
    * **Anonymous Object:** `oAnon := CreateUdObject({{"PropName", value}, ...});` (creates `SSLExpando` with properties)

* **Property Access:** Use colon notation: `oObject:PropertyName := value;`
    * SSL also accepts spaced member access (`oObject : PropertyName` / `oObject : Method()`). <!-- rule: member_access_no_spaces -->Prefer no spaces around `:` in member access even though SSL accepts spaced forms.<!-- /rule -->
    * Example:
      ```ssl
      oEmail:To := {"user@example.com"};
      oEmail:Subject := "Test Message";
      oSeq:StartWith := 1000;
      nNextValue := oSeq:NextValue;
      ```

* **Class Definition:**
    * `:CLASS [ClassName];` defines a class. <!-- rule: class_ends_at_eof -->`:CLASS` continues to end of file; there is no `:ENDCLASS`.<!-- /rule --> <!-- rule: explicit_class_name -->Give every class an explicit name in `:CLASS`; the name is syntactically optional.<!-- /rule -->
    * `:INHERIT Category.ClassName;` specifies inheritance (optional, follows `:CLASS`). <!-- rule: inherit_qualified_name -->Write `:INHERIT` with the full `Category.ClassName` of the parent class; a plain class name is a compile-time error.<!-- /rule --> Without `:INHERIT`, classes inherit from `SSLObject` by default.
    * Class contains `:DECLARE` statements and `:PROCEDURE` definitions
    * **Constructor:** Define with `:PROCEDURE Constructor;`. This is the fixed reserved name for a class constructor, not a normal method identifier. If omitted, an empty zero-argument constructor is auto-generated. <!-- rule: class_member_order -->Order class members as `:INHERIT`, then the class-level `:DECLARE` fields, then the methods.<!-- /rule --> <!-- rule: constructor_after_methods -->By convention, declare `Constructor` after the regular methods, as the last method of the class; a class that declares it first compiles and runs the same way.<!-- /rule --> <!-- rule: constructor_return_value -->`:RETURN` inside a `Constructor` cannot return a value.<!-- /rule --> <!-- rule: base_constructor_with_parameters -->With `:INHERIT`, the parent's parameterless `Constructor` runs automatically first; a parent `Constructor` that takes parameters runs only if the derived `Constructor` calls `Base:Constructor(args)`.<!-- /rule -->
    * **Class method calls:** <!-- rule: me_base_for_method_calls -->Call sibling or inherited methods with `Me:Method()` and `Base:Method()`.<!-- /rule --> <!-- rule: doproc_in_class -->Do not call `DoProc` with a bare procedure name inside class methods; it is a compile-time error. Use `Me:Method()` or `Base:Method()`.<!-- /rule --> Fully qualified `DoProc("Category.Script.Proc", ...)` calls to deployed script procedures compile and run, and `ExecFunction` has no class-method restriction (`ExecFunction("Category.Script.Proc", ...)` works from a class method).
    * **Class fields must be qualified.** <!-- rule: field_access_via_me -->Inside class methods, access fields through `Me:fieldName` or `Base:fieldName`.<!-- /rule --> Inside a class method, a bare identifier resolves to a local variable or `:PARAMETERS` entry — **not** to a `:DECLARE` field on the class. A bare name follows normal variable lookup (local, then caller scopes, then publics): a read with nothing of that name in reach raises `Variable [name] is undefined!`, and a write may land on a caller's or a public variable. Neither touches the field.
    * **No script entry point:** A class file contains only the class definition and cannot be run as a script. `ExecFunction("Category.ClassFile")` fails at runtime, and `ExecFunction("Category.ClassFile.MethodName")` does **not** invoke the method. <!-- rule: execfunction_not_class_file -->Point `ExecFunction` at a script entry point or script procedure, never at a class file; create class instances with `CreateUdObject` and call their methods.<!-- /rule -->
    * **Underscore-prefixed members:** <!-- rule: underscore_private_convention -->Underscore-prefixed members (`_name`) are excluded from reflection — this is the SSL private convention.<!-- /rule --> For example, `_myHelper` is effectively private.
    * **Access modifiers (scripts only):** `/*@private;` and `/*@protected;` restrict access to a procedure. Both block calls from other scripts; procedures in the same script can still call it with `DoProc`. Although they use comment syntax, SSL recognizes them as access modifiers, not regular comments, and a blank line between the modifier and `:PROCEDURE` breaks the association. <!-- rule: visibility_annotation_form -->Put an access modifier on its own line immediately before `:PROCEDURE`, with no blank line between them.<!-- /rule --> <!-- rule: visibility_annotation_exact_form -->Write an access modifier exactly as `/*@private;` or `/*@protected;`: lowercase, with no space between `/*` and `@`.<!-- /rule --> <!-- rule: visibility_annotations_script_only -->Do not put `/*@private;` or `/*@protected;` on class methods; they affect script procedures only, and class methods are always public.<!-- /rule -->
      ```ssl
      /*@private;
      :PROCEDURE InternalHelper;
          /* This procedure cannot be called from other scripts;
      :ENDPROC;
      ```
    * **`Me` form:** Self-reference to the current class instance. Use `Me:fieldName` or `Me:MethodName(args)`. <!-- rule: me_inside_class_only -->Use `Me` only inside a `:CLASS` definition.<!-- /rule -->
    * **`Base` form:** Reference to the parent class. <!-- rule: base_member_access -->Use `Base` only in a class with `:INHERIT`, and always as `Base:MemberName`; it cannot stand alone.<!-- /rule --> Use `Base:MethodName(args)` to call overridden parent methods, or `Base:fieldName` to access an inherited field.
    * **Terminology:** <!-- rule: field_vs_property_terminology -->Use field for `:DECLARE` slots on classes, and reserve property for dynamic-object members, `SSLExpando` members, and `AddProperty`-created members.<!-- /rule --> Those members are a separate runtime mechanism.
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

* **Code Folding (Comment Style):** <!-- rule: comment_regions_for_grouping -->Use `/* region` / `/* endregion` comments for editor grouping instead of `:REGION` / `:ENDREGION`.<!-- /rule -->
  ```ssl
  /* region Database Operations;
      /* Code here;
  /* endregion;
  ```
* **Includes:** `:INCLUDE LibraryName;` or `:INCLUDE Category.ScriptName;` to include external SSL files. Resolved as a textual paste. <!-- rule: include_early -->Place `:INCLUDE` early — it textually includes the referenced source before the script runs.<!-- /rule -->
* **Public Variables:** `:PUBLIC varName1, varName2;` to declare global/public variables. Can appear anywhere in the statement flow.

### Inline Code & Regions (Functional Constructs)

* **Inline Code Blocks (Legacy):** `:BEGININLINECODE Name;` / `:BEGININLINECODE "Name";` ... `:ENDINLINECODE;` defines a named block whose body is captured as raw text, re-parsed as a complete SSL compilation unit for validation, and stored for later retrieval via `GetInlineCode(sValue, aVariables)`. The block is stored when execution reaches it, like any other statement: a block with the same name that runs after `DeleteInlineCode` stores the name again. Before the block is reached, `GetInlineCode` returns `""` if no inline block is stored yet, and raises `GetInlineCode: <name> not in scope.` if a different block is already stored; after it is reached, it returns the block text. The block body does not run where the block stands; it runs only when the retrieved text is executed.
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
* **Named Regions (Legacy Functional Text Blocks):** `:REGION <name>;` ... `:ENDREGION;` defines a named block whose body is stored as raw text. Unlike `:BEGININLINECODE`, the body is not validated as SSL code. The content is stored and retrieved later via `GetRegion(sValue, vSrc, vDst)`. Region markers inside a comment (`/*:REGION Hidden;`) define nothing, so `GetRegion("Hidden")` raises `not in scope`. `GetRegion` also finds regions defined in a script pulled in with `:INCLUDE`.
* **Code Organization:** For organizing and grouping procedures in the IDE, use `/* region` / `/* endregion` comment conventions instead (see the **Code Organization** section above).

### Comments

* **Syntax:** Starts with `/*` and **must end with a semicolon `;`**.
* **Single-line:** <!-- rule: single_line_comment_form -->Write a single-line comment as `/* comment text here;`.<!-- /rule -->
* **Multi-line:** the comment ends at the first `;`, so any layout parses. <!-- rule: multi_line_comment_layout -->Lay out a multi-line comment with `/*` alone on the first line, then the text lines, then `;` alone on the last line.<!-- /rule --> The schema shows it in `comments.examples.multi_line`:
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
  SSL reads this as the complete comment `/* Set x := 0;` followed by `then increment;`, which it then tries to run as a statement (and rejects). <!-- rule: no_semicolon_in_comment_text -->Never include a semicolon inside comment text; the first semicolon ends the comment and the remaining text becomes executable code.<!-- /rule --> Restructure the comment to work around this limitation.
* **Access modifiers are not comments:** `/*@private;` and `/*@protected;` use comment syntax but are access modifiers (see Objects & User-Defined Types above), so tools and refactors keep them as they are. <!-- rule: visibility_annotation_exact_form -->Write an access modifier exactly as `/*@private;` or `/*@protected;`: lowercase, with no space between `/*` and `@`.<!-- /rule --> <!-- rule: visibility_annotation_form -->Put an access modifier on its own line immediately before `:PROCEDURE`, with no blank line between them.<!-- /rule -->

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
| Logical AND | `.AND.` | `.F.` if the left operand is `.F.`; otherwise the right operand, unchanged |
| Logical OR | `.OR.` | `.T.` if the left operand is `.T.`; otherwise the right operand, unchanged |
| Logical NOT | `.NOT.` | Returns opposite value |

**Key Behaviors:**
- `.AND.` and `.OR.` use **short-circuit evaluation**: if the first operand determines the result, the second operand is not evaluated (e.g., `.F. .AND. SomeFunction()` will not call `SomeFunction()`)
- **No truthy/falsy coercion.** <!-- rule: no_truthy_falsy_coercion -->Conditions in `:IF`, `:WHILE` and `:CASE`, and the left operand of `.AND.`/`.OR.`, must be logical values; there is no truthy/falsy coercion, and other types, including `NIL`, raise an error.<!-- /rule --> The right operand is not converted: when the left operand does not decide the result, it is returned as is, so `.T. .AND. "x"` returns `"x"` and `.F. .OR. "x"` returns `"x"`. Keep both operands boolean; a non-logical result raises only later, when a condition tests it.
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

* **Assignment:** `:=` — the target can be a variable, an object property (`oTask:Status`) or an array element (`aItems[1]`). Assignment has the lowest precedence, is right-associative and evaluates to the assigned value, so `sStatus := sDefault := "PENDING";` is valid. <!-- rule: one_assignment_per_statement -->Prefer one assignment per line; use a chained assignment only when every target should receive the same value, and do not use an assignment inside a larger expression.<!-- /rule -->
* **Compound Assignment:** `+=`, `-=`, `*=`, `/=`, `^=`, `%=` — each evaluates to the updated left-side value, so it can appear inside a condition such as `(nIndex += 1) <= nCount`.
* **Comparison:** `=`, `==`, `!=`, `<>`, `#`, `<`, `>`, `<=`, `>=` — prefer `!=` over `<>` or `#` for not-equals
* **Logical:** `.AND.`, `.OR.`, `.NOT.`, `!` (must include periods for `.AND.`/`.OR.`/`.NOT.`). Both `.AND.` and `.OR.` skip the right operand once the result is known. <!-- rule: parenthesize_mixed_logical -->Parenthesize an expression that mixes `.AND.` and `.OR.`: `.AND.` binds tighter, so `bA .OR. bB .AND. bC` means `bA .OR. (bB .AND. bC)`.<!-- /rule -->
* **Arithmetic:** `+`, `-`, `*`, `/`, `^`, `**` (power), `%` (modulo)
* **Unary:** `++` (increment), `--` (decrement) — both prefix (`++i`) and postfix (`i++`) forms are supported. Prefix returns the new value; postfix returns the original value. The target can be a variable, an array element (`aCounts[1]++`) or an object property (`oStats:nHits++`) holding a number or a date (a date steps by one day). Operands are evaluated left to right, so with `i = 1`, `i++ + i++` returns `3` and leaves `i` at `3`. <!-- rule: increment_as_statement -->Use `++` and `--` as a statement of their own (`nCount++;`), not inside a larger expression; never apply them to the same variable twice in one expression, or to a variable the same expression also reads.<!-- /rule -->
* **String:** `+` (concatenation), `-` (trims trailing spaces from the left operand, then concatenates), `$` (contains). <!-- rule: prefer_explicit_trim_concat -->Join strings with `Trim(sFirst) + sSecond`, not `sFirst - sSecond`: on strings, `-` trims trailing spaces from the left operand and then appends, which reads like subtraction.<!-- /rule -->
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

<!-- rule: udobject_array_in_clause -->Expand only a local array in `IN (?aValues?)`: a UDObject array property expanded directly raises a runtime error, so copy it to a local first.<!-- /rule --> The runtime error is `"The current array has more than 1 dimmension."` Scalar UDObject properties (e.g., `?oObj:ID?`) are not affected — only arrays used for `IN` expansion.

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

<!-- rules: id=complex_sql_placeholder,sql_in_clause_array_expansion,udobject_array_in_clause,runsql_non_dml,lsearch_for_single_values,sql_keyword_case,sql_identifier_case -->
- Pre-compute complex values before interpolating them into `SQLExecute` placeholders.
- Use `PrepareArrayForIn` or `SQLExecute` array expansion for dynamic `IN` clauses when appropriate; do not build an `IN` clause by hand when a safer array helper or parameter array is available.
- Expand only a local array in `IN (?aValues?)`: a UDObject array property expanded directly raises a runtime error, so copy it to a local first.
- Use `RunSQL` for statements that return no rows (`INSERT`, `UPDATE`, `DELETE`, DDL), inside `:TRY`/`:CATCH`.
- Use `LSearch` for single-value lookups, with explicit parameters.
- Inside SQL strings, write SQL keywords and built-in functions in uppercase.
- Preserve the author's casing for table names, column names and aliases; force-folding is dialect-conditional (safe on Oracle, but breaks case-sensitive SQL Server collations), so lowercase only Oracle-only code.
<!-- /rules -->

Simple variables in placeholders also perform best.

### SQL Formatting Quick Reference (Canonical Compact)

SQL in SSL strings uses **canonical compact** style. Full reference with examples
for every statement type: `ssl-style-guide/sql-canonical-compact-reference.md`

**Rules:**

<!-- rules: domain=sql level=style_only applies_to=embedded_sql -->
- Use multiline SQL strings for non-trivial queries and put major clauses on separate lines.
- Indent the whole SQL block 4 spaces inside the SSL string literal.
- Start each major clause at column 0 relative to the 4-space indent: `SELECT`, `FROM`, `WHERE`, `INNER JOIN`, `LEFT OUTER JOIN`, `RIGHT OUTER JOIN`, `FULL OUTER JOIN`, `CROSS JOIN`, `GROUP BY`, `ORDER BY`, `UNION`, `UNION ALL`, `INTERSECT`, `MINUS`, `INSERT INTO`, `VALUES`, `UPDATE`, `DELETE FROM`, `MERGE INTO`, `USING`, `WHEN MATCHED THEN`, `WHEN NOT MATCHED THEN`, `START WITH`, `CONNECT BY`, `PIVOT`, `UNPIVOT`, `FOR UPDATE`, `RETURNING`.
- Keep SQL lines to about 90 characters, breaking at logical points.
- Put commas at the end of the line (trailing comma style), not at the start of the next line.
- Inside SQL strings, write SQL keywords and built-in functions in uppercase.
- Preserve the author's casing for table names, column names and aliases; force-folding is dialect-conditional (safe on Oracle, but breaks case-sensitive SQL Server collations), so lowercase only Oracle-only code.
- Preserve external schema or object casing when the schema or object requires it.
- Start each `AND`/`OR` condition on its own line, indented 2 spaces under `WHERE`; in a join condition it aligns with `ON`, and in a `HAVING` condition with `HAVING`.
- Indent `ON` 2 spaces under its `JOIN` (in `MERGE`, `ON` stays at column 0).
- Indent `HAVING` 2 spaces under `GROUP BY`.
- When a `BETWEEN ... AND` range breaks across lines, align its `AND` under `BETWEEN`.
- Indent `WHEN`/`ELSE` 4 spaces under `CASE`.
- Align `END` with its `CASE`.
- Within one `CASE` block, keep all `WHEN`/`THEN` branches inline or break them all; do not mix. `ELSE` may stay inline when its value is short.
- When a `THEN` value breaks to a new line, indent it 4 spaces under its `WHEN`.
- Pack `SELECT` columns onto lines up to about 90 characters: short aliases (`col AS alias`) and simple functions (`COUNT(*)`, `UPPER(col)`) can share a line, and complex expressions (`CASE`, nested functions, subqueries) break to their own line.
- Align `SELECT` continuation lines to the first column (column 7).
- In `INSERT`, put the opening `(` on the `INSERT INTO` line, indent the columns 4 spaces, and put the closing `)` on its own line; lay out `VALUES` the same way.
- In `UPDATE`, keep `SET` on the `UPDATE` line and indent the assignments 4 spaces below it.
- When formatting an existing `MERGE`, put `ON` at column 0 (not indented under `USING`), indent the `AND` of a multi-line `ON` condition 4 spaces (under the first condition inside the parentheses), indent `UPDATE SET`, `INSERT` and `DELETE WHERE` 4 spaces under their `WHEN`, end the `UPDATE SET` line at `SET` with each assignment on its own line 4 spaces further in (as in a plain `UPDATE`), keep `DELETE WHERE` on one line with each `AND`/`OR` of its condition on its own line 4 spaces further in, and give the `INSERT` block-style parentheses.
- Put a blank line before and after `UNION`, `UNION ALL`, `INTERSECT` and `MINUS`.
- Keep an optimizer hint (`/*+ HINT */`) immediately after its action keyword; never remove or reformat a hint without understanding its purpose.
- Do not put a trailing semicolon inside an embedded SQL string — `"SELECT ... ;"` is not the convention; end the SSL statement, not the SQL text.
- Use ordinary SQL string literals; add the `N` prefix only when the target explicitly requires Unicode literal semantics.
- Let ordinary text comparisons use the schema or database collation; force `COLLATE` only for a documented comparison contract, and explain why the schema collation is insufficient immediately before the query.
- Use structured SQL with clause-per-line formatting and indentation that exposes lock and guard conditions.
<!-- /rules -->

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

<!-- rules: id=datasource_default_required,datasource_empty_parameters,no_default_statements_in_datasource -->
- Give every data-source parameter an inline `:=` default; a parameter without one makes the data source fail when it runs.
- A data source that takes no parameters leaves the `:PARAMETERS` line out; an empty `:PARAMETERS;` is an error.
- Data source files use inline `:PARAMETERS` defaults with `:=` instead of separate `:DEFAULT` statements.
<!-- /rules -->

A parameter with no default fails whatever the caller passes, with
`Incorrect synatx in :PARAMETERS. No default value for one or more parameters.`
The preprocessor rewrites the example above into standard form before the
script runs:

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

<!-- rules: domain=data-sources -->
- Invoke data sources with `RunDS("Category.DataSourceName", {values})`; values bind by position in `:PARAMETERS` order, not by name. `GetDSParameters` returns the parameter names in that order. Do not pass `{name, value}` pairs; each pair is bound whole to one parameter.
- Data source files use inline `:PARAMETERS` defaults with `:=` instead of separate `:DEFAULT` statements.
- Give every data-source parameter an inline `:=` default; a parameter without one makes the data source fail when it runs.
- A data source that takes no parameters leaves the `:PARAMETERS` line out; an empty `:PARAMETERS;` is an error.
- Do not apply normal script `:PARAMETERS`/`:DEFAULT` layout to data-source files.
- Reference SQL data-source parameters in the SQL body as `@name` placeholders, not `?name?` markers.
- Declare every `@name` placeholder of a SQL data-source body in `:PARAMETERS`; an undeclared one is not substituted and fails when the query executes.
- Use SQL comment syntax (`--` and `/* ... */`) in SQL data-source bodies, not the SSL comment form.
- In a SQL data source, a semicolon only ends a builder directive or `:PARAMETERS`; the body runs as one SQL command, so any other semicolon outside a comment or string literal is misplaced.
- In a SQL data source, put the SQL body after the `:PARAMETERS` line; SQL text placed before it is discarded.
- Lay out the query body of a SQL data source in the canonical compact SQL style, the same as SQL embedded in SSL strings.
- SQL data-source builder directives (`:DSN`, `:TABLENAME`, `:NULLASBLANK`, `:INVARIANTDATECOLUMNS`) are preprocessed before compilation and are not normal SSL keywords; do not flag them as unknown keywords.
- Do not treat builder directives as reusable SSL keywords outside data-source contexts.
- In an SSL data source, comments are SSL comments: they end at the first `;`, and `*/` does not close them.
- In an SSL data source, use parameters as ordinary variables by their bare names; `@name` placeholders are not part of this file type.
- The `RunDS` return-type argument (`"ssldataset"`, `"xml"`, and so on) converts only an `SSLDataset` result; an SSL data source that callers request in another return type returns an `SSLDataset`, for example from `GetSSLDataset`.
- One file should represent either a class definition, a script, or a data source.
<!-- /rules -->
- **The tree-sitter grammar and TextMate grammar do not cover data source syntax** — these constructs exist only in the preprocessing layer

---

## 5. Style Guidance for New and Refactored Code

### Hungarian Notation

<!-- rules: id=hungarian_variable_names,documented_hungarian_prefixes,prefix_matches_type -->
- Variables use Hungarian-style camelCase: a type prefix, then a camelCase body (`sMyVar`, not `s_my_var` or `SMYVAR`).
- Use documented prefixes: `s`, `n`, `b`, `d`, `a`, `o`, `fn`, and `v`.
- Make a variable's prefix match the type of the value it holds: `s` string, `n` numeric, `b` boolean, `d` date, `a` array, `o` object, `fn` code block, `v` variant/any.
<!-- /rules -->

The prefixes:

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

<!-- rules: id=identifier_length_limits -->
- Keep variable names to 20 characters after the type prefix, and procedure and function names to 30 characters.
<!-- /rules -->

**Exceptions to Hungarian Notation:**

<!-- rules: id=loop_counter_names,constants_upper_snake_case,preserve_acronym_casing -->
- Loop counters may be `i`, `j`, `k`, `x`, `y` or `z` without a prefix only when declared; in a script that calls other scripts, prefer a script-specific name such as `nSampleIdx`.
- Constants use UPPER_SNAKE_CASE.
- Preserve established acronym casing only when it already exists in the surrounding codebase or required external names.
<!-- /rules -->

An undeclared loop counter can collide with a caller's variable. The special
SSL literals `NIL`, `.T.` and `.F.` take no prefix. Constant examples:
`MAX_COUNT`, `DEFAULT_PATH`.

### Style Guidelines

<!-- rules: id=indent_tabs_preferred,consistent_indentation,align_related_elements,ssl_max_line_length,comments_explain_why,single_line_comment_form,keyword_uppercase -->
- Prefer tabs for indentation; if the file already uses spaces, preserve 4-space indentation.
- Keep indentation consistent within a file; do not mix tabs and spaces.
- Align related elements, such as parameters and SQL statements, for readability.
- Keep SSL lines to about 90 characters, breaking longer ones at logical points.
- Comments explain purpose, ownership, safety consequences, replay behavior, or a non-obvious ordering requirement; do not narrate assignments or restate syntax.
- Write a single-line comment as `/* comment text here;`.
- Colon-prefixed SSL keywords are uppercase and case-sensitive, for example `:IF` and `:BEGINCASE`.
<!-- /rules -->

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

Each row breaks one of these rules, in order:

<!-- rules: id=no_direct_procedure_calls,default_after_parameters,prefer_exitcase,keyword_uppercase,named_sql_param_unsupported,sql_positional_placeholders,bare_logical_operator,arrays_one_based,builtin_classes_curly_braces,createudobject_category_qualified,dot_property_access,no_default_statements_in_datasource,datasource_empty_parameters -->
- Do not call custom script procedures directly as `MyProc()`.
- `:DEFAULT` must immediately follow `:PARAMETERS`.
- End each `:CASE` / `:OTHERWISE` block with `:EXITCASE;` unless multi-match behavior is intentional.
- Colon-prefixed SSL keywords are uppercase and case-sensitive, for example `:IF` and `:BEGINCASE`.
- `SQLExecute` is the only database API that supports named `?param?` substitution; do not use `?param?` markers with other database functions. Its markers reference in-scope SSL variables by name. Canonical shape: `SQLExecute("UPDATE T SET COL = ?sValue? WHERE ID = ?nId?");`
- `RunSQL`, `LSearch`, `LSelect`, `LSelect1`, `LSelectC`, and `GetDataSet` use positional `?` markers with a value array in a later argument slot: fourth for `LSearch`, `LSelect` and `LSelectC`, second for `GetDataSet`, and third for `RunSQL` and `LSelect1`. Check `ssl_signature` for the slot and skip unused optionals with adjacent commas. Canonical shape: `aRows := LSelect("SELECT ID FROM T WHERE STATUS = ?",,, {sStatus});`
- Write the logical operators with their periods: `.AND.`, `.OR.` and `.NOT.`, never bare `AND`, `OR` or `NOT`.
- SSL arrays are 1-based; loop over arrays from 1 through `ALen(aArray)`.
- Instantiate directly creatable built-in classes with curly braces, for example `Email{}`.
- Use `CreateUdObject("Category.ClassName")` for user-defined classes; a bare class name is looked up only among the default categories.
- Use colon-chained member access (`oObj:Property`, `oObj:Method():Value`), not dot-chained access (`oObj.Property`).
- Data source files use inline `:PARAMETERS` defaults with `:=` instead of separate `:DEFAULT` statements.
- A data source that takes no parameters leaves the `:PARAMETERS` line out; an empty `:PARAMETERS;` is an error.
<!-- /rules -->

---

## 8. Edge Cases & Gotchas

1.  **Implicit Concatenation Error:** <!-- rule: no_default_on_declare_line -->Do not put `:DEFAULT` on a `:DECLARE` line.<!-- /rule --> They are separate steps.
2.  **The "DoProc" Rule:** The most common error for agents is calling `MyFunc()` directly. <!-- rule: no_direct_procedure_calls -->Do not call custom script procedures directly as `MyProc()`.<!-- /rule --> <!-- rule: doproc_in_class -->Do not call `DoProc` with a bare procedure name inside class methods; it is a compile-time error. Use `Me:Method()` or `Base:Method()`.<!-- /rule --> Fully qualified `DoProc("Category.Script.Proc", ...)` calls remain valid in class methods.
3.  **Case Sensitivity Inversion:** Unlike many languages where keywords are lower (`if`) and vars are sensitive, SSL is the opposite: Keywords are strict (`:IF`), identifiers are loose (`sVar` == `SVAR`).
4.  **Semicolons:** <!-- rule: statement_semicolon -->Almost every SSL statement, including comments, must end with a semicolon.<!-- /rule -->
5.  **1-Based Arrays:** <!-- rule: arrays_one_based -->SSL arrays are 1-based; loop over arrays from 1 through `ALen(aArray)`.<!-- /rule --> The first element is `aArray[1]`.
6.  **Logical Operators Must Have Periods:** <!-- rule: bare_logical_operator -->Write the logical operators with their periods: `.AND.`, `.OR.` and `.NOT.`, never bare `AND`, `OR` or `NOT`.<!-- /rule -->
7.  **:EXITCASE controls multi-match behavior:** `:BEGINCASE` is not a value-matching switch. Each `:CASE` evaluates its own boolean expression. Without `:EXITCASE;`, later `:CASE` expressions are still evaluated and additional matching bodies may execute. `:OTHERWISE` is still skipped once any earlier `:CASE` body has run, even if that earlier case omitted `:EXITCASE;`. <!-- rule: prefer_exitcase -->End each `:CASE` / `:OTHERWISE` block with `:EXITCASE;` unless multi-match behavior is intentional.<!-- /rule -->
8.  **Error Handling:** <!-- rule: prefer_try_over_error_resume -->Prefer `:TRY`/`:CATCH`/`:FINALLY` over legacy `:ERROR`/`:RESUME`.<!-- /rule -->
9.  **Object Property Access:** <!-- rule: dot_property_access -->Use colon-chained member access (`oObj:Property`, `oObj:Method():Value`), not dot-chained access (`oObj.Property`).<!-- /rule -->
10. **Function Name Casing:** <!-- rule: builtin_function_canonical_casing -->Represent functions in PascalCase where applicable, while preserving canonical exceptions such as `_AND`, `_OR`, `_XOR`, `_NOT`, `DOW`, `DOY`, and `LIMSDate`.<!-- /rule --> For example `CreateUdObject`, `SQLExecute`, `AEval` and `AScan`.
11. **Object Property Assignment:** Object property assignments (e.g., `oLogger:lastError := value;`) are NOT variable declarations - don't flag as undeclared.
12. **SQL Parameter Case Insensitivity:** SQL parameter names in `?varName?` placeholders are case-insensitive - `?sID?` and `?SID?` reference the same variable.
13. **Multi-line Function Calls:** Function calls and array literals can span multiple lines - proper indentation should be preserved.
14. **Procedure References:** Procedure names should only be matched in execution contexts (`DoProc`, `ExecFunction`), not in comments, strings, or unrelated identifiers.
15. **Comment Toggle:** SSL uses `/* ... ;` comment syntax. Toggling comments should add/remove this pattern, not `//` style comments.
16. **:STEP Keyword Spacing:** <!-- rule: step_spacing -->Put a space before `:STEP` in `:FOR` headers.<!-- /rule --> Write `:FOR i := 1 :TO 10 :STEP 2;`, not `:FOR i := 1 :TO 10:STEP 2;`.
17. **:ENDFOR Is Not Valid:** Although `:ENDFOR` is a reserved word, it is **not a usable keyword**; using it is rejected as a syntax error. SSL does not have <!-- rule: endfor_invalid -->`:ENDFOR`: a `:FOR` loop closes with `:NEXT`.<!-- /rule -->
18. **String Equality:** The `=` operator for strings returns `.T.` if right operand is empty OR left starts with right. <!-- rule: equals_vs_strict_equals -->Use `==` for exact string equality; `=` is prefix-style for strings.<!-- /rule --> **`!=` asymmetry:** `!=` negates `==` (exact match), not `=` (prefix match), so `=` and `!=` are **not logical opposites** for strings — e.g., `"Logged" = "Log"` is `.T.` AND `"Logged" != "Log"` is also `.T.`. The `<>` and `#` operators behave identically to `!=`. <!-- rule: not_preferred_operator -->Prefer `!=` over `<>` or `#` for not-equals.<!-- /rule -->
19. **Default Variable Value:** <!-- rule: nil_not_empty_string -->Do not treat `NIL` as an empty string, zero or `.F.`; declared variables start as an empty string, not `NIL`.<!-- /rule -->
20. **SQLExecute Exclusivity:** <!-- rule: named_sql_param_unsupported -->`SQLExecute` is the only database API that supports named `?param?` substitution; do not use `?param?` markers with other database functions. Its markers reference in-scope SSL variables by name. Canonical shape: `SQLExecute("UPDATE T SET COL = ?sValue? WHERE ID = ?nId?");`<!-- /rule --> <!-- rule: sql_positional_placeholders -->`RunSQL`, `LSearch`, `LSelect`, `LSelect1`, `LSelectC`, and `GetDataSet` use positional `?` markers with a value array in a later argument slot: fourth for `LSearch`, `LSelect` and `LSelectC`, second for `GetDataSet`, and third for `RunSQL` and `LSelect1`. Check `ssl_signature` for the slot and skip unused optionals with adjacent commas. Canonical shape: `aRows := LSelect("SELECT ID FROM T WHERE STATUS = ?",,, {sStatus});`<!-- /rule --> <!-- rule: getssldataset_at_name_markers -->`GetSSLDataset` uses `@name` markers with parallel name and value arrays.<!-- /rule -->
21. **Complex Expression Warning:** Using expressions like `?sPrefix + sSuffix?` in SQLExecute triggers a performance warning. <!-- rule: complex_sql_placeholder -->Pre-compute complex values before interpolating them into `SQLExecute` placeholders.<!-- /rule -->
22. **:REGION vs `/* region`:** `:REGION`/`:ENDREGION` is a legacy functional construct that captures body text for later retrieval via `GetRegion()`. <!-- rule: comment_regions_for_grouping -->Use `/* region` / `/* endregion` comments for editor grouping instead of `:REGION` / `:ENDREGION`.<!-- /rule -->
23. **Data source files use different parameter syntax.** <!-- rule: no_default_statements_in_datasource -->Data source files use inline `:PARAMETERS` defaults with `:=` instead of separate `:DEFAULT` statements.<!-- /rule --> <!-- rule: datasource_default_required -->Give every data-source parameter an inline `:=` default; a parameter without one makes the data source fail when it runs.<!-- /rule --> See §4A.
24. **Data source directives are not SSL keywords.** <!-- rule: no_flag_builder_directives -->SQL data-source builder directives (`:DSN`, `:TABLENAME`, `:NULLASBLANK`, `:INVARIANTDATECOLUMNS`) are preprocessed before compilation and are not normal SSL keywords; do not flag them as unknown keywords.<!-- /rule --> They exist only in SQL data source files, where the data source preprocessor handles them before the script runs.
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
