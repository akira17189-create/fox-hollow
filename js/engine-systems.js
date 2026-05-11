/**
 * engine-systems.js - 子系统：远行 / 抉择事件 / 商队 / 图纸专精
 *
 * 依赖：engine.js（G、chk、expTimeMul、log、rAll、tickExpeditions 在本文件、closeModal）
 *      engine-actions.js（无直接依赖）
 *      ui.js（showChoiceModal）
 */

// ===== 远行系统 =====
function maxExpeditions() {
  return G.bld.trailroad?.c || 0;
}

function canSendExp(destId) {
  var d = EXD[destId];
  if (!d) return false;
  if (!chk(d.uq)) return false;
  if (G.expeditions.length >= maxExpeditions()) return false;
  if ((G.job.scout?.c || 0) <= 0) return false;
  for (var i = 0; i < d.cost.length; i++)
    if (G.res[d.cost[i].r].v < d.cost[i].a) return false;
  return true;
}

function sendExpedition(destId, foxCount) {
  var d = EXD[destId];
  // 取消 3 只上限：能送多少就送多少（受 scout 数量限制）
  foxCount = Math.min(foxCount || 1, G.job.scout?.c || 0);
  if (foxCount <= 0) return;
  if (!canSendExp(destId)) return;
  // 扣资源
  for (var i = 0; i < d.cost.length; i++)
    G.res[d.cost[i].r].v -= d.cost[i].a;
  // 计算实际路程 tick（先算 timeMul，让 scoutCount 包含本次派出的斥候——
  // 玩家直觉"派的多 = 时间快"，所以总斥候数（含派出）参与加成）
  var cb = G.choiceBuffs || {};
  var timeMul = expTimeMul();
  // 斥候出征（扣减 G.job.scout.c 必须在 expTimeMul 之后，否则 scoutCount 不含本批 foxCount）
  G.foxAway = (G.foxAway || 0) + foxCount;
  G.job.scout.c -= foxCount;
  // 多斥候速度加成：1 - (n-1)*0.10，下限 0.5（每多 1 只 -10%，6 只封顶 50%）
  var speedMul = Math.max(0.5, 1 - (foxCount - 1) * 0.10);
  timeMul *= speedMul;
  // 一次性目的地时间乘数
  if (cb.nextSendTimeMul && cb.nextSendTimeMul[destId]) {
    timeMul *= cb.nextSendTimeMul[destId];
    delete cb.nextSendTimeMul[destId];
  }
  // v0.14 习俗：春迁俗 - 春季出发的远行时间 -15%
  if (G.season === 0 && G.customs && G.customs.springMigrate) timeMul *= 0.85;
  var days = d.days * timeMul;
  var ticks = Math.ceil(days * TPD);
  G.expeditions.push({
    dest: destId,
    foxCount: foxCount,
    ticksLeft: ticks,
    totalTicks: ticks,
    usedSpiritPath: false,
    startSeason: G.season,  // v0.14 用于春迁俗"完成时计数"
  });
  log('派出 ' + foxCount + ' 只狐狸前往' + d.n + '。', 'important');
  rAll();
}

function tickExpeditions(silent) {
  if (!G.expeditions || !G.expeditions.length) return;
  for (var i = G.expeditions.length - 1; i >= 0; i--) {
    G.expeditions[i].ticksLeft--;
    if (G.expeditions[i].ticksLeft <= 0) {
      resolveExpedition(i, silent);
    }
  }
}

