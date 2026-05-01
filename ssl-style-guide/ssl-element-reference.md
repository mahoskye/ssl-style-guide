# SSL Element Reference

Generated from the published `ssl-docs` reference. To regenerate, run `tools/generate_element_reference.py` from the repository root.

This document is the consolidated, agent-loadable summary of the SSL language surface. Each element entry includes its canonical syntax (or signature) and a one-line summary; classes and types additionally list constructors, methods, and members. For full prose, examples, and edge cases, consult `ssl-docs/content/reference/<category>/<element>.md`.

**Totals:** 38 keywords, 32 operators, 3 literals, 8 types, 29 classes, 6 special forms, 330 functions (446 total).

---

## Keywords (38)

### `:BEGINCASE`

> Starts a :BEGINCASE block for evaluating one or more boolean :CASE conditions, with an optional :OTHERWISE branch and a required :ENDCASE.

```ssl
:BEGINCASE;
:CASE <condition>;
    /* statements;
    :EXITCASE;
:CASE <condition>;
    /* statements;
    :EXITCASE;
:OTHERWISE;
    /* statements;
    :EXITCASE;
:ENDCASE;
```

### `:BEGININLINECODE`

> Starts a named inline SSL code block that is stored for later retrieval with GetInlineCode.

```ssl
:BEGININLINECODE BlockName;
    /* Inline SSL code here;
:ENDINLINECODE;
```

### `:CASE`

> Executes a block of statements if a specific boolean expression evaluates to true within a CASE structure.

```ssl
:CASE expression;
```

### `:CATCH`

> Handles errors raised in the immediately preceding :TRY block.

```ssl
:CATCH;
```

### `:CLASS`

> Defines a class in SSL. A class file can declare fields, methods, an optional base class, and a Constructor procedure for instance initialization.

```ssl
:CLASS ClassName;
```

### `:DECLARE`

> Declares one or more variables in the current SSL scope.

```ssl
:DECLARE variable1[, variable2, ...];
```

### `:DEFAULT`

> Assigns a fallback expression to a parameter when the caller omits that argument.

```ssl
:PARAMETERS paramName[, otherParam, ...];
:DEFAULT paramName, defaultExpression;
```

### `:ELSE`

> Directs control to an alternate set of statements when the preceding IF condition is false.

```ssl
:ELSE;
```

### `:ENDCASE`

> Closes a :BEGINCASE block after its :CASE branches and optional :OTHERWISE branch.

```ssl
:ENDCASE;
```

### `:ENDIF`

> Terminates an :IF block, with or without an :ELSE branch.

```ssl
:ENDIF;
```

### `:ENDINLINECODE`

> Ends a named inline SSL code block opened by :BEGININLINECODE.

```ssl
:ENDINLINECODE;
```

### `:ENDPROC`

> Terminates a procedure block and signals the end of its executable statements.

```ssl
:ENDPROC;
```

### `:ENDREGION`

> Keyword that marks the end of a :REGION block; it has no standalone runtime behavior.

```ssl
:ENDREGION;
```

### `:ENDTRY`

> Closes a structured :TRY block after its :CATCH and/or :FINALLY sections.

```ssl
:ENDTRY;
```

### `:ENDWHILE`

> Closes a :WHILE loop block.

```ssl
:ENDWHILE;
```

### `:ERROR`

> Defines a legacy error handler for the statements that follow it in the current procedure or method.

```ssl
:ERROR;
```

### `:EXITCASE`

> Ends the current :CASE or :OTHERWISE branch and continues after :ENDCASE.

```ssl
:EXITCASE;
```

### `:EXITFOR`

> Terminates the innermost active :FOR loop immediately and continues with the statement after the matching :NEXT.

```ssl
:EXITFOR;
```

### `:EXITWHILE`

> Terminates the innermost active :WHILE loop and continues with the statement after the matching :ENDWHILE.

```ssl
:EXITWHILE;
```

### `:FINALLY`

> Starts the cleanup section of a :TRY block and always runs after the protected work completes.

```ssl
:FINALLY;
```

### `:FOR`

> Executes a counted loop by assigning a numeric variable, checking it against a numeric limit, and updating it after each iteration.

```ssl
:FOR nIndex := nStart :TO nEnd [:STEP nStep];
```

### `:IF`

> Executes a block of statements only when a condition evaluates to true.

```ssl
:IF condition;
    /* Statements to run when condition is true;
:ELSE;
    /* Optional statements to run when condition is false;
:ENDIF;
```

### `:INCLUDE`

> Inserts another SSL script's source into the current file so its statements compile as if they were written inline.

```ssl
:INCLUDE scriptName;
```

### `:INHERIT`

> Specifies the parent class for an SSL class.

```ssl
:INHERIT ClassName;
```

### `:LABEL`

> Marks a named location in a procedure or script for control flow redirection.

```ssl
:LABEL labelText;
:LABEL labelPart moreParts;
:LABELlabelText;
```

### `:LOOP`

> Skips the rest of the current :WHILE or :FOR iteration and continues with the next iteration of the innermost active loop.

```ssl
:LOOP;
```

### `:NEXT`

> Closes a :FOR loop and returns control to the loop's increment-and-test step.

```ssl
:NEXT;
```

### `:OTHERWISE`

> Executes the default branch of a :BEGINCASE block when no earlier :CASE branch runs.

```ssl
:OTHERWISE;
```

### `:PARAMETERS`

> Declares named input parameters for a script, procedure, method, or constructor.

```ssl
:PARAMETERS param1[, param2, ...];
```

### `:PROCEDURE`

> Declares a named routine body that can contain executable SSL statements and end with :ENDPROC ;.

```ssl
:PROCEDURE ProcedureName;
```

### `:PUBLIC`

> Declares global variables that can be accessed from any scope in the program.

```ssl
:PUBLIC variable1[, variable2, ...];
```

### `:REGION`

> Starts a named region block whose body is stored as text for later retrieval with GetRegion().

```ssl
:REGION RegionName;
region body text
:ENDREGION;
```

### `:RESUME`

> Continues execution after a legacy :ERROR handler, starting with the statement after the one that failed.

```ssl
:RESUME;
```

### `:RETURN`

> Ends the current script, procedure, or method immediately and can optionally return a value.

```ssl
:RETURN;
:RETURN expression;
```

### `:STEP`

> Sets the increment or decrement used by a :FOR loop between iterations.

```ssl
:FOR nIndex := nStart :TO nEnd [:STEP nStep];
```

### `:TO`

> Sets the inclusive loop limit used by a :FOR loop.

```ssl
:FOR nIndex := nStart :TO nEnd [:STEP nStep];
```

### `:TRY`

> Starts a protected block that can transfer control to :CATCH, :FINALLY, or both when errors occur.

```ssl
:TRY;
    try_statements;
:CATCH;
    catch_statements;
:ENDTRY;
```

### `:WHILE`

> Repeats a block of statements as long as a supplied condition evaluates to true.

```ssl
:WHILE condition;
    /* loop body;
:ENDWHILE;
```

---

## Operators (32)

### `add-assign`

> Updates a variable, property, or array element in place by applying + and then storing the result back into the left side.

```ssl
target += value;
```

**Type behavior:**

| Left | Right | Result | Behavior |
| --- | --- | --- | --- |
| number | number | number | Adds the right value to the left value and stores the sum |
| string | string | string | Concatenates the right string onto the left string and stores the result |
| date | number | date | Adds the right value as days to the left date and stores the new date |

### `and`

> Combines two boolean expressions and returns .T. only when both are .T..

```ssl
leftBoolean .AND. rightBoolean
```

**Type behavior:**

| Left | Right | Result | Behavior |
|------|-------|--------|----------|
| boolean | boolean | boolean | Returns `.T.` only when both operands are `.T.`. If the left operand is `.F.`, the right operand is not evaluated. |

### `assignment`

> Stores a value in a variable, object property, or array element and evaluates to the assigned value.

```ssl
target := value;
```

**Type behavior:**

| Left | Right | Result | Behavior |
|------|-------|--------|----------|
| variable | any | same as right | Stores the right-hand value in the variable |
| object property | any | same as right | Stores the right-hand value in the property |
| array element | any | same as right | Stores the right-hand value in the indexed element |

### `bang`

> Performs boolean negation, returning the opposite boolean value.

```ssl
!booleanExpression
!(compoundExpression)
```

**Type behavior:**

| Left | Right | Result | Behavior |
|------|-------|--------|----------|
| n/a | boolean | boolean | Returns the logical negation of the operand. |

### `decrement`

> Decreases a number variable by one, trims trailing spaces in strings, or subtracts days from a date depending on operand type.

```ssl
--variable
```

**Type behavior:**

| Left | Right | Result | Behavior |
|------|-------|--------|----------|
| number | n/a | number | Subtracts 1 from the number value |
| string | n/a | string | Trims trailing spaces from the string |
| date | n/a | date | Subtracts one day from the date |

### `divide-assign`

> Divides a numeric value by another numeric value and stores the quotient back in the left operand.

```ssl
target /= divisor;
```

**Type behavior:**

| Left | Right | Result | Behavior |
|------|-------|--------|----------|
| number | number | number | Divides the left operand by the right operand and stores the quotient back in the left operand. |

### `divide`

> Divides the left number by the right number and returns the result as a number.

```ssl
nQuotient := nLeft / nRight;
```

**Type behavior:**

| Left | Right | Result | Behavior |
| --- | --- | --- | --- |
| number | number | number | Returns the quotient of the left operand divided by the right operand. |
| number | non-number | error | Raises a runtime operand error for `/`. |
| non-number | any | error | Raises a runtime operator error because division is not supported for the left operand type. |

### `dollar`

> Tests whether the left string is found within the right operand as a substring.

```ssl
bResult := needle $ haystack;
```

**Type behavior:**

| Left | Right | Result | Behavior |
| --- | --- | --- | --- |
| string | string | boolean | Returns `.T.` if the left string is found anywhere within the right string; otherwise `.F.`. |
| string | non-string | error | Raises a runtime error because `$` does not implicitly convert the right operand to string. |
| non-string | any | error | Raises a runtime error because `$` is only implemented for string left operands. |

### `double-star-power`

> Raises one number to the exponent of another number.

```ssl
nResult := nBase ** nExponent;
```

**Type behavior:**

| Left | Right | Result | Behavior |
|------|-------|--------|----------|
| number | number | number | Raises the left operand to the power of the right operand. |
| number | non-number | error | Raises a runtime error because the exponent must be numeric. |
| non-number | any | error | Raises a runtime error because power is only defined for numeric bases. |

### `equals`

> Compares two values for equality, using prefix matching for strings, exact matching for numbers, booleans, and dates, and reference equality for arrays and objects.

```ssl
bEqual := vLeft = vRight;
```

**Type behavior:**

| Left | Right | Result | Behavior |
|------|-------|--------|----------|
| string | string | boolean | Returns `.T.` when the right string is empty, when both strings are equal, or when the left string starts with the right string. |
| string | non-string | boolean | Returns `.F.`. |
| number | number | boolean | Returns `.T.` when both numeric values are exactly equal. |
| boolean | boolean | boolean | Returns `.T.` when both boolean values are the same. |
| date | date | boolean | Returns `.T.` when both dates are equal. |
| array | array | boolean | Returns `.T.` only when both operands reference the same array instance. |
| object | object | boolean | Returns `.T.` only when both operands reference the same object instance. |
| NIL | NIL | boolean | Returns `.T.`. |
| NIL | non-`NIL` | boolean | Returns `.F.`. |
| code block | any | error | Raises a runtime error. |

### `greater-than-or-equal`

> Compares two values of the same supported type and returns .T. when the left operand is greater than or equal to the right operand.

```ssl
vLeft >= vRight
```

**Type behavior:**

| Left | Right | Result | Behavior |
|------|-------|--------|----------|
| number | number | boolean | Returns `.T.` when the left number is greater than or equal to the right number. |
| date | date | boolean | Returns `.T.` when the left date is later than or the same as the right date. |
| string | string | boolean | Returns `.T.` when the left string sorts after or exactly matches the right string in case-sensitive invariant order. |

### `greater-than`

> Compares two values of the same supported type and returns .T. when the left operand is strictly greater than the right operand.

```ssl
vLeft > vRight
```

**Type behavior:**

| Left | Right | Result | Behavior |
|------|-------|--------|----------|
| number | number | boolean | Returns `.T.` when the left number is greater than the right number. |
| date | date | boolean | Returns `.T.` when the left date is later than the right date. |
| string | string | boolean | Returns `.T.` when the left string sorts after the right string in case-sensitive invariant order. |

### `hash`

> Returns .T. when two values are not equal and .F. when they are equal.

```ssl
bResult := vLeft # vRight;
```

**Type behavior:**

| Left | Right | Result | Behavior |
| --- | --- | --- | --- |
| number | number | boolean | Returns `.T.` when the values differ numerically. |
| boolean | boolean | boolean | Returns `.T.` when the boolean values differ. |
| date | date | boolean | Returns `.T.` when the dates differ. |
| string | string | boolean | Returns `.T.` when the strings are not equal under SSL's prefix matching. |
| string | non-string | boolean | Returns `.T.` (underlying `=` returns `.F.`). |
| array | array | boolean | Returns `.T.` unless both operands reference the same array instance. |
| object | object | boolean | Returns `.T.` unless both operands reference the same object instance. |
| NIL | NIL | boolean | Returns `.F.`. |
| NIL | non-`NIL` | boolean | Returns `.T.`. |
| number/boolean/date | incompatible | error | Raises a runtime invalid-operand error. |

### `increment`

> Increases a number variable by one, modifying its value in place.

```ssl
variable++
```

**Type behavior:**

| Left | Right | Result | Behavior |
|------|-------|--------|----------|
| number | n/a | number | Adds 1 to the variable in place. |

### `less-than-or-equal`

> Compares two values of the same supported type and returns .T. when the left operand is less than or equal to the right operand.

```ssl
vLeft <= vRight
```

**Type behavior:**

| Left | Right | Result | Behavior |
|------|-------|--------|----------|
| number | number | boolean | Returns `.T.` when the left number is less than or equal to the right number. |
| date | date | boolean | Returns `.T.` when the left date is earlier than or the same as the right date. |
| string | string | boolean | Returns `.T.` when the left string sorts before or exactly matches the right string in case-sensitive invariant order. |

### `less-than`

> Compares two values of the same supported type and returns .T. when the left operand is strictly less than the right operand.

```ssl
vLeft < vRight
```

**Type behavior:**

| Left | Right | Result | Behavior |
|------|-------|--------|----------|
| number | number | boolean | Returns `.T.` when the left number is less than the right number. |
| date | date | boolean | Returns `.T.` when the left date is earlier than the right date. |
| string | string | boolean | Returns `.T.` when the left string sorts before the right string in case-sensitive invariant order. |

### `minus`

> Subtracts numbers, trims trailing spaces before string concatenation, or performs date arithmetic depending on operand types.

```ssl
vLeft - vRight
```

**Type behavior:**

| Left | Right | Result | Behavior |
|------|-------|--------|----------|
| number | number | number | Subtracts the right numeric value from the left. |
| string | string | string | Trims trailing spaces from the left operand, then concatenates the right operand. |
| date | number | date | Subtracts the specified number of days from the date. |
| date | date | number | Returns the difference in days between the two dates. |

### `modulo-assign`

> Updates a numeric variable, property, or array element in place by applying % and storing the remainder back into the left side.

```ssl
target %= divisor;
```

