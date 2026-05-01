---
name: ssl-lookup
description: Look up SSL function signatures, class members, keyword syntax, or operator behavior. Use when the user asks about an SSL function, class, or language element.
argument-hint: "<element-name>"
allowed-tools: Read, Grep, Glob
---

Look up the SSL element named `$ARGUMENTS`.

## Authoritative sources, in order

1. **MCP tools (preferred when available):**
   - `ssl_lookup` with `name: "$ARGUMENTS"` — exact match by name or symbol
   - `ssl_signature` with `name: "$ARGUMENTS"` — richer detail for functions and classes
   - `ssl_search` with `query: "$ARGUMENTS"` — fuzzy match if exact lookup fails

2. **Local element reference JSON** — `ssl-style-guide/ssl-element-reference.json`
   (also bundled at `ssl-mcp-server/data/ssl-element-reference.json`).
   This is the canonical structured inventory. Top-level shape:
   ```jsonc
   {
     "version": "1",
     "totals": { "keywords": 38, "operators": 32, "literals": 3,
                 "types": 8, "classes": 29, "special_forms": 6,
                 "functions": 330, "all": 446 },
     "keywords":      { "<NAME>":   { title, summary, syntax }, ... },
     "operators":     { "<name>":   { title, summary, syntax,
                                      type_behavior: [{left, right, result, behavior}] }, ... },
     "literals":      { "<name>":   { title, summary, syntax }, ... },
     "types":         { "<name>":   { title, summary, runtime_type,
                                      operators: [...], members: [...] }, ... },
     "classes":       { "<Name>":   { title, summary, base_class,
                                      constructors: [{signature, description, parameters}],
                                      properties: [...], methods: [...] }, ... },
     "special_forms": { "<name>":   { title, summary, syntax }, ... },
     "functions":     { "<Name>":   { title, summary, signature,
                                      returns: {type, description},
                                      parameters: [...] }, ... }
   }
   ```

3. **Narrative docs (use only when JSON doesn't have what you need):**
   - `agent-guides/ssl_agent_instructions.md`
   - `ssl-style-guide/ssl-style-guide.schema.yaml`
   - `ssl-style-guide/ssl-ebnf-grammar.md`

## Instructions

1. **If `ssl_lookup` (MCP) is available, call it first.** For functions or
   classes, also call `ssl_signature` to retrieve structured parameter and
   member detail.

2. **If MCP is unavailable, read the local JSON** with the Read tool. Prefer
   the project copy at `ssl-style-guide/ssl-element-reference.json`. Element
   keys follow ssl-docs filename stems — keywords are stored as `BEGINCASE`,
   `IF`, etc. (uppercase, no leading colon); functions and classes are
   PascalCase (`AAdd`, `AzureStorage`); operators and literals are kebab-case
   slugs (`add-assign`, `nil`).

3. **If exact lookup fails:**
   - Try the symbol form: `=`, `==`, `:=`, `+=`, `$`, `.AND.`, `.T.`, etc.
     Operators are keyed by descriptive name (`add-assign`, `equals`,
     `dollar`); use `ssl_search` or scan the `operators` bucket for a
     match in the `syntax` field.
   - Try keywords without the leading colon: lookup `IF` not `:IF`.
   - Use `ssl_search` (MCP) or grep the JSON for partial matches.

4. **If still not found:** report the failure honestly. Do not invent
   signatures or behavior.

---

## Output

Present results with the canonical name and the most useful structured
fields for the element type.

**Function:**
```
Element:    AAdd  (function)
Signature:  AAdd(aTarget, vElement)
Returns:    any — The appended value.
Parameters:
  - aTarget: array (required) — Existing array to modify.
  - vElement: any (required) — Value to append as the new last element.
Summary:    Appends an element to the end of an array and returns the appended element.
```

**Class:**
```
Element:    AzureStorage  (class)
Summary:    Provides SSL access to Azure Table Storage and Azure Blob Storage.
Constructors:
  - AzureStorage{} — first configured Azure connection
  - AzureStorage{sConnectionName} — named connection
  - AzureStorage{sAccountName, sAccountKey} — explicit credentials
Methods:    CreateTable, DeleteTable, InsertEntity, ... (full list from JSON)
Properties: (none) | Property1, Property2, ...
```

**Keyword:**
```
Element:  :BEGINCASE  (keyword)
Syntax:
  :BEGINCASE;
  :CASE <condition>;
      ...
      :EXITCASE;
  :OTHERWISE;
      ...
      :EXITCASE;
  :ENDCASE;
Summary:  Starts a :BEGINCASE block for evaluating one or more boolean :CASE conditions.
```

**Operator:**
```
Element:   +=  (operator: add-assign)
Syntax:    target += value;
Type behavior:
  - number += number → number
  - string += string → string
  - date   += number → date
Summary:   Updates a variable, property, or array element in place by applying + and storing the result.
```

**Type / literal / special form:** include `runtime_type`, `members`, or
`syntax` as appropriate.

If the user asked about an element that has obvious siblings (e.g. asking
about `:CASE` — also surface `:BEGINCASE`, `:EXITCASE`, `:OTHERWISE`),
include a short "Related elements" line at the end.