function resolveExpedition(idx, silent) {
  var exp = G.expeditions[idx];
  var d = EXD[exp.dest];
  // 斥候归队
  G.foxAway = Math.max(0, (G.foxAway || 0) - exp.foxCount);
  if (!G.job.scout) G.job.scout = { c: 0, on: 1 };
  G.job.scout.c += exp.foxCount;
  G.freeFox = G.foxes - (G.foxAway || 0) - Object.values(G.job).reduce(function(s, j) { return s + j.c; }, 0);
  // 计算奖励倍率：在岗斥候 +5%/人 + 授业次数 +10%/级
  var scoutBonus = 1 + (G.job.scout?.c || 0) * 0.05 + (G.train.scout || 0) * 0.10;
  // v0.16 武德同斥候加成
  if (G.polity === 'martial' && POLITY.martial.e.scoutM) {
    var polityBoost = 1 + Math.min(5, G.bld.polityHall?.c || 0) * 0.05;
    scoutBonus += POLITY.martial.e.scoutM * polityBoost;
  }
  var researchBonus = G.upg.longJourney?.done ? 1.5 : 1;
  // v0.16 政体远行奖励（正面受令台加成，惩罚不受）
  var polityExpBonus = 1;
  if (G.polity && POLITY[G.polity]) {
    var pe = POLITY[G.polity].e || {};
    var pen = POLITY[G.polity].pen || {};
    if (pe.expRewardM) {
      var polityBoost = 1 + Math.min(5, G.bld.polityHall?.c || 0) * 0.05;
      polityExpBonus += pe.expRewardM * polityBoost;
    }
    if (pen.expRewardM) {
      polityExpBonus += pen.expRewardM;
    }
  }
  // v0.16 Tier 1 路线 effect (外拓: 远行奖励 +12%)
  if (G.tier1 && typeof TIER !== 'undefined' && TIER[G.tier1]?.e?.expRewardM) {
    polityExpBonus += TIER[G.tier1].e.expRewardM;
  }
  var choiceRewardMul = 1;
  var cb = G.choiceBuffs || {};
  if (cb.nextRewardMul && cb.nextRewardMul[exp.dest]) {
    choiceRewardMul = cb.nextRewardMul[exp.dest];
    delete cb.nextRewardMul[exp.dest];
  }
  // 灵修升级：远行奖励加成（如念珠护 +10%）
  var mysticExpBonus = 0;
  for (var uid in G.upgd) {
    if (!G.upgd[uid].done) continue;
    var ue = UPGD[uid] && UPGD[uid].e;
    if (ue && ue._expRewardBonus) mysticExpBonus += ue._expRewardBonus;
  }
  // v0.19 §七 4.2 灵修 C 升级：_formBonus（形魄用于任务时效果+N%）
  var _formBonus = 0;
  for (var _fb in G.upgd) {
    if (G.upgd[_fb].done && UPGD[_fb]?.e?._formBonus) _formBonus += UPGD[_fb].e._formBonus;
  }
  if (_formBonus > 0 && G.res.formSoul?.v > 0) mysticExpBonus += _formBonus;
  var mul = scoutBonus * researchBonus * choiceRewardMul * polityExpBonus * (1 + mysticExpBonus);
  // v0.18 §六 3.4 占卜年签：隐逸签远行奖励 -15%
  var _divExp = getDivinationEffects();
  if (_divExp && _divExp.penalty.expReward) mul *= (1 + _divExp.penalty.expReward);
  // 抽取奖励（2-3项）
  // user-fb-2 修复：旧逻辑里抽到低概率项没中也 r++，可能导致 rewardCount 用光
  // 在没中的项上→玩家拿 0 奖励。修为：仅命中（push）才 r++，未中只 splice + retry。
  var rewardCount = 2 + (Math.random() < 0.5 ? 1 : 0);
  var pool = d.rewards.slice();
  var rewards = [];
  var picked = 0;
  while (picked < rewardCount && pool.length > 0) {
    var ri = Math.floor(Math.random() * pool.length);
    var rw = pool[ri];
    if (Math.random() > rw.prob) { pool.splice(ri, 1); continue; }
    var amt = Math.floor((rw.min + Math.random() * (rw.max - rw.min + 1)) * mul);
    if (amt <= 0) amt = 1;
    if (G.res[rw.r]) {
      G.res[rw.r].v += amt;
      if (!G.res[rw.r].on) G.res[rw.r].on = true;
      if (G.res[rw.r].mx > 0) G.res[rw.r].v = Math.min(G.res[rw.r].v, G.res[rw.r].mx);
      rewards.push(RD[rw.r].n + ' +' + amt);
    }
    pool.splice(ri, 1);
    picked++;
  }
  // 抉择 buff：额外资源奖励
  if (cb.nextReturn && cb.nextReturn[exp.dest]) {
    var bonusList = cb.nextReturn[exp.dest];
    for (var bi = 0; bi < bonusList.length; bi++) {
      var b = bonusList[bi];
      if (G.res[b.r]) {
        G.res[b.r].v += b.a;
        if (!G.res[b.r].on) G.res[b.r].on = true;
        if (G.res[b.r].mx > 0) G.res[b.r].v = Math.min(G.res[b.r].v, G.res[b.r].mx);
        if (b.a > 0) rewards.push(RD[b.r].n + ' +' + b.a);
        else rewards.push(RD[b.r].n + ' ' + b.a);
      }
    }
    delete cb.nextReturn[exp.dest];
  }
  // 叙事碎片
  if (d.narrative && NARR[exp.dest]) {
    if (!G.narratives) G.narratives = { oldRuin: [], cloudRidge: [] };
    var narrList = G.narratives[exp.dest] || [];
    var nextIdx = narrList.length;
    if (nextIdx < NARR[exp.dest].length) {
      narrList.push(nextIdx);
      G.narratives[exp.dest] = narrList;
      if (!silent) {
        log(NARR[exp.dest][nextIdx], 'echo');
      } else {
        if (!G.pendingNarr) G.pendingNarr = [];
        G.pendingNarr.push(NARR[exp.dest][nextIdx]);
      }
    }
  }
  // 记录完成次数
  G.expDone[exp.dest] = (G.expDone[exp.dest] || 0) + 1;
  // v0.14 春季远行完成计数（出发是春才计入，用于春迁俗解锁）
  if (exp.startSeason === 0) G.springExpDone = (G.springExpDone || 0) + 1;
  // 返回日志：仅显示带回的奖励。叙事氛围由 NARR 叙事碎片承担（v0.13.x 移除 d.logs 池）
  if (!silent) {
    log('远行队伍从' + d.n + '返回了。', 'event');
    if (rewards.length) log('带回了：' + rewards.join('，'), 'important');
    // 抉择事件触发：至少有 1 名在岗斥候 + 30% 概率 + 无待处理抉择
    if ((G.job.scout?.c || 0) >= 1 && !G.pendingChoice && Math.random() < 0.3) {
      tryTriggerChoice();
    }
  } else {
    if (!G.pendingNarr) G.pendingNarr = [];
    G.pendingNarr.push('离开期间，远行队伍从' + d.n + '返回了。（' + rewards.join('，') + '）');
  }
  // 移除
  G.expeditions.splice(idx, 1);
}

