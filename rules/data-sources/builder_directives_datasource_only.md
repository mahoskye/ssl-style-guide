---
id: builder_directives_datasource_only
title: Builder directives exist only in SQL data sources
domain: data-sources
status: active
level: authoritative
severity: error
applies_to: [server_script, class]
rule: >-
  Do not treat builder directives as reusable SSL keywords outside
  data-source contexts.
categories: [data-sources]
machine: { list: avoid }
related_elements: [RunDS]
enforced_by: [lsp:diag.builder_directive_outside_datasource]
verification:
  basis: reference
  note: >-
    Kept from the data-sources pack. The agent guide says the directives only
    exist in SQL data source files and are handled before the script runs.
    starlims-lsp reports a directive outside a data source as
    builder_directive_outside_datasource, an error (from v0.25.0; earlier
    releases reported an unknown_keyword warning).
---

## Rationale

`:DSN`, `:TABLENAME`, `:NULLASBLANK` and `:INVARIANTDATECOLUMNS` are read by the
SQL data source builder. They are not SSL keywords, so in a server script or a
class file they are errors. To get data through a data source from a
script, call the data source with `RunDS`.

## Examples

### Good

```ssl
:DECLARE aRows;

aRows := RunDS("Samples.ByStatus", {"A"});
```

### Bad

```ssl
:PROCEDURE LoadSamples;
:DSN := DATABASE;
:RETURN 1;
:ENDPROC;
```
