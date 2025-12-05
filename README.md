# STARLIMS SSL Style Guide

A comprehensive, tool-agnostic style guide and tooling ecosystem for **STARLIMS Scripting Language (SSL) v11**. 

This project serves as the central source of truth for SSL coding conventions, providing machine-readable definitions for linters, formatters, and IDE intelligence tools.

## Project Overview

This repository consolidates the syntax rules, grammar definitions, and best practices for modern SSL development.

### Core Components

- **Style Guide Schema** (`ssl-style-guide/ssl-style-guide.schema.yaml`)
  The definitive configuration file defining formatting rules, naming conventions, and linter settings. It is designed to be consumed by tooling to enforce consistency across projects.

- **Tree-sitter Grammar** (`ssl-style-guide/tree-sitter-ssl/`)
  A complete, high-performance parser for SSL. It supports the full language specification including:
  - Object-Oriented constructs (`:CLASS`, `:INHERIT`).
  - Structured error handling (`:TRY`, `:CATCH`, `:FINALLY`).
  - Database parameterization and SQL injection detection.
  - Complex literals (Arrays, Dates, Code Blocks).

- **TextMate Grammar** (`ssl-style-guide/ssl.tmLanguage.updated.json`)
  Updated syntax highlighting rules compatible with VS Code and other TextMate-based editors.

## Coding Conventions

The style guide enforces a strict set of rules to ensure readability and maintainability.

### Naming Conventions
| Type | Case | Prefix | Example |
|------|------|--------|---------|
| **Procedures** | PascalCase | None | `:PROCEDURE CalculateTotal;` |
| **Classes** | PascalCase | None | `:CLASS InvoiceManager;` |
| **Variables** | camelCase | Hungarian | `sUserName`, `nQuantity`, `bIsValid` |
| **Constants** | UPPER_SNAKE_CASE | None | `MAX_RETRY_COUNT` |
| **Objects (UDO)** | camelCase | `o` | `oXmlElement` |

### Formatting Rules
- **Indentation**: Tabs (Size: 1).
- **Keywords**: Colon-prefixed and UPPERCASE (e.g., `:IF`, `:ENDIF`, `:RETURN`).
- **Spacing**: 
  - Spaces around operators (`nVal := 1 + 2;`).
  - No spaces inside parentheses or brackets.
- **Structure**:
  - One statement per line.
  - Block keywords must be explicitly closed (e.g., `:ENDWHILE`, `:ENDPROC`).
  - Procedures must include header comments explaining purpose and parameters.

### Best Practices
- **Database Security**: Always use parameterized queries.
      - Use placeholders with named parameters for `SQLExecute`:
        ```ssl
        SQLExecute("SELECT * FROM Users WHERE ID = ?nUserId?");
        ```
      - For other database functions, use placeholders and an array of parameters:
        ```ssl
        RunSql("SELECT * FROM Users WHERE ID = ?", {nUserId});
        ```
      - Direct concatenation for parameter values in `SQLExecute` is also allowed but discouraged due to potential SQL injection risks if input is not properly sanitized:
        ```ssl
        SQLExecute("SELECT * FROM Users WHERE ID = " + nUserId);
        ```
- **Error Handling**: Prefer structured `:TRY...:CATCH` blocks over legacy `:ERROR` markers.
- **String Concatenation**: Explicit usage of `+` operator.

## Grammar & Parsing

The included **Tree-sitter grammar** provides a robust foundation for static analysis. It has been validated against the SSL v11 EBNF specification and real-world codebases.

### Capabilities
- **Scope Analysis**: Correctly identifies local variables, parameters, and loop counters (`queries/locals.scm`).
- **SQL Injection**: Detects and highlights SQL queries embedded within SSL strings (`queries/injections.scm`).
- **Syntax Highlighting**: Rich tagging for keywords, operators, built-in functions, and types (`queries/highlights.scm`).

## Usage

### For Tool Developers
Consume the `ssl-style-guide.schema.yaml` to configure your linter or formatter. The schema provides granular rules for:
- `formatting`: Indent styles, spacing, wrapping.
- `naming`: Casing regexes and prefixes.
- `lints`: Disallowed patterns (e.g., global variables, nested ternaries).

### For Contributors
To work on the Tree-sitter grammar:
```bash
cd ssl-style-guide/tree-sitter-ssl
npm install
npm run gen    # Generate the parser
npm test       # Run tests
```

## Metadata

# STARLIMS SSL Style Guide

A comprehensive, tool-agnostic style guide and tooling ecosystem for **STARLIMS Scripting Language (SSL) v11**. 

