---
id: regions_group_related_procedures
title: Regions group related procedures
domain: server-scripts
status: active
level: style_only
severity: info
applies_to: [server_script, class]
rule: >-
  Use regions for meaningful groups of related procedures; do not create one
  region per procedure.
categories: [module-structure]
enforced_by: [reviewer]
verification:
  basis: convention
  note: >-
    Kept from the server-script baseline ("File Shape"). It also says a short
    script with no local procedures needs no regions, and "Main
    Orchestration" says not to force regions into a short linear service.
---

## Rationale

A region earns its place by folding away a responsibility a reader can skip.
One region per procedure only adds a pair of comment lines around each
procedure.

## Examples

### Good

```text
/* region Request validation;   BuildRequest, ValidateRoute
/* region Status writes;        WriteStatus, WriteAudit
```

### Bad

```text
/* region BuildRequest;   BuildRequest
/* region ValidateRoute;  ValidateRoute
/* region WriteStatus;    WriteStatus
```