**Type behavior:**

| Left | Right | Result | Behavior |
|------|-------|--------|----------|
| number | number | number | Computes `left % right`, stores the remainder back into the left operand, and returns the updated value. |

### `modulo`

> Calculates the remainder after dividing one number by another.

```ssl
nRemainder := nLeft % nRight;
```

**Type behavior:**

| Left | Right | Result | Behavior |
| --- | --- | --- | --- |
| number | number | number | Returns the remainder of dividing the left operand by the right operand. |
| number | non-number | error | Raises a runtime operand error for `%`. |
| non-number | any | error | Raises a runtime operator error because `%` is not supported for the left operand type. |

### `multiply-assign`

> Multiplies a numeric value by another numeric value and stores the product back in the left operand.

```ssl
target *= value;
```

**Type behavior:**

| Left | Right | Result | Behavior |
| --- | --- | --- | --- |
| number | number | number | Multiplies the left value by the right value and stores the product back in the left operand. |

### `multiply`

> Multiplies one number by another number and returns the product.

```ssl
nProduct := nLeft * nRight;
```

**Type behavior:**

| Left | Right | Result | Behavior |
|------|-------|--------|----------|
| number | number | number | Returns the product of the two numeric operands. |
| number | non-number | error | Raises a runtime invalid-operand error for `*`. |
| non-number | any | error | Raises a runtime operator error because multiplication is not supported for the left operand type. |

### `not-equals-legacy`

> Returns .T. when two values are not equal under SSL's strict inequality rules.

```ssl
bDifferent := vLeft <> vRight;
```

**Type behavior:**

| Left | Right | Result | Behavior |
|------|-------|--------|----------|
| string | string | boolean | Returns `.T.` when the strings are not exactly equal. |
| string | non-string | boolean | Returns `.T.`. |
| number | number | boolean | Returns `.T.` when the numeric values differ. |
| boolean | boolean | boolean | Returns `.T.` when the boolean values differ. |
| date | date | boolean | Returns `.T.` when the dates differ. |
| array | array | boolean | Returns `.T.` unless both operands reference the same array instance. |
| object | object | boolean | Returns `.T.` unless both operands reference the same object instance. |
| `NIL` | `NIL` | boolean | Returns `.F.`. |
| `NIL` | non-`NIL` | boolean | Returns `.T.`. |
| code block | any | error | Raises a runtime error. |

### `not-equals`

> Returns .T. when two values are not strictly equal under SSL equality rules.

```ssl
bDifferent := vLeft != vRight;
```

**Type behavior:**

| Left | Right | Result | Behavior |
|------|-------|--------|----------|
| string | string | boolean | Returns `.T.` when the strings are not exactly equal. |
| string | non-string | boolean | Returns `.T.`. |
| number | number | boolean | Returns `.T.` when the numeric values differ. |
| boolean | boolean | boolean | Returns `.T.` when the boolean values differ. |
| date | date | boolean | Returns `.T.` when the dates differ. |
| array | array | boolean | Returns `.T.` unless both operands reference the same array instance. |
| object | object | boolean | Returns `.T.` unless both operands reference the same object instance. |
| `NIL` | `NIL` | boolean | Returns `.F.`. |
| `NIL` | non-`NIL` | boolean | Returns `.T.`. |
| code block | any | error | Raises a runtime error. |

### `not`

> Performs boolean negation, returning .T. for .F. and .F. for .T..

```ssl
.NOT. booleanExpression
.NOT. (compoundExpression)
```

**Type behavior:**

| Left | Right | Result | Behavior |
|------|-------|--------|----------|
| n/a | boolean | boolean | Returns the logical negation of the operand. `.NOT. .T.` becomes `.F.`, and `.NOT. .F.` becomes `.T.`. |

### `or`

> Combines two boolean expressions and returns .T. when either operand is .T..

```ssl
leftBoolean .OR. rightBoolean
```

**Type behavior:**

| Left | Right | Result | Behavior |
|------|-------|--------|----------|
| boolean | boolean | boolean | Returns `.T.` when either operand is `.T.`. If the left operand is `.T.`, the right operand is not evaluated. |

### `plus`

> Adds numbers, concatenates strings, or adds days to dates depending on operand types.

```ssl
left + right
```

**Type behavior:**

| Left | Right | Result | Behavior |
| --- | --- | --- | --- |
| number | number | number | Adds the two numeric values. |
| string | string | string | Concatenates the two strings. |
| date | number | date | Adds the numeric day offset to the date. |

### `power-assign`

> Raises a numeric value to a numeric power and stores the result back into the left side.

```ssl
target ^= value;
```

**Type behavior:**

| Left | Right | Result | Behavior |
|------|-------|--------|----------|
| number | number | number | Raises the left value to the power of the right value and stores the result back in the left operand. |

### `power`

> Raises one number to the exponent of another number.

```ssl
nResult := nBase ^ nExponent;
```

**Type behavior:**

| Left | Right | Result | Behavior |
|------|-------|--------|----------|
| number | number | number | Raises the left operand to the power of the right operand. |
| any other type | any | error | Raises an operator-not-implemented runtime error because the left operand type does not support power. |
| number | any other type | error | Raises an invalid-operand runtime error because the right operand is not numeric. |

### `shift-left`

> Shifts the bits of one integer number to the left by the number of positions specified by another integer number.

```ssl
nResult := nLeft << nShiftCount;
```

**Type behavior:**

| Left | Right | Result | Behavior |
|------|-------|--------|----------|
| number | number | number | Shifts the left integer value left by the number of positions specified by the right integer value. Both operands must be numeric integers. |

### `shift-right`

> Shifts the bits of one integer number to the right by the number of positions specified by another integer number.

```ssl
nResult := nLeft >> nShiftCount;
```

**Type behavior:**

| Left | Right | Result | Behavior |
|------|-------|--------|----------|
| number | number | number | Shifts the left integer value right by the number of positions specified by the right integer value. Both operands must be numeric integers. |

### `strict-equals`

> Returns .T. when two values are strictly equal under SSL equality rules.

```ssl
bEqual := vLeft == vRight;
```

**Type behavior:**

| Left | Right | Result | Behavior |
|------|-------|--------|----------|
| string | string | boolean | Returns `.T.` only when both strings are exactly equal. |
| string | non-string | boolean | Returns `.F.`. |
| number | number | boolean | Returns `.T.` when both numeric values are exactly equal. |
| boolean | boolean | boolean | Returns `.T.` when both boolean values are the same. |
| date | date | boolean | Returns `.T.` when both date values are equal. |
| array | array | boolean | Returns `.T.` only when both operands reference the same array instance. |
| object | object | boolean | Returns `.T.` only when both operands reference the same object instance. |
| `NIL` | `NIL` | boolean | Returns `.T.`. |
| `NIL` | non-`NIL` | boolean | Returns `.F.`. |
| code block | any | error | Raises a runtime error. |

### `subtract-assign`

> Updates a variable, property, or array element in place by applying - and then storing the result back into the left side.

```ssl
target -= value;
```

**Type behavior:**

| Left | Right | Result | Behavior |
| --- | --- | --- | --- |
| number | number | number | Subtracts the right numeric value from the left value and stores the difference. |
| string | string | string | Trims trailing spaces from the left operand, then appends the right string and stores the result. |
| date | number | date | Subtracts the right value as days from the left date and stores the new date. |
| date | date | number | Computes the day difference and stores that numeric result back into the left target. |

---

## Literals (3)

### `false`

> The .F. literal represents the boolean value false in SSL. It can be written as .F. or .f. (case-insensitive). Use .F. to initialize boolean flags, to explicitly pass a false argument to a function, or to represent a negative or disabled state.

**Syntax:** `.F.` is case-insensitive; both `.F.` and `.f.` are valid SSL syntax.

### `nil`

> NIL is the SSL literal for an explicit absent value. It is case-insensitive, so NIL, nil, and Nil are all valid spellings.

**Syntax:** `NIL`

### `true`

> The .T. literal represents the boolean value true in SSL and is case-insensitive.

**Syntax:** `.T.`

---

## Types (8)

### `array`

> Represents ordered, 1-based collections of SSL values, including nested arrays.

**Operators:**

| Operator | Symbol | Returns | Behavior |
|---|---|---|---|
| `strict-equals` | `==` | boolean | Returns `.T.` only when both operands reference the same array instance. |
| `not-equals` | `!=` | boolean | Returns `.T.` when the operands do not reference the same array instance. |

**Members:**

| Member | Kind | Parameters | Returns | Description |
|---|---|---|---|---|
| `Append` | Method | `element` (`any`) | none | Adds an element to the end of the array. |
| `RemoveAt` | Method | `index` (`number`) | none | Removes the element at the specified 1-based position. |
| `InsertAt` | Method | `index` (`number`), `value` (`any`) | none | Inserts a value at the specified 1-based position. |
| `Index` | Method | `index` (`number`) | `any` | Returns the value at the specified 1-based position. In SSL code this is normally used through indexing syntax such as `aValues[2]`. |
| `IsEmpty` | Method | none | `boolean` | Returns `.T.` when the array has zero elements. |
| `ToJson` | Method | none | `string` | Serializes the array as JSON array text. |
| `clone` | Method | none | `array` | Returns a deep copy of the array and its contained values. |
| `GetList` | Method | none | `any` | Returns the array contents in list form for APIs that expose list-style access. |
| `value` | Property | — | `any` | Gets or replaces the full array contents. |
| `Count` | Property | — | `number` | Returns the number of top-level elements. |

### `boolean`

> Represents logical true/false values in SSL.

**Runtime type:** `LOGIC`

**Operators:**

| Operator | Symbol | Returns | Behavior |
| --- | --- | --- | --- |
| `and` | `.AND.` | boolean | Logical AND. Returns `.T.` only when both operands are boolean true. Short-circuits evaluation. |
| `or` | `.OR.` | boolean | Logical OR. Returns `.T.` when either operand is boolean true. Short-circuits evaluation. |
| `not` | `.NOT.` | boolean | Logical negation of a boolean value. `!` is also supported. |
| `equals` | `=` | boolean | Equality comparison. Returns `.T.` when both operands are booleans with the same value. |
| `strict-equals` | `==` | boolean | Exact equality comparison. For booleans, behaves the same as `=`. |

**Members:**

*Properties*

| Member | Returns | Description |
| --- | --- | --- |
| `value` | boolean | The stored boolean value. |

*Methods*

| Member | Returns | Description |
| --- | --- | --- |
| `And(vValue)` | boolean | Returns the logical AND of this boolean and another boolean value. Raises a runtime error for non-boolean operands. |
| `Or(vValue)` | boolean | Returns the logical OR of this boolean and another boolean value. Raises a runtime error for non-boolean operands. |
| `Not()` | boolean | Returns the negated boolean value. |
| `Eq(vValue)` | boolean | Returns `.T.` when both operands are booleans with the same value. Raises a runtime error for non-boolean operands. |
| `EqEq(vValue)` | boolean | Exact equality check. For booleans, this behaves the same as `Eq(vValue)`. |
| `IsEmpty()` | boolean | Returns `.T.` when the boolean is `.F.` and `.F.` when the boolean is `.T.`. |
| `ToJson()` | string | Returns the JSON boolean text `true` or `false`. |
| `clone()` | boolean | Returns a copy of the boolean value. |

### `codeblock`

> Represents a callable expression value that you can store, pass, and evaluate.

**Runtime type:** `CODEBLOCK`

**Operators:**

| Operator | Symbol | Returns | Behavior |
|----------|--------|---------|----------|
| `equals` | `=` | error | Raises a runtime error. |
| `strict-equals` | `==` | error | Raises a runtime error. |
| `not-equals` | `!=` | error | Raises a runtime error. |

**Members:**

| Member | Kind | Returns | Description |
|--------|------|---------|-------------|
| `eval` | Method | `any` | Evaluates the code block with the arguments you provide. |
| `IsEmpty()` | Method | `boolean` | Returns `.T.` when the code block is uninitialized, otherwise `.F.`. |
| `ToString()` | Method | `string` | Always returns the fixed text `Code block`. Does not expose the parameter list or expression body. |
| `clone()` | Method | `code block` | Creates another code block value that reuses the same callable logic. |

### `date`

> The date type represents calendar-based values in SSL. Use it for date arithmetic, ordering, formatting, and serialization without converting values to strings first.

**Runtime type:** `DATE`

**Operators:**

| Operator | Symbol | Returns | Behavior |
| --- | --- | --- | --- |
| `plus` | `+` | date | Adds a numeric day offset and returns a new date. If the left-hand date is empty, the result stays empty. |
| `minus` | `-` | date or number | Subtracts a numeric day offset and returns a new date, or subtracts one date from another and returns the difference in days. |
| `equals` | `=` | boolean | Returns `.T.` when two dates have the same stored value. |
| `strict-equals` | `==` | boolean | Behaves the same as `=` for date values. |
| `not-equals` | `!=` | boolean | Returns `.T.` when two dates differ. |
| `less-than` | `<` | boolean | Returns `.T.` when the left date is earlier than the right date. |
| `greater-than` | `>` | boolean | Returns `.T.` when the left date is later than the right date. |
| `less-than-or-equal` | `<=` | boolean | Returns `.T.` when the left date is earlier than or equal to the right date. |
| `greater-than-or-equal` | `>=` | boolean | Returns `.T.` when the left date is later than or equal to the right date. |

**Members:**

| Member | Kind | Returns | Description |
| --- | --- | --- | --- |
| `value` | Property | `date` | Gets or sets the stored date value. |
| `IsEmpty()` | Method | `boolean` | Returns `.T.` when the date is empty, `.F.` otherwise. |
| `ToString()` | Method | `string` | Formats the date using the default `MM/dd/yyyy` display format. Returns `"  /  /    "` when the date is empty. |
| `ToString(sFormat)` | Method | `string` | Formats the date using a caller-supplied format string. Returns `"  /  /    "` when the date is empty. |
| `ToJson()` | Method | `string` | Serializes the date to an ISO 8601 date/time string wrapped as JSON text. Returns `null` for empty dates. |
| `clone()` | Method | `date` | Creates a copy of the current date value. |
| `MakeInvariant()` | Method | `NIL` | Marks the date as a wall-clock value with no time-zone offset in JSON output. |
| `MakeLocal()` | Method | `NIL` | Marks the date as a local-time value so JSON output includes the local offset. |
| `ChangeKind(nKind)` | Method | `NIL` | Changes how the stored date is interpreted for later serialization. |

### `netobject`

> Provides dynamic access to external objects for property access, method invocation, and selected interop scenarios in SSL.

**Runtime type:** `OBJECT`

**Members:**

| Member | Kind | Returns | Description |
|---|---|---|---|
| `GetProperty(sName)` | Method | `any` | Reads a public field or property by name. |
| `SetProperty(sName, vValue)` | Method | `none` | Writes an existing public field or property by name. |
| `IsProperty(sName)` | Method | `boolean` | Returns `.T.` when a public field or property with the given name exists. |
| `Invoke(sName, [aArgs])` | Method | `any` | Calls a public method by name and returns its result. |
| `IsEmpty()` | Method | `boolean` | Returns `.T.` only when the wrapped reference is null. |
| `ToJson()` | Method | `string` | Serializes the wrapped value to JSON when it is a `DataSet`. Other wrapped values raise an error. |

### `number`

> The number type represents numeric values in SSL. Use it for arithmetic, ordering, exact numeric comparisons, shifts, and integer-only bitwise work.

