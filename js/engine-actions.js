/**
 * engine-actions.js - 玩家直接触发的操作
 * gather / build / research / craft / aJob / trainJob / sell / 灵术 / autoCraft toggle
 *
 * 依赖：engine.js（G、工具函数 bp/canB/canU/canC/chk/specCostMul/researchCostMul、calcMx/calcR/calcH、log、rAll/rRes/rTC、tryRewardEvent、tryRemnant、trySpawnCaravan）
 */

// ===== 玩家操作 =====
function gather(type) {
  var amt = type === 'berry' ? 1 * G.happy : 1;
  // 轻手天赋：手动采集量 +50%
  if (type === 'berry' && G.jobTalent.gatherer === 'B')
    amt *= SPEC_JD.gatherer.B.gatherMul;
  // v0.16 政体：谷无主手动采集 +30%
  if (G.polity && POLITY[G.polity] && POLITY[G.polity].e.gatherM) {
    var polityBoost = 1 + Math.min(5, G.bld.polityHall?.c || 0) * 0.05;
    var gm = POLITY[G.polity].e.gatherM;
    amt *= (1 + (gm > 0 ? gm * polityBoost : gm));
  }
  const s = G.res[type];
  s.v = Math.min(s.v + amt, s.mx);
  if (!s.on) s.on = true;
  // 手动采集时 2% 概率发现遗光
  if (Math.random() < 0.02) tryRemnant();
  rRes(); rTC();
}

function build(id) {
  if (!canB(id)) return;
  if (anyBranchLocked(BD[id])) return;
  for (let i = 0; i < BD[id].p.length; i++)
    G.res[BD[id].p[i].r].v -= bp(id, i);
  G.bld[id].c++;
  if (BD[id].ur) for (const r of BD[id].ur) G.res[r].on = true;
  log('建造了' + BD[id].n + '（共' + G.bld[id].c + '座）');
  if (id === 'smithy' && G.bld.smithy.c === 1) {
    G.res.iron.v = Math.min(G.res.iron.v + 3, G.res.iron.mx);
    log('锻造炉第一炉出铁了，获得 3 矿铁。', 'important');
  }
  rAll();
}

function research(id) {
  if (G.upg[id].done || !canU(id)) return;
  if (anyBranchLocked(UD[id])) return;
  var rMul = researchCostMul();
  var inkPactUsed = (G.inkPact === G.season);
  for (const p of UD[id].p) G.res[p.r].v -= Math.ceil(p.a * rMul);
  G.upg[id].done = 1;
  // P2 结构化资源解锁：扫 RD.unlockBy 字段 (dye/wine/ink/uranium/primordial/hymn 等)
  // 下面的硬编码 e.xxxU 处理跟此调用幂等并存（旧资源用 e.xxxU，新资源用 unlockBy）
  syncResUnlocks();
  if (UD[id].e?.plankU) { G.res.plank.on = 1; G.res.plank.mx = 100; }
  if (UD[id].e?.brickU) { G.res.brick.on = 1; G.res.brick.mx = 100; }
  // 工业分支 A阶段资源解锁
  if (UD[id].e?.coalU) { G.res.coal.on = 1; }
  if (UD[id].e?.steelU) { G.res.steel.on = 1; }
  if (UD[id].e?.gearU) { G.res.gear.on = 1; }
  if (UD[id].e?.plateU) { G.res.plate.on = 1; }
  if (UD[id].e?.concreteU) { G.res.concrete.on = 1; }
  // 工业分支 B阶段资源解锁
  if (UD[id].e?.oilU) { G.res.oil.on = 1; }
  if (UD[id].e?.barrelU) { G.res.barrel.on = 1; }
  if (UD[id].e?.draftU) { G.res.draft.on = 1; G.res.draft.mx = 25; }
  // 灵修分支 A阶段资源解锁
  if (UD[id].e?.spiritU) { G.res.spirit.on = 1; }
  if (UD[id].e?.fateSilkU) { G.res.fateSilk.on = 1; }
  if (UD[id].e?.spiritInkU) { G.res.spiritInk.on = 1; }
  if (UD[id].e?.sigilU) { G.res.sigil.on = 1; }
  if (UD[id].e?.beadU) { G.res.bead.on = 1; }
  // 灵修分支 B阶段资源解锁
  if (UD[id].e?.resonanceU) { G.res.resonance.on = 1; }
  if (UD[id].e?.elixirU) { G.res.elixir.on = 1; }
  if (UD[id].e?.spectrumU) { G.res.spectrum.on = 1; }
  if (UD[id].e?.insightU) { G.res.insight.on = 1; }
  // v0.16 副线激活（研究完成时触发）
  if (UD[id].e?.subBranch) {
    var sbId = UD[id].e.subBranch;
    if (!G.subBranches[sbId]) {
      G.subBranches[sbId] = true;
      log('「' + (sbId === 'D' ? '神启' : sbId === 'T' ? '通达' : sbId) + '」之道已开启。', 'important');
      if (sbId === 'D') log('祭司从旧墟带回一卷文书，纸页已经粘在一起了。它用水汽熏了两季，才把第一页揭开。上面的字是用爪尖刻的，笔画很浅，像写的人不敢用力。祭坛是用三块平石搭的，没有装饰。第一份供奉是一撮盐，一块磨刀石，一卷重新抄好的经文。', 'echo');
    }
  }
    // 神启：解锁虔诚资源
    if (UD[id].e?.pietyU) {
      G.res.piety.on = 1;
    }
    // 神启：解锁圣油资源
    if (UD[id].e?.holyOilU) {
      G.res.holyOil.on = 1;
    }
    // 通达：解锁声誉资源
    if (UD[id].e?.renownU) {
      G.res.renown.on = 1;
    }
    // 通达：解锁信物资源
    if (UD[id].e?.credentialU) {
      G.res.credential.on = 1;
    }
  // 通达副线 Phase B 资源解锁
  if (UD[id].e?.charterU) { G.res.charter.on = 1; }
  if (UD[id].e?.exoticU) { G.res.exotic.on = 1; }
  // 神启副线 B-教团资源解锁
  if (UD[id].e?.holyFlameU) { G.res.holyFlame.on = 1; }
  if (UD[id].e?.holyIronU) { G.res.holyIron.on = 1; }
  // 神启副线 B-秘仪资源解锁
  if (UD[id].e?.ambrosiaU) { G.res.ambrosia.on = 1; }
  if (UD[id].e?.gnosisU) { G.res.gnosis.on = 1; }
  // 工业分支 C阶段资源解锁
  if (UD[id].e?.titanU) { G.res.titan.on = 1; }
  if (UD[id].e?.alloyU) { G.res.alloy.on = 1; }
  if (UD[id].e?.outlineU) { G.res.outline.on = 1; }
  if (UD[id].e?.starchartU) { G.res.starchart.on = 1; }
  if (UD[id].e?.titanPartU) { G.res.titanPart.on = 1; }
  if (UD[id].e?.pillarU) { G.res.pillar.on = 1; }
  // 工业分支 D阶段资源解锁（uranium 在 RD.mx=0，需在解锁时设基础上限）
  if (UD[id].e?.uraniumU) { G.res.uranium.on = 1; G.res.uranium.mx = 30; }
  if (UD[id].e?.thoriumU) { G.res.thorium.on = 1; }
  if (UD[id].e?.mirrorAlloyU) { G.res.mirrorAlloy.on = 1; }
  if (UD[id].e?.codexU) { G.res.codex.on = 1; }
  // 灵修分支 D阶段资源解锁（primordial 在 RD.mx=0，需在解锁时设基础上限）
  if (UD[id].e?.primordialU) { G.res.primordial.on = 1; G.res.primordial.mx = 30; }
  if (UD[id].e?.silenceStoneU) { G.res.silenceStone.on = 1; }
  if (UD[id].e?.mirrorSpiritU) { G.res.mirrorSpirit.on = 1; }
  if (UD[id].e?.voidCodexU) { G.res.voidCodex.on = 1; }
  // 神启副线 C-教团 资源解锁（hymn 在 RD.mx=0，需在解锁时设基础上限）
  if (UD[id].e?.hymnU) { G.res.hymn.on = 1; G.res.hymn.mx = 30; }
  if (UD[id].e?.holyRelicU) { G.res.holyRelic.on = 1; }
  if (UD[id].e?.holyScriptureU) { G.res.holyScripture.on = 1; }
  // 神启副线 C-秘仪资源解锁（v0.20 §八 5.3e）
  if (UD[id].e?.divineInkU) { G.res.divineInk.on = 1; }
  if (UD[id].e?.apotheosisStoneU) { G.res.apotheosisStone.on = 1; }
  if (UD[id].e?.forbiddenCodexU) { G.res.forbiddenCodex.on = 1; }
  // 灵修分支 C阶段资源解锁
  if (UD[id].e?.crystalSilkU) { G.res.crystalSilk.on = 1; }
  if (UD[id].e?.radianceU) { G.res.radiance.on = 1; }
  if (UD[id].e?.spiritCoreU) { G.res.spiritCore.on = 1; }
  if (UD[id].e?.formSoulU) { G.res.formSoul.on = 1; }
  if (UD[id].e?.spiritChartU) { G.res.spiritChart.on = 1; }
  // v0.14 文化研究解锁中间品资源
  if (id === 'folkLore' && G.res.dye) G.res.dye.on = 1;
  if (id === 'calendar' && G.res.wine) G.res.wine.on = 1;
  if (id === 'engraving' && G.res.ink) G.res.ink.on = 1;
  // v0.15 墨契：本次研究消耗墨契标记（A3：inkPactBp 一并清，避免遗留商队加成）
  if (inkPactUsed) {
    G.inkPact = -1;
    G.inkPactBp = false;
    log('墨契生效，本次研究花费 -40%。', 'echo');
  }
  // 灵修 B 灵术悟语：消耗后清除
  if (G.sageUtterActive) {
    G.sageUtterActive = false;
    log('悟语生效，本次研究花费大幅降低。', 'echo');
  }
  // v0.16 阶段推进（完成阶段关键研究 → G.phase 递增）
  if (id === 'councilLore') G.phase = Math.max(G.phase || 0, 1);
  if (id === 'branchLore') G.phase = Math.max(G.phase || 0, 2);
  if (id === 'oilExtract' || id === 'inscription') G.phase = Math.max(G.phase || 0, 3);
  if (id === 'calcination' || id === 'crystalize') G.phase = Math.max(G.phase || 0, 4);
  log('研究完成：' + UD[id].n, 'important');
  if (id === 'councilLore') log('木匠把最后一条长凳搬进石屋。十七只狐狸陆续坐下，爪子放在膝上。角落里那只负责记录的学者拧开墨瓶，在卷轴上写了第一行字。', 'echo');
  if (id === 'branchLore') log('路径在苔藓下分岔，如古木的根系自行寻找水源。一种选择意味着一种遗忘，而山谷的喉咙尚未学会同时吟唱两种祷词。', 'echo');
  if (id === 'oilExtract') log('矿工凿穿第四层岩壁，黑油渗出缝来。火焰第一次舔上它的时候，整个矿洞亮了。', 'echo');
  if (id === 'inscription') log('凿子触碰花岗岩表面的那一刻，石头内部的晶体排列方式往同一个方向偏转了三度——纹路从此被固定在矿物记忆的最深层，刻痕学会了呼吸，花岗岩不再是沉默的。', 'echo');
  if (id === 'calcination') log('炉膛冷下来。铁匠钳出那块金属，比铁轻，比铁硬。它落在砧上时，声音比铁薄。', 'echo');
  if (id === 'crystalize') log('感知者把命丝封进锡匣，等了十二天。打开时，丝上长满了透明的晶柱，每一根都指向同一个方向。', 'echo');
  // v0.20 §八 hotfix: branchLore 完成后立即弹强制选路对话框
  // （之前只有 migrate() 在 load 时检测 → 玩家研究完不刷新就看不到选路 → 典制页签缺主线选项）
  if (id === 'branchLore' && !G.policies?.branch && typeof showBranchMigrationModal === 'function') {
    showBranchMigrationModal();
  }
  rAll();
}

