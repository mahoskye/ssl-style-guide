---
name: ssl-lookup
description: Look up SSL function signatures, class members, keyword syntax, or operator behavior. Use when the user asks about an SSL function, class, or language element.
argument-hint: "<element-name>"
allowed-tools: Read, Grep, Glob
---

Look up the SSL element named `$ARGUMENTS`.

## Instructions

1. **Prefer authoritative lookup sources in this order:**
   - MCP tool `ssl_lookup` with `name: "$ARGUMENTS"`
   - MCP tool `ssl_search` if exact lookup fails
   - Local bundled data if present in the workspace, in this order:
     - `ssl-mcp-server/data/ssl-element-list.json`
     - `agent-guides/ssl_agent_instructions.md`
     - `ssl-style-guide/ssl-style-guide.schema.yaml`
     - `ssl-style-guide/ssl-ebnf-grammar.md`

2. **If `ssl_lookup` is available, use it first** to retrieve the element definition.

3. **If exact lookup is not found:**
   - Use MCP tool `ssl_search` with `query: "$ARGUMENTS"` to find similar names
   - If MCP is unavailable, search the local bundled files above for likely matches
   - Present the alternatives and ask the user which they meant

4. **If found and the element is a class:**
   - Also call MCP tool `ssl_signature` with the class name to retrieve member signatures
   - If MCP is unavailable, summarize class members from local bundled data if present
   - List constructors, methods, and properties

5. **If found and the element is a function:**
   - Show signature, parameter types, return type
   - Show any notes about parameterization, side effects, or common pitfalls

6. **If found and the element is a keyword:**
   - Show syntax block with valid forms
   - Note any compiler requirements (e.g., `:BEGINCASE` requires at least one `:CASE`)

7. **If found and the element is an operator:**
   - Show syntax and both operand types
   - Note any non-obvious behavior (e.g., `=` is prefix match for strings, `$` is containment)

8. **If no authoritative source is available:**
   - Say that no MCP or bundled SSL reference data is available in the current environment
   - Do not invent signatures or behavior
   - Ask the user to provide the relevant file or enable the MCP source

---

## Output

Present results clearly:

```
Element: <name>
Type:    <function|class|keyword|operator|constant>
```

For functions:
```
Signature: FunctionName(param1Type param1, param2Type param2, ...) → ReturnType
Notes:     <any important caveats>
```

For classes:
```
Members:
  Constructor(...)
  Method1(...)
  Method2(...)
  Property1: Type
```

For keywords:
```
Syntax:
  :KEYWORD expression;
    body
  :ENDKEYWORD;

Notes: <compiler requirements, valid forms, common pitfalls>
```

For operators:
```
Syntax:  left OP right
Notes:   <behavior description, type coercions, edge cases>
```

Include any related elements (e.g., related functions, companion keywords) at the end.
