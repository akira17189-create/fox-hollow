# 狐狸谷阶段制开发路线图 v2（v0.16 → v0.22）

> **基线**: v0.15.1 已完成（文化经济循环）。本文档取代原 roadmap.md 的线性版本号规划，改为**阶段制**。
>
> **占位规则沿用**: 所有未审核命名以 `「占位」` 标记。命名禁区：避开猫国专属术语。
>
> **核心原则**: 每个阶段结束时，无论玩家选什么路线，都有**等量的新内容**可玩。

### 开发规则

1. **不写短句（tip）**：除非明确要求，实现步骤时不主动编写 tip 短句/风味文字。
2. **遇到问题或抉择先查猫国百科**：设计不确定时优先参考 `reference/` 目录下的猫国建设者百科，作为机制设计的第一参照源。
3. **兼容游戏逻辑与资源体系**：所有新增内容必须与现有引擎机制、资源生产消耗链、UI 渲染逻辑保持兼容。
4. **经济模型参照猫国**：实际花费走通用资源（卷轴+铜钱+古币），天然有机会成本。

---

## 一、页签架构（8 页签定局）

<!-- SECTION: tab-architecture -->

| # | 页签 ID | 初始名 | 后期名（称谓演进） | 内容范围 | 解锁条件 |
|---|---------|--------|-------------------|----------|----------|
| 1 | `b` | 营火 | 广场 → 中心 | 采集、灵术/仪式施放、基础操作 | 始终可用 |
| 2 | `v` | 村落 | 城邦 → 国度 | 建筑建造、职业分配 | 始终可用 |
| 3 | `c` | 工坊 | 匠堂 → 万工殿 | 工艺配方 | 始终可用 |
| 4 | `r` | 研究 | 学宫 → 学院 | 研究树 | 始终可用 |
| 5 | `f` | 宗教 | 宗教 | 信仰/虔诚、神恩、仪式、神祇、飞升 | 阶段三解锁 |
| 6 | `w` | 山外 | 四方 → 天际 → 星途 | 远行、外交、种族关系 | beyondValley 研究「未定义」 |
| 7 | `k` | 典制 | 邦制 → 社稷 | 习俗、政体、政策 | folkLore 研究「未定义」 |
| 8 | `a` | 成就 | — | 全部成就（已解锁 / 未解锁），按阶段分组 | 始终可用 |

### 称谓演进触发点

| 触发条件 | 营火→ | 村落→ | 工坊→ | 山外→ | 典制→ |
|----------|-------|-------|-------|-------|-------|
| 人口 ≥ 50 且政体已选（阶段一末） | 广场 | 城邦 | — | 四方 | 邦制 |
| 工业/灵修 Phase B 完成（阶段三） | — | — | 匠堂 | 天际 | — |
| 终局阶段触发（阶段七） | 中心 | 国度 | 万工殿 | 星途 | 社稷 |

### 页签变更说明

**原 `g` 议政页签 → 废弃**，政治内容并入 `k` 典制页签。理由：
1. 典制（习俗 + 社会制度）与政治（政体 + 政策）同属"社会治理"维度，合并后玩家心智模型更统一
2. 释放一个页签位给**宗教**——信仰系统体量大（神恩 + 6 神 + 仪式池 + 教团/秘仪分叉），值得独立页签
3. 参考猫国建设者：Religion 是独立页签，政策挂在 village/workshop 下

**典制页签内部分区**（阶段一落地时实施）：
- **上区：习俗**（已有 10 张卡片，不变）
- **下区：治理**（政体选择 + 政策树，原议政内容迁入）

**宗教页签内部分区**（阶段三落地时实施）：
- **上区：神恩**（虔诚/圣油存量 + 神恩加成实时显示）
- **中区：信仰建筑**（祭坛/经阁/祈愿池等，从村落页签分离出来）
- **下区：仪式**（消耗虔诚/圣油的主动施放）

**成就页签 `a` 新增说明**（v0.18.x 后期决议，原"7 页签定局"已扩至 8）：
1. 跨阶段系统（§十一）。成就总量预计 70-105（10-15/阶段 × 7 阶段，§十六 第 8 条），独立分页比"典制底部/浮窗"更适合一览
2. 始终可用，便于玩家从开局就看到锁定列表（已解锁的有时间戳，未解锁的展示名称+描述+解锁条件）
3. 实现完全基于 §五 2.9 已落地的 `ACHIEVEMENT_DATA` + `G.achievements`，仅替换 UI 入口
4. 内部布局详见 §十一 成就系统

---

## 二、规划总量（来自各 branch 文档）

<!-- SECTION: planning-totals -->

> 历史的"已有代码资产盘点"+"关键缺口"小节随 v0.16 → v0.19 多轮迭代严重过时（"未定义"项几乎全部已实装），已删除避免误导。
>
> **当前实装量**：参照 [changelog.md](../changelog.md) 与 §四 ~ §十 各阶段实施进度表，或运行时执行：
> ```js
> // 浏览器控制台运行
> Object.values(BD).filter(b=>b.br==='I').length    // 工业建筑数
> Object.values(UPGD).filter(u=>u.br==='I'&&!u.sb).length  // 工业升级数
> ```
>
> **快照（v0.18 实装）**：工业 23 建筑 / 8 职业 / 34 研究 / 16 配方 / 78 升级；灵修 18 建筑 / 7 职业 / 31 研究 / 17 配方 / 78 升级；神启 13 建筑 / 14 研究 / 8 配方；通达 7 建筑 / 8 研究 / 30 升级；政治 2 建筑 / 4 研究。
>
> 下文"分支规划总量"为各 branch doc 设计的**最终目标**（Phase A-E 全部完成）——与上方实装量的差额即为待开发内容。

### 分支规划总量（含已有 + 未实现）

> 以下数据来源于各分支详细设计文档，代表最终目标规模。

#### 工业分支（主线）— 详见 [branch-industry.md](branch-industry.md)

| 维度 | 目标总量 |
|------|---------|
| 新资源 | 27 个（煤/钢/火油/寒钛/辉石/重晶 + 中间材料 + 太空材料） |
| 新建筑 | 29 个（5阶段产出 + 太空9 + 治理4 + 存储3） |
| 新配方 | 22 个（基础加工→高级合金→太空燃料→终局材料） |
| 新职业 | 8 个（深层矿工→炉匠→钻井工→机师→工程师→精炼师→辉能士→星匠） |
| 新研究 | 59 个（5阶段科技树） |
| 新升级 | 135 个（工具/产出/存储/消耗/自动化/跨系统 6 类） |
| 独占机制 | 污染/治理（硬惩罚阶梯）、能量产消平衡、灰雾事件 |
| 终局 | 太空（+神启仍太空，+通达仍太空，通达仅增加结局叙事） |
| 终局接口 | 6 个 hook point 预留副线覆写（见 branch-industry.md） |

#### 灵修分支（主线）— 详见 [branch-mystic.md](branch-mystic.md)

| 维度 | 目标总量 |
|------|---------|
| 新资源 | 27 个（灵能/命丝/共振子/晶丝/元念 + 中间材料 + 星童终局材料） |
| 新建筑 | 35 个（5阶段产出14 + 治理4 + 存储2 + 系统3 + 任务12） |
| 新配方 | 27 个（基础织造→高级结晶→终局凝聚） |
| 新职业 | 9 个（感应者→织丝人→共鸣师→悟者→酿灵师→化形师→深寂士→契灵使→灵匠） |
| 新研究 | 63 个（5阶段科技树） |
| 新升级 | 155 个（感应/产出/存储/消耗/自动化/跨系统 6 类 + 灵契/冥想专项） |
| 新灵术 | 18 个（灵修独占，含寂石冥想+灵契祈愿） |
| 独占机制 | 躁念/灵脉（硬惩罚阶梯）、灵契系统（5种选1可切换）、寂石冥想（时间跳跃）、心魔事件 |
| 终局 | 灵迁（+神启→神升，+通达仍灵迁，通达仅增加结局叙事） |
| 终局接口 | 8 个 hook point 预留副线覆写（见 branch-mystic.md） |

#### 神启分支（副线，4阶段 A→D）— 详见 [branch-divine.md](branch-divine.md)

| 维度 | 目标总量 |
|------|---------|
| 新资源 | 教团路 8 个（虔诚/圣油 + 圣火/圣铁(B) + 颂咏/圣骸/圣典(C) + 神谕(D)）；秘仪路 8 个（虔诚/圣油 + 神露/秘知(B) + 神墨/化神石/禁典(C) + 神格(D)）；holyIron（教团B资源） |
| 新建筑 | 22 个/路径（教团: 3共通A + 6B + 8C + 5D；秘仪: 3共通A + 4B + 8C + 5D + 2治理） |
| 新研究 | 35 个/路径（教团: 4A+6B+12C+13D；秘仪: 4A+5B+12C+14D） |
| 新职业 | 6 个/路径（祭司(共通) + 狂信者/圣工匠(B) + 高阶职业(C-D)） |
| 新配方 | 15 个/路径（1共通 + 5B + 5C + 4D） |
| 新升级 | 100 个/路径（10共通A + 20B + 35C + 35D） |
| 独占机制 | 神恩系统（sqrt全局加成）、教令系统(教团)、飞升阶梯(秘仪) |
| 终局影响 | 灵修主线→改终局为神升；工业主线→不改终局 |

#### 通达分支（副线）— 详见 [branch-diplomat.md](branch-diplomat.md)

| 维度 | 目标总量 |
|------|---------|
| 新资源 | 6 个（声誉/信物 + 邦书/异珍 + 盟印 + 共谷契） |
| 新建筑 | 14 个（3A+4B+4C+3D）+ 已有商驿/驿道/瞭望塔 |
| 新研究 | 27 个（4A+5B+10C+8D） |
| 新职业 | 4 个（使者/邦交官/盟约使/大盟主） |
| 新配方 | 11 个（1A+3B+4C+3D） |
| 新升级 | 75 个（10A+20B+25C+20D） |
| 独占机制 | 声望系统（sqrt加成，仅作用于副线资源）、邦交系统（7族×5级深度） |
| 终局影响 | **不改变任何终局**，仅在结局画面增加通达专属叙事段落 |

> 通达体系在任意主线下运作一致，Phase A-D 不分流。工业和灵修玩家走同一套资源链、同一套建筑、同一套邦交系统。所有内容仅标 `sb: 'T'`，不需要 `br: 'M'`/`br: 'I'` 主线门控。

### 主线 × 副线组合模型（8 种可能）

| # | 主线 | 神启 | 通达 | 风格描述 | 终局 |
|---|------|------|------|---------|------|
| 1 | 工业 | — | — | 纯工业，造物科技一路推 | 太空 |
| 2 | 工业 | ✓ | — | 工神：工业 + 信仰加持 | 太空 |
| 3 | 工业 | — | ✓ | 工通：工业 + 外交贸易 | 太空 |
| 4 | 工业 | ✓ | ✓ | 全开工业线 | 太空 |
| 5 | 灵修 | — | — | 纯灵修，玄术循环 | 灵迁 |
| 6 | 灵修 | ✓ | — | 灵神：玄术 + 宗教双修 | 神升 |
| 7 | 灵修 | — | ✓ | 灵通：玄术 + 外交协作 | 灵迁 |
| 8 | 灵修 | ✓ | ✓ | 全开灵修线 | 神升 |

> **终局规则**:
> - 神启仅在灵修主线下改变终局（灵修+神启 = 神升，工业+神启 = 仍太空）
> - 通达不改变任何终局，仅增加结局叙事段落
> - 玄空/共谷终局条件见§九 6b（待裁决是否保留）

### 副线解锁机制

| 副线 | 解锁方式 | 关闭条件 |
|------|---------|---------|
| 神启 | 研究「神启之学」(divineLore) 激活 `G.subBranch.D = true` | 无（一旦开启不可关） |
| 通达 | 外交政策域选"通达"解锁 `G.subBranch.T = true` | 选"闭谷"则不开（闭谷有内政加成：基础资源 +5%，建筑花费 -3%） |

> 副线与主线无互斥关系。可不开任何副线（纯工业/纯灵修），也可两条都开。
> 开副线有**分散成本**（资源/人口投入到副线系统中，主线推进变慢）。

---

## 三、阶段总览

<!-- SECTION: phase-overview -->

> **核心约束**: 每条活跃内容线在每个阶段都推进，无任何线连续 2 个阶段空转。

### 阶段×内容矩阵

| 阶段 | 工业 | 灵修 | 神启 | 通达 | 核心系统 |
|------|------|------|------|------|---------|
| Phase 1 | — | — | — | — | 政体/政策/典制改版 |
| Phase 2 | 煤钢基础 | 灵能基础 | — | — | 择路+能量/灵脉+污染/内乱 |
| Phase 3 | 油火蒸汽 | 共振深灵 | 宗教奠基 | 声誉初交 | 宗教页签+占卜+枯风口 |
| Phase 4 | 精金自动化 | 结晶化形 | 教团/秘仪展开 | 结邦邦交 | 6 神选定 |
| Phase 5 | 辉能 | 深寂灵契 | 信仰深化 | 深盟 | 邦交深度 3-4 |
| Phase 6 | 太空前半 | 灵途前半 | 终局整合 | 共谷 | 终局准备 |
| Phase 7 | 太空后半 | 灵途后半 | — | — | 5 终局+轮回 |

> Phase 3 起 4 条线全部激活，此后每阶段均齐步推进至各自终点。
> 神启在 Phase 6 完成（4 阶段 A-D），通达在 Phase 6 完成（4 阶段 A-D），Phase 7 仅收束主线终局。

### 分支文档 Phase ↔ Roadmap 阶段映射

> 主线（工业/灵修）5 个 Phase 跨 6 个 Roadmap 阶段；副线（神启/通达）4 个 Phase 各占 4 个 Roadmap 阶段，1:1 对应。
> 主线之所以不是 1:1，是因为**等深对齐**原则要求两条主线同步推进——工业代码远多于灵修，需用阶段门控压住已有内容，避免单线暴走。

| 分支文档 Phase | Roadmap 阶段 | 延后/拆分原因 |
|---|---|---|
| 工业 A | **Phase 2**（基础 4 建筑）+ Phase 3（steelVault/forging/concreteTech 延后） | 等深对齐：代码已有 5 建筑但灵修 A 只有 4，压住 steelVault |
| 工业 B | **Phase 3**（油井/蒸汽前段）+ Phase 4（factory/assemblyLine/roadwork 延后） | 等深对齐 + 能量系统激活节奏 |
| 工业 C | **Phase 4** | 完整 |
| 工业 D | **Phase 5** | 完整 |
| 工业 E | **Phase 6**（任务 1-4）+ **Phase 7**（任务 5-8 + 终局） | 太空任务分两批，控制终局节奏 |
| 灵修 A | **Phase 2**（基础 4 建筑）+ Phase 3（inscription/spiritInk/sigil 延后） | 等深对齐：与工业同步 |
| 灵修 B | **Phase 3**（共振前段）+ Phase 4（部分延后） | 等深对齐 |
| 灵修 C | **Phase 4** | 完整 |
| 灵修 D | **Phase 5** | 完整（含灵契+寂石冥想） |
| 灵修 E | **Phase 6**（任务 1-4）+ **Phase 7**（任务 5-8 + 终局） | 同工业 |
| 神启 A | **Phase 3** | 完整（宗教页签+虔诚+神恩） |
| 神启 B | **Phase 4** | 完整（教团/秘仪分叉） |
| 神启 C | **Phase 5** | 完整 |
| 神启 D | **Phase 6** | 完整 |
| 通达 A | **Phase 3** | 完整（声誉+使馆+使者） |
| 通达 B | **Phase 4** | 完整（邦交系统+7 族深度 1-2） |
| 通达 C | **Phase 5** | 完整 |
| 通达 D | **Phase 6** | 完整 |

### 各阶段概览

| 阶段 | 版本 | 名称 | 主要内容 | 活跃线 | 估算条目 |
|------|------|------|---------|--------|---------|
| Phase 1 | v0.16 | 治理奠基 | 政体系统 + 典制页签改版 + 远行解锁 | 0 | ~20（系统改造） |
| Phase 2 | v0.17 | 双线觉醒 | 工业基础 + 灵修基础 同步激活，择路而治 | 2 | ~44 |
| Phase 3 | v0.18 | 信仰与通商 | 工业油火 + 灵修共振 + 神启宗教奠基 + 通达声誉初交 + 占卜 + 枯风口 | 4 | ~94 |
| Phase 4 | v0.19 | 分化之路 | 工业精金 + 灵修结晶 + 神启分叉(教团/秘仪) + 通达结邦 + 6 神 | 4 | ~150 |
| Phase 5 | v0.20 | 深盟与成熟 | 工业辉能 + 灵修深寂 + 神启深化 + 通达深盟 + 邦交系统 | 4 | ~200 |
| Phase 6 | v0.21 | 远望 | 工业太空前半 + 灵修灵途前半 + 神启终局整合 + 通达共谷 | 4 | ~170 |
| Phase 7 | v0.22 | 终局与轮回 | 工业太空后半 + 灵修灵途后半 + 5 终局 + 轮回 | 2 | ~110 |

> **工作量曲线说明**: Phase 3→5 逐步攀升是结构性的——4 条活跃线同步推进，每线每阶段 ~35-50 条目。Phase 6-7 回落是因为神启/通达在 Phase 6 完结。如果单阶段开发周期过长，Phase 4 和 Phase 5 可各拆为 a/b 两个子版本发布。

### Phase 4-5 拆分预案（可选执行）

Phase 4（~150 条目）和 Phase 5（~200 条目）是工作量峰值，分别约为 Phase 2 的 3.4 倍和 4.5 倍。若单阶段开发周期超出预期，按以下方案拆分为 9 个开发节点，每节点控制在 60-100 条目：

| 开发节点 | 版本 | 内容 | 估算条目 |
|---------|------|------|---------|
| Phase 1 | v0.16 | 治理奠基 + **phase 门控实现** | ~20 |
| Phase 2 | v0.17 | 工业A + 灵修A + UI折叠 | ~44 |
| Phase 3 | v0.18 | 工业B + 灵修B + 神启A + 通达A + 占卜 + 枯风口 | ~94 |
| **Phase 4a** | **v0.19a** | 工业C + 灵修C + 通达B（主线深化 + 邦交系统） | **~90** |
| **Phase 4b** | **v0.19b** | 神启B双路径(教团/秘仪) + 6神选定 | **~60** |
| **Phase 5a** | **v0.20a** | 工业D + 灵修D基础（资源链 + 建筑 + 研究） | **~70** |
| **Phase 5b** | **v0.20b** | 灵修D后半(灵契/寂石冥想) + 神启C + 通达C | **~130** |
| Phase 6 | v0.21 | 工业E前 + 灵修E前 + 神启D + 通达D | ~170 |
| Phase 7 | v0.22 | 终局 + 轮回 | ~110 |

**拆分原则**：
- Phase 4a 优先推进产消博弈（能量/灵脉的消耗端正式上线），Phase 4b 聚焦信仰分叉
- Phase 5a 完成主线 D 阶段的资源链骨架，Phase 5b 叠加独占系统和副线深化
- 拆分后每节点 60-130 条目，峰值从 200 降至 130，更均匀
- 不拆分时仍按原 7 阶段执行，拆分不影响内容本身

### 关键前置依赖提醒

| 依赖 | 必须在何时完成 | 原因 |
|------|-------------|------|
| `phase` 门控机制 | **Phase 1**（与治理改造同步） | 工业B代码已完整存在于 data.js，Phase 2 若无 phase 门控会泄漏到 steelVault/forging/concreteTech |
| 灵修B内容填充 | **Phase 3 开发期间** | branch-mystic.md Phase B 设计完整，但代码仅有 4 个资源名，需从零实现 5 建筑/3 职/8 研/4 配方/28 升级 |
| `sb:` 门控验证 | **Phase 3 前** | chk() 已支持 sb: 字段，但需验证 G.subBranch 在 divineLore/通达政策选择时正确设置 |

### Phase 1 步骤依赖图

```
阶段一（v0.16）执行顺序（→ 表示硬依赖，⇒ 表示推荐顺序）：

1.6 phase 门控  ─┐
                 ├→ 1.0/1.1/1.2 议事录废弃 + 议政页签合并
1.7c t 过滤     ─┘                ↓
                              1.3 POLITY/POLICY 不可逆
                                  ↓
                              1.4 Tier 路线树 UI
                                  ↓
                              1.5 研究链前置调整
                                  ↓
                              1.7 / 1.7b 事件 + 治理 UI 美化
                                  ↓
                              1.8 / 1.9 存档兼容 + 验收
```

> **硬依赖**意味着必须先做完才能继续；**推荐顺序**是为了避免半残状态。
> 跨阶段不做（mulerun 限制 §RULES 八）：完成 Phase 1 全部后才进 Phase 2。

---

## 四、阶段一：治理奠基（v0.16）

### 实施进度（mulerun 必读：找下一个 ⏳ 任务做）

| 步骤 | 标题 | 状态 | commit | 详细任务卡 |
|------|------|------|--------|---------|
| 1.6 | phase 门控机制 | ✅ 已完成 | 9f45bc3 | §四 1.6 |
| 1.7c | 建筑列表 t 字段过滤 | ✅ 已完成 | 7ea739b | §四 1.7c |
| 1.0/1.1/1.2 | 议事录废弃 + 议政页签合并 + 建筑迁村落 | ✅ 已完成 | c11920d | §四 1.0/1.1/1.2 |
| (hotfix) | 建筑 br 门控漏洞 + 脏数据清理 | ✅ 已完成 | 9f4004d | - |
| **1.3** | **政体系统（POLITY/POLICY 不可逆 + Tier 路线树）** | ✅ 已完成 | 573ceda | §四 1.3（含任务卡） |
| 1.4 | 远行解锁（荒丘 + 密林） | ✅ 已完成 | 59bca68 | §四 1.4 |
| 1.5 | 研究调整（branchLore/policyLore 前置） | ✅ 已完成 | e76a661 | §四 1.5 |
| 1.7 | 事件池扩充（治理初期争议见闻） | ✅ 已完成 | cf0a7dc | §四 1.7 |
| 1.7b | 典制页签治理区 UI 美化 | ✅ 已完成 | (合并提交) | §四 1.7b |
| 1.8 | 存档兼容验证 | ✅ 已完成 | 5f48a4f | §四 1.8 |
| 1.9 | 阶段一验收清单 | ✅ 已完成 | (验收通过) | §四 1.9 |

