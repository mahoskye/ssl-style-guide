# Changelog

This repository releases two versioned artifacts together:

- the **schema** (`metadata.version` in `ssl-style-guide/ssl-style-guide.schema.yaml`);
- the **MCP server** (`ssl-mcp-server/package.json`, mirrored in `src/constants.ts`).

Agent definitions carry their own integer `version` in their frontmatter.
Releases from 2026-10 onward are tagged `schema-vX.Y.Z` and `mcp-vX.Y.Z`. The
release process is described in [CONTRIBUTING.md](CONTRIBUTING.md#releases).
Entries before this file existed are reconstructed from the release commits.

## [Unreleased]

### Added
- Rule record `bracket_contents_align`: inside an unclosed `(`, `{` or `[`
  whose first item shares the bracket's line, continuation lines align with
  that first item; a bracket that ends its line hangs one level in, with its
  closing delimiter back at the opening line's indentation; an item that
  would not fit at the aligned column makes the bracket hang (#124).
- Schema: `formatting.bracket_continuation`, `formatting.blank_lines.between_sections`
  (1) and `formatting.blank_lines.max_consecutive` (2) (#124, #125).

### Changed
- Severities decided by the style guide (the LSP follows): `limit_public_vars` and `max_params_warning` are info, `global_assignment` is warning.
- MCP: pins starlims-lsp v0.26.0. The CLI contract is unchanged, but
  `ssl_format` output changes for most files: brackets and wrapped declaration
  lists align their contents, a blank line separates logical sections, runs
  of three or more blank lines collapse to two, unary operators attach to
  their operands, and MERGE `UPDATE SET` lays out like a plain `UPDATE`.
- `blank_line_between_sections` names its boundaries (after the declarations,
  before a control block that follows code and after its closer, before a
  section comment, before a procedure's final `:RETURN`, none at the start or
  end of a body) and is enforced by the formatter
  (`lsp:fmt.blank_lines_between_sections`) (#125).
- `no_excess_blank_lines` caps a run of blank lines at two instead of one,
  enforced by `lsp:fmt.max_consecutive_blank_lines` (#125).
- `wrapped_list_alignment` is enforced by the formatter (`lsp:fmt.indent_style`),
  which now aligns the hanging lines of a `:DECLARE`, `:PARAMETERS` or
  `:PUBLIC` list under the first item; its examples are validated SSL (#120).
- `continuation_indent_shows_structure` says a continuation outside brackets
  takes one level and points to `bracket_contents_align` for brackets; it is
  formatter-enforced. The schema's `formatting.continuation_indent` now
  describes continuations outside brackets only (#124).
- `sql_merge_layout`, the SQL reference (§2.12, §7.4) and the schema's
  `sql.formatting.statement_patterns.merge.update_set`: MERGE `UPDATE SET` ends
  its line at `SET`, and each assignment takes its own line one level in, as
  in a plain `UPDATE`. The record is formatter-enforced
  (`lsp:fmt.sql_in_strings`) apart from `DELETE WHERE` (#123).
- Rule and skill examples follow the v0.26.0 formatter layout: Good examples
  gain the section blank lines, and the `ssl-unit-test` skill example aligns
  a wrapped call argument under the bracket's first item.
- The `ssl-handoff` agent (version 9) no longer lists section blank lines as
  something the formatter leaves to it.
- MCP 1.16.0: from starlims-lsp v0.25.0, `ssl_diagnose` reports the new
  error-severity codes (`exitcase_last_in_branch`, `include_quoted_target`,
  `datasource_default_required`, `inline_default_outside_datasource`,
  `inherit_qualified_name`, `inherit_position`, `endclass_invalid`,
  `builder_directive_outside_datasource`, `empty_parameters`,
  `datasource_sql_question_placeholder`, `stray_block_keyword`), so code that
  carries one now comes back `valid: false`. `code_block_structure`,
  `unknown_token`, `scientific_notation` and `named_sql_param_unsupported` are
  now errors, and `global_assignment` is a warning.
- MCP: `ssl_diagnose` and `ssl_format` follow the starlims-lsp CLI contract. A
  usage error (exit 2, nothing on stdout) is returned as an error carrying the
  binary's stderr message, rather than parsed as output, and a file argument
  is passed after `--`. The phantom-entry guard stays for binaries older than
  v0.25.0.
- MCP: `ssl_format` takes `isDataSource` for data-source content passed as
  `code`. From v0.25.0 the formatter leaves a SQL-mode data source unchanged
  only when the input is classified as a data source, and the stability check
  now carries a `.ds` path's classification to its second pass, so a SQL-mode
  data source file no longer reports as unstable.
- Rule records now cite the starlims-lsp diagnostic that enforces them:
  `exitcase_last_in_branch`, `datasource_default_required`,
  `inherit_qualified_name`, `datasource_empty_parameters` (`empty_parameters`),
  `datasource_sql_at_name_placeholders` (`datasource_sql_question_placeholder`),
  `visibility_annotation_exact_form` (`visibility_annotation`) and
  `field_access_via_me` (adds `unqualified_field_read`) were reviewer-enforced
  or partly enforced; `class_ends_at_eof` (`endclass_invalid`) and
  `builder_directives_datasource_only` (`builder_directive_outside_datasource`)
  replace `unknown_keyword`, which also clears their severity disagreement.
  `no_default_on_declare_line` gets a Bad example the re-scoped
  `default_on_declare_line` reports.
- The skill-example check passes `--` before each file and reports a usage
  error from the binary instead of an unparseable result.

## Schema 1.9.0, MCP 1.15.2 — 2026-10-13

### Added
- Rule records `constructor_after_methods` (Constructor last is a style
  convention) and `branch_literal_target` (pass `Branch()` a literal target)
  (#88).

### Changed
- `branch_literal_target` is now authoritative at error severity: a computed `Branch()` target never jumps and falls through silently (verified on STARLIMS 12). Element data re-vendored from the reference.
- `class_member_order` now covers `:INHERIT`, `:DECLARE`, then methods only,
  at level `advisory`. A class that declares `Constructor` before its other
  methods compiles and runs, so the agent guide, `ssl-new-class` skill,
  schema (`classes.signature.notes`, `module_structure.class_modules`), EBNF
  and tree-sitter grammar no longer call Constructor-last a requirement; the
  tree-sitter grammar accepts methods after `Constructor` (#88).
- `.AND.`/`.OR.`: when the left operand does not decide the result, the
  right operand is returned unchanged; `:IF` conditions, like `:WHILE` and
  `:CASE`, must be logical (`no_truthy_falsy_coercion`, agent guide, schema
  `expressions.logical_evaluation`) (#88).
- Labels: matching is case-sensitive, a literal `Branch()` target that matches
  no label fails to compile, an `:ERROR` handler can branch back to a body
  label, and branching from the body into the handler raises (agent guide,
  `branch_target_label`, schema `lints.label_behavior`, EBNF note 20) (#88).
- Inline code and regions: a `:BEGININLINECODE` block is stored when execution
  reaches it; `GetInlineCode` before its block is reached; the
  block body does not run in place; region markers inside comments define
  nothing; `GetRegion` sees regions from an `:INCLUDE`d script (agent guide,
  schema) (#88).
- `CreateUdObject`: missing constructor arguments arrive as NIL and extra
  ones are ignored (agent guide, `ssl-new-class`) (#88).
- `DoProc` in class methods: only a bare procedure name is rejected; the
  schema's `class_method_restriction` and the MCP code-review prompt no longer
  read as if every `DoProc` call were rejected. The element metadata is
  refreshed from the reference (#88).

## MCP 1.15.1 — 2026-10-13

### Fixed
- MCP: templated resources (`ssl://elements/{name}`, `ssl://classes/{name}/members`, `ssl://categories/{name}`, `ssl://machine/categories/{category}`, `ssl://style-guide/{section}`) are registered as resource templates, so reading a concrete URI such as `ssl://machine/categories/loops` works. They were registered as fixed URIs with literal braces.

## Schema 1.8.0, MCP 1.15.0 — 2026-10-13

### Added
- Task-brief and run-record interfaces (`agent-guides/agent-interfaces.md`),
  wired into the planner, developer and reviewer. The README gains a *Role
  and Interfaces* section, and a *Rule proposal* issue template is added.
  `check-agent-contract.mjs` is renamed `check-agent-wiring.mjs` (#97).
- `style-calibration/`: six purpose-built review tasks with specifications,
  unapproved initial drafts and SSL tests, plus local revision and check
  tools (#99).
- A design proposal for a single rules source,
  `docs/design/rules-source.md`, adopted and implemented in #111–#117 (#105).
- This changelog, and `schema-v*` / `mcp-v*` release tags (#100).
- Rules source pilot (#101): the data-source rules are now 17 records in
  `rules/data-sources/`. `tools/generate-rules.mjs` generates the schema's
  `module_structure.data_source_modules`, the rule lists in the
  `ssl-new-datasource` skill and the agent guide's §4A, and `rules/INDEX.md`;
  the data-sources pack lists and the foundation's data-source bullets come
  from the same records. The parsed schema is unchanged.
- Rules source, SQL domain (#101): 33 records in `rules/sql/` generate the
  schema's `sql.formatting` and `sql.parameters`, the `ssl-format` skill's SQL
  rule lists, the agent guide's SQL quick-reference rules, the `database` and
  `sql` pack lists, and the foundation's SQL bullets. The parsed schema is
  unchanged.
- Rules source, server scripts (#101): 66 records in `rules/server-scripts/`
  cover file shape, banners and doc blocks, `:PARAMETERS`/`:DEFAULT` order,
  calling convention, error handling, boundary contracts, transactions,
  logging and access modifiers. They generate the schema's
  `procedures.visibility_annotations`, `error_handling.guidance` and
  `documentation.file_banner`, the transactions, procedures, error-handling,
  logging and module-structure pack lists, the foundation's server-script
  bullets, and rule regions in the `ssl-new-procedure` skill and the
  server-script baseline. The parsed schema is unchanged.
- Rules source, language (#101): 62 records in `rules/language/` cover
  keywords, semicolons and comments, statement structure, operators and
  equality, types and `NIL`, arrays, formatting and variable behavior, plus
  `sqlexecute_no_values_array` in `rules/sql/`. They generate the schema's
  `comments.rules` and most `lints` subtrees, the control-flow, loops,
  strings, arrays, dates, formatting, types and operators pack lists, the
  foundation's language bullets and its whole "SSL Does Not Have" list, and
  rule regions in the review, refactor and new-procedure skills and the
  agent guide's style quick start. The parsed schema is unchanged.
- Rules source, classes (#101): 19 records in `rules/classes/` cover member
  order, `Me:`/`Base:` access, instantiation, `:INHERIT`, constructors and
  class-file shape. They generate the classes and objects pack lists, the
  foundation's class bullets, the class entries of `lints.class_rules`,
  `lints.compile_errors` and `lints.coding_standards`, and the
  `ssl-new-class` rule lists.
- Rules source, naming (#101): 12 records in `rules/naming/` cover Hungarian
  prefixes, length limits, casing and loop counters. They generate the
  schema's `lints.hungarian_notation` (and so the foundation's prefix table),
  the naming pack lists and the review skill's naming checks. Every foundation
  rule bullet is now generated; the `files`, `email` and `security` packs are
  the only hand-written pack lists left.
- Rules bundle (#101): `tools/generate-rules.mjs` also writes
  `rules/rules.json`, every rule record as data (id, level, severity,
  applies_to, rule text, rationale, exceptions, examples, enforcement,
  categories, related elements, schema paths). `--check` covers it, and
  `bundle-data` copies it to `ssl-mcp-server/data/rules.json`.
- MCP: `ssl_style_rule` takes an `id` and returns the full rule record. It
  also resolves a schema lint slug or path (`loop_in_finally`,
  `lints.compile_errors.rules.loop_in_finally.message`) and a starlims-lsp
  code (`lsp:diag.nested_iif`), and reports how it matched. The `topic` form
  is unchanged.
- MCP: new `ssl_rules` tool searches and lists rules by domain, category,
  applies_to, level, severity, enforcement or text, and new resources
  `ssl://rules` and `ssl://rules/{id}` serve the rule index and single
  records.
- `generate-rules.mjs --strict-severity` fails when a record's severity
  differs from the default severity of the LSP diagnostic that enforces it
  (D11). It is off by default, and CI does not pass it yet.
- Rules source, skills (#101 phase 3): the rule statements in every skill
  are now generated regions: the `ssl-review` check lists and additional
  checks, the `ssl-refactor` workflow steps, `ssl-new-procedure` step 6, the
  `ssl-format` SSL scope, the data-source notes of the review, refactor,
  refactor-plan and format skills, and the `ssl-unit-test` rule items.
  21 new records hold the statements that had none, among them the SSL
  indentation, spacing, line-length and blank-line rules, parameter defaults
  by type, `udobject_array_in_clause`, `no_hardcoded_credentials` and
  `validate_dynamic_call_targets`. No pack list changes.
- Rules source, guides (#101 phase 4): the rule lists, checklists and
  rule-like gotchas of the agent guide (quick start, §2, SQL guidance, §5,
  §7, §8), the refactoring guide (layout and data-source rules, Part 3
  formatting, Part 4 naming, Part 7 notes, the Part 8 checklists, the
  quick-reference class rules), the server-script baseline (every rule list)
  and the `_shared` quality bar are generated from records. Mixed items keep
  their facts hand-written beside inline rules. 45 new records, among them
  `bare_logical_operator`, `dot_property_access`, `global_assignment`,
  `exitcase_after_return`, `format_arg_not_array`, `runsql_non_dml`,
  `unicode_literal_prefix` and `unjustified_collate` (all starlims-lsp
  slugs), and the server-script baseline's banner, declaration-group,
  control-flow, SQL and transaction rules. `no_flag_builder_directives` now
  names the directives and says not to flag them. Region `format=checklist`
  is new. `ssl-developer` is v24 (quality bar).

### Changed
- Element data is re-vendored from the published reference: 118 of 460
  elements changed. The drift check now compares content, not only names
  and totals, and reports drift as a warning (`--strict` makes it an
  error) (#94).
- Language corrections across the guides, schema, EBNF and skills. `:ERROR`
  is a trailing handler that protects the statements before it. Class,
  object, data-source, SQL-call, type, member, scope and naming claims are
  corrected, along with assignment targets and access modifiers. Claims are
  re-checked against the published reference (#96, #103, #104).
- Agent tuning: a severity rubric in `ssl-review`, one fallback when the MCP
  server is not attached, a cleanup worked example in the server-script
  guide, and several guide contradictions resolved. Agent versions:
  developer 23, reviewer 15, planner 12, handoff 8, docwriter 4 (#107).
- Tree-sitter: comments parse (the comment token never matched before), the
  joined label form `:LABELName;` gets its own field, and label names and
  the `/*@private;` and `/*@protected;` forms are highlighted. The EBNF
  models `:ERROR` as a trailing handler and assignment as an expression
  (#102).
- README, CONTRIBUTING and the agent, Tree-sitter and MCP READMEs describe
  the repository after the drift audit: its role, the nine skills and six
  agents, sibling checkouts, rule proposals and the full check list (#92).
- `ssl-refactor-plan` writes specs under `docs/specs/`, matching the agents.
- The `ssl-new-datasource` SQL template packs its column list, following the
  compact SQL rules that `ssl-format` applies to data-source bodies.
- `ssl-format` marks its `MERGE` rules as rules for formatting existing code.
  Agents do not write `MERGE`.
- The README no longer hard-codes the schema version.
- The schema's `last_updated` now matches the 1.7.2 release date.
- SQL `CASE` layout follows the formatter: `WHEN`/`ELSE` 4 spaces under
  `CASE`, `END` aligned with `CASE`. The schema, the agent guide and
  `ssl-format` said 2 (#106).

### Removed
- The `agent-quality-lab/` ignore entry. The lab now lives in its own
  private repository.
## MCP 1.14.0 — 2026-09-21
- Agent roster rework. The MCP server's validation runs with strict
  diagnostics, which needs starlims-lsp v0.24.0 or later.

## Schema 1.7.2, MCP 1.12.1 — 2026-09-20
- An explicit `+` exponent sign (`9.0E+1`) is valid (#73).
- Pins starlims-lsp v0.22.0, then v0.23.0.

## MCP 1.12.0 — 2026-08-29
- Validation passes `--hungarian` and `--hungarian-types`. Pins starlims-lsp
  v0.19.0 to v0.21.0.

## Schema 1.7.1, MCP 1.11.1 — 2026-08-28
- Adopts the server-script style baseline (#56).

## Schema 1.7.0, MCP 1.11.0 — 2026-08-28
- SQL identifier casing depends on the dialect, and is preserved by default.
- Validation always passes `--info`. Pins starlims-lsp v0.18.0.

## MCP 1.10.0 — 2026-08-28
- Pins starlims-lsp v0.17.0.

## Schema 1.6.0, MCP 1.9.0 — 2026-08-08
- Documents data-source comments, `@name` placeholders and defaults, the
  scope of `DoProc` in classes, and the 0-based indexing exception for .NET.
- Pins starlims-lsp v0.16.0.

## Schema 1.5.0, MCP 1.8.0 — 2026-08-07
- Adds the `KEEP (DENSE_RANK ...)` layout section to the SQL reference.

Earlier versions (schema 1.3.0 to 1.4.x, MCP 1.4.0 to 1.7.0, March–July 2026)
predate release commits. See the git history.
