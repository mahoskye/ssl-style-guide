# ssl-mcp-server

MCP server that packages this repository's SSL rules, guides and element
data for MCP-compatible clients.

It serves the vendored element inventory and metadata, the rule schema, the
style rules, the EBNF grammar, the agent language reference, the refactoring
guide, and the generated machine packs. It also validates and formats SSL
through the pinned starlims-lsp binary. The data under `ssl-mcp-server/data/`
is a checked-in mirror of the canonical files in `ssl-style-guide/`,
`agent-guides/` and `rules/`.

## Quick Start

```bash
cd ssl-mcp-server
bun install
bun run fetch-lsp    # download the pinned starlims-lsp release binary
bun run check
bun run check:consistency
```

`ssl_diagnose` runs the **strict agent profile**: `--info`,
`--hungarian-types`, and `--strict`. All three are opt-in in the LSP
because they are noisy while a human is mid-edit in an editor, and all
three are what a non-interactive consumer wants from finished code.
`--strict` adds `undeclared_variable` (which catches a typo'd variable
read the default validator reports as clean), `unused_variable`, and
`invalid_sql_param`. In measurements on real SSL it adds well under one
extra finding per file among files that already validate without errors,
and none of its rules is error severity, so it never flips `valid`. The
naming-convention audit (`hungarian_notation`) is deliberately excluded.

With starlims-lsp v0.27.0, four codes can make `valid` false that did not
before: `branch_literal_target`, `non_logical_condition` and
`array_index_whole_number` are new error codes, and
`comment_text_after_terminator` is now an error. The new warning
`parenthesize_negated_comparison` is an error when the negated operand is a
string or number literal. `--info` also shows the size review triggers
`procedure_length_review` and `script_size_review`, which prompt a
responsibility check and never fail validation.

starlims-lsp v0.28.0 adds four style codes for expression shapes that
readers misread, none of them an error, so `valid` does not change.
`parenthesize_mixed_logical` is a warning on an `.AND.` group that is an
operand of `.OR.` without parentheses. `increment_as_statement` (a `++` or
`--` inside a larger expression), `one_assignment_per_statement` (an
assignment whose value a larger expression uses) and
`prefer_explicit_trim_concat` (string `-` between two known strings) are
info. `increment_as_statement` is a warning when the same statement
increments that variable again or reads it. With `--info`, the loop idioms
`:WHILE ++i <= n;` and `:WHILE (i += 1) <= n;` now draw an info finding.

`ssl_format` formats whole files. On legacy SSL that is not a small
change — in measurements on real files, most changed under the formatter
and most had more than half their lines rewritten — so agents are told to
format files they create and to leave an existing file's layout alone
unless reformatting is the task. The tool also re-formats its own output
to check the formatter settled. It is expected to — idempotence is a
formatter contract, and held on every set of files measured against
v0.24.0 — so an input that comes back flagged as unstable indicates a
formatter bug, and the note tells the caller to report it rather than
loop chasing a fixed point.

Both tools follow the starlims-lsp CLI contract that v0.25.0 wrote down.
A file argument is passed after `--`, so a path that starts with a dash is
still read as a path. Exit 2 means the call itself was wrong (an unknown
flag, no input): the binary writes nothing to stdout, and the tools return
its stderr message as the error instead of parsing empty output. A binary
older than v0.25.0 reads a flag it does not know as a file path instead;
`ssl_diagnose` detects the resulting phantom entry and fails with an
explicit message rather than returning wrong results. Either way, the fix
is `bun run fetch-lsp`.

From v0.25.0 the formatter passes a SQL-mode data source through unchanged
only when the input is classified as a data source, by a `.ds`/`.ds.txt`
path or `--ds`, so `ssl_format` takes `isDataSource` for data-source content
passed as `code`, as `ssl_diagnose` does.

The `ssl_diagnose` and `ssl_format` tools require the `starlims-lsp` binary
in `bin/lsp/` (gitignored — binaries are not tracked in this repository).
`bun run fetch-lsp` downloads the release pinned in `lsp-version.json` for
the current platform; add `--all` for every platform, or pass a tag
(`bun run fetch-lsp v0.28.2`) to fetch that version and move the pin.
Maintainers with a sibling `starlims-lsp` checkout can build instead with
`bun run bundle-lsp` (requires Go), or `bun run bundle-lsp --copy` to copy
already-built binaries.

