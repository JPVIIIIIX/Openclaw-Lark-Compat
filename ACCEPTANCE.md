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

## Version metadata verification — 2026-10-31

The compatibility package version is now `2026.10.30`. The host remains OpenClaw `2026.10.9`, Node.js `26.12.1`, and pnpm `10.32.1`.

- The version helper previously assumed its source location under `src/core/`. After bundling into `dist/`, it looked outside the plugin for `package.json`, failed, and cached `unknown`. It now supports both layouts and validates the package name and version instead of accepting unrelated parent-package metadata.
- The CLI diagnostic previously hardcoded `2026.2.10`. It now uses the same package-version helper as `/feishu doctor`. The existing User-Agent helper also receives the corrected version metadata.
- Four regression cases run the emitted ESM helper in isolated Node processes: source layout, bundled layout, missing plugin metadata with an unrelated parent package, and a non-string version. The full suite passed: 460 tests across 57 files; typecheck, format, and build passed; lint remained at 0 errors / 26 existing warnings. After renumbering the package, the four version cases and build passed again.
- On the B test machine, the rebuilt plugin was reloaded successfully. A newly generated `/feishu doctor` card and runtime package inspection both reported `2026.10.30`; the CLI diagnostic was also verified to use the package version. Existing cards retain their historical text.
- The change is limited to version metadata and diagnostics; messaging, streaming, OAuth, permission, and model logic were not changed. Long-text streaming was not rerun for this metadata-only change. Prior live streaming evidence remains separate from this verification.

These checks do not establish A/B parity, validate every feature, or replace end-to-end testing of document and Bitable operations on the B machine. No private configuration, account identifiers, credentials, or raw logs are included in this repository report.
