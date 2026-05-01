---
name: ssl-new-class
description: Scaffold a new SSL class with correct member ordering, constructor, and conventions.
argument-hint: "<class-name> [base-class]"
allowed-tools: Read, Write, Edit, Grep, Glob
---

Generate a new SSL class skeleton using `$ARGUMENTS` (first token is the class name, optional second token is the base class).

## Instructions

1. **Parse arguments:**
   - `<class-name>` = `$0` — the class name (PascalCase)
   - `[base-class]` = `$1` — optional, fully qualified base class name (e.g., `Category.Script`)

2. **Validate the proposed class name against the built-in inventory.**
   Check `ssl-style-guide/ssl-element-reference.json` (or MCP `ssl_lookup`)
   to ensure `<class-name>` does not collide with one of the 29 built-in
   classes: AzureStorage, BatchSupport, CDataColumn, CDataColumns,
   CDataField, CDataRow, CDataTable, Email, EnterpriseExporter, FtpsClient,
   HtmlConverter, PatcherSupport, PdfSupport, RegSetup, SDMS,
   SDMSDocUploader, SQLConnection, SSLBaseDictionary, SSLCodeProvider,
   SSLDataset, SSLError, SSLExpando, SSLIntDictionary, SSLRegex,
   SSLSQLError, SSLStringDictionary, Sequence, TablesImport, WebServices.
   If the user-supplied name collides with one of these, stop and ask the
   user to pick a different name (do not auto-rename).

3. **If a `[base-class]` is supplied,** confirm it exists. If the base
   class name (without category prefix) matches a built-in class from the
   inventory, treat that as a likely error — built-in classes are not
   intended to be inherited. Surface this to the user before generating
   the scaffold. If it doesn't match a built-in, treat it as a user-
   defined class — the category-qualified path (`Category.BaseClass`)
   should resolve in the user's project.

4. **Use these core SSL rules in the scaffold:**
   - Colon-prefixed keywords must be UPPERCASE
   - Almost every statement, including comments, must end with `;`
   - Never place `;` inside comment body text
   - `:DECLARE` class fields must appear before methods
   - `:CLASS` continues to end of file; there is no `:ENDCLASS`
   - Constructor must be the last procedure in the class
   - Prefer tabs for indentation; if adapting to an existing space-indented file,
     preserve 4-space indentation
   - Use one statement per line
   - `DoProc` is invalid inside class methods (all forms, not just same-class); use `Me:` / `Base:`
   - Built-in classes use `{}`; user-defined classes instantiate with
     `CreateUdObject("Category.ClassName")`
   - `:TRY` requires at least one `:CATCH` or `:FINALLY`; only one `:CATCH` per `:TRY`
   - `:TRY` body requires at least one statement; `:FINALLY` body (if present) requires at least one statement
   - `:RETURN`, `:EXITFOR`, `:EXITWHILE`, and `:LOOP` inside a `:FINALLY` block are compile errors

5. **Apply enforced member ordering** (compiler requirement):
   ```
   :INHERIT  (if base class provided)
   :DECLARE  (field declarations)
   methods   (regular method procedures)
   Constructor procedure (must be last)
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
   - Class name: PascalCase
   - Fields declared with `:DECLARE` at class level (not inside methods)
   - Underscore-prefixed fields (`_sField`) are private by convention — excluded from reflection
   - `/*@private;` and `/*@protected;` annotations have NO effect on class methods (class methods are always Public|Virtual) — do not use them
   - `DoProc` cannot be used inside class methods — use `Me:Method()` for same-class calls, `Base:Method()` for inherited
   - `:CLASS` continues to end of file; do not add `:ENDCLASS`
   - Constructor must be the **last** procedure in the class
   - Class files have no script entry point — to instantiate: `CreateUdObject("Category.ClassName")`
   - One class per file (compiler enforced)
   - All statements end with `;`
   - If a method has no parameters, omit `:PARAMETERS`
   - Inside `:CATCH`, use `GetLastSSLError()` if you need error details
   - Indentation: use tabs by default

8. **Output:** Present the generated class as an SSL code block. Include:
   - The class file should be named after the class in the appropriate SSL category
   - Instantiate with `CreateUdObject("Category.InvoiceManager")` or `CreateUdObject("Category.InvoiceManager", {args})`
   - If the user provided a target file path, write the scaffold there; otherwise return the scaffold directly

---

## Example

Input: `/ssl-new-class InvoiceManager`

Output:
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

## Output

Present the generated class as an SSL code block. Include the expected file
naming and instantiation guidance. If the user provided a target file path,
write the scaffold there.
