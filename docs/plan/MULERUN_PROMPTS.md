# mulerun 标准 prompt（每次开发循环复制粘贴）

> 把 mulerun 当成新手贡献者：明确指令 + 明确边界 = 减少错误。
> 工作流：**[Prompt A 执行] → [Prompt B 检查] → 人类 review → push → 进入下一轮**

---

## 🅰 Prompt A：执行下一个任务

复制下面整段发给 mulerun：

```
按 docs/plan/DEV_SOP.md 流程，执行 docs/plan/roadmap-v2.md §四-§十 中
下一个 ⏳ 任务（或当前 ⏳ 进行中任务）。

阅读顺序（不可跳）：
1. docs/plan/INDEX.md
2. docs/plan/roadmap-v2.md
   - §三 阶段总览（确认当前 phase）
   - 当前 phase 章节内的实施进度表 + 对应任务卡
3. docs/plan/DEV_SOP.md
4. docs/RULES.md §五 + §七 + §八
5. 任务涉及的 branch-*.md 章节（按任务卡"涉及文件清单"推断）

执行要求：
- 检查任务卡"前置"全部 ✅，否则停下报告
- 严格按"逐步执行"改代码，行号 ±5 范围内定位
- 改 JS 必须递增 index.html 的 ?v=N（RULES §五.9）
- 启动验证服务：preview_start "fox-hollow"（端口冲突自动换，别杀外部进程）
- 多步骤（≥3 步）任务用 TodoWrite 跟踪
- 改完跑"验收"清单全过才 commit
- 验收必须包含：
  1. console 无 error（preview_console_logs level=error）
  2. 旧存档加载不崩（如改了 G 字段，验证 migrate）
  3. preview_eval 跑任务卡指定的验证表达式
  4. 任务卡内每个 [ ] 项都打 ✅
- commit message 按 RULES §八.5 4 要素：
  (1) scope: 章节号 摘要
  (2) 改动列表（按文件分组）
  (3) 验证清单 ✅
  (4) cache-buster 版本号（如适用）
- 不主动 git push
- 不跨步骤跳跃
- 不修复任务卡之外的 bug（发现就报告，不动手；hotfix 走单独 prompt）
- 遇到 RULES §八.2 的 6 个停下场景立即停下报告

完成后报告（用以下格式）：
- 任务卡章节号（如 §七 4.6）
- commit SHA
- 验收清单逐项结果（✅/❌）
- 偏离任务卡的改动（如有，原因）
- 期间发现的、未触动的 unrelated 问题（列清单等待人审）
- 等待"检查"指令

不要继续做下一个任务。停下等检查。
```

---

## 🅱 Prompt B：检查上一步成果

执行后跑这段：

```
对刚刚完成的 commit 做合规检查（仅检查并报告，不要自动修复）。

检查项：

1. commit 合规
   - 跑 git log -1，看 message 是否含 RULES §八.5 的 4 要素：
     scope: 章节号 + 摘要 / 改动列表 / 验证清单 / cache-buster
   - 跑 git show <SHA> --stat，看改动文件是否限于任务卡"涉及文件清单"
   - 改动行数是否在任务卡估算 ±20% 内

2. 代码合规
   - preview_eval window.location.reload()
   - preview_console_logs level=error，必须 0 错误
   - 任务卡"验收"清单逐项 preview_eval 验证（每项要给具体输出）
   - 旧存档兼容（如有 migrate 改动，验证旧版本字段不崩）

3. 文档同步
   - roadmap-v2.md §四 进度表：当前任务状态 ⏳→✅，commit SHA 已填
   - 下一个任务状态从 ⬜→⏳（提示下一步）
   - 设计文档（branch-*.md）相关改动是否同步
   - 跨文档命名一致性（grep 关键 ID 看是否散落不一致）
   - 版本里程碑级才需要 changelog 条目

4. 报告（用以下格式）：
   - ✅ 全过 → 写"通过，等待 push 后进入下一步"
   - ❌ 有问题 → 列出每个问题 + 严重度（🔴 阻塞 / 🟡 警告 / 🔵 建议）
     由人类决定如何处理

不要自动修复。不要进入下一个任务。
```

---

## 使用方式

### 标准循环

```
你（人类）：[复制 Prompt A 发给 mulerun]
  ↓
mulerun：执行任务 → 报告 commit SHA + 验收
  ↓
你：[复制 Prompt B 发给 mulerun]
  ↓
mulerun：检查 → 报告通过 / 列出问题
  ↓
你（如通过）：检查 mulerun 报告 → git push（人类操作）
你（如有问题）：人工修 / 让 mulerun 修特定问题 / 决定下一步
  ↓
[发 Prompt A 进入下一轮]
```

### 例外场景

| 场景 | 操作 |
|------|------|
| mulerun 在 Prompt A 阶段就停下报告问题 | 不发 Prompt B，先解决问题 |
| Prompt B 发现 🔴 阻塞 | 让 mulerun 修：发"修复 B 报告中的问题 N，仅修这一项，其他不动" |
| 多个步骤需要连做 | 每步骤都走完整 A→B→push 循环，不要并行 |
| 发现 bug 不在任务卡范围 | 单独发 prompt："hotfix：<bug 描述>，单独 commit，不修改任何任务进度" |

---

## 给 mulerun 的额外提醒（可选附在 Prompt A 末尾）

如果 mulerun 表现不稳定，可在 Prompt A 末尾加这段：

```
特别提醒：
- 不知道某个文件的当前内容时，先 Read 再 Edit
- 改 JS 后立即递增 ?v=N，否则浏览器缓存旧版
- 若发现代码 ID 与设计表不一致，先看 branch-*.md 顶部"过时警告"
- 不会处理时停下报告，不要凭猜测继续
- 输出验证表达式时，preview_eval 的字符串不能太长（保持单条 ≤500 字符）
```

---

## 进度表更新示例

mulerun 完成 1.3 后应该这样更新 [roadmap-v2.md §四 进度表](roadmap-v2.md)：

```markdown
| 1.0/1.1/1.2 | 议事录废弃 + ... | ✅ 已完成 | c11920d | §四 1.0/1.1/1.2 |
| 1.3 | POLITY/POLICY 数据结构重写 | ✅ 已完成 | <新 SHA> | §四 1.3 |     ← 状态 ⏳→✅，填 SHA
| **1.4** | **Tier 路线树 UI** | ⏳ **下一步** | - | §四 1.4 |              ← 下一个 ⬜→⏳
| 1.5 | 研究链前置调整 | ⬜ 未开始 | - | §四 1.5 |
```
