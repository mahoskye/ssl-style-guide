## Sources of truth

Never state an SSL rule, signature, or behavior from memory. Prior
familiarity is not verification. These sources work in any workspace;
consult them in this order:

1. **The `ssl-reference` MCP server.** `ssl_context_pack` first: it
   returns the compact foundation and a category's rules (`database`,
   `loops`, `strings`, `classes`, `data-sources`, `error-handling`,
   `simplicity`, ...). Then `ssl_lookup`, `ssl_signature` and
   `ssl_search` to verify any built-in function, class, keyword or
   operator; `ssl_style_rule` to confirm a cited rule exists at the
   severity you claim; `ssl_validate_naming` before inventing an
   identifier; `ssl_format` and `ssl_diagnose` to format and validate.
2. **The SSL skills**, by name (`ssl-lookup`, `ssl-format`,
   `ssl-review`, `ssl-unit-test`, ...). They are installed at user level
   and load when invoked; if your tool does not list them, the same
   file is `agent-guides/skills/<name>/SKILL.md` in the style guide.
3. **The checked-in code**: the neighbors of what you are changing,
   for conventions the rules leave open.

When the style guide repository is in the workspace, its narrative
guides add depth: `agent-guides/ssl_server_script_style.md` (the
server-script baseline), `agent-guides/ssl_agent_instructions.md`
(language semantics; quote it rather than paraphrasing), and
`agent-guides/ssl_refactoring_guide.md`. When they are absent, do not
search for them: the MCP packs carry their rules.

### When the MCP server is not attached

Say so once, then use this fallback and no other. Do not improvise a
third route (for example, driving the MCP server by hand over stdio).

1. **Diagnostics and formatting: the `starlims-lsp` command line**, on
   `PATH` or in the style guide's `ssl-mcp-server/bin/lsp/`. The MCP
   tools are thin wrappers around it, so it gives the same answers. An
   old build reads `--strict` as a file name: if the output names a
   file called `--strict`, the binary is too old, and diagnostics count
   as NOT RUN.
   - In place of `ssl_diagnose`:
     `starlims-lsp --validate --strict --info --hungarian-types <file>`.
     It prints JSON, one result per file, and exits 1 when any error is
     found. For data source content piped through `--stdin`, add `--ds`.
   - In place of `ssl_format`: `starlims-lsp --format <file>`, which
     writes the formatted file to standard output.
2. **Lookups: the bundled inventory**, only when the style guide is in
   the workspace: `agent-guides/machine/` (foundation and category
   packs), `ssl-style-guide/ssl-element-reference.json` and
   `ssl-element-meta.json`.

If neither is available, say so, and do not proceed on any element you
could not verify. An agent with no shell skips step 1 and states in its
report that diagnostics were not run.

Record what you used in the run record's `diagnostics:` field:
`ssl-reference MCP`, `starlims-lsp --validate --strict` (step 1), or
`bundled inventory only` (no validator ran). Diagnostics from different
routes are not interchangeable, so never record one route and report
another's output.
