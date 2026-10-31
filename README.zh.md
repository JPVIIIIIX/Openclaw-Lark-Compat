# Openclaw-Lark-Compat｜飞书官方插件兼容适配版

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/Node.js-26.12.1-blue.svg)](https://nodejs.org/)

[English](./README.md) | 中文版

本项目基于飞书开放平台团队开发的 [OpenClaw 官方 Lark/飞书插件](https://github.com/larksuite/openclaw-lark)，针对新版本 OpenClaw 进行兼容适配。保留官方版的飞书功能和交互设计，重点修复 SDK 入口、运行时配置、命令授权以及会话指标读取的兼容问题。

**这是独立维护的兼容适配版，并非飞书官方发布版本，也不代表飞书或 Lark 官方。** README 的结构和功能介绍沿用上游，原版权声明与 MIT 许可证予以保留。

## 兼容适配状态

- 当前验证宿主：**OpenClaw 2026.10.9**；验证运行时：**Node.js 26.12.1**。
- 基于官方源码提交 [`dde0be3`](https://github.com/larksuite/openclaw-lark/commit/dde0be3680d6fd5443cab426c8f4b3216266346a)，命令授权迁移参考 [上游 PR #638](https://github.com/larksuite/openclaw-lark/pull/638)。
- 本地验证：460 项测试通过，类型检查、格式检查和构建通过；ESLint 无错误。
- 5,120 组授权输入与旧版宿主实现比较，结果一致；隔离注册检查覆盖 39 个工具、4 个聊天命令，未发起网络请求。
- 2026-10-30 真实验收通过：私聊收发、模型驱动的流式卡片、OAuth、文档创建/读取/追加、多维表格记录增删改查。详见[验收范围与限制](./ACCEPTANCE.md)。

下面列出的功能来自飞书官方插件；未列入已验收范围的功能及其他宿主版本仍未验证。

## 特性

本插件为 OpenClaw 提供了全面的 Lark/飞书集成能力，主要包括：

| 类别 | 能力 |
|------|------|
| 💬 消息 | 消息读取（群聊/单聊历史、话题回复）、消息发送、消息回复、消息搜索、图片/文件下载 |
| 📄 文档 | 创建云文档、更新云文档、读取云文档内容 |
| 📊 多维表格 | 创建/管理多维表格、数据表、字段、记录（增删改查、批量操作、高级筛选）、视图 |
| 📈 电子表格 | 创建、编辑、查看电子表格 |
| 📅 日历日程 | 日历管理、日程管理（创建/查询/修改/删除/搜索）、参会人管理、忙闲查询 |
| ✅ 任务 | 任务管理（创建/查询/更新/完成）、清单管理、子任务、评论 |

此外，插件还支持：
- **📱 交互式卡片**：实时状态更新（思考中/生成中/完成状态），提供敏感操作的确认按钮
- **🌊 流式回复**：在消息卡片中提供实时的流式响应
- **🔒 权限策略**：为私聊和群聊提供灵活的访问控制策略
- **⚙️ 高级群组配置**：每个群聊的独立设置，包括白名单、技能绑定和自定义系统提示词

## 安全与风险提示（使用前必读）
本插件对接 OpenClaw AI 自动化能力，存在模型幻觉、执行不可控、提示词注入等固有风险；授权飞书权限后，OpenClaw 将以您的用户身份在授权范围内执行操作，可能导致敏感数据泄露、越权操作等高风险后果，请您谨慎操作和使用。
为降低上述风险，插件已在多个层面启用默认安全保护以降低上述风险，但上述风险仍然存在。我们强烈建议不要主动修改任何默认安全配置；一旦放开相关限制，上述风险将显著提高，由此产生的后果需由您自行承担。
我们建议您将接入 OpenClaw 的飞书机器人作为私人对话助手使用，请勿将其拉入群聊或允许其他用户与其交互，以避免权限被滥用或数据泄露。
请您充分知悉全部使用风险，使用本插件即视为您自愿承担相关所有责任。

**免责声明：**

本软件的代码采用MIT许可证。
该软件运行时会调用Lark/飞书开放平台的API，使用这些API需要遵守如下协议和隐私政策：

- [飞书用户服务协议](https://www.feishu.cn/terms)
- [飞书隐私政策](https://www.feishu.cn/privacy)
- [飞书开放平台独立软件服务商安全管理运营规范](https://open.larkoffice.com/document/uAjLw4CM/uMzNwEjLzcDMx4yM3ATM/management-practice/app-service-provider-security-management-specifications)
- [Lark用户服务协议](https://www.larksuite.com/user-terms-of-service)
- [Lark隐私政策](https://www.larksuite.com/privacy-policy)

## 安装与要求

- **OpenClaw**：本适配版限定已验证的 `2026.10.9`。
- **Node.js**：宿主要求 `>=24.22.1 <25 || >=26.12.1`，本项目使用 `26.12.1` 验证。
- **pnpm**：`10.32.1`（由 `packageManager` 字段指定）。

### 从源码构建

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

构建入口为 `dist/index.mjs`。本仓库暂未发布 npm 包，`private: true` 仅防止误发布 npm，不影响 GitHub 公开开源。实际接入前请备份宿主程序、配置、状态库与插件，并在隔离环境验证本地插件加载及机器人收发。

上游 `bin/openclaw-lark.js` 安装器仍调用飞书官方安装工具；运行它或 `npx @larksuite/openclaw-lark install` 不等于安装本仓库的兼容构建。

## 使用说明
[OpenClaw  Lark/飞书官方插件使用指南](https://bytedance.larkoffice.com/docx/MFK7dDFLFoVlOGxWCv5cTXKmnMh)

## 贡献

我们欢迎社区的贡献！如果你发现 Bug 或有功能建议，请随时提交 [Issue](https://github.com/JPVIIIIIX/Openclaw-Lark-Compat/issues) 或 [Pull Request](https://github.com/JPVIIIIIX/Openclaw-Lark-Compat/pulls)。

对于较大的改动，我们建议你先通过 Issue 与我们讨论。

## 许可证

本项目基于 **MIT 许可证**。详情请参阅 [LICENSE](./LICENSE) 文件。

## OpenClaw 2026.10.9 流式回复配置

在独立宿主配置中合并以下设置，保留现有凭据与访问策略：

```json
{
  "messages": { "visibleReplies": "automatic" },
  "channels": { "feishu": { "replyMode": "streaming", "streaming": true } }
}
```

`messages.visibleReplies` 是宿主全局设置，也会影响其他通道。宿主采用 `message_tool` 投递时，模型调用消息工具一次性发出整段内容，绕过插件的流式回复处理。设为 `automatic` 后，常规模型回复会关联原消息，并在白色卡片中逐步更新；显式调用消息工具仍属于独立发送。

若模型本身连接失败，先检查模型登录和网络。本次机器需要使用已有代理访问模型端点；代理地址与凭据取决于本机环境，不包含在仓库中。