// craft() moved below toggleAutoCraft for 进阶升级 integration

function aJob(id, d) {
  if (d > 0 && G.freeFox <= 0) return;
  if (d < 0 && G.job[id].c <= 0) return;
  G.job[id].c += d;
  G.freeFox -= d;
  rAll();
}

function trainCost(id) {
  var base = (G.train[id] || 0) + 2;
  // v0.16 政策：教育政策对授业费用的乘数
  var mul = 1;
  if (G.policies) {
    for (var dom in G.policies) {
      var optId = G.policies[dom];
      if (!optId || !POLICY[dom] || !POLICY[dom].opts[optId]) continue;
      var pe = POLICY[dom].opts[optId].e;
      if (pe && pe.trainCostM) mul += pe.trainCostM;
    }
  }
  return Math.max(1, Math.ceil(base * mul));
}

function canTrain(id) {
  return G.res.scroll.v >= trainCost(id);
}

function trainJob(id) {
  var cost = trainCost(id);
  if (G.res.scroll.v < cost) return;
  G.res.scroll.v -= cost;
  G.train[id] = (G.train[id] || 0) + 1;
  log(JD[id].n + '完成了第' + G.train[id] + '次授业，产出提升！', 'important');
  rAll();
}

function sell(id) {
  if (!G.bld[id] || G.bld[id].c <= 0) return;
  G.bld[id].c--;
  // 返还当前等级（降级后）造价的 50%
  for (let i = 0; i < BD[id].p.length; i++) {
    var refund = Math.floor(bp(id, i) * 0.5);
    G.res[BD[id].p[i].r].v = Math.min(G.res[BD[id].p[i].r].v + refund, G.res[BD[id].p[i].r].mx);
  }
  // 重算容量，超出的狐狸保留为闲置
  calcMx();
  G.freeFox = G.foxes - (G.foxAway || 0) - Object.values(G.job).reduce((s, j) => s + j.c, 0);
  // v0.15.1 建筑维持状态重置
  if (id === 'moonStage' && G.bld.moonStage.c <= 0) G.moonStageActive = false;
  if (id === 'artistry' && G.bld.artistry.c <= 0) G.artistryActive = false;
  log('出售了' + BD[id].n + '（剩余' + G.bld[id].c + '座）');
  rAll();
}

// ===== 灵术 =====
function spellCostMul() {
  if (G.bldSpec.shrine === 'B') return SPEC_BD.shrine.B.spellCostMul;
  return 1;
}

// v0.19 §七 4.2: 灵修 C 升级 _spellCostReduce 收集（如虚行免耗 radiance -1）
function getSpellCostReduce(spellId) {
  var reduce = {};
  for (var uid in G.upgd) {
    if (!G.upgd[uid].done) continue;
    var ue = UPGD[uid]?.e;
    if (ue && ue._spellCostReduce && ue._spellCostReduce[spellId]) {
      var sr = ue._spellCostReduce[spellId];
      for (var rk in sr) reduce[rk] = (reduce[rk] || 0) + sr[rk];
    }
  }
  return reduce;
}

function calcSpellCost(spellId) {
  var mul = spellCostMul();
  var reduce = getSpellCostReduce(spellId);
  var costs = [];
  for (var i = 0; i < SD[spellId].cost.length; i++) {
    var p = SD[spellId].cost[i];
    var amt = Math.max(0, p.a - (reduce[p.r] || 0));
    costs.push({ r: p.r, a: Math.ceil(amt * mul) });
  }
  return costs;
}

function spellCooldownMul() {
  var mul = 1;
  for (var _sc in G.upgd) {
    if (G.upgd[_sc].done && UPGD[_sc]?.e?._spellCoolReduce) mul *= (1 - UPGD[_sc].e._spellCoolReduce);
  }
  // v0.19 §七 4.2: 化形师被动——灵术冷却 -5%/人
  if (G.job.shapeMaster?.c > 0) mul *= Math.pow(0.95, G.job.shapeMaster.c);
  return Math.max(0.3, mul);
}

function canSpell(id) {
  if (!chk(SD[id].uq)) return false;
  // 分支门控（主线 br + 副线 sb）
  if (anyBranchLocked(SD[id])) return false;
  // 真实冷却检查
  if (SD[id].cooldown && G.spellCooldowns[id] && G.spellCooldowns[id] > G.tick) return false;
  // v0.19 §七 4.2: 使用 calcSpellCost 计算含减免的费用
  var costs = calcSpellCost(id);
  for (const p of costs)
    if (G.res[p.r].v < p.a) return false;
  return true;
}