**Runtime type:** `NUMERIC`

**Operators:**

| Operator | Symbol | Returns | Behavior |
|----------|--------|---------|----------|
| `plus` | `+` | number | Adds two numbers. |
| `minus` | `-` | number | Subtracts the right operand from the left operand. |
| `multiply` | `*` | number | Multiplies two numbers. |
| `divide` | `/` | number | Divides the left operand by the right operand. Division by zero raises an error. |
| `modulo` | `%` | number | Returns the remainder after division. |
| `power` | `^` or `**` | number | Raises the left operand to the power of the right operand. |
| `shift-left` | `<<` | number | Shifts bits left. Both operands must be integer-valued numbers. |
| `shift-right` | `>>` | number | Shifts bits right. Both operands must be integer-valued numbers. |
| `equals` | `=` | boolean | Returns `.T.` when two numbers are equal. |
| `strict-equals` | `==` | boolean | Behaves the same as `=` for numeric values. |
| `not-equals` | `!=` | boolean | Returns `.T.` when two numbers differ. |
| `less-than` | `<` | boolean | Returns `.T.` when the left operand is smaller. |
| `greater-than` | `>` | boolean | Returns `.T.` when the left operand is larger. |
| `less-than-or-equal` | `<=` | boolean | Returns `.T.` when the left operand is smaller or equal. |
| `greater-than-or-equal` | `>=` | boolean | Returns `.T.` when the left operand is larger or equal. |

*Integer bitwise built-ins*

| Built-in | Returns | Behavior |
|----------|---------|----------|
| `_AND(nA, nB)` | number | Bitwise AND of two integer-valued numbers. |
| `_OR(nA, nB)` | number | Bitwise OR of two integer-valued numbers. |
| `_XOR(nA, nB)` | number | Bitwise XOR of two integer-valued numbers. |
| `_NOT(nA)` | number | Bitwise complement of an integer-valued number. |

**Members:**

| Member | Kind | Returns | Description |
|--------|------|---------|-------------|
| `value` | Property | `number` | Gets or sets the stored numeric value. |
| `IsInt` | Property | `boolean` | Returns `.T.` when the value is a whole number within the 32-bit signed integer range (`-2147483648` through `2147483647`). |
| `IsInt64` | Property | `boolean` | Returns `.T.` when the value is a whole number within the 64-bit signed integer range. |
| `IsEmpty()` | Method | `boolean` | Returns `.T.` when the value is `0`, `.F.` otherwise. |
| `ToString()` | Method | `string` | Formats the number using the default numeric string representation. |
| `ToString(sDecimal, sGroup)` | Method | `string` | Formats the number using caller-supplied decimal and group separators. |
| `ToJson()` | Method | `string` | Serializes the number with `.` as the decimal separator and `,` as the group separator. |
| `clone()` | Method | `number` | Creates a copy of the current numeric value. |

### `object`

> Represents SSL object values, including dynamic objects and class instances.

**Operators:**

| Operator | Symbol | Returns | Behavior |
|---|---|---|---|
| `strict-equals` | `==` | boolean | Returns `.T.` only when both operands reference the same object instance. |
| `not-equals` | `!=` | boolean | Returns `.T.` when the operands do not reference the same object instance. |

**Members:**

| Member | Kind | Parameters | Returns | Description |
|---|---|---|---|---|
| `XmlType` | Property | — | `string` | Gets or sets the XML type name used by `Serialize()`. |
| `AddProperty(sName)` | Method | `sName` (`string`) | `string` | Adds a dynamic property with an empty-string value and returns its name. If the property already exists, it is reset to `""`. |
| `GetProperty(sName)` | Method | `sName` (`string`) | `any` | Returns the named property value. |
| `SetProperty(sName, vValue)` | Method | `sName` (`string`), `vValue` (`any`) | none | Sets the named property value. |
| `IsProperty(sName)` | Method | `sName` (`string`) | `boolean` | Returns `.T.` when the named property exists. `XmlType` is always recognized as a property. |
| `GetPropList()` | Method | none | `array` | Returns property names. On dynamic objects this is the dynamic-property list; on other object values it can also include declared public members. |
| `GetDynPropList()` | Method | none | `array` | Returns only dynamic property names. |
| `Serialize()` | Method | none | `string` | Serializes the object as XML using `XmlType` as the root element name. |
| `Deserialize(sXml, [aTypeMapping])` | Method | `sXml` (`string`), `aTypeMapping` (`array`, optional) | `object` | Populates the current object from XML and returns that same object. |
| `IsEmpty()` | Method | none | `boolean` | Always returns `.F.` for object values. |
| `IsMethod(sName)` | Method | `sName` (`string`) | `boolean` | Returns `.T.` when the named method is callable on the object. |
| `InvokeMethod(sName, [aArgs])` | Method | `sName` (`string`), `aArgs` (`array` or `NIL`) | `any` | Calls a method by name using dynamic dispatch. |
| `clone()` | Method | none | `object` | Returns a deep copy for dynamic objects created with `CreateLocal()` or `CreateUdObject()`. |
| `ToString()` | Method | none | `string` | On dynamic objects, returns the serialized XML text. |
| `Destroy()` | Method | none | none | Runs object cleanup logic. The base implementation does nothing. |

### `string`

> Represents SSL text values, including string literals, comparisons, indexing, and JSON serialization.

**Operators:**

| Operator | Symbol | Returns | Behavior |
|---|---|---|---|
| `plus` | `+` | `string` | Concatenates two string values. |
| `minus` | `-` | `string` | Trims trailing spaces from the left operand, then concatenates the right operand. |
| `dollar` | `$` | `boolean` | Returns `.T.` when the left string is found anywhere inside the right string. |
| `equals` | `=` | `boolean` | Returns `.T.` when the right string is empty, exactly equal to the left string, or a prefix of the left string. |
| `strict-equals` | `==` | `boolean` | Returns `.T.` only when both strings are exactly equal. |
| `less-than` | `<` | `boolean` | Lexicographic comparison against another string. |
| `greater-than` | `>` | `boolean` | Lexicographic comparison against another string. |
| `less-than-or-equal` | `<=` | `boolean` | Lexicographic less-than-or-equal comparison against another string. |
| `greater-than-or-equal` | `>=` | `boolean` | Lexicographic greater-than-or-equal comparison against another string. |

**Members:**

| Member | Kind | Parameters | Returns | Description |
|---|---|---|---|---|
| `value` | Property | — | `string` | Returns the stored text value. |
| `clone()` | Method | none | `string` | Returns a copy of the string. |
| `IsEmpty()` | Method | none | `boolean` | Returns `.T.` when the value is null, empty, or only whitespace made of spaces, tabs, carriage returns, or line feeds. |
| `ToJson()` | Method | none | `string` | Returns JSON string text, or `null` when the string value is null. |
| `CompareTo(sOther)` | Method | `sOther` (`string`) | `number` | Returns a negative number, `0`, or a positive number based on lexical ordering. |
| `Index(nPos)` | Method | `nPos` (`number`) | `string` | Returns the character at the specified 1-based position. In SSL code this is normally used through `sValue[nPos]`. |

---

## Classes (29)

### `AzureStorage`

> Provides SSL access to Azure Table Storage and Azure Blob Storage through one class.

**Constructors:**

- `AzureStorage{}` — Uses the first configured Azure connection available to the application.
- `AzureStorage{sConnectionName}` — Uses the named Azure connection from the application configuration.
- `AzureStorage{sAccountName, sAccountKey}` — Creates the client from an explicit Azure account name and key.
- `AzureStorage{sAccountName, sAccountKey, bUseHttp}` — Creates the client from an explicit Azure account name and key.

**Methods:**

| Name | Returns | Description |
|------|---------|-------------|
| `CreateTable` | none | Creates a table if needed. |
| `DeleteTable` | none | Deletes a table if it exists. |
| `InsertEntity` | none | Inserts one table entity. |
| `InsertEntities` | none | Inserts multiple table entities in batches. |
| `SelectEntity` | object | Returns one entity or `NIL` when not found. |
| `SelectEntities` | array | Returns entities that match an equality-based filter. |
| `DeleteEntity` | none | Deletes one entity if it exists. |
| `DeleteEntities` | none | Deletes multiple entities in batches. |
| `UpdateEntity` | boolean | Updates one entity and reports success. |
| `CreateContainer` | none | Creates a blob container if needed. |
| `DeleteContainer` | none | Deletes a blob container if it exists. |
| `PutBlob` | none | Uploads a local file as a blob. |
| `GetBlob` | string | Downloads a blob and returns the local file path. |
| `DeleteBlob` | none | Deletes a blob. |
| `ReadBlobAsText` | string | Returns blob contents as text. |

### `BatchSupport`

> Provides batch-status checks and memory usage information for the current SSL process.

**Constructors:**

- `BatchSupport{}` — Creates a `BatchSupport` instance bound to the current SSL process so its memory properties can be read.

**Properties:**

| Name | Type | Access | Description |
|------|------|--------|-------------|
| `ActiveBatchesNumber` | number | read-only | Number of active batches in the current application. |
| `PhysicalMemory` | number | read-only | Current process physical memory usage in bytes. Returns `-1` after `Dispose()`. |
| `VirtualMemory` | number | read-only | Current process virtual memory usage in bytes. Returns `-1` after `Dispose()`. |

**Methods:**

| Name | Returns | Description |
|------|---------|-------------|
| `Dispose()` | none | Releases the instance's process resources. |
| `IsRunning(vBatchId)` | boolean | Checks whether a named batch or integer process ID is currently running. |

### `CDataColumn`

> Provides metadata for a single column in a CDataTable.

**Properties:**

| Name | Type | Access | Description |
| --- | --- | --- | --- |
| `DBType` | number | read-only | Numeric type code for the column. Unknown types return `0`. |
| `FType` | string | read-only | Type label for the column, such as `SQL_INTEGER`, `SQL_VARCHAR`, `SQL_DATE`, or `SQL_BINARY`. Unknown types return an empty string. |
| `IsBlob` | boolean | read-only | `.T.` when the column stores binary data. |
| `IsPk` | boolean | read-only | `.T.` when the column is part of the table's current primary key. |
| `Length` | number | read-write | Maximum length for the column. |
| `Name` | string | read-write | Column name. |
| `Scale` | number | read-only | Always returns `0`. |
| Data kind | `DBType` | `FType` |
| --- | --- | --- |
| Boolean | `-7` | `SQL_BIT` |
| Byte | `-6` | `SQL_TINYINT` |
| Date | `9` | `SQL_DATE` |
| Decimal | `8` | `SQL_DOUBLE` |
| Double | `6` | `SQL_FLOAT` |
| Short integer | `5` | `SQL_SMALLINT` |
| Integer | `4` | `SQL_INTEGER` |
| Long integer | `-5` | `SQL_BIGINT` |
| Float | `7` | `SQL_REAL` |
| String | `12` | `SQL_VARCHAR` |
| Binary | `-2` | `SQL_BINARY` |

### `CDataColumns`

> Provides access to the column definitions of a CDataTable.

**Constructors:**

- `CDataColumns{oDataTable}` — | Parameter | Type | Required | Description | |-----------|------|----------|-------------|

**Properties:**

| Name | Type | Access | Description |
|------|------|--------|-------------|
| `Count` | number | read-only | Number of columns in the collection. |
| `ParentTable` | object | write-only | Assigns a parent `CDataTable` to the collection. The assigned value is not readable from SSL. |

**Methods:**

| Name | Returns | Description |
|------|---------|-------------|
| `Add(oCol)` | none | Accepts a column argument, but does not add it to the collection. |
| `GetIndex(sColName)` | number | Returns the 1-based position of a named column, or `0` if it is not found. |
| `Set(nIndex, oColumn)` | `NIL` | Accepts an index and column argument, but does not update the collection. |
| `Get(vIndex)` | object | Returns a `CDataColumn` by name or by 1-based index. |

### `CDataField`

> Represents one field in a CDataRow.

**Properties:**

| Name | Type | Access | Description |
|------|------|--------|-------------|
| `IsNull` | boolean | read-only | `.T.` when the field value is null |
| `Value` | any | read-write | Gets or sets the field value. For binary fields, reading returns a file path and writing expects a file path instead of raw bytes. |

### `CDataRow`

> Represents one row in a CDataTable.

**Properties:**

| Name | Type | Access | Description |
|------|------|--------|-------------|
| `Table` | object | read-only | Parent `CDataTable` for this row. |

### `CDataTable`

> Provides an in-memory table object for working with rows, columns, XML, and database persistence from SSL.

**Constructors:**

- `CDataTable{}` — Creates an empty table.
- `CDataTable{oDataTable, sImportFolder}` — Wraps an existing table object and associates an import folder with it.
- `CDataTable{sName, nColCount}` — Creates an empty named table.

**Properties:**

| Name | Type | Access | Description |
|------|------|--------|-------------|
| `Columns` | object | read-only | `CDataColumns` collection for the current schema. |
| `ErrMsg` | string | read-only | Error text property exposed by the class. The documented methods on this page do not populate it. |
| `ImportFolder` | string | read-write | Folder associated with imported content and extracted binary values. Setting it to `NIL` clears it to an empty string. |
| `InnerTable` | object | read-only | Underlying table handle for advanced integration scenarios. |
| `IsSystem` | boolean | read-write | Controls whether generated SQL and persistence target system-table context. |
| `Name` | string | read-write | Table name. |
| `NullAsBlank` | boolean | read-write | Controls whether null values are converted to blank or default values in array and XML conversions. |
| `PkColumns` | array | read-only | Array of `CDataColumn` objects that make up the primary key. |
| `Rows` | array | read-only | Array of `CDataRow` objects for all rows in the table. |
| `RowsCount` | number | read-only | Number of rows in the table. |

**Methods:**

| Name | Returns | Description |
|------|---------|-------------|
| `AddPK(vPks)` | boolean | Assigns one or more columns as the table's primary key. |
| `AddRow(oRow)` | none | Appends an existing `CDataRow` to the table. |
| `NewRow()` | object | Creates a new unattached `CDataRow` for this table. |
| `GetInsertSql()` | string | Returns an `INSERT` statement for the current schema, excluding binary columns. |
| `GetUpdateSql()` | string | Returns an `UPDATE` statement for the current schema, using primary-key columns in the `WHERE` clause and excluding binary columns. |
| `SaveToDb(bOverwrite, aWhereFields, aFieldsValues, bDoAudit, aSkipColumns)` | boolean | Persists current rows, or a selected subset of current rows, to the database. |
| `Select(vWhereFields, aFieldsValues)` | array | Returns matching `CDataRow` objects. |
| `ToArray()` | array | Returns the table as a 2D array of values. |
| `ToXml()` | string | Serializes the table, including schema, to XML. |
| `UpdateField(sFieldName, vNewValue, vOldValue)` | boolean | Replaces one field value across matching rows. |
| `UpdateFieldFromArray(sFieldName, aValues)` | boolean | Replaces field values by key lookup from an array of `{newValue, key}` pairs. |
| `FromXml(sXml)` | `NIL` | Replaces the current table with the first table read from XML. |

### `Email`

> Composes, loads, saves, sends, or queues email messages with attachments and optional signing or encryption.

**Constructors:**

- `Email{}` — Creates an `Email` object with exception suppression enabled by default. Operations return `.T.` or `.F.`, and failures are exposed through the `Exception` property.
- `Email{bIgnoreExceptions}` — | Parameter | Type | Required | Description | |-----------|------|----------|-------------|

