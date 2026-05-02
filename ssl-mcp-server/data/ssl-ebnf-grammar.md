# Complete SSL Language EBNF Grammar

The following EBNF grammar formally defines the syntax of the STARLIMS Scripting Language (SSL) version 11. It documents the authoritative behavior of the SSL language.

## Purpose and Usage

This EBNF (Extended Backus-Naur Form) grammar serves as a formal definition of the SSL language syntax. It is particularly useful for:

1. **Language Tool Development**: Creating formatters, linters, syntax highlighters, and other tools for SSL.
2. **Parser Implementation**: Building parsers that can validate and process SSL code.
3. **Reference Documentation**: Providing a definitive reference for valid language constructs.

While this grammar defines what is syntactically valid in SSL, it does not prescribe specific formatting preferences or coding conventions - those are covered in the separate SSL Style Guide. For instance, the preferred formatting for skipped parameters in lists (e.g., `param1,,param3`) is to keep skipped-argument commas adjacent with no intervening spaces. Such stylistic choices are handled by the formatter.

**Scope:** This grammar covers standard SSL — server scripts and class files. Data source files (SSL and SQL data sources) are preprocessed server-side before they run. The preprocessing syntax — inline `:=` parameter defaults (`:PARAMETERS p1 := val;`) and builder directives (`:DSN`, `:TABLENAME`, `:NULLASBLANK`, `:INVARIANTDATECOLUMNS`) — is not part of this grammar. See `ssl_agent_instructions.md` §4A for data source syntax.

## Common SSL Code Patterns

The following patterns are frequently seen in SSL code and represent idiomatic usage:

1. **Variable Declaration and Initialization**:

    ```ssl
    :DECLARE sVariable;
    sVariable := "value";
    ```

2. **Procedure Definition and Calling**:

    ```ssl
    :PROCEDURE DoSomething;
        :PARAMETERS param1, param2;

        /* Procedure body;

        :RETURN result;
    :ENDPROC;

    /* Calling the procedure;
    result := DoProc("DoSomething", {value1, value2});
    ```

3. **Conditional Logic**:

    ```ssl
    :IF condition;

        /* True branch;

    :ELSE;

        /* False branch;

    :ENDIF;
    ```

4. **Array Processing**:

    ```ssl
    :DECLARE aItems, nCount;
    aItems := {1, 2, 3, 4, 5};
    nCount := Len(aItems);

    /* Process array elements;
    :DECLARE i;
    i := 0;

    :WHILE (i += 1) <= nCount;

        /* Process aItems[i];

    :ENDWHILE;
    ```

5. **Error Handling**:

    ```ssl
    :TRY;

        /* Code that might cause an error;

    :CATCH;

        /* Error handling code;

    :ENDTRY;
    ```

6. **Database Access**:

    ```ssl
    aResults := DatabaseFunction("SELECT field1, field2 FROM tablename WHERE condition = ?param?");

    aResultsAlt := SearchFunction("SELECT field1, field2 FROM tablename WHERE condition = ?",,,{param});
    ```

## Notation

This grammar uses Extended Backus-Naur Form (EBNF) with the following conventions:

-   Terminal symbols are enclosed in double quotes: `"keyword"`
-   Non-terminal symbols are written as identifiers: `Statement`
-   Alternatives are separated by vertical bars: `A | B`
-   Optional elements are enclosed in square brackets: `[A]`
-   Elements that can be repeated zero or more times are enclosed in braces: `{A}`
-   Parentheses are used for grouping: `(A | B) C`
-   The definition symbol is `::=`
-   Comments are preceded by `(* ` and followed by ` *)`
-   Colon-keyword pairs (e.g., `":" "FOR"`) are single units with no intervening whitespace — they are written as two terminals here for readability only

## Grammar Definition

