## Survey before you build (gate)

Agents on this project have repeatedly rebuilt things that already
existed. Before designing or writing anything new, establish what is
already there, and record what you found — an unrecorded survey did not
happen.

1. **Search the workspace for the capability**, not just the name
   someone proposed for it. Look for the domain nouns and verbs
   (`sample`, `aliquot`, `approve`, `requeue`), the table or field names
   involved, and near-synonyms of the proposed procedure name. Scope
   each search to a directory rather than sweeping the whole workspace.
2. **Check the built-ins.** Run `ssl_search` on the capability before
   concluding SSL lacks it. A surprising amount of what looks like
   missing functionality is a built-in under an unexpected name.
3. **Read the neighbors.** Open the files that would call your change
   and the files that solve adjacent problems. Match their conventions —
   naming, error handling, transaction style — rather than importing a
   pattern from elsewhere.
4. **Check the spec catalog** (`docs/specs/INDEX.md`, when the project
   keeps one) for prior or in-flight work on the same area.

Report the survey as a **Prior art** section before any design or code:

```
Prior art:
  Searched:   <terms / paths / ssl_search queries>
  Found:      <existing procedure, class, or built-in> — <reuse | extend | not applicable, and why>
  Building new because: <what the existing options cannot do>
```

If something close already exists, the default is to extend it. Building
a parallel implementation is a decision that needs a stated reason.
