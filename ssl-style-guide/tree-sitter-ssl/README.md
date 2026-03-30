# Tree-sitter SSL

Tree-sitter grammar for **STARLIMS Scripting Language (SSL) v11**.

This grammar aims to match the repository's documented SSL language surface for
editor tooling. Where Tree-sitter cannot model SSL exactly, this README calls
out the approximation explicitly.

## Coverage

- Colon-prefixed keywords such as `:IF`, `:DECLARE`, and `:PROCEDURE` are
  represented as uppercase, case-sensitive forms.
- SSL literals/constants such as `NIL`, `.T.`, and `.F.` are case-insensitive.
  `Me`, `Base`, and `Constructor` follow the same documented class-context
  rules as the canonical agent guide.
- Comments begin with `/*` and terminate at the next semicolon `;`.
- Strings support `"double"`, `'single'`, and bracketed `[text]` literals.
- Arrays use `{...}` and indexers use 1-based SSL indexing forms.
- Built-in classes instantiate with curly braces, for example `Email{}`.
- Member access supports both `obj:prop` and the accepted spaced form
  `obj : prop`, though the preferred style is the no-space form.
- Control structures include `:IF`, `:WHILE`, `:FOR`, `:BEGINCASE`, `:TRY`, and
  legacy constructs such as `:REGION` and `:BEGININLINECODE`.
- Top-level parsing distinguishes scripts from class definitions so queries can
  treat them differently.
- **Data source files are not covered by this grammar.** SSL and SQL data source
  files are preprocessed by server-side builders before compilation. Their
  parameter syntax (`:PARAMETERS p1 := val;` with inline defaults) and builder
  directives (`:DSN`, `:TABLENAME`, `:NULLASBLANK`, `:INVARIANTDATECOLUMNS`)
  exist only in the preprocessing layer. This grammar targets the runtime SSL
  language as seen by the compiler.

## Known Approximations

- Skipped arguments such as `{a,,b}` are accepted by SSL, but empty non-leading
  slots are not represented as explicit Tree-sitter children.
- `:BEGININLINECODE ... :ENDINLINECODE` stores a named body that SSL validates
  as code. The grammar models the structure for editing and navigation.
- `:REGION ... :ENDREGION` is a functional body-capture construct in SSL, not a
  normal statement block. The grammar still models it structurally.
- The grammar enforces the successful class member ordering used by the current
  repository guidance: `:INHERIT`, `:DECLARE`, regular methods, then
  `Constructor`.
- `:INCLUDE` is modeled as a syntactic construct for tooling and accepts bare
  include names.

## Structure

```text
tree-sitter-ssl/
├── grammar.js
├── package.json
├── queries/
│   ├── highlights.scm
│   ├── locals.scm
│   └── injections.scm
└── README.md
```

## Query Files

- `queries/highlights.scm`
  Syntax highlighting captures for SSL keywords, operators, built-ins, and
  declaration forms.
- `queries/locals.scm`
  Local variable and parameter scope detection for procedures, class methods,
  constructors, and code blocks.
- `queries/injections.scm`
  SQL injections for SQL-like strings and common database-call string
  arguments.

## Commands

```bash
npm install
npm run gen
npm test
```

Use `tree-sitter parse` on SSL files to inspect parse output.

## Validation Notes

The grammar and queries are maintained to stay aligned with:

- `ssl-style-guide/ssl-style-guide.schema.yaml`
- `agent-guides/ssl_agent_instructions.md`
- `ssl-style-guide/ssl-ebnf-grammar.md`

Practical notes:

- SQL-like strings may contain named `?param?` or positional `?` placeholders,
  depending on the SSL database API.
- Built-in classes are highlighted in real instantiation contexts such as
  `Email{}` rather than treating every matching identifier as a constructor use.
- `_AND`, `_OR`, `_XOR`, and `_NOT` are highlighted as built-in function calls,
  not as infix operators.
- Because comments terminate at `;`, a semicolon inside comment text ends the
  comment.
