/**
 * engine.js - 狐狸谷物语 游戏引擎
 * 状态管理、计算、tick循环、存档
 */

// ===== 游戏状态 =====
const G = {
  tick: 0, year: 1, season: 0, day: 0,
  res: {}, bld: {}, job: {}, upg: {}, upgd: {},
  achievements: {},
  foxes: 0, maxFox: 0, freeFox: 0, happy: 1,
  rainSeason: -1,
  spiritSeason: -1,
  harvestSeason: -1,
  // 能量系统（即产即消平衡值）
  energyProd: 0,    // 总能量产出
  energyCons: 0,    // 总能量消耗
  energyNet: 0,     // 净能量 = prod - cons
  energyRatio: 1,   // 供给比 = min(1, prod/cons)，缺能时 <1
  // 污染系统（隐性累积值）
  pollution: 0,       // 当前污染值（累积）
  pollutionRate: 0,   // 净污染速率（tick单位）
  fogDisabled: [],     // 灰雾禁用建筑 [{ id, endTick }]
  // 灵脉系统（即产即消平衡值，类比能量）
  leylineProd: 0,     // 总灵脉产出
  leylineCons: 0,     // 总灵脉消耗
  leylineNet: 0,      // 净灵脉 = prod - cons
  leylineRatio: 1,    // 供给比 = min(1, prod/cons)，缺灵时 <1
  leylineDebuff: 0,   // 灵脉紊乱结束 tick（心魔事件）
  // 躁念系统（隐性累积值，类比污染）
  unrest: 0,          // 当前躁念值（累积）
  unrestRate: 0,      // 净躁念速率（tick单位）
  demonDisabled: [],   // 心魔禁用建筑 [{ id, endTick }]
  train: {},
  autoCraft: {},
  // v0.11.0 远行与贸易
  foxAway: 0,
  expDone: {},
  expeditions: [],
  pendingNarr: [],
  narratives: { oldRuin: [], cloudRidge: [] },
  feastSeason: -1,
  tradeWindYear: -1,
  caravan: null,
  caravanTimer: 0,
  // 抉择事件
  pendingChoice: null,  // { idx: number } 当前待选择的事件
  choicesDone: [],       // 已触发过的事件索引
  choiceBuffs: {},       // 一次性/永久 buff 追踪
  // v0.12.0 图纸与专精
  blueprints: [],        // 已持有图纸 [{ id, target, spec, type }]
  bldSpec: {},           // 已激活建筑专精 { berryPatch: 'A', ... }
  jobTalent: {},         // 已激活职业天赋 { gatherer: 'B', ... }
  // v0.14 风俗与习俗
  customs: {},           // { id: tick } 已激活习俗（值为激活时 tick）
  bonfireSeason: -1,     // 篝火夜歌触发的本季满意度 buff
  silentSeason: -1,      // 静默纪日触发的本季满意度 -3%
  springExpDone: 0,      // 春季完成的远行次数（用于春迁俗解锁）
  // v0.15 节令系统
  seasonRites: { dye: false, wine: false, ink: false, all: false },
  lastSeasonRites: {},
  pendingSeasonRites: { open: false },
  // 灵修灵术冷却（真实计时器，tick 计数）
  spellCooldowns: {},     // { spiritSight: endTick, tidePull: endTick, ... }
  tidePullSeason: -1,     // 引潮生效季节
  fateWeaveSeason: -1,    // 织命生效季节
  // 灵修 B 阶段灵术
  resonWaveSeason: -1,    // 共振波生效季节
  shapeFoxSeason: -1,     // 化形·灵狐生效季节
  shapeFoxExtra: 0,       // 化形延时额外季数
  sageUtterActive: false, // 悟语：下一次研究 -40%
  // calmFlow 无季节标记（立即生效一次性）
  // v0.16 政体与政策
  polity: null,
  polityChanges: 0,
  polityPenaltySeason: -1,
  polityPenaltyYear: -1,
  policies: {},
  policyCooldowns: {},
  tier1: null,
  subBranches: {},
  phase: 0,
};

let lastRealTime = Date.now();

// 初始化状态
function initState() {
  for (const [k, d] of Object.entries(RD))
    G.res[k] = { v: 0, mx: d.mx, r: 0, on: !d.lock };
  for (const k of Object.keys(BD))
    G.bld[k] = { c: 0, on: !BD[k].uq };
  for (const k of Object.keys(JD))
    G.job[k] = { c: 0, on: !!JD[k].on };
  for (const k of Object.keys(UD))
    G.upg[k] = { done: 0, on: 0 };
  for (const k of Object.keys(UPGD))
    G.upgd[k] = { done: 0, on: 0 };
}

// ===== 工具函数 =====
function fmt(n) {
  if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  if (Math.abs(n) > 0.001 && Math.abs(n) < 0.005) return n.toFixed(3);
  return n.toFixed(2);
}

function bp(id, i) {
  const p = BD[id].p[i];
  var cost = Math.ceil(p.b * Math.pow(p.k, G.bld[id].c));
  if (G.harvestSeason === G.season) cost = Math.ceil(cost * 0.7);
  cost = Math.ceil(cost * specCostMul(id, p.r));
  // v0.16 政体/政策建筑造价乘数
  var buildMul = 0;
  if (G.polity && POLITY[G.polity]) {
    var pe = POLITY[G.polity].e || {};
    var pen = POLITY[G.polity].pen || {};
    var polityBoost = 1 + Math.min(5, G.bld.polityHall?.c || 0) * 0.05;
    // 正面 buildCostM（在 e 中，如 < 0 = 造价降低）受政堂加成
    if (pe.buildCostM) buildMul += pe.buildCostM * polityBoost;
    // 惩罚 buildCostM（在 pen 中，如 > 0 = 造价升高）不受政堂加成
    if (pen.buildCostM) buildMul += pen.buildCostM;
  }
  if (G.policies) {
    for (var dom in G.policies) {
      var optId = G.policies[dom];
      if (!optId || !POLICY[dom] || !POLICY[dom].opts[optId]) continue;
      var pe = POLICY[dom].opts[optId].e;
      if (pe && pe.buildCostM) buildMul += pe.buildCostM;
      var ppen = POLICY[dom].opts[optId].pen;
      if (ppen && ppen.buildCostM) buildMul += ppen.buildCostM;
    }
  }
  // v0.16 Tier 1 路线 effect (内守: 建筑造价 -2%)
  if (G.tier1 && typeof TIER !== 'undefined' && TIER[G.tier1]?.e?.buildCostM) {
    buildMul += TIER[G.tier1].e.buildCostM;
  }
  if (buildMul !== 0) cost = Math.ceil(cost * (1 + buildMul));
  // v0.18 §六 3.4 占卜年签：学海签建筑造价 +8%
  var _divBld = getDivinationEffects();
  if (_divBld && _divBld.penalty.bldCostM) cost = Math.ceil(cost * (1 + _divBld.penalty.bldCostM));
  // 进阶升级：建筑特定造价减免 bldCostM（如矿镇规划 矿坑/高炉-10%）
  var upgdBldCostM = 0;
  for (var uid in G.upgd) {
    if (!G.upgd[uid].done) continue;
    var ue = UPGD[uid] && UPGD[uid].e;
    if (ue && ue.bldCostM && ue.bldCostM[id])
      upgdBldCostM += ue.bldCostM[id];
  }
  if (upgdBldCostM !== 0) cost = Math.ceil(cost * Math.max(0, 1 + upgdBldCostM));
  // C阶段进阶升级：全局建筑造价减免（_bldCostM，如混凝地基 -10%）
  var _globalBldCostM = 0;
  for (var _gb in G.upgd) {
    if (G.upgd[_gb].done && UPGD[_gb]?.e?._bldCostM) _globalBldCostM += UPGD[_gb].e._bldCostM;
  }
  if (_globalBldCostM !== 0) cost = Math.ceil(cost * Math.max(0, 1 + _globalBldCostM));
  // _holyBldDiscount（圣典蓝图：教团升级仅对工业建筑造价 -8%）
  if (BD[id].br === 'I' && G._holyBldDiscount) cost = Math.ceil(cost * Math.max(0, 1 - G._holyBldDiscount));
  // v0.19 §七 4.5 六神被动：建筑造价减免
  if (G.deity && DEITY_DATA[G.deity]?.passive?._bldCostM)
    cost = Math.ceil(cost * Math.max(0, 1 + DEITY_DATA[G.deity].passive._bldCostM));
  // 六神小仪式：本季额外造价减免
  if (G._deityBldCostBuff) cost = Math.ceil(cost * Math.max(0, 1 + G._deityBldCostBuff));
  return cost;
}

// 专精/天赋造价乘数（乘法叠加）
function specCostMul(bldId, resKey) {
  var mul = 1;
  // 莓果园沃土/野蔓 造价修正（对自身造价）
  var spec = G.bldSpec[bldId];
  if (spec && SPEC_BD[bldId] && SPEC_BD[bldId][spec] && SPEC_BD[bldId][spec].costMul)
    mul *= SPEC_BD[bldId][spec].costMul;
  // 锻造炉巧工：所有建筑矿铁造价 -15%
  if (resKey === 'iron' && G.bldSpec.smithy === 'B')
    mul *= SPEC_BD.smithy.B.costReduce.mul;
  // 铁匠省料：锻造炉造价 -15%
  if (bldId === 'smithy' && G.jobTalent.smith === 'B')
    mul *= SPEC_JD.smith.B.bldCostReduce.mul;
  return mul;
}

function canB(id) {
  for (let i = 0; i < BD[id].p.length; i++)
    if (G.res[BD[id].p[i].r].v < bp(id, i)) return false;
  return true;
}

function researchCostMul() {
  var mul = 1;
  if (G.jobTalent.scholar === 'B') mul *= SPEC_JD.scholar.B.resCostMul;
  // v0.15 墨契：本季内下次研究费用 ×0.6
  if (G.inkPact === G.season) mul *= 0.6;
  // 灵修 B 灵术悟语：下次研究费用 -40%（可被升级提升至 -55%）
  if (G.sageUtterActive) {
    var sageDiscount = 0.4;
    for (var _sb in G.upgd) {
      if (G.upgd[_sb].done && UPGD[_sb]?.e?._spellBoost?.sageUtter)
        sageDiscount += UPGD[_sb].e._spellBoost.sageUtter;
    }
    mul *= (1 - Math.min(0.7, sageDiscount));
  }
  // C阶段进阶升级：研究费用减免（_researchCostM，如纲要索引 -15%）
  for (var _rc in G.upgd) {
    if (G.upgd[_rc].done && UPGD[_rc]?.e?._researchCostM)
      mul *= (1 + UPGD[_rc].e._researchCostM);
  }
  // v0.19 §七 4.2 灵修 C 升级：_researchDiscount（研究费用全局永久减免）
  for (var _rd in G.upgd) {
    if (G.upgd[_rd].done && UPGD[_rd]?.e?._researchDiscount)
      mul *= (1 - UPGD[_rd].e._researchDiscount);
  }
  return mul;
}

function canU(id) {
  var mul = researchCostMul();
  for (const p of UD[id].p)
    if (G.res[p.r].v < Math.ceil(p.a * mul)) return false;
  return true;
}

function canC(id) {
  // v0.19 §七 4.2: _craftReduce 减免后的配方消耗检查
  var _crReduce = 0;
  for (var _cr in G.upgd) {
    if (G.upgd[_cr].done && UPGD[_cr]?.e?._craftReduce?.[id]) _crReduce += UPGD[_cr].e._craftReduce[id];
  }
  var ucm = collectCraftM()[id];
  for (const p of CD[id].inp) {
    var inpMul = 1;
    if (ucm && ucm.inpM && ucm.inpM[p.r]) inpMul = Math.max(0, 1 + ucm.inpM[p.r]);
    if (_crReduce > 0) inpMul *= Math.max(0, 1 - _crReduce);
    if (G.res[p.r].v < Math.ceil(p.a * inpMul)) return false;
  }
  return true;
}

function chk(q) {
  if (!q) return true;
  if (q.b) for (const [k, n] of Object.entries(q.b))
    if ((G.bld[k]?.c || 0) < n) return false;
  if (q.u) for (const k of Object.keys(q.u))
    if (!G.upg[k]?.done) return false;
  if (q.exp) for (const [k, n] of Object.entries(q.exp))
    if ((G.expDone[k] || 0) < n) return false;
  // v0.14 已激活习俗数门槛
  if (q.custom !== undefined && activeCustomCount() < q.custom) return false;
  // v0.16 政体已选
  if (q.polity && !G.polity) return false;
  // v0.16 副线已激活
  if (q.sb && (!G.subBranches || !G.subBranches[q.sb])) return false;
  // v0.18 进阶升级前置（ud 字段检查 G.upgd）
  if (q.ud) for (const k of Object.keys(q.ud))
    if (!G.upgd[k]?.done) return false;
  // v0.16 阶段门控（防止后续阶段内容在 Phase 1-2 泄漏）
  if (q.phase !== undefined && (G.phase || 0) < q.phase) return false;
  // v0.19 §七 4.3 主线门控（教团需 industry，秘仪需 mystic）
  if (q.mainLine && G.mainLine !== q.mainLine) return false;
  // v0.19 §七 4.3 飞升门前置（已开门数）
  if (q._gates !== undefined && (G._gates || 0) < q._gates) return false;
  // v0.19 §七 4.3 职业数量前置（job 字段）
  if (q.job) for (const [k, n] of Object.entries(q.job))
    if ((G.job[k]?.c || 0) < n) return false;
  // v0.18 §六 3.6 邦交深度前置（任一族达到该深度）— branch-diplomat.md DP4
  if (q.allianceDepth !== undefined) {
    var anyAt = false;
    if (G._alliance) for (var _ad in G._alliance) if (G._alliance[_ad] >= q.allianceDepth) { anyAt = true; break; }
    if (!anyAt) return false;
  }
  return true;
}

// 每只狐狸消耗野莓的原始速率（tick单位），UI 用 *0.5 转为 /s
function foxEatRate() {
  var base = 0.7;
  if (G.upg.ancestorEye?.done) base *= 0.85;
  if (G.bldSpec.tannery === 'A') base *= SPEC_BD.tannery.A.foxEatMul;
  return base;
}

// v0.14 已激活习俗数
function activeCustomCount() {
  if (!G.customs) return 0;
  var n = 0;
  for (var k in G.customs) if (G.customs[k]) n++;
  return n;
}

// 有效瞭望塔数（符咒耗尽时失效）
function activeWatchtowers() {
  var wt = G.bld.watchtower?.c || 0;
  if (!wt) return 0;
  // 符咒为0且瞭望塔在消耗 → 失效
  if (G.res.charm.v <= 0) {
    // 检查净符咒产量是否为负（即瞭望塔消耗 > 产出）
    var netCharm = G.res.charm.r || 0;
    if (netCharm < 0) return 0;
  }
  return wt;
}

// 远行时间乘数（瞭望塔每座 ×0.85 + 斥候每名 ×0.98 + 抉择永久加成）
function expTimeMul() {
  var wt = activeWatchtowers();
  var mul = Math.pow(0.85, wt);
  // 斥候在岗数量加成：每名 ×0.98（10 名 ≈ -18%，20 名 ≈ -33%）
  var scoutCount = G.job.scout?.c || 0;
  if (scoutCount > 0) mul *= Math.pow(0.98, scoutCount);
  if (G.choiceBuffs && G.choiceBuffs.permTimeMul) mul *= G.choiceBuffs.permTimeMul;
  // 铁路：远行时间 ×expTimeM/座（乘法叠加）
  if (G.bld.railroad?.c && BD.railroad?.e?.expTimeM) {
    mul *= Math.pow(BD.railroad.e.expTimeM, G.bld.railroad.c);
  }
  // C阶段进阶升级：远行时间乘数（_expTimeM，如合金铁路 ×0.85）
  for (var _et in G.upgd) {
    if (G.upgd[_et].done && UPGD[_et]?.e?._expTimeM) mul *= UPGD[_et].e._expTimeM;
  }
  // 灵修 B 升级：化形期间远行时间减免
  if (G.shapeFoxSeason >= 0) {
    var sDiff = G.season - G.shapeFoxSeason;
    if (sDiff < 0) sDiff += 4;
    if (sDiff <= (G.shapeFoxExtra || 0)) {
      for (var _set in G.upgd) {
        if (G.upgd[_set].done && UPGD[_set]?.e?._shapeExpTime) mul *= (1 + UPGD[_set].e._shapeExpTime);
      }
    }
  }
  return mul;
}

// ===== 进阶升级系统 =====
// 收集所有已购买 UPGD 的 bldM 效果（按建筑 id 汇总）
// 返回 { bldId: { prodM: 0.4, pollM: -0.25, extraP: { iron: 0.01 } }, ... }
function collectBldM() {
  var result = {};
  for (var uid in G.upgd) {
    if (!G.upgd[uid].done) continue;
    var e = UPGD[uid] && UPGD[uid].e;
    if (!e || !e.bldM) continue;
    for (var bid in e.bldM) {
      if (!result[bid]) result[bid] = {};
      var bm = e.bldM[bid];
      if (bm.prodM) result[bid].prodM = (result[bid].prodM || 0) + bm.prodM;
      if (bm.pollM) result[bid].pollM = (result[bid].pollM || 0) + bm.pollM;
      if (bm.extraP) {
        if (!result[bid].extraP) result[bid].extraP = {};
        for (var rk in bm.extraP)
          result[bid].extraP[rk] = (result[bid].extraP[rk] || 0) + bm.extraP[rk];
      }
      // C阶段：躁念修正（如灵核炉稳火 unrestM:-0.2）
      if (bm.unrestM) result[bid].unrestM = (result[bid].unrestM || 0) + bm.unrestM;
      // C阶段：建筑消耗资源减免 costM（如结晶窟减耗 -25%）
      if (bm.costM) result[bid].costM = (result[bid].costM || 0) + bm.costM;
      // C阶段：能量节省（如模块化工厂 factory energySave:1）
      if (bm.energySave) result[bid].energySave = (result[bid].energySave || 0) + bm.energySave;
      // C阶段：消耗倍率修正（如煅烧优化 calcFurnace consM:{stoneP:-0.3}）
      if (bm.consM) {
        if (!result[bid].consM) result[bid].consM = {};
        for (var ck in bm.consM)
          result[bid].consM[ck] = (result[bid].consM[ck] || 0) + bm.consM[ck];
      }
    }
  }
  return result;
}

// 收集所有已购买 UPGD 的 craftM 效果（按配方 id 汇总）
// 返回 { recipeId: { outMul: 0.25, inpM: { coal: -0.2 } }, ... }
function collectCraftM() {
  var result = {};
  for (var uid in G.upgd) {
    if (!G.upgd[uid].done) continue;
    var e = UPGD[uid] && UPGD[uid].e;
    if (!e || !e.craftM) continue;
    for (var cid in e.craftM) {
      if (!result[cid]) result[cid] = {};
      var cm = e.craftM[cid];
      if (cm.outMul) result[cid].outMul = (result[cid].outMul || 0) + cm.outMul;
      if (cm.inpM) {
        if (!result[cid].inpM) result[cid].inpM = {};
        for (var rk in cm.inpM)
          result[cid].inpM[rk] = (result[cid].inpM[rk] || 0) + cm.inpM[rk];
      }
    }
  }
  // 圣油坊建筑被动 +_oilCraftBonus / 座 → 加到 holyOilCraft 配方 outMul
  // 以及 oilPressRefine/pressEfficiency 升级的 _oilCraftBonusUp 提升每座加成
  var oilPressCount = G.bld.oilPress?.c || 0;
  if (oilPressCount > 0 && BD.oilPress?.e?._oilCraftBonus) {
    var perSeat = BD.oilPress.e._oilCraftBonus;
    for (var _u in G.upgd) {
      if (G.upgd[_u].done && UPGD[_u]?.e?._oilCraftBonusUp) perSeat += UPGD[_u].e._oilCraftBonusUp;
    }
    if (!result.holyOilCraft) result.holyOilCraft = {};
    result.holyOilCraft.outMul = (result.holyOilCraft.outMul || 0) + perSeat * oilPressCount;
  }
  return result;
}

// 判断是否可购买进阶升级
function canUpgd(id) {
  if (!UPGD[id]) return false;
  if (G.upgd[id].done) return false;
  // 校验研究前置条件
  if (UPGD[id].uq && !chk(UPGD[id].uq)) return false;
  for (var i = 0; i < UPGD[id].p.length; i++) {
    var p = UPGD[id].p[i];
    if (G.res[p.r].v < p.a) return false;
  }
  return true;
}

