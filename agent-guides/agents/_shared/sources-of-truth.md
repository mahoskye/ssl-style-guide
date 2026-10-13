## Sources of truth

Never state an SSL rule, signature, or behavior from memory. Prior
familiarity is not verification. Consult in this order:

1. `agent-guides/machine/foundation.md` — baseline rules and the retrieval
   protocol. Start here, then `ssl_context_pack` for category context
   (`database`, `loops`, `strings`, `classes`, `data-sources`, ...).
2. `ssl-style-guide/ssl-style-guide.schema.yaml` — canonical,
   machine-readable SSL rules.
3. `agent-guides/ssl_server_script_style.md` — the production
   server-script baseline: file shape, documentation blocks, validation
   and boundary contracts, SQL and transaction patterns, error handling.
4. `agent-guides/ssl_agent_instructions.md` — language semantics, edge
   cases, and validated behavior. For semantics (equality, fallthrough,
   TRY/CATCH structure, data-source preprocessing, class rules), open the
   section and quote it rather than paraphrasing.
5. `agent-guides/ssl_refactoring_guide.md` — refactoring workflow,
   structure, and formatting expectations.
6. The checked-in code, when guidance is silent. Where guidance
   conflicts, prefer the schema and current code over older notes.

Use the `ssl-reference` MCP server before relying on any built-in
function, class, keyword, operator, or signature: `ssl_lookup`,
`ssl_signature`, `ssl_search` to verify elements, `ssl_style_rule` to
confirm a cited rule exists at the severity you claim, `ssl_validate_naming`
before inventing an identifier, `ssl_format` to apply canonical
formatting, and `ssl_diagnose` to validate SSL.

### When the MCP server is not attached

Say so once, then use this fallback and no other. Do not improvise a
third route (for example, driving the MCP server by hand over stdio).

1. **Diagnostics and formatting: the `starlims-lsp` command line.** The
   MCP tools are thin wrappers around it, so it gives the same answers.
   The binary is in `ssl-mcp-server/bin/lsp/`, named for the platform
   (`starlims-lsp-linux-amd64`, `starlims-lsp-darwin-arm64`,
   `starlims-lsp-windows-amd64.exe`, ...); `bun run fetch-lsp` in
   `ssl-mcp-server/` downloads it when it is missing.
   - In place of `ssl_diagnose`:
     `starlims-lsp --validate --strict --info --hungarian-types <file>` —
     the same strict profile `ssl_diagnose` runs. It prints JSON, one
     result per file, and exits 1 when any error is found. For data
     source content piped through `--stdin`, add `--ds`.
   - In place of `ssl_format`: `starlims-lsp --format <file>`, which
     writes the formatted file to standard output and leaves the file
     alone. Its output is the same as `ssl_format`'s, apart from the
     stability check that `ssl_format` adds.
2. **Lookups: the bundled inventory.** In place of `ssl_lookup`,
   `ssl_signature`, `ssl_search`, and `ssl_context_pack`, read:
   - `agent-guides/machine/category-index.json` and
     `agent-guides/machine/categories/` — compact category packs.
   - `ssl-style-guide/ssl-element-reference.json` — summaries and syntax
     for all 460 elements.
   - `ssl-style-guide/ssl-element-meta.json` — per-element exceptions,
     caveats, and best practices.

   In place of `ssl_style_rule`, read the schema directly.

An agent with no shell cannot run the command line. It skips step 1,
uses the bundled inventory, and states in its report that diagnostics
were not run.

Record what you used in the run record's `diagnostics:` field:
`ssl-reference MCP`, `starlims-lsp --validate --strict` (step 1), or
`bundled inventory only` (no validator ran). Diagnostics from different
routes are not interchangeable, so never record one route and report
another's output.

If the MCP and the bundled inventory both fail for an element, do not
proceed on it: report the uncertainty and choose a design that does not
depend on it.
