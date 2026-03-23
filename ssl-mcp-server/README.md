# ssl-mcp-server

MCP server for the repository's public SSL reference data.

It serves the bundled element inventory, style guide, EBNF grammar, agent
instructions, and refactoring guide to MCP-compatible clients. The data under
`ssl-mcp-server/data/` is a checked-in mirror of the canonical public files in
the repository root plus bundled reference inventories.

## Quick Start

```bash
cd ssl-mcp-server
bun install
bun run check
```

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

- `data/ssl-element-list.json`
- `data/class-member-validation.json`
- `data/ssl-style-guide.schema.yaml`
- `data/ssl_agent_instructions.md`
- `data/ssl_refactoring_guide.md`
- `data/ssl-ebnf-grammar.md`

Refresh the mirrored data after canonical doc updates:

```bash
bun scripts/bundle-data.mjs
```

## Tools

| Tool | Description |
|------|-------------|
| `ssl_lookup` | Look up an SSL element by exact name or symbol |
| `ssl_search` | Search by partial name or keyword, with optional type filter |
| `ssl_signature` | Return signature and parameter details for functions and classes |
| `ssl_validate_naming` | Check Hungarian notation compliance for a variable name |
| `ssl_style_rule` | Return style guide rules for a topic |
| `ssl_category` | List functions by category, or list all categories |

## Resources

| URI | Content |
|-----|---------|
| `ssl://elements/{name}` | Full element record as JSON |
| `ssl://classes/{name}/members` | Class methods and properties with validation detail |
| `ssl://categories` | All category names |
| `ssl://categories/{category}` | Functions in a category |
| `ssl://keywords` | All keyword elements |
| `ssl://operators` | All operator elements |
| `ssl://style-guide` | Full style guide YAML |
| `ssl://style-guide/{section}` | Specific style guide section |
| `ssl://grammar` | EBNF grammar markdown |
| `ssl://language-reference` | Agent instructions |
| `ssl://refactoring-guide` | Refactoring guide markdown |

## Prompts

| Prompt | Description |
|--------|-------------|
| `ssl_code_review` | Structured review prompt with relevant style rules |
| `ssl_refactoring` | Refactoring prompt with the guide and style rules |

## Data Coverage

Current bundled coverage:

- 457 developer-facing elements
- 354 functions
- 26 classes
- 38 keywords
- 32 operators
- 3 literals
- 4 special forms
- 38 function categories
- 8 Hungarian notation prefixes

Of the 26 classes, 22 are directly instantiable built-ins and 4 are
return-value-only types.

## Testing

```bash
bun run check
bunx @modelcontextprotocol/inspector bun bin/ssl-mcp-server.ts
```
