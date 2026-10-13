---
name: ssl-new-class
description: Scaffold a new SSL class with correct member ordering, constructor, and conventions. Use when asked to create, scaffold, or start a new SSL class.
argument-hint: "<class-name> [base-class]"
allowed-tools: Read, Write, Edit, Grep, Glob, mcp__ssl-reference__ssl_lookup, mcp__ssl-reference__ssl_validate_naming, mcp__ssl-reference__ssl_diagnose
---

Generate a new SSL class skeleton using `$ARGUMENTS` (first token is the class name, optional second token is the base class).

## Instructions

1. **Parse arguments:**
   - `<class-name>` = `$0` — the class name (PascalCase)
   - `[base-class]` = `$1` — optional, fully qualified base class name (e.g., `Category.Script`)

2. **Validate the proposed class name against the built-in inventory.**
   Use MCP `ssl_validate_naming` (and `ssl_lookup` for the authoritative
   inventory) — or `ssl-style-guide/ssl-element-reference.json` when MCP is
   unavailable — to ensure `<class-name>` does not collide with a built-in
   class (currently 29 — get the authoritative list from the JSON's `classes`
   bucket or `ssl_lookup`). If the user-supplied name collides with one of
   these, stop and ask the user to pick a different name (do not auto-rename).

3. **If a `[base-class]` is supplied,** confirm it exists. If the base
   class name (without category prefix) matches a built-in class from the
   inventory, treat that as a likely error — built-in classes are not
   intended to be inherited. Surface this to the user before generating
   the scaffold. If it doesn't match a built-in, treat it as a user-
   defined class — the category-qualified path (`Category.BaseClass`)
   should resolve in the user's project.

4. **Use these core SSL rules in the scaffold:**
   <!-- rules: id=keyword_uppercase,statement_semicolon,no_semicolon_in_comment_text,class_member_order,constructor_after_methods,class_ends_at_eof,indent_tabs_preferred,one_statement_per_line,doproc_in_class,builtin_classes_curly_braces,createudobject_category_qualified,try_requires_handler,single_catch_per_try,try_and_finally_bodies_not_empty,no_control_exit_in_finally wrap=80 -->
   - Colon-prefixed SSL keywords are uppercase and case-sensitive, for example
     `:IF` and `:BEGINCASE`.
   - Almost every SSL statement, including comments, must end with a semicolon.
   - Never include a semicolon inside comment text; the first semicolon ends the
     comment and the remaining text becomes executable code.
   - Order class members as `:INHERIT`, then the class-level `:DECLARE` fields,
     then the methods.
   - By convention, declare `Constructor` after the regular methods, as the last
     method of the class; a class that declares it first compiles and runs the
     same way.
   - `:CLASS` continues to end of file; there is no `:ENDCLASS`.
   - Prefer tabs for indentation; if the file already uses spaces, preserve
     4-space indentation.
   - Use one statement per line.
   - Do not call `DoProc` with a bare procedure name inside class methods; it is
     a compile-time error. Use `Me:Method()` or `Base:Method()`.
   - Instantiate directly creatable built-in classes with curly braces, for
     example `Email{}`.
   - Use `CreateUdObject("Category.ClassName")` for user-defined classes; a bare
     class name is looked up only among the default categories.
   - `:TRY` requires at least one of `:CATCH` or `:FINALLY`; a bare
     `:TRY ... :ENDTRY` is invalid.
   - Only one `:CATCH` block is allowed per `:TRY`; there is no multi-catch.
   - The `:TRY` body requires at least one statement, and so does a `:FINALLY`
     body; a `:CATCH` body may be empty.
   - Do not use `:RETURN`, `:EXITFOR`, `:EXITWHILE`, or `:LOOP` inside
     `:FINALLY`.
   <!-- /rules -->

5. **Apply the member ordering.** `:INHERIT` and the class-level `:DECLARE`
   fields come before the methods. Placing `Constructor` last is this guide's
   convention, not a language requirement: a class that declares `Constructor`
   first compiles and runs the same way.
   ```
   :INHERIT  (if base class provided)
   :DECLARE  (field declarations)
   methods   (regular method procedures)
   Constructor procedure (last, by convention)
   ```

6. **Generate the class** following this structure:

---

