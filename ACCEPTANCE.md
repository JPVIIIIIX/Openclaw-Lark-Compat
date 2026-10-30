# 真实环境验收 / Live acceptance — 2026-10-30

Environment: OpenClaw 2026.10.9, Node.js 26.12.1, pnpm 10.32.1. An isolated host configuration and state directory used one existing bot with the original gateway temporarily stopped to avoid duplicate consumers. Original configuration was preserved. Results cover one Feishu tenant and one private chat, not every upstream capability.

| Check | Result | Evidence / boundary |
|---|---|---|
| Automated regression | Passed | 456 tests across 56 files; typecheck, format and build pass; lint 0 errors / 26 existing warnings |
| DM receive / reply | Passed | Incoming message dispatched; diagnostic card displayed and confirmed by user |
| Model-driven streaming | Passed after configuration fix | Source-linked white card observed with partial third paragraph, then complete six-paragraph story; 16 successful CardKit content updates, content length 154 → 721; stream closed and final card update succeeded |
| OAuth | Passed after code fix | Plain-text `ratelimit triggered` previously misreported as account mismatch; bounded identity retries and distinct unavailable result added; subsequent real authorization completed and user confirmed |
| Documents | Passed | Plugin tools created a test document, read it, appended a marker and read back both markers |
| Bitable | Passed | Plugin tools created test base/table/fields; created record, read, updated count 1 → 2, read, deleted record and verified zero records |

## Fixes and limits

- Identity is accepted only after `user_info` returns the expected open ID. Confirmed different users remain rejected. Rate limits, network failures and malformed responses receive up to three attempts; each fetch has a 10-second timeout. If identity remains unavailable, authorization is not saved and a retry message replaces the misleading mismatch error.
- Model endpoint connectivity required the local machine's existing proxy. This is deployment-specific, not a universal plugin defect or a portable proxy setting.
- The host's message-tool delivery bypassed streaming. Setting `messages.visibleReplies` to `automatic` enabled ordinary model output to reach the streaming card dispatcher. See the README configuration example.
- Document and Bitable checks used actual plugin tools and real APIs; natural-language model selection of those tools was not separately verified.
- Test document/base were retained; the test record was deleted. No tenant IDs, document URLs, credentials, user identifiers or raw private logs are included here.
- Group messaging, Sheets, Calendar, Tasks, file/image transfer, token-refresh expiry, reconnect/soak tests and other host versions remain untested.
- A nonfatal model-runtime cleanup warning was observed; successful model output and card finalization were independently verified. The diagnostic card's legacy version/path labels were not validated as authoritative runtime metadata.
- No known outstanding failure in the checked flows; this is scoped acceptance, not a claim that every feature is production-ready. Remote CI status must be checked on the published branch.
