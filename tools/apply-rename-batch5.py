#!/usr/bin/env python3
"""第五批（末批）研究重命名：通达线 8 个里的 2 个（另 6 个保留原名）。
外交礼仪——去教科书后缀。三方高度一致。
保留原名 6：使节礼法/信物制度/结邦之礼/异珍鉴赏/远客之道/深盟序言"""
import re

RENAMES = {
    'reputeLore': '声誉之道',   # 声望学 → 去"学"；不叫"声望"（资源已占用）
    'allianceLore': '会盟之礼',  # 会盟论 → 去"论"；与"结邦之礼"成体系
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