**Properties:**

| Name | Type | Access | Description |
|------|------|--------|-------------|
| `Attachments` | array | read-write | File paths to attach when building the message. |
| `BCC` | array | read-write | Blind carbon copy recipients. |
| `Body` | string | read-write | Message body text. |
| `CC` | array | read-write | Carbon copy recipients. |
| `Exception` | `SSLError` | read-only | Most recent failure captured by the object. |
| `From` | string | read-write | Sender address. |
| `IgnoreExceptions` | boolean | read-write | Controls whether failures are suppressed or raised. |
| `IsHTMLBody` | boolean | read-write | When `.T.`, the body is sent as HTML as well as plain text. |
| `LogSMTP` | boolean | read-write | Writes an SMTP session log for direct `Send` calls. |
| `SMTPServerName` | string | read-write | SMTP server host name. |
| `SMTPServerPort` | number | read-write | SMTP server port. |
| `SMTPSecureConnection` | boolean | read-write | Enables a secure SMTP connection. |
| `SMTPServerUserName` | string | read-write | SMTP login user name. |
| `SMTPServerUserPassword` | string | read-write | SMTP login password. |
| `SMTPTimeout` | number | read-write | Timeout in seconds for direct `Send` calls. `0` uses the default timeout. |
| `Subject` | string | read-write | Message subject. |
| `To` | array | read-write | Primary recipients. |

**Methods:**

| Method | Returns | Description |
|--------|---------|-------------|
| `LoadMessage(sPathToMessage)` | boolean | Loads a message file for later `Send`. |
| `SaveMessage(sPathToMessage)` | boolean | Saves the current message to a file in message format. |
| `Send()` | boolean | Sends the current message through SMTP. |
| `SendToOutbox()` | boolean | Queues the current message for later delivery. |
| `SetEncryptCertificateFromPath(sPathToCertificate, sCertificatePassword)` | boolean | Loads the encryption certificate from a file. |
| `SetEncryptCertificateFromStore(sCertificateEmailAddress, sCertificateStoreName)` | boolean | Loads the encryption certificate from a certificate store. |
| `SetSignCertificateFromPath(sPathToCertificate, sCertificatePassword)` | boolean | Loads the signing certificate from a file. |
| `SetSignCertificateFromStore(sCertificateEmailAddress, sCertificateStoreName)` | boolean | Loads the signing certificate from a certificate store. |

### `EnterpriseExporter`

> Exports tables into a destination folder.

**Constructors:**

- `EnterpriseExporter{aTables, bSysTables, sPath}` — | Parameter | Type | Required | Description | |-----------|------|----------|-------------|

**Properties:**

| Name | Type | Access | Description |
|------|------|--------|-------------|
| `AbortOnError` | boolean | read-write | Writable flag on the class. In practice, setting it does not change `DoExport()` behavior. |
| `LogFile` | string | read-write | Log file path or `"console"` for console logging. |
| `IsEnterpriseOnly` | boolean | write-only | Switches the export to enterprise-only mode, where each table entry can supply a custom `FROM` source. |
| `FromSQL` | boolean | write-only | Switches the export to SQL mode, where each table entry can supply a full SQL statement. |
| `NullAsBlank` | boolean | write-only | In SQL mode, controls whether exported `NULL` values are treated as blanks. Defaults to `.F.`. |
| `InvariantDateColumns` | array | write-only | In SQL mode, supplies the invariant date columns passed to the export operation. |

**Methods:**

| Name | Returns | Description |
|------|---------|-------------|
| `DoExport()` | boolean | Runs the export and returns the completion result from the underlying export process. It also updates `ErrorMsg` with the final exporter message when the call returns normally. |

### `FtpsClient`

> Transfers files and manages directories on an FTPS server.

**Constructors:**

- `FtpsClient{}` — Creates a new FTPS client instance.

### `HtmlConverter`

> Converts XFD form XML into HTML form XML and exposes the most recent conversion log.

**Constructors:**

- `HtmlConverter{}` — Creates a converter with default conversion options and an empty log.

**Properties:**

| Name | Type | Access | Description |
|------|------|--------|-------------|
| `OptionsXml` | string | write-only | Sets the conversion option XML used by subsequent `Convert` calls |
| `Log` | string | read-only | Returns the full text of the current conversion log |
| `SimplifiedLog` | string | read-only | Returns a shorter summary of the current conversion log with repeated conversion messages collapsed |

**Methods:**

| Name | Returns | Description |
|------|---------|-------------|
| `Convert` | string | Converts XFD form XML to HTML form XML using the supplied source and target form IDs |
| `ClearLog` | none | Resets the current log to empty |

### `PatcherSupport`

> Provides helper methods for collecting package-style dictionary metadata, connecting to another STARLIMS system, and comparing one collected result table to another.

**Constructors:**

- `PatcherSupport{}` — Creates a new `PatcherSupport` object with an empty result table.

**Properties:**

| Name | Type | Access | Description |
|------|------|--------|-------------|
| `DiffDataTable` | string | read-only | Serialized dataset string produced by the most recent successful `Compare()` call. Empty until a comparison serializes the current result table. |
| `InternalErrors` | string | read-only | Accumulated error text captured when log-file setup fails or when metadata retrieval calls fail while collecting forms, scripts, data sources, or tables. |
| `LogFilePath` | string | read-write | Current log file path. Setting it attempts to create or replace the file and resets the active trace listeners to write to that file. |
| `ResultTable` | object | read-only | Current package table used for collected dictionary metadata and later comparison results. |

### `PdfSupport`

> Provides methods to create, modify, secure, save, and print PDF documents.

**Constructors:**

- `PdfSupport{}` — Creates a new empty PDF document. New instances use a default text style of Verdana, size 20, in black.

**Properties:**

| Name | Type | Access | Description |
|------|------|--------|-------------|
| `PageCount` | number | read-only | The total number of pages in the PDF document. |
| `UserPassword` | string | write-only | The user password required to open the PDF document. |
| `OwnerPassword` | string | write-only | The owner password for the PDF document that controls permissions. |
| `DocumentSecurityLevel` | string | read-write | The document security level. Valid values are `None`, `Encrypted40Bit`, and `Encrypted128Bit`. |
| `PermitAccessibilityExtractContent` | boolean | read-write | Whether content extraction for accessibility is permitted. |
| `PermitAnnotations` | boolean | read-write | Whether adding or modifying annotations is permitted. |
| `PermitAssembleDocument` | boolean | read-write | Whether assembling the document (inserting, rotating, or deleting pages) is permitted. |
| `PermitExtractContent` | boolean | read-write | Whether extracting text and graphics is permitted. |
| `PermitFormsFill` | boolean | read-write | Whether filling form fields is permitted. |
| `PermitFullQualityPrint` | boolean | read-write | Whether printing to full quality is permitted. |
| `PermitModifyDocument` | boolean | read-write | Whether modifying the document content is permitted. |
| `PermitPrint` | boolean | read-write | Whether printing the document is permitted. |

**Methods:**

| Name | Returns | Description |
|------|---------|-------------|
| `AddPageFromImage` | none | Adds a new page from an image file. |
| `AddPDFDocument` | none | Imports all pages from another PDF. |
| `AddTextOnPage` | none | Draws text on an existing page using the current text style. |
| `SetTextStyle` | none | Sets the text style used for later text drawing. |
| `Open` | none | Opens an existing PDF for modification. |
| `OpenProtectedDocument` | none | Opens a password-protected PDF for modification. |
| `Save` | none | Saves the current PDF document to a file. |
| `Print` | none | Prints a specified PDF file to a named printer. |
| `Protect` | none | Applies a predefined security profile to the current PDF document. |

### `RegSetup`

> Provides access to Windows registry values under HKEY_LOCAL_MACHINE.

**Constructors:**

- `RegSetup{}` — Creates a `RegSetup` instance with no open registry key.

**Methods:**

| Method | Returns | Description |
| --- | --- | --- |
| `RegOpenKey(sKey, nAccess)` | boolean | Opens a subkey under `HKEY_LOCAL_MACHINE`. |
| `RegQueryValue(sSubKey, nType)` | object | Reads a value from the currently open key. |
| `RegCloseKey()` | boolean | Closes the current key handle. |

### `SDMS`

> Interacts with an external SDMS server to download documents, download Unified XML templates, create an SDMSDocUploader, and generate password hashes for SDMS authentication.

**Constructors:**

- `SDMS{}` — Creates an instance without loading connection settings.
- `SDMS{oCredentials}` — Creates an instance and reads connection settings from `oCredentials`.

**Properties:**

| Name | Type | Access | Description |
|---|---|---|---|
| `ErrorMessage` | string | read-only | Error text from the most recent failed download, check-out, or template download request. |
| `IsSessionExpired` | boolean | read-only | Indicates whether the most recent download, check-out, or template download failed because the SDMS session expired. |
| `SessionId` | string | read-write | Session ID to send with requests when it is not empty. |

**Methods:**

| Method | Returns | Description |
|---|---|---|
| `CheckOutDocument(sDocId, sDestinationPath)` | boolean | Downloads the `NewRevision` version of a document to `sDestinationPath`. |
| `CreateDocUploader(oCredentials)` | `SDMSDocUploader` | Creates an `SDMSDocUploader` using the supplied credentials object. |
| `CreateUnifiedXmlDOM()` | object | Creates and returns a Unified XML DOM object. |
| `DownloadDocument(sDocId, sDocType, sDownloadTo)` | none | Deprecated. Always raises an exception. |
| `DownloadDocument2(sDocId, sDocType, sDestinationPath)` | boolean | Downloads the specified document type to `sDestinationPath`. |
| `DownloadOriginalDocument(sDocId, sDownloadTo)` | none | Deprecated. Always raises an exception. |
| `DownloadOriginalDocument2(sDocId, sDestinationPath)` | boolean | Downloads the original document by calling `DownloadDocument2(sDocId, "ORG", sDestinationPath)`. |
| `DownloadUnifiedXmlDocument(sDocId, sDownloadTo)` | none | Deprecated. Always raises an exception. |
| `DownloadUnifiedXmlDocument2(sDocId, sDestinationPath)` | boolean | Downloads the Unified XML version by calling `DownloadDocument2(sDocId, "UXML", sDestinationPath)`. |
| `DownloadUnifiedXmlTemplate(sTemplateId, sDestinationPath)` | boolean | Downloads a Unified XML template by numeric template ID or by template name. |
| `GetHttpPassHash(sDictPass)` | string | Converts a hexadecimal password string into the URL-encoded HTTP hash used by SDMS requests. |
| `GetSoapPassHash(sDictPass)` | string | Converts a hexadecimal password string into the Base64 SOAP hash used by SDMS requests. |
| `SetSDMSConnection(sUrl, sUserName, sPass, bPassIsHashed)` | none | Deprecated. Always raises an exception. |
| `UploadDocument(sFullFilePath, sClientFileName, sFileType, aKeylist)` | string | Deprecated. Always raises an exception before returning a value. |

### `SDMSDocUploader`

> Uploads files into SDMS, attaches uploads to workflow steps, and checks in document revisions.

**Constructors:**

- `SDMSDocUploader{oCredentials}` — Creates an uploader and loads the SDMS URL, username, password hash, site ID, and session ID from the credentials object. Workflow IDs start in a missing state and must be set before workflow-specific calls.
- `SDMSDocUploader{}` — Creates an uploader without loading SDMS connection or authentication values. Workflow IDs start at `0`, so the workflow-specific missing-ID validation described below does not run automatically unless you assign your own values.

**Properties:**

| Name | Type | Access | Description |
|---|---|---|---|
| `FilePath` | string | read-write | Local path of the file to upload or attach. |
| `DocName` | string | read-write | Document name sent to SDMS. For most upload methods, if this is blank it defaults to the file name from `FilePath`. `CheckInDocument()` still requires it to be set. |
| `DocId` | number | read-write | Target SDMS document ID. Uploads that return a document ID also update this property from the SDMS response. |
| `FileType` | string | read-write | SDMS file type value for upload requests. If blank, most upload methods use `Default`. |
| `ProjectName` | string | read-write | SDMS project name for upload requests. If blank, most upload methods use `DefaultProject`. |
| `WorkflowId` | number | read-write | Workflow identifier used by workflow-specific methods. |
| `StageId` | number | read-write | Workflow stage identifier used by workflow-specific methods. |
| `ActionId` | number | read-write | Workflow action identifier used by workflow-specific methods. |
| `Metadata` | array | read-write | Array of `{key, value}` pairs used only by `UploadOriginalDoc()` when `UXmlTemplate` is also set. |
| `UXmlTemplate` | string | read-write | UXML content used only by `UploadOriginalDoc()` when `Metadata` is also set. |

**Methods:**

| Method | Returns | Description |
|---|---|---|
| `UploadOriginalDoc()` | boolean | Uploads the file as an original SDMS document. |
| `AttachDocToWorkflow()` | boolean | Uploads the file and attaches it to the configured workflow, stage, and action. |
| `CheckInDocument(sRevision, sVersionStatus)` | boolean | Checks in a new revision for an existing SDMS document. |
| `AttachFileToDocument()` | boolean | Attaches a file to an existing SDMS document. |
| `UploadOfficeTemplate()` | boolean | Uploads the file as an Office template. |
| `UploadELNDocument()` | boolean | Uploads the file as an ELN document. |
| `AddHeader(sKey, sValue)` | none | Adds a custom header to later requests made by this uploader instance. |
| `RemoveHeader(sKey)` | none | Removes a custom header from later requests made by this uploader instance. |
| `DoUpload(sFilePath, sSdmsUrl)` | number | Performs a low-level upload and returns the document ID on success. |
| `CheckInWorkflowDocument(sRevision, sVersionStatus[, nDocEntryPoint])` | boolean | Adds workflow context, then checks in a document revision. |
| `UploadNewRevisionForWorkflowDocument([sCustomMessage])` | boolean | Uploads a new workflow revision with version status `newDoc`. |

### `SQLConnection`

> Represents a configured database connection returned by GetConnectionByName.

**Properties:**

| Name | Type | Access | Description |
|------|------|--------|-------------|
| `DataSource` | string | read-only | Server, DSN, or data source name from the connection string. |
| `DatabaseName` | string | read-only | Database name for SQL Server connections. Oracle connections return `"Not Set"`. |
| `UserId` | string | read-only | User name from the connection string. |
| `Password` | string | read-only | Password from the connection string. |
| `Platforma` | string | read-only | Database platform name, such as `"Microsoft SQL Server"`. |
| `ConnectionString` | string | read-only | Full connection string for the connection. |
| `UseUTC` | boolean | read-only | Whether the connection uses UTC timestamps. |

### `SSLBaseDictionary`

> Provides the shared dictionary surface used by SSL dictionary classes such as SSLStringDictionary{} and SSLIntDictionary{}.

**Properties:**

| Name | Type | Access | Description |
|------|------|--------|-------------|
| `Count` | number | read-only | Number of key-value pairs currently stored |
| `Keys` | array | read-only | Array containing the current keys |
| `Values` | array | read-only | Array containing the current values |

### `SSLCodeProvider`

> Compiles published server scripts and data sources and returns the compilation results as an SSLCompilerErrorList.

**Constructors:**

- `SSLCodeProvider{}` — Creates a code provider instance.

**Methods:**

