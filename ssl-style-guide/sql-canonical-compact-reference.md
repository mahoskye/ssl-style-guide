# Oracle SQL Canonical Compact Formatting Reference

This document defines the **canonical compact** formatting style for Oracle SQL
embedded in SSL code. It is a repository formatting convention optimized for
readability within SSL string literals.

> **Scope:** This reference covers SQL strings embedded in SSL server scripts
> (via `SQLExecute`, `RunSQL`, `GetDataSet`, etc.). SQL data source files have
> their own structure with builder directives (`:DSN`, `:TABLENAME`, etc.) and
> preprocessed parameter syntax — see `ssl_agent_instructions.md` §4A for that
> context. The SQL formatting rules here still apply to the query body within
> SQL data source files.

---

## 1. Style Rules Summary

### Core Rules

| Rule | Detail |
|------|--------|
| Major clauses | Start at column 0 (relative to SQL block indent) |
| SELECT columns | Pack onto lines up to ~90 chars; break complex expressions to own line |
| SELECT continuations | Aligned to first column (col 7) |
| Continuation lines | Aligned under the first token of their parent clause |
| AND/OR | Indented 2 spaces under their parent clause |
| ON | Indented 2 spaces under JOIN |
| HAVING | Indented 2 spaces under GROUP BY (deliberate: HAVING is a sub-clause of GROUP BY here, unlike styles that put it at column 0) |
| WHEN/ELSE | Indented 4 spaces under CASE |
| Keyword casing | UPPERCASE — all SQL keywords and built-in functions |
| Identifier casing | lowercase — table names, column names, aliases |
| External casing | Preserve when schema/object requires it |
| Comma style | Trailing commas |
| Max line length | ~90 characters, breaking at logical points; a single atomic token (string literal, identifier) that cannot fit leaves its line over-long — tokens are never split |
| Subqueries | Flat convention in every context (WHERE, FROM, SELECT list, SET): the `(` opens on the parent line, the body indents one level (4 spaces), and the closing `)` returns to the parent clause's column |
| SSL embedding | Entire SQL block indented 4 spaces inside the string literal |

### Indentation Reference

```
SELECT col1, col2,        ← major clause, col 0
       col3, col4         ← continuation, aligned to first column (col 7)
FROM table1               ← major clause, col 0
INNER JOIN table2         ← major clause, col 0
  ON table2.id = table1.id  ← ON indented 2 under JOIN
  AND table2.col = table1.col ← AND in ON: same indent as ON
WHERE condition1          ← major clause, col 0
  AND condition2          ← AND/OR indented 2 under parent
GROUP BY col1             ← major clause, col 0
  HAVING COUNT(*) > 1     ← HAVING indented 2 under GROUP BY
ORDER BY col1             ← major clause, col 0
```

### SSL Embedding Convention

SQL embedded in SSL strings is indented 4 spaces from the string opening:

```ssl
aResults := SQLExecute("
    SELECT col1, col2
    FROM table1
    WHERE col1 = ?sValue?
");
```

The 4-space indent is relative to the start of the string literal line. All SQL indentation rules then apply relative to that base indent.

The SSL *string boundary* — when a string is handed to the SQL engine,
where the opening and closing quotes sit, and how the surrounding SSL
statement lays out (rules A–F) — is specified by the starlims-lsp catalog
entry `catalog/formatting/sql_in_strings.md`, which in turn delegates the
SQL layout itself to this document. This document owns everything inside
the quotes; that entry owns the quotes.

---

## 2. DML Statements

### 2.1 SELECT — Basic

```sql
SELECT ordno, testcode, status, result
FROM ordtask
WHERE status = 'Logged'
ORDER BY ordno
```

With short aliases and expressions — pack on one line when they fit:

```sql
SELECT o.ordno, o.testcode, o.status AS task_status,
       UPPER(o.result) AS result_upper
FROM ordtask o
WHERE o.status = 'Logged'
```

Break complex expressions to their own line for clarity:

```sql
SELECT o.ordno, o.testcode,
       CASE
           WHEN o.status = 'L' THEN 'Logged'
           WHEN o.status = 'C' THEN 'Complete'
           ELSE 'Unknown'
       END AS status_desc,
       UPPER(o.result) AS result_upper
FROM ordtask o
WHERE o.status = 'Logged'
```

**SELECT list packing rule:** Pack columns onto lines up to the ~90 char limit.
Short aliases (`col AS alias`) and simple function calls (`UPPER(col)`,
`COUNT(*)`) can share a line. Break to a new line when a column has a complex
expression (CASE, nested functions, subquery) or when giving it its own line
aids readability.

