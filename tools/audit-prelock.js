#!/usr/bin/env node
/**
 * audit-prelock.js — branchLore 前解锁链审计工具
 *
 * 目的：找出"branchLore 完成之前"玩家可触达范围内的解锁链问题：
 *   1. 断链：A 依赖 B，B 不可解锁（dead path）
 *   2. 死循环：A 需要 B、B 需要 A
 *   3. 跳跃：研究 X 完成立刻解锁 N 个新东西（≥5 视为信息过载）
 *   4. 资源 ID 引用错误：uq 引用了不存在的 ID
 *   5. 重复解锁：同一建筑被多个研究同时给 ur
 *
 * 使用：node tools/audit-prelock.js [--verbose]
 */

const fs = require('fs');
const vm = require('vm');
const path = require('path');

const verbose = process.argv.includes('--verbose');

// ===== 加载 data.js =====
const dataPath = path.join(__dirname, '..', 'js', 'data.js');
let dataSrc = fs.readFileSync(dataPath, 'utf8');
// vm.runInContext 不会把 const/let 声明写入 sandbox（lexical 作用域），
// 改成 var 让它们成为 sandbox 全局变量
dataSrc = dataSrc.replace(/^const /gm, 'var ');
const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(dataSrc, sandbox);

const { RD, BD, JD, UD, CD, UPGD, POLITY, POLICY, TIER, CUSTD } = sandbox;

// ===== 计算 pre-branch 集合 =====
// "pre-branch" 定义：玩家在 branchLore 完成之前可见/可解锁的项
// 排除：标 br: 'I'/'M'（主线分叉后的项）/ sb: 'D'/'T'（副线项）/ phase >= 2 的项 / 依赖 branchLore 的项
function isPreBranch(item) {
  if (!item) return false;
  if (item.br === 'I' || item.br === 'M') return false;
  if (item.sb === 'D' || item.sb === 'T') return false;
  const uq = item.uq || {};
  if (uq.phase !== undefined && uq.phase >= 2) return false;
  if (uq.mainLine) return false;
  if (uq.u && uq.u.branchLore) return false;
  if (uq.sb) return false;
  return true;
}

const preUD = Object.entries(UD).filter(([id, u]) => isPreBranch(u));
const preBD = Object.entries(BD).filter(([id, b]) => isPreBranch(b));
const preJD = Object.entries(JD).filter(([id, j]) => isPreBranch(j));
const preCD = Object.entries(CD).filter(([id, c]) => isPreBranch(c));

console.log('=== pre-branch 集合规模 ===');
console.log('  研究 UD:', preUD.length, '/', Object.keys(UD).length);
console.log('  建筑 BD:', preBD.length, '/', Object.keys(BD).length);
console.log('  职业 JD:', preJD.length, '/', Object.keys(JD).length);
console.log('  配方 CD:', preCD.length, '/', Object.keys(CD).length);
console.log();

// ===== Issue 收集 =====
const issues = [];
function add(level, kind, target, msg) {
  issues.push({ level, kind, target, msg });
}

// ===== 检查 1: 资源 ID 引用错误 =====
// 检查 p (price) / e / cost 中的 r 字段是否引用 RD 中存在的资源
function checkResRefs(id, item, kind) {
  if (item.p) {
    for (const p of item.p) {
      if (p.r && !RD[p.r]) add('🔴', kind, id, `p.r='${p.r}' 不在 RD 中`);
    }
  }
  if (item.cost) {
    if (Array.isArray(item.cost)) {
      for (const c of item.cost) {
        if (c.r && !RD[c.r]) add('🔴', kind, id, `cost.r='${c.r}' 不在 RD 中`);
      }
    } else if (typeof item.cost === 'object') {
      for (const k in item.cost) {
        if (!RD[k]) add('🔴', kind, id, `cost key='${k}' 不在 RD 中`);
      }
    }
  }
  // 配方用 inp/out 数组 [{r, a}]
  if (Array.isArray(item.inp)) {
    for (const p of item.inp) {
      if (p.r && !RD[p.r]) add('🔴', kind, id, `配方 inp.r='${p.r}' 不在 RD 中`);
    }
  }
  if (Array.isArray(item.out)) {
    for (const p of item.out) {
      if (p.r && !RD[p.r]) add('🔴', kind, id, `配方 out.r='${p.r}' 不在 RD 中`);
    }
  }
}