| Name | Returns | Description |
|------|---------|-------------|
| `CompileAll` | `SSLCompilerErrorList` | Compiles all server scripts and data sources. |
| `CompileAllServerScripts` | `SSLCompilerErrorList` | Compiles all server scripts. |
| `CompileAllDataSources` | `SSLCompilerErrorList` | Compiles all data sources. |
| `CompileServerScript` | `SSLCompilerErrorList` | Compiles one server script by GUID or full name. |
| `CompileServerScripts` | `SSLCompilerErrorList` | Compiles multiple server scripts. |
| `CompileServerScriptCategory` | `SSLCompilerErrorList` | Compiles all server scripts in one category. |
| `CompileServerScriptCategories` | `SSLCompilerErrorList` | Compiles all server scripts in multiple categories. |
| `CompileDataSource` | `SSLCompilerErrorList` | Compiles one data source by GUID or full name. |
| `CompileDataSources` | `SSLCompilerErrorList` | Compiles multiple data sources. |
| `CompileDataSourceCategory` | `SSLCompilerErrorList` | Compiles all data sources in one category. |
| `CompileDataSourceCategories` | `SSLCompilerErrorList` | Compiles all data sources in multiple categories. |
| `CompileScript` | `SSLCompilerErrorList` | Accepts SSL code text, but currently raises a not-implemented error for non-null input. |

### `SSLDataset`

> Represents dataset results so SSL code can work with query output as an object, convert the first table to an array, export XML, or pass the dataset handle to APIs that expect one.

**Constructors:**

- `SSLDataset{}` — Creates an empty dataset object with no loaded data.
- `SSLDataset{oData, bNullAsBlank}` — Creates an `SSLDataset` from an existing dataset handle.

**Methods:**

| Name | Returns | Description |
|------|---------|-------------|
| `ToXml` | string | Serializes the current dataset to XML with schema and an XML declaration. |
| `ToArray` | array | Returns the first table as an array of rows. |
| `ToDataSet` | object | Returns the current dataset handle in object form. |

### `SSLError`

> Represents an SSL error and exposes its message, location, code, formatted diagnostic text, and nested SSL error details.

**Constructors:**

- `SSLError{oException}` — Wraps an exception object as an `SSLError`. In normal SSL code, use `GetLastSSLError()` instead of constructing `SSLError` yourself.

**Properties:**

| Name | Type | Access | Description |
|------|------|--------|-------------|
| `RuntimeException` | object | read-only | Low-level exception object. Prefer `Description`, `Operation`, `Code`, or `FullDescription` for typical error handling. |
| `Description` | string | read-only | Primary error message text. |
| `Operation` | string | read-only | Reported error location or operation name. This can be empty. |
| `GenCode` | number | read-only | Numeric error code. |
| `Code` | number | read-only | Alias of `GenCode`. |
| `FullDescription` | string | read-only | Multi-line diagnostic text with abbreviated stack details and nested causes. |
| `FullDescriptionEx` | string | read-only | Multi-line diagnostic text with full stack details and nested causes. |
| `NETException` | object | read-only | Low-level exception object for advanced troubleshooting or interop scenarios. |
| `InnerException` | `SSLError` | read-only | Nested SSL error when the inner cause is also an SSL runtime error. Otherwise this is empty. |
| `Message` | string | read-only | Alias of `Description`. |

### `SSLExpando`

> SSLExpando is a built-in object class for storing named values whose shape is decided at runtime.

**Constructors:**

- `SSLExpando{}` — Creates an empty `SSLExpando` instance.

**Properties:**

| Name | Type | Access | Description |
|------|------|--------|-------------|
| `XmlType` | string | read-write | XML root element name used by `ToString()` and `Serialize()` |

**Methods:**

| Name | Returns | Description |
|------|---------|-------------|
| `clone` | object | Creates a new `SSLExpando` with the same `XmlType` and current dynamic properties |
| `GetProperty(sProp)` | any | Returns the value of a named property |
| `SetProperty(sProp, vValue)` | none | Sets `XmlType` or a dynamic property |
| `IsProperty(sProp)` | boolean | Returns whether a property is available |
| `GetPropList` | array | Returns the current dynamic property names |
| `ToString` | string | Returns the object's XML representation |

### `SSLIntDictionary`

> Stores values by whole-number keys.

**Constructors:**

- `SSLIntDictionary{}` — Creates an empty dictionary.
- `SSLIntDictionary{nLength}` — Creates an empty dictionary with an optional initial capacity hint.

**Properties:**

| Name | Type | Access | Description |
|------|------|--------|-------------|
| `Count` | number | read-only | Number of key-value pairs currently stored |
| `Keys` | array | read-only | Array of the current keys |
| `Values` | array | read-only | Array of the current values |

**Methods:**

| Name | Returns | Description |
|------|---------|-------------|
| `Clear()` | boolean | Removes all entries and returns `.T.` |
| `AddValue(nKey, vValue)` | boolean | Adds or replaces a value for an integer-valued numeric key |
| `Contains(nKey)` | boolean | Returns `.T.` when the key exists |
| `GetValue(nKey, vDefaultValue)` | any | Returns the stored value or the fallback |
| `Remove(nKey)` | boolean | Removes a key and returns whether it was removed |
| `TryGetValue(nKey)` | object | Returns an object with `Exists` and `Value` |

### `SSLRegex`

> Matches SSL strings against a stored regular expression pattern.

**Constructors:**

- `SSLRegex{sPattern}` — | Parameter | Type | Required | Description | |-----------|------|----------|-------------|
- `SSLRegex{sPattern, bCaseSensitive}` — | Parameter | Type | Required | Description | |-----------|------|----------|-------------|

**Properties:**

| Name | Type | Access | Description |
|------|------|--------|-------------|
| `CaseSensitive` | boolean | read-only | Reports the value exposed by the class for case sensitivity |

**Methods:**

| Name | Returns | Description |
|------|---------|-------------|
| `IsMatch` | boolean | Returns whether the stored pattern matches the input string |

### `SSLSQLError`

> Represents the SQL-specific error object returned after a database failure.

**Properties:**

| Name | Type | Access | Description |
|------|------|--------|-------------|
| `ErrorMessage` | string | read-only | Combined message text from the captured database exception chain, or `No Exception.` when no message text was captured. |
| `SQLState` | string | read-only | Provider error state or code text captured for the SQL error. |
| `ErrorStackTrace` | string | read-only | Combined stack trace text from the captured exception chain, or `Empty stack trace.` when no stack trace text was captured. |
| `Description` | string | read-only | Alias of `ErrorMessage`. |
| `Operation` | string | read-only | Always returns `SQL operation.` |
| `GenCode` | number | read-only | Numeric code derived from `SQLState`. If `SQLState` is a 9-character provider code, SSL tries its 5-character suffix. Returns `0` when no numeric code can be extracted. |
| `Sql` | string | read-only | SQL statement associated with the captured database error, when available. |

### `SSLStringDictionary`

> Stores values by string key.

**Constructors:**

- `SSLStringDictionary{}` — Creates an empty case-insensitive dictionary.
- `SSLStringDictionary{bCaseSensitive, nLength}` — Creates an empty dictionary with configurable case matching and an initial capacity hint.

**Properties:**

| Name | Type | Access | Description |
|------|------|--------|-------------|
| `Count` | number | read-only | Number of key-value pairs currently stored |
| `Keys` | array | read-only | Array of the current string keys |
| `Values` | array | read-only | Array of the current stored values |

**Methods:**

| Name | Returns | Description |
|------|---------|-------------|
| `Clear()` | boolean | Removes all entries and returns `.T.` |
| `AddValue(sKey, vValue)` | boolean | Adds or replaces a value for a string key |
| `Contains(sKey)` | boolean | Returns `.T.` when the key exists |
| `GetValue(sKey, vDefaultValue)` | any | Returns the stored value or the fallback |
| `Remove(sKey)` | boolean | Removes a key and returns whether it was removed |
| `TryGetValue(sKey)` | object | Returns an object with `Exists` and `Value` |

### `Sequence`

> Creates and manages a database sequence for a table field on Oracle or SQL Server.

**Constructors:**

- `Sequence{sPlatforma, sTableName, sFieldName}` — Creates a sequence object with an empty prefix.
- `Sequence{sPlatforma, sTableName, sFieldName, sPrefix}` — Creates a sequence object with an additional name suffix.

**Properties:**

| Name | Type | Access | Description |
|------|------|--------|-------------|
| `SequenceName` | string | read-only | Derived sequence name for the current table, field, and prefix. |
| `StartWith` | number | read-write | First value used when `Create()` creates the sequence. Default is `1`. |
| `CacheSize` | number | read-write | Cache size used when SQL Server creates the sequence. Default is `50`. Oracle creation ignores this property. |
| `Exists` | boolean | read-only | `.T.` when the sequence exists in the current database. |
| `NextValue` | number | read-only | Retrieves the next value from the current database sequence. |

**Methods:**

| Method | Returns | Description |
|--------|---------|-------------|
| `Create()` | none | Creates the sequence in the current database. |
| `Reset(nNewValue)` | none | Changes the next starting value for the sequence. |
| `Drop()` | none | Drops the sequence from the current database. |
| `SetDatabase(sNewDatabase)` | none | Changes the database used for later operations. |

### `TablesImport`

> Loads one imported table at a time from a folder structure and returns it as a CDataTable.

**Constructors:**

- `TablesImport{sFolder}` — Creates an importer for a specific root folder.

**Properties:**

| Name | Type | Access | Description |
|------|------|--------|-------------|
| `NullAsBlank` | boolean | read-write | Accepted property on the class, but it does not change how `GetTable()` imports data. |
| `IncludeORIGREC` | boolean | read-write | When `.F.`, `GetTable()` removes the `ORIGREC` column from the returned table if that column exists. |
| `ErrMsg` | string | read-only | Error text set when `GetTable()` fails. |

**Methods:**

| Name | Returns | Description |
|------|---------|-------------|
| `GetTable(sName)` | object | Loads one table from the import folder and returns it as a `CDataTable`, or `NIL` when loading fails. |

### `WebServices`

> Creates client objects for outbound HTTP and SOAP integrations.

**Constructors:**

- `WebServices{}` — Creates a `WebServices` factory object.

**Methods:**

| Method | Returns | Description |
|--------|---------|-------------|
| `CreateHttpClient()` | object | Returns a new HTTP client object. |
| `CreateSoapClient()` | object | Returns a new SOAP client object. |

---

## Special Forms (6)

### Access Modifiers

> SSL supports two comment-based access modifiers that control procedure visibility. Place one on the line immediately before a :PROCEDURE declaration.

```ssl
/*@private;
:PROCEDURE ProcedureName;

/*@protected;
:PROCEDURE ProcedureName;
```

### base

> Provides explicit access to members on a class's immediate parent type from within a class method.

```ssl
Base:FieldName;
Base:PropertyName;
Base:MethodName(args);
Base:Constructor(args);
```

### code-block

> Defines an anonymous code block with bound variables and a single expression body. A code block can be created at the top level, passed as a function argument, or assigned to a variable for later execution.

```ssl
{|param1| expression}
{|param1, param2| expression}
```

### Code Organization

> Comment regions group related procedures or code sections in long files. They are purely organizational - they have no effect on compilation or execution, but development tools use them for code folding and navigation.

```ssl
/* region Region Name;

/* region content;

/* endregion;
```

### constructor

> Runs one-time class initialization code when a user-defined class instance is created.

```ssl
:CLASS MyClass;

:PROCEDURE Constructor;
    /* Initialization code;
:ENDPROC;
```

### me

> Provides a reference to the current class instance inside :CLASS methods.

```ssl
Me;
Me:PropertyName;
Me:MethodName(args);
```

---

## Functions (330)

### `AAdd`

`AAdd(aTarget, vElement)` → any

> Appends an element to the end of an array and returns the appended element.

### `AEval`

`AEval(aTarget, fnBlock, [nStart], [nCount])` → array

> Evaluate a code block for each array element and return the same array.

### `AEvalA`

`AEvalA(aTarget, fnBlock, [nStart], [nCount])` → array

> Evaluate a code block for each selected array element and write the result back to the same array.

### `AFill`

`AFill(aTarget, vValue, [nStart], [nCount])` → array

> Fill an array element range with the same value and return the same array.

### `ALen`

`ALen(aTarget)` → number

> Return the number of elements in an array.

### `AScan`

`AScan(aTarget, vValueOrBlock, [nStart], [nCount])` → number

> Return the index of the first array element that matches a value or condition.

### `AScanExact`

`AScanExact(aTarget, vValueOrBlock, [nStart], [nCount])` → number

> Return the index of the first array element that matches a value or condition exactly.

### `Abs`

`Abs(nValue)` → number

> Calculates the absolute value of a number.

### `AddColDelimiters`

`AddColDelimiters(sDSN, aCols, sTable)` → none

> Qualify each column in an array as table.column with database-specific identifier delimiters.

### `AddNameDelimiters`

`AddNameDelimiters(sDSN, sName)` → string

> Wrap a name in database-specific delimiters.

### `AddProperty`

`AddProperty(oTarget, vPropName)` → NIL

> Add one or more properties to an object.

### `AddToSession`

`AddToSession(sKey, vValue)` → NIL

> Store a non-object, non-array value in the current session under a string key.

### `AllTrim`

`AllTrim(sSource)` → string

> Remove leading and trailing space characters from a string.

### `ArrayCalc`

`ArrayCalc(aTarget, [sOperation], [vValue], [nStart], [nCount])` → any

> Perform a selected array operation by passing an operation code.

### `ArrayNew`

`ArrayNew([nDim1], [nDim2], [nDim3])` → array

> Create a new array with up to three dimensions.

### `ArrayToTVP`

`ArrayToTVP(aValues, [sDataType], [sConnectionName])` → object

> Convert a one-dimensional array into a table-valued parameter object.

### `Asc`

`Asc(sSource)` → number

> Return the character code of the first character in a string.

### `At`

`At(sSubString, sSource)` → number

> Finds the first occurrence of a substring in a string and returns its one-based position.

### `BeginLimsTransaction`

`BeginLimsTransaction([sConnectionName], [sIsoLevel])` → boolean

> Starts a LIMS database transaction on the default connection or on a named connection.

### `Branch`

`Branch(vTarget)` → NIL

> Transfers control to a label in the current procedure.

### `BuildArray`

`BuildArray(sText, [bCrlfOk], [sDelimiter], [bUnique], [bTrimSpaces])` → array

> Splits text into a one-dimensional array using a literal delimiter.

### `BuildArray2`

`BuildArray2(sText, [sLineDelimiter], [sColDelimiter], [bCrlfOk], [bTrimSpaces])` → array

> Parses text into a two-dimensional array using separate row and column delimiters.

### `BuildString`

`BuildString(aTarget, [nStart], [nCount], [sDelimiter])` → string

> Builds one string from array elements using a delimiter.

### `BuildString2`

`BuildString2(aTarget, [sLineDelimiter], [sColDelimiter])` → string

> Builds one string from a two-dimensional array using separate row and column delimiters.

### `BuildStringForIn`

`BuildStringForIn(aTarget)` → string

> Builds a quoted string list for a SQL IN clause from an array.

### `CMonth`

`CMonth(dDate)` → string

> Returns the full month name for a date value.

### `CToD`

`CToD(sDateString)` → date

> Converts a string in the current SSL date format to a date value.

### `CheckOnFtp`

`CheckOnFtp(` → boolean

> Checks whether a remote file exists on an FTP server, or on an SFTP server when bIsSFTP is .T..

### `ChkNewPassword`

`ChkNewPassword(sPassword, vPrevPasswords)` → boolean