With DISTINCT:

```sql
SELECT DISTINCT testcode, method
FROM ordtask
WHERE status = 'Complete'
```

### 2.2 SELECT with JOINs

**INNER JOIN:**

```sql
SELECT o.ordno, t.testcode, t.description
FROM orders o
INNER JOIN ordtask t
  ON t.ordno = o.ordno
WHERE o.status = 'Logged'
```

**LEFT OUTER JOIN:**

```sql
SELECT o.ordno, t.testcode, r.result_value
FROM orders o
LEFT OUTER JOIN ordtask t
  ON t.ordno = o.ordno
LEFT OUTER JOIN ordresult r
  ON r.ordno = t.ordno
  AND r.testcode = t.testcode
WHERE o.status = 'Logged'
```

**Multi-table with mixed join types:**

```sql
SELECT o.ordno, t.testcode, s.spec_value,
       r.result_value
FROM orders o
INNER JOIN ordtask t
  ON t.ordno = o.ordno
LEFT OUTER JOIN ordresult r
  ON r.ordno = t.ordno
  AND r.testcode = t.testcode
INNER JOIN specifications s
  ON s.testcode = t.testcode
WHERE o.status = 'Logged'
  AND t.testcode = 'pH'
```

**CROSS JOIN:**

```sql
SELECT a.label, b.category
FROM labels a
CROSS JOIN categories b
```

**Self-join:**

```sql
SELECT child.ordno, child.parent_ordno,
       parent.status AS parent_status
FROM orders child
INNER JOIN orders parent
  ON parent.ordno = child.parent_ordno
WHERE child.status = 'Pending'
```

### 2.3 SELECT with Filtering

**BETWEEN:**

```sql
SELECT ordno, logdate
FROM orders
WHERE logdate BETWEEN TO_DATE('2025-01-01', 'YYYY-MM-DD')
                  AND TO_DATE('2025-12-31', 'YYYY-MM-DD')
```

**IN (list):**

```sql
SELECT ordno, status
FROM orders
WHERE status IN ('Logged', 'Pending', 'Active')
```

**IN (subquery):**

```sql
SELECT ordno, status
FROM orders
WHERE ordno IN (
    SELECT ordno
    FROM ordtask
    WHERE testcode = 'pH'
)
```

**LIKE:**

```sql
SELECT ordno, description
FROM orders
WHERE description LIKE 'QC%'
  AND ordno LIKE '2025%'
```

**IS NULL / IS NOT NULL:**

```sql
SELECT ordno, result_value
FROM ordresult
WHERE result_value IS NOT NULL
  AND comment IS NULL
```

**Compound conditions:**

```sql
SELECT ordno, testcode, status
FROM ordtask
WHERE (status = 'Logged' OR status = 'Pending')
  AND testcode IN ('pH', 'Conductivity')
  AND ordno LIKE '2025%'
```

**CASE in WHERE:**

```sql
SELECT ordno, testcode, result_value
FROM ordresult r
INNER JOIN specifications s
  ON s.testcode = r.testcode
WHERE CASE
          WHEN r.result_value IS NULL THEN 'Missing'
          WHEN r.result_value < s.low_limit THEN 'Below'
          WHEN r.result_value > s.high_limit THEN 'Above'
          ELSE 'Pass'
      END != 'Pass'
```

### 2.4 SELECT with Aggregation

```sql
SELECT testcode, COUNT(*) AS task_count,
       AVG(result_value) AS avg_result,
       MIN(result_value) AS min_result,
       MAX(result_value) AS max_result
FROM ordresult
WHERE status = 'Complete'
GROUP BY testcode
  HAVING COUNT(*) > 5
ORDER BY task_count DESC
```

### 2.5 SELECT with Ordering

```sql
SELECT ordno, testcode, logdate
FROM ordtask
ORDER BY logdate DESC NULLS LAST,
         testcode ASC NULLS FIRST,
         ordno
```

### 2.6 Subqueries

**Scalar subquery (in SELECT list)** — the flat convention applies here
too: the `(` opens inline in the projection, the body indents one level,
and `) AS alias` returns to the clause column:

```sql
SELECT o.ordno, (
    SELECT COUNT(*)
    FROM ordtask t
    WHERE t.ordno = o.ordno
) AS task_count
FROM orders o
WHERE o.status = 'Logged'
```

**Subquery in WHERE (EXISTS):**

```sql
SELECT o.ordno, o.status
FROM orders o
WHERE EXISTS (
    SELECT 1
    FROM ordtask t
    WHERE t.ordno = o.ordno
      AND t.status = 'Failed'
)
```

