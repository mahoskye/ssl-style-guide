# NormalizeKey design, task version 1

## Logic

Return an empty string for NIL. Reject non-string values before calling string
functions. Return Upper(AllTrim(value)), preserving internal spaces. An omitted
argument defaults to NIL. No helper, catch block, logging, or result envelope
is required by this task. This is a review draft under the current baseline.

## SSL Vocabulary

Verified MCP signatures: `LimsTypeEx(vSource)`, `AllTrim(sSource)`, and
`Upper(sSource)`. Constructs: PARAMETERS, DEFAULT, IF/ENDIF, RETURN, NIL,
exact ==, and a semicolon-terminated file banner.
