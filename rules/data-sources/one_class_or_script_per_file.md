---
id: one_class_or_script_per_file
title: A file is a class, a script or a data source
domain: data-sources
status: active
level: authoritative
severity: error
applies_to: [server_script, class, ssl_data_source, sql_data_source]
rule: >-
  One file should represent either a class definition, a script, or a data
  source.
categories: [data-sources, module-structure]
machine: { list: must_follow }
related_elements: [CLASS, PROCEDURE, PARAMETERS]
enforced_by: [lsp:diag.class_or_script]
schema:
  - path: module_structure.class_file_constraint.rule
    form: value
    value: one_class_or_script_per_file
  - path: lints.compile_errors.rules.class_or_script.message
    form: text
    message: A file is either a :CLASS definition or a script, never both.
verification:
  basis: reference
  note: >-
    Kept from the data-sources and module-structure packs, which state it
    word for word, and the schema's class_file_constraint. Merged: the
    module-structure pack's "Do not mix class definitions, script procedures,
    and data-source bodies in one file.", and the schema's compile_errors
    entry class_or_script, whose message stays word for word.
---

## Rationale

Each file kind has its own structure and is run differently: a class file is
instantiated, a script is called, and a data source is preprocessed and then
run through `RunDS`. Mixing kinds in one file breaks the structure of each.

## Examples

### Good

```ssl
:PROCEDURE Main;
	:RETURN 1;
:ENDPROC;
```

### Bad

```ssl
:PROCEDURE Main;
	:RETURN 1;
:ENDPROC;

:CLASS Counter;
:DECLARE nCount;
```

## Notes

The schema also states the class half of this rule as
`lints.compile_errors.class_or_script`, the slug starlims-lsp reports. The
record supplies that entry's message; the slug stays in
`rules/schema-base.yaml`.
