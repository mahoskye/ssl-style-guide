; SQL injection captures for SSL
; This file defines patterns for injecting SQL within strings

; NOTE: The call_expression query (lines 14-17) traverses the full expression
; precedence chain: or_expression → and_expression → equality_expression →
; relational_expression → shift_expression → arithmetic_expression → term →
; power → unary → primary_expression.
; If the grammar's expression structure changes, this path must be updated.

; Inject SQL into strings that start with SQL keywords
((string) @injection.content
  (#match? @injection.content "(?i)^[\"'\\[\\s]*(select|insert|update|delete|with|create|alter|drop|exec|execute|merge|truncate|grant|revoke|declare|set|begin|if|while|use)\\b")
  (#set! injection.language "sql"))

((bracket_string) @injection.content
  (#match? @injection.content "(?i)^\\[[[:space:]]*(select|insert|update|delete|with|create|alter|drop|exec|execute|merge|truncate|grant|revoke|declare|set|begin|if|while|use)\\b")
  (#set! injection.language "sql"))

; Context-aware SQL injection: SQL strings used in known database call sites
((call_expression
  function: (identifier) @_fn
  arguments: (arguments (expression (or_expression (and_expression (equality_expression (relational_expression (shift_expression (arithmetic_expression (term (power (unary (primary_expression (string) @injection.content)))))))))))))
  (#match? @_fn "(?i)^(SQLExecute|RunSQL|LSearch|LSelect|LSelect1|LSelectC|GetDataSet|GetDataSetEx|GetDataSetXMLFromSelect|GetDataSetWithSchemaFromSelect|GetNETDataSet|XmlExportSql|GetTables)$")
  (#set! injection.language "sql"))