> mulerun 必须按上表顺序执行。每完成一步，更新 `状态` 为 `✅` 并填入 `commit` SHA。

<!-- SECTION: phase-1 -->

### 目标

建立社会治理层，为后续分支选择提供决策框架。**不引入任何工业/灵修实质内容**——本阶段专注于"选择前的准备"。

### 前置条件（玩家侧）

已激活习俗 ≥ 5 + 村民 ≥ 30 + 树皮记事(councilLore)研究完成

### v0.16.0 已发布部分与重构关系

⚠️ **关键**：v0.16.0（2026-04-29）已发布"政体与政策（第一批）"，包含可切换政体 + 议事录资源 + 政堂建筑等。本阶段实施时**不是从零开发**，而是**重构**已发布的部分。详见 [changelog v0.16.0](../changelog.md)。

| v0.16.0 已发布 | 本阶段处理 |
|---------------|-----------|
| 议事录资源 `council` | **删除**：删 RD 条目，migrate 中清理 `G.res.council` |
| 议事堂 `councilHall` 效果 `councilProdM` | **改为** `loreM: .05`（纯学识加成） |
| 政堂 `polityHall` 建筑 | **保留**，但 `e/uq` 调整为 `polityBonus: .05 + uq: { polity: true }` |
| 6 政体可切换 | **改为不可逆**：选定后 `G.polity` 锁定，原"变更政体"按钮移除；migrate 时保留当前 polity 值不变 |
| 4 政策域可切换 | **改为不可逆**：原"切换"功能移除；migrate 时保留当前 `policies{}` 不变；新增 `tier1` 字段（默认推断：`elder/hermit/public → 'in'`，`trade/martial/anarchy → 'out'`） |
| 3 个研究（共谷议事 / 法度通论 / 集议传统） | **保留** ID 与费用，但前置链与解锁内容更新（见 §四 1.5） |

**migrate 检查清单**（Phase 1 实施时验证）：

- [x] `G.res.council` 删除后旧存档加载不报错
- [x] `G.polity` 已选玩家进入新版后政体效果仍生效（无需重选）
- [x] `G.policies{}` 已选玩家政策不被清空
- [x] `G.tier1` 自动从 `G.polity` 推断（首次进入新版时）
- [x] 议事堂存量保留，效果从 council 产出切换为 loreM
- [x] 政堂存量保留，效果从 polityProdM 切换为 polityBonus
- [x] v0.16.0 旧版"变更政体"按钮在 UI 中移除（变成"政体已选定"显示）
- [x] 旧版"政策切换冷却"逻辑移除，新版政策选定后永久锁定

> 重构落地后，以 **v0.16.1**（重构版）或 v0.17 前置版本身份记入新的 changelog 条目。

### 步骤拆解

#### 1.1 谷声资源废弃说明

**决议：移除谷声（valleyVoice）**。

理由：
1. **猫国参照**：猫国政策系统用文化（culture，通用资源）作为政策花费，天然产生机会成本。政策解锁靠研究链前置（写作→货币→外交/孤立…），不需要额外的"累积门槛"资源。
2. **本游戏已有等价机制**：研究链（councilLore → polityLore → policyLore）+ 通用资源花费（卷轴+铜钱+古币）已足够提供解锁节奏和机会成本。
3. **引擎复杂度**：谷声需要独立字段 `G.valleyVoice`、独立 calcR() 累积逻辑、非标准资源展示（进度条而非左栏）、多来源（年+建筑+习俗+远行+研究），增加 ~50 行引擎代码却不产生有意义的决策。
4. **名称问题**：「谷声」与当前页签命名（典制→邦制→社稷）语义不搭。

**替代方案**：所有原谷声门槛改为研究前置 + 资源花费：
- 原"谷声 ≥ 30 解锁 Tier 1" → 改为 `polityLore` 研究解锁
- 原"谷声 ≥ 80 解锁 Tier 2" → 改为 Tier 1 已选 + 议事堂 ≥ 2 + `polityLore` 完成
- 原"谷声 ≥ 150 解锁 Tier 3" → 改为 Tier 2 已选 + `policyLore` 研究解锁

**影响范围**：
- 删除 RD 中 `valleyVoice` 条目（若已添加）
- 删除 `councilHall` 的 `valleyVoiceP` 效果，改为 `loreM: .05`（纯学识加成）
- 删除 G.valleyVoice 状态字段
- 典制页签治理区不再有"谷声进度条"，改为研究解锁提示
- 原 v0.16-plan.md / v0.16-rewrite.md 中的谷声相关设计标记为**已废弃**

#### 1.2 页签改造：议政 → 并入典制

**代码改动**:
1. TABS 数组：删除 `g` 页签条目
2. 典制页签 `k` 内部新增"治理"分区（在习俗卡片下方）
3. `councilLore` 研究解锁治理分区的显示（不再解锁独立页签）
4. 原 `councilHall`/`polityHall` 建筑保留在村落页签
5. 原 council 资源改名或废弃——

**council 资源处理**:
- 原设计：council(议事录) 作为政策花费货币
- v0.16-plan.md 已决议废弃议事录，改为通用资源花费
- **执行**: 删除 RD 中 `council` 条目；`councilHall` 改为纯学识加成（`loreM: .05`）；政策花费改为 卷轴+铜钱+古币

**议事堂/令台代码定义**:

```js
councilHall: {
  n: '「占位：议事堂」', t: 'v',
  d: '谷中议事之所。提升学识产出。',
  p: [{ r: 'plank', b: 15, k: 1.12 }, { r: 'brick', b: 10, k: 1.12 },
      { r: 'wood', b: 50, k: 1.12 }, { r: 'coin', b: 20, k: 1.12 }],
  e: { loreM: .05 },
  uq: { u: { councilLore: 1 } },
  tip: ['坐下来，是所有变化的开始。']
}
polityHall: {
  n: '「占位：令台」', t: 'v',
  d: '路线的权力象征。每座强化当前政体正面效果。',
  p: [{ r: 'plank', b: 25, k: 1.12 }, { r: 'brick', b: 20, k: 1.12 },
      { r: 'iron', b: 10, k: 1.12 }, { r: 'coin', b: 30, k: 1.12 }],
  e: { polityBonus: .05 },
  uq: { polity: true },  // ⚠ 非标准条件，需引擎特殊处理
  tip: ['']
}
```

> 令台上限 3 座 = 正面效果 +15%。
> ⚠ `polityHall` 的 `uq: { polity: true }` 为非标准解锁条件，需在 `chk()` 中特殊处理：检查 `G.polity` 或等效状态字段。

#### 1.3 政体系统（分层不可逆路线树）

> 📋 **mulerun 任务卡** | **状态**：✅ 已完成 (commit 573ceda) | **前置**：✅ 1.0/1.1/1.2 (commit c11920d) + ✅ hotfix (9f4004d)

##### 涉及文件清单（基于 commit 9f4004d）

| 文件 | 行号 | 改动类型 | 内容摘要 |
|------|------|---------|---------|
| data.js | POLITY 1317-1342 | 完全重写 | 6 政体加 `tier1: 'in'/'out'`, `cost: [{r,a}]`, 拆 `e`/`pen` 字段 |
| data.js | POLICY 1344-1386 | 完全重写 | 4 域加 `permanent: true`, `cost` 改资源数组, 删 `cooldown`, 加 `pen` |
| engine-actions.js | choosePolity 508-515 | 改 | 加 cost 资源检查 + 扣除 + 设置 G.tier1 |
| engine-actions.js | changePolity 517-532 | 删除整个函数 | 政体不可逆 |
| engine-actions.js | policySwitchCost 535-546 | 删除整个函数 | 政策不可逆 |
| engine-actions.js | setPolicy 548-594 | 重写 | 仅首次扣 cost；已选不可改；移除议事录/冷却 |
| engine.js | calcR/calcH/bp 等用 POLITY[G.polity].e 处 | 适配 e+pen | 读取 `pen` 字段并合并到效果计算 |
| ui.js | renderPolityTab 1632-1830 | 加 Tier 1 + 过滤 | 政体面板**之前**加 Tier 1 路线选择（内守/外拓）；Tier 2 显示按 G.tier1 过滤 |
| index.html | 47-51 | 递增 | data, engine, engine-actions, ui 缓存版本号各 +1 |

> **行号查找**：使用 `Grep "^const POLITY"` / `Grep "^const POLICY"` / `Grep "function choosePolity\|function changePolity\|function setPolicy"` 确认实际位置（行号会随其他改动漂移）。

##### 逐步执行（每步必须 verify）

**步骤 1：data.js POLITY 重写**（参考下方 §"POLITY 代码数据结构（重写）" 的 467-512 代码示例）
- 改动：6 个政体加 `tier1`/`cost`/`pen` 字段；删除 `councilYear`（议事录已废弃）和 `policyCostMul`（政策不可切换不再需要）；effects 拆 `e`（正面）+ `pen`（惩罚）
- verify: `preview_eval "POLITY.elder.tier1 === 'in' && Array.isArray(POLITY.elder.cost) && POLITY.trade.tier1 === 'out'"` → true

**步骤 2：data.js POLICY 重写**（参考下方 §"Tier 3：政策域" 代码）
- 改动：4 个域（land/edu/trade/class）加 `permanent: true` + `cost` 改资源数组 + 删 `cooldown` + opts 各项加 `pen` 字段
- branch 域已 permanent: true，无需再改
- diplomacy 域是 Phase 3 内容，**不要在 1.3 实现**
- verify: `preview_eval "POLICY.land.permanent === true && Array.isArray(POLICY.land.cost)"` → true

**步骤 3：engine.js 适配 e+pen 字段**（grep `POLITY\[G\.polity\]\.e\.` 共约 10 处）
- 改动：每处读 POLITY 效果时同时读 pen 字段，合并：`var pe = POLITY[G.polity].e || {}; var pen = POLITY[G.polity].pen || {}; var v = (pe.xxxM || 0) + (pen.xxxM || 0);`
- 注意：政堂加成（polityBoost）只对正面（pe）有效，惩罚（pen）不被加成
- verify: `preview_eval` 选政体后跑 calcR，看效果数值符合"e+pen 已合并 + 政堂加成正面"

**步骤 4：engine-actions.js choosePolity 加资源扣除**（行 508-515）
- 改动：检查 cost 数组所有资源 ≥ 需要量；不足报"资源不足，无法选定政体"；够则扣资源 + `G.polity = id; G.tier1 = POLITY[id].tier1;`
- verify: 资源充足时选 elder → G.polity='elder', G.tier1='in', 卷轴/铜钱/古币正确扣除；资源不足时报错且 G.polity 不变

**步骤 5：engine-actions.js 删除 changePolity 和 policySwitchCost**（行 517-546）
- 改动：完全移除两个函数（dead code 清理）。如果 ui.js 仍有引用，UI 删除。
- verify: `preview_eval "typeof changePolity === 'undefined' && typeof policySwitchCost === 'undefined'"` → true

**步骤 6：engine-actions.js setPolicy 重写**（行 548-594）
- 改动：移除 council 检查、policyCooldowns 检查、cooldown 设置；保留 permanent 检查（已选不可改）；首次选择扣 cost 资源数组（不是 cost 数字）
- verify: 首次选 land=public 成功且扣 cost；二次选 land=private 报"已确立 永久"且 G.policies.land 不变

**步骤 7：ui.js renderPolityTab 加 Tier 1 + 过滤**（行 1632-1830）
- 改动：
  - 政体面板**之前**插入 "Tier 1 路线" 面板（内守/外拓 2 选 1，参考§四 1.3 表 444-446 的设计）
  - 政体面板列出政体时按 `G.tier1` 过滤（只显 tier1 匹配的 3 个）
  - 政策选择按钮 onclick 调用 `setPolicyConfirm`（永久政策双重确认）而非 `setPolicy`
- verify: 新存档进入 → 看到 Tier 1 选择 → 选内守 → 政体面板只显 elder/hermit/public

**步骤 8：index.html 缓存版本号递增**（行 47-51）
- 改动：data: 26→27, engine: 15→16, engine-actions: 9→10, ui: 19→20
- verify: reload 后 `preview_eval "POLITY.elder.tier1"` 返回 'in'（不是 undefined）

##### 验收清单（5 项必须全过）

- [ ] preview_console_logs level=error 显示"No console logs"
- [ ] 新存档：完成 polityLore 后看到 Tier 1 路线选择，选内守 → 卷轴/铜钱各扣 30，G.tier1='in'
- [ ] 新存档：Tier 1 选完后政体面板仅显示对应 3 个政体；选 elder → 卷轴/铜钱各扣 80 + 古币扣 10，G.polity='elder'
- [ ] 新存档：选 land=public → 卷轴扣 X，G.policies.land='public'；再点 land=private 报"已确立"
- [ ] 旧存档（已有 G.polity='trade'）加载后：G.tier1 自动='out'（migrate §1.2 已实现）；政体效果数值与 v0.16.0 一致
- [ ] cache-buster: index.html 4 个版本号已递增

##### 避免（防呆清单）

- ⚠ **不要删除** G.polityChanges / G.polityPenaltySeason / G.polityPenaltyYear 字段（旧存档兼容）
- ⚠ **不要改** POLITY 现有 ID（elder/hermit/public/trade/martial/anarchy）—— 改了旧存档会丢政体
- ⚠ **不要改** POLICY 现有域 ID（land/edu/trade/class/branch）
- ⚠ **不要再加** branch 域的 permanent—— 已是 permanent: true
- ⚠ **不要实现** diplomacy 域 —— Phase 3 内容
- ⚠ **不要实现** Tier 1 → Tier 2 → Tier 3 的级联**锁定**（如内守锁定 trade/martial/anarchy）—— 这是 §四 1.3 设计的进阶，1.3 仅做"按 tier1 过滤显示"即可
- ⚠ **不要改** policyHall（政堂） uq 字段，已是 `{ polity: true }`，chk() 已支持
- ⚠ **保留** setPolicyConfirm 函数（永久政策双重确认弹窗）

##### 完成后

1. 跑全部验收清单（**任意一项 fail 不得 commit**）
2. commit message 引用本任务卡 `engine: §四 1.3 政体系统不可逆 + Tier 路线树`
3. 更新 §四 实施进度表：1.3 状态 ⏳→✅ 填 commit SHA；1.4 状态 ⬜→⏳
4. 不主动 push，等待 review

---

> 参考猫国政策系统：用通用资源（文化）作为花费，研究链作为前置，一旦选定不可更改。本游戏对应：卷轴+铜钱+古币作为花费，councilLore→polityLore→policyLore 作为研究链。

**Tier 1：基本路线（2 选 1，polityLore 研究完成后解锁）**

| 选项 | 效果概要 | 花费 | 级联 |
|------|---------|------|------|
| 内守 | 内政/生产向：基础资源 +5%，建筑花费 -3% | 卷轴 ×30 + 铜钱 ×30 | 开放 Tier 2 的守尾制/闭谷修灵/合嗓令 |
| 外拓 | 探索/贸易向：远行奖励 +10%，商队概率 +5% | 卷轴 ×30 + 铜钱 ×30 | 开放 Tier 2 的通货集/野风志/散爪活 |

> Tier 1 花费对称，不存在"白嫖"。参照猫国 150 文化的初始政策梯度。

**Tier 2：政体（3 选 1，Tier 1 已选 + 议事堂 ≥ 2 解锁）**

**⚠ 关键映射：代码 POLITY ID → Tier 路线树**

| Tier 1 | 代码 ID | 设计名 | 效果（正面） | 效果（系统惩罚） | 花费 |
|--------|---------|--------|------------|----------------|------|
| 内守 | `elder` | 守尾制 | hapM +8%, loreM +10%, 议事堂产出 ×1.5 | 商队概率 -5%, 远行奖励 -10% | 卷轴 ×80 + 铜钱 ×80 + 古币 ×10 |
| 内守 | `hermit` | 闭谷修灵 | charmM +15%, loreM +10%, 灵术效果 +10% | coinM -10%, 商队概率 -5%, 外交资源 -15% | 卷轴 ×80 + 铜钱 ×80 + 古币 ×10 |
| 内守 | `public` | 合嗓令 | hapM +12%, allM +3%, 政策花费 -30% | buildCostM +5%, 研究花费 +5% | 卷轴 ×80 + 铜钱 ×80 + 古币 ×10 |
| 外拓 | `trade` | 通货集 | coinM +20%, 商队概率 +8%, 图纸概率 +8% | hapM -5%, 基础资源 -3% | 卷轴 ×80 + 铜钱 ×80 + 古币 ×10 |
| 外拓 | `martial` | 野风志 | 远行奖励 +15%, baseProdM +10%, scoutM +10% | hapM -8%, 铜钱产出 -5% | 卷轴 ×80 + 铜钱 ×80 + 古币 ×10 |
| 外拓 | `anarchy` | 散爪活 | gatherM +30%, jobM +8%, 满意度上限 +20% | bldProdM -10%, 研究速度 -5% | 卷轴 ×80 + 铜钱 ×80 + 古币 ×10 |

> 每种政体都有明确的系统级惩罚（不只是 ±% 数值调整），参照猫国政策体系中"选项A对标选项B"的设计——永远有取舍。花费参照猫国 1500 文化梯度。

**POLITY 代码数据结构（重写）**:

```js
const POLITY = {
  elder: {
    n: '「占位：守尾制」', d: '长老治谷，稳扎稳打。学识与满意度优先，但对外封闭。',
    tier1: 'in',
    cost: [{ r: 'scroll', a: 80 }, { r: 'coin', a: 80 }, { r: 'ancCoin', a: 10 }],
    e: { hapM: .08, loreM: .50 },  // ⚠️ councilProdM 已废弃（council 资源已删），合并为 loreM: .50
    pen: { caravanProb: -.05, expRewardM: -.10 },
  },
  hermit: {
    n: '「占位：闭谷修灵」', d: '隐居修行，灵性充沛。符咒与学识双高，但经济封闭。',
    tier1: 'in',
    cost: [{ r: 'scroll', a: 80 }, { r: 'coin', a: 80 }, { r: 'ancCoin', a: 10 }],
    e: { charmM: .15, loreM: .10, spellEffM: .10 },
    pen: { coinM: -.10, caravanProb: -.05, diplomatResM: -.15 },
  },
  public: {
    n: '「占位：合嗓令」', d: '公议治谷，均衡发展。政策调整成本低，但建设研究微涨。',
    tier1: 'in',
    cost: [{ r: 'scroll', a: 80 }, { r: 'coin', a: 80 }, { r: 'ancCoin', a: 10 }],
    e: { hapM: .12, allM: .03, policyCostM: -.30 },
    pen: { buildCostM: .05, researchCostM: .05 },
  },
  trade: {
    n: '「占位：通货集」', d: '商道治谷，铜钱为先。贸易强力但居民不太开心。',
    tier1: 'out',
    cost: [{ r: 'scroll', a: 80 }, { r: 'coin', a: 80 }, { r: 'ancCoin', a: 10 }],
    e: { coinM: .20, caravanProb: .08, bpChance: .08 },
    pen: { hapM: -.05, baseProdM: -.03 },
  },
  martial: {
    n: '「占位：野风志」', d: '远行治谷，武力开拓。远征强力但经济与满意度承压。',
    tier1: 'out',
    cost: [{ r: 'scroll', a: 80 }, { r: 'coin', a: 80 }, { r: 'ancCoin', a: 10 }],
    e: { expRewardM: .15, baseProdM: .10, scoutM: .10 },
    pen: { hapM: -.08, coinM: -.05 },
  },
  anarchy: {
    n: '「占位：散爪活」', d: '无人治谷，自由至上。手动采集爆发但建筑长期疲软。',
    tier1: 'out',
    cost: [{ r: 'scroll', a: 80 }, { r: 'coin', a: 80 }, { r: 'ancCoin', a: 10 }],
    e: { gatherM: .30, jobM: .08, hapCapM: .20 },
    pen: { bldProdM: -.10, researchSpeedM: -.05 },
  },
};
```

**与现有代码差异**:
- 新增 `tier1: 'in'/'out'` 字段（Tier 1 所属）
- 新增 `cost: [...]` 资源数组（参照猫国文化花费，用卷轴+铜钱+古币）
- 效果拆为 `e`（正面）和 `pen`（惩罚），引擎合并处理：`finalMul = 1 + e.xxxM + pen.xxxM`
- 删除旧的 `councilYear` 等无定义效果

**Tier 3：政策域（4 域各 3 选 1，policyLore 研究完成 + Tier 2 已选后解锁）**

> 参照猫国：政策域是独立的平行选择，每个域内 3 选 1，选定后不可更改。花费用通用资源，有机会成本（花掉的卷轴/铜钱不能拿去研究/建造）。

**外交域为特殊处理**：外交域是第 5 个政策域，二选一（通达/闭谷），用于开启通达副线。详见 branch-diplomat.md §一。此域在 Phase 3 才出现（与通达副线激活时机一致），不在 Phase 1。

**POLICY 代码数据结构（重写）**:

