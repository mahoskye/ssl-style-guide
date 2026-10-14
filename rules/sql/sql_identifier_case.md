---
id: sql_identifier_case
title: Preserve the author's identifier casing
domain: sql
status: active
level: style_only
severity: warning
applies_to: [embedded_sql, sql_data_source]
rule: >-
  Preserve the author's casing for table names, column names and aliases;
  force-folding is dialect-conditional (safe on Oracle, but breaks
  case-sensitive SQL Server collations), so lowercase only Oracle-only code.
categories: [sql]
machine: { list: must_follow }
related_elements: [SQLExecute, RunSQL]
enforced_by: [reviewer]
schema:
  - path: sql.formatting.identifier_case
    form: value
    value: preserve
verification:
  basis: reference
  note: >-
    Merged from the database pack's casing item (its identifier half), the
    ssl-format skill, the agent guide's SQL guidance #7 and quick reference,
    the schema's identifier_case comment and the compact reference's
    Identifier Casing section. The formatter's default (preserve) leaves
    identifiers alone, so a reviewer catches hand-folded ones.
issues: ["#63"]
---

## Rationale

On Oracle, unquoted identifiers are case-insensitive, so folding them is
safe. On SQL Server, identifier comparison follows the database collation, and
on a case-sensitive collation `RESULTS` and `results` name different objects.
A STARLIMS environment may run on either, so preserving the author's casing is
the only safe default. Double-quoted identifiers are never re-cased.

## Exceptions

Code that only ever runs on Oracle may lowercase identifiers; the formatter
setting `ssl.format.sql.identifierCase: lower` is that opt-in.

## Examples

### Good

```ssl
:DECLARE sStatus, aRows;

sStatus := "Logged";
aRows := SQLExecute("SELECT SampleID, Status FROM Sample WHERE Status = ?sStatus?");
```

### Bad

```text
Author wrote:  SELECT SampleID, Status FROM Sample WHERE Status = ?sStatus?
Rewritten as:  SELECT sampleid, status FROM sample WHERE status = ?sStatus?
On a case-sensitive SQL Server collation the rewritten query names other objects.
```