```ebnf
(*
    SSL (STARLIMS Scripting Language) Version 11 EBNF Grammar
    Last updated: 2026-03-21
    Documents the authoritative syntax of SSL v11.
*)

(* Top-level structure *)
Program ::= ClassDefinition | {Statement} (* A script can be a class definition or a series of statements. :PARAMETERS must appear before any other statements. :DEFAULT must immediately follow :PARAMETERS. :INCLUDE is resolved as a textual paste before the rest of the file is read. :DECLARE and :PUBLIC can appear anywhere. Recommended conventional order: :PARAMETERS, :DEFAULT, :INCLUDE, :PUBLIC, :DECLARE. *)

(* Statement types *)
(* CommentStatement includes its own terminating ";" as part of the comment syntax *)
Statement ::= CommentStatement | SimpleStatement ";" | BlockStatement | ExitWhileStatement | ExitForStatement | LoopContinue (* Loop-control statements include their own ";". Note: :EXITFOR, :EXITWHILE, and :LOOP are rejected outside their respective loop contexts — they appear here for grammar completeness but are context-restricted *)
SimpleStatement ::=
    DeclarationStatement |
    LogicStatement |
    LabelStatement |
    BranchStatement |
    DatabaseStatement
BlockStatement ::=
    ProcedureStatement |
    ConditionalStatement |
    LoopStatement |
    SwitchStatement |
    ErrorHandlingStatement | (* :TRY/:CATCH blocks *)
    ErrorBlockStanza |       (* :ERROR blocks *)
    RegionBlock |            (* :REGION/:ENDREGION keywords *)
    InlineCodeBlock          (* :BEGININLINECODE/:ENDINLINECODE keywords *)

(* Class definitions *)
ClassDefinition ::= ClassDeclaration [InheritStatement] {ClassFieldDeclaration} {MethodDeclaration} [ConstructorDeclaration] (* This ordering is required: INHERIT, fields, methods, then Constructor *)
ClassDeclaration ::= ":" "CLASS" [Identifier] ";" (* Class name is syntactically optional *)
InheritStatement ::= ":" "INHERIT" (Identifier | QualifiedIdentifier) ";" (* Supports qualified names like "Category.ClassName" *)
ClassFieldDeclaration ::= ":" "DECLARE" IdentifierList ";" (* Used for class fields *)
MethodDeclaration ::= ProcedureStatement (* Methods are defined like procedures within a class context *)
ConstructorDeclaration ::= ProcedureStatement (* Must be named "Constructor" (case-insensitive); if omitted, an empty zero-argument constructor is auto-generated *)

(* Procedure declarations *)
ProcedureStatement ::= ProcedureStart [ParameterDeclaration] {DefaultParameterDeclaration} {Statement} ProcedureEnd
ProcedureStart ::= ":" "PROCEDURE" Identifier ";"
ProcedureEnd ::= ":" "ENDPROC" ";"

(* Parameter declarations — procedure-level; semicolons are explicit here because these are not wrapped by the Statement production *)
ParameterDeclaration ::= ":" "PARAMETERS" IdentifierList ";"
DefaultParameterDeclaration ::= ":" "DEFAULT" DefaultParameterPair ";"

(* Parameter default values — one identifier/expression pair per :DEFAULT line *)
DefaultParameterPair ::= Identifier "," Expression

(* Conditional statements *)
ConditionalStatement ::= IfStatement {Statement} [ElseBlock] EndIfStatement
IfStatement ::= ":" "IF" Expression ";"
ElseBlock ::= ":" "ELSE" ";" {Statement}
EndIfStatement ::= ":" "ENDIF" ";"

(* Loop statements *)
LoopStatement ::= WhileLoop | ForLoop
WhileLoop ::= WhileStatement {Statement} EndWhileStatement
WhileStatement ::= ":" "WHILE" Expression ";"
EndWhileStatement ::= ":" "ENDWHILE" ";"
ExitWhileStatement ::= ":" "EXITWHILE" ";"
ForLoop ::= ForStatement {Statement} NextStatement
ForStatement ::= ":" "FOR" Identifier ":=" Expression ":" "TO" Expression [":" "STEP" Expression] ";"
NextStatement ::= ":" "NEXT" ";"
ExitForStatement ::= ":" "EXITFOR" ";"
LoopContinue ::= ":" "LOOP" ";" (* Represents a 'continue' for the current loop iteration *)

(* Switch case statements *)
SwitchStatement ::= BeginCaseStatement CaseBlock {CaseBlock} [OtherwiseBlock] EndCaseStatement (* At least one CASE is required *)
BeginCaseStatement ::= ":" "BEGINCASE" ";"
CaseBlock ::= CaseStatement {Statement} [ExitCaseStatement]
CaseStatement ::= ":" "CASE" Expression ";"
OtherwiseBlock ::= OtherwiseStatement {Statement} [ExitCaseStatement]
OtherwiseStatement ::= ":" "OTHERWISE" ";"
EndCaseStatement ::= ":" "ENDCASE" ";"
ExitCaseStatement ::= ":" "EXITCASE" ";"

(* Error handling statements *)
ErrorHandlingStatement ::= TryBlock (* For :TRY/:CATCH/:FINALLY structure *)
TryBlock ::= TryStatement Statement {Statement} (CatchBlock [FinallyBlock] | FinallyBlock) EndTryStatement (* TRY body requires >=1 statement; at least one of CATCH or FINALLY is required *)
TryStatement ::= ":" "TRY" ";"
CatchBlock ::= CatchStatement {Statement} (* CATCH body allows zero or more statements *)
CatchStatement ::= ":" "CATCH" ";"
FinallyBlock ::= FinallyStatement Statement {Statement} (* FINALLY body requires >=1 statement *)
FinallyStatement ::= ":" "FINALLY" ";"
EndTryStatement ::= ":" "ENDTRY" ";"

ErrorBlockStanza ::= ErrorMarker Statement {Statement} [ResumeStatement] (* For :ERROR structure — body requires >=1 statement; optional :RESUME switches to resume mode *)
ErrorMarker ::= ":" "ERROR" ";"
ResumeStatement ::= ":" "RESUME" ";" (* Inside :ERROR handler — switches to resume mode, wrapping each subsequent statement in individual try/catch *)

(* Declaration statements *)
DeclarationStatement ::= (
    ParametersStatement |
    DeclareStatement |
    DefaultStatement |
    PublicStatement |
    IncludeStatement
)
ParametersStatement ::= ":" "PARAMETERS" IdentifierList (* Must appear before any other statements *)
DeclareStatement ::= ":" "DECLARE" IdentifierList (* Regular statement — can appear anywhere *)
DefaultStatement ::= ":" "DEFAULT" DefaultParameterPair (* Must immediately follow :PARAMETERS *)
PublicStatement ::= ":" "PUBLIC" IdentifierList (* Regular statement — can appear anywhere *)
IncludeStatement ::= ":" "INCLUDE" IncludeTarget (* Resolved as a textual paste; place early for clarity *)
IncludeTarget ::= Identifier | QualifiedIdentifier
QualifiedIdentifier ::= Identifier {"." Identifier}

(* Logic statements *)
LogicStatement ::= Assignment | FunctionCall | Expression | ReturnStatement
Assignment ::= (VariableAccess | PropertyAccess) AssignmentOperator Expression
AssignmentOperator ::= ":=" | "+=" | "-=" | "*=" | "/=" | "^=" | "%="
ReturnStatement ::= ":" "RETURN" [Expression] (* Inside a Constructor, :RETURN cannot include an expression — bare :RETURN; only *)

(* Function calls *)
FunctionCall ::= DirectFunctionCall | IndirectFunctionCall
DirectFunctionCall ::= Identifier "(" [ArgumentList] ")"
IndirectFunctionCall ::= Identifier "(" StringLiteral ["," ArrayLiteral] ")" (* Canonical indirect call pattern for DoProc / ExecFunction *)
ArgumentList ::= Expression {"," Expression}

(* Comment statements *)
CommentStatement ::= "/*" {Character} ";" (* All SSL comments use the same syntax: /* ... ; SSL does not distinguish single-line from multi-line — both forms are syntactically identical. Multi-line comments simply contain embedded newlines within the character sequence. *)

(* Special structures *)
LabelStatement ::= ":" ("LABEL" Identifier {Identifier} | MashedLabelName) (* Accepted forms include :LABEL Name; and :LABELName; *)
MashedLabelName ::= "LABEL" Identifier
RegionBlock ::= RegionStart {Character} RegionEnd (* Keyword-based regions :REGION / :ENDREGION *)
RegionStart ::= ":" "REGION" Identifier ";"
RegionEnd ::= ":" "ENDREGION" ";"
InlineCodeBlock ::= InlineCodeStart [Program] InlineCodeEnd (* Body is re-parsed as a complete SSL unit — may contain procedures, parameters, classes, etc. *)
InlineCodeStart ::= ":" "BEGININLINECODE" (Identifier | QuotedIdentifier) ";" (* Name is required — bare identifier or double-quoted identifier only *)
QuotedIdentifier ::= '"' Identifier '"' (* A double-quoted identifier form; single-quoted and bracket string forms are not accepted as inline code names *)
InlineCodeEnd ::= ":" "ENDINLINECODE" ";"
BranchStatement ::= Identifier "(" StringLiteral ")" (* Generic branch/control flow pattern *)

(* Database Integration *)
DatabaseStatement ::= DatabaseFunctionCall
DatabaseFunctionCall ::= Identifier "(" StringLiteral ["," Expression] {"," Expression} ")" (* Database functions take a SQL string plus optional additional arguments such as friendly names, flags, and parameter arrays *)
DatabaseParameter ::= "?" Identifier "?" | "?" (* Parameter placeholders inside SQL string arguments of DatabaseFunctionCall — ?Name? for SQLExecute named params, ? for positional params in RunSQL/LSearch/etc. *)

(* Object-oriented statements specific to SSL classes/UDOs *)
ObjectCreation ::= BuiltInClassInstantiation | DynamicObjectCreation | UserDefinedObjectCreation | AnonymousObjectCreation
BuiltInClassInstantiation ::= Identifier "{" [ArgumentList] "}"
DynamicObjectCreation ::= "CreateUdObject" "(" ")"
UserDefinedObjectCreation ::= "CreateUdObject" "(" StringLiteral ["," ArrayLiteral] ")"
AnonymousObjectCreation ::= "CreateUdObject" "(" ArrayLiteral ")"
MemberReceiver ::= Identifier | PropertyAccess | MethodCall | ArrayAccess | FunctionCall | MeLiteral | BaseAccess | "(" Expression ")" (* Any postfix expression that can appear before ":" in member access — this production is left-recursive; implementations resolve via precedence climbing or iterative parsing *)
MethodCall ::= MemberReceiver ":" Identifier "(" [ArgumentList] ")" (* Object:Method() — distinguished from PropertyAccess by presence of parentheses; receiver can be any postfix expression, enabling chaining like obj:Method():Prop *)

(* Expressions *)
(* Note: The tree-sitter grammar extends Expression to include Assignment for editor chaining support. This EBNF keeps them separate to reflect the canonical grammar where assignment is a statement, not an expression. *)
Expression ::= OrExpression
OrExpression ::= AndExpression {".OR." AndExpression} (* .OR. — lowest logical precedence *)
AndExpression ::= ComparisonExpression {".AND." ComparisonExpression} (* .AND. — binds tighter than .OR. *)
ComparisonExpression ::= RelationalExpression {(EqualityOperator | ContainmentOperator) RelationalExpression}
EqualityOperator ::= "=" | "==" | "!=" | "<>" | "#" (* "=" is loose equality (prefix match for strings); "==" is strict equality; "#", "<>", "!=" are equivalent not-equals (negate ==, not =) *)
ContainmentOperator ::= "$" (* containment: left $ right is .T. if left found inside right *)
RelationalExpression ::= ShiftExpression {RelationalOperator ShiftExpression}
RelationalOperator ::= "<" | ">" | "<=" | ">="
ShiftExpression ::= ArithmeticExpression {ShiftOperator ArithmeticExpression}
ArithmeticExpression ::= Term {AdditiveOperator Term}
AdditiveOperator ::= "+" | "-"
Term ::= Factor {MultiplicativeOperator Factor}
MultiplicativeOperator ::= "*" | "/" | "%"
Factor ::= PowerOperand [PowerOperator Factor] (* Right-associative: 2^3^2 = 2^(3^2) = 512 *)
PowerOperator ::= "^" | "**" (* Both forms are equivalent for exponentiation *)
PowerOperand ::= [UnaryOperator] Primary
UnaryOperator ::= "-" | "!" | ".NOT."

(* Bitwise operations — SSL uses function call syntax, not infix operators *)
(* << and >> are infix shift operators, integrated into the expression precedence chain above *)
ShiftOperator ::= "<<" | ">>"
BitwiseOperation ::= "_AND" "(" Expression "," Expression ")" |
                    "_OR" "(" Expression "," Expression ")" |
                    "_XOR" "(" Expression "," Expression ")" |
                    "_NOT" "(" Expression ")"

(* Primary expressions *)
Primary ::=
    Literal |
    VariableAccess |
    PropertyAccess |     (* Object:Property syntax for UDOs and system objects *)
    ArrayAccess |
    FunctionCall |
    BitwiseOperation |
    "(" Expression ")" |
    IncrementExpression |
    MeLiteral |          (* Me — reference to the current class instance *)
    BaseAccess |         (* Base:Member — reference to the parent class for inherited member access *)
    MethodCall |         (* Object:Method() syntax *)
    ObjectCreation       (* CreateUdObject() and built-in class instantiation *)

IncrementExpression ::= IncrementTarget ("++" | "--") | ("++" | "--") IncrementTarget (* Applies to variables, properties, and array elements *)
IncrementTarget ::= Identifier | PropertyAccess | ArrayAccess
VariableAccess ::= Identifier
MeLiteral ::= "Me" (* Case-insensitive; reference to the current class instance; used as Me:Method() or Me:Property *)
BaseAccess ::= "Base" ":" Identifier ["(" [ArgumentList] ")"] (* Case-insensitive; Base must always be followed by a member name; it cannot stand alone *)
PropertyAccess ::= MemberReceiver ":" Identifier (* SSL uses colon for property access — receiver can be any postfix expression, enabling chaining like obj:prop:subprop *)
ArrayAccess ::= Identifier ArraySubscript
ArraySubscript ::= "[" Expression {"," Expression} "]" | "[" Expression "]" {("[" Expression "]")} (* Supports arr[1,2] and arr[1][2] *)

(* Literals *)
Literal ::= NumberLiteral | StringLiteral | BooleanLiteral | ArrayLiteral | NilLiteral | CodeBlockLiteral
NumberLiteral ::= IntegerPart [DecimalPart [Exponent]] (* Scientific notation requires a decimal part: '7.0e2' works, '7e2' does not *)
IntegerPart ::= Digit {Digit}
DecimalPart ::= "." Digit {Digit} (* Ensures at least one digit after the decimal point *)
Exponent    ::= ("e" | "E") ["-"] Digit {Digit}

StringLiteral ::= '"' {Character} '"' | "'" {Character} "'" | BracketString (* Double-quoted, single-quoted, or bracket strings; no escape sequences — backslashes are literal *)
BracketString ::= "[" {BracketChar} "]" (* Bracket strings allow one level of nesting: [[a]b] yields the string [a]b. An inner "[" opens a nested span that consumes characters until its paired "]", then the outer "]" closes the string. Deeper nesting is not supported. *)
BooleanLiteral ::= ".T." | ".F." (* Case-insensitive: .t. and .f. are also valid. .T./.F. are the canonical forms *)
ArrayLiteral ::= "{" [ExpressionList] "}" (* Nested arrays are naturally supported since Expression includes ArrayLiteral; mixed content like {1, {2,3}, "x"} is valid *)
NilLiteral ::= "NIL" (* Case-insensitive: nil, Nil, etc. are also valid *)
CodeBlockLiteral ::= "{|" IdentifierList "|" Expression "}" (* At least one parameter required; e.g. {|x| x*x} *)


(* Lists *)
IdentifierList ::= Identifier {"," Identifier}
ExpressionList ::= Expression {"," Expression}

(* Basic elements *)
Identifier ::= (Letter | "_") {Letter | Digit | "_"}
Letter ::= "A" | "B" | ... | "Z" | "a" | "b" | ... | "z"
Digit ::= "0" | "1" | ... | "9"
Character ::= Letter | Digit | Symbol (* Define Symbol appropriately, excluding delimiter of current context *)
Symbol ::= (* Any printable character, specific exclusions depend on context like string delimiters *)
Newline ::= "\n" | "\r\n" | "\r" (* Line termination characters *)
```

