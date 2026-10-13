## The quality bar

SSL you write or change is not done until all four hold. They are
sequential — formatting before diagnostics, because formatting moves
lines and invalidates the line numbers in an earlier run.

**1. Formatted — scoped to what you wrote.**

`ssl_format` is whole-file, and on legacy SSL that is not a small
change: across 298 real files, 93% changed under the formatter and 72%
had more than half their lines rewritten. So the rule depends on what
you touched:

- **A file you created**: run `ssl_format` on it. Unformatted new code
  is an unfinished task. Copy the formatter's shape — tab-indented
  procedure bodies — rather than handing back a flat block.
- **A file that already existed**: do **not** reformat it wholesale as a
  side effect of a small change. A one-line fix inside a thousand-line
  reformat is a change nobody can review, and it is the same
  unreadable-diff problem as handing back a regenerated file. Match the
  surrounding style by hand, and say in your report that you did not
  reformat.
- **Reformatting is its own task.** When the job actually is to format a
  file — a handoff pass, or the user asking for it — run the formatter
  over the whole file and say so plainly, so the diff is expected.

The formatter also lays out embedded SQL. It re-indents a multi-line SQL
string and breaks an over-long one into clauses, uppercasing SQL
keywords as it goes. A SQL string that fits on one line is left exactly
as written, keyword case included. So check every SQL string against
canonical-compact style per `agent-guides/skills/ssl-format/SKILL.md`:
correct what the formatter produced and finish by hand what it left.
Treat all of its output as a draft: read what it changed and correct
decisions that hurt readability or contradict the schema.

`ssl_format` is expected to be idempotent. If it reports a result as
unstable, that is a formatter bug: accept the output, review it by eye,
and report it with the input shape that triggered it. Do not re-run
looking for a fixed point.

Report formatting with evidence, not assertion. For each file, state the
formatter's substantive changes, or `ssl_format → no changes`, or that
you deliberately did not reformat an existing file. "Formatted the file"
with nothing behind it does not satisfy this condition.

**2. Documented.** <!-- rule: file_banner_required -->Open every server script and class file with the standard file banner, using the dot-leader fields `Description`, `Parameters`, `Returns`, `Author` and `Date`.<!-- /rule -->
Every procedure carries a doc block stating purpose, parameters, and
what the caller receives on success, on failure, and on the empty case.
Inside the body, comment the *why* wherever the logic is non-obvious —
especially at SSL traps a reader will misread (`=` versus `==` string
semantics, `:BEGINCASE` fallthrough, `Me:` field qualification,
transaction ownership). Write the comments a careful developer leaves
behind, not a restatement of the line below. Comment syntax:

<!-- rules: id=no_c_style_comment_closer,no_semicolon_in_comment_text wrap=72 -->
- `*/` comment closers: an SSL comment opens with `/*` and ends at the
  first `;`. End every comment with `;` alone — the form `; */` leaves
  an inert `*/` outside the comment and draws a diagnostic.
- Never include a semicolon inside comment text; the first semicolon
  ends the comment and the remaining text becomes executable code.
<!-- /rules -->

**3. Diagnostically clean — against a baseline.**

Run `ssl_diagnose` on each target file **before you edit it** and keep
that output. That is the baseline. Most real files carry pre-existing
findings: across a 1,923-file corpus, 23% of the files with no errors
still reported at least one warning, the worst of them 40. Fixing
unrelated findings in a file you were asked to make one change to is
scope creep, and scope creep in code you have not read is how behavior
breaks.

So the bar is:

- **Zero errors** in the file, full stop. An error means it does not
  parse or violates the language. If an error predates you and you
  cannot fix it within scope, stop and report it — do not build on a
  file you believe is broken.
- **Zero new warnings** relative to the baseline. Every warning your
  change introduced is a defect: fix it, or justify it explicitly.
  `ssl_diagnose` runs the strict agent profile, so warnings include
  three checks an editor withholds — `undeclared_variable` (a typo'd
  read the default validator calls clean), `unused_variable`, and
  `invalid_sql_param`.
- **Pre-existing warnings are reported, not fixed.** List them as
  baseline findings so the reader knows they exist and knows you did not
  introduce them. Fix one only when the task asked for it, or when it
  sits in the lines you were already changing.
- Hint and info rows are advisory. Report new ones; never churn on them.

A file **you created** has no baseline: it finishes at zero errors and
zero warnings outright, with nothing to excuse. The baseline exists for
files that were already there.

One warning is expected rather than a defect: `undeclared_variable` on
a **predefined global** the code reads on purpose, such as `CRLF` or
`Request`. Never declare the name to silence it; a local hides the
global. Read it as `ssl_server_script_style.md` (Predefined Globals)
describes and list each such warning in your report with the global it
names. Any other `undeclared_variable` is a defect.

Re-run after your last edit — a diagnostic from before your final change
is stale evidence.

**Stop after three fix rounds.** If three passes of fix-and-re-run have
not reached the bar, stop and report what remains, what you tried, and
why you think it is not converging. A finding you cannot resolve may be
a validator false positive, or it may need a decision that is not yours
to make. Grinding a fourth time is how an agent burns a session and
still hands back nothing.

**4. Resolved.** Every call target exists. A `DoProc("Name", {...})`
target resolves to a `:PROCEDURE` in the same file or a verified
three-segment path, and an `ExecFunction` root is a verified script entry
point. <!-- rule: execfunction_not_class_file -->Point `ExecFunction` at a script entry point or script procedure, never at a class file; create class instances with `CreateUdObject` and call their methods.<!-- /rule --> Before wrapping an unresolved name in
`DoProc`, check `ssl_lookup` — it may be a built-in you call directly.
Every database call matches the shape `ssl_signature` returned: the
marker style and the slot the values occupy are copied from the
signature, not assumed from another language's conventions. The marker
rules:

<!-- rules: id=named_sql_param_unsupported,sql_positional_placeholders,getssldataset_at_name_markers wrap=72 -->
- `SQLExecute` is the only database API that supports named `?param?`
  substitution; do not use `?param?` markers with other database
  functions. Its markers reference in-scope SSL variables by name.
  Canonical shape:
  `SQLExecute("UPDATE T SET COL = ?sValue? WHERE ID = ?nId?");`
- `RunSQL`, `LSearch`, `LSelect`, `LSelect1`, `LSelectC`, and
  `GetDataSet` use positional `?` markers with a value array in a later
  argument slot: fourth for `LSearch`, `LSelect` and `LSelectC`, second
  for `GetDataSet`, and third for `RunSQL` and `LSelect1`. Check
  `ssl_signature` for the slot and skip unused optionals with adjacent
  commas. Canonical shape:
  `aRows := LSelect("SELECT ID FROM T WHERE STATUS = ?",,, {sStatus});`
- `GetSSLDataset` uses `@name` markers with parallel name and value
  arrays.
<!-- /rules -->

**`ssl_diagnose` does not check built-in argument types.** It will
accept `Str(sSomeString)` even though `Str` takes a number. A clean
diagnostic run is not evidence that you called a built-in correctly —
only the signature you read from `ssl_signature` is. This is why
condition 4 exists separately from condition 3, and why "it validated"
never substitutes for looking the signature up.