**Subquery in WHERE (comparison):**

```sql
SELECT ordno, result_value
FROM ordresult
WHERE result_value > (
    SELECT AVG(result_value)
    FROM ordresult
    WHERE testcode = 'pH'
)
```

**Inline view (in FROM):**

```sql
SELECT t.testcode, t.task_count
FROM (
    SELECT testcode, COUNT(*) AS task_count
    FROM ordtask
    WHERE status = 'Complete'
    GROUP BY testcode
) t
WHERE t.task_count > 10
ORDER BY t.task_count DESC
```

**Correlated subquery:**

```sql
SELECT o.ordno, o.logdate
FROM orders o
WHERE o.logdate = (
    SELECT MAX(o2.logdate)
    FROM orders o2
    WHERE o2.customer_id = o.customer_id
)
```

### 2.7 Common Table Expressions (CTEs)

**Single CTE:**

```sql
WITH task_counts AS (
    SELECT ordno, COUNT(*) AS cnt
    FROM ordtask
    WHERE status = 'Complete'
    GROUP BY ordno
)
SELECT o.ordno, o.status, tc.cnt
FROM orders o
INNER JOIN task_counts tc
  ON tc.ordno = o.ordno
WHERE tc.cnt > 5
ORDER BY tc.cnt DESC
```

**Chained CTEs:**

```sql
WITH active_orders AS (
    SELECT ordno, customer_id
    FROM orders
    WHERE status = 'Active'
),
order_tasks AS (
    SELECT ao.ordno, ao.customer_id,
           t.testcode, t.status
    FROM active_orders ao
    INNER JOIN ordtask t
      ON t.ordno = ao.ordno
),
task_summary AS (
    SELECT customer_id,
           COUNT(*) AS total_tasks,
           SUM(CASE WHEN status = 'Complete' THEN 1 ELSE 0 END) AS done
    FROM order_tasks
    GROUP BY customer_id
)
SELECT customer_id, total_tasks, done,
       ROUND(done / NULLIF(total_tasks, 0) * 100, 1) AS pct_done
FROM task_summary
ORDER BY pct_done DESC
```

**Recursive CTE:**

```sql
WITH RECURSIVE org_tree (emp_id, mgr_id, emp_name, lvl) AS (
    SELECT emp_id, mgr_id, emp_name, 1
    FROM employees
    WHERE mgr_id IS NULL
    UNION ALL
    SELECT e.emp_id, e.mgr_id, e.emp_name, ot.lvl + 1
    FROM employees e
    INNER JOIN org_tree ot
      ON ot.emp_id = e.mgr_id
)
SELECT emp_id, emp_name, lvl
FROM org_tree
ORDER BY lvl, emp_name
```

### 2.8 Set Operations

Surround set operators (`UNION`, `UNION ALL`, `INTERSECT`, `MINUS`) with blank
lines so the boundary between the combined queries is visually clear.

```sql
SELECT ordno, testcode
FROM ordtask
WHERE status = 'Logged'

UNION ALL

SELECT ordno, testcode
FROM ordtask_archive
WHERE status = 'Logged'
ORDER BY ordno
```

**INTERSECT:**

```sql
SELECT testcode
FROM ordtask
WHERE status = 'Complete'

INTERSECT

SELECT testcode
FROM specifications
WHERE active_flag = 'Y'
```

**MINUS:**

```sql
SELECT ordno
FROM orders
WHERE status = 'Logged'

MINUS

SELECT ordno
FROM ordtask
WHERE status = 'Complete'
```

### 2.9 INSERT

**Single row VALUES:**

```sql
INSERT INTO audit_log (
    log_id, action, username, log_date
)
VALUES (
    seq_audit.NEXTVAL, 'UPDATE', 'admin', SYSDATE
)
```

**Multi-line columns and values:**

```sql
INSERT INTO ordresult (
    result_id, ordno, testcode, result_value,
    status, logdate, completed_by, comment
)
VALUES (
    seq_ordresult.NEXTVAL, '2025-001', 'pH', 7.2,
    'Complete', SYSDATE, 'admin', 'Within spec'
)
```

Continuation lines indent 4 spaces — same as the first item inside the parenthesis.

**INSERT...SELECT:**

```sql
INSERT INTO ordtask_archive (
    ordno, testcode, status, logdate
)
SELECT ordno, testcode, status, logdate
FROM ordtask
WHERE status = 'Complete'
  AND logdate < ADD_MONTHS(SYSDATE, -12)
```

**INSERT ALL (multi-table):**