## Notes on the Grammar

1. **Hungarian Notation**: While not explicitly defined in the grammar, SSL uses Hungarian notation for variable naming (e.g., `sName`, `nValue`, `bIsValid`).

2. **Case Sensitivity**: SSL keywords are case-sensitive and must be UPPERCASE (e.g., `:IF` not `:if`). Identifiers and function names are case-insensitive. SSL literals (`.T.`, `.F.`, `NIL`) and class-context forms (`Me`, `Base`, `Constructor`) are also case-insensitive.

3. **Statement Termination**: All statements in SSL are terminated with a semicolon (`;`).

4. **Property Access**: SSL uses a colon (`:`) for property access rather than the more common dot notation.

5. **Logical Literals**: Boolean values true and false are represented as `.T.` and `.F.` with surrounding periods.

6. **Increment/Decrement**: The language supports both prefix and postfix increment/decrement operators.

7. **Block Structure**: Control structures like conditionals and loops follow a block-based structure with explicit end markers (`:ENDIF`, `:ENDWHILE`, etc.).

8. **Comments**: Comments in SSL start with `/*` and end at the first semicolon `;`, rather than using traditional comment delimiters like `*/`. **A semicolon inside comment text will prematurely end the comment** — never include `;` within comment text. Comments are classified as:

    - **Single-line comments**: Comments that appear entirely on one line (e.g., `/* This is a comment ;`)
    - **Block comments**: Comments that span multiple lines (e.g., `/* This is a \n multi-line comment ;`)
    - **IDE folding comments**: Comments like `/* region` that provide editor folding hints (not language constructs)