// ===== 抉择事件系统 =====
function tryTriggerChoice() {
  if (!G.choicesDone) G.choicesDone = [];
  var pool = [];
  for (var i = 0; i < CHOICE_EVENTS.length; i++) {
    if (G.choicesDone.indexOf(i) !== -1) continue;
    // 叙事前置检查：避免在玩家还没看到对应碎片前触发剧透抉择
    var req = CHOICE_EVENTS[i].requires;
    if (req) {
      var meets = true;
      for (var dest in req) {
        var have = (G.narratives && G.narratives[dest]) ? G.narratives[dest].length : 0;
        if (have < req[dest]) { meets = false; break; }
      }
      if (!meets) continue;
    }
    pool.push(i);
  }
  if (!pool.length) return;
  var picked = pool[Math.floor(Math.random() * pool.length)];
  G.pendingChoice = { idx: picked };
  rAll();
  showChoiceModal(picked);
}

function applyChoice(eventIdx, optIdx) {
  if (!G.choiceBuffs) G.choiceBuffs = {};
  var cb = G.choiceBuffs;
  if (!cb.nextReturn) cb.nextReturn = {};
  if (!cb.nextRewardMul) cb.nextRewardMul = {};
  if (!cb.nextSendTimeMul) cb.nextSendTimeMul = {};

  if (eventIdx === 0) {
    if (optIdx === 0) {
      // A: 消耗圆木×1，下次旧墟返回古币+2
      G.res.wood.v = Math.max(0, G.res.wood.v - 1);
      cb.nextReturn.oldRuin = (cb.nextReturn.oldRuin || []).concat([{ r: 'ancCoin', a: 2 }]);
      log('村名被刻在了墙的末位。刻刀很钝，但字迹很深。', 'event');
    } else {
      // B: 下次旧墟返回学识+5
      cb.nextReturn.oldRuin = (cb.nextReturn.oldRuin || []).concat([{ r: 'lore', a: 5 }]);
      log('斥候把墙上每一个名字都描了回来。那些名字，值得被认真读一遍。', 'event');
    }
  }
  else if (eventIdx === 1) {
    if (optIdx === 0) {
      // A: 下次密林与云岭返回奖励×1.3
      cb.nextRewardMul.forest = (cb.nextRewardMul.forest || 1) * 1.3;
      cb.nextRewardMul.cloudRidge = (cb.nextRewardMul.cloudRidge || 1) * 1.3;
      log('往南走的念头在每只狐狸心里生了根。但不是现在。', 'event');
    } else {
      // B: 野莓+30、圆木+10，下次旧墟返回古币-2
      G.res.berry.v += 30;
      G.res.wood.v += 10;
      cb.nextReturn.oldRuin = (cb.nextReturn.oldRuin || []).concat([{ r: 'ancCoin', a: -2 }]);
      log('井水是甜的。脚下的土地是好的。留在这里，没什么不对。', 'event');
    }
  }
  else if (eventIdx === 2) {
    if (optIdx === 0) {
      // A: 消耗碎石×5，永久所有远行时间×0.95
      G.res.stone.v = Math.max(0, G.res.stone.v - 5);
      cb.permTimeMul = (cb.permTimeMul || 1) * 0.95;
      log('新砌的石标比旧的更稳。路，从此更好走了一点。', 'event');
    } else {
      // B: 下次云岭返回符咒+1，下次云岭远行时间×1.2
      cb.nextReturn.cloudRidge = (cb.nextReturn.cloudRidge || []).concat([{ r: 'charm', a: 1 }]);
      cb.nextSendTimeMul.cloudRidge = (cb.nextSendTimeMul.cloudRidge || 1) * 1.2;
      log('石标被小心扶正了。祖先的卡槽还在，一个也没动。', 'event');
    }
  }
  else if (eventIdx === 3) {
    if (optIdx === 0) {
      // A: 消耗圆木×3碎石×2，本季满意度+10%
      G.res.wood.v = Math.max(0, G.res.wood.v - 3);
      G.res.stone.v = Math.max(0, G.res.stone.v - 2);
      cb.happySeason = G.season;
      log('村口的掌印墙立起来了。第一个按上去的幼崽，爪子还沾着泥。', 'event');
    } else {
      // B: 学识+15，下次旧墟返回卷轴+1
      G.res.lore.v += 15;
      cb.nextReturn.oldRuin = (cb.nextReturn.oldRuin || []).concat([{ r: 'scroll', a: 1 }]);
      log('掌印墙没有做。但那天晚上的讨论，比任何一堂课都有收获。', 'event');
    }
  }
  else if (eventIdx === 4) {
    if (optIdx === 0) {
      // A: 下次旧墟远行时间×1.5，返回古币+8卷轴+1
      cb.nextSendTimeMul.oldRuin = (cb.nextSendTimeMul.oldRuin || 1) * 1.5;
      cb.nextReturn.oldRuin = (cb.nextReturn.oldRuin || []).concat([
        { r: 'ancCoin', a: 8 }, { r: 'scroll', a: 1 }
      ]);
      log('老狐狸跟着队伍出发了。走得很慢，但每一步都在认路。', 'event');
    } else {
      // B: 人口+1，下次旧墟遗民商队价格减半
      G.foxes += 1;
      G.freeFox = G.foxes - (G.foxAway || 0) - Object.values(G.job).reduce(function(s, j) { return s + j.c; }, 0);
      cb.ruinfolkDiscount = true;
      log('老狐狸留下来了。他每天傍晚都朝南坐很久，但再没提过回去的事。', 'event');
    }
  }

  // 标记已完成
  if (!G.choicesDone) G.choicesDone = [];
  G.choicesDone.push(eventIdx);
  G.pendingChoice = null;
  closeModal();
  rAll();
}

