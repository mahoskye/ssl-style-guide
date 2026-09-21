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

If the MCP server is unavailable, say so once and fall back to the
bundled inventory shipped in this repo:

- `agent-guides/machine/category-index.json` and
  `agent-guides/machine/categories/` — compact category packs.
- `ssl-style-guide/ssl-element-reference.json` — summaries and syntax for
  all 460 elements.
- `ssl-style-guide/ssl-element-meta.json` — per-element exceptions,
  caveats, and best practices.

If both the MCP and the local inventory fail for an element, do not
proceed on it: report the uncertainty and choose a design that does not
depend on it.