This project serves as the central source of truth for SSL coding conventions, providing machine-readable definitions for linters, formatters, and IDE intelligence tools.

## Project Overview

This repository consolidates the syntax rules, grammar definitions, and best practices for modern SSL development.

### Core Components

- **Style Guide Schema** (`ssl-style-guide/ssl-style-guide.schema.yaml`)
  The definitive configuration file defining formatting rules, naming conventions, and linter settings. It is designed to be consumed by tooling to enforce consistency across projects.

- **Tree-sitter Grammar** (`ssl-style-guide/tree-sitter-ssl/`)
  A complete, high-performance parser for SSL. It supports the full language specification including:
  - Object-Oriented constructs (`:CLASS`, `:INHERIT`).
  - Structured error handling (`:TRY`, `:CATCH`, `:FINALLY`).
  - Database parameterization and SQL injection detection.
  - Complex literals (Arrays, Dates, Code Blocks).

- **TextMate Grammar** (`ssl-style-guide/ssl.tmLanguage.updated.json`)
  Updated syntax highlighting rules compatible with VS Code and other TextMate-based editors.

## Coding Conventions

The style guide enforces a strict set of rules to ensure readability and maintainability.

### Naming Conventions
| Type | Case | Prefix | Example |
|------|------|--------|---------|
| **Procedures** | PascalCase | None | `:PROCEDURE CalculateTotal;` |
| **Classes** | PascalCase | None | `:CLASS InvoiceManager;` |
| **Variables** | camelCase | Hungarian | `sUserName`, `nQuantity`, `bIsValid` |
| **Constants** | UPPER_SNAKE_CASE | None | `MAX_RETRY_COUNT` |
| **Objects (UDO)** | camelCase | `o` | `oXmlElement` |

### Formatting Rules
- **Indentation**: Tabs (Size: 1).
- **Keywords**: Colon-prefixed and UPPERCASE (e.g., `:IF`, `:ENDIF`, `:RETURN`).
- **Spacing**: 
  - Spaces around operators (`nVal := 1 + 2;`).
  - No spaces inside parentheses or brackets.
- **Structure**:
  - One statement per line.
  - Block keywords must be explicitly closed (e.g., `:ENDWHILE`, `:ENDPROC`).
  - Procedures must include header comments explaining purpose and parameters.

### Best Practices
- **Database Security**: Always use parameterized queries.
      - Use placeholders with named parameters for `SQLExecute`:
        ```ssl
        SQLExecute("SELECT * FROM Users WHERE ID = ?nUserId?");
        ```
      - For other database functions, use placeholders and an array of parameters:
        ```ssl
        RunSql("SELECT * FROM Users WHERE ID = ?", {nUserId});
        ```
      - Direct concatenation for parameter values in `SQLExecute` is also allowed but discouraged due to potential SQL injection risks if input is not properly sanitized:
        ```ssl
        SQLExecute("SELECT * FROM Users WHERE ID = " + nUserId);
        ```
- **Error Handling**: Prefer structured `:TRY...:CATCH` blocks over legacy `:ERROR` markers.
- **String Concatenation**: Explicit usage of `+` operator.

## Grammar & Parsing

The included **Tree-sitter grammar** provides a robust foundation for static analysis. It has been validated against the SSL v11 EBNF specification and real-world codebases.

### Capabilities
- **Scope Analysis**: Correctly identifies local variables, parameters, and loop counters (`queries/locals.scm`).
- **SQL Injection**: Detects and highlights SQL queries embedded within SSL strings (`queries/injections.scm`).
- **Syntax Highlighting**: Rich tagging for keywords, operators, built-in functions, and types (`queries/highlights.scm`).

## Usage

### For Tool Developers
Consume the `ssl-style-guide.schema.yaml` to configure your linter or formatter. The schema provides granular rules for:
- `formatting`: Indent styles, spacing, wrapping.
- `naming`: Casing regexes and prefixes.
- `lints`: Disallowed patterns (e.g., global variables, nested ternaries).

### For Contributors
To work on the Tree-sitter grammar:
```bash
cd ssl-style-guide/tree-sitter-ssl
npm install
npm run gen    # Generate the parser
npm test       # Run tests
```

## Metadata

- **Version**: 1.0.0
- **SSL Version**: v11
- **Maintainers**: PaperBull / Benjamin Buddle
- **License**: MIT (See LICENSE file)

---

## Disclaimer
This project is an independent research effort and is not affiliated with, endorsed by, or sponsored by Abbott Laboratories or its STARLIMS product. All product names, logos, and brands are property of their respective owners.
