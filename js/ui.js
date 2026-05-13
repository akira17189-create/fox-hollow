/**
 * ui.js - 狐狸谷物语 界面渲染
 * 日志、资源面板、Tab内容、悬浮信息面板、初始化
 */

// ===== 发布版裁剪（dev/prod 双模式） =====
// 本地 localhost / 127.0.0.1 = dev 模式，所有内容可见
// 其他域名（GitHub Pages 等）= prod 模式，按 PROD_LOCKED 列表过滤
// 当前所有列表为空——所有内容线上可见。如需临时隐藏未完成内容，按 category 加 ID 即可。
const IS_DEV = window.location.hostname === 'localhost'
            || window.location.hostname === '127.0.0.1';
const PROD_LOCKED = {
  bld:   [],
  res:   [],
  exp:   [],
  spell: [],
};
function isProdLocked(category, id) {
  if (IS_DEV) return false;
  var list = PROD_LOCKED[category];
  return !!(list && list.indexOf(id) >= 0);
}

let curTab = 'b';
const openDetail = {};
const logs = [];
const tipCache = {};
let tipSeason = -1;
const _expFoxSel = {};
const collapsed = { res: false, tc: false, log: false, narr: false };
const groupCollapsed = {};  // §五 2.4: 分组折叠状态 { 'bld_基础设施': false, ... }
try { var _gc = JSON.parse(localStorage.getItem('fhGroupCollapsed')); if (_gc) Object.assign(groupCollapsed, _gc); } catch(e) {}

// §五 2.4 建筑分组定义（村落页签）
const BLD_GROUPS = [
  { n: '基础设施', ids: ['berryPatch','hutch','lumberYard','quarry','tannery','warehouse','library','smithy','market','shrine','moonwell','plankHouse','vault','tradePost','trailroad','watchtower'] },
  { n: '文化设施', ids: ['storyTree','moonStage','memorial','artistry','assembly','ancestor'] },
  { n: '治理设施', ids: ['councilHall','polityHall'] },
  { n: '工业设施', ids: ['mine','blastFurnace','chimney','purifier','steelVault','oilWell','oilTank','steamEngine','combustEngine','factory','railroad','windTower','calcFurnace','refinery','observatory','cleanForest','titanVault'], br: 'I' },
  { n: '灵修设施', ids: ['spiritWell','spiritTower','quietRoom','leyArray','resonTower','elixirBrewery','shapeHall','oracleHall','calmGrove'], br: 'M' },
  { n: '外交设施', ids: ['embassy','receptionHall','courierPost','charterHall','exoticVault','guestQuarter','alliancePlatform'], sb: 'T' },
];
const BLD_GROUPS_V = [];
// §五 2.4 工坊分组定义
const CRAFT_GROUPS = [
  { n: '基础工艺', ids: ['plank','brick','scroll'] },
  { n: '文化工艺', ids: ['dye','wine','ink','weave','spiceToSilk'] },
  { n: '工业工艺', ids: ['steel','gear','plate','concrete','oil','barrel','draft','forgeAlloy','drawOutline','castTitanPart','pourPillar'], br: 'I' },
  { n: '灵修工艺', ids: ['fateSilk','bead','spiritInk','sigil','resonance','elixir','spectrum','insight'], br: 'M' },
  { n: '外交工艺', ids: ['makeCredential','makeCharter','makeExotic','charterToCredential'], sb: 'T' },
  { n: '教团工艺', ids: ['holyFlameCraft','holyIronCraft','holyWater','edictScroll','holyGear'], sb: 'D', br: 'I' },
  { n: '秘仪工艺', ids: ['ambrosiaDistill','gnosisFragment','apotheosisElixir'], sb: 'D', br: 'M' },
];

function toggleCollapse(key) {
  collapsed[key] = !collapsed[key];
  try { localStorage.setItem('fhCollapsed', JSON.stringify(collapsed)); } catch(e) {}
  rAll();
}

function toggleGroup(key) {
  groupCollapsed[key] = !groupCollapsed[key];
  try { localStorage.setItem('fhGroupCollapsed', JSON.stringify(groupCollapsed)); } catch(e) {}
  rTC();
}

function log(m, c) {
  logs.unshift({ m, c: c || '' });
  if (logs.length > 60) logs.pop();
  rLog();
}

// 从 tip 数组随机取一句（按 key 缓存，每季节刷新）
function pickTip(key, arr) {
  if (!arr || !arr.length) return '';
  // 季节变化时清空缓存
  if (G.season !== tipSeason) {
    for (var k in tipCache) delete tipCache[k];
    tipSeason = G.season;
  }
  if (!(key in tipCache)) {
    tipCache[key] = arr[Math.floor(Math.random() * arr.length)];
  }
  return tipCache[key];
}

// 生成悬浮面板 HTML（包裹在 .hp-wrap 中）
// label: 显示的名称文字
// sections: { desc, effects[], notes[], tip }
// opts: { tag, cls, onclick } 外层标签配置
// 神祇/教派被动效果字段 → 中文描述（避免 hover 里出现 bldCostM/stoneM 等 dev 名）
var _PASSIVE_LABEL = {
  _bldCostM: '建筑造价', _stoneM: '碎石产出', _brickM: '砖块产出',
  _hapFlat: '满意度', _hapDecayReduce: '满意度衰减',
  _gatherM: '手动采集', _charmM: '符咒产出', _spellBoost: '灵术效果',
  _loreM: '学识产出', _scrollM: '卷轴产出', _scrollCraftM: '卷轴工艺',
  _maxFoxFlat: '狐狸上限', _jobEffM: '职业效率',
  _caravanProb: '商队概率', _caravanReward: '商队报酬',
  _coinM: '铜钱产出', _bldHpM: '建筑耐久', _baseProdM: '基础产出',
  _pietyM: '虔诚产出', _foodM: '食物产出',
  _researchDiscount: '研究花费折扣', _expGainM: '远行收益',
  _tradeDiscount: '贸易折扣',
};
function _passiveLabel(k, v) {
  var label = _PASSIVE_LABEL[k] || k.replace(/^_/, '');
  var sign = (typeof v === 'number' && v < 0) ? '' : '+';
  var val = (typeof v === 'number' && Math.abs(v) < 1) ? (v * 100).toFixed(0) + '%' : v;
  return label + ' ' + sign + val;
}

// B2 智能去重：判断 effect 行是否已经被 desc 覆盖
// 规则：effect 里的所有数字都出现在 desc，且至少一个 2+ 字中文词也出现 → 视为重复
function _effectSubsumedByDesc(desc, effect) {
  var plainDesc = desc.replace(/<[^>]+>/g, '');  // 剥 HTML 标签
  var plainEff = effect.replace(/<[^>]+>/g, '');
  var nums = plainEff.match(/[+\-]?\d+(?:\.\d+)?%?/g) || [];
  if (!nums.length) return false;
  var words = plainEff.match(/[一-鿿]{2,}/g) || [];
  if (!words.length) return false;
  var allNumsInDesc = nums.every(function(n) { return plainDesc.indexOf(n) !== -1; });
  var someWordInDesc = words.some(function(w) { return plainDesc.indexOf(w) !== -1; });
  return allNumsInDesc && someWordInDesc;
}

function hpWrap(label, sections, opts) {
  opts = opts || {};
  var tag = opts.tag || 'span';
  var cls = opts.cls || '';
  var onclick = opts.onclick ? ' onclick="' + opts.onclick + '"' : '';
  var h = '<' + tag + ' class="hp-wrap ' + cls + '"' + onclick + '>';
  h += label;
  h += '<div class="hp">';
  // B2: 若 desc 已覆盖所有 effect 行，去掉 effect 区
  var effects = sections.effects;
  if (sections.desc && effects && effects.length) {
    var allCovered = effects.every(function(eff) {
      return _effectSubsumedByDesc(sections.desc, eff);
    });
    if (allCovered) effects = null;
  }
  if (sections.desc) h += '<div class="hp-desc">' + sections.desc + '</div>';
  if (effects && effects.length)
    h += '<div class="hp-eff">' + effects.join('<br>') + '</div>';
  if (sections.notes && sections.notes.length)
    h += '<div class="hp-note">' + sections.notes.join('<br>') + '</div>';
  if (sections.tip) h += '<div class="hp-tip">' + sections.tip + '</div>';
  h += '</div>';
  h += '</' + tag + '>';
  return h;
}

// 建筑效果描述（人类可读）
function bldEffects(e) {
  var r = [];
  if (!e) return r;
  for (var k in e) {
    var v = e[k];
    if (k === 'maxFox') r.push('每座容纳 ' + v + ' 只狐狸');
    else if (k.endsWith('Mx')) r.push((RD[k.slice(0, -2)]?.n || k) + ' 上限 +' + v);
    else if (k === 'hapB') r.push('满意度 +' + (v * 100 | 0) + '%');
    else if (k === 'allM') r.push('全资源产量 +' + (v * 100 | 0) + '%');
    // v0.14 文化建筑专属字段
    else if (k === 'customAllM') r.push('全村产出 +' + (v * 100).toFixed(1) + '%/座 ×已激活习俗数');
    else if (k === 'craftCultureMul') r.push('彩络/醴浆/墨锭产能 +' + (v * 100 | 0) + '%/座');
    // 能量系统
    else if (k === 'energyP') r.push('能量产出 +' + v);
    else if (k === 'energyC') r.push('能量消耗 -' + v);
    // 污染系统
    else if (k === 'pollutionP') {
      var pv = v * 0.5;
      if (v > 0) r.push('污染 +' + fmt(pv) + '/s');
      else r.push('污染 ' + fmt(pv) + '/s');
    }
    else if (k === 'pollThresh') r.push('污染阈值 +' + v + '（治标不治本）');
    // 灵脉系统
    else if (k === 'leylineP') r.push('灵脉产出 +' + v);
    else if (k === 'leylineC') r.push('灵脉消耗 -' + v);
    // 躁念系统
    else if (k === 'unrestP') {
      var uv = v * 0.5;
      if (v > 0) r.push('躁念 +' + fmt(uv) + '/s');
      else r.push('躁念 ' + fmt(uv) + '/s');
    }
    else if (k === 'unrestThresh') r.push('躁念阈值 +' + v + '（治标不治本）');
    // 工业分支 B阶段效果
    else if (k === 'craftAllM') r.push('所有配方产出 +' + (v * 100 | 0) + '%');
    else if (k === 'craftSpiritM') r.push('灵修配方产出 +' + (v * 100 | 0) + '%');
    else if (k === 'caravanM') r.push('商队到达率 +' + (v * 100 | 0) + '%');
    else if (k === 'expTimeM') r.push('远行时间 ×' + v);
    // 通用资源产出（放在所有显式 *P 处理之后，兜底未知资源）
    else if (k.endsWith('P')) { var rv = v * 0.5; r.push((RD[k.slice(0, -1)]?.n || k) + ' ' + (rv >= 0 ? '+' : '') + fmt(rv) + '/s'); }
  }
  return r;
}

// 进阶升级效果描述（人类可读）
function upgdEffects(e) {
  var r = [];
  if (!e) return r;
  for (var k in e) {
    var v = e[k];
    if (k === 'craftM') {
      for (var cid in v) {
        var cn = CD[cid] ? CD[cid].n : cid;
        if (v[cid].outMul) r.push(cn + ' 产出 +' + Math.round(v[cid].outMul * 100) + '%');
        if (v[cid].inpM) {
          for (var rk in v[cid].inpM) {
            var rn = RD[rk] ? RD[rk].n : rk;
            r.push(cn + ' ' + rn + '消耗 ' + Math.round(v[cid].inpM[rk] * 100) + '%');
          }
        }
      }
    } else if (k === 'bldM') {
      for (var bid in v) {
        var bn = BD[bid] ? BD[bid].n : bid;
        if (v[bid].prodM) r.push(bn + ' 产出 +' + Math.round(v[bid].prodM * 100) + '%');
        if (v[bid].pollM) r.push(bn + ' 污染 ' + Math.round(v[bid].pollM * 100) + '%');
        if (v[bid].extraP) {
          for (var rk in v[bid].extraP) {
            var rn = RD[rk] ? RD[rk].n : rk;
            r.push(bn + ' 每座额外 ' + rn + ' +' + fmt(v[bid].extraP[rk] * 0.5) + '/s');
          }
        }
      }
    } else if (k === 'mxM') {
      for (var rk in v) {
        var rn = RD[rk] ? RD[rk].n : rk;
        r.push(rn + ' 上限 +' + Math.round(v[rk] * 100) + '%');
      }
    } else if (k === 'bldMxM') {
      for (var bid in v) {
        var bn = BD[bid] ? BD[bid].n : bid;
        r.push(bn + ' 存储效果 +' + Math.round(v[bid] * 100) + '%');
      }
    } else if (k === 'jobM') {
      for (var jid in v) {
        var jn = JD[jid] ? JD[jid].n : jid;
        r.push(jn + ' 产出 +' + Math.round(v[jid] * 100) + '%');
      }
    } else if (k === 'bldCostM') {
      for (var bid in v) {
        var bn = BD[bid] ? BD[bid].n : bid;
        r.push(bn + ' 建造费 ' + Math.round(v[bid] * 100) + '%');
      }
    } else if (k.endsWith('M') && typeof v === 'number') {
      var resKey = k.slice(0, -1);
      var rn = RD[resKey] ? RD[resKey].n : resKey;
      r.push(rn + ' 产出 +' + Math.round(v * 100) + '%');
    } else if (k === '_leyBonus') {
      for (var bid in v) {
        var bn = BD[bid] ? BD[bid].n : bid;
        r.push(bn + ' 灵脉 +' + v[bid] + '/座');
      }
    } else if (k === '_leySetBonus') {
      for (var bid in v) {
        var bn = BD[bid] ? BD[bid].n : bid;
        r.push('每' + v[bid].per + '座' + bn + ' 额外灵脉 +' + v[bid].bonus);
      }
    } else if (k === '_quietBonus') {
      r.push('静室阈值右移 +' + v);
    } else if (k === '_unrestReduce') {
      for (var bid in v) {
        var bn = BD[bid] ? BD[bid].n : bid;
        r.push(bn + ' 躁念 ' + Math.round(v[bid] * 100) + '%');
      }
    } else if (k === '_happyJobBonus') {
      for (var jid in v) {
        var jn = JD[jid] ? JD[jid].n : jid;
        r.push(jn + ' 满意度加成 ×' + fmt(1 + v[jid]));
      }
    } else if (k === '_expRewardBonus') {
      r.push('远行奖励 +' + Math.round(v * 100) + '%');
    }
  }
  return r;
}

// 建筑解锁资源提示
function bldUnlockNotes(d) {
  var n = [];
  if (d.ur && d.ur.length) n.push('解锁资源：' + d.ur.map(function(r) { return RD[r].n; }).join('、'));
  if (d.e && d.e.maxFox) n.push('每只狐狸每秒消耗 ' + fmt(foxEatRate() * 0.5) + ' 野莓');
  return n;
}

// 职业效果描述（隐藏未解锁资源 — 避免剧透/提前曝光后期内容）
function jobEffects(id, e) {
  var r = [];
  // 猎手特殊：动态生成 desc，香草未解锁时不提及
  if (id === 'hunter') {
    var parts = ['兽皮 +0.015/s'];
    if (G.res.spice && G.res.spice.on) parts.push('副产 香草 +0.0025/s');
    parts.push('授业可提升产出');
    r.push(parts.join('；'));
    return r;
  }
  // 斥候等无产出职业用 desc 字段（纯 desc 则直接返回）
  if (JD[id] && JD[id].desc) {
    r.push(JD[id].desc);
    // 有 desc 但同时也有标准 *P 产出的职业（如工程师），继续显示
    var hasP = false;
    for (var k in e) { if (k.endsWith('P')) { hasP = true; break; } }
    if (!hasP) return r;
  }
  for (var k in e) {
    var v = e[k];
    if (k.endsWith('P')) {
      var resKey = k.slice(0, -1);
      // 跳过未解锁资源（如 spice 在早期不该显示）
      if (G.res[resKey] && !G.res[resKey].on) continue;
      r.push('每只狐狸产出：' + (RD[resKey]?.n || k) + ' +' + (v * 0.5) + '/s');
    }
  }
  return r;
}

// 研究效果描述
function upgEffects(e) {
  var r = [];
  if (!e) return r;
  for (var k in e) {
    var v = e[k];
    if (k === 'plankU') r.push('解锁资源：木板');
    else if (k === 'brickU') r.push('解锁资源：砖块');
    // 工业分支 A阶段资源解锁
    else if (k === 'coalU') r.push('解锁资源：煤');
    else if (k === 'steelU') r.push('解锁资源：钢');
    else if (k === 'gearU') r.push('解锁资源：齿轮');
    else if (k === 'plateU') r.push('解锁资源：钢板');
    else if (k === 'concreteU') r.push('解锁资源：混凝');
    // 工业分支 B阶段资源解锁
    else if (k === 'oilU') r.push('解锁资源：火油');
    else if (k === 'barrelU') r.push('解锁资源：油桶');
    else if (k === 'draftU') r.push('解锁资源：蓝本');
    // 工业分支 C阶段资源解锁
    else if (k === 'titanU') r.push('解锁资源：寒钛');
    else if (k === 'alloyU') r.push('解锁资源：合金');
    else if (k === 'outlineU') r.push('解锁资源：纲要');
    else if (k === 'titanPartU') r.push('解锁资源：钛构件');
    else if (k === 'pillarU') r.push('解锁资源：混凝柱');
    else if (k === 'starchartU') r.push('解锁资源：星图');
    // 工业分支 D阶段资源解锁
    else if (k === 'uraniumU') r.push('解锁资源：辉石');
    else if (k === 'thoriumU') r.push('解锁资源：重晶');
    else if (k === 'mirrorAlloyU') r.push('解锁资源：镜合金');
    else if (k === 'codexU') r.push('解锁资源：密典');
    // 灵修分支 D阶段资源解锁
    else if (k === 'primordialU') r.push('解锁资源：元念');
    else if (k === 'silenceStoneU') r.push('解锁资源：寂石');
    else if (k === 'mirrorSpiritU') r.push('解锁资源：镜灵');
    else if (k === 'voidCodexU') r.push('解锁资源：幽典');
    // 神启副线 C-教团 资源解锁
    else if (k === 'hymnU') r.push('解锁资源：颂咏');
    else if (k === 'holyRelicU') r.push('解锁资源：圣骸');
    else if (k === 'holyScriptureU') r.push('解锁资源：圣典');
    // 灵修分支 A阶段资源解锁
    else if (k === 'spiritU') r.push('解锁资源：灵能');
    else if (k === 'fateSilkU') r.push('解锁资源：命丝');
    else if (k === 'spiritInkU') r.push('解锁资源：灵墨');
    else if (k === 'sigilU') r.push('解锁资源：符纹');
    else if (k === 'beadU') r.push('解锁资源：念珠');
    // 灵修分支 B阶段资源解锁
    else if (k === 'resonanceU') r.push('解锁资源：共振子');
    else if (k === 'elixirU') r.push('解锁资源：灵液');
    else if (k === 'spectrumU') r.push('解锁资源：谱石');
    else if (k === 'insightU') r.push('解锁资源：悟片');
    else if (k === 'hapB') r.push('满意度 +' + (v * 100 | 0) + '%');
    else if (k === 'winterBuff') r.push('冬季野莓倍率 ×0.25 → ×0.4');
    else if (k === 'foxEat') r.push('狐狸消耗野莓 -15%');
    else if (k === 'autoCraft') r.push('工坊配方可开启自动制作');
    else if (k.endsWith('M')) r.push((RD[k.slice(0, -1)]?.n || k) + ' 产量 +' + (v * 100 | 0) + '%');
  }
  return r;
}

function toggleDetail(id) {
  openDetail[id] = !openDetail[id];
  rTC();
}

// 格式化带符号的速率
function fmtR(v) {
  return (v >= 0 ? '+' : '') + fmt(v) + '/s';
}