function castSpell(id) {
  if (!canSpell(id)) return;

  if (id === 'rain' && G.rainSeason === G.season) {
    log('本季已经祈过雨了。', 'warn');
    return;
  }
  if (id === 'summon' && G.spiritSeason === G.season) {
    log('本季已经召唤过祖灵了。', 'warn');
    return;
  }
  if (id === 'harvest' && G.harvestSeason === G.season) {
    log('本季已经举办过丰收祭了。', 'warn');
    return;
  }
  if (id === 'spiritPath') {
    // 找剩余时间最长的、未使用过灵路的远行
    var target = null, maxT = -1;
    for (var i = 0; i < G.expeditions.length; i++) {
      if (!G.expeditions[i].usedSpiritPath && G.expeditions[i].ticksLeft > maxT) {
        maxT = G.expeditions[i].ticksLeft;
        target = G.expeditions[i];
      }
    }
    if (!target) { log('没有可加速的远行队伍。', 'warn'); return; }
    for (const p of SD[id].cost) G.res[p.r].v -= Math.ceil(p.a * spellCostMul());
    target.ticksLeft = Math.ceil(target.ticksLeft * 0.7);
    target.usedSpiritPath = true;
    log('灵路开启，前往' + EXD[target.dest].n + '的队伍加速了！', 'important');
    rAll();
    return;
  }
  if (id === 'tradeWind') {
    if (G.tradeWindYear === G.year) { log('今年已经召唤过商风了。', 'warn'); return; }
    if (G.caravan) { log('已有商队在场。', 'warn'); return; }
    for (const p of SD[id].cost) G.res[p.r].v -= Math.ceil(p.a * spellCostMul());
    G.tradeWindYear = G.year;
    trySpawnCaravan();
    log('商风吹起，远方的商队循风而来！', 'important');
    rAll();
    return;
  }
  if (id === 'feast') {
    if (G.feastSeason === G.season) { log('本季已经举办过宴席了。', 'warn'); return; }
    for (const p of SD[id].cost) G.res[p.r].v -= Math.ceil(p.a * spellCostMul());
    G.feastSeason = G.season;
    log('山谷宴席开始了，谷里满意度提升。', 'important');
    rAll();
    return;
  }
  // v0.15 文化灵术
  if (id === 'overflow') {
    if (G.overflowSeason === G.season) { log('本季已经施过盈库了。', 'warn'); return; }
    for (const p of SD[id].cost) G.res[p.r].v -= Math.ceil(p.a * spellCostMul());
    G.overflowSeason = G.season;
    log('盈库灵术施展，本季资源上限扩展，满仓不再浪费！', 'important');
    rAll();
    return;
  }
  if (id === 'doubleCraft') {
    if (G.doubleCraftSeason === G.season) { log('本季已经施过双工了。', 'warn'); return; }
    for (const p of SD[id].cost) G.res[p.r].v -= Math.ceil(p.a * spellCostMul());
    G.doubleCraftSeason = G.season;
    log('双工灵术施展，工坊产出提升 50%！', 'important');
    rAll();
    return;
  }
  if (id === 'inkPact') {
    if (G.inkPact === G.season) { log('墨契尚未用完，请先完成一次研究。', 'warn'); return; }
    for (const p of SD[id].cost) G.res[p.r].v -= Math.ceil(p.a * spellCostMul());
    G.inkPact = G.season;
    G.inkPactBp = true;
    log('墨契写就，下次研究花费降低，下支商队或更易携带图纸。', 'important');
    rAll();
    return;
  }

  // ===== 灵修 A 阶段灵术 =====
  if (id === 'spiritSight') {
    // 灵视：一次远行剩余时间 -50%（找剩余时间最长的未使用过灵视的远行）
    var target = null, maxT = -1;
    for (var i = 0; i < G.expeditions.length; i++) {
      if (!G.expeditions[i].usedSpiritSight && G.expeditions[i].ticksLeft > maxT) {
        maxT = G.expeditions[i].ticksLeft;
        target = G.expeditions[i];
      }
    }
    if (!target) { log('没有可加速的远行队伍。', 'warn'); return; }
    for (const p of SD[id].cost) G.res[p.r].v -= Math.ceil(p.a * spellCostMul());
    target.ticksLeft = Math.ceil(target.ticksLeft * 0.5);
    target.usedSpiritSight = true;
    G.spellCooldowns[id] = G.tick + SD[id].cooldown;
    log('灵视开启，前往' + EXD[target.dest].n + '的队伍大幅加速了！', 'important');
    rAll();
    return;
  }
  if (id === 'tidePull') {
    if (G.tidePullSeason === G.season) { log('本季已经引过潮了。', 'warn'); return; }
    for (const p of SD[id].cost) G.res[p.r].v -= Math.ceil(p.a * spellCostMul());
    G.tidePullSeason = G.season;
    G.spellCooldowns[id] = G.tick + SD[id].cooldown;
    log('灵潮涌入，本季所有建筑的产出都变强了！', 'important');
    rAll();
    return;
  }
  if (id === 'fateWeave') {
    if (G.fateWeaveSeason === G.season) { log('本季已经织过命了。', 'warn'); return; }
    for (const p of SD[id].cost) G.res[p.r].v -= Math.ceil(p.a * spellCostMul());
    G.fateWeaveSeason = G.season;
    G.spellCooldowns[id] = G.tick + SD[id].cooldown;
    log('命丝绞入工坊，所有配方的产出都疯长了一截！', 'important');
    rAll();
    return;
  }

  // ===== 灵修 B 阶段灵术 =====
  if (id === 'resonWave') {
    if (G.resonWaveSeason === G.season) { log('本季已经施过共振波了。', 'warn'); return; }
    for (const p of SD[id].cost) G.res[p.r].v -= Math.ceil(p.a * spellCostMul());
    G.resonWaveSeason = G.season;
    G.spellCooldowns[id] = G.tick + Math.ceil(SD[id].cooldown * spellCooldownMul());
    log('共振波扩散，本季所有产出大幅提升！', 'important');
    rAll();
    return;
  }
  if (id === 'shapeFox') {
    if (G.shapeFoxSeason === G.season) { log('本季已经化过形了。', 'warn'); return; }
    for (const p of SD[id].cost) G.res[p.r].v -= Math.ceil(p.a * spellCostMul());
    G.shapeFoxSeason = G.season;
    // 化形延时升级：额外持续季数
    G.shapeFoxExtra = 0;
    for (var _se in G.upgd) {
      if (G.upgd[_se].done && UPGD[_se]?.e?._shapeExtend) G.shapeFoxExtra += UPGD[_se].e._shapeExtend;
    }
    G.spellCooldowns[id] = G.tick + Math.ceil(SD[id].cooldown * spellCooldownMul());
    log('灵狐化形！所有职业效率大幅提升！', 'important');
    rAll();
    return;
  }
  if (id === 'sageUtter') {
    if (G.sageUtterActive) { log('悟语尚在生效中，先完成一次研究。', 'warn'); return; }
    for (const p of SD[id].cost) G.res[p.r].v -= Math.ceil(p.a * spellCostMul());
    G.sageUtterActive = true;
    G.spellCooldowns[id] = G.tick + Math.ceil(SD[id].cooldown * spellCooldownMul());
    log('悟语凝聚，下一次研究的花费将大幅降低。', 'important');
    rAll();
    return;
  }
  if (id === 'calmFlow') {
    for (const p of SD[id].cost) G.res[p.r].v -= Math.ceil(p.a * spellCostMul());
    G.unrest = Math.max(0, G.unrest - 30);
    G.spellCooldowns[id] = G.tick + Math.ceil(SD[id].cooldown * spellCooldownMul());
    log('净流涌过，躁念平息了许多。', 'important');
    rAll();
    return;
  }

  // ===== 灵修 C 阶段灵术 =====
  if (id === 'spiritWeave') {
    if (G.spiritWeaveSeason === G.season) { log('本季已经施过灵织了。', 'warn'); return; }
    var swCosts = calcSpellCost(id);
    for (const p of swCosts) G.res[p.r].v -= p.a;
    G.spiritWeaveSeason = G.season;
    G.spellCooldowns[id] = G.tick + Math.ceil(SD[id].cooldown * spellCooldownMul());
    log('灵织启动，本季所有配方自动运转！', 'important');
    rAll();
    return;
  }
  if (id === 'voidWalk') {
    var target = null, maxT = -1;
    for (var i = 0; i < G.expeditions.length; i++) {
      if (!G.expeditions[i].usedVoidWalk && G.expeditions[i].ticksLeft > maxT) {
        maxT = G.expeditions[i].ticksLeft;
        target = G.expeditions[i];
      }
    }
    if (!target) { log('没有可完成的远行队伍。', 'warn'); return; }
    var vwCosts = calcSpellCost(id);
    for (const p of vwCosts) G.res[p.r].v -= p.a;
    target.ticksLeft = 0;
    target.usedVoidWalk = true;
    G.spellCooldowns[id] = G.tick + Math.ceil(SD[id].cooldown * spellCooldownMul());
    log('虚行开启，前往' + EXD[target.dest].n + '的队伍立即归来！', 'important');
    rAll();
    return;
  }
  if (id === 'starSenseSpell') {
    if (G.starSenseSeason === G.season) { log('本季已经施过星感了。', 'warn'); return; }
    var ssCosts = calcSpellCost(id);
    for (const p of ssCosts) G.res[p.r].v -= p.a;
    G.starSenseSeason = G.season;
    G.spellCooldowns[id] = G.tick + Math.ceil(SD[id].cooldown * spellCooldownMul());
    log('星感启动，本季灵图产出大幅提升！', 'important');
    rAll();
    return;
  }

  // ===== 灵修 D 阶段灵术（v0.20 §八 5.2f） =====
  if (id === 'primordialDriveSpell') {
    if (G.primordialDriveSeason === G.season) { log('本季已经施过元驱了。', 'warn'); return; }
    for (const p of SD[id].cost) G.res[p.r].v -= Math.ceil(p.a * spellCostMul());
    G.primordialDriveSeason = G.season;
    G.spellCooldowns[id] = G.tick + Math.ceil(SD[id].cooldown * spellCooldownMul());
    log('元驱启动，本季所有灵修建筑效果倍增！', 'important');
    rAll();
    return;
  }
  if (id === 'mirrorViewSpell') {
    for (const p of SD[id].cost) G.res[p.r].v -= Math.ceil(p.a * spellCostMul());
    G.spellCooldowns[id] = G.tick + Math.ceil(SD[id].cooldown * spellCooldownMul());
    G.res.lore.v += 1000;
    log('镜观启动。灵图在水面上浮起一层薄影，影子里隐约成形——学识 +1000。', 'important');
    rAll();
    return;
  }
  if (id === 'voidReadSpell') {
    if (G.voidReadActive) { log('幽读尚在生效中，先完成一次升级。', 'warn'); return; }
    for (const p of SD[id].cost) G.res[p.r].v -= Math.ceil(p.a * spellCostMul());
    G.voidReadActive = true;
    G.spellCooldowns[id] = G.tick + Math.ceil(SD[id].cooldown * spellCooldownMul());
    log('幽典展开，下一次升级花费将大幅降低。', 'important');
    rAll();
    return;
  }
  if (id === 'silenceMeditation') {
    for (const p of SD[id].cost) G.res[p.r].v -= Math.ceil(p.a * spellCostMul());
    G.spellCooldowns[id] = G.tick + Math.ceil(SD[id].cooldown * spellCooldownMul());
    G.silenceMeditationSeason = G.season;
    log('寂石冥想——山谷的时间慢了一拍，本季的劳作落到地里都比往常重一分。', 'echo');
    rAll();
    return;
  }
  if (id === 'pactPrayerSpell') {
    for (const p of SD[id].cost) G.res[p.r].v -= Math.ceil(p.a * spellCostMul());
    G.spellCooldowns[id] = G.tick + Math.ceil(SD[id].cooldown * spellCooldownMul());
    // 简化版：循环切换 5 灵契
    var pacts = ['earthPact', 'waterPact', 'woodPact', 'firePact', 'metalPact'];
    var idx = pacts.indexOf(G.activePact);
    G.activePact = pacts[(idx + 1) % 5];
    log('灵契祈愿：当前灵契切换为「' + PACT_DEF[G.activePact].n + '」——' + PACT_DEF[G.activePact].d, 'important');
    rAll();
    return;
  }

  for (const p of SD[id].cost) G.res[p.r].v -= Math.ceil(p.a * spellCostMul());

  if (id === 'rain') {
    G.rainSeason = G.season;
    log('符咒燃尽，天空飘来细雨，野莓产量提升！', 'important');
  } else if (id === 'summon') {
    G.spiritSeason = G.season;
    log('先祖的身影若隐若现，所有职业产出大幅提升！', 'important');
  } else if (id === 'harvest') {
    G.harvestSeason = G.season;
    log('丰收祭奏效了，本季建筑造价降低！', 'important');
    // 触发一次有数值奖励的山谷见闻
    tryRewardEvent();
  }
  rAll();
}

