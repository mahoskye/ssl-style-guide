# ssl-mcp-server

MCP server for SSL (STARLIMS Scripting Language v11) reference data. Exposes 457 SSL elements, style guide rules, grammar, and language reference to any MCP-compatible client.

## Quick Start

```bash
cd ssl-mcp-server
bun install
```

Run the server through the Bun CLI entrypoint:

```bash
bun bin/ssl-mcp-server.ts
```

The project keeps strict TypeScript enabled through `tsconfig.json`. To type-check or emit `dist/`:

```bash
bun run check
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
- `args` points at the Bun CLI wrapper, so a prebuilt `dist/` is not required for normal MCP use.
- `cwd` should be the local absolute path to the repo root on that machine. Do not copy the path from another machine unchanged.
- This launch path is shell-independent: the MCP client executes `bun` directly, so it does not rely on Bash, `sh`, or Unix-only wrapper scripts.

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

## Tools

| Tool | Description |
|------|-------------|
| `ssl_lookup` | Look up an SSL element by exact name or symbol (e.g. `SQLExecute`, `:IF`, `==`, `.T.`) |
| `ssl_search` | Search by partial name or keyword, with optional type filter |
| `ssl_signature` | Full signature and parameter details for functions and classes |
| `ssl_validate_naming` | Check Hungarian notation compliance for a variable name |
| `ssl_style_rule` | Get style guide rules for a topic (naming, formatting, sql, etc.) |
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
| `ssl://language-reference` | Agent instructions / language reference |

## Prompts

| Prompt | Description |
|--------|-------------|
| `ssl_code_review` | Structured review with relevant style rules |
| `ssl_refactoring` | Refactoring prompt with full guide and style rules |

## Data Coverage

- 457 developer-facing elements
- 354 functions, 26 classes, 38 keywords, 32 operators, 3 literals, 4 special forms
- 38 function categories
- 8 Hungarian notation prefixes

## Testing

```bash
bunx @modelcontextprotocol/inspector bun bin/ssl-mcp-server.ts
```
