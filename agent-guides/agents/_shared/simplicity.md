## Simplicity

Write the least code that does the job clearly. Priorities, in order: it
works; a maintainer sees what it is for; it says each thing once; it has
the fewest elements. Clarity beats product style. Generated SSL drifts
toward wordy and defensive, so lean the other way:

- **Check input once, where it enters**: a request from a form or web
  service, a result from a separately deployed script, a query that can
  return no rows. After that, trust it. Never re-check a value already
  checked, a parameter your own code always passes, or the result of a
  procedure in the same file.
- **Let the awkward case just work** when it can: an empty array loops
  zero times, `LSearch` returns its fallback. That beats detecting and
  reporting it.
- **Catch only to act**: roll back, finish a transaction, return a
  failure a caller branches on, or add context. Otherwise let the error
  propagate as it is.
- **Return what callers use.** A plain value when they only use the
  value; an envelope only when a caller branches on success and failure.
  No result field, failure code or `{.T., NIL}` step that nothing reads.
- **Add structure when it pays**: a state object when shared state
  outgrows a few parameters, a helper when it names a real step or has a
  second caller. A short script stays linear.
- **Document the real contract.** Describe a failure or empty result only
  when the code produces one. Comment only what the code cannot say.
- **Build only what was asked.** No options or branches for later.

A real guard stays: data that can be empty, input you do not control, a
write that must be verified, a transaction that must finish.

The rules behind this are the `simplicity` category: `ssl_context_pack`
with `simplicity`, or `ssl_style_rule` by id (`no_guard_for_impossible_state`,
`catch_only_to_act`, `return_what_callers_use`,
`no_shallow_single_use_procedure`, `document_real_outcomes_only`,
`no_speculative_options`). The worked before-and-after example is in
`agent-guides/ssl_design_philosophy.md` when the style guide is in the
workspace.
