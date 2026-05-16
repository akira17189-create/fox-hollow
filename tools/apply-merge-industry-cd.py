#!/usr/bin/env python3
"""工业 C+D 合并：25→16（减 9）
工业 C 3 组：
  IC1: fluidMech → rotaryKiln（相邻可合）
  IC2: automation → modularEng（相邻可合）
  IC3: telescopeAdv → alloyScience（互不依赖2并1）
工业 D 5 组：
  ID5: particle → superCond（相邻可合，先做以便ID2/ID3引用）
  ID1: radiation → shielding
  ID2: powerNet → autoMech
  ID3: deepRadiance+proliferation → mirrorForge（3并1，剔除thorium）
  ID4: thoriumConv → voidPrinciple
"""
import re

MERGES = [
    # C
    {'rep':'rotaryKiln','eaten':['fluidMech'],
     'n':'回转窑炉','d':'窑炉连续进料——液体在管中亦有速度、压力与脾气。',
     'p':"[{ r: 'lore', a: 2500 }, { r: 'titan', a: 35 }, { r: 'oil', a: 45 }]",
     'e':"{}",
     'uq':"{ u: { calcination: 1 }, b: { calcFurnace: 1 } }"},
    {'rep':'modularEng','eaten':['automation'],
     'n':'模块工程','d':'大机器拆成可替换的小模块——机器自己运转，狐狸只管看。',
     'p':"[{ r: 'lore', a: 2700 }, { r: 'alloy', a: 18 }, { r: 'draft', a: 16 }, { r: 'titanPart', a: 5 }]",
     'e':"{}",
     'uq':"{ u: { assemblyLine: 1, precFab: 1 }, b: { factory: 1 } }"},
    {'rep':'alloyScience','eaten':['telescopeAdv'],
     'n':'合金学','d':'金属的脾性与镜片的耐心——皆是材料学的延伸。',
     'p':"[{ r: 'lore', a: 2000 }, { r: 'alloy', a: 8 }, { r: 'titan', a: 18 }]",
     'e':"{}",
     'uq':"{ u: { refining: 1, stargazing: 1 }, b: { refinery: 1, observatory: 1 } }"},
    # D（ID5 先，让其他引用 superCond/particle 时已重定向）
    {'rep':'superCond','eaten':['particle'],
     'n':'超导技术','d':'看清辉光的每一颗微粒，冷到极致，电不再损耗。',
     'p':"[{ r: 'lore', a: 3400 }, { r: 'alloy', a: 23 }, { r: 'uranium', a: 25 }]",
     'e':"{}",
     'uq':"{ u: { fission: 1 } }"},
    {'rep':'shielding','eaten':['radiation'],
     'n':'辐射屏蔽','d':'用混凝与钛层层包裹，先学会看见再学会防——辉光会渗。',
     'p':"[{ r: 'lore', a: 3000 }, { r: 'uranium', a: 40 }, { r: 'pillar', a: 5 }, { r: 'alloy', a: 10 }]",
     'e':"{}",
     'uq':"{ u: { radiantPower: 1 } }"},
    {'rep':'autoMech','eaten':['powerNet'],
     'n':'机关自驱','d':'机器自己上料出货——每座熔炉串起来，一处过载全网分担。',
     'p':"[{ r: 'lore', a: 4100 }, { r: 'alloy', a: 27 }, { r: 'uranium', a: 35 }, { r: 'draft', a: 10 }, { r: 'pillar', a: 5 }]",
     'e':"{}",
     'uq':"{ u: { modularEng: 1, radiantPower: 1, superCond: 1 }, b: { furnace: 1 } }"},
    {'rep':'mirrorForge','eaten':['deepRadiance','proliferation'],
     'n':'辉镜锻造','d':'合金磨成镜，照见辉光形状——一颗引出第二颗，深层辉脉成片地长。',
     'p':"[{ r: 'lore', a: 5400 }, { r: 'alloy', a: 10 }, { r: 'uranium', a: 63 }, { r: 'draft', a: 10 }]",
     'e':"{ mirrorAlloyU: 1 }",
     'uq':"{ u: { refining: 1, radiantPower: 1 }, b: { accelerator: 1, furnace: 1 } }"},
    {'rep':'voidPrinciple','eaten':['thoriumConv'],
     'n':'工程汇编','d':'图纸压成一本书，辉石余烬再熔一次——更稳更密的真。',
     'p':"[{ r: 'lore', a: 3500 }, { r: 'outline', a: 5 }, { r: 'uranium', a: 45 }]",
     'e':"{ codexU: 1, thoriumU: 1 }",
     'uq':"{ u: { systematics: 1, radiantPower: 1 } }"},
]