```sql
INSERT ALL
    WHEN status = 'Complete' THEN
        INTO completed_tasks (
            ordno, testcode, completed_date
        )
        VALUES (
            ordno, testcode, SYSDATE
        )
    WHEN status = 'Failed' THEN
        INTO failed_tasks (
            ordno, testcode, failed_date
        )
        VALUES (
            ordno, testcode, SYSDATE
        )
SELECT ordno, testcode, status
FROM ordtask
WHERE logdate = TRUNC(SYSDATE)
```

### 2.10 UPDATE

**Basic:**

```sql
UPDATE ordtask SET
    status = 'Complete',
    completed_date = SYSDATE,
    completed_by = 'admin'
WHERE ordno = '2025-001'
  AND testcode = 'pH'
```

**With subquery** — the subquery body uses the statement-level flat
indent (4 from the UPDATE), not nesting under the assigned column; the
closing `)` returns to column 0. This is the same flat convention as
every other subquery context:

```sql
UPDATE ordtask t SET
    t.status = (
    SELECT CASE
               WHEN r.result_value BETWEEN s.low_limit AND s.high_limit
               THEN 'Pass'
               ELSE 'Fail'
           END
    FROM ordresult r
    INNER JOIN specifications s
      ON s.testcode = t.testcode
    WHERE r.ordno = t.ordno
      AND r.testcode = t.testcode
)
WHERE t.status = 'Pending'
```

**Multi-column subquery update:**

```sql
UPDATE ordresult r SET
    (status, evaluated_by, eval_date) = (
    SELECT CASE
               WHEN r.result_value BETWEEN s.low_limit AND s.high_limit
               THEN 'Pass'
               ELSE 'Fail'
           END,
           'SYSTEM',
           SYSDATE
    FROM specifications s
    WHERE s.testcode = r.testcode
)
WHERE r.status = 'Pending'
```

**Correlated update:**

```sql
UPDATE orders o SET
    o.task_count = (
    SELECT COUNT(*)
    FROM ordtask t
    WHERE t.ordno = o.ordno
)
WHERE o.status = 'Active'
```

### 2.11 DELETE

**Basic:**

```sql
DELETE FROM audit_log
WHERE log_date < ADD_MONTHS(SYSDATE, -24)
```

**With EXISTS:**

```sql
DELETE FROM ordresult r
WHERE EXISTS (
    SELECT 1
    FROM ordtask t
    WHERE t.ordno = r.ordno
      AND t.testcode = r.testcode
      AND t.status = 'Cancelled'
)
```

### 2.12 MERGE

```sql
MERGE INTO ordtask_summary tgt
USING (
    SELECT ordno, testcode,
           COUNT(*) AS result_count,
           AVG(result_value) AS avg_result
    FROM ordresult
    GROUP BY ordno, testcode
) src
ON (tgt.ordno = src.ordno AND tgt.testcode = src.testcode)
WHEN MATCHED THEN
    UPDATE SET tgt.result_count = src.result_count,
               tgt.avg_result = src.avg_result,
               tgt.updated_date = SYSDATE
    DELETE WHERE tgt.result_count = 0
WHEN NOT MATCHED THEN
    INSERT (
        ordno, testcode, result_count, avg_result, created_date
    )
    VALUES (
        src.ordno, src.testcode, src.result_count,
        src.avg_result, SYSDATE
    )
```

**MERGE with multi-line ON:**

```sql
MERGE INTO ordresult_audit tgt
USING (
    SELECT r.ordno, r.testcode, r.result_value,
           r.status, r.logdate
    FROM ordresult r
    INNER JOIN orders o
      ON o.ordno = r.ordno
    WHERE o.status = 'Active'
) src
ON (tgt.ordno = src.ordno
    AND tgt.testcode = src.testcode
    AND tgt.logdate = src.logdate)
WHEN MATCHED THEN
    UPDATE SET tgt.result_value = src.result_value,
               tgt.status = src.status
WHEN NOT MATCHED THEN
    INSERT (
        ordno, testcode, result_value, status, logdate
    )
    VALUES (
        src.ordno, src.testcode, src.result_value,
        src.status, src.logdate
    )
```

Additional ON conditions align under the first condition inside the parentheses.

**MERGE formatting rules:**
- `MERGE INTO`, `USING`, and `ON` at column 0
- `WHEN MATCHED THEN` / `WHEN NOT MATCHED THEN` at column 0
- `UPDATE SET` / `INSERT` / `DELETE WHERE` indented 4 spaces under WHEN
- SET column assignments aligned with continuation indented to match first assignment

---