> Validates that a proposed password is not already present in stored password history.

### `ChkPassword`

`ChkPassword([sUserName], [sPassword])` → boolean

> Checks whether a user name and password combination is accepted.

### `Chr`

`Chr([nAsciiCode])` → string

> Converts a numeric character code to a single-character string.

### `ClearLastSSLError`

`ClearLastSSLError();` → boolean

> Clears the current SSL error state.

### `ClearSession`

`ClearSession();` → NIL

> Clears all values from the current session.

### `ClientEndOfDay`

`ClientEndOfDay(dDate)` → date

> Returns the end of the client's calendar day for a date value.

### `ClientStartOfDay`

`ClientStartOfDay(dDate)` → date

> Returns the timestamp for the start of the client's calendar day.

### `CombineFiles`

`CombineFiles(aFileNames, sOutFile);` → string

> Concatenates multiple files into one output file on disk.

### `CompArray`

`CompArray(a1, a2)` → boolean

> Determines whether two arrays are exactly equal.

### `Compress`

`Compress(sSource, [bToFile])` → string

> Compresses a non-empty string and returns the compressed result as either a base64 string or a generated file path.

### `ConvertReport`

`ConvertReport(sFile)` → boolean

> Converts a report file identified by a file path and returns .T. when the conversion completes.

### `CopyToFtp`

`CopyToFtp(` → boolean

> Appends the same text content to one or more files on an FTP or SFTP server.

### `CreateGUID`

`CreateGUID()` → string

> Generates a new GUID string in uppercase.

### `CreateLocal`

`CreateLocal(sVarName, [vVarValue])` → any

> Creates or overwrites a local variable in the current scope by name.

### `CreateORMSession`

`CreateORMSession()` → object

> Creates the shared ORM session object for the current SSL runtime, or returns the existing one if it has already been created.

### `CreatePublic`

`CreatePublic(sVarName, [vVarValue])` → any

> Creates or overwrites a public variable by name.

### `CreateUdObject`

`CreateUdObject()` → object

> Creates a dynamic object or instantiates a user-defined class.

### `CreateZip`

`CreateZip(sZipFileName, sSourceDirectory, [bRecurse], [sFileFilter], [sPassword])` → NIL

> Creates a ZIP archive from a source directory.

### `DOW`

`DOW(dDate)` → number

> Returns the numeric day of week for a date.

### `DOY`

`DOY(dDate)` → number

> Calculates the ordinal day number of a date within its year.

### `DToC`

`DToC(dDate)` → string

> Converts a date value to a string using the current SSL date format.

### `DToS`

`DToS(dDate)` → string

> Converts a date value to an 8-character string in yyyyMMdd format.

### `DateAdd`

`DateAdd(dDate, nNumber, [sDatepart])` → date

> Adds a time interval to a date and returns the resulting date.

### `DateDiff`

`DateDiff(dStartDate, dEndDate, [sDatepart])` → number

> Returns the whole-number difference between two date values in a requested unit.

### `DateDiffEx`

`DateDiffEx(dStartDate, dEndDate)` → object

> Returns the elapsed interval between two date values as an object.

### `DateFormat`

`DateFormat(sNewFormat)` → string

> Sets the current SSL date format string.

### `DateFromNumbers`

`DateFromNumbers(` → date

> Creates a date value from individual numeric components.

### `DateFromString`

`DateFromString(sDateAsString, [vFormat], [bUseLocalCulture], [bMakeInvariant])` → date

> Parses a string into a date value with optional format and culture controls.

### `DateToString`

`DateToString(dDate, [sFormat])` → string

> Converts a date value to a string using a specified or default format.

### `Day`

`Day(dDate)` → number

> Extracts the day-of-month number from a date value.

### `Decompress`

`Decompress(sSource, [bFromFile])` → string

> Decompresses compressed text and returns the restored string.

### `DecryptData`

`DecryptData(sInputData, sPassword)` → string

> Decrypts an encrypted string with a password and returns the plaintext string.

### `DelArray`

`DelArray(aTarget, nIndex)` → array

> Removes an element from an array at a specified one-based index and returns the same array.

### `DeleteDirOnFtp`

`DeleteDirOnFtp(` → boolean

> Deletes a remote directory over FTP or SFTP.

### `DeleteFromFtp`

`DeleteFromFtp(` → boolean

> Deletes a remote file through FTP, or through SFTP when bIsSFTP is .T..

### `DeleteInlineCode`

`DeleteInlineCode(sName)` → boolean

> Removes a named inline code entry.

### `DetectSqlInjections`

`DetectSqlInjections(bEnable, [sConnectionName])` → boolean

> Enables or disables SQL injection detection for a database connection and returns the previous setting.

### `Directory`

`Directory(sFilePattern, [sAttributes])` → array

> Retrieves filesystem entries that match a path or wildcard pattern, with optional filtering for directories, hidden entries, and system entries.

### `DoProc`

`DoProc(sProcedureName, [aArguments]);` → any

> Calls a procedure by name at runtime.

### `DocAcquireWorkitem`

`DocAcquireWorkitem(sWorkitemId)` → boolean

> Acquires a Documentum work item and returns whether the acquisition succeeded.

### `DocAddUsersToGroup`

`DocAddUsersToGroup(sGroupName, aUsers)` → boolean

> Adds one or more users to an existing Documentum group.

### `DocCancelCheckout`

`DocCancelCheckout(sDocumentId)` → boolean

> Cancels checkout for a Documentum document and returns a boolean result.

### `DocCheckinDocument`

`DocCheckinDocument(sFilePath, sDocumentId, [sVersion], [bReplaceContent], [bMajorVersion])` → string

> Checks a local file into an existing Documentum document.

### `DocCheckoutDocument`

`DocCheckoutDocument(sDocumentId)` → string

> Checks out an existing Documentum document and returns the local checkout file path.

### `DocCommandFailed`

`DocCommandFailed()` → boolean

> Checks whether the most recent Documentum command in the current session failed.

### `DocCompleteWorkitem`

`DocCompleteWorkitem(sWorkitemId, [sSignOffUser], [sSignOffPass], [sSignOffReason])` → boolean

> Completes a Documentum workflow work item and returns whether the operation succeeded.

### `DocCreateACL`

`DocCreateACL(sAclName, [sDescription], [aGroups])` → string

> Creates a Documentum ACL and returns the backend result string.

### `DocCreateCabinet`

`DocCreateCabinet(sCabinetName, [sCabinetType], [sAcl])` → string

> Creates a Documentum cabinet and returns the string result from the create operation.

### `DocCreateFolder`

`DocCreateFolder(sParentPath, sFolderName, [sAcl])` → string

> Creates a Documentum folder under a parent path and returns the string result from the create operation.

### `DocCreateGroup`

`DocCreateGroup(sGroupName, [sDescription])` → string

> Creates a Documentum group and returns its identifier.

### `DocCreateUser`

`DocCreateUser(` → string

> Creates a new user account and returns its identifier.

### `DocDelegateWorkitem`

`DocDelegateWorkitem(sWorkitemId, sTargetUser)` → boolean

> Delegates a Documentum workflow work item to another user and returns whether the delegation succeeded.

### `DocDelete`

`DocDelete(sObjId, [bAllVersions])` → boolean

> Deletes a Documentum document by object ID.

### `DocDeleteCabinet`

`DocDeleteCabinet(sCabinetId, [bDeepDelete])` → boolean

> Deletes a Documentum cabinet by cabinet identifier.

### `DocDeleteFolder`

`DocDeleteFolder(sFolderId, [bDeepDelete])` → boolean

> Deletes a Documentum folder and optionally allows the delete only when the folder is empty.

### `DocDeleteUser`

`DocDeleteUser(sLoginName)` → boolean

> Deletes a Documentum user by login name.

### `DocEndDocumentumInterface`

`DocEndDocumentumInterface();` → NIL

> Ends the current Documentum interface context.

### `DocExists`

`DocExists(sObjId)` → boolean

> Checks whether a Documentum document exists for a given object ID.

### `DocExistsUser`

`DocExistsUser(sLoginName, sUserName)` → boolean

> Determines whether a Documentum user exists for a supplied login context.

### `DocExportDocument`

`DocExportDocument(sDocumentId, [sFormat])` → string

> Exports a specified document to a chosen format and returns the result as a string.

### `DocGetCabinets`

`DocGetCabinets()` → array

> Returns the cabinet names available from the current Documentum connection.

### `DocGetDocuments`

`DocGetDocuments(sFolderPath, [sDocTypes])` → array

> Retrieves documents from a Documentum repository folder as a two-dimensional array.

### `DocGetErrorMessage`

`DocGetErrorMessage()` → string

> Returns the message text from the current Documentum error state.

### `DocGetFolders`

`DocGetFolders(sParentPath)` → array

> Retrieves the immediate child folders of a Documentum folder as a sorted two-dimensional array.

### `DocGetMetadata`

`DocGetMetadata(sObjId, [sAttributes])` → array

> Retrieves metadata rows for a Documentum object.

### `DocGetTasks`

`DocGetTasks(sWorkflowId)` → array

> Retrieves Documentum workflow tasks as a two-dimensional array.

### `DocGetTasksCount`

`DocGetTasksCount()` → number

> Returns the number of workflow tasks in the Documentum inbox for the active session.

### `DocGetTypeAttributes`

`DocGetTypeAttributes(sTypeName)` → array

> Retrieves the attribute definitions for a Documentum type as a two-dimensional array.

### `DocGetTypeAttributesAsDataset`

`DocGetTypeAttributesAsDataset(sTypeName)` → string

> Returns the attributes for a Documentum type as a dataset-formatted string.

### `DocGetWorkflowStatus`

`DocGetWorkflowStatus(sWorkflowId)` → string

> Returns the current runtime status for a Documentum workflow.

### `DocGetWorkitemProperties`

`DocGetWorkitemProperties(sWorkitemId)` → array

> Retrieves workflow flags and linked document IDs for a Documentum work item.

### `DocImportDocument`

`DocImportDocument(` → string

> Imports a document into Documentum and returns the underlying import result as a string.

### `DocInitDocumentumInterface`

`DocInitDocumentumInterface();` → NIL

> Creates a fresh Documentum interface context for the current execution.

### `DocLoginToDocumentum`

`DocLoginToDocumentum(sDocBase, sUser, sPassword)` → boolean

> Authenticates to a Documentum repository for the current initialized Documentum context.

### `DocPauseWorkflow`

`DocPauseWorkflow(sWorkflowId)` → boolean

> Temporarily halts workflow processing to prevent further steps until manual intervention or review.

### `DocRemoveAllUsersFromGroup`

`DocRemoveAllUsersFromGroup(sGroupName)` → boolean

> Removes every user from a Documentum group.

### `DocRemoveUsersFromGroup`

`DocRemoveUsersFromGroup(sGroupName, aUsers)` → boolean

> Removes one or more users from an existing Documentum group.

### `DocRepeatWorkitem`

`DocRepeatWorkitem(sWorkitemId, aUsers, [sSignOffUser], [sSignOffPass], [sSignOffReason])` → boolean

> Repeats a Documentum workitem and can reassign it to a new user list.

### `DocResumeWorkflow`

`DocResumeWorkflow(sWorkflowId)` → boolean

> Resumes a Documentum workflow identified by sWorkflowId.

### `DocSearchAsDataset`

`DocSearchAsDataset([sContains], [sStartLocation], [sObjectType], [sWhere], [bAllVersions], [nResultSetSize])` → string

> Searches Documentum and returns the matches as dataset XML.

### `DocSearchFullText`

`DocSearchFullText(sTextToSearch, [sStartLocation], [nResultSetSize])` → array

> Performs a Documentum full-text search and returns matching documents as an array.

### `DocSearchUsingDql`

`DocSearchUsingDql(sDql, [nResultSetSize])` → array

> Executes a Documentum DQL query and returns the result set as a two-dimensional array.

### `DocSetMetadata`

`DocSetMetadata(sObjId, aAttributes)` → boolean

> Updates one or more metadata attributes on a Documentum object.

### `DocStartWorkflow`

`DocStartWorkflow(sWorkflowId, [aDocumentIds], [sPackageName])` → array

> Starts a Documentum workflow and returns the created workflow ID together with the start-activity performers.

### `DocStopWorkflow`

`DocStopWorkflow(sWorkflowId)` → boolean

> Stops a Documentum workflow by its workflow ID.

### `DocUpdateUser`

`DocUpdateUser(sLoginName, sPassword, [sUserName], [sEMail], [sDefaultFolder], [sGroupName], [sPermissionSet], [nUserPrivileges])` → string

> Updates a Documentum user and returns the backend result message.

### `DosSupport`

`DosSupport(sCmd, [sPrm], [vDbg])` → any

> Executes operating system-level file and directory commands.

### `Empty`

`Empty(vValue)` → boolean

> Returns .T. when a value is considered empty by SSL; otherwise returns .F.

### `EncryptData`

`EncryptData(sInputData, sPassword, [sAlgorithm], [sKey], [sRetType])` → string

> Encrypts a string with a password by using the legacy built-in RC2, DES, or 3DES algorithms.

### `EndLimsOleConnect`

`EndLimsOleConnect([oConnection])` → string

> Disposes an object previously created for OLE automation use.

### `EndLimsTransaction`

`EndLimsTransaction([sConnectionName], [bCommit])` → boolean

> Ends a LIMS transaction on the default connection or on a named connection.

### `ErrorMes`

`ErrorMes(vCaption, vMessage)` → string

> Logs an error message and returns the resulting message string.

### `Eval`

`Eval(fnCode, [vArg1], [vArg2], ...)` → any

> Invokes a code block with the supplied arguments and returns the block's result.

### `ExecFunction`

`ExecFunction(sName, [aParameters])` → any

> Invokes a function by name at runtime and returns the result.

### `ExecInternal`

`ExecInternal(o, sMethodName, [vArg01], [vArg02], [vArg03], [vArg04], [vArg05], [vArg06], [vArg07], [vArg08], [vArg09], [vArg10], [vArg11], [vArg12], [vArg13], [vArg14], [vArg15], [vArg16], [vArg17], [vArg18], [vArg19], [vArg20], [vArg21])` → any

> Calls a method on an object by name and returns that method's result.

### `ExecUdf`

`ExecUdf(sCode, [aArgs], [bCacheCode])` → any

> Executes SSL source supplied as a string and returns the result.

### `ExtractCol`

`ExtractCol(aTarget, nColumn)` → array

> Extracts one column from a two-dimensional array and returns the extracted values as a new array.

### `ExtractZip`

`ExtractZip(sZipFileName, sTargetDirectory, [sFileFilter], [sPassword])` → NIL

> Extracts a ZIP archive into a target directory.

### `FileSupport`

`FileSupport(vFileIdentifier, sRequest, [vArg1], [sArg2], [sEncoding])` → any

> Performs multiple file operations through a single request-driven interface.

### `FormatErrorMessage`

`FormatErrorMessage(vError)` → string

> Returns a formatted string description for an error value.

### `FormatSqlErrorMessage`

`FormatSqlErrorMessage(vError)` → string

> Returns a human-readable error message from a SQL error value.

### `FromJson`

`FromJson(vValue)` → any

> Parses a JSON string into the closest SSL-native value or returns the input unchanged if it is not a string. JSON arrays become arrays, objects become SSLExpando instances, numbers become numbers, booleans become booleans, and strings become strings or dates when the value starts with SSLDate|. Null input, empty strings, and JSON null values return NIL. Invalid JSON tokens raise an error.

