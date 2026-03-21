function makeIfBlock($, statementRule) {
  return seq(
    $.kw_if, $.expression, ';',
    repeat(statementRule),
    optional(seq($.kw_else, ';', repeat(statementRule))),
    $.kw_endif, ';'
  )
}

function makeWhileBlock($, statementRule) {
  return seq(
    $.kw_while, $.expression, ';',
    repeat(statementRule),
    $.kw_endwhile, ';'
  )
}

function makeForBlock($, statementRule) {
  return seq(
    $.kw_for, field('loop_var', $.identifier), ':=', $.expression, $.kw_to, $.expression,
    optional(seq($.kw_step, $.expression)), ';',
    repeat(statementRule),
    $.kw_next, ';'
  )
}

function makeSwitchBlock($, statementRule) {
  return seq(
    $.kw_begincase, ';',
    seq($.kw_case, $.expression, ';', repeat(statementRule), optional(seq($.kw_exitcase, ';'))),
    repeat(seq($.kw_case, $.expression, ';', repeat(statementRule), optional(seq($.kw_exitcase, ';')))),
    optional(seq($.kw_otherwise, ';', repeat(statementRule), optional(seq($.kw_exitcase, ';')))),
    $.kw_endcase, ';'
  )
}

function makeTryCatchBlock($, bodyRule, finallyRule) {
  return seq(
    $.kw_try, ';',
    repeat1(bodyRule),
    choice(
      seq($.kw_catch, ';', repeat(bodyRule), optional(seq($.kw_finally, ';', repeat1(finallyRule)))),
      seq($.kw_finally, ';', repeat1(finallyRule))
    ),
    $.kw_endtry, ';'
  )
}

function makeErrorBlock($, statementRule) {
  return seq($.kw_error, ';', repeat1(statementRule))
}

function makeStatementChoice($, context) {
  const shared = [
    $.declaration_statement_declare,
    $.declaration_statement_public,
    $.resume_statement,
    $.region_block,
    $.inline_code_block,
    $.label_statement,
    $.expression_statement,
  ]

  switch (context) {
    case 'normal':
      return choice(
        ...shared,
        $.if_block,
        $.while_block,
        $.for_block,
        $.switch_block,
        $.try_catch_block,
        $.error_block,
        $.return_statement,
      )
    case 'loop':
      return choice(
        ...shared,
        $.if_block_loop,
        $.while_block,
        $.for_block,
        $.switch_block_loop,
        $.try_catch_block_loop,
        $.error_block_loop,
        $.return_statement,
        $.loop_control_statement,
      )
    case 'finally':
      return choice(
        ...shared,
        $.if_block_finally,
        $.while_block_finally,
        $.for_block_finally,
        $.switch_block_finally,
        $.try_catch_block_finally,
        $.error_block_finally,
      )
    case 'constructor':
      return choice(
        ...shared,
        $.if_block_constructor,
        $.while_block_constructor,
        $.for_block_constructor,
        $.switch_block_constructor,
        $.try_catch_block_constructor,
        $.error_block_constructor,
        $.constructor_return_statement,
      )
    case 'constructor_loop':
      return choice(
        ...shared,
        $.if_block_constructor_loop,
        $.while_block_constructor,
        $.for_block_constructor,
        $.switch_block_constructor_loop,
        $.try_catch_block_constructor_loop,
        $.error_block_constructor_loop,
        $.constructor_return_statement,
        $.loop_control_statement,
      )
    default:
      throw new Error(`Unknown statement context: ${context}`)
  }
}

