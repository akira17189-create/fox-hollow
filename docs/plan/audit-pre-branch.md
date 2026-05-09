# branchLore 前解锁链审计报告

> **范围**：玩家完成 `branchLore`（择路而治）研究**之前**可触达的所有建筑/研究/职业/配方。
> **生成方式**：[tools/audit-prelock.js](../../tools/audit-prelock.js) 自动扫描 + 人工补充 review。
> **运行**：`node tools/audit-prelock.js [--verbose]`
> **本审计仅报告，不动游戏代码**。修复决策留给策划。

---

## 一、pre-branch 集合规模

| 类别 | pre-branch 项 | 总项 | 占比 |
|------|--------------|------|------|
| 研究 UD | 21 | 98 | 21.4% |
| 建筑 BD | 25 | 80 | 31.3% |
| 职业 JD | 8 | 26 | 30.8% |
| 配方 CD | 8 | 46 | 17.4% |

判定 pre-branch 的规则（脚本 isPreBranch）：
- 排除 `br: 'I' / 'M'`（主线分叉后内容）
- 排除 `sb: 'D' / 'T'`（副线内容）
- 排除 `uq.phase >= 2`（phase 2 起的内容）
- 排除 `uq.mainLine`（主线门控）
- 排除 `uq.u.branchLore`（依赖 branchLore done）
- 排除 `uq.sb`（依赖副线开启）

---

## 二、研究依赖图（pre-branch UD，按深度排序）

```
depth 0 (8 个入口研究，均有 b/exp 建筑/远行前置)
├── stoneTools     石制工具      ← 藏书阁×1
├── carpentry      木工技艺      ← 藏书阁×1 + 伐木场×1
├── masonry        石砌术        ← 藏书阁×1 + 采石坑×1
├── ironWorking    铁器冶炼      ← 锻造炉×1
├── foxFolklore    狐灵传说      ← 灵狐祠×1
├── beyondValley   山外见闻      ← 集市×1 + 藏书阁×1
├── longJourney    远途跋涉      ← 驿道×2 + 远行 oldRuin×1
└── folkLore       树下初闻      ← 灵狐祠×1

depth 1
├── forestLore     林间密语      ← stoneTools
├── spiritShelter  灵狐庇护      ← foxFolklore
├── ancestorEye    先祖之眼      ← foxFolklore
├── craftMastery   工法精要      ← carpentry + masonry
├── calendar       月令新酿      ← folkLore
└── engraving      岁时有常      ← folkLore

depth 2
├── artistryLore   百艺通觉      ← engraving
├── customsDeep    俗成共庆      ← engraving
├── ancestry       连枝溯本      ← calendar
└── councilLore    共谷议事      ← engraving

depth 3
└── polityLore     法度通论      ← councilLore + 议事堂×2

depth 4
└── policyLore     集议传统      ← polityLore + 政体已选

depth 5
└── branchLore     择路而治      ← polityLore + policyLore + 议事堂×3 + 习俗×8 + 政体已选
```

### 建筑链（pre-branch BD 关键节点）

```
入口（无前置）：berryPatch / hutch / lumberYard / quarry
   ↓
tannery (←lumberYard)        warehouse (←quarry)
   ↓                                   ↓
market (←tannery)              library (←warehouse)
   ↓                                   ↓
tradePost (←market×2)            smithy (←library)
                                       ↓
                              shrine (←library + smithy)  ← **三向门户**
                                ├── moonwell (←shrine)
                                ├── storyTree (←shrine×2 + folkLore)
                                │     ├── moonStage (←storyTree + calendar)
                                │     │     ├── artistry (←moonStage + artistryLore)
                                │     │     └── assembly (←moonStage + customsDeep)
                                │     └── memorial (←storyTree + engraving)
                                └── ancestor (←shrine×3 + ancestry)

councilHall (←councilLore)
   ↓
polityHall (←polity 已选)

trailroad (←beyondValley) → watchtower (←trailroad)
plankHouse (←carpentry + masonry)
vault (←ironWorking)
berryGrove (←calendar + berryPatch×5)
```

### 职业（pre-branch JD 全部 8 项）

| ID | 名 | 前置 |
|----|-----|------|
| gatherer | 采集者 | 无 |
| woodcutter | 伐木工 | lumberYard×1 |
| miner | 矿工 | quarry×1 |
| hunter | 猎手 | tannery×1 |
| scholar | 学者 | library×1 |
| smith | 铁匠 | smithy×1 |
| merchant | 商贩 | market×1 |
| scout | 斥候 | trailroad×1 |

