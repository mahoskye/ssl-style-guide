# ssl-mcp-server

MCP server for the repository's public SSL reference data.

It serves the bundled element inventory, style guide, EBNF grammar, agent
instructions, refactoring guide, and generated machine packs to MCP-compatible
clients. The data under `ssl-mcp-server/data/` is a checked-in mirror of the
canonical public files in `ssl-style-guide/` and `agent-guides/` plus bundled
reference inventories.

## Quick Start

```bash
cd ssl-mcp-server
bun install
bun run fetch-lsp    # download the pinned starlims-lsp release binary
bun run check
bun run check:consistency
```

The `ssl_diagnose` and `ssl_format` tools require the `starlims-lsp` binary
in `bin/lsp/` (gitignored — binaries are not tracked in this repository).
`bun run fetch-lsp` downloads the release pinned in `lsp-version.json` for
the current platform; add `--all` for every platform, or pass a tag
(`bun run fetch-lsp v0.18.0`) to fetch that version and move the pin.
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

`ssl-element-reference.json` is generated from the published
[starlims-ssl-reference](https://github.com/mahoskye/starlims-ssl-reference)
repo (sibling checkout, local directory name `ssl-docs`) by `tools/generate_element_reference.py` at the
repository root. The MCP server flattens the per-category buckets into a
single name-keyed index at startup.

Refresh the bundled data after canonical doc updates or after regenerating
the element reference:

```bash
# from repo root
python3 tools/generate_element_reference.py
bun tools/generate-machine-docs.mjs

# from ssl-mcp-server/
bun scripts/bundle-data.mjs
bun run check:consistency
```

## Tools

| Tool | Description |
|------|-------------|
| `ssl_lookup` | Look up an SSL element by exact name or symbol |
| `ssl_search` | Search by partial name or keyword, with optional type filter |
| `ssl_signature` | Return documented syntax and related details for functions and classes |
| `ssl_validate_naming` | Check Hungarian notation compliance for a variable name |
| `ssl_style_rule` | Return style guide rules for a topic |
| `ssl_category` | List functions by category, or list all categories |
| `ssl_context_pack` | Retrieve compact machine documentation by category, alias, task, or element name |
| `ssl_diagnose` | Validate SSL code for syntax errors, style violations, and common mistakes |
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

## Testing

```bash
bun run check
bun run check:consistency
bunx @modelcontextprotocol/inspector bun bin/ssl-mcp-server.ts
```