module.exports = grammar({
  name: 'ssl',

  // NOTE: This grammar is a practical approximation of the SSL language for
  // syntax highlighting, code navigation, and structural queries. It is biased
  // toward forms that usually compile successfully, rather than every form the
  // the repository models directly. Known editor-oriented approximations:
  //
  //   1. :INCLUDE behaves like a top-level include directive in practice. This grammar
  //      only models it in the positions where authors usually place it.
  //
  //   2. :BEGININLINECODE bodies are validated as SSL code. This grammar models them as
  //      nested script/class content.
  //
  //   3. inline_code_block names are restricted to identifier-like forms that
  //      match common accepted usage: bare identifiers or double-quoted
  //      identifiers.
  //
  //   4. :BEGININLINECODE bodies are modeled structurally for editing support,
  //      while :REGION bodies are captured as raw text.
  //
  //   5. bracket_string supports one level of nested brackets (e.g., [[a]b] →
  //      [a]b). Tooling does not attempt to model arbitrarily deep nesting.
  //
  //   6. Assignment (:=, +=, etc.) is modeled as an expression for chaining,
  //      but practical editor support still treats assignment most often as a
  //      standalone statement.
  //
  //   7. Empty argument slots in arrays/call argument lists (e.g. {a,,b}) are
  //      accepted by SSL. Tree-sitter cannot represent truly empty non-start
  //      syntactic children, so this grammar does not model skipped arguments
  //      explicitly.

  extras: $ => [
    /\s/,
    $.comment
  ],

  word: $ => $.identifier,

  conflicts: $ => [
    [$.error_block],
    [$.error_block_loop],
    [$.error_block_finally],
    [$.error_block_constructor],
    [$.error_block_constructor_loop],
    [$._script_compilation_unit],
  ],

  rules: {
    source_file: $ => seq(
      repeat($.declaration_statement_include),
      choice($.script_file, $.class_file)
    ),

    script_file: $ => $._script_compilation_unit,

    _script_compilation_unit: $ => choice(
      seq(
        repeat1($.procedure_declaration),
        $.declaration_statement_parameters,
        repeat($.declaration_statement_default),
        repeat(choice($._script_statement, $.procedure_declaration))
      ),
      seq(
        optional(seq($.declaration_statement_parameters, repeat($.declaration_statement_default))),
        repeat1(choice($.procedure_declaration, $._script_statement))
      )
    ),

    class_file: $ => $.class_declaration,

    // ───── Comments ─────
    // SSL comments start with "/*" and terminate at the first semicolon `;`
    // Example:  /* This is a comment;
    comment: _ => token(seq('/*', /[\s\S]*?/, ';')),

    // ───── Lexical atoms ─────
    identifier: _ => /[A-Za-z_][A-Za-z0-9_]*/,
    // Identifier that is not the keyword "Constructor" (case-insensitive).
    // Tree-sitter doesn't support lookahead, so we use a plain identifier
    // with lower precedence than constructor_name.
    non_constructor_identifier: _ => token(prec(-1, /[A-Za-z_][A-Za-z0-9_]*/)),

    // Qualified identifier for :INHERIT — supports namespace.ClassName
    // (e.g., Research.clsVehicle). Only valid after :INHERIT.
    qualified_identifier: $ => seq($.identifier, repeat1(seq('.', $.identifier))),

    built_in_class_name: _ => choice(
      /AzureStorage/i,
      /BatchSupport/i,
      /CDataTable/i,
      /Email/i,
      /EnterpriseExporter/i,
      /FtpsClient/i,
      /HtmlConverter/i,
      /PatcherSupport/i,
      /PdfSupport/i,
      /RegSetup/i,
      /SDMS/i,
      /SDMSDocUploader/i,
      /SSLBaseDictionary/i,
      /SSLCodeProvider/i,
      /SSLDataset/i,
      /SSLExpando/i,
      /SSLIntDictionary/i,
      /SSLRegex/i,
      /SSLStringDictionary/i,
      /Sequence/i,
      /TablesImport/i,
      /WebServices/i,
    ),

    quoted_identifier: _ => token(seq('"', /[A-Za-z_][A-Za-z0-9_]*/, '"')),

    number: _ => token(choice(
      /[0-9]+\.[0-9]+(?:[eE][+-]?[0-9]+)?/,
      /[0-9]+/
    )),

    string: $ => choice(
      seq('"', repeat(/[^"]/), '"'),
      seq("'", repeat(/[^']/), "'"),
      // Bracket strings: [text] — supports one level of nested brackets
      // e.g., [[funky town]usa] returns [funky town]usa
      $.bracket_string
    ),

    bracket_string: _ => token(seq('[', /(?:[^\[\]]|\[[^\]]*\])*/, ']')),

    // Arrays: { expr, expr, ... }
    array: $ => seq('{', optional(commaSep($, $.expression)), '}'),

    // Built-in classes instantiate with the token sequence IDENT LCURLY args RCURLY.
    builtin_class_instantiation: $ => seq(
      field('class', $.built_in_class_name),
      '{',
      optional(commaSep($, $.expression)),
      '}'
    ),

    // Code blocks (lambdas): {|param1, param2| expression}
    // At least one bound variable is required, and the body is a single
    // expression rather than a statement block.
    code_block: $ => seq(
      '{', '|', commaSep1($, field('parameter', $.identifier)), '|',
      $.expression,
      '}'
    ),

    // Indexers: arr[1], arr[1,2], arr[1][2]
    indexer: $ => seq('[', commaSep1($, $.expression), ']'),

    // Indexed expression: any primary expression followed by indexers
    // Supports: arr[1], arr[1][2], func()[1], obj:prop[1]
    indexed_expression: $ => seq($._indexable_expression, repeat1($.indexer)),

    _indexable_expression: $ => choice(
      $.call_expression,
      $.method_call,
      $.property_access,
      $.identifier,
      $.me_literal,
      $.base_access,
      $.parenthesized_expression
    ),

    // Property / method on UDOs: object:property or object:method(args)
    // Any postfix expression can be a receiver — supports chaining like
    // func():prop, arr[1]:method(), obj:prop:sub
    _member_receiver: $ => choice(
      $.call_expression,
      $.method_call,
      $.property_access,
      $.indexed_expression,
      $.identifier,
      $.me_literal,
      $.base_access,
      $.parenthesized_expression
    ),

    property_access: $ => seq($._member_receiver, ':', field('property', $.identifier)),

    method_call: $ => seq(
      field('receiver', $._member_receiver), ':', field('method', $.identifier),
      field('arguments', $.arguments)
    ),

    arguments: $ => seq('(', optional(commaSep($, $.expression)), ')'),

    // Function calls: fn(args)
    call_expression: $ => seq(field('function', $.identifier), field('arguments', $.arguments)),

    // Assignment and operators
    assignment_operator: _ => choice(':=', '+=', '-=', '*=', '/=', '^=', '%='),

    // Equality operators (= == != <> # $) — lower precedence than relational
    equality_operator: _ => choice('==', '!=', '<>', '#', '='),

    // Containment operator — string instr check (left $ right)
    containment_operator: _ => '$',

    // Relational operators (< > <= >=) — higher precedence than equality
    relational_operator: _ => choice('<', '>', '<=', '>='),

    // Shift operators (<< >>) — own precedence level between relational and additive
    shift_operator: _ => choice('<<', '>>'),

    logical_and_operator: _ => '.AND.',
    logical_or_operator: _ => '.OR.',

    unary_operator: _ => choice('-', '!', '.NOT.'),

    additive_operator: _ => choice('+', '-'),
    multiplicative_operator: _ => choice('*', '/', '%'),
    power_operator: _ => choice('^', '**'),

    // Increment/decrement operators
    increment_operator: _ => choice('++', '--'),

    // Assignment targets: identifiers, property access, and indexed expressions
    assignment: $ => prec.right(seq(
      choice($.identifier, $.property_access, $.indexed_expression),
      $.assignment_operator,
      $.expression
    )),

    parenthesized_expression: $ => seq('(', $.expression, ')'),

    primary_expression: $ => choice(
      $.string,
      $.number,
      $.nil,
      $.boolean,
      $.code_block,
      $.builtin_class_instantiation,
      $.array,
      $.property_access,
      $.method_call,
      $.call_expression,
      $.indexed_expression,
      $.me_literal,
      $.base_access,
      $.identifier,
      $.parenthesized_expression
    ),

    nil: _ => /NIL/i,
    boolean: _ => choice(/\.[Tt]\./, /\.[Ff]\./),
    me_literal: _ => /Me/i,
    // Constructor is reserved as the fixed class-constructor declaration name,
    // not as a general expression literal.
    constructor_name: _ => token(prec(2, /Constructor/i)),
    base_access: $ => seq(/Base/i, ':', field('member', $.identifier),
      optional(field('arguments', $.arguments))),

    // Expression precedence chain (low to high):
    // or → and → equality/containment → relational → shift → additive → multiplicative → power → unary
    //
    // NOTE: _AND, _OR, _XOR, _NOT use function-call syntax such as _AND(a, b)
    // and _NOT(a). They are not infix operators.
    expression: $ => choice(
      $.assignment,
      $.or_expression
    ),

    // .OR. — lowest logical precedence
    or_expression: $ => seq(
      $.and_expression,
      repeat(seq($.logical_or_operator, $.and_expression))
    ),

    // .AND. — higher precedence than .OR.
    and_expression: $ => seq(
      $.equality_expression,
      repeat(seq($.logical_and_operator, $.equality_expression))
    ),

    // Equality operators (= == != <> # $) — same precedence level in the language reference
    equality_expression: $ => seq(
      $.relational_expression,
      repeat(seq(choice($.equality_operator, $.containment_operator), $.relational_expression))
    ),

    // Relational operators (< > <= >=) — higher precedence than equality
    relational_expression: $ => seq(
      $.shift_expression,
      repeat(seq($.relational_operator, $.shift_expression))
    ),

    // Shift operators (<< >>) — between relational and additive
    shift_expression: $ => seq(
      $.arithmetic_expression,
      repeat(seq($.shift_operator, $.arithmetic_expression))
    ),

    arithmetic_expression: $ => seq(
      $.term,
      repeat(seq($.additive_operator, $.term))
    ),

    term: $ => seq(
      $.power,
      repeat(seq($.multiplicative_operator, $.power))
    ),

    // Power operator — right-associative (2^3^2 = 2^(3^2) = 512)
    power: $ => seq(
      $.unary,
      optional(seq($.power_operator, $.power))
    ),

    unary: $ => choice(
      seq($.unary_operator, $.unary),
      $.increment_expression,
      $.primary_expression
    ),

    // Increment/decrement: works on identifiers, property access, and indexed expressions
    increment_expression: $ => choice(
      seq(choice($.identifier, $.property_access, $.indexed_expression), $.increment_operator),
      seq($.increment_operator, choice($.identifier, $.property_access, $.indexed_expression))
    ),

    // ───── Statements (each ends with ;) ─────
    _statement: $ => makeStatementChoice($, 'normal'),

    _statement_no_default: $ => $._statement,

    _loop_statement: $ => makeStatementChoice($, 'loop'),

    _finally_statement: $ => makeStatementChoice($, 'finally'),

    _constructor_statement: $ => makeStatementChoice($, 'constructor'),

    _constructor_loop_statement: $ => makeStatementChoice($, 'constructor_loop'),

    _script_statement: $ => $._statement,

    // Generic expression statement (must end with ;) 
    expression_statement: $ => seq($.expression, ';'),

    return_statement: $ => seq($.kw_return, optional($.expression), ';'),
    constructor_return_statement: $ => seq($.kw_return, ';'),

    // Legacy label forms accept both mashed and spaced variants.
    //   :LABELName;
    //   :LABEL Name;
    //   :LABEL Name Alias;
    label_statement: $ => seq(
      $.kw_label,
      field('name', $.identifier),
      repeat(field('name_extra', $.identifier)),
      ';'
    ),

    // :REGION is a legacy functional body-capture construct.
    // :REGION stores a named raw-text body for later retrieval via GetRegion().
    // It is not intended for code organization — use /* region comments for IDE
    // folding. This grammar captures the region body as raw text for editor support.
    region_block: $ => seq(
      $.kw_region, field('name', $.identifier), ';',
      optional(field('body', $.region_body)),
      $.kw_endregion, ';'
    ),

    // Raw text content between :REGION and :ENDREGION — captures arbitrary
    // text as a single token. Uses low precedence so :ENDREGION is still
    // recognized when encountered.
    region_body: _ => token(prec(-1, /[\s\S]+/)),

    // :BEGININLINECODE is a legacy named code-storage construct.
    // It stores a named SSL body for later retrieval via GetInlineCode() /
    // DeleteInlineCode(). This grammar models a structured block for practical
    // editing support.
    inline_code_block: $ => seq(
      $.kw_begininlinecode,
      field('name', choice($.identifier, $.quoted_identifier)), ';',
      optional(field('body', choice($._script_compilation_unit, $.class_declaration))),
      $.kw_endinlinecode, ';'
    ),

    // :ERROR; ... (legacy error handler — applies to all subsequent code in scope)
    error_block: $ => makeErrorBlock($, $._statement),
    error_block_loop: $ => makeErrorBlock($, $._loop_statement),
    error_block_finally: $ => makeErrorBlock($, $._finally_statement),
    error_block_constructor: $ => makeErrorBlock($, $._constructor_statement),
    error_block_constructor_loop: $ => makeErrorBlock($, $._constructor_loop_statement),

    // :RESUME; (legacy — switches to resume mode: wraps each subsequent statement
    // in its own individual try/catch for fault-tolerant execution)
    resume_statement: $ => seq($.kw_resume, ';'),

    // :DECLARE a, b, c;
    // NOTE: :PARAMETERS/:DEFAULT are restricted to file-top or procedure-top
    // positions, and :INCLUDE behaves like a top-level include directive. This
    // grammar keeps :PARAMETERS/:DEFAULT out of generic statement positions to
    // bias authors toward accepted forms.
    declaration_statement: $ => choice(
      $.declaration_statement_declare,
      $.declaration_statement_parameters,
      $.declaration_statement_default,
      $.declaration_statement_public,
      $.declaration_statement_include
    ),

    declaration_statement_declare: $ => seq($.kw_declare, commaSep1($, field('local', $.identifier)), ';'),
    declaration_statement_parameters: $ => seq($.kw_parameters, commaSep1($, field('parameter', $.identifier)), ';'),
    declaration_statement_default: $ => seq($.kw_default, field('default_var', $.identifier), ',', $.expression, ';'),
    declaration_statement_public: $ => seq($.kw_public, commaSep1($, field('public', $.identifier)), ';'),
    declaration_statement_include: $ => seq($.kw_include, field('path', $.identifier), ';'),

    parameter_section: $ => seq(
      $.declaration_statement_parameters,
      repeat($.declaration_statement_default)
    ),

    // :PROCEDURE Name; (:PARAMETERS ...; (:DEFAULT ...;)*)? body :ENDPROC;
    procedure_declaration: $ => seq(
      $.kw_procedure, field('name', $.identifier), ';',
      optional($.parameter_section),
      repeat($._statement_no_default),
      $.kw_endproc, ';'
    ),

    // :CLASS [Name]; (:INHERIT BaseName | Category.ScriptName;)? { :DECLARE fields, methods, Constructor }
    // Class names are optional in the parser, but explicit names remain the
    // preferred maintained form. The top-level grammar remains either
    // script_file or class_file, matching the language's top-level split.
    // Successful class code requires the ordering
    // :INHERIT → :DECLARE → methods → Constructor.
    class_declaration: $ => seq(
      $.kw_class, optional(field('name', $.identifier)), ';',
      optional(seq($.kw_inherit, field('base', choice($.identifier, $.qualified_identifier)), ';')),
      repeat($.class_field_declaration),
      repeat($.class_method_declaration),
      optional($.class_constructor_declaration)
    ),

    class_field_declaration: $ => seq($.kw_declare, commaSep1($, field('field', $.identifier)), ';'),

    class_method_declaration: $ => seq(
      $.kw_procedure, field('name', $.non_constructor_identifier), ';',
      optional($.parameter_section),
      repeat($._statement_no_default),
      $.kw_endproc, ';'
    ),

    class_constructor_declaration: $ => seq(
      $.kw_procedure, field('name', $.constructor_name), ';',
      optional($.parameter_section),
      repeat($._constructor_statement),
      $.kw_endproc, ';'
    ),

    // :IF expr; ... (:ELSE; ...)? :ENDIF;
    if_block: $ => makeIfBlock($, $._statement),
    if_block_loop: $ => makeIfBlock($, $._loop_statement),
    if_block_finally: $ => makeIfBlock($, $._finally_statement),
    if_block_constructor: $ => makeIfBlock($, $._constructor_statement),
    if_block_constructor_loop: $ => makeIfBlock($, $._constructor_loop_statement),

    // :WHILE expr; ... :ENDWHILE;
    while_block: $ => makeWhileBlock($, $._loop_statement),
    while_block_finally: $ => makeWhileBlock($, $._finally_statement),
    while_block_constructor: $ => makeWhileBlock($, $._constructor_loop_statement),

    // :FOR i := 1 :TO 10 [:STEP 1]; ... :NEXT;
    for_block: $ => makeForBlock($, $._loop_statement),
    for_block_finally: $ => makeForBlock($, $._finally_statement),
    for_block_constructor: $ => makeForBlock($, $._constructor_loop_statement),

    // :BEGINCASE; (:CASE expr; ... :EXITCASE;)+ (:OTHERWISE; ...)? :ENDCASE;
    // :BEGINCASE is not a value-matching switch. Each :CASE evaluates its own
    // boolean expression.
    // Without :EXITCASE, later :CASE expressions are still evaluated and
    // additional matching bodies may execute.
    // :OTHERWISE stays skipped once any earlier :CASE body has run.
    switch_block: $ => makeSwitchBlock($, $._statement),
    switch_block_loop: $ => makeSwitchBlock($, $._loop_statement),
    switch_block_finally: $ => makeSwitchBlock($, $._finally_statement),
    switch_block_constructor: $ => makeSwitchBlock($, $._constructor_statement),
    switch_block_constructor_loop: $ => makeSwitchBlock($, $._constructor_loop_statement),

    // :TRY; ... [:CATCH; ...] [:FINALLY; ...] :ENDTRY;
    // :CATCH and :FINALLY are optional individually, but at least one is required.
    // The TRY body must contain at least one statement.
    // If :FINALLY is present, it must contain at least one statement.
    // :FINALLY restrictions: :RETURN, :EXITWHILE, :EXITFOR, and :LOOP are
    // compile-time errors inside a :FINALLY block.
    // Valid forms:
    //   TRY...CATCH...ENDTRY
    //   TRY...FINALLY...ENDTRY
    //   TRY...CATCH...FINALLY...ENDTRY
    try_catch_block: $ => makeTryCatchBlock($, $._statement, $._finally_statement),
    try_catch_block_loop: $ => makeTryCatchBlock($, $._loop_statement, $._finally_statement),
    try_catch_block_finally: $ => makeTryCatchBlock($, $._finally_statement, $._finally_statement),
    try_catch_block_constructor: $ => makeTryCatchBlock($, $._constructor_statement, $._finally_statement),
    try_catch_block_constructor_loop: $ => makeTryCatchBlock($, $._constructor_loop_statement, $._finally_statement),

    // Loop control statements
    loop_control_statement: $ => choice(
      $.exit_for_statement,
      $.exit_while_statement,
      $.loop_continue_statement
    ),

    exit_for_statement: $ => seq($.kw_exitfor, ';'),
    exit_while_statement: $ => seq($.kw_exitwhile, ';'),
    loop_continue_statement: $ => seq($.kw_loop, ';'),

    // ───── Keywords (UPPERCASE by style) ─────
    kw_if: _ => token(seq(':', 'IF')),
    kw_else: _ => token(seq(':', 'ELSE')),
    kw_endif: _ => token(seq(':', 'ENDIF')),

    kw_while: _ => token(seq(':', 'WHILE')),
    kw_endwhile: _ => token(seq(':', 'ENDWHILE')),

    kw_for: _ => token(seq(':', 'FOR')),
    kw_next: _ => token(seq(':', 'NEXT')),
    kw_to: _ => token(seq(':', 'TO')),
    kw_step: _ => token(seq(':', 'STEP')),

    kw_begincase: _ => token(seq(':', 'BEGINCASE')),
    kw_case: _ => token(seq(':', 'CASE')),
    kw_otherwise: _ => token(seq(':', 'OTHERWISE')),
    kw_endcase: _ => token(seq(':', 'ENDCASE')),
    kw_exitcase: _ => token(seq(':', 'EXITCASE')),

    kw_try: _ => token(seq(':', 'TRY')),
    kw_catch: _ => token(seq(':', 'CATCH')),
    kw_finally: _ => token(seq(':', 'FINALLY')),
    kw_endtry: _ => token(seq(':', 'ENDTRY')),

    kw_declare: _ => token(seq(':', 'DECLARE')),
    kw_default: _ => token(seq(':', 'DEFAULT')),
    kw_parameters: _ => token(seq(':', 'PARAMETERS')),
    kw_public: _ => token(seq(':', 'PUBLIC')),
    kw_include: _ => token(seq(':', 'INCLUDE')),

    kw_procedure: _ => token(seq(':', 'PROCEDURE')),
    kw_endproc: _ => token(seq(':', 'ENDPROC')),
    kw_return: _ => token(seq(':', 'RETURN')),

    kw_class: _ => token(seq(':', 'CLASS')),
    kw_inherit: _ => token(seq(':', 'INHERIT')),

    kw_region: _ => token(seq(':', 'REGION')),
    kw_endregion: _ => token(seq(':', 'ENDREGION')),

    kw_error: _ => token(seq(':', 'ERROR')),
    kw_label: _ => token(seq(':', 'LABEL')),
    kw_begininlinecode: _ => token(seq(':', 'BEGININLINECODE')),
    kw_endinlinecode: _ => token(seq(':', 'ENDINLINECODE')),

    // Additional loop control keywords
    kw_exitfor: _ => token(seq(':', 'EXITFOR')),
    kw_exitwhile: _ => token(seq(':', 'EXITWHILE')),
    kw_loop: _ => token(seq(':', 'LOOP')),
    kw_resume: _ => token(seq(':', 'RESUME')),

  }
});

// Utility: comma-separated lists
function commaSep($, rule) {
  return optional(seq(rule, repeat(seq(',', rule))));
}
function commaSep1($, rule) {
  return seq(rule, repeat(seq(',', rule)));
}