// 资源速率来源明细
function resBreakdown(k) {
  var lines = [];
  // 无速率且无自动制作 → 不显示
  var hasRate = Math.abs(G.res[k].r) > 0.001;
  var hasAuto = false;
  if (G.upg.craftMastery?.done) {
    for (var cid in CD) {
      if (!G.autoCraft[cid]) continue;
      for (var i = 0; i < CD[cid].inp.length; i++)
        if (CD[cid].inp[i].r === k) hasAuto = true;
      for (var i = 0; i < CD[cid].out.length; i++)
        if (CD[cid].out[i].r === k) hasAuto = true;
    }
  }
  if (!hasRate && !hasAuto) return lines;

  // === 计算乘数（镜像 calcR 逻辑）===
  var mul = 1;
  var mulParts = [];
  for (var uid in G.upg) {
    if (!G.upg[uid].done) continue;
    var e = UD[uid].e; if (!e || !e[k + 'M']) continue;
    mul += e[k + 'M'];
    mulParts.push(UD[uid].n + ' +' + Math.round(e[k + 'M'] * 100) + '%');
  }
  // 进阶升级资源乘数
  for (var uid in G.upgd) {
    if (!G.upgd[uid] || !G.upgd[uid].done) continue;
    var ue = UPGD[uid]; if (!ue) continue;
    var e = ue.e; if (!e) continue;
    var mk = k + 'M';
    if (typeof e[mk] === 'number') {
      mul += e[mk];
      mulParts.push(ue.n + ' +' + Math.round(e[mk] * 100) + '%');
    }
  }
  for (var bid in G.bld) {
    if (!G.bld[bid].c) continue;
    var e = BD[bid].e; if (!e || !e.allM) continue;
    var b = e.allM * G.bld[bid].c;
    mul += b;
    mulParts.push(BD[bid].n + ' ×' + G.bld[bid].c + ' +' + Math.round(b * 100) + '%');
  }

  // 野莓季节/祈雨
  var sMul = 1;
  if (k === 'berry') {
    sMul = SM[G.season];
    if (G.season === 3 && G.upg.spiritShelter?.done) sMul = 0.4;
    if (G.season === 3 && G.bldSpec.warehouse === 'B') sMul *= (1 + SPEC_BD.warehouse.B.winterBuff);
    mulParts.push(SN[G.season] + ' ×' + sMul.toFixed(3).replace(/0+$/, '').replace(/\.$/, ''));
    if (G.rainSeason === G.season) { sMul *= 1.5; mulParts.push('祈雨 ×1.5'); }
  }

  var spiritOn = G.spiritSeason === G.season;
  if (spiritOn) mulParts.push('祖灵 +50%');
  // 灵修灵术：引潮
  if (G.tidePullSeason === G.season) mulParts.push('引潮 +30%');
  // 灵修 B 灵术：共振波
  if (G.resonWaveSeason === G.season) mulParts.push('共振波 +50%');
  // 灵修灵术：织命（配方产出 +80%）在配方段单独显示

  var fullMul = mul * sMul;

  // === 建筑产出（含专精）===
  var hasBldOutput = false;
  var _bm = collectBldM();
  for (var bid in BD) {
    var bc = G.bld[bid].c; if (!bc) continue;
    var e = BD[bid].e; if (!e || !e[k + 'P']) continue;
    hasBldOutput = true;
    var baseVal = e[k + 'P'];
    var specData = G.bldSpec[bid] && SPEC_BD[bid] ? SPEC_BD[bid][G.bldSpec[bid]] : null;
    if (specData) {
      if (specData.prodMul) baseVal *= specData.prodMul;
      if (k === 'lore' && specData.loreProdMul) baseVal = e[k + 'P'] * specData.loreProdMul;
      if (k === 'scroll' && specData.scrollProdMul) baseVal = e[k + 'P'] * specData.scrollProdMul;
      if (k === 'charm' && specData.charmProdMul) baseVal = e[k + 'P'] * specData.charmProdMul;
    }
    // v0.15.1 月歌台半效：断供时符咒产出 ×0.25
    if (bid === 'moonStage' && k === 'charm' && !G.moonStageActive) baseVal *= 0.25;
    // 进阶升级：建筑产出乘数 prodM
    if (_bm[bid] && _bm[bid].prodM) baseVal *= (1 + _bm[bid].prodM);
    // 能量系统：耗能建筑正向产出衰减
    if (e.energyC && G.energyRatio < 1 && baseVal > 0) baseVal *= G.energyRatio;
    // 灵脉系统：耗灵建筑正向产出衰减
    if (e.leylineC && G.leylineRatio < 1 && baseVal > 0) baseVal *= G.leylineRatio;
    var rate = baseVal * bc * fullMul * 0.5;
    var label = BD[bid].n + ' ×' + bc;
    if (specData) label += '「' + specData.n + '」';
    lines.push(label + '  ' + fmtR(rate));
  }

  // === 建筑专精额外产出 ===
  for (var bid in BD) {
    var bc = G.bld[bid].c; if (!bc) continue;
    var bde = BD[bid].e;
    var specData = G.bldSpec[bid] && SPEC_BD[bid] ? SPEC_BD[bid][G.bldSpec[bid]] : null;
    if (specData && specData.extraP && specData.extraP[k]) {
      var epVal = specData.extraP[k];
      // 能量系统：耗能建筑正向副产衰减
      if (bde && bde.energyC && G.energyRatio < 1 && epVal > 0) epVal *= G.energyRatio;
      // 灵脉系统：耗灵建筑正向副产衰减
      if (bde && bde.leylineC && G.leylineRatio < 1 && epVal > 0) epVal *= G.leylineRatio;
      var rate = epVal * bc * fullMul * TPD * 0.5;
      lines.push(BD[bid].n + '「' + specData.n + '」副产  ' + fmtR(rate));
    }
    // 进阶升级额外产出
    if (_bm[bid] && _bm[bid].extraP && _bm[bid].extraP[k]) {
      var epVal = _bm[bid].extraP[k];
      if (bde && bde.energyC && G.energyRatio < 1 && epVal > 0) epVal *= G.energyRatio;
      // 灵脉系统：耗灵建筑正向副产衰减
      if (bde && bde.leylineC && G.leylineRatio < 1 && epVal > 0) epVal *= G.leylineRatio;
      var rate = epVal * bc * fullMul * TPD * 0.5;
      lines.push(BD[bid].n + '（进阶）副产  ' + fmtR(rate));
    }
  }

  // === 建筑专精消耗（drain）===
  for (var bid in BD) {
    var bc = G.bld[bid].c; if (!bc) continue;
    var specData = G.bldSpec[bid] && SPEC_BD[bid] ? SPEC_BD[bid][G.bldSpec[bid]] : null;
    if (specData && specData.drain && specData.drain[k]) {
      var rate = -specData.drain[k] * bc * 0.5;
      lines.push(BD[bid].n + '「' + specData.n + '」消耗  ' + fmtR(rate));
    }
  }

  // === 职业产出（含训练、满意度、天赋、祖灵、进阶升级）===
  var hasJobOutput = false;
  // 收集进阶升级 jobM
  var _jm = {};
  for (var uid in G.upgd) {
    if (!G.upgd[uid] || !G.upgd[uid].done) continue;
    var ue = UPGD[uid] && UPGD[uid].e;
    if (ue && ue.jobM) { for (var jk in ue.jobM) _jm[jk] = (_jm[jk] || 0) + ue.jobM[jk]; }
  }
  for (var jid in JD) {
    var jc = G.job[jid].c; if (!jc) continue;
    var e = JD[jid].e; if (!e || !e[k + 'P']) continue;
    hasJobOutput = true;
    var tb = 1 + (G.train[jid] || 0) * 0.1;
    var sp = spiritOn ? 1.5 : 1;
    var jum = 1 + (_jm[jid] || 0);
    var baseVal = e[k + 'P'];
    var talentData = G.jobTalent[jid] && SPEC_JD[jid] ? SPEC_JD[jid][G.jobTalent[jid]] : null;
    if (talentData) {
      if (talentData.prodMul) baseVal *= talentData.prodMul;
      if (k === 'lore' && talentData.loreProdMul) baseVal = e[k + 'P'] * talentData.loreProdMul;
      if (k === 'scroll' && talentData.scrollProdMul) baseVal = e[k + 'P'] * talentData.scrollProdMul;
    }
    var rate = baseVal * jc * tb * G.happy * sp * fullMul * jum * 0.5;
    var label = JD[jid].n + ' ×' + jc;
    if (talentData) label += '「' + talentData.n + '」';
    if (_jm[jid]) label += '（进阶+' + Math.round(_jm[jid] * 100) + '%）';
    lines.push(label + '  ' + fmtR(rate));
  }

  // === 职业天赋额外产出 ===
  for (var jid in JD) {
    var jc = G.job[jid].c; if (!jc) continue;
    var talentData = G.jobTalent[jid] && SPEC_JD[jid] ? SPEC_JD[jid][G.jobTalent[jid]] : null;
    if (talentData && talentData.extraP && talentData.extraP[k]) {
      var tb = 1 + (G.train[jid] || 0) * 0.1;
      var sp = spiritOn ? 1.5 : 1;
      var jum = 1 + (_jm[jid] || 0);
      var rate = talentData.extraP[k] * jc * tb * G.happy * sp * fullMul * TPD * jum * 0.5;
      lines.push(JD[jid].n + '「' + talentData.n + '」副产  ' + fmtR(rate));
    }
  }

  // === 炉匠自动炼钢（特殊职业产出/消耗分解）===
  if (G.job.smelter && G.job.smelter.c > 0
      && G.res.iron.v >= 5 && G.res.coal.v >= 8
      && (G.res.steel.mx <= 0 || G.res.steel.v < G.res.steel.mx)) {
    var smC = G.job.smelter.c;
    var _ptf = 0;
    if (G.policies) { for (var dom in G.policies) { var oid = G.policies[dom]; if (oid && POLICY[dom] && POLICY[dom].opts[oid] && POLICY[dom].opts[oid].e && POLICY[dom].opts[oid].e.trainFlat) _ptf += POLICY[dom].opts[oid].e.trainFlat; } }
    var smTrain = 1 + (G.train.smelter || 0) * 0.1 + _ptf;
    var smSeason = 1;
    if (G.seasonRites.dye) smSeason *= 1.05;
    if (spiritOn) smSeason *= 1.5;
    // 政体/政策职业乘数（与 calcR 一致）
    var smPolityJobMul = 1;
    if (G.polity && POLITY[G.polity]) {
      var _pe = POLITY[G.polity].e;
      var _pb = 1 + Math.min(5, G.bld.polityHall?.c || 0) * 0.05;
      if (_pe.jobM) smPolityJobMul += (_pe.jobM > 0 ? _pe.jobM * _pb : _pe.jobM);
    }
    if (G.policies) { for (var _dom in G.policies) { var _oid = G.policies[_dom]; if (_oid && POLICY[_dom] && POLICY[_dom].opts[_oid] && POLICY[_dom].opts[_oid].e && POLICY[_dom].opts[_oid].e.jobM) smPolityJobMul += POLICY[_dom].opts[_oid].e.jobM; } }
    var smRate = (TPD / 60) * smC * smTrain * G.happy * smSeason * smPolityJobMul;
    // 工厂/工程师配方加成（与引擎 calcR 一致）
    var smOutMul = 1;
    if (G.bld.factory?.c && BD.factory?.e?.craftAllM) {
      var fB = BD.factory.e.craftAllM * G.bld.factory.c;
      if (G.energyRatio < 1) fB *= G.energyRatio;
      smOutMul += fB;
    }
    if (G.job.engineer?.c) {
      var eB = 0.03 * G.job.engineer.c * (1 + (G.train.engineer || 0) * 0.1 + _ptf);
      if (G.energyRatio < 1) eB *= G.energyRatio;
      smOutMul += eB;
    }
    if (k === 'steel') lines.push('炉匠 ×' + smC + '  ' + fmtR(1 * smOutMul * smRate * 0.5));
    if (k === 'iron')  lines.push('炉匠 ×' + smC + ' 消耗  ' + fmtR(-5 * smRate * 0.5));
    if (k === 'coal')  lines.push('炉匠 ×' + smC + ' 消耗  ' + fmtR(-8 * smRate * 0.5));
  }

  // === 加成汇总（仅当有建筑/职业被动产出时显示）===
  if ((hasBldOutput || hasJobOutput) && mulParts.length) {
    if (hasJobOutput && G.happy !== 1)
      mulParts.push('满意度 ' + Math.round(G.happy * 100) + '%');
    lines.push('加成: ' + mulParts.join('，'));
  }

  // === 污染惩罚 ===
  var pTier = pollutionTier();
  if (k === 'berry' && pTier.berryM) {
    lines.push('污染（' + pTier.n + '）  野莓产出 ' + Math.round(pTier.berryM * 100) + '%');
  }
  if (k === 'lore' && pTier.loreM) {
    lines.push('污染（' + pTier.n + '）  研究产出 ' + Math.round(pTier.loreM * 100) + '%');
  }

  // === 躁念惩罚 ===
  var uTier = unrestTier();
  if (k === 'charm' && uTier.charmM) {
    lines.push('躁念（' + uTier.n + '）  符咒产出 ' + Math.round(uTier.charmM * 100) + '%');
  }
  if (k === 'lore' && uTier.loreM) {
    lines.push('躁念（' + uTier.n + '）  研究产出 ' + Math.round(uTier.loreM * 100) + '%');
  }

  // === 狐狸消耗（扣除外出狐狸）===
  if (k === 'berry') {
    var villageFox = G.foxes - (G.foxAway || 0);
    if (villageFox > 0) {
      var fe = foxEatRate() * 0.5;
      lines.push('狐狸 ×' + villageFox + ' 消耗  ' + fmtR(-villageFox * fe));
    }
  }

  // === 采集者勤爪额外消耗 ===
  if (k === 'berry' && G.jobTalent.gatherer === 'A' && G.job.gatherer.c > 0) {
    var extraRate = -SPEC_JD.gatherer.A.extraEat * G.job.gatherer.c * 0.5;
    lines.push('采集者「勤爪」消耗  ' + fmtR(extraRate));
  }

  // === 薄削持续转化 ===
  if (G.bldSpec.tannery === 'B' && G.res.leather.v > 0 && G.res.coin.v < G.res.coin.mx) {
    var cvt = SPEC_BD.tannery.B.convert;
    if (k === cvt.from)
      lines.push('鞣革坊「薄削」转化  ' + fmtR(-cvt.drainRate * 0.5));
    if (k === cvt.to)
      lines.push('鞣革坊「薄削」转化  ' + fmtR(cvt.gainRate * 0.5));
  }

  // === 自动制作 ===
  if (G.upg.craftMastery?.done) {
    for (var cid in CD) {
      if (!G.autoCraft[cid]) continue;
      var on = G.acOn && G.acOn[cid];
      if (!on) {
        // 暂停状态：检查该配方是否涉及当前资源
        var involves = false;
        for (var i = 0; i < CD[cid].inp.length; i++)
          if (CD[cid].inp[i].r === k) involves = true;
        for (var i = 0; i < CD[cid].out.length; i++)
          if (CD[cid].out[i].r === k) involves = true;
        if (involves) {
          var stopR = (G._acStop && G._acStop[cid]) || '';
          if (stopR === 'full') lines.push('自动' + CD[cid].n + '  暂停（产出已满）');
          else lines.push('自动' + CD[cid].n + '  暂停（原料不足）');
        }
        continue;
      }
      // 直接读取引擎计算的实际自动制作速率
      var ar = (G._acRates && G._acRates[cid]) ? G._acRates[cid] * 0.5 : 0;
      for (var i = 0; i < CD[cid].inp.length; i++) {
        if (CD[cid].inp[i].r === k)
          lines.push('自动' + CD[cid].n + '  ' + fmtR(-CD[cid].inp[i].a * ar));
      }
      for (var i = 0; i < CD[cid].out.length; i++) {
        if (CD[cid].out[i].r === k)
          lines.push('自动' + CD[cid].n + '  ' + fmtR(CD[cid].out[i].a * ar));
      }
    }
  }

  // === v0.15.1 建筑维持消耗 ===
  if (k === 'wine' && G.bld.moonStage?.c > 0) {
    lines.push('月歌台维持 ×' + G.bld.moonStage.c + '  -' + G.bld.moonStage.c + '/年' +
      (G.moonStageActive ? '' : ' ⚠ 醴浆不足，月歌台符咒产出 ×0.25'));
  }
  if (k === 'dye' && G.bld.artistry?.c > 0) {
    lines.push('艺工坊维持 ×' + G.bld.artistry.c + '  -' + G.bld.artistry.c + '/季' +
      (G.artistryActive ? '' : ' ⚠ 彩络不足，艺工坊文化配方加成减半'));
  }

  return lines;
}

// ===== 渲染：Tab栏 =====
// 计算页签内"可点项数"——只算资源足且前置满足的可立即操作项
function tabActionableCount(tabId) {
  var n = 0;
  if (tabId === 'b' || tabId === 'v' || tabId === 'f') {
    // 这些 tab 的建筑：t === tabId
    for (var bid in BD) {
      var bd = BD[bid];
      if (bd.t !== tabId) continue;
      if (anyBranchLocked(bd)) continue;
      if (!chk(bd.uq)) continue;
      if (canB(bid)) n++;
    }
  } else if (tabId === 'c') {
    // 工坊：CD 可见且可制
    for (var cid in CD) {
      var cd = CD[cid];
      if (anyBranchLocked(cd)) continue;
      if (!chk(cd.uq)) continue;
      if (canC(cid)) n++;
    }
  } else if (tabId === 'r') {
    // 研究：未完成 + on + 资源足
    for (var rid in UD) {
      if (G.upg[rid].done || !G.upg[rid].on) continue;
      if (anyBranchLocked(UD[rid])) continue;
      if (canU(rid)) n++;
    }
  } else if (tabId === 'w') {
    // 山外：远行可派 + 商队可买
    for (var did in EXD) {
      var dd = EXD[did];
      if (dd.wip) continue;
      if (!chk(dd.uq)) continue;
      if (isProdLocked('exp', did)) continue;
      if (typeof canSendExp === 'function' && canSendExp(did) && (G.job.scout?.c || 0) > 0) n++;
    }
    if (G.caravan) {
      var cv = CVD[G.caravan.id];
      for (var si = 0; si < cv.sell.length; si++) {
        if (typeof canBuyFromCaravan === 'function' && canBuyFromCaravan(si)) n++;
      }
    }
  } else if (tabId === 'k') {
    // 典制：习俗可激活 + 治理可选项
    if (typeof CUSTD !== 'undefined') {
      for (var ci = 0; ci < CUSTD.length; ci++) {
        var c = CUSTD[ci];
        if (typeof isCustomVisible === 'function' && !isCustomVisible(c)) continue;
        if (G.customs && G.customs[c.id]) continue;
        if (typeof canActivateCustom === 'function' && canActivateCustom(c.id)) n++;
      }
    }
    // 治理：Tier 1 / 政体 / 政策域 可选时计入
    if (G.upg.polityLore?.done && !G.tier1) n++;  // Tier 1 路线待选
    if (G.tier1 && !G.polity) n++;                // 政体待选
    if (G.upg.policyLore?.done && typeof POLICY !== 'undefined') {
      for (var domId in POLICY) {
        var dom = POLICY[domId];
        if (!dom || !dom.permanent) continue;
        if (G.policies && G.policies[domId]) continue;  // 已选过
        // 检查至少一个 opt 资源充足，省得 disable 状态也计数
        if (dom.cost) {
          var costOk = true;
          for (var ri = 0; ri < dom.cost.length; ri++) {
            var p = dom.cost[ri];
            if ((G.res[p.r]?.v || 0) < p.a) { costOk = false; break; }
          }
          if (costOk) n++;
        }
      }
    }
  }
  return n;
}