9. **Regions**: SSL supports functional regions for code templating:
    - **Functional regions**: `:REGION identifier; ... :ENDREGION;` - stored at runtime for dynamic code retrieval
    - **IDE folding regions**: `/* region description; ... /* endregion;` - editor folding markers, not language constructs

10. **Database Integration**: Database queries are typically represented as string literals. Parameters in database statements can be represented as `?PARAMETER?` (named parameters) or simply `?` (positional parameters).

11. **For Loop Structure**: For loops require an immediate iterator assignment (`:FOR i := 1 :TO 10;`) which cannot be set outside the loop declaration. The loop terminator is `:NEXT`, not `:ENDFOR`. Although `:ENDFOR` is a reserved word, it is not usable — writing it is rejected as a syntax error.

12. **Array Access**: Multi-dimensional arrays can be accessed using comma notation `array[1,2]` or chained bracket notation `array[1][2]`. Array indexing is 1-based (the first element is at index 1, not 0).

13. **Date Values**: SSL has no date literal syntax. Dates are created via functions such as `CToD(sDateString)`, `DateFromNumbers(vYear, vMonth, vDay, ...)`, `Today()`, and `Now()`. Brace-delimited forms like `{2026, 3, 23}` are array literals, not dates.

14. **Scientific Notation**: Number literals can include scientific notation using 'e' or 'E' followed by an optional negative sign and exponent. The formats `1.23e5`, `4.56E-3`, and `0.5e1` are supported, while formats with an explicit plus sign (`9E+1`), without a decimal point before the 'e' (`7e2`), or with a leading decimal point without a zero (`.5e1`) are not supported.