// ===== 工坊自动制作开关 =====
// 注：连续速率在 calcR() 中处理，此处仅切换 G.autoCraft[id] 标记。
function toggleAutoCraft(id) {
  G.autoCraft[id] = !G.autoCraft[id];
  rTC();
}

// ===== 进阶升级购买 =====
function buyUpgd(id) {
  if (!UPGD[id] || G.upgd[id].done) return;
  if (!canUpgd(id)) return;
  var mul = upgdCostMul();
  for (var i = 0; i < UPGD[id].p.length; i++) {
    var p = UPGD[id].p[i];
    G.res[p.r].v -= Math.ceil(p.a * mul);
  }
  G.upgd[id].done = 1;
  log('进阶升级：' + UPGD[id].n, 'important');
  if (G.voidReadActive) {
    G.voidReadActive = false;
    log('幽典消散——这次升级的费用被折去了三成。', 'echo');
  }
  rAll();
}

// ===== 手动制作（含进阶升级配方修正） =====
function craft(id) {
  if (!canC(id)) return;
  if (anyBranchLocked(CD[id])) return;
  // v0.19 §七 4.3: 永久配方特殊处理
  if (CD[id].perm) { craftPerm(id); return; }
  var ucm = collectCraftM()[id];
  // v0.19 §七 4.2 灵修 C 升级：_craftReduce（配方全原料消耗减免，如晶丝韧化 -20%）
  var _crReduce = 0;
  for (var _cr in G.upgd) {
    if (G.upgd[_cr].done && UPGD[_cr]?.e?._craftReduce?.[id]) _crReduce += UPGD[_cr].e._craftReduce[id];
  }
  for (const p of CD[id].inp) {
    var inpMul = 1;
    if (ucm && ucm.inpM && ucm.inpM[p.r]) inpMul = Math.max(0, 1 + ucm.inpM[p.r]);
    if (_crReduce > 0) inpMul *= Math.max(0, 1 - _crReduce);
    G.res[p.r].v -= Math.ceil(p.a * inpMul);
  }
  var outMul = 1 + (ucm && ucm.outMul ? ucm.outMul : 0);
  // v0.18 §六 3.4 占卜年签：锻造签工艺加成
  var _divCraft = getDivinationEffects();
  if (_divCraft && _divCraft.bonus.craftM) outMul += _divCraft.bonus.craftM;
  // 工厂：所有配方产出 +craftAllM%/座（受能量供给比衰减）
  if (G.bld.factory?.c && BD.factory?.e?.craftAllM) {
    var factoryBonus = BD.factory.e.craftAllM * G.bld.factory.c;
    if (G.energyRatio < 1) factoryBonus *= G.energyRatio;
    outMul += factoryBonus;
  }
  // C阶段：精炼厂效率——合金类配方产出加成
  if (id === 'forgeAlloy' && G.bld.refinery?.c && BD.refinery?.e?._refineryEff) {
    var refBonus = BD.refinery.e._refineryEff * G.bld.refinery.c;
    if (G.energyRatio < 1) refBonus *= G.energyRatio;
    outMul += refBonus;
  }
  // 工程师：所有配方产出 +3%/人（加法叠入，受能量影响同工厂）
  // 受授业加成（每级 +10% 基础效率）+ 政策训练扁平加算
  if (G.job.engineer?.c) {
    var _ptf = 0;
    if (G.policies) { for (var dom in G.policies) { var oid = G.policies[dom]; if (oid && POLICY[dom] && POLICY[dom].opts[oid] && POLICY[dom].opts[oid].e && POLICY[dom].opts[oid].e.trainFlat) _ptf += POLICY[dom].opts[oid].e.trainFlat; } }
    var engTrain = 1 + (G.train.engineer || 0) * 0.1 + _ptf;
    var engBonus = 0.03 * G.job.engineer.c * engTrain;
    // C阶段进阶升级：工程师配方加成额外提升
    for (var _ecb in G.upgd) {
      if (G.upgd[_ecb].done && UPGD[_ecb]?.e?._engCraftBonus) engBonus += UPGD[_ecb].e._engCraftBonus * G.job.engineer.c * engTrain;
    }
    if (G.energyRatio < 1) engBonus *= G.energyRatio;
    outMul += engBonus;
  }
  // v0.19 §七 4.3 教团：圣铁齿轮工业配方加成
  if (G._holyGearBonus && G.mainLine === 'industry' && CD[id].br === 'I') outMul += G._holyGearBonus;
  // v0.19 §七 4.3 教团：神圣工业升级
  var _sacredIndM = 0;
  for (var _si in G.upgd) {
    if (G.upgd[_si].done && UPGD[_si]?.e?._sacredIndustryM && CD[id].br === 'I') _sacredIndM += UPGD[_si].e._sacredIndustryM;
  }
  if (_sacredIndM > 0) outMul += _sacredIndM;
  // v0.19 §七 4.3 教令 _craftAllM
  if (G._edicts) {
    for (var _ec = 0; _ec < G._edicts.length; _ec++) {
      if (G._edicts[_ec].effects._craftAllM) outMul += G._edicts[_ec].effects._craftAllM;
    }
  }
  // 灵契 _craftAllM（烈焰契 +20%）
  var _pactE_c = pactE();
  if (_pactE_c._craftAllM) outMul += _pactE_c._craftAllM;
  // 艺工坊：dye/wine/ink 配方产出 +craftCultureMul/座（断供时半效）
  if (id === 'dye' || id === 'wine' || id === 'ink') {
    if (G.bld.artistry?.c && BD.artistry?.e?.craftCultureMul) {
      var _artMul = G.artistryActive ? 1 : 0.5;
      outMul += BD.artistry.e.craftCultureMul * G.bld.artistry.c * _artMul;
    }
    if (G.upg.artistryLore?.done) outMul += 0.2;
  }
  // v0.19 §七 4.2 灵修 C 升级：_craftBonus（配方扁平额外产出，如形魄凝实 +1）
  var _craftFlatBonus = 0;
  for (var _cb in G.upgd) {
    if (G.upgd[_cb].done && UPGD[_cb]?.e?._craftBonus?.[id]) _craftFlatBonus += UPGD[_cb].e._craftBonus[id];
  }
  // v0.19 §七 4.2 灵修 C 升级：_craftDouble（双产概率，如灵核双产 20%）
  var _craftDoubleMul = 1;
  for (var _cd in G.upgd) {
    if (G.upgd[_cd].done && UPGD[_cd]?.e?._craftDouble?.[id]) {
      if (Math.random() < UPGD[_cd].e._craftDouble[id]) _craftDoubleMul = 2;
    }
  }
  for (const p of CD[id].out) {
    G.res[p.r].v = Math.min(G.res[p.r].v + Math.floor((p.a + _craftFlatBonus) * outMul * _craftDoubleMul), G.res[p.r].mx);
    if (!G.res[p.r].on) G.res[p.r].on = true;  // hotfix: craft 产出资源应 unlock 可见性（与 ED 事件一致）
  }
  if (_craftDoubleMul > 1) log('制作了' + CD[id].n + '（双产！）');
  else log('制作了' + CD[id].n);
  G._achFirstCraft = true;
  rAll();
}

// ===== 油桶消耗：消耗1桶=火油上限永久+10（branch-industry.md 裁决）=====
function useBarrel() {
  if (!G.res.barrel || G.res.barrel.v < 1) return;
  G.res.barrel.v -= 1;
  G.barrelUsed = (G.barrelUsed || 0) + 1;
  log('打开了一只油桶——火油储量上限永久 +10');
  calcMx();
  rAll();
}

// ===== 灵液消耗：消耗1瓶=灵能上限永久+10（branch-mystic.md 设计）=====
function useElixir() {
  if (!G.res.elixir || G.res.elixir.v < 1) return;
  G.res.elixir.v -= 1;
  var bonus = 10;
  // 升级#22 灵液精酿：扩展效果 10→15
  for (var uid in G.upgd) {
    if (G.upgd[uid].done && UPGD[uid]?.e?._elixirBonus) bonus += UPGD[uid].e._elixirBonus;
  }
  G.elixirUsed = (G.elixirUsed || 0) + 1;
  G._elixirBonusPerUse = bonus;
  log('饮下一瓶灵液——灵能储量上限永久 +' + bonus);
  calcMx();
  rAll();
}