```js
const POLICY = {
  // ===== 主线选择（阶段二触发，不在阶段一） =====
  branch: {
    n: '择路而治', permanent: true,
    cost: [],  // 无资源花费，纯研究门控
    uq: { u: { branchLore: 1 } },
    opts: {
      I: { n: '「占位：工业」', d: '你靠造物和科技推一切。选定后不可更改。', e: {} },
      M: { n: '「占位：灵修」', d: '你靠灵术循环和超自然力量推一切。选定后不可更改。', e: {} },
    },
  },
  // ===== 四大政策域（阶段一 Tier 3 激活） =====
  land: {
    n: '「占位：地利」', permanent: true,
    cost: [{ r: 'scroll', a: 50 }, { r: 'coin', a: 40 }],
    uq: { u: { policyLore: 1 }, polity: true },
    opts: {
      public:  { n: '「占位：公田」',   d: '产出普涨，满意度微降。',
                 e: { berryM: .08, woodM: .05, stoneM: .05 }, pen: { hapM: -.03 } },
      private: { n: '「占位：私田」',   d: '铜钱暴涨，建筑省钱，但采集下降。',
                 e: { coinM: .15, buildCostM: -.05 }, pen: { berryM: -.05 } },
      commune: { n: '「占位：共耕」',   d: '采集最强，心情好，但铜钱萎缩。',
                 e: { berryM: .15, hapM: .05 }, pen: { coinM: -.05 } },
    },
  },
  edu: {
    n: '「占位：传习」', permanent: true,
    cost: [{ r: 'scroll', a: 50 }, { r: 'coin', a: 40 }],
    uq: { u: { policyLore: 1 }, polity: true },
    opts: {
      mentor:  { n: '「占位：师徒」',   d: '授业便宜，但学识产出略低。',
                 e: { trainCostM: -.30 }, pen: { loreM: -.05 } },
      academy: { n: '「占位：书院」',   d: '学识与卷轴双高，但授业昂贵。',
                 e: { loreM: .15, scrollM: .10 }, pen: { trainCostM: .20 } },
      self:    { n: '「占位：自学」',   d: '学识/卷轴微涨，采集经验大涨。',
                 e: { loreM: .05, scrollM: .05, gatherExpM: .20 }, pen: {} },
    },
  },
  trade: {
    n: '「占位：外通」', permanent: true,
    cost: [{ r: 'scroll', a: 50 }, { r: 'coin', a: 40 }],
    uq: { u: { policyLore: 1 }, polity: true },
    opts: {
      open:    { n: '「占位：开放通商」', d: '商队频繁，图纸概率高，但满意度微降。',
                 e: { caravanProb: .10, bpChance: .05, coinM: .05 }, pen: { hapM: -.03 } },
      control: { n: '「占位：管控」',     d: '铜钱稳涨，交易划算，但商队减少。',
                 e: { coinM: .10, tradePriceM: -.10 }, pen: { caravanProb: -.05 } },
      closed:  { n: '「占位：封闭」',     d: '内政加成，但商队骤降、铜钱骤减。',
                 e: { hapM: .05, baseProdM: .05 }, pen: { caravanProb: -.15, coinM: -.10 } },
    },
  },
  class: {
    n: '「占位：序位」', permanent: true,
    cost: [{ r: 'scroll', a: 50 }, { r: 'coin', a: 40 }],
    uq: { u: { policyLore: 1 }, polity: true },
    opts: {
      equal:   { n: '「占位：平等」',     d: '心情好，但职业效率微降。',
                 e: { hapM: .08 }, pen: { jobM: -.03 } },
      seniority: { n: '「占位：长幼有序」', d: '授业加成，但心情微降。',
                 e: { trainFlat: .5 }, pen: { hapM: -.03 } },

> ✅ **命名空间冲突已修正**：原 `elder` 改为 `seniority`，避免与 POLITY ID `elder`（守尾制政体）歧义。
      merit:   { n: '「占位：才能至上」', d: '职业效率与铜钱双涨，但心情差。',
                 e: { jobM: .05, coinM: .05 }, pen: { hapM: -.05 } },
    },
  },
  // ===== 外交域（阶段三触发，不在阶段一） =====
  diplomacy: {
    n: '「占位：外交」', permanent: true,
    cost: [{ r: 'scroll', a: 50 }, { r: 'coin', a: 40 }],
    uq: { u: { policyLore: 1 }, polity: true, /* + 阶段三研究前置 */ },
    opts: {
      open:   { n: '通达', d: '解锁外交副线全部内容。', e: { diplomatResM: .10 }, pen: {},
                special: 'G.subBranch.T = true' },
      closed: { n: '闭谷', d: '不开外交，换取内政加成。', e: { baseProdM: .05, buildCostM: -.03 }, pen: {},
                special: 'G.subBranch.T = false' },
    },
  },
};
```

**与现有代码差异**:
- `cost` 从数字改为资源数组 `[{ r, a }]`，与建筑花费格式一致
- 删除 `cooldown`，所有政策 `permanent: true`（选定不可更改）
- 每个选项增加 `pen`（惩罚）字段，与 POLITY 格式一致
- 新增 `diplomacy` 域（外交政策域），对接通达副线（branch-diplomat.md §一 "通达 vs 闭谷"）
- `branch` 政策保留但**阶段二触发**，不在阶段一

**级联锁定规则**:
- Tier 2 政体影响政策域可选范围（具体规则待主线机制确定后设计，此处预留 `G.policiesLocked` 机制）
- 例：选"闭谷修灵(hermit)"后，外通域的"开放通商"选项被锁定（灰化不可选）

**与 branch-diplomat.md 的统一**:
- branch-diplomat.md §一 定义了"通达 vs 闭谷"作为外交域二选一，本设计将其纳入 POLICY.diplomacy
- 选"通达"设 `G.subBranch.T = true`，选"闭谷"设 `G.subBranch.T = false` + 激活闭谷内政加成
- diplomacy 域在**阶段三**才出现（与 roadmap Phase 3 通达激活时机一致），不在阶段一
- 闭谷加成（baseProdM +5%, buildCostM -3%）与 branch-diplomat.md 完全一致

#### 1.4 远行解锁（荒丘 + 密林）

当前 `nearHill`(荒丘) 和 `forest`(密林) 锁定在 trailroad × 999。

**解锁方案**:
- 荒丘：驿道 ≥ 2 + 远途跋涉(longJourney)研究（已有）
- 密林：驿道 ≥ 3 + 远途跋涉 + 荒丘远行完成 ≥ 1 次

**理由**: 为阶段二的工业/灵修选择提供资源供应（荒丘产碎石/兽皮/香草，密林产圆木/兽皮/丝帛），避免分支开启后资源断档。

**改动**: EXD 中 `nearHill.uq` 和 `forest.uq` 的 trailroad 值从 999 改为合理数值。

#### 1.5 研究调整

| 研究 | 改动 |
|------|------|
| `councilLore`「占位：树皮记事」 | 费用：学识 ×300 + 卷轴 ×20。效果改为解锁典制→治理分区 + 议事堂（不再解锁独立页签） |
| `polityLore`「占位：择路而治」 | 费用：学识 ×400 + 卷轴 ×40。前置改为 councilLore + 议事堂 ×2。效果：解锁 Tier 1 路线选择 + 令台 |
| `policyLore`「占位：活络法」 | 费用：学识 ×350 + 卷轴 ×30 + 铜钱 ×50。前置改为 **polityLore** + Tier 2 政体已选。效果：解锁政策域面板。⚠ 当前代码 policyLore 缺少 polityLore 前置，必须补上 |
| `branchLore` | **推迟到阶段二**，前置增加 Tier 2 政体已选 + polityLore |

#### 1.6 阶段门控机制实现（phase 字段）

**⚠ 这是 Phase 2 的硬性前置——若不实现，工业B代码会在 Phase 2 泄漏。**

**现状**：`chk()` 支持 `br:` 和 `sb:` 门控，但**不支持 `phase:` 门控**。代码中无 `G.phase` 状态字段。

**实现方案**：

```javascript
// engine.js chk() 新增判断
if (def.phase && G.phase < def.phase) return false;

// G.phase 递增逻辑（在研究完成 hook 中）
// Phase 1 完成标志：councilLore 完成 → G.phase = 1
// Phase 2 完成标志：branchLore 完成 → G.phase = 2
// Phase 3 完成标志：oilExtract 完成（工业）或灵修B首研完成（灵修） → G.phase = 3
// Phase 4 完成标志：工业C/灵修C 首个研究完成 → G.phase = 4
// 以此类推
```

**需要标记 phase 的已有代码项**（防止提前泄漏）：

| 条目 | 当前状态 | 需加 phase |
|------|---------|-----------|
| `steelVault` (BD) | 仅 `br:'I'` + `uq:{blastFurnace:1, steelWork:1}` | `phase: 3` |
| `forging` (UD) | 仅 `br:'I'` | `phase: 3` |
| `concreteTech` (UD) | 仅 `br:'I'` | `phase: 3` |
| `oilExtract` (UD→**RD**) | 仅 `br:'I'` | `phase: 3` |
| `oilStorage` (UD→**RD**) | 仅 `br:'I'` | `phase: 3` |
| `steamPower` (UD→**RD**) | 仅 `br:'I'` | `phase: 3` |

> ⚠️ **注意**：`oilExtract`/`oilStorage`/`steamPower` 当前标记为 UD（升级），但实际应为研究（RD）。需在实施时修正类型。
| `inscription` (UD) | 仅 `br:'M'` | ~~`phase: 3`~~ **已裁决：无 phase 门控**，inscription 属于灵修 Phase A 内容，仅需 `br: 'M'` + 研究前置 `leylineLore`。见勘误 E2 裁决。 |
| `combustion` (UD) | 仅 `br:'I'` | `phase: 4` |
| `assemblyLine` (UD) | 仅 `br:'I'` | `phase: 4` |
| `roadwork` (UD) | 仅 `br:'I'` | `phase: 4` |
| `factory` (BD) | 仅 `br:'I'` | `phase: 4` |
| `combustEngine` (BD) | 仅 `br:'I'` | `phase: 4` |
| `railroad` (BD) | 仅 `br:'I'` | `phase: 4` |

**存档兼容**：
```javascript
G.phase = G.phase || 0;
// 对于已有存档，根据已完成研究推断 phase
if (G.research.branchLore) G.phase = Math.max(G.phase, 2);
if (G.research.oilExtract || G.research.inscription) G.phase = Math.max(G.phase, 3);
// ...
```

**涉及文件**：
- `engine.js`：chk() 新增 phase 判断 + G.phase 状态 + migrate
- `data.js` BD/UD：上表条目增加 `phase` 字段

#### 1.7 事件池扩充

新增 5-8 条山谷见闻事件，主题围绕"治理初期的争议"（如资源分配争吵、长老意见分歧等），配合阶段主题。

#### 1.7b 典制页签治理区 UI

```
┌─ 治理 ───────────────────────────────────────────────┐
│                                                      │
│  ┌─ 政体 ────────────────────────────────────────┐   │
│  │  Tier 1：[已选/待选]                           │   │
│  │  Tier 2：[已选/待选/锁定]                      │   │
│  │  令台 ×2：正面效果 +10%                        │   │
│  │                              [不可更改]        │   │
│  └───────────────────────────────────────────────┘   │
│                                                      │
│  ┌─ 政策域 ──────────────────────────────────────┐   │
│  │  地利：[●选项A] [○选项B] [○选项C]              │   │
│  │  传习：尚未选择  [选择]                        │   │
│  │  外通：尚未选择  [选择]                        │   │
│  │  序位：尚未选择  [选择]                        │   │
│  │    ⚠ 选定后不可更改                           │   │
│  └───────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────┘
```

选择确认弹窗：显示所有选项 + 效果预览（正面绿字 + 惩罚红字），红字警告"此选择不可撤销"，双重确认。

#### 1.7c 建筑渲染器页签路由修复

**现状问题**：`ui.js` 建筑列表渲染（第 842 行起）遍历 `BD` 全量对象，不按 `d.t` 字段过滤页签。所有建筑都渲染在 `b`（营火）页签上。

**修复方案**：
```js
// ui.js 建筑列表循环中新增过滤
for (var id in BD) {
  var d = BD[id];
  if (!G.bld[id].on) continue;
  // 新增：按页签过滤建筑
  if (d.t && d.t !== currentTab) continue;
  if (!d.t && currentTab !== 'b') continue;  // 无 t 字段的默认归营火
  // ... 原有渲染逻辑
}
```

**影响**：
- 议事堂/令台标 `t: 'v'`，渲染在村落页签（§1.2 已修改）
- 阶段三起信仰建筑标 `t: 'f'`，渲染在宗教页签
- 无 `t` 字段的老建筑（小屋、矿场等）默认渲染在营火页签 `b`
- **这是 Phase 1 硬性前置**——不修复则议事堂/令台虽标 `t:'v'` 但仍显示在营火页签

#### 1.8 存档兼容

```javascript
// migrate 逻辑
// council 资源清理
if (G.r.council !== undefined) {
  delete G.r.council;
}
// councilHall 效果迁移：从产出 council 改为 loreM 加成
// polityHall 效果不变
// 如果玩家已有 g 页签状态，迁移到 k 页签
if (G.tab === 'g') G.tab = 'k';
// 清理旧谷声字段（若存在）
if (G.valleyVoice !== undefined) delete G.valleyVoice;
```

#### 1.9 阶段一验收清单

- [x] 典制页签新增治理分区，议政页签消失
- [x] Tier 1 → Tier 2 → Tier 3 级联选择可操作，选后不可逆
- [x] Tier 选择花费正确扣除通用资源（卷轴/铜钱/古币）
- [x] 各政体系统级惩罚（pen 字段）生效
- [x] 4 政策域选定后永久生效，通用资源正确扣除
- [x] 议事堂产出 loreM 加成正确（无谷声相关逻辑）
- [x] **建筑渲染器页签路由修复**：议事堂/令台显示在村落页签而非营火
- [x] 荒丘/密林可解锁并正常远行
- [x] **phase 门控生效**：steelVault/forging/concreteTech/oilExtract 标记 phase:3 不可见（inscription 无 phase 门控，按 E2 裁决仅 br:'M'）
- [x] 旧存档导入不报错，council 资源平滑清理，G.phase 正确推断
- [x] branchLore 研究**不出现**（等阶段二）

#### 1.10 数据结构

```js
// engine.js G 状态扩展
G.tier1 = G.tier1 || null;                // 'in' | 'out'（Tier 1 路线，不可逆）
G.polity = G.polity || null;              // 'elder'|'hermit'|'public'|'trade'|'martial'|'anarchy'（Tier 2 政体，不可逆）
G.mainLine = G.mainLine || null;           // 'industry' | 'mystic'（主线，不可逆，阶段二激活）
G.subBranch = G.subBranch || {};       // { D: true, T: true }（副线，独立开关）
G.policies = G.policies || {};             // { land: 'public', edu: 'academy', ... }（Tier 3 选择，不可逆）
G.policiesLocked = G.policiesLocked || {}; // { trade: true, ... }（政体级联锁定）
// 注：阶段一初始化 tier1/polity/policies/policiesLocked
// mainLine 在阶段二激活，subBranch 在阶段三激活（神启D + 通达T 均在阶段三开放）
```

> **与现有代码的映射**: 现有 `G.policies.branch = 'I'/'M'` 已迁移为 `G.mainLine = 'industry'/'mystic'`。迁移代码在 §五 2.6（commit 0021a66）实施。

> ✅ **迁移已实施**（§五 2.6, commit 0021a66）：`migrate()` 中自动从 `G.policies.branch` 补全 `G.mainLine`；`setPolicy('branch',...)` 同步设置 `G.mainLine`；branchLore 已完成但未选路时弹出强制选路对话框。

**G.mainLine 迁移逻辑**（已实施）：
- `setPolicy('branch',...)` 中同步设置：
  - `G.policies.branch = 'I'` → `G.mainLine = 'industry'`
  - `G.policies.branch = 'M'` → `G.mainLine = 'mystic'`
- `migrate()` 中：若 `G.policies.branch` 已设但 `G.mainLine` 缺失，自动补全
- 后续代码统一读取 `G.mainLine`，`G.policies.branch` 仅作为向后兼容保留

#### 1.11 涉及文件改动

| 文件 | 改动 |
|------|------|
| `data.js` RD | 删除 `council`；不再新增 valleyVoice |
| `data.js` BD | 改 councilHall（`t:'v'`, `e:{loreM:.05}`）/ polityHall（`t:'v'`, polityBonus）；steelVault 加 `phase:3` |
| `data.js` UD | 改 councilLore/polityLore/policyLore 费用与前置（删除谷声前置）；branchLore 增加前置；工业B/灵修B研究加 `phase` 字段（见§1.6表） |
| `data.js` POLITY | 完全重写：增加 `tier1`、`cost`、`pen` 字段（见§1.3 代码） |
| `data.js` POLICY | 完全重写：`cost` 改为资源数组、删除 `cooldown`、增加 `pen` 字段、新增 `diplomacy` 域（见§1.3 代码） |
| `data.js` TABS | 删除 `g` 页签 |
| `engine.js` | G 状态扩展（G.phase + G.tier1 + G.polity）；chk() 新增 phase 门控 + polity 条件支持；migrate（删 council/valleyVoice、g→k 迁移） |
| `engine-actions.js` | 新增 chooseTier1 / choosePolity / choosePolicy（资源扣除 + 状态写入 + 不可逆锁定） |
| `ui.js` | 建筑渲染器增加 `d.t` 页签过滤（§1.7c）；典制页签新增治理分区渲染 |
| `style.css` | 治理分区样式（路线树、政策域卡片、确认弹窗） |

---

## 五、阶段二：双线觉醒（v0.17）

<!-- SECTION: phase-2 -->

### 实施进度（mulerun 必读：找下一个 ⏳ 任务做）

| 步骤 | 标题 | 状态 | commit | 详细任务卡 |
|------|------|------|--------|---------|
| 2.1 | 择路而治（branchLore + 不可逆选择） | ✅ 已完成 | bff3e80 | §五 2.1 |
| 2.2 | 工业路激活（br:'I' 验证 + 升级 #1-8） | ✅ 已完成 | fea3a85 | §五 2.2 | - | §五 2.2 |
| 2.3 | 灵修路激活（br:'M' 验证 + 升级 #1-8） | ✅ 已完成 | 4ca6d73 | §五 2.3 |
| 2.4 | UI 分类折叠（村落/工坊分组） | ✅ 已完成 | 2579ea8 | §五 2.4 |
| 2.5 | 事件池扩充（工业/灵修/通用见闻） | ✅ 已完成 | eb458e1 | §五 2.5 |
| 2.6 | 存档兼容（migrate branchLore/mainLine） | ✅ 已完成 | 0021a66 | §五 2.6 |
| 2.7 | 阶段二验收清单 | ✅ 已完成 | - | §五 2.7 |
| 2.8 | 离线收益系统 | ✅ 已完成 | c116398 | §五 2.8 |
| 2.9 | 成就系统基础框架 | ✅ 已完成 | 9c99f56 | §五 2.9 |

> mulerun 必须按上表顺序执行。每完成一步，更新 `状态` 为 `✅` 并填入 `commit` SHA。

### 目标

玩家做出工业/灵修不可逆选择，体验所选路线的**基础资源循环**。两条线同步上线，深度对齐。

### 前置条件（玩家侧）

Tier 2 政体已选定 + councilHall ≥ 2 + 已激活习俗 ≥ 5

### 设计原则：等深对齐

**工业 A** 和**灵修 A** 在以下维度严格对齐：

| 维度 | 工业 A | 灵修 A |
|------|--------|--------|
| 新资源 | 2（coal, steel） | 2（spirit, fateSilk） |
| 新建筑 | 4（mine, blastFurnace, chimney, purifier） | 4（spiritWell, spiritTower, quietRoom, leyArray） |
| 新职业 | 2（deepMiner, smelter） | 2（spiritSenser, silkWeaver） |
| 新研究 | 4（deepMining→steelWork→pollControl, fineCraft） | 4（spiritSense→leylineLore→pureMind, beadCraft） |
| 新工艺 | 2（steel, gear） | 2（fateSilk, bead） |
| 新升级 | 8（#1-8） | 8（#1-8） |
| 核心系统 | 能量初步 + 污染初步 | 灵脉初步 + 内乱初步 |
| 新灵术 | 0（工业路无灵术） | 2（spiritSight, tidePull）——灵修路独有，作为工业路缺少灵术的对称补偿 |

> **注意：阶段门控机制**
>
> 工业 A 完整版在代码中已定义了更多内容（steelVault, forging, concreteTech 等），但**阶段二只激活上表内容**，剩余留到阶段四。
>
> **⚠ 实施要点：steelVault 泄漏风险**
> 当前 `steelVault` 在 data.js 中仅标记 `br:'I'` + `uq: { b: { blastFurnace: 1 }, u: { steelWork: 1 } }`——这意味着阶段二玩家完成 steelWork 后会**自动解锁 steelVault**，破坏 4:4 等深对齐。
>
> **解决方案**：为需要延后激活的内容增加**阶段门控字段** `phase`。在 `chk()` 函数中新增判断：`if (def.phase && G.phase < def.phase) return false`。
> - steelVault: `phase: 3`
> - forging/concreteTech: `phase: 3`
> - oilExtract/oilStorage/steamPower 等: `phase: 3`
> - combustion/assemblyLine/roadwork 等: `phase: 4`
> - `G.phase` 在每阶段首个研究完成时递增（阶段一 councilLore → phase=1，阶段二 branchLore → phase=2，以此类推）
>
> 这对标猫国建设者中"科技树深度控制显示"的做法——猫国通过严格的前置研究链控制节奏，而非让所有满足条件的内容一次性涌出。

### 步骤拆解

#### 2.1 择路而治（branchLore）

**解锁条件**（调整后）:
- 前置：Tier 2 政体已选 + councilHall ≥ 2 + 已激活习俗 ≥ 5
- 费用：学识 ×400 + 卷轴 ×40

**选择界面**:
- 弹出不可逆确认对话框（参考猫国传统/政策选择的严肃提示）
- 工业路描述：开启煤矿/冶钢/能量管理，带来污染风险，通往太空终局
- 灵修路描述：开启灵泉/灵脉/命丝编织，带来内乱风险，通往灵迁终局
- 选定后对方路线永久锁定，`G.policies.branch = 'I'` 或 `'M'`

#### 2.2 工业路激活（br: 'I'）

**已有代码激活**——以下内容 data.js 已定义，主要工作是**验证 engine.js 逻辑**：

| 系统 | 验证要点 |
|------|---------|
| 矿坑(mine) | 产煤 +0.02/s/座，污染 +0.005/s/座，深层矿工职业正确加成 |
| 高炉(blastFurnace) | 炼钢工艺正确消耗铁+煤，污染 +0.01/s/座 |
| 烟囱(chimney) | 污染阈值右移 +50/座 |
| 净化池(purifier) | 污染 -0.02/s/座 |
| 能量系统 | energyProd/Cons 计算正确（阶段二能量系统仅预埋，无能量建筑——蒸汽机在阶段四） |
| 污染系统 | 5 阶梯判定正确，灾害事件触发正常 |
| 深层矿工(deepMiner) | 产煤 0.03/s/人，训练加成正确 |
| 炉匠(smelter) | 每 60 tick 自动铁×5+煤×8→钢×1 |