15. **Function Calls**: Functions are called using two primary patterns:

    - Direct call: `functionName(param1, param2)`
    - Indirect call: `indirectFunction("functionName", {param1, param2})`

16. **Parameter Passing**: Parameters are passed positionally as an array. To skip parameters, use adjacent commas with no intervening spaces: `indirectFunction("function", {param1,,param3})`. Trailing optional parameters can be omitted entirely.

17. **Default Parameters**: Default values for parameters can be specified using the `:DEFAULT` keyword after the `:PARAMETERS` declaration.

18. **Object Creation**: Objects are created using constructor functions and properties are accessed using colon notation: `object:property`.

19. **Error Handling**: SSL supports both traditional error handling with `:ERROR` and structured exception handling with `:TRY`/`:CATCH`/`:FINALLY`/`:ENDTRY`.

20. **Labels and Branching**: SSL supports legacy `:LABEL` and `Branch()` for label-based branching. The `StringLiteral` argument should typically be of the format `"LABEL actualLabelName"`. Structured control flow is generally preferred when it expresses the logic clearly.

21. **Dynamic Code**: SSL supports dynamic code execution through dynamic execution functions and code blocks.

22. **Inline Code and Regions**: Special blocks for storing and retrieving code snippets can be created using `:BEGININLINECODE`/`:ENDINLINECODE` and `:REGION`/`:ENDREGION`.

