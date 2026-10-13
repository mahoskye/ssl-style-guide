# Rules source

Each SSL rule is written once, as one record in this directory. The schema,
the machine packs, and the rule lists in skills and guides are generated from
the records and checked in CI. The design is in
[docs/design/rules-source.md](../docs/design/rules-source.md) (#101).

**Pilot status:** only the `data-sources` domain is migrated. Every other rule
is still hand-written where it always was.

## Layout

| Path | What it holds |
|---|---|
| `<domain>/<id>.md` | One rule record. `<domain>` is `language`, `server-scripts`, `data-sources`, `sql`, `classes` or `naming`. |
| `categories.yaml` | Machine-pack category ids, and for each generated category the order its rules appear in. |
| `schema-base.yaml` | The non-rule content of the schema's generated regions, with a `!rule <id>` slot wherever a record supplies the value. |
| `INDEX.md` | Generated. One table per domain. |

## What is generated from what

| Output | From | Generator |
|---|---|---|
| `rules/INDEX.md` | all records | `tools/generate-rules.mjs` |
| `module_structure.data_source_modules` in `ssl-style-guide/ssl-style-guide.schema.yaml` (between the `BEGIN GENERATED` / `END GENERATED` comments) | `schema-base.yaml` plus each record's `schema` placements | `tools/generate-rules.mjs` |
| Regions between `<!-- rules: … -->` and `<!-- /rules -->` in `agent-guides/` and `ssl-style-guide/` Markdown | the selected records' `rule` text | `tools/generate-rules.mjs` |
| `must_follow` / `avoid` in `agent-guides/machine/categories/data-sources.json` | records with `machine.list`, in `categories.yaml` order | `tools/generate-machine-docs.mjs` |
| Data-source bullets in `agent-guides/machine/foundation.md` | records with `machine.foundation: non_negotiable` | `tools/generate-machine-docs.mjs` |

Placements outside a generated region (for example
`module_structure.class_file_constraint.rule`) are not written; the check
fails if the hand-maintained schema disagrees with them. Likewise, a record in
a category that is not generated yet must appear word for word in that
category's hard-coded list.

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
machine: { list: must_follow, foundation: non_negotiable }   # optional
related_elements: [PARAMETERS, RunDS]  # optional; names from ssl-element-reference.json
enforced_by: [reviewer]                # lsp:diag.<slug> | lsp:fmt.<slug> | reviewer | none
schema:                                # optional placements in the schema
  - path: module_structure.data_source_modules.lint_rules
    form: lint                         # lint | rule_text | value
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

## Including rules in a guide or skill

Put an empty region where the list belongs and run the generator:

```markdown
<!-- rules: domain=data-sources applies_to=ssl_data_source,sql_data_source wrap=80 -->
<!-- /rules -->
```

Selectors are `id=`, `category=`, `domain=`, `level=` and `applies_to=`.
Selectors combine with AND; comma-separated values within one selector
combine with OR. `format=bullets` (the default) or `format=table` chooses the
layout, and `wrap=<column>` wraps bullets. For a single rule inside a
sentence, use `<!-- rule: <id> --><!-- /rule -->`. Never edit the text inside
a region by hand.

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
   bun tools/generate-rules.mjs --check --lsp-catalog ../starlims-lsp/catalog
   bun tools/check-skill-examples.mjs
   cd ssl-mcp-server && bun run check:consistency
   ```

`--lsp-catalog` points at a starlims-lsp checkout (CI uses the tag pinned in
`ssl-mcp-server/lsp-version.json`). Without the flag, the catalog check is
skipped when `../starlims-lsp` is absent. The checker warns, without failing,
when a record's severity differs from the diagnostic's default severity, when
a record is active but the catalog entry with its slug is removed, and when a
catalog `schema_ref` into a generated region does not resolve.

A change to the generated schema is a schema change: add a CHANGELOG line, and
bump `metadata.version` at release as usual.
