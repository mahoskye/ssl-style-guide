---
id: banner_has_no_semicolon
title: No semicolon inside the banner
domain: server-scripts
status: removed
level: authoritative
severity: error
applies_to: [server_script, class]
rule: >-
  The banner is one comment, so it ends at the first `;`. Never put `;`
  anywhere inside it.
categories: [module-structure]
enforced_by: [lsp:diag.comment_text_after_terminator]
verification:
  basis: reference
  note: >-
    Kept from the server-script baseline's banner bullets. Removed: a banner
    follows the same comment rules as every other comment, so this record
    folded into no_semicolon_in_comment_text, which carries its banner
    example. Its documentation.file_banner.rules entry was dropped, since
    comments.rules states the rule for every comment.
---

## Rationale

An SSL comment runs from `/*` to the first `;`. A semicolon inside the
banner ends the comment there, and the rest of the banner is read as code.
See `no_semicolon_in_comment_text`, which now states this for every comment.
