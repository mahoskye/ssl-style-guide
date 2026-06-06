# SSL Machine Foundation

Generated compact baseline for SSL agents. Use this first, then retrieve a
category pack or element record for task-specific detail.

## Retrieval Protocol

- Start with this foundation for every SSL planning, development, review, or
  refactoring task.
- Use `category-index.json` or `ssl_context_pack` to find compact topic
  context by category, alias, or element name.
- Use `ssl_lookup`, `ssl_signature`, and `ssl_search` before relying on a
  built-in function, class, keyword, operator, or signature.
- Read `agent-guides/ssl_agent_instructions.md` only when the compact pack and
  element inventory do not contain enough detail.

## Non-Negotiable SSL Rules

- Colon-prefixed SSL keywords are uppercase and case-sensitive.
- Almost every SSL statement, including comments, must end with a semicolon.
- Never include a semicolon inside comment text; the first semicolon ends the
  comment and the remaining text becomes executable code.
- Declare variables before use with `:DECLARE`.
- Do not put `:DEFAULT` on a `:DECLARE` line.
- In scripts and procedures, `:PARAMETERS` appears before any other statement
  and `:DEFAULT` immediately follows `:PARAMETERS`.
- Data source files are different: `:PARAMETERS` uses inline `:=` defaults,
  and every parameter must have a default.
- SSL arrays are 1-based.
- Use `==` for exact string equality; `=` is prefix-style for strings.
- Use `DoProc("ProcName", {args})` for same-file script procedures.
- Use `ExecFunction("Category.Script", {args})` or
  `ExecFunction("Category.Script.Proc", {args})` for external script entry
  points.
- Built-in classes instantiate with curly braces, for example `Email{}`.
- User-defined classes instantiate with `CreateUdObject("ClassName")`.
- Inside class methods, access fields through `Me:fieldName` or
  `Base:fieldName`.
- Prefer `:TRY`/`:CATCH`/`:FINALLY`; bare `:TRY ... :ENDTRY` is invalid.
- Do not put `:RETURN`, `:EXITFOR`, `:EXITWHILE`, or `:LOOP` inside
  `:FINALLY`.
- `SQLExecute` is the only database API that supports named `?param?`
  substitution.

## Naming Prefixes

- `s`: string
- `n`: numeric
- `b`: boolean
- `d`: date
- `a`: array
- `o`: object
- `fn`: code_block
- `v`: variant

## Primary Categories

- `control-flow`: Branching and early-return constructs for SSL scripts and procedures.
- `loops`: Iteration constructs, loop exits, and loop-control gotchas.
- `database`: SSL database APIs, query return shapes, and parameterization rules.
- `sql`: SQL formatting and query-construction conventions inside SSL strings.
- `transactions`: Transaction lifecycle functions and failure handling around database writes.
- `strings`: String literals, comparison semantics, containment, and common string helpers.
- `arrays`: SSL array creation, indexing, traversal, and array helper functions.
- `dates`: Date conversion, formatting, and date arithmetic helpers.
- `classes`: User-defined class structure, field access, method calls, and built-in class creation.
- `objects`: Dynamic objects, properties, built-in classes, and member-access conventions.
- `procedures`: Procedure declarations, parameter/default ordering, and procedure-call mechanisms.
- `data-sources`: SSL and SQL data-source syntax, inline defaults, and builder directives.
- `error-handling`: Modern SSL error handling with TRY/CATCH/FINALLY and error retrieval.
- `files`: File, directory, archive, and transfer helper functions.
- `email`: Email built-in class and related message-sending behavior.
- `security`: Security-sensitive SSL practices, especially SQL binding and dynamic code.
- `formatting`: Statement layout, indentation, comments, operators, and region comments.
- `naming`: Procedure, class, variable, constant, and parameter naming conventions.
- `types`: SSL primitive/runtime types, literals, and type-sensitive comparisons.
- `operators`: Assignment, arithmetic, comparison, logical, containment, and member-access operators.
- `logging`: Server logging helpers and message-output caveats.
- `module-structure`: File-level organization for scripts, classes, and data sources.
