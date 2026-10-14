---
id: wrapped_list_alignment
title: Align the hanging lines of a wrapped list
domain: server-scripts
status: active
level: style_only
severity: info
applies_to: [server_script, class]
rule: >-
  When a declaration or similar comma-separated statement wraps, indent each
  hanging line so its first item aligns with the first item after the
  keyword.
categories: [formatting]
enforced_by: [lsp:fmt.indent_style]
verification:
  basis: convention
  note: >-
    Kept from the server-script baseline ("Naming And Formatting"), which
    states it word for word. #120 kept the rule over the formatter's earlier
    one-tab layout. From starlims-lsp v0.26.0 the formatter aligns the
    hanging lines of a :DECLARE, :PARAMETERS or :PUBLIC list under the
    list's first item (the statement's indent, then spaces).
issues: ["#120"]
---

## Rationale

Aligned items read as one list, and the hanging lines do not look like
statements of their own. The alignment is the statement's indent followed by
spaces, so it holds at any tab width.

## Examples

### Good

```ssl
:PROCEDURE StartRequest;
	:PARAMETERS sRequestId, sRouteCode;
	:DECLARE sSettingKey, nRetryCount, nRetryLimit, bStarted, sStatus, sMessage,
	         bCommit;

	sSettingKey := sRouteCode + "_" + sRequestId;
	nRetryCount := 0;
	nRetryLimit := 3;
	bStarted := nRetryCount < nRetryLimit;
	sStatus := "";
	sMessage := sSettingKey;
	bCommit := bStarted .AND. Empty(sStatus) .AND. !Empty(sMessage);

	:RETURN bCommit;
:ENDPROC;
```

### Bad

```ssl
:PROCEDURE StartRequest;
	:PARAMETERS sRequestId, sRouteCode;
	:DECLARE sSettingKey, nRetryCount, nRetryLimit, bStarted, sStatus, sMessage,
		bCommit;

	sSettingKey := sRouteCode + "_" + sRequestId;
	nRetryCount := 0;
	nRetryLimit := 3;
	bStarted := nRetryCount < nRetryLimit;
	sStatus := "";
	sMessage := sSettingKey;
	bCommit := bStarted .AND. Empty(sStatus) .AND. !Empty(sMessage);

	:RETURN bCommit;
:ENDPROC;
```