// uq 引用检查
function checkUq(id, item, kind) {
  const uq = item.uq;
  if (!uq) return;
  if (uq.u) for (const k in uq.u) {
    if (!UD[k]) add('🔴', kind, id, `uq.u 引用了不存在的研究 '${k}'`);
  }
  if (uq.b) for (const k in uq.b) {
    if (!BD[k]) add('🔴', kind, id, `uq.b 引用了不存在的建筑 '${k}'`);
  }
  if (uq.j) for (const k in uq.j) {
    if (!JD[k]) add('🔴', kind, id, `uq.j 引用了不存在的职业 '${k}'`);
  }
  if (uq.r) for (const k in uq.r) {
    if (!RD[k]) add('🔴', kind, id, `uq.r 引用了不存在的资源 '${k}'`);
  }
}

for (const [id, u] of preUD) { checkResRefs(id, u, 'UD'); checkUq(id, u, 'UD'); }
for (const [id, b] of preBD) { checkResRefs(id, b, 'BD'); checkUq(id, b, 'BD'); }
for (const [id, j] of preJD) { checkResRefs(id, j, 'JD'); checkUq(id, j, 'JD'); }
for (const [id, c] of preCD) { checkResRefs(id, c, 'CD'); checkUq(id, c, 'CD'); }

// ===== 检查 2: 重复解锁（同一建筑被多个研究 ur）=====
// UD 字段名为 ur？或者 e？让我看下结构
const buildingUnlockSources = {}; // bldId -> [unlocking research ids]
for (const [uid, u] of preUD) {
  const e = u.e || {};
  // 通过 e 字段中的 *U 标记（如 coalU:1 表示解锁煤资源；这是 RD 解锁，不是 BD）
  // 建筑解锁：uq 的 b 反向映射，或 e 字段含 unlock 字段
  if (e.unlock && Array.isArray(e.unlock)) {
    for (const bldId of e.unlock) {
      if (!buildingUnlockSources[bldId]) buildingUnlockSources[bldId] = [];
      buildingUnlockSources[bldId].push(uid);
    }
  }
}
// 反向：BD.uq.u 中提到的研究若有 N 个研究指向同一建筑解锁，列出
const bldByReq = {}; // bldId -> [研究 IDs that gate it via uq.u]
for (const [bid, b] of preBD) {
  const uq = b.uq;
  if (!uq) continue;
  const us = uq.u ? Object.keys(uq.u) : [];
  if (us.length > 1) {
    add('🔵', 'BD', bid, `多研究解锁: uq.u = [${us.join(', ')}]（合理但需检查是否设计意图）`);
  }
}

// ===== 检查 3: 死循环（uq 中相互引用）=====
// 仅检查 UD 之间
function detectCycle() {
  const visited = new Set();
  const stack = new Set();
  function dfs(id, pathArr) {
    if (stack.has(id)) {
      add('🔴', 'UD', id, `检测到循环依赖: ${pathArr.join(' → ')} → ${id}`);
      return;
    }
    if (visited.has(id)) return;
    visited.add(id);
    stack.add(id);
    const u = UD[id];
    if (u && u.uq && u.uq.u) {
      for (const dep in u.uq.u) {
        dfs(dep, [...pathArr, id]);
      }
    }
    stack.delete(id);
  }
  for (const [uid] of preUD) dfs(uid, []);
}
detectCycle();

