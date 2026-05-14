#!/usr/bin/env python3
"""第四批研究重命名：神启线 39 个里的 23 个（另 16 个保留原名）。
神圣肃穆/秘仪神秘·简洁——去教科书后缀（术/学/论/法）。综合三方择优。
保留原名 16：祭祀礼法/经典研习/恩典感召/圣铁锻造/圣典编纂/圣战备战/
            圣地夺还/化神仪典/禁典编纂/神墨精炼/墨经/远见/触虚/
            远征神学/秘仪入门/禁典研读"""
import re

RENAMES = {
    # 初悟
    'divineLore': '神启',
    # 教团
    'holyFlameLore': '圣火长明',
    'edictLore': '教令',
    'holyWorkLore': '劳作即祷',
    'judgmentLore': '圣裁',
    'hymnArt': '颂咏',
    'churchArchLore': '神圣营造',
    'templeStudy': '圣堂',
    'pilgrimageLore': '朝圣',
    'crusadeLore': '圣战',
    'relicLore': '圣骸',
    'relicTreatise': '遗名录',
    'doctrineSystem': '教纲',
    'grandEdictLore': '大教令',
    # 秘仪
    'groveLore': '圣林',
    'apotheosisLore': '化神',
    'ascensionLore': '飞升',
    'pureMindLore': '摘念',
    'divineInkArt': '神墨',
    'prophecyArt': '预言',
    'etherealLore': '灵界',
    'omenLore': '卜兆',
    'ascensionTransform': '羽化',
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