// ===== 能量系统 =====
// 能量不是资源，是即产即消的平衡值。
// 建筑 e 中：energyP = 能量产出，energyC = 能量消耗。
// 净能量 < 0 时，所有耗能建筑的正向资源产出按 prod/cons 比例衰减。
function calcEnergy() {
  var prod = 0, cons = 0;
  // 预收集升级能量修正 _energyBoost（如增压汽缸 steamEngine +50%）
  // 和 _energyCostReduce（如废热利用 factory -0.5）
  var _eBoost = {};
  var _eCostReduce = {};
  var _eSave = {};  // C阶段 bldM energySave
  for (var uid in G.upgd) {
    if (!G.upgd[uid].done) continue;
    var ue = UPGD[uid] && UPGD[uid].e;
    if (ue && ue._energyBoost) {
      for (var bid in ue._energyBoost)
        _eBoost[bid] = (_eBoost[bid] || 0) + ue._energyBoost[bid];
    }
    if (ue && ue._energyCostReduce) {
      for (var bid in ue._energyCostReduce)
        _eCostReduce[bid] = (_eCostReduce[bid] || 0) + ue._energyCostReduce[bid];
    }
    // C阶段：bldM energySave
    if (ue && ue.bldM) {
      for (var bid in ue.bldM) {
        if (ue.bldM[bid].energySave) _eSave[bid] = (_eSave[bid] || 0) + ue.bldM[bid].energySave;
      }
    }
  }
  for (const [id, s] of Object.entries(G.bld)) {
    if (!s.c) continue;
    const e = BD[id].e;
    if (!e) continue;
    if (e.energyP) {
      // 燃料门控：如果建筑有负向 *P（消耗资源作为燃料），
      // 则仅当燃料资源 > 0 时才计入能量产出。
      // 典型：内燃机 energyP:3 + oilP:-.04，需要火油才能发电。
      var hasFuel = true;
      for (var ek in e) {
        if (ek.endsWith('P') && ek !== 'energyP' && ek !== 'pollutionP' && ek !== 'leylineP' && ek !== 'unrestP' && e[ek] < 0) {
          var fuelKey = ek.slice(0, -1);
          if (G.res[fuelKey] && G.res[fuelKey].v <= 0) { hasFuel = false; break; }
        }
      }
      var epBase = e.energyP * s.c;
      // 进阶升级：能量产出乘数（加法叠加）
      if (_eBoost[id]) epBase *= (1 + _eBoost[id]);
      if (hasFuel) prod += epBase;
    }
    if (e.energyC) {
      var ecBase = e.energyC * s.c;
      // 进阶升级：能量消耗减免（_energyCostReduce，如废热利用 factory -0.5）
      if (_eCostReduce[id]) ecBase = Math.max(0, ecBase - _eCostReduce[id] * s.c);
      // C阶段进阶升级：能量节省（energySave，如模块化工厂 factory -1/座）
      if (_eSave[id]) ecBase = Math.max(0, ecBase - _eSave[id] * s.c);
      cons += ecBase;
    }
  }
  // 机师加成：每人使所有能量产出建筑效率 +15%（加法叠加，作用于总 prod）
  // 受授业加成（每级 +10% 基础效率）+ 政策训练扁平加算，不受满意度/政体影响
  if (G.job.machinist && G.job.machinist.c > 0) {
    var _ptf = 0;
    if (G.policies) { for (var dom in G.policies) { var oid = G.policies[dom]; if (oid && POLICY[dom] && POLICY[dom].opts[oid] && POLICY[dom].opts[oid].e && POLICY[dom].opts[oid].e.trainFlat) _ptf += POLICY[dom].opts[oid].e.trainFlat; } }
    var machTrain = 1 + (G.train.machinist || 0) * 0.1 + _ptf;
    var machinistBonus = 0.15 * G.job.machinist.c * machTrain;
    prod *= (1 + machinistBonus);
  }
  G.energyProd = prod;
  G.energyCons = cons;
  G.energyNet = prod - cons;
  G.energyRatio = cons > 0 ? Math.min(1, prod / cons) : 1;
  // 工业 D §八 5.1e #98 辉能蓄池：能量不足时衰减速率减免
  // energyRatio < 1 表示衰减；reduce=0.5 时把"距离 1 的差值"减半（如 0.6 → 0.8）
  if (G.energyRatio < 1) {
    var _esReduce = 0;
    for (var _es in G.upgd) {
      if (G.upgd[_es].done && UPGD[_es]?.e?._energyShortageReduce) _esReduce = Math.max(_esReduce, UPGD[_es].e._energyShortageReduce);
    }
    if (_esReduce > 0) G.energyRatio = G.energyRatio + (1 - G.energyRatio) * _esReduce;
  }
}

// ===== 灵脉系统 =====
// 灵脉不是资源，是即产即消的平衡值（类比工业能量）。
// 建筑 e 中：leylineP = 灵脉产出，leylineC = 灵脉消耗。
// 净灵脉 < 0 时，所有耗灵建筑的正向资源产出按 prod/cons 比例衰减。
function calcLeyline() {
  var prod = 0, cons = 0;
  // 预收集灵修升级的灵脉加成
  var _leyBonus = {};   // { bldId: extraPerBld }
  var _leySetBonus = {}; // { bldId: { per, bonus } }
  var _leyCostReduce = {}; // { bldId: flatReduce }
  for (var uid in G.upgd) {
    if (!G.upgd[uid].done) continue;
    var ue = UPGD[uid] && UPGD[uid].e;
    if (!ue) continue;
    if (ue._leyBonus) { for (var bid in ue._leyBonus) _leyBonus[bid] = (_leyBonus[bid] || 0) + ue._leyBonus[bid]; }
    if (ue._leySetBonus) { for (var bid in ue._leySetBonus) _leySetBonus[bid] = ue._leySetBonus[bid]; }
    if (ue._leyCostReduce) { for (var bid in ue._leyCostReduce) _leyCostReduce[bid] = (_leyCostReduce[bid] || 0) + ue._leyCostReduce[bid]; }
  }
  for (const [id, s] of Object.entries(G.bld)) {
    if (!s.c) continue;
    const e = BD[id].e;
    if (!e) continue;
    if (e.leylineP) {
      // 燃料门控：如果建筑有负向 *P（消耗资源作为灵脉燃料），
      // 则仅当燃料资源 > 0 时才计入灵脉产出。
      // 典型：共振塔 leylineP:3 + spiritP:-.04，需要灵能才能产灵脉。
      var hasFuel = true;
      for (var ek in e) {
        if (ek.endsWith('P') && ek !== 'leylineP' && ek !== 'unrestP' && ek !== 'energyP' && ek !== 'pollutionP' && e[ek] < 0) {
          var fuelKey = ek.slice(0, -1);
          if (G.res[fuelKey] && G.res[fuelKey].v <= 0) { hasFuel = false; break; }
        }
      }
      var leyVal = e.leylineP + (_leyBonus[id] || 0);
      if (hasFuel) prod += leyVal * s.c;
      // 套装加成：每 N 座额外灵脉
      if (_leySetBonus[id] && s.c >= _leySetBonus[id].per) {
        prod += Math.floor(s.c / _leySetBonus[id].per) * _leySetBonus[id].bonus;
      }
    }
    if (e.leylineC) {
      var lcVal = e.leylineC - (_leyCostReduce[id] || 0);
      if (lcVal > 0) cons += lcVal * s.c;
    }
  }
  // 灵脉紊乱（心魔事件）：灵脉产出 -50%
  if (G.leylineDebuff && G.tick < G.leylineDebuff) {
    prod *= 0.5;
  }
  G.leylineProd = prod;
  G.leylineCons = cons;
  G.leylineNet = prod - cons;
  G.leylineRatio = cons > 0 ? Math.min(1, prod / cons) : 1;
}

// ===== 污染系统 =====
// 污染是隐性累积值。工业建筑 +/s，治理建筑 -/s。
// 5 档惩罚阶梯；烟囱机制右移阈值；灰雾事件（有效污染 ≥ 150）。

function calcPollution() {
  // 灵修主线不产生污染
  if (G.policies && G.policies.branch === 'M') { G.pollutionRate = 0; G.pollution = 0; return; }
  var rate = 0;
  var bldPollM = collectBldM(); // 复用 bldM 收集（含 pollM）
  for (const [id, s] of Object.entries(G.bld)) {
    if (!s.c) continue;
    const e = BD[id].e;
    if (!e) continue;
    if (e.pollutionP) {
      var pollVal = e.pollutionP;
      // 进阶升级：建筑污染修正 pollM（如双层高炉 -25%）
      if (bldPollM[id] && bldPollM[id].pollM) pollVal *= Math.max(0, 1 + bldPollM[id].pollM);
      rate += pollVal * s.c;
    }
  }
  G.pollutionRate = rate;
  // v0.18 §六 3.4 占卜年签：隐逸签污染产出 -10%
  var _divPoll = getDivinationEffects();
  if (_divPoll && _divPoll.bonus.pollReduce) G.pollutionRate *= (1 - _divPoll.bonus.pollReduce);
  G.pollution += G.pollutionRate / TPD;
  if (G.pollution < 0) G.pollution = 0;
}

// 有效污染 = 实际污染 - 烟囱阈值右移
function effectivePollution() {
  var thresh = 0;
  for (const [id, s] of Object.entries(G.bld)) {
    if (!s.c) continue;
    const e = BD[id].e;
    if (!e || !e.pollThresh) continue;
    thresh += e.pollThresh * s.c;
  }
  return Math.max(0, G.pollution - thresh);
}

// 返回当前污染惩罚阶梯
function pollutionTier() {
  if (G.pollution <= 0) return POLLUTION_TIERS[0];
  var eff = effectivePollution();
  for (var i = POLLUTION_TIERS.length - 1; i >= 0; i--) {
    if (eff >= POLLUTION_TIERS[i].min) return POLLUTION_TIERS[i];
  }
  return POLLUTION_TIERS[0];
}

// 灰雾禁用：临时减少建筑有效数量（calc 阶段 apply → restore 包裹）
function applyFogDisabled() {
  G._fogRestore = {};
  if (!G.fogDisabled || !G.fogDisabled.length) return;
  var counts = {};
  for (var i = 0; i < G.fogDisabled.length; i++) {
    var bid = G.fogDisabled[i].id;
    counts[bid] = (counts[bid] || 0) + 1;
  }
  for (var bid in counts) {
    if (G.bld[bid] && G.bld[bid].c > 0) {
      G._fogRestore[bid] = G.bld[bid].c;
      G.bld[bid].c = Math.max(0, G.bld[bid].c - counts[bid]);
    }
  }
}

function restoreFogDisabled() {
  if (!G._fogRestore) return;
  for (var bid in G._fogRestore) {
    if (G.bld[bid]) G.bld[bid].c = G._fogRestore[bid];
  }
  G._fogRestore = {};
}

// 灰雾事件（有效污染 ≥ 150 时随机触发）
function tryGreyFog(silent) {
  // 灵修主线不触发灰雾事件
  if (G.policies && G.policies.branch === 'M') return;
  if (effectivePollution() < 150) return;
  // 加权随机选择事件类型
  var total = 0;
  for (var i = 0; i < GREY_FOG_EVENTS.length; i++) total += (GREY_FOG_EVENTS[i].w || 1);
  var roll = Math.random() * total;
  var sum = 0;
  var picked = GREY_FOG_EVENTS[0];
  for (var i = 0; i < GREY_FOG_EVENTS.length; i++) {
    sum += (GREY_FOG_EVENTS[i].w || 1);
    if (roll < sum) { picked = GREY_FOG_EVENTS[i]; break; }
  }
  if (picked.e === 'sickFox') {
    if ((G.foxes - (G.foxAway || 0)) > 1) {
      rmFox();
      if (!silent) log(picked.t, 'warn');
    }
  } else if (picked.e === 'disableBld') {
    // 随机选一座有效运作的建筑临时禁用（150天≈1.5季恢复）
    var candidates = [];
    for (var id in G.bld) {
      if (G.bld[id].c > 0 && BD[id]) candidates.push(id);
    }
    if (candidates.length) {
      var target = candidates[Math.floor(Math.random() * candidates.length)];
      G.fogDisabled.push({ id: target, endTick: G.tick + 1500 });
      if (!silent) log(picked.t + '（' + BD[target].n + ' 暂时停工）', 'warn');
    }
  } else if (picked.e === 'loseRes') {
    // 随机损失一种资源的 10~20%
    var resCandidates = [];
    for (var k in G.res) {
      if (G.res[k].on && G.res[k].v > 1) resCandidates.push(k);
    }
    if (resCandidates.length) {
      var rk = resCandidates[Math.floor(Math.random() * resCandidates.length)];
      var loss = Math.ceil(G.res[rk].v * (0.1 + Math.random() * 0.1));
      G.res[rk].v = Math.max(0, G.res[rk].v - loss);
      if (!silent) log(picked.t + '（' + RD[rk].n + ' -' + loss + '）', 'warn');
    }
  }
}

// ===== 躁念系统（灵修失衡，类比工业污染） =====
// 灵修建筑每 tick 增加"躁念"，净化建筑每 tick 减少。
// 5 档惩罚阶梯；静室机制右移阈值；心魔事件（有效躁念 ≥ 150）。

function calcUnrest() {
  // 工业主线不产生躁念
  if (G.policies && G.policies.branch === 'I') { G.unrestRate = 0; G.unrest = 0; return; }
  // 预收集灵修升级的躁念减免
  var _unrestReduce = {};
  var _globalUnrestReduce = 0;
  for (var uid in G.upgd) {
    if (!G.upgd[uid].done) continue;
    var ue = UPGD[uid] && UPGD[uid].e;
    if (ue && ue._unrestReduce) {
      for (var bid in ue._unrestReduce) _unrestReduce[bid] = (_unrestReduce[bid] || 0) + ue._unrestReduce[bid];
    }
    if (ue && ue._globalUnrestReduce) _globalUnrestReduce += ue._globalUnrestReduce;
  }
  var rate = 0;
  var _bldMUnrest = collectBldM(); // 复用 bldM 收集（含 unrestM）
  for (const [id, s] of Object.entries(G.bld)) {
    if (!s.c) continue;
    const e = BD[id].e;
    if (!e) continue;
    if (e.unrestP) {
      var uVal = e.unrestP;
      // 灵修升级：建筑躁念减免（如灵泉引流 -50%），仅对正向躁念生效
      if (uVal > 0 && _unrestReduce[id]) uVal *= Math.max(0, 1 + _unrestReduce[id]);
      // 灵修升级：净化建筑增效（如净辉林深根 +50%），仅对负向躁念生效
      if (uVal < 0 && _unrestReduce[id]) uVal *= (1 - _unrestReduce[id]);
      // v0.19 §七 4.2 bldM.unrestM：建筑躁念修正（如灵核炉稳火 -20%）
      if (uVal > 0 && _bldMUnrest[id] && _bldMUnrest[id].unrestM) uVal *= Math.max(0, 1 + _bldMUnrest[id].unrestM);
      rate += uVal * s.c;
    }
  }
  G.unrestRate = rate;
  // v0.19 §七 4.2 辉芒灯：全局躁念减免
  if (_globalUnrestReduce > 0) G.unrestRate *= (1 - _globalUnrestReduce);
  // v0.18 §六 3.4 占卜年签：隐逸签内乱产出 -10%
  var _divUnr = getDivinationEffects();
  if (_divUnr && _divUnr.bonus.unrestReduce) G.unrestRate *= (1 - _divUnr.bonus.unrestReduce);
  G.unrest += G.unrestRate / TPD;
  if (G.unrest < 0) G.unrest = 0;
}

// 有效躁念 = 实际躁念 - 静室阈值右移
function effectiveUnrest() {
  // 预收集灵修升级的静室阈值加成
  var quietBonus = 0;
  for (var uid in G.upgd) {
    if (!G.upgd[uid].done) continue;
    var ue = UPGD[uid] && UPGD[uid].e;
    if (ue && ue._quietBonus) quietBonus += ue._quietBonus;
  }
  var thresh = 0;
  for (const [id, s] of Object.entries(G.bld)) {
    if (!s.c) continue;
    const e = BD[id].e;
    if (!e || !e.unrestThresh) continue;
    thresh += (e.unrestThresh + (id === 'quietRoom' ? quietBonus : 0)) * s.c;
  }
  return Math.max(0, G.unrest - thresh);
}

// 返回当前躁念惩罚阶梯
function unrestTier() {
  if (G.unrest <= 0) return UNREST_TIERS[0];
  var eff = effectiveUnrest();
  for (var i = UNREST_TIERS.length - 1; i >= 0; i--) {
    if (eff >= UNREST_TIERS[i].min) return UNREST_TIERS[i];
  }
  return UNREST_TIERS[0];
}

// 心魔禁用：临时减少建筑有效数量（同灰雾机制）
function applyDemonDisabled() {
  G._demonRestore = {};
  if (!G.demonDisabled || !G.demonDisabled.length) return;
  var counts = {};
  for (var i = 0; i < G.demonDisabled.length; i++) {
    var bid = G.demonDisabled[i].id;
    counts[bid] = (counts[bid] || 0) + 1;
  }
  for (var bid in counts) {
    if (G.bld[bid] && G.bld[bid].c > 0) {
      // 避免与灰雾禁用冲突：只记录当前实际值（可能已被 applyFogDisabled 修改）
      G._demonRestore[bid] = G.bld[bid].c;
      G.bld[bid].c = Math.max(0, G.bld[bid].c - counts[bid]);
    }
  }
}

function restoreDemonDisabled() {
  if (!G._demonRestore) return;
  for (var bid in G._demonRestore) {
    if (G.bld[bid]) G.bld[bid].c = G._demonRestore[bid];
  }
  G._demonRestore = {};
}

// 心魔事件（有效躁念 ≥ 150 时随机触发）
function tryInnerDemon(silent) {
  // 工业主线不触发心魔事件
  if (G.policies && G.policies.branch === 'I') return;
  if (effectiveUnrest() < 150) return;
  // 加权随机选择事件类型
  var total = 0;
  for (var i = 0; i < INNER_DEMON_EVENTS.length; i++) total += (INNER_DEMON_EVENTS[i].w || 1);
  var roll = Math.random() * total;
  var sum = 0;
  var picked = INNER_DEMON_EVENTS[0];
  for (var i = 0; i < INNER_DEMON_EVENTS.length; i++) {
    sum += (INNER_DEMON_EVENTS[i].w || 1);
    if (roll < sum) { picked = INNER_DEMON_EVENTS[i]; break; }
  }
  if (picked.e === 'lostFox') {
    if ((G.foxes - (G.foxAway || 0)) > 1) {
      rmFox();
      if (!silent) log(picked.t, 'warn');
    }
  } else if (picked.e === 'spellCooldown') {
    // 灵术失控：随机对所有灵修灵术施加 120s（600 tick）冷却
    var mysticSpells = ['spiritSight', 'tidePull', 'fateWeave', 'resonWave', 'shapeFox', 'sageUtter', 'calmFlow'];
    for (var msi = 0; msi < mysticSpells.length; msi++) {
      var sid = mysticSpells[msi];
      if (SD[sid]) {
        G.spellCooldowns[sid] = Math.max(G.spellCooldowns[sid] || 0, G.tick + 600);
      }
    }
    if (!silent) log(picked.t + '（所有灵修灵术进入120秒冷却）', 'warn');
  } else if (picked.e === 'leylineDisrupt') {
    // 灵脉紊乱：灵脉产出 -50% 持续 30 秒（150 tick）
    G.leylineDebuff = G.tick + 150;
    if (!silent) log(picked.t + '（灵脉产出 -50%，30秒）', 'warn');
  } else if (picked.e === 'unrestEcho') {
    // 躁念回响：躁念 +15（一次性）
    G.unrest += 15;
    if (!silent) log(picked.t + '（躁念 +15）', 'warn');
  } else if (picked.e === 'loseFateSilk') {
    // 命丝断裂：命丝 -20% 当前库存
    if (G.res.fateSilk && G.res.fateSilk.v > 0) {
      var loss = Math.ceil(G.res.fateSilk.v * 0.2);
      G.res.fateSilk.v = Math.max(0, G.res.fateSilk.v - loss);
      if (!silent) log(picked.t + '（命丝 -' + loss + '）', 'warn');
    } else {
      // 命丝尚未解锁时回退为躁念回响
      G.unrest += 15;
      if (!silent) log('躁念在村落中回荡，不安的情绪感染了每一只狐狸。（躁念 +15）', 'warn');
    }
  }
}