// ===== v0.15 节令系统：应用本季选择 =====
// selection: { dye: bool, wine: bool, ink: bool }
// silent=true：离线补算时调用，不输出 per-season 日志（汇总在 simulateOffline 末尾）
// 资源不够的项自动跳过。
function applySeasonRites(selection, silent) {
  G.seasonRites = { dye: false, wine: false, ink: false, all: false };
  var applied = [];
  var skipped = [];
  for (const k of Object.keys(SEASON_RITES)) {
    var cfg = SEASON_RITES[k];
    if (!selection[k]) continue;
    if (G.res[k] && G.res[k].v >= cfg.consume) {
      G.res[k].v -= cfg.consume;
      G.seasonRites[k] = true;
      applied.push(cfg.name);
    } else {
      skipped.push(cfg.name);
    }
  }
  G.seasonRites.all = G.seasonRites.dye && G.seasonRites.wine && G.seasonRites.ink;
  G.lastSeasonRites = { dye: !!selection.dye, wine: !!selection.wine, ink: !!selection.ink };
  G.pendingSeasonRites = { open: false };
  G.lastRiteToast = G.season;
  if (silent) return;  // 离线模式：跳过 per-season 日志和 rAll，由调用者处理
  if (applied.length) {
    var msg = '本季节令已应用：' + applied.join('、');
    if (G.seasonRites.all) msg += '（三全礼生效）';
    log(msg, 'event');
  }
  if (skipped.length) {
    log('资源不足，跳过：' + skipped.join('、'), 'warn');
  }
  if (G.seasonRites.dye && !G.dyeRiteEchoDone) { G.dyeRiteEchoDone = true; log('染坊把布匹分到每间窝棚。采集者穿上新衣，袖口上的蓝还没有干透。', 'echo'); }
  if (G.seasonRites.wine && !G.wineRiteEchoDone) { G.wineRiteEchoDone = true; log('酿师撬开第一个陶瓮的泥封。醴浆的气味飘出来，采集者端着碗在瓮前排成一行。喝完的狐狸把碗扣在石头上，擦了擦嘴，背上竹篓走进了树林。', 'echo'); }
  if (G.seasonRites.ink && !G.inkRiteEchoDone) { G.inkRiteEchoDone = true; log('烟炱在胶中拢合之后，墨锭学会了如何在砚台上卸下自己的身体。墨汁在石面上展开，每一下研磨都在砚池里留下一个不断扩散的圆，圆圈知道今夜会写到几时。', 'echo'); }
  rAll();
}

// ===== v0.14 习俗激活 =====
function customById(id) {
  for (var i = 0; i < CUSTD.length; i++) if (CUSTD[i].id === id) return CUSTD[i];
  return null;
}

// 注：req.customsHave = 数组，要求已激活特定的习俗 id（CUSTD unlock 用）；
//     与 chk(q.custom) 不同，后者是数字（已激活习俗总数门槛，BD/UD uq 用）。
function customUnlocked(id) {
  var c = customById(id);
  if (!c) return false;
  var req = c.unlock || {};
  if (req.u) for (var i = 0; i < req.u.length; i++) if (!G.upg[req.u[i]]?.done) return false;
  if (req.b) for (var k in req.b) if ((G.bld[k]?.c || 0) < req.b[k]) return false;
  if (req.j) for (var k in req.j) if ((G.job[k]?.c || 0) < req.j[k]) return false;
  if (req.r) for (var k in req.r) if ((G.res[k]?.v || 0) < req.r[k]) return false;
  if (req.customsHave) for (var i = 0; i < req.customsHave.length; i++) if (!G.customs[req.customsHave[i]]) return false;
  if (req.choice) for (var i = 0; i < req.choice.length; i++) if ((G.choicesDone || []).indexOf(req.choice[i]) < 0) return false;
  if (req.spring && (G.springExpDone || 0) < req.spring) return false;
  return true;
}

// §14.5 修复 3：习俗"是否对玩家可见"——习俗依赖的研究至少需出现在研究面板上
// （研究尚未 on 也尚未 done → 整张习俗卡隐藏，避免暴露玩家不认识的研究名）
function isCustomVisible(cst) {
  if (!cst) return false;
  var req = cst.unlock || {};
  if (req.u) {
    for (var i = 0; i < req.u.length; i++) {
      var udId = req.u[i];
      if (!G.upg[udId] || !(G.upg[udId].on || G.upg[udId].done)) return false;
    }
  }
  return true;
}

function canActivateCustom(id) {
  if (G.customs && G.customs[id]) return false; // 已激活
  if (!customUnlocked(id)) return false;
  var c = customById(id);
  for (var i = 0; i < c.cost.length; i++)
    if (G.res[c.cost[i].r].v < c.cost[i].a) return false;
  return true;
}

function activateCustom(id) {
  if (!canActivateCustom(id)) return;
  var c = customById(id);
  // 扣资源
  for (var i = 0; i < c.cost.length; i++)
    G.res[c.cost[i].r].v -= c.cost[i].a;
  // 标记激活（值为激活时 tick，便于将来扩展）
  if (!G.customs) G.customs = {};
  G.customs[id] = G.tick || 1;
  // onActivate 一次性效果
  if (c.onActivate) {
    if (c.onActivate.trainScholar) {
      G.train = G.train || {};
      G.train.scholar = (G.train.scholar || 0) + c.onActivate.trainScholar;
    }
    if (c.onActivate.ruinNarrAdvance) {
      // 旧墟叙事推进 +1（如果未到末尾）
      if (G.narratives && G.narratives.oldRuin && G.narratives.oldRuin.length < NARR.oldRuin.length) {
        var nextIdx = G.narratives.oldRuin.length;
        G.narratives.oldRuin.push(nextIdx);
        log(NARR.oldRuin[nextIdx], 'echo');
      }
    }
    if (c.onActivate.silentSeason) G.silentSeason = G.season;
  }
  log('习俗成立：' + c.n, 'important');
  rAll();
}

// ===== v0.15 节令面板交互（UI onclick 调用） =====
function markRiteIntroSeen() {
  G.riteIntroSeen = true;
  rAll();
}

function markFaithIntroSeen() {
  G.faithIntroSeen = true;
  rAll();
}

function setRiteMode(mode) {
  if (mode !== 'auto' && mode !== 'manual') return;
  G.riteMode = mode;
  log('节令模式切换为：' + (mode === 'auto' ? '自动应用' : '手动确认'), 'echo');
  rAll();
}

// 从 DOM checkbox 收集玩家选择
function _readRiteCheckboxes() {
  var sel = { dye: false, wine: false, ink: false };
  for (var k of Object.keys(SEASON_RITES)) {
    var el = document.getElementById('rite-cb-' + k);
    if (el) sel[k] = !!el.checked;
  }
  return sel;
}

function confirmRites() {
  var sel = _readRiteCheckboxes();
  applySeasonRites(sel, false);
  // applySeasonRites 内已 rAll
}

function skipRites() {
  // 不消耗、不加成；只清 pending 标记并记忆"全空"为下季 default
  G.seasonRites = { dye: false, wine: false, ink: false, all: false };
  G.lastSeasonRites = { dye: false, wine: false, ink: false };
  G.pendingSeasonRites = { open: false };
  log('本季节令已跳过。', 'event');
  rAll();
}

function saveRiteDefault() {
  var sel = _readRiteCheckboxes();
  G.lastSeasonRites = sel;
  log('节令默认已保存：将在下季按此应用。', 'echo');
  rAll();
}

// ===== v0.16 政体操作 =====
function chooseTier1Confirm(tier) {
  if (G.tier1) return;
  // v0.16 Tier 1 effect 实装后从 TIER 数据生成
  var t = (typeof TIER !== 'undefined') ? TIER[tier] : null;
  var name = t?.n || (tier === 'in' ? '内守' : '外拓');
  var desc = t?.d || (tier === 'in' ? '专注内政发展，基础产出与建筑优先。' : '专注对外扩张，远征与贸易优先。');
  var tierEffNames = { baseProdM: '基础资源', buildCostM: '建筑造价', expRewardM: '远行奖励', caravanProb: '商队来访' };
  var effParts = [];
  if (t && t.e) {
    for (var ek in t.e) {
      var v = t.e[ek];
      var nm = tierEffNames[ek] || ek;
      var sign = v > 0 ? '+' : '';
      effParts.push('<span class="eff-pos">' + nm + ' ' + sign + (v * 100).toFixed(0) + '%</span>');
    }
  }
  var eff = effParts.join('，');
  var costStr = (t && t.cost) ? t.cost.map(function(c){ return (RD[c.r]?.n || c.r) + ' ' + c.a; }).join(' + ') : '卷轴 30 + 铜钱 30';
  var h = '';
  h += '<div class="confirm-warn">此选择不可撤销</div>';
  h += '<div class="confirm-opts"><div class="confirm-opt" style="border-color:#46739a;background:#f0f4f8;">';
  h += '<div class="confirm-opt-name">' + name + '</div>';
  h += '<div style="font-size:11px;color:#888;">' + desc + '</div>';
  h += '<div>' + eff + '</div>';
  h += '<div style="font-size:11px;color:#666;margin-top:2px;">费用：' + costStr + '</div>';
  h += '</div></div>';
  h += '<div class="confirm-actions">';
  h += '<button onclick="closeModal()">取消</button>';
  h += '<button class="confirm-yes" onclick="chooseTier1(\'' + tier + '\');closeModal()">确认选择</button>';
  h += '</div>';
  document.getElementById('modal-title').textContent = '取向选择 — 确认';
  document.getElementById('modal-body').innerHTML = h;
  document.getElementById('modal-overlay').style.display = 'flex';
}

