# PendingItems design, task version 1

## Logic

Use inline data-source parameter defaults and a single declarative SELECT.
Match owner and status exactly through native @parameter placeholders. Return
only item_id and priority, ordered by descending priority then item_id.
Empty results and database exceptions follow the normal data-source mechanism.

## SSL Vocabulary

No SSL built-ins in the data-source body. PARAMETERS is a builder directive
with inline defaults. SQL uses SELECT, FROM, WHERE, AND, ORDER BY, and DESC.
SQL comments use --, as documented in ssl_agent_instructions section 4A.
Test invocation: `RunDS(sDataSourceName, [aParameters], [vReturnType])`, verified
through the MCP signature and data-source invocation guide.
