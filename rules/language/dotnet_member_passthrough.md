---
id: dotnet_member_passthrough
title: Built-in values have only native .NET members
domain: language
status: active
level: authoritative
severity: info
applies_to: [server_script, class, ssl_data_source]
rule: >-
  Strings, numbers, booleans, dates and arrays have no SSL-defined members; a
  `:` call reaches a case-sensitive native .NET member or raises (arrays have
  `:Length`, not `:Count`).
categories: [types]
machine: { list: must_follow }
related_elements: [ALen, MakeNETObject]
enforced_by: [reviewer]
schema:
  - path: types.dotnet_member_passthrough.rule
    form: text
    message: >-
      Built-in value types (string, number, date, array, boolean,
      netobject) are backed by .NET values and have no SSL-defined ':'
      members, so every ':' call on them reaches a native .NET member or
      raises (e.g. sName:Length, sName:ToUpper(), dDate:Year,
      dDate:AddDays(3), aList:Length, nVal:ToString()). Native member names
      are case-sensitive (aList:Clone() works, aList:clone() raises). This
      is legitimate dispatch, not an error. MakeNETObject(value) wraps a
      value explicitly as netobject.
verification:
  basis: observed
  note: >-
    Kept from the types pack, which states it word for word. Merged: the
    schema's types.dotnet_member_passthrough.rule (word for word) and the
    agent guide's .NET dispatch section. Tools must not flag an unmatched
    member, so the record is reviewer-enforced.
---

## Rationale

A `:` call on a built-in value goes straight to the underlying .NET object.
Its member names are case-sensitive, and a name the .NET type does not have
raises when the call runs.

## Examples

### Good

```ssl
:DECLARE aItems, nCount;

aItems := {1, 2};
nCount := aItems:Length;
```

### Bad

```ssl
:DECLARE aItems, nCount;
aItems := {1, 2};
nCount := aItems:Count;
```