function choosePolityConfirm(id) {
  var pd = POLITY[id];
  if (!pd || G.polity) return;
  var h = '';
  h += '<div class="confirm-warn">此选择不可撤销</div>';
  h += '<div class="confirm-opts">';
  // Show all options in current tier, highlight selected
  for (var pid in POLITY) {
    var p = POLITY[pid];
    if (G.tier1 && p.tier1 !== G.tier1) continue;
    var isCur = pid === id;
    h += '<div class="confirm-opt" style="' + (isCur ? 'border-color:#46739a;background:#f0f4f8;' : 'opacity:.5;') + '">';
    h += '<div class="confirm-opt-name">' + p.n + (isCur ? ' ← 你的选择' : '') + '</div>';
    h += '<div style="font-size:11px;color:#888;">' + p.d + '</div>';
    h += '<div>' + polityEffectLines(p.e, 1).join(', ') + '</div>';
    if (p.pen && Object.keys(p.pen).length > 0) {
      h += '<div>' + polityPenLines(p.pen).join(', ') + '</div>';
    }
    h += '</div>';
  }
  h += '</div>';
  var costStr = (pd.cost || []).map(function(c) { return (RD[c.r]?.n || c.r) + ' ' + c.a; }).join(' + ');
  if (costStr) h += '<div style="font-size:11px;color:#666;">费用：' + costStr + '</div>';
  h += '<div class="confirm-actions">';
  h += '<button onclick="closeModal()">取消</button>';
  h += '<button class="confirm-yes" onclick="choosePolity(\'' + id + '\');closeModal()">确认选择</button>';
  h += '</div>';
  document.getElementById('modal-title').textContent = '治风选择 — 确认';
  document.getElementById('modal-body').innerHTML = h;
  document.getElementById('modal-overlay').style.display = 'flex';
}

function chooseTier1(tier) {
  if (G.tier1) return;
  if (!G.upg.polityLore?.done) return;
  if (tier !== 'in' && tier !== 'out') return;
  // v0.16 Tier 1 effect 实装后从 TIER 数据读 cost / 名称
  var cost = (typeof TIER !== 'undefined' && TIER[tier]?.cost) || [{ r: 'scroll', a: 30 }, { r: 'coin', a: 30 }];
  for (var i = 0; i < cost.length; i++) {
    if (!G.res[cost[i].r] || G.res[cost[i].r].v < cost[i].a) {
      log('资源不足，无法选定取向。', 'warn');
      return;
    }
  }
  for (var i = 0; i < cost.length; i++) {
    G.res[cost[i].r].v -= cost[i].a;
  }
  G.tier1 = tier;
  var name = (typeof TIER !== 'undefined' && TIER[tier]?.n) || (tier === 'in' ? '内守' : '外拓');
  log('谷中确立取向：' + name + '。', 'important');
  rAll();
}

function choosePolity(id) {
  if (!POLITY[id]) return;
  if (G.polity) return;
  if (!G.upg.polityLore?.done) return;
  // Tier 1 must be selected first
  if (!G.tier1) return;
  // Must match tier1
  if (POLITY[id].tier1 !== G.tier1) return;
  // Check cost
  var cost = POLITY[id].cost || [];
  for (var i = 0; i < cost.length; i++) {
    if (!G.res[cost[i].r] || G.res[cost[i].r].v < cost[i].a) {
      log('资源不足，无法选定治风。', 'warn');
      return;
    }
  }
  // Deduct cost
  for (var i = 0; i < cost.length; i++) {
    G.res[cost[i].r].v -= cost[i].a;
  }
  G.polity = id;
  G.tier1 = POLITY[id].tier1;
  log('谷中定下治风：' + POLITY[id].n + '。', 'important');
  rAll();
}

// (changePolity removed in §四 1.3 - polity is now permanent)

// (policySwitchCost removed in §四 1.3 - policies use cost arrays now)

function setPolicy(domain, option) {
  if (!POLICY[domain] || !POLICY[domain].opts[option]) return;
  var pd = POLICY[domain];
  // All policies are now permanent
  if (pd.uq && !chk(pd.uq)) return;
  // Already chosen - cannot change
  if (G.policies[domain]) {
    log('「' + pd.n + '」已确立，永久不可更改。', 'warn');
    return;
  }
  // Check cost (resource array)
  var cost = pd.cost || [];
  for (var i = 0; i < cost.length; i++) {
    if (!G.res[cost[i].r] || G.res[cost[i].r].v < cost[i].a) {
      log('资源不足，无法确立「' + pd.n + '」。', 'warn');
      return;
    }
  }
  // Deduct cost
  for (var i = 0; i < cost.length; i++) {
    G.res[cost[i].r].v -= cost[i].a;
  }
  G.policies[domain] = option;
  // v0.17 §五 2.6: 选路时同步设置 G.mainLine
  if (domain === 'branch') {
    if (option === 'I') {
      G.mainLine = 'industry';
      log('一只老矿工站在炉边看着铁水，觉得它像一种被烧化的耐心。它想了想，山谷里所有东西都是从石头里砸出来的——刀、钉子、门轴——但炉子不一样，炉子用一种热去逼石头说出它藏着的那个形状。烟从炉口冒上来，带着一种矿石的脾气，像是刚睡醒。', 'echo');
    }
    if (option === 'M') {
      G.mainLine = 'mystic';
      log('一只感知者把手放在岩壁上，感到下面有什么东西在用一种比时间还慢的频率翻身。它试着回忆自己最初学会听这个词的时候具体是什么意思——但手下的震动越来越清晰，像山谷在回答一个它还没问出口的问题。它把手缩回来，发现自己的指纹里夹了一层细密的灰，灰是温的。', 'echo');
    }
  }
  // v0.18 §六 3.6: 外交政策选通达时激活副线
  if (domain === 'diplomacy') {
    if (option === 'open') {
      G.subBranches.T = true;
      log('一只斥候站在山谷口，把地图翻过来看了一会。地图是它自己画的，画得很丑——几条线代表河，一个圈代表家，剩下的地方全是空白。它想，空白其实才是地图里最准确的部分，因为它还不知道那些地方长什么样。它把地图折好，塞进皮草卷里，然后迈开步子走进那片它还没画过的区域。', 'echo');
    }
    if (option === 'closed') G.subBranches.T = false;
  }
  var optName = pd.opts[option].n;
  log('「' + pd.n + '」已确立：' + optName + '。此选择不可逆。', 'important');
  rAll();
}

// 永久政策选择需要二次确认
function setPolicyConfirm(domain, option) {
  var pd = POLICY[domain];
  if (!pd) return;
  if (!pd.permanent) { setPolicy(domain, option); return; }
  var opt = pd.opts[option];
  if (!opt) return;
  var h = '';
  h += '<div class="confirm-warn">此选择不可撤销</div>';
  h += '<div class="confirm-opts">';
  for (var oid in pd.opts) {
    var o = pd.opts[oid];
    var isCur = oid === option;
    h += '<div class="confirm-opt" style="' + (isCur ? 'border-color:#46739a;background:#f0f4f8;' : 'opacity:.5;') + '">';
    h += '<div class="confirm-opt-name">' + o.n + (isCur ? ' ← 你的选择' : '') + '</div>';
    if (o.d) h += '<div style="font-size:11px;color:#888;">' + o.d + '</div>';
    if (o.e) h += '<div>' + policyEffectLines(o.e).join(', ') + '</div>';
    if (o.pen) h += '<div>' + policyEffectLines(o.pen).map(function(s){return s.replace('eff-pos','eff-neg')}).join(', ') + '</div>';
    h += '</div>';
  }
  h += '</div>';
  h += '<div class="confirm-actions">';
  h += '<button onclick="closeModal()">取消</button>';
  h += '<button class="confirm-yes" onclick="setPolicy(\'' + domain + '\',\'' + option + '\');closeModal()">确认选择</button>';
  h += '</div>';
  document.getElementById('modal-title').textContent = pd.n + ' — 确认选择';
  document.getElementById('modal-body').innerHTML = h;
  document.getElementById('modal-overlay').style.display = 'flex';
}

// ===== 神启仪式 =====
function castRitual(id) {
  var ritual = RITUALS[id];
  if (!ritual) return;
  if (!chk(ritual.uq)) return;
  if (anyBranchLocked(ritual)) return;
  // 冷却检查
  if (!G._ritualCD) G._ritualCD = {};
  if (G._ritualCD[id] > 0) { log('仪式尚在冷却中。', 'warn'); return; }
  // 费用检查
  for (var i = 0; i < ritual.cost.length; i++) {
    if (G.res[ritual.cost[i].r].v < ritual.cost[i].a) { log('资源不足。', 'warn'); return; }
  }
  // 扣除费用
  for (var i = 0; i < ritual.cost.length; i++) {
    G.res[ritual.cost[i].r].v -= ritual.cost[i].a;
  }
  // 设置冷却（1 = 下季可用）
  G._ritualCD[id] = 1;
  // 应用效果
  if (id === 'bless') {
    G._blessSeason = G.season;
    log('祈福仪式完成，本季全产出 +20%。', 'important');
  } else if (id === 'purify') {
    G.pollution = Math.max(0, (G.pollution || 0) - 15);
    G.unrest = Math.max(0, (G.unrest || 0) - 15);
    log('净化仪式完成，污染与躁念各 -15。', 'important');
  }
  rAll();
}

