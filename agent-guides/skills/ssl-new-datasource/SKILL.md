---
name: ssl-new-datasource
description: Scaffold a new SSL or SQL data source file with correct parameter syntax, inline defaults, and builder directives. Use when asked to create or scaffold an SSL or SQL data source file.
argument-hint: "<data-source-name> [variant: ssl|sql] [parameters...]"
allowed-tools: Read, Write, Edit, Grep, Glob, mcp__ssl-reference__ssl_lookup, mcp__ssl-reference__ssl_context_pack, mcp__ssl-reference__ssl_diagnose
---

Generate a new data source skeleton using `$ARGUMENTS` (first token is the data
source name, an optional variant token selects `ssl` or `sql`, remaining tokens
are parameter names).

Data source files are **not** ordinary server scripts. They are preprocessed
server-side before SSL compilation and use syntax that does not exist in the
standard SSL language (source: `ssl-style-guide.schema.yaml`
`module_structure.data_source_modules`; `agent-guides/ssl_agent_instructions.md`
§4A). Read those sections — or call `ssl_context_pack` with `data-sources` — if
you are unsure about any rule below.

## Instructions

1. **Parse arguments:**
   - `<data-source-name>` = `$0` — the data source name (PascalCase; convert if not)
   - `[variant]` = `ssl` or `sql` — if absent, ask the user which variant to
     scaffold (the two have different structure)
   - `[parameters...]` = remaining tokens — each becomes an inline `:PARAMETERS`
     entry

2. **Use these core data-source rules in the scaffold:**
   - Parameters use inline `:=` defaults: `:PARAMETERS p1 := val1, p2 := val2;`
   - **Every parameter MUST have a default** — the builder throws an error
     otherwise
   - **`:PARAMETERS;` with no parameters is an error** — omit `:PARAMETERS`
     entirely when there are no parameters rather than emitting an empty one
   - **Never use separate `:DEFAULT` statements** in a data source — defaults are
     inline in `:PARAMETERS`
   - Do not apply the standard script `:PARAMETERS` + `:DEFAULT` layout to data
     source files
   - Colon-prefixed keywords are UPPERCASE; almost every statement ends with `;`;
     never place `;` inside comment body text

3. **Infer parameter types from Hungarian notation prefixes** and pick a matching
   inline default:
   - Recognized prefixes (`sName`, `nQty`, `bFlag`, `dDate`, `aItems`, `oObj`,
     `fnFilter`, `vValue`) — keep as-is
   - No recognizable prefix → default to `s` (string) and note the assumption
   - Default value by type: string → `""`, numeric → `0`, boolean → `.F.`,
     date → `NIL`, array → `{}`, object → `NIL`, code block → `NIL`,
     variant → `NIL`

4. **Generate the data source** for the requested variant (see templates below).

5. **Physical layout and invocation:**
   - A data source file lives at `Data Sources/CATEGORY/NAME.ds` (dispatched as
     `Category.Name`); development checkouts may be flat `.ds` or `.ds.txt`
     files
   - Callers invoke it at runtime with `RunDS`, passing overrides as an array of
     `{name, value}` pairs:
     ```ssl
     oResult := RunDS("Category.DataSourceName");
     oResult := RunDS("Category.DataSourceName", {{"sStatus", "P"}, {"nLimit", 25}});
     oDs := RunDS("Category.DataSourceName",, "ssldataset");
     ```
   - `GetDSParameters("Category.DataSourceName")` introspects the parameter
     metadata at runtime

6. **Verify:** if the scaffold was written to a file and MCP `ssl_diagnose` is
   available, run it on the file and confirm it parses (the validator applies
   data-source-specific rules). Without MCP, state that the scaffold has not been
   machine-validated.

7. **Output:** Present the generated data source as an SSL code block. If the
   user provided a target file path, write it there; otherwise return the
   scaffold directly. The templates below display spaces for readability — emit
   tabs in the generated file (preserve 4-space indentation only when adapting an
   existing space-indented file).

---

## Variant: SSL data source

Structure: optional header comment, `:PARAMETERS` with inline `:=` defaults, then
the SSL script body.

```ssl
/* =============================================================================;
/* DATA SOURCE: SampleList (SSL);
/* PURPOSE:     [Describe what this data source returns];
/* PARAMS:      sStatus  — record status filter;
/*              nMaxRows — maximum rows to return;
/* =============================================================================;
:PARAMETERS sStatus := "A", nMaxRows := 100;

/* SSL body: build and return the result set;
:DECLARE oDataset;

oDataset := GetSSLDataset("SELECT * FROM sample WHERE status = ?sStatus?", , {"sStatus"}, {sStatus});

:RETURN oDataset;
```

## Variant: SQL data source

Structure: optional header comment, optional builder directives, optional
`:PARAMETERS` with inline `:=` defaults, then the SQL query body. The SQL
preprocessor rewrites the file into an SSL script that calls `GetSSLDataset()`.

Builder directives (preprocessed — not SSL keywords, do not treat them as
reusable elsewhere):

| Directive | Purpose |
| --- | --- |
| `:DSN := name;` | Database connection to use |
| `:TABLENAME := name;` | Table name for the resulting dataset |
| `:NULLASBLANK := true;` | Null-to-blank conversion |
| `:INVARIANTDATECOLUMNS := col1, col2;` | Columns treated as invariant dates |

```ssl
/* =============================================================================;
/* DATA SOURCE: SampleList (SQL);
/* PURPOSE:     [Describe what this query returns];
/* =============================================================================;
:DSN := starlims;
:TABLENAME := sampleList;
:NULLASBLANK := true;
:PARAMETERS sStatus := "A", nLimit := 50;

SELECT
    sampleid,
    status,
    createddate
FROM sample
WHERE status = ?sStatus?
ORDER BY createddate DESC
```

---

## Output

Present the generated data source as an SSL code block and note the expected file
location (`Data Sources/CATEGORY/NAME.ds`) and the `RunDS("Category.Name", ...)`
invocation. If the user provided a target file path, write the scaffold there and,
when MCP `ssl_diagnose` is available, report that it validated cleanly.