// ===== 商队系统 =====
// v0.15.1：商队到访概率 = 0.5 基础 + 共聚堂 +2%/座（上限 +10%）
// v0.16：+ 政体/政策加成，总概率硬上限 65%
function caravanArrivalProb() {
  var bonus = Math.min(0.10, (G.bld.assembly?.c || 0) * 0.02);
  // 铁路：商队到达率 +caravanM%/座
  if (G.bld.railroad?.c && BD.railroad?.e?.caravanM) {
    bonus += BD.railroad.e.caravanM * G.bld.railroad.c;
  }
  // 政体
  if (G.polity && POLITY[G.polity]) {
    var pe = POLITY[G.polity].e;
    if (pe.caravanProb) {
      var polityBoost = 1 + Math.min(5, G.bld.polityHall?.c || 0) * 0.05;
      bonus += (pe.caravanProb > 0 ? pe.caravanProb * polityBoost : pe.caravanProb);
    }
  }
  // 政策
  if (G.policies) {
    for (var dom in G.policies) {
      var optId = G.policies[dom];
      if (!optId || !POLICY[dom] || !POLICY[dom].opts[optId]) continue;
      var pe = POLICY[dom].opts[optId].e;
      if (pe && pe.caravanProb) bonus += pe.caravanProb;
    }
  }
  // v0.16 Tier 1 路线 effect (外拓: 商队来访 +5%)
  if (G.tier1 && typeof TIER !== 'undefined' && TIER[G.tier1]?.e?.caravanProb) {
    bonus += TIER[G.tier1].e.caravanProb;
  }
  // 污染惩罚：商队到达率
  var pTier = pollutionTier();
  if (pTier.caravanM) bonus += pTier.caravanM;
  // v0.18 §六 3.4 占卜年签：商旅签商队概率加成
  var _divEff = getDivinationEffects();
  if (_divEff && _divEff.bonus.caravanProb) bonus += _divEff.bonus.caravanProb;
  // C阶段进阶升级：商队加成扁平值（_caravanBonusFlat，如合金铁路 +8%）
  for (var _cb in G.upgd) {
    if (G.upgd[_cb].done && UPGD[_cb]?.e?._caravanBonusFlat) bonus += UPGD[_cb].e._caravanBonusFlat;
  }
  // 铁路提速：_railTradeBonus × 铁路数量（calcR 中已预收集到 G._railTradeBonusTotal）
  if (G._railTradeBonusTotal) bonus += G._railTradeBonusTotal;
  // v0.19 §七 4.4 通达升级：商队频至
  for (var _cf in G.upgd) {
    if (G.upgd[_cf].done && UPGD[_cf]?.e?._caravanFreq) bonus += UPGD[_cf].e._caravanFreq;
  }
  // v0.19 §七 4.5 六神被动+仪式：商队概率加成
  if (G.deity && DEITY_DATA[G.deity]?.passive?._caravanProb) bonus += DEITY_DATA[G.deity].passive._caravanProb;
  if (G._deityCaravanBuff) bonus += G._deityCaravanBuff;
  return Math.min(0.65, 0.5 + bonus);
}

