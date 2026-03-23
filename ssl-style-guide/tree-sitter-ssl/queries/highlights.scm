; Highlight captures for SSL

; Keywords (all colon-prefixed)
(( kw_if ) @keyword)
(( kw_else ) @keyword)
(( kw_endif ) @keyword)
(( kw_while ) @keyword)
(( kw_endwhile ) @keyword)
(( kw_for ) @keyword)
(( kw_next ) @keyword)
(( kw_to ) @keyword)
(( kw_step ) @keyword)
(( kw_begincase ) @keyword)
(( kw_case ) @keyword)
(( kw_otherwise ) @keyword)
(( kw_endcase ) @keyword)
(( kw_exitcase ) @keyword)
(( kw_try ) @keyword)
(( kw_catch ) @keyword)
(( kw_finally ) @keyword)
(( kw_endtry ) @keyword)
(( kw_declare ) @keyword)
(( kw_default ) @keyword)
(( kw_parameters ) @keyword)
(( kw_public ) @keyword)
(( kw_include ) @keyword)
(( kw_procedure ) @keyword)
(( kw_endproc ) @keyword)
(( kw_return ) @keyword)
(( kw_class ) @keyword)
(( kw_inherit ) @keyword)
(( kw_region ) @keyword)
(( kw_endregion ) @keyword)
(( kw_error ) @keyword)
(( kw_label ) @keyword)
(( kw_begininlinecode ) @keyword)
(( kw_endinlinecode ) @keyword)
(( kw_exitfor ) @keyword)
(( kw_exitwhile ) @keyword)
(( kw_loop ) @keyword)
(( kw_resume ) @keyword)

; Comments / strings / numbers
(comment) @comment
(string) @string
(quoted_identifier) @string.special
(bracket_string) @string
(number) @number
(boolean) @constant.builtin
(nil) @constant.builtin
(me_literal) @variable.builtin
(base_access) @variable.builtin
(code_block) @function.lambda
(code_block
  "{" @punctuation.bracket
  "|" @punctuation.delimiter
  "|" @punctuation.delimiter
  "}" @punctuation.bracket)
(code_block parameter: (identifier) @variable.parameter)
(region_body) @string

; Identifiers
(identifier) @variable
(property_access . (identifier) @variable)
(property_access property: (identifier) @property)
(method_call receiver: (identifier) @variable)
(method_call method: (identifier) @function.method)
(call_expression function: (identifier) @function)

