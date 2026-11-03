---
id: script_size_review
title: Aim for server scripts of about 400 code lines
domain: language
status: active
level: style_only
severity: info
applies_to: [server_script]
rule: >-
  Aim for server scripts of about 400 code lines; past 400 code lines or 12
  local procedures, check its responsibilities and move each one that stands
  alone into its own script.
categories: [module-structure]
related_elements: [REGION, DoProc, ExecFunction]
enforced_by: [lsp:diag.script_size_review]
schema:
  - path: lints.style_rules.script_size_review
    form: value
    value:
      max_code_lines: 400
      max_local_procedures: 12
verification:
  basis: observed
  note: >-
    Confirmed on STARLIMS 12. The ideal is the shape of STARLIMS 12's own
    base layer: its script sizes are median 21 code lines, 75th percentile
    54, 90th 129, 95th 198 and 99th 551; local procedures per script are 90th
    percentile 2, 95th 5 and 99th 15; and only 1.4% of its scripts have over
    200 code lines with zero or one procedure. The triggers are deliberately
    generous, to leave developers room. The trigger restates the server-script style guide's
    "line count and procedure count are review triggers, not acceptance
    limits" with numbers. starlims-lsp v0.27.0 reports a server script past
    either trigger as script_size_review (info, settings
    ssl.diagnostics.maxScriptCodeLines, default 400, and
    ssl.diagnostics.maxScriptProcedures, default 12), counting code lines
    the same way; it is hidden unless info diagnostics are shown. The
    diagnostic is the prompt, so it also reports a large script that is
    already organized into regions, like the Good example; how to organize
    the script, and the 200-line ideal, stay a reviewer's judgment. The
    examples stay text, since a fence large enough to draw the diagnostic
    would bury the point. Revised 2026-10-22 under program decision 0006:
    the 400-line target replaces the 200-line ideal, splitting a
    responsibility out no longer waits for reuse, and the hard limit is
    script_size_ceiling.
---

## Rationale

Size costs time in STARLIMS whenever a script has to be loaded. The server
compiles the whole script, `:INCLUDE`d code and all, even when a caller
needs one procedure. Once loaded it stays in memory, so the cost falls on
the first use after a start, on every script after a check-in in production
mode, which resets the application, and on every save while developing,
which recompiles the saved script. A small script loads and recompiles
quickly; a 200 KB one makes every one of those moments slow.

Size also limits the agents that write and review the code: their reads
stop at about 50 KB, so a larger script is never seen whole at once, and a
review of part of a file misses what the rest depends on.

Most of STARLIMS 12's own scripts are small: the median has 21 code lines
and the 95th percentile about 200. A script past 400 code lines or 12 local
procedures usually holds more than one responsibility. Moving one into its
own script costs one `ExecFunction` per call, which is small once both
scripts are loaded, against a smaller unit to load, recompile and read.

## Exceptions

The 400-line target is a target; `script_size_ceiling` sets the limit. Split by
responsibility, not by line count: do not scatter one flow across many tiny
scripts called in a loop, and never collapse distinct responsibilities or
remove demonstrated guards to get under a number.

## Examples

### Good

```text
/* QCCRunContext: 380 code lines, 9 procedures, 31 KB; one job: building
   and authenticating the run context. Its callers load only this;
```

### Bad

```text
/* subrouter_qcc: 6,249 lines, 123 procedures, 225 KB; routing, primer
   ordering, ingest, fetch, run context, branch submission and target
   inventory in one script. A 9-line path check other scripts call loads
   all of it;
```