function trySpawnCaravan(silent) {
  // 筛选可出现的商队
  var pool = [];
  for (var id in CVD) {
    if (chk(CVD[id].uq)) pool.push(id);
  }
  if (!pool.length) return;
  var picked = pool[Math.floor(Math.random() * pool.length)];
  G.caravan = { id: picked, bought: {}, blueprint: null, gift: null };
  G.caravanTimer = 0;
  G.caravanEverVisited = true;  // §14.5 修复 5：玩家见过商队后才显示商队 UI 区域
  // 图纸携带概率：基础 50% + 商贩野路子（+10%）+ 藏书阁（+2%/座 上限 +10%）+ 墨契（+15% 一次性）
  var bpChance = 0.5;
  if (G.jobTalent.merchant === 'B') bpChance += SPEC_JD.merchant.B.bpChanceBonus;
  bpChance += Math.min(0.10, (G.bld.library?.c || 0) * 0.02);
  if (G.inkPactBp) bpChance += 0.15;
  // v0.16 政体/政策 bpChance 加成
  if (G.polity && POLITY[G.polity] && POLITY[G.polity].e.bpChance) {
    var polityBoost = 1 + Math.min(5, G.bld.polityHall?.c || 0) * 0.05;
    var val = POLITY[G.polity].e.bpChance;
    bpChance += (val > 0 ? val * polityBoost : val);
  }
  if (G.policies) {
    for (var dom in G.policies) {
      var optId = G.policies[dom];
      if (!optId || !POLICY[dom] || !POLICY[dom].opts[optId]) continue;
      var pe = POLICY[dom].opts[optId].e;
      if (pe && pe.bpChance) bpChance += pe.bpChance;
    }
  }
  bpChance = Math.min(0.95, bpChance);
  if (Math.random() < bpChance) rollBlueprint(picked);
  G.inkPactBp = false;  // 墨契图纸加成一次性消耗（无论是否实际抽到）
  // v0.15.1：商队到访 40% 概率附赠 1 香草（需 spice.mx > 0）
  if (G.res.spice && G.res.spice.mx > 0 && G.res.spice.v < G.res.spice.mx && Math.random() < 0.4) {
    G.caravan.gift = { r: 'spice', a: 1 };
    G.res.spice.v = Math.min(G.res.spice.v + 1, G.res.spice.mx);
    if (!G.res.spice.on) G.res.spice.on = true;
  }
  // v0.19 §七 4.2 灵修 C 升级：_caravanCrystal（商队带回晶丝碎片）
  var _hasCrystalUpg = false;
  for (var _cu in G.upgd) {
    if (G.upgd[_cu].done && UPGD[_cu]?.e?._caravanCrystal) { _hasCrystalUpg = true; break; }
  }
  if (_hasCrystalUpg && G.res.crystalSilk?.on && Math.random() < 0.35) {
    var csAmt = 1 + Math.floor(Math.random() * 2); // 1-2
    G.res.crystalSilk.v = Math.min(G.res.crystalSilk.v + csAmt, G.res.crystalSilk.mx > 0 ? G.res.crystalSilk.mx : Infinity);
    if (!silent) log('商队还捎来了' + csAmt + '份晶丝碎片。', 'echo');
  }
  if (!silent) {
    log(CVD[picked].arriveLog, 'event');
    if (G.caravan.blueprint) log('商队带来了一张图纸。', 'important');
    if (G.caravan.gift) log('随商队捎来一小撮路上采的香草。（香草 +1）', 'echo');
  }
}