// ===== v0.19 §七 4.5 六神系统 =====
function chooseDeity(deityId) {
  if (!DEITY_DATA[deityId]) return;
  // 首次选神（非改宗）
  if (G.deity !== null) { log('已有主神，如需改宗请使用改宗功能。', 'warn'); return; }
  // 门控：需教团或秘仪 Phase B 研究
  if (!(G.upg.edictLore?.done || G.upg.mysteryInit?.done)) {
    log('尚未达到选神条件。', 'warn'); return;
  }
  G.deity = deityId;
  G.sect = null;
  G.deityCD = 0;
  G._deityRitualCD = {};
  log('你选定了「' + DEITY_DATA[deityId].n + '」为主神。', 'important');
  rAll();
}

function chooseSect(sectId) {
  if (!SECT_DATA[sectId]) return;
  if (!G.deity || SECT_DATA[sectId].deity !== G.deity) { log('教派不属于当前主神。', 'warn'); return; }
  // 教派切换代价：虔诚 ×30（首次免费）
  if (G.sect !== null) {
    if (G.res.piety.v < 30) { log('虔诚不足，无法改换教派。', 'warn'); return; }
    G.res.piety.v -= 30;
  }
  var oldSect = G.sect;
  G.sect = sectId;
  log('你加入了「' + SECT_DATA[sectId].n + '」教派。' + (oldSect ? '（虔诚 -30）' : ''), 'important');
  rAll();
}

function convertDeity(newDeityId) {
  if (!DEITY_DATA[newDeityId]) return;
  if (G.deity === newDeityId) { log('已信奉此神。', 'warn'); return; }
  if (G.deityCD > 0) { log('改宗冷却中，剩余 ' + G.deityCD + ' 季。', 'warn'); return; }
  // 费用：卷轴 ×80 + 古币 ×30
  if ((G.res.scroll?.v || 0) < 80) { log('卷轴不足。', 'warn'); return; }
  if ((G.res.ancCoin?.v || 0) < 30) { log('古币不足。', 'warn'); return; }
  G.res.scroll.v -= 80;
  G.res.ancCoin.v -= 30;
  G.res.piety.v = 0;
  var oldName = DEITY_DATA[G.deity]?.n || '无';
  G.deity = newDeityId;
  G.sect = null;
  G.deityCD = 5;
  G._deityRitualCD = {};
  G._deityRitualBuff = null;
  G._deitySmallBuff = null;
  log('改宗完成：「' + oldName + '」→「' + DEITY_DATA[newDeityId].n + '」。虔诚归零，5 季冷却。', 'important');
  rAll();
}

function castDeityRitual(ritualId) {
  var dr = DEITY_RITUAL_DATA[ritualId];
  if (!dr) return;
  if (G.deity !== dr.deity) { log('此仪式不属于当前主神。', 'warn'); return; }
  if (!G._deityRitualCD) G._deityRitualCD = {};
  if (G._deityRitualCD[ritualId] > 0) { log('仪式冷却中。', 'warn'); return; }
  // 大仪式：检查是否已有活跃 buff
  if (dr.dur !== 0 && G._deityRitualBuff) { log('已有大仪式效果生效中。', 'warn'); return; }
  // 费用检查
  for (var i = 0; i < dr.cost.length; i++) {
    if ((G.res[dr.cost[i].r]?.v || 0) < dr.cost[i].a) { log('资源不足。', 'warn'); return; }
  }
  // 扣除费用
  for (var i = 0; i < dr.cost.length; i++) {
    G.res[dr.cost[i].r].v -= dr.cost[i].a;
  }
  // 设置冷却
  G._deityRitualCD[ritualId] = dr.cd;
  // 应用效果
  if (dr.dur === 0) {
    // 小仪式：本季即时效果
    G._deitySmallBuff = { season: G.season, effects: dr.e };
    // 特殊处理：祖灵庇佑（即时减少不安/污染）
    if (dr.e._unrestReduce) G.unrest = Math.max(0, (G.unrest || 0) - dr.e._unrestReduce);
    if (dr.e._pollReduce) G.pollution = Math.max(0, (G.pollution || 0) - dr.e._pollReduce);
    // 特殊处理：知识窃取（立即获得研究进度）
    if (dr.e._researchProgress) {
      var maxCostRes = null, maxCost = 0;
      for (var uid in UD) {
        if (G.upg[uid]?.done) continue;
        if (!chk(UD[uid].uq)) continue;
        var totalCost = 0;
        for (var rk in UD[uid].cost) totalCost += UD[uid].cost[rk];
        if (totalCost > maxCost) { maxCost = totalCost; maxCostRes = uid; }
      }
      if (maxCostRes) {
        for (var rk in UD[maxCostRes].cost) {
          var need = UD[maxCostRes].cost[rk];
          var add = need * dr.e._researchProgress;
          if (G.res[rk]) G.res[rk].v = Math.min(G.res[rk].mx || Infinity, G.res[rk].v + add);
        }
        log('窃取了「' + UD[maxCostRes].n + '」15% 的知识。', 'event');
      }
    }
    log(dr.n + '完成。', 'important');
  } else if (dr.dur === -1) {
    // 特殊持续（命丝编织：下次占卜生效）
    G._deityRitualBuff = { id: ritualId, remain: 999, effects: dr.e };
    log(dr.n + '已编织，下次占卜可选 4 签。', 'important');
  } else {
    // 大仪式：持续多季
    G._deityRitualBuff = { id: ritualId, remain: dr.dur, effects: dr.e };
    log(dr.n + '开始，持续 ' + dr.dur + ' 季。', 'important');
  }
  rAll();
}

// ===== v0.18 §六 3.4 占卜系统 =====
function chooseDivination(idx) {
  if (G._divination !== null) return; // 已选过
  var drawn = G._divDrawn;
  if (!drawn || idx < 0 || idx >= drawn.length) return;
  var poolIdx = drawn[idx];
  var sign = DIVINATION_POOL[poolIdx];
  if (!sign) return;
  G._divination = poolIdx;
  G._divPending = false;
  log('抽得【' + sign.n + '】——' + sign.tip, 'important');
  closeModal();
  rAll();
}

function skipDivination() {
  G._divination = null;
  G._divPending = false;
  log('今年跳过了占卜。');
  closeModal();
  rAll();
}

// ===== v0.19 §七 4.3 教令系统 =====
function publishEdict(edictId) {
  var def = EDICT_DEF[edictId];
  if (!def) return;
  // 检查解锁
  if (def.uq && !chk(def.uq)) { log('尚未解锁该教令。', 'warn'); return; }
  // 检查副线
  if (!G.subBranches?.D || G.mainLine !== 'industry') { log('需要工业与神启同时开启。', 'warn'); return; }
  // 检查同一教令未激活
  for (var i = 0; i < (G._edicts || []).length; i++) {
    if (G._edicts[i].id === edictId) { log('该教令已在生效中。', 'warn'); return; }
  }
  // 检查冷却
  if (G._edictCD && G._edictCD[edictId] > 0) {
    log('该教令冷却中（' + G._edictCD[edictId] + '季）。', 'warn'); return;
  }
  // 检查槽位上限
  var maxSlots = 1;
  for (var bid in G.bld) {
    if (bid === 'edictHall' && G.bld[bid].c > 0) maxSlots += G.bld[bid].c;
  }
  // 升级 edictSlot
  for (var _es in G.upgd) {
    if (G.upgd[_es].done && UPGD[_es]?.e?._edictSlotBonus) maxSlots += UPGD[_es].e._edictSlotBonus;
  }
  if (maxSlots > 3) maxSlots = 3;
  if ((G._edicts || []).length >= maxSlots) {
    log('教令席位已满（上限' + maxSlots + '）。', 'warn'); return;
  }
  // 检查并扣除费用
  var costMul = 1;
  for (var _ed in G.upgd) {
    if (G.upgd[_ed].done && UPGD[_ed]?.e?._edictCostReduce) costMul -= UPGD[_ed].e._edictCostReduce;
  }
  costMul = Math.max(0.1, costMul);
  for (var rk in def.cost) {
    var cost = def.cost[rk];
    if (rk === 'piety') cost = Math.ceil(cost * costMul);
    if (!G.res[rk] || G.res[rk].v < cost) { log('资源不足：' + (RD[rk]?.n || rk) + '。', 'warn'); return; }
  }
  for (var rk2 in def.cost) {
    var cost2 = def.cost[rk2];
    if (rk2 === 'piety') cost2 = Math.ceil(cost2 * costMul);
    G.res[rk2].v -= cost2;
  }
  // 计算持续时间
  var dur = def.dur;
  // 教令堂 _edictDur 加成
  for (var bid2 in G.bld) {
    if (bid2 === 'edictHall' && BD[bid2]?.e?._edictDur) dur += BD[bid2].e._edictDur * G.bld[bid2].c;
  }
  // 升级 edictDuration
  for (var _edur in G.upgd) {
    if (G.upgd[_edur].done && UPGD[_edur]?.e?._edictDurBonus) dur += UPGD[_edur].e._edictDurBonus;
  }
  // 激活教令
  G._edicts.push({ id: edictId, remaining: dur, effects: def.e });
  // 设置冷却
  var cdBase = 2;
  cdBase -= (G._edictCDReduce || 0);
  // 升级 edictMastery
  for (var _em in G.upgd) {
    if (G.upgd[_em].done && UPGD[_em]?.e?._edictCDMastery) cdBase -= UPGD[_em].e._edictCDMastery;
  }
  G._edictCD[edictId] = Math.max(0, cdBase);
  log('教令【' + def.n + '】已颁布！持续' + dur + '季。', 'important');
  rAll();
}

