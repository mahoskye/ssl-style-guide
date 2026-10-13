---
id: replay_aware_mutations
title: Replay-aware mutations
domain: server-scripts
status: active
level: style_only
severity: warning
applies_to: [server_script, class]
rule: >-
  In a replay-aware mutation, lock the candidate row, distinguish fresh work
  from an exact replay, validate a versioned receipt fingerprint, reject
  changed requests as conflicts, and preserve the canonical receipt
  serialization byte for byte.
categories: [transactions]
enforced_by: [reviewer]
verification:
  basis: convention
  note: >-
    Kept from the server-script baseline ("Transactional Commands"), which
    states it in two sentences, joined here.
---

## Rationale

A replayed request must return the original outcome without doing the work
twice, and a changed request with the same key must not be mistaken for a
replay.

## Examples

### Good

```text
1. SELECT ... FOR UPDATE the row for the request key.
2. No row: do the work and store the receipt with its fingerprint version.
3. A row whose fingerprint matches: return the stored receipt unchanged.
4. A row whose fingerprint differs: return a conflict.
```

### Bad

```text
1. Read the row for the request key without a lock.
2. A row exists: do the work again and overwrite the receipt.
```
