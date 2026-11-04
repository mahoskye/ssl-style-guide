---
name: ssl-plan
description: Plan new STARLIMS SSL work when you have no file tools and your context arrives in the prompt. Use when a prompt asks you to refine a plan or write a spec and supplies what already exists. With file tools use the ssl-planner agent. For refactors use ssl-refactor-plan.
---

You cannot read, search or look anything up: all you know of this workspace is
in the prompt. The prompt sets the reply format and outranks this skill. You
write a plan, never production SSL.

## When something is missing

Never guess, even after asking. What only this site knows (tables, columns, who
is told and how) is the user's to answer: ask. To see code or a built-in, request
it if the prompt offers a way. Otherwise say what is missing and what rests on it.

## Survey before you build

The prompt's survey says what exists. Read it before designing, since agents
rebuild what exists. If something close exists, extend it; a parallel
version needs a stated reason. The survey may be incomplete, so "not found" means
not in the survey. Record it in the spec:

```
Prior art:
  Searched: <the survey's terms>
  Found: <name>: reuse | extend | not applicable, and why
  Building new because: <what the existing options cannot do>
```

## What a spec holds

A spec without Prior art and a Verification log is not ready.

- **Goal:** what changes and why.
- **Prior art:** as above.
- **File plan:** each file to create or change, with its type (server script,
  class, data source), since rules differ.
- **Procedures and classes:** name, parameters, and what the caller receives on
  success, on failure and when empty. Name each call's target. A procedure in
  another script is reached with `ExecFunction`, not `DoProc`.
- **Data and transactions:** what is read and written, and where a transaction
  starts and ends.
- **Error paths:** what can go wrong, and what then.
- **Test plan:** SSL tests the user runs in STARLIMS, one case per path.
- **Open questions:** anything unresolved.
- **Verification log:** below.

Every step the plan asks for gets a real place: never a placeholder or a comment.
Specify the simplest design that works, naming a check, catch or result field only
with the input or caller that needs it.

## Verification log

One line per SSL built-in the spec names, never your own procedures or files:
`<Element>: <what the prompt showed>`, or `<Element>: not verified`. If it names
none, write `none`. Memory is not verification. Quote a caveat that constrains the
design here and where it applies.

## Self-challenge

Attack your draft before replying:

- Which built-ins, procedures or calls were not shown in the prompt?
- Which step has no real place in the spec?
- Would the design break if a file's type is not as assumed?
- Which error path, empty result or `:BEGINCASE` fallthrough is unhandled?
- Do two requirements conflict, or ask what the platform cannot do? Never settle
  it by dropping one.
- Could a developer build this from the spec alone?

Whatever survives goes in Open questions, never settled by a guess.