function caravanCostMul() {
  var mul = 1;
  if (G.choiceBuffs && G.choiceBuffs.ruinfolkDiscount && G.caravan && G.caravan.id === 'ruinfolk') mul *= 0.5;
  // v0.16 政策 tradePriceM（管控通商 -10%）
  if (G.policies) {
    for (var dom in G.policies) {
      var optId = G.policies[dom];
      if (!optId || !POLICY[dom] || !POLICY[dom].opts[optId]) continue;
      var pe = POLICY[dom].opts[optId].e;
      if (pe && pe.tradePriceM) mul *= (1 + pe.tradePriceM);
    }
  }
  return mul;
}

function canBuyFromCaravan(itemIdx) {
  if (!G.caravan) return false;
  var cv = CVD[G.caravan.id];
  if (!cv) return false;
  // 每槽最多买 10 次
  var boughtCount = (typeof G.caravan.bought[itemIdx] === 'number') ? G.caravan.bought[itemIdx] : (G.caravan.bought[itemIdx] ? 10 : 0);
  if (boughtCount >= 10) return false;
  var item = cv.sell[itemIdx];
  if (!item) return false;
  var mul = caravanCostMul();
  for (var i = 0; i < item.cost.length; i++)
    if (G.res[item.cost[i].r].v < Math.ceil(item.cost[i].a * mul)) return false;
  return true;
}

function buyFromCaravan(itemIdx) {
  if (!canBuyFromCaravan(itemIdx)) return;
  var cv = CVD[G.caravan.id];
  var item = cv.sell[itemIdx];
  var mul = caravanCostMul();
  for (var i = 0; i < item.cost.length; i++)
    G.res[item.cost[i].r].v -= Math.ceil(item.cost[i].a * mul);
  for (var i = 0; i < item.give.length; i++) {
    var g = item.give[i];
    G.res[g.r].v += g.a;
    if (!G.res[g.r].on) G.res[g.r].on = true;
    if (G.res[g.r].mx > 0) G.res[g.r].v = Math.min(G.res[g.r].v, G.res[g.r].mx);
  }
  G.caravan.bought[itemIdx] = ((typeof G.caravan.bought[itemIdx] === 'number') ? G.caravan.bought[itemIdx] : 0) + 1;
  // v0.19 §七 4.4 邦交好感：商队交互+好感
  if (G._allianceFavor && G.upg.allianceInit?.done) {
    var cvTribeMap = { wildcat: 'lynx', otter: 'otter', crane: 'crane', ruinfolk: 'ruinfolk' };
    var tribe = cvTribeMap[G.caravan.id];
    if (tribe && G._allianceFavor[tribe] !== undefined) {
      var favorGain = 1;
      for (var _fb in G.upgd) { if (G.upgd[_fb].done && UPGD[_fb]?.e?._favorBoost) favorGain *= (1 + UPGD[_fb].e._favorBoost); }
      G._allianceFavor[tribe] += favorGain;
    }
  }
  // 消耗折扣 buff
  if (G.choiceBuffs && G.choiceBuffs.ruinfolkDiscount && G.caravan.id === 'ruinfolk') {
    G.choiceBuffs.ruinfolkDiscount = false;
  }
  log('购买了 ' + item.n + '。');
  G._achFirstTrade = true;
  rAll();
}