无问题。每个职业的建筑前置直接，跟玩家心智模型一致。

### 配方（pre-branch CD 全部 8 项）

| ID | 名 | 前置 |
|----|-----|------|
| plank | 木板 | carpentry |
| brick | 砖块 | masonry |
| scroll | 卷轴 | library×1 |
| dye | 彩络 | folkLore + engraving |
| wine | 醴浆 | calendar |
| ink | 墨锭 | engraving |
| weave | 丝帛（纺）| artistry×1 |
| spiceToSilk | 丝帛（换）| tradePost×1 |

---

## 三、问题列表

> 严重度：🔴 阻塞（必须修）/ 🟡 警告（建议修）/ 🔵 建议（可选优化）

### 🟡 警告

#### W1. engraving 完成后扇出 6 项（信息过载） ✅ 已修复

完成「岁时有常 engraving」瞬间解锁：

- 1 建筑：memorial（刻名碑）
- 3 研究：artistryLore / customsDeep / councilLore
- 2 配方：dye / ink

**问题**：玩家在 depth-1 研究完成的瞬间收到 6 项新内容，跟任务 B 用户反馈的"3 个研究同时解锁"是同类问题（信息过载、节奏被压扁）。

**已实施修复**（commit 待回填，见 git log）：dye 配方 uq 加 `b: {artistry: 1}`，玩家完成 engraving 时立即可见从 6 项降到 5 项（customsDeep 已有 custom:5 门槛延后；dye 现需先建艺工坊）。
- 实际玩家完成 engraving 时立即可见：memorial（如 storyTree 已建）/ artistryLore / councilLore / ink
- dye 延后到 artistry 建好（artistryLore 完成 + moonStage 建好）

> ⚠ 脚本 `audit-prelock.js` 仅扫 uq.u，看不到 uq.b 的"延后效果"，所以仍报 6 项。实际玩法已优化。

---

#### W2. 任务 B 引入的 branchLore 硬门槛可能过严 ✅ 已修复

任务 B 中我把 branchLore.uq 改成 `councilHall: 3 + custom: 8`。审计时复核：

- **custom: 8** — 当前 CUSTD 总长 10。要求激活 8 即 80% — 玩家可能因为部分习俗依赖建筑/研究前置（如 ancestor 需要 shrine×3 + ancestry 研究）而暂时凑不齐 8。
- **councilHall: 3** — councilHall 仅由 councilLore 解锁，造价递增（默认 ×1.12 通胀）。三座的总成本需手工算一下是否在玩家能承受范围。

**已实施**：选项 C 落实——保持 councilHall:3，custom 8→7（80%→70% 门槛）。

---

### 🔵 建议

#### B1. 5 个 UD 是 pre-branch 范围内的"叶节点"（完成后无后续解锁） ✅ 已修复

- forestLore（林间密语）— 木材产出 +50%
- spiritShelter（灵狐庇护）— winterBuff:1
- ancestorEye（先祖之眼）— foxEat:1（降低狐狸食量）
- craftMastery（工法精要）— autoCraft:1（解锁自动生产开关）
- longJourney（远途跋涉）— 远行奖励 +50%

这些都是被动效果研究（合理设计），不是 bug。但玩家可能感觉"研究完没下文"。

**已实施**：在 d 字段开头加"（被动）/（系统）"标签：
- forestLore.d: "（被动）大幅提升伐木效率。"
- spiritShelter.d: "（被动）减轻寒冬对野莓产量的影响。"
- ancestorEye.d: "（被动）减少狐狸的野莓消耗。"
- craftMastery.d: "（系统）解锁工坊自动制作。"
- longJourney.d: "（被动）远行奖励 +50%，解锁云岭目的地。"

---

#### B2. plankHouse 同时被 carpentry + masonry 双前置

`uq.u = {carpentry: 1, masonry: 1}` — 设计意图明显（板屋需要木+石两种工艺），不是 bug。脚本仅作记录。

无修复建议，仅文档登记。

---

#### B3. 5 个研究的 effect 字段为空对象 `e: {}` ✅ 已修复

- artistryLore（百艺通觉）— 解锁 artistry 建筑 + 节令系统
- councilLore（共谷议事）— 解锁 councilHall + 议政
- polityLore（法度通论）— 解锁 Tier 1 路线 + 政体
- policyLore（集议传统）— 解锁政策域面板
- branchLore（择路而治）— phase=2 + 主线分叉

这些是"门控研究"，效果通过解锁后续内容而非数值加成。

