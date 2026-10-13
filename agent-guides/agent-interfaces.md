# Agent interfaces

This document defines the two formats the SSL agents exchange with tooling
outside this repository:

- the **task brief**, a behavior specification an external tool can hand to
  the agents instead of a ticket;
- the **run record**, a fixed block the agents put in their final reports so
  a caller can trace what produced a piece of code.

This repository owns both formats. Tools that produce briefs or consume run
records should conform to them; a change to either format is a change to this
file, with a matching update to the agents that read or write it.

---

## Task brief

A task brief describes **what** a piece of SSL must do, in observable terms,
so an implementer can write it with no other source. It is not a design: the
planner still turns it into a feature spec, and the developer still writes
the code.

A brief is a single Markdown file, conventionally `BRIEF.md`, with these
sections in this order.

| # | Section | Contents |
|---|---------|----------|
| 1 | **Task** | A neutral name and a one-paragraph purpose in product terms. |
| 2 | **Signature** | Each parameter in order: meaning, type, whether it may be omitted, and its default. The globals the code reads. |
| 3 | **Returns** | The value and its type, for each outcome. |
| 4 | **Reads** | Tables and columns read, and the conditions used. |
| 5 | **Writes** | Tables and columns inserted, updated or deleted; counters drawn (table and field); whether the work runs in a transaction. |
| 6 | **Errors and edge cases** | What happens on a missing row, a NIL or empty parameter, a duplicate, or a failed SQL statement: whether it raises, returns a flag, or logs. Behavior under a caller's transaction, or "unspecified". |
| 7 | **Conventions** | Product habits the code must keep, with the exact call form where an idiom is required (for example the counter function and its arguments). Where two rules apply to one input, which wins. |
| 8 | **Out of scope** | What the code deliberately does not do. |
| 9 | **Deliverable** | What to produce: normally one script, with any tests in separate files. |
| 10 | **Examples** | Runnable examples. Each has a `###` name, **Arguments**, **Globals**, **Starting tables** (SQL that builds the whole starting database), and **Expected outcome** (the return value, raised error, log lines and table state to check). |

Rules for brief authors:

- Describe behavior, not statement order. Where behavior is surprising,
  describe it plainly; it is part of the brief.
- Every global the brief names must exist on a base installation, or the
  brief must say how it is declared.
- Examples use invented, neutral data. A brief may hold back further examples
  for checking; implementers only see the ones in the file.
- No names of people, hosts or organizations, and no code copied from
  elsewhere.

### How the agents use a brief

**Planner.** A brief is the input to one feature spec. Map it like this:

| Brief | Feature spec |
|-------|--------------|
| Task | Goal |
| — | Parent: `Standalone (task brief <path>)` |
| Out of scope, Deliverable | Scope |
| Signature, Returns | Procedures and classes |
| Reads, Writes | Data flow |
| Errors and edge cases | Edge cases and error handling |
| Conventions | Carried verbatim into the spec under **Brief conventions**, after Edge cases |
| Examples | Test plan: each example becomes a case to satisfy, alongside the SSL unit tests |

The prior-art survey and verification log are still required. When the run
is confined to a workspace (no project catalog), write the spec next to the
brief and skip `docs/specs/INDEX.md` and `docs/STATE.md`; say so in the spec.

**Brief behavior wins over style rules.** When the brief requires behavior a
style rule discourages (for example no `:TRY`, a `.F.` return used as the
signal, a named connection, no input validation), the brief wins:

- the planner records the conflict in the spec under **Brief conventions**;
- the developer implements the brief and does not "fix" it, listing each
  conflict in Flags as `brief-required: <rule> — <brief section>`;
- the reviewer reports it as a **brief-required conflict**, not a finding,
  and it does not count toward the verdict.

Language rules are not style rules: a brief cannot require code that does
not compile or does not run. Report that as an open question instead.

---

## Run record

The developer's completion report and the reviewer's report each include
this block, verbatim in shape, so a caller can parse it:

```
Run record:
  agent:        <name> v<version>
  input:        <path of the spec, brief or file reviewed>
  outputs:      <paths written, comma-separated, or none>
  diagnostics:  <ssl-reference MCP | starlims-lsp --validate --strict | bundled inventory only>
  model:        <model name, or unknown>
  style_guide:  <commit, or caller>
  lsp:          <version, or caller>
  hashes:       <path=sha256 per input and output, or caller>
```

- **agent** comes from the `GENERATED from ... v<version>` line at the top of
  your own instructions.
- **diagnostics** names the tool that produced the diagnostics in the report,
  so results from different fallbacks are not compared as equals.
- Fill **style_guide**, **lsp** and **hashes** only if you can read them
  directly (for example with read-only shell commands). Otherwise write
  `caller`: the tool that dispatched you records them around the run. Never
  guess a value.
