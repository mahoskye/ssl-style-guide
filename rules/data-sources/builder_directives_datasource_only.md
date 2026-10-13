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
enforced_by: [lsp:diag.unknown_keyword]
verification:
  basis: reference
  note: >-
    Kept from the data-sources pack. The agent guide says the directives only
    exist in SQL data source files and are handled before the script runs.
---

## Rationale

`:DSN`, `:TABLENAME`, `:NULLASBLANK` and `:INVARIANTDATECOLUMNS` are read by the
SQL data source builder. They are not SSL keywords, so in a server script or a
class file they are unknown keywords. To get data through a data source from a
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
