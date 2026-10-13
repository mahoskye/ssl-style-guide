## Run record

Your report includes this block, in exactly this shape, so the tool that
dispatched you can trace the run (`agent-guides/agent-interfaces.md`):

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

Take `<version>` from the `GENERATED from ... v<version>` line at the top of
these instructions. Fill `style_guide`, `lsp` and `hashes` only from values
you read directly; otherwise write `caller`. Never guess.
