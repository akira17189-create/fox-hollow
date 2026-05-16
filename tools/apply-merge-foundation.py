#!/usr/bin/env python3
"""启蒙习俗治理合并：21→18（减 3，白名单 15 严重限制空间）
  KA1: stoneTools+forestLore → ironWorking（早期增益 3 并 1）
  KA2: ancestry → customsDeep（习俗末端 2 并 1）
"""
import re

MERGES = [
    {'rep':'ironWorking','eaten':['stoneTools','forestLore'],
     'n':'百炼成铁','d':'打石为器，识木为材，再以煤火百炼——基础技艺的集成。',
     'p':"[{ r: 'lore', a: 95 }, { r: 'iron', a: 5 }, { r: 'stone', a: 15 }, { r: 'wood', a: 20 }]",
     'e':"{ berryM: .5, woodM: .8, ironM: .5 }",
     'uq':"{ b: { library: 1, smithy: 1 } }"},
    {'rep':'customsDeep','eaten':['ancestry'],
     'n':'俗成共庆','d':'共聚堂建起，宗脉溯源——山谷在习俗与血脉中聚拢。',
     'p':"[{ r: 'lore', a: 330 }, { r: 'ink', a: 3 }]",
     'e':"{ hapB: .05, charmM: .1 }",
     'uq':"{ u: { engraving: 1, calendar: 1 }, b: { shrine: 1 } }"},
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
    tail_str = f", {tail}" if tail else ""
    new = (f"  {g['rep']}: {{\n"
           f"    n: '{g['n']}', d: '{g['d']}',\n"
           f"    p: {g['p']},\n"
           f"    e: {g['e']},\n"
           f"    uq: {g['uq']}{tail_str},\n"
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
print(f'[done] 启蒙 减 {len(deleted)}')