text = open('js/data.js', encoding='utf-8').read()
def find_entry(text, eid):
    m = re.search(r'^  ' + re.escape(eid) + r':\s*\{', text, re.MULTILINE)
    if not m: return None, None
    s = m.start(); i = m.end()-1; depth=1; j=i+1
    while j < len(text) and depth>0:
        if text[j]=='{': depth+=1
        elif text[j]=='}': depth-=1
        j+=1
    if j<len(text) and text[j]==',': j+=1
    if j<len(text) and text[j]=='\n': j+=1
    return s, j
def get_tail(block):
    parts = []
    for k in ['sb', 'br']:
        m = re.search(r'\b' + k + r':\s*[\x27"]([^\x27"]*)[\x27"]', block)
        if m: parts.append(f"{k}: '{m.group(1)}'")
    m = re.search(r'\bphase:\s*(\d+)', block)
    if m: parts.append(f"phase: {m.group(1)}")
    return ', '.join(parts)

for g in MERGES:
    s,e = find_entry(text, g['rep'])
    orig = text[s:e]; tail = get_tail(orig)
    new = (f"  {g['rep']}: {{\n"
           f"    n: '{g['n']}', d: '{g['d']}',\n"
           f"    p: {g['p']},\n"
           f"    e: {g['e']},\n"
           f"    uq: {g['uq']}, {tail},\n"
           f"  }},\n")
    text = text[:s] + new + text[e:]
    print(f'  改写 {g["rep"]}')

deleted = []
for g in MERGES:
    for eid in g['eaten']:
        s,e = find_entry(text, eid)
        if s is None: print(f'[FAIL] {eid}'); continue
        text = text[:s] + text[e:]
        deleted.append(eid)
        print(f'  删除 {eid}')

for g in MERGES:
    for eid in g['eaten']:
        old = 'u: { ' + eid + ': 1 }'
        new = 'u: { ' + g['rep'] + ': 1 }'
        cnt = text.count(old)
        if cnt>0:
            text = text.replace(old, new)
            print(f'  重定向 {eid}→{g["rep"]}: {cnt}')
        def repl(m, eid=eid, rep=g['rep']):
            inner = m.group(1)
            ni = re.sub(r'\b'+re.escape(eid)+r':\s*\d+', rep+': 1', inner)
            return 'u: {'+ni+'}'
        text2,n = re.subn(r'u:\s*\{([^}]*)\}', repl, text)
        if text2 != text and n:
            text = text2
            print(f'  多键 {eid}→{g["rep"]}')

open('js/data.js','w',encoding='utf-8').write(text)
ujs = open('js/ui.js', encoding='utf-8').read()
for eid in deleted:
    ujs = re.sub(r"'" + re.escape(eid) + r"',?", '', ujs)
ujs = re.sub(r",,+", ",", ujs)
ujs = re.sub(r",\s*\]", "]", ujs)
ujs = re.sub(r"\[\s*,", "[", ujs)
open('js/ui.js','w',encoding='utf-8').write(ujs)
print(f'[done] 工业 C+D 减 {len(deleted)}')