23. **String Delimiters**: Strings can be delimited using double quotes (`"`), single quotes (`'`), or brackets (`[text]`). SSL has no escape sequences — backslashes are literal characters.

24. **String Operators**: `+` concatenates two strings. `-` trims trailing spaces from the left operand, then concatenates. `$` tests containment (`left $ right` returns `.T.` if left is found inside right). `=` is loose (prefix) equality and `==` is exact equality (see note 26).

25. **Assignment Operators**: In addition to the standard assignment operator (`:=`), SSL supports compound assignment operators (`+=`, `-=`, `*=`, `/=`, `%=`, `^=`).

26. **Object-Oriented Programming**: SSL supports class definitions with inheritance and methods using the `:CLASS`, `:INHERIT`, and `:PROCEDURE` keywords. A class definition encompasses the script in which it is declared, and there is no explicit `:ENDCLASS` keyword; the class structure ends with the file. One class per file (enforced by the language). A file is either a class OR a script, never both. Built-in classes use curly-brace instantiation (`Email{}`, `SSLDataset{}`); user-defined classes use `CreateUdObject("ClassName")`.

27. **Comparison Operators**: `=` is loose equality (for strings: returns `.T.` if right is empty or if left starts with right; for numbers: exact). `==` is strict equality. `!=` is the preferred not-equals operator; `<>` and `#` are equivalent but not preferred. All three negate `==` (strict), not `=` (loose) — so for strings, `=` and `!=` are **not logical opposites**. The operators `===` and `!==` are not supported. `$` is containment: `left $ right` returns `.T.` if left is found inside right.