### `FromXml`

`FromXml(sXml)` → any

> Parses a type-tagged XML string and converts it to the corresponding SSL value.

### `GetAppBaseFolder`

`GetAppBaseFolder()` → string

> Returns the application's base folder path as a string for use in file and configuration operations.

### `GetAppWorkPathFolder`

`GetAppWorkPathFolder()` → string

> Returns the path to the application's working directory as a string.

### `GetByName`

`GetByName(sName)` → any

> Retrieves the value of a variable by name from local or public storage.

### `GetConnectionByName`

`GetConnectionByName(sConnectionName)` → SQLConnection

> Retrieves a database connection object using a specified connection name.

### `GetConnectionStrings`

`GetConnectionStrings()` → array

> Retrieves all configured database connections as a two-dimensional array.

### `GetDBMSName`

`GetDBMSName(sConnectionName)` → string

> Returns the DBMS platform name for a configured database connection.

### `GetDBMSProviderName`

`GetDBMSProviderName(sConnectionName)` → string

> Returns the uppercase DBMS provider identifier for a named database connection.

### `GetDSParameters`

`GetDSParameters(sDsName)` → array

> Returns an array of parameter key strings for the named data source.

### `GetDataSet`

`GetDataSet(sCommandString, [aValues], [bIncludeSchema], [sTableName], [bNullAsBlank], [aInvariantDateCols])` → string

> Executes a SQL query on the default database connection and returns the result as an XML dataset string.

### `GetDataSetEx`

`GetDataSetEx(sCommandString, [sConnectionName], [aValues], [bIncludeSchema], [bIncludeHeader], [sTableName], [bNullAsBlank], [aInvariantDateCols])` → string

> Executes a SQL command on a specified connection and returns the result as XML dataset text.

### `GetDataSetFromArray`

`GetDataSetFromArray(aArrayOfValues, [aArrayFields])` → string

> Builds a dataset XML string from an array of values and an optional array of field names.

### `GetDataSetFromArrayEx`

`GetDataSetFromArrayEx(aArrayOfValues, [aArrayFields], [sTableName], [bIncludeHeader], [bIncludeSchema])` → string

> Generates a dataset XML string from array values, with control over field definitions, table name, header output, and schema output.

### `GetDataSetWithSchemaFromSelect`

`GetDataSetWithSchemaFromSelect(sCommandString, [sConnectionName], [aValues], [aPrimaryKeys], [aUniqueConstraints])` → string

> Executes a SQL query and returns the result as XML dataset text with schema always included.

### `GetDataSetXMLFromArray`

`GetDataSetXMLFromArray(aArrayOfValues, [aArrayFields], [sTableName], [bIncludeHeader], [bIncludeSchema])` → string

> Generates dataset XML from in-memory values, field definitions, and output flags.

### `GetDataSetXMLFromSelect`

`GetDataSetXMLFromSelect(sCommandString, [sConnectionName], [bIncludeHeader], [aValues], [bIncludeSchema], [sTableName], [bNullAsBlank], [aInvariantDateCols])` → string

> Executes a SQL query and returns the result as XML dataset text.

### `GetDecimalSep`

`GetDecimalSep()` → number

> Returns the current decimal separator as a numeric character code.

### `GetDecimalSeparator`

`GetDecimalSeparator()` → string

> Returns the current decimal separator as a string.

### `GetDefaultConnection`

`GetDefaultConnection()` → string

> Returns the current default database connection name.

### `GetDirFromFtp`

`GetDirFromFtp(sServerNameOrIP, [sRemoteDirectory], [sFilePattern], [sUserName], [sPassword], [nPort], [sProxy], [bUsePassive], [bIsSFTP], [sPrivateKeyFilePath])` → array

> Lists directory entries from an FTP server, or from an SFTP server when bIsSFTP is .T..

### `GetFileVersion`

`GetFileVersion(sFileName)` → string

> Retrieves the file version string for a specified file path.

### `GetFromApplication`

`GetFromApplication(sKey)` → string

> Returns a comma-separated string of connected usernames when called with the special key \"STARLIMSUSERS\" in a CUSTOM session context.

### `GetFromFtp`

`GetFromFtp(sServerNameOrIP, [sRemoteDirectory], sRemoteFileName, [sLocalFileName], [sUserName], [sPassword], [nPort], [sProxy], [bIsSFTP], [sPrivateKeyFilePath])` → boolean

> Downloads a file from an FTP or SFTP server to a local file.

### `GetFromSession`

`GetFromSession(sKey)` → any

> Retrieves the value associated with a specified key from the current user session.

### `GetGroupSeparator`

`GetGroupSeparator();` → string

> Returns the current group separator as a string.

### `GetInlineCode`

`GetInlineCode(sValue, [aVariables])` → string

> Retrieves a named inline code block as a string.

### `GetInternal`

`GetInternal(oTarget, sPropName)` → any

> Retrieves the current value of a named property from a value that supports property access.

### `GetInternalC`

`GetInternalC(oTarget, sCollectionName, vArg1, [vArg2], [vArg3], [vArg4], [vArg5], [vArg6])` → any

> Retrieves a value by applying a chained series of index operations to a root value.

### `GetLastSQLError`

`GetLastSQLError()` → SSLSQLError

> Returns the most recently stored SQL error as an SSLSQLError object, or NIL when no SQL error is currently recorded.

### `GetLastSSLError`

`GetLastSSLError()` → SSLError

> Retrieves the most recent SSL error encountered during the current process.

### `GetLogsFolder`

`GetLogsFolder()` → string

> Returns the configured user log folder path with a trailing backslash.

### `GetNETDataSet`

`GetNETDataSet(sCommandString, [sConnectionName], [aValues], [sTableName], [bReturnXml], [bR1Compatible])`

> Executes a SQL command and returns the result either as dataset XML or as a netobject wrapping a dataset.

### `GetNoLock`

`GetNoLock([sConnectionName])` → string

> Returns the database-specific no-lock clause for a connection.

### `GetPrinters`

`GetPrinters()` → array

> Returns a list of printer names currently installed on the system.

### `GetRdbmsDelimiter`

`GetRdbmsDelimiter([sDSN], bOpen)` → string

> Returns the identifier delimiter character for the database behind a DSN.

### `GetRegion`

`GetRegion(sRegionName, [aSourceValues], [aDestinationValues])` → string

> Retrieves a named region string from the current region scope and can optionally apply sequential text replacements.

### `GetRegionEx`

`GetRegionEx(sRegionName, [aSourceValues], [aDestinationValues], [oLocalRegions])` → string

> Retrieves a named region string, optionally using a caller-supplied local region map before falling back to the current region scope.

### `GetSSLDataset`

`GetSSLDataset(sSql, [sDsn], [aParamNames], [aParamValues], [sTableName], [bNullAsBlank], [aInvariantDateCols])` → SSLDataset

> Executes a SQL statement and returns the result as an SSLDataset.

### `GetSetting`

`GetSetting(sName)` → any

> Retrieves a single named setting.

### `GetSettings`

`GetSettings(aNames)` → array

> Retrieves multiple named settings in one call.

### `GetTables`

`GetTables([sSql])` → array

> Extracts table names from the FROM portion of a SQL SELECT string.

### `GetTransactionsCount`

`GetTransactionsCount()` → number

> Returns the number of open database transactions for a specified or default connection.

### `GetUserData`

`GetUserData();` → string

> Returns the current session user name as a string.

### `GetWebFolder`

`GetWebFolder()` → string

> Returns the current web folder path as a string.

### `HasProperty`

`HasProperty(oTarget, sPropName)` → boolean

> Checks whether a value exposes a named property.

### `HashData`

`HashData(sInputData, [sAlgorithm])` → string

> Computes a one-way hash string from input text.

### `Hour`

`Hour(dDate)` → number

> Extracts the hour component from a date value.

### `HtmlDecode`

`HtmlDecode(sData)` → string

> Converts selected HTML/XML entity sequences in a string back to literal characters.

### `HtmlEncode`

`HtmlEncode(sData)` → string

> Converts selected characters in a string to entity sequences for HTML or XML text output.

### `IIf`

`IIf(bCondition, vTrueValue, vFalseValue)` → any

> Selects one of two values based on a boolean condition.

### `IgnoreSqlErrors`

`IgnoreSqlErrors(bEnable)` → boolean

> Enables or disables SQL error suppression and returns the previous setting.

### `InBatchProcess`

`InBatchProcess()` → boolean

> Returns whether the current SSL execution context is running in a batch process.

### `InfoMes`

`InfoMes(vCaption, [vMessage])` → string

> Logs an informational user message and returns the same formatted string as UsrMes.

### `Integer`

`Integer(nValue)` → number

> Returns the whole-number portion of a numeric value by truncating the fractional part toward zero.

### `IsDBConnected`

`IsDBConnected([sConnectionName])` → boolean

> Checks whether STARLIMS currently has a database connection available for a given connection name.

### `IsDefined`

`IsDefined(sVarName)` → boolean

> Determines whether a variable name is currently defined.

### `IsGuid`

`IsGuid(sGuid)` → boolean

> Validates whether a string matches the GUID format and returns a boolean result.

### `IsHex`

`IsHex(sSource)` → boolean

> Validates whether a string contains only uppercase hexadecimal characters.

### `IsInTransaction`

`IsInTransaction([vConnection])` → boolean

> Returns .T. if the specified database connection currently has an open transaction.

### `IsInvariantDate`

`IsInvariantDate(dDate)` → boolean

> Checks whether a date value has an unspecified (invariant) kind.

### `IsNumeric`

`IsNumeric(sNumber, [bAllowHex])` → boolean

> Determines whether a string is a valid numeric value, with optional support for hexadecimal input.

### `IsProductionModeOn`

`IsProductionModeOn()` → boolean

> Returns .T. when the application's production mode flag is enabled and .F. otherwise.

### `IsTable`

`IsTable(sConnectionName, sTableName)` → boolean

> Checks whether a table exists in a database connection.

### `IsTableFld`

`IsTableFld(sConnectionName, sTableName, sFieldName)` → boolean

> Checks whether a field exists in a table for a selected database connection.

### `JDay`

`JDay([dDate])` → number

> Returns the day-of-year number for a date, or for today's date when no argument is supplied.

### `LCase`

`LCase(bCondition, sTrueValue, [sFalseValue])` → any

> Conditionally evaluates one of two SSL expressions supplied as strings.

### `LDAPAuth`

`LDAPAuth(sLdapHost, [nLdapPort], sLdapUserName, [sLdapPassword], [sLdapDistinctiveName], [bSecure])` → string

> Authenticates a user by binding directly to an LDAP server.

### `LDAPAuthEX`

`LDAPAuthEX(sLdapHost, [nLdapPort], sBindUserName, sBindUserPassword, [sSearchUserName], sSearchUserPassword, [sLdapDistinguishedName], sLdapDistinguishedNameStartSearch, [sSearchFilter], [sAuthAttribName], [bSecure])` → string

> Authenticates an LDAP user by searching for exactly one directory entry and then binding as that user.

### `LDir`

`LDir(sFilePattern, [sAttributes])` → array

> Retrieves an array of file and directory names matching a specified pattern and optional attribute filter.

### `LFromHex`

`LFromHex(sSource)` → string

> Converts a hexadecimal string to a string by reading the input in two-character chunks and decoding each chunk as a byte.

### `LHex2Dec`

`LHex2Dec(sSource)` → string

> Converts a hexadecimal string to its decimal string representation.

### `LIMSDate`

`LIMSDate(vDate, [sFormat])` → string

> Returns a date value as a formatted string.

### `LKill`

`LKill(sVarName)` → string

> Deletes a public variable from the current SSL session by name and returns an empty string.

### `LLower`

`LLower(sSource)` → string

> Converts all characters in a string to their lowercase equivalents.

### `LSearch`

`LSearch(sCommandString, vDefaultValue, [sConnectionName], [aArrayOfValues])` → any

> Returns a single value from a SQL query, or a caller-supplied fallback when the query produces no scalar result.

### `LSelect`

`LSelect(sCommandString, [aFieldList], [sConnectionName], [aArrayOfValues], [bNullAsBlank], [aInvariantDateCols])` → array

> Executes a SQL SELECT statement and returns the result as a two-dimensional SSL array.

### `LSelect1`

`LSelect1(sCommandString, [sConnectionName], [aArrayOfValues], [bNullAsBlank], [aInvariantDateCols])` → array

> Executes a parameterized SQL SELECT command and returns the result as an array of rows.

### `LSelectC`

`LSelectC(sCommandString, [aFieldList], [sConnectionName], [aArrayOfValues], [bNullAsBlank], [aInvariantDateCols])` → array

> Executes a SQL SELECT statement and returns the result as a two-dimensional SSL array.

### `LStr`

`LStr(vNumber)` → string

> Converts a value to its trimmed string representation, returning \"NIL\" when the input is NIL.

### `LToHex`

`LToHex(vSource)` → string

> Converts a string or integer to hexadecimal text.

### `LTransform`

`LTransform(vExpression, sPicture)` → string

> Formats a numeric expression as a string by applying a picture string.

### `LTrim`

`LTrim(sSource)` → string

> Removes leading whitespace from a string.

### `LWait`

`LWait([nSeconds])` → string

> Blocks further script execution for a specified number of seconds and returns an empty string.

### `Left`

`Left(sSource, nLength)` → string

> Extracts the leftmost characters from a string.

### `Len`

`Len(vSource)` → number

> Returns the number of characters in a string or the element count of an array.

### `LimsAt`

`LimsAt(sSubString, sSource, [nOffset])` → number

> Finds the first occurrence of a substring in a string at or after a 1-based starting position.

### `LimsExec`

`LimsExec(sApplication, [bShow], [sArguments])` → boolean

> Launches an external application without waiting for it to finish.

### `LimsGetDateFormat`

`LimsGetDateFormat()` → string

> Returns the current global date format string used for date parsing and formatting.

### `LimsNETCast`

`LimsNETCast(vVal, sNewType)` → any

> Prepares a value for a requested interop type such as an enum, by-reference value, numeric type, or typed array.

### `LimsNETConnect`

`LimsNETConnect([sAssembly], [sTypeName], [aArgs], [bAsStatic])` → any

> Loads a .NET assembly, resolves a type, and either returns a type handle or creates an instance for SSL interop.

### `LimsNETTypeOf`

`LimsNETTypeOf(sTypeName)` → object

> Resolves a .NET type name string to a .NET Type object.

### `LimsOleConnect`

`LimsOleConnect(vProgId)` → object

> Creates an object from a ProgID so SSL code can work with an OLE or COM automation server.

### `LimsRecordsAffected`

`LimsRecordsAffected()` → number

> Returns the number of records affected by the most recent database operation.

### `LimsSetCounter`

`LimsSetCounter(sTableName, sFieldName, [sPrefix], [aFields], [aValues], [nIncrementWith])` → number

> Generates the next counter value and, when given matching field and value arrays, inserts a new row with that key.

### `LimsSqlConnect`

`LimsSqlConnect(sConnectionName)` → boolean

> Registers a configured database connection by connection name.

### `LimsSqlDisconnect`

`LimsSqlDisconnect([sConnectionName]);` → boolean

> Closes an active database connection by name and removes it from the internal registry.

### `LimsString`

`LimsString([vSource])` → string

> Converts a value to a string, returning \"NIL\" when the input is NIL.

### `LimsTime`

`LimsTime()` → string

