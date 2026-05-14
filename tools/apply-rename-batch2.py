#!/usr/bin/env python3
"""第二批研究重命名：工业线 41 个里的 29 个（另 12 个保留原名）。
工业科技风（对标猫国建设者），不中式古雅化。综合三方（我/deepseek/mimo）择优。
保留原名 12：黑脉勘采/齿合精工/轧板工艺/流水线/流体力学/模块工程/自动化/
            粒子学/重晶转化/深层辉脉/合金学/机关自驱"""
import re

RENAMES = {
    # 煤钢
    'steelWork': '煤铁炼钢',
    'concreteTech': '凝石工艺',
    'pollControl': '净污工程',
    # 油火
    'oilExtract': '火油开采',
    'oilStorage': '火油储运',
    'steamPower': '蒸汽动力',
    'combustion': '内燃动力',
    'blueprintLore': '工程制图',
    'transmission': '机械传动',
    'roadwork': '铁路工程',
    'cleanWind': '风力净化',
    'oilGas': '油气采集',
    # 精金
    'calcination': '寒钛煅炼',
    'stargazing': '星图测绘',
    'refining': '合金熔炼',
    'precFab': '精密铸造',
    'heavyBuild': '重型结构',
    'systematics': '系统集成',
    'rotaryKiln': '回转窑炉',
    'telescopeAdv': '镜片精磨',
    # 辉能
    'fission': '寒钛裂变',
    'radiantPower': '辉能转化',
    'proliferation': '链式增殖',
    'superCond': '超导技术',
    'mirrorForge': '辉镜锻造',     # 重名必改（灵修线另有「镜锻」）
    'voidPrinciple': '工程汇编',   # 重名必改（灵修线另有「幽理」）
    'radiation': '辐射防护',
    'powerNet': '辉能并网',
    'shielding': '辐射屏蔽',
}

text = open('js/data.js', encoding='utf-8').read()

def rename(text, eid, newname):
    m = re.search(r'^  ' + re.escape(eid) + r':\s*\{', text, re.MULTILINE)
    if not m:
        return text, False, None
    open_brace = m.end() - 1
    depth = 1
    i = open_brace + 1
    while i < len(text) and depth > 0:
        if text[i] == '{': depth += 1
        elif text[i] == '}': depth -= 1
        i += 1
    close_brace = i - 1
    block = text[open_brace:close_brace]
    mn = re.search(r"n: '([^']*)'", block)
    oldname = mn.group(1) if mn else None
    new_block, cnt = re.subn(r"n: '[^']*'", "n: '" + newname + "'", block, count=1)
    if cnt == 0:
        return text, False, oldname
    return text[:open_brace] + new_block + text[close_brace:], True, oldname

applied = 0
for eid, newname in RENAMES.items():
    text, ok, oldname = rename(text, eid, newname)
    if ok:
        applied += 1
        print(f'  {eid}: {oldname} -> {newname}')
    else:
        print(f'[FAIL] {eid}')

with open('js/data.js', 'w', encoding='utf-8') as f:
    f.write(text)

print(f'[done] 重命名 {applied}/{len(RENAMES)}')