**已实施**：branchLore.d 从纯叙事改为"开启主线分叉，造物（工业）与灵术（灵修）只能择其一。"——明确功能说明。其他 4 个研究 d 字段已包含"解锁 X"说明，未动。

---

#### B4. dye 配方 uq 冗余条件

```js
dye: { uq: { u: { folkLore: 1, engraving: 1 } } }
```

`engraving.uq.u = { folkLore: 1 }`，所以 engraving 完成时 folkLore 必然完成。`folkLore: 1` 在 dye.uq 中是冗余条件。

**修复建议**：
- 改成 `uq: { u: { engraving: 1 } }`
- 仅代码整洁，无功能影响

---

#### B5. shrine 是"三向门户"建筑 ✅ 已修复（最小修复：文档说明）

shrine（灵狐祠）同时是以下三条解锁路径的入口：

1. foxFolklore（狐灵传说）→ 灵狐线被动加成
2. folkLore（树下初闻）→ 文化主线（depth 1+）
3. moonwell + storyTree×3 + ancestor 等多个建筑

一个建筑承担三种解锁角色，玩家心智上不易理解"为什么这一座建筑能开这么多东西"。

**已实施**：shrine.d 从"积蓄符咒之力。"改为"积蓄符咒之力——灵性建筑链的入口。"——明确告知玩家此建筑承担多重解锁角色。代码层面拆分需重设计，留作 v0.21+ 长期 review。

---

#### B6. carpentry/masonry 同时给"资源解锁"+"配方解锁" ✅ 已审视判定不修

```js
carpentry: { e: { plankU: 1, woodM: 0.3 } }   // 解锁 plank 资源
plank:     { uq: { u: { carpentry: 1 } } }    // 解锁 plank 配方
```

研究完成时既启用 plank 资源（通过 e.plankU），又解锁 plank 配方（通过 CD.plank.uq）。两套解锁机制都在生效，但实际上一个就够。

**审视结论**：维持现状不修。理由：
- 改方案 1（配方依赖资源 on）需要 chk() 加 q.resOn 字段处理（engine 改动）
- 改方案 2（资源跟随配方第一次产出）需要 craft() 加自动启用逻辑（engine 改动）
- 两方案都需要数据 + 引擎双改，且玩家行为完全等价（双门槛同时由同一研究满足）
- 现状的"双重保险"是可读性 trade-off，不是 bug
- 修改成本/收益比偏低，留作长期重构机会

---

#### B7. branchLore.tip 文案与新解锁链脱节 ✅ 已修复

```js
tip: ['两条路都在脚下，但只有一条能走到底。']
```

任务 B 之后 branchLore 是 depth 5 的研究终点（前置：polityLore + policyLore + councilHall×3 + custom×7 + polity 已选）。tip 暗示"两条路立即可选"，但实际玩家可能要等 1-2 季积累足够习俗。

**已实施**：tip 改为 "两条路都在脚下——选定后再无回头。"——保留诗意 + 强调不可逆决择。

---

## 四、未发现的潜在问题（脚本已检查）

✅ 无资源 ID 引用错误（uq 中所有 r/b/u/j 引用都映射到现有定义）
✅ 无 UD 内部循环依赖
✅ 无 UD↔BD 跨类型循环依赖
✅ 无 pre-branch 项依赖了 sb:'D'/'T' 副线研究的断链
✅ 无 pre-branch 项依赖了 br:'I'/'M' 主线研究的断链
✅ 配方 inp/out 资源 ID 全部有效

---

## 五、推荐处理顺序

如果策划决定逐项处理，建议优先级：

1. **W1（engraving 扇出 6）** — 信息过载，影响节奏，跟 task B 同源问题
2. **W2（branchLore 数值复核）** — 任务 B 引入，玩家能否凑齐 custom 8 + councilHall 3 需实测
3. **B3（artistryLore.d 文案）** — 1 行文案，顺手就修
4. **B4（dye 冗余条件）** — 1 行代码清理
5. **B1（叶节点研究文案）** — 5 处文案微调
6. **B5/B6/B7** — 长期 review，不阻塞

---

## 六、脚本 + 复跑

```bash
node tools/audit-prelock.js          # 仅问题列表
node tools/audit-prelock.js --verbose # 含完整依赖图与扇出表
```

每次改 data.js（特别是 UD/BD 的 uq 字段或 br/sb/phase 标记）后建议复跑一次。

---

> 报告生成日期：2026-05-09
> 对应游戏版本：v0.16+（commit 4ee9f17 之后）
> 审计工具：[tools/audit-prelock.js](../../tools/audit-prelock.js)