> Returns the current time as a formatted string.

### `LimsType`

`LimsType(sParam)` → string

> Returns the single-character SSL type code for a variable name or expression.

### `LimsTypeEx`

`LimsTypeEx(vSource)` → string

> Returns the public SSL type name for a value.

### `LimsXOr`

`LimsXOr(nVal1, nVal2)` → number

> Calculates the bitwise exclusive OR of two integer-valued numbers.

### `Lower`

`Lower(sSource)` → string

> Converts all characters in a string to lowercase.

### `MakeDateInvariant`

`MakeDateInvariant(vDate, [vColumnsIndex])` → date or array

> Marks a date, or selected date columns in an array, as invariant.

### `MakeDateLocal`

`MakeDateLocal(vDate, [vColumnsIndex])` → date or array

> Sets a date value, or selected date columns in an array, to local date kind in place.

### `MakeDirOnFtp`

`MakeDirOnFtp(` → boolean

> Creates a remote directory by using FTP, or by using SFTP when bIsSFTP is .T..

### `MakeNETObject`

`MakeNETObject(vValue)` → object

> Converts an SSL value to a .NET interop object.

### `MatFunc`

`MatFunc(sFunctionName, nNumber)` → number

> Calculates a mathematical operation on a given number based on the specified function name.

### `Max`

`Max(vValue1, vValue2)` → string, number, or date

> Returns whichever of two values compares greater when both arguments are the same supported type.

### `MimeDecode`

`MimeDecode(sValue)` → string

> Decodes MIME-encoded data to its plain string representation.

### `MimeEncode`

`MimeEncode(sValue)` → string

> Encodes a string so it can be round-tripped later with MimeDecode.

### `Min`

`Min(vValue1, vValue2)` → string, number, or date

> Returns whichever of two values compares lower when both arguments are the same supported type.

### `Minute`

`Minute(dDate)` → number

> Extracts the minute component from a date value.

### `Month`

`Month(dDate)` → number

> Extracts the numeric month from a date value.

### `MoveInFtp`

`MoveInFtp(sServerNameOrIP, [sRemoteDirectoryFrom], [sRemoteDirectoryTo], sRemoteFileFrom, [sRemoteFileTo], [sUserName], [sPassword], [nPort], [sProxy], [bIsSFTP], [sPrivateKeyFilePath])` → boolean

> Moves a remote file on an FTP server, or on an SFTP server when bIsSFTP is .T..

### `NoOfDays`

`NoOfDays(dDate)` → number

> Returns the number of days in the month for a date value.

### `Nothing`

`Nothing(vValue)` → boolean

> Returns .T. when vValue is NIL, empty by SSL rules, or stringifies to the exact value \"0\"; otherwise returns .F..

### `Now`

`Now()` → date

> Returns the current system date and time as an SSL date value.

### `PrepareArrayForIn`

`PrepareArrayForIn(aTarget, sItemType)` → array

> Prepares an array for SQL IN clause helpers by mutating it in place.

### `PrmCount`

`PrmCount()` → number

> Returns how many arguments were passed to the currently executing procedure.

### `RaiseError`

`RaiseError(sMessage, [sLocation], [nErrorCode], [oInnerException])` → boolean

> Raises an SSL runtime error using the supplied message and optional location, error code, and inner error.

### `Rand`

`Rand([nSeed])` → number

> Generates a pseudo-random number between 0 (inclusive) and 1 (exclusive).

### `Rat`

`Rat(subStr, source)` → number

> Finds the last occurrence of a substring in a string and returns its one-based position.

### `ReadBytesBase64`

`ReadBytesBase64(sFileName)` → string

> Reads a file from disk and returns its contents as a base64-encoded string.

### `ReadFromFtp`

`ReadFromFtp(sServerNameOrIP, [sRemoteDirectory], sRemoteFileName, [nMaxSize], [sUserName], [sPassword], [nPort], [sProxy], [bIsSFTP], [sPrivateKeyFilePath])` → string

> Retrieves a remote file as a string by using FTP, or SFTP when bIsSFTP is .T..

### `ReadText`

`ReadText(sFileName, [nCharsToRead], [sEncoding])` → string

> Retrieves text content from a file in memory, allowing partial reads and encoding selection.

### `RenameOnFtp`

`RenameOnFtp(sServerNameOrIP, [sRemoteDirectory], sFileNameOld, sFileNameNew, [sUserName], [sPassword], [nPort], [sProxy], [bIsSFTP], [sPrivateKeyFilePath])` → boolean

> Renames a remote file on an FTP server, or on an SFTP server when bIsSFTP is .T..

### `Replace`

`Replace(source, searchFor, replaceWith)` → string

> Replaces all occurrences of a specified substring within a string with another substring and returns the resulting string.

### `Replicate`

`Replicate(source, count)` → string

> Creates a string by repeating the source string a specified number of times.

### `RetrieveLong`

`RetrieveLong([sConnectionName], sTableName, sColumnName, sWhereCondition, sOutputFilePath, [bIsCompressed])` → boolean

> Retrieves a value from one database column and writes it to a file when the selected value is returned as binary data.

### `ReturnLastSQLError`

`ReturnLastSQLError()` → `SSLSQLError`

> Returns the currently stored SQL error as an SSLSQLError object, or NIL when no SQL error is recorded.

### `Right`

`Right(sSource, nLength)` → string

> Extracts a specified number of characters from the end of a string.

### `Round`

`Round(nValue, nDigits, [sMidPointRounding])` → number

> Rounds a numeric value to a specific number of decimal places using a configurable midpoint handling strategy.

### `RoundPoint5`

`RoundPoint5(nNumber)` → number

> Rounds a numeric value to a half-point increment.

### `RunApp`

`RunApp(sApplication, [sArguments])` → boolean

> Launches an external application and waits for it to exit.

### `RunDS`

`RunDS(sDataSourceName, [aParameters], [vReturnType])` → any

> Executes a data source by name or GUID and returns the result in the requested format.

### `RunSQL`

`RunSQL(sCommandString, [sConnectionName], [aValues])` → boolean

> Executes a SQL statement and returns whether execution completed without an uncaught SQL error.

### `SQLExecute`

`SQLExecute(sCommandString, [sConnectionName], [bRollbackExistingTransaction], [bNullAsBlank], [aInvariantDateCols], [vReturnType], [sTableName], [bIncludeSchema], [bIncludeHeader])` → any

> Executes SQL and returns either query results or a success flag.

### `SQLRemoveComments`

`SQLRemoveComments(sStatement)` → string or NIL

> Removes SQL comments from a string and returns the cleaned SQL text.

### `Scient`

`Scient(nValue)` → string

> Converts a number to its scientific notation string representation.

### `SearchLDAPUser`

`SearchLDAPUser(sLdapHost, [nLdapPort], sBindUserName, [sBindUserPassword], [sSearchUserName], sLdapDistinguishedNameStartSearch, [sSearchFilter], [bSecure])` → string

> Searches LDAP for exactly one user and returns that entry's distinguished name.

### `Second`

`Second(dDate)` → number

> Extracts the seconds component from a date value.

### `Seconds`

`Seconds()` → number

> Returns the current time of day as the number of whole seconds since midnight.

### `SendFromOutbox`

`SendFromOutbox([bIgnoreErrors], [bUseCDO], [nTimeout])` → boolean

> Sends every email currently queued in the outbox.

### `SendLimsEmail`

`SendLimsEmail(` → boolean

> Sends an email through SMTP and returns whether the send succeeded.

### `SendOutlookReminder`

`SendOutlookReminder(` → boolean

> Sends an Outlook-style meeting invitation email and returns whether delivery succeeded.

### `SendToFtp`

`SendToFtp(sServerNameOrIP, sRemoteDirectory, [sRemoteFileName], sLocalFileName, sUserName, sPassword, [nPort], [sProxy], [bUsePassive], [bIsSFTP], [sPrivateKeyFilePath])` → boolean

> Uploads one local file to an FTP or SFTP server.

### `SendToOutbox`

`SendToOutbox(` → boolean

> Queues an email request in LIMSEMAILOUTBOX for later delivery instead of sending it immediately.

### `ServerEndOfDay`

`ServerEndOfDay(dDate)` → date

> Returns a date value set to the end of its day.

### `ServerStartOfDay`

`ServerStartOfDay(dDate)` → date

> Returns a date value set to the start of its day.

### `ServerTimeZone`

`ServerTimeZone()` → number

> Returns the current server's UTC offset in minutes as a number.

### `SetByName`

`SetByName(sName, vValue)` → any

> Assigns a value to a variable whose name is supplied at runtime.

### `SetDecimalSeparator`

`SetDecimalSeparator(sDecimalSep)` → string

> Sets the current decimal separator and returns the previous setting.

### `SetDefaultConnection`

`SetDefaultConnection(sDefaultConnection)` → string

> Changes the active default database connection name and returns the previous default connection.

### `SetGroupSeparator`

`SetGroupSeparator(sGroupSep)` → string

> Changes the group (thousands) separator character used when numbers are formatted as strings across the application.

### `SetInternal`

`SetInternal(oTarget, sPropName, vPropValue)` → NIL

> Assigns a value to a named property on a target value and returns NIL.

### `SetInternalC`

`SetInternalC(oTarget, sCollectionName, vValue, vArg1, [vArg2], [vArg3], [vArg4], [vArg5], [vArg6])` → NIL

> Assigns a value through a chained index path on a target value and returns NIL.

### `SetSqlTimeout`

`SetSqlTimeout([nTimeout], [sConnection])` → number

> Sets the SQL command timeout for a database connection and returns the previous timeout value for that same connection.

### `SetUserData`

`SetUserData(sUserName);` → NIL

> Sets the current user name for the active execution context.

### `SetUserPassword`

`SetUserPassword(sUserName, sPassword)` → string

> Updates a user's password and returns the stored password hash.

### `ShowSqlErrors`

`ShowSqlErrors(bEnable)` → boolean

> Sets the SQL error display flag and returns the previous setting.

### `SigFig`

`SigFig(sStandard, nDigits, nValue)` → string

> Returns a string produced by applying a named rounding standard to a numeric value.

### `SortArray`

`SortArray(aTarget, [vNumeric])` → array

> Sorts an array in place and returns the same array.

### `Sqrt`

`Sqrt(nNumber)` → number

> Calculates the square root of a number.

### `StdRound`

`StdRound(sStandard, nDigits, nNumber)` → string

> Returns a string produced by applying a named rounding standard to a numeric value.

### `Str`

`Str(nNumber, [nLength], [nDecimals])` → string

> Converts a numeric value to a formatted string.

### `StrSrch`

`StrSrch(subStr, source, [indexOrOccurence], [flag])` → number

> Finds a substring by occurrence number or from a specific 1-based starting position.

### `StrTran`

`StrTran(source, searchFor, replaceWith)` → string

> Replaces all occurrences of a specified substring with another substring in a source string.

### `StrZero`

`StrZero(nNumber, [nLength], [nDecimals])` → string

> Formats a number as a zero-padded string, with optional total width and decimal precision.

### `StringToDate`

`StringToDate(sDateString, sDateFormat)` → date

> Converts a formatted date string into a date value using a specified pattern.

### `SubStr`

`SubStr(sSource, [nStartPos], [nLength])` → string

> Extracts part of a string starting at a position you specify.

### `SubmitToBatch`

`SubmitToBatch(sCode, [vParameters], [sMode], [sUserName], [sPassword])` → string

> Submits SSL code to a batch worker and returns the submitted job identifier.

### `SubmitToBatchEx`

`SubmitToBatchEx(sCode)` → string

> Submits SSL code to batch execution and returns the submitted job identifier.

### `TableFldLst`

`TableFldLst([sConnectionName], sTableName)` → array

> Returns the field names for a table on a selected database connection.

### `Time`

`Time()` → string

> Returns the current time as a formatted string.

### `ToJson`

`ToJson(vValue)` → string

> Serializes a value to a JSON string.

### `ToNumeric`

`ToNumeric(sNumber, [bAllowHex])` → number

> Converts a string to a number, with optional hexadecimal support.

### `ToScientific`

`ToScientific(nNumber, [nDecimalPlaces])` → string

> Converts a numeric value to a scientific-notation string.

### `ToXml`

`ToXml(vValue)` → string

> Converts a value to an XML string.

### `Today`

`Today()` → date

> Returns the current date as a date object.

### `Trim`

`Trim(sSource)` → string

> Removes trailing whitespace from a string.

### `UpdLong`

`UpdLong([sConnectionName], sTableName, sColumnName, sWhereCondition, sInputFilePath, [bIsCompressed])` → boolean

> Updates a large field value in a database table from the contents of a file, using search criteria for row selection.

### `Upper`

`Upper(sSource)` → string

> Converts all characters in a string to uppercase.

### `UrlDecode`

`UrlDecode(sData)` → string

> Decodes a URL-encoded string.

### `UrlEncode`

`UrlEncode(sData)` → string

> Converts a string into a format safe for inclusion in a URL by encoding unsafe characters.

### `UserTimeZone`

`UserTimeZone()` → number

> Returns the current user's UTC offset in minutes. If a user-specific offset is not available as a numeric value, the function returns the server's UTC offset instead.

### `UsrMes`

`UsrMes(vCaption, [vMessage])` → string

> Writes a user message to the user log and returns the formatted log text.

### `Val`

`Val(sNumber)` → number

> Converts numeric text at the start of a string to a number.

### `ValidateDate`

`ValidateDate(sDateString, [bUseDateFormat])` → boolean

> Checks whether a string can be interpreted as a valid date.

### `ValidateNumeric`

`ValidateNumeric(sNumber)` → boolean

> Determines whether a string is a valid numeric value under the current STARLIMS numeric settings.

### `VerifySignature`

`VerifySignature(sCertificateString, sData, sSignature)` → boolean

> Verifies a base64-encoded digital signature against a string by using the public key from a supplied X.509 certificate.

### `WriteBytesBase64`

`WriteBytesBase64(sFileName, sBase64Data)` → string

> Writes a base64-encoded value to disk as binary file content.

### `WriteText`

`WriteText(sFileName, sCharsToWrite, [vConfirmRequired], [sAppend], [sEncoding])` → string

> Writes string content to a file.

### `WriteToFtp`

`WriteToFtp(sServerNameOrIP, sRemoteDirectory, sRemoteFileName, sFileContents, sUserName, sPassword, [nPort], [sProxy], [bIsSFTP], [sPrivateKeyFilePath])` → boolean

> Appends text to a remote file over FTP or SFTP.

### `XmlDomToUdObject`

`XmlDomToUdObject(sXml, [bPreserveWhitespace])` → object

> Converts an XML string into a dynamic object tree.

### `XmlExportSql`

`XmlExportSql(sSql, sFile, [sDb], [aSqlParams], [sTable])` → string

> Runs a SQL query, writes the result set to an XML file, and returns an empty string on success or an error message on failure.

### `Year`

`Year(dDate)` → number

> Extracts the numeric year from a date value.

### `_AND`

`_AND(nValue1, nValue2)` → number

> Performs a bitwise AND operation between two integer numbers and returns the result.

### `_NOT`

`_NOT(nOperand)` → number

> Returns the bitwise complement of a whole-number operand.

### `_OR`

`_OR(nValue1, nValue2)` → number

> Returns the bitwise inclusive OR of two whole-number operands.

### `_XOR`

`_XOR(nValue1, nValue2)` → number

> Returns the bitwise exclusive OR of two whole-number operands.
