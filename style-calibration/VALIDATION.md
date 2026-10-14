# Initial validation

- 17 Python measurement/revision tests pass. They test tooling, not SSL execution.
- All 12 implementation/test files pass strict local LSP validation with zero
  errors and zero warnings. Seven info advisories remain for review.
- New server scripts and SSL tests pass formatter checks. Native data sources
  retain their own layout and parameter syntax.
- The LSP's full `go test -race ./...` suite passes, including regression cases
  for object members whose names match predefined or configured globals.
- Agent adapters, machine docs, agent contracts, and the nine existing skill
  examples pass their existing checks.
- All 139 supplied SSL behavior tests remain unexecuted. Database-backed tests
  require the synthetic fixture documented in [FIXTURES.md](FIXTURES.md).

Static evidence is retained locally under `verification/`. The initial manifest
records task, design, draft, and baseline guidance hashes. Working copies begin
byte-identical to the drafts; local review records start awaiting human review.

## Validator version

The purpose-built examples exposed an existing `global_assignment` false
positive on properties such as `oSummary:pending` and `oRequest:accepted`.
The source fix in the sibling LSP excludes qualified members while preserving
bare-global diagnostics, their ranges, and severity.

Validation used a locally rebuilt binary containing that fix. The fix shipped
in starlims-lsp v0.25.0, so the binary the MCP server pins (v0.27.0) no
longer reports those false positives. Reproduce the local check from the
style-guide repository root:

```bash
mkdir -p .calibration-cache
(cd ../starlims-lsp && go build -o ../ssl-style-guide/.calibration-cache/starlims-lsp ./cmd/starlims-lsp)
python3 tools/check_calibration.py --lsp .calibration-cache/starlims-lsp
python3 -m unittest discover -s tools -p 'test_calibration.py'
```

No new calibration-derived style rules have been introduced. Practice promotion,
agent reinforcement, and three fresh transfer tasks follow the user's review.
