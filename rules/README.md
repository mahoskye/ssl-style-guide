# Rules source

Each SSL rule is written once, as one record in this directory. The schema,
the machine packs, and the rule lists in skills and guides are generated from
the records and checked in CI. The design is in
[docs/design/rules-source.md](../docs/design/rules-source.md) (#101).

**Migration status:** all six domains are migrated (`language`,
`server-scripts`, `data-sources`, `sql`, `classes` and `naming`). The rule
statements of every skill (phase 3), and the rule lists, checklists and
rule-like gotchas of the agent guide, the refactoring guide, the
server-script baseline and the `_shared` quality bar (phase 4), are
generated regions. Rule text that is still hand-written: the `files`,
`email` and `security` pack lists in `CATEGORY_DEFS`, schema entries outside
the generated subtrees that no record places, rules stated inside narrative
paragraphs (for example the server-script baseline's "Main Orchestration"),
the SQL compact reference, and the `_shared/boundaries.md` partial.

## Layout

| Path | What it holds |
|---|---|
| `<domain>/<id>.md` | One rule record. `<domain>` is `language`, `server-scripts`, `data-sources`, `sql`, `classes` or `naming`. |
| `categories.yaml` | Machine-pack category ids, and for each generated category the order its rules appear in. |
| `schema-base.yaml` | The non-rule content of the schema's generated regions, with a `!rule <id>` slot wherever a record supplies the value. |
| `INDEX.md` | Generated. One table per domain. |
| `rules.json` | Generated. The machine-readable rules bundle (see below). |

## What is generated from what

| Output | From | Generator |
|---|---|---|
| `rules/INDEX.md` | all records | `tools/generate-rules.mjs` |
| `rules/rules.json`, copied to `ssl-mcp-server/data/rules.json` | all records | `tools/generate-rules.mjs`, then `bun run bundle-data` in `ssl-mcp-server/` |
| The subtrees of `ssl-style-guide/ssl-style-guide.schema.yaml` named in `schema-base.yaml` (between their `BEGIN GENERATED` / `END GENERATED` comments): `comments.rules`; `lints.style_rules`, `lints.hungarian_notation`, `lints.not_preferred_operators`, `lints.compile_errors`, `lints.type_safety`, `lints.variable_behavior`, `lints.label_behavior`, `lints.parameter_skipping_style`, `lints.class_rules`, `lints.coding_standards` and `lints.deprecated_keywords`; `procedures.visibility_annotations`; `error_handling.guidance`; `documentation.file_banner`; `module_structure.data_source_modules`; `sql.formatting` and `sql.parameters` | `schema-base.yaml` plus each record's `schema` placements | `tools/generate-rules.mjs` |
| Regions between `<!-- rules: … -->` and `<!-- /rules -->` in `agent-guides/` and `ssl-style-guide/` Markdown | the selected records' `rule` text | `tools/generate-rules.mjs` |
| `must_follow` / `avoid` in `agent-guides/machine/categories/<id>.json` for each category with `lists_from_rules: true` | records with `machine.list`, in that category's `order` | `tools/generate-machine-docs.mjs` |
| Every bullet of the Non-Negotiable and Does Not Have lists in `agent-guides/machine/foundation.md` | records with `machine.foundation: non_negotiable` or `does_not_have`, each placed by `renderFoundation` | `tools/generate-machine-docs.mjs` |

Placements outside a generated region (for example
`module_structure.class_file_constraint.rule`) are not written; the check
fails if the hand-maintained schema disagrees with them. A `text` placement is
a plain string, either a value or one entry of a list of strings; a `lint` or
`rule_text` placement matches a list entry on the keys it supplies, so the
entry may carry more (such as a lint's `scope` note). Likewise, a record in
a category that is not generated yet must appear word for word in that
category's hard-coded list.

A path addresses an entry of a list of mappings through the entry's `rule`,
`keyword` or `operator` value. So
`lints.compile_errors.rules.one_class_per_file.message` is the `message` of
the compile-error entry whose `rule` is `one_class_per_file`, and
`lints.deprecated_keywords.:LABEL.message` is the message of the `:LABEL`
entry. A record whose id is not the entry's slug, or whose entry carries keys
a `lint` placement cannot produce (`scope`, `threshold`, `replacement`),
supplies only the message this way; the other keys stay in
`schema-base.yaml`.

## Record format

```markdown
---
id: datasource_default_required        # snake_case, equals the filename
title: Every data-source parameter has an inline default
domain: data-sources                   # equals the directory
status: active                         # draft | active | deprecated | removed
level: authoritative                   # authoritative | style_only | advisory
severity: error                        # error | warning | info | hint
applies_to: [ssl_data_source, sql_data_source]
rule: >-                               # one imperative line; Markdown code spans allowed
  Give every data-source parameter an inline `:=` default; ...
categories: [data-sources]             # ids from categories.yaml
machine: { list: must_follow, foundation: non_negotiable }   # optional; list and/or
                                       # foundation (non_negotiable | does_not_have)
related_elements: [PARAMETERS, RunDS]  # optional; names from ssl-element-reference.json
enforced_by: [reviewer]                # lsp:diag.<slug> | lsp:fmt.<slug> | reviewer | none
schema:                                # optional placements in the schema
  - path: module_structure.data_source_modules.lint_rules
    form: lint                         # lint | rule_text | text | value
    message: >-                        # optional; defaults to the rule text
      ...
  - path: module_structure.data_source_modules.file_types.sql_data_source.parameters.default_required
    form: value
    value: true
verification:
  basis: observed                      # reference | observed | convention
  note: What was checked, and where the kept wording came from.
issues: ["#82"]                        # optional
aliases: []                            # optional; earlier ids
---

## Rationale       (required)
## Exceptions      (optional)
## Examples        (required for active records: ### Good and ### Bad)
## Notes           (optional, never generated)
```

Unknown frontmatter fields, unknown sections, and duplicate ids fail the
check. In the examples, a `ssl` fence is validated as a script, a
`ssl kind=ds` fence as a data source (SSL or SQL mode, by content), and a
`text` fence is illustration only. Good fences must validate with no errors or
warnings under the strict profile (and `ssl` fences must be formatter-clean).
For each `lsp:diag.<slug>` in `enforced_by`, every Bad fence must produce that
diagnostic and no Good fence may.

## Rules bundle

`rules/rules.json` holds every record in record order, for tools that need
rules as data. The MCP server serves it through `ssl_style_rule` (by id),
`ssl_rules` (search and listing) and `ssl://rules/{id}`.

```json
{
  "format": 1,
  "generated_by": "tools/generate-rules.mjs",
  "domains": ["language", "server-scripts", "data-sources", "sql", "classes", "naming"],
  "count": 209,
  "rules": [
    {
      "id": "keyword_uppercase",
      "title": "Keywords are uppercase and case-sensitive",
      "domain": "language",
      "status": "active",
      "level": "authoritative",
      "severity": "error",
      "applies_to": ["server_script", "class", "ssl_data_source"],
      "rule": "Colon-prefixed SSL keywords are uppercase and case-sensitive, ...",
      "rationale": "Markdown text of ## Rationale",
      "exceptions": null,
      "examples": { "good": [{ "lang": "ssl", "code": "..." }], "bad": [...] },
      "enforced_by": ["lsp:diag.keyword_uppercase", "lsp:fmt.keyword_case"],
      "categories": ["control-flow"],
      "related_elements": ["IF", "BEGINCASE", "PROCEDURE"],
      "schema_paths": ["keywords.case", "language_features.case_sensitivity.keywords"],
      "aliases": [],
      "issues": [],
      "source": "rules/language/keyword_uppercase.md"
    }
  ]
}
```

`exceptions` is the `## Exceptions` text or `null`; `examples[].lang` is the
fence kind (`ssl`, `ssl kind=ds` or `text`). `## Notes` and `verification`
are maintainer material and are not in the bundle. `format` changes only when
a field is renamed or removed; new fields may be added without a change.

## Including rules in a guide or skill

Put an empty region where the list belongs and run the generator:

```markdown
<!-- rules: domain=data-sources applies_to=ssl_data_source,sql_data_source wrap=80 -->
<!-- /rules -->
```

Selectors are `id=`, `category=`, `domain=`, `level=` and `applies_to=`.
Selectors combine with AND; comma-separated values within one selector
combine with OR. A region selected only by `id=` lists its rules in the order
it names them; any other region uses record order. `format=bullets` (the
default), `format=table` (rule, level and severity) or `format=checklist`
(`- [ ] rule`, for validation checklists) chooses the layout, and
`wrap=<column>` wraps bullets and checklist items. For a single rule inside a
sentence, use `<!-- rule: <id> --><!-- /rule -->` on one line; the guides use
it to keep a rule next to the hand-written facts that explain it, as in the
agent guide's quick start and gotchas. Never edit the text inside a region by
hand.

A region holds rule statements only. Keep workflow steps, explanations,
examples and facts (what the language does) hand-written around it, with a
short lead-in where the list needs one, such as "Flag code that breaks these
rules:". If a guide states a rule that no record holds, add the record
first.

## Adding or changing a rule

1. Edit or add `rules/<domain>/<id>.md`. For a new record in a generated
   category, add its id to that category's `order` in `categories.yaml`. If it
   supplies a schema value, add a `!rule <id>` slot in `schema-base.yaml`.
2. Regenerate, in this order:

   ```bash
   bun tools/generate-rules.mjs
   bun tools/generate-machine-docs.mjs
   cd ssl-mcp-server && bun run bundle-data && cd ..
   ```

3. Check:

   ```bash
   bun tools/generate-rules.mjs --check --lsp-catalog ../starlims-lsp/catalog --strict-severity
   bun tools/check-skill-examples.mjs
   cd ssl-mcp-server && bun run check:consistency
   ```

`--lsp-catalog` points at a starlims-lsp catalog directory and reads it as it
is (CI checks out the tag pinned in `ssl-mcp-server/lsp-version.json`).
Without the flag, the checker reads the catalog from the sibling
`../starlims-lsp` git checkout at that pinned tag, whatever the checkout has
checked out. When the tag isn't in the checkout, the catalog check is skipped
with a warning naming the checkout's version and the pin (fetch its tags to fix
it); when `../starlims-lsp` is absent, it is skipped with a note. The checker warns, without failing,
when a record's severity differs from the diagnostic's default severity, when
a record is active but the catalog entry with its slug is removed, and when a
catalog `schema_ref` into a generated region does not resolve.

### Severity agreement with the LSP

A record's `severity` should equal the `default_severity` of each
`lsp:diag.<slug>` in its `enforced_by`. By default a disagreement is a
warning. `--strict-severity` makes it a failure (and requires the catalog, so a skipped
catalog check fails too):

```bash
bun tools/generate-rules.mjs --check --lsp-catalog ../starlims-lsp/catalog --strict-severity
```

CI passes `--strict-severity`: every record agrees with starlims-lsp
v0.28.1, the pinned version. The style guide decides the severity and the LSP
follows, so a record whose severity changes ahead of the LSP fails the check
until the pinned LSP release defaults to the same severity.

A change to the generated schema is a schema change: add a CHANGELOG line, and
bump `metadata.version` at release as usual.