**新增/调整**:
- 升级 #1-8 的解锁前置验证（部分升级要求 steelWork，属于阶段二范围内）
- 污染系统 UI：村落页签顶部或左栏新增污染指示器（文字 + 颜色）
- 阶段二**不激活**的工业内容：steelVault, forging, concreteTech, plate, concrete（这些留阶段三）

#### 2.3 灵修路激活（br: 'M'）

**已有代码激活**——同上验证逻辑：

| 系统 | 验证要点 |
|------|---------|
| 灵泉(spiritWell) | 产灵能 +0.02/s/座，内乱 +0.01/座 |
| 灵塔(spiritTower) | 灵能/命丝存储正确 |
| 静室(quietRoom) | 内乱阈值右移 +50/座 |
| 聚灵阵(leyArray) | 灵脉 +1/座，内乱 +0.005/座 |
| 灵脉系统 | leylineProd/Cons 计算正确（阶段二仅聚灵阵产灵脉，无消耗端——消耗建筑在阶段四） |
| 内乱系统 | 5 阶梯判定正确，心魔事件触发正常 |
| 感应者(spiritSenser) | 产灵能 0.06/人 |
| 织丝人(silkWeaver) | 每 60 tick 自动符咒×3+灵能×5→命丝×1 |

**新增/调整**:
- 升级 #1-8 的解锁前置验证
- 内乱系统 UI：与污染对称，左栏新增内乱指示器
- 灵术 spiritSight/tidePull 在营火→灵术面板中激活
- ~~阶段二**不激活**的灵修内容：inscription, spiritInk, sigil（这些留阶段三）~~ **已裁决**：inscription 属于灵修 Phase A（阶段二），由 `br:'M'` + `leylineLore` 前置自然门控，无需 phase 字段。spiritInk/sigil 随 inscription 解锁，均为阶段二内容。

#### 2.4 UI 分类折叠

阶段二开始，村落/工坊页签内容增多，引入**分组折叠**：

**村落页签分组**:
- 「基础设施」：berryPatch → tradePost（现有建筑）
- 「文化设施」：storyTree → ancestor（v0.14 建筑）
- 「工业设施」：mine → purifier（br: 'I'，仅工业路可见）
- 「灵修设施」：spiritWell → leyArray（br: 'M'，仅灵修路可见）
- 「治理设施」：councilHall, polityHall

**工坊页签分组**:
- 「基础工艺」：plank, brick, scroll
- 「文化工艺」：dye, wine, ink, weave, spiceToSilk
- 「工业工艺」：steel, gear（br: 'I'）
- 「灵修工艺」：fateSilk, bead（br: 'M'）

**参考猫国**：猫国建设者的 Workshop 和 Bonfire 都用折叠分组管理大量内容。

#### 2.5 事件池扩充

- 工业路：新增 5 条山谷见闻（矿洞探索、钢铁试炼、烟尘困扰等）
- 灵修路：新增 5 条山谷见闻（灵泉异象、命丝纠缠、静室感悟等）
- 通用：新增 3 条世界回响（远方工业文明/灵修文明的传闻）

#### 2.6 存档兼容

```javascript
// 对于已有 branchLore 研究但旧版激活方式的存档
// 确保 G.policies.branch 字段存在且有效
if (G.research.branchLore && !G.policies.branch) {
  // 异常状态，弹出重选对话框
}
```

#### 2.7 阶段二验收清单

- [ ] branchLore 研究出现（Tier 2 政体已选后）
- [ ] 选择工业/灵修后，对方路线所有内容（建筑/研究/工艺/职业/升级）灰化不可用
- [ ] 工业路：mine 可建 → coal 可产 → blastFurnace 可建 → steel 可炼，污染正常累积
- [ ] 灵修路：spiritWell 可建 → spirit 可产 → leyArray 可建 → fateSilk 可织，内乱正常累积
- [ ] 污染/内乱 UI 指示器正常显示
- [ ] 村落/工坊分组折叠正常
- [ ] 工业升级 #1-8 / 灵修升级 #1-8 可购买且效果正确
- [ ] 灵修灵术(spiritSight, tidePull)在营火页签可见并可施放

> ⚠️ **遗漏补录**：§十六执行纪律第7条要求「离线收益不晚于阶段二加入」、第8条要求「每阶段加入10-15个成就」。以下任务需加入阶段二步骤列表：
> - [ ] 离线收益系统：数据结构（`G.offlineGains`）、计算逻辑（`simulateOffline()` 已有基础）、UI 方案（登录时弹窗显示离线期间收益摘要）
> - [ ] 成就系统框架：数据结构（`ACHIEVEMENT_DATA` + `G.achievements`）、UI 入口（典制页签或独立面板）、阶段一+二各 10-15 个成就定义

#### 2.8 离线收益系统（Phase 2 新增步骤）

**数据结构**：
```js
G.offlineGains = G.offlineGains || null;
// 登录时填充，显示后清空
// { duration: 秒数, gains: { berry: N, wood: N, ... }, capped: [] }
```

**计算逻辑**：
- `simulateOffline(seconds)` 已有基础框架，需补充：
  - 按当前 tick 产出 × 离线秒数计算各资源增量
  - 受上限约束（超出上限的部分不计）
  - 离线期间不触发事件/灾害
  - 最大离线计算时长：24h（超出部分按 24h 封顶）

**UI 方案**：登录时弹窗显示离线期间收益摘要（资源列表 + 总时长），确认后关闭。

#### 2.9 成就系统基础框架（Phase 2 新增步骤）

**数据结构**：
```js
const ACHIEVEMENT_DATA = {
  firstBuild: { n: '初建', d: '建造第一座建筑', check: () => ... },
  // ...每阶段 10-15 个
};
G.achievements = G.achievements || {};  // { id: timestamp }
```

**设计要点**：
- 纯展示型，不影响数值平衡
- 每阶段新增 10-15 个成就（阶段一+二合计 20-30 个）
- UI 入口：**成就页签 `a`**（§一 第 8 行 + §十一 成就系统）。原"典制底部/独立面板"方案已废弃，原因见 E58

---

## 六、阶段三：信仰与通商（v0.18）

<!-- SECTION: phase-3 -->

### 实施进度

| 步骤 | 标题 | 状态 | commit | 详细任务卡 |
|------|------|------|--------|---------|
| 3.1 | 工业 B 激活（oil/plate/concrete + 能量系统） | ✅ 已完成 | 9c99f56 | §六 3.1 |
| 3.2 | 灵修 B 构建（spiritInk/sigil/resonance + 灵脉消耗） | ✅ 已完成 | 9c99f56 | §六 3.2 |
| 3.3 | 神启 Phase A（宗教页签 + 虔诚/圣油 + 神恩 + 仪式） | ✅ 已完成 | 88e0a72 | §六 3.3 |
| 3.4 | 占卜子系统（每年 1 次决策） | ✅ 已完成 | 9c99f56 | §六 3.4 |
| 3.5 | 枯风口解锁 | ✅ 已完成 | a176928 | §六 3.5 |
| 3.6 | 通达副线 Phase A（声誉/信物 + 使馆/迎宾/信驿） | ✅ 已完成 | 13649bf | §六 3.6 |
| 3.7 | 事件池扩充（工业/灵修/宗教/占卜/外交） | ✅ 已完成 | 86c7a73 | §六 3.7 |
| 3.8 | 阶段三验收清单 | ✅ 已完成 | (验收通过) | §六 3.8 |

> mulerun 必须按上表顺序执行。每完成一步，更新 `状态` 为 `✅` 并填入 `commit` SHA。

### 目标

主线进入油火/共振阶段，同时开放宗教页签和外交初步。**四条内容线首次全部激活**（工业/灵修 + 神启 + 通达），枯风口解锁提供资源补给。

### 前置条件（玩家侧）

- 工业路：steelWork + blastFurnace ≥ 3 + mine ≥ 5
- 灵修路：leylineLore + spiritWell ≥ 3 + leyArray ≥ 2
- 神启：灵狐祠(shrine) ≥ 5 + 已激活习俗 ≥ 8 + 新研究「神启之学」
- 通达：tradePost ≥ 2 + 远行完成 ≥ 3 次 + 外交政策域选"通达"

### 步骤拆解

#### 3.1 工业 B 激活

**已有代码激活**（阶段二被暂扣的工业 A 尾部 + 工业 B 前段）:
- steelVault(料场)：钢/煤存储
- forging(轧板工艺)研究 → plate(钢板)资源 + 工艺
- concreteTech(凝石配方)研究 → concrete(混凝)资源 + 工艺
- oilExtract(汲液工法)研究 → oilWell(油井) + oil(火油)
- oilStorage → oilTank(油缸) + barrel(油桶)
- steamPower → steamEngine(蒸汽机房) → **能量系统正式激活**

> ⚠️ **已裁决（勘误）**：油桶机制以 branch-industry.md 为准——**消耗品**（消耗1桶=火油上限永久+10）。猫国模型中油轮也是消耗品。此处删除原"不消耗/被动提供上限"描述。

**能量系统深度验证**:
- steamEngine 产能 energyP: 1/座
- 阶段三暂无能量消耗端（factory/combustEngine 在阶段四），所以能量比始终 ≥ 1
- 但需要为后续阶段预留：确保 energyRatio < 1 时的产出衰减逻辑已正确

| 维度 | 工业 B |
|------|--------|
| 新资源 | 3（oil, barrel, plate） |
| 新建筑 | 5（oilWell, oilTank, steamEngine, steelVault + 1 新） |
| 新职业 | 2（driller, machinist） |
| 新研究 | 5（oilExtract→steamPower, oilStorage, forging, concreteTech） |
| 新工艺 | 3（oil, plate, concrete） |
| 新升级 | 8（#9-16） |
| 核心系统 | 能量系统激活（steamEngine 产能） |

> ⚠️ **已统一**：升级 #15 coalBriq 效果为「高炉煤耗-20%」（非"钢板/混凝配方煤耗"也非"锅炉煤耗"，因锅炉建筑不存在）；升级 #16 insulatedWall 效果为「高炉煤消耗-15%」（以 branch-industry.md 为准）。

> ✅ **3.1 实施记录**：核心内容（资源/建筑/职业/研究/工艺/能量系统）已在阶段二代码中预埋且含正确 phase/uq 门控。本步骤验证了全部预埋内容可用，并新增全部 28 个 B 阶段升级（branch-industry.md #21-48）。在 calcEnergy 中实现了 `_energyBoost`（升级修正能量产出）和 `_energyCostReduce`（升级减免能量消耗）效果处理。在 calcMx 中实现了 `_maxFoxFlat`（升级增加狐狸上限）。在 calcR 中实现了 `_smelterRate`（炉匠速率加成）、`_autoCraftSpeed`（自动制作速率加成）、`_factoryCraftBonus`（工厂配方加成提升）。注意：#27/#29/#30/#31/#38/#40 依赖 Phase 4 建筑（factory/combustEngine/railroad/calciner），已定义但 uq 门控确保仅在对应 Phase 解锁后生效。

> ✅ **3.1 合规修复**：(1) migrate() 补齐 `G.train` 初始化（旧存档缺失该字段会导致 calcEnergy 中 `G.train.machinist` 崩溃）；(2) 油桶机制从被动库存模式改为消耗品模式（消耗1桶=火油上限永久+10），与 branch-industry.md 裁决一致，旧存档迁移自动将库存油桶转化为已消耗数量；(3) 升级 #15 coalBriq 效果从 plate/concrete 配方煤耗-20% 修正为炼钢配方煤耗-20%；(4) 升级 #16 insulatedWall 效果从高炉污染-15% 修正为炼钢配方煤耗-15%。cache-buster: data:40→41, engine:28→29, engine-actions:13→14, ui:27→28。

#### 3.2 灵修 B 构建

**这是阶段三最大的新增工作量**——灵修 B 在代码中仅有资源名定义(resonance/elixir/spectrum/insight)，缺少完整的建筑/研究/升级体系。

需要对照 branch-mystic.md 设计，新增：

| 维度 | 灵修 B |
|------|--------|
| 新资源 | 3（spiritInk, sigil, resonance） |
| 新建筑 | 5（共振塔 `resonTower`、灵酿坊 `elixirBrewery`、化形殿 `shapeHall`、通灵阁 `oracleHall`、净念林 `calmGrove`） |
| 新职业 | 3（共鸣师 `resonancer`、悟者 `sageOracle`、酿灵师 `elixirBrewer`） |
| 新研究 | 8（inscription 已有 + 7 新：共鸣术→谱析→灵酿→化形基础→悟道法→通灵术→净念→脉扩） |
| 新工艺 | 3（spiritInk, sigil 已有 + resonance） |
| 新升级 | 28（#21-48） |
| 核心系统 | 灵脉消耗激活（深灵建筑耗灵脉） |

**灵脉消耗激活**: 灵修 B 的新建筑开始**消耗灵脉**（leylineC），与聚灵阵的灵脉产出形成平衡。这对标工业路的能量系统。

> ✅ **3.2 实施记录**：数据层（data.js）在此前迭代中已完成——RD 4 资源、BD 5 建筑、JD 3 职业、UD 8 研究、CD 4 配方、SD 4 灵术、UPGD 28 升级（#21-48）全部就位。本步骤补齐了引擎集成层：
> - engine-actions.js castSpell()：新增 resonWave（本季全产出 +50%）、shapeFox（职业效率 ×1.5 含化形延时）、sageUtter（下次研究 -40% 含升级提升至 -55%）、calmFlow（立即躁念 -30）四个灵术处理器
> - engine.js researchCostMul()：sageUtter 折扣逻辑，消耗后在 research() 中自动清除
> - engine.js calcR()：共振波季节性全产出加成（_spellBoost 可修正）、化形·灵狐职业乘数（shapeFoxMul）、共鸣师额外灵能产出（_resonancerSpiritP）、灵脉充足时灵能建筑加成（_leyFullBonus）、灵酿坊配方加成（_breweryBoost + _selfBrewMul）、共鸣造物全配方加成（_resonCraftBonus）
> - engine.js expTimeMul()：化形期间远行时间减免（_shapeExpTime）
> - engine-actions.js spellCooldownMul()：谱石占卜灵术冷却减免（_spellCoolReduce）
> - engine.js mysticSpells 数组扩充至 7 个（含 B 阶段 4 灵术）
> - ui.js：灵术状态标签（本季已施/化形中/待用）+ 共振波产出倍率显示
> - migrate()：补齐 G.resonWaveSeason、G.shapeFoxSeason、G.shapeFoxExtra、G.sageUtterActive 初始化
> - cache-buster: engine:30→31, engine-actions:15→16, ui:29→30

#### 3.3 神启 Phase A：宗教页签开放

**页签条目**:
```javascript
{ id: 'f', n: '宗教', uq: { u: { divineLore: 1 } } }
```

**TABS 数组**：将原 `g`(议政) 位置替换为 `f`(宗教)。或直接在 TABS 中新增 `f`，确保 `g` 已在阶段一删除。

##### 资源：虔诚 + 圣油

| ID | 名称 | 来源 | 消耗 | 上限 |
|----|------|------|------|------|
| `piety` | 虔诚 | 祭司职业产出；祭坛被动；灵狐祠微量 | 炼圣油、仪式、阶段四教令/开门 | 初始 0，祭坛 +30/座 |
| `holyOil` | 圣油 | 工艺：虔诚+野莓→圣油 | 仪式施放、后续升级 | 初始 25，经阁提供虔诚上限 +50/座 |

**sb 门控**: `piety` 和 `holyOil` 标记 `sb: 'D'`。在 subBranch 激活 `D` 之前不可见。

**如何激活 sub-branch 'D'**: 研究「神启之学」(divineLore) 完成时，`e: { subBranch: 'D' }` 触发 `G.subBranch.D = true`。

##### 研究（4 项）

| 研究 | 费用 | 前置 | 效果 |
|------|------|------|------|
| 神启之学 `divineLore` | 学识 ×400, 卷轴 ×25, 符咒 ×30, 遗光 ×5 | 政体已选 + 灵狐祠 ×3 | 激活副线 D，解锁虔诚资源 |
| 祭祀礼法 `ritualBasic` | 学识 ×300, 符咒 ×20, 虔诚 ×5 | divineLore | 解锁祭坛 |
| 经典研习 `scriptureLore` | 学识 ×400, 卷轴 ×20, 虔诚 ×15 | ritualBasic + divineAltar ×2 | 解锁经阁、祭司 |
| 恩典感召 `graceLore` | 学识 ×500, 卷轴 ×30, 虔诚 ×30 | scriptureLore + divineAltar ×3 | 激活神恩系统，解锁祈愿池，解锁圣油 |

##### 建筑（3 项，宗教页签内显示）

| 建筑 | 造价 | 效果 | 显示位置 |
|------|------|------|----------|
| 祭坛 `divineAltar` | 符咒 ×25, 碎石 ×40, 卷轴 ×8 | 虔诚产出 +0.02/s/座, 虔诚上限 +30/座 | 宗教页签 |
| 经阁 `scriptureHall` | 木板 ×20, 卷轴 ×15, 符咒 ×15 | 虔诚上限 +50/座, 学识 +0.01/s/座 | 宗教页签 |
| 祈愿池 `prayerPool` | 碎石 ×50, 符咒 ×20, 虔诚 ×10 | 虔诚产出 +0.015/s/座, 虔诚上限 +20/座, 满意度 +0.02/座 | 宗教页签 |

**信仰建筑放宗教页签**。理由：参考猫国 Religion tab 内建造，宗教页签若只有显示信息没有操作按钮手感空，村落页签已因分组折叠变重。BD 中这些建筑增加 `tab: 'f'` 标记。

##### 职业：祭司

| 职业 | 产出 | 前置 |
|------|------|------|
| 祭司 `priest` | 虔诚 +0.04/s/人（受训练加成） | 经阁(scriptureHall) ≥ 1 |

##### 工艺：炼圣油

| 配方 | 输入 | 输出 | 前置 |
|------|------|------|------|
| 炼圣油 `holyOilCraft` | 虔诚 ×15, 野莓 ×50 | 圣油 ×1 | graceLore (恩典感召) |

##### 神恩系统

**公式**（对标猫国太阳革命）:
```
gracePct = min(graceCap, (sqrt(1 + piety/100) - 1) × 50%)
```

- 默认 `graceCap = 50%`，graceLore 研究仅激活系统（cap 仍 50%），升级 #6(恩典深悟) 提升至 55%，升级 #10(恩典升华) 提升至 60%，Phase B 升级继续推进至 65%，Phase C 至 75%，Phase D 至 80%
- **效果**: 全局产出乘数 `allM += gracePct`（加法叠加进 allM，与月光井同类）
- **显示**: 宗教页签上区实时显示当前神恩百分比 + 虔诚/圣油存量

##### 基础仪式（2 项，宗教页签下区）

> 仪式占位设计已并入 [branch-divine.md §十一](branch-divine.md)（含数据结构、引擎集成草案、Phase 3 开发前待补完清单）。下表为 roadmap 侧摘要。

| 仪式 | 消耗 | 效果 | 冷却 |
|------|------|------|------|
| 祈福 `bless` | 虔诚 ×15 | 本季全职业产出 +20% | 每季 1 次 |
| 净化 `purify` | 圣油 ×3 | 污染/内乱 -15（固定值，对两条线都有用） | 每季 1 次 |

##### 升级（10 项，神启 A 范围）

branch-divine.md 中的升级 #1-10（共通基础），包括：祭坛精修、经阁扩典、祭司虔心、祈愿安宁、虔诚之瓮、恩典深悟(graceCap +5%→55%)、圣典抄录、信仰共鸣、圣油精炼、恩典升华(graceCap +5%→60%)。

#### 3.4 占卜子系统（每年 1 次决策）

> 轻量玄学子系统，为宗教页签增加决策密度。

**机制**:
- 每年初（春季第 1 天）自动抽签（3 选 1）
- 每签有正面效果 + 代价
- 玩家选择是否启用（不启用则无效果无代价）
- 签池初始 6 签，后续阶段扩展

**放置**: 宗教页签上区，神恩面板旁。

**兼容**: 占卜不依赖灵修/工业选择，两条路线玩家都可用。

> ✅ **3.4 实施记录**：占卜系统完整实现。数据层（data.js）新增 `DIVINATION_POOL` 常量，含 6 签（丰年/学海/商旅/隐逸/锻造/灵感），每签有 bonus + penalty 效果。引擎层（engine.js）新增 `divinationYearlyHook()` 在年初（春季第1天）触发，从签池随机抽 3 签；`getDivinationEffects()` 返回当前活跃年签效果。效果集成：calcR（产出乘数）、calcH（幸福）、calcPollution/calcUnrest（隐逸签率减）、bp()（学海签建筑造价+8%）、craft()（锻造签工艺+12%）、caravanArrivalProb（商旅签+15%）、远行奖励（隐逸签-15%）、灵术效果（灵感签+8%）。交互层（engine-actions.js）新增 `chooseDivination(idx)` / `skipDivination()`。UI 层（ui.js）新增 `showDivinationModal()` 3选1弹窗 + 宗教页签年签面板。migrate() 补齐 `G._divination/_divYear/_divPending/_divDrawn`。离线模式自动跳过占卜。cache-buster: data:43→44, engine:32→33, engine-actions:17→18, engine-systems:11→12, ui:31→32。

#### 3.5 枯风口解锁

**解锁条件**:
- 驿道 ≥ 3 + Tier 2 政体已选 + 密林远行完成 ≥ 1 次
- 叙事 6-8 段需在此阶段前完成写作

**资源供应意义**: 枯风口产出卷轴/香草/丝帛/古币，为两条线的中后期配方提供原料补给。

#### 3.6 通达副线 Phase A — 初交

**内容来源**: branch-diplomat.md Phase A（统一体系，不分主线）