function canSellToCaravan() {
  if (!G.caravan) return false;
  var cv = CVD[G.caravan.id];
  if (!cv || !cv.buy) return false;
  if (G.caravan.bought['sell']) return false;
  for (var i = 0; i < cv.buy.take.length; i++)
    if (G.res[cv.buy.take[i].r].v < cv.buy.take[i].a) return false;
  return true;
}

function sellToCaravan() {
  if (!canSellToCaravan()) return;
  var cv = CVD[G.caravan.id];
  for (var i = 0; i < cv.buy.take.length; i++)
    G.res[cv.buy.take[i].r].v -= cv.buy.take[i].a;
  for (var i = 0; i < cv.buy.give.length; i++) {
    var g = cv.buy.give[i];
    G.res[g.r].v += g.a;
    if (G.res[g.r].mx > 0) G.res[g.r].v = Math.min(G.res[g.r].v, G.res[g.r].mx);
  }
  G.caravan.bought['sell'] = true;
  // v0.19 §七 4.4 邦交好感：出售交互+好感
  if (G._allianceFavor && G.upg.allianceInit?.done) {
    var cvTribeMap = { wildcat: 'lynx', otter: 'otter', crane: 'crane', ruinfolk: 'ruinfolk' };
    var tribe = cvTribeMap[G.caravan.id];
    if (tribe && G._allianceFavor[tribe] !== undefined) {
      var favorGain = 1;
      for (var _fb in G.upgd) { if (G.upgd[_fb].done && UPGD[_fb]?.e?._favorBoost) favorGain *= (1 + UPGD[_fb].e._favorBoost); }
      G._allianceFavor[tribe] += favorGain;
    }
  }
  log('出售了物资给' + cv.n + '。');
  G._achFirstTrade = true;
  rAll();
}

// ===== 图纸与专精系统 =====
function rollBlueprint(caravanId) {
  var cv = CVD[caravanId];
  if (!cv || !cv.blueprintPool) return;
  // 用 bpCostA 检查资源上限（A/S 两档使用相同的资源类型，只差铜钱数额）
  var costRefA = cv.bpCostA || cv.bpCost;
  if (!costRefA) return;
  for (var ci = 0; ci < costRefA.length; ci++) {
    var costRes = costRefA[ci].r;
    if (G.res[costRes] && G.res[costRes].mx === 0 && !G.res[costRes].on) return;
  }
  var pool = [];
  for (var i = 0; i < cv.blueprintPool.length; i++) {
    var bp = cv.blueprintPool[i];
    var target = bp.target, type = bp.type;
    // 每个 target 有 A/B 两张图纸
    var specs = type === 'bld' ? SPEC_BD[target] : SPEC_JD[target];
    if (!specs) continue;
    for (var dir of ['A', 'B']) {
      // 已激活该目标任意方向 → 排除
      if (type === 'bld' && G.bldSpec[target]) continue;
      if (type === 'job' && G.jobTalent[target]) continue;
      // 已持有同目标同方向 → 排除
      var held = false, heldOther = false;
      for (var j = 0; j < G.blueprints.length; j++) {
        if (G.blueprints[j].target === target && G.blueprints[j].spec === dir) held = true;
        if (G.blueprints[j].target === target && G.blueprints[j].spec !== dir) heldOther = true;
      }
      if (held) continue;
      // 同目标另一方向已持有 → 互斥排除
      if (heldOther) continue;
      pool.push({ id: target + '_' + dir, target: target, spec: dir, type: type });
    }
  }
  if (!pool.length) return;
  var picked = pool[Math.floor(Math.random() * pool.length)];
  // 按强度档查价：S 档（强力图纸）走 bpCostS，其他走 bpCostA
  var isStrong = (typeof STRONG_SPECS !== 'undefined') && STRONG_SPECS.indexOf(picked.id) !== -1;
  var bpCost = isStrong ? cv.bpCostS : cv.bpCostA;
  if (!bpCost) bpCost = cv.bpCost; // 老数据兜底
  G.caravan.blueprint = {
    id: picked.id, target: picked.target, spec: picked.spec, type: picked.type,
    cost: bpCost,
    tier: isStrong ? 'S' : 'A',
  };
}