The binaries come from
[starlims-lsp](https://github.com/mahoskye/starlims-lsp), distributed under
the MIT license; third-party license texts for its statically linked Go
modules are attached to each release as `THIRD-PARTY-NOTICES.md`.

Run the server through the Bun CLI entrypoint:

```bash
bun bin/ssl-mcp-server.ts
```

Build `dist/` only if you need emitted output:

```bash
bun run build
```

## MCP Client Setup

Configure your MCP client to launch the server with Bun:

```json
{
  "mcpServers": {
    "ssl-reference": {
      "command": "bun",
      "args": ["ssl-mcp-server/bin/ssl-mcp-server.ts"],
      "cwd": "/absolute/path/to/ssl-style-guide"
    }
  }
}
```

Notes:

- `command` is `bun`, so the target machine needs Bun installed and on `PATH`.
- `args` points to the Bun CLI wrapper, so normal MCP use does not require a
  prebuilt `dist/`.
- `cwd` must be the local absolute path to this repository on that machine.
- The launch path is shell-independent because the MCP client executes `bun`
  directly.

Windows example:

```json
{
  "mcpServers": {
    "ssl-reference": {
      "command": "bun",
      "args": ["ssl-mcp-server/bin/ssl-mcp-server.ts"],
      "cwd": "C:/dev/ssl-style-guide"
    }
  }
}
```

## Source Data

Bundled runtime files:

- `data/ssl-element-reference.json` — full element inventory (460 elements:
  keywords, operators, literals, types, classes, special forms, functions,
  return objects) with signatures, parameters, methods, and related metadata
- `data/ssl-element-meta.json` — per-element exceptions, caveats, best
  practices, categories, and aliases overlaid onto the inventory at startup
- `data/ssl-style-guide.schema.yaml`
- `data/ssl_agent_instructions.md`
- `data/ssl_refactoring_guide.md`
- `data/ssl-ebnf-grammar.md`
- `data/machine/` — compact foundation and searchable category packs for agent
  context retrieval
- `data/rules.json` — every style rule record (id, level, severity, rule text,
  rationale, exceptions, good and bad examples, enforcement, categories),
  generated from `rules/` by `tools/generate-rules.mjs`

`ssl_server_script_style.md` and `sql-canonical-compact-reference.md` are not
bundled; agents read them from the repository.

The element inventory and metadata are vendored from the published
[starlims-ssl-reference](https://github.com/mahoskye/starlims-ssl-reference)
repo: `ssl-element-reference.json` is generated by
`tools/generate_element_reference.py` from a sibling checkout (`../ssl-docs`).
See *Re-vendoring reference data* in `CONTRIBUTING.md` for the full order. The
MCP server flattens the per-category buckets into a single name-keyed index at
startup.

Refresh the bundled data after any canonical file changes:

```bash
# from repo root
bun tools/generate-rules.mjs
bun tools/generate-machine-docs.mjs

# from ssl-mcp-server/
bun run bundle-data
bun run check:consistency
```

## Tools

| Tool | Description |
|------|-------------|
| `ssl_lookup` | Look up an SSL element by exact name or symbol |
| `ssl_search` | Search by partial name or keyword, with optional type filter |
| `ssl_signature` | Return documented syntax and related details for functions and classes |
| `ssl_validate_naming` | Check Hungarian notation compliance for a variable name |
| `ssl_style_rule` | Return one style rule by `id` (full record), or the style guide sections for a `topic` |
| `ssl_rules` | Search and list style rules by domain, category, applies_to, level, severity, enforcement or text |
| `ssl_category` | List functions by category, or list all categories |
| `ssl_context_pack` | Retrieve compact machine documentation by category, alias, task, or element name |
| `ssl_diagnose` | Validate SSL code for syntax errors, style violations, and common mistakes (strict agent profile) |
| `ssl_format` | Format SSL code using canonical style-guide rules |

## Resources

| URI | Content |
|-----|---------|
| `ssl://elements/{name}` | Full element record as JSON |
| `ssl://classes/{name}/members` | Class methods and properties |
| `ssl://categories` | All category names |
| `ssl://categories/{name}` | Functions in a category |
| `ssl://keywords` | All keyword elements |
| `ssl://operators` | All operator elements |
| `ssl://style-guide` | Full style guide YAML |
| `ssl://style-guide/{section}` | Specific style guide section |
| `ssl://grammar` | EBNF grammar markdown |
| `ssl://language-reference` | Agent instructions |
| `ssl://refactoring-guide` | Refactoring guide markdown |
| `ssl://machine/foundation` | Compact baseline SSL rules for agents |
| `ssl://machine/categories` | Searchable machine-doc category index |
| `ssl://machine/categories/{category}` | Compact category pack |
| `ssl://rules` | Index of style rules (summaries) |
| `ssl://rules/{id}` | One style rule record as JSON |

### Style rules

Each rule in `rules/` has a stable snake_case id. `ssl_style_rule` with `id`
returns the whole record:

```json
{ "id": "equals_vs_strict_equals" }
```

The lookup also accepts the other names a rule goes by, and says which one
matched (`matched_by`):

| Input | Example | `matched_by` |
|-------|---------|--------------|
| Rule id (case and `-`/`_` insensitive) | `prefer_exitcase` | `id` |
| Earlier id in the record's `aliases` | | `alias` |
| Schema lint slug | `loop_in_finally` | `schema_slug` |
| Schema path | `lints.compile_errors.rules.loop_in_finally.message` | `schema_path` |
| starlims-lsp diagnostic or formatter code | `lsp:diag.nested_iif`, `nested_iif`, `fmt.keyword_case` | `lsp_diagnostic` / `lsp_formatter` |

When several rules share a name (one LSP diagnostic can enforce more than one
rule), the response lists their summaries; call again with one id. The
`topic` form (`{ "topic": "naming" }`) is unchanged.

`ssl_rules` filters the same records and returns summaries:

```json
{ "domain": "server-scripts", "category": "error-handling", "severity": "error" }
{ "applies_to": "sql_data_source" }
{ "enforced_by": "reviewer", "query": "transaction" }
```

With no arguments it returns rule counts per domain, category, applies_to and
level.

## Prompts

| Prompt | Description |
|--------|-------------|
| `ssl_code_review` | Structured review prompt with relevant style rules |
| `ssl_refactoring` | Refactoring prompt with the guide and style rules |

## Data Coverage

Current bundled coverage (sourced from `data/ssl-element-reference.json`):

- 460 developer-facing elements
- 330 functions
- 29 classes
- 38 keywords
- 32 operators
- 3 literals
- 8 types
- 8 special forms
- 12 return objects
- 37 function categories
- 8 Hungarian notation prefixes
- 22 machine-doc categories
- 276 style rules in 6 domains

## Testing

```bash
bun run check
bun run check:consistency
bunx @modelcontextprotocol/inspector bun bin/ssl-mcp-server.ts
```
