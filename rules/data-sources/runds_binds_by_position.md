---
id: runds_binds_by_position
title: RunDS binds parameter values by position
domain: data-sources
status: active
level: authoritative
severity: error
applies_to: [server_script, class]
rule: >-
  Invoke data sources with `RunDS("Category.DataSourceName", {values})`; values
  bind by position in `:PARAMETERS` order, not by name. `GetDSParameters`
  returns the parameter names in that order. Do not pass `{name, value}` pairs;
  each pair is bound whole to one parameter.
categories: [data-sources]
machine: { list: must_follow }
related_elements: [RunDS, GetDSParameters, PARAMETERS]
enforced_by: [reviewer]
verification:
  basis: reference
  note: >-
    Kept from the data-sources pack, which stated it as a must-follow item and
    the {name, value} part again as an avoid item; merged here. Matches the
    agent guide and the ssl-new-datasource skill (#82).
issues: ["#82"]
---

## Rationale

`RunDS` matches the values array to the data source's `:PARAMETERS`
declaration by position; it does not look at names. A `{name, value}` pair is
one array element, so it is bound whole to one parameter. Use
`GetDSParameters(sDsName)` to see the declaration order.

## Exceptions

Trailing values left out take their inline defaults, and extra values are
ignored.

## Examples

### Good

```ssl
:DECLARE oResult;

oResult := RunDS("Samples.ByStatus", {"P", 25});
```

### Bad

```ssl
:DECLARE oResult;
oResult := RunDS("Samples.ByStatus", {{"sStatus", "P"}, {"nLimit", 25}});
```
