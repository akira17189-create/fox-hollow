#!/usr/bin/env python3
"""第一批重命名修正：用户追加保留 5 个文学意象名，改回原名。
第一批最终结果 = 保留原名 11 个 + 重命名 10 个。"""
import re

# 这 5 个第一轮被我改了，用户追加要求保留原名 → 改回
REVERT = {
    'forestLore': '林间密语',
    'foxFolklore': '狐灵传说',
    'spiritShelter': '灵狐庇护',
    'ancestorEye': '先祖之眼',
    'calendar': '月令新酿',
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
for eid, newname in REVERT.items():
    text, ok, oldname = rename(text, eid, newname)
    if ok:
        applied += 1
        print(f'  {eid}: {oldname} -> {newname}')
    else:
        print(f'[FAIL] {eid}')

with open('js/data.js', 'w', encoding='utf-8') as f:
    f.write(text)

print(f'[done] 改回 {applied}/{len(REVERT)}')