// ===== 检查 4: 断链 — 找无法被任何路径解锁的项 =====
// "可解锁": uq 全部依赖项都在 pre-branch 集合中且自己也在 pre-branch
// 这里比较复杂，先做静态依赖检查：uq.u 中的研究 ID 必须存在
// 已在 checkUq 中覆盖

// 断链特殊检查：依赖了 sb:'D'/'T' 副线项的 pre-branch 项
for (const [id, item] of [...preUD, ...preBD, ...preJD, ...preCD]) {
  const uq = item.uq;
  if (!uq) continue;
  if (uq.u) for (const k in uq.u) {
    const dep = UD[k];
    if (!dep) continue;
    if (dep.sb === 'D' || dep.sb === 'T') {
      add('🔴', _kind(item), id, `pre-branch 项依赖了 sb='${dep.sb}' 副线研究 '${k}' (副线尚未激活时不可达)`);
    }
    if (dep.br === 'I' || dep.br === 'M') {
      add('🔴', _kind(item), id, `pre-branch 项依赖了 br='${dep.br}' 主线研究 '${k}' (主线未选时不可达)`);
    }
  }
}

function _kind(item) {
  if (UD[item.id || ''] === item || (item.p && item.e !== undefined)) return 'UD';
  return '?';
}

// ===== 检查 5: 跳跃感（一研究完成解锁多个新内容）=====
// 反向索引：每个 UD 完成 → 解锁了多少 BD/JD/UD/CD？
const fanout = {}; // uid -> { bd: [], jd: [], ud: [], cd: [] }
function tally(srcUid, kind, id) {
  if (!fanout[srcUid]) fanout[srcUid] = { bd: [], jd: [], ud: [], cd: [] };
  fanout[srcUid][kind].push(id);
}
function walk(arr, kind) {
  for (const [id, item] of arr) {
    const uq = item.uq;
    if (!uq || !uq.u) continue;
    // 把每个 uq.u 引用都算到对应源 UD 的扇出（多前置时被多次记账）
    for (const src of Object.keys(uq.u)) tally(src, kind, id);
  }
}
walk(preBD, 'bd');
walk(preJD, 'jd');
walk(preUD, 'ud');
walk(preCD, 'cd');

for (const [src, fo] of Object.entries(fanout)) {
  const total = fo.bd.length + fo.jd.length + fo.ud.length + fo.cd.length;
  if (total >= 5) {
    add('🟡', 'UD', src, `完成后扇出 ${total} 个 (BD ${fo.bd.length}, JD ${fo.jd.length}, UD ${fo.ud.length}, CD ${fo.cd.length})`);
  }
}

// ===== 检查 8: 叶节点 UD（没人依赖的 pre-branch 研究）=====
// 区分"终点"（有意结束链）与"孤儿"（路径设计上漏了出口）
const referenced = new Set();
for (const arr of [preBD, preJD, preUD, preCD]) {
  for (const [, item] of arr) {
    if (item.uq && item.uq.u) {
      for (const k in item.uq.u) referenced.add(k);
    }
  }
}
for (const [uid, u] of preUD) {
  if (referenced.has(uid)) continue;
  // 排除显式入口（branchLore — 它是 phase 推进点，不需后续 pre-branch）
  if (uid === 'branchLore') continue;
  add('🔵', 'UD', uid, `叶节点：完成后 pre-branch 范围内无后续解锁（${u.n}）`);
}

// ===== 检查 8b: 跨类型循环（UD↔BD 交叉依赖）=====
function detectCrossCycle() {
  const visited = new Set();
  const stack = [];
  function dfs(kind, id) {
    const key = kind + ':' + id;
    if (stack.indexOf(key) >= 0) {
      add('🔴', kind, id, `跨类型循环: ${stack.join(' → ')} → ${key}`);
      return;
    }
    if (visited.has(key)) return;
    visited.add(key);
    stack.push(key);
    let item;
    if (kind === 'UD') item = UD[id];
    else if (kind === 'BD') item = BD[id];
    if (item && item.uq) {
      if (item.uq.u) for (const k in item.uq.u) dfs('UD', k);
      if (item.uq.b) for (const k in item.uq.b) dfs('BD', k);
    }
    stack.pop();
  }
  for (const [uid] of preUD) dfs('UD', uid);
  for (const [bid] of preBD) dfs('BD', bid);
}
detectCrossCycle();