// ===== 产量计算 =====
function calcR() {
  const r = {}, m = {};
  for (const k of Object.keys(RD)) { r[k] = 0; m[k] = 1; }

  // 收集进阶升级的建筑/配方修正
  var _bldM = collectBldM();
  var _craftM = collectCraftM();

  // 收集 _bldConsReduce { bldId: { resKey: reduceVal } }（如 oilRecovery 煅烧炉火油-25%）
  var _bldConsReduce = {};
  for (var _bcr in G.upgd) {
    if (!G.upgd[_bcr].done) continue;
    var bcrE = UPGD[_bcr]?.e?._bldConsReduce;
    if (!bcrE) continue;
    for (var bid in bcrE) {
      _bldConsReduce[bid] = _bldConsReduce[bid] || {};
      for (var rk in bcrE[bid]) {
        _bldConsReduce[bid][rk] = (_bldConsReduce[bid][rk] || 0) + bcrE[bid][rk];
      }
    }
  }

  // 收集 _holyBldDiscount（圣典蓝图：工业建筑造价 -8%；只在 build cost 用，不在 calcR）
  // 这里只记录到 G 供 bp() 使用
  var _holyBldDiscount = 0;
  for (var _hbd in G.upgd) {
    if (G.upgd[_hbd].done && UPGD[_hbd]?.e?._holyBldDiscount) _holyBldDiscount += UPGD[_hbd].e._holyBldDiscount;
  }
  G._holyBldDiscount = _holyBldDiscount;

  // 收集 _railTradeBonus（铁路提速：铁路商队加成 +N%；caravanArrivalProb 已读 _caravanBonusFlat 走通用通道，但 _railTradeBonus 是独立 flag）
  // 复用 _caravanBonusFlat 通道：将 _railTradeBonus × railroad 数量 加到 caravanProb
  // 这里也只暴露到 G 供 caravanArrivalProb 用
  var _railTradeBonusTotal = 0;
  for (var _rtb in G.upgd) {
    if (G.upgd[_rtb].done && UPGD[_rtb]?.e?._railTradeBonus) {
      _railTradeBonusTotal += UPGD[_rtb].e._railTradeBonus * (G.bld.railroad?.c || 0);
    }
  }
  G._railTradeBonusTotal = _railTradeBonusTotal;

  // v0.19 §七 4.2 灵修 C 升级：_mysticBldAll（所有灵修建筑产出+N%）
  var _mysticBldAll = 0;
  for (var _mba in G.upgd) {
    if (G.upgd[_mba].done && UPGD[_mba]?.e?._mysticBldAll) _mysticBldAll += UPGD[_mba].e._mysticBldAll;
  }

  // 灵修 B 升级：灵脉充足时灵能建筑额外加成
  var _leyFullBonus = 0;
  for (var _lfb in G.upgd) {
    if (G.upgd[_lfb].done && UPGD[_lfb]?.e?._leyFullBonus) _leyFullBonus += UPGD[_lfb].e._leyFullBonus;
  }

  // 神恩上限计算（收集升级 _graceCapBonus）
  var _graceCap = 0.50;
  for (var _gc in G.upgd) {
    if (G.upgd[_gc].done && UPGD[_gc]?.e?._graceCapBonus) _graceCap += UPGD[_gc].e._graceCapBonus;
  }
  G._graceCap = _graceCap;

  // 声望上限计算（收集升级 _reputeCapBonus）
  var _reputeCap = 0.40;
  for (var _rc in G.upgd) {
    if (G.upgd[_rc].done && UPGD[_rc]?.e?._reputeCapBonus) _reputeCap += UPGD[_rc].e._reputeCapBonus;
  }
  G._reputeCap = _reputeCap;

  // 建筑被动产出（含专精加成 + 进阶升级 bldM）
  for (const [id, s] of Object.entries(G.bld)) {
    if (!s.c) continue;
    const e = BD[id].e; if (!e) continue;
    var specData = G.bldSpec[id] && SPEC_BD[id] ? SPEC_BD[id][G.bldSpec[id]] : null;
    var upgdBld = _bldM[id]; // 进阶升级对该建筑的修正
    for (const [k, v] of Object.entries(e)) {
      if (!k.endsWith('P')) continue;
      var resKey = k.slice(0, -1);
      var val = v;
      // 建筑专精产量乘数
      if (specData) {
        if (specData.prodMul) val *= specData.prodMul;
        // 藏书阁穷卷/秘阁 特殊乘数
        if (resKey === 'lore' && specData.loreProdMul) val = v * specData.loreProdMul;
        if (resKey === 'scroll' && specData.scrollProdMul) val = v * specData.scrollProdMul;
        if (resKey === 'charm' && specData.charmProdMul) val = v * specData.charmProdMul;
      }
      // v0.14 习俗对灵狐祠 charm 的加成（加法叠加，与引灵专精合并：×(1 + 0.4 + 0.2 + 0.05)）
      if (id === 'shrine' && resKey === 'charm') {
        var bonus = 0;
        if (specData && specData.charmProdMul) bonus += (specData.charmProdMul - 1);
        if (G.customs && G.customs.watchNight) bonus += 0.2;
        if (G.customs && G.customs.ancestorRite) bonus += 0.05;
        val = v * (1 + bonus);
      }
      // v0.14 习俗：老火传承 - 锻造炉矿铁产出 +10%（乘法叠加）
      if (id === 'smithy' && resKey === 'iron' && G.customs && G.customs.oldFire) val *= 1.1;
      // _bldConsReduce：建筑消耗减免（仅对负 val 生效，如内燃机火油消耗 -30%）
      // reduce 值通常为负，eg -0.25 表示减少 25%；val 是负的（消耗），val *= (1 + reduce) 缩小绝对值
      if (val < 0 && _bldConsReduce[id] && _bldConsReduce[id][resKey] !== undefined) {
        val *= Math.max(0, 1 + _bldConsReduce[id][resKey]);
      }
      // v0.15.1 月歌台维持半效：断供时符咒产出 ×0.25
      if (id === 'moonStage' && resKey === 'charm' && !G.moonStageActive) val *= 0.25;
      // 进阶升级：建筑产出乘数 prodM（加法叠加，如矿道支撑 +40%）
      if (upgdBld && upgdBld.prodM) val *= (1 + upgdBld.prodM);
      // v0.19 §七 4.2 灵修 C 升级：_mysticBldAll（所有灵修建筑正向产出+N%）
      if (BD[id].br === 'M' && val > 0 && _mysticBldAll > 0) val *= (1 + _mysticBldAll);
      // 灵修 B 升级：灵脉充足时灵能建筑产出额外加成
      if (BD[id].br === 'M' && val > 0 && G.leylineRatio >= 1 && _leyFullBonus > 0) val *= (1 + _leyFullBonus);
      // 能量系统：耗能建筑正向产出按供给比衰减
      if (e.energyC && G.energyRatio < 1 && val > 0) val *= G.energyRatio;
      // 灵脉系统：耗灵建筑正向产出按供给比衰减
      if (e.leylineC && G.leylineRatio < 1 && val > 0) val *= G.leylineRatio;
      // 进阶升级：特定建筑灵能消耗减免 _spiritConsReduce（如共振塔减耗 -30%）
      if (val < 0 && resKey === 'spirit') {
        for (var _scr in G.upgd) {
          if (G.upgd[_scr].done && UPGD[_scr]?.e?._spiritConsReduce?.[id])
            val *= (1 - UPGD[_scr].e._spiritConsReduce[id]);
        }
      }
      // C阶段进阶升级：建筑消耗倍率修正 consM（如煅烧优化 stoneP:-0.3）
      if (val < 0 && upgdBld && upgdBld.consM && upgdBld.consM[k]) {
        val *= (1 + upgdBld.consM[k]);
      }
      // v0.19 §七 4.2 灵修 C 升级：建筑全消耗减免 costM（如结晶窟减耗 -25%）
      if (val < 0 && upgdBld && upgdBld.costM) {
        val *= Math.max(0, 1 + upgdBld.costM);
      }
      r[resKey] = (r[resKey] || 0) + val * s.c;
    }
    // 建筑专精额外产出
    if (specData && specData.extraP) {
      for (var ek in specData.extraP) {
        var epVal = specData.extraP[ek] * s.c * TPD;
        // 能量系统：耗能建筑正向副产衰减，负向（消耗）不受影响
        if (e.energyC && G.energyRatio < 1 && epVal > 0) epVal *= G.energyRatio;
        // 灵脉系统：耗灵建筑正向副产衰减
        if (e.leylineC && G.leylineRatio < 1 && epVal > 0) epVal *= G.leylineRatio;
        r[ek] = (r[ek] || 0) + epVal;
      }
    }
    // 进阶升级：建筑额外产出 extraP（如碎矿筛选 → 矿坑额外产铁）
    if (upgdBld && upgdBld.extraP) {
      for (var ek in upgdBld.extraP) {
        var epVal = upgdBld.extraP[ek] * s.c * TPD;
        if (e.energyC && G.energyRatio < 1 && epVal > 0) epVal *= G.energyRatio;
        // 灵脉系统：耗灵建筑正向副产衰减
        if (e.leylineC && G.leylineRatio < 1 && epVal > 0) epVal *= G.leylineRatio;
        r[ek] = (r[ek] || 0) + epVal;
      }
    }
    // 建筑专精消耗（drain）
    if (specData && specData.drain) {
      for (var dk in specData.drain)
        r[dk] = (r[dk] || 0) - specData.drain[dk] * s.c * TPD;
    }
  }

  // v0.19 §七 4.2 灵修 C 升级：_chartExtra（灵图阁每座额外灵图产出）
  for (var _ce in G.upgd) {
    if (G.upgd[_ce].done && UPGD[_ce]?.e?._chartExtra && G.bld.chartHall?.c) {
      r.spiritChart = (r.spiritChart || 0) + UPGD[_ce].e._chartExtra * G.bld.chartHall.c * TPD;
    }
  }

  // v0.19 §七 4.2 灵修 C 升级：_shapeMasterChart（化形师被动：灵图产出+N%）
  for (var _smc in G.upgd) {
    if (G.upgd[_smc].done && UPGD[_smc]?.e?._shapeMasterChart && G.job.shapeMaster?.c) {
      if (r.spiritChart > 0) r.spiritChart *= (1 + UPGD[_smc].e._shapeMasterChart);
    }
  }
  // v0.19 §七 4.2: 化形师基础被动——灵图产出 +10%/人（不依赖升级）
  if (G.job.shapeMaster?.c > 0) {
    if (r.spiritChart > 0) r.spiritChart *= (1 + 0.10 * G.job.shapeMaster.c);
  }

  // v0.19 §七 4.2 灵修 C 升级：_radiantExpand（辉映台跨面板效果）
  // 辉映台效果范围扩大：每座辉映台为所有灵修资源提供 +2% 产出
  for (var _re in G.upgd) {
    if (G.upgd[_re].done && UPGD[_re]?.e?._radiantExpand && G.bld.radianceDais?.c) {
      var radExpand = 0.02 * G.bld.radianceDais.c;
      for (const k of Object.keys(r)) {
        if (r[k] > 0 && RD[k] && (RD[k].c === '研究' || RD[k].c === '加工') &&
            ['spirit','fateSilk','bead','spiritInk','sigil','resonance','elixir','spectrum','insight',
             'crystalSilk','radiance','spiritCore','formSoul','spiritChart'].indexOf(k) >= 0) {
          r[k] *= (1 + radExpand);
        }
      }
    }
  }

  // v0.16 政体建筑产出惩罚（pen.bldProdM，负面不受政堂加成）
  if (G.polity && POLITY[G.polity]) {
    var pen = POLITY[G.polity].pen || {};
    if (pen.bldProdM) {
      var bldPenalty = 1 + pen.bldProdM;
      for (const k of Object.keys(r)) {
        if (r[k] > 0) r[k] *= bldPenalty;
      }
    }
  }

  // 灵修灵术：引潮（本季所有建筑被动产出 +30%）
  if (G.tidePullSeason === G.season) {
    for (const k of Object.keys(r)) {
      if (r[k] > 0) r[k] *= 1.3;
    }
  }

  // 灵修 B 灵术：共振波（本季全产出 +50%，升级可提升至 65%/80%）
  if (G.resonWaveSeason === G.season) {
    var rwBoost = 0.5;
    for (var _rw in G.upgd) {
      if (G.upgd[_rw].done && UPGD[_rw]?.e?._spellBoost?.resonWave)
        rwBoost += UPGD[_rw].e._spellBoost.resonWave;
    }
    // v0.18 占卜：灵感签灵术效果 +8%
    var _divSpell = getDivinationEffects();
    if (_divSpell && _divSpell.bonus.spellBoost) rwBoost += _divSpell.bonus.spellBoost;
    for (const k of Object.keys(r)) {
      if (r[k] > 0) r[k] *= (1 + rwBoost);
    }
  }

  // 灵修 C 灵术：星感（本季灵图产出×3，升级可提升至×5）
  if (G.starSenseSeason === G.season) {
    var ssBoost = 3;
    for (var _ss in G.upgd) {
      if (G.upgd[_ss].done && UPGD[_ss]?.e?._spellBoost?.starSenseSpell)
        ssBoost *= (1 + UPGD[_ss].e._spellBoost.starSenseSpell);
    }
    if (r.spiritChart) r.spiritChart *= ssBoost;
  }

  // 职业产出（含培训加成 × 满意度 × 天赋加成）
  // v0.16 政体/政策对职业产出的总乘数
  var polityJobMul = 1;
  if (G.polity && POLITY[G.polity]) {
    var pe = POLITY[G.polity].e || {};
    var pen = POLITY[G.polity].pen || {};
    var polityBoost = 1 + Math.min(5, G.bld.polityHall?.c || 0) * 0.05;
    if (pe.jobM) polityJobMul += pe.jobM * polityBoost;
    if (pen.jobM) polityJobMul += pen.jobM;
  }
  if (G.policies) {
    for (var dom in G.policies) {
      var optId = G.policies[dom];
      if (!optId || !POLICY[dom] || !POLICY[dom].opts[optId]) continue;
      var pe = POLICY[dom].opts[optId].e;
      if (pe && pe.jobM) polityJobMul += pe.jobM;
      var ppen = POLICY[dom].opts[optId].pen;
      if (ppen && ppen.jobM) polityJobMul += ppen.jobM;
    }
  }
  // v0.16 政策 trainFlat: 授业加成扁平加算
  var policyTrainFlat = 0;
  if (G.policies) {
    for (var dom in G.policies) {
      var optId = G.policies[dom];
      if (!optId || !POLICY[dom] || !POLICY[dom].opts[optId]) continue;
      var pe = POLICY[dom].opts[optId].e;
      if (pe && pe.trainFlat) policyTrainFlat += pe.trainFlat;
    }
  }
  // 进阶升级：职业产出乘数 jobM（如钢制猎弓 猎手+40%）
  var _jobM = {};
  var _happyJobBonus = {}; // 灵修升级：特定职业满意度额外加成
  var _resonancerSpiritP = 0; // 灵修 B 升级：共鸣师额外灵能产出
  var _jobAllMul = 0; // 工业 D §八 5.1e #103 智能调度：所有职业产出乘数
  for (const [uid, us] of Object.entries(G.upgd)) {
    if (!us.done) continue;
    var ue = UPGD[uid] && UPGD[uid].e;
    if (ue && ue.jobM) {
      for (var jid in ue.jobM) _jobM[jid] = (_jobM[jid] || 0) + ue.jobM[jid];
    }
    if (ue && ue._happyJobBonus) {
      for (var jid in ue._happyJobBonus) _happyJobBonus[jid] = (_happyJobBonus[jid] || 0) + ue._happyJobBonus[jid];
    }
    if (ue && ue._resonancerSpiritP) _resonancerSpiritP += ue._resonancerSpiritP;
    if (ue && ue._jobAllM) _jobAllMul += ue._jobAllM;
  }
  // 灵修 B 灵术：化形·灵狐（本季所有职业效率 ×1.5）
  var shapeFoxMul = 1;
  if (G.shapeFoxSeason >= 0) {
    var seasonDiff = G.season - G.shapeFoxSeason;
    if (seasonDiff < 0) seasonDiff += 4;
    if (seasonDiff <= (G.shapeFoxExtra || 0)) shapeFoxMul = 1.5;
  }
  // v0.19 §七 4.2 灵修 C 升级：_trainBonus（全局授业等级加成）
  var _trainBonusLvl = 0;
  for (var _tb in G.upgd) {
    if (G.upgd[_tb].done && UPGD[_tb]?.e?._trainBonus) _trainBonusLvl += UPGD[_tb].e._trainBonus;
  }
  for (const [id, s] of Object.entries(G.job)) {
    if (!s.c) continue;
    var trainBonus = 1 + ((G.train[id] || 0) + _trainBonusLvl) * 0.1 + policyTrainFlat;
    var talentData = G.jobTalent[id] && SPEC_JD[id] ? SPEC_JD[id][G.jobTalent[id]] : null;
    var jobUpgdMul = 1 + (_jobM[id] || 0) + _jobAllMul;
    // 灵修升级：满意度额外加成（如感应远距 ×满意度×1.2）
    var happyMul = G.happy;
    if (_happyJobBonus[id]) happyMul *= (1 + _happyJobBonus[id]);
    for (const [k, v] of Object.entries(JD[id].e)) {
      if (!k.endsWith('P')) continue;
      var resKey = k.slice(0, -1);
      var val = v;
      if (talentData) {
        if (talentData.prodMul) val *= talentData.prodMul;
        if (resKey === 'lore' && talentData.loreProdMul) val = v * talentData.loreProdMul;
        if (resKey === 'scroll' && talentData.scrollProdMul) val = v * talentData.scrollProdMul;
      }
      // v0.14 习俗：共狩日 - 猎手兽皮 +15%
      if (id === 'hunter' && resKey === 'leather' && G.customs && G.customs.shareHunt) val *= 1.15;
      // 月话课：学者产出 +10%（永久）
      if (id === 'scholar' && G.customs && G.customs.moonClass) val *= 1.1;
      // 猎人 spice 副产：仅在 spice 已解锁时生效
      if (id === 'hunter' && resKey === 'spice' && (!G.res.spice || !G.res.spice.on)) continue;
      r[resKey] = (r[resKey] || 0) + val * s.c * trainBonus * happyMul * polityJobMul * jobUpgdMul * shapeFoxMul;
    }
    // 天赋额外产出
    if (talentData && talentData.extraP) {
      for (var ek in talentData.extraP)
        r[ek] = (r[ek] || 0) + talentData.extraP[ek] * s.c * TPD * trainBonus * happyMul * polityJobMul * jobUpgdMul * shapeFoxMul;
    }
    // 灵修 B 升级：共鸣师额外灵能产出
    if (id === 'resonancer' && _resonancerSpiritP > 0) {
      r.spirit = (r.spirit || 0) + _resonancerSpiritP * s.c * trainBonus * happyMul * shapeFoxMul;
    }
  }

  // v0.15 彩络节令：本季全职业产出 +5%（仿祖灵段，独立加项）
  if (G.seasonRites.dye) {
    for (const [id, s] of Object.entries(G.job)) {
      if (!s.c) continue;
      var trainBonus = 1 + (G.train[id] || 0) * 0.1;
      var talentData = G.jobTalent[id] && SPEC_JD[id] ? SPEC_JD[id][G.jobTalent[id]] : null;
      var jobUpgdMul = 1 + (_jobM[id] || 0);
      var happyMul = G.happy * (1 + (_happyJobBonus[id] || 0));
      for (const [k, v] of Object.entries(JD[id].e)) {
        if (!k.endsWith('P')) continue;
        var resKey = k.slice(0, -1);
        var val = v;
        if (talentData) {
          if (talentData.prodMul) val *= talentData.prodMul;
          if (resKey === 'lore' && talentData.loreProdMul) val = v * talentData.loreProdMul;
          if (resKey === 'scroll' && talentData.scrollProdMul) val = v * talentData.scrollProdMul;
        }
        if (id === 'hunter' && resKey === 'leather' && G.customs && G.customs.shareHunt) val *= 1.15;
        r[resKey] = (r[resKey] || 0) + val * s.c * trainBonus * happyMul * 0.05 * jobUpgdMul;
      }
      if (talentData && talentData.extraP) {
        for (var ek in talentData.extraP)
          r[ek] = (r[ek] || 0) + talentData.extraP[ek] * s.c * TPD * trainBonus * happyMul * 0.05 * jobUpgdMul;
      }
    }
  }

  // 祖灵加成（本季职业产出 +50%，含天赋加成）
  if (G.spiritSeason === G.season) {
    for (const [id, s] of Object.entries(G.job)) {
      if (!s.c) continue;
      var trainBonus = 1 + (G.train[id] || 0) * 0.1;
      var talentData = G.jobTalent[id] && SPEC_JD[id] ? SPEC_JD[id][G.jobTalent[id]] : null;
      var jobUpgdMul = 1 + (_jobM[id] || 0);
      var happyMul = G.happy * (1 + (_happyJobBonus[id] || 0));
      for (const [k, v] of Object.entries(JD[id].e)) {
        if (!k.endsWith('P')) continue;
        var resKey = k.slice(0, -1);
        var val = v;
        if (talentData) {
          if (talentData.prodMul) val *= talentData.prodMul;
          if (resKey === 'lore' && talentData.loreProdMul) val = v * talentData.loreProdMul;
          if (resKey === 'scroll' && talentData.scrollProdMul) val = v * talentData.scrollProdMul;
        }
        // v0.14 习俗：共狩日 - 猎手兽皮 +15%（祖灵段同步）
        if (id === 'hunter' && resKey === 'leather' && G.customs && G.customs.shareHunt) val *= 1.15;
        r[resKey] = (r[resKey] || 0) + val * s.c * trainBonus * happyMul * 0.5 * jobUpgdMul;
      }
      // 天赋额外产出也受祖灵加成
      if (talentData && talentData.extraP) {
        for (var ek in talentData.extraP)
          r[ek] = (r[ek] || 0) + talentData.extraP[ek] * s.c * TPD * trainBonus * happyMul * 0.5 * jobUpgdMul;
      }
    }
  }

  // 研究加成
  for (const [id, s] of Object.entries(G.upg)) {
    if (!s.done) continue;
    const e = UD[id].e; if (!e) continue;
    for (const [k, v] of Object.entries(e))
      if (k.endsWith('M') && !k.startsWith('hap') && k !== 'plankU' && k !== 'brickU' && k !== 'winterBuff' && k !== 'foxEat')
        m[k.slice(0, -1)] = (m[k.slice(0, -1)] || 1) + v;
  }

  // 进阶升级加成（资源乘数 *M，与研究同机制）
  for (const [id, s] of Object.entries(G.upgd)) {
    if (!s.done) continue;
    const e = UPGD[id] && UPGD[id].e; if (!e) continue;
    for (const [k, v] of Object.entries(e))
      if (k.endsWith('M') && typeof v === 'number' && k !== 'craftM' && k !== 'bldM' && k !== 'mxM' && k !== 'bldMxM' && k !== 'jobM' && k !== 'bldCostM')
        m[k.slice(0, -1)] = (m[k.slice(0, -1)] || 1) + v;
  }

  // 月光井全资源加成
  for (const [id, s] of Object.entries(G.bld)) {
    if (!s.c) continue;
    const e = BD[id].e; if (!e || !e.allM) continue;
    for (const k of Object.keys(r))
      m[k] = (m[k] || 1) + e.allM * s.c;
  }

  // v0.14 刻名碑加成（每座 ×已激活习俗 ×0.2%，加法叠加 allM）
  if (G.bld.memorial?.c && BD.memorial?.e?.customAllM) {
    var customCnt = activeCustomCount();
    var memorialMul = BD.memorial.e.customAllM * G.bld.memorial.c * customCnt;
    if (memorialMul > 0) {
      for (const k of Object.keys(r))
        m[k] = (m[k] || 1) + memorialMul;
    }
  }

  // v0.15 三全礼：全产出 +3%（加法叠加 allM）
  if (G.seasonRites.all) {
    for (const k of Object.keys(r)) m[k] = (m[k] || 1) + 0.03;
  }

  // v0.16 政体效果（e=正面受政堂加成, pen=惩罚不受加成）
  if (G.polity && POLITY[G.polity]) {
    var pe = POLITY[G.polity].e || {};
    var pen = POLITY[G.polity].pen || {};
    var polityBoost = 1 + Math.min(5, G.bld.polityHall?.c || 0) * 0.05;
    // allM (全资源加成, 正面)
    if (pe.allM) {
      var val = pe.allM * polityBoost;
      for (const k of Object.keys(r)) m[k] = (m[k] || 1) + val;
    }
    // 单资源乘数（正面，受加成）
    var polityResMap = { loreM: 'lore', coinM: 'coin', charmM: 'charm' };
    for (var pk in polityResMap) {
      if (pe[pk]) {
        m[polityResMap[pk]] = (m[polityResMap[pk]] || 1) + pe[pk] * polityBoost;
      }
    }
    // 单资源乘数（惩罚，不受加成）
    for (var pk in polityResMap) {
      if (pen[pk]) {
        m[polityResMap[pk]] = (m[polityResMap[pk]] || 1) + pen[pk];
      }
    }
    // baseProdM（正面，受加成）
    if (pe.baseProdM) {
      var val = pe.baseProdM * polityBoost;
      m.berry = (m.berry || 1) + val;
      m.wood = (m.wood || 1) + val;
      m.stone = (m.stone || 1) + val;
    }
    // baseProdM（惩罚，不受加成）
    if (pen.baseProdM) {
      m.berry = (m.berry || 1) + pen.baseProdM;
      m.wood = (m.wood || 1) + pen.baseProdM;
      m.stone = (m.stone || 1) + pen.baseProdM;
    }
  }

  // v0.16 Tier 1 路线 effect (内守: 基础资源 +4%, 不受政堂加成)
  if (G.tier1 && typeof TIER !== 'undefined' && TIER[G.tier1]?.e?.baseProdM) {
    var v = TIER[G.tier1].e.baseProdM;
    m.berry = (m.berry || 1) + v;
    m.wood = (m.wood || 1) + v;
    m.stone = (m.stone || 1) + v;
  }

  // v0.16 政策效果
  if (G.policies) {
    for (var dom in G.policies) {
      var optId = G.policies[dom];
      if (!optId || !POLICY[dom] || !POLICY[dom].opts[optId]) continue;
      var pe = POLICY[dom].opts[optId].e;
      var ppen = POLICY[dom].opts[optId].pen || {};
      // allM
      if (pe && pe.allM) { for (const k of Object.keys(r)) m[k] = (m[k] || 1) + pe.allM; }
      // 单资源（正面 e）
      if (pe && pe.berryM) m.berry = (m.berry || 1) + pe.berryM;
      if (pe && pe.woodM) m.wood = (m.wood || 1) + pe.woodM;
      if (pe && pe.stoneM) m.stone = (m.stone || 1) + pe.stoneM;
      if (pe && pe.coinM) m.coin = (m.coin || 1) + pe.coinM;
      if (pe && pe.loreM) m.lore = (m.lore || 1) + pe.loreM;
      if (pe && pe.scrollM) m.scroll = (m.scroll || 1) + pe.scrollM;
      if (pe && pe.charmM) m.charm = (m.charm || 1) + pe.charmM;
      // 单资源（惩罚 pen）
      if (ppen.berryM) m.berry = (m.berry || 1) + ppen.berryM;
      if (ppen.coinM) m.coin = (m.coin || 1) + ppen.coinM;
      if (ppen.loreM) m.lore = (m.lore || 1) + ppen.loreM;
      // baseProdM（正面）
      if (pe && pe.baseProdM) {
        m.berry = (m.berry || 1) + pe.baseProdM;
        m.wood = (m.wood || 1) + pe.baseProdM;
        m.stone = (m.stone || 1) + pe.baseProdM;
      }
      // baseProdM（惩罚）
      if (ppen.baseProdM) {
        m.berry = (m.berry || 1) + ppen.baseProdM;
        m.wood = (m.wood || 1) + ppen.baseProdM;
        m.stone = (m.stone || 1) + ppen.baseProdM;
      }
      // diplomatResM（通达政策：外交资源加成）
      if (pe && pe.diplomatResM) {
        m.renown = (m.renown || 1) + pe.diplomatResM;
        m.credential = (m.credential || 1) + pe.diplomatResM;
        m.charter = (m.charter || 1) + pe.diplomatResM;
        m.exotic = (m.exotic || 1) + pe.diplomatResM;
      }
    }
  }

  // 应用乘数
  for (const k of Object.keys(r)) r[k] *= (m[k] || 1);

  // ===== 神恩全局产出加成 =====
  if (G.upg.graceLore?.done && G.res.piety) {
    var p = G.res.piety.v;
    var graceCap = G._graceCap || 0.50;
    var graceBonus = Math.min(graceCap, (Math.sqrt(1 + p / 100) - 1) * 0.50);
    if (graceBonus > 0) {
      for (const k of Object.keys(r)) if (r[k] > 0) r[k] *= (1 + graceBonus);
    }
    G._graceBonus = graceBonus;
  }

  // ===== v0.19 §七 4.5 六神被动/教派/仪式 buff 应用 =====
  if (G.deity && typeof DEITY_DATA !== 'undefined') {
    var dDef = DEITY_DATA[G.deity];
    if (dDef) {
      // 被动加成（产出乘数类）
      var dp = dDef.passive;
      if (dp._stoneM && r.stone) r.stone *= (1 + dp._stoneM);
      if (dp._brickM && r.brick) r.brick *= (1 + dp._brickM);
      if (dp._charmM && r.charm) r.charm *= (1 + dp._charmM);
      if (dp._loreM && r.lore)   r.lore *= (1 + dp._loreM);
      if (dp._scrollCraftM) G._deityScrollCraftM = dp._scrollCraftM;
      if (dp._coinM && r.coin)   r.coin *= (1 + dp._coinM);
      if (dp._gatherM) {
        if (r.berry) r.berry *= (1 + dp._gatherM);
      }
      // 月狐按主线适配
      if (dDef.passiveByLine) {
        var lineP = dDef.passiveByLine[G.mainLine] || {};
        if (lineP._hapFlat) G._deityHapFlat = (G._deityHapFlat || 0) + lineP._hapFlat;
      }
      // 被动幸福固定值（篝火神等）
      if (dp._hapFlat) G._deityHapFlat = (G._deityHapFlat || 0) + dp._hapFlat;
    }
    // 教派被动加成
    if (G.sect && typeof SECT_DATA !== 'undefined') {
      var sDef = SECT_DATA[G.sect];
      if (sDef) {
        var sp = sDef.passive;
        if (sp._baseProdM) { for (var bk of ['wood','stone','mineral']) if (r[bk]) r[bk] *= (1 + sp._baseProdM); }
        if (sp._charmM && r.charm) r.charm *= (1 + sp._charmM);
        if (sp._scrollM && r.scroll) r.scroll *= (1 + sp._scrollM);
        if (sp._coinM && r.coin) r.coin *= (1 + sp._coinM);
        if (sp._foodM && r.berry) r.berry *= (1 + sp._foodM);
        if (sp._pietyM && r.piety) r.piety *= (1 + sp._pietyM);
        if (sp._maxFoxFlat) G._deityMaxFoxFlat = (G._deityMaxFoxFlat || 0) + sp._maxFoxFlat;
      }
    }
    // 大仪式持续 buff
    if (G._deityRitualBuff) {
      var drb = G._deityRitualBuff;
      if (drb.effects._allProdM) { for (var pk of Object.keys(r)) if (r[pk] > 0) r[pk] *= (1 + drb.effects._allProdM); }
      if (drb.effects._jobEffM) G._deityJobEffBuff = drb.effects._jobEffM;
      if (drb.effects._caravanProb) G._deityCaravanBuff = drb.effects._caravanProb;
      if (drb.effects._expRewardM) G._deityExpRewardBuff = drb.effects._expRewardM;
      if (drb.effects._pollProdM) G._deityPollBuff = drb.effects._pollProdM;
    }
    // 小仪式本季 buff（存于 G._deitySmallBuff）
    if (G._deitySmallBuff && G._deitySmallBuff.season === G.season) {
      var dsb = G._deitySmallBuff.effects;
      if (dsb._bldCostM) G._deityBldCostBuff = dsb._bldCostM;
      if (dsb._charmM && r.charm) r.charm *= (1 + dsb._charmM);
      if (dsb._hapFlat) G._deityHapFlat = (G._deityHapFlat || 0) + dsb._hapFlat;
      if (dsb._loreM && r.lore) r.lore *= (1 + dsb._loreM);
      if (dsb._coinM && r.coin) r.coin *= (1 + dsb._coinM);
      if (dsb._unrestReduce) G.unrest = Math.max(0, (G.unrest || 0) - dsb._unrestReduce * dt);
      if (dsb._pollReduce) G.pollution = Math.max(0, (G.pollution || 0) - dsb._pollReduce * dt);
    }
  }

  // ===== v0.18 §六 3.6 声望系统：通达副线产出加成 =====
  if (G.upg.reputeLore?.done && G.res.renown) {
    var rn = G.res.renown.v;
    var reputeCap = G._reputeCap || 0.40;
    var reputeBonus = Math.min(reputeCap, (Math.sqrt(1 + rn / 100) - 1) * 0.40);
    if (reputeBonus > 0) {
      // 通达副线资源：仅正向产出（branch-diplomat.md 全部声誉受益资源）
      var dipRes = ['credential', 'charter', 'exotic', 'allianceSeal', 'commonPact'];
      for (const k of dipRes) if (r[k] && r[k] > 0) r[k] *= (1 + reputeBonus);
    }
    G._reputeBonus = reputeBonus;
  }

  // ===== v0.19 §七 4.4 邦交系统被动加成 =====
  if (G._alliance && G.upg.allianceInit?.done) {
    var al = G._alliance;
    var frozen = G._allianceFrozen || {};
    // 冻结检测：charter 为 0 且有维护需求 → 冻结深度 3+ 联盟
    for (var sp in al) {
      if (al[sp] >= 3) {
        if (G.res.charter && G.res.charter.v <= 0) frozen[sp] = true;
        else frozen[sp] = false;
      }
    }
    G._allianceFrozen = frozen;
    // 河獭：浅层(1-2) 基础资源(木/皮)+4%/级
    var eff_otter = frozen.otter ? Math.min(al.otter, 2) : al.otter;
    if (eff_otter >= 1) {
      var shallow = Math.min(eff_otter, 2);
      if (r.wood > 0) r.wood *= (1 + shallow * 0.04);
      if (r.leather > 0) r.leather *= (1 + shallow * 0.04);
    }
    // 白鹤：浅层 学识+5%/级+符咒+3%/级, 深层 研究速度(handled in researchCostMul)
    if (al.crane >= 1) {
      var shallow = Math.min(al.crane, 2);
      if (r.lore > 0) r.lore *= (1 + shallow * 0.05);
      if (r.charm > 0) r.charm *= (1 + shallow * 0.03);
    }
    // 旧墟遗民：浅层 古币+8%/级+远行奖励+3%/级
    if (al.ruinfolk >= 1) {
      var shallow = Math.min(al.ruinfolk, 2);
      if (r.ancCoin > 0) r.ancCoin *= (1 + shallow * 0.08);
    }
    // 山猫：浅层 竞拍减免(UI), 深层 全局+3%/级+商队来访+5%/级
    // 雪鸮：浅层 符咒+5%/级
    if (al.owl >= 1) {
      var shallow = Math.min(al.owl, 2);
      if (r.charm > 0) r.charm *= (1 + shallow * 0.05);
    }
    // 水鼠：浅层 存储+3%/级(calcMx), 深层 存储+5%/级(calcMx)
    // 考拉：浅层 幸福+2%/级(calcH), 深层 幸福+3%/级(calcH)

    // 声望系统也应用于邦书/异珍产出
    if (G._reputeBonus > 0) {
      if (r.charter > 0) r.charter *= (1 + G._reputeBonus);
      if (r.exotic > 0) r.exotic *= (1 + G._reputeBonus);
    }

    // 邦交堂 charterP 需要邦交官——建筑本身产出只在有邦交官时
    // (已通过 JD diplomat charterP 实现，建筑 charterP 需验证)

    // 会盟台领悟升级：每座额外 charterP
    var _platformCharterP = 0;
    for (var _pc in G.upgd) {
      if (G.upgd[_pc].done && UPGD[_pc]?.e?._platformCharterP) _platformCharterP += UPGD[_pc].e._platformCharterP;
    }
    if (_platformCharterP > 0 && G.bld.alliancePlatform?.c > 0) {
      r.charter = (r.charter || 0) + _platformCharterP * G.bld.alliancePlatform.c * 5;
    }

    // 异珍涌流升级
    var _exoticAllM = 0;
    for (var _ea in G.upgd) {
      if (G.upgd[_ea].done && UPGD[_ea]?.e?._exoticAllM) _exoticAllM += UPGD[_ea].e._exoticAllM;
    }
    if (_exoticAllM > 0 && r.exotic > 0) r.exotic *= (1 + _exoticAllM);

    // 广结善缘升级：4族浅盟时声誉+5%
    var _wideAlliance = 0;
    for (var _wa in G.upgd) {
      if (G.upgd[_wa].done && UPGD[_wa]?.e?._wideAlliance) _wideAlliance += UPGD[_wa].e._wideAlliance;
    }
    if (_wideAlliance > 0) {
      var allyCount = 0;
      for (var sp in al) if (al[sp] >= 1) allyCount++;
      if (allyCount >= 4 && r.renown > 0) r.renown *= 1.05;
    }

    // 结邦喜悦 buff
    if (G._allianceJoyRemain > 0) {
      for (const k of Object.keys(r)) if (r[k] > 0) r[k] *= 1.10;
    }

    // 邦交维护：深度 3+ 消耗邦书/tick
    var _maintenanceReduce = 0;
    for (var _mr in G.upgd) {
      if (G.upgd[_mr].done && UPGD[_mr]?.e?._maintenanceReduce) _maintenanceReduce += UPGD[_mr].e._maintenanceReduce;
    }
    var totalMaintenance = 0;
    for (var sp in al) {
      if (al[sp] >= 3) {
        var cost = al[sp] === 3 ? 0.002 : al[sp] === 4 ? 0.005 : al[sp] >= 5 ? 0.010 : 0;
        cost *= (1 - _maintenanceReduce);
        totalMaintenance += cost;
      }
    }
    if (totalMaintenance > 0) {
      r.charter = (r.charter || 0) - totalMaintenance;
    }
  }

  // ===== 祈福仪式：本季全职业产出 +20% =====
  if (G._blessSeason === G.season) {
    for (const k of Object.keys(r)) if (r[k] > 0) r[k] *= 1.2;
  }

  // ===== v0.18 §六 3.4 占卜年签效果（产出类） =====
  var _divEff = getDivinationEffects();
  if (_divEff) {
    var b = _divEff.bonus, p = _divEff.penalty;
    // 野莓产出
    if (b.berryM && r.berry) r.berry *= (1 + b.berryM);
    // 学识产出
    if (b.loreM && r.lore) r.lore *= (1 + b.loreM);
    if (p.loreM && r.lore) r.lore *= (1 + p.loreM);
    // 铜钱产出
    if (b.coinM && r.coin) r.coin *= (1 + b.coinM);
    if (p.coinM && r.coin) r.coin *= (1 + p.coinM);
    // 符咒产出
    if (b.charmM && r.charm) r.charm *= (1 + b.charmM);
    // 基础资源产出惩罚（锻造签）
    if (p.baseProdM) {
      if (r.berry) r.berry *= (1 + p.baseProdM);
      if (r.wood) r.wood *= (1 + p.baseProdM);
      if (r.stone) r.stone *= (1 + p.baseProdM);
    }
  }

  // ===== 信仰共鸣：每座主线建筑 +1% 虔诚产出 =====
  var _crossFaithBonus = 0;
  for (var _cf in G.upgd) {
    if (G.upgd[_cf].done && UPGD[_cf]?.e?._crossFaith) _crossFaithBonus += UPGD[_cf].e._crossFaith;
  }
  if (_crossFaithBonus > 0 && r.piety > 0) {
    var mainBldCount = 0;
    var brKey = G.policies && G.policies.branch;
    for (var bid in G.bld) {
      if (G.bld[bid].c > 0 && BD[bid] && BD[bid].br === brKey) mainBldCount += G.bld[bid].c;
    }
    r.piety *= (1 + _crossFaithBonus * mainBldCount);
  }

  // ===== v0.19 §七 4.3 教团：狂信者集体加成 =====
  if (G.job.fanatic?.c > 0) {
    var fanaticCount = G.job.fanatic.c;
    var fanaticBonusRate = 0.05;  // 每多1人 +5%
    // 升级 fanaticZeal: 提升到 +8%
    for (var _fz in G.upgd) {
      if (G.upgd[_fz].done && UPGD[_fz]?.e?._fanaticBonusRate) fanaticBonusRate += UPGD[_fz].e._fanaticBonusRate;
    }
    var fanaticMul = 1 + fanaticBonusRate * (fanaticCount - 1);
    // 更新所有狂信者的虔诚产出
    var fanaticBasePiety = JD.fanatic.e.pietyP * fanaticCount * TPD;
    r.piety = (r.piety || 0) - (JD.fanatic.e.pietyP * fanaticCount * TPD) + (fanaticBasePiety * fanaticMul);
  }

  // ===== v0.19 §七 4.3 秘仪：秘仪师效率递减 =====
  if (G.job.mysticAdept?.c > 0) {
    var mysCount = G.job.mysticAdept.c;
    var baseDecay = 0.85;
    // 升级 mysticFocus/deepMystery 缓和递减
    for (var _mf in G.upgd) {
      if (G.upgd[_mf].done && UPGD[_mf]?.e?._mysticDecayRate) baseDecay += UPGD[_mf].e._mysticDecayRate;
      if (G.upgd[_mf].done && UPGD[_mf]?.e?._mysticDecayRate2) baseDecay += UPGD[_mf].e._mysticDecayRate2;
    }
    baseDecay = Math.min(baseDecay, 1.0);  // cap at 1.0
    // 计算实际产出: 1*1.0 + 2*decay + 3*decay^2 + ...
    var totalMysticP = 0;
    for (var mi = 0; mi < mysCount; mi++) totalMysticP += JD.mysticAdept.e.gnosisP * Math.pow(baseDecay, mi);
    // 替换原有的线性产出
    r.gnosis = (r.gnosis || 0) - (JD.mysticAdept.e.gnosisP * mysCount * TPD) + (totalMysticP * TPD);
  }

  // ===== v0.19 §七 4.3 教团：圣工坊钢消耗减免 (forgeTithe 升级) =====
  if (G.bld.holyForge?.c > 0) {
    var forgeSteelReduce = 0;
    for (var _fsr in G.upgd) {
      if (G.upgd[_fsr].done && UPGD[_fsr]?.e?._forgeSteelReduce) forgeSteelReduce += UPGD[_fsr].e._forgeSteelReduce;
    }
    if (forgeSteelReduce > 0) {
      var origConsume = BD.holyForge.e.steelP * G.bld.holyForge.c * TPD;
      r.steel = (r.steel || 0) - origConsume * forgeSteelReduce;  // add back reduced portion
    }
  }

  // ===== v0.19 §七 4.3 教团：圣工坊额外虔诚 (forgeMastery 升级) =====
  if (G.bld.holyForge?.c > 0) {
    var forgeExtraPiety = 0;
    for (var _fep in G.upgd) {
      if (G.upgd[_fep].done && UPGD[_fep]?.e?._forgeExtraPiety) forgeExtraPiety += UPGD[_fep].e._forgeExtraPiety;
    }
    if (forgeExtraPiety > 0) r.piety = (r.piety || 0) + forgeExtraPiety * G.bld.holyForge.c * TPD;
  }

  // ===== v0.19 §七 4.3 教团：圣火产出全局加成 (flameBless 升级) =====
  var holyFlameAllM = 0;
  for (var _hfm in G.upgd) {
    if (G.upgd[_hfm].done && UPGD[_hfm]?.e?._holyFlameAllM) holyFlameAllM += UPGD[_hfm].e._holyFlameAllM;
  }
  if (holyFlameAllM > 0 && r.holyFlame > 0) r.holyFlame *= (1 + holyFlameAllM);

  // ===== v0.19 §七 4.3 秘仪：神露全局加成 (ambrosiaFlow 升级) =====
  var ambrosiaAllM = 0;
  for (var _aam in G.upgd) {
    if (G.upgd[_aam].done && UPGD[_aam]?.e?._ambrosiaAllM) ambrosiaAllM += UPGD[_aam].e._ambrosiaAllM;
  }
  if (ambrosiaAllM > 0 && r.ambrosia > 0) r.ambrosia *= (1 + ambrosiaAllM);

  // ===== v0.19 §七 4.3 秘仪：化神池额外秘知 (poolResonance 升级) =====
  if (G.bld.apotheosisPool?.c > 0) {
    var poolGnosisP = 0;
    for (var _pgp in G.upgd) {
      if (G.upgd[_pgp].done && UPGD[_pgp]?.e?._poolGnosisP) poolGnosisP += UPGD[_pgp].e._poolGnosisP;
    }
    if (poolGnosisP > 0) r.gnosis = (r.gnosis || 0) + poolGnosisP * G.bld.apotheosisPool.c * TPD;
  }

  // ===== v0.19 §七 4.3 教令效果应用 =====
  if (G._edicts && G._edicts.length > 0) {
    for (var ei = 0; ei < G._edicts.length; ei++) {
      var edict = G._edicts[ei];
      var edictE = edict.effects;
      if (edictE._craftAllM) {} // handled in craft system
      if (edictE._baseResM) {
        if (r.berry > 0) r.berry *= (1 + edictE._baseResM);
        if (r.wood > 0) r.wood *= (1 + edictE._baseResM);
        if (r.stone > 0) r.stone *= (1 + edictE._baseResM);
      }
      if (edictE._allProdM) {
        for (const k of Object.keys(r)) if (r[k] > 0) r[k] *= (1 + edictE._allProdM);
      }
    }
  }

  // ===== v0.19 §七 4.3 飞升门效果应用 =====
  if (G._gateEffects) {
    if (G._gateEffects._allProdM) {
      for (const k of Object.keys(r)) if (r[k] > 0) r[k] *= (1 + G._gateEffects._allProdM);
    }
    if (G._gateEffects._mysticResM && G.mainLine === 'mystic') {
      for (const k of Object.keys(r)) {
        if (r[k] > 0 && RD[k] && BD && ['spirit','fateSilk','bead','spiritInk','sigil','resonance',
          'elixir','spectrum','insight','crystalSilk','radiance','spiritCore','formSoul','spiritChart'].indexOf(k) >= 0)
          r[k] *= (1 + G._gateEffects._mysticResM);
      }
    }
  }

  // ===== v0.19 §七 4.3 飞升迷醉 buff =====
  if (G._gateEcstasyRemain > 0) {
    var ecstasyM = 0;
    for (var _ge in G.upgd) {
      if (G.upgd[_ge].done && UPGD[_ge]?.e?._gateEcstasy) ecstasyM = UPGD[_ge].e._gateEcstasy;
    }
    if (ecstasyM > 0) for (const k of Object.keys(r)) if (r[k] > 0) r[k] *= (1 + ecstasyM);
  }

  // ===== v0.19 §七 4.3 工业信条 =====
  var industryFaithBonus = 0;
  for (var _if in G.upgd) {
    if (G.upgd[_if].done && UPGD[_if]?.e?._industryFaith) industryFaithBonus += UPGD[_if].e._industryFaith;
  }
  if (industryFaithBonus > 0) {
    var iBldCount = 0;
    for (var ibid in G.bld) {
      if (G.bld[ibid].c > 0 && BD[ibid] && BD[ibid].br === 'I') iBldCount += G.bld[ibid].c;
    }
    if (iBldCount > 0) for (const k of Object.keys(r)) if (r[k] > 0) r[k] *= (1 + industryFaithBonus * iBldCount);
  }

  // 通达：文化共鸣升级 — 声誉产出 +1%/每座主线建筑
  var _crossCultureBonus = 0;
  for (var _cc in G.upgd) {
    if (G.upgd[_cc].done && UPGD[_cc]?.e?._crossCulture) _crossCultureBonus += UPGD[_cc].e._crossCulture * 0.01;
  }
  if (_crossCultureBonus > 0 && r.renown > 0) {
    var mainBldCount2 = 0;
    var brKey2 = G.policies && G.policies.branch;
    for (var bid2 in G.bld) {
      if (G.bld[bid2].c > 0 && BD[bid2] && BD[bid2].br === brKey2) mainBldCount2 += G.bld[bid2].c;
    }
    r.renown *= (1 + _crossCultureBonus * mainBldCount2);
  }

  // 季节倍率（含灵狐庇护冬季加成 + 霜藏专精 + 工业 D §八 5.1e #106 辉能供暖）
  var berrySeasonMul = SM[G.season];
  if (G.season === 3 && G.upg.spiritShelter?.done) berrySeasonMul = 0.4;
  if (G.season === 3 && G.bldSpec.warehouse === 'B') berrySeasonMul *= (1 + SPEC_BD.warehouse.B.winterBuff);
  // 工业 D §八 5.1e #106 辉能供暖：冬季野莓惩罚衰减（berrySeasonMul 向 1.0 拉近）
  if (G.season === 3 && berrySeasonMul < 1) {
    var _winterReduce = 0;
    for (var _wp in G.upgd) {
      if (G.upgd[_wp].done && UPGD[_wp]?.e?._winterPenaltyReduce) _winterReduce = Math.max(_winterReduce, UPGD[_wp].e._winterPenaltyReduce);
    }
    if (_winterReduce > 0) berrySeasonMul = berrySeasonMul + (1 - berrySeasonMul) * _winterReduce;
  }
  r.berry *= berrySeasonMul;

  // 祈雨术加成
  if (G.rainSeason === G.season) {
    var rainMul = 1.5;
    var _divRain = getDivinationEffects();
    if (_divRain && _divRain.bonus.spellBoost) rainMul += _divRain.bonus.spellBoost;
    r.berry *= rainMul;
  }

  // v0.15 节令单资源加成
  if (G.seasonRites.wine) r.berry *= 1.08;
  if (G.seasonRites.ink) r.lore *= 1.10;

  // 污染惩罚：野莓产出、学识产出
  var pTier = pollutionTier();
  if (pTier.berryM) r.berry *= (1 + pTier.berryM);
  if (pTier.loreM) r.lore *= (1 + pTier.loreM);

  // 躁念惩罚：符咒产出、学识产出
  var uTier = unrestTier();
  if (uTier.charmM) r.charm *= (1 + uTier.charmM);
  if (uTier.loreM) r.lore *= (1 + uTier.loreM);

  // 狐狸消耗野莓（外出狐狸不消耗）
  r.berry -= (G.foxes - (G.foxAway || 0)) * foxEatRate();

  // 采集者勤爪额外消耗（独立加项，不受厚韧放大）
  if (G.jobTalent.gatherer === 'A' && G.job.gatherer.c > 0)
    r.berry -= SPEC_JD.gatherer.A.extraEat * G.job.gatherer.c * TPD;

  // v0.14 习俗：守夜传统 每狐 -0.02 野莓/s（r-unit = 2× /s，故乘 0.04）
  if (G.customs && G.customs.watchNight)
    r.berry -= (G.foxes - (G.foxAway || 0)) * 0.04;

  // 鞣革坊薄削持续转化（兽皮→铜钱，不同速率）
  if (G.bldSpec.tannery === 'B' && G.res.leather.v > 0 && G.res.coin.v < G.res.coin.mx) {
    var cvt = SPEC_BD.tannery.B.convert;
    r[cvt.from] = (r[cvt.from] || 0) - cvt.drainRate * TPD;
    r[cvt.to] = (r[cvt.to] || 0) + cvt.gainRate * TPD;
  }

  // 工坊自动制作（连续速率，受限于原料产量以保证显示准确）
  // v0.19 §七 4.2: spiritWeave 灵织灵术也启用自动制作（本季，无需 craftMastery）
  // v0.19 §七 4.2: spiritWeave 灵织灵术（支持 _spellDuration 延长）
  var _spiritWeaveActive = false;
  if (G.spiritWeaveSeason >= 0) {
    var swDur = 1; // 默认持续 1 季
    for (var _swd in G.upgd) {
      if (G.upgd[_swd].done && UPGD[_swd]?.e?._spellDuration?.spiritWeave)
        swDur += UPGD[_swd].e._spellDuration.spiritWeave;
    }
    var swSeasonDiff = G.season - G.spiritWeaveSeason;
    if (swSeasonDiff < 0) swSeasonDiff += 4;
    _spiritWeaveActive = (swSeasonDiff < swDur);
  }
  if (G.upg.craftMastery?.done || _spiritWeaveActive) {
    if (!G.acOn) G.acOn = {};
    if (!G._acRates) G._acRates = {};
    if (!G._acStop) G._acStop = {};
    var fullAcRate = TPD / 50;
    // 进阶升级：自动制作速率加成（_autoCraftSpeed，如传送带 +25%）
    for (var _ac in G.upgd) {
      if (G.upgd[_ac].done && UPGD[_ac]?.e?._autoCraftSpeed) fullAcRate *= (1 + UPGD[_ac].e._autoCraftSpeed);
    }
    for (var id in CD) {
      if (!G.autoCraft[id]) { G.acOn[id] = false; G._acRates[id] = 0; G._acStop[id] = ''; continue; }
      if (!chk(CD[id].uq) || anyBranchLocked(CD[id])) { G.acOn[id] = false; G._acRates[id] = 0; G._acStop[id] = ''; continue; }

      // 检查原料是否足够启动（至少够一次制作）
      var canRun = true;
      var stopReason = '';
      for (var i = 0; i < CD[id].inp.length; i++) {
        if (G.res[CD[id].inp[i].r].v < CD[id].inp[i].a) { canRun = false; stopReason = 'input'; break; }
      }
      // 检查产出是否有空间
      if (canRun) {
        for (var i = 0; i < CD[id].out.length; i++) {
          var p = CD[id].out[i];
          if (G.res[p.r].mx > 0 && G.res[p.r].v >= G.res[p.r].mx) { canRun = false; stopReason = 'full'; break; }
        }
      }
      G.acOn[id] = canRun;
      G._acStop[id] = stopReason;
      if (!canRun) { G._acRates[id] = 0; continue; }

      // 计算可持续速率：取每种原料产量能支撑的最大制作速率的最小值
      // 最多消耗95%产量，留5%余量避免资源完全停滞
      var acRate = fullAcRate;
      var hasNegInput = false;
      for (var i = 0; i < CD[id].inp.length; i++) {
        var p = CD[id].inp[i];
        var inputRate = r[p.r] || 0;
        if (inputRate > 0) {
          var maxRate = inputRate * 0.95 / p.a;
          acRate = Math.min(acRate, maxRate);
        } else {
          hasNegInput = true;
        }
      }
      // 有原料无净产出时：若库存充足则降为慢速模式，否则停止连续制作
      if (hasNegInput) {
        var canReserve = true;
        for (var i = 0; i < CD[id].inp.length; i++) {
          if (G.res[CD[id].inp[i].r].v < CD[id].inp[i].a * 3) { canReserve = false; break; }
        }
        acRate = canReserve ? Math.min(acRate, fullAcRate * 0.25) : 0;
      }

      // v0.14 艺工坊 + 百艺通觉对彩络/醴浆/墨锭的加成（craft 速率乘数）
      var craftMul = 1;
      // v0.18 §六 3.4 占卜年签：锻造签工艺加成
      var _divCraft = getDivinationEffects();
      if (_divCraft && _divCraft.bonus.craftM) craftMul += _divCraft.bonus.craftM;
      // v0.15 双工：本季所有工坊产出 +50%（加法叠加在 craftMul 上）
      if (G.doubleCraftSeason === G.season) craftMul += 0.5;
      // 灵修灵术：织命 —— 本季所有配方产出 +80%（加法叠加在 craftMul 上）
      if (G.fateWeaveSeason === G.season) craftMul += 0.8;
      // v0.19 §七 4.2: 灵织灵术——本季自动制作，升级可提升产出
      if (_spiritWeaveActive) {
        var swBoost = 0;
        for (var _sw in G.upgd) {
          if (G.upgd[_sw].done && UPGD[_sw]?.e?._spellBoost?.spiritWeave)
            swBoost += UPGD[_sw].e._spellBoost.spiritWeave;
        }
        if (swBoost > 0) craftMul += swBoost;
      }
      // 工厂：所有配方产出 +craftAllM%/座（加法叠加，受能量供给比衰减）
      if (G.bld.factory?.c && BD.factory?.e?.craftAllM) {
        var _fcb = 0;
        for (var _fu in G.upgd) { if (G.upgd[_fu].done && UPGD[_fu]?.e?._factoryCraftBonus) _fcb += UPGD[_fu].e._factoryCraftBonus; }
        var factoryBonus = (BD.factory.e.craftAllM + _fcb) * G.bld.factory.c;
        if (G.energyRatio < 1) factoryBonus *= G.energyRatio;
        craftMul += factoryBonus;
      }
      // C阶段：精炼厂效率——合金类配方产出 +_refineryEff%/座
      if (id === 'forgeAlloy' && G.bld.refinery?.c && BD.refinery?.e?._refineryEff) {
        var refBonus = BD.refinery.e._refineryEff * G.bld.refinery.c;
        var _refUpg = _bldM['refinery'];
        if (_refUpg && _refUpg.prodM) refBonus *= (1 + _refUpg.prodM);
        if (G.energyRatio < 1) refBonus *= G.energyRatio;
        craftMul += refBonus;
      }
      // 工程师：所有配方产出 +3%/人（加法叠入 craftMul，受能量影响同工厂）
      // 受授业加成（每级 +10% 基础效率）+ 政策训练扁平加算
      if (G.job.engineer?.c) {
        var engTrain = 1 + (G.train.engineer || 0) * 0.1 + policyTrainFlat;
        var engBonus = 0.03 * G.job.engineer.c * engTrain;
        // C阶段进阶升级：工程师配方加成额外提升（_engCraftBonus，如自动化流水线 +5%）
        for (var _ecb in G.upgd) {
          if (G.upgd[_ecb].done && UPGD[_ecb]?.e?._engCraftBonus) engBonus += UPGD[_ecb].e._engCraftBonus * G.job.engineer.c * engTrain;
        }
        if (G.energyRatio < 1) engBonus *= G.energyRatio;
        craftMul += engBonus;
      }
      if (id === 'dye' || id === 'wine' || id === 'ink') {
        if (G.bld.artistry?.c && BD.artistry?.e?.craftCultureMul) {
          var artMul = G.artistryActive ? 1 : 0.5;  // v0.15.1 半效模式
          craftMul += BD.artistry.e.craftCultureMul * G.bld.artistry.c * artMul;
        }
        if (G.upg.artistryLore?.done) craftMul += 0.2;
      }
      // 进阶升级：配方产出乘数 outMul（加法叠加在 craftMul 上）
      var ucm = _craftM[id];
      if (ucm && ucm.outMul) craftMul += ucm.outMul;
      // 灵修 B 升级：灵酿坊配方加成（灵修配方 +5%/座，可被升级提升）
      if (CD[id].br === 'M' && G.bld.elixirBrewery?.c) {
        var brewBoost = (BD.elixirBrewery?.e?.craftSpiritM || 0);
        for (var _bb in G.upgd) {
          if (G.upgd[_bb].done && UPGD[_bb]?.e?._breweryBoost) brewBoost += UPGD[_bb].e._breweryBoost;
        }
        var brewMul = brewBoost * G.bld.elixirBrewery.c;
        // 自酿循环：灵液配方受灵酿坊加成 ×2
        if (id === 'elixir') {
          for (var _sbm in G.upgd) {
            if (G.upgd[_sbm].done && UPGD[_sbm]?.e?._selfBrewMul) brewMul *= UPGD[_sbm].e._selfBrewMul;
          }
        }
        craftMul += brewMul;
      }
      // 灵修 B 升级：共鸣造物（共振子每50个全配方+1%）
      for (var _rc in G.upgd) {
        if (G.upgd[_rc].done && UPGD[_rc]?.e?._resonCraftBonus) {
          craftMul += UPGD[_rc].e._resonCraftBonus * Math.floor((G.res.resonance?.v || 0) / 50);
        }
      }
      G._acRates[id] = acRate * craftMul;

      for (var i = 0; i < CD[id].inp.length; i++) {
        var p = CD[id].inp[i];
        // 进阶升级：配方原料减免 inpM（如焦煤提纯 煤耗-20%）
        var inpMul = 1;
        if (ucm && ucm.inpM && ucm.inpM[p.r]) inpMul = Math.max(0, 1 + ucm.inpM[p.r]);
        r[p.r] = (r[p.r] || 0) - p.a * inpMul * acRate * craftMul;
      }
      for (var i = 0; i < CD[id].out.length; i++) {
        var p = CD[id].out[i];
        r[p.r] = (r[p.r] || 0) + p.a * acRate * craftMul;
      }
    }
  }

  // 炉匠自动炼钢：每人每60tick消耗铁×5+煤×8产出钢×1（连续速率化）
  // 放在乘数应用之后（与自动制作并列），配方消耗不受 ironM 等研究乘数缩放
  if (G.job.smelter && G.job.smelter.c > 0) {
    var smC = G.job.smelter.c;
    var smTrain = 1 + (G.train.smelter || 0) * 0.1 + policyTrainFlat;
    // 基础速率 = TPD / 60 per day per fox（60tick 一次），乘训练/满意度/政体
    var smRate = (TPD / 60) * smC * smTrain * G.happy * polityJobMul;
    // 进阶升级：炉匠速率加成（_smelterRate，如自动给料 +50%）
    for (var _sr in G.upgd) {
      if (G.upgd[_sr].done && UPGD[_sr]?.e?._smelterRate) smRate *= (1 + UPGD[_sr].e._smelterRate);
    }
    // 季节加成：彩络节令 +5%、祖灵 +50%（与其他职业保持一致）
    if (G.seasonRites.dye) smRate *= 1.05;
    if (G.spiritSeason === G.season) smRate *= 1.5;
    // 进阶升级：炼钢配方修正（产出乘数 outMul + 原料减免 inpM）
    var smCraftM = _craftM.steel;
    var smOutMul = 1 + (smCraftM && smCraftM.outMul ? smCraftM.outMul : 0);
    // 工厂/工程师全局配方加成同样作用于炉匠炼钢（与自动制作段一致）
    if (G.bld.factory?.c && BD.factory?.e?.craftAllM) {
      var _fcb2 = 0;
      for (var _fu2 in G.upgd) { if (G.upgd[_fu2].done && UPGD[_fu2]?.e?._factoryCraftBonus) _fcb2 += UPGD[_fu2].e._factoryCraftBonus; }
      var fBonus = (BD.factory.e.craftAllM + _fcb2) * G.bld.factory.c;
      if (G.energyRatio < 1) fBonus *= G.energyRatio;
      smOutMul += fBonus;
    }
    if (G.job.engineer?.c) {
      var eBonus = 0.03 * G.job.engineer.c * (1 + (G.train.engineer || 0) * 0.1 + policyTrainFlat);
      if (G.energyRatio < 1) eBonus *= G.energyRatio;
      smOutMul += eBonus;
    }
    var smIronMul = smCraftM && smCraftM.inpM && smCraftM.inpM.iron ? Math.max(0, 1 + smCraftM.inpM.iron) : 1;
    var smCoalMul = smCraftM && smCraftM.inpM && smCraftM.inpM.coal ? Math.max(0, 1 + smCraftM.inpM.coal) : 1;
    // 仅当库存够至少一次配方且钢未满时生产
    if (G.res.iron.v >= 5 && G.res.coal.v >= 8
        && (G.res.steel.mx <= 0 || G.res.steel.v < G.res.steel.mx)) {
      r.iron = (r.iron || 0) - 5 * smIronMul * smRate;
      r.coal = (r.coal || 0) - 8 * smCoalMul * smRate;
      r.steel = (r.steel || 0) + 1 * smOutMul * smRate;
    }
  }

  // 酿灵师自动酿灵液：每人每60tick消耗灵能×15+野莓×50产出灵液×1（连续速率化）
  if (G.job.elixirBrewer && G.job.elixirBrewer.c > 0) {
    var ebC = G.job.elixirBrewer.c;
    var ebTrain = 1 + (G.train.elixirBrewer || 0) * 0.1 + policyTrainFlat;
    var ebRate = (TPD / 60) * ebC * ebTrain * G.happy * polityJobMul;
    if (G.seasonRites.dye) ebRate *= 1.05;
    if (G.spiritSeason === G.season) ebRate *= 1.5;
    // 升级#25 酿灵师心法：效率+30%
    var ebJobM = 1;
    for (var _ej in G.upgd) { if (G.upgd[_ej].done && UPGD[_ej]?.e?.jobM?.elixirBrewer) ebJobM += UPGD[_ej].e.jobM.elixirBrewer; }
    ebRate *= ebJobM;
    var ebOutMul = 1;
    var ebCraftM = _craftM.elixir;
    if (ebCraftM && ebCraftM.outMul) ebOutMul += ebCraftM.outMul;
    if (G.res.spirit.v >= 15 && G.res.berry.v >= 50
        && (G.res.elixir.mx <= 0 || G.res.elixir.v < G.res.elixir.mx)) {
      r.spirit = (r.spirit || 0) - 15 * ebRate;
      r.berry = (r.berry || 0) - 50 * ebRate;
      r.elixir = (r.elixir || 0) + 1 * ebOutMul * ebRate;
    }
  }

  for (const k of Object.keys(RD)) G.res[k].r = r[k] || 0;
}

