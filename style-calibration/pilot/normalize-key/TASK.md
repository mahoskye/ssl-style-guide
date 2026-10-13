# Normalize an optional key

Version: 1. Responsibility: focused utility. Family: server script.

Input `vKey` may be a string or NIL. NIL and a blank/space-only string return
`""`. A string returns its leading/trailing spaces removed and characters
uppercased. Internal spaces are preserved. Any other runtime type returns NIL.
There are no database calls, logging, or other side effects.

Expose the operation as the script entry point. Default an omitted argument
to NIL. Do not invent a result envelope or configurable normalization options.

Acceptance cases: `" ab-12 "` -> `"AB-12"`; `"a b"` -> `"A B"`;
`"   "` and NIL -> `""`; numeric/array input -> NIL.

Review: required documentation, inline logic versus extraction, useful guards,
and whether the visual size matches this responsibility.
