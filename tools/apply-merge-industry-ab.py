#!/usr/bin/env python3
"""工业 A+B 合并：16→10（减 6）
  IA1: forging+concreteTech+pollControl+fineCraft → fineCraft（A 阶段叶子 4 并 1）
  IB1: oilGas → oilStorage（剔除 draft from p：oilStorage 不依赖 combustion）
  IB2: roadwork → transmission（相邻可合）
  IB4: blueprintLore → combustion（相邻可合）
"""
import re

MERGES = [
    {'rep':'fineCraft','eaten':['forging','concreteTech','pollControl'],
     'n':'齿合精工','d':'精密咬合的齿轮、可建造的钢板、坚如磐石的混凝——一切机械与营造的起点。',
     'p':"[{ r: 'lore', a: 1750 }, { r: 'steel', a: 13 }, { r: 'coal', a: 20 }, { r: 'brick', a: 30 }, { r: 'scroll', a: 20 }]",
     'e':"{ gearU: 1, plateU: 1, concreteU: 1 }",
     'uq':"{ u: { steelWork: 1, deepMining: 1 }, b: { blastFurnace: 1 } }"},
    {'rep':'oilStorage','eaten':['oilGas'],
     'n':'火油储运','d':'易燃易挥发的火油，连同井下伴生的可燃气——皆需驯服。',
     'p':"[{ r: 'lore', a: 1530 }, { r: 'plate', a: 10 }, { r: 'oil', a: 22 }]",
     'e':"{ barrelU: 1 }",
     'uq':"{ u: { oilExtract: 1 }, b: { oilWell: 1 } }"},
    {'rep':'transmission','eaten':['roadwork'],
     'n':'机械传动','d':'齿轮咬齿轮，钢轨铺到看不见的远方——力量从一端传到另一端。',
     'p':"[{ r: 'lore', a: 1800 }, { r: 'gear', a: 18 }, { r: 'steel', a: 25 }, { r: 'concrete', a: 12 }, { r: 'coin', a: 80 }]",
     'e':"{}",
     'uq':"{ u: { fineCraft: 1 }, b: { steamEngine: 1 } }"},
    {'rep':'combustion','eaten':['blueprintLore'],
     'n':'内燃动力','d':'火油在气缸里爆燃推动活塞——画好图再动手，工程的起点。',
     'p':"[{ r: 'lore', a: 2150 }, { r: 'steel', a: 25 }, { r: 'oil', a: 20 }, { r: 'scroll', a: 50 }, { r: 'gear', a: 5 }]",
     'e':"{ draftU: 1 }",
     'uq':"{ u: { steamPower: 1 } }"},
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
print(f'[done] 工业 A+B 减 {len(deleted)}')
