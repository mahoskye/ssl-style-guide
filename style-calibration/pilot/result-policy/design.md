# ResultPolicy design, task version 1

## Logic

Constructor: initialize empty limits and an unset configuration. Reject a
non-array configuration. For each row, validate shape, key, numeric bounds,
and digits, then reject duplicate normalized keys. Store a new normalized row.
On failure discard the partial configuration and retain its issue code. On
success mark configuration ready, including an empty list.

Evaluate: reject an invalid configuration, then validate the caller's analyte
and numeric value. Find the limit by normalized key. Compare the original
measurement with inclusive bounds, round only the display value, and return
the classification plus the exact limit values.

FindLimit: scan stored, already validated rows for an exact normalized key.
Return its 1-based position or zero. It owns no caller validation.

ValidateLimit: reject wrong shape before indexing, reject wrong types before
numeric operations, then check range ordering and integral digits 0..6.
Return an issue code or an empty string. It does not mutate class state.

ConfigurationIssue / LimitCount: expose setup outcome without exposing mutable
configuration arrays. Constructor is last. Fields use Me qualification.

No catch block is added: all handled failures are ordinary input decisions;
unexpected runtime failures propagate. This follows the baseline's necessity
rule rather than copying an unconditional scaffold.

## SSL Vocabulary

Verified using ssl-reference MCP signatures:

- `LimsTypeEx(vSource)`
- `Len(vSource)`
- `AllTrim(sSource)`
- `Upper(sSource)`
- `AAdd(aTarget, vElement)`
- `Round(nValue, nDigits, [sMidPointRounding])`

Constructs: CLASS, DECLARE, PROCEDURE, PARAMETERS, DEFAULT, IF/ELSE/ENDIF,
FOR/TO/NEXT, RETURN, ENDPROC, NIL, array literals, exact ==, Me field/method
access, and 1-based array indexing. User-defined class instantiation in tests:
`CreateUdObject("Calibration.ResultPolicy", {aLimits})`.