function calcMx() {
  // 预收集进阶升级 bldMxM 和 mxM 效果（避免内层重复遍历）
  var _bldMxM = {};  // { bldId: totalMul }
  var _mxM = {};     // { resKey: totalMul }
  var _allMxPct = 0; // C阶段全资源上限百分比加成
  for (const [uid, us] of Object.entries(G.upgd)) {
    if (!us.done) continue;
    var ue = UPGD[uid] && UPGD[uid].e;
    if (!ue) continue;
    if (ue.bldMxM) { for (var bid in ue.bldMxM) _bldMxM[bid] = (_bldMxM[bid] || 0) + ue.bldMxM[bid]; }
    if (ue.mxM) { for (var rk in ue.mxM) _mxM[rk] = (_mxM[rk] || 0) + ue.mxM[rk]; }
    // C阶段：全资源上限百分比加成
    if (ue._allMxPct) _allMxPct += ue._allMxPct;
  }

  for (const [k, d] of Object.entries(RD)) {
    let mx = d.mx;
    for (const [id, s] of Object.entries(G.bld)) {
      if (!s.c) continue;
      const e = BD[id].e; if (!e) continue;
      if (e[k + 'Mx']) {
        var contrib = e[k + 'Mx'] * s.c;
        // 深窖：储藏窖上限翻倍（仅自身贡献）
        if (id === 'warehouse' && G.bldSpec.warehouse === 'A') contrib *= SPEC_BD.warehouse.A.mxMul;
        // 秘阁：藏书阁学识上限翻倍（仅自身贡献）
        if (id === 'library' && k === 'lore' && G.bldSpec.library === 'B') contrib *= SPEC_BD.library.B.loreMxMul;
        // 进阶升级：建筑存储贡献乘数 bldMxM（如加固储窖 +30%）
        if (_bldMxM[id]) contrib *= (1 + _bldMxM[id]);
        mx += contrib;
      }
    }
    // 油桶消耗品加油上限：每消耗1桶=火油上限永久+10（以 branch-industry.md 为准）
    if (k === 'oil' && G.barrelUsed) mx += G.barrelUsed * 10;
    // 灵液消耗品加灵能上限：每消耗1瓶=灵能上限永久+10（branch-mystic.md 设计）
    if (k === 'spirit' && G.elixirUsed) {
      var elixirPer = 10;
      for (var _eu in G.upgd) { if (G.upgd[_eu].done && UPGD[_eu]?.e?._elixirBonus) elixirPer += UPGD[_eu].e._elixirBonus; }
      mx += G.elixirUsed * elixirPer;
    }
    // 进阶升级：资源上限平坦加成 _flatMx（如共振子池 +100）
    for (var _fm in G.upgd) {
      if (G.upgd[_fm].done && UPGD[_fm]?.e?._flatMx && UPGD[_fm].e._flatMx[k]) mx += UPGD[_fm].e._flatMx[k];
    }
    // 霜藏：野莓上限 +50%（乘于总上限）
    if (k === 'berry' && G.bldSpec.warehouse === 'B') mx = Math.floor(mx * SPEC_BD.warehouse.B.berryMxMul);
    // v0.14 习俗：铭石礼 学识上限 +50（一次性，永久）
    if (k === 'lore' && G.customs && G.customs.nameStone) mx += 50;
    if (k === 'lore' && G.customs && G.customs.moonClass) mx += 30;
    // v0.14 习俗：谷雨宴 寒冬野莓上限 +30%
    if (k === 'berry' && G.season === 3 && G.customs && G.customs.rainFeast) mx = Math.floor(mx * 1.3);
    // v0.19 §七 4.3 永久虔诚上限加成（圣水配方）
    if (k === 'piety' && G._pietyMxPerm) mx += G._pietyMxPerm;
    // 进阶升级：资源上限乘数 mxM（如钢制储架 煤/钢上限+50%）
    if (_mxM[k] && mx > 0) mx = Math.floor(mx * (1 + _mxM[k]));
    // C阶段进阶升级：全资源上限百分比加成（_allMxPct，如钛制储罐 +20%）
    if (_allMxPct && mx > 0) mx = Math.floor(mx * (1 + _allMxPct));
    // v0.19 §七 4.4 邦交升级：邦书/异珍全局上限乘数
    if (k === 'charter') {
      var _charterMxM = 0;
      for (var _cm in G.upgd) { if (G.upgd[_cm].done && UPGD[_cm]?.e?._charterMxM) _charterMxM += UPGD[_cm].e._charterMxM; }
      if (_charterMxM > 0 && mx > 0) mx = Math.floor(mx * (1 + _charterMxM));
    }
    if (k === 'exotic') {
      var _exoticMxM = 0;
      for (var _em in G.upgd) { if (G.upgd[_em].done && UPGD[_em]?.e?._exoticMxM) _exoticMxM += UPGD[_em].e._exoticMxM; }
      if (_exoticMxM > 0 && mx > 0) mx = Math.floor(mx * (1 + _exoticMxM));
    }
    // v0.19 §七 4.4 水鼠邦交：存储上限加成
    if (G._alliance && G._alliance.ratter >= 1 && mx > 0) {
      var ratterD = G._alliance.ratter;
      var ratterBonus = Math.min(ratterD, 2) * 0.03;
      mx = Math.floor(mx * (1 + ratterBonus));
    }
    // v0.15 盈库灵术：本季所有资源上限 +30%
    if (G.overflowSeason === G.season && mx > 0) mx = Math.floor(mx * 1.3);
    G.res[k].mx = mx;
  }
  let mf = 0;
  for (const [id, s] of Object.entries(G.bld))
    if (s.c && BD[id].e?.maxFox) mf += BD[id].e.maxFox * s.c;
  G.maxFox = mf;
  // 进阶升级：狐狸上限平坦加成（_maxFoxFlat，如工业城镇 +3）
  for (var _mf in G.upgd) {
    if (G.upgd[_mf].done && UPGD[_mf]?.e?._maxFoxFlat) G.maxFox += UPGD[_mf].e._maxFoxFlat;
  }
  // 污染惩罚：狐狸上限
  var pTier = pollutionTier();
  if (pTier.maxFox) G.maxFox = Math.max(0, G.maxFox + pTier.maxFox);
  // 躁念惩罚：狐狸上限
  var uTier = unrestTier();
  if (uTier.maxFox) G.maxFox = Math.max(0, G.maxFox + uTier.maxFox);
  // v0.19 §七 4.3 飞升代价：狐狸上限减少
  if (G._gateEffects?._maxPopReduce) G.maxFox = Math.max(0, G.maxFox - G._gateEffects._maxPopReduce);
  // v0.19 §七 4.5 六神被动 + 教派：狐狸上限
  if (G.deity) {
    var dDef = DEITY_DATA[G.deity];
    if (dDef?.passive?._maxFoxFlat) G.maxFox += dDef.passive._maxFoxFlat;
    if (G._deityMaxFoxFlat) { G.maxFox += G._deityMaxFoxFlat; G._deityMaxFoxFlat = 0; }
  }
}