**解锁方式**: 外交政策域选"通达"激活 `G.subBranch.T = true`；选"闭谷"则不开（闭谷有内政加成：基础资源 +5%，建筑花费 -3%）。

> **为什么 Phase 3 而不是 Phase 4？** 商驿/驿道/瞭望塔从游戏开局就存在，商队系统和竞拍已完整实现。通达 A 只是在已有商贸基础上加声誉/信物资源层——代码改动量小（~25 条目），且与枯风口解锁形成"外交+远行"协同叙事。延到 Phase 4 会让 Phase 3 只有 3 条线而 Phase 4 爆炸式 4 线齐发。

| 类型 | 数量 | 内容 |
|------|------|------|
| 资源 | 2 | 声誉 `renown` (mx:0, 建筑提供上限)、信物 `credential` (mx:25) |
| 建筑 | 3 | 使馆 `embassy`(renownP:.02, renownMx:30)、迎宾堂 `receptionHall`(renownMx:50, hapB:.015)、信驿 `courierPost`(credentialP:.005, renownP:.01) |
| 研究 | 4 | 山外之学(beyondLore)→使节礼法(envoyBasic)→信物制度(credentialLore)→声望学(reputeLore) |
| 职业 | 1 | 使者 `envoy`（renownP:.04，前置迎宾堂×1） |
| 工艺 | 1 | 制信物 `makeCredential`（声誉×15+卷轴×30→信物×1） |
| 升级 | 10 | 使馆精修/迎宾堂扩建/使者虔诚/声望深悟 等 |

**声誉公式**（对标神恩的 sqrt 曲线）:
```
reputeBonus = min(reputeCap, (sqrt(1 + renown/100) - 1) × 40%)
```
效果：仅作用于外交副线资源的正向产出（不影响主线资源）。默认上限 40%，升级可推至 60%。

**放置**: 外交建筑在**山外页签**（新增「外交」分组），声誉/信物在**山外页签**展示。

#### 3.7 事件池扩充

- 工业路：新增 5 条（油井火灾、蒸汽泄漏、钢板博览等）
- 灵修路：新增 5 条（共振失调、灵液溢出、符纹觉醒等）
- 宗教：新增 5 条（祭坛异兆、虔诚考验、圣油奇效等）
- 占卜：新增 3 条（签文应验、签文失灵等）
- 外交：新增 3 条（外族来使、信物交换、边境摩擦等）
- 通用：新增 3 条（枯风口地理发现、远方种族传闻）

#### 3.8 阶段三验收清单

- [ ] 工业路：油井→油桶→蒸汽机完整链路可用
- [ ] 灵修路：spiritInk/sigil 工艺激活 + 新建筑/研究/职业可用
- [ ] 能量系统 UI 显示（工业路）
- [ ] 灵脉平衡 UI 显示（灵修路），灵脉不足时产出衰减验证
- [ ] 宗教页签正常显示（divineLore 研究后）
- [ ] 虔诚/圣油资源正常产出、消耗、存储
- [ ] 祭坛/经阁/祈愿池在宗教页签内建造正常
- [ ] 祭司在村落页签分配正常，产出虔诚
- [ ] 神恩系统：虔诚越高 → gracePct 越高 → allM 加成越大（验证上限）
- [ ] 2 仪式在宗教页签下区可施放，冷却正确
- [ ] 占卜：每年初弹出抽签界面，3 选 1 或跳过
- [ ] 枯风口可远行，奖励正确
- [ ] `sb: 'D'` 门控正常：未研究 divineLore 时所有 D 标记内容不可见
- [ ] `sb: 'T'` 门控正常：未选通达政策时所有 T 标记内容不可见
- [ ] 通达 Phase A：使馆/迎宾堂/信驿可建，声望累积，信物可制，使者可分配
- [ ] 两条线的 B 阶段升级可购买
- [ ] ~~灵修灵术 fateWeave 在营火可施放~~ → 已移至阶段二验收（fateWeave 前置 silkWeave 在阶段二即可完成）

> ⚠️ **已裁决**：fateWeave（织命）前置为 silkWeave（丝织），丝织为阶段二研究。织命应归属**阶段二**验收，从阶段三验收清单移除。

---

## 七、阶段四：分化之路（v0.19）

<!-- SECTION: phase-4 -->

### 实施进度

| 步骤 | 标题 | 状态 | commit | 详细任务卡 |
|------|------|------|--------|---------|
| 4.1 | 工业 C — 精金时代（寒钛/合金 + 能量产消博弈） | ✅ 已完成 | 9c99f56 | §七 4.1 |
| 4.2 | 灵修 C — 化形（晶丝/辉芒 + 灵脉消耗端） | ✅ 已完成 | 9c99f56 | §七 4.2 |
| 4.3 | 神启 Phase B — 分叉落地（教团/秘仪） | ✅ 已完成 | 9c99f56 | §七 4.3 |
| 4.4 | 通达 Phase B — 结邦（邦交系统 7 族 × 深度 1-2） | ✅ 已完成 | 9c99f56 | §七 4.4 |
| 4.5 | 6 神选定（宗教页签新区域） | ✅ 已完成 | 0191007 | §七 4.5 |
| 4.6 | 事件池扩充（教团/秘仪/邦交/工业C/灵修C） | ✅ 已完成 | f57aa82 | §七 4.6 |
| 4.7 | 阶段四验收清单 | ✅ 已完成 | 573e6db | §七 4.7 |

> mulerun 必须按上表顺序执行。每完成一步，更新 `状态` 为 `✅` 并填入 `commit` SHA。

### 目标

四条内容线全部深化。工业/灵修进入 Phase C（精金/化形），神启分叉落地（教团/秘仪），通达进入结邦阶段。6 神选定。

### 前置条件（玩家侧）

- 工业路 C：steamEngine ≥ 2 + combustion 研究链
- 灵修路 C：灵修 B 完成 + resonance 建筑 ≥ 3
- 神启 B：graceLore 研究 + 虔诚 ≥ 200 + 新研究门
- 通达 B：声望学 `reputeLore` + 使馆 ≥ 2 + 声誉 ≥ 100

### 步骤拆解

#### 4.1 工业 C — 精金时代

**内容来源**: branch-industry.md Phase C

| 维度 | 内容 |
|------|------|
| 资源 | 6：寒钛 `titan`、合金 `alloy`、纲要 `outline`、钛构件 `titanPart`、混凝柱 `pillar`、星图 `starchart` |
| 建筑 | 5：calcFurnace(煅烧炉)、refinery(精炼厂)、observatory(望远台)、cleanForest(净林)、titanVault(钛库) |
| 研究 | 12：combustion→assemblyLine、transmission→roadwork、cleanWind + 精金链研究 |
| 职业 | 1：精炼师 `refiner` |
| 工艺 | 4：寒钛精炼、合金锻造、纲要绘制、钛构件加工 |
| 升级 | #49-78（30 个） |

**关键平衡点**: 能量系统正式进入**产消博弈**。steamEngine 产能 vs factory/combustEngine 耗能。污染在这个阶段也会显著升高。

**资源链**: 铁/木/石 → 煤/钢 → 火油 → **寒钛/合金** → 纲要/钛构件/混凝柱/星图

#### 4.2 灵修 C — 化形

**内容来源**: branch-mystic.md Phase C

| 维度 | 内容 |
|------|------|
| 资源 | 5：晶丝 `crystalSilk`、辉芒 `radiance`、灵核 `spiritCore`、形魄 `formSoul`、灵图 `spiritChart` |
| 建筑 | 5：crystalCave(水晶洞)、radianceDais(辉映台)、coreForge(灵核锻)、radiantGrove(辉光林)、chartHall(灵图阁) |
| 研究 | 12 |
| 职业 | 1：化形师 `shapemaster` |
| 工艺 | 5 |
| 升级 | #49-78（30 个） |

**灵脉消耗端正式上线**：化形建筑大量消耗灵脉（leylineC），与聚灵阵的灵脉产出形成平衡。

#### 4.3 神启 Phase B — 分叉落地

神启副线根据主线选择**自动分叉**为教团(工业)或秘仪(灵修)。

##### 教团路（工业 + 神启玩家）

**内容来源**: branch-divine.md 阶段 B-教团

| 类型 | 数量 | 内容 |
|------|------|------|
| 资源 | 2 | 圣火 `holyFlame`、圣铁 `holyIron` |
| 建筑 | 6 | 圣工坊、圣火窑、教令堂、审判庭、圣铁库、圣油坊 |
| 研究 | 6 | 圣火术→教令学→圣工论→审判论；圣铁锻造→教会建筑学 |
| 职业 | 2 | 狂信者、圣工匠 |
| 工艺 | 5 | 圣火锻、圣铁铸、圣水、教令状、圣铁齿轮 |
| 系统 | 1 | **教令系统**（限时全局 buff，最多同时 3 个） |
| 升级 | 20 | #11-30 |

**教令系统**: 消耗虔诚+圣火 → 发布教令 → 全局 buff 持续 N 天。参考猫国的 "Order of the Sun" 信仰转化机制。

##### 秘仪路（灵修 + 神启玩家）

**内容来源**: branch-divine.md 阶段 B-秘仪

| 类型 | 数量 | 内容 |
|------|------|------|
| 资源 | 2 | 神露 `ambrosia`、秘知 `gnosis` |
| 建筑 | 4 | 秘仪殿、圣林、化神池、禁典阁 |
| 研究 | 5 | 秘仪入门→圣林学→化神论→禁典研读→飞升论 |
| 职业 | 1 | 秘仪师 |
| 工艺 | 3 | 凝露、秘知残篇、化神药 |
| 系统 | 1 | **飞升阶梯**（5 重门，前 1-2 门在阶段四开放） |
| 升级 | 20 | #11-30 |

**飞升阶梯**: 不可逆永久蜕变，每门花费递增、代价递增。阶段四开放第 1-2 门，第 3-4 门在阶段五，第 5 门在阶段六。

#### 4.4 通达 Phase B — 结邦

**内容来源**: branch-diplomat.md Phase B

**前置条件**: 声望学 `reputeLore` + 使馆 ≥ 2 + 声誉 ≥ 100

**核心系统解锁：邦交系统**（7 族 × 5 级深度）

邦交对象为游戏中已有的 7 个 NPC 种族（河獭·哗啦、白鹤·拂月、旧墟遗民、山猫·阿斑、雪鸮·夜眼、水鼠·囤囤、考拉·小曼）。Phase B 激活深度 1-2。

| 类型 | 数量 | 内容 |
|------|------|------|
| 资源 | 2 | 邦书 `charter` (mx:0, 建筑提供上限)、异珍 `exotic` (mx:15) |
| 建筑 | 4 | 邦交堂 `charterHall`、异珍阁 `exoticVault`、远客居 `guestQuarter`、会盟台 `alliancePlatform` |
| 研究 | 5 | 结邦之礼→异珍鉴赏→远客之道→会盟论→深盟序言 |
| 职业 | 1 | 邦交官 `diplomat`（charterP:.015） |
| 工艺 | 3 | 制邦书、远交礼包、邦书换信物 |
| 升级 | 20 | #11-30 |

**新远行目的地**（深度 3 解锁，7 个）: 河獭溪谷、白鹤云栖、旧墟深区、猫岭、雪鸮暗巢、水鼠洞穴、考拉树冠

**邦交深度**:

| 深度 | 名称 | 消耗 | 效果 | 维护 |
|------|------|------|------|------|
| 1 | 结识 | 信物×5+声誉×30 | 该族商队来访率 +20%，浅层加成 | 无 |
| 2 | 友邦 | 信物×12+邦书×3+声誉×80 | 浅层加成翻倍，商队售价 -10% | 无 |
| 3 | 盟邦 | 邦书×10+信物×20+声誉×150 | 深层加成，专属远行目的地 | 邦书 .002/tick |
| 4 | 至交 | 邦书×25+盟印×3+声誉×300 | 深层加成加强，驻谷代表（永久NPC） | 邦书 .005/tick |
| 5 | 永盟 | 盟印×8+邦书×40+声誉×600 | 深层加成极强，终极被动 | 邦书 .010/tick |

#### 4.5 6 神选定（宗教页签新区域）

> 6 神设计已定稿——[branch-divine.md §十三](branch-divine.md) 8 项待补完清单全部完成（2026-05-06）。下方为 roadmap 侧摘要。

**6 神**（定稿）：山神 / 月狐 / 篝火神 / 雾中无名 / 祖灵集合 / 金尾商君

**机制**:
- 宗教页签新增"神祇"子区
- 玩家选定主神（可改宗，代价：卷轴 ×80 + 古币 ×30 + 虔诚归零）
- 每神提供不同的被动加成 + 专属仪式 2 个
- 每神 2-3 教派（内部细分，影响 buff 偏向）

**与分叉的关系**: 神的选择独立于教团/秘仪分叉。教团玩家和秘仪玩家可以选同一个神。

#### 4.6 事件池扩充

- 教团路：新增 5 条（教令颁布、圣火试炼、信仰审判等）
- 秘仪路：新增 5 条（密室冥想、神露异象、秘知碎片等）
- 邦交：新增 3 条（邦书签订、异珍献礼、远客到访等）
- 工业/灵修 C 阶段：新增 5+5 条

#### 4.7 阶段四验收清单

- [x] 工业 C：精金资源链完整可用，能量产消博弈生效（6 资源 5 建筑 1 职业 15 研究全实装）
- [x] 灵修 C：化形建筑完整可用，灵脉消耗端上线（5 资源 5 建筑 1 职业 12 研究全实装）
- [x] 教团路内容完整可用（2 资源 6 建筑 2 职业 holySmith/fanatic）
- [x] 秘仪路内容完整可用（2 资源 4 建筑 1 职业 mysticAdept；禁典阁实际 ID 为 forbiddenLib）
- [x] 教令系统：发布→buff 生效→到期消失，最多 3 同时（实测：发布扣资源、槽位上限正确、重复发布被拒、冷却生效）
- [x] 飞升阶梯：第 1-2 门可开，不可逆确认，永久效果正确（修复 openGate 缺失 phase 检查的防御性 bug）
- [x] 6 神可选，改宗代价正确（DEITY_DATA 6 神，convertDeity 卷轴 80 + 古币 30 + 虔诚归零 + 5 季冷却）
- [x] 通达 Phase B：邦交系统 7 族 ×深度 1-2 完整可用，邦书/异珍资源链正常
- [x] `sb: 'D'` 分叉内容按主线自动过滤（教团 6 建筑 sb:D br:I + 秘仪 4 建筑 sb:D br:M，由 anyBranchLocked 过滤）
- [x] 四条内容线均有推进，无空转

**验收时发现并修复的问题（2026-05-08）**：
- `openGate()` 函数缺 phase 检查（UI 层有，函数层缺）→ 已加 phase 4 限 2 门 / phase 5 限 4 门 / phase 6 限 5 门

**已知遗留（不影响 phase 4 验收）**：
- `ui.js:1582` 邦交深度上限硬编码 `depth < 2`，phase 5 时即使研究了 `deepAlliancePrelude` 也不显示深化按钮——属于 phase 5 的修复任务，记录到阶段五开发清单
- `ui.js:2069` 飞升阶梯 phaseLimit 缺 phase 6 处理（第 5 门进不去）——属于 phase 6 的修复任务

---

## 八、阶段五：深盟与成熟（v0.20）

<!-- SECTION: phase-5 -->

### 实施进度

| 步骤 | 标题 | 状态 | commit | 详细任务卡 |
|------|------|------|--------|---------|
| 5.1a | 工业 D — 资源 + 存储辉匣 | ✅ 已完成 | 4db47a9 | §八 5.1a |
| 5.1b | 工业 D — 主建筑加速器+熔炉 | ✅ 已完成 | 8f976ca | §八 5.1b |
| 5.1c | 工业 D — 研究链 13 项 | ⏳ 进行中 | - | §八 5.1c |
| 5.1d | 工业 D — 职业辉能士 + 3 配方 | ⬜ 未开始 | - | §八 5.1d |
| 5.1e | 工业 D — 升级 #79-106 | ⬜ 未开始 | - | §八 5.1e |
| 5.1f | 工业 D — UI 集成 + 子阶段验收 | ⬜ 未开始 | - | §八 5.1f |
| 5.2 | 灵修 D — 深寂（元念/寂石 + 灵契 + 寂石冥想） | ⬜ 未开始 | - | §八 5.2 |
| 5.3 | 神启 Phase C（教团C/秘仪C + 飞升 3-4 门） | ⬜ 未开始 | - | §八 5.3 |
| 5.4 | 通达 Phase C — 深盟（邦交深度 3-4 + 盟印） | ⬜ 未开始 | - | §八 5.4 |
| 5.5 | 阶段五验收清单 | ⬜ 未开始 | - | §八 5.5 |

> mulerun 必须按上表顺序执行。每完成一步，更新 `状态` 为 `✅` 并填入 `commit` SHA。

### 目标

主线进入 Phase D（工业辉能/灵修深寂），神启进入 Phase C（信仰深化），通达进入 Phase C（深盟）。深层机制上线。

### 前置条件（玩家侧）

- 工业 D：Phase C 完成 + titan 相关研究链
- 灵修 D：Phase C 完成 + 化形相关研究链
- 神启 C：Phase B 研究完成 + 教团/秘仪核心建筑 ≥ 3
- 通达 C：深盟序言 `deepAlliancePrelude` + 任一族深度 ≥ 3

### 步骤拆解

#### 5.1 工业 D — 辉能

**内容来源**: branch-industry.md Phase D（资源 §二.220-247、能量 §三.264-272、建筑 §五.339-373、研究 §四.493-509、升级 §九.718-768、配方 §六）

| 维度 | 内容 |
|------|------|
| 资源 | 4：辉石 `uranium`、重晶 `thorium`、镜合金 `mirrorAlloy`、密典 `codex` |
| 建筑 | 3：accelerator(加速器)、furnace(熔炉)、radianceBox(辉匣) |
| 研究 | 13：裂变/辉能/粒子学/屏蔽术/增殖论/重晶转化/超导/镜锻/幽理/辐射学/机关自驱/能网/深层辉脉 |
| 职业 | 1：辉能士 `radianceExpert` |
| 配方 | 3：转化重晶 `craftThorium`、锻镜合金 `craftMirrorAlloy`、编密典 `craftCodex` |
| 升级 | #79-106（28 个） |

**资源链**: …→ 寒钛/合金 → **辉石/重晶** → 镜合金/密典

**关键平衡点**: 加速器吃 5 能量+寒钛、熔炉产 5 能量+全产出 +5%。两者互锁：先建熔炉补能源缺口，才能建加速器。

##### 子任务拆分（按依赖顺序，每子任务一个 commit）

| 子任务 | 标题 | 涉及范围 | 估算 LoC | 依赖 |
|--------|------|---------|---------|------|
| 5.1a | 资源 4 + 存储辉匣 | data.js RD 4 + BD radianceBox + migrate | ~80 | Phase 4 ✅ |
| 5.1b | 主建筑加速器+熔炉 | data.js BD 2 条 | ~50 | 5.1a |
| 5.1c | 研究链 13 项 | data.js UD 13 条 | ~80 | 5.1a + 5.1b |
| 5.1d | 职业 1 + 配方 3 | data.js JD radianceExpert + CD 3 条 | ~50 | 5.1c |
| 5.1e | 升级 #79-106（28 项） | data.js UPGD 28 条 + engine.js effect 处理 | ~150 | 5.1d |
| 5.1f | UI 集成 + 5.1 整体验收 | ui.js 检查 + 旧存档兼容 + 能量平衡测试 | ~30 | 5.1a-e |

> 每子任务独立 commit，独立通过验收清单。最终 5.1f 完成后整个 §八 5.1 标 ✅。

---

##### 5.1a 资源 4 + 存储辉匣

> 📋 **任务卡** | **状态**：⏳ 进行中 | **前置**：✅ Phase 4 完成 (commit dd3f013)

###### 涉及文件清单

| 文件 | 行号 | 改动 | 内容 |
|------|------|------|------|
| data.js RD | 在 starchart 之后追加 | 新增 4 条 | uranium/thorium/mirrorAlloy/codex |
| data.js BD | 在 titanVault 之后追加 | 新增 1 条 | radianceBox 辉匣 |
| engine.js migrate() | phase 4 资源 init 之后 | 加 4 条 | G.res.uranium/thorium/mirrorAlloy/codex 默认值 |
| index.html | data.js 行 | cache-bust 递增 | v=55→56 |

###### 逐步执行（每步 verify）

**步骤 1**：data.js RD 在 starchart 之后追加 4 资源
- uranium: `{ n: '辉石', c: '加工', mx: 0, lock: 1 }` （核心资源，跟随 phase C titan/alloy 模式 mx:0；上限靠加速器/辉匣给）
- thorium: `{ n: '重晶', c: '加工', mx: 30, lock: 1 }` （中间材料，跟随 outline 模式 mx:30）
- mirrorAlloy: `{ n: '镜合金', c: '加工', mx: 15, lock: 1 }`
- codex: `{ n: '密典', c: '知识', mx: 10, lock: 1 }` （密典是研究材料，归"知识"类）
- ⚠️ c 字段只能用现有类别（'基础'/'加工'/'知识'/'贸易'/'研究'），不能新增"工业"类别——RD 类别系统不支持
- verify: `preview_eval "!!RD.uranium && !!RD.thorium && !!RD.mirrorAlloy && !!RD.codex"` → true

**步骤 2**：data.js BD 追加 radianceBox
- `n: '辉匣', t: 'f'`（存储建筑）
- 造价：`p: [{ r: 'alloy', b: 10, k: 1.18 }, { r: 'uranium', b: 5, k: 1.18 }]`
- 效果：`e: { uraniumMx: 30, thoriumMx: 10 }`
- 解锁：`uq: { b: { accelerator: 1 } }, br: 'I', phase: 4`（先用 phase: 4 因为 accelerator 解锁需要"裂变"研究，研究在 5.1c）

> ⚠️ **注意**：phase 字段保持 4 而非 5，因为 phase 5 还没引入新阶段判定。等 phase 5 阶段判定加上后再升 phase: 5（不在 5.1 范围）

- verify: `preview_eval "!!BD.radianceBox && BD.radianceBox.e.uraniumMx === 30"` → true