## 3. Analytic / Window Functions

### 3.1 ROW_NUMBER, RANK, DENSE_RANK, NTILE

Whether a window spec breaks is decided by line width, not by which
clauses it contains. A spec breaks inside `OVER (` if and only if
laying it out inline — from `OVER` through the end of the select-list
item (the closing paren and `AS alias`) — would push the current line
past the ~90-character limit (see Core Formatting Rules). A spec that
fits stays on one line even when it has both PARTITION BY and ORDER BY;
an empty `OVER ()` always stays inline.

When a spec breaks: one space before the paren, each window clause
(PARTITION BY / ORDER BY / frame) on its own line indented 4 past the
function's column, and the closing `) AS alias` on its own line aligned
with the function's column:

```sql
SELECT ordno, testcode, analysisgroup,
       ROW_NUMBER() OVER (
           PARTITION BY ordno, analysisgroup
           ORDER BY testcode DESC, analysisgroup
       ) AS rn,
       RANK() OVER (
           PARTITION BY testcode, analysisgroup
           ORDER BY result_value DESC, logdate
       ) AS val_rank
FROM ordresult
WHERE status = 'Complete'
```

Window specs that fit within the line limit stay on one line, including
specs with both PARTITION BY and ORDER BY:

```sql
SELECT ordno, testcode, result_value,
       ROW_NUMBER() OVER (PARTITION BY ordno ORDER BY testcode) AS rn
FROM ordresult
```

```sql
SELECT ordno, testcode,
       ROW_NUMBER() OVER (ORDER BY ordno) AS rn
FROM ordtask
```

### 3.2 Windowing Clauses (ROWS/RANGE BETWEEN)

```sql
SELECT ordno, logdate, result_value,
       AVG(result_value) OVER (
           PARTITION BY testcode
           ORDER BY logdate
           ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
       ) AS moving_avg_7
FROM ordresult
WHERE testcode = 'pH'
ORDER BY logdate
```

### 3.3 LAG / LEAD, FIRST_VALUE / LAST_VALUE

```sql
SELECT ordno, logdate, result_value,
       LAG(result_value, 1) OVER (
           PARTITION BY testcode, analysisgroup
           ORDER BY logdate
       ) AS prev_result,
       LEAD(result_value, 1) OVER (
           PARTITION BY testcode, analysisgroup
           ORDER BY logdate
       ) AS next_result,
       FIRST_VALUE(result_value) OVER (
           PARTITION BY testcode
           ORDER BY logdate
           ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
       ) AS first_result
FROM ordresult
ORDER BY testcode, logdate
```

### 3.4 LISTAGG

```sql
SELECT ordno,
       LISTAGG(testcode, ', ') WITHIN GROUP (
           ORDER BY testcode
       ) AS test_list
FROM ordtask
WHERE status = 'Logged'
GROUP BY ordno
```

With overflow (Oracle 12c R2+):

```sql
SELECT ordno,
       LISTAGG(testcode, ', ' ON OVERFLOW TRUNCATE '...')
           WITHIN GROUP (ORDER BY testcode) AS test_list
FROM ordtask
GROUP BY ordno
```

---

## 4. Oracle-Specific Constructs

### 4.1 Hierarchical Queries

```sql
SELECT LEVEL, emp_id, emp_name,
       SYS_CONNECT_BY_PATH(emp_name, '/') AS path,
       CONNECT_BY_ROOT emp_name AS root_mgr
FROM employees
START WITH mgr_id IS NULL
CONNECT BY PRIOR emp_id = mgr_id
ORDER SIBLINGS BY emp_name
```

**Hierarchical query formatting rules:**
- `START WITH` and `CONNECT BY` at column 0 (major clauses)
- `PRIOR` stays inline with `CONNECT BY`
- `ORDER SIBLINGS BY` at column 0

### 4.2 PIVOT / UNPIVOT

**PIVOT:**

```sql
SELECT *
FROM (
    SELECT ordno, testcode, result_value
    FROM ordresult
    WHERE ordno = '2025-001'
)
PIVOT (
    AVG(result_value)
    FOR testcode IN (
        'pH' AS ph,
        'Conductivity' AS cond,
        'Turbidity' AS turb
    )
)
```

**UNPIVOT:**

```sql
SELECT ordno, test_name, test_value
FROM ordresult_wide
UNPIVOT (
    test_value FOR test_name IN (
        ph_result AS 'pH',
        cond_result AS 'Conductivity',
        turb_result AS 'Turbidity'
    )
)
```