function calcH() {
  let h = 1;
  if (G.foxes > 5) h -= (G.foxes - 5) * 0.02;
  for (const [id, s] of Object.entries(G.bld)) {
    if (!s.c) continue;
    if (BD[id].e?.hapB) h += BD[id].e.hapB * s.c;
    // 福佑：灵狐祠额外满意度
    if (id === 'shrine' && G.bldSpec.shrine === 'A') h += SPEC_BD.shrine.A.hapBonus * s.c;
    // 神启：祈愿池 _hapFlat（基础 + poolCalm 升级加成）
    if (BD[id].e?._hapFlat) {
      var poolHapBase = BD[id].e._hapFlat;
      for (var _ph in G.upgd) {
        if (G.upgd[_ph].done && UPGD[_ph]?.e?._poolHapBonus) poolHapBase += UPGD[_ph].e._poolHapBonus;
      }
      h += poolHapBase * s.c;
    }
    // 通达：迎宾款待升级 — 迎宾堂额外幸福加成
    if (id === 'receptionHall' && s.c) {
      for (var _hh in G.upgd) {
        if (G.upgd[_hh].done && UPGD[_hh]?.e?._hallHapBonus) h += UPGD[_hh].e._hallHapBonus * s.c;
      }
    }
    // v0.19 §七 4.4 远客居安升级 — 远客居 hapB 翻倍
    if (id === 'guestQuarter' && s.c) {
      for (var _gq in G.upgd) {
        if (G.upgd[_gq].done && UPGD[_gq]?.e?.bldM?.guestQuarter?.hapM) {
          h += BD.guestQuarter.e.hapB * UPGD[_gq].e.bldM.guestQuarter.hapM * s.c;
        }
      }
    }
  }
  for (const [id, s] of Object.entries(G.upg))
    if (s.done && UD[id].e?.hapB) h += UD[id].e.hapB;
  // 山谷宴席 +15%
  if (G.feastSeason === G.season) h += 0.15;
  // 抉择事件掌印墙 +10%
  if (G.choiceBuffs && G.choiceBuffs.happySeason === G.season) h += 0.1;
  // v0.14 习俗满意度加成
  if (G.customs && G.customs.newClothes) h += 0.05;
  if (G.bonfireSeason === G.season) h += 0.03;
  if (G.silentSeason === G.season) h -= 0.03;
  // v0.18 §六 3.4 占卜年签幸福效果
  var _divH = getDivinationEffects();
  if (_divH) {
    if (_divH.bonus.hapB) h += _divH.bonus.hapB;
    if (_divH.penalty.hapB) h += _divH.penalty.hapB;
  }
  // v0.15 三全礼满意度 +5%
  if (G.seasonRites && G.seasonRites.all) h += 0.05;
  // v0.16 政体满意度效果（e=正面受政堂加成, pen=惩罚不受加成）
  if (G.polity && POLITY[G.polity]) {
    var pe = POLITY[G.polity].e || {};
    var pen = POLITY[G.polity].pen || {};
    var polityBoost = 1 + Math.min(5, G.bld.polityHall?.c || 0) * 0.05;
    if (pe.hapM) h += pe.hapM * polityBoost;
    if (pen.hapM) h += pen.hapM;
  }
  // v0.16 政策满意度效果
  if (G.policies) {
    for (var dom in G.policies) {
      var optId = G.policies[dom];
      if (!optId || !POLICY[dom] || !POLICY[dom].opts[optId]) continue;
      var pe = POLICY[dom].opts[optId].e;
      if (pe && pe.hapM) h += pe.hapM;
      var ppen = POLICY[dom].opts[optId].pen;
      if (ppen && ppen.hapM) h += ppen.hapM;
    }
  }
  // v0.16 政体变更惩罚（-20% 满意度持续 1 季）
  if (G.polityPenaltySeason === G.season && G.polityPenaltyYear === G.year) h -= 0.20;
  // 污染惩罚：幸福度
  var pTier = pollutionTier();
  if (pTier.hapM) h += pTier.hapM;
  // 躁念惩罚：幸福度
  var uTier = unrestTier();
  if (uTier.hapM) h += uTier.hapM;
  // v0.19 §七 4.4 考拉邦交：幸福加成
  if (G._alliance && G._alliance.koala >= 1) {
    var koalaD = G._alliance.koala;
    h += Math.min(koalaD, 2) * 0.02;
  }
  // v0.19 §七 4.5 六神幸福加成
  if (G._deityHapFlat) { h += G._deityHapFlat; G._deityHapFlat = 0; }
  G.happy = Math.max(0.1, Math.min(2, h));
}