**步骤 3**：engine.js migrate() 加 4 资源默认值
- 在 phase 4 资源 (`G.res.starchart` 等) init 之后追加
- 模式：`G.res.uranium = G.res.uranium || { v: 0, mx: 50, on: false };`（其他 3 资源同模式）
- verify: 旧存档加载后 G.res.uranium 存在 + console 0 error

**步骤 4**：index.html data.js cache-bust 递增（v=55→56）

###### 验收清单（5.1a 单独通过才 commit）

- [ ] preview_console_logs level=error = 0
- [ ] `preview_eval "[RD.uranium,RD.thorium,RD.mirrorAlloy,RD.codex].every(x=>x)"` → true
- [ ] `preview_eval "BD.radianceBox && BD.radianceBox.t === 'f'"` → true
- [ ] 旧存档加载：`preview_eval "G.res.uranium && G.res.uranium.v === 0"` → true
- [ ] cache-buster: data.js v 已递增

---

##### 5.1b 主建筑加速器+熔炉

> 📋 **任务卡** | **状态**：⬜ 未开始 | **前置**：✅ 5.1a

###### 涉及文件清单

| 文件 | 行号 | 改动 | 内容 |
|------|------|------|------|
| data.js BD | 在 radianceBox 之前 | 新增 2 条 | accelerator 加速器 + furnace 熔炉 |
| index.html | data.js 行 | cache-bust 递增 | +1 |

###### 逐步执行

**步骤 1**：data.js BD 追加 accelerator
- `n: '加速器', t: 'b'`
- 造价：`p: [{ r: 'titan', b: 50, k: 1.22 }, { r: 'alloy', b: 15, k: 1.22 }, { r: 'draft', b: 10, k: 1.22 }]`
- 效果：`e: { uraniumP: 0.003, titanP: -0.015, energy: -5, pollutionP: 0.03 }`
- 解锁：`uq: { u: { fission: 1 } }, br: 'I', phase: 4`（fission = 裂变研究，5.1c 引入；先放 uq 待研究入库后才能解锁）
- verify: `preview_eval "BD.accelerator.e.uraniumP === 0.003"` → true

**步骤 2**：data.js BD 追加 furnace
- `n: '熔炉', t: 'b'`
- 造价：`p: [{ r: 'titan', b: 30, k: 1.22 }, { r: 'alloy', b: 10, k: 1.22 }, { r: 'uranium', b: 5, k: 1.22 }]`
- 效果：`e: { energy: 5, uraniumP: -0.001, allM: 0.05, pollutionP: 0.025 }`（allM 全产出 +5%）
- 解锁：`uq: { u: { radiantPower: 1 } }, br: 'I', phase: 4`（radiantPower = 辉能研究）
- verify: `preview_eval "BD.furnace.e.allM === 0.05"` → true

**步骤 3**：index.html data.js cache-bust 递增

###### 验收清单

- [ ] preview_console_logs level=error = 0
- [ ] `preview_eval "BD.accelerator && BD.furnace"` → true
- [ ] `preview_eval "BD.accelerator.e.energy === -5 && BD.furnace.e.energy === 5"` → true
- [ ] 旧存档加载不崩
- [ ] cache-buster: data.js v 已递增

---

##### 5.1c 研究链 13 项

> 📋 **任务卡** | **状态**：⬜ 未开始 | **前置**：✅ 5.1a + 5.1b

###### 涉及文件清单

| 文件 | 改动 | 内容 |
|------|------|------|
| data.js UD | 新增 13 条 | fission/radiantPower/particle/shielding/proliferation/thoriumConv/superCond/mirrorForge/voidPrinciple/radiation/autoMech/powerNet/deepRadiance |
| index.html | cache-bust | +1 |

###### 13 项研究 ID 映射表

| ID | 中文 | 费用 | 前置 | 解锁 |
|---|---|---|---|---|
| `fission` | 裂变 | 学识1800,寒钛50,合金10,蓝本10 | refining + 精炼厂×2 | 加速器、辉石、辉匣 |
| `radiantPower` | 辉能 | 学识2000,辉石10,合金15 | fission + 加速器×1 | 熔炉 |
| `particle` | 粒子学 | 学识1600,辉石15,合金8 | fission | 粒子聚焦升级 |
| `shielding` | 屏蔽术 | 学识1500,辉石20,混凝柱5 | radiantPower | 屏蔽反应室升级 |
| `proliferation` | 增殖论 | 学识1700,辉石30,蓝本10 | radiantPower + 熔炉×2 | 增殖反应升级 |
| `thoriumConv` | 重晶转化 | 学识1500,辉石30 | radiantPower | 转化重晶配方、重晶 |
| `superCond` | 超导 | 学识1800,合金15,辉石10 | particle | 超导线圈升级 |
| `mirrorForge` | 镜锻 | 学识1600,合金10,辉石8 | refining + radiantPower | 锻镜合金配方、镜合金 |
| `voidPrinciple` | 幽理 | 学识2000,纲要5,辉石15 | systemTheory + radiantPower | 编密典配方、密典 |
| `radiation` | 辐射学 | 学识1500,辉石20,合金10 | radiantPower | 辐射防护升级 |
| `autoMech` | 机关自驱 | 学识2200,合金15,辉石20,蓝本15 | automation + radiantPower | 工厂/煅烧炉无人运转 |
| `powerNet` | 能网 | 学识1900,辉石15,合金12,混凝柱5 | superCond + 熔炉×2 | 能量共享 +20% |
| `deepRadiance` | 深层辉脉 | 学识2100,辉石25,重晶8 | proliferation + 加速器×2 | 加速器寒钛-30%、辉石上限+50% |

###### 验收清单

- [ ] 13 项研究 ID 全在 UD 中
- [ ] preview_console_logs level=error = 0
- [ ] `preview_eval "Object.keys(UD).filter(k=>UD[k].phase===4&&UD[k].br==='I').length"` 数量增加 13
- [ ] 解锁链：完成 fission 后 BD.accelerator 进 G.bld[].on
- [ ] 旧存档加载不崩

---

##### 5.1d 职业辉能士 + 3 配方

> 📋 **任务卡** | **状态**：⬜ 未开始 | **前置**：✅ 5.1c

###### 涉及文件清单

| 文件 | 改动 | 内容 |
|------|------|------|
| data.js JD | 新增 1 条 | radianceExpert 辉能士 |
| data.js CD | 新增 3 条 | craftThorium/craftMirrorAlloy/craftCodex |
| index.html | cache-bust | +1 |

###### 逐步执行

**步骤 1**：JD radianceExpert
- `n: '辉能士', d: '辉石增产 + 熔炉效率'`
- 产出：`e: { uraniumP: 0.005 }`
- 解锁：`uq: { b: { furnace: 1 } }, br: 'I', phase: 4`

**步骤 2**：CD 3 配方
- `craftThorium`: `inp: [{r:'uranium',a:200}], out: [{r:'thorium',a:1}], uq: { u: { thoriumConv: 1 } }, br: 'I', phase: 4`（重晶浓缩升级后比率 200→150）
- `craftMirrorAlloy`: `inp: [{r:'titan',a:20},{r:'alloy',a:10},{r:'uranium',a:5}], out: [{r:'mirrorAlloy',a:1}], uq: { u: { mirrorForge: 1 } }`
- `craftCodex`: `inp: [{r:'outline',a:5},{r:'uranium',a:15},{r:'lore',a:200}], out: [{r:'codex',a:1}], uq: { u: { voidPrinciple: 1 } }`

###### 验收清单

- [ ] `preview_eval "JD.radianceExpert.e.uraniumP === 0.005"` → true
- [ ] `preview_eval "CD.craftThorium && CD.craftMirrorAlloy && CD.craftCodex"` → true
- [ ] preview_console_logs level=error = 0
- [ ] 旧存档加载不崩

---

##### 5.1e 升级 #79-106（28 项）

> 📋 **任务卡** | **状态**：⬜ 未开始 | **前置**：✅ 5.1d

###### 升级分类

| 类别 | 编号 | 数量 | 备注 |
|------|------|------|------|
| 工具类 | #79-81 | 3 | 钛镐头、合金锯、辉石钻头（叠加 #79-81 的第三层）|
| 产出倍率类 | #82-90 | 9 | 粒子聚焦、增殖反应、镜面精磨、钍稳定器、辉石催化、重晶共鸣、深层煅烧、加速裂解、密典洞见 |
| 存储类 | #91-93 | 3 | 辉石保险库、镜合金容器、辉能压缩仓 |
| 消耗减免类 | #94-99 | 6 | 屏蔽反应室、超导线圈、重晶浓缩、辐射防护、辉能蓄池、密典注解 |
| 自动化类 | #100-103 | 4 | 辉能自动锻、自动重晶转、自动镜锻、智能调度 |
| 跨系统类 | #104-106 | 3 | 辉能灯塔、辉石铸币、辉能供暖 |

###### 涉及文件清单

| 文件 | 改动 | 内容 |
|------|------|------|
| data.js UPGD | 新增 28 条 | 见 branch-industry.md §九.718-768 |
| engine.js | 加 effect 处理 | 处理新引入的 _effect 字段（如 `_uraniumDecayReduce`、`_energyShortageReduce` 等）|
| index.html | cache-bust | +1 |

###### 关键 effect 字段（engine.js 需读）

- `_uraniumDecayReduce`: 加速器寒钛消耗减免（#95 超导线圈 -2 能耗、#99 密典注解 -15% 研究等）
- `_energyShortageReduce`: 能量不足时衰减速率减免（#98 辉能蓄池 -50%）
- `_powerNetBonus`: 能网激活后净能量盈余转产出（10 盈余 = +1% 全产出）
- `_winterPenaltyReduce`: 冬季惩罚减免（#106 辉能供暖 -50%）

> ⚠️ **不是所有 28 升级都需要 engine.js 改动**——大多数升级用现有 jobM/buildM/allM/_resCap 等已支持的字段。仅 `#95 超导线圈`/`#98 辉能蓄池`/`#106 辉能供暖`/`#108 能网` 等少数需要新 effect。在 5.1e 实施时逐项确认 effect 是否已支持。

###### 验收清单

- [ ] 28 升级全在 UPGD 中
- [ ] `preview_eval "Object.keys(UPGD).filter(k=>UPGD[k].phase===4&&UPGD[k].br==='I').length"` 增加 28
- [ ] preview_console_logs level=error = 0
- [ ] 完成 #95 超导线圈：`preview_eval` 加速器能耗变 3 而非 5
- [ ] 旧存档加载不崩

---

##### 5.1f UI 集成 + 5.1 整体验收

> 📋 **任务卡** | **状态**：⬜ 未开始 | **前置**：✅ 5.1a-e

###### 涉及文件清单

| 文件 | 改动 | 内容 |
|------|------|------|
| ui.js | 检查 | 4 资源在资源面板「工业」分类正确显示 |
| ui.js | 检查 | 加速器/熔炉/辉匣 在工坊页签正确显示 |
| ui.js | 检查 | 辉能士在村落页签可分配 |
| roadmap-v2.md | 5.1a-f 状态 ⏳→✅ | 进度表更新 |

###### 整体验收清单（5.1 全部子任务通过 + 整体平衡测试）

- [ ] preview reload 后 console.error = 0
- [ ] 完整流程：
  - 完成 fission 研究 → 看到加速器
  - 建加速器 → uranium 开始产出，能量 -5
  - 完成 radiantPower → 看到熔炉
  - 建熔炉 → 能量 +5、全产出 +5%（净 0 能量）
- [ ] 净能量 < 0 时建筑产出按比例衰减（产消博弈生效）
- [ ] 配方面板可制作 craftThorium / craftMirrorAlloy / craftCodex
- [ ] 旧存档（无 phase 5 字段）加载完整不崩，可推进
- [ ] roadmap §八 进度表 5.1a-f 全 ✅，5.2 状态 ⬜→⏳

###### 完成后

1. 全部子任务验收过 → 5.1 整体 commit message：`docs: §八 5.1 工业 D 验收完成`（如有 docs 改动）
2. 更新 roadmap §八 5.1a-f 全 ✅ + 填 commit SHA
3. 5.2 状态 ⬜→⏳
4. 不主动 push

#### 5.2 灵修 D — 深寂

**内容来源**: branch-mystic.md Phase D

| 维度 | 内容 |
|------|------|
| 资源 | 4：元念 `primordial`、寂石 `silenceStone`、镜灵 `mirrorSpirit`、虚典 `voidCodex` |
| 建筑 | 9：primordialPool(元念池)、silenceCave(寂石窟)、spiritVault(灵匣)、mirrorDais(镜灵台)、codexHall(幽典阁) + 4 |
| 研究 | 18 |
| 职业 | 2 |
| 灵术/工艺 | 5 |
| 升级 | #79-120（42 个） |
| **独占系统** | 灵契系统（5 选 1，可通过「灵契祈愿」灵术切换）+ 寂石冥想（时间跳跃） |

##### 灵契系统（灵修 Phase D 独占）

5 种灵契中选择 1 种激活，同时只能激活 1 种，可通过「灵契祈愿」灵术切换。灵契提供被动增益 + 独占资源来源。

> +神启时：额外灵契「神灵契」（产出虔诚相关资源，见 hook H6）
> +通达时：额外灵契「邦交契」（产出通达外交资源，见灵修线 hook H6）
>
> ⚠️ **已统一**：灵契 Hook 名统一为"邦交契"（以 branch-diplomat.md 为准）。

##### 寂石冥想（灵修 Phase D 独占）

时间跳跃机制。消耗寂石 `silenceStone` → 跳过 N 天 → 所有建筑在跳跃期间正常产出结算。

- 跳跃期间躁念按正常速率累积（惩罚生效）
- +神启时：冥想期间神祇面板建筑也结算（hook H7）
- +通达时：冥想期间通达外交建筑产出也结算（灵修线 hook H7）
- 参考：猫国的 "Chronosphere" 时间操控概念

#### 5.3 神启 Phase C

##### 教团 C（工业+神启）

**内容来源**: branch-divine.md Phase C-教团

| 维度 | 内容 |
|------|------|
| 资源 | 3：颂咏 `hymn`、圣骸 `holyRelic`、圣典 `holyScripture` |
| 建筑 | ~8：cathedral(大教堂)、hymnHall(颂咏堂) + 高阶信仰建筑 |
| 研究 | ~12：颂咏术、圣骸学、圣典编纂 等 |
| 升级 | ~35：#31-65，含「神佑论」(太空终局追加神恩加成×2) |

大教堂：终局建筑，全局产出 allM: .05/座，造价含颂咏+圣火+虔诚，k=1.25。

**教团不改变工业的太空终局**，但让太空任务获得强力的神恩乘数加持。

##### 秘仪 C（灵修+神启）

**内容来源**: branch-divine.md Phase C-秘仪

| 维度 | 内容 |
|------|------|
| 资源 | 3：神墨 `divineInk`、化神石 `apotheosisStone`、禁典 `forbiddenCodex` |
| 建筑 | ~8：深层秘仪建筑（高阶化神/飞升载体） |
| 研究 | ~12：深层秘仪、第三四门相关研究 等 |
| 升级 | ~35：#31-65，含「神升论」(完成飞升终局条件) |
| 系统 | 飞升阶梯第 3-4 门开放 |

飞升阶梯：第三门起有永久代价（幸福上限 -5%、人口上限 -5/-10、基础产出 -20%）。第五门 + 神升论 = 终局条件。

#### 5.4 通达 Phase C — 深盟

**内容来源**: branch-diplomat.md Phase C

**前置条件**: 深盟序言 `deepAlliancePrelude` + 任一族深度 ≥ 3。激活邦交深度 3-4。

| 维度 | 内容 |
|------|------|
| 资源 | 1：盟印 `allianceSeal` (mx:8) |
| 建筑 | 4：盟约殿 `covenantHall`、朝贡庭 `tributeCourt`、万族馆 `speciesHall`、净盟殿 `purifyHall` |
| 研究 | 10：盟印术→盟约殿学→朝贡记→万族志→净盟学→盟约使学→盟印蒸馏→万族之智→跨族共鸣→深盟通达 |
| 职业 | 1：盟约使 `covenantKeeper`（charterP:.01, allianceSealP:.002） |
| 工艺 | 4：铸盟印、远交互市、声望蒸馏、万族露 |
| 升级 | #31-55（25 个） |

#### 5.5 阶段五验收清单

- [ ] 工业 D：辉能资源链完整可用
- [ ] 灵修 D：深寂系统 + 灵契 + 寂石冥想
- [ ] 神启 C-教团：大教堂+颂咏系统
- [ ] 神启 C-秘仪：深层秘仪建筑+飞升第 3-4 门
- [ ] 通达 C：邦交深度 3-4 可用，盟印系统完整
- [ ] 四条内容线均有推进

---

## 九、阶段六：远望（v0.21）

<!-- SECTION: phase-6 -->

### 实施进度

| 步骤 | 标题 | 状态 | commit | 详细任务卡 |
|------|------|------|--------|---------|
| 6.1 | 工业 E-前半：太空任务 1-4 | ⬜ 未开始 | - | §九 6.1 |
| 6.2 | 灵修 E-前半：灵途任务 1-4 | ⬜ 未开始 | - | §九 6.2 |
| 6.3 | 神启 Phase D — 终局整合（教团D/秘仪D） | ⬜ 未开始 | - | §九 6.3 |
| 6.4 | 通达 Phase D — 共谷（邦交深度 5 + 共谷门） | ⬜ 未开始 | - | §九 6.4 |
| 6.5 | 阶段六验收清单 | ⬜ 未开始 | - | §九 6.5 |

> mulerun 必须按上表顺序执行。每完成一步，更新 `状态` 为 `✅` 并填入 `commit` SHA。

### 目标

工业/灵修进入终局任务前半（E前），神启推向终局整合（Phase D），通达推向共谷巅峰（Phase D）。为最终阶段做准备。

### 步骤拆解

#### 6.1 工业 E-前半：太空任务 1-4

**内容来源**: branch-industry.md Phase E 前半

| 维度 | 内容 |
|------|------|
| 任务 | 4 个：离渊→望白崖→入赤潮→朝熔金 |
| 资源 | 7：燃素 `kerosene`、推进剂 `propellant`、星帆 `starsail`、寒铎 `frostbell`、虚尘 `voidDust`、晨曦矿 `dawnOre`、露珀 `dewAmber` |
| 建筑 | 9（升渊台、悬目、浮巢、白崖哨、赤潮矿脉、熔金汲取、暗流中继、寂弦共振器、归寂舟） |
| 研究 | ~8 |
| 升级 | ~15 |

**资源链**: …→ 辉石/重晶 → **燃素/推进剂/星帆/寒铎**

#### 6.2 灵修 E-前半：灵途任务 1-4

**内容来源**: branch-mystic.md Phase E 前半

| 维度 | 内容 |
|------|------|
| 任务 | 4 个：離形→望渊崖→入曦潮→朝曦光 |
| 资源 | ~4：永弦 `eternalString`、星幕 `starVeil`、曦尘 `dawnDust`、寂铃 `silenceBell` |
| 建筑 | 4-5（与任务链绑定的灵途建筑） |
| 研究 | ~8 |
| 升级 | ~15 |

#### 6.3 神启 Phase D — 终局整合

##### 教团 D（工业+神启）

**内容来源**: branch-divine.md Phase D-教团

| 维度 | 内容 |
|------|------|
| 建筑 | ~5：太空圣化建筑 + divineOracle(神谕台) |
| 研究 | ~13 |
| 升级 | ~35 |
| 系统 | 太空任务获得神恩乘数加持 |

**教团不改变工业终局类型**（仍为太空），但提供强力数值加成。

##### 秘仪 D（灵修+神启）

**内容来源**: branch-divine.md Phase D-秘仪

| 维度 | 内容 |
|------|------|
| 建筑 | ~5：虚空门扩展 + 飞升第五门物理载体 |
| 研究 | ~13 |
| 升级 | ~35 |
| 系统 | 飞升第五门开启 + 神升终局条件 |

**灵修+神启→终局为神升**（不是灵迁），第五门 + 神升论 = 终局条件满足。

#### 6.4 通达 Phase D — 共谷

**内容来源**: branch-diplomat.md Phase D

**前置条件**: 深盟通达 `deepAlliancePass`「未定义」 + 任一族深度 ≥ 4。激活邦交深度 5。

| 维度 | 内容 |
|------|------|
| 资源 | 1：共谷契 `commonPact` (mx:5) |
| 建筑 | 3：共谷议事堂 `valleyCouncil`、万盟殿 `grandAllianceHall`(allM:.03)、共谷门 `valleyGate`(allM:.08, 终极建筑仅1座) |
| 研究 | 8：共谷论→万盟学→大盟主论→共谷融合→永盟宣言→共谷门学→共谷蓝图→**共谷成立** |
| 职业 | 1：大盟主 `grandLeader`（被动，上限2） |
| 工艺 | 3：凝共谷契、万盟印、共谷大礼 |
| 升级 | #56-75（20 个） |

**巅峰条件**: 任一族深度5 + 共谷门 + 共谷成立研究 = **通达巅峰**（解锁终局叙事段落）

#### 6.5 阶段六验收清单

- [ ] 工业 E前：太空任务 1-4 可执行，前 4 个太空建筑/资源可用
- [ ] 灵修 E前：灵途任务 1-4 可执行
- [ ] 神启 D-教团：太空圣化建筑可用
- [ ] 神启 D-秘仪：虚空门扩展 + 第五门
- [ ] 通达 D：共谷系统完整，通达巅峰可达成
- [ ] 四条内容线（含神启/通达终局整合）均有推进

---

## 十、阶段七：终局与轮回（v0.22）

<!-- SECTION: phase-7 -->

### 实施进度