// ===== v0.19 §七 4.3 飞升阶梯 =====
function openGate() {
  if (!G.subBranches?.D || G.mainLine !== 'mystic') { log('需要灵修与神启同时开启。', 'warn'); return; }
  var gateIndex = G._gates || 0;
  if (gateIndex >= GATE_DEF.length) { log('已无更多门可开。', 'warn'); return; }
  // 阶段门控：phase 4 仅前 2 门，phase 5 前 4 门，phase 6+ 全开（与 ui.js 一致）
  var phaseLimit = (G.phase >= 6) ? 5 : (G.phase >= 5) ? 4 : (G.phase >= 4) ? 2 : 0;
  if (gateIndex >= phaseLimit) { log('当前阶段尚未开放该门。', 'warn'); return; }
  var gate = GATE_DEF[gateIndex];
  // 检查化神池等级
  var poolCount = G.bld.apotheosisPool?.c || 0;
  if (poolCount < gateIndex + 1) {
    log('化神池需达到' + (gateIndex + 1) + '座。', 'warn'); return;
  }
  // 计算费用（含折扣）
  var discount = G._gateDiscount || 0;
  // 个人门折扣
  var gateDiscounts = {};
  for (var _gd in G.upgd) {
    if (G.upgd[_gd].done) {
      var e = UPGD[_gd].e;
      if (e && e['_gateDiscount' + (gateIndex + 1)]) gateDiscounts.gnosis = (gateDiscounts.gnosis || 0) + e['_gateDiscount' + (gateIndex + 1)];
      if (gateIndex === 4 && e && e._gate5AllReduce) discount += e._gate5AllReduce;
    }
  }
  // 扣费
  for (var rk in gate.cost) {
    var cost = gate.cost[rk];
    if (rk === 'gnosis') cost = Math.ceil(cost * (1 - (gateDiscounts.gnosis || 0)) * (1 - discount));
    else cost = Math.ceil(cost * (1 - discount));
    if (!G.res[rk] || G.res[rk].v < cost) {
      log('资源不足：' + (RD[rk]?.n || rk) + '（需' + cost + '）。', 'warn'); return;
    }
  }
  // 不可逆确认
  if (!confirm('开启【' + gate.n + '】不可逆转。确定？')) return;
  // 扣除资源
  for (var rk2 in gate.cost) {
    var cost2 = gate.cost[rk2];
    if (rk2 === 'gnosis') cost2 = Math.ceil(cost2 * (1 - (gateDiscounts.gnosis || 0)) * (1 - discount));
    else cost2 = Math.ceil(cost2 * (1 - discount));
    G.res[rk2].v -= cost2;
  }
  // 应用效果
  G._gates++;
  for (var ek in gate.e) {
    G._gateEffects[ek] = (G._gateEffects[ek] || 0) + (typeof gate.e[ek] === 'number' ? gate.e[ek] : 0);
    if (gate.e[ek] === true) G._gateEffects[ek] = true;
  }
  // 应用代价
  if (gate.penalty._maxPopReduce) {
    // 检查减免
    var popReduce = gate.penalty._maxPopReduce;
    if (gateIndex === 3) {
      for (var _gr in G.upgd) { if (G.upgd[_gr].done && UPGD[_gr]?.e?._gate4PopReduce) popReduce -= UPGD[_gr].e._gate4PopReduce; }
    }
    if (gateIndex === 4) {
      for (var _gr2 in G.upgd) { if (G.upgd[_gr2].done && UPGD[_gr2]?.e?._gate5PopReduce) popReduce -= UPGD[_gr2].e._gate5PopReduce; }
    }
    popReduce = Math.max(0, popReduce);
    G._gateEffects._maxPopReduce = (G._gateEffects._maxPopReduce || 0) + popReduce;
  }
  if (gate.penalty._hapCapM) G._gateEffects._hapCapM = (G._gateEffects._hapCapM || 0) + gate.penalty._hapCapM;
  if (gate.penalty._baseResM) G._gateEffects._baseResM = (G._gateEffects._baseResM || 0) + gate.penalty._baseResM;
  // 迷醉 buff
  var ecstasy = false;
  for (var _gec in G.upgd) { if (G.upgd[_gec].done && UPGD[_gec]?.e?._gateEcstasy) ecstasy = true; }
  if (ecstasy) G._gateEcstasyRemain = 3;
  // 化神药 buff 消耗
  G._gateDiscount = 0;
  log('【' + gate.n + '】已开启。' + gate.tip, 'important');
  rAll();
}

// ===== v0.19 §七 4.3 永久配方处理 =====
function craftPerm(craftId) {
  var cd = CD[craftId];
  if (!cd || !cd.perm) return false;
  // 扣除输入
  for (var i = 0; i < cd.inp.length; i++) {
    var p = cd.inp[i];
    if (!G.res[p.r] || G.res[p.r].v < p.a) { log('资源不足。', 'warn'); return false; }
  }
  for (var j = 0; j < cd.inp.length; j++) {
    var p2 = cd.inp[j];
    G.res[p2.r].v -= p2.a;
  }
  // 应用永久效果
  for (var k = 0; k < cd.out.length; k++) {
    var o = cd.out[k];
    if (o.r === '_pietyMxPerm') {
      G._pietyMxPerm = (G._pietyMxPerm || 0) + o.a;
      if (G.res.piety) G.res.piety.mx += o.a;
      log('虔诚上限永久提升 +' + o.a + '。', 'info');
    } else if (o.r === '_edictCDReduce') {
      G._edictCDReduce = (G._edictCDReduce || 0) + o.a;
      log('教令冷却永久缩短 -' + o.a + '季。', 'info');
    } else if (o.r === '_holyGearBonus') {
      var cap = 0.15;
      if (G._holyGearBonus + o.a > cap) { log('工业配方加成已达上限。', 'warn'); return false; }
      G._holyGearBonus = (G._holyGearBonus || 0) + o.a;
      log('工业配方产出永久 +' + Math.round(o.a * 100) + '%。', 'info');
    } else if (o.r === '_gateDiscount') {
      G._gateDiscount = Math.max(G._gateDiscount || 0, o.a);
      log('下次开门秘知消耗 -' + Math.round(G._gateDiscount * 100) + '%。', 'info');
    }
  }
  rAll();
  return true;
}

// ===== v0.19 §七 4.4 邦交系统：深化 =====
function canDeepenAlliance(tribe) {
  if (!G._alliance || !ALLIANCE_TRIBES[tribe]) return false;
  var curDepth = G._alliance[tribe] || 0;
  var nextDepth = curDepth + 1;
  var depthDef = ALLIANCE_DEPTH[nextDepth];
  if (!depthDef) return false;
  // Phase B 限深 1-2；Phase C（deepAlliancePrelude 已研）解锁 3+ 但受会盟台数量限制
  if (nextDepth >= 3) {
    if (!G.upg.deepAlliancePrelude?.done) return false;
    var deep3PlusCount = 0;
    for (var t in G._alliance) if (G._alliance[t] >= 3) deep3PlusCount++;
    var platformCount = G.bld.alliancePlatform?.c || 0;
    if (deep3PlusCount >= platformCount) return false;
  }
  // 好感检查
  var favor = G._allianceFavor[tribe] || 0;
  if (favor < depthDef.favor) return false;
  // 资源检查（含升级减免）
  var costReduce = 0;
  for (var _dr in G.upgd) {
    if (G.upgd[_dr].done && UPGD[_dr]?.e?.['_depthCostReduce' + nextDepth]) {
      costReduce += UPGD[_dr].e['_depthCostReduce' + nextDepth];
    }
  }
  for (var rk in depthDef.cost) {
    var need = depthDef.cost[rk];
    if (rk === 'credential' && nextDepth === 1) need = Math.ceil(need * (1 - costReduce));
    if (rk === 'charter' && nextDepth === 2) need = Math.ceil(need * (1 - costReduce));
    if (!G.res[rk] || G.res[rk].v < need) return false;
  }
  return true;
}

function deepenAlliance(tribe) {
  if (!canDeepenAlliance(tribe)) return;
  var curDepth = G._alliance[tribe] || 0;
  var nextDepth = curDepth + 1;
  var depthDef = ALLIANCE_DEPTH[nextDepth];
  // 升级减免
  var costReduce = 0;
  for (var _dr in G.upgd) {
    if (G.upgd[_dr].done && UPGD[_dr]?.e?.['_depthCostReduce' + nextDepth]) {
      costReduce += UPGD[_dr].e['_depthCostReduce' + nextDepth];
    }
  }
  // 扣资源
  for (var rk in depthDef.cost) {
    var need = depthDef.cost[rk];
    if (rk === 'credential' && nextDepth === 1) need = Math.ceil(need * (1 - costReduce));
    if (rk === 'charter' && nextDepth === 2) need = Math.ceil(need * (1 - costReduce));
    G.res[rk].v -= need;
  }
  G._alliance[tribe] = nextDepth;
  var tribeName = ALLIANCE_TRIBES[tribe].n;
  log('与 ' + tribeName + ' 的邦交深化至「' + depthDef.n + '」。', 'important');
  // 结邦喜悦 buff
  for (var _aj in G.upgd) {
    if (G.upgd[_aj].done && UPGD[_aj]?.e?._allianceJoy) {
      G._allianceJoyRemain = 3;
      log('结邦喜悦！全局产出 +10% 持续 3 季。', 'event');
      break;
    }
  }
  rAll();
}