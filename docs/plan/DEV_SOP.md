# 开发执行 SOP（mulerun 必读）

> **每次开发前必读本文件**。本文档是 mulerun 接手开发时必须遵守的固定流程清单。
> 任何偏离本流程的行为都是错误。
>
> **配套 prompt 模板**：[DEV_PROMPTS.md](DEV_PROMPTS.md) — 复制粘贴启动开发循环的标准 Prompt A（执行）/ Prompt B（检查），含内容创作流程、阶段合规检查指令等附录。

---

## 〇、绝对纪律（不得违反）

1. **不得跨步骤跳跃**：必须按 [roadmap-v2.md §四 实施进度表](roadmap-v2.md) 中 ⏳ 标记的下一步做。
2. **不得跳过验收**：任何 `[ ] 验收` 项 fail，立刻停下排查，不要继续下一步。
3. **不得沉默选择**：遇到模棱两可、文档冲突、报错原因不明，立刻停下报告，不要 silently 选择一个方向继续。

> **git push 政策**：commit 完成 + 验收过即**自动 push**到 origin/master（单人项目，GitHub Pages 自动部署需要 push 才能让玩家看到）。例外：刚 commit 想 revert 时先报告。

> **关于修改设计文档**：必要时可以修改 roadmap-v2.md / branch-*.md（如发现冲突、勘误、或开发中需要细化设计）。但必须在 commit message 说明改了什么 + 原因，并保留最小必要范围。优先用 §十五 勘误表记录跨文档不一致。

---

## 一、开发开始前（必须按顺序）

### 1.1 读取上下文

按顺序读以下文件，建立认知：

1. [docs/plan/INDEX.md](INDEX.md) — 项目导航总览
2. [docs/plan/roadmap-v2.md](roadmap-v2.md) §四 实施进度表 — 找当前 ⏳ 任务
3. [docs/RULES.md](../RULES.md) §五 开发约定 + §七 文档维护 + §八 常见错误
4. 当前任务的"任务卡"（在 §四 内对应小节）

### 1.2 检查任务卡

任务卡格式：
- **状态**：必须是 ⬜ 未开始 或 ⏳ 进行中
- **前置**：所有标 ✅ 的依赖必须真的已完成（git log 确认 commit）
- **涉及文件清单**：你即将改的文件 + 行号
- **逐步执行**：照着做，不跳步
- **验收**：完成后逐项打勾

如果"前置"未满足，**立刻停下报告**，不要尝试自己做前置。

### 1.3 同步代码

```bash
git status
```

必须是 clean working tree（或仅你认识的本地未提交改动）。如有意外文件，停下报告。

---

## 二、执行中（每步骤循环）

### 2.1 改代码

按任务卡"逐步执行"列表中的**单一步骤**改代码：
- 用 Edit 工具改文件（不要 Write 整个覆盖）
- 严格按行号定位（任务卡给的行号 ±5 范围内找）
- 一次只改一处，改完保存

### 2.2 改 cache-buster（**仅当改了 JS 文件时**）

> **这是最容易忘的一步！90% 的"代码改了浏览器看不到"都是这个原因。**

打开 [index.html](../../index.html) 行 47-51，找到对应文件的 `?v=N`，**N 递增 1**：

```html
<script src="js/data.js?v=27"></script>      <!-- 改了 data.js 就 +1 -->
<script src="js/engine.js?v=15"></script>    <!-- 改了 engine.js 就 +1 -->
<script src="js/ui.js?v=19"></script>        <!-- 改了 ui.js 就 +1 -->
```

同 commit 内多次改同文件，递增一次即可。

### 2.3 验证当前步骤

调用 preview 工具：

```javascript
// 1. 重载浏览器
preview_eval(serverId, "window.location.reload()")

// 2. 检查 console 是否有错误（必须 0 错误）
preview_console_logs(serverId, level="error")

// 3. 验证当前步骤的预期效果（任务卡会指明）
preview_eval(serverId, "<验证表达式>")
```

**任何一项 fail（console 有错 / 验证表达式不符合预期）→ 停下排查**。常见原因见 §四。

### 2.4 进入下一步骤

只有 §2.3 全过才进入下一步骤。回到 §2.1。

---

## 三、提交（任务卡所有步骤完成后）

### 3.1 跑全部"验收"清单

任务卡末尾有 `[ ]` 清单。逐项打勾。**任何一项 fail → 停下排查，不要 commit**。

### 3.2 检查改动范围

```bash
git status --short
git diff --stat
```

确认：
- 改动文件与任务卡"涉及文件清单"一致（多了/少了都要解释）
- 没有意外的 `D .gitignore` / 巨型未提交内容（如 v0.16.0 那种 3000 行的）

### 3.3 commit

commit message 格式（按 git log 风格）：

```
<scope>: §四 <章节号> <简短摘要>

详细改动列表：
- <文件 1>: <改了什么>
- <文件 2>: <改了什么>

验证：
- ✅ 验收清单 1
- ✅ 验收清单 2
- ...

cache-buster: data:N→N+1, engine:M→M+1, ui:K→K+1（如适用）

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```

scope 取值：`engine`, `ui`, `data`, `docs`, `v0.16.X`（版本里程碑）

### 3.4 更新进度表

打开 [roadmap-v2.md §四 实施进度表](roadmap-v2.md)，把当前任务的：
- `状态` 从 ⏳ 改 ✅
- `commit` 列填入 SHA（git log -1 --format=%h）

把下一个 ⬜ 任务的状态改 ⏳。

### 3.5 自动 push

commit + 验收过 → 立刻 `git push origin master`。push 完报告：
```
已完成 §四 1.X
- commit SHA: <hash>
- 验收: 全过
- 进度表已更新
- 已 push 到 origin/master（GitHub Pages 自动部署中）
```

---

## 四、出问题的排查指引

| 症状 | 第一反应 | 90% 解法 |
|------|---------|---------|
| 浏览器看不到改动效果 | 检查 cache-buster | 递增 `?v=N`，再 reload |
| `X is not defined` | grep `function X` 找定义位置 | 函数被删了/没加载顺序错 |
| `Cannot read property of undefined` | 加 `?.` 链式访问 | 字段在 migrate 没初始化 |
| 旧存档进入崩溃 | 看 migrate() 是否覆盖新字段 | 加 `if (!G.x) G.x = ...;` |
| 验证表达式 false 但代码对 | `rTC.toString().includes(...)` 看是否旧版 | 浏览器没加载新代码（cache） |
| 改坏了想撤销 | `git diff` 看改动 → `git checkout HEAD -- <文件>` | 仅当未 commit |

### 四.1 cache-buster 总是首选排查

修了 JS 但浏览器不更新 → 99% 是没递增 `?v=N`。

### 四.2 数据结构冲突

设计文档（branch-*.md 设计表）和代码（data.js 实现）对不上时：
- **永远以 branch-*.md 设计表为准**
- 看 branch-*.md 顶部"过时警告"块，明确双轨情况
- 不要直接复制代码 ID 到设计表

详见 [RULES §七.7/七.8](../RULES.md)。

### 四.3 实在不会处理

**停下报告**。格式：
```
卡在 §四 1.X 步骤 N
- 症状：<console 报错全文 / 验证表达式输出>
- 我尝试了：<列出尝试过的解决方案>
- 怀疑：<我的猜测>
- 需要帮助
```

---

## 五、终止条件

完成一个任务卡（包括 commit + 进度表更新 + 报告），**停下**。
**不要**继续做下一个任务，等人类下一步指令。

例外：人类明确说"做完 1.3 后继续做 1.4"，才可连续做。
