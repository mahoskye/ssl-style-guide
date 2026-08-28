# SSL Machine Foundation

Generated compact baseline for SSL agents (source:
ssl-style-guide.schema.yaml v1.7.0, last_updated
2026-08-08, via tools/generate-machine-docs.mjs). Use this
first, then retrieve a category pack or element record for task-specific
detail.

## Retrieval Protocol

- Start with this foundation for every SSL planning, development, review, or
  refactoring task.
- Use `category-index.json` or `ssl_context_pack` to find compact topic
  context by category, alias, or element name.
- Use `ssl_lookup`, `ssl_signature`, and `ssl_search` before relying on a
  built-in function, class, keyword, operator, or signature.
- Run `ssl_diagnose` on any SSL you write or modify before declaring it done.
- Use `ssl_format` for formatting passes instead of hand-formatting.
- Read `agent-guides/ssl_agent_instructions.md` only when the compact pack and
  element inventory do not contain enough detail.

## Non-Negotiable SSL Rules

- Colon-prefixed SSL keywords are uppercase and case-sensitive.
- Almost every SSL statement, including comments, must end with a semicolon.
- Never include a semicolon inside comment text; the first semicolon ends the
  comment and the remaining text becomes executable code. End every comment
  with `;` alone — the form `; */` leaves an inert `*/` outside the
  comment and draws a diagnostic.
- Condition-bearing keyword lines are statements and end with a semicolon:
  `:IF condition;`, `:WHILE condition;`, `:FOR i := 1 :TO n;`. Omitting
  it makes the parser absorb the next line into the condition.
- Declare variables before use with `:DECLARE`.
- Do not put `:DEFAULT` on a `:DECLARE` line.
- In scripts and procedures, `:PARAMETERS` appears before any other statement
  and `:DEFAULT` immediately follows `:PARAMETERS`.
- Data source files are different: `:PARAMETERS` uses inline `:=` defaults,
  optional per parameter.
- SSL arrays are 1-based; collections on .NET objects reached via colon member
  access (for example `dataSet:Tables[0]`) are 0-based.
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
  substitution. Its markers reference in-scope SSL variables by name and
  it has **no values-array parameter** (the second parameter is a
  connection name). Canonical shape:
  `SQLExecute("UPDATE T SET COL = ?sValue? WHERE ID = ?nId?");`
- `RunSQL`, `LSearch`, `LSelect`, `LSelect1`, `LSelectC`, and
  `GetDataSet` use positional `?` markers with a value array in a
  **later argument slot** — check `ssl_signature` for the slot and skip
  unused optionals with adjacent commas. Canonical shape:
  `aRows := LSelect("SELECT ID FROM T WHERE STATUS = ?",,, {sStatus});`
- Do not put a trailing semicolon inside an embedded SQL string —
  `"SELECT ... ;"` is not the convention; end the SSL statement, not
  the SQL text.

## SSL Does Not Have

Constructs from other languages that do not exist in SSL. Writing any of
these is an error — never invent them:

- Positional parameter access (`$1`, `$2`, ...): parameters are accessed
  only by the names declared in `:PARAMETERS`.
- `:DECLARE` initializers (`:DECLARE x := 1;`): `:DECLARE` takes bare
  identifiers only — assign in a separate statement. Class constants are
  assigned in the Constructor.
- `*/` comment closers: an SSL comment opens with `/*` and ends at the
  first `;`.
- `:ENDFOR`: a `:FOR` loop closes with `:NEXT`.
- `=` assignment: assignment is `:=` (plus `+=`, `-=`, ...);
  `x = y` is a comparison expression, never an assignment.
- `[a, b]` array literals: array literals use braces `{1, 2, 3}`;
  square brackets are for indexing (`aRows[1]`) and are also a string
  literal form (`[text]`), never an array constructor.
- `NULL`: the absent-value literal is `NIL`.
- Bare `If`/`Else`/`EndIf`/`While`/`EndWhile` keywords: SSL
  keywords are colon-prefixed uppercase only (`:IF`/`:ELSE`/
  `:ENDIF`/`:WHILE`/`:ENDWHILE`) — a bare form is an identifier,
  not a keyword.
- The C ternary `cond ? a : b`: use `IIf(bCondition, vTrue, vFalse)`
  (exactly three arguments; both branches are evaluated).
- A values array on `SQLExecute`: `SQLExecute(sSql, {args})` passes
  the array as a **connection name** — SQLExecute binds via `?name?`
  markers only (see the database rules above).

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