function rTabs() {
  document.getElementById('tabs').innerHTML = TABS.filter(function(t) {
    return !t.uq || chk(t.uq);
  }).map(function(t) {
    var n = tabActionableCount(t.id);
    var cnt = n > 0 ? '<span class="tab-cnt">(' + n + ')</span>' : '';
    return '<div class="tab' + (t.id === curTab ? ' on' : '') +
      '" onclick="curTab=\'' + t.id + '\';rTabs();rTC()">' + t.n + cnt + '</div>';
  }).join('');
}

// ===== 渲染：远行进度（常驻，不依赖当前Tab） =====
function rExpStatus() {
  var el = document.getElementById('exp-status');
  if (!el) return;
  if (!G.expeditions || !G.expeditions.length) { el.innerHTML = ''; return; }
  var h = '';
  for (var ei = 0; ei < G.expeditions.length; ei++) {
    var exp = G.expeditions[ei];
    var ed = EXD[exp.dest];
    var pct = Math.max(0, Math.min(100, ((exp.totalTicks - exp.ticksLeft) / exp.totalTicks * 100)));
    var daysLeft = Math.ceil(exp.ticksLeft / TPD);
    h += '<div class="exp-active">';
    h += '<div class="exp-active-hdr">';
    h += '<span class="exp-dest-name">' + ed.n + '</span>';
    h += '<span class="exp-info">' + exp.foxCount + '只斥候 · 剩余' + daysLeft + '天</span>';
    if (exp.usedSpiritPath) h += '<span class="exp-spirit-used">灵路已用</span>';
    h += '</div>';
    h += '<div class="exp-bar-bg"><div class="exp-bar-fill" style="width:' + pct.toFixed(1) + '%"></div></div>';
    h += '</div>';
  }
  el.innerHTML = h;
}

// ===== 渲染：能量指示器 =====
function rEnergy() {
  var el = document.getElementById('energy-bar');
  if (!el) return;
  // 隐藏直到有建筑产出或消耗能量；资源面板折叠时也隐藏
  if ((G.energyProd === 0 && G.energyCons === 0) || collapsed.res) {
    el.style.display = 'none';
    return;
  }
  el.style.display = '';
  var net = G.energyNet;
  var ratio = G.energyRatio;
  var cls = net >= 0 ? 'energy-ok' : 'energy-low';
  var pct = G.energyCons > 0 ? Math.min(100, Math.round(ratio * 100)) : 100;
  var h = '<div class="energy-label">能量 <span class="' + cls + '">产 ' +
    fmt(G.energyProd) + ' / 耗 ' + fmt(G.energyCons) + '</span>';
  if (net < 0) h += ' <span class="energy-warn">（缺口 ' + fmt(-net) + '，产出 ×' + pct + '%）</span>';
  h += '</div>';
  h += '<div class="energy-track"><div class="energy-fill ' + cls + '" style="width:' + pct + '%"></div></div>';
  el.innerHTML = h;
}

// ===== 渲染：污染指示器 =====
function rPollution() {
  var el = document.getElementById('pollution-bar');
  if (!el) return;
  // 隐藏直到有污染产出或当前污染值 > 0；资源面板折叠时也隐藏
  if ((G.pollution <= 0 && G.pollutionRate === 0) || collapsed.res) {
    el.style.display = 'none';
    return;
  }
  el.style.display = '';
  var tier = pollutionTier();
  var eff = effectivePollution();
  var ratePerSec = G.pollutionRate * 0.5;
  var rateStr = (ratePerSec >= 0 ? '+' : '') + fmt(ratePerSec) + '/s';

  // 样式映射
  var clsMap = { '清净': 'clean', '轻度': 'mild', '中度': 'moderate', '严重': 'severe', '灾难': 'disaster' };
  var cls = 'pollution-' + (clsMap[tier.n] || 'clean');

  var h = '<div class="pollution-label">污染 <span class="' + cls + '">' +
    fmt(G.pollution) + ' (' + rateStr + ')</span> · ' +
    '<span class="' + cls + '">' + tier.n + '</span>';

  // 烟囱阈值信息
  var thresh = 0;
  for (var id in G.bld) {
    if (!G.bld[id].c) continue;
    var e = BD[id].e;
    if (e && e.pollThresh) thresh += e.pollThresh * G.bld[id].c;
  }
  if (thresh > 0) h += ' <span style="color:#8a8;font-size:10px;">（阈值 +' + thresh + '）</span>';
  h += '</div>';

  // 惩罚效果
  if (tier.hapM < 0) {
    var effects = [];
    if (tier.hapM) effects.push('幸福度 ' + Math.round(tier.hapM * 100) + '%');
    if (tier.berryM) effects.push('野莓 ' + Math.round(tier.berryM * 100) + '%');
    if (tier.maxFox) effects.push('狐狸上限 ' + tier.maxFox);
    if (tier.caravanM) effects.push('商队 ' + Math.round(tier.caravanM * 100) + '%');
    if (tier.loreM) effects.push('研究 ' + Math.round(tier.loreM * 100) + '%');
    h += '<div class="pollution-effects">' + effects.join('，') + '</div>';
  }

  // 进度条（基于有效污染值，以200为满刻度，超过200时按比例缩放）
  var maxDisplay = Math.max(200, eff);
  var pct = Math.min(100, Math.round(eff / maxDisplay * 100));
  h += '<div class="pollution-track"><div class="pollution-fill ' + cls + '" style="width:' + pct + '%"></div></div>';

  // 灰雾禁用建筑提示
  if (G.fogDisabled && G.fogDisabled.length) {
    var names = [];
    for (var i = 0; i < G.fogDisabled.length; i++) {
      var bid = G.fogDisabled[i].id;
      var daysLeft = Math.ceil((G.fogDisabled[i].endTick - G.tick) / TPD);
      names.push(BD[bid].n + '（剩' + daysLeft + '天）');
    }
    h += '<div class="fog-disabled-note">灰雾受损：' + names.join('、') + '</div>';
  }

  el.innerHTML = h;
}

// ===== 渲染：灵脉指示器 =====
function rLeyline() {
  var el = document.getElementById('leyline-bar');
  if (!el) return;
  // 隐藏直到有建筑产出或消耗灵脉；资源面板折叠时也隐藏
  if ((G.leylineProd === 0 && G.leylineCons === 0) || collapsed.res) {
    el.style.display = 'none';
    return;
  }
  el.style.display = '';
  var net = G.leylineNet;
  var ratio = G.leylineRatio;
  var cls = net >= 0 ? 'leyline-ok' : 'leyline-low';
  var pct = G.leylineCons > 0 ? Math.min(100, Math.round(ratio * 100)) : 100;
  var h = '<div class="leyline-label">灵脉 <span class="' + cls + '">产 ' +
    fmt(G.leylineProd) + ' / 耗 ' + fmt(G.leylineCons) + '</span>';
  if (net < 0) h += ' <span class="leyline-warn">（缺口 ' + fmt(-net) + '，产出 ×' + pct + '%）</span>';
  // 灵脉紊乱提示
  if (G.leylineDebuff && G.tick < G.leylineDebuff) {
    var secLeft = Math.ceil((G.leylineDebuff - G.tick) * 0.2);
    h += ' <span class="leyline-warn">紊乱中（-50%，' + secLeft + '秒）</span>';
  }
  h += '</div>';
  h += '<div class="leyline-track"><div class="leyline-fill ' + cls + '" style="width:' + pct + '%"></div></div>';
  el.innerHTML = h;
}

// ===== 渲染：躁念指示器 =====
function rUnrest() {
  var el = document.getElementById('unrest-bar');
  if (!el) return;
  // 隐藏直到有躁念产出或当前躁念值 > 0；资源面板折叠时也隐藏
  if ((G.unrest <= 0 && G.unrestRate === 0) || collapsed.res) {
    el.style.display = 'none';
    return;
  }
  el.style.display = '';
  var tier = unrestTier();
  var eff = effectiveUnrest();
  var ratePerSec = G.unrestRate * 0.5;
  var rateStr = (ratePerSec >= 0 ? '+' : '') + fmt(ratePerSec) + '/s';

  // 样式映射
  var clsMap = { '平静': 'calm', '微躁': 'mild', '不安': 'uneasy', '狂躁': 'frenzy', '心魔': 'demon' };
  var cls = 'unrest-' + (clsMap[tier.n] || 'calm');

  var h = '<div class="unrest-label">躁念 <span class="' + cls + '">' +
    fmt(G.unrest) + ' (' + rateStr + ')</span> · ' +
    '<span class="' + cls + '">' + tier.n + '</span>';

  // 静室阈值信息
  var thresh = 0;
  for (var id in G.bld) {
    if (!G.bld[id].c) continue;
    var e = BD[id].e;
    if (e && e.unrestThresh) thresh += e.unrestThresh * G.bld[id].c;
  }
  if (thresh > 0) h += ' <span style="color:#8a8;font-size:10px;">（阈值 +' + thresh + '）</span>';
  h += '</div>';

  // 惩罚效果
  if (tier.hapM < 0) {
    var effects = [];
    if (tier.hapM) effects.push('幸福度 ' + Math.round(tier.hapM * 100) + '%');
    if (tier.charmM) effects.push('符咒 ' + Math.round(tier.charmM * 100) + '%');
    if (tier.maxFox) effects.push('狐狸上限 ' + tier.maxFox);
    if (tier.spellM) effects.push('灵术 ' + Math.round(tier.spellM * 100) + '%');
    if (tier.loreM) effects.push('研究 ' + Math.round(tier.loreM * 100) + '%');
    h += '<div class="unrest-effects">' + effects.join('，') + '</div>';
  }

  // 进度条（基于有效躁念值，以200为满刻度）
  var maxDisplay = Math.max(200, eff);
  var pct = Math.min(100, Math.round(eff / maxDisplay * 100));
  h += '<div class="unrest-track"><div class="unrest-fill ' + cls + '" style="width:' + pct + '%"></div></div>';

  // 心魔禁用建筑提示
  if (G.demonDisabled && G.demonDisabled.length) {
    var names = [];
    for (var i = 0; i < G.demonDisabled.length; i++) {
      var bid = G.demonDisabled[i].id;
      var daysLeft = Math.ceil((G.demonDisabled[i].endTick - G.tick) / TPD);
      names.push(BD[bid].n + '（剩' + daysLeft + '天）');
    }
    h += '<div class="demon-disabled-note">心魔受损：' + names.join('、') + '</div>';
  }

  el.innerHTML = h;
}

// ===== 渲染：资源面板 =====
function rRes() {
  document.getElementById('left-panel').classList.toggle('collapsed', collapsed.res);
  var toggle = '<div class="collapse-toggle" onclick="toggleCollapse(\'res\')">'
    + (collapsed.res ? '▶︎ 资源' : '▼︎ 资源') + '</div>';
  if (collapsed.res) {
    document.getElementById('res-list').innerHTML = toggle;
    document.getElementById('fox-info').innerHTML =
      '狐狸村民：<b>' + G.foxes + (G.maxFox > 0 ? ' / ' + G.maxFox : '') + '</b>' +
      (G.foxAway > 0 ? ' （外出 ' + G.foxAway + '）' : '') +
      (G.freeFox > 0 ? ' （闲置 ' + G.freeFox + '）' : '');
    return;
  }
  var panel = document.getElementById('res-list');
  // 资源分类默认全展开；玩家点过折叠的会被 localStorage 记住
  function isCatCollapsed(cat) {
    var k = 'resCat_' + cat;
    return !!collapsed[k];
  }
  // 先按分类分组
  var catOrder = [], catItems = {};
  for (var k in RD) {
    var d = RD[k], s = G.res[k];
    if (!s.on) continue;
    if (isProdLocked('res', k)) continue;
    if (!catItems[d.c]) { catOrder.push(d.c); catItems[d.c] = []; }
    catItems[d.c].push(k);
  }
  var h = '';
  for (var ci = 0; ci < catOrder.length; ci++) {
    var cat = catOrder[ci];
    var isColl = isCatCollapsed(cat);
    h += '<div class="res-cat collapse-toggle" onclick="toggleCollapse(\'resCat_' + cat + '\')">'
      + (isColl ? '▶︎ ' : '▼︎ ') + cat + ' <span style="color:#aaa;font-size:11px;">(' + catItems[cat].length + ')</span></div>';
    if (isColl) continue;
    for (var ki = 0; ki < catItems[cat].length; ki++) {
      var k = catItems[cat][ki];
      var d = RD[k], s = G.res[k];
      var rr = '';
      var realRate = s.r * 0.5;
      if (Math.abs(realRate) > 0.0005) rr = '<span class="rr ' + (realRate >= 0 ? 'pos' : 'neg') + '">' +
        (realRate >= 0 ? '+' : '') + fmt(realRate) + '/s</span>';
      var sec = { tip: pickTip('res_' + k, d.tip) };
      var bd = resBreakdown(k);
      if (bd.length) sec.effects = bd;
      var rnCls = 'rn' + (k === 'remnant' ? ' rn-remnant' : '');
      var nameHtml = hpWrap('<span class="' + rnCls + '">' + d.n + '</span>', sec, { cls: 'hp-wrap-res' });
      var rvCls = 'rv' + (k === 'remnant' ? ' rv-remnant' : '');
      h += '<div class="res-row">' + nameHtml +
        '<span class="' + rvCls + '">' + fmt(s.v) +
        (s.mx > 0 ? '/' + fmt(s.mx) : '') + rr + '</span></div>';
    }
  }
  document.getElementById('res-list').innerHTML = toggle + h;
  document.getElementById('fox-info').innerHTML =
    '狐狸村民：<b>' + G.foxes + (G.maxFox > 0 ? ' / ' + G.maxFox : '') + '</b>' +
    (G.foxAway > 0 ? ' （外出 ' + G.foxAway + '）' : '') +
    (G.freeFox > 0 ? ' （闲置 ' + G.freeFox + '）' : '');
}

// ===== v0.16 §四 1.7c 建筑列表渲染（按 tab 过滤，营火 / 村落等多 tab 复用）=====
function renderBldRow(id) {
  var d = BD[id];
  if (!d || !G.bld[id] || !G.bld[id].on) return '';
  if (isProdLocked('bld', id)) return '';
  if (G.bld[id].c === 0 && (anyBranchLocked(d) || (d.uq && !chk(d.uq)))) return '';
  var ok = canB(id);
  // 过滤栏
  if (bldFilter === 'buildable' && !ok) return '';
  if (bldFilter === 'built' && G.bld[id].c <= 0) return '';
  var costs = d.p.map(function(p, i) {
    var need = Math.ceil(bp(id, i));
    var have = Math.floor(G.res[p.r].v);
    var short = have < need;
    // 短缺时显示 当前/需要；充足时只显示需要量（避免冗长）
    var qty = short ? (have + '/' + need) : need;
    return (short ? '<span class="short">' : '') +
      RD[p.r].n + ' ' + qty +
      (short ? '</span>' : '');
  }).join(', ');
  var sec = {
    desc: d.d,
    effects: bldEffects(d.e),
    notes: bldUnlockNotes(d),
    tip: pickTip('bld_' + id, d.tip)
  };
  if (SPEC_BD[id]) {
    if (G.bldSpec[id]) {
      var activeSpec = SPEC_BD[id][G.bldSpec[id]];
      sec.notes = sec.notes || [];
      sec.notes.push('专精「' + activeSpec.n + '」：' + activeSpec.d);
    } else {
      var hasBp = (G.blueprints || []).some(function(bp) { return bp.target === id; });
      if (hasBp) {
        sec.notes = sec.notes || [];
        sec.notes.push('可专精：' + SPEC_BD[id].A.n + ' / ' + SPEC_BD[id].B.n + '（需≥5座 + 图纸）');
      }
    }
  }
  // 建筑卡内部内容（名 + 计数 + 状态徽章 + 造价）
  var inner = '<span class="bld-name">' + d.n + '</span>';
  inner += '<span class="bld-cnt">(' + G.bld[id].c + ')';
  if (G.fogDisabled && G.fogDisabled.length) {
    var fogCnt = 0;
    for (var fi = 0; fi < G.fogDisabled.length; fi++) {
      if (G.fogDisabled[fi].id === id) fogCnt++;
    }
    if (fogCnt > 0) inner += '<span class="fog-disabled-note"> (' + fogCnt + '座受损)</span>';
  }
  if (G.bldSpec[id] && SPEC_BD[id]) {
    var specN = SPEC_BD[id][G.bldSpec[id]].n;
    inner += '<span class="spec-tag">「' + specN + '」</span>';
  }
  inner += '</span>';
  if (id === 'moonStage' && G.bld.moonStage.c > 0 && !G.moonStageActive)
    inner += '<span class="maint-warn" title="月歌台每年春季需 1 醴浆/座维持；断供时符咒产出 ×0.25"> ⚠ 醴浆断供，符咒 ×0.25</span>';
  if (id === 'artistry' && G.bld.artistry.c > 0 && !G.artistryActive)
    inner += '<span class="maint-warn" title="艺工坊每季需 1 彩络/座维持；断供时文化配方加成减半"> ⚠ 彩络断供，文化加成减半</span>';
  inner += '<span class="bld-cost">' + costs + '</span>';
  // 整行 = 一个建造按钮（hover 出 desc/effects 浮窗）
  var cardOnClick = ok ? ('build(\'' + id + '\')') : '';
  var card = hpWrap(
    '<span class="bld-inner">' + inner + '</span>',
    sec,
    { cls: 'bld-card' + (ok ? '' : ' dis'), onclick: cardOnClick }
  );
  var h = '<div class="bld-row">' + card;
  // 旁边小出售按钮（只在已建≥1时显示）
  if (G.bld[id].c > 0) h += '<button class="sell-btn-mini" onclick="sell(\'' + id + '\')" title="出售一座">×</button>';
  h += '</div>';
  return h;
}

var bldFilter = 'all';  // 'all' | 'buildable' | 'built'
function setBldFilter(f) { bldFilter = f; rTC(); }

function renderBldList(tab) {
  var groups = (tab === 'v') ? BLD_GROUPS_V : BLD_GROUPS;
  var h = '';
  // 先统计本 tab 的过滤计数（only count visible buildings）
  var counts = { all: 0, buildable: 0, built: 0 };
  for (var bid in BD) {
    var bd = BD[bid];
    if (!bd || !G.bld[bid] || !G.bld[bid].on) continue;
    if (bd.t !== tab) continue;
    if (isProdLocked('bld', bid)) continue;
    if (G.bld[bid].c === 0 && (anyBranchLocked(bd) || (bd.uq && !chk(bd.uq)))) continue;
    counts.all++;
    if (canB(bid)) counts.buildable++;
    if (G.bld[bid].c > 0) counts.built++;
  }
  // 过滤栏（只在 all > 0 时显示；0 数量的 chip 灰掉）
  if (counts.all > 0) {
    var chipDef = [
      { k: 'all', n: '全部' },
      { k: 'buildable', n: '可建造' },
      { k: 'built', n: '已建' },
    ];
    h += '<div class="bld-filter">';
    for (var ci = 0; ci < chipDef.length; ci++) {
      var c = chipDef[ci];
      var on = bldFilter === c.k;
      var n = counts[c.k];
      var dis = n === 0;
      h += '<span class="bld-chip' + (on ? ' on' : '') + (dis ? ' dis' : '') + '"'
        + (dis ? '' : ' onclick="setBldFilter(\'' + c.k + '\')"') + '>'
        + c.n + ' <span class="bld-chip-n">' + n + '</span></span>';
    }
    h += '</div>';
  }
  // 分组渲染
  for (var gi = 0; gi < groups.length; gi++) {
    var grp = groups[gi];
    // 分支组整体不可见判断：工业组需选工业路，灵修组需选灵修路
    if (grp.br && G.policies && G.policies.branch && G.policies.branch !== grp.br) continue;
    // 副线组整体不可见判断：通达组需选通达政策
    if (grp.sb && (!G.subBranches || !G.subBranches[grp.sb])) continue;
    // 先收集该组中可见的建筑行
    var rows = '';
    for (var ii = 0; ii < grp.ids.length; ii++) {
      var id = grp.ids[ii];
      var d = BD[id];
      if (!d) continue;
      // 按 t 字段过滤
      if (d.t && d.t !== tab) continue;
      if (!d.t && tab !== 'b') continue;
      rows += renderBldRow(id);
    }
    if (!rows) continue;  // 组内无可见建筑则跳过
    var gKey = 'bld_' + grp.n;
    var isCollapsed = groupCollapsed[gKey];
    h += '<div class="grp-hdr" onclick="toggleGroup(\'' + gKey + '\')">'
      + (isCollapsed ? '▶ ' : '▼ ') + grp.n + '</div>';
    if (!isCollapsed) h += '<div class="bld-grid">' + rows + '</div>';
  }
  // 兜底：未归组的建筑仍然显示（防遗漏）
  var grouped = {};
  for (var gi = 0; gi < groups.length; gi++)
    for (var ii = 0; ii < groups[gi].ids.length; ii++) grouped[groups[gi].ids[ii]] = 1;
  var orphanRows = '';
  for (var id in BD) {
    if (grouped[id]) continue;
    var d = BD[id];
    if (d.t && d.t !== tab) continue;
    if (!d.t && tab !== 'b') continue;
    orphanRows += renderBldRow(id);
  }
  if (orphanRows) h += '<div class="bld-grid">' + orphanRows + '</div>';
  return h;
}