// ===== v0.16 政策冷却递减（议事录已废弃 §四 1.1）=====
function councilYearlyHook(silent) {
  if (G.season !== 0) return; // 仅年初（春季第一天）
  // 政策冷却递减（保留兼容，1.3 政策不可逆化后此逻辑废弃）
  if (G.policyCooldowns) {
    for (var dom in G.policyCooldowns) {
      if (G.policyCooldowns[dom] > 0) G.policyCooldowns[dom]--;
    }
  }
}

// ===== v0.18 §六 3.4 占卜系统（年签）=====
function divinationYearlyHook(silent) {
  if (G.season !== 0) return; // 仅年初（春季第一天）
  if (!G.subBranches?.D) return; // 需要神启副线
  if (!G.upg.divineLore?.done) return; // 需要神启之学

  // 清除上一年的签
  G._divination = null;

  if (G._divYear >= G.year) return; // 本年已触发
  G._divYear = G.year;

  // 抽 3 签（从池中随机不重复选 3 个）
  var pool = [];
  for (var i = 0; i < DIVINATION_POOL.length; i++) pool.push(i);
  // Fisher-Yates shuffle then take 3
  for (var i = pool.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = pool[i]; pool[i] = pool[j]; pool[j] = tmp;
  }
  G._divDrawn = pool.slice(0, 3);

  if (silent) {
    // 离线模式：自动跳过（不选签）
    return;
  }
  // 在线模式：标记待选，tick 后由 UI 弹窗
  G._divPending = true;
}

// 获取当前年签效果（供 calcR/calcH 等使用）
function getDivinationEffects() {
  if (G._divination === null || G._divination === undefined) return null;
  return DIVINATION_POOL[G._divination] || null;
}

// ===== v0.15.1 建筑维持钩子（季节切换时调用）=====
function buildingMaintenanceHook(silent) {
  // 月歌台：每年春季(season===0)扣醴浆，1 醴浆/座/年
  if (G.season === 0 && G.bld.moonStage && G.bld.moonStage.c > 0) {
    var need = G.bld.moonStage.c;
    if (G.res.wine && G.res.wine.v >= need) {
      G.res.wine.v -= need;
      G.moonStageActive = true;
    } else {
      G.moonStageActive = false;
      if (!silent) log('月歌台的醴浆用完了，歌声渐渐安静下来……符咒产出降至 1/4。', 'warn');
    }
  }
  // 艺工坊：每季扣彩络，1 彩络/座/季
  if (G.bld.artistry && G.bld.artistry.c > 0) {
    var need = G.bld.artistry.c;
    if (G.res.dye && G.res.dye.v >= need) {
      G.res.dye.v -= need;
      G.artistryActive = true;
    } else {
      G.artistryActive = false;
      if (!silent) log('艺工坊的彩络不足，作坊减产……文化配方加成减半。', 'warn');
    }
  }
}

// ===== v0.15.1 猎手林间采风（季节切换时判定）=====
function hunterSpiceHook(silent) {
  var hunterCount = G.job.hunter?.c || 0;
  if (hunterCount <= 0) return;
  if (!G.res.spice || G.res.spice.mx <= 0) return;
  if (G.res.spice.v >= G.res.spice.mx) return;
  var trainLevel = G.train.hunter || 0;
  var prob = Math.min(0.5, 0.12 * hunterCount + 0.03 * trainLevel);
  if (Math.random() < prob) {
    G.res.spice.v = Math.min(G.res.spice.v + 1, G.res.spice.mx);
    if (!G.res.spice.on) G.res.spice.on = true;
    if (!silent) {
      var logLine = HUNTER_SPICE_LOGS[Math.floor(Math.random() * HUNTER_SPICE_LOGS.length)];
      log(logLine + '（香草 +1）', 'event');
    }
  }
}

// v0.14 习俗：季节切换钩子（被 tick 和 simulateOffline 调用）
// ===== v0.15 节令系统季节钩子 =====
// 在每次季节切换时调用：清墨契、清当前季加成、按 riteMode 应用或弹面板
function seasonRiteHook(silent) {
  // 墨契季末清零（A3：inkPact 与 inkPactBp 同时清）
  if (G.inkPact !== -1) {
    G.inkPact = -1;
    G.inkPactBp = false;
  }
  // 清当前季节令加成（旧 season 的不带过来）
  G.seasonRites = { dye: false, wine: false, ink: false, all: false };
  // 节令系统：仅 artistryLore 完成后启用
  if (!G.upg.artistryLore?.done) return;
  if (silent || G.riteMode === 'auto') {
    applySeasonRites(G.lastSeasonRites, silent);
    if (silent) {
      G.offlineRiteLog.push({
        season: G.season, year: G.year,
        applied: { dye: G.seasonRites.dye, wine: G.seasonRites.wine, ink: G.seasonRites.ink, all: G.seasonRites.all },
      });
      if (G.offlineRiteLog.length > 16) G.offlineRiteLog.shift();
    }
  } else {
    // manual mode: 触发面板
    G.pendingSeasonRites = { open: true, defaults: { ...G.lastSeasonRites } };
  }
}

function customSeasonHook(silent) {
  if (!G.customs) return;
  // 篝火夜歌：每次季节切换瞬时本季 +3% 满意度
  if (G.customs.bonfire) G.bonfireSeason = G.season;
  // 年度结算（新一年开始 = season 0）
  if (G.season === 0) {
    if (G.customs.newClothes && G.res.dye) {
      if (G.res.dye.v >= 5) G.res.dye.v -= 5;
      else {
        G.res.dye.v = 0;
        if (!silent) log('彩络不足，新衣节缩减了规模。', 'warn');
      }
    }
    if (G.customs.shareHunt && G.res.leather) {
      if (G.res.leather.v >= 30) G.res.leather.v -= 30;
      else {
        G.res.leather.v = 0;
        if (!silent) log('兽皮不足，共狩日草草收场。', 'warn');
      }
    }
    if (G.customs.nameStone && G.res.stone) {
      if (G.res.stone.v >= 20) G.res.stone.v -= 20;
      else {
        G.res.stone.v = 0;
        if (!silent) log('碎石不足，铭石礼今年没刻几个名字。', 'warn');
      }
    }
  }
}

// ===== 解锁检查 =====
// 主线路线门控：定义上的 br 字段与已选主线不匹配则锁定
function branchLocked(def) {
  if (!def || !def.br) return false;
  var chosen = G.policies && G.policies.branch;
  if (!chosen) return true; // 未选主线时全部锁定（防止工业/灵修内容泄漏到玩家视野）
  return def.br !== chosen;
}
// 副线门控：定义上的 sb 字段要求对应副线已激活
function subBranchLocked(def) {
  if (!def || !def.sb) return false;
  return !G.subBranches || !G.subBranches[def.sb];
}
// 综合门控：主线或副线任一不满足则锁定
function anyBranchLocked(def) {
  return branchLocked(def) || subBranchLocked(def);
}

function updateUnlocks() {
  for (const k of Object.keys(BD))
    if (!G.bld[k].on && !anyBranchLocked(BD[k]) && chk(BD[k].uq)) G.bld[k].on = 1;
  for (const k of Object.keys(JD))
    if (!G.job[k].on && !anyBranchLocked(JD[k]) && chk(JD[k].uq)) G.job[k].on = 1;
  for (const k of Object.keys(UD))
    if (!G.upg[k].on && !G.upg[k].done && !anyBranchLocked(UD[k]) && chk(UD[k].uq)) G.upg[k].on = 1;
  for (const k of Object.keys(UPGD))
    if (!G.upgd[k].on && !G.upgd[k].done && !anyBranchLocked(UPGD[k]) && chk(UPGD[k].uq)) G.upgd[k].on = 1;
}

// ===== 狐狸管理 =====
function rmFox() {
  if (!G.foxes) return;
  // 不移除外出狐狸
  var villageFox = G.foxes - (G.foxAway || 0);
  if (villageFox <= 0) return;
  G.foxes--;
  if (G.freeFox > 0) { G.freeFox--; return; }
  for (const k of Object.keys(G.job).reverse())
    if (G.job[k].c > 0) { G.job[k].c--; return; }
}

// ===== 离线/后台进度补算 =====
function simulateOffline(seconds) {
  // 限制最大补算时间为 24 小时
  seconds = Math.min(seconds, 86400);
  var ticksToRun = Math.floor(seconds * 1000 / TMS);
  var offlineFogCount = 0; // 限制离线灰雾事件次数
  var offlineDemonCount = 0; // 限制离线心魔事件次数
  // 静默跑 tick（不输出日志、不触发迁入）
  for (var i = 0; i < ticksToRun; i++) {
    G.tick++;
    G.day += 1 / TPD;
    if (G.day >= DPS) {
      G.day = 0;
      G.season++;
      if (G.season >= 4) { G.season = 0; G.year++; }
      // 商队离开
      if (G.caravan) { G.caravan = null; G.caravanTimer = 0; }
      // 商队到访
      if (!G.caravan && G.upg.beyondValley?.done) {
        G.caravanTimer = (G.caravanTimer || 0) + 1;
        if (G.caravanTimer >= 2 && Math.random() < caravanArrivalProb()) trySpawnCaravan(true);
      }
      // v0.14 习俗季节切换钩子（静默）
      customSeasonHook(true);
      // v0.16 议事录年度发放 + 冷却递减（静默）
      councilYearlyHook(true);
      // v0.18 §六 3.4 占卜年签（静默）
      divinationYearlyHook(true);
      // v0.15.1 建筑维持钩子（静默）
      buildingMaintenanceHook(true);
      // v0.15.1 猎手林间采风（静默）
      hunterSpiceHook(true);
      // v0.15 节令季节切换钩子（静默，离线时强制 auto 应用）
      seasonRiteHook(true);
      // v0.19 §七 4.2: _autoChart 离线季初自动编灵图（静默）
      for (var _oac in G.upgd) {
        if (G.upgd[_oac].done && UPGD[_oac]?.e?._autoChart && G.bld.chartHall?.c >= 1 && CD.drawChart) {
          var canOAC = true;
          for (var _oai = 0; _oai < CD.drawChart.inp.length; _oai++) {
            if (G.res[CD.drawChart.inp[_oai].r].v < CD.drawChart.inp[_oai].a) { canOAC = false; break; }
          }
          if (canOAC) {
            for (var _oai2 = 0; _oai2 < CD.drawChart.inp.length; _oai2++) G.res[CD.drawChart.inp[_oai2].r].v -= CD.drawChart.inp[_oai2].a;
            for (var _oao = 0; _oao < CD.drawChart.out.length; _oao++) {
              var po = CD.drawChart.out[_oao];
              G.res[po.r].v = Math.min(G.res[po.r].v + po.a, G.res[po.r].mx > 0 ? G.res[po.r].mx : Infinity);
            }
          }
        }
      }
    }
    updateUnlocks();
    // 灰雾禁用恢复（静默）
    if (G.fogDisabled && G.fogDisabled.length) {
      G.fogDisabled = G.fogDisabled.filter(function(e) { return G.tick < e.endTick; });
    }
    // 心魔禁用恢复（静默）
    if (G.demonDisabled && G.demonDisabled.length) {
      G.demonDisabled = G.demonDisabled.filter(function(e) { return G.tick < e.endTick; });
    }
    // 灵术冷却递减（静默）
    if (G.spellCooldowns) {
      for (var scId in G.spellCooldowns) {
        if (G.spellCooldowns[scId] <= G.tick) delete G.spellCooldowns[scId];
      }
    }
    applyFogDisabled();
    applyDemonDisabled();
    calcMx();
    calcH();
    calcEnergy();
    calcLeyline();
    calcPollution();
    calcUnrest();
    calcR();
    // 恢复禁用建筑（LIFO 顺序）
    restoreDemonDisabled();
    restoreFogDisabled();
    for (var k in G.res) {
      var s = G.res[k];
      if (!s.on) continue;
      s.v += s.r / TPD;
      if (s.mx > 0) s.v = Math.min(s.v, s.mx);
      if (s.v < 0) {
        s.v = 0;
        if (k === 'berry' && G.foxes > 0 && G.tick % 50 === 0) rmFox();
      }
    }
    // 灰雾事件（静默，离线最多触发 3 次）
    if (offlineFogCount < 3 && Math.random() < 0.00017) { tryGreyFog(true); offlineFogCount++; }
    // 心魔事件（静默，离线最多触发 3 次）
    if (offlineDemonCount < 3 && Math.random() < 0.00017) { tryInnerDemon(true); offlineDemonCount++; }
    // 狐狸迁入（降低概率避免离线刷狐狸）
    if (G.foxes < G.maxFox && G.res.berry.v > 20 && Math.random() < 0.015)
      G.foxes++;
    G.freeFox = G.foxes - (G.foxAway || 0) - Object.values(G.job).reduce(function(s, j) { return s + j.c; }, 0);
    // 远行倒计时（静默）
    tickExpeditions(true);
    // 工坊自动制作：连续速率在 calcR() 中处理（v0.13.2 移除了 runAutoCraft 离散批次）
    // 商队季节到期在季节更替中处理
    // v0.15.1 商贩路边生意（离线累积，静默）
    if ((G.job.merchant?.c || 0) > 0 && G.bld.tradePost?.c > 0) {
      var trainB = 1 + (G.train.merchant || 0) * 0.1;
      var talentMul = 1;
      if (G.jobTalent.merchant && SPEC_JD.merchant && SPEC_JD.merchant[G.jobTalent.merchant]) {
        var td = SPEC_JD.merchant[G.jobTalent.merchant];
        if (td.prodMul) talentMul = td.prodMul;
      }
      var coinRate = JD.merchant.e.coinP * G.job.merchant.c * trainB * G.happy * talentMul;
      G.merchantSpiceAcc += coinRate / TPD;
      if (G.merchantSpiceAcc >= 15) {
        G.merchantSpiceAcc -= 15;
        if (G.res.spice && G.res.spice.mx > 0 && G.res.spice.v < G.res.spice.mx && Math.random() < 0.35) {
          G.res.spice.v = Math.min(G.res.spice.v + 1, G.res.spice.mx);
          if (!G.res.spice.on) G.res.spice.on = true;
        }
      }
    }
  }
  // 显示补算结果（离开不足 5 分钟不提示——浏览器后台标签节流的 30-90 秒小 gap 静默补算，
  // 避免日志被「离开了 59 秒」刷屏）
  if (seconds < 300) return;
  var mins = Math.floor(seconds / 60);
  var hrs = Math.floor(mins / 60);
  var msg;
  if (hrs > 0) msg = '离开了 ' + hrs + ' 小时 ' + (mins % 60) + ' 分钟';
  else if (mins > 0) msg = '离开了 ' + mins + ' 分钟';
  else msg = '离开了 ' + Math.floor(seconds) + ' 秒';
  log(msg + '，资源已自动补算。', 'important');
  // 显示离线期间返回的远行
  if (G.pendingNarr && G.pendingNarr.length) {
    for (var i = 0; i < G.pendingNarr.length; i++)
      log(G.pendingNarr[i], 'echo');
    G.pendingNarr = [];
  }
  // v0.15 节令离线总结
  if (G.offlineRiteLog && G.offlineRiteLog.length) {
    var consumed = { dye: 0, wine: 0, ink: 0 };
    var trinityCount = 0;
    var seasonsCount = G.offlineRiteLog.length;
    for (var i = 0; i < G.offlineRiteLog.length; i++) {
      var rec = G.offlineRiteLog[i];
      if (rec.applied?.dye) consumed.dye++;
      if (rec.applied?.wine) consumed.wine++;
      if (rec.applied?.ink) consumed.ink++;
      if (rec.applied?.all) trinityCount++;
    }
    var parts = [];
    if (consumed.dye > 0) parts.push('彩络 -' + consumed.dye);
    if (consumed.wine > 0) parts.push('醴浆 -' + consumed.wine);
    if (consumed.ink > 0) parts.push('墨锭 -' + consumed.ink);
    if (parts.length) {
      var rmsg = '离开期间 ' + seasonsCount + ' 季节令均按上次设置应用（' + parts.join('，') + '）';
      if (trinityCount > 0) rmsg += '；其中 ' + trinityCount + ' 季三全礼生效';
      log(rmsg, 'event');
    } else {
      log('离开期间 ' + seasonsCount + ' 季节令均因资源不足跳过。', 'warn');
    }
    G.offlineRiteLog = [];
  }
}