function canBuyBlueprint() {
  if (!G.caravan || !G.caravan.blueprint) return false;
  if (G.caravan.bought['blueprint']) return false;
  var bp = G.caravan.blueprint;
  var mul = caravanCostMul();
  for (var i = 0; i < bp.cost.length; i++)
    if (G.res[bp.cost[i].r].v < Math.ceil(bp.cost[i].a * mul)) return false;
  return true;
}

function buyBlueprint() {
  if (!canBuyBlueprint()) return;
  var bp = G.caravan.blueprint;
  var mul = caravanCostMul();
  for (var i = 0; i < bp.cost.length; i++)
    G.res[bp.cost[i].r].v -= Math.ceil(bp.cost[i].a * mul);
  G.blueprints.push({ id: bp.id, target: bp.target, spec: bp.spec, type: bp.type });
  G.caravan.bought['blueprint'] = true;
  // 消耗折扣 buff
  if (G.choiceBuffs && G.choiceBuffs.ruinfolkDiscount && G.caravan.id === 'ruinfolk') {
    G.choiceBuffs.ruinfolkDiscount = false;
  }
  var specData = bp.type === 'bld' ? SPEC_BD[bp.target][bp.spec] : SPEC_JD[bp.target][bp.spec];
  log('购入图纸：' + specData.n + '。', 'important');
  // 考拉·小曼 彩蛋：20% 概率出现"来晚了"小段子
  if (typeof KOALA_LATE_LOGS !== 'undefined' && Math.random() < 0.2) {
    var line = KOALA_LATE_LOGS[Math.floor(Math.random() * KOALA_LATE_LOGS.length)];
    log(line, 'echo');
  }
  rAll();
}

function activateSpec(bpIdx) {
  if (bpIdx < 0 || bpIdx >= G.blueprints.length) return;
  var bp = G.blueprints[bpIdx];
  if (bp.type !== 'bld') return;
  if (G.bldSpec[bp.target]) return; // 已激活
  if ((G.bld[bp.target]?.c || 0) < 5) return; // 需要≥5座
  G.bldSpec[bp.target] = bp.spec;
  G.blueprints.splice(bpIdx, 1);
  // 自动丢弃同目标另一方向的图纸
  for (var i = G.blueprints.length - 1; i >= 0; i--) {
    if (G.blueprints[i].target === bp.target) G.blueprints.splice(i, 1);
  }
  var specData = SPEC_BD[bp.target][bp.spec];
  var bldName = BD[bp.target]?.n || bp.target;
  log('激活专精：' + bldName + '「' + specData.n + '」。', 'important');
  rAll();
}

function activateJobTalent(bpIdx) {
  if (bpIdx < 0 || bpIdx >= G.blueprints.length) return;
  var bp = G.blueprints[bpIdx];
  if (bp.type !== 'job') return;
  if (G.jobTalent[bp.target]) return; // 已激活
  G.jobTalent[bp.target] = bp.spec;
  G.blueprints.splice(bpIdx, 1);
  // 自动丢弃同目标另一方向的图纸
  for (var i = G.blueprints.length - 1; i >= 0; i--) {
    if (G.blueprints[i].target === bp.target) G.blueprints.splice(i, 1);
  }
  var talentData = SPEC_JD[bp.target][bp.spec];
  var jobName = JD[bp.target]?.n || bp.target;
  log('激活天赋：' + jobName + '「' + talentData.n + '」。', 'important');
  rAll();
}
