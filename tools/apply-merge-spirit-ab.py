#!/usr/bin/env python3
"""灵修 A+B 阶段合并：14→9（减 5）
3 个合并组（每组验证互不依赖+无 price/uq 死锁+无悬空）：
  LA1: silkWeave+pureMind+beadCraft → beadCraft
  LB1: specAnalysis+leyExpand → specAnalysis
  LB2: shapeBasic+oracleArt+calmMind → oracleArt
"""
import re

# 合并组：rep=代表id, eaten=被吃id列表, new_p/e/uq=合并后字段
MERGES = [
    {
        'rep': 'beadCraft', 'eaten': ['silkWeave', 'pureMind'],
        'n': '念珠', 'd': '把灵能凝成珠子，一颗装一个念头。',
        'p': "[{ r: 'lore', a: 830 }, { r: 'spirit', a: 35 }, { r: 'charm', a: 50 }]",
        'e': "{ beadU: 1 }",
        'uq': "{ u: { leylineLore: 1 } }",
        'tail': ", sb: 'M'",  # 灵修线无 br，但实际看原文
    },
    {
        'rep': 'specAnalysis', 'eaten': ['leyExpand'],
        'n': '谱析', 'd': '将共振子的振动分解为可见的谱——谱石诞生。',
        'p': "[{ r: 'lore', a: 950 }, { r: 'resonance', a: 13 }, { r: 'fateSilk', a: 15 }, { r: 'sigil', a: 10 }]",
        'e': "{ spectrumU: 1 }",
        'uq': "{ u: { resonArt: 1 }, b: { resonTower: 1 } }",
        'tail': ", sb: 'M'",
    },
    {
        'rep': 'oracleArt', 'eaten': ['shapeBasic', 'calmMind'],
        'n': '通灵', 'd': '悟片是灵脉留下的碎语——学会收集与解读。',
        'p': "[{ r: 'lore', a: 1350 }, { r: 'insight', a: 5 }, { r: 'fateSilk', a: 20 }, { r: 'resonance', a: 10 }, { r: 'spectrum', a: 3 }, { r: 'charm', a: 60 }, { r: 'spirit', a: 30 }]",
        'e': "{}",
        'uq': "{ u: { sageWay: 1, elixirBrew: 1, beadCraft: 1 }, b: { elixirBrewery: 1, quietRoom: 1 } }",
        'tail': ", sb: 'M'",
    },
]

text = open('js/data.js', encoding='utf-8').read()

def find_entry(text, eid):
    """返回 (start, end) 的条目块（含开头 '  eid: {' 到 '  },\\n' 末尾）"""
    m = re.search(r'^  ' + re.escape(eid) + r':\s*\{', text, re.MULTILINE)
    if not m:
        return None, None
    start = m.start()
    i = m.end() - 1; depth = 1; j = i + 1
    while j < len(text) and depth > 0:
        if text[j] == '{': depth += 1
        elif text[j] == '}': depth -= 1
        j += 1
    # 包括末尾 ',\n'
    if j < len(text) and text[j] == ',':
        j += 1
    if j < len(text) and text[j] == '\n':
        j += 1
    return start, j

def get_tail(block):
    """从原条目末尾提取 sb/br/phase 等后缀"""
    m = re.search(r'\bsb:\s*[\x27"]([^\x27"]*)[\x27"]', block)
    sb = m.group(1) if m else None
    m = re.search(r'\bbr:\s*[\x27"]([^\x27"]*)[\x27"]', block)
    br = m.group(1) if m else None
    m = re.search(r'\bphase:\s*(\d+)', block)
    phase = m.group(1) if m else None
    parts = []
    if sb: parts.append(f"sb: '{sb}'")
    if br: parts.append(f"br: '{br}'")
    if phase: parts.append(f"phase: {phase}")
    return ', '.join(parts)

# 1. 改写代表 id 条目
for g in MERGES:
    rep = g['rep']
    s, e = find_entry(text, rep)
    if s is None:
        print(f'[FAIL] 找不到代表 id {rep}')
        continue
    orig = text[s:e]
    tail = get_tail(orig)
    new_block = (f"  {rep}: {{\n"
                 f"    n: '{g['n']}', d: '{g['d']}',\n"
                 f"    p: {g['p']},\n"
                 f"    e: {g['e']},\n"
                 f"    uq: {g['uq']}, {tail},\n"
                 f"  }},\n")
    text = text[:s] + new_block + text[e:]
    print(f'  改写代表 {rep} ({len(orig)}→{len(new_block)} 字节)')

# 2. 删除消失 id 条目
deleted = []
for g in MERGES:
    for eid in g['eaten']:
        s, e = find_entry(text, eid)
        if s is None:
            print(f'[FAIL] 找不到消失 id {eid}')
            continue
        text = text[:s] + text[e:]
        deleted.append(eid)
        print(f'  删除消失 {eid}')

# 3. 全局重定向：u: { 消失id: 1 } → u: { 代表id: 1 }
#    （u: { x: 1 } 形式，单引用）
for g in MERGES:
    for eid in g['eaten']:
        old = 'u: { ' + eid + ': 1 }'
        new = 'u: { ' + g['rep'] + ': 1 }'
        cnt = text.count(old)
        if cnt > 0:
            text = text.replace(old, new)
            print(f'  重定向 {eid}→{g["rep"]}: {cnt} 处（u:单引用）')

# 4. 多引用形式：u: { ..., 消失id: 1, ... } —— 用正则
for g in MERGES:
    for eid in g['eaten']:
        # 在 u: { ... } 内部把 eid: 1 替换成 rep: 1（如果还存在）
        def repl(m):
            inner = m.group(1)
            new_inner = re.sub(r'\b' + re.escape(eid) + r':\s*\d+', g['rep'] + ': 1', inner)
            return 'u: {' + new_inner + '}'
        text2, n = re.subn(r'u:\s*\{([^}]*)\}', repl, text)
        if text2 != text:
            text = text2
            print(f'  多引用重定向 {eid}→{g["rep"]}（u: 多键）')

with open('js/data.js', 'w', encoding='utf-8') as f:
    f.write(text)

print(f'\n[done] 改写 {len(MERGES)} 代表, 删除 {len(deleted)} 消失')

# 改 ui.js RESEARCH_GROUPS 灵修组
ujs = open('js/ui.js', encoding='utf-8').read()
for eid in deleted:
    # 在 '灵修' 组的 ids 数组里删除 'eid',
    ujs = re.sub(r"'" + re.escape(eid) + r"',?", '', ujs)
    # 清理可能产生的逗号问题：',,' → ',', ",]" → "]"
ujs = re.sub(r",,+", ",", ujs)
ujs = re.sub(r",\s*\]", "]", ujs)
ujs = re.sub(r"\[\s*,", "[", ujs)
with open('js/ui.js', 'w', encoding='utf-8') as f:
    f.write(ujs)
print(f'[done] ui.js RESEARCH_GROUPS 已同步删 {len(deleted)} id')