// §五 2.4: 单个配方行渲染（从 rTC 提取，供分组复用）
function renderCraftRow(id, hasAuto) {
  var d = CD[id];
  if (!d || !chk(d.uq) || anyBranchLocked(d)) return '';
  var ok = canC(id);
  var cost = d.inp.map(function(p) {
    var rec = G.res[p.r];
    var have = rec ? rec.v : 0;
    var resName = (RD[p.r] && RD[p.r].n) || p.r;
    return (have < p.a ? '<span class="short">' : '') +
      resName + ' ' + p.a + (have < p.a ? '</span>' : '');
  }).join(', ');
  var out = d.out.map(function(p) {
    if (p.r.charAt(0) === '_') {
      // 永久配方：内部字段，显示描述文本而非资源名
      var permNames = { _pietyMxPerm: '虔诚上限', _edictCDReduce: '教令冷却', _holyGearBonus: '工业配方加成', _gateDiscount: '开门折扣', _expRewardBonus: '远行奖励', _holyBldDiscount: '神圣建筑折扣', _forgeSteelReduce: '圣工坊钢消耗' };
      return (permNames[p.r] || p.r) + ' +' + (p.a < 1 ? Math.round(p.a * 100) + '%' : p.a);
    }
    var resName = (RD[p.r] && RD[p.r].n) || p.r;
    return resName + ' ' + p.a;
  }).join(', ');
  var sec = { desc: d.d, tip: pickTip('craft_' + id, d.tip) };
  if (hasAuto && G.autoCraft[id]) {
    var running = G.acOn && G.acOn[id];
    var autoRate = 1 / (50 * TMS / 1000);
    var autoEffects = [];
    var actualAcRate = (G._acRates && G._acRates[id]) ? G._acRates[id] * 0.5 : 0;
    autoEffects.push('满速: ' + d.out.map(function(p) { return RD[p.r].n + ' +' + fmt(p.a * autoRate) + '/s'; }).join(', '));
    if (running) {
      if (actualAcRate > 0 && actualAcRate < autoRate * 0.99) {
        autoEffects.push('状态: 降速运行（' + d.out.map(function(p) { return RD[p.r].n + ' +' + fmt(p.a * actualAcRate) + '/s'; }).join(', ') + '）');
      } else {
        autoEffects.push('状态: 满速运行中');
      }
    } else {
      var stopReason = (G._acStop && G._acStop[id]) || '';
      if (stopReason === 'full') autoEffects.push('状态: 暂停（产出已满）');
      else autoEffects.push('状态: 暂停（原料不足）');
    }
    autoEffects.push('原料不足时自动降速');
    sec.effects = autoEffects;
  }
  var nameHtml = hpWrap('<span class="cr-name">' + d.n + '</span>', sec);
  var autoBtn = '';
  if (hasAuto) {
    var isOn = G.autoCraft[id];
    autoBtn = '<button class="cr-btn auto-btn' + (isOn ? ' auto-on' : '') +
      '" onclick="toggleAutoCraft(\'' + id + '\')">' +
      (isOn ? '自动:开' : '自动:关') + '</button>';
  }
  return '<div class="cr-row"><div class="cr-top">' +
    nameHtml +
    '<span class="cr-cost">' + cost + ' → ' + out + '</span>' +
    '<button class="cr-btn" onclick="craft(\'' + id + '\')" ' +
    (ok ? '' : 'disabled') + '>制作</button>' +
    (id === 'barrel' ? '<button class="cr-btn" onclick="useBarrel()" ' +
    (G.res.barrel && G.res.barrel.v >= 1 ? '' : 'disabled') +
    ' title="消耗1油桶，火油上限永久+10（已用' + (G.barrelUsed || 0) + '桶）">开桶</button>' : '') +
    (id === 'elixir' ? '<button class="cr-btn" onclick="useElixir()" ' +
    (G.res.elixir && G.res.elixir.v >= 1 ? '' : 'disabled') +
    ' title="消耗1灵液，灵能上限永久+10（已用' + (G.elixirUsed || 0) + '瓶）">饮用</button>' : '') +
    autoBtn + '</div></div>';
}