| 步骤 | 标题 | 状态 | commit | 详细任务卡 |
|------|------|------|--------|---------|
| 7.1 | 工业 E-后半：太空任务 5-8（星舟·归寂终局） | ⬜ 未开始 | - | §十 7.1 |
| 7.2 | 灵修 E-后半：灵途任务 5-8（星童舟·灵迁终局） | ⬜ 未开始 | - | §十 7.2 |
| 7.3 | 5 终局事件（太空/灵迁/神升/玄空/共谷） | ⬜ 未开始 | - | §十 7.3 |
| 7.4 | 轮回/重生系统 | ⬜ 未开始 | - | §十 7.4 |
| 7.5 | 终局接口预留（副线 hook point） | ⬜ 未开始 | - | §十 7.5 |
| 7.6 | 阶段七验收清单 | ⬜ 未开始 | - | §十 7.6 |

> mulerun 必须按上表顺序执行。每完成一步，更新 `状态` 为 `✅` 并填入 `commit` SHA。

### 目标

主线收束终局。完成工业/灵修后半段任务、5 个结局事件、轮回重生系统。神启和通达已在阶段六完结。

### 步骤拆解

#### 7.1 工业 E-后半：太空任务 5-8

**内容来源**: branch-industry.md Phase E 后半

| 维度 | 内容 |
|------|------|
| 任务 | 4 个：渡暗流→触寂弦→叩无名门→**星舟·归寂**（太空终局） |
| 资源 | ~3：虚尘 `voidDust`、晨曦矿 `dawnOre`、露珀 `dewAmber` |
| 建筑 | 星舟 + 剩余太空建筑 |
| 研究 | ~10 |
| 升级 | ~14（含终局升级链 #130-135） |

**工业全资源链总览**:
```
铁/木/石 → 煤/钢 → 火油（油桶）→ 寒钛/合金 → 辉石/重晶 → 燃素/推进剂/星帆等
  Phase A      Phase B      Phase C          Phase D        Phase E
```

#### 7.2 灵修 E-后半：灵途任务 5-8

**内容来源**: branch-mystic.md Phase E 后半

| 维度 | 内容 |
|------|------|
| 任务 | 4 个：渡渊流→觸永寂→叩星門→**星童舟·靈遷**（灵迁终局） |
| 资源 | ~3：渊核 `abyssCore`、曦露 `dawnDew`、星胎 `starEmbryo` |
| 建筑 | 星童舟 + 剩余灵途建筑 |
| 研究 | ~8 |
| 升级 | ~20 |

**灵修全资源链总览**:
```
符咒/学识/遗光 → 灵能/命丝 → 共振子/灵液 → 晶丝/辉芒/灵核 → 元念/寂石 → 永弦/星幕/曦尘等
  Phase A          Phase B       Phase C           Phase D        Phase E
```

#### 7.3 5 终局事件

| 终局 | 触发条件 | 路线要求 | 说明 |
|------|---------|---------|------|
| 太空（归寂） | 星舟·归寂任务完成（推进剂×100+露珀×10 等） | 工业路（±神启±通达） | 工业线唯一终局，副线只加叙事 |
| 灵迁 | 星童舟·灵迁任务完成（灵图50000+星胎×1 等） | 灵修路（无神启） | 灵修默认终局 |
| 神升 | 飞升第五门 + 星童·神升灵术 | 灵修+神启 | 神启覆写灵迁→神升（灵修线 hook H3） |
| 玄空 | 占卜全通 + 特殊条件 | 任意路线 | 隐藏终局，待定 |
| 共谷 | 通达巅峰 | 任意路线+通达 | 通达不改终局类型，仅增加叙事段落 |

#### 7.4 轮回/重生系统

参考猫国 "Reset" 机制：
- 跨周目货币（避开"业力"/"卡密"命名）
- 第二周目保留部分进度（永久升级）
- 挑战模式解锁（8-10 个）

#### 7.5 终局接口预留（副线 hook point）

> 主线设计各自终局，副线通过 hook point 追加前置/造价/叙事。副线不修改 A-D 阶段内容，hook 全部在 E 阶段末期。
>
> **Hook 编号说明**：工业线 H1-H6 和灵修线 H1-H8 分别独立编号，与 branch-industry.md / branch-mystic.md 一致。引用时需注明所属主线以避免歧义（如"灵修线 H3"）。

##### 工业线 hook（6 个）

| Hook | 位置 | 默认行为 | +通达覆写 |
|------|------|---------|----------|
| H1 | 星舟蓝图研究 | 前置：天幕论+叩无名门 | 额外前置「异族航路」研究（通达资源） |
| H2 | 归寂舟造价 | 露珀×10+星帆×30+寒铎×15+密典×10 | 替换部分材料为通达资源（盟约典替换密典），造价略降 |
| H3 | 终局升级「归寂舟·启航」 | 太空终局叙事 | 追加「万族送行」叙事段落 |
| H4 | 终局任务「星舟·归寂」 | 标准消耗→太空终局 | 消耗增加通达资源，叙事追加 |
| H5 | 终局升级组 #130-135 | 天幕锚定→启航 | 可插入 2 个通达专属升级 |
| H6 | 任务链分叉（触寂弦后） | 线性→叩无名门 | 分叉出「异界航道」支线任务(2个) |

##### 灵修线 hook（8 个）

| Hook | 位置 | 默认行为 | +神启覆写 | +通达覆写 |
|------|------|---------|----------|----------|
| H1 | 星童蓝图研究 | 前置：灵幕论+触永寂 | 额外前置「神祇共鸣」 | 额外前置「异族灵桥」研究 |
| H2 | 星童舟造价 | 星胎+渊核+曦露+寂铃+永弦 | 渊核-5（原"替换寂铃→神铃"已删除，神铃不存在） | 替换部分材料为通达资源 |

> ✅ **已修正**：勘误 E30 已删除神铃/神印，H2 神启覆写不再引用"替换寂铃→神铃"。
| H3 | 终局灵术「星童·灵迁」 | 灵迁结局 | **改为「星童·神升」** | 追加「共谷回响」叙事 |
| H4 | 终局任务「星童舟·灵迁」 | 标准消耗→灵迁 | 改「星童舟·神升」+神启资源 | 追加通达资源+叙事 |
| H5 | 终局升级组 #150-155 | 标准升级 | 可插入专属升级 | 可插入专属升级 |
| H6 | 灵契系统 | 5 种灵契 | 额外「神灵契」 | 额外「邦交契」 |
| H7 | 寂石冥想 | 跳跃期建筑结算 | 神祇建筑也结算 | 通达建筑也结算 |
| H8 | 任务链分叉（触永寂后） | 线性→叩星门 | 分叉「神域入口」(2个) | 分叉「异界桥」支线任务(2个) |

##### 覆写规则

1. **纯加法**：副线覆写优先"追加"而非"替换"
2. **终局唯一性**：工业=太空（不可变），灵修=灵迁/神升（由神启决定）
3. **A-D 不受影响**：副线 hook 全部在终局阶段
4. **资源命名空间**：通达引入的替换资源在 branch-diplomat.md 中定义

#### 7.6 阶段七验收清单

- [ ] 工业 E后：太空任务 5-8 完整，星舟·归寂终局可触发
- [ ] 灵修 E后：灵途任务 5-8 完整，星童舟·灵迁终局可触发
- [ ] 5 终局事件均可触发（对应路线下）
- [ ] 轮回/重生系统可用
- [ ] 挑战模式可解锁
- [ ] 神启/通达在阶段六已完结，阶段七无新内容（符合预期）

---

## 十一、跨阶段系统

<!-- SECTION: cross-phase -->

### 称谓演进实施时机

| 阶段 | 触发 | 变化 |
|------|------|------|
| 阶段一 | 政体选定 | 营火→广场，村落→城邦，山外→四方，典制→邦制 |
| 阶段三 | Phase B 完成 | 工坊→匠堂，四方→天际 |
| 阶段七 | 终局触发 | 广场→中心，城邦→国度，匠堂→万工殿，天际→星途，邦制→社稷 |

### 事件池增长计划

| 阶段 | 山谷见闻 | 世界回响 | 抉择事件 |
|------|---------|---------|---------|
| 当前 | 25 | 18 | 5 |
| +阶段一 | +8 → 33 | +3 → 21 | +2 → 7 |
| +阶段二 | +13 → 46 | +6 → 27 | +3 → 10 |
| +阶段三 | +21 → 67 | +6 → 33 | +4 → 14 |
| +阶段四 | +18 → 85 | +6 → 39 | +4 → 18 |
| +阶段五 | +15 → 100 | +6 → 45 | +4 → 22 |
| +阶段六 | +12 → 112 | +6 → 51 | +3 → 25 |
| +阶段七 | +8 → 120 | +9 → 60 | +4 → 29 |

### 决策密度分布

| 阶段 | 新增决策点 | 累计 | 类型 |
|------|-----------|------|------|
| 阶段一 | ~10 | ~10 | 3 次不可逆政体选 + 4×1 政策域选 + 远行时机 |
| 阶段二 | ~8 | ~18 | 1 次主线不可逆选 + 建筑/研究/升级时机 |
| 阶段三 | ~18 | ~36 | 占卜(每年 1) + 仪式施放 + 能量/灵脉平衡 + 枯风口远行 |
| 阶段四 | ~25 | ~61 | 主神选 + 教派选 + 教令/飞升门 + 外交选 + 工/灵 C 升级路径 |
| 阶段五 | ~20 | ~81 | 灵契选 + 邦交深化策略 + 工/灵 D 升级路径 |
| 阶段六 | ~15 | ~96 | 太空/灵途任务 + 通达深盟 + 神启终局整合 |
| 阶段七 | ~12 | ~108 | 终局选 + 通达巅峰 + 挑战模式 |
| **总计** | **~108** | | 目标 80-120 ✓ |

### 资源总览（全阶段累计）

| 阶段 | 新增资源 | 累计 |
|------|---------|------|
| 当前 | 18 基础 | 18 |
| 阶段一 | +0（谷声已废弃，无新增资源） | 18 |
| 阶段二 | +0（工业/灵修资源已定义，此处激活） | 18 |
| 阶段三 | +5~6（油/板/混凝 或 灵墨/符纹/共振 + 虔诚/圣油） | 23~24 |
| 阶段四 | +7~9（工/灵 C 阶段资源 + 圣火/神露/秘知 + 声誉/信物） | 30~33 |
| 阶段五 | +8~10（工/灵 D 资源 + 邦书/异珍 + 颂咏等） | 38~43 |
| 阶段六 | +6~8（太空/灵途前段资源 + 盟印） | 44~51 |
| 阶段七 | +4~5（太空/灵途后段资源 + 共谷契 + 轮回货币） | 48~56+1 |

### 成就系统（页签 `a` 内部布局）

> 框架已实现（§五 2.9，commit 9c99f56：`ACHIEVEMENT_DATA` + `G.achievements`）。本节定义独立页签的 UI 设计，与原"典制底部/浮窗"方案决裂。

**布局**：
- 顶部：进度条（已解锁 / 总数 + 各阶段达成百分比）
- 主体：按阶段分组的卡片列表（阶段一 → 阶段七 + "通用"组）
- 排序：每组内按 `id` 字典序，已解锁项不上浮（避免锁定项被挤到末尾难发现）

**单卡显示规则**：

| 状态 | 名称 | 描述 | 解锁条件 | 时间戳 | 视觉 |
|------|------|------|---------|-------|------|
| 已解锁 | 完整显示 | 完整显示 | 完整显示 | ✓ 显示 | 加重边框 + 强调样式 |
| 未解锁（默认） | 完整显示 | 完整显示 | 完整显示 | — | 灰色边框 + 灰字 |
| 未解锁（`hidden:true`） | ??? | ??? | ??? | — | 灰色边框 + 问号占位 |

> `hidden` 字段为可选——多数成就不需要隐藏，仅"剧透敏感"或"复活节彩蛋"类用 `hidden:true`。

**总数预算**（与 §十六 第 8 条 + §十四 14.6 对齐）：

| 阶段 | 预计数量 | 主题 |
|------|---------|------|
| 通用 | 5-10 | 首次行动（建第一座建筑/采第一颗野莓/初次远行 等） |
| 阶段一 | 10-15 | 政体选定 + 政策域选 + 习俗激活里程碑 |
| 阶段二 | 10-15 | 主线选定 + 工业/灵修首次激活产出/职业 |
| 阶段三 | 10-15 | 宗教页签开启 + 占卜首签 + 通达初交 + 枯风口达成 |
| 阶段四 | 10-15 | 主神选定 + 教派选定 + 邦交首族结盟 |
| 阶段五 | 10-15 | 灵契选定 + 邦交深化 + 工/灵 D 阶段标志 |
| 阶段六 | 10-15 | 神启/通达完结 + 太空/灵途前段 |
| 阶段七 | 10-15 | 终局选 + 轮回 + 隐藏成就 |
| **总计** | **75-115** | （§十四 14.6 的 60-100 目标向上微调） |

**实现要点**：
1. 离线补算时按当前 G 状态触发 `check()`（§五 2.9 既有逻辑）
2. 解锁时刻播放 toast + 写入 `G.achievements[id] = Date.now()`
3. 不影响数值（roadmap 第十六 第 8 条），不写入 `e:` 效果
4. `hidden` 字段统一从 `ACHIEVEMENT_DATA` 读取，未声明视为 `false`

---

## 十二、风险与缓冲

<!-- SECTION: risks -->

| 风险 | 表现 | 缓冲 |
|------|------|------|
| 灵修 B 工作量爆炸 | 代码中灵修 B 几乎空白，而工业 B 已有完整定义 | 阶段三灵修 B 可精简为 3 建筑+3 研究 先出最小可玩版，后续升级补全 |
| 宗教页签太空 | 阶段三只有 3 建筑+2 仪式+占卜 | 可提前加入签池扩展(12 签)和简单成就展示填充 |
| 政治系统过早固化 | 不可逆政体选完后玩家后悔 | 明确的"确认对话框"三步确认 + 路线预览面板 |
| 工业/灵修深度不对称 | 工业已有 12 建筑代码，灵修只有 4 | 严格按等深对齐表控制每阶段激活量，不因"代码已有"就提前放出 |
| 终局遥不可及 | 7 阶段到终局可能 100+ 小时 | 每阶段都有"阶段性成就感"——政体选择、主线选择、宗教开启、6 神选定等仪式性时刻 |
| 阶段三/四内容密度过高 | 合并后单阶段多线并发 | 严格按等深对齐表控制激活量；Phase B/C 内容可精简后补全 |

---

## 十三、与猫国建设者的对标参考

<!-- SECTION: kittens-reference -->

| 猫国设计 | 本游戏对应 | 阶段 |
|----------|-----------|------|
| Religion tab (信仰独立页签) | 宗教页签 | 阶段三 |
| Praise the Sun (信仰→虔诚转化) | 神恩系统（sqrt 曲线） | 阶段三 |
| Transcendence (超越层级) | 飞升阶梯（5 重门） | 阶段四-六 |
| Policy system (不可逆政策) | 分层路线树（Tier 1-3） | 阶段一 |
| Village→Town→City (称谓演进) | 营火→广场→中心，典制→邦制→社稷 等 | 跨阶段 |
| Workshop 折叠分组 | 村落/工坊分组折叠 | 阶段二 |
| Space tab (太空独立页签) | 无新页签，终局走山外页签 | 阶段六-七 |
| Reset/Karma (轮回/业力) | 轮回系统（命名避开猫国） | 阶段七 |
| Calendar (节气系统) | 24 节气微事件 | 阶段三-四（可选） |

---

## 十四、猫国机制对照：缺口分析与取舍

<!-- SECTION: kittens-gap-analysis -->

> 以下逐项对照猫国建设者的核心机制，标注本游戏是否需要、何时引入、或明确不做。

### 已覆盖（设计完备）

| 猫国机制 | 本游戏对应 | 状态 |
|----------|-----------|------|
| 基础资源链（猫薄荷→木→矿→铁→煤→钢→油） | 野莓→圆木→碎石→矿铁→煤→钢→火油 | ✅ 已在代码中 |
| 职业系统（农/伐/矿/猎/学/商/地/工/牧） | 采集/伐木/矿工/猎手/学者/铁匠/商贩/斥候 + 分支职业 | ✅ |
| 建筑通胀（k=1.15） | 统一 k=1.12（更柔和，符合休闲定位） | ✅ |
| 季节系统（春夏秋冬影响产出） | 已有四季 + 寒冬惩罚 | ✅ |
| 工坊升级（工具/武器/效率） | 升级系统 UPGD（工业20+灵修20） | ✅ |
| 宗教/信仰（Temple→Faith→Piety→Solar Revolution） | 宗教页签 + 虔诚 + 神恩(sqrt曲线) | ✅ 阶段三 |
| 超越（Transcendence layers） | 飞升阶梯（5重门，不可逆） | ✅ 阶段四-六 |
| 政策系统（不可逆） | Tier 1-3 分层路线树 | ✅ 阶段一 |
| 交易/外族（7个已有NPC种族） | 7现有种族 + 通达副线邦交系统 | ✅ 阶段四-七 |
| 重置/轮回（Reset + Karma） | 轮回系统（阶段七） | ✅ 规划中 |
| 能量系统（发电/耗电平衡） | 能量系统(energyP/C/Ratio) | ✅ 已在代码中 |
| 污染系统（CO2 ppm → 惩罚） | 污染5阶梯 + 灾害事件 | ✅ 已在代码中 |
| 称谓演进（Village→Town→City） | 营火→城镇→都邑 等 | ✅ 跨阶段 |

### 需要补充（重要但当前遗漏）

#### 14.1 存储上限扩展体系

**猫国做法**: 仓库/港口/贸易船逐层扩展存储上限，且有 Paragon（领导力）跨周目存储加成。存储瓶颈是猫国中期核心驱动力之一。

**本游戏现状**: warehouse/vault 提供存储，但**缺少中后期存储扩展链**。工业路有 steelVault（钢/煤），灵修路有 spiritTower（灵能/命丝），但通用存储在阶段二后可能严重不足。

**补充方案（加入阶段四）**:
- 工业路：**钢制储架系列升级**已在 UPGD 中（steelRack/steelGranary/steelBookshelf/reinforcedVault），确保阶段四激活
- 灵修路：**灵修存储升级**已在 UPGD 中（towerExpand/inkBottle/sigilCase/beadRack），确保阶段四激活
- 通用：考虑阶段三增加**信仰存储**（经阁已提供圣油上限，祭坛提供虔诚上限，足够）

#### 14.2 奢侈品/幸福度资源层

**猫国做法**: 毛皮/象牙/香草/独角兽各 +10% 幸福度，是"收集驱动"机制的重要一环。独角兽进一步演化为独角兽坟墓→死灵兽→虚空等深层系统。

**本游戏现状**: 幸福度来源有建筑(灵狐祠/故事树/共聚堂)、习俗、政体、灵术，但**缺少"收集奢侈品换幸福度"的简单循环**。

**取舍决定**: **不照搬**。理由：
1. 本游戏的幸福度已由 calcH() 中多元来源驱动（建筑+习俗+政体+灵术+季节），复杂度已足够
2. 独角兽系统是猫国的特色内容（独角兽→天角兽→死灵兽→虚空），照搬会撞设计
3. 本游戏用**符咒/遗光**作为类似的稀缺驱动资源，不需要再加奢侈品层

#### 14.3 天文事件 / 随机发现系统

**猫国做法**: 天文台每 tick 有 0.2% 概率触发天文事件（发现星图/触发彗星等），是被动发现机制。

**本游戏现状**: 有山谷见闻/世界回响事件池（25+18条），但**缺少与建筑数量挂钩的概率事件**。

**补充方案（加入阶段三-四）**:
- 祭坛/灵狐祠数量影响"神迹事件"触发概率（参考猫国天文台机制）
- 公式：`每 tick 概率 = 0.001 + 0.0002 × altar_count`（基础 0.1% + 祭坛每座 +0.02%）
- 神迹事件池：初始 6 条（阶段三），后续扩展至 18-30 条

#### 14.4 工程师/自动工艺系统

**猫国做法**: 工程师（Engineer）自动执行工坊配方，是中后期的核心生产力。Factory 建筑为工程师提供工位。

**本游戏现状**: 已有 craftMastery 研究启用自动工艺（autoCraft），炉匠(smelter)/织丝人(silkWeaver) 自动执行特定配方。但**缺少通用"工程师管理所有配方"的机制**。

**补充方案（加入阶段四工业 C）**:
- engineer(工程师) 职业已在代码中定义，效果包括 `draftP: 0.002, 全配方 +3%/人`
- 阶段四激活 factory 后，engineer 成为**全配方自动工匠**（参考猫国 Engineer + Factory 组合）
- 需要新增 UI：工坊页签显示 engineer 自动执行进度条

#### 14.5 离线收益系统

**猫国做法**: 离线最多累积 16,000 天的 Temporal Flux，上线后加速消耗。

**本游戏现状**: **完全缺失**。游戏关闭后无收益。

**补充方案（加入阶段四或更早）**:
- 轻量版：上线时按离线时长计算"挂机收益"（资源按离线秒数 × 产出速率 × 0.5 衰减系数）
- 上限：最多 24 小时离线收益
- 参考猫国 Temporal Flux 但简化：不需要独立资源，直接结算

> **⚠ 优先级评估**: 离线收益是增量游戏的**基础体验预期**，建议不晚于阶段二加入。许多玩家会在分支选择后挂机等资源——如果没有离线收益，这段等待会非常痛苦。

#### 14.6 成就系统

**猫国做法**: 100+ 成就，部分影响游戏机制（如解锁挑战模式）。

**本游戏现状**: **完全缺失**。roadmap 提到 60-100 成就但无具体设计。

**补充方案（跨阶段逐步加入）**:
- 阶段一起每阶段加 10-15 个成就
- 纯展示型（不影响数值），避免增加平衡复杂度
- UI：典制页签底部或独立面板

#### 14.7 节日/庆典系统

**猫国做法**: 可手动触发庆典（Festival），消耗猫薄荷和文化，持续整个季节，全局产出 +10%。Numerology 玄学让庆典在不同周期有特殊加成。

**本游戏现状**: 原 v0.15 节庆被节令系统替代。节令系统已实现每季手动/自动消耗文化品换加成。

**取舍决定**: **已覆盖**。节令系统 + 文化灵术(盈库/双工/墨契) 已经实现了猫国庆典的功能。

### 明确不做（与本游戏定位不符）