28. **Bitwise Operations**: Bitwise operations are performed using function call syntax (`_AND()`, `_OR()`, `_XOR()`, `_NOT()`), not infix operators. Only `<<` and `>>` are infix shift operators.

29. **BEGINCASE Multi-Match Behavior**: `:BEGINCASE` is not a value-matching switch. Each `:CASE` evaluates its own boolean expression. Without `:EXITCASE`, later `:CASE` expressions are still evaluated and additional matching bodies may execute. `:OTHERWISE` executes only if no earlier `:CASE` body ran, even if a matching `:CASE` omitted `:EXITCASE`. At least one `:CASE` block is required.

30. **TRY/CATCH/FINALLY**: At least one of `:CATCH` or `:FINALLY` is required. Bare `:TRY`...`:ENDTRY` without either is rejected. `:EXITFOR`, `:EXITWHILE`, `:LOOP`, and `:RETURN` are rejected inside `:FINALLY` blocks.

## Implementation Considerations for Formatting Tools

When implementing a formatter for SSL, consider the following specifics that may not be explicitly defined in the grammar but affect code readability:

1. **Indentation**: Code blocks within control structures (`:IF`/`:ENDIF`, `:WHILE`/`:ENDWHILE`, etc.) should be indented consistently. Tabs are preferred; spaces are also accepted (4-space width when used).

2. **Alignment**: Parameters in multi-line function calls or array declarations are often aligned for readability.

3. **Empty Lines**: Use empty lines to separate logical sections of code, particularly between procedure definitions.

4. **Line Length**: Break long lines at logical points (typically around 90 characters), especially for:

    - Long parameter lists in function calls
    - Complex logical expressions
    - SQL queries
    - Array declarations

5. **SQL Formatting**: SQL statements embedded in strings should follow SQL formatting conventions, with clauses (SELECT, FROM, WHERE) aligned and properly indented.

6. **Comment Alignment**: End-of-line comments should be aligned at a consistent column position when appearing on consecutive lines.

7. **Section Headers**: Consider preserving region markers and section headers as structural elements of the code.

8. **Special Case Handling**: Take special care with:
    - String concatenation operators
    - Spacing around property access colons
    - Logical operators preceded by dots (`.AND.`, `.OR.`, `.T.`, `.F.`)
    - Increment/decrement operators which should not have spaces
