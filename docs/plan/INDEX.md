# 计划文档导航

> 开发任何 Phase 前，先读 [roadmap-v2.md](roadmap-v2.md) 对应阶段，再读相关 branch-*.md 详细设计。
> 已废弃文档归档在 [archived/](archived/)，仅供历史参考。

## 文档总览

| 文件 | 行数 | 用途 |
|------|------|------|
| [roadmap-v2.md](roadmap-v2.md) | ~1955 | **主路线图**。7 个 Phase（v0.16 → v0.22）的实施计划、阶段映射、勘误记录、执行纪律 |
| [branch-industry.md](branch-industry.md) | ~899 | 工业主线详细设计（5 阶段，资源/建筑/研究/职业/配方/升级 + 终局 hook） |
| [branch-mystic.md](branch-mystic.md) | ~1231 | 灵修主线详细设计（5 阶段 + 灵术/灵契/寂石冥想 + 终局 hook） |
| [branch-divine.md](branch-divine.md) | ~1145 | 神启副线总览（4 阶段 A-D + 神恩系统 + 仪式/占卜/6 神 占位设计） |
| [branch-divine-doctrine.md](branch-divine-doctrine.md) | ~959 | 神启-教团路（工业+神启的子文档：教令系统、圣堂圣战、神佑终局） |
| [branch-divine-mystery.md](branch-divine-mystery.md) | ~895 | 神启-秘仪路（灵修+神启的子文档：飞升阶梯、化神、飞升终局） |
| [branch-diplomat.md](branch-diplomat.md) | ~821 | 通达副线（4 阶段 A-D + 声望/邦交系统，主线无关，仅追加结局叙事） |

## AI 读取建议

文档体量较大但不拆分，原因：
1. AI 读取靠 `Grep ^##` 摸大纲 + `Read offset/limit` 精读章节即可
2. 拆分会引入"主+分"多文件同步负担，反而增加交叉一致性风险（roadmap-v2 §十五 54 条勘误就是单文件审计的成果）
3. 单 Phase 开发只需读对应阶段章节（200-400 行），不需要全文

**推荐读取流程**：
1. `Grep "^##" roadmap-v2.md` 摸大纲
2. `Read roadmap-v2.md offset=<阶段起始行> limit=200` 读阶段步骤
3. 按需 `Read branch-*.md offset=... limit=...` 读详细设计

## 按 Phase 索引

> roadmap-v2 §四–§十 按 Phase 1–7 顺序排列。各 branch 文档**不按 Phase 分章**，而是按内容类型分章（资源/建筑/研究/职业/配方/升级各表内有 `### A 阶段` / `### B 阶段` 子节）。开发某 Phase 时用 `Grep "### A 阶段"` 或 `Grep "Phase B"` 定位即可。

| Phase | 版本 | 主要范围 | roadmap-v2 章节 | 必读 branch 文档 |
|-------|------|---------|----------------|----------------|
| 1 | v0.16 | 治理奠基（政体/政策/典制改版） | §四 | （无 branch 涉及） |
| 2 | v0.17 | 双线觉醒（工业 A + 灵修 A） | §五 | branch-industry / branch-mystic（A 阶段子节） |
| 3 | v0.18 | 信仰与通商（4 线全激活 + 占卜 + 枯风口） | §六 | branch-industry / branch-mystic（B 阶段）+ branch-divine（A 阶段 + §十一仪式 + §十二占卜）+ branch-diplomat（A 阶段） |
| 4 | v0.19 | 分化之路（工业 C + 灵修 C + 神启分叉 + 通达邦交 + 6 神） | §七 | branch-industry / branch-mystic（C 阶段）+ branch-divine-doctrine + branch-divine-mystery（B 阶段）+ branch-divine §十三（6 神）+ branch-diplomat（B 阶段） |
| 5 | v0.20 | 深盟与成熟 | §八 | 各 branch D 阶段子节 |
| 6 | v0.21 | 远望（神启/通达完结） | §九 | 各 branch E/D 阶段子节 |
| 7 | v0.22 | 终局与轮回 | §十 | 各 branch 终局接口 hook 章节（branch-industry §十一 / branch-mystic §十八 / branch-diplomat §十二） |

## Phase 启动前检查（开发阻塞项）

| Phase | 必须先解决 |
|-------|----------|
| **Phase 3** | branch-divine §十一 仪式数值平衡 + §十二 占卜与神启耦合裁决 |
| **Phase 4** | ~~branch-divine §十三 6 神被动数值/专属仪式/教派定稿~~ ✅ 已补完（2026-05-06） |
| **Phase 5** | roadmap-v2 §十五 E53（寂渊契+寂石冥想无限循环防护）裁决 |

## 与代码的关系

| 模块 | 主要数据来源 |
|------|------------|
| `js/data.js` RD/BD/JD/UD/CD/UPGD | 各 branch-*.md 资源/建筑/职业/研究/配方/升级表 |
| `js/engine.js` 系统计算 | roadmap-v2 §十五 勘误项中的"待实施代码改动清单" |
| `js/ui.js` 页签结构 | roadmap-v2 §一 页签架构 |