**PIVOT/UNPIVOT formatting rules:**
- `PIVOT` / `UNPIVOT` at column 0
- Aggregate and `FOR...IN` indented 4 spaces inside parentheses
- IN list values indented further if multi-line

### 4.3 LATERAL Inline Views

`LATERAL (` stays on the FROM line and the subquery uses the flat
convention like every inline view:

```sql
SELECT o.ordno, o.status, lt.latest_result
FROM orders o, LATERAL (
    SELECT MAX(r.result_value) AS latest_result
    FROM ordresult r
    WHERE r.ordno = o.ordno
) lt
WHERE o.status = 'Active'
```

### 4.4 Flashback Queries

**AS OF TIMESTAMP:**

```sql
SELECT ordno, status
FROM orders AS OF TIMESTAMP
    (SYSTIMESTAMP - INTERVAL '1' HOUR)
WHERE ordno = '2025-001'
```

**AS OF SCN:**

```sql
SELECT ordno, status
FROM orders AS OF SCN 123456789
WHERE ordno = '2025-001'
```

### 4.5 RETURNING Clause

In SSL context, `RETURNING...INTO` is used with bind variables:

```sql
INSERT INTO orders (
    ordno, status, logdate
)
VALUES (
    '2025-999', 'Logged', SYSDATE
)
RETURNING order_id INTO ?nNewId?
```

```sql
UPDATE ordtask SET
    status = 'Complete',
    completed_date = SYSDATE
WHERE ordno = '2025-001'
  AND testcode = 'pH'
RETURNING task_id INTO ?nTaskId?
```

```sql
DELETE FROM audit_log
WHERE log_id = ?nLogId?
RETURNING action INTO ?sAction?
```

### 4.6 FOR UPDATE

```sql
SELECT ordno, status
FROM orders
WHERE status = 'Pending'
  AND customer_id = ?sCustomerId?
FOR UPDATE OF status NOWAIT
```

```sql
SELECT ordno, status
FROM orders
WHERE ordno = ?sOrdNo?
FOR UPDATE WAIT 5
```

### 4.7 Optimizer Hints

Oracle hints use a special comment syntax `/*+ ... */` placed immediately after
the action keyword (SELECT, INSERT, UPDATE, DELETE, MERGE). They influence the
query plan — do not strip them as regular comments.

**Single hint:**

```sql
SELECT /*+ INDEX(t idx_ordtask_status) */
       ordno, testcode, status
FROM ordtask t
WHERE status = 'Logged'
```

**Multiple hints:**

```sql
SELECT /*+ LEADING(o t) USE_NL(t) INDEX(t idx_ordtask_ordno) */
       o.ordno, t.testcode, t.status
FROM orders o
INNER JOIN ordtask t
  ON t.ordno = o.ordno
WHERE o.status = 'Active'
```

**Version-specific optimizer behavior:**

```sql
SELECT /*+ OPTIMIZER_FEATURES_ENABLE('11.2.0.4') */
       ordno, testcode, status
FROM ordtask
WHERE status = 'Logged'
ORDER BY ordno
```

**Hint formatting rules:**
- Hint comment stays on the same line as the action keyword when short
- When hints are long, the SELECT columns start on the next line (indented to col 7)
- Never reformat or remove hints without understanding their purpose — they exist to solve specific performance problems

---

## 5. Expressions

### 5.1 CASE — Simple

```sql
SELECT ordno,
       CASE status
           WHEN 'L' THEN 'Logged'
           WHEN 'C' THEN 'Complete'
           WHEN 'X' THEN 'Cancelled'
           ELSE 'Unknown'
       END AS status_desc
FROM orders
```

### 5.2 CASE — Searched

```sql
SELECT ordno, result_value,
       CASE
           WHEN result_value < low_limit THEN 'Below'
           WHEN result_value > high_limit THEN 'Above'
           ELSE 'Pass'
       END AS eval_result
FROM ordresult r
INNER JOIN specifications s
  ON s.testcode = r.testcode
```

**THEN/ELSE values on their own line** — when any WHEN branch has a condition or
value too long to fit inline, break THEN values to the next line. ELSE can stay
inline when its value is short:

```sql
SELECT ordno, testcode,
       CASE
           WHEN status = 'Complete' AND result_value IS NOT NULL THEN
               ROUND(result_value / baseline_value * 100, 2)
           WHEN status = 'Complete' AND result_value IS NULL THEN
               0
           ELSE -1
       END AS pct_of_baseline
FROM ordresult
```

**Consistency rule:** within a single CASE block, WHEN/THEN branches should be
consistently inline or consistently broken — don't mix. ELSE follows the same
approach but may stay inline when its value is short.

