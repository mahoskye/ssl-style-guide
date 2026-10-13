# List pending items for an owner

Version: 1. Responsibility: lookup. Family: SQL data source.

Read the synthetic table `calibration_item` with columns `item_id`, `owner_key`,
`status`, and `priority`. Return `item_id` and `priority` for the supplied owner
and status. Default `sOwner` to an empty string and `sStatus` to `PENDING`.
Sort highest priority first, then by item ID. An empty owner matches only
records explicitly assigned to an empty owner. No wildcard filtering or writes.

Use native SQL data-source parameters. No server-script wrapper or helpers.
An empty match returns an empty result set. Database failures propagate through
the normal data-source mechanism.

Synthetic acceptance fixture: owner A has pending items X (priority 2) and Y
(priority 5), and complete item Z (priority 9). Default-status lookup for A
returns Y then X. Owner B returns no rows. COMPLETE for A returns Z.

Review: parameter defaults, SQL layout, comments, and how to describe the
result without reproducing the query in prose.
