# Tree-sitter SSL (STARLIMS Scripting Language)

**Status:** Tree-sitter grammar for SSL v11 editor tooling. It tracks the documented language surface closely, while documenting a few practical editor-oriented approximations.

## Language Coverage

- **Colon-prefixed keywords** like `:IF`, `:DECLARE`, and `:PROCEDURE` are written in uppercase in valid code.
- **SSL literals/constants** like `NIL`, `.T.`, and `.F.` are case-insensitive. **Class-context forms** like `Me` and `Base` are also case-insensitive, and `Constructor` is case-insensitive only as the fixed constructor declaration name inside `:CLASS`.
- **Comments** begin with `/*` and end at the next semicolon `;`.
- **Strings** support `"double"`, `'single'`, and bracketed `[text]` literals.
- **Numbers** support integers, decimals, and scientific notation.
- **Arrays** use `{ ... }`; indexers support `[i]`, `[i,j]`, and chained forms with 1-based indexing.
- **Built-in classes** instantiate with curly braces, for example `Email{}` and `SSLRegex{"^A"}`.
- **Object access** uses colon-chained forms such as `object:property` and `object:method(args)`; spaced member access such as `object : property` is also accepted.
- **Control structures** include `:IF/:ELSE/:ENDIF`, `:WHILE/:ENDWHILE`, `:FOR ... :NEXT`, `:BEGINCASE/:CASE/:OTHERWISE/:ENDCASE`, and structured exceptions `:TRY/:CATCH/:FINALLY/:ENDTRY`.
- **Loop control** includes `:EXITFOR`, `:EXITWHILE`, and `:LOOP`; `:RESUME` is included as part of SSL's legacy error-handling syntax.
- **Scripts vs classes** are distinguished at the top level so tooling can treat a file as either a script or a class definition.
- **Legacy body-capture constructs** `:REGION ... :ENDREGION` and `:BEGININLINECODE ... :ENDINLINECODE` are part of the language and are supported by the grammar.
- **Procedure and class declarations** are highlighted directly, including general `:PROCEDURE` names, `Constructor`, `:CLASS` names, bare `:INCLUDE` names, and bare or qualified `:INHERIT` names.

## Known Approximations

- **Skipped arguments:** SSL accepts empty slots in arrays and call lists such as `{a,,b}`. Tree-sitter does not model truly empty non-start syntactic children, so those slots are not represented explicitly.
- **Inline code bodies:** `:BEGININLINECODE ... :ENDINLINECODE` stores a named body that is validated as SSL code. The grammar models it structurally for editing and navigation.
- **Functional regions:** `:REGION ... :ENDREGION` stores raw text for later `GetRegion()` retrieval instead of acting like a normal statement block.
- **Class member ordering:** The grammar intentionally enforces the successful class structure used by the current guidance: `:INHERIT`, `:DECLARE`, regular methods, then `Constructor`.
- **Includes:** `:INCLUDE` is modeled as a syntactic construct for tooling and accepts bare include names.

## Files and Structure

```
tree-sitter-ssl/
├── grammar.js              → main Tree-sitter grammar
├── package.json            → package metadata
├── queries/
│   ├── highlights.scm      → syntax highlighting captures
│   ├── locals.scm          → local variable scope detection
│   └── injections.scm      → SQL highlighting within strings
└── README.md               → this file
```

## Query Files

- **highlights.scm**: Main syntax highlighting for SSL constructs, including built-in class instantiation contexts
- **locals.scm**: Local variable and parameter scope detection for procedures, class methods, constructors, and code blocks; class fields and `:PUBLIC` variables are intentionally not marked as locals
- **injections.scm**: SQL language injection for SQL-like strings and the SQL string argument in common database call sites

## Getting Started

```bash
npm i
npm run gen
npm test
```

Use `tree-sitter parse` on SSL files to inspect parse output.

## Validation

The grammar and queries are checked with:
- `npm run gen`
- `npm test`

They are maintained to stay aligned with the repository's authoritative SSL reference and current style/tooling files.

## Practical Notes

- **Database parameters:** SQL-like strings may contain `?param?`, positional `?`, and other query placeholders used by SSL database functions.
- **Scientific notation:** Numeric tokenization follows the current grammar rules used by the repository tooling.
- **Member access spacing:** Highlighting/parser support accepts both `obj:prop` and `obj : prop`.
- **Built-in classes:** Highlights prefer real instantiation contexts such as `Email{}` instead of treating every class-name identifier as a constructor use.
- **Bitwise built-ins:** `_AND`, `_OR`, `_XOR`, and `_NOT` are highlighted as built-in function calls, not infix operators.
- **Assignment:** Assignment operators are parsed at expression level, so chained forms such as `x := y := 5` are represented.
- **Comments:** Because comments terminate at `;`, a semicolon inside comment text ends the comment.

## Testing

Test with real SSL scripts to ensure proper parsing of:
- Complex procedure definitions with parameters and defaults
- Class inheritance and method definitions
- Database function calls with parameterized queries
- Nested control structures and error handling
- Array operations and object property access