### 5.3 CASE — Nested

```sql
SELECT ordno,
       CASE
           WHEN status = 'Complete' THEN
               CASE
                   WHEN result_value IS NULL THEN 'No Result'
                   WHEN result_value > threshold THEN 'OOS'
                   ELSE 'Within Spec'
               END
           ELSE 'Incomplete'
       END AS evaluation
FROM ordresult
```

### 5.4 DECODE (Oracle Legacy)

```sql
SELECT ordno,
       DECODE(status,
              'L', 'Logged',
              'C', 'Complete',
              'X', 'Cancelled',
              'Unknown') AS status_desc
FROM orders
```

**DECODE formatting:** Arguments aligned after opening parenthesis. Each value pair on its own line when there are more than 2 mappings.

### 5.5 NVL / NVL2 / COALESCE / NULLIF

```sql
SELECT ordno,
       NVL(result_value, 0) AS result_safe,
       NVL2(comment, 'Has Comment', 'No Comment') AS comment_flag,
       COALESCE(override_value, result_value, default_value) AS final_value,
       NULLIF(status, 'N/A') AS clean_status
FROM ordresult
```

### 5.6 CAST / Type Conversion

```sql
SELECT ordno,
       CAST(result_value AS NUMBER(10, 2)) AS rounded_result,
       TO_CHAR(logdate, 'YYYY-MM-DD HH24:MI:SS') AS log_timestamp,
       TO_DATE(date_string, 'YYYY-MM-DD') AS parsed_date,
       TO_NUMBER(string_val, '999.99') AS numeric_val
FROM ordresult
```

### 5.7 Nested Function Calls

When nesting is shallow (2 levels), keep inline:

```sql
SELECT UPPER(TRIM(description)) AS clean_desc
FROM orders
```

When nesting is deep, break at logical points:

```sql
SELECT ordno,
       TO_CHAR(
           TRUNC(
               ADD_MONTHS(logdate, -6),
               'MM'
           ),
           'YYYY-MM-DD'
       ) AS six_months_prior_month
FROM orders
```

### 5.8 String Concatenation (||) Across Lines

```sql
SELECT emp_name || ' (' || department || ')' AS display_name
FROM employees
```

When long:

```sql
SELECT ordno || ' - '
       || testcode || ' - '
       || TO_CHAR(logdate, 'YYYY-MM-DD') AS composite_key
FROM ordtask
```

Continuation of `||` aligns to the first column of the SELECT list.

---

## 6. DDL

### 6.1 CREATE TABLE

```sql
CREATE TABLE ordresult (
    result_id   NUMBER(10)     NOT NULL,
    ordno       VARCHAR2(20)   NOT NULL,
    testcode    VARCHAR2(30)   NOT NULL,
    result_value NUMBER(15, 5),
    status      VARCHAR2(10)   DEFAULT 'Pending',
    logdate     DATE           DEFAULT SYSDATE,
    CONSTRAINT pk_ordresult PRIMARY KEY (result_id),
    CONSTRAINT fk_ordresult_order
        FOREIGN KEY (ordno) REFERENCES orders (ordno),
    CONSTRAINT ck_ordresult_status
        CHECK (status IN ('Pending', 'Complete', 'Failed'))
)
```

**CREATE TABLE formatting rules:**
- Column definitions indented 4 spaces
- Type and constraints aligned when practical (within ~90 char limit)
- Out-of-line constraints at end, indented 4 spaces
- Multi-part constraint definitions (FOREIGN KEY...REFERENCES) continuation indented 8 spaces

**CREATE TABLE AS SELECT (CTAS):**

```sql
CREATE TABLE ordtask_snapshot AS
SELECT o.ordno, t.testcode, t.status, t.logdate
FROM orders o
INNER JOIN ordtask t
  ON t.ordno = o.ordno
WHERE o.status = 'Active'
```

### 6.2 CREATE VIEW

```sql
CREATE OR REPLACE VIEW vw_active_tasks AS
SELECT o.ordno, o.status AS order_status,
       t.testcode, t.status AS task_status,
       t.logdate
FROM orders o
INNER JOIN ordtask t
  ON t.ordno = o.ordno
WHERE o.status = 'Active'
```

### 6.3 CREATE INDEX

**Simple:**

```sql
CREATE INDEX idx_ordtask_status
    ON ordtask (status)
```

**Composite:**

```sql
CREATE INDEX idx_ordresult_lookup
    ON ordresult (ordno, testcode, status)
```

**Function-based:**

```sql
CREATE INDEX idx_orders_upper_desc
    ON orders (UPPER(description))
```