// ===== 渲染：Tab内容 =====
function rTC() {
  document.getElementById('center-panel').classList.toggle('collapsed', collapsed.tc);
  var curTabName = '';
  for (var ti = 0; ti < TABS.length; ti++) { if (TABS[ti].id === curTab) { curTabName = TABS[ti].n; break; } }
  var toggle = '<div class="collapse-toggle" onclick="toggleCollapse(\'tc\')">'
    + (collapsed.tc ? '▶︎ ' + curTabName : '▼︎ ' + curTabName) + '</div>';
  if (collapsed.tc) {
    document.getElementById('tc').innerHTML = toggle;
    return;
  }
  var h = '';

  if (curTab === 'b') {
    // 手动采集按钮（悬浮面板）
    h += '<div class="gather-row">';
    var gatherBtns = [
      { key: 'berry', label: '采集野莓', onclick: "gather('berry')" },
      { key: 'wood',  label: '拾取圆木', onclick: "gather('wood')" },
      { key: 'stone', label: '捡拾碎石', onclick: "gather('stone')" },
    ];
    for (var gi = 0; gi < gatherBtns.length; gi++) {
      var gb = gatherBtns[gi];
      var sec = { tip: pickTip('gather_' + gb.key, GATHER_TIP[gb.key]) };
      h += hpWrap(
        '<button class="gbtn" onclick="' + gb.onclick + '">' + gb.label + '</button>',
        sec,
        { cls: 'hp-wrap-gather' }
      );
    }
    h += '</div>';

    // 建筑列表（§四 1.2/1.7c：按 d.t 过滤，村落 tab 也调用同一函数）
    h += renderBldList('b');


    // 灵术按钮
    var anySpell = 0;
    for (var sid in SD) {
      if (!chk(SD[sid].uq)) continue;
      // 分支门控：主线 br 或副线 sb 不满足时不显示
      if (anyBranchLocked(SD[sid])) continue;
      if (isProdLocked('spell', sid)) continue;
      if (!anySpell) { h += '<div class="res-cat" style="margin-top:10px;">灵术</div>'; anySpell = 1; }
      var ok = canSpell(sid);
      var sMul = spellCostMul();
      var cost = SD[sid].cost.map(function(p) {
        var need = Math.ceil(p.a * sMul);
        var have = G.res[p.r].v;
        return (have < need ? '<span class="short">' : '') +
          RD[p.r].n + ' ' + need + (have < need ? '</span>' : '');
      }).join(', ');
      var extra = '';
      if (sid === 'rain' && G.rainSeason === G.season) extra = ' <span style="color:#888;font-size:11px;">（本季已施）</span>';
      if (sid === 'summon' && G.spiritSeason === G.season) extra = ' <span style="color:#888;font-size:11px;">（本季已施）</span>';
      if (sid === 'harvest' && G.harvestSeason === G.season) extra = ' <span style="color:#888;font-size:11px;">（本季已施）</span>';
      if (sid === 'feast' && G.feastSeason === G.season) extra = ' <span style="color:#888;font-size:11px;">（本季已施）</span>';
      if (sid === 'tradeWind' && G.tradeWindYear === G.year) extra = ' <span style="color:#888;font-size:11px;">（今年已施）</span>';
      if (sid === 'tradeWind' && G.caravan) extra = ' <span style="color:#888;font-size:11px;">（商队在场）</span>';
      if (sid === 'overflow' && G.overflowSeason === G.season) extra = ' <span style="color:#888;font-size:11px;">（本季已施）</span>';
      if (sid === 'doubleCraft' && G.doubleCraftSeason === G.season) extra = ' <span style="color:#888;font-size:11px;">（本季已施）</span>';
      if (sid === 'inkPact' && G.inkPact === G.season) extra = ' <span style="color:#888;font-size:11px;">（已写就，等下次研究）</span>';
      if (sid === 'spiritPath') {
        var hasTarget = false;
        for (var ei = 0; ei < (G.expeditions||[]).length; ei++)
          if (!G.expeditions[ei].usedSpiritPath) hasTarget = true;
        if (!hasTarget) extra = ' <span style="color:#888;font-size:11px;">（无可加速）</span>';
        else {
          // 找目标显示
          var tgt = null, maxT = -1;
          for (var ei = 0; ei < G.expeditions.length; ei++)
            if (!G.expeditions[ei].usedSpiritPath && G.expeditions[ei].ticksLeft > maxT) { maxT = G.expeditions[ei].ticksLeft; tgt = G.expeditions[ei]; }
          if (tgt) extra = ' <span style="color:#888;font-size:11px;">（→' + EXD[tgt.dest].n + '）</span>';
        }
      }
      // 灵视：显示目标远行
      if (sid === 'spiritSight') {
        var hasSightTarget = false;
        for (var ei = 0; ei < (G.expeditions||[]).length; ei++)
          if (!G.expeditions[ei].usedSpiritSight) hasSightTarget = true;
        if (!hasSightTarget) extra = ' <span style="color:#888;font-size:11px;">（无可加速）</span>';
        else {
          var stgt = null, smaxT = -1;
          for (var ei = 0; ei < G.expeditions.length; ei++)
            if (!G.expeditions[ei].usedSpiritSight && G.expeditions[ei].ticksLeft > smaxT) { smaxT = G.expeditions[ei].ticksLeft; stgt = G.expeditions[ei]; }
          if (stgt) extra = ' <span style="color:#888;font-size:11px;">（→' + EXD[stgt.dest].n + '）</span>';
        }
      }
      if (sid === 'tidePull' && G.tidePullSeason === G.season) extra = ' <span style="color:#888;font-size:11px;">（本季已施）</span>';
      if (sid === 'fateWeave' && G.fateWeaveSeason === G.season) extra = ' <span style="color:#888;font-size:11px;">（本季已施）</span>';
      if (sid === 'resonWave' && G.resonWaveSeason === G.season) extra = ' <span style="color:#888;font-size:11px;">（本季已施）</span>';
      if (sid === 'shapeFox') {
        if (G.shapeFoxSeason >= 0) {
          var _sDiff = G.season - G.shapeFoxSeason; if (_sDiff < 0) _sDiff += 4;
          if (_sDiff <= (G.shapeFoxExtra || 0)) extra = ' <span style="color:#4a8;font-size:11px;">（化形中）</span>';
          else extra = '';
        }
      }
      if (sid === 'sageUtter' && G.sageUtterActive) extra = ' <span style="color:#4a8;font-size:11px;">（待用）</span>';
      // 真实冷却倒计时显示
      if (SD[sid].cooldown && G.spellCooldowns[sid] && G.spellCooldowns[sid] > G.tick) {
        var cdLeft = Math.ceil((G.spellCooldowns[sid] - G.tick) / 5); // tick → 秒
        extra += ' <span style="color:#c66;font-size:11px;">冷却 ' + cdLeft + 's</span>';
      }
      var sec = { effects: [SD[sid].d], tip: pickTip('spell_' + sid, SD[sid].tip) };
      var nameHtml = hpWrap('<span class="cr-name">' + SD[sid].n + '</span>', sec);
      h += '<div class="cr-row"><div class="cr-top">' +
        nameHtml + extra +
        '<span class="cr-cost">' + cost + '</span>' +
        '<button class="cr-btn" onclick="castSpell(\'' + sid + '\')" ' +
        (ok ? '' : 'disabled') + '>施法</button></div></div>';
    }
  }

  else if (curTab === 'v') {
    // 满意度计算明细
    var hapNotes = ['基础：100%'];
    if (G.foxes > 5) hapNotes.push('人口惩罚（' + G.foxes + '-5）：-' + ((G.foxes - 5) * 2) + '%');
    for (var bid in G.bld) {
      if (G.bld[bid].c && BD[bid].e?.hapB) {
        var base = BD[bid].e.hapB * G.bld[bid].c * 100 | 0;
        hapNotes.push(BD[bid].n + ' ×' + G.bld[bid].c + '：+' + base + '%');
      }
      // 福佑额外满意度
      if (bid === 'shrine' && G.bld[bid].c && G.bldSpec.shrine === 'A') {
        var bonus = SPEC_BD.shrine.A.hapBonus * G.bld[bid].c * 100 | 0;
        hapNotes.push('灵狐祠「福佑」×' + G.bld[bid].c + '：+' + bonus + '%');
      }
    }
    for (var uid in G.upg) {
      if (G.upg[uid].done && UD[uid].e?.hapB)
        hapNotes.push(UD[uid].n + '：+' + (UD[uid].e.hapB * 100 | 0) + '%');
    }
    if (G.feastSeason === G.season) hapNotes.push('山谷宴席：+15%');
    if (G.choiceBuffs && G.choiceBuffs.happySeason === G.season) hapNotes.push('掌印墙：+10%');
    var hapSec = { effects: hapNotes, notes: ['当前职业产出倍率：×' + (G.happy * 100 | 0) + '%'] };
    var hapHtml = hpWrap('<b>' + (G.happy * 100 | 0) + '%</b>', hapSec);

    h += '<div class="village-hdr">闲置：<b>' + Math.max(0, G.freeFox) +
      '</b> / 在村 ' + (G.foxes - (G.foxAway || 0)) + ' &nbsp; 满意度：' + hapHtml + '</div>';
    // v0.16 §四 1.2 治理建筑（议事堂/政堂）+ 后续 t:'v' 建筑
    h += renderBldList('v');
    var any = 0;
    for (var id in JD) {
      var d = JD[id];
      if (!G.job[id].on) continue; any = 1;
      var trainLv = G.train[id] || 0;
      var eff = jobEffects(id, d.e);
      if (trainLv > 0) eff.push('授业加成：+' + (trainLv * 10) + '%');
      // v0.15.1 商贩路边生意进度条
      if (id === 'merchant' && G.bld.tradePost?.c > 0 && G.res.spice?.mx > 0) {
        var acc = G.merchantSpiceAcc || 0;
        var pct = Math.min(100, (acc / 15 * 100));
        eff.push('路边生意进度：' + fmt(acc) + ' / 15（' + Math.floor(pct) + '%）');
      }
      var sec = {
        desc: (d.desc && d.desc === d.d) ? '' : d.d,
        effects: eff,
        tip: pickTip('job_' + id, d.tip)
      };
      // 添加天赋信息到悬浮面板（§14.5 修复 2：玩家接触过图纸系统后才暴露"可天赋"）
      if (SPEC_JD[id]) {
        if (G.jobTalent[id]) {
          sec.notes = sec.notes || [];
          var activeTal = SPEC_JD[id][G.jobTalent[id]];
          sec.notes.push('天赋「' + activeTal.n + '」：' + activeTal.d);
        } else {
          var seenBlueprint = (G.blueprints || []).length > 0
            || Object.keys(G.bldSpec || {}).length > 0
            || Object.keys(G.jobTalent || {}).length > 0;
          if (seenBlueprint) {
            sec.notes = sec.notes || [];
            sec.notes.push('可天赋：' + SPEC_JD[id].A.n + ' / ' + SPEC_JD[id].B.n + '（需图纸）');
          }
        }
      }
      var jobLabel = d.n;
      if (G.jobTalent[id] && SPEC_JD[id]) {
        jobLabel += '<span class="talent-tag">「' + SPEC_JD[id][G.jobTalent[id]].n + '」</span>';
      }
      var nameHtml = hpWrap('<span class="jn">' + jobLabel + '</span>', sec);
      var tCost = trainCost(id);
      var tOk = canTrain(id);
      var trainSec = {
        desc: id === 'scout'
          ? '消耗 ' + tCost + ' 卷轴，所有远行奖励倍率 +10%'
          : id === 'smelter'
          ? '消耗 ' + tCost + ' 卷轴，炉匠炼钢速率 +10%'
          : id === 'machinist'
          ? '消耗 ' + tCost + ' 卷轴，机师能量加成效率 +10%'
          : id === 'engineer'
          ? '消耗 ' + tCost + ' 卷轴，工程师配方加成与蓝本产出 +10%'
          : id === 'silkWeaver'
          ? '消耗 ' + tCost + ' 卷轴，织丝人织丝速率 +10%'
          : '消耗 ' + tCost + ' 卷轴，该职业所有从业者产出 +10%',
        tip: pickTip('train_' + id, ['师傅领进门，修行靠嚼草。', '学会了新本事的狐狸，尾巴翘得更高了。'])
      };
      var trainBtnHtml = hpWrap(
        '<button class="train-btn" onclick="trainJob(\'' + id + '\')" ' +
        (tOk ? '' : 'disabled') + '>授业</button>',
        trainSec,
        { cls: 'hp-wrap-train' }
      );
      var trainHtml = '<span class="job-train">' +
        trainBtnHtml +
        (trainLv > 0 ? '<span class="train-lv">Lv' + trainLv + '</span>' : '') +
        '</span>';
      h += '<div class="job-row">' +
        '<button class="jbtn" onclick="aJob(\'' + id + '\',-1)">-</button>' +
        '<span class="jc">' + G.job[id].c + '</span>' +
        '<button class="jbtn" onclick="aJob(\'' + id + '\',1)">+</button>' +
        nameHtml +
        '<span class="jd">' + d.d + '</span>' +
        trainHtml + '</div>';
      // v0.15.1 商贩路边生意进度条（可见，位于商贩行下方）
      if (id === 'merchant' && G.job.merchant.c > 0 && G.bld.tradePost?.c > 0 && G.res.spice?.mx > 0) {
        var acc = G.merchantSpiceAcc || 0;
        var pct = Math.min(100, (acc / 15 * 100));
        var filled = Math.round(pct / 10);
        var bar = '';
        for (var bi = 0; bi < 10; bi++) bar += (bi < filled ? '█' : '░');
        h += '<div class="merchant-spice-bar" title="商贩兼营路边小摊：累积满 15 铜钱产率时，有 60% 概率获得 1 香草。">' +
          '<span class="msb-label">路边生意（满进度 60% 概率 +1 香草）</span> ' +
          '<span class="msb-bar">[' + bar + ']</span> ' +
          '<span class="msb-val">' + fmt(acc) + ' / 15</span></div>';
      }
    }
    if (!any) h += '<div style="color:#aaa;font-size:13px;">建造设施来解锁职业。</div>';
  }

  else if (curTab === 'c') {
    var any = 0;
    var hasAuto = G.upg.craftMastery?.done;
    // §五 2.4: 工坊分组渲染
    var grouped = {};
    for (var cgi = 0; cgi < CRAFT_GROUPS.length; cgi++) {
      var cgrp = CRAFT_GROUPS[cgi];
      if (cgrp.br && G.policies && G.policies.branch && G.policies.branch !== cgrp.br) continue;
      // 副线组整体不可见判断
      if (cgrp.sb && (!G.subBranches || !G.subBranches[cgrp.sb])) continue;
      var crows = '';
      for (var ci = 0; ci < cgrp.ids.length; ci++) {
        var cid = cgrp.ids[ci];
        grouped[cid] = 1;
        crows += renderCraftRow(cid, hasAuto);
      }
      if (!crows) continue;
      any = 1;
      var cgKey = 'craft_' + cgrp.n;
      var cgCol = groupCollapsed[cgKey];
      h += '<div class="grp-hdr" onclick="toggleGroup(\'' + cgKey + '\')">'
        + (cgCol ? '▶ ' : '▼ ') + cgrp.n + '</div>';
      if (!cgCol) h += crows;
    }
    // 兜底：未归组的配方
    for (var id in CD) {
      if (grouped[id]) continue;
      var row = renderCraftRow(id, hasAuto);
      if (row) { any = 1; h += row; }
    }
    if (!any) h += '<div style="color:#aaa;font-size:13px;">继续研究来解锁配方。</div>';

    // --- 图纸背包 ---
    if (G.blueprints && G.blueprints.length > 0) {
      h += '<div class="res-cat" style="margin-top:10px;">图纸</div>';
      for (var bi = 0; bi < G.blueprints.length; bi++) {
        var bpItem = G.blueprints[bi];
        var specData = bpItem.type === 'bld' ? SPEC_BD[bpItem.target][bpItem.spec] : SPEC_JD[bpItem.target][bpItem.spec];
        var targetName = bpItem.type === 'bld' ? (BD[bpItem.target]?.n || bpItem.target) : (JD[bpItem.target]?.n || bpItem.target);
        var canActivate = false;
        var disableReason = '';
        if (bpItem.type === 'bld') {
          if (G.bldSpec[bpItem.target]) disableReason = '已激活';
          else if ((G.bld[bpItem.target]?.c || 0) < 5) disableReason = '需要 ' + targetName + ' ≥5 座';
          else canActivate = true;
        } else {
          if (G.jobTalent[bpItem.target]) disableReason = '已激活';
          else canActivate = true;
        }
        var bpSec = {
          desc: (bpItem.type === 'bld' ? '建筑专精' : '职业天赋') + '：' + targetName,
          effects: [specData.d],
          tip: pickTip('bp_' + bpItem.id, specData.tip)
        };
        var bpNameHtml = hpWrap('<span class="cr-name">' + specData.n + '</span>', bpSec);
        h += '<div class="cr-row bp-inv-row"><div class="cr-top">';
        h += bpNameHtml;
        h += '<span class="bp-target-label">' + targetName + '</span>';
        if (disableReason) {
          h += '<span class="bp-disable-reason">' + disableReason + '</span>';
          h += '<button class="cr-btn" disabled>激活</button>';
        } else {
          var activateFn = bpItem.type === 'bld' ? 'activateSpec' : 'activateJobTalent';
          h += '<button class="cr-btn" onclick="' + activateFn + '(' + bi + ')">激活</button>';
        }
        h += '</div></div>';
      }
    }

    // --- 进阶升级 ---
    var anyUpgd = 0;
    for (var uid in UPGD) {
      if (!G.upgd[uid] || G.upgd[uid].done || !G.upgd[uid].on) continue;
      if (anyBranchLocked(UPGD[uid])) continue;
      if (!anyUpgd) { h += '<div class="res-cat" style="margin-top:10px;">进阶</div>'; anyUpgd = 1; }
      var ud = UPGD[uid];
      var ok = canUpgd(uid);
      var cost = ud.p.map(function(p) {
        var rec = G.res[p.r];
        var have = rec ? rec.v : 0;
        var resName = (RD[p.r] && RD[p.r].n) || p.r;
        return (have < p.a ? '<span class="short">' : '') +
          resName + ' ' + p.a + (have < p.a ? '</span>' : '');
      }).join(', ');
      var sec = { desc: ud.d, effects: upgdEffects(ud.e), tip: ud.tip ? pickTip('upgd_' + uid, ud.tip) : '' };
      var nameHtml = hpWrap('<span class="cr-name">' + ud.n + '</span>', sec);
      h += '<div class="cr-row upgd-row"><div class="cr-top">' +
        nameHtml +
        '<span class="cr-cost">' + cost + '</span>' +
        '<button class="cr-btn" onclick="buyUpgd(\'' + uid + '\')" ' +
        (ok ? '' : 'disabled') + '>购买</button></div></div>';
    }
    // 已购买的进阶升级
    var doneUpgd = [];
    for (var uid in G.upgd) { if (G.upgd[uid] && G.upgd[uid].done && UPGD[uid]) doneUpgd.push(uid); }
    if (doneUpgd.length) {
      if (!anyUpgd) h += '<div class="res-cat" style="margin-top:10px;">进阶</div>';
      h += '<div class="upgd-done-list">';
      for (var i = 0; i < doneUpgd.length; i++) {
        var uid = doneUpgd[i];
        var sec = { desc: UPGD[uid].d, effects: upgdEffects(UPGD[uid].e), tip: UPGD[uid].tip ? pickTip('upgd_' + uid, UPGD[uid].tip) : '' };
        var nameHtml = hpWrap('<span class="upgd-done-tag">✓ ' + UPGD[uid].n + '</span>', sec);
        h += nameHtml;
      }
      h += '</div>';
    }
  }

  else if (curTab === 'r') {
    var any = 0;
    for (var id in UD) {
      var d = UD[id];
      if (G.upg[id].done || !G.upg[id].on) continue; any = 1;
      var ok = canU(id);
      var rMul = researchCostMul();
      var cost = d.p.map(function(p) {
        var need = Math.ceil(p.a * rMul);
        var have = G.res[p.r].v;
        return (have < need ? '<span class="short">' : '') +
          RD[p.r].n + ' ' + need + (have < need ? '</span>' : '');
      }).join(', ');
      var sec = { desc: d.d, effects: upgEffects(d.e), tip: pickTip('upg_' + id, d.tip) };
      var nameHtml = hpWrap('<span class="cr-name">' + d.n + '</span>', sec);
      h += '<div class="cr-row"><div class="cr-top">' +
        nameHtml +
        '<span class="cr-cost">' + cost + '</span>' +
        '<button class="cr-btn" onclick="research(\'' + id + '\')" ' +
        (ok ? '' : 'disabled') + '>研究</button></div></div>';
    }
    var done = Object.entries(G.upg).filter(function(e) { return e[1].done; });
    if (done.length) {
      h += '<div class="res-cat" style="margin-top:8px;">已完成</div>';
      for (var i = 0; i < done.length; i++) {
        var uid = done[i][0];
        var sec = { effects: upgEffects(UD[uid].e), tip: pickTip('upg_' + uid, UD[uid].tip) };
        var nameHtml = hpWrap('✓ ' + UD[uid].n, sec);
        h += '<div class="cr-done">' + nameHtml + '</div>';
      }
    }
    if (!any && !done.length)
      h += '<div style="color:#aaa;font-size:13px;">建造藏书阁来解锁研究。</div>';
  }

  else if (curTab === 'w') {
    // ===== 山外 Tab =====

    // --- 通达副线：声望面板 + 外交建筑 ---
    if (G.subBranches && G.subBranches.T) {
      // 声望面板（声望学研究后显示）
      if (G.upg.reputeLore?.done) {
        var reputePct = ((G._reputeBonus || 0) * 100).toFixed(1);
        var reputeCapPct = ((G._reputeCap || 0.40) * 100).toFixed(0);
        h += '<div class="divine-panel">';
        h += '<div class="grace-info">声望加成: <strong>' + reputePct + '%</strong> / ' + reputeCapPct + '%</div>';
        h += '</div>';
      }
      // 声誉/信物资源显示
      if (G.res.renown?.on) {
        h += '<div class="res-status">声誉: ' + fmt(G.res.renown.v) + ' / ' + fmt(G.res.renown.mx) + '</div>';
      }
      if (G.res.credential?.on) {
        h += '<div class="res-status">信物: ' + fmt(G.res.credential.v) + ' / ' + fmt(G.res.credential.mx) + '</div>';
      }
      // 邦书/异珍资源显示
      if (G.res.charter?.on) {
        h += '<div class="res-status">邦书: ' + fmt(G.res.charter.v) + ' / ' + fmt(G.res.charter.mx) + '</div>';
      }
      if (G.res.exotic?.on) {
        h += '<div class="res-status">异珍: ' + fmt(G.res.exotic.v) + ' / ' + fmt(G.res.exotic.mx) + '</div>';
      }
      // v0.19 §七 4.4 邦交系统面板
      if (G.upg.allianceInit?.done && G._alliance) {
        h += '<div class="res-cat" style="margin-top:10px;">邦交</div>';
        if (G._allianceJoyRemain > 0) {
          h += '<div class="grace-info" style="color:#8c8;">结邦喜悦：全局产出 +10%（剩 ' + G._allianceJoyRemain + ' 季）</div>';
        }
        for (var tribe in ALLIANCE_TRIBES) {
          var td = ALLIANCE_TRIBES[tribe];
          var depth = G._alliance[tribe] || 0;
          var favor = (G._allianceFavor[tribe] || 0);
          var depthName = depth > 0 ? ALLIANCE_DEPTH[depth].n : '未结交';
          var frozen = G._allianceFrozen && G._allianceFrozen[tribe];
          var nextDef = depth < 2 ? ALLIANCE_DEPTH[depth + 1] : null;
          var canDeepen = nextDef && canDeepenAlliance(tribe);
          h += '<div class="alliance-row" style="padding:4px 0;border-bottom:1px solid #333;">';
          h += '<span style="font-weight:bold;">' + td.n + '</span>';
          h += ' <span style="color:#aaa;font-size:12px;">(' + td.desc + ')</span>';
          h += ' — <span style="color:' + (frozen ? '#c66' : '#8c8') + ';">' + depthName + (frozen ? '(冻结)' : '') + '</span>';
          h += ' <span style="font-size:11px;color:#888;">好感:' + Math.floor(favor) + '</span>';
          if (depth > 0 && depth <= 2) {
            h += ' <span style="font-size:11px;color:#9a9;">浅层: ' + td.shallow + '</span>';
          }
          if (nextDef) {
            var costParts = [];
            for (var rk in nextDef.cost) {
              var need = nextDef.cost[rk];
              var have = G.res[rk] ? G.res[rk].v : 0;
              var ok = have >= need;
              costParts.push((ok ? '' : '<span class="short">') + RD[rk].n + ' ' + need + (ok ? '' : '</span>'));
            }
            var favorOk = favor >= nextDef.favor;
            h += '<div style="font-size:12px;margin-left:16px;color:#999;">';
            h += '→ ' + nextDef.n + ': ' + costParts.join(', ');
            h += ' · ' + (favorOk ? '' : '<span class="short">') + '好感≥' + nextDef.favor + (favorOk ? '' : '</span>');
            h += ' <button class="btn' + (canDeepen ? '' : ' dis') + '" style="font-size:11px;padding:1px 6px;" onclick="deepenAlliance(\'' + tribe + '\')"'
              + (canDeepen ? '' : ' disabled') + '>深化</button>';
            h += '</div>';
          }
          h += '</div>';
        }
      }
      // 外交建筑
      h += renderBldList('w');
      // 外交升级（与研究 tab 进阶升级同样式：cr-row + upgd-row）
      var dipUpgH = '';
      var dipUpgDone = [];
      for (var uid in UPGD) {
        if (UPGD[uid].sb !== 'T') continue;
        if (anyBranchLocked(UPGD[uid])) continue;
        if (G.upgd[uid]?.done) { dipUpgDone.push(uid); continue; }
        if (!chk(UPGD[uid].uq)) continue;
        var ug = UPGD[uid];
        var ok = canUpgd(uid);
        var cost = ug.p.map(function(p) {
          var have = G.res[p.r].v;
          return (have < p.a ? '<span class="short">' : '') +
            RD[p.r].n + ' ' + fmt(p.a) + (have < p.a ? '</span>' : '');
        }).join(', ');
        var sec = { desc: ug.d, effects: upgdEffects(ug.e), tip: ug.tip ? pickTip('upgd_' + uid, ug.tip) : '' };
        var nameHtml = hpWrap('<span class="cr-name">' + ug.n + '</span>', sec);
        dipUpgH += '<div class="cr-row upgd-row"><div class="cr-top">' +
          nameHtml +
          '<span class="cr-cost">' + cost + '</span>' +
          '<button class="cr-btn" onclick="buyUpgd(\'' + uid + '\')" ' +
          (ok ? '' : 'disabled') + '>购买</button></div></div>';
      }
      if (dipUpgH || dipUpgDone.length) {
        h += '<div class="res-cat" style="margin-top:10px;">外交升级</div>';
        h += dipUpgH;
        if (dipUpgDone.length) {
          h += '<div class="upgd-done-list">';
          for (var di = 0; di < dipUpgDone.length; di++) {
            var did = dipUpgDone[di];
            var dsec = { desc: UPGD[did].d, effects: upgdEffects(UPGD[did].e), tip: UPGD[did].tip ? pickTip('upgd_' + did, UPGD[did].tip) : '' };
            h += hpWrap('<span class="upgd-done-tag">✓ ' + UPGD[did].n + '</span>', dsec);
          }
          h += '</div>';
        }
      }
    }

    // --- 派遣远行 ---
    var maxExp = maxExpeditions();
    var curExp = G.expeditions ? G.expeditions.length : 0;
    h += '<div class="res-cat" style="margin-top:10px;">远行目的地 <span style="font-size:11px;color:#aaa;">（队伍 ' + curExp + '/' + maxExp + '）</span></div>';

    if (maxExp <= 0) {
      h += '<div style="color:#aaa;font-size:13px;">建造驿道来派出远行队伍。</div>';
    } else {
      var wt = activeWatchtowers();
      if (wt > 0) {
        h += '<div style="font-size:11px;color:#888;margin-bottom:6px;">瞭望塔 ×' + wt + '：远行时间 ×' + expTimeMul().toFixed(2) + '</div>';
      }
      for (var did in EXD) {
        var dd = EXD[did];
        if (dd.wip) continue;  // 叙事未写完的目的地暂不开放
        if (!chk(dd.uq)) continue;
        if (isProdLocked('exp', did)) continue;
        var canSend = canSendExp(did);
        var days = Math.ceil(dd.days * expTimeMul());
        var costStr = dd.cost.map(function(p) {
          var have = G.res[p.r].v;
          return (have < p.a ? '<span class="short">' : '') +
            RD[p.r].n + ' ' + p.a + (have < p.a ? '</span>' : '');
        }).join(', ');
        var rwPrev = dd.rewards.map(function(rw) {
          var probStr = rw.prob < 1 ? ' (' + Math.round(rw.prob * 100) + '%)' : '';
          // §14.5 修复 6：未解锁的资源显示为 ???
          var rName = (G.res[rw.r] && G.res[rw.r].on) ? RD[rw.r].n : '???';
          return rName + ' ' + rw.min + '-' + rw.max + probStr;
        }).join('，');
        var sec = {
          desc: (dd.d ? dd.d + '<br>' : '') + '路程：' + days + ' 天',
          effects: ['可能获得：' + rwPrev],
          notes: dd.narrative ? ['每次必定获得一段叙事碎片'] : [],
          tip: pickTip('exp_' + did, dd.tip)
        };
        var nameHtml = hpWrap('<span class="bld-name">' + dd.n + '</span>', sec);
        h += '<div class="exp-row"><div class="exp-row-top">';
        h += nameHtml;
        h += '<span class="exp-days">' + days + '天</span>';
        h += '<span class="bld-cost">' + costStr + '</span>';
        var scoutAvail = G.job.scout?.c || 0;
        if (scoutAvail <= 0) {
          // 没有在岗斥候时，给出明确占位（避免 .sel 绿框 disabled 按钮的"看着可点"歧义）
          h += '<span class="exp-fox-btns" style="color:#aaa;font-size:11px;">尚未训练斥候</span>';
          h += '<button class="bld-btn" disabled>派遣</button>';
        } else {
          var selVal = _expFoxSel[did] || 1;
          if (selVal > scoutAvail) selVal = scoutAvail;
          h += '<span class="exp-fox-btns">';
          // 1/2/3 固定按钮（最多 3 个），超过 scoutAvail 的禁用
          for (var fi = 1; fi <= 3; fi++) {
            var isSel = fi === selVal;
            var dis = fi > scoutAvail;
            h += '<button class="exp-fox-btn' + (isSel ? ' sel' : '') + '"' +
              (dis ? ' disabled' : ' onclick="_expFoxSel[\'' + did + '\']=' + fi + ';rTC()"') +
              '>' + fi + '只</button>';
          }
          // 全部按钮（≥4 时显示）
          if (scoutAvail >= 4) {
            var allSel = selVal === scoutAvail;
            h += '<button class="exp-fox-btn' + (allSel ? ' sel' : '') + '"' +
              ' onclick="_expFoxSel[\'' + did + '\']=' + scoutAvail + ';rTC()"' +
              '>全部 ' + scoutAvail + '</button>';
          }
          // 速度提示
          var speedMul = Math.max(0.3, 1 - (selVal - 1) * 0.10);
          if (selVal > 1) {
            h += '<span style="font-size:11px;color:#666;margin-left:4px;">×' + (speedMul * 100 | 0) + '% 时间</span>';
          }
          h += '</span>';
          h += '<button class="bld-btn" onclick="sendExpedition(\'' + did + '\', _expFoxSel[\'' + did + '\'] || 1)" ' +
            (canSend ? '' : 'disabled') + '>派遣</button>';
        }
        h += '</div></div>';
      }
    }

    // --- 商队面板 ---（§14.5 修复 5：玩家见过商队后才显示）
    if (G.caravan || G.caravanEverVisited) {
    h += '<div class="res-cat" style="margin-top:10px;">商队</div>';
    if (G.caravan) {
      var cv = CVD[G.caravan.id];
      h += '<div class="cv-name">' + cv.n + ' <span style="color:#888;font-size:11px;">（停留至本季结束）</span></div>';
      for (var si = 0; si < cv.sell.length; si++) {
        var item = cv.sell[si];
        var boughtRaw = G.caravan.bought[si];
        var boughtCount = (typeof boughtRaw === 'number') ? boughtRaw : (boughtRaw ? 10 : 0);
        var canBuyNow = canBuyFromCaravan(si);
        var costStr = item.cost.map(function(p) {
          var have = G.res[p.r].v;
          return (have < p.a ? '<span class="short">' : '') +
            RD[p.r].n + ' ' + p.a + (have < p.a ? '</span>' : '');
        }).join(', ');
        var giveStr = item.give.map(function(p) { return RD[p.r].n + ' ×' + p.a; }).join(', ');
        h += '<div class="cv-item">';
        h += '<span class="cv-item-name">购买 ' + giveStr + ' <span style="color:#888;font-size:11px;">(' + boughtCount + '/10)</span></span>';
        h += '<span class="bld-cost">' + costStr + '</span>';
        if (boughtCount >= 10) {
          h += '<span class="cv-bought">已购满</span>';
        } else {
          h += '<button class="bld-btn" onclick="buyFromCaravan(' + si + ')" ' + (canBuyNow ? '' : 'disabled') + '>购买</button>';
        }
        h += '</div>';
      }
      // --- 图纸商品行 ---
      if (G.caravan.blueprint) {
        var bpItem = G.caravan.blueprint;
        var bpBought = G.caravan.bought['blueprint'];
        var canBuyBp = canBuyBlueprint();
        var specData = bpItem.type === 'bld' ? SPEC_BD[bpItem.target][bpItem.spec] : SPEC_JD[bpItem.target][bpItem.spec];
        var targetName = bpItem.type === 'bld' ? (BD[bpItem.target]?.n || bpItem.target) : (JD[bpItem.target]?.n || bpItem.target);
        var bpCostStr = bpItem.cost.map(function(p) {
          var mul = caravanCostMul();
          var need = Math.ceil(p.a * mul);
          var have = G.res[p.r].v;
          return (have < need ? '<span class="short">' : '') +
            RD[p.r].n + ' ' + need + (have < need ? '</span>' : '');
        }).join(', ');
        var bpSec = {
          desc: (bpItem.type === 'bld' ? '建筑专精' : '职业天赋') + '：' + targetName,
          effects: [specData.d],
          tip: pickTip('bp_' + bpItem.id, specData.tip)
        };
        // 把 target 内联进名字 span，让图纸行结构跟普通商品行一致（cost 列对齐）
        // S 档图纸用更深的金黄色（.bp-item-name-s）区分，A 档用默认棕色
        var bpNameClass = 'cv-item-name bp-item-name' + (bpItem.tier === 'S' ? ' bp-item-name-s' : '');
        var bpLabelHtml = '图纸：' + specData.n + ' <span class="bp-target">' + targetName + '</span>';
        var bpNameHtml = hpWrap('<span class="' + bpNameClass + '">' + bpLabelHtml + '</span>', bpSec);
        h += '<div class="cv-item bp-item">';
        h += bpNameHtml;
        h += '<span class="bld-cost">' + bpCostStr + '</span>';
        if (bpBought) {
          h += '<span class="cv-bought">已购</span>';
        } else {
          h += '<button class="bld-btn" onclick="buyBlueprint()" ' + (canBuyBp ? '' : 'disabled') + '>购买</button>';
        }
        h += '</div>';
      }
      if (cv.buy) {
        var soldAlready = G.caravan.bought['sell'];
        var canSellNow = canSellToCaravan();
        var takeStr = cv.buy.take.map(function(p) {
          var have = G.res[p.r].v;
          return (have < p.a ? '<span class="short">' : '') +
            RD[p.r].n + ' ' + p.a + (have < p.a ? '</span>' : '');
        }).join(', ');
        var giveStr2 = cv.buy.give.map(function(p) { return RD[p.r].n + ' ×' + p.a; }).join(', ');
        h += '<div class="cv-item">';
        h += '<span class="cv-item-name">出售 ' + takeStr + ' → ' + giveStr2 + '</span>';
        if (soldAlready) {
          h += '<span class="cv-bought">已售</span>';
        } else {
          h += '<button class="bld-btn" onclick="sellToCaravan()" ' + (canSellNow ? '' : 'disabled') + '>出售</button>';
        }
        h += '</div>';
      }
    } else {
      h += '<div style="color:#aaa;font-size:13px;">暂无商队到访。</div>';
    }
    }  // end §14.5 修复 5 商队区域包裹

    // --- 叙事碎片 ---（§14.5 修复 7 配套：玩家未收集过任何叙事则整块隐藏）
    var hasCollectedNarr = false;
    if (G.narratives) {
      for (var nk in G.narratives) {
        if (G.narratives[nk] && G.narratives[nk].length > 0) { hasCollectedNarr = true; break; }
      }
    }
    if (hasCollectedNarr) {
      h += '<div class="collapse-toggle" style="margin-top:10px;" onclick="toggleCollapse(\'narr\')">'
        + (collapsed.narr ? '▶︎ ' : '▼︎ ') + '山外拾遗</div>';
      if (!collapsed.narr) {
        // §14.5 修复 7：动态从 NARR keys 读取，且只显示 collected > 0 的目的地
        var narrLabels = { oldRuin: '旧墟手记', cloudRidge: '云岭石刻', windRidge: '枯风口札记' };
        var narrKeys = Object.keys(NARR);
        for (var ni = 0; ni < narrKeys.length; ni++) {
          var nsKey = narrKeys[ni];
          var narrData = NARR[nsKey];
          if (!narrData || !narrData.length) continue;
          var collected = (G.narratives && G.narratives[nsKey]) ? G.narratives[nsKey].length : 0;
          if (collected === 0) continue;  // 未收集过则不显示该目的地
          var nsLabel = narrLabels[nsKey] || (EXD[nsKey] && EXD[nsKey].n) || nsKey;
          var cKey = 'narr_' + nsKey;
          var isColl = !!collapsed[cKey];
          h += '<div class="narr-section">';
          // 隐藏总数，只显示已收集数（避免剧透"还有几篇没拿"）
          h += '<div class="narr-title collapse-toggle" onclick="toggleCollapse(\'' + cKey + '\')">'
            + (isColl ? '▶︎ ' : '▼︎ ') + nsLabel
            + ' <span style="color:#888;font-size:11px;">（已收集 ' + collected + ' 篇）</span></div>';
          if (!isColl) {
            for (var nj = 0; nj < collected; nj++) {
              h += '<div class="narr-item narr-unlocked">' + narrData[nj] + '</div>';
            }
          }
          h += '</div>';
        }
      }
    }
  }

  // ===== v0.14 风俗页签 =====
  else if (curTab === 'k') {
    // ===== v0.15 节令面板（顶部） =====
    if (G.upg.artistryLore?.done) {
      h += renderRitePanel();
    }

    var actCount = 0;
    for (var ck in (G.customs || {})) if (G.customs[ck]) actCount++;
    h += '<div class="customs-count">已激活习俗：<span class="' + (actCount > 0 ? 'ca-on' : 'ca-off') + '">' + actCount + '</span> / ' + CUSTD.length + '</div>';

    h += '<div class="customs-list">';
    for (var ci = 0; ci < CUSTD.length; ci++) {
      var c = CUSTD[ci];
      // §14.5 修复 3：习俗依赖的研究未在研究面板出现 → 该习俗整张卡片隐藏
      if (!isCustomVisible(c)) continue;
      var isActive = !!(G.customs && G.customs[c.id]);
      var unlocked = customUnlocked(c.id);
      var hasResources = unlocked && !isActive && canActivateCustom(c.id);
      var statusCls = isActive ? 'custom-active' : (unlocked ? 'custom-ready' : 'custom-locked');

      h += '<div class="custom-card ' + statusCls + '">';
      h += '<div class="custom-row">';
      h += '<span class="custom-name">' + c.n + '</span>';
      var descAttr = (c.desc || '').replace(/"/g, '&quot;');
      h += '<span class="custom-desc" title="' + descAttr + '">' + c.desc + '</span>';

      if (isActive) {
        h += '<span class="custom-status">✓ 已激活</span>';
      } else if (unlocked) {
        h += '<button onclick="activateCustom(\'' + c.id + '\')" class="custom-link-btn"' + (hasResources ? '' : ' disabled') + '>▶ 激活</button>';
      }
      h += '</div>';

      if (!isActive && unlocked) {
        var costStr = c.cost.map(function(p) {
          var have = G.res[p.r] ? G.res[p.r].v : 0;
          var col = have >= p.a ? '#333' : '#b00';
          return '<span style="color:' + col + '">' + ((RD[p.r] && RD[p.r].n) || p.r) + ' ' + p.a + '</span>';
        }).join('，');
        h += '<div class="custom-cost">成本：' + costStr + '</div>';
      } else if (!unlocked) {
        var req = c.unlock || {};
        var reqStrs = [];
        if (req.u) for (var rui = 0; rui < req.u.length; rui++) {
          var udId = req.u[rui];
          var done = G.upg[udId] && G.upg[udId].done;
          var udName = (UD[udId] && UD[udId].n) || udId;
          var udHint = formatUqHint(UD[udId] && UD[udId].uq);
          reqStrs.push((done ? '✓ ' : '✗ ') + '研究：<span title="' + udHint.replace(/"/g, '&quot;') + '">' + udName + '</span>');
        }
        if (req.b) for (var bk in req.b) {
          var hb = G.bld[bk] ? G.bld[bk].c : 0, nb = req.b[bk];
          var bldName = (BD[bk] && BD[bk].n) || bk;
          var bldHint = formatUqHint(BD[bk] && BD[bk].uq);
          reqStrs.push((hb >= nb ? '✓ ' : '✗ ') + '<span title="' + bldHint.replace(/"/g, '&quot;') + '">' + bldName + '</span> ≥ ' + nb);
        }
        if (req.j) for (var jk in req.j) {
          var hj = G.job[jk] ? G.job[jk].c : 0, nj = req.j[jk];
          reqStrs.push((hj >= nj ? '✓ ' : '✗ ') + ((JD[jk] && JD[jk].n) || jk) + ' ≥ ' + nj);
        }
        if (req.r) for (var rk in req.r) {
          var hr = G.res[rk] ? G.res[rk].v : 0, nr = req.r[rk];
          reqStrs.push((hr >= nr ? '✓ ' : '✗ ') + ((RD[rk] && RD[rk].n) || rk) + ' ≥ ' + nr);
        }
        if (req.choice) for (var chi = 0; chi < req.choice.length; chi++) {
          var done = (G.choicesDone || []).indexOf(req.choice[chi]) >= 0;
          var ce = (typeof CHOICE_EVENTS !== 'undefined') ? CHOICE_EVENTS[req.choice[chi]] : null;
          var ceName = (ce && ce.n) || ('#' + req.choice[chi]);
          reqStrs.push((done ? '✓ ' : '✗ ') + '抉择：' + ceName + ' 完成');
        }
        if (req.spring) {
          var done = (G.springExpDone || 0) >= req.spring;
          reqStrs.push((done ? '✓ ' : '✗ ') + '春季远行完成 ≥ ' + req.spring);
        }
        h += '<div class="custom-req">' + reqStrs.join('｜') + '</div>';
      }

      if (c.tip && c.tip.length) {
        h += '<div class="custom-tip">' + pickTip('cust_' + c.id, c.tip) + '</div>';
      }
      h += '</div>';
    }
    h += '</div>';

    // v0.16 §四 1.2 治理分区（议政内容并入典制页签）
    if (G.upg.councilLore?.done) {
      h += '<div class="govern-divider"></div>';
      h += renderPolityTab();
    }
  }

  // ===== §十一 成就页签 =====
  else if (curTab === 'a') {
    h += renderAchievements();
  }

  // ===== 神启副线 A阶段：宗教页签 =====
  else if (curTab === 'f') {
    if (!G.faithIntroSeen) {
      h += '<div class="rite-intro">';
      h += '<div class="rite-intro-title">信仰</div>';
      h += '<div class="rite-intro-body">';
      h += '<p>旧经卷从神坛下方的暗格里取出时，边角已经脆得像深秋的落叶。祭司花了一个下午清理尘土，辨认那些用赭石和炭笔写下的符号。诵读开始了。声音不高，但每个音节都像水滴，缓慢地渗进山谷的岩层里。起初什么都没发生。然后，在第七次日落之后，神坛前供奉的那碗清水，表面无风，却自行荡开了极细的涟漪。</p>';
      h += '<p>这便是虔诚的重量，是祭司俯身时投下的影子，经年累月，在石头上留下的一道看不见的刻痕。而神恩，是这刻痕够深之后，从石头内部反渗出来的一丝微凉——积累了足够久的重量，总会找到回路。它不祝福，它只是证明——你的重量，终于被地底之物感知到了。</p>';
      h += '<button class="rite-intro-btn" onclick="markFaithIntroSeen()">明白了</button>';
      h += '</div></div>';
    } else {
    // 上区：神恩面板
    h += '<div class="section-label">神恩</div>';
    h += '<div class="divine-panel">';
    if (G.upg.graceLore?.done) {
      var gracePct = ((G._graceBonus || 0) * 100).toFixed(1);
      var graceCap = ((G._graceCap || 0.50) * 100).toFixed(0);
      h += '<div class="grace-info">神恩加成: <strong>' + gracePct + '%</strong> / ' + graceCap + '%</div>';
    }
    // 虔诚/圣油显示
    if (G.res.piety?.on) {
      var prayDisabled = G.res.piety.v >= G.res.piety.mx;
      h += '<div class="res-status">虔诚: ' + fmt(G.res.piety.v) + ' / ' + fmt(G.res.piety.mx) +
        ' <button class="gbtn" style="margin-left:8px;" onclick="pray()"' +
        (prayDisabled ? ' disabled' : '') + '>祈祷</button></div>';
    }
    if (G.res.holyOil?.on) {
      h += '<div class="res-status">圣油: ' + fmt(G.res.holyOil.v) + ' / ' + fmt(G.res.holyOil.mx) + '</div>';
    }
    h += '</div>';

    // v0.18 §六 3.4 占卜年签面板（神恩面板旁）
    if (G.upg.divineLore?.done) {
      h += '<div class="section-label">占卜</div>';
      h += '<div class="divine-divination">';
      var divEff = (G._divination !== null && G._divination !== undefined) ? DIVINATION_POOL[G._divination] : null;
      if (divEff) {
        h += '<div class="div-sign-active">年签: <strong>【' + divEff.n + '】</strong> <span style="color:#888;font-size:11px;">' + divEff.tip + '</span></div>';
        h += '<div style="font-size:11px;color:#555;">' + divEff.desc + '</div>';
      } else {
        h += '<div style="color:#999;font-size:12px;">今年未选签。</div>';
      }
      h += '</div>';
    }

    // 建筑列表（tab: 'f' 过滤）
    var bldH = renderBldList('f');
    if (bldH) h += '<div class="section-label">建筑</div>';
    h += bldH;

    // 升级列表
    var divUpgH = '';
    for (var uid in UPGD) {
      if (UPGD[uid].sb !== 'D') continue;
      if (G.upgd[uid]?.done) continue;
      if (!chk(UPGD[uid].uq) || anyBranchLocked(UPGD[uid])) continue;
      var ug = UPGD[uid];
      var canBuy = canUpgd(uid);
      var costStr = ug.p.map(function(p) {
        var have = G.res[p.r].v;
        return (have < p.a ? '<span class="short">' : '') +
          RD[p.r].n + ' ' + fmt(p.a) + (have < p.a ? '</span>' : '');
      }).join(', ');
      var sec = { desc: ug.d, effects: upgdEffects(ug.e), tip: ug.tip ? pickTip('upgd_' + uid, ug.tip) : '' };
      var nameHtml = hpWrap('<span class="cr-name">' + ug.n + '</span>', sec);
      divUpgH += '<div class="cr-row upgd-row"><div class="cr-top">' +
        nameHtml +
        '<span class="cr-cost">' + costStr + '</span>' +
        '<button class="cr-btn" onclick="buyUpgd(\'' + uid + '\')" ' +
        (canBuy ? '' : 'disabled') + '>购买</button></div></div>';
    }
    if (divUpgH) {
      h += '<div class="section-label">升级</div>' + divUpgH;
    }

    // 下区：仪式
    if (G.upg.graceLore?.done && typeof RITUALS !== 'undefined') {
      var ritH = '';
      for (var rid in RITUALS) {
        var rt = RITUALS[rid];
        if (!chk(rt.uq) || anyBranchLocked(rt)) continue;
        // 一次性永久仪式：已完成则不再显示
        if (rt.perm && G._ritualsPerformed && G._ritualsPerformed[rid]) continue;
        var cd = (G._ritualCD && G._ritualCD[rid] > 0);
        var canCast = !cd;
        var costStr = rt.cost.map(function(p) {
          var have = G.res[p.r].v;
          var ok = have >= p.a;
          if (!ok) canCast = false;
          return (ok ? '' : '<span class="short">') + RD[p.r].n + ' ' + fmt(p.a) + (ok ? '' : '</span>');
        }).join(', ');
        var rSec = { desc: rt.d + (cd ? ' (冷却中)' : '') };
        var rNameHtml = hpWrap('<span class="cr-name">' + rt.n + (cd ? ' ⏳' : '') + '</span>', rSec);
        ritH += '<div class="cr-row"><div class="cr-top">' +
          rNameHtml +
          '<span class="cr-cost">' + costStr + '</span>' +
          '<button class="cr-btn" onclick="castRitual(\'' + rid + '\')" ' +
          (canCast ? '' : 'disabled') + '>施法</button></div></div>';
      }
      if (ritH) h += '<div class="section-label">仪式</div>' + ritH;
    }

    // v0.19 §七 4.3 教团：教令面板
    if (G.upg.edictLore?.done && typeof EDICT_DEF !== 'undefined' && G.mainLine === 'industry') {
      h += '<div class="section-label">教令</div>';
      // 当前生效中教令
      if (G._edicts && G._edicts.length > 0) {
        h += '<div class="edict-active">';
        for (var ei = 0; ei < G._edicts.length; ei++) {
          var act = G._edicts[ei];
          var eDef = EDICT_DEF[act.id];
          h += '<div class="edict-slot">【' + (eDef ? eDef.n : act.id) + '】剩余 ' + act.remaining + ' 季</div>';
        }
        h += '</div>';
      }
      var maxSlots = 1 + (G.bld.edictHall?.c || 0);
      if (maxSlots > 3) maxSlots = 3;
      h += '<div style="font-size:11px;color:#888;margin-bottom:4px;">教令席位: ' + (G._edicts ? G._edicts.length : 0) + ' / ' + maxSlots + '</div>';
      for (var eid in EDICT_DEF) {
        var ed = EDICT_DEF[eid];
        if (ed.uq && !chk(ed.uq)) continue;
        var eCD = (G._edictCD && G._edictCD[eid] > 0);
        var canIssue = !eCD;
        var eCostStr = [];
        for (var cr in ed.cost) {
          var have = G.res[cr] ? G.res[cr].v : 0;
          var ok = have >= ed.cost[cr];
          if (!ok) canIssue = false;
          eCostStr.push((ok ? '' : '<span class="short">') + (RD[cr] ? RD[cr].n : cr) + ' ' + fmt(ed.cost[cr]) + (ok ? '' : '</span>'));
        }
        if (G._edicts && G._edicts.length >= maxSlots) canIssue = false;
        // 检查同一教令是否已激活
        var alreadyActive = false;
        if (G._edicts) { for (var _ea = 0; _ea < G._edicts.length; _ea++) { if (G._edicts[_ea].id === eid) { alreadyActive = true; break; } } }
        if (alreadyActive) canIssue = false;
        var eSec = { desc: '持续 ' + ed.dur + ' 季' + (eCD ? ' (冷却中: ' + G._edictCD[eid] + '季)' : '') + (alreadyActive ? ' (已生效)' : '') };
        var eNameHtml = hpWrap('<span class="cr-name">' + ed.n + (eCD ? ' ⏳' : '') + '</span>', eSec);
        h += '<div class="cr-row"><div class="cr-top">' +
          eNameHtml +
          '<span class="cr-cost">' + eCostStr.join(', ') + '</span>' +
          '<button class="cr-btn" onclick="publishEdict(\'' + eid + '\')" ' +
          (canIssue ? '' : 'disabled') + '>颁布</button></div></div>';
      }
    }

    // v0.19 §七 4.3 秘仪：飞升阶梯面板
    if (G.upg.ascensionLore?.done && typeof GATE_DEF !== 'undefined' && G.mainLine === 'mystic') {
      h += '<div class="section-label">飞升阶梯</div>';
      var gatesDone = G._gates || 0;
      h += '<div style="font-size:11px;color:#888;margin-bottom:4px;">已开门: ' + gatesDone + ' / ' + GATE_DEF.length + '</div>';
      if (G._gateEcstasyRemain > 0) {
        h += '<div style="color:#c0a;font-size:12px;margin-bottom:4px;">飞升迷醉: 剩余 ' + G._gateEcstasyRemain + ' 季（全产出加成中）</div>';
      }
      // 已开过的门
      for (var gi = 0; gi < gatesDone && gi < GATE_DEF.length; gi++) {
        var doneGate = GATE_DEF[gi];
        h += '<div style="color:#6a6;font-size:12px;margin-bottom:2px;">' + doneGate.n + ' — 已通过</div>';
      }
      // 下一扇门
      if (gatesDone < GATE_DEF.length) {
        var nextG = GATE_DEF[gatesDone];
        // 阶段四仅开放前2门
        var phaseLimit = (G.phase >= 5) ? 4 : (G.phase >= 4) ? 2 : 0;
        if (gatesDone < phaseLimit) {
          var canOpen = true;
          var gCostStr = [];
          var discount = G._gateDiscount || 0;
          for (var gr in nextG.cost) {
            var need = Math.ceil(nextG.cost[gr] * (1 - discount));
            var have = G.res[gr] ? G.res[gr].v : 0;
            var ok = have >= need;
            if (!ok) canOpen = false;
            gCostStr.push((ok ? '' : '<span class="short">') + (RD[gr] ? RD[gr].n : gr) + ' ' + fmt(need) + (ok ? '' : '</span>'));
          }
          var gSec = { desc: nextG.tip };
          var gNameHtml = hpWrap('<span class="cr-name">' + nextG.n + '</span>', gSec);
          h += '<div class="cr-row"><div class="cr-top">' +
            gNameHtml +
            '<span class="cr-cost">' + gCostStr.join(', ') + '</span>' +
            '<button class="cr-btn" onclick="openGate()" ' +
            (canOpen ? '' : 'disabled') + '>开门</button></div></div>';
        } else {
          h += '<div style="color:#999;font-size:12px;">下一扇门尚未开放（需更高阶段）。</div>';
        }
      } else {
        h += '<div style="color:#c0a;font-size:12px;">所有门已通过。</div>';
      }
    }

    // v0.19 §七 4.5 六神系统面板
    if ((G.upg.edictLore?.done || G.upg.mysteryInit?.done) && typeof DEITY_DATA !== 'undefined') {
      h += '<div class="section-label">神祇</div>';
      if (!G.deity) {
        // 首次选神
        h += '<div style="font-size:12px;color:#888;margin-bottom:6px;">选择一位主神，获得永久被动加成与专属仪式。</div>';
        for (var did in DEITY_DATA) {
          var dd = DEITY_DATA[did];
          var descParts = [];
          for (var pk in dd.passive) descParts.push(_passiveLabel(pk, dd.passive[pk]));
          if (dd.passiveByLine) {
            var lp = dd.passiveByLine[G.mainLine] || {};
            for (var lpk in lp) descParts.push(_passiveLabel(lpk, lp[lpk]));
          }
          var dSec = { desc: dd.theme + ' — ' + descParts.join('，') };
          var dNameHtml = hpWrap('<span class="cr-name">' + dd.n + '</span>', dSec);
          h += '<div class="cr-row"><div class="cr-top">' +
            dNameHtml +
            '<button class="cr-btn" onclick="chooseDeity(\'' + did + '\')">选择</button>' +
            '</div></div>';
        }
      } else {
        // 已选神：显示当前主神信息
        var curD = DEITY_DATA[G.deity];
        h += '<div style="font-size:13px;margin-bottom:4px;">当前主神：<strong>' + curD.n + '</strong>（' + curD.theme + '）</div>';
        // 教派选择
        if (curD.sects && curD.sects.length > 0) {
          h += '<div style="font-size:12px;color:#888;margin-bottom:4px;">教派'
            + (G.sect ? '：<strong>' + SECT_DATA[G.sect].n + '</strong>' : '（未选择）')
            + '</div>';
          for (var si = 0; si < curD.sects.length; si++) {
            var sid = curD.sects[si];
            var sdef = SECT_DATA[sid];
            var isCur = (G.sect === sid);
            var sectDesc = [];
            for (var spk in sdef.passive) sectDesc.push(_passiveLabel(spk, sdef.passive[spk]));
            var sSec = { desc: sectDesc.join('，') + (isCur ? '' : G.sect ? '（改换代价：虔诚 ×30）' : '') };
            var sNameHtml = hpWrap('<span class="cr-name">' + sdef.n + (isCur ? ' ✓' : '') + '</span>', sSec);
            h += '<div class="cr-row"><div class="cr-top">' +
              sNameHtml +
              '<button class="cr-btn" onclick="chooseSect(\'' + sid + '\')" ' +
              (isCur ? 'disabled' : '') + '>选择</button>' +
              '</div></div>';
          }
        }
        // 专属仪式
        h += '<div style="font-size:12px;color:#888;margin:6px 0 4px;">专属仪式</div>';
        for (var dri = 0; dri < curD.rituals.length; dri++) {
          var drid = curD.rituals[dri];
          var drt = DEITY_RITUAL_DATA[drid];
          if (!drt) continue;
          var drCD = (G._deityRitualCD && G._deityRitualCD[drid] > 0);
          var drBusy = (drt.dur !== 0 && G._deityRitualBuff);
          var drCan = !drCD && !drBusy;
          var drCostStr = drt.cost.map(function(p) {
            var have = G.res[p.r] ? G.res[p.r].v : 0;
            var ok = have >= p.a;
            if (!ok) drCan = false;
            return (ok ? '' : '<span class="short">') + (RD[p.r] ? RD[p.r].n : p.r) + ' ' + fmt(p.a) + (ok ? '' : '</span>');
          }).join(', ');
          var drSec = { desc: drt.d + (drCD ? ' (冷却: ' + G._deityRitualCD[drid] + '季)' : '') + (drt.dur > 0 ? ' [持续' + drt.dur + '季]' : '') };
          var drNameHtml = hpWrap('<span class="cr-name">' + drt.n + (drCD ? ' ⏳' : '') + '</span>', drSec);
          h += '<div class="cr-row"><div class="cr-top">' +
            drNameHtml +
            '<span class="cr-cost">' + drCostStr + '</span>' +
            '<button class="cr-btn" onclick="castDeityRitual(\'' + drid + '\')" ' +
            (drCan ? '' : 'disabled') + '>施法</button></div></div>';
        }
        // 大仪式进行中提示
        if (G._deityRitualBuff) {
          var buffDef = DEITY_RITUAL_DATA[G._deityRitualBuff.id];
          h += '<div style="color:#c0a;font-size:12px;margin-top:4px;">'
            + (buffDef ? buffDef.n : '仪式') + ' 生效中'
            + (G._deityRitualBuff.remain < 900 ? '（剩余 ' + G._deityRitualBuff.remain + ' 季）' : '')
            + '</div>';
        }
        // 改宗按钮（cr-row 格式）
        h += '<div style="margin-top:8px;">';
        h += '<div class="cr-row"><div class="cr-top">' +
          '<span class="cr-name">改宗</span>' +
          '<span class="cr-cost">' + (G.deityCD > 0
            ? '冷却中：' + G.deityCD + ' 季'
            : '卷轴 80, 古币 30, 虔诚归零') + '</span>' +
          '<button class="cr-btn" ' +
          (G.deityCD > 0 ? 'disabled' : 'onclick="showConvertDeityModal()"') +
          '>改宗</button>' +
          '</div></div>';
        h += '</div>';
      }
    }
    } // faithIntroSeen else
  }

  document.getElementById('tc').innerHTML = toggle + h;
}

// ===== §五 2.9 + §十一 成就页签渲染 =====
// 单卡显示：已解锁=完整 + 加重；未解锁=完整名称+描述+灰色
// 分支过滤：仅当对方路线已选时隐藏冲突项；未选路时全部展示
function renderAchievements() {
  var ach = G.achievements || {};
  var chosenBr = G.mainLine === 'industry' ? 'I' : (G.mainLine === 'mystic' ? 'M' : null);
  var total = 0, done = 0;
  for (var id in ACHIEVEMENT_DATA) {
    var ad = ACHIEVEMENT_DATA[id];
    if (ad.br && chosenBr && ad.br !== chosenBr) continue;
    total++;
    if (ach[id]) done++;
  }
  var h = '<div style="margin-bottom:8px;font-weight:bold;color:#555;">成就 · ' + done + ' / ' + total + '</div>';
  h += '<div class="ach-grid">';
  for (var id in ACHIEVEMENT_DATA) {
    var ad = ACHIEVEMENT_DATA[id];
    if (ad.br && chosenBr && ad.br !== chosenBr) continue;
    var unlocked = !!ach[id];
    h += '<div class="ach-card' + (unlocked ? ' ach-done' : '') + '">';
    h += '<div class="ach-name">' + ad.n + '</div>';
    h += '<div class="ach-desc">' + ad.d + '</div>';
    h += '</div>';
  }
  h += '</div>';
  return h;
}

// ===== v0.15 节令面板渲染 =====
// 三种状态：
// 1. 首次解锁（!riteIntroSeen）→ intro card，引导玩家
// 2. 待决策（pendingSeasonRites.open）→ 决策面板（manual mode 或新季首次）
// 3. 已应用 → 状态 banner（含模式切换 + 修改下季 default）
function renderRitePanel() {
  var h = '';
  // 状态 1：首次引导
  if (!G.riteIntroSeen) {
    h += '<div class="rite-intro">';
    h += '<div class="rite-intro-title">节令系统已解锁</div>';
    h += '<div class="rite-intro-body">';
    h += '<p>百艺通觉参透之后，每季可借彩络、醴浆、墨锭三件文化品换得季节加成：</p>';
    h += '<ul class="rite-intro-list">';
    h += '<li><b>彩络</b> ×1 → 全职业产出 +5%</li>';
    h += '<li><b>醴浆</b> ×1 → 野莓产量 +8%</li>';
    h += '<li><b>墨锭</b> ×1 → 学识产出 +10%</li>';
    h += '<li>三选 → <b>三全礼</b>：满意度 +5% + 全产出 +3%</li>';
    h += '</ul>';
    h += '<p class="rite-intro-note">资源够才生效，不够自动跳过。模式可在面板内切换：</p>';
    h += '<ul class="rite-intro-list">';
    h += '<li><b>自动</b>（默认）：每季按上次选择静默应用</li>';
    h += '<li><b>手动</b>：每季弹出选择面板</li>';
    h += '</ul>';
    h += '<button class="rite-intro-btn" onclick="markRiteIntroSeen()">明白了</button>';
    h += '</div></div>';
    return h;
  }

  // 状态 2：待决策面板（manual mode 触发或 auto 模式手动展开）
  var pending = G.pendingSeasonRites && G.pendingSeasonRites.open;
  var expanded = !!collapsed.riteEdit;  // 玩家点击"修改下季"展开
  var defaults = pending ? (G.pendingSeasonRites.defaults || G.lastSeasonRites) : G.lastSeasonRites;

  // 状态 banner（已应用区）
  h += '<div class="rite-banner">';
  h += '<div class="rite-banner-row">';
  h += '<span class="rite-banner-title">本季节令</span>';
  // 当前已应用状态
  var applied = [];
  for (var k of Object.keys(SEASON_RITES)) {
    if (G.seasonRites[k]) applied.push(SEASON_RITES[k].name);
  }
  if (applied.length) {
    var statusText = applied.join('·');
    if (G.seasonRites.all) statusText += '（三全礼）';
    h += '<span class="rite-status-applied">已应用：' + statusText + '</span>';
  } else if (!pending) {
    h += '<span class="rite-status-skip">本季已跳过</span>';
  }
  // 模式切换
  h += '<span class="rite-mode">模式：';
  h += '<button class="rite-mode-btn ' + (G.riteMode === 'auto' ? 'rite-mode-active' : '') + '" onclick="setRiteMode(\'auto\')">自动</button>';
  h += '<button class="rite-mode-btn ' + (G.riteMode === 'manual' ? 'rite-mode-active' : '') + '" onclick="setRiteMode(\'manual\')">手动</button>';
  h += '</span>';
  h += '</div>';

  // 决策/修改面板
  if (pending) {
    h += '<div class="rite-decide">';
    h += '<div class="rite-decide-title">请为本季选择：</div>';
    h += renderRiteCheckboxes(defaults, true);
    h += '<div class="rite-decide-actions">';
    h += '<button class="bld-btn" onclick="confirmRites()">本季应用</button>';
    h += '<button class="bld-btn" onclick="skipRites()">跳过本季</button>';
    h += '</div></div>';
  } else {
    // 折叠的"修改下季 default"
    h += '<div class="rite-edit-toggle collapse-toggle" onclick="toggleCollapse(\'riteEdit\')">'
      + (expanded ? '▼︎' : '▶︎') + ' 调整下季默认</div>';
    if (expanded) {
      h += '<div class="rite-edit">';
      h += renderRiteCheckboxes(G.lastSeasonRites, false);
      h += '<button class="bld-btn" onclick="saveRiteDefault()">保存为默认</button>';
      h += '</div>';
    }
  }
  h += '</div>';
  return h;
}

function renderRiteCheckboxes(selected, includeShortageHint) {
  var h = '<div class="rite-checks">';
  for (var k of Object.keys(SEASON_RITES)) {
    var cfg = SEASON_RITES[k];
    var checked = selected && selected[k] ? 'checked' : '';
    var have = (G.res[k] && G.res[k].v) || 0;
    var shortage = (have < cfg.consume) ? ' <span class="rite-short">资源不足</span>' : '';
    var effect = '';
    if (k === 'dye') effect = '全职业 +5%';
    else if (k === 'wine') effect = '野莓 +8%';
    else if (k === 'ink') effect = '学识 +10%';
    h += '<label class="rite-check-row">';
    h += '<input type="checkbox" id="rite-cb-' + k + '" ' + checked + '>';
    h += ' <b>' + cfg.name + '</b> ×' + cfg.consume + '（有 ' + Math.floor(have) + '）';
    h += ' → ' + effect;
    h += includeShortageHint ? shortage : '';
    h += '</label>';
  }
  h += '<div class="rite-trinity-hint">三选齐 → 三全礼：满意度 +5% + 全产出 +3%</div>';
  h += '</div>';
  return h;
}

// ===== v0.16 议政 Tab 渲染（§四 1.3 分层不可逆路线树）=====
function renderPolityTab() {
  var h = '';
  h += '<div class="govern-wrap">';
  h += '<div class="govern-wrap-title">治理</div>';

  // ── Tier 1 路线面板 ──
  h += '<div class="polity-section">';
  h += '<div class="polity-section-title">取向</div>';
  if (!G.upg.polityLore?.done) {
    h += '<div class="polity-locked">完成研究「' + (UD.polityLore?.n || '法度通论') + '」后解锁取向选择。</div>';
  } else if (!G.tier1) {
    h += '<div class="polity-choose-hint">请先选定取向（不可逆）：</div>';
    h += '<div class="polity-grid">';
    // 从 TIER 数据生成（v0.16 Tier 1 实装后改为读 TIER）
    var tierEffNames = { baseProdM: '基础资源', buildCostM: '建筑造价', expRewardM: '远行奖励', caravanProb: '商队来访' };
    ['in', 'out'].forEach(function(tid) {
      var t = TIER[tid];
      h += '<div class="polity-card">';
      h += '<div class="polity-card-name">' + t.n + '</div>';
      h += '<div class="polity-card-desc">' + t.d + '</div>';
      h += '<div class="polity-card-effects">';
      var effs = [];
      for (var ek in t.e) {
        var v = t.e[ek];
        var name = tierEffNames[ek] || ek;
        var sign = v > 0 ? '+' : '';
        effs.push('<span class="eff-pos">' + name + ' ' + sign + (v * 100).toFixed(0) + '%</span>');
      }
      h += effs.join('<br>');
      h += '</div>';
      h += '<div class="policy-cost-info">费用：' + t.cost.map(function(c){ return (RD[c.r]?.n || c.r) + ' ' + c.a; }).join(' + ') + '</div>';
      h += '<button class="bld-btn" onclick="chooseTier1Confirm(\'' + tid + '\')">选择' + t.n + '</button>';
      h += '</div>';
    });
    h += '</div>';
  } else {
    var tierName = (TIER[G.tier1]?.n) || (G.tier1 === 'in' ? '内守' : '外拓');
    h += '<div class="polity-current"><div class="polity-current-name">取向：' + tierName + '</div>';
    h += '<div class="polity-locked-note">取向已确立，永久。</div></div>';
  }
  h += '</div>';

  // ── 治风面板 ──
  h += '<div class="polity-section">';
  h += '<div class="polity-section-title">治风</div>';
  if (!G.upg.polityLore?.done) {
    h += '<div class="polity-locked">完成研究「' + (UD.polityLore?.n || '法度通论') + '」后解锁治风选择。</div>';
  } else if (!G.tier1) {
    h += '<div class="polity-locked">请先选定取向。</div>';
  } else if (!G.polity) {
    // 首次选择（filtered by tier1）
    h += '<div class="polity-choose-hint">尚未确立治风，请选择：</div>';
    h += renderPolityGrid(true);
  } else {
    // 当前政体
    var pd = POLITY[G.polity];
    var polityBoost = 1 + Math.min(5, G.bld.polityHall?.c || 0) * 0.05;
    var phCount = G.bld.polityHall?.c || 0;
    h += '<div class="polity-current">';
    h += '<div class="polity-current-name">' + pd.n + '</div>';
    h += '<div class="polity-current-desc">' + pd.d + '</div>';
    h += '<div class="polity-current-effects">' + polityEffectLines(pd.e, polityBoost).join('<br>') + '</div>';
    h += '<div class="polity-current-effects" style="margin-top:4px;">' + polityPenLines(pd.pen).join('<br>') + '</div>';
    if (phCount > 0) h += '<div class="polity-boost">治风堂 x' + phCount + '：正面效果 +' + Math.round((polityBoost - 1) * 100) + '%</div>';
    h += '<div class="polity-locked-note">治风已确立，永久。</div>';
    h += '</div>';
  }
  h += '</div>';

  // ── 永久政策面板 ──
  for (var dom in POLICY) {
    var pd = POLICY[dom];
    if (!pd.permanent) continue;
    // 检查解锁条件
    if (pd.uq && !chk(pd.uq)) continue;
    h += '<div class="polity-section">';
    h += '<div class="polity-section-title">' + pd.n + '</div>';
    var currentOpt = G.policies[dom];
    if (!currentOpt) {
      h += '<div class="polity-choose-hint">请选择（不可逆）：</div>';
      // Show cost
      if (pd.cost && pd.cost.length > 0) {
        var costStr = pd.cost.map(function(c) { return (RD[c.r]?.n || c.r) + ' ' + c.a; }).join(' + ');
        h += '<div class="policy-cost-info">费用：' + costStr + '</div>';
      }
    }
    h += '<div class="policy-opts">';
    for (var optId in pd.opts) {
      var opt = pd.opts[optId];
      var isCurrent = currentOpt === optId;
      var isLocked = currentOpt && !isCurrent; // 另一个选项被永久锁定
      h += '<div class="policy-opt' + (isCurrent ? ' policy-opt-active' : '') + (isLocked ? ' policy-opt-locked' : '') + '">';
      h += '<div class="policy-opt-name">' + opt.n + '</div>';
      if (opt.d) h += '<div class="policy-opt-desc">' + opt.d + '</div>';
      if (opt.e && Object.keys(opt.e).length > 0) {
        h += '<div class="policy-opt-effects">' + policyEffectLines(opt.e).join('<br>') + '</div>';
      }
      if (opt.pen && Object.keys(opt.pen).length > 0) {
        h += '<div class="policy-opt-effects" style="margin-top:2px;">' + polityPenLines(opt.pen).join('<br>') + '</div>';
      }
      if (isCurrent) {
        h += '<span class="policy-opt-current">已确立</span>';
      } else if (isLocked) {
        h += '<span class="policy-opt-current" style="opacity:.5">已锁定</span>';
      } else {
        h += '<button class="bld-btn policy-opt-btn" onclick="setPolicyConfirm(\'' + dom + '\',\'' + optId + '\')">选择</button>';
      }
      h += '</div>';
    }
    h += '</div>';
    if (currentOpt) {
      h += '<div class="policy-info">此选择不可逆。</div>';
    }
    h += '</div>';
  }

  // ── 副线状态面板 ──
  if (G.subBranches && (G.subBranches.D || G.subBranches.T)) {
    h += '<div class="polity-section">';
    h += '<div class="polity-section-title">辟途</div>';
    if (G.subBranches.D) h += '<div class="policy-opt policy-opt-active"><span class="policy-opt-name">神启</span><span class="policy-opt-current">已开启</span></div>';
    if (G.subBranches.T) h += '<div class="policy-opt policy-opt-active"><span class="policy-opt-name">通达</span><span class="policy-opt-current">已开启</span></div>';
    h += '</div>';
  }

  h += '</div>';
  return h;
}

function polityEffectLines(e, boost) {
  boost = boost || 1;
  var lines = [];
  var labels = {
    hapM: '满意度', loreM: '学识产出', coinM: '铜钱产出', charmM: '符咒产出',
    caravanProb: '商队来访', bpChance: '图纸携带',
    allM: '全资源产出', policyCostM: '政策费用', buildCostM: '建筑造价',
    gatherM: '手动采集', jobM: '职业产出', bldProdM: '建筑产出',
    baseProdM: '基础资源', scoutM: '斥候加成', expRewardM: '远行奖励',
    spellEffM: '灵术效果', hapCapM: '满意度上限',
    diplomatResM: '外交资源',
  };
  for (var k in e) {
    var v = e[k];
    var label = labels[k] || k;
    var bv = v > 0 ? v * boost : v;
    var display = (bv >= 0 ? '+' : '') + Math.round(bv * 100) + '%';
    var cls = v >= 0 ? 'eff-pos' : 'eff-neg';
    lines.push('<span class="' + cls + '">' + label + ' ' + display + '</span>');
  }
  return lines;
}

// 政策/政体效果 key → 玩家可见标签（统一字典，policyEffectLines 与 polityPenLines 共用）
var EFFECT_LABELS = {
  hapM: '满意度', berryM: '野莓', woodM: '圆木', stoneM: '碎石',
  coinM: '铜钱', loreM: '学识', scrollM: '卷轴', charmM: '符咒',
  caravanProb: '商队来访', bpChance: '图纸携带', baseProdM: '基础资源',
  bldProdM: '建筑产出', trainCostM: '授业费用', trainFlat: '授业加成(扁平)',
  gatherExpM: '采集经验', gatherM: '采集加成', jobM: '全职业产出',
  buildCostM: '建筑造价', tradePriceM: '商品价格', diplomatResM: '外交资源',
  researchCostM: '研究费用', researchSpeedM: '研究速度', expRewardM: '远行奖励',
  spellEffM: '灵术效果', policyCostM: '政策费用', allM: '全产出',
  scoutM: '斥候加成', hapCapM: '满意度上限',
};

function polityPenLines(pen) {
  if (!pen) return [];
  var lines = [];
  for (var k in pen) {
    var v = pen[k];
    if (!v) continue;
    var label = EFFECT_LABELS[k] || k;
    var display;
    if (k === 'trainFlat') {
      display = '+' + v;
    } else {
      display = (v >= 0 ? '+' : '') + Math.round(v * 100) + '%';
    }
    lines.push('<span class="eff-neg">[惩罚] ' + label + ' ' + display + '</span>');
  }
  return lines;
}

function policyEffectLines(e) {
  var lines = [];
  for (var k in e) {
    var v = e[k];
    var label = EFFECT_LABELS[k] || k;
    var display;
    if (k === 'trainFlat') {
      display = '+' + v;
    } else {
      display = (v >= 0 ? '+' : '') + Math.round(v * 100) + '%';
    }
    var cls = v >= 0 ? 'eff-pos' : 'eff-neg';
    // trainCostM/tradePriceM/buildCostM/researchCostM/policyCostM: 负值是好的（降低费用）
    if (k === 'trainCostM' || k === 'tradePriceM' || k === 'buildCostM' || k === 'researchCostM' || k === 'policyCostM') {
      cls = v <= 0 ? 'eff-pos' : 'eff-neg';
    }
    lines.push('<span class="' + cls + '">' + label + ' ' + display + '</span>');
  }
  return lines;
}

function renderPolityGrid(isFirstChoice) {
  var h = '<div class="polity-grid">';
  for (var id in POLITY) {
    var pd = POLITY[id];
    // Filter by tier1
    if (G.tier1 && pd.tier1 !== G.tier1) continue;
    h += '<div class="polity-card">';
    h += '<div class="polity-card-name">' + pd.n + '</div>';
    h += '<div class="polity-card-desc">' + pd.d + '</div>';
    h += '<div class="polity-card-effects">' + polityEffectLines(pd.e, 1).join('<br>') + '</div>';
    if (pd.pen && Object.keys(pd.pen).length > 0) {
      h += '<div class="polity-card-effects" style="margin-top:4px;">' + polityPenLines(pd.pen).join('<br>') + '</div>';
    }
    if (pd.cost && pd.cost.length > 0) {
      var costStr = pd.cost.map(function(c) { return (RD[c.r]?.n || c.r) + ' ' + c.a; }).join(' + ');
      h += '<div class="policy-cost-info">费用：' + costStr + '</div>';
    }
    if (isFirstChoice) {
      h += '<button class="bld-btn" onclick="choosePolityConfirm(\'' + id + '\')">选择</button>';
    }
    h += '</div>';
  }
  h += '</div>';
  return h;
}

// §五 2.8: 离线收益弹窗
function showOfflineGainsModal() {
  var og = G.offlineGains;
  if (!og) return;
  var dur = og.duration;
  var hrs = Math.floor(dur / 3600);
  var mins = Math.floor((dur % 3600) / 60);
  var timeStr = '';
  if (hrs > 0) timeStr += hrs + ' 小时 ';
  if (mins > 0) timeStr += mins + ' 分钟';
  if (!timeStr) timeStr = Math.floor(dur) + ' 秒';

  document.getElementById('modal-title').textContent = '离线收益';
  var h = '<div style="margin-bottom:8px;font-size:12px;color:#888;">你离开了 ' + timeStr + '，以下是期间的资源变化：</div>';
  h += '<div style="max-height:260px;overflow-y:auto;">';
  var hasGains = false;
  for (var k in og.gains) {
    if (!RD[k]) continue;
    var v = og.gains[k];
    var sign = v >= 0 ? '+' : '';
    var color = v >= 0 ? '#4a7' : '#c55';
    var capMark = og.capped.indexOf(k) >= 0 ? ' <span style="color:#c90;font-size:10px;">已满</span>' : '';
    h += '<div style="display:flex;justify-content:space-between;padding:2px 4px;font-size:12px;">';
    h += '<span>' + RD[k].n + capMark + '</span>';
    h += '<span style="color:' + color + ';font-weight:bold;">' + sign + v.toFixed(2) + '</span>';
    h += '</div>';
    hasGains = true;
  }
  if (!hasGains) {
    h += '<div style="font-size:12px;color:#999;text-align:center;padding:12px 0;">离线期间无明显资源变化。</div>';
  }
  h += '</div>';
  if (dur >= 86400) {
    h += '<div style="margin-top:6px;font-size:11px;color:#c90;">离线计算已按 24 小时封顶。</div>';
  }
  document.getElementById('modal-body').innerHTML = h;
  document.getElementById('modal-overlay').style.display = 'flex';
  G.offlineGains = null;
}

// §五 2.6: 旧存档强制选路对话框（branchLore 已完成但未选路）
function showBranchMigrationModal() {
  document.getElementById('modal-title').textContent = '择道而行';
  var h = '<div style="margin-bottom:12px;font-size:12px;color:#555;line-height:1.7;">两条命脉在阴影中显形，一条是炽热的、流动的、渴望被锤打的金属之血，另一条是清冷的、缓慢的、在岩石间脉动的灵能之脉。祭坛上没有羊皮卷，只有一块光滑的黑色卵石，等待第一道刻痕。选择即烙印，而山谷的皮肤，只能承受一种刺青。</div>';
  h += '<div style="margin-bottom:10px;font-size:11px;color:#999;">此选择不可逆，请慎重。</div>';
  var opts = POLICY.branch.opts;
  for (var oid in opts) {
    var o = opts[oid];
    h += '<div style="margin-bottom:8px;padding:8px;border:1px solid #ddd;background:#fafafa;cursor:pointer;" onmouseenter="this.style.borderColor=\'#46739a\'" onmouseleave="this.style.borderColor=\'#ddd\'">';
    h += '<div style="font-weight:bold;color:#333;">' + o.n + '</div>';
    h += '<div style="font-size:11px;color:#888;margin:2px 0;">' + o.d + '</div>';
    h += '<div style="margin-top:6px;"><button class="confirm-yes" onclick="setPolicy(\'branch\',\'' + oid + '\');closeModal()">确认选择</button></div>';
    h += '</div>';
  }
  document.getElementById('modal-body').innerHTML = h;
  document.getElementById('modal-overlay').style.display = 'flex';
  // 禁用关闭按钮，强制选择
  var closeBtn = document.querySelector('#modal-box > div:last-child button');
  if (closeBtn) closeBtn.style.display = 'none';
}

function showPolityChangeModal() {
  // §四 1.3: 政体变更已移除，此函数保留兼容但不再提供变更功能
  document.getElementById('modal-title').textContent = '政体信息';
  var h = '<div style="margin-bottom:8px;font-size:12px;color:#888;">政体已确立，永久不可更改。</div>';
  for (var id in POLITY) {
    var pd = POLITY[id];
    var isCurrent = G.polity === id;
    h += '<div style="margin-bottom:8px;padding:6px 8px;border:1px solid ' + (isCurrent ? '#46739a' : '#ddd') + ';background:' + (isCurrent ? '#f0f4f8' : '#fafafa') + ';">';
    h += '<div style="font-weight:bold;color:#333;">' + pd.n + (isCurrent ? ' <span style="color:#46739a;font-size:11px;">（当前）</span>' : '') + '</div>';
    h += '<div style="font-size:11px;color:#888;margin:2px 0;">' + pd.d + '</div>';
    h += '<div style="font-size:11px;color:#555;">' + polityEffectLines(pd.e, 1).join(' · ') + '</div>';
    if (pd.pen && Object.keys(pd.pen).length > 0) {
      h += '<div style="font-size:11px;color:#c55;">' + polityPenLines(pd.pen).join(' · ') + '</div>';
    }
    h += '</div>';
  }
  document.getElementById('modal-body').innerHTML = h;
  document.getElementById('modal-overlay').style.display = 'flex';
}

// ===== 渲染：日志 =====
function rLog() {
  document.getElementById('log-panel').classList.toggle('collapsed', collapsed.log);
  var toggle = collapsed.log ? '▶︎' : '▼︎';
  var h = '<h3 class="collapse-toggle" onclick="toggleCollapse(\'log\')">'
    + toggle + ' 谷中见闻</h3>';
  if (!collapsed.log) {
    h += '<div id="log-list">' + logs.slice(0, 30).map(function(e) {
      return '<div class="log ' + (e.c || '') + '">' + e.m + '</div>';
    }).join('') + '</div>';
  }
  document.getElementById('log-panel').innerHTML = h;
}

// ===== 渲染：季节 =====
function rSeason() {
  document.getElementById('season-display').textContent =
    SN[G.season] + ' · 第' + G.year + '年 · 第' + (Math.floor(G.day) + 1) + '天';
}

// ===== helper：解锁条件简述（用于习俗 req 列表的 hover tooltip）=====
function formatUqHint(uq) {
  if (!uq) return '无前置';
  var parts = [];
  if (uq.u) for (var k in uq.u) parts.push('研究「' + ((UD[k] && UD[k].n) || k) + '」');
  if (uq.b) for (var k in uq.b) parts.push((BD[k] && BD[k].n || k) + ' ≥ ' + uq.b[k]);
  if (uq.j) for (var k in uq.j) parts.push((JD[k] && JD[k].n || k) + ' ≥ ' + uq.j[k]);
  if (uq.r) for (var k in uq.r) parts.push((RD[k] && RD[k].n || k) + ' ≥ ' + uq.r[k]);
  if (uq.polity) parts.push('治风已选');
  if (uq.custom !== undefined) parts.push('习俗激活 ≥ ' + uq.custom);
  return parts.length ? '前置：' + parts.join('，') : '无前置';
}

// ===== 渲染：自动存档状态 =====
function rSaveStatus() {
  var el = document.getElementById('save-status');
  if (!el || !G.lastSaveTime) return;
  var sec = Math.floor((Date.now() - G.lastSaveTime) / 1000);
  var text;
  if (sec < 5) text = '刚刚已存档';
  else if (sec < 60) text = '上次存档 ' + sec + 's 前';
  else text = '上次存档 ' + Math.floor(sec / 60) + ' 分钟前';
  el.textContent = text;
}

// ===== 全量渲染 =====
var _blockTC = 0;
function rAll() {
  rRes(); rEnergy(); rLeyline(); rPollution(); rUnrest(); rTabs(); rExpStatus();
  // select 交互期间跳过 rTC 重建
  if (_blockTC > 0) { _blockTC--; }
  else { rTC(); }
  rSeason();
  rSaveStatus();
}

// ===== v0.18 §六 3.4 占卜年签 Modal =====
function showDivinationModal() {
  var drawn = G._divDrawn;
  if (!drawn || drawn.length < 3) return;
  document.getElementById('modal-title').textContent = '年初占卜 — 第' + G.year + '年';
  var h = '<div style="line-height:1.7;margin-bottom:10px;color:#555;">三签已出，择其一则全年生效，或跳过不选。</div>';
  for (var i = 0; i < drawn.length; i++) {
    var sign = DIVINATION_POOL[drawn[i]];
    if (!sign) continue;
    h += '<div style="margin-bottom:8px;padding:6px 8px;border:1px solid #ddd;background:#fafafa;">';
    h += '<div style="font-weight:bold;color:#333;margin-bottom:2px;">' + sign.n + '</div>';
    h += '<div style="font-size:11px;color:#888;margin-bottom:2px;font-style:italic;">' + sign.tip + '</div>';
    h += '<div style="font-size:11px;color:#555;margin-bottom:4px;">' + sign.desc + '</div>';
    h += '<button onclick="chooseDivination(' + i + ')" style="padding:3px 14px;cursor:pointer;border:1px solid #bbb;background:#fff;font-size:12px;">选此签</button>';
    h += '</div>';
  }
  h += '<div style="margin-top:6px;text-align:center;">';
  h += '<button onclick="skipDivination()" style="padding:3px 14px;cursor:pointer;border:1px solid #ccc;background:#f5f5f5;font-size:12px;color:#999;">跳过占卜</button>';
  h += '</div>';
  document.getElementById('modal-body').innerHTML = h;
  // 隐藏关闭按钮（必须做出选择）
  var closeBtn = document.querySelector('#modal-box > div:last-child');
  if (closeBtn) closeBtn.style.display = 'none';
  document.getElementById('modal-overlay').style.display = 'flex';
}

// ===== v0.19 §七 4.5 改宗确认弹窗 =====
function showConvertDeityModal() {
  if (G.deityCD > 0) return;
  if (!G.deity) return;
  var curD = DEITY_DATA[G.deity];
  document.getElementById('modal-title').textContent = '改宗 — 选择新主神';
  var h = '<div style="line-height:1.7;margin-bottom:10px;color:#555;">当前主神：<strong>' + curD.n + '</strong>。改宗代价：卷轴 ×80 + 古币 ×30 + 虔诚归零 + 5 季冷却。</div>';
  var scrollOk = (G.res.scroll?.v || 0) >= 80;
  var coinOk = (G.res.ancCoin?.v || 0) >= 30;
  h += '<div style="font-size:12px;margin-bottom:8px;">'
    + '<span' + (scrollOk ? '' : ' class="short"') + '>卷轴: ' + fmt(G.res.scroll?.v || 0) + '/80</span>'
    + ' · <span' + (coinOk ? '' : ' class="short"') + '>古币: ' + fmt(G.res.ancCoin?.v || 0) + '/30</span>'
    + ' · 虔诚: ' + fmt(G.res.piety?.v || 0) + ' → 0'
    + '</div>';
  for (var did in DEITY_DATA) {
    if (did === G.deity) continue;
    var dd = DEITY_DATA[did];
    var canConvert = scrollOk && coinOk;
    h += '<button class="btn' + (canConvert ? '' : ' dis') + '" style="margin:2px 4px;" '
      + 'onclick="if(confirm(\'确定改宗为「' + dd.n + '」？虔诚将归零，教派重置，5 季冷却。\')){convertDeity(\'' + did + '\');closeModal();}">'
      + dd.n + '（' + dd.theme + '）</button>';
  }
  document.getElementById('modal-body').innerHTML = h;
  document.getElementById('modal-overlay').style.display = 'flex';
}

// ===== 抉择事件 Modal =====
function showChoiceModal(idx) {
  var ev = CHOICE_EVENTS[idx];
  if (!ev) return;
  document.getElementById('modal-title').textContent = '远行抉择';
  var h = '<div style="line-height:1.7;margin-bottom:10px;color:#555;">' + ev.t + '</div>';
  for (var i = 0; i < ev.opts.length; i++) {
    var opt = ev.opts[i];
    h += '<div style="margin-bottom:8px;padding:6px 8px;border:1px solid #ddd;background:#fafafa;">';
    h += '<div style="font-weight:bold;color:#333;margin-bottom:2px;">' + opt.label + '</div>';
    h += '<div style="font-size:11px;color:#888;margin-bottom:4px;">' + opt.desc + '</div>';
    h += '<button onclick="applyChoice(' + idx + ',' + i + ')" style="padding:3px 14px;cursor:pointer;border:1px solid #bbb;background:#fff;font-size:12px;">选择</button>';
    h += '</div>';
  }
  document.getElementById('modal-body').innerHTML = h;
  // 隐藏关闭按钮（必须做出选择）
  var closeBtn = document.querySelector('#modal-box > div:last-child');
  if (closeBtn) closeBtn.style.display = 'none';
  document.getElementById('modal-overlay').style.display = 'flex';
}

// ===== 启动 =====
function startGame() {
  // 恢复折叠偏好
  try {
    var saved = JSON.parse(localStorage.getItem('fhCollapsed'));
    if (saved) Object.assign(collapsed, saved);
  } catch(e) {}
  initState();
  load();
  log('欢迎来到狐狸谷！采集资源，建造家园。', 'important');
  // §五 2.6: 存档兼容——branchLore 已完成但未选路时弹出强制选路对话框
  if (G._branchMigrationNeeded) {
    delete G._branchMigrationNeeded;
    showBranchMigrationModal();
  }
  // §五 2.8: 离线收益弹窗（branchMigration 优先级更高，不同时弹）
  else if (G.offlineGains) {
    showOfflineGainsModal();
  }
  rAll();
  window._tickFn = function() { if (window._offlineSimRunning) return; tick(); if (G.tick % 5 === 0) rAll(); };
  window._tickIntervalId = setInterval(window._tickFn, TMS);
  setInterval(save, 30000);

  // Position fixed hover panels — delegate via mouseenter (no bubbling noise)
  var _hpCur = null;
  document.addEventListener('mouseover', function(ev) {
    var wrap = ev.target.closest('.hp-wrap');
    if (wrap === _hpCur) return; // same wrap, skip
    _hpCur = wrap;
    if (!wrap) return;
    var hp = wrap.querySelector('.hp');
    if (!hp) return;
    var rect = wrap.getBoundingClientRect();
    var isRes = wrap.classList.contains('hp-wrap-res');
    if (isRes) {
      hp.style.left = (rect.right + 6) + 'px';
      hp.style.top = rect.top + 'px';
    } else {
      var left = rect.left;
      var top = rect.bottom + 4;
      if (left + 260 > window.innerWidth) left = window.innerWidth - 266;
      // Use actual panel height for bottom clamp
      hp.style.display = 'block';
      var ph = hp.offsetHeight || 160;
      hp.style.display = '';
      if (top + ph > window.innerHeight) top = rect.top - ph - 4;
      hp.style.left = Math.max(0, left) + 'px';
      hp.style.top = Math.max(0, top) + 'px';
    }
  });
  document.addEventListener('mouseout', function(ev) {
    var wrap = ev.target.closest('.hp-wrap');
    if (wrap && wrap === _hpCur && !wrap.contains(ev.relatedTarget)) _hpCur = null;
  });

  // select 交互保护（已改用按钮组，保留mousedown防护备用）
  document.addEventListener('mousedown', function(ev) {
    if (ev.target.tagName === 'SELECT') _blockTC = 5;
  }, true);
}

startGame();