// ===== §五 2.9 成就系统 =====
function unlockAchievement(id) {
  if (!G.achievements) G.achievements = {};
  if (G.achievements[id]) return;
  var ad = ACHIEVEMENT_DATA[id];
  if (!ad) return;
  G.achievements[id] = Date.now();
  log('成就达成：' + ad.n + '——' + ad.d, 'important');
}

function checkAchievements() {
  var a = ACHIEVEMENT_DATA;
  var totalBld = 0;
  for (var bk in G.bld) totalBld += (G.bld[bk]?.c || 0);
  var totalExpDone = 0;
  for (var ek in (G.expDone || {})) totalExpDone += G.expDone[ek];
  var totalUpgd = 0;
  for (var uk in (G.upgd || {})) if (G.upgd[uk].done) totalUpgd++;
  var actCustom = 0;
  for (var ck in (G.customs || {})) if (G.customs[ck]) actCustom++;
  var policyCount = 0;
  for (var pk in (G.policies || {})) if (G.policies[pk]) policyCount++;

  // 阶段一
  if (totalBld >= 1) unlockAchievement('firstBuild');
  if (G.foxes >= 5) unlockAchievement('pop5');
  if (G.foxes >= 20) unlockAchievement('pop20');
  if (G.foxes >= 50) unlockAchievement('pop50');
  var anyResearch = false;
  for (var rk in G.upg) if (G.upg[rk].done) { anyResearch = true; break; }
  if (anyResearch) unlockAchievement('firstResearch');
  if (G._achFirstCraft) unlockAchievement('firstCraft');
  if (G._achFirstTrade) unlockAchievement('firstTrade');
  if (totalExpDone >= 1) unlockAchievement('firstExpedition');
  if (actCustom >= 1) unlockAchievement('firstCustom');
  if (actCustom >= 5) unlockAchievement('custom5');
  if ((G.res.berry?.v || 0) >= 3000) unlockAchievement('berryHoard');
  if ((G.res.lore?.v || 0) >= 100) unlockAchievement('lore100');
  if ((G.res.scroll?.v || 0) >= 50) unlockAchievement('scroll50');
  if (G.polity) unlockAchievement('firstPolity');
  if (policyCount >= 1) unlockAchievement('firstPolicy');

  // 阶段二
  if (G.mainLine) unlockAchievement('branchChosen');
  var chosenBr = G.policies && G.policies.branch;
  if (chosenBr === 'I') {
    if ((G.res.coal?.v || 0) >= 10) unlockAchievement('coal10');
    if ((G.res.steel?.v || 0) >= 5) unlockAchievement('steel5');
    if ((G.bld.mine?.c || 0) >= 3) unlockAchievement('mine3');
    if (typeof pollutionTier === 'function') { var pt = pollutionTier(); if (pt && pt.i >= 1) unlockAchievement('pollTier1'); }
  }
  if (chosenBr === 'M') {
    if ((G.res.spirit?.v || 0) >= 10) unlockAchievement('spirit10');
    if ((G.res.fateSilk?.v || 0) >= 5) unlockAchievement('fateSilk5');
    if ((G.bld.spiritWell?.c || 0) >= 3) unlockAchievement('spiritWell3');
    if (typeof unrestTier === 'function') { var ut = unrestTier(); if (ut && ut.i >= 1) unlockAchievement('unrestTier1'); }
    if (G._achFirstSpell) unlockAchievement('firstSpell');
    // 也通过灵术状态标记推断
    if (G.spellCooldowns) { for (var sk in G.spellCooldowns) { unlockAchievement('firstSpell'); break; } }
  }
  if (totalUpgd >= 5) unlockAchievement('upgd5');
  if (G.year >= 10) unlockAchievement('year10');
  if (G.year >= 50) unlockAchievement('year50');
  if (totalExpDone >= 3) unlockAchievement('expDone3');
  if (totalBld >= 20) unlockAchievement('bld20');
}

// ===== 主循环 =====
function tick() {
  // 检测后台切回 / 浏览器节流：如果距上次 tick 超过 1.5 秒（>7 个正常 tick），补算
  // 浏览器隐藏标签时通常将 setInterval 节流到 ≤1Hz，导致游戏内时间停滞
  var now = Date.now();
  var gap = (now - lastRealTime) / 1000;
  lastRealTime = now;
  if (gap > 1.5) {
    simulateOffline(gap - TMS / 1000);
    rAll();
    return;
  }

  G.tick++;
  G.day += 1 / TPD;

  // 灰雾禁用恢复
  if (G.fogDisabled && G.fogDisabled.length) {
    var prevLen = G.fogDisabled.length;
    G.fogDisabled = G.fogDisabled.filter(function(e) { return G.tick < e.endTick; });
    if (G.fogDisabled.length < prevLen) log('灰雾消散，受损的建筑恢复了运作。', 'event');
  }
  // 心魔禁用恢复
  if (G.demonDisabled && G.demonDisabled.length) {
    var prevDLen = G.demonDisabled.length;
    G.demonDisabled = G.demonDisabled.filter(function(e) { return G.tick < e.endTick; });
    if (G.demonDisabled.length < prevDLen) log('心魔消退，受损的设施恢复了运作。', 'event');
  }

  // 灵术冷却递减（每 tick 自动过期）
  if (G.spellCooldowns) {
    for (var scId in G.spellCooldowns) {
      if (G.spellCooldowns[scId] <= G.tick) delete G.spellCooldowns[scId];
    }
  }

  // 季节更替
  if (G.day >= DPS) {
    G.day = 0;
    G.season++;
    if (G.season >= 4) { G.season = 0; G.year++; }
    log(SN[G.season] + '来临了。（第' + G.year + '年）', 'important');
    if (G.season === 3 && G.foxes > 0)
      log('寒冬降至，野莓产量骤降！', 'warn');
    // 商队离开（停留1季后自动离开）
    if (G.caravan) {
      var cv = CVD[G.caravan.id];
      log(cv ? cv.leaveLog : '商队离开了。', 'event');
      G.caravan = null;
      G.caravanTimer = 0;
    }
    // 商队到访检查
    if (!G.caravan && G.upg.beyondValley?.done) {
      G.caravanTimer = (G.caravanTimer || 0) + 1;
      if (G.caravanTimer >= 2 && Math.random() < caravanArrivalProb()) {
        trySpawnCaravan();
      }
    }
    // v0.14 习俗季节切换钩子
    customSeasonHook(false);
    // v0.16 议事录年度发放 + 冷却递减
    councilYearlyHook(false);
    // v0.18 §六 3.4 占卜年签
    divinationYearlyHook(false);
    // v0.15.1 建筑维持钩子
    buildingMaintenanceHook(false);
    // v0.15.1 猎手林间采风
    hunterSpiceHook(false);
    // v0.15 节令季节切换钩子
    seasonRiteHook(false);
    // 神启仪式冷却重置（每季初）
    if (G._ritualCD) {
      for (var rk in G._ritualCD) {
        if (G._ritualCD[rk] > 0) G._ritualCD[rk]--;
      }
    }
    // v0.19 §七 4.3 教令系统 tick（每季扣减持续时间）
    if (G._edicts && G._edicts.length > 0) {
      var expiredEdicts = [];
      for (var edI = G._edicts.length - 1; edI >= 0; edI--) {
        G._edicts[edI].remaining--;
        if (G._edicts[edI].remaining <= 0) {
          expiredEdicts.push(G._edicts[edI].id);
          G._edicts.splice(edI, 1);
        }
      }
      for (var exI = 0; exI < expiredEdicts.length; exI++) {
        var exDef = EDICT_DEF[expiredEdicts[exI]];
        log((exDef ? exDef.n : '教令') + '已到期。', 'event');
      }
    }
    // 教令冷却递减
    if (G._edictCD) {
      for (var eck in G._edictCD) {
        if (G._edictCD[eck] > 0) G._edictCD[eck]--;
      }
    }
    // v0.19 §七 4.3 飞升迷醉 buff 递减
    if (G._gateEcstasyRemain > 0) G._gateEcstasyRemain--;
    // v0.19 §七 4.4 结邦喜悦 buff 递减
    if (G._allianceJoyRemain > 0) G._allianceJoyRemain--;
    // v0.19 §七 4.5 六神系统：改宗冷却 + 仪式冷却 + 大仪式 buff 递减
    if (G.deityCD > 0) G.deityCD--;
    if (G._deityRitualCD) {
      for (var drk in G._deityRitualCD) {
        if (G._deityRitualCD[drk] > 0) G._deityRitualCD[drk]--;
      }
    }
    if (G._deityRitualBuff && G._deityRitualBuff.remain > 0) {
      G._deityRitualBuff.remain--;
      if (G._deityRitualBuff.remain <= 0) {
        var expName = DEITY_RITUAL_DATA[G._deityRitualBuff.id]?.n || '仪式';
        log(expName + '效果已消退。', 'event');
        G._deityRitualBuff = null;
      }
    }
    // v0.19 §七 4.2 灵修 C 升级：_autoChart（每季初自动施放一次基础编灵图）
    for (var _ac in G.upgd) {
      if (G.upgd[_ac].done && UPGD[_ac]?.e?._autoChart) {
        // 检查灵图阁 ≥ 1 且有对应配方的原料
        if (G.bld.chartHall?.c >= 1 && CD.drawChart) {
          var canAuto = true;
          for (var _ai = 0; _ai < CD.drawChart.inp.length; _ai++) {
            var p = CD.drawChart.inp[_ai];
            if (G.res[p.r].v < p.a) { canAuto = false; break; }
          }
          if (canAuto) {
            for (var _ai2 = 0; _ai2 < CD.drawChart.inp.length; _ai2++) {
              var p2 = CD.drawChart.inp[_ai2];
              G.res[p2.r].v -= p2.a;
            }
            for (var _ao = 0; _ao < CD.drawChart.out.length; _ao++) {
              var po = CD.drawChart.out[_ao];
              G.res[po.r].v = Math.min(G.res[po.r].v + po.a, G.res[po.r].mx > 0 ? G.res[po.r].mx : Infinity);
            }
            log('灵图阁自动编制了一批灵图。', 'info');
          }
        }
      }
    }
  }

  // v0.18 §六 3.4 占卜弹窗（季节切换后触发，避免在季节块内弹）
  if (G._divPending) {
    showDivinationModal();
    G._divPending = false;
  }

  updateUnlocks();
  applyFogDisabled();
  applyDemonDisabled();
  calcMx();
  calcH();
  calcEnergy();
  calcLeyline();
  // 能量不足警告（每 200 tick ≈ 40 秒提醒一次）
  if (G.energyNet < 0 && G.tick % 200 === 0) {
    log('能量供给不足！耗能建筑产出衰减至 ' + Math.round(G.energyRatio * 100) + '%。', 'warn');
  }
  // 灵脉不足警告（每 200 tick ≈ 40 秒提醒一次）
  if (G.leylineNet < 0 && G.tick % 200 === 0) {
    log('灵脉供给不足！耗灵建筑产出衰减至 ' + Math.round(G.leylineRatio * 100) + '%。', 'warn');
  }
  calcPollution();
  calcUnrest();
  // 污染警告（每 500 tick ≈ 100 秒提醒一次）
  if (effectivePollution() >= 31 && G.tick % 500 === 0) {
    var tier = pollutionTier();
    log('污染等级：' + tier.n + '。工业废气正在影响山谷。', 'warn');
  }
  // 躁念警告（每 500 tick ≈ 100 秒提醒一次）
  if (effectiveUnrest() >= 31 && G.tick % 500 === 0) {
    var uTier = unrestTier();
    log('躁念等级：' + uTier.n + '。灵修失衡正在扰乱山谷。', 'warn');
  }
  calcR();
  // 恢复禁用建筑（LIFO 顺序：后 apply 的先 restore，避免重叠建筑计数错误）
  restoreDemonDisabled();
  restoreFogDisabled();

  // 资源增长
  for (const [k, s] of Object.entries(G.res)) {
    if (!s.on) continue;
    s.v += s.r / TPD;
    if (s.mx > 0) s.v = Math.min(s.v, s.mx);
    if (s.v < 0) {
      s.v = 0;
      if (k === 'berry' && G.foxes > 0 && G.tick % 50 === 0) {
        log('狐狸们饿肚子了！一只村民离开了山谷。', 'warn');
        rmFox();
      }
    }
  }

  // 狐狸迁入
  var foxProb = 0.015;
  if (G.foxes < G.maxFox && G.res.berry.v > 20 && Math.random() < foxProb) {
    G.foxes++;
    log('一只流浪小狐狸被莓果香味吸引，加入了村落！', 'important');
  }

  G.freeFox = G.foxes - (G.foxAway || 0) - Object.values(G.job).reduce((s, j) => s + j.c, 0);

  // 远行倒计时
  tickExpeditions();

  // 工坊自动制作：连续速率已在 calcR() 中处理（之前还有一份 runAutoCraft 离散批次造成 2x 双计数，已移除）

  // 山谷见闻
  if (Math.random() < 0.0003) tryEvent();

  // 世界的回响（极稀有叙事，约 3 小时一次）
  if (Math.random() < 0.00002) tryWorldEcho();

  // 遗光被动掉落（极低概率，约每 55 分钟一次）
  if (Math.random() < 0.00006) tryRemnant();

  // 灰雾事件（有效污染 ≥ 150，约每 20 分钟一次 ≈ 0.00017/tick）
  if (Math.random() < 0.00017) tryGreyFog(false);

  // 心魔事件（有效躁念 ≥ 150，约每 20 分钟一次 ≈ 0.00017/tick）
  if (Math.random() < 0.00017) tryInnerDemon(false);

  // v0.15.1 商贩路边生意：累积铜钱产率 → 阈值触发 → 35% 概率获香草
  if ((G.job.merchant?.c || 0) > 0 && G.bld.tradePost?.c > 0) {
    // 实际铜钱产率（含授业、满意度）
    var trainB = 1 + (G.train.merchant || 0) * 0.1;
    var talentMul = 1;
    if (G.jobTalent.merchant && SPEC_JD.merchant && SPEC_JD.merchant[G.jobTalent.merchant]) {
      var td = SPEC_JD.merchant[G.jobTalent.merchant];
      if (td.prodMul) talentMul = td.prodMul;
    }
    var coinRate = JD.merchant.e.coinP * G.job.merchant.c * trainB * G.happy * talentMul;
    G.merchantSpiceAcc += coinRate / TPD;
    if (G.merchantSpiceAcc >= 15) {
      G.merchantSpiceAcc -= 15;
      if (G.res.spice && G.res.spice.mx > 0 && G.res.spice.v < G.res.spice.mx && Math.random() < 0.35) {
        G.res.spice.v = Math.min(G.res.spice.v + 1, G.res.spice.mx);
        if (!G.res.spice.on) G.res.spice.on = true;
        var slog = MERCHANT_SPICE_LOGS[Math.floor(Math.random() * MERCHANT_SPICE_LOGS.length)];
        log(slog + '（香草 +1）', 'event');
      } else if (G.res.spice && G.res.spice.mx > 0) {
        var flog = MERCHANT_SPICE_FAIL_LOGS[Math.floor(Math.random() * MERCHANT_SPICE_FAIL_LOGS.length)];
        log(flog, 'echo');
      }
    }
  }

  // §五 2.9 成就检查（每 50 tick ≈ 10 秒检查一次）
  if (G.tick % 50 === 0) checkAchievements();
}

function tryEvent() {
  // 筛选符合条件的事件
  var pool = [];
  for (var i = 0; i < ED.length; i++) {
    var ev = ED[i];
    if (ev.uq && !chk(ev.uq)) continue;
    if (ev.s && ev.s.indexOf(G.season) === -1) continue;
    if (anyBranchLocked(ev)) continue;  // §五 2.5: 分支门控
    pool.push(ev);
  }
  if (!pool.length) return;
  // 按权重随机
  var total = 0;
  for (var i = 0; i < pool.length; i++) total += (pool[i].w || 1);
  var roll = Math.random() * total;
  var sum = 0;
  var picked = pool[0];
  for (var i = 0; i < pool.length; i++) {
    sum += (pool[i].w || 1);
    if (roll < sum) { picked = pool[i]; break; }
  }
  // 应用效果
  var rewards = [];
  if (picked.e) {
    for (var k in picked.e) {
      if (G.res[k]) {
        G.res[k].v += picked.e[k];
        if (!G.res[k].on) G.res[k].on = true;
        if (G.res[k].mx > 0) G.res[k].v = Math.min(G.res[k].v, G.res[k].mx);
        var sign = picked.e[k] >= 0 ? '+' : '';
        rewards.push(RD[k].n + ' ' + sign + picked.e[k]);
      }
    }
  }
  var msg = picked.t;
  if (rewards.length) msg += '（' + rewards.join('，') + '）';
  var hasRemnant = picked.e && picked.e.remnant;
  log(msg, hasRemnant ? 'echo' : 'event');
}

function tryRewardEvent() {
  // 筛选有数值奖励且符合条件的事件
  var pool = [];
  for (var i = 0; i < ED.length; i++) {
    var ev = ED[i];
    if (!ev.e) continue; // 必须有数值奖励
    if (ev.uq && !chk(ev.uq)) continue;
    if (ev.s && ev.s.indexOf(G.season) === -1) continue;
    if (anyBranchLocked(ev)) continue;  // §五 2.5: 分支门控
    pool.push(ev);
  }
  if (!pool.length) return;
  var picked = pool[Math.floor(Math.random() * pool.length)];
  var rewards = [];
  for (var k in picked.e) {
    if (G.res[k]) {
      G.res[k].v += picked.e[k];
      if (!G.res[k].on) G.res[k].on = true;
      if (G.res[k].mx > 0) G.res[k].v = Math.min(G.res[k].v, G.res[k].mx);
      var sign = picked.e[k] >= 0 ? '+' : '';
      rewards.push(RD[k].n + ' ' + sign + picked.e[k]);
    }
  }
  var msg = picked.t;
  if (rewards.length) msg += '（' + rewards.join('，') + '）';
  var hasRemnant = picked.e && picked.e.remnant;
  log(msg, hasRemnant ? 'echo' : 'event');
}

function tryWorldEcho() {
  var pool = [];
  for (var i = 0; i < WD.length; i++) {
    if (WD[i].s !== undefined && WD[i].s !== G.season) continue;  // 有季节限定时按季节过滤
    if (WD[i].uq && !chk(WD[i].uq)) continue;  // §五 2.5: 解锁条件过滤
    if (anyBranchLocked(WD[i])) continue;  // §五 2.5: 分支门控
    pool.push(WD[i]);
  }
  if (!pool.length) return;
  var picked = pool[Math.floor(Math.random() * pool.length)];
  log(picked.t, 'echo');
}