| 猫国机制 | 不做理由 |
|----------|---------|
| 独角兽系统（独角兽→天角兽→死灵兽→虚空） | 猫国独有 IP，照搬无意义。本游戏用符咒/遗光/灵能体系替代稀缺驱动 |
| 时间操控系统（Temporal Flux/时间水晶/时间锅炉） | 猫国最复杂的终局系统，体量巨大。本游戏终局走 5 结局分支，不需要无限循环 |
| AI/天网系统（AI Core→天网觉醒） | 科幻主题与狐狸谷世界观不符 |
| 太空线性探索（12+ 星球逐个解锁） | 本游戏太空是终局结局之一，不是独立进展线。用山外页签的远行扩展替代 |
| 周期系统（10 个 zodiac cycles 影响太空建筑） | 过于复杂。本游戏用四季 + 24 节气替代周期性变化 |
| 领导力特质系统（管理者/商人/科学家/哲学家） | 本游戏用建筑专精(16 选择)替代，已有类似功能 |
| 黑暗未来（40,000 年后惩罚） | 本游戏不追求无限时间线，100 小时单 path 为目标 |
| 虚空领域（时间悖论/虚空裂隙） | 猫国终极系统。本游戏秘仪飞升走虚界门路线，但不需要独立虚空维度 |

---

## 十五、已发现问题修正记录

<!-- SECTION: errata -->

> 本节记录 roadmap-v2 自查及对照审计中发现并已修正的问题。

| # | 问题 | 严重度 | 修正 |
|---|------|--------|------|
| E1 | steelVault 缺少阶段门控，阶段二会自动泄漏 | 高 | 新增 `phase` 字段机制说明（§五 2.1 注意框） |
| E2 | inscription 研究前置仅 `leylineLore`，阶段二会提前解锁 spiritInk/sigil | 高 | 标注需增加 `phase: 4` 门控（§五 2.3） |

> ⚠️ **已裁决**：inscription（铭刻）归属 Phase A（阶段二），与 branch-mystic.md 一致。§1.6 的 `phase: 3` 和勘误 E2 的 `phase: 4` 均已过时。铭刻作为灵脉学的分叉研究，在阶段二（灵修 Phase A）即可完成。
| E3 | policyLore 代码中缺少 polityLore 前置 | 高 | §四 1.5 研究调整表补充说明 |
| E4 | 神启研究 ID 与 branch-divine.md 不一致 | 中 | 统一为 `ritualBasic`/`scriptureLore`/`graceLore`（§六 3.3） |
| E5 | 通达资源 ID 混乱（reputation vs renown, talisman vs credential） | 中 | 统一为 branch-diplomat.md 的 `renown`/`credential`/`charter`/`exotic`/`allianceSeal`/`commonPact`（§八 5.4 已更新） |
| E6 | POLITY 代码 ID 与 Tier 路线树名称无映射 | 高 | §四 1.3 新增完整映射表 |
| E7 | branchLore 前置缺少"Tier 2 政体已选"条件 | 高 | §四 1.5 + §五 2.1 明确标注 |
| E8 | 等深对齐表灵术行描述不清 | 中 | §五表格补充说明灵术作为工业缺灵术的补偿 |
| E9 | 祭坛建筑 ID roadmap 与 branch-divine 不一致 | 中 | 统一为 `divineAltar`（§六 3.4 已更新） |
| E10 | 神启研究费用/前置与 branch-divine 不一致 | 高 | 全部按 branch-divine.md §四 更新（§六 3.3 已更新） |
| E11 | 通达研究命名/数量与 branch-diplomat 不一致 | 中 | 按 branch-diplomat.md 统一体系更新为 27 个研究（4A+5B+10C+8D），§八 5.4 已更新 |
| E12 | 声望公式系数 30% 与 branch-diplomat 40% 不一致 | 高 | 按 branch-diplomat.md §四 更新为 40%（§八 5.4 已更新） |
| E13 | 通达旧设计按主线分叉为灵盟路/通商路（双路径） | 高 | 改为统一体系，不分主线。7 族邦交系统替代旧 8 族灵盟阶梯/商路系统。全部内容标 `sb:'T'`，不再需要 `br:'M'`/`br:'I'` |
| E14 | 原6阶段规划中阶段六体量约为2-5阶段总和3倍，且部分内容线连续2阶段空转 | 高 | 重构为7阶段规划。核心原则：每条活跃线每阶段推进，无连续空转。通达提前至Phase 3激活（利用已有商贸代码基础），Phase 3起四线齐发。用内容描述矩阵替代误导性分支Phase字母标签，增加分支Phase↔Roadmap阶段映射表 |
| E15 | engine.js chk() 不支持 phase 门控，工业B代码会在 Phase 2 泄漏 | 高 | §四 1.6 新增 phase 门控机制设计，列出所有需加 phase 字段的条目，含迁移逻辑 |
| E16 | Phase 4-5 工作量分别为 ~150/~200 条目，是 Phase 2 的 3.4-4.5 倍 | 中 | §三新增 Phase 4-5 拆分预案（4a/4b + 5a/5b），每节点控制在 60-130 条目 |
| E17 | Phase 5 前置条件有两行重复（神启C / 通达B 重复列出） | 低 | 已删除重复行 |
| E18 | 谷声(valleyVoice)设计增加引擎复杂度但不产生有意义的决策，名称与页签命名不搭 | 高 | 移除谷声，改为研究链门控(councilLore→polityLore→policyLore)+资源花费。参照猫国用文化(通用资源)而非专用累积资源的做法。§四 1.1/1.3/1.5/1.7b/1.8/1.9/1.10/1.11 全部更新 |
| E19 | POLITY 数据结构缺少 tier1/cost/pen 字段，效果仅有 ±% 无系统级惩罚 | 高 | 完全重写 POLITY（§四 1.3），增加 tier1:'in'/'out'、cost 资源数组、e/pen 正面/惩罚拆分。参照猫国政策体系每选项都有取舍 |
| E20 | POLICY 数据结构 cost 为数字而非资源数组，有 cooldown 但设计要求不可逆 | 高 | 完全重写 POLICY（§四 1.3），cost 改为 [{r,a}] 格式，删除 cooldown，permanent:true。新增 diplomacy 域对接 branch-diplomat.md |
| E21 | ui.js 建筑渲染器不按 d.t 字段过滤页签，所有建筑显示在营火页签 | 高 | §四 1.7c 新增建筑渲染器页签路由修复方案 |
| E22 | councilHall/polityHall 建筑标 t:'b' 但应归属村落页签 | 中 | §四 1.2 改为 t:'v' |
| E23 | 工业线产出/污染数值与 branch-industry.md 全部差 2 倍（mine 0.04→0.02, blastFurnace 0.02→0.01, purifier -0.04→-0.02, deepMiner 0.06→0.03） | 高 | 全部按 branch-industry.md 数值更新（§五 2.2） |
| E24 | 工业线建筑中文名与 branch-industry.md 不一致（鼓风炉→高炉, 排烟塔→烟囱, 沉淀池→净化池, 精算炉→煅烧炉, 精炼坊→精炼厂, 观星台→望远台） | 中 | 全部按 branch-industry.md 统一（§五 2.2 + §七 4.1） |
| E25 | deepMiner 中文名不一致（深掘者→深层矿工）；outline 中文名不一致（蓝本→纲要）；dawnOre 中文名不一致（曦矿→晨曦矿） | 中 | 按 branch-industry.md 统一（§二 + §七 4.1 + §九 7.1） |
| E26 | 灵修 Phase B 建筑/研究/职业名与 branch-mystic.md 完全不同（共振殿→共振塔, 灵织坊→灵酿坊 等），职业数 2→3，研究数 5→8，升级数 8→28 | 高 | 全部按 branch-mystic.md Phase B 重写（§六 3.2） |
| E27 | 灵契系统 roadmap 写"永久不可逆"，branch-mystic.md 写"可通过灵契祈愿灵术切换" | 高 | 按 branch-mystic.md 改为可切换（§二 + §八 5.2） |
| E28 | 灵修 Phase C/D 建筑中文名与 branch-mystic.md 不同（辉芒台→辉映台, 图谱殿→灵图阁, 太初池→元念池, 寂灭洞→寂石窟, 灵能库→灵匣, 虚典殿→幽典阁） | 中 | 按 branch-mystic.md 统一（§七 4.2 + §八 5.2） |
| E29 | 寂石冥想 roadmap 写"不触发事件"，branch-mystic.md 写"躁念在冥想期间正常累积" | 中 | 按 branch-mystic.md 更新，删除"不触发事件"描述（§八 5.2） |
| E30 | 神启资源"神铃/神印"在 branch-divine.md 中不存在 | 高 | 从资源列表删除，按 branch-divine.md 实际资源（教团: 圣火/圣铁/颂咏/圣骸/圣典/神谕；秘仪: 神露/秘知/神墨/化神石/禁典/神格）重写（§二） |
| E31 | 神启建筑总数各处不一致 | 中 | 按子文档（教团/秘仪各 22 个建筑）修正为 22，更新分路径明细（§二）。原"修正为20"有误，以子文档详细设计为准 |
| E32 | 神启研究总数各处不一致 | 中 | 按子文档（教团 35、秘仪 35）修正为 35/路径，更新分路径明细（§二）。原"修正为34"有误，以子文档详细设计为准 |
| E33 | graceLore 效果 roadmap 写"提升 graceCap 至 60%"，branch-divine.md 写"仅激活系统，cap 需升级 #6 才到 60%" | 高 | 按 branch-divine.md 修正（§六 3.3） |
| E34 | 仪式 bless/purify 在 branch-divine.md 中完全缺失 | 中 | 在 roadmap 中标注"待 branch-divine.md 补充"（§六 3.3） |
| E35 | 6 神系统在 branch-divine.md 中完全缺失 | 中 | 在 roadmap 中标注"待 branch-divine.md 补充"（§七 4.5） |
| E36 | Hook 命名前缀 roadmap 用 H-I/H-M，分支文档用 H1-H6/H1-H8 | 中 | 按分支文档统一为 H1-Hn，增加引用需注明主线的说明（§十 7.5） |
| E37 | Hook +通达覆写名称与分支文档不一致（邦交航路→异族航路, 七族送行→万族送行, 邦交航道→异界航道, 邦交契→异种契, 邦交灵桥→异族灵桥, 邦交桥→异界桥） | 中 | 全部按分支文档统一（§十 7.5） |
| E38 | G.subBranches（复数）与 branch-diplomat.md 的 G.subBranch（单数）不一致 | 中 | 全文统一为 G.subBranch（单数） |
| E39 | 通达 Phase A 前置条件 tradePost≥3 与 branch-diplomat.md 的 tradePost≥2 不一致 | 中 | 按 branch-diplomat.md 修正为 ≥2（§六 3.6 前置条件） |
| E40 | 通达远行目的地解锁深度 roadmap 写"深度 1-2"，branch-diplomat.md 写"深度 3" | 高 | 按 branch-diplomat.md 修正为深度 3（§七 4.4） |
| E41 | 神启建筑总数 E31 误修为 20，子文档（教团/秘仪）各实列 22 个建筑 | 高 | 回修为 22/路径，以子文档为准（§二） |
| E42 | 神启研究总数 E32 误修为 34，子文档各实列 35 个研究 | 高 | 回修为 35/路径，以子文档为准（§二） |
| E43 | graceCap 推进路径 roadmap 写"#6→60%, #10→70%"，子文档写"#6→55%, #10→60%" | 高 | 按子文档修正为 55%/60%，并补全 Phase B-D 推进路径（§六 3.3） |
| E44 | 教团B roadmap 仅列 4 建筑/1 资源/1 职业，子文档为 6 建筑/2 资源/2 职业/6 研究/5 工艺 | 高 | 按 branch-divine-doctrine.md 修正（§七 4.3） |
| E45 | POLICY.class.elder 与 POLITY.elder 命名冲突，原仅标警告未修正 | 中 | 已将 POLICY.class.elder 重命名为 seniority（§四 1.3） |
| E46 | branch-divine.md 概览开发规则第 4 条写"副线内容不新建页签"，与子文档和 roadmap（宗教页签）矛盾 | 高 | 已修正为"神启专用宗教页签"，与 roadmap §六 3.3 一致 |
| E47 | branch-divine.md 概览 Phase A 资源仅列虔诚，缺少圣油 | 中 | 已补充圣油 holyOil，与子文档一致 |
| E48 | spiritChanneler 已在 branch-mystic.md 中更名为 spiritSenser，roadmap 未同步 | 高 | ✅ 已修正：§五 2.3（4ca6d73）完成 data.js rename + engine.js migrate + branch-mystic.md 实现记录同步 |
| E49 | 工业 Phase C 资源名：roadmap 写"钛件/柱材"，branch-industry.md 写"钛构件/混凝柱" | 中 | 已按 branch-industry.md 修正（§七 4.1 资源/工艺/资源链） |
| E50 | 工业 Phase D 建筑名：roadmap 写"辉能炉/辉能箱"，branch-industry.md 写"熔炉/辉匣" | 中 | 已按 branch-industry.md 修正（§八 5.1） |
| E51 | 工业 Phase E 资源/建筑数：roadmap 写"~4 资源/4-5 建筑"，branch-industry.md 明确为 7 资源/9 建筑 | 高 | 已按 branch-industry.md 修正（§九 6.1），补全完整列表 |
| E52 | 炼圣油配方 ID `holyOil` 与圣油资源 ID `holyOil` 碰撞（引擎中 craft/resource 共享命名空间） | 高 | 配方 ID 改为 `refineHolyOil`，已同步修正 branch-divine-doctrine.md + branch-divine-mystery.md |
| E53 | 寂渊契+寂石冥想潜在无限循环（branch-mystic.md 待决项 #12 已标记但 roadmap 无索引） | 中 | 此处登记索引；具体防循环机制（产出打折 or 冷却互斥）待 Phase 5 开发前裁决 |
| E54 | 灵修 Phase E 资源/建筑数 roadmap 仍为"~4/4-5"估值，branch-mystic.md 有总量但缺逐阶段拆分 | 低 | 待 branch-mystic.md 补充 E 阶段逐项列表后同步 |
| E55 | branch-mystic.md "全配方表（22 个）"标题与"数量对标"表自相矛盾，实际 27 个（A5+B4+C5+D5+E8） | 中 | 标题改 27、对标表灵修列改 27、删除"以本表为准 roadmap 待同步"注解。roadmap-v2 §二（行 137）已为 27，本次反向对齐 |
| E56 | branch-divine.md §十一/§待补充内容备注 两段为元提示而非设计内容；6 神/仪式/占卜在 roadmap 多处提及但 branch 仅有占位提示 | 中 | 旧 §十一+§待补充内容备注 整合替换为 §十一 仪式系统 / §十二 占卜系统 / §十三 6 神系统 / §十四 总数核算（含历史勘误归并）。原 stub 文件 divine-rituals-divination-stub.md / divine-gods-stub.md 内容并入并删除 |
| E57 | docs/plan/ 同时存在 v0.16-plan.md / v0.16-rewrite.md 两份方案稿，均以已废弃的"谷声"为核心，开发者直接读会被误导；v0.14+文本重写方案 / v0.15-plan 已实施或未实施待决 | 中 | 4 份文件移至 docs/plan/archived/，新增 archived/README.md 标注归档原因；新增 docs/plan/INDEX.md 作为导航总入口；E34/E35 状态从"待补充"更新为"已并入 branch-divine §十一/§十二/§十三 占位设计" |
| E58 | 成就系统 UI 入口由"典制底部 / 独立浮窗"提升为独立成就页签 `a`，原"7 页签定局"扩至 8 | 中 | §一 页签架构表新增第 8 行 `a` 成就页签；§一 新增"成就页签新增说明"4 条；§五 2.9 UI 入口指向新页签；§十一 新增"成就系统（页签 `a` 内部布局）"小节，含单卡显示规则表 + 总数预算表 |
| E59 | 资源 ID 拼写错误 `ancientCoin` / `hide` 致 6 处功能静默失效（异珍阁建造费用错资源 `coin` / `envoyBasic` / `credentialLore` 研究、`bloodLegacy` 仪式、`convertDeity` 改宗、河獭 / 旧墟联盟加成） | 高 | 全部代码引用统一为 `ancCoin` / `leather`：`data.js` × 4（exoticVault、envoyBasic、credentialLore、bloodLegacy）+ `engine.js` × 2（otter / ruinfolk 联盟加成）+ `engine-actions.js` × 2（convertDeity 检查/扣费）+ `ui.js` × 2（convertDeity 显示）；`branch-divine.md` 同步修正 1 处 |
| E60 | 工业/灵修/神启/通达 4 副线设计表与代码偏离 ~20 项（数值、效果类型、缺失配方、机制差异、前置条件、空效果对象等） | 高 | 默认策略"doc 胜"应用：工业 4 项（titanP / cleanForest 前置 / titanHammer craftM / titanAlloyStore mxM）；灵修 4 项（leyArray cost / spiritSenser P / silkWeaver 标准产出 / 新增 drawChartBasic 配方）；神启 9 项（mysteryHall gnosisP / oilRefine 前置 + 教团 #20/#24-30 替换为 holyIronForge/pressEfficiency/ironSmithFocus/faithSteel/kilnSurge/altarSurge/priestSchool）；通达 4 项（声誉 dipRes 列表扩充 / alliancePlatform 深度 3+ 限制实装 / depthPrepII-III + maintenanceEase 改用 allianceDepth 前置 / diplomatDeepen 效果改 \_jobCapBonus）。新增引擎机制：`chk()` 支持 `q.allianceDepth`（任一族深度门控）。详见 changelog.md 2026-05-06 |
| E61 | branch 文档自身存在 4 项内部不一致（无法机械对齐到代码） | 中 | 跳过对应代码改动，记录待 doc 修订：M1 inscription 设计表"灵墨 5"含 spiritInkU 循环依赖 / M6 "锻镜灵"配方在 C 阶段表但镜灵列入 D 阶段资源 / D2 秘仪师 doc ID `mystic` 与 `mainLine === 'mystic'` 字符串歧义 / D3 圣火锻 / 圣铁铸 doc ID `holyFlame` / `holyIron` 与资源同名（撞 craft / resource 命名空间，重蹈 E52）|
| E62 | 玩家反馈"polityLore 完成后 policyLore/branchLore/divineLore 三研究同时解锁，没有循序渐进"（hotfix 任务 B，commit 4ee9f17）| 高 | 改 `data.js` 拆三研究的 uq 为 polityLore→policyLore→branchLore→divineLore 渐进链：branchLore.uq 加 `policyLore:1` 前置 + councilHall 2→3 + custom 5→8；divineLore.uq 加 `branchLore:1` 前置；同步 `branch-divine.md:221` 设计表前置改为"择路而治 + 政体已选 + 灵狐祠×3"，依赖图加入 branchLore |

### 待实施时验证的代码改动清单

| 文件 | 改动 | 对应问题 |
|------|------|---------|
| `data.js` RD | 删除 `council`；**不再新增 valleyVoice** | E1, E18 |
| `data.js` BD | steelVault 增加 `phase: 3`；oilWell/steamEngine 等增加 `phase: 3`；factory/railroad 等增加 `phase: 4`；councilHall/polityHall 改 `t:'v'` | E1, E15, E22 |
| `data.js` UD | polityLore 删除谷声前置；policyLore 增加前置 `polityLore` + polity 已选条件；branchLore 增加前置 polity 已选；inscription 增加 `phase: 3`；oilExtract/steamPower/forging/concreteTech 增加 `phase: 3`；combustion/assemblyLine/roadwork 增加 `phase: 4` | E2, E3, E7, E15, E18 |
| `data.js` POLITY | **完全重写**：增加 `tier1`/`cost`/`pen` 字段，效果拆为正面+惩罚 | E6, E19 |
| `data.js` POLICY | **完全重写**：cost 改为资源数组、删除 cooldown、增加 pen 字段、新增 diplomacy 域 | E20 |
| `data.js` TABS | 删除 `g` 页签 | 阶段一 |
| `engine.js` chk() | 新增 `phase` 门控判断 + `polity` 条件增强；G.phase + G.tier1 + G.polity 状态字段 | E1, E2, E15 |
| `engine.js` migrate | 删除 council 资源 + valleyVoice 字段清理 + g→k 页签迁移 | E18, 阶段一 |
| `ui.js` 建筑渲染器 | 增加 `d.t` 页签过滤逻辑 | E21 |

---

## 十六、执行纪律

1. **每个阶段完成后必须进行一轮完整试玩**（新存档从头到当前阶段终点），确认体验连贯
2. **不在当前阶段实施下一阶段内容**，即使代码已定义（防止玩家提前触达未平衡内容）
3. **等深对齐是硬约束**：如果灵修 B 延期，工业 B 也不上线
4. **每阶段结束前更新 design.md 和 changelog.md**
5. **命名审核在编码前完成**，不把占位名带入代码
6. **遇到不确定的设计问题，先查 `reference/` 目录下猫国百科**
7. **离线收益不晚于阶段二加入**（增量游戏基础体验预期）
8. **每阶段加入 10-15 个成就**（纯展示型，不影响数值平衡）
9. **Phase 1 必须完成 phase 门控实现**——这是 Phase 2 的硬性前置，否则工业B已有代码会泄漏
10. **Phase 4-5 工作量监控**：若单阶段开发超出预期，按§三拆分预案执行（4a/4b + 5a/5b）
11. **灵修B是 Phase 3 的瓶颈**——代码几乎全空，需优先排期填充

---

## 附录 A：阶段对照旧版本号

| 阶段 | 对应旧版本号 | 说明 |
|------|------------|------|
| 阶段一 | v0.16 | 政体系统 |
| 阶段二 | v0.17 | 双线觉醒 |
| 阶段三 | v0.18 | 工业B+灵修B+神启A+通达A+占卜+枯风口（四线首次全部激活） |
| 阶段四 | v0.19 | 工业C+灵修C+神启B(分叉)+通达B(邦交)+6神 |
| 阶段五 | v0.20 | 工业D+灵修D+神启C+通达C(深盟) |
| 阶段六 | v0.21 | 工业E前+灵修E前+神启D+通达D(共谷)（神启/通达完结） |
| 阶段七 | v0.22 | 工业E后+灵修E后+终局+轮回 |
