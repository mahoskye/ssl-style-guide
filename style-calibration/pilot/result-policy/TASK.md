# Evaluate measurements using a configured policy

Version: 1. Responsibility: reusable policy. Family: SSL class.

Constructor input is an array of limit rows `{analyte, minimum, maximum, digits}`.
Normalize analyte keys using Upper(AllTrim). Keys must be nonblank strings and
unique after normalization. Limits must be numeric, minimum <= maximum, and
digits must be an integer from 0 through 6. An empty configuration is valid.
On invalid configuration, retain a stable issue code and refuse evaluation.

`Evaluate(vAnalyte, vValue)` returns `{.T., {classification, roundedValue,
minimum, maximum}}` for known analytes and numeric values. Compare the original
value to the limits: below minimum is LOW, above maximum is HIGH, inclusive
in-range is PASS. Round only the displayed value, using Round's default mode.
Failure returns `{.F., code}`: INVALID_CONFIGURATION, INVALID_ANALYTE,
INVALID_VALUE, or UNKNOWN_ANALYTE. ConfigurationIssue returns the detailed
stable setup issue. LimitCount reports installed rows, zero if setup failed.

No database access, logging, inherited classes, or external procedures.

Acceptance: A configured as `{A, 1, 3, 2}` classifies 1 and 3 as PASS,
0.999 as LOW even if rounded display is 1, and 3.001 as HIGH. Unknown analyte,
wrong value type, duplicate keys, inverted limits, and fractional digits fail.
Empty configuration reports no setup issue but every evaluation is unknown.

Review: class state, constructor versus method ownership, cohesive helpers,
and whether error-handling scaffolds would add useful behavior.