function tryRemnant() {
  var s = G.res.remnant;
  if (!s) return;
  if (s.mx > 0 && s.v >= s.mx) return;
  s.v += 1;
  if (!s.on) s.on = true;
  var msg = REMNANT_LOGS[Math.floor(Math.random() * REMNANT_LOGS.length)];
  log(msg + '（遗光 +1）', 'echo');
}
// 重置 G 到初始骨架（保留引用，清除所有属性后填入默认值）
function resetG() {
  for (var k in G) delete G[k];
  G.tick = 0; G.year = 1; G.season = 0; G.day = 0;
  G.res = {}; G.bld = {}; G.job = {}; G.upg = {}; G.upgd = {};
  G.foxes = 0; G.maxFox = 0; G.freeFox = 0; G.happy = 1;
  G.rainSeason = -1; G.spiritSeason = -1; G.harvestSeason = -1;
  G.energyProd = 0; G.energyCons = 0; G.energyNet = 0; G.energyRatio = 1;
  G.barrelUsed = 0;
  G.elixirUsed = 0;
  // 污染系统
  G.pollution = 0; G.pollutionRate = 0; G.fogDisabled = [];
  // 灵脉系统
  G.leylineProd = 0; G.leylineCons = 0; G.leylineNet = 0; G.leylineRatio = 1;
  G.leylineDebuff = 0;
  // 躁念系统
  G.unrest = 0; G.unrestRate = 0; G.demonDisabled = [];
  G.train = {}; G.autoCraft = {}; G.acOn = {};
  G.foxAway = 0; G.expDone = {}; G.expeditions = [];
  G.pendingNarr = []; G.narratives = { oldRuin: [], cloudRidge: [] };
  G.feastSeason = -1; G.tradeWindYear = -1;
  G.caravan = null; G.caravanTimer = 0;
  G.pendingChoice = null; G.choicesDone = []; G.choiceBuffs = {};
  // v0.12.0 图纸与专精
  G.blueprints = []; G.bldSpec = {}; G.jobTalent = {};
  // v0.14 风俗与习俗
  G.customs = {}; G.bonfireSeason = -1; G.silentSeason = -1; G.springExpDone = 0;
  // v0.15 节令系统
  G.seasonRites = { dye: false, wine: false, ink: false, all: false };
  G.lastSeasonRites = {};
  // 灵修灵术冷却
  G.spellCooldowns = {}; G.tidePullSeason = -1; G.fateWeaveSeason = -1;
  G.resonWaveSeason = -1; G.shapeFoxSeason = -1; G.shapeFoxExtra = 0; G.sageUtterActive = false;
  // v0.19 灵修 C 阶段灵术
  G.spiritWeaveSeason = -1; G.starSenseSeason = -1;
  // v0.16 政体与政策
  G.polity = null; G.polityChanges = 0;
  G.polityPenaltySeason = -1; G.polityPenaltyYear = -1;
  G.policies = {}; G.policyCooldowns = {};
  G.tier1 = null;
  // v0.16 副线
  G.subBranches = {};
  // v0.16 阶段门控
  G.phase = 0;
  // v0.17 主线
  G.mainLine = null;
  // v0.17 §五 2.8 离线收益
  G.lastSaveTime = Date.now();
  G.offlineGains = null;
  // v0.18 神启副线
  G._graceBonus = 0; G._graceCap = 0.50;
  G._ritualCD = {}; G._blessSeason = -1;
  // v0.19 教团：教令系统
  G._edicts = []; G._edictCD = {}; G._edictCDReduce = 0;
  G._holyGearBonus = 0; G._pietyMxPerm = 0;
  // v0.19 秘仪：飞升阶梯
  G._gates = 0; G._gateEffects = {}; G._gateDiscount = 0;
  G._gateEcstasyRemain = 0;
  // v0.18 §六 3.4 占卜系统
  G._divination = null;   // 当前年签 index（null=未选/跳过）
  G._divYear = -1;        // 上次占卜的年份（防重复触发）
  G._divPending = false;  // 是否有待选签（用于弹窗触发）
  G._divDrawn = [];       // 当年抽到的 3 签索引
  // v0.18 §六 3.6 通达副线
  G._reputeBonus = 0; G._reputeCap = 0.40;
  // v0.19 §七 4.4 邦交系统
  G._alliance = { otter: 0, crane: 0, ruinfolk: 0, lynx: 0, owl: 0, ratter: 0, koala: 0 };
  G._allianceFavor = { otter: 0, crane: 0, ruinfolk: 0, lynx: 0, owl: 0, ratter: 0, koala: 0 };
  G._allianceFrozen = {};
  G._allianceJoyRemain = 0;  // 结邦喜悦剩余季数
  // v0.19 §七 4.5 六神系统
  G.deity = null; G.sect = null; G.deityCD = 0;
  G._deityRitualCD = {}; G._deityRitualBuff = null; G._deitySmallBuff = null;
}
function migrate() {
  // v0.8.1: 移除草药系统
  if (G.res.herb) delete G.res.herb;
  if (G.bld.herbGarden) delete G.bld.herbGarden;
  if (G.job.herbalist) {
    // 释放药师为闲置狐狸
    G.freeFox = (G.freeFox || 0) + (G.job.herbalist.c || 0);
    delete G.job.herbalist;
  }
  if (G.upg.herbalWisdom) delete G.upg.herbalWisdom;

  // v0.16: 灵修建筑 ID 重命名（spiritSpring→spiritWell, leylineArray→leyArray）
  if (G.bld.spiritSpring) {
    G.bld.spiritWell = G.bld.spiritSpring;
    delete G.bld.spiritSpring;
  }
  if (G.bld.leylineArray) {
    G.bld.leyArray = G.bld.leylineArray;
    delete G.bld.leylineArray;
  }
  // 修复引用旧 ID 的建筑专精
  if (G.bldSpec) {
    if (G.bldSpec.spiritSpring) { G.bldSpec.spiritWell = G.bldSpec.spiritSpring; delete G.bldSpec.spiritSpring; }
    if (G.bldSpec.leylineArray) { G.bldSpec.leyArray = G.bldSpec.leylineArray; delete G.bldSpec.leylineArray; }
  }

  // v0.17 §五 2.3: 灵修职业 ID 重命名（spiritChanneler→spiritSenser，E48）
  if (G.job.spiritChanneler) {
    G.job.spiritSenser = G.job.spiritChanneler;
    delete G.job.spiritChanneler;
  }
  if (G.train && G.train.spiritChanneler !== undefined) {
    G.train.spiritSenser = G.train.spiritChanneler;
    delete G.train.spiritChanneler;
  }
  if (G.jobTalent && G.jobTalent.spiritChanneler !== undefined) {
    G.jobTalent.spiritSenser = G.jobTalent.spiritChanneler;
    delete G.jobTalent.spiritChanneler;
  }

  // v0.8.2: 先祖之眼效果变更（foxProb → foxEat）
  // 无需特殊处理，旧效果 key 不影响运行

  // v0.8.3: 新增 spiritSeason, harvestSeason
  if (G.spiritSeason === undefined) G.spiritSeason = -1;
  if (G.harvestSeason === undefined) G.harvestSeason = -1;

  // 能量系统（即产即消，非存档持久值，每 tick 重算）
  G.energyProd = G.energyProd || 0;
  G.energyCons = G.energyCons || 0;
  G.energyNet = G.energyNet || 0;
  G.energyRatio = G.energyRatio ?? 1;

  // 油桶消耗计数（旧存档迁移：将已有库存油桶转化为已消耗数量）
  if (G.barrelUsed === undefined) {
    G.barrelUsed = (G.res.barrel && G.res.barrel.on) ? Math.floor(G.res.barrel.v || 0) : 0;
    if (G.res.barrel) G.res.barrel.v = 0;
  }

  // 灵液消耗计数（旧存档迁移：将已有库存灵液转化为已消耗数量）
  if (G.elixirUsed === undefined) {
    G.elixirUsed = (G.res.elixir && G.res.elixir.on) ? Math.floor(G.res.elixir.v || 0) : 0;
    if (G.res.elixir) G.res.elixir.v = 0;
  }

  // 污染系统（隐性累积值，旧存档初始化为 0）
  G.pollution = G.pollution || 0;
  G.pollutionRate = G.pollutionRate || 0;
  G.fogDisabled = G.fogDisabled || [];

  // 灵脉系统（即产即消，非存档持久值，每 tick 重算）
  G.leylineProd = G.leylineProd || 0;
  G.leylineCons = G.leylineCons || 0;
  G.leylineNet = G.leylineNet || 0;
  G.leylineRatio = G.leylineRatio ?? 1;
  G.leylineDebuff = G.leylineDebuff || 0;

  // 躁念系统（隐性累积值，旧存档初始化为 0）
  G.unrest = G.unrest || 0;
  G.unrestRate = G.unrestRate || 0;
  G.demonDisabled = G.demonDisabled || [];

  // 修复木板/砖块上限（旧存档研究已完成但 mx 仍为 0）
  if (G.upg.carpentry?.done && G.res.plank && G.res.plank.mx < 100) {
    G.res.plank.mx = 100; G.res.plank.on = 1;
  }
  if (G.upg.masonry?.done && G.res.brick && G.res.brick.mx < 100) {
    G.res.brick.mx = 100; G.res.brick.on = 1;
  }

  // 补齐新版本新增的资源/建筑/职业/研究状态
  if (!G.train) G.train = {};
  if (!G.autoCraft) G.autoCraft = {};
  if (!G.acOn) G.acOn = {};
  // v0.11.0 远行与贸易
  G.foxAway = G.foxAway || 0;
  G.expDone = G.expDone || {};
  G.expeditions = G.expeditions || [];
  G.pendingNarr = G.pendingNarr || [];
  G.narratives = G.narratives || { oldRuin: [], cloudRidge: [] };
  G.feastSeason = G.feastSeason ?? -1;
  G.tradeWindYear = G.tradeWindYear ?? -1;
  G.caravan = G.caravan || null;
  G.caravanTimer = G.caravanTimer || 0;
  // 抉择事件
  G.pendingChoice = G.pendingChoice || null;
  G.choicesDone = G.choicesDone || [];
  G.choiceBuffs = G.choiceBuffs || {};
  // v0.12.0 图纸与专精
  G.blueprints = G.blueprints || [];
  G.bldSpec = G.bldSpec || {};
  G.jobTalent = G.jobTalent || {};
  // v0.14 风俗与习俗
  G.customs = G.customs || {};
  if (G.bonfireSeason === undefined) G.bonfireSeason = -1;
  if (G.silentSeason === undefined) G.silentSeason = -1;
  if (G.springExpDone === undefined) G.springExpDone = 0;

  // v0.15 文化经济循环
  // 节令系统（A1：双模式 auto / manual）
  G.riteMode = G.riteMode || 'auto';
  G.seasonRites = G.seasonRites || { dye: false, wine: false, ink: false, all: false };
  G.lastSeasonRites = G.lastSeasonRites || { dye: true, wine: true, ink: true };
  G.pendingSeasonRites = G.pendingSeasonRites || { open: false };
  G.riteIntroSeen = G.riteIntroSeen ?? false;
  G.offlineRiteLog = G.offlineRiteLog || [];
  G.lastRiteToast = G.lastRiteToast ?? -1;
  // 文化灵术
  G.inkPact = G.inkPact ?? -1;             // 存施放时季节，-1 = 未生效
  G.inkPactBp = G.inkPactBp || false;      // 商队图纸概率额外加成（A3：季末与 inkPact 一同清零）
  G.overflowSeason = G.overflowSeason ?? -1;
  G.doubleCraftSeason = G.doubleCraftSeason ?? -1;
  // 商队首次记录（§14.5 修复 5）
  G.caravanEverVisited = G.caravanEverVisited ?? false;
  // v0.15.1 预留字段（提前存好让存档结构稳定）
  G.merchantSpiceAcc = G.merchantSpiceAcc || 0;
  G.moonStageActive = G.moonStageActive ?? true;
  G.artistryActive = G.artistryActive ?? true;

  // 灵修灵术冷却
  G.spellCooldowns = G.spellCooldowns || {};
  G.tidePullSeason = G.tidePullSeason ?? -1;
  G.fateWeaveSeason = G.fateWeaveSeason ?? -1;
  // 灵修 B 阶段灵术
  G.resonWaveSeason = G.resonWaveSeason ?? -1;
  G.shapeFoxSeason = G.shapeFoxSeason ?? -1;
  G.shapeFoxExtra = G.shapeFoxExtra ?? 0;
  G.sageUtterActive = G.sageUtterActive ?? false;
  // v0.19 灵修 C 阶段灵术
  G.spiritWeaveSeason = G.spiritWeaveSeason ?? -1;
  G.starSenseSeason = G.starSenseSeason ?? -1;

  // v0.16 政体与政策
  G.polity = G.polity || null;
  G.polityChanges = G.polityChanges || 0;
  G.polityPenaltySeason = G.polityPenaltySeason ?? -1;
  G.polityPenaltyYear = G.polityPenaltyYear ?? -1;
  G.policies = G.policies || {};
  G.policyCooldowns = G.policyCooldowns || {};
  // v0.16 §四 1.1 议事录资源已废弃，清理旧存档
  if (G.res && G.res.council !== undefined) delete G.res.council;
  // v0.16 §四 1.8 旧议政页签迁移（若旧存档保存了 tab 状态）
  if (G.tab === 'g') G.tab = 'k';
  // v0.16 §四 1.8 清理旧谷声字段（若存在）
  if (G.valleyVoice !== undefined) delete G.valleyVoice;
  // E18 续修：valleyVoice 研究已删除，旧存档清理
  if (G.upg && G.upg.valleyVoice) delete G.upg.valleyVoice;
  // v0.16 §四 1.10 Tier 1 路线（从 G.polity 推断旧存档；新存档为 null）
  if (G.tier1 === undefined) G.tier1 = null;
  if (!G.tier1 && G.polity) {
    if (G.polity === 'elder' || G.polity === 'hermit' || G.polity === 'public') G.tier1 = 'in';
    else if (G.polity === 'trade' || G.polity === 'martial' || G.polity === 'anarchy') G.tier1 = 'out';
  }
  // v0.16 副线
  G.subBranches = G.subBranches || {};
  // v0.16 §四 1.3 class 政策 'elder' -> 'seniority' 迁移
  if (G.policies.class === 'elder') G.policies.class = 'seniority';
  // v0.16 阶段门控（根据已完成研究推断旧存档的 G.phase）
  G.phase = G.phase || 0;
  if (G.upg.councilLore?.done) G.phase = Math.max(G.phase, 1);
  if (G.upg.branchLore?.done) G.phase = Math.max(G.phase, 2);
  if (G.upg.oilExtract?.done || G.upg.inscription?.done) G.phase = Math.max(G.phase, 3);
  if (G.upg.divineLore?.done) G.phase = Math.max(G.phase, 3);
  if (G.upg.calcination?.done) G.phase = Math.max(G.phase, 4);
  if (G.upg.crystalize?.done) G.phase = Math.max(G.phase, 4);

  // v0.17 §五 2.6: G.mainLine 字段初始化与迁移
  G.mainLine = G.mainLine || null;
  // 从 G.policies.branch 迁移到 G.mainLine（旧存档兼容）
  if (G.policies.branch && !G.mainLine) {
    if (G.policies.branch === 'I') G.mainLine = 'industry';
    if (G.policies.branch === 'M') G.mainLine = 'mystic';
  }

  // v0.17 §五 2.6: branchLore 存档兼容——已研究但未选路的异常状态检测
  if (G.upg.branchLore?.done && !G.policies.branch) {
    G._branchMigrationNeeded = true;  // 标记：UI 层检测到后弹出强制选路对话框
  }

  // v0.17 §五 2.8 离线收益
  if (G.lastSaveTime === undefined) G.lastSaveTime = Date.now();
  if (G.offlineGains === undefined) G.offlineGains = null;

  // v0.18 神启副线
  G._graceBonus = G._graceBonus || 0;
  G._graceCap = G._graceCap ?? 0.50;
  G._ritualCD = G._ritualCD || {};
  G._blessSeason = G._blessSeason ?? -1;

  // v0.18 §六 3.4 占卜系统
  G._divination = G._divination ?? null;
  G._divYear = G._divYear ?? -1;
  G._divPending = G._divPending ?? false;
  G._divDrawn = G._divDrawn || [];

  // v0.18 §六 3.6 通达副线
  G._reputeBonus = G._reputeBonus || 0;
  G._reputeCap = G._reputeCap ?? 0.40;
  // v0.19 §七 4.4 邦交系统
  if (!G._alliance) G._alliance = { otter: 0, crane: 0, ruinfolk: 0, lynx: 0, owl: 0, ratter: 0, koala: 0 };
  if (!G._allianceFavor) G._allianceFavor = { otter: 0, crane: 0, ruinfolk: 0, lynx: 0, owl: 0, ratter: 0, koala: 0 };
  if (!G._allianceFrozen) G._allianceFrozen = {};
  G._allianceJoyRemain = G._allianceJoyRemain || 0;

  // v0.19 §七 4.3 教团：教令系统
  G._edicts = G._edicts || [];
  G._edictCD = G._edictCD || {};
  G._edictCDReduce = G._edictCDReduce || 0;
  G._holyGearBonus = G._holyGearBonus || 0;
  G._pietyMxPerm = G._pietyMxPerm || 0;
  // v0.19 §七 4.3 秘仪：飞升阶梯
  G._gates = G._gates || 0;
  G._gateEffects = G._gateEffects || {};
  G._gateDiscount = G._gateDiscount || 0;
  G._gateEcstasyRemain = G._gateEcstasyRemain || 0;

  // v0.16 修复：清理脏数据——未建造的分支建筑若解锁条件不再满足，重置 .on（保护已建造数据）
  for (const k of Object.keys(BD)) {
    if (G.bld[k] && G.bld[k].on && G.bld[k].c === 0 && BD[k].uq && !chk(BD[k].uq)) {
      G.bld[k].on = 0;
    }
  }

  for (const k of Object.keys(RD))
    if (!G.res[k]) G.res[k] = { v: 0, mx: RD[k].mx, r: 0, on: !RD[k].lock };
  // hotfix: 修复旧存档中已通过 craft 取得但未 unlock 的资源（v>0 但 on=false）
  for (const k of Object.keys(G.res))
    if (G.res[k] && G.res[k].v > 0 && !G.res[k].on) G.res[k].on = true;
  for (const k of Object.keys(BD))
    if (!G.bld[k]) G.bld[k] = { c: 0, on: !BD[k].uq };
  for (const k of Object.keys(JD))
    if (!G.job[k]) G.job[k] = { c: 0, on: !!JD[k].on };
  for (const k of Object.keys(UD))
    if (!G.upg[k]) G.upg[k] = { done: 0, on: 0 };
  // 进阶升级
  if (!G.upgd) G.upgd = {};
  for (const k of Object.keys(UPGD))
    if (!G.upgd[k]) G.upgd[k] = { done: 0, on: 0 };

  // v0.19 §七 4.1 工业 C 资源解锁恢复（旧存档已完成研究但资源未解锁）
  if (G.upg.calcination?.done && G.res.titan) G.res.titan.on = 1;
  if (G.upg.refining?.done && G.res.alloy) G.res.alloy.on = 1;
  if (G.upg.systematics?.done && G.res.outline) G.res.outline.on = 1;
  if (G.upg.stargazing?.done && G.res.starchart) G.res.starchart.on = 1;
  if (G.upg.precFab?.done && G.res.titanPart) G.res.titanPart.on = 1;
  if (G.upg.heavyBuild?.done && G.res.pillar) G.res.pillar.on = 1;

  // v0.19 §七 4.2 灵修 C 资源解锁恢复（旧存档已完成研究但资源未解锁）
  if (G.upg.crystalize?.done && G.res.crystalSilk) G.res.crystalSilk.on = 1;
  if (G.upg.radiant?.done && G.res.radiance) G.res.radiance.on = 1;
  if (G.upg.coreCraft?.done && G.res.spiritCore) G.res.spiritCore.on = 1;
  if (G.upg.formStudy?.done && G.res.formSoul) G.res.formSoul.on = 1;
  if (G.upg.chartDraw?.done && G.res.spiritChart) G.res.spiritChart.on = 1;

  // v0.19 §七 4.5 六神系统
  if (G.deity === undefined) G.deity = null;
  if (G.sect === undefined) G.sect = null;
  if (G.deityCD === undefined) G.deityCD = 0;
  if (!G._deityRitualCD) G._deityRitualCD = {};
  if (!G._deityRitualBuff) G._deityRitualBuff = null;
  if (G._deitySmallBuff === undefined) G._deitySmallBuff = null;

  // §五 2.9 成就
  if (!G.achievements) G.achievements = {};
}

// ===== 存档 =====
let saveFailLogged = false;
function save() {
  try {
    // 移除计算临时字段
    delete G._fogRestore;
    // v0.17 §五 2.8: 记录存档时间戳（用于离线收益计算）
    G.lastSaveTime = Date.now();
    localStorage.setItem('fhSave', JSON.stringify(G));
    saveFailLogged = false;
  } catch (e) {
    if (!saveFailLogged) {
      log('自动存档失败，建议导出存档码备份。', 'warn');
      saveFailLogged = true;
    }
  }
}

function load() {
  try {
    const s = localStorage.getItem('fhSave');
    if (s) {
      resetG();
      Object.assign(G, JSON.parse(s));
      migrate();
      log('读取了存档。');
      // v0.17 §五 2.8: 离线收益——检测离线时长并补算
      if (G.lastSaveTime) {
        var offlineGap = (Date.now() - G.lastSaveTime) / 1000;
        if (offlineGap > 30) {
          // 快照离线前资源
          var before = {};
          for (var k in G.res) { if (G.res[k].on) before[k] = G.res[k].v; }
          simulateOffline(offlineGap);
          // 计算增量
          var gains = {};
          var capped = [];
          for (var k in G.res) {
            if (!G.res[k].on) continue;
            var delta = G.res[k].v - (before[k] || 0);
            if (Math.abs(delta) > 0.005) gains[k] = Math.round(delta * 100) / 100;
            if (G.res[k].mx > 0 && G.res[k].v >= G.res[k].mx - 0.01) capped.push(k);
          }
          G.offlineGains = { duration: Math.min(offlineGap, 86400), gains: gains, capped: capped };
        }
      }
    }
  } catch (e) { }
  lastRealTime = Date.now();
}

function manualSave() {
  save();
  log('已手动保存。', 'important');
}

function resetGame() {
  if (!confirm('确定要重置游戏吗？所有进度将被清空，无法恢复。')) return;
  try { localStorage.removeItem('fhSave'); } catch (e) { }
  location.reload();
}

// ===== 存档码 =====
function closeModal() {
  document.getElementById('modal-overlay').style.display = 'none';
  // §五 2.6: 恢复关闭按钮（showBranchMigrationModal 会隐藏它）
  var closeBtn = document.querySelector('#modal-box > div:last-child button');
  if (closeBtn) closeBtn.style.display = '';
}

function showCodeExport() {
  save();
  var code = btoa(unescape(encodeURIComponent(JSON.stringify(G))));
  document.getElementById('modal-title').textContent = '存档码（复制保存）';
  document.getElementById('modal-body').innerHTML =
    '<textarea id="code-out" readonly style="width:100%;height:100px;font-size:11px;font-family:monospace;resize:vertical;border:1px solid #ccc;padding:4px;">' +
    code + '</textarea>' +
    '<div style="margin-top:6px;">' +
    '<button onclick="copyCode()" style="padding:3px 12px;cursor:pointer;border:1px solid #bbb;background:#fff;font-size:12px;">复制</button>' +
    '<span id="copy-msg" style="margin-left:8px;color:#070;font-size:12px;"></span></div>';
  document.getElementById('modal-overlay').style.display = 'flex';
  log('已生成存档码。', 'important');
}

function copyCode() {
  var ta = document.getElementById('code-out');
  ta.select();
  document.execCommand('copy');
  document.getElementById('copy-msg').textContent = '已复制！';
}

function showCodeImport() {
  document.getElementById('modal-title').textContent = '导入存档码';
  document.getElementById('modal-body').innerHTML =
    '<textarea id="code-in" placeholder="在此粘贴存档码…" style="width:100%;height:100px;font-size:11px;font-family:monospace;resize:vertical;border:1px solid #ccc;padding:4px;"></textarea>' +
    '<div style="margin-top:6px;">' +
    '<button onclick="applyCode()" style="padding:3px 12px;cursor:pointer;border:1px solid #bbb;background:#fff;font-size:12px;">恢复存档</button>' +
    '<span id="import-msg" style="margin-left:8px;font-size:12px;"></span></div>';
  document.getElementById('modal-overlay').style.display = 'flex';
}

function applyCode() {
  var code = document.getElementById('code-in').value.trim();
  if (!code) return;
  try {
    var json = decodeURIComponent(escape(atob(code)));
    var data = JSON.parse(json);
    resetG();
    Object.assign(G, data);
    migrate();
    log('存档码导入成功！', 'important');
    document.getElementById('import-msg').style.color = '#070';
    document.getElementById('import-msg').textContent = '恢复成功！';
    rAll();
  } catch (e) {
    document.getElementById('import-msg').style.color = '#b00';
    document.getElementById('import-msg').textContent = '存档码无效，请检查。';
    log('存档码导入失败：格式错误。', 'warn');
  }
}