**With base class (`/ssl-new-class InvoiceManager Category.BaseClass`):**
```ssl
/* =============================================================================;
/* CLASS:    InvoiceManager;
/* PURPOSE:  [Describe the class purpose];
/* INHERITS: Category.BaseClass;
/* =============================================================================;
:CLASS InvoiceManager;
:INHERIT Category.BaseClass;

:DECLARE _sPrivateField;
:DECLARE sPublicField;

/* -----------------------------------------------------------------------------;
/* PROCEDURE: GetField;
/* PURPOSE: [Describe method purpose];
/* RETURNS: [Return value description];
/* -----------------------------------------------------------------------------;
:PROCEDURE GetField;
	:DECLARE sValue;

	:TRY;
		sValue := Me:sPublicField;
		:RETURN sValue;
	:CATCH;
		:RETURN NIL;
	:ENDTRY;

:ENDPROC;

/* -----------------------------------------------------------------------------;
/* Constructor;
/* PURPOSE: Initialize the InvoiceManager instance;
/* -----------------------------------------------------------------------------;
:PROCEDURE Constructor;

	:TRY;
		/* Initialize fields;
		Me:sPublicField := "";
		Me:_sPrivateField := "";
	:CATCH;
		/* Initialization error;
	:ENDTRY;

:ENDPROC;

```

**Without base class (`/ssl-new-class InvoiceManager`):**
```ssl
/* =============================================================================;
/* CLASS:   InvoiceManager;
/* PURPOSE: [Describe the class purpose];
/* =============================================================================;
:CLASS InvoiceManager;

:DECLARE _sPrivateField;
:DECLARE sPublicField;

/* -----------------------------------------------------------------------------;
/* PROCEDURE: GetField;
/* PURPOSE: [Describe method purpose];
/* RETURNS: [Return value description];
/* -----------------------------------------------------------------------------;
:PROCEDURE GetField;
	:DECLARE sValue;

	:TRY;
		sValue := Me:sPublicField;
		:RETURN sValue;
	:CATCH;
		:RETURN NIL;
	:ENDTRY;

:ENDPROC;

/* -----------------------------------------------------------------------------;
/* Constructor;
/* PURPOSE: Initialize the InvoiceManager instance;
/* -----------------------------------------------------------------------------;
:PROCEDURE Constructor;

	:TRY;
		/* Initialize fields;
		Me:sPublicField := "";
		Me:_sPrivateField := "";
	:CATCH;
		/* Initialization error;
	:ENDTRY;

:ENDPROC;

```

---

7. **Apply these rules:**
   <!-- rules: id=class_fields_declared_at_class_level,omit_parameters_when_none,procedure_class_pascal_case,me_base_for_method_calls,underscore_private_convention,visibility_annotations_script_only,base_constructor_with_parameters,execfunction_not_class_file,one_class_per_file,get_last_ssl_error_in_catch,clear_last_ssl_error_after_handling,raise_error_inside_handling_try,no_raise_error_in_catch,every_raise_has_handler_boundary wrap=80 -->
   - Declare class fields with `:DECLARE` at class level, not inside methods.
   - Leave out `:PARAMETERS` and `:DEFAULT` when a procedure or method takes no
     parameters.
   - Procedures and classes use PascalCase.
   - Call sibling or inherited methods with `Me:Method()` and `Base:Method()`.
   - Underscore-prefixed members (`_name`) are excluded from reflection — this
     is the SSL private convention.
   - Do not put `/*@private;` or `/*@protected;` on class methods; they affect
     script procedures only, and class methods are always public.
   - With `:INHERIT`, the parent's parameterless `Constructor` runs
     automatically first; a parent `Constructor` that takes parameters runs only
     if the derived `Constructor` calls `Base:Constructor(args)`.
   - Point `ExecFunction` at a script entry point or script procedure, never at
     a class file; create class instances with `CreateUdObject` and call their
     methods.
   - Define only one `:CLASS` per file.
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

8. **Output:** Present the generated class as an SSL code block. Include:
   - The class file should be named after the class in the appropriate SSL category
   - Instantiate with `CreateUdObject("Category.InvoiceManager")` or `CreateUdObject("Category.InvoiceManager", {args})`; a constructor argument the call leaves out arrives as `NIL`, and extra arguments are ignored
   - If the user provided a target file path, write the scaffold there; otherwise return the scaffold directly

9. **Verify:** if the scaffold was written to a file and MCP `ssl_diagnose` is
   available, run it and confirm the scaffold parses with zero errors before
   reporting done. Without MCP, state that the scaffold has not been
   machine-validated.

---

## Output

Present the generated class as an SSL code block. Include the expected file
naming and instantiation guidance. If the user provided a target file path,
write the scaffold there.
