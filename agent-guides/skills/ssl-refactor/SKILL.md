---
name: ssl-refactor
description: Refactor SSL code following the SSL refactoring guide. Use when asked to refactor, modernize, or clean up SSL code.
argument-hint: "<file-path> [goal]"
allowed-tools: Read, Write, Edit, Grep, Glob
---

Refactor the SSL file at `$ARGUMENTS` (first token is the file path, optional remaining text is the refactoring goal).

## Instructions

1. **Parse arguments:** Extract `<file-path>` as `$0` and optional `[goal]` as the remaining text (e.g., "modernize error handling", "fix naming", "all").
   - If no file path is given, ask the user before continuing.

2. **Use these core SSL rules throughout the refactor:**
   - Colon-prefixed keywords must be UPPERCASE: `:IF`, `:TRY`, `:PROCEDURE`, etc.
   - Almost every statement, including comments, must end with `;`
   - Never place `;` inside comment body text; it ends the comment early
   - `:PARAMETERS` must come immediately after `:PROCEDURE`
   - `:DEFAULT` must come immediately after `:PARAMETERS`
   - `:DECLARE` must appear before body statements
   - Use one statement per line
   - Prefer tabs for indentation; if the file already uses spaces, preserve 4-space indentation
   - Use `Me:Method()` / `Base:Method()` inside classes; `DoProc` is invalid inside class methods
   - Use `DoProc("ProcName", {args})` for same-file script procedures
   - Use `ExecFunction("Category.Script", {args})` or
     `ExecFunction("Category.Script.Proc", {args})` for external entry points
   - `:TRY` requires at least one `:CATCH` or `:FINALLY`
   - End each `:CASE` / `:OTHERWISE` block with `:EXITCASE;` unless multi-match behavior is intentional
   - Use `==` for exact string equality; `=` is prefix matching for strings
   - Inside SQL strings, use uppercase SQL keywords and functions; keep other SQL
     identifiers lowercase unless external schema/object casing must be preserved

3. **Apply the 6-step workflow:**

---

## Workflow

### Step 1 — STUDY
- Read the entire target file
- Identify all procedures and their relationships
- Note external calls (`ExecFunction`) and internal calls (`DoProc`)
- Understand what the code does before changing anything

### Step 2 — PLAN
- Document what changes you will make (list them explicitly)
- If a `[goal]` was provided, focus on that area while maintaining overall correctness
- Flag any risky changes (changes to external interface, behavioral changes) for user review

### Step 3 — REFACTOR
Apply changes in this priority order (or focus on `[goal]` if specified):

**Naming:**
- Apply Hungarian notation: `s` string, `n` numeric, `b` boolean, `d` date,
  `a` array, `o` object, `fn` code block, `v` variant/any
- Rename procedures to PascalCase
- Rename variables to camelCase with correct prefix

**Structure:**
- Move `:PARAMETERS` immediately after `:PROCEDURE`
- Move `:DEFAULT` immediately after `:PARAMETERS`
- Move `:DECLARE` before body statements
- Ensure procedure ordering is logical

**Error Handling:**
- Replace `:ERROR` / `:RESUME` with `:TRY` / `:CATCH` / `:ENDTRY`
- Wrap external calls in `:TRY` blocks where appropriate

**SQL Safety:**
- Replace string concatenation in SQL with proper parameterization
- `SQLExecute`: use `?varName?` substitution
- Other DB functions: use positional `?` with parameter arrays
- Inside SQL strings, uppercase SQL keywords and functions; keep other SQL
  identifiers lowercase unless external schema/object casing must be preserved

**Control Flow:**
- Add `:EXITCASE;` at end of `:CASE` and `:OTHERWISE` blocks (unless multi-match behavior is intentional)
- Replace bare procedure calls with `DoProc("ProcName", {args})`
- Inside class methods, replace any `DoProc` with `Me:Method()`

**Comments:**
- Fix comments that contain `;` in the comment body text (move semicolon to end only)
- Ensure all statements (including comments) end with `;`

### Step 4 — FORMAT
- Verify all statements end with `;`
- Preserve the file's indentation style: prefer tabs, or preserve existing
  4-space indentation
- No spaces around `:` in member access
- Uppercase all colon-prefixed keywords

### Step 5 — VALIDATE
- Confirm all procedures are complete — no stubs or `// TODO` placeholders
- Verify `:TRY` blocks each have at least one `:CATCH` or `:FINALLY`
- Verify `:BEGINCASE` blocks have at least one `:CASE`
- Verify behavior is preserved (same external interface, same logic)

### Step 6 — DOCUMENT
- Summarize changes made at the end of your response
- Note any behaviors that were preserved intentionally
- Flag any areas where you were unsure and explain the decision made

---

## Output

Produce the complete refactored file — no stubs, no partial implementations. Write the file using the Write or Edit tool.

If the file is large or the changes are extensive, edit procedure by procedure and confirm with the user before writing if behavior-changing modifications are required.

After writing, provide a concise change summary:
```
Refactoring complete. Changes made:
- [list of changes]
Preserved:
- [list of intentionally unchanged behaviors]
```
