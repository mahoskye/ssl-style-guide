---
id: no_flag_builder_directives
title: Builder directives are valid in SQL data sources
domain: data-sources
status: active
level: authoritative
severity: info
applies_to: [sql_data_source]
rule: >-
  SQL data-source builder directives are preprocessed before compilation and
  are not normal SSL keywords.
categories: [data-sources]
machine: { list: must_follow }
enforced_by: [reviewer]
schema:
  - path: module_structure.data_source_modules.lint_rules
    form: lint
    message: >-
      :DSN, :TABLENAME, :NULLASBLANK, :INVARIANTDATECOLUMNS are valid builder
      directives in SQL data source files.
verification:
  basis: reference
  note: >-
    Kept from the data-sources pack; the schema lint message is kept verbatim.
    starlims-lsp has no catalog entry for this slug: it accepts the directives
    in data source files without reporting them.
---

## Rationale

`:DSN`, `:TABLENAME`, `:NULLASBLANK` and `:INVARIANTDATECOLUMNS` configure how
a SQL data source runs. The builder handles them before the data source runs,
so they are not part of the SSL keyword set. A reviewer or formatter must not
report them as unknown keywords, and must not remove them.

## Examples

### Good

```ssl kind=ds
:DSN := DATABASE;
:TABLENAME := sampleList;
:NULLASBLANK := true;
:INVARIANTDATECOLUMNS := createddate;
:PARAMETERS sStatus := "A";

SELECT sampleid, status, createddate
FROM sample
WHERE status = @sStatus
```

### Bad

```text
Review finding on a SQL data source: ":DSN is not an SSL keyword - remove it."
```
