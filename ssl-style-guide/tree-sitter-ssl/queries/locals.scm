; Local variable captures for SSL
; This file defines patterns for identifying local variables and scope

; ───── Scope definitions ─────

; Source file is the top-level scope
(source_file) @local.scope

; Procedures create local scopes
(procedure_declaration) @local.scope
(class_method_declaration) @local.scope
(class_constructor_declaration) @local.scope

; Classes create their own scope
(class_declaration) @local.scope

; Code blocks (lambdas) create their own scope
(code_block) @local.scope

; ───── Definitions ─────

; Procedure parameters/defaults
(procedure_declaration
  (parameter_section
    (declaration_statement_parameters parameter: (identifier) @local.definition)))
(procedure_declaration
  (parameter_section
    (declaration_statement_default default_var: (identifier) @local.definition)))
(class_method_declaration
  (parameter_section
    (declaration_statement_parameters parameter: (identifier) @local.definition)))
(class_method_declaration
  (parameter_section
    (declaration_statement_default default_var: (identifier) @local.definition)))
(class_constructor_declaration
  (parameter_section
    (declaration_statement_parameters parameter: (identifier) @local.definition)))
(class_constructor_declaration
  (parameter_section
    (declaration_statement_default default_var: (identifier) @local.definition)))

; Local variables in DECLARE statements
(declaration_statement_declare local: (identifier) @local.definition)

; Script-level parameters and defaults
(declaration_statement_parameters parameter: (identifier) @local.definition)
(declaration_statement_default default_var: (identifier) @local.definition)

; FOR loop variable — this is a definition (creates/assigns the variable)
(for_block loop_var: (identifier) @local.definition)
(for_block_finally loop_var: (identifier) @local.definition)
(for_block_constructor loop_var: (identifier) @local.definition)

; Code block parameters
(code_block parameter: (identifier) @local.definition)

; ───── References ─────
; Restricted to positions where identifiers represent actual variable
; reads/writes. This avoids false matches on function names in
; call_expression, member/method names in property_access/method_call,
; procedure/class names in declarations, and label names.

; Assignment targets (left side of :=, +=, etc.)
(assignment . (identifier) @local.reference)

; Object receivers (variable before : in member access / method calls).
; The receiver may also be Me/Base, chained access, calls, or indexed values,
; so only bare identifier receivers are treated as local references here.
(property_access . (identifier) @local.reference)
(method_call receiver: (identifier) @local.reference)

; Standalone identifiers in primary_expression (variable reads).
; Matches a bare identifier as the only child of primary_expression,
; i.e., a variable used as a value. Does NOT match function names inside
; call_expression or member names inside property_access/method_call —
; those produce different subtrees under primary_expression.
(primary_expression . (identifier) @local.reference .)

; Array access: arr[i] — arr is a variable reference (identifier is the
; first child of indexed_expression, via the hidden _indexable_expression rule)
(indexed_expression . (identifier) @local.reference)

; Increment/decrement: i++, ++i, i--, --i — the identifier is a reference
(increment_expression . (identifier) @local.reference)
(increment_expression (identifier) @local.reference .)