### 6.4 ALTER TABLE

```sql
ALTER TABLE ordtask
    ADD (completed_date DATE,
         completed_by   VARCHAR2(50))
```

```sql
ALTER TABLE ordtask
    MODIFY (status VARCHAR2(20) DEFAULT 'New')
```

```sql
ALTER TABLE ordtask
    DROP COLUMN obsolete_flag
```

```sql
ALTER TABLE ordtask
    ADD CONSTRAINT fk_ordtask_order
        FOREIGN KEY (ordno) REFERENCES orders (ordno)
```

### 6.5 DROP / TRUNCATE

```sql
DROP TABLE ordtask_archive PURGE
```

```sql
TRUNCATE TABLE temp_results
```

---

## 7. SSL Embedding Context

### 7.1 SQLExecute with Named Parameters

```ssl
aResults := SQLExecute("
    SELECT ordno, testcode, status
    FROM ordtask
    WHERE status = ?sStatus?
      AND ordno = ?sOrdNo?
    ORDER BY ordno
");
```

### 7.2 RunSQL with Positional Parameters

```ssl
RunSQL("
    UPDATE ordtask SET
        status = ?,
        completed_date = SYSDATE,
        completed_by = ?
    WHERE ordno = ?
      AND testcode = ?
",, {sNewStatus, sUser, sOrdNo, sTestCode});
```

### 7.3 Complex Query in SSL

```ssl
aData := SQLExecute("
    WITH task_summary AS (
        SELECT ordno,
               COUNT(*) AS total_tasks,
               SUM(CASE WHEN status = 'Complete' THEN 1 ELSE 0 END) AS done
        FROM ordtask
        WHERE ordno = ?sOrdNo?
        GROUP BY ordno
    )
    SELECT ts.ordno, ts.total_tasks, ts.done,
           ROUND(ts.done / NULLIF(ts.total_tasks, 0) * 100, 1) AS pct
    FROM task_summary ts
");
```

### 7.4 MERGE in SSL

```ssl
RunSQL("
    MERGE INTO ordtask_summary tgt
    USING (
        SELECT ordno, testcode, COUNT(*) AS cnt
        FROM ordresult
        WHERE ordno = ?
        GROUP BY ordno, testcode
    ) src
    ON (tgt.ordno = src.ordno AND tgt.testcode = src.testcode)
    WHEN MATCHED THEN
        UPDATE SET tgt.result_count = src.cnt,
                   tgt.updated_date = SYSDATE
    WHEN NOT MATCHED THEN
        INSERT (
            ordno, testcode, result_count, created_date
        )
        VALUES (
            src.ordno, src.testcode, src.cnt, SYSDATE
        )
",, {sOrdNo});
```

### 7.5 INSERT with RETURNING INTO

```ssl
nNewId := SQLExecute("
    INSERT INTO orders (
        ordno, status, logdate
    )
    VALUES (
        ?sOrdNo?, 'Logged', SYSDATE
    )
    RETURNING order_id INTO ?nNewId?
");
```

### 7.6 Window Functions in SSL

```ssl
aRanked := SQLExecute("
    SELECT ordno, testcode, result_value,
           ROW_NUMBER() OVER (
               PARTITION BY ordno, analysisgroup
               ORDER BY testcode DESC, logdate
           ) AS rn
    FROM ordresult
    WHERE ordno = ?sOrdNo?
      AND status = 'Complete'
    ORDER BY rn
");
```

### 7.7 Parameter Syntax Summary

| Function | Parameter Style | Example |
|----------|----------------|---------|
| `SQLExecute` | Named `?varName?` | `?sOrdNo?`, `?oObj:prop?`, `?aArr[1]?` (see note below) |
| `RunSQL` | Positional `?` with array | `RunSQL(sSQL,, {val1, val2})` |
| `LSearch` | Positional `?` with array | `LSearch(sSQL,, {val1})` |
| `LSelect` | Positional `?` with array | `LSelect(sSQL,, {val1, val2})` |
| `LSelect1` | Positional `?` with array | `LSelect1(sSQL,, {val1})` |
| `LSelectC` | Positional `?` with array | `LSelectC(sSQL,, {val1})` |
| `GetDataSet` | Positional `?` with array | `GetDataSet(sSQL,, {val1})` |

> **Caveat:** Array expansion for `IN` clauses (`?arrayVar?`) requires a local variable. UDObject array properties used directly (e.g., `?oObj:ArrayProp?`) cause a runtime error: *"The current array has more than 1 dimmension."* Copy the array to a local variable first. Scalar UDObject properties are not affected.
