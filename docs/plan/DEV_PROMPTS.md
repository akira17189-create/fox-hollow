# 开发循环 prompt 模板（复制粘贴给 AI agent）

> 把接手开发的 AI（mulerun / Claude Code / Codex / 其他）都当成新手贡献者：明确指令 + 明确边界 = 减少错误。
> 工作流：**[Prompt A 执行] → [Prompt B 检查] → 人类 review → push → 进入下一轮**
> 配套规则文档：[DEV_SOP.md](DEV_SOP.md)（开发流程纪律）+ [../RULES.md](../RULES.md)（协作规则）

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

## 附录 1：内容创作流程（接外部 LLM）

> 适用：事件池扩充、叙事文本批量生成等"创意密度高、成本敏感"的任务。
> 例：phase 4.6 山谷见闻事件包（69 条 = 23 槽 × 3 文风候选）。

### 工作流

```
1. 写 prompt 模板 → tools/prompts/<task-name>.md
2. 跑 tools/multi-model-query.py 并发调多个金山云模型
   - 命令: KSYUN_API_KEY=xxx python -u tools/multi-model-query.py \
           tools/prompts/<task-name>.md --serial
   - 输出: tools/output/<timestamp>_<model>.md（每模型一份）
3. 用户同时给某些网页 LLM（kimi/元宝/deepseek 网页）发同一 prompt 收回
4. 我合并所有候选 → 按硬约束打分挑选 → 写入对应 JS 数组
5. cache-bust + 浏览器实测 + commit
```

### prompt 模板的硬约束部分必须包含

- **角色级硬规则**（如狐狸用"它"，禁"他/她/他们/她们"）
- **风格示例**（每种风格 1-2 条仿写，避免抽象描述）
- **禁词列表**（"突然/忽然/能量/神奇/无比" 等）
- **物件具体**列表（年轮/卷轴/爪印 等具象词，避免"美丽景象"）
- **资源/建筑 ID 速查表**（精确到代码里的 ID 名）
- **字数硬上下限**（如 40-100 字）
- **禁止总结尾巴**（不写"这是好兆头"）
- **输出格式硬约束**（`{ t: '...', sb: 'D', ... }` JS 字面量，可直接粘贴）

### 模型选择

| 模型类别 | 特征 | 推荐场景 |
|---|---|---|
| `deepseek-v4-flash` | 非推理，平衡，~80s 出 9K tokens | 默认主力 |
| `mimo-v2.5-pro` | 推理少（~18 tokens），快 | 第二候选 |
| `glm-5.1` | 快、轻 | 备用候选 |
| `kimi-k2.5` / `qwen3-235b-a22b-thinking` | 重推理，30 min 易超时 | 默认禁用 |
| `deepseek-v4-pro` / `kimi-k2.6` | 重推理 | 默认禁用 |

multi-model-query.py 的 `MODELS` 列表已固定为前 4 个。重推理模型不能并发跑（互相争 reasoning_content 配额会全部超时）。

### 挑选规则

1. **硬约束过滤**：踩禁词、用错代词、夹英文 ID、超长太多的直接淘汰
2. **风格区分**：每槽位每风格至少留 1 条，3 种风格不重复
3. **改写优先级**：能改写就改写（如把"星图阁"统一为"灵图阁"），不能改写才整条丢
4. **门控自洽**：t 文本提到的副线建筑必须出现在 uq.b 里（避免叙事突兀，参考 phase 4.6 邦交 5 条修复）

---

## 附录 2：合规检查指令（Prompt B 增强版）

> 比正文 Prompt B 多 3 项检查，本次 phase 4 收尾用。

复制下面发给 mulerun（替换 §X.Y 为实际章节号）：

```
对刚才完成的任务（§X.Y）做合规检查然后修复（不止报告）：

1. 代码合规
   - node syntax check 所有 JS 文件
   - preview 硬刷新主页（location.reload）→ preview_console_logs level=error 必须 0
   - 任务卡"验收"清单逐项 preview_eval 验证（已跑过的复核摘要即可）
   - 旧存档兼容（如改 G 字段或 schema → 检查 migrate 函数补全字段）

2. 文档同步
   - roadmap-v2 当前阶段（§三 阶段总览定位）进度表：状态 ⏳→✅ + 填了 commit SHA
   - 验证 SHA 真实存在（git cat-file -e <sha>）
   - 设计文档（branch-*.md）若有相关改动是否同步
   - 跨文档关键 ID 一致性（grep 主要建筑/资源/职业 ID 看代码 vs 文档）
   - 版本里程碑级（v0.X 整数）才需要 changelog 条目

3. 未跟踪文件
   - git status 看 ?? 项，每项决定：commit / .gitignore / 本地保留
   - 浏览器 MCP 副产物 (.playwright-cli/) 应进 .gitignore
   - LLM 输出缓存 (tools/output/) 应进 .gitignore
   - 用户备份 zip 应进 .gitignore
   - dev server 配置 (.claude/launch.json) 应 commit

发现问题就修，修完一起 commit。
```

### 与正文 Prompt B 的差异

| 项 | 正文 B | 附录 B |
|---|---|---|
| 章节号 | 硬编码"§四进度表"（phase 1） | "当前阶段进度表"（按 §三 定位）|
| SHA 真实性 | 不验证 | 验证 git cat-file -e |
| 未跟踪文件 | 不检查 | 检查 + 决定处置 |
| 行为模式 | 仅报告等人审 | 自动修复 |
| 适用场景 | 单步任务结尾 | 整阶段（如 phase 4）收尾 |

正文 Prompt B 适合"一个任务卡跑完后做闸门"，附录 B 适合"整个阶段收尾时的总体审计"。

---

## 进度表更新示例

mulerun 完成 1.3 后应该这样更新 [roadmap-v2.md §四 进度表](roadmap-v2.md)：

```markdown
| 1.0/1.1/1.2 | 议事录废弃 + ... | ✅ 已完成 | c11920d | §四 1.0/1.1/1.2 |
| 1.3 | POLITY/POLICY 数据结构重写 | ✅ 已完成 | <新 SHA> | §四 1.3 |     ← 状态 ⏳→✅，填 SHA
| **1.4** | **Tier 路线树 UI** | ⏳ **下一步** | - | §四 1.4 |              ← 下一个 ⬜→⏳
| 1.5 | 研究链前置调整 | ⬜ 未开始 | - | §四 1.5 |
```
