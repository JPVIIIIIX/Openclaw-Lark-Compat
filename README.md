# Openclaw-Lark-Compat

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/Node.js-26.12.1-blue.svg)](https://nodejs.org/)

[中文版](./README.zh.md) | English

This project adapts the [official Lark/Feishu OpenClaw plugin](https://github.com/larksuite/openclaw-lark), developed by the Lark/Feishu Open Platform team, for newer OpenClaw versions. It retains the upstream feature set and interaction design while updating SDK imports, runtime configuration access, command authorization, and session metadata reads.

**This is an independently maintained compatibility adaptation, not an official Feishu/Lark release or endorsement.** This README follows the upstream structure and feature descriptions. Original copyright notices and the MIT license are retained.

## Compatibility Status

- Validated host: **OpenClaw 2026.10.9**, running on **Node.js 26.12.1**. Other host versions have not been validated.
- Based on official commit [`dde0be3`](https://github.com/larksuite/openclaw-lark/commit/dde0be3680d6fd5443cab426c8f4b3216266346a). The authorization migration references [upstream PR #638](https://github.com/larksuite/openclaw-lark/pull/638).
- Local checks: 450 passing tests; type checking, formatting, and build pass; ESLint reports no errors.
- 5,120 authorization cases match the previous host implementation. Isolated registration covers 39 tools and 4 chat commands with zero network attempts.
- **Live Feishu messaging, card updates, and OAuth have not yet been verified end to end.** The features below describe upstream capabilities; current-host end-to-end acceptance remains pending.

## Features

This plugin provides comprehensive Lark/Feishu integration for OpenClaw, including:

| Category | Capabilities |
|------|------|
| 💬 Messenger | Read messages (group/DM history, thread replies), send messages, reply to messages, search messages, download images/files |
| 📄 Docs | Create, update, and read documents |
| 📊 Base | Create/manage bases, tables, fields, records (CRUD, batch operations, advanced filtering), views |
| 📈 Sheets | Create, edit, and view spreadsheets |
| 📅 Calendar | Manage calendars and events (create/query/update/delete/search), manage attendees, check free/busy status |
| ✅ Tasks | Manage tasks (create/query/update/complete), manage task lists, subtasks, and comments |

Additionally, the plugin supports:
- **📱 Interactive Cards**: Real-time status updates (Thinking/Generating/Complete), plus confirmation buttons for sensitive operations
- **🌊 Streaming Responses**: Live streaming text directly within message cards
- **🔒 Permission Policies**: Flexible access control policies for DMs and group chats
- **⚙️ Advanced Group Configuration**: Per-group settings including allowlists, skill bindings, and custom system prompts

## Security & Risk Warnings (Read Before Use)

This plugin integrates with OpenClaw AI automation capabilities and carries inherent risks such as model hallucinations, unpredictable execution, and prompt injection. After you authorize Lark/Feishu permissions, OpenClaw will act under your user identity within the authorized scope, which may lead to high-risk consequences such as leakage of sensitive data or unauthorized operations. Please use with caution.

To reduce these risks, the plugin enables default security protections at multiple layers. However, these risks still exist. We strongly recommend that you do not proactively modify any default security settings; once relevant restrictions are relaxed, the risks will increase significantly, and you will bear the consequences.

We recommend using the Lark/Feishu bot connected to OpenClaw as a private conversational assistant. Do not add it to group chats or allow other users to interact with it, to avoid abuse of permissions or data leakage.

Please fully understand all usage risks. By using this plugin, you are deemed to voluntarily assume all related responsibilities.


**Disclaimer:**

This software is licensed under the MIT License. When running, it calls Lark/Feishu Open Platform APIs. To use these APIs, you must comply with the following agreements and privacy policies:

- [Feishu Privacy Policy](https://www.feishu.cn/en/privacy?from=openclaw_plugin_readme)
- [Feishu User Terms of Service](https://www.feishu.cn/en/terms?from=openclaw_plugin_readme)
- [Feishu Store App Service Provider Security Management Specifications](https://open.larkoffice.com/document/uAjLw4CM/uMzNwEjLzcDMx4yM3ATM/management-practice/app-service-provider-security-management-specifications)

- [Lark Privacy Policy](https://www.larksuite.com/user-terms-of-service)
- [Lark User Terms of Service](https://www.larksuite.com/privacy-policy)

## Requirements & Installation

- **OpenClaw**: this build targets the validated `2026.10.9` host.
- **Node.js**: the host requires `>=24.22.1 <25 || >=26.12.1`; validation used `26.12.1`.
- **pnpm**: `10.32.1`, as specified by `packageManager`.

### Build from source

```bash
git clone https://github.com/JPVIIIIIX/Openclaw-Lark-Compat.git
cd Openclaw-Lark-Compat
pnpm install --frozen-lockfile --ignore-scripts
pnpm typecheck
pnpm test
pnpm lint
pnpm format:check
pnpm build
```

The entry point is `dist/index.mjs`. No npm release is published. `private: true` prevents accidental npm publication; it does not restrict the public GitHub source. Back up the host program, configuration, state databases, and plugins before testing local plugin loading and real bot traffic in an isolated environment.

The upstream `bin/openclaw-lark.js` wrapper invokes the official Feishu installation tools. Running it or `npx @larksuite/openclaw-lark install` does not install this repository's compatibility build.

## Usage Guide

[How to Use the Official Lark/Feishu Plugin for OpenClaw](https://bytedance.larkoffice.com/docx/MFK7dDFLFoVlOGxWCv5cTXKmnMh)

## Contributing

Community contributions are welcome! If you find a bug or have feature suggestions, please submit an [Issue](https://github.com/JPVIIIIIX/Openclaw-Lark-Compat/issues) or a [Pull Request](https://github.com/JPVIIIIIX/Openclaw-Lark-Compat/pulls).

For major changes, we recommend discussing with us first via an Issue.

## License

This project is licensed under the **MIT License**. See [LICENSE](./LICENSE) for details.
