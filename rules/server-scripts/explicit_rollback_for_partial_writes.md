---
id: explicit_rollback_for_partial_writes
title: Make rollback explicit for partial-failure writes
domain: server-scripts
status: active
level: style_only
severity: warning
applies_to: [server_script, class]
rule: >-
  Make rollback behavior explicit for write operations that can partially
  fail.
categories: [transactions]
machine: { list: must_follow }
related_elements: [EndLimsTransaction]
enforced_by: [reviewer]
verification:
  basis: convention
  note: >-
    Kept from the transactions pack, which states it word for word. The
    server-script baseline's commit-flag rules say how.
---

## Rationale

When the second of two writes fails, either both are undone or the first one
stays. The code should show which: a commit flag that is `.T.` only after
every write passed, and an `EndLimsTransaction` call that uses it.

## Examples

### Good

```text
bCommit := .F. before the writes
bCommit := .T. as the last statement of the :TRY body
:FINALLY ends the transaction with EndLimsTransaction(, bCommit)
```

### Bad

```text
:FINALLY ends the transaction with EndLimsTransaction(, .T.)
whatever happened in the :TRY body
```