; Built-in SSL function inventory (synchronized with TextMate highlighting)
((call_expression function: (identifier) @function.builtin)
  (#match? @function.builtin "(?i)^(AAdd|AEval|AEvalA|AFill|ALen|AScan|AScanExact|Abs|AddColDelimiters|AddNameDelimiters|AddProperty|AddToSession|AllTrim|ArrayCalc|ArrayNew|ArrayToTVP|Asc|At|BeginLimsTransaction|Branch|BuildArray|BuildArray2|BuildString|BuildString2|BuildStringForIn|CMonth|CToD|CheckOnFtp|ChkNewPassword|ChkPassword|Chr|ClearLastSSLError|ClearSession|ClientEndOfDay|ClientStartOfDay|CombineFiles|CompArray|Compress|ConvertReport|CopyToFtp|CreateGUID|CreateLocal|CreateORMSession|CreatePublic|CreateUdObject|CreateZip|DOW|DOY|DToC|DToS|DateAdd|DateDiff|DateDiffEx|DateFormat|DateFromNumbers|DateFromString|DateToString|Day|Decompress|DecryptData|DelArray|DeleteDirOnFtp|DeleteFromFtp|DeleteInlineCode|DetectSqlInjections|Directory|DoProc|DocAcquireWorkitem|DocAddUsersToGroup|DocCancelCheckout|DocCheckinDocument|DocCheckoutDocument|DocCommandFailed|DocCompleteWorkitem|DocCreateACL|DocCreateCabinet|DocCreateFolder|DocCreateGroup|DocCreateUser|DocDelegateWorkitem|DocDelete|DocDeleteCabinet|DocDeleteFolder|DocDeleteUser|DocEndDocumentumInterface|DocExists|DocExistsUser|DocExportDocument|DocGetCabinets|DocGetDocuments|DocGetErrorMessage|DocGetFolders|DocGetMetadata|DocGetTasks|DocGetTasksCount|DocGetTypeAttributes|DocGetTypeAttributesAsDataset|DocGetWorkflowStatus|DocGetWorkitemProperties|DocImportDocument|DocInitDocumentumInterface|DocLoginToDocumentum|DocPauseWorkflow|DocRemoveAllUsersFromGroup|DocRemoveUsersFromGroup|DocRepeatWorkitem|DocResumeWorkflow|DocSearchAsDataset|DocSearchFullText|DocSearchUsingDql|DocSetMetadata|DocStartWorkflow|DocStopWorkflow|DocUpdateUser|DosSupport|Empty|Eval|EncryptData|EndLimsOleConnect|EndLimsTransaction|ErrorMes|ExecFunction|ExecInternal|ExecUdf|ExtractCol|ExtractZip|FileSupport|FormatErrorMessage|FormatSqlErrorMessage|FromJson|FromXml|GetAppBaseFolder|GetAppWorkPathFolder|GetByName|GetConnectionByName|GetConnectionStrings|GetDBMSName|GetDBMSProviderName|GetDSParameters|GetDataSet|GetDataSetEx|GetDataSetFromArray|GetDataSetFromArrayEx|GetDataSetWithSchemaFromSelect|GetDataSetXMLFromArray|GetDataSetXMLFromSelect|GetDecimalSep|GetDecimalSeparator|GetDefaultConnection|GetDirFromFtp|GetExecutionTrace|GetFeaturesAndNumbers|GetFileVersion|GetForbiddenAppIDs|GetForbiddenDesignerAppIDs|GetFromApplication|GetFromFtp|GetFromSession|GetGroupSeparator|GetInlineCode|GetInstallationKey|GetInternal|GetInternalC|GetLastSQLError|GetLastSSLError|GetLicenseInfoAsText|GetLogsFolder|GetNETDataSet|GetNoLock|GetNumberOfInstrumentConnections|GetNumberOfNamedConcurrentUsers|GetNumberOfNamedUsers|GetPrinters|GetRdbmsDelimiter|GetRegion|GetRegionEx|GetSSLDataset|GetSetting|GetSettings|GetTables|GetTransactionsCount|GetUserData|GetWebFolder|HasProperty|HashData|Hour|HtmlDecode|HtmlEncode|IIf|IgnoreSqlErrors|In64BitMode|InBatchProcess|InfoMes|Integer|IsDBConnected|IsDefined|IsDemoLicense|IsFeatureAuthorized|IsFeatureBasedLicense|IsGuid|IsHex|IsInTransaction|IsInvariantDate|IsNumeric|IsProductionModeOn|IsTable|IsTableFld|JDay|LCase|LDAPAuth|LDAPAuthEX|LDir|LFromHex|LHex2Dec|LIMSDate|LKill|LLower|LPrint|LSearch|LSelect|LSelect1|LSelectC|LStr|LToHex|LTransform|LTrim|LWait|Left|Len|LimsAt|LimsExec|LimsGetDateFormat|LimsNETCast|LimsNETConnect|LimsNETTypeOf|LimsOleConnect|LimsRecordsAffected|LimsSetCounter|LimsSqlConnect|LimsSqlDisconnect|LimsString|LimsTime|LimsType|LimsTypeEx|LimsXOr|Lower|MakeDateInvariant|MakeDateLocal|MakeDirOnFtp|MakeNETObject|MatFunc|Max|MimeDecode|MimeEncode|Min|Minute|Month|MoveInFtp|NetFrameworkVersion|NoOfDays|Nothing|Now|PrepareArrayForIn|PrmCount|RaiseError|Rand|Rat|ReadBytesBase64|ReadFromFtp|ReadText|RenameOnFtp|Replace|Replicate|ResetFeatures|RetrieveLong|ReturnLastSQLError|Right|Round|RoundPoint5|RunApp|RunDS|RunSQL|SQLExecute|SQLRemoveComments|Scient|SearchLDAPUser|Second|Seconds|SendFromOutbox|SendLimsEmail|SendOutlookReminder|SendToFtp|SendToOutbox|ServerEndOfDay|ServerStartOfDay|ServerTimeZone|SetByName|SetDecimalSeparator|SetDefaultConnection|SetGroupSeparator|SetInternal|SetInternalC|SetLocationOracle|SetLocationSQLServer|SetSqlTimeout|SetUserData|SetUserPassword|ShowSqlErrors|SigFig|SortArray|SqlTraceOff|SqlTraceOn|Sqrt|StationName|StdRound|Str|StrSrch|StrTran|StrZero|StringToDate|SubStr|SubmitToBatch|SubmitToBatchEx|TableFldLst|Time|ToJson|ToNumeric|ToScientific|ToXml|Today|TraceOff|TraceOn|Trim|UndeclaredVars|UpdLong|Upper|UrlDecode|UrlEncode|UserTimeZone|UsrMes|Val|ValidateDate|ValidateNumeric|VerifySignature|WriteBytesBase64|WriteText|WriteToFtp|XmlDomToUdObject|XmlExportSql|Year|_AND|_NOT|_OR|_XOR)$"))

; Built-in SSL class names (22 classes) — highlight only in instantiation context
((builtin_class_instantiation class: (built_in_class_name) @type.builtin)
  (#match? @type.builtin "(?i)^(AzureStorage|BatchSupport|CDataTable|Email|EnterpriseExporter|FtpsClient|HtmlConverter|PatcherSupport|PdfSupport|RegSetup|SDMS|SDMSDocUploader|SSLBaseDictionary|SSLCodeProvider|SSLDataset|SSLExpando|SSLIntDictionary|SSLRegex|SSLStringDictionary|Sequence|TablesImport|WebServices)$"))

; Operators
(assignment_operator) @operator
(equality_operator) @operator
(relational_operator) @operator
(containment_operator) @operator
(shift_operator) @operator
(logical_and_operator) @operator
(logical_or_operator) @operator
(unary_operator) @operator
(additive_operator) @operator
(multiplicative_operator) @operator
(power_operator) @operator
(increment_operator) @operator

; Blocks
(if_block) @conditional
(if_block_loop) @conditional
(if_block_finally) @conditional
(if_block_constructor) @conditional
(if_block_constructor_loop) @conditional
(while_block) @repeat
(while_block_finally) @repeat
(while_block_constructor) @repeat
(for_block) @repeat
(for_block_finally) @repeat
(for_block_constructor) @repeat
(switch_block) @conditional
(switch_block_loop) @conditional
(switch_block_finally) @conditional
(switch_block_constructor) @conditional
(switch_block_constructor_loop) @conditional
(try_catch_block) @exception
(try_catch_block_loop) @exception
(try_catch_block_finally) @exception
(try_catch_block_constructor) @exception
(try_catch_block_constructor_loop) @exception
(error_block) @exception
(error_block_loop) @exception
(error_block_finally) @exception
(error_block_constructor) @exception
(error_block_constructor_loop) @exception
(region_block) @namespace
(declaration_statement_include path: (identifier) @module)
(class_declaration name: (identifier) @type)
(class_declaration base: (identifier) @type)
(class_declaration base: (qualified_identifier) @type)
(qualified_identifier) @type
(procedure_declaration name: (identifier) @function)
(class_method_declaration name: (non_constructor_identifier) @function.method)
(class_constructor_declaration name: (constructor_name) @constructor)