// ===== 检查 9: 入口研究（无 uq.u）— 玩家初始可见的研究数量 =====
const roots = preUD.filter(([, u]) => !u.uq || !u.uq.u || Object.keys(u.uq.u).length === 0);
console.log(`=== 入口研究 ${roots.length} 个 (depth 0): ${roots.map(([id]) => id).join(', ')}`);
console.log();
if (roots.length >= 6) {
  add('🟡', 'UD', '(根集)', `入口研究 ${roots.length} 个 (${roots.map(([id]) => id).join(', ')}) — 一开始可见过多研究易让玩家选择困惑`);
}

// ===== 检查 6: 解锁过晚/过早（粗略：UD 链深度）=====
// 计算每个 UD 的"链深度"（沿 uq.u 反推到根）
const depth = {};
function computeDepth(id, visiting = new Set()) {
  if (depth[id] !== undefined) return depth[id];
  if (visiting.has(id)) return 0; // 防循环
  visiting.add(id);
  const u = UD[id];
  if (!u || !u.uq || !u.uq.u) { depth[id] = 0; return 0; }
  let max = 0;
  for (const k in u.uq.u) {
    const d = computeDepth(k, visiting) + 1;
    if (d > max) max = d;
  }
  depth[id] = max;
  return max;
}
for (const [uid] of preUD) computeDepth(uid);

// ===== 检查 7: 配方 sb / br 但其入口研究是 pre-branch =====
// （副线/主线配方可能错被标 pre-branch — 反向查）
// 已被 isPreBranch 的 sb/br 排除处理

// ===== 输出依赖图（verbose）=====
if (verbose) {
  console.log('=== UD 依赖深度（pre-branch）===');
  preUD.sort((a, b) => (depth[a[0]] || 0) - (depth[b[0]] || 0));
  for (const [id, u] of preUD) {
    const us = u.uq && u.uq.u ? Object.keys(u.uq.u) : [];
    console.log(`  [${depth[id] || 0}] ${id} (${u.n}) ← [${us.join(', ')}]`);
  }
  console.log();
  console.log('=== UD 完成后扇出（pre-branch）===');
  for (const [src, fo] of Object.entries(fanout)) {
    const total = fo.bd.length + fo.jd.length + fo.ud.length + fo.cd.length;
    if (total === 0) continue;
    const u = UD[src];
    console.log(`  ${src} (${u ? u.n : '?'}) → ${total} 项 = BD:${fo.bd.length} JD:${fo.jd.length} UD:${fo.ud.length} CD:${fo.cd.length}`);
    if (fo.bd.length) console.log(`     BD: ${fo.bd.join(', ')}`);
    if (fo.jd.length) console.log(`     JD: ${fo.jd.join(', ')}`);
    if (fo.ud.length) console.log(`     UD: ${fo.ud.join(', ')}`);
    if (fo.cd.length) console.log(`     CD: ${fo.cd.join(', ')}`);
  }
  console.log();
}

// ===== 输出问题列表 =====
console.log('=== 问题列表 ===');
issues.sort((a, b) => {
  const order = { '🔴': 0, '🟡': 1, '🔵': 2 };
  return order[a.level] - order[b.level];
});
for (const i of issues) {
  console.log(`${i.level} [${i.kind} ${i.target}] ${i.msg}`);
}
console.log();
console.log(`合计 ${issues.length} 条 (🔴 ${issues.filter(i=>i.level==='🔴').length} / 🟡 ${issues.filter(i=>i.level==='🟡').length} / 🔵 ${issues.filter(i=>i.level==='🔵').length})`);
